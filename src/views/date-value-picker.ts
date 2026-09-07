// ───────────────────────────────────────────────────────────────────
// MODULE:    date-value-picker
// COMPONENT: date/time field trigger and its segmented-input + calendar popover
// ───────────────────────────────────────────────────────────────────
//
// The active-picker registry (one per document, shared with the colour and icon pickers) is the
// picker host's — a click on an already-open trigger toggles it closed rather than stacking a
// second popover, and opening any family member closes whichever of the three was open. Closing
// without committing restores the original value and display text so an aborted edit never leaks
// into the underlying field.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import {
  addDateKeyDays,
  getLocaleWeekStartsOn,
  getLocalDateKey,
  getWeekdayLabels,
  parseDateKeyToUtc,
  renderNow,
} from "../data/calendar-date-time";
import { getEffectiveLocale, t } from "../i18n";
import { formatDateValueDisplay } from "../data/date-time-format";
import { isImeComposing } from "../data/keyboard-utils";
import { MiniCalendarEventIndex, MiniCalendarMode, renderMiniCalendar } from "./calendar-mini-calendar-renderer";
import {
  buildDatePickerWeeks,
  composeDatePickerValue,
  formatDatePickerMonthTitle,
  getDatePickerYearRangeStart,
  normalizeDatePickerValue,
  shiftDatePickerMonth,
} from "./date-picker-model";
import { installPopoverAutoClose } from "./popover-auto-close";
import { positionToolbarPopover } from "./popover-position";
import {
  clearActivePickerIfCurrent,
  closeActivePicker,
  DATE_PICKER_POPOVER,
  getActivePicker,
  mountPickerSheetHeader,
  setActivePicker,
  type ActivePicker,
} from "./popover-host";
import { isHTMLElement } from "./dom-guards";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface DateValuePickerOptions {
  parent: HTMLElement;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  includeTime?: boolean;
  displayText?: string;
  footerAction?: {
    label: string;
    onSelect(): void;
  };
  className?: string;
  /** Sheet-header title on a phone — the column this date field belongs to. */
  fieldLabel?: string;
  onChange(value: string): void;
}

let nextDatePickerId = 0;

export function closeActiveDateValuePicker(doc: Document = window.activeDocument, commit = false): void {
  closeActivePicker(doc, commit);
}

// ───────────────────────────────────────────────────────────────────
// 4. TRIGGER
// ───────────────────────────────────────────────────────────────────

export function renderDateValuePicker(options: DateValuePickerOptions): HTMLButtonElement {
  const trigger = options.parent.createEl("button", {
    cls: ["obnotion-date-value-field", options.className || ""].filter(Boolean).join(" "),
    attr: {
      type: "button",
      "aria-label": options.placeholder || t("filter.value"),
      "aria-haspopup": "dialog",
      "aria-expanded": "false",
    },
  });
  trigger.disabled = Boolean(options.disabled);
  const icon = trigger.createSpan({ cls: "obnotion-date-value-field-icon" });
  setIcon(icon, options.includeTime ? "calendar-clock" : "calendar-days");
  const label = trigger.createSpan({ cls: "obnotion-date-value-field-text" });
  const syncLabel = () => {
    const current = normalizeDatePickerValue(options.value, Boolean(options.includeTime));
    label.setText(options.displayText || current.replace("T", " ") || options.placeholder || t("filter.value"));
    trigger.toggleClass("is-empty", !options.displayText && !current);
  };
  syncLabel();

  trigger.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (trigger.disabled) return;
    openDateValuePicker(trigger, options, syncLabel);
  };
  return trigger;
}

// ───────────────────────────────────────────────────────────────────
// 5. POPOVER
// ───────────────────────────────────────────────────────────────────

