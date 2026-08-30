---
title: "Implementation Plan: Desktop Select Checkbox Placement"
description: "The approach that was taken to restore the select-column pin on desktop: mirror the phone's existing de-guarded rule unguarded, keep appearance with the shared component, and prove the repair with a two-way negative control."
trigger_phrases:
  - "014 select checkbox plan"
  - "desktop checkbox pin"
  - "select column clearance"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Desktop Select Checkbox Placement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work described here shipped before the plan was
written, so every gate below carries the number it actually returned rather than a threshold it was
expected to meet. It is written down because the reasoning was load-bearing and lived only in a lane
note and a commit message.

One rule was changed. The select-column pin was de-guarded so it applies to every checkbox in the
cell, mirroring a repair the phone arm had already received and that was never carried across to
desktop.

The whole of the approach was a single decision: **mirror the fix that already existed rather than
write a new one.** The phone had hit this defect first, been repaired with a rule that de-guards the
pin while keeping the size guarded, and that repair had a comment stating the rule directly. Writing
a second, differently-shaped desktop fix would have produced two rules to keep in agreement.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Each row carries the result that was observed, not a target.

| Gate | Command | Observed |
|---|---|---|
| Placement harness | `node tools/storybook/verify-placement.mjs` | **79/80, exit 0** |
| Negative control, re-guarded | same, with the guard restored | **78/80, exit 1** — `FAIL … narrowest left clearance 0px` |
| Negative control, restored | same, guard removed again | **79/80, exit 0** |
| Lane discipline | `node tools/lane/check-lane.mjs` | **exit 0**; baseline `e53819a117ba` → `b4dc64bb4e72` |
| Phone unchanged | same probe with `is-mobile is-phone` on the body | 26px left / 7px right, **identical before and after** |

**The negative control was run in both directions.** Re-guarding the rule took the check red and the
run to exit 1; restoring it returned both. A check that has only ever been green is not evidence that
it can go red, and this program has already shipped one harness that could not.

**One gate is owed and is not claimed here.** `screenshots-fresh` is red: this phase edited the
stylesheet and released the lane without recapturing. That is recorded rather than discharged — see
§7 and the phase's continuity blockers.

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**The defect was in a migration guard, not in a coordinate.** Every select-column rule was written
`:not(.db-checkbox)`, which is a sound pattern for a migration: a per-site block serves the controls
that have not yet moved to the shared component and switches itself off for the ones that have.

What made it a defect is what shared the guarded block. It held **appearance and placement
together**. Appearance moved to the shared component; placement did not, and the component
deliberately does not own it. So a guard written to retire appearance silently retired the pin as
well, and every checkbox the factory touched lost its position.

The consequence was geometric and total: unpinned, the input falls into the flex container at the
left edge of a cell that declares `overflow: hidden`. Measured at 1440×900 across all 25 cells
including the header, clearance from the clipping edge was **0px on every one**. Zero clearance
inside a clipping box is the shear the operator photographed.

**The fix restores placement only.** The edit adds `position` and `right` and nothing else.
Re-introducing border, fill or checkmark here would hand one control two owners, which is precisely
the defect the checkbox-ownership work removed.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Three steps, in the order they were taken. `tasks.md` carries them with their closing evidence.

**Step 1 — establish that the cause was production and not the fixture.** This program had already
spent hours on a defect that existed only in hand-written fixture markup, so the first question was
whether production actually routes through the shared factory. It does: `createCheckbox` stamps
`db-checkbox` and `db-checkbox-<role>` on the input, and the select column builds through that
factory for the header and every row. The guard therefore matches in production, and the defect is
real.

**Step 2 — mirror the phone's rule, unguarded.** Applied at every width rather than behind a desktop
query, so the phone arm merely restates it and nothing there moves.

**Step 3 — verify, then try to break it.** Three checks were added to the placement harness, and the
guard was put back to watch each one go red before being removed again.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Three checks in `tools/storybook/verify-placement.mjs`, and the second exists to keep the first
honest.

`the select checkbox keeps clearance from the cell edge that clips it` measures the narrowest left
clearance across every select cell and requires the cell still to declare `overflow: hidden`. On its
own it is forgeable: the defect was *caused by* the shared component's class being present, so a
fixture that quietly stopped carrying that class would turn the geometry green while the product
stayed broken.

`the select column's checkbox is the shared owned control` closes that hole by asserting all 25
measured checkboxes carry the component's class. It is the check that makes the other one mean
something.

`the header checkbox and the row checkboxes land on the same column` asserts the property the
out-of-flow pin existed for in the first place: a row with a drag handle and a row without one
otherwise resolve a pixel apart, so the checkbox jumps when sorting removes the handle.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`004-checkbox-ownership` is the upstream cause rather than a blocker: it moved appearance to the
shared component and left the guard behind. This phase does not modify that component and must not.

The serialized `styles.css` lane was acquired for the edit and released. The lane journal records the
acquire, the edit with its stated reason, and the release, with the baseline moving `e53819a117ba` →
`b4dc64bb4e72`.

**No dependency on a device.** The defect and its repair are both desktop geometry, measurable in the
harness. The phone arm is a regression surface here, not a target.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

One block was added to `styles.css`. Removing it returns the stylesheet to `e53819a117ba` and the
harness to 78/80 — which is the pre-fix state, and is the same operation the negative control already
performed twice.

Two items are deliberately left open rather than folded into a revert:

- **The recapture is owed.** The lane was released without one, so `screenshots-fresh` is red and the
  release gate exits 1 at 12/13. This was deferred on the coordinator's instruction because the lane
  passed to a phase with its own pending stylesheet edits, and one recapture covers both. It is a
  debt with a named discharge, not an oversight.
- **Three dead blocks remain.** The select-column appearance block, and the equivalent modal and
  CSV-option blocks, are still guarded against the shared component's class and are therefore
  unreachable. Nothing is visibly missing, because the component supplies all of it — but the next
  reader will believe they are live. Deleting them moves captures, so it is a separate reviewable
  change and is recorded in the lane's outstanding list.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../004-checkbox-ownership/spec.md`](../004-checkbox-ownership/spec.md) — moved appearance to the shared component
- [`../018-select-column-affordance-fit/spec.md`](../018-select-column-affordance-fit/spec.md) — owns the column's width, which this phase does not
