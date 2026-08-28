---
title: "Task Breakdown: Views Parity, Polish and Per-View Affordances"
description: "Locked task breakdown for views parity and polish phase: CardFieldRenderer consolidation, universal object peek across Board, Gallery, and List, 2D horizontal Kanban swimlanes, multi-source gallery covers, list metadata alignment, calendar workday auto-scroll and live time ruler, unscheduled backlog drawer, accessible overflow dialog, timeline canvas zoom, and board column menus."
trigger_phrases:
  - "views parity tasks"
  - "board swimlanes tasks"
  - "gallery cover preview tasks"
  - "calendar workday autoscroll tasks"
  - "list view metadata alignment tasks"
  - "card field renderer tasks"
  - "unscheduled notes tray tasks"
  - "universal object peek tasks"
  - "timeline canvas zoom tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/006-views-parity-polish"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled views parity task documentation"
    next_safe_action: "Proceed to next implementation phase"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-006"
      parent_session_id: null
    completion_pct: 97
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Views Parity, Polish and Per-View Affordances

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

- [x] T001 [M] Create `src/views/CardFieldRenderer.ts` consolidating field value rendering across cards, tiles, and rows (`src/views/CardFieldRenderer.ts:69`, `renderCardField`) (REQ-006)
- [x] T002 [S] Add unit test suite `src/views/CardFieldRenderer.test.ts` validating select tags, status pills, relation target icons, tabular numbers, rating stars, and checkboxes (`src/views/CardFieldRenderer.test.ts:28-55`) (REQ-006)
- [x] T003 [M] Wire universal peek detail handler (`actions.openRecordDetail`) to Board card click events in `src/views/BoardRenderer.ts:613-625` (REQ-001)
- [x] T004 [M] Wire universal peek detail handler to Gallery tile click events in `src/views/GalleryRenderer.ts:201-215` (REQ-001)
- [x] T005 [M] Wire universal peek detail handler to List row click events in `src/views/ListRenderer.ts:191-205` (REQ-001)
- [x] T006 [S] Refactor `src/views/DatabaseView.ts:642,674,703,10981-10986` to pass unified `openRecordDetail` callback across Board, Gallery, and List view instances (REQ-001)
- [x] T007 [M] Replace duplicate field preview logic in `src/views/BoardRenderer.ts:774,1240` and `src/views/GalleryRenderer.ts:291,683` with `CardFieldRenderer` (REQ-006)
- [x] T008 [M] Replace duplicate field preview logic in `src/views/ListRenderer.ts:639` and `src/views/RecordDetailPanel.ts:237` with `CardFieldRenderer` (REQ-006)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T009 [L] Implement true horizontal Kanban swimlanes in `src/views/BoardRenderer.ts:140-141,198-250` structuring secondary groups as full-width row containers spanning columns (`renderSwimlaneBoard`) (REQ-002)
- [x] T010 [M] Add 2D swimlane layout rules in `styles.css:7935-8020` with sticky swimlane headers, synchronized column baselines, and empty lane drop zones (REQ-002)
- [x] T011 [S] Suppress redundant active grouping property from board card bodies in `src/views/BoardRenderer.ts:766` (`groupedFields` set) (REQ-007)
- [x] T012 [M] Implement visual data mutation disclosure badges ("Changes [Field] to [Value]") on dragover and mobile move menu in `src/views/BoardRenderer.ts:886-918,1484-1539` (REQ-008)
- [x] T013 [M] Phase 006 owns the shared Board column-header surface at `src/views/BoardRenderer.ts:311-351`; implement slim 38px vertical Kanban column rail collapsing there and in `styles.css:7804-7806` (`.db-board-column.is-collapsed`). Phase 001 consumes and verifies this surface only (REQ-009)
- [x] T014 [S] Phase 006 owns the shared Board column-header surface at `src/views/BoardRenderer.ts:384-442`; add the board column options menu (Sort, Collapse, Delete Group, Hide) there (`renderBoardGroupOptions`). Phase 001 consumes and verifies this surface only (REQ-016)
- [x] T015 [M] Expand cover image resolution engine in `src/data/CoverImage.ts:74-120` to fall back to note body markdown embeds via metadata cache and create `src/data/CoverImage.test.ts:34-45` (REQ-003)
- [x] T016 [S] Wire gallery card size presets and aspect ratio buttons in `src/views/GalleryRenderer.ts:25-34`, `src/views/ViewConfigPanelRenderer.ts:1675-1710`, and `styles.css:7744-7751` (REQ-010)
- [x] T017 [M] Redesign List view rows into borderless rows with subtle dividers and right-aligned columnar metadata in `src/views/ListRenderer.ts:188-285` and `styles.css:8040-8110` (REQ-004)
- [x] T018 [S] Add compact group-header `+ New` button in `src/views/GalleryRenderer.ts:142` and `src/views/ListRenderer.ts:134` (`db-gallery-group-new`, `db-list-group-new`) (REQ-018)
- [x] T019 [M] Implement the missing Calendar Week and Day view workday auto-scrolling on mount at the time-grid render points in `src/views/CalendarRenderer.ts:1345-1352` (`scroller.scrollTop`) (REQ-005)
- [x] T020 [M] Polish the existing dynamic live red current-time ruler line and pulsating indicator at its call and implementation sites in `src/views/CalendarRenderer.ts:827,1319-1355` (`renderCurrentTimeLine`) (REQ-005)
- [x] T021 [L] Implement collapsible "Unscheduled Notes" backlog drawer at the Calendar and Timeline render entry points (`src/views/CalendarRenderer.ts:123-145`, `src/views/CalendarTimelineRenderer.ts:395-440`), collecting rows omitted by `src/data/CalendarTimelineModel.ts:5-6` (`renderUnscheduledBacklog`) (REQ-011)
- [x] T022 [S] Convert scheduled calendar `+N` overflow to keyboard-focusable button opening accessible day event dialog in `src/views/CalendarRenderer.ts:367-368,719-720,752-755` (`t("calendar.moreEvents")`) (REQ-012)
- [x] T023 [S] Add calendar configuration setup preview card in `src/views/CalendarToolbarRenderer.ts:180-195` (`db-calendar-setup-preview`) (REQ-013)
- [x] T024 [M] Implement Month view multi-day pointer drag creation gesture in `src/views/CalendarRenderer.ts:32-40,322-355` (`resolveCalendarCreateDateRange`) (REQ-014)
- [x] T025 [M] Implement Timeline canvas wheel and pinch zoom gesture handling in `src/views/CalendarTimelineRenderer.ts:455-478` (`wheel` and `touchmove` pinch zoom) (REQ-015)
- [x] T026 [M] Implement cross-view keyboard navigation roving focus and shortcut listeners in `src/views/BoardRenderer.ts:620`, `src/views/GalleryRenderer.ts:208`, `src/views/ListRenderer.ts:198`, and `src/views/CalendarRenderer.ts:1681` (REQ-019)
- [ ] T031 [M] Add a collapsed `N empty properties` accordion to Record Detail while preserving the current `showEmptyFields !== true` skip behavior at `src/views/RecordDetailPanel.ts:187-215` (`:192-193`); style the disclosure and revealed fields in `styles.css:7604-7635` (REQ-020) -- DEFERRED: empty properties accordion in record detail deferred to maintain current skip behavior

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification


