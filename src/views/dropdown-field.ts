// ───────────────────────────────────────────────────────────────────
// MODULE:    dropdown-field
// COMPONENT: dropdown/select field backed by a positioned popover listbox
// ───────────────────────────────────────────────────────────────────
//
// Two public entry points — createDropdownField for a persistent labeled
// field, openDropdownMenu for an ephemeral anchor-triggered menu — share one
// popover implementation (search, typeahead, arrow-key roving, sectioned
// options) so keyboard and positioning behavior cannot drift between the
// two call sites.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { isImeComposing } from "../data/keyboard-utils";
import { t } from "../i18n";
import { buildShellHeader } from "./surface-shell";
import { installPopoverAutoClose } from "./popover-auto-close";
import { isMobileBottomSheet, positionToolbarPopover } from "./popover-position";
import { filterPickerRows, moveCreateOptionsFirst } from "./popover-host";

// ───────────────────────────────────────────────────────────────────
// 2. STATE
// ───────────────────────────────────────────────────────────────────

let nextDropdownId = 0;

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface DropdownOption {
  value: string;
  text: string;
  section?: string;
  disabled?: boolean;
  disabledReason?: string;
  icon?: string;
  swatches?: string[];
  /** Action row that invokes onChange without replacing the field's current displayed value. */
  preserveValueOnSelect?: boolean;
}

export interface DropdownFieldOptions {
  parent: HTMLElement;
  label: string;
  options: DropdownOption[];
  value: string;
  onChange(value: string): void;
  icon?: string;
  className?: string;
  popoverClassName?: string;
  disabled?: boolean;
  disabledReason?: string;
  placeholder?: string;
  hideLabel?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  closeOnSelect?: boolean;
  renderIcon?(parent: HTMLElement, icon: string): void;
}

export interface DropdownFieldHandle {
  button: HTMLButtonElement;
  valueEl: HTMLElement;
  close(): void;
}

export interface DropdownMenuOptions {
  anchor: HTMLElement;
  label: string;
  options: DropdownOption[];
  value: string;
  onChange(value: string): void;
  popoverClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  closeOnSelect?: boolean;
  renderIcon?(parent: HTMLElement, icon: string): void;
  onClose?: () => void;
}

interface DropdownRow {
  section?: HTMLElement;
  row: HTMLButtonElement;
  value: string;
  option: DropdownOption;
}

/**
 * Internal: the popover's own options, plus the trigger the field already turned into a text input.
 *
 * When it is present the popover renders no search row of its own — the trigger IS the query field,
 * so a second input inside the panel would be two carets for one search.
 */
interface DropdownPopoverOptions extends DropdownFieldOptions {
  comboboxInput?: HTMLInputElement;
}

// ───────────────────────────────────────────────────────────────────
// 4. DROPDOWN FIELD
// ───────────────────────────────────────────────────────────────────

