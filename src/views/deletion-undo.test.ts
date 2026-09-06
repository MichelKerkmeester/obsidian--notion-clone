// ───────────────────────────────────────────────────────────────────
// MODULE:    deletion-undo
// COMPONENT: source assertions for the row-deletion history entry and its Undo/Redo
// ───────────────────────────────────────────────────────────────────
//
// Exercising a real deletion needs an Obsidian App, vault and metadata cache no harness here
// constructs — the same limit toast.test.ts and AC-002 already record. These assert against
// source text instead, the cheap regression guard that a later edit did not quietly drop the
// snapshot-before-trash order, the pushed entry, the re-attached Undo, or either class's
// undo-restores/redo-retrashes pair.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const databaseViewSource = readFileSync(resolve(__dirname, "./database-view.ts"), "utf-8");
const embeddedRendererSource = readFileSync(resolve(__dirname, "./embedded-database-renderer.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. STANDALONE VIEW
// ───────────────────────────────────────────────────────────────────

describe("database-view deletion history", () => {
  it("reads the file's content before trashNote runs, the way removeCreatedFile already does", () => {
    const deleteRow = databaseViewSource.slice(databaseViewSource.indexOf("private async deleteRow(row: RowData)"));
    const readIndex = deleteRow.indexOf("await this.app.vault.cachedRead(row.file)");
    const trashIndex = deleteRow.indexOf("await this.dataSource.trashNote(row.file");
    expect(readIndex).toBeGreaterThan(-1);
    expect(trashIndex).toBeGreaterThan(-1);
    expect(readIndex).toBeLessThan(trashIndex);
  });

  it("pushes a deleted history entry carrying the path and the read snapshot", () => {
    expect(databaseViewSource).toContain('this.pushHistory({ type: "deleted", label: t("undo.deleteRow"), file: { path: row.file.path, content } });');
  });

  it("re-attaches the toast's Undo action, wired to the existing undoLastEdit", () => {
    const deleteRow = databaseViewSource.slice(databaseViewSource.indexOf("private async deleteRow(row: RowData)"));
    const toastCall = deleteRow.slice(deleteRow.indexOf("showToast("), deleteRow.indexOf("await this.refreshAfterSave();"));
    expect(toastCall).toContain('action: { label: t("toolbar.undo"), onClick: () => this.undoLastEdit() }');
  });

  it("declares a deleted history entry kind, distinct from created", () => {
    expect(databaseViewSource).toContain("interface DeletedHistoryEntry {");
    expect(databaseViewSource).toContain("type HistoryEntry = CellHistoryEntry | ConfigHistoryEntry | CreatedHistoryEntry | DeletedHistoryEntry;");
  });

  it("undoes a deletion by restoring the file, and redoes it by trashing again — the exact inverse of a created entry", () => {
    const applyDeleted = databaseViewSource.slice(databaseViewSource.indexOf("private async applyDeletedHistoryEntry"));
    const body = applyDeleted.slice(0, applyDeleted.indexOf("\n  }"));
    expect(body).toContain('if (direction === "undo") await this.restoreCreatedFile(entry.file);');
    expect(body).toContain("else await this.removeCreatedFile(entry.file);");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. EMBED
// ───────────────────────────────────────────────────────────────────

describe("embedded-database-renderer deletion history", () => {
  it("reads the file's content before trashNote runs", () => {
    const deleteRow = embeddedRendererSource.slice(embeddedRendererSource.indexOf("private async deleteRow(row: RowData)"));
    const readIndex = deleteRow.indexOf("await this.app.vault.cachedRead(row.file)");
    const trashIndex = deleteRow.indexOf("await this.dataSource.trashNote(row.file");
    expect(readIndex).toBeGreaterThan(-1);
    expect(trashIndex).toBeGreaterThan(-1);
    expect(readIndex).toBeLessThan(trashIndex);
  });

  it("pushes a deleted history entry carrying the path and the read snapshot", () => {
    expect(embeddedRendererSource).toContain('this.pushHistory({ type: "deleted", label: t("undo.deleteRow"), file: { path: row.file.path, content } });');
  });

  it("re-attaches the toast's Undo action, wired to the existing undoLastEdit", () => {
    const deleteRow = embeddedRendererSource.slice(embeddedRendererSource.indexOf("private async deleteRow(row: RowData)"));
    const toastCall = deleteRow.slice(deleteRow.indexOf("showToast("), deleteRow.indexOf("if (this.config) this.renderResults(this.config);"));
    expect(toastCall).toContain('action: { label: t("toolbar.undo"), onClick: () => this.undoLastEdit() }');
  });

  it("declares a deleted entry kind in the union, distinct from created and moved", () => {
    expect(embeddedRendererSource).toContain('| { type: "deleted"; label: string; file: { path: string; content: string } };');
  });

  it("undoes a deletion by restoring the file, guarded against a path that already exists", () => {
    const undoLastEdit = embeddedRendererSource.slice(embeddedRendererSource.indexOf("async undoLastEdit(): Promise<void>"));
    const branch = undoLastEdit.slice(undoLastEdit.indexOf('entry.type === "deleted"'), undoLastEdit.indexOf('} else {'));
    expect(branch).toContain("Cannot undo delete because the path already exists");
    expect(branch).toContain("await this.app.vault.create(entry.file.path, entry.file.content);");
  });
});
