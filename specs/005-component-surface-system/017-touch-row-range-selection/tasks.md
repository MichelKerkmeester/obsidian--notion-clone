---
title: "Task Breakdown: Touch Row Range Selection"
description: "The work as it was actually done: the predicate removed from both views, the range returned as a hold, and six negative controls run and restored by hash."
trigger_phrases:
  - "017 row range tasks"
  - "row range negative controls"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Touch Row Range Selection

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Written after the work was done.** Each task closes on a measured selection count, extension count
or haptic count.

**A restoration is verified by hash, not by reading.** Every negative control below was applied, run,
observed red, then restored, and the restored file's SHA-256 was compared against the recorded value.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — measure the defect on both surfaces

- [x] **T1** Reproduce the reported defect on a phone.
      *Closed on:* pressing row 2 then row 8 selected **7 rows** — `note-2 … note-8` — where 2 were
      wanted. That is the operator's report, reproduced.
- [x] **T2** Establish that this was never only a phone defect.
      *Closed on:* the same predicate is true for a mouse-driven split pane narrower than 760px. On a
      **1440px window with a 700px leaf**, a plain mouse click selected the same **7 rows**, with
      `isTouchDevice(row)=true`.
- [x] **T3** Establish why it survived the repair next to it.
      *Closed on:* the predecessor phase fixed exactly this branch for **cell** selection, in these
      same two files, and introduced the shared gesture module so the decision would live in one
      place. **The row checkbox's copy was not moved with it.** From that point the table obeyed two
      contradictory rules at once, and nothing could observe the disagreement because each rule was
      correct on its own terms in its own file. **The defect is not the predicate; it is that one
      decision had two homes.**

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

- [x] **T4** Move the rule next to the rule it contradicted.
      *Closed on:* `shouldExtendRowRange` now sits directly beside `nextCellRange` in
      `table-cell-gesture.ts`, and both views call `applyRowSelectionPress` instead of reaching for
      `applyRangeSelection` themselves. Neither view mentions the device predicate anywhere near row
      selection any more.
- [x] **T5** Replace the predicate with two named grammars rather than a narrower predicate.
      *Closed on:* `return input.shiftKey || input.heldPress`. **A modifier key needs a keyboard and a
      held press needs a finger**, so neither can be mistaken for a device.
- [x] **T6** Give touch the range back as a second gesture, not a second meaning for the first.
      *Closed on:* a held press on the row checkbox extends the selection from the anchor. Deleting
      the predicate alone would have left touch with **no way to select a range at all**, which is the
      only way to act on many rows at once. The slot was free — all four row long-press call sites
      screen out `input`, so a hold on a checkbox did nothing and could collide with nothing.
- [x] **T7** Build the gesture **on** the existing long press rather than beside it.
      *Closed on:* the 450ms threshold, the 10px movement tolerance, the touch-or-pen guard and the
      20ms haptic are **inherited by omission**. The two holds are one gesture vocabulary because they
      are one implementation, not because two numbers were tuned to agree. **No new timing constant
      was introduced.**
- [x] **T8** Swallow the click the release produces.
      *Closed on:* the extension applies when the hold completes rather than when the finger lifts, so
      the haptic and the painted rows arrive together — which leaves a click still to come from the
      release that would toggle the row straight back off.
- [x] **T9** Correct the embedded renderer's screening order.
      *Closed on:* it screened its long-press target **inside** `onLongPress`, after the timer, so a
      hold on a checkbox already buzzed and already swallowed the press before declining to open
      anything. Left alone, adding a second gesture to the checkbox would have produced **two haptics
      for one hold**. Screening moved to `ignoreTarget`, where the full table view already had it.
      **The selector list is unchanged, so the menu's behaviour is not.**

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T10** A tap on a row checkbox selects only that row — AC-1.
      *Closed on:* **7 rows to 2** (`note-2.md, note-8.md`), 0 extensions fired. Control NC1 →
      `FAIL … selected 7 row(s)`.
- [x] **T11** A mouse click selects only that row, however narrow the pane — AC-2.
      *Closed on:* **7 rows to 2** at `innerWidth=1440` with `isTouchDevice(row)=true`. The check
      asserts the predicate is true first, or it would pass on a wide pane for a reason it is not
      testing.
- [x] **T12** A held press extends the selection — AC-3.
      *Closed on:* tap row 2, hold row 8 for 520ms — **7 rows, exactly 1 extension, exactly 1
      haptic**. Before: 1 row, 0 extensions, 0 haptics, which is the capability a thumb had before
      this phase. Control NC5 → `FAIL … selected 1 row(s) … 0 extension(s) and 0 haptic(s)`.
