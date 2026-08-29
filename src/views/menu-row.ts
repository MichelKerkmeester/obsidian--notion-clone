// ───────────────────────────────────────────────────────────────────
// MODULE:    menu-row
// COMPONENT: the shared row grammar for menus, popovers and sheets
// ───────────────────────────────────────────────────────────────────
//
// Five files build menu rows by hand — the column menu, the row menu, the
// toolbar, the cell editors and the dropdown field — so they have drifted.
// Rows are centred in one popover and left-aligned in another, icons appear
// on some items and not their siblings, and trailing values are positioned
// three different ways.
//
// The grammar itself was never the problem. The column menu already gets it
// right and is the surface to copy: a leading slot, a label that ellipsises,
// and an optional trailing value pushed to the end. Those classes exist and
// are styled. What was missing is a module that builds them, so each caller
// invented its own markup instead.
//
// This does not restyle anything. It renders the same structure the column
// menu already renders, adds the two pieces that had no home — a submenu
// chevron and a section header — and gives every caller one way to ask for a
// row. The column menu's 292px sizing and appearance are untouched.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface MenuRowOptions {
  /** Lucide icon id for the leading slot. Omit for a row that carries no icon. */
  icon?: string;
  label: string;
  /** Trailing text — a current value, a shortcut. Pushed to the end of the row. */
  value?: string;
  /** Draws a chevron and marks the row as opening a submenu. */
  submenu?: boolean;
  selected?: boolean;
  disabled?: boolean;
  /** Destructive action — delete, clear. Renders in the error colour, as the native menu did. */
  warning?: boolean;
  /** Hover tooltip. Separate from `disabledReason`, which also becomes the accessible name. */
  tooltip?: string;
  /** Why the row is unavailable. Surfaces as the accessible name, not just a tooltip. */
  disabledReason?: string;
  onClick?(event: MouseEvent): void;
}

export interface MenuRowHandle {
  row: HTMLElement;
  /** The leading slot, for a caller that needs to draw something richer than an icon. */
  iconEl: HTMLElement | null;
  labelEl: HTMLElement;
  valueEl: HTMLElement | null;
  setValue(text: string): void;
  setSelected(selected: boolean): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. ROW
// ───────────────────────────────────────────────────────────────────

/**
 * Build one menu row: `[icon] label … [value] [chevron]`.
 *
 * Rendered as a button so it is focusable and keyboard-activatable without extra wiring — several
 * of the hand-rolled versions used a div and then had to add a tabindex and a keydown handler to
 * get back what a button gives for free.
 */
export function createMenuRow(parent: HTMLElement, options: MenuRowOptions): MenuRowHandle {
  const row = parent.createEl("button", {
    cls: "db-menu-item",
    attr: { type: "button", role: "menuitem" },
  });

  let iconEl: HTMLElement | null = null;
  if (options.icon) {
    iconEl = row.createSpan({ cls: "db-menu-item-icon" });
    setIcon(iconEl, options.icon);
  }

  const labelEl = row.createSpan({ cls: "db-menu-item-label", text: options.label });

  let valueEl: HTMLElement | null = null;
  if (options.value !== undefined) {
    valueEl = row.createSpan({ cls: "db-menu-item-current", text: options.value });
  }

  if (options.submenu) {
    // `margin-left: auto` on the value pushes it right; without a value the chevron needs to do
    // that itself, which is why it carries the trailing class too.
    const chevron = row.createSpan({
      cls: `db-menu-item-chevron${valueEl ? "" : " db-menu-item-current"}`,
    });
    setIcon(chevron, "chevron-right");
    row.setAttr("aria-haspopup", "true");
    row.setAttr("aria-expanded", "false");
  }

  if (options.disabled) {
    row.setAttr("disabled", "true");
    row.setAttr("aria-disabled", "true");
    if (options.disabledReason) {
      row.setAttr("title", options.disabledReason);
      row.setAttr("aria-label", `${options.label}: ${options.disabledReason}`);
    }
  }

  row.toggleClass("is-warning", Boolean(options.warning));
  if (options.tooltip) row.setAttr("title", options.tooltip);
  row.toggleClass("is-selected", Boolean(options.selected));
  row.setAttr("aria-checked", options.selected ? "true" : "false");

  if (options.onClick && !options.disabled) {
    row.onclick = (event) => options.onClick?.(event);
  }

  return {
    row,
    iconEl,
    labelEl,
    valueEl,
    setValue(text) {
      const target = valueEl ?? row.createSpan({ cls: "db-menu-item-current" });
      target.setText(text);
      valueEl = target;
    },
    setSelected(selected) {
      row.toggleClass("is-selected", selected);
      row.setAttr("aria-checked", selected ? "true" : "false");
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. SECTIONS AND SEPARATORS
// ───────────────────────────────────────────────────────────────────

/**
 * A small muted heading above a group of rows.
 *
 * Notion groups menu items under headings like this rather than relying on separators alone, and
 * the plugin's dropdown already does the same with its own class. This gives menus the same
 * affordance so the two families read alike.
 */
export function createMenuSection(parent: HTMLElement, label: string): HTMLElement {
  return parent.createDiv({ cls: "db-menu-section", text: label });
}

/** A hairline between groups, for surfaces that separate without labelling. */
export function createMenuSeparator(parent: HTMLElement): HTMLElement {
  const separator = parent.createDiv({ cls: "db-menu-separator" });
  separator.setAttr("role", "separator");
  return separator;
}
