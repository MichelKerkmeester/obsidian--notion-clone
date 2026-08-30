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
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored; AC-3 and AC-5 thresholds strengthened, two controls now owed"
    next_safe_action: "Recapture under the lane, then run the two owed negative controls"
    blockers:
      - "Lane released without recapturing; screenshots-fresh red and the gate exits 1"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-014-goal"
      parent_session_id: null
    completion_pct: 85
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

- [ ] Narrowest left clearance ≥ 4px across every select cell, with the cell still declaring
      `overflow: hidden`. Was 0px across 25 cells, all 25 clipping. After: 18px.
- [ ] Right clearance takes exactly one distinct value across the header and every row, **and** the
      header's inner container is coincident with a row's — height delta 0px. The single-value clause
      **was already satisfied on the unfixed tree** at a uniform 25px with every box flush left; only
      the coincidence clause failed, at 32px against 33px. On its own the first clause certifies the
      defect, so the criterion must carry both.
- [ ] The thing measured is the thing production renders: 25 of 25 select checkboxes carry the shared
      component's class. The defect was caused **by** that class being present, so a fixture that
      stopped carrying it would turn the geometry criterion green while the product stayed broken.
- [ ] Appearance keeps exactly one owner, measured rather than asserted: a select checkbox's computed
      `appearance`, `border-width`, `border-radius` and `background-color` match a role-mate the same
      factory builds elsewhere, 0 differing properties.
- [ ] The phone does not move: 26px left / 7px right, identical before and after, from the same probe
      run twice with `is-mobile is-phone` on the body.
- [ ] Two owed negative controls observed red: stripping the shared component's class must move at
      least one computed appearance property, and replacing one factory call with a bare
      `input[type=checkbox]` must take the class count to 24/25.
- [ ] The operator opens the table on desktop and sees a whole checkbox.
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
| Header/row coincidence | Shipped, verified | One value at 7px across header and 24 rows |
| Fixture fidelity guard | Verified | 25/25 carry the component's class |
| Appearance single-owner, computed | Not measured | Threshold strengthened; the control is owed |
| Recapture | Owed | Lane released without one; `screenshots-fresh` red |

### Deviations and findings

| Item | Note |
|------|------|
| AC-3's original threshold passed on the defect | Recorded rather than quietly rewritten: the single-value clause was true at 25px before the fix |
| AC-5 was a source-text absence | An absence passes before anything is written and cannot distinguish a repair that respected the boundary from one that never approached it |
<!-- /ANCHOR:log -->
