// ───────────────────────────────────────────────────────────────────
// MODULE:    hidden-properties
// COMPONENT: the collapsed group a record's hidden properties render under
// ───────────────────────────────────────────────────────────────────
//
// The peek already has a working disclosure — a toggle button, an `aria-expanded` pair, and a
// hidden fields container — and this is that shape, moved rather than redesigned. What it adds
// is the one thing the peek's own copy never carried: a count, and expanded state that survives
// a rebuild.
//
// A panel with editable fields re-renders its whole body on every commit (a metadata resolve,
// a single field edit), so a toggle held only in the DOM collapses itself back on the very next
// keystroke it should have survived. This closes over the expanded flag instead, the same way
// the record sheet's own note-body draft outlives a re-render — the state belongs to the open
// session, not to the node a refresh is about to throw away.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface HiddenPropertiesGroupOptions {
  groupClass: string;
  toggleClass: string;
  fieldsClass: string;
  expandedClass: string;
  /** Formats the toggle's own label; the caller owns the exact string and its translation. */
  label: (count: number) => string;
}

export interface HiddenPropertiesGroupHandle {
  /**
   * Rebuilds the group under `parent` from `items`, replaying whatever expanded/collapsed state
   * a prior `render` call left behind. Renders nothing when `items` is empty, matching the peek's
   * own rule that an empty hidden set draws no group at all.
   */
  render<T>(parent: HTMLElement, items: readonly T[], renderRow: (fieldsParent: HTMLElement, item: T) => void): void;
  isExpanded(): boolean;
}

// ───────────────────────────────────────────────────────────────────
// 2. FACTORY
// ───────────────────────────────────────────────────────────────────

export function createHiddenPropertiesGroup(options: HiddenPropertiesGroupOptions): HiddenPropertiesGroupHandle {
  let expanded = false;

  return {
    isExpanded: () => expanded,
    render(parent, items, renderRow) {
      if (items.length === 0) return;

      const group = parent.createDiv({ cls: options.groupClass });
      if (expanded) group.addClass(options.expandedClass);

      const toggle = group.createEl("button", { cls: options.toggleClass, attr: { type: "button" } });
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = options.label(items.length);

      const fields = group.createDiv({ cls: options.fieldsClass });
      if (!expanded) fields.addClass("is-hidden");
      fields.setAttribute("aria-hidden", String(!expanded));

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        expanded = !expanded;
        toggle.setAttribute("aria-expanded", String(expanded));
        fields.classList.toggle("is-hidden", !expanded);
        fields.setAttribute("aria-hidden", String(!expanded));
        group.classList.toggle(options.expandedClass, expanded);
      });

      for (const item of items) renderRow(fields, item);
    },
  };
}
