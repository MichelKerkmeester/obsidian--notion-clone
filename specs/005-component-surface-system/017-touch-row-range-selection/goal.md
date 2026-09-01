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
    packet_pointer: "005-component-surface-system/017-touch-row-range-selection"
    last_updated_at: "2026-08-31T09:00:00Z"
    last_updated_by: "harness-dependence-review"
    recent_action: "AC-9 tick withdrawn: its row-menu term is a counter, not a menu being shown"
    next_safe_action: "Drive RowMenu in the AC-9 check instead of counting onLongPress calls"
    blockers:
      - "AC-9 counts handler calls where production shows a menu; the editFileName shape"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-017-goal"
      parent_session_id: null
    completion_pct: 73
    open_questions:
      - "Does the hold gesture get an announcement in the selection status bar"
      - "Would a real thumb reach the checkbox; synthetic dispatch skips hit-testing"
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

Evidence below is the `verify-placement` run on the tree these ticks were taken on: **365/366
geometry checks passed, 1 red for a declared reason**, exit 0. The earlier figure here was
**220/224 at `f64dd87`**; the lane has grown since and the count moves with it, which is why the
number is restated rather than carried. Every criterion that names a measurement is green; the one
that remains is not a measurement. Each check reports `isTouchDevice(row)=true` alongside its
result, per D2, so the guard is exercised rather than sidestepped.

**Read against "if this value came from the device, could the check still fail?", eight of the nine
hold and one does not.** The decision logic under test is genuinely the shipped code —
`applyRowSelectionPress`, `attachRowRangeGesture`, `attachLongPress` and `isTouchDevice` are bundled
from `src/`, and the swallow that AC-4 and AC-5 turn on is the real `onClickCapture` at
`table-cell-gesture.ts:233`, not a copy of it. Six negative controls, each restored and confirmed by
SHA-256, show the checks moving for their own reason and not as a bank of switches. AC-9's row-menu
term is the exception and is withdrawn below: it is a counting stub where production shows a menu.

**Two residuals apply to all nine and neither is a reason to withdraw a tick.** They are recorded so
the next reader does not have to re-derive them.

*The row is hand-built and the adapter around it is a mirror.* The checks assemble a `<table>` by
hand and wire the shipped modules to a local `Set`. That mirror was compared against production
line by line and **matches**: `database-view.ts:8156` passes
`onExtendRange: () => setRowSelection(row, true, { shiftKey: false, heldPress: true })` and `:4475`
passes `heldPress: false` from a click, which is exactly what the harness's adapter passes; the
`ignoreTarget` closure is the same predicate; and `createCheckbox({ role: "row" })` produces the bare
`input.db-checkbox-row[type=checkbox]` that `isRowSelectionCheckbox` matches, with no wrapper to
intercept the press. So these are not green over a present defect. They are blind to a future one:
regress `setupRowInteractions` alone and every check here stays green, the same cost phase 015
records for its transcriptions.

*The gestures are synthetic.* `new PointerEvent` dispatched at the element skips hit-testing, so an
overlay or a `touch-action` that would stop a real thumb is invisible. Phase 016 drives CDP touch
and does not have this gap; this phase does.

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
      **The withdrawn term is restored, by doing what this row said would settle it.** The check no
      longer counts calls. The long-press handler now builds the shipped `RowMenu` with the same
      three arguments production hands it — the event, the row, the row element — and the menu term
      counts menus that are in the document, carry entries, and are placed. On the checkbox: 1
      extension, 0 row menus, 1 haptic. On the row body: 0 extensions, 1 row menu, 1 haptic, and
      that one menu reads *in the document with 4 entries, placed=true, as the phone sheet,
      390x222 at 0,622*. pointerType=touch isTouchDevice(row)=true innerWidth=390. The mouse page
      still reads 0/0/0 and 0/0/0.

      **The control the counter could not have failed.** Making `RowMenu.show` return before it
      builds anything leaves the hold reaching the handler exactly as before — the haptic still
      fires, so the gesture is intact — and the row goes red on `no menu was built`. The old
      `menuCount += 1` would have counted 1 there and passed. Restoration of both control edits
      verified by SHA-256 against `HEAD`, matching.

      **A second control changed the answer without breaking it, which is the finding.** Forcing the
      phone off the sheet path left the menu built and placed as an anchored popover under the row,
      and the check stayed green — correctly, because both presentations are legitimate placements.
      It is recorded because it is the control that did *not* discriminate, and the first version of
      the placement rule was wrong for the same reason it exists: that rule demanded an anchored
      popover, and the driven menu failed it at `0,622` spanning the full 390px width. That was not
      a misplacement. `owned-menu.ts:165` discards the anchor on a phone on purpose. A counter could
      not have been wrong about this, because it never knew what a menu looked like — the rule now
      reads the presentation and holds each to its own contract.

      **The pre-fix number still comes from a surface this check does not run.** The **2 haptics**
      came from the embedded renderer screening its target after the timer; the check pairs two
      harness-attached `attachLongPress` instances instead, so it reproduces the *shape* of that
      defect rather than the site of it. That gap is unchanged and is the honest limit of this row.
- [x] The status-bar announcement decision is answered.
      **Answered yes, and the answer was already in the tree.** The row was written as an operator
      design call, but the code had taken it long before this phase asked: the selection count badge
      carried `aria-live="polite"` and `aria-atomic="true"`. So the decision needed no operator — it
      needed checking, and the check found the stated intent could not fire.

      **The mechanism contradicted the attribute.** A live region announces a change made *inside a
      region that was already there when the change happened*. `renderSelectionStatusBar` empties
      and rebuilds the bar on every selection change, so the badge holding the attribute is a brand
      new element each time — there is no before for the after to differ from, and a screen reader
      gets nothing. The attribute made the intent legible in the source and the structure made it
      inert, which is the failure mode a review that greps for `aria-live` is least able to see.

      **What shipped:** a persistent `db-selection-live-region` created on the container, outside the
      bar, before the rebuild, updated by text on each render and removed when the selection clears.
      Both count badges gave up their own `aria-live`. The region is hidden by `clip-path: inset(50%)`
      at 1x1 rather than by `display: none` or `visibility: hidden`, because both of those take the
      node out of the accessibility tree and the announcement with it.

      **Evidence, and the formulation that discriminates.** Three rows in `verify-placement` drive
      two real renders at counts 2 and 3 through the shipped method and compare the announcing
      *node* across them. Under the pre-fix shape restored as a control, the text moved correctly —
      `"2 selected" -> "3 selected"` — while the node identity went `false`. A check that compared
      only the text would have passed against the defect. A second control that parented the region
      inside the bar left zero announcing nodes, so it fails all three rows without ever exercising
      the identity clause, and is the weaker of the two.

      **Still the operator's:** the wording. Whether `"3 selected"` is the right thing to hear on a
      hold — rather than something naming the range or the gesture — is a judgement no check takes,
      and this one ships the count the bar already displays.
- [ ] The operator taps a row checkbox on their phone and one row is selected.
      **Operator.** This sentence used to read "`Input.dispatchTouchEvent` enters where a thumb
      enters and respects hit-testing and `touch-action`, but it is one clean finger" — which is
      true of phase 016 and **false here**. These checks use `el.dispatchEvent(new PointerEvent(…))`
      (`verify-placement.mjs:2878`), which is aimed at the element and therefore skips hit-testing
      entirely: it cannot notice an overlay, a `pointer-events` rule or a `touch-action` that would
      stop a real thumb reaching the checkbox. So the gap to the device is wider than the sentence
      claimed, and only the device closes it.
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
