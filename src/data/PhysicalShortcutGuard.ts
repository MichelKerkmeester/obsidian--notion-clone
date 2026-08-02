export interface ShortcutModifierEvent {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
}

export interface ShortcutPointerEvent {
  metaKey: boolean;
  ctrlKey: boolean;
}

/**
 * Rejects orphan Mod+key events that were not preceded by a physical
 * Meta/Control keydown in the current window interaction lifecycle.
 */
export class PhysicalShortcutGuard {
  private metaDown = false;
  private controlDown = false;
  private pointerGestureActive = false;
  private pointerGestureSettling = false;

  handleKeyDown(event: ShortcutModifierEvent): void {
    if (event.key === "Meta") this.metaDown = true;
    if (event.key === "Control") this.controlDown = true;
  }

  handleKeyUp(event: ShortcutModifierEvent): void {
    if (event.key === "Meta") this.metaDown = false;
    if (event.key === "Control") this.controlDown = false;
  }

  beginPointerGesture(event: ShortcutPointerEvent): void {
    this.pointerGestureActive = true;
    this.pointerGestureSettling = false;
    if (!event.metaKey) this.metaDown = false;
    if (!event.ctrlKey) this.controlDown = false;
  }

  endPointerGesture(): void {
    this.pointerGestureActive = false;
    this.pointerGestureSettling = true;
  }

  settlePointerGesture(): void {
    this.pointerGestureSettling = false;
  }

  reset(): void {
    this.metaDown = false;
    this.controlDown = false;
    this.pointerGestureActive = false;
    this.pointerGestureSettling = false;
  }

  allowsModShortcut(event: ShortcutModifierEvent): boolean {
    if (this.pointerGestureActive || this.pointerGestureSettling) return false;
    return (event.metaKey && this.metaDown) || (event.ctrlKey && this.controlDown);
  }
}
