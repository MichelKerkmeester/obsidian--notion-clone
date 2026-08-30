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

**Negative control.** Not yet run. Replacing one of the 25 factory calls with a bare
`input[type=checkbox]` in the harness must take the count to 24/25 and this check red. Until it has
been observed red, the check that makes AC-1 honest has not itself been shown to be connected —
which is the same argument AC-2 makes about AC-1, one level up.

## AC-3 — the header and the rows land on the same column

**Threshold.** Two clauses, both required. Right clearance takes exactly one distinct value across
the header cell and every row cell, **and** the header's inner container and a row's are coincident —
height delta 0px.

**Failing first.** The first clause **was already satisfied on the unfixed tree**: the value was
uniform at 25px with every box flush left. Only the second failed, at 32px in the header against
33px in the rows. The single-value clause alone is therefore a criterion that passes before a line is
written, and it is recorded here as one — it is kept because it is what regresses if the pin is ever
re-guarded, and it is paired because on its own it certifies the defect.

**After.** One value, 7px, across the header and all 24 rows, with the inner containers coincident.

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

**Threshold.** Two clauses. In the source, no border, fill or checkmark declaration is reintroduced
into the select-column block. In the browser, a select checkbox's computed `appearance`,
`border-width`, `border-radius` and `background-color` are identical to a role-mate the same factory
builds elsewhere — set equality, 0 differing properties.

**Why the second clause.** The first is an absence in a file, and an absence passes before anything
is written. It cannot distinguish a repair that respected the boundary from a repair that never
approached it, and it goes stale the moment appearance is reintroduced from a *different* block. The
computed comparison is the one that can fail.

**Result.** The edit adds `position` and `right` only. Appearance stays with the shared component,
which is what the checkbox-ownership work established and what this repair must not undo. The
computed set-equality clause is **not yet measured**.

**Negative control.** Not yet run. Stripping the shared component's class from the select checkbox in
the harness must move at least one of the four computed properties — that is what proves the
component is the sole owner rather than one of two agreeing owners. A control that moves nothing
means the site was measured wrong, not that it is safe.

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
