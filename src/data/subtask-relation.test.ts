// ───────────────────────────────────────────────────────────────────
// MODULE:    subtask-relation.test
// COMPONENT: relation-index derivation over RowData — depth, ancestors, order,
//            visibility, diagnostics, and the row-pipeline stage seam
// ───────────────────────────────────────────────────────────────────
//
// The relation must be a pure derivation: freezing every input row must not
// break a build, and the same frozen rows must rebuild the same relation.
// Diagnostics carry the three malformed-data classes (orphan parent,
// unknown child id, listed-vs-authoritative parent disagreement) and every
// cycle, because the walk that computes depth must cut the cycle rather
// than loop forever.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { TFile } from "obsidian";
import type { NoteRecord } from "./data-source";
import { RowPipeline } from "./row-pipeline";
import type { DatabaseViewState } from "../views/view-state-store";
import type { RowData, ViewConfig } from "./types";
import { buildSubtaskRelation } from "./subtask-relation";

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

function makeRow(path: string, frontmatter: Record<string, unknown> = {}): RowData {
  const file = new TFile();
  file.path = path;
  file.name = path.split("/").pop() ?? path;
  file.basename = file.name.replace(/\.md$/, "");
  return { file, frontmatter, computed: {} };
}

/** root/a.md ──▶ root/b.md ──▶ root/c.md, with b collapsed. */
function treeFixture(): RowData[] {
  return [
    makeRow("root/a.md", { subtaskIds: ["root/b.md"], collapsed: false }),
    makeRow("root/b.md", { parentId: "root/a.md", subtaskIds: ["root/c.md"], collapsed: true }),
    makeRow("root/c.md", { parentId: "root/b.md" }),
  ];
}

// ───────────────────────────────────────────────────────────────────
// 2. DEPTH, ANCESTORS, ORDER
// ───────────────────────────────────────────────────────────────────

