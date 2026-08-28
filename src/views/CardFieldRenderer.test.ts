import { describe, expect, it, vi } from "vitest";
import { classifyCardField, formatCardNumber, getCardRatingValue, isCardFieldEmpty } from "./CardFieldRenderer";
import type { ColumnDef } from "../data/types";

// The helpers under test are pure, but this module's import chain reaches the
// obsidian runtime package, which has no resolvable entry outside the app. Stub
// it the same way the other suites do so the chain loads under the test runner.
vi.mock("obsidian", () => ({
  App: class {},
  CachedMetadata: class {},
  TFile: class {},
  TFolder: class {},
  Modal: class {},
  Menu: class {},
  Notice: class {},
  Component: class {},
  Setting: class {},
  Platform: { isMobile: false },
  MarkdownRenderer: { render: vi.fn(), renderMarkdown: vi.fn() },
  setIcon: vi.fn(),
  debounce: (fn: unknown) => fn,
  getAllTags: vi.fn(() => []),
  normalizePath: (path: string) => path,
}));

const column = (type: ColumnDef["type"], key = "value"): ColumnDef => ({ key, label: key, type });

describe("CardFieldRenderer presentation helpers", () => {
  it("classifies the shared card field display families", () => {
    expect(classifyCardField(column("select"), "select")).toBe("badge");
    expect(classifyCardField(column("multi-select"), "multi-select")).toBe("badges");
    expect(classifyCardField(column("relation"), "relation")).toBe("relation");
    expect(classifyCardField(column("number"), "number")).toBe("number");
    expect(classifyCardField(column("date"), "date")).toBe("date");
    expect(classifyCardField(column("checkbox"), "checkbox")).toBe("checkbox");
  });

  it("normalizes empty values and tabular number text without mutating data", () => {
    expect(isCardFieldEmpty(undefined)).toBe(true);
    expect(isCardFieldEmpty([])).toBe(true);
    expect(isCardFieldEmpty("0")).toBe(false);
    expect(formatCardNumber(12.5)).toBe("12.5");
    expect(formatCardNumber(["one", "two"])).toBe("one, two");
  });

  it("clamps rating values to the configured range", () => {
    expect(getCardRatingValue(-2)).toBe(0);
    expect(getCardRatingValue(3)).toBe(3);
    expect(getCardRatingValue(12, 5)).toBe(5);
    expect(getCardRatingValue("not a number")).toBeNull();
  });
});