export function createDropdownField(options: DropdownFieldOptions): DropdownFieldHandle {
  let currentValue = options.value;
  const button = options.parent.createEl("button", {
    cls: `db-dropdown-field${options.className ? ` ${options.className}` : ""}`,
    attr: { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false" },
  });
  if (options.disabled) button.disabled = true;
  if (options.disabledReason) {
    button.setAttr("title", options.disabledReason);
    button.setAttr("aria-label", `${options.label}: ${options.disabledReason}`);
  }
  const iconWrap = button.createSpan({ cls: "db-dropdown-field-icon" });
  const renderButtonIcon = (value: string) => {
    iconWrap.empty();
    const icon = options.icon || getOptionIcon(options.options, value);
    button.toggleClass("has-current-icon", Boolean(icon));
    if (!icon) return;
    if (options.renderIcon) options.renderIcon(iconWrap, icon);
    else setIcon(iconWrap, icon);
  };
  renderButtonIcon(currentValue);
  const text = button.createDiv({ cls: "db-dropdown-field-text" });
  if (!options.hideLabel) text.createSpan({ cls: "db-dropdown-field-label", text: options.label });
  const valueEl = text.createSpan({ cls: "db-dropdown-field-value", text: getOptionText(options.options, currentValue) || options.placeholder || "" });
  if (options.disabled && options.disabledReason) {
    text.createSpan({ cls: "db-dropdown-field-disabled-reason", text: options.disabledReason });
  }
  setIcon(button.createSpan({ cls: "db-dropdown-field-chevron" }), "chevron-down");

  let cleanup: (() => void) | undefined;
  let combobox: HTMLInputElement | undefined;
  // Putting the trigger back is part of closing, whatever closed it — Escape, a click outside, a
  // second click on the field, or a row being picked. The field's displayed value is never touched
  // while the query field is open, so restoring it restores the value the user came in with.
  const restoreTrigger = () => {
    if (!combobox) return;
    const hadFocus = button.ownerDocument.activeElement === combobox;
    combobox.remove();
    combobox = undefined;
    button.removeClass("is-editing");
    // Only when the caret was still in the query field: a click that landed somewhere else has
    // already chosen where focus belongs, and pulling it back to the trigger would fight the user.
    if (hadFocus) button.focus();
  };
  const close = () => {
    cleanup?.();
    cleanup = undefined;
    restoreTrigger();
    button.setAttr("aria-expanded", "false");
  };
  button.onclick = () => {
    if (button.disabled) return;
    if (cleanup) {
      close();
      return;
    }
    // On a desktop the trigger itself becomes the query field: one click opens the list and arms
    // the caret, with no second control to reach for. The phone sheet keeps its own header-and-
    // search grammar, where the list is a sheet rather than a panel hanging off a trigger.
    if (!isMobileBottomSheet(button.ownerDocument)) {
      combobox = openTriggerInput(options, button, currentValue);
    }
    cleanup = openDropdownPopover(combobox ?? button, {
      ...options,
      value: currentValue,
      comboboxInput: combobox,
      onChange: (value) => {
        const action = options.options.find((option) => option.value === value)?.preserveValueOnSelect === true;
        if (!action) {
          currentValue = value;
          renderButtonIcon(currentValue);
        }
        options.onChange(value);
      },
    }, valueEl, close);
    button.setAttr("aria-expanded", "true");
  };
  return { button, valueEl, close };
}

// ───────────────────────────────────────────────────────────────────
// 5. DROPDOWN MENU
// ───────────────────────────────────────────────────────────────────

export function openDropdownMenu(options: DropdownMenuOptions): () => void {
  const doc = options.anchor.ownerDocument;
  const valueEl = doc.createElement("span");
  let closed = false;
  let cleanup: (() => void) | undefined;
  const close = () => {
    if (closed) return;
    closed = true;
    cleanup?.();
    cleanup = undefined;
    options.onClose?.();
  };
  cleanup = openDropdownPopover(options.anchor, {
    parent: options.anchor,
    label: options.label,
    options: options.options,
    value: options.value,
    onChange: (value) => options.onChange(value),
    popoverClassName: options.popoverClassName,
    searchable: options.searchable,
    searchPlaceholder: options.searchPlaceholder,
    closeOnSelect: options.closeOnSelect,
    renderIcon: options.renderIcon ? (parent, icon) => options.renderIcon?.(parent, icon) : undefined,
  }, valueEl, close);
  return close;
}

// ───────────────────────────────────────────────────────────────────
// 6. POPOVER
// ───────────────────────────────────────────────────────────────────

function openDropdownPopover(anchor: HTMLElement, options: DropdownPopoverOptions, valueEl: HTMLElement, close: () => void): () => void {
  const contextClass = getDropdownPopoverContextClass(anchor);
  const host = getDropdownPopoverHost(anchor);
  const phoneSheet = isMobileBottomSheet(anchor.ownerDocument);
  // Every desktop dropdown is a combobox: the list filters as you type, whatever its length. The
  // count gate that used to decide this ("long lists only") is the phone sheet's alone now, where
  // a search row is a row in a sheet rather than the trigger the finger already touched.
  const searchable = phoneSheet ? options.searchable === true && options.options.length > 8 : true;
  // A field-shaped trigger brings its own query field; a menu opened from a cell, a tab or an icon
  // has no field to type into, so the panel carries the search row first, above the list.
  const panelSearch = searchable && !options.comboboxInput;
  const panel = host.createDiv({ cls: `db-dropdown-popover ${contextClass}${panelSearch ? " is-searchable" : ""}${options.popoverClassName ? ` ${options.popoverClassName}` : ""}` });
  const popupId = `db-dropdown-${++nextDropdownId}`;
  panel.setAttr("id", popupId);
  panel.setAttr("role", "listbox");
  panel.setAttr("aria-label", options.label);
  anchor.setAttr("aria-controls", popupId);
  if (phoneSheet) buildShellHeader(panel, { title: options.label, onClose: close });
  let searchInput = options.comboboxInput;
  if (panelSearch) {
    const searchWrap = panel.createDiv({ cls: "db-dropdown-search" });
    searchInput = searchWrap.createEl("input", {
      attr: {
        type: "search",
        placeholder: options.searchPlaceholder || options.label,
        "aria-label": options.label,
        "aria-controls": popupId,
        "aria-autocomplete": "list",
        role: "combobox",
        "aria-expanded": "true",
      },
    });
  }
  // When the panel carries the search box, options live in their own scroll container so the box
  // stays fixed at the top (no sticky drift). Otherwise the panel itself scrolls.
  const optionsHost = panelSearch || phoneSheet ? panel.createDiv({ cls: "db-dropdown-options" }) : panel;
  let currentSection = "";
  let currentSectionEl: HTMLElement | undefined;
  const sectionRows: DropdownRow[] = [];
  const emptyRow = optionsHost.createDiv({ cls: "db-dropdown-empty", text: t("dropdown.noResults"), attr: { role: "status", hidden: "true" } });
  // Every create-affordance row (`preserveValueOnSelect`) moves ahead of the ordinary results,
  // directly under the search field, so it stays reachable while a query is still narrowing toward
  // nothing rather than scrolling past once the list is short. The two groups keep their own
  // internal order; only the two groups themselves are interleaved.
  const orderedOptions = moveCreateOptionsFirst(options.options);
  let activeIndex = orderedOptions.findIndex((option) => option.value === options.value && !option.disabled);
  if (activeIndex < 0) {
    activeIndex = orderedOptions.findIndex((option) => !option.disabled);
  }
  if (activeIndex < 0) activeIndex = 0;
  let typeahead = "";
  let typeaheadTimer: number | undefined;

  const getVisibleRows = () => sectionRows.filter((item) => !item.row.hasClass("is-hidden") && !item.option.disabled);
  const syncActiveOption = (focus = false) => {
    const visibleRows = getVisibleRows();
    if (!visibleRows.length) {
      activeIndex = -1;
      return;
    }
    const active = sectionRows[activeIndex];
    if (!active || active.option.disabled || active.row.hasClass("is-hidden")) {
      activeIndex = sectionRows.indexOf(visibleRows[0]);
    }
    for (const item of sectionRows) item.row.setAttr("tabindex", item === sectionRows[activeIndex] ? "0" : "-1");
    const row = sectionRows[activeIndex]?.row;
    // The search input keeps DOM focus while typing, so the active option is announced through
    // `aria-activedescendant` rather than by moving focus onto the row — moving focus there would
    // drop the caret and end the search a keystroke after it started.
    if (searchInput) {
      const rowId = row?.getAttribute("id");
      if (rowId) searchInput.setAttr("aria-activedescendant", rowId);
      else searchInput.removeAttribute("aria-activedescendant");
    }
    if (focus && row) {
      row.focus();
      row.scrollIntoView?.({ block: "nearest" });
    }
  };

  // Moves the highlight by one visible row. `focusRow` is the older, row-focused behaviour a plain
  // list keeps once a row itself has focus; a query field keeps the caret where it is and moves
  // `aria-activedescendant` instead, which is what lets typing continue after an arrow key.
  const moveActive = (delta: number, focusRow: boolean) => {
    const visibleRows = getVisibleRows();
    if (!visibleRows.length) return;
    const visibleIndex = visibleRows.findIndex((item) => sectionRows.indexOf(item) === activeIndex);
    const next = Math.max(0, Math.min(visibleRows.length - 1, (visibleIndex < 0 ? 0 : visibleIndex) + delta));
    activeIndex = sectionRows.indexOf(visibleRows[next]);
    syncActiveOption(focusRow);
    if (!focusRow) sectionRows[activeIndex]?.row.scrollIntoView?.({ block: "nearest" });
  };

  const selectRow = (item: { row: HTMLButtonElement; value: string; option: DropdownOption }) => {
    if (item.row.disabled || item.option.disabled) return;
    activeIndex = sectionRows.findIndex((candidate) => candidate.row === item.row);
    syncActiveOption();
    if (!item.option.preserveValueOnSelect) {
      syncDropdownSelection(sectionRows, item.value);
      valueEl.setText(item.option.text);
    }
    options.onChange(item.value);
    if (options.closeOnSelect !== false) close();
  };
  for (const option of orderedOptions) {
    if (option.section && option.section !== currentSection) {
      currentSection = option.section;
      currentSectionEl = optionsHost.createDiv({ cls: "db-dropdown-section-title", text: option.section });
    }
    const row = optionsHost.createEl("button", {
      cls: `db-dropdown-option db-menu-item${option.icon ? " has-icon" : ""}${option.swatches?.length ? " has-swatches" : ""}${option.value === options.value ? " is-selected" : ""}${option.disabled ? " is-disabled" : ""}`,
      attr: { type: "button", role: "option", "aria-selected": option.value === options.value ? "true" : "false", tabindex: "-1" },
    });
    row.setAttr("data-value", option.value);
    row.setAttr("data-search-text", `${option.text} ${option.value} ${option.disabledReason || ""}`.toLowerCase());
    row.setAttr("id", `${popupId}-option-${sectionRows.length}`);
    if (option.disabled && option.disabledReason) {
      // A natively-disabled <button> swallows hover events in Chromium, so its
      // title tooltip never appears. Keep it enabled but aria-disabled so the
      // hover tooltip works; the click handler below guards activation instead.
      row.setAttr("aria-disabled", "true");
    } else {
      row.disabled = option.disabled === true;
    }
    if (option.disabledReason) {
      row.setAttr("title", option.disabledReason);
      row.setAttr("aria-label", `${option.text}: ${option.disabledReason}`);
    }
    const check = row.createSpan({ cls: "db-dropdown-option-check db-menu-item-check" });
    if (option.value === options.value) setIcon(check, "check");
    if (option.icon) {
      const iconEl = row.createSpan({ cls: "db-dropdown-option-icon db-menu-item-icon" });
      if (options.renderIcon) options.renderIcon(iconEl, option.icon);
      else setIcon(iconEl, option.icon);
    }
    const text = row.createSpan({ cls: "db-dropdown-option-text db-menu-item-label" });
    text.createSpan({ cls: "db-dropdown-option-label", text: option.text });
    if (option.swatches?.length) {
      const swatches = row.createSpan({ cls: "db-dropdown-option-swatches", attr: { "aria-hidden": "true" } });
      for (const color of option.swatches.slice(0, 5)) {
        swatches.createSpan({ cls: "db-dropdown-option-swatch", attr: { style: `background-color: ${color}` } });
      }
    }
    const rowData = { section: currentSectionEl, row, value: option.value, option };
    row.onclick = () => selectRow(rowData);
    sectionRows.push(rowData);
  }
  syncActiveOption();
  if (searchInput) {
    searchInput.oninput = () => {
      const visibleRows = filterPickerRows(sectionRows, searchInput?.value || "", emptyRow);
      activeIndex = visibleRows.length ? sectionRows.indexOf(visibleRows[0]) : -1;
      syncActiveOption();
      updateScrollAffordance();
    };
    searchInput.onkeydown = (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "Escape") {
        // Nothing typed here ever writes to the field — only a row's own selection does — so
        // leaving restores the previous value by having never replaced it. What this adds is the
        // close itself, from the one element holding focus while the list is open.
        event.preventDefault();
        close();
        return;
      }
      const visibleRows = getVisibleRows();
      if (!visibleRows.length) return;
      const active = sectionRows[activeIndex];
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        moveActive(event.key === "ArrowDown" ? 1 : -1, false);
      } else if (event.key === "Enter") {
        event.preventDefault();
        selectRow(active && visibleRows.includes(active) ? active : visibleRows[0]);
      } else if (event.key === "Tab") {
        // Tab commits the highlighted row rather than leaving the popover open behind whatever the
        // browser's own tab order focuses next — the same "leaving without choosing shouldn't lose
        // the highlight" contract Enter already carries, just for the key a user reaches for to move
        // on rather than to confirm.
        if (active && visibleRows.includes(active)) {
          event.preventDefault();
          selectRow(active);
        }
      }
    };
    window.setTimeout(() => searchInput?.focus(), 0);
  }
  const updateScrollAffordance = (): void => {
    if (!phoneSheet) return;
    const canScroll = optionsHost.scrollHeight > optionsHost.clientHeight + 1;
    const atEnd = optionsHost.scrollTop + optionsHost.clientHeight >= optionsHost.scrollHeight - 1;
    panel.toggleClass("has-scroll-overflow", canScroll && !atEnd);
  };
  if (phoneSheet) optionsHost.addEventListener("scroll", updateScrollAffordance, { passive: true });
  // Left-aligned, like a native <select>: the panel's left edge sits under the trigger's left
  // edge rather than its right edge. `positionToolbarPopover` defaults to `align: "right"` for
  // callers that hang a small popover off an icon-only trigger (the "..." overflow button, where
  // a right edge is the only shared coordinate); a labelled dropdown field has a left edge worth
  // keeping level with, and `resolvePopoverHorizontalLeft`'s own fallback already clamps into the
  // viewport when a left-aligned panel would run past the right edge.
  positionToolbarPopover(panel, anchor, { preferredWidth: 280, maxWidth: 360, minWidth: 180, gap: 6, align: "left" });
  if (!searchInput) {
    syncActiveOption(true);
  }
  if (phoneSheet) window.setTimeout(updateScrollAffordance, 0);

  const onKeydown = (event: KeyboardEvent) => {
    if (isImeComposing(event) || event.target === searchInput) return;
    const target = event.target as HTMLElement | null;
    const currentRowIndex = target ? sectionRows.findIndex((item) => item.row === target) : -1;
    const recognized = searchable
      ? ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Tab"]
      : ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "];
    if (!recognized.includes(event.key) && event.key.length !== 1) return;
    const visibleRows = getVisibleRows();
    if (!visibleRows.length) return;
    if (currentRowIndex >= 0) activeIndex = currentRowIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(event.key === "ArrowDown" ? 1 : -1, true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      activeIndex = sectionRows.indexOf(event.key === "Home" ? visibleRows[0] : visibleRows[visibleRows.length - 1]);
      syncActiveOption(true);
    } else if (event.key === "Enter" || event.key === " " || (searchable && event.key === "Tab")) {
      // Tab-commits-highlighted is part of the combobox contract (`searchable` dropdowns only):
      // a row that took focus on its own — clicked into, or tabbed to — routes Tab through this
      // handler rather than the query field's, so the same commit is reachable from either entry
      // point. A plain, non-searchable list keeps Tab as ordinary focus movement, unchanged.
      event.preventDefault();
      const activeRow = sectionRows[activeIndex];
      if (activeRow) selectRow(activeRow);
    } else if (/^\S$/u.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead += event.key.toLowerCase();
      if (typeaheadTimer !== undefined) window.clearTimeout(typeaheadTimer);
      typeaheadTimer = window.setTimeout(() => { typeahead = ""; typeaheadTimer = undefined; }, 500);
      const match = visibleRows.find((item) => item.option.text.toLowerCase().startsWith(typeahead));
      if (match) {
        event.preventDefault();
        activeIndex = sectionRows.indexOf(match);
        syncActiveOption(true);
      }
    }
  };
  panel.addEventListener("keydown", onKeydown);
  const removeAutoClose = installPopoverAutoClose({ panel, anchorEl: anchor, close });
  return () => {
    panel.removeEventListener("keydown", onKeydown);
    if (phoneSheet) optionsHost.removeEventListener("scroll", updateScrollAffordance);
    if (typeaheadTimer !== undefined) window.clearTimeout(typeaheadTimer);
    removeAutoClose();
    anchor.removeAttribute("aria-controls");
    panel.remove();
  };
}

