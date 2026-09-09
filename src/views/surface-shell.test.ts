// ───────────────────────────────────────────────────────────────────
// MODULE:    surface-shell.test
// COMPONENT: presentation resolution, declared-title fallback counting, the sub-page
//            stack's replace-in-place semantics, and the shell's named geometry
// ───────────────────────────────────────────────────────────────────
//
// The shell's chrome composition itself needs a live document to exercise — building a
// panel, a header and a scrim the way the running plugin does. Everything decoupled from
// that (which presentation a request resolves to, which title source answers, what a
// sub-page push actually changes) is pulled out as data the way the rest of this codebase's
// DOM-adjacent modules already do, and is asserted directly here.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the shipped source to assert its shape needs the node builtins the plugin runtime
   rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  SHELL_DIVIDER_CLEARANCE_PX,
  SHELL_ENTER_MS,
  SHELL_EXIT_MS,
  SHELL_PADDING_X_PX,
  SHELL_PADDING_Y_PX,
  SHELL_PANEL_WIDTH_PX,
  SHELL_PHONE_CLOSE_PX,
  SHELL_RADIUS_PX,
  SHELL_ROW_HEIGHT_PX,
  SHELL_SIDE_SHEET_CLASS,
  SHELL_SIDE_SHEET_WIDTH_PX,
  createSubPageState,
  createSurfaceShell,
  getScrapeFallbackTitleUseCount,
  popSubPageTitle,
  pushSubPageTitle,
  resetScrapeFallbackTitleUseCountForTests,
  resolveShellPresentation,
  resolveShellTitle,
  shellHasBack,
  topSubPageTitle,
} from "./surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. PRESENTATION RESOLUTION
// ───────────────────────────────────────────────────────────────────

