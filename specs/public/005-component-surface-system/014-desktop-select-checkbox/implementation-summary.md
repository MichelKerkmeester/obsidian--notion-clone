---
title: "Implementation Summary: Desktop Select Checkbox Placement"
description: "The select-column checkbox is pinned again on desktop. One rule, mirrored from the phone arm, with a two-way negative control and one recapture still owed."
trigger_phrases:
  - "014 select checkbox summary"
  - "desktop checkbox clipped fixed"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/014-desktop-select-checkbox"
    last_updated_at: "2026-08-30T09:10:00Z"
    last_updated_by: "orchestrator"
    recent_action: "Pin de-guarded; 3 checks added; negative control run both ways"
    next_safe_action: "Recapture once the lane frees, then rerun the gate"
    blockers:
      - "screenshots-fresh red: lane released without recapture; gate exits 1 at 12/13"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-014"
      parent_session_id: null
    completion_pct: 57
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 014-desktop-select-checkbox |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Shipped and verified in the harness. Not operator-confirmed. One recapture owed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The table's select-column checkbox is pinned to its column again on desktop. Before this change every
checkbox in that column, header and rows alike, sat flush against the left wall of a cell that clips
its overflow and was sheared in half — which is the defect the operator photographed.

The repair is one stylesheet rule, and it is deliberately not a new one. The phone had already hit
this and already carried a rule that de-guards the pin while keeping the size guarded. That rule was
never mirrored to desktop. This change applies it unguarded, so it holds at every width and the phone
arm simply restates it.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `styles.css` | Modified | De-guards the select-column pin so it applies to every checkbox in the cell, at every width |
| `tools/storybook/verify-placement.mjs` | Modified | Adds three checks: edge clearance, shared-control identity, header-to-row alignment |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The cause was confirmed in production before anything was edited. `createCheckbox` stamps
`db-checkbox` and `db-checkbox-<role>` on the input, and the select column builds through that
factory for the header and every row, so the `:not(.db-checkbox)` guard genuinely matches what ships.
That check exists because this program has previously spent hours on a defect that lived only in
hand-written fixture markup.

The failing state was then measured on the real renderer at 1440×900 across all 25 cells, the rule
was mirrored, and the same probe was re-run. The edit was taken under the serialized `styles.css`
lane and released with its reason recorded; the lane baseline moved from `e53819a117ba` to
`b4dc64bb4e72` and `check-lane.mjs` exits 0.

The repair was then attacked rather than admired. Re-guarding the rule drove the placement harness to
exit 1 at 78/80 with `FAIL … narrowest left clearance 0px`; removing the guard again returned it to
exit 0 at 79/80. Both directions were observed.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Mirror the phone's existing rule instead of authoring a desktop fix | Two differently-shaped rules for one property drift apart. The phone's rule already carried a comment stating the intent, so reusing it leaves one rule to maintain |
| Apply the pin unguarded at every width rather than behind a desktop query | The phone arm wins on specificity and order regardless, so an unguarded rule changes nothing there while covering every width by construction. Measured: phone clearances identical before and after |
| Restore placement only; leave appearance with the shared component | Reintroducing border, fill or checkmark would give one control two owners, which is the exact defect the checkbox-ownership work removed |
| Add a second check asserting the measured control carries the component's class | The geometry check is forgeable. The defect was caused *by* that class being present, so a fixture that stopped carrying it would go green while the product stayed broken |
| Do not delete the three dead guarded blocks | They are inert but capture-affecting. Removing them is a separate reviewable change, recorded in the lane's outstanding list |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Every row was observed. No row is inferred.

| Check | Result |
|---|---|
| AC-1 edge clearance, 25 select cells | **PASS.** Narrowest left clearance was 0px on all 25 cells, all clipping; it is now 18px on all 25. Threshold ≥ 4px |
| AC-1 negative control, guard restored | **Observed red.** `FAIL … narrowest left clearance 0px`, exit 1 at 78/80 |
| AC-1 negative control, guard removed again | **Observed green.** Exit 0 at 79/80 |
| AC-2 shared-control identity | **PASS.** 25 of 25 carry the shared component's class |
| AC-3 header and rows on one column | **PASS.** Right clearance takes one distinct value, 7px, across the header and all 24 rows. Previously the value was uniform at 25px but the boxes were flush left, with inner containers measuring 32px in the header against 33px in the rows |
| AC-4 phone unchanged | **PASS.** 26px left, 7px right, identical across two runs with `is-mobile is-phone` on the body |
| AC-5 one appearance owner | **PASS**, by reading the diff. The edit adds `position` and `right` only. No harness measures the absence of a declaration |
| AC-6 lane discipline | **PASS.** `check-lane.mjs` exits 0; acquire, reasoned edit and release all recorded |
| `screenshots-fresh` | **RED, owed.** See limitations |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No human has looked at a picture of this.** Every result above is a number from the placement
   harness. The operator's report was about visible shape, and the phase is not operator-confirmed.

2. **The recapture is owed and the release gate is red.** This phase edited the stylesheet and
   released the lane without recapturing, so `screenshots-fresh` fails and the gate exits 1 at 12/13.
   It was deferred on the coordinator's instruction because the lane passed to a phase with its own
   pending stylesheet edits and one recapture covers both. The discharge is named; it has not
   happened.

3. **Three dead blocks remain.** The select-column appearance block and the equivalent modal and
   CSV-option blocks are still guarded against the shared component's class and are unreachable.
   Nothing is visibly missing because the component supplies all of it, but the next reader will
   believe they are live.

4. **The column's width is not this phase's.** The reorder button overlapping the checkbox is
   `018-select-column-affordance-fit`. This phase measures clearance inside the column, not the
   column's fit.

<!-- /ANCHOR:limitations -->
