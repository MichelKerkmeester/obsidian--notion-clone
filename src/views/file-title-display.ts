// ───────────────────────────────────────────────────────────────────
// MODULE:    file-title-display
// COMPONENT: computed file-name/path display info shared by table, card,
//            and list row titles
// ───────────────────────────────────────────────────────────────────
//
// The folder prefix is only kept when hasDuplicateName is true — when no
// other visible row shares the same basename, the prefix is dropped even
// though the full path is still returned, so most titles stay short and the
// prefix only appears where it disambiguates something.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { RowData } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface FileTitleDisplay {
  name: string;
  folderPrefix: string;
  folderPath: string;
  fullPath: string;
  displayPath: string;
  hasDuplicateName: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. TITLE COMPUTATION
// ───────────────────────────────────────────────────────────────────

/**
 * The basenames that appear more than once, built once for a whole render.
 *
 * Without this every row answers "does any other row share my basename?" by scanning every other
 * row, which is linear work inside a loop over the same rows — quadratic, and invisible at the row
 * counts a fixture uses. It is worst in the ordinary case: with all-distinct names the scan never
 * finds a match and never exits early, so every row walks the whole set.
 *
 * A caller with one row in hand does not need this and should keep passing that row alone.
 */
/** Passed where a caller supplies an index instead, so no array is allocated per row. */
export const EMPTY_ROWS: RowData[] = [];

export function buildDuplicateNameIndex(rows: RowData[]): ReadonlySet<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const row of rows) {
    const basename = row.file.basename;
    if (seen.has(basename)) duplicates.add(basename);
    else seen.add(basename);
  }
  return duplicates;
}

/** Build the visible file title pieces; duplicate basenames get a muted folder prefix. */
export function getFileTitleDisplay(
  row: RowData,
  rows: RowData[],
  duplicateNames?: ReadonlySet<string>,
): FileTitleDisplay {
  const name = row.file.basename || row.file.name.replace(/\.md$/, "");
  const fullPath = row.file.path;
  const displayPath = row.file.path.replace(/\.md$/, "");
  // The index answers in constant time when a caller built one. The scan stays for callers holding
  // a single row, where it is already constant and an index would cost more than it saves.
  const hasDuplicateName = duplicateNames
    ? duplicateNames.has(row.file.basename)
    : rows.some((candidate) =>
      candidate.file.path !== row.file.path && candidate.file.basename === row.file.basename
    );
  const slash = row.file.path.lastIndexOf("/");
  const folderPrefix = slash >= 0 ? `${row.file.path.slice(0, slash)}/` : "/";
  return {
    name,
    folderPath: folderPrefix,
    fullPath,
    displayPath,
    hasDuplicateName,
    folderPrefix: hasDuplicateName ? folderPrefix : "",
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. TITLE RENDERING
// ───────────────────────────────────────────────────────────────────

/** Render table-style one-line titles with an optional low-emphasis folder prefix. */
export function renderInlineFileTitle(parent: HTMLElement, info: FileTitleDisplay, alwaysShowPath = false): void {
  parent.empty();
  parent.addClass("db-file-title-inline");
  const folderPath = alwaysShowPath ? info.folderPath : info.folderPrefix;
  parent.toggleClass("has-folder-prefix", Boolean(folderPath));
  if (folderPath) {
    if (folderPath === "/") {
      parent.createSpan({ cls: "db-file-title-prefix", text: "" });
    } else {
      parent.createSpan({ cls: "db-file-title-prefix", text: folderPath });
    }
  }
  parent.createSpan({ cls: "db-file-title-name", text: info.name });
}

/** Render card/list titles with the filename as primary text and the path as a footnote. */
export function renderStackedFileTitle(parent: HTMLElement, info: FileTitleDisplay, alwaysShowPath = false): void {
  parent.empty();
  parent.addClass("db-file-title-stacked");
  parent.toggleClass("has-folder-prefix", alwaysShowPath || Boolean(info.folderPrefix));
  parent.createDiv({ cls: "db-file-title-name", text: info.name });
  const folderPath = alwaysShowPath ? info.folderPath : info.folderPrefix;
  if (folderPath) {
    if (folderPath === "/") {
      parent.createDiv({ cls: "db-file-title-prefix", text: "" });
    } else {
      parent.createDiv({ cls: "db-file-title-prefix", text: folderPath });
    }
  }
}
