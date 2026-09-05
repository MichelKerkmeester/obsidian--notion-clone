---
title: "Implementation Summary: Gallery Settings Redirect and Migration"
description: "The settings-load sanitizer is closed by routing a loaded gallery through the real migration rather than the bare unknown-type fallback; the embedded codeblock host gained the migration call it never had; the migration itself now carries fit and aspect ratio to their board equivalents. Gate green, 25/25 lanes. Blocked only on the release cut that unblocks 003."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "gallery redirect summary"
  - "007 phase 2 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-05T09:15:00Z"
    last_updated_by: "redirect-and-migrate-run"
    recent_action: "Closed the sanitizer, wired the embedded-host migration, carried two loss fields"
    next_safe_action: "Hand off to the orchestrator for a release cut (T013); 003 does not start before it exists"
    blockers:
      - "A released version number does not exist yet — parent D8 blocks 003 on it, not on this phase's own work"
    key_files:
      - "src/main.ts"
      - "src/data/gallery-migration.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/views/gallery-hide-and-migrate.test.ts"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-002-summary"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "The embedded host migrates — ADR-001"
      - "The two accepting surfaces close by routing through the real migration, not by deletion — ADR-002"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 002-settings-redirect-and-migrate |
| **Completed** | 2026-09-05 (implementation and gate; release cut pending) |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

### 1. The settings-load sanitizer no longer re-blesses a persisted gallery (T004)

`src/main.ts:146` and `:182` used to read
`v.viewType !== "board" && v.viewType !== "gallery" && v.viewType !== "chart"`, an explicit exemption
that left a loaded gallery unchanged. `001`'s audit found that closing it the way `006`'s `e0e1c568`
closed the parallel `list` exemption — deleting the special case so the value falls to the generic
`"table"` fallback — would strand `galleryImageField`, because gallery's migration target is `board`,
not the fallback value. Both sites now special-case `"gallery"` explicitly and call
`planGalleryMigration`/`applyGalleryMigration` on the loaded view in place, converting it to `"board"`
with its cover, aspect ratio and fit carried across in the same step, silently and idempotently, before
any view has rendered. Recorded as `decision-record.md` ADR-002.

### 2. The `.base` importer is unchanged and now pinned (T005)

`main.ts:1577` already lands a `cards` view on `board`; nothing needed to change. Two regression tests
in `gallery-hide-and-migrate.test.ts` pin the mapping line and the image-field carry so a later edit
cannot silently reintroduce the gallery landing.

### 3. The second accepting surface stays open, on purpose

`data-source.ts:1527-1529`'s `parseViewType()` — the surface `001`'s audit found beyond the sanitizer —
continues to accept `"gallery"` from a vault file's frontmatter. Closing it would run into the identical
strand-the-cover problem the sanitizer avoids above, with no plan/apply step available at parse time.
Leaving it open is what lets the on-open migration (below) ever see a `"gallery"` view to redirect.
Recorded as `decision-record.md` ADR-002, alongside a regression test that the parser still accepts the
value.

### 4. The migration now carries the two fixable declared-loss fields (T007)

`001`'s audit found two `gallery*` fields with an exact-match board equivalent the migration did not
yet carry: `galleryImageAspectRatio` → `boardImageAspectRatio`, `galleryImageFit` → `boardImageFit`.
`gallery-migration.ts` now carries both, and resolves an aspect-ratio *preset* (`square`/`banner`/
`portrait`/`landscape`) to its numeric value before carrying it — the preset label itself has no board
equivalent and stays a declared loss, but the visual result survives. `galleryCardSize` and
`galleryCardSizePreset` remain genuine declared losses with no board field at all (the board's
`boardColumnWidth` sizes a kanban lane, a structurally different layout) — both fields stay on the view
object rather than being deleted, same as before, so an undo restores them.

### 5. The embedded codeblock host gained the migration call it never had (T008)

`applyGalleryMigration` had exactly one call site (`database-view.ts:11678`) since `030` shipped it.
`embedded-database-renderer.ts` now imports `planGalleryMigration`/`applyGalleryMigration` and runs a
new `migrateGalleryViewOnOpen(config)` from `render()`, copying `migrateListViewOnOpen`'s exact shape:
a database-keyed session set, a persisted `plugin.settings.galleryMigrationNotices` array so the notice
survives across sessions and leaves, and a `try`/`catch` that rolls the `viewType` back to `"gallery"`
on a thrown write. `database-view.ts`'s own `migrateGalleryViewOnOpen()` was upgraded from a
session-only `Set<viewId>` guard to the same persisted, database-keyed shape, for parity between the
two hosts. Recorded as `decision-record.md` ADR-001, citing `046-linked-views-notion-parity`'s ADR-001
as the precedent that already settled the categorical objection to an embed writing to its source.

### 6. `notice.galleryMigrated` now exists in all three locales, and declares the one real loss (T011)

The key existed only in `en` — `zh-CN` and `zh-TW` were silently falling back to the English string
(the plugin's `t()` always has an English fallback, so this was not a runtime break, but it is the gap
the dispatch named). Added to both locales. All three locale strings were also extended to name the one
loss the notice did not previously mention: card-size settings do not carry over.

### 7. `PluginSettings.galleryMigrationNotices` (T008)

