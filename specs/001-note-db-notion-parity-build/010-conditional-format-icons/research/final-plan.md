# Final Plan: Conditional Formatting Multi-Condition and Icons
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

Build this **after** 009, not as a private CF walker. The fork already matches Notion’s core CF contract — per-view rules, first-match, row-or-property color — through one helper (`getConditionalFormatMatch` / `applyConditionalFormat` at `ConditionalFormatting.ts:23-69`) that all renderer consumers already call (Table `463`/`503`, List, Board, Gallery, Calendar, CalendarTimeline, RecordDetailPanel, plus injections in `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts`). This phase is a rebase-safe **superset**: AND/OR inside a rule, plus icon and bold. Notion CF itself is color-only; AND/OR lives in advanced *filters* (synthesis F1.7). Icon/bold are deliberate extras the finance vault needs, not Notion clones.

What is solid: in-place extension of `ConditionalFormatting.ts` (already the EuroFormat surface — do not add `ConditionalFormatTree.ts`); `SourceRuleNode` as the only tree (009 REQ-002); RecordIcon token for icons (`RecordIcon.ts:27-38`); paint inside `applyConditionalFormat` so zero renderer consumer edits; first-match unchanged (`:39`); dual-write `condition` + `conditionTree`; color-optional; tree-only missing-column fail-closed vs legacy frontmatter fallback (`getFieldValue` at `QueryEngine.ts:283-294`); no Chart matcher (Notion also skips Chart); `Intl.Segmenter` deferred (`RecordIcon.ts:20-25`).

What is missing, mis-sequenced, or wrong:

1. **Hard blocker is real.** Confirmed: no `ViewFilterTree.ts` in the fork. Starting 010 now forces a third condition dialect (REQ-001 / §8 forbid). Plan/tasks already `[B]` the tree items; keep that halt.

2. **Wrong 009 API.** Spec REQ-001 and plan step 6 say “evaluate via `QueryEngine.applyFilterTree`”. That API filters a row *array* and treats root `null` as visible (009: `!== false`, matching `QueryEngine.ts:80`). CF must fail-closed: empty/missing tree and Kleene root `null` (nested all-skips) are **non-match** (010 synthesis F4.1; spec E2). `applyFilterTree([row], empty).length > 0` would format every row. 009 REQ-008 already names `evaluateViewFilterTree`, but that pure function needs `matchesLeaf`, and `matchesFilter` is private (`QueryEngine.ts:91-127`). The usable contract is `QueryEngine.evaluateFilterTree(row, tree, columns): boolean | null` with CF matching `=== true`. If 009 did not ship that wrapper, add it in 009 — do not export `matchesFilter` and do not clone a walker here.

3. **`parseSourceRuleTree` is still a trap in the research trail.** 010 research F4.5 still mentions it; synthesis correctly forbids it (`SourceRules.ts:227-257` whitelist includes `inFolder` / `strictEq` / `expression` at `7-28`). Parse `conditionTree` with 009 `normalizeViewFilterTree` only.

4. **Do not copy `renderSourceRuleLeaf`.** Same leak as 009. CF leaves already use `getFilterOperatorsForColumn` (`ViewConfigPanelRenderer.ts:593`). Copy group chrome (`renderSourceRuleGroup` `878-929`); keep the existing field/op/value row as the leaf; add wrap-into-group / delete-last-child-deletes-group (Anytype `group.tsx:66-110`; 010 F3.3 / F4.2).

5. **`color` is still required on the type.** `ConditionalFormatRule.color: StatusColor` (`types.ts:151`) and parse rejects missing color (`DataSource.ts:815`: `!colors.has(color)`). Color-optional is a type change (`color?: StatusColor`) plus paint: stop `rule.color || "gray"` (`ConditionalFormatting.ts:39`) from inventing a background. Match type must be `color?: StatusColor`.

6. **Record-target table icons are a product hole, under-weighted.** Synthesis F5.3: no span child of `tr` (invalid HTML); Table applies record CF to `tr` (`TableRenderer.ts:463`) and field CF to `td` (`503`). Attribute-only on `tr` means row-level icon is invisible. That is acceptable only if documented. Better, still zero consumer edits: inside `applyConditionalFormat`, if `element` is a `TR`, append the icon span to the first `td:not(.db-select-col)`.

