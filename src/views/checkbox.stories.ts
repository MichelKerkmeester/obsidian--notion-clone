// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox.stories
// COMPONENT: catalogue entries for shared checkbox roles
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { createCheckbox } from "./checkbox";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Controls/Checkbox" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

export const Roles: Story = {
  render: () => {
    const column = document.createElement("div");
    column.className = "db-story-column";
    for (const role of ["row", "field"] as const) {
      const label = document.createElement("label");
      label.className = "db-story-row";
      label.append(` ${role} checkbox`);
      const checkbox = createCheckbox(label, {
        role,
        attr: { "aria-label": `${role} checkbox` },
      });
      checkbox.checked = role === "row";
      column.appendChild(label);
    }
    return column;
  },
};
