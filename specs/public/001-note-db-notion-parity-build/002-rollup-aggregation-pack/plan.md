---
title: "Implementation Plan: Rollup Aggregation Pack"
description: "Locked build plan for the Rollup Aggregation Pack: one EuroFormat-shaped Aggregate.ts module, its exact call sites, locked per-kind semantics, and mobile/iCloud-safety notes."
trigger_phrases:
  - "rollup aggregation"
  - "aggregate module"
  - "numeric pack"
  - "date pack"
  - "percent pack"
  - "call site"
  - "rollup implementation"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "swarm"
    recent_action: "Plan reconciled to final-plan.md; status Planned"
    next_safe_action: "Build phase 002 per plan.md and tasks.md (numeric same-diff first)"
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
# Implementation Plan: Rollup Aggregation Pack

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` (the older `001-notion-finance-migration/build/note-database-fork` path is stale — line numbers in this plan cite the live fork) |
| **Storage** | None — display-only; no frontmatter writes (iCloud-safe); `ComputedSync.ts:3` default vocabulary is already `"display-only"` |
| **Testing** | Vitest is configured (`vitest.config.ts:1-9` includes `src/**/*.test.ts`, setup `src/__tests__/setup.ts`) but the harness directory does not exist — bootstrap it this phase; run via `npx vitest run`. Harness is `setup.ts` stub + `Aggregate.test.ts` only — no general test migration |

### Overview
This plan implements the synthesis's verdict: one EuroFormat-shaped module, `src/data/Aggregate.ts` (module-level pure functions, no plugin state), consumed by the three aggregators that already exist — `RelationRollup.ts` (rollup columns), `SummaryRenderer.ts` (footers), `ChartAggregation.ts` (charts) — plus four small supporting edits (type widening at `types.ts:44`, shared `isNumericRollupKind`, config-modal options, Vitest bootstrap). Build order: numeric pack first (unblocks Reports MAX/SUM in phase 003), dates next, percents last. Rollup-of-rollup stays forbidden; results are display-only.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Fork source read: call sites located with file:line evidence (see research/synthesis.md).
- [x] Notion parity list confirmed (~18 calculations; number pack Sum/Average/Median/Min/Max/Range; date pack Earliest/Latest/Date range).
- [x] Empty-input semantics for every new kind decided and locked (table below).
- [x] Scope confirmed: one new module + minimal edits; config modal counted in scope; range locked as scalar.

### Definition of Done
- [ ] `Aggregate.ts` implements min, max, median, range, earliest, latest, percentEmpty, percentFilled with locked semantics; takes coerced arrays / row counts; imports nothing from the three aggregators (cycle-free).
- [ ] All three aggregators consume Aggregate.ts; the five eligibility clones use the shared predicate; `earliest|latest` map to `"date"` via the separate display-type edit.
- [ ] `aggregateRollup` uses an exhaustive switch before the sum/avg tail (tail = `aggregation === "sum"` only); percent dispatches from `records` before `:126`.
- [ ] Config modal offers the new kinds with target-type filtering; reuses existing i18n keys.
- [ ] Vitest harness green: `npx vitest run` passes `Aggregate.test.ts` (harness = `setup.ts` stub + `Aggregate.test.ts` only; no general test migration).
- [ ] Rollup-of-rollup still renders empty; existing `count | sum | avg | list` unchanged; footer date-ms RANGE fallback preserved.
- [ ] Display-only verified — no frontmatter bytes change when rollups render.
- [ ] Fork test suite and lint pass; no regressions vs the recorded baseline.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
EuroFormat model (`src/data/EuroFormat.ts:1-9`): one new file under `src/data/`, module-level pure functions, no plugin state, header stating it exists to stay a small rebasable diff. AppFlowy's `CalculationsService` match-dispatch is the same idea and must **not** become a class (`context/appflowy/frontend/rust-lib/flowy-database2/src/services/calculations/service.rs:12-26`). Aggregate returns raw values/nulls; formatting stays at call sites (`formatEuroNumber2`, `parseDateTimeParts(...)?.dateKey`, chart ticks).

### Key Components
- **`src/data/Aggregate.ts`** (new): pure aggregation functions + exported `isNumericRollupKind`. Takes coerced arrays / row counts; imports nothing from the three aggregators (cycle-free). Module name is `Aggregate.ts` — not `RollupAggPack.ts`; one module only.
- **`src/data/types.ts`**: widen the rollup union at `:44` (one-line, additive).
- **`RelationRollup.ts`**: dispatch new kinds through Aggregate via an **exhaustive switch before the sum/avg tail** (tail narrowed to `aggregation === "sum"` only); percent dispatches from `records` before `:126`; `count | sum | avg | list` unchanged; rollup-of-rollup guard preserved.
- **`SummaryRenderer.ts`**: route footer MIN/MAX/MEDIAN/RANGE-when-numbers-exist (numeric pack) and EARLIEST/LATEST (date pack) through Aggregate; keep STDDEV/COUNT/UNIQUE/CHECKED local; keep the date-ms RANGE fallback (`:457-459`) local.
- **`ChartAggregation.ts`**: route **median** through Aggregate (required); min/max/range via Aggregate on `stat.numericValues` or keep `stat.min`/`stat.max` if tests prove identical; chart `percent-empty`/`percent-not-empty` via Aggregate (percent pack); keep chart empty→0 mapping.
- **`RowPipeline.ts` / `ColumnDisplay.ts`**: eligibility clones → shared predicate (new kinds type as `"number"`, not `"text"`). Separately (date pack), `withComputedResultTypes` / `getColumnDisplayType` map `earliest|latest` → `"date"` so cells use `renderDate`, not `String(Date)`.
- **`views/modals/RelationRollupConfigModal.ts`**: offer the new kinds, filter targets by kind; reuse existing i18n keys (`chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, `chart.percentEmptyAggregation`, …).

