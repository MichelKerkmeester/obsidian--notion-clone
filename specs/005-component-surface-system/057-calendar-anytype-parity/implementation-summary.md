---
title: "Implementation Summary: Calendar Anytype Parity"
description: "No code is implemented. T001, the capture true-up, has run and landed design-trueup.md; the operator has ruled ADR-002; three closure criteria are Met and the render legs have not started."
trigger_phrases:
  - "057 implementation summary"
  - "calendar anytype parity status"
  - "calendar retarget progress"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-05T23:40:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "recorded t001 landing and the adr-002 ruling"
    next_safe_action: "Run T002's red-first pass, then leg A against design-trueup.md"
    blockers:
      - "No code has changed; the seven remaining criteria assert the retargeted render"
      - "T002's red-first figures are owed before leg A"
      - "Six-week rows, overflow and chip hover are pixel read owed"
    key_files:
      - "src/views/calendar-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-impl"
      parent_session_id: null
    completion_pct: 20
    open_questions: []
    answered_questions:
      - "ADR-002 ruled: keep week and day, styled to the month grid"
      - "A4 and A6 are absences, established across all twenty set captures"
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
| **Completed** | Not complete — T001 landed 2026-09-05, no code has changed |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Documents, and nothing else.** The packet was authored on 2026-09-05 ~22:45 from the operator's
calendar ruling; **T001, the capture true-up, ran the same day** and produced `design-trueup.md`.
No code has changed. `src/views/calendar-renderer.ts` still constructs the same 91 `db-calendar-*`
classes it constructed on `3407dab0`, still offers three scales, and still opens its unscheduled
backlog drawer.

### What T001 established

Nine of nine anatomy elements are trued against a named capture: 28 sub-rows carry a measurement,
9 carry **pixel read owed** with the reason a static capture cannot answer them, and 2 stay labelled
`047`-sourced rather than measured. Both absences the packet demanded be *established* rather than
assumed now are, across all 10 light and all 10 dark set captures: **no unscheduled region** and
**no month/week/day scale switch**.

Six premises in this packet's own documents were overturned by the images and are corrected in
place, not only in the true-up. The two that would have done the most damage: the desktop captures
are **1:1, not 2x**, so any leg that halves them builds a calendar at half scale; and the 24 menu
files are **five distinct menus, not six**, because the day-menu and item-menu captures are
byte-identical. Five accessibility values are declined with their measured ratios, chief among them
the today marker's white numeral on `#3C7FFB` at **3.74:1**, replaced by `#216DFA` at 4.53:1.

**The operator ruled ADR-002 at ~23:20**: *"Keep week and day, styled to the month grid."* The month
view goes Anytype 1:1; the two extra scales survive as ours, restyled to the month grid's measured
values, and are labelled that way rather than as an inference from a product that has no week view.

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
| `specs/005-component-surface-system/057-calendar-anytype-parity/decision-record.md` | Created, then updated | ADR-001 the retarget, ADR-002 **Accepted** on the operator's scale ruling, ADR-003 why one threshold is absent, ADR-004 parity by default |
| `specs/005-component-surface-system/057-calendar-anytype-parity/design-trueup.md` | Created | T001's output: the measured Anytype system, the two established absences, the nine-element migration table, six contradictions and five refusals |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Authored in-runtime in the worktree `.worktrees/117-phases-056-057`, scaffolded by
`runtime/cli/spec/create.sh --phase --parent specs/005-component-surface-system --phases 2`. The
figures in `checklist.md` C2, C5, C6 and C7 were read off the working tree at `3407dab0` and off
the capture folder with `grep -o`, `sed` and `ls`, not estimated. Validation runs from the primary
checkout against the worktree path.

T001 ran in `.worktrees/123-trueup-057`. Each capture was opened as an image *and* measured
numerically: grid lines found by scanning for uniform rows and columns rather than by eye, text
sizes derived from cap height at 50% alpha coverage, colours sampled per pixel from glyph cores, and
contrast ratios computed from the sampled hex. Absences were established by counting non-background
pixels in a named region across all twenty captures, which is why they are measurements and not
impressions.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Level 3, against `recommend-level.sh`'s Level 2 | The script returns 63/100 at 92% confidence, under its own Level 3 line. The go-higher rule and consistency with every peer family packet (`050`-`055`) settle it upward. The script's figure is recorded rather than hidden |
| The scale question was asked, not answered — and the operator answered it | Removing two shipped scales to match a product that never had them is large, irreversible and operator-visible. Goal D6 and ADR-002 put it to the operator with T001's absence finding attached; the ruling came back *"keep week and day, styled to the month grid"* |
| Week and day values are labelled *ours, restyled to the month grid's measured values* | Not *inferred from Anytype*. Twenty captures contain nothing to infer a week scale from, and an inference label claiming a source that does not exist is the failure AC-007 was written to prevent on the phone |
| Contradictions are corrected where they were written, not only in the true-up | A true-up nobody re-reads leaves the wrong number in `spec.md` for the leg that acts on it. The 2x premise and the six-menu count are both fixed in place |
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
| `npx tsc --noEmit` / `npm run build` / `npx vitest run` | Not run — documentation-only change, no code and nothing that renders. `repo-rules/verification-gates.md` §2: a gate that exercised nothing is not evidence |
| Acceptance criteria | **3 of 10 Met** — AC-001, AC-005, AC-006. The other seven assert the retargeted render or are the operator's |
| A4 and A6 absence scan, 20 captures | **0** non-background px below the grid rule; **0** ink in the header band between the title and the `‹ Today ›` cluster |
| Day-menu vs item-menu capture identity | MD5 `28d38b3a11620d04ef06e7e86c65b5c5` for both light `-full` files; two more pairs match |
| `grep -o 'db-calendar[a-z-]*' src/views/calendar-renderer.ts \| sort -u \| wc -l` | **91** on `3407dab0` |
| `grep -o "pm-[a-z-]*" src/views/calendar-renderer.ts \| sort -u \| wc -l` | **0** on `3407dab0` — the finding behind ADR-003 |
| `ls screenshots/anytype/mobile/**/*calendar*` | No match — the finding behind AC-007 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. ~~Every geometry value in `spec.md` section 4 is owed to T001.~~ **Closed.** All nine elements
   carry a measurement, a **pixel read owed** marker, or an `047`-sourced label.
2. ~~ADR-002 is Proposed and gates the first implementation leg.~~ **Closed.** Accepted, keep.
3. ~~Two absences are asserted from the capture folder's contents, not from the images.~~ **Closed.**
   Both established across all twenty set captures by pixel count.
4. **The phone calendar will ship on inference.** There is no Anytype iOS calendar to read. The
   mitigation is labelling, not measurement, and labelling is weaker — it makes the inference
   visible without making it right. Two constraints outrank the inference there and are named in
   `design-trueup.md` §8: `044`'s 44px touch floor, which a 20px chip pitch cannot meet, and `048`'s
   stacking model, which the new day menu may register a twelfth surface against.
5. **Nine sub-rows are pixel read owed and no capture will supply them.** Hover, focus, press, drag,
   the overflow affordance, chip truncation, multi-day spans, a two-digit today, and what a six-week
   month does to the row height. A static capture cannot show any of them. Each keeps our current
   behaviour and says so, rather than taking a plausible number.
6. **No code has changed.** Every criterion that asserts the retargeted render is still Unmet, and
   the three code gates were not run because nothing they test moved.
<!-- /ANCHOR:limitations -->

---
