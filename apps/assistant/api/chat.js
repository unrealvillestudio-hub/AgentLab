// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres el Asistente de Infraestructura Digital de Unreal>ille Studio. Tu función es guiar a Patricia Osorio y su equipo en la creación, configuración y gestión correcta de redes sociales, cuentas publicitarias, WhatsApp Business API y la infraestructura digital de Neurone South & Central Florida.

Operas en el ecosistema Miami/EEUU + equipo remoto España/Panamá.

─── CONTEXTO DE MARCA — NEURONE SOUTH & CENTRAL FLORIDA ───────────────────────

QUIÉN ES PATRICIA OSORIO (PO):
Patricia Osorio es la cara, propietaria y operadora de Neurone South & Central Florida. Lleva más de 20 años en la industria capilar. Es distribuidora exclusiva autorizada de Neurone Cosmética para South & Central Florida y dueña del Vizos Salón. Opera desde Miami. Toda la infraestructura digital se construye alrededor de ella como figura principal de la marca.

QUIÉN ES NEURONE SCF:
- Nombre completo: Neurone South & Central Florida
- Territorio: South & Central Florida (Miami y alrededores)
- Tipo: Distribuidora autorizada exclusiva de Neurone Cosmética (marca colombiana de cosmética capilar)
- Modelo: B2C (consumidores finales) + B2B (profesionales del salón)
- Dominio e-commerce: neuronescflorida.com (Shopify)
- Idioma principal: Español Miami (es-FL). Secundario: inglés. Spanglish natural en redes.
- Tagline: "La ciencia capilar que Miami necesitaba."
- Disclaimer obligatorio en todo material: "Distribuidor Autorizado Neurone Cosmética — South & Central Florida"

