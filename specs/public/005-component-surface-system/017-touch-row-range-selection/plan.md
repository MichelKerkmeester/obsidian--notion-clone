---
title: "Implementation Plan: Touch Row Range Selection"
description: "The approach that was taken: move the rule next to the rule it contradicted, replace a device predicate with two named grammars, and give touch back the range as a gesture rather than a second meaning for a tap."
trigger_phrases:
  - "017 row range plan"
  - "hold gesture row checkbox"
  - "two grammars not a predicate"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Touch Row Range Selection

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work shipped before the plan was written.

A tap on a row checkbox did not select that row. It selected everything between that row and the last
one touched, every time, on every touch device — because the range predicate read
`event?.shiftKey || isTouchDevice(...)`. That is shift held down with no way to let go.

**It was never only a phone defect.** The same predicate is true for a mouse-driven split pane
narrower than 760px, so on a 1440px desktop window with a 700px leaf a plain mouse click selected the
same seven rows.

The repair does two things that had to happen together: it removes the predicate, and it gives touch
a *second gesture* rather than a second meaning for the first one. Removing the predicate alone would
have left touch with no way to select a range at all, which is the only way to act on many rows at
once.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Run | Placement harness | Exit |
|---|---|---|
| Baseline, session start | 87/88, 1 declared red | 0 |
| This phase applied, before the tree moved | 99/100, 1 declared red | 0 |
| Current tree, best observed | 108/109, 1 declared red | 0 |
| Current tree, typical | 105/109, 1 declared red, 3 red in the stylesheet lane | 1 |

**The 12 checks added here were green in every run taken after the change** — including the runs where
the whole harness exited 1 — and green in both halves of all six negative controls except the one
control each was written to catch.

**The last two rows are the same tree minutes apart.** The stylesheet lane is editing `styles.css`
live, so its three geometry checks flip between runs and one run caught a moment when they all
passed. That oscillation is itself the cleanest evidence of ownership: nothing in this phase changed
between those two runs. The three reds measure painted CSS geometry — a 34×18 switch against a 28px
floor, and a −17px/−14px gap between two controls in the select cell — and **they fail identically with
this phase's code fully restored**, which is the measurement that separates them.

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**The defect is not the predicate; the defect is that one decision had two homes.** The sibling phase
had fixed exactly this branch for *cell* selection in these same two files and introduced a shared
gesture module so the decision would live in one place. The row checkbox's copy was not moved with
it. From that point the table obeyed two contradictory rules at once — a cell press read the pointer,
a row press read the device — and **nothing could observe the disagreement, because each rule was
correct on its own terms in its own file.**

That is the argument for where the fix goes, not just what it is. `shouldExtendRowRange` now sits
directly beside `nextCellRange`, and both views call `applyRowSelectionPress` instead of reaching for
the range function themselves.

**What replaces the predicate is not a narrower predicate.** It is two named grammars, neither of
which a device can be mistaken for:

```ts
return input.shiftKey || input.heldPress;
```

A modifier key needs a keyboard, and a held press needs a finger.

**The gesture is built on the existing long press rather than beside it.** The 450ms threshold, the
10px movement tolerance, the touch-or-pen guard and the 20ms haptic are not re-specified — they are
**inherited by omission**, so the two holds are one gesture vocabulary because they are one
implementation, not because two numbers were tuned to agree. No new timing constant was introduced.

**The two holds on one row are separated by target, not by timing.** The row menu ignores presses
that land on a control, and the range gesture ignores presses that do not land on the checkbox, so
they cannot both fire.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

**Step 1 — measure the defect on both surfaces**, including the desktop half that was never a phone
defect.

**Step 2 — move the rule beside the rule it contradicted**, and route both views through one entry
point.

**Step 3 — give touch the range back as a hold**, built on the existing gesture object.

**Step 4 — swallow the click the release produces**, because the extension applies when the hold
completes rather than when the finger lifts.

**Step 5 — correct the embedded renderer's screening order**, which was required to keep the row menu
from buzzing twice.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Twelve checks, six on each of two pages, driving the shipped gesture module with real `PointerEvent`s
and letting it mutate a real selection set through the function both views call. Only the four-line
view adapter is reproduced, in the same shape and the same listener order.

**The second page is the load-bearing one.** It is a 1440px desktop window with a 700px leaf, so the
device predicate reports **true** while the pointer says mouse. Every check on it asserts the
predicate is true before trusting its own result, or it would be passing on a wide pane for a reason
it is not testing.

**Six negative controls, each targeting a distinct rule, and none of them a global switch.** That
distinction is what makes them discriminating: the control that restores the old predicate left the
hold checks green, and the control that removes the gesture left the desktop checks green. Each
control was applied, run, observed red, then restored — **and the restoration was verified by SHA-256
rather than by reading the file.**

**Two criteria have opposite right answers for the same release, and neither is safe alone.** AC-4
requires that the click a completed hold releases does not undo the range it painted; AC-5 requires
that a slow mouse click still toggles. A swallow keyed to "a long press happened" rather than "a hold
fired" satisfies the first and silently breaks every slow mouse click on desktop.

**The haptic is counted, not just the selection.** It is the gesture's only outward signal, and a
hold that buzzes twice is two gestures wearing one costume — invisible to any selection assertion.
Counting it is also what proves the row menu still answers rather than having been quietly displaced.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`012-mobile-touch-semantics` is the direct predecessor: it repaired the identical defect for cell
selection, created the shared gesture module this phase extends, and **explicitly recorded the row
checkbox's copy as out of scope so this phase would not have to rediscover it.** Until now the two
halves of the same table disagreed.

`attachLongPress` is the dependency this phase deliberately does not modify. It supplies every timing
and guard by inheritance.

**No stylesheet was needed.** The gesture adds no painted affordance — which is the open question in
§7. `styles.css` and the card renderers were held by another lane throughout and were not edited.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Three source files and the harness. Reverting restores the predicate and with it the operator's
reported defect on every touch device and on any narrow mouse-driven pane.

**The revert is not symmetric.** Removing the hold gesture alone would leave touch unable to select a
range at all, which is a capability regression rather than a return to the previous state. The two
halves were shipped together and must be reverted together.

**One question is open and is a design decision, not a defect.** The hold gesture has no affordance
anywhere — no painted hint, and no announcement. Whether the selection status bar should carry a
one-line hint the first time a row is selected on touch is the operator's call. The status bar
renders as soon as one row is selected, which is exactly when a range becomes possible, so the slot
exists if it is wanted.

**Three harness reds are present and are not this phase's.** They arrived mid-session with arrays
added by the concurrent stylesheet lane and measure painted CSS geometry only. They fail identically
with this phase's code fully restored.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../012-mobile-touch-semantics/spec.md`](../012-mobile-touch-semantics/spec.md) — the predecessor that named this defect
- [`../018-select-column-affordance-fit/spec.md`](../018-select-column-affordance-fit/spec.md) — owns the select column's geometry, which this phase disclaims
