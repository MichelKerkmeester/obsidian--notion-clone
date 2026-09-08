---
title: "Feature Specification: Phase 3: Add-Property Sheet Redesign"
description: "Fix the property-type picker sheet's keyboard-overlap defect and redesign it against its mapped reference (R6)."
trigger_phrases:
  - "071 phase 3"
  - "add-property sheet redesign"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 3: Add-Property Sheet Redesign

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Fix the property-type picker sheet's keyboard-overlap defect and redesign it against its mapped reference (R6).

**Key Decisions**: This phase does not start until Phase 1's inventory names this sheet family's reference mapping.

**Critical Dependencies**: `001-sheet-story-coverage-audit` — its reference mapping row for this sheet family.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Draft — blocked on Phase 1 |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 3** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: Fix the property-type picker sheet's keyboard-overlap defect and redesign it against its mapped reference (R6).

**Dependencies**: `001-sheet-story-coverage-audit` must name this sheet family's reference mapping before redesign work starts.

**Deliverables**:
- Before/after capture of each sheet in this family against its mapped reference
- Redesigned layout matching that reference as closely as the plugin's own token ladder allows

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator's R6 screenshot shows the property-type picker (Select, Multi-select, Status, Formula, Relation, Rollup, Files, and the four timestamp/user types) rendering as a tall sheet that covers the note header while the keyboard is up — a layout defect distinct from any prior sheet-family fix.

### Purpose
This sheet family's layout, spacing and control styling match its mapped Notion/Anytype reference as closely as the plugin's own token ladder allows.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Fixing the keyboard-overlap defect: the sheet must not cover the note header while the keyboard is open
- Redesigning the property-type picker's list/grid layout against its mapped reference

### Out of Scope
- Any other sheet family (tracked in this packet's other phases)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Sheet source(s) for this family (named once Phase 1's inventory identifies the exact files) | Modify | Reference-driven redesign |
| `styles.css` | Modify | Layout/spacing rules for this sheet family |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read Phase 1's reference mapping for this sheet family before any redesign work starts |
| REQ-002 | Redesign this sheet family to match its mapped reference |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | Recapture every sheet in this family and record a before/after comparison |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A side-by-side capture shows each sheet in this family visually converged on its reference
- **SC-002**: No regression on any prior fix already shipped to a sheet in this family
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase 1's reference mapping | Cannot start without a named reference | Blocked explicitly until Phase 1 closes |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

Not detailed at scaffold time — blocked on Phase 1's reference mapping.

## 8. EDGE CASES

Not detailed at scaffold time, for the same reason.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Unscored | Depends on Phase 1's findings |

## 10. RISK MATRIX

Not detailed at scaffold time — see §6.

## 11. USER STORIES

- As the operator, I want this sheet family to feel like Notion/Anytype's own equivalent surface

## 12. OPEN QUESTIONS

- Which reference does Phase 1 map to this sheet family, and does the operator have a preference where Notion and Anytype disagree
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Depends on**: `../001-sheet-story-coverage-audit/`
