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
    packet_pointer: "005-component-surface-system/014-desktop-select-checkbox"
    last_updated_at: "2026-09-02T08:00:00Z"
    last_updated_by: "goal-audit"
    recent_action: "Stale gate lane count corrected; derived completion re-checked"
    next_safe_action: "The operator opens the table on desktop and sees a whole checkbox"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-014-goal"
      parent_session_id: null
    completion_pct: 86
    open_questions:
      - "Delete the three dead :not(shared-checkbox) blocks, given they are capture-affecting"
      - "Assert border-color as a fifth appearance property, which is what makes AC-5's control discharging"
    answered_questions:
      - "Not a fixture artifact: production calls the factory that stamps the excluded class"
      - "The header/row inner-container coincidence clause is red on correct code and blind to the defect, so it is recorded rather than built"
      - "The phone pair is 32px left / 5px right, not the unreproducible 26/7 recorded before"
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
- [x] ~~Right clearance takes exactly one distinct value across the header and every row, **and** the
      header's inner container is coincident with a row's — height delta 0px.~~
      **Rewritten, on the evidence this row already carried.** The criterion now reads: *right
      clearance takes exactly one distinct value across the header and every row, and a control
      moves it.* Met — **1 distinct value: 7px**, with `PLACEMENT_SELECT_CONTROL=reguard-desktop`
      reproducing **25px**, the figure this folder recorded independently.
      **The coincidence clause is withdrawn, for the two reasons written below it.** It fails correct
      code, and it is blind to the defect. A clause that is red on a correct tree and unchanged in
      the broken one measures neither state, and keeping it would have held this row open forever
      against an implementation that is right. The numbers it wanted are printed unasserted in the
      detail line of *the header checkbox and the row checkboxes land on the same column*, so the
      next reader sees them rather than re-deriving them.
      *The original analysis, kept because it is the argument:* The first clause reads **1 distinct right-clearance value: 7px**, and by this
      criterion's own argument it passes on the defect, so it cannot carry the criterion alone.

      **What the coincidence clause measures on a correct tree.** `.db-select-inner` resolves to
      **32px in the header, 33px in twenty-three rows, and 34px in the last row**. The 32-against-33
      pair this criterion records as the pre-fix failure is the current, shipped, correct value. An
      exact assertion is therefore red against correct code, and the criterion itself rules out
      widening the tolerance, since anything above 1px stops distinguishing the numbers it names.

      **And it cannot see the defect.** With the pin re-guarded the same three numbers come back
      unchanged — the run prints `header 32px against row values 33/34px` identically in both states.
      The spread is table-border geometry: the header's container starts 1px into its cell and the
      last row has no bottom border to give back. Neither nearby variant rescues it. The `<td>`
      heights are a uniform 34px in **both** states, and the checkbox's own vertical centre in its
      cell is 17px in the header against 16.5px in the rows in **both** states.

      **Recorded rather than built**, with the number it wanted now printed unasserted in the detail
      line of `the header checkbox and the row checkboxes land on the same column`, so the next
      reader sees it instead of re-deriving it. The horizontal clause is the one that moves: 7px
      pinned, 25px unpinned, and `PLACEMENT_SELECT_CONTROL=reguard-desktop` reproduces the 25px this
      folder recorded independently, which is what says the control models the real pre-fix cascade.

      This is another criterion in this program that would fail correct code, and another introduced
      by a specification rather than by an implementation.
- [x] The thing measured is the thing production renders: 25 of 25 select checkboxes carry the shared
      component's class. The defect was caused **by** that class being present, so a fixture that
      stopped carrying it would turn the geometry criterion green while the product stayed broken.
      `the select column's checkbox is the shared owned control` — **25/25 select checkboxes carry
      the shared component class**.
- [x] Appearance keeps exactly one owner, measured rather than asserted: a select checkbox's computed
      `appearance`, `border-width`, `border-radius` and `background-color` match a role-mate the same
      factory builds elsewhere, 0 differing properties.
      `the select checkbox and a role-mate compute one appearance` — **0 of 4 properties differ
      between the select checkbox and the db-gallery-card-checkbox role-mate**, reading
      `appearance=none borderWidth=1px borderRadius=4px backgroundColor=rgb(255, 255, 255)`.

      The table fixture holds no second family, so the gallery fixture is mounted beside it and both
      readings come out of one document — which is what makes this a comparison rather than two
      absolute assertions that can drift together and still agree. Mounting it moves nothing else:
      the three existing geometry checks print byte-identical detail lines before and after.

      **Seen red before green.** `PLACEMENT_SELECT_CONTROL=strip-mate` takes it to `FAIL 4 of 4
      properties differ … appearance none vs auto, borderWidth 1px vs 0px, borderRadius 4px vs 0px,
      backgroundColor rgb(255, 255, 255) vs rgba(0, 0, 0, 0)`, exit 1.

      The measurement is ticked. The **control** owed against it is not, and cannot be discharged in
      the form it was specified — see the controls criterion below.