7. **`getConditionalFormatMatch` skip guard (`:31`) must change.** Today `!rawRule?.id || !rawRule.condition?.field` skips the rule. Dual-write keeps `condition`, but the algorithm already says “neither `condition.field` nor a non-empty `conditionTree`”. If the guard stays as-is, a future tree-only row is inert (rollback footnote at line 31).

8. **`getEffectiveFilterRules` on CF leaves would recolor legacy cells.** `FilterRules.ts:3-12` drops `eq` + empty value; today’s CF matches that cell (`compareFilterValue("", "") === 0`). Tasks mention this; do not “reuse 009 prune” here.

9. **Effort label is internally false.** Plan says “Effort S overall (one M item)” and then **~15 hours**. That is M–L. Icon/bold “ship first” (Item 2 unblocked) would touch `ConditionalFormatting.ts` twice and still need the same paint/clear path as trees. Do not split PRs.

10. **Test harness overlap with 009.** `vitest.config.ts:1-8` points at missing `src/__tests__/setup.ts`; `package.json` has no `test` script (`dev`/`build`/`lint` only). 009 should create the setup file; 010 adds `ConditionalFormatting.test.ts` and must not fight 009 over `setup.ts`. Checklist CHK-022 claims all of E1–E12 in “12 cases”; T021’s 12 cases do not include E6/E7/E8/E9/E10. Be honest: 12 unit cases on the helper + grep for rename/delete/migration, not 12 = E1–E12.

11. **Spec line 76 mis-cites the tree.** “Reuse 009’s `SourceRuleNode` tree (`SourceRules.ts:144-156`)” — that span is `matchesSourceRuleTree`. The type is `types.ts:250`. 010 must not call that two-valued walk.

## Optimizations

- **Halt first.** If `src/data/ViewFilterTree.ts` or `QueryEngine.evaluateFilterTree` is missing, stop. No private CF walker, no `applyFilters` AND-fold of flattened leaves.
- One PR after 009: additive types (`conditionTree` / `icon` / `bold` / optional `color`) + match/eval + paint + parse + rename/delete + editor + tests. Do not land icon/bold first.
- Evaluate with `queryEngine.evaluateFilterTree(row, tree, columns) === true`. Legacy (no `conditionTree`): keep `applyFilters([row], [rule.condition], "and", columns)` (`:38`) so NFR-R01 is a literal same call.
- Parse with `normalizeViewFilterTree`, never `parseSourceRuleTree`.
- Editor: CF-scoped group chrome in `renderConditionalFormatting` (`552-766`); leaves stay the current trio; wrap-into-group writes `conditionTree` the first time (open Q7: no write-back of eval-time wraps).
- Record-target icon: attach span to first non-select `td` when `element` is `TR`. Still 0 renderer file edits.
- Merge T014 (color-optional) into the parse + paint tasks; it is the same two files as T010/T006.
- Leave T018 (`Intl.Segmenter`) deferred. Leave Chart and Match Option out.
- Reuse 009 `setup.ts` if present; only create it if 009 has not.

## Final build plan (ordered)

0. **Halt gate.** Effort S. Confirm on disk: `src/data/ViewFilterTree.ts` exists; `QueryEngine.evaluateFilterTree` and `applyFilterTree` are importable; `normalizeViewFilterTree` is the view-op parser. If `evaluateFilterTree` is missing but `evaluateViewFilterTree` exists, add the QueryEngine wrapper in 009 — do not start a CF-local matcher. Acceptance: CF code can call those three symbols. Depends: 009 shipped. **If absent → stop (not a build).**

1. **Baseline.** Effort S. Read `ConditionalFormatting.ts:23-69` and `types.ts:143-152`. Inventory consumers (Table `463`/`503` is the paint constraint). Record color-only first-match on representative finance rows. Depends: 0.

2. **Types — `src/data/types.ts:143-152`.** Effort S. Additive `conditionTree?: SourceRuleNode`, `icon?: string`, `bold?: boolean`, `color?: StatusColor`. Acceptance: existing color-only JSON still type-checks. Depends: 1.

