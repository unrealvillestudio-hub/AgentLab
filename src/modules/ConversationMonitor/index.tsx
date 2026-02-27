import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '../../store/agentStore';
import {
  Card, SectionHeader, EmptyState, MetricCard,
  StatusDot,
} from '../../ui/components';
import type { Conversation, ConversationStatus } from '../../core/types';

export function ConversationMonitor() {
  const {
    agents, conversations, selectedAgentId, selectedConversationId,
    loadMockConversations, setSelectedConversation, updateConversationStatus,
  } = useAgentStore();

  const agent = agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? null;

  useEffect(() => {
    if (agent) loadMockConversations(agent.id);
  }, [agent?.id]);

  const agentConvs = agent
    ? conversations.filter((c) => c.agentId === agent.id)
    : conversations;

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredConvs = agentConvs.filter((c) =>
    filterStatus === 'all' || c.status === filterStatus
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversationId);

  // Metrics
  const totalConvs = agentConvs.length;
  const activeConvs = agentConvs.filter((c) => c.status === 'active').length;
  const waitingConvs = agentConvs.filter((c) => c.status === 'waiting').length;
  const handoffConvs = agentConvs.filter((c) => c.status === 'handoff').length;
  const resolvedConvs = agentConvs.filter((c) => c.resolved);
  const resolutionRate = totalConvs > 0 ? Math.round((resolvedConvs.length / totalConvs) * 100) : 0;

  if (!agent && agents.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon="📊" title="Sin agentes" description="Crea un agente para ver conversaciones." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl">
      <SectionHeader
        title="Monitor de Conversaciones"
        subtitle={agent ? agent.name : 'Todos los agentes'}
        accent="#FFAB00"
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Total" value={totalConvs} icon="💬" />
        <MetricCard label="Activas" value={activeConvs} icon="🟢" color="#22C55E" trend="neutral" />
        <MetricCard label="Esperando" value={waitingConvs} icon="⏳" color="#F59E0B" />
        <MetricCard label="Transferidas" value={handoffConvs} icon="🤝" color="#A855F7" />
        <MetricCard label="Resolución" value={`${resolutionRate}%`} icon="✅" color="#FFAB00" trend="up" />
      </div>

      <div className="flex gap-3">
        {/* Conversations List */}
        <div className="w-80 flex-shrink-0">
          <Card className="overflow-hidden">
            {/* Filter */}
            <div className="p-3 border-b border-white/8">
              <div className="flex gap-1 flex-wrap">
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'active', label: 'Activas' },
                  { value: 'waiting', label: 'Espera' },
                  { value: 'handoff', label: 'Transfer.' },
                  { value: 'closed', label: 'Cerradas' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilterStatus(f.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      filterStatus === f.value
                        ? 'bg-[#FFAB00] text-[#050508]'
                        : 'bg-white/6 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {f.label}
                    {f.value !== 'all' && (
                      <span className="ml-1 opacity-70">
                        {agentConvs.filter((c) => c.status === f.value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="p-6 text-center text-white/40 text-sm">
                  No hay conversaciones {filterStatus !== 'all' ? `con estado "${filterStatus}"` : ''}
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={conv.id === selectedConversationId}
                    onClick={() => setSelectedConversation(conv.id)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Conversation Detail */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {selectedConv ? (
              <motion.div
                key={selectedConv.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <ConversationDetail
                  conversation={selectedConv}
                  onStatusChange={(status) => updateConversationStatus(selectedConv.id, status)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="p-12 text-center">
                  <div className="text-4xl mb-3 opacity-30">💬</div>
                  <p className="text-white/40 text-sm">Selecciona una conversación para ver el detalle</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────
function ConversationListItem({
  conversation, isSelected, onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const lastMsg = conversation.messages[conversation.messages.length - 1];
  const timeAgo = formatTimeAgo(conversation.lastMessageAt);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-white/5 transition-all ${
        isSelected ? 'bg-[#FFAB00]/8' : 'hover:bg-white/4'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-semibold text-white/70 flex-shrink-0">
          {conversation.contact.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-medium text-white truncate">{conversation.contact.name}</span>
            <span className="text-xs text-white/30 flex-shrink-0 ml-2">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <StatusDot status={conversation.status} />
          </div>
          {lastMsg && (
            <p className="text-xs text-white/40 truncate">
              {lastMsg.role === 'agent' ? '🤖 ' : '👤 '}{lastMsg.content}
            </p>
          )}
          {conversation.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {conversation.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-white/6 text-white/40 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Conversation Detail ──────────────────────────────────────────────────────
function ConversationDetail({
  conversation, onStatusChange,
}: {
  conversation: Conversation;
  onStatusChange: (status: ConversationStatus) => void;
}) {
  return (
    <Card className="overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 280px)' }}>
      {/* Header */}
      <div className="p-4 border-b border-white/8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFAB00]/20 to-[#FFAB00]/5 flex items-center justify-center text-sm font-bold text-[#FFAB00]">
            {conversation.contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{conversation.contact.name}</h3>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>{conversation.contact.phone}</span>
              <span>·</span>
              <span>{formatChannelLabel(conversation.channel)}</span>
              <span>·</span>
              <StatusDot status={conversation.status} label={conversation.status} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(['active', 'waiting', 'handoff', 'closed'] as ConversationStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                conversation.status === s
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:bg-white/8 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-white/8 text-white/90 rounded-tl-sm'
                  : msg.role === 'agent'
                  ? 'bg-[#FFAB00]/15 text-white rounded-tr-sm border border-[#FFAB00]/20'
                  : 'bg-white/4 text-white/40 text-xs italic'
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>
              <p className="text-xs opacity-50 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span>📅 Iniciado: {new Date(conversation.startedAt).toLocaleString('es-ES')}</span>
          <span>·</span>
          <span>{conversation.messages.length} mensajes</span>
          {conversation.satisfaction !== null && (
            <>
              <span>·</span>
              <span>⭐ {conversation.satisfaction}/5</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatChannelLabel(channel: string): string {
  const map: Record<string, string> = { whatsapp: 'WhatsApp', webchat: 'Web Chat', voice: 'Voz' };
  return map[channel] ?? channel;
}
