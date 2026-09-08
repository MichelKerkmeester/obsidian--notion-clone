---
title: "Feature Specification: Test Data Consolidation"
description: "Replace the project's scattered test/fixture datasets with one big testbed database (every surviving view type, column type, grouping, filter, sort, formula, relation) plus the operator's restored Finance databases as the second dataset."
trigger_phrases:
  - "074 test data consolidation"
  - "r10 reduce test data"
  - "one big testbed database"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/074-test-data-consolidation"
    last_updated_at: "2026-09-08T08:30:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Consolidation implemented; Finance fixture kept; registry red-then-green; gate 27/0"
    next_safe_action: "Await the fresh verifier; the operator adopts testbed-proposal.md"
    blockers: []
    key_files:
      - "tools/screenshots/"
      - "tools/storybook/"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "074-test-data-consolidation-scaffold"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "The operator's own Database Testbed folder is operator-owned; this packet proposes the consolidated shape for it but does not overwrite it without the operator's own action"
      - "\"With data restored\" means visible again, not recovered: 070's diagnosis already found the Finance frontmatter intact on disk"
      - "Surviving view types: table, board, calendar, timeline, chart — list and gallery renderers are gone from the tree (decision-record ADR-0001)"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Test Data Consolidation

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Implemented 2026-09-08 — consolidation landed in the worktree; closure evidence in `implementation-summary.md` |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../005-component-surface-system/` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator wants less test data overall: one big testbed database with an overview and every view type/column type/grouping/filter/sort/formula/relation the harnesses need, alongside the operator's own Finance databases (Reports/Income/Expenses/Sales, imported from Notion) as a second, real-world dataset — rather than the current spread of separate fixture vaults, screenshot fixtures, story fixtures and an operator-maintained Testbed folder that do not share a single source of truth.

### Purpose
One consolidated testbed database is the shared fixture for capture, story and phone-smoke harnesses; the operator's Finance databases remain the second dataset, visible again once `070` lands (the diagnosis already found the underlying data intact — "restored" means visible, not recovered).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Inventorying every test/fixture dataset the project ships or seeds: `tools/screenshots/` fixture vaults, `tools/storybook/` story fixtures, any smoke-test vault, and the operator's own `Database Testbed/` folder (proposal only — operator-owned, not overwritten without the operator's action)
- Designing one consolidated testbed database: an overview note plus a representative view for every view type surviving `006`-`009`'s deprecations, every column type, grouping, filter, sort, formula and relation the harnesses currently exercise across multiple fixtures
- Migrating the capture, story and phone-smoke harnesses onto the one consolidated database
- Confirming the Finance databases (Reports/Income/Expenses/Sales) are visible once `070` lands, and are kept as the second dataset rather than folded into the testbed database

### Out of Scope
- Fixing `070`'s underlying data-read regression — that packet's own scope; this packet only depends on it for "restored" visibility
- Any sheet-family redesign (`071`)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `tools/screenshots/` fixture vault(s) | Modify/Remove | Consolidate into the one testbed database |
| `tools/storybook/` story fixture(s) | Modify/Remove | Consolidate into the one testbed database |
| New consolidated testbed database definition | Create | Overview note + one view per surviving type + full column/grouping/filter/sort/formula/relation coverage |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Inventory every test/fixture dataset the project ships or seeds |
| REQ-002 | Design and build one consolidated testbed database covering every surviving view type, column type, grouping, filter, sort, formula and relation |
| REQ-003 | Migrate the capture, story and phone-smoke harnesses onto the one consolidated database |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | Confirm the Finance databases are visible once `070` lands, and are documented as the second, kept dataset |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The fixture inventory count (before) versus the consolidated count (after) shows a real reduction, not a relabeling of the same number of datasets
- **SC-002**: Every harness (capture, story, phone-smoke) runs green against the one consolidated database with no fixture left behind still in use
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `070`'s fix | Finance data visibility depends on that packet landing; this packet's REQ-004 cannot close before it does | REQ-004 is explicitly conditioned on `070` in this spec and in `goal.md` |
| Risk | Consolidating fixtures a harness was tuned against could silently change what that harness measures (different row counts, different edge-case coverage) | A harness could go green for the wrong reason after consolidation | REQ-003 requires each harness's own pass/fail criteria to be re-verified against the new database, not assumed unchanged |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Reliability
- **NFR-R01**: The consolidated database must be deterministic fixture data (not live/operator data) for every harness except the Finance dataset, which is explicitly the operator's own
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A view type deprecated by `006`-`009` (list, gallery, calendar, timeline, chart) must not receive a representative view in the new testbed database once its deprecation phase closes
- A harness that currently depends on a fixture-specific row count or edge case (e.g. an empty group, a null relation) must have that case represented in the consolidated database, not silently dropped
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 14/25 | Inventory, one new database design, and a harness migration across capture/story/smoke |
| Risk | 8/25 | Risk of silently changing what a harness measures during consolidation |
| Research | 10/20 | Requires reading every current fixture's actual edge-case coverage before consolidating |
| **Total** | **32/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- (none — the surviving-views question is answered as decision-record ADR-0001: table, board, calendar, timeline, chart; list and gallery renderers are gone from the tree, so a fixture view of either would configure a surface nothing paints)
<!-- /ANCHOR:questions -->

---
