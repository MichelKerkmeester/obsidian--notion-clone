// ───────────────────────────────────────────────────────────────────
// MODULE:    search-highlight.stories
// COMPONENT: catalogue entry for search term highlighting
// ───────────────────────────────────────────────────────────────────
//
// Highlighting has to stay legible in both themes and must not swallow the
// surrounding text. The dark-theme contrast is the case worth looking at, and
// the theme switch here is the fastest way to check it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { renderSearchHighlightedText } from "./search-highlight";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Chrome/Search highlight" };
export default meta;

type Story = StoryObj;

function line(text: string, query: string, caption: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "db-story-cell";
  const host = document.createElement("div");
  renderSearchHighlightedText(host, text, query);
  const note = document.createElement("span");
  note.className = "db-story-note";
  note.textContent = caption;
  wrap.append(host, note);
  return wrap;
}

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

/** Single term, several terms, and a query matching nothing. */
export const Matches: Story = {
  render: () => {
    const col = document.createElement("div");
    col.className = "db-story-column";
    col.append(
      line("Quarterly revenue forecast", "revenue", "single term"),
      line("Quarterly revenue forecast", "quarterly forecast", "two terms"),
      line("Quarterly revenue forecast", "REVENUE", "case-insensitive"),
      line("Quarterly revenue forecast", "margin", "no match — plain text"),
      line("Revenue, revenue, revenue", "revenue", "repeated term"),
    );
    return col;
  },
};
