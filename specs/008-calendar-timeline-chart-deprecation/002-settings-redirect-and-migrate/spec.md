---
title: "Feature Specification: Phase 2: Settings Redirect and Migrate"
description: "Hide calendar, timeline and chart from every picker/switcher/settings surface, and ship a settings redirect for every existing view Phase 1 found."
trigger_phrases:
  - "008 phase 2"
  - "settings redirect and migrate"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 2: Settings Redirect and Migrate

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Hide calendar, timeline and chart from every picker/switcher/settings surface, and ship a settings redirect for every existing view Phase 1 found.

**Key Decisions**: This phase does not start until Phase 1's audit closes.

**Critical Dependencies**: `001-usage-and-migration-audit`.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft — blocked on Phase 1 |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `008-calendar-timeline-chart-deprecation` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 2** of the Calendar, timeline and chart view deprecation specification.

**Scope Boundary**: Hide calendar, timeline and chart from every picker/switcher/settings surface, and ship a settings redirect for every existing view Phase 1 found.

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
Once removed from the picker, an existing view configured as calendar, timeline or chart must still open — as its Phase-1-decided redirect target — rather than fail to render, matching `006`'s hide-and-migrate phase and `007`'s settings-redirect-and-migrate phase.

### Purpose
Hide calendar, timeline and chart from every picker/switcher/settings surface, and ship a settings redirect for every existing view Phase 1 found.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Removing calendar/timeline/chart from every view-type picker and switcher
- Shipping the settings redirect for every view Phase 1 found, to its decided target

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
| REQ-001 | No picker, switcher or settings surface can create or select a calendar, timeline or chart view |
| REQ-002 | Every existing view of those three types opens through the settings redirect Phase 1 decided |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | The embedded codeblock host redirects too, if Phase 1 decided it needs its own pass |

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
