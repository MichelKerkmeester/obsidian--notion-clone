// ───────────────────────────────────────────────────────────────────
// MODULE:    interaction-scope.test
// COMPONENT: unit tests for InteractionScopeRegistry ownership/pause and
//            trapFocus tab/escape handling
// ───────────────────────────────────────────────────────────────────
//
// Test doubles are plain object literals shaped like an HTMLElement rather
// than a jsdom element, matching the module's own structural typing (asElement
// checks for a `.contains` method instead of `instanceof HTMLElement`).

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";

import { InteractionScopeRegistry, trapFocus } from "./interaction-scope";

// ───────────────────────────────────────────────────────────────────
// 2. INTERACTION SCOPE TESTS
// ───────────────────────────────────────────────────────────────────

describe("InteractionScopeRegistry", () => {
  it("registers a scope and recognizes its root and portal", () => {
    let root: HTMLElement;
    root = { contains: (target: unknown) => target === root, ownerDocument: { activeElement: null } } as unknown as HTMLElement;
    (root.ownerDocument as Document & { activeElement: Element | null }).activeElement = root;
    const portal = { contains: (target: unknown) => target === portal } as unknown as HTMLElement;
    const registry = new InteractionScopeRegistry();
    registry.register("view", root, { portals: [portal] });
    expect(registry.isActive("view")).toBe(true);
    expect(registry.owns("view", portal)).toBe(true);
  });

  it("pauses a scope while an external modal owns focus and restores the saved target", () => {
    let focused = false;
    let root: HTMLElement;
    root = {
      contains: (target: unknown) => target === root,
      ownerDocument: { activeElement: null },
    } as unknown as HTMLElement;
    (root.ownerDocument as Document & { activeElement: Element | null }).activeElement = root;
    (root as HTMLElement & { focus: () => void; isConnected: boolean }).focus = () => { focused = true; };
    (root as HTMLElement & { isConnected: boolean }).isConnected = true;
    const registry = new InteractionScopeRegistry();
    registry.register("view", root);
    registry.setPaused("view", true);
    expect(registry.isActive("view")).toBe(false);
    registry.setPaused("view", false);
    registry.restoreFocus("view");
    expect(focused).toBe(true);
  });

  it("traps Tab and sends Escape to the dialog owner", () => {
    let keydown: ((event: KeyboardEvent) => void) | undefined;
    let focused = false;
    let escaped = false;
    const root = {
      addEventListener: (_type: string, listener: (event: KeyboardEvent) => void) => { keydown = listener; },
      removeEventListener: () => undefined,
      querySelectorAll: () => [],
      ownerDocument: { activeElement: null },
      focus: () => { focused = true; },
    } as unknown as HTMLElement;
    const cleanup = trapFocus(root, { onEscape: () => { escaped = true; } });
    const tabEvent = { key: "Tab", preventDefault: () => undefined } as unknown as KeyboardEvent;
    keydown?.(tabEvent);
    expect(focused).toBe(true);
    keydown?.({ key: "Escape", preventDefault: () => undefined, stopPropagation: () => undefined } as unknown as KeyboardEvent);
    expect(escaped).toBe(true);
    cleanup();
  });
});
