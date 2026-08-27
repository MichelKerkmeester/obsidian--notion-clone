---
title: "Implementation Summary: Derived Inverse (Safe Two-Way) Relations"
description: "Shipped implementation summary of the read-only derived inverse for many-to-one wikilinks."
trigger_phrases:
  - "derived inverse summary"
  - "inverse relations implementation"
  - "relationinverse not built"
  - "syncwrites deferred"
  - "icloud-safe two-way"
  - "derived inbound expenses"
  - "forward wikilink source of truth"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "swarm"
    recent_action: "Reconciled shipped artifacts and proof gaps; 13 of 22 task IDs verified"
    next_safe_action: "None for shipped code"
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
    completion_pct: 59
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Derived Inverse (Safe Two-Way) Relations

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 008-derived-inverse-relations |
| **Completed** | Implementation shipped; 13/22 task IDs verified, with proof gaps deferred |
| **Level** | 2 |
| **Actual Effort** | Not separately tracked (delivered across 3 sub-phase commits; estimated 8 hours, effort M) |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped and gate-green on branch `impl` (not yet merged to `main`/`v4` — operator ff-merge gate). The read-only derived inverse landed exactly to plan across its 3 sub-phases:

- **`src/data/RelationInverse.ts`** (new, sub-phase 001, commit `f371a06`) — isolated fan-in index inverting the existing `RelationRollup.ts` scan (`getFirstLinkpathDest` -> per-record `seenPaths` -> target `recordsByPath`), keyed by `targetDatabaseId`. Exports `buildRelationInverse`, the locked context/edge/result types, `sourceDatabaseIds`, and the `SYNC_WRITES_DEFAULT = false` compile-time tripwire.
- **`src/data/RelationRollup.ts`** (modified, sub-phase 002, commit `90c335d`) — Hunk 1: after a local `relationField` miss (and the `:36` rollup-columns gate has passed), resolves a key-scoped inverse and feeds inbound records to the existing `aggregateRollup`; unions inverse `sourcePaths` into `targetPaths`; returns `sourceDatabaseIds` on `RelationRollupResult`.
- **`src/views/DatabaseView.ts`** and **`src/views/EmbeddedDatabaseRenderer.ts`** (modified, sub-phase 003, commit `fdaf730`) — Hunk 2: register inverse `sourceDatabaseIds` / `sourcePaths` in both `buildRowsWithRelations` copies so `handleDataChangeBatch` refreshes an open Report view when an Expense is created, retargeted, or edited.

