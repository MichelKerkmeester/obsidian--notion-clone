---
title: "Implementation Plan: Conditional Formatting Multi-Condition and Icons"
description: "Plan the shared applyConditionalFormat extension for AND/OR trees plus icon and bold attributes."
trigger_phrases:
  - "conditional formatting plan"
  - "applyconditionalformat"
  - "multi-condition cf"
  - "format icons"
  - "icon bold attribute"
  - "euroformat isolated diff"
  - "view filter tree reuse"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/010-conditional-format-icons"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan review findings; status Planned (blocked on 009)"
    next_safe_action: "Wait for 009 to ship evaluateFilterTree, then build per tasks.md"
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
# Implementation Plan: Conditional Formatting Multi-Condition and Icons

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript Obsidian plugin fork (MIT) |
| **Framework** | Existing note-database fork; shared `applyConditionalFormat` in `src/data/ConditionalFormatting.ts` |
| **Fork root** | `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` |
| **Storage** | Vault notes via Obsidian; CF is display-only (no `App.vault` writes). Isolated-diff model: `EuroFormat.ts` (`update-fork.sh:5-7`) |
| **Testing** | Colocated vitest gate — `vitest.config.ts:1-8` points at a missing `src/__tests__/setup.ts` and there are zero `*.test.ts` files today; reuse 009's `setup.ts` if present (only create it if 009 has not); add `src/data/ConditionalFormatting.test.ts` (12 unit cases on the helper + grep checks for rename/delete/migration/extra-keys) |

### Overview
After `009-view-filter-tree` ships `QueryEngine.evaluateFilterTree` (the per-row `boolean | null` evaluator; the array-filter `applyFilterTree` treats root `null` as visible and must NOT be used for CF match), extend the fork's single-condition, color-only, first-match CF so a rule can use that AND/OR `SourceRuleNode` tree and can return icon (RecordIcon token) and bold in addition to background color. The locked design extends `src/data/ConditionalFormatting.ts` in place — do **not** add `src/data/ConditionalFormatTree.ts` (a third condition dialect). One PR after 009 (do not split icon/bold first). Three rebase-safe call-site edits, zero renderer consumer edits: the ten consumers (Table, List, Board, Gallery, Calendar, CalendarTimeline, RecordDetailPanel, EmbeddedDatabase, DatabaseView) keep calling the same `actions.applyConditionalFormat` injection.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Phase `009-view-filter-tree` has shipped `QueryEngine.evaluateFilterTree` (per-row `boolean | null` evaluator) and `normalizeViewFilterTree` (view-op parser) as importable exports; `src/data/ViewFilterTree.ts` exists in the fork. (`applyFilterTree` is also importable but is the array filter — not used for CF match.)
- [ ] `src/data/ConditionalFormatting.ts:23-69` (`getConditionalFormatMatch` / `applyConditionalFormat`) and `src/data/types.ts:143-152` (`ConditionalFormatRule`) read and confirmed as the in-place extension surface.
- [ ] All ten `applyConditionalFormat` consumer call sites inventoried (Table/List/Board/Gallery/Calendar/CalendarTimeline/RecordDetailPanel/EmbeddedDatabase/DatabaseView).
- [ ] Scope locked to in-place `ConditionalFormatting.ts` + additive `types.ts` + `DataSource.ts` + `ViewConfigPanelRenderer.ts` + `ColumnOperations.ts` + `styles.css` + `i18n.ts` + tests; no `ConditionalFormatTree.ts`; no renderer consumer edits.
- [ ] Icon catalog / picker chrome explicitly excluded — reuse `openIconPickerPopover` only.

