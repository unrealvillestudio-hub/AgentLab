const { kv } = require('@vercel/kv')

const AGENT_LOG_KEY    = 'agent_log:SOCIAL-MEDIA-AGENT'
const LOG_REGISTRY_KEY = 'log_registry:SOCIAL-MEDIA-AGENT'
const EXPORT_SECRET    = process.env.EXPORT_SECRET || ''

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-export-secret')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Autenticación
  const secret = req.headers['x-export-secret'] || req.query.secret || ''
  if (EXPORT_SECRET && secret !== EXPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const now = new Date().toISOString()
    let md = `# SOCIAL MEDIA AGENT — Export completo\n_Generado: ${now}_\n\n`

    // ── 1. Registry: qué usuarios han tenido actividad ────────────────────────
    const registryRaw = await kv.get(LOG_REGISTRY_KEY)
    const registry = registryRaw ? JSON.parse(registryRaw) : []

    if (registry.length === 0) {
      md += `> Sin actividad registrada. Los logs automáticos se generan a partir de esta versión del agente.\n\n`
    }

    // ── 2. Raw logs por usuario — detalle completo ────────────────────────────
    if (registry.length > 0) {
      md += `---\n\n## ACTIVIDAD POR USUARIO\n\n`

      for (const entry of registry) {
        const { tokenKey, clientName, role, firstSeen } = entry
        md += `### ${clientName.toUpperCase()} (${role}) — primera sesión: ${firstSeen ? firstSeen.split('T')[0] : '—'}\n\n`

        const rawRaw = await kv.get(`raw_log:${tokenKey}`)
        const rawEntries = rawRaw ? JSON.parse(rawRaw) : []

        if (rawEntries.length === 0) {
          md += `_Sin exchanges registrados para este usuario._\n\n`
          continue
        }

        // Agrupar por día
        const byDay = {}
        for (const e of rawEntries) {
          const day = e.ts ? e.ts.split('T')[0] : 'sin-fecha'
          if (!byDay[day]) byDay[day] = []
          byDay[day].push(e)
        }

        for (const [day, exchanges] of Object.entries(byDay).sort()) {
          md += `#### ${day} — ${exchanges.length} intercambio(s)\n\n`
          for (const ex of exchanges) {
            const time = ex.ts ? ex.ts.split('T')[1]?.substring(0,8) : ''
            md += `**[${time}] ${clientName}:**\n${ex.userMsg}\n\n`
            md += `**[${time}] Asistente:**\n${ex.assistantMsg}\n\n`
            md += `---\n\n`
          }
        }
      }
    }

    // ── 3. Resumen generado (comando "Actualiza") si existe ───────────────────
    const summaryLog = await kv.get(AGENT_LOG_KEY)
    if (summaryLog) {
      md += `---\n\n## ÚLTIMO RESUMEN GENERADO (comando Actualiza)\n\n${summaryLog}\n\n`
    }

    // ── 4. Sin nada en absoluto ───────────────────────────────────────────────
    if (registry.length === 0 && !summaryLog) {
      md += `## Sin novedades\n\nNo hay actividad registrada en el agente.\n`
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="social_media_agent_session_log.md"')
    return res.status(200).send(md)

  } catch (e) {
    console.error('Export error:', e)
    return res.status(500).json({ error: 'Error al recuperar el log: ' + e.message })
  }
}
