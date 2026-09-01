# Sonnet 5 Verification — 010-conditional-format-icons

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` (commit range `b5cec25^..061e526`, 5 commits) vs `spec.md` + `research/{synthesis,final-plan}.md`. Concurrent phase-011 working-tree edits noted where relevant.
- Gate re-run at review time: `tsc --noEmit` exit 0; `vitest` 176/176 (15 files) at HEAD `8a14675` (superset incl. uncommitted 011)

## Verdict

**CONCERNS** — core match/paint algorithm and architecture are solid and well-tested, but two confirmed P1 gaps ship in the 010 range, both traceable to a build-driver commit-omission root cause.

## Findings

### P1 — bold attribute has zero visual effect (CSS never committed)
`ConditionalFormatting.ts:165` adds class `db-conditional-format-bold` and `:100` adds `db-conditional-format-icon`, but `git diff b5cec25^..061e526 -- styles.css` is **empty** — neither class has any rule in committed `styles.css` (`git grep` zero matches). Spec (`spec.md` §3, `final-plan.md` step 4) scoped `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon`. Result: SC-002/REQ-003 "bold" renders nothing. Tests only assert class presence (`ConditionalFormatting.test.ts:262`), not styling, so it passed CI. **The matching CSS already exists in the *uncommitted* working-tree `styles.css`** — a landing/commit slip, not a design gap (see root cause below).

### P1 — column delete can orphan `condition.field` on multi-leaf trees
`ColumnOperations.ts:373-384` prunes `conditionTree` correctly, but re-derives the dual-write `condition` leaf via `getConditionalFormatConditionFromTree` (`ConditionalFormatColumnOps.ts:7-13`), which only succeeds when the pruned tree is a **bare leaf**. With 3+ leaves where 2+ survive a deletion (no single-child hoist), the pruned tree stays a group → `undefined` returned → `rule.condition` never updated → keeps pointing at the deleted column. Inert for `target:"record"` rules, but permanently orphans a `target:"field"` rule (the Apply-to check `conditionField !== targetField` at `ConditionalFormatting.ts:117` can never re-match) — the rule silently stops formatting, no error. Fails `003-tree-aware-column-ops/tasks.md` T004 for the 2+-survivor case. **Fix: reuse the editor's correct first-leaf DFS `getConditionalFormatCondition` (`ConditionalFormatEditor.ts:41-50`) instead of the narrower reimplementation.** No test exercises this path.

### P2 — no automated tests for parser / column-ops / editor slices
`ConditionalFormatting.test.ts` (12 cases) is thorough for the match/paint module (legacy, AND/OR, first-match, empty/null Kleene, `today`, missing-column fail-closed, invalid icon, TR-icon placement). But `ConditionalFormatParser.ts`, `ConditionalFormatColumnOps.ts`, and the editor changes have no dedicated tests (plan scoped them to grep-verification) — which is why the P1 column-ops defect shipped uncaught.

### Positive verification (confirmed)
- **009 export-freeze honored:** all 4 CF modules import only `normalizeViewFilterTree` from `ViewFilterTree.ts`; match uses `queryEngine.evaluateFilterTree(...) === true` (a `QueryEngine` method, not a filter-layer import). No `matchesFilter`/`evaluateViewFilterTree` imported.
- **REQ-002/SC-004:** all renderer consumers (Table, Board, Gallery, List, Calendar, CalendarTimeline, RecordDetailPanel, DatabaseView, EmbeddedDatabaseRenderer) call shared `applyConditionalFormat`/`getConditionalFormatMatch`; `ChartRenderer`/`ChartRenderer` have zero CF refs; diff scoped to spec-named files only.
- **Legacy no-regression:** keeps literal `applyFilters([row],[rule.condition],"and",columns)` (`ConditionalFormatting.ts:127`); empty/nested-empty trees → Kleene non-`true`, correctly non-match via `!== true`.
- **Types additive** (`icon?`/`bold?`/`color?`/`conditionTree?`); parser round-trip iCloud-quiet (absent fields omitted).
- **Display-only/mobile-safe:** only in-memory `RowData`/`ViewConfig`/`HTMLElement`; no electron/fs/Node; icon tokens via `parseRecordIconToken`, never eval.

### Process — completion docs unreconciled (known packet pattern)
Parent + 5 children `implementation-summary.md`/`checklist.md`/`graph-metadata.json` (`"status":"planned"`) still say "Not yet implemented" despite 5 gate-green commits.

## ROOT CAUSE (cross-phase, not unique to 010)
Both P1s and the 009 `package.json` gap trace to the Stage-4 driver committing with **`git add src/ main.js` only** — it never stages `styles.css`, `package.json`, or any non-`src`/`main.js` file an implement agent edits. So every phase's CSS and config edits accumulate **uncommitted** in the working tree (visible as a persistent `M styles.css` / `M package.json`), pass the gate (tests don't check CSS), and never land. **Fix-stage action:** after the build completes, review + commit the accumulated `styles.css`/`package.json` (confirming each phase's CSS is present), and note the driver defect in the remediation record.

## Fix-stage targets
- **P1:** ensure bold/icon CSS is committed (part of the styles.css sweep).
- **P1:** column-delete `condition.field` — switch to first-leaf DFS helper.
- **P2:** add parser/column-ops tests.
- **Doc reconciliation** (packet-wide).
