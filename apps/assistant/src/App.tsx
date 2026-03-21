import { useState, useRef, useEffect, useCallback } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

// ─── AGENT BADGE ──────────────────────────────────────────────────────────────
function AgentBadge({ small = false }: { small?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: small ? '5px' : '7px',
      background: 'var(--void)', border: '1px solid var(--cyan20)',
      borderRadius: '4px', padding: small ? '3px 8px' : '6px 12px',
    }}>
      <div style={{
        width: small ? '7px' : '9px', height: small ? '7px' : '9px',
        borderRadius: '50%', background: 'var(--cyan)',
        boxShadow: '0 0 8px var(--cyan)', flexShrink: 0
      }} />
      <span style={{
        fontFamily: "'Space Mono',monospace",
        fontSize: small ? '9px' : '11px',
        letterSpacing: '0.12em', color: 'var(--cyan)',
        textTransform: 'uppercase', whiteSpace: 'nowrap'
      }}>Social Media Agent</span>
    </div>
  )
}

function Logotype() {
  return (
    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '16px', letterSpacing: '0.14em', display: 'flex', alignItems: 'baseline', userSelect: 'none' as const }}>
      <span style={{ color: 'rgba(242,240,236,0.72)' }}>UNREAL</span>
      <span style={{ color: '#00FFD1' }}>&gt;</span>
      <span style={{ color: 'rgba(242,240,236,0.72)' }}>ILLE</span>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(242,240,236,0.26)', marginLeft: '6px' }}>STUDIO</span>
    </div>
  )
}

