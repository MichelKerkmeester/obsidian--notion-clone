---
title: "Feature Specification: Conditional Formatting Multi-Condition and Icons"
description: "Specify multi-condition AND/OR conditional-format rules plus icon and bold attributes on the shared applyConditionalFormat path."
trigger_phrases:
  - "conditional formatting"
  - "multi-condition format"
  - "format icons"
  - "applyconditionalformat"
  - "icon bold attribute"
  - "and or format rules"
  - "first-match formatting"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons"
    last_updated_at: "2026-08-25T21:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored from synthesis and final-plan"
    next_safe_action: "Build 001-format-match-paint-module per its plan.md and tasks.md"
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
# Feature Specification: Conditional Formatting Multi-Condition and Icons

> Predecessor: `009-view-filter-tree`. Successor: `011-table-multi-group`. Parent spec: [`../spec.md`](../spec.md).

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
| **Branch** | `010-conditional-format-icons` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork already matches Notion's core conditional-format contract — per-view rules, first-match, row-or-property color — through one shared helper (`getConditionalFormatMatch` / `applyConditionalFormat` in `src/data/ConditionalFormatting.ts:23-69`) that all ten renderer consumers call. What the finance vault still needs is a small, rebase-safe **superset**: AND/OR inside a single rule, plus an icon and a bold flag. The single biggest risk is sequencing — phase `009-view-filter-tree` is still Planned and `src/data/ViewFilterTree.ts` is absent from the fork, so starting 010 now would force a private CF walker, which REQ-001 and §8 forbid.

### Purpose
Extend `src/data/ConditionalFormatting.ts` in place (it is already the EuroFormat-shaped isolation surface), reuse 009's `SourceRuleNode` tree through `QueryEngine.evaluateFilterTree` (matching `=== true`; the array-filter `applyFilterTree` treats root `null` as visible and must NOT be used for CF match), store icons as the existing `RecordIcon` token, and paint icon/bold inside `applyConditionalFormat` so the ten renderer consumers stay untouched. Types in `src/data/types.ts` stay additive so stored single-condition, color-only, first-match rules keep evaluating unchanged. Nested children own the ordered slices: in-place match-and-paint, additive parse, tree-aware column ops, the CF editor, then display proof.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Extend `src/data/ConditionalFormatting.ts` in place: evaluate AND/OR trees via 009's `QueryEngine.evaluateFilterTree` (matching `=== true`), return `{ color?, icon?, bold?, ruleId }`, and paint icon/bold inside `applyConditionalFormat`. Do **not** add `src/data/ConditionalFormatTree.ts` (that would be a third condition dialect). Legacy rules with no `conditionTree` keep the existing `applyFilters([row], [rule.condition], "and", columns)` call (`:38`) so NFR-R01 is a literal same call.
- Reuse 009's `SourceRuleNode` tree (`src/data/types.ts:250`) as the only AND/OR source; consume 009's `normalizeViewFilterTree` parse/eval, not raw `parseSourceRuleTree` (`SourceRules.ts:227-257`, whose whitelist is `SourceRuleOperator` including `inFolder` / `strictEq` / `expression`).
- Additive `src/data/types.ts` fields: optional `conditionTree?: SourceRuleNode` on `ConditionalFormatRule`, `icon?: string` (RecordIcon token, ≤64 chars), `bold?: boolean`, and `color?: StatusColor` (was required; now optional so icon/bold rules can omit background).
- Icon attribute stored as the existing RecordIcon token dialect — one emoji grapheme or `lucide:<id>@<color>` (`src/data/RecordIcon.ts:27-38`); reject vault paths. Bold as a boolean.
- CF editor (`src/views/ViewConfigPanelRenderer.ts:552-766` `renderConditionalFormatting`): nested groups via a CF-scoped copy of `renderSourceRuleGroup` group chrome (`878-929`, positional splice, no node ids); keep the existing field/op/value row as the leaf (do **not** copy `renderSourceRuleLeaf`); add wrap-into-group / delete-last-child-deletes-group (Anytype `group.tsx:66-110`). Icon via existing `openIconPickerPopover` (`src/views/IconPickerPopover.ts:11-23`), bold as a `db-icon-only-button` + `setIcon(..., "bold")`.
- Additive parse of `conditionTree` / `icon` / `bold` in `src/data/DataSource.ts` `parseConditionalFormats` (~800-825) via 009's `normalizeViewFilterTree`.
- Tree-aware column rename/delete in `src/views/ColumnOperations.ts` (~193, ~370) using `updateSourceRuleTreeKeyReferences` / `removeSourceRuleTreeReferences` (`src/data/SourceRules.ts:183-225`).
- `valueSource: "today"` resolved onto date-like leaves inside trees, rule-level (`src/data/ConditionalFormatting.ts:12-21`).
- Tree-only missing-column fail-closed (`src/data/QueryEngine.ts:283-294`); legacy single-condition path keeps today's frontmatter fallback.
- Color-optional rules: stop requiring `color` at parse; paint background CSS vars only when a color is set; icon/bold still apply.
- Colocated vitest gate: `src/__tests__/setup.ts` (or drop `setupFiles`), `package.json` `test` script, `src/data/ConditionalFormatting.test.ts`.
- Display-only evaluation (no `App.vault` writes, no rollup persistence, no telemetry).

