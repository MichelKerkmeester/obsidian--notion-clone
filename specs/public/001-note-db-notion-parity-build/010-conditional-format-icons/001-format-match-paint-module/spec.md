---
title: "Feature Specification: Format Match Paint Module"
description: "Same-diff in-place extension of ConditionalFormatting.ts: additive types, AND/OR tree eval via evaluateFilterTree, icon/bold/color-optional paint, and CF CSS. Do not ship icon/bold without trees."
trigger_phrases:
  - "format match paint"
  - "conditional format tree"
  - "evaluatefiltertree"
  - "applyconditionalformat"
  - "icon bold paint"
  - "color optional format"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/001-format-match-paint-module"
    last_updated_at: "2026-08-25T21:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored match-paint child from synthesis and final-plan"
    next_safe_action: "Halt on 009 APIs, then extend ConditionalFormatting.ts plus types and CSS"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-format-match-paint-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Format Match Paint Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `010-conditional-format-icons` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 5 |
| **Predecessor** | None |
| **Successor** | 002-format-parse-persist |
| **Handoff Criteria** | Halt passed; types, match/eval, paint, and CSS land together; icon/bold not shipped without trees |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 5** — Parent: [`../spec.md`](../spec.md) · Successor: `002-format-parse-persist`. Synthesis ranks 1, 2, 6, 7 plus color-optional **paint** from rank 9; final-plan steps 0–4. Keep AND/OR trees and icon/bold in this same child (final-plan: do not land icon/bold first). Parse, column ops, editor, and tests wait for later children.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The shared helper already matches Notion's core CF contract through `getConditionalFormatMatch` / `applyConditionalFormat` (`ConditionalFormatting.ts:23-69`) and returns `{ color, ruleId }` only. Finance vaults need AND/OR inside a rule plus icon and bold on that same first-match result. Starting before 009 ships `QueryEngine.evaluateFilterTree` would force a private CF walker, which parent REQ-001 forbids. Shipping icon/bold first would touch `ConditionalFormatting.ts` twice.

### Purpose
Halt until 009's tree APIs exist, then extend `ConditionalFormatting.ts` in place with additive types, tree eval matching `evaluateFilterTree(...) === true`, icon/bold/color-optional paint, and CF CSS, with zero renderer consumer edits.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Halt gate: `src/data/ViewFilterTree.ts` exists; `QueryEngine.evaluateFilterTree` and `applyFilterTree` are importable; `normalizeViewFilterTree` is the view-op parser. If `evaluateFilterTree` is missing, stop (add the wrapper in 009; do not clone a walker here).
- Additive `ConditionalFormatRule` fields at `types.ts:143-152`: `conditionTree?: SourceRuleNode`, `icon?: string`, `bold?: boolean`, `color?: StatusColor` (was required at `:151`).
- `getConditionalFormatMatch` algorithm (final-plan step 3): skip no `id`, or neither `condition.field` nor a non-empty `conditionTree` (relax `:31`); target filter unchanged (`:32-36`); eval-time wrap of legacy `condition` only; match iff `evaluateFilterTree(...) === true`; rule-level `valueSource: "today"` onto date-like leaves (`:12-21`; `CalendarDateTime.ts:57`); tree-only missing-column fail-closed; legacy path keeps `applyFilters` (`:38`) plus frontmatter fallback (`QueryEngine.ts:283-294`); first match returns `{ color?, icon?, bold?, ruleId }` and stops (`:39`). Do **not** run `getEffectiveFilterRules` (`FilterRules.ts:3-12`). Do **not** call `applyFilterTree` for CF match.
- `applyConditionalFormat` (`:44-69`): existing six CSS vars + class + rule-id attr; plus `db-conditional-format-bold`; plus `data-note-database-conditional-icon`; icon span via `renderRecordIcon` (`RecordIconRenderer.ts:18-33`) when element is not `TR`, or onto the first `td:not(.db-select-col)` when it is; paint color vars only when `match.color` is set; invalid icon (`parseRecordIconToken` → null, `RecordIcon.ts:27-38`) yields no icon.
- CSS next to the existing CF block (`styles.css:469-484`): `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon`.

