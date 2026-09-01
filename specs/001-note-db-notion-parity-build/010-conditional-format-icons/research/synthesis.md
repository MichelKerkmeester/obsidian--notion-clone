# Synthesis: Conditional Formatting Multi-Condition and Icons
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict
Build this **after** `009-view-filter-tree` ships a callable `applyFilterTree` — not before. The fork already matches Notion’s core CF contract (per-view rules, first-match, row-or-property color) through one shared helper; this phase is a small, rebase-safe **superset** (AND/OR inside a rule, plus icon and bold) that the finance vault needs, without a second matcher. Headline: extend `src/data/ConditionalFormatting.ts` in place (it is already the EuroFormat-shaped module), reuse 009’s `SourceRuleNode` tree, store icons as the existing RecordIcon token, and paint icon/bold inside `applyConditionalFormat` so the ten renderer consumers stay untouched. Single biggest risk: 009 is still Planned and `ViewFilterTree.ts` is absent from the fork; starting 010 now would force a private CF walker, which REQ-001 and spec §8 forbid.

## Ranked backlog
1. **Evaluate AND/OR trees on the shared CF path** — Notion CF is one predicate per rule (AND/OR lives only in advanced *filters*); the fork is also one `FilterRule` today (`getConditionalFormatMatch` → `applyFilters([row],[condition],"and")`). Feasibility: **blocked** until 009 exports `QueryEngine.applyFilterTree`, then **clear**. Files: `src/data/ConditionalFormatting.ts`, additive `conditionTree?: SourceRuleNode` on `ConditionalFormatRule` in `src/data/types.ts`. Effort: **S**. Depends on: 009 REQ-008. Citation: `src/data/ConditionalFormatting.ts:23-42`.

2. **Icon + bold on the same match result, painted by the same helper** — Notion CF is color-only (bold+color is formula `style(value,"red","b")`); the fork returns `{ color, ruleId }` and CSS vars only. Feasibility: **clear** (does not need 009). Files: `src/data/ConditionalFormatting.ts` (`ConditionalFormatMatch` + `applyConditionalFormat` paint/clear), `src/data/types.ts` (`icon?: string`, `bold?: boolean`), `styles.css` (`.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon`). Effort: **S**. Depends on: item 1’s types if shipping in the same PR; otherwise types-only. Citation: `src/data/RecordIcon.ts:27-38`.

3. **CF editor: nested groups + icon picker + bold toggle** — Notion’s CF UI is a flat rule list with no group chrome; the fork editor is one field/op/value row per rule. Feasibility: **likely** (in-repo source-rule group renderer + Anytype group ops agree; no new component file). Files: `src/views/ViewConfigPanelRenderer.ts` (`renderConditionalFormatting`), `src/i18n.ts` (3 keys × 3 locales: `conditionalFormat.icon` / `bold` / `group`; reuse `panel.and` / `panel.or` / `panel.addCondition`). Effort: **M**. Depends on: items 1–2 types. Citation: `src/views/ViewConfigPanelRenderer.ts:552-766`.

4. **Additive parse of `conditionTree` / `icon` / `bold`** — Notion persists per-view conditional color; the fork whitelist-drops unknown keys, so new fields never load. Feasibility: **clear**. Files: `src/data/DataSource.ts` (`parseConditionalFormats`). Effort: **S**. Depends on: item 1’s tree type and 009’s view-op parser (do **not** call raw `parseSourceRuleTree` — that whitelist is `SourceRuleOperator` including `inFolder` / `strictEq` / `expression`, not the view 10-op set). Citation: `src/data/DataSource.ts:800-825`.

5. **Tree-aware column rename/delete** — Notion rules drop with the property; the fork rewrites/filters only `rule.condition.field`, so a tree would keep stale keys. Feasibility: **clear**. Files: `src/views/ColumnOperations.ts` (rename loop ~193, delete filter ~370). Effort: **S**. Depends on: item 1 persistence. Citation: `src/views/ColumnOperations.ts:193,370`.

6. **`valueSource: "today"` inside trees** — Notion date CF compares against now; the fork resolves `today` only onto the single `condition.value`. Feasibility: **clear**. Files: `src/data/ConditionalFormatting.ts` (`resolveRule`). Effort: **S**. Depends on: item 1. Keep the flag **rule-level** (three consumers today: parse, `resolveRule`, editor) — a per-leaf `valueSource` would fork the leaf shape off `FilterRule` and break item 5’s helpers. Citation: `src/data/ConditionalFormatting.ts:12-21`.