describe("buildSubtaskRelation depth and ancestors", () => {
  it("derives depth and ancestor chains for every level of a 3-level tree", () => {
    const relation = buildSubtaskRelation(treeFixture());

    expect(relation.roots).toEqual(["root/a.md"]);
    expect(relation.childrenOf).toEqual(
      new Map([
        ["root/a.md", ["root/b.md"]],
        ["root/b.md", ["root/c.md"]],
      ]),
    );

    expect(relation.nodes.get("root/a.md")).toMatchObject({
      parentId: null,
      depth: 0,
      ancestors: [],
      inCycle: false,
      orphanParent: false,
    });
    expect(relation.nodes.get("root/b.md")).toMatchObject({
      parentId: "root/a.md",
      depth: 1,
      ancestors: ["root/a.md"],
    });
    expect(relation.nodes.get("root/c.md")).toMatchObject({
      parentId: "root/b.md",
      depth: 2,
      ancestors: ["root/a.md", "root/b.md"],
    });
    expect(relation.diagnostics.cycles).toEqual([]);
  });

  it("keeps a parent's listed order and appends authoritative children that were not listed", () => {
    const rows = [
      makeRow("a.md", { subtaskIds: ["c.md", "b.md"] }),
      makeRow("b.md", { parentId: "a.md" }),
      makeRow("c.md", { parentId: "a.md" }),
    ];
    const relation = buildSubtaskRelation(rows);

    expect(relation.childrenOf.get("a.md")).toEqual(["c.md", "b.md"]);
    expect(relation.diagnostics.parentChildMismatches).toEqual([]);
  });

  it("orders roots by input order when no parentId is set", () => {
    const rows = [makeRow("z.md"), makeRow("a.md"), makeRow("m.md")];
    expect(buildSubtaskRelation(rows).roots).toEqual(["z.md", "a.md", "m.md"]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. VISIBILITY
// ───────────────────────────────────────────────────────────────────

describe("buildSubtaskRelation visibility", () => {
  it("hides descendants of a collapsed node but not the collapsed node itself", () => {
    const relation = buildSubtaskRelation(treeFixture());

    expect(relation.nodes.get("root/a.md")?.visible).toBe(true);
    expect(relation.nodes.get("root/b.md")?.visible).toBe(true);
    expect(relation.nodes.get("root/c.md")?.visible).toBe(false);
  });

  it("keeps a grandchild visible when only an ancestor of its parent is collapsed", () => {
    const rows = [
      makeRow("a.md", { subtaskIds: ["b.md"], collapsed: true }),
      makeRow("b.md", { parentId: "a.md", subtaskIds: ["c.md"] }),
      makeRow("c.md", { parentId: "b.md" }),
    ];
    const relation = buildSubtaskRelation(rows);

    expect(relation.nodes.get("b.md")?.visible).toBe(false);
    expect(relation.nodes.get("c.md")?.visible).toBe(false);
  });

  it("lets a per-view isCollapsed override take priority over the frontmatter default", () => {
    // b's frontmatter says collapsed: true, but the view override says it is expanded.
    const rows = treeFixture();
    const relation = buildSubtaskRelation(rows, { isCollapsed: (row) => row.file.path === "root/b.md" ? false : undefined });

    expect(relation.nodes.get("root/b.md")?.collapsed).toBe(false);
    expect(relation.nodes.get("root/c.md")?.visible).toBe(true);
  });

  it("falls back to the frontmatter default when the override returns undefined for every row", () => {
    const rows = treeFixture();
    const relation = buildSubtaskRelation(rows, { isCollapsed: () => undefined });

    expect(relation.nodes.get("root/c.md")?.visible).toBe(false);
  });
});

describe("buildSubtaskRelation progress", () => {
  it("keeps explicit progress beside the derived child completion value", () => {
    const rows = [
      makeRow("parent.md", { progress: 25, subtaskIds: ["done.md", "open.md"] }),
      makeRow("done.md", { parentId: "parent.md", status: "done" }),
      makeRow("open.md", { parentId: "parent.md", status: "in-progress" }),
    ];

    expect(buildSubtaskRelation(rows).nodes.get("parent.md")?.progress).toEqual({
      explicit: 25,
      derived: 50,
      value: 25,
      source: "explicit",
      done: 1,
      total: 2,
    });
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. DIAGNOSTICS
// ───────────────────────────────────────────────────────────────────

describe("buildSubtaskRelation diagnostics", () => {
  it("marks a parentId that names no row as an orphan reference instead of dropping the row", () => {
    const rows = [
      makeRow("a.md"),
      makeRow("b.md", { parentId: "missing.md" }),
      makeRow("c.md", { parentId: "b.md" }),
    ];
    const relation = buildSubtaskRelation(rows);

    expect(relation.diagnostics.orphanParents).toEqual([{ path: "b.md", parentId: "missing.md" }]);
    expect(relation.nodes.get("b.md")).toMatchObject({ orphanParent: true, depth: 0, ancestors: [] });
    expect(relation.nodes.get("c.md")).toMatchObject({ parentId: "b.md", depth: 1, ancestors: ["b.md"] });
    expect(relation.roots).toEqual(["a.md", "b.md"]);
  });

  it("surfaces a child id listed by a parent whose parentId disagrees, trusting parentId", () => {
    const rows = [
      makeRow("a.md", { subtaskIds: ["c.md"] }),
      makeRow("b.md", { parentId: "a.md" }),
      makeRow("c.md", { parentId: "b.md" }),
    ];
    const relation = buildSubtaskRelation(rows);

    expect(relation.diagnostics.parentChildMismatches).toEqual([
      { path: "c.md", listedParent: "a.md", actualParent: "b.md" },
    ]);
    expect(relation.childrenOf.get("a.md")).toEqual(["b.md"]);
    expect(relation.childrenOf.get("b.md")).toEqual(["c.md"]);
  });

  it("records a listed child id that matches no row", () => {
    const rows = [makeRow("a.md", { subtaskIds: ["ghost.md"] })];
    const relation = buildSubtaskRelation(rows);

    expect(relation.diagnostics.unknownChildren).toEqual([{ parentPath: "a.md", childPath: "ghost.md" }]);
    expect(relation.childrenOf.get("a.md")).toEqual([]);
  });

  it("reports a direct parentId cycle and flags both nodes", () => {
    const rows = [
      makeRow("a.md", { parentId: "b.md" }),
      makeRow("b.md", { parentId: "a.md" }),
    ];
    const relation = buildSubtaskRelation(rows);

    expect(relation.diagnostics.cycles).toEqual([["a.md", "b.md", "a.md"]]);
    expect(relation.nodes.get("a.md")?.inCycle).toBe(true);
    expect(relation.nodes.get("b.md")?.inCycle).toBe(true);
    expect(relation.roots).toEqual([]);
  });

  it("reports an indirect parentId cycle", () => {
    const rows = [
      makeRow("a.md", { parentId: "b.md" }),
      makeRow("b.md", { parentId: "c.md" }),
      makeRow("c.md", { parentId: "a.md" }),
    ];
    const relation = buildSubtaskRelation(rows);

    expect(relation.diagnostics.cycles).toEqual([["a.md", "b.md", "c.md", "a.md"]]);
    expect(relation.nodes.get("a.md")?.inCycle).toBe(true);
    expect(relation.nodes.get("b.md")?.inCycle).toBe(true);
    expect(relation.nodes.get("c.md")?.inCycle).toBe(true);
  });

  it("keeps nodes that hang off a cycle out of the cycle chain", () => {
    const rows = [
      makeRow("a.md", { parentId: "b.md", subtaskIds: ["q.md"] }),
      makeRow("b.md", { parentId: "a.md" }),
      makeRow("q.md", { parentId: "a.md" }),
    ];
    const relation = buildSubtaskRelation(rows);

    expect(relation.diagnostics.cycles).toEqual([["a.md", "b.md", "a.md"]]);
    expect(relation.nodes.get("q.md")).toMatchObject({ inCycle: false, parentId: "a.md", depth: 1 });
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. PURITY
// ───────────────────────────────────────────────────────────────────

describe("buildSubtaskRelation purity", () => {
  it("never mutates its input rows, even on malformed data", () => {
    const rows = treeFixture();
    for (const row of rows) {
      Object.freeze(row);
      Object.freeze(row.frontmatter);
    }
    const fixture = [
      ...rows,
      makeRow("x.md", { parentId: "root/a.md" }),
      makeRow("y.md", { parentId: "x.md" }),
      makeRow("z.md", { parentId: "y.md", subtaskIds: ["x.md"] }),
      makeRow("orphan.md", { parentId: "nowhere.md" }),
    ];
    for (const row of fixture) {
      Object.freeze(row);
      Object.freeze(row.frontmatter);
    }

    expect(() => buildSubtaskRelation(fixture)).not.toThrow();
  });

  it("rebuilds an identical relation from the same rows", () => {
    const rows = treeFixture();
    const first = buildSubtaskRelation(rows);
    const second = buildSubtaskRelation(rows);

    expect(second).toEqual(first);
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. ROW-PIPELINE STAGE
// ───────────────────────────────────────────────────────────────────

describe("RowPipeline relation stage", () => {
  function pipelineInput() {
    const config = {
      viewType: "table",
      schema: { columns: [{ key: "file.name", label: "Title", type: "text" }], computedFields: [] },
    } as unknown as ViewConfig;
    const state = {
      searchText: "",
      statusFilter: "",
      groupByField: "",
      filters: [],
      hiddenColumns: new Set<string>(),
      filterLogic: "and",
      sortDirection: "asc",
      sortRules: [],
    } as DatabaseViewState;
    const records: NoteRecord[] = treeFixture().map((row) => ({
      file: row.file,
      frontmatter: row.frontmatter,
    }));
    return { config, state, records };
  }

  it("attaches the derived relation when the stage is enabled", () => {
    const { config, state, records } = pipelineInput();
    const output = new RowPipeline().buildWithDiagnostics(records, config, state, undefined, undefined, {
      includeRelation: true,
    });

    expect(output.relation).toBeDefined();
    expect(output.relation?.nodes.get("root/c.md")).toMatchObject({ depth: 2, visible: false });
    expect(output.relation?.roots).toEqual(["root/a.md"]);
  });

  it("leaves the output without a relation and with identical diagnostics when the stage is off", () => {
    const { config, state, records } = pipelineInput();
    const off = new RowPipeline().buildWithDiagnostics(records, config, state);
    const on = new RowPipeline().buildWithDiagnostics(records, config, state, undefined, undefined, {
      includeRelation: true,
    });

    expect(off.relation).toBeUndefined();
    expect(off.diagnostics).toEqual(on.diagnostics);
    expect(off.diagnostics).toMatchObject({
      sourceCount: 3,
      postSearchCount: 3,
      postFilterCount: 3,
      postLimitCount: 3,
      visibleCount: 3,
    });
  });
});
