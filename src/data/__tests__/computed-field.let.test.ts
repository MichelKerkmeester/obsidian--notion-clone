// ───────────────────────────────────────────────────────────────────
// MODULE:    computed-field.let.test
// COMPONENT: LET/LETS binding-semantics regression matrix
// ───────────────────────────────────────────────────────────────────
//
// let/lets add lexical scoping to an otherwise flat formula language, which
// opens the door to subtle regressions: a binding leaking into the
// surrounding expression, shadowing resolving to the wrong scope, or a
// binding name colliding with a builtin (e.g. "round") and silently
// changing what a formula computes. This matrix pins each of those cases.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { beforeAll, describe, expect, it } from "vitest";
import { ComputedFieldEngine } from "../computed-field";
import { setLocale } from "../../i18n";

const engine = new ComputedFieldEngine([]);

function evaluate(
  expression: string,
  frontmatter: Record<string, unknown> = {},
  computed: Record<string, unknown> = {},
) {
  return engine.evaluateSingleDetailed(expression, frontmatter, computed);
}

function expectValue(
  expression: string,
  expected: unknown,
  frontmatter: Record<string, unknown> = {},
): void {
  const result = evaluate(expression, frontmatter);
  expect(result.error).toBeUndefined();
  expect(result.value).toEqual(expected);
}

function expectError(expression: string, expected: string): void {
  const result = evaluate(expression);
  expect(result.value).toBeNull();
  expect(result.error).toBe(expected);
}

beforeAll(() => {
  setLocale("en");
});

describe("ComputedFieldEngine LET/LETS matrix", () => {
  it("evaluates a value with one local binding", () => {
    expectValue('let("rate", 0.05, amount * rate)', 5, { amount: 100 });
  });

  it("supports multiple bindings with let", () => {
    expectValue('let("a", 1, "b", 2, a + b)', 3);
  });

  it("supports multiple bindings with lets", () => {
    expectValue('lets("a", 1, "b", 2, a + b)', 3);
  });

  it("evaluates sequential bindings from left to right", () => {
    expectValue('lets("a", 1, "b", a + 1, a + b)', 3);
  });

  it("evaluates nested bindings", () => {
    expectValue('let("firstName", "Monkey", let("lastName", "D. Luffy", firstName + " " + lastName))', "Monkey D. Luffy");
  });

  it("allows an inner binding to shadow an outer binding", () => {
    expectValue('let("lastName", "Luffy", "Monkey D. " + let("lastName", "Garp", lastName))', "Monkey D. Garp");
  });

  it("does not leak a binding into the surrounding expression", () => {
    const result = evaluate('let("rate", 0.05, rate) + rate');
    expect(result.error).toBeUndefined();
    expect(result.value).toBeNaN();
  });

  it("builds a greeting with a bound name", () => {
    expectValue('let("person", "Alan", "Hello, " + person + "!")', "Hello, Alan!");
  });

  it("uses the numeric pi constant and fork power operator", () => {
    expectValue('let("radius",4,round(pi * radius ** 2, 0))', 50);
  });

  it("calculates a triangle area with multiple bindings", () => {
    expectValue('lets("base", 3, "height", 8, base * height / 2)', 12);
  });

  it("normalizes bracket and field references in let expressions", () => {
    expectValue('let("total", [amount], total)', 100, { amount: 100 });
    expectValue('let("total", field("amount"), total)', 100, { amount: 100 });
  });

  it("reports a built-in collision as a not-function error", () => {
    expectError(
      'let("round", 5, round(3.14))',
      '"round" is not a function. Check spelling or if a field name was used by mistake.',
    );
  });

  it("reports malformed argument counts with a typed error", () => {
    expectError('lets("a", 1)', "let/lets requires name/value pairs followed by a result.");
  });

  it("reports malformed binding names with a typed error", () => {
    expectError("let(5, 1, 2)", "let/lets variable names must be quoted identifiers.");
    expectError('let("a b", 1, 2)', "let/lets variable names must be quoted identifiers.");
    expectError('let("if", 1, 2)', "let/lets variable names must be quoted identifiers.");
  });

  it("returns the evaluator's undefined value for a self-reference", () => {
    const result = evaluate('let("a", a, a)');
    expect(result.error).toBeUndefined();
    expect(result.value).toBeUndefined();
  });

  it("composes with the uppercase eager IF helper", () => {
    expectValue('IF(amount>50, let("rate",0.1,amount*rate), 0)', 10, { amount: 100 });
  });

  it("composes with the phase math alias when available", () => {
    const availability = evaluate("SQRT(4)");
    if (availability.error) return;
    expectValue('let("r",4,SQRT(pi * r ** 2))', Math.sqrt(Math.PI * 16));
  });

  it("preserves no-let rounding behavior", () => {
    expectValue("round(3.14, 2)", 3.14);
  });

  it("keeps arrow functions blocked for user formulas", () => {
    expectError("__let((a) => a, 5)", "Arrow functions are not allowed in formulas");
  });
});