7. **Tree-only missing-column fail-closed** — Notion treats a missing property as non-match; the fork’s `getFieldValue` falls back to raw frontmatter, so legacy rules color undeclared keys. Feasibility: **clear** if scoped to tree rules only. Files: `src/data/ConditionalFormatting.ts` (leaf adapter). Effort: **S**. Depends on: item 1. Do **not** run `getEffectiveFilterRules` on CF leaves (that drops `eq` + empty value and would recolor legacy cells). Citation: `src/data/QueryEngine.ts:283-294`.

8. **Colocated vitest gate for the helper** — no Notion gap; the fork’s `vitest.config.ts` points at a missing `src/__tests__/setup.ts` and there are zero `*.test.ts` files. Feasibility: **clear**. Files: `src/__tests__/setup.ts` (or drop `setupFiles`), `package.json` `test` script, `src/data/ConditionalFormatting.test.ts` (12 cases in plan §5 / research F9.3). Effort: **S**. Depends on: items 1–2, 6–7. Citation: `vitest.config.ts:1-8`.

9. **Color-optional rules (icon/bold without a required color)** — Notion always has a color; spec §8 requires icon/bold without background. Today parse **rejects** a rule with no valid `color`, and match always does `rule.color || "gray"`. Feasibility: **likely**. Files: `src/data/DataSource.ts`, `src/data/ConditionalFormatting.ts` (paint color vars only when a color is set). Effort: **S**. Depends on: item 2. Citation: spec.md §8 (“Rule with color omitted but icon and/or bold set”).

10. **Optional `Intl.Segmenter` guard** — not a Notion gap; `isSingleEmojiGrapheme` already constructs `Segmenter` with no feature test, and that ships on mobile for record icons. Feasibility: **clear**. Files: `src/data/RecordIcon.ts`. Effort: **S** (XS). Depends on: none. **Defer** unless the phase already touches that function — CF adds no new exposure. Citation: `src/data/RecordIcon.ts:20-25`.

Out of this phase (do not rank into the build): Notion “Match Option” (cell color follows the select/status option) and Chart CF. ChartRenderer has **no** `applyConditionalFormat` binding; Notion also skips Chart. SC-004 is already satisfied as long as Chart does not grow a matcher. Citation: https://thomasjfrank.com/notion-conditional-color-formatting-everything-you-need-to-know/

## Recommended build (locked design)
**Module:** `src/data/ConditionalFormatting.ts`. This file already is the EuroFormat isolation surface: one owned helper every consumer calls, no per-view copies. Do **not** add `src/data/ConditionalFormatTree.ts` (that would be a third condition dialect). The *new* EuroFormat module for the tree itself is 009’s `src/data/ViewFilterTree.ts` plus `QueryEngine.applyFilterTree` — 010 consumes it, it does not clone it. Precedent: `src/data/EuroFormat.ts` with exactly two call sites (`src/views/CellRenderer.ts`, `src/views/SummaryRenderer.ts`) in `update-fork.sh:5-7`.

**Call sites (3 rebase-safe edits, 0 renderer consumer edits):**
1. `src/data/DataSource.ts` — `parseConditionalFormats` (~800-825): additive `conditionTree` via 009’s view-op parse (not raw `parseSourceRuleTree`), `icon` string ≤64 chars, `bold` boolean; keep requiring a parseable `condition` object as the Apply-to / legacy leaf.
2. `src/views/ViewConfigPanelRenderer.ts` — `renderConditionalFormatting` (~552-766): replace the single field/op/value trio with a CF-scoped copy of `renderSourceRuleGroup` / `renderSourceRuleLeaf` (same file, ~804-1005, positional splice, no node ids); add icon via existing `openIconPickerPopover` (`src/views/IconPickerPopover.ts:11-23`); add bold as a `db-icon-only-button` + `setIcon(..., "bold")`.
3. `src/views/ColumnOperations.ts` — on rename, `updateSourceRuleTreeKeyReferences(rule.conditionTree, oldKey, newKey)` in addition to `rule.condition.field` (`SourceRules.ts:183-206`); on delete, `removeSourceRuleTreeReferences` (`SourceRules.ts:208-225`) and drop the rule only if nothing remains.

Supporting additive files that are **not** call sites: `src/data/types.ts`, `styles.css`, `src/i18n.ts`, tests in item 8.

