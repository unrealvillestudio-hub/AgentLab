import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '../../store/agentStore';
import { BRANDS, getBrand } from '../../config/brands';
import { AGENT_TEMPLATES, CHANNEL_LABELS, STATUS_LABELS } from '../../config/presets';
import {
  Button, Card, Badge, Modal, Input, Select, Textarea,
  SectionHeader, StatusDot, EmptyState,
} from '../../ui/components';
import type { Agent, BrandId, ChannelType } from '../../core/types';

export function AgentBuilder() {
  const {
    agents, addAgent, updateAgent, deleteAgent, duplicateAgent,
    setActiveModule, setSelectedAgent, addFlow,
  } = useAgentStore();

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Agent | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = agents.filter((a) => {
    if (filterBrand !== 'all' && a.brandId !== filterBrand) return false;
    if (filterChannel !== 'all' && a.channel !== filterChannel) return false;
    return true;
  });

  const handleOpenAgent = (agent: Agent) => {
    setSelectedAgent(agent.id);
    setActiveModule('prompts');
  };

  const handleOpenFlow = (agent: Agent) => {
    setSelectedAgent(agent.id);
    // Create flow if not exists
    const store = useAgentStore.getState();
    let flow = store.flows.find((f) => f.agentId === agent.id);
    if (!flow) {
      flow = addFlow(agent.id);
      updateAgent(agent.id, { flowId: flow.id });
    }
    useAgentStore.getState().setSelectedFlow(flow.id);
    setActiveModule('flow');
  };

  const handleOpenTest = (agent: Agent) => {
    setSelectedAgent(agent.id);
    setActiveModule('test');
  };

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <SectionHeader
        title="Agentes"
        subtitle={`${agents.length} agente${agents.length !== 1 ? 's' : ''} configurado${agents.length !== 1 ? 's' : ''}`}
        accent="#FFAB00"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowTemplates(true)}>
              🗂️ Plantillas
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + Nuevo Agente
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFAB00]/60 transition-all"
        >
          <option value="all">Todas las marcas</option>
          {BRANDS.map((b) => (
            <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
          ))}
        </select>
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFAB00]/60 transition-all"
        >
          <option value="all">Todos los canales</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="webchat">Web Chat</option>
          <option value="voice">Voz</option>
        </select>
      </div>

      {/* Agent Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🤖"
          title="Sin agentes"
          description="Crea tu primer agente conversacional o elige una plantilla para empezar."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowTemplates(true)}>Ver Plantillas</Button>
              <Button onClick={() => setShowCreate(true)}>Crear Agente</Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={() => setShowEdit(agent)}
                onDelete={() => setConfirmDelete(agent.id)}
                onDuplicate={() => duplicateAgent(agent.id)}
                onOpenPrompt={() => handleOpenAgent(agent)}
                onOpenFlow={() => handleOpenFlow(agent)}
                onTest={() => handleOpenTest(agent)}
                onToggleStatus={() =>
                  updateAgent(agent.id, {
                    status: agent.status === 'active' ? 'paused' : 'active',
                  })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <CreateAgentModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(brandId, name, channel, description) => {
          addAgent(brandId, { name, channel, description });
          setShowCreate(false);
        }}
      />

      {/* Edit Modal */}
      {showEdit && (
        <EditAgentModal
          open={!!showEdit}
          agent={showEdit}
          onClose={() => setShowEdit(null)}
          onSave={(updates) => {
            updateAgent(showEdit.id, updates);
            setShowEdit(null);
          }}
        />
      )}

      {/* Templates Modal */}
      <TemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={(templateId, brandId) => {
          const tpl = AGENT_TEMPLATES.find((t) => t.id === templateId);
          if (!tpl) return;
          const brand = getBrand(brandId as BrandId);
          addAgent(brandId, {
            name: `${tpl.name} — ${brand.name}`,
            description: tpl.description,
            channel: tpl.channel,
            systemPrompt: tpl.systemPromptTemplate,
            tags: tpl.tags,
          });
          setShowTemplates(false);
        }}
      />

      {/* Confirm Delete */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Eliminar Agente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { deleteAgent(confirmDelete!); setConfirmDelete(null); }}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-white/70 text-sm">
          ¿Estás seguro? Se eliminarán el agente, su flujo y su historial de conversaciones. Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
interface AgentCardProps {
  agent: Agent;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onOpenPrompt: () => void;
  onOpenFlow: () => void;
  onTest: () => void;
  onToggleStatus: () => void;
}

