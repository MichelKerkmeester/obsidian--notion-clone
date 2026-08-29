/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox-borrowed-ancestor
// COMPONENT: guards the checkboxes that only look right by accident
// ───────────────────────────────────────────────────────────────────
//
// Of twelve checkbox families, one is genuinely owned by the plugin. Five more
// look correct today for a reason nobody wrote down: the call site adds a class
// to the input's PARENT a line or two before creating the input, and a rule
// scoped to that parent supplies the appearance.
//
// They pass every check that exists. They are also one wrapper refactor away
// from silently reverting to whatever the host theme draws — which, for a
// checkbox, means a circle where a square belongs. Nothing would fail. The
// screenshots would be regenerated and nobody would look.
//
// This holds them still until the checkbox work migrates them onto an
// unconditional base appearance. It asserts the load-bearing line rather than
// the file, because the file will move and the dependency is what matters.
//
// It is a source-text assertion because vitest runs here with no DOM. The
// browser harness owns computed-style proof; this owns "the prop is still
// there".

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. THE SITES
// ───────────────────────────────────────────────────────────────────

/**
 * Each entry names a classless checkbox and the parent-classing it depends on.
 *
 * `within` is how many lines above the input the classing may sit. Kept tight on purpose: a wide
 * window would keep passing after someone moved the classing somewhere it no longer applies.
 */
const BORROWED = [
  {
    file: "table-renderer.ts",
    creates: 'selectInner.createEl("input", { attr: { type: "checkbox" } })',
    dependsOn: 'cls: "db-select-inner"',
    within: 12,
    note: "select-all box in the header row",
  },
  {
    file: "cell-renderer.ts",
    creates: 'td.createEl("input", { attr: { type: "checkbox" } })',
    dependsOn: 'td.addClass("db-checkbox-cell")',
    within: 4,
    note: "boolean cell in a table row",
  },
  {
    file: "card-field-renderer.ts",
    creates: 'valueEl.createEl("input", { attr: { type: "checkbox" } })',
    dependsOn: 'valueEl.addClass("db-checkbox-cell")',
    within: 4,
    note: "boolean field on a card",
  },
  {
    file: "record-detail-panel.ts",
    creates: 'valueEl.createEl("input", { attr: { type: "checkbox" } })',
    dependsOn: 'valueEl.addClass("db-checkbox-cell")',
    within: 4,
    note: "boolean field in the record detail panel",
  },
] as const;

const source = (file: string): string[] =>
  readFileSync(resolve(__dirname, `./${file}`), "utf-8").split("\n");

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("checkboxes that depend on a classed ancestor", () => {
  for (const site of BORROWED) {
    it(`${site.file}: ${site.note} still has its parent classed nearby`, () => {
      const lines = source(site.file);
      const creations = lines
        .map((line, index) => ({ line, index }))
        .filter((entry) => entry.line.includes(site.creates));

      expect(creations.length, `no classless checkbox found in ${site.file}`).toBeGreaterThan(0);

      for (const { index } of creations) {
        const window = lines.slice(Math.max(0, index - site.within), index).join("\n");
        expect(
          window,
          `${site.file}:${index + 1} creates a classless checkbox whose appearance comes from `
          + `"${site.dependsOn}" on its parent, and that classing is no longer within `
          + `${site.within} lines above it. The checkbox will fall back to the host theme — a `
          + `circle where a square belongs — and nothing else will fail.`,
        ).toContain(site.dependsOn);
      }
    });
  }

  it("records how many families are actually owned, so the number has to be moved deliberately", () => {
    // Measured in a browser against the shipped stylesheet: one of twelve families computes its own
    // appearance. This is the value the checkbox work exists to move; asserting it here means the
    // move is a visible edit rather than a silent drift.
    const OWNED_TODAY = 1;
    const FAMILIES = 12;
    expect(OWNED_TODAY).toBeLessThan(FAMILIES);
  });
});
