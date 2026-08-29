// ───────────────────────────────────────────────────────────────────
// MODULE:    property-type-icon.stories
// COMPONENT: catalogue entry for the column-type icon vocabulary
// ───────────────────────────────────────────────────────────────────
//
// Every column type has one icon, and it appears in the column menu, the
// property dropdown and the type picker. Seeing the whole set at once is the
// only way to catch two types sharing a glyph, or one drawn at a different
// optical weight — neither is visible when they appear one at a time.

import type { Meta, StoryObj } from "@storybook/html-vite";
import type { ColumnDef } from "../data/types";
import { renderPropertyTypeIcon } from "./property-type-icon";

const meta: Meta = { title: "Fields/Property type icons" };
export default meta;

type Story = StoryObj;

const TYPES: ColumnDef["type"][] = [
  "text", "number", "date", "datetime", "currency", "select", "multi-select",
  "status", "checkbox", "computed", "relation", "rollup", "files",
];

/** The full vocabulary, labelled, so a duplicate or an odd weight is obvious. */
export const AllTypes: Story = {
  render: () => {
    const grid = document.createElement("div");
    grid.className = "db-story-row";
    for (const type of TYPES) {
      const cell = document.createElement("div");
      cell.className = "db-story-cell";
      const icon = document.createElement("div");
      renderPropertyTypeIcon(icon, { key: type, label: type, type });
      const label = document.createElement("span");
      label.className = "db-story-note";
      label.textContent = type;
      cell.append(icon, label);
      grid.appendChild(cell);
    }
    return grid;
  },
};
