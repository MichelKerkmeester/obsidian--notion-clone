---
title: "Implementation Summary: Board Anytype Parity"
description: "Nothing is implemented yet: the packet was authored on the operator's 2026-09-05 board ruling and its first task, the capture true-up, has not run."
trigger_phrases:
  - "056 implementation summary"
  - "board anytype parity status"
  - "kanban rebuild progress"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-05T23:40:00Z"
    last_updated_by: "design-leaf"
    recent_action: "recorded t001 as landed and the two false premises it found"
    next_safe_action: "Run T002, the red-first measurement pass, on the current tree"
    blockers:
      - "No implementation has begun; every criterion is Unmet by design at this point"
    key_files:
      - "src/views/board-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-impl"
      parent_session_id: null
    completion_pct: 10
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
| **Spec Folder** | 056-board-anytype-parity |
| **Completed** | Not complete — authored 2026-09-05, no task has run |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Documents, and nothing else.** The packet was authored on 2026-09-05 ~22:45 from the operator's
board ruling and no code has changed. `src/views/board-renderer.ts` still constructs the 39 `pm-*`
classes it constructed on `3407dab0`, and `styles.css` still carries its 23 `pm-kanban-*` rules.
Recording that plainly matters more than an optimistic summary: three releases have shipped a board
that is now off-target, and a later session reading this file needs to know the rebuild has not
started.

### The packet itself

`spec.md` carries the thirteen-element Anytype kanban anatomy and the per-element migration table
that will replace the Project Manager vocabulary. `decision-record.md` ADR-001 records the reversal
with the operator's words. `checklist.md` already holds three figures measured on `3407dab0` — 39
constructed classes, 23 stylesheet rules, 7 default-off extensions — so the first leg has a red to
be measured against rather than one asserted afterwards.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `specs/005-component-surface-system/056-board-anytype-parity/spec.md` | Created | The kanban anatomy, the migration table, nine requirements |
| `specs/005-component-surface-system/056-board-anytype-parity/goal.md` | Created | The durable directive and the nine frozen decisions |
| `specs/005-component-surface-system/056-board-anytype-parity/plan.md` | Created | Five legs grouped by file, T001 first |
| `specs/005-component-surface-system/056-board-anytype-parity/tasks.md` | Created | T001 through T011 |
| `specs/005-component-surface-system/056-board-anytype-parity/checklist.md` | Created | Ten thresholds, three already measured red |
| `specs/005-component-surface-system/056-board-anytype-parity/acceptance-criteria.md` | Created | Ten closure criteria, all Unmet |
| `specs/005-component-surface-system/056-board-anytype-parity/decision-record.md` | Created | ADR-001 the reversal, ADR-002 parity by default, ADR-003 `045` kept |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Authored in-runtime in the worktree `.worktrees/117-phases-056-057`, scaffolded by
`runtime/cli/spec/create.sh --phase --parent specs/005-component-surface-system --phases 2`. The
three figures in `checklist.md` C3 and C5 were read off the working tree at `3407dab0` with
`grep -o` and `sed`, not estimated. Validation runs from the primary checkout against the
worktree path.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Level 3, against `recommend-level.sh`'s Level 2 | The script returns 68/100, one point under its own Level 3 line, at 82% confidence. The go-higher rule and consistency with every peer family packet (`050`-`055`) settle it upward. The script's figure is recorded rather than hidden |
| The board reversal is a new phase, not a reopening of `038` | `038` shipped and verified a different target; reopening it would make its record contradict itself. The operator also asked for phases explicitly |
| Three figures measured at authoring time rather than left to T002 | They cost one `grep` each and they make the first leg's red checkable by anyone reading this packet cold |
| Nothing in `047`, `038` or `050` was rewritten, only annotated | Superseded work keeps its record; a note that points forward is honest, a silent edit is not |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `orchestrator.js <folder> --strict` | See the packet's landing commit; the first `RESULT:` line is the folder's own verdict |
| `npm run gate` | Not run — no code changed |
| Acceptance criteria | 0 of 10 Met, by design at this point |
| `grep -o "pm-[a-z-]*" src/views/board-renderer.ts \| sort -u \| wc -l` | **39** on `3407dab0` — the red C3 is measured against |
| `grep -o "pm-kanban[a-z-]*" styles.css \| sort -u \| wc -l` | **23** on `3407dab0` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

**T001 landed 2026-09-05 and discharged item 1 below, while correcting two of the premises the
rest of this list rests on.** `design-trueup.md` is its output: 33 of the 62 files opened, all 20
set captures scanned programmatically, **9 of the 13 anatomy elements measured** and 4 labelled
*design inferred* with their reason. It found **two false premises in the packet's own targets** —
`spec.md` A1 asked for a desktop record count that does not exist, and section 12 treated the phone
board as uncaptured when `anytype-mobile-set-kanban-{light,dark}.png` is that board. It also
recorded **four accessibility declines with their measured ratios plus one platform decline**
(`decision-record.md` ADR-004), all of them light-theme; the dark theme is adopted hex for hex.
Items 2 onward below are unchanged and still owed.

1. ~~**Every geometry value in `spec.md` section 4 is owed to T001.**~~ **Discharged.** The captures are on disk and
   unread. Nothing here is designed from a screen anyone opened, and the document says so in each
   cell rather than implying a measurement it does not have.
2. **The drag-held state has no capture.** `screenshots/anytype/README.md` records drag-only states
   as not specifically captured, so A7 will carry the **design inferred** label unless T001 finds
   one. `047` section 5's source-derived read is the substitute and is labelled as such.
3. **The phone board's body has no Anytype reference beyond three sheets.** The iOS captures cover
   the group-by sheet, the column menu and the view-layout sheet — not the board body itself. The
   open question in `spec.md` section 12 is real and unanswered.
<!-- /ANCHOR:limitations -->

---
