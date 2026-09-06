// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-date
// COMPONENT: the date/datetime inline editor, extracted behind CellRenderer.startEdit
// ───────────────────────────────────────────────────────────────────
//
// Body moved unchanged from `CellRenderer.editDatePopover`: the segmented year/month/day
// (and hour/minute) inputs, the mobile inline-dock branch, and the mini calendar picker are the
// same code that shipped before this extraction. `CellRenderer.editDatePopover` is a one-line
// wrapper over `openDateEditor` below.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { Notice, setIcon } from "obsidian";
import { getLocaleWeekStartsOn, getLocalDateKey, getWeekdayLabels, parseDateKeyToUtc } from "../../data/calendar-date-time";
import { shouldCommitEmptyBulkDateClear } from "../../data/bulk-edit";
import { getDateEndFieldKey } from "../../data/column-types";
import { parseDateTimeParts } from "../../data/date-time-format";
import { isImeComposing } from "../../data/keyboard-utils";
import { safeString } from "../../data/safe-string";
import { isTouchDevice } from "../../data/touch-environment";
import { ColumnDef, RowData } from "../../data/types";
import { getEffectiveLocale, t } from "../../i18n";
import { MiniCalendarEventIndex, MiniCalendarMode, renderMiniCalendar } from "../calendar-mini-calendar-renderer";
import { buildDatePickerWeeks, formatDatePickerMonthTitle, getDatePickerYearRangeStart, shiftDatePickerMonth } from "../date-picker-model";
import { isHTMLElement } from "../dom-guards";
import { clamp, getVisiblePopoverBounds, resolveAnchoredPopoverTop, setPosition } from "../popover-position";
import type { TableCellNavigationIntent } from "../../data/table-keyboard-navigation";
import { bulkAnchorRect, renderDraftFailure, showValidationError, type CellEditorContext, type CellEditSession } from "./cell-editor-shared";

// ───────────────────────────────────────────────────────────────────
// 2. POSITIONING
// ───────────────────────────────────────────────────────────────────

function positionDateEditPopover(popover: HTMLElement, td: HTMLElement, container: HTMLElement | null, session?: CellEditSession): void {
  const margin = 8;
  const popoverRect = popover.getBoundingClientRect();
  const bounds = getVisiblePopoverBounds(container);
  const width = Math.max(popoverRect.width || 170, 170);
  const height = popoverRect.height || 36;
  const a = bulkAnchorRect(session);
  const rect = a ?? td.getBoundingClientRect();
  const left = clamp(rect.left, bounds.left + margin, bounds.right - width - margin);
  let top: number;
  if (a) {
    top = resolveAnchoredPopoverTop(a, bounds, height, 4, margin).top;
  } else {
    const below = bounds.bottom - rect.top - margin;
    const above = rect.bottom - bounds.top - margin;
    const useAbove = above > below && below < height;
    top = useAbove ? rect.bottom - height : rect.top;
    top = clamp(top, bounds.top + margin, bounds.bottom - height - margin);
  }

  popover.setCssProps({ width: `${width}px` });
  setPosition(
    popover,
    left,
    top,
    container?.getBoundingClientRect(),
    container?.scrollLeft || 0,
    container?.scrollTop || 0
  );
}

// ───────────────────────────────────────────────────────────────────
// 3. THE EDITOR
// ───────────────────────────────────────────────────────────────────