<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] T027 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` (`package.json:1-38`, exit code 0)
- [x] T028 [S] Run Vitest unit test suite `npx vitest run` (296 tests across 33 files in `src/views/CardFieldRenderer.test.ts`, `src/data/CoverImage.test.ts`)
- [x] T029 [S] Run production bundle build `npm run build` (`package.json:1-38`, exit code 0)
- [x] T030 [S] Verify zero note frontmatter or body writes during view rendering, cover parsing, and peek inspection (`src/views/RecordDetailPanel.ts:187-215`)

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | Universal Object Peek Parity Across Non-Table Views | T003, T004, T005, T006 |
| REQ-002 | True Horizontal Kanban Swimlanes (2D Grouping Matrix) | T009, T010 |
| REQ-003 | Multi-Source Gallery Cover Engine with Markdown Embed Fallback | T015 |
| REQ-004 | Sleek List View Row Geometry and Right-Aligned Columnar Metadata | T017 |
| REQ-005 | Calendar Workday Auto-Scroll and Dynamic Live Current-Time Ruler | T019, T020 |
| REQ-006 | Consolidated CardFieldRenderer for Consistent Value Formatting | T001, T002, T007, T008 |
| REQ-007 | Hide Redundant Active Grouping Field on Board Cards | T011 |
| REQ-008 | Visual Data Mutation Disclosure During Cross-Lane Dragging | T012 |
| REQ-009 | Slim Vertical Kanban Column Rail Collapsing | T013 |
| REQ-010 | Gallery Card Size Presets and Aspect Ratio Controls | T016 |
| REQ-011 | Unscheduled Notes Backlog Drawer in Calendar and Timeline | T021 |
| REQ-012 | Accessible Scheduled Calendar `+N` Overflow Dialog | T022 |
| REQ-013 | Calendar Setup Preview Card for Event Field Mapping | T023 |
| REQ-014 | Calendar Month Multi-Day Drag Creation | T024 |
| REQ-015 | Timeline Canvas Wheel Zoom & Touch Gesture Time Scale Switching | T025 |
| REQ-016 | Board Column Header Management Options Menu | T014 |
| REQ-017 | Distinct Record Hit Region vs Media Cover / Field Actions | T003, T004, T005 |
| REQ-018 | Gallery and List Group-Header Direct Record Creation | T018 |
| REQ-019 | Cross-View Keyboard Navigation & Roving Focus | T026 |
| REQ-020 | Hide Empty Properties Accordion in Record Detail | T031 |

<!-- /ANCHOR:cross-refs -->
