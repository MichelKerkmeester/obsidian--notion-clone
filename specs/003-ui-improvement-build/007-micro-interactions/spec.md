---
title: "Feature Specification: Micro-Interactions, Sensory Feedback & Selection Surfaces"
description: "Comprehensive micro-interaction and sensory feedback modernization: contiguous selection perimeter with single corner fill handle, floating glassmorphic selection action dock, multi-item batch drag with count badge, container EdgeAutoScroller, formula runtime diagnostic error badges, inline validation shake and tooltips, broken relation pill warnings, direct hover tag dismissal, shimmering skeleton loader, interactive rating and progress tracks, dedicated drop indicator lines, transactional DragDropFeedbackState, persistence-aware inline editor draft lifecycle, and interaction snapshots across refresh."
trigger_phrases:
  - "micro-interactions"
  - "selection bounding perimeter"
  - "floating selection dock"
  - "batch drag count badge"
  - "edge auto scroller"
  - "formula error diagnostic badge"
  - "inline validation shake"
  - "broken relation pill"
  - "direct tag dismissal"
  - "interactive rating progress"
  - "drag drop feedback state"
  - "persistence aware inline editor"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/007-micro-interactions"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled micro-interactions specification metadata"
    next_safe_action: "Proceed to mobile and accessibility phase reconciliation"
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
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Micro-Interactions, Sensory Feedback & Selection Surfaces

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `006-views-parity-polish`, successor `008-mobile-and-accessibility`.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-27 |
| **Branch** | `impl` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
While the Note Database plugin provides rich underlying database querying and calculations, its micro-interactions and tactile feedback surfaces suffer from visual fragmentation, timer-driven state destruction, layout jitter, and silent failure modes:
1. **Cluttered Cell Selection Inset Shadows (`src/views/DatabaseView.ts:4361-4381`, `styles.css:5537`)**: Selecting a rectangular cell range applies individual `box-shadow: inset 0 0 0 1px` borders to every single `<td>`, creating an ugly double-bordered internal grid across the selection matrix. Furthermore, multiple adjacent cells mount duplicate `.db-cell-fill-handle` nodes (`DatabaseView.ts:7971-7984`, `styles.css:5537`) instead of rendering a single authoritative handle at the bottom-right corner of the selection perimeter.
2. **Selection Status Bar Layout Jitter (`src/views/DatabaseView.ts:7010-7125`, `styles.css:2007`)**: `.db-selection-status-bar` is injected directly into normal DOM flow using negative margins (`margin-bottom: calc(-1 * var(--db-selection-status-height))`), shifting table and summary rows vertically whenever items are selected. It rebuilds on every selection change (`:6661`), discarding active button focus and bulk-edit contexts.
3. **Multi-Item Drag Discards Selected Batches (`src/views/TableRenderer.ts:632-713`, `src/views/BoardRenderer.ts:508-585`, `src/views/GalleryRenderer.ts:337-370`)**: Phase 002 owns the table `setupRowDrag()` surface; Phase 007 consumes and verifies that table contract and implements batch dragging in Board and Gallery. Dragging a record while multiple rows are selected only transfers a single file path (`event.dataTransfer.setData(ROW_MIME, row.file.path)`), ignoring the rest of the selected set. `TableRenderer.ts:668` passes the entire `<tr>` element to `setDragImage`, creating a massive, opaque 1400px wide drag ghost that obscures drop targets.
4. **Missing Container Edge Auto-Scroll Traps Drag Operations (`src/views/TableRenderer.ts:684-712`, `src/views/BoardRenderer.ts:441-480`, `src/views/DatabaseView.ts:8184-8224`)**: When dragging rows, cards, or fill handles, scrollable containers (`.note-database-container`, `.db-table-wrap`, `.db-board`) lack edge proximity detection, preventing users from dragging items to targets located offscreen in long tables or wide boards.
5. **Silent Formula Calculation Error Swallowing (`src/data/ComputedEvaluator.ts:68-72`, `src/views/CellRenderer.ts:183-204`, `styles.css:4240-4247`)**: When formula evaluation throws exceptions (e.g., `TypeError`, missing field, division by zero), `ComputedEvaluator` logs a console warning and returns `null`, causing `CellRenderer` to render a blank empty cell. Users cannot diagnose broken expressions without developer tools.
6. **Silent Reversion on Validation Failure (`src/views/CellRenderer.ts:1338-1341, 1412-1415, 2577-2580`)**: Entering invalid number/date strings or triggering a file rename collision silently reverts cell content or fires a detached corner system notice while abruptly closing the editor, discarding typed draft text.
7. **Unresolved / Broken Relation Links Render Identically to Valid Notes (`src/views/RelationValueRenderer.ts:18-35`, `styles.css:4870-4910`)**: Relation links do not verify whether target notes exist in Obsidian's metadata cache, rendering broken wikilinks with standard valid blue/accent styling.
8. **Multi-Select and Tag Badges Lack Direct Inline Dismissal (`src/views/CellRenderer.ts:348-355`, `styles.css:4560-4650`)**: `renderMultiSelect` paints the inline tag pills without a direct dismiss control. Removing a tag requires opening the multi-select popover, unchecking the option, and closing the popover rather than providing a 1-click `✕` dismiss button on hover.
9. **Synchronous Blanking During Query Transitions (`src/views/DatabaseView.ts:10631-10646`, `styles.css:6130-6160`)**: The refresh path removes top-level rendered results before calling `render()`, causing jarring white/dark canvas flashes before rendering completes; the existing initialization error fallback is separately at `DatabaseView.ts:1248-1252`.
10. **Timer-Owned Interaction Feedback (`src/views/BoardRenderer.ts:929-955`, `src/views/CellRenderer.ts:823-828, 1362-1365, 2387-2400`)**: Drop highlights (900ms), selection highlights (1.2s), and editing borders (1.6s) use hardcoded `setTimeout` class removals that expire while users are still dragging, typing, or selecting.

