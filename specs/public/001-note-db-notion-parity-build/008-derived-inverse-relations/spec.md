---
title: "Feature Specification: Derived Inverse (Safe Two-Way) Relations"
description: "Specifies a read-only derived inverse so many-to-one wikilinks surface Notion-like two-way relations without writing a second markdown file."
trigger_phrases:
  - "derived inverse"
  - "inverse relations"
  - "two-way relation"
  - "relationinverse"
  - "back-reference"
  - "syncwrites"
  - "icloud-safe relations"
  - "derived backlinks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations"
    last_updated_at: "2026-08-25T21:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored; RelationInverse module first"
    next_safe_action: "Build 001-relation-inverse-module per its plan.md and tasks.md"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Derived Inverse (Safe Two-Way) Relations

> Predecessor: `007-unique-id-stamp`. Successor: `009-view-filter-tree`. Parent spec: [`../spec.md`](../spec.md).
> Source of truth: [`research/synthesis.md`](research/synthesis.md) (ranked findings) and [`research/research.md`](research/research.md) (evidence trail).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-24 |
| **Branch** | `008-derived-inverse-relations` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion two-way relations store a **second property** on the target data source and mirror it on write: the relation type object is `{ data_source_id, dual_property: { synced_property_id, synced_property_name } }` (Notion API, `developers.notion.com/reference/property-object#relation`), and "with two-way relations, the edits work both ways" (`notion.com/help/relations-and-rollups`). A naive port of that model into the note-database fork would dirty **two** markdown files on every link click. `DataSource.writeQueues` is per-path (`src/data/DataSource.ts:89`), so iCloud would see both the source note (e.g. `Expenses.Month -> Report`) and the target note churn.

The finance vault already named both directions conceptually, so the **product** need is real: a Report must show its Expenses. The **storage** need is not. The fork already walks relations for display-only rollups in `src/data/RelationRollup.ts` (aggregations `count` / `sum` / `avg` / `list`), and rollups are already classified "display-only derived values and are never written to frontmatter" (`src/data/types.ts:69`). Inverting that same scan yields the back-reference without a second stored property. Anytype validates the same storage theorem at scale: one stored edge, `backlinks` read-only (`anytype-ts/src/ts/lib/util/object.ts:494`; `featured.tsx:185-208`). AppFlowy's visible layer stores only forward `row_ids` and computes no inverse (`flowy-database2` has zero `invert` hits).

Stored two-way write-back (`syncWrites` ON / Notion `dual_property`) is a later, explicitly **blocked** escape hatch (REQ-006). This phase is the honest, iCloud-safe substitute: one stored many-to-one wikilink, one computed inverse.

