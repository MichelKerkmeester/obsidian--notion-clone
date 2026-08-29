// ───────────────────────────────────────────────────────────────────
// MODULE:    anchor-ref
// COMPONENT: pure state-machine tests for logical anchor leases
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { AnchorRef, AnchorTimeoutHandle } from "./anchor-ref";

// ───────────────────────────────────────────────────────────────────
// 2. TEST TIMER
// ───────────────────────────────────────────────────────────────────

class FakeTimer {
  private nextId = 0;
  private readonly callbacks = new Map<number, () => void>();

  setTimeout(callback: () => void, _delayMs: number): AnchorTimeoutHandle {
    const id = ++this.nextId;
    this.callbacks.set(id, callback);
    return id;
  }

  clearTimeout(handle: AnchorTimeoutHandle): void {
    this.callbacks.delete(Number(handle));
  }

  fire(): void {
    const callbacks = Array.from(this.callbacks.values());
    this.callbacks.clear();
    callbacks.forEach((callback) => callback());
  }
}

function fakeElement(isConnected = true): HTMLElement {
  return { isConnected } as HTMLElement;
}

// ───────────────────────────────────────────────────────────────────
// 3. STATE-MACHINE TESTS
// ───────────────────────────────────────────────────────────────────

describe("AnchorRef", () => {
  it("re-resolves a render-epoch element while keeping logical identity", () => {
    const first = fakeElement();
    const second = fakeElement();
    let current: HTMLElement | null = first;
    const timer = new FakeTimer();
    const changes: string[] = [];
    const anchor = new AnchorRef({
      scope: "calendar",
      eventKey: "event-1",
      role: "panel",
      recordIdentity: "notes/event-1",
      resolver: () => current,
      timer,
      pendingTimeoutMs: 10,
      onStateChange: ({ from, to }) => changes.push(`${from}->${to}`),
    });

    expect(anchor.state).toBe("open");
    expect(anchor.resolve()).toBe(first);
    expect(anchor.state).toBe("anchored");
    current = null;
    expect(anchor.resolve()).toBeNull();
    expect(anchor.state).toBe("anchor-missing");
    current = second;
    expect(anchor.resolve()).toBe(second);
    expect(anchor.state).toBe("anchored");
    expect(anchor.recordIdentity).toBe("notes/event-1");
    expect(changes).toEqual(["open->anchored", "anchored->anchor-missing", "anchor-missing->anchored"]);

    anchor.release();
    expect(anchor.state).toBe("closed");
    expect(anchor.element).toBeNull();
  });

  it("closes after the bounded pending window instead of retaining the anchor", () => {
    const timer = new FakeTimer();
    const anchor = new AnchorRef({
      scope: "table",
      rowKey: "row-1",
      cellKey: "title",
      role: "menu",
      resolver: () => null,
      timer,
      pendingTimeoutMs: 10,
    });

    expect(anchor.resolve()).toBeNull();
    expect(anchor.state).toBe("anchor-missing");
    timer.fire();
    expect(anchor.state).toBe("closed");
    expect(anchor.element).toBeNull();
  });
});