// ───────────────────────────────────────────────────────────────────
// 7. HELPERS
// ───────────────────────────────────────────────────────────────────

/**
 * Turn the trigger into the combobox's text input, in the trigger's own layout slot.
 *
 * The input is inserted where the button sits rather than appended, and the button is hidden rather
 * than removed, so a field inside a grid or flex row keeps its column and its width: the surface
 * the user clicked becomes typable in place instead of a panel growing a second control. The button
 * survives so the field's handle, its icon and its value element stay the objects every caller
 * already holds.
 *
 * The current value becomes the PLACEHOLDER and the query starts empty, which is what Anytype's own
 * property picker does — its field opens on a hint, not on a selection. The first keystroke filters
 * rather than deleting a value the user may not have meant to replace, and the value stays legible
 * while the list narrows.
 */
function openTriggerInput(options: DropdownFieldOptions, button: HTMLButtonElement, value: string): HTMLInputElement {
  const input = button.ownerDocument.createElement("input");
  input.type = "text";
  input.addClass("db-dropdown-field-input");
  // The trigger's own layout classes come along: whatever sizes the button in its row has to size
  // the input that replaces it, or the row reflows the moment the field is opened.
  for (const cls of (options.className || "").split(/\s+/).filter(Boolean)) input.addClass(cls);
  input.setAttr("placeholder", getOptionText(options.options, value) || options.placeholder || options.label);
  input.setAttr("aria-label", options.label);
  input.setAttr("role", "combobox");
  input.setAttr("aria-expanded", "true");
  input.setAttr("aria-autocomplete", "list");
  button.addClass("is-editing");
  options.parent.insertBefore(input, button);
  input.focus();
  return input;
}