### Definition of Done
- [ ] Multi-condition AND/OR rules evaluate through `applyConditionalFormat` via 009's `evaluateFilterTree` (matching `=== true`); legacy rules with no `conditionTree` keep the existing `applyFilters` call; no third dialect; no raw `parseSourceRuleTree` call in CF code.
- [ ] Icon (RecordIcon token) and bold attributes appear on the shared format result and are painted inside `applyConditionalFormat`; legacy color-only rules still color cells unchanged.
- [ ] First-match across the rule list unchanged; later icon/bold never merge.
- [ ] No per-renderer CF predicate walker in any of the ten consumers; Chart does not grow a matcher.
- [ ] Diff limited to the scoped files; mobile-safe (no `electron`/`fs`/Node in CF path); display-only (no `App.vault` writes); no secrets/telemetry.
- [ ] `checklist.md` verification still pending until implementation; this scaffold does not claim Done.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Single shared evaluator, extended in place. `getConditionalFormatMatch` (`ConditionalFormatting.ts:23-42`) already walks a rule list with first-match and `applyConditionalFormat` (`:44-69`) paints background color. This phase widens the **condition** side to 009's `SourceRuleNode` tree (AND/OR) via `QueryEngine.evaluateFilterTree` (matching `=== true`; the array-filter `applyFilterTree` treats root `null` as visible and must NOT be used for CF match) and widens the **result** side with icon (RecordIcon token) and bold. The ten renderer consumers remain presentation: they apply the result they already receive through `actions.applyConditionalFormat`. The fork already has two formula engines (`ComputedField.ts`/`SafeEval.ts` and `BaseExpression.ts`); CF must not grow a third expression dialect.

### Locked module choice
**Module:** `src/data/ConditionalFormatting.ts`. It already is the EuroFormat isolation surface — one owned helper every consumer calls, no per-view copies. Do **not** add `src/data/ConditionalFormatTree.ts` (a third condition dialect). The new EuroFormat module for the tree itself is 009's `src/data/ViewFilterTree.ts` plus `QueryEngine.evaluateFilterTree` — 010 consumes it, it does not clone it. Precedent: `src/data/EuroFormat.ts` with exactly two call sites (`src/views/CellRenderer.ts`, `src/views/SummaryRenderer.ts`) in `update-fork.sh:5-7`.

### Call sites (3 rebase-safe edits, 0 renderer consumer edits)
1. **`src/data/DataSource.ts`** — `parseConditionalFormats` (~800-825): additive `conditionTree` via 009's `normalizeViewFilterTree` (not raw `parseSourceRuleTree`), `icon` string ≤64 chars, `bold` boolean; keep requiring a parseable `condition` object as the Apply-to / legacy leaf; stop requiring `color` (color-optional merged here — same file as the parse task).
2. **`src/views/ViewConfigPanelRenderer.ts`** — `renderConditionalFormatting` (~552-766): replace the single field/op/value trio with a CF-scoped copy of `renderSourceRuleGroup` group chrome (`878-929`, positional splice, no node ids); keep the existing field/op/value row as the leaf (do **not** copy `renderSourceRuleLeaf`); add wrap-into-group / delete-last-child-deletes-group (Anytype `group.tsx:66-110`); add icon via existing `openIconPickerPopover` (`src/views/IconPickerPopover.ts:11-23`); add bold as a `db-icon-only-button` + `setIcon(..., "bold")`.
3. **`src/views/ColumnOperations.ts`** — on rename, `updateSourceRuleTreeKeyReferences(rule.conditionTree, oldKey, newKey)` in addition to `rule.condition.field` (`SourceRules.ts:183-206`); on delete, `removeSourceRuleTreeReferences` (`SourceRules.ts:208-225`) and drop the rule only if nothing remains.

Supporting additive files that are **not** call sites: `src/data/types.ts`, `styles.css`, `src/i18n.ts`, tests.

### Key Components
- **`src/data/ConditionalFormatting.ts`**: Own `getConditionalFormatMatch` + `applyConditionalFormat`. Relax the skip guard at `:31` to "neither `condition.field` nor a non-empty `conditionTree`"; wrap the single-predicate check into a tree eval via 009's `evaluateFilterTree` (matching `=== true`); legacy (no `conditionTree`) keeps `applyFilters([row], [rule.condition], "and", columns)` (`:38`); attach icon/bold onto the existing color result; paint icon/bold inside `applyConditionalFormat`; keep first-match list order.
- **`src/data/types.ts`**: Additive fields only — `conditionTree?: SourceRuleNode`, `icon?: string`, `bold?: boolean`, `color?: StatusColor` (was required) on `ConditionalFormatRule` (143-152) — so stored single-condition color-only rules remain valid.
- **`src/data/ViewFilterTree.ts` + `QueryEngine.evaluateFilterTree`** (009): Sole AND/OR walker and tree parser (`normalizeViewFilterTree`). 010 consumes, never clones.
- **`src/data/DataSource.ts`**: `parseConditionalFormats` additive parse + color-optional.
- **`src/views/ViewConfigPanelRenderer.ts`**: CF editor — nested groups, icon picker, bold toggle.
- **`src/views/ColumnOperations.ts`**: Tree-aware rename/delete.
- **`styles.css`**: `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon`.
- **`src/i18n.ts`**: 3 keys × 3 locales; reuse `panel.and` / `panel.or` / `panel.addCondition`.
- **Ten renderer consumers**: read icon/bold from the shared result where the UI has a slot; never re-match rules.