### Purpose
Establish a robust, lifecycle-owned micro-interaction and sensory feedback architecture inspired by **Anytype**, **AppFlowy**, and **Notion**:
- Deliver a **Contiguous Selection Bounding Perimeter** with clean interior translucent tint and a single authoritative bottom-right corner fill handle.
- Redesign the selection status bar as a **Floating Glassmorphic Action Capsule Dock** that updates in place without layout shifts.
- Enable **Multi-Item Batch Drag** with a stacked thumbnail preview and count badge pill (`"Moving N items"`).
- Implement a reusable **`EdgeAutoScroller`** for fluid dragging near container boundaries.
- Provide **Formula Runtime `#ERROR!` Badges & Diagnostic Tooltips** to make expression failures immediately actionable.
- Implement **Inline Validation Shake Animations (`@keyframes db-shake`)** and in-situ error tooltips that keep editors open and focused.
- Render **Broken Relation Warning Pills** (`.is-unresolved`) with dashed warning outlines.
- Add **Direct Inline Tag Dismissal (`✕`)** micro-buttons on hover.
- Introduce **Shimmering Skeleton Loaders** and **Stale-While-Refreshing** query transitions.
- Deliver **Interactive Rating Stars & Progress Track Micro-Interactions** for 1-click visual property manipulation.
- Replace timer-owned transient classes with **Owner-Bound Interaction Lifecycles** (`DragDropFeedbackState`, persistent draft editing, and refresh interaction snapshots).

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Contiguous Selection Bounding Perimeter & Single Corner Fill Handle**: Compute bounding box outer perimeter classes (`.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, `.is-right-edge`) across `DatabaseView.ts:4361-4381` and `styles.css:5582`, replacing individual cell inset box-shadows with clean outer borders and mounting exactly one fill handle at the bottom-right corner of the selection matrix (`DatabaseView.ts:7971-7984`, `styles.css:5582`).
- **Floating Glassmorphic Selection Action Dock**: Redesign `.db-selection-status-bar` in `DatabaseView.ts:7010-7125` and `styles.css:2007` as a fixed viewport bottom capsule dock with backdrop blur, spring entrance animation, animated count badge, semantic bulk actions (`Edit Field`, `Duplicate`, `Move To`, `Delete`), and `[✕ Esc]` clear pill, updating in-place without destroying DOM nodes.
- **Multi-Item Batch Drag with Stacked Thumbnail & Count Badge**: Phase 002 owns the table `setupRowDrag()` surface at `TableRenderer.ts:632-713`; Phase 007 consumes and verifies that table contract, implements batch drag in `BoardRenderer.ts:508-585` and `GalleryRenderer.ts:337-370`, and commits batch moves atomically.
- **Container Boundary Proximity Auto-Scroller (`EdgeAutoScroller`)**: Create `src/views/EdgeAutoScroller.ts` and attach boundary listeners in `TableRenderer.ts:684-712`, `BoardRenderer.ts:441-480`, and `DatabaseView.ts:8184-8224` to smoothly auto-scroll containers when dragging within 40px of container edges.
- **Formula Runtime Calculation Error Diagnostic Badges & Tooltips**: Update `ComputedEvaluator.ts:68-75` to retain runtime evaluation error details; consume and verify Phase 002's owned clean empty-cell surface at `CellRenderer.ts:183-204` and `styles.css:4240-4247`, then add the formula-error branch at `CellRenderer.ts:177-183` with badge presentation based on `styles.css:5878-5888` and hover diagnostic tooltips displaying the failing variable and exception message.
- **Inline Input Error Shake Animation & In-Situ Tooltip**: Replace silent input reversion in `CellRenderer.ts:1338-1341, 1412-1415, 2577-2580` with an inline horizontal shake animation (`@keyframes db-shake`), red focus ring, and in-situ speech bubble validation tooltip, keeping the editor open and focused.
- **Broken Relation Pill Warning State**: Detect unresolved wikilinks in `RelationValueRenderer.ts:18-35` via `app.metadataCache.getFirstLinkpathDest()` and render with dashed warning border (`.is-unresolved`), warning icon, and "Note not found in vault" tooltip (`styles.css:5625`).
- **Direct Inline Tag and Link Micro-Actions**: Add an inline `✕` dismiss button to the multi-select and tag pills rendered by `renderMultiSelect`, plus 1-click open/copy actions for URL, Email, and Phone cells (`CellRenderer.ts:246-279, 348-355`, `styles.css:4450-4490, 4560-4650`) without opening a secondary popover.
- **Shimmering Skeleton Loader & Stale-While-Refreshing Query State**: Render lightweight shimmering CSS/SVG skeleton placeholders (`.db-skeleton-loader`) around the refresh teardown in `DatabaseView.ts:10631-10646` and `styles.css:2119` during view switches > 60ms; retain stale rows marked `aria-busy="true"` in that refresh path and `RefreshCoordinator.ts:47-84, 113-148` during background query refresh.
- **Interactive Rating Stars & Progress Track Micro-Interactions**: Enable live star hover fill highlight (stars 1..k), single-click rating assignment, and click/drag progress track adjustment directly in table cells and card fields (`CellRenderer.ts:300-309`, `styles.css:4380-4420`).
- **Dedicated Kanban & Reorder Drop Indicator Lines**: Replace inset card box-shadows with distinct 2px accent insertion lines (`.db-board-drop-indicator`, `.db-sort-drop-indicator`) in `BoardRenderer.ts:531-541`, `SortPanelRenderer.ts:94-110, 186-235`, and `styles.css:10671, 7307-7317`.
- **Transactional `DragDropFeedbackState` & Operation-Result Rail**: Expand `src/views/DragDropFeedback.ts:1-47` to manage source identity, destination, placement, and transaction phase (`over`, `pending`, `committed`, `failed`); consume and verify Phase 002's owned table `setupRowDrag()` contract at `TableRenderer.ts:632-713`, maintain pending feedback until async moves resolve (`TableRenderer.ts:684-740`, `BoardRenderer.ts:524-584, 866-894`), and render the operation-result rail on the selection chrome at `DatabaseView.ts:1198-1201, 7010-7110` with completion handling for async paste flows at `DatabaseView.ts:8578-8642, 8669-8760, 8831-8989` and async group moves at `DatabaseView.ts:10077-10100, 10130-10192`.
- **Persistence-Aware Inline Editor Lifecycle & Draft Retention**: Maintain persistent draft state in memory during inline editing (`CellRenderer.ts:1950-2156, 2287-2350`, `styles.css:5747-5828`); show saving spinner during async commit; on save failure, retain draft with inline Retry and Discard buttons.
- **Interaction Snapshot & State Restoration Across Refresh**: Implement `InteractionSnapshot` capturing focused cell, selected range, active editor draft, and pointer position before row patching (`TableRenderer.ts:194-239`) or full refresh (`DatabaseView.ts:10631-10648`), restoring state to matching records after DOM rebuild.
- **Debounced Search Activity Pulse Indicator**: Render a subtle pulsating spinner icon inside `.db-search-input-wrap` during debounce and query execution (`ToolbarRenderer.ts:1087-1123`, `styles.css:3185`).
- **Canonical Selection Projection & Elimination of Timer Classes**: Remove 1.2s selection timer in `CellRenderer.ts:823-828`, 1.6s date editing timer in `:1362-1365`, and 900ms board drop timer in `BoardRenderer.ts:929-955`, deriving visual state strictly from active session models.

### Out of Scope
- Empty and first-run onboarding states (Phase 001: `001-empty-and-first-run-states`).
- Table grid single-header refactor, trailing add column, and calculation tfoot (Phase 002: `002-table-grid-experience`).
- Floating overlay stack lifecycle, bottom sheets, and color/icon pickers (Phase 003: `003-popovers-menus-elevation`).
- 4-cluster toolbar reorganization and WAI-ARIA tablist view switcher (Phase 004: `004-toolbar-and-view-controls`).
- Design token system, typography scale, and dark-mode tag calibration (Phase 005: `005-design-tokens-typography`).
- Board swimlanes, gallery cover fallbacks, and calendar time rulers (Phase 006: `006-views-parity-polish`).
- Mobile touch hit envelopes and ARIA landmark roles (Phase 008: `008-mobile-and-accessibility`).
- Formula-builder live sample-row evaluation in `FormulaModal.ts` — deferred because this phase covers runtime feedback, not formula authoring execution.
- Writing note frontmatter or markdown bodies on view render, telemetry, or desktop-only APIs (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `src/views/EdgeAutoScroller.ts` | Create | Proximity container edge auto-scrolling utility for drag operations across tables, boards, and fill handles |
| `src/views/EdgeAutoScroller.test.ts` | Create | Unit tests for boundary proximity detection, velocity acceleration curves, and scroll frame loops |
| `src/views/DragDropFeedback.ts` | Edit | Expand `DragDropFeedbackState` to manage transaction phases (`over`, `pending`, `committed`, `failed`) and destination identity |
| `src/views/DragDropFeedback.test.ts` | Create | Unit tests for transactional drag/drop state transitions and drop placement calculations |
| `src/views/DatabaseView.ts` | Edit | Contiguous selection perimeter (`:4361-4381`), single corner fill handle (`:7971-7984`), floating glassmorphic dock (`:7010-7125`), EdgeAutoScroller integration (`:8184-8224`), operation-result rail (`:1198-1201, 7010-7110`) and async completion flows (`:8578-8642, 8669-8760, 8831-8989, 10077-10100, 10130-10192`), and refresh interaction snapshots (`:10631-10646`) |
| `src/views/CellRenderer.ts` | Edit | Formula diagnostic badges (`:183-204`), inline error shake and tooltips (`:1338-1341, 1412-1415, 2577-2580`), URL/Email/Phone micro-actions (`:246-279`), hover tag dismissal in `renderMultiSelect` (`:348-355`), interactive rating and progress tracks (`:300-309`), persistence-aware draft lifecycle (`:1950-2156, 2287-2350`), and timer elimination (`:823-828, 1362-1365`) |
| `src/views/TableRenderer.ts` | Edit | EdgeAutoScroller integration (`:684-712`), transactional drop feedback (`:697-740`), and row patch interaction snapshots (`:194-239`); Phase 002-owned `setupRowDrag()` contract (`:632-713`) is consume/verify only |
| `src/views/BoardRenderer.ts` | Edit | Multi-item card batch drag (`:508-585`), EdgeAutoScroller integration (`:441-480`), dedicated drop indicator line (`:531-541`), transactional move feedback (`:866-894`), and timer class elimination (`:929-955`) |
| `src/views/GalleryRenderer.ts` | Edit | Multi-item tile batch drag with count badge (`:337-370`) and transactional drop feedback (`:365-401`) |
| `src/views/ListRenderer.ts` | Edit | Multi-item row batch drag (`:344-421`) and transactional drop feedback |
| `src/views/SortPanelRenderer.ts` | Edit | Directional sort rule drop indicator line (`:94-110, 186-235`) and drag placement preview |
| `src/views/ToolbarRenderer.ts` | Edit | Debounced search activity pulse indicator (`:1087-1123`) |
| `src/views/RelationValueRenderer.ts` | Edit | Broken relation link detection via metadata cache and dashed warning pill state (`:18-35`) |
| `src/data/ComputedEvaluator.ts` | Edit | Capture detailed runtime evaluation errors and failing field symbols for diagnostic badges (`:68-72`) |
| `src/data/RefreshCoordinator.ts` | Edit | Surface stale-while-refreshing state flags and busy notifications to result views (`:47-84, 113-148`) |
| `src/i18n.ts` | Edit | Localized strings for moving item badges, formula diagnostics, inline validation, and operation results |
| `styles.css` | Edit | Contiguous selection perimeter (`:5004-5020`), floating selection dock (`:1697-1718`), drag ghost badges (`:5037-5055`), formula `#ERROR!` badges (`:5878-5888`), validation shake animation (`:5747-5780`), broken relation pills (`:4870-4910`), URL/Email/Phone micro-actions (`:4450-4490`), tag hover dismissal (`:4560-4650`), skeleton loader (`:6130-6160`), rating/progress hover tracks (`:4380-4420`), board/sort drop lines (`:5086-5100, 7307-7317`), and persistence-aware editor saving states (`:5747-5828`). Phase 002's generic cell block (`:4240-4247`) is consume/verify only. |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | Contiguous Selection Bounding Perimeter & Single Corner Fill Handle | In `DatabaseView.ts:4361-4381, 7971-7984` and `styles.css:5579`, compute rectangular selection boundary cells, apply outer accent borders (`.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, `.is-right-edge`) with clean interior translucent tint, and mount exactly one fill handle at the bottom-right corner of the entire selection matrix. |
| REQ-002 | Floating Glassmorphic Selection Action Dock | In `DatabaseView.ts:7010-7125` and `styles.css:2007`, render `.db-selection-status-bar` as a fixed bottom floating capsule dock with backdrop blur, spring entrance animation, animated count badge, semantic action buttons, and `[✕ Esc]` clear pill, updating in-place without layout shifts or DOM reconstruction. |
| REQ-003 | Multi-Item Batch Drag with Stacked Thumbnail & Count Badge | Phase 002 owns the table `setupRowDrag()` surface at `TableRenderer.ts:632-713`; Phase 007 consumes and verifies that table contract, implements batch drag in `BoardRenderer.ts:508-585` and `GalleryRenderer.ts:337-370`, and uses `styles.css:5037-5055` for the compact stacked card thumbnail and count badge pill (`"Moving N items"`). |
| REQ-004 | Container Proximity Edge Auto-Scroller (`EdgeAutoScroller`) | Create `src/views/EdgeAutoScroller.ts` and attach boundary listeners in `TableRenderer.ts:684-712`, `BoardRenderer.ts:441-480`, and `DatabaseView.ts:8184-8224` to smoothly auto-scroll containers via `requestAnimationFrame` when dragging within 40px of container boundaries. |
| REQ-005 | Formula Runtime Calculation Error Diagnostic Badges & Tooltips | In `ComputedEvaluator.ts:68-75`, retain runtime evaluation exceptions; consume and verify the Phase 002-owned empty-cell surface at `CellRenderer.ts:183-204` and `styles.css:4240-4247`, add the formula-error branch at `CellRenderer.ts:177-183`, and use the existing badge surface at `styles.css:5878-5888` for stylized `#ERROR!` badges with hover diagnostic tooltips showing the failing expression and variable. |
| REQ-006 | Inline Input Error Shake Animation & In-Situ Tooltip | In `CellRenderer.ts:1338-1341, 1412-1415, 2577-2580` and `styles.css:5747-5780`, replace silent input reversion with an inline horizontal shake animation (`@keyframes db-shake`), red focus ring, and in-situ speech bubble validation tooltip, keeping the editor open and focused with typed text retained. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | Broken Relation Pill Warning State | In `RelationValueRenderer.ts:18-35` and `styles.css:5625`, verify relation targets via `app.metadataCache.getFirstLinkpathDest()`; render unresolved links with a dashed warning border (`.is-unresolved`), warning icon, and "Note not found in vault" tooltip. |
| REQ-008 | Direct Inline Tag and Link Micro-Actions | In `CellRenderer.ts:246-279, 348-355` and `styles.css:4450-4490, 4560-4650`, render 1-click open/copy actions for URL, Email, and Phone cells and a micro `✕` dismiss button on multi-select/tag pills; actions provide optimistic visual feedback without opening a secondary popover. |
| REQ-009 | Shimmering Skeleton Loader & Stale-While-Refreshing State | In `DatabaseView.ts:10631-10646`, `RefreshCoordinator.ts:47-84, 113-148`, and `styles.css:6130-6160`, render lightweight shimmering CSS/SVG skeleton placeholders during view switches > 60ms; retain stale rows marked `aria-busy="true"` during background query refresh. |
| REQ-010 | Interactive Rating Stars & Progress Track Micro-Interactions | In `CellRenderer.ts:300-309` and `styles.css:4380-4420`, enable live star hover fill highlight (stars 1..k), single-click rating assignment, and click/drag progress track adjustment directly in table cells and card fields. |
| REQ-011 | Dedicated Kanban & Reorder Drop Indicator Lines | In `BoardRenderer.ts:531-541`, `SortPanelRenderer.ts:94-110, 186-235`, and `styles.css:5802, 7307-7317`, replace inset card box-shadows with distinct 2px accent insertion lines (`.db-board-drop-indicator`, `.db-sort-drop-indicator`) during drag-over. |
| REQ-012 | Transactional `DragDropFeedbackState` & Operation-Result Rail | In `DragDropFeedback.ts:1-47`, consume and verify Phase 002's table `setupRowDrag()` contract at `TableRenderer.ts:632-713`, manage pending feedback through `TableRenderer.ts:684-740` and `BoardRenderer.ts:524-584, 866-894`, and render the operation-result rail on the selection chrome at `DatabaseView.ts:1198-1201, 7010-7110` with async paste completion flows at `DatabaseView.ts:8578-8642, 8669-8760, 8831-8989` and async group moves at `DatabaseView.ts:10077-10100, 10130-10192`. |
| REQ-013 | Persistence-Aware Inline Editor Lifecycle & Draft Retention | In `CellRenderer.ts:1950-2156, 2287-2350` and `styles.css:5747-5828`, maintain persistent draft state during inline editing, show a saving indicator during async commit, and on save failure retain draft text with inline Retry and Discard actions. |
| REQ-014 | Interaction Snapshot & State Restoration Across Refresh | In `TableRenderer.ts:194-239` and `DatabaseView.ts:10631-10646`, capture `InteractionSnapshot` (focused cell, selected range, active draft, pointer position) before row patch or full refresh, restoring state to matching records after DOM rebuild. |
| REQ-015 | Debounced Search Activity Pulse Indicator | In `ToolbarRenderer.ts:1087-1123` and `styles.css:3185`, render a subtle pulsating search spinner icon inside `.db-search-input-wrap` during search query debouncing and execution. |
| REQ-016 | Canonical Selection Projection & Elimination of Timer Classes | In `CellRenderer.ts:823-828, 1362-1365, 2387-2400`, `BoardRenderer.ts:929-955`, and `DatabaseView.ts:4273-4338, 4432-4462`, eliminate arbitrary timer-based class removals, binding selection, editing, and drop highlights strictly to active interaction session lifetimes. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Selecting a cell range renders clean perimeter borders with zero interior double-border doubling and mounts exactly one corner fill handle on the bottom-right cell.
- **SC-002**: Selecting rows or cells transitions the floating glassmorphic action dock without vertical table shifts or horizontal scroll drift.
- **SC-003**: Dragging multiple selected records displays a compact stacked card preview with a count badge pill and moves all records atomically on drop.
- **SC-004**: Dragging rows, cards, or fill handles near container edges triggers smooth auto-scrolling via `EdgeAutoScroller`.
- **SC-005**: Broken formulas render a visible `#ERROR!` badge and hover diagnostic tooltip displaying the exact syntax or reference error.
- **SC-006**: Invalid inline inputs execute an `@keyframes db-shake` animation and show in-situ validation tooltips while retaining typed draft text.
- **SC-007**: Broken relation links render with a dashed warning outline and warning icon.
- **SC-008**: Hovering a multi-select tag pill displays a micro `✕` button that removes the tag in one click.
- **SC-009**: Switching views or running heavy queries renders a shimmering skeleton placeholder without blank canvas flashing.
- **SC-010**: Rating stars preview hover fills and commit values on single click; progress bars adjust on click/drag.
- **SC-011**: Dragging Kanban cards or sort rules displays a distinct 2px accent insertion line.
- **SC-012**: Asynchronous drag moves maintain pending visual state until resolution and render an operation-result rail with Undo/Retry.
- **SC-013**: Display-only rendering verified: zero unintended writes to note frontmatter or markdown bodies occur during hover, selection, drag preview, or error diagnostic rendering (iCloud-safe).

### Acceptance Scenarios

- **Scenario 1**: **Given** a 3×4 cell selection in table view, **when** inspecting the grid, **then** only the top, bottom, left, and right outer edges have accent borders, and a single fill handle is pinned to the bottom-right cell.
- **Scenario 2**: **Given** 5 selected rows, **when** dragging any selected row to a new position, **then** a stacked card thumbnail with badge `[Moving 5 items]` follows the cursor and all 5 rows reorder on drop.
- **Scenario 3**: **Given** a formula column with `[NonExistentField] + 10`, **when** the cell renders, **then** it displays `#ERROR!` and hovering reveals `"ReferenceError: Field [NonExistentField] does not exist"`.
- **Scenario 4**: **Given** an active inline number editor, **when** typing `"abc"` and pressing Enter, **then** the input shakes horizontally, flashes red, shows tooltip `"Enter a valid number"`, and remains focused with `"abc"` selected.
- **Scenario 5**: **Given** a note with a relation link `[[Deleted Note]]`, **when** the relation pill renders, **then** it displays a dashed warning outline with tooltip `"Note not found in vault"`.
- **Scenario 6**: **Given** a table with 200 rows, **when** dragging a row to the bottom edge of the window, **then** `EdgeAutoScroller` smoothly scrolls the table downward.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | Contiguous selection perimeter computation causes rendering lag on large ranges | Stutter during selection drag | Calculate perimeter bounding box coordinates in O(1) from anchor/focus grid indices; apply CSS classes only to perimeter cells |
| Risk | `EdgeAutoScroller` animation loop runs indefinitely if `dragend` is dropped | CPU drain / perpetual scrolling | Cancel `requestAnimationFrame` loop on `dragend`, `drop`, `dragleave`, `pointerup`, and window blur events |
| Risk | Multi-item batch drag payload exceeds browser dataTransfer limits | Drag payload truncation | Store array of vault file paths in dataTransfer MIME payload and cache active batch in memory on `DatabaseView` |
| Risk | Inline validation tooltip occluded by container boundaries | Tooltip clipped by overflow | Calculate viewport collision and flip tooltip placement above the cell if space below is constrained |
| Dependency | `src/views/DragDropFeedback.ts` | Drag state management | Expands existing helper into transactional state machine without breaking existing callers |
| Dependency | `src/data/ComputedEvaluator.ts` | Formula error extraction | Enhances error reporting without altering valid formula evaluation results |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 09) | Target citations and backlog mapping | Requirements trace directly to synthesis Ranked Rec #8, Quick Wins #8, #9, and Micro-Interactions Backlog |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: `EdgeAutoScroller` runs on `requestAnimationFrame` maintaining 60fps scrolling (< 16ms frame budget).
- **NFR-P02**: Contiguous selection perimeter calculation executes in < 2ms for ranges up to 1,000 cells.
- **NFR-P03**: Skeleton loaders mount immediately (< 10ms) when view transitions exceed 60ms threshold.

