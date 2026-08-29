/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on shipped source and stylesheet means reading them from disk, which needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-popover-coordinate-space
// COMPONENT: Regression suite locking cell popovers to one coordinate
//            space shared by the stylesheet and the positioners.
// ───────────────────────────────────────────────────────────────────
//
// Three popovers mount into `.note-database-container` and are positioned
// `absolute` by the stylesheet. Coordinates written by JS must therefore be
// measured from that container, which is what passing its rect and scroll
// offsets to `setPosition` does.
//
// The option popover used to compute viewport coordinates and force
// `position: fixed` inline to make them land. That worked only because an
// inline declaration outranks the stylesheet — an unstated coupling, in a file
// that re-declares these same selectors in an `!important` tail. It also meant
// any ancestor gaining a containing block, including from Obsidian's own CSS
// which is invisible from this repo, would reinterpret those coordinates as
// container-relative and shift the popover by the container's own offset.
//
// These are text assertions because vitest runs `environment: "node"` here with
// no jsdom, so there is no layout to measure.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. SETUP / FIXTURES
// ───────────────────────────────────────────────────────────────────

const cellSource = readFileSync(resolve(__dirname, "./cell-renderer.ts"), "utf-8");
const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");

/** The body of one positioner, from its signature to the closing brace of the method. */
function positionerBody(name: string): string {
  const start = cellSource.indexOf(`private ${name}(`);
  expect(start, `${name} should exist`).toBeGreaterThan(-1);
  const next = cellSource.indexOf("\n  private ", start + 1);
  return cellSource.slice(start, next === -1 ? cellSource.length : next);
}

const POSITIONERS = [
  "positionOptionPopover",
  "positionDateEditPopover",
  "positionTextEditPopover",
];

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("cell popover coordinate space", () => {
  it("styles the option popover as absolute inside a positioned container", () => {
    expect(stylesContent).toMatch(
      /\.note-database-container \.db-cell-option-popover \{[^}]*position: absolute/
    );
    expect(stylesContent).toMatch(/\.note-database-container \{[^}]*position: relative/);
  });

  for (const name of POSITIONERS) {
    it(`${name} measures bounds from the container, not the viewport`, () => {
      const body = positionerBody(name);
      expect(body).toContain("getVisiblePopoverBounds(container)");
      expect(body).not.toContain("getVisiblePopoverBounds(null)");
    });

    it(`${name} writes container-relative coordinates`, () => {
      const body = positionerBody(name);
      expect(body).toContain("container?.getBoundingClientRect()");
      // `undefined, 0, 0` is the viewport-coordinate call shape this suite exists to prevent.
      expect(body).not.toMatch(/setPosition\([^)]*undefined,\s*0,\s*0\s*\)/s);
    });
  }

  it("does not pin a container-hosted popover to the viewport", () => {
    const body = positionerBody("positionOptionPopover");
    // `fixed` survives only on the container-less fallback, where there is no positioned ancestor.
    const fixedUses = body.match(/position: "fixed"/g) ?? [];
    expect(fixedUses.length).toBeLessThanOrEqual(1);
    if (fixedUses.length === 1) {
      expect(body).toMatch(/container \? \{\} : \{ position: "fixed"/);
    }
  });

  it("keeps a positioner name out of the ignored-parameter convention", () => {
    // A leading underscore marks a parameter as deliberately unused. On a positioner that takes a
    // container, it marks the exact defect this suite guards: the container handed in and dropped.
    expect(cellSource).not.toMatch(/private position\w*Popover\([^)]*_container/s);
  });
});
