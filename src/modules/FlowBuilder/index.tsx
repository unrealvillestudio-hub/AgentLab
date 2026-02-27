import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '../../store/agentStore';
import { getBrand } from '../../config/brands';
import { NODE_TYPE_LABELS, NODE_TYPE_COLORS, STARTER_FLOW_NODES } from '../../config/presets';
import {
  Button, Card, Modal, Input, Select, Textarea, SectionHeader,
  EmptyState, Badge,
} from '../../ui/components';
import type { FlowNode, FlowNodeType, FlowCondition } from '../../core/types';

export function FlowBuilder() {
  const {
    agents, flows, selectedAgentId, selectedFlowId,
    setSelectedFlow, addFlow, updateFlow, updateAgent,
    addFlowNode, updateFlowNode, deleteFlowNode,
  } = useAgentStore();

  const agent = agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? null;
  const agentFlows = flows.filter((f) => f.agentId === (agent?.id ?? ''));
  const activeFlow = flows.find((f) => f.id === selectedFlowId) ?? agentFlows[0] ?? null;

  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showFlowList, setShowFlowList] = useState(false);

  if (!agent) {
    return (
      <div className="p-6">
        <EmptyState icon="🔀" title="Sin agente seleccionado" description="Selecciona un agente en la sección Agentes para gestionar sus flujos." />
      </div>
    );
  }

  const brand = getBrand(agent.brandId);

  const handleCreateFlow = () => {
    const flow = addFlow(agent.id);
    updateAgent(agent.id, { flowId: flow.id });
    setSelectedFlow(flow.id);
  };

  const handleLoadStarterFlow = () => {
    if (!activeFlow) return;
    const newNodes: FlowNode[] = STARTER_FLOW_NODES.map((n, i) => ({
      ...n,
      id: `node-${Date.now()}-${i}`,
    }));
    updateFlow(activeFlow.id, {
      nodes: newNodes,
      entryNodeId: newNodes[0]?.id ?? null,
    });
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    if (!activeFlow) return;
    updateFlowNode(activeFlow.id, nodeId, updates);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!activeFlow) return;
    deleteFlowNode(activeFlow.id, nodeId);
  };

  const handleAddNode = (nodeData: Omit<FlowNode, 'id'>) => {
    if (!activeFlow) return;
    const node = addFlowNode(activeFlow.id, nodeData);
    if (activeFlow.nodes.length === 0) {
      updateFlow(activeFlow.id, { entryNodeId: node.id });
    }
    setShowAddNode(false);
  };

  const sortedNodes = activeFlow ? [...activeFlow.nodes].sort((a, b) => a.position - b.position) : [];

  return (
    <div className="p-6 max-w-5xl">
      <SectionHeader
        title="Flow Builder"
        subtitle={agent.name}
        accent={brand.color}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFlowList(true)}>
              📋 Flujos ({agentFlows.length})
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCreateFlow}>
              + Nuevo Flujo
            </Button>
          </div>
        }
      />

      {!activeFlow ? (
        <EmptyState
          icon="🔀"
          title="Sin flujo activo"
          description="Crea un flujo de conversación para este agente."
          action={<Button onClick={handleCreateFlow}>Crear Flujo</Button>}
        />
      ) : (
        <>
          {/* Flow header */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{activeFlow.name}</h3>
                <p className="text-xs text-white/50 mt-0.5">{activeFlow.description || 'Sin descripción'}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="default">{sortedNodes.length} nodos</Badge>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={handleLoadStarterFlow}
                >
                  📥 Cargar Plantilla
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => updateFlow(activeFlow.id, {
                    name: activeFlow.name,
                    description: activeFlow.description,
                  })}
                >
                  💾 Guardar
                </Button>
              </div>
            </div>
          </Card>

          {/* Flow visualization */}
          <div className="space-y-2 mb-4">
            {sortedNodes.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-white/20">
                <p className="text-white/40 text-sm mb-3">Flujo vacío — agrega nodos o carga una plantilla</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="secondary" size="sm" onClick={handleLoadStarterFlow}>
                    📥 Plantilla Inicial
                  </Button>
                  <Button size="sm" onClick={() => setShowAddNode(true)}>
                    + Agregar Nodo
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <AnimatePresence>
                  {sortedNodes.map((node, idx) => (
                    <FlowNodeCard
                      key={node.id}
                      node={node}
                      index={idx}
                      isEntry={activeFlow.entryNodeId === node.id}
                      onEdit={() => setEditingNode(node)}
                      onDelete={() => handleDeleteNode(node.id)}
                      onSetEntry={() => updateFlow(activeFlow.id, { entryNodeId: node.id })}
                      allNodes={sortedNodes}
                      onUpdateConditionTarget={(condId, targetNodeId) => {
                        const updatedConditions = (node.conditions ?? []).map((c) =>
                          c.id === condId ? { ...c, targetNodeId } : c
                        );
                        handleUpdateNode(node.id, { conditions: updatedConditions });
                      }}
                    />
                  ))}
                </AnimatePresence>

                <button
                  onClick={() => setShowAddNode(true)}
                  className="w-full p-3 border-2 border-dashed border-white/15 rounded-xl text-white/40 hover:text-white/70 hover:border-white/30 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span> Agregar Nodo
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Add Node Modal */}
      <AddNodeModal
        open={showAddNode}
        onClose={() => setShowAddNode(false)}
        onAdd={handleAddNode}
        position={sortedNodes.length}
      />

      {/* Edit Node Modal */}
      {editingNode && activeFlow && (
        <EditNodeModal
          open={!!editingNode}
          node={editingNode}
          allNodes={sortedNodes}
          onClose={() => setEditingNode(null)}
          onSave={(updates) => {
            handleUpdateNode(editingNode.id, updates);
            setEditingNode(null);
          }}
        />
      )}

      {/* Flow List Modal */}
      <Modal open={showFlowList} onClose={() => setShowFlowList(false)} title="Flujos del Agente" width="max-w-md">
        <div className="space-y-2">
          {agentFlows.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-4">No hay flujos creados.</p>
          ) : (
            agentFlows.map((f) => (
              <button
                key={f.id}
                onClick={() => { setSelectedFlow(f.id); setShowFlowList(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  f.id === activeFlow?.id
                    ? 'bg-[#FFAB00]/10 border-[#FFAB00]/40'
                    : 'bg-white/4 border-white/8 hover:bg-white/6'
                }`}
              >
                <div className="font-medium text-sm text-white">{f.name}</div>
                <div className="text-xs text-white/40">{f.nodes.length} nodos · {new Date(f.updatedAt).toLocaleDateString('es-ES')}</div>
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}

// ─── Flow Node Card ───────────────────────────────────────────────────────────
interface FlowNodeCardProps {
  node: FlowNode;
  index: number;
  isEntry: boolean;
  allNodes: FlowNode[];
  onEdit: () => void;
  onDelete: () => void;
  onSetEntry: () => void;
  onUpdateConditionTarget: (condId: string, targetNodeId: string) => void;
}

function FlowNodeCard({ node, index, isEntry, allNodes, onEdit, onDelete, onSetEntry, onUpdateConditionTarget }: FlowNodeCardProps) {
  const color = NODE_TYPE_COLORS[node.type] ?? '#6B7280';
  const label = NODE_TYPE_LABELS[node.type] ?? node.type;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex gap-3 items-stretch"
    >
      {/* Connector line */}
      <div className="flex flex-col items-center w-6 flex-shrink-0">
        <div className="w-3 h-3 rounded-full mt-4 flex-shrink-0" style={{ backgroundColor: color }} />
        {index < allNodes.length - 1 && (
          <div className="flex-1 w-0.5 mt-1" style={{ backgroundColor: `${color}30` }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 mb-2">
        <Card className="overflow-hidden" accent={color}>
          <div className="flex items-start gap-3 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                  {label.toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-white truncate">{node.label}</span>
                {isEntry && <Badge variant="success">ENTRADA</Badge>}
                {node.variableName && (
                  <span className="text-xs font-mono text-white/40">${node.variableName}</span>
                )}
              </div>

              <p className="text-xs text-white/60 font-mono whitespace-pre-wrap line-clamp-3">
                {node.content || <em className="text-white/30">Sin contenido</em>}
              </p>

              {/* Conditions */}
              {node.conditions && node.conditions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-white/40 font-medium">Condiciones:</p>
                  {node.conditions.map((cond) => (
                    <div key={cond.id} className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded">
                        "{cond.keyword}"
                      </span>
                      <span className="text-xs text-white/40">→ {cond.label}</span>
                      <select
                        value={cond.targetNodeId}
                        onChange={(e) => onUpdateConditionTarget(cond.id, e.target.value)}
                        className="ml-auto text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white/70 focus:outline-none focus:border-[#FFAB00]/40"
                      >
                        <option value="">— Nodo destino —</option>
                        {allNodes.filter((n) => n.id !== node.id).map((n) => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Action */}
              {node.action && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-pink-400">⚡ Acción:</span>
                  <span className="text-xs text-white/50">{node.action.type}</span>
                </div>
              )}

              {/* Delay */}
              {node.delay > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-white/30">⏱️ Delay: {node.delay}ms</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                title="Editar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              {!isEntry && (
                <button
                  onClick={onSetEntry}
                  className="p-1.5 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                  title="Establecer como nodo de entrada"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              )}
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Eliminar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// ─── Add Node Modal ───────────────────────────────────────────────────────────
interface AddNodeModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (node: Omit<FlowNode, 'id'>) => void;
  position: number;
}

const NODE_TYPES: { value: FlowNodeType; label: string; description: string }[] = [
  { value: 'message', label: '💬 Mensaje', description: 'Envía un mensaje al usuario' },
  { value: 'condition', label: '🔀 Condición', description: 'Ramifica según respuesta' },
  { value: 'input', label: '📝 Capturar Input', description: 'Guarda una variable' },
  { value: 'action', label: '⚡ Acción', description: 'Ejecuta una acción externa' },
  { value: 'handoff', label: '🤝 Transferir', description: 'Transfiere a agente humano' },
  { value: 'end', label: '🏁 Fin', description: 'Cierra la conversación' },
];

function AddNodeModal({ open, onClose, onAdd, position }: AddNodeModalProps) {
  const [type, setType] = useState<FlowNodeType>('message');
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [delay, setDelay] = useState(0);
  const [variableName, setVariableName] = useState('');

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd({
      type,
      label: label.trim(),
      content: content.trim(),
      position,
      children: [],
      conditions: type === 'condition'
        ? [
            { id: `c-${Date.now()}-1`, label: 'Opción 1', keyword: '1', targetNodeId: '' },
            { id: `c-${Date.now()}-2`, label: 'Opción 2', keyword: '2', targetNodeId: '' },
          ]
        : [],
      action: null,
      delay,
      variableName: type === 'input' ? variableName.toUpperCase() : '',
    });
    setLabel(''); setContent(''); setDelay(0); setVariableName('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar Nodo"
      width="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={!label.trim()}>Agregar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-white/60 uppercase tracking-wider block mb-2">Tipo de Nodo</label>
          <div className="grid grid-cols-2 gap-2">
            {NODE_TYPES.map((nt) => (
              <button
                key={nt.value}
                onClick={() => setType(nt.value)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  type === nt.value
                    ? 'border-[#FFAB00]/50 bg-[#FFAB00]/8'
                    : 'border-white/8 bg-white/3 hover:bg-white/6'
                }`}
              >
                <div className="text-sm font-medium text-white">{nt.label}</div>
                <div className="text-xs text-white/40">{nt.description}</div>
              </button>
            ))}
          </div>
        </div>
        <Input
          label="Etiqueta del Nodo"
          placeholder="ej. Mensaje de Bienvenida"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Textarea
          label="Contenido / Mensaje"
          placeholder="Texto que verá el usuario. Usa {{VARIABLE}} para variables."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        {type === 'input' && (
          <Input
            label="Nombre de Variable"
            placeholder="ej. ORDER_NUMBER"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            hint="Se guardará como {{VARIABLE_NAME}} para usar en nodos posteriores"
          />
        )}
        <Select
          label="Delay antes de enviar"
          value={String(delay)}
          onChange={(e) => setDelay(Number(e.target.value))}
          options={[
            { value: '0', label: 'Sin delay' },
            { value: '500', label: '0.5 segundos' },
            { value: '1000', label: '1 segundo' },
            { value: '2000', label: '2 segundos' },
            { value: '3000', label: '3 segundos' },
          ]}
        />
      </div>
    </Modal>
  );
}

// ─── Edit Node Modal ──────────────────────────────────────────────────────────
interface EditNodeModalProps {
  open: boolean;
  node: FlowNode;
  allNodes: FlowNode[];
  onClose: () => void;
  onSave: (updates: Partial<FlowNode>) => void;
}

function EditNodeModal({ open, node, allNodes, onClose, onSave }: EditNodeModalProps) {
  const [label, setLabel] = useState(node.label);
  const [content, setContent] = useState(node.content);
  const [delay, setDelay] = useState(node.delay);
  const [variableName, setVariableName] = useState(node.variableName);
  const [conditions, setConditions] = useState<FlowCondition[]>(node.conditions ?? []);

  const addCondition = () => {
    setConditions([...conditions, {
      id: `c-${Date.now()}`,
      label: `Opción ${conditions.length + 1}`,
      keyword: String(conditions.length + 1),
      targetNodeId: '',
    }]);
  };

  const updateCondition = (id: string, updates: Partial<FlowCondition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar: ${node.label}`}
      width="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave({ label, content, delay, variableName, conditions })}>
            Guardar Cambios
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        <Input label="Etiqueta" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Textarea
          label="Contenido / Mensaje"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          hint="Usa {{VARIABLE}} para insertar variables dinámicas"
        />
        {node.type === 'input' && (
          <Input
            label="Nombre de Variable"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value.toUpperCase())}
          />
        )}
        {(node.type === 'condition' || node.type === 'start') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Condiciones / Opciones</label>
              <Button variant="ghost" size="xs" onClick={addCondition}>+ Agregar</Button>
            </div>
            <div className="space-y-2">
              {conditions.map((cond) => (
                <div key={cond.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Keyword"
                    value={cond.keyword}
                    onChange={(e) => updateCondition(cond.id, { keyword: e.target.value })}
                    className="w-24"
                  />
                  <Input
                    placeholder="Etiqueta"
                    value={cond.label}
                    onChange={(e) => updateCondition(cond.id, { label: e.target.value })}
                  />
                  <select
                    value={cond.targetNodeId}
                    onChange={(e) => updateCondition(cond.id, { targetNodeId: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">→ Nodo destino</option>
                    {allNodes.filter((n) => n.id !== node.id).map((n) => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeCondition(cond.id)}
                    className="text-red-400/60 hover:text-red-400 p-1"
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <Select
          label="Delay"
          value={String(delay)}
          onChange={(e) => setDelay(Number(e.target.value))}
          options={[
            { value: '0', label: 'Sin delay' },
            { value: '500', label: '0.5s' },
            { value: '1000', label: '1s' },
            { value: '2000', label: '2s' },
            { value: '3000', label: '3s' },
          ]}
        />
      </div>
    </Modal>
  );
}