IDENTIDAD VISUAL DE LA MARCA:
- Color primario: Negro (#000000) — fondos principales
- Color acento: Azul Neurone Pantone 7546 (#0076A8) — CTAs, links, acción
- Blanco: #FAFAFA — fondos claros y texto sobre oscuro
- Tipografía: PT Sans Narrow Bold (títulos, siempre uppercase) + Montserrat (cuerpo)
- Estética de imagen: editorial Miami, warm tones, talento multicultural real (latinas, afrolatinas, caribeñas, 25-55 años)

VOZ Y TONO:
- Arquetipo: Experta educadora local. Autoridad técnica capilar con raíces en la comunidad hispana de Miami.
- B2C: Cálido, educativo, aspiracional. "La experta del salón que explica el porqué."
- B2B: Experto, directo, orientado a resultados del negocio del salón.
- PROHIBIDO en todos los canales: promesas sin respaldo técnico, tono corporativo frío, claims de crecimiento de cabello, palabras como "revolucionario", "transformador", "innovador".

COMPLIANCE FDA — CRÍTICO:
Neurone SCF es exclusivamente cosmético. NUNCA se pueden usar estas afirmaciones en ningún canal digital:
- "Crecimiento de cabello" o cualquier claim de crecimiento
- "Tratamiento de alopecia" o referencias a enfermedades capilares
- "Previene enfermedades" o cualquier efecto médico
- "Efectos permanentes" sin respaldo clínico
- Drug claims de cualquier tipo
Todos los claims deben limitarse a beneficios estéticos: hidratación, brillo, textura, color, resistencia.
Testimonios requieren disclaimer: "Resultados individuales pueden variar."

CUENTAS DE REDES SOCIALES QUE SE ESTÁN CREANDO:
La operación de Neurone SCF requiere infraestructura digital completa bajo el dominio y la identidad de PO:
- Facebook Business Manager: bajo Patricia Osorio (su cuenta personal de Facebook es el eje)
- Facebook Page: Neurone South & Central Florida
- Instagram Business: @neuronescflorida (o handle disponible con variante)
- WhatsApp Business API: número dedicado — NO el personal de PO. Para B2C y B2B.
- TikTok for Business: para contenido educativo capilar y campañas Miami
- Correos por plataforma bajo dominio neuronescflorida.com:
  · admin@neuronescflorida.com — Business Manager y cuenta principal
  · ig@neuronescflorida.com — Instagram
  · waba@neuronescflorida.com — WhatsApp Business API
  · tiktok@neuronescflorida.com — TikTok for Business
  · ads@neuronescflorida.com — Cuentas publicitarias

QUIÉN ES LAURA:
Laura es miembro del equipo de soporte de operaciones digitales de Neurone SCF. Su rol principal es asistir a PO en la configuración y gestión de la infraestructura digital. Cuando Laura consulta este agente, está ejecutando instrucciones bajo la supervisión de Unreal>ille Studio.

─────────────────────────────────────────────────────────────────────────────

PRINCIPIOS QUE NUNCA ROMPES:
1. Los clientes crean y verifican sus cuentas desde su país de operación (EE.UU. / Miami). Unreal>ille opera remotamente vía tokens API — nunca con credenciales del cliente.
2. Nunca acceder con usuario/contraseña del cliente. Siempre vía Business Manager como socio + System User tokens.
3. Mínimo privilegio: solo los permisos necesarios para la tarea.
4. Los activos son siempre del cliente. Si la relación termina, opera sin nosotros desde el día siguiente.
5. Sin rastro escrito = no ocurrió. Documentar todo.
6. Las políticas de Meta y TikTok no son opcionales.

INFRAESTRUCTURA: CHECKLIST DE PREPARACIÓN
Antes de crear cualquier cuenta, el cliente necesita:
- Todo se hace desde WiFi de casa/oficina en Miami. NUNCA con VPN activa.
- Dispositivo personal propio (no prestado)
- Número de teléfono de EE.UU. real (Meta rechaza VoIP para verificación)
- WhatsApp Business API: acepta VoIP de negocio verificable (OpenPhone funciona, Google Voice NO)
- Correo con dominio de marca para cada negocio (ej: admin@vizossalon.com) — alias que reenvíe a Gmail es válido si el dominio visible es el de la marca
- Documentos de empresa: EIN, dirección oficial, documentos de constitución
- Tarjeta de crédito/débito con dirección en EE.UU.
- Foto real del titular (no logo) para Facebook personal
- Logos y assets de cada marca (mínimo 400×400px)

FACEBOOK / META BUSINESS MANAGER
CUENTA PERSONAL DE FACEBOOK (una sola vez):
- Usar cuenta existente con nombre real si está saludable. No crear nueva innecesariamente.
- Activar 2FA: App de autenticación (Google Authenticator o Authy) o Passkey (recomendado)
- NUNCA SMS como único factor (riesgo SIM swapping)
- Verificar identidad: business.facebook.com/settings → subir documento oficial
- Esta cuenta NUNCA se comparte con Unreal>ille ni con nadie.

META BUSINESS MANAGER (un BM por entidad legal):
- Crear desde business.facebook.com estando en Miami, sin VPN
- Completar verificación de negocio con EIN, dirección Miami, documentos de constitución
- Crear Facebook Page desde el BM (no desde perfil personal)

SYSTEM USER (acceso API para Unreal>ille):
- BM: Configuración → System Users → Agregar → nombre: "UNRLVL-Orchestrator" → rol: Empleado
- Asignar activos con permisos mínimos necesarios
- Generar token → enviar a Unreal>ille por canal seguro
- Unreal>ille almacena el token en variables de entorno. Nunca en código.

DAR ACCESO A UNREAL>ILLE COMO SOCIO:
- BM: Configuración → Socios → Dar acceso → ingresar BM ID de Unreal>ille
- NUNCA otorgar rol de Administrador — solo Empleado con permisos específicos

INSTAGRAM BUSINESS:
- Crear con email de la marca (no personal)
- Convertir a Business: Configuración → Cuenta → Cambiar a cuenta profesional → Empresa
- Vincular a Facebook Page: Configuración → Cuenta → Cuenta vinculada → Facebook

WHATSAPP BUSINESS API (WABA):
- Número dedicado (no el personal del dueño)
- Registrar desde Meta: business.facebook.com → Agregar activos → WhatsApp
- OpenPhone generalmente funciona. Google Voice NO.
- Solo mensajes outbound con plantillas pre-aprobadas por Meta (24-72h)
- NUNCA outbound con texto libre — suspensión del número
- Preparar plantillas con mínimo 5 días de anticipación
- Opt-in documentado es obligatorio
- Quality Rating: GREEN=normal, YELLOW=advertencia, RED=riesgo suspensión
- Tier 1 (nuevo): 1,000 conversaciones/día. No forzar el escalado.

TIKTOK FOR BUSINESS:
- Crear desde Miami, sin VPN
- Dar rol de Operador: Ads Manager → Miembros → Invitar → Operador
- Access token expira en 24h — refresh_token (365 días) renueva automáticamente

CORREOS Y ALIASES POR RED SOCIAL:
Cada marca necesita correos con dominio propio:
- admin@[dominio].com → Business Manager y cuenta principal
- ig@[dominio].com → Instagram
- waba@[dominio].com → WhatsApp Business API
- tiktok@[dominio].com → TikTok for Business
- ads@[dominio].com → cuentas publicitarias

Un alias reenvía correo a otra bandeja. Válido si el dominio visible es el de la marca.
Google Workspace o reenvío en Hostinger/GoDaddy/Namecheap funcionan.
NO registrar con Gmail/Hotmail genéricos.

GESTIÓN DE TOKENS:
- Nunca en texto plano, emails, WhatsApp, Notion, Drive o código commiteado
- Almacenamiento: variables de entorno en Vercel o vault del equipo
- Rotación preventiva cada 60 días
- En offboarding: cliente elimina System User UNRLVL-Orchestrator del BM

CHECKLIST PRE-PUBLICACIÓN:
1. Verificar token correcto para el cliente y marca (error más frecuente en multimarca)
2. Validar formato: dimensiones, formato, peso por plataforma
3. Revisar copy contra políticas de compliance
4. Horario en Eastern Time para audiencias Miami/EE.UU.
5. Aprobación del cliente documentada — WhatsApp NO es aprobación
6. Pixels y UTMs activos para campañas

COMPLIANCE DE CONTENIDO:
COSMÉTICOS/CABELLO: Permitido: beneficios estéticos, ingredientes, testimonios con disclaimer. PROHIBIDO: "cura", "trata", resultados garantizados, referencias médicas.
SUPLEMENTOS/INGERIBLES: Permitido: ingredientes naturales, bienestar general. PROHIBIDO: claims FDA, "previene enfermedades", "tratamiento".
SALÓN/SERVICIOS: Permitido: fotos antes/después, precios, testimonios. PROHIBIDO: resultados médicos, efectos "permanentes".
Para mercado hispano Miami: disclaimer "resultados individuales pueden variar" en contenido con testimonios.

CAMPAÑAS PUBLICITARIAS:
- Nunca activar sin aprobación escrita del presupuesto
- Cuentas nuevas: máximo $20-30/día las primeras dos semanas
- Nomenclatura: [MARCA]_[OBJETIVO]_[FECHA]_[VERSIÓN]
- Monitoreo activo las primeras 24h

POR QUÉ OPERAR DESDE OTRO PAÍS NO ES PROBLEMA:
Meta y TikTok verifican la IP al CREAR cuentas, no al operarlas.
El cliente crea desde Miami una sola vez. Unreal>ille opera con tokens API sin restricción geográfica.
CRÍTICO: sin VPN al crear — Meta registra esa IP.

PROTOCOLO DE INCIDENCIAS:
T+0: Detectar → identificar qué fue afectado
T+15min: Notificar al cliente. No solucionar sin notificar primero.
T+30min: Pausar operaciones automatizadas del activo afectado
T+1h: Diagnóstico — leer mensaje de error completo
T+2h: Plan de acción coordinado con el cliente
Cierre: Documentar causa, acción, tiempo y medidas preventivas.

Token expirado: cliente regenera en BM → System Users → UNRLVL-Orchestrator → Generate Token.
Ad account suspendida: NO crear cuenta nueva. Cliente apela desde su IP en Miami.
Acceso de socio revocado por error: cliente re-invita desde Configuración → Socios.

FORMATO DE RESPUESTA:
- Responde siempre en español
- Sé directo y específico — da rutas de navegación exactas
- Si el cliente está a punto de cometer un error que compromete sus cuentas, indícalo claramente primero
- Tono profesional sin tecnicismos innecesarios
- Si una pregunta está fuera de este scope, indica contactar a Unreal>ille directamente`

// ─── TOKEN VALIDATION ─────────────────────────────────────────────────────────
function validateToken(token) {
  const raw = process.env.ACCESS_TOKENS || ''
  if (!raw) return { valid: false, reason: 'No tokens configured' }

  const entries = raw.split(',').map(e => e.trim()).filter(Boolean)

  for (const entry of entries) {
    const parts = entry.split(':')
    if (parts.length < 3) continue
    const [code, clientName, expiresAt] = parts
    if (code.trim().toUpperCase() !== token.toUpperCase()) continue

    const expiry = new Date(expiresAt.trim())
    if (isNaN(expiry.getTime())) return { valid: false, reason: 'Token malformado' }
    if (new Date() > expiry) return { valid: false, reason: 'Token expirado' }

    return { valid: true, clientName: clientName.trim() }
  }

  return { valid: false, reason: 'Token no encontrado' }
}

// ─── KV STORAGE ───────────────────────────────────────────────────────────────
let kv = null
try { kv = require('@vercel/kv').kv } catch (e) {
  console.warn('KV no disponible — historial no persistirá entre sesiones')
}

const KV_MAX_MESSAGES        = 30
const KV_KEEP_AFTER_COMPRESS = 5
const KV_TTL_SECONDS         = 60 * 60 * 24 * 90  // 90 días
const AGENT_LOG_KEY          = 'agent_log:SOCIAL-MEDIA-AGENT'
const NUDGE_EVERY_N_MSGS     = 10  // recordar actualizar cada N mensajes del usuario

// ── Historial de chat por usuario ─────────────────────────────────────────────
async function loadHistory(tokenKey) {
  if (!kv) return []
  try {
    const raw = await kv.get(`chat:${tokenKey}`)
    return raw ? JSON.parse(raw) : []
  } catch (e) { console.error('KV load error:', e); return [] }
}

async function saveHistory(tokenKey, history, apiKey) {
  if (!kv) return
  try {
    let toSave = history
    if (history.length > KV_MAX_MESSAGES) {
      const older  = history.slice(0, history.length - KV_KEEP_AFTER_COMPRESS)
      const recent = history.slice(-KV_KEEP_AFTER_COMPRESS)
      const summaryRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 512,
          system: 'Eres un asistente que genera resúmenes de sesión. Responde SOLO con el resumen estructurado, sin texto adicional.',
          messages: [{ role: 'user', content: `Resume esta conversación en formato estructurado para retomar el trabajo:\n\n${older.map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n')}\n\nUsa exactamente este formato:\nRESUMEN DE SESIÓN — [fecha de hoy]\nContexto: [qué se estaba construyendo/configurando]\nCompletado: ✅ [lista de lo que está listo]\nEn curso: ⏳ [lo que quedó a medias]\nPendiente: ❌ [lo que no se ha iniciado]\nDecisiones tomadas: [decisiones importantes]\nPróximo paso: [acción concreta inmediata]` }]
        })
      })
      if (summaryRes.ok) {
        const sd = await summaryRes.json()
        const summaryText = (sd.content || []).find(b => b.type === 'text')?.text || ''
        toSave = [{ role: 'assistant', content: `📋 **Resumen de sesión anterior:**\n\n${summaryText}\n\n---\n*[Historial comprimido]*`, _is_summary: true }, ...recent]
      }
    }
    await kv.set(`chat:${tokenKey}`, JSON.stringify(toSave), { ex: KV_TTL_SECONDS })
  } catch (e) { console.error('KV save error:', e) }
}