### Out of Scope
- A new `src/data/ConditionalFormatTree.ts` module or any third condition dialect.
- Per-renderer conditional-format engines for table, board, gallery, list, calendar, timeline, or chart.
- Chart CF: `ChartRenderer` has no `applyConditionalFormat` binding today; Notion also skips Chart. SC-004 stays satisfied as long as Chart does not grow a matcher.
- Notion "Match Option" (select/status cell color follows the option's color) — a real Notion gap, deferred to a later phase.
- Icon catalog, icon picker chrome, and named-icon packs beyond reusing `openIconPickerPopover` and the existing `getValidRecordIconIds` / `RECORD_ICON_COLORS` palette.
- `Intl.Segmenter` feature-test guard in `src/data/RecordIcon.ts:20-25` — pre-existing risk, same class as shipped record icons; defer unless the phase already touches that function.
- Changing first-match rule order across a rule list (today's first-match behavior stays).
- New formula engines, new column types, new view types, relation/rollup math, footer `SummaryKind`s, or chart aggregations.
- Phase `011-table-multi-group` table grouping work.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/ConditionalFormatting.ts` (fork root: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`) | Modify | Evaluate 009 trees, return icon/bold, paint icon/bold inside `applyConditionalFormat`; keep first-match and the ten consumers untouched. |
| `src/data/types.ts` | Modify | Additive `conditionTree?: SourceRuleNode`, `icon?: string`, `bold?: boolean`, `color?: StatusColor` (was required) on `ConditionalFormatRule` (143-152). |
| `src/data/DataSource.ts` | Modify | `parseConditionalFormats` (~800-825): additive parse via 009's `normalizeViewFilterTree`; stop requiring `color`. |
| `src/views/ViewConfigPanelRenderer.ts` | Modify | `renderConditionalFormatting` (~552-766): nested groups + icon picker + bold toggle. |
| `src/views/ColumnOperations.ts` | Modify | Tree-aware rename (~193) and delete (~370) via `SourceRules.ts:183-225`. |
| `styles.css` | Modify | `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon`. |
| `src/i18n.ts` | Modify | 3 keys × 3 locales: `conditionalFormat.icon` / `bold` / `group`; reuse `panel.and` / `panel.or` / `panel.addCondition`. |
| `src/__tests__/setup.ts` + `package.json` + `src/data/ConditionalFormatting.test.ts` | Create/Modify | Colocated vitest gate (12 cases). |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Multi-condition rules reuse 009's `SourceRuleNode` tree via `QueryEngine.evaluateFilterTree` (matching `=== true`) | A conditional-format rule expresses combined predicates with AND and OR using the same `SourceRuleNode` tree 009 ships for views; CF matches via `evaluateFilterTree(...) === true` (not the array-filter `applyFilterTree`, which treats root `null` as visible); there is no third condition dialect and no call to raw `parseSourceRuleTree` in CF code. |
| REQ-002 | Shared `applyConditionalFormat` remains the only evaluation path | All ten renderer consumers (Table, List, Board, Gallery, Calendar, CalendarTimeline, RecordDetailPanel, EmbeddedDatabase, DatabaseView) receive format from that helper; zero renderer files implement a CF predicate engine. |
| REQ-003 | Format result includes icon (RecordIcon token) and bold besides background color | When a matching rule sets icon and/or bold, the shared result exposes `icon?: string` (RecordIcon token) and `bold?: boolean`; consumers paint them inside `applyConditionalFormat` without a second matcher. |
| REQ-004 | Additive types preserve legacy rules | Existing single-condition, color-only, first-match rules still type-check and still evaluate to a background color through `applyConditionalFormat`; `DataSource.parseConditionalFormats` loads legacy JSON without the new keys unchanged (NFR-R01). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | First-match across the rule list is unchanged | Given two rules that both match, the earlier rule wins (`ConditionalFormatting.ts:39`); later icon/bold never merge onto the first rule's color. |
| REQ-006 | Diff stays rebase-friendly on the EuroFormat model | Change set is `ConditionalFormatting.ts` + additive `types.ts` + `DataSource.ts` + `ViewConfigPanelRenderer.ts` + `ColumnOperations.ts` + `styles.css` + `i18n.ts` + tests — 3 rebase-safe call-site edits, 0 renderer consumer edits; no drive-by refactors. |
| REQ-007 | Mobile-safe, MIT-forkable, iCloud-safe, no secrets | CF path imports only `CalendarDateTime`, `QueryEngine`, `types` — no `electron` / `fs` / Node; no extra `App.vault` writes (`EmbeddedDatabaseRenderer.ts:3360` already excludes `conditionalFormats` from structural change detection); no telemetry or credentials. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A rule whose `conditionTree` is AND of two predicates formats a row only when both hold; a sibling OR tree formats when either holds; evaluation goes through `applyConditionalFormat` via 009's `evaluateFilterTree` (matching `=== true`).
- **SC-002**: A matching rule can set background color, icon (RecordIcon token), and bold together; a color-only legacy rule still sets only color; a color-omitted rule still applies icon/bold.
- **SC-003**: First-match still selects the first matching rule in list order (`ConditionalFormatting.ts:39`); later icon/bold never merge.
- **SC-004**: Table, board, gallery, list, calendar, and timeline do not contain a second CF predicate walker; Chart does not grow a matcher (Notion also skips Chart).
- **SC-005**: The fork diff is limited to the files in Scope; `git rebase` onto upstream is no harder than the isolated `EuroFormat.ts` override.

### Acceptance Scenarios

- **Scenario 1**: **Given** a color-only single-condition rule saved before this phase, **when** `applyConditionalFormat` runs, **then** the cell still receives that background color and does not require a tree rewrite (NFR-R01).
- **Scenario 2**: **Given** a rule whose `conditionTree` is AND of two field predicates from 009's `SourceRuleNode` tree, **when** only one predicate holds, **then** the rule does not apply; **when** both hold, **then** icon/bold/color from that rule apply.
- **Scenario 3**: **Given** two rules where the second would also match, **when** the first matches, **then** the first rule's format wins (first-match); the second rule's icon/bold do not merge.
- **Scenario 4**: **Given** any of the ten renderer consumers rendering a formatted cell, **when** a rule matches, **then** format comes from the shared helper result, not from a view-local matcher.
- **Scenario 5**: **Given** an iCloud-synced vault, **when** CF evaluates, **then** no extra note-file write is issued solely to store a computed format (`EmbeddedDatabaseRenderer.ts:3360` excludes `conditionalFormats` from structural change detection).

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase `009-view-filter-tree` must ship `QueryEngine.evaluateFilterTree` first | Multi-condition CF has no tree to reuse; a local AND/OR dialect would fork the product. Confirmed on disk: no `ViewFilterTree.ts` in the fork; 009 spec status is Planned | Do not start implementation until 009 exports `evaluateFilterTree` (the per-row `boolean \| null` evaluator); this packet stays Planned. REQ-001 and §8 forbid a private CF walker |
| Dependency | `src/data/ConditionalFormatting.ts` / `applyConditionalFormat` (fork root `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`) | A copied helper would create a second engine | Extend it in place; it is already the EuroFormat-shaped isolation surface |
| Risk | Renderers grow local icon/bold logic that re-evaluates rules | First-match and AND/OR drift per view | Renderers only consume the shared result object; icon/bold painted inside `applyConditionalFormat` |
| Risk | Calling raw `parseSourceRuleTree` for CF persistence | That whitelist is `SourceRuleOperator` (`inFolder` / `strictEq` / `expression`), not the view 10-op set; CF would load operators it cannot evaluate | Use 009's `normalizeViewFilterTree` for `conditionTree` parse |
| Risk | Empty AND root matches every row | `matchesSourceRuleTree` returns `logic === "and"` for empty groups (`SourceRules.ts:152`), unlike AppFlowy's no-op | Short-circuit empty roots before eval; map 009's three-valued `None` → non-match if 009 ships it |
| Risk | Calling `applyFilterTree` (array filter) for CF match | `applyFilterTree([row], empty).length > 0` treats root `null` as visible and would format every row | CF matches via `evaluateFilterTree(row, tree, columns) === true`; root `null` (nested all-skips) is non-match |
| Risk | Tree leaves drop `eq` + empty value via `getEffectiveFilterRules` | Legacy cells would recolor | Do **not** run `getEffectiveFilterRules` on CF leaves; evaluate via `QueryEngine.matchesFilter` raw |
| Risk | Treating CF as a write (persisting computed format into notes) | iCloud churn | Keep evaluation display-only; `EmbeddedDatabaseRenderer.ts:3360` already excludes `conditionalFormats` from structural change detection |
| Risk | Wide edits outside the scoped files | Dirty rebase onto MIT upstream | 3 rebase-safe call-site edits, 0 renderer consumer edits; no per-view copies |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Evaluating CF for a visible page of rows stays on the existing per-row shared-helper path; evaluation is per visible row/cell, first-match short-circuit, O(tree) recursion — no second full-table scan per renderer.
- **NFR-P02**: Tree evaluation reuses 009's `evaluateFilterTree` rather than walking predicates twice (once for filters, once with a private CF walker). 009 must export `evaluateFilterTree` before this phase starts. Legacy rules with no `conditionTree` keep the existing `applyFilters` call (`:38`).

### Security
- **NFR-S01**: No telemetry, secrets, tokens, or credential-shaped strings in the CF diff.
- **NFR-S02**: Icon values are RecordIcon data tokens (emoji grapheme or `lucide:<id>@<color>`), validated by `parseRecordIconToken`; invalid tokens yield no icon. Never route icon strings through `eval` or `SafeEval.ts`.

### Reliability
- **NFR-R01**: Legacy single-condition color-only rules keep producing the same color they do today for the same rows; `DataSource.parseConditionalFormats` loads them unchanged.
- **NFR-R02**: Invalid or empty condition trees fail closed (no format), consistent with first-match skipping a non-matching rule; do not throw through the renderer. Tree-only missing-column leaves fail closed; legacy single-condition keeps the frontmatter fallback.
- **NFR-R03**: Mobile and desktop share the same helper; CF imports only `CalendarDateTime`, `QueryEngine`, `types` — no `require('electron')` or other desktop-only APIs.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **E1** Missing `id`, or neither `condition.field` nor a non-empty `conditionTree`: skip the rule. The skip guard at `ConditionalFormatting.ts:31` must relax from `!rawRule.condition?.field` to "neither `condition.field` nor a non-empty `conditionTree`" so a future tree-only row is not inert.
- **E2** Empty/missing `conditionTree`: rule does not match; next rule may. Short-circuit empty roots before eval (an empty AND would otherwise match every row).
- **E3** Undeclared column: legacy single-condition keeps the frontmatter match (`QueryEngine.ts:283-294`); **tree rules only** fail closed.
- **E4** Nested empty group `(∅) or C`: inherit 009's behavior (AppFlowy skip-empty, not two-valued AND-pass). (`controller.rs:482-497` vs `SourceRules.ts:152`)
- **E5** `valueSource: "today"` on a tree: rule-level substitution of `getLocalDateKey(new Date())` onto date-like leaves with an empty value on a comparison op. (`ConditionalFormatting.ts:12-21`; `CalendarDateTime.ts:57`)
- **E6** Deep AND/OR nesting: 009's depth limit only; CF adds none. (`SourceRules.ts:144-156`)
- **E7** Legacy db-level rules: still migrate into views on read, copy `{...rule.condition}`. (`DataSource.ts:761-765`)
- **E8/E9** Rename/delete: walk the tree with `updateSourceRuleTreeKeyReferences` / `removeSourceRuleTreeReferences`; on delete, drop the rule only if nothing remains. (`SourceRules.ts:183-225`; `ColumnOperations.ts:193,370`)
- **E10** Unknown extra keys: ignore; new keys are additive. (`DataSource.ts:800-825`)
- **E11** Invalid icon string: store capped raw (≤64 chars); render fail-closed to no icon via `parseRecordIconToken` → null. (`RecordIcon.ts:27-38`)
- **E12** Two rules match: first wins; no icon/bold merge onto the first rule's color. (`ConditionalFormatting.ts:39`)
- **Color omitted**: stop requiring `color` at parse; skip color CSS vars and still apply icon/bold. (`spec.md` §3 In Scope; `DataSource.ts:800-825`)

### Error Scenarios
- Predicate references a missing column: tree rules treat as non-match (fail closed); legacy single-condition keeps the frontmatter fallback — never a thrown renderer error.
- Two rules match: first in list wins; later icon/bold must not merge onto the first rule's color unless the first rule itself set them.
- Consumer ignores icon/bold and only paints color: allowed for a view that has no icon slot, but it must still not re-run predicates.
- 009's `evaluateFilterTree` unavailable: implementation is blocked; do not ship a private CF-only tree (REQ-001). If `evaluateFilterTree` is missing but `evaluateViewFilterTree` exists, add the `QueryEngine` wrapper in 009 — do not export `matchesFilter` or clone a walker here.

### Concurrent Operations
- CF is display-only; concurrent iCloud edits of note bodies must not be caused by format evaluation. `EmbeddedDatabaseRenderer.ts:3360` already excludes `conditionalFormats` from structural change detection, so tree edits do not trigger extra view-reload vault churn.
- Recompute on visible data changes through the same invalidation path views already use for filters; do not add a second subscription model.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | Eight known fork files (`ConditionalFormatting.ts`, `types.ts`, `DataSource.ts`, `ViewConfigPanelRenderer.ts`, `ColumnOperations.ts`, `styles.css`, `i18n.ts`, tests); 3 call-site edits, 0 renderer consumer edits; effort M–L overall (one M item: editor; ~15 hours, one PR — do not split icon/bold first) |
| Risk | 10/25 | Hard dependency on 009 (`evaluateFilterTree` absent today); ten consumers must not fork engines; empty-AND, raw-parser, and `applyFilterTree`-as-CF-match pitfalls; rebase surface |
| Research | 12/20 | Synthesis complete: ranked backlog, locked design, edge cases E1–E12, mobile/iCloud safety, and fork path confirmed on disk |
| **Total** | **34/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

The synthesis resolves every prior UNKNOWN with a recommended default; each is recorded here so the operator can still override before build:

1. **Start 010 before 009 ships?** Recommended default: **No.** REQ-001 and §8 forbid a private CF walker; `evaluateFilterTree` is absent today.
2. **Icon attribute representation** (was Open Question 1): Recommended default: **RecordIcon token** — one emoji grapheme or `lucide:<id>@<color>` (`RecordIcon.ts:27-38`; `types.ts:259-260`). Reject vault paths. Reuse `openIconPickerPopover`; do not build a catalog.
3. **009 vs `SourceRuleNode` unification** (was Open Question 2): Recommended default: **`SourceRuleNode` is the only tree** (009 REQ-002). 010 calls 009's `normalizeViewFilterTree` parse/eval; do not reuse unfiltered `parseSourceRuleTree`.
4. **Missing-column behavior** (E3 vs NFR-R01): Recommended default: **tree rules fail closed; legacy single-condition path untouched.**
5. **Color-optional icon/bold rules** (§3 vs current parse): Recommended default: **Yes** — stop requiring `color` at parse; paint background only when set. Dual-write `condition` + `conditionTree` still required for Apply-to and rollback.
6. **Field-target primary field for a multi-field tree?** Recommended default: **`condition.field` stays the Apply-to property** (`ConditionalFormatting.ts:32-36`). Do not paint every leaf field.
7. **Write normalized trees back onto legacy rules?** Recommended default: **No.** Eval-time wrap only; editor writes `conditionTree` only after the user adds a group.
8. **Consume CF on Chart?** Recommended default: **No.** Notion skips Chart; `ChartRenderer` has no matcher today; adding one is scope creep.
9. **Notion Match Option (select/status color-follows-option)?** Recommended default: **Defer.** Real Notion gap, out of this spec.
10. **`Intl.Segmenter` guard in this phase?** Recommended default: **Skip.** Same risk class as shipped record icons.

Fork path (was Open Question 3) is no longer UNKNOWN: live source is `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research synthesis (ranked backlog, locked design, edge cases)**: `research/synthesis.md`
- **Research evidence trail**: `research/research.md`
- **Fork source root**: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`
- **Predecessor**: `../009-view-filter-tree`
- **Successor**: `../011-table-multi-group`

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-format-match-paint-module/ | In-place `ConditionalFormatting.ts` types, AND/OR tree eval, icon/bold/color-optional paint, and CF CSS | Planned |
| 2 | 002-format-parse-persist/ | Additive `parseConditionalFormats` of `conditionTree` / `icon` / `bold` / optional `color` via 009 `normalizeViewFilterTree` | Planned |
| 3 | 003-tree-aware-column-ops/ | Rename and delete walk `conditionTree` with existing source-tree helpers | Planned |
| 4 | 004-format-editor-panel/ | CF panel group chrome, icon picker, bold toggle, and three i18n keys | Planned |
| 5 | 005-format-display-proof/ | Twelve helper cases, grep guards, and table plus non-table display proof | Planned |

Future / out of this phase (not child folders): `Intl.Segmenter` guard in `RecordIcon.ts`; Notion Match Option; Chart CF; a third dialect `ConditionalFormatTree.ts`; shipping icon/bold before trees.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-format-match-paint-module | 002-format-parse-persist | 009 halt passed; additive types land; match uses `evaluateFilterTree(...) === true`; paint covers icon/bold/optional color; CSS classes exist; no renderer consumer edits | Legacy color-only matches the baseline; first-match does not merge later icon/bold (`ConditionalFormatting.ts:39`); `applyFilterTree` is not the CF matcher |
| 002-format-parse-persist | 003-tree-aware-column-ops | `parseConditionalFormats` loads `conditionTree` via `normalizeViewFilterTree`, `icon` ≤64 chars, `bold`, optional `color`; never `parseSourceRuleTree` | Color-only JSON loads unchanged; tree+icon+bold JSON loads; invalid tree dropped and `condition` kept (`DataSource.ts:800-825`) |
| 003-tree-aware-column-ops | 004-format-editor-panel | Rename updates tree keys; delete removes tree refs and drops the CF rule only if nothing remains | No stale `conditionTree` keys after rename (`SourceRules.ts:183-206`); last-leaf delete drops the rule (`:208-225`) |
| 004-format-editor-panel | 005-format-display-proof | Panel copies group chrome only; leaves stay field/op/value; wrap-into-group dual-writes `condition` + `conditionTree`; icon picker and bold toggle persist | AND/OR group plus icon plus bold save and reload; no add-expression; no Chart CF UI (`ViewConfigPanelRenderer.ts:552-766`) |
<!-- /ANCHOR:phase-map -->
