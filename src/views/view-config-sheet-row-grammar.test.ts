// ───────────────────────────────────────────────────────────────────
// MODULE:    view-config-sheet-row-grammar
// COMPONENT: regression suite pinning the settings sheet's reference row grammar
// ───────────────────────────────────────────────────────────────────
//
// The sheet's rows read as the reference's list rows: label left, control
// right, one setting per line, a 44px pitch floor, and a hairline that runs
// inset-left/flush-right between neighbouring rows. The lane measures these
// numbers live; this suite pins the declarations that produce them, so a
// refactor that quietly drops one fails here before any lane runs.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. GRAMMAR REGRESSION TESTS
// ───────────────────────────────────────────────────────────────────

describe("view-config sheet reference row grammar", () => {
  const stylesPath = resolve(__dirname, "../../styles.css");
  const stylesContent = readFileSync(stylesPath, "utf-8");

  const ruleFor = (selectorPattern: string): string => {
    const match = stylesContent.match(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`));
    expect(match, `no rule matches ${selectorPattern}`).not.toBeNull();
    return match![1];
  };

  it("rows are single-line: label left, control right, at the 44px touch floor, on the sheet's inset", () => {
    const row = ruleFor(
      "\\.obnotion-view-config-panel\\.obnotion-mobile-bottom-sheet \\.obnotion-panel-row(?![:\\w])"
    );
    expect(row).toContain("display: flex;");
    expect(row).toContain("align-items: center;");
    expect(row).toContain("padding-inline: var(--obnotion-sheet-inset);");
    expect(row).toContain("min-height: var(--obnotion-sheet-row-min-height, 44px);");
    expect(row).toContain("margin-bottom: 0;");
    expect(row).toContain("position: relative;");
    // The one-line direction is the flexbox default; the old stacked shape
    // must not come back through a leftover declaration.
    expect(row).not.toContain("flex-direction: column");
  });

  it("the field takes the row's remainder and grounds its content at the right edge", () => {
    const field = ruleFor(
      "\\.obnotion-view-config-panel\\.obnotion-mobile-bottom-sheet \\.obnotion-panel-row > \\.obnotion-view-config-field:not\\(\\.obnotion-view-config-field-stack\\)"
    );
    expect(field).toContain("display: flex;");
    expect(field).toContain("flex: 1 1 0;");
    expect(field).toContain("justify-content: flex-end;");
    expect(field).toContain("min-width: 0;");
  });

  it("rows whose control needs the sheet's full width keep the stacked shape", () => {
    for (const wideChild of [
      ".obnotion-view-config-field-stack",
      ".obnotion-view-config-textarea",
      ".obnotion-view-config-readonly-multiline",
      ".obnotion-view-config-range",
      ".obnotion-new-placement",
    ]) {
      expect(stylesContent).toContain(
        `.obnotion-panel-row:has(> ${wideChild})`
      );
    }
  });

  it("a row after a row draws a 1px hairline inset left / flush right, token with a literal fallback", () => {
    const divider = stylesContent.match(
      /\.obnotion-panel-row \+ \.obnotion-panel-row::before,\s*\.obnotion-view-config-panel\.obnotion-mobile-bottom-sheet \.obnotion-view-config-section-title:not\(:first-child\)::before\s*\{([^}]*)\}/
    );
    expect(divider, "the shared hairline rule is missing").not.toBeNull();
    expect(divider![1]).toContain("height: 1px;");
    expect(divider![1]).toContain("left: var(--obnotion-sheet-inset);");
    expect(divider![1]).toContain("right: 0;");
    expect(divider![1]).toContain(
      "background: var(--obnotion-border-subtle, rgba(221, 221, 221, 0.4));"
    );
    // the earlier settings-sheet leg's surviving intent, carried into this
    // suite when the two legs' same-path suites merged: the token itself
    // resolves where the host theme defines no --background-modifier-border,
    // so the hairline paints there too.
    expect(stylesContent).toContain(
      "--obnotion-border-subtle: color-mix(in srgb, var(--background-modifier-border, #333333) 40%, transparent);"
    );
    // The same line opens a section heading that follows anything, so the
    // heading's own rule only positions it and delegates the divider.
    const heading = ruleFor(
      "\\.obnotion-view-config-panel\\.obnotion-mobile-bottom-sheet \\.obnotion-view-config-section-title(?![:\\w])"
    );
    expect(heading).toContain("position: relative;");
    expect(heading).toContain("padding: var(--obnotion-space-5) var(--obnotion-sheet-inset)");
    expect(heading).not.toContain("border-top");
  });

  it("the preset field's picker shares its line with the Manage button instead of wrapping it", () => {
    const preset = ruleFor(
      "\\.obnotion-view-config-inline-controls > :is\\(\\.obnotion-view-config-dropdown, \\.obnotion-control-select\\)"
    );
    expect(preset).toContain("width: auto;");
    expect(preset).toContain("flex: 1 1 0;");
    expect(preset).toContain("min-width: 0;");
  });

  it("every choice on the sheet goes through the plugin's own picker — no native select", () => {
    const producer = readFileSync(
      resolve(__dirname, "view-config-panel-renderer.ts"),
      "utf-8"
    );
    expect(producer).not.toMatch(/createEl\(\s*["']select["']/);
    expect(producer).toContain('cls: "obnotion-view-config-field"');
  });

  it("sections collect into rounded cards lifted off the sheet's canvas, a heading above each", () => {
    const card = ruleFor(
      "\\.obnotion-view-config-panel\\.obnotion-mobile-bottom-sheet \\.obnotion-view-config-body > \\.obnotion-settings-card(?![:\\w])"
    );
    expect(card).toContain("border-radius: var(--obnotion-radius-lg);");
    expect(card).toContain("background: var(--obnotion-settings-card-fill);");
    expect(card).toContain("margin: 0 var(--obnotion-sheet-inset) var(--obnotion-space-5);");
  });
});