### API Sketch

```ts
// Pure, deterministic aggregations over COERCED arrays / row counts; render-only, never write back.
// Aggregate.ts imports NOTHING from ChartAggregation.ts / SummaryRenderer.ts / RelationRollup.ts
// (no circular import). toChartNumber / toDateTimestamp stay at call sites, which already
// extract number[] / timestamps. range is SCALAR max − min (Notion Range; matches both live fork surfaces).
export function min(numbers: readonly number[]): number | null;
export function max(numbers: readonly number[]): number | null;
export function median(numbers: readonly number[]): number | null;
export function range(numbers: readonly number[]): number | null;
export function earliest(timestamps: readonly number[]): Date | null;
export function latest(timestamps: readonly number[]): Date | null;
export function percentEmpty(total: number, emptyCount: number): number; // total === 0 → 0
export function percentFilled(total: number, emptyCount: number): number; // complement of percentEmpty
export function isNumericRollupKind(aggregation: string): boolean; // numeric + percent ids only; NOT earliest/latest
```

### Locked Semantics

| Kind | Filter | Empty / all-null | Rule |
|---|---|---|---|
| min / max | `toChartNumber` finite (`ChartAggregation.ts:191-197`) | `null` | never coerce null→0 (reject Anytype `Number(it \|\| 0)`, `context/anytype-ts/src/ts/lib/dataview.ts:1000-1006`) |
| median | same | `null` | sort a copy; odd → middle; even → mean of the two middle values (three-way lock: `SummaryRenderer.ts:576-581` ≡ AppFlowy `service.rs:129-137` ≡ Anytype MathMedian); never nearest-rank |
| range | numeric first | `null` if no survivors | scalar `max − min`; single value → `0`. The earlier `[number, number]` sketch was wrong — do not implement it |
| earliest / latest | `toDateTimestamp` (`DateTimeFormat.ts:203-214`) | `null` | min/max timestamps; return `Date`; local wall-time, not `Date.parse` |
| percentEmpty / percentFilled | all cells including empty (row totals + empty detection on `records`) | `0` when total is 0 | `emptyCount / total × 100` on a 0–100 scale; filled = complement; do not reuse average's non-empty denominator. Three distinct cases: 0 rows → `0`; N rows all empty → percentEmpty `100` / percentFilled `0`; missing target → `null` via `emptyRollupValue` (`:159-161`). Dispatch from `records` **before** `:126`, not from flattened `numbers` |

Average/sum stay in `RelationRollup.ts` unchanged (divide by non-empty `numbers.length`, `:126-128`). Two denominators exist by design (average non-empty, percents all-rows) — documented, not unified. `aggregateRollup` dispatches new kinds via an **exhaustive switch before the sum/avg tail**; the tail is `aggregation === "sum"` only (no `else sum` fallthrough).

### Integration Call Sites (locked)

