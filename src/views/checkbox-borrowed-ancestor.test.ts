/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox-borrowed-ancestor
// COMPONENT: guards the checkboxes that only look right by accident
// ───────────────────────────────────────────────────────────────────
//
// Five checkbox sites previously looked correct only because a parent happened
// to carry a class that supplied their appearance.
//
// The call-site half of this guard, below, watches how a checkbox is created. That is not the
// property the defect was about. Re-keying the whole base rule from `input[type="checkbox"].db-checkbox`
// back to `.note-database-container .db-checkbox-cell input[type="checkbox"]` — the exact pre-fix
// stylesheet, every checkbox outside a boolean cell falling back to the platform box — left this
// suite reporting six passes. It passed on the broken tree and the fixed tree alike, because the
// property it claimed to protect lives in CSS and nothing here read any CSS.
//
// Section 4 reads it. A control owns its appearance when the rule that declares `appearance: none`
// has the control itself as its subject; the moment that rule acquires an ancestor, the control
// goes back to depending on where it is mounted and this suite goes red.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { join, resolve } from "path";
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

  // The assertion here used to read expect(MIGRATED.length).toBe(5) against a literal in this same
  // file — expect(5).toBe(5), which cannot fail whatever the source does. A first replacement was
  // no better: it looked for the factory within two lines of a raw creation, and a bare checkbox
  // inserted directly above a real factory call sat inside that window and passed.
  //
  // The factory supplies the type itself, so a migrated file has no reason to name it. Any
  // occurrence of the raw attribute in these files is a creation that bypassed the factory, and
  // the assertion is exact rather than proximate.
  it("leaves no checkbox creation site relying on a parent for its appearance", () => {
    const bare: string[] = [];
    for (const site of MIGRATED) {
      source(site.file).forEach((line, index) => {
        if (/type:\s*"checkbox"/.test(line)) bare.push(`${site.file}:${index + 1}`);
      });
    }
    expect(bare, `these name the checkbox type directly instead of using the factory: ${bare.join(", ")}`).toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE PROPERTY ITSELF
// ───────────────────────────────────────────────────────────────────

/** The two controls the plugin renders as an `input[type="checkbox"]`, and the class each owns. */
const OWNED_CONTROLS = [
  { control: "db-checkbox", note: "every selection and boolean box" },
  { control: "db-toggle-switch", note: "the switch" },
] as const;

interface AppearanceRule {
  selector: string;
  ancestorScoped: boolean;
  /** A fallback for controls that never migrated cannot reach one that did. */
  guardedAgainstOwned: boolean;
}

/**
 * Every rule in the stylesheet that hands a checkbox its non-platform appearance.
 *
 * Selector text is read rather than computed style, because the question is where the rule is
 * anchored and a computed value cannot answer that: an ancestor-scoped rule and a self-owned one
 * compute identically as long as the ancestor happens to be present, which is the whole reason
 * eleven families were missed the first time.
 */
function appearanceRules(control: string): AppearanceRule[] {
  const css = readFileSync(join(resolve(__dirname, "..", ".."), "styles.css"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: AppearanceRule[] = [];
  for (const block of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/appearance:\s*none/.test(block[2])) continue;
    for (const selector of block[1].split(",").map((part) => part.trim().replace(/\s+/g, " "))) {
      if (!selector.includes(control)) continue;
      // Attribute selectors carry spaces of their own; strip them before looking for a combinator.
      const skeleton = selector.replace(/\[[^\]]*\]/g, "");
      rules.push({
        selector,
        ancestorScoped: /[ >+~]/.test(skeleton),
        guardedAgainstOwned: /:not\(\.db-checkbox\)/.test(selector),
      });
    }
  }
  return rules;
}

describe("a checkbox's appearance is anchored on the control, not on where it is mounted", () => {
  for (const { control, note } of OWNED_CONTROLS) {
    it(`${control} — ${note} — has a rule whose subject is the control itself`, () => {
      const selfOwned = appearanceRules(control).filter((rule) => !rule.ancestorScoped);
      expect(
        selfOwned.map((rule) => rule.selector),
        `no rule gives .${control} appearance without an ancestor in the selector, so a control `
          + `mounted anywhere else falls back to the platform box`
      ).not.toEqual([]);
    });

    it(`${control} takes appearance from no ancestor`, () => {
      // A guarded fallback is exempt and only because the guard is what makes it unreachable:
      // `:not(.db-checkbox)` cannot match a control the factory built. Delete the guard and this
      // fails, which is the intent — an unguarded ancestor rule is the defect coming back.
      const borrowed = appearanceRules(control)
        .filter((rule) => rule.ancestorScoped && !rule.guardedAgainstOwned)
        .map((rule) => rule.selector);
      expect(
        borrowed,
        `these hand .${control} its appearance from an ancestor, so the control loses it the moment `
          + `it is mounted anywhere else: ${borrowed.join(" | ")}`
      ).toEqual([]);
    });
  }
});
