// ───────────────────────────────────────────────────────────────────
// MODULE:    i18n-plural.test
// COMPONENT: a count of one reads as one, in every locale that ships
// ───────────────────────────────────────────────────────────────────
//
// "1 cells selected" was reported off a phone. The dictionary had one string
// for the count and it was the plural, so every selection of a single cell
// announced itself ungrammatically — in the status bar, in the embedded bar,
// and through the live region a screen reader reads.
//
// The dictionary has no plural machinery and this does not add any. Three
// locales, one extra key each, chosen at the call by count. What is worth a
// test is not the ternary but the pair: a singular key that exists in English
// and not in the other two would fall back to English mid-sentence, which is
// the failure a per-locale dictionary exists to prevent and the one nobody
// looks for.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";

import { setLocale, tSelectedCells } from "./i18n";

// ───────────────────────────────────────────────────────────────────
// 2. ASSERTIONS
// ───────────────────────────────────────────────────────────────────

describe("selected-cell count", () => {
  it("reads as singular for one and plural for more, in English", () => {
    setLocale("en");
    expect(tSelectedCells(1)).toBe("1 cell selected");
    expect(tSelectedCells(2)).toBe("2 cells selected");
    expect(tSelectedCells(0)).toBe("0 cells selected");
  });

  // The count still has to appear. A singular string that dropped its
  // placeholder would read "cell selected" and pass a naive equality on the
  // plural alone.
  it("carries the count in every locale that ships", () => {
    for (const locale of ["en", "zh-CN", "zh-TW"] as const) {
      setLocale(locale);
      expect(tSelectedCells(1)).toContain("1");
      expect(tSelectedCells(7)).toContain("7");
      // Not the key name: a missing key resolves to itself, which is how
      // `calendar.unscheduled` once shipped as literal text.
      expect(tSelectedCells(1)).not.toContain("toolbar.selectedCell");
    }
    setLocale("en");
  });

  // English only, and deliberately so. Neither Chinese locale inflects a noun
  // for number — "已选择 1 个单元格" is right for one and for many — so a test
  // demanding two different strings there would be demanding a mistranslation.
  // Both still get the key, because a locale missing it falls back to English
  // mid-sentence, and that is the failure a per-locale dictionary prevents.
  it("gives one and many different strings where the language inflects", () => {
    setLocale("en");
    const one = tSelectedCells(1).replace("1", "N");
    const many = tSelectedCells(2).replace("2", "N");
    expect(one).not.toBe(many);
  });
});