- [x] **T13** The release does not undo the range the hold painted — AC-4.
      *Closed on:* **6 rows to 7**. Unswallowed, the release toggles row 8 straight back off — the
      range paints and then loses its own last row. **This is the difference between a gesture and a
      flicker, and it is invisible in any check that stops measuring when the timer fires.** Control
      NC3 → `FAIL … left 6 row(s) selected`.
- [x] **T14** A slow mouse click still toggles — AC-5.
      *Closed on:* a 520ms mouse press releases to **2 rows**. **AC-4 and AC-5 have opposite right
      answers for the same release.** A swallow keyed to "a long press happened" rather than "a hold
      fired" satisfies AC-4 and breaks every slow mouse click there has ever been, silently, on
      desktop. Neither criterion is safe alone. Controls NC2 and NC3 both take it red.
- [x] **T15** A press released before the threshold selects one row — AC-6.
      *Closed on:* a 300ms press fires **0 extensions** against the shipped 450ms threshold and
      releases to 2 rows, measured on both pages. Without a real threshold, **"held" is just another
      word for "touch"** — the defect this phase replaced, wearing a new name. Control NC1 → `FAIL`.
- [x] **T16** A held mouse press never extends — AC-7.
      *Closed on:* a 520ms mouse press in a leaf narrow enough that the predicate reads true fires
      **0 extensions and 0 haptics** and leaves **1 row**. Before: 7 rows, 1 extension, 1 haptic. The
      narrow pane is what forces the pointer-type guard to be the thing doing the work — on a
      full-width leaf the gesture never arms and the check would pass without exercising it. Control
      NC2 → `FAIL … 1 extension(s) and 1 haptic(s)`.
- [x] **T17** Shift-click still extends, on both pages — AC-8.
      *Closed on:* **2 rows to 7 on both pages.** Measured on the phone too, because a rule keyed to
      the pointer could plausibly have taken shift-click away from a device that reports touch, and no
      desktop check would have noticed. Control NC6 → `FAIL … selected 2 row(s) — want 7` on both.
- [x] **T18** The two holds are one gesture with two answers — AC-9.
      *Closed on:* checkbox **1 extension, 0 row menus, 1 haptic**; row body **0 / 1 / 1**; mouse page
      **0 / 0 / 0** for both. Before: **2 haptics for one hold on the checkbox**. The haptic is counted
      because it is the gesture's only outward signal — a hold that buzzes twice is two gestures
      wearing one costume, and no selection assertion can see it. Control NC4 → `FAIL … 2 haptic(s)`.
- [x] **T19** Run six negative controls, each on a distinct rule, and restore by hash.
      *Closed on:* **no control turned every check red** — that is what makes them discriminating
      rather than a global switch. NC1 and NC6 left the hold checks green; NC5 left the desktop checks
      green. Every control was applied, run, observed red, then restored, and the restoration
      **verified by SHA-256** rather than by reading the file.
- [x] **T20** Separate this phase's results from the concurrent lane's.
      *Closed on:* the 12 checks added here were green in **every** run taken after the change,
      including runs where the whole harness exited 1. The three reds present measure painted CSS
      geometry and **fail identically with this phase's code fully restored**. Two runs minutes apart
      on the same tree differ only in those three, which is the cleanest evidence of ownership.
- [ ] **T21** Decide whether the gesture gets an affordance.
      *Open, and a design decision rather than a defect.* The hold has no painted hint and no
      announcement anywhere. The selection status bar renders as soon as one row is selected, which is
      exactly when a range becomes possible, so the slot exists if the operator wants it.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- The predicate is gone from both views and the decision has one home.
- Touch keeps the ability to select a range, through a gesture rather than a reinterpreted tap.
- Nine criteria, each with a failing-first number and a control that targets its own rule.
- The row menu still answers on the phone, proved by counting haptics rather than selections.
- Six controls run, observed red, and restored with the restoration verified by hash.

**Open, and named:** the gesture has no affordance, which is an operator decision. Three harness reds
belong to the concurrent stylesheet lane and are demonstrated not to be this phase's. No operator
confirmation on a device.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../012-mobile-touch-semantics/spec.md`](../012-mobile-touch-semantics/spec.md)
- [`../018-select-column-affordance-fit/spec.md`](../018-select-column-affordance-fit/spec.md)

<!-- /ANCHOR:cross-refs -->
