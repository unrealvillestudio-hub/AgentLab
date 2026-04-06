// api/migrate.js
// Backfill proactivo: convierte chat:${tokenKey} existentes a raw_log:${tokenKey}
// Llamar UNA VEZ con POST { secret, tokens: [{tokenKey, clientName, role}] }
// Después del primer uso de cada usuario en el agente, el backfill ocurre
// automáticamente en chat.js — este endpoint es para forzarlo sin esperar.

const { kv } = require('@vercel/kv')

const EXPORT_SECRET    = process.env.EXPORT_SECRET || ''
const LOG_REGISTRY_KEY = 'log_registry:SOCIAL-MEDIA-AGENT'
const KV_TTL_SECONDS   = 60 * 60 * 24 * 90

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { secret, tokens } = req.body || {}

  if (EXPORT_SECRET && secret !== EXPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: 'tokens[] requerido. Formato: [{tokenKey, clientName, role}]' })
  }

  const results = []

  for (const { tokenKey, clientName, role } of tokens) {
    if (!tokenKey || !clientName) {
      results.push({ tokenKey, status: 'skipped', reason: 'tokenKey o clientName faltante' })
      continue
    }

    const key = tokenKey.toUpperCase()

    try {
      // Si ya tiene raw_log, no sobreescribir
      const existingRaw = await kv.get(`raw_log:${key}`)
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw)
        results.push({ tokenKey: key, clientName, status: 'already_exists', exchanges: parsed.length })
        continue
      }

      // Leer historial de chat
      const chatRaw = await kv.get(`chat:${key}`)
      if (!chatRaw) {
        results.push({ tokenKey: key, clientName, status: 'no_history' })
        continue
      }

      const messages = JSON.parse(chatRaw)
      const entries = []
      const backfillTs = new Date().toISOString()

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        if (msg._is_summary) continue
        if (msg.role === 'user') {
          const next = messages[i + 1]
          const assistantMsg = (next && next.role === 'assistant' && !next._is_summary)
            ? next.content
            : '[respuesta no disponible en historial comprimido]'
          entries.push({
            ts:          backfillTs,
            clientName,
            role:        role || 'ops',
            userMsg:     msg.content,
            assistantMsg,
            _backfilled: true
          })
          if (next && next.role === 'assistant') i++
        }
      }

      if (entries.length === 0) {
        results.push({ tokenKey: key, clientName, status: 'empty_history' })
        continue
      }

      // Guardar raw_log
      await kv.set(`raw_log:${key}`, JSON.stringify(entries), { ex: KV_TTL_SECONDS })

      // Actualizar registry
      const regRaw = await kv.get(LOG_REGISTRY_KEY)
      const registry = regRaw ? JSON.parse(regRaw) : []
      if (!registry.find(r => r.tokenKey === key)) {
        registry.push({
          tokenKey:  key,
          clientName,
          role:      role || 'ops',
          firstSeen: backfillTs,
          _backfilled: true
        })
        await kv.set(LOG_REGISTRY_KEY, JSON.stringify(registry), { ex: KV_TTL_SECONDS })
      }

      results.push({ tokenKey: key, clientName, status: 'migrated', exchanges: entries.length })

    } catch (e) {
      results.push({ tokenKey: key, clientName, status: 'error', reason: e.message })
    }
  }

  return res.status(200).json({
    migrated: results.filter(r => r.status === 'migrated').length,
    already_exists: results.filter(r => r.status === 'already_exists').length,
    errors: results.filter(r => r.status === 'error').length,
    results
  })
}
