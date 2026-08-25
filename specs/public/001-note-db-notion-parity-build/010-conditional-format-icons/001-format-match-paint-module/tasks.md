---
title: "Tasks: Format Match Paint Module"
description: "Halt on 009, then same-diff types, tree eval, icon/bold/color-optional paint, and CF CSS."
trigger_phrases:
  - "format match paint tasks"
  - "evaluatefiltertree"
  - "applyconditionalformat"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Format Match Paint Module

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T003–T005 are **one atomic diff**. Do not ship icon/bold paint without tree eval. T003–T005 stay `[B]` until T001 passes.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 **Halt gate** — confirm on disk: `src/data/ViewFilterTree.ts` exists; `QueryEngine.evaluateFilterTree` and `applyFilterTree` are importable; `normalizeViewFilterTree` is the view-op parser. If `evaluateFilterTree` is missing but `evaluateViewFilterTree` exists, add the QueryEngine wrapper in **009** — do not start a CF-local matcher (`src/data/ViewFilterTree.ts`, `src/data/QueryEngine.ts`) [S]
- [ ] T002 **Baseline** — read `ConditionalFormatting.ts:23-69` and `types.ts:143-152`; inventory consumers (Table `463`/`503` is the paint constraint); record color-only first-match on representative finance rows (`src/data/ConditionalFormatting.ts`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 [B] **Types** — same diff as T004: additive `conditionTree?: SourceRuleNode`, `icon?: string`, `bold?: boolean`, `color?: StatusColor` on `ConditionalFormatRule` (`src/data/types.ts:143-152`) [S]
- [ ] T004 [B] **Match + paint** — algorithm: skip no `id` or neither `condition.field` nor non-empty `conditionTree` (relax `:31`); target filter unchanged (`:32-36`); if `conditionTree` present use it, else eval-time wrap `{type:"group", logic:"and", rules:[condition]}` (shape of `createEditableSourceRuleRoot` at `ViewConfigPanelRenderer.ts:98-100`) and do not write the wrap; empty/missing tree continue (E2); match iff `evaluateFilterTree(...) === true`; `valueSource === "today"` via `getLocalDateKey(new Date())` (`CalendarDateTime.ts:57`) onto date-like empty comparison leaves (`resolveRule` today only touches `condition` at `:12-21`); tree leaf adapter fail-closed for undeclared columns; do **not** run `getEffectiveFilterRules` (`FilterRules.ts:3-12`); legacy (no `conditionTree`) keeps `applyFilters` (`:38`) + `QueryEngine.ts:283-294`; first match returns `{ color?, icon?, bold?, ruleId }` and stops (`:39`); `applyConditionalFormat` (`:44-69`) paints existing vars plus bold class plus icon attr; icon span via `renderRecordIcon` (`RecordIconRenderer.ts:18-33`) only when element is not `TR`, or onto first `td:not(.db-select-col)` when it is; paint color vars only when `match.color` is set; invalid icon (`parseRecordIconToken` → null, `RecordIcon.ts:27-38`) → no icon; never `eval` / `SafeEval.ts` (`src/data/ConditionalFormatting.ts`) [M]
- [ ] T005 [B] **CSS** — same diff as T004: `.db-conditional-format-bold`, `tr.db-conditional-format-bold > td`, `.db-conditional-format-icon` next to `styles.css:469-484` (`styles.css`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 [B] Legacy color-only rows match the T002 baseline; in-memory AND and OR trees; first-match collision does not merge icon/bold (E12); empty/missing tree is non-match (E2); tree-only missing column fail-closed vs legacy frontmatter (E3); `valueSource:"today"` on a tree (E5); invalid icon token (E11); color-omitted in-memory icon/bold still paints (`src/data/ConditionalFormatting.ts`) [S]
- [ ] T007 [B] Confirm icon span is not a child of `TR`; grep this child for a second CF walker and for `parseSourceRuleTree`; confirm no renderer consumer file edits (`src/views/TableRenderer.ts:463,503`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` or T001 halt recorded (stop, not a build)
- [ ] T003–T005 shipped as one diff after T001 passes
- [ ] No private CF walker
- [ ] Manual verification of T006–T007 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 2, 6, 7, 9
- **Parent final-plan**: `../research/final-plan.md` steps 0–4
<!-- /ANCHOR:cross-refs -->
