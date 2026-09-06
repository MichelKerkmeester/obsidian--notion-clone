// ───────────────────────────────────────────────────────────────────
// MODULE:    option-color-picker
// COMPONENT: labelled list for picking a select/status option color
// ───────────────────────────────────────────────────────────────────
//
// Registry and the phone header are the picker host's — the row catalogue and its trailing tick
// are this file's own. A one-column labelled list, built from the family's own `.db-dropdown-
// option` row, replaces the unlabelled swatch grid this file used to build: the palette is
// sixteen colours, several pairs of which sit under a CIE76 ΔE of 10 in at least one theme, so a
// grid asked the user to tell two near-identical hues apart with no other signal. The
// name is that signal, and it is why this is a list rather than a wider grid.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { OPTION_COLORS } from "../data/column-types";
import { isImeComposing } from "../data/keyboard-utils";
import { StatusColor } from "../data/types";
import { t } from "../i18n";
import { installPopoverAutoClose } from "./popover-auto-close";
import { positionToolbarPopover } from "./popover-position";
import {
  clearActivePickerIfCurrent,
  closeActivePicker,
  mountPickerSheetHeader,
  setActivePicker,
  SWATCH_PICKER_POPOVER,
  type ActivePicker,
} from "./popover-host";

// ───────────────────────────────────────────────────────────────────
// 2. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function openOptionColorPicker(
  anchor: HTMLElement,
  current: StatusColor,
  onSelect: (color: StatusColor) => void,
  /** Sheet-header title on a phone — the option or rule the colour belongs to. */
  title?: string,
): () => void {
  const doc = anchor.ownerDocument;
  const view = doc.defaultView || window;
  closeActivePicker(doc);

  const picker = doc.body.createDiv({ cls: "db-color-picker-popup" });
  picker.setAttr("role", "listbox");
  picker.setAttr("aria-label", t("menu.numberDisplayColorCustom"));
  picker.style.setProperty("color-scheme", "light dark");
  let closed = false;
  let removeAutoClose: (() => void) | undefined;
  let entry: ActivePicker;
  const close = () => {
    if (closed) return;
    closed = true;
    removeAutoClose?.();
    picker.remove();
    clearActivePickerIfCurrent(doc, entry);
  };
  entry = { anchor, close };

  // The padded-row grammar needs somewhere structural to measure on a phone sheet; the desktop
  // popover keeps building rows straight into the picker, exactly as before.
  const content = mountPickerSheetHeader(picker, doc, {
    title: title || t("conditionalFormat.color"),
    onClose: close,
    bodyCls: "db-color-picker-body db-panel-row",
  });

  const rows: HTMLButtonElement[] = [];
  let activeIndex = Math.max(0, OPTION_COLORS.indexOf(current));

  OPTION_COLORS.forEach((color, index) => {
    const row = content.createEl("button", {
      cls: `db-dropdown-option db-menu-item${color === current ? " is-selected" : ""}`,
      attr: {
        type: "button",
        role: "option",
        "aria-selected": color === current ? "true" : "false",
        tabindex: index === activeIndex ? "0" : "-1",
      },
    });
    row.createSpan({ cls: `db-color-picker-row-dot db-option-color-${color}`, attr: { "aria-hidden": "true" } });
    // The visible name IS the accessible name here — nothing duplicates it into a `title` or a
    // raw `aria-label`, which is what let the old grid ship the enum value itself as text.
    row.createSpan({ cls: "db-dropdown-option-label db-menu-item-label", text: t(`optionColor.${color}`) });
    const check = row.createSpan({ cls: "db-dropdown-option-check db-menu-item-check" });
    if (color === current) setIcon(check, "check");
    row.onclick = (event) => {
      event.stopPropagation();
      onSelect(color);
      close();
    };
    rows.push(row);
  });

  // A one-column list needs no geometric grid navigation — `getGridNavigationTarget` measured
  // on-screen position for a grid whose column count could change with its width. Every row here
  // is the same shape, so Up/Down/Home/End move by index, the family's own list model.
  const focusRow = (index: number): void => {
    activeIndex = index;
    for (const [rowIndex, row] of rows.entries()) row.setAttr("tabindex", rowIndex === index ? "0" : "-1");
    rows[index]?.focus({ preventScroll: true });
    rows[index]?.scrollIntoView?.({ block: "nearest" });
  };

  picker.onkeydown = (event) => {
    if (isImeComposing(event)) return;
    const target = event.target as HTMLElement | null;
    const currentRow = target?.closest<HTMLButtonElement>(".db-dropdown-option");
    if (!currentRow) return;
    const index = rows.indexOf(currentRow);
    if (index < 0) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      currentRow.click();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusRow(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusRow(rows.length - 1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusRow(Math.min(rows.length - 1, index + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusRow(Math.max(0, index - 1));
    }
  };

  positionToolbarPopover(picker, anchor, { ...SWATCH_PICKER_POPOVER, gap: 4 });
  setActivePicker(doc, entry);
  removeAutoClose = installPopoverAutoClose({ panel: picker, anchorEl: anchor, close });
  view.requestAnimationFrame(() => {
    const selected = rows[activeIndex] ?? rows[0];
    selected?.focus({ preventScroll: true });
    // The panel can open scrolled to its top on a long phone sheet — sixteen 44px rows against a
    // capped viewport — so the current colour has to be brought into view rather than assumed
    // visible.
    selected?.scrollIntoView?.({ block: "nearest" });
  });
  return close;
}

// ───────────────────────────────────────────────────────────────────
// 3. CLOSE
// ───────────────────────────────────────────────────────────────────

/** Close whichever picker family member is open on `doc`, if any — the colour picker included,
 *  since the three pickers now share one active-picker slot per document and only one of them is
 *  ever open at a time. Reuses the picker's own `close()` so its DOM node, event listeners, and the
 *  registry's entry are all cleaned up. Returns true if a picker was open. */
export function closeActiveOptionColorPicker(doc: Document): boolean {
  return closeActivePicker(doc);
}
