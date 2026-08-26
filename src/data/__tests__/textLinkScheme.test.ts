import { describe, expect, it } from "vitest";
import { assembleSchemeLinkTarget, isTextLinkScheme } from "../textLinkScheme";
import type { ColumnDef } from "../types";

describe("assembleSchemeLinkTarget", () => {
  it("T1 assembles a bare web value with https", () => {
    expect(assembleSchemeLinkTarget("https", "www.acme.com")).toBe("https://www.acme.com");
  });

  it("T2 preserves a full https value", () => {
    expect(assembleSchemeLinkTarget("https", "https://acme.com/path?q=1")).toBe("https://acme.com/path?q=1");
  });

  it("T3 rejects a mailto value under https", () => {
    expect(assembleSchemeLinkTarget("https", "mailto:a@b.c")).toBeNull();
  });

  it("T4 rejects javascript values", () => {
    expect(assembleSchemeLinkTarget("https", "javascript:alert(1)")).toBeNull();
    expect(assembleSchemeLinkTarget("mailto", "javascript:alert(1)")).toBeNull();
    expect(assembleSchemeLinkTarget("tel", "javascript:alert(1)")).toBeNull();
  });

  it("T5 assembles a bare email value with mailto", () => {
    expect(assembleSchemeLinkTarget("mailto", "a@b.c")).toBe("mailto:a@b.c");
  });

  it("T5b preserves a full mailto value", () => {
    expect(assembleSchemeLinkTarget("mailto", "mailto:a@b.c")).toBe("mailto:a@b.c");
  });

  it("T6 strips separators from a bare telephone value", () => {
    expect(assembleSchemeLinkTarget("tel", "+31 20 123")).toBe("tel:+3120123");
  });

  it("T6b strips separators from an existing telephone value", () => {
    expect(assembleSchemeLinkTarget("tel", "tel:+31 (20) 123")).toBe("tel:+3120123");
  });

  it("T7 rejects empty and whitespace-only values", () => {
    expect(assembleSchemeLinkTarget("https", "")).toBeNull();
    expect(assembleSchemeLinkTarget("https", "   ")).toBeNull();
  });

  it("T8 rejects values longer than 2048 characters", () => {
    expect(assembleSchemeLinkTarget("https", "a".repeat(2049))).toBeNull();
  });

  it("T9 rejects line and tab characters", () => {
    expect(assembleSchemeLinkTarget("https", "https://acme.com\r\nnext")).toBeNull();
    expect(assembleSchemeLinkTarget("https", "https://acme.com\tpath")).toBeNull();
  });

  it("T10 rejects non-string and null values", () => {
    expect(assembleSchemeLinkTarget("https", 42)).toBeNull();
    expect(assembleSchemeLinkTarget("https", null)).toBeNull();
  });

  it("T11 preserves an http value under the https family", () => {
    expect(assembleSchemeLinkTarget("https", "http://x.io")).toBe("http://x.io");
  });

  it("rejects schemes outside the closed allowlist", () => {
    expect(isTextLinkScheme("ftp")).toBe(false);
  });
});

describe("ColumnDef JSON round-trip", () => {
  it("preserves a text link scheme and omits an absent scheme", () => {
    const column: Pick<ColumnDef, "key" | "label" | "type" | "textLinkScheme"> = {
      key: "c",
      label: "C",
      type: "text",
      textLinkScheme: "mailto",
    };
    const roundTripped = JSON.parse(JSON.stringify(column)) as typeof column;
    expect(roundTripped.textLinkScheme).toBe("mailto");

    const withoutScheme = { key: "c", label: "C", type: "text" };
    expect(Object.prototype.hasOwnProperty.call(JSON.parse(JSON.stringify(withoutScheme)), "textLinkScheme")).toBe(false);
  });
});