describe("resolveShellPresentation", () => {
  it("resolves a declared sheet to a sheet only on touch", () => {
    expect(resolveShellPresentation("sheet", true, false)).toEqual({ asSheet: true, asFullscreen: false });
    expect(resolveShellPresentation("sheet", false, false)).toEqual({ asSheet: false, asFullscreen: false });
  });

  it("resolves a declared fullscreen surface to fullscreen only when nothing else is already open", () => {
    expect(resolveShellPresentation("fullscreen", true, false)).toEqual({ asSheet: false, asFullscreen: true });
  });

  it("resolves a fullscreen surface opened over an open sheet to a sheet, not a second fullscreen layer", () => {
    // A workbench opened from inside a sheet reads as a second sheet stacked on the first,
    // not as a full-screen takeover of the surface already open.
    expect(resolveShellPresentation("fullscreen", true, true)).toEqual({ asSheet: true, asFullscreen: false });
  });

  it("leaves a dialog alone on the desktop and when nothing else is already open", () => {
    expect(resolveShellPresentation("dialog", false, false)).toEqual({ asSheet: false, asFullscreen: false });
    expect(resolveShellPresentation("dialog", true, false)).toEqual({ asSheet: false, asFullscreen: false });
  });

  it("still promotes a dialog opened from inside an open sheet to a sheet — the parent decides, not the declaration", () => {
    expect(resolveShellPresentation("dialog", true, true)).toEqual({ asSheet: true, asFullscreen: false });
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE DECLARED TITLE, AND THE COUNTED FALLBACK
// ───────────────────────────────────────────────────────────────────

describe("resolveShellTitle", () => {
  beforeEach(() => {
    resetScrapeFallbackTitleUseCountForTests();
  });

  it("prefers a declared title and never asks the fallback for one", () => {
    const fallback = () => "scraped";
    expect(resolveShellTitle("Declared", fallback)).toBe("Declared");
    expect(getScrapeFallbackTitleUseCount()).toBe(0);
  });

  it("falls back and counts the fallback when nothing is declared", () => {
    expect(resolveShellTitle(undefined, () => "Scraped Heading")).toBe("Scraped Heading");
    expect(getScrapeFallbackTitleUseCount()).toBe(1);
    resolveShellTitle(undefined, () => "Scraped Heading");
    expect(getScrapeFallbackTitleUseCount()).toBe(2);
  });

  it("treats a blank declared title as undeclared", () => {
    expect(resolveShellTitle("   ", () => "Fallback")).toBe("Fallback");
    expect(getScrapeFallbackTitleUseCount()).toBe(1);
  });

  it("returns an empty string rather than throwing when no fallback exists either", () => {
    expect(resolveShellTitle(undefined, undefined)).toBe("");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3b. THE DECLARED ROLE
// ───────────────────────────────────────────────────────────────────

describe("the shell's declared role", () => {
  it("carries whatever role a surface declares, undeclared by default", () => {
    // The handle is pure bookkeeping until `.apply()` touches the DOM, so a fake element that
    // is never dereferenced is enough to exercise the getter directly.
    const element = {} as HTMLElement;
    const undeclared = createSurfaceShell({ presentation: "dialog", element, close: () => {} });
    expect(undeclared.role).toBeUndefined();
    const declared = createSurfaceShell({ presentation: "dialog", element, close: () => {}, role: "panel" });
    expect(declared.role).toBe("panel");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE SUB-PAGE STACK REPLACES; IT DOES NOT STACK
// ───────────────────────────────────────────────────────────────────

describe("the sub-page stack", () => {
  it("starts with no back affordance and the root showing", () => {
    const state = createSubPageState();
    expect(shellHasBack(state)).toBe(false);
    expect(topSubPageTitle(state)).toBeUndefined();
  });

  it("a push changes only what the header would show — no second surface is created", () => {
    const pushed = pushSubPageTitle(createSubPageState(), "Layout");
    expect(topSubPageTitle(pushed)).toBe("Layout");
    expect(shellHasBack(pushed)).toBe(true);
    // The state is a plain value; pushing one title never mutates or aliases another.
    expect(shellHasBack(createSubPageState())).toBe(false);
  });

  it("pops back to the page beneath it, in LIFO order", () => {
    let state = createSubPageState();
    state = pushSubPageTitle(state, "Layout");
    state = pushSubPageTitle(state, "Image preview");
    expect(topSubPageTitle(state)).toBe("Image preview");
    state = popSubPageTitle(state);
    expect(topSubPageTitle(state)).toBe("Layout");
    expect(shellHasBack(state)).toBe(true);
    state = popSubPageTitle(state);
    expect(topSubPageTitle(state)).toBeUndefined();
    expect(shellHasBack(state)).toBe(false);
  });

  it("popping an already-empty stack is a no-op rather than an error", () => {
    const state = createSubPageState();
    expect(popSubPageTitle(state)).toEqual(state);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. NAMED GEOMETRY, NOT A LITERAL AT EVERY CALL SITE
// ───────────────────────────────────────────────────────────────────

describe("the shell's own geometry constants", () => {
  it("carries the seven counted properties at their measured values", () => {
    expect(SHELL_RADIUS_PX).toBe(8);
    expect(SHELL_PADDING_X_PX).toBe(16);
    expect(SHELL_PADDING_Y_PX).toBe(8);
    expect(SHELL_DIVIDER_CLEARANCE_PX).toBe(8);
    expect(SHELL_ROW_HEIGHT_PX).toBe(28);
    expect(SHELL_PANEL_WIDTH_PX).toBe(360);
    expect(SHELL_PHONE_CLOSE_PX).toBe(44);
  });

  it("carries the reconciled motion band", () => {
    expect(SHELL_ENTER_MS).toBe(200);
    expect(SHELL_EXIT_MS).toBe(150);
  });

  it("carries the desktop side-sheet's marker class and measured width", () => {
    expect(SHELL_SIDE_SHEET_CLASS).toBe("obnotion-shell-side-sheet");
    expect(SHELL_SIDE_SHEET_WIDTH_PX).toBe(420);
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. THE SHELL COMPOSES THE ENGINE; IT DOES NOT REACH PAST IT OR INTO A CONSUMER
// ───────────────────────────────────────────────────────────────────

const shellSource = readFileSync(resolve(__dirname, "./surface-shell.ts"), "utf8");
const dbModalSource = readFileSync(resolve(__dirname, "./modals/obnotion-modal.ts"), "utf8");

describe("the shell composes the existing sheet engine rather than reimplementing it", () => {
  it("imports the chrome, header and placement primitives from the engine modules", () => {
    expect(shellSource).toMatch(/import \{[^}]*attachSheetChromeToModal[^}]*\} from "\.\/mobile-bottom-sheet"/);
    expect(shellSource).toMatch(/import \{[^}]*createSheetHeader[^}]*\} from "\.\/mobile-bottom-sheet"/);
    expect(shellSource).toMatch(/import \{[^}]*placeSheet[^}]*\} from "\.\/popover-position"/);
    expect(shellSource).toMatch(/import \{[^}]*keepSheetPlaced[^}]*\} from "\.\/popover-position"/);
  });

  it("never imports from a consumer of the shell", () => {
    // The shell is the primitive every modal and sheet composes; a consumer importing back
    // from it would be a cycle, and this module reaching into one would be the shell
    // depending on the very thing it is meant to unify.
    expect(shellSource).not.toMatch(/from ["']\.\/modals\//);
    expect(shellSource).not.toMatch(/from ["']\.\/obnotion-modal["']/);
    expect(shellSource).not.toMatch(/-renderer["']/);
  });

  it("composes placement and its keep-alive loop in one call each", () => {
    expect(shellSource).toContain("placeSheet(options.element)");
    expect(shellSource).toContain("keepSheetPlaced(options.element)");
  });
});

describe("DbModal delegates its presentation switch to the shell", () => {
  it("no longer resolves touch, the sheet parent, or the sheet engine calls itself", () => {
    expect(dbModalSource).not.toContain("isTouchDevice(");
    expect(dbModalSource).not.toContain("attachSheetChromeToModal(");
    expect(dbModalSource).not.toContain("placeSheet(");
    expect(dbModalSource).not.toContain("keepSheetPlaced(");
  });

  it("builds one shell and re-applies it rather than composing chrome inline", () => {
    expect(dbModalSource).toContain("createSurfaceShell({");
    expect(dbModalSource).toContain("this.shell.apply()");
  });

  it("keeps the idempotent chrome-off call in onClose exactly as it always ran", () => {
    expect(dbModalSource).toContain("applySheetChrome(this.modalEl, false);");
  });

  it("passes a declared title and role into the shell rather than leaving them unset", () => {
    expect(dbModalSource).toContain("title: this.getDeclaredTitle(),");
    expect(dbModalSource).toContain("role: this.getShellRole(),");
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. THE SEVENTEEN SUBCLASSES THAT DECLARE, RATHER THAN LEAVE TO THE SCRAPE
// ───────────────────────────────────────────────────────────────────
//
// Thirteen `sheet` subclasses plus the four `fullscreen` ones now declare their own title
// and role, checked the same way the composition above is: reading the shipped source
// rather than mounting a live Obsidian `Modal`, which none of this suite's fakes can
// construct.

const DECLARING_SUBCLASS_FILES = [
  "modals/confirm-modal.ts",
  "modals/add-database-modal.ts",
  "modals/create-property-modal.ts",
  "modals/column-rename-modal.ts",
  "modals/status-options-modal.ts",
  "modals/status-preset-manager-modal.ts",
  "modals/delete-database-modal.ts",
  "modals/base-import-confirm-modal.ts",
  "modals/relation-rollup-config-modal.ts",
  "modals/create-record-icon-field-modal.ts",
  "modals/create-linked-view-modal.ts",
  "modals/computed-frontmatter-cleanup-modal.ts",
  "modals/formula-modal.ts",
  "../../archive/deprecated-views/chart/chart-renderer.ts",
  "modals/invalid-time-events-modal.ts",
  "modals/property-type-conflict-modal.ts",
];

describe("the thirteen sheet subclasses and the four fullscreen ones declare a title and a role", () => {
  it.each(DECLARING_SUBCLASS_FILES)("%s overrides getDeclaredTitle and getShellRole", (relativePath) => {
    const source = readFileSync(resolve(__dirname, relativePath), "utf8");
    expect(source).toContain("getDeclaredTitle(): string {");
    expect(source).toContain("getShellRole(): SurfaceShellRole {");
  });

  it("settings.ts's TrashManagerModal declares its own title and role the same way", () => {
    const settingsSource = readFileSync(resolve(__dirname, "../settings.ts"), "utf8");
    expect(settingsSource).toContain("getDeclaredTitle(): string {");
    expect(settingsSource).toContain("getShellRole(): SurfaceShellRole {");
  });

  it("no longer scrapes CreateLinkedViewModal's heading now that its title is declared", () => {
    // This subclass used to override the scrape (`getSheetTitle`) rather than declare a
    // title; the scrape method name should not reappear now that it declares one instead.
    const source = readFileSync(resolve(__dirname, "modals/create-linked-view-modal.ts"), "utf8");
    expect(source).not.toContain("getSheetTitle(): string {");
  });

  it("keeps the formula workbench on fullscreen while still declaring its own title and role", () => {
    // Only the workbench keeps a third presentation. Declaring a title and a role does not
    // change that — the assertion is that `fullscreen` survives beside them, not instead.
    const source = readFileSync(resolve(__dirname, "modals/formula-modal.ts"), "utf8");
    expect(source).toContain('super(app, "fullscreen");');
  });

  it("moves the other three fullscreen subclasses onto the shell's ordinary sheet resolution", () => {
    for (const relativePath of ["../../archive/deprecated-views/chart/chart-renderer.ts", "modals/invalid-time-events-modal.ts", "modals/property-type-conflict-modal.ts"]) {
      const source = readFileSync(resolve(__dirname, relativePath), "utf8");
      expect(source).not.toContain('super(app, "fullscreen");');
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 8. THE HEADER-BEARING FILES ROUTE THROUGH THE SHELL'S OWN HEADER
// ───────────────────────────────────────────────────────────────────
//
// The census started at twelve independent `createSheetHeader` sites (eleven migrated, the
// engine's own default builder inside `mobile-bottom-sheet.ts` the expected twelfth survivor —
// it is what `buildShellHeader` itself calls, so it must keep calling `createSheetHeader`
// directly). A later census found that list short: `column-width.ts`, `chart-toolbar-renderer.ts`
// (four sites), `toolbar-renderer.ts` (two), and `record-surface/record-header.ts`'s unconsumed
// phone builder were all still hand-built from raw `obnotion-panel-header`/`obnotion-panel-title` markup.
// The list below is the true population, re-pinned rather than left at twelve.
//
// Three of the original eleven — the date, colour and icon pickers — since reached the same
// builder through the picker host's `mountPickerSheetHeader`, which is the one place the family's
// phone-sheet header is now built. They are asserted against that route instead of against a
// direct call, and the host itself is asserted to reach `buildShellHeader`; what the whole section
// protects is unchanged, that no surface builds the engine's two-slot header for itself.
//
// The two calendar toolbars were the last raw sites; the calendar leg that owned those files
// migrated them itself, so they are pinned here with the rest. Nothing outside
// `mobile-bottom-sheet.ts` builds a `obnotion-panel-header`/`obnotion-panel-title` pair by hand any more.

const SHELL_HEADER_CONSUMER_FILES = [
  // The relation editor's phone header — editRelationPopover's body moved here from CellRenderer.
  "record-surface/cell-editor-relation.ts",
  "toolbar-primitives.ts",
  "owned-menu.ts",
  "sort-panel-renderer.ts",
  "dropdown-field.ts",
  "filter-panel-renderer.ts",
  "view-config-panel-renderer.ts",
  "column-manager-renderer.ts",
  "column-width.ts",
  "chart-toolbar-renderer.ts",
  "toolbar-renderer.ts",
  "record-surface/record-header.ts",
  "calendar-toolbar-renderer.ts",
  "calendar-timeline-toolbar-renderer.ts",
];

const PICKER_HOST_HEADER_FILES = [
  "date-value-picker.ts",
  "icon-picker-popover.ts",
  "option-color-picker.ts",
];

describe("the independent createSheetHeader sites route through the shell's three-slot header", () => {
  it.each(SHELL_HEADER_CONSUMER_FILES)("%s calls buildShellHeader rather than the engine's two-slot builder directly", (relativePath) => {
    const source = readFileSync(resolve(__dirname, relativePath), "utf8");
    expect(source).toContain("buildShellHeader(");
    expect(source).not.toContain("createSheetHeader(");
  });

  it.each(PICKER_HOST_HEADER_FILES)("%s reaches the shell header through the picker host", (relativePath) => {
    const source = readFileSync(resolve(__dirname, relativePath), "utf8");
    expect(source).toContain("mountPickerSheetHeader(");
    expect(source).not.toContain("createSheetHeader(");
  });

  it("builds the picker host's phone-sheet header with the shell's three-slot builder", () => {
    const hostSource = readFileSync(resolve(__dirname, "popover-host.ts"), "utf8");
    expect(hostSource).toContain("buildShellHeader(");
    expect(hostSource).not.toContain("createSheetHeader(");
  });

  it("leaves the engine's own default header builder calling createSheetHeader directly", () => {
    const engineSource = readFileSync(resolve(__dirname, "mobile-bottom-sheet.ts"), "utf8");
    expect(engineSource).toContain("createSheetHeader(panel, { title, onClose })");
  });
});
