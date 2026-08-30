---
title: "Feature Specification: Select Column Affordance Fit"
description: "Give the row checkbox and the touch reorder button a column wide enough to hold both, and stop a phone-only control from rendering unstyled on the desktop."
trigger_phrases:
  - "reorder button overlaps checkbox"
  - "select column too narrow"
  - "not enough space next to checkbox"
  - "move button desktop list"
  - "018 select column"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/018-select-column-affordance-fit"
    last_updated_at: "2026-08-30T10:40:00Z"
    last_updated_by: "roadmap-reconciliation"
    recent_action: "Phase opened retroactively for an operator report whose fix shipped with no owning spec"
    next_safe_action: "Re-run verify-placement and record the after-numbers against the red baselines below"
    blockers:
      - "The stylesheet edit landed under 004-checkbox-ownership's lane hold; that phase is live and this phase must not take the lane"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../tools/lane/css-lane.json"
      - "../../../../tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-018"
      parent_session_id: null
    completion_pct: 85
    open_questions:
      - "Does a 64px select column survive the operator's density setting, or does it need the touch branch only"
    answered_questions:
      - "Was this 004's work? 004 held the lane and named it at acquire, but none of AC-001..AC-013 measures column geometry, so no criterion covered it"
---
# Feature Specification: Select Column Affordance Fit

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `017-touch-row-range-selection`,
> successor `019-card-field-value-formatting`. Related: `004-checkbox-ownership` held the stylesheet
> lane when this fix landed and named it at acquire; its acceptance criteria never covered it.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-30 |
| **Branch** | `main` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The operator, on a phone: *"to the left of checkbox that little button doesnt have enough space."*

The two controls in the table's select column overlap. Measured before the change, from
`tools/lane/css-lane.json` history entry 64: the gap between the reorder button and the row
checkbox was **−14px in a 49px cell on a phone**, and **−17px on the desktop** — where the button
should not have been rendering at all.

Two independent faults produce that single symptom.

**Fault one — a phone-only control rendering off a phone.** Three rules competed for the move
button. A touch-floor block opened with `display: inline-flex`, at the same specificity as the
`display: none` written for the non-phone case and appearing later in the file. A rule whose job was
minimum *size* therefore decided *visibility*, and a control the table only builds on touch was
painted, unstyled, into every desktop list and gallery row.

**Fault two — a column width that stopped tracking its contents.** The column's own comment recorded
its derivation: `48 = button 24 + checkbox 16 + gap 8`. Both controls were later grown to 28px to
clear the touch floor. The column stayed at 48. Two 28px controls cannot fit in 48px at any gap, so
no amount of padding tuning could have resolved this — the arithmetic had to be redone.

### Purpose

The select column is wide enough to hold both affordances with real clearance, and the reorder
button renders only where production builds it.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The `display` declaration that a touch-floor block asserted over the reorder button.
- The select column width, re-derived from the sizes the controls actually paint.
- The phone pin inset for the checkbox inside the wider column.
- A check that fails when the two controls overlap.

### Out of Scope

- Checkbox appearance and ownership — `004-checkbox-ownership` owns that and is live.
- The switch hit target, also raised under 004's lane hold in the same session.
- Row height. The operator settled it at 34px; density outranks the 44px floor, and the 44px target
  is unreachable from CSS anyway. See [`../roadmap.md`](../roadmap.md) §6A.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `styles.css` | Modify | The touch-floor block's `display`; the select column width; the phone checkbox pin |
| `tools/storybook/verify-placement.mjs` | Modify | The overlap check that measures the gap between the two controls |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | The reorder button and the row checkbox do not overlap on any surface that renders both | AC-1 |
| REQ-002 | The reorder button renders only where production builds it | AC-2 |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | The column width is derived from the painted control sizes, not from a stale comment | AC-3 |
| REQ-004 | The operator confirms on device that the button has room | AC-4 |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The measured gap between the two controls is positive on every surface that renders
  both, replacing a measured −14px.
- **SC-002**: A check exists that goes red when the gap returns to negative, and it has been
  observed red.
- **SC-003**: The operator confirms the fix on device. This program's closing condition is operator
  confirmation, never a green check.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | The `styles.css` lane | This phase cannot take the lane; `004-checkbox-ownership` holds it and the edit already landed under that hold | Record the edit here; do not re-take the lane to re-apply it |
| Risk | Widening the column moves every table capture | Med | The change is inside the touch branch; the desktop column is unchanged, and no button renders there |
| Risk | The overlap check was added to the shared harness by the lane holder, not by this phase | Med | Its provenance is recorded in `017-touch-row-range-selection/acceptance-criteria.md`; re-run and record the number here rather than inheriting the claim |
| Risk | This phase was opened after the fact | High | Every number below is copied from the lane journal with its source named, and each is marked as recorded-not-reproduced until re-run |
<!-- /ANCHOR:risks -->

---

## 7. WHY THIS PHASE EXISTS AT ALL

This report was fixed without a spec. That is the failure mode this program was created to stop, so
the omission is recorded rather than quietly closed.

The edit landed under `004-checkbox-ownership`'s stylesheet lane hold. That phase's acquire note
names the work — *"the reorder button overlapping the row checkbox"* — so it was not done in
secret. But `004`'s thirteen acceptance criteria, AC-001 through AC-013, all measure checkbox
appearance, ownership and hit geometry. **None of them measures the select column.** A phase's lane
hold is permission to edit the file; it is not a scope grant.

`017-touch-row-range-selection` reached the same conclusion from the other side. Its
`acceptance-criteria.md` records the two overlap checks as *"not this phase's"*, arriving mid-session
from "the concurrent stylesheet lane". Both neighbours disclaim it, correctly, and until this folder
existed nothing claimed it.

---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Roadmap**: [`../roadmap.md`](../roadmap.md)
- **Predecessor**: `017-touch-row-range-selection`
- **Successor**: `019-card-field-value-formatting`
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)
