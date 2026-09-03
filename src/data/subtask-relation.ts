// ───────────────────────────────────────────────────────────────────
// MODULE:    subtask-relation
// COMPONENT: derived parent/child index over RowData — parentId, ordered
//            subtaskIds, depth, ancestors, visibility, cycle diagnostics
// ───────────────────────────────────────────────────────────────────
//
// The relation is a pure derivation: it reads each row's sanitized relation
// fields and returns fresh structures, never mutating the rows. It is
// rebuilt whenever the row pipeline changes instead of being patched, so the
// note on disk stays the single source of truth. The per-note parentId field
// is authoritative for membership; a parent's subtaskIds only supplies
// sibling order. Malformed data is reported in diagnostics rather than
// thrown: orphan parents become roots, unknown listed children are dropped,
// and a cycle is cut at its lexicographically smallest member so depth and
// ancestors stay finite regardless of walk order.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { RowData, SubtaskDiagnostics, SubtaskNode, SubtaskProgress, SubtaskRelation, SubtaskRelationFields } from "./types";
import { readRelationFields } from "./subtask-hydrate";

export type { SubtaskRelation } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. BUILD
// ───────────────────────────────────────────────────────────────────

export interface BuildSubtaskRelationOptions {
  /** Per-view collapse override (e.g. a view-config toggle) that takes priority over a row's own
   *  `collapsed` frontmatter default. Returning `undefined` for a row falls back to that default,
   *  so a caller with no override for most rows only needs to answer for the ones it tracks. */
  isCollapsed?(row: RowData): boolean | undefined;
}

