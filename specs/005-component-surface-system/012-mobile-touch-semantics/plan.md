---
title: "Implementation Plan: Mobile Touch Semantics in the Table"
description: "The approach that was taken: read the gesture off the event rather than off the device, put one decision in one place, and escalate the row-height shortfall instead of gating on a number CSS cannot reach."
trigger_phrases:
  - "012 touch semantics plan"
  - "pointerType not device predicate"
  - "row height escalated"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Mobile Touch Semantics in the Table

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work shipped before the plan was written.

A press meant two different things depending on what pressed it, and the code could not tell. A
finger inherited the desktop pointer grammar: the previous anchor was preserved on every touch press,
which is shift-click with no way to not hold shift, so a second tap anywhere painted the rectangle
between the two.

The repair reads the gesture off the event rather than off the device, gives a tap on the row's main
item the record sheet and a tap on any other cell its editor, and puts the decision in one module
both table hosts call.

**One of this phase's asks could not be met and was escalated rather than quietly dropped.** No table
row on a phone reaches the 44px thumb floor at any density, and that is a reader's preference rather
than a defect.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Observed |
|---|---|
| Phase gate | **FAIL — exit 1, 12 of 13 green.** `screenshots-fresh` red for another phase's unrecaptured stylesheet edit |
| Placement, at the last run | **79/80, exit 0**, same single declared red as the 69/70 baseline |
| This phase's own contribution | **seven checks added, seven green, no new red** |
| Every check demonstrated red first | **7 of 7** controls installed and observed failing |
| Capture churn | 7 PNGs moved on this phase's edits; **4 moved on a run with no source change at all** |

**AC-8 is recorded as FAIL, and the attribution does not clear it.** The threshold is exit 0 and the
observed exit is 1. All 204 stale captures are attributed to `styles.css` and **zero to any `src/`
file**; this phase made no CSS edit and never held the lane. Claiming the red would absorb another
phase's unrecaptured edit, which is exactly what this lane's own history forbids — its entry for the
sheet-reading phase records drift as "recorded rather than absorbed". So it is recorded, left with
its owner, and the gate still says FAIL.

**The placement ratio is a reading of a moment, not a fact about this phase.** It was 76/77 when the
results were first written and 79/80 after the select-checkbox phase added three checks. The durable
number is seven added and seven green.

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**No device predicate can answer the question, and the plugin already had two that tried.** They
disagree, and they disagree *correctly*: one is about layout and the other about presentation, and
neither is about input. A mouse-driven split pane narrower than 760px measures as touch; a tablet
with a trackpad needs two different answers on one device.

**The event knows.** `pointerdown` carries `pointerType`, and the browser dispatches it on the same
target before the compatibility mouse events it synthesises. Reading it there keeps a mouse on the
pointer grammar at every width **by construction** rather than by tuning a breakpoint.

**Both selection owners now share one module.** There are two pointer owners, not three — the table
renderer binds no cell selection. Each had carried its own copy of the branch, and the branch is what
drifted: two files had independently decided that touch means shift is held. A shared
`table-cell-gesture` module means the next divergence is impossible rather than merely unlikely.

**Main-item-ness is decided by visible column order**, so a tap opens the record sheet on the right
cell even when the note-name column is hidden.

**The sheet's grab band was stopped at its own header.** The record sheet pads its top by four times
what the menu sheets use, so its handle sits 24px down and a band centred on it ran from 2px to 50px
while the header starts at 32px. The measured consequence was that the band answered every press
aimed at the title, and both 44px header actions delivered 26px — and because the title's rename opens
on a double-click, the second tap never reached it. That is why renaming *looked* as though
tap-to-open had removed it.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

**Step 1 — inventory before designing.** Establish what actually paints the range, how many pointer
owners exist, what a tap already does, and whether the record sheet is already reachable.

**Step 2 — move the decision onto the event** and into one shared module both hosts call.

**Step 3 — give the title cell the record sheet**, keyed on visible column order rather than on a
column name.

