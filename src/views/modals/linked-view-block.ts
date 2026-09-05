// ───────────────────────────────────────────────────────────────────
// MODULE:    linked-view-block
// COMPONENT: parse, serialise, move and insert the fenced linked-view block
// ───────────────────────────────────────────────────────────────────
//
// A linked view is a markdown fence, not a second database. Create and
// move both have to write that fence exactly the way the embed parser
// already reads it, or a block we just placed will fail to resolve.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App, TFile } from "obsidian";
import type { DatabaseConfig, DatabaseViewType, ViewConfig } from "../../data/types";
import { generateId } from "../../data/types";
import { t } from "../../i18n";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export type LinkedViewLanguage = "note-database" | "database-view";

export interface LinkedViewBlockRef {
  language: LinkedViewLanguage;
  dbId?: string;
  dbPath?: string;
  /** Present when the fence carried a viewId key, even if the value is empty. */
  viewId?: string;
  viewIdPresent?: boolean;
  hideHeader?: boolean;
}

export const EMBED_LINKED_CLASS = "note-database-embed-linked";
export const LINKED_VIEW_DRAG_TYPE = "application/x-note-database-linked-view";

const OPTION_LINE = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/;

export function parseLinkedViewSource(source: string): Omit<LinkedViewBlockRef, "language"> {
  const options: Record<string, string> = {};
  const trimmed = source.replace(/\s+$/, "");
  if (!trimmed.includes(":")) {
    return {};
  }
  for (const raw of trimmed.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const match = line.match(OPTION_LINE);
    if (!match) continue;
    options[match[1]] = match[2].trim();
    if (match[1] === "viewId") options.__viewIdPresent = "1";
  }
  const hide = options.hideHeader || options.hideToolbar;
  return {
    dbId: options.dbId || options.databaseId || undefined,
    dbPath: options.dbPath || options.databasePath || undefined,
    viewId: Object.prototype.hasOwnProperty.call(options, "viewId") ? (options.viewId ?? "") : undefined,
    viewIdPresent: options.__viewIdPresent === "1",
    hideHeader: /^(true|yes|1)$/i.test(hide || "") || undefined,
  };
}

export function serializeLinkedViewSource(ref: Omit<LinkedViewBlockRef, "language">): string {
  const lines: string[] = [];
  if (ref.dbId) lines.push(`dbId: ${ref.dbId}`);
  if (ref.dbPath) lines.push(`dbPath: ${ref.dbPath}`);
  if (ref.viewIdPresent || ref.viewId !== undefined) {
    lines.push(`viewId: ${ref.viewId ?? ""}`);
  }
  if (ref.hideHeader) lines.push("hideHeader: true");
  return lines.join("\n");
}

export function formatLinkedViewFence(ref: LinkedViewBlockRef): string {
  const body = serializeLinkedViewSource(ref);
  return ["```" + ref.language, body, "```"].join("\n");
}

export function parseLinkedViewFence(fence: string): LinkedViewBlockRef {
  const trimmed = fence.replace(/^\s+/, "").replace(/\s+$/, "");
  const match = trimmed.match(/^```(\S+)\n([\s\S]*?)\n```$/);
  const language = (match?.[1] === "database-view" ? "database-view" : "note-database") as LinkedViewLanguage;
  const body = match ? match[2] : trimmed;
  return { language, ...parseLinkedViewSource(body) };
}

/** Parse then serialise. Canonical rows are byte-identical; trailing whitespace is stripped. */
export function roundTripLinkedViewFence(fence: string): string {
  return formatLinkedViewFence(parseLinkedViewFence(fence));
}

export interface LinkedViewMoveFiles {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
}

export interface LinkedViewMoveRequest {
  sourcePath: string;
  destPath: string;
  sourceLineStart: number;
  sourceLineEnd: number;
  block: string;
  destInsertLine?: number;
}

export interface LinkedViewMoveResult {
  sourceAfter: string;
  destAfter: string;
  sourceBefore: string;
  destBefore: string;
}

function spliceLines(content: string, start: number, end: number, replacement?: string): string {
  const lines = content.split("\n");
  if (replacement === undefined) lines.splice(start, end - start + 1);
  else lines.splice(start, 0, replacement);
  return lines.join("\n");
}

