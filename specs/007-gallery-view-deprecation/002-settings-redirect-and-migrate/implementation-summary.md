---
title: "Implementation Summary: Gallery Settings Redirect and Migration"
description: "Nothing has run yet. This records the state the phase opens against, so its later claims have a measured baseline."
trigger_phrases:
  - "implementation summary"
  - "gallery redirect summary"
  - "007 phase 2 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-05T07:14:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Recorded the opening measurements this phase will move from"
    next_safe_action: "Wait for 001, then close the sanitizer red-first"
    blockers:
      - "001's audit must land first"
    key_files:
      - "src/main.ts"
      - "src/data/gallery-migration.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-002-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
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
| **Spec Folder** | 002-settings-redirect-and-migrate |
| **Completed** | Not complete — opened 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This records the state the phase opens against, read from the working tree at
`464cd7e3`.

### Opening measurements

- `src/main.ts:146` — `if (v.viewType !== "board" && v.viewType !== "gallery" && v.viewType !== "chart") v.viewType = "table"`, and the same clause again at `:182`. A loaded gallery is re-blessed
  by both.
- `src/main.ts:1571-1641` — the `.base` importer, and it **already lands on board**: `:1577` reads
  `const viewType = bv.type === "cards" ? "board" : "table"`, with the comment at `:1571-1576`
  recording why. `:1578-1580` reads `bv.image` and guards it against the schema's column keys, and
  `:1641` assigns it to `view.boardImageField`; `:1639`'s comment records that the gallery-shaped
  settings beside it are dropped for want of a board equivalent. **Nothing here mints a gallery.**
- `src/data/gallery-migration.ts` — 74 lines, pure, targets board, reads `galleryImageField`.
- `applyGalleryMigration` call sites: **1**, at `src/views/database-view.ts:11669`, declared at
  `:2717` as `migrateGalleryViewOnOpen`.
- `src/views/embedded-database-renderer.ts` — 29 gallery mentions, **0** migration calls.
- `src/i18n.ts:1456` `notice.galleryMigrated` and `:392` `undo.galleryMigration`, both present in
  `en`, `zh-CN` and `zh-TW`.
- The pickers are already filtered: `toolbar-renderer.ts:97` and
  `view-config-panel-renderer.ts:515`, both keeping a `current === "gallery"` escape hatch.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| None yet | — | Blocked on `001`'s surface list by design |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. When it is, each closed surface carries its own red-before-green record, and the
release version number appears here — because `003` reads this document to know whether it may start.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Board, not table | The board is the only other surface that draws a cover, through the same `resolveCoverImage` call. A gallery becoming a table is a card grid becoming a spreadsheet |
| The sanitizer is closed even though the migration exists | Two independent mechanisms. The migration handles views that open; the coercion handles anything the migration has not reached |
| The importer is pinned rather than changed | It already lands on board, and a behaviour with no test is one edit from regressing. This packet's own first draft is the evidence: it recorded the importer as a live minting surface from a sibling packet's finding rather than from the file |
| The embedded-host question is answered in this phase | Deferring it to `003` means answering it after the window to migrate has closed |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh --strict` on this folder | Not yet run |
| `npm run gate` | Not yet run |
| Red-before-green per closed surface | Not yet applicable |
| Released build carrying the migration | Not yet cut — and `003` stays blocked until it is |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **A rollback does not un-migrate.** Reverting the build restores the renderer, but a view whose
   `viewType` was rewritten stays a board. The per-view in-app undo is the only reversal, and
   `004`'s CHANGELOG must say so.
2. **The REQ set is provisional.** It is written from the parent's inventory and will be rewritten
   from `001`'s surface list. Treating it as final is the mistake this phase is ordered to avoid.
<!-- /ANCHOR:limitations -->

---
