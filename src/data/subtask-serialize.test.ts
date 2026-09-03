// ───────────────────────────────────────────────────────────────────
// MODULE:    subtask-serialize.test
// COMPONENT: atomic move/reorder transaction — sibling rank placement,
//            cycle rejection, all-or-nothing write sets
// ───────────────────────────────────────────────────────────────────
//
// The transaction is the only write path for parentId/subtaskIds: it must
// either return the complete set of frontmatter writes for a valid move or
// reject with zero writes. Rejection is observable: re-deriving the
// relation from the untouched rows must equal the pre-call relation.
// Sibling order is canonical in the parent's subtaskIds list, while each
// child carries a parent-scoped base62 rank as a placement handle, so a
// move that lands between dense ranks rebalances that parent's whole
// sibling scope in the same write set.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { TFile } from "obsidian";
import type { RowData } from "./types";
import { buildSubtaskRelation, type SubtaskRelation } from "./subtask-relation";
import { planSubtaskMove, toFrontmatterUpdates, type SubtaskWrite } from "./subtask-serialize";

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

/** root.md ──▶ [a.md (rank V) ──▶ a1.md (rank 5), b.md (rank Z)], c.md ──▶ c1.md (rank 5). */
function treeFixture(): RowData[] {
  return [
    makeRow("root.md", { subtaskIds: ["a.md", "b.md"] }),
    makeRow("a.md", { parentId: "root.md", subtaskIds: ["a1.md"], subtaskRank: "V" }),
    makeRow("a1.md", { parentId: "a.md", subtaskRank: "5" }),
    makeRow("b.md", { parentId: "root.md", subtaskRank: "Z" }),
    makeRow("c.md", { subtaskIds: ["c1.md"] }),
    makeRow("c1.md", { parentId: "c.md", subtaskRank: "5" }),
  ];
}

function applyWrites(rows: RowData[], writes: SubtaskWrite[]): RowData[] {
  const frontmatter = new Map(rows.map((row) => [row.file.path, row.frontmatter]));
  for (const write of writes) frontmatter.set(write.path, write.frontmatter);
  return rows.map((row) => ({ ...row, frontmatter: frontmatter.get(row.file.path)! }));
}

function relationOf(rows: RowData[]): SubtaskRelation {
  return buildSubtaskRelation(rows);
}

function relationSnapshot(rows: RowData[]): { relation: SubtaskRelation; frontmatter: Record<string, unknown>[] } {
  return {
    relation: relationOf(rows),
    frontmatter: rows.map((row) => ({ ...row.frontmatter })),
  };
}

// ───────────────────────────────────────────────────────────────────
// 2. CROSS-PARENT MOVE (ATOMIC WRITE SET)
// ───────────────────────────────────────────────────────────────────

