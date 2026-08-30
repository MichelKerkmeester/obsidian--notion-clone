---
title: "Goal: Mobile Touch Semantics in the Table"
description: "What would make phase 012 worth having done, and the criteria that decide it."
trigger_phrases:
  - "012 goal"
  - "mobile touch semantics goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/012-mobile-touch-semantics"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored; 87 of 88 checks pass, AC-8 recorded FAIL and AC-6b UNVERIFIED"
    next_safe_action: "One recapture, then the operator drags a finger across the table"
    blockers:
      - "screenshots-fresh red: captures stale against another phase's styles.css edit"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-012-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Phone title rename has no reachable entry point; acceptable or not"
    answered_questions:
      - "Phone row height 44px declined by the operator; density outranks it"
---
# Goal: Mobile Touch Semantics in the Table

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A touch in the table means what a touch means, rather than replaying the desktop
pointer grammar. A tap edits the cell it lands on; a tap on the row's main item opens the record
sheet; and a finger never paints a selection range the operator did not ask for and cannot act on.

The reported defect was 14 cells selected by a finger — seven 34px rows by two columns, measured off
the image rather than counted by eye. A painted range on a phone is not merely useless: it is a state
the user cannot see the extent of, cannot clear except by tapping elsewhere, and which changes what
the next tap does.

**The inventory changed the fix, which is why it came first.** The range was painted by **two taps,
not a drag**. There are **two** pointer owners, not three. Four column types already opened an editor
on tap. The record sheet already existed and was already reachable, through a 24px target. Each of
those would have sent a fix somewhere different.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The phone predicate belongs nowhere. `isMobileBottomSheet` and `isTouchDevice` disagree on a 700px pane, so input keys off the **per-event `pointerType`** instead. |
| D2 | A check must exercise the guard that does the work. AC-2 and AC-7 are measured in a leaf narrow enough that `isTouchDevice(row)` reads `true`, or they would pass without touching the guard. |
| D3 | Removals are recorded as removals, not folded into the description of what was added. |
| D4 | The 44px table row height is **declined**: density outranks it, and the cell clips its own overflow so a hit-area expansion is a no-op. Closed with a number; not a failure. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] A tap never extends a range: exactly 1 cell, anchor equals focus. Was 16 cells across 8 rows by
      2 columns.
- [ ] A mouse still extends at phone width: 24 cells, anchor held at `file.name`.
- [ ] The gesture reader routes real events: four values from one binding — rest `mouse`, after touch
      `touch`, after mouse `mouse`, pen `touch`.
- [ ] The tap truth table holds for 5 of 5 rows: title cell to the sheet, every other cell to its
      editor.
- [ ] The **whole** title cell opens the record, not the icon inside it: a press 40px left of the
      button resolves to `open-record`. Cell 169×34 against a button 24×24.
- [ ] A tap does not fight the sheet: the cell centre resolves to the scrim with
      `pointer-events: auto`, negative control `{scrimCapturesPointer: false}` observed red.
- [ ] The long-press row menu survives: 0 at 100ms, exactly 1 at 600ms.
- [ ] Every check was watched failing first on a deliberately broken tree, with the failing number
      recorded.
- [ ] The gate exits 0. **Today it exits 1 at 12 of 13** on `screenshots-fresh`, red for a stylesheet
      edit this phase does not own. The threshold asks for exit 0 and this is not exit 0.
- [ ] The operator drags a finger across the table and nothing gets selected, and a tap on a row's
      name opens that record.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**90%: 87 of 88 placement checks pass; the gate is red on another phase's stale captures.**

### Two things are recorded honestly rather than green

AC-6b — that an editor-opening tap does not scroll the table — is **UNVERIFIED**, because it is not
measurable without a live Obsidian `App`. It is not marked passed. And AC-8 is **FAIL**, not
"green with a footnote": the threshold asks for exit 0.

### Two behaviours this phase removes from a phone, recorded as removals

A tap on the note name no longer opens the note — the capture-phase handler resolves `open-record`
and stops the link's own handler. The replacement is the sheet's own header control, so the note is
one tap further away, not unreachable. A mouse is unaffected.

The title cell's rename editor now has **no reachable entry point at all** on a phone. Renaming is
bound to `dblclick` and to keyboard type-to-edit, and a phone has neither; routing through the sheet
does not recover it, because the sheet's title is bound to `dblclick` too, and the long-press row
menu has no rename entry. Whether that is acceptable is an open question, not a decision this phase
took.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Range no longer painted by touch | Shipped, verified | AC-1, 16 cells → 1 |
| Desktop range preserved | Verified | AC-2 and AC-8, at phone width and on both pages |
| Title tap shared by both hosts | Shipped, verified | `setupTitleCellTap` moved to `table-record-peek` |
| Scroll-during-edit | Unverified | Needs a live `App` |
| Gate | FAIL, exit 1 | 12 of 13; not this phase's stylesheet |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| Row-checkbox range selection | The same defect one layer over; handed to `017` deliberately rather than absorbed |
| 44px row height | Declined by the operator with a number. Do not reopen as a defect |
<!-- /ANCHOR:log -->
