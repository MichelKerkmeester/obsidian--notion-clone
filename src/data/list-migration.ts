// ───────────────────────────────────────────────────────────────────
// MODULE:    list-migration
// COMPONENT: what an existing list view becomes when it is opened
// ───────────────────────────────────────────────────────────────────
//
// `list` is withdrawn from every picker, so nothing new can be made one. That leaves the views
// already written into people's vault files, and "withdrawn" does nothing for them: the type string
// sits on disk, and deleting the renderer later would turn those views into whatever the unknown
// type coercion does — which is `table`, a card grid becoming a spreadsheet with no warning.
//
// So the deprecation migrates instead of waiting. THE TARGET IS `table`, and the migration is a
// type-string rewrite rather than a mapping: the list derives its tracks from the table's column
// widths (`getFieldWidth` is one function, shared), so the column set, the filters, the sorts and
// the grouping a list view carries are already a table's, and the plan has nothing to translate.
//
// What the migration must not do is repair: a corrupt column set is the table renderer's existing
// fallback's job, and a migration that "fixed" it on the way past would bypass that fallback.
// Leftover list-only keys in vault YAML are ignored on parse and are not rewritten onto ViewConfig.
//
// PURE ON PURPOSE. It takes a view and returns what to write, so the decision can be checked
// without an Obsidian `App`, a vault or a rendered surface — the shape three checks in this
// program have had to be rebuilt into after being written as transcriptions of a private method.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { ViewConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. THE DECISION
// ───────────────────────────────────────────────────────────────────

export interface ListMigration {
  /** The type the view had, so a message can name it. */
  from: "list";
  to: "table";
}

/**
 * What opening this view should change, or `null` when it should change nothing.
 *
 * Returns the description rather than mutating, so a caller that is only inspecting — a check, a
 * preview, a read-only render — can ask without writing to the user's file.
 */
export function planListMigration(view: ViewConfig): ListMigration | null {
  if (view.viewType !== "list") return null;
  return { from: "list", to: "table" };
}

/**
 * Apply a plan to the view, in place, and report whether anything moved.
 *
 * The plan decides what to write and this writes it — one mechanism, not two. Nothing else moves:
 * the column set, the filters, the sorts and the grouping stay exactly as they are, which is the
 * whole migration rather than a detail of it.
 */
export function applyListMigration(view: ViewConfig, plan: ListMigration): boolean {
  if (view.viewType !== plan.from) return false;
  view.viewType = plan.to;
  return true;
}
