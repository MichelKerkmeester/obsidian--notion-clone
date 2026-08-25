---
title: "Tasks: Conditional Formatting Multi-Condition and Icons"
description: "Task list to extend shared applyConditionalFormat with 009 filter trees plus icon and bold."
trigger_phrases:
  - "conditional formatting tasks"
  - "applyconditionalformat"
  - "multi-condition cf"
  - "format icons"
  - "icon bold tasks"
  - "cf first-match"
  - "euroformat call sites"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons"
    last_updated_at: "2026-08-25T00:00:00Z"
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
# Tasks: Conditional Formatting Multi-Condition and Icons

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
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (fork file:line) [effort S/M/L]`

Fork root for all paths: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`. Citations are from `research/synthesis.md` and `research/research.md`.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm 009 exports `QueryEngine.evaluateFilterTree` (per-row `boolean | null`) + `normalizeViewFilterTree` and that `src/data/ViewFilterTree.ts` exists in the fork; if `evaluateFilterTree` is missing but `evaluateViewFilterTree` exists, add the `QueryEngine` wrapper in 009 — do not start a CF-local matcher; if absent, halt (`../009-view-filter-tree`) [20m]
- [ ] T002 Read `src/data/ConditionalFormatting.ts:23-69` and `src/data/types.ts:143-152` as the in-place extension surface [15m]
- [ ] T003 Inventory all ten `applyConditionalFormat` consumer call sites (Table/List/Board/Gallery/Calendar/CalendarTimeline/RecordDetailPanel/EmbeddedDatabase/DatabaseView) [20m]
- [ ] T004 Record a color-only first-match baseline on representative finance rows before changing the helper (`src/data/ConditionalFormatting.ts:23-42`) [20m]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Tasks follow the final build plan order (one PR after 009 — do not split icon/bold first). Effort tiers and file:line targets are from `research/final-plan.md` and `research/synthesis.md`. `[B]` marks blocked/deferred items.

### Step 2 — Types (S)
- [ ] T005 Add `icon?: string` (RecordIcon token, ≤64 chars), `bold?: boolean`, and `color?: StatusColor` (was required) to `ConditionalFormatRule` (`src/data/types.ts:143-152`) [30m]
- [B] T008 Add `conditionTree?: SourceRuleNode` to `ConditionalFormatRule` (`src/data/types.ts:143-152`) [30m]

### Step 3 — Match + paint (M)
- [ ] T006 Extend `ConditionalFormatMatch` to carry `icon?` / `bold?` and `color?` (optional); paint/clear them inside `applyConditionalFormat` (`src/data/ConditionalFormatting.ts:39,44-69`); paint color vars only when `match.color` is set (color-optional merged here — same file); add `db-conditional-format-icon` span via `renderRecordIcon` only when element is not a `TR`, **or** onto the first `td:not(.db-select-col)` when it is (TableRenderer `tr` at :463, `td` at :503) [1h]
- [B] T009 In `getConditionalFormatMatch`, relax the skip guard at `:31` to "neither `condition.field` nor a non-empty `conditionTree`"; normalize to a tree (wrap `condition` as `{type:"group",logic:"and",rules:[condition]}`, `ViewConfigPanelRenderer.ts:98-100`); short-circuit empty roots before eval; evaluate via `queryEngine.evaluateFilterTree(row, tree, columns) === true` (NOT the array-filter `applyFilterTree`, which treats root `null` as visible) onto `QueryEngine.matchesFilter` raw (not `getEffectiveFilterRules`); legacy (no `conditionTree`) keeps `applyFilters([row], [rule.condition], "and", columns)` (`:38`) (`src/data/ConditionalFormatting.ts:23-42`; `FilterRules.ts:3-12`) [1h30m]
- [B] T012 Rule-level substitution of `getLocalDateKey(new Date())` onto date-like leaves with an empty value on a comparison op; keep the flag rule-level (`src/data/ConditionalFormatting.ts:12-21`; `src/data/CalendarDateTime.ts:57`) [30m]
- [B] T013 Leaf adapter: a tree leaf whose field is not in `config.schema.columns` and is not `file.*` / computed → false; legacy (no `conditionTree`) keeps the frontmatter fallback; do not run `getEffectiveFilterRules` on CF leaves (`src/data/QueryEngine.ts:283-294`) [30m]

### Step 4 — CSS (S)
- [ ] T007 Add `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon` next to the existing CF block (`styles.css:469-484`) [20m]

### Step 5 — Parse (S)
- [B] T010 Parse `conditionTree` via 009's `normalizeViewFilterTree` (not raw `parseSourceRuleTree`), `icon` ≤64 chars, `bold` boolean; keep requiring a parseable `condition` object as the Apply-to / legacy leaf; stop requiring `color` (color-optional merged here — same file); unknown extra keys ignored (E10) (`src/data/DataSource.ts:800-825`) [45m]

