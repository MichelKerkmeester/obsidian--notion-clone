---
title: "Tasks: Derived Inverse (Safe Two-Way) Relations"
description: "Task list for adding a read-only derived inverse of many-to-one wikilinks without dual markdown writes."
trigger_phrases:
  - "derived inverse tasks"
  - "relationinverse tasks"
  - "wire relation rollup inverse"
  - "wire relation links inverse"
  - "syncwrites off task"
  - "single path writequeues"
  - "isolated src/data module"
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
# Tasks: Derived Inverse (Safe Two-Way) Relations

> Ranked backlog from [`research/synthesis.md`](research/synthesis.md) §Ranked backlog. Evidence trail: [`research/research.md`](research/research.md). Fork-relative paths resolve under `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred |

**Task Format**: `T### [P?] Description (file path:line) [effort S/M/L]`

Effort tiers: **S** ≈ ≤2h, **M** ≈ ~8h total phase, **L** ≈ multi-phase later.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm the forward relation scan is readable in the fork (`RelationRollup.ts:24-88`); packet `001-live-reports-rollups` need **not** be complete — it is vault YAML only ("no new `src/` module, no fork TypeScript"), so there is **no code dependency**. For manual proof only, confirm at least one Expense `Month` wikilink exists in the vault. (`specs/public/001-note-db-notion-parity-build/001-live-reports-rollups/`) [S] -- DEFERRED: source scan exists, but no vault fixture/manual wikilink proof is present in the repository
- [x] T002 Read the confirmed scan/export/refresh contracts before coding: `RelationRollup.ts:10-16,18-22,28-32,36,50-56,69-75,92-129`; `RelationLinks.ts:1-31`; `DataSource.ts:89,99-120,229-232,288-296`; `types.ts:34-45,69`; `DatabaseView.ts:2101-2140,3348-3401`; `EmbeddedDatabaseRenderer.ts:3190-3221` (research-confirmed in `research/synthesis.md`; do not assume) [S] -- done during build
- [x] T003 Resolve operator decisions (spec §10 open questions 1–7): SC-002 surface, inverse resolution rule, chip window N, label, sort order, verification-harness bootstrap (shared with 007), `syncWrites` OFF [S] -- done during build

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Tasks follow the final build plan (`research/final-plan.md`): items 1–2, 7–8 in this phase's budget; the chip helper (ranked item 3), chip window (ranked item 5), record-page section (item 6), table badge (item 9), and `syncWrites` ON (item 10) are deferred — see Deferred below.