function countFences(content: string): number {
  return (content.match(/```(?:note-database|database-view)\b/g) || []).length;
}

/**
 * Destination is written first and the source is removed second so a crash
 * leaves a duplicate, which can be deleted, rather than a vanished block.
 */
export async function applyLinkedViewMove(
  files: LinkedViewMoveFiles,
  request: LinkedViewMoveRequest,
): Promise<LinkedViewMoveResult> {
  const sourceBefore = await files.read(request.sourcePath);
  const destBefore = request.sourcePath === request.destPath
    ? sourceBefore
    : await files.read(request.destPath);
  const destLines = destBefore.split("\n");
  const insertAt = request.destInsertLine ?? destLines.length;
  const destAfter = spliceLines(destBefore, insertAt, insertAt - 1, request.block);
  await files.write(request.destPath, destAfter);
  let sourceAfter = sourceBefore;
  if (request.sourcePath === request.destPath) {
    const shiftedStart = request.sourceLineStart + (insertAt <= request.sourceLineStart ? request.block.split("\n").length : 0);
    const shiftedEnd = request.sourceLineEnd + (insertAt <= request.sourceLineStart ? request.block.split("\n").length : 0);
    sourceAfter = spliceLines(destAfter, shiftedStart, shiftedEnd);
    await files.write(request.sourcePath, sourceAfter);
  } else {
    sourceAfter = spliceLines(sourceBefore, request.sourceLineStart, request.sourceLineEnd);
    await files.write(request.sourcePath, sourceAfter);
  }
  return { sourceBefore, destBefore, sourceAfter, destAfter };
}

export async function undoLinkedViewMove(
  files: LinkedViewMoveFiles,
  snapshot: Pick<LinkedViewMoveResult, "sourceBefore" | "destBefore"> & Pick<LinkedViewMoveRequest, "sourcePath" | "destPath">,
): Promise<void> {
  // Restore the source first so the block cannot vanish if the second write fails.
  await files.write(snapshot.sourcePath, snapshot.sourceBefore);
  if (snapshot.sourcePath !== snapshot.destPath) {
    await files.write(snapshot.destPath, snapshot.destBefore);
  }
}

export function linkedViewBlockCount(...contents: string[]): number {
  return contents.reduce((sum, content) => sum + countFences(content), 0);
}

export function defaultViewName(viewType: DatabaseViewType): string {
  if (viewType === "board") return t("common.boardView");
  if (viewType === "chart") return t("common.chartView");
  if (viewType === "calendar") return t("common.calendarView");
  if (viewType === "timeline") return t("common.timelineView");
  if (viewType === "gallery") return t("common.galleryView");
  if (viewType === "list") return t("common.listView");
  return t("common.tableView");
}

export function appendLinkedViewToDatabase(
  db: DatabaseConfig,
  viewType: DatabaseViewType,
  name?: string,
): ViewConfig {
  const sourceView = db.views[0];
  const view: ViewConfig = {
    id: generateId(),
    name: name?.trim() || defaultViewName(viewType),
    viewType,
    sourceFolder: "",
    schema: db.schema,
    boardGroupField: viewType === "board"
      ? (db.schema.columns.find((col) => col.key !== "file.name")?.key || "file.name")
      : undefined,
    columnOrder: sourceView?.columnOrder ? [...sourceView.columnOrder] : undefined,
  };
  db.views.push(view);
  return view;
}

export function buildLinkedViewFence(db: DatabaseConfig, view: ViewConfig, sourcePath: string): string {
  return formatLinkedViewFence({
    language: "note-database",
    dbId: db.id || undefined,
    dbPath: db.id ? undefined : sourcePath,
    viewId: view.id || "",
    viewIdPresent: true,
  });
}

export function insertTextAtCursor(
  editor: { replaceSelection(text: string): void } | null | undefined,
  text: string,
): boolean {
  if (!editor) return false;
  const padded = text.endsWith("\n") ? text : `${text}\n`;
  editor.replaceSelection(padded);
  return true;
}

export async function insertLinkedViewIntoFile(
  files: LinkedViewMoveFiles,
  path: string,
  fence: string,
): Promise<void> {
  const existing = await files.read(path);
  const next = existing.length === 0 || existing.endsWith("\n")
    ? `${existing}${fence}\n`
    : `${existing}\n${fence}\n`;
  await files.write(path, next);
}

export function vaultFilesAdapter(app: App): LinkedViewMoveFiles {
  return {
    async read(path: string): Promise<string> {
      const file = app.vault.getAbstractFileByPath(path);
      if (!file || !("extension" in file)) throw new Error(`missing file: ${path}`);
      return app.vault.read(file as TFile);
    },
    async write(path: string, content: string): Promise<void> {
      const file = app.vault.getAbstractFileByPath(path);
      if (!file || !("extension" in file)) throw new Error(`missing file: ${path}`);
      await app.vault.modify(file as TFile, content);
    },
  };
}
