// ───────────────────────────────────────────────────────────────────
// MODULE:    surface-shell.stories
// COMPONENT: catalogue entry for the shared surface shell's three-slot header
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { buildShellHeader } from "./surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Surfaces/Surface shell header" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

export const RootTitle: Story = {
  render: () => {
    const panel = document.createElement("section");
    panel.className = "obnotion-menu";
    buildShellHeader(panel, { title: "Edit view", onClose: () => undefined });
    return panel;
  },
};

export const SubPageWithBack: Story = {
  render: () => {
    const panel = document.createElement("section");
    panel.className = "obnotion-menu";
    buildShellHeader(panel, { title: "Layout", onClose: () => undefined, onBack: () => undefined });
    return panel;
  },
};