### Algorithm (single walker, first-match unchanged)
1. Walk `config.conditionalFormats` in list order (`ConditionalFormatting.ts:29-41`). Skip a rule with no `id`. Skip a rule with neither `condition.field` nor a non-empty `conditionTree` (relax the guard at `:31`, which today checks only `!rawRule.condition?.field` — a future tree-only row would be inert under the old guard).
2. **Target filter (unchanged):** if `targetField` is set, require `target === "field"` and `condition.field === targetField`; else require `target === "record"` (`:32-36`). Trees do not retarget: `condition.field` remains Notion's "Apply to" property.
3. **Normalize:** if `conditionTree` is present, use it; else wrap `condition` as `{ type: "group", logic: "and", rules: [condition] }` (same primitive as `createEditableSourceRuleRoot`, `ViewConfigPanelRenderer.ts:98-100`). Do **not** write the wrap back to vault JSON.
4. **Fail-closed at the root:** empty / missing tree → continue (spec §8). If 009 ships AppFlowy three-valued empty-group-as-`None` (`controller.rs:475-519`), map root `None` → non-match. If 009 ships today's two-valued `matchesSourceRuleTree` (`SourceRules.ts:144-156`, empty group → `logic === "and"`), **short-circuit empty roots before eval** — otherwise an empty AND matches every row.
5. **`valueSource === "today"`:** substitute `getLocalDateKey(new Date())` (`CalendarDateTime.ts:57`) into every date-like leaf with an empty value on a comparison op. Legacy single-leaf rules stay identical.
6. **Evaluate** via `queryEngine.evaluateFilterTree(row, tree, columns) === true` (not the array-filter `applyFilterTree`, which treats root `null` as visible and would format every row); leaf adapter onto `QueryEngine.matchesFilter` **raw** (not `getEffectiveFilterRules`, `FilterRules.ts:3-12`). Tree-only: a leaf whose field is not in `config.schema.columns` and is not `file.*` / computed → false. Legacy (no `conditionTree`) keeps `applyFilters([row], [rule.condition], "and", columns)` (`:38`) and today's frontmatter fallback (`QueryEngine.ts:283-294`).
7. **First match returns** `{ color?, icon?, bold?, ruleId }` from **that** rule and stops. Later icon/bold cannot merge (`:39`; spec §8). Invalid icon tokens (`parseRecordIconToken` → null) yield no icon (NFR-S02: data, never `eval` / `SafeEval`).
8. **`applyConditionalFormat` paints:** existing six CSS vars + `db-conditional-format` + `data-note-database-conditional-rule` (`:44-69`); plus `db-conditional-format-bold`; plus `data-note-database-conditional-icon` always, and a `db-conditional-format-icon` span via `renderRecordIcon` (`RecordIconRenderer.ts:18-33`) / `getValidRecordIconIds` (:53) — **only when `element` is not a `TR`**, **or** onto the first `td:not(.db-select-col)` when it is (a span child of `tr` is invalid HTML; TableRenderer applies CF to `tr` at :463 and `td` at :503). Clear those on the way in. Paint color vars only when `match.color` is set.

### Persistence dual-write
Editor writes `conditionTree` **and** keeps `condition` as the first leaf (Apply-to + rollback). Evaluator prefers `conditionTree`. Legacy JSON without the new keys loads unchanged (NFR-R01). AppFlowy (`FilterType` Data|And|Or, `util.rs:20-50`) and Anytype (`{ relationKey:'', operator, nestedFilters }`, `anytype-ts/src/ts/interface/block/dataview.ts:55-58,138-148`) agree on wrap-leaf-into-group / toggle AND↔OR / delete-last-child-deletes-group; the fork already has that UI in `renderSourceRuleGroup`. Do not adopt Anytype's AND-flatten (`dataview.ts:780-800`) in the evaluator.

