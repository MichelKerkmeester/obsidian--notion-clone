// ───────────────────────────────────────────────────────────────────
// MODULE:    toolbar-renderer.test
// COMPONENT: reconciled toggle/active-state language on toolbar controls
// ───────────────────────────────────────────────────────────────────
//
// The toolbar carries two different "on" states and the accessibility
// language must keep them apart: disclosure triggers say where their
// popover is (aria-expanded + is-open), while two-state toggle buttons say
// what their state is (aria-pressed + is-active). The reference segmented
// control (chrome.css:124-170) keys its active segment off a visible CSS
// class, but a visual class never announces state to a screen reader — this
// suite pins the ARIA half of that language.
//
// The toolbar renderer builds real DOM against Obsidian's toolbar layout, so
// like the shipped accessibility-defects suite this pins the produced
// markup contract by reading the renderer source rather than by mounting it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the renderer source from disk needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. TOGGLE STATE LANGUAGE
// ───────────────────────────────────────────────────────────────────

describe("ToolbarRenderer toggle state language", () => {
  const toolbarPath = resolve(__dirname, "toolbar-renderer.ts");
  const toolbarContent = readFileSync(toolbarPath, "utf-8");

  it("offers display width from the utilities menu after the dedicated toggle was removed", () => {
    expect(toolbarContent).toContain('t("toolbar.displayWidth")');
    expect(toolbarContent).toContain("setDisplayWidth");
    expect(toolbarContent).not.toContain("db-width-toggle-btn");
  });

  it("keeps disclosure triggers on the expanded-state language only", () => {
    expect(toolbarContent).not.toMatch(/setPopoverTriggerState\(button: HTMLElement[\s\S]{0,160}aria-pressed/);
  });

  it("marks the active view tab with aria-selected and the is-active class", () => {
    expect(toolbarContent).toContain("createTabStrip");
    expect(toolbarContent).toContain("active: i === currentViewIndex");
    const primitives = readFileSync(resolve(__dirname, "toolbar-primitives.ts"), "utf-8");
    expect(primitives).toContain('"aria-selected": String(definition.active || definition.id === options.activeId)');
    expect(primitives).toContain('cls: `db-view-tab${definition.active || definition.id === options.activeId ? " is-active" : ""}`');
  });

  it("renders six dots in the linked-view grab handle", () => {
    expect(toolbarContent).toContain("db-linked-view-drag-handle");
    expect(toolbarContent).toContain("index < 6");
    expect(toolbarContent).toContain("actions.moveLinkedView");
  });
});
