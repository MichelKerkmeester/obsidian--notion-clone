# Final Plan: Reports Remaining/Saved Computed Fields
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

**Solid.** Verdict is correct: **build it, config-only**. The native engine already rewrites `[Name]` → `field("Name")` (`ComputedField.ts:549-554`), seeds rollups into a multi-pass evaluator (`ComputedEvaluator.ts:35-48`), and reads rollup columns only from `computed[column.key]` so YAML cannot shadow live sums (`ComputedField.ts:564-571`). Display-only is the real iCloud control: `syncComputedForFile` returns unless automatic (`DatabaseView.ts:10244`), `syncComputedFieldsNow` does the same unless `force` (`DatabaseView.ts:10337-10338`), and unknown YAML modes normalize to display-only (`ComputedSync.ts:42-45`). SUM is already in the rollup union (`types.ts:44`; `RelationRollup.ts:92-129`); blocking on MAX is correctly rejected (synthesis backlog item 4). EuroFormat is correctly **inherited, not cloned** — `CellRenderer.ts:13,198` and `formatNumber` at `:2576` already format number cells; `SummaryRenderer.ts:7,556` already formats footers. REQ-003 (empty engine diff) is the right freeze.

**Wrong, and it will ship a silent-0 finance column if uncaught.** Spec REQ-007 / synthesis F7.1 / T007 claim empty months fail closed to a blank cell because “arithmetic throws.” That is not what this sandbox does. Rollup SUM with no numbers returns `null` (`RelationRollup.ts:126`, `emptyRollupValue` at `:159-160`). `getFieldValue` then returns that `null` (`ComputedField.ts:568-571`). SafeEval subtraction is `toNumber(left) - toNumber(right)` (`SafeEval.ts:962-963`) and `toNumber` is `Number(val)` (`SafeEval.ts:1106-1108`). `Number(null) === 0`. So `[Income] - [Expenses]` on a month with no data evaluates to **0**, not null; a row with Income=1000 and a null Expenses rollup evaluates to **1000**. `IFERROR(..., 0)` does not save this: `iferror` only swaps Error/null/undefined/non-finite (`ComputedField.ts:294-304`), and `0` is a successful finite result. The opt-in the docs advertise is a no-op; the default they promise is the opposite of live behavior.

**YAML sketch is the in-memory shape, not the on-disk shape.** Plan §3 writes `schema.computedFields`. Persistence flattens: `toDatabasePayload` writes `computedFields` and `columns` next to `computedSyncMode`, not under a `schema:` key (`DataSource.ts:1041-1062`; parse at `:634-636,787`). A hand-edit of `schema.computedFields` is ignored. Column **order** is `views[].columnOrder` (`ColumnConfig.ts:44-74`, `getVisibleColumns` at `:77-101`), not `schema.columns` array order. T005 as written will append Remaining/Saved at the end (`normalizeColumnOrder` pushes unknown keys last, `:58-60`).

