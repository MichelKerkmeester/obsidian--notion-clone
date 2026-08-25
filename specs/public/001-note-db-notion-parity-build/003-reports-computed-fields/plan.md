---
title: "Implementation Plan: Reports Remaining/Saved Computed Fields"
description: "Config-only plan to add display-only Remaining and Saved formulas on the Reports view using the existing native computed-field engine."
trigger_phrases:
  - "reports remaining plan"
  - "computed column config"
  - "native formula engine"
  - "remaining formula"
  - "saved formula"
  - "display-only computed"
  - "no engine changes"
  - "reports db_view"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/003-reports-computed-fields"
    last_updated_at: "2026-08-24T00:00:00Z"
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
# Implementation Plan: Reports Remaining/Saved Computed Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian note-database fork + vault `db_view` YAML/config; native Excel-style formulas |
| **Framework** | Existing `ComputedField.ts` engine (`SafeEval.ts` sandbox); Reports view computed columns |
| **Storage** | Display-only computed values (no Report YAML write-back; iCloud-safe) |
| **Testing** | Manual Reports view on desktop and mobile; Report note byte-hash before/after; negative control with a mistyped `[field]`; empty engine `git diff` |

### Overview
Wave 2, effort S, value 5. Verdict from `research/synthesis.md`: build it as a config-only close of Notion's formula-on-rollup pattern. After `001-live-reports-rollups` and `002-rollup-aggregation-pack` ship, inspect the live Reports column ids, then add Remaining = `[Income] - [Expenses]` and Saved (expression chosen at inspect) to the Reports `db_view`, ordered Income → Expenses → Remaining → Saved with human labels. The fork already evaluates `[field]` refs in multiple passes over in-memory rollups, so a formula can reference a rollup without engine work. `computedSyncMode` stays explicitly display-only. Do not imitate the `EuroFormat.ts` isolated `src/data/` module here: inherit its formatting call sites, add no TypeScript. `LET` projections stay out until later LET support.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Predecessor `001-live-reports-rollups` has shipped live Income, Expenses, and Sales rollups on Reports.
- [ ] Predecessor `002-rollup-aggregation-pack` has shipped SUM aggregation for those rollups (MAX not required for this phase — do not block on it).
- [ ] Live Reports `db_view` inspected: exact `col.label`/`col.key` strings for Income/Expenses/Sales (`getFieldValue` matches both, `ComputedField.ts:563-564`), Sales' meaning (inflow vs outflow), and the note's path.
- [ ] Native engine confirmed read-only: `[field]` → `field("name")` rewrite (`ComputedField.ts:549-554`), multi-pass evaluation (`ComputedEvaluator.ts:29-48`), `SafeEval.ts` sandbox.

