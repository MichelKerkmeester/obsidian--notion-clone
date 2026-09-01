---
title: "Feature Specification: Desktop Select Checkbox Placement"
description: "Restore the select-column checkbox pin on desktop, lost when the shared checkbox component took ownership of appearance and the fallback guard switched off placement with it."
trigger_phrases:
  - "desktop select checkbox"
  - "checkbox cut off"
  - "select column checkbox"
  - "checkbox clipped table"
  - "014 select checkbox"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/014-desktop-select-checkbox"
    last_updated_at: "2026-08-30T21:15:00Z"
    last_updated_by: "criteria-adjudication"
    recent_action: "The coincidence clause withdrawn on its own evidence; clearance carries the row"
    next_safe_action: "The operator opens the table on desktop and sees a whole checkbox"
    blockers:
      - "Owed: this phase edited the stylesheet and released without recapturing, so screenshots-fresh is red and the gate exits 1. Deferred deliberately, not forgotten: the lane is held by a phase whose own CSS edits are still pending, so one recapture should cover both."
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "device-desktop-checkbox-clipped.png"
      - "../../../../styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-014"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "Should the three dead :not(shared-checkbox) blocks be deleted, given they are capture-affecting?"
    answered_questions:
      - "Not a fixture artifact: production calls the shared checkbox factory, which stamps the very class the guard excludes."
      - "The repair already existed for the phone and was never mirrored to desktop."
---
# Feature Specification: Desktop Select Checkbox Placement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md). Related: `004-checkbox-ownership`, which moved
> checkbox appearance onto a shared component. This phase repairs what that move left behind.

<!-- ANCHOR:problem -->
## 1. THE REPORT

The operator, with a desktop screenshot: *"checkbox is being cut off on desktop."*
`device-desktop-checkbox-clipped.png` shows the table's select column with every checkbox sheared
against the left edge of its cell.

## 2. THE CAUSE, measured

`createCheckbox` stamps `db-checkbox` and `db-checkbox-<role>` onto the input it builds, and the
table's select column builds its checkbox through that factory for both the header and every row.

Every select-column rule in the stylesheet is guarded `:not(.db-checkbox)`. That guard is a sound
migration pattern — it lets a per-site block serve only the controls that have not yet moved to the
shared component, and switch itself off for the ones that have. The defect is what shared the block:
appearance **and** placement. Appearance moved to the component. Placement did not, and the
component deliberately does not own it. So the guard took the pin with it.

Left unpinned, the checkbox falls into the flex container at its left edge, inside a cell that
declares `overflow: hidden`.

Measured on the real renderer at 1440x900, all 25 cells including the header:

| | before | after |
| --- | --- | --- |
| computed `position` | `relative` | `absolute` |
| clearance from the clipping left edge | **0px** | 18px |
| clearance from the right edge | 25px | 7px |
| header vs row box | inner heights 32 / 33 | exactly coincident |

Zero clearance inside a clipping box is the shear in the screenshot.
<!-- /ANCHOR:problem -->

## 3. WHY THE FIX IS THE ONE ALREADY IN THE FILE

The phone hit this first and was repaired on its own, with a rule that de-guards the pin and keeps
the size guarded. Its comment states the rule directly: the pin applies to every checkbox in this
cell. That repair was never mirrored to desktop. This phase mirrors it, unguarded, so it holds at
every width — the phone arm then merely restates it and nothing there moves.

<!-- ANCHOR:scope -->
## 4. CONSTRAINTS

- **Appearance stays with the shared component.** Only placement is restored. Re-introducing border,
  fill or checkmark here would give one control two owners, which is the defect `004` removed.
- **The phone must not move.** It is already correct; measure it before and after.
- **Do not delete the dead blocks in this phase.** They are inert, but removing them changes captures
  and is a separate, reviewable change. Recorded in the lane's outstanding list.
- Comment hygiene: no spec paths, phase numbers or task ids in the stylesheet.
<!-- /ANCHOR:scope -->

<!-- ANCHOR:success-criteria -->
## 5. ACCEPTANCE CRITERIA

See [`acceptance-criteria.md`](acceptance-criteria.md).
<!-- /ANCHOR:success-criteria -->
