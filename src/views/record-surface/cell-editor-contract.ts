// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-contract
// COMPONENT: the pinned type → editor-shell dispatch, ahead of any extraction
// ───────────────────────────────────────────────────────────────────
//
// Every editor in the plugin today is a private method on `CellRenderer`, reached only through
// `startEdit`'s dispatch on `col.type`. That is one honest entry point, but it also means no
// check can mount an editor without constructing the whole class — nothing here does that yet.
//
// This is the contract `startEdit`'s dispatch is pinned against before any method body moves:
// which column type resolves to which extracted module, which resolve to no editor at all (a
// checkbox toggles in place), and which stay behind `CellRenderer`'s own methods because they
// are out of this extraction's scope (a formula or a rollup opens its own workbench, and a
// `file.name` rename is a distinct affordance, not a column-typed editor). A module a shell
// names does not exist yet — that absence is this contract's own red state, and it turns green
// one entry at a time as a later pass moves each editor's body into place, never by editing this
// file to match whatever the tree currently does.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export type CellEditorShell =
  | { kind: "extracted-module"; module: string; export: string }
  | { kind: "toggle" }
  | { kind: "host-owned"; reason: string };

// ───────────────────────────────────────────────────────────────────
// 2. THE CONTRACT
// ───────────────────────────────────────────────────────────────────

/** Keyed by `ColumnDef["type"]`. Every one of the thirteen types must resolve to an entry. */
export const CELL_EDITOR_DISPATCH_CONTRACT: Readonly<Record<string, CellEditorShell>> = {
  checkbox: { kind: "toggle" },
  status: { kind: "extracted-module", module: "./cell-editor-option", export: "openOptionEditor" },
  select: { kind: "extracted-module", module: "./cell-editor-option", export: "openOptionEditor" },
  "multi-select": { kind: "extracted-module", module: "./cell-editor-option", export: "openOptionEditor" },
  relation: { kind: "extracted-module", module: "./cell-editor-relation", export: "openRelationEditor" },
  number: { kind: "extracted-module", module: "./cell-editor-number", export: "openNumberEditor" },
  currency: { kind: "extracted-module", module: "./cell-editor-number", export: "openNumberEditor" },
  date: { kind: "extracted-module", module: "./cell-editor-date", export: "openDateEditor" },
  datetime: { kind: "extracted-module", module: "./cell-editor-date", export: "openDateEditor" },
  files: { kind: "extracted-module", module: "./cell-editor-text", export: "openTextEditor" },
  text: { kind: "extracted-module", module: "./cell-editor-text", export: "openTextEditor" },
  computed: { kind: "host-owned", reason: "opens the formula workbench, a separate modal rather than a cell editor" },
  rollup: { kind: "host-owned", reason: "reads a relation's aggregation, configured through its own modal" },
};

/**
 * `col.key === "file.name"` bypasses the type dispatch entirely (`startEdit` checks it before
 * `col.type`), so it is recorded beside the type-keyed contract rather than inside it.
 */
export const FILE_NAME_EDITOR_SHELL: CellEditorShell = {
  kind: "host-owned",
  reason: "the title rename affordance, not a column-typed editor",
};
