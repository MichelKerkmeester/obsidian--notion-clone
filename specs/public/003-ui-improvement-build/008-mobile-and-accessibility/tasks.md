---
title: "Task Breakdown: Mobile, Responsiveness & Accessibility Handoffs"
description: "Ranked task breakdown for mobile ergonomics and accessibility: universal touch detection (isTouchDevice), 44x44px touch hit target expansion, Phase 003 mobile bottom-sheet consumption, visualViewport virtual keyboard tracking for cell editing, pointer long-press context menus with haptics, mobile Kanban swipe-snapping with pagination indicator, WAI-ARIA 1.2 Grid semantics with aria-sort, Phase 004 WAI-ARIA tablist verification, group collapse disclosure attributes, aria-live polite query status announcements, shared 2D keyboard navigation for embedded databases, explicit interaction-scope registry, focus-not-obscured scroll margins, focus-visible styling for body portals, and high-contrast forced-colors mode support."
trigger_phrases:
  - "mobile accessibility tasks"
  - "touch targets tasks"
  - "mobile bottom sheet tasks"
  - "isTouchDevice tasks"
  - "visualViewport keyboard tasks"
  - "touch long press tasks"
  - "kanban swipe snapping tasks"
  - "aria grid tasks"
  - "aria tablist tasks"
  - "aria live status tasks"
  - "embed keyboard navigation tasks"
  - "interaction scope registry tasks"
  - "focus not obscured tasks"
  - "forced colors high contrast tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/008-mobile-and-accessibility"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Authored task breakdown for mobile and accessibility phase"
    next_safe_action: "Implement phase 008 tasks starting with T001 TouchEnvironment"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-008"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Mobile, Responsiveness & Accessibility

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

