---
title: "Implementation Summary: Board Card Properties"
description: "Nothing is built yet. This records the opening state — the three rules that decide a board card's fields today, and the reference slot map the new control must not disturb."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "045 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/045-board-card-properties"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the opening state; no code has changed"
    next_safe_action: "Design the persisted shape (tasks.md T003)"
    blockers:
      - "Nothing implemented; this document is the pre-work baseline"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/data/types.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-045-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 045-board-card-properties |
| **Completed** | Not complete — opened 2026-09-04 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This records the state the packet opened against, read from the tree at `c6b5f11`.

### Opening measurements

- `src/views/board-renderer.ts:1439` — `const columns = this.actions.getColumns(config)`. Every view
  binds that action to the same `getVisibleColumns(config, this.rows, this.vs(), this.pendingShowColumns)`
  (`src/views/database-view.ts:477`, `:808`, `:833`, `:865`), so a board card's candidate field set
  *is* the table's visible-column set.
- `src/views/board-renderer.ts:1478-1483` — the candidates are then filtered by three rules: not the
  title field, not the grouped or subgrouped field, and not any `select` or `status` column. The
  last exists because `renderCardTitleChips` (`:1475`) renders those beside the title instead.
- `src/data/types.ts:454` — `ViewConfig` already carries `hiddenColumns` (`:517`), `columnOrder`
  (`:513`), `showEmptyFields` (`:566`), `boardImageField` (`:499`) and `titleField` (`:555`). Four
  overlapping visibility concepts before this phase adds anything.
- `src/views/board-renderer.ts:222` — `this.boardExtensions = config.boardExtensionsEnabled === true`.
  The default board is the one-to-one reference copy; the local `db-board-card` renderer only runs
  when the flag is on.
- `src/views/board-renderer.ts:552` — `getReferenceCardFields` resolves exactly five semantic slots:
  `time`, `progress`, `due`, `tags`, `people`. `specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:10`
  `KanbanCardProps` names the same shape, plus `priorityColor`, `parentTitle` and
  `descriptionPreview`. That fixed set is the boundary REQ-007 protects.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none) | — | No source file has changed. The documents in this folder are the only artifacts so far. |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. `plan.md` §3 sets the order: the persisted shape and the resolver land first with a
differential test proving the absent-list path reproduces today's three rules, then the renderer
swaps, then the control is built on top. The migration is proved by a capture pair rather than a
unit test, because a card that quietly loses a field passes every test anyone would write here.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Pair the new list with removing the board's read of `hiddenColumns` | A period where both are consulted would make the behaviour unexplainable to the operator and untestable for us. |
| Absent list means "derive today's behaviour" | An upgrade that changes every existing board card at once is the worst outcome available here, and it is also the easiest one to ship by accident. |
| Confine the control behind `boardExtensionsEnabled` | `038` spent four review rounds proving the default board matches the reference to the pixel. A properties list reaching that path would undo it, so the flag that already gates local extensions gates this one too. |
| Record gallery as a question | The renderer has the same shape and probably generalises. The operator asked for the board, and widening on a guess is how a packet stops being checkable. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 045-board-card-properties --strict` | Run at authoring time; see the packet commit |
| `npm run gate` | Not run — no source change to gate |
| Differential test for the resolver | Does not exist yet (tasks.md T010) |
| Operator device confirmation | Not sought; the control is not built |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The phone control is blocked on `044`.** T007 waits for the sheet row grammar; the desktop
   popover does not, so the phase is not idle.
2. **Gallery is out of scope by decision, not by analysis.** `gallery-renderer.ts:361` builds its
   meta grid the same way and would benefit; whether it shares the mechanism is `spec.md` §10's
   first open question.
3. **Whether the control should reach the reference card's five slots is unresolved.** REQ-007 says
   the reference path must not diverge. Whether a *mapping* control over those slots counts as
   divergence is a judgment recorded for the operator, not decided here.
<!-- /ANCHOR:limitations -->

---
