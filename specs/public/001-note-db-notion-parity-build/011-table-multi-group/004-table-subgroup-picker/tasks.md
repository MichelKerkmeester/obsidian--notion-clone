---
title: "Tasks: Table Sub-group Picker"
description: "Task list for the table-gated toolbar Sub-group section and groupByFields writer."
trigger_phrases:
  - "table subgroup picker tasks"
  - "populateGroupPopover"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/004-table-subgroup-picker"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table Sub-group picker child from synthesis and final-plan"
    next_safe_action: "Clone renderBoardSubgroupSection behind table view type"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-table-subgroup-picker"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Table Sub-group Picker

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

Do **not** edit `ViewConfigPanelRenderer.renderBoardSettings`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 persist (and 002 nest); read parent `research/synthesis.md` rank 7 plus `research/final-plan.md` step 6 and optimization 3 [15m]
- [ ] T002 Re-read `ToolbarRenderer.ts:1221-1266, 1423-1448, 1462` and write path `DatabaseView.ts:2408-2426, 2428-2430`; confirm `renderBoardSettings` is board-only (`ViewConfigPanelRenderer.ts:313-317, 329`) [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Table-gated clone** — copy `renderBoardSubgroupSection` (`:1423-1448`) behind `currentViewType === "table"` inside `populateGroupPopover` (`:1221-1266`). Candidates = board filter (`:1462`, exclude primary + `file.name`) plus `!isComputedGroupField` (`GroupDisplay.ts:64-69`). Cap at one subgroup (`src/views/ToolbarRenderer.ts`) [S]
- [ ] T004 **Writer** — `config.groupByFields = sub ? [primary, sub] : undefined`; keep `vs().groupByField = primary` (`DatabaseView.ts:2408-2426` / `setGroupByField` `:2417`); persist still copies primary (`ViewStateStore.ts:69-84`); changing primary clears a colliding subgroup (`:2428-2430` pattern). Undo: `undo.groupConfig` or one new i18n key, not `undo.boardSubgroupConfig` (`ViewConfigPanelRenderer.ts:1586`) (`src/views/DatabaseView.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Sub-group appears only on table views; board UI unchanged; gallery/list never see `groupByFields` [S]
- [ ] T006 Reload after picking two fields still nests; computed/rollup omitted from candidates; primary change drops a colliding subgroup [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] `renderBoardSettings` diff empty
- [ ] Manual verification of T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 7
- **Parent final-plan**: `../research/final-plan.md` step 6
<!-- /ANCHOR:cross-refs -->
