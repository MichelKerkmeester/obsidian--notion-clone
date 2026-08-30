# Acceptance Criteria: Desktop Select Checkbox Placement

Each criterion carries a number with a threshold, was demonstrated failing on the unfixed tree with
the failing number recorded, and is measured on the real stylesheet at the production mount point.

## AC-1 — the checkbox keeps clearance from the edge that clips it

**Threshold.** Narrowest left clearance across every select cell >= 4px, with the cell still
declaring `overflow: hidden`.

**Failing first.** With the pin guarded, measured **0px across 25 cells**, all 25 clipping. Zero
clearance inside a clipping box is the shear in the operator's screenshot.

**After.** 18px across 25 cells.

**Check.** `the select checkbox keeps clearance from the cell edge that clips it`, in
`tools/storybook/verify-placement.mjs`.

**Negative control.** Re-guarding the rule takes the check to `FAIL … narrowest left clearance 0px`
and the run to exit 1, 78/80. Restoring returns it to 79/80 exit 0. Run and observed, both ways.

## AC-2 — the fixture still resembles what production builds

**Threshold.** Every select checkbox measured carries the shared checkbox component's class.

**Result.** 25/25.

**Why this criterion exists.** AC-1's geometry is only meaningful if the thing being measured is the
thing production renders. The defect was caused *by* that class being present, so a fixture that
stopped carrying it would turn AC-1 green while the product stayed broken. This is the check that
makes the other one honest.

**Check.** `the select column's checkbox is the shared owned control`.

## AC-3 — the header and the rows land on the same column

**Threshold.** Right clearance takes exactly one distinct value across the header cell and every row
cell.

**Failing first.** Before the fix the value was uniform at 25px but the boxes were flush left; the
inner containers measured 32px in the header against 33px in the rows, so the two were not
coincident.

**After.** One value, 7px, header and all 24 rows.

**Why.** The original rationale for pinning out of flow was that a row with a drag handle and a row
without one otherwise resolve a pixel apart, so the checkbox jumps when sorting removes the handle.
That property is what this asserts.

**Check.** `the header checkbox and the row checkboxes land on the same column`.

## AC-4 — the phone does not move

**Threshold.** Phone clearances identical before and after.

**Result.** 26px left / 7px right, unchanged. The phone arm had already been de-guarded on its own;
the new unguarded rule merely restates it, and the phone arm still wins on specificity and order.

**Method.** The same probe run twice with `is-mobile is-phone` on the body.

## AC-5 — appearance keeps exactly one owner

**Threshold.** No border, fill, or checkmark declaration is reintroduced into the select-column
block.

**Result.** The edit adds `position` and `right` only. Appearance stays with the shared component,
which is what the checkbox-ownership work established and what this repair must not undo.

## AC-6 — the lane records the edit

**Threshold.** `node tools/lane/check-lane.mjs` exits 0 with the stylesheet matching the recorded
baseline, and the history carries an acquire, an edit with a stated reason, and a release.

**Result.** Recorded; baseline moved `e53819a117ba` -> `b4dc64bb4e72`; exit 0.

## Not done here, deliberately

The select-column appearance block, and the equivalent modal and CSV-option blocks, are still
guarded against the shared component's class and are therefore dead code. Nothing is visibly missing
because the component supplies all of it, but three dead blocks remain and the next reader will
believe they are live. Removing them moves captures and is a separate reviewable change; it is
recorded in the lane's outstanding list rather than folded in here.
