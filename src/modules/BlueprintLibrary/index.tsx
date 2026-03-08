// ─── Blueprint Library Module ──────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprintStore } from '../../store/blueprintStore';
import {
  SLOT_META,
  type BPType,
  type BlueprintEntry,
  type SlotId,
} from '../../lib/blueprintDB';

// ─── Colores por tipo ──────────────────────────────────────────────────────────
const TYPE_COLOR: Record<BPType, { bg: string; text: string; badge: string; dot: string }> = {
  BP_PERSON:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   badge: 'bg-blue-500/20 text-blue-300',   dot: 'bg-blue-400' },
  BP_LOCATION: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-400' },
  BP_PRODUCT:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  badge: 'bg-amber-500/20 text-amber-300',  dot: 'bg-amber-400' },
};

const TYPE_ICON: Record<BPType, string> = {
  BP_PERSON: '👤',
  BP_LOCATION: '📍',
  BP_PRODUCT: '📦',
};

const SLOT_COLORS: Record<string, string> = {
  A: 'border-blue-500/40 bg-blue-500/5',
  B: 'border-blue-500/20 bg-blue-500/3',
  C: 'border-amber-500/40 bg-amber-500/5',
  D: 'border-amber-500/20 bg-amber-500/3',
  L: 'border-emerald-500/40 bg-emerald-500/5',
  R1: 'border-purple-500/30 bg-purple-500/5',
  R2: 'border-purple-500/30 bg-purple-500/5',
  R3: 'border-purple-500/30 bg-purple-500/5',
};