### Out of Scope
- `DataSource.parseConditionalFormats` (child `002-format-parse-persist`).
- Column rename/delete (child `003-tree-aware-column-ops`).
- CF editor and i18n (child `004-format-editor-panel`).
- Vitest file and display proof (child `005-format-display-proof`).
- `ConditionalFormatTree.ts`; Chart CF; Match Option; `Intl.Segmenter` (`RecordIcon.ts:20-25`); writing eval-time wraps back onto vault JSON.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/types.ts` | Edit | Additive `conditionTree?`, `icon?`, `bold?`, optional `color?` at `143-152` |
| `src/data/ConditionalFormatting.ts` | Edit | Relax skip guard; tree eval; today-on-tree; fail-closed leaves; icon/bold/color-optional paint |
| `styles.css` | Edit | Bold and icon classes beside `469-484` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Halt before a private CF walker | Implementation starts only after `ViewFilterTree.ts`, `evaluateFilterTree`, `applyFilterTree`, and `normalizeViewFilterTree` exist. Match uses `evaluateFilterTree(row, tree, columns) === true`, never `applyFilterTree` as a CF matcher |
| REQ-002 | Additive types preserve color-only JSON | `types.ts:143-152` adds `conditionTree?`, `icon?`, `bold?`, and `color?: StatusColor`; existing color-only rules still type-check |
| REQ-003 | Shared helper evaluates trees and paints icon/bold | First-match result is `{ color?, icon?, bold?, ruleId }` from **that** rule (`:39`); later icon/bold never merge; zero renderer files gain a CF predicate walker |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Legacy path is byte-stable | No `conditionTree` keeps `applyFilters([row], [rule.condition], "and", columns)` (`:38`) and `getFieldValue` frontmatter fallback (`QueryEngine.ts:283-294`) |
| REQ-005 | Tree-only fail-closed and today substitution | Leaf field not in `config.schema.columns` and not `file.*` / computed → false; `valueSource === "today"` substitutes `getLocalDateKey(new Date())` (`CalendarDateTime.ts:57`) onto date-like empty comparison leaves |
| REQ-006 | Color-optional paint plus valid HTML icons | Color CSS vars paint only when `match.color` is set (stop `rule.color \|\| "gray"` at `:39`); icon span is never a child of `TR` (`TableRenderer.ts:463` vs `:503`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: AND tree formats only when both predicates hold; OR tree formats when either holds; empty/missing tree is non-match (E2); root `null` is non-match.
- **SC-002**: Legacy color-only rows match the step-1 baseline; first-match collision does not merge later icon/bold (E12).
- **SC-003**: Color-omitted in-memory rules still apply icon/bold; invalid RecordIcon tokens yield no icon (E11); row-level bold hits every cell via `tr.db-conditional-format-bold > td`.

### Acceptance Scenarios

- **Given** 009 APIs are missing, **when** this child starts, **then** work stops; no private CF walker is added.
- **Given** a color-only single-condition rule, **when** `getConditionalFormatMatch` runs, **then** the color matches today's helper (`:38`) and no tree rewrite is written.
- **Given** a `conditionTree` AND of two predicates, **when** only one holds, **then** the rule does not apply.
- **Given** two matching rules, **when** the first matches, **then** the first rule's `{ color?, icon?, bold?, ruleId }` wins (`:39`).
- **Given** `applyConditionalFormat` on a `TR`, **when** the match has an icon, **then** the span is appended to the first `td:not(.db-select-col)`, not as a child of `tr`.
- **Given** a tree leaf whose field is undeclared, **when** evaluation runs, **then** the leaf is false; a legacy rule on the same key still uses frontmatter (`QueryEngine.ts:283-294`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase 009 `evaluateFilterTree` | Private walker forbidden | Halt at step 0; wrapper belongs in 009 |
| Risk | Using `applyFilterTree` for CF match | Empty/null root paints every row (`QueryEngine.ts:80`) | Match `=== true` only |
| Risk | Shipping icon/bold before trees | Second edit of `ConditionalFormatting.ts` | Same-diff REQ-003 |
| Risk | `getEffectiveFilterRules` on CF leaves | Legacy empty-`eq` cells lose color (`FilterRules.ts:3-12`) | Raw `matchesFilter` via 009 wrapper |
| Risk | Icon span under `tr` | Invalid HTML | Attach to first non-select `td` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: RecordIcon token (`RecordIcon.ts:27-38`); `condition.field` stays Apply-to (`:32-36`); eval-time wrap only; color-optional paint here, color-optional parse in child 002; `Intl.Segmenter` skipped.
<!-- /ANCHOR:questions -->
