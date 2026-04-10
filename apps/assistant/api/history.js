const { kv } = require('@vercel/kv')

// ─── TOKEN VALIDATION — misma lógica que chat.js ──────────────────────────────
const ROLE_MAP = {
  admin:'admin', sam:'admin', samdev:'admin', unrlvl:'admin',
  po:'po', paty:'po', patricia:'po', owner:'po',
  ops:'ops', laura:'ops', operaciones:'ops', equipo:'ops'
}

function validateToken(token) {
  const raw = process.env.ACCESS_TOKENS || ''
  if (!raw) return { valid: false }
  for (const entry of raw.split(',').map(e => e.trim()).filter(Boolean)) {
    const parts = entry.split(':')
    if (parts.length < 3) continue
    if (parts[0].trim().toUpperCase() !== token.toUpperCase()) continue

    let clientName, role, expiresAtStr
    if (parts.length >= 4) {
      clientName   = parts[1].trim()
      role         = ROLE_MAP[parts[2].trim().toLowerCase()] || 'ops'
      expiresAtStr = parts[3].trim()
    } else {
      clientName   = parts[1].trim()
      role         = 'ops'
      expiresAtStr = parts[2].trim()
    }

    const expiry = new Date(expiresAtStr)
    if (isNaN(expiry.getTime()) || new Date() > expiry) return { valid: false }
    return { valid: true, clientName, role }
  }
  return { valid: false }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token requerido' })

  const validation = validateToken(token)
  if (!validation.valid) return res.status(401).json({ error: 'Token inválido' })

  try {
    const stored = await kv.get(`chat:${token.toUpperCase()}`)
    const history = stored ? (Array.isArray(stored) ? stored : JSON.parse(stored)) : []
    return res.status(200).json({ history, clientName: validation.clientName })
  } catch (e) {
    console.error('History fetch error:', e)
    return res.status(200).json({ history: [], clientName: validation.clientName })
  }
}