### Security
- **NFR-S01**: Zero external network requests, CDNs, telemetry, or remote dependencies; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: hover previews, selection boxes, drag ghosts, and error badges produce 0 unintended writes to note frontmatter or bodies.
- **NFR-R02**: Mobile-safe: selection dock collapses into a compact mobile capsule; touch long-press triggers batch selection and drag handles provide 44×44px hit targets.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Single Cell Selection**: Bounding perimeter applies all 4 borders (`.is-top-edge.is-bottom-edge.is-left-edge.is-right-edge`) to the single `<td>` with the fill handle on that cell.
- **Non-Contiguous Multi-Row Selection**: The floating action dock shows total selected count and operates on all selected paths; batch drag bundles all selected records.
- **Drag Target Over Same Record**: Dropping an item onto itself is a no-op; drag feedback clears cleanly without triggering database updates.
- **Formula Returning Empty String vs Evaluation Error**: Empty string `""` renders as empty cell whitespace; evaluation errors render `#ERROR!` badge with tooltip.
- **Tag Dismissal on Last Tag**: Clicking `✕` on the only tag pill removes the tag and sets the property to `null` or `[]` in memory.

### Error Scenarios
- **File System Write Collision During Inline Rename**: Editor executes shake animation, displays inline tooltip `"A file with this name already exists"`, and retains user input.
- **Broken Relation to Unindexed Vault Note**: Renders with `.is-unresolved` warning pill; clicking navigates to create/resolve note via Obsidian's standard link handling.
- **Rapid View Switching During Background Query**: In-flight skeleton loaders and debounced refresh coordinators are cleanly aborted on view teardown without orphaned DOM nodes.

