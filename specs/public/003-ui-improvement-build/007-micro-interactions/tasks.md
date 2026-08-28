---
title: "Task Breakdown: Micro-Interactions, Sensory Feedback & Selection Surfaces"
description: "Ranked task breakdown for micro-interactions and feedback: contiguous selection perimeter, single corner fill handle, floating glassmorphic selection dock, multi-item batch drag with count badge, EdgeAutoScroller, formula runtime diagnostic badges, inline validation shake, broken relation pills, hover tag dismissal, shimmering skeleton loader, interactive rating/progress tracks, drop indicator lines, transactional DragDropFeedbackState, persistence-aware editor lifecycle, and refresh snapshots."
trigger_phrases:
  - "micro-interactions tasks"
  - "selection bounding perimeter tasks"
  - "floating selection dock tasks"
  - "batch drag count badge tasks"
  - "edge auto scroller tasks"
  - "formula error diagnostic badge tasks"
  - "inline validation shake tasks"
  - "broken relation pill tasks"
  - "direct tag dismissal tasks"
  - "interactive rating progress tasks"
  - "drag drop feedback state tasks"
  - "persistence aware inline editor tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/007-micro-interactions"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Authored task breakdown for micro-interactions and sensory feedback phase"
    next_safe_action: "Implement phase 007 tasks starting with T001 EdgeAutoScroller"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-007"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Micro-Interactions, Sensory Feedback & Selection Surfaces

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Notation | Meaning | Time Estimate |
|---|---|---|
| `[S]` | Small task | < 30 minutes |
| `[M]` | Medium task | 30–90 minutes |
| `[L]` | Large task | > 90 minutes |
| `- [ ]` | Incomplete task (unstarted) | — |
| `- [/]` | In progress task | — |
| `- [x]` | Completed task | — |

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 [M] Create `src/views/EdgeAutoScroller.ts` implementing boundary proximity calculation and smooth `requestAnimationFrame` acceleration loops (`src/views/EdgeAutoScroller.ts`, `src/views/TableRenderer.ts:684-712`) (REQ-004)
- [ ] T002 [S] Add unit test suite `src/views/EdgeAutoScroller.test.ts` validating boundary threshold triggers, velocity scaling, and scroll bounds (`src/views/EdgeAutoScroller.test.ts`, `src/views/TableRenderer.ts:684-712`) (REQ-004)
- [ ] T003 [M] Expand `src/views/DragDropFeedback.ts:1-47` to support transactional lifecycle phases (`over`, `pending`, `committed`, `failed`) and destination record tracking (REQ-012)
- [ ] T004 [S] Add unit test suite `src/views/DragDropFeedback.test.ts` validating transactional state transitions and placement resolution (`src/views/DragDropFeedback.test.ts`, `src/views/DragDropFeedback.ts:1-47`) (REQ-012)
- [ ] T005 [M] Implement contiguous selection bounding perimeter algorithm in `src/views/DatabaseView.ts:4361-4381` marking perimeter cells with `.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, and `.is-right-edge` (REQ-001)
- [ ] T006 [S] Refactor cell selection CSS in `styles.css:5004-5020` to render outer perimeter borders with clean interior translucent background and zero internal border doubling (REQ-001)
- [ ] T007 [M] Pin single authoritative fill handle `.db-cell-fill-handle` strictly to the bottom-right corner cell of the active selection in `src/views/DatabaseView.ts:7971-7984` and `styles.css:4977-4993` (REQ-001)
- [ ] T008 [M] Redesign `.db-selection-status-bar` in `src/views/DatabaseView.ts:7010-7125` and `styles.css:1697-1718` as a fixed bottom floating glassmorphic dock with backdrop blur, count badge, semantic actions, and `[✕ Esc]` clear pill (REQ-002)
- [ ] T009 [S] Eliminate arbitrary timer-based selection clearing in `src/views/CellRenderer.ts:823-828`, deriving visual selection strictly from `DatabaseView.cellSelection` (REQ-016)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T010 [S] Consume and verify Phase 002's owned table `setupRowDrag()` contract at `src/views/TableRenderer.ts:632-713`; Phase 007 owns multi-item batch drag only in Board and Gallery (REQ-003)
- [ ] T011 [M] Update multi-item card drag in `src/views/BoardRenderer.ts:508-585` and gallery tile drag in `src/views/GalleryRenderer.ts:337-370` to bundle selected records with count badge pill `[Moving N items]` (REQ-003)
- [ ] T012 [S] Add drag preview styles in `styles.css:5037-5055` for stacked card thumbnails and count badges (REQ-003)
- [ ] T013 [M] Integrate `EdgeAutoScroller` into table row dragging (`src/views/TableRenderer.ts:684-712`), board card dragging (`src/views/BoardRenderer.ts:441-480`), and fill handle dragging (`src/views/DatabaseView.ts:8184-8224`) (REQ-004)
- [ ] T014 [S] Replace card drop box-shadows in `src/views/BoardRenderer.ts:531-541` and `styles.css:7307-7317` with dedicated 2px accent drop indicator line `.db-board-drop-indicator` (REQ-011)
- [ ] T015 [S] Add directional insertion preview line to sort rule dragging in `src/views/SortPanelRenderer.ts:94-110, 186-235` and `styles.css:5086-5100` (REQ-011)
- [ ] T016 [M] Implement operation-result rail with Undo/Retry actions on the selection chrome at `src/views/DatabaseView.ts:1198-1201, 7010-7110`; attach completion handling to async paste flows at `src/views/DatabaseView.ts:8578-8642, 8669-8760, 8831-8989` and async group moves at `src/views/DatabaseView.ts:10077-10100, 10130-10192` (REQ-012)
- [ ] T017 [M] Update `src/data/ComputedEvaluator.ts:68-72` to retain runtime evaluation exception details and failing field symbols instead of silently swallowing errors (REQ-005)
- [ ] T018 [S] Consume and verify Phase 002's owned clean empty-cell surface at `src/views/CellRenderer.ts:183-204` and `styles.css:4240-4247`; retain runtime error details in `src/data/ComputedEvaluator.ts:68-75`, add the formula-error branch at `src/views/CellRenderer.ts:177-183`, and style `#ERROR!` badges from the existing badge surface in `styles.css:5878-5888` with hover diagnostic tooltips (REQ-005)
- [ ] T019 [S] Detect broken wikilinks in `src/views/RelationValueRenderer.ts:18-35` via `app.metadataCache.getFirstLinkpathDest()` and render dashed warning pill `.is-unresolved` with tooltip in `styles.css:4870-4910` (REQ-007)
- [ ] T020 [M] Implement `@keyframes db-shake` animation and in-situ validation tooltips in `src/views/CellRenderer.ts:1338-1341, 1412-1415, 2577-2580` and `styles.css:5747-5780` for number, date, and file rename errors (REQ-006)
- [ ] T021 [S] Add direct inline URL/Email/Phone open-and-copy micro-actions and tag dismissal (`✕`) on hover to the cell affordances rendered by `CellRenderer.ts:246-279, 348-355` and `styles.css:4450-4490, 4560-4650`, with optimistic visual feedback and no secondary popover (REQ-008)
- [ ] T022 [M] Enable live star hover fill highlight (stars 1..k), single-click rating assignment, and click/drag progress track adjustment in `src/views/CellRenderer.ts:300-309` and `styles.css:4380-4420` (REQ-010)
- [ ] T023 [M] Implement persistence-aware inline editor draft lifecycle in `src/views/CellRenderer.ts:1950-2156, 2287-2350` and `styles.css:5747-5828` retaining drafts on failure with Retry/Discard (REQ-013)
- [ ] T024 [M] Render shimmering skeleton loader `.db-skeleton-loader` during view switches > 60ms around the refresh teardown in `src/views/DatabaseView.ts:10631-10646` and `styles.css:6130-6160` (REQ-009)
- [ ] T025 [M] Implement stale-while-refreshing state holding previous rows marked `aria-busy="true"` in `src/views/DatabaseView.ts:10631-10646` and `src/data/RefreshCoordinator.ts:47-84, 113-148` (REQ-009)
- [ ] T026 [S] Render debounced search activity pulse indicator inside `.db-search-input-wrap` in `src/views/ToolbarRenderer.ts:1087-1123` and `styles.css:2687-2750` (REQ-015)
- [ ] T027 [M] Implement `InteractionSnapshot` capturing focused cell, selected range, active draft, and pointer position before row patch or refresh in `src/views/TableRenderer.ts:194-239` and `src/views/DatabaseView.ts:10631-10646` (REQ-014)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification


