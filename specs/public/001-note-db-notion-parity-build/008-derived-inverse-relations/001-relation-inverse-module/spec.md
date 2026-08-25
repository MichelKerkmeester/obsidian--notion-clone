---
title: "Feature Specification: Relation Inverse Module"
description: "Create an isolated RelationInverse.ts fan-in index (one stored many-to-one wikilink, inbound set computed, SYNC_WRITES_DEFAULT false) plus RelationInverse unit tests and the shared Vitest setup stub if 007 has not already landed it."
trigger_phrases:
  - "relation inverse module"
  - "RelationInverse"
  - "buildRelationInverse"
  - "SYNC_WRITES_DEFAULT"
  - "inboundByPath"
  - "sourceDatabaseIds"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations/001-relation-inverse-module"
    last_updated_at: "2026-08-25T21:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored RelationInverse module child from synthesis ranks 1 and 8 and final-plan step 2"
    next_safe_action: "Implement RelationInverse.ts plus RelationInverse.test.ts and setup.ts if missing"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-relation-inverse-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Relation Inverse Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `008-derived-inverse-relations` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 3 |
| **Predecessor** | None |
| **Successor** | 002-rollup-inverse-resolution |
| **Handoff Criteria** | Module exports buildRelationInverse, locked types, SYNC_WRITES_DEFAULT = false, sourceDatabaseIds; unit fixtures green; RelationRollup.ts and both view copies untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 3** — Parent: [`../spec.md`](../spec.md) · Successor: `002-rollup-inverse-resolution`. Independent of packet `001-live-reports-rollups` (vault YAML only; the forward scan already exists).

This child is synthesis ranked items 1 (fan-in index) and 8 (self-relation reverse index, same module) plus `research/final-plan.md` step 2 and the unit half of step 6. Do not wire `RelationRollup.ts` or the views here.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion shows related pages on the *target* via a second stored relation (`dual_property`). The fork only scans outbound from the source DB (`src/data/RelationRollup.ts:24-88`) and would otherwise need a mirrored frontmatter property. A naive two-way port dual-enqueues `DataSource.writeQueues` (`src/data/DataSource.ts:89,99-120`) and churns two iCloud notes. Self-relation is the one Notion derived-like case (one property works both ways) and must fall out of the same reverse index, not a recursive expander (`seenPaths` at `RelationRollup.ts:69-75`).

### Purpose
Create `src/data/RelationInverse.ts` as a EuroFormat-*placement* leaf (durable-why header, no plugin hooks, no writes, no class; `EuroFormat.ts:1-10`) that inverts the existing scan in memory and exports the locked types plus `SYNC_WRITES_DEFAULT = false`. Imports are allowed (`App`, `parseRelationValues`, types, `NoteRecord`); isolation is the file boundary, not zero imports. Prove the fixtures in `RelationInverse.test.ts` before any call site imports the module.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/RelationInverse.ts`: durable-why header (one stored wikilink, never rewrite the target). No `vault.*write*` / `processFrontMatter`. No class. No plugin hooks.
- Locked exports from `research/synthesis.md` Recommended build plus final-plan step 2: `RelationInverseContext { app, databases, getRecordsForDatabase }` (no `sourceDatabase` / `sourceRecords` — fan-in is all DBs), `RelationInverseEdge { sourceDatabase, relationColumn, sourceRecord }`, `RelationInverseResult { inboundByPath: Map<string, RelationInverseEdge[]>, sourcePaths: Set<string> }`, `buildRelationInverse(context): RelationInverseResult`, `SYNC_WRITES_DEFAULT = false` (compile-time tripwire, no write branch), and `sourceDatabaseIds` (DBs that contributed edges) for later refresh.
- Algorithm (same scan inverted): index relation columns by `targetDatabaseId` using the `RelationRollup.ts:28-32` filter (`column.type === "relation" && column.relationConfig?.targetDatabaseId`); for each source `(db, column)` targeting `T`, iterate `getRecordsForDatabase(db)` (`DataSource.ts:229-232`); `parseRelationValues(record.frontmatter[column.key])` (`RelationLinks.ts:23-26`) → `app.metadataCache.getFirstLinkpathDest(link.target, record.file.path)` (`RelationRollup.ts:71`) → skip null (`:71-72`) → per-record `seenPaths` (`:69-75`) → membership on `T.recordsByPath` (`:50-56,73-74`) → append edge. Strip `|` alias and `#` subpath via the existing parser (`RelationLinks.ts:15-19`).
- Self-relation: reverse index of stored edges, not a recursive expander; a self-link appears once (ranked item 8; Notion single-property self-relation).
- Tiny helper next to `buildRelationInverse` that later view copies can call to merge `sourceDatabaseIds` / `sourcePaths` into existing membership sets without duplicating the merge. No view imports.
- Bootstrap `src/__tests__/setup.ts` only if 007 has not already added the empty stub `vitest.config.ts` requires; add `src/data/RelationInverse.test.ts`. Do not treat `package.json` as a feature call site.

