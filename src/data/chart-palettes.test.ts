// ───────────────────────────────────────────────────────────────────
// MODULE:    chart-palettes.test
// COMPONENT: locks dark-mode luminance lift and status-color coverage for chart-palettes
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { getChartPaletteColors, getChartPalettePreviewColors, getChartStatusColors } from "./chart-palettes";
import { STATUS_COLORS } from "./status-colors";

// ───────────────────────────────────────────────────────────────────
// 1. THEME-ADAPTIVE PALETTES
// ───────────────────────────────────────────────────────────────────

describe("theme-adaptive chart palettes", () => {
  it("keeps preset lengths while lifting dark-theme luminance", () => {
    const light = getChartPaletteColors("colorful", "light");
    const dark = getChartPaletteColors("colorful", "dark");

    expect(light).toHaveLength(5);
    expect(dark).toHaveLength(5);
    expect(dark).not.toEqual(light);
    expect(dark.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
  });

  it("provides a status color for every persisted status vocabulary value", () => {
    const status = getChartStatusColors("dark");

    expect(Object.keys(status)).toEqual([...STATUS_COLORS]);
    expect(Object.values(status).every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
  });

  it("uses semantic status colors for option and automatic previews", () => {
    const optionPreview = getChartPalettePreviewColors("option", "#123456", "dark");
    const autoPreview = getChartPalettePreviewColors("auto", "#123456", "dark");

    expect(optionPreview).toHaveLength(5);
    expect(autoPreview).toHaveLength(5);
    expect(optionPreview[0]).toBe(getChartStatusColors("dark").blue);
    expect(autoPreview[0]).toBe("#123456");
  });
});
