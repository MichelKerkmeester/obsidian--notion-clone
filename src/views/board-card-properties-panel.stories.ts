// ───────────────────────────────────────────────────────────────────
// MODULE:    board-card-properties-panel.stories
// COMPONENT: catalogue entries for board card properties panel
// ───────────────────────────────────────────────────────────────────
//
// The two states that never appear together in the app: an editable panel with a drag
// handle and reorder buttons beside a read-only embed where every control is disabled but
// the list still renders, so a reviewer can compare the two without opening two notes.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import type { ViewConfig } from "../data/types";
import { boardCardPropertiesContext, renderBoardCardProperties } from "./board-card-properties-panel";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Panels/Board card properties" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURE
// ───────────────────────────────────────────────────────────────────

function config(): ViewConfig {
  return {
    name: "Board",
    sourceFolder: "",
    viewType: "board",
    boardGroupField: "status",
    boardImageField: "cover",
    schema: {
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "status", label: "Status", type: "status" },
        { key: "cover", label: "Cover", type: "text" },
        { key: "hours", label: "Hours", type: "number" },
        { key: "tags", label: "Tags", type: "multi-select" },
        { key: "due", label: "Due", type: "date" },
      ],
      computedFields: [],
    },
    // One field hidden by the operator, so the panel shows a mix of checked and unchecked
    // rows rather than every row starting visible.
    boardCardFields: [
      { key: "hours", visible: true },
      { key: "tags", visible: false },
      { key: "due", visible: true },
    ],
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. STORIES
// ───────────────────────────────────────────────────────────────────

export const Editable: Story = {
  render: () => {
    const panel = document.createElement("div");
    panel.className = "db-view-config-panel";
    const view = config();
    renderBoardCardProperties(panel, view, { onChange: () => undefined }, boardCardPropertiesContext(view));
    return panel;
  },
};

export const ReadOnly: Story = {
  render: () => {
    const panel = document.createElement("div");
    panel.className = "db-view-config-panel";
    const view = config();
    renderBoardCardProperties(
      panel,
      view,
      { onChange: () => undefined, readOnly: true },
      boardCardPropertiesContext(view),
    );
    return panel;
  },
};
