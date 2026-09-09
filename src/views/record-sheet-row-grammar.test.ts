/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    record-sheet-row-grammar
// COMPONENT: the record sheet's phone row grammar, as written
// ───────────────────────────────────────────────────────────────────
//
// The record sheet's phone presentation answers to the same reference row grammar the settings
// sheet does: one property per row, label left / value right on one line, inside the 44-52px
// touch window, everything on the sheet's one shared 16px content inset, a hairline under every
// row but the last, and the disclosure's section headings opening behind their own hairline on
// that same inset. The pitch floor also owns its own box model: the 44px counts the row's whole
// box, so the rows name border-box themselves rather than inheriting whatever the surrounding
// context assumes — unnamed, the same row measured 44px in one context and 61px in another.
// All of that lives in the stylesheet alone, which makes it invisible to a structural,
// jsdom-less suite, and invisible splits get reverted by accident — so this suite reads the
// shipped stylesheet the way the browser resolves it and fails the moment the shared inset, the
// floor's box, the disclosure's divider or the row's hairline collapses back. The geometry
// itself is proven by the live lane; this suite pins the declarations that lane's fixtures are
// cut against.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(resolve(__dirname, "..", ".."), "styles.css"), "utf8");

// The declaration block that follows a selector, first close brace winning.
const rule = (selector: string, occurrence = 0): string => {
  let start = -1;
  for (let found = 0; found <= occurrence; found++) {
    start = css.indexOf(selector, start + 1);
    if (start === -1) break;
  }
  expect(start, `the stylesheet no longer declares: ${selector} (occurrence ${occurrence})`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
};

const PANEL = ".obnotion-record-detail-panel.obnotion-mobile-bottom-sheet";

// The panel declares itself twice: once as the scroll-splitting surface (chrome, overflow), once
// as the sized surface (the 50svh floor and the row pitch's shared variable). The inset lives on
// the second.
const panelRule = (which: "chrome" | "surface"): string => rule(`${PANEL} {`, which === "chrome" ? 0 : 1);

describe("record sheet row grammar, as written", () => {
  it("spends one shared 16px content inset on the phone surface, and the rows none of their own", () => {
    const surface = panelRule("surface");
    expect(surface).toContain("padding-inline: var(--obnotion-sheet-inset)");
    expect(surface).toContain("min-height: 50svh");
    expect(surface).toContain("--obnotion-sheet-row-min-height: 44px");

    const field = rule(`${PANEL} .obnotion-record-detail-field {`);
    expect(field, "the row's own horizontal padding is back, doubling the sheet's inset").toContain("padding: var(--obnotion-space-4) 0");
    expect(field).toContain("min-height: var(--obnotion-sheet-row-min-height)");
    expect(field).toContain("align-items: center");
  });

  it("owns the touch floor's box: every measured row names border-box itself", () => {
    const boxed = rule(`${PANEL} :is(`);
    for (const row of [
      ".obnotion-record-detail-field",
      ".obnotion-record-detail-hidden-toggle",
      ".obnotion-record-detail-add-button",
      ".obnotion-record-detail-hidden-row",
      ".obnotion-record-detail-hidden-section-header",
    ]) {
      expect(boxed, `a measured row left the border-box group: ${row}`).toContain(row);
    }
    expect(boxed).toContain("box-sizing: border-box");
  });

  it("keeps the hairline under every property row but the last, at the faint step", () => {
    const divider = rule(`${PANEL} .obnotion-record-detail-field:not(:last-child) {`);
    expect(divider).toContain("border-bottom: 1px solid var(--obnotion-border-subtle)");
  });

  it("opens each disclosure section behind its own hairline on the shared inset", () => {
    const header = rule(`${PANEL} .obnotion-record-detail-hidden-section-header {`);
    expect(header).toContain("padding: 2px 0");
    expect(header, "the section heading lost its divider").toContain("border-top: 1px solid var(--obnotion-border-subtle)");

    const disclosureRow = rule(`${PANEL} .obnotion-record-detail-hidden-row {`);
    expect(disclosureRow).toContain("padding: 2px 0");

    const disclosureControls = rule(`${PANEL} .obnotion-record-detail-hidden-toggle,`);
    expect(disclosureControls).toContain("padding: var(--obnotion-space-2) 0");
  });

  it("keeps the label a fixed 96px column so a long label cannot shove the value sideways", () => {
    const label = rule(`${PANEL} .obnotion-record-detail-field-label {`);
    expect(label).toContain("flex: 0 0 96px");
    expect(label).toContain("font-size: var(--obnotion-font-base)");
  });
});
