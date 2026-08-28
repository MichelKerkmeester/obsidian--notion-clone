import { isImeComposing } from "../data/KeyboardUtils";
import { isHTMLElement } from "./DomGuards";

export type RovingNavigationKey = "ArrowDown" | "ArrowUp" | "ArrowLeft" | "ArrowRight" | "Home" | "End";

export function isRovingNavigationKey(key: string): key is RovingNavigationKey {
  return (
    key === "ArrowDown" ||
    key === "ArrowUp" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "Home" ||
    key === "End"
  );
}

/**
 * Calculates the next roving index in a 1D sequence of cards.
 * Clamps within bounds so navigation does not wrap unexpectedly.
 */
export function getNextLinearRovingIndex(
  currentIndex: number,
  totalCount: number,
  key: RovingNavigationKey
): number {
  if (totalCount <= 0) return -1;
  const current = Math.max(0, Math.min(currentIndex, totalCount - 1));
  switch (key) {
    case "Home":
      return 0;
    case "End":
      return totalCount - 1;
    case "ArrowDown":
    case "ArrowRight":
      return Math.min(current + 1, totalCount - 1);
    case "ArrowUp":
    case "ArrowLeft":
      return Math.max(0, current - 1);
    default:
      return current;
  }
}

/**
 * Calculates the next roving index in a 2D multi-column layout (e.g. Kanban board).
 * Preserves the relative row position when moving horizontally between columns.
 */
export function getNextBoardRovingIndex(
  columns: number[][],
  currentCardIndex: number,
  key: RovingNavigationKey
): number {
  const nonEmptyColumns = columns.filter((col) => col.length > 0);
  if (nonEmptyColumns.length === 0) return -1;

  if (key === "Home") {
    return nonEmptyColumns[0][0];
  }
  if (key === "End") {
    const lastCol = nonEmptyColumns[nonEmptyColumns.length - 1];
    return lastCol[lastCol.length - 1];
  }

  // Find column and row of the current card
  let colIndex = -1;
  let rowIndex = -1;
  for (let c = 0; c < nonEmptyColumns.length; c++) {
    const r = nonEmptyColumns[c].indexOf(currentCardIndex);
    if (r >= 0) {
      colIndex = c;
      rowIndex = r;
      break;
    }
  }

  // If not found in columns, fallback to 1D linear navigation over all cards
  if (colIndex < 0) {
    const allCards = nonEmptyColumns.flat();
    return getNextLinearRovingIndex(currentCardIndex, allCards.length, key);
  }

  const currentColumn = nonEmptyColumns[colIndex];

  switch (key) {
    case "ArrowDown":
      return currentColumn[Math.min(rowIndex + 1, currentColumn.length - 1)];
    case "ArrowUp":
      return currentColumn[Math.max(0, rowIndex - 1)];
    case "ArrowRight": {
      if (colIndex >= nonEmptyColumns.length - 1) return currentCardIndex;
      const targetColumn = nonEmptyColumns[colIndex + 1];
      const targetRow = Math.min(rowIndex, targetColumn.length - 1);
      return targetColumn[targetRow];
    }
    case "ArrowLeft": {
      if (colIndex <= 0) return currentCardIndex;
      const targetColumn = nonEmptyColumns[colIndex - 1];
      const targetRow = Math.min(rowIndex, targetColumn.length - 1);
      return targetColumn[targetRow];
    }
    default:
      return currentCardIndex;
  }
}

/**
 * Sets roving tabindex across a collection of elements so exactly one element
 * is reachable via Tab (tabindex="0") and all others are focusable via arrows (tabindex="-1").
 */
export function setRovingTabindex(elements: HTMLElement[], activeIndex: number): void {
  for (let i = 0; i < elements.length; i++) {
    elements[i]?.setAttribute("tabindex", i === activeIndex ? "0" : "-1");
  }
}

/**
 * Manages roving tabindex state and keyboard navigation for card views
 * (Board, Gallery, and List). Supports two-level roving tabindex (WAI-ARIA nested-widget pattern).
 */
export class CardRovingController {
  private activeIndex = 0;
  private cards: HTMLElement[] = [];
  private columnIndices: number[][] | null = null;
  private hadFocus = false;