function AgentCard({
  agent, onEdit, onDelete, onDuplicate, onOpenPrompt, onOpenFlow, onTest, onToggleStatus,
}: AgentCardProps) {
  const brand = getBrand(agent.brandId);
  const [menuOpen, setMenuOpen] = useState(false);

  const channelIcon: Record<ChannelType, string> = {
    whatsapp: '💬',
    webchat: '🌐',
    voice: '🎙️',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card
        className="p-5 relative overflow-hidden"
        accent={brand.color}
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: brand.color }} />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{brand.emoji}</span>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight">{agent.name}</h3>
              <span className="text-xs text-white/40">{brand.name}</span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-[#0d0d14] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    {[
                      { label: '✏️ Editar', action: onEdit },
                      { label: '📋 Duplicar', action: onDuplicate },
                      { label: '🔀 Flujo', action: onOpenFlow },
                      { label: '🧪 Probar', action: onTest },
                      { label: agent.status === 'active' ? '⏸️ Pausar' : '▶️ Activar', action: onToggleStatus },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { item.action(); setMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-white/8" />
                    <button
                      onClick={() => { onDelete(); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <p className="text-xs text-white/50 mb-3 line-clamp-2">{agent.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="default">
            {channelIcon[agent.channel]} {CHANNEL_LABELS[agent.channel]}
          </Badge>
          <StatusDot
            status={agent.status}
            label={STATUS_LABELS[agent.status]}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/3 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold font-mono text-white">{agent.metrics.totalConversations}</div>
            <div className="text-xs text-white/40">Convs.</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold font-mono" style={{ color: '#22C55E' }}>
              {Math.round(agent.metrics.resolutionRate * 100)}%
            </div>
            <div className="text-xs text-white/40">Resoluc.</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold font-mono text-white">{agent.metrics.avgResponseTime}s</div>
            <div className="text-xs text-white/40">Resp. avg</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="xs" onClick={onOpenPrompt} className="flex-1">
            Prompt
          </Button>
          <Button variant="secondary" size="xs" onClick={onOpenFlow} className="flex-1">
            Flujo
          </Button>
          <Button size="xs" onClick={onTest} className="flex-1">
            🧪 Test
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (brandId: string, name: string, channel: ChannelType, description: string) => void;
}

function CreateAgentModal({ open, onClose, onCreate }: CreateModalProps) {
  const [brandId, setBrandId] = useState<string>('unrealille-studio');
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<ChannelType>('whatsapp');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(brandId, name.trim(), channel, description.trim());
    setName(''); setDescription('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear Nuevo Agente"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Crear Agente</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Marca"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          options={BRANDS.map((b) => ({ value: b.id, label: `${b.emoji} ${b.name}` }))}
        />
        <Input
          label="Nombre del Agente"
          placeholder="ej. Asistente de Ventas D7"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select
          label="Canal"
          value={channel}
          onChange={(e) => setChannel(e.target.value as ChannelType)}
          options={[
            { value: 'whatsapp', label: '💬 WhatsApp' },
            { value: 'webchat', label: '🌐 Web Chat' },
            { value: 'voice', label: '🎙️ Voz' },
          ]}
        />
        <Textarea
          label="Descripción (opcional)"
          placeholder="¿Para qué sirve este agente?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
    </Modal>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps {
  open: boolean;
  agent: Agent;
  onClose: () => void;
  onSave: (updates: Partial<Agent>) => void;
}

function EditAgentModal({ open, agent, onClose, onSave }: EditModalProps) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [channel, setChannel] = useState<ChannelType>(agent.channel);
  const [tags, setTags] = useState(agent.tags.join(', '));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Agente"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave({ name, description, channel, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Select
          label="Canal"
          value={channel}
          onChange={(e) => setChannel(e.target.value as ChannelType)}
          options={[
            { value: 'whatsapp', label: '💬 WhatsApp' },
            { value: 'webchat', label: '🌐 Web Chat' },
            { value: 'voice', label: '🎙️ Voz' },
          ]}
        />
        <Input label="Tags (separados por coma)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ventas, soporte, clientes" />
      </div>
    </Modal>
  );
}

// ─── Templates Modal ──────────────────────────────────────────────────────────
interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string, brandId: string) => void;
}

function TemplatesModal({ open, onClose, onSelect }: TemplatesModalProps) {
  const [selectedTpl, setSelectedTpl] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('unrealille-studio');

  return (
    <Modal open={open} onClose={onClose} title="Plantillas de Agentes" width="max-w-2xl">
      <div className="grid grid-cols-2 gap-3 mb-5 max-h-72 overflow-y-auto pr-1">
        {AGENT_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => setSelectedTpl(tpl.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selectedTpl === tpl.id
                ? 'bg-[#FFAB00]/10 border-[#FFAB00]/50'
                : 'bg-white/4 border-white/8 hover:bg-white/6'
            }`}
          >
            <div className="text-2xl mb-2">{tpl.emoji}</div>
            <div className="text-sm font-semibold text-white mb-1">{tpl.name}</div>
            <div className="text-xs text-white/50">{tpl.description}</div>
            <div className="flex gap-1 mt-2">
              <Badge variant="default">{CHANNEL_LABELS[tpl.channel]}</Badge>
            </div>
          </button>
        ))}
      </div>
      {selectedTpl && (
        <div className="space-y-3">
          <Select
            label="Asignar a marca"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            options={BRANDS.map((b) => ({ value: b.id, label: `${b.emoji} ${b.name}` }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => onSelect(selectedTpl, selectedBrand)}>
              Crear desde Plantilla
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
