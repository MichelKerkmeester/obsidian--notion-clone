// ───────────────────────────────────────────────────────────────────
// MODULE:    file-title-display.stories
// COMPONENT: catalogue entries for note titles in a cell
// ───────────────────────────────────────────────────────────────────
//
// Two layouts, inline and stacked, and the interesting case in both is a
// duplicate name: the folder prefix only appears to disambiguate, so a title
// that is unique renders differently from one that is not.

import type { Meta, StoryObj } from "@storybook/html-vite";
import { renderInlineFileTitle, renderStackedFileTitle, type FileTitleDisplay } from "./file-title-display";

const meta: Meta = { title: "Fields/File title" };
export default meta;

type Story = StoryObj;

const unique: FileTitleDisplay = {
  name: "Q3 forecast",
  folderPrefix: "Finance/",
  folderPath: "Finance",
  fullPath: "Finance/Q3 forecast.md",
  displayPath: "Finance/Q3 forecast",
  hasDuplicateName: false,
};

const duplicate: FileTitleDisplay = {
  ...unique,
  name: "Notes",
  folderPrefix: "Projects/Apollo/",
  folderPath: "Projects/Apollo",
  fullPath: "Projects/Apollo/Notes.md",
  displayPath: "Projects/Apollo/Notes",
  hasDuplicateName: true,
};

function variants(render: (p: HTMLElement, i: FileTitleDisplay, always?: boolean) => void): HTMLElement {
  const col = document.createElement("div");
  col.className = "db-story-column";
  for (const [caption, info, always] of [
    ["unique name", unique, false],
    ["duplicate name — prefix disambiguates", duplicate, false],
    ["path always shown", unique, true],
  ] as Array<[string, FileTitleDisplay, boolean]>) {
    const cell = document.createElement("div");
    cell.className = "db-story-cell";
    const host = document.createElement("div");
    render(host, info, always);
    const note = document.createElement("span");
    note.className = "db-story-note";
    note.textContent = caption;
    cell.append(host, note);
    col.appendChild(cell);
  }
  return col;
}

export const Inline: Story = { render: () => variants(renderInlineFileTitle) };
export const Stacked: Story = { render: () => variants(renderStackedFileTitle) };
