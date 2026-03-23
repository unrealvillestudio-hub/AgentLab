// ─── SYSTEM PROMPT BASE ───────────────────────────────────────────────────────
const SYSTEM_PROMPT_BASE = `Eres el Asistente de Infraestructura Digital de Unreal>ille Studio. Tu función es guiar en la creación, configuración y gestión correcta de redes sociales, cuentas publicitarias, WhatsApp Business API y la infraestructura digital de Neurone South & Central Florida.

Operas en el ecosistema Miami/EEUU + equipo remoto España/Panamá.

─── CONTEXTO DE MARCA — NEURONE SOUTH & CENTRAL FLORIDA ───────────────────────

QUIÉN ES PATRICIA OSORIO (PO):
Patricia Osorio es la cara, propietaria y operadora de Neurone South & Central Florida. Lleva más de 20 años en la industria capilar. Es distribuidora exclusiva autorizada de Neurone Cosmética para South & Central Florida y dueña del Vizos Salón. Opera desde Miami. Toda la infraestructura digital se construye alrededor de ella como figura principal de la marca.

QUIÉN ES NEURONE SCF:
- Nombre: Neurone South & Central Florida
- Territorio: South & Central Florida
- Tipo: Distribuidora autorizada exclusiva de Neurone Cosmética
- Modelo: B2C + B2B
- Dominio: neuronescflorida.com
- Idioma: Español Miami (es-FL). Spanglish natural en redes.
- Tagline: "La ciencia capilar que Miami necesitaba."
- Disclaimer obligatorio: "Distribuidor Autorizado Neurone Cosmética — South & Central Florida"

COMPLIANCE FDA — CRÍTICO:
NUNCA usar: crecimiento de cabello, tratamiento de alopecia, previene enfermedades, efectos permanentes sin respaldo, drug claims. Solo beneficios estéticos. Testimonios: "Resultados individuales pueden variar."

CUENTAS A CREAR:
- Facebook Business Manager (bajo Patricia Osorio)
- Facebook Page: Neurone South & Central Florida
- Instagram Business: @neuronescflorida
- WhatsApp Business API: número dedicado, NO el personal de PO
- TikTok for Business
- Correos: admin@, ig@, waba@, tiktok@, ads@ — todos bajo neuronescflorida.com

PRINCIPIOS OPERATIVOS:
1. Clientes crean cuentas desde Miami. UNRLVL opera con tokens API — nunca con credenciales del cliente.
2. Nunca usuario/contraseña del cliente. Siempre Business Manager como socio + System User tokens.
3. Mínimo privilegio.
4. Los activos son siempre del cliente.
5. Sin rastro escrito = no ocurrió.
6. Políticas de Meta y TikTok no son opcionales.

CHECKLIST PREVIO:
- WiFi casa/oficina en Miami. NUNCA VPN al crear cuentas.
- Dispositivo personal propio
- Número EE.UU. real (Meta rechaza VoIP para verificación. WABA: OpenPhone funciona, Google Voice NO)
- Correo con dominio de marca
- Documentos empresa: EIN, dirección, constitución
- Tarjeta crédito/débito con dirección EE.UU.
- Foto real del titular (no logo) para Facebook personal
- Logos mínimo 400x400px

META BUSINESS MANAGER:
- Cuenta personal Facebook: usar existente si saludable. 2FA obligatorio (app autenticación o Passkey). NUNCA solo SMS.
- Verificar identidad: business.facebook.com/settings → documento oficial
- BM: crear desde business.facebook.com en Miami sin VPN. Verificar con EIN + dirección + documentos.
- Page: crear desde BM, no desde perfil personal.
- System User: BM → Configuración → System Users → "UNRLVL-Orchestrator" → rol Empleado → asignar activos → generar token → enviar a UNRLVL por canal seguro.
- Socio: BM → Configuración → Socios → Dar acceso → BM ID de UNRLVL. NUNCA rol Administrador.

INSTAGRAM BUSINESS:
- Crear con email de marca. Convertir a Business: Configuración → Cuenta → Profesional → Empresa.
- Vincular a Facebook Page: Configuración → Cuenta → Cuenta vinculada → Facebook.

WHATSAPP BUSINESS API:
- Número dedicado (no personal de PO). Registrar desde Meta BM → Agregar activos → WhatsApp.
- Solo outbound con plantillas pre-aprobadas (24-72h). NUNCA texto libre outbound.
- Plantillas: mínimo 5 días de anticipación. Opt-in documentado obligatorio.
- Tier 1 (nuevo): 1,000 conversaciones/día.

TIKTOK FOR BUSINESS:
- Crear desde Miami sin VPN. Acceso: Ads Manager → Miembros → Invitar → Operador.
- Access token expira en 24h, refresh_token 365 días.

TOKENS:
- Nunca en texto plano, emails, WhatsApp, Notion, Drive o código commiteado.
- Storage: variables de entorno en Vercel. Rotación cada 60 días.

COMPLIANCE DE CONTENIDO:
COSMÉTICOS: Permitido: beneficios estéticos, ingredientes, testimonios con disclaimer. Prohibido: "cura", "trata", resultados garantizados, referencias médicas.
Para mercado hispano Miami: "resultados individuales pueden variar" en testimonios.

CAMPAÑAS:
- Nunca sin aprobación escrita del presupuesto. Cuentas nuevas: máx $20-30/día primeras 2 semanas.
- Nomenclatura: [MARCA]_[OBJETIVO]_[FECHA]_[VERSIÓN]. Monitoreo activo primeras 24h.

OPERAR DESDE OTRO PAÍS:
Meta/TikTok verifican IP al CREAR, no al operar. Cliente crea una sola vez desde Miami sin VPN. UNRLVL opera con tokens sin restricción geográfica.

INCIDENCIAS:
T+0: detectar. T+15min: notificar cliente. T+30min: pausar operaciones afectadas. T+1h: diagnóstico. T+2h: plan coordinado. Cierre: documentar.
Token expirado: regenerar en BM → System Users → UNRLVL-Orchestrator → Generate Token.
Ad account suspendida: NO crear nueva. Apelar desde IP Miami del cliente.

FORMATO:
- Responde siempre en español
- Directo, rutas de navegación exactas
- Alerta primero si hay riesgo de comprometer cuentas
- Preguntas fuera de scope: contactar a Unreal>ille directamente`

