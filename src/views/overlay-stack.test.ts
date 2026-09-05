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

function createElement(doc: Document, owned: Node[] = []): HTMLElement {
  return {
    ownerDocument: doc,
    isConnected: true,
    contains: (node: Node) => owned.includes(node),
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

  it("decides inside-or-outside at pointerdown, and never at click", () => {
    const stack = new OverlayStack();
    const doc = createDocument();
    stack.register({ panel: createElement(doc), close: () => undefined });

    // A tap on a touch device produces its click on a delay, and by the time it arrives the node the
    // finger went down on may have been replaced by a rebuild the tap itself caused. A dismissal
    // decided then tests a target that is no longer anywhere, reads a press that began inside the
    // surface as outside, and closes it mid-edit. Deciding at pointerdown tests the target while it
    // is still the one under the finger.
    //
    // Asserted as the absence of a listener rather than as a behaviour, because that is the whole
    // guarantee: there is no click path to get wrong, and this is what stops one being added.
    expect(doc.listeners.has("pointerdown")).toBe(true);
    expect(doc.listeners.has("click")).toBe(false);
    expect(doc.listeners.has("mouseup")).toBe(false);
    expect(doc.listeners.has("touchend")).toBe(false);
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

  it("derives depth and the surface beneath a nested sheet", () => {
    const stack = new OverlayStack();
    const doc = createDocument();
    const parent = createElement(doc);
    const child = createElement(doc);
    const grandchild = createElement(doc);

    stack.register({ id: "parent", panel: parent, isSheet: true, close: () => undefined });
    stack.register({ id: "child", panel: child, isSheet: true, close: () => undefined });
    stack.register({ id: "grandchild", panel: grandchild, isSheet: true, close: () => undefined });

    expect(stack.getDepth(parent)).toBe(1);
    expect(stack.getDepth(child)).toBe(2);
    expect(stack.getDepth(grandchild)).toBe(3);
    expect(stack.getSurfaceBelow(grandchild, { sheetsOnly: true })?.panel).toBe(child);
    expect(stack.isTopSheet(grandchild)).toBe(true);
    expect(stack.isTopSheet(child)).toBe(false);
  });

  it("treats a press inside a stacked child as inside the parent, not outside it", () => {
    const stack = new OverlayStack();
    const doc = createDocument();
    const pressTarget = {} as unknown as Node;
    const parent = createElement(doc);
    const child = createElement(doc, [pressTarget]);

    stack.register({ id: "parent", panel: parent, isSheet: true, close: () => undefined });
    stack.register({ id: "child", panel: child, isSheet: true, close: () => undefined });

    expect(stack.isInsideSurfaceAbove(parent, pressTarget)).toBe(true);
    // The reverse must stay false, or a parent's own content would count as belonging to its child
    // and the child would never close on a press behind it.
    expect(stack.isInsideSurfaceAbove(child, pressTarget)).toBe(false);
    expect(stack.isInsideSurfaceAbove(parent, null)).toBe(false);
  });

  it("keeps a child attached to a parent that is rebuilt in place", () => {
    const stack = new OverlayStack();
    const doc = createDocument();
    const originalParent = createElement(doc);
    const rebuiltParent = createElement(doc);
    const child = createElement(doc);

    stack.register({ id: "parent", panel: originalParent, isSheet: true, close: () => undefined });
    stack.register({ id: "child", panel: child, isSheet: true, close: () => undefined });
    stack.register({ id: "parent", panel: rebuiltParent, isSheet: true, close: () => undefined });

    expect(stack.size()).toBe(2);
    expect(stack.getDepth(child)).toBe(2);
    expect(stack.getSurfaceBelow(child, { sheetsOnly: true })?.panel).toBe(rebuiltParent);
  });
});
