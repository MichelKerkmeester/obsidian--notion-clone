// ───────────────────────────────────────────────────────────────────
// MODULE:    card-roving-tabindex.test
// COMPONENT: unit tests for the shared card roving-tabindex controller
// ───────────────────────────────────────────────────────────────────
//
// Covers the two-level WAI-ARIA nested-widget pattern end to end (card
// level, then Enter/F2 into field level, then Escape back out) since that
// state machine is the part most likely to regress silently — the pure
// index-math helpers are the easy part to get right.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import {
  CardRovingController,
  getNextBoardRovingIndex,
  getNextLinearRovingIndex,
  isRovingNavigationKey,
  setRovingTabindex,
  syncCardRoving,
  wireCardKeyboard,
} from "./card-roving-tabindex";

// ───────────────────────────────────────────────────────────────────
// 2. TEST FIXTURE
// ───────────────────────────────────────────────────────────────────

class FakeElement {
  private attributes = new Map<string, string>();
  private listeners = new Map<string, Set<(event: unknown) => void>>();
  public focus = vi.fn();
  public children: FakeElement[] = [];
  public parent: FakeElement | null = null;

  constructor(public className = "", public tagName = "div") {}

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  addEventListener(type: string, handler: (event: unknown) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: (event: unknown) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  dispatchEvent(event: { type: string; [key: string]: unknown }): boolean {
    const set = this.listeners.get(event.type);
    if (set) {
      for (const handler of set) handler(event);
    }
    return true;
  }

  contains(target: unknown): boolean {
    if (target === this) return true;
    return this.children.some((child) => child.contains(target));
  }

  closest(selector: string): FakeElement | null {
    if (selector.includes("input") && (this.className === "input" || this.tagName === "input")) return this;
    if (selector.includes(".db-cell-editing") && this.className.includes("db-cell-editing")) return this;
    return this.parent ? this.parent.closest(selector) : null;
  }

  appendChild(child: FakeElement): FakeElement {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const results: FakeElement[] = [];
    for (const child of this.children) {
      if (child.matchesSelector(selector)) results.push(child);
      results.push(...child.querySelectorAll(selector));
    }
    return results;
  }

  querySelector(selector: string): FakeElement | null {
    for (const child of this.children) {
      if (child.matchesSelector(selector)) return child;
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  private matchesSelector(selector: string): boolean {
    const parts = selector.split(",").map((s) => s.trim());
    return parts.some((p) => {
      if (p.startsWith(".")) {
        const cls = p.slice(1).replace(/\[.*\]/, "");
        if (this.className.includes(cls)) {
          if (p.includes("[tabindex]")) return this.hasAttribute("tabindex");
          return true;
        }
      }
      if (p.startsWith("[") && p.includes("]")) {
        const attr = p.slice(1, p.indexOf("]"));
        return this.hasAttribute(attr);
      }
      return false;
    });
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("CardRovingTabindex pure helpers", () => {
  it("identifies roving navigation keys", () => {
    expect(isRovingNavigationKey("ArrowDown")).toBe(true);
    expect(isRovingNavigationKey("ArrowUp")).toBe(true);
    expect(isRovingNavigationKey("ArrowLeft")).toBe(true);
    expect(isRovingNavigationKey("ArrowRight")).toBe(true);
    expect(isRovingNavigationKey("Home")).toBe(true);
    expect(isRovingNavigationKey("End")).toBe(true);
    expect(isRovingNavigationKey("Enter")).toBe(false);
    expect(isRovingNavigationKey(" ")).toBe(false);
    expect(isRovingNavigationKey("Tab")).toBe(false);
  });

  it("calculates 1D linear roving index movement", () => {
    const total = 5;
    expect(getNextLinearRovingIndex(0, total, "ArrowDown")).toBe(1);
    expect(getNextLinearRovingIndex(0, total, "ArrowRight")).toBe(1);
    expect(getNextLinearRovingIndex(1, total, "ArrowUp")).toBe(0);
    expect(getNextLinearRovingIndex(1, total, "ArrowLeft")).toBe(0);
    expect(getNextLinearRovingIndex(0, total, "ArrowUp")).toBe(0);
    expect(getNextLinearRovingIndex(4, total, "ArrowDown")).toBe(4);
    expect(getNextLinearRovingIndex(2, total, "Home")).toBe(0);
    expect(getNextLinearRovingIndex(2, total, "End")).toBe(4);
    expect(getNextLinearRovingIndex(0, 0, "ArrowDown")).toBe(-1);
  });

  it("calculates 2D board roving index across columns and rows", () => {
    // Column 0: cards [0, 1, 2]
    // Column 1: cards [3, 4]
    // Column 2: cards [5, 6, 7]
    const columns = [
      [0, 1, 2],
      [3, 4],
      [5, 6, 7],
    ];

    // Vertical navigation in column 0
    expect(getNextBoardRovingIndex(columns, 0, "ArrowDown")).toBe(1);
    expect(getNextBoardRovingIndex(columns, 1, "ArrowDown")).toBe(2);
    expect(getNextBoardRovingIndex(columns, 2, "ArrowDown")).toBe(2);
    expect(getNextBoardRovingIndex(columns, 2, "ArrowUp")).toBe(1);
    expect(getNextBoardRovingIndex(columns, 0, "ArrowUp")).toBe(0);

    // Horizontal navigation between columns
    expect(getNextBoardRovingIndex(columns, 0, "ArrowRight")).toBe(3); // col 0 row 0 -> col 1 row 0
    expect(getNextBoardRovingIndex(columns, 2, "ArrowRight")).toBe(4); // col 0 row 2 -> col 1 row 1 (clamped to max row in col 1)
    expect(getNextBoardRovingIndex(columns, 4, "ArrowRight")).toBe(6); // col 1 row 1 -> col 2 row 1
    expect(getNextBoardRovingIndex(columns, 6, "ArrowLeft")).toBe(4); // col 2 row 1 -> col 1 row 1
    expect(getNextBoardRovingIndex(columns, 0, "ArrowLeft")).toBe(0); // col 0 -> clamped left
    expect(getNextBoardRovingIndex(columns, 5, "ArrowRight")).toBe(5); // col 2 -> clamped right

    // Home / End
    expect(getNextBoardRovingIndex(columns, 4, "Home")).toBe(0);
    expect(getNextBoardRovingIndex(columns, 4, "End")).toBe(7);
  });

  it("skips empty columns when navigating the 2D board roving set", () => {
    const columns = [
      [0, 1],
      [],
      [2, 3],
    ];

    expect(getNextBoardRovingIndex(columns, 0, "ArrowRight")).toBe(2);
    expect(getNextBoardRovingIndex(columns, 3, "ArrowLeft")).toBe(1);
    expect(getNextBoardRovingIndex(columns, 1, "Home")).toBe(0);
    expect(getNextBoardRovingIndex(columns, 1, "End")).toBe(3);
    expect(getNextBoardRovingIndex(columns, 2, "ArrowDown")).toBe(3);
  });

  it("falls back to linear navigation when the active card is not in the column map", () => {
    const columns = [[0], [1]];

    expect(getNextBoardRovingIndex(columns, 99, "ArrowRight")).toBe(1);
    expect(getNextBoardRovingIndex(columns, 99, "ArrowLeft")).toBe(0);
  });

  it("sets roving tabindex so only the active element has 0 and others have -1", () => {
    const el1 = new FakeElement() as unknown as HTMLElement;
    const el2 = new FakeElement() as unknown as HTMLElement;
    const el3 = new FakeElement() as unknown as HTMLElement;
    const elements = [el1, el2, el3];

    setRovingTabindex(elements, 1);
    expect(el1.getAttribute("tabindex")).toBe("-1");
    expect(el2.getAttribute("tabindex")).toBe("0");
    expect(el3.getAttribute("tabindex")).toBe("-1");

    setRovingTabindex(elements, 0);
    expect(el1.getAttribute("tabindex")).toBe("0");
    expect(el2.getAttribute("tabindex")).toBe("-1");
    expect(el3.getAttribute("tabindex")).toBe("-1");
  });
});

describe("CardRovingController", () => {
  function createCardElement(index: number): FakeElement {
    const card = new FakeElement("db-card-mock");
    card.setAttribute("data-index", String(index));
    return card;
  }

  function createFieldElement(key: string): FakeElement {
    const field = new FakeElement("db-card-field");
    field.setAttribute("data-note-database-column-key", key);
    field.setAttribute("tabindex", "-1");
    field.setAttribute("role", "gridcell");
    return field;
  }

  it("synchronizes tabindex across registered cards and updates on focusin without index param", () => {
    const controller = new CardRovingController();
    const cards = [createCardElement(0), createCardElement(1), createCardElement(2)];
    const htmlCards = cards as unknown as HTMLElement[];

    htmlCards.forEach((card) => controller.attachCard(card));
    controller.setCards(htmlCards);

    expect(cards[0].getAttribute("tabindex")).toBe("0");
    expect(cards[1].getAttribute("tabindex")).toBe("-1");
    expect(cards[2].getAttribute("tabindex")).toBe("-1");

    // Simulate focusin on card 2
    cards[2].dispatchEvent({ type: "focusin" });
    expect(controller.getActiveIndex()).toBe(2);
    expect(cards[0].getAttribute("tabindex")).toBe("-1");
    expect(cards[1].getAttribute("tabindex")).toBe("-1");
    expect(cards[2].getAttribute("tabindex")).toBe("0");
  });

  it("handles keyboard navigation between cards and updates focus", () => {
    const controller = new CardRovingController();
    const cards = [createCardElement(0), createCardElement(1), createCardElement(2)];
    const htmlCards = cards as unknown as HTMLElement[];

    htmlCards.forEach((card) => controller.attachCard(card));
    controller.setCards(htmlCards);

    const event = {
      key: "ArrowDown",
      target: cards[0],
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;

    const handled = controller.handleKeydown(event);
    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(controller.getActiveIndex()).toBe(1);
    expect(cards[1].focus).toHaveBeenCalled();
    expect(cards[1].getAttribute("tabindex")).toBe("0");
    expect(cards[0].getAttribute("tabindex")).toBe("-1");
  });

  it("supports two-level roving tabindex (WAI-ARIA nested-widget pattern)", () => {
    const controller = new CardRovingController();
    const card0 = createCardElement(0);
    const field0 = createFieldElement("title");
    const field1 = createFieldElement("status");
    const field2 = createFieldElement("priority");
    card0.appendChild(field0);
    card0.appendChild(field1);
    card0.appendChild(field2);

    const card1 = createCardElement(1);
    const htmlCards = [card0, card1] as unknown as HTMLElement[];
    htmlCards.forEach((c) => controller.attachCard(c));
    controller.setCards(htmlCards);

    // 1. Enter or F2 on card enters nested level and focuses first field
    const enterOnCardEvent = {
      key: "Enter",
      target: card0,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;

    expect(controller.handleKeydown(enterOnCardEvent)).toBe(true);
    expect(field0.focus).toHaveBeenCalledTimes(1);

    // 2. ArrowDown moves between fields inside the card
    const arrowDownOnFieldEvent = {
      key: "ArrowDown",
      target: field0,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;

    expect(controller.handleKeydown(arrowDownOnFieldEvent)).toBe(true);
    expect(field1.focus).toHaveBeenCalledTimes(1);

    // 3. ArrowUp moves backwards between fields
    const arrowUpOnFieldEvent = {
      key: "ArrowUp",
      target: field1,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;

    expect(controller.handleKeydown(arrowUpOnFieldEvent)).toBe(true);
    expect(field0.focus).toHaveBeenCalledTimes(2);

    // 4. End moves to last field, Home moves to first field
    const endOnFieldEvent = {
      key: "End",
      target: field0,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    expect(controller.handleKeydown(endOnFieldEvent)).toBe(true);
    expect(field2.focus).toHaveBeenCalledTimes(1);

    const homeOnFieldEvent = {
      key: "Home",
      target: field2,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    expect(controller.handleKeydown(homeOnFieldEvent)).toBe(true);
    expect(field0.focus).toHaveBeenCalledTimes(3);

    // 5. Enter/Space on a focused field returns false so field edit runs
    const enterOnFieldEvent = {
      key: "Enter",
      target: field0,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    expect(controller.handleKeydown(enterOnFieldEvent)).toBe(false);

    const spaceOnFieldEvent = {
      key: " ",
      target: field0,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    expect(controller.handleKeydown(spaceOnFieldEvent)).toBe(false);

    // 6. Escape exits back to parent card
    const escapeOnFieldEvent = {
      key: "Escape",
      target: field0,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    expect(controller.handleKeydown(escapeOnFieldEvent)).toBe(true);
    expect(card0.focus).toHaveBeenCalledTimes(1);
  });

  it("restores focus to active card on re-render when focus was inside view", () => {
    const controller = new CardRovingController();
    const card0 = createCardElement(0);
    const card1 = createCardElement(1);
    const htmlCards = [card0, card1] as unknown as HTMLElement[];
    htmlCards.forEach((c) => controller.attachCard(c));
    controller.setCards(htmlCards);

    // Focus on card 1
    card1.dispatchEvent({ type: "focusin" });
    expect(controller.getActiveIndex()).toBe(1);

    // Re-render: new card elements created
    const newCard0 = createCardElement(0);
    const newCard1 = createCardElement(1);
    const newHtmlCards = [newCard0, newCard1] as unknown as HTMLElement[];
    newHtmlCards.forEach((c) => controller.attachCard(c));

    controller.setCards(newHtmlCards);
    // Active index is preserved and active card is re-focused
    expect(controller.getActiveIndex()).toBe(1);
    expect(newCard1.focus).toHaveBeenCalled();
  });

  it("ignores keydown during IME composition", () => {
    const controller = new CardRovingController();
    const cards = [createCardElement(0), createCardElement(1)];
    const htmlCards = cards as unknown as HTMLElement[];
    controller.setCards(htmlCards);

    const event = {
      key: "ArrowDown",
      target: cards[0],
      isComposing: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;

    expect(controller.handleKeydown(event)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(controller.getActiveIndex()).toBe(0);
  });

  it("ignores keydown when focus is inside an active text/cell editor", () => {
    const controller = new CardRovingController();
    const card = createCardElement(0);
    const input = new FakeElement("input");
    card.appendChild(input);
    const htmlCards = [card] as unknown as HTMLElement[];
    controller.setCards(htmlCards);

    const event = {
      key: "ArrowDown",
      target: input,
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;

    expect(controller.handleKeydown(event)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("wires card keydown and roving via shared helpers", () => {
    const controller = new CardRovingController();
    const container = new FakeElement("db-board");
    const card = createCardElement(0);
    container.appendChild(card);

    const onActivate = vi.fn();
    wireCardKeyboard({
      card: card as unknown as HTMLElement,
      rovingController: controller,
      onActivate,
    });

    const syncedCards = syncCardRoving(container as unknown as HTMLElement, controller, ".db-card-mock");
    expect(syncedCards).toHaveLength(1);

    // Space on card triggers onActivate
    card.dispatchEvent({
      type: "keydown",
      key: " ",
      isComposing: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: card,
    });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});