describe("planSubtaskMove cross-parent move", () => {
  it("updates child parentId, both parents' subtaskIds and the child rank in one write set", () => {
    const rows = treeFixture();
    const before = relationSnapshot(rows);

    const plan = planSubtaskMove(rows, { childPath: "a1.md", newParentPath: "c.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    expect(plan.writes.map((write) => write.path).sort()).toEqual(["a.md", "a1.md", "c.md"]);

    const after = relationSnapshot(applyWrites(rows, plan.writes));
    expect(after.relation.nodes.get("a1.md")).toMatchObject({
      parentId: "c.md",
      depth: 1,
      ancestors: ["c.md"],
    });
    expect(after.relation.nodes.get("a1.md")?.subtaskRank).not.toBeNull();
    expect(after.relation.childrenOf.get("c.md")).toEqual(["c1.md", "a1.md"]);
    expect(after.relation.childrenOf.get("a.md")).toEqual([]);
    expect(after.relation.roots).toEqual(["root.md", "c.md"]);

    // Only the three affected notes changed; everything else is untouched.
    expect(before.frontmatter[0]).toEqual(after.frontmatter[0]);
    expect(before.frontmatter[3]).toEqual(after.frontmatter[3]);
    expect(before.frontmatter[5]).toEqual(after.frontmatter[5]);
  });

  it("places the moved child relative to an explicit sibling", () => {
    const rows = treeFixture();

    const plan = planSubtaskMove(rows, { childPath: "a1.md", newParentPath: "c.md", beforePath: "c1.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const after = relationOf(applyWrites(rows, plan.writes));
    expect(after.childrenOf.get("c.md")).toEqual(["a1.md", "c1.md"]);
    const rank = after.nodes.get("a1.md")?.subtaskRank;
    const c1Rank = after.nodes.get("c1.md")?.subtaskRank;
    expect(rank).not.toBeNull();
    expect(rank! < c1Rank!).toBe(true);
  });

  it("assigns a rank between the new siblings' ranks", () => {
    const rows = treeFixture();

    const plan = planSubtaskMove(rows, { childPath: "a1.md", newParentPath: "c.md", afterPath: "c1.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const after = relationOf(applyWrites(rows, plan.writes));
    const c1Rank = after.nodes.get("c1.md")?.subtaskRank;
    const movedRank = after.nodes.get("a1.md")?.subtaskRank;
    expect(c1Rank).not.toBeNull();
    expect(movedRank).not.toBeNull();
    expect(c1Rank! < movedRank!).toBe(true);
  });

  it("moves a node back to the root level, clearing its parent and rank", () => {
    const rows = treeFixture();

    const plan = planSubtaskMove(rows, { childPath: "a.md", newParentPath: null });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const after = relationOf(applyWrites(rows, plan.writes));
    expect(after.nodes.get("a.md")).toMatchObject({ parentId: null, subtaskRank: null, depth: 0 });
    expect(after.childrenOf.get("root.md")).toEqual(["b.md"]);
    // root.md, the moved a.md and the fixture's own parentless c.md are all roots.
    expect(after.roots).toEqual(["root.md", "a.md", "c.md"]);
  });

});

// Root-level ordering is the pipeline's existing manual-order concern, so a
// root move carries no sibling position: requesting one is a caller error.

// ───────────────────────────────────────────────────────────────────
// 3. SAME-PARENT REORDER
// ───────────────────────────────────────────────────────────────────

describe("planSubtaskMove same-parent reorder", () => {
  it("reorders siblings and re-ranks the moved child", () => {
    const rows = treeFixture();

    const plan = planSubtaskMove(rows, { childPath: "b.md", newParentPath: "root.md", beforePath: "a.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const after = relationOf(applyWrites(rows, plan.writes));
    expect(after.childrenOf.get("root.md")).toEqual(["b.md", "a.md"]);
    const bRank = after.nodes.get("b.md")?.subtaskRank;
    const aRank = after.nodes.get("a.md")?.subtaskRank;
    expect(bRank).not.toBeNull();
    expect(aRank).not.toBeNull();
    expect(bRank! < aRank!).toBe(true);
    expect(plan.writes.map((write) => write.path)).toEqual(["b.md", "root.md"]);
  });

  it("returns zero writes for a no-op move", () => {
    const rows = treeFixture();

    const append = planSubtaskMove(rows, { childPath: "b.md", newParentPath: "root.md" });
    expect(append.ok).toBe(true);
    if (append.ok) expect(append.writes).toEqual([]);

    const afterSibling = planSubtaskMove(rows, { childPath: "b.md", newParentPath: "root.md", afterPath: "a.md" });
    expect(afterSibling.ok).toBe(true);
    if (afterSibling.ok) expect(afterSibling.writes).toEqual([]);

    const rootNoop = planSubtaskMove(rows, { childPath: "root.md", newParentPath: null });
    expect(rootNoop.ok).toBe(true);
    if (rootNoop.ok) expect(rootNoop.writes).toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. CYCLE REJECTION (ALL-OR-NOTHING)
// ───────────────────────────────────────────────────────────────────

describe("planSubtaskMove cycle rejection", () => {
  it.each([
    { name: "direct descendant", childPath: "root.md", newParentPath: "a1.md" },
    { name: "indirect descendant", childPath: "root.md", newParentPath: "a.md" },
    { name: "own child", childPath: "a.md", newParentPath: "a1.md" },
    { name: "under itself", childPath: "a.md", newParentPath: "a.md" },
  ])("rejects a move under $name with a named cycle error and no writes", ({ childPath, newParentPath }) => {
    const rows = treeFixture();
    const before = relationSnapshot(rows);

    const plan = planSubtaskMove(rows, { childPath, newParentPath });
    expect(plan.ok).toBe(false);
    if (plan.ok) return;

    expect(plan.error.code).toBe("cycle");
    expect(plan.error.message).toContain(childPath);

    const after = relationSnapshot(rows);
    expect(after.relation).toEqual(before.relation);
    expect(after.frontmatter).toEqual(before.frontmatter);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. REJECTION OF UNRESOLVABLE REQUESTS
// ───────────────────────────────────────────────────────────────────

describe("planSubtaskMove validation", () => {
  it("rejects an unknown child", () => {
    const plan = planSubtaskMove(treeFixture(), { childPath: "ghost.md", newParentPath: "c.md" });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.error.code).toBe("unknown-child");
  });

  it("rejects an unknown target parent", () => {
    const plan = planSubtaskMove(treeFixture(), { childPath: "a1.md", newParentPath: "ghost.md" });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.error.code).toBe("unknown-parent");
  });

  it("rejects a sibling that is not in the target scope", () => {
    const plan = planSubtaskMove(treeFixture(), { childPath: "a1.md", newParentPath: "c.md", beforePath: "b.md" });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.error.code).toBe("unknown-sibling");
  });

  it("rejects a sibling position on a root-level move", () => {
    const plan = planSubtaskMove(treeFixture(), { childPath: "c.md", newParentPath: null, beforePath: "root.md" });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.error.code).toBe("unknown-sibling");
  });

  it("rejects the moved node itself as a sibling reference", () => {
    const plan = planSubtaskMove(treeFixture(), { childPath: "a1.md", newParentPath: "a.md", beforePath: "a1.md" });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.error.code).toBe("unknown-sibling");
  });

  it("never mutates rows during validation or planning", () => {
    const rows = treeFixture();
    for (const row of rows) {
      Object.freeze(row);
      Object.freeze(row.frontmatter);
    }

    expect(() => planSubtaskMove(rows, { childPath: "a1.md", newParentPath: "c.md" })).not.toThrow();
    expect(() => planSubtaskMove(rows, { childPath: "root.md", newParentPath: "a1.md" })).not.toThrow();
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. RANK REBALANCE
// ───────────────────────────────────────────────────────────────────

describe("planSubtaskMove rank rebalance", () => {
  it("rebalances a dense sibling scope and rewrites every child in the same write set", () => {
    const rows = [
      makeRow("p.md", { subtaskIds: ["x.md", "y.md"] }),
      makeRow("x.md", { parentId: "p.md", subtaskRank: "0" }),
      makeRow("y.md", { parentId: "p.md", subtaskRank: "00" }),
      makeRow("m.md", { parentId: "z.md", subtaskRank: "5" }),
      makeRow("z.md", {}),
    ];

    // "0" and "00" leave no rank between them, so the transaction must
    // rebalance the whole sibling scope.
    const plan = planSubtaskMove(rows, { childPath: "m.md", newParentPath: "p.md", beforePath: "y.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const written = applyWrites(rows, plan.writes);
    const after = relationOf(written);
    const children = after.childrenOf.get("p.md");
    expect(children).toEqual(["x.md", "m.md", "y.md"]);

    const ranks = children!.map((path) => after.nodes.get(path)?.subtaskRank ?? "");
    expect(ranks.every((rank) => rank.length > 0)).toBe(true);
    const sorted = [...ranks].sort();
    expect(ranks).toEqual(sorted);
    expect(new Set(ranks).size).toBe(3);

    // The parent's list changed and every child of p.md was re-ranked, so all
    // four notes are rewritten in the one write set.
    expect(plan.writes.map((write) => write.path).sort()).toEqual(["m.md", "p.md", "x.md", "y.md"]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. WRITE SHAPE
// ───────────────────────────────────────────────────────────────────

describe("transaction write shape", () => {
  it("emits frontmatter objects that round-trip through the relation field reader", () => {
    const rows = treeFixture();
    const plan = planSubtaskMove(rows, { childPath: "a1.md", newParentPath: "c.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    for (const write of plan.writes) {
      expect(typeof write.frontmatter).toBe("object");
      expect(write.frontmatter).not.toBeNull();
      expect(() => JSON.stringify(write.frontmatter)).not.toThrow();
    }
  });

  it("emits the expected relation keys on each affected note", () => {
    const rows = treeFixture();
    const plan = planSubtaskMove(rows, { childPath: "a1.md", newParentPath: "c.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const childWrite = plan.writes.find((write) => write.path === "a1.md");
    const newParentWrite = plan.writes.find((write) => write.path === "c.md");
    const oldParentWrite = plan.writes.find((write) => write.path === "a.md");
    expect(childWrite).toBeDefined();
    expect(newParentWrite).toBeDefined();
    expect(oldParentWrite).toBeDefined();

    expect(childWrite!.frontmatter.parentId).toBe("c.md");
    expect(typeof childWrite!.frontmatter.subtaskRank).toBe("string");
    expect(newParentWrite!.frontmatter.subtaskIds).toEqual(["c1.md", "a1.md"]);
    // The old parent's list became empty, so the key is omitted rather than written as [].
    expect("subtaskIds" in oldParentWrite!.frontmatter).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 8. HOST WRITE ADAPTER
// ───────────────────────────────────────────────────────────────────

describe("toFrontmatterUpdates", () => {
  it("carries a written relation key through as a keyed update", () => {
    const rows = treeFixture();
    const plan = planSubtaskMove(rows, { childPath: "a1.md", newParentPath: "c.md" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const childWrite = plan.writes.find((write) => write.path === "a1.md")!;

    const updates = toFrontmatterUpdates(childWrite);
    expect(updates.parentId).toBe("c.md");
  });

  it("maps an omitted (reset-to-default) relation key to null so the host deletes it", () => {
    const rows = treeFixture();
    const plan = planSubtaskMove(rows, { childPath: "a1.md", newParentPath: null });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const oldParentWrite = plan.writes.find((write) => write.path === "a.md")!;
    expect("subtaskIds" in oldParentWrite.frontmatter).toBe(false);

    const updates = toFrontmatterUpdates(oldParentWrite);
    expect(updates.subtaskIds).toBeNull();
  });

  it("never leaks a whole-note frontmatter field outside the four relation keys", () => {
    const write: SubtaskWrite = {
      path: "a.md",
      frontmatter: { title: "Website redesign", cost: 42, parentId: "root.md" },
    };
    const updates = toFrontmatterUpdates(write);
    expect(Object.keys(updates).sort()).toEqual(["collapsed", "parentId", "subtaskIds", "subtaskRank"]);
    expect(updates.parentId).toBe("root.md");
  });
});