### Out of Scope
- `RelationRollup.ts` inverse resolution (child `002-rollup-inverse-resolution`).
- `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts` refresh membership (child `003-inverse-refresh-membership`).
- Inverse chip helper in `RelationLinks.ts`, chip window N=25, `RecordDetailPanel.ts` Backlinks, `CellRenderer.ts` inbound badge, `types.ts`, any `syncWrites` ON path.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/RelationInverse.ts` | Create | Isolated fan-in inverse: locked exports, no writes |
| `src/__tests__/setup.ts` | Create (if missing) | Empty Vitest stub required by `vitest.config.ts` |
| `src/data/RelationInverse.test.ts` | Create | Unit fixtures for empty, cardinality-1 list, dangling, self-relation, alias strip |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `src/data/RelationInverse.ts` exists as a EuroFormat-placement leaf | Durable-why header; no class; no plugin hooks; no `vault.*write*` / `processFrontMatter`; exports the locked context/edge/result types, `buildRelationInverse`, `SYNC_WRITES_DEFAULT = false`, and `sourceDatabaseIds` |
| REQ-002 | Fan-in scan matches the rollup resolver/dedupe/membership shape | Columns filtered as `RelationRollup.ts:28-32`; resolve via `getFirstLinkpathDest` (`:71`); skip null (`:71-72`); `seenPaths` (`:69-75`); membership on target `recordsByPath` (`:73-74`); in-memory `getRecordsForDatabase` only (`DataSource.ts:229-232`) |
| REQ-003 | Fail-closed edges stay empty without file touch | Empty relation → `[]` inbound (`parseRelationValues` at `RelationLinks.ts:23-26`); dangling skipped; cross-db miss skipped; alias/`#` stripped (`:15-19`); cardinality-1 inverse is still a **list**; self-relation appears once |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Vitest fixtures run without a `package.json` test script | `npx vitest run src/data/RelationInverse.test.ts` executes the step-2 cases; reuse 007's `src/__tests__/setup.ts` if present, else add the empty stub |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npx vitest run src/data/RelationInverse.test.ts` is green on empty inbound, cardinality-1 as a list, many-to-one union, dangling skip, cross-db miss, multi-DB same-key fan-in, self-relation once, and alias/`#` strip.
- **SC-002**: `SYNC_WRITES_DEFAULT === false` and `RelationInverse.ts` contains no write APIs.
- **SC-003**: `RelationRollup.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`, `RelationLinks.ts`, and `types.ts` are untouched in this child's diff.

### Acceptance Scenarios

- **Given** no stored wikilinks, **when** `buildRelationInverse` runs, **then** inbound is empty and no file is touched.
- **Given** one Expense `Month` wikilink to a Report, **when** the inverse runs, **then** that Report's inbound is a list of length 1 (not a singleton type).
- **Given** a dangling wikilink, **when** `getFirstLinkpathDest` returns null, **then** the edge is skipped (`RelationRollup.ts:71-72`).
- **Given** a self-relation stored edge, **when** the inverse runs, **then** the reverse index lists it once and does not recurse.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Inverse as the sole entry that triggers `buildRelationRollups` | Silently no-ops because `:36` early-returns when the viewed DB has no rollup columns | Do not call `buildRelationRollups` from this module; child 002 calls inverse only after that gate |
| Risk | EuroFormat zero-import over-claim | Module cannot parse links without `App` / `parseRelationValues` | Isolate the file; imports are allowed (`research/final-plan.md`) |
| Risk | Vitest unloadable | Step-2 accept cases cannot run | Empty `src/__tests__/setup.ts` if 007 has not landed it |
| Dependency | None on children 002/003 | — | This module is the type owner; later children import it |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: `SYNC_WRITES_DEFAULT = false` with no ON path; self-relation is reverse-index only; key-scoped union is applied at the rollup call site (child 002), while this module's full fan-in index unions all inbound edges.
<!-- /ANCHOR:questions -->