// ─── TOKEN GATE ───────────────────────────────────────────────────────────────
function TokenGate({ onAccess }: { onAccess: (token: string, clientName: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('unrlvl_token')
    const savedClient = sessionStorage.getItem('unrlvl_client')
    if (saved && savedClient) { onAccess(saved, savedClient); return }
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [onAccess])

  const handleSubmit = async () => {
    if (!value.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: value.trim(), messages: [{ role: 'user', content: 'verificar acceso' }] })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Token inválido'); setLoading(false); return }
      sessionStorage.setItem('unrlvl_token', value.trim())
      sessionStorage.setItem('unrlvl_client', data.clientName || '')
      onAccess(value.trim(), data.clientName || '')
    } catch { setError('No se pudo verificar el acceso. Intenta de nuevo.') }
    setLoading(false)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--void)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'linear-gradient(var(--chalk12) 1px,transparent 1px),linear-gradient(90deg,var(--chalk12) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' as const }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--cyan)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '36px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '12px' }}>
          <Logotype />
          <AgentBadge />
        </div>
        <div style={{ background: 'var(--carbon)', border: '1px solid var(--chalk12)', borderTop: '2px solid var(--cyan)', padding: '32px 28px' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '26px', letterSpacing: '0.08em', color: 'var(--chalk)', marginBottom: '6px' }}>ACCESO RESTRINGIDO</div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: 'italic', fontSize: '13px', color: 'var(--chalk42)', marginBottom: '28px', lineHeight: '1.6' }}>
            Ingresa el código de acceso proporcionado por Unreal&gt;ille Studio.
          </div>
          <label style={{ display: 'block', fontFamily: "'Space Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--chalk20)', marginBottom: '8px' }}>CÓDIGO DE ACCESO</label>
          <input ref={inputRef} type="text" value={value}
            onChange={e => { setValue(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="XXXXXXXX" disabled={loading}
            style={{ width: '100%', background: 'var(--void)', border: `1px solid ${error ? 'var(--danger)' : 'var(--chalk12)'}`, borderRadius: '3px', padding: '13px 14px', fontFamily: "'Space Mono',monospace", fontSize: '16px', letterSpacing: '0.22em', color: 'var(--cyan)', outline: 'none', marginBottom: error ? '8px' : '16px', caretColor: 'var(--cyan)', transition: 'border-color 0.15s' }}
          />
          {error && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', color: 'var(--danger)', marginBottom: '12px', padding: '8px 10px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '3px' }}>✗ {error}</div>}
          <button onClick={handleSubmit} disabled={loading || !value.trim()} style={{ width: '100%', background: loading || !value.trim() ? 'var(--g2)' : 'var(--cyan)', border: 'none', borderRadius: '3px', padding: '13px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '16px', letterSpacing: '0.14em', color: loading || !value.trim() ? 'var(--chalk42)' : 'var(--void)', cursor: loading || !value.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            {loading ? 'VERIFICANDO...' : 'INGRESAR'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: "'Space Mono',monospace", fontSize: '9px', color: 'var(--chalk20)', letterSpacing: '0.1em' }}>
          ¿No tienes código? Contacta a Unreal&gt;ille Studio.
        </div>
      </div>
    </div>
  )
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  const renderContent = (text: string) => {
    if (isUser) return <span>{text}</span>
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
    return <>{parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{ color: 'var(--chalk)', fontWeight: 700 }}>{p.slice(2,-2)}</strong>
      if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i} style={{ background: 'rgba(0,255,209,0.08)', border: '1px solid var(--cyan20)', borderRadius: '3px', padding: '1px 6px', fontFamily: "'Space Mono',monospace", fontSize: '12px', color: 'var(--cyan)' }}>{p.slice(1,-1)}</code>
      if (p === '\n') return <br key={i} />
      return <span key={i}>{p}</span>
    })}</>
  }
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px', gap: '10px', alignItems: 'flex-start' }}>
      {!isUser && (
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          <AgentBadge small />
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        background: isUser ? 'var(--graphite)' : 'var(--carbon)',
        border: isUser ? '1px solid rgba(242,240,236,0.10)' : '1px solid var(--chalk06)',
        borderLeft: isUser ? '1px solid rgba(242,240,236,0.10)' : '2px solid var(--cyan)',
        borderRadius: '4px', padding: '12px 16px',
        fontFamily: "'Space Mono',monospace", fontSize: '13px',
        color: isUser ? 'var(--chalk72)' : 'var(--chalk)',
        lineHeight: '1.85', wordBreak: 'break-word' as const
      }}>
        {renderContent(msg.content)}
      </div>
      {isUser && (
        <div style={{ width: '26px', height: '26px', flexShrink: 0, background: 'var(--graphite)', border: '1px solid var(--chalk12)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: '10px', color: 'var(--chalk42)', marginTop: '2px' }}>TÚ</div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
      <div style={{ flexShrink: 0 }}><AgentBadge small /></div>
      <div style={{ background: 'var(--carbon)', border: '1px solid var(--chalk06)', borderLeft: '2px solid var(--cyan)', borderRadius: '4px', padding: '14px 18px', display: 'flex', gap: '5px', alignItems: 'center' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--cyan60)', animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  { icon: '✉', text: '¿Qué correos y aliases necesito por red social?' },
  { icon: '🔑', text: '¿Cómo creo el System User para Unreal>ille?' },
  { icon: '📱', text: '¿Puedo usar Google Voice para WhatsApp API?' },
  { icon: '🛡', text: '¿Cómo doy acceso sin compartir mi contraseña?' },
  { icon: '🌍', text: '¿Por qué no puedo usar VPN al crear cuentas?' },
  { icon: '⚠', text: '¿Qué hago si me suspenden la cuenta de ads?' },
]

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '40px 24px 0', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '12px' }}><AgentBadge /></div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '32px', letterSpacing: '0.06em', color: 'var(--chalk)', marginBottom: '10px', textAlign: 'center' as const }}>
        ¿EN QUÉ TE AYUDO?
      </div>
      <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: 'italic', fontSize: '13px', color: 'var(--chalk42)', maxWidth: '380px', lineHeight: '1.7', textAlign: 'center' as const, marginBottom: '0' }}>
        Tu guía para crear correctamente la infraestructura digital de tu negocio — Meta, TikTok, WhatsApp Business API y más.
      </div>
      {/* suggestions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '32px', width: '100%', maxWidth: '680px' }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => onSend(s.text)} style={{
            background: 'var(--carbon)', border: '1px solid var(--chalk12)', borderRadius: '4px',
            padding: '12px 14px', fontFamily: "'Space Mono',monospace", fontSize: '11px',
            color: 'var(--chalk42)', cursor: 'pointer', textAlign: 'left' as const,
            lineHeight: '1.55', transition: 'all 0.15s', display: 'flex', gap: '8px', alignItems: 'flex-start'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--cyan20)'; e.currentTarget.style.color='var(--chalk72)'; e.currentTarget.style.background='var(--cyan04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--chalk12)'; e.currentTarget.style.color='var(--chalk42)'; e.currentTarget.style.background='var(--carbon)' }}
          >
            <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function Chat({ token, clientName, onLogout }: { token: string; clientName: string; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return
    setError('')
    const userMsg: Message = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, messages: newMessages })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) { sessionStorage.clear(); onLogout(); return }
        setError(data.error || 'Error al obtener respuesta')
        setLoading(false); return
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch { setError('Error de conexión. Verifica tu internet e intenta de nuevo.') }
    setLoading(false)
  }, [messages, loading, token, onLogout])

  const isEmpty = messages.length === 0

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' as const, background: 'var(--void)' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:600px){
          .suggestions-grid{grid-template-columns:1fr !important;}
          .header-client{display:none !important;}
        }
      `}</style>

      {/* HEADER */}
      <div style={{ background: 'var(--carbon)', borderBottom: '1px solid var(--chalk06)', padding: '0 20px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative' as const }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--cyan)' }} />
        <Logotype />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {clientName && (
            <div className="header-client" style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--chalk20)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
              {clientName}
            </div>
          )}
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid var(--chalk12)', borderRadius: '3px', padding: '5px 11px', fontFamily: "'Space Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--chalk20)', cursor: 'pointer' }}>SALIR</button>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto' as const, padding: '24px 24px 8px', display: 'flex', flexDirection: 'column' as const }}>
        {isEmpty
          ? <EmptyState onSend={sendMessage} />
          : <>
              {messages.map((msg, i) => <div key={i} style={{ animation: 'fadeIn 0.2s ease-out' }}><MessageBubble msg={msg} /></div>)}
              {loading && <TypingIndicator />}
              {error && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', color: 'var(--danger)', padding: '8px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '3px', marginBottom: '12px' }}>✗ {error}</div>}
            </>
        }
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div style={{ flexShrink: 0, padding: '12px 24px 16px', background: 'var(--void)', borderTop: '1px solid var(--chalk06)' }}>
        {/* Input box */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: 'var(--carbon)', border: '1px solid rgba(242,240,236,0.14)', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 0 0 1px rgba(0,255,209,0.06)' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,160)+'px' }}
            onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(input)} }}
            placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para nueva línea)"
            disabled={loading}
            rows={1}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: "'Space Mono',monospace", fontSize: '13px', color: 'var(--chalk72)', lineHeight: '1.7', resize: 'none' as const, overflowY: 'hidden' as const, caretColor: 'var(--cyan)', minHeight: '22px' }}
          />
          {/* SEND BUTTON — high contrast */}
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim() ? 'rgba(242,240,236,0.06)' : 'var(--cyan)',
            border: loading || !input.trim() ? '1px solid var(--chalk12)' : '1px solid var(--cyan)',
            borderRadius: '6px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            flexShrink: 0, transition: 'all 0.15s',
            color: loading || !input.trim() ? 'var(--chalk20)' : '#080808',
            fontSize: '16px', fontWeight: 700
          }}>↑</button>
        </div>

        {/* Hints inline — solo estado vacío */}
        {isEmpty && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
            {SUGGESTIONS.slice(0,4).map((s, i) => (
              <button key={i} onClick={() => sendMessage(s.text)} style={{
                background: 'none', border: '1px solid var(--chalk06)', borderRadius: '20px',
                padding: '4px 12px', fontFamily: "'Space Mono',monospace", fontSize: '10px',
                color: 'var(--chalk20)', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' as const
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--cyan20)'; e.currentTarget.style.color='var(--cyan60)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--chalk06)'; e.currentTarget.style.color='var(--chalk20)' }}
              >{s.text}</button>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '8px', fontFamily: "'Space Mono',monospace", fontSize: '9px', color: 'var(--chalk12)', letterSpacing: '0.08em' }}>
          UNREAL&gt;ILLE · USO INTERNO · INFORMACIÓN OPERATIVA CONFIDENCIAL
        </div>
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState<{token:string;clientName:string}|null>(null)
  return session
    ? <Chat token={session.token} clientName={session.clientName} onLogout={() => { sessionStorage.clear(); setSession(null) }} />
    : <TokenGate onAccess={(t, c) => setSession({token:t,clientName:c})} />
}
