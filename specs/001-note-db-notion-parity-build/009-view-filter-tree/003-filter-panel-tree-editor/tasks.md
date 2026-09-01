---
title: "Tasks: Filter Panel Tree Editor"
description: "One-slice tasks for FilterPanelRenderer.ts: recursive group/not chrome, wrap-into-group, auto-collapse, depth cap 3, existing leaves."
trigger_phrases:
  - "filter panel tree tasks"
  - "wrap into group"
  - "filter depth cap"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/009-view-filter-tree/003-filter-panel-tree-editor"
    last_updated_at: "2026-08-27T12:50:04Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored filter-panel-tree-editor child from synthesis ranks 4/6/7/8-UI and final-plan step 8"
    next_safe_action: "Extend FilterPanelRenderer.ts with recursive group/not chrome; keep existing leaves"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-filter-panel-tree-editor"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Filter Panel Tree Editor

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (target — fork file:line)`

T002 is one atomic renderer change (final-plan merge of T016+T022–T025). Do not split wrap / depth / `not` / auto-collapse.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Re-read `FilterPanelRenderer.ts:81-90`, `107-123`, `125-146` and `ViewConfigPanelRenderer.ts:846-929`; note `renderSourceRuleLeaf` (`931+`) is a source-op editor and `901-916` has no `depth` [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 One `FilterPanelRenderer.ts` change: recursive group/`not` copied from `renderSourceRuleNode` / `renderSourceRuleGroup` (`846-929`) with a `depth` argument; leaves stay `renderFilterRow` / `renderSingleRuleEditor` (`107-123`); reuse `.db-source-rule-*` (`styles.css:9192-9234`); keep `actions.saveState()` (`99/142/187/212/228/245/264/285/339`); on commit dual-write DFS leaves → `state.filters` and root logic → `state.filterLogic`. Gestures in the same diff: wrap-into-AND-group (Anytype `group.tsx:109-122`); auto-collapse empty groups (do not hoist a remaining single child except persist-normalization); hide “add group” at `depth >= 3`; labeled `not` wrapper like `858-869`; no add-expression; no add-empty-group (`src/views/FilterPanelRenderer.ts`) [L]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T003 `(A and B) or C` editable at mobile width; wrap / auto-collapse / depth 3 / `not`; rail popover still edits one leaf (`107-123`) [M]
- [ ] T004 Grep: no `inFolder` / `hasProperty` / `strictEq` / source `expression` in `FilterPanelRenderer.ts`; `styles.css` and `i18n.ts` untouched [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T002 shipped as one diff
- [ ] checklist.md mobile-width evidence recorded
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 4, 6, 7, 8 UI
- **Parent final-plan**: `../research/final-plan.md` step 8
<!-- /ANCHOR:cross-refs -->
