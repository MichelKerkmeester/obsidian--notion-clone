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
// The cover's fit and aspect ratio carry across too, because the board reads them through the exact
// same expression the gallery does (`config.boardImageAspectRatio ?? 0.75`, `config.boardImageFit ||
// "cover"` against `config.galleryImageAspectRatio`/`galleryImageFit`). A gallery aspect-ratio PRESET
// has no board equivalent — the board has no preset system — so its resolved number is what carries;
// the preset label itself is a declared loss, not a silent one, and the caller's notice says so.
// `galleryCardSize` and `galleryCardSizePreset` have no board equivalent at all: the board's own
// `boardColumnWidth` sizes a kanban lane, a structurally different layout from a responsive card
// grid, not a rename. Both stay on the view (nothing here is deleted, see below) so an undo restores
// them, but neither migration function invents a board field for them.
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
  /** The cover aspect ratio carried across, resolved from a preset if the gallery used one. */
  imageAspectRatio?: number;
  /** The cover fit carried across, or undefined when the gallery never set one. */
  imageFit?: "cover" | "contain";
}

/**
 * The numeric ratio a gallery's aspect-ratio preset resolves to, mirroring the gallery renderer's
 * own `getCoverRatio`. Duplicated rather than imported: the renderer this reads from is `003`'s to
 * delete, and importing from a file about to be removed would make this module's survival depend on
 * that one staying put.
 */
function resolveGalleryAspectRatio(view: ViewConfig): number | undefined {
  const preset = view.galleryImageAspectRatioPreset;
  const presetRatio =
    preset === "square" ? 1
      : preset === "banner" ? 1.777
        : preset === "portrait" ? 0.75
          : preset === "landscape" ? 1.333 : undefined;
  return presetRatio ?? view.galleryImageAspectRatio;
}

/**
 * What opening this view should change, or `null` when it should change nothing.
 *
 * Returns the description rather than mutating, so a caller that is only inspecting — a check, a
 * preview, a read-only render — can ask without writing to the user's file.
 *
 * An existing `boardImageField`/`boardImageAspectRatio`/`boardImageFit` wins over the gallery's own.
 * A view that has been a board before carries a deliberate choice, and a migration that overwrote it
 * would undo that choice on the way past.
 */
export function planGalleryMigration(view: ViewConfig): GalleryMigration | null {
  if (view.viewType !== "gallery") return null;
  return {
    from: "gallery",
    to: "board",
    imageField: view.boardImageField ?? view.galleryImageField,
    imageAspectRatio: view.boardImageAspectRatio ?? resolveGalleryAspectRatio(view),
    imageFit: view.boardImageFit ?? view.galleryImageFit,
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
  if (plan.imageAspectRatio !== undefined) view.boardImageAspectRatio = plan.imageAspectRatio;
  if (plan.imageFit) view.boardImageFit = plan.imageFit;
  return true;
}
