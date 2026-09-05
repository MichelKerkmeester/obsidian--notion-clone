---
title: "Implementation Summary: Remove the Gallery Renderer and Its Harness"
description: "The gallery renderer and every measurement surface named against it left the tree together. gallery stays on DatabaseViewType, migrated permanently, the same shape 006 chose for list. The one board-shared capture whose crop target moved is explained by name rather than silently rebaselined; the gate stays 25/25 with the same lane names, because gallery never owned a dedicated lane the way list owned list-window."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "gallery removal summary"
  - "007 phase 3 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/003-remove-renderer-and-harness"
    last_updated_at: "2026-09-05T23:30:00Z"
    last_updated_by: "remove-renderer-and-harness-run"
    recent_action: "Deleted the gallery renderer and its whole measurement surface; ADR-001 accepted"
    next_safe_action: "Hand off to 004-docs-and-release; the removal is landed and gate-green"
    blockers: []
    key_files:
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "styles.css"
      - "tools/live/render-assertion-harness.ts"
      - "tools/live/renderer-coverage.json"
      - "plan.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-003-summary"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Does gallery leave DatabaseViewType? No — ADR-001, plan.md, the same accepted-but-redirected shape as list"
      - "Does the gate lane count drop? No — gallery never owned a dedicated lane; the removal shows inside render-assertions, evidence, css-lane and placement instead"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 003-remove-renderer-and-harness |
| **Completed** | 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

`src/views/gallery-renderer.ts` (787 lines) and every measurement surface named against it left the
tree together, per `plan.md`'s one-change ordering (D1). `gallery` stays on `DatabaseViewType` as an
accepted-but-redirected value (ADR-001, `plan.md`), migrated permanently by `src/data/gallery-migration.ts`
and the `migrateGalleryViewOnOpen` coercion already wired into both hosts by `002` — not narrowed out
of the type.

### The measurement surface, and what happened to each piece

1. `src/views/gallery-renderer.ts` — **deleted**, 787 lines.
2. `tools/bench/gallery-render-bench.ts`, `tools/bench/run-gallery.mjs` — **deleted**, 225 + 30 lines.
3. `tools/live/renderer-coverage.json`'s two `inputs` pins — **removed**; floor lowered `6/21` →
   `5/20` with `note: "was 6/21; gallery renderer retired"`, re-stamped by `render-assertions.mjs`'s
   own coverage ratchet during the gate run, not hand-edited.
4. `tools/screenshots/scenarios/core.mjs`'s `gallery-view` and `constructed-scenarios.mjs`'s
   `constructed-gallery` — **removed**, along with their 8 manifest entries and 8 tracked PNGs
   (`git rm`).
5. `tools/screenshots/scenarios/core.mjs`'s `card-cover-states` and `chrome.mjs`'s
   `chrome-group-selection-controls` — **edited**: the gallery card/box half removed from the fixture
   markup per `001`'s classification, the board half kept exactly as it was.
6. `tools/live/render-assertion-harness.ts`'s `constructed-card-covers`/`constructed-group-selection-controls`
   branches — **edited**: the `GalleryRenderer` construction, its bag builder and its marker check
   removed; the board construction is untouched.
7. `tools/live/render-assertion-harness.ts` — **swept**: the `GalleryRenderer` import, the
   `gallery-render-bench` import, `GALLERY_COLUMNS`/`ROWS`/`FILL`, the `"gallery"` `ScenarioSpec`
   union member and its `galleryImageField` option, `fileViewGalleryBag`/`embedGalleryBag`,
   `tagGalleryRenders`/`tagGalleryGroupedRenders`, `galleryAssertions`, and the `"gallery"` scenario
   branch — all **removed**.
8. `tools/live/render-assertion-bundle.mjs`, `tools/live/render-assertions.mjs` — the `gallery/file-view`,
   `gallery/embed` and `gallery-covers/file-view` scenario/bag entries **removed**;
   `gallery-render-bench.ts` dropped from `RENDERER_SOURCES` and the coverage stamp's `inputs`.
9. `tools/live/constructed-state-assertions.mjs`'s `groupSelectionBoxes`/`cardCovers` — **edited** to
   the board-only assertion the underlying DOM now builds.