### Purpose
Ship Notion's two-way **benefit** (the target record can list inbound related records) without Notion's **cost** (a mirrored stored property and a second write). Add an isolated module `src/data/RelationInverse.ts` that reuses the existing relation scan, inverted, and expose the result as a read-only derived inverse at two locked call sites: `RelationRollup.ts` (inverse resolution rule for rollups) and the two `buildRowsWithRelations` copies in `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts` (refresh membership so live Report views stay current). Do **not** port Notion's `dual_property` mirror. Nested children own the ordered slices: the RelationInverse module and unit fixtures first, then key-scoped inverse resolution inside `RelationRollup.ts`, then refresh membership in the two `buildRowsWithRelations` copies.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New isolated module `src/data/RelationInverse.ts` (EuroFormat-style *placement*: durable-WHY header, no plugin hooks, no writes, no class; mirror `src/data/EuroFormat.ts:1-10`). Unlike `EuroFormat.ts` (zero imports), this module **does** import `App`, `parseRelationValues`, and types (`ColumnDef`/`DatabaseConfig`, `NoteRecord`) — the isolation is the file boundary and small call sites, not zero imports.
- Computing a read-only fan-in inverse of stored many-to-one wikilinks (`Expenses.Month -> Report` stored; `Report -> Expenses` derived in memory).
- Reusing the same resolver/dedupe/membership scan shape `RelationRollup.ts` already performs, inverted — **not** a second vault walk. `buildRelationInverse` is called from inside the rollup loop only after `buildRelationRollups` has already passed its `:36` gate (viewed DB has rollup columns) and a specific `relationField` misses locally; it is never the sole entry that triggers rollups, and `buildRelationRollups` is never called from the inverse (`src/data/RelationRollup.ts:36`).
- Two locked call-site hunks: **Hunk 1** `RelationRollup.ts` (key-scoped inverse resolution rule for rollups) and **Hunk 2** the two `buildRowsWithRelations` copies in `DatabaseView.ts` (`:3348-3372`) and `EmbeddedDatabaseRenderer.ts` (`:3190-3221`) (refresh membership so editing/creating an Expense refreshes an open Report view). A tiny shared helper next to `buildRelationInverse` keeps the two view copies from diverging.
- Declare `SYNC_WRITES_DEFAULT = false` on the new module (zero `types.ts` touch); it is a compile-time tripwire, not a runtime flag — no write branch reads it.
- Key-scoped cross-database fan-in: union across every database whose relation columns carry `column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === T.id`. A Report rollup with `relationField: "Month"` matches columns **named `Month`** that target Reports; a different key (e.g. `Sales.Report`) is a separate rollup column, not magically included (structural delta vs `buildRelationRollups`, which iterates one `sourceDatabase`).
- Mobile-safe, MIT-forkable, no telemetry, no secrets, no `electron` / `node:` / `fs`.