// ─── Import Panel ──────────────────────────────────────────────────────────────
function ImportPanel({ onClose }: { onClose: () => void }) {
  const { importFromJSON, importBatch } = useBlueprintStore();
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState<{ type: 'ok' | 'error' | 'info'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePasteImport = async () => {
    if (!jsonText.trim()) return;
    setLoading(true);
    const result = await importFromJSON(jsonText);
    setLoading(false);
    if (result.ok) {
      setStatus({ type: 'ok', msg: '✅ Blueprint importado correctamente.' });
      setJsonText('');
    } else {
      setStatus({ type: 'error', msg: `❌ ${result.error}` });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setLoading(true);
    setStatus({ type: 'info', msg: `Procesando ${files.length} archivo(s)...` });
    Promise.all(files.map((f) => f.text())).then(async (texts) => {
      const result = await importBatch(texts);
      setLoading(false);
      setStatus({
        type: result.failed === 0 ? 'ok' : 'error',
        msg: `✅ ${result.imported} importados. ${result.failed > 0 ? `❌ ${result.failed} fallaron.` : ''}`,
      });
    });
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-[#0d0d14] border border-white/8 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-white text-sm">Importar Blueprints</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-lg leading-none">×</button>
      </div>

      {/* File upload */}
      <div>
        <p className="text-white/40 text-xs mb-2">Desde archivo(s) .json</p>
        <input ref={fileRef} type="file" accept=".json" multiple className="hidden" onChange={handleFileImport} />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-white/15 rounded-xl py-3 text-white/40 text-sm hover:border-[#FFAB00]/40 hover:text-[#FFAB00]/60 transition-all"
        >
          📂 Seleccionar archivos JSON
        </button>
      </div>

      {/* Paste area */}
      <div>
        <p className="text-white/40 text-xs mb-2">O pega el JSON directamente</p>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{ "schema": "BP_PERSON", "brandId": "NeuroneCosmetics", ... }'
          rows={6}
          className="w-full bg-[#08080e] border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white/70 font-mono placeholder:text-white/20 focus:outline-none focus:border-[#FFAB00]/30 resize-none"
        />
        <button
          onClick={handlePasteImport}
          disabled={loading || !jsonText.trim()}
          className="mt-2 w-full bg-[#FFAB00]/10 hover:bg-[#FFAB00]/20 border border-[#FFAB00]/20 text-[#FFAB00] text-sm rounded-xl py-2 transition-all disabled:opacity-30"
        >
          {loading ? 'Procesando...' : 'Importar JSON'}
        </button>
      </div>

      {status && (
        <p className={`text-xs rounded-lg px-3 py-2 ${
          status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-400' :
          status.type === 'error' ? 'bg-red-500/10 text-red-400' :
          'bg-white/5 text-white/50'
        }`}>{status.msg}</p>
      )}
    </motion.div>
  );
}

// ─── Blueprint Card ────────────────────────────────────────────────────────────
function BPCard({
  bp,
  onDelete,
  onExport,
  onAssignSlot,
  activeSlots,
}: {
  bp: BlueprintEntry;
  onDelete: () => void;
  onExport: () => void;
  onAssignSlot: (slotId: SlotId) => void;
  activeSlots: Partial<Record<SlotId, BlueprintEntry>>;
}) {
  const [showSlotMenu, setShowSlotMenu] = useState(false);
  const colors = TYPE_COLOR[bp.type];
  const compatibleSlots = (Object.entries(SLOT_META) as [SlotId, typeof SLOT_META[SlotId]][])
    .filter(([, meta]) => meta.accepts.includes(bp.type));

  const assignedSlots = (Object.entries(activeSlots) as [SlotId, BlueprintEntry][])
    .filter(([, v]) => v?.id === bp.id)
    .map(([k]) => k);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative border border-white/6 rounded-xl p-4 ${colors.bg} group`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICON[bp.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{bp.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${colors.badge}`}>{bp.type}</span>
            <span className="text-white/30 text-xs">v{bp.version}</span>
            <span className="text-white/20 text-xs">{bp.brandId}</span>
          </div>
        </div>
      </div>

      {/* Assigned slots badges */}
      {assignedSlots.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {assignedSlots.map((s) => (
            <span key={s} className="text-xs bg-[#FFAB00]/15 text-[#FFAB00] px-2 py-0.5 rounded-full font-mono">
              Slot {s}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={() => setShowSlotMenu((v) => !v)}
            className="text-xs bg-[#FFAB00]/10 hover:bg-[#FFAB00]/20 border border-[#FFAB00]/20 text-[#FFAB00] px-2.5 py-1 rounded-lg transition-all"
          >
            Asignar slot
          </button>
          <AnimatePresence>
            {showSlotMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full left-0 mb-1 bg-[#0d0d14] border border-white/10 rounded-xl p-2 z-20 w-56 shadow-xl"
              >
                {compatibleSlots.map(([slotId, meta]) => (
                  <button
                    key={slotId}
                    onClick={() => { onAssignSlot(slotId); setShowSlotMenu(false); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/80 text-xs font-mono">Slot {slotId}</span>
                    <span className="text-white/30 text-xs ml-2">— {meta.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={onExport} className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded-lg transition-colors">↓ Export</button>
        <button onClick={onDelete} className="text-xs text-red-400/50 hover:text-red-400 px-2 py-1 rounded-lg transition-colors ml-auto">Eliminar</button>
      </div>
    </motion.div>
  );
}

// ─── Slot Panel ────────────────────────────────────────────────────────────────
function SlotPanel() {
  const slots = useBlueprintStore((s) => s.slots);
  const clearSlot = useBlueprintStore((s) => s.clearSlot);
  const clearAllSlots = useBlueprintStore((s) => s.clearAllSlots);
  const activeCount = Object.keys(slots).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Slots activos</h3>
        {activeCount > 0 && (
          <button onClick={clearAllSlots} className="text-xs text-white/25 hover:text-red-400 transition-colors">
            Limpiar todos
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(SLOT_META) as [SlotId, typeof SLOT_META[SlotId]][]).map(([slotId, meta]) => {
          const bp = slots[slotId];
          const colorClass = SLOT_COLORS[slotId] || 'border-white/10 bg-white/2';
          return (
            <div
              key={slotId}
              className={`border rounded-xl p-3 transition-all ${colorClass} ${bp ? '' : 'opacity-50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-white/50 font-bold">Slot {slotId}</span>
                {bp && (
                  <button
                    onClick={() => clearSlot(slotId)}
                    className="text-white/20 hover:text-red-400 transition-colors text-xs leading-none"
                  >×</button>
                )}
              </div>
              {bp ? (
                <div>
                  <p className="text-white text-xs font-medium truncate">{bp.name}</p>
                  <p className="text-white/30 text-xs">{bp.type}</p>
                </div>
              ) : (
                <p className="text-white/20 text-xs">{meta.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {activeCount > 0 && (
        <div className="bg-[#FFAB00]/5 border border-[#FFAB00]/15 rounded-xl p-3">
          <p className="text-[#FFAB00]/70 text-xs font-semibold mb-1">Contexto inyectable</p>
          <p className="text-white/30 text-xs">{activeCount} blueprint(s) activo(s). Al generar en cualquier Lab, el contexto de estos BPs se inyectará automáticamente en el prompt.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────
export function BlueprintLibrary() {
  const {
    blueprints, loading, hydrate,
    activeFilter, setActiveFilter,
    activeBrandFilter, setActiveBrandFilter,
    searchQuery, setSearchQuery,
    deleteBlueprint, exportBlueprint, exportAll,
    assignSlot, slots,
  } = useBlueprintStore();

  const [showImport, setShowImport] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  // Filtrado
  const filtered = blueprints.filter((bp) => {
    if (activeFilter !== 'ALL' && bp.type !== activeFilter) return false;
    if (activeBrandFilter !== 'ALL' && bp.brandId !== activeBrandFilter) return false;
    if (searchQuery && !bp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const brands = Array.from(new Set(blueprints.map((b) => b.brandId)));
  const counts: Record<string, number> = {
    ALL: blueprints.length,
    BP_PERSON: blueprints.filter((b) => b.type === 'BP_PERSON').length,
    BP_LOCATION: blueprints.filter((b) => b.type === 'BP_LOCATION').length,
    BP_PRODUCT: blueprints.filter((b) => b.type === 'BP_PRODUCT').length,
  };

  return (
    <div className="flex h-full min-h-screen bg-[#050508]">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-white text-xl">Blueprint Library</h1>
            <p className="text-white/30 text-sm mt-0.5">
              {blueprints.length} blueprint(s) · Persistente en IndexedDB
            </p>
          </div>
          <div className="flex items-center gap-2">
            {blueprints.length > 0 && (
              <button
                onClick={exportAll}
                className="text-xs text-white/40 hover:text-white/70 border border-white/8 rounded-xl px-3 py-2 transition-all"
              >
                ↓ Backup all
              </button>
            )}
            <button
              onClick={() => setShowImport((v) => !v)}
              className="text-sm bg-[#FFAB00] hover:bg-[#FFAB00]/90 text-[#050508] font-bold rounded-xl px-4 py-2 transition-all"
            >
              + Importar
            </button>
          </div>
        </div>

        {/* Import panel */}
        <AnimatePresence>
          {showImport && <ImportPanel onClose={() => setShowImport(false)} />}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {(['ALL', 'BP_PERSON', 'BP_LOCATION', 'BP_PRODUCT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                activeFilter === f
                  ? 'bg-[#FFAB00]/15 border-[#FFAB00]/30 text-[#FFAB00]'
                  : 'border-white/8 text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'ALL' ? 'Todos' : f} ({counts[f] ?? 0})
            </button>
          ))}

          {brands.length > 1 && (
            <select
              value={activeBrandFilter}
              onChange={(e) => setActiveBrandFilter(e.target.value)}
              className="bg-[#08080e] border border-white/8 text-white/50 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">Todas las marcas</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#08080e] border border-white/8 text-white/60 text-xs rounded-xl px-3 py-1.5 placeholder:text-white/20 focus:outline-none focus:border-white/15 min-w-40"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-white/20 text-sm">Cargando biblioteca...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <span className="text-5xl opacity-20">🗂</span>
            <p className="text-white/30 text-sm">
              {blueprints.length === 0
                ? 'No hay blueprints. Importa archivos JSON desde el repo.'
                : 'No hay resultados para los filtros actuales.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((bp) => (
                <BPCard
                  key={bp.id}
                  bp={bp}
                  onDelete={() => deleteBlueprint(bp.id)}
                  onExport={() => exportBlueprint(bp.id)}
                  onAssignSlot={(slotId) => assignSlot(slotId, bp.id)}
                  activeSlots={slots}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Slot sidebar */}
      <div className="w-72 flex-shrink-0 bg-[#08080e] border-l border-white/6 p-5 overflow-y-auto">
        <SlotPanel />
      </div>
    </div>
  );
}
