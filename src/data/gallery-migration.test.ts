// ───────────────────────────────────────────────────────────────────
// MODULE:    gallery-migration.test
// COMPONENT: what opening an existing gallery does to it, and what it must not do
// ───────────────────────────────────────────────────────────────────
//
// The deprecation's whole premise is that it is reversible, and reversibility is not a property of
// the decision — it is a property of what the decision leaves behind. So most of these cases are
// about what is NOT changed: the gallery's own fields, a board image field someone already chose,
// and every view that is not a gallery.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { applyGalleryMigration, planGalleryMigration } from "./gallery-migration";
import type { ViewConfig } from "./types";

const gallery = (extra: Partial<ViewConfig> = {}): ViewConfig => ({
  id: "v1",
  name: "Covers",
  viewType: "gallery",
  galleryImageField: "cover",
  ...extra,
} as ViewConfig);

// ───────────────────────────────────────────────────────────────────
// 2. WHAT MIGRATES
// ───────────────────────────────────────────────────────────────────

describe("an existing gallery becomes a board", () => {
  it("plans the move and carries the cover field to the property the board reads", () => {
    const plan = planGalleryMigration(gallery());
    expect(plan).toEqual({ from: "gallery", to: "board", imageField: "cover" });
  });

  it("applies once and reports that it did", () => {
    const view = gallery();
    const plan = planGalleryMigration(view)!;
    expect(applyGalleryMigration(view, plan)).toBe(true);
    expect(view.viewType).toBe("board");
    expect(view.boardImageField).toBe("cover");
  });

  it("refuses to apply a second time, so a re-render cannot fight an undo", () => {
    const view = gallery();
    const plan = planGalleryMigration(view)!;
    applyGalleryMigration(view, plan);
    expect(applyGalleryMigration(view, plan)).toBe(false);
  });

  it("plans nothing for a gallery with no cover field, rather than nothing at all", () => {
    // A gallery without an image still has to stop being a gallery; it simply has no field to carry.
    const plan = planGalleryMigration(gallery({ galleryImageField: undefined }));
    expect(plan).toEqual({ from: "gallery", to: "board", imageField: undefined });
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. WHAT IS LEFT ALONE, WHICH IS WHAT MAKES IT REVERSIBLE
// ───────────────────────────────────────────────────────────────────

describe("the migration leaves the way back intact", () => {
  it("keeps the gallery's own fields on the view", () => {
    // Stripping them would make an undo restore the type without the surface, which is a one-way
    // migration wearing an undo's clothes.
    const view = gallery({ galleryCardSize: 240, galleryImageFit: "cover" } as Partial<ViewConfig>);
    applyGalleryMigration(view, planGalleryMigration(view)!);
    expect(view.galleryImageField).toBe("cover");
    expect((view as { galleryCardSize?: number }).galleryCardSize).toBe(240);
    expect((view as { galleryImageFit?: string }).galleryImageFit).toBe("cover");
  });

  it("does not overwrite a board image field the view already carries", () => {
    // A view that has been a board before carries a deliberate choice, and a migration that
    // overwrote it would undo that choice on the way past. The two fields differ here on purpose:
    // an earlier version of this case gave the view one field under two names, so a rig that
    // preferred the gallery's wrote the same value and the case passed on a real defect.
    const view = gallery({ galleryImageField: "cover", boardImageField: "hero" } as Partial<ViewConfig>);
    const plan = planGalleryMigration(view)!;
    expect(plan.imageField).toBe("hero");
    applyGalleryMigration(view, plan);
    expect(view.boardImageField).toBe("hero");
  });

  it("plans nothing for every view that is not a gallery", () => {
    for (const viewType of ["table", "board", "list", "chart", "calendar", "timeline"] as const) {
      expect(planGalleryMigration({ ...gallery(), viewType } as ViewConfig)).toBeNull();
    }
  });
});
