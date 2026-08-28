import { setIcon } from "obsidian";
import { isImeComposing } from "../data/KeyboardUtils";
import { t } from "../i18n";
import { installPopoverAutoClose } from "./PopoverAutoClose";
import { positionToolbarPopover } from "./PopoverPosition";

let nextDropdownId = 0;

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
  const close = () => {
    cleanup?.();
    cleanup = undefined;
    button.setAttr("aria-expanded", "false");
  };
  button.onclick = () => {
    if (button.disabled) return;
    if (cleanup) {
      close();
      return;
    }
    cleanup = openDropdownPopover(button, {
      ...options,
      value: currentValue,
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

function openDropdownPopover(anchor: HTMLElement, options: DropdownFieldOptions, valueEl: HTMLElement, close: () => void): () => void {
  const contextClass = getDropdownPopoverContextClass(anchor);
  const host = getDropdownPopoverHost(anchor);
  const searchable = options.searchable === true && options.options.length > 8;
  const panel = host.createDiv({ cls: `db-dropdown-popover ${contextClass}${searchable ? " is-searchable" : ""}${options.popoverClassName ? ` ${options.popoverClassName}` : ""}` });
  const popupId = `db-dropdown-${++nextDropdownId}`;
  panel.setAttr("id", popupId);
  panel.setAttr("role", "listbox");
  panel.setAttr("aria-label", options.label);
  anchor.setAttr("aria-controls", popupId);
  let searchInput: HTMLInputElement | undefined;
  if (searchable) {
    const searchWrap = panel.createDiv({ cls: "db-dropdown-search" });
    searchInput = searchWrap.createEl("input", {
      attr: {
        type: "search",
        placeholder: options.searchPlaceholder || options.label,
        "aria-label": options.label,
        "aria-controls": popupId,
        "aria-autocomplete": "list",
      },
    });
  }
  // When searchable, options live in their own scroll container so the search box stays
  // fixed at the top (no sticky drift). Otherwise the panel itself scrolls.
  const optionsHost = searchable ? panel.createDiv({ cls: "db-dropdown-options" }) : panel;
  let currentSection = "";
  let currentSectionEl: HTMLElement | undefined;
  const sectionRows: DropdownRow[] = [];
  const emptyRow = optionsHost.createDiv({ cls: "db-dropdown-empty", text: t("dropdown.noResults"), attr: { role: "status", hidden: "true" } });
  let activeIndex = options.options.findIndex((option) => option.value === options.value && !option.disabled);
  if (activeIndex < 0) {
    activeIndex = options.options.findIndex((option) => !option.disabled);
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
    if (focus && row) {
      row.focus();
      row.scrollIntoView?.({ block: "nearest" });
    }
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
  for (const option of options.options) {
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
      const visibleRows = filterDropdownOptions(sectionRows, searchInput?.value || "", emptyRow);
      activeIndex = visibleRows.length ? sectionRows.indexOf(visibleRows[0]) : -1;
      syncActiveOption();
    };
    searchInput.onkeydown = (event) => {
      if (isImeComposing(event)) return;
      const visibleRows = getVisibleRows();
      if (event.key === "ArrowDown") {
        if (!visibleRows.length) return;
        event.preventDefault();
        syncActiveOption(true);
      } else if (event.key === "ArrowUp") {
        if (!visibleRows.length) return;
        event.preventDefault();
        activeIndex = sectionRows.indexOf(visibleRows[visibleRows.length - 1]);
        syncActiveOption(true);
      } else if (event.key === "Enter") {
        if (!visibleRows.length) return;
        event.preventDefault();
        selectRow(visibleRows[0]);
      }
    };
    window.setTimeout(() => searchInput?.focus(), 0);
  }
  positionToolbarPopover(panel, anchor, { preferredWidth: 280, maxWidth: 360, minWidth: 180, gap: 6 });
  if (!searchInput) {
    syncActiveOption(true);
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (isImeComposing(event) || event.target === searchInput) return;
    const target = event.target as HTMLElement | null;
    const currentRowIndex = target ? sectionRows.findIndex((item) => item.row === target) : -1;
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key) && event.key.length !== 1) return;
    const visibleRows = getVisibleRows();
    if (!visibleRows.length) return;
    if (currentRowIndex >= 0) activeIndex = currentRowIndex;
    const visibleIndex = visibleRows.findIndex((item) => sectionRows.indexOf(item) === activeIndex);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = Math.max(0, Math.min(visibleRows.length - 1, (visibleIndex < 0 ? 0 : visibleIndex) + delta));
      activeIndex = sectionRows.indexOf(visibleRows[next]);
      syncActiveOption(true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      activeIndex = sectionRows.indexOf(event.key === "Home" ? visibleRows[0] : visibleRows[visibleRows.length - 1]);
      syncActiveOption(true);
    } else if (event.key === "Enter" || event.key === " ") {
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
    if (typeaheadTimer !== undefined) window.clearTimeout(typeaheadTimer);
    removeAutoClose();
    anchor.removeAttribute("aria-controls");
    panel.remove();
  };
}

function getDropdownPopoverHost(anchor: HTMLElement): HTMLElement {
  if (anchor.closest(".note-database-settings, .note-database-modal")) return anchor.ownerDocument.body;
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

function filterDropdownOptions(
  rows: DropdownRow[],
  query: string,
  emptyRow?: HTMLElement,
): DropdownRow[] {
  const normalized = query.trim().toLowerCase();
  const visibleRows: DropdownRow[] = [];
  for (const item of rows) {
    const matches = !normalized || (item.row.getAttribute("data-search-text") || "").includes(normalized);
    item.row.toggleClass("is-hidden", !matches);
    if (matches && !item.row.disabled) visibleRows.push(item);
  }
  const sections = Array.from(new Set(rows.map((item) => item.section).filter((item): item is HTMLElement => item != null)));
  for (const section of sections) {
    const hasVisibleRow = rows.some((item) => item.section === section && !item.row.hasClass("is-hidden"));
    section.toggleClass("is-hidden", !hasVisibleRow);
  }
  if (emptyRow) emptyRow.toggleAttribute("hidden", visibleRows.length > 0);
  return visibleRows;
}
