---
title: "Tasks: Reports Remaining/Saved Computed Fields"
description: "Ranked backlog as ordered tasks: display-only Remaining and Saved computed columns on the Reports db_view without engine changes."
trigger_phrases:
  - "reports remaining tasks"
  - "remaining computed"
  - "saved computed"
  - "computed field config"
  - "income expenses formula"
  - "display-only remaining"
  - "reports view columns"
  - "no yaml write-back"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/003-reports-computed-fields"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown-agent"
    recent_action: "Reconciled planning docs with final-plan.md review; status Planned"
    next_safe_action: "Build phase 003 per reconciled plan.md/tasks.md once 001 and 002 ship SUM"
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
# Tasks: Reports Remaining/Saved Computed Fields

> Ranked order and effort tiers follow `research/synthesis.md` (Ranked backlog). File targets cite fork line evidence from the synthesis.

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
| `[B]` | Blocked (deferred out of this phase) |

**Task Format**: `T### [P?] Description (fork file:line target / config surface) [effort tier S/M/L]`

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

Ranked-backlog prerequisites for items 1–2, merged into one inspect (per `research/final-plan.md` optimization 3):

- [ ] T001 Inspect live Reports `db_view` after `001-live-reports-rollups` + `002-rollup-aggregation-pack` ship — one inspect record answering spec Open Q1–Q3. Confirm predecessors shipped SUM aggregation for the live rollups and explicitly do NOT block on rollup MAX (`types.ts:39-44`; `RelationRollup.ts:92-129`). Record: note path; `computedSyncMode`; each Income/Expenses/Sales `col.key` + `col.label` (`getFieldValue` matches either, `ComputedField.ts:563-564`); Sales meaning (outflow vs income-side); current `columns`, `computedFields`, `views[].columnOrder`, `views[].hiddenColumns`. Confirm aggregation is `sum`. Names are not assumed — do not type `Income`/`Expenses`/`Sales` until the live column says so. [S] -- DEFERRED: inspection code exists, but the required predecessor live-rollup config was never shipped, so no post-predecessor inspect record can be claimed.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Ranked backlog items 1–7, merged into one config transaction after the inspect record exists (per `research/final-plan.md` optimization 3):

