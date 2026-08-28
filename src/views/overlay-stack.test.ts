// ───────────────────────────────────────────────────────────────────
// MODULE:    overlay-stack.test
// COMPONENT: verifies LIFO dismissal order and focus restoration for
//            the shared floating-surface stack
// ───────────────────────────────────────────────────────────────────
//
// Uses hand-built fake Document/HTMLElement stand-ins instead of a real
// DOM so the stack's own escape/pointerdown listener wiring is exercised
// directly through the captured handlers, without depending on jsdom
// event dispatch semantics.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { OverlayStack } from "./overlay-stack";

interface FakeDocument {
  listeners: Map<string, EventListener>;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

function createDocument(): Document & FakeDocument {
  const listeners = new Map<string, EventListener>();
  return {
    listeners,
    addEventListener(type: string, listener: EventListener) { listeners.set(type, listener); },
    removeEventListener(type: string, listener: EventListener) { if (listeners.get(type) === listener) listeners.delete(type); },
  } as unknown as Document & FakeDocument;
}

function createElement(doc: Document): HTMLElement {
  return {
    ownerDocument: doc,
    isConnected: true,
    contains: () => false,
    focus: () => undefined,
  } as unknown as HTMLElement;
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("OverlayStack", () => {
  it("dismisses nested surfaces in LIFO order and restores the child trigger first", () => {
    const stack = new OverlayStack();
    const doc = createDocument();
    const parentAnchor = createElement(doc);
    const childAnchor = createElement(doc);
    const parentPanel = createElement(doc);
    const childPanel = createElement(doc);
    const closed: string[] = [];
    let parentFocus = 0;
    let childFocus = 0;
    parentAnchor.focus = () => { parentFocus += 1; };
    childAnchor.focus = () => { childFocus += 1; };

    stack.register({ panel: parentPanel, anchor: parentAnchor, close: () => closed.push("parent") });
    stack.register({ panel: childPanel, anchor: childAnchor, close: () => closed.push("child") });

    const event = { key: "Escape", preventDefault: () => undefined, stopPropagation: () => undefined } as KeyboardEvent;
    doc.listeners.get("keydown")?.(event);
    expect(closed).toEqual(["child"]);
    expect(childFocus).toBe(1);
    expect(stack.size()).toBe(1);

    doc.listeners.get("keydown")?.(event);
    expect(closed).toEqual(["child", "parent"]);
    expect(parentFocus).toBe(1);
    expect(stack.size()).toBe(0);
  });

  it("closes only the top surface on an outside pointer down", () => {
    const stack = new OverlayStack();
    const doc = createDocument();
    const parent = createElement(doc);
    const child = createElement(doc);
    const closed: string[] = [];
    stack.register({ panel: parent, close: () => closed.push("parent") });
    stack.register({ panel: child, close: () => closed.push("child") });

    doc.listeners.get("pointerdown")?.({ target: null } as unknown as PointerEvent);
    expect(closed).toEqual(["child"]);
    expect(stack.size()).toBe(1);
  });

  it("does not restore focus when an action intentionally moves focus", () => {
    const stack = new OverlayStack();
    const doc = createDocument();
    const panel = createElement(doc);
    const anchor = createElement(doc);
    let focused = 0;
    anchor.focus = () => { focused += 1; };
    stack.register({ panel, anchor, close: () => undefined });

    expect(stack.dismissTop("action")).toBe(true);
    expect(focused).toBe(0);
  });
});