### Definition of Done
- [ ] Remaining column present on Reports; known pair Income=1000/Expenses=400 renders 600. Default expression is the null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` using inspected names.
- [ ] Saved/savings column present as a second `type: "number"` def fed only by live rollup inputs — **or deliberately skipped** if its expression would duplicate Remaining (with the skip recorded).
- [ ] Column order Income → Expenses → Remaining → Saved set on the view `columnOrder`, with human labels; new keys not in `hiddenColumns`.
- [ ] `computedSyncMode: display-only` explicit in the flattened payload; Report note byte-hash identical after open+scroll on desktop (P0). Mobile/two-device hash is operator-optional.
- [ ] No edits to `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts`, or any other fork module.
- [ ] Empty-month proof: default shows `"-"` not `0`; zero opt-in (bare subtraction) shows `0`. Blank-vs-zero decision recorded; `IFERROR` not used for this decision.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Vault-config computed columns on top of an already-capable native formula engine. No plugin module, no call-site TypeScript edits, no write-back. Predecessors supply live rollup inputs; this phase only names those columns in formulas.

### Key Components
- **Core algorithm (already in the fork; do not reimplement).** Live Income/Expenses/Sales rollups compute in memory via `buildRelationRollups` → `valuesByPath` (`RelationRollup.ts:24-89`) and are injected as `context.derivedValues`. `evaluateComputedFields` copies that map into `result` and re-evaluates every `ComputedFieldDef` for `max(defs.length, 1)` passes until formula-on-rollup and formula-on-formula refs converge (`ComputedEvaluator.ts:29-48`). Each expression loses its leading `=` and every `[Name]` becomes `field("Name")` (`ComputedField.ts:549-554`). If the matched column `type === "rollup"`, `getFieldValue` reads only `computed[column.key]` so stale YAML cannot shadow live rollups (`ComputedField.ts:557-572`). Errors set the cell to `null` and warn on the last pass (`ComputedEvaluator.ts:68-70`) — they never call `updateFrontmatter`. Rollup-of-rollup is rejected at `RelationRollup.ts:101`, matching Notion's loop ban.
- **Reports `db_view` computed columns**: the only mutation surface. **On-disk persistence is flattened, not nested under a `schema:` key** — `toDatabasePayload` writes `computedFields` and `columns` next to `computedSyncMode` (`DataSource.ts:1041-1062`; parse at `:634-636,787`); a hand-edit of `schema.computedFields` is ignored. Column **order** lives on the view as `views[].columnOrder` (`ColumnConfig.ts:44-74`, `getVisibleColumns` at `:77-101`), not the `columns` array order — `normalizeColumnOrder` pushes unknown keys last (`:58-60`), so Remaining/Saved must be inserted explicitly and kept out of `hiddenColumns` (`:100-101`). **Preferred delivery:** the Formula modal via `DatabaseView.saveFormula` (`:5678-5705`), which writes `computedFields` + `type: computed` + `computedKey` together and still no-ops persistence under display-only (`:5703` → `:10337`). **Alt:** flattened YAML directly. Locked def shape (`ComputedFieldDef`, `types.ts:102-109`):

```yaml
# Flattened under the database payload — NOT under a schema: key
computedSyncMode: display-only
computedFields:
  - key: remaining
    label: Remaining
    expression: "IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])"
    type: number
  # saved: only if Sales is an outflow or a deliberate duplicate is confirmed
  - key: saved
    label: Saved
    expression: "<inspect-time; see spec.md Open Questions — same null-guard>"
    type: number
# columns: matching type: computed entries with computedKey: remaining|saved
# views[].columnOrder: [..., income, expenses, remaining, saved]  (view-level, not columns-array order)
```

  Use native `[field]` syntax; no `expressionSyntax: "base"`. The default-blank expression is the null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` (inspected names verbatim); the numeric-zero opt-in is the bare `[Income] - [Expenses]` (`Number(null) === 0`). Do **not** wrap with `IFERROR` for blank-vs-zero — `iferror` only swaps Error/null/undefined/non-finite (`ComputedField.ts:294-304`) and `0` is a successful finite result, so `IFERROR(..., 0)` is a no-op. No `src/data/*.ts`.
- **Sandbox (`SafeEval.ts`)**: no arrows, no loops, no `eval`. Formulas stay arithmetic/`[field]` expressions.
- **Live rollups (predecessor `001-live-reports-rollups`)**: Income, Expenses, Sales as display-only SUM rollups. Aggregations come from predecessor `002`; this phase adds none and must not wait on MAX.
- **EuroFormat isolated-module pattern: inherit, do not clone.** The established rebase recipe is the existing module `src/data/EuroFormat.ts` (header: one module, small rebasable diff) with three production call sites already formatting computed/number cells: `views/CellRenderer.ts:13` (import), `:198` (`formatEuroCurrency`), `:2576` (`formatEuroNumber`); footer numbers via `views/SummaryRenderer.ts:7` (import) and `:556` (`formatEuroNumber2`). Remaining/Saved ride that path automatically (`row.computed[col.computedKey || col.key]`). Do **not** add `RemainingSaved.ts` or a fourth call site. Clone the pattern only later if a percent/currency style cannot be expressed via `numberDisplayStyle` / existing `TEXT()`/`%` formatting (`ComputedField.ts:617-660`).
- **Not used**: `BaseExpression.ts` Bases dialect; new `src/data/` modules.

