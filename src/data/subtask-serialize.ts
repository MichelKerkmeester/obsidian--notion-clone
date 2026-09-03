// ───────────────────────────────────────────────────────────────────
// MODULE:    subtask-serialize
// COMPONENT: the single write path for parentId/subtaskIds — frontmatter
//            field serialization plus the atomic move/reorder transaction
// ───────────────────────────────────────────────────────────────────
//
// Every parent/child write goes through planSubtaskMove, which validates the
// request against the current relation, rejects a descendant-cycle move with
// no writes, and otherwise returns the complete set of frontmatter writes —
// the moved child, both affected parents, and any rebalanced siblings — so
// callers persist one all-or-nothing batch. Sibling order is canonical in
// the parent's subtaskIds list; each child's base62 rank is only a placement
// handle, and a sibling scope too dense for a midpoint rank is rebalanced in
// the same write set. Root-level order stays the pipeline's manual-order
// concern, so root moves carry no sibling position.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type {
  RowData,
  SubtaskMoveErrorCode,
  SubtaskMovePlan,
  SubtaskMoveRequest,
  SubtaskRelationFields,
  SubtaskWrite,
} from "./types";
import { readRelationFields, RELATION_KEYS } from "./subtask-hydrate";
import { buildSubtaskRelation } from "./subtask-relation";
import { generateRanks, rankBetween } from "./manual-order";

export type { SubtaskWrite } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. FIELD SERIALIZATION
// ───────────────────────────────────────────────────────────────────

