/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox-borrowed-ancestor
// COMPONENT: guards the checkboxes that only look right by accident
// ───────────────────────────────────────────────────────────────────
//
// Five checkbox sites previously looked correct only because a parent happened
// to carry a class that supplied their appearance. The source guard now pins
// each one to the shared factory, while the browser harness owns computed-style
// proof.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. THE MIGRATED SITES
// ───────────────────────────────────────────────────────────────────

/**
 * Each entry names a former borrowed-ancestor site and the factory call that
 * now gives the input its own appearance contract.
 */
const MIGRATED = [
  {
    file: "table-renderer.ts",
    creates: 'const selectAll = createCheckbox(selectInner, { role: "row"',
    note: "select-all box in the header row",
  },
  {
    file: "table-renderer.ts",
    creates: 'const cb = createCheckbox(selectInner, { role: "row"',
    note: "row-select box beside the mobile move handle",
  },
  {
    file: "cell-renderer.ts",
    creates: 'createCheckbox(td, { role: "field"',
    note: "boolean cell in a table row",
  },
  {
    file: "card-field-renderer.ts",
    creates: 'createCheckbox(valueEl, { role: "field"',
    note: "boolean field on a card",
  },
  {
    file: "record-detail-panel.ts",
    creates: 'createCheckbox(valueEl, { role: "field"',
    note: "boolean field in the record detail panel",
  },
] as const;

const source = (file: string): string[] =>
  readFileSync(resolve(__dirname, `./${file}`), "utf-8").split("\n");

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("checkboxes migrated off borrowed ancestor appearance", () => {
  for (const site of MIGRATED) {
    it(`${site.file}: ${site.note} uses the checkbox factory`, () => {
      const text = source(site.file).join("\n");
      expect(text, `no factory call found in ${site.file}`).toContain(site.creates);
    });
  }

  it("keeps the former borrowed-ancestor population explicit", () => {
    const FORMER_BORROWED_SITES = MIGRATED.length;
    expect(FORMER_BORROWED_SITES).toBe(5);
  });
});