### Data Flow
Live relation rollups compute Income, Expenses, and Sales for a Report row (predecessors) entirely in memory. The evaluator's later passes resolve Remaining = `[Income] - [Expenses]` and Saved from those same derived values; matched rollup columns read only live `computed[column.key]`. CellRenderer/SummaryRenderer format both numbers through the inherited EuroFormat call sites. Nothing in that path writes the computed numbers back to the Report note, so iCloud sees no formula-result churn. Mobile uses the same config and engine — no Platform gate exists on computed/rollup evaluation (the only two `DatabaseView.ts` Platform checks concern icon editing and bulk-editor dismissal).

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm `001-live-reports-rollups` and `002-rollup-aggregation-pack` have shipped; confirm the live rollups aggregate with SUM (MAX is not needed).
- [ ] Inspect the live Reports `db_view`: exact column labels/keys for Income, Expenses, Sales; whether Sales is an outflow or income-side; the note's path; current `computedSyncMode`.
- [ ] Record the inspection results against the Open Questions in `spec.md` (Saved expression, exact `[field]` names, blank-vs-zero opt-in).
- [ ] Read fork sources only to confirm capability; make no edits anywhere under `specs/obsidian/001-notion-finance-migration/build/note-database-fork`.

### Phase 2: Core Implementation
- [ ] Add Remaining and Saved in **one config transaction** after the inspect record exists. **Preferred:** Formula modal → `saveFormula` (`DatabaseView.ts:5678-5705`) creating `ComputedFieldDef` `{key,label,expression,type:"number"}` (`types.ts:102-109`) and matching `type: computed` columns with `computedKey`. **Alt:** flattened YAML `computedFields` + `columns` next to `computedSyncMode` (not under `schema:`). Use inspected field names verbatim.
- [ ] Remaining expression: null-guarded default `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])`. Numeric-zero opt-in: bare `[Income] - [Expenses]` (`Number(null) === 0`). Do not wrap with `IFERROR` for blank-vs-zero.
- [ ] Saved expression per the inspect decision: if Sales is an outflow, `[Income] - [Expenses] - [Sales]` with the same null-guard (any input null → null); if Sales is unused or income-side, **skip Saved** unless the operator explicitly confirms a deliberate duplicate. No percent Saved.
- [ ] Order the columns Income → Expenses → Remaining → Saved on the **view** `columnOrder` (`ColumnConfig.ts:64-74`), not the `columns` array; keep the new keys out of `hiddenColumns`. Give each a human label.
- [ ] Keep `computedSyncMode: display-only` explicit in the payload (`DataSource.ts:1056`); never `automatic` (unknown values normalize there anyway, `ComputedSync.ts:42-45` — still write it explicitly).
- [ ] Leave all fork TypeScript untouched — no new module, no fourth formatting call site.