export function buildSubtaskRelation(rows: RowData[], options: BuildSubtaskRelationOptions = {}): SubtaskRelation {
  const knownPaths = new Set(rows.map((row) => row.file.path));
  const fieldsByPath = new Map<string, SubtaskRelationFields>();
  for (const row of rows) {
    const fields = readRelationFields(row.frontmatter);
    const override = options.isCollapsed?.(row);
    fieldsByPath.set(row.file.path, override === undefined ? fields : { ...fields, collapsed: override });
  }

  const nodes = new Map<string, SubtaskNode>();
  const childrenOf = new Map<string, string[]>();
  const diagnostics: SubtaskDiagnostics = {
    orphanParents: [],
    unknownChildren: [],
    parentChildMismatches: [],
    cycles: [],
  };

  // Node shells and orphan diagnostics first, so every later pass can rely on
  // the map being complete for all rows.
  for (const row of rows) {
    const path = row.file.path;
    const fields = fieldsByPath.get(path)!;
    const parentId = fields.parentId;
    const orphanParent = parentId !== null && !knownPaths.has(parentId);
    if (orphanParent && parentId !== null) {
      diagnostics.orphanParents.push({ path, parentId });
    }
    nodes.set(path, {
      parentId: fields.parentId,
      subtaskRank: fields.subtaskRank,
      collapsed: fields.collapsed,
      depth: 0,
      ancestors: [],
      visible: true,
      inCycle: false,
      orphanParent,
      progress: emptySubtaskProgress(),
    });
  }

  // Children lists: a parent's listed ids keep their order, but a listed id
  // whose own parentId disagrees is recorded as a mismatch and does not join
  // this parent's list. Rows that carry a relation key get an entry even when
  // the list is empty, so consumers can distinguish "no children" from "not a
  // participant".
  for (const row of rows) {
    const path = row.file.path;
    const fields = fieldsByPath.get(path)!;
    if ("subtaskIds" in row.frontmatter || "subtaskRank" in row.frontmatter) {
      childrenOf.set(path, []);
    }
    for (const childPath of fields.subtaskIds) {
      if (!knownPaths.has(childPath)) {
        diagnostics.unknownChildren.push({ parentPath: path, childPath });
        continue;
      }
      const childParent = fieldsByPath.get(childPath)!.parentId;
      if (childParent !== path) {
        diagnostics.parentChildMismatches.push({ path: childPath, listedParent: path, actualParent: childParent });
        continue;
      }
      if (!childrenOf.has(path)) childrenOf.set(path, []);
      childrenOf.get(path)!.push(childPath);
    }
  }

  // Authoritative children (parentId points here) that were never listed are
  // appended in input order after the listed ones.
  for (const row of rows) {
    const path = row.file.path;
    const listed = new Set(childrenOf.get(path) ?? []);
    for (const other of rows) {
      const otherPath = other.file.path;
      if (fieldsByPath.get(otherPath)!.parentId === path && !listed.has(otherPath)) {
        if (!childrenOf.has(path)) childrenOf.set(path, []);
        childrenOf.get(path)!.push(otherPath);
      }
    }
  }

  // Depth, ancestors and cycles, walking each node's parent chain with
  // memoization. A cycle is canonicalized to start at its smallest member and
  // every member is resolved from that canonical chain, so depth never
  // depends on which node the walk started from.
  const resolved = new Map<string, { depth: number; ancestors: string[] }>();
  const cycleKeys = new Set<string>();

  const resolveCycle = (chain: string[]): void => {
    const members = chain.length - 1;
    let start = 0;
    for (let i = 1; i < members; i++) {
      if (chain[i] < chain[start]) start = i;
    }
    const canonical = [...chain.slice(start, members), chain[start]];
    const key = canonical.join("\u0000");
    if (!cycleKeys.has(key)) {
      cycleKeys.add(key);
      diagnostics.cycles.push(canonical);
    }
    canonical.forEach((member, index) => {
      const node = nodes.get(member);
      if (node) node.inCycle = true;
      if (!resolved.has(member)) {
        resolved.set(member, { depth: index, ancestors: canonical.slice(0, index) });
      }
    });
  };

  for (const row of rows) {
    const path = row.file.path;
    if (resolved.has(path)) continue;
    const chain: string[] = [];
    let cursor: string | null = path;
    let cycleAt = -1;
    while (cursor !== null) {
      if (resolved.has(cursor)) break;
      const at = chain.indexOf(cursor);
      if (at !== -1) {
        cycleAt = at;
        break;
      }
      chain.push(cursor);
      const fields = fieldsByPath.get(cursor);
      cursor = fields && fields.parentId !== null && knownPaths.has(fields.parentId) ? fields.parentId : null;
    }
    if (cycleAt !== -1) {
      const entryPath = chain[cycleAt];
      resolveCycle([...chain.slice(cycleAt), entryPath]);
      const entry = resolved.get(entryPath)!;
      for (let i = cycleAt - 1; i >= 0; i--) {
        resolved.set(chain[i], {
          depth: entry.depth + (cycleAt - i),
          ancestors: [entryPath, ...entry.ancestors, ...chain.slice(i + 1, cycleAt).reverse()],
        });
      }
      continue;
    }
    const tail = cursor !== null ? resolved.get(cursor) : null;
    const tailAncestors = tail ? [...tail.ancestors, cursor!] : [];
    for (let i = chain.length - 1; i >= 0; i--) {
      const member = chain[i];
      const next = chain[i + 1];
      const nextInfo = next !== undefined ? resolved.get(next) : null;
      resolved.set(member, {
        depth: nextInfo ? nextInfo.depth + 1 : tail ? tail.depth + 1 : 0,
        ancestors: nextInfo ? [...nextInfo.ancestors, next] : tailAncestors,
      });
    }
  }

  // Visibility and roots come last, from the settled depths.
  for (const row of rows) {
    const path = row.file.path;
    const node = nodes.get(path)!;
    const info = resolved.get(path)!;
    node.depth = info.depth;
    node.ancestors = info.ancestors;
    node.visible = !info.ancestors.some((ancestor) => fieldsByPath.get(ancestor)?.collapsed ?? false);
  }

  const rowByPath = new Map(rows.map((row) => [row.file.path, row] as const));
  const progressByPath = new Map<string, SubtaskProgress>();
  const resolvingProgress = new Set<string>();
  const resolveProgress = (path: string): SubtaskProgress => {
    const cached = progressByPath.get(path);
    if (cached) return cached;
    const row = rowByPath.get(path);
    if (!row || resolvingProgress.has(path)) {
      return row ? deriveSubtaskProgress(row, []) : emptySubtaskProgress();
    }
    resolvingProgress.add(path);
    const childPaths = childrenOf.get(path) ?? [];
    const childEntries = childPaths
      .map((childPath) => ({ row: rowByPath.get(childPath), progress: resolveProgress(childPath) }))
      .filter((entry): entry is { row: RowData; progress: SubtaskProgress } => Boolean(entry.row));
    const children = childEntries.map((entry) => entry.row);
    const childProgress = childEntries.map((entry) => entry.progress);
    const progress = deriveSubtaskProgress(row, children, childProgress);
    resolvingProgress.delete(path);
    progressByPath.set(path, progress);
    return progress;
  };
  for (const row of rows) nodes.get(row.file.path)!.progress = resolveProgress(row.file.path);

  const roots: string[] = [];
  for (const row of rows) {
    const path = row.file.path;
    const node = nodes.get(path)!;
    if (node.inCycle) continue;
    if (node.parentId === null || node.orphanParent) roots.push(path);
  }

  return { nodes, childrenOf, roots, diagnostics };
}

export function deriveSubtaskProgress(
  row: RowData,
  children: readonly RowData[],
  childProgress: readonly SubtaskProgress[] = [],
): SubtaskProgress {
  const explicit = readProgress(row.frontmatter.progress);
  let done = 0;
  for (const [index, child] of children.entries()) {
    const nested = childProgress[index];
    const complete = nested?.value != null
      ? nested.value >= 100
      : isCompletedSubtask(child);
    if (complete) done += 1;
  }
  const total = children.length;
  const derived = total > 0 ? Math.round((done / total) * 100) : null;
  const value = explicit ?? derived;
  return {
    explicit,
    derived,
    value,
    source: explicit != null ? "explicit" : derived != null ? "derived" : "none",
    done,
    total,
  };
}

function emptySubtaskProgress(): SubtaskProgress {
  return { explicit: null, derived: null, value: null, source: "none", done: 0, total: 0 };
}

function readProgress(value: unknown): number | null {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : Number.NaN;
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : null;
}

function isCompletedSubtask(row: RowData): boolean {
  if (row.frontmatter.completed === true || row.frontmatter.done === true) return true;
  const rawStatus = row.frontmatter.status;
  const status = (typeof rawStatus === "string" ? rawStatus : "").trim().toLowerCase();
  return /^(done|complete|completed|closed|cancelled|canceled|finished)$/.test(status);
}