1. **`src/data/RelationRollup.ts`** — after the existing flatten (`:102-109`) and `toChartNumber` map (`:123-128`), switch new kinds into Aggregate via an **exhaustive switch before the sum/avg tail**; narrow the tail (`:128`) to `aggregation === "sum"` only (not `else sum`) so unknown ids cannot silently SUM. Add a parallel date extraction for earliest/latest (date pack). Percent (percent pack) dispatches from `records` + `getTargetFieldValue` **before** `:126`, not from flattened `numbers`. Do not rewrite `count` (`:99`), `list` (`:110-119`), sum/avg (`:127-128`), or `emptyRollupValue` (`:159-161` — new kinds already fall through to `null`). Preserve `column?.type === "rollup"` → empty (`:101`) byte-for-byte (Notion: rollup-of-rollup is impossible).
2. **`src/views/SummaryRenderer.ts`** — `calculateSummary` (`:431-462`) calls Aggregate for MIN/MAX/MEDIAN/RANGE-when-numbers-exist (numeric pack) and EARLIEST/LATEST (date pack); keep STDDEV/COUNT/UNIQUE/CHECKED local; keep custom-formula preemption (`:439-442`); **keep the date-ms RANGE fallback** (`:457-459`) local so date RANGE does not regress; map Aggregate `null` → footer `""` at the edge so empty rendering does not regress. No footer percent kinds this phase (footers lack them today).
3. **`src/data/ChartAggregation.ts`** — `getMedianValue` (`:873-880`) routes **median** through Aggregate (required); `getStatValue` (`:775-797`) min/max/range via Aggregate on `stat.numericValues` **or** keeps `stat.min`/`stat.max` if tests prove identical; chart `percent-empty`/`percent-not-empty` (`:788-789`) route through Aggregate (percent pack); keep `?? 0` at this edge so charts still show 0 on empty (`:781-784`, `:873-874`). Do not unify chart chrome with rollup empty-text or footer `""`.