3. **Match + paint — `src/data/ConditionalFormatting.ts`.** Effort M. Algorithm:
   - Skip no `id`, or neither `condition.field` nor non-empty `conditionTree` (relax `:31`).
   - Target filter unchanged (`:32-36`): `condition.field` remains Apply-to; trees do not retarget.
   - If `conditionTree` present, use it; else eval-time wrap `{type:"group", logic:"and", rules:[condition]}` (`createEditableSourceRuleRoot` at `ViewConfigPanelRenderer.ts:98-100`). Do not write the wrap to vault JSON.
   - Empty/missing tree → continue (E2). Match iff `evaluateFilterTree(...) === true` (root `null` → non-match).
   - `valueSource === "today"`: substitute `getLocalDateKey(new Date())` (`CalendarDateTime.ts:57`) onto date-like leaves with empty value on a comparison op (`resolveRule` today only touches `condition` at `:12-21`).
   - Tree leaf adapter: field not in `config.schema.columns` and not `file.*` / computed → `false`. Do **not** run `getEffectiveFilterRules`. Legacy path (no `conditionTree`) keeps `applyFilters` + frontmatter fallback (`QueryEngine.ts:283-294`).
   - First match returns `{ color?, icon?, bold?, ruleId }` from **that** rule and stops (`:39`).
   - `applyConditionalFormat` (`:44-69`): existing six CSS vars + class + rule-id attr; plus `db-conditional-format-bold`; plus `data-note-database-conditional-icon`; icon span via `renderRecordIcon` (`RecordIconRenderer.ts:18-33`) only when element is not `TR`, **or** onto the first `td:not(.db-select-col)` when it is. Clear those on the way in. Paint color vars only when `match.color` is set. Invalid icon (`parseRecordIconToken` → null) → no icon (NFR-S02: never `eval` / `SafeEval.ts`).
   Acceptance: legacy color-only rows match the step-1 baseline; later icon/bold never merge. Depends: 0, 2.

4. **CSS — `styles.css`.** Effort S. Add `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon` next to the existing CF block (`styles.css:469-484`). Acceptance: row-level bold hits every cell; icon does not break `tr` layout. Depends: 3.

5. **Parse — `src/data/DataSource.ts` `parseConditionalFormats` (`800-825`).** Effort S. Additive `conditionTree` via `normalizeViewFilterTree`; `icon` string ≤64 chars; `bold` boolean. Keep requiring a parseable `condition` object (Apply-to + rollback). Stop requiring `color`; if present it must still be in `OPTION_COLORS`. Legacy db-level copy at `761-765` stays `{...rule.condition}`. Unknown extra keys ignored (E10). Acceptance: color-only JSON loads unchanged; tree+icon+bold JSON loads; invalid tree dropped, condition kept. Depends: 0, 2.

6. **Rename/delete — `src/views/ColumnOperations.ts` ~193 / ~370.** Effort S. Rename: `updateSourceRuleTreeKeyReferences(rule.conditionTree, oldKey, newKey)` (`SourceRules.ts:183-206`) in addition to `rule.condition.field`. Delete: `removeSourceRuleTreeReferences` (`208-225`); drop the CF rule only if nothing remains. Note: that helper hoists a single remaining child (`222-224`) — acceptable here (rule collapses to a leaf; dual-write `condition` from that leaf). Acceptance: rename does not leave stale tree keys; last-leaf delete drops the rule. Depends: 2.

7. **Editor — `src/views/ViewConfigPanelRenderer.ts` `renderConditionalFormatting` (`552-766`) + `src/i18n.ts`.** Effort M. Replace the single trio with group chrome copied from `renderSourceRuleGroup` (`878-929`), positional splice, no node ids. Leaves: existing field/op/value + `getFilterOperatorsForColumn`. First “add group” / wrap writes `conditionTree` and keeps `condition` as the first leaf. Icon: `openIconPickerPopover` (`IconPickerPopover.ts:23`). Bold: `db-icon-only-button` + `setIcon(..., "bold")`. i18n: 3 keys × 3 locales (`conditionalFormat.icon` / `bold` / `group`); reuse `panel.and` / `panel.or` / `panel.addCondition` (`i18n.ts` ~379-385). Persist via existing `actions.onChange(t("undo.conditionalFormatConfig"))` (`601-604`). Acceptance: AND/OR group + icon + bold save and reload; no add-expression; no Chart UI. Depends: 2, 3, 5.