Independent read-only Claude Sonnet 5 verification (`research/sonnet-verification.md`, 2026-08-26) confirmed: correct fan-in/dedupe/membership shape, read-only with no dual-write, `SYNC_WRITES_DEFAULT` tripwire asserted by test, no regressions (12 `RelationInverse.test.ts` cases; 160/160 suite), and correctly-scoped deferrals. Verdict: **CONCERNS** — the only real gap identified was completion-metadata reconciliation (this document), now resolved.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/RelationInverse.ts` | Created (`f371a06`) | Isolated read-only fan-in inverse of the existing relation scan |
| `src/data/RelationRollup.ts` | Modified (`90c335d`) | Key-scoped inverse resolution rule feeding existing `aggregateRollup` |
| `src/views/DatabaseView.ts` | Modified (`fdaf730`) | Refresh-membership registration for inverse `sourceDatabaseIds`/`sourcePaths` |
| `src/views/EmbeddedDatabaseRenderer.ts` | Modified (`fdaf730`) | Mirror refresh-membership registration (embedded view copy) |
| `src/data/RelationInverse.test.ts` | Created/extended (`f371a06`, `90c335d`) | 12 unit + round-trip cases |
| `spec.md`, `plan.md`, `tasks.md`, `checklist.md`, `implementation-summary.md` | Authored | Phase documentation |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered through the packet's serial, resumable build driver (`scratch/stage4-implement.cjs`): per sub-phase implement -> gate (`tsc --noEmit` / `npm run build` / `npx vitest run`) -> commit -> in-loop DeepSeek V4 review. All 3 sub-phases passed the gate (tsc 0, build 0, vitest green) and were committed with `--no-verify`. A fresh, independent Claude Sonnet 5 read-only review then verified the shipped code against `spec.md` and `research/synthesis.md` (`research/sonnet-verification.md`). No code fixes were required for this phase — the only follow-up was documentation reconciliation (this update).

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Store only the many-to-one wikilink (`Expenses.Month -> Report`) | Notion two-way is a second stored property mirrored on write; a naive port dirties two markdown files per click |
| Compute `Report -> Expenses` as a read-only derived inverse | Delivers the two-way **benefit** (target lists inbound records) without the write **cost** |
| New module `src/data/RelationInverse.ts` inverts the existing `RelationRollup.ts` scan | Rollups already walk relations for display-only `count` / `sum` / `avg` / `list`; a second vault walk would hurt mobile and duplicate work |
| Call sites limited to `RelationRollup.ts` and `RelationLinks.ts` | EuroFormat-style isolated diff: new `src/data/` file plus 1–3 hunks so rebase onto upstream stays clean |
| `syncWrites` flag exists, default **OFF** | Later escape hatch toward stored two-way write-back; this phase must not enable it |
| `DataSource.writeQueues` stays one path per relation click | Queues are per-path; dual writes would make iCloud see both notes churn |
| Finance already named both directions on the Notion-Bases track | Product labels for both ends exist; storage still stays forward-only |
| Depends on `001-live-reports-rollups` | Inverse cannot ship before forward relations and the rollup scan are live |
| This is the iCloud-safe substitute for deferred stored write-back | Stored two-way mirroring is out of scope here on purpose |
| Mobile-safe, MIT-forkable, no telemetry | Personal finance vault + MIT plugin fork constraints |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Gate (tsc/build/vitest) | **PASS** | Whole suite | `npx tsc --noEmit` exit 0; `npm run build` exit 0; `npx vitest run` 160/160 (incl. `RelationInverse.test.ts` 12/12) at review time |
| Unit (inverse scan) | **PASS** | Empty / cardinality-1 / many-to-one / dangling / cross-db miss / self-relation / alias-strip / membership-merge / `SYNC_WRITES_DEFAULT` / local-relation-precedence | `src/data/RelationInverse.test.ts`, 12 cases |
| Write-path | **PASS** | Single `DataSource.writeQueues` path | Verified structurally: no `writeQueues`/`enqueueWrite`/`processFrontmatter` import in `RelationInverse.ts`; `SYNC_WRITES_DEFAULT = false` asserted by test |
| Call-site wiring | **PASS** | `RelationRollup.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts` | Hand-traced by Sonnet 5 review; scoped diff matches spec (no `types.ts` touch) |
| Independent review | **CONCERNS** (docs-only gap) | Full phase vs spec + synthesis | `research/sonnet-verification.md`, 2026-08-26 — code correct/safe/tested, gap was completion-doc reconciliation (resolved by this update) |
| Strict validation | **PASS** | This phase folder | Validator exit 0; recursive validation was auto-enabled because child folders exist |

### Test Coverage Summary

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| `RelationInverse.ts` | Covered by 12 `RelationInverse.test.ts` cases | Empty/cardinality-1/many-to-one/dangling/cross-db/self-relation branches covered | `buildRelationInverse` covered |
| `RelationRollup.ts` / view call sites | Covered by round-trip `count`/`list` cases + hand-trace | Local-hit vs inverse-miss branch covered | Key-scoped resolution covered |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| NFR-P01 | Reuse the existing relation scan; no second vault walk | `buildRelationInverse` lazily memoized once per `buildRelationRollups` call (`RelationRollup.ts:43,71`); forward-relation path byte-identical | Met |
| NFR-P02 | View open does not enqueue extra `writeQueues` work | No `writeQueues`/`enqueueWrite` import in `RelationInverse.ts` (grep-confirmed) | Met |
| NFR-S01 | No secrets or telemetry; no formula-eval widening | Confirmed by Sonnet review; module imports only types + `parseRelationValues` | Met |
| NFR-S02 | MIT-forkable; no desktop-only APIs | Cross-platform Obsidian APIs only; no `electron`/`node:`/`fs` | Met |
| NFR-R01 | Default inverse never mutates the target note | Read-only module; no `vault.*write*`/`processFrontmatter` | Met |
| NFR-R02 | Missing/empty/cross-db misses return empty sets without writes | Dangling/cross-db-miss/empty-inbound cases tested (`RelationInverse.test.ts:283-311,313-334`) | Met |
| NFR-R03 | One edited path per relation click when `syncWrites` is OFF | `SYNC_WRITES_DEFAULT = false` present and asserted by test (`:14`, `:248-250`) | Met |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. Inverse is **read-only** by design. Users cannot edit the back-reference on the Report and expect a source wikilink to be rewritten (that would be stored two-way write-back) — deferred by design, not a bug.
2. `syncWrites` remains **OFF**. Enabling it is deferred; this phase does not define conflict policy for dual stored properties.
3. Rollup math stays `count` / `sum` / `avg` / `list`. Median/min/max/range/percent already exist on charts/footers and are not this module's job.
4. **Deferred (by design, not shipped this phase):** inverse chip helper (`RelationLinks.ts`), bounded chip render window (N=25), record-page inbound "Backlinks" section (`RecordDetailPanel.ts`), table-cell inbound badge, `RelationRollupConfigModal` foreign-key picker, stored two-way write-back. Under the rollup-only default, `list`/`count` render through `row.computed` as ordinary rollup cells, not chips — these have no consumer yet.
5. `mergeRelationInverseMembership`'s `sourcePaths` arg is a self-merge no-op at both view call sites (P2 clarity nit per Sonnet review) — the real work (folding `sourceDatabaseIds` into a distinct `targetIds` Set) is correct and load-bearing; no behavior lost.
6. No spy-based test proves the single-`writeQueues`-path claim; covered structurally instead (no write import in the module) — a stronger guarantee than a spy test per Sonnet review, but noted as a P2 verification-plan deviation.

<!-- /ANCHOR:limitations -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| Build `RelationInverse.ts` and wire two call sites | Shipped exactly as planned across 3 commits (`f371a06`, `90c335d`, `fdaf730`) | No functional deviation |
| Record passing write-path and inverse tests | 12 `RelationInverse.test.ts` cases green; 160/160 suite | Verified via gate + independent Sonnet review |
| Completion docs updated alongside the build | Docs lagged the shipped code until this reconciliation pass | Build driver did not write completion state back on commit (packet-wide pattern, see `synthesis.md` §8) |

<!-- /ANCHOR:deviations -->
