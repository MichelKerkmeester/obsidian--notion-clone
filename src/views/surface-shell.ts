// ───────────────────────────────────────────────────────────────────
// MODULE:    surface-shell
// COMPONENT: one definition that produces a desktop modal or a phone sheet
// ───────────────────────────────────────────────────────────────────
//
// Every modal and every sheet in this plugin composed its chrome by hand: a presentation
// switch inside the base modal, a handful of surfaces that reached past it and drove the
// sheet engine directly, and a title recovered by scraping the first heading in the content
// because nothing ever declared one. This module is the one definition: it decides the
// presentation, resolves the title, and composes the sheet engine's chrome, header,
// placement and teardown in the order a caller used to have to remember for itself.
//
// It does not reimplement the sheet engine. Chrome, drag-to-dismiss, placement and the
// keyboard-aware reposition loop still live in the sibling modules this one imports, and
// whatever already asserts against their behaviour keeps asserting against exactly the same
// functions — this module only calls them, once, in one order.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { t } from "../i18n";
import { isTouchDevice } from "../data/touch-environment";
import { attachSheetChromeToModal, createSheetHeader, type SheetHeaderHandle } from "./mobile-bottom-sheet";
import { keepSheetPlaced, placeSheet } from "./popover-position";
import { overlayStack } from "./overlay-stack";

// ───────────────────────────────────────────────────────────────────
// 2. PRESENTATION
// ───────────────────────────────────────────────────────────────────

/**
 * How a surface presents on a touch device. Desktop is unaffected by all three.
 *
 * `sheet` — short, form-like surfaces. `fullscreen` — a workbench too wide to crush into a
 * sheet. `dialog` — opts out; stays a centred dialog everywhere. This is the one definition
 * of the type: a consumer that used to declare its own copy of these three names now points
 * at this one instead, so the two cannot drift apart.
 */
export type SurfaceShellPresentation = "sheet" | "fullscreen" | "dialog";

/**
 * Decide whether a requested presentation resolves to a sheet or a fullscreen surface.
 *
 * A surface that declares `sheet` is one whenever the device is touch. One that declares
 * `fullscreen` is one only when it is not already inside another open sheet, because a
 * workbench opened over a sheet reads as a second sheet stacked on the first, not as a
 * full-screen takeover of the surface already open.
 */
export function resolveShellPresentation(
  presentation: SurfaceShellPresentation,
  touch: boolean,
  hasSheetParent: boolean,
): { asSheet: boolean; asFullscreen: boolean } {
  const asSheet = touch && (presentation === "sheet" || hasSheetParent);
  const asFullscreen = touch && presentation === "fullscreen" && !hasSheetParent;
  return { asSheet, asFullscreen };
}

/** `resolveShellPresentation`, reading touch and the sheet-parent lookup from the element itself. */
export function resolveShellPresentationForElement(
  presentation: SurfaceShellPresentation,
  element: HTMLElement,
): { asSheet: boolean; asFullscreen: boolean } {
  const touch = isTouchDevice(element);
  const hasSheetParent = Boolean(overlayStack.getTopSurfaceForDocument(element.ownerDocument, { sheetsOnly: true }));
  return resolveShellPresentation(presentation, touch, hasSheetParent);
}

// ───────────────────────────────────────────────────────────────────
// 2b. SHELL ROLE
// ───────────────────────────────────────────────────────────────────

/**
 * What kind of surface this is, independent of how it presents.
 *
 * `design-trueup.md` §5 names five, measured against the census: `dialog` (a confirm or a
 * single-question prompt), `panel` (a form-like editor), `workbench` (the formula editor,
 * the one surface that keeps `fullscreen`), `menu` (an anchored, handle-less popover) and
 * `condition panel` (a filter/sort/column configuration surface). A surface declares its
 * own rather than the shell inferring one from its presentation — the same reasoning
 * already applied to the title: an undeclared role is a fact worth carrying, not a
 * default worth guessing.
 */
export type SurfaceShellRole = "dialog" | "panel" | "workbench" | "menu" | "condition panel";

// ───────────────────────────────────────────────────────────────────
// 3. THE DECLARED TITLE, AND THE COUNTED SCRAPE FALLBACK
// ───────────────────────────────────────────────────────────────────

