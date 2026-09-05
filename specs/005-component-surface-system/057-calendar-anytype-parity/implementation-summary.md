---
title: "Implementation Summary: Calendar Anytype Parity"
description: "Nothing is implemented yet: the packet was authored on the operator's 2026-09-05 calendar ruling and its first task, the capture true-up, has not run."
trigger_phrases:
  - "057 implementation summary"
  - "calendar anytype parity status"
  - "calendar retarget progress"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "recorded the packet as authored and not started"
    next_safe_action: "Dispatch T001 and put ADR-002's scale question to the operator"
    blockers:
      - "No implementation has begun; every criterion is Unmet by design at this point"
      - "ADR-002 is Proposed and gates the first implementation leg"
    key_files:
      - "src/views/calendar-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-impl"
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
| **Spec Folder** | 057-calendar-anytype-parity |
| **Completed** | Not complete — authored 2026-09-05, no task has run |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Documents, and nothing else.** The packet was authored on 2026-09-05 ~22:45 from the operator's
calendar ruling and no code has changed. `src/views/calendar-renderer.ts` still constructs the same
91 `db-calendar-*` classes it constructed on `3407dab0`, still offers three scales, and still opens
its unscheduled backlog drawer.

### Two findings the authoring pass produced

Both change what this packet can honestly promise, so they are recorded here rather than left to be
rediscovered.

**The calendar carries zero `pm-*` classes.** `039` ported Project Manager's calendar *behaviour*,
not its markup. So `056`'s headline threshold — a Project Manager class count driven to zero — has
no analogue here, and writing one would have produced a criterion that reads green on an untouched
tree. `decision-record.md` ADR-003 records why the mirrored criterion is absent, because a
threshold missing for a good reason and one that was forgotten look identical six weeks later.

**iOS Anytype ships no calendar layout.** `screenshots/anytype/mobile/` holds no calendar capture of
any kind: the iOS view-layout sheets are picker, gallery and kanban, and none of the 104
`mobile/sheets/` captures is a calendar surface. The phone half of this retarget has no reference
and will not get one, so every phone value it writes must say it was inferred from the desktop —
that is REQ-007, and AC-007 counts it.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `specs/005-component-surface-system/057-calendar-anytype-parity/spec.md` | Created | The nine-element calendar anatomy, the phone gap, ten requirements |
| `specs/005-component-surface-system/057-calendar-anytype-parity/goal.md` | Created | The durable directive and the nine frozen decisions |
| `specs/005-component-surface-system/057-calendar-anytype-parity/plan.md` | Created | Five legs, gated on T001 and on the operator's ADR-002 ruling |
| `specs/005-component-surface-system/057-calendar-anytype-parity/tasks.md` | Created | T001 through T014 |
| `specs/005-component-surface-system/057-calendar-anytype-parity/checklist.md` | Created | Ten thresholds, four already measured red |
| `specs/005-component-surface-system/057-calendar-anytype-parity/acceptance-criteria.md` | Created | Ten closure criteria, all Unmet |
| `specs/005-component-surface-system/057-calendar-anytype-parity/decision-record.md` | Created | ADR-001 the retarget, ADR-002 the open scale question, ADR-003 why one threshold is absent, ADR-004 parity by default |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Authored in-runtime in the worktree `.worktrees/117-phases-056-057`, scaffolded by
`runtime/cli/spec/create.sh --phase --parent specs/005-component-surface-system --phases 2`. The
figures in `checklist.md` C2, C5, C6 and C7 were read off the working tree at `3407dab0` and off
the capture folder with `grep -o`, `sed` and `ls`, not estimated. Validation runs from the primary
checkout against the worktree path.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Level 3, against `recommend-level.sh`'s Level 2 | The script returns 63/100 at 92% confidence, under its own Level 3 line. The go-higher rule and consistency with every peer family packet (`050`-`055`) settle it upward. The script's figure is recorded rather than hidden |
| The scale question is asked, not answered | Removing two shipped scales to match a product that never had them is large, irreversible and operator-visible. Goal D6 and ADR-002 put it to the operator with the finding attached |
| The mirrored class-count threshold is not written, and its absence is stated | It would have read green on an untouched tree. ADR-003 records the reasoning so the gap reads as deliberate |
| The phone gap is a counted criterion, not a caveat | A caveat gets dropped once the work looks right. AC-007 counts unlabelled phone values and requires zero |
| `039` is annotated, not rewritten | Superseded work keeps its record; a note that points forward is honest, a silent edit is not |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `orchestrator.js <folder> --strict` | See the packet's landing commit; the first `RESULT:` line is the folder's own verdict |
| `npm run gate` | Not run — no code changed |
| Acceptance criteria | 0 of 10 Met, by design at this point |
| `grep -o 'db-calendar[a-z-]*' src/views/calendar-renderer.ts \| sort -u \| wc -l` | **91** on `3407dab0` |
| `grep -o "pm-[a-z-]*" src/views/calendar-renderer.ts \| sort -u \| wc -l` | **0** on `3407dab0` — the finding behind ADR-003 |
| `ls screenshots/anytype/mobile/**/*calendar*` | No match — the finding behind AC-007 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Every geometry value in `spec.md` section 4 is owed to T001.** The 44 calendar captures are on
   disk and unread. Nothing here is designed from a screen anyone opened.
2. **ADR-002 is Proposed and gates the first implementation leg.** The packet cannot start Leg A
   without knowing whether it keeps three scale branches or removes two.
3. **The phone calendar will ship on inference.** There is no Anytype iOS calendar to read. The
   mitigation is labelling, not measurement, and labelling is weaker — it makes the inference
   visible without making it right.
4. **Two absences are asserted from the capture folder's contents, not yet from the images.** A4's
   unscheduled area and A6's scale switch are recorded as *probably absent* on the strength of
   filenames and `047`'s source-derived read. T001 confirms them across all twenty set captures
   before either is treated as established.
<!-- /ANCHOR:limitations -->

---
