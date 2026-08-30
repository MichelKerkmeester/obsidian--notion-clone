---
title: "Goal: Touch Row Range Selection"
description: "What would make phase 017 worth having done, and the criteria that decide it."
trigger_phrases:
  - "017 goal"
  - "touch row range selection goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/017-touch-row-range-selection"
    last_updated_at: "2026-08-30T19:10:41Z"
    last_updated_by: "criteria-reconciliation"
    recent_action: "Completion anchor reconciled: AC-1 to AC-9 all green in the captured run"
    next_safe_action: "Operator answers the status-bar announcement, then taps a checkbox on device"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-017-goal"
      parent_session_id: null
    completion_pct: 96
    open_questions:
      - "Does the hold gesture get an announcement in the selection status bar"
    answered_questions:
      - "Row range-select moves behind a long press, sharing attachLongPress with the row menu"
---
# Goal: Touch Row Range Selection

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A tap on a row checkbox selects that row and nothing else, and extending a range is a
gesture the operator chooses rather than a state they cannot escape.

`isTouchDevice` was OR-ed into the range predicate, so on **every touch device** a tap on a row
checkbox selected everything between it and the last row touched — shift held down with no way to let
go. The range moves behind a long press, using `attachLongPress`, the same object the row menu
already uses, so threshold, tolerance and haptic are shared rather than matched.

**The half that was never a phone defect is the one worth keeping in view.** `isTouchDevice` measures
the **container**, not the device. In a 700px leaf on a 1440px desktop it reads `true`, so a mouse
click extended a range on a machine with no touchscreen at all.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The gesture reuses `attachLongPress` rather than matching its numbers, so threshold, tolerance and haptic cannot drift apart. |
| D2 | Every criterion asserts `isTouchDevice(row) === true` alongside its result where the guard is what does the work. On a full-width leaf the predicate is false and the check would pass without exercising it. |
| D3 | Controls must be **discriminating**, not merely loud. Six controls, each targeting a distinct rule, and no control turns every check red. |
| D4 | Every control is applied, run, observed red, restored, and the restoration verified by SHA-256 rather than by reading the file. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

Evidence below is the `verify-placement` run captured on a clean tree at `f64dd87`: **220/224
geometry checks passed, 4 red for a declared reason**, exit 0. Every criterion that names a
measurement is green there; the two that remain are not measurements. Each check reports
`isTouchDevice(row)=true` alongside its result, per D2, so the guard is exercised rather than
sidestepped.

- [x] A tap on a row checkbox leaves exactly 2 rows selected after two presses. Was 7.
      **Met.** `a tap on a row checkbox selects only that row` — pressing rows 2 and 8 selected
      2 row(s): note-2.md,note-8.md (want 2). pointerType=touch isTouchDevice(row)=true
      innerWidth=390.
- [x] A mouse click leaves 2, in a narrow pane where the predicate still reads `true`. Was 7 at
      `innerWidth=1440`.
      **Met.** `a mouse click on a row checkbox selects only that row, however narrow the pane` —
      pressing rows 2 and 8 selected 2 row(s): note-2.md,note-8.md (want 2). pointerType=mouse
      isTouchDevice(row)=true innerWidth=1440 — the check requires the predicate to be true, or it
      would pass on a wide pane for a reason it is not testing.
- [x] A held press extends: 7 rows, exactly 1 extension, exactly 1 haptic. Was 1 row, 0, 0.
      **Met.** `a held press on a second row checkbox extends the selection to it` — holding row 8
      for 520ms after tapping row 2 selected 7 row(s) and fired 1 extension(s) and 1 haptic(s)
      (want 7 rows, 1 extension, 1 haptic). pointerType=touch isTouchDevice(row)=true
      innerWidth=390.
- [x] The click a completed hold releases does **not** undo the range it painted. Was 6 rows — the
      range painted and then lost its own last row, which is the difference between a gesture and a
      flicker and is invisible to any check that stops measuring when the timer fires.
      **Met.** `the click a completed hold releases does not undo the range it painted` — lifting
      after a 520ms press left 7 row(s) selected: note-2.md through note-8.md.
      pointerType=touch isTouchDevice(row)=true innerWidth=390.
- [x] A slow **mouse** click still toggles, because no hold completed to swallow it. This and the
      criterion above have opposite right answers for the same release, and **neither is safe
      alone**: a swallow keyed to "a long press happened" rather than "a hold fired" satisfies one and
      silently breaks every slow mouse click on desktop.
      **Met.** `a slow mouse click still toggles, because no hold completed to swallow it` — lifting
      after a 520ms press left 2 row(s) selected: note-2.md,note-8.md. pointerType=mouse
      isTouchDevice(row)=true innerWidth=1440. The opposite answer for the same release is the row
      above, and both are in the one run.