**Algorithm (single walker, first-match unchanged):**
1. Walk `config.conditionalFormats` in list order (`ConditionalFormatting.ts:29-41`). Skip a rule with no `id`. Skip a rule with neither `condition.field` nor a non-empty `conditionTree`.
2. **Target filter (unchanged):** if `targetField` is set, require `target === "field"` and `condition.field === targetField`; else require `target === "record"` (`ConditionalFormatting.ts:32-36`). Trees do not retarget: `condition.field` remains Notion’s “Apply to” property.
3. **Normalize:** if `conditionTree` is present, use it; else wrap `condition` as `{ type: "group", logic: "and", rules: [condition] }` (same primitive as `createEditableSourceRuleRoot`, `ViewConfigPanelRenderer.ts:98-100`). Do **not** write the wrap back to vault JSON.
4. **Fail-closed at the root:** empty / missing tree → continue (spec §8). If 009 ships AppFlowy three-valued empty-group-as-`None` (`context/appflowy/frontend/rust-lib/flowy-database2/src/services/filter/controller.rs:475-519`), map root `None` → non-match. If 009 ships today’s two-valued `matchesSourceRuleTree` (`SourceRules.ts:144-156`, empty group → `logic === "and"`), **short-circuit empty roots before eval** — otherwise an empty AND matches every row.
5. **`valueSource === "today"`:** substitute `getLocalDateKey(new Date())` (`CalendarDateTime.ts:57`) into every date-like leaf with an empty value on a comparison op. Legacy single-leaf rules stay identical.
6. **Evaluate** via 009 `applyFilterTree` / leaf adapter onto `QueryEngine.matchesFilter` **raw** (not `getEffectiveFilterRules`, `FilterRules.ts:3-12`). Tree-only: a leaf whose field is not in `config.schema.columns` and is not `file.*` / computed → false. Legacy (no `conditionTree`) keeps today’s frontmatter fallback (`QueryEngine.ts:283-294`).
7. **First match returns** `{ color, icon?, bold?, ruleId }` from **that** rule and stops. Later icon/bold cannot merge (`ConditionalFormatting.ts:39`; spec §8). Invalid icon tokens (`parseRecordIconToken` → null) yield no icon (NFR-S02: data, never `eval` / `SafeEval`).
8. **`applyConditionalFormat` paints:** existing six CSS vars + `db-conditional-format` + `data-note-database-conditional-rule` (`ConditionalFormatting.ts:44-69`); plus `db-conditional-format-bold`; plus `data-note-database-conditional-icon` always, and a `db-conditional-format-icon` span **only when `element` is not a `TR`** (a span child of `tr` is invalid HTML; TableRenderer applies CF to `tr` at :463 and `td` at :503). Clear those on the way in. Icon span: reuse `renderRecordIcon` (`RecordIconRenderer.ts:18-33`) / `getValidRecordIconIds` (:53).

**Persistence dual-write:** editor writes `conditionTree` *and* keeps `condition` as the first leaf (Apply-to + rollback). Evaluator prefers `conditionTree`. Legacy JSON without the new keys loads unchanged (NFR-R01). AppFlowy (`FilterType` Data|And|Or, `util.rs:20-50`) and Anytype (`{ relationKey:'', operator, nestedFilters }`, `anytype-ts/src/ts/interface/block/dataview.ts:55-58,138-148`) agree on wrap-leaf-into-group / toggle AND↔OR / delete-last-child-deletes-group; the fork already has that UI in `renderSourceRuleGroup`. Do not adopt Anytype’s AND-flatten (`dataview.ts:780-800`) in the evaluator.

## Edge cases & mobile/iCloud safety
**Must handle (verified against current code):**
- **E1** Missing `id` or `condition.field` (legacy): skip. Keep. (`ConditionalFormatting.ts:31`)
- **E2** Empty/missing `conditionTree`: rule does not match; next rule may. (`spec.md:186-187`)
- **E3** Undeclared column: legacy keeps frontmatter match; **tree rules only** fail closed. (`QueryEngine.ts:283-294`; `spec.md:190`)
- **E4** Nested empty group `(∅) or C`: inherit 009 (AppFlowy skip-empty, not two-valued AND-pass). (`controller.rs:482-497` vs `SourceRules.ts:152`)
- **E5** `valueSource: "today"` on a tree: rule-level substitution on date leaves. (`ConditionalFormatting.ts:12-21`)
- **E6** Deep nesting: 009’s depth limit only; CF adds none. (`SourceRules.ts:144-156`)
- **E7** Legacy db-level rules: still migrate into views on read, copy `{...rule.condition}`. (`DataSource.ts:761-765`)
- **E8/E9** Rename/delete: walk the tree with existing source-tree helpers. (`SourceRules.ts:183-225`)
- **E10** Unknown extra keys: ignore; new keys additive. (`DataSource.ts:800-825`)
- **E11** Invalid icon string: store capped raw; render fail-closed to no icon. (`RecordIcon.ts:27-38`)
- **E12** Two matches: first wins; no icon/bold merge. (`ConditionalFormatting.ts:39`)
- **Color omitted:** if item 9 is accepted, skip color CSS vars and still apply icon/bold. (`spec.md:184`)

