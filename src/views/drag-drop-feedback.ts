// ───────────────────────────────────────────────────────────────────
// MODULE:    drag-drop-feedback
// COMPONENT: drop-placement indicator state + aria-live announcements
// ───────────────────────────────────────────────────────────────────
//
// Ties the visual drop-indicator classes to a transactional phase
// (over -> pending -> committed/failed) so a slow move operation can't
// leave stale "is-drop-*" classes on a row, and so sighted feedback and
// the screen-reader status announcement never drift out of sync.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { t } from "../i18n";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────
// 3. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const DROP_BEFORE_CLASS = "is-drop-before";
const DROP_AFTER_CLASS = "is-drop-after";

// ───────────────────────────────────────────────────────────────────
// 4. FEEDBACK STATE
// ───────────────────────────────────────────────────────────────────

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

    const count = this.sourcePaths.length || 1;
    if (phase === "pending") {
      this.announce(t("drag.movingItems", { count }));
    } else if (phase === "committed") {
      this.announce(t("operation.moved", { count }));
    } else if (phase === "failed") {
      this.announce(this.error || t("operation.failed"));
    }
  }

  private announce(message: string): void {
    if (!message) return;
    const doc = this.target?.ownerDocument ?? (typeof document !== "undefined" ? document : null);
    if (!doc) return;
    const container = (this.target && typeof this.target.closest === "function" ? this.target.closest(".note-database-container") : null) ?? doc.body;
    if (!container) return;
    let liveRegion = typeof container.querySelector === "function" ? container.querySelector<HTMLElement>(":scope > .db-sr-status, .db-sr-status") : null;
    if (!liveRegion && typeof doc.createElement === "function" && typeof container.appendChild === "function") {
      liveRegion = doc.createElement("div");
      liveRegion.className = "db-sr-status";
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      container.appendChild(liveRegion);
    }
    if (liveRegion) {
      liveRegion.textContent = message;
    }
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

// ───────────────────────────────────────────────────────────────────
// 5. HELPERS
// ───────────────────────────────────────────────────────────────────

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
