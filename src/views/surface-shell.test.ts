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
  createSubPageState,
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
});

// ───────────────────────────────────────────────────────────────────
// 6. THE SHELL COMPOSES THE ENGINE; IT DOES NOT REACH PAST IT OR INTO A CONSUMER
// ───────────────────────────────────────────────────────────────────

const shellSource = readFileSync(resolve(__dirname, "./surface-shell.ts"), "utf8");
const dbModalSource = readFileSync(resolve(__dirname, "./modals/db-modal.ts"), "utf8");

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
    expect(shellSource).not.toMatch(/from ["']\.\/db-modal["']/);
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
});