export function writeRelationFields(
  frontmatter: Record<string, unknown>,
  fields: Partial<SubtaskRelationFields>,
): Record<string, unknown> {
  const out = { ...frontmatter };
  const values: Record<string, unknown> = {
    parentId: fields.parentId,
    subtaskIds: fields.subtaskIds,
    subtaskRank: fields.subtaskRank,
    collapsed: fields.collapsed,
  };
  for (const key of RELATION_KEYS) {
    const value = values[key];
    const isDefault = value === undefined || value === null || value === false
      || (Array.isArray(value) && value.length === 0);
    if (isDefault) {
      delete out[key];
    } else {
      out[key] = value;
    }
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────
// 3. MOVE TRANSACTION
// ───────────────────────────────────────────────────────────────────

export function planSubtaskMove(rows: RowData[], request: SubtaskMoveRequest): SubtaskMovePlan {
  const fieldsByPath = new Map<string, SubtaskRelationFields>();
  const rowByPath = new Map<string, RowData>();
  for (const row of rows) {
    fieldsByPath.set(row.file.path, readRelationFields(row.frontmatter));
    rowByPath.set(row.file.path, row);
  }
  const relation = buildSubtaskRelation(rows);
  const { childPath, newParentPath } = request;

  const childFields = fieldsByPath.get(childPath);
  if (!childFields) {
    return fail("unknown-child", `unknown child '${childPath}'`);
  }
  if (newParentPath !== null && !fieldsByPath.has(newParentPath)) {
    return fail("unknown-parent", `unknown parent '${newParentPath}'`);
  }
  const sibling = request.beforePath ?? request.afterPath;
  if (sibling !== undefined) {
    if (newParentPath === null) {
      return fail("unknown-sibling", `sibling position '${sibling}' is not valid on a root-level move`);
    }
    const scope = relation.childrenOf.get(newParentPath) ?? [];
    if (sibling === childPath || !scope.includes(sibling)) {
      return fail("unknown-sibling", `sibling '${sibling}' is not a child of '${newParentPath}'`);
    }
  }
  if (newParentPath !== null && createsCycle(fieldsByPath, childPath, newParentPath)) {
    return fail(
      "cycle",
      `cycle: moving '${childPath}' under '${newParentPath}' would make it a descendant of itself`,
    );
  }

  const writes: SubtaskWrite[] = [];
  const oldParentId = childFields.parentId;

  if (newParentPath === null) {
    // Root move: parent and rank are cleared, and the old parent's list drops
    // the child if it was listed there.
    const rankChanged = childFields.subtaskRank !== null;
    if (oldParentId !== null || rankChanged) {
      writes.push({
        path: childPath,
        frontmatter: writeRelationFields(rowByPath.get(childPath)!.frontmatter, {
          ...childFields,
          parentId: null,
          subtaskRank: null,
        }),
      });
    }
    writeParentListWithout(writes, rowByPath, fieldsByPath, oldParentId, childPath);
    return { ok: true, writes };
  }

  const scope = relation.childrenOf.get(newParentPath) ?? [];
  const siblings = scope.filter((path) => path !== childPath);
  const insertAt = sibling === undefined
    ? siblings.length
    : request.beforePath !== undefined
      ? siblings.indexOf(request.beforePath)
      : siblings.indexOf(request.afterPath!) + 1;
  siblings.splice(insertAt, 0, childPath);

  const unchanged = newParentPath === oldParentId
    && siblings.length === scope.length
    && siblings.every((path, index) => path === scope[index]);
  if (unchanged) return { ok: true, writes: [] };

  const rankOf = (path: string): string | undefined => fieldsByPath.get(path)?.subtaskRank ?? undefined;
  const childIndex = siblings.indexOf(childPath);
  const lower = childIndex > 0 ? rankOf(siblings[childIndex - 1]) : undefined;
  const upper = childIndex < siblings.length - 1 ? rankOf(siblings[childIndex + 1]) : undefined;
  let childRank = rankBetween(lower, upper);

  if (childRank === null) {
    // Dense sibling scope: rebalance every child of the target parent so the
    // whole scope gets fresh, evenly spaced ranks in the same write set.
    const ranks = generateRanks(siblings);
    childRank = ranks[childPath];
    for (const siblingPath of siblings) {
      if (siblingPath === childPath) continue;
      const fields = fieldsByPath.get(siblingPath)!;
      const newRank = ranks[siblingPath];
      if (fields.subtaskRank !== newRank) {
        writes.push({
          path: siblingPath,
          frontmatter: writeRelationFields(rowByPath.get(siblingPath)!.frontmatter, {
            ...fields,
            subtaskRank: newRank,
          }),
        });
      }
    }
  }

  if (childFields.parentId !== newParentPath || childFields.subtaskRank !== childRank) {
    writes.push({
      path: childPath,
      frontmatter: writeRelationFields(rowByPath.get(childPath)!.frontmatter, {
        ...childFields,
        parentId: newParentPath,
        subtaskRank: childRank,
      }),
    });
  }

  if (oldParentId !== newParentPath) {
    writeParentListWithout(writes, rowByPath, fieldsByPath, oldParentId, childPath);
  }
  writes.push({
    path: newParentPath,
    frontmatter: writeRelationFields(rowByPath.get(newParentPath)!.frontmatter, {
      ...fieldsByPath.get(newParentPath)!,
      subtaskIds: siblings,
    }),
  });

  return { ok: true, writes };
}

function createsCycle(
  fieldsByPath: Map<string, SubtaskRelationFields>,
  childPath: string,
  newParentPath: string,
): boolean {
  const visited = new Set<string>();
  let cursor: string | null = newParentPath;
  while (cursor !== null && !visited.has(cursor)) {
    if (cursor === childPath) return true;
    visited.add(cursor);
    const fields = fieldsByPath.get(cursor);
    cursor = fields ? fields.parentId : null;
  }
  return false;
}

function writeParentListWithout(
  writes: SubtaskWrite[],
  rowByPath: Map<string, RowData>,
  fieldsByPath: Map<string, SubtaskRelationFields>,
  parentId: string | null,
  childPath: string,
): void {
  if (parentId === null || !fieldsByPath.has(parentId)) return;
  const fields = fieldsByPath.get(parentId)!;
  const remaining = fields.subtaskIds.filter((path) => path !== childPath);
  if (remaining.length === fields.subtaskIds.length) return;
  writes.push({
    path: parentId,
    frontmatter: writeRelationFields(rowByPath.get(parentId)!.frontmatter, {
      ...fields,
      subtaskIds: remaining,
    }),
  });
}

function fail(code: SubtaskMoveErrorCode, message: string): SubtaskMovePlan {
  return { ok: false, error: { code, message } };
}