Compile/UX extras stay one-line-class edits, not a fourth architecture: widen `types.ts:44`; add options + target filters in `RelationRollupConfigModal.ts:137-176` (+ result type `:246`; extend `isSumAvg` to all numeric kinds; date-kind filter via `isDateLikeColumnType`; reuse i18n keys like `chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, `chart.percentEmptyAggregation` — no new `i18n.ts` block unless a key is actually missing); export `isNumericRollupKind` (numeric + percent ids only — **not** `earliest`/`latest`) for the five clones (`RowPipeline.ts:143-147`, `ColumnDisplay.ts:19-23`, `SummaryRenderer.ts:77-79`, `ChartAggregation.ts:102-104` and `:131-133`); separately (date pack) map `earliest|latest` → `"date"` in `getColumnDisplayType` (`ColumnDisplay.ts:18-23`) and `RowPipeline.withComputedResultTypes` (`:143-147`) so cells use `renderDate` / `parseDateTimeParts(...)?.dateKey`, not `String(Date)`.

### Data Flow
Related rows → `buildRelationRollups` builds an in-memory `valuesByPath` map (`RelationRollup.ts:24-89`) → consumed by `DatabaseView.ts:3393` and `EmbeddedDatabaseRenderer.ts:3202`. Aggregate functions slot into the extraction step only. Nothing is persisted; rerenders are idempotent.

### Mobile/iCloud Safety Notes
- Display-only is structural: greps of `RelationRollup.ts` show no vault writes; the default computed-sync vocabulary is `"display-only"` (`ComputedSync.ts:3`). iCloud cannot churn on bytes that are never written.
- Mobile runs the same code; median's O(n log n) over tens–hundreds of per-cell related values is fine, with `targetCache` (`RelationRollup.ts:38-56`) already avoiding repeated DB scans. No workers, no memoization, no frontmatter.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Record the fork's baseline test/lint state (zero tests exist today; harness missing).
- [ ] Bootstrap the Vitest harness: create `src/__tests__/setup.ts` stub required by `vitest.config.ts`.

### Phase 2: Numeric Pack (one commit-sized same-diff unit — Median cannot ship as text or as an unlisted dropdown id)
- [ ] Implement min, max, median, range in `Aggregate.ts` with locked semantics; table-driven unit tests (kind × empty/all-null/single/odd/even/mixed/NaN/Infinity). Aggregate takes coerced `readonly number[]`; imports nothing from the three aggregators.
- [ ] Widen `types.ts:44`; dispatch numeric kinds in `RelationRollup.ts` `aggregateRollup` via an **exhaustive switch before the sum/avg tail** (tail narrowed to `aggregation === "sum"` only).
- [ ] Export `isNumericRollupKind` (numeric ids only — not earliest/latest); replace the five eligibility clones (**same diff** — otherwise Median ships as type `"text"`).
- [ ] Add modal numeric options with target filtering (`RelationRollupConfigModal.ts`); route footer MIN/MAX/MEDIAN/RANGE-when-numbers-exist and chart median (required; min/max/range via Aggregate or keep `stat.min`/`stat.max`) through Aggregate. Keep the footer date-ms RANGE fallback local.
- [ ] Do not ship the numeric dispatch (T010) without the predicate (T012) and modal (T013) in the same diff.
- [ ] Numeric pack unblocks Reports MAX/SUM in phase 003.

### Phase 3: Date Pack
- [ ] Implement earliest/latest in `Aggregate.ts` via `toDateTimestamp` (takes `readonly number[]` timestamps, returns `Date | null`); parallel date extraction in `RelationRollup.ts` before the numeric `numbers.length === 0` return.
- [ ] Map `earliest|latest` → `"date"` in `getColumnDisplayType` (`ColumnDisplay.ts:18-23`) and `RowPipeline.withComputedResultTypes` (`:143-147`) — separate from `isNumericRollupKind` — so cells use `renderDate` / `parseDateTimeParts(...)?.dateKey`, not `String(Date)`.
- [ ] Route footer EARLIEST/LATEST through Aggregate; keep `parseDateTimeParts(...)?.dateKey` at `:552`. Add modal date-kind options via `isDateLikeColumnType` (reuse `viewConfig.summaryEarliest` / `summaryLatest`).
- [ ] Render through `parseDateTimeParts(...)?.dateKey` (same pipeline as footers) so cells match footer formatting.

### Phase 4: Percent Pack (last — do not defer to 003)
- [ ] Implement percentEmpty/percentFilled taking `(total, emptyCount)`; denominator = total rows including empties; zero rows → `0`; N rows all empty → percentEmpty `100` / percentFilled `0`; missing target → `null` via `emptyRollupValue`.
- [ ] Dispatch in `RelationRollup.ts` from `records` + `getTargetFieldValue` **before** `:126`, not from flattened `numbers`. Wire modal options; route chart `percent-empty`/`percent-not-empty` (`ChartAggregation.ts:788-789`) through Aggregate with `?? 0`. Predicate already includes percent ids (Phase 2). No footer percent kinds this phase.

### Phase 5: Verification
- [ ] Full gate: fork test suite + lint vs baseline, three-surface agreement check, display-only check, rollup-of-rollup check, rebase dry-run.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Every Aggregate.ts kind × {empty array, all-null, single, odd-n, even-n, mixed-with-strings, invalid dates, NaN/Infinity} — table-driven | Vitest (`npx vitest run`), harness bootstrapped this phase |
| Integration | Rollup columns render new kinds typed as numbers; footers/charts agree on shared math; existing `count \| sum \| avg \| list` unchanged | Fork test suite vs baseline + manual view check |
| Regression | Existing rollup behavior byte-stable (incl. rollup-of-rollup guard) | Fork test suite vs baseline |
| Manual | Notion-parity spot-check of the new kinds on a sample relation; modal offers kinds filtered by target type | Vault manual test |
| iCloud/display-only | No frontmatter diff after rendering new kinds | `git diff` on rendered notes |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Research synthesis (`research/synthesis.md`; evidence: `research/research.md`) | Internal | Green (complete) | Semantics and ranking source unavailable — resolved |
| Fork source at `note-database-fork` | Internal | Green — call sites confirmed with file:line evidence | N/A |
| Vitest devDependency (`vitest.config.ts`, package.json) | Internal | Green — configured but unused until harness bootstrap | Tests cannot run without creating `src/__tests__/setup.ts` |
| Phase `003-reports-computed-fields` | Downstream | Not started | This phase must land first (003 needs MAX/SUM from the numeric pack) |
| Upstream dependencies | — | None | Phase `depends_on: none` |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Unit tests fail, the display-only check fails, or rebasing onto upstream conflicts beyond the new module.
- **Procedure**: Revert the phase commit — one new module plus the small listed edits — or drop `Aggregate.ts` and restore each touched file to its pre-phase code. All edits are additive one-liners except the localized `aggregateRollup` switch, so per-file revert is safe.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Numeric Pack |
| Numeric Pack | Setup | Date Pack |
| Date Pack | Numeric Pack | Percent Pack |
| Percent Pack | Date Pack | Verification |
| Verification | Percent Pack | None |

Phase-level: `depends_on: none`; blocks `003-reports-computed-fields`.

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 20 minutes (baseline + harness stub) |
| Numeric Pack | Medium | 60 minutes (module + predicate + modal + two aggregator routings) |
| Date Pack | Low | 30 minutes |
| Percent Pack | Low | 30 minutes |
| Verification | Medium | 40 minutes |
| **Total** | | **~3 hours — every backlog item tiers S individually; the phase total is driven by integration breadth** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Fork working tree clean before edits.
- [ ] Baseline test/lint run recorded (regression baseline; expect zero tests pre-bootstrap).
- [ ] Display-only behavior confirmed by design review (no write paths introduced).

### Rollback Procedure
1. Revert the phase commit, or restore the files listed in spec.md §Files to Change.
2. Re-run the fork test suite and lint.
3. Re-run the display-only check (`git diff` on rendered notes).

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A — display-only; nothing is persisted.

<!-- /ANCHOR:enhanced-rollback -->
