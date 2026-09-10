/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on shipped source means reading it from disk, which needs the node builtins the
   plugin runtime rule forbids. Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    record-detail-panel.test
// COMPONENT: the record sheet's header contract, as written
// ───────────────────────────────────────────────────────────────────
//
// The record sheet is the surface whose header once drifted out of the phone title-centring
// contract without anything failing: it drew its own header DOM, so the clause that measures
// every other sheet had no selector to read and the defect shipped invisible. The lane now
// covers the family and the producer routes the phone surface through the shared header —
// but that routing is one `if` in one file, and an accidental revert of it passes tsc, passes
// the build and re-opens the defect until someone re-runs the live lane. This suite pins the
// producer wiring itself, the way the row-grammar suite pins the stylesheet's row declarations:
// cheap, structural, and red the moment the sheet path stops mounting the shared header.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const panelSource = readFileSync(resolve(__dirname, "./record-detail-panel.ts"), "utf-8");
const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");

/** Declaration blocks whose selector list contains the exact selector, comments removed. */
const declarationsFor = (selector: string): string => {
  const withoutComments = stylesContent.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  let match = rule.exec(withoutComments);
  while (match) {
    const selectors = match[1].split(",").map((entry) => entry.trim());
    if (selectors.includes(selector)) blocks.push(match[2]);
    match = rule.exec(withoutComments);
  }
  return blocks.join("\n");
};

describe("record sheet header contract, as written", () => {
  it("routes the phone surface through the shared sheet header, keeping the desktop panel's own shape", () => {
    // The sheet branch: the same builder every other phone sheet calls, so the title-centring
    // clause measures this family the way it measures its siblings.
    expect(panelSource).toContain("isMobileBottomSheet(panel.ownerDocument)");
    expect(panelSource).toContain("buildPhoneRecordHeader({ parent: panel");

    // The desktop branch stays on its own header: the anchored panel is a different surface
    // with a byte-compatible DOM its own CSS depends on.
    expect(panelSource).toContain("buildDesktopRecordHeader({");
  });

  it("keeps the shared sheet title free to break long record names without widening the header", () => {
    // The never-overflow pair on the shared title: a record name is user text of unbounded
    // length, and this header lays out in one nowrap line, so a title without these widens the
    // sheet and pushes the close control off the right edge.
    const title = declarationsFor(".obnotion-mobile-bottom-sheet .obnotion-panel-title");
    expect(title).toMatch(/min-width:\s*0/);
    expect(title).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("keeps the record sheet's own close control visible on the sheet presentation", () => {
    // The desktop-anchored panel hides its close; the bottom sheet shows it. The phone header
    // now comes from the shared builder, so this rule is what keeps the record sheet's own
    // past behaviour (a tappable close on the sheet) intact after the switch. The sheet-only
    // override wins by specificity over the hide rule above it; it doubles the class because
    // the original selector needed the extra weight to beat the unscoped hide.
    const sheetClose = declarationsFor(
      ".obnotion-record-detail-panel.obnotion-mobile-bottom-sheet.obnotion-mobile-bottom-sheet .obnotion-cell-edit-close"
    );
    expect(sheetClose).toMatch(/display:\s*inline-flex/);
  });

  it("keeps a 4px rhythm gap between a property label's text and its trailing type icon", () => {
    // The row's type icon renders after the label's text, so the only thing separating the two
    // is the icon's own left margin. A zero there reads glued — the label runs into its glyph —
    // and because the icon sits inside the label's fixed 96px box, no row-geometry clause
    // catches it. The gap must come from margin-left (the side that faces the text) so the
    // icon's right edge, and with it the value's left edge, stay where the frozen row wants them.
    const icon = declarationsFor(
      ".obnotion-container .obnotion-record-detail-field-label .obnotion-record-detail-field-type-icon"
    );
    expect(icon).toMatch(/margin-left:\s*4px/);
  });
});