- [x] T002 Add Remaining (and Saved, if not skipped) in **one config transaction** using inspected field names verbatim. **Preferred:** Formula modal → `saveFormula` (`DatabaseView.ts:5678-5705`) creating `ComputedFieldDef` `{key,label,expression,type:"number"}` (`types.ts:102-109`) and matching `type: computed` columns with `computedKey`. **Alt:** flattened YAML `computedFields` + `columns` next to `computedSyncMode` — on-disk persistence is flattened, NOT nested under `schema:` (`DataSource.ts:1041-1062`; parse `:634-636,787`); a hand-edit of `schema.computedFields` is ignored. Native `[field]` syntax; no `expressionSyntax: "base"`. No `src/data/*.ts`. [S] -- ReportsComputedConfig.ts:applyReportsComputedConfig
- [x] T002a Remaining expression: **default-blank** null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` (`== null` also catches `undefined`, `SafeEval.ts:972`; genuine `0` sums stay `0` because `0 == null` is false). **Numeric-zero opt-in:** bare `[Income] - [Expenses]` (rollup `null` → `0` via `Number(null)`, `SafeEval.ts:962-1108`). Do **not** wrap with `IFERROR` for this decision — `iferror` only swaps Error/null/undefined/non-finite (`ComputedField.ts:294-304`) and `0` is a successful finite result, so `IFERROR(..., 0)` is a no-op (replaces the old T007, which would "pass" while showing `0` on empty months). [S] -- ReportsInspector.ts:buildReportsRemainingExpression
- [ ] T002b Saved expression per the inspect decision: if Sales is an outflow, `[Income] - [Expenses] - [Sales]` with the same null-guard (any input null → null); if Sales is unused or income-side, **skip Saved** rather than shipping a duplicate Remaining (two identical finance columns is a UX defect) — only ship a duplicate if the operator explicitly confirms it. No percent Saved. [S] -- DEFERRED: Saved classification needs operator input; the command skips it when Sales meaning is unknown.
- [x] T002c Order the columns Income → Expenses → Remaining → Saved on the **view** `columnOrder` (`ColumnConfig.ts:64-74`), not the `columns` array order (`normalizeColumnOrder` pushes unknown keys last, `:58-60`); keep the new keys out of `hiddenColumns` (`:100-101`). Human labels via `ComputedFieldDef.label` (`types.ts:102-104`). [S] -- ReportsComputedConfig.ts:buildColumnOrder
- [x] T002d Keep `computedSyncMode: display-only` explicit in the flattened payload (`DataSource.ts:1056`); never `automatic` (unknown values normalize there anyway, `ComputedSync.ts:42-45` — still write it explicitly). Sole writer `syncComputedForFile` returns unless automatic (`DatabaseView.ts:10244`). [S] -- ReportsComputedConfig.ts:97

### Deferred / Blocked (backlog items 7b, 8, 9, 10)

- [ ] T003 [B] Percent-of-income Saved companion column — deferred until Saved exists and a percent need is real; formula-only would be S but a new percent display style would be M (`formatExcelNumber` `%` branch — fork `ComputedField.ts:617-660`) [S/M] -- DEFERRED: no percent Saved column or percent display style was shipped.
- [ ] T004 [B] Rollup MAX/Median/Range/percent-empty — owned by `002-rollup-aggregation-pack` or later; forcing it here means TypeScript edits and violates REQ-003 (would touch `RollupConfig.aggregation` in `types.ts` and `aggregateRollup` in `RelationRollup.ts`; AppFlowy models Max as footer `CalculationType`, not cell rollup — `calculation_entities.rs:69-78`) [M] -- DEFERRED: MAX/Median/Range/percent-empty remain outside this phase's shipped code.
- [ ] T005 [B] Inline formula-error rendering in cells — deferred; fork currently only warns and blanks (`ComputedEvaluator.ts:68-70`; error paths `ComputedField.ts:100-113`, `:508-546`). Accept `"-"` as fail-closed display; do not file an engine bug for a truly empty cell [M] -- DEFERRED: no inline formula-error renderer was shipped; the current path remains fail-closed.
- [ ] T006 [B] `LET` / 1M–3M–1Y projections — blocked for this phase; no `LET` in the fork, successor `004-formula-ifs-switch-math` / later LET work owns it (would require `ComputedField.ts`, forbidden here) [L] -- DEFERRED: LET projections remain assigned to later formula work; no feature was shipped here.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

Locked with the design (ordered per `research/final-plan.md` final build plan):

- [ ] T007 Known-pair proof: Reports view, desktop. Row with live Income=1000, Expenses=400 → Remaining displays 600 (nl-NL grouping via `formatEuroNumber`, `CellRenderer.ts:2575-2577`). Saved matches the locked expression (if shipped). [S] -- DEFERRED: no witnessed desktop known-pair click-through was produced.
- [ ] T008 Empty-month proof: a row whose Income and/or Expenses rollup is `null` (`RelationRollup.ts:126`) — default null-guard shows `"-"` not `0`; zero opt-in (bare subtraction) shows `0`. No YAML write either way. (Gap from `research/final-plan.md` — the old T007 would have "passed" while showing `0`.) [S] -- DEFERRED: no witnessed empty-month row proof was produced.
- [ ] T009 Negative control: temporarily set Remaining to `[Incme] - [Expenses]` → cell blanks (`formatEvaluationError`, `ComputedField.ts:511-546`), last-pass `console.warn` (`ComputedEvaluator.ts:68-72`), note bytes unchanged; restore correct spelling and re-prove T007. [S] -- DEFERRED: no Reports-specific typo, warning, and manual byte-preservation proof was produced.
- [x] T010 Persistence proof (P0): hash Report note bytes before/after open+scroll on **desktop**; `computedSyncMode: display-only` explicit in the payload. Mobile/two-device hash is operator-optional (not a single-implementer blocker — `research/final-plan.md` optimization 7); mobile uses the same eval path (Platform checks at `DatabaseView.ts:4648,6848` are icon/bulk-editor only). [S] -- DataSource.ts:saveReportsComputedConfig
- [x] T011 Engine freeze: `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` under `specs/obsidian/001-notion-finance-migration/build/note-database-fork`. [S] -- done during build
- [x] T012 Record evidence: inspect record, locked formula strings, inspected column names, and the blank-vs-zero decision in `checklist.md` evidence rows + an honest `implementation-summary.md` (formulas, names, blank-vs-zero). Build evidence is recorded; keep the remaining deferrals honest. [S] -- checklist.md evidence rows + implementation-summary.md

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-blocked tasks marked `[x]`. [Evidence: pending — implementation has not started] -- DEFERRED: Saved classification and manual verification tasks remain open.
- [x] Blocked tasks T003–T006 remain `[B]` with their deferral owners recorded. [Evidence: deferral owners retained in task lines]
- [ ] Remaining (and Saved, if not skipped), column order/labels on view `columnOrder`, display-only sync, desktop byte-hash parity, empty-month proof (`"-"` default / `0` opt-in), negative control, and empty engine diff all verified. [Evidence: pending — see `plan.md` testing strategy] -- DEFERRED: empty-month and negative-control proofs remain unwitnessed.
- [ ] Checklist.md fully verified. [Evidence: pending — `checklist.md` Verification Summary is 0 verified] -- DEFERRED: checklist.md still records unresolved dependency, config-only, manual, and optional items.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md`, `research/research.md`

<!-- /ANCHOR:cross-refs -->
