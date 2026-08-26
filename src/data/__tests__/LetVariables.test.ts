import { describe, expect, it } from "vitest";
import { transformLetCalls } from "../LetVariables";

describe("transformLetCalls", () => {
  it("keeps commas inside quoted values within one argument", () => {
    expect(transformLetCalls('let("a", "x,y", a)')).toBe('__let((a) => a, "x,y")');
  });

  it("does not rewrite string contents or member calls", () => {
    expect(transformLetCalls('"let(" + value')).toBe('"let(" + value');
    expect(transformLetCalls('obj.let("a", 1, a)')).toBe('obj.let("a", 1, a)');
  });

  it("accepts whitespace before the call parenthesis", () => {
    expect(transformLetCalls('let ("a",1,a)')).toBe('__let((a) => a, 1)');
  });

  it("emits sequential bindings as nested calls", () => {
    expect(transformLetCalls('lets("a", 1, "b", a + 1, a + b)')).toBe(
      '__let((a) => __let((b) => a + b, a + 1), 1)',
    );
  });

  it("recurses into value-position bindings", () => {
    expect(transformLetCalls('let("a", let("b",1,b+1), a)')).toBe(
      '__let((a) => a, __let((b) => b+1, 1))',
    );
  });

  it("rejects calls without complete name/value pairs and a result", () => {
    expect(() => transformLetCalls('lets("a",1)')).toThrow("let:argCount");
  });

  it("rejects non-identifier binding names", () => {
    expect(() => transformLetCalls("let(5,1,2)")).toThrow("let:name");
    expect(() => transformLetCalls('let("a b",1,2)')).toThrow("let:name");
    expect(() => transformLetCalls('let("if",1,2)')).toThrow("let:name");
  });

  it("allows let as a binding name", () => {
    expect(transformLetCalls("let(\"let\",5,let+1)")).toBe('__let((let) => let+1, 5)');
  });
});
