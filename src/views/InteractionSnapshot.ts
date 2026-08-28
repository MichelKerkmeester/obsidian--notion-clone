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
