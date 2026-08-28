// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-keyboard-navigation
// COMPONENT: shared roving-grid keyboard navigation for calendar day cells
// ───────────────────────────────────────────────────────────────────
//
// The index math is pure and grid-shape agnostic (columns is a parameter,
// not hardcoded to 7) so the month grid and the mini-calendar's day/month/
// year grids can all drive it without duplicating arrow/Home/End/PageUp
// logic three times.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isImeComposing } from "../data/keyboard-utils";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export type CalendarGridNavAction =
  | { type: "index"; index: number }
  | { type: "prev-page" }
  | { type: "next-page" };

export interface CalendarGridNavOptions {
  currentIndex: number;
  totalCount: number;
  columns: number;
  key: string;
}

// ───────────────────────────────────────────────────────────────────
// 3. GRID NAVIGATION
// ───────────────────────────────────────────────────────────────────

/**
 * Calculates the next target cell index or pagination action for keyboard grid navigation.
 * Uses standard grid keyboard navigation (Arrow keys, Home/End, PageUp/PageDown).
 */
export function getCalendarGridNavTarget(options: CalendarGridNavOptions): CalendarGridNavAction | null {
  const { currentIndex, totalCount, columns, key } = options;
  if (totalCount <= 0 || columns <= 0) return null;
  if (currentIndex < 0 || currentIndex >= totalCount) return null;

  if (key === "PageUp") return { type: "prev-page" };
  if (key === "PageDown") return { type: "next-page" };

  let nextIndex: number | undefined;
  if (key === "ArrowLeft") nextIndex = currentIndex - 1;
  else if (key === "ArrowRight") nextIndex = currentIndex + 1;
  else if (key === "ArrowUp") nextIndex = currentIndex - columns;
  else if (key === "ArrowDown") nextIndex = currentIndex + columns;
  else if (key === "Home") nextIndex = currentIndex - (currentIndex % columns);
  else if (key === "End") nextIndex = Math.min(totalCount - 1, currentIndex + (columns - 1 - (currentIndex % columns)));

  if (nextIndex == null || nextIndex < 0 || nextIndex >= totalCount) return null;
  return { type: "index", index: nextIndex };
}

/**
 * Updates roving tabindex for a collection of cells and moves focus to the active cell.
 */
export function focusCalendarCell(cells: HTMLElement[], index: number): void {
  if (index < 0 || index >= cells.length) return;
  cells.forEach((cell, cellIndex) => {
    cell.setAttribute("tabindex", cellIndex === index ? "0" : "-1");
  });
  const target = cells[index];
  if (target) {
    target.focus();
    target.scrollIntoView?.({ block: "nearest" });
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. KEYBOARD WIRING
// ───────────────────────────────────────────────────────────────────

/**
 * Attaches roving grid keyboard navigation to a calendar grid container.
 */
export function attachCalendarGridKeyboard(options: {
  grid: HTMLElement;
  cellSelector: string;
  columns: number;
  onSelectDate?(dateKey: string): void;
  onPreviousPage?(): void;
  onNextPage?(): void;
}): void {
  const { grid, cellSelector, columns, onSelectDate, onPreviousPage, onNextPage } = options;

  grid.addEventListener("keydown", (event: KeyboardEvent) => {
    if (isImeComposing(event)) return;
    const target = event.target as HTMLElement | null;
    const cells = Array.from(grid.querySelectorAll<HTMLElement>(cellSelector));
    const cell = target?.closest<HTMLElement>(cellSelector);
    const index = cell ? cells.indexOf(cell) : -1;
    if (index < 0) return;

    if (event.key === "Enter" || event.key === " ") {
      // Allow native activation for interactive buttons nested within the cell
      if (target && target !== cell && (target.tagName === "BUTTON" || target.closest("button"))) {
        return;
      }
      event.preventDefault();
      const dateKey = cell?.getAttribute("data-date-key");
      if (dateKey && onSelectDate) {
        onSelectDate(dateKey);
      }
      return;
    }

    const action = getCalendarGridNavTarget({
      currentIndex: index,
      totalCount: cells.length,
      columns,
      key: event.key,
    });

    if (!action) return;
    event.preventDefault();

    if (action.type === "prev-page") {
      onPreviousPage?.();
      return;
    }
    if (action.type === "next-page") {
      onNextPage?.();
      return;
    }
    if (action.type === "index") {
      focusCalendarCell(cells, action.index);
    }
  });
}
