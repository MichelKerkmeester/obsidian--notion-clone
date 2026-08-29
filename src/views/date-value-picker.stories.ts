// ───────────────────────────────────────────────────────────────────
// MODULE:    date-value-picker.stories
// COMPONENT: catalogue entries for the date value trigger
// ───────────────────────────────────────────────────────────────────
//
// The button that opens a date popover, not the popover itself. Empty and
// filled must occupy the same height, or a column of them ripples as values
// are entered — which is the defect this surface has had before.

import type { Meta, StoryObj } from "@storybook/html-vite";
import { renderDateValuePicker } from "./date-value-picker";

const meta: Meta = { title: "Fields/Date value picker" };
export default meta;

type Story = StoryObj;

function pick(caption: string, options: Record<string, unknown>): HTMLElement {
  const cell = document.createElement("div");
  cell.className = "db-story-cell";
  const host = document.createElement("div");
  renderDateValuePicker({
    parent: host,
    value: "",
    onChange: () => undefined,
    ...options,
  } as Parameters<typeof renderDateValuePicker>[0]);
  const note = document.createElement("span");
  note.className = "db-story-note";
  note.textContent = caption;
  cell.append(host, note);
  return cell;
}

/** Empty, dated, timed and disabled — all four should share a baseline. */
export const States: Story = {
  render: () => {
    const col = document.createElement("div");
    col.className = "db-story-column";
    col.append(
      pick("empty", { placeholder: "Pick a date" }),
      pick("date", { value: "2026-03-14" }),
      pick("date and time", { value: "2026-03-14T09:30", includeTime: true }),
      pick("disabled", { value: "2026-03-14", disabled: true }),
      pick("with footer action", {
        value: "2026-03-14",
        footerAction: { label: "Clear", onSelect: () => undefined },
      }),
    );
    return col;
  },
};