- [x] The phone does not move, from a probe that is now committed and re-runnable rather than a run
      nobody can execute again. `the select checkbox keeps its clearance on a phone` — **narrowest
      left clearance 32px across 25 cells, 25 of them clipping their overflow; right clearance
      5px**. `the phone header and the phone row checkboxes land on the same column` — **1 distinct
      value: 5px across 25 cells**. A second page at 390×844 with `hasTouch` and `isMobile` and
      `is-mobile is-phone` on the body, running the same probe function as the desktop arm rather
      than a second hand-written copy. Both checks assert `body.is-phone` and `pointer: coarse`
      alongside their geometry, because a desktop rendering of that page passes both clauses and
      would otherwise be green for the wrong reason.

      **The 26px / 7px pair recorded before does not reproduce.** The re-executable pair is 32/5:
      a 65px column holding a 28px box under the coarse-pointer minimum, so 32 + 28 + 5. The old
      pair is corrected in `acceptance-criteria.md` rather than deleted, because a number quoted and
      then silently replaced is how the next reader loses the ability to tell a correction from a
      drift.

      **Both halves of the control were run.** `PLACEMENT_SELECT_CONTROL=reguard-phone` takes the
      first check to `FAIL narrowest left clearance 0px … right clearance 37px`, exit 1.
      `reguard-desktop` takes the *desktop* clearance red at 0px while both phone checks stay green
      at 32px and 5px — the invariance half, and it is now a number rather than a sentence.

      One structural warning carries over from the criterion above: under `reguard-phone` the phone
      single-value clause stays green at a uniform 37px. One distinct value is a property of a column
      whose boxes are all wrong in the same way, so on the phone too it is the left-clearance clause
      that carries the criterion.

      **The `−14px` figure that circulates near this phase is not this phase's.** It belongs to
      `018-select-column-affordance-fit` and to the reorder-button overlap check, where the correct
      control reverts two edits — the phone select column 64px → 48px and the checkbox pin
      `right: 4px` → `6px` — and reverting only the column measures `−12px`, a state that never
      shipped (`verification-audit.md` §3.2, F-1). Neither number is a measurement of this phase's
      clearances and neither belongs in this folder.
- [x] Two owed negative controls observed red. **Both now discharge, by taking the route this row
      recommended: a fifth property, one line.**

      **(a) Run, observed red, both ways.** `PLACEMENT_SELECT_CONTROL=strip-select` removes
      `db-checkbox` from exactly one select checkbox and takes `the select column's checkbox is the
      shared owned control` to `FAIL 24/25 select checkboxes carry the shared component class`, exit
      1. Unset, it returns 25/25 and exit 0.

      **(b) Was unsatisfiable against four properties, and is satisfiable against five.** The same
      control strips the class and **0 of the 4 originally named properties changed**, because the
      select column keeps its own `:not(.db-checkbox)` fallback block declaring the same
      `appearance: none`, the same 1px border, the same `--db-radius-sm` and the same fill.
      Stripping the class did not remove an owner; it woke a second one that agrees. Two agreeing
      owners are indistinguishable from one until one is taken away, and this control could not take
      the second away.

      **`borderColor` is where they disagree, and they disagree across an accessibility floor.** The
      comparison now names five properties, and the same control reports **`1 of 5 properties differ:
      borderColor rgb(221, 221, 221) vs rgb(138, 144, 153)`** — red on the appearance check, exit 1 —
      while the unarmed run reads 0 of 5 and exit 0. A checkbox border is the only thing identifying
      an unchecked control, so WCAG 1.4.11 puts it at 3:1 against its own fill. Derived from the
      measured colours against the white the same run reports: the component's `rgb(138, 144, 153)`
      is **3.22:1** and the dormant fallback's `rgb(221, 221, 221)` is **1.36:1** — the figure
      `styles.css` already records beside the inherited token this ownership work replaced.

      **Why this route and not the other two.** Deleting the three dormant blocks is D3's open
      question and moves captures. Running the control against a role-mate with no per-site fallback
      answers a different claim about a different element — measured for contrast, stripping the
      class from the gallery role-mate moves all four original properties. The fifth property was the
      one-line route, and it is the one that carries a floor rather than only a difference: without
      it the fallback is dormant rather than dead and nothing in the harness can tell.
- [ ] The operator opens the table on desktop and sees a whole checkbox.

      Operator-confirmed is the only state that closes this, per D3.
      *The recapture debt named here is discharged.* `screenshots-fresh` is green and the gate exits
      0 across 20 lanes, so the separate debt this row pointed at no longer exists. The row itself
      is untouched by that: a fresh capture is not a person seeing a whole checkbox.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Shipped and verified. The recapture debt is discharged — the `npm run gate` run that discharged it
was 16 green at exit 0, with `screenshots-fresh` among the green.** `verify-placement` moved 221/224
to 224/227, three new checks, 3 red for a declared reason, exit 0.

