// ───────────────────────────────────────────────────────────────────
// MODULE:    dropdown-field.stories
// COMPONENT: catalogue entries for the dropdown field
// ───────────────────────────────────────────────────────────────────
//
// Reviewed side by side with the menu row grammar. These two families had
// drifted apart — different alignment, inconsistent icons, no shared trailing
// treatment — and this is where that is visible without launching a vault.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { createDropdownField } from "./dropdown-field";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Fields/Dropdown field" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

/** Row anatomy: leading icon, label, trailing state. */
export const Default: Story = {
  render: () => {
    const host = document.createElement("div");
    createDropdownField({
      parent: host,
      label: "Billing",
      value: "monthly",
      options: [
        { value: "monthly", text: "Monthly", icon: "calendar" },
        { value: "yearly", text: "Yearly", icon: "calendar-days" },
        { value: "once", text: "One-off", icon: "circle-dot" },
      ],
      onChange: () => undefined,
    });
    return host;
  },
};

/** Section headers plus a disabled row: check the divider, and that disabled reverts the cursor. */
export const WithSections: Story = {
  render: () => {
    const host = document.createElement("div");
    createDropdownField({
      parent: host,
      label: "Group by",
      value: "status",
      searchable: true,
      options: [
        { value: "status", text: "Status", section: "Properties", icon: "circle-dot" },
        { value: "priority", text: "Priority", section: "Properties", icon: "flag" },
        { value: "formula", text: "Margin %", section: "Computed", icon: "sigma" },
        {
          value: "locked",
          text: "Unavailable",
          section: "Computed",
          disabled: true,
          disabledReason: "Needs a numeric column",
        },
      ],
      onChange: () => undefined,
    });
    return host;
  },
};
