---
title: "Implementation Plan: Derived Inverse (Safe Two-Way) Relations"
description: "Implementation plan for computing read-only inverse relations from stored forward wikilinks without dual-file iCloud churn."
trigger_phrases:
  - "derived inverse plan"
  - "relationinverse module"
  - "inverse call sites"
  - "syncwrites default off"
  - "icloud-safe inverse"
  - "relation rollup invert"
  - "euroformat isolated diff"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown-agent"
    recent_action: "Compacted continuity fields after final-plan findings applied to docs"
    next_safe_action: "Resolve operator decisions then build phase 008 per plan and tasks"
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
# Implementation Plan: Derived Inverse (Safe Two-Way) Relations

> Locked design from [`research/synthesis.md`](research/synthesis.md) §Recommended build. Evidence trail: [`research/research.md`](research/research.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript Obsidian plugin (MIT note-database fork) |
| **Framework** | Fork at `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`; imitate the isolated `EuroFormat.ts` diff (`src/data/EuroFormat.ts:1-10`) |
| **Storage** | Forward many-to-one wikilinks in markdown only; inverse is derived in memory (display-only, same class as rollups, `src/data/types.ts:69`) |
| **Testing** | Bootstrap vitest this phase, **shared with 007**: if 007 already added `src/__tests__/setup.ts`, 008 only adds `src/data/RelationInverse.test.ts` (and optionally `"test": "vitest run"`); otherwise add the empty setup file. `enqueueWrite` is private (`DataSource.ts:99`), so write-path tests spy `processFrontmatter` / `vault.create` or assert the Report file mtime/content is unchanged — `enqueueWrite` is not exported. |

### Overview
Wave 4, effort M (~8h), value 4. This phase adds `src/data/RelationInverse.ts` so a Report can list inbound Expenses without storing Notion's mirrored second property (`dual_property`). It does **not** wait on packet `001-live-reports-rollups` — that packet is vault YAML only ("no new `src/` module, no fork TypeScript") and the forward relation scan already exists in the fork; 001's product move (storing Reports-side relation columns) is exactly what 008 makes unnecessary. The module inverts the scan `RelationRollup.ts` already runs for display-only `count` / `sum` / `avg` / `list`. Two locked call-site hunks: **Hunk 1** `RelationRollup.ts` (key-scoped inverse resolution rule for rollups) and **Hunk 2** the two `buildRowsWithRelations` copies in `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts` (refresh membership so live Report views stay current). The inverse chip helper in `RelationLinks.ts` and the bounded chip window are **deferred** — under the rollup-only default, rollup `list`/`count` render through `row.computed` as ordinary rollup cells, not relation chips, so they have no consumer this phase. `SYNC_WRITES_DEFAULT = false` lives on the new module as a compile-time tripwire (zero `types.ts` touch, no write branch). The result is rebase-friendly: one new `src/data/` file and two call-site hunks (a third, `RecordDetailPanel.ts`, ships only on an explicit operator waiver).

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Forward relation scan confirmed readable in the fork (`RelationRollup.ts:24-88`); packet `001-live-reports-rollups` need **not** be complete (it is vault YAML only — no code dependency). For manual proof only, at least one Expense `Month` wikilink exists in the vault.
- [ ] Operator decisions resolved (spec §10 open questions 1–7), in particular the SC-002 surface (rollup-only vs `RecordDetailPanel.ts` waiver) and the verification-harness bootstrap (shared with 007).
- [ ] Scope locked to derived inverse: no stored back-property, no `syncWrites` ON path, no `types.ts` change, no `RollupConfig` shape change; inverse chip helper + chip window deferred.
- [ ] Isolated-diff budget agreed: new `src/data/RelationInverse.ts` plus Hunk 1 (`RelationRollup.ts`) and Hunk 2 (the two `buildRowsWithRelations` copies or a shared helper; EuroFormat *placement*); third hunk only on waiver.

### Definition of Done
- [ ] `RelationInverse.ts` computes read-only fan-in inbound sets from stored forward wikilinks; `buildRelationInverse` is called from inside the rollup loop only after the `:36` gate passes and a `relationField` misses locally (never the sole entry that triggers `buildRelationRollups`).
- [ ] `RelationRollup.ts` resolves a missing `relationField` as a **key-scoped** inverse and feeds inbound records to existing `aggregateRollup`; the two `buildRowsWithRelations` copies register `sourceDatabaseIds` + `sourcePaths` so `handleDataChangeBatch` refreshes live Report views.
- [ ] `SYNC_WRITES_DEFAULT = false` (compile-time tripwire, no write branch); a relation click queues one path in `DataSource.writeQueues`; the Report is not a write participant.
- [ ] Checklist evidence recorded from real commands/files; `validate.sh --strict` passes with zero errors and zero warnings.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated `src/data/` module, same rebase *placement* as the nl-NL `EuroFormat.ts` override (`src/data/EuroFormat.ts:1-10`): new file owns the behavior; call sites gain a few imports/usages; upstream hunks stay small. No plugin hooks, no writes, no class. Unlike `EuroFormat.ts` (zero imports), `RelationInverse.ts` imports `App`, `parseRelationValues`, and types (`ColumnDef`/`DatabaseConfig`, `NoteRecord`) — the isolation is the file boundary and small call sites, not zero imports.

Notion two-way = second stored property + write fan-out (`dual_property`). This fork two-way = **derived inverse**. Source of truth is the many-to-one wikilink (`Expenses.Month -> Report`). The back-reference (`Report -> Expenses`) is computed. Rollups remain display-only (`src/data/types.ts:69`). `DataSource.writeQueues` stays per-path and, on the default path, sees only the edited Expense.

### Locked Module: `src/data/RelationInverse.ts`
EuroFormat-style *placement*: durable-WHY header, no plugin hooks, no writes, no class. Declare `export const SYNC_WRITES_DEFAULT = false` on this module (zero `types.ts` touch) as a compile-time tripwire — no write branch reads it.

**Exports (locked):**
- `RelationInverseContext { app, databases, getRecordsForDatabase }` — same `databases[]` + cache closure as `RelationRollupContext` (`src/data/RelationRollup.ts:10-16`), but **no** `sourceDatabase` / `sourceRecords` (fan-in is all DBs).
- `RelationInverseEdge { sourceDatabase, relationColumn, sourceRecord }`.
- `RelationInverseResult { inboundByPath: Map<string, RelationInverseEdge[]>, sourcePaths: Set<string> }`.
- `buildRelationInverse(context): RelationInverseResult`.
- `sourceDatabaseIds: Set<string>` — DBs that contributed edges, exported so the two `buildRowsWithRelations` copies can register them for `handleDataChangeBatch` refresh (Hunk 2).

**Algorithm (same scan as `buildRelationRollups`, inverted — REQ-003 / NFR-P01):**
1. Fan-in index: for every DB in `context.databases`, collect columns where `column.type === "relation" && column.relationConfig?.targetDatabaseId` (identical filter: `src/data/RelationRollup.ts:28-32`), grouped by that id.
2. For target DB `T`, for each source `(db, column)` with `targetDatabaseId === T.id`, iterate `getRecordsForDatabase(db)` (in-memory only: `src/data/DataSource.ts:229-232`).
3. Per source record: `parseRelationValues(record.frontmatter[column.key])` (`src/data/RelationLinks.ts:23-26`) → `app.metadataCache.getFirstLinkpathDest(link.target, record.file.path)` (`src/data/RelationRollup.ts:71`) → skip `null` (dangling) → per-record `seenPaths` dedupe (`:69-75`) → membership against `T`'s `recordsByPath` (`:50-56,73-74`) → append the edge to `inboundByPath.get(resolved.path)`.
4. `buildRelationInverse` is called from inside the rollup loop only after `buildRelationRollups` has passed its `:36` gate (viewed DB has rollup columns) and a specific `relationField` misses locally. It is never the sole entry that triggers rollups, and `buildRelationRollups` is never called from the inverse (the early-return trap at `:36`). One pass over fan-in edges; no second vault walk; no `vault.*write*` / `processFrontmatter`.

### Locked Call Sites (2 of 3 hunks — EuroFormat budget)
1. **`src/data/RelationRollup.ts`** (Hunk 1) — inside `buildRelationRollups`, after the `:36` gate has passed and `relationColumns.get(config.relationField)` misses, resolve `relationField` as a **key-scoped** inverse: columns in `context.databases` with `column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === context.sourceDatabase.id`. Build the inbound `NoteRecord[]` for the current `sourceRecord` from `inboundByPath.get(sourceRecord.file.path)` filtered to that relation key (or compute that slice lazily). Feed to existing `aggregateRollup` (`:92-129`). Union inverse `sourcePaths` into `targetPaths` (`:21,76`) so the existing `relationTargetPaths` assignment (`DatabaseView.ts:3362`) sees Expense paths. Return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` (`:18-22`) so Hunk 2 can register the Expenses database. Do not add aggregation kinds. Do not change `RollupConfig` shape (`src/data/types.ts:39-45`); extend the *resolution rule* only. Local relation always wins if the key exists on the viewed DB. Fail-closed: unresolved inverse → `emptyRollupValue` (`:159-160`), never a second scanner.
2. **`src/views/DatabaseView.ts` + `src/views/EmbeddedDatabaseRenderer.ts`** (Hunk 2 — refresh membership) — today `relationTargetDatabases` is only local relation *targets* (`DatabaseView.ts:3363-3368` / `EmbeddedDatabaseRenderer.ts:3212-3218`). After inverse rollups, also include databases in `sourceDatabaseIds` (Expenses) and their `sourcePath`s in `relationTargetDatabasePaths`. That makes `handleDataChangeBatch` (`DatabaseView.ts:2120-2128`) refresh Reports when an Expense is created, retargeted, or edited — including first-time `Month` links whose paths were not in the previous `targetPaths` set. Prefer a tiny shared helper next to `buildRelationInverse` so the two view copies do not diverge. Do **not** edit `planRelationTargetChange.ts` unless a relation *targetDatabaseId* change on Expenses must drop stale Report rollups; if needed, that is a one-line consumer, not a new planner.

**Third hunk:** leave unused unless the operator approves synthesis item 6 (`RecordDetailPanel.ts` trailing "Backlinks" section, hide when empty). `SYNC_WRITES_DEFAULT` lives on the new module, so no type/config file. The inverse chip helper in `RelationLinks.ts` and the bounded chip window (N=25) are **deferred** with T019/T020 — no chip surface this phase.

### Write Invariant
Relation edits keep flowing through `DataSource.enqueueWrite` keyed by the edited path (`src/data/DataSource.ts:89,99-120`; `mutateFrontmatter` at `:288-296`). `PropertyService.processFrontmatter` already delegates to that queue (`src/data/PropertyService.ts:181-188`; wired from `DatabaseView.ts:498-504`). `RelationInverse.ts` never joins the queue. `enqueueWrite` is private (`:99`), so write-path tests spy `processFrontmatter` / `vault.create` or assert the Report file mtime/content is unchanged — `enqueueWrite` is not exported.

### Data Flow
1. User sets a many-to-one wikilink on the source note. Markdown write is queued for that path only (`DataSource.enqueueWrite`).
2. `buildRelationInverse` runs on the same cadence as rollups: fan-in over every DB whose relation columns target `T`, in-memory only.
3. `RelationRollup.ts` resolves a missing `relationField` as a key-scoped inverse and feeds inbound records to `aggregateRollup`; inverse `sourcePaths` are unioned into `targetPaths` and `sourceDatabaseIds` (or equivalent) is returned on `RelationRollupResult`.
4. The two `buildRowsWithRelations` copies register `sourceDatabaseIds` + `sourcePaths` so `handleDataChangeBatch` refreshes live Report views when an Expense changes — no manual reload.
5. No write to the target. Chip bounding (first N + "+M more", N=25) is deferred with the chip surface.
6. If `syncWrites` is ever enabled later, that path would mirror onto the target (deferred; Notion `dual_property`). This phase never takes that branch.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm the forward relation scan is readable in the fork (`RelationRollup.ts:24-88`); packet `001-live-reports-rollups` need not be complete (vault YAML only — no code dependency). For manual proof, confirm at least one Expense `Month` wikilink exists in the vault.
- [ ] Read `RelationRollup.ts` (`:10-16,18-22,28-32,36,50-56,69-75,92-129`), `RelationLinks.ts` (`:1-31`), `DataSource.ts` (`:89,99-120,229-232,288-296`), `types.ts` (`:34-45,69`), `DatabaseView.ts` (`:2101-2140,3348-3401`), and `EmbeddedDatabaseRenderer.ts` (`:3190-3221`); scan/export names and refresh sets are confirmed by research, not assumed.
- [ ] Resolve operator decisions (spec §10): SC-002 surface, chip window N, label, sort order, verification-harness bootstrap (shared with 007), `syncWrites` OFF.
- [ ] Confirm the EuroFormat isolated-diff *placement* under `src/data/`; lock `SYNC_WRITES_DEFAULT = false` on the new module as a compile-time tripwire.

### Phase 2: Core Implementation
- [ ] Add `src/data/RelationInverse.ts`: fan-in index + `buildRelationInverse` reusing the same resolver/dedupe/membership shape; read-only; `SYNC_WRITES_DEFAULT = false` (compile-time tripwire); export `sourceDatabaseIds`; no class, no writes. Imports allowed: `App`, `parseRelationValues`, types, `NoteRecord`.
- [ ] Hunk 1 — `RelationRollup.ts`: after the `:36` gate passes and `relationColumns.get(config.relationField)` misses, resolve `relationField` as a **key-scoped** inverse and feed inbound records for the current `sourceRecord` to existing `aggregateRollup`. Union inverse `sourcePaths` into `targetPaths`. Return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult`. No new aggregation kinds; no `RollupConfig` shape change. Local relation always wins.
- [ ] Hunk 2 — `DatabaseView.ts` + `EmbeddedDatabaseRenderer.ts`: register `sourceDatabaseIds` + `sourcePaths` from Hunk 1's `RelationRollupResult` (or equivalent) into `relationTargetDatabases` / `relationTargetDatabasePaths` in both `buildRowsWithRelations` copies (prefer a shared helper next to `buildRelationInverse`) so `handleDataChangeBatch` refreshes live Report views when an Expense changes.
- [ ] Hunk 3 (only on operator waiver) — `RecordDetailPanel.ts`: additive trailing "Backlinks" section, hide-when-empty; do not change `renderRelationValue`'s signature.
- [ ] Do **not** ship the inverse chip helper (`RelationLinks.ts`) or the bounded chip window this phase — deferred with T019/T020 (no chip surface under the rollup-only default).
- [ ] Keep comments to durable WHY only (why the inverse must not rewrite the target / must not be the sole entry that triggers `buildRelationRollups` / why refresh membership is in-scope). No spec-path or requirement-id comments.

### Phase 3: Verification
- [ ] Bootstrap vitest, shared with 007: if 007 already added `src/__tests__/setup.ts`, only add `src/data/RelationInverse.test.ts` (and optionally `"test": "vitest run"`); otherwise add the empty setup file.
- [ ] Prove one stored write per relation click: assert the Report file mtime/content is unchanged and `processFrontmatter` / `vault.create` is not invoked for the Report path (`enqueueWrite` is private — do not export it).
- [ ] Prove Report inbound list matches stored Expense → Report wikilinks, including empty, dangling, cross-database miss, multi-DB same-key fan-in, and self-relation cases; round-trip every forward edge the rollup scan would collect appears inverted (fixture a DB that *has* rollup columns so `buildRelationRollups` does not early-return).
- [ ] Prove live refresh: with a Report view open, changing `Expenses.Month` to that Report updates the inverse `count` without a manual refresh.
- [ ] Confirm no desktop-only APIs (`electron` / `node:` / `fs`) and no telemetry; `git diff --stat` is `RelationInverse.ts` + `RelationRollup.ts` + the two `buildRowsWithRelations` copies (or a shared helper).
- [ ] Record evidence in `checklist.md` / `implementation-summary.md` from observed commands (not before).

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Inverse of a known forward-edge set: empty, cardinality-1, many-to-one, dangling wikilink, cross-database miss, multi-DB same-key fan-in, self-relation, duplicate wikilinks, alias/`#` strip; round-trip (every forward edge the rollup scan would collect appears inverted; fixture a DB with rollup columns so `buildRelationRollups` does not early-return) | `vitest` (`src/data/RelationInverse.test.ts`; `setupFiles: ["src/__tests__/setup.ts"]`, shared with 007) |
| Integration | `RelationRollup.ts` `count` / `list` over derived inbound Expenses for one Report via `aggregateRollup` (no `RelationLinks.ts` chip helper this phase — rollup cells render via `row.computed`) | `vitest`; fixtures with only forward wikilinks stored |
| Refresh | With a Report view open, changing `Expenses.Month` to that Report updates the inverse `count` without a manual refresh (`handleDataChangeBatch` sees `sourceDatabaseIds` + `sourcePaths`) | `vitest` / manual |
| Write-path | Relation click does not rewrite the Report; `SYNC_WRITES_DEFAULT = false`; `RelationInverse.ts` contains no write APIs | `vitest` spying `processFrontmatter` / `vault.create` (not `enqueueWrite` — it is private) or asserting Report file mtime/content unchanged |
| Regression | Formula engines, column types, view types, footers, charts untouched | Diff review: only `RelationInverse.ts` + `RelationRollup.ts` + the two `buildRowsWithRelations` copies (or a shared helper) |
| Strict packet | This phase folder | `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh specs/public/001-note-db-notion-parity-build/008-derived-inverse-relations --strict` |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-live-reports-rollups` | Internal phase (vault YAML only) | Need not be complete — **no code dependency** | None for code; manual proof needs an Expense `Month` wikilink in the vault. If 001 stored a local `Month` column, local relation wins and inverse is unused — correct, not a conflict |
| `RelationRollup.ts` scan (`:24-88`) | Fork module | Confirmed by research | Cannot implement inverse without inventing a second walker |
| `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts` `buildRowsWithRelations` (`:3348-3372` / `:3190-3221`) | Fork module | Confirmed by research | Hunk 2 refresh membership cannot wire `handleDataChangeBatch` without these |
| `DataSource.writeQueues` per-path queues (`:89,99-120`) | Fork constraint | Confirmed by research | Dual writes would churn two iCloud notes |
| `RelationConfig.targetDatabaseId` (`types.ts:34-37`) | Fork config | Confirmed by research | Cross-database fan-in would be wrong |
| `vitest.config.ts` + `src/__tests__/setup.ts` | Fork test harness | Missing (bootstrap this phase, shared with 007) | SC-001 spy and SC-002/003 fixtures cannot run |
| Stored two-way write-back (`syncWrites` ON) | Deferred | Blocked (REQ-006) | Must not block this phase; do not implement the ON path |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Inverse writes a target note, dual-queues `writeQueues`, duplicates the vault scan, is the sole entry that triggers `buildRelationRollups` (silently no-ops via the `:36` early-return), drops Hunk 2 refresh (stale inbound counts), or the diff spills beyond the isolated `src/data/` budget.
- **Procedure**: Remove `src/data/RelationInverse.ts` and revert Hunk 1 in `RelationRollup.ts` and Hunk 2 in the two `buildRowsWithRelations` copies (plus the third hunk in `RecordDetailPanel.ts` if waived in). Forward wikilinks remain valid; there is no stored back-property to strip.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | Forward scan readable in fork + operator decisions (no 001 wait) | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1 hour |
| Core Implementation | Medium | 5 hours |
| Verification | Medium | 2 hours |
| **Total** | **M** | **8 hours** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Forward-only storage confirmed; no mirrored property added to Report templates.
- [ ] `SYNC_WRITES_DEFAULT = false` confirmed in the shipped module as a compile-time tripwire; no ON path, no write branch.
- [ ] Diff limited to `RelationInverse.ts` + Hunk 1 (`RelationRollup.ts`) + Hunk 2 (the two `buildRowsWithRelations` copies or a shared helper); third hunk only on waiver.
- [ ] `buildRelationInverse` is called from inside the rollup loop only after the `:36` gate; never the sole entry that triggers `buildRelationRollups`.
- [ ] Hunk 2 refresh membership wired so `handleDataChangeBatch` refreshes live Report views (no stale inbound counts).
- [ ] Packet metadata files (`description.json`, `graph-metadata.json`) left to tooling.

### Rollback Procedure
1. Delete `src/data/RelationInverse.ts`.
2. Revert Hunk 1 in `RelationRollup.ts` and Hunk 2 in the two `buildRowsWithRelations` copies (`DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts`, or the shared helper).
3. Revert the `RecordDetailPanel.ts` hunk if it was waived in.
4. Re-run the fork's `vitest` suite and the single-path write proof.
5. Views fall back to forward links only; Reports simply stop listing derived Expenses.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A. Inverse is not persisted. Source notes already store the many-to-one wikilink; no back-link YAML to remove.

<!-- /ANCHOR:enhanced-rollback -->
