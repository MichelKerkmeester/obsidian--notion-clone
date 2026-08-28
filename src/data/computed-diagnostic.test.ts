// ───────────────────────────────────────────────────────────────────
// MODULE:    computed-diagnostic.test
// COMPONENT: locks the error-message symbol extraction pattern
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { extractComputedDiagnosticSymbol } from "./computed-diagnostic";

// ───────────────────────────────────────────────────────────────────
// 1. SYMBOL EXTRACTION
// ───────────────────────────────────────────────────────────────────

describe("computed diagnostic helpers", () => {
  it("extracts the unresolved symbol while leaving other messages untouched", () => {
    expect(extractComputedDiagnosticSymbol("Undefined variable or field: missing_total")).toBe("missing_total");
    expect(extractComputedDiagnosticSymbol("Division by zero")).toBeUndefined();
  });
});
