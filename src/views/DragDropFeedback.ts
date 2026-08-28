export type DropPlacement = "before" | "after";
export type DropAxis = "vertical" | "horizontal";
export type DragDropPhase = "over" | "pending" | "committed" | "failed";

export interface DragDropFeedbackSnapshot {
  phase: DragDropPhase | null;
  sourceId: string | null;
  sourcePaths: string[];
  destinationId: string | null;
  placement: DropPlacement | null;
  error: string | null;
}

const DROP_BEFORE_CLASS = "is-drop-before";
const DROP_AFTER_CLASS = "is-drop-after";

export class DragDropFeedbackState {
  private target: HTMLElement | null = null;
  private placement: DropPlacement | null = null;
  private phase: DragDropPhase | null = null;
  private sourceId: string | null = null;
  private sourcePaths: string[] = [];
  private destinationId: string | null = null;
  private error: string | null = null;

  begin(sourceId: string, sourcePaths: string[] = [], destinationId: string | null = null): void {
    this.sourceId = sourceId;
    this.sourcePaths = [...sourcePaths];
    this.destinationId = destinationId;
    this.error = null;
    this.phase = "over";
  }

  update(target: HTMLElement, placement: DropPlacement, destinationId?: string): void {
    if (this.target === target && this.placement === placement) return;
    this.removePlacementClasses();
    this.target = target;
    this.placement = placement;
    this.destinationId = destinationId ?? target.dataset.noteDatabaseDestinationId ?? null;
    this.phase = "over";
    this.error = null;
    target.classList.add(getPlacementClass(placement));
  }

  setPending(): void {
    this.setPhase("pending");
  }

  commit(): void {
    this.setPhase("committed");
  }

  fail(error?: unknown): void {
    this.error = error == null ? null : String(error);
    this.setPhase("failed");
  }

  getPhase(): DragDropPhase | null {
    return this.phase;
  }

  getSnapshot(): DragDropFeedbackSnapshot {
    return {
      phase: this.phase,
      sourceId: this.sourceId,
      sourcePaths: [...this.sourcePaths],
      destinationId: this.destinationId,
      placement: this.placement,
      error: this.error,
    };
  }

  clear(): void {
    this.removePlacementClasses();
    this.target = null;
    this.placement = null;
    this.phase = null;
    this.sourceId = null;
    this.sourcePaths = [];
    this.destinationId = null;
    this.error = null;
  }

  clearTarget(target: HTMLElement): void {
    if (this.target !== target) return;
    this.clear();
  }

  getPlacement(target: HTMLElement): DropPlacement | null {
    if (this.target !== target) return null;
    return this.placement;
  }

  private setPhase(phase: DragDropPhase): void {
    this.phase = phase;
    this.target?.classList.toggle("is-drop-pending", phase === "pending");
    this.target?.classList.toggle("is-drop-committed", phase === "committed");
    this.target?.classList.toggle("is-drop-failed", phase === "failed");
  }

  private removePlacementClasses(): void {
    if (!this.target) return;
    this.target.classList.remove(
      DROP_BEFORE_CLASS,
      DROP_AFTER_CLASS,
      "is-drop-pending",
      "is-drop-committed",
      "is-drop-failed",
    );
  }
}

export function resolveDropPlacement(target: HTMLElement, event: DragEvent, axis: DropAxis): DropPlacement {
  const rect = target.getBoundingClientRect();
  if (axis === "horizontal") {
    return event.clientX > rect.left + rect.width / 2 ? "after" : "before";
  }
  return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
}

function getPlacementClass(placement: DropPlacement): string {
  return placement === "after" ? DROP_AFTER_CLASS : DROP_BEFORE_CLASS;
}