### Phase 3: Verification
- [ ] Prove Remaining against a known pair (Income=1000, Expenses=400 → Remaining 600; nl-NL grouping via `formatEuroNumber`, `CellRenderer.ts:2575-2577`).
- [ ] Prove Saved (if shipped) evaluates from live rollups and survives a view refresh without persisting.
- [ ] Empty-month proof: a row whose Income and/or Expenses rollup is `null` (`RelationRollup.ts:126`) — default shows `"-"` not `0`; zero opt-in (bare subtraction) shows `0`. No YAML write either way.
- [ ] Negative control: temporarily use `[Incme] - [Expenses]` → cell blanks (`formatEvaluationError`, `ComputedField.ts:511-546`), last-pass `console.warn` (`ComputedEvaluator.ts:68-72`), note bytes unchanged; restore and re-prove the known pair.
- [ ] Persistence proof (P0): hash the Report note bytes before/after open+scroll on **desktop**; `computedSyncMode: display-only` explicit in the payload. Mobile/two-device hash is operator-optional (not a single-implementer blocker); mobile uses the same eval path (the two `DatabaseView.ts` Platform checks at `:4648,6848` are icon/bulk-editor only).
- [ ] Prove `git diff` is empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts`.
- [ ] Record evidence: inspect record, locked expressions, inspected names, and the blank-vs-zero decision in `checklist.md` and an honest `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual arithmetic | Remaining = Income − Expenses on a known Reports row (1000 − 400 → 600) | Obsidian Reports view (desktop) |
| Manual savings | Saved/savings from live rollup inputs after refresh (only if Saved is shipped) | Obsidian Reports view (desktop + mobile) |
| Empty-month proof | Row with `null` Income/Expenses rollup: default null-guard shows `"-"` not `0`; bare-subtraction opt-in shows `0`; no YAML write either way | Reports view row crafted for the case |
| Negative control (persistence) | Byte-hash of the Report note identical before/after open+scroll on desktop (P0); mobile/two-device hash operator-optional | File hash of the Report note |
| Negative control (formula) | Mistyped ref `[Incme] - [Expenses]` blanks the cell fail-closed with no persistence, then restores cleanly | Reports view edit + restore |
| Edge cases | Missing/non-numeric inputs → `"-"` via null-guard (bare subtraction yields `0`, so the guard is required); currency strings `"1,000"`/`$400` coerce correctly; definition order irrelevant; Sales unused by Remaining allowed; Saved skipped if it would duplicate Remaining | Reports view rows crafted for each case |
| Constraint (engine) | No plugin source changed in this phase | `git diff` on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` under `specs/obsidian/001-notion-finance-migration/build/note-database-fork` |
| Constraint | Mobile-safe, iCloud-safe, MIT-forkable config, no telemetry/secrets | Mobile Reports view; review `db_view` config for write-back flags |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-live-reports-rollups` | Phase predecessor | Must ship first | No live Income/Expenses/Sales inputs for formulas |
| `002-rollup-aggregation-pack` | Phase predecessor | Must ship SUM first | Rollups cannot aggregate; MAX/Median/Range gaps stay in `002` and do not block this phase |
| `ComputedField.ts` + `SafeEval.ts` + `RelationRollup.ts` | Fork, existing | Capable per synthesis line evidence | This phase forbids engine work; a real engine gap would halt the phase |
| Reports `db_view` access | Vault config | Required | Cannot add computed columns |
| `LET` / 1M/3M/1Y projections | Later work | Out of scope | Does not block Remaining or Saved |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Remaining or Saved shows wrong values, writes YAML, requires engine edits, or depends on unshipped predecessors.
- **Procedure**: Remove the two `computedFields` entries and their matching `type: computed` columns from the Reports `db_view`, restoring the previous view config. Unknown sync-mode values normalize back to display-only automatically (`ComputedSync.ts:42-45`). If a stray persisted key exists from an earlier accidental automatic session, remove it with the existing cleanup modal (`DatabaseView.ts:5576+`). Do not revert fork TypeScript (this phase must not have changed it). Re-open Reports and confirm Income/Expenses/Sales rollups still display from predecessors.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | `001-live-reports-rollups`, `002-rollup-aggregation-pack` (SUM) | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup (inspect + decide) | Low | 30–45 minutes |
| Core Implementation (one config transaction) | Low | 20 minutes |
| Verification (known pair + empty month + mistype + hash + empty git diff) | Low | 45–60 minutes |
| **Total** | | **~2 hours (effort S)** |

The S tier covers the config mutation only. It does **not** include inventing expressions before inspect, and T007-as-originally-written (which would "pass" while showing `0` on empty months) is replaced by the null-guarded default. Do not add a module. Deferred items carry larger tiers per the synthesis backlog: percent-of-income Saved S/M, rollup MAX M, inline error UI M, LET projections L — all outside this phase.

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Predecessors `001-live-reports-rollups` and `002-rollup-aggregation-pack` confirmed shipped.
- [ ] Copy of the current Reports `db_view` configuration saved for restore.
- [ ] Engine, evaluator, sync, and rollup modules confirmed unmodified before editing view config.
- [ ] `computedSyncMode` confirmed display-only in the saved copy (never automatic on an iCloud vault).

### Rollback Procedure
1. Restore the previous Reports `db_view` configuration from the saved copy.
2. Confirm Remaining and Saved columns are gone and live rollups still render.
3. Confirm Report YAML carries no written-back formula fields; delete any accidental persisted keys via the existing cleanup modal if a write-back flag was ever turned on.
4. Confirm fork TypeScript still has no phase diff.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: Config-only. Display-only formulas do not persist results, so there is no computed-value data store to reverse. If write-back was enabled by mistake, remove the persisted keys from Report notes and set `computedSyncMode` back to display-only (unknown values normalize there automatically anyway).

<!-- /ANCHOR:enhanced-rollback -->