**Step 4 — repair the sheet's grab band** so it stops at the sheet's own header instead of stealing
the title and the header actions.

**Step 5 — attempt the thumb floor, and report the attempt honestly.** A downward negative-inset
pseudo-element was tried and reverted byte-identically; see §7.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

**Every check was watched failing before it was trusted.** Seven controls were installed and seven
reds observed: the reader hardcoded to `"touch"`; the old always-extend branch restored; the range
function forced to collapse; the resolver forced to one answer; the long-press delay raised to
5000ms; the scrim's pointer capture switched off.

**The checks route real events rather than a reproduction.** AC-3 takes four values from one binding
— at rest, after touch, after mouse, after pen — because a reader that is merely *called* with the
right argument proves nothing about what the browser dispatches.

**One criterion is recorded UNVERIFIED rather than assumed.** AC-6b — that a tap opening an editor
does not scroll the table — is not measurable without a live Obsidian `App`. It is listed with that
reason instead of being quietly dropped or optimistically passed.

**An overclaim in this phase's own evidence was corrected rather than left.** The AC-1 control was
described as reproducing the operator's screenshot "exactly". It does not: the control produces 8
rows by 2 columns and 16 cells, while the screenshot measures 7 by 2 and 14 cells. The difference is
where the fingers landed, not what the code did with them — the defect was never "the block is N rows
tall", it was "a second tap keeps the anchor and extends". The direction of the fix is unaffected,
and the word "exactly" was the only thing wrong.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`003-mobile-sheet-presentation` built the sheet and its scrim, which AC-6 asserts this phase does not
fight.

`011-mobile-menu-presentation` is the sibling argument one layer up: a phone needs its own
presentation for surfaces, and this is the same argument for input.

**This phase deliberately left a defect for a successor.** Row-checkbox range selection carries the
identical "touch means shift" mistake on a different control. It was out of scope — the operator
reported cells, the screenshot shows every row checkbox unticked, and removing it would have left a
phone with no way to range-select rows at all. It was recorded so the next phase would not have to
rediscover it, and `017-touch-row-range-selection` is that phase.

The stylesheet lane was held for the grab-band edit only. One block was added; removing it returns
the stylesheet byte for byte.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

The TypeScript changes revert as a unit and return the table to the device-predicate branch, which
restores the reported defect. The stylesheet change is one block whose removal is byte-exact.

**Two items are not rollback candidates because they were never shipped or never claimed.**

**The thumb-target expansion was tried and reverted, byte-identically.** A downward negative-inset
pseudo-element to lift the 169×34 main-item cell to 44px is a measured no-op for two independent
reasons: the cell clips its overflow, so the pseudo-element is cut back to the cell box and the last
row gained 0px; and in a contiguous table the next row's area begins exactly where this one's box
ends, so there are no dead pixels to reclaim. It was reverted rather than shipped, because **a rule
that measures as a no-op advertises a fix that is not there.** It was replaced by a check that
measures the reach and asserts the property that *is* achievable — no press lands on the wrong row.

**The row height itself is a declined criterion, not an unmet one.** The default density is 34px and
the loosest is 40px, so even the loosest leaves a row 4px short of WCAG 2.5.5. The number is
confirmed three independent ways: the stylesheet's own density values, the operator's screenshot at a
row pitch of 102 device pixels at DPR 3, and the harness rendering the title cell at 169×34 on every
run. **The operator was shown the shortfall and chose density**, because raising it would override a
preference the reader deliberately set. WCAG 2.5.8's 24px AA floor is met; 2.5.5's 44px AAA target is
not, and the harness reports the 33px reach on every run so the number stays visible rather than being
closed by silence.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md) · [`../design-system.md`](../design-system.md)
- [`../017-touch-row-range-selection/spec.md`](../017-touch-row-range-selection/spec.md) — the successor this phase named
- [`../016-sheet-drag-and-audit/spec.md`](../016-sheet-drag-and-audit/spec.md) — re-measured the grab band on the shipped build
