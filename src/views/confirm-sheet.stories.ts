// ───────────────────────────────────────────────────────────────────
// MODULE:    confirm-sheet.stories
// COMPONENT: catalogue entry for the shared confirm dialog body
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { buildConfirmSheetBody } from "./confirm-sheet";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Surfaces/Confirm sheet body" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

export const Destructive: Story = {
  render: () => {
    const host = document.createElement("div");
    host.className = "note-database-modal";
    buildConfirmSheetBody(host, {
      title: "Delete this row?",
      message: "This action cannot be undone.",
      cancelText: "Cancel",
      confirmText: "Delete",
      danger: true,
      onCancel: () => undefined,
      onConfirm: () => undefined,
    });
    return host;
  },
};

export const NonDestructiveWithSecondaryAction: Story = {
  render: () => {
    const host = document.createElement("div");
    host.className = "note-database-modal";
    buildConfirmSheetBody(host, {
      title: "Clear sort to reorder?",
      message: "This view is sorted. Reordering will clear the sort and keep the new order.",
      cancelText: "Cancel",
      confirmText: "Clear sort",
      secondaryButton: { text: "Keep sort", value: "keep" },
      onCancel: () => undefined,
      onConfirm: () => undefined,
      onSecondary: () => undefined,
    });
    return host;
  },
};
