// ─── Blueprint Store ───────────────────────────────────────────────────────────
// Zustand store con persistencia a IndexedDB.
// Estado en memoria para velocidad de UI, IndexedDB como fuente persistente.

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import {
  dbGetAll,
  dbPut,
  dbDelete,
  dbClear,
  type BlueprintEntry,
  type BPType,
  type SlotId,
  type SlotMap,
} from '../lib/blueprintDB';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferTypeFromJSON(data: Record<string, unknown>): BPType | null {
  // Detecta el tipo por campos clave del schema
  if (data.schema === 'BP_PERSON' || data.voicelab || data.persona) return 'BP_PERSON';
  if (data.schema === 'BP_LOCATION' || data.location || data.scene) return 'BP_LOCATION';
  if (data.schema === 'BP_PRODUCT' || data.compliance_risk || data.imagelab) return 'BP_PRODUCT';
  return null;
}

function extractMeta(data: Record<string, unknown>): { name: string; brandId: string; version: string } {
  return {
    name: (data.name as string) || (data.product_name as string) || (data.persona_name as string) || 'Sin nombre',
    brandId: (data.brandId as string) || (data.brand_id as string) || 'unknown',
    version: (data.version as string) || '1.0',
  };
}

// ─── State & Actions ──────────────────────────────────────────────────────────

interface BlueprintState {
  blueprints: BlueprintEntry[];
  slots: SlotMap;
  loading: boolean;
  activeFilter: BPType | 'ALL';
  activeBrandFilter: string | 'ALL';
  searchQuery: string;
}

interface BlueprintActions {
  // Init
  hydrate: () => Promise<void>;

  // CRUD
  importFromJSON: (jsonString: string, overrideType?: BPType) => Promise<{ ok: boolean; error?: string }>;
  importBatch: (jsonStrings: string[]) => Promise<{ imported: number; failed: number }>;
  deleteBlueprint: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;

  // Slots
  assignSlot: (slotId: SlotId, blueprintId: string) => void;
  clearSlot: (slotId: SlotId) => void;
  clearAllSlots: () => void;

  // Export
  exportBlueprint: (id: string) => void;
  exportAll: () => void;

  // Filters / UI
  setActiveFilter: (filter: BPType | 'ALL') => void;
  setActiveBrandFilter: (brandId: string | 'ALL') => void;
  setSearchQuery: (q: string) => void;

  // Selectors
  getBlueprintsByType: (type: BPType) => BlueprintEntry[];
  getBlueprintsByBrand: (brandId: string) => BlueprintEntry[];
  getSlotContext: () => string; // Serializa slots activos para prompt injection
}

export const useBlueprintStore = create<BlueprintState & BlueprintActions>((set, get) => ({
  blueprints: [],
  slots: {},
  loading: false,
  activeFilter: 'ALL',
  activeBrandFilter: 'ALL',
  searchQuery: '',

  // ─── Init ──────────────────────────────────────────────────────────────────
  hydrate: async () => {
    set({ loading: true });
    try {
      const all = await dbGetAll();
      set({ blueprints: all, loading: false });
    } catch (err) {
      console.error('[BlueprintStore] hydrate error:', err);
      set({ loading: false });
    }
  },

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  importFromJSON: async (jsonString, overrideType) => {
    try {
      const data = JSON.parse(jsonString);
      const type = overrideType || inferTypeFromJSON(data);
      if (!type) {
        return { ok: false, error: 'No se puede detectar el tipo de Blueprint. Verifica que el JSON tenga los campos schema, brandId y el tipo correcto.' };
      }
      const meta = extractMeta(data);
      const entry: BlueprintEntry = {
        id: nanoid(),
        type,
        brandId: meta.brandId,
        name: meta.name,
        version: meta.version,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dbPut(entry);
      set((s) => ({ blueprints: [...s.blueprints, entry] }));
      return { ok: true };
    } catch {
      return { ok: false, error: 'JSON inválido. Verifica el formato del archivo.' };
    }
  },

  importBatch: async (jsonStrings) => {
    let imported = 0;
    let failed = 0;
    for (const json of jsonStrings) {
      const result = await get().importFromJSON(json);
      if (result.ok) imported++;
      else failed++;
    }
    return { imported, failed };
  },

  deleteBlueprint: async (id) => {
    await dbDelete(id);
    set((s) => ({
      blueprints: s.blueprints.filter((b) => b.id !== id),
      // Limpiar slots que referenciaban este BP
      slots: Object.fromEntries(
        Object.entries(s.slots).filter(([, v]) => v?.id !== id)
      ) as SlotMap,
    }));
  },

  clearAll: async () => {
    await dbClear();
    set({ blueprints: [], slots: {} });
  },

  // ─── Slots ─────────────────────────────────────────────────────────────────
  assignSlot: (slotId, blueprintId) => {
    const bp = get().blueprints.find((b) => b.id === blueprintId);
    if (!bp) return;
    set((s) => ({ slots: { ...s.slots, [slotId]: bp } }));
  },

  clearSlot: (slotId) => {
    set((s) => {
      const next = { ...s.slots };
      delete next[slotId];
      return { slots: next };
    });
  },

  clearAllSlots: () => set({ slots: {} }),

  // ─── Export ────────────────────────────────────────────────────────────────
  exportBlueprint: (id) => {
    const bp = get().blueprints.find((b) => b.id === id);
    if (!bp) return;
    const blob = new Blob([JSON.stringify(bp.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bp.type}_${bp.name.replace(/\s+/g, '_')}_${bp.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportAll: () => {
    const all = get().blueprints;
    const blob = new Blob([JSON.stringify(all.map((b) => b.data), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UNRLVL_BlueprintLibrary_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ─── Filters ───────────────────────────────────────────────────────────────
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setActiveBrandFilter: (brandId) => set({ activeBrandFilter: brandId }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  // ─── Selectors ─────────────────────────────────────────────────────────────
  getBlueprintsByType: (type) => get().blueprints.filter((b) => b.type === type),
  getBlueprintsByBrand: (brandId) => get().blueprints.filter((b) => b.brandId === brandId),

  getSlotContext: () => {
    const { slots } = get();
    const entries = Object.entries(slots) as [SlotId, BlueprintEntry][];
    if (entries.length === 0) return '';

    const parts = entries.map(([slotId, bp]) => {
      const label = slotId === 'A' ? 'PERSONA PRINCIPAL'
        : slotId === 'B' ? 'PERSONA SECUNDARIA'
        : slotId === 'C' ? 'PRODUCTO HÉROE'
        : slotId === 'D' ? 'PRODUCTO COMPLEMENTARIO'
        : slotId === 'L' ? 'LOCACIÓN / ESCENA'
        : `REFERENCIA DE ESTILO ${slotId}`;

      return `[${label} — ${bp.type} v${bp.version}]\n${JSON.stringify(bp.data, null, 2)}`;
    });

    return `\n\n=== BLUEPRINTS ACTIVOS ===\n${parts.join('\n\n---\n\n')}\n=== FIN BLUEPRINTS ===\n`;
  },
}));