### Concurrent Operations
- External note modifications during active inline editing retain the user's uncommitted draft with a conflict indicator rather than silently discarding typed input.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|---|---|---|
| Scope | 10/25 | Contiguous selection perimeter, floating dock, batch drag, EdgeAutoScroller, formula diagnostics, inline validation shake, and draft lifecycles |
| Risk | 5/25 | UI presentation layer, CSS animations, and interaction feedback; data pipeline and note storage untouched |
| Research | 6/20 | Exhaustive target citations and micro-interaction audits established across both research tracks |
| **Total** | **21/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Floating Dock Placement**: Fixed bottom center (`position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)`) is adopted to eliminate table layout shifts while maintaining viewport visibility.
- **Formula Diagnostic Level**: Cell `#ERROR!` badges display short error codes (`#ERROR!`, `#REF!`, `#DIV/0!`), with full exception messages and failing variable names surfaced in hover tooltips.
- **Reduced Motion Support**: All shake and spring animations respect `prefers-reduced-motion: reduce`, substituting instant opacity transitions.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../006-views-parity-polish/spec.md`](../006-views-parity-polish/spec.md)
- **Research Synthesis**: `specs/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 07 (Devin Track)**: `specs/002-ui-improvement-research/research/devin-gemini/iteration-07.md`
- **Research Iteration 09 (Devin Track)**: `specs/002-ui-improvement-research/research/devin-gemini/iteration-09.md`
- **Research Iteration 09 (Codex Track)**: `specs/002-ui-improvement-research/research/codex-luna/iteration-09.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
