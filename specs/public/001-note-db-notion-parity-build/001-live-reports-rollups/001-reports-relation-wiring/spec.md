---
title: "Feature Specification: Reports Relation Wiring"
description: "Inventory the four finance db_view notes and populate both relation sides so Reports-side [[wikilink]] arrays exist; the fork rolls up only forward from the Report row."
trigger_phrases:
  - "reports relation wiring"
  - "expenses r wikilink"
  - "month relation report"
  - "db_view inventory"
  - "forward-only rollup"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/001-live-reports-rollups/001-reports-relation-wiring"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored relation-wiring child from synthesis rank 1 and final-plan steps 1-4"
    next_safe_action: "Inventory the four db_view notes; do not invent paths"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-reports-relation-wiring"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Reports Relation Wiring

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `001-live-reports-rollups` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 6 |
| **Predecessor** | None |
| **Successor** | 002-display-only-amount-types |
| **Handoff Criteria** | Written inventory exists; one sample Report relation resolves to the expected child set via `[[wikilink]]` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 6** — Parent: [`../spec.md`](../spec.md) · Successor: `002-display-only-amount-types`. This child is synthesis rank 1 and final-plan steps 1–4. It gates every later rollup because the fork reads only `sourceRecord.frontmatter[relation.key]` on the Reports row (`RelationRollup.ts:70-78`) and has no inverse resolver.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion exposes both directions (Reports.Expenses (R) ↔ child Month). The fork rolls up only forward from the Reports row's own relation column (`RelationRollup.ts:70-78`) and has **no backlink/inverse resolver**, so child Month wikilinks alone will not fill Report figures. Paths of the four `db_view` notes are UNKNOWN. `parseRelationLink` accepts only a full-string `[[...]]` (`RelationLinks.ts:9-25`); bare titles, paths, or Markdown links are dropped with the same empty UI as "no children."

### Purpose
Locate the Reports, Expenses, Sales, and Income `db_view` notes, inventory their `database:` YAML and frontmatter shapes, and populate both halves of each relation pairing so a sample Report's relation resolves to the expected child set. Fork `src/` stays untouched.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Read-only preflight: record `git status` on the Obsidian Plugin tree and copy current `database:` YAML from the four `db_view` notes.
- Locate the four notes (paths UNKNOWN; halt if not found). Record database ids, relation column keys, existing `targetDatabaseId`, static Income/Expenses/Sales/Saved values, and whether Report frontmatter already holds `[[wikilink]]` arrays for Expenses (R) / Sales (R) / Income (R).
- Count child rows with empty Month vs malformed non-`[[...]]` values (`RelationLinks.ts:9-25`).
- Reports `database:` relation columns with `relationConfig.targetDatabaseId` = child database ids; each Report row lists **that month's** children as `[[wikilink]]`; each child Month field points at its Report note.
- If inventory shows empty Reports-side links and more than a handful of children: one-shot vault script / Templater pass writing `[[wikilink]]` arrays onto each Report note — still vault data, not fork `src/`.

### Out of Scope
- COUNT, `list`, or SUM rollup column defs (children `003-count-list-resolution` and `004-sum-rollups`).
- Pinning `computedSyncMode` or amount column types (child `002-display-only-amount-types`).
- Derived inverse relations (later parent phase). Do not wait for that work.
- Any edit to plugin TypeScript under the fork's `src/`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Live finance vault Reports `db_view` note `database:` YAML and per-row frontmatter (path UNKNOWN) | Modify | Relation columns targeting Expenses/Sales/Income; `[[wikilink]]` arrays of that month's children |
| Live finance vault Expenses `db_view` note `database:` YAML and per-row frontmatter (path UNKNOWN) | Modify | Month `targetDatabaseId` = Reports id; each row wikilinks its Report note |
| Live finance vault Sales `db_view` note `database:` YAML and per-row frontmatter (path UNKNOWN) | Modify | Same Month target and per-row Report link as Expenses |
| Live finance vault Income `db_view` note `database:` YAML and per-row frontmatter (path UNKNOWN) | Modify | Same Month target and per-row Report link as Expenses |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Four `db_view` notes inventoried | Paths, database ids, relation keys, existing `targetDatabaseId`, static totals, and Reports-side `[[wikilink]]` occupancy are written down. Halt if notes cannot be found. Do not invent paths. |
| REQ-002 | Both relation sides populated | Every in-scope Expenses, Sales, and Income row's Month field points at the matching Report note, and Reports carries relation columns targeting those three child databases (Notion names such as Expenses (R) reused). Engine reads only the Report row (`RelationRollup.ts:70-78`). |
| REQ-003 | Wikilink syntax is full-string `[[...]]` | Setup inventories actual frontmatter shapes. Bare titles, paths, or Markdown links are corrected; `parseRelationLink` otherwise drops them (`RelationLinks.ts:9-25`). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Bulk-fill when Reports-side is empty | If T001 shows empty Report relations and more than a handful of children, a one-shot vault script / Templater pass writes `[[wikilink]]` arrays onto each Report note. Still not plugin TypeScript. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A written inventory exists for Reports, Expenses, Sales, and Income `db_view` notes.
- **SC-002**: One sample Report's relation field resolves to the expected child set.
- **SC-003**: No fork `src/` file differs because of this child.

### Acceptance Scenarios

- **Given** child Month links exist but Reports-side Expenses (R) is empty, **when** a Reports view loads, **then** rollups stay empty because the fork reads only the Report row (`RelationRollup.ts:70-78`).
- **Given** a Report relation lists `[[Child A]]` and `[[Child A]]` twice, **when** later COUNT runs, **then** that path is counted once (`seenPaths`, `RelationRollup.ts:69-75`) — wiring must still write valid `[[...]]` values.
- **Given** `targetDatabaseId` points at the wrong database, **when** `getTarget` runs, **then** the result is null and the rollup is empty with no error (`RelationRollup.ts:43-49,64-66`) — treat as YAML bug, fix config.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Forward-only resolution (`RelationRollup.ts:70-78`) | Child Month links alone never fill figures | Populate Reports-side links this child; do not wait for inverses |
| Risk | Wikilink syntax mismatch (`RelationLinks.ts:9-25`) | Same empty UI as "no children" | Inventory actual frontmatter shapes, not just "is Month filled" |
| Risk | Effort is UNKNOWN until row counts exist | Per-child transcription onto Report rows is not an S YAML tweak if Reports-side is empty | Size after T001; bulk-fill via vault script if more than a handful |
| Risk | Wrong `targetDatabaseId` | Silent empty rollup (`RelationRollup.ts:43-49,64-66`) | Inventory existing ids; treat empty as YAML bug |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- Exact filesystem paths of the four `db_view` notes: UNKNOWN. Default: inventory in Setup; do not invent.
- Whether Report notes already hold populated Expenses (R) / Sales (R) / Income (R) `[[wikilink]]` arrays: UNKNOWN. Default: inventory; if empty, populate this child (vault data).
- Effort S if both sides already linked; M if Reports-side must be bulk-filled. Do not treat 2.5h as a contract until T001 row counts exist.
<!-- /ANCHOR:questions -->
