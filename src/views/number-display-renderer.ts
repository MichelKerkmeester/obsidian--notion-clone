// ───────────────────────────────────────────────────────────────────
// MODULE:    number-display-renderer
// COMPONENT: renders the rating/progress-bar/progress-ring styles a
//            number column can display, each optionally interactive
// ───────────────────────────────────────────────────────────────────
//
// Each renderer both draws the static display and, when `interaction`
// is passed, wires pointer/keyboard editing directly onto the same
// element — there is no separate "edit mode" markup to swap in, so the
// hover/keydown handlers below must stay in sync with the shapes they
// annotate.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { buildRatingSlots, formatProgressValue, progressFillPercent, ringGeometry, RatingSlot } from "../data/number-display";
import { NumberDisplayConfig } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

/** Fill width (%) of the accent overlay per slot: full=100, half=50, empty=0. */
const RATING_SLOT_FILL: Record<RatingSlot, number> = { full: 100, half: 50, empty: 0 };
const DEFAULT_RATING_EMOJI = "⭐";

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface NumberDisplayInteraction {
  onChange?: (value: number) => void | Promise<void | boolean>;
}

// ───────────────────────────────────────────────────────────────────
// 4. HELPERS
// ───────────────────────────────────────────────────────────────────

/** Apply the tint color as a `db-num-color-<name>` class (CSS sets --db-number-color). */
function applyColorClass(el: HTMLElement, color: string | undefined): void {
  if (color) el.addClass(`db-num-color-${color}`);
}

// ───────────────────────────────────────────────────────────────────
// 5. RENDERERS
// ───────────────────────────────────────────────────────────────────

/** Render a rating into `parent`: each slot is a faint base glyph with
 *  an accent overlay clipped to the fill width (full/half/empty).
 *  Caller must guarantee `value` is a finite number. */
export function renderRating(parent: HTMLElement, value: number, config?: NumberDisplayConfig, interaction?: NumberDisplayInteraction): void {
  const max = config?.ratingMax && config.ratingMax > 0 ? config.ratingMax : 5;
  const symbol = config?.ratingSymbol || "star";
  const isEmoji = symbol === "emoji";
  const emoji = config?.ratingEmoji?.trim() || DEFAULT_RATING_EMOJI;
  const container = parent.createSpan({
    cls: `db-cell-rating${config?.ratingVariant === "outline" && !isEmoji ? " is-outline" : ""}${isEmoji ? " is-emoji" : ""}`,
  });
  container.addClass("db-numeric-value");
  if (!isEmoji) applyColorClass(container, config?.color);
  const foregrounds: HTMLElement[] = [];
  const initialWidths: string[] = [];
  for (const [index, slot] of buildRatingSlots(value, max).entries()) {
    const star = container.createSpan({ cls: "db-rating-star" });
    if (interaction?.onChange) {
      star.setAttribute("role", "button");
      star.tabIndex = 0;
      star.setAttribute("aria-label", `${slot} ${symbol}`);
      const nextValue = index + 1;
      star.onclick = () => { void interaction.onChange?.(nextValue); };
      star.onkeydown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void interaction.onChange?.(nextValue);
        }
      };
      star.addEventListener("mouseenter", () => {
        foregrounds.forEach((foreground, foregroundIndex) => {
          foreground.style.width = foregroundIndex <= index ? "100%" : "0%";
        });
      });
    }
    const bg = star.createSpan({ cls: "db-rating-star-bg" });
    if (isEmoji) bg.createSpan({ cls: "db-rating-emoji", text: emoji });
    else setIcon(bg, symbol);
    const fg = star.createSpan({ cls: "db-rating-star-fg" });
    fg.style.width = `${RATING_SLOT_FILL[slot]}%`;
    foregrounds.push(fg);
    initialWidths.push(fg.style.width);
    if (isEmoji) fg.createSpan({ cls: "db-rating-emoji", text: emoji });
    else setIcon(fg, symbol);
  }
  if (interaction?.onChange) {
    container.addEventListener("mouseleave", () => {
      foregrounds.forEach((foreground, index) => { foreground.style.width = initialWidths[index]; });
    });
  }
}

/** Render a progress bar into `parent`. fill = value/divisor; text = raw value when showValue.
 *  Caller must guarantee `value` is a finite number. */
