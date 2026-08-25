---
title: "Feature Specification: Reports Remaining/Saved Computed Fields"
description: "Add display-only Remaining and Saved computed columns on the Reports view using the existing native formula engine against live Income, Expenses, and Sales rollups."
trigger_phrases:
  - "reports remaining"
  - "saved computed field"
  - "remaining income expenses"
  - "reports computed columns"
  - "display-only formula"
  - "computedsyncmode"
  - "rollup formula reference"
  - "savings from rollups"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/003-reports-computed-fields"
    last_updated_at: "2026-08-25T19:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored; live inspect first"
    next_safe_action: "Build 001-live-reports-inspect per its plan.md and tasks.md once predecessors ship SUM"
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
# Feature Specification: Reports Remaining/Saved Computed Fields

> Predecessor: `002-rollup-aggregation-pack`. Successor: `004-formula-ifs-switch-math`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-24 |
| **Branch** | `003-reports-computed-fields` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The finance Reports view lacks Remaining and Saved as live computed columns. Per this phase's ranked findings (`research/synthesis.md`, evidence trail in `research/research.md`), this is a config-only close of Notion's formula-on-rollup pattern: the native engine already rewrites Excel-style `[Income] - [Expenses]` to `field("…")` (`ComputedField.ts:549-554`), seeds rollups into a multi-pass evaluator (`ComputedEvaluator.ts:29-48`), and stays write-free under `computedSyncMode: display-only`. Notion formulas already consume numeric rollups, yet Reports has no per-row leftover or savings column. The single biggest risk is writing wrong `[field]` names or the Saved expression before inspecting live Reports column ids after `001-live-reports-rollups` and `002-rollup-aggregation-pack` ship: a mistype blanks the cell, and flipping the view to `automatic` sync would churn iCloud YAML on every upstream rollup change.

### Purpose
Verdict: **build it**, as vault configuration only. Configure Remaining and Saved on the Reports `db_view` as display-only computed columns evaluated by the existing native engine (`ComputedField.ts` over the `SafeEval.ts` sandbox: no arrows, no loops, no `eval`). Do not add a plugin module, do not wait on rollup MAX, and do not enable automatic sync. Leave `LET`-style 1M/3M/1Y projection formulas to successor work. Nested children below own the ordered slices: live Reports inspect first, then Remaining/Saved config, then display proofs.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Reports `db_view` computed-column configuration only. On-disk persistence is **flattened**, not nested under a `schema:` key: `computedFields` and `columns` sit next to `computedSyncMode` (`DataSource.ts:1041-1062`; parse at `:634-636,787`); a hand-edit of `schema.computedFields` is ignored. **Preferred delivery:** the Formula modal (`DatabaseView.saveFormula`, `:5678-5705`) writes `computedFields` + `type: computed` + `computedKey` together and still no-ops persistence under display-only (`:5703` → `:10337`). **Alt:** flattened YAML `computedFields` + `columns` directly.
- Remaining formula evaluated from live rollup columns through the existing multi-pass native engine. The default-blank expression is the null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` using the **inspected** field names verbatim; the numeric-zero opt-in is the bare `[Income] - [Expenses]` (see REQ-007).
- Saved/savings as a second `type: "number"` computed-field def whose inputs are the live Income, Expenses, and/or Sales rollups (exact expression UNKNOWN until implementation inspect; see Open Questions). **Default: skip Saved** if its expression would duplicate Remaining (two identical finance columns is a UX defect, not a feature); ship it only if Sales is an outflow (`[Income] - [Expenses] - [Sales]`, same null-guard) or the operator explicitly confirms a deliberate duplicate.
- Column order Income → Expenses → Remaining → Saved set on the **view** `columnOrder` (`ColumnConfig.ts:64-74`), not the `columns` array order (`normalizeColumnOrder` pushes unknown keys last, `:58-60`); keep the new keys out of `hiddenColumns` (`:100-101`). Human labels via `ComputedFieldDef.label` (`types.ts:102-104`).
- `computedSyncMode` kept explicitly `display-only`: render in the view, no write-back to Report YAML.
- Native formula syntax (`[field]` refs), not the Bases method-chaining dialect (`expressionSyntax: "base"`).
- Fail-closed blank cells for missing/non-numeric inputs via the null-guarded default expression; the blank renders as the renderer's `"-"` glyph (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`), not a truly empty cell — accept this as fail-closed display and do not file an engine bug (inline-error rendering is out of scope). The numeric-zero opt-in is the bare subtraction; do not use `IFERROR` for this decision (see REQ-007).
- Mobile-safe display of the two columns (no Platform gates exist on computed/rollup evaluation; no desktop-only APIs). Mobile/two-device byte-hash is operator-optional, not a single-implementer blocker; the desktop hash + explicit display-only YAML is the P0 persistence proof.
- iCloud-safe behavior: zero note mutations from viewing Reports on any device.

