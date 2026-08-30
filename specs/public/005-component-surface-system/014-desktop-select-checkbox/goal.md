---
title: "Goal: Desktop Select Checkbox Placement"
description: "What would make phase 014 worth having done, and the criteria that decide it."
trigger_phrases:
  - "014 goal"
  - "desktop select checkbox goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/014-desktop-select-checkbox"
    last_updated_at: "2026-08-30T21:15:00Z"
    last_updated_by: "criteria-adjudication"
    recent_action: "Criteria adjudicated against the captured harness run; AC-1 and AC-2 ticked"
    next_safe_action: "Run the two owed controls; add header/row height-delta and phone arms"
    blockers:
      - "Lane released without recapturing; screenshots-fresh red and the gate exits 1"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-014-goal"
      parent_session_id: null
    completion_pct: 75
    open_questions:
      - "Delete the three dead :not(shared-checkbox) blocks, given they are capture-affecting"
    answered_questions:
      - "Not a fixture artifact: production calls the factory that stamps the excluded class"
---
# Goal: Desktop Select Checkbox Placement

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The select column's checkbox keeps clearance from the cell edge that clips it, and the
header lands on the same column as every row.

It was sheared flat against the left edge of a cell that declares `overflow: hidden`. Zero clearance
inside a clipping box is the shear in the operator's screenshot.

**The cause is this program's sharpest instance of its own trap: a rule's scope is not its name.**
Every select-column rule is guarded `:not(.db-checkbox)`, which is a sound migration pattern — a
per-site block serves only the controls that have not yet moved to the shared component and switches
itself off for the ones that have. The defect is what shared that block: **appearance and
placement**. Appearance moved to the component; placement did not, and the component deliberately
does not own it. So the guard took the pin with it, and `004`'s correct migration produced this.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Appearance stays with the shared component. Only placement is restored; reintroducing border, fill or checkmark here would give one control two owners, which is the defect `004` removed. |
| D2 | The fix is the rule already in the file. The phone hit this first and was repaired on its own; this mirrors it unguarded, so the phone arm merely restates it and nothing there moves. |
| D3 | The three dead guarded blocks are **not** deleted here. They are inert, but removing them moves captures and is a separate reviewable change. |
| D4 | A negative control is run in **both** directions. One direction proves the check is loud, never that it is connected. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

Ticked criteria carry the check name and the number from the captured `verify-placement` run taken
from a clean tree at `f64dd87` — `220/224 geometry checks passed, 4 red for a declared reason`,
exit 0. Unticked criteria carry the check that would settle them, written to be implementable from
the sentence alone.

- [x] Narrowest left clearance ≥ 4px across every select cell, with the cell still declaring
      `overflow: hidden`. Was 0px across 25 cells, all 25 clipping. After: 18px.
      `the select checkbox keeps clearance from the cell edge that clips it` — **narrowest left
      clearance 18px across 25 cells, 25 of them clipping their overflow; right clearance 7px**.
      The control was run both ways, and is the one control in this phase that was: re-guarding the
      rule takes the check to `narrowest left clearance 0px` and the run to exit 1 at 78/80,
      restoring returns 79/80 at exit 0.
- [ ] Right clearance takes exactly one distinct value across the header and every row, **and** the
      header's inner container is coincident with a row's — height delta 0px. The single-value clause
      **was already satisfied on the unfixed tree** at a uniform 25px with every box flush left; only
      the coincidence clause failed, at 32px against 33px. On its own the first clause certifies the
      defect, so the criterion must carry both.

      **First clause measured, second clause measured by nothing.** `the header checkbox and the row
      checkboxes land on the same column` reads **1 distinct right-clearance value: 7px** — and by
      this criterion's own argument that clause passes on the defect, so it cannot carry the
      criterion alone. The check's source confirms the gap rather than merely leaving it unprinted:
      `tools/storybook/verify-placement.mjs:2590-2596` builds its set from `c.right - b.right` per
      cell and asserts the set size is 1. No height, and no inner container, is read anywhere in
      that section.

      **The check that would settle it:** in the same `the select column's clipping cell` section,
      measure the select cell's inner flex container — the element that actually holds the checkbox,
      not the `td` — for the header cell and for one row cell, and assert
      `|header.height − row.height| = 0px`, printing both heights in the detail line. The recorded
      failing pair is 32px against 33px, so any tolerance above 1px cannot distinguish the defect
      and the assertion has to be exact. It belongs in the same check as the column clause, so that
      a green result means both clauses held on the same run rather than on two.
- [x] The thing measured is the thing production renders: 25 of 25 select checkboxes carry the shared
      component's class. The defect was caused **by** that class being present, so a fixture that
      stopped carrying it would turn the geometry criterion green while the product stayed broken.
      `the select column's checkbox is the shared owned control` — **25/25 select checkboxes carry
      the shared component class**.
