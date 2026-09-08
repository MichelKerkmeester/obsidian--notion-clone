---
title: "Feature Specification: Phase 4: View Config Sheet Redesign"
description: "Redesign the view-config sheet (title field, title format, column visibility and other per-view settings) against its mapped reference."
trigger_phrases:
  - "071 phase 4"
  - "view config sheet redesign"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 4: View Config Sheet Redesign

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Redesign the view-config sheet (title field, title format, column visibility and other per-view settings) against its mapped reference.

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

This is **Phase 4** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: Redesign the view-config sheet (title field, title format, column visibility and other per-view settings) against its mapped reference.

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
The view-config sheet carries the title field/title format controls 058 shipped and the column-visibility controls 045 shipped, built incrementally rather than against a single reference layout.

### Purpose
This sheet family's layout, spacing and control styling match its mapped Notion/Anytype reference as closely as the plugin's own token ladder allows.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The view-config sheet's full layout: title field/format row, column settings, and any other per-view control it hosts

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
