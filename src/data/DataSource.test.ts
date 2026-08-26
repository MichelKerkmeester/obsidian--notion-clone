import { describe, expect, it, vi } from "vitest";
import type { App } from "obsidian";
import { DataSource } from "./DataSource";
import type { SourceRuleNode } from "./types";

vi.mock("obsidian", () => ({
  App: class {},
  EventRef: class {},
  MetadataCache: class {},
  TFile: class {},
  Vault: class {},
  getAllTags: vi.fn(),
  normalizePath: (path: string) => path,
  parseYaml: vi.fn(),
  stringifyYaml: vi.fn(),
}));

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { activeDocument: { documentElement: { lang: "en" } } },
});

const tree: SourceRuleNode = {
  type: "group",
  logic: "or",
  rules: [
    { type: "group", logic: "and", rules: [{ field: "first", op: "eq", value: "one" }] },
    { type: "not", rule: { field: "second", op: "empty" } },
  ],
};

function source(): DataSource {
  return new DataSource({ vault: {}, metadataCache: {} } as App);
}

describe("DataSource view filter tree persistence", () => {
  it("normalizes filter trees in both view formats and serializes them", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          filterTree: tree,
        }],
      },
    });

    expect(parsed?.views[0].filterTree).toEqual(tree);
    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(parsed!.views[0]);
    expect(payload.filterTree).toEqual(tree);
    expect((dataSource as unknown as { legacyViewKeys(): string[] }).legacyViewKeys()).toContain("filterTree");

    const legacy = dataSource.parseDatabaseConfig({ database: { filterTree: tree, views: undefined } });
    expect(legacy?.views[0].filterTree).toEqual(tree);
  });

  it("rejects truncated filter tree roots", () => {
    const parsed = source().parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          filterTree: { type: "group", logic: "or" },
        }],
      },
    });

    expect(parsed?.views[0].filterTree).toBeUndefined();
  });
});
