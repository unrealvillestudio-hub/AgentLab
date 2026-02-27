import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '../../store/agentStore';
import { getBrand } from '../../config/brands';
import {
  Button, Card, Input, Textarea, Select, SectionHeader,
  EmptyState, Badge, Modal,
} from '../../ui/components';
import type { DBVariable, DBVarCategory, BrandId } from '../../core/types';
import { BRANDS } from '../../config/brands';

export function PromptManager() {
  const {
    agents, dbVariables, selectedAgentId, updateAgent,
    addDbVariable, updateDbVariable, deleteDbVariable,
  } = useAgentStore();

  const agent = agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? null;

  const [prompt, setPrompt] = useState(agent?.systemPrompt ?? '');
  const [activeTab, setActiveTab] = useState<'prompt' | 'variables'>('prompt');
  const [showAddVar, setShowAddVar] = useState(false);
  const [editVar, setEditVar] = useState<DBVariable | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!agent) {
    return (
      <div className="p-6">
        <EmptyState icon="📝" title="Sin agente seleccionado" description="Selecciona un agente para gestionar su prompt y variables." />
      </div>
    );
  }

  const brand = getBrand(agent.brandId);

  const handleSave = () => {
    updateAgent(agent.id, { systemPrompt: prompt });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const insertVariable = (key: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const snippet = `{{${key}}}`;
    const newPrompt = prompt.substring(0, start) + snippet + prompt.substring(end);
    setPrompt(newPrompt);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  const filteredVars = dbVariables.filter((v) => {
    if (filterCategory !== 'all' && v.category !== filterCategory) return false;
    if (filterBrand !== 'all' && v.brandId !== filterBrand) return false;
    return true;
  });

  const categoryColors: Record<DBVarCategory, string> = {
    persona: '#A855F7',
    brand: '#3B82F6',
    product: '#22C55E',
    tone: '#F59E0B',
    contact: '#EC4899',
    custom: '#6B7280',
  };

  const charCount = prompt.length;
  const tokenEst = Math.round(charCount / 4);

  return (
    <div className="p-6 max-w-7xl">
      <SectionHeader
        title="Prompt Manager"
        subtitle={agent.name}
        accent={brand.color}
        action={
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'prompt' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('prompt')}
            >
              📝 Prompt
            </Button>
            <Button
              variant={activeTab === 'variables' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('variables')}
            >
              🗄️ DB Variables ({dbVariables.length})
            </Button>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {activeTab === 'prompt' ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Editor */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">System Prompt</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white/30">
                      {charCount} chars · ~{tokenEst} tokens
                    </span>
                    <Button size="sm" onClick={handleSave}>
                      {saved ? '✓ Guardado' : '💾 Guardar'}
                    </Button>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={20}
                  placeholder={`Eres {{AGENT_NAME}}, asistente virtual de {{BRAND_NAME}}...\n\nPersonalidad: {{BRAND_TONE}}\n\nCapacidades:\n- ...\n\nReglas:\n- ...`}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 font-mono placeholder-white/20 focus:outline-none focus:border-[#FFAB00]/50 transition-all resize-none leading-relaxed"
                />
              </Card>

              {/* Preview resolved */}
              {prompt && (
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-white/60 mb-2">Vista Previa — Variables Resueltas</h3>
                  <div className="bg-black/20 rounded-lg p-4 text-xs font-mono text-white/60 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {prompt.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
                      const v = dbVariables.find((d) => d.key === key);
                      return v ? `[${v.value || key}]` : `[${key}]`;
                    })}
                  </div>
                </Card>
              )}
            </div>

            {/* Variables Panel */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Variables Disponibles</h3>
                <p className="text-xs text-white/40 mb-4">
                  Haz clic en una variable para insertarla en el prompt en la posición del cursor.
                </p>

                {/* Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full mb-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="persona">Persona</option>
                  <option value="brand">Marca</option>
                  <option value="product">Producto</option>
                  <option value="tone">Tono</option>
                  <option value="contact">Contacto</option>
                  <option value="custom">Custom</option>
                </select>

                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {dbVariables
                    .filter((v) => filterCategory === 'all' || v.category === filterCategory)
                    .filter((v) => v.brandId === 'global' || v.brandId === agent.brandId)
                    .map((v) => (
                      <VariableChip
                        key={v.id}
                        variable={v}
                        color={categoryColors[v.category]}
                        onInsert={() => insertVariable(v.key)}
                      />
                    ))}
                </div>
              </Card>

              {/* Tips */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-white/60 mb-3">💡 Tips de Prompting</h3>
                <div className="space-y-2 text-xs text-white/50">
                  <p>• Define un <strong className="text-white/70">rol claro</strong>: quién es el agente y para qué existe.</p>
                  <p>• Lista las <strong className="text-white/70">capacidades</strong> explícitamente.</p>
                  <p>• Establece <strong className="text-white/70">límites</strong>: qué no debe responder.</p>
                  <p>• Incluye el <strong className="text-white/70">tono</strong> y ejemplos de respuesta si aplica.</p>
                  <p>• Para WhatsApp: respuestas cortas, <strong className="text-white/70">máx. 3 oraciones</strong>.</p>
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="variables"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* DB Variables */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="persona">Persona</option>
                  <option value="brand">Marca</option>
                  <option value="product">Producto</option>
                  <option value="tone">Tono</option>
                  <option value="contact">Contacto</option>
                  <option value="custom">Custom</option>
                </select>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="all">Todas las marcas</option>
                  <option value="global">Global</option>
                  {BRANDS.map((b) => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
                </select>
              </div>
              <Button size="sm" onClick={() => setShowAddVar(true)}>
                + Nueva Variable
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredVars.map((v) => (
                <DBVariableCard
                  key={v.id}
                  variable={v}
                  color={categoryColors[v.category]}
                  onEdit={() => setEditVar(v)}
                  onDelete={() => deleteDbVariable(v.id)}
                />
              ))}
              {filteredVars.length === 0 && (
                <div className="col-span-full py-12 text-center text-white/40 text-sm">
                  No hay variables con los filtros seleccionados.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Variable Modal */}
      <DBVariableModal
        open={showAddVar}
        variable={null}
        onClose={() => setShowAddVar(false)}
        onSave={(data) => {
          addDbVariable(data);
          setShowAddVar(false);
        }}
      />

      {/* Edit Variable Modal */}
      {editVar && (
        <DBVariableModal
          open={!!editVar}
          variable={editVar}
          onClose={() => setEditVar(null)}
          onSave={(data) => {
            updateDbVariable(editVar.id, data);
            setEditVar(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Variable Chip ────────────────────────────────────────────────────────────
function VariableChip({
  variable, color, onInsert,
}: { variable: DBVariable; color: string; onInsert: () => void }) {
  return (
    <button
      onClick={onInsert}
      className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-white/6 transition-colors group"
      title={variable.description}
    >
      <code
        className="text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {`{{${variable.key}}}`}
      </code>
      <span className="text-xs text-white/40 truncate group-hover:text-white/60 transition-colors">
        {variable.value || variable.description || variable.key}
      </span>
    </button>
  );
}

// ─── DB Variable Card ─────────────────────────────────────────────────────────
function DBVariableCard({
  variable, color, onEdit, onDelete,
}: { variable: DBVariable; color: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="p-4" accent={color}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <code
            className="text-xs px-1.5 py-0.5 rounded font-mono"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {`{{${variable.key}}}`}
          </code>
          <Badge
            variant="custom"
            color={color}
          >
            {variable.category}
          </Badge>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1 text-white/30 hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-1 text-white/30 hover:text-red-400 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-sm text-white/80 font-mono truncate mb-1">
        {variable.value || <em className="text-white/30 not-italic">Sin valor</em>}
      </p>
      {variable.description && (
        <p className="text-xs text-white/40">{variable.description}</p>
      )}
      <p className="text-xs text-white/25 mt-1.5">
        {variable.brandId === 'global' ? '🌐 Global' : `🏷️ ${variable.brandId}`}
      </p>
    </Card>
  );
}

// ─── DB Variable Modal ────────────────────────────────────────────────────────
interface DBVariableModalProps {
  open: boolean;
  variable: DBVariable | null;
  onClose: () => void;
  onSave: (data: Omit<DBVariable, 'id'>) => void;
}

function DBVariableModal({ open, variable, onClose, onSave }: DBVariableModalProps) {
  const [key, setKey] = useState(variable?.key ?? '');
  const [value, setValue] = useState(variable?.value ?? '');
  const [brandId, setBrandId] = useState<string>(variable?.brandId ?? 'global');
  const [category, setCategory] = useState<DBVarCategory>(variable?.category ?? 'custom');
  const [description, setDescription] = useState(variable?.description ?? '');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={variable ? 'Editar Variable' : 'Nueva Variable'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => onSave({ key: key.toUpperCase(), value, brandId: brandId as BrandId | 'global', category, description })}
            disabled={!key.trim()}
          >
            {variable ? 'Guardar' : 'Crear'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Clave (KEY)"
          placeholder="AGENT_NAME"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase().replace(/\s/g, '_'))}
          hint="Se usará como {{KEY}} en el prompt"
        />
        <Textarea
          label="Valor"
          placeholder="Valor de la variable..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
        <Select
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value as DBVarCategory)}
          options={[
            { value: 'persona', label: 'Persona' },
            { value: 'brand', label: 'Marca' },
            { value: 'product', label: 'Producto' },
            { value: 'tone', label: 'Tono' },
            { value: 'contact', label: 'Contacto' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
        <Select
          label="Marca"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          options={[
            { value: 'global', label: '🌐 Global (todas las marcas)' },
            ...BRANDS.map((b) => ({ value: b.id, label: `${b.emoji} ${b.name}` })),
          ]}
        />
        <Input
          label="Descripción"
          placeholder="Para qué sirve esta variable..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  );
}