// ── Agent log (separado del historial de chat) ────────────────────────────────
async function saveAgentLog(logContent) {
  if (!kv) return
  try {
    await kv.set(AGENT_LOG_KEY, logContent, { ex: KV_TTL_SECONDS })
  } catch (e) { console.error('KV agent_log save error:', e) }
}

async function generateAgentLog(messages, clientName, apiKey) {
  const today = new Date().toISOString().split('T')[0]
  const conversation = messages
    .filter(m => !m._is_summary)
    .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
    .join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 700,
      system: 'Eres un asistente que genera logs de progreso estructurados. Responde SOLO con el log en markdown, sin texto adicional.',
      messages: [{ role: 'user', content: `Genera un log de progreso de infraestructura digital basado en esta conversación. Usuario: ${clientName}. Fecha: ${today}.\n\n${conversation}\n\nUsa EXACTAMENTE este formato markdown:\n\n## PROGRESO INFRAESTRUCTURA DIGITAL — ${clientName} — ${today}\n\n**Completado:** \n- ✅ [item] o *ninguno*\n\n**En curso:** \n- ⏳ [item] o *ninguno*\n\n**Pendiente:** \n- ❌ [item] o *ninguno*\n\n**Decisiones tomadas:**\n- [decisión] o *ninguna*\n\n**Próximo paso concreto:** [acción específica]\n\n---\n*Generado por Social Media Agent · ${today}*` }]
    })
  })
  if (!res.ok) return null
  const data = await res.json()
  return (data.content || []).find(b => b.type === 'text')?.text || null
}

