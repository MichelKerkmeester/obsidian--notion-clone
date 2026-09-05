// ───────────────────────────────────────────────────────────────────
// MODULE:    menu-row-vocabulary-census
// COMPONENT: fails when a hand-built menu row site is added anywhere
//            outside the shared row builder
// ───────────────────────────────────────────────────────────────────
//
// Every caller that needs a menu row has one shared builder to reach for, and
// yet four files still construct a `db-menu-item` row by hand rather than
// through it — one row vocabulary per file drifts from the next in ways a
// reviewer only notices when two menus open side by side. Migrating those
// sites away is ongoing work; this test's job is narrower and permanent: the
// count may go down as a file migrates, and it may never go back up. A
// reviewer adding "just one more" hand-built row to a file already on this
// list gets a failing test naming the exact file and the count it exceeded,
// instead of a passing gate that never noticed the vocabulary grew by one.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Counting a source-level construction pattern means reading the file from disk; this suite never
   ships. */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. BASELINE
// ───────────────────────────────────────────────────────────────────

const SRC_VIEWS = resolve(__dirname, ".");

/**
 * A hand-built row: a line naming the `db-menu-item` class outside the row builder's own
 * definition of it. Mirrors the two-stage grep a maintainer runs by hand — find every line naming
 * the class, then keep the ones that are actually building a class list — as one regular
 * expression rather than a shelled-out pipeline, since a shelled `grep | grep` is not something a
 * unit suite can run portably across every environment this project's checks run in.
 */
const HAND_BUILT_ROW_LINE = /db-menu-item/;
const CLASS_LIST_LINE = /\bcls\b/;

function countHandBuiltRows(fileName: string): number {
  const source = readFileSync(resolve(SRC_VIEWS, fileName), "utf-8");
  let count = 0;
  for (const line of source.split("\n")) {
    if (HAND_BUILT_ROW_LINE.test(line) && CLASS_LIST_LINE.test(line)) count += 1;
  }
  return count;
}

/**
 * The count observed on the tree the day this ratchet was written, per file. A file drops out of
 * this table entirely once it reaches zero — there is nothing left to ratchet — rather than being
 * kept at a floor of zero, which would just be a second way to write "not in this list".
 */
const BASELINE: Record<string, number> = {
  "toolbar-renderer.ts": 37,
  "column-menu.ts": 19,
  "dropdown-field.ts": 4,
  "cell-renderer.ts": 3,
};

// The row builder's own row construction is not a violation of anything — it is the definition —
// but it is worth pinning too, since a second definition appearing inside the builder's own file
// would be the one place this test could never otherwise see.
const BUILDER_FILE = "menu-row.ts";
const BUILDER_BASELINE = 6;

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("menu row vocabulary census", () => {
  for (const [fileName, baseline] of Object.entries(BASELINE)) {
    it(`${fileName} has no more hand-built row sites than the recorded baseline`, () => {
      expect(countHandBuiltRows(fileName)).toBeLessThanOrEqual(baseline);
    });
  }

  it(`${BUILDER_FILE}'s own row construction has not grown a second definition`, () => {
    expect(countHandBuiltRows(BUILDER_FILE)).toBeLessThanOrEqual(BUILDER_BASELINE);
  });

  it("the family total outside the row builder has not grown past the recorded baseline", () => {
    const total = Object.keys(BASELINE).reduce((sum, fileName) => sum + countHandBuiltRows(fileName), 0);
    const baselineTotal = Object.values(BASELINE).reduce((sum, value) => sum + value, 0);
    expect(total).toBeLessThanOrEqual(baselineTotal);
  });
});
