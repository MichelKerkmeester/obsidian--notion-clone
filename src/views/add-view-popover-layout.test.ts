// ───────────────────────────────────────────────────────────────────
// MODULE:    add-view-popover-layout
// COMPONENT: source and stylesheet regressions for the "add view" surface
// ───────────────────────────────────────────────────────────────────
//
// Reads the shipped stylesheet, the renderer and the screenshot fixture
// directly rather than mounting anything. Geometry belongs to
// verify-placement, which opens the real surface in a browser; what is left
// for a source-level suite is the class of defect a rendered measurement
// cannot see — a rule that reaches this surface from ten thousand lines away,
// and a hand-written fixture drifting away from the renderer it depicts.
//
// The fixture drift is the reason this file grew. Two of the six defects
// reported against this surface were artifacts of markup that imports nothing
// from src/: it drew four view types where the renderer emits seven, and
// omitted accessible names the renderer sets. Nobody could have known without
// reading both files side by side, so the suite now does that on every run.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on the shipped stylesheet means reading it from disk, which needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- a tools-side .mjs fixture with no type declarations; imported so the parity
// checks read the markup the capture actually renders rather than the source that produces it.
import { CORE_SCENARIOS } from "../../tools/screenshots/scenarios/core.mjs";
import { setLocale, t } from "../i18n";

const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");
const toolbarSource = readFileSync(resolve(__dirname, "./toolbar-renderer.ts"), "utf-8");
const fixtureScenario = (CORE_SCENARIOS as Array<{ id: string; html(): string; captureCss?: string; note?: string }>)
  .find((scenario) => scenario.id === "add-view-popover");

// ───────────────────────────────────────────────────────────────────
// 2. HELPERS
// ───────────────────────────────────────────────────────────────────

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

/** The markup the capture harness actually renders for this scenario. */
const addViewFixture = (): string => {
  expect(fixtureScenario).toBeDefined();
  return fixtureScenario!.html();
};

/** `showAddViewMenu`'s body with comments removed. */
const addViewMenuBody = (): string => {
  const stripped = toolbarSource
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const surface = stripped.slice(stripped.indexOf("private showAddViewMenu"));
  const end = surface.indexOf("\n  private ");
  return end === -1 ? surface : surface.slice(0, end);
};

/** View types the renderer offers, read from `getViewTypeOptions`. */
/**
 * Every view type the options method LISTS, offered or not.
 *
 * Located by name rather than by exact signature: pinning `getViewTypeOptions()` with its
 * parentheses meant that adding one parameter silently found nothing, and the test then failed
 * claiming the renderer offers zero view types — a true-looking result from a broken locator.
 */
const rendererViewTypes = (): string[] => {
  const block = toolbarSource.slice(toolbarSource.indexOf("function getViewTypeOptions"));
  const body = block.slice(0, block.indexOf("\n  }"));
  return [...body.matchAll(/text:\s*t\("common\.(\w+)"\)/g)].map((m) => m[1]);
};

/** The view types actually offered — gallery and list are listed but withdrawn from the pickers. */
const offeredViewTypes = (): string[] => rendererViewTypes().filter((type) => type !== "galleryView" && type !== "listView");

