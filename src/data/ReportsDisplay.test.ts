import { describe, expect, it } from "vitest";
import { formatReportsNumber } from "./ReportsDisplay";

describe("Reports display values", () => {
  it("formats the known remaining value", () => {
    expect(formatReportsNumber(1000 - 400)).toBe("600");
  });

  it("uses Dutch grouping for larger values", () => {
    expect(formatReportsNumber(1000)).toBe("1.000");
  });

  it("keeps a real zero numeric", () => {
    expect(formatReportsNumber(0)).toBe("0");
  });

  it.each([null, undefined, "", "not a formula result", Number.NaN, Number.POSITIVE_INFINITY])(
    "fails closed for %s",
    (value) => {
      expect(formatReportsNumber(value)).toBe("-");
    },
  );
});
