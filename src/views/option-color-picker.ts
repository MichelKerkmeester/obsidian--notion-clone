// ───────────────────────────────────────────────────────────────────
// MODULE:    option-color-picker
// COMPONENT: floating swatch grid for picking a select/status option color
// ───────────────────────────────────────────────────────────────────
//
// Keyed by owner document rather than by anchor, since only one picker
// should ever be open per document (Obsidian's pop-out windows each get
// their own): opening a second picker in the same document closes the
// first instead of stacking. Arrow-key navigation is geometric (nearest
// swatch by row/column position) rather than index-based, so it stays
// correct if the swatch grid's column count ever changes.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { OPTION_COLORS } from "../data/column-types";
import { isImeComposing } from "../data/keyboard-utils";
import { StatusColor } from "../data/types";
import { t } from "../i18n";
import { createSheetHeader } from "./mobile-bottom-sheet";
import { installPopoverAutoClose } from "./popover-auto-close";
import { isMobileBottomSheet, positionToolbarPopover } from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. STATE
// ───────────────────────────────────────────────────────────────────

const activePickers = new WeakMap<Document, () => void>();

// ───────────────────────────────────────────────────────────────────
// 3. PUBLIC API
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
  activePickers.get(doc)?.();

  const picker = doc.body.createDiv({ cls: "db-color-picker-popup" });
  picker.setAttr("role", "grid");
  picker.setAttr("aria-label", t("menu.numberDisplayColorCustom"));
  picker.style.setProperty("color-scheme", "light dark");
  let closed = false;
  let removeAutoClose: (() => void) | undefined;
  const close = () => {
    if (closed) return;
    closed = true;
    removeAutoClose?.();
    picker.remove();
    if (activePickers.get(doc) === close) activePickers.delete(doc);
  };

  // Same "header everywhere" contract as the icon picker: a title-and-close row on a phone sheet,
  // absent from the small anchored swatch grid a desktop pointer sees. The swatches move into the
  // wrapper so the padded-row grammar has something structural to measure; the grid's own
  // flex/gap/width rules move with them, in `styles.css`'s sheet-scoped override, so the desktop
  // arithmetic in that stylesheet's own comment stays untouched.
  const content = isMobileBottomSheet(doc)
    ? (() => {
        createSheetHeader(picker, { title: title || t("conditionalFormat.color"), onClose: close });
        return picker.createDiv({ cls: "db-color-picker-body db-panel-row" });
      })()
    : picker;

  OPTION_COLORS.forEach((color, index) => {
    const swatch = content.createEl("button", {
      cls: `db-color-picker-swatch db-option-color-${color}${color === current ? " is-selected" : ""}`,
      attr: {
        type: "button",
        role: "gridcell",
        tabindex: index === Math.max(0, OPTION_COLORS.indexOf(current)) ? "0" : "-1",
        title: color,
        "aria-label": color,
        "aria-pressed": color === current ? "true" : "false",
      },
    });
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
    const next = getColorNavigationTarget(items, index, event.key);
    if (next == null) return;
    event.preventDefault();
    focusSwatch(items, next);
  };

  positionToolbarPopover(picker, anchor, { preferredWidth: 124, minWidth: 124, maxWidth: 124, gap: 4 });
  activePickers.set(doc, close);
  removeAutoClose = installPopoverAutoClose({ panel: picker, anchorEl: anchor, close });
  view.requestAnimationFrame(() => {
    const selected = picker.querySelector<HTMLButtonElement>(".db-color-picker-swatch.is-selected");
    (selected || picker.querySelector<HTMLButtonElement>(".db-color-picker-swatch"))?.focus({ preventScroll: true });
  });
  return close;
}

// ───────────────────────────────────────────────────────────────────
// 4. KEYBOARD NAVIGATION HELPERS
// ───────────────────────────────────────────────────────────────────

function focusSwatch(items: HTMLButtonElement[], index: number): void {
  items.forEach((item, itemIndex) => item.setAttr("tabindex", itemIndex === index ? "0" : "-1"));
  items[index]?.focus({ preventScroll: true });
}

function getColorNavigationTarget(items: HTMLButtonElement[], index: number, key: string): number | undefined {
  const current = items[index];
  if (!current) return undefined;
  const currentRect = current.getBoundingClientRect();
  const centers = items.map((item) => {
    const rect = item.getBoundingClientRect();
    return { item, rect, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  if (key === "ArrowLeft" || key === "ArrowRight") {
    const sameRow = centers
      .filter((candidate) => Math.abs(candidate.y - (currentRect.top + currentRect.height / 2)) < Math.max(8, currentRect.height))
      .sort((a, b) => a.x - b.x);
    const rowIndex = sameRow.findIndex((candidate) => candidate.item === current);
    const next = sameRow[rowIndex + (key === "ArrowLeft" ? -1 : 1)];
    return next ? items.indexOf(next.item) : undefined;
  }
  if (key !== "ArrowUp" && key !== "ArrowDown") return undefined;
  const direction = key === "ArrowUp" ? -1 : 1;
  const currentCenterY = currentRect.top + currentRect.height / 2;
  const candidates = centers
    .filter((candidate) => direction < 0 ? candidate.y < currentCenterY - 2 : candidate.y > currentCenterY + 2)
    .sort((a, b) => Math.abs(a.y - currentCenterY) - Math.abs(b.y - currentCenterY) || Math.abs(a.x - (currentRect.left + currentRect.width / 2)) - Math.abs(b.x - (currentRect.left + currentRect.width / 2)));
  return candidates[0] ? items.indexOf(candidates[0].item) : undefined;
}

// ───────────────────────────────────────────────────────────────────
// 5. CLOSE
// ───────────────────────────────────────────────────────────────────

/** Close the currently-open option color picker on `doc`, if any.
 *  Reuses the picker's own `close()` so its DOM node, event listeners, and
 *  `activePickers` entry are all cleaned up. Returns true if a picker was open. */
export function closeActiveOptionColorPicker(doc: Document): boolean {
  const close = activePickers.get(doc);
  if (!close) return false;
  close();
  return true;
}
