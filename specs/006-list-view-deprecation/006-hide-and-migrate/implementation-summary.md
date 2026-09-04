---
title: "Implementation Summary: Hide the List and Migrate What Exists"
description: "Nothing is built yet. This records the opening state: the picker that still offers list, the persisted union that forbids deleting it, and the gallery code this phase copies."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list withdrawal summary"
  - "006 phase 006 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/006-hide-and-migrate"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the opening state; no code has changed"
    next_safe_action: "Read the audit output, then add the picker filter (tasks.md T001-T003)"
    blockers:
      - "Blocked on 005's migration target and data-loss list"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/data/gallery-migration.ts"
      - "src/data/types.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-006-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 006-hide-and-migrate |
| **Completed** | Not complete — opened 2026-09-04 |
| **Level** | 1 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This records the state the phase opens against, so the copy of the gallery pattern
can be checked against the original rather than against memory.

### Opening measurements

Read from the tree at `c6b5f11`:

- `src/views/toolbar-renderer.ts:1297-1308` builds the view-type option list with all seven values
  and returns `all.filter((option) => option.value !== "gallery" || current === "gallery")`. List is
  offered everywhere.
- The comment above it, at `:1285-1296`, already states the reasoning this phase reuses: the value
  is persisted into vault files, so withdrawal is reversible and deletion is not, and the `current`
  escape hatch exists so a database that already is that type still sees its own value.
- `src/data/gallery-migration.ts:48` exports `planGalleryMigration` and `:69`
  `applyGalleryMigration`, with the target recorded in a comment at `:11` — `board`, not `table`,
  for reasons specific to the gallery's card shape.
- `src/data/types.ts:317` carries `list` in `DatabaseViewType`.
- There is no `list-migration.ts`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none) | — | No source file has changed. The documents in this folder are the only artifacts so far. |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. `plan.md` §3 sets the shape: a filter, a migration module whose plan carries its own
idempotence, and a notice in three locales. Nothing is deleted, which is what lets this ship on its
own release and revert by deleting the filter.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Copy the gallery pattern rather than re-derive it | It has been through review, and the detail most likely to be lost in a re-derivation — the `current` escape hatch — is exactly the one that produces a control reading as broken. |
| Ship this phase on its own release | It is the last reversible step. `007` is not, and a rollback that has to undo both is a rollback nobody wants to attempt against a user's vault. |
| Target the table, not the board | The list already derives its tracks from the table's column widths, so the column set carries over. The gallery chose `board` because a migrated gallery reads as one column of cards; that reasoning is the gallery's, not the list's. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 006-hide-and-migrate --strict` | Run at authoring time; see the packet commit |
| `list-migration.test.ts` | Does not exist yet (tasks.md T008) |
| Operator report on a released build | Not sought; nothing is built |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Blocked on `005`.** The migration target and the data-loss list are that phase's output, and
   implementing without them is how an affordance gets dropped silently.
2. **A view that never opens is never migrated.** That is acceptable only while the renderer still
   exists, which is why `007` waits for this to reach a release rather than following it directly.
3. **Whether the notice offers an undo is undecided.** An undo means storing the pre-migration
   config, which is state this packet otherwise avoids; it is recorded in `spec.md` §7 rather than
   settled here.
<!-- /ANCHOR:limitations -->

---