// ─── ROL POR TOKEN ────────────────────────────────────────────────────────────
const ROLE_CONTEXT = {
  admin: (name) => `
─── SESIÓN ADMIN — ${name} (Unreal>ille Studio) ────────────────────────────────
Interlocutor: ${name}, fundador de Unreal>ille Studio. Usuario ya autenticado — NO pedir identificación.
Rol: supervisión técnica completa, configuración de accesos, revisión de tokens e infraestructura.
Acceso: contexto operativo completo del agente.
Al iniciar conversación, saluda a ${name} directamente y pregunta en qué puede ayudar.
────────────────────────────────────────────────────────────────────────────────`,

  po: (name) => `
─── SESIÓN PO — ${name} ────────────────────────────────────────────────────────
Interlocutor: Patricia Osorio, propietaria y operadora de Neurone SCF.
Rol: titular legal de todos los activos digitales. Ella crea y verifica cuentas desde Miami.
Guíala paso a paso — es experta en cabello, no en tecnología. Lenguaje claro y directo.
────────────────────────────────────────────────────────────────────────────────`,

  ops: (name) => `
─── SESIÓN OPS — ${name} ───────────────────────────────────────────────────────
Interlocutor: ${name}, equipo de operaciones digitales de Neurone SCF.
Rol: asistir a Patricia Osorio en tareas de infraestructura digital, bajo supervisión de Unreal>ille.
REGLA: ${name} ejecuta tareas técnicas pero los activos pertenecen siempre a Patricia Osorio. Credenciales y tokens se entregan a PO o a Unreal>ille — nunca se retienen.
IMPORTANTE: responde ÚNICAMENTE basándote en el historial de esta conversación. No menciones ni infieras proyectos, decisiones o trabajo de otras personas o contextos externos.
────────────────────────────────────────────────────────────────────────────────`
}

