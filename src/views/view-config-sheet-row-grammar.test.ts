/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    view-config-sheet-row-grammar
// COMPONENT: the settings sheet's phone row grammar, as written
// ───────────────────────────────────────────────────────────────────
//
// The settings sheet's rows split two ways: editors (a stacked field, a preset
// button row, a range pair, a textarea) keep the control stacked below the label
// at the sheet's full width, the shape the earlier row-grammar guard landed;
// every other setting reads as the reference's own one-line row — label left,
// control right, inside the 44-52px touch window. Which way a row splits keys on
// the field the renderer already lands (a -field-stack or -inline-controls
// wrapper, or a range/textarea as a direct row child), so the split lives
// entirely in the stylesheet. That makes it invisible to a structural, jsdom-less
// suite, and invisible splits get reverted by accident — so this suite reads the
// shipped stylesheet the way the browser resolves it and fails the moment the
// split, the shared 16px inset or the divider's token collapses back into the
// blanket stacking. The geometry itself is proven by the live lane; this suite
// pins the declarations that lane's fixtures are cut against.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(resolve(__dirname, "..", ".."), "styles.css"), "utf8");

// The declaration block that follows a selector, first close brace winning. A
// multi-selector group therefore reads from its first selector through the block
// they share.
const rule = (selector: string): string => {
  const start = css.indexOf(selector);
  expect(start, `the stylesheet no longer declares: ${selector}`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
};

const SHEET = ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet";

describe("settings sheet row grammar, as written", () => {
  it("carries no stacking of its own on the shared phone row rule", () => {
    const shared = rule(`${SHEET} .obnotion-panel-row {`);
    expect(shared, "the blanket column stacking is back on the shared rule; it belongs to the editor rows only").not.toContain("flex-direction: column");
    expect(shared).toContain("padding-inline: var(--obnotion-sheet-inset)");
    expect(shared).toContain("justify-content: space-between");
  });

  it("stacks exactly the editor rows: every multi-control variant sits in the column group", () => {
    const editors = rule(`${SHEET} .obnotion-panel-row:has(> .obnotion-view-config-field-stack)`);
    for (const variant of ["> .obnotion-view-config-inline-controls", "> .obnotion-view-config-range", "> .obnotion-view-config-textarea"]) {
      expect(editors, `an editor variant left the stacking group: ${variant}`).toContain(`.obnotion-panel-row:has(${variant})`);
    }
    expect(editors).toContain("flex-direction: column");
    expect(editors).toContain("align-items: stretch");
  });

  it("keeps a compact field on the label's line, taking the span right of it", () => {
    const field = rule(`${SHEET} .obnotion-view-config-field {`);
    expect(field).toContain("justify-content: flex-end");
    expect(field).toContain("flex: 1 1 auto");
    expect(field).toContain("min-width: 0");
  });

  it("lands a compact dropdown's value against the chevron at the far edge", () => {
    expect(rule(`${SHEET} .obnotion-view-config-dropdown .obnotion-dropdown-field-text {`)).toContain("display: flex");
    expect(rule(`${SHEET} .obnotion-view-config-dropdown .obnotion-dropdown-field-value {`)).toContain("margin-inline-start: auto");
  });

  it("opens each section on the rows' own 16px inset with the subtle divider", () => {
    const heading = rule(`${SHEET} .obnotion-view-config-section-title {`);
    expect(heading).toContain("padding: var(--obnotion-space-5) var(--obnotion-sheet-inset) var(--obnotion-space-2)");
    expect(heading).toContain("border-top: 1px solid var(--obnotion-border-subtle)");
  });

  it("keeps the divider's token resolvable where no theme defines the host's", () => {
    expect(css).toContain("--obnotion-border-subtle: color-mix(in srgb, var(--background-modifier-border, #333333) 40%, transparent)");
  });
});