export function renderProgress(parent: HTMLElement, value: number, config?: NumberDisplayConfig, interaction?: NumberDisplayInteraction): void {
  const divisor = config?.progressDivisor && config.progressDivisor > 0 ? config.progressDivisor : 100;
  const percent = progressFillPercent(value, divisor);
  if (percent == null) return;
  const showValue = config?.progressShowValue !== false;
  const container = parent.createDiv({ cls: "db-cell-progress" });
  container.addClass("db-numeric-value");
  applyColorClass(container, config?.color);
  const track = container.createDiv({ cls: "db-cell-progress-track" });
  if (interaction?.onChange) {
    track.setAttribute("role", "slider");
    track.tabIndex = 0;
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(divisor));
    track.setAttribute("aria-valuenow", String(value));
    const setFromPoint = (clientX: number): void => {
      const rect = track.getBoundingClientRect();
      const ratio = rect.width > 0 ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) : 0;
      void interaction.onChange?.(Math.round(ratio * divisor * 100) / 100);
    };
    let pointerActive = false;
    track.onclick = (event) => setFromPoint(event.clientX);
    track.addEventListener("pointerdown", (event) => {
      pointerActive = true;
      event.preventDefault();
      track.setPointerCapture?.(event.pointerId);
      setFromPoint(event.clientX);
    });
    track.addEventListener("pointermove", (event) => {
      if (!pointerActive) return;
      event.preventDefault();
      setFromPoint(event.clientX);
    });
    track.addEventListener("pointerup", (event) => {
      if (!pointerActive) return;
      pointerActive = false;
      event.preventDefault();
      track.releasePointerCapture?.(event.pointerId);
    });
    track.addEventListener("pointercancel", () => { pointerActive = false; });
    track.onkeydown = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const delta = divisor / 100;
      void interaction.onChange?.(Math.max(0, Math.min(divisor, value + (event.key === "ArrowRight" ? delta : -delta))));
    };
  }
  const fill = track.createDiv({ cls: "db-cell-progress-fill" });
  fill.style.width = `${percent}%`;
  if (showValue) container.createSpan({ cls: "db-cell-progress-text", text: formatProgressValue(value) });
}

/** Render a circular ring progress into `parent`. fill = value/divisor; the raw value is shown
 *  beside the ring when showValue (Notion-style, ring center empty). */
export function renderProgressRing(parent: HTMLElement, value: number, config?: NumberDisplayConfig, interaction?: NumberDisplayInteraction): void {
  const divisor = config?.progressDivisor && config.progressDivisor > 0 ? config.progressDivisor : 100;
  const percent = progressFillPercent(value, divisor);
  if (percent == null) return;
  const showValue = config?.progressShowValue !== false;
  const RADIUS = 9;
  const { circumference, dashOffset } = ringGeometry(percent, RADIUS);
  const container = parent.createSpan({ cls: "db-cell-progress-ring" });
  container.addClass("db-numeric-value");
  if (interaction?.onChange) {
    container.setAttribute("role", "slider");
    container.tabIndex = 0;
    container.setAttribute("aria-valuemin", "0");
    container.setAttribute("aria-valuemax", String(divisor));
    container.setAttribute("aria-valuenow", String(value));
    container.onclick = () => { void interaction.onChange?.(value >= divisor ? 0 : divisor); };
    container.onkeydown = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const delta = divisor / 100;
      void interaction.onChange?.(Math.max(0, Math.min(divisor, value + (event.key === "ArrowRight" ? delta : -delta))));
    };
  }
  applyColorClass(container, config?.color);
  const svg = container.createSvg("svg", { attr: { viewBox: "0 0 24 24", width: 20, height: 20 } });
  svg.createSvg("circle", { attr: { cx: 12, cy: 12, r: RADIUS, fill: "none", "stroke-width": 4 } })
    .addClass("db-progress-ring-track");
  svg.createSvg("circle", {
    attr: {
      cx: 12, cy: 12, r: RADIUS, fill: "none", "stroke-width": 4, "stroke-linecap": "round",
      "stroke-dasharray": String(circumference), "stroke-dashoffset": String(dashOffset),
      transform: "rotate(-90 12 12)",
    },
  }).addClass("db-progress-ring-arc");
  if (showValue) container.createSpan({ cls: "db-progress-ring-text", text: formatProgressValue(value) });
}
