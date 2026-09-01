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
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled mobile and accessibility task documentation"
    next_safe_action: "Run overall build suite verification across all phases"
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
    completion_pct: 100
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

- [x] T001 [M] Create `src/data/TouchEnvironment.ts` implementing `isTouchDevice()` to check `Platform.isMobile || Platform.isTablet || window.matchMedia("(pointer: coarse)").matches` and container ResizeObserver width (`src/data/TouchEnvironment.ts:1-105`, `isTouchDevice`) (REQ-001)
- [x] T002 [S] Add unit test suite `src/data/TouchEnvironment.test.ts` validating mobile, tablet, coarse pointer, and split-pane viewport classification (`src/data/TouchEnvironment.test.ts:1-33`) (REQ-001)
- [x] T003 [M] Create `src/views/InteractionScope.ts` implementing explicit focus ownership registry across view containers, body portals, and embedded databases (`src/views/InteractionScope.ts:1-151`, `InteractionScopeRegistry`) (REQ-014)
- [x] T004 [S] Add unit test suite `src/views/InteractionScope.test.ts` validating scope registration, focus trapping, pause on external focus, and focus return (`src/views/InteractionScope.test.ts:1-56`) (REQ-014)
- [x] T005 [M] Replace fragile `isPhoneLayout()` calls with `isTouchDevice()` across `src/views/TableRenderer.ts:420, 734, 859`, `src/views/BoardRenderer.ts:437, 471, 659, 773`, `src/views/GalleryRenderer.ts:232, 262, 384`, `src/views/ListRenderer.ts:244, 380`, `src/views/ColumnHeaderController.ts:40`, `src/views/ToolbarRenderer.ts:168, 761, 938, 1126, 2155`, `src/views/DatabaseView.ts:4394, 4534, 5027, 7264, 8385, 8605`, `src/views/EmbeddedDatabaseRenderer.ts:3104, 3814`, `src/views/CalendarRenderer.ts:664, 2193`, `src/views/CalendarTimelineRenderer.ts:582`, and `src/views/ColumnMenu.ts:238` (REQ-001)
- [x] T006 [S] Expand touch hit envelopes (`::before { inset: -8px; }`) on toolbar icon buttons in `styles.css:1321-1339` and active rule remove buttons in `styles.css:1024-1041` (`styles.css:17223-17293`) (REQ-002)
- [x] T007 [S] Expand touch hit envelopes on column header menu triggers in `styles.css:4178-4188` and row/header selection checkboxes in `styles.css:4746, 5090-5110` (`styles.css:17240-17279`) (REQ-002)
- [x] T008 [S] Expand touch hit envelopes on mobile move buttons in `styles.css:15560-15636` and group expand toggles in `styles.css:8234-8255` (`styles.css:17266-17274, 17306-17314`) (REQ-002)
- [x] T009 [S] Expand touch hit envelopes on timeline jump controls in `styles.css:15077-15125` and icon picker grid swatches in `styles.css:15996-16020` (`styles.css:17274, 17316-17324`, `CalendarTimelineRenderer.ts:278`) (REQ-002, REQ-016)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T010 [S] Consume and verify Phase 003's native mobile bottom sheet output (`.db-mobile-bottom-sheet`) at `src/views/PopoverPosition.ts:24-90, 124-147` and `styles.css:183`; verify `isTouchDevice()` routing and 44×44px targets without changing sheet geometry or styles (`src/views/PopoverPosition.ts:29-42`, `styles.css:183`) (REQ-003)
- [x] T013 [M] Implement `window.visualViewport` tracking during mobile cell editing in `src/views/CellRenderer.ts:1539-1558, 2024-2059` and `styles.css:15734-15760` with smooth `scrollIntoView({ block: 'center' })` and top-docked toolbar (`src/views/CellRenderer.ts:1903-1920, 2422-2439`, `styles.css:17326-17360`) (REQ-004)
- [x] T014 [M] Implement pointer-based long-press context menus (450ms threshold + `navigator.vibrate?.(20)` haptics) through the existing row-menu wiring in `src/views/DatabaseView.ts:7626-7628`, `src/views/TableRenderer.ts:510-530`, `src/views/BoardRenderer.ts:590-620`, and `src/views/CellRenderer.ts:418-430` (`src/views/DatabaseView.ts:8036`, `src/views/DatabaseView.ts:8037, EmbeddedDatabaseRenderer.ts:341, BoardRenderer.ts:939, GalleryRenderer.ts:327, ListRenderer.ts:323`, `src/views/BoardRenderer.ts:860`, `src/views/ListRenderer.ts:305`, `src/views/GalleryRenderer.ts:309`, `src/views/EmbeddedDatabaseRenderer.ts:341`) (REQ-007)
- [x] T015 [S] Add `touch-action: manipulation` across table, board, and gallery container elements in `styles.css:124, 4065-4080` to eliminate 300ms double-tap zoom delay (`styles.css:4661, 5848, 17384`) (REQ-007)
- [x] T016 [M] Implement CSS scroll snapping (`scroll-snap-type: x mandatory; scroll-snap-align: center;`) for mobile Kanban boards in `styles.css:7050-7120` (`styles.css:17396-17401`) (REQ-008)
- [x] T017 [M] Render mobile Kanban column pagination indicator pill bar (`● ○ ○ ○`) with 1-tap column jumping in `src/views/BoardRenderer.ts:280-350` (`src/views/BoardRenderer.ts:1104-1123`, `styles.css:17405-17440`) (REQ-008)
- [x] T018 [M] Replace document-level `:hover` shortcut stealing with `InteractionScope` in `src/views/DatabaseView.ts:1206-1229, 1430-1440` (`src/views/DatabaseView.ts:467-468, 1280, 1379, 1458-1570`) (REQ-014)
- [x] T019 [M] Inject WAI-ARIA 1.2 Grid semantics (`role="grid"`, `aria-rowcount`, `aria-colcount`, `aria-colindex`, `aria-rowindex`, `aria-selected`) in `src/views/TableRenderer.ts:60-120, 422-455` (`src/views/TableRenderer.ts:460, 481, 517, 1041-1052`) (REQ-009)
- [x] T020 [S] Add `role="columnheader"` and dynamic `aria-sort="ascending|descending|none"` to table headers in `src/views/ColumnHeaderController.ts:20-45` and `src/views/TableRenderer.ts:440-455` (`src/views/ColumnHeaderController.ts:25, 31`, `src/views/TableRenderer.ts:489, 498`) (REQ-009)
- [x] T022 [S] Add dynamic `aria-expanded="true|false"` and `aria-controls` to group collapse toggles in `src/views/TableRenderer.ts:138`, `src/views/BoardRenderer.ts:325`, `src/views/GalleryRenderer.ts:115`, `src/views/ListRenderer.ts:107`, and `src/views/CalendarTimelineRenderer.ts:547` (`src/views/TableRenderer.ts:595`, `src/views/BoardRenderer.ts:218, 448, 522`, `src/views/GalleryRenderer.ts:137`, `src/views/ListRenderer.ts:132`, `src/views/CalendarTimelineRenderer.ts:415, 656`) (REQ-011)
- [x] T023 [S] Inject visually hidden `div.db-sr-status` with `aria-live="polite"` and `aria-atomic="true"` in `src/views/ActiveViewControlsRenderer.ts:29-53`, its active-control integration in `src/views/DatabaseView.ts:1958-1970`, and `styles.css:190-210` announcing filter, search, and sort changes (`src/views/ActiveViewControlsRenderer.ts:44-52`, `src/views/CalendarTimelineRenderer.ts:277-287`, `styles.css:210-220`) (REQ-012)
- [x] T024 [L] Integrate shared 2D table keyboard navigation controller (`TableKeyboardNavigation.ts:29-82`) into `src/views/EmbeddedDatabaseRenderer.ts:421-434, 3425-3439` for complete spreadsheet keyboard parity in markdown note embeds (`src/data/TableKeyboardNavigation.ts:1-120`, `src/views/EmbeddedDatabaseRenderer.ts:92, 253, 314, 3749`) (REQ-013)
- [x] T025 [M] Implement dialog focus trapping (`Tab` cycle, `Escape` return to trigger) in `src/views/TableRecordPeek.ts:88-120`, `src/views/RecordDetailPanel.ts:150-180`, and `src/views/FilterPanelRenderer.ts:120-150` (`src/views/InteractionScope.ts:120-150`, `src/views/TableRecordPeek.ts:187`, `src/views/RecordDetailPanel.ts:206`, `src/views/FilterPanelRenderer.ts:140`) (REQ-015)
- [x] T026 [S] Remove destructive `.note-database-container *:focus { outline: none; }`, extend `:focus-visible` to body portals, and add focus-not-obscured scroll margins in `styles.css:189-206, 4081-4089` (`styles.css:17365-17366, 17450-17468`) (REQ-005)
- [x] T027 [M] Declare comprehensive OS `@media (forced-colors: active)` system color fallbacks and portal-wide `@media (prefers-reduced-motion: reduce)` rules in `styles.css:208-217, 4988-5023, 16429-16460` (`styles.css:17448-17469, 17471-17500`) (REQ-006)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T021 [S] Verify Phase 004's WAI-ARIA View Switcher tablist contract, including roving keyboard tabindex, `role="tab"`, `aria-selected`, and `role="tabpanel"`, at `src/views/ToolbarRenderer.ts:625-683`, `src/views/DatabaseView.ts:2970` (`switchView`), and `styles.css:1210-1270`; do not re-annotate it here (`src/views/ToolbarRenderer.ts:760-840`) (REQ-010)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] T028 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` (`package.json:1-38`, exit code 0)
- [x] T029 [S] Run Vitest unit test suite `npx vitest run` (`src/views/DatabaseView.ts:1206-1229`, 362 tests across 46 files)
- [x] T030 [S] Run production bundle build `npm run build` (`package.json:1-38`, exit code 0)

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