describe("add-view surface", () => {
  it("keeps the duplicate checkbox at its native size instead of stretching it to the form width", () => {
    // The form's full-bleed sizing exists for the text fields; a bare `input` selector also
    // catches the checkbox and flattens it into a form-wide pill with no visible caption.
    const stretchedSelectors = stylesContent.match(/\.db-add-view-form input[^,{\n]*/g) ?? [];
    expect(stretchedSelectors.length).toBeGreaterThan(0);
    for (const selector of stretchedSelectors) {
      expect(selector).toContain(':not([type="checkbox"])');
    }

    const checkbox = declarationsFor(".note-database-container .db-add-view-duplicate input");
    expect(checkbox).toMatch(/flex:\s*0 0 auto/);
    expect(checkbox).not.toMatch(/width:\s*100%/);
  });

  it("builds every choice with the shared row builder rather than a private vocabulary", () => {
    expect(toolbarSource).toContain("createMenuRow(choices, {");
    // The tile grid is gone with its three classes; a stray reference would mean a class in
    // source that nothing styles, which is how the dead `is-<type>` preview modifier survived.
    expect(toolbarSource).not.toContain("db-add-view-card");
    expect(toolbarSource).not.toContain("db-add-view-preview");
    expect(stylesContent).not.toContain("db-add-view-card");
    expect(stylesContent).not.toContain("db-add-view-preview");
  });

  it("lets the shared row rule decide the duplicate action's box", () => {
    // The row carried `db-menu-item` and was still 36px tall on a 30px grammar, because a legacy
    // toolbar-row selector of equal specificity sat nineteen thousand lines later and won on order.
    // Nothing may re-declare that box: the row's geometry belongs to the row.
    expect(declarationsFor(".db-menu-item.db-menu-item")).toMatch(/padding:\s*0 8px/);
    expect(stylesContent).not.toMatch(/\.db-add-view-duplicate-action\s*[,{]/);
    expect(toolbarSource).toContain('cls: "db-add-view-duplicate-action"');
  });

  it("groups the surface with the same section and separator vocabulary the menus use", () => {
    expect(toolbarSource).toContain("createMenuSection(panel, t(\"toolbar.addViewOptions\"))");
    expect(toolbarSource).toContain("createMenuSeparator(panel)");
    expect(toolbarSource).toContain("createMenuSection(panel, t(\"toolbar.addViewCreate\"))");
  });

  it("names each field on screen instead of only to a screen reader", () => {
    // A placeholder is not a label — it is gone at the first keystroke. An aria-label alone leaves
    // the screen silent, which is how a select showing "Cost" came to be named "Title property".
    expect(toolbarSource).toContain('field.createEl("label", {');
    expect(toolbarSource).toContain('attr: { for: controlId }');
    // Comments stripped first: this file explains in prose why there is no placeholder, and a
    // source assertion that reads its own commentary is testing the wrong text.
    const body = addViewMenuBody();
    expect(body).not.toMatch(/placeholder:/);
    expect(body).not.toMatch(/"aria-label": t\("toolbar\.(newViewName|viewKeyField|viewIcon)"\)/);
  });

  it("gives the two duplicate controls two names, because they do two things", () => {
    // The checkbox seeds the new view from the current one's settings; the row makes a same-type
    // copy. Sharing one name made them read as the same control offered twice.
    expect(toolbarSource).toContain('t("toolbar.copyCurrentViewSettings")');
    expect(addViewMenuBody().match(/t\("toolbar\.duplicateCurrentView"\)/g) ?? []).toHaveLength(1);
  });

  describe("the screenshot fixture depicts what the renderer emits", () => {
    it("draws one row per view type the renderer offers", () => {
      // Seven exist in the union; five are offered. The gallery and the list are deprecated, not
      // deleted — the types are persisted in vault files, so the entries stay and only the picker
      // withdraws them.
      expect(rendererViewTypes()).toHaveLength(7);
      const types = offeredViewTypes();
      expect(types).toHaveLength(5);
      const fixture = addViewFixture();
      const drawn = [...fixture.matchAll(/class="db-menu-item-label">([^<]+)</g)].map((m) => m[1]);
      // The duplicate action is a row too, so the fixture draws one more than there are types.
      expect(drawn).toHaveLength(types.length + 1);
      expect(drawn).toContain("Duplicate current view");
      // Two withdrawn types must not be depicted as available.
      expect(drawn).not.toContain("Gallery view");
      expect(drawn).not.toContain("List view");
      // `common.tableView` -> "Table view", which is the caption the fixture writes out.
      for (const type of types) {
        const label = type.replace(/View$/, " view");
        const expected = label.charAt(0).toUpperCase() + label.slice(1);
        expect(drawn).toContain(expected);
      }
    });

    it("gives the key field the shared dropdown, not a native select", () => {
      // The real surface replaced `<select class="db-add-view-key-field">` with
      // `createDropdownField` (`toolbar-renderer.ts`) so the field opens the same listbox every
      // other dropdown in the plugin does instead of the OS picker — the second grammar the sheet
      // contract exists to catch (`sheet-grammar.ts`'s `hasSharedDropdownRows`). A fixture still
      // drawing the native element is a picture of a surface nobody ships.
      const fixture = addViewFixture();
      expect(fixture).not.toContain("<select");
      expect(fixture).toContain("db-add-view-key-field");
      expect(fixture).toContain("db-dropdown-field");
    });

    it("gives the header the close affordance every sheet grammar carries", () => {
      // `createSheetHeader` always appends a `db-sheet-close` button; a fixture with a bare
      // title-only header depicts the surface report 43 complained about, not the one that shipped.
      const fixture = addViewFixture();
      expect(fixture).toContain("db-sheet-close");
    });

    it("uses the row grammar, not a private tile", () => {
      const fixture = addViewFixture();
      expect(fixture).toContain('class="db-menu-item"');
      expect(fixture).toContain("db-add-view-choices");
      expect(fixture).not.toContain("db-add-view-card");
      expect(fixture).not.toContain("db-add-view-preview");
    });

    it("carries the visible labels and the grouping the renderer builds", () => {
      const fixture = addViewFixture();
      expect(fixture).toContain("db-add-view-field-label");
      expect(fixture).toContain('class="db-menu-section"');
      expect(fixture).toContain('class="db-menu-separator"');
      expect(fixture).toContain("Copy settings from current view");
      // Every control the fixture draws is tied to its caption, as the renderer ties them.
      const fors = [...fixture.matchAll(/for="([^"]+)"/g)].map((m) => m[1]);
      expect(fors.length).toBeGreaterThanOrEqual(3);
      for (const id of fors) expect(fixture).toContain(`id="${id}"`);
    });

    it("names its fields with the renderer's own strings, not with strings that look like them", () => {
      // The association clause above passes on a fixture whose captions say anything at all: it
      // checks that every `for` finds an `id`, which is a structural claim. A fixture reading
      // "Key field" beside a renderer saying "Title property" satisfies it completely — and a
      // capture is then a picture of a surface nobody ships. Accessible NAME equality is the clause
      // that was missing, and it is taken from the renderer's own translation table rather than
      // from a literal, so a wording change moves both sides or fails here.
      const fixture = addViewFixture();
      const drawnLabels = [...fixture.matchAll(/class="db-add-view-field-label"[^>]*>([^<]+)</g)]
        .map((m) => m[1].trim());
      // Pinned to English, because the capture is taken in English and a locale-dependent
      // comparison would pass or fail on whichever locale the runner happened to hold.
      setLocale("en");
      const rendered = ["toolbar.newViewName", "toolbar.viewKeyField", "toolbar.viewIcon"].map((key) => t(key));
      expect(rendered.every((label) => label.length > 0 && !label.startsWith("toolbar."))).toBe(true);
      expect(drawnLabels).toEqual(rendered);

      // The checkbox is named by an adjacent span rather than by a `for`, so it is checked in its
      // own right — it was the control that carried two different names in two places.
      expect(fixture).toContain(t("toolbar.copyCurrentViewSettings"));
    });

    it("records that no capture of this scenario can answer a placement question", () => {
      // The scenario pins the panel to `position: static` so the capture box does not collapse.
      // That override is also why the mobile capture shows a popover for a surface the shipped
      // positioner presents as a bottom sheet. A defect was read off that image once, so the
      // warning is asserted rather than left to survive the next edit on goodwill.
      expect(fixtureScenario!.captureCss).toContain("position: static !important");
      const source = readFileSync(
        resolve(__dirname, "../../tools/screenshots/scenarios/core.mjs"), "utf-8",
      );
      const start = source.indexOf('id: "add-view-popover"');
      const block = source.slice(start, source.indexOf('    id: "', start + 10));
      expect(block.toLowerCase()).toContain("bottom sheet");
    });
  });
});
