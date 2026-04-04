import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '../../store/agentStore';
import { getBrand } from '../../config/brands';
import { resolvePromptVariables } from '../../services/agentEngine';
import {
  Button, Card, Input, SectionHeader, Badge, Divider,
} from '../../ui/components';
import { CHANNEL_LABELS, STATUS_LABELS } from '../../config/presets';

// ── Claude server-side call — replaces geminiService.ts ──────────────────────
async function callTestChat(params: {
  systemPrompt: string;
  agentName: string;
  messages: Array<{ role: string; content: string }>;
}): Promise<string> {
  const res = await fetch('/api/test-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.reply ?? '';
}

export function TestMode() {
  const {
    agents, testSession, selectedAgentId,
    startTestSession, endTestSession, addTestMessage, setTestTyping,
    dbVariables,
  } = useAgentStore();

  const agent = agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? null;
  const [input, setInput] = useState('');
  const [selectedTestAgent, setSelectedTestAgent] = useState<string>(agent?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testSession?.messages]);

  const resolvedAgent = agents.find((a) => a.id === selectedTestAgent);

  const buildResolvedPrompt = (agentId: string) => {
    const a = agents.find((ag) => ag.id === agentId);
    if (!a) return '';
    const varMap: Record<string, string> = {};
    dbVariables.forEach((v) => {
      if (v.brandId === 'global' || v.brandId === a.brandId) {
        varMap[v.key] = v.value;
      }
    });
    return resolvePromptVariables(a.systemPrompt, varMap);
  };

  const handleStart = () => {
    if (!selectedTestAgent) return;
    startTestSession(selectedTestAgent);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !testSession || !resolvedAgent) return;

    const userMsg = trimmed;
    setInput('');
    setError(null);
    addTestMessage('user', userMsg);
    setTestTyping(true);

    try {
      const systemPrompt = buildResolvedPrompt(resolvedAgent.id) || resolvedAgent.systemPrompt;

      // Convert testSession messages to API format
      const history = testSession.messages
        .filter(m => m.role !== 'agent' || !m.content.includes('listo para ser probado'))
        .slice(-10)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      const response = await callTestChat({
        systemPrompt,
        agentName: resolvedAgent.name,
        messages: [...history, { role: 'user', content: userMsg }],
      });

      setTestTyping(false);
      addTestMessage('agent', response);
    } catch (err: any) {
      setTestTyping(false);
      setError(err.message || 'Error al procesar el mensaje');
      addTestMessage('agent', '⚠️ Error al conectar con el modelo. Intenta de nuevo.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const brand = resolvedAgent ? getBrand(resolvedAgent.brandId) : null;

  return (
    <div className="p-6 max-w-5xl">
      <SectionHeader
        title="Test Mode"
        subtitle="Simula una conversación con tu agente antes de publicar"
        accent="#FFAB00"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* Agent Select */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Agente a Probar</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {agents.length === 0 ? (
                <p className="text-xs text-white/40">No hay agentes configurados.</p>
              ) : (
                agents.map((a) => {
                  const b = getBrand(a.brandId);
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedTestAgent(a.id); endTestSession(); setError(null); }}
                      className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                        selectedTestAgent === a.id
                          ? 'bg-[#FFAB00]/10 border-[#FFAB00]/40'
                          : 'bg-white/3 border-white/8 hover:bg-white/6'
                      }`}
                    >
                      <span className="text-xl">{b.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{a.name}</p>
                        <p className="text-xs text-white/40">{CHANNEL_LABELS[a.channel]}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Agent Info */}
          {resolvedAgent && brand && (
            <Card className="p-4" accent={brand.color}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{brand.emoji}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{resolvedAgent.name}</h4>
                  <p className="text-xs text-white/50">{brand.name}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                <Badge variant="default">{CHANNEL_LABELS[resolvedAgent.channel]}</Badge>
                <Badge variant={resolvedAgent.status === 'active' ? 'success' : 'warning'}>
                  {STATUS_LABELS[resolvedAgent.status]}
                </Badge>
              </div>
              {/* Engine badge — Claude */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide">Claude Sonnet 4 · Server-side</span>
              </div>
              {resolvedAgent.systemPrompt ? (
                <div>
                  <p className="text-xs text-white/50 font-medium mb-1">Prompt (resuelto):</p>
                  <p className="text-xs text-white/40 font-mono line-clamp-4">
                    {buildResolvedPrompt(resolvedAgent.id) || resolvedAgent.systemPrompt}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-yellow-400/70">⚠️ Sin prompt configurado</p>
              )}
            </Card>
          )}

          {/* Quick prompts */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Mensajes de Prueba</h3>
            <div className="space-y-1.5">
              {[
                'Hola',
                '¿Cuáles son sus productos?',
                '¿Cuánto cuesta?',
                'Quiero hacer un pedido',
                'Necesito hablar con alguien',
                '¿Cuáles son sus horarios?',
                'Gracias',
              ].map((msg) => (
                <button
                  key={msg}
                  onClick={() => { setInput(msg); inputRef.current?.focus(); }}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/4 text-white/60 hover:bg-white/8 hover:text-white transition-all"
                >
                  {msg}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="xl:col-span-2">
          <Card className="flex flex-col overflow-hidden" style={{ height: '75vh' }}>
            {/* Chat Header */}
            <div
              className="p-4 border-b border-white/8 flex items-center justify-between flex-shrink-0"
              style={brand ? { borderBottomColor: `${brand.color}20` } : undefined}
            >
              <div className="flex items-center gap-3">
                {brand ? (
                  <>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${brand.color}20` }}
                    >
                      {brand.emoji}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{resolvedAgent?.name ?? 'Agente'}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-xs text-white/40">En prueba · Claude</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-white/40 text-sm">Selecciona un agente</span>
                )}
              </div>
              <div className="flex gap-2">
                {testSession ? (
                  <Button variant="danger" size="xs" onClick={endTestSession}>
                    ⏹ Finalizar
                  </Button>
                ) : (
                  <Button size="xs" onClick={handleStart} disabled={!selectedTestAgent}>
                    ▶ Iniciar Test
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!testSession ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4 opacity-20">🤖</div>
                    <p className="text-white/30 text-sm">
                      {selectedTestAgent
                        ? 'Presiona "Iniciar Test" para comenzar la simulación'
                        : 'Selecciona un agente para empezar'}
                    </p>
                    {selectedTestAgent && (
                      <Button className="mt-4" size="sm" onClick={handleStart}>
                        ▶ Iniciar Test
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center">
                    <Divider className="flex-1" />
                    <span className="text-xs text-white/30 px-2">Sesión de prueba iniciada</span>
                    <Divider className="flex-1" />
                  </div>

                  <AnimatePresence initial={false}>
                    {testSession.messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role !== 'user' && (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1"
                            style={brand ? { backgroundColor: `${brand.color}20` } : undefined}
                          >
                            {brand?.emoji ?? '🤖'}
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-white/10 text-white rounded-tr-sm'
                              : 'rounded-tl-sm border'
                          }`}
                          style={
                            msg.role !== 'user' && brand
                              ? {
                                  backgroundColor: `${brand.color}12`,
                                  borderColor: `${brand.color}30`,
                                  color: 'rgba(255,255,255,0.9)',
                                }
                              : undefined
                          }
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs opacity-40 mt-1.5 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1">
                            👤
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {testSession.isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                          style={brand ? { backgroundColor: `${brand.color}20` } : undefined}
                        >
                          {brand?.emoji ?? '🤖'}
                        </div>
                        <div
                          className="px-4 py-3 rounded-2xl rounded-tl-sm border flex gap-1 items-center"
                          style={
                            brand
                              ? { backgroundColor: `${brand.color}12`, borderColor: `${brand.color}30` }
                              : { backgroundColor: 'rgba(255,255,255,0.06)' }
                          }
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error banner */}
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                      ⚠️ {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/8 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={testSession ? 'Escribe un mensaje...' : 'Inicia una sesión para chatear'}
                  disabled={!testSession || testSession.isTyping}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFAB00]/50 transition-all disabled:opacity-50"
                />
                <Button
                  onClick={() => void handleSend()}
                  disabled={!testSession || !input.trim() || testSession.isTyping}
                  className="px-4"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </Button>
              </div>
              {testSession && (
                <p className="text-xs text-white/25 mt-2 text-center">
                  Enter para enviar · {testSession.messages.length - 1} mensajes en esta sesión
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
