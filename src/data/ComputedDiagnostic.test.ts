import { describe, expect, it } from "vitest";
import { extractComputedDiagnosticSymbol } from "./ComputedDiagnostic";

describe("computed diagnostic helpers", () => {
  it("extracts the unresolved symbol while leaving other messages untouched", () => {
    expect(extractComputedDiagnosticSymbol("Undefined variable or field: missing_total")).toBe("missing_total");
    expect(extractComputedDiagnosticSymbol("Division by zero")).toBeUndefined();
  });
});
