// api/reset.js
// Resetea el historial del SMA en KV: borra chat:*, raw_log:*, el registry y el agent_log.
// Llamar UNA VEZ con POST { secret, confirm: "RESET" }
// Diseñado para limpiar el historial heredado de NeuroneSCF tras reapuntar el agente a ForumPHs.
// Tras el reset, todos los tokens (SAMDEV, IVETTE, JESUS) arrancan desde cero.

const { kv } = require('@vercel/kv')

const EXPORT_SECRET    = process.env.EXPORT_SECRET || ''
const LOG_REGISTRY_KEY = 'log_registry:SOCIAL-MEDIA-AGENT'
const AGENT_LOG_KEY    = 'agent_log:SOCIAL-MEDIA-AGENT'

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { secret, confirm } = req.body || {}

  if (EXPORT_SECRET && secret !== EXPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (confirm !== 'RESET') {
    return res.status(400).json({ error: 'Confirmación requerida: { confirm: "RESET" }' })
  }

  const deleted = { chat: 0, raw_log: 0, registry: 0, agent_log: 0 }
  const errors = []

  try {
    // 1. Borrar todas las keys chat:* y raw_log:* descubiertas vía SCAN
    let cursor = 0
    do {
      const [next, keys] = await kv.scan(cursor, { match: 'chat:*', count: 100 })
      cursor = Number(next)
      for (const k of keys) {
        try { await kv.del(k); deleted.chat++ } catch (e) { errors.push(`${k}: ${e.message}`) }
      }
    } while (cursor !== 0)

    cursor = 0
    do {
      const [next, keys] = await kv.scan(cursor, { match: 'raw_log:*', count: 100 })
      cursor = Number(next)
      for (const k of keys) {
        try { await kv.del(k); deleted.raw_log++ } catch (e) { errors.push(`${k}: ${e.message}`) }
      }
    } while (cursor !== 0)

    // 2. Borrar el registry y el agent_log (singletons)
    try { await kv.del(LOG_REGISTRY_KEY); deleted.registry = 1 } catch (e) { errors.push(`registry: ${e.message}`) }
    try { await kv.del(AGENT_LOG_KEY);    deleted.agent_log = 1 } catch (e) { errors.push(`agent_log: ${e.message}`) }

    return res.status(200).json({
      status: 'reset_complete',
      deleted,
      errors,
      note: 'Historial del SMA reseteado. Todos los tokens arrancan desde cero.'
    })
  } catch (e) {
    return res.status(500).json({ status: 'error', reason: e.message, deleted })
  }
}