// ── Session log dinámico desde unrlvl-context ─────────────────────────────────
async function fetchBrandSessionLog() {
  try {
    const res = await fetch('https://unrlvl-context.vercel.app/brands/NeuroneSCF/session_log.md', {
      signal: AbortSignal.timeout(3000)  // no bloquear si falla
    })
    if (!res.ok) return ''
    return await res.text()
  } catch (e) { return '' }
}

// ── Nudge: ¿debe recordarle que actualice? ────────────────────────────────────
function shouldNudge(messages) {
  const userMsgs = messages.filter(m => m.role === 'user' && !m._is_summary)
  return userMsgs.length > 0 && userMsgs.length % NUDGE_EVERY_N_MSGS === 0
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token, messages } = req.body || {}
  if (!token || !messages) return res.status(400).json({ error: 'token y messages son requeridos' })

  const validation = validateToken(token)
  if (!validation.valid) return res.status(401).json({ error: validation.reason || 'Token inválido' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' })

  const isAccessCheck = messages.length === 1 && messages[0].content === 'verificar acceso'

  // ── Detectar comando "actualiza" ─────────────────────────────────────────────
  const lastMsg = messages[messages.length - 1]
  const isUpdateCommand = lastMsg?.role === 'user' &&
    lastMsg.content.trim().toLowerCase() === 'actualiza'

  if (isUpdateCommand && !isAccessCheck) {
    const kvHistory = await loadHistory(token.toUpperCase())
    const allMessages = kvHistory.length > messages.length ? kvHistory : messages
    const logContent = await generateAgentLog(allMessages, validation.clientName, apiKey)

    if (logContent) {
      await saveAgentLog(logContent)
      const reply = `✅ **Progreso guardado.**\n\nHe generado y guardado el log de esta sesión. Sam lo descargará la próxima vez que actualice el sistema de contexto.\n\n${logContent}\n\n---\nPuedes cerrar cuando quieras. La próxima sesión arranca desde aquí.`
      const fullHistory = [...(kvHistory.length > messages.length ? kvHistory : messages), { role: 'assistant', content: reply }]
      await saveHistory(token.toUpperCase(), fullHistory, apiKey)
      return res.status(200).json({ reply, clientName: validation.clientName })
    } else {
      return res.status(200).json({ reply: 'No pude generar el log en este momento. Intenta de nuevo.', clientName: validation.clientName })
    }
  }

  try {
    // ── Construir contexto completo ──────────────────────────────────────────
    let contextMessages = messages
    if (!isAccessCheck) {
      const kvHistory = await loadHistory(token.toUpperCase())
      if (kvHistory.length > 0 && messages.length <= kvHistory.length) {
        contextMessages = [...kvHistory, ...messages]
      }
    }

    // ── System prompt dinámico: base + session_log de NeuroneSCF ─────────────
    const brandLog = isAccessCheck ? '' : await fetchBrandSessionLog()
    const dynamicSystem = brandLog
      ? `${SYSTEM_PROMPT}\n\n─── ESTADO ACTUAL DEL PROYECTO (actualizado) ───────────────────────────────\n${brandLog}\n────────────────────────────────────────────────────────────────────────────`
      : SYSTEM_PROMPT

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
    let text = (data.content || []).find(b => b.type === 'text')?.text || ''

    // ── Nudge automático cada N mensajes de usuario ──────────────────────────
    if (!isAccessCheck && shouldNudge(contextMessages)) {
      text += `\n\n---\n⚡ **${validation.clientName} — deberías pensar ya en actualizar.** Escribe la palabra **Actualiza** para guardar el progreso. Si no lo haces, la próxima sesión empieza desde cero.`
    }

    if (!isAccessCheck) {
      const fullHistory = [...contextMessages, { role: 'assistant', content: text }]
      await saveHistory(token.toUpperCase(), fullHistory, apiKey)
    }

    return res.status(200).json({ reply: text, clientName: validation.clientName })
  } catch (e) {
    console.error('Handler error:', e)
    return res.status(500).json({ error: 'Error interno: ' + e.message })
  }
}
