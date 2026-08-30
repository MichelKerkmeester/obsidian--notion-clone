---
title: "Acceptance Criteria: Select Column Affordance Fit"
description: "Numbered criteria for the select column's two controls, each with a threshold and the negative number it was measured at before the change."
trigger_phrases:
  - "018 acceptance criteria"
  - "reorder overlap criteria"
  - "select column width criteria"
importance_tier: "critical"
contextType: "planning"
---
# Acceptance Criteria: Select Column Affordance Fit

Every criterion carries a threshold and the value measured **before** the change.

**Provenance of the before-numbers.** They are copied from `tools/lane/css-lane.json`, history entry
64, written by the phase that held the stylesheet lane when the edit landed. **They were not
reproduced by this phase**, because this phase was opened after the fact and must not take a lane
another phase holds. Each row below is marked accordingly, and no row may be marked Met on a
recorded number alone — this program has already shipped a release on numbers nobody re-ran.

**Harness.** `tools/storybook/verify-placement.mjs`. The check is
`on <id> the reorder button and the row checkbox do not overlap`, built from `overlapResults`
(`:2392`, emitted at `:2421`).

---

## AC-1 — the two controls do not overlap

**Threshold.** The measured gap between the reorder button's right edge and the checkbox's left edge
is `>= 0` on every surface that renders both.

**Failing first.** Phone: **−14px in a 49px cell**. Desktop: **−17px**.

**Recorded after.** Phone: **+4px in a 65px cell**. Desktop: no button rendered at all, which is what
production does — the table builds it only on touch.

**State.** Recorded, not reproduced. Settled by re-running the harness and pasting the two numbers.

**Negative control.** Not yet run. Restoring the `display` declaration to the touch-floor block must
take this check red on the desktop surfaces; restoring the 48px column must take it red on the phone.
Until both have been observed red, this check has not been shown to be connected.

## AC-2 — the reorder button renders only where production builds it

**Threshold.** Zero reorder buttons present in a rendered desktop list or gallery row.

**Failing first.** Present and unstyled in every desktop list and gallery row, because a touch-floor
block declared `display: inline-flex` at the same specificity as, and later in the file than, the
`display: none` written for the non-phone case.

**Recorded after.** `display` removed from the floor block; the floor itself kept.

**State.** Recorded, not reproduced.

**Why this is a criterion and not a footnote.** A minimum-size rule decided visibility. That is the
same class of defect as the duplicate `.db-mobile-reorder-controls` pair recorded in
`002-properties-panel` — two declarations of equal weight where the later one silently wins. A check
on the gap alone would have gone green the moment the desktop button disappeared, without anyone
establishing why it disappeared.

## AC-3 — the column width is derived from what the controls paint

**Threshold.** Column width equals the sum of the painted control boxes and their insets, re-measured
rather than read from a comment.

**Failing first.** 48px, from a comment recording `48 = button 24 + checkbox 16 + gap 8`. Both
controls had since grown to 28px for the touch floor. Two 28px controls do not fit in 48px at any
gap.

**Recorded after.** `4 + 28 + 4 + 28 = 64`, matched in the touch branch, with the phone pin taken
from 6px to 4px and the phone button declared at the 28px it had been painting all along.

**State.** Recorded, not reproduced.

**The trap this criterion names.** The stale comment was not wrong when written. It stopped being
true when a different phase raised the control sizes for an unrelated reason, and nothing recomputed
the sum. A criterion that reads the comment would still pass today.

## AC-4 — the operator confirms on device

**Threshold.** The operator opens the table on the phone and reports that the button has room.

**State.** Not requested.

**Why it is separate from AC-1.** AC-1 is a number in a headless browser. This program exists because
a release passed every check and changed nothing the operator could see, so a positive gap is
necessary and never sufficient. Operator confirmation is the program's closing condition
(`../spec.md` §7).

---

## Coverage

| Criterion | Producer | Mount | Environment | Negative control | State |
|---|---|---|---|---|---|
| AC-1 | `verify-placement.mjs` overlap check | production select cell | desktop + phone | not yet run | Recorded |
| AC-2 | the same check, presence arm | desktop list and gallery rows | desktop | not yet run | Recorded |
| AC-3 | column width read from the computed style | production select column | phone touch branch | not yet run | Recorded |
| AC-4 | the operator | the operator's phone | device | n/a | Not requested |

Four rows, four blank negative-control cells. Under `../spec.md` §6 a blank cell blocks closure even
when the number in it would have been valid, so **this phase may not close today**.