*Corrected 2026-09-02.* The 16 was written as the gate's size rather than as one run's, and it has
been overtaken twice: this folder's own operator row already cites 20 lanes, and `tools/gate.mjs`
declares **25** today. The figure is kept as the dated run it was and no longer reads as a standing
description of the gate. **No gate run is claimed from the current working tree, which is dirty** —
an uncommitted `styles.css` edit with its lane release and refreshed `tools/live/*.json` artefacts.

### The negative control was run both ways, and that is the part to keep

Re-guarding the rule takes the check to `FAIL … narrowest left clearance 0px` and the run to exit 1
at 78/80; restoring returns it to 79/80 and exit 0. Run and observed, both directions.

### Every control in this phase is now a named flag, not a hand edit

`PLACEMENT_SELECT_CONTROL` arms four of them — `strip-select`, `strip-mate`, `reguard-desktop`,
`reguard-phone` — following the `PLACEMENT_SECTION_CONTROL` precedent already in the file. The two
re-guarding controls append the guard the fix removed rather than reverting `styles.css`, which this
work had no authority to edit; that is a fixture mutation and is recorded as one. What says the model
is faithful rather than convenient is that it reproduces numbers this folder recorded independently
before it existed: `reguard-desktop` gives 0px left and a uniform 25px right, which is the pre-fix
pair AC-1 and AC-3 already carried.

The reason to prefer a flag over an edit is written across this folder in the other direction: the
26/7 phone pair was a hand run nobody could repeat, and it turned out to be wrong. A control that
cannot be re-run is a claim.

### Two of the four specified checks did not survive being measured first

**The coincidence clause fails correct code and is blind to the defect.** Building it as specified
would have added a permanently red check that also could not tell the two states apart. Recorded, not
built; the numbers are printed unasserted so nobody has to re-derive them.

**The appearance control moves nothing, and that is the finding.** Stripping the shared class from a
select checkbox leaves all four named properties where they were, because the select column's own
guarded block supplies the same values the moment the guard stops excluding the control. D3's "dead
code" is dormant code, and a negative control is exactly the thing that reanimates it.

Both were measured before being written. That is the whole of why this phase cost a probe and not a
red gate.

### Left undone on purpose

The select-column appearance block, and the equivalent modal and CSV-option blocks, are still guarded
against the shared component's class and are therefore dead code. Nothing is visibly missing because
the component supplies all of it, but **the next reader will believe they are live.** Recorded in the
lane's outstanding list rather than folded in here.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Clearance restored | Shipped, verified | 0px → 18px across 25 cells, control run both ways |
| Header/row coincidence | Half measured, and it stays that way | One value at 7px, moving to 25px under `reguard-desktop`; the 0px height clause is measured, red on correct code, and blind to the defect, so it is recorded rather than built |
| Fixture fidelity guard | Verified, control run | 25/25; `strip-select` takes it to 24/25 at exit 1 |
| Appearance single-owner, computed | Measured, control run | 0 of 4 differ against a `db-gallery-card-checkbox` role-mate; `strip-mate` takes it to 4 of 4 |
| Appearance single-owner, control | Discharged, on a fifth property | Unsatisfiable against the **four** named properties — `strip-select` moves 0 of them, because the column's own fallback block agrees on all four. `borderColor` is where the two owners disagree, so the comparison names five (`verify-placement.mjs:4255`) and the same control reports `1 of 5 properties differ: borderColor rgb(221, 221, 221) vs rgb(138, 144, 153)`, exit 1, against 0 of 5 unarmed |
| Phone arm | Measured, control run both ways | 32px left / 5px right; `reguard-phone` red at 0px/37px, `reguard-desktop` leaves it at 32/5 |
| Recapture | Discharged | The discharging run: `npm run gate` 16 green, exit 0, `screenshots-fresh` among them. Read as that run's size, not the gate's — `tools/gate.mjs` declares 25 lanes today, and nothing green is claimed from the current dirty tree |

### Deviations and findings

| Item | Note |
|------|------|
| AC-3's original threshold passed on the defect | Recorded rather than quietly rewritten: the single-value clause was true at 25px before the fix, and `reguard-desktop` reproduces exactly that |
| AC-3's coincidence clause fails correct code | Header 32px against rows 33px and 34px on the shipped tree, and identical with the pin re-guarded. Specified, measured, not built |
| AC-4's recorded 26/7 pair does not reproduce | The re-executable pair is 32/5. The old numbers came from a run nobody could repeat, which this folder had already named as evidence it does not accept |
| AC-5 was a source-text absence | An absence passes before anything is written and cannot distinguish a repair that respected the boundary from one that never approached it |
| AC-5's control could not discharge AC-5 against four properties | Stripping the class wakes the column's guarded fallback, which agrees on all four. Two agreeing owners, and the control cannot remove the second. **Resolved 2026-09-01 by naming a fifth rather than by removing the second owner:** `borderColor` is where they disagree, and they disagree across an accessibility floor — 3.22:1 for the component against 1.36:1 for the dormant fallback. The finding stands as written; only its "cannot" does not |
| One distinct value is not a coincidence test | On desktop and on phone alike, a column whose boxes are all wrong in the same way still reports one distinct right clearance — 25px and 37px respectively |
<!-- /ANCHOR:log -->