- [ ] T001 [M] Create `src/data/TouchEnvironment.ts` implementing `isTouchDevice()` to check `Platform.isMobile || Platform.isTablet || window.matchMedia("(pointer: coarse)").matches` and container ResizeObserver width (`src/data/TouchEnvironment.ts`, `src/views/DatabaseView.ts:4340`) (REQ-001)
- [ ] T002 [S] Add unit test suite `src/data/TouchEnvironment.test.ts` validating mobile, tablet, coarse pointer, and split-pane viewport classification (`src/data/TouchEnvironment.test.ts`, `src/views/DatabaseView.ts:4340`) (REQ-001)
- [ ] T003 [M] Create `src/views/InteractionScope.ts` implementing explicit focus ownership registry across view containers, body portals, and embedded databases (`src/views/InteractionScope.ts`, `src/views/DatabaseView.ts:1206-1229`) (REQ-014)
- [ ] T004 [S] Add unit test suite `src/views/InteractionScope.test.ts` validating scope registration, focus trapping, pause on external focus, and focus return (`src/views/InteractionScope.test.ts`, `src/views/DatabaseView.ts:1206-1229`) (REQ-014)
- [ ] T005 [M] Replace fragile `isPhoneLayout()` calls with `isTouchDevice()` across `src/views/TableRenderer.ts:802`, `src/views/BoardRenderer.ts:925`, `src/views/GalleryRenderer.ts:438`, `src/views/ListRenderer.ts:432`, `src/views/ColumnHeaderController.ts:139`, `src/views/ToolbarRenderer.ts:288`, `src/views/DatabaseView.ts:4340`, `src/views/EmbeddedDatabaseRenderer.ts:3526`, `src/views/CalendarRenderer.ts:2085`, `src/views/CalendarTimelineRenderer.ts:2143`, and `src/views/ColumnMenu.ts:667` (REQ-001)
- [ ] T006 [S] Expand touch hit envelopes (`::before { inset: -8px; }`) on toolbar icon buttons in `styles.css:1321-1339` and active rule remove buttons in `styles.css:1024-1041` (REQ-002)
- [ ] T007 [S] Expand touch hit envelopes on column header menu triggers in `styles.css:4178-4188` and row/header selection checkboxes in `styles.css:4746, 5090-5110` (REQ-002)
- [ ] T008 [S] Expand touch hit envelopes on mobile move buttons in `styles.css:15560-15636` and group expand toggles in `styles.css:8234-8255` (REQ-002)
- [ ] T009 [S] Expand touch hit envelopes on timeline jump controls in `styles.css:15077-15125` and icon picker grid swatches in `styles.css:15996-16020` (REQ-002, REQ-016)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T010 [S] Consume and verify Phase 003's native mobile bottom sheet output (`.db-mobile-bottom-sheet`) at `src/views/PopoverPosition.ts:24-90, 124-147` and `styles.css:15721-15731`; verify `isTouchDevice()` routing and 44×44px targets without changing sheet geometry or styles (REQ-003)
- [ ] T013 [M] Implement `window.visualViewport` tracking during mobile cell editing in `src/views/CellRenderer.ts:1539-1558, 2024-2059` and `styles.css:15734-15760` with smooth `scrollIntoView({ block: 'center' })` and top-docked toolbar (REQ-004)
- [ ] T014 [M] Implement pointer-based long-press context menus (450ms threshold + `navigator.vibrate?.(20)` haptics) through the existing row-menu wiring in `src/views/DatabaseView.ts:7626-7628`, `src/views/TableRenderer.ts:510-530`, `src/views/BoardRenderer.ts:590-620`, and `src/views/CellRenderer.ts:418-430` (REQ-007)
- [ ] T015 [S] Add `touch-action: manipulation` across table, board, and gallery container elements in `styles.css:124, 4065-4080` to eliminate 300ms double-tap zoom delay (REQ-007)
- [ ] T016 [M] Implement CSS scroll snapping (`scroll-snap-type: x mandatory; scroll-snap-align: center;`) for mobile Kanban boards in `styles.css:7050-7120` (REQ-008)
- [ ] T017 [M] Render mobile Kanban column pagination indicator pill bar (`● ○ ○ ○`) with 1-tap column jumping in `src/views/BoardRenderer.ts:280-350` (REQ-008)
- [ ] T018 [M] Replace document-level `:hover` shortcut stealing with `InteractionScope` in `src/views/DatabaseView.ts:1206-1229, 1430-1440` (REQ-014)
- [ ] T019 [M] Inject WAI-ARIA 1.2 Grid semantics (`role="grid"`, `aria-rowcount`, `aria-colcount`, `aria-colindex`, `aria-rowindex`, `aria-selected`) in `src/views/TableRenderer.ts:60-120, 422-455` (REQ-009)
- [ ] T020 [S] Add `role="columnheader"` and dynamic `aria-sort="ascending|descending|none"` to table headers in `src/views/ColumnHeaderController.ts:20-45` and `src/views/TableRenderer.ts:440-455` (REQ-009)
- [ ] T022 [S] Add dynamic `aria-expanded="true|false"` and `aria-controls` to group collapse toggles in `src/views/TableRenderer.ts:138`, `src/views/BoardRenderer.ts:325`, `src/views/GalleryRenderer.ts:115`, `src/views/ListRenderer.ts:107`, and `src/views/CalendarTimelineRenderer.ts:547` (REQ-011)
- [ ] T023 [S] Inject visually hidden `div.db-sr-status` with `aria-live="polite"` and `aria-atomic="true"` in `src/views/ActiveViewControlsRenderer.ts:29-53`, its active-control integration in `src/views/DatabaseView.ts:1958-1970`, and `styles.css:190-210` announcing filter, search, and sort changes (REQ-012)
- [ ] T024 [L] Integrate shared 2D table keyboard navigation controller (`TableKeyboardNavigation.ts:29-82`) into `src/views/EmbeddedDatabaseRenderer.ts:421-434, 3425-3439` for complete spreadsheet keyboard parity in markdown note embeds (REQ-013)
- [ ] T025 [M] Implement dialog focus trapping (`Tab` cycle, `Escape` return to trigger) in `src/views/TableRecordPeek.ts:88-120`, `src/views/RecordDetailPanel.ts:150-180`, and `src/views/FilterPanelRenderer.ts:120-150` (REQ-015)
- [ ] T026 [S] Remove destructive `.note-database-container *:focus { outline: none; }`, extend `:focus-visible` to body portals, and add focus-not-obscured scroll margins in `styles.css:189-206, 4081-4089` (REQ-005)
- [ ] T027 [M] Declare comprehensive OS `@media (forced-colors: active)` system color fallbacks and portal-wide `@media (prefers-reduced-motion: reduce)` rules in `styles.css:208-217, 4988-5023, 16429-16460` (REQ-006)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T021 [S] Verify Phase 004's WAI-ARIA View Switcher tablist contract, including roving keyboard tabindex, `role="tab"`, `aria-selected`, and `role="tabpanel"`, at `src/views/ToolbarRenderer.ts:625-683`, `src/views/DatabaseView.ts:2970` (`switchView`), and `styles.css:1210-1270`; do not re-annotate it here (REQ-010)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T028 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` (`package.json:1-38`)
- [ ] T029 [S] Run Vitest unit test suite `npx vitest run` (`src/views/DatabaseView.ts:1206-1229`)
- [ ] T030 [S] Run production bundle build `npm run build` (`package.json:1-38`)

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | Universal Touch & Tablet Detection (`isTouchDevice`) | T001, T002, T005 |
| REQ-002 | 44×44px Touch Target Hit Envelopes (WCAG 2.5.5 / Apple HIG) | T006, T007, T008, T009 |
| REQ-003 | Mobile Bottom Sheet Architecture (`.db-mobile-bottom-sheet`) | T010 |
| REQ-004 | Keyboard-Safe Mobile Cell Editing with `visualViewport` Tracking | T013 |
| REQ-005 | Focus Ring Scoping Across Portals & Focus-Not-Obscured Scroll Margins | T026 |
| REQ-006 | High-Contrast OS `forced-colors: active` Support | T027 |
| REQ-007 | Touch Long-Press Context Menus & Double-Tap Zoom Prevention | T014, T015 |
| REQ-008 | Mobile Kanban Swipe-Snapping & Pagination Indicators | T016, T017 |
| REQ-009 | WAI-ARIA 1.2 Grid Semantics & Sorting Annotations | T019, T020 |
| REQ-010 | WAI-ARIA Tablist Pattern for View Switcher | T021 |
| REQ-011 | Group Collapse Disclosure Semantics (`aria-expanded`, `aria-controls`) | T022 |
| REQ-012 | Screen Reader `aria-live` Query Status Region | T023 |
| REQ-013 | Shared 2D Keyboard Navigation for Embedded Databases | T024 |
| REQ-014 | Explicit Interaction-Scope Registry | T003, T004, T018 |
| REQ-015 | Dialog Focus Trapping in Popovers and Modals | T025 |
| REQ-016 | Timeline Viewport Accessibility & Jump Affordances | T009 |

<!-- /ANCHOR:cross-refs -->