### Data Flow
Visible row/cell → `applyConditionalFormat(rules, record)` → for each rule in order, evaluate its condition (legacy single predicate **or** 009 tree) → on first match, return `{ color, icon?, bold?, ruleId }` → renderer paints inside the same helper. No write back to the note.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm 009 exports `QueryEngine.evaluateFilterTree` (per-row `boolean | null`) and `normalizeViewFilterTree` importable from CF code; confirm `src/data/ViewFilterTree.ts` exists. If `evaluateFilterTree` is missing but `evaluateViewFilterTree` exists, add the `QueryEngine` wrapper in 009 — do not start a CF-local matcher. If absent, halt — do not ship a private CF walker.
- [ ] Read `src/data/ConditionalFormatting.ts:23-69`, `src/data/types.ts:143-152`, and inventory all ten `applyConditionalFormat` consumer call sites.
- [ ] Record the current first-match + color-only behavior as the regression baseline (same rows, same colors).

### Phase 2: Core Implementation (final build plan order — one PR, do not split icon/bold first)
- [ ] **Step 2 — Types (S):** Additive `conditionTree?: SourceRuleNode`, `icon?: string` (≤64 chars), `bold?: boolean`, `color?: StatusColor` (was required) on `ConditionalFormatRule` (`types.ts:143-152`). Existing color-only JSON still type-checks. Citation: `types.ts:143-152`.
- [ ] **Step 3 — Match + paint (M):** `ConditionalFormatting.ts` — relax skip guard `:31` to "neither `condition.field` nor non-empty `conditionTree`"; eval via `evaluateFilterTree(...) === true` (legacy keeps `applyFilters` `:38`); `valueSource:"today"` onto date leaves (rule-level); tree-only missing-column fail-closed (do not run `getEffectiveFilterRules`); first-match returns `{ color?, icon?, bold?, ruleId }`; paint icon/bold + color-optional (color vars only when `match.color` set) inside `applyConditionalFormat`; icon span only when not `TR`, else onto first `td:not(.db-select-col)`. Citation: `ConditionalFormatting.ts:23-69`.
- [ ] **Step 4 — CSS (S):** `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon` next to the existing CF block (`styles.css:469-484`). Citation: `styles.css:469-484`.
- [ ] **Step 5 — Parse (S):** `DataSource.ts` `parseConditionalFormats` (~800-825) — additive `conditionTree` via `normalizeViewFilterTree` (not raw `parseSourceRuleTree`), `icon` ≤64 chars, `bold` boolean; keep requiring a parseable `condition`; stop requiring `color` (color-optional merged here — same file); unknown extra keys ignored (E10). Citation: `DataSource.ts:800-825`.
- [ ] **Step 6 — Rename/delete (S):** `ColumnOperations.ts` (~193, ~370) — `updateSourceRuleTreeKeyReferences` on rename; `removeSourceRuleTreeReferences` on delete (hoists single remaining child — rule collapses to a leaf; dual-write `condition` from that leaf); drop the rule only if nothing remains. Citation: `SourceRules.ts:183-225`.
- [ ] **Step 7 — Editor (M):** `ViewConfigPanelRenderer.ts` `renderConditionalFormatting` (~552-766) — CF-scoped copy of `renderSourceRuleGroup` group chrome (`878-929`); keep existing field/op/value row as the leaf (do **not** copy `renderSourceRuleLeaf`); wrap-into-group writes `conditionTree` the first time (no write-back of eval-time wraps); icon via `openIconPickerPopover`; bold as `db-icon-only-button` + `setIcon(..., "bold")`; `i18n.ts` 3 keys × 3 locales. Citation: `ViewConfigPanelRenderer.ts:552-766`.
- [ ] **Item 10 (S, defer):** Optional `Intl.Segmenter` guard in `RecordIcon.ts:20-25`. Defer unless the phase already touches that function.