// ─── TOKEN VALIDATION ─────────────────────────────────────────────────────────
// Formatos soportados:
//   CODE:Name:Role:YYYY-MM-DD  (con rol explícito)
//   CODE:Name:YYYY-MM-DD       (sin rol — default: ops)
function validateToken(token) {
  const raw = process.env.ACCESS_TOKENS || ''
  if (!raw) return { valid: false, reason: 'No tokens configured' }

  for (const entry of raw.split(',').map(e => e.trim()).filter(Boolean)) {
    const parts = entry.split(':')
    if (parts.length < 3) continue
    if (parts[0].trim().toUpperCase() !== token.toUpperCase()) continue

    // Mapa de etiquetas personalizadas → roles internos (admin|po|ops)
    // Sam puede usar cualquier etiqueta — se normaliza internamente
    const ROLE_MAP = {
      admin:'admin', sam:'admin', samdev:'admin', unrlvl:'admin',
      po:'po', paty:'po', patricia:'po', owner:'po',
      ops:'ops', laura:'ops', operaciones:'ops', equipo:'ops'
    }

    let clientName, role, expiresAtStr
    if (parts.length >= 4) {
      clientName    = parts[1].trim()
      const rawRole = parts[2].trim().toLowerCase()
      role          = ROLE_MAP[rawRole] || 'ops'
      expiresAtStr  = parts[3].trim()
    } else {
      clientName   = parts[1].trim()
      role         = 'ops'
      expiresAtStr = parts[2].trim()
    }

    const expiry = new Date(expiresAtStr)
    if (isNaN(expiry.getTime())) return { valid: false, reason: 'Token malformado' }
    if (new Date() > expiry)      return { valid: false, reason: 'Token expirado' }

    return { valid: true, clientName, role }
  }

  return { valid: false, reason: 'Token no encontrado' }
}

// ─── KV STORAGE ───────────────────────────────────────────────────────────────
let kv = null
try { kv = require('@vercel/kv').kv } catch (e) {
  console.warn('KV no disponible')
}

const KV_MAX_MESSAGES        = 30
const KV_KEEP_AFTER_COMPRESS = 5
const KV_TTL_SECONDS         = 60 * 60 * 24 * 90
const AGENT_LOG_KEY          = 'agent_log:SOCIAL-MEDIA-AGENT'
const NUDGE_EVERY_N_MSGS     = 10

async function loadHistory(tokenKey) {
  if (!kv) return []
  try {
    const raw = await kv.get(`chat:${tokenKey}`)
    return raw ? JSON.parse(raw) : []
  } catch (e) { return [] }
}

async function saveHistory(tokenKey, history, apiKey) {
  if (!kv) return
  try {
    let toSave = history
    if (history.length > KV_MAX_MESSAGES) {
      const older  = history.slice(0, history.length - KV_KEEP_AFTER_COMPRESS)
      const recent = history.slice(-KV_KEEP_AFTER_COMPRESS)
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 512,
          system: 'Genera resúmenes de sesión. Responde SOLO con el resumen estructurado.',
          messages: [{ role: 'user', content: `Resume para retomar trabajo:\n\n${older.map(m=>`${m.role==='user'?'Usuario':'Asistente'}: ${m.content}`).join('\n')}\n\nFormato:\nRESUMEN — [fecha]\nCompletado: ✅\nEn curso: ⏳\nPendiente: ❌\nDecisiones:\nPróximo paso:` }]
        })
      })
      if (r.ok) {
        const d = await r.json()
        const st = (d.content||[]).find(b=>b.type==='text')?.text||''
        toSave = [{ role:'assistant', content:`📋 **Resumen sesión anterior:**\n\n${st}\n\n---\n*[Historial comprimido]*`, _is_summary:true }, ...recent]
      }
    }
    await kv.set(`chat:${tokenKey}`, JSON.stringify(toSave), { ex: KV_TTL_SECONDS })
  } catch (e) { console.error('KV save error:', e) }
}

async function saveAgentLog(content) {
  if (!kv) return
  try { await kv.set(AGENT_LOG_KEY, content, { ex: KV_TTL_SECONDS }) } catch (e) {}
}

async function generateAgentLog(messages, clientName, role, apiKey) {
  const today = new Date().toISOString().split('T')[0]
  const conv = messages.filter(m=>!m._is_summary).map(m=>`${m.role==='user'?clientName:'Asistente'}: ${m.content}`).join('\n')
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 700,
      system: 'Genera logs de progreso de infraestructura digital. SOLO el log en markdown, sin texto adicional.',
      messages: [{ role: 'user', content: `Log de infraestructura digital.\nUsuario: ${clientName} (${role}) | Fecha: ${today}\n\n${conv}\n\nFormato EXACTO:\n\n## PROGRESO INFRAESTRUCTURA DIGITAL — ${clientName} — ${today}\n\n**Completado:**\n- ✅ [item]\n\n**En curso:**\n- ⏳ [item]\n\n**Pendiente:**\n- ❌ [item]\n\n**Decisiones tomadas:**\n- [decisión]\n\n**Próximo paso concreto:** [acción]\n\n---\n*Social Media Agent · ${clientName} · ${today}*` }]
    })
  })
  if (!r.ok) return null
  const d = await r.json()
  return (d.content||[]).find(b=>b.type==='text')?.text||null
}