function getDropdownPopoverHost(anchor: HTMLElement): HTMLElement {
  if (anchor.closest(".db-mobile-bottom-sheet, .note-database-settings, .note-database-modal")) return anchor.ownerDocument.body;
  const container = anchor.closest(".note-database-container");
  if (container instanceof HTMLElement) return container;
  return anchor.parentElement || anchor;
}

function getDropdownPopoverContextClass(anchor: HTMLElement): string {
  if (anchor.closest(".note-database-settings")) return "db-dropdown-popover-context-settings";
  if (anchor.closest(".note-database-modal")) return "db-dropdown-popover-context-modal";
  return "db-dropdown-popover-context-container";
}

function getOptionText(options: DropdownOption[], value: string): string | undefined {
  return options.find((option) => option.value === value)?.text;
}

function getOptionIcon(options: DropdownOption[], value: string): string | undefined {
  return options.find((option) => option.value === value)?.icon;
}

function syncDropdownSelection(rows: Array<{ row: HTMLButtonElement; value: string }>, value: string): void {
  for (const item of rows) {
    const selected = item.value === value;
    item.row.toggleClass("is-selected", selected);
    item.row.setAttr("aria-selected", selected ? "true" : "false");
    const check = item.row.querySelector<HTMLElement>(".db-dropdown-option-check");
    check?.replaceChildren();
    if (selected && check) setIcon(check, "check");
  }
}
