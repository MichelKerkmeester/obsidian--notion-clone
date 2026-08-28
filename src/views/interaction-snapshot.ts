// ───────────────────────────────────────────────────────────────────
// MODULE:    interaction-snapshot
// COMPONENT: serializable snapshot of table focus/selection/draft-edit/pointer state
// ───────────────────────────────────────────────────────────────────
//
// cloneInteractionSnapshot is the one deep-copy boundary between a captured
// snapshot and the live objects it was built from, so a snapshot taken before
// a re-render (e.g. capture/restore around a data reload) cannot be silently
// mutated by changes made to the original selection or draft afterward.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface InteractionCellAddress {
  rowPath: string;
  colKey: string;
}

export interface InteractionRangeSnapshot {
  anchor: InteractionCellAddress;
  focus: InteractionCellAddress;
  active?: InteractionCellAddress;
}

export interface InteractionDraftSnapshot {
  value: string;
  inputType?: string;
  cell?: InteractionCellAddress;
  editorKind?: "text" | "number" | "date";
}

export interface InteractionPointerSnapshot {
  x: number;
  y: number;
}

export interface InteractionSnapshot {
  focusedCell?: InteractionCellAddress;
  selectedRange?: InteractionRangeSnapshot;
  activeDraft?: InteractionDraftSnapshot;
  pointerPosition?: InteractionPointerSnapshot;
}

// ───────────────────────────────────────────────────────────────────
// 2. SNAPSHOT CLONING
// ───────────────────────────────────────────────────────────────────

export function cloneInteractionSnapshot(snapshot: InteractionSnapshot): InteractionSnapshot {
  return {
    focusedCell: snapshot.focusedCell ? { ...snapshot.focusedCell } : undefined,
    selectedRange: snapshot.selectedRange
      ? {
          anchor: { ...snapshot.selectedRange.anchor },
          focus: { ...snapshot.selectedRange.focus },
          active: snapshot.selectedRange.active ? { ...snapshot.selectedRange.active } : undefined,
        }
      : undefined,
    activeDraft: snapshot.activeDraft
      ? {
          ...snapshot.activeDraft,
          cell: snapshot.activeDraft.cell ? { ...snapshot.activeDraft.cell } : undefined,
        }
      : undefined,
    pointerPosition: snapshot.pointerPosition ? { ...snapshot.pointerPosition } : undefined,
  };
}