### Out of Scope
- Stored two-way write-back that mirrors a property onto the target note (blocked this phase; REQ-006; `syncWrites` stays OFF, no ON path, no conflict policy).
- Notion `dual_property` mirror; AppFlowy's non-vendored `collab-database` mirror-field.
- New column types, new view types, formula engines (`ComputedField.ts` / `SafeEval.ts` / `BaseExpression.ts`), footer `SummaryKinds`, or chart aggregations.
- Changing rollup math or `RollupConfig` shape (`src/data/types.ts:39-45`); extend the *resolution rule* only, not the schema.
- The inverse chip helper in `RelationLinks.ts` (synthesis ranked item 3) and the bounded chip render window (ranked item 5) — **deferred this phase**. Under the rollup-only default, rollup `list`/`count` render through `row.computed[col.key]` as ordinary rollup cells (`src/views/CellRenderer.ts:115-116,656`), **not** `renderRelationValue` chips, so the chip helper and N=25 window have no consumer until the record-panel waiver (T019). Bound chips later, at the panel, with N=25.
- `RelationRollupConfigModal.ts` UI for picking a foreign `relationField` — the modal only lists local relations. v1 inverse rollups are configured via YAML `rollupConfig.relationField: "Month"` on the Report (YAML-first, same posture as 007); the modal is a later hunk, not this phase.
- Record-page inbound section in `RecordDetailPanel.ts` (synthesis item 6) — **out of the spec file budget** unless the operator grants an explicit waiver (open question 1).
- Table-cell inbound badge "↩ N" (synthesis item 9) — deferred to keep SC-005.
- View filter trees, unique-id stamping, record templates, conditional formatting, and embedded-view work owned by other phases.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/RelationInverse.ts` | Create | Isolated derived-inverse module: fan-in index, read-only, `SYNC_WRITES_DEFAULT = false` (compile-time tripwire, no write branch), no writes, no class (EuroFormat *placement*; imports `App`, `parseRelationValues`, types, `NoteRecord`). Exports `buildRelationInverse`, `RelationInverseContext`, `RelationInverseEdge`, `RelationInverseResult { inboundByPath, sourcePaths }`, `sourceDatabaseIds`, and `SYNC_WRITES_DEFAULT`. |
| `src/data/RelationRollup.ts` | Modify | Hunk 1: after `relationColumns.get(config.relationField)` misses (and the `:36` gate has passed), resolve `relationField` as a **key-scoped** inverse — columns in `context.databases` with `column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === sourceDatabase.id` — and feed inbound records for the current `sourceRecord` to existing `aggregateRollup` (`:92-129`). Union inverse `sourcePaths` into `targetPaths` so `relationTargetPaths` sees Expense paths. No new aggregation kinds; no `RollupConfig` shape change. |
| `src/views/DatabaseView.ts` | Modify | Hunk 2 (refresh membership): in `buildRowsWithRelations` (`:3348-3372`), after inverse rollups, include databases in `sourceDatabaseIds` (Expenses) and their `sourcePath`s in `relationTargetDatabasePaths` so `handleDataChangeBatch` (`:2120-2128`) refreshes Reports when an Expense is created, retargeted, or edited. |
| `src/views/EmbeddedDatabaseRenderer.ts` | Modify | Hunk 2 (refresh membership, mirror copy): same change as `DatabaseView.ts` in `buildRowsWithRelations` (`:3190-3221`); prefer a shared helper next to `buildRelationInverse` so the two view copies do not diverge. |
| `src/views/RecordDetailPanel.ts` | Modify (conditional) | Hunk 3 / synthesis item 6: additive trailing "Backlinks" section, hide-when-empty. **Only** if the operator approves the budget waiver (open question 1). Do not change `renderRelationValue`'s signature. |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Forward wikilink remains the only stored relation | Saving `Expenses.Month -> Report` writes the Expense note only. The Report note's markdown is not rewritten. `DataSource.writeQueues` (`src/data/DataSource.ts:89`) receives one path. |
| REQ-002 | Derived inverse is computed, not stored | `src/data/RelationInverse.ts` returns inbound records for a target by inverting the existing scan. No second relation property is persisted on the target (no `dual_property`). |
| REQ-003 | Same scan shape, inverted — gated entry, not a sole trigger | The inverse reuses the same resolver (`getFirstLinkpathDest`), per-record `seenPaths` dedupe, and `recordsByPath` membership as `buildRelationRollups` (`src/data/RelationRollup.ts:69-75,71,73-74`). `buildRelationInverse` is called from inside the rollup loop only after `buildRelationRollups` has passed its `:36` gate (viewed DB has rollup columns) and a specific `relationField` misses locally; it is never the sole entry that triggers rollups, and `buildRelationRollups` is never called from the inverse (the early-return trap at `:36`). One pass over fan-in edges; no second vault walk; no `vault.*write*` / `processFrontmatter`. |
| REQ-004 | Two call sites wired | `RelationRollup.ts` (key-scoped inverse resolution rule for rollups) and the two `buildRowsWithRelations` copies in `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts` (refresh membership) consume the derived inverse so Report rollups list Expenses without a stored back-link **and** live Report views refresh when an Expense is created, retargeted, or edited. |
| REQ-005 | Default path never dual-writes | With `syncWrites` OFF (`SYNC_WRITES_DEFAULT = false`), a relation edit dirties one markdown file. iCloud sees one note churn. Relation edits keep flowing through `DataSource.enqueueWrite` keyed by the edited path (`:99-120`; `mutateFrontmatter` at `:288-296`); `RelationInverse.ts` never joins the queue. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-006 | `syncWrites` exists as an OFF escape hatch | `SYNC_WRITES_DEFAULT = false` is declared on `RelationInverse.ts` as a compile-time tripwire with no write branch reading it. No ON path and no conflict policy ship this phase. Enabling stored two-way write-back (Notion `dual_property`) is deferred to a later phase. |
| REQ-007 | Rebase-friendly isolated diff | Diff shape mirrors `EuroFormat.ts` *placement*: new file under `src/data/` plus Hunk 1 in `RelationRollup.ts` and Hunk 2 in the two `buildRowsWithRelations` copies (`DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts`, or a shared helper they both call); third hunk (`RecordDetailPanel.ts`) only on operator waiver. No drive-by refactors; no `types.ts` change. |
| REQ-008 | Platform and license constraints | Implementation uses cross-platform Obsidian APIs only (`metadataCache.getFirstLinkpathDest`, `workspace.openLinkText`, `setIcon`, DOM `createDiv`/`createEl`); no `electron` / `node:` / `fs`; remains MIT-forkable; no telemetry or secrets. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Setting `Expenses.Month` to a Report wikilink updates one markdown file. The Report file's mtime/content is unchanged by that click; `DataSource.writeQueues` is keyed by the edited path only.
- **SC-002**: A Report-side `list` / `count` rollup over inbound edges lists the Expenses produced by `RelationInverse.ts`, matching the stored forward links. Under the rollup-only default these render through `row.computed[col.key]` as ordinary rollup cells (`src/views/CellRenderer.ts:115-116,656`), not relation chips (record-page section is the open-question waiver).
- **SC-003**: Rollups that already support `count` / `sum` / `avg` / `list` aggregate the derived inbound set via existing `aggregateRollup` (`src/data/RelationRollup.ts:92-129`) without persisting a back-property and without changing `RollupConfig` shape.
- **SC-004**: `SYNC_WRITES_DEFAULT = false` is present as a compile-time tripwire with no write branch; a default-path test (or equivalent manual proof) shows a single `writeQueues` path and no ON branch.
- **SC-005**: The shipped diff is one new `src/data/RelationInverse.ts` module plus Hunk 1 in `RelationRollup.ts` and Hunk 2 in the two `buildRowsWithRelations` copies (`DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts`, or a shared helper) (no `types.ts` touch). The third hunk (`RecordDetailPanel.ts`) ships only on an explicit operator waiver.
- **SC-006**: With a Report view open, changing `Expenses.Month` to that Report updates the inverse `count` / `list` **without a manual refresh** — `handleDataChangeBatch` (`src/views/DatabaseView.ts:2120-2128`) refreshes because the Expenses database and its source paths are registered via `sourceDatabaseIds` / `sourcePaths`. The Report file is not written.

### Acceptance Scenarios

- **Scenario 1**: **Given** an Expense stores `Month` as a wikilink to a Report (the forward scan already exists in the fork; phase `001-live-reports-rollups` need not be complete), **when** the Report view renders its inverse rollup, **then** that Expense appears in the derived inbound list and the Report file was not written.
- **Scenario 2**: **Given** two Expenses point at the same Report, **when** a `count` rollup uses the inverse, **then** the displayed count is 2 and both source files remain the only stored relation edges.
- **Scenario 3**: **Given** `syncWrites` is at its default (OFF), **when** a user changes a relation wikilink, **then** `DataSource.writeQueues` is keyed by the edited note's path only and the Report is not a write participant.
- **Scenario 4**: **Given** a dangling wikilink or a missing `RelationConfig.targetDatabaseId` match, **when** the inverse scan runs, **then** the target shows no bogus inbound row and no file is created or repaired (`getFirstLinkpathDest` → null → `continue`, `src/data/RelationRollup.ts:71-72`).
- **Scenario 5**: **Given** a rebase onto upstream plugin changes, **when** the isolated `src/data/RelationInverse.ts` module and its small call-site hunks are replayed, **then** conflicts stay confined to those files (EuroFormat-style placement).
- **Scenario 6**: **Given** multiple databases carry relation columns **named `Month`** targeting the same Report DB, **when** the inverse runs for a rollup with `relationField: "Month"`, **then** the inbound set is the key-scoped union across every such source database. A different key (e.g. `Sales.Report`) is a separate rollup column, not included.
- **Scenario 7**: **Given** a Report view is open and an Expense's `Month` link is created or retargeted to that Report, **when** `handleDataChangeBatch` runs, **then** the Report's inverse `count` / `list` refreshes without a manual reload because the Expenses database and its source paths are in `relationTargetDatabases` / `relationTargetDatabasePaths` via `sourceDatabaseIds` / `sourcePaths`.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `001-live-reports-rollups` (vault YAML only — "no new `src/` module, no fork TypeScript") | **No code dependency.** The forward relation scan already exists in the fork (`RelationRollup.ts:24-88`); 001's product move is to store Reports-side relation columns, which 008 exists to make unnecessary | Build 008 without waiting. Data dependency for *manual* proof only: at least one Expense `Month` wikilink in the vault. Unit tests fixture their own edges. If 001 stored a local `Month` column, the local relation wins and the inverse is simply unused for that rollup — correct, not a conflict |
| Dependency | `RelationRollup.ts` scan shape (`:24-88`) | Wrong inversion if the scan contract is assumed | Research confirmed the contract (`research/synthesis.md`); code to the real resolver/dedupe/membership, not a parallel walker |
| Risk | Naive stored two-way port (Notion `dual_property`) | Dual markdown writes; iCloud churn on both paths in `DataSource.writeQueues` | Store many-to-one only; inverse is read-only; `SYNC_WRITES_DEFAULT = false`; no ON path this phase |
| Risk | Inverse as the sole entry that triggers `buildRelationRollups` | Silently no-ops because `buildRelationRollups` early-returns when the viewed DB has no rollup columns (`:36`) | `buildRelationInverse` is called from inside the rollup loop only after the `:36` gate has passed and a `relationField` misses locally; `buildRelationRollups` is never called from the inverse |
| Risk | Stale inbound counts in a live Report view (the real UX bug) | A Report with only rollup columns has zero local relations, so `relationTargetPaths` / `relationTargetDatabases` stay empty and `handleDataChangeBatch` (`DatabaseView.ts:2120-2128`) never refreshes when an Expense is edited/created — same silent-failure class as 001's "silent empty SUM" | Hunk 2 is in-scope: register `sourceDatabaseIds` + `sourcePaths` into `relationTargetDatabases` / `relationTargetDatabasePaths` in both `buildRowsWithRelations` copies. Do not keep SC-005 at "two hunks" if that drops this refresh work |
| Risk | Enabling `syncWrites` accidentally | Reintroduces the deferred write-back cost this phase exists to avoid | Flag defaults OFF on the module as a compile-time tripwire; this phase ships no ON path and no conflict policy |
| Risk | Second vault scan on every render | Mobile jank; duplicate work vs rollups | One pass over fan-in edges; union inverse `sourcePaths` into existing `targetPaths` so refresh reuses the same `relationTargetPaths` machinery (`DatabaseView.ts:3362`, `EmbeddedDatabaseRenderer.ts:3210-3221`) |
| Risk | Unbounded chip render on large inbound sets | Mobile render cost on a Report with hundreds of Expenses | Deferred with the chip surface (T008/T019): bound chips at the panel with first N + "+M more", N=25. This phase's `count`/`sum`/`avg` are cheap; `list` cells may be long but acceptable until T008 |
| Risk | Wide diffs vs upstream | Painful `git rebase` onto the MIT plugin | Isolate in `src/data/RelationInverse.ts` plus Hunk 1 (`RelationRollup.ts`) and Hunk 2 (the two `buildRowsWithRelations` copies or a shared helper), same placement model as `EuroFormat.ts` |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Inverse computation reuses the same scan shape as `RelationRollup.ts` (resolver, dedupe, membership) and is a pure per-refresh function called on the same cadence as today's rollups. It must not add a second full-vault walk on the same render.
- **NFR-P02**: Derived inverse is display-only (same class as rollups, `src/data/types.ts:69`). It must not enqueue extra `DataSource.writeQueues` work on view open.

### Security
- **NFR-S01**: No telemetry, secrets, or credentials. Inverse logic does not evaluate formulas; it does not widen `SafeEval.ts`.
- **NFR-S02**: MIT-forkable isolated module; cross-platform Obsidian APIs only; no `electron` / `node:` / `fs`; no proprietary APIs.

### Reliability
- **NFR-R01**: Default inverse path never mutates the target note. Source of truth remains the stored forward wikilink.
- **NFR-R02**: Missing targets, empty relations, and cross-database misses return empty inbound sets without writes (`parseRelationValues(undefined)` → `[]`).
- **NFR-R03**: iCloud-safe: one edited path per relation click when `syncWrites` is OFF.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty relation → `[]` inbound, no placeholder rows, no file touch (`parseRelationValues` at `src/data/RelationLinks.ts:23-26`; Anytype `featured.tsx:192-194`; Notion "Hide when empty").
- Cardinality 1 (Expense.Month → one Report) → inverse is still a **list** of sources (Notion's "1 page" forward limit does not make the back-set a singleton).
- Many-to-one → union of matching sources; `count` / `list` consume that set (SC-003).
- Dangling wikilink → `getFirstLinkpathDest` returns null, `continue`; never create/repair the target (`src/data/RelationRollup.ts:71-72`).
- Cross-database miss → resolved path not in target `recordsByPath` is skipped (`:73-74`). Honor `RelationConfig.targetDatabaseId` (`src/data/types.ts:34-37`); stricter than Anytype's space-wide `backlinks` (`anytype-ts/src/ts/lib/util/object.ts:494`).
- Alias / `#` subpath → strip before resolve (`src/data/RelationLinks.ts:15-19`).
- Duplicate wikilinks on one record → `seenPaths` (`src/data/RelationRollup.ts:69-75`).
- Circular / self-relation → reverse index of stored edges, not a recursive expander; a self-link appears once (matches Notion's single-property self-relation; fork dedupe `seenPaths` at `:69-75`).
- Multi-DB same-key fan-in → **key-scoped** union across every database whose relation columns carry `column.key === config.relationField && column.relationConfig.targetDatabaseId === T.id` (structural delta vs `buildRelationRollups`, which iterates one `sourceDatabase`). A different key (e.g. `Sales.Report`) is a separate rollup column, not included.
- Large inbound sets → computation stays one O(edges) pass. Chip bounding (first N + "+M more", N=25) is **deferred** with the chip surface (T008/T019); this phase's `count`/`sum`/`avg` are cheap and `list` cells may be long but acceptable until T008.

### Error Scenarios
- Scan API mismatch (expected export missing) → call site fail-closed to empty inbound; never invent a second scanner.
- `syncWrites` mistakenly true → out of scope to implement the ON path; if the flag is read, OFF must remain the compiled/default behavior for this phase.
- Concurrent clicks on different Expenses → two `writeQueues` keys; the Report is not a write participant (`src/data/DataSource.ts:89,99-120`).
- View refresh while a source write is queued → read `recordCache` / `getRecordsForDatabase` (`:229-232,239-244`); never flush repair writes to the target. Plugin writes credited via `ownedPathUntil` (`:81-84,246-249`).

### Mobile / iCloud Safety
- The inverse is display-only derived data, the same class as rollups ("never written to frontmatter", `src/data/types.ts:69`). Default path dirties one markdown file per relation click (SC-001/REQ-005); iCloud sees one note. No extra `writeQueues` work on view open (NFR-P02).
- APIs used are cross-platform Obsidian (`metadataCache.getFirstLinkpathDest`, `workspace.openLinkText`, `setIcon`, DOM `createDiv`/`createEl`); no `electron` / `node:` / `fs`. MIT-forkable; no telemetry. Bounded chip windows are a mobile-specific constraint (render cost, not writes) deferred with the chip surface (T008/T019).

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | One new `src/data/` module plus Hunk 1 (`RelationRollup.ts`) and Hunk 2 (the two `buildRowsWithRelations` copies or a shared helper; third hunk on waiver); no new view/column/formula surface; chip helper + window deferred |
| Risk | 11/25 | iCloud dual-write is the failure mode this design exists to prevent; `syncWrites` must stay OFF; stale-inbound-counts UX bug if Hunk 2 refresh is dropped; early-return trap if inverse is the sole entry that triggers `buildRelationRollups` |
| Research | 8/20 | Fork already has relation scan + display-only rollups; inversion is gap-closing, not greenfield; 10-iteration research trail confirmed contracts |
| **Total** | **31/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

Operator decisions (defaults from `research/synthesis.md` §Open questions):

1. **SC-002 surface: rollup-only vs record-page section.** Default: **rollup-only** this phase (Hunk 1 inside `RelationRollup.ts` + Hunk 2 refresh in the two `buildRowsWithRelations` copies) so SC-005 stays two hunks. Under this default, rollup `list`/`count` render through `row.computed` as ordinary rollup cells, not relation chips — so the inverse chip helper (`RelationLinks.ts`) and bounded chip window are deferred with T019/T020. Approve item 6 (`RecordDetailPanel.ts` trailing "Backlinks" section, hide when empty) only if Reports without a rollup column must still list Expenses on the record panel; when waived, label **Backlinks**, N=**25**, sort by `getRelationDisplayLabel` at display time.
2. **`RollupConfig.relationField` inverse resolution vs new schema field.** Default: **resolution rule only** (when the key is not a local relation, treat it as the key of a relation column on another DB targeting this one). No `types.ts` change. A new config field would be a schema migration and a fourth-file risk.
3. **Chip window size N.** Default: **25**, matching Notion `has_more`.
4. **Section / helper label.** Default: **"Backlinks"** (Obsidian-native; distinguish from core backlinks via existing relation-chip styling, not new copy). Do not persist a reverse property to match the name.
5. **Sort order of inbound chips.** Default: **sort at display time** by `getRelationDisplayLabel` (`src/data/RelationLinks.ts:29-31`); keep data-layer order as scan order.
6. **Verification harness.** Research confirmed `vitest.config.ts` includes `src/**/*.test.ts` and `setupFiles: ["src/__tests__/setup.ts"]`, but `src/` has zero `*.test.ts` files, `src/__tests__/` is missing, and `package.json` scripts are only `dev`/`build`/`lint`/`lint:all`. Default: **bootstrap this phase, shared with 007** — if 007 already added `src/__tests__/setup.ts`, 008 only adds `src/data/RelationInverse.test.ts` (and optionally `"test": "vitest run"`); otherwise add the empty setup file. Do not treat `package.json` as a feature call site. Note: `enqueueWrite` is private (`DataSource.ts:99`), so SC-001 spies `processFrontmatter` / `vault.create` paths or asserts the Report file mtime/content is unchanged — it does not export `enqueueWrite`.
7. **Do not enable `syncWrites`.** Default: **OFF forever in this phase**; no ON path, no conflict policy.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research Synthesis**: See [`research/synthesis.md`](research/synthesis.md)
- **Research Evidence Trail**: See [`research/research.md`](research/research.md)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-relation-inverse-module/ | Isolated `RelationInverse.ts` (`buildRelationInverse`, locked types, `SYNC_WRITES_DEFAULT = false`, `sourceDatabaseIds`) plus `RelationInverse.test.ts` | Planned |
| 2 | 002-rollup-inverse-resolution/ | Hunk 1: key-scoped inverse resolution in `RelationRollup.ts` after a local `relationField` miss; feed inbound records to existing `aggregateRollup` | Planned |
| 3 | 003-inverse-refresh-membership/ | Hunk 2: register inverse `sourceDatabaseIds` / `sourcePaths` in both `buildRowsWithRelations` copies so live Report views refresh | Planned |

Future / out of this phase (not child folders): inverse chip helper in `RelationLinks.ts` (ranked item 3); bounded chip window N=25 (item 5); record-page inbound section in `RecordDetailPanel.ts` (item 6, needs budget waiver); table-cell inbound badge (item 9); stored two-way write-back / Notion `dual_property` (item 10, blocked); `RelationRollupConfigModal` foreign-key picker (YAML v1).

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-relation-inverse-module | 002-rollup-inverse-resolution | `RelationInverse.ts` exports `buildRelationInverse`, locked context/edge/result types, `SYNC_WRITES_DEFAULT = false`, and `sourceDatabaseIds`; unit fixtures green; `RelationRollup.ts` and the two view copies untouched | `npx vitest run src/data/RelationInverse.test.ts`; empty inbound; cardinality-1 is still a list; dangling skipped; self-relation once |
| 002-rollup-inverse-resolution | 003-inverse-refresh-membership | After a local `relationField` miss, key-scoped inverse feeds `aggregateRollup`; inverse `sourcePaths` unioned into `targetPaths`; local relation still wins; unresolved inverse is `emptyRollupValue` | Report `count`/`list` over two Expenses with only forward `Month` links; no Report frontmatter relation; `types.ts` unchanged |
<!-- /ANCHOR:phase-map -->
