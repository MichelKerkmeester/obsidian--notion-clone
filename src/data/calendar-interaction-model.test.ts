// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-interaction-model.test
// COMPONENT: two-click finish-to-start dependency-link seam
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  resolveTimelineLinkChange,
  wouldCreateTimelineDependencyCycle,
  TimelineDependencyGraph,
  TimelineLinkClick,
} from "./calendar-interaction-model";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

function makeGraph(overrides: Partial<TimelineDependencyGraph> = {}): TimelineDependencyGraph {
  return {
    dependencies: {
      // "alpha" depends on "beta": alpha can only start once beta finishes.
      alpha: ["beta"],
    },
    taskIds: new Set(["alpha", "beta", "gamma"]),
    ...overrides,
  };
}

const click = (taskId: string, side: TimelineLinkClick["side"]): TimelineLinkClick => ({ taskId, side });

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("resolveTimelineLinkChange", () => {
  it("activates a two-click link on the first click", () => {
    const result = resolveTimelineLinkChange(null, click("alpha", "right"), makeGraph());
    expect(result).toEqual({ kind: "pending", click: { taskId: "alpha", side: "right" } });
  });

  it("cancels when the same task is clicked twice", () => {
    const result = resolveTimelineLinkChange(click("alpha", "right"), click("alpha", "left"), makeGraph());
    expect(result).toEqual({ kind: "cancelled" });
  });

  it("rejects a same-side link", () => {
    const result = resolveTimelineLinkChange(click("alpha", "right"), click("beta", "right"), makeGraph());
    expect(result).toEqual({ kind: "rejected", reason: "same-side" });
  });

  it("rejects a duplicate dependency", () => {
    // alpha already depends on beta; linking beta's output to alpha's input again.
    const result = resolveTimelineLinkChange(click("beta", "right"), click("alpha", "left"), makeGraph());
    expect(result).toEqual({ kind: "rejected", reason: "duplicate" });
  });

  it("rejects a link whose successor is missing from the view", () => {
    const result = resolveTimelineLinkChange(click("alpha", "right"), click("gone", "left"), makeGraph());
    expect(result).toEqual({ kind: "rejected", reason: "missing-task" });
  });

  it("rejects a link that would create a dependency cycle", () => {
    // alpha depends on beta; making beta depend on alpha closes a loop.
    const result = resolveTimelineLinkChange(click("alpha", "right"), click("beta", "left"), makeGraph());
    expect(result).toEqual({ kind: "rejected", reason: "cycle" });
  });

  it("commits a valid finish-to-start link onto the successor", () => {
    const result = resolveTimelineLinkChange(click("gamma", "right"), click("alpha", "left"), makeGraph());
    expect(result).toEqual({
      kind: "committed",
      predecessorId: "gamma",
      successorId: "alpha",
      dependencies: ["beta", "gamma"],
    });
  });

  it("keeps the predecessor/successor mapping when the first click is the left dot", () => {
    const result = resolveTimelineLinkChange(click("gamma", "left"), click("beta", "right"), makeGraph());
    expect(result).toEqual({
      kind: "committed",
      predecessorId: "beta",
      successorId: "gamma",
      dependencies: ["beta"],
    });
  });

  it("does not mutate the graph when committing", () => {
    const graph = makeGraph();
    resolveTimelineLinkChange(click("gamma", "right"), click("alpha", "left"), graph);
    expect(graph.dependencies.alpha).toEqual(["beta"]);
  });
});

describe("wouldCreateTimelineDependencyCycle", () => {
  it("detects a direct back-edge", () => {
    expect(wouldCreateTimelineDependencyCycle(makeGraph(), "alpha", "beta")).toBe(true);
  });

  it("detects an indirect cycle through a chain", () => {
    const graph = makeGraph({
      dependencies: { alpha: ["beta"], beta: ["gamma"] },
    });
    // alpha reaches gamma (alpha -> beta -> gamma), so gamma depending on alpha loops.
    expect(wouldCreateTimelineDependencyCycle(graph, "alpha", "gamma")).toBe(true);
  });

  it("allows an edge that does not close a loop", () => {
    const graph = makeGraph({
      dependencies: { alpha: ["beta"], beta: ["gamma"] },
    });
    // gamma reaches nothing, so alpha depending on gamma is safe.
    expect(wouldCreateTimelineDependencyCycle(graph, "gamma", "alpha")).toBe(false);
  });
});
