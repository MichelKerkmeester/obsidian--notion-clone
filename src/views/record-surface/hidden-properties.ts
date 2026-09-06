// ───────────────────────────────────────────────────────────────────
// MODULE:    hidden-properties
// COMPONENT: the property-visibility group a record sheet renders under one disclosure
// ───────────────────────────────────────────────────────────────────
//
// The disclosure itself is unchanged from its first shape — a toggle button, an `aria-expanded`
// pair, a fields container that survives a rebuild — but what it holds is no longer a flat list
// of hidden rows. It now manages the sheet's whole property list from one place: a "Shown"
// section a reader can hide a field from, and a "Hidden" section they can bring one back from,
// each with its own bulk link, and every row carrying the same anatomy a value row already has
// elsewhere in this program (drag handle, type icon, name) plus the two this group adds (an eye
// toggle in place of a plain checkbox, and a trailing chevron).
//
// The Hidden section draws only when it holds something — an empty "nothing is hidden" section
// is a heading over blank space — but the group itself always renders, because it is now the
// entry point for hiding a currently-shown field too, not only a report of what already is.
//
// A panel with editable fields re-renders its whole body on every commit (a metadata resolve,
// a single field edit), so a toggle held only in the DOM collapses itself back on the very next
// keystroke it should have survived. This closes over the expanded flag instead, the same way
// the record sheet's own note-body draft outlives a re-render — the state belongs to the open
// session, not to the node a refresh is about to throw away.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface HiddenGroupRow<T> {
  item: T;
  key: string;
  label: string;
  /** Whether the field currently shows on the sheet — the Shown section holds `true` rows, the
   *  Hidden section holds `false` ones. */
  visible: boolean;
  /** The title field's row: Notion's own title row cannot be hidden, and neither can ours. */
  eyeDisabled?: boolean;
  renderTypeIcon: (parent: HTMLElement) => void;
}

export interface HiddenPropertiesGroupOptions {
  groupClass: string;
  toggleClass: string;
  fieldsClass: string;
  expandedClass: string;
  sectionClass: string;
  sectionHeaderClass: string;
  sectionTitleClass: string;
  bulkLinkClass: string;
  rowClass: string;
  dragHandleClass: string;
  dragHandleTitle: string;
  typeClass: string;
  nameWrapClass: string;
  nameClass: string;
  eyeClass: string;
  chevronClass: string;
  shownSectionTitle: string;
  hiddenSectionTitle: string;
  hideAllLabel: string;
  showAllLabel: string;
  /** Formats the entry row's own label — the count is the Hidden population only, per A4. */
  label: (hiddenCount: number) => string;
}

export interface HiddenPropertiesGroupHandle {
  /**
   * Rebuilds the group under `parent` from the current Shown/Hidden split, replaying whatever
   * expanded/collapsed state a prior `render` call left behind.
   */
  render<T>(
    parent: HTMLElement,
    shown: readonly HiddenGroupRow<T>[],
    hidden: readonly HiddenGroupRow<T>[],
    onToggle: (item: T, nextVisible: boolean) => void,
    onBulkToggle: (items: readonly T[], nextVisible: boolean) => void,
  ): void;
  isExpanded(): boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. FACTORY
// ───────────────────────────────────────────────────────────────────

export function createHiddenPropertiesGroup(options: HiddenPropertiesGroupOptions): HiddenPropertiesGroupHandle {
  let expanded = false;

  return {
    isExpanded: () => expanded,
    render(parent, shown, hidden, onToggle, onBulkToggle) {
      const group = parent.createDiv({ cls: options.groupClass });
      if (expanded) group.addClass(options.expandedClass);

      const toggle = group.createEl("button", { cls: options.toggleClass, attr: { type: "button" } });
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = options.label(hidden.length);

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

      if (shown.length > 0) {
        renderSection(fields, options, options.shownSectionTitle, shown, options.hideAllLabel, false, onToggle, onBulkToggle);
      }
      if (hidden.length > 0) {
        renderSection(fields, options, options.hiddenSectionTitle, hidden, options.showAllLabel, true, onToggle, onBulkToggle);
      }
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. SECTION + ROW
// ───────────────────────────────────────────────────────────────────

function renderSection<T>(
  parent: HTMLElement,
  options: HiddenPropertiesGroupOptions,
  title: string,
  rows: readonly HiddenGroupRow<T>[],
  bulkLabel: string,
  bulkVisible: boolean,
  onToggle: (item: T, nextVisible: boolean) => void,
  onBulkToggle: (items: readonly T[], nextVisible: boolean) => void,
): void {
  const section = parent.createDiv({ cls: options.sectionClass });
  const header = section.createDiv({ cls: options.sectionHeaderClass });
  header.createSpan({ cls: options.sectionTitleClass, text: title });
  const bulk = header.createEl("button", { cls: options.bulkLinkClass, attr: { type: "button" }, text: bulkLabel });
  bulk.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onBulkToggle(rows.map((row) => row.item), bulkVisible);
  });

  for (const row of rows) renderRow(section, options, row, onToggle);
}

function renderRow<T>(
  parent: HTMLElement,
  options: HiddenPropertiesGroupOptions,
  row: HiddenGroupRow<T>,
  onToggle: (item: T, nextVisible: boolean) => void,
): void {
  const rowEl = parent.createDiv({ cls: options.rowClass });

  const dragHandle = rowEl.createSpan({ cls: options.dragHandleClass, text: "⋮⋮" });
  dragHandle.title = options.dragHandleTitle;

  const typeEl = rowEl.createSpan({ cls: options.typeClass });
  row.renderTypeIcon(typeEl);

  const nameWrap = rowEl.createDiv({ cls: options.nameWrapClass });
  nameWrap.createSpan({ cls: options.nameClass, text: row.label });

  const eyeButton = rowEl.createEl("button", { cls: options.eyeClass, attr: { type: "button" } });
  eyeButton.disabled = Boolean(row.eyeDisabled);
  setIcon(eyeButton, row.visible ? "eye" : "eye-off");
  if (!row.eyeDisabled) {
    eyeButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onToggle(row.item, !row.visible);
    });
  }

  const chevron = rowEl.createSpan({ cls: options.chevronClass });
  setIcon(chevron, "chevron-right");
}
