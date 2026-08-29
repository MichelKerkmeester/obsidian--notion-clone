// ───────────────────────────────────────────────────────────────────
// MODULE:    card-field-renderer.stories
// COMPONENT: catalogue entries for rendered field values
// ───────────────────────────────────────────────────────────────────
//
// The checkbox story calls the shipped renderer rather than writing the markup
// it expects. That distinction is the point of this catalogue: the screenshot
// fixtures render hand-built HTML, so a capture can look healthy while the
// renderer that ships is broken, and a class the plugin never emits can be
// photographed as if it were real.
//
// The renderer takes an app and a row that its checkbox branch never reads.
// They are supplied as inert placeholders, so if that branch ever starts
// reading them the story fails loudly instead of quietly rendering a fiction.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App } from "obsidian";
import type { Meta, StoryObj } from "@storybook/html-vite";
import type { ColumnDef, RowData } from "../data/types";
import { renderCardFieldValue } from "./card-field-renderer";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Fields/Checkbox" };
export default meta;

type Story = StoryObj;

const column: ColumnDef = { key: "done", label: "Done", type: "checkbox" };
const row = { frontmatter: {}, computed: {} } as unknown as RowData;
const app = null as unknown as App;

function cell(value: boolean, readOnly: boolean, caption: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "db-story-cell";
  const valueEl = document.createElement("div");
  renderCardFieldValue(valueEl, app, row, column, value, "checkbox", {
    badgesClass: "db-card-badges",
    linkClass: "db-card-link",
    readOnly,
  });
  const label = document.createElement("span");
  label.className = "db-story-note";
  label.textContent = caption;
  wrap.append(valueEl, label);
  return wrap;
}

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

/**
 * Square, never a radio.
 *
 * The plugin owned no shape at all until recently, so this rendered as whatever the theme drew —
 * circles in boolean cells while row-select boxes stayed square in the same table. All four states
 * should read as one family.
 */
export const States: Story = {
  render: () => {
    const rowEl = document.createElement("div");
    rowEl.className = "db-story-row";
    rowEl.append(
      cell(false, false, "Unchecked"),
      cell(true, false, "Checked"),
      cell(false, true, "Disabled"),
      cell(true, true, "Disabled + checked"),
    );
    return rowEl;
  },
};