### Step 6 — Rename/delete (S)
- [B] T011 On rename, call `updateSourceRuleTreeKeyReferences(rule.conditionTree, oldKey, newKey)` in addition to `rule.condition.field`; on delete, `removeSourceRuleTreeReferences` (hoists a single remaining child — rule collapses to a leaf; dual-write `condition` from that leaf) and drop the rule only if nothing remains (`src/views/ColumnOperations.ts:193,370`; `src/data/SourceRules.ts:183-225`) [45m]

### Step 7 — Editor (M)
- [B] T015 Replace the single field/op/value trio in `renderConditionalFormatting` with a CF-scoped copy of `renderSourceRuleGroup` group chrome (`878-929`, positional splice, no node ids); keep the existing field/op/value row as the leaf (do **not** copy `renderSourceRuleLeaf`); add wrap-into-group / delete-last-child-deletes-group (Anytype `group.tsx:66-110`) (`src/views/ViewConfigPanelRenderer.ts:552-766`) [2h]
- [B] T016 Add icon via existing `openIconPickerPopover` (`src/views/IconPickerPopover.ts:11-23`); add bold as a `db-icon-only-button` + `setIcon(..., "bold")` [45m]
- [B] T017 Add 3 i18n keys × 3 locales: `conditionalFormat.icon` / `bold` / `group`; reuse `panel.and` / `panel.or` / `panel.addCondition` (`src/i18n.ts`) [30m]

### Item 10 — Optional Intl.Segmenter guard (S, defer)
- [B] T018 Defer: add a feature test around `Intl.Segmenter` in `isSingleEmojiGrapheme` only if the phase already touches that function (`src/data/RecordIcon.ts:20-25`) [0m]

### Integration
- [ ] T019 Keep formula engines, rollups, footers, and chart aggregations untouched (`ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts`, `SummaryRenderer.ts`, `ChartAggregation.ts`); `grep` renderer files for a second CF predicate walker — fail if one exists; confirm `ChartRenderer` still has no `applyConditionalFormat` binding [15m]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Step 8 — Colocated vitest gate (S)
- [ ] T020 Reuse 009's `src/__tests__/setup.ts` if present (only create it if 009 has not, or drop `setupFiles`); add `"test": "vitest run"` to `package.json` only if 009 did not [20m]
- [ ] T021 Author `src/data/ConditionalFormatting.test.ts` with 12 **unit** cases on the helper: (1) legacy color-only; (2) AND tree; (3) OR tree; (4) first-match collision, no icon/bold merge (E12); (5) empty/missing tree → no match (E2); (6) nested empty group inherits 009 Kleene, root `null` → no match (E4); (7) `valueSource:"today"` on tree (E5); (8) tree-only missing column fail-closed vs legacy frontmatter (E3); (9) invalid icon token (E11); (10) color-omitted icon/bold; (11) icon span not a child of `TR` (or onto first `td:not(.db-select-col)`); (12) `eq` + empty value still matches on the **legacy** path (the `getEffectiveFilterRules` trap) [1h30m]
- [ ] T021b **Grep, not unit** (structural checks): E1 missing `id` skip; E7 legacy db-level migration `DataSource.ts:761-765` still copies `{...rule.condition}`; E8/E9 ColumnOperations rename/delete tree walk; E10 unknown extra keys ignored. These are grep/diff-verified, not 12 = E1–E12 [20m]

### Integration Tests
- [ ] T022 `grep` the ten consumer files for a second CF predicate walker; fail if one exists (`src/views/*Renderer.ts`) [20m]
- [ ] T023 Confirm `ChartRenderer` has no `applyConditionalFormat` binding and does not grow one [10m]

### Manual Verification
- [ ] T024 Confirm table (`tr` :463 / `td` :503) plus one non-table view paint shared icon/bold without desktop-only APIs and without extra `App.vault` writes [30m]

### Documentation
- [ ] T025 After implementation, mark checklist evidence from observed tests (`checklist.md`) — not before [15m]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-deferred tasks marked `[x]`.
- [ ] No `[B]` blocked tasks remaining except T018 (deferred by design — `Intl.Segmenter` guard).
- [ ] 009's `evaluateFilterTree` shipped and consumed for CF match (no private CF walker; no raw `parseSourceRuleTree` call; `applyFilterTree` array filter not used for CF match). T014 merged into T010/T006 (color-optional is not a standalone task).
- [ ] Strict validation passed.
- [ ] Checklist.md fully verified.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research synthesis (ranked backlog source)**: `research/synthesis.md`
- **Research evidence trail**: `research/research.md`

<!-- /ANCHOR:cross-refs -->
