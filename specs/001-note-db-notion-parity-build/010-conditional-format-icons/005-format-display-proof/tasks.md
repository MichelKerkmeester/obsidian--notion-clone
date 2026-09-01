---
title: "Tasks: Format Display Proof"
description: "Twelve helper cases, grep guards, Chart unmatched, table plus non-table proofs, checklist evidence."
trigger_phrases:
  - "format display proof tasks"
  - "conditionalformatting.test"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/010-conditional-format-icons/005-format-display-proof"
    last_updated_at: "2026-08-27T12:50:04Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-display-proof child from synthesis rank 8 and final-plan steps 8-9"
    next_safe_action: "Add ConditionalFormatting.test.ts and run grep plus table/non-table proofs"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-format-display-proof"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Format Display Proof

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

Twelve unit cases are **not** E1–E12. Cases (5), (8), and (12) are required residual-risk detectors.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children 001–004 landed. Reuse `src/__tests__/setup.ts` if 009 created it; otherwise add a no-op file for `vitest.config.ts:1-8`. Add `package.json` `"test": "vitest run"` only if 009 did not (`src/__tests__/setup.ts`, `package.json`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 **Twelve helper cases** in `src/data/ConditionalFormatting.test.ts`: (1) legacy color-only; (2) AND tree; (3) OR tree; (4) first-match collision, no icon/bold merge (E12); (5) empty/missing tree → no match (E2); (6) nested empty group inherits 009 Kleene, CF maps root `null` → no match (E4); (7) `valueSource:"today"` on tree (E5); (8) tree-only missing column fail-closed vs legacy frontmatter (E3); (9) invalid icon token (E11); (10) color-omitted icon/bold; (11) icon span not a child of `TR`; (12) `eq` + empty value still matches on the **legacy** path (`FilterRules.ts:3-12` trap) (`src/data/ConditionalFormatting.test.ts`) [M]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T003 Grep, not unit: E1 missing id (`ConditionalFormatting.ts:31`); E7 migration `DataSource.ts:761-765`; E8/E9 `ColumnOperations.ts`; E10 extra keys in parse (`800-825`) [S]
- [ ] T004 Grep renderer files for a second CF predicate walker (fail if one exists). Confirm `ChartRenderer` still has no `applyConditionalFormat` binding. Confirm CF imports stay `CalendarDateTime` / `QueryEngine` / `types` / 009 helpers — no `electron` / `fs` / Node. Confirm `EmbeddedDatabaseRenderer.ts:3360` still excludes `conditionalFormats` [S]
- [ ] T005 Diff limited to `ConditionalFormatting.ts`, `types.ts`, `DataSource.ts`, `ViewConfigPanelRenderer.ts`, `ColumnOperations.ts`, `styles.css`, `i18n.ts`, tests (and `setup.ts` / `package.json` only if 009 did not) [S]
- [ ] T006 Manual: table record+field (`TableRenderer.ts:463` / `:503`) plus one non-table view, narrow pane. Record evidence in `checklist.md` + honest `implementation-summary.md` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Twelve cases green including (5), (8), (12)
- [ ] `checklist.md` evidence filled
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` rank 8
- **Parent final-plan**: `../research/final-plan.md` steps 8–9
<!-- /ANCHOR:cross-refs -->
