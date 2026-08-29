// ───────────────────────────────────────────────────────────────────
// MODULE:    number-display-renderer.stories
// COMPONENT: catalogue entries for numeric cell display styles
// ───────────────────────────────────────────────────────────────────
//
// A number can render four ways, and the choice is per column. Seeing them
// together is the only practical way to check they share a baseline and a
// vertical rhythm — in a real table they never appear side by side.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { renderProgress, renderProgressRing, renderRating } from "./number-display-renderer";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Fields/Number display" };
export default meta;

type Story = StoryObj;

function strip(label: string, build: (host: HTMLElement) => void): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "db-story-cell";
  const caption = document.createElement("span");
  caption.className = "db-story-note";
  caption.textContent = label;
  const host = document.createElement("div");
  build(host);
  wrap.append(host, caption);
  return wrap;
}

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

/** Star, outline and emoji variants at the same value, so weight differences show. */
export const Rating: Story = {
  render: () => {
    const row = document.createElement("div");
    row.className = "db-story-row";
    row.append(
      strip("Default, 3/5", (h) => renderRating(h, 3)),
      strip("Outline", (h) => renderRating(h, 3, { ratingVariant: "outline" })),
      strip("Flame, max 3", (h) => renderRating(h, 2, { ratingSymbol: "flame", ratingMax: 3 })),
      strip("Emoji", (h) => renderRating(h, 4, { ratingSymbol: "emoji", ratingEmoji: "🌶" })),
    );
    return row;
  },
};

/** Empty, partial and full, plus a value past the divisor — the case that used to overflow. */
export const Progress: Story = {
  render: () => {
    const row = document.createElement("div");
    row.className = "db-story-row";
    row.append(
      strip("0%", (h) => renderProgress(h, 0)),
      strip("35%", (h) => renderProgress(h, 35)),
      strip("100%", (h) => renderProgress(h, 100)),
      strip("Over 100", (h) => renderProgress(h, 140)),
      strip("No value shown", (h) => renderProgress(h, 60, { progressShowValue: false })),
    );
    return row;
  },
};

/** The ring shares the progress geometry; check the stroke reads at the same weight. */
export const Ring: Story = {
  render: () => {
    const row = document.createElement("div");
    row.className = "db-story-row";
    row.append(
      strip("0%", (h) => renderProgressRing(h, 0)),
      strip("35%", (h) => renderProgressRing(h, 35)),
      strip("100%", (h) => renderProgressRing(h, 100)),
      strip("Divisor 10", (h) => renderProgressRing(h, 7, { progressDivisor: 10 })),
    );
    return row;
  },
};