- [ ] Appearance keeps exactly one owner, measured rather than asserted: a select checkbox's computed
      `appearance`, `border-width`, `border-radius` and `background-color` match a role-mate the same
      factory builds elsewhere, 0 differing properties.

      **Two of the four properties are covered, and not in this shape.** `every checkbox the plugin
      renders computes the plugin's box, not the platform's` reads **211/211 controls across 12
      families compute `appearance: none`**, and `the row role paints one box everywhere it appears`
      reads **181 controls across 10 families take 1 distinct shape: 16x16 r=4px**. That is
      `appearance` and `border-radius`, as a set cardinality over a whole role rather than a
      comparison against a named role-mate. Neither `border-width` nor `background-color` is read at
      all: the family probe at `verify-placement.mjs:2943-2944` records only `appearance` and a
      `WxH r=radius` shape string.

      **The check that would settle it:** in the `table-view` fixture, read the four computed
      properties from a select-column checkbox and from a `db-checkbox-row` role-mate the same
      factory builds in a different family in the same document, and assert the two four-property
      sets are equal — 0 differing, with any differing property named in the detail line. Reading
      both from one document is what makes it a comparison rather than two absolute assertions that
      could drift together and still agree.
- [ ] The phone does not move: 26px left / 7px right, identical before and after, from the same probe
      run twice with `is-mobile is-phone` on the body.

      **Not in the captured run, and no probe for it is committed here.** The select-cell section
      runs on one desktop page at the harness's `VIEWPORT`
      (`tools/storybook/verify-placement.mjs:2550-2551`); it has no phone arm. The 26/7 pair
      therefore rests on a run nobody can re-execute, which is the shape of evidence this program
      already decided not to accept.

      **The check that would settle it:** a second page in the same section, `is-mobile is-phone` on
      the body at a 390×844 viewport, asserting the two clearances the desktop arm asserts — left
      ≥ 4px, and one distinct right value — and printing both, so the phone pair becomes a number in
      the run. The invariance clause needs the second half as well: with the desktop pin re-guarded,
      the phone pair must not move. That is the both-ways form AC-1's control already takes, and it
      is what distinguishes *the phone was already right* from *the desktop edit reached the phone*.

      **The `−14px` figure that circulates near this phase is not this phase's.** It belongs to
      `018-select-column-affordance-fit` and to the reorder-button overlap check, where the correct
      control reverts two edits — the phone select column 64px → 48px and the checkbox pin
      `right: 4px` → `6px` — and reverting only the column measures `−12px`, a state that never
      shipped (`verification-audit.md` §3.2, F-1). Neither number is a measurement of this phase's
      clearances and neither belongs in this folder.
- [ ] Two owed negative controls observed red: stripping the shared component's class must move at
      least one computed appearance property, and replacing one factory call with a bare
      `input[type=checkbox]` must take the class count to 24/25.

      **Both still owed.** `acceptance-criteria.md` records each as *not yet run*, under AC-2 and
      AC-5. A negative control is a mutation run, so no capture of the clean tree can contain one —
      these cannot be discharged by any harness output, only by running them.

      **The checks that would settle them**, each on the `table-view` fixture, each observed red on
      its own so that one control cannot stand in for the other:

      (a) Remove `db-checkbox` from exactly one select checkbox in the harness and assert `the select
      column's checkbox is the shared owned control` falls to **24/25** and the run exits 1. This is
      what shows the class assertion is connected to the thing it guards, which is the argument that
      check makes about the geometry check, one level up.

      (b) Strip the shared component's class from a select checkbox and assert at least one of the
      four computed appearance properties named above moves. A control that moves nothing means the
      site was measured wrong, not that it is safe: two agreeing owners are indistinguishable from
      one owner until one of them is taken away.
- [ ] The operator opens the table on desktop and sees a whole checkbox.

      Operator-confirmed is the only state that closes this, per D3. The recapture this phase owes is
      not a substitute for it — `screenshots-fresh` is red and the gate exits 1 because of it, which
      is a separate debt from this criterion.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Shipped and verified; a recapture is owed and the gate is red because of it.**

### The negative control was run both ways, and that is the part to keep

Re-guarding the rule takes the check to `FAIL … narrowest left clearance 0px` and the run to exit 1
at 78/80; restoring returns it to 79/80 and exit 0. Run and observed, both directions.

### Left undone on purpose

The select-column appearance block, and the equivalent modal and CSV-option blocks, are still guarded
against the shared component's class and are therefore dead code. Nothing is visibly missing because
the component supplies all of it, but **the next reader will believe they are live.** Recorded in the
lane's outstanding list rather than folded in here.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Clearance restored | Shipped, verified | 0px → 18px across 25 cells, control run both ways |
| Header/row coincidence | Half measured | One value at 7px; the 0px height delta is measured by nothing |
| Fixture fidelity guard | Verified | 25/25 carry the component's class |
| Appearance single-owner, computed | Not measured | Threshold strengthened; the control is owed |
| Recapture | Owed | Lane released without one; `screenshots-fresh` red |

### Deviations and findings

| Item | Note |
|------|------|
| AC-3's original threshold passed on the defect | Recorded rather than quietly rewritten: the single-value clause was true at 25px before the fix |
| AC-5 was a source-text absence | An absence passes before anything is written and cannot distinguish a repair that respected the boundary from one that never approached it |
<!-- /ANCHOR:log -->
