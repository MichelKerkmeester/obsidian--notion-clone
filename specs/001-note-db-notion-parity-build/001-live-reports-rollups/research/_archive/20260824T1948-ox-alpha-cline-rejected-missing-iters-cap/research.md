# Research: Perfecting Live Reports Roll-ups toward Notion Parity

**Lineage:** `ox-alpha-cline` · **Session:** `fanout-ox-alpha-cline-1787599243721-mhlsly` · **Iterations:** 5 (converged, newInfoRatio 1.0→0.6) · **Executor:** cli-pi / x-ai/ox-alpha

Bound spec: `specs/obsidian/002-note-db-notion-parity-build/001-live-reports-rollups/spec.md` + `plan.md`. Fork src read at `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`. References: AppFlowy (`context/appflowy/frontend`), Anytype (`context/anytype-ts/src/ts`), Notion official docs. Per-iteration evidence: `iterations/iteration-001..005.md`; machine-readable registry: `findings-registry.json`.

---

## Verdict

The phase is sound and the plugin already over-delivers: per-row relation rollups (`RelationRollup.ts`) are a primitive **neither AppFlowy nor Anytype has**, and every mechanism the spec depends on (display-only default, per-path write queues, live refresh on child edits) exists today with citations. The highest-value work is therefore (1) correcting two wrong assumptions baked into the spec's risk model, (2) a short ops-facing configuration contract that dodges the real edge cases (currency mixing, key mismatch), and (3) free UX wins available with zero or YAML-only effort. No plugin code should be written this phase.

## Ranked enrichment of the feature

### Rank 1 — Fix the REQ-003 risk model: rollups structurally cannot rewrite Report notes [P0, doc change]
`computedSyncMode` gates *computed-field formula* write-back only (`views/DatabaseView.ts:10390-10392`, `data/ComputedSync.ts:1-45`); rollup values are pure derived data entering views as `derivedValues` (`DatabaseView.ts:10351-10362`) and never touch a writer. iCloud safety for THIS phase is architectural, not config-dependent.
- Keep setting `computedSyncMode=display-only` on Reports anyway: it is the default (`ComputedSync.ts:4`) and blocks accidental future formula write-back; the cleanup flow even self-downgrades automatic→display-only (`DatabaseView.ts:5597-5604`).
- Rewrite SC-002's acceptance check to target what can actually fail in this phase: relation wiring + refresh, not file rewrites.

### Rank 2 — Bind rollups only to confirmed single-currency amount keys [P0, ops contract]
`aggregateRollup` sums raw numerics via `toChartNumber` with no currency dimension (`RelationRollup.ts:124-128`; `types.ts:50`). Mixed currencies produce an arithmetically correct, semantically wrong SUM with zero warning — worse than the "sums zero" failure the spec already anticipates. The ops confirmation must record both the live property keys AND a one-currency-per-property guarantee before any rollup column binds.

### Rank 3 — Free win: footer summaries already compose over rollup columns [P1, YAML-only]
Numeric rollup columns (`count|sum|avg`) qualify for the full footer menu SUM/AVERAGE/MEDIAN/MIN/MAX/RANGE/STDDEV computed across rows (`views/SummaryRenderer.ts:76-85, 423-426`). Adding footer summaries on the Reports rollup columns yields vault-wide month-over-month totals and trend visibility at zero code cost — the closest cheap approximation of Notion's grouped-calculation behavior.

### Rank 4 — Snapshot* columns: keep them, but as text, not number [P1, decision refinement]
Spec's optional audit copies are worth keeping (screenshot-era figures diverge from live totals by design). Making them `text`-typed prevents any future automatic-sync or chart feature from treating stale numbers as live data, preserving the audit intent.

### Rank 5 — Successor-pack design brief mined from references [P2, feeds 002-rollup-aggregation-pack]
- Anytype's 13-kind `FormulaType` on the column config (`ts/interface/block/dataview.ts:104-119`, stored on `ViewRelation.formulaType`, `model/viewRelation.ts:9`) is the exact taxonomy to adopt for new relation-rollup kinds; its storage shape matches the fork's `rollupConfig.aggregation` on the column def (`types.ts:44`), so extension is schema-additive.
- AppFlowy contributes the recalculation architecture: priority task scheduler + per-view cache + change notifications (`services/calculations/controller.rs:65,86-99,117-133,202-235`) — a proven pattern if the fork's batch-refresh ever needs coalescing.
- Both references converge on click-the-aggregate-to-change-it UX (Anytype `foot/cell.tsx:64-95`, AppFlowy `calculate_cell.dart`) vs this fork's YAML-only configuration — the natural UX parity target once kinds expand.
- Invariant to preserve everywhere: no rollup-of-rollup (Notion FAQ "unintended loops"; fork enforces at `RelationRollup.ts:96`).

### Rank 6 — If code were EVER needed, the EuroFormat shape is the template (not this phase)
One isolated module under `src/data/` with a durable-why header (`EuroFormat.ts:1-42`), consumed by ≤3 import-and-delegate call-site edits (`CellRenderer.ts:13`, `SummaryRenderer.ts:7`). Rollup rendering is already EuroFormat-covered, so money display needs nothing now. This documents the ceiling of this phase's ambition: REQ-004 holds.

## Edge-case ledger (verified behavior)

| Case | Verified behavior | Evidence |
|------|-------------------|----------|
| Empty Month relation | Omitted; count→0, sum/avg→null cell | `RelationRollup.ts:81-83,160` |
| Non-numeric amounts | Filtered out before summation (no digit-extraction bug) | `RelationRollup.ts:124-128` |
| No related children | Null/0 rendered, note untouched | `RelationRollup.ts:160` |
| Child edit while view open | Refresh marked via `relationTargetPaths`; no parent write queued | `DatabaseView.ts:2119-2158, 89-117` |
| Wrong `targetDatabaseId` | Relation unresolved → empty value (no crash) | `RelationRollup.ts:81-83` |
| Mobile | Same render path; `Platform.isMobile` affects popover hosting only | `CellRenderer.ts:1484-1508` |
| Perf under rollups | DOM fast-path patch intentionally skipped → full rebuild keeps totals authoritative | `tryPatchExternalTableRows` early return |
| Future formulas-on-rollups | Whole-database sync scope escalation — successor-phase churn tripwire | `getIncrementalComputedSyncPlan` |

## UNKNOWN (operator-bound)

- Live vault amount property keys and db_view paths (ops) — unchanged by research, per charter.
- Notion mobile-specific rollup restrictions and "rollup across databases" semantics: absent from the official help page; left UNKNOWN rather than inferred from third-party blogs.

## Convergence report

- **Stop reason:** converged (projected iteration-6 newInfoRatio ≈0.03 < threshold 0.05; question coverage 8/8; source diversity guard passed: fork src + AppFlowy Rust/Flutter + Anytype ts + notion.com).
- **Iterations:** 5. **newInfoRatio:** 1.0, 0.9, 0.8, 0.7, 0.6 (avg 0.80).
- **Ruled-out directions:** AppFlowy as a rollup-semantics reference (has none); Anytype server-side aggregation (none exists); mobile-specific rollup branches (none); Notion-doc support for "across databases" wording (absent).