10. `tools/storybook/verify-placement.mjs`'s `SELECT_FIXTURE` — **re-pointed** from the deleted
    `gallery-view` scenario onto `chrome-board-extensions-selection`, the nearest surviving fixture
    that also builds a `db-checkbox-row`-classed checkbox outside the table's own select cell — the
    property `gallery-view` supplied incidentally, not a gallery-specific one.
11. `styles.css` — **swept**: one full numbered section (18. GALLERY VIEW, ~340 lines) deleted whole;
    its one non-gallery rule, `.db-card-empty-placeholder` (shared with the board via
    `card-field-renderer.ts`), kept in place; 15 further comma-joined selector lists elsewhere in the
    file had only their `db-gallery-*` member removed, never the whole line. `rg -c 'db-gallery'
    styles.css` returns 0.
12. `tools/screenshots/runtime-vars.css`, `tools/screenshots/pinned-values-baseline.json` — the three
    `--db-gallery-*` custom-property stand-ins **removed**, since the `styles.css` rules that read
    them are gone; `standIns` lowered `41` → `38`.
13. `src/i18n.ts` — 14 orphaned keys **removed** across the locales that carried them
    (`undo.galleryCoverFieldConfig`/`galleryImageFitConfig`/`galleryCoverRatioConfig`,
    `undo.cardSizeConfig`, `viewConfig.cardSize`, and the 9 gallery aspect/size-preset keys, English
    only — the other two locales never had them and were silently falling back). `common.galleryView`,
    `undo.galleryMigration` and `notice.galleryMigrated` **kept** — the surviving migration still
    calls all three.

### The render dispatch and creation-time defaults, in both hosts