<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T028 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` (`package.json:1-38`)
- [ ] T029 [S] Run Vitest unit test suite `npx vitest run` (`src/views/DragDropFeedback.ts:1-47`)
- [ ] T030 [S] Run production bundle build `npm run build` (`package.json:1-38`)

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | Contiguous Selection Perimeter & Single Corner Fill Handle | T005, T006, T007 |
| REQ-002 | Floating Glassmorphic Selection Action Dock | T008 |
| REQ-003 | Multi-Item Batch Drag with Stacked Thumbnail & Count Badge | T010, T011, T012 |
| REQ-004 | Container Proximity Edge Auto-Scroller (`EdgeAutoScroller`) | T001, T002, T013 |
| REQ-005 | Formula Runtime Calculation Error Diagnostic Badges & Tooltips | T017, T018 |
| REQ-006 | Inline Input Error Shake Animation & In-Situ Tooltip | T020 |
| REQ-007 | Broken Relation Pill Warning State | T019 |
| REQ-008 | Direct Inline Tag Dismissal Micro-Button (`✕`) on Hover | T021 |
| REQ-009 | Shimmering Skeleton Loader & Stale-While-Refreshing State | T024, T025 |
| REQ-010 | Interactive Rating Stars & Progress Track Micro-Interactions | T022 |
| REQ-011 | Dedicated Kanban & Reorder Drop Indicator Lines | T014, T015 |
| REQ-012 | Transactional `DragDropFeedbackState` & Operation-Result Rail | T003, T004, T016 |
| REQ-013 | Persistence-Aware Inline Editor Lifecycle & Draft Retention | T023 |
| REQ-014 | Interaction Snapshot & State Restoration Across Refresh | T027 |
| REQ-015 | Debounced Search Activity Pulse Indicator | T026 |
| REQ-016 | Canonical Selection Projection & Elimination of Timer Classes | T009 |

<!-- /ANCHOR:cross-refs -->
