// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-renderer
// COMPONENT: Gantt-style timeline view — lanes, viewport scroll, drag reorder/resize
// ───────────────────────────────────────────────────────────────────
//
// Event pixel geometry is expressed as CSS custom properties (--db-timeline-
// exact-offset/-width) computed from unit counts rather than raw pixels, so
// the same layout math works whether the viewport shows days, weeks, months,
// quarters or years without a separate positioning path per scale. The
// viewport's visible unit window is tracked separately from the full model
// range because navigation (jump-to-date, page forward/back) needs to know
// what's currently on screen without re-deriving it from scroll position.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { Menu, Notice, setIcon, setTooltip } from "obsidian";
import { formatCalendarTime, getCalendarSlotDuration } from "../data/calendar-layout-model";
import { isExplicitlySorted } from "../data/manual-order";
import { CalendarTitleParts, buildTimelineAxisBands, formatCalendarTitleParts } from "../data/calendar-title-formatter";
import { buildCalendarMonthModel, buildCalendarTimelineEvents, buildTimelineModel, buildTimelineRangeGeometry, buildTimelineTicks, CalendarTimelineEvent, collectUnscheduledTimelineRows, getDefaultEventDateField, getTimelineAnchor, getTimelineNavigationShiftUnits, getTimelineShortNavigationShiftUnits, getTimelineTitleWindow, getTimelineViewportContentWidth, getTimelineViewportStartAnchor, normalizeTimelineDayScale, resolveEventAbsoluteScale, resolveTimelineBarMinUnits, resolveTimelineDayCentredStartMinutes, resolveTimelineJumpAnchor, resolveTimelineMilestoneLabelPlacement, resolveTimelineProgressFillUnits, resolveTimelineReorderNeighbors, resolveTimelineUnitWidth, resolveTimelineViewportUnitCount, resolveTimelineViewportUnitSpan, shiftCalendarMonth, TIMELINE_REFERENCE_HEADER_HEIGHT, TIMELINE_REFERENCE_LABEL_WIDTH, TIMELINE_REFERENCE_ROW_HEIGHT, TimelineUnit, UNCATEGORIZED_TIMELINE_LANE } from "../data/calendar-timeline-model";
import {
  CALENDAR_TIME_SNAP_MINUTES,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  addDateKeyDays,
  addUtcDays,
  dateKeyDaysBetween,
  dateKeyFromUtc,
  getLocalDateKey,
  getLocaleWeekStartsOn,
  getWeekdayLabels,
  makeUtcDate,
  minuteOfDay,
  parseDateKeyToUtc,
  snapMinutes,
} from "../data/calendar-date-time";
import { CalendarEventCreateOptions, CalendarEventDateChange, resolveAllDayResizeChange, resolveDayMoveChange, resolveDayRangeResize, resolveTimelineLinkChange, resolveTimedDragRange, TimelineDependencyGraph, TimelineLinkClick, TimelineLinkResolution } from "../data/calendar-interaction-model";
import { CalendarTimelineSearchVisibleRange, timelineHourRange } from "../data/calendar-timeline-search-results";
import { formatDateRangeDisplay, formatDateValueDisplay, parseDateTimeParts } from "../data/date-time-format";
import { GanttWeekLabel, RowData, TimelineScale, ViewConfig } from "../data/types";
import { getEffectiveLocale, t } from "../i18n";
import { buildSubtaskRelation } from "../data/subtask-relation";
import { planSubtaskMove } from "../data/subtask-serialize";
import type { SubtaskMovePlan, SubtaskMoveRequest, SubtaskRelation } from "../data/types";
import { openDropdownMenu } from "./dropdown-field";
import { buildMiniCalendarEventIndex, MiniCalendarMode, renderMiniCalendar } from "./calendar-mini-calendar-renderer";
import { renderGroupExpandControls } from "./group-expand-controls";
import { getGroupVisibleCount } from "../data/group-visibility";
import { markNoteHoverLink } from "./hover-link-preview";
import { EmptyStateReason, EmptyStateRenderer } from "./empty-state-renderer";
import { isTouchDevice } from "../data/touch-environment";
import { createOwnedMenuForEvent } from "./owned-menu";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const TIME_SNAP_MINUTES = CALENDAR_TIME_SNAP_MINUTES;

// Reference gantt geometry (the 1:1 default timeline): row/header/label sizes
// and the bar treatment constants the reference TimelineConfig and
// GanttTaskBarRenderer hardcode.
const GANTT_ROW_HEIGHT = TIMELINE_REFERENCE_ROW_HEIGHT;
const GANTT_HEADER_HEIGHT = TIMELINE_REFERENCE_HEADER_HEIGHT;
const GANTT_LABEL_WIDTH = TIMELINE_REFERENCE_LABEL_WIDTH;
/** Phone start width for the label column: the fixed 280px desktop default leaves only
 *  ~110px of chart at 402px, so phone starts narrower and the pointer-based resize
 *  handle can still widen the column on touch. */
const GANTT_LABEL_PHONE_WIDTH = 160;
const GANTT_BAR_PADDING = 8;
const GANTT_BAR_BORDER_RADIUS = 7;
const GANTT_HANDLE_WIDTH = 8;
const GANTT_LINK_DOT_RADIUS = 4;
const GANTT_LINK_DOT_GAP = 4;
const GANTT_BAR_MIN_WIDTH = 8;
const GANTT_BAR_LABEL_MIN_WIDTH = 55;
const GANTT_LABEL_MIN_WIDTH = 150;
const GANTT_LABEL_MAX_WIDTH = 600;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// The reference's own two renderers share one header SVG with no anti-collision between them
// (GanttHeaderRenderer's band label at y=18, GanttTaskBarRenderer's milestone label at y=14) —
// confirmed against the vendored reference source, which carries no such case in its own
// fixtures to have needed one. This local addition (operator amendment, not part of the 1:1
// copy) raises a milestone label that would otherwise land on a band label, reusing the
// estimate-then-move shape the local renderer's resolveTimelineMilestoneLabelPlacement already
// uses for its own (different) collision: a character-count width estimate, no real text
// metrics, because none are available for an unmounted SVG string in this render path.
const GANTT_MILESTONE_LABEL_Y = 14;
const GANTT_MILESTONE_LABEL_RAISED_Y = 8;
const GANTT_HEADER_LABEL_CHAR_WIDTH_PX = 6;

/** Reference-gantt geometry: the padded task-driven range plus the reference day width. */
interface GanttTimelineCfg {
  startDateKey: string;
  endDateKey: string;
  dayWidth: number;
  granularity: TimelineScale;
  totalDays: number;
  totalWidth: number;
}

/** One header top-band label's own left-anchored x and text, as renderGanttMonthBands/
 *  renderGanttYearBands drew it — the shape renderGanttMilestoneLabels checks a milestone
 *  label's estimated span against. */
interface GanttHeaderBandLabel {
  x: number;
  text: string;
}

/** True when a milestone label centred at `x` would visually overlap a header band label,
 *  estimating both spans by character count (no real text metrics exist for an unmounted SVG
 *  string). Mirrors the estimate-then-compare shape of resolveTimelineMilestoneLabelPlacement/
 *  getTimelineMilestoneLabelWidthUnits (calendar-timeline-model.ts) for the local renderer's own
 *  milestone-vs-next-bar collision — this is the same rule applied to a different pair. */
function ganttMilestoneLabelCrowdsBand(x: number, text: string, bandLabels: GanttHeaderBandLabel[]): boolean {
  const halfWidth = (text.length * GANTT_HEADER_LABEL_CHAR_WIDTH_PX) / 2;
  const milestoneX1 = x - halfWidth;
  const milestoneX2 = x + halfWidth;
  return bandLabels.some((band) => {
    const bandX2 = band.x + band.text.length * GANTT_HEADER_LABEL_CHAR_WIDTH_PX;
    return milestoneX1 < bandX2 && milestoneX2 > band.x;
  });
}

/** Reference-gantt bar drag wiring; mirrors the reference's BarDragOpts. */
interface GanttBarDragOpts {
  trigger: HTMLElement;
  rect: HTMLElement;
  barGroup: HTMLElement;
  row: RowData;
  side: "left" | "right" | "move";
  x: number;
  width: number;
  cfg: GanttTimelineCfg;
  startField: string;
  endField: string | undefined;
  /** The bar's current start date key; a right-edge drag never touches it, so the
   *  change payload anchors on this instead of re-deriving it from drag geometry. */
  startDateKey: string;
}

// ───────────────────────────────────────────────────────────────────
// 3. POSITION STYLE TYPES
// ───────────────────────────────────────────────────────────────────

export interface TimelineTimedPositionStyle {
  offsetUnits: number;
  durationUnits: number;
  cssProps: Record<string, string>;
}

export interface TimelineTodayPositionStyle {
  offsetUnits: number;
  cssProps: Record<string, string>;
}

// ───────────────────────────────────────────────────────────────────
// 4. POSITION HELPERS
// ───────────────────────────────────────────────────────────────────

function formatTimelineUnitCssValue(value: number): string {
  if (!Number.isFinite(value)) return "1";
  return String(Math.round(value * 1000) / 1000);
}

export function getTimelineTimedPositionStyle(
  startMinutes: number,
  endMinutes: number,
  visibleStartMinutes: number,
  visibleEndMinutes: number,
  totalUnits: number
): TimelineTimedPositionStyle {
  const start = Math.max(visibleStartMinutes, Math.min(visibleEndMinutes - TIME_SNAP_MINUTES, startMinutes));
  const end = Math.min(visibleEndMinutes, Math.max(start + TIME_SNAP_MINUTES, endMinutes));
  const offsetUnits = Math.max(0, (start - visibleStartMinutes) / 60);
  const durationUnits = Math.max(TIME_SNAP_MINUTES / 60, (end - start) / 60);
  return {
    offsetUnits,
    durationUnits,
    cssProps: {
      "--db-timeline-offset": "1",
      "--db-timeline-span": String(Math.max(1, totalUnits)),
      "--db-timeline-exact-offset": `calc(var(--db-timeline-unit-width) * ${formatTimelineUnitCssValue(offsetUnits)})`,
      "--db-timeline-exact-width": `calc(var(--db-timeline-unit-width) * ${formatTimelineUnitCssValue(durationUnits)})`,
    },
  };
}

