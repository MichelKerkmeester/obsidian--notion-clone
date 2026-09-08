---
title: "Tasks: iOS view data regression"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "070 tasks"
  - "ios property read tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: iOS View Data Regression

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Build a fixture vault mirroring the operator's real shapes (synthetic values): a Finance-shaped table (currency/text/date-sort columns) and a Testbed-shaped board (checkbox/number columns) — inlined in `tools/live/database-cold-cache-property-read.mjs` rather than a separate `fixtures/` folder, since the fixture is only ever consumed by this one script
- [x] T002 [P] Add a cold-cache harness scenario that boots the headless renderer against a fresh `data.json` before the metadata cache has resolved every file — `table-cold-never-resolves`/`table-poisoned-by-early-view-def-scan`/`board-poisoned-by-early-view-def-scan`
- [x] T003 [P] Add a warm-cache harness scenario as the comparison case — `table-warm-from-start`
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Reproduce the empty-property read against both fixtures, cold cache first; confirmed red before any fix (`COLD_CACHE_EXPECT=pre-fix-red node tools/live/database-cold-cache-property-read.mjs`: 0/18 table cells, 0/8 board cells, single "no value" group)
- [x] T005 Traced the read path in `src/data/data-source.ts`; confirmed as root cause — not `parseViewConfig`/`toViewPayload` as originally suspected, but `getViewDefFiles()`'s eager record-cache seed (`data-source.ts:513-526`) combined with `getCachedRecords()`'s build-once guard (`data-source.ts:1794`) and the missing `"resolved"` catch-all in `startListening()`
- [x] T006 Traced `src/data/title-field-display.ts`; excluded — it resolves only the title/card display text (`resolveTitleFieldDisplay`), never a table property cell, and does not touch `metadataCache`/`recordCache`
- [x] T007 Traced `src/data/legacy-plugin-data-migration.ts`; excluded — it only copies `data.json` bytes between plugin folders through a 3-method adapter interface, with no `metadataCache`/`vault`/frontmatter read at all
- [x] T008 Fixed the confirmed root cause: `startListening()` now also subscribes to `metadataCache.on("resolved")` and refreshes every cached record once fired (`src/data/data-source.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T009 Added a test proven to fail against the pre-fix code (mutation-proven, verified via `git stash`) and pass after, in `src/data/data-source.test.ts`
- [x] T010 Reran the cold- and warm-cache harness scenarios; confirmed green on both (`node tools/live/database-cold-cache-property-read.mjs`: RESULT: PASSED, 18/18 and 8/8 populated)
- [ ] T011 Recapture the Finance Reports table and Database Testbed board screenshots — NOT DONE: those are the operator's own vault surfaces, unavailable in this environment; the harness's own fixture-driven scenarios prove the mechanism instead (see implementation-summary.md Known Limitations)
- [x] T012 Operator device row (AC-006) present in `acceptance-criteria.md`, left unticked for the operator's own recheck
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` except the operator device row, which stays theirs — T011 (real-device recapture) also stays open; see implementation-summary.md Known Limitations
- [x] No `[B]` blocked tasks remaining
- [ ] Manual verification passed (cold-cache repro done and green; recapture pending the operator's own device)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available (cold-cache timing)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks (`npm run lint:tools` green)
- [x] CHK-011 [P0] No console errors or warnings (headless-Chrome `pageerror` listener recorded zero across all seven scenarios)
- [x] CHK-012 [P1] Error handling implemented (cache-not-ready path fails safe, not silently empty) — this IS the fix: the `"resolved"` catch-all
- [x] CHK-013 [P1] Code follows project patterns (reuses `refreshCachedRecord`/`scheduleNotify` rather than a parallel implementation)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met — AC-001 through AC-004 met; AC-005 partially (fixture recapture only, not the operator's own surfaces); AC-006 operator-owned
- [x] CHK-021 [P0] Manual testing complete (cold-cache repro reproduced and fixed)
- [ ] CHK-022 [P1] Edge cases tested (empty database, cache warm vs cold) — warm vs cold vs poisoned vs recovered all tested; a zero-row database was not, deferred as out of this defect's scope
- [x] CHK-023 [P1] Error scenarios validated (never-resolves, poisoned-then-recovered, per-file-changed isolation)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class: `class-of-bug` — any early read of the record cache before the vault resolves poisons it the same way, not only `getViewDefFiles()`'s own scan
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed (`rg -n "MetadataCache|getFileCache|frontmatter" src/data/*.ts` — 478 hits; every `recordCache` write confirmed local to `data-source.ts`)
- [x] CHK-FIX-003 [P0] Consumer inventory completed (`rg -n "recordCache" src/data/data-source.ts` — every read/write is private to `DataSource`; no external consumer bypasses it)
- [x] CHK-FIX-004 [P0] N/A — not a security/path/parser/redaction fix
- [x] CHK-FIX-005 [P1] Matrix axes covered: cache state (never-resolves/warm-from-start/poisoned/recovered/per-file-changed) × view type (table/board) × property type (currency/text/checkbox/number)
- [x] CHK-FIX-006 [P1] Cold-cache (process-wide metadata state) variant executed
- [x] CHK-FIX-007 [P1] Evidence pinned to file:line citations (`data-source.ts:513-526`, `:1785-1801`, `:1804-1810`) rather than a branch-relative diff range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] N/A — no secrets involved
- [x] CHK-031 [P0] N/A — no external input validation surface
- [x] CHK-032 [P1] N/A — no auth/authz surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks/acceptance-criteria synchronized after root cause is confirmed
- [x] CHK-041 [P1] Code comments adequate; no spec paths or packet numbers embedded in code comments (`node tools/naming/scan-comments.mjs` — 0 violations)
- [x] CHK-042 [P2] N/A — no README surface for this fix
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only (none created)
- [x] CHK-051 [P1] scratch/ cleaned before completion (nothing to clean)
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 11/12 |
| P1 Items | 13 | 12/13 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-09-08 — remaining gaps: CHK-020 (AC-005/AC-006 need the operator's own device), CHK-022 (empty-database edge case not covered)
<!-- /ANCHOR:summary -->

---