8. **Tests — `src/data/ConditionalFormatting.test.ts` (+ reuse `src/__tests__/setup.ts`).** Effort M. Twelve helper cases: (1) legacy color-only; (2) AND tree; (3) OR tree; (4) first-match collision, no icon/bold merge (E12); (5) empty/missing tree → no match (E2); (6) nested empty group inherits 009 Kleene, CF maps root `null` → no match (E4); (7) `valueSource:"today"` on tree (E5); (8) tree-only missing column fail-closed vs legacy frontmatter (E3); (9) invalid icon token (E11); (10) color-omitted icon/bold; (11) icon span not a child of `TR`; (12) `eq` + empty value still matches on the **legacy** path (the `getEffectiveFilterRules` trap). Grep, not unit: E7 migration `761-765`; E8/E9 ColumnOperations; E10 extra keys; E1 missing id. Add `package.json` `"test": "vitest run"` only if 009 did not. Depends: 3, 4, 5.

9. **Integration / hygiene.** Effort S. `grep` renderer files for a second CF predicate walker; fail if one exists. Confirm `ChartRenderer` still has no `applyConditionalFormat` binding. Diff limited to `ConditionalFormatting.ts`, `types.ts`, `DataSource.ts`, `ViewConfigPanelRenderer.ts`, `ColumnOperations.ts`, `styles.css`, `i18n.ts`, tests (and `setup.ts` / `package.json` only if 009 did not). CF imports stay `CalendarDateTime` / `QueryEngine` / `types` / 009 tree helpers — no `electron` / `fs` / Node. No `App.vault` write; `EmbeddedDatabaseRenderer.ts:3360` still excludes `conditionalFormats` from structural change detection (Object.assign of persisted view fields). Manual: table record+field (`tr`/`td`) plus one non-table view, narrow pane. Depends: 7, 8.

**Do not build:** `ConditionalFormatTree.ts`; per-renderer matchers; Chart CF; Notion Match Option; icon catalog; `Intl.Segmenter` guard; flattening AND groups like Anytype (`dataview.ts:780-800`); writing eval-time wraps back onto legacy rules.

## Risks & open decisions

| Item | Recommended default |
|------|---------------------|
| Start 010 before 009 ships? | **No.** Halt at step 0. |
| 009 API if `applyFilterTree` is the only export | Do not consume it for CF. Require `evaluateFilterTree` (or equivalent) returning `boolean \| null`. Match `=== true`. |
| Icon representation | RecordIcon token (`RecordIcon.ts:27-38`). Reject vault paths. Reuse `openIconPickerPopover`. |
| Missing-column (E3 vs NFR-R01) | Tree rules fail closed. Legacy single-condition path untouched. |
| Color-optional | Yes. Optional `color` on the type; paint background only when set. |
| Apply-to for a multi-field tree | `condition.field` stays the Apply-to property (`:32-36`). Do not paint every leaf field. |
| Write normalized trees onto legacy rules? | No. Eval-time wrap only. Editor writes `conditionTree` after the user adds a group. Dual-write keeps `condition` as first leaf so rollback stays safe. |
| Record-target table icon | Attach icon span to first non-select `td` from inside `applyConditionalFormat`. Do not edit `TableRenderer.ts`. |
| Chart CF | No. Notion skips Chart; adding a matcher is a new call site. |
| Match Option | Defer. Real Notion gap, out of this spec. |
| `Intl.Segmenter` | Skip. Same risk as shipped record icons. |
| Split icon/bold before trees | No. One PR after 009. |
| `removeSourceRuleTreeReferences` hoist on CF delete | Accept (rule becomes a leaf). Dual-write `condition` from the remaining leaf. |

Residual risk: calling `applyFilterTree` and treating a kept row as a CF match (empty-tree paints everything). Residual risk: `parseSourceRuleTree` loading source-only operators CF cannot evaluate. Residual risk: running `getEffectiveFilterRules` on CF leaves (legacy empty-`eq` cells lose color). All three are grep/test detectable; the 12-case file must include (5), (8), and (12).
