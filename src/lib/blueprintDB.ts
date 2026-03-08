// ─── Blueprint Library — IndexedDB Persistence Layer ──────────────────────────
// Native IndexedDB wrapper — sin dependencias externas.
// DB: 'unrlvl_blueprints' | Store: 'blueprints' | Version: 1

const DB_NAME = 'unrlvl_blueprints';
const STORE_NAME = 'blueprints';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('byType', 'type', { unique: false });
        store.createIndex('byBrand', 'brandId', { unique: false });
        store.createIndex('byTypeAndBrand', ['type', 'brandId'], { unique: false });
      }
    };

    req.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    req.onerror = () => reject(req.error);
  });
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

export async function dbGetAll(): Promise<BlueprintEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').getAll();
    req.onsuccess = () => resolve(req.result as BlueprintEntry[]);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut(entry: BlueprintEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type BPType = 'BP_PERSON' | 'BP_LOCATION' | 'BP_PRODUCT';

export interface BlueprintEntry {
  id: string;
  type: BPType;
  brandId: string;
  name: string;
  version: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ─── Slot System ──────────────────────────────────────────────────────────────
export type SlotId = 'A' | 'B' | 'C' | 'D' | 'L' | 'R1' | 'R2' | 'R3';

export const SLOT_META: Record<SlotId, { label: string; accepts: BPType[]; description: string }> = {
  A:  { label: 'Slot A — Sujeto principal',      accepts: ['BP_PERSON'],   description: 'Persona / vocero primario' },
  B:  { label: 'Slot B — Sujeto secundario',     accepts: ['BP_PERSON'],   description: 'Persona / vocero secundario' },
  C:  { label: 'Slot C — Producto héroe',        accepts: ['BP_PRODUCT'],  description: 'Producto principal de la pieza' },
  D:  { label: 'Slot D — Producto complementario', accepts: ['BP_PRODUCT'], description: 'Producto de apoyo o upsell' },
  L:  { label: 'Slot L — Locación',              accepts: ['BP_LOCATION'], description: 'Contexto de lugar / escena' },
  R1: { label: 'Slot R1 — Referencia 1',         accepts: ['BP_PERSON', 'BP_LOCATION', 'BP_PRODUCT'], description: 'Referencia de estilo libre' },
  R2: { label: 'Slot R2 — Referencia 2',         accepts: ['BP_PERSON', 'BP_LOCATION', 'BP_PRODUCT'], description: 'Referencia de estilo libre' },
  R3: { label: 'Slot R3 — Referencia 3',         accepts: ['BP_PERSON', 'BP_LOCATION', 'BP_PRODUCT'], description: 'Referencia de estilo libre' },
};

export type SlotMap = Partial<Record<SlotId, BlueprintEntry>>;