Added to `src/data/types.ts`, mirroring `listMigrationNotices` field-for-field.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/main.ts` | Modify | Sanitizer closure at `:146`/`:182` (ADR-002); import added |
| `src/data/gallery-migration.ts` | Modify | Carry `imageAspectRatio`/`imageFit`; resolve a preset to its number |
| `src/data/gallery-migration.test.ts` | Modify | Two new tests for the carried fields |
| `src/data/types.ts` | Modify | `galleryMigrationNotices?: string[]` |
| `src/i18n.ts` | Modify | `notice.galleryMigrated` added to `zh-CN`/`zh-TW`; all three locales declare the card-size loss |
| `src/views/database-view.ts` | Modify | `migrateGalleryViewOnOpen()` upgraded to the persisted, database-keyed, try/catch shape |
| `src/views/embedded-database-renderer.ts` | Modify | New `migrateGalleryViewOnOpen(config)`; call added to `render()`; new `migratedGalleryViews` field |
| `src/views/gallery-hide-and-migrate.test.ts` | Create | Source-level pins for the pickers, the sanitizer closure (red-first), the `.base` importer, the open accepting surface, and both hosts' migration wiring |
| `decision-record.md` | Create | ADR-001 (embedded host), ADR-002 (accepting surfaces) |
| `screenshots/manifest.json` | Modify | Source-hash refresh for the 20 entries sourced from `embedded-database-renderer.ts`/`i18n.ts`; scoped to exactly those entries, no unrelated capture drift committed |
| `tools/live/*.json` | Modify | Gate-generated evidence re-measured against the changed sources (timestamps and hashes only) |
| `../spec.md` | Modify | Applied `001`'s T014 corrections (this dispatch's granted write authority) |
| `../roadmap.md` | Modify | This child's status row |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Per `plan.md`'s critical path: read `001`'s findings first, then closed the sanitizer and the importer
(the importer needed pinning only), then took ADR-001 for the embedded host, then applied the loss
list to the migration. Every closed surface's test was run against the pre-edit source first and
observed failing on the exact assertion it was written to prove, then run again after the edit and
observed passing — `gallery-hide-and-migrate.test.ts` went from 4 failing / 5 passing to 11/11.
`npm run screenshots:verify` failed once with a source-hash staleness list (20 entries, all sourced
from the two files this phase actually changed); the fix was scoped to exactly those 20 entries by
diffing a fresh full capture against the committed manifest and merging in only the entries whose
`sourceHashes` legitimately changed, discarding the harness's own pixel-level non-determinism on
unrelated fixtures (`panel-column-manager`, `constructed-icon-picker`, and others) that a blanket
`npm run screenshots` would otherwise have committed as unrelated diffs.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Close the sanitizer by routing through the real migration, not by deleting the exemption | `001`'s audit proved a verbatim copy of `006`'s edit would strand the cover before the on-open migration ever ran — full reasoning in `decision-record.md` ADR-002 |
| Leave `parseViewType()` open | Same reasoning as above, from the read side: no plan/apply step exists at parse time, and closing it would produce the identical strand |
| Add the embedded-host migration call rather than record a knowing gap | `046`'s ADR-001 already removed the categorical objection to an embed writing to its source, and shipping the asymmetry a third time (after `030` and `006` both inherited it) had no remaining argument in its favor |
| Resolve an aspect-ratio preset to its number rather than drop it | Keeps the visual result the operator would see, at the cost of only the preset label, which the board has no field for anyway |
| Scope the screenshot refresh to the 20 legitimately stale entries | A blanket regenerate would have committed ~15-19 unrelated pixel-level diffs from the harness's own font-loading non-determinism on fixtures this phase never touched |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Red-before-green (T004, T006) | `gallery-hide-and-migrate.test.ts` observed 4 failing against pre-edit source, 11/11 passing after |
| `npx vitest run` (T009-T012) | 1154/1154 passing across 109 files |
| `npx tsc --noEmit` | Exit 0 |
| `npm run lint:tools` | Exit 0 |
| `npm run build` | Exit 0 |
| `npm run screenshots:verify` | Exit 0, 546/546 entries current, after the scoped refresh |
| `npm run gate` (T010) | Exit 0 — 25/25 lanes green, read from `$?` directly |
| `validate.sh 002-settings-redirect-and-migrate --strict` | Run at authoring time; see the packet commit |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **A released version number does not exist yet.** AC-007 stays `Unmet`; parent D8 blocks `003` on a
   release, not on this phase's own implementation or gate state. T013 hands this to the orchestrator.
2. **No real-vault fixture test exists for the gallery migration**, unlike
   `list-migration-real-data.test.ts`'s transcription of the operator's own "Punch List" view. `001`'s
   audit found 0 gallery-configured views in the operator's vault today, so there is no real fixture to
   transcribe — a deliberate non-parallel, not a gap.
3. **The settings-load sanitizer's conversion is silent (no `Notice`).** It runs during `onload()`,
   before any view has rendered; the user-visible "opens as a board, once, with a notice" behavior is
   carried entirely by the on-open migration in both hosts, which is where REQ-002 is centered. Recorded
   as part of `decision-record.md` ADR-002's consequences rather than left implicit.
<!-- /ANCHOR:limitations -->

---
