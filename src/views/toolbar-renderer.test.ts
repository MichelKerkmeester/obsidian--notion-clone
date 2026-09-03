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

  it("exposes the display-width toggle's active state through aria-pressed", () => {
    const start = toolbarContent.indexOf('"db-width-toggle-btn"');
    expect(start).toBeGreaterThan(-1);
    const block = toolbarContent.slice(start, start + 600);
    expect(block).toContain('btn.setAttribute("aria-pressed", String(current === "wide"))');
  });

  it("keeps disclosure triggers on the expanded-state language only", () => {
    expect(toolbarContent).not.toMatch(/setPopoverTriggerState\(button: HTMLElement[\s\S]{0,160}aria-pressed/);
  });

  it("marks the active view tab with aria-selected and the is-active class", () => {
    expect(toolbarContent).toContain('"aria-selected": i === currentViewIndex ? "true" : "false"');
    expect(toolbarContent).toContain('cls: `db-view-tab${i === currentViewIndex ? " is-active" : ""}`');
  });
});