**Under-weighted from synthesis.** Inspect-before-write of live `col.label`/`col.key` (Open Q2) is load-bearing and correctly gated, but T003 still bakes the strings `Income`/`Expenses`. Saved-duplicating-Remaining is treated as fine (REQ-004); two identical finance columns is a UX defect, not a feature. Renderer empty-number glyph is `"-"` (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`), not a truly empty cell — “blank” in the spec is a dash. T017 two-device proof is not something a single implementer can close; T014 hash-after-scroll plus the automatic-sync gate **is**. Predecessor hard-stop is right; 003 has zero value until 001/002 have live SUM rollups.

**Effort.** “2 hours / S” is right for the config mutation. It is wrong if it includes inventing expressions before inspect, or if T007 is executed as written (it would “pass” while showing 0 on empty months). Re-budget: inspect+decide 30–45 min, config 20 min, verification (known pair + empty month + mistype + hash + empty git diff) 45–60 min. Still **S**. Do not add a module.

## Optimizations

1. **Replace T007.** Default blank expression (after inspect substitutes real names):
   `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])`.
   `== null` also catches `undefined` (`SafeEval.ts:972`). Genuine `0` sums stay `0` because `0 == null` is false. Opt-in numeric zero: **bare** `[Income] - [Expenses]` (null→0 via `Number`). Do not wrap with `IFERROR` for this decision.
2. **Do not hand-edit a `schema:` key.** Prefer the Formula modal (`DatabaseView.saveFormula` at `:5678-5705`): it writes `computedFields` + `type: computed` + `computedKey` together and still no-ops persistence under display-only (`:5703` → `:10337`). If YAML is used, edit flattened `database.computedFields` / `database.columns` / `database.views[].columnOrder` (and keep the keys out of `hiddenColumns`).
3. **Merge T001+T002** (one inspect). **Merge T003–T006** into one config transaction after the inspect record exists. T008–T011 stay `[B]`.
4. **Saved default:** if Sales is an outflow, `[Income] - [Expenses] - [Sales]` with the same null-guard (any input null → null). If Sales is unused or income-side, **do not ship a duplicate Remaining** unless the operator explicitly wants two identical columns; otherwise skip Saved or wait for a distinct expression. Do not invent `% Saved` (backlog 7).
5. **Accept `"-"` as fail-closed display.** Do not file an engine bug to get a truly empty cell (that is T010, forbidden).
6. **EuroFormat:** zero new `src/` files, zero call-site edits. Remaining/Saved ride `row.computed[col.computedKey || col.key]` (`ColumnDisplay.ts:63-65`).
7. **Drop T017 as a blocker**; keep it as operator-optional. Desktop hash + display-only YAML is the P0 persistence proof.

## Final build plan (ordered)

Hard gate: `001-live-reports-rollups` and `002-rollup-aggregation-pack` have shipped live SUM rollups. If not, stop. No formulas, no YAML.

| Step | Module / call site | Effort | Acceptance | Depends on |
|------|-------------------|--------|------------|------------|
| 1. Inspect live Reports `db_view` | Vault note parsed by `DataSource.parseDatabaseConfig` (`:627-637,787`). Record: note path; `computedSyncMode`; each Income/Expenses/Sales `col.key` + `col.label` (`getFieldValue` matches either, `ComputedField.ts:563-564`); Sales meaning; current `columns`, `computedFields`, `views[].columnOrder`, `views[].hiddenColumns`. Confirm aggregation is `sum` (`types.ts:44`). | S | Written inspect record answering spec Open Q1–Q3. Names not assumed. | 001+002 shipped |
| 2. Lock expressions | Config strings only. Remaining = null-guarded subtraction using **inspected** names. Saved per Sales decision above. Sync stays `display-only`. | S | Expressions quoted in the inspect record; IFERROR not used for blank-vs-zero. | Step 1 |
| 3. Add Remaining + Saved | **Preferred:** Formula modal → `saveFormula` (`DatabaseView.ts:5678-5705`) creating `ComputedFieldDef` `{key,label,expression,type:"number"}` (`types.ts:102-109`) and matching `type: computed` columns with `computedKey`. **Alt:** flattened YAML `computedFields` + `columns` (`DataSource.ts:1058-1059`). Native `[field]` syntax; no `expressionSyntax: "base"`. No `src/data/*.ts`. | S | Both defs present; `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts`. | Step 2 |
| 4. Order + labels | Edit **view** `columnOrder` (`ColumnConfig.ts:64-74`) to Income → Expenses → Remaining → Saved. Human `label`s (`types.ts:104`). Ensure keys not in `hiddenColumns` (`:100-101`). | S | Left-to-right order in the table is that sequence. | Step 3 |
| 5. Pin display-only | `computedSyncMode: display-only` explicit in the payload (`DataSource.ts:1056`). Never `automatic`. | S | YAML shows display-only; `normalizeComputedSyncMode` would already coerce unknowns (`ComputedSync.ts:42-45`) — still write it explicitly. | Step 3 |
| 6. Known-pair proof | Reports view, desktop. Row with live Income=1000, Expenses=400. | S | Remaining displays 600 (nl-NL grouping via `formatEuroNumber`, `CellRenderer.ts:2575-2577`). Saved matches the locked expression. | Steps 3–5 |
| 7. Empty-month proof | Row whose Income and/or Expenses rollup is `null` (`RelationRollup.ts:126`). | S | Default: Remaining shows `"-"` not `0`. Zero opt-in: shows `0` from bare subtraction. No YAML write. | Step 6 |
| 8. Negative control | Temporarily `[Incme] - [Expenses]` (`formatEvaluationError`, `ComputedField.ts:511-546`). | S | Cell `"-"`; last-pass `console.warn` (`ComputedEvaluator.ts:68-72`); note bytes unchanged; restore + re-prove step 6. | Step 6 |
| 9. Persistence + mobile | Hash Report note before/after open+scroll. Same on mobile if available. | S | Hashes match. Mobile uses the same eval path (Platform checks at `DatabaseView.ts:4648,6848` are icon/bulk-editor only). | Step 5 |
| 10. Engine freeze | `git diff` on the four files under the live fork (`…/Obsidian Plugin/src/data/`). | S | Empty. | Steps 3–9 |
| 11. Record evidence | `checklist.md` rows + honest `implementation-summary.md` (formulas, names, blank-vs-zero). | S | Inspect record and decisions are in the packet, not only in chat. | Step 10 |

Deferred stays deferred: percent Saved (T008), rollup MAX (T009 / phase 002), inline errors (T010), LET projections (T011 / 005).

## Risks & open decisions

| Item | Recommended default |
|------|---------------------|
| Empty month shows 0 with the spec’s literal `[Income] - [Expenses]` because `Number(null)===0` (`SafeEval.ts:962-1108`) | **Guard with `IF(OR(...== null), null, …)`.** Treat `"-"` as the fail-closed glyph. |
| Exact `[field]` names / note path | **Inspect after 001/002.** Do not type `Income` until the live column says so. |
| Saved formula | Sales outflow → subtract Sales (null-guarded). Else **skip Saved** or confirm a deliberate duplicate. No percent. |
| `automatic` sync | **Never** on iCloud. Rollback: restore YAML; cleanup modal `DatabaseView.ts:5576+` only if a prior automatic session wrote keys. |
| New `RemainingSaved.ts` | **No.** Inherit EuroFormat call sites. |
| Wait for MAX | **No.** SUM only. |
| T017 two devices | Optional; hash + display-only gate is sufficient. |
| Predecessors unshipped | **Halt.** Do not configure formulas against missing rollups. |
