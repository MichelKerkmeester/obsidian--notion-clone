---
title: "Feature Specification: Phase 4: Archive Docs and Release"
description: "Strip calendar, timeline, gallery and chart mentions from the root README and community-plugin description, and document 037's timeline landing as superseded."
trigger_phrases:
  - "008 phase 4"
  - "archive docs and release"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 4: Archive Docs and Release

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Strip calendar, timeline, gallery and chart mentions from the root README and community-plugin description, and document 037's timeline landing as superseded.

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

This is **Phase 4** of the Calendar, timeline and chart view deprecation specification.

**Scope Boundary**: Strip calendar, timeline, gallery and chart mentions from the root README and community-plugin description, and document 037's timeline landing as superseded.

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
The root README and community-plugin description still describe views this packet retires; leaving them in place after Phase 3's removal would misrepresent what the plugin currently does.

### Purpose
Strip calendar, timeline, gallery and chart mentions from the root README and community-plugin description, and document 037's timeline landing as superseded.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Removing every calendar, timeline, gallery and chart mention from `README.md`
- Removing the same from the community-plugin description (`manifest.json` / community-plugins listing copy)
- Adding a note that `037-timeline-gantt-port`'s recent landing is superseded by this packet's archival, without deleting `037`'s own history
- Release notes for the version that ships this removal

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
| REQ-001 | `README.md` and the community-plugin description contain zero calendar/timeline/gallery/chart mentions |
| REQ-002 | `037-timeline-gantt-port`'s own docs (or the parent `005` roadmap) note the landing as superseded by this packet, without deleting the history |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | Release notes for the shipping version describe the removal and the archive/restore path |

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
