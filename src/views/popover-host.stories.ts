// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-host.stories
// COMPONENT: catalogue entry for the picker family's shared phone sheet header
// ───────────────────────────────────────────────────────────────────
//
// `mountPickerSheetHeader` has no visible shape of its own on the desktop path — it hands the
// caller its own panel back unchanged, which is the point: the phone header is the only surface
// it draws. Both branches are shown so a reader can see that this call is a no-op off the phone.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { mountPickerSheetHeader } from "./popover-host";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Surfaces/Picker host" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

/** Four swatches, standing in for the date, colour or icon picker's own content. */
function buildBody(parent: HTMLElement): void {
  for (let i = 0; i < 4; i += 1) parent.createDiv({ cls: "obnotion-story-swatch" });
}

export const Desktop: Story = {
  render: () => {
    document.body.removeClass("is-phone");
    const panel = document.createElement("div");
    panel.className = "obnotion-color-picker-popup";
    const content = mountPickerSheetHeader(panel, document, {
      title: "Colour",
      onClose: () => {},
      bodyCls: "obnotion-color-picker-body",
    });
    buildBody(content);
    return panel;
  },
};

export const Phone: Story = {
  render: () => {
    document.body.addClass("is-phone");
    const panel = document.createElement("div");
    panel.className = "obnotion-color-picker-popup obnotion-mobile-bottom-sheet";
    const content = mountPickerSheetHeader(panel, document, {
      title: "Colour",
      onClose: () => {},
      bodyCls: "obnotion-color-picker-body",
    });
    buildBody(content);
    return panel;
  },
};
