// ───────────────────────────────────────────────────────────────────
// MODULE:    mobile-bottom-sheet.stories
// COMPONENT: catalogue entry for the shared phone sheet chrome
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { applySheetChrome, playSheetEntrance } from "./mobile-bottom-sheet";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Surfaces/Mobile bottom sheet" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

export const Chrome: Story = {
  render: () => {
    const panel = document.createElement("section");
    panel.className = "db-menu";
    const heading = document.createElement("h2");
    heading.textContent = "Record actions";
    panel.appendChild(heading);
    for (const label of ["Edit record", "Duplicate record", "Delete record"]) {
      const action = document.createElement("button");
      action.className = "db-menu-item";
      action.type = "button";
      action.textContent = label;
      panel.appendChild(action);
    }
    applySheetChrome(panel, true, { scrimCapturesPointer: true });
    playSheetEntrance(panel);
    return panel;
  },
};
