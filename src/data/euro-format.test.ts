// ───────────────────────────────────────────────────────────────────
// MODULE:    euro-format.test
// COMPONENT: locks the nl-NL grouping, separator and euro sign the number cells depend on
// ───────────────────────────────────────────────────────────────────
//
// These three functions decide what every numeric cell, card field and footer
// summary reads as, across five calling surfaces, and until now not one of them
// had a test. The stock renderer prints integers through String(), so a silent
// regression here does not throw or crash — it quietly shows 1000.24 where the
// row behind it shows 1.000,24, and the two disagree in front of the user.
//
// The separators are the point, not the arithmetic. "." groups thousands and ","
// is the decimal mark, which is the reverse of the runtime default, so an
// assertion written from habit rather than from output passes for the wrong
// string.

import { describe, expect, it } from "vitest";
import { formatEuroCurrency, formatEuroNumber, formatEuroNumber2 } from "./euro-format";

// The euro sign is followed by U+00A0, not a space. Intl emits a non-breaking
// space there and a literal " " in this file would fail against output that is
// correct. Named so it survives someone tidying the string.
const NBSP = " ";

// ───────────────────────────────────────────────────────────────────
// 1. GROUPED WHOLE NUMBERS
// ───────────────────────────────────────────────────────────────────

describe("nl-NL grouping", () => {
  it("groups thousands with a dot in all three formatters", () => {
    expect(formatEuroNumber(1000000)).toBe("1.000.000");
    expect(formatEuroNumber2(1000000)).toBe("1.000.000");
    expect(formatEuroCurrency(1000)).toBe(`€${NBSP}1.000`);
  });

  it("leaves a value below the grouping threshold ungrouped", () => {
    expect(formatEuroNumber(999)).toBe("999");
  });
});

// ───────────────────────────────────────────────────────────────────
// 2. DECIMALS AND THEIR CEILINGS
// ───────────────────────────────────────────────────────────────────

describe("nl-NL decimals", () => {
  it("uses a comma as the decimal mark", () => {
    expect(formatEuroNumber(1000000.25)).toBe("1.000.000,25");
    expect(formatEuroNumber2(4429.5)).toBe("4.429,5");
    expect(formatEuroCurrency(34.21)).toBe(`€${NBSP}34,21`);
  });

  // The two plain formatters differ only in this ceiling, which is the whole
  // reason both exist: cells carry up to six fraction digits, footer summaries
  // round to two. Asserted on one value so a swapped import fails here rather
  // than surfacing as a footer that disagrees with the column above it.
  it("separates the six-digit cell ceiling from the two-digit summary one", () => {
    expect(formatEuroNumber(1.234567)).toBe("1,234567");
    expect(formatEuroNumber2(1.234567)).toBe("1,23");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE NON-FINITE GUARD
// ───────────────────────────────────────────────────────────────────

describe("non-finite values", () => {
  // Without the guard Intl renders these as "NaN" and "∞", which read as data.
  // The placeholder is the same one an empty cell shows, so a broken computed
  // field looks empty instead of looking like a number nobody can act on.
  it("renders the placeholder rather than a formatted NaN or infinity", () => {
    for (const format of [formatEuroNumber, formatEuroNumber2, formatEuroCurrency]) {
      expect(format(Number.NaN)).toBe("-");
      expect(format(Number.POSITIVE_INFINITY)).toBe("-");
      expect(format(Number.NEGATIVE_INFINITY)).toBe("-");
    }
  });

  it("still formats zero, which is finite and not a placeholder", () => {
    expect(formatEuroNumber(0)).toBe("0");
    expect(formatEuroCurrency(0)).toBe(`€${NBSP}0`);
  });
});