- [x] A 300ms press fires 0 extensions against the shipped 450ms threshold. Without a real threshold,
      "held" is just another word for "touch" — the defect wearing a new name.
      **Met.** `a press released before the hold threshold selects one row, not a range` — a 300ms
      press fired 0 extension(s) against the shipped 450ms threshold, and released to 2 row(s):
      note-2.md,note-8.md. Asserted on both pages: touch at innerWidth=390 and mouse at
      innerWidth=1440.
- [x] A held mouse press never extends, however the pane measures. Was 7 rows, 1 extension, 1 haptic.
      **Met.** `a held mouse press never extends, however the pane measures` — holding row 8 for
      520ms after tapping row 2 selected 1 row(s) (note-2.md) and fired 0 extension(s) and
      0 haptic(s) (want 1 row, 0, 0). pointerType=mouse isTouchDevice(row)=true innerWidth=1440.
- [x] Shift-click still extends, asserted on the **phone** page too: a rule keyed to the pointer could
      have taken shift-click from a device that reports touch, and no desktop check would have
      noticed.
      **Met.** `a shift-click on a row checkbox still extends the selection`, run twice —
      shift-clicking row 8 after row 2 selected 7 row(s) (want 7, rows 2 through 8) at
      pointerType=touch isTouchDevice(row)=true innerWidth=390, and again at pointerType=mouse
      isTouchDevice(row)=true innerWidth=1440.
- [x] A hold on the checkbox and a hold on the row body are one gesture with two answers: 1/0/1 and
      0/1/1. Was **2 haptics for one hold** — the row menu's own hold buzzing and swallowing the press
      before declining to open anything.
      **Met.** `a hold on the checkbox and a hold on the row body are one gesture with two answers` —
      on the checkbox: 1 extension(s), 0 row menu(s), 1 haptic(s); on the row body: 0 extension(s),
      1 row menu(s), 1 haptic(s). Want 1/0/1 and 0/1/1. pointerType=touch isTouchDevice(row)=true
      innerWidth=390. The mouse page reads 0/0/0 and 0/0/0 on the same pair, which is the other half.
- [ ] The status-bar announcement decision is answered.
      **Operator.** Not a measurement: whether the hold should announce itself is a design decision
      and no check can take it. If the answer is yes, the check that would then settle the
      implementation is — on the touch page at 390px, hold a second row checkbox for 520ms after
      tapping one, and assert the selection bar's own count text equals the number of rows the
      extension painted (7) within one animation frame of the extension firing, with the hold that
      fires no extension leaving the text unchanged.
- [ ] The operator taps a row checkbox on their phone and one row is selected.
      **Operator.** `Input.dispatchTouchEvent` enters where a thumb enters and respects hit-testing
      and `touch-action`, but it is one clean finger. Only the device closes this.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**95%: 12 checks added, six negative controls run and restored by hash.**

### Why the haptic is counted

It is the gesture's only outward signal. A hold that buzzes twice is two gestures wearing one
costume, and no selection assertion can see it. Counting it is also what proves the row menu still
answers — the phone's only route to several row actions — rather than having been quietly displaced.

### The controls are discriminating, which is a separate claim from being loud

NC1 left the hold checks green, NC6 left the hold checks green, and NC5 left the desktop checks
green. A control that turns everything red proves the harness can fail, not that any one criterion is
connected to its own rule.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Predicate removed from both views | Shipped, verified | AC-1, AC-2 |
| Hold gesture added | Shipped, verified | AC-3, AC-6, AC-9 |
| Release semantics | Shipped, verified | AC-4 and AC-5, opposite answers for one release |
| Desktop unchanged | Verified | AC-8 on both pages |
| Six negative controls | Run, observed, restored by hash | Two file hashes recorded in the criteria |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| Three reds in the harness are not this phase's | They arrived mid-session with arrays added by the concurrent stylesheet lane and measure painted CSS geometry only. They fail identically with this phase's code fully restored, which is the measurement that separates them. Two are `018`'s subject |
| Those three reds have since closed | The captured `f64dd87` run measures all three green: `the switch control gives a finger at least 28px` (painted 34x18, reachable 34x28), and both `reorder button and the row checkbox do not overlap` arms — no reorder button in 11 desktop select cells, narrowest gap 4px in a 65px cell on the phone. The disclaimer was right about ownership and is now also spent |
| `017` has a numeric successor it does not reference | Adding `018` took `PHASE_LINKS` from 14 issues to 17. The fix is a line in this phase's chain blockquote |
<!-- /ANCHOR:log -->