  setCards(cards: HTMLElement[], columnIndices?: number[][], restoreFocus?: boolean): void {
    this.cards = cards;
    this.columnIndices = columnIndices ?? null;
    if (this.cards.length === 0) {
      this.activeIndex = 0;
      return;
    }
    if (this.activeIndex >= this.cards.length) {
      this.activeIndex = 0;
    }
    this.syncTabindex();

    const shouldRestore = restoreFocus ?? this.hadFocus;
    if (shouldRestore && this.cards.length > 0) {
      const target = this.cards[this.activeIndex];
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            target?.focus?.();
          });
        });
      } else {
        target?.focus?.();
      }
    }
  }

  getActiveIndex(): number {
    return this.activeIndex;
  }

  setActiveIndex(index: number): void {
    if (index < 0 || index >= this.cards.length) return;
    this.activeIndex = index;
    this.syncTabindex();
  }

  attachCard(card: HTMLElement): void {
    const isCurrentActive = this.cards.length > 0
      ? this.cards.indexOf(card) === this.activeIndex
      : this.activeIndex === 0;
    card.setAttribute("tabindex", isCurrentActive ? "0" : "-1");

    card.addEventListener("focusin", () => {
      this.hadFocus = true;
      const idx = this.cards.indexOf(card);
      if (idx >= 0 && idx !== this.activeIndex) {
        this.activeIndex = idx;
        this.syncTabindex();
      }
    });

    card.addEventListener("focusout", (event) => {
      const nextTarget = (event as FocusEvent).relatedTarget as HTMLElement | null;
      if (nextTarget && typeof nextTarget === "object" && typeof nextTarget.closest === "function") {
        const inAnyCard = this.cards.some((c) => c === nextTarget || c.contains?.(nextTarget));
        if (!inAnyCard) {
          this.hadFocus = false;
        }
      }
    });
  }

  handleKeydown(event: KeyboardEvent): boolean {
    if (isImeComposing(event) || !this.cards.length) return false;
    const target = event.target as HTMLElement | null;
    if (!target || typeof target !== "object") return false;

    // Do not intercept if focus is inside an active text/cell editor or form control
    if (target.closest?.("input, textarea, select, [contenteditable='true'], .db-cell-editing")) {
      return false;
    }

    const cardIndex = this.cards.findIndex((card) => card === target || card.contains?.(target));
    if (cardIndex < 0) return false;

    const card = this.cards[cardIndex];
    const fields = this.getCardFocusableFields(card);
    const fieldIndex = fields.findIndex((field) => field === target || field.contains?.(target));

    // Nested roving level: focus is currently on a field inside the card
    if (fieldIndex >= 0) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        card.focus();
        return true;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        const nextField = fields[Math.min(fields.length - 1, fieldIndex + 1)];
        nextField?.focus();
        return true;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        const prevField = fields[Math.max(0, fieldIndex - 1)];
        prevField?.focus();
        return true;
      }

      if (event.key === "Home") {
        event.preventDefault();
        event.stopPropagation();
        fields[0]?.focus();
        return true;
      }

      if (event.key === "End") {
        event.preventDefault();
        event.stopPropagation();
        fields[fields.length - 1]?.focus();
        return true;
      }

      // Allow Enter and Space to pass through to field edit handler
      if (event.key === "Enter" || event.key === " ") {
        return false;
      }

      return false;
    }

    // Card level navigation
    if (event.key === "Enter" || event.key === "F2") {
      if (fields.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        fields[0]?.focus();
        return true;
      }
      return false;
    }

    if (!isRovingNavigationKey(event.key)) return false;

    event.preventDefault();
    event.stopPropagation();

    let nextIndex: number;
    if (this.columnIndices && this.columnIndices.length > 0) {
      nextIndex = getNextBoardRovingIndex(this.columnIndices, cardIndex, event.key);
    } else {
      nextIndex = getNextLinearRovingIndex(cardIndex, this.cards.length, event.key);
    }

    this.setActiveIndex(nextIndex);
    this.cards[nextIndex]?.focus();
    return true;
  }

  private getCardFocusableFields(card: HTMLElement): HTMLElement[] {
    if (!card.querySelectorAll) return [];
    const elements = Array.from(
      card.querySelectorAll<HTMLElement>(
        "[data-note-database-column-key][tabindex], .db-card-field[tabindex], .db-gallery-card-field[tabindex], .db-list-row-field[tabindex], [role='gridcell'][tabindex]"
      )
    );
    return elements.filter((el) => {
      const tabAttr = el.getAttribute("tabindex");
      return tabAttr !== null && tabAttr !== "" && !el.closest?.(".db-cell-editing");
    });
  }

  private syncTabindex(): void {
    setRovingTabindex(this.cards, this.activeIndex);
  }
}

export interface CardKeydownWiringOptions {
  card: HTMLElement;
  rovingController: CardRovingController;
  onActivate?: () => void;
  ignoreSelector?: string;
}

/**
 * Shared wiring helper for card keyboard navigation and activation.
 */
export function wireCardKeyboard(options: CardKeydownWiringOptions): void {
  const {
    card,
    rovingController,
    onActivate,
    ignoreSelector = "a, button, input, select, textarea, .db-cell-editing",
  } = options;

  rovingController.attachCard(card);
  card.addEventListener("keydown", (event) => {
    if (isImeComposing(event)) return;
    if (rovingController.handleKeydown(event)) return;
    if (onActivate) {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target as HTMLElement | null;
      if (target && typeof target === "object" && typeof target.closest === "function" && target.closest(ignoreSelector)) {
        return;
      }
      event.preventDefault();
      onActivate();
    }
  });
}

/**
 * Shared helper to synchronize registered card elements in a container with the roving controller.
 */
export function syncCardRoving(
  container: HTMLElement,
  rovingController: CardRovingController,
  cardSelector: string,
  columnIndices?: number[][]
): HTMLElement[] {
  const cards = Array.from(container.querySelectorAll<HTMLElement>(cardSelector));
  rovingController.setCards(cards, columnIndices);
  return cards;
}
