// ───────────────────────────────────────────────────────────────────
// MODULE:    mobile-move-icon.stories
// COMPONENT: catalogue entry for the phone drag affordance
// ───────────────────────────────────────────────────────────────────
//
// Hand-drawn SVG rather than a Lucide glyph, because the icon set has nothing
// that reads as "move this row" at phone touch sizes. It renders through
// `activeDocument`, which is a global Obsidian supplies and the shim stands in
// for — so this story is also the cheapest check that the shim still works.

import type { Meta, StoryObj } from "@storybook/html-vite";
import { renderMobileMoveIcon } from "./mobile-move-icon";

const meta: Meta = { title: "Chrome/Mobile move icon" };
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const host = document.createElement("div");
    host.className = "db-story-row";
    const icon = document.createElement("div");
    renderMobileMoveIcon(icon);
    host.appendChild(icon);
    return host;
  },
};