**Mobile:** CF path imports only `CalendarDateTime`, `QueryEngine`, `types` — no `electron` / `fs` / Node (`ConditionalFormatting.ts:1-3`). Icons are emoji spans or Obsidian `setIcon` SVG, already shipping on mobile via the record-icon column (`RecordIconRenderer.ts:1`). `Intl.Segmenter` risk is **pre-existing**, not introduced here (`RecordIcon.ts:20-25`). Panel has no `Platform.isMobile` branches; the source-rule tree editor in the same popover is the shipped narrow-pane pattern. Phone table layout still calls the same helper (`TableRenderer.ts:455-510`). Evaluation is per visible row/cell, first-match short-circuit, O(tree) recursion — no second full-table scan (NFR-P01/P02).

**iCloud / display-only:** `getConditionalFormatMatch` / `applyConditionalFormat` touch in-memory `RowData` / `ViewConfig` and the passed `HTMLElement` only (`ConditionalFormatting.ts:23-69`). No `App.vault` write. Config edits go through existing `actions.onChange(t("undo.conditionalFormatConfig"))` (`ViewConfigPanelRenderer.ts:601-604`). `EmbeddedDatabaseRenderer.ts:3360` already excludes `conditionalFormats` from structural change detection, so tree edits do not trigger extra view-reload vault churn. Rollback = revert the phase files; leave extra JSON keys in saved views (old code ignores them). A tree-only rule with no `condition` becomes inert under today’s line-31 guard — dual-write (locked design) avoids that.

## Open questions / operator decisions
1. **Start 010 before 009 ships?** Recommended default: **No.** Spec risk table and REQ-001: if `applyFilterTree` is missing, implementation is blocked; do not ship a private CF walker. Confirmed on disk: no `ViewFilterTree.ts` in the fork; 009 spec status is Planned.

2. **Icon attribute representation (spec Open Question 1)?** Recommended default: **RecordIcon token** — one emoji grapheme or `lucide:<id>@<color>` (`RecordIcon.ts:27-38`; `types.ts:259-260`). Reject vault paths. Reuse `openIconPickerPopover`; do not build a catalog (spec out of scope).

3. **009 vs `SourceRuleNode` unification (spec Open Question 2)?** Recommended default: **`SourceRuleNode` is the only tree** (009 REQ-002). 010 calls 009’s view-op parse/eval. Do not reuse unfiltered `parseSourceRuleTree` (`SourceRules.ts:7-20,227-257`).

4. **Missing-column behavior (E3 vs NFR-R01)?** Recommended default: **tree rules fail closed; legacy single-condition path untouched.**

5. **Color-optional icon/bold rules (spec §8 vs current parse)?** Recommended default: **Yes** — stop requiring `color` at parse; paint background only when set. Dual-write `condition` + `conditionTree` still required for Apply-to and rollback.

6. **Field-target primary field for a multi-field tree?** Recommended default: **`condition.field` stays the Apply-to property** (keep `ConditionalFormatting.ts:32-36`). Do not paint every leaf field.

7. **Write normalized trees back onto legacy rules?** Recommended default: **No.** Eval-time wrap only. Editor writes `conditionTree` only after the user adds a group.

8. **Consume CF on Chart?** Recommended default: **No.** Notion skips Chart; `ChartRenderer` has no matcher today; adding one is scope creep and a new call site.

9. **Notion Match Option (select/status color-follows-option)?** Recommended default: **Defer.** Real Notion gap, out of this spec.

10. **`Intl.Segmenter` guard in this phase?** Recommended default: **Skip.** Same risk class as shipped record icons.

Fork path (spec Open Question 3) is no longer UNKNOWN: live source is `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`, not `specs/obsidian/001-notion-finance-migration/build/note-database-fork`.
