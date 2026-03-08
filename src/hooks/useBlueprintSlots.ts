// ─── useBlueprintSlots ────────────────────────────────────────────────────────
// Hook transversal para consumir slots de Blueprint Library desde cualquier Lab.
// Uso: const { slots, getSlotContext, assignSlot, clearSlot } = useBlueprintSlots();

import { useBlueprintStore } from '../store/blueprintStore';
import type { SlotId, SlotMap, BlueprintEntry } from '../lib/blueprintDB';

export interface UseBlueprintSlotsReturn {
  slots: SlotMap;
  getSlotContext: () => string;
  assignSlot: (slotId: SlotId, blueprintId: string) => void;
  clearSlot: (slotId: SlotId) => void;
  clearAllSlots: () => void;
  hasSlots: boolean;
  activeSlotCount: number;
  getSlot: (slotId: SlotId) => BlueprintEntry | undefined;
}

export function useBlueprintSlots(): UseBlueprintSlotsReturn {
  const slots = useBlueprintStore((s) => s.slots);
  const getSlotContext = useBlueprintStore((s) => s.getSlotContext);
  const assignSlot = useBlueprintStore((s) => s.assignSlot);
  const clearSlot = useBlueprintStore((s) => s.clearSlot);
  const clearAllSlots = useBlueprintStore((s) => s.clearAllSlots);

  const activeSlotCount = Object.keys(slots).length;
  const hasSlots = activeSlotCount > 0;

  const getSlot = (slotId: SlotId) => slots[slotId];

  return {
    slots,
    getSlotContext,
    assignSlot,
    clearSlot,
    clearAllSlots,
    hasSlots,
    activeSlotCount,
    getSlot,
  };
}
