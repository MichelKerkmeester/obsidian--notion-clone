---
title: "Tasks: Format Editor Panel"
description: "Group chrome, icon picker, bold toggle, and i18n tasks for renderConditionalFormatting."
trigger_phrases:
  - "format editor panel tasks"
  - "renderconditionalformatting"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/004-format-editor-panel"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-editor-panel child from synthesis rank 3 and final-plan step 7"
    next_safe_action: "Add CF group chrome, icon picker, and bold toggle in ViewConfigPanelRenderer"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-format-editor-panel"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Format Editor Panel

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

Do **not** copy `renderSourceRuleLeaf` (`ViewConfigPanelRenderer.ts:931+`).
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read `renderConditionalFormatting` (`552-766`), `renderSourceRuleGroup` (`878-929`), `openIconPickerPopover` (`IconPickerPopover.ts:11-23`), and `panel.and` / `panel.or` / `panel.addCondition` (`i18n.ts` ~379-385) (`src/views/ViewConfigPanelRenderer.ts`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 **Group chrome** — CF-scoped copy of `renderSourceRuleGroup` (`878-929`), positional splice, no node ids; leaves stay field/op/value + `getFilterOperatorsForColumn` (`:593`); wrap-into-group writes `conditionTree` and keeps `condition` as first leaf; delete-last-child-deletes-group (`src/views/ViewConfigPanelRenderer.ts:552-766`) [M]
- [ ] T003 **Icon + bold** — icon via `openIconPickerPopover` (`IconPickerPopover.ts:23`); bold as `db-icon-only-button` + `setIcon(..., "bold")`; persist via `actions.onChange(t("undo.conditionalFormatConfig"))` (`601-604`) (`src/views/ViewConfigPanelRenderer.ts`) [S]
- [ ] T004 **i18n** — 3 keys × 3 locales: `conditionalFormat.icon` / `bold` / `group`; reuse `panel.and` / `panel.or` / `panel.addCondition` (`src/i18n.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 AND/OR group + icon + bold save and reload; no eval-time wrap written for an untouched legacy rule (`src/views/ViewConfigPanelRenderer.ts`) [S]
- [ ] T006 Grep the CF editor for `inFolder` / `hasProperty` / `strictEq` / source `expression` (must be empty); confirm no add-expression and no Chart CF UI (`src/views/ViewConfigPanelRenderer.ts`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification of T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 3
- **Parent final-plan**: `../research/final-plan.md` step 7
<!-- /ANCHOR:cross-refs -->
