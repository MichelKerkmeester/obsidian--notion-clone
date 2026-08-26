---
title: "Verification Checklist: Derived Inverse (Safe Two-Way) Relations"
description: "Verification checklist for the planned read-only derived inverse of many-to-one wikilinks."
trigger_phrases:
  - "derived inverse checklist"
  - "inverse relations verification"
  - "syncwrites off checklist"
  - "writequeues single path"
  - "relationinverse evidence"
  - "icloud-safe inverse check"
  - "rollup inbound set"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations"
    last_updated_at: "2026-08-25T00:00:00Z"
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
# Verification Checklist: Derived Inverse (Safe Two-Way) Relations

> Edge cases and mobile/iCloud-safety checks from [`research/synthesis.md`](research/synthesis.md) §Edge cases & mobile/iCloud safety. Evidence trail: [`research/research.md`](research/research.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: `spec.md` REQ-001–REQ-008 describe stored-forward / derived-inverse, the two locked call sites (Hunk 1 `RelationRollup.ts` + Hunk 2 the two `buildRowsWithRelations` copies), key-scoped inverse resolution, `SYNC_WRITES_DEFAULT = false` (compile-time tripwire), and the gated-entry invariant (called inside the rollup loop only after the `:36` gate; never the sole entry that triggers `buildRelationRollups`).
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: `plan.md` architecture names `RelationInverse.ts`, the locked exports (including `sourceDatabaseIds`), the inverted-scan algorithm, Hunk 1 + Hunk 2 (refresh membership), and the EuroFormat-style *placement* (imports allowed).
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: forward relation scan readable in the fork (`RelationRollup.ts:24-88`); packet `001-live-reports-rollups` need **not** be complete (vault YAML only — no code dependency); at least one Expense `Month` wikilink exists for manual proof; vitest harness bootstrap planned, **shared with 007** (research confirmed `vitest.config.ts` includes `src/**/*.test.ts` but `src/` has zero test files and `src/__tests__/` is missing).

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: fork lint/format on `src/data/RelationInverse.ts`, Hunk 1 (`RelationRollup.ts`), and Hunk 2 (the two `buildRowsWithRelations` copies in `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts`, or a shared helper).
- [ ] CHK-011 [P0] No console errors or warnings [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: inverse render and relation click produce no new console errors.
- [ ] CHK-012 [P1] Error handling implemented [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: dangling wikilinks (`getFirstLinkpathDest` → null → `continue`, `src/data/RelationRollup.ts:71-72`) and cross-database misses (`:73-74`) return empty inbound sets without writes; unresolved inverse → `emptyRollupValue` (`:159-160`).
- [ ] CHK-013 [P1] Code follows project patterns [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: new isolated `src/data/` module plus Hunk 1 (`RelationRollup.ts`) and Hunk 2 (the two `buildRowsWithRelations` copies or a shared helper), matching the `EuroFormat.ts` *placement* model (imports allowed); `buildRelationInverse` is called inside the rollup loop only after the `:36` gate, never the sole entry that triggers `buildRelationRollups`.
- [ ] CHK-014 [P1] Mobile-safe APIs only [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: implementation uses only cross-platform Obsidian APIs (`metadataCache.getFirstLinkpathDest`, `workspace.openLinkText`, `setIcon`, DOM `createDiv`/`createEl`); no `electron` / `node:` / `fs` imports.
- [ ] CHK-015 [P2] Bounded inverse render window (DEFERRED) [EVIDENCE: pending]
  - **Evidence**: Pending. Deferred with T008/T019 — no chip surface this phase. Intended check (when waived): inverse chips render first N + "+M more" (N=25 default, matching Notion `has_more`); computation stays one O(edges) pass. This phase's `count`/`sum`/`avg` are cheap; `list` cells may be long but acceptable until T008.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: REQ-001–REQ-005 (single stored write, computed inverse, shared scan shape as gated entry, both call sites incl. refresh, iCloud-safe default).
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: Expense `Month` wikilink to Report; Report lists inbound Expenses via rollup `list`/`count` (rendered through `row.computed`, not chips); Report file not rewritten; empty `Month` → 0/`[]` and hide-when-empty automatic (`emptyRollupValue`); dangling wikilink omitted.
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check (from synthesis edge cases): empty relation → `[]` (`src/data/RelationLinks.ts:23-26`); cardinality-1 → list of sources; many-to-one → union; dangling → skip (`:71-72`); cross-database miss → skip (`:73-74`); multi-DB **same-key** fan-in (key-scoped union; different key is a separate rollup); self-relation → single appearance (`seenPaths` `:69-75`); duplicate wikilinks → dedupe; alias/`#` subpath → strip before resolve (`:15-19`). Round-trip: every forward edge the rollup scan would collect appears inverted (fixture a DB with rollup columns so `buildRelationRollups` does not early-return).
- [ ] CHK-023 [P1] Error scenarios validated [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: fail-closed if the rollup scan export is missing (no second scanner invented); `syncWrites` OFF has no ON path; concurrent clicks on different Expenses keep two `writeQueues` keys with the Report not a participant (`src/data/DataSource.ts:89,99-120`); view refresh while a source write is queued reads `getRecordsForDatabase` (`:229-232,239-244`) and never flushes repair writes to the target.
- [ ] CHK-024 [P1] Multi-DB same-key fan-in and cross-database targeting validated [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: inbound set is the **key-scoped** union across every database whose relation columns carry `column.key === config.relationField && column.relationConfig.targetDatabaseId === T.id` (`src/data/types.ts:34-37`); a different key (e.g. `Sales.Report`) is a separate rollup column, not included; stricter than Anytype's space-wide `backlinks` (`anytype-ts/src/ts/lib/util/object.ts:494`).
- [ ] CHK-024a [P1] Live refresh validated [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: with a Report view open, changing `Expenses.Month` to that Report updates the inverse `count` / `list` **without a manual refresh** — `handleDataChangeBatch` (`src/views/DatabaseView.ts:2120-2128`) refreshes because `sourceDatabaseIds` + `sourcePaths` are registered via Hunk 2 in both `buildRowsWithRelations` copies. Report file is not written.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-025 [P0] Requested derived-inverse module and call sites implemented [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: `src/data/RelationInverse.ts` exists with locked exports (`buildRelationInverse`, `RelationInverseContext`, `RelationInverseEdge`, `RelationInverseResult`, `sourceDatabaseIds`, `SYNC_WRITES_DEFAULT`); Hunk 1 — `RelationRollup.ts` resolves a missing `relationField` as a **key-scoped** inverse after the `:36` gate and feeds `aggregateRollup` (`:92-129`), unioning `sourcePaths` into `targetPaths` and returning `sourceDatabaseIds` (or equivalent) on `RelationRollupResult`; Hunk 2 — both `buildRowsWithRelations` copies register `sourceDatabaseIds` + `sourcePaths` for `handleDataChangeBatch` refresh. `RelationLinks.ts` chip helper is **deferred** (T006) — not shipped this phase.
- [ ] CHK-026 [P0] Display-only: inverse never writes the target [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: inverse is display-only (same class as rollups, `src/data/types.ts:69`); no `vault.*write*` / `processFrontmatter`; no extra `DataSource.writeQueues` work on view open (NFR-P02); `RelationInverse.ts` never joins the write queue; `SYNC_WRITES_DEFAULT` is a compile-time tripwire with no write branch.
- [ ] CHK-027 [P1] Stored two-way write-back left deferred [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: `SYNC_WRITES_DEFAULT = false` (compile-time tripwire); no ON path and no conflict policy ship this phase; target notes are not mirrored on write (no Notion `dual_property`).
- [ ] CHK-028 [P1] iCloud-safe single-path write proof [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: with `syncWrites` OFF, a relation click does not rewrite the Report — assert the Report file's mtime/content is unchanged and `processFrontmatter` / `vault.create` is not invoked for the Report path. `enqueueWrite` is private (`src/data/DataSource.ts:99`) — do **not** export it; spy `processFrontmatter` / `vault.create` instead. Plugin writes credited via `ownedPathUntil` (`:81-84,246-249`).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: inverse module and call sites contain no credentials, tokens, or telemetry endpoints.
- [ ] CHK-031 [P0] Input validation implemented [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: missing targets / empty relations do not create files or evaluate untrusted formula text; inverse does not widen `SafeEval.ts`.
- [ ] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: pending]
  - **Evidence**: Pending. Not applicable to local vault markdown; record N/A with evidence after confirming no new network/auth surface.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: `spec.md`, `plan.md`, and `tasks.md` all describe the derived inverse, Hunk 1 (`RelationRollup.ts`) + Hunk 2 (the two `buildRowsWithRelations` copies for refresh), the gated-entry invariant (called inside the rollup loop only after the `:36` gate; never the sole entry that triggers `buildRelationRollups`), key-scoped resolution, `sourceDatabaseIds`, and `SYNC_WRITES_DEFAULT = false` (compile-time tripwire). Chip helper + window deferred.
- [ ] CHK-041 [P1] Code comments adequate [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: comments state durable WHY (do not rewrite the target note / do not dual-queue iCloud / do not be the sole entry that triggers `buildRelationRollups` / why refresh membership is in-scope); no spec-path or requirement-id comments.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Pending. Defer unless the fork README already documents relation storage; do not add a README for this module by default.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: no task-created temp files outside scratch; plugin diff stays under `src/data/` (plus `src/views/RecordDetailPanel.ts` only on waiver).
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: pending]
  - **Evidence**: Pending. Intended check: this phase folder and the fork tree contain no leftover scratch output from inverse work.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 15 | 0/15 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Pending
**Verified By**: Pending

<!-- /ANCHOR:summary -->