`src/views/database-view.ts` and `src/views/embedded-database-renderer.ts` each lost: the
`GalleryRenderer` import and field, its constructor instantiation, the `"gallery"` render-dispatch
branch (`renderGallery`/the inline `else if`), the `updateCellDOM`/DOM-diff case that called
`this.galleryRenderer`, `getDefaultGalleryImageField`, `updateGalleryCardSize`, and the
`value === "gallery"` creation-time defaulting branches in `initializeViewTypeDefaults` (and the
embedded host's `initializeEmbeddedViewTypeDefaults`/`onViewTypeChange`) and the new-view object
literal — all dead the moment no picker can mint a fresh `"gallery"` value, which `030` already made
true. `src/views/view-config-panel-renderer.ts` lost `renderGallerySettings` and its call site — the
gallery-only cover/aspect/size-preset config section, unreachable once a persisted gallery migrates to
board before this panel can render for it.

What survives in every one of these files, deliberately: the migration coercion
(`migrateGalleryViewOnOpen`, called every `refresh()`/`render()` before the dispatch chain), the
`"gallery"` membership in generic multi-type arrays (`applyViewTypeClass`, `canToggleRecordIcon`, the
picker's own escape-hatch filter), and the `getDefaultViewName`/`common.galleryView` label lookup —
the same shape `006`'s `007` left in place for `list`, extended here for symmetry rather than
rediscovered.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/gallery-renderer.ts` | Delete | 787 lines |
| `tools/bench/gallery-render-bench.ts`, `run-gallery.mjs` | Delete | 225 + 30 lines |
| `src/views/database-view.ts`, `embedded-database-renderer.ts` | Modify | Render dispatch, DOM-diff case, creation-time defaults removed; migration call kept |
| `src/views/view-config-panel-renderer.ts` | Modify | `renderGallerySettings` and its call site removed |
| `src/views/accessibility-defects.test.ts` | Modify | Two tests that read `gallery-renderer.ts` directly rewritten board-only |
| `src/views/gallery-hide-and-migrate.test.ts` | Modify | The one describe block asserting the now-removed render dispatch deleted; header comment corrected |
| `src/i18n.ts` | Modify | 14 orphaned keys removed; 3 surviving-migration keys kept |
| `tools/live/render-assertion-harness.ts` | Modify | Gallery construction, bags, tag functions, assertions and the `"gallery"` scenario branch removed |
| `tools/live/render-assertion-bundle.mjs`, `render-assertions.mjs` | Modify | Gallery scenario/bag entries and bench source pin removed |
| `tools/live/renderer-coverage.json` | Modify | `6/21` → `5/20`, reason beside the number |
| `tools/live/constructed-state-assertions.mjs` | Modify | Board-only assertions |
| `tools/screenshots/scenarios/core.mjs`, `chrome.mjs`, `shared.mjs`, `constructed-scenarios.mjs` | Modify | Gallery-only scenarios removed; board-shared scenarios split |
| `screenshots/manifest.json` | Modify | 8 gallery-only entries removed; 12 board-shared entries updated |
| `screenshots/notion-clone/views/{gallery-view,constructed-gallery}-*.png` (8 files) | Delete | `git rm`, orphaned by the scenario removal |
| `tools/storybook/verify-placement.mjs` | Modify | `SELECT_FIXTURE` re-pointed off the deleted scenario |
| `styles.css` | Modify | 81 `db-gallery-*` selectors removed |
| `tools/screenshots/runtime-vars.css`, `pinned-values-baseline.json` | Modify | 3 orphaned custom-property stand-ins removed |
| `tools/bench/card-bench-driver.mjs`, `run-board.mjs`, `run-calendar.mjs`, `run-timeline.mjs` | Modify | Comment accuracy only — gallery no longer among the driver's named consumers |
| `tools/mock-data/README.md`, `catalogue.ts` | Modify | Comment/prose accuracy — gallery is retired, not "being withdrawn" |
| `tools/screenshots/constructed-capture.test.mjs`, `manifest-schema.mjs`, `scan-option-tones.mjs` | Modify | Hardcoded gallery-id/renderer-name lists updated to match the removal |
| `tools/lane/css-lane.json` | Modify | Lane acquired and released for this phase; 12 content-changed captures named and reviewed |
| `tools/live/*.json` (9 evidence artefacts) | Modify | Re-stamped by their own tools against the changed `styles.css`/harness sources — not hand-edited |
| `plan.md` | Modify | ADR-001 taken: Accepted |
| `acceptance-criteria.md`, `tasks.md` | Modify | All eight criteria `Met`; every task and checklist item ticked against observed evidence |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Per `plan.md`'s critical path: classification first (already `001`'s), then the four board-shared
capture scenarios split before anything was deleted, then the renderer and its direct measurement
surface, then the stylesheet sweep, then the full capture and gate. Board-shared classification held
up under direct verification: `constructed-card-covers` (board host built before gallery's in the
harness) is `pixelHash`-identical across all four theme/device arms; `card-cover-states` and
`chrome-group-selection-controls` moved because their own gallery half was cut from the fixture
markup, confirmed by reading each edited scenario; `constructed-group-selection-controls` moved for a
reason found only by comparing the before/after PNGs by eye, not predicted in advance — its harness
branch built `galleryHost` *before* `boardHost`, so the capture's element crop previously targeted
gallery's own grouped rendering, and removing gallery's construction correctly exposes the board
extensions selection box the scenario's own title always named. All 12 moved captures were opened and
read by hand, in both themes and both devices, before being named in the css-lane release entry;
16 further captures the full `npm run screenshots` run re-encoded without a pixel or layout change
were restored to their `HEAD`-committed bytes rather than carried as unrelated diffs, with the
manifest's `bytes` field corrected to match.

`npm run gate` ran to completion twice: once before the css-lane handover and the capture/evidence
re-stamp (three lanes red — `css-lane`, `screenshots-fresh`, `evidence`, all for the reason this
phase's own edits caused and none for an unrelated one), and once after, 25/25 green.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| `gallery` stays on `DatabaseViewType`, all six `gallery*` fields stay (ADR-001) | The same shape `006`'s `007` chose for `list`. `002`'s migration and `copyConfigToSourceView` already depend on all six fields surviving; narrowing the type now would strand a vault that skipped `002`'s release or races the on-open migration in a way this phase cannot exercise |
| Remove creation-time gallery defaults (`initializeViewTypeDefaults`, the new-view object literal, `getDefaultGalleryImageField`, `updateGalleryCardSize`) even though ADR-001 keeps the fields | These functions only ever ran when a picker minted a *fresh* `"gallery"` value, which `030` already made impossible; keeping them would leave dead code whose only apparent purpose (creating a new gallery) can no longer happen, which is a different kind of debt than the persisted-field survival ADR-001 protects |
| Split, not delete, every comma-joined CSS selector list a `db-gallery-*` member shared with a surviving view | Deleting the line would have silently dropped board's, list's or table's own rule; found 15 such lists across the full sweep, 13 more than the two the spec had already located |
| Delete section 18 (GALLERY VIEW) whole rather than leave an empty header | An empty numbered section with nothing under it documents a surface that no longer exists; the one shared rule it held (`.db-card-empty-placeholder`) was kept in place as a bare rule rather than given a new header, since nothing in this file's own convention requires every rule to sit under a numbered section |
| Report AC-003 and AC-004 with their full nuance rather than force them into their own literal wording | Gallery never owned a dedicated gate lane the way list owned `list-window`, so "the lane list differs by exactly gallery's lanes" has no lane to point at; three of the four board-shared captures moved pixels for reasons this phase caused and named, not for silent drift. Forcing either into the letter of a criterion borrowed from `list`'s different shape would have been a claim the evidence does not support |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Red before green | Observed directly: after deleting `gallery-renderer.ts` and its bench, `npx vitest run` failed 3 files — `checkbox-family-coverage.test.ts` (the `gallery-view` and `chrome-group-selection-controls` fixtures' `.db-gallery-card-checkbox`/`.db-gallery-group-checkbox` matched no `createCheckbox` call), `screenshot-fixtures.test.ts` (the invented class `db-gallery-group-new`, once `galleryGroupHeader`'s only producer was gone), and `gallery-hide-and-migrate.test.ts` (a describe block asserting the render-dispatch branch this phase deletes). All three went green after the corresponding scenario/harness edit and full suite re-run: 1244/1244 |
| `npx tsc --noEmit` | Exit 0 |
| `npx vitest run` | 1244/1244 passing across 114 files |
| `npm run lint:tools` | Exit 0 |
| `npm run build` | Exit 0, no tracked `main.js` diff beyond this change's own source delta |
| `npm run screenshots` (full) | 546 entries (was 554 — the 8 gallery-only entries) |
| `npm run screenshots:verify` | 546/546 current, 0 stale |
| `node tools/live/replay.mjs` | PASS, 28/28 results held, none referencing a removed file |
| `npm run gate` | **25/25 green**, `$?` read directly, lane list unchanged BY NAME |
| `renderer-coverage.json` | `constructed: 5, total: 20`, `note: "was 6/21; gallery renderer retired"` |
| `rg -c 'db-gallery' styles.css` | 0 |
| ADR-001 (`DatabaseViewType`) | Accepted — `gallery` stays, migrated permanently |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The gate's lane list did not shrink**, unlike `006`'s `007` (25 lanes before and after, not
   24 → 25 by reconciliation). This is a real finding, not an oversight: gallery never owned a
   dedicated lane the way list owned `list-window`, so its removal shows up as smaller lanes
   (`render-assertions`, `evidence`) rather than as a lane deleted from the list. AC-003 records
   this explicitly rather than forcing a false "lane removed" claim.
2. **`constructed-group-selection-controls`'s capture moved for a reason not predicted by this
   phase's own plan.** The plan expected `constructed-card-covers` and
   `constructed-group-selection-controls` to be equally unaffected, both "already board-only." Only
   the first held; the second's harness branch happened to construct `galleryHost` before
   `boardHost`, so its element-mode capture crop had been showing gallery's rendering, not board's,
   the whole time. This is recorded as a correction the removal exposed, verified by hand against
   both the before and after images, not assumed from the code alone.
3. **The six recorded P0/P1 items and the ~145 unphotographed surfaces named in
   `specs/public/HANDOVER.md`** (per `sk-code-obsidian`'s own standing evidence) are unaffected by
   this phase and not claimed fixed by it.
4. **`npm run lint`'s repository-wide baseline** was not re-measured against this specific change;
   `npm run lint:tools` (the tools tree only) is clean, and `npx tsc --noEmit`/`npx vitest run` are
   the gates this phase's own scope touches most directly.
<!-- /ANCHOR:limitations -->

---