// Lee agents/social-media-agent/session_log.md — NUNCA brands/NeuroneSCF/session_log.md
async function fetchAgentContext() {
  try {
    const r = await fetch('https://unrlvl-context.vercel.app/agents/social-media-agent/session_log.md', {
      signal: AbortSignal.timeout(3000)
    })
    if (!r.ok) return ''
    return await r.text()
  } catch (e) { return '' }
}

function shouldNudge(messages) {
  const n = messages.filter(m=>m.role==='user'&&!m._is_summary).length
  return n > 0 && n % NUDGE_EVERY_N_MSGS === 0
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token, messages } = req.body || {}
  if (!token || !messages) return res.status(400).json({ error: 'token y messages requeridos' })

  const validation = validateToken(token)
  if (!validation.valid) return res.status(401).json({ error: validation.reason || 'Token inválido' })

  const { clientName, role } = validation
  const tokenKey = token.toUpperCase()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' })

  const isAccessCheck = messages.length === 1 && messages[0].content === 'verificar acceso'
  const lastMsg = messages[messages.length - 1]
  const isUpdateCmd = !isAccessCheck && lastMsg?.role === 'user' && lastMsg.content.trim().toLowerCase() === 'actualiza'

  // ── Comando actualiza ──────────────────────────────────────────────────────
  if (isUpdateCmd) {
    const kvHistory = await loadHistory(tokenKey)
    const src = kvHistory.length >= messages.length ? kvHistory : messages
    const log = await generateAgentLog(src, clientName, role, apiKey)
    if (log) {
      await saveAgentLog(log)
      const reply = `✅ **Progreso guardado, ${clientName}.**\n\nLog de sesión generado y guardado. Unreal>ille lo descargará en su próxima actualización.\n\n${log}\n\n---\nPuedes cerrar. La próxima sesión arranca desde aquí.`
      await saveHistory(tokenKey, [...src, { role:'assistant', content:reply }], apiKey)
      return res.status(200).json({ reply, clientName })
    }
    return res.status(200).json({ reply:'No pude generar el log ahora. Intenta de nuevo.', clientName })
  }

  try {
    // ── Historial: KV es fuente de verdad, aislado por token ──────────────────
    let contextMessages = messages
    if (!isAccessCheck) {
      const kvHistory = await loadHistory(tokenKey)
      if (kvHistory.length > 0 && messages.length <= kvHistory.length) {
        // Sesión nueva — frontend no tiene historial completo
        contextMessages = [...kvHistory, ...messages]
      }
      // Si messages.length > kvHistory.length → frontend ya incluye historial, no duplicar
    }

    // ── System prompt: base + rol + agent context (NO brand log de Sam) ───────
    const roleCtx   = (ROLE_CONTEXT[role] || ROLE_CONTEXT.ops)(clientName)
    const agentCtx  = isAccessCheck ? '' : await fetchAgentContext()
    let dynamicSystem = `${SYSTEM_PROMPT_BASE}\n${roleCtx}`
    if (agentCtx) {
      dynamicSystem += `\n\n─── ESTADO INFRAESTRUCTURA DIGITAL NEURONE SCF ─────────────────────────────\n${agentCtx}\n────────────────────────────────────────────────────────────────────────────`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: dynamicSystem,
        messages: contextMessages.slice(-24)
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return res.status(502).json({ error: 'Error al conectar con el modelo' })
    }

    const data = await response.json()
    let text = (data.content||[]).find(b=>b.type==='text')?.text||''

    // Nudge solo para ops y po — admin no necesita recordatorio
    if (!isAccessCheck && role !== 'admin' && shouldNudge(contextMessages)) {
      text += `\n\n---\n⚡ **${clientName} — deberías pensar ya en actualizar.** Escribe **Actualiza** para guardar el progreso. Si no lo haces, la próxima sesión empieza desde cero.`
    }

    if (!isAccessCheck) {
      await saveHistory(tokenKey, [...contextMessages, { role:'assistant', content:text }], apiKey)
    }

    return res.status(200).json({ reply: text, clientName })
  } catch (e) {
    console.error('Handler error:', e)
    return res.status(500).json({ error: 'Error interno: ' + e.message })
  }
}
