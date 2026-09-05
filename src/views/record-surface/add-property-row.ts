// ───────────────────────────────────────────────────────────────────
// MODULE:    add-property-row
// COMPONENT: the search-first "add a property" affordance
// ───────────────────────────────────────────────────────────────────
//
// Every picker this family was measured against opens with a text field that carries its own
// create path — typing something that matches nothing already-listed *is* the create step,
// there is no separate "new" button beside the search box. This is that shape: a query filters
// the format list as it is typed, and whatever does not match an existing label falls through
// to the caller's create handler with the typed text as the seed.
//
// Our data model has no cross-record "existing properties" list to browse the way a source with
// global properties would — a column belongs to one view — so the list here is the format
// picker (the thirteen column types), not a second section of prior properties. That is a
// deliberate narrowing of the wider picker, not an oversight.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface AddPropertyRowOption<T extends string = string> {
  value: T;
  label: string;
}

export interface AddPropertyRowOptions<T extends string = string> {
  parent: HTMLElement;
  rootClass: string;
  searchClass: string;
  optionListClass: string;
  optionClass: string;
  createRowClass: string;
  options: readonly AddPropertyRowOption<T>[];
  searchPlaceholder: string;
  /** Builds the fall-through row's label from what was typed, e.g. `Create "${query}"`. */
  createLabel: (query: string) => string;
  renderIcon?: (parent: HTMLElement, value: T) => void;
  onSelect: (value: T) => void;
  onCreateNew: (query: string) => void;
}

export interface AddPropertyRowHandle<T extends string = string> {
  searchInput: HTMLInputElement;
  /** Drives the filter as if the user had typed `query`, for callers that do not want to fire DOM events. */
  setQuery(query: string): void;
  visibleOptions(): readonly AddPropertyRowOption<T>[];
  hasExactMatch(): boolean;
}

// ───────────────────────────────────────────────────────────────────
// 2. BUILDER
// ───────────────────────────────────────────────────────────────────

export function buildAddPropertyRow<T extends string = string>(
  options: AddPropertyRowOptions<T>,
): AddPropertyRowHandle<T> {
  const root = options.parent.createDiv({ cls: options.rootClass });
  const searchInput = root.createEl("input", {
    cls: options.searchClass,
    attr: { type: "text", placeholder: options.searchPlaceholder },
  }) as unknown as HTMLInputElement;
  const list = root.createDiv({ cls: options.optionListClass });

  const matches = (query: string): AddPropertyRowOption<T>[] => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [...options.options];
    return options.options.filter((entry) => entry.label.toLowerCase().includes(normalized));
  };

  const exactMatch = (query: string, visible: readonly AddPropertyRowOption<T>[]): boolean => {
    const normalized = query.trim().toLowerCase();
    return normalized.length > 0 && visible.some((entry) => entry.label.toLowerCase() === normalized);
  };

  let visible = matches("");
  let exact = false;

  const renderList = (query: string): void => {
    visible = matches(query);
    exact = exactMatch(query, visible);
    list.empty();
    for (const entry of visible) {
      const row = list.createDiv({ cls: options.optionClass });
      options.renderIcon?.(row, entry.value);
      row.createSpan({ text: entry.label });
      row.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        options.onSelect(entry.value);
      });
    }
    const trimmed = query.trim();
    if (trimmed && !exact) {
      const createRow = list.createDiv({ cls: options.createRowClass });
      createRow.textContent = options.createLabel(trimmed);
      createRow.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        options.onCreateNew(trimmed);
      });
    }
  };

  renderList("");
  searchInput.addEventListener("input", () => renderList(searchInput.value));

  return {
    searchInput,
    setQuery(query: string) {
      searchInput.value = query;
      renderList(query);
    },
    visibleOptions: () => visible,
    hasExactMatch: () => exact,
  };
}
