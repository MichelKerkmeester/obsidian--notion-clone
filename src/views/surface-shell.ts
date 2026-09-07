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
import { attachSheetChromeToModal, createSheetHeader, SHEET_SURFACE_CLASS, type SheetHeaderHandle } from "./mobile-bottom-sheet";
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
/** The confirm's declared card frame: a floor, not a parity figure, since Notion's own
 *  thumbnails carry no sampled value to measure this against. */
export const SHELL_CARD_INSET_PT = 16;
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
// 4b. THE DESKTOP SIDE SHEET
// ───────────────────────────────────────────────────────────────────
//
// A fourth desktop shape, beside the modal, the anchored popover and the fullscreen workbench —
// a full-height panel docked to the pane's right edge, for a surface whose content is a form too
// long for an anchored dropdown's own height cap. The operator's report, 2026-09-06: "this
// dropdown on desktop is horrible … should probably become a sheet". The class is a marker a
// consumer's own panel opts into; this module does not mount or position one, because the two
// consumers this shape exists for (today: the database settings panel) already own a render loop
// that decides when their panel is visible at all.

/** Stamped on a consumer's own panel element to opt into the side-sheet CSS shape. */
export const SHELL_SIDE_SHEET_CLASS = "db-shell-side-sheet";

/**
 * Measured off Anytype's own right-hand object panel — `anytype-menu-object-properties-panel-
 * dark-full.png`, border column at device x 1832 of a 2168px window, 336px to the edge. Widened
 * here rather than copied: our settings body carries a multi-line description field and a
 * template picker Anytype's plain label/value list does not, the same reasoning the sort/filter
 * condition panel's own width already carries against its own 288px reference.
 */
export const SHELL_SIDE_SHEET_WIDTH_PX = 420;

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

/** Class for the measured 44 x 44pt trailing header control (a `+`, a toggle, an overflow). */
export const SHELL_HEADER_CHIP_CLASS = "db-shell-header-chip";

/** Build a trailing header chip at the shell's own measured size, into the trailing slot. */
export function buildShellHeaderChip(
  parent: HTMLElement,
  options: { icon: string; label: string; onClick(): void },
): HTMLButtonElement {
  const chip = parent.createEl("button", {
    cls: SHELL_HEADER_CHIP_CLASS,
    attr: { type: "button", "aria-label": options.label },
  });
  setIcon(chip, options.icon);
  chip.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    options.onClick();
  };
  return chip;
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
// 5c. REPLACE-IN-PLACE
// ───────────────────────────────────────────────────────────────────
//
// `design-trueup.md` §6 C4: no third stacked sheet, the third level replaces the second. The
// stack (`overlay-stack.ts`) decides *whether* — a new sheet whose resolved parent is already two
// deep is offered here before it is ever registered; this decides *how*. Scoped to the two roles
// `design-trueup.md` §5 calls form-like (`panel`, a form-like editor; `condition panel`, a
// filter/sort/column configuration surface) — a `dialog` or `menu`-role sheet never sets this at
// all, which is what keeps a menu-stack governed by nothing rather than by a role read here.

const REPLACEABLE_ROLES: ReadonlySet<SurfaceShellRole> = new Set(["panel", "condition panel"]);

/** A would-be third sheet's own title, read from what it already declared rather than guessed. */
function readReplacementTitle(panel: HTMLElement): string {
  const declared = panel.getAttribute("data-db-sheet-title")?.trim();
  if (declared) return declared;
  // Every Modal carries a `.modal-title` whether or not a subclass ever fills it in (the same
  // fact `attachSheetChromeToModal`'s own native-title guard reads elsewhere), so the first MATCH
  // is not necessarily the first one that says anything — the candidate list is walked in order
  // and the first with real text wins, rather than `querySelector`'s own document-order pick
  // stopping at an empty native title ahead of the real heading.
  for (const candidate of Array.from(panel.querySelectorAll<HTMLElement>(".db-panel-title, .modal-title, h1, h2, h3"))) {
    const text = candidate.textContent?.trim();
    if (text) return text;
  }
  return "";
}

