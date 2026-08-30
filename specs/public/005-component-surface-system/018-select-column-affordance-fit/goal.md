---
title: "Goal: Select Column Affordance Fit"
description: "What would make phase 018 worth having done, and the criteria that decide it."
trigger_phrases:
  - "018 goal"
  - "select column affordance goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/018-select-column-affordance-fit"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored after the fact; before-numbers are recorded, not reproduced"
    next_safe_action: "Re-run the overlap check and observe both negative controls red"
    blockers:
      - "No negative control has been run; the check is not yet shown to be connected"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-018-goal"
      parent_session_id: null
    completion_pct: 40
    open_questions: []
    answered_questions: []
---
# Goal: Select Column Affordance Fit

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The reorder button and the row checkbox share the select cell and must both fit in it,
on every surface that renders both. They overlapped: **−14px in a 49px cell on a phone, −17px on
desktop.**

**Why this phase exists at all is the more durable point.** The fix landed under
`004-checkbox-ownership`'s lane hold, and `004`'s acquire note names it — but all thirteen of `004`'s
criteria measure checkbox **appearance and ownership**, and none measures column geometry. `017`
independently disclaimed the two overlap checks as not its phase's. Both neighbours were right, and
nothing owned it.

### Decisions

| ID | Decision |
|----|----------|
| D1 | A lane hold is permission to edit a file. It is not a scope grant. |
| D2 | Every before-number here is copied from the lane journal, **not reproduced** — this phase opened after the fact and must not take a lane another phase holds. |
| D3 | No row may be marked Met on a recorded number alone. This program has already shipped a release on numbers nobody re-ran. |
| D4 | A criterion that reads a comment is not a measurement. The column width is re-measured from what the controls paint. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] The gap between the button's right edge and the checkbox's left edge is ≥ 0 on every surface
      that renders both. Recorded failing at −14px phone and −17px desktop; recorded after at +4px in
      a 65px cell.
- [ ] Zero reorder buttons render in a desktop list or gallery row, which is what production builds —
      the table creates it only on touch. Was present and unstyled in every desktop row, because a
      **touch-floor block declared `display: inline-flex`** at equal specificity and later in the
      file than the `display: none` written for the non-phone case. A minimum-size rule decided
      visibility, and a check on the gap alone would have gone green the moment the button
      disappeared without anyone establishing why.
- [ ] The column width equals the sum of the painted control boxes and their insets, re-measured
      rather than read from a comment. Was 48px, from `48 = button 24 + checkbox 16 + gap 8` — true
      when written, untrue from the moment a different phase raised both controls to 28px. Two 28px
      controls do not fit in 48px at any gap, and a criterion that read the comment would still pass
      today. Now `4 + 28 + 4 + 28 = 64`.
- [x] Both negative controls observed red: restoring the `display` declaration takes the check red on
      desktop at **-17px in a 40px cell** while the phone stays green, and restoring the 48px column
      takes it red on the phone at **-12px in a 49px cell** while the desktop stays green. Each moves
      only its own surface. Restored, the harness is exit 0 at 210 of 214 and `styles.css` hashes
      byte-identical to the baseline. The phone figure was recorded as -14px and measures -12px;
      the reproduced number is the one with a run behind it.
- [ ] The operator opens the table on the phone and reports that the button has room. A positive gap
      in a headless browser is necessary and never sufficient.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Read the coverage table at the end of `acceptance-criteria.md` before anything else** — four rows,
four blank negative-control cells. Under the parent `spec.md` §6 a blank cell blocks closure even
when the number in it would have been valid, so **this phase may not close today.**

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Code | Shipped | Lane journal entry 64, under `004`'s hold |
| Numbers | Recorded, not reproduced | `acceptance-criteria.md` provenance note |
| Negative controls | Not run | Both named, neither observed |
| Operator confirmation | Not requested | — |

### Deviations and findings

| Item | Note |
|------|------|
| Opened after the code shipped | One of two orphans this program found; `roadmap.md` §6 |
| A rule's scope is not its name | A touch-floor block decided `display`. Same class of defect as the duplicate reorder-controls pair in `002` |
| A derived number in a comment goes stale silently | `48 = 24 + 16 + 8` was true when written and nothing recomputed it |

**DONE MEANS** the operator taps the little button beside a checkbox on their phone and hits it.
<!-- /ANCHOR:log -->