function openDateValuePicker(
  trigger: HTMLButtonElement,
  options: DateValuePickerOptions,
  syncLabel: () => void,
): void {
  const doc = trigger.ownerDocument;
  const ownerWindow = doc.defaultView || window;
  const active = getActivePicker(doc);
  if (active?.anchor === trigger) {
    active.close(true);
    return;
  }
  active?.close(true);

  const rawContainer = trigger.closest(".obnotion-container");
  const host = isHTMLElement(rawContainer) ? rawContainer : doc.body;
  const includeTime = Boolean(options.includeTime);
  const originalValue = normalizeDatePickerValue(options.value, includeTime);
  const originalDisplayText = options.displayText;
  let committedValue = originalValue;
  // renderNow() returns the real clock unless a caller has frozen it (production never does),
  // so this reads exactly like `new Date()` at runtime — but it lets a capture or gate harness
  // pin "today" the same way it already pins the calendar/timeline/gantt renderers, instead of
  // this picker alone drawing its presets against whatever day the run happens to execute on.
  const todayKey = getLocalDateKey(renderNow());
  let pickerMonthKey = (originalValue || todayKey).slice(0, 7);
  let pickerMode: MiniCalendarMode = "day";
  let closed = false;
  let cleanupAutoClose: (() => void) | undefined;

  const popover = host.createDiv({
    cls: "obnotion-cell-edit-popover obnotion-date-edit-popover obnotion-date-value-popover",
    attr: { role: "dialog", "aria-label": options.placeholder || t("filter.value") },
  });
  const popoverId = `obnotion-date-picker-${++nextDatePickerId}`;
  popover.setAttr("id", popoverId);
  trigger.setAttr("aria-controls", popoverId);
  if (includeTime) popover.addClass("is-datetime");
  // The padded-row grammar needs somewhere structural to measure on a phone sheet; the desktop
  // popover keeps building presets/segments/calendar as direct children exactly as before. `close`
  // is referenced here ahead of its own declaration further down — safe, since `onClose` only runs
  // from a later click, by which time the closure below has assigned it, the same deferred-reference
  // pattern every preset button in this function already relies on.
  const content = mountPickerSheetHeader(popover, doc, {
    title: options.fieldLabel || t("filter.value"),
    onClose: () => close(true),
    bodyCls: "obnotion-date-picker-body obnotion-panel-row",
  });
  const presets = content.createDiv({ cls: "obnotion-date-presets", attr: { role: "group", "aria-label": t("datePicker.presets") } });
  // A relative label ("Tomorrow") reads as a choice with no literal to check it against until the
  // resolved date sits beside it — Notion pairs every relative preset with the date it resolves to
  // (`cfca14fb`). The resolved dateKey is optional so "Clear" — which resolves to nothing — keeps
  // a bare label rather than growing an empty subline.
  const createPreset = (label: string, onSelect: () => void, resolvedDateKey?: string) => {
    const button = presets.createEl("button", { cls: "obnotion-date-preset", attr: { type: "button" } });
    button.createSpan({ cls: "obnotion-date-preset-label", text: label });
    if (resolvedDateKey) {
      button.createSpan({ cls: "obnotion-date-preset-subline", text: formatDateValueDisplay(resolvedDateKey) });
    }
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect();
    };
  };
  const tomorrowKey = addDateKeyDays(todayKey, 1);
  const nextWeekKey = addDateKeyDays(todayKey, 7);
  createPreset(t("datePicker.today"), () => chooseToday(todayKey), todayKey);
  createPreset(t("datePicker.tomorrow"), () => chooseDate(tomorrowKey), tomorrowKey);
  createPreset(t("datePicker.nextWeek"), () => chooseDate(nextWeekKey), nextWeekKey);
  createPreset(t("datePicker.clear"), () => {
    setInputs("");
    close(true);
  });
  const segments = content.createDiv({ cls: "obnotion-date-segments" });
  const yearInput = segments.createEl("input", {
    cls: "obnotion-date-seg",
    attr: { maxlength: "4", inputmode: "numeric", placeholder: "YYYY", "aria-label": "YYYY" },
  });
  segments.createSpan({ cls: "obnotion-date-sep", text: "-" });
  const monthInput = segments.createEl("input", {
    cls: "obnotion-date-seg",
    attr: { maxlength: "2", inputmode: "numeric", placeholder: "MM", "aria-label": "MM" },
  });
  segments.createSpan({ cls: "obnotion-date-sep", text: "-" });
  const dayInput = segments.createEl("input", {
    cls: "obnotion-date-seg",
    attr: { maxlength: "2", inputmode: "numeric", placeholder: "DD", "aria-label": "DD" },
  });
  let hourInput: HTMLInputElement | undefined;
  let minuteInput: HTMLInputElement | undefined;
  if (includeTime) {
    segments.createSpan({ cls: "obnotion-date-sep obnotion-time-sep", text: " " });
    hourInput = segments.createEl("input", {
      cls: "obnotion-date-seg obnotion-time-seg obnotion-hour-seg",
      attr: { maxlength: "2", inputmode: "numeric", placeholder: "HH", "aria-label": "HH" },
    });
    segments.createSpan({ cls: "obnotion-date-sep obnotion-time-colon", text: ":" });
    minuteInput = segments.createEl("input", {
      cls: "obnotion-date-seg obnotion-time-seg obnotion-minute-seg",
      attr: {
        maxlength: "2",
        inputmode: "numeric",
        placeholder: t("calendar.minutePlaceholder"),
        "aria-label": "Minute",
      },
    });
  }
  const inputs = [yearInput, monthInput, dayInput, hourInput, minuteInput]
    .filter((input): input is HTMLInputElement => Boolean(input));
  setInputs(originalValue);

  const eventIndex: MiniCalendarEventIndex = {
    dateKeys: new Set(),
    monthKeys: new Set(),
    yearKeys: new Set(),
  };
  const calendar = content.createDiv({ cls: "obnotion-calendar-mini-popover obnotion-cell-date-picker" });
  calendar.addEventListener("mousedown", (event) => event.preventDefault());

  const readDraftDateKey = (): string | null => {
    const year = yearInput.value.replace(/\D/g, "");
    const rawMonth = monthInput.value.replace(/\D/g, "");
    const rawDay = dayInput.value.replace(/\D/g, "");
    if (!year && !rawMonth && !rawDay) return "";
    const month = rawMonth.padStart(2, "0");
    const day = rawDay.padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    return parseDateKeyToUtc(dateKey) ? dateKey : null;
  };

  const readDraft = (): string | null => {
    const dateKey = readDraftDateKey();
    if (!includeTime || dateKey == null || dateKey === "") return dateKey;
    return composeDatePickerValue(dateKey, hourInput?.value || "", minuteInput?.value || "", true);
  };

  const commitDraft = () => {
    const draft = readDraft();
    if (draft == null || draft === committedValue) return;
    options.value = draft;
    options.displayText = undefined;
    committedValue = draft;
    syncLabel();
    options.onChange(draft);
  };

  const syncDraftLabel = () => {
    const draft = readDraft();
    if (draft == null) return;
    options.value = draft;
    options.displayText = undefined;
    syncLabel();
  };

  let entry: ActivePicker;
  const close = (commit: boolean = false) => {
    if (closed) return;
    closed = true;
    if (commit) commitDraft();
    else {
      options.value = committedValue;
      options.displayText = originalDisplayText;
      syncLabel();
    }
    cleanupAutoClose?.();
    popover.remove();
    trigger.setAttribute("aria-expanded", "false");
    trigger.removeAttribute("aria-controls");
    clearActivePickerIfCurrent(doc, entry);
  };
  entry = { anchor: trigger, close };
  setActivePicker(doc, entry);
  trigger.setAttribute("aria-expanded", "true");

  const chooseDate = (dateKey: string) => {
    setDateInputs(dateKey);
    if (includeTime) {
      if (!hourInput?.value) hourInput!.value = "00";
      if (!minuteInput?.value) minuteInput!.value = "00";
      syncDraftLabel();
      pickerMonthKey = dateKey.slice(0, 7);
      pickerMode = "day";
      renderPicker();
      hourInput?.focus();
      hourInput?.select();
      return;
    }
    syncDraftLabel();
    close(true);
  };

  const chooseToday = (dateKey: string) => {
    setDateInputs(dateKey);
    if (!includeTime) {
      chooseDate(dateKey);
      return;
    }
    const now = new Date();
    hourInput!.value = String(now.getHours()).padStart(2, "0");
    minuteInput!.value = String(now.getMinutes()).padStart(2, "0");
    syncDraftLabel();
    pickerMonthKey = dateKey.slice(0, 7);
    pickerMode = "day";
    renderPicker();
    hourInput?.focus();
    hourInput?.select();
  };

  const rerenderPickerWithFocus = (target: "previous" | "next" | "title") => {
    renderPicker();
    ownerWindow.requestAnimationFrame(() => {
      if (target === "title") {
        calendar.querySelector<HTMLButtonElement>(".obnotion-calendar-mini-title-button")?.focus();
        return;
      }
      const navButtons = calendar.querySelectorAll<HTMLButtonElement>(".obnotion-calendar-mini-nav");
      navButtons[target === "previous" ? 0 : navButtons.length - 1]?.focus();
    });
  };

  const renderPicker = () => {
    const [yearText, monthText] = pickerMonthKey.split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    const weekStartsOn = getLocaleWeekStartsOn();
    const selected = readDraftDateKey();
    renderMiniCalendar({
      popover: calendar,
      mode: pickerMode,
      monthKey: pickerMonthKey,
      monthTitle: formatDatePickerMonthTitle(year, monthIndex, getEffectiveLocale()),
      visibleYear: year,
      yearRangeStart: getDatePickerYearRangeStart(year),
      weeks: buildDatePickerWeeks(year, monthIndex, weekStartsOn),
      weekdays: getWeekdayLabels(getEffectiveLocale(), weekStartsOn),
      todayKey,
      selectedKeys: selected ? new Set([selected]) : new Set(),
      eventIndex,
      onPrevious: () => {
        pickerMonthKey = shiftDatePickerMonth(
          pickerMonthKey,
          pickerMode === "day" ? -1 : pickerMode === "month" ? -12 : -144,
        );
        rerenderPickerWithFocus("previous");
      },
      onNext: () => {
        pickerMonthKey = shiftDatePickerMonth(
          pickerMonthKey,
          pickerMode === "day" ? 1 : pickerMode === "month" ? 12 : 144,
        );
        rerenderPickerWithFocus("next");
      },
      onTitleClick: () => {
        if (pickerMode === "day") pickerMode = "month";
        else if (pickerMode === "month") pickerMode = "year";
        rerenderPickerWithFocus("title");
      },
      onSelectDate: chooseDate,
      onSelectMonth: (monthKey) => {
        pickerMonthKey = monthKey;
        pickerMode = "day";
        renderPicker();
        ownerWindow.requestAnimationFrame(() => {
          calendar.querySelector<HTMLButtonElement>(`[data-month-key="${monthKey}"]`)?.focus();
        });
      },
      onSelectYear: (selectedYear) => {
        pickerMonthKey = `${String(selectedYear).padStart(4, "0")}-01`;
        pickerMode = "month";
        renderPicker();
        ownerWindow.requestAnimationFrame(() => {
          calendar.querySelector<HTMLButtonElement>(`[data-year="${selectedYear}"]`)?.focus();
        });
      },
      onNavigateDate: (dateKey) => {
        pickerMonthKey = dateKey.slice(0, 7);
        pickerMode = "day";
        renderPicker();
        ownerWindow.requestAnimationFrame(() => {
          const cell = Array.from(calendar.querySelectorAll<HTMLButtonElement>("[data-date-key]"))
            .find((candidate) => candidate.getAttribute("data-date-key") === dateKey);
          cell?.focus();
        });
      },
      onSelectToday: chooseToday,
      footerAction: options.footerAction,
    });
  };

  inputs.forEach((input, index) => {
    input.oninput = () => {
      input.value = input.value.replace(/\D/g, "");
      if (index === 0 && input.value.length === 4) inputs[1].focus();
      if (index === 1 && input.value.length === 2) inputs[2].focus();
      if (index === 2 && input.value.length === 2 && hourInput) hourInput.focus();
      if (index === 3 && input.value.length === 2 && minuteInput) minuteInput.focus();
      if (index <= 2) renderPicker();
      syncDraftLabel();
    };
    input.onkeydown = (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        close(true);
      } else if (event.key === "Backspace" && !input.value && index > 0) {
        event.preventDefault();
        inputs[index - 1].focus();
      }
    };
  });

  renderPicker();
  positionToolbarPopover(popover, trigger, { ...DATE_PICKER_POPOVER, align: "left" });
  cleanupAutoClose = installPopoverAutoClose({
    panel: popover,
    anchorEl: trigger,
    close: () => close(true),
    closeOnOutsidePointerDown: true,
    closeOnEscape: true,
  });
  ownerWindow.requestAnimationFrame(() => {
    yearInput.focus();
    yearInput.select();
  });

  function setDateInputs(value: string): void {
    const [year = "", month = "", day = ""] = value.slice(0, 10).split("-");
    yearInput.value = year;
    monthInput.value = month;
    dayInput.value = day;
  }

  function setInputs(value: string): void {
    setDateInputs(value);
    if (!includeTime || !hourInput || !minuteInput) return;
    const time = value.slice(11, 16);
    hourInput.value = time.slice(0, 2);
    minuteInput.value = time.slice(3, 5);
  }
}