/**
 * How many times a surface has resolved its title from the scrape fallback rather than a
 * declared one, since the module loaded (or since the count was last reset for a test).
 *
 * A surface's sheet title used to be a side effect of its heading markup, with no way to
 * tell how many surfaces still worked that way short of reading every subclass by hand. This
 * is the count a later pass drives toward zero as surfaces start declaring a title, rather
 * than a figure written down once and never checked again.
 */
let scrapeFallbackTitleUses = 0;

/** The count above, read rather than assumed. */
export function getScrapeFallbackTitleUseCount(): number {
  return scrapeFallbackTitleUses;
}

/** Test-only: put the count back to zero so one suite's reads do not leak into another's. */
export function resetScrapeFallbackTitleUseCountForTests(): void {
  scrapeFallbackTitleUses = 0;
}

/**
 * Resolve a surface's title: the declared value if one was given, the counted scrape
 * fallback otherwise.
 *
 * The fallback is called rather than inlined, because the only fallback in use today already
 * carries its own last-resort default; this function's job is only to decide which source
 * answers, and to count the times it had to ask the second one.
 */
export function resolveShellTitle(declared: string | undefined, getFallback?: () => string | undefined): string {
  const trimmedDeclared = declared?.trim();
  if (trimmedDeclared) return trimmedDeclared;
  scrapeFallbackTitleUses += 1;
  return getFallback?.()?.trim() || "";
}

// ───────────────────────────────────────────────────────────────────
// 4. GEOMETRY — NAMED VALUES, NOT PER-SURFACE LITERALS
// ───────────────────────────────────────────────────────────────────
//
// Every value below is a measured parity value, sampled off a reference capture, or an
// accepted accessibility exception with a contrast ratio behind it. The shell owns them as
// named constants so a consumer's stylesheet rule or inline style can point at one of these
// instead of repeating the number, which is what lets a scattered literal converge on a
// single source over time instead of never.

/** The seven properties counted as raw literals until a consumer reads them from here instead. */
export const SHELL_RADIUS_PX = 8;
export const SHELL_PADDING_X_PX = 16;
export const SHELL_PADDING_Y_PX = 8;
export const SHELL_DIVIDER_CLEARANCE_PX = 8;
export const SHELL_ROW_HEIGHT_PX = 28;
export const SHELL_PANEL_WIDTH_PX = 360;
export const SHELL_PHONE_CLOSE_PX = 44;

/** The rest of the desktop popover system, measured off the same capture set. */
export const SHELL_CONDITION_SURFACE_WIDTH_PX = 288;
export const SHELL_OPERATOR_DROPDOWN_WIDTH_PX = 232;

/**
 * The phone frame comes in two measured shapes, not one — a blanket inset on every side is
 * wrong for a near-full-height picker or search surface. A surface's declared height role
 * picks one; the shell does not infer it from content.
 */
export type SurfaceShellFrameShape = "floating" | "flush";

export const SHELL_PHONE_FLOATING_INSET_PT = 8;
export const SHELL_PHONE_FLOATING_RADIUS_PT = 16;
export const SHELL_PHONE_HANDLE_WIDTH_PT = 34;
export const SHELL_PHONE_HANDLE_HEIGHT_PT = 5;
export const SHELL_PHONE_ROW_HEIGHT_PT = 50;
export const SHELL_PHONE_HEADER_HEIGHT_PT = 70;
export const SHELL_PHONE_DIVIDER_INSET_PT = 20;
export const SHELL_PRIMARY_ACTION_HEIGHT_PT = 50;
export const SHELL_TRAILING_CHIP_SIZE_PT = 44;

/** A reconciled motion band, not a capture measurement — no static image carries timing. */
export const SHELL_ENTER_MS = 200;
export const SHELL_EXIT_MS = 150;

// ───────────────────────────────────────────────────────────────────
// 5. THE SUB-PAGE STACK
// ───────────────────────────────────────────────────────────────────
//
// A sub-page replaces the frame's header and body in place: no second sheet, no second
// registration with the shared overlay stack, and the frame itself never moves — it is the
// same node before and after the push. The bookkeeping below is kept separate from the DOM
// effect that reads it, so "replace, don't stack" is something a test can assert directly
// instead of only inferring from a rendered frame.

export interface SurfaceShellSubPageState {
  readonly stack: readonly string[];
}

export function createSubPageState(): SurfaceShellSubPageState {
  return { stack: [] };
}

export function pushSubPageTitle(state: SurfaceShellSubPageState, title: string): SurfaceShellSubPageState {
  return { stack: [...state.stack, title] };
}