### Core Documents
- [x] T004 **Ranked item 1 — Derived inverse fan-in index.** Create `src/data/RelationInverse.ts` (EuroFormat-style *placement*, `src/data/EuroFormat.ts:1-10` — but imports **are** allowed: `App`, `parseRelationValues`, types, `NoteRecord`): `buildRelationInverse` fan-in over every DB whose relation columns carry `relationConfig.targetDatabaseId === T.id`; reuse the resolver/dedupe/membership shape from `src/data/RelationRollup.ts:24-88`. Export `sourceDatabaseIds` (DBs that contributed edges) for refresh. `buildRelationInverse` is called from inside the rollup loop only after the `:36` gate passes and a `relationField` misses locally — never the sole entry that triggers `buildRelationRollups`, and `buildRelationRollups` is never called from the inverse. **No code dependency on 001.** (`src/data/RelationInverse.ts`) [M] -- RelationInverse.ts:39-86 (`buildRelationInverse`, `sourceDatabaseIds`)
- [x] T005 **Ranked item 2 — Rollup-over-inverse (Hunk 1).** In `buildRelationRollups`, after the `:36` gate passes and `relationColumns.get(config.relationField)` misses (`src/data/RelationRollup.ts:62-66`), resolve `relationField` as a **key-scoped** inverse — columns in `context.databases` with `column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === sourceDatabase.id` — build the inbound `NoteRecord[]` for the current `sourceRecord` from `inboundByPath`, and feed to existing `aggregateRollup` at `:92-129`. Union inverse `sourcePaths` into `targetPaths` (`:21,76`) so `relationTargetPaths` sees Expense paths. Return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` (`:18-22`) so T009 can register the Expenses database. No new aggregation kinds; no `RollupConfig` shape change (`src/data/types.ts:39-45`). Local relation always wins if the key exists. Depends on T004. (`src/data/RelationRollup.ts:58-88,92-129`) [S] -- RelationRollup.ts:69-127 (key-scoped inverse, aggregateRollup, sourceDatabaseIds)

### Verification Documents
- [x] T007 **Ranked item 4 — Hide-when-empty inbound surface.** Inherited, not newly built: under the rollup-only default, rollup `list`/`count` render through `row.computed[col.key]` as ordinary rollup cells (`src/views/CellRenderer.ts:115-116,656`), and empty inverse → `emptyRollupValue` (`:159-160`) → hide-when-empty is automatic. No placeholder rows, no file touch (`parseRelationValues` at `src/data/RelationLinks.ts:23-26`). Depends on T005 only (no chip helper this phase). (display consumers) [S] -- CellRenderer.ts:147-148; RelationRollup.ts:79,103,225-226
- [x] T009 **Hunk 2 — Refresh membership (was "no new plumbing"; corrected by review).** In both `buildRowsWithRelations` copies (`src/views/DatabaseView.ts:3348-3372` and `src/views/EmbeddedDatabaseRenderer.ts:3190-3221`), after inverse rollups, include databases in `sourceDatabaseIds` from T005's `RelationRollupResult` (or equivalent; Expenses) and their `sourcePath`s in `relationTargetDatabasePaths` so `handleDataChangeBatch` (`DatabaseView.ts:2120-2128`) refreshes Reports when an Expense is created, retargeted, or edited — including first-time `Month` links. A Report with only rollup columns has zero local relations, so without this hunk `relationTargetPaths` / `relationTargetDatabases` stay empty and stale inbound counts are the silent failure mode. Prefer a tiny shared helper next to `buildRelationInverse` so the two view copies do not diverge. Do not edit `planRelationTargetChange.ts` unless a `targetDatabaseId` change on Expenses must drop stale Report rollups (then a one-line consumer, not a new planner). Depends on T004–T005. (`src/views/DatabaseView.ts`, `src/views/EmbeddedDatabaseRenderer.ts`) [S] -- DatabaseView.ts:3431-3442; EmbeddedDatabaseRenderer.ts:3257-3268
- [x] T010 **Ranked item 8 — Self-relation reverse index.** Falls out of T004: reverse index of stored edges, not a recursive expander; a self-link appears once (fork dedupe `seenPaths` at `src/data/RelationRollup.ts:69-75`). Depends on T004. (none beyond T004) [S] -- RelationInverse.ts:66-81; RelationInverse.test.ts:193-206
- [x] T011 Declare `SYNC_WRITES_DEFAULT = false` on `src/data/RelationInverse.ts` (zero `types.ts` touch) as a compile-time tripwire — no write branch reads it; no ON path, no conflict policy. (`src/data/RelationInverse.ts`) [S] -- RelationInverse.ts:14; RelationInverse.test.ts:248-250

### Integration
- [x] T012 Leave packet `description.json` / `graph-metadata.json` untouched (tooling-owned; not in this folder's hand edits) [S] -- done during build

### Deferred / Blocked (Ranked items not in this phase's budget)
- [B] T006 **Ranked item 3 — Read-only inverse chip contract (DEFERRED).** Export a helper in `src/data/RelationLinks.ts` mapping inverse edges → `ParsedRelationLink` + label via `getRelationDisplayLabel` at `:29-31`; strip `|` alias and `#` subpath with the existing parser at `:15-19`. Rendering stays `renderRelationValue` (`src/views/RelationValueRenderer.ts:7-37`); inverse click passes the **source** record's path. **No consumer this phase** — under the rollup-only default, rollup cells render via `row.computed`, not chips. Defer with T019/T020; bind chips at the panel with N=25 when the record-panel waiver lands. Depends on T004 + T019 waiver. (`src/data/RelationLinks.ts:1-31`) [S]
- [B] T008 **Ranked item 5 — Bounded inverse render window (DEFERRED).** Bound the chip render to first N + "+M more" (N=25 default, matching Notion `has_more`); computation stays one O(edges) pass. **No chip surface this phase** — defer with T006/T019. `count`/`sum`/`avg` are cheap; `list` cells may be long but acceptable until T008. Depends on T006 + T019 waiver. (whichever surface renders inverse chips) [S]
- [B] T019 **Ranked item 6 — Record-page inbound section.** Additive trailing "Backlinks" section in `src/views/RecordDetailPanel.ts:320-323`, hide-when-empty; do not change `renderRelationValue`'s signature. Out of the spec file budget until the operator expands SC-005 (open question 1). When waived: label **Backlinks**, N=**25**, sort by `getRelationDisplayLabel` at display time. Depends on T004, T006, and an explicit budget waiver. (`src/views/RecordDetailPanel.ts`) [S]
- [B] T020 **Ranked item 9 — Table-cell inbound badge ("↩ N").** Notion does not show inbound counts on table cells unless two-way is on; AppFlowy grid cells show only forward chips (`appflowy_flutter/.../desktop_grid_relation_cell.dart:15-110`). Defer to keep SC-005. Depends on T004. (`src/views/CellRenderer.ts`) [S]
- [B] T021 **Ranked item 10 — Stored two-way write-back (`syncWrites` ON / Notion `dual_property`).** Blocked this phase (REQ-006). Would touch `src/data/DataSource.ts:89,99-120,288-296` plus the target note; needs a later phase and a conflict policy that does not exist. Depends on an explicit later phase. [L]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Test Harness Bootstrap
- [x] T013 Bootstrap vitest, **shared with 007**: if 007 already added `src/__tests__/setup.ts`, 008 only adds `src/data/RelationInverse.test.ts` (and optionally `"test": "vitest run"` to `package.json`); otherwise add the empty `src/__tests__/setup.ts`. Do not treat `package.json` as a feature call site. (research confirmed `vitest.config.ts` includes `src/**/*.test.ts` and `setupFiles: ["src/__tests__/setup.ts"]` but `src/` has zero test files and `src/__tests__/` is missing today) [S] -- vitest.config.ts:5-7; src/__tests__/setup.ts:1; RelationInverse.test.ts:1

