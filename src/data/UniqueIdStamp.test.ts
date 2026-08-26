import { describe, expect, it } from "vitest";
import { nextUniqueId, parseUniqueIdConfig } from "./UniqueIdStamp";

describe("parseUniqueIdConfig", () => {
  it("fills defaults for a prefixed config", () => {
    const config = parseUniqueIdConfig({ prefix: " INV " });

    expect(config).toEqual({
      prefix: "INV",
      counter: 0,
      padWidth: 3,
      field: "unique-id",
    });
    expect(nextUniqueId(config!)).toEqual({ value: "INV-001", nextCounter: 1 });
  });

  it("formats a missing prefix with the default padding", () => {
    const config = parseUniqueIdConfig({});

    expect(nextUniqueId(config!)).toEqual({ value: "001", nextCounter: 1 });
  });

  it("defaults the field name for an empty object", () => {
    expect(parseUniqueIdConfig({})?.field).toBe("unique-id");
  });

  it.each([undefined, null, "INV", 42, []])("returns undefined for %p", (raw) => {
    expect(parseUniqueIdConfig(raw)).toBeUndefined();
  });
});

describe("nextUniqueId", () => {
  it("does not duplicate the separator for a trailing-hyphen prefix", () => {
    expect(nextUniqueId({ prefix: "INV-", counter: 0, field: "unique-id" })).toEqual({
      value: "INV-001",
      nextCounter: 1,
    });
  });

  it("uses safe defaults for invalid counter and padding values", () => {
    expect(nextUniqueId({ prefix: "INV", counter: -1, padWidth: 0, field: "unique-id" })).toEqual({
      value: "INV-001",
      nextCounter: 1,
    });
  });
});