### Phase 3: Verification
- [ ] **Step 8 — Colocated vitest gate (S):** Reuse 009's `src/__tests__/setup.ts` if present (only create it if 009 has not); add `package.json` `"test": "vitest run"` only if 009 did not; `src/data/ConditionalFormatting.test.ts` — 12 unit cases on the helper + grep checks (E1 missing id, E7 migration `761-765`, E8/E9 ColumnOperations, E10 extra keys). Citation: `vitest.config.ts:1-8`.
- [ ] Legacy single-condition color-only rules: same colors as the setup baseline (NFR-R01).
- [ ] AND tree requires all predicates; OR tree requires any; empty root short-circuited; first-match still wins.
- [ ] Spot-check all ten consumers for no second matcher; confirm Chart has no matcher; mobile-safe APIs only.
- [ ] Review the diff against the EuroFormat isolation bar (no unrelated formula/column/view churn).

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `getConditionalFormatMatch` / `applyConditionalFormat` — 12 cases: (1) legacy color-only; (2) AND tree; (3) OR tree; (4) first-match collision, no icon/bold merge (E12); (5) empty/missing tree → no match (E2); (6) nested empty group inherits 009 Kleene, root `null` → no match (E4); (7) `valueSource:"today"` on tree (E5); (8) tree-only missing column fail-closed vs legacy frontmatter (E3); (9) invalid icon token (E11); (10) color-omitted icon/bold; (11) icon span not a child of `TR` (or onto first `td:not(.db-select-col)`); (12) `eq` + empty value still matches on the **legacy** path (the `getEffectiveFilterRules` trap) | `src/data/ConditionalFormatting.test.ts` (12 unit cases) under vitest; reuse 009's `src/__tests__/setup.ts` if present (only create if 009 has not); add `package.json` `"test": "vitest run"` only if 009 did not |
| Regression | Color-only fixtures from setup baseline | Same unit tests plus a recorded before/after of representative finance rows |
| Grep (not unit) | E1 missing id; E7 legacy db-level migration `DataSource.ts:761-765`; E8/E9 ColumnOperations rename/delete tree walk; E10 unknown extra keys ignored | `grep`/`diff` checks — these are structural, not helper-behavior, so they are grep-verified, not 12 = E1–E12 |
| Integration | Each of the ten consumers consumes the shared result only; Chart has no matcher | `grep` call sites of `applyConditionalFormat`; fail if a view file walks CF rules itself; fail if `ChartRenderer` grows a matcher |
| Manual | Mobile-safe paint of icon/bold on table (primary, `tr` at :463 / `td` at :503) and one non-table view | Obsidian mobile or narrow pane; no desktop-only APIs |
| Diff hygiene | Files touched vs EuroFormat model | `git diff` limited to the scoped files; 3 call-site edits, 0 renderer consumer edits |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `009-view-filter-tree` `QueryEngine.evaluateFilterTree` + `normalizeViewFilterTree` + `src/data/ViewFilterTree.ts` | Internal predecessor | Planned (must ship first); `ViewFilterTree.ts` absent from fork today | Cannot implement multi-condition without a private dialect (out of scope, REQ-001). One PR after 009 — do not split icon/bold first (it touches `ConditionalFormatting.ts` twice and still needs the same paint/clear path as trees). |
| `src/data/ConditionalFormatting.ts` / `applyConditionalFormat` | Fork existing | Confirmed (`:23-69`) | No shared path to extend |
| Additive `src/data/types.ts` `ConditionalFormatRule` (143-152) | Fork existing | Confirmed | Cannot extend rule/result shapes without breaking loads |
| `src/data/SourceRules.ts:183-225` tree key helpers | Fork existing | Confirmed | Tree-aware rename/delete (Item 5) would need new helpers |
| Ten renderer consumers | Fork existing | Confirmed (Table/List/Board/Gallery/Calendar/CalendarTimeline/RecordDetailPanel/EmbeddedDatabase/DatabaseView) | Icon/bold may be droppable in a view with no slot; matchers must not appear |
| `EuroFormat.ts` isolated-diff model | Pattern | Confirmed (`update-fork.sh:5-7`) | Wide diffs fail rebase onto MIT upstream |
| `openIconPickerPopover` + `RecordIcon` token dialect | Fork existing | Confirmed (`IconPickerPopover.ts:11-23`; `RecordIcon.ts:27-38`) | Would force a new icon representation (out of scope) |
| Formula engines, rollups, footers, charts | Out of scope | Green (do not touch) | Scope leak |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Shared helper regresses legacy colors, a view grows its own matcher, 009 tree is not reusable, raw `parseSourceRuleTree` is called in CF code, `applyFilterTree` (array filter) is used for CF match instead of `evaluateFilterTree`, or the diff spills past the scoped files.
- **Procedure**: Revert the fork diff for this phase (`ConditionalFormatting.ts`, `types.ts`, `DataSource.ts`, `ViewConfigPanelRenderer.ts`, `ColumnOperations.ts`, `styles.css`, `i18n.ts`, tests). Stored vault rules that only used color-only single-condition shapes remain valid. A tree-only rule with no `condition` becomes inert under today's line-31 guard — dual-write (locked design) avoids that. `EmbeddedDatabaseRenderer.ts:3360` already excludes `conditionalFormats` from structural change detection, so tree edits do not trigger extra view-reload vault churn on rollback.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | `009-view-filter-tree` shipped `evaluateFilterTree` + `normalizeViewFilterTree` | Core Implementation |
| Core Implementation — Step 2 (types) | Setup | Steps 3, 5, 6, 7 |
| Core Implementation — Step 3 (match + paint) | 009 REQ-008 (blocked until 009 ships), Step 2 | Step 4 |
| Core Implementation — Step 4 (CSS) | Step 3 | Verification |
| Core Implementation — Step 5 (parse) | Step 2 | Step 7 |
| Core Implementation — Step 6 (rename/delete) | Step 2 | Verification |
| Core Implementation — Step 7 (editor) | Steps 2, 3, 5 | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1 hour (confirm 009 export, read helper, color baseline) |
| Core Implementation — Step 2 (types, S) | Low | 30 min (additive fields incl. optional `color`) |
| Core Implementation — Step 3 (match + paint, M) | Medium | 4 hours (skip guard, tree eval, today, fail-closed, color-optional paint, icon span td fallback) |
| Core Implementation — Step 4 (CSS, S) | Low | 20 min (bold, row-bold, icon) |
| Core Implementation — Step 5 (parse, S) | Low | 45 min (normalizeViewFilterTree, icon/bold, color-optional merged) |
| Core Implementation — Step 6 (rename/delete, S) | Low | 45 min (tree key helpers, hoist-on-delete) |
| Core Implementation — Step 7 (editor, M) | Medium | 4 hours (group chrome, leaf kept, icon picker, bold toggle, i18n) |
| Verification — Step 8 (vitest gate, S) + manual + diff | Low | 3 hours (12 unit cases + grep checks, ten-consumer scan, Chart check) |
| **Total** | Effort M–L overall (one M item: editor; one PR) | **~15 hours** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] 009's `evaluateFilterTree` is the only AND/OR source for CF match (no CF-private tree; no raw `parseSourceRuleTree` call in CF code; `applyFilterTree` array filter not used for CF match).
- [ ] Diff file list reviewed against `ConditionalFormatting.ts`, `types.ts`, `DataSource.ts`, `ViewConfigPanelRenderer.ts`, `ColumnOperations.ts`, `styles.css`, `i18n.ts`, tests — 3 call-site edits, 0 renderer consumer edits.
- [ ] No `App.vault` write path added for computed format (`EmbeddedDatabaseRenderer.ts:3360` still excludes `conditionalFormats`).
- [ ] No desktop-only APIs in CF path (only `CalendarDateTime`, `QueryEngine`, `types`); no telemetry or secrets.
- [ ] Empty roots short-circuited before eval; `getEffectiveFilterRules` not run on CF leaves.

### Rollback Procedure
1. Revert the phase diff on the fork (those files only).
2. Confirm `applyConditionalFormat` again returns color-only first-match results for legacy rules.
3. Re-run the color baseline rows from Setup.
4. Confirm view files do not retain a leftover local matcher; confirm Chart has no matcher.

### Data Reversal
- **Has data migrations?** No. Types are additive optional fields; dual-write keeps `condition` as the first leaf.
- **Reversal procedure**: Leave extra fields (`conditionTree` / `icon` / `bold`) in saved views if present; old code ignores them (E10). Do not rewrite vault files to strip the new keys (iCloud-safe). A tree-only rule with no `condition` becomes inert under today's line-31 guard — dual-write avoids creating such rules. Users who saved multi-condition rules would see those rules inert until the feature is restored — acceptable for rollback.

<!-- /ANCHOR:enhanced-rollback -->
