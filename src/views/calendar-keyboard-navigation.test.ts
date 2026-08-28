// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-keyboard-navigation.test
// COMPONENT: unit tests for the shared calendar grid keyboard-navigation helpers
// ───────────────────────────────────────────────────────────────────
//
// FakeElement is a minimal DOM stand-in (attributes, listeners, closest,
// querySelectorAll) so the grid-wiring tests can dispatch real keydown
// events without pulling in jsdom just for this one module.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import {
  attachCalendarGridKeyboard,
  focusCalendarCell,
  getCalendarGridNavTarget,
} from "./calendar-keyboard-navigation";

// ───────────────────────────────────────────────────────────────────
// 2. TEST FIXTURE
// ───────────────────────────────────────────────────────────────────

class FakeElement {
  private attributes = new Map<string, string>();
  private listeners = new Map<string, Set<(event: unknown) => void>>();
  public focus = vi.fn();
  public scrollIntoView = vi.fn();
  public children: FakeElement[] = [];
  public parent: FakeElement | null = null;

  constructor(public tagName = "DIV", public className = "") {}

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  addEventListener(type: string, handler: (event: unknown) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  dispatchEvent(event: { type: string; [key: string]: unknown }): boolean {
    const set = this.listeners.get(event.type);
    if (set) {
      for (const handler of set) handler(event);
    }
    return true;
  }

  closest(selector: string): FakeElement | null {
    if (selector.includes(this.className) && this.className !== "") return this;
    if (selector.toLowerCase() === this.tagName.toLowerCase()) return this;
    return this.parent ? this.parent.closest(selector) : null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const results: FakeElement[] = [];
    const search = (node: FakeElement) => {
      for (const child of node.children) {
        if (selector.includes(child.className) && child.className !== "") {
          results.push(child);
        }
        search(child);
      }
    };
    search(this);
    return results;
  }

  appendChild(child: FakeElement): void {
    child.parent = this;
    this.children.push(child);
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("CalendarKeyboardNavigation", () => {
  describe("getCalendarGridNavTarget", () => {
    it("moves left and right by 1 within bounds", () => {
      expect(getCalendarGridNavTarget({ currentIndex: 5, totalCount: 35, columns: 7, key: "ArrowLeft" })).toEqual({
        type: "index",
        index: 4,
      });
      expect(getCalendarGridNavTarget({ currentIndex: 5, totalCount: 35, columns: 7, key: "ArrowRight" })).toEqual({
        type: "index",
        index: 6,
      });
      expect(getCalendarGridNavTarget({ currentIndex: 0, totalCount: 35, columns: 7, key: "ArrowLeft" })).toBeNull();
      expect(getCalendarGridNavTarget({ currentIndex: 34, totalCount: 35, columns: 7, key: "ArrowRight" })).toBeNull();
    });

    it("moves up and down by column count (7 for month grid)", () => {
      expect(getCalendarGridNavTarget({ currentIndex: 10, totalCount: 35, columns: 7, key: "ArrowUp" })).toEqual({
        type: "index",
        index: 3,
      });
      expect(getCalendarGridNavTarget({ currentIndex: 10, totalCount: 35, columns: 7, key: "ArrowDown" })).toEqual({
        type: "index",
        index: 17,
      });
      expect(getCalendarGridNavTarget({ currentIndex: 3, totalCount: 35, columns: 7, key: "ArrowUp" })).toBeNull();
      expect(getCalendarGridNavTarget({ currentIndex: 30, totalCount: 35, columns: 7, key: "ArrowDown" })).toBeNull();
    });

    it("moves to Home (row start) and End (row end)", () => {
      // index 10 in 7-col grid: row 1 (indices 7..13)
      expect(getCalendarGridNavTarget({ currentIndex: 10, totalCount: 35, columns: 7, key: "Home" })).toEqual({
        type: "index",
        index: 7,
      });
      expect(getCalendarGridNavTarget({ currentIndex: 10, totalCount: 35, columns: 7, key: "End" })).toEqual({
        type: "index",
        index: 13,
      });
      // last row with partial elements
      expect(getCalendarGridNavTarget({ currentIndex: 31, totalCount: 33, columns: 7, key: "End" })).toEqual({
        type: "index",
        index: 32,
      });
    });

    it("returns pagination actions for PageUp and PageDown", () => {
      expect(getCalendarGridNavTarget({ currentIndex: 10, totalCount: 35, columns: 7, key: "PageUp" })).toEqual({
        type: "prev-page",
      });
      expect(getCalendarGridNavTarget({ currentIndex: 10, totalCount: 35, columns: 7, key: "PageDown" })).toEqual({
        type: "next-page",
      });
    });

    it("returns null for non-navigation keys or invalid bounds", () => {
      expect(getCalendarGridNavTarget({ currentIndex: 10, totalCount: 35, columns: 7, key: "a" })).toBeNull();
      expect(getCalendarGridNavTarget({ currentIndex: -1, totalCount: 35, columns: 7, key: "ArrowRight" })).toBeNull();
      expect(getCalendarGridNavTarget({ currentIndex: 0, totalCount: 0, columns: 7, key: "ArrowRight" })).toBeNull();
    });
  });

  describe("focusCalendarCell", () => {
    it("updates roving tabindex and invokes focus", () => {
      const cell1 = new FakeElement("DIV", "cell");
      const cell2 = new FakeElement("DIV", "cell");
      const cell3 = new FakeElement("DIV", "cell");
      const cells = [cell1, cell2, cell3] as unknown as HTMLElement[];

      focusCalendarCell(cells, 1);
      expect(cell1.getAttribute("tabindex")).toBe("-1");
      expect(cell2.getAttribute("tabindex")).toBe("0");
      expect(cell3.getAttribute("tabindex")).toBe("-1");
      expect(cell2.focus).toHaveBeenCalled();
      expect(cell2.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    });
  });

  describe("attachCalendarGridKeyboard", () => {
    it("handles arrow navigation and invokes callbacks", () => {
      const grid = new FakeElement("DIV", "grid");
      const cell0 = new FakeElement("DIV", "cell");
      cell0.setAttribute("data-date-key", "2026-08-01");
      const cell1 = new FakeElement("DIV", "cell");
      cell1.setAttribute("data-date-key", "2026-08-02");
      grid.appendChild(cell0);
      grid.appendChild(cell1);

      const onSelectDate = vi.fn();
      const onPreviousPage = vi.fn();
      const onNextPage = vi.fn();

      attachCalendarGridKeyboard({
        grid: grid as unknown as HTMLElement,
        cellSelector: "cell",
        columns: 7,
        onSelectDate,
        onPreviousPage,
        onNextPage,
      });

      const preventDefault = vi.fn();

      // Right arrow from cell0 -> cell1
      grid.dispatchEvent({
        type: "keydown",
        key: "ArrowRight",
        target: cell0,
        isComposing: false,
        preventDefault,
      });
      expect(preventDefault).toHaveBeenCalled();
      expect(cell1.getAttribute("tabindex")).toBe("0");
      expect(cell1.focus).toHaveBeenCalled();

      // Enter on cell1 -> triggers onSelectDate
      grid.dispatchEvent({
        type: "keydown",
        key: "Enter",
        target: cell1,
        isComposing: false,
        preventDefault,
      });
      expect(onSelectDate).toHaveBeenCalledWith("2026-08-02");

      // PageUp -> triggers onPreviousPage
      grid.dispatchEvent({
        type: "keydown",
        key: "PageUp",
        target: cell1,
        isComposing: false,
        preventDefault,
      });
      expect(onPreviousPage).toHaveBeenCalled();

      // PageDown -> triggers onNextPage
      grid.dispatchEvent({
        type: "keydown",
        key: "PageDown",
        target: cell1,
        isComposing: false,
        preventDefault,
      });
      expect(onNextPage).toHaveBeenCalled();
    });

    it("ignores keydown during IME composition", () => {
      const grid = new FakeElement("DIV", "grid");
      const cell0 = new FakeElement("DIV", "cell");
      grid.appendChild(cell0);

      const onSelectDate = vi.fn();
      attachCalendarGridKeyboard({
        grid: grid as unknown as HTMLElement,
        cellSelector: "cell",
        columns: 7,
        onSelectDate,
      });

      const preventDefault = vi.fn();
      grid.dispatchEvent({
        type: "keydown",
        key: "Enter",
        target: cell0,
        isComposing: true,
        preventDefault,
      });
      expect(preventDefault).not.toHaveBeenCalled();
      expect(onSelectDate).not.toHaveBeenCalled();
    });
  });
});
