---
title: "Task Breakdown: Desktop Select Checkbox Placement"
description: "The work as it was actually done, each task closed with the number or command output that closed it, and the one item still owed left open."
trigger_phrases:
  - "014 select checkbox tasks"
  - "desktop checkbox pin evidence"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Desktop Select Checkbox Placement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**These tasks were written after the work was done.** They record what was actually performed, and
each closes on a number that was read or a command whose output and exit status were read. A task
that closed on inspection alone says so.

**An owed item stays open.** The recapture this phase deferred is `[ ]`, not `[x]` with an excuse.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — establish the cause is real

- [x] **T1** Confirm the defect is in production rather than in the fixture.
      *Closed on:* `createCheckbox` stamps `db-checkbox` and `db-checkbox-<role>` on the input it
      builds, and the select column routes through that factory for the header and every row. The
      `:not(.db-checkbox)` guard therefore matches in production. Read in source; this program has
      lost hours to a fixture-only defect before, which is why this is a task and not an assumption.
- [x] **T2** Measure the failing state on the real renderer at 1440×900, all 25 cells.
      *Closed on:* computed `position` `relative`; **clearance from the clipping left edge 0px on all
      25 cells, all 25 clipping**; right clearance 25px; header and row inner boxes 32px vs 33px, so
      not coincident.
- [x] **T3** Establish why the guard removed placement when it was written to retire appearance.
      *Closed on:* the guarded block held appearance **and** placement together. Appearance moved to
      the shared component; placement did not, and the component does not own it. Recorded in
      `plan.md` §3 because the guard pattern itself is sound and will be used again.

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION — mirror the repair that already existed

- [x] **T4** De-guard the pin so it applies to every checkbox in the select cell, at every width.
      *Closed on:* the edit adds `position` and `right` only. Mirrors the phone arm's existing rule
      rather than introducing a second, differently-shaped desktop fix.
- [x] **T5** Keep appearance with the shared component — AC-5.
      *Closed on:* no border, fill or checkmark declaration is reintroduced into the select-column
      block. Verified by reading the diff, not by running a check: this is a property of what the
      edit does **not** contain, which no harness measures.
- [x] **T6** Record the edit in the stylesheet lane — AC-6.
      *Closed on:* `node tools/lane/check-lane.mjs` exits 0; history carries an acquire, an edit with
      a stated reason and a release; baseline `e53819a117ba` → `b4dc64bb4e72`.
- [x] **T7** Replace the non-English comment block with one carrying the same rationale.
      *Closed on:* comment hygiene holds — the replacement names the reason the pin exists, and no
      spec path, phase number or task id appears in the stylesheet.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION — and an attempt to break it

- [x] **T8** Assert clearance from the clipping edge — AC-1.
      *Closed on:* threshold ≥ 4px with the cell still declaring `overflow: hidden`. **0px across 25
      cells → 18px across 25.** Check: `the select checkbox keeps clearance from the cell edge that
      clips it`.
- [x] **T9** Guard the guard: assert the measured control is the one production builds — AC-2.
      *Closed on:* **25/25** carry the shared component's class. Check: `the select column's checkbox
      is the shared owned control`. This exists because AC-1's geometry is forgeable by a fixture
      that stops carrying the class — the defect was caused *by* that class being present.
- [x] **T10** Assert header and rows land on the same column — AC-3.
      *Closed on:* right clearance takes exactly one distinct value, **7px across the header and all
      24 rows**. Before: uniform at 25px but boxes flush left, inner containers 32px header vs 33px
      rows. Check: `the header checkbox and the row checkboxes land on the same column`.
- [x] **T11** Run the negative control in both directions.
      *Closed on:* re-guarding the rule → `FAIL … narrowest left clearance 0px`, exit 1 at 78/80.
      Restoring → exit 0 at 79/80. **Both observed, not reasoned about.**
- [x] **T12** Confirm the phone did not move — AC-4.
      *Closed on:* 26px left / 7px right, identical before and after, same probe run twice with
      `is-mobile is-phone` on the body. The phone arm still wins on specificity and order, so the new
      unguarded rule merely restates it.
- [ ] **T13** Recapture the screenshots and return the release gate to green.
      *Blocked, deliberately:* the lane passed to a phase with its own pending stylesheet edits, and
      one recapture covers both. `screenshots-fresh` is red and the gate exits 1 at 12/13 until this
      closes. Tracked in this phase's continuity blockers and in the parent roadmap's recapture debt.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- AC-1 through AC-6 each carry a number, and AC-1's was demonstrated failing before it went green.
- The negative control was observed red **and** returned to green — both runs, not one.
- The phone's clearances are unchanged, measured rather than assumed.
- Appearance keeps exactly one owner; the edit adds placement properties only.
- The lane journal carries the acquire, the reasoned edit and the release.

**Not complete, and named:** the recapture (T13) and the three dead guarded blocks the phase
deliberately did not delete. The phase is at 85% for exactly these reasons, and the percentage is not
rounded up to make the record tidy.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../004-checkbox-ownership/spec.md`](../004-checkbox-ownership/spec.md)
- [`../018-select-column-affordance-fit/spec.md`](../018-select-column-affordance-fit/spec.md)

<!-- /ANCHOR:cross-refs -->
