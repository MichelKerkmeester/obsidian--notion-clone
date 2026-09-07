// ───────────────────────────────────────────────────────────────────
// MODULE:    active-view-controls-renderer.test
// COMPONENT: the chip rail's per-group add control
// ───────────────────────────────────────────────────────────────────
//
// Same idiom as the other toolbar-family suites in this packet: the renderer builds real DOM
// through Obsidian's helpers, unavailable in this suite's `node` environment, so the contract is
// pinned by reading the shipped source rather than mounting it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the renderer source from disk needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "active-view-controls-renderer.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. ADD CONTROL
// ───────────────────────────────────────────────────────────────────

describe("ActiveViewControlsRenderer chip rail add control", () => {
  it("adds one db-active-control-add control per rule group, wired to the optional addFilter/addSort actions", () => {
    // Red before this leg: `grep -rn "db-active-control-add" src/ styles.css` returned 0.
    expect(source).toContain("db-active-control-add");
    expect(source).toContain("actions.addSort");
    expect(source).toContain("actions.addFilter");
  });

  it("gates each add control on its own group's presence — the zero-chip case is the control", () => {
    const sortGroupOpen = source.indexOf("if (sorts.length > 0) {");
    const sortAddIndex = source.indexOf("if (actions.addSort)");
    const filterGroupOpen = source.indexOf("if (filters.length > 0) {");
    const filterAddIndex = source.indexOf("if (actions.addFilter)");
    expect(sortGroupOpen).toBeGreaterThan(-1);
    expect(filterGroupOpen).toBeGreaterThan(-1);
    // Each add control's own guard sits inside its group's `if`, after the group's chips render —
    // so with zero sorts (or zero filters) the group block never runs and neither does the guard.
    expect(sortAddIndex).toBeGreaterThan(sortGroupOpen);
    expect(sortAddIndex).toBeLessThan(filterGroupOpen);
    expect(filterAddIndex).toBeGreaterThan(filterGroupOpen);
  });

  it("carries its own accessible name and is optional, so a host that omits the action keeps its prior rail unchanged", () => {
    expect(source).toContain("addFilter?(anchorEl: HTMLElement): void;");
    expect(source).toContain("addSort?(anchorEl: HTMLElement): void;");
    expect(source).toMatch(/attr: \{ type: "button", title: label, "aria-label": label \}/);
  });
});
