// ───────────────────────────────────────────────────────────────────
// MODULE:    list-renderer
// COMPONENT: renders the list view's rows and groups, and owns their
//            drag-reorder, drag-to-group and mobile move-menu behavior
// ───────────────────────────────────────────────────────────────────
//
// Manual reordering and cross-group moves share one drag payload format
// (path + batch + from-group MIME types) so a single drop handler can
// serve both plain reordering and grouped-row moves without guessing
// which case it is from the event alone. The desktop path is native HTML
// drag-and-drop; touch devices fall back to the mobile move menu instead,
// since dragover/drop never fire reliably on touch there.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, setIcon, setTooltip } from "obsidian";
import { isObsidianTagsKey, toMultiSelectValuesForKey } from "../data/column-types";
import { isExplicitlySorted } from "../data/manual-order";
import { getColumnDisplayType } from "../data/column-display";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey } from "../data/file-fields";
import { formatGroupKeyDisplay, isComputedGroupField } from "../data/group-display";
import { renderGroupLabel } from "./group-label-renderer";
import { markNoteHoverLink } from "./hover-link-preview";
import { ColumnDef, CreateEntryPosition, NO_TITLE_FIELD, RowCreateContext, RowData, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { setFieldTooltip } from "./field-tooltip";
import { EMPTY_ROWS, buildDuplicateNameIndex, getFileTitleDisplay, renderStackedFileTitle } from "./file-title-display";
import { isHTMLElement } from "./dom-guards";
import { renderMobileMoveIcon } from "./mobile-move-icon";
import { getFieldWidth, listFieldTrackTemplate } from "./column-width";
import { renderGroupExpandControls } from "./group-expand-controls";
import { getGroupVisibleCount } from "../data/group-visibility";
import { DragDropFeedbackState, resolveDropPlacement } from "./drag-drop-feedback";
import { resolveTitleFieldDisplay } from "../data/title-field-display";
import { EmptyStateOptions, EmptyStateRenderer } from "./empty-state-renderer";
import { renderCardField } from "./card-field-renderer";
import { createCheckbox } from "./checkbox";
import { attachLongPress, isTouchDevice } from "../data/touch-environment";
import { CardRovingController, syncCardRoving, wireCardKeyboard } from "./card-roving-tabindex";
import { isImeComposing } from "../data/keyboard-utils";
import { createOwnedMenuForEvent, OwnedMenuHandle } from "./owned-menu";
import { openExternalUrl } from "./open-external";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

/**
 * Can two properties share a line in a field area this wide?
 *
 * The decision `shouldReserveColumns` makes, lifted out of it so a check can ask the same question
 * the renderer asked instead of re-deriving it. It was a private method needing a rendered element,
 * which meant a width sweep could only compare its own arithmetic against the renderer's — and a
 * sweep built that way passes a renderer that reserves everywhere, because both sides move together.
 *
 * The test is the two NARROWEST declared widths plus one column gap, deliberately: the uncertain
 * cases resolve toward reserving, because a needless reservation costs height while a needless skip
 * costs the alignment the mechanism exists to hold. So there is a band where this says yes and the
 * pair the data actually renders still does not fit — 14 reservations at a 268px field area, where
 * only one property lands per line. That band is intended, and a check that fails it fails a correct
 * renderer.
 */
export function reservesColumnsOnWrappingLine(
  fieldWidths: readonly number[],
  columnGap: number,
  fieldAreaWidth: number,
): boolean {
  if (fieldWidths.length < 2) return true;
  const widths = [...fieldWidths].sort((a, b) => a - b);
  return widths[0] + columnGap + widths[1] <= fieldAreaWidth;
}

const ROW_MIME = "application/x-note-database-row";
const ROW_FROM_GROUP_MIME = "application/x-note-database-row-from-group";
const ROW_BATCH_MIME = "application/x-note-database-row-batch";

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ListGroup {
  key: string;
  rows: RowData[];
  count: number;
}

export interface ListRendererActions {
  openRow(row: RowData): void;
  openRecordDetail?(anchorEl: HTMLElement, row: RowData): void;
  createEntry(defaults?: Record<string, unknown>, position?: CreateEntryPosition): void;
  isRowSelected(row: RowData): boolean;
  toggleRowSelected(row: RowData, selected: boolean, event?: MouseEvent): void;
  areAllRowsSelected(rows: RowData[]): boolean;
  toggleRowsSelected(rows: RowData[], selected: boolean): void;
  editCell(target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent): void;
  saveCellValue?(row: RowData, col: ColumnDef, value: number): void | Promise<void | boolean>;
  editFileName?(target: HTMLElement, row: RowData, currentName: string): void;
  getColumns(config: ViewConfig): ColumnDef[];
  moveRowToPosition(movedPath: string, beforePath?: string, afterPath?: string): void;
  moveRowsToGroup?(row: RowData, field: string, fromGroupKey: string, toGroupKey: string): void | Promise<void>;
  moveRowToGroupAndPosition?(
    row: RowData,
    field: string,
    fromGroupKey: string,
    toGroupKey: string,
    beforePath?: string,
    afterPath?: string,
    movedPaths?: string[],
  ): void | Promise<void>;
  moveRowsToPosition?(movedPaths: string[], beforePath?: string, afterPath?: string): void;
  getSelectedRows?(): RowData[];
  isGroupCollapsed?(field: string, key: string): boolean;
  toggleGroupCollapsed?(field: string, key: string): void;
  expandGroup?(field: string, key: string, count: number): void;
  showRowMenu?(event: MouseEvent, row: RowData, context?: RowCreateContext): void;
  showColumnMenu?(event: MouseEvent, col: ColumnDef, anchorEl?: HTMLElement): void;
  editFormula?(col: ColumnDef): void;
  renderRecordIcon?(parent: HTMLElement, row: RowData, config: ViewConfig, compact?: boolean): HTMLElement | null;
  renderGroupSummaries?(parent: HTMLElement, rows: RowData[], config: ViewConfig): void;
  applyConditionalFormat?(element: HTMLElement, row: RowData, config: ViewConfig, targetField?: string): void;
  readonly isReadOnly?: boolean;
  readonly hideCreateEntry?: boolean;
}

interface ParsedLink {
  label: string;
  target: string;
  external: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 4. LIST RENDERER
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// WINDOWING SHAPES
// ───────────────────────────────────────────────────────────────────

/**
 * Below this many rows the list renders whole, exactly as it always has.
 *
 * Chosen so every screenshot fixture and placement story stays on the unwindowed path: they are
 * all small, and a window engaging for twelve rows would rewrite hundreds of captures to no
 * purpose. It also keeps the cheap case from paying for the expensive one — a scroll listener and
 * a spacer pair buy nothing on a list that fits on screen.
 */
const WINDOW_THRESHOLD = 120;

/** Rows kept mounted beyond each edge, so a scroll of a few rows shows content rather than blank. */
const OVERSCAN = 8;

/** Only ever the first guess, replaced by a measurement as soon as one row is on screen. */
const ESTIMATED_ROW_HEIGHT = 44;

/** Used when the scroller reports no height, which a detached or unsized host does. */
const FALLBACK_VIEWPORT_PX = 800;

/**
 * A group large enough to be worth windowing on its own.
 *
 * Higher than the flat threshold because a grouped list pays for its sections whatever happens, and
 * a list of many small groups is already bounded by having few rows in each. This engages only for
 * the shape that actually blocked: one group holding thousands of rows.
 */
const GROUP_WINDOW_THRESHOLD = 200;

interface GroupWindow {
  container: HTMLElement;
  list: HTMLElement;
  config: ViewConfig;
  rows: RowData[];
  groupField: string;
  groupKey: string;
  groups: ListGroup[];
  scroller: HTMLElement;
  rowHeight: number;
  start: number;
  end: number;
  onScroll: () => void;
}

interface ListWindow {
  container: HTMLElement;
  list: HTMLElement;
  config: ViewConfig;
  rows: RowData[];
  scroller: HTMLElement;
  rowHeight: number;
  start: number;
  end: number;
  onScroll: () => void;
}

/**
 * The nearest ancestor that actually scrolls.
 *
 * The plugin's own container is usually it — it carries `height: 100%` and `overflow: auto` so the
 * table header can stick to it — but a list can also be embedded, and then the scroller is
 * something the embed owns. Asking the computed style rather than assuming the container means an
 * embedded list windows against the box it really moves inside.
 */
function findScrollParent(from: HTMLElement): HTMLElement {
  const doc = from.ownerDocument;
  const view = doc.defaultView;
  let node: HTMLElement | null = from;
  while (node && node !== doc.body) {
    const overflowY = view?.getComputedStyle(node).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return (doc.scrollingElement as HTMLElement | null) || doc.body || from;
}

export class ListRenderer {
  private container: HTMLElement | null = null;
  private rowByPath = new Map<string, RowData>();
  /** Basenames shared by more than one row, rebuilt whenever the row set is. */
  private duplicateNames: ReadonlySet<string> = new Set<string>();
  private draggingPath: string | undefined;
  private draggingPaths: string[] = [];
  private rowDropFeedback = new DragDropFeedbackState();
  private emptyStateRenderer = new EmptyStateRenderer();
  private rovingController = new CardRovingController();
  /**
   * Whether this render is laying out for touch, decided once for the whole render.
   *
   * Read per row, this hangs the app. Deciding it means measuring the container, and measuring
   * inside a loop that is also appending to that container forces the browser to lay out
   * everything built so far, once per row — so the work grows with the square of the row count.
   * Measured on a twenty-one property database: 1,600 rows took 7.2 seconds of blocked main
   * thread, and 185ms once the measurement moved out of the loop.
   *
   * It is safe to decide once because nothing it reads — platform, pointer type, container width —
   * can change while a synchronous render is running.
   */
  private touchMode = false;
  /**
   * Whether a property with no value reserves its slot, decided once for the whole render.
   *
   * A reservation makes a slot an index rather than a count, which is what stops the first column
   * holding Cost on one card and Payment on the next. It is worth its cost on every surface that
   * puts two properties side by side — the desktop grid, and a wrapping line wide enough to fit a
   * pair. It is worth nothing on a surface that fits one property per line, because there every
   * property sits at x=0 whether the renderer claims its slot by index or by count.
   *
   * On that last surface it is not merely useless, it is expensive: a reserved box on a wrapping
   * line takes a whole wrapped line plus the row gap under it. Measured on a twenty-one property
   * database at thirty percent fill, that is 84px of dead height per card — a twelve-card list of
   * 3,131px where the same data without reservations measures 2,123px.
   *
   * `touchMode` is not this question. It answers whether the surface takes touch input, and is
   * true for a tablet, a touchscreen laptop and any pane under 760px, all of which still put
   * properties side by side. Neither is the phone class: the same phone rotated to landscape fits
   * two per line, and dropping reservations there was measured putting one property in three
   * different columns across twelve cards.
   */
  private reservesColumns = true;
  /** Cleared at the top of each render, set the first time a row asks. */
  private reservationDecided = false;
  /** Live only while a windowed list is mounted; undefined for a fully rendered one. */
  private windowing?: ListWindow;
  /** One entry per oversized group section. A grouped list is many lists, each windowed alone. */
  private groupWindows: GroupWindow[] = [];
  private groupScroller?: HTMLElement;
  private groupScrollListener?: () => void;

  constructor(private app: App, private actions: ListRendererActions) {}

  render(container: HTMLElement, config: ViewConfig, rows: RowData[], emptyState?: EmptyStateOptions): void {
    this.clear(container);
    this.container = container;
    this.touchMode = isTouchDevice(container);
    this.reservesColumns = true;
    this.reservationDecided = false;
    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    this.duplicateNames = buildDuplicateNameIndex([...this.rowByPath.values()]);
    if (rows.length > 0) this.renderTotalHeader(container, rows);
    const list = this.createList(container, config);
    if (rows.length === 0) {
      this.emptyStateRenderer.renderCard(list, emptyState || { reason: "no-matching-data" });
    }
    if (rows.length > WINDOW_THRESHOLD) {
      this.mountWindow(container, list, config, rows);
      return;
    }
    for (const row of rows) this.renderRow(list, config, row, undefined, undefined, undefined, rows);
    this.renderNewRow(list, undefined, rows);
    syncCardRoving(container, this.rovingController, ".db-list-row");
  }

  // ───────────────────────────────────────────────────────────────────
  // WINDOWING
  // ───────────────────────────────────────────────────────────────────

  /**
   * Render only the rows near the viewport, with spacers standing in for the rest.
   *
   * Measured at the operator's shape — 3,000 rows, 21 columns, full fill, 6x throttle — a full
   * render blocks the main thread for 4,748.6ms, of which 3,547.0ms is layout over 225,007 nodes.
   * Layout is three quarters of the cost and is proportional to how many nodes EXIST, not to how
   * they were built, so nothing inside the row loop reaches it. Rendering fewer rows is the only
   * lever, and it has to clear a 2.4x gap.
   *
   * Below the threshold nothing changes: no spacers, no listener, the same DOM a full render
   * produces. That is deliberate. Every screenshot fixture and placement story is small, and a
   * window that engaged for twelve rows would change 236 captures to no purpose while making the
   * cheap case pay for the expensive one.
   *
   * Row height is MEASURED rather than assumed. `.db-list-row` is `min-height: 44px`, so a row
   * grows when its fields wrap; a spacer sized from a guessed constant produces a scroll bar that
   * lies about where it is. The first window is rendered, the rows it produced are measured, and
   * that average sizes the spacers — refined on every recycle, so the estimate improves as the
   * user scrolls through taller and shorter rows rather than being fixed by whatever the first
   * screen happened to hold.
   */
  private mountWindow(container: HTMLElement, list: HTMLElement, config: ViewConfig, rows: RowData[]): void {
    const scroller = findScrollParent(container);
    const state: ListWindow = {
      container,
      list,
      config,
      rows,
      scroller,
      // A starting guess only. It is replaced by a measurement as soon as one row exists, and the
      // first paint is the one place it has to come from somewhere.
      rowHeight: ESTIMATED_ROW_HEIGHT,
      start: -1,
      end: -1,
      onScroll: () => this.updateWindow(),
    };
    this.windowing = state;
    this.updateWindow();
    scroller.addEventListener("scroll", state.onScroll, { passive: true });
  }

  /** Recompute which rows belong on screen, and rebuild the list only if that answer changed. */
  private updateWindow(): void {
    const state = this.windowing;
    if (!state || !state.list.isConnected) return;

    const viewport = state.scroller.clientHeight || FALLBACK_VIEWPORT_PX;
    // Where the list starts inside the scroller. Without this the window is computed as though the
    // list began at the top of the pane, and everything above it — the toolbar, the total header —
    // shifts the answer by its own height.
    const listTop = state.list.offsetTop - state.scroller.offsetTop;
    const scrolled = Math.max(0, state.scroller.scrollTop - listTop);

    const first = Math.floor(scrolled / state.rowHeight);
    const visible = Math.ceil(viewport / state.rowHeight);
    const start = Math.max(0, first - OVERSCAN);
    const end = Math.min(state.rows.length, first + visible + OVERSCAN);
    if (start === state.start && end === state.end) return;

    state.start = start;
    state.end = end;
    this.paintWindow(state);
  }

  /**
   * Rebuild the list's contents for the current window.
   *
   * The whole list is rebuilt rather than diffed. A window is a few dozen rows, so rebuilding it
   * costs about what one screen of the old render cost — and a diff would have to reason about
   * which rows moved, which is where a recycler usually goes wrong.
   */
  private paintWindow(state: ListWindow): void {
    const { list, config, rows, start, end } = state;
    list.empty();

    const topSpacer = list.createDiv({ cls: "db-list-window-spacer" });
    topSpacer.setCssProps({ height: `${Math.round(start * state.rowHeight)}px` });

    for (let index = start; index < end; index += 1) {
      const row = rows[index];
      if (row) this.renderRow(list, config, row, undefined, undefined, undefined, rows);
    }

    const bottomSpacer = list.createDiv({ cls: "db-list-window-spacer" });
    bottomSpacer.setCssProps({ height: `${Math.round((rows.length - end) * state.rowHeight)}px` });

    // The create affordance belongs after every row, including the ones the bottom spacer stands
    // in for, so it sits below that spacer rather than in the middle of the list.
    this.renderNewRow(list, undefined, rows);
    syncCardRoving(state.container, this.rovingController, ".db-list-row");

    this.measureRowHeight(state, topSpacer, bottomSpacer);
  }

  /**
   * Take the row height from what was actually rendered, and resize the spacers if it moved.
   *
   * THREE layout reads, not one per row. The first version of this summed `offsetHeight` across
   * every painted row — which is the forced-read-per-row shape the renderer assertion exists to
   * catch, and it caught it: 13 reads against a bound of 8. Bounded by the window rather than by
   * the row count is not the same as bounded, and the assertion was right to say so.
   *
   * Spanning the first and last row gives the same average for a constant cost: where the block of
   * rows starts, where it ends, and how many are in it. Rows can differ in height and this reports
   * their mean, which is exactly what a spacer standing in for a few thousand of them needs.
   */
  private measureRowHeight(state: ListWindow, topSpacer: HTMLElement, bottomSpacer: HTMLElement): void {
    const painted = state.list.querySelectorAll<HTMLElement>(".db-list-row");
    const first = painted[0];
    const last = painted[painted.length - 1];
    if (!first || !last) return;
    const span = last.offsetTop + last.offsetHeight - first.offsetTop;
    const measured = span / painted.length;
    if (measured <= 0 || Math.abs(measured - state.rowHeight) < 0.5) return;

    state.rowHeight = measured;
    topSpacer.setCssProps({ height: `${Math.round(state.start * measured)}px` });
    bottomSpacer.setCssProps({ height: `${Math.round((state.rows.length - state.end) * measured)}px` });
  }

  /**
   * Window one group's rows against that section's own position in the scroller.
   *
   * A grouped list is many lists. Rather than compute every section's offset analytically — which
   * means modelling each header, create-row and expand-control it sits above, and drifting as soon
   * as one of them changes — each section asks the browser where IT is and windows from there. The
   * cost is one layout read per section per recycle, bounded by the number of groups on screen.
   */
  private mountGroupWindow(
    container: HTMLElement,
    list: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    groupField: string,
    groupKey: string,
    groups: ListGroup[],
  ): void {
    const scroller = findScrollParent(container);
    const state: GroupWindow = {
      container,
      list,
      config,
      rows,
      groupField,
      groupKey,
      groups,
      scroller,
      rowHeight: ESTIMATED_ROW_HEIGHT,
      start: -1,
      end: -1,
      onScroll: () => this.updateGroupWindows(),
    };
    this.groupWindows.push(state);
    this.paintGroupWindow(state);
    if (this.groupWindows.length === 1) {
      this.groupScrollListener = state.onScroll;
      scroller.addEventListener("scroll", state.onScroll, { passive: true });
      this.groupScroller = scroller;
    }
  }

  /** Recompute every windowed group. Groups off screen collapse to their spacers. */
  private updateGroupWindows(): void {
    for (const state of this.groupWindows) {
      if (!state.list.isConnected) continue;
      const viewport = state.scroller.clientHeight || FALLBACK_VIEWPORT_PX;
      // Where this section's rows begin, relative to the scrolled content.
      const listTop = state.list.offsetTop - state.scroller.offsetTop;
      const scrolled = state.scroller.scrollTop - listTop;
      const first = Math.floor(Math.max(0, scrolled) / state.rowHeight);
      const visible = Math.ceil(viewport / state.rowHeight);
      const start = Math.max(0, first - OVERSCAN);
      const end = Math.min(state.rows.length, first + visible + OVERSCAN);
      if (start === state.start && end === state.end) continue;
      state.start = start;
      state.end = end;
      this.paintGroupWindow(state);
    }
  }

  private paintGroupWindow(state: GroupWindow): void {
    const { list, config, rows, groupField, groupKey, groups } = state;
    if (state.start < 0) {
      const viewport = state.scroller.clientHeight || FALLBACK_VIEWPORT_PX;
      state.start = 0;
      state.end = Math.min(rows.length, Math.ceil(viewport / state.rowHeight) + OVERSCAN);
    }
    // Only the rows are swapped. The section's header, create-row and expand controls are siblings
    // of this list and are never touched, so a recycle cannot disturb them.
    for (const old of Array.from(list.querySelectorAll(".db-list-row, .db-list-window-spacer"))) old.remove();

    const topSpacer = list.createDiv({ cls: "db-list-window-spacer" });
    topSpacer.setCssProps({ height: `${Math.round(state.start * state.rowHeight)}px` });
    list.prepend(topSpacer);

    let anchor: HTMLElement = topSpacer;
    for (let index = state.start; index < state.end; index += 1) {
      const row = rows[index];
      if (!row) continue;
      this.renderRow(list, config, row, groupField, groupKey, groups, rows);
      const built = list.lastElementChild as HTMLElement | null;
      if (built && built !== anchor) {
        anchor.after(built);
        anchor = built;
      }
    }

    const bottomSpacer = list.createDiv({ cls: "db-list-window-spacer" });
    bottomSpacer.setCssProps({ height: `${Math.round((rows.length - state.end) * state.rowHeight)}px` });
    anchor.after(bottomSpacer);

    this.measureGroupRowHeight(state, topSpacer, bottomSpacer);
    syncCardRoving(state.container, this.rovingController, ".db-list-row");
  }

  /** Three layout reads, as the flat window uses: where the block starts, where it ends, how many. */
  private measureGroupRowHeight(state: GroupWindow, topSpacer: HTMLElement, bottomSpacer: HTMLElement): void {
    const painted = state.list.querySelectorAll<HTMLElement>(".db-list-row");
    const first = painted[0];
    const last = painted[painted.length - 1];
    if (!first || !last) return;
    const span = last.offsetTop + last.offsetHeight - first.offsetTop;
    const measured = span / painted.length;
    if (measured <= 0 || Math.abs(measured - state.rowHeight) < 0.5) return;
    state.rowHeight = measured;
    topSpacer.setCssProps({ height: `${Math.round(state.start * measured)}px` });
    bottomSpacer.setCssProps({ height: `${Math.round((state.rows.length - state.end) * measured)}px` });
  }

  /** Stop listening when the list this window belongs to is torn down. */
  private releaseWindow(): void {
    const state = this.windowing;
    if (!state) return;
    state.scroller.removeEventListener("scroll", state.onScroll);
    this.windowing = undefined;
  }

  /** The grouped equivalent: one shared listener for however many sections were windowed. */
  private releaseGroupWindows(): void {
    if (this.groupScroller && this.groupScrollListener) {
      this.groupScroller.removeEventListener("scroll", this.groupScrollListener);
    }
    this.groupScroller = undefined;
    this.groupScrollListener = undefined;
    this.groupWindows = [];
  }

  renderGrouped(
    container: HTMLElement,
    config: ViewConfig,
    groups: ListGroup[],
    groupField: string,
    emptyState?: EmptyStateOptions,
  ): void {
    this.clear(container);
    this.container = container;
    this.touchMode = isTouchDevice(container);
    this.reservesColumns = true;
    this.reservationDecided = false;
    this.rowByPath = new Map(groups.flatMap((group) => group.rows.map((row) => [row.file.path, row] as const)));
    this.duplicateNames = buildDuplicateNameIndex([...this.rowByPath.values()]);
    const grouped = container.createDiv({ cls: "db-list-grouped" });
    let actionsRendered = false;
    for (const group of groups) {
      const section = grouped.createDiv({ cls: "db-list-group" });
      const sectionId = `group-section-${encodeURIComponent(`${groupField}:${group.key}`)}`;
      section.setAttr("id", sectionId);
      const header = section.createDiv({ cls: "db-list-group-header" });
      this.setupGroupDropTarget(header, groupField, group.key);
      const collapsed = Boolean(this.actions.isGroupCollapsed?.(groupField, group.key));
      section.toggleClass("is-collapsed", collapsed);
      const label = header.createSpan({ cls: "db-list-group-header-label" });
      const toggle = label.createEl("button", {
        cls: `db-list-group-toggle${collapsed ? " is-collapsed" : ""}`,
        attr: { type: "button", "aria-label": collapsed ? t("group.expand") : t("group.collapse"), "aria-expanded": String(!collapsed), "aria-controls": sectionId },
      });
      toggle.createSpan({ cls: "db-collapse-triangle" });
      toggle.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.actions.toggleGroupCollapsed?.(groupField, group.key);
      };
      this.renderGroupCheckbox(label, group.rows, group.key || t("common.noGroup"));
      renderGroupLabel(label, config, groupField, group.key, "db-list-group-title");
      label.createSpan({ cls: "db-list-group-count", text: String(group.count) });
      this.actions.renderGroupSummaries?.(label, group.rows, config);
      if (!collapsed && !this.actions.isReadOnly && !this.actions.hideCreateEntry) {
        const newButton = header.createEl("button", {
          cls: "db-list-group-new",
          text: `+ ${t("toolbar.new")}`,
          attr: { type: "button" },
        });
        newButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (isComputedGroupField(config, groupField)) return;
          this.createEntryNearEnd({ [groupField]: group.key || "" }, group.rows);
        };
      }
      if (collapsed) continue;
      const list = this.createList(section, config);
      this.setupGroupDropTarget(list, groupField, group.key);
      const visibleCount = getGroupVisibleCount(config, groupField, group.key, group.rows.length);
      if (visibleCount === 0) {
        const groupEmptyOptions: EmptyStateOptions = emptyState
          ? (actionsRendered && emptyState.actions
            ? { ...emptyState, actions: undefined }
            : emptyState)
          : { reason: "empty-group" };
        if (groupEmptyOptions.actions && groupEmptyOptions.actions.length > 0) {
          actionsRendered = true;
        }
        const empty = this.emptyStateRenderer.renderCard(
          list,
          groupEmptyOptions,
        );
        empty.addClass("db-list-empty-group");
      }
      const shown = group.rows.slice(0, visibleCount);
      if (shown.length > GROUP_WINDOW_THRESHOLD) {
        // One oversized group is the case that still blocked after the flat list was windowed:
        // grouping does have a row cap, but `groupRowLimit` defaults to 0, which means "all".
        // Sections are laid out by the browser, so this window is derived from THIS section's own
        // measured position rather than from arithmetic across every section above it — which
        // would have to model each section's header, create-row and expand controls to stay true.
        this.mountGroupWindow(container, list, config, shown, groupField, group.key, groups);
      } else {
        for (const row of shown) this.renderRow(list, config, row, groupField, group.key, groups, group.rows);
      }
      const computedGroup = isComputedGroupField(config, groupField);
      this.renderNewRow(list, computedGroup ? undefined : { [groupField]: group.key || "" }, group.rows, computedGroup);
      renderGroupExpandControls(list, config, groupField, group.key, group.rows.length, this.actions);
    }
    syncCardRoving(container, this.rovingController, ".db-list-row");
  }

  private renderTotalHeader(container: HTMLElement, rows: RowData[]): void {
    const header = container.createDiv({ cls: "db-list-total-header" });
    const label = header.createSpan({ cls: "db-list-group-header-label" });
    this.renderGroupCheckbox(label, rows, t("common.total"));
    label.createSpan({ cls: "db-list-group-title", text: t("common.total") });
    label.createSpan({ cls: "db-list-group-count", text: String(rows.length) });
  }

  private renderGroupCheckbox(parent: HTMLElement, rows: RowData[], label?: string): void {
    if (this.actions.isReadOnly) return;
    const checkbox = createCheckbox(parent, {
      role: "row",
      cls: "db-list-group-checkbox",
      attr: { "aria-label": label || t("common.total") },
    });
    checkbox.checked = this.actions.areAllRowsSelected(rows);
    checkbox.indeterminate = rows.some((row) => this.actions.isRowSelected(row)) && !checkbox.checked;
    checkbox.onclick = (event) => event.stopPropagation();
    checkbox.onchange = () => this.actions.toggleRowsSelected(rows, checkbox.checked);
  }

  private createList(parent: HTMLElement, config: ViewConfig): HTMLElement {
    const list = parent.createDiv({ cls: "db-list", attr: { role: "grid" } });
    if (config.listCompactFields === true) list.addClass("is-compact-fields");
    return list;
  }

  private renderRow(list: HTMLElement, config: ViewConfig, row: RowData, groupField?: string, groupKey?: string, groups?: ListGroup[], allRows?: RowData[]): void {
    const item = list.createDiv({
      cls: "db-list-row",
      attr: {
        "data-note-database-row-path": row.file.path,
        title: row.file.path,
        role: "row",
        "aria-keyshortcuts": "Enter Space F2",
      },
    });
    wireCardKeyboard({
      card: item,
      rovingController: this.rovingController,
      onActivate: this.actions.openRecordDetail ? () => this.actions.openRecordDetail?.(item, row) : undefined,
      ignoreSelector: "a, button, input, select, textarea, .db-cell-editing",
    });
    if (this.actions.openRecordDetail) {
      item.addEventListener("click", (event) => {
        if (isHTMLElement(event.target) && event.target.closest("a, button, input, select, textarea, .db-cell-editing")) return;
        this.actions.openRecordDetail?.(item, row);
      });
    }
    this.actions.applyConditionalFormat?.(item, row, config);
    this.attachRowContextMenu(item, row, {
      visibleRows: allRows,
      groups: groupField && groupKey != null ? [{ field: groupField, key: groupKey }] : undefined,
    });
    if (allRows) {
      if (this.canManualReorder(config)) this.setupReorderDrag(item, config, row, allRows, groupField, groupKey);
      else this.setupGroupedRowDrag(item, row, groupField, groupKey);
    }
    const controls = item.createDiv({ cls: "db-list-row-controls" });
    if (!this.actions.isReadOnly) {
      const checkbox = createCheckbox(controls, {
        role: "row",
        cls: "db-list-row-checkbox",
        attr: { "aria-label": row.file.basename || row.file.path },
      });
      checkbox.checked = this.actions.isRowSelected(row);
      checkbox.onclick = (event) => {
        event.stopPropagation();
        this.actions.toggleRowSelected(row, !this.actions.isRowSelected(row), event);
      };
    }
    const openBtn = controls.createEl("button", {
      cls: "db-list-row-open",
      attr: { type: "button", "aria-label": t("menu.openNote") },
    });
    setIcon(openBtn, "maximize-2");
    setTooltip(openBtn, t("menu.openNote"), { delay: 100 });
    openBtn.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.openRow(row);
    };
    // The move menu is the only reorder path that does not require dragging, so it
    // stays available on every pointer type rather than touch alone.
    if (!this.actions.isReadOnly && (this.canManualReorder(config) || Boolean(groupField && groups?.length))) {
      this.renderMobileMoveButton(controls, config, row, allRows || [], groupField, groupKey, groups);
    }

    const columns = this.actions.getColumns(config);
    const main = item.createDiv({ cls: "db-list-row-main" });
    const titleField = this.getTitleField(config);
    const titleCol = titleField ? config.schema.columns.find((col) => col.key === titleField) : undefined;
    const titleDisplay = titleField ? resolveTitleFieldDisplay(row, config, titleField) : undefined;
    if (titleDisplay && !titleDisplay.isHidden) {
      const titleLine = main.createDiv({ cls: "db-record-title-line" });
      this.actions.renderRecordIcon?.(titleLine, row, config);
      const title = titleLine.createDiv({
        cls: "db-list-row-title",
        attr: { title: titleDisplay.isFileTitle ? row.file.path : titleDisplay.isEmpty ? "" : titleDisplay.text },
      });
      markNoteHoverLink(title, row.file.path, row.file.path);
      if (titleDisplay.isFileTitle) {
        renderStackedFileTitle(title, getFileTitleDisplay(row, EMPTY_ROWS, this.duplicateNames), true);
      } else {
        title.textContent = titleDisplay.text;
        if (titleDisplay.isEmpty) title.addClass("is-empty-title");
      }
      if (titleCol) {
        if (titleCol.key === "file.name" && this.actions.editFileName) {
          if (!this.actions.isReadOnly) {
            title.addClass("db-editable-cell");
            setFieldTooltip(title, row.file.path, t("cell.doubleClickRename"));
            title.addEventListener("dblclick", (event) => {
              if (this.actions.isReadOnly) return;
              event.stopPropagation();
              this.actions.editFileName?.(title, row, row.file.basename);
            });
          }
        } else {
          title.onclick = (event) => {
            if (this.actions.isReadOnly) return;
            event.stopPropagation();
            this.actions.editCell(title, row, titleCol, event);
          };
        }
      }
    }

    const meta = main.createDiv({ cls: "db-list-row-meta" });
    const fields = columns.filter((col) => col.key !== titleField);
    // Declared here because the per-column width lives on the field element, where a track sizing
    // rule on the container cannot read it. Without this every track takes the 150px default and a
    // resized column overflows the slot it was given.
    meta.style.gridTemplateColumns = listFieldTrackTemplate(config, fields);
    for (const [index, col] of fields.entries()) {
      const value = this.getCellValue(row, col);
      const displayType = this.getDisplayType(config, col);
      const empty = this.isEmptyValue(value) && displayType !== "checkbox";
      const hidden = empty && config.showEmptyFields !== true;
      // Nothing to hold where one property fills a line on its own: the reservation would buy a
      // blank line and the gap under it, and the survivors already start where they should.
      if (hidden && !this.reservesColumns) continue;
      const field = hidden
        ? this.renderRowFieldPlaceholder(col, config)
        : this.renderRowFieldContent(row, col, config, empty ? this.getEmptyDisplayValue(col, displayType) : value, displayType, empty);
      // The column this property owns, not the slot left by whichever siblings survived.
      field.style.gridColumn = String(index + 1);
      meta.appendChild(field);
    }
    // Decided on the first row and reused by every row after it. It has to be the first *built*
    // row rather than an empty one: an unpopulated field area measures 37.9px whatever the screen
    // is, because its ancestors are still sizing to content that has not arrived. So the first row
    // is built reserving, measured once, and stripped if the reservation turned out to buy nothing
    // — a fixup bounded by the column count, not by the row count.
    if (!this.reservationDecided) {
      this.reservationDecided = true;
      this.reservesColumns = this.shouldReserveColumns(meta, fields, config);
      if (!this.reservesColumns) {
        for (const spacer of Array.from(meta.querySelectorAll(".db-list-field.is-placeholder"))) spacer.remove();
      }
    }
  }

  /**
   * Whether reserving an empty property's slot buys anything on this surface.
   *
   * Asked of the layout rather than of the device, because the device is not what decides it. The
   * stylesheet lays the field area out as a grid on one surface and a wrapping flex line on
   * another, and the same phone answers differently in portrait and landscape — so this reads the
   * computed layout and the measured width of the field area instead of inferring them from a
   * platform flag, a viewport threshold or a body class. Any of those would be a second definition
   * of a question the stylesheet already answers, drifting from it on exactly the devices nobody
   * tests.
   *
   * On a grid every property has a column by index, so a reservation always holds something.
   *
   * On a wrapping line it holds something only if two properties can share a line at all. The test
   * is the two narrowest declared widths plus one column gap: if even that pair overflows the
   * field area then nothing can pair, every property is alone on its line at x=0, and a reservation
   * buys a blank line rather than a slot. The test is deliberately the *narrowest* pair, so the
   * uncertain cases resolve toward reserving — a needless reservation costs height, while a
   * needless skip costs the alignment this exists to hold.
   *
   * Called once per render, from the first row that asks. It reads layout, which is the thing that
   * must never happen per row: this one is O(1) in the row count and sits behind `reservationDecided`
   * for exactly that reason.
   */
  private shouldReserveColumns(meta: HTMLElement, fields: ColumnDef[], config: ViewConfig): boolean {
    const view = meta.ownerDocument?.defaultView;
    if (!view?.getComputedStyle) return true;
    const style = view.getComputedStyle(meta);
    if (style.display !== "flex") return true;
    // A wrapping column takes its width from its content, so it can always share a line and can
    // never be the proof that nothing fits beside it.
    if (fields.some((col) => col.wrap)) return true;
    return reservesColumnsOnWrappingLine(
      fields.map((col) => getFieldWidth(config, col)),
      Number.parseFloat(style.columnGap) || 0,
      meta.getBoundingClientRect().width,
    );
  }

  /**
   * The box an empty property leaves behind, holding its place without being rendered into.
   *
   * A property with no value has to keep its slot wherever two properties share a line, or the
   * first column holds Cost on one card and Payment on the next and no column can be read down.
   * Built only there: the caller skips this entirely where one property fills a line on its own,
   * which has no slot to hold and would pay a blank line per gap for the privilege.
   *
   * Holding the place with a whole hidden field also worked, and cost three nodes and a full value
   * render for something nobody can see. On a database of twenty-one mostly-empty properties that
   * was most of the row: 8,000 field elements where 2,400 carry a value. The width a field
   * occupies comes from the custom property rather than from its contents, so an empty box of the
   * same class reserves exactly the same slot for a third of the nodes.
   */
  private renderRowFieldPlaceholder(col: ColumnDef, config: ViewConfig): HTMLElement {
    const spacer = window.activeDocument.createElement("div");
    spacer.className = "db-list-field is-placeholder";
    spacer.setAttribute("aria-hidden", "true");
    // Mirrors what the field renderer puts on a real field, because the slot is sized from these
    // and a placeholder that skipped them would hold a different width than the value it stands in for.
    if (col.wrap) spacer.addClass("db-list-field-wrap");
    else spacer.style.setProperty("--db-card-field-width", `${getFieldWidth(config, col)}px`);
    return spacer;
  }

  private attachRowContextMenu(el: HTMLElement, row: RowData, context?: RowCreateContext): void {
    el.addEventListener("contextmenu", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button")) return;
      this.actions.showRowMenu?.(event, row, context);
    });
    attachLongPress(el, {
      ignoreTarget: (event) => isHTMLElement(event.target) && Boolean(event.target.closest("input, select, textarea, button, a")),
      onLongPress: (event) => this.actions.showRowMenu?.(event as unknown as MouseEvent, row, context),
    });
  }

  /** Phone layouts use a compact menu instead of HTML drag and drop. */
  private renderMobileMoveButton(
    item: HTMLElement,
    config: ViewConfig,
    row: RowData,
    rows: RowData[],
    groupField?: string,
    groupKey?: string,
    groups?: ListGroup[]
  ): void {
    const button = item.createEl("button", {
      cls: "db-list-mobile-move-btn",
      attr: { type: "button", title: t("mobile.moveCard"), "aria-label": t("mobile.moveCard") },
    });
    renderMobileMoveIcon(button);
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const menu = createOwnedMenuForEvent(event);
      if (this.canManualReorder(config)) this.addMobilePositionItems(menu, row, rows);
      if (groupField && groupKey != null && groups?.length) {
        if (this.canManualReorder(config)) menu.addSeparator();
        for (const group of groups) {
          if (group.key === groupKey) continue;
          const groupLabel = formatGroupKeyDisplay(config, groupField, group.key);
          menu.addRow({ icon: "folder-input", label: `${t("mobile.moveTo")} ${groupLabel}`, onClick: () => {
              const paths = group.rows.map((candidate) => candidate.file.path).filter((path) => path !== row.file.path);
              if (this.actions.moveRowToGroupAndPosition) {
                void this.actions.moveRowToGroupAndPosition(row, groupField, groupKey, group.key, paths[paths.length - 1], undefined);
              } else {
                void this.actions.moveRowsToGroup?.(row, groupField, groupKey, group.key);
              }
            } });
        }
      }
      menu.showAt({ x: event.clientX, y: event.clientY });
    };
  }

  /** Add local rank movement actions shared by grouped and ungrouped list rows. */
  private addMobilePositionItems(menu: OwnedMenuHandle, row: RowData, rows: RowData[]): void {
    const paths = rows.map((candidate) => candidate.file.path);
    const index = paths.indexOf(row.file.path);
    const move = (targetIndex: number) => {
      const remaining = paths.filter((path) => path !== row.file.path);
      const boundedIndex = Math.max(0, Math.min(targetIndex, remaining.length));
      this.actions.moveRowToPosition(row.file.path, remaining[boundedIndex - 1], remaining[boundedIndex]);
    };
    menu.addRow({ icon: "chevron-up", label: t("menu.moveUp"), disabled: index <= 0, onClick: () => move(index - 1) });
    menu.addRow({ icon: "chevron-down", label: t("menu.moveDown"), disabled: index < 0 || index >= paths.length - 1, onClick: () => move(index + 1) });
    menu.addRow({ icon: "chevrons-up", label: t("mobile.moveTop"), disabled: index <= 0, onClick: () => move(0) });
    menu.addRow({ icon: "chevrons-down", label: t("mobile.moveBottom"), disabled: index < 0 || index >= paths.length - 1, onClick: () => move(paths.length - 1) });
  }

  private setupGroupedRowDrag(item: HTMLElement, row: RowData, groupField?: string, groupKey?: string): void {
    if (!groupField || groupKey == null || this.actions.isReadOnly || !this.actions.moveRowsToGroup) return;
    if (this.touchMode) return;
    item.draggable = true;
    item.addEventListener("dragstart", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button")) {
        event.preventDefault();
        return;
      }
      const dragPaths = this.getDragPaths(row);
      event.dataTransfer?.setData(ROW_MIME, row.file.path);
      event.dataTransfer?.setData(ROW_BATCH_MIME, JSON.stringify(dragPaths));
      event.dataTransfer?.setData("text/plain", row.file.path);
      event.dataTransfer?.setData(ROW_FROM_GROUP_MIME, groupKey);
      this.draggingPaths = dragPaths;
      this.rowDropFeedback.begin(row.file.path, dragPaths);
      item.addClass("is-dragging");
    });
    item.addEventListener("dragend", () => {
      item.removeClass("is-dragging");
      this.draggingPaths = [];
    });
  }

  private setupReorderDrag(item: HTMLElement, config: ViewConfig, row: RowData, rows: RowData[], groupField?: string, groupKey?: string): void {
    if (this.actions.isReadOnly || this.touchMode || !this.canManualReorder(config)) return;
    item.draggable = true;
    item.addEventListener("dragstart", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button")) {
        event.preventDefault();
        return;
      }
      const dragPaths = this.getDragPaths(row);
      event.dataTransfer?.setData(ROW_MIME, row.file.path);
      event.dataTransfer?.setData(ROW_BATCH_MIME, JSON.stringify(dragPaths));
      event.dataTransfer?.setData("text/plain", row.file.path);
      if (groupKey != null) event.dataTransfer?.setData(ROW_FROM_GROUP_MIME, groupKey);
      this.draggingPath = row.file.path;
      this.draggingPaths = dragPaths;
      this.rowDropFeedback.begin(row.file.path, dragPaths);
      item.addClass("is-dragging");
    });
    item.addEventListener("dragend", () => {
      this.draggingPath = undefined;
      this.draggingPaths = [];
      item.removeClass("is-dragging");
      if (this.rowDropFeedback.getPhase() !== "pending") this.rowDropFeedback.clear();
    });
    item.addEventListener("dragover", (event) => {
      const dragPath = this.draggingPath;
      if (!dragPath || dragPath === row.file.path) return;
      if (!this.isRowDrag(event)) return;
      event.preventDefault();
      this.rowDropFeedback.update(item, resolveDropPlacement(item, event, "vertical"));
    });
    item.addEventListener("dragleave", () => {
      this.rowDropFeedback.clearTarget(item);
    });
    item.addEventListener("drop", (event) => {
      if (!this.isRowDrag(event)) return;
      const dragPaths = this.getDraggedPaths(event);
      const dragPath = this.draggingPath || dragPaths[0];
      if (!dragPath || dragPath === row.file.path) return;
      if (!this.rowByPath.has(dragPath)) return;
      event.preventDefault();
      event.stopPropagation();
      this.draggingPath = undefined;
      const placement = this.rowDropFeedback.getPlacement(item) || resolveDropPlacement(item, event, "vertical");
      this.rowDropFeedback.setPending();
      const isAfter = placement === "after";
      const moving = new Set(dragPaths);
      const currentPaths = rows.map((r) => r.file.path).filter((path) => !moving.has(path));
      const targetIndex = currentPaths.indexOf(row.file.path);
      const beforePath = isAfter ? row.file.path : (targetIndex > 0 ? currentPaths[targetIndex - 1] : undefined);
      const afterPath = isAfter ? (targetIndex < currentPaths.length - 1 ? currentPaths[targetIndex + 1] : undefined) : row.file.path;
      const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
      const draggedRow = this.rowByPath.get(dragPath);
      if (groupField && groupKey != null && fromGroupKey !== groupKey && draggedRow) {
        if (this.actions.moveRowToGroupAndPosition) {
          void Promise.resolve(this.actions.moveRowToGroupAndPosition(draggedRow, groupField, fromGroupKey, groupKey, beforePath, afterPath, dragPaths))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        } else {
          void Promise.resolve(this.actions.moveRowsToGroup?.(draggedRow, groupField, fromGroupKey, groupKey))
            .then(() => this.actions.moveRowToPosition(dragPath, beforePath, afterPath))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        }
      } else {
        if (dragPaths.length > 1 && this.actions.moveRowsToPosition) {
          void Promise.resolve(this.actions.moveRowsToPosition(dragPaths, beforePath, afterPath))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        } else {
          void Promise.resolve(this.actions.moveRowToPosition(dragPath, beforePath, afterPath))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        }
      }
    });
  }

  private setupGroupDropTarget(target: HTMLElement, groupField: string, groupKey: string): void {
    if (this.actions.isReadOnly || !this.actions.moveRowsToGroup) return;
    target.addEventListener("dragover", (event) => {
      if (!this.isRowDrag(event)) return;
      event.preventDefault();
      target.addClass("is-drop-target");
    });
    target.addEventListener("dragleave", () => target.removeClass("is-drop-target"));
    target.addEventListener("drop", (event) => {
      if (!this.isRowDrag(event)) return;
      const paths = this.getDraggedPaths(event);
      const path = paths[0];
      const row = path ? this.rowByPath.get(path) : undefined;
      if (!row) return;
      event.preventDefault();
      event.stopPropagation();
      target.removeClass("is-drop-target");
      const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
      void this.actions.moveRowsToGroup?.(row, groupField, fromGroupKey, groupKey);
    });
  }

  private isRowDrag(event: DragEvent): boolean {
    return Boolean(this.draggingPath) || Array.from(event.dataTransfer?.types || []).includes(ROW_MIME);
  }

  private getDragPaths(row: RowData): string[] {
    const selected = this.actions.getSelectedRows?.()
      ?.map((candidate) => candidate.file.path)
      .filter((path) => this.rowByPath.has(path)) || [];
    return selected.includes(row.file.path) ? selected : [row.file.path];
  }

  private getDraggedPaths(event: DragEvent): string[] {
    if (this.draggingPaths.length) return this.draggingPaths;
    const raw = event.dataTransfer?.getData(ROW_BATCH_MIME);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const paths = parsed.filter((path): path is string => typeof path === "string" && this.rowByPath.has(path));
          if (paths.length) return paths;
        }
      } catch {
        // Optional metadata is ignored when a different drag source supplies invalid data.
      }
    }
    const path = event.dataTransfer?.getData(ROW_MIME) || event.dataTransfer?.getData("text/plain");
    return path ? [path] : [];
  }

  private canManualReorder(config: ViewConfig): boolean {
    return !isExplicitlySorted(config);
  }

  private renderNewRow(list: HTMLElement, defaults?: Record<string, unknown>, rows: RowData[] = [], computedGroup = false): void {
    if (this.actions.isReadOnly || this.actions.hideCreateEntry) return;
    if (computedGroup) {
      list.createEl("button", { cls: "db-list-new-row is-disabled", text: t("group.computedCreateDisabled"), attr: { disabled: "true" } });
      return;
    }
    const button = list.createEl("button", { cls: "db-list-new-row", text: `+ ${t("toolbar.new")}` });
    button.onclick = () => this.createEntryNearEnd(defaults, rows);
  }

  private createEntryNearEnd(defaults: Record<string, unknown> | undefined, rows: RowData[]): void {
    this.actions.createEntry(defaults, this.getCreatePosition(rows));
  }

  private getCreatePosition(rows: RowData[]): CreateEntryPosition | undefined {
    const last = rows[rows.length - 1];
    return last ? { afterPath: last.file.path } : undefined;
  }

  private getCellValue(row: RowData, col: ColumnDef): unknown {
    if (col.key === "file.name") return getFileTitleDisplay(row, EMPTY_ROWS, this.duplicateNames).displayPath;
    if (isFileFieldKey(col.key)) return getRowFileFieldValue(row, col.key);
    if (col.type === "computed" || col.type === "rollup") {
      return row.computed[col.type === "computed" ? col.computedKey || col.key : col.key];
    }
    if (isObsidianTagsKey(col.key)) return toMultiSelectValuesForKey(col.key, row.frontmatter[col.key]);
    return row.frontmatter[col.key];
  }

  private getTitleField(config: ViewConfig): string | undefined {
    if (config.titleField === NO_TITLE_FIELD) return undefined;
    return config.titleField || "file.name";
  }

  renderRowFieldContent(
    row: RowData,
    col: ColumnDef,
    config: ViewConfig,
    resolvedValue?: unknown,
    resolvedDisplayType?: ColumnDef["type"],
    resolvedEmpty?: boolean,
  ): HTMLElement {
    const value = this.getCellValue(row, col);
    const displayType = resolvedDisplayType || this.getDisplayType(config, col);
    const empty = resolvedEmpty ?? (this.isEmptyValue(value) && displayType !== "checkbox");
    const displayValue = resolvedValue ?? (empty ? this.getEmptyDisplayValue(col, displayType) : value);
    return renderCardField({
      app: this.app, row, col, config, value: displayValue, displayType, empty,
      fieldClass: "db-list-field", valueClass: "db-list-field-value", labelClass: "db-list-field-label",
      badgesClass: "db-list-badges", linkClass: "db-list-link", fieldWidth: col.wrap ? undefined : getFieldWidth(config, col),
      wrap: col.wrap, readOnly: this.actions.isReadOnly, applyConditionalFormat: this.actions.applyConditionalFormat,
      onEdit: (target, editRow, editCol, event) => this.actions.editCell(target, editRow, editCol, event),
      onEditFormula: (editCol) => this.actions.editFormula?.(editCol),
      onOpenTarget: (targetRow, target, external) => this.openTarget(targetRow, target, external),
      onNumberChange: (targetRow, targetCol, next) => this.actions.saveCellValue?.(targetRow, targetCol, next),
      onShowColumnMenu: this.actions.showColumnMenu,
    });
  }

  private async openTarget(row: RowData, target: string, external: boolean): Promise<void> {
    if (external) {
      openExternalUrl(target);
      return;
    }
    await this.app.workspace.openLinkText(target, row.file.path);
  }

  private clear(container: HTMLElement): void {
    this.rowDropFeedback.clear();
    // Before the nodes go: the listener is on the scroller, which outlives this list, so dropping
    // the list without dropping the listener would leave every previous render still recomputing
    // a window over rows that are gone.
    this.releaseWindow();
    this.releaseGroupWindows();
    container.querySelectorAll(".db-list, .db-list-grouped, .db-list-total-header").forEach((el) => el.remove());
  }

  private getDisplayType(config: ViewConfig, col: ColumnDef): ColumnDef["type"] {
    if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
    return getColumnDisplayType(col, config.schema.computedFields);
  }

  private isEmptyValue(value: unknown): boolean {
    return value == null || value === "" || (Array.isArray(value) && value.length === 0);
  }

  private getEmptyDisplayValue(col: ColumnDef, displayType: ColumnDef["type"] = col.type): unknown {
    if (displayType === "multi-select") return [t("common.empty")];
    if (displayType === "checkbox") return false;
    return t("common.empty");
  }
}