export function popSubPageTitle(state: SurfaceShellSubPageState): SurfaceShellSubPageState {
  if (state.stack.length === 0) return state;
  return { stack: state.stack.slice(0, -1) };
}

/** The top of the stack, or `undefined` when no sub-page is open. */
export function topSubPageTitle(state: SurfaceShellSubPageState): string | undefined {
  return state.stack.length > 0 ? state.stack[state.stack.length - 1] : undefined;
}

/** Whether the header should show a back control right now. */
export function shellHasBack(state: SurfaceShellSubPageState): boolean {
  return state.stack.length > 0;
}

// ───────────────────────────────────────────────────────────────────
// 5b. THE THREE-SLOT HEADER
// ───────────────────────────────────────────────────────────────────
//
// The engine's own header builder produces two slots: a leading title, then whatever a
// caller inserts before the close. A header with a back affordance needs a third: a leading
// action distinct from the title, so the title can sit centred between it and the close.
// This wraps the engine call rather than changing it, so every other caller of that builder
// is unaffected until it opts into this shape for itself.

const SHELL_HEADER_CLASS = "db-shell-header";
const SHELL_HEADER_LEADING_CLASS = "db-shell-header-leading";
const SHELL_HEADER_TRAILING_CLASS = "db-shell-header-trailing";
const SHELL_HEADER_BACK_CLASS = "db-shell-back";

export interface SurfaceShellHeaderHandle extends SheetHeaderHandle {
  leadingEl: HTMLElement;
  trailingEl: HTMLElement;
}

/** Build the shell's own three-slot header: a leading slot, the centred title, and the close. */
export function buildShellHeader(
  panel: HTMLElement,
  options: {
    title: string;
    onClose: () => void;
    onBack?: () => void;
    /** Trailing controls built before the close, the same contract `createSheetHeader` carries. */
    beforeClose?(header: HTMLElement): void;
  },
): SurfaceShellHeaderHandle {
  const built = createSheetHeader(panel, {
    title: options.title,
    onClose: options.onClose,
    beforeClose: options.beforeClose,
  });
  built.header.addClass(SHELL_HEADER_CLASS);
  const leadingEl = built.header.createDiv({ cls: SHELL_HEADER_LEADING_CLASS });
  // `insertBefore` rather than `prepend`: the harnesses that mount this header on a hand-built
  // element (no jsdom) implement the DOM subset `createDiv`/`insertBefore` draws on, not the
  // newer `ParentNode` methods.
  built.header.insertBefore(leadingEl, built.header.children[0] ?? null);
  if (options.onBack) attachBackControl(leadingEl, options.onBack);
  // Everything `beforeClose` built plus the close button itself moves into one trailing box, so
  // the header has exactly three top-level slots rather than a leading slot facing a leading
  // title facing however many loose trailing children a caller added. Two loose trailing
  // children is exactly what broke centring: a leading slot pinned to the close button's own
  // 44px, and a trailing edge as wide as whatever `beforeClose` drew beside the close, so the
  // title's own flex box sat between two DIFFERENT widths instead of two equal ones. Grouping
  // the trailing side into one element gives it one width to mirror, and the stylesheet mirrors
  // it structurally (`1fr auto 1fr`) rather than by measuring anything at runtime.
  const trailingEl = built.header.createDiv({ cls: SHELL_HEADER_TRAILING_CLASS });
  for (const child of Array.from(built.header.children)) {
    if (child === leadingEl || child === built.titleEl || child === trailingEl) continue;
    trailingEl.appendChild(child);
  }
  return { ...built, leadingEl, trailingEl };
}

function attachBackControl(leadingEl: HTMLElement, onBack: () => void): HTMLButtonElement {
  const back = leadingEl.createEl("button", {
    cls: SHELL_HEADER_BACK_CLASS,
    attr: { type: "button", "aria-label": t("common.back") },
  });
  setIcon(back, "chevron-left");
  back.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onBack();
  };
  return back;
}

/** Reflect the current sub-page title and back-control state onto a shell header. */
function refreshShellHeader(
  handle: SurfaceShellHeaderHandle,
  title: string,
  hasBack: boolean,
  onBack: () => void,
): void {
  handle.titleEl.setText(title);
  handle.leadingEl.empty();
  if (hasBack) attachBackControl(handle.leadingEl, onBack);
}

// ───────────────────────────────────────────────────────────────────
// 6. THE SHELL
// ───────────────────────────────────────────────────────────────────