### Out of Scope
- Any edit to `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts`, `ColumnTypes.ts`, `types.ts`, `DatabaseView.ts`, `ComputedEvaluator.ts`, `ComputedSync.ts`, or other fork TypeScript.
- A new isolated `src/data/` module (e.g. a hypothetical `RemainingSaved.ts`): the `EuroFormat.ts` isolated-module pattern is inherited via existing CellRenderer/SummaryRenderer call sites, not cloned (see `plan.md` Architecture).
- Live rollup wiring (owned by `001-live-reports-rollups`).
- Aggregation-pack work such as MAX/Median/Range (owned by `002-rollup-aggregation-pack`); this phase proceeds on SUM only.
- IFS/SWITCH and further math-function expansion (successor `004-formula-ifs-switch-math`).
- `LET` and 1M/3M/1Y projection formulas (blocked: no `LET` in the fork; later LET support).
- Inline formula-error rendering in cells (fork only warns and blanks today; engine edits forbidden).
- Bases method-chaining dialect (`BaseExpression.ts` `.map`/`.filter`/`.reduce`).
- Footer summary kinds, chart aggregations, filters, templates, or conditional formatting.
- Telemetry, secrets, or desktop-only APIs.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Reports database note `db_view` configuration (personal finance vault; exact note path UNKNOWN until implementation inspect) | Modify | Add `remaining` (and `saved`, if not skipped) computed fields and matching `type: computed` columns. **Preferred:** Formula modal (`DatabaseView.saveFormula`, `:5678-5705`). **Alt:** flattened YAML `computedFields` + `columns` next to `computedSyncMode` (not nested under `schema:`; `DataSource.ts:1041-1062`). Set view `columnOrder` Income → Expenses → Remaining → Saved (`ColumnConfig.ts:64-74`); keep `computedSyncMode: display-only` explicit |
| `ComputedField.ts` in `specs/obsidian/001-notion-finance-migration/build/note-database-fork` | Do not change | `normalizeFormula` already rewrites `[name]` → `field("name")` (`:549-554`) and rollup columns read only `computed[column.key]` (`:557-572`) |
| `SafeEval.ts` in the same fork | Do not change | Existing sandbox (no arrows, no loops, no `eval`) remains the evaluation surface; `toNumber` is `Number(val)` so `Number(null) === 0` (`:962-963,1106-1108`) — this is why the null-guard is required for blank-vs-zero |
| `RelationRollup.ts`, `ComputedEvaluator.ts`, `ComputedSync.ts`, `DatabaseView.ts`, `ColumnConfig.ts`, `types.ts` in the same fork | Do not change | Rollup aggregation (SUM returns `null` when no numbers remain, `:126`), multi-pass evaluation, sync gating, view `columnOrder`, and `ComputedFieldDef` shape already cover everything this phase needs |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Remaining is a Reports computed column equal to live Income minus live Expenses | On the Reports view, Remaining displays the numeric result of the literal expression `[Income] - [Expenses]` for a row whose Income and Expenses rollups are known (known-pair proof: Income=1000, Expenses=400 → 600); the formula uses native `[field]` refs, not the Bases chaining dialect |
| REQ-002 | Formula results stay display-only | After opening and scrolling the Reports view on desktop and mobile, a byte-hash of the Report note before and after matches; `computedSyncMode` is explicitly `display-only` in the note |
| REQ-003 | Native formula engine source is untouched | `git diff` (or equivalent) on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, and `RelationRollup.ts` under `specs/obsidian/001-notion-finance-migration/build/note-database-fork` is empty for this phase |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Saved/savings is a Reports computed column fed by live rollup inputs | A Saved column exists as a second `type: "number"` computed-field def (`types.ts:102-110` shape); its expression references live Income and/or Expenses and/or Sales rollup columns exactly as inspected; it does not persist to YAML. **Default: skip Saved** if its expression would duplicate Remaining (two identical finance columns is a UX defect); ship it only if Sales is an outflow (`[Income] - [Expenses] - [Sales]` with the same null-guard) or the operator explicitly confirms a deliberate duplicate. Do not invent a percent Saved in this phase |
| REQ-005 | Config-only delivery stays mobile-safe and iCloud-safe | Remaining and Saved render on mobile with the same values as desktop; no Platform gate is added and none is needed (the two `DatabaseView.ts` Platform checks concern icon editing and bulk-editor dismissal, not cells); two devices viewing Reports generate zero note mutations. Mobile/two-device byte-hash is operator-optional — the desktop hash + explicit display-only YAML is the P0 persistence proof |
| REQ-006 | Columns are ordered and labeled for humans | View `columnOrder` is Income → Expenses → Remaining → Saved (`ColumnConfig.ts:64-74`; not the `columns` array order — `normalizeColumnOrder` pushes unknown keys last), with the new keys kept out of `hiddenColumns` (`:100-101`); each carries a short human label rather than exposing raw formulas, matching the Notion/Anytype/AppFlowy label-plus-value pattern |
| REQ-007 | Empty months fail closed to blank, with documented zero opt-in | Missing or non-numeric Income/Expenses yield a blank cell via the **null-guarded default expression** `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` — `== null` also catches `undefined` (`SafeEval.ts:972`) and genuine `0` sums stay `0` because `0 == null` is false. The blank renders as the renderer's `"-"` glyph (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`), not a truly empty cell; accept this and do not file an engine bug (inline-error rendering is out of scope). The numeric-zero opt-in is the **bare** `[Income] - [Expenses]` (rollup `null` → `0` via `Number(null)`, `SafeEval.ts:962-1108`); do **not** wrap with `IFERROR` for this decision — `iferror` only swaps Error/null/undefined/non-finite (`ComputedField.ts:294-304`) and `0` is a successful finite result, so `IFERROR(..., 0)` is a no-op here. The blank-vs-zero decision is recorded as an operator decision |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Remaining on Reports equals `[Income] - [Expenses]` from the live SUM rollups shipped by `001-live-reports-rollups`, with aggregations from `002-rollup-aggregation-pack` available; shipping does not wait on rollup MAX.
- **SC-002**: Saved/savings evaluates from those live rollup inputs and remains visible after a view refresh without writing the result into the Report note.
- **SC-003**: The phase diff contains Reports `db_view` computed-column config only; fork engine, evaluator, sync, and rollup modules are unmodified.

