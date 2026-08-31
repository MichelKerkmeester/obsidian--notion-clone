// ───────────────────────────────────────────────────────────────────
// MODULE:    gallery-migration
// COMPONENT: what an existing gallery view becomes when it is opened
// ───────────────────────────────────────────────────────────────────
//
// `gallery` is withdrawn from every picker, so nothing new can be made one. That leaves the views
// already written into people's vault files, and "withdrawn" does nothing for them: the type string
// sits on disk, and deleting the renderer later would turn those views into whatever the unknown
// type coercion does — which is `table`, a card grid becoming a spreadsheet with no warning.
//
// So the deprecation migrates instead of waiting. THE TARGET IS `board`, not `table`, because it is
// the only other surface that draws a cover image: `resolveCoverImage(config.boardImageField, …)` is
// the same call the gallery makes with its own field, so carrying the field over keeps the covers
// and keeps the card shape. A board with no grouping property falls back to `groupByField`/status,
// so a migrated gallery reads as one column of cards rather than as an error.
//
// PURE ON PURPOSE. It takes a view and returns what to write, so the decision can be checked without
// an Obsidian `App`, a vault or a rendered surface — the shape three checks in this program have had
// to be rebuilt into after being written as transcriptions of a private method.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { ViewConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. THE DECISION
// ───────────────────────────────────────────────────────────────────

export interface GalleryMigration {
  /** The type the view had, so an undo and a message can both name it. */
  from: "gallery";
  to: "board";
  /** The cover field carried across, or undefined when the gallery declared none. */
  imageField?: string;
}

/**
 * What opening this view should change, or `null` when it should change nothing.
 *
 * Returns the description rather than mutating, so a caller that is only inspecting — a check, a
 * preview, a read-only render — can ask without writing to the user's file.
 *
 * An existing `boardImageField` wins. A view that has been a board before carries a deliberate
 * choice, and a migration that overwrote it would undo that choice on the way past.
 */
export function planGalleryMigration(view: ViewConfig): GalleryMigration | null {
  if (view.viewType !== "gallery") return null;
  return {
    from: "gallery",
    to: "board",
    imageField: view.boardImageField ?? view.galleryImageField,
  };
}

/**
 * Apply a plan to the view, in place, and report whether anything moved.
 *
 * The gallery's own fields are LEFT ON THE VIEW rather than deleted. They cost nothing, they are
 * what an undo needs to restore the surface exactly, and stripping them would make the migration
 * one-way in a phase whose whole premise is that it is reversible.
 *
 * The plan decides what to write and this writes it — one mechanism, not two. An earlier version
 * also guarded here against overwriting an existing `boardImageField`, which sounds prudent and is
 * dead: the plan already prefers that field, so the guard could only ever re-write the same value.
 * A control that removed it passed every case, which is what said it was doing no work.
 */
export function applyGalleryMigration(view: ViewConfig, plan: GalleryMigration): boolean {
  if (view.viewType !== plan.from) return false;
  view.viewType = plan.to;
  if (plan.imageField) view.boardImageField = plan.imageField;
  return true;
}