export interface SurfaceShellOptions {
  /** Requested presentation. `dialog` opts out of both touch presentations. */
  presentation: SurfaceShellPresentation;
  /** The element chrome, placement and the header apply to. */
  element: HTMLElement;
  /** A declared title. Omit to fall back to `getFallbackTitle`, counted when that happens. */
  title?: string;
  /** The pre-shell scrape fallback (e.g. a heading scrape). Its use is counted. */
  getFallbackTitle?(): string | undefined;
  /** What kind of surface this is. Omit while a surface has not declared one yet. */
  role?: SurfaceShellRole;
  close(): void;
  closeOnOutsidePointerDown?: boolean;
  closeOnEscape?: boolean;
}

export interface SurfaceShellHandle {
  /** Re-run presentation resolution — a rotation or a layout change calls this again. */
  apply(): void;
  /** Idempotent teardown. Safe to call more than once, and safe to call before `apply`. */
  destroy(): void;
  /** Whether the shell currently presents the element as a sheet. */
  readonly isSheet: boolean;
  /** Whether the shell currently presents the element fullscreen. */
  readonly isFullscreen: boolean;
  /** The declared role, or `undefined` when the surface has not adopted one yet. */
  readonly role: SurfaceShellRole | undefined;
  /** Push a sub-page: the header shows its title and a back control that pops it. */
  pushSubPage(title: string): void;
  /** Pop the current sub-page, returning to the one beneath it or to the root. */
  popSubPage(): void;
  readonly subPageDepth: number;
}

/**
 * Compose one surface's chrome, header, placement, title and teardown from one declaration.
 *
 * A caller that never touches sub-pages pays nothing for the stack above: it stays at depth
 * zero and the header this shell attaches is the same three-slot shape whether or not a back
 * control is ever shown.
 */
export function createSurfaceShell(options: SurfaceShellOptions): SurfaceShellHandle {
  let releaseChrome: (() => void) | undefined;
  let releasePlacement: (() => void) | undefined;
  let headerHandle: SurfaceShellHeaderHandle | undefined;
  let subPageState = createSubPageState();
  let sheet = false;
  let fullscreen = false;

  const resolveRootTitle = (): string => resolveShellTitle(options.title, options.getFallbackTitle);
  const currentTitle = (): string => topSubPageTitle(subPageState) ?? resolveRootTitle();

  const teardownChromeAndPlacement = (): void => {
    releasePlacement?.();
    releasePlacement = undefined;
    releaseChrome?.();
    releaseChrome = undefined;
    headerHandle = undefined;
  };

  const popCurrentSubPage = (): void => {
    subPageState = popSubPageTitle(subPageState);
    if (headerHandle) refreshShellHeader(headerHandle, currentTitle(), shellHasBack(subPageState), popCurrentSubPage);
  };

  return {
    get isSheet() {
      return sheet;
    },
    get isFullscreen() {
      return fullscreen;
    },
    get role() {
      return options.role;
    },
    get subPageDepth() {
      return subPageState.stack.length;
    },
    apply(): void {
      const { asSheet, asFullscreen } = resolveShellPresentationForElement(options.presentation, options.element);
      teardownChromeAndPlacement();
      sheet = asSheet;
      fullscreen = asFullscreen;
      if (!asSheet) {
        attachSheetChromeToModal(options.element, false, options.close);
        return;
      }
      subPageState = createSubPageState();
      releaseChrome = attachSheetChromeToModal(options.element, true, options.close, {
        getTitle: currentTitle,
        closeOnOutsidePointerDown: options.closeOnOutsidePointerDown,
        closeOnEscape: options.closeOnEscape,
        buildHeader: (panel, title, onClose) => {
          headerHandle = buildShellHeader(panel, { title, onClose });
          return headerHandle;
        },
      });
      placeSheet(options.element);
      releasePlacement = keepSheetPlaced(options.element);
    },
    destroy(): void {
      teardownChromeAndPlacement();
      attachSheetChromeToModal(options.element, false, options.close);
      sheet = false;
      fullscreen = false;
    },
    pushSubPage(title: string): void {
      subPageState = pushSubPageTitle(subPageState, title);
      if (headerHandle) refreshShellHeader(headerHandle, currentTitle(), shellHasBack(subPageState), popCurrentSubPage);
    },
    popSubPage: popCurrentSubPage,
  };
}
