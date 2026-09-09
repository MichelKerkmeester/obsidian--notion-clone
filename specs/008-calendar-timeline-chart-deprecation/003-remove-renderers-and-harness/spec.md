---
title: "Feature Specification: Phase 3: Remove Renderers and Harness"
description: "Remove the calendar, timeline and chart renderers and their harness lanes from the shipped bundle, archive the code, and record the archival as an ADR."
trigger_phrases:
  - "008 phase 3"
  - "remove renderers and harness"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 3: Remove Renderers and Harness

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Remove the calendar, timeline and chart renderers and their harness lanes from the shipped bundle, archive the code, and record the archival as an ADR.

**Key Decisions**: This phase does not start until Phase 1's audit closes.

**Critical Dependencies**: `001-usage-and-migration-audit`.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Implemented |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `008-calendar-timeline-chart-deprecation` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 3** of the Calendar, timeline and chart view deprecation specification.

**Scope Boundary**: Remove the calendar, timeline and chart renderers and their harness lanes from the shipped bundle, archive the code, and record the archival as an ADR.

**Dependencies**: `001-usage-and-migration-audit` must close before this phase starts.

**Deliverables**:
- See requirements below.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Once no surface can open a calendar, timeline or chart view (Phase 2), the renderer code and its harness lanes are dead weight in the shipped bundle; removing them without a restore path would make date/renderer-parity work harder to resurrect later if ever needed.

### Purpose
Remove the calendar, timeline and chart renderers and their harness lanes from the shipped bundle, archive the code, and record the archival as an ADR.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Removing the calendar, timeline and chart renderer source files from the build
- Removing their harness lanes (`tools/live/*` scenarios, `render-assertions.mjs` entries) for those renderers
- Archiving the removed code under `archive/deprecated-views/<view>/`, excluded from the build, with a README naming the last-live SHA and the restore procedure
- Recording the archival as an ADR in this phase's `decision-record.md`
- Coherently removing the calendar/timeline/chart branches of `teardownOutgoingViewRenderer` in `src/views/database-view.ts` once no renderer needs tearing down

### Out of Scope
- Any work assigned to this packet's other phases

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Named once Phase 1's audit and this phase's own investigation identify the exact files | TBD | See requirements |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Renderer source files for calendar, timeline and chart removed from the bundle and moved to `archive/deprecated-views/<view>/` |
| REQ-002 | Harness lanes for the three renderers removed; `npm run gate` still exits 0 |
| REQ-003 | `archive/deprecated-views/<view>/README.md` names the last-live SHA and the restore procedure, per view |
| REQ-004 | The archival decision is recorded as an ADR |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Every requirement above is met with evidence, not inferred
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase 1's audit | Cannot start without knowing what a live vault holds | Blocked explicitly until Phase 1 closes |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

Not detailed at scaffold time — blocked on Phase 1's audit.

## 8. EDGE CASES

Not detailed at scaffold time, for the same reason.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Unscored | Depends on Phase 1's findings |

## 10. RISK MATRIX

Not detailed at scaffold time — see §6.

## 11. USER STORIES

- As the operator, I want my existing views handled gracefully and the removed code preserved, not deleted

## 12. OPEN QUESTIONS

- None beyond what Phase 1 resolves
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Depends on**: `../001-usage-and-migration-audit/`
