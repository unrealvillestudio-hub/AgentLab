const { kv } = require('@vercel/kv')

const AGENT_LOG_KEY   = 'agent_log:SOCIAL-MEDIA-AGENT'
const EXPORT_SECRET   = process.env.EXPORT_SECRET || ''

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-export-secret')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Protección mínima: secret en header o query param
  const secret = req.headers['x-export-secret'] || req.query.secret || ''
  if (EXPORT_SECRET && secret !== EXPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const log = await kv.get(AGENT_LOG_KEY)

    if (!log) {
      return res.status(200).json({ pending: false, message: 'Sin novedades del Social Media Agent.' })
    }

    // Devolver como archivo .md descargable
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="social_media_agent_session_log.md"')
    return res.status(200).send(log)

  } catch (e) {
    console.error('Export error:', e)
    return res.status(500).json({ error: 'Error al recuperar el log' })
  }
}