### Unit Tests
- [x] T014 Cover inverse cases: empty, cardinality-1 (inverse is still a **list**), many-to-one, dangling wikilink (`getFirstLinkpathDest` → null → `continue`, `src/data/RelationRollup.ts:71-72`), cross-database miss (`:73-74`), multi-DB **same-key** fan-in (key-scoped union; a different key is a separate rollup), self-relation once, duplicate wikilinks (`seenPaths` `:69-75`), alias/`#` subpath (`src/data/RelationLinks.ts:15-19`). Round-trip: every forward edge the rollup scan would collect appears inverted (fixture a DB that *has* rollup columns so `buildRelationRollups` does not early-return). (`src/data/RelationInverse.test.ts`) [S] -- RelationInverse.test.ts:91-335 (12 cases)

### Integration Tests
- [ ] T015 Prove a relation click does not rewrite the Report: assert the Report file mtime/content is unchanged and `processFrontmatter` / `vault.create` is not invoked for the Report path. `enqueueWrite` is private (`src/data/DataSource.ts:99`) — do **not** export it; spy `processFrontmatter` / `vault.create` instead. `SYNC_WRITES_DEFAULT === false`; `RelationInverse.ts` contains no write APIs. [S] -- DEFERRED: no mtime or write-spy integration test was shipped; write safety is structural only
- [x] T016 Prove Report `count` / `list` rollup over derived inbound Expenses matches stored forward wikilinks via `aggregateRollup` (`src/data/RelationRollup.ts:92-129`); inverse `count === 2` / `list` contains both Expenses; result includes Expenses in `sourceDatabaseIds` (or equivalent) on `RelationRollupResult`. [S] -- RelationInverse.test.ts:252-281
- [ ] T016a Prove live refresh: with a Report view open, changing `Expenses.Month` to that Report updates the inverse `count` without a manual refresh (`handleDataChangeBatch` sees `sourceDatabaseIds` + `sourcePaths` via Hunk 2). [S] -- DEFERRED: no live-view integration test or recorded runtime proof was shipped

### Manual Verification
- [ ] T017 On mobile-safe APIs only (`metadataCache.getFirstLinkpathDest`, `workspace.openLinkText`, `setIcon`, DOM `createDiv`/`createEl`; no `electron` / `node:` / `fs`), confirm a Report lists inbound Expenses from stored `Month` wikilinks with no second file dirtying; empty `Month` → 0/`[]` and hide-when-empty is automatic (`emptyRollupValue`); dangling wikilink omitted. Grep the diff for `electron` / `node:` / `fs` / telemetry. (fork running in Obsidian) [S] -- DEFERRED: no Obsidian runtime proof was produced; source grep alone is insufficient

### Documentation
- [x] T018 Record observed evidence in `checklist.md` and `implementation-summary.md` after commands pass (`specs/public/001-note-db-notion-parity-build/008-derived-inverse-relations/checklist.md`) [S] -- checklist.md:60-65,92-103; implementation-summary.md:76-83

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All non-deferred tasks marked `[x]`. -- task status reconciliation leaves only documented proof gaps and backlog deferrals
- [x] No `[B]` blocked tasks remaining except the explicitly deferred T006, T008, T019–T021 (operator-approved deferral: chip helper, chip window, record-page section, table badge, `syncWrites` ON). -- no unexpected blocked entries remain
- [x] Strict validation passed: `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh specs/public/001-note-db-notion-parity-build/008-derived-inverse-relations --strict` → `Summary: Errors: 0  Warnings: 0`. -- validator exit 0
- [ ] Checklist.md fully verified. -- DEFERRED: checklist contains pending evidence rows and cannot be edited in this dispatch

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research Synthesis**: See [`research/synthesis.md`](research/synthesis.md)
- **Research Evidence Trail**: See [`research/research.md`](research/research.md)

<!-- /ANCHOR:cross-refs -->