### Acceptance Scenarios

- **Scenario 1**: **Given** a Report row whose live Income rollup is 1000 and live Expenses rollup is 400, **when** the Reports view evaluates Remaining, **then** Remaining displays 600 from `[Income] - [Expenses]`.
- **Scenario 2**: **Given** live Income, Expenses, and Sales rollups on Reports, **when** Saved/savings evaluates, **then** the column shows a value derived only from those rollup inputs and not from a handwritten YAML field.
- **Scenario 3**: **Given** Remaining and Saved are configured display-only, **when** the Reports view is opened and scrolled on desktop and on mobile, **then** both columns render with identical values and the Report note byte-hash is unchanged.
- **Scenario 4**: **Given** this phase is implemented, **when** engine files in the note-database fork are diffed, **then** `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, and `RelationRollup.ts` show no phase changes.
- **Scenario 5**: **Given** a month row whose Income and/or Expenses rollup is `null` (no numbers remain, `RelationRollup.ts:126`), **when** Remaining evaluates with the null-guarded default `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])`, **then** the cell renders the `"-"` glyph (not `0`) and no YAML is written; if the operator opted into numeric zero via the **bare** `[Income] - [Expenses]` (where `Number(null) === 0`), the cell shows `0` instead, still without any write-back. `IFERROR(..., 0)` is not used for this decision (it is a no-op on a finite `0`).
- **Scenario 6**: **Given** a deliberately mistyped ref such as `[Incme] - [Expenses]` (negative control), **when** the view evaluates, **then** the cell blanks, the engine logs its localized error without persisting anything, and restoring the correct spelling recovers the value.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `001-live-reports-rollups` | Remaining and Saved have no live Income/Expenses/Sales inputs | Do not implement until live rollups ship; formulas reference inspected column labels/keys exactly (`getFieldValue` matches both, `ComputedField.ts:563-564`) |
| Dependency | `002-rollup-aggregation-pack` | Live rollups need SUM aggregation | Requires SUM only; do not block this phase on rollup MAX/Median/Range (`types.ts:39-44`, `RelationRollup.ts:92-129` — fork rollups are `count\|sum\|avg\|list`) |
| Risk | Wrong `[field]` names or Saved expression written before inspect | Mistype blanks the cell instead of showing Remaining/Saved | Inspect live Reports column ids after predecessors ship; do not assume the strings `Income`/`Expenses`/`Sales` until then |
| Risk | Accidental `automatic` computed sync | Every upstream rollup change stringifies and writes results (even nulls as `""`) into notes — heavy iCloud churn; sole writer is `syncComputedForFile` (`DatabaseView.ts:10244`, 5 s debounce queue at `:10286-10330`) | Keep `computedSyncMode: display-only` explicit; unknown YAML values normalize back to display-only (`ComputedSync.ts:42-45`); verify Report note bytes after render |
| Risk | Engine "fixes" for formula-on-rollup | Unwanted fork diff; breaks REQ-003 | Multi-pass evaluation already converges formula-on-rollup and formula-on-formula refs (`ComputedEvaluator.ts:29-48`); if it fails, stop and treat as a predecessor/engine defect |
| Risk | Pulling MAX, inline error UI, or LET projections into this phase | Scope creep requiring TypeScript edits (violates REQ-003) | Deferred backlog items stay marked blocked; MAX belongs to `002`, LET/errors to successor work |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Remaining and Saved ride the existing evaluation path: rollups compute in memory (`buildRelationRollups` → `valuesByPath`, `RelationRollup.ts:24-89`), the evaluator runs at most `max(defs.length, 1)` passes (`ComputedEvaluator.ts:29-48`), and nothing writes to disk. No extra note I/O, no new aggregation pass.

### Security
- **NFR-S01**: Formulas run inside the existing `SafeEval.ts` sandbox (no arrows, no loops, no `eval`). No telemetry, no secrets, no new evaluation surface.

### Reliability
- **NFR-R01**: Display-only computed values are deterministic for the same rollup inputs and never mutate Report YAML, so iCloud sees zero formula-result writes. Errors set the cell to `null` and warn on the last pass (`ComputedEvaluator.ts:68-70`); they never call `updateFrontmatter`.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Missing, empty, or non-numeric Income or Expenses: rollup SUM returns `null` when no numbers remain (`RelationRollup.ts:126`), and `getFieldValue` returns that `null` (`ComputedField.ts:568-571`). SafeEval subtraction is `toNumber(left) - toNumber(right)` and `toNumber` is `Number(val)` (`SafeEval.ts:962-963,1106-1108`), so `Number(null) === 0` — the **bare** `[Income] - [Expenses]` yields `0` on an empty month, not blank. The default-blank expression is therefore the null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` (`== null` also catches `undefined`, `SafeEval.ts:972`); genuine `0` sums stay `0` because `0 == null` is false. The blank renders as the renderer's `"-"` glyph (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`), not a truly empty cell — accept this as fail-closed display. Do **not** use `IFERROR([Income] - [Expenses], 0)` for this decision: `iferror` only swaps Error/null/undefined/non-finite (`ComputedField.ts:294-304`) and `0` is a successful finite result, so it is a no-op here.
- Currency strings: `coerceValue` strips `, ¥ ￥ $` and whitespace before `Number()` (`ComputedField.ts:590-597`), so `"1,000"` and `$400` still subtract correctly.
- Sales unused by Remaining: allowed. Saved may reference Sales only if inspection shows that intent; a formula must never target another rollup-of-rollup (rejected at `RelationRollup.ts:101`, matching Notion's loop ban). If Saved would duplicate Remaining, default to skipping Saved rather than shipping two identical finance columns.

### Error Scenarios
- Mistyped `[field]` ref: fail-closed in the existing engine — localized error string, result `null`, no persistence (`ComputedField.ts:508-546`). Do not "fix" this in `SafeEval.ts`.
- Definition order is irrelevant: multi-pass evaluation converges regardless (`ComputedEvaluator.ts:48`); `hasRollupComputedDependency` already flags formulas reading rollup keys (`ComputedEvaluator.ts:16-27`).
- If predecessors have not shipped, formulas referencing Income/Expenses/Sales must not be treated as passing verification.

### Concurrent Operations
- Two devices viewing Reports generate no note conflicts because results are never written back (display-only + in-memory rollups).
- Rebase onto upstream plugin code is unaffected: this phase changes vault `db_view` config only.
- Rollback of a stray persisted key from an earlier accidental automatic session: use the existing cleanup modal (`DatabaseView.ts:5576+`).

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Two computed columns plus order/labels on one Reports `db_view`; config only |
| Risk | 7/25 | Finance display correctness; persistence risk bounded by explicit display-only sync |
| Research | 8/20 | Decision-ready synthesis with fork line-level evidence complete (`research/synthesis.md`) |
| **Total** | **23/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

Operator decisions from the synthesis (recommended defaults in parentheses):

1. Exact Saved formula string (UNKNOWN until inspect): if Sales is an outflow from income, use `[Income] - [Expenses] - [Sales]` with the same null-guard as Remaining; if Sales is unused or is itself income, **default to skipping Saved** rather than shipping a duplicate Remaining (two identical finance columns is a UX defect) — only ship a duplicate if the operator explicitly confirms it. Do not invent a percent Saved in this phase.
2. Exact `[field]` names and Reports note path (UNKNOWN until inspect): match `col.label` or `col.key` exactly as shipped; do not assume `Income`/`Expenses`/`Sales` strings beforehand.
3. Blank vs zero on empty months (default: native blank via the null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])`, rendering the `"-"` glyph): opt into numeric zero via the **bare** `[Income] - [Expenses]` (where `Number(null) === 0`). Do not use `IFERROR(..., 0)` for this decision — it is a no-op on a finite `0`.
4. Wait for rollup MAX before shipping? (Default: no.) Proceed on SUM; MAX/Median/Range stay in `002` or footer `SummaryRenderer` (which already has MAX).
5. Enable `automatic` computed sync? (Default: never on an iCloud vault.) Keep display-only.
6. New EuroFormat-style `src/` module for Remaining/Saved? (Default: no — spec forbids it; CellRenderer/SummaryRenderer already format these cells.)
7. Percent-of-income Saved, inline error rendering, `LET` projections? (Default: defer — backlog items 7, 9, 10 in `research/synthesis.md`; successor `004` owns IFS/SWITCH/math expansion.)

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md` (ranked findings), `research/research.md` (evidence trail)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-live-reports-inspect/ | Inspect live Reports `db_view` after predecessors ship SUM; lock Remaining/Saved expressions and blank-vs-zero; no formula write | Planned |
| 2 | 002-remaining-saved-config/ | One config transaction: Remaining, Saved if distinct, view columnOrder, human labels, explicit display-only | Planned |
| 3 | 003-reports-display-proof/ | Known-pair, empty-month, mistype, desktop hash, and engine-freeze proofs with packet evidence | Planned |

Future / out of this phase (not child folders): percent-of-income Saved; rollup MAX/Median/Range; inline formula-error cells; LET / 1M-3M-1Y projections.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-live-reports-inspect | 002-remaining-saved-config | Written inspect record answers Open Q1-Q3 with live `col.key`/`col.label` (names not assumed), Sales meaning, SUM confirmed, Remaining/Saved expressions locked including blank-vs-zero; no formula YAML yet | Inspect record exists in the 001 child docs; predecessors `001-live-reports-rollups` and `002-rollup-aggregation-pack` shipped SUM |
| 002-remaining-saved-config | 003-reports-display-proof | Remaining (and Saved unless skipped) present as `type: number` computed fields; view `columnOrder` is Income, Expenses, Remaining, Saved; `computedSyncMode: display-only` explicit; no engine TypeScript diff | Formula modal or flattened YAML shows the defs; `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` |
<!-- /ANCHOR:phase-map -->
