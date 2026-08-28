// ───────────────────────────────────────────────────────────────────
// MODULE:    file-rename-plan
// COMPONENT: dry-run planner for batch same-folder Markdown renames
// ───────────────────────────────────────────────────────────────────
//
// Renames are planned before any vault mutation so conflicts surface up
// front instead of mid-batch. A target already occupied by another source
// within the same plan is allowed — that is what makes swaps and rename
// cycles (A→B, B→A) possible via a single pass — but any other occupied
// target fails the whole plan for that entry.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface FileRenameRequest {
  sourcePath: string;
  newName: string;
}

export interface FileRenameChange {
  oldPath: string;
  newPath: string;
}

export type FileRenameConflictReason = "empty" | "duplicateSource" | "duplicateTarget" | "targetExists";

export interface FileRenameConflict {
  reason: FileRenameConflictReason;
  sourcePath: string;
  targetPath?: string;
}

export interface FileRenamePlan {
  changes: FileRenameChange[];
  conflicts: FileRenameConflict[];
}

// ───────────────────────────────────────────────────────────────────
// 2. HELPERS
// ───────────────────────────────────────────────────────────────────

const pathKey = (path: string): string => path.normalize("NFC").toLowerCase();

export function normalizeFileRenameBasename(input: string): string {
  const withoutExtension = input.trim().replace(/\.md$/i, "");
  const safe = withoutExtension.replace(/[\\/]+/g, "-").trim();
  return safe === "." || safe === ".." ? "" : safe;
}

export function getRenamedMarkdownPath(sourcePath: string, input: string): string | null {
  const basename = normalizeFileRenameBasename(input);
  if (!basename) return null;
  const slash = sourcePath.lastIndexOf("/");
  const parent = slash >= 0 ? sourcePath.slice(0, slash + 1) : "";
  return `${parent}${basename}.md`;
}

// ───────────────────────────────────────────────────────────────────
// 3. PLAN RENAMES
// ───────────────────────────────────────────────────────────────────

/**
 * Plan a set of same-folder Markdown renames before any vault mutation.
 * Targets occupied by another source in this same plan are allowed so swaps/cycles can be
 * executed through temporary paths. All other occupied targets fail up front.
 */
export function planFileRenames(
  requests: FileRenameRequest[],
  occupiedPaths: Iterable<string>,
): FileRenamePlan {
  const conflicts: FileRenameConflict[] = [];
  const changes: FileRenameChange[] = [];
  const seenSources = new Set<string>();

  for (const request of requests) {
    const sourceKey = pathKey(request.sourcePath);
    if (seenSources.has(sourceKey)) {
      conflicts.push({ reason: "duplicateSource", sourcePath: request.sourcePath });
      continue;
    }
    seenSources.add(sourceKey);
    const newPath = getRenamedMarkdownPath(request.sourcePath, request.newName);
    if (!newPath) {
      conflicts.push({ reason: "empty", sourcePath: request.sourcePath });
      continue;
    }
    if (newPath === request.sourcePath) continue;
    changes.push({ oldPath: request.sourcePath, newPath });
  }

  const movingSources = new Set(changes.map((change) => pathKey(change.oldPath)));
  const occupied = new Set(Array.from(occupiedPaths, pathKey));
  const targetOwner = new Map<string, FileRenameChange>();
  for (const change of changes) {
    const key = pathKey(change.newPath);
    const owner = targetOwner.get(key);
    if (owner) {
      conflicts.push({ reason: "duplicateTarget", sourcePath: change.oldPath, targetPath: change.newPath });
      continue;
    }
    targetOwner.set(key, change);
    if (occupied.has(key) && !movingSources.has(key)) {
      conflicts.push({ reason: "targetExists", sourcePath: change.oldPath, targetPath: change.newPath });
    }
  }

  return { changes, conflicts };
}