/** Opens the date/datetime editor. Moved unchanged from `CellRenderer.editDatePopover`. */
export function openDateEditor(
  ctx: CellEditorContext,
  td: HTMLElement,
  row: RowData,
  col: ColumnDef,
  currentValue: unknown,
  includeTime = false,
  session?: CellEditSession,
  initialDraft?: string,
): void {
  const rawContainer = td.closest(".note-database-container");
  const container = isHTMLElement(rawContainer) ? rawContainer : null;
  const isMobile = isTouchDevice(container || td);
  const host = isMobile ? null : (container || window.activeDocument.body);

  ctx.getActiveTextEditClose()?.();
  td.addClass("db-cell-editing");

  const isMixed = !!session?.mixed;
  const dateParts = isMixed ? null : parseDateTimeParts(currentValue);
  const fallbackParts = isMixed ? [] : safeString(currentValue).substring(0, 10).split("-");
  const initYear = initialDraft ?? (dateParts ? String(dateParts.year) : fallbackParts[0] || "");
  const initMonth = initialDraft ? "" : dateParts?.month || fallbackParts[1] || "";
  const initDay = initialDraft ? "" : dateParts?.day || fallbackParts[2] || "";
  const initTime = initialDraft ? "" : dateParts?.time || "";
  const initHour = initTime.slice(0, 2);
  const initMinute = initTime.slice(3, 5);
  const rawInitialDateKey = dateParts?.dateKey || safeString(currentValue).substring(0, 10);
  const initialDateKey = parseDateKeyToUtc(rawInitialDateKey) ? rawInitialDateKey : getLocalDateKey();
  let pickerMonthKey = initialDateKey.slice(0, 7);
  let pickerMode: MiniCalendarMode = "day";

  let popover: HTMLElement;
  let closeBtn: HTMLButtonElement | undefined;
  let editScrollContainer: HTMLElement | null = null;
  let removeMobileViewportListeners = () => undefined;

  if (isMobile) {
    editScrollContainer = td.closest(".note-database-container")
      || td.closest(".markdown-preview-view")
      || window.activeDocument.body;

    popover = editScrollContainer.createDiv({ cls: "db-cell-edit-popover is-mobile is-inline-overlay db-date-edit-popover" });

    const containerRect = editScrollContainer.getBoundingClientRect();
    const tdRect = bulkAnchorRect(session) ?? td.getBoundingClientRect();
    const scrollTop = editScrollContainer.scrollTop || 0;
    const relativeTop = tdRect.top - containerRect.top + scrollTop;

    popover.setCssProps({ position: "absolute", left: "0", right: "0", top: `${relativeTop + tdRect.height + 2}px`, "z-index": "var(--db-layer-popover, 100)" });

    closeBtn = popover.createEl("button", {
      cls: "db-cell-edit-close",
      attr: { type: "button", title: t("common.cancel"), "aria-label": t("common.cancel") },
    });
    setIcon(closeBtn, "x");
  } else {
    popover = (host as HTMLElement).createDiv({ cls: "db-cell-edit-popover db-date-edit-popover" });
  }
  if (includeTime) popover.addClass("is-datetime");
  popover.dataset.noteDatabaseRowPath = row.file.path;
  popover.dataset.noteDatabaseColumnKey = col.key;
  popover.dataset.noteDatabaseEditorKind = "date";

  const segments = popover.createDiv({ cls: "db-date-segments" });
  const yearInp = segments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "4", placeholder: "YYYY" } });
  segments.createSpan({ cls: "db-date-sep", text: "-" });
  const monthInp = segments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "MM" } });
  segments.createSpan({ cls: "db-date-sep", text: "-" });
  const dayInp = segments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "DD" } });
  let hourInp: HTMLInputElement | undefined;
  let minuteInp: HTMLInputElement | undefined;
  if (includeTime) {
    segments.createSpan({ cls: "db-date-sep db-time-sep", text: " " });
    hourInp = segments.createEl("input", { cls: "db-date-seg db-time-seg db-hour-seg", attr: { maxlength: "2", placeholder: "HH" } });
    segments.createSpan({ cls: "db-date-sep db-time-colon", text: ":" });
    const minutePlaceholder = "m" + "m";
    minuteInp = segments.createEl("input", { cls: "db-date-seg db-time-seg db-minute-seg", attr: { maxlength: "2", placeholder: minutePlaceholder } });
  }

  // The End date row. Bulk (session) edits keep the single-date form only — a range across a
  // batch of mixed rows is a heavier feature than this row asks for, and the value stays exactly
  // what a bulk edit sets today. Stored under a derived companion key (getDateEndFieldKey) rather
  // than reshaping the column's own value, so an existing single date is untouched by upgrade.
  const includeEndRow = !session;
  const endKey = includeEndRow ? getDateEndFieldKey(col) : "";
  let endYearInp: HTMLInputElement | undefined;
  let endMonthInp: HTMLInputElement | undefined;
  let endDayInp: HTMLInputElement | undefined;
  if (includeEndRow) {
    const rawEndValue = row.frontmatter[endKey];
    const endParts = parseDateTimeParts(rawEndValue);
    const endFallbackParts = safeString(rawEndValue).substring(0, 10).split("-");
    const endRow = popover.createDiv({ cls: "db-date-end-row" });
    endRow.createSpan({ cls: "db-date-end-label", text: t("date.endDate") });
    const endSegments = endRow.createDiv({ cls: "db-date-segments" });
    endYearInp = endSegments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "4", placeholder: "YYYY" } });
    endSegments.createSpan({ cls: "db-date-sep", text: "-" });
    endMonthInp = endSegments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "MM" } });
    endSegments.createSpan({ cls: "db-date-sep", text: "-" });
    endDayInp = endSegments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "DD" } });
    endYearInp.value = endParts ? String(endParts.year) : (endFallbackParts[0] || "");
    endMonthInp.value = endParts?.month || endFallbackParts[1] || "";
    endDayInp.value = endParts?.day || endFallbackParts[2] || "";
    endRow.createDiv({ cls: "db-date-end-hint", text: t("date.endBeforeStartHint") });
  }

  const inputs = [yearInp, monthInp, dayInp, hourInp, minuteInp].filter((input): input is HTMLInputElement => Boolean(input));
  let committed = false;

  const pad2 = (v: string) => v.length === 1 ? `0${v}` : v;
  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInMonth = (y: number, m: number) => {
    if (m === 2) return isLeapYear(y) ? 29 : 28;
    if ([4, 6, 9, 11].includes(m)) return 30;
    return 31;
  };

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    removeMobileViewportListeners();
    popover.remove();
    td.removeClass("db-cell-editing");
    window.activeDocument.removeEventListener("mousedown", onOutside, true);
    window.activeDocument.removeEventListener("keydown", onDocumentKeydown, true);
    if (ctx.getActiveTextEditClose() === close) ctx.setActiveTextEditClose(undefined);
    if (ctx.getActiveInlineEditorCancel() === cancel) ctx.setActiveInlineEditorCancel(undefined);
    session?.onClose?.();
  };
  ctx.setActiveTextEditClose(close);

  // Written through the raw data source rather than ctx.commitEditedValue: the end value lives
  // under its own companion key, not this column's, and the low-level frontmatter patch is exactly
  // what a second key needs — no computed-field sync or column-specific save hook is relevant to
  // a key no schema column names. Returns false only on a validation failure the caller must stop
  // the whole commit for; a successful (or skipped, unchanged) write returns true.
  const commitEndValue = async (): Promise<boolean> => {
    if (!includeEndRow || !endYearInp || !endMonthInp || !endDayInp) return true;
    const ey = endYearInp.value;
    const em = endMonthInp.value;
    const ed = endDayInp.value;
    if (!ey && !em && !ed) {
      if (row.frontmatter[endKey] != null) {
        await ctx.dataSource.updateFrontmatter(row.file, { [endKey]: null });
      }
      return true;
    }
    if (!ey || !em || !ed) {
      const focus = !ey ? endYearInp : !em ? endMonthInp : endDayInp;
      showValidationError(focus, t("validation.invalidDate"));
      focus.focus();
      return false;
    }
    const eyN = parseInt(ey, 10);
    const emN = parseInt(em, 10);
    const edN = parseInt(ed, 10);
    if (isNaN(eyN) || isNaN(emN) || isNaN(edN)) {
      showValidationError(endYearInp, t("validation.invalidDate"));
      endYearInp.focus();
      return false;
    }
    const clampedEm = Math.min(Math.max(emN, 1), 12);
    const clampedEd = Math.min(Math.max(edN, 1), daysInMonth(eyN, clampedEm));
    const endDateKey = `${ey}-${pad2(String(clampedEm))}-${pad2(String(clampedEd))}`;
    if (endDateKey !== safeString(row.frontmatter[endKey]).substring(0, 10)) {
      await ctx.dataSource.updateFrontmatter(row.file, { [endKey]: endDateKey });
    }
    return true;
  };

  const commit = async (intent?: TableCellNavigationIntent) => {
    if (committed) return;
    committed = true;
    const finish = () => {
      close();
      if (intent) ctx.finishInlineEdit(row, col, session, intent);
    };
    const y = yearInp.value;
    const rawM = monthInp.value;
    const rawD = dayInp.value;
    const allEmpty = !y && !rawM && !rawD;
    if (allEmpty) {
      if (shouldCommitEmptyBulkDateClear(Boolean(session?.mixed), currentValue)) {
        await ctx.commitEditedValue(row, col, null, session, "clear");
      }
      if (!(await commitEndValue())) { committed = false; return; }
      finish();
      return;
    }
    if (!y || !rawM || !rawD) {
      committed = false;
      const focus = inputs.find((input) => !input.value) || yearInp;
      showValidationError(focus, t("validation.invalidDate"));
      focus.focus();
      return;
    }
    const m = parseInt(rawM, 10);
    const d = parseInt(rawD, 10);
    const yr = parseInt(y, 10);
    if (isNaN(yr) || isNaN(m) || isNaN(d)) {
      committed = false;
      showValidationError(yearInp, t("validation.invalidDate"));
      yearInp.focus();
      return;
    }
    const clampedM = Math.min(Math.max(m, 1), 12);
    const maxD = daysInMonth(yr, clampedM);
    const clampedD = Math.min(Math.max(d, 1), maxD);
    if (m !== clampedM || d !== clampedD) {
      new Notice(t("cell.invalidDate"));
    }
    const dateKey = `${y}-${pad2(String(clampedM))}-${pad2(String(clampedD))}`;
    const newVal = includeTime ? `${dateKey}T${normalizeTimeForSave(hourInp?.value || "", minuteInp?.value || "")}` : dateKey;
    const currentNormalized = dateParts
      ? (includeTime ? `${dateParts.dateKey}T${dateParts.time || "00:00"}` : dateParts.dateKey)
      : safeString(currentValue).substring(0, includeTime ? 16 : 10).replace(" ", "T");
    if (newVal !== currentNormalized) {
      popover.addClass("db-editor-saving");
      const success = await ctx.commitEditedValue(row, col, newVal, session, "replace");
      popover.removeClass("db-editor-saving");
      if (!success) {
        committed = false;
        renderDraftFailure(popover, yearInp, () => { void commit(intent); }, () => cancel(intent));
        yearInp.focus();
        return;
      }
    }
    if (!(await commitEndValue())) { committed = false; return; }
    finish();
  };

  const cancel = (intent: TableCellNavigationIntent = "stay") => {
    if (committed) return;
    committed = true;
    close();
    ctx.finishInlineEdit(row, col, session, intent);
  };
  ctx.setActiveInlineEditorCancel(cancel);

  if (isMobile) {
    const actions = popover.createDiv({ cls: "db-cell-edit-mobile-actions" });
    const done = actions.createEl("button", { cls: "db-cell-edit-mobile-done", text: t("common.save"), attr: { type: "button" } });
    const cancelButton = actions.createEl("button", { cls: "db-cell-edit-mobile-cancel", text: t("common.cancel"), attr: { type: "button" } });
    done.onmousedown = (event) => event.preventDefault();
    cancelButton.onmousedown = (event) => event.preventDefault();
    done.onclick = () => { void commit(); };
    cancelButton.onclick = () => cancel("stay");
    popover.prepend(actions);
  }

  const onOutside = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (target && (popover.contains(target) || td.contains(target))) return;
    void commit();
  };

  const onDocumentKeydown = (event: KeyboardEvent) => {
    if (isImeComposing(event)) return;
    if (event.key !== "Escape") return;
    event.preventDefault();
    cancel();
  };

  if (isMobile && editScrollContainer) {
    const view = editScrollContainer.ownerDocument.defaultView || window;
    const positionMobileEditor = () => {
      if (!popover.isConnected || !editScrollContainer) return;
      const viewport = view.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? view.innerHeight);
      const editorRect = popover.getBoundingClientRect();
      if (editorRect.bottom > viewportBottom - 20 || editorRect.top < viewportTop + 20) {
        td.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      const containerRect = editScrollContainer.getBoundingClientRect();
      const tdRect = bulkAnchorRect(session) ?? td.getBoundingClientRect();
      const top = tdRect.bottom - containerRect.top + (editScrollContainer.scrollTop || 0) + 2;
      popover.style.top = `${top}px`;
    };
    const onViewportChange = () => positionMobileEditor();
    view.visualViewport?.addEventListener("resize", onViewportChange);
    view.visualViewport?.addEventListener("scroll", onViewportChange);
    removeMobileViewportListeners = () => {
      view.visualViewport?.removeEventListener("resize", onViewportChange);
      view.visualViewport?.removeEventListener("scroll", onViewportChange);
    };
    positionMobileEditor();
  }

  const isMovingWithinDatePopover = (e: FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    return Boolean(next && (inputs.includes(next as HTMLInputElement) || popover.contains(next)));
  };

  const handleSegmentKey = (
    event: KeyboardEvent,
    input: HTMLInputElement,
    prev?: HTMLInputElement,
  ) => {
    if (isImeComposing(event)) return;
    if (event.key === "Tab") {
      const isFirst = input === inputs[0];
      const isLast = input === inputs[inputs.length - 1];
      if ((!event.shiftKey && isLast) || (event.shiftKey && isFirst)) {
        event.preventDefault();
        event.stopPropagation();
        void commit(event.shiftKey ? "previous" : "next");
      }
      return;
    }
    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      if (event.key === "Backspace" && input.value === "" && prev) {
        event.preventDefault();
        prev.focus();
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      void commit(event.shiftKey ? "up" : "down");
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel("stay");
      return;
    }
    if (!/^\d$/.test(event.key)) { event.preventDefault(); return; }
  };

  const normalizeTimeForSave = (hourValue: string, minuteValue: string) => {
    const hour = Number(hourValue.trim() || "0");
    const minute = Number(minuteValue.trim() || "0");
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "00:00";
    const clampedHour = Math.min(Math.max(Math.trunc(hour), 0), 23);
    const clampedMinute = Math.min(Math.max(Math.trunc(minute), 0), 59);
    if (clampedHour !== hour || clampedMinute !== minute) new Notice(t("cell.invalidDate"));
    return `${pad2(String(clampedHour))}:${pad2(String(clampedMinute))}`;
  };

  const setDateInputs = (dateKey: string) => {
    const [year, month, day] = dateKey.split("-");
    yearInp.value = year || "";
    monthInp.value = month || "";
    dayInp.value = day || "";
  };

  const setCurrentTimeInputs = () => {
    if (!hourInp || !minuteInp) return;
    const now = new Date();
    hourInp.value = pad2(String(now.getHours()));
    minuteInp.value = pad2(String(now.getMinutes()));
  };

  const getDraftDateKey = (): string => {
    const year = yearInp.value;
    const month = monthInp.value;
    const day = dayInp.value;
    return /^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)
      ? `${year}-${month}-${day}`
      : initialDateKey;
  };

  const pickerEventIndex: MiniCalendarEventIndex = {
    dateKeys: new Set(),
    monthKeys: new Set(),
    yearKeys: new Set(),
  };

  const datePicker = popover.createDiv({ cls: "db-calendar-mini-popover db-cell-date-picker" });
  datePicker.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  const renderDatePicker = () => {
    const [ys, ms] = pickerMonthKey.split("-");
    const year = Number(ys);
    const monthIndex = Number(ms) - 1;
    const weekStartsOn = getLocaleWeekStartsOn();
    renderMiniCalendar({
      popover: datePicker,
      mode: pickerMode,
      monthKey: pickerMonthKey,
      monthTitle: formatDatePickerMonthTitle(year, monthIndex, getEffectiveLocale()),
      visibleYear: year,
      yearRangeStart: getDatePickerYearRangeStart(year),
      weeks: buildDatePickerWeeks(year, monthIndex, weekStartsOn),
      weekdays: getWeekdayLabels(getEffectiveLocale(), weekStartsOn),
      todayKey: getLocalDateKey(),
      selectedKeys: new Set([getDraftDateKey()]),
      eventIndex: pickerEventIndex,
      onPrevious: () => {
        pickerMonthKey = shiftDatePickerMonth(pickerMonthKey, pickerMode === "day" ? -1 : pickerMode === "month" ? -12 : -144);
        renderDatePicker();
      },
      onNext: () => {
        pickerMonthKey = shiftDatePickerMonth(pickerMonthKey, pickerMode === "day" ? 1 : pickerMode === "month" ? 12 : 144);
        renderDatePicker();
      },
      onTitleClick: () => {
        if (pickerMode === "day") pickerMode = "month";
        else if (pickerMode === "month") pickerMode = "year";
        renderDatePicker();
      },
      onSelectDate: (dateKey) => {
        setDateInputs(dateKey);
        pickerMonthKey = dateKey.slice(0, 7);
        pickerMode = "day";
        renderDatePicker();
        (hourInp || dayInp).focus();
      },
      onSelectMonth: (monthKey) => {
        pickerMonthKey = monthKey;
        pickerMode = "day";
        renderDatePicker();
      },
      onSelectYear: (selectedYear) => {
        pickerMonthKey = `${String(selectedYear).padStart(4, "0")}-01`;
        pickerMode = "month";
        renderDatePicker();
      },
      onSelectToday: (dateKey) => {
        pickerMonthKey = dateKey.slice(0, 7);
        pickerMode = "day";
        setDateInputs(dateKey);
        setCurrentTimeInputs();
        renderDatePicker();
        (hourInp || dayInp).focus();
      },
    });
  };

  yearInp.value = initYear;
  yearInp.onkeydown = (e) => handleSegmentKey(e, yearInp, undefined);
  yearInp.oninput = () => {
    yearInp.value = yearInp.value.replace(/\D/g, "");
    if (yearInp.value.length === 4) { monthInp.focus(); monthInp.select(); }
  };
  yearInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

  monthInp.value = initMonth;
  monthInp.onkeydown = (e) => handleSegmentKey(e, monthInp, yearInp);
  monthInp.oninput = () => {
    monthInp.value = monthInp.value.replace(/\D/g, "");
    const v = monthInp.value;
    if (v.length === 1 && /^[2-9]$/.test(v)) {
      monthInp.value = `0${v}`;
      dayInp.focus();
      dayInp.select();
    } else if (v.length === 2) {
      dayInp.focus();
      dayInp.select();
    }
  };
  monthInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

  dayInp.value = initDay;
  dayInp.onkeydown = (e) => handleSegmentKey(e, dayInp, monthInp);
  dayInp.oninput = () => {
    dayInp.value = dayInp.value.replace(/\D/g, "");
    const v = dayInp.value;
    if (v.length === 1 && /^[4-9]$/.test(v)) {
      dayInp.value = `0${v}`;
      if (hourInp) {
        hourInp.focus();
        hourInp.select();
      } else {
        void commit();
      }
    } else if (v.length === 2) {
      if (hourInp) {
        hourInp.focus();
        hourInp.select();
      } else {
        void commit();
      }
    }
  };
  dayInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

  if (hourInp && minuteInp) {
    hourInp.value = initHour;
    hourInp.onkeydown = (e) => handleSegmentKey(e, hourInp, dayInp);
    hourInp.oninput = () => {
      hourInp.value = hourInp.value.replace(/\D/g, "");
      const v = hourInp.value;
      if (v.length === 1 && /^[3-9]$/.test(v)) {
        hourInp.value = `0${v}`;
        minuteInp.focus();
        minuteInp.select();
      } else if (v.length === 2) {
        minuteInp.focus();
        minuteInp.select();
      }
    };
    hourInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

    minuteInp.value = initMinute;
    minuteInp.onkeydown = (e) => handleSegmentKey(e, minuteInp, hourInp);
    minuteInp.oninput = () => {
      minuteInp.value = minuteInp.value.replace(/\D/g, "");
      const v = minuteInp.value;
      if (v.length === 1 && /^[6-9]$/.test(v)) {
        minuteInp.value = `0${v}`;
        void commit();
      } else if (v.length === 2) {
        void commit();
      }
    };
    minuteInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };
  }

  renderDatePicker();

  if (closeBtn) {
    closeBtn.onmousedown = (event) => event.preventDefault();
    closeBtn.onclick = () => cancel("stay");
  }

  const focusYearInput = () => {
    yearInp.focus();
    if (initialDraft) yearInp.setSelectionRange(yearInp.value.length, yearInp.value.length);
    else yearInp.select();
  };

  if (!isMobile) {
    window.requestAnimationFrame(() => {
      positionDateEditPopover(popover, td, container, session);
      focusYearInput();
    });
  } else {
    window.setTimeout(() => {
      focusYearInput();
    }, 50);
  }

  window.setTimeout(() => {
    window.activeDocument.addEventListener("mousedown", onOutside, true);
    window.activeDocument.addEventListener("keydown", onDocumentKeydown, true);
  }, 0);
}