export function getTimelineTodayPositionStyle(
  now: Date,
  model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; scale: TimelineScale; unit: TimelineUnit },
  unitWidth: number,
): TimelineTodayPositionStyle | null {
  if (!model.startDateKey || !model.endDateKey || !Number.isFinite(now.getTime())) return null;
  const today = getLocalDateKey(now);
  let offsetUnits: number;

  if (model.scale === "day") {
    const daysFromWindowStart = dateKeyDaysBetween(model.startDateKey, today);
    if (daysFromWindowStart == null) return null;
    const windowStartMinutes = typeof model.startMinutes === "number" && Number.isFinite(model.startMinutes) ? model.startMinutes : 0;
    const currentMinutes = daysFromWindowStart * MINUTES_PER_DAY
      + now.getHours() * MINUTES_PER_HOUR
      + now.getMinutes()
      + now.getSeconds() / MINUTES_PER_HOUR
      + now.getMilliseconds() / 60000;
    offsetUnits = (currentMinutes - windowStartMinutes) / MINUTES_PER_HOUR;
  } else {
    if (today < model.startDateKey || today > model.endDateKey) return null;
    const daysFromWindowStart = dateKeyDaysBetween(model.startDateKey, today);
    if (daysFromWindowStart == null) return null;
    const dayFraction = (
      now.getHours() * MINUTES_PER_HOUR
      + now.getMinutes()
      + now.getSeconds() / MINUTES_PER_HOUR
      + now.getMilliseconds() / 60000
    ) / MINUTES_PER_DAY;
    offsetUnits = daysFromWindowStart + dayFraction;
  }

  if (offsetUnits < 0 || offsetUnits >= model.totalUnits) return null;
  const offsetPx = Number.isFinite(unitWidth) && unitWidth > 0 ? offsetUnits * unitWidth : 0;
  return {
    offsetUnits,
    cssProps: {
      "--db-timeline-today-offset-units": formatTimelineUnitCssValue(offsetUnits),
      "--db-timeline-today-offset-px": `${formatTimelineUnitCssValue(offsetPx)}px`,
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// 5. RENDERER TYPES
// ───────────────────────────────────────────────────────────────────

export interface CalendarTimelineRendererActions {
  openRow(row: RowData): void;
  openRecordDetail?(anchorEl: HTMLElement, row: RowData): void;
  showRowMenu?(event: MouseEvent, row: RowData): void;
  renderRecordIcon?(parent: HTMLElement, row: RowData, config: ViewConfig, compact?: boolean): HTMLElement | null;
  renderGroupSummaries?(parent: HTMLElement, rows: RowData[], config: ViewConfig): void;
  applyConditionalFormat?(element: HTMLElement, row: RowData, config: ViewConfig): void;
  createEntryForDate?(config: ViewConfig, dateKey: string, options?: CalendarTimelineCreateOptions): void;
  updateEventDates?(
    row: RowData,
    changes: CalendarTimelineDateChange
  ): void | Promise<void>;
  reorderTimelineEvent?(row: RowData, beforePath?: string, afterPath?: string): void;
  moveTimelineEventToGroup?(
    row: RowData,
    field: string,
    fromGroupKey: string,
    toGroupKey: string,
    beforePath?: string,
    afterPath?: string
  ): void | Promise<void>;
  moveSubtask?(request: SubtaskMoveRequest, plan: SubtaskMovePlan): void | Promise<void>;
  /** Per-view collapse override for a row, layered over its own `collapsed` frontmatter default
   *  by `buildSubtaskRelation`. Returns `undefined` for a row the view has no override for. */
  isSubtaskCollapsed?(row: RowData): boolean | undefined;
  toggleSubtaskCollapsed?(row: RowData, collapsed: boolean): void | Promise<void>;
  /** Batch collapse/expand for expand-all/collapse-all: one persistence call and one render
   *  replace one write plus one render per parent row (the reference mutates in place,
   *  persists once, and re-renders once). */
  setSubtaskCollapsedMany?(rows: RowData[], collapsed: boolean): void | Promise<void>;
  /** Opens the note at the given vault path; the depends-elsewhere chip menu jumps to
   *  each external dependency's file with this. */
  openDependencyFile?(path: string): void | Promise<void>;
  /** Creates a new record pre-linked as a subtask of the given parent through the host's
   *  record-creation path (parentId set, the parent's subtaskIds list gains the child),
   *  mirroring the reference's add-subtask modal. */
  createSubtaskRecord?(parent: RowData): void | Promise<void>;
  /** Reference gantt undo/redo keys against the host's record-edit history stack; absent
   *  on hosts with no such history (read-only embeds), where the keys are left alone. */
  undoGanttEdit?(direction: "undo" | "redo"): void | Promise<void>;
  updateTimelineAnchor?(dateKey: string, label?: string, timeMinutes?: number): void;
  updateTimelineScale?(scale: TimelineScale, label?: string): boolean | Promise<boolean> | void;
  updateTimelineDependency?(predecessor: RowData, successor: RowData, dependencies: string[]): void | Promise<void>;
  onConfigChange?(label?: string): void;
  isGroupCollapsed?(field: string, key: string): boolean;
  toggleGroupCollapsed?(field: string, key: string): void;
  expandGroup?(field: string, key: string, count: number): void;
  readonly isReadOnly?: boolean;
  /** 统计被隐藏的无效时间事件数量；导航栏 warning 在 count > 0 时显示，缓存命中可即时返回。 */
  getTimelineInvalidEventCount?(): number | Promise<number>;
  /** 打开「无效时间事件」修复弹窗。 */
  openTimelineInvalidEvents?(): void;
  openDateConfig?(): void;
}

export type CalendarTimelineDateChange = CalendarEventDateChange;
export type CalendarTimelineCreateOptions = CalendarEventCreateOptions;

interface TimelineCreateTarget {
  dateKey: string;
  options: CalendarTimelineCreateOptions;
  offsetUnits: number;
  spanUnits: number;
  totalUnits: number;
}

interface TimelineFlashWindow {
  startDateKey: string;
  totalUnits: number;
  scale: TimelineScale;
  startMinutes?: number;
}

// ───────────────────────────────────────────────────────────────────
// 6. RENDERER
// ───────────────────────────────────────────────────────────────────

export class CalendarTimelineRenderer {
  private rowByPath = new Map<string, RowData>();
  private subtaskRelation: SubtaskRelation | null = null;
  private currentRows: RowData[] = [];
  private timelineResizeInProgress = false;
  private miniCalendarEl: HTMLElement | null = null;
  private miniCalendarMonth: string | null = null;
  private miniCalendarMode: MiniCalendarMode = "day";
  private miniCalendarCleanup: (() => void) | null = null;
  private timelineScaleMenuCleanup: (() => void) | null = null;
  private pendingFlashDateKey: string | null = null;
  private timelineFlashWindow: TimelineFlashWindow | null = null;
  private timelineRoot: HTMLElement | null = null;
  private timelineResizeObserver: ResizeObserver | null = null;
  private timelineObservedUnitCount: number | undefined;
  private timelineObservedUnitSpan: number | undefined;
  private currentVisibleRange: CalendarTimelineSearchVisibleRange | null = null;
  private flashRafHandle: number | null = null;
  private flashTimeoutHandle: number | null = null;
  /** 进行中拖拽的清理函数：移除 capture 监听并复位 resize 标志；视图卸载时调用以避免泄漏/锁死。 */
  private activeTimelineDragCleanup: (() => void) | null = null;
  private activeTimelineLinkCleanup: (() => void) | null = null;
  private timelineLinkSelection: TimelineLinkClick | null = null;
  private timelineLinkSelectionEl: HTMLElement | null = null;
  private timelineLinkHoverEl: HTMLElement | null = null;
  private suppressTimelineLinkClick = false;
  /** 上一次解析到的无效事件计数；cache miss（Promise）时沿用它做即时显示，避免每次刷新 hide→show 闪现。 */
  private timelineInvalidWarningCount: number | null = null;
  private backlogCollapsed = false;
  private emptyStateRenderer = new EmptyStateRenderer();
  /** Cleanup handles for the reference-gantt render path (resize handle, drags, scroll sync). */
  private ganttCleanupFns: (() => void)[] = [];
  /** Reference-gantt label column width in px, adjustable via the divider. Starts at the
   *  desktop constant, or the narrower phone default when the body carries is-phone. */
  private ganttLabelWidth: number | null = null;
  /** In-progress label-column resize state (pointer events with capture on the handle). */
  private ganttResizeStartX: number | null = null;
  private ganttResizeStartWidth = 0;
  /** Reference-gantt scroll pane, set when the right panel is built (Today button target). */
  private ganttScrollEl: HTMLElement | null = null;
  /** Current reference-gantt range, kept so the Today button can scroll without re-deriving it. */
  private ganttScrollCfg: GanttTimelineCfg | null = null;
  /** Captured scroll position + date anchor from the outgoing gantt DOM, restored after the
   *  next render instead of re-centring on today. Adapted from GanttView's pendingScroll:
   *  every data/config change re-renders this view from scratch, so without this the
   *  viewport would snap back to today after each drag, link, or scale change. */
  private ganttPendingScroll: { top: number; anchorDateKey: string } | null = null;
  /** Whether the last bar drag moved the bar (suppresses the post-drag click). */
  private ganttDragMoved = false;
  /** Reference-gantt drag state, mirroring the reference's DragState shape. */
  private ganttDragState: {
    isDragging: boolean;
    dragSide: "left" | "right" | "move" | null;
    dragRow: RowData | null;
    dragStartX: number;
    dragBarEl: HTMLElement | null;
    dragInitialX: number;
    dragInitialW: number;
  } = {
    isDragging: false,
    dragSide: null,
    dragRow: null,
    dragStartX: 0,
    dragBarEl: null,
    dragInitialX: 0,
    dragInitialW: 0,
  };
  /**
   * Whether this surface takes touch input, decided once per render.
   *
   * Every event bar asks, and the answer cannot change part-way through a synchronous render:
   * the platform flags are constant, the pointer type is constant, and the pane cannot be
   * resized while the loop that fills it is still running. Asking per event made it a forced
   * layout inside a loop appending to the same container, so the browser reflowed the tree
   * built so far once per event and the total became superlinear in event count.
   *
   * It is measured on the container rather than on `.db-timeline` for consistency with the list,
   * board and gallery, which all ask the same question of the same element. The container is the
   * pane, which is the width the touch threshold was written about; the timeline root merely
   * fills it, so the two agree today and the container is the one that stays meaningful if the
   * root's sizing ever changes.
   */
  private touchMode = false;

  constructor(private actions: CalendarTimelineRendererActions) {}

  getCurrentVisibleRange(): CalendarTimelineSearchVisibleRange | null {
    return this.currentVisibleRange;
  }

  /** 视图卸载/重渲染前的完整清理：断开 ResizeObserver、关闭 mini-calendar/scale menu、
   * 取消挂起的 flash RAF/定时器、中断进行中的拖拽并移除其 capture 监听器。
   * 避免反复打开/关闭时间线视图（尤其嵌入代码块）累积 observer/监听器/闭包泄漏。 */
  destroy(): void {
    this.disconnectTimelineResizeObserver();
    this.closeTimelineMiniCalendar();
    this.closeTimelineScaleMenu();
    this.pendingFlashDateKey = null;
    if (this.flashRafHandle != null) {
      window.cancelAnimationFrame(this.flashRafHandle);
      this.flashRafHandle = null;
    }
    if (this.flashTimeoutHandle != null) {
      window.clearTimeout(this.flashTimeoutHandle);
      this.flashTimeoutHandle = null;
    }
    this.activeTimelineDragCleanup?.();
    this.activeTimelineDragCleanup = null;
    this.cancelTimelineLink();
    this.ganttCleanupFns.forEach((fn) => fn());
    this.ganttCleanupFns = [];
    this.ganttDragState.isDragging = false;
    this.ganttDragState.dragBarEl = null;
    this.ganttPendingScroll = null;
    this.timelineRoot = null;
    this.timelineFlashWindow = null;
  }

  renderTimeline(container: HTMLElement, config: ViewConfig, rows: RowData[]): void {
    this.touchMode = isTouchDevice(container);
    this.closeTimelineMiniCalendar();
    this.closeTimelineScaleMenu();
    this.disconnectTimelineResizeObserver();
    this.cancelTimelineLink();
    if (this.ganttScrollEl?.isConnected && this.ganttScrollCfg) {
      this.ganttPendingScroll = {
        top: this.ganttScrollEl.scrollTop,
        anchorDateKey: this.ganttXToDate(this.ganttScrollCfg, this.ganttScrollEl.scrollLeft),
      };
    }
    if (this.timelineRoot?.isConnected && this.timelineRoot.parentElement === container) this.timelineRoot.remove();
    this.timelineRoot = null;
    this.timelineFlashWindow = null;
    this.currentVisibleRange = null;
    this.currentRows = rows;
    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    this.subtaskRelation = buildSubtaskRelation(rows, {
      isCollapsed: (row) => this.actions.isSubtaskCollapsed?.(row),
    });
    const visibleRows = rows.filter((row) => this.subtaskRelation?.nodes.get(row.file.path)?.visible !== false);
    const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
    if (!startField) {
      this.renderEmpty(container, "no-date-field");
      return;
    }
    if (config.timelineLocalExtensions) {
      this.ganttPendingScroll = null;
      this.renderTimelineLocal(container, config, rows, visibleRows, startField);
      return;
    }
    this.renderTimelineGantt(container, config, visibleRows, startField);
  }

  /** 本地扩展时间线渲染路径：可见窗口分页、未排期 backlog、分组泳道、触摸菜单、
   *  视口居中窗口等本地扩展都在这里；默认关闭，由配置的 timelineLocalExtensions 开启。 */
  private renderTimelineLocal(container: HTMLElement, config: ViewConfig, rows: RowData[], visibleRows: RowData[], startField: string): void {
    if (normalizeTimelineDayScale(config)) {
      this.actions.onConfigChange?.(t("undo.timelineScaleConfig"));
    }
    const scale = config.timelineScale || "week";
    const unitWidth = this.getTimelineRenderUnitWidth(config, scale, container.clientWidth || container.getBoundingClientRect().width || 0);
    const visibleUnitCount = this.getTimelineViewportUnitCount(container, config, unitWidth);
    const visibleUnitSpan = this.getTimelineViewportUnitSpan(container, unitWidth);
    const model = buildTimelineModel(visibleRows, { ...config, timelineStartDateField: startField }, {
      uncategorizedLabel: t("timeline.uncategorized"),
      visibleUnitCount,
      visibleUnitSpan,
      now: new Date(),
    });
    this.currentVisibleRange = this.getModelVisibleRange(model);
    if ((model.eventCount === 0 && model.lanes.length === 0) || !model.startDateKey || !model.endDateKey) {
      this.renderEmpty(container, "no-events");
      this.renderUnscheduledBacklog(container, config, visibleRows, startField);
      return;
    }

    const wrap = container.createDiv({ cls: `db-timeline is-scale-${model.scale} is-slot-${this.getTimelineSlotDuration(config)}` });
    this.timelineRoot = wrap;
    // The full task-driven range (padded, min-spanned) is grid metadata for the
    // styles lane; the rendered window stays viewport-sized.
    const range = buildTimelineRangeGeometry(visibleRows, config, model.scale);
    wrap.setAttribute("data-timeline-range-start", range.startDateKey);
    wrap.setAttribute("data-timeline-range-end", range.endDateKey);
    wrap.setAttribute("data-timeline-range-days", String(range.totalDays));
    wrap.setAttribute("data-timeline-scale", model.scale);
    wrap.setAttribute("data-timeline-unit", model.unit);
    wrap.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.timelineLinkSelection) {
        event.preventDefault();
        this.cancelTimelineLink();
      }
    });
    this.timelineObservedUnitCount = visibleUnitCount;
    this.timelineObservedUnitSpan = visibleUnitSpan;
    this.observeTimelineViewport(container, config, rows);
    wrap.style.setProperty("--db-timeline-units", String(Math.max(1, model.totalUnits)));
    wrap.style.setProperty("--db-timeline-unit-width", `${unitWidth}px`);
    wrap.style.setProperty(
      "--db-timeline-group-width",
      config.summaryRules && config.summaryRules.length > 0
        ? "min(240px, 42vw)"
        : "min(160px, 32vw)"
    );
    this.timelineFlashWindow = {
      startDateKey: model.startDateKey,
      totalUnits: model.totalUnits,
      scale: model.scale,
      startMinutes: model.startMinutes,
    };
    wrap.createDiv({
      cls: "db-sr-status",
      text: t("timeline.accessibilityLabel", {
        start: model.startDateKey || "",
        end: model.endDateKey || model.startDateKey || "",
        visible: model.visibleEventCount,
        off: model.offWindowEventCount,
        before: model.eventsBeforeWindow,
        after: model.eventsAfterWindow,
      }),
      attr: { role: "status", "aria-live": "polite", "aria-atomic": "true" },
    });

    this.renderTimelineHeader(wrap, config, model);
    this.renderUnscheduledBacklog(wrap, config, visibleRows, startField);
    if (model.visibleEventCount === 0 && model.lanes.length === 0) {
      this.renderTimelineEmptyRange(wrap);
      return;
    }

    const scroll = wrap.createDiv({ cls: "db-timeline-scroll" });
    this.setupTimelineZoomGesture(scroll, config);
    const axis = scroll.createDiv({ cls: "db-timeline-axis" });
    const allTicks = buildTimelineTicks(
      { startDateKey: model.startDateKey, endDateKey: model.endDateKey, totalUnits: model.totalUnits, unit: model.unit, startMinutes: model.startMinutes },
      model.scale,
      config,
      getEffectiveLocale(),
    );
    const axisBands = buildTimelineAxisBands({
      scale: model.scale,
      startDateKey: model.startDateKey,
      endDateKey: model.endDateKey,
      startMinutes: model.startMinutes,
      totalUnits: model.totalUnits,
      locale: getEffectiveLocale(),
    });
    const band = axis.createDiv({ cls: "db-timeline-ticks-band" });
    if (axisBands.length === 0) band.setAttribute("aria-hidden", "true");
    for (const group of axisBands) {
      const bandItem = band.createDiv({ cls: "db-timeline-band-item", text: group.label });
      bandItem.style.setProperty("--db-timeline-band-start", String(group.offset + 1));
      bandItem.style.setProperty("--db-timeline-band-span", String(group.span));
    }
    const now = new Date();
    const ticksEl = axis.createDiv({ cls: "db-timeline-ticks" });
    for (const tick of allTicks) {
      const tickClasses = [
        "db-timeline-tick",
        tick.isScaleBoundary ? "is-scale-boundary" : "",
        this.isTimelineWeekendDate(tick.dateKey) ? "is-weekend" : "",
        this.isCurrentTimelineTick(tick, model, now) ? "is-current-time-tick" : "",
        this.isCurrentTimelineDateTick(tick, model, now) ? "is-current-date-tick" : "",
      ].filter(Boolean).join(" ");
      const tickEl = ticksEl.createDiv({
        cls: tickClasses,
        attr: {
          title: tick.dateKey,
          "data-date-key": tick.dateKey,
          ...(tick.isScaleBoundary ? { "data-timeline-boundary": "true" } : {}),
        },
      });
      tickEl.style.setProperty("--db-timeline-tick-offset", String(tick.offsetUnits + 1));
      this.renderTimelineTickLabel(tickEl, tick.label, model.scale, tick.offsetUnits === 0);
    }

    const body = scroll.createDiv({ cls: "db-timeline-body" });
    this.renderTimelineGridColumns(body, model);
    const todayPosition = getTimelineTodayPositionStyle(now, model, unitWidth);
    // 无分组时不渲染 group header（与表格等视图一致），events 直接占满宽度；
    // collapsed 强制 false（无折叠按钮，也不应折叠唯一泳道）。
    const hasGroupField = Boolean(config.timelineGroupField);
    for (const lane of model.lanes) {
      const groupEl = body.createDiv({ cls: "db-timeline-group" });
      // group 自身也带 lane key，使拖拽能解析折叠分组（折叠时无 .db-timeline-events 子元素）。
      groupEl.setAttribute("data-timeline-lane-key", lane.key);
      const collapsed = hasGroupField ? this.renderTimelineGroupHeader(groupEl, config, lane) : false;
      if (collapsed) {
        groupEl.addClass("is-collapsed");
        continue;
      }
      const events = groupEl.createDiv({ cls: "db-timeline-events" });
      events.setAttribute("data-timeline-lane-key", lane.key);
      this.setupTimelineBacklogDropTarget(events, config, model.startDateKey);
      // day scale：可见小时范围（绝对分钟，可跨午夜）；week/month/quarter：整个多天窗口（0 → totalUnits 天）。
      const visible = model.scale === "day"
        ? this.getTimelineVisibleMinutes(config, { ...model, totalUnits: Math.max(1, visibleUnitSpan ?? model.totalUnits) })
        : { startMinutes: 0, endMinutes: Math.max(1, visibleUnitSpan ?? model.totalUnits) * MINUTES_PER_DAY };
      const limitCount = hasGroupField && config.timelineGroupField
        ? getGroupVisibleCount(config, config.timelineGroupField, lane.key, lane.events.length)
        : lane.events.length;
      const renderedEvents = limitCount < lane.events.length ? lane.events.slice(0, limitCount) : lane.events;
      // 限流时 lane 高度只算可见事件的最高行，缩短 lane、让后续分组顶上（不留垂直空隙）。
      const laneRowCount = limitCount < lane.events.length
        ? renderedEvents.reduce((max, e) => Math.max(max, e.timelineRow || 1), 1)
        : lane.rowCount;
      events.style.setProperty("--db-timeline-event-rows", String(laneRowCount));
      for (const event of renderedEvents) {
        // 统一按绝对刻度（相对 windowStartKey 的分钟）定位事件两端，再用可见窗口夹取。
        // scale.start < visibleStart → 左侧 jump-to-start；scale.end > visibleEnd → 右侧 jump-to-end。
        // 满宽（覆盖整个可见窗口）是 scale 覆盖 visible 的自然结果，无需特判。
        const scale = resolveEventAbsoluteScale(event, model.startDateKey || event.startDateKey);
        const renderStart = Math.max(scale.start, visible.startMinutes);
        let renderEnd = Math.min(scale.end, visible.endMinutes);
        const isClippedStart = scale.start < visible.startMinutes;
        const isClippedEnd = scale.end > visible.endMinutes;
        const isOverEvent = renderStart < renderEnd;
        if (isOverEvent) {
          // A whole day can render narrower than the bar minimum at coarse
          // scales; widen the rendered span so the bar stays visible and grabbable.
          if (model.unit === "day") {
            const minUnits = resolveTimelineBarMinUnits(model.scale, unitWidth);
            const widthUnits = (renderEnd - renderStart) / MINUTES_PER_DAY;
            if (widthUnits < minUnits) renderEnd = renderStart + minUnits * MINUTES_PER_DAY;
          }
          this.renderTimelineEvent(events, config, event, lane.key, model, { renderStart, renderEnd, visible, isClippedStart, isClippedEnd }, lane.events, model.lanes, event.timelineRow || 1);
        }
        if (isClippedStart) {
          this.renderTimelineJumpIndicator(events, config, event, "before", "start", model, event.timelineRow || 1, isOverEvent);
        }
        if (isClippedEnd) {
          this.renderTimelineJumpIndicator(events, config, event, "after", "end", model, event.timelineRow || 1, isOverEvent);
        }
      }
      if (hasGroupField && config.timelineGroupField) {
        renderGroupExpandControls(groupEl, config, config.timelineGroupField, lane.key, lane.events.length, this.actions);
      }
      this.renderTimelineCreateRow(groupEl, config, model, lane.key);
    }
    this.renderTimelineDependencyLinks(body);
    if (hasGroupField) this.fitTimelineGroupHeaderWidth(wrap, container);
    if (todayPosition) {
      for (const [property, value] of Object.entries(todayPosition.cssProps)) {
        body.style.setProperty(property, value);
      }
      body.createDiv({ cls: "db-timeline-today-line", attr: { title: this.getTodayDateKey() } });
    }
    if (this.pendingFlashDateKey) {
      const key = this.pendingFlashDateKey;
      this.pendingFlashDateKey = null;
      this.flashRafHandle = window.requestAnimationFrame(() => {
        this.flashRafHandle = null;
        this.flashTimelineDate(key);
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // 6b. REFERENCE-GANTT RENDER PATH (1:1 default timeline)
  // ───────────────────────────────────────────────────────────────────
  //
  // The default timeline renders obsidian-pm's gantt structure one-to-one:
  // the same element tree and class vocabulary as GanttView.ts,
  // GanttHeaderRenderer.ts, GanttTaskBarRenderer.ts, GanttRenderer.ts and
  // TimelineConfig.ts, mapped onto this repo's RowData/action contract.
  // Blocks adapted from that source carry its notice below; code was
  // rewritten only where this repo's data model forces it (date keys and
  // Date objects instead of Temporal.PlainDate, status colors from the
  // schema instead of a status config, and the local action pipeline as the
  // single persistence path). The local extensions (visible-window paging,
  // unscheduled backlog, invalid-event repair, group lanes, touch menu,
  // keyboard link buttons, viewport-centred window) render only behind the
  // timelineLocalExtensions setting, so the default view is
  // indistinguishable from the reference apart from data.
  //
  // MIT License
  // Copyright (c) 2026 Stepan Kropachev and dotpm contributors
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to
  // permit persons to whom the Software is furnished to do so, subject to
  // the following conditions: the above copyright notice and this
  // permission notice shall be included in all copies or substantial
  // portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT
  // WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
  // THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  // NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  // LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  // OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  private renderTimelineGantt(container: HTMLElement, config: ViewConfig, visibleRows: RowData[], startField: string): void {
    this.ganttCleanupFns.forEach((fn) => fn());
    this.ganttCleanupFns = [];
    this.ganttDragState.isDragging = false;
    this.ganttDragState.dragBarEl = null;
    this.ganttDragMoved = false;
    this.ganttScrollEl = null;
    this.ganttScrollCfg = null;
    const scale = config.timelineScale || "week";
    const range = buildTimelineRangeGeometry(visibleRows, config, scale);
    const cfg: GanttTimelineCfg = {
      startDateKey: range.startDateKey,
      endDateKey: range.endDateKey,
      dayWidth: range.dayWidth,
      granularity: scale,
      totalDays: range.totalDays,
      totalWidth: range.totalDays * range.dayWidth,
    };
    this.ganttScrollCfg = cfg;
    const endField = config.timelineEndDateField || config.calendarEndDateField;
    const events = buildCalendarTimelineEvents(visibleRows, config, {
      startField,
      endField,
      titleField: config.timelineTitleField,
      colorField: config.timelineColorField || config.calendarColorField,
    });
    const eventByPath = new Map<string, CalendarTimelineEvent>();
    const invalidPaths = new Set<string>();
    for (const event of events) {
      if (event.isInvalid) invalidPaths.add(event.id);
      else eventByPath.set(event.id, event);
    }

    const root = container.createDiv({ cls: "pm-gantt-view" });
    this.timelineRoot = root;
    this.renderGanttControls(root, config, scale);

    const wrapper = root.createDiv({ cls: "pm-gantt-wrapper" });
    // The 280px desktop constant is the reference default; phone starts narrower so the
    // chart keeps ~110px more, and the touch-friendly handle can still widen the column.
    this.ganttLabelWidth ??= this.isGanttPhone() ? GANTT_LABEL_PHONE_WIDTH : GANTT_LABEL_WIDTH;
    const leftPanel = wrapper.createDiv({ cls: "pm-gantt-left" });
    leftPanel.style.width = `${this.ganttLabelWidth}px`;
    leftPanel.style.minWidth = `${this.ganttLabelWidth}px`;
    const leftHeader = leftPanel.createDiv({ cls: "pm-gantt-left-header" });
    leftHeader.style.height = `${GANTT_HEADER_HEIGHT}px`;
    leftHeader.createSpan({ cls: "pm-gantt-left-header-label", text: t("timeline.taskColumn") });
    const leftBody = leftPanel.createDiv({ cls: "pm-gantt-left-body" });
    this.setupGanttResizeHandle(wrapper, leftPanel);

    const rightPanel = wrapper.createDiv({ cls: "pm-gantt-right" });
    this.ganttScrollEl = rightPanel;
    const headerSticky = rightPanel.createDiv({ cls: "pm-gantt-header-sticky" });
    headerSticky.style.width = `${cfg.totalWidth}px`;
    headerSticky.style.height = `${GANTT_HEADER_HEIGHT}px`;
    const headerSvgEl = this.ganttSvgElement("svg", { width: cfg.totalWidth, height: GANTT_HEADER_HEIGHT, class: "pm-gantt-header-svg" });
    headerSticky.appendChild(headerSvgEl);
    const svgContainer = rightPanel.createDiv({ cls: "pm-gantt-svg-container" });
    svgContainer.style.width = `${cfg.totalWidth}px`;
    svgContainer.style.marginTop = `-${GANTT_HEADER_HEIGHT}px`;

    const totalRows = visibleRows.length;
    const svgHeight = GANTT_HEADER_HEIGHT + (totalRows + 1) * GANTT_ROW_HEIGHT;
    const svgEl = this.ganttSvgElement("svg", { width: cfg.totalWidth, height: svgHeight, class: "pm-gantt-svg" });
    svgContainer.appendChild(svgEl);
    // The arrow marker lives in the first-child defs so arrows can reference it.
    const defs = this.ganttSvgElement("defs");
    svgEl.appendChild(defs);
    const marker = this.ganttSvgElement("marker", { id: "pm-arrowhead", markerWidth: 8, markerHeight: 8, refX: 6, refY: 3, orient: "auto" });
    marker.appendChild(this.ganttSvgElement("path", { d: "M0,0 L0,6 L8,3 z", class: "pm-gantt-arrowhead" }));
    defs.appendChild(marker);

    this.renderGanttLabelRows(leftBody, config, visibleRows, eventByPath);
    const addRow = leftBody.createDiv({ cls: "pm-gantt-label-row pm-gantt-add-row" });
    addRow.style.height = `${GANTT_ROW_HEIGHT}px`;
    this.renderGanttAddButton(addRow, config);

    const bandLabels = this.renderGanttHeader(headerSvgEl, cfg, config);
    const grid = this.ganttSvgElement("g", { class: "pm-gantt-grid" });
    svgEl.appendChild(grid);
    this.renderGanttGrid(grid, cfg, totalRows);
    this.renderGanttTodayLine(svgEl, headerSvgEl, cfg, svgHeight);
    const barsGroup = this.ganttSvgElement("g", { class: "pm-gantt-bars" });
    svgEl.appendChild(barsGroup);
    this.renderGanttBars(barsGroup, cfg, visibleRows, eventByPath, invalidPaths, config, startField, endField, svgEl);
    this.renderGanttDependencyArrows(svgEl, cfg, visibleRows, eventByPath);
    this.renderGanttMilestoneLabels(svgEl, headerSvgEl, cfg, visibleRows, eventByPath, bandLabels);

    const syncSpacer = this.setupGanttScrollSync(leftPanel, leftBody, rightPanel);
    // Escape and the undo/redo keys must reach this view from anywhere in the leaf,
    // like the reference's document-level keydown (gated on the leaf being the active
    // one). The history keys route to the host's record-edit stack, and an input,
    // inline editor or modal keeps its own undo, so the host's shortcut guard applies.
    const isGanttActive = (): boolean => {
      const leafEl = container.closest(".workspace-leaf");
      return leafEl?.classList.contains("mod-active") ?? false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isGanttActive()) return;
      if (event.key === "Escape" && this.timelineLinkSelection) {
        event.preventDefault();
        this.cancelTimelineLink();
        return;
      }
      if (this.ganttDragState.isDragging) return;
      const mod = event.ctrlKey || event.metaKey;
      if (!mod || !this.actions.undoGanttEdit) return;
      const active = window.activeDocument?.activeElement;
      const editing = active != null
        && typeof (active as HTMLElement).closest === "function"
        && (active as HTMLElement).closest("input, textarea, select, .db-cell-editing, .db-cell-popover-editing, .modal") != null;
      if (editing) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        void this.actions.undoGanttEdit("undo");
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        void this.actions.undoGanttEdit("redo");
      }
    };
    window.activeDocument.addEventListener("keydown", onKeyDown);
    this.ganttCleanupFns.push(() => window.activeDocument.removeEventListener("keydown", onKeyDown));
    const raf = container.ownerDocument?.defaultView?.requestAnimationFrame
      ?? (typeof window !== "undefined" ? window.requestAnimationFrame : undefined);
    // The spacer measures the right panel's horizontal scrollbar, which only exists
    // after layout; sync it in the same post-layout frame that restores the scroll.
    const restoreScroll = () => this.applyGanttPendingScroll(cfg, rightPanel);
    if (typeof raf === "function") {
      raf(() => {
        syncSpacer();
        restoreScroll();
      });
    } else {
      syncSpacer();
      restoreScroll();
    }
  }

  /** Reference controls bar: five-level segmented scale, Today, Expand all, Collapse all.
   *  Adapted from GanttView.renderGranularityControls. */
  private renderGanttControls(parent: HTMLElement, config: ViewConfig, scale: TimelineScale): void {
    const bar = parent.createDiv({ cls: "pm-gantt-controls" });
    const levels: TimelineScale[] = ["day", "week", "month", "quarter", "year"];
    const labels: Record<TimelineScale, string> = {
      day: t("timeline.scaleDay"),
      week: t("timeline.scaleWeek"),
      month: t("timeline.scaleMonth"),
      quarter: t("timeline.scaleQuarter"),
      year: t("timeline.scaleYear"),
    };
    const segment = bar.createDiv({ cls: "pm-segmented" });
    for (const level of levels) {
      // Bare buttons, like the reference's SegmentedControl/ButtonComponent; the
      // pressed state is the button-mod-cta class setCta() applies.
      const button = segment.createEl("button", { text: labels[level], attr: { type: "button" } });
      if (level === scale) button.addClass("mod-cta");
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.setTimelineScale(config, level);
      };
    }
    bar.createSpan({ cls: "pm-gantt-sep" });
    const today = bar.createEl("button", { text: t("timeline.today"), attr: { type: "button" } });
    today.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.ganttScrollEl) this.scrollGanttToToday(this.ganttCfgForScroll(), this.ganttScrollEl);
    };
    const expandAll = bar.createEl("button", { text: t("timeline.expandAll"), attr: { type: "button" } });
    expandAll.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.setGanttAllCollapsed(false);
    };
    const collapseAll = bar.createEl("button", { text: t("timeline.collapseAll"), attr: { type: "button" } });
    collapseAll.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.setGanttAllCollapsed(true);
    };
  }

  private setGanttAllCollapsed(collapsed: boolean): void {
    const parents = this.currentRows.filter((row) => (this.subtaskRelation?.childrenOf.get(row.file.path) || []).length > 0);
    if (parents.length === 0) return;
    // One batched persistence call when the view provides it, so the reference's
    // mutate-once/render-once shape is not N writes plus N renders.
    if (this.actions.setSubtaskCollapsedMany) {
      void this.actions.setSubtaskCollapsedMany(parents, collapsed);
      return;
    }
    for (const row of parents) void this.actions.toggleSubtaskCollapsed?.(row, collapsed);
  }

  /** The current range, for the Today button; a fresh default keeps the scroll safe if none. */
  private ganttCfgForScroll(): GanttTimelineCfg {
    if (this.ganttScrollCfg) return this.ganttScrollCfg;
    const today = this.getTodayDateKey();
    return {
      startDateKey: today,
      endDateKey: today,
      dayWidth: 1,
      granularity: "week",
      totalDays: 1,
      totalWidth: 1,
    };
  }

  /** Label rows: collapse toggle or spacer, status dot, title, progress, add-subtask button.
   *  Adapted from TaskLabelRenderer.renderTaskLabel; drag/drop reorder maps to the local
   *  reorder action, and the external-dependency chip lists paths instead of a menu. */
  private renderGanttLabelRows(leftBody: HTMLElement, config: ViewConfig, visibleRows: RowData[], eventByPath: Map<string, CalendarTimelineEvent>): void {
    for (const row of visibleRows) {
      const node = this.subtaskRelation?.nodes.get(row.file.path);
      const depth = node?.depth ?? 0;
      const children = this.subtaskRelation?.childrenOf.get(row.file.path) || [];
      const event = eventByPath.get(row.file.path);
      const el = leftBody.createDiv({ cls: "pm-gantt-label-row" });
      el.style.height = `${GANTT_ROW_HEIGHT}px`;
      el.style.paddingLeft = `${depth * 18 + 8}px`;
      el.dataset.taskId = row.file.path;
      el.draggable = true;
      el.addEventListener("dragstart", (e: DragEvent) => {
        e.dataTransfer?.setData("text/plain", row.file.path);
        el.addClass("pm-gantt-label-row--dragging");
      });
      el.addEventListener("dragend", () => {
        el.removeClass("pm-gantt-label-row--dragging");
      });
      let dropPosition: "before" | "after" = "before";
      el.addEventListener("dragover", (e: DragEvent) => {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        dropPosition = e.clientY < midY ? "before" : "after";
        el.removeClass("pm-gantt-label-row--drop-before", "pm-gantt-label-row--drop-after");
        el.addClass(dropPosition === "before" ? "pm-gantt-label-row--drop-before" : "pm-gantt-label-row--drop-after");
      });
      el.addEventListener("dragleave", () => {
        el.removeClass("pm-gantt-label-row--drop-before", "pm-gantt-label-row--drop-after");
      });
      el.addEventListener("drop", (e: DragEvent) => {
        e.preventDefault();
        el.removeClass("pm-gantt-label-row--drop-before", "pm-gantt-label-row--drop-after");
        const draggedId = e.dataTransfer?.getData("text/plain");
        if (!draggedId || draggedId === row.file.path) return;
        const draggedRow = this.rowByPath.get(draggedId);
        if (!draggedRow || !this.actions.reorderTimelineEvent) return;
        this.actions.reorderTimelineEvent(
          draggedRow,
          dropPosition === "before" ? undefined : row.file.path,
          dropPosition === "before" ? row.file.path : undefined,
        );
      });
      if (children.length > 0) {
        const collapsed = Boolean(node?.collapsed);
        const toggle = el.createDiv({ cls: `tree-item-icon collapse-icon pm-collapse-toggle${collapsed ? " is-collapsed" : ""}` });
        setIcon(toggle, "right-triangle");
        toggle.setAttr("aria-label", collapsed ? t("subtask.expand") : t("subtask.collapse"));
        toggle.addEventListener("click", (mouseEvent) => {
          mouseEvent.preventDefault();
          mouseEvent.stopPropagation();
          void this.actions.toggleSubtaskCollapsed?.(row, !collapsed);
        });
      } else {
        el.createSpan({ cls: "pm-gantt-label-spacer" });
      }
      const dot = el.createSpan({ cls: "pm-gantt-label-dot" });
      dot.style.background = this.resolveGanttStatusColor(config, row);
      const titleEl = el.createSpan({ cls: "pm-gantt-label-title", text: event?.title ?? (row.file.basename || row.file.name) });
      titleEl.addEventListener("click", () => {
        if (this.actions.openRecordDetail) this.actions.openRecordDetail(titleEl, row);
        else this.actions.openRow(row);
      });
      const elsewhere = this.getGanttElsewhereDependencies(row);
      if (elsewhere.length > 0) {
        const chip = el.createSpan({ cls: "pm-chip pm-chip--plain pm-chip--sm" });
        chip.createSpan({ cls: "pm-chip-label", text: t("timeline.dependsElsewhere", { count: elsewhere.length }) });
        setTooltip(chip, elsewhere.join("\n"), { delay: 100 });
        // A predecessor outside this view draws no arrow, so the chip lists each one
        // in a menu that jumps to its file, like the reference's chip menu.
        chip.addEventListener("click", (mouseEvent) => {
          mouseEvent.stopPropagation();
          const menu = new Menu();
          for (const path of elsewhere) {
            menu.addItem((item) =>
              item
                .setTitle(path.replace(/\.md$/i, ""))
                .setIcon("link-2")
                .onClick(() => {
                  void this.actions.openDependencyFile?.(path);
                })
            );
          }
          menu.showAtMouseEvent(mouseEvent);
        });
      }
      const progress = this.resolveGanttEventProgress(event, row);
      if (progress > 0) {
        el.createSpan({ cls: "pm-gantt-label-progress", text: `${Math.round(progress)}%` });
      }
      // The reference's IconButton shape (ExtraButtonComponent): a div carrying
      // clickable-icon/extra-setting-button plus the reveal-on-hover modifier. The
      // click opens the host's record creation with the parent pre-linked, like the
      // reference's add-subtask modal; the row menu stays as fallback.
      const addSubtask = el.createDiv({ cls: "clickable-icon extra-setting-button pm-icon-btn pm-icon-btn--hover-only" });
      setIcon(addSubtask, "plus");
      setTooltip(addSubtask, t("timeline.addSubtask"), { delay: 100 });
      addSubtask.addEventListener("click", (mouseEvent) => {
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        if (this.actions.createSubtaskRecord) {
          void this.actions.createSubtaskRecord(row);
          return;
        }
        this.actions.showRowMenu?.(mouseEvent, row);
      });
    }
  }

  /** Add-task row: ghost button with plus glyph and label. Adapted from addButton.renderAddButton. */
  private renderGanttAddButton(parent: HTMLElement, config: ViewConfig): void {
    const button = parent.createEl("button", { cls: "pm-prop-add", attr: { type: "button" } });
    setIcon(button.createSpan({ cls: "pm-glyph-icon" }), "plus");
    button.createSpan({ cls: "pm-prop-add-label", text: t("timeline.addTask") });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.actions.createEntryForDate) {
        this.actions.createEntryForDate(config, this.getTodayDateKey(), {});
      }
    });
  }

  /** Divider between label column and chart. Adapted from GanttView's resize-handle wiring;
   *  pointer events with capture replace the reference's document mousemove/up so touch can
   *  drag the handle too (the handle keeps receiving move/up while captured). */
  private setupGanttResizeHandle(wrapper: HTMLElement, leftPanel: HTMLElement): void {
    const resizeHandle = wrapper.createDiv({ cls: "pm-gantt-resize-handle" });
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      resizeHandle.setPointerCapture?.(e.pointerId);
      this.ganttResizeStartX = e.clientX;
      this.ganttResizeStartWidth = this.ganttLabelWidth ?? GANTT_LABEL_WIDTH;
      window.activeDocument.body.addClass("pm-resize-active");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (this.ganttResizeStartX == null) return;
      const newWidth = Math.max(GANTT_LABEL_MIN_WIDTH, Math.min(GANTT_LABEL_MAX_WIDTH, this.ganttResizeStartWidth + (e.clientX - this.ganttResizeStartX)));
      this.ganttLabelWidth = newWidth;
      leftPanel.style.width = `${newWidth}px`;
      leftPanel.style.minWidth = `${newWidth}px`;
    };
    const onPointerUp = () => {
      if (this.ganttResizeStartX == null) return;
      this.ganttResizeStartX = null;
      window.activeDocument.body.removeClass("pm-resize-active");
    };
    resizeHandle.addEventListener("pointerdown", onPointerDown);
    resizeHandle.addEventListener("pointermove", onPointerMove);
    resizeHandle.addEventListener("pointerup", onPointerUp);
    resizeHandle.addEventListener("pointercancel", onPointerUp);
    this.ganttCleanupFns.push(() => {
      resizeHandle.removeEventListener("pointerdown", onPointerDown);
      resizeHandle.removeEventListener("pointermove", onPointerMove);
      resizeHandle.removeEventListener("pointerup", onPointerUp);
      resizeHandle.removeEventListener("pointercancel", onPointerUp);
    });
  }

  /** Whether the host marks this layout as phone (Obsidian's is-phone body class). */
  private isGanttPhone(): boolean {
    return typeof window !== "undefined"
      && window.activeDocument?.body?.classList?.contains("is-phone") === true;
  }

  /** Header svg: background, band fills, per-scale labels and ticks. Adapted from
   *  GanttHeaderRenderer.renderTimelineHeader and the per-scale renderers. Returns the top
   *  band's own labels (month or year, whichever the granularity draws) so
   *  renderGanttMilestoneLabels can tell whether a milestone label would land on top of one —
   *  see that method's own comment for why this exists. */
  private renderGanttHeader(headerSvgEl: HTMLElement, cfg: GanttTimelineCfg, config: ViewConfig): GanttHeaderBandLabel[] {
    const g = this.ganttSvgElement("g", { class: "pm-gantt-header" });
    g.appendChild(this.ganttSvgElement("rect", { x: 0, y: 0, width: cfg.totalWidth, height: GANTT_HEADER_HEIGHT, class: "pm-gantt-header-bg" }));
    const { granularity } = cfg;
    const bandLabels = granularity === "day" ? this.renderGanttDayHeader(g, cfg)
      : granularity === "week" ? this.renderGanttWeekHeader(g, cfg, config)
      : granularity === "month" ? this.renderGanttMonthHeader(g, cfg)
      : granularity === "quarter" ? this.renderGanttQuarterHeader(g, cfg)
      : this.renderGanttYearHeader(g, cfg);
    headerSvgEl.appendChild(g);
    return bandLabels;
  }

  /** Day header: month-top bands, weekend fills, day-of-month labels. Adapted from
   *  GanttHeaderRenderer.renderDayHeader. */
  private renderGanttDayHeader(g: HTMLElement, cfg: GanttTimelineCfg): GanttHeaderBandLabel[] {
    const bandLabels = this.renderGanttMonthBands(g, 0, 24, cfg);
    for (let i = 0; i < cfg.totalDays; i++) {
      const d = this.ganttDateAt(cfg.startDateKey, i);
      const x = i * cfg.dayWidth;
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
      if (isWeekend) {
        g.appendChild(this.ganttSvgElement("rect", { x, y: 24, width: cfg.dayWidth, height: GANTT_HEADER_HEIGHT - 24, class: "pm-gantt-weekend-header" }));
      }
      if (cfg.dayWidth >= 20) {
        const text = this.ganttSvgElement("text", { x: x + cfg.dayWidth / 2, y: 42, class: "pm-gantt-header-day" });
        text.setText(String(d.getUTCDate()));
        g.appendChild(text);
      }
    }
    return bandLabels;
  }

  /** Week header: month-top bands, Monday-aligned week labels and ticks. Adapted from
   *  GanttHeaderRenderer.renderWeekHeader; the label mode is the reference's
   *  ganttWeekLabel setting (week-number default, date range, or both). */
  private renderGanttWeekHeader(g: HTMLElement, cfg: GanttTimelineCfg, config: ViewConfig): GanttHeaderBandLabel[] {
    const bandLabels = this.renderGanttMonthBands(g, 0, 24, cfg);
    const labelMode: GanttWeekLabel = config.timelineWeekLabel || "weekNumber";
    const start = this.ganttDateAt(cfg.startDateKey, 0);
    const dow = start.getUTCDay() === 0 ? 7 : start.getUTCDay();
    const offsetToMonday = dow === 1 ? 0 : 8 - dow;
    if (offsetToMonday > 0) {
      const weekNum = this.ganttWeekNumber(start);
      const w = offsetToMonday * cfg.dayWidth;
      const text = this.ganttSvgElement("text", { x: w / 2, y: 44, class: "pm-gantt-header-week" });
      text.setText(this.formatGanttWeekLabel(start, offsetToMonday, weekNum, labelMode));
      g.appendChild(text);
    }
    let i = offsetToMonday;
    while (i < cfg.totalDays) {
      const d = this.ganttDateAt(cfg.startDateKey, i);
      const weekNum = this.ganttWeekNumber(d);
      const x = i * cfg.dayWidth;
      const daysInWeek = Math.min(7, cfg.totalDays - i);
      const w = daysInWeek * cfg.dayWidth;
      const text = this.ganttSvgElement("text", { x: x + w / 2, y: 44, class: "pm-gantt-header-week" });
      text.setText(this.formatGanttWeekLabel(d, daysInWeek, weekNum, labelMode));
      g.appendChild(text);
      g.appendChild(this.ganttSvgElement("line", { x1: x, y1: 24, x2: x, y2: GANTT_HEADER_HEIGHT, class: "pm-gantt-header-tick" }));
      i += 7;
    }
    return bandLabels;
  }

  /** Week label in the reference's three modes: W{n}, the date range, or both. Adapted from
   *  GanttHeaderRenderer.formatWeekLabel/formatDateRange (same-month en dash, cross-month
   *  spaced en dash). */
  private formatGanttWeekLabel(weekStart: Date, days: number, weekNum: number, mode: GanttWeekLabel): string {
    if (mode === "weekNumber") return `W${weekNum}`;
    const range = this.formatGanttWeekDateRange(weekStart, days);
    if (mode === "dateRange") return range;
    return `W${weekNum}: ${range}`;
  }

  private formatGanttWeekDateRange(weekStart: Date, days: number): string {
    const end = addUtcDays(weekStart, days - 1);
    const startMonth = this.ganttMonthLabel(weekStart);
    if (weekStart.getUTCMonth() === end.getUTCMonth()) {
      return `${startMonth} ${weekStart.getUTCDate()}–${end.getUTCDate()}`;
    }
    const endMonth = this.ganttMonthLabel(end);
    return `${startMonth} ${weekStart.getUTCDate()} – ${endMonth} ${end.getUTCDate()}`;
  }

  /** Month header: year bands, month labels and ticks. Adapted from
   *  GanttHeaderRenderer.renderMonthHeader. */
  private renderGanttMonthHeader(g: HTMLElement, cfg: GanttTimelineCfg): GanttHeaderBandLabel[] {
    const bandLabels = this.renderGanttYearBands(g, 0, 24, cfg);
    let monthStart = this.ganttMonthStart(cfg.startDateKey);
    while (dateKeyFromUtc(monthStart) < cfg.endDateKey) {
      const nextMonthStart = makeUtcDate(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1);
      const x1 = Math.max(0, this.ganttDateToX(cfg, dateKeyFromUtc(monthStart)));
      const x2 = Math.min(cfg.totalWidth, this.ganttDateToX(cfg, dateKeyFromUtc(nextMonthStart)));
      const w = x2 - x1;
      const text = this.ganttSvgElement("text", { x: x1 + w / 2, y: 44, class: "pm-gantt-header-month" });
      text.setText(this.ganttMonthLabel(monthStart));
      g.appendChild(text);
      g.appendChild(this.ganttSvgElement("line", { x1, y1: 24, x2: x1, y2: GANTT_HEADER_HEIGHT, class: "pm-gantt-header-tick" }));
      monthStart = nextMonthStart;
    }
    return bandLabels;
  }

  /** Quarter header: year bands, quarter labels. Adapted from
   *  GanttHeaderRenderer.renderQuarterHeader. */
  private renderGanttQuarterHeader(g: HTMLElement, cfg: GanttTimelineCfg): GanttHeaderBandLabel[] {
    const bandLabels = this.renderGanttYearBands(g, 0, 24, cfg);
    const start = this.ganttDateAt(cfg.startDateKey, 0);
    let date = makeUtcDate(start.getUTCFullYear(), Math.floor(start.getUTCMonth() / 3) * 3, 1);
    while (dateKeyFromUtc(date) < cfg.endDateKey) {
      const q = Math.floor(date.getUTCMonth() / 3) + 1;
      const nextQStart = makeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 3, 1);
      const x1 = Math.max(0, this.ganttDateToX(cfg, dateKeyFromUtc(date)));
      const x2 = Math.min(cfg.totalWidth, this.ganttDateToX(cfg, dateKeyFromUtc(nextQStart)));
      const text = this.ganttSvgElement("text", { x: x1 + (x2 - x1) / 2, y: 44, class: "pm-gantt-header-quarter" });
      text.setText(`Q${q} ${date.getUTCFullYear()}`);
      g.appendChild(text);
      date = nextQStart;
    }
    return bandLabels;
  }

  /** Year header: year bands, quarter labels and ticks. Adapted from
   *  GanttHeaderRenderer.renderYearHeader. */
  private renderGanttYearHeader(g: HTMLElement, cfg: GanttTimelineCfg): GanttHeaderBandLabel[] {
    const bandLabels = this.renderGanttYearBands(g, 0, 24, cfg);
    const start = this.ganttDateAt(cfg.startDateKey, 0);
    let date = makeUtcDate(start.getUTCFullYear(), Math.floor(start.getUTCMonth() / 3) * 3, 1);
    while (dateKeyFromUtc(date) < cfg.endDateKey) {
      const q = Math.floor(date.getUTCMonth() / 3) + 1;
      const nextQStart = makeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 3, 1);
      const x1 = Math.max(0, this.ganttDateToX(cfg, dateKeyFromUtc(date)));
      const x2 = Math.min(cfg.totalWidth, this.ganttDateToX(cfg, dateKeyFromUtc(nextQStart)));
      const text = this.ganttSvgElement("text", { x: x1 + (x2 - x1) / 2, y: 44, class: "pm-gantt-header-quarter" });
      text.setText(`Q${q}`);
      g.appendChild(text);
      g.appendChild(this.ganttSvgElement("line", { x1, y1: 24, x2: x1, y2: GANTT_HEADER_HEIGHT, class: "pm-gantt-header-tick" }));
      date = nextQStart;
    }
    return bandLabels;
  }

  /** Month bands across the top band. Adapted from GanttHeaderRenderer.renderMonthBands. Returns
   *  each band label's own x/text so renderGanttMilestoneLabels can check a milestone label
   *  against the same positions this method just drew, rather than recomputing them. */
  private renderGanttMonthBands(g: HTMLElement, y: number, h: number, cfg: GanttTimelineCfg): GanttHeaderBandLabel[] {
    const bandLabels: GanttHeaderBandLabel[] = [];
    let monthStart = this.ganttMonthStart(cfg.startDateKey);
    while (dateKeyFromUtc(monthStart) < cfg.endDateKey) {
      const nextMonthStart = makeUtcDate(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1);
      const x1 = Math.max(0, this.ganttDateToX(cfg, dateKeyFromUtc(monthStart)));
      const x2 = Math.min(cfg.totalWidth, this.ganttDateToX(cfg, dateKeyFromUtc(nextMonthStart)));
      const w = x2 - x1;
      g.appendChild(this.ganttSvgElement("rect", {
        x: x1,
        y,
        width: w,
        height: h,
        class: monthStart.getUTCMonth() % 2 === 0 ? "pm-gantt-band-even" : "pm-gantt-band-odd",
      }));
      const labelText = this.ganttMonthTopLabel(monthStart);
      const labelX = x1 + 6;
      const text = this.ganttSvgElement("text", { x: labelX, y: y + h - 6, class: "pm-gantt-header-month-top" });
      text.setText(labelText);
      g.appendChild(text);
      bandLabels.push({ x: labelX, text: labelText });
      monthStart = nextMonthStart;
    }
    return bandLabels;
  }

  /** Year bands across the top band. Adapted from GanttHeaderRenderer.renderYearBands. Returns
   *  each band label's own x/text — see renderGanttMonthBands's comment. */
  private renderGanttYearBands(g: HTMLElement, y: number, h: number, cfg: GanttTimelineCfg): GanttHeaderBandLabel[] {
    const bandLabels: GanttHeaderBandLabel[] = [];
    const start = this.ganttDateAt(cfg.startDateKey, 0);
    let date = makeUtcDate(start.getUTCFullYear(), 0, 1);
    while (dateKeyFromUtc(date) < cfg.endDateKey) {
      const yearEnd = makeUtcDate(date.getUTCFullYear() + 1, 0, 1);
      const x1 = Math.max(0, this.ganttDateToX(cfg, dateKeyFromUtc(date)));
      const x2 = Math.min(cfg.totalWidth, this.ganttDateToX(cfg, dateKeyFromUtc(yearEnd)));
      g.appendChild(this.ganttSvgElement("rect", {
        x: x1,
        y,
        width: x2 - x1,
        height: h,
        class: date.getUTCFullYear() % 2 === 0 ? "pm-gantt-band-even" : "pm-gantt-band-odd",
      }));
      const labelText = String(date.getUTCFullYear());
      const labelX = x1 + 6;
      const text = this.ganttSvgElement("text", { x: labelX, y: y + h - 6, class: "pm-gantt-header-year" });
      text.setText(labelText);
      g.appendChild(text);
      bandLabels.push({ x: labelX, text: labelText });
      date = yearEnd;
    }
    return bandLabels;
  }

  /** Grid: weekend fills (day scale), boundary verticals, row horizontals. Adapted from
   *  GanttRenderer.renderGridLines. */
  private renderGanttGrid(grid: HTMLElement, cfg: GanttTimelineCfg, totalRows: number): void {
    const totalHeight = GANTT_HEADER_HEIGHT + totalRows * GANTT_ROW_HEIGHT;
    const { startDateKey, totalDays, dayWidth, granularity } = cfg;
    for (let i = 0; i < totalDays; i++) {
      const d = this.ganttDateAt(startDateKey, i);
      const x = i * dayWidth;
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
      const isMonday = d.getUTCDay() === 1;
      const isFirst = d.getUTCDate() === 1;
      if (isWeekend && granularity === "day") {
        grid.appendChild(this.ganttSvgElement("rect", { x, y: GANTT_HEADER_HEIGHT, width: dayWidth, height: totalHeight - GANTT_HEADER_HEIGHT, class: "pm-gantt-weekend" }));
      }
      const shouldDrawLine =
        (granularity === "day" && isMonday) ||
        (granularity === "week" && isMonday) ||
        (granularity === "month" && isFirst) ||
        ((granularity === "quarter" || granularity === "year") && isFirst && d.getUTCMonth() % 3 === 0);
      if (shouldDrawLine) {
        grid.appendChild(this.ganttSvgElement("line", { x1: x, y1: GANTT_HEADER_HEIGHT, x2: x, y2: totalHeight, class: "pm-gantt-gridline-v" }));
      }
    }
    for (let r = 0; r <= totalRows; r++) {
      const y = GANTT_HEADER_HEIGHT + r * GANTT_ROW_HEIGHT;
      grid.appendChild(this.ganttSvgElement("line", { x1: 0, y1: y, x2: cfg.totalWidth, y2: y, class: "pm-gantt-gridline-h" }));
    }
  }

  /** Today line in the body and its diamond cap in the sticky header. Adapted from
   *  GanttRenderer.renderTodayLine. */
  private renderGanttTodayLine(svgEl: HTMLElement, headerSvgEl: HTMLElement, cfg: GanttTimelineCfg, svgHeight: number): void {
    const x = this.ganttDateToX(cfg, this.getTodayDateKey());
    if (x < 0 || x > cfg.totalWidth) return;
    svgEl.appendChild(this.ganttSvgElement("line", { x1: x, y1: GANTT_HEADER_HEIGHT - 8, x2: x, y2: svgHeight, class: "pm-gantt-today-line" }));
    headerSvgEl.appendChild(this.ganttSvgElement("polygon", {
      points: `${x},${GANTT_HEADER_HEIGHT - 16} ${x + 6},${GANTT_HEADER_HEIGHT - 8} ${x},${GANTT_HEADER_HEIGHT} ${x - 6},${GANTT_HEADER_HEIGHT - 8}`,
      class: "pm-gantt-today-diamond",
    }));
  }

  /** One bar (or milestone / empty-row target) per dated row. Adapted from
   *  GanttTaskBarRenderer.renderTaskBar; the tooltip and colors resolve through the
   *  local schema, and drags persist through the local action pipeline. */
  private renderGanttBars(
    barsGroup: HTMLElement,
    cfg: GanttTimelineCfg,
    visibleRows: RowData[],
    eventByPath: Map<string, CalendarTimelineEvent>,
    invalidPaths: ReadonlySet<string>,
    config: ViewConfig,
    startField: string,
    endField: string | undefined,
    svgEl: HTMLElement,
  ): void {
    visibleRows.forEach((row, rowIndex) => {
      const event = eventByPath.get(row.file.path);
      const rowY = GANTT_HEADER_HEIGHT + rowIndex * GANTT_ROW_HEIGHT;
      if (!event) {
        this.renderGanttEmptyRowTarget(barsGroup, cfg, row, rowY, startField, endField, svgEl);
        return;
      }
      barsGroup.appendChild(this.ganttSvgElement("rect", { x: 0, y: rowY, width: cfg.totalWidth, height: GANTT_ROW_HEIGHT, class: "pm-gantt-row-hover" }));
      // An invalid date range keeps its row band but renders no bar (surfaced for
      // repair through the invalid-events warning), like the local timeline.
      if (invalidPaths.has(row.file.path)) return;
      if (event.isMilestone) {
        this.renderGanttMilestoneDiamond(barsGroup, cfg, event, rowY);
        return;
      }
      const effectiveStart = event.startDateKey;
      const effectiveEnd = addDateKeyDays(event.endDateKey, 1);
      const x = Math.max(0, this.ganttDateToX(cfg, effectiveStart));
      const xEnd = Math.min(cfg.totalWidth, this.ganttDateToX(cfg, effectiveEnd));
      const width = Math.max(GANTT_BAR_MIN_WIDTH, xEnd - x);
      const y = rowY + GANTT_BAR_PADDING;
      const height = GANTT_ROW_HEIGHT - GANTT_BAR_PADDING * 2;
      const barGroup = this.ganttSvgElement("g", { class: "pm-gantt-bar-group" });
      barsGroup.appendChild(barGroup);
      const color = this.resolveGanttBarColor(event);
      const rect = this.ganttSvgElement("rect", {
        x,
        y,
        width,
        height,
        rx: GANTT_BAR_BORDER_RADIUS,
        ry: GANTT_BAR_BORDER_RADIUS,
        fill: color,
        opacity: 0.4,
        class: "pm-gantt-bar",
      });
      barGroup.appendChild(rect);
      const progress = this.resolveGanttEventProgress(event, row);
      if (progress > 0) {
        const pw = (progress / 100) * width;
        barGroup.appendChild(this.ganttSvgElement("rect", {
          x,
          y,
          width: pw,
          height,
          rx: GANTT_BAR_BORDER_RADIUS,
          ry: GANTT_BAR_BORDER_RADIUS,
          fill: color,
          opacity: 0.9,
          class: "pm-gantt-bar-progress",
        }));
      }
      if (this.ganttRowRecurrence(row)) {
        const icon = this.ganttSvgElement("text", { x: x + width + 4, y: y + height / 2 + 5, class: "pm-gantt-bar-icon" });
        icon.setText("R");
        barGroup.appendChild(icon);
      }
      if (width > GANTT_BAR_LABEL_MIN_WIDTH) {
        const label = this.ganttSvgElement("text", { x: x + 8, y: y + height / 2 + 5, class: "pm-gantt-bar-label" });
        const maxChars = Math.max(4, Math.floor((width - 16) / 7.5));
        label.setText(event.title.length > maxChars ? `${event.title.slice(0, maxChars - 1)}\u2026` : event.title);
        barGroup.appendChild(label);
      }
      const tt = this.ganttSvgElement("title");
      tt.setText(this.formatGanttBarTooltip(row, event, config));
      rect.appendChild(tt);
      for (const side of ["left", "right"] as const) {
        const hx = side === "left" ? x : x + width - GANTT_HANDLE_WIDTH;
        const handle = this.ganttSvgElement("rect", { x: hx, y, width: GANTT_HANDLE_WIDTH, height, rx: 3, ry: 3, class: "pm-gantt-drag-handle", cursor: "ew-resize" });
        barGroup.appendChild(handle);
        this.ganttCleanupFns.push(this.attachGanttBarDrag({ trigger: handle, rect, barGroup, row, side, x, width, cfg, startField, endField, startDateKey: event.startDateKey }));
      }
      for (const side of ["left", "right"] as const) {
        const cx = side === "left" ? x - GANTT_LINK_DOT_GAP - GANTT_LINK_DOT_RADIUS : x + width + GANTT_LINK_DOT_GAP + GANTT_LINK_DOT_RADIUS;
        const cy = y + height / 2;
        const dot = this.ganttSvgElement("circle", { cx, cy, r: GANTT_LINK_DOT_RADIUS, class: "pm-gantt-link-dot", cursor: "crosshair" });
        dot.addEventListener("mousedown", (e: MouseEvent) => {
          e.stopPropagation();
        });
        dot.addEventListener("click", (e: MouseEvent) => {
          e.stopPropagation();
          this.handleGanttLinkDotClick(dot, event.id, side);
        });
        barGroup.appendChild(dot);
      }
      const hasStart = this.ganttRowHasDate(row, startField, config);
      const hasDue = endField != null && this.ganttRowHasDate(row, endField, config);
      if (hasStart && hasDue) {
        this.ganttCleanupFns.push(this.attachGanttBarDrag({ trigger: rect, rect, barGroup, row, side: "move", x, width, cfg, startField, endField, startDateKey: event.startDateKey }));
        rect.setAttribute("cursor", "grab");
      } else {
        rect.setAttribute("cursor", "pointer");
      }
      rect.addEventListener("click", () => {
        if (this.ganttDragMoved) {
          this.ganttDragMoved = false;
          return;
        }
        if (this.actions.openRecordDetail) this.actions.openRecordDetail(rect, row);
        else this.actions.openRow(row);
      });
    });
  }

  /** Milestone diamond marker. Adapted from GanttTaskBarRenderer.renderMilestoneDiamond;
   *  the reference anchors on due ?? start, so the end field wins when both exist. */
  private renderGanttMilestoneDiamond(barsGroup: HTMLElement, cfg: GanttTimelineCfg, event: CalendarTimelineEvent, rowY: number): void {
    const dateKey = event.endDateKey ?? event.startDateKey;
    const cx = this.ganttDateToX(cfg, dateKey) + cfg.dayWidth / 2;
    const cy = rowY + GANTT_ROW_HEIGHT / 2;
    const size = 12;
    const pts = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
    const diamond = this.ganttSvgElement("polygon", { points: pts, fill: this.resolveGanttBarColor(event), opacity: 0.8, class: "pm-gantt-milestone", cursor: "pointer" });
    barsGroup.appendChild(diamond);
    const tt = this.ganttSvgElement("title");
    tt.setText(t("timeline.milestoneTooltip", { title: event.title, date: dateKey }));
    diamond.appendChild(tt);
    diamond.addEventListener("click", () => {
      if (this.actions.openRecordDetail) this.actions.openRecordDetail(diamond, event.row);
      else this.actions.openRow(event.row);
    });
  }

  /** Empty row target: click-to-set-dates hit area with a snap preview. Adapted from
   *  GanttTaskBarRenderer.renderEmptyRowClickTarget. */
  private renderGanttEmptyRowTarget(
    barsGroup: HTMLElement,
    cfg: GanttTimelineCfg,
    row: RowData,
    rowY: number,
    startField: string,
    endField: string | undefined,
    svgEl: HTMLElement,
  ): void {
    const hitArea = this.ganttSvgElement("rect", { x: 0, y: rowY, width: cfg.totalWidth, height: GANTT_ROW_HEIGHT, fill: "transparent", cursor: "cell", class: "pm-gantt-empty-row-hit" });
    const previewY = rowY + GANTT_BAR_PADDING;
    const previewH = GANTT_ROW_HEIGHT - GANTT_BAR_PADDING * 2;
    const previewW = Math.max(cfg.dayWidth, GANTT_BAR_MIN_WIDTH);
    const preview = this.ganttSvgElement("rect", { x: 0, y: previewY, width: previewW, height: previewH, rx: GANTT_BAR_BORDER_RADIUS, ry: GANTT_BAR_BORDER_RADIUS, class: "pm-gantt-empty-row-preview", "pointer-events": "none" });
    preview.addClass("pm-hidden");
    barsGroup.appendChild(hitArea);
    barsGroup.appendChild(preview);
    const snapPoints = this.ganttSnapPoints(cfg);
    const snapThreshold = cfg.dayWidth * 0.4;
    hitArea.addEventListener("mousemove", (e: MouseEvent) => {
      const svgRect = svgEl.getBoundingClientRect();
      const rawX = e.clientX - svgRect.left;
      const snapped = this.ganttSnapX(rawX, snapPoints, snapThreshold);
      preview.setAttribute("x", String(snapped));
      preview.removeClass("pm-hidden");
    });
    hitArea.addEventListener("mouseleave", () => {
      preview.addClass("pm-hidden");
    });
    hitArea.addEventListener("click", (e: MouseEvent) => {
      if (this.actions.isReadOnly || !this.actions.updateEventDates) return;
      const svgRect = svgEl.getBoundingClientRect();
      const rawX = e.clientX - svgRect.left;
      const snapped = this.ganttSnapX(rawX, snapPoints, snapThreshold);
      const iso = this.ganttXToDate(cfg, snapped);
      const result = this.actions.updateEventDates(row, { startField, startDateKey: iso, endField, endDateKey: iso, changedEdge: "both" });
      if (result) {
        void Promise.resolve(result).catch(() => new Notice(t("timeline.dateSaveFailed")));
      }
    });
    const tt = this.ganttSvgElement("title");
    tt.setText(t("timeline.clickToSetDates"));
    hitArea.appendChild(tt);
  }

  /** Milestone guide lines in the body and their labels in the sticky header. Adapted from
   *  GanttTaskBarRenderer.renderMilestoneLabels. */
  private renderGanttMilestoneLabels(
    svgEl: HTMLElement,
    headerSvgEl: HTMLElement,
    cfg: GanttTimelineCfg,
    visibleRows: RowData[],
    eventByPath: Map<string, CalendarTimelineEvent>,
    bandLabels: GanttHeaderBandLabel[],
  ): void {
    const milestones = visibleRows
      .map((row) => eventByPath.get(row.file.path))
      .filter((event): event is CalendarTimelineEvent => Boolean(event?.isMilestone));
    if (milestones.length === 0) return;
    const linesG = this.ganttSvgElement("g", { class: "pm-gantt-milestone-labels" });
    for (const event of milestones) {
      // Same due ?? start anchor as the diamond, so the guide line and its label
      // stay on the marker.
      const x = this.ganttDateToX(cfg, event.endDateKey ?? event.startDateKey) + cfg.dayWidth / 2;
      const totalH = GANTT_HEADER_HEIGHT + visibleRows.length * GANTT_ROW_HEIGHT;
      // The guide line always starts at the header's own bottom edge (GANTT_HEADER_HEIGHT),
      // never inside the 0-24 band strip the label move below stays within, so raising the
      // label never needs a matching change here.
      linesG.appendChild(this.ganttSvgElement("line", {
        x1: x,
        y1: GANTT_HEADER_HEIGHT,
        x2: x,
        y2: totalH,
        stroke: this.resolveGanttBarColor(event),
        "stroke-width": 1,
        "stroke-dasharray": "4 4",
        opacity: 0.4,
      }));
      const titleText = event.title.length > 16 ? `${event.title.slice(0, 14)}\u2026` : event.title;
      const crowded = ganttMilestoneLabelCrowdsBand(x, titleText, bandLabels);
      const label = this.ganttSvgElement("text", {
        x,
        y: crowded ? GANTT_MILESTONE_LABEL_RAISED_Y : GANTT_MILESTONE_LABEL_Y,
        "text-anchor": "middle",
        class: crowded ? "pm-gantt-milestone-label pm-gantt-milestone-label--raised" : "pm-gantt-milestone-label",
        fill: this.resolveGanttBarColor(event),
      });
      label.setText(titleText);
      headerSvgEl.appendChild(label);
    }
    svgEl.appendChild(linesG);
  }

  /** Dependency arrows: finish-to-start bezier from the predecessor's due edge to the
   *  successor's start edge. Adapted from GanttTaskBarRenderer.renderDependencyArrows. */
  private renderGanttDependencyArrows(
    svgEl: HTMLElement,
    cfg: GanttTimelineCfg,
    visibleRows: RowData[],
    eventByPath: Map<string, CalendarTimelineEvent>,
  ): void {
    const graph = this.getTimelineDependencyGraph();
    const indexMap = new Map<string, number>();
    visibleRows.forEach((row, i) => indexMap.set(row.file.path, i));
    const arrowGroup = this.ganttSvgElement("g", { class: "pm-gantt-arrows" });
    for (const row of visibleRows) {
      const toRow = indexMap.get(row.file.path);
      if (toRow === undefined) continue;
      const toEvent = eventByPath.get(row.file.path);
      if (!toEvent) continue;
      const toY = GANTT_HEADER_HEIGHT + toRow * GANTT_ROW_HEIGHT + GANTT_ROW_HEIGHT / 2;
      const toX = this.ganttDateToX(cfg, toEvent.startDateKey);
      for (const depId of graph.dependencies[row.file.path] ?? []) {
        const fromRow = indexMap.get(depId);
        if (fromRow === undefined) continue;
        const depEvent = eventByPath.get(depId);
        if (!depEvent) continue;
        const fromX = this.ganttDateToX(cfg, addDateKeyDays(depEvent.endDateKey, 1));
        const fromY = GANTT_HEADER_HEIGHT + fromRow * GANTT_ROW_HEIGHT + GANTT_ROW_HEIGHT / 2;
        const midX = (fromX + toX) / 2;
        arrowGroup.appendChild(this.ganttSvgElement("path", {
          d: `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`,
          class: "pm-gantt-arrow",
          "marker-end": "url(#pm-arrowhead)",
        }));
      }
    }
    svgEl.appendChild(arrowGroup);
  }

  /** Bar drag: edge drags move one edge, bar drag moves the span; dates are written once
   *  on release through the local action pipeline. Adapted from
   *  GanttDragHandler.attachBarDrag (the reference commits through the plugin store and
   *  pushes its own undo entry; here the local updateEventDates action owns persistence). */
  private attachGanttBarDrag(opts: GanttBarDragOpts): () => void {
    const { trigger, rect, barGroup, row, side, x, width, cfg, startField, endField } = opts;
    const moving = side === "move";
    let activeCleanup: (() => void) | null = null;
    trigger.addEventListener("mousedown", (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!moving) e.stopPropagation();
      e.preventDefault();
      this.ganttDragState.isDragging = true;
      this.ganttDragMoved = false;
      this.ganttDragState.dragSide = side;
      this.ganttDragState.dragRow = row;
      this.ganttDragState.dragStartX = e.clientX;
      this.ganttDragState.dragBarEl = rect;
      this.ganttDragState.dragInitialX = x;
      this.ganttDragState.dragInitialW = width;

      const snapPoints = this.ganttSnapPoints(cfg);
      const snap = (value: number) => this.ganttSnapX(value, snapPoints, cfg.dayWidth * 0.4);
      let movedX = x;
      let movedW = width;

      const restore = () => {
        if (moving) {
          barGroup.removeAttribute("transform");
          return;
        }
        rect.setAttribute("x", String(this.ganttDragState.dragInitialX));
        rect.setAttribute("width", String(this.ganttDragState.dragInitialW));
        this.repositionGanttBarChildren(barGroup, this.ganttDragState.dragInitialX, this.ganttDragState.dragInitialW);
      };

      const onMove = (ev: MouseEvent) => {
        if (!this.ganttDragState.isDragging || !this.ganttDragState.dragBarEl) return;
        const dx = ev.clientX - this.ganttDragState.dragStartX;
        if (Math.abs(dx) > 3) this.ganttDragMoved = true;
        if (moving) {
          movedX = snap(Math.max(0, this.ganttDragState.dragInitialX + dx));
          barGroup.setAttribute("transform", `translate(${movedX - this.ganttDragState.dragInitialX}, 0)`);
          return;
        }
        if (side === "left") {
          movedX = snap(Math.max(0, this.ganttDragState.dragInitialX + dx));
          movedW = this.ganttDragState.dragInitialX + this.ganttDragState.dragInitialW - movedX;
        } else {
          movedW = snap(movedX + this.ganttDragState.dragInitialW + dx) - movedX;
        }
        movedW = Math.max(cfg.dayWidth, movedW);
        this.ganttDragState.dragBarEl.setAttribute("x", String(movedX));
        this.ganttDragState.dragBarEl.setAttribute("width", String(movedW));
        this.repositionGanttBarChildren(barGroup, movedX, movedW);
      };

      const onUp = () => {
        window.activeDocument.removeEventListener("mousemove", onMove);
        window.activeDocument.removeEventListener("mouseup", onUp);
        if (moving) rect.removeClass("pm-gantt-bar-grabbing");
        activeCleanup = null;
        if (!this.ganttDragState.isDragging || !this.ganttDragState.dragRow || !this.ganttDragState.dragBarEl) return;
        this.ganttDragState.isDragging = false;
        if (!this.ganttDragMoved) {
          restore();
          return;
        }
        const startDateKey = this.ganttXToDate(cfg, snap(movedX));
        const dueDateKey = addDateKeyDays(this.ganttXToDate(cfg, snap(movedX + movedW)), -1);
        // The reference patches { start } / { due } / { start, due } per edge. The
        // change type requires both keys, so the untouched edge carries the bar's
        // current value as an anchor and changedEdge gates the write to one cell.
        const change: CalendarEventDateChange = {
          startField,
          startDateKey: side === "right" ? opts.startDateKey : startDateKey,
          endField,
          endDateKey: side === "left" ? undefined : dueDateKey,
          changedEdge: side === "left" ? "start" : side === "right" ? "end" : "both",
        };
        if (this.actions.isReadOnly || !this.actions.updateEventDates) {
          restore();
          return;
        }
        const result = this.actions.updateEventDates(this.ganttDragState.dragRow, change);
        if (result) {
          // A rejected save otherwise leaves the bar sitting at the dragged position
          // with no record of the change; the reference's restore() puts it back.
          void Promise.resolve(result).catch(() => {
            restore();
            new Notice(t("timeline.dateSaveFailed"));
          });
        }
      };

      if (moving) rect.addClass("pm-gantt-bar-grabbing");
      window.activeDocument.addEventListener("mousemove", onMove);
      window.activeDocument.addEventListener("mouseup", onUp);
      activeCleanup = () => {
        window.activeDocument.removeEventListener("mousemove", onMove);
        window.activeDocument.removeEventListener("mouseup", onUp);
      };
    });

    return () => {
      if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
        this.ganttDragState.isDragging = false;
        this.ganttDragState.dragBarEl = null;
      }
    };
  }

  /** Keeps the label, handles, and progress overlay on the bar while it resizes. Adapted from
   *  GanttDragHandler.repositionBarChildren. */
  private repositionGanttBarChildren(barGroup: HTMLElement, newX: number, newW: number): void {
    const label = barGroup.querySelector(".pm-gantt-bar-label");
    if (label) {
      label.setAttribute("x", String(newX + 8));
      if (newW <= GANTT_BAR_LABEL_MIN_WIDTH) {
        label.setAttribute("visibility", "hidden");
      } else {
        label.removeAttribute("visibility");
      }
    }
    const handles = barGroup.querySelectorAll(".pm-gantt-drag-handle");
    if (handles.length === 2) {
      handles[0].setAttribute("x", String(newX));
      handles[1].setAttribute("x", String(newX + newW - GANTT_HANDLE_WIDTH));
    }
    const progress = barGroup.querySelector(".pm-gantt-bar-progress");
    if (progress) progress.setAttribute("x", String(newX));
    const icon = barGroup.querySelector(".pm-gantt-bar-icon");
    if (icon) icon.setAttribute("x", String(newX + newW + 4));
  }

  /** Two-click finish-to-start linking with the reference's rejection rules, via the local
   *  link seam; the active dot highlight mirrors the reference's modifier class. */
  private handleGanttLinkDotClick(dot: HTMLElement, taskId: string, side: "left" | "right"): void {
    if (this.timelineLinkSelectionEl) this.timelineLinkSelectionEl.removeClass("pm-gantt-link-dot--active");
    this.handleTimelineLinkClick({ taskId, side }, dot);
    if (this.timelineLinkSelection && this.timelineLinkSelectionEl) {
      this.timelineLinkSelectionEl.addClass("pm-gantt-link-dot--active");
    }
  }

  /** Wheel passthrough and vertical scroll sync between the label column and the chart.
   *  Adapted from GanttView's left-panel wheel handling and scroll sync. The wheel listener
   *  covers the whole left panel (header included), and the returned syncSpacer runs in the
   *  renderer's post-layout frame because the scrollbar height only exists after layout. */
  private setupGanttScrollSync(leftPanel: HTMLElement, leftBody: HTMLElement, rightPanel: HTMLElement): () => void {
    const onLeftWheel = (e: WheelEvent) => {
      rightPanel.scrollTop += e.deltaY;
      rightPanel.scrollLeft += e.deltaX;
      e.preventDefault();
    };
    leftPanel.addEventListener("wheel", onLeftWheel, { passive: false });
    this.ganttCleanupFns.push(() => leftPanel.removeEventListener("wheel", onLeftWheel));
    const leftSpacer = leftBody.createDiv();
    leftSpacer.addClass("pm-no-shrink");
    const syncSpacer = () => {
      const hScrollbarH = rightPanel.offsetHeight - rightPanel.clientHeight;
      leftSpacer.style.height = `${hScrollbarH}px`;
    };
    rightPanel.addEventListener("scroll", () => {
      syncSpacer();
      leftBody.scrollTop = rightPanel.scrollTop;
    });
    return syncSpacer;
  }

  /** Center the chart on today, clamped to the range start. Adapted from
   *  GanttView.scrollToToday. */
  private scrollGanttToToday(cfg: GanttTimelineCfg, scrollEl: HTMLElement): void {
    const x = this.ganttDateToX(cfg, this.getTodayDateKey());
    const center = x - (scrollEl.clientWidth || 0) / 2;
    scrollEl.scrollLeft = Math.max(0, center);
  }

  /** Restores the scroll position captured before this render, or centers on today when
   *  there is none (first render). Adapted from GanttView.render's pendingScroll branch. */
  private applyGanttPendingScroll(cfg: GanttTimelineCfg, scrollEl: HTMLElement): void {
    const pending = this.ganttPendingScroll;
    if (pending) {
      this.ganttPendingScroll = null;
      scrollEl.scrollTop = pending.top;
      scrollEl.scrollLeft = Math.max(0, this.ganttDateToX(cfg, pending.anchorDateKey));
      return;
    }
    this.scrollGanttToToday(cfg, scrollEl);
  }

  /** Snap-point X positions; day: every day border, week: Monday and Thursday,
   *  month: 1st/8th/15th/22nd, quarter and year: the 1st of each month. Adapted from
   *  TimelineConfig.getSnapPoints. */
  private ganttSnapPoints(cfg: GanttTimelineCfg): number[] {
    const points: number[] = [];
    const { startDateKey, totalDays, dayWidth, granularity } = cfg;
    for (let i = 0; i <= totalDays; i++) {
      const d = this.ganttDateAt(startDateKey, i);
      const x = i * dayWidth;
      const dow = d.getUTCDay();
      if (granularity === "day") {
        points.push(x);
      } else if (granularity === "week") {
        if (dow === 1 || dow === 4) points.push(x);
      } else if (granularity === "month") {
        if (d.getUTCDate() === 1 || d.getUTCDate() === 8 || d.getUTCDate() === 15 || d.getUTCDate() === 22) points.push(x);
      } else if (d.getUTCDate() === 1) {
        points.push(x);
      }
    }
    return points;
  }

  /** Snap an x position to the nearest snap point within a threshold. Adapted from
   *  TimelineConfig.snapX. */
  private ganttSnapX(x: number, snapPoints: number[], threshold: number): number {
    let closest = x;
    let minDist = Infinity;
    for (const sp of snapPoints) {
      const dist = Math.abs(x - sp);
      if (dist < minDist) {
        minDist = dist;
        closest = sp;
      }
      if (sp > x + threshold) break;
    }
    return minDist <= threshold ? closest : x;
  }

  /** Date-to-x conversion in reference day units. Adapted from TimelineConfig.dateToX. */
  private ganttDateToX(cfg: GanttTimelineCfg, dateKey: string): number {
    return (dateKeyDaysBetween(cfg.startDateKey, dateKey) ?? 0) * cfg.dayWidth;
  }

  /** X-to-date conversion in reference day units. Adapted from TimelineConfig.xToDate. */
  private ganttXToDate(cfg: GanttTimelineCfg, x: number): string {
    return addDateKeyDays(cfg.startDateKey, Math.round(x / cfg.dayWidth));
  }

  /** Create an SVG element in the timeline's document, falling back to the host's
   *  element factory when the document surface is unavailable (tests). */
  private ganttSvgElement(tag: string, attrs?: Record<string, string | number>): HTMLElement {
    const host = this.timelineRoot ?? (typeof window !== "undefined" ? (window.activeDocument?.body ?? null) : null);
    const doc = host?.ownerDocument ?? (typeof window !== "undefined" ? window.activeDocument : undefined);
    let el: HTMLElement;
    if (doc && typeof doc.createElementNS === "function") {
      el = doc.createElementNS(SVG_NAMESPACE, tag) as unknown as HTMLElement;
    } else if (host) {
      el = host.createEl(tag as keyof HTMLElementTagNameMap);
    } else {
      throw new Error("No document available to create gantt SVG elements");
    }
    for (const [key, value] of Object.entries(attrs ?? {})) el.setAttribute(key, String(value));
    return el;
  }

  /** ISO week number for a UTC date (Temporal weekOfYear equivalent, rewritten). */
  private ganttWeekNumber(date: Date): number {
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = (target.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
    return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
  }

  private ganttDateAt(startDateKey: string, days: number): Date {
    const base = parseDateKeyToUtc(startDateKey);
    return base ? addUtcDays(base, days) : new Date(0);
  }

  private ganttMonthStart(dateKey: string): Date {
    const base = parseDateKeyToUtc(dateKey) ?? new Date(0);
    return makeUtcDate(base.getUTCFullYear(), base.getUTCMonth(), 1);
  }

  private ganttMonthLabel(date: Date): string {
    return new Intl.DateTimeFormat(getEffectiveLocale(), { month: "short" }).format(date);
  }

  private ganttMonthTopLabel(date: Date): string {
    return new Intl.DateTimeFormat(getEffectiveLocale(), { month: "short", year: "2-digit" }).format(date);
  }

  /** Bar fill: schema color token, falling back to the interactive accent. */
  private resolveGanttBarColor(event: CalendarTimelineEvent): string {
    if (event.color) return `var(--status-color-fg-${event.color})`;
    return "var(--interactive-accent)";
  }

  /** Status dot color: the status column's option color, falling back to muted text. */
  private resolveGanttStatusColor(config: ViewConfig, row: RowData): string {
    const column = config.schema.columns.find((candidate) => candidate.type === "status");
    const raw = column ? this.ganttScalarValue(row.frontmatter[column.key] ?? row.computed[column.key]) : "";
    const option = column?.statusOptions?.find((candidate) => candidate.value === raw);
    return option?.color ? `var(--status-color-fg-${option.color})` : "var(--text-muted)";
  }

  /** Status label for the bar tooltip: the raw status value, else a dash. */
  private resolveGanttStatusLabel(config: ViewConfig, row: RowData): string {
    const column = config.schema.columns.find((candidate) => candidate.type === "status");
    const raw = column ? this.ganttScalarValue(row.frontmatter[column.key] ?? row.computed[column.key]) : "";
    return raw || "\u2014";
  }

  /** Row progress: subtask-derived progress when present, else the row's own. */
  private resolveGanttEventProgress(event: CalendarTimelineEvent | undefined, row: RowData): number {
    const subtaskProgress = this.subtaskRelation?.nodes.get(row.file.path)?.progress;
    const value = subtaskProgress?.value ?? event?.progress ?? 0;
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  }

  private ganttRowRecurrence(row: RowData): boolean {
    return Boolean(row.frontmatter.recurrence);
  }

  /** Whether the row carries a real value in the given date-ish field. */
  private ganttRowHasDate(row: RowData, field: string, config: ViewConfig): boolean {
    const column = config.schema.columns.find((candidate) => candidate.key === field);
    const raw = column && (column.type === "computed" || column.type === "rollup")
      ? row.computed[column.type === "computed" ? column.computedKey || column.key : column.key]
      : row.frontmatter[field];
    if (raw instanceof Date) return Number.isFinite(raw.getTime());
    if (typeof raw === "number") return Number.isFinite(raw);
    if (typeof raw !== "string") return false;
    return /^\d{4}-\d{1,2}-\d{1,2}/.test(raw.trim());
  }

  /** Dependencies that point outside the current view, for the label-row chip. */
  private getGanttElsewhereDependencies(row: RowData): string[] {
    const graph = this.getTimelineDependencyGraph();
    return (graph.dependencies[row.file.path] ?? []).filter((id) => !graph.taskIds.has(id));
  }

  private formatGanttBarTooltip(row: RowData, event: CalendarTimelineEvent, config: ViewConfig): string {
    const status = this.resolveGanttStatusLabel(config, row);
    const priority = this.ganttScalarValue(row.frontmatter.priority ?? row.computed.priority) || "\u2014";
    const startValue = this.ganttScalarValue(row.frontmatter[config.timelineStartDateField || ""]);
    const dueValue = this.ganttScalarValue(config.timelineEndDateField ? row.frontmatter[config.timelineEndDateField] : undefined);
    const progress = Math.round(this.resolveGanttEventProgress(event, row));
    let text = t("timeline.barTooltip", {
      title: event.title,
      status,
      priority,
      start: startValue || "\u2014",
      due: dueValue || "\u2014",
      progress: String(progress),
    });
    const assignees = this.ganttAssignees(row);
    if (assignees.length > 0) {
      text += t("timeline.barTooltipAssignees", { names: assignees.join(", ") });
    }
    return text;
  }

  /** Frontmatter assignees with wiki-link wrappers and aliases unwrapped. */
  private ganttAssignees(row: RowData): string[] {
    const raw = row.frontmatter.assignees;
    if (!Array.isArray(raw)) return [];
    const names: string[] = [];
    for (const item of raw) {
      const text = String(item).trim();
      const inner = text.match(/^\[\[([^\]]+)\]\]$/)?.[1] ?? text;
      const pipe = inner.indexOf("|");
      names.push(pipe >= 0 ? inner.slice(pipe + 1).trim() : inner);
    }
    return names.filter(Boolean);
  }

  private ganttScalarValue(value: unknown): string {
    if (Array.isArray(value)) return value.length > 0 ? this.ganttScalarValue(value[0]) : "";
    if (value == null) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return "";
  }

  private renderTimelineGridColumns(
    body: HTMLElement,
    model: { startDateKey?: string; startMinutes?: number; totalUnits: number; unit: TimelineUnit },
  ): void {
    if (!model.startDateKey) return;
    const columns = body.createDiv({ cls: "db-timeline-grid-columns", attr: { "aria-hidden": "true" } });
    const startMinutes = model.startMinutes ?? 0;
    const now = new Date();
    const todayKey = this.getTodayDateKey(now);
    for (let index = 0; index < Math.max(1, model.totalUnits); index += 1) {
      const dateOffset = model.unit === "hour"
        ? Math.floor((startMinutes + index * MINUTES_PER_HOUR) / MINUTES_PER_DAY)
        : index;
      const dateKey = addDateKeyDays(model.startDateKey, dateOffset);
      // Each hour column shares one calendar date, so date equality alone would tint every
      // column of today's grid at once and the highlight would say nothing. The today-line
      // ruler already marks the exact minute; this class only needs the one column standing
      // in for the current clock hour.
      const isToday = model.unit === "hour"
        ? dateKey === todayKey && Math.floor((startMinutes + index * MINUTES_PER_HOUR) / MINUTES_PER_HOUR) % 24 === now.getHours()
        : dateKey === todayKey;
      const classes = [
        "db-timeline-grid-column",
        this.isTimelineWeekendDate(dateKey) ? "is-weekend" : "",
        isToday ? "is-today" : "",
      ].filter(Boolean).join(" ");
      const column = columns.createSpan({ cls: classes, attr: { "data-date-key": dateKey } });
      column.setCssProps({
        "--db-timeline-grid-column-offset": String(index),
        "--db-timeline-grid-column-span": "1",
      });
    }
  }

  private isTimelineWeekendDate(dateKey: string): boolean {
    const date = parseDateKeyToUtc(dateKey);
    if (!date) return false;
    const day = date.getUTCDay();
    return day === 0 || day === 6;
  }

  private renderTimelineDependencyLinks(body: HTMLElement): void {
    const graph = this.getTimelineDependencyGraph();
    const bars = new Map<string, HTMLElement>();
    for (const bar of Array.from(body.querySelectorAll<HTMLElement>(".db-timeline-event[data-timeline-event-id]"))) {
      const id = bar.dataset.timelineEventId;
      if (id) bars.set(id, bar);
    }
    const bodyRect = body.getBoundingClientRect();
    for (const [successorId, predecessorIds] of Object.entries(graph.dependencies)) {
      const successor = bars.get(successorId);
      const successorDot = successor?.querySelector<HTMLElement>(".db-timeline-link-dot.is-left");
      if (!successorDot) continue;
      for (const predecessorId of predecessorIds) {
        const predecessor = bars.get(predecessorId);
        const predecessorDot = predecessor?.querySelector<HTMLElement>(".db-timeline-link-dot.is-right");
        if (!predecessorDot) continue;
        const from = predecessorDot.getBoundingClientRect();
        const to = successorDot.getBoundingClientRect();
        const startX = from.left + from.width / 2 - bodyRect.left;
        const startY = from.top + from.height / 2 - bodyRect.top;
        const endX = to.left + to.width / 2 - bodyRect.left;
        const endY = to.top + to.height / 2 - bodyRect.top;
        const length = Math.hypot(endX - startX, endY - startY);
        if (![startX, startY, endX, endY, length].every(Number.isFinite)) continue;
        const line = body.createDiv({
          cls: "db-timeline-link-line",
          attr: {
            "aria-hidden": "true",
            "data-timeline-link-predecessor": predecessorId,
            "data-timeline-link-successor": successorId,
          },
        });
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.width = `${Math.max(1, length)}px`;
        line.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
      }
    }
  }

  private getTimelineDependencyGraph(): TimelineDependencyGraph {
    const taskIds = new Set(this.currentRows.map((row) => row.file.path));
    const dependencies: Record<string, string[]> = {};
    for (const row of this.currentRows) {
      const raw = row.frontmatter.dependencies ?? row.computed.dependencies;
      const values = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
      const ids: string[] = [];
      for (const value of values) {
        const parts = typeof value === "string" ? value.split(",") : [value];
        for (const part of parts) {
          const id = this.normalizeTimelineDependencyId(part);
          if (id && !ids.includes(id)) ids.push(id);
        }
      }
      dependencies[row.file.path] = ids;
    }
    return { dependencies, taskIds };
  }

  private normalizeTimelineDependencyId(value: unknown): string {
    if (value && typeof value === "object" && "path" in value && typeof value.path === "string") {
      return value.path;
    }
    if (typeof value !== "string") return "";
    const raw = value.trim();
    if (!raw) return "";
    const unwrapped = raw.replace(/^\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim();
    const direct = this.rowByPath.get(unwrapped);
    if (direct) return direct.file.path;
    const withExtension = unwrapped.endsWith(".md") ? unwrapped : `${unwrapped}.md`;
    const matchingRow = this.currentRows.find((row) => {
      const basename = row.file.basename || row.file.name.replace(/\.md$/i, "");
      return row.file.path === withExtension || basename === unwrapped || row.file.name === unwrapped;
    });
    return matchingRow?.file.path || unwrapped;
  }

  private renderTimelineLinkDots(parent: HTMLElement, event: CalendarTimelineEvent): void {
    for (const side of ["left", "right"] as const) {
      const labelKey = side === "left" ? "timeline.linkInput" : "timeline.linkOutput";
      const label = `${t(labelKey)}: ${event.title}`;
      const dot = parent.createEl("button", {
        cls: `db-timeline-link-dot is-${side}`,
        attr: {
          type: "button",
          "aria-label": label,
          "aria-keyshortcuts": "Enter Space",
          "data-timeline-link-side": side,
        },
      });
      setTooltip(dot, label, { delay: 100 });
      dot.addEventListener("pointerdown", (pointerEvent) => {
        if (pointerEvent.pointerType === "mouse" && pointerEvent.button !== 0) return;
        pointerEvent.preventDefault();
        pointerEvent.stopPropagation();
        this.beginTimelineLinkDrag(dot, { taskId: event.id, side }, pointerEvent);
      });
      dot.addEventListener("click", (mouseEvent) => {
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        if (this.suppressTimelineLinkClick) {
          this.suppressTimelineLinkClick = false;
          return;
        }
        this.handleTimelineLinkClick({ taskId: event.id, side }, dot);
      });
    }
  }

  private beginTimelineLinkDrag(dot: HTMLElement, click: TimelineLinkClick, pointerEvent: PointerEvent): void {
    this.activeTimelineLinkCleanup?.();
    const document = dot.ownerDocument;
    const startX = pointerEvent.clientX;
    const startY = pointerEvent.clientY;
    let didMove = false;
    let targetDot: HTMLElement | null = null;
    const updateTarget = (event: PointerEvent): void => {
      const target = this.findTimelineLinkTarget(document, event.clientX, event.clientY);
      if (targetDot !== target?.dot) {
        targetDot?.removeClass("is-target");
        targetDot = target?.dot || null;
        this.timelineLinkHoverEl = targetDot;
        targetDot?.addClass("is-target");
      }
    };
    const finish = (event?: PointerEvent): void => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointercancel", onCancel, true);
      if (this.activeTimelineLinkCleanup === finish) this.activeTimelineLinkCleanup = null;
      targetDot?.removeClass("is-target");
      targetDot = null;
      this.timelineRoot?.removeClass("is-link-dragging");
      if (!didMove) return;
      this.suppressTimelineLinkClick = true;
      window.setTimeout(() => { this.suppressTimelineLinkClick = false; }, 0);
      const target = event ? this.findTimelineLinkTarget(document, event.clientX, event.clientY) : null;
      if (!target) {
        this.cancelTimelineLink();
        return;
      }
      if (!this.timelineLinkSelection) this.handleTimelineLinkClick(click, dot);
      this.handleTimelineLinkClick(target.click, target.dot);
    };
    const onMove = (event: PointerEvent): void => {
      if (!didMove && Math.hypot(event.clientX - startX, event.clientY - startY) > 4) {
        didMove = true;
        if (!this.timelineLinkSelection) this.handleTimelineLinkClick(click, dot);
        this.timelineRoot?.addClass("is-link-dragging");
      }
      if (didMove) updateTarget(event);
    };
    const onUp = (event: PointerEvent): void => finish(event);
    const onCancel = (): void => finish();
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onCancel, true);
    this.activeTimelineLinkCleanup = finish;
    if (typeof dot.setPointerCapture === "function") dot.setPointerCapture(pointerEvent.pointerId);
  }

  private findTimelineLinkTarget(document: Document, clientX: number, clientY: number): { click: TimelineLinkClick; dot: HTMLElement | null } | null {
    if (typeof document.elementFromPoint !== "function") return null;
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const dot = target?.closest<HTMLElement>(".db-timeline-link-dot") || null;
    const bar = dot?.closest<HTMLElement>(".db-timeline-event") || target?.closest<HTMLElement>(".db-timeline-event") || null;
    const taskId = bar?.dataset.timelineEventId;
    if (!taskId) return null;
    const side = dot?.dataset.timelineLinkSide === "right" ? "right" : "left";
    const resolvedDot = dot || bar.querySelector<HTMLElement>(`.db-timeline-link-dot.is-${side}`);
    return { click: { taskId, side }, dot: resolvedDot };
  }

  private handleTimelineLinkClick(click: TimelineLinkClick, dot: HTMLElement | null): void {
    const resolution = resolveTimelineLinkChange(this.timelineLinkSelection, click, this.getTimelineDependencyGraph());
    if (resolution.kind === "pending") {
      this.timelineLinkSelection = resolution.click;
      this.timelineLinkSelectionEl?.removeClass("is-active");
      this.timelineLinkSelectionEl = dot;
      // is-active/is-linking are local-extension CSS (styles.css scopes both to
      // .db-timeline); the reference pm-gantt tree has its own dot highlight
      // (pm-gantt-link-dot--active, applied by the caller) and no root-level
      // "linking" class at all (GanttLinkHandler.ts), so writing these two here
      // would be dead weight on that tree.
      if (this.timelineRoot?.hasClass("db-timeline")) {
        dot?.addClass("is-active");
        this.timelineRoot.addClass("is-linking");
      }
      return;
    }
    if (resolution.kind === "rejected") {
      // Same-side clicks keep the first dot armed (the reference returns before
      // cancelling); the other rejections cancel the in-progress link.
      if (resolution.reason !== "same-side") this.clearTimelineLinkSelection();
      this.showTimelineLinkNotice(resolution);
      return;
    }
    this.clearTimelineLinkSelection();
    if (resolution.kind !== "committed") return;
    const predecessor = this.rowByPath.get(resolution.predecessorId);
    const successor = this.rowByPath.get(resolution.successorId);
    if (!predecessor || !successor) {
      new Notice(t("timeline.linkMissingTask"));
      return;
    }
    if (!this.actions.updateTimelineDependency) {
      new Notice(t("timeline.linkUnavailable"));
      return;
    }
    try {
      const result = this.actions.updateTimelineDependency(predecessor, successor, resolution.dependencies);
      if (result) {
        void result
          .then(() => new Notice(t("timeline.linkCreated")))
          .catch(() => new Notice(t("timeline.linkSaveFailed")));
      } else {
        new Notice(t("timeline.linkCreated"));
      }
    } catch {
      new Notice(t("timeline.linkSaveFailed"));
    }
  }

  private clearTimelineLinkSelection(): void {
    this.timelineLinkSelectionEl?.removeClass("is-active", "pm-gantt-link-dot--active");
    this.timelineLinkHoverEl?.removeClass("is-target");
    this.timelineLinkSelection = null;
    this.timelineLinkSelectionEl = null;
    this.timelineLinkHoverEl = null;
    this.timelineRoot?.removeClass("is-linking", "is-link-dragging");
  }

  private cancelTimelineLink(): void {
    this.activeTimelineLinkCleanup?.();
    this.activeTimelineLinkCleanup = null;
    this.clearTimelineLinkSelection();
  }

  private showTimelineLinkNotice(resolution: Extract<TimelineLinkResolution, { kind: "rejected" }>): void {
    const keys: Record<Extract<TimelineLinkResolution, { kind: "rejected" }>['reason'], string> = {
      "same-side": "timeline.linkSameSide",
      duplicate: "timeline.linkDuplicate",
      "missing-task": "timeline.linkMissingTask",
      cycle: "timeline.linkCycle",
    };
    new Notice(t(keys[resolution.reason]));
  }

  private startTimelineLinkFromMenu(rowPath: string): void {
    const dot = Array.from(this.timelineRoot?.querySelectorAll<HTMLElement>(".db-timeline-link-dot.is-right") || [])
      .find((candidate) => candidate.closest<HTMLElement>(".db-timeline-event")?.dataset.timelineEventId === rowPath) || null;
    this.handleTimelineLinkClick({ taskId: rowPath, side: "right" }, dot);
  }

  private renderUnscheduledBacklog(parent: HTMLElement, config: ViewConfig, rows: RowData[], startField: string): void {
    const unscheduled = collectUnscheduledTimelineRows(rows, config, startField);
    if (unscheduled.length === 0) return;
    const drawer = parent.createDiv({ cls: `db-timeline-backlog${this.backlogCollapsed ? " is-collapsed" : ""}` });
    const toggle = drawer.createEl("button", {
      cls: "db-timeline-backlog-toggle",
      text: `${t("calendar.unscheduled")} (${unscheduled.length})`,
      attr: { type: "button", "aria-expanded": this.backlogCollapsed ? "false" : "true" },
    });
    const list = drawer.createDiv({ cls: "db-timeline-backlog-list" });
    toggle.onclick = () => {
      this.backlogCollapsed = !this.backlogCollapsed;
      drawer.toggleClass("is-collapsed", this.backlogCollapsed);
      toggle.setAttribute("aria-expanded", this.backlogCollapsed ? "false" : "true");
    };
    for (const row of unscheduled) {
      const item = list.createEl("button", { cls: "db-timeline-backlog-item", text: row.file.basename || row.file.name, attr: { type: "button", title: row.file.path } });
      item.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.actions.openRecordDetail) this.actions.openRecordDetail(item, row);
        else this.actions.openRow(row);
      };
      if (!this.actions.isReadOnly && this.actions.updateEventDates) {
        item.draggable = true;
        item.addEventListener("dragstart", (event) => {
          event.dataTransfer?.setData("application/x-note-database-unscheduled", row.file.path);
          event.dataTransfer?.setData("text/plain", row.file.path);
        });
      }
    }
  }

  private setupTimelineBacklogDropTarget(target: HTMLElement, config: ViewConfig, fallbackDateKey?: string): void {
    if (this.actions.isReadOnly || !this.actions.updateEventDates) return;
    target.addEventListener("dragover", (event) => {
      if (!Array.from(event.dataTransfer?.types || []).includes("application/x-note-database-unscheduled")) return;
      event.preventDefault();
      target.addClass("is-backlog-drop-target");
    });
    target.addEventListener("dragleave", () => target.removeClass("is-backlog-drop-target"));
    target.addEventListener("drop", (event) => {
      const path = event.dataTransfer?.getData("application/x-note-database-unscheduled");
      const row = path ? this.rowByPath.get(path) : undefined;
      if (!row || !fallbackDateKey) return;
      event.preventDefault();
      event.stopPropagation();
      target.removeClass("is-backlog-drop-target");
      const dateKey = this.getTimelineDateFromPoint(target, event.clientX, fallbackDateKey, 1, fallbackDateKey, config.timelineScale);
      void this.actions.updateEventDates?.(row, {
        startField: config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config) || "",
        startDateKey: dateKey,
        endField: config.timelineEndDateField || config.calendarEndDateField,
        endDateKey: dateKey,
        changedEdge: "both",
      });
    });
  }

  private setupTimelineZoomGesture(scroll: HTMLElement, config: ViewConfig): void {
    const scales: TimelineScale[] = ["day", "week", "month", "quarter", "year"];
    const changeScale = (direction: number): void => {
      const current = scales.indexOf(config.timelineScale || "week");
      const next = scales[Math.max(0, Math.min(scales.length - 1, current + direction))];
      if (next && next !== (config.timelineScale || "week")) void this.setTimelineScale(config, next);
    };
    scroll.addEventListener("wheel", (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      changeScale(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
    let pinchDistance: number | null = null;
    scroll.addEventListener("touchstart", (event) => {
      if (event.touches.length === 2) pinchDistance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
    }, { passive: true });
    scroll.addEventListener("touchmove", (event) => {
      if (event.touches.length !== 2 || pinchDistance == null) return;
      const nextDistance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
      if (Math.abs(nextDistance - pinchDistance) < 24) return;
      changeScale(nextDistance < pinchDistance ? 1 : -1);
      pinchDistance = nextDistance;
    }, { passive: true });
    scroll.addEventListener("touchend", () => { pinchDistance = null; }, { passive: true });
  }

  private fitTimelineGroupHeaderWidth(wrap: HTMLElement, container: HTMLElement): void {
    const apply = () => {
      if (!wrap.isConnected) return;
      const labels = Array.from(wrap.querySelectorAll<HTMLElement>(".db-timeline-group-header-label"));
      if (labels.length === 0) return;
      const contentWidth = labels.reduce((max, label) => {
        const toggle = label.querySelector<HTMLElement>(".db-timeline-group-toggle");
        const tag = label.querySelector<HTMLElement>(".db-timeline-group-tag");
        const summaries = Array.from(label.querySelectorAll<HTMLElement>(".db-group-summary-item"));
        const itemCount = [toggle, tag, ...summaries].filter(Boolean).length;
        const naturalWidth = (toggle?.offsetWidth || 0) +
          (tag?.scrollWidth || 0) +
          summaries.reduce((sum, item) => sum + item.scrollWidth, 0) +
          Math.max(0, itemCount - 1) * 4 +
          8;
        return Math.max(max, naturalWidth);
      }, 0);
      const viewportWidth = Math.max(320, container.clientWidth || container.getBoundingClientRect().width || 0);
      const width = Math.max(160, Math.min(Math.ceil(contentWidth), Math.max(160, viewportWidth - 96)));
      wrap.style.setProperty("--db-timeline-group-width", `${width}px`);
    };
    apply();
    (container.ownerDocument.defaultView || window).requestAnimationFrame(apply);
  }

  private renderTimelineTickLabel(tickEl: HTMLElement, label: string, scale: TimelineScale, isFirstTick = false): void {
    const labelEl = tickEl.createSpan({ cls: "db-timeline-tick-label" });
    // Every label is centred on its tick's left boundary; the first tick's boundary is the
    // viewport's left edge, so that label anchors at the edge instead of clipping past it.
    if (isFirstTick) labelEl.setCssProps({ transform: "none" });
    if (scale === "week") {
      const separator = label.lastIndexOf(" ");
      if (separator > 0 && separator < label.length - 1) {
        labelEl.createSpan({ cls: "db-timeline-tick-weekday", text: label.slice(0, separator) });
        labelEl.createSpan({ cls: "db-timeline-tick-date", text: label.slice(separator + 1) });
        return;
      }
    }
    labelEl.createSpan({ cls: "db-timeline-tick-date", text: label });
  }

  /** Render a single timeline event bar with unified absolute-scale positioning. */
  private renderTimelineEvent(
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    groupKey: string,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; unit: TimelineUnit; scale: TimelineScale },
    range: { renderStart: number; renderEnd: number; visible: { startMinutes: number; endMinutes: number }; isClippedStart: boolean; isClippedEnd: boolean },
    laneEvents: CalendarTimelineEvent[],
    lanes: Array<{ key: string; label: string; color?: string; events: CalendarTimelineEvent[] }>,
    rowIndex: number,
  ): void {
    const dateText = this.formatTimelineEventMeta(event, model.scale, config);
    const eventDetails = [event.title, dateText].filter(Boolean).join(" · ");
    const eventLabel = `${t("menu.openNote")}: ${eventDetails}`;
    // date 列事件保留 muted 全天条视觉（仅样式，定位统一走 exact）。
    const isDateColumn = this.isTimelineDateColumn(config, event);
    const isMilestone = Boolean(event.isMilestone);
    // A milestone's label spans wider than its one-day bar; when the next bar in the lane starts
    // inside that span the label moves above the bar so no bar paints over it.
    const milestoneLabelPlacement = isMilestone
      ? resolveTimelineMilestoneLabelPlacement(event, laneEvents, this.getTimelineRenderUnitWidth(config, model.scale), model.unit)
      : "inline";
    const subtaskNode = this.subtaskRelation?.nodes.get(event.row.file.path);
    const subtaskChildren = this.subtaskRelation?.childrenOf.get(event.row.file.path) || [];
    // A relation node exists for every row (subtask-relation.ts builds a shell per row), so
    // presence alone cannot gate the subtask styling class — that restyled every event. Only a
    // row with children or an actual parent participates in a visible relation.
    const hasSubtaskRelation = Boolean(subtaskNode) && (subtaskChildren.length > 0 || subtaskNode!.parentId !== null);
    const hasSubtaskChildren = Boolean(subtaskNode) && subtaskChildren.length > 0;
    const subtaskProgress = subtaskNode?.progress;
    const progress = subtaskProgress?.value ?? event.progress ?? 0;
    const eventEl = eventsEl.createDiv({
      cls: `db-timeline-event${hasSubtaskRelation ? " db-subtask-event" : ""}${hasSubtaskChildren ? " has-subtask-children" : ""}${isDateColumn ? " is-all-day" : ""}${isMilestone ? " is-milestone" : ""}${milestoneLabelPlacement === "above" ? " is-label-above" : ""}${progress > 0 ? " is-progressing" : ""}${range.isClippedStart ? " is-clipped-start" : ""}${range.isClippedEnd ? " is-clipped-end" : ""}`,
      attr: {
        role: "group",
        "aria-label": eventDetails,
        title: `${event.title} · ${dateText} · ${event.filePath}`,
        "data-note-database-row-path": event.row.file.path,
        "data-timeline-event-id": event.id,
        ...(hasSubtaskRelation ? {
          "data-subtask-depth": String(subtaskNode!.depth),
          "data-subtask-visible": String(subtaskNode!.visible),
          "data-subtask-progress-source": subtaskProgress?.source || "none",
        } : {}),
        ...(isMilestone ? { "data-timeline-milestone": "true" } : {}),
        ...(progress > 0 ? { "data-timeline-progress": String(progress) } : {}),
      },
    });
    eventEl.style.setProperty("--db-timeline-row", String(rowIndex));
    if (hasSubtaskRelation) eventEl.style.setProperty("--db-subtask-depth", String(subtaskNode!.depth));
    // 统一绝对刻度定位（可见窗口夹取后的 [renderStart, renderEnd]）；所有事件同一路径，不再 is-timed 双轨。
    this.applyTimelineAbsolutePosition(eventEl, range.renderStart, range.renderEnd, range.visible.startMinutes, model.unit);
    this.applyCalendarEventColor(eventEl, event.color);
    this.actions.applyConditionalFormat?.(eventEl, event.row, config);
    if (isMilestone) eventEl.createSpan({ cls: "db-timeline-milestone-diamond", attr: { "aria-hidden": "true" } });
    if (progress > 0) {
      const progressDuration = Math.max(model.unit === "hour" ? 0.25 : 1, event.durationUnits || 1);
      const progressUnits = resolveTimelineProgressFillUnits(progress, progressDuration);
      const progressEl = eventEl.createSpan({ cls: "db-timeline-event-progress", attr: { "aria-hidden": "true" } });
      progressEl.style.setProperty("--db-timeline-progress-width", `calc(var(--db-timeline-unit-width) * ${this.formatTimelineUnitValue(progressUnits)})`);
    }
    if (hasSubtaskChildren) {
      // Sibling of the trigger, not a child of it: a control nested inside the trigger button is
      // the invalid markup the trigger was introduced to remove. It is created first so the bar
      // reads left to right in both the DOM and the tab order.
      const collapsed = subtaskNode!.collapsed;
      const toggle = eventEl.createEl("button", {
        cls: `db-subtask-toggle db-subtask-event-toggle${collapsed ? " is-collapsed" : ""}`,
        attr: {
          type: "button",
          "aria-label": collapsed ? t("subtask.expand") : t("subtask.collapse"),
          "aria-expanded": String(!collapsed),
        },
      });
      toggle.createSpan({ cls: "db-collapse-triangle", attr: { "aria-hidden": "true" } });
      toggle.onclick = (mouseEvent) => {
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        const result = this.actions.toggleSubtaskCollapsed?.(event.row, !collapsed);
        if (result) void Promise.resolve(result).catch(() => undefined);
      };
    }
    const trigger = eventEl.createEl("button", {
      cls: "db-timeline-event-trigger",
      attr: { type: "button", "aria-label": eventLabel },
    });
    const content = trigger.createSpan({ cls: "db-timeline-event-content" });
    this.actions.renderRecordIcon?.(content, event.row, config, true);
    const titleEl = content.createSpan({ cls: `db-timeline-event-title${event.titleIsEmpty ? " is-empty-title" : ""}`, text: event.title });
    markNoteHoverLink(titleEl, event.row.file.path, event.row.file.path);
    content.createSpan({ cls: "db-timeline-event-meta", text: dateText });
    if (subtaskProgress && (subtaskProgress.explicit != null || subtaskProgress.derived != null)) {
      const summary = subtaskProgress.derived == null
        ? ""
        : t("subtask.progressSummary", { done: subtaskProgress.done, total: subtaskProgress.total });
      const explicit = subtaskProgress.explicit == null
        ? ""
        : t("subtask.explicitProgress", { value: Math.round(subtaskProgress.explicit) });
      const labels = [summary, explicit].filter(Boolean);
      const progressLabel = content.createSpan({ cls: "db-timeline-subtask-progress", attr: { "aria-label": labels.join(" · ") } });
      if (summary) progressLabel.createSpan({ cls: "db-subtask-progress-derived", text: summary });
      if (summary && explicit) progressLabel.createSpan({ text: " · ", attr: { "aria-hidden": "true" } });
      if (explicit) progressLabel.createSpan({ cls: "db-subtask-progress-explicit", text: explicit });
    }
    this.renderTimelineLinkDots(eventEl, event);
    // The resize handles, the link dots, the subtask toggle and the phone menu button are siblings
    // of this trigger, not children of it, so a press on one of them never reaches here.
    trigger.onclick = () => {
      if (this.actions.openRecordDetail) {
        this.actions.openRecordDetail(trigger, event.row);
      } else {
        this.actions.openRow(event.row);
      }
    };
    eventEl.oncontextmenu = (mouseEvent) => this.actions.showRowMenu?.(mouseEvent, event.row);
    // 拖拽入口按列类型分流（全 scale 通用）：datetime 列在日视图走 timed move（改时间），
    // date 列（任意 scale）走 date move（按天整体平移）。date 列不再进 timed 路径，避免无 time
    // 事件被当作 1h 区间或夹到 visibleStart 改写起始日。
    const useTimedMove = model.scale === "day" && !isDateColumn;
    if (useTimedMove) {
      this.setupTimelineTimedEventPointerDrag(eventEl, eventsEl, config, event, groupKey, model, laneEvents, lanes);
    } else {
      this.setupTimelineEventDateDrag(eventEl, eventsEl, config, event, groupKey, model, laneEvents, lanes);
    }
    if (!this.actions.isReadOnly && this.actions.updateEventDates && (config.timelineEndDateField || config.calendarEndDateField)) {
      if (!range.isClippedStart) this.renderTimelineResizeHandle(eventEl, eventsEl, config, event, model, "start", groupKey);
      if (!range.isClippedEnd) this.renderTimelineResizeHandle(eventEl, eventsEl, config, event, model, "end", groupKey);
    }
    if (this.touchMode && !this.actions.isReadOnly) {
      this.renderTimelineMobileMenuButton(eventEl, config, event, groupKey, laneEvents, lanes);
    }
  }

  /**
   * 统一绝对刻度定位：按事件在可见窗口夹取后的 [renderStart, renderEnd] 区间设置 exact-offset/width。
   * day scale 单位=小时（/MINUTES_PER_HOUR）；week/month/quarter 单位=天（/MINUTES_PER_DAY）。
   * 刻度统一是绝对分钟，按 unit 换算成与 CSS --db-timeline-unit-width 对应的列单位。
   */
  private applyTimelineAbsolutePosition(button: HTMLElement, renderStart: number, renderEnd: number, visibleStart: number, unit: TimelineUnit): void {
    const minutesPerUnit = unit === "hour" ? MINUTES_PER_HOUR : MINUTES_PER_DAY;
    const minUnits = unit === "hour" ? 0.25 : 1;
    const offsetUnits = Math.max(0, (renderStart - visibleStart) / minutesPerUnit);
    const widthUnits = Math.max(minUnits, (renderEnd - renderStart) / minutesPerUnit);
    button.setCssProps({
      "--db-timeline-exact-offset": `calc(var(--db-timeline-unit-width) * ${offsetUnits})`,
      "--db-timeline-exact-width": `calc(var(--db-timeline-unit-width) * ${widthUnits})`,
    });
  }

  private renderTimelineJumpIndicator(
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    direction: "before" | "after",
    target: "start" | "end",
    model: { startDateKey?: string; totalUnits: number; scale: TimelineScale },
    rowIndex: number,
    isOverEvent = false,
  ): void {
    const dateKey = target === "end" ? event.endDateKey : event.startDateKey;
    const button = eventsEl.createEl("button", {
      cls: `db-timeline-window-jump is-${direction}${isOverEvent ? " is-over-event" : ""}`,
      attr: {
        type: "button",
        "aria-label": t("timeline.jumpToEvent", { title: event.title, date: dateKey }),
        "data-note-database-row-path": event.row.file.path,
      },
    });
    button.style.setProperty("--db-timeline-row", String(rowIndex));
    setIcon(button, direction === "before" ? "arrow-left" : "arrow-right");
    setTooltip(button, t("timeline.jumpToEvent", { title: event.title, date: dateKey }), { delay: 100 });
    button.onclick = (mouseEvent) => {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      this.jumpTimelineToEvent(config, event, model, target);
    };
  }

  private jumpTimelineToEvent(
    config: ViewConfig,
    event: CalendarTimelineEvent,
    model: { startDateKey?: string; totalUnits: number; scale: TimelineScale },
    target: "start" | "end" = "start",
  ): void {
    const anchor = resolveTimelineJumpAnchor({
      event,
      target,
      scale: model.scale || config.timelineScale || "week",
      totalUnits: model.totalUnits,
    });
    this.updateTimelineAnchor(anchor.dateKey, anchor.timeMinutes);
  }

  private renderTimelineGroupHeader(parent: HTMLElement, config: ViewConfig, lane: { key: string; label: string; color?: string; events: CalendarTimelineEvent[] }): boolean {
    const collapseField = this.getTimelineCollapseField(config);
    const collapsed = this.isTimelineGroupCollapsed(config, collapseField, lane.key);
    const sectionId = `group-section-${encodeURIComponent(`${collapseField}:${lane.key}`)}`;
    parent.setAttr("id", sectionId);
    const header = parent.createDiv({ cls: "db-timeline-group-header" });
    const headerLabel = header.createDiv({ cls: "db-timeline-group-header-label" });
    const toggle = headerLabel.createEl("button", {
      cls: `db-timeline-group-toggle${collapsed ? " is-collapsed" : ""}`,
      attr: { type: "button", "aria-label": collapsed ? t("group.expand") : t("group.collapse"), "aria-expanded": String(!collapsed), "aria-controls": sectionId },
    });
    toggle.createSpan({ cls: "db-collapse-triangle" });
    toggle.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.toggleGroupCollapsed?.(collapseField, lane.key);
    };
    this.renderTimelineGroupTag(headerLabel, lane);
    this.actions.renderGroupSummaries?.(headerLabel, lane.events.map((event) => event.row), config);
    header.createDiv({ cls: "db-timeline-group-header-grid" });
    return collapsed;
  }

  private getTimelineCollapseField(config: ViewConfig): string {
    return config.timelineGroupField || "__timeline__";
  }

  /** 判定事件起始字段是否为 date 列（无 time）。取代已删除的 isAllDay：date 列事件
   *  按「全天条」语义渲染，datetime 列按 timed 语义渲染。 */
  private isTimelineDateColumn(config: ViewConfig, event: CalendarTimelineEvent): boolean {
    const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
    const col = config.schema.columns.find((c) => c.key === startField);
    return col?.type === "date";
  }

  private isTimelineGroupCollapsed(config: ViewConfig, field: string, key: string): boolean {
    return this.actions.isGroupCollapsed?.(field, key) ?? (config.collapsedGroups?.[field] || []).includes(key);
  }

  private renderTimelineGroupTag(parent: HTMLElement, lane: { label: string; color?: string; events: CalendarTimelineEvent[] }): void {
    const tag = parent.createSpan({ cls: "db-timeline-group-tag" });
    if (lane.color) {
      tag.addClass(`status-color-${lane.color}`);
      tag.style.setProperty("--db-timeline-group-tag-bg", `var(--status-color-bg-${lane.color})`);
      tag.style.setProperty("--db-timeline-group-tag-fg", `var(--status-color-fg-${lane.color})`);
    }
    tag.createSpan({ cls: "db-timeline-group-title", text: lane.label });
    tag.createSpan({ cls: "db-timeline-group-count", text: String(lane.events.length) });
  }

  private renderTimelineCreateRow(
    parent: HTMLElement,
    config: ViewConfig,
    model: { startDateKey?: string; endDateKey?: string; totalUnits: number; scale: TimelineScale },
    groupKey: string,
  ): void {
    if (this.actions.isReadOnly || !this.actions.createEntryForDate || !model.startDateKey) return;
    const row = parent.createDiv({ cls: "db-timeline-create-row" });
    const button = row.createEl("button", {
      cls: "db-timeline-create-button",
      attr: { type: "button" },
    });
    button.setCssProps({
      "--db-timeline-create-offset": "1",
      "--db-timeline-create-span": String(this.getTimelineCreateSpanUnits(model)),
      "--db-timeline-create-left": "0px",
      "--db-timeline-create-width": `calc(var(--db-timeline-unit-width) * ${this.formatTimelineUnitValue(this.getTimelineCreateSpanUnits(model))})`,
    });
    const content = button.createSpan({ cls: "db-timeline-create-content" });
    setIcon(content.createSpan({ cls: "db-timeline-create-icon" }), "plus");
    content.createSpan({ cls: "db-timeline-create-label", text: t("toolbar.new") });
    this.setupTimelineCreateRow(button, config, model, groupKey);
  }

  private setupTimelineCreateRow(
    button: HTMLElement,
    config: ViewConfig,
    model: { startDateKey?: string; endDateKey?: string; totalUnits: number; scale: TimelineScale },
    groupKey: string,
  ): void {
    button.onmouseenter = (mouseEvent) => this.updateTimelineCreatePreview(button, config, model, mouseEvent.clientX);
    button.onmousemove = (mouseEvent) => this.updateTimelineCreatePreview(button, config, model, mouseEvent.clientX);
    button.onmouseleave = () => this.clearTimelineCreatePreview(button);
    button.onfocus = () => {
      button.setCssProps({
        "--db-timeline-create-offset": "1",
        "--db-timeline-create-span": String(this.getTimelineCreateSpanUnits(model)),
        "--db-timeline-create-left": "0px",
        "--db-timeline-create-width": `calc(var(--db-timeline-unit-width) * ${this.formatTimelineUnitValue(this.getTimelineCreateSpanUnits(model))})`,
      });
    };
    button.onblur = () => this.clearTimelineCreatePreview(button);
    button.onclick = (mouseEvent) => {
      if (!model.startDateKey) return;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      const target = this.getTimelineCreateTargetFromPoint(button, mouseEvent.clientX, config, model);
      this.applyTimelineCreatePreview(button, target);
      const options: CalendarTimelineCreateOptions = { ...target.options };
      if (config.timelineGroupField && groupKey !== UNCATEGORIZED_TIMELINE_LANE) {
        options.groupField = config.timelineGroupField;
        options.groupKey = groupKey;
      }
      this.actions.createEntryForDate?.(config, target.dateKey, options);
    };
  }

  private updateTimelineCreatePreview(
    button: HTMLElement,
    config: ViewConfig,
    model: { startDateKey?: string; endDateKey?: string; totalUnits: number; scale: TimelineScale },
    clientX: number,
  ): void {
    this.applyTimelineCreatePreview(button, this.getTimelineCreateTargetFromPoint(button, clientX, config, model));
  }

  private applyTimelineCreatePreview(button: HTMLElement, target: TimelineCreateTarget): void {
    button.setCssProps({
      "--db-timeline-create-offset": this.formatTimelineUnitValue(target.offsetUnits + 1),
      "--db-timeline-create-span": this.formatTimelineUnitValue(target.spanUnits),
      "--db-timeline-create-left": `calc(var(--db-timeline-unit-width) * ${this.formatTimelineUnitValue(target.offsetUnits)})`,
      "--db-timeline-create-width": `calc(var(--db-timeline-unit-width) * ${this.formatTimelineUnitValue(target.spanUnits)})`,
    });
    button.addClass("is-previewing");
  }

  private clearTimelineCreatePreview(button: HTMLElement): void {
    button.removeClass("is-previewing");
  }

  /** Navigation header: window title + prev/today/next buttons. Mirrors the calendar header. */
  private renderTimelineHeader(wrap: HTMLElement, config: ViewConfig, model: { startDateKey?: string; endDateKey?: string; totalUnits: number; scale: TimelineScale }): void {
    const header = wrap.createDiv({ cls: "db-timeline-header" });
    const fallbackTitleWindow = getTimelineTitleWindow(config, getTimelineAnchor(config), this.timelineObservedUnitCount);
    const titleWindow = model.startDateKey && model.endDateKey
      ? { startDateKey: model.startDateKey, endDateKey: model.endDateKey }
      : fallbackTitleWindow;
    this.renderTimelineTitle(header, formatCalendarTitleParts({
      scale: model.scale,
      startDateKey: titleWindow.startDateKey,
      endDateKey: titleWindow.endDateKey,
      locale: getEffectiveLocale(),
    }));
    const controls = header.createDiv({ cls: "db-timeline-controls" });
    const scale = model.scale;
    this.renderTimelineScaleControl(controls, config, scale);
    this.renderTimelineNavButton(controls, "timeline.prevLong", () => this.shiftTimeline(config, scale, -1, model, "long"), "chevrons-left");
    this.renderTimelineNavButton(controls, "timeline.prevShort", () => this.shiftTimeline(config, scale, -1, model, "short"), "chevron-left");
    this.renderTimelineNavButton(controls, "timeline.today", () => this.goToTimelineToday(config, model));
    this.renderTimelineNavButton(controls, "timeline.nextShort", () => this.shiftTimeline(config, scale, 1, model, "short"), "chevron-right");
    this.renderTimelineNavButton(controls, "timeline.nextLong", () => this.shiftTimeline(config, scale, 1, model, "long"), "chevrons-right");
    this.renderTimelineMiniCalendarButton(controls, header, config);
    this.renderTimelineInvalidWarning(controls, config);
  }

  private getModelVisibleRange(model: { startDateKey?: string; endDateKey?: string; unit: TimelineUnit; totalUnits: number; startMinutes?: number }): CalendarTimelineSearchVisibleRange | null {
    if (!model.startDateKey || !model.endDateKey) return null;
    if (model.unit === "hour") {
      return timelineHourRange(model.startDateKey, model.startMinutes ?? 0, model.totalUnits);
    }
    return { startDateKey: model.startDateKey, endDateKey: model.endDateKey };
  }

  private renderTimelineScaleControl(parent: HTMLElement, config: ViewConfig, currentScale: TimelineScale): void {
    const options: Array<{ value: TimelineScale; text: string }> = [
      { value: "day", text: t("timeline.scaleDay") },
      { value: "week", text: t("timeline.scaleWeek") },
      { value: "month", text: t("timeline.scaleMonth") },
      { value: "quarter", text: t("timeline.scaleQuarter") },
      { value: "year", text: t("timeline.scaleYear") },
    ];
    const activeScale = config.timelineScale || currentScale;
    const control = parent.createDiv({
      cls: "db-timeline-scale-control",
      attr: { role: "group", "aria-label": t("viewConfig.timelineScale") },
    });
    const segment = control.createDiv({ cls: "db-timeline-scale-segment" });
    for (const option of options) {
      const active = option.value === activeScale;
      const button = segment.createEl("button", {
        cls: `db-timeline-scale-button${active ? " is-active" : ""}`,
        text: option.text,
        attr: { type: "button", "aria-pressed": active ? "true" : "false", "data-timeline-scale": option.value, "aria-label": option.text },
      });
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.setTimelineScale(config, option.value);
      };
    }
    const activeText = options.find((option) => option.value === activeScale)?.text || t("timeline.scaleWeek");
    const menuButton = control.createEl("button", {
      cls: "db-timeline-scale-menu db-timeline-nav-button is-text",
      attr: {
        type: "button",
        "aria-haspopup": "listbox",
      },
    });
    menuButton.createSpan({ cls: "db-timeline-scale-menu-label", text: activeText });
    setIcon(menuButton.createSpan({ cls: "db-timeline-nav-icon db-timeline-scale-menu-chevron" }), "chevron-down");
    menuButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.closeTimelineScaleMenu();
      this.timelineScaleMenuCleanup = openDropdownMenu({
        anchor: menuButton,
        label: t("viewConfig.timelineScale"),
        options,
        value: activeScale,
        popoverClassName: "db-timeline-scale-popover",
        onChange: (value) => {
          void this.setTimelineScale(config, this.normalizeTimelineScale(value));
          this.closeTimelineScaleMenu();
        },
      });
    };
  }

  private async setTimelineScale(config: ViewConfig, scale: TimelineScale): Promise<void> {
    this.closeTimelineScaleMenu();
    if ((config.timelineScale || "week") === scale) return;
    if (this.actions.updateTimelineScale) {
      await this.actions.updateTimelineScale(scale, t("undo.timelineScaleConfig"));
      return;
    }
    config.timelineScale = scale;
    this.actions.onConfigChange?.(t("undo.timelineScaleConfig"));
  }

  private closeTimelineScaleMenu(): void {
    this.timelineScaleMenuCleanup?.();
    this.timelineScaleMenuCleanup = null;
  }

  private normalizeTimelineScale(value: string): TimelineScale {
    return value === "day" || value === "month" || value === "quarter" || value === "year" ? value : "week";
  }

  private renderTimelineNavButton(parent: HTMLElement, labelKey: string, onClick: () => void, icon?: string): void {
    const button = parent.createEl("button", {
      cls: `db-timeline-nav-button${icon ? " is-icon" : " is-text"}`,
      attr: { type: "button" },
    });
    if (icon) {
      setIcon(button.createSpan({ cls: "db-timeline-nav-icon" }), icon);
    } else {
      button.setText(t(labelKey));
    }
    setTooltip(button, t(labelKey), { delay: 100 });
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    };
  }

  private renderTimelineMiniCalendarButton(controls: HTMLElement, header: HTMLElement, config: ViewConfig): void {
    const button = controls.createEl("button", {
      cls: "db-timeline-nav-button is-icon",
      attr: { type: "button" },
    });
    setIcon(button.createSpan({ cls: "db-timeline-nav-icon" }), "calendar-days");
    setTooltip(button, t("calendar.datePicker"), { delay: 100 });
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.toggleTimelineMiniCalendar(header, config, button);
    };
  }

  /** 导航栏 invalid 事件图标按钮：异步统计后，仅在 count > 0 时显示 ⚠️，点击打开修复弹窗。 */
  private renderTimelineInvalidWarning(parent: HTMLElement, _config: ViewConfig): void {
    if (!this.actions.getTimelineInvalidEventCount || !this.actions.openTimelineInvalidEvents) return;
    const result = this.actions.getTimelineInvalidEventCount();
    // cache miss（Promise）时沿用上一次的计数做即时显示，避免数据刷新时 hide→show 闪现；
    // resolve 后 applyCount 会修正为真实值（count<=0 则移除按钮）。
    const initialCount = typeof result === "number" ? result : this.timelineInvalidWarningCount;
    if (typeof result === "number") this.timelineInvalidWarningCount = result;
    if (typeof result === "number" && result <= 0) return;
    const button = parent.createEl("button", {
      cls: `db-timeline-nav-button is-icon db-timeline-invalid-toggle${initialCount && initialCount > 0 ? "" : " is-hidden"}`,
      attr: { type: "button" },
    });
    setIcon(button.createSpan({ cls: "db-timeline-nav-icon" }), "alert-triangle");
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.openTimelineInvalidEvents?.();
    };
    const applyCount = (count: number): void => {
      this.timelineInvalidWarningCount = count;
      if (!button.isConnected) return;
      if (count <= 0) {
        button.remove();
        return;
      }
      button.removeClass("is-hidden");
      const label = t("timeline.invalidEventsConflictNotice", { count });
      button.setAttr("title", label);
      button.setAttr("aria-label", label);
    };
    if (initialCount && initialCount > 0) applyCount(initialCount);
    if (typeof result === "number") return;
    void result
      .then((count) => applyCount(count))
      .catch(() => {
        if (button.isConnected) button.remove();
      });
  }

  private toggleTimelineMiniCalendar(header: HTMLElement, config: ViewConfig, trigger: HTMLElement): void {
    if (this.miniCalendarEl?.isConnected) {
      this.closeTimelineMiniCalendar();
      return;
    }
    this.closeTimelineMiniCalendar();
    const popover = header.createDiv({ cls: "db-calendar-mini-popover db-timeline-mini-popover" });
    this.miniCalendarEl = popover;
    this.miniCalendarMonth = this.resolveTimelineMiniMonthKey(config);
    this.miniCalendarMode = "day";
    this.renderTimelineMiniMonth(popover, config);

    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      // Exempt the toolbar header (incl. the trigger button) so re-clicking
      // the toggle closes via the click handler, not mousedown-then-reopen.
      if (target && (popover.contains(target) || trigger.contains(target))) return;
      this.closeTimelineMiniCalendar();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      this.closeTimelineMiniCalendar();
    };
    const openTimer = window.setTimeout(() => window.activeDocument.addEventListener("mousedown", onOutside, true), 0);
    window.activeDocument.addEventListener("keydown", onKey, true);
    this.miniCalendarCleanup = () => {
      window.clearTimeout(openTimer);
      window.activeDocument.removeEventListener("mousedown", onOutside, true);
      window.activeDocument.removeEventListener("keydown", onKey, true);
      popover.remove();
      this.miniCalendarEl = null;
      this.miniCalendarMonth = null;
      this.miniCalendarMode = "day";
      this.miniCalendarCleanup = null;
    };
  }

  private closeTimelineMiniCalendar(): void {
    this.miniCalendarCleanup?.();
    this.miniCalendarCleanup = null;
  }

  private renderTimelineMiniMonth(popover: HTMLElement, config: ViewConfig): void {
    const monthKey = this.miniCalendarMonth ?? this.resolveTimelineMiniMonthKey(config);
    const [ys, ms] = monthKey.split("-");
    const year = Number(ys);
    const monthIndex = Number(ms) - 1;

    const weekStartsOn = this.getLocaleWeekStartsOn(config);
    const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config) || "";
    const model = buildCalendarMonthModel(
      this.currentRows,
      {
        ...config,
        calendarStartDateField: startField,
        calendarEndDateField: config.timelineEndDateField || config.calendarEndDateField,
        calendarTitleField: config.timelineTitleField,
        calendarColorField: config.timelineColorField || config.calendarColorField,
      },
      { year, monthIndex },
      { weekStartsOn },
    );
    const todayKey = this.getTodayDateKey();
    const selectedKeys = this.resolveTimelineMiniSelectedKeys(config);
    const eventIndex = buildMiniCalendarEventIndex({
      rows: this.currentRows,
      config,
      startField,
      endField: config.timelineEndDateField || config.calendarEndDateField,
    });
    renderMiniCalendar({
      popover,
      mode: this.miniCalendarMode,
      monthKey,
      monthTitle: this.formatMonthTitle(year, monthIndex),
      visibleYear: year,
      yearRangeStart: this.getMiniCalendarYearRangeStart(year),
      weeks: model.weeks,
      weekdays: this.getWeekdayLabels(weekStartsOn),
      todayKey,
      selectedKeys,
      eventIndex,
      onPrevious: () => this.shiftTimelineMiniCalendarWindow(popover, config, -1),
      onNext: () => this.shiftTimelineMiniCalendarWindow(popover, config, 1),
      onTitleClick: () => this.drillTimelineMiniCalendarUp(popover, config),
      onSelectMonth: (selectedMonthKey) => {
        this.miniCalendarMonth = selectedMonthKey;
        this.miniCalendarMode = "day";
        this.renderTimelineMiniMonth(popover, config);
      },
      onSelectYear: (selectedYear) => {
        this.miniCalendarMonth = `${String(selectedYear).padStart(4, "0")}-01`;
        this.miniCalendarMode = "month";
        this.renderTimelineMiniMonth(popover, config);
      },
      onSelectDate: (dateKey) => this.navigateTimelineViaMini(config, dateKey),
      onSelectToday: (dateKey) => this.jumpTimelineMiniCalendarToToday(popover, config, dateKey),
    });
  }

  private shiftTimelineMiniCalendarWindow(popover: HTMLElement, config: ViewConfig, direction: 1 | -1): void {
    const monthKey = this.miniCalendarMonth ?? this.resolveTimelineMiniMonthKey(config);
    const delta = this.miniCalendarMode === "day" ? direction : this.miniCalendarMode === "month" ? direction * 12 : direction * 144;
    this.miniCalendarMonth = shiftCalendarMonth(monthKey, delta);
    this.renderTimelineMiniMonth(popover, config);
  }

  private drillTimelineMiniCalendarUp(popover: HTMLElement, config: ViewConfig): void {
    if (this.miniCalendarMode === "day") {
      this.miniCalendarMode = "month";
    } else if (this.miniCalendarMode === "month") {
      this.miniCalendarMode = "year";
    }
    this.renderTimelineMiniMonth(popover, config);
  }

  private jumpTimelineMiniCalendarToToday(popover: HTMLElement, config: ViewConfig, dateKey: string): void {
    this.miniCalendarMonth = dateKey.slice(0, 7);
    this.miniCalendarMode = "day";
    this.renderTimelineMiniMonth(popover, config);
  }

  private navigateTimelineViaMini(config: ViewConfig, dateKey: string): void {
    this.requestTimelineDateFlash(dateKey);
    this.updateTimelineAnchor(dateKey, (config.timelineScale || "week") === "day" ? this.getDefaultTimelineStartMinutes(config) : undefined);
    this.closeTimelineMiniCalendar();
  }

  private requestTimelineDateFlash(dateKey: string): void {
    this.pendingFlashDateKey = dateKey;
  }

  private flashTimelineDate(dateKey: string): void {
    const root = this.timelineRoot ?? window.activeDocument;
    // 跳转闪光只在主体泳道叠一列半透明主题色背景条作为落点指示；表头日期数字
    // 不再染色高亮（用户反馈数字染色不美观）。today 实心圆本身常驻 accent 色，
    // 已足够醒目，无需额外 flash。
    const range = this.getTimelineFlashRange(dateKey);
    const overlays: HTMLElement[] = [];
    if (range) {
      const body = root.querySelector<HTMLElement>(".db-timeline-body");
      if (body) {
        const overlay = body.createDiv({
          cls: "db-timeline-body-flash-column is-flash",
          attr: { "data-date-key": dateKey },
        });
        overlay.style.setProperty("--db-timeline-flash-offset", String(range.offsetUnits));
        overlay.style.setProperty("--db-timeline-flash-span", String(range.spanUnits));
        overlays.push(overlay);
      }
    }
    this.flashTimeoutHandle = window.setTimeout(() => {
      this.flashTimeoutHandle = null;
      overlays.forEach((overlay) => overlay.remove());
    }, 1300);
  }

  private getTimelineFlashRange(dateKey: string): { offsetUnits: number; spanUnits: number } | null {
    const windowModel = this.timelineFlashWindow;
    if (!windowModel) return null;
    const dayOffset = dateKeyDaysBetween(windowModel.startDateKey, dateKey);
    if (dayOffset == null) return null;
    if (windowModel.scale === "day") {
      const visibleStart = windowModel.startMinutes ?? 0;
      const visibleEnd = visibleStart + Math.max(1, windowModel.totalUnits) * MINUTES_PER_HOUR;
      const targetStart = dayOffset * MINUTES_PER_DAY;
      const targetEnd = targetStart + MINUTES_PER_DAY;
      const start = Math.max(visibleStart, targetStart);
      const end = Math.min(visibleEnd, targetEnd);
      if (end <= start) return null;
      return {
        offsetUnits: (start - visibleStart) / MINUTES_PER_HOUR,
        spanUnits: Math.max(TIME_SNAP_MINUTES / MINUTES_PER_HOUR, (end - start) / MINUTES_PER_HOUR),
      };
    }
    if (dayOffset < 0 || dayOffset >= windowModel.totalUnits) return null;
    return { offsetUnits: dayOffset, spanUnits: 1 };
  }

  private resolveTimelineMiniMonthKey(config: ViewConfig): string {
    return getTimelineAnchor(config).slice(0, 7);
  }

  private resolveTimelineMiniSelectedKeys(config: ViewConfig): Set<string> {
    return new Set([getTimelineAnchor(config)]);
  }

  private shiftTimeline(config: ViewConfig, scale: TimelineScale, delta: number, model?: { totalUnits: number }, distance: "short" | "long" = "long"): void {
    const anchor = getTimelineAnchor(config);
    const shiftUnits = distance === "short"
      ? getTimelineShortNavigationShiftUnits(scale)
      : getTimelineNavigationShiftUnits(model?.totalUnits || 1);
    if (scale === "day") {
      const shifted = this.shiftTimelineAnchorTime(anchor, this.getTimelineAnchorTimeMinutes(config), delta * shiftUnits * MINUTES_PER_HOUR);
      this.updateTimelineAnchor(shifted.dateKey, shifted.minutes);
      return;
    }
    this.updateTimelineAnchor(addDateKeyDays(anchor, delta * shiftUnits));
  }

  private goToTimelineToday(config: ViewConfig, model?: { totalUnits: number; scale: TimelineScale }): void {
    const today = this.getTodayDateKey();
    this.requestTimelineDateFlash(today);
    if ((config.timelineScale || model?.scale || "week") === "day") {
      // Same centring the model applies to a fresh day window, so the Today button and an
      // initial mount agree on which hours are visible.
      this.updateTimelineAnchor(today, resolveTimelineDayCentredStartMinutes(model?.totalUnits || 1, new Date()));
      return;
    }
    this.updateTimelineAnchor(today);
  }

  private updateTimelineAnchor(dateKey: string, timeMinutes?: number): void {
    this.actions.updateTimelineAnchor?.(dateKey, t("undo.timelineAnchorConfig"), timeMinutes);
  }

  private getTimelineAnchorTimeMinutes(config: ViewConfig): number {
    const value = config.timelineAnchorTimeMinutes;
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.min(MINUTES_PER_DAY - 1, Math.round(value)));
    }
    return this.getDefaultTimelineStartMinutes(config);
  }

  private getDefaultTimelineStartMinutes(config: ViewConfig): number {
    return this.getDayStartHour(config) * MINUTES_PER_HOUR;
  }

  private shiftTimelineAnchorTime(dateKey: string, timeMinutes: number, deltaMinutes: number): { dateKey: string; minutes: number } {
    const total = Math.round(timeMinutes + deltaMinutes);
    const dayOffset = Math.floor(total / MINUTES_PER_DAY);
    return {
      dateKey: addDateKeyDays(dateKey, dayOffset),
      minutes: this.minuteOfDay(total),
    };
  }

  private renderTimelineTitle(parent: HTMLElement, parts: CalendarTitleParts): void {
    const title = parent.createDiv({
      cls: "db-timeline-title",
    });
    setTooltip(title, parts.ariaLabel, { delay: 100 });
    title.createSpan({ cls: "db-timeline-title-main", text: parts.main });
    if (parts.year) title.createSpan({ cls: "db-timeline-title-year", text: parts.year });
  }

  private getDayStartHour(config: ViewConfig): number {
    const value = config.calendarStartHour;
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(23, Math.round(numeric)));
  }

  private dateKeyDaysBetween(startKey: string, endKey: string): number {
    return dateKeyDaysBetween(startKey, endKey) ?? 0;
  }

  private applyCalendarEventColor(button: HTMLElement, color: string | undefined): void {
    if (!color) return;
    button.style.setProperty("--db-calendar-event-accent", `var(--status-color-fg-${color})`);
    button.style.setProperty("--db-calendar-event-bg", `var(--status-color-bg-${color})`);
  }

  /**
   * 方案 B: 在同 lane 内找到离 clientY 最近的（排除自身的）事件，判断插入它之前还是之后。
   * 不限同日期——任意事件都可重排。返回命中目标 path、placeBefore，以及供 reorderTimelineEvent
   * 使用的 before/after path。
   */
  private findTimelineReorderTarget(
    eventsEl: HTMLElement,
    clientY: number,
    draggedPath: string,
    laneEvents: readonly CalendarTimelineEvent[]
  ): { targetPath: string; placeBefore: boolean; beforePath?: string; afterPath?: string } | null {
    const buttons = Array.from(eventsEl.querySelectorAll<HTMLElement>(".db-timeline-event, .db-timeline-window-jump"))
      .filter((btn) => btn.getAttribute("data-note-database-row-path") !== draggedPath);
    if (buttons.length === 0) return null;
    let closest = buttons[0];
    let closestDist = Infinity;
    for (const btn of buttons) {
      const rect = btn.getBoundingClientRect();
      const dist = Math.abs(clientY - (rect.top + rect.height / 2));
      if (dist < closestDist) { closestDist = dist; closest = btn; }
    }
    const rect = closest.getBoundingClientRect();
    const placeBefore = clientY < rect.top + rect.height / 2;
    const targetPath = closest.getAttribute("data-note-database-row-path") || "";
    // 用完整 lane 顺序（含 jump 事件）算 before/after——jump 事件不在 visible DOM，
    // 否则 A 会跨越 jump、不紧贴目标。
    const fullPath = laneEvents.map((event) => event.row.file.path).filter((path) => path !== draggedPath);
    const neighbors = resolveTimelineReorderNeighbors(targetPath, placeBefore, fullPath);
    if (neighbors.beforePath === undefined && neighbors.afterPath === undefined) return null;
    return { targetPath, placeBefore, ...neighbors };
  }

  /** pointer onMove 时刷新重排指示线（is-drop-before / is-drop-after），并返回命中目标供松手复用。 */
  private updateTimelineReorderIndicator(eventsEl: HTMLElement, clientY: number, draggedPath: string, laneEvents: readonly CalendarTimelineEvent[]): { targetPath: string; placeBefore: boolean; beforePath?: string; afterPath?: string } | null {
    // 清除旧的插入线（pointer 模式同一时刻只有一条；清所有 lane 避免同↔跨 lane 切换时残留）。
    this.clearAllTimelineReorderLines();
    const target = this.findTimelineReorderTarget(eventsEl, clientY, draggedPath, laneEvents);
    if (!target) return null;
    const btn = eventsEl.querySelector<HTMLElement>(
      `[data-note-database-row-path="${CSS.escape(target.targetPath)}"]`
    );
    if (btn) {
      // 横跨整行的水平插入线，紧贴目标事件的上边缘（插入其前）或下边缘（插入其后）——
      // 延续旧「卡片边缘 box-shadow」的贴边质感，但跨整行更显眼；无圆点，用细线 + 柔和
      // 发光定位，不阻断。
      const top = target.placeBefore ? btn.offsetTop : btn.offsetTop + btn.offsetHeight;
      const line = eventsEl.createDiv({ cls: "db-timeline-reorder-line" });
      line.style.setProperty("--db-timeline-reorder-line-top", `${top}px`);
    }
    return target;
  }

  /** 清除所有 lane 的 reorder 插入线（pointer 模式同一时刻只有一条）。 */
  private clearAllTimelineReorderLines(): void {
    window.activeDocument.querySelectorAll(".db-timeline-reorder-line").forEach((el) => el.remove());
  }

  /**
   * 垂直拖（同 lane 重排序 / 跨 lane 改分组）统一算插入点：同 lane 用源 laneEvents，
   * 跨 lane 用目标 lane 的 events（从 lanes 按 data-timeline-lane-key 查），指示线画在
   * 目标 eventsEl。未开启手动排序时返回 null（跨 lane 将追加末尾，位置由排序决定）。
   */
  private resolveTimelineReorderTarget(
    sourceEventsEl: HTMLElement,
    targetEventsEl: HTMLElement,
    clientY: number,
    draggedPath: string,
    sourceLaneEvents: readonly CalendarTimelineEvent[],
    lanes: Array<{ key: string; events: readonly CalendarTimelineEvent[] }>,
    config: ViewConfig,
  ): { targetPath: string; placeBefore: boolean; beforePath?: string; afterPath?: string } | null {
    this.clearAllTimelineReorderLines();
    if (!this.canTimelineReorder(config)) return null;
    // 折叠的目标分组没有可见事件，无法精确定位插入点；返回 null 让 moveTimelineEventToGroup 追加末尾。
    if (targetEventsEl.classList.contains("is-collapsed")) return null;
    const isCrossLane = targetEventsEl !== sourceEventsEl;
    const reorderLaneEvents = isCrossLane
      ? (lanes.find((lane) => lane.key === targetEventsEl.dataset.timelineLaneKey)?.events ?? [])
      : sourceLaneEvents;
    if (reorderLaneEvents.length === 0) return null;
    return this.updateTimelineReorderIndicator(targetEventsEl, clientY, draggedPath, reorderLaneEvents);
  }

  private setupTimelineEventDateDrag(
    button: HTMLElement,
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    groupKey: string,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; unit?: TimelineUnit; scale?: TimelineScale },
    laneEvents: CalendarTimelineEvent[],
    lanes: Array<{ key: string; events: readonly CalendarTimelineEvent[] }>,
  ): void {
    if (this.actions.isReadOnly || !this.actions.updateEventDates) return;
    button.addClass("is-draggable");
    button.addEventListener("mousedown", (mouseEvent: MouseEvent) => {
      if (mouseEvent.button !== 0) return;
      // resize 进行中或点中 resize 手柄时不触发 move。
      if (this.timelineResizeInProgress) return;
      if ((mouseEvent.target as HTMLElement | null)?.closest(".db-timeline-resize-handle")) return;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      this.beginTimelineDateDrag(button, eventsEl, config, event, groupKey, model, mouseEvent.clientX, mouseEvent.clientY, laneEvents, lanes);
    });
  }

  private setupTimelineTimedEventPointerDrag(
    button: HTMLElement,
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    groupKey: string,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; unit: TimelineUnit; scale: TimelineScale },
    laneEvents: CalendarTimelineEvent[],
    lanes: Array<{ key: string; events: readonly CalendarTimelineEvent[] }>,
  ): void {
    if (this.actions.isReadOnly || !this.actions.updateEventDates) return;
    button.addClass("is-draggable");
    button.addEventListener("mousedown", (mouseEvent) => {
      if (mouseEvent.button !== 0) return;
      const mode = ((mouseEvent.target as HTMLElement | null)?.closest(".db-timeline-resize-handle") as HTMLElement | null)
        ?.dataset.timelineResizeMode as "resize-start" | "resize-end" | undefined || "move";
      if (mode !== "move" && !(config.timelineEndDateField || config.calendarEndDateField)) return;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      this.beginTimelineTimeDrag(button, eventsEl, config, event, groupKey, model, mode, mouseEvent.clientX, mouseEvent.clientY, laneEvents, lanes);
    });
  }

  private renderTimelineResizeHandle(
    button: HTMLElement,
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; unit: TimelineUnit; scale?: TimelineScale },
    edge: "start" | "end",
    groupKey: string,
  ): void {
    const handle = button.createSpan({
      cls: `db-timeline-resize-handle is-${edge}`,
      attr: {
        title: edge === "start" ? t("calendar.resizeStart") : t("calendar.resizeEnd"),
        "aria-hidden": "true",
        "data-timeline-resize-mode": edge === "start" ? "resize-start" : "resize-end",
      },
    });
    handle.addEventListener("click", (mouseEvent) => {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
    });
    handle.addEventListener("mousedown", (mouseEvent) => {
      if (mouseEvent.button !== 0) return;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      const mode = edge === "start" ? "resize-start" : "resize-end";
      const isDateColumn = this.isTimelineDateColumn(config, event);
      // 按列类型分流：datetime 列在日视图用 timed resize（改分钟）；date 列用按天 resize（改天数）。
      if ((model.unit === "hour" || model.scale === "day") && !isDateColumn) {
        this.beginTimelineTimeDrag(button, eventsEl, config, event, groupKey, { ...model, scale: "day" }, mode, mouseEvent.clientX, mouseEvent.clientY);
      } else {
        this.beginTimelineResize(button, eventsEl, config, event, model, mode, mouseEvent.clientX);
      }
    });
  }

  private beginTimelineTimeDrag(
    button: HTMLElement,
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    groupKey: string,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; unit: TimelineUnit; scale: TimelineScale },
    mode: "move" | "resize-start" | "resize-end",
    startClientX: number,
    startClientY: number,
    laneEvents?: CalendarTimelineEvent[],
    lanes?: Array<{ key: string; events: readonly CalendarTimelineEvent[] }>,
  ): void {
    if (this.actions.isReadOnly || !this.actions.updateEventDates) return;
    const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
    const endField = config.timelineEndDateField || config.calendarEndDateField;
    if (!startField || !(model.startDateKey || event.startDateKey)) return;
    if (mode !== "move" && !endField) return;

    const visible = this.getTimelineVisibleMinutes(config, model);
    // end 上限放宽到当天 +7 天，允许 resize-end 越过 24:00 跨天（如 23:00 → 次日 12:15）。
    const endMax = visible.endMinutes + 7 * MINUTES_PER_DAY;
    const originalRange = resolveEventAbsoluteScale(event, model.startDateKey || event.startDateKey);
    // 用事件真实绝对范围（不夹到 visible）——move 整体平移需基于真实 start，否则窗口外起始的
    // 跨天事件 start 会被夹到 visibleStart，平移后把事件起始日改写成窗口起始日。resize 的边界
    // 夹取由 resolveTimedDragRange 内部 resize 分支自行处理。
    const originalStart = originalRange.start;
    const originalEnd = Math.max(originalStart + TIME_SNAP_MINUTES, originalRange.end);
    let nextStart = originalStart;
    let nextEnd = originalEnd;
    let didDrag = false;
    // 垂直拖同 lane 时的 rank reorder 命中（onMove 设、onUp 用）。
    let lastReorderTarget: { targetPath: string; placeBefore: boolean; beforePath?: string; afterPath?: string } | null = null;
    this.timelineResizeInProgress = mode !== "move";
    button.addClass("is-dragging");
    button.toggleClass("is-moving", mode === "move");
    button.toggleClass("is-resizing", mode !== "move");
    if (mode === "move") eventsEl.addClass("is-drop-target");
    else eventsEl.addClass("is-resize-target");
    let targetEventsEl = eventsEl;

    const unitWidth = this.getTimelineUnitPixelWidth(eventsEl, model.totalUnits);
    const originalExactOffset = button.style.getPropertyValue("--db-timeline-exact-offset");
    const originalExactWidth = button.style.getPropertyValue("--db-timeline-exact-width");
    const wasTimed = button.hasClass("is-timed");
    const metaEl = button.querySelector<HTMLElement>(".db-timeline-event-meta");
    const originalMeta = metaEl?.textContent || "";

    button.addClass("is-timed");
    const restore = (): void => {
      if (originalExactOffset) button.style.setProperty("--db-timeline-exact-offset", originalExactOffset);
      else button.style.removeProperty("--db-timeline-exact-offset");
      if (originalExactWidth) button.style.setProperty("--db-timeline-exact-width", originalExactWidth);
      else button.style.removeProperty("--db-timeline-exact-width");
      if (!wasTimed) button.removeClass("is-timed");
      if (metaEl) metaEl.setText(originalMeta);
    };
    const swallowClick = (clickEvent: MouseEvent): void => {
      clickEvent.stopPropagation();
      clickEvent.preventDefault();
    };
    const computeNext = (clientX: number): { start: number; end: number } => {
      const range = resolveTimedDragRange({
        mode,
        originalStart,
        originalEnd,
        visibleStart: visible.startMinutes,
        visibleEnd: visible.endMinutes,
        deltaMinutes: unitWidth > 0 ? ((clientX - startClientX) / unitWidth) * 60 : 0,
        endMaxMinutes: endMax,
      });
      return { start: range.start, end: range.end };
    };
    const preview = (start: number, end: number): void => {
      nextStart = start;
      nextEnd = end;
      // 夹到可见窗口（与旧 applyTimelineTimedPosition 同口径），再走统一 exact 定位（applyTimelineAbsolutePosition）。
      const previewStart = Math.max(visible.startMinutes, Math.min(visible.endMinutes - TIME_SNAP_MINUTES, start));
      const previewEnd = Math.min(visible.endMinutes, Math.max(previewStart + TIME_SNAP_MINUTES, end));
      this.applyTimelineAbsolutePosition(button, previewStart, previewEnd, visible.startMinutes, model.unit);
      const startDateTime = this.getTimelineDateTimeFromAbsolute(model.startDateKey || event.startDateKey, start);
      const endDateTime = this.getTimelineDateTimeFromAbsolute(model.startDateKey || event.startDateKey, end);
      const label = this.formatTimelineDayTimeRange(startDateTime.dateKey, startDateTime.minutes, endDateTime.dateKey, endDateTime.minutes);
      if (metaEl) metaEl.setText(label);
      this.renderTimelineRangeSnap(eventsEl, button, label, previewStart, visible.startMinutes, model.unit, unitWidth);
    };
    const onMove = (moveEvent: MouseEvent): void => {
      if (!didDrag && (Math.abs(moveEvent.clientX - startClientX) > 3 || Math.abs(moveEvent.clientY - startClientY) > 3)) {
        didDrag = true;
        window.activeDocument.addEventListener("click", swallowClick, true);
      }
      const dx = Math.abs(moveEvent.clientX - startClientX);
      const dy = Math.abs(moveEvent.clientY - startClientY);
      const isVertical = mode === "move" && dy >= dx;
      if (isVertical) {
        // 垂直拖：重排序/跨 lane（不改时间）。preview 保持原位，仅高亮目标 lane。
        preview(originalStart, originalEnd);
        targetEventsEl = this.getTimelineTimedDropTarget(moveEvent.clientX, moveEvent.clientY, eventsEl);
        this.syncTimelineTimedDropTarget(eventsEl, targetEventsEl);
        // 算插入点：同 lane 用源 laneEvents，跨 lane 用目标 lane events（精确插入目标位置）。
        lastReorderTarget = this.resolveTimelineReorderTarget(eventsEl, targetEventsEl, moveEvent.clientY, event.row.file.path, laneEvents ?? [], lanes ?? [], config);
      } else {
        // 水平拖（或 resize）：平移改时间；move 模式清除跨 lane 高亮 + reorder 指示线。
        const next = computeNext(moveEvent.clientX);
        preview(next.start, next.end);
        if (mode === "move") {
          targetEventsEl = eventsEl;
          this.syncTimelineTimedDropTarget(eventsEl, eventsEl);
          this.clearAllTimelineReorderLines();
          lastReorderTarget = null;
        }
      }
    };
    const onUp = (upEvent: MouseEvent): void => {
      window.activeDocument.removeEventListener("mousemove", onMove, true);
      window.activeDocument.removeEventListener("mouseup", onUp, true);
      this.activeTimelineDragCleanup = null;
      if (didDrag) {
        window.setTimeout(() => window.activeDocument.removeEventListener("click", swallowClick, true), 0);
      }
      // 垂直拖（reorder/跨 lane）保持 onMove 设的 originalStart/originalEnd——不要用 computeNext
      // 覆盖，否则垂直拖时的水平分量会改写 nextStart，导致下方 nextStart===originalStart 不成立、
      // 走平移而非 reorder（move 改成整体平移不夹后水平分量不再被吞掉，回归由此暴露）。
      const upDx = Math.abs(upEvent.clientX - startClientX);
      const upDy = Math.abs(upEvent.clientY - startClientY);
      const isVerticalUp = mode === "move" && upDy >= upDx;
      if (!isVerticalUp) {
        const next = computeNext(upEvent.clientX);
        preview(next.start, next.end);
      }
      if (mode === "move") {
        // 仅垂直拖（reorder/跨 lane）才按落点重查目标 lane；水平拖（改时间）固定源 lane，
        // 避免光标垂直漂移到相邻 lane 释放时误改分组（与 date-move 的 isVertical 守卫一致）。
        targetEventsEl = isVerticalUp
          ? this.getTimelineTimedDropTarget(upEvent.clientX, upEvent.clientY, eventsEl)
          : eventsEl;
      }
      button.removeClass("is-dragging", "is-resizing", "is-moving");
      if (mode === "move") this.clearAllTimelineDropTargets();
      else eventsEl.removeClass("is-resize-target");
      button.querySelector(":scope > .db-timeline-snap-marker")?.remove();
      eventsEl.querySelector(":scope > .db-timeline-snap-marker")?.remove();
      this.timelineResizeInProgress = false;
      const targetGroupKey = targetEventsEl.dataset.timelineLaneKey || groupKey;
      const didChangeLane = mode === "move"
        && targetGroupKey !== groupKey
        && this.canMoveTimelineAcrossLane(config)
        && Boolean(config.timelineGroupField);
      if (nextStart === originalStart && nextEnd === originalEnd && !didChangeLane) {
        // 垂直同 lane：rank reorder（如果有命中）。
        if (lastReorderTarget && mode === "move") {
          if (!this.applyTimelineSubtaskOrder(event.row, lastReorderTarget.beforePath, lastReorderTarget.afterPath)) {
            void this.actions.reorderTimelineEvent?.(event.row, lastReorderTarget.beforePath, lastReorderTarget.afterPath);
          }
          return;
        }
        restore();
        return;
      }
      const startDateTime = this.getTimelineDateTimeFromAbsolute(model.startDateKey || event.startDateKey, nextStart);
      const endDateTime = this.getTimelineDateTimeFromAbsolute(model.startDateKey || event.startDateKey, nextEnd);
      if (didChangeLane && config.timelineGroupField) {
        // 跨 lane 拖拽只改分组（垂直意图），不改时间：避免一次拖拽产生「撤销顺序 / 撤销时间」两条记录。
        void this.actions.moveTimelineEventToGroup?.(event.row, config.timelineGroupField, groupKey, targetGroupKey, lastReorderTarget?.beforePath, lastReorderTarget?.afterPath);
        return;
      }
      if (nextStart !== originalStart || nextEnd !== originalEnd) {
        void this.actions.updateEventDates?.(event.row, {
          startField,
          startDateKey: startDateTime.dateKey,
          startTimeMinutes: startDateTime.minutes,
          endField,
          endDateKey: endField ? endDateTime.dateKey : undefined,
          endTimeMinutes: endField ? endDateTime.minutes : undefined,
          changedEdge: mode === "resize-start" ? "start" : mode === "resize-end" ? "end" : "both",
        });
      }
    };

    window.activeDocument.addEventListener("mousemove", onMove, true);
    window.activeDocument.addEventListener("mouseup", onUp, true);
    // 视图卸载中断拖拽时，移除 capture 监听并复位 resize 标志，避免泄漏/锁死后续拖拽。
    this.activeTimelineDragCleanup = () => {
      window.activeDocument.removeEventListener("mousemove", onMove, true);
      window.activeDocument.removeEventListener("mouseup", onUp, true);
      window.activeDocument.removeEventListener("click", swallowClick, true);
      this.timelineResizeInProgress = false;
    };
  }

  private beginTimelineResize(
    button: HTMLElement,
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; unit?: TimelineUnit; scale?: TimelineScale },
    mode: "resize-start" | "resize-end",
    startClientX: number,
  ): void {
    if (this.actions.isReadOnly || !this.actions.updateEventDates) return;
    const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
    const endField = config.timelineEndDateField || config.calendarEndDateField;
    const windowStartKey = model.startDateKey || event.startDateKey;
    const windowEndKey = model.endDateKey || this.getTimelineFallbackEndDateKey(windowStartKey, model.totalUnits);
    if (!startField || !endField || !windowStartKey || !windowEndKey) return;

    this.timelineResizeInProgress = true;
    button.addClass("is-resizing", "is-dragging");
    eventsEl.addClass("is-resize-target");

    const originalStartKey = event.startDateKey;
    const originalEndKey = event.endDateKey;
    // 统一用 resolveEventAbsoluteScale 口径 + applyTimelineAbsolutePosition 定位（与渲染同口径）。
    const unit: TimelineUnit = model.unit ?? (model.scale === "day" ? "hour" : "day");
    const visible = model.scale === "day"
      ? this.getTimelineVisibleMinutes(config, model)
      : { startMinutes: 0, endMinutes: Math.max(1, model.totalUnits) * MINUTES_PER_DAY };
    // 捕获渲染时的 exact 定位，restore 原样恢复。
    const originalExactOffset = button.style.getPropertyValue("--db-timeline-exact-offset");
    const originalExactWidth = button.style.getPropertyValue("--db-timeline-exact-width");
    const unitWidth = this.getTimelineUnitPixelWidth(eventsEl, model.totalUnits);
    let didMove = false;
    let nextStartKey = originalStartKey;
    let nextEndKey = originalEndKey;

    const restore = (): void => {
      if (originalExactOffset) button.style.setProperty("--db-timeline-exact-offset", originalExactOffset);
      else button.style.removeProperty("--db-timeline-exact-offset");
      if (originalExactWidth) button.style.setProperty("--db-timeline-exact-width", originalExactWidth);
      else button.style.removeProperty("--db-timeline-exact-width");
    };
    const swallowClick = (clickEvent: MouseEvent): void => {
      clickEvent.stopPropagation();
      clickEvent.preventDefault();
    };
    const previewRange = (targetKey: string): void => {
      const range = resolveDayRangeResize(originalStartKey, originalEndKey, targetKey, mode);
      nextStartKey = range.startDateKey;
      nextEndKey = range.endDateKey;
      // 用 resolveEventAbsoluteScale 把新日期区间换算成绝对刻度（date 列无 time：start=当日 0:00、
      // end=endDateKey 次日 0:00），再走统一 exact 定位——所见即所得，天数变化会实时反映在宽度上。
      const scale = resolveEventAbsoluteScale(
        { startDateKey: nextStartKey, endDateKey: nextEndKey, startMinutes: undefined, endMinutes: undefined },
        windowStartKey,
      );
      // 夹到可见窗口（与渲染同口径）。
      const renderStart = Math.max(scale.start, visible.startMinutes);
      const renderEnd = Math.min(scale.end, visible.endMinutes);
      this.applyTimelineAbsolutePosition(button, renderStart, renderEnd, visible.startMinutes, unit);
      this.renderTimelineRangeSnap(eventsEl, button, this.formatDateRange(nextStartKey, nextEndKey), renderStart, visible.startMinutes, unit, unitWidth);
    };
    const targetFromX = (clientX: number): string => {
      return this.getTimelineDateFromPoint(eventsEl, clientX, windowStartKey, model.totalUnits, windowEndKey, model.scale);
    };
    const onMove = (moveEvent: MouseEvent): void => {
      if (!didMove && Math.abs(moveEvent.clientX - startClientX) > 3) {
        didMove = true;
        window.activeDocument.addEventListener("click", swallowClick, true);
      }
      previewRange(targetFromX(moveEvent.clientX));
    };
    const onUp = (upEvent: MouseEvent): void => {
      window.activeDocument.removeEventListener("mousemove", onMove, true);
      window.activeDocument.removeEventListener("mouseup", onUp, true);
      this.activeTimelineDragCleanup = null;
      if (didMove) {
        window.setTimeout(() => window.activeDocument.removeEventListener("click", swallowClick, true), 0);
      }
      previewRange(targetFromX(upEvent.clientX));
      button.removeClass("is-resizing", "is-dragging");
      eventsEl.removeClass("is-resize-target");
      button.querySelector(":scope > .db-timeline-snap-marker")?.remove();
      eventsEl.querySelector(":scope > .db-timeline-snap-marker")?.remove();
      this.timelineResizeInProgress = false;
      if (nextStartKey === originalStartKey && nextEndKey === originalEndKey) {
        restore();
        return;
      }
      void this.actions.updateEventDates?.(event.row, resolveAllDayResizeChange({
        mode,
        newStartDateKey: nextStartKey,
        newEndDateKey: nextEndKey,
        startField,
        endField,
        startMinutes: event.startMinutes,
        endMinutes: event.endMinutes,
      }));
    };

    window.activeDocument.addEventListener("mousemove", onMove, true);
    window.activeDocument.addEventListener("mouseup", onUp, true);
    // 视图卸载中断 resize 时，移除 capture 监听并复位 resize 标志，避免泄漏/锁死后续拖拽。
    this.activeTimelineDragCleanup = () => {
      window.activeDocument.removeEventListener("mousemove", onMove, true);
      window.activeDocument.removeEventListener("mouseup", onUp, true);
      window.activeDocument.removeEventListener("click", swallowClick, true);
      this.timelineResizeInProgress = false;
    };
  }

  /**
   * date 列 move 拖拽（pointer，全 scale 通用）：本体沿轨道实时滑动（吸附感）。
   * 统一用 resolveEventAbsoluteScale + applyTimelineAbsolutePosition（与渲染同口径）。
   * 水平为主=按天整体平移改日期（保持 durationDays）；垂直为主=同 lane 重排序或跨 lane 改分组。
   */
  private beginTimelineDateDrag(
    button: HTMLElement,
    eventsEl: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    groupKey: string,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; unit?: TimelineUnit; scale?: TimelineScale },
    startClientX: number,
    startClientY: number,
    laneEvents: CalendarTimelineEvent[],
    lanes: Array<{ key: string; events: readonly CalendarTimelineEvent[] }>,
  ): void {
    if (this.actions.isReadOnly || !this.actions.updateEventDates) return;
    const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
    const endField = config.timelineEndDateField || config.calendarEndDateField;
    const windowStartKey = model.startDateKey || event.startDateKey;
    if (!startField || !windowStartKey) return;

    // 统一绝对刻度（相对 windowStartKey 的分钟，与渲染同口径）。
    const unit: TimelineUnit = model.unit ?? (model.scale === "day" ? "hour" : "day");
    const minutesPerUnit = unit === "hour" ? MINUTES_PER_HOUR : MINUTES_PER_DAY;
    const durationDays = Math.max(1, event.durationDays);
    // 事件真实起始日相对窗口起点的偏移（可为负：事件起点在窗口之前）。onUp 用它 + deltaDays 算
    // 新起始日，避免旧实现「windowStart + 被夹取的 unit 偏移」改写事件真实起始日（QA 问题 6）。
    const originalStartDay = dateKeyDaysBetween(windowStartKey, event.startDateKey) ?? 0;
    const originalStartDateKey = event.startDateKey;
    // 可见窗口（与渲染同一夹取口径）：day scale 用小时范围，其余用整个多天窗口。
    const visible = model.scale === "day"
      ? this.getTimelineVisibleMinutes(config, model)
      : { startMinutes: 0, endMinutes: Math.max(1, model.totalUnits) * MINUTES_PER_DAY };
    const unitWidth = this.getTimelineUnitPixelWidth(eventsEl, model.totalUnits);
    // 一天的像素宽：day scale = unitWidth×24（unit=小时），其余 = unitWidth（unit=天）。
    const pixelsPerDay = unitWidth > 0 ? (unitWidth * MINUTES_PER_DAY) / minutesPerUnit : 0;
    const metaEl = button.querySelector<HTMLElement>(".db-timeline-event-meta");
    const originalMeta = metaEl?.textContent || "";
    // 捕获渲染时的 exact 定位（已夹到可见窗口），restore 原样恢复，避免重算夹取。
    const originalExactOffset = button.style.getPropertyValue("--db-timeline-exact-offset");
    const originalExactWidth = button.style.getPropertyValue("--db-timeline-exact-width");

    let didDrag = false;
    let nextStartDay = originalStartDay;
    // 垂直同 lane reorder 命中（onMove 设、onUp 复用，不用 clientY 重新命中）。
    let lastReorderTarget: { targetPath: string; placeBefore: boolean; beforePath?: string; afterPath?: string } | null = null;
    let targetEventsEl = eventsEl;

    button.addClass("is-dragging", "is-moving");
    eventsEl.addClass("is-drop-target");

    const restore = (): void => {
      if (originalExactOffset) button.style.setProperty("--db-timeline-exact-offset", originalExactOffset);
      else button.style.removeProperty("--db-timeline-exact-offset");
      if (originalExactWidth) button.style.setProperty("--db-timeline-exact-width", originalExactWidth);
      else button.style.removeProperty("--db-timeline-exact-width");
      if (metaEl) metaEl.setText(originalMeta);
    };
    const swallowClick = (clickEvent: MouseEvent): void => {
      clickEvent.stopPropagation();
      clickEvent.preventDefault();
    };
    // 本体滑到 startDay（沿轨道实时滑动=吸附感），并更新 meta 为目标日期范围。
    const preview = (startDay: number): void => {
      nextStartDay = startDay;
      const nextStartScale = startDay * MINUTES_PER_DAY;
      const nextEndScale = nextStartScale + durationDays * MINUTES_PER_DAY;
      // 夹到可见窗口（与渲染同口径），避免拖拽起始时本体从渲染位置跳到未夹取刻度。
      const renderStart = Math.max(nextStartScale, visible.startMinutes);
      const renderEnd = Math.min(nextEndScale, visible.endMinutes);
      this.applyTimelineAbsolutePosition(button, renderStart, renderEnd, visible.startMinutes, unit);
      const nextStartKey = addDateKeyDays(windowStartKey, startDay);
      const nextEndKey = endField ? addDateKeyDays(nextStartKey, durationDays - 1) : nextStartKey;
      const label = this.formatDateRange(nextStartKey, nextEndKey);
      if (metaEl) metaEl.setText(label);
      this.renderTimelineRangeSnap(eventsEl, button, label, renderStart, visible.startMinutes, unit, unitWidth);
    };
    const clearReorderLine = (): void => {
      this.clearAllTimelineReorderLines();
      lastReorderTarget = null;
    };

    const onMove = (moveEvent: MouseEvent): void => {
      if (!didDrag && (Math.abs(moveEvent.clientX - startClientX) > 3 || Math.abs(moveEvent.clientY - startClientY) > 3)) {
        didDrag = true;
        window.activeDocument.addEventListener("click", swallowClick, true);
      }
      const dx = Math.abs(moveEvent.clientX - startClientX);
      const dy = Math.abs(moveEvent.clientY - startClientY);
      if (dy >= dx) {
        // 垂直为主：本体锁原位，高亮目标 lane + 算插入点（同 lane 源 / 跨 lane 目标 lane）。
        preview(originalStartDay);
        targetEventsEl = this.getTimelineTimedDropTarget(moveEvent.clientX, moveEvent.clientY, eventsEl);
        this.syncTimelineTimedDropTarget(eventsEl, targetEventsEl);
        lastReorderTarget = this.resolveTimelineReorderTarget(eventsEl, targetEventsEl, moveEvent.clientY, event.row.file.path, laneEvents, lanes, config);
      } else {
        // 水平为主：本体沿轨道实时滑（按天吸附）。
        const deltaDays = pixelsPerDay > 0 ? Math.round((moveEvent.clientX - startClientX) / pixelsPerDay) : 0;
        preview(originalStartDay + deltaDays);
        targetEventsEl = eventsEl;
        this.syncTimelineTimedDropTarget(eventsEl, eventsEl);
        clearReorderLine();
      }
    };

    const onUp = (upEvent: MouseEvent): void => {
      window.activeDocument.removeEventListener("mousemove", onMove, true);
      window.activeDocument.removeEventListener("mouseup", onUp, true);
      this.activeTimelineDragCleanup = null;
      if (didDrag) {
        window.setTimeout(() => window.activeDocument.removeEventListener("click", swallowClick, true), 0);
      }
      button.removeClass("is-dragging", "is-moving");
      this.clearAllTimelineDropTargets();
      button.querySelector(":scope > .db-timeline-snap-marker")?.remove();
      eventsEl.querySelector(":scope > .db-timeline-snap-marker")?.remove();

      if (!didDrag) {
        restore();
        return;
      }

      const dx = Math.abs(upEvent.clientX - startClientX);
      const dy = Math.abs(upEvent.clientY - startClientY);
      const isVertical = dy >= dx;
      const upTargetEventsEl = isVertical ? this.getTimelineTimedDropTarget(upEvent.clientX, upEvent.clientY, eventsEl) : eventsEl;
      const targetGroupKey = upTargetEventsEl.dataset.timelineLaneKey || groupKey;
      const didChangeLane = isVertical
        && targetGroupKey !== groupKey
        && this.canMoveTimelineAcrossLane(config)
        && Boolean(config.timelineGroupField);

      // 垂直同 lane：rank reorder（复用 mousemove 缓存命中，不用 clientY 重新命中）。
      if (isVertical && !didChangeLane && this.canTimelineReorder(config) && lastReorderTarget) {
        if (!this.applyTimelineSubtaskOrder(event.row, lastReorderTarget.beforePath, lastReorderTarget.afterPath)) {
          void this.actions.reorderTimelineEvent?.(event.row, lastReorderTarget.beforePath, lastReorderTarget.afterPath);
        }
        return;
      }
      // 跨 lane 拖拽只改分组（垂直意图），不改日期：避免一次拖拽同时触发分组移动 + 日期修改，
      // 产生「撤销顺序 / 撤销时间」两条撤销记录。设计上垂直=分组/重排、水平=改日期，互斥。
      if (didChangeLane && config.timelineGroupField) {
        void this.actions.moveTimelineEventToGroup?.(event.row, config.timelineGroupField, groupKey, targetGroupKey, lastReorderTarget?.beforePath, lastReorderTarget?.afterPath);
        return;
      }
      // 水平：改日期（所见即所得，nextStartDay 来自 preview）。
      const nextStartKey = addDateKeyDays(windowStartKey, nextStartDay);
      if (nextStartKey !== originalStartDateKey) {
        const nextEndKey = endField ? addDateKeyDays(nextStartKey, durationDays - 1) : undefined;
        void this.actions.updateEventDates?.(event.row, resolveDayMoveChange({
          startField,
          startDateKey: nextStartKey,
          endField,
          endDateKey: nextEndKey,
          startMinutes: event.startMinutes,
          endMinutes: event.endMinutes,
        }));
      } else {
        restore();
      }
    };

    window.activeDocument.addEventListener("mousemove", onMove, true);
    window.activeDocument.addEventListener("mouseup", onUp, true);
    // 视图卸载中断拖拽时，移除 capture 监听并复位标志，避免泄漏/锁死后续拖拽。
    this.activeTimelineDragCleanup = () => {
      window.activeDocument.removeEventListener("mousemove", onMove, true);
      window.activeDocument.removeEventListener("mouseup", onUp, true);
      window.activeDocument.removeEventListener("click", swallowClick, true);
    };
  }

  private renderTimelineMobileMenuButton(
    button: HTMLElement,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    groupKey: string,
    laneEvents: CalendarTimelineEvent[],
    lanes: Array<{ key: string; label: string; events: CalendarTimelineEvent[] }>
  ): void {
    const menuButton = button.createEl("button", {
      cls: "db-timeline-mobile-menu-button",
      text: "...",
      attr: { type: "button" },
    });
    setTooltip(menuButton, t("mobile.moveCard"), { delay: 100 });
    menuButton.onclick = (mouseEvent) => {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      this.showTimelineMobileMenu(mouseEvent, config, event, groupKey, laneEvents, lanes);
    };
  }

  private showTimelineMobileMenu(
    mouseEvent: MouseEvent,
    config: ViewConfig,
    event: CalendarTimelineEvent,
    groupKey: string,
    laneEvents: CalendarTimelineEvent[],
    lanes: Array<{ key: string; label: string; events: CalendarTimelineEvent[] }>
  ): void {
    const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
    if (!startField) return;
    const endField = config.timelineEndDateField || config.calendarEndDateField;
    const menu = createOwnedMenuForEvent(mouseEvent);
    menu.addRow({ icon: "file-text", label: t("common.open"), onClick: () => this.actions.openRow(event.row) });
    menu.addRow({ icon: "link-2", label: t("timeline.linkStart"), onClick: () => this.startTimelineLinkFromMenu(event.row.file.path) });
    menu.addSeparator();
    menu.addRow({ icon: "calendar-days", label: t("calendar.moveToday"), onClick: () => {
      this.updateEventDateRange(event.row, startField, endField, this.getTodayDateKey(), event.durationDays);
    } });
    menu.addRow({ icon: "arrow-left", label: t("calendar.movePrevDay"), onClick: () => {
      this.updateEventDateRange(event.row, startField, endField, addDateKeyDays(event.startDateKey, -1), event.durationDays);
    } });
    menu.addRow({ icon: "arrow-right", label: t("calendar.moveNextDay"), onClick: () => {
      this.updateEventDateRange(event.row, startField, endField, addDateKeyDays(event.startDateKey, 1), event.durationDays);
    } });
    menu.addRow({ icon: "calendar-plus", label: t("calendar.moveToDate"), onClick: () => {
      this.requestDateKey(event.startDateKey, (dateKey) => {
        this.updateEventDateRange(event.row, startField, endField, dateKey, event.durationDays);
      });
    } });
    if (endField) {
      menu.addRow({ icon: "plus", label: t("calendar.extendOneDay"), onClick: () => {
        void this.actions.updateEventDates?.(event.row, { startField, startDateKey: event.startDateKey, endField, endDateKey: addDateKeyDays(event.endDateKey, 1), changedEdge: "end" });
      } });
      menu.addRow({ icon: "minus", label: t("calendar.shortenOneDay"), disabled: event.durationDays <= 1, onClick: () => {
        void this.actions.updateEventDates?.(event.row, { startField, startDateKey: event.startDateKey, endField, endDateKey: addDateKeyDays(event.endDateKey, -1), changedEdge: "end" });
      } });
    }
    if (this.canTimelineReorder(config)) {
      const paths: string[] = laneEvents.map((candidate) => candidate.row.file.path).filter((path) => path !== event.row.file.path);
      menu.addSeparator();
      menu.addRow({ icon: "chevrons-up", label: t("mobile.moveTop"), disabled: paths.length === 0, onClick: () => {
        if (!this.applyTimelineSubtaskOrder(event.row, undefined, paths[0])) this.actions.reorderTimelineEvent?.(event.row, undefined, paths[0]);
      } });
      menu.addRow({ icon: "chevrons-down", label: t("mobile.moveBottom"), disabled: paths.length === 0, onClick: () => {
        if (!this.applyTimelineSubtaskOrder(event.row, paths[paths.length - 1], undefined)) this.actions.reorderTimelineEvent?.(event.row, paths[paths.length - 1], undefined);
      } });
    }
    if (this.canMoveTimelineAcrossLane(config) && config.timelineGroupField) {
      menu.addSeparator();
      for (const lane of lanes) {
        if (lane.key === groupKey) continue;
        menu.addRow({ icon: "move-right", label: `${t("mobile.moveTo")} ${lane.label}`, onClick: () => {
          const beforePath: string | undefined = lane.events[lane.events.length - 1]?.row.file.path;
          void this.actions.moveTimelineEventToGroup?.(event.row, config.timelineGroupField!, groupKey, lane.key, beforePath, undefined);
        } });
      }
    }
    menu.showAt({ x: mouseEvent.clientX, y: mouseEvent.clientY });
  }

  private getTimelineDateFromPoint(eventsEl: HTMLElement, clientX: number, startDateKey: string, totalUnits: number, endDateKey?: string, scale?: TimelineScale): string {
    const rect = eventsEl.getBoundingClientRect();
    // 日视图（小时网格）：跨天 all-day 事件按天交互——1 天 = eventsEl 全宽，
    // clientX 超出当天范围（拖 resize/移动到相邻天）算 1 天偏移。若沿用下方按小时
    // unit-width 的算法，会把小时 index 当天偏移（拖 1 小时宽度 = 1 天），映射错乱。
    if (scale === "day") {
      const dayWidth = rect.width;
      const rawOffset = dayWidth > 0 ? Math.floor((clientX - rect.left) / dayWidth) : 0;
      return addDateKeyDays(startDateKey, Math.max(0, rawOffset));
    }
    const unitWidth = this.getTimelineUnitPixelWidth(eventsEl, totalUnits);
    const rawOffset = unitWidth > 0 ? Math.floor((clientX - rect.left) / unitWidth) : 0;
    const maxOffset = endDateKey ? Math.max(0, this.dateKeyDaysBetween(startDateKey, endDateKey)) : Math.max(1, totalUnits) - 1;
    const offset = Math.max(0, Math.min(maxOffset, rawOffset));
    return addDateKeyDays(startDateKey, offset);
  }

  private getTimelineCreateTargetFromPoint(
    eventsEl: HTMLElement,
    clientX: number,
    config: ViewConfig,
    model: { startDateKey?: string; endDateKey?: string; startMinutes?: number; totalUnits: number; scale: TimelineScale },
  ): TimelineCreateTarget {
    const startDateKey = model.startDateKey || this.getTodayDateKey();
    if (model.scale !== "day") {
      const rect = eventsEl.getBoundingClientRect();
      const unitWidth = this.getTimelineUnitPixelWidth(eventsEl, model.totalUnits);
      const rawOffset = unitWidth > 0 ? Math.floor((clientX - rect.left) / unitWidth) : 0;
      const offsetUnits = Math.max(0, Math.min(Math.max(1, model.totalUnits) - 1, rawOffset));
      const spanUnits = Math.max(1, Math.min(this.getTimelineCreateSpanUnits(model), model.totalUnits - offsetUnits));
      const dateKey = addDateKeyDays(startDateKey, offsetUnits);
      return {
        dateKey,
        options: spanUnits > 1 ? { endDateKey: addDateKeyDays(dateKey, spanUnits - 1) } : {},
        offsetUnits,
        spanUnits,
        totalUnits: model.totalUnits,
      };
    }
    const rect = eventsEl.getBoundingClientRect();
    const visible = this.getTimelineVisibleMinutes(config, model);
    const unitWidth = this.getTimelineUnitPixelWidth(eventsEl, model.totalUnits);
    const rawMinutes = unitWidth > 0
      ? visible.startMinutes + ((clientX - rect.left) / unitWidth) * 60
      : visible.startMinutes;
    const startTimeMinutes = Math.max(
      visible.startMinutes,
      Math.min(visible.endMinutes - TIME_SNAP_MINUTES, this.snapTimelineMinutes(rawMinutes)),
    );
    const endTimeMinutes = Math.min(visible.endMinutes, startTimeMinutes + 60);
    const startDateTime = this.getTimelineDateTimeFromAbsolute(startDateKey, startTimeMinutes);
    const endDateTime = this.getTimelineDateTimeFromAbsolute(startDateKey, Math.max(startTimeMinutes + TIME_SNAP_MINUTES, endTimeMinutes));
    return {
      dateKey: startDateTime.dateKey,
      options: {
        startTimeMinutes: startDateTime.minutes,
        endTimeMinutes: endDateTime.minutes,
        ...(endDateTime.dateKey !== startDateTime.dateKey ? { endDateKey: endDateTime.dateKey } : {}),
      },
      offsetUnits: (startTimeMinutes - visible.startMinutes) / 60,
      spanUnits: Math.max(TIME_SNAP_MINUTES / 60, (Math.max(startTimeMinutes + TIME_SNAP_MINUTES, endTimeMinutes) - startTimeMinutes) / 60),
      totalUnits: model.totalUnits,
    };
  }

  private getTimelineCreateSpanUnits(model: { totalUnits: number; scale: TimelineScale }): number {
    if (model.scale === "quarter") return Math.min(7, Math.max(1, model.totalUnits));
    if (model.scale === "year") return Math.min(30, Math.max(1, model.totalUnits));
    return 1;
  }

  private getTimelineSlotDuration(config: ViewConfig): 15 | 30 | 60 {
    return getCalendarSlotDuration(config);
  }

  private getTimelineRenderUnitWidth(config: ViewConfig, scale: TimelineScale, viewportWidth?: number): number {
    return resolveTimelineUnitWidth(config, scale, viewportWidth);
  }

  private getTimelineViewportUnitCount(container: HTMLElement, config: ViewConfig, unitWidth: number): number | undefined {
    const rect = container.getBoundingClientRect();
    const style = window.getComputedStyle(container);
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(style.paddingRight) || 0;
    const width = getTimelineViewportContentWidth(rect.width || container.clientWidth || 0, paddingLeft, paddingRight);
    return resolveTimelineViewportUnitCount(width, unitWidth, config.timelineScale || "week");
  }

  private getTimelineViewportUnitSpan(container: HTMLElement, unitWidth: number): number | undefined {
    const rect = container.getBoundingClientRect();
    const style = window.getComputedStyle(container);
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(style.paddingRight) || 0;
    const width = getTimelineViewportContentWidth(rect.width || container.clientWidth || 0, paddingLeft, paddingRight);
    return resolveTimelineViewportUnitSpan(width, unitWidth);
  }

  private observeTimelineViewport(container: HTMLElement, config: ViewConfig, rows: RowData[]): void {
    const ResizeObserverCtor = container.ownerDocument.defaultView?.ResizeObserver || window.ResizeObserver;
    if (!ResizeObserverCtor) return;
    const unitWidth = this.getTimelineRenderUnitWidth(config, config.timelineScale || "week", container.clientWidth || container.getBoundingClientRect().width || 0);
    this.timelineResizeObserver = new ResizeObserverCtor(() => {
      if (!this.timelineRoot?.isConnected) {
        this.disconnectTimelineResizeObserver();
        return;
      }
      const nextUnitCount = this.getTimelineViewportUnitCount(container, config, unitWidth);
      const nextUnitSpan = this.getTimelineViewportUnitSpan(container, unitWidth);
      if (nextUnitCount !== this.timelineObservedUnitCount || this.hasTimelineViewportUnitSpanChanged(nextUnitSpan)) {
        const leftAnchor = this.getTimelineViewportLeftAnchor(config, nextUnitCount);
        const renderConfig = leftAnchor
          ? { ...config, timelineAnchor: leftAnchor.dateKey, ...(leftAnchor.timeMinutes != null ? { timelineAnchorTimeMinutes: leftAnchor.timeMinutes } : {}) }
          : config;
        const previousScrollTop = container.scrollTop;
        const previousScrollLeft = container.scrollLeft;
        this.renderTimeline(container, renderConfig, rows);
        container.scrollTop = previousScrollTop;
        container.scrollLeft = previousScrollLeft;
      }
    });
    this.timelineResizeObserver.observe(container);
  }

  private hasTimelineViewportUnitSpanChanged(nextUnitSpan: number | undefined): boolean {
    if (this.timelineObservedUnitSpan == null || nextUnitSpan == null) return this.timelineObservedUnitSpan !== nextUnitSpan;
    return Math.abs(this.timelineObservedUnitSpan - nextUnitSpan) >= 0.01;
  }

  private disconnectTimelineResizeObserver(): void {
    this.timelineResizeObserver?.disconnect();
    this.timelineResizeObserver = null;
  }

  private getTimelineViewportLeftAnchor(config: ViewConfig, visibleUnitCount: number | undefined): { dateKey: string; timeMinutes?: number } | null {
    const renderedWindow = this.timelineFlashWindow;
    if (!renderedWindow?.startDateKey || visibleUnitCount == null) return null;
    return getTimelineViewportStartAnchor(config, renderedWindow.startDateKey, visibleUnitCount, renderedWindow.startMinutes);
  }

  private formatTimelineUnitValue(value: number): string {
    if (!Number.isFinite(value)) return "1";
    return String(Math.round(value * 1000) / 1000);
  }

  private getTimelineUnitPixelWidth(eventsEl: HTMLElement, totalUnits: number): number {
    const raw = window.getComputedStyle(eventsEl).getPropertyValue("--db-timeline-unit-width").trim();
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const rect = eventsEl.getBoundingClientRect();
    return rect.width > 0 ? rect.width / Math.max(1, totalUnits) : 0;
  }

  private getTimelineVisibleMinutes(
    config: ViewConfig,
    model?: { startDateKey?: string; startMinutes?: number; totalUnits: number; scale?: TimelineScale },
  ): { startMinutes: number; endMinutes: number } {
    if (model?.scale === "day" && typeof model.startMinutes === "number" && Number.isFinite(model.startMinutes)) {
      const startMinutes = model.startMinutes;
      return { startMinutes, endMinutes: startMinutes + Math.max(1, model.totalUnits) * MINUTES_PER_HOUR };
    }
    const startHour = this.getDayStartHour(config);
    const rawEnd = this.getDayEndHour(config);
    const endHour = rawEnd <= startHour ? Math.min(24, startHour + 1) : rawEnd;
    return { startMinutes: startHour * MINUTES_PER_HOUR, endMinutes: endHour * MINUTES_PER_HOUR };
  }

  private getDayEndHour(config: ViewConfig): number {
    const value = config.calendarEndHour;
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numeric)) return 24;
    return Math.max(1, Math.min(24, Math.round(numeric)));
  }

  private snapTimelineMinutes(minutes: number): number {
    return snapMinutes(minutes);
  }

  private getTimelineDateTimeFromAbsolute(startDateKey: string, absoluteMinutes: number): { dateKey: string; minutes: number } {
    const rounded = this.snapTimelineMinutes(absoluteMinutes);
    const dayOffset = Math.floor(rounded / MINUTES_PER_DAY);
    return {
      dateKey: addDateKeyDays(startDateKey, dayOffset),
      minutes: this.minuteOfDay(rounded),
    };
  }

  private minuteOfDay(minutes: number): number {
    return minuteOfDay(minutes);
  }

  private getTimelineFallbackEndDateKey(startDateKey: string, totalUnits: number): string {
    return addDateKeyDays(startDateKey, Math.max(1, totalUnits) - 1);
  }

  private renderTimelineRangeSnap(
    eventsEl: HTMLElement,
    button: HTMLElement,
    label: string,
    renderStart: number,
    visibleStart: number,
    unit: TimelineUnit,
    unitWidth: number,
  ): void {
    const minutesPerUnit = unit === "hour" ? MINUTES_PER_HOUR : MINUTES_PER_DAY;
    this.renderTimelineSnap(eventsEl, label, {
      variant: "timed-range",
      leftPx: ((renderStart - visibleStart) / minutesPerUnit) * unitWidth,
      topPx: Math.max(4, button.offsetTop + button.offsetHeight + 2),
      widthPx: this.getTimelineSnapPreviewWidth(label),
    });
  }

  private getTimelineSnapPreviewWidth(label: string): number {
    const textWidth = Array.from(label).reduce((total, char) => {
      if (/\s/.test(char)) return total + 4;
      if (/[\u3000-\u9fff]/.test(char)) return total + 12;
      return total + 7;
    }, 18);
    return Math.max(220, Math.min(420, Math.ceil(textWidth)));
  }

  private renderTimelineSnap(
    eventsEl: HTMLElement,
    dateKey: string,
    options?: { variant?: "timed-range"; leftPx?: number; topPx?: number; widthPx?: number },
  ): void {
    let snap = eventsEl.querySelector<HTMLElement>(":scope > .db-timeline-snap-marker");
    if (!snap) snap = eventsEl.createDiv({ cls: "db-timeline-snap-marker" });
    snap.toggleClass("is-timed-range", options?.variant === "timed-range");
    const snapWidth = Number.isFinite(options?.widthPx) ? Math.max(96, options!.widthPx!) : 0;
    if (Number.isFinite(options?.leftPx)) {
      const laneWidth = eventsEl.clientWidth || eventsEl.getBoundingClientRect().width || 0;
      const maxLeft = Math.max(8, laneWidth - snapWidth - 8);
      const left = laneWidth > 0 ? Math.min(maxLeft, Math.max(8, options!.leftPx!)) : Math.max(8, options!.leftPx!);
      snap.style.setProperty("--db-timeline-snap-left", `${left}px`);
    } else {
      snap.style.removeProperty("--db-timeline-snap-left");
    }
    if (snapWidth > 0) snap.style.setProperty("--db-timeline-snap-width", `${snapWidth}px`);
    else snap.style.removeProperty("--db-timeline-snap-width");
    if (Number.isFinite(options?.topPx)) snap.style.setProperty("--db-timeline-snap-top", `${Math.max(0, options!.topPx!)}px`);
    else snap.style.removeProperty("--db-timeline-snap-top");
    snap.setText(dateKey);
  }

  private getTimelineTimedDropTarget(clientX: number, clientY: number, fallbackEventsEl: HTMLElement): HTMLElement {
    const hit = window.activeDocument.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const directLane = hit?.closest<HTMLElement>(".db-timeline-events");
    if (directLane?.dataset.timelineLaneKey) return directLane;
    const group = hit?.closest<HTMLElement>(".db-timeline-group");
    const groupLane = group?.querySelector<HTMLElement>(":scope > .db-timeline-events");
    if (groupLane?.dataset.timelineLaneKey) return groupLane;
    // 折叠分组无 .db-timeline-events 子元素，但 group 自身带 data-timeline-lane-key：
    // 返回 group 让跨组移动命中折叠分组（精确插入由 resolveTimelineReorderTarget 对折叠态返回 null → 追加）。
    if (group?.dataset.timelineLaneKey) return group;
    return fallbackEventsEl;
  }

  private syncTimelineTimedDropTarget(sourceEventsEl: HTMLElement, targetEventsEl: HTMLElement): void {
    const timeline = sourceEventsEl.closest<HTMLElement>(".db-timeline") || window.activeDocument;
    // 同时清理 events 和折叠分组上的高亮（折叠分组无 .db-timeline-events，高亮挂在 group 上）。
    timeline.querySelectorAll<HTMLElement>(".db-timeline-events.is-drop-target, .db-timeline-group.is-drop-target").forEach((el) => {
      el.removeClass("is-drop-target");
    });
    targetEventsEl.addClass("is-drop-target");
  }

  private clearAllTimelineDropTargets(): void {
    window.activeDocument.querySelectorAll(".db-timeline-events.is-drop-target, .db-timeline-group.is-drop-target").forEach((el) => {
      el.removeClass("is-drop-target");
      el.querySelector(":scope > .db-timeline-snap-marker")?.remove();
      el.querySelector(":scope > .db-timeline-reorder-line")?.remove();
    });
  }

  private canTimelineReorder(config: ViewConfig): boolean {
    if (!this.actions.reorderTimelineEvent) return false;
    if (config.timelineGroupField?.startsWith("file.")) return false;
    return !isExplicitlySorted(config);
  }

  private applyTimelineSubtaskOrder(row: RowData, beforePath?: string, afterPath?: string): boolean {
    if (!this.actions.moveSubtask) return false;
    const node = this.subtaskRelation?.nodes.get(row.file.path);
    if (!node || node.parentId === null || node.orphanParent) return false;
    const request: SubtaskMoveRequest = {
      childPath: row.file.path,
      newParentPath: node.parentId,
      beforePath,
      afterPath,
    };
    const plan = this.planTimelineSubtaskMove(request);
    if (!plan) return false;
    try {
      const result = this.actions.moveSubtask(request, plan);
      if (result) void Promise.resolve(result).catch(() => new Notice(t("subtask.moveSaveFailed")));
    } catch {
      new Notice(t("subtask.moveSaveFailed"));
    }
    return true;
  }

  private planTimelineSubtaskMove(request: SubtaskMoveRequest): Extract<SubtaskMovePlan, { ok: true }> | null {
    const plan = planSubtaskMove([...this.rowByPath.values()], request);
    return plan.ok ? plan : null;
  }

  private canMoveTimelineAcrossLane(config: ViewConfig): boolean {
    if (!this.actions.moveTimelineEventToGroup || !config.timelineGroupField) return false;
    const col = config.schema.columns.find((candidate) => candidate.key === config.timelineGroupField);
    if (!col || col.type === "computed" || col.type === "rollup" || col.key.startsWith("file.")) return false;
    return col.type !== "multi-select";
  }

  private updateEventDateRange(row: RowData, startField: string, endField: string | undefined, startDateKey: string, durationDays: number): void {
    void this.actions.updateEventDates?.(row, {
      startField,
      startDateKey,
      endField,
      endDateKey: endField ? addDateKeyDays(startDateKey, Math.max(1, durationDays) - 1) : undefined,
    });
  }

  private requestDateKey(defaultDateKey: string, onSelect: (dateKey: string) => void): void {
    const input = window.activeDocument.createElement("input");
    input.type = "date";
    input.value = defaultDateKey;
    input.setAttribute("aria-label", t("calendar.moveToDate"));
    input.addClass("db-hidden-date-input");
    const remove = () => window.setTimeout(() => input.remove(), 0);
    input.onchange = () => {
      const value = input.value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(value) && parseDateKeyToUtc(value)) onSelect(value);
      remove();
    };
    input.onblur = remove;
    window.activeDocument.body.appendChild(input);
    input.focus();
    if (typeof input.showPicker === "function") input.showPicker();
    else input.click();
  }

  private renderEmpty(container: HTMLElement, reason: EmptyStateReason): void {
    this.emptyStateRenderer.renderCard(container, {
      reason,
      actions: this.actions.openDateConfig ? [{
        label: t("emptyState.selectDateProperty"),
        icon: "settings-2",
        primary: true,
        onClick: () => this.actions.openDateConfig?.(),
      }] : undefined,
    });
  }

  private renderTimelineEmptyRange(container: HTMLElement): void {
    this.emptyStateRenderer.renderCard(container, {
      reason: "no-events-in-range",
      className: "db-timeline-empty-range",
      actions: this.actions.openDateConfig ? [{
        label: t("emptyState.selectDateProperty"),
        icon: "settings-2",
        primary: true,
        onClick: () => this.actions.openDateConfig?.(),
      }] : undefined,
    });
  }

  private formatDateRange(start: string, end: string): string {
    return formatDateRangeDisplay(start, end, { contextYear: parseDateTimeParts(start)?.year });
  }

  private formatTimelineEventMeta(event: CalendarTimelineEvent, scale: TimelineScale, config: ViewConfig): string {
    if (scale === "day" && !this.isTimelineDateColumn(config, event) && event.startMinutes != null && event.endMinutes != null) {
      return this.formatTimelineDayTimeRange(event.startDateKey, event.startMinutes, event.endDateKey, event.endMinutes);
    }
    return this.formatDateRange(event.startDateKey, event.endDateKey);
  }

  private formatTimelineDayTimeRange(startDateKey: string, startMinutes: number, endDateKey: string, endMinutes: number): string {
    const contextYear = parseDateTimeParts(startDateKey)?.year;
    const startDate = formatDateValueDisplay(startDateKey, { contextYear });
    const start = `${startDate} ${formatCalendarTime(startMinutes)}`;
    const endTime = formatCalendarTime(endMinutes);
    const end = startDateKey === endDateKey
      ? endTime
      : `${formatDateValueDisplay(endDateKey, { contextYear })} ${endTime}`;
    return `${start} - ${end}`;
  }

  private isCurrentTimelineTick(tick: { dateKey: string; label: string }, model: { scale: TimelineScale }, now = new Date()): boolean {
    if (model.scale !== "day") return false;
    const todayKey = this.getTodayDateKey(now);
    if (tick.dateKey !== todayKey) return false;
    return Number.parseInt(tick.label, 10) === now.getHours();
  }

  private isCurrentTimelineDateTick(tick: { dateKey: string }, model: { scale: TimelineScale }, now = new Date()): boolean {
    return model.scale !== "day" && tick.dateKey === this.getTodayDateKey(now);
  }

  private getTodayDateKey(date = new Date()): string {
    return getLocalDateKey(date);
  }

  private parseDateKey(dateKey: string): Date | null {
    return parseDateKeyToUtc(dateKey);
  }

  private formatMonthTitle(year: number, monthIndex: number): string {
    return new Intl.DateTimeFormat(getEffectiveLocale(), { month: "long", year: "numeric" }).format(new Date(year, monthIndex, 1));
  }

  private getMiniCalendarYearRangeStart(year: number): number {
    return Math.floor(year / 12) * 12;
  }

  private getWeekdayLabels(weekStartsOn: number): string[] {
    return getWeekdayLabels(getEffectiveLocale(), weekStartsOn);
  }

  private getLocaleWeekStartsOn(config?: ViewConfig): number {
    return getLocaleWeekStartsOn(config);
  }
}
