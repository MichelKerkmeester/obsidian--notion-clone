---
title: "Tasks: Consolidate test/fixture data into one testbed database plus the restored Finance databases"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Consolidate test/fixture data into one testbed database plus the restored Finance databases

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
## Phase 1: Inventory (T001)

- [x] T001 Inventory every fixture/test dataset the project ships or seeds — see **Dataset Inventory** below. Counts marked `TBC` when first written were filled by the counting pass before implementation.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Design + implement

- [x] T002 [P] ADR: surviving view types — table, board, calendar, timeline, chart; list and gallery renderers are gone from the tree, so no fixture view of either. decision-record ADR-0001
- [x] T003 [P] ADR: the generated volume fixture the bench and reference lane measure stays, as do the constructed lane's small dataset and the smoke lanes' inline records — they mount no use case and are their lanes' measured subjects. decision-record ADR-0003
- [x] T004 Build the ONE consolidated testbed database definition: 36 records, 28 columns (all 13 plugin column types + the 5 display variants), six views (the five survivors plus the deliberately sorted-and-filtered second table), status options spanning the six status colours the presets draw from, a computed formula, a relation, a rollup, a deliberately full first record and a deliberately empty last one — `tools/mock-data/use-cases.ts`, `catalogue.ts`, `emit-obsidian.ts`
- [x] T005 RED FIRST: `tools/mock-data/consolidation.test.mjs` — run against the untouched ten-database tree: **exit 1, 4 of 6 assertions failed** (ten use cases, non-testbed mounts, five views, a partial full record), 2 guards green (the Finance second-dataset fixture present; exactly one empty record)
- [x] T006 Consolidate: the one `testbed` vocabulary, the record-0 always-fill and the forced relation, the sixth view and its note emission, both registries' mounts, the consolidated `catalogue.json` + `csv/testbed.csv`, the ten retired CSVs deleted by name — the 070 Finance fixture untouched as the second dataset
- [x] T007 GREEN: the registry suite 6/6 (exit 0); `npm run screenshots` ×2 — 616/616 captured, no committed capture moved (three single-channel-unit jitter flips on untouched lanes, restored by the second run; disposition in decision-record ADR-0006); the lane needed no takeover because no capture changed and no stylesheet was edited
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 Green: vitest 154 files / 1678 tests (was 153 / 1672), `story-coverage` 0, `verify-placement` 0 (`sheet-inventory.mjs` is not on this branch — its landing belongs to other packets — skipped per the packet's instruction)
- [x] T009 Full ladder — every exit recorded in **Verification Results** below; `evidence --check-all` 15/15 fresh after re-measuring the three artefacts the edits made stale
- [x] T010 Docs: this file, `acceptance-criteria.md` (all four criteria Met, closure Yes), `implementation-summary.md`, `decision-record.md` (six ADRs), `testbed-proposal.md` (the operator's copy; their vault untouched), `plan.md` placeholders filled, goal/spec continuity reconciled; spec validator RESULT: PASSED; graph metadata backfilled; the packet's entry appended to the 005 handover
- [x] T011 The 2026-09-09 ~20:48 ruling (0.0.36) — one database, table and board views only: RED first (`consolidation.test.mjs` 2 failed | 6 passed: 6 views `[table, board, calendar, timeline, chart, table]`), then `catalogue.ts` `buildViews()` cut to exactly one table + one board, `catalogue.test.mjs` assertion updated, `catalogue.json` regenerated; GREEN 8/8 + 28/28 (full vitest 1587/1587); CSV and Finance fixture untouched; no capture mounted the retired views (480 unchanged apart from one deterministic mover) — gate 27/0; docs amended (AC-005, `testbed-proposal.md`, this file)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [ ] Manual verification passed — the automated lanes all pass; the on-device rows (the Finance databases' appearance on the operator's phone, and the adoption of `testbed-proposal.md` against their own vault) are the operator's, and this packet does not tick them
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md` (its placeholder sections are filled with this consolidation's shape, gates and rollback)
<!-- /ANCHOR:cross-refs -->

---

## Dataset Inventory (T001 evidence)

Every fixture/test dataset the project ships or seeds, as it stood when this leg began. Counts come from the files themselves.

| # | Dataset | Path | Consumers (harness → use) | Rows | Columns | Views | Fate |
|---|---------|------|---------------------------|------|---------|-------|------|
| 1 | Catalogue use cases | `tools/mock-data/catalogue.ts` + `use-cases.ts` | catalogue-scenario.ts → the catalogue mounts in the render-assertion harness; `capture.mjs` / anytype loaders → vault seeding | 10 use cases, ~326 records (20–40 each) | 28 per use case, all 13 column types + 5 display variants | one db_view note per use case, 5 views each | **Consolidated** — one `testbed` vocabulary, 36 records, 6 views |
| 2 | CSV mirrors of the use cases | `tools/mock-data/csv/*.csv` | provenance/import record for the catalogue | 10 CSVs | = #1 | — | **Consolidated** — `testbed.csv` alone; the ten retired CSVs deleted |
| 3 | Generated bench volume | `tools/mock-data/generate.ts` + `random.ts`; the harness's own column/row builders | render-assertions' non-catalogue lanes; the bench; the reference lane through the reference fixture | 1600–2000 (deterministic) | bench-sized uniform | notional | **Kept** — its lanes' measured subject (ADR-0003) |
| 4 | Scenario markup fixtures | `tools/screenshots/scenarios/*.mjs` (`shared.mjs`'s column/row helpers, core/fields/panels/chrome/temporal) | the capture corpus — photographs renderer classes and per-view states | a few rows per state, hand-written | hand-written per fixture | table, board, chart chrome, toolbar states, temporal variants | **Kept** — state-specific markup, mounts no use case (ADR-0003) |
| 5 | Constructed-capture mixed-type dataset | inline in `tools/screenshots/constructed-scenarios.mjs` | the constructed captures | small, deliberately | mixed, hand-picked | constructed views | **Kept** — deliberately sized like the markup it supersedes (ADR-0003) |
| 6 | Operator-shaped Finance + Testbed/Cards cold-cache fixture | inline in `tools/live/database-cold-cache-property-read.mjs` (`Finance/Reports/*` 6 records, `Testbed/Cards/*` 4 records, 2 db_view notes) | the cold-cache lane (070's regression proof) | 6 + 4 | currency/text/date-sort-key; checkbox + number | finance reports table, testbed board | **Kept as the second dataset** (ADR-0005); the consolidation suite asserts its presence |
| 7 | Operator's own vault folder | `Database Testbed/` in the operator's vault | the operator's device; the sheet smoke lanes' named source folder | operator-owned; not counted | whatever the operator keeps | operator's own | **Untouched** — the packet proposes the consolidated shape in `testbed-proposal.md`; adoption is the operator's |
| 8 | Story fixtures | `src/views/*.stories.ts` | the storybook (coverage, smoke, placement, the shim suites) | component-shaped, inline per story | inline | inline | **No change** — they import nothing from the catalogue; verified import-by-import |

Red → green (T005/T006): the fixture-registry test's assertions against the ten-database tree — **4 of 6 failing, exit 1** → after consolidation, **6 of 6 passing, exit 0**. The two guards (the Finance second-dataset fixture present; exactly one deliberately empty record) were green at both ends, as guards should be.

## Verification Results

| Check | Exit / result |
|-------|---------------|
| `npx vitest run tools/mock-data/consolidation.test.mjs` (red, before) | 1 — 4 failed / 2 passed / 6 |
| `npx vitest run` (green, after) | 0 — 154 files, 1678 tests (was 153 / 1672) |
| `npx tsc --noEmit` | 0 |
| `npm run build` | 0 |
| `node tools/live/render-assertions.mjs` | 0 — rhythm 36 rows, 1 distinct height 35px (ceiling 49); wrap lanes tallest 300 / 280 / 413px, one-line ≤ 28px, all PASS; board geometry, calendar ink, frozen-column CSS all PASS |
| `node tools/live/sheet-grammar.mjs` | 0 |
| `node tools/storybook/story-coverage.mjs` | 0 — 19/40 renderable modules, 21 exempt |
| `node tools/storybook/verify-placement.mjs` | 0 — 413/415, 2 red for a declared reason |
| `npm run screenshots` (run 1) | 0 — 616/616 captured; 3 PNGs dirty, all maxDelta 1, single-digit changedPixels |
| `npm run screenshots` (run 2) | 0 — 0 PNGs dirty (the three jitter flips restored by the run) |
| `npm run screenshots:verify` | 0 — 616 entries match their sources, none blank or theme-identical |
| `node tools/live/evidence.mjs --check-all` (before re-measure) | 1 — capture-device-parity, touch-targets, unstyled-links stale (their inputs: the edited manifest and bundle) |
| the three writers re-run by their own tools | 0 / 0 / 0 — then `evidence --check-all`: 15/15 fresh, exit 0 |
| `node tools/lane/check-lane.mjs` | 0 — stylesheet unchanged; "release names all 0 changed capture(s)", which is the truth |
| `npm run gate` | 0 — **27 green, 0 red for a declared reason** |
| `node tools/naming/scan-comments.mjs` | 0 — 510 files, no artifact ids, no commented-out code |
| `node tools/naming/scan-failing-values.mjs` | 0 — 427 ticked criteria across 76 phases, no newly unticked-without-evidence |
| spec validation (the strict orchestrator) | RESULT: PASSED |

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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined — `plan.md`'s placeholders are filled with this consolidation's approach, gates and rollback
- [x] CHK-003 [P1] Dependencies identified and available (vitest, esbuild, playwright-core and the capture/gate scripts already in the tree; 070's fix landed at `a75a1ae2`)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks — `lint:tools` green in the gate
- [x] CHK-011 [P0] No console errors or warnings — the ladder's suites exit 0; the only warning printed is node's module-type notice on the generator, pre-existing
- [x] CHK-012 [P1] Error handling — n/a: fixture data only; every harness keeps its own existing guards, and the consolidation suite's failure messages name the mount that broke the rule
- [x] CHK-013 [P1] Code follows project patterns — MODULE banners, numbered sections, `scan-comments` 0
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met — `acceptance-criteria.md`, all four Met with observed evidence
- [x] CHK-021 [P0] Manual testing complete — the automated lanes and the gate; the operator's on-device rows are theirs by decision, and the closure statement says so
- [x] CHK-022 [P1] Edge cases tested — the deliberately sparse record, the deliberately full record, the one-vs-six multi-select, the relation into the surrounding records, the empty group via the board, the sorted-and-filtered view's single exclusion: all carried in the consolidated database and asserted by the two suites
- [x] CHK-023 [P1] Error scenarios validated — n/a: fixture data only
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding classes — the consolidation is not a bug fix; the inventory's fates and ADR-0003's "kept" rows carry the same-produced/consumer reasoning this checklist guards
- [x] CHK-FIX-002 [P0] Same-class producer inventory — every producer of catalogue data read: the catalogue, its three emitters, the two registries, the Anytype loaders (grep-verified; the loaders iterate whatever the catalogue holds)
- [x] CHK-FIX-003 [P0] Consumer inventory — every `catalogueUseCase` reference, every use-case id in code (not prose), and the stories' imports read; the conclusions are the eight inventory rows and the registry test that now enforces them
- [x] CHK-FIX-004 [P0] Security/path/parser/redaction — n/a: no such boundary moved; the vault write's guards predate this packet and their tests still pass
- [x] CHK-FIX-005 [P1] Matrix axes — the inventory table is the axis list (dataset × consumer × fate); the consolidation's own matrix is the 36 records × 28 columns × 6 views the generator reports
- [x] CHK-FIX-006 [P1] Hostile env/global-state — n/a: nothing reads process-wide state; the generator's determinism tests are the state-boundary guards and they pass, including the different-seed negative control
- [x] CHK-FIX-007 [P1] Evidence pinned — this leg's evidence is the worktree diff against `f91370f1` plus the exits above; the fresh verifier re-runs them on the final tree
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — none introduced; the Anytype key stays outside the repository, as its README already documents
- [x] CHK-031 [P0] Input validation — the vault write's guards (root marker, containment, idempotence) predate this packet and their suite passes
- [x] CHK-032 [P1] Auth/authz — n/a: no auth surface in fixture data
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized — statuses, criteria and continuity updated together; the goal's completion criteria and log carry the leg's outcome
- [x] CHK-041 [P1] Code comments adequate — mechanisms, not packet references; `scan-comments` 0
- [x] CHK-042 [P2] README updated — `tools/mock-data/README.md`, `CODE.md`, `csv/README.md`, `anytype/README.md` say one database and 36 records, and say which committed reports still describe the last physical ten-set Anytype load
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files — the generator's and gate's temp output lives outside the repository; the pixel-delta runs' two JSON reports were read, their numbers recorded above, and removed
- [x] CHK-051 [P1] scratch/ cleaned — nothing task-created remains: the worktree diff contains exactly the files this packet names
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 12/12 |
| P1 Items | 13 | 13/13 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-09-08
<!-- /ANCHOR:summary -->

---
