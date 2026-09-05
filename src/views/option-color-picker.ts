// ───────────────────────────────────────────────────────────────────
// MODULE:    option-color-picker
// COMPONENT: floating swatch grid for picking a select/status option color
// ───────────────────────────────────────────────────────────────────
//
// Registry, phone header and arrow-key grid navigation are the picker host's — only the swatch
// catalogue and its trailing tick are this file's own. A labelled list of named colours would read
// more clearly than a hue-only grid, but this grid already ships with a registered stacking pair
// and a phone counterpart depending on its shape, so it stays a grid and gains a tick and each
// swatch's own accessible name instead of a redesign nothing here asked for.

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
  getGridNavigationTarget,
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
  picker.setAttr("role", "grid");
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
  // popover keeps building swatches straight into the picker, exactly as before.
  const content = mountPickerSheetHeader(picker, doc, {
    title: title || t("conditionalFormat.color"),
    onClose: close,
    bodyCls: "db-color-picker-body db-panel-row",
  });

  OPTION_COLORS.forEach((color, index) => {
    const swatch = content.createEl("button", {
      cls: `db-color-picker-swatch db-option-color-${color}${color === current ? " is-selected" : ""}`,
      attr: {
        type: "button",
        role: "gridcell",
        tabindex: index === Math.max(0, OPTION_COLORS.indexOf(current)) ? "0" : "-1",
        title: color,
        // The colour's own name, not just its hue, so the current swatch reads correctly to a
        // screen reader and the choice is never colour-only.
        "aria-label": color,
        "aria-pressed": color === current ? "true" : "false",
      },
    });
    // A ring around the selected swatch is still one hue standing in for another, which a viewer
    // who cannot distinguish the two colours cannot use. The icon gives the same state a shape.
    if (color === current) setIcon(swatch, "check");
    swatch.onclick = (event) => {
      event.stopPropagation();
      onSelect(color);
      close();
    };
  });
  picker.onkeydown = (event) => {
    if (isImeComposing(event)) return;
    const target = event.target as HTMLElement | null;
    const currentSwatch = target?.closest<HTMLButtonElement>(".db-color-picker-swatch");
    if (!currentSwatch) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      currentSwatch.click();
      return;
    }
    const items = Array.from(picker.querySelectorAll<HTMLButtonElement>(".db-color-picker-swatch"));
    const index = items.indexOf(currentSwatch);
    if (index < 0) return;
    if (event.key === "Home") {
      event.preventDefault();
      focusSwatch(items, 0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusSwatch(items, items.length - 1);
      return;
    }
    const next = getGridNavigationTarget(items, index, event.key);
    if (next == null) return;
    event.preventDefault();
    focusSwatch(items, next);
  };

  positionToolbarPopover(picker, anchor, { ...SWATCH_PICKER_POPOVER, gap: 4 });
  setActivePicker(doc, entry);
  removeAutoClose = installPopoverAutoClose({ panel: picker, anchorEl: anchor, close });
  view.requestAnimationFrame(() => {
    const selected = picker.querySelector<HTMLButtonElement>(".db-color-picker-swatch.is-selected");
    (selected || picker.querySelector<HTMLButtonElement>(".db-color-picker-swatch"))?.focus({ preventScroll: true });
  });
  return close;
}

// ───────────────────────────────────────────────────────────────────
// 3. KEYBOARD NAVIGATION HELPER
// ───────────────────────────────────────────────────────────────────

function focusSwatch(items: HTMLButtonElement[], index: number): void {
  items.forEach((item, itemIndex) => item.setAttr("tabindex", itemIndex === index ? "0" : "-1"));
  items[index]?.focus({ preventScroll: true });
}

// ───────────────────────────────────────────────────────────────────
// 4. CLOSE
// ───────────────────────────────────────────────────────────────────

/** Close whichever picker family member is open on `doc`, if any — the colour picker included,
 *  since the three pickers now share one active-picker slot per document and only one of them is
 *  ever open at a time. Reuses the picker's own `close()` so its DOM node, event listeners, and the
 *  registry's entry are all cleaned up. Returns true if a picker was open. */
export function closeActiveOptionColorPicker(doc: Document): boolean {
  return closeActivePicker(doc);
}
