// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-position.stories
// COMPONENT: catalogue entry for anchored popover placement
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { positionToolbarPopover } from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Surfaces/Popover positioning" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

export const Anchored: Story = {
  render: () => {
    const host = document.createElement("div");
    host.className = "db-story-column";
    const anchor = document.createElement("button");
    anchor.type = "button";
    anchor.textContent = "Open menu";
    const panel = document.createElement("div");
    panel.className = "db-menu";
    panel.textContent = "Positioned menu";
    host.append(anchor, panel);
    document.body.appendChild(host);
    positionToolbarPopover(panel, anchor, {
      minWidth: 240,
      preferredWidth: 240,
      maxWidth: 240,
    });
    return host;
  },
};