/**
 * Absorb a would-be third sheet into this shell's own body, in place of stacking it.
 *
 * The child keeps its own element — reparented, not rebuilt — so whatever it already rendered and
 * whatever handlers it already wired (its own close included) keep working; it never becomes an
 * independent `.db-mobile-bottom-sheet` at all (`mobile-bottom-sheet.ts`'s `applySheetChrome`
 * short-circuits before the sheet class, the handle or a scrim ever reach it). Its own host
 * container — a real `Modal`'s `.modal-container`, when it has one — is hidden rather than
 * removed: the child's own teardown still owns detaching it eventually, and hiding is what a
 * caller that later needs the un-replaced state back would have to undo.
 */
function attemptReplace(
  parentElement: HTMLElement,
  childPanel: HTMLElement,
  onAccepted: (title: string, restore: () => void) => void,
): boolean {
  if (childPanel === parentElement || parentElement.contains(childPanel)) return false;
  const contentRoot = parentElement.querySelector<HTMLElement>(".note-database-modal") ?? parentElement;
  const bodyChildren = Array.from(contentRoot.children).filter((node) =>
    !node.classList.contains(SHELL_HEADER_CLASS) && node !== childPanel) as HTMLElement[];
  for (const node of bodyChildren) node.style.setProperty("display", "none");

  const hostContainer = childPanel.parentElement?.classList.contains("modal-container")
    ? childPanel.parentElement
    : null;
  hostContainer?.style.setProperty("display", "none");

  const title = readReplacementTitle(childPanel);
  childPanel.addClass("db-shell-replaced-body");
  contentRoot.appendChild(childPanel);

  onAccepted(title, () => {
    childPanel.remove();
    hostContainer?.style.removeProperty("display");
    for (const node of bodyChildren) node.style.removeProperty("display");
  });
  return true;
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
  /** A declared phone frame shape beside floating/flush. Omit for the inferred split. */
  frameRole?: "card";
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
  // Kept in lockstep with `subPageState.stack`: index-for-index, the cleanup a replaced sub-page
  // needs on the way back out, or a no-op for a sub-page pushed the ordinary way (a title only,
  // no absorbed element behind it).
  let replacementRestores: Array<() => void> = [];
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
    replacementRestores.pop()?.();
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
      replacementRestores = [];
      const canReplace = options.role !== undefined && REPLACEABLE_ROLES.has(options.role);
      releaseChrome = attachSheetChromeToModal(options.element, true, options.close, {
        getTitle: currentTitle,
        closeOnOutsidePointerDown: options.closeOnOutsidePointerDown,
        closeOnEscape: options.closeOnEscape,
        frameRole: options.frameRole,
        menuCard: options.role === "menu",
        buildHeader: (panel, title, onClose) => {
          headerHandle = buildShellHeader(panel, { title, onClose });
          return headerHandle;
        },
        replace: canReplace
          ? (childPanel) => attemptReplace(options.element, childPanel, (title, restore) => {
              subPageState = pushSubPageTitle(subPageState, title);
              replacementRestores.push(restore);
              if (headerHandle) refreshShellHeader(headerHandle, currentTitle(), shellHasBack(subPageState), popCurrentSubPage);
            })
          : undefined,
      });
      // Absorbed rather than presented: the depth cap handed this element to a parent shell's own
      // `replace`, and `applySheetChrome` took the sheet class back off to say so. Placing it
      // anyway would pin the grafted body to the viewport as a fixed, full-bleed layer — the
      // parent frame collapses behind it and the header this move just retitled goes off-screen —
      // so the sheet class is read back as the one authority on whether this element is a sheet at
      // all, rather than a second flag the two sides could disagree about.
      if (!options.element.hasClass(SHEET_SURFACE_CLASS)) return;
      placeSheet(options.element);
      releasePlacement = keepSheetPlaced(options.element);
    },
    destroy(): void {
      replacementRestores.splice(0).forEach((restore) => restore());
      teardownChromeAndPlacement();
      attachSheetChromeToModal(options.element, false, options.close);
      sheet = false;
      fullscreen = false;
    },
    pushSubPage(title: string): void {
      subPageState = pushSubPageTitle(subPageState, title);
      replacementRestores.push(() => undefined);
      if (headerHandle) refreshShellHeader(headerHandle, currentTitle(), shellHasBack(subPageState), popCurrentSubPage);
    },
    popSubPage: popCurrentSubPage,
  };
}
