---
title: "Feature Specification: Phase 1: Usage and Migration Audit"
description: "Inventory every live calendar, timeline and chart view (operator vault and fixtures) and decide the settings-redirect target for each, before anything is removed."
trigger_phrases:
  - "008 phase 1"
  - "calendar timeline chart usage audit"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 1: Usage and Migration Audit

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Before any renderer is removed, this phase inventories every live calendar, timeline and chart view — the operator's own vault plus any fixture/test vault the project ships — and decides what each one redirects to, following the pattern `006` and `007` used for list and gallery.

**Key Decisions**: No view is removed or redirected until this audit names it explicitly.

**Critical Dependencies**: None — this phase reads the current state only.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft — opened 2026-09-08, nothing started |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `008-calendar-timeline-chart-deprecation` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 1** of the Calendar, timeline and chart view deprecation specification.

**Scope Boundary**: Inventory and redirect-target decision only — no removal or redirect ships in this phase.

**Dependencies**: None.

**Deliverables**:
- One inventory table: every database with a calendar, timeline or chart view configured, in the operator's vault and in every fixture/test vault the project ships, with its decided redirect target (table or board, matching `006`/`007`'s decision)
- A decision on whether the three types leave `DatabaseViewType` entirely or stay accepted-but-redirected, matching or diverging from `006`'s list precedent, with the reason recorded
- A decision on whether the embedded codeblock host needs its own migration pass, matching `046`'s gallery precedent

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator has decided to retire calendar, timeline and chart views, but no inventory yet exists of which live databases actually use them, so a removal phase would be guessing at blast radius rather than measuring it.

### Purpose
Every live calendar/timeline/chart view is named, with its decided redirect target, before Phase 2 ships anything.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Scanning the operator's vault (via the diagnosis already on record for `070`, and any additional read needed) for `database:` frontmatter blocks configuring a calendar, timeline or chart view
- Scanning `tools/screenshots`, `tools/storybook` and any smoke-test vault for the same three view types
- Deciding each found view's redirect target (table or board) and recording the reason
- Deciding whether the three types leave `DatabaseViewType` or stay accepted-but-redirected

### Out of Scope
- Shipping the redirect itself — Phase 2
- Removing the renderer code — Phase 3

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| None — this phase is read-only | N/A | Inventory and decision only |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Produce an inventory table naming every live calendar/timeline/chart view (operator vault and fixtures) with its decided redirect target |
| REQ-002 | Decide and record whether the three types leave `DatabaseViewType` or stay accepted-but-redirected |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | Decide and record whether the embedded codeblock host needs its own migration pass |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Every view found by the inventory has a named redirect target and a reason
- **SC-002**: The `DatabaseViewType` decision is recorded with the same rigor `006`'s ADR-001-equivalent decision used
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The operator's vault is the only real-world data point; a fixture-only scan could miss a shape the operator relies on | Phase 2's redirect could break a real view the audit never found | Read the diagnosis and fixture shapes already gathered for `070`/`074` in addition to a fresh grep |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

Not applicable — this phase produces a document, not a runtime change.

## 8. EDGE CASES

- A database with more than one view, only one of which is calendar/timeline/chart — the redirect applies to that one view only, not the whole database
- A view type set in frontmatter but never opened (dead configuration) — recorded, not silently dropped

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 10/25 | One inventory pass across vault + fixtures |
| Risk | 5/25 | Read-only; no runtime change |
| Research | 10/20 | Requires the same rigor `006`/`007`'s audits used |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Undercounted inventory | Medium | High (Phase 2 would break an unfound view) | Cross-check against `070`/`074`'s existing fixture work |

## 11. USER STORIES

- As the operator, I want my existing calendar/timeline/chart views to redirect somewhere sensible, not vanish

## 12. OPEN QUESTIONS

- Does the operator have a calendar or chart view configured today, or only timeline (037) and board (038)?
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Precedent**: `../../006-list-view-deprecation/005-usage-and-migration-audit/`, `../../007-gallery-view-deprecation/001-usage-and-migration-audit/`
