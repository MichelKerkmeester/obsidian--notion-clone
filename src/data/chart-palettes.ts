// ───────────────────────────────────────────────────────────────────
// MODULE:    chart-palettes
// COMPONENT: theme-adaptive color presets and status colors for charts
// ───────────────────────────────────────────────────────────────────
//
// Every preset/status hex was picked for a light background; adaptChartColor
// pushes the minimum saturation/lightness up per theme mode so the same
// stored color doesn't go muddy or low-contrast when the vault is in dark
// mode — colors are computed at read time, never rewritten in storage.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { ChartColorPalette, StatusColor } from "./types";
import { STATUS_COLORS } from "./status-colors";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export type ChartPresetPalette = Exclude<ChartColorPalette, "auto" | "accent" | "option">;
export type ChartThemeMode = "light" | "dark";

// ───────────────────────────────────────────────────────────────────
// 3. PALETTES
// ───────────────────────────────────────────────────────────────────

/**
 * Chart color presets picked from Color Hunt's popular all-time palettes.
 * Keep the internal keys stable for saved views; the user-facing names live in i18n.
 */
export const CHART_PRESET_PALETTES: Record<ChartPresetPalette, string[]> = {
  colorful: ["#F9ED69", "#F08A5D", "#B83B5E", "#6A2C70", "#3F1D38"],
  pastel: ["#B1B2FF", "#AAC4FF", "#D2DAFF", "#EEF1FF", "#F8F9FF"],
  vivid: ["#2B2E4A", "#E84545", "#903749", "#53354A", "#1F2235"],
  warm: ["#FFF5E4", "#FFE3E1", "#FFD1D1", "#FF9494", "#E67373"],
  cool: ["#1B262C", "#0F4C75", "#3282B8", "#BBE1FA", "#E3F6FF"],
  mono: ["#222831", "#393E46", "#00ADB5", "#EEEEEE", "#F8F8F8"],
};

const CHART_STATUS_BASE_COLORS: Record<StatusColor, string> = {
  gray: "#64748b",
  brown: "#9f6b53",
  orange: "#d9730d",
  yellow: "#cb912f",
  green: "#448361",
  blue: "#337ea9",
  purple: "#9065b0",
  pink: "#c14c8a",
  red: "#d44c47",
  slate: "#64748b",
  cyan: "#0891b2",
  teal: "#0f766e",
  lime: "#65a30d",
  indigo: "#4f46e5",
  violet: "#7c3aed",
  rose: "#e11d48",
};

// ───────────────────────────────────────────────────────────────────
// 4. PALETTE LOOKUP
// ───────────────────────────────────────────────────────────────────

export function getChartPaletteColors(palette: ChartPresetPalette, mode: ChartThemeMode = "light"): string[] {
  const colors = CHART_PRESET_PALETTES[palette] || CHART_PRESET_PALETTES.colorful;
  return colors.map((color, index) => adaptChartColor(color, mode, index));
}

export function getChartStatusColors(mode: ChartThemeMode = "light"): Record<StatusColor, string> {
  return Object.fromEntries(
    STATUS_COLORS.map((color, index) => [color, adaptChartColor(CHART_STATUS_BASE_COLORS[color], mode, index)]),
  ) as Record<StatusColor, string>;
}

export function getChartPalettePreviewColors(
  palette: ChartColorPalette,
  accent = "#7c7dde",
  mode: ChartThemeMode = "light",
): string[] {
  if (palette === "accent") return [accent, accent, accent, accent, accent];
  const status = getChartStatusColors(mode);
  if (palette === "option") return [status.blue, status.green, status.orange, status.red, status.violet];
  if (palette === "auto") return [accent, status.green, status.orange, status.red, status.violet];
  return getChartPaletteColors(palette, mode).slice(0, 5);
}

// ───────────────────────────────────────────────────────────────────
// 5. COLOR ADAPTATION
// ───────────────────────────────────────────────────────────────────

function adaptChartColor(color: string, mode: ChartThemeMode, index: number): string {
  const hsl = hexToHsl(color);
  if (!hsl) return color;
  const [hue, saturation, lightness] = hsl;
  const minimumSaturation = mode === "dark" ? 0.62 : 0.52;
  const nextSaturation = clamp(Math.max(saturation, minimumSaturation), 0.52, 0.92);
  const minimumLightness = mode === "dark" ? 0.58 + (index % 3) * 0.03 : 0.38;
  const maximumLightness = mode === "dark" ? 0.82 : 0.68;
  const nextLightness = clamp(Math.max(lightness, minimumLightness), 0.36, maximumLightness);
  return hslToHex(hue, nextSaturation, nextLightness);
}

function hexToHsl(hex: string): [number, number, number] | null {
  const match = hex.match(/^#([0-9a-f]{6})$/i);
  if (!match) return null;
  const values = [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = values;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, lightness];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue: number;
  if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
  else if (max === green) hue = ((blue - red) / delta + 2) / 6;
  else hue = ((red - green) / delta + 4) / 6;
  return [hue, saturation, lightness];
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const hueToRgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (saturation === 0) {
    const value = Math.round(lightness * 255).toString(16).padStart(2, "0");
    return `#${value}${value}${value}`;
  }
  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  const red = Math.round(hueToRgb(p, q, hue + 1 / 3) * 255);
  const green = Math.round(hueToRgb(p, q, hue) * 255);
  const blue = Math.round(hueToRgb(p, q, hue - 1 / 3) * 255);
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
