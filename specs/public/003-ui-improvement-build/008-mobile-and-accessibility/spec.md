---
title: "Feature Specification: Mobile, Responsiveness & Accessibility Handoffs"
description: "Comprehensive mobile and accessibility handoff: universal touch and tablet detection (isTouchDevice), 44x44px touch hit target expansion, Phase 003 mobile bottom-sheet consumption and verification, visualViewport virtual keyboard tracking for inline cell editing, pointer long-press context menus with haptics, mobile Kanban swipe-snapping with pagination indicator, WAI-ARIA 1.2 Grid semantics with aria-sort, Phase 004 WAI-ARIA tablist verification, group collapse disclosure attributes, aria-live polite query status announcements, shared 2D keyboard navigation for embedded databases, explicit interaction-scope registry replacing document hover capture, focus-not-obscured scroll margins, focus-visible styling for body portals, and high-contrast forced-colors mode support."
trigger_phrases:
  - "mobile accessibility"
  - "touch targets"
  - "mobile bottom sheet"
  - "isTouchDevice"
  - "visualViewport keyboard"
  - "touch long press"
  - "kanban swipe snapping"
  - "aria grid"
  - "aria tablist"
  - "aria live status"
  - "embed keyboard navigation"
  - "interaction scope registry"
  - "focus not obscured"
  - "forced colors high contrast"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/008-mobile-and-accessibility"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled mobile and accessibility specification metadata"
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
# Feature Specification: Mobile, Responsiveness & Accessibility

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `007-micro-interactions`, successor `009-header-affordance-defects`.

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
While the Note Database plugin provides rich underlying database calculation and querying capabilities, its mobile ergonomics, touch responsiveness, keyboard ownership, and accessibility semantics suffer from severe structural shortcomings:
1. **Tiny Touch Targets Violating WCAG 2.5.5 / Apple HIG (`styles.css:1335, 1324, 4178-4188, 5090-5110, 15560-15636, 15996-16020`)**: Across more than 60 UI components, interactive hit targets fall dramatically below 44×44px. Toolbar buttons (`styles.css:1335`) are 28×28px; active filter/sort removal chips (`.db-active-control-remove`, `styles.css:1335`) render a 12×16px hit box; column menu triggers (`.db-column-menu-trigger`, `styles.css:17290`) are 22×22px with `opacity: 0` until hovered; row selection checkboxes (`styles.css:17290, 5090`) are 14×14px; and mobile record move buttons (`styles.css:17290`) are only 24×24px. On touch screens, attempting to tap the 12px filter remove icon mis-taps the filter body, opening the filter editor instead of dismissing the filter.
2. **Desktop Anchored Popovers Clip and Collapse on Mobile Screens (`src/views/PopoverPosition.ts:24-90, 124-147`, `src/views/FilterPanelRenderer.ts:126-140`, `src/views/SortPanelRenderer.ts:39-45`, `styles.css:183-224`)**: Toolbar panels (Filter, Sort, View Config, Column Manager, Grouping, Export) calculate desktop coordinate positioning. On mobile phones, `styles.css:15730` attempts to restrict them with `max-height: min(380px, calc(100vh - 240px))`. When the virtual keyboard is open or when scrolling down a database, this collapses popovers to 80–120px, clipping multi-rule forms and rendering them unusable.
3. **Mobile Cell Editing Occluded by Software Virtual Keyboard (`src/views/CellRenderer.ts:1539-1558, 2024-2059`, `styles.css:15734-15760`)**: Mobile inline text editing positions `.db-cell-edit-popover.is-mobile.is-inline-overlay` below the cell in document flow without `visualViewport` tracking or automatic scrolling. When the user taps a cell in the lower half of the table, focusing the `<textarea>` brings up the virtual keyboard (occupying 40–50% of the screen), burying the input field completely behind the keyboard.
4. **Fragile `isPhoneLayout()` Ignores iPad/Android Tablets and Desktop Splits (`src/views/TableRenderer.ts:802`, `src/views/BoardRenderer.ts:925`, `src/views/GalleryRenderer.ts:438`, `src/views/ListRenderer.ts:432`, `src/views/ColumnHeaderController.ts:139`, `src/views/ToolbarRenderer.ts:288`, `src/views/DatabaseView.ts:4340`, `src/views/EmbeddedDatabaseRenderer.ts:3526`)**: Across 8 view controllers, mobile layout is determined strictly by `body.classList.contains("is-phone")`. On iPadOS and Android tablets, Obsidian adds `.is-tablet` but not `.is-phone`. Consequently, tablets are treated as desktop computers: HTML5 drag-and-drop fails, mobile fallback move buttons are hidden, and controls require mouse `:hover` to appear.
5. **Absence of Touch Long-Press Context Menus & Double-Tap Zoom Delays (`src/views/DatabaseView.ts:7626-7628`, `src/views/TableRenderer.ts:510-530`, `src/views/BoardRenderer.ts:590-620`, `src/views/CellRenderer.ts:418-430`, `styles.css:124, 4065-4080`)**: Context menus rely solely on desktop right-click (`contextmenu`), and cell activation relies on `dblclick`. Long-pressing a card or row triggers the mobile browser's native text selection loupe rather than the database menu. Double-tapping cells introduces mobile WebKit 300ms zoom delays because containers lack `touch-action: manipulation`.
6. **Kanban Board Lacks Mobile Column Swipe-Snapping and Indicators (`src/views/BoardRenderer.ts:280-350`, `styles.css:7050-7120`)**: On mobile phones, Kanban columns sit in an unconstrained flex container. Swiping horizontally drifts aimlessly between columns, cutting off columns mid-screen without CSS scroll-snapping or pagination indicators (`● ○ ○ ○`).
7. **Missing WAI-ARIA 1.2 Grid Semantics & Sorting Annotations (`src/views/TableRenderer.ts:60-120, 422-455`, `src/views/ColumnHeaderController.ts:20-45`)**: Table containers lack `role="grid"` (or `role="treegrid"`), `aria-rowcount`, and `aria-colcount`; headers lack `role="columnheader"`, `aria-colindex`, and `aria-sort="ascending|descending|none"`; rows lack `role="row"` and `aria-rowindex`; and cells lack `role="gridcell"`, `aria-colindex`, and `aria-selected`. Screen readers cannot perceive dimensions or sorted columns.
8. **View Switcher Lacks WAI-ARIA Tablist Semantics (`src/views/ToolbarRenderer.ts:631-653`, `styles.css:1210-1270`)**: The tab strip is a plain `div` with `<button>` elements, omitting `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and `role="tabpanel"`.
9. **Group Toggles Lack Dynamic Disclosure Semantics (`src/views/TableRenderer.ts:138`, `src/views/BoardRenderer.ts:325`, `src/views/GalleryRenderer.ts:115`, `src/views/ListRenderer.ts:107`, `src/views/CalendarTimelineRenderer.ts:547`)**: Group headers set static labels but omit `aria-expanded="true|false"` and `aria-controls`.
10. **Silent Search/Filter Result Updates Without Screen Reader Announcements (`src/views/ActiveViewControlsRenderer.ts:29-53`, `src/views/DatabaseView.ts:1958-1970`)**: When filtering 100 rows to 2, DOM updates silently without an `aria-live="polite"` status region.
11. **Embedded Databases Lack 2D Keyboard Grid Navigation (`src/views/EmbeddedDatabaseRenderer.ts:421-434, 3425-3439`, `src/data/TableKeyboardNavigation.ts:29-82`)**: While full-view tables support complete arrow/Tab/Enter navigation, embedded databases only register copy/Escape handlers, locking out keyboard and switch users.
12. **Dangerous Document-Level `:hover` Shortcut Stealing (`src/views/DatabaseView.ts:1206-1229, 1430-1440`)**: `DatabaseView` accepts global shortcuts when the container merely matches `:hover` even if `activeElement` is in an adjacent Obsidian note or body-mounted portal (`.db-mobile-column-width-panel`, `IconPickerPopover`, `OptionColorPicker`).
13. **Destructive Focus Reset & Incomplete Portal Focus Visibility (`styles.css:189-206`)**: `.note-database-container *:focus { outline: none; }` strips focus visibility. Body-mounted portals miss `:focus-visible` styling, and popovers fail to trap Tab focus.
14. **Focus Obscured by Sticky Table Headers and Fixed Mobile Chrome (`styles.css:189-217, 4081-4089`)**: Navigating table cells via keyboard causes focused cells to scroll directly under sticky `<thead>` headers or fixed bottom bars without `scroll-margin` clearance (violating WCAG 2.2 SC 2.4.11 / 2.4.12).
15. **Missing High-Contrast OS `forced-colors: active` Support (`styles.css:208-217, 4988-5023, 16429-16460`)**: In Windows High Contrast Mode and macOS Increased Contrast Mode, borders, cell selection perimeters, and drop indicators vanish because styles rely on custom alpha-translucent CSS variables without system color fallbacks.
16. **Timeline Viewport Optimization is Semantically Opaque (`src/data/CalendarTimelineModel.ts:336-365, 554-631`, `src/views/CalendarTimelineRenderer.ts:217-255`, `styles.css:14263-14268, 15077-15125`)**: Timeline jump buttons are 18px and lack keyboard accessibility, while the rendered date range lacks screen-reader announcements.

### Purpose
Establish a comprehensive, mobile-first, and fully accessible presentation layer inspired by **Anytype**, **AppFlowy**, and **Notion**:
- Deliver **Universal Touch & Tablet Detection (`isTouchDevice`)** and container-local responsive interaction modes that adapt smoothly across phones, tablets, and split panes.
- Enforce **44×44px Touch Target Hit Envelopes** across all interactive elements via transparent pseudo-elements (`::before { inset: -8px; }`).
- Supply `isTouchDevice()` consumption and 44×44px hit envelopes while consuming and verifying the **Native Mobile Bottom Sheet Architecture (`.db-mobile-bottom-sheet`)** owned by Phase 003; no bottom-sheet geometry changes live here.
- Implement **`visualViewport` Virtual Keyboard Tracking** to keep active mobile cell editors perfectly centered above the software keyboard.
- Provide **Pointer-Based Long-Press Context Menus (450ms + haptics)** and eliminate double-tap zoom delay with `touch-action: manipulation`.
- Add **Mobile Kanban Swipe-Snapping & Pagination Indicators (`● ○ ○ ○`)**.
- Inject complete **WAI-ARIA 1.2 Grid Semantics (`role="grid"`, `aria-sort`, `aria-colindex`, `aria-rowindex`, `aria-selected`)**.
- Verify the accessible **WAI-ARIA `role="tablist"`** View Switcher contract owned by Phase 004.
- Add dynamic **`aria-expanded` and `aria-controls`** to all group collapse toggles across 5 views.
- Implement a visually hidden **`aria-live="polite"` Status Region** for filter and search count updates.
- Share the **2D Spreadsheet Keyboard Controller** across full-view and embedded database tables.
- Replace document-level `:hover` shortcut stealing with an **Explicit Interaction-Scope Registry**.
- Fix focus visibility with **Scoped `:focus-visible` Across Body Portals, Dialog Focus Trapping**, and **Focus-Not-Obscured Scroll Margins**.
- Provide complete **High-Contrast OS `forced-colors: active`** support and portal-wide reduced motion.
- Make the **Timeline Viewport Accessible** with 44px jump controls and date range announcements.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Universal Touch & Tablet Detection (`isTouchDevice`)**: Replace fragile `isPhoneLayout()` (`body.is-phone`) in `TableRenderer.ts:802`, `BoardRenderer.ts:925`, `GalleryRenderer.ts:438`, `ListRenderer.ts:432`, `ColumnHeaderController.ts:139`, `ToolbarRenderer.ts:288`, `DatabaseView.ts:4340`, and `EmbeddedDatabaseRenderer.ts:3526` with `isTouchDevice()` checking `Platform.isMobile || Platform.isTablet || window.matchMedia("(pointer: coarse)").matches` and container ResizeObserver bounds.
- **44×44px Touch Target Hit Envelopes**: Expand hit target pseudo-elements (`::before { inset: -8px; }`) and touch padding across toolbar buttons (`styles.css:1324`), active filter/sort removal chips (`styles.css:1024-1041`), column menu triggers (`styles.css:4178-4188`), checkboxes (`styles.css:4746, 5090-5110`), mobile move buttons (`styles.css:15560-15636`), group expand toggles (`styles.css:8234-8255`), timeline jump controls (`styles.css:15077-15125`), and icon picker swatches (`styles.css:15996-16020`).
- **Mobile Bottom Sheet Handoff Verification**: Consume and verify the `.db-mobile-bottom-sheet` geometry owned by Phase 003 at `PopoverPosition.ts:24-90, 124-147` and `styles.css:183`; this phase contributes only `isTouchDevice()` consumption and 44×44px touch targets, not sheet DOM, geometry, or styling.
- **Keyboard-Safe Mobile Cell Editing with `visualViewport` Tracking**: Upgrade `CellRenderer.ts:1539-1558, 2024-2059` and `styles.css:15734-15760` to track `window.visualViewport` resize events, dynamically positioning editors and executing `scrollIntoView({ block: 'center', behavior: 'smooth' })` with top-docked "Done / Cancel" toolbar.
- **Touch Long-Press Gestures & Double-Tap Zoom Prevention**: Implement pointer-based long-press listeners (450ms threshold + `navigator.vibrate?.(20)` haptics) using the existing row-menu wiring at `DatabaseView.ts:7626-7628` and across `TableRenderer.ts:510-530`, `BoardRenderer.ts:590-620`, and `CellRenderer.ts:418-430` to trigger native `Menu` on touch screens; add `touch-action: manipulation` across `styles.css:124, 4065-4080`.
- **Mobile Kanban Swipe-Snapping & Pagination Indicators**: Add CSS `scroll-snap-type: x mandatory; scroll-snap-align: center;` to `.db-board` on mobile devices and render a compact pagination indicator pill bar (`● ○ ○ ○`) in `BoardRenderer.ts:280-350` and `styles.css:17294`.
- **WAI-ARIA 1.2 Grid Semantics & Sorting Annotations**: Inject `role="grid"` (or `role="treegrid"`), `aria-rowcount`, `aria-colcount` to table container; `role="columnheader"`, `aria-colindex`, `aria-sort="ascending|descending|none"` to `<th>`; `role="row"`, `aria-rowindex` to `<tr>`; and `role="gridcell"`, `aria-colindex`, `aria-selected` to `<td>` in `TableRenderer.ts:60-120, 422-455` and `ColumnHeaderController.ts:20-45`.
- **WAI-ARIA Tablist Handoff Verification**: Verify the `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and `role="tabpanel"` contract implemented by Phase 004 at `ToolbarRenderer.ts:625-683`, `DatabaseView.ts:2970` (`switchView`), and `styles.css:1210-1270`; do not re-annotate the view switcher here.
- **Group Collapse `aria-expanded` and `aria-controls`**: Add dynamic `aria-expanded="true|false"` and `aria-controls="group-section-${id}"` to group toggles across Table, Board, Gallery, List, and Timeline views (`TableRenderer.ts:138`, `BoardRenderer.ts:325`, `GalleryRenderer.ts:115`, `ListRenderer.ts:107`, `CalendarTimelineRenderer.ts:547`).
- **Screen Reader `aria-live` Status Region**: Inject visually hidden `div.db-sr-status` with `aria-live="polite"` and `aria-atomic="true"` in `ActiveViewControlsRenderer.ts:29-53`, alongside the active-control integration in `DatabaseView.ts:1958-1970`, and `styles.css:190-210` announcing filter, search, and sort count changes.
- **Shared 2D Keyboard Navigation for Embedded Databases**: Extract full-view spreadsheet keyboard controller into shared `TableKeyboardNavigation.ts:29-82` and attach to `EmbeddedDatabaseRenderer.ts:421-434, 3425-3439`, supporting Tab, Arrow keys, Home/End, PageUp/PageDown, Enter/F2 editing, and Spacebar checkbox toggling with clear Escape return to note body.
- **Explicit Interaction-Scope Registry**: Replace document-level `:hover` shortcut stealing in `DatabaseView.ts:1206-1229, 1430-1440` with an explicit interaction-scope registry derived from `activeElement` and `composedPath()`, managing focus ownership across body portals and pausing when external editors own focus.
- **Focus Ring Scoping & Dialog Focus Trapping**: Remove destructive `.note-database-container *:focus { outline: none; }` from `styles.css` (blanket rule since removed; no `*:focus` selector remains); extend `:focus-visible` styling to body-mounted portals (`.db-column-menu-subpopover`, `.db-color-picker-popup`, `.db-icon-picker-popover`, `.db-cell-edit-popover`, `.db-mobile-column-width-panel`); implement focus trapping in all popovers and modals (`TableRecordPeek.ts:88-120`, `RecordDetailPanel.ts:150-180`, `FilterPanelRenderer.ts:120-150`).
- **Focus-Not-Obscured Scroll Margins**: Add `scroll-margin-top: calc(var(--db-header-height, 34px) + 8px)` and `scroll-margin-bottom: calc(var(--db-mobile-bar-height, 48px) + 8px)` in `styles.css:189-217, 4081-4089` so focused cells never scroll behind sticky headers or fixed bottom bars.
- **High-Contrast OS `forced-colors: active` & Reduced-Motion Portal Support**: Add comprehensive `@media (forced-colors: active)` fallbacks in `styles.css:208-217, 4988-5023, 16429-16460` for borders, cell selection perimeters, drop targets, disabled state, and focus rings using system color keywords (`ButtonText`, `Highlight`, `CanvasText`); extend reduced-motion rules across body portals.
- **Timeline Viewport Accessibility & Jump Controls**: Make timeline date range and off-window counts discoverable via screen-reader announcements in `CalendarTimelineModel.ts:336-365, 554-631` and expand jump buttons to 44px hit envelopes in `CalendarTimelineRenderer.ts:217-255` and `styles.css:14263-14268, 15077-15125`.

### Out of Scope
- Empty and zero-result onboarding states (Phase 001: `001-empty-and-first-run-states`).
- Table grid single-header refactor, trailing add column, and calculation tfoot (Phase 002: `002-table-grid-experience`).
- Floating overlay stack lifecycle, bottom sheets, and color/icon pickers (Phase 003: `003-popovers-menus-elevation`).
- 4-cluster toolbar reorganization and view switcher layout (Phase 004: `004-toolbar-and-view-controls`).
- Design token system, WCAG AA color tokens, and typography scale (Phase 005: `005-design-tokens-typography`).
- Board swimlanes, gallery cover fallbacks, and calendar time rulers (Phase 006: `006-views-parity-polish`).
- Micro-interactions, selection perimeters, and batch drag (Phase 007: `007-micro-interactions`).
- Writing note frontmatter or markdown bodies on view render, telemetry, or desktop-only APIs (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `src/views/InteractionScope.ts` | Create | Explicit interaction-scope registry managing focus ownership across view containers, body-mounted portals, and modals |
| `src/views/InteractionScope.test.ts` | Create | Unit tests for interaction scope activation, pause, release, and focus return lifecycle |
| `src/data/TouchEnvironment.ts` | Create | Centralized `isTouchDevice()` environment helper evaluating pointer capabilities, platform state, and viewport modes |
| `src/data/TouchEnvironment.test.ts` | Create | Unit tests for touch device detection, coarse pointer matching, and mobile/tablet platform classification |
| `src/views/TableRenderer.ts` | Edit | Replace `isPhoneLayout` (`:802`), inject WAI-ARIA grid roles (`:60-120, 422-455`), accessible checkboxes (`:426-433, 524-530`), group collapse `aria-expanded`/`aria-controls` (`:138`), and touch long-press (`:510-530`) |
| `src/views/DatabaseView.ts` | Edit | Replace `isPhoneLayout` (`:4340`), attach interaction scope (`:1206-1229, 1430-1440`), extend row-menu wiring for touch long-press (`:7626-7628`), and coordinate the live status region with active controls (`:1958-1970`) |
| `src/views/EmbeddedDatabaseRenderer.ts` | Edit | Replace `isPhoneLayout` (`:3526`), integrate shared 2D table keyboard navigation controller (`:421-434, 3425-3439`), and attach interaction scope |
| `src/views/CellRenderer.ts` | Edit | Mobile cell editing `visualViewport` tracking and smooth centering (`:1539-1558, 2024-2059`), touch long-press context menu (`:418-430`) |
| `src/views/BoardRenderer.ts` | Edit | Replace `isPhoneLayout` (`:925`), add mobile Kanban swipe-snapping and pagination indicator (`:280-350`), group collapse disclosure (`:325`), touch long-press (`:590-620`) |
| `src/views/GalleryRenderer.ts` | Edit | Replace `isPhoneLayout` (`:438`), group collapse disclosure (`:115`), touch long-press context menu |
| `src/views/ListRenderer.ts` | Edit | Replace `isPhoneLayout` (`:432`), group collapse disclosure (`:107`), touch long-press context menu |
| `src/views/CalendarRenderer.ts` | Edit | Replace `isPhoneLayout` (`:2085`), calendar event touch gesture support, accessible date overflow |
| `src/views/CalendarTimelineRenderer.ts` | Edit | Replace `isPhoneLayout` (`:2143`), group collapse disclosure (`:547`), 44px jump control hit envelopes (`:217-255`) |
| `src/views/ColumnHeaderController.ts` | Edit | Replace `isPhoneLayout` (`:139`), add `aria-sort="ascending|descending|none"` (`:20-45`) |
| `src/views/ToolbarRenderer.ts` | Edit | Replace `isPhoneLayout` (`:288`); verify the Phase 004 view-switcher tablist contract without re-annotating it (`:625-683`) |
| `src/views/ActiveViewControlsRenderer.ts` | Edit | Connect filter/search change announcements to `aria-live` status region (`:29-53`), expand 44px hit envelopes on remove chips (`:151-166`) |
| `src/views/PopoverPosition.ts` | Edit | Consume Phase 003 bottom-sheet geometry while integrating focus trapping and visualViewport behavior (`:24-90, 124-147`) |
| `src/views/TableRecordPeek.ts` | Edit | Implement dialog focus trapping (`Tab` cycle, `Escape` return) (`:88-120`) |
| `src/views/RecordDetailPanel.ts` | Edit | Implement drawer focus trapping and accessible panel labels (`:150-180`) |
| `src/views/FilterPanelRenderer.ts` | Edit | Dialog focus trapping (`:120-150`); consumes Phase 003 bottom-sheet output |
| `src/views/SortPanelRenderer.ts` | Edit | Dialog focus trapping (`:39-45`); consumes Phase 003 bottom-sheet output |
| `src/views/ColumnManagerRenderer.ts` | Edit | Dialog focus trapping (`:46-55`); consumes Phase 003 bottom-sheet output |
| `src/views/ViewConfigPanelRenderer.ts` | Edit | Dialog focus trapping (`:250-265`); consumes Phase 003 bottom-sheet output |
| `src/data/TableKeyboardNavigation.ts` | Edit | Generalize 2D navigation controller for shared consumption by full-view and embedded database tables (`:29-82`) |
| `src/data/CalendarTimelineModel.ts` | Edit | Expose accessible date range and off-window event counts (`:336-365, 554-631`) |
| `src/i18n.ts` | Edit | Localized strings for screen-reader announcements, mobile bottom sheet actions, and pagination status |
| `styles.css` | Edit | 44px touch targets (`:1024-1041, 1324, 4178-4188, 5090-5110, 15560-15636, 15996-16020`), keyboard editing overlay (`:15734-15760`), touch-action manipulation (`:124, 4065-4080`), Kanban swipe-snap (`:7050-7120`), focus reset fix and portal focus-visible (`:189-206`), focus-not-obscured scroll margins (`:4081-4089`), and forced-colors active rules (`:208-217, 4988-5023, 16429-16460`); bottom-sheet and tablist styles are consumed from Phases 003 and 004 |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | Universal Touch & Tablet Detection (`isTouchDevice`) | Create `src/data/TouchEnvironment.ts` and replace fragile `isPhoneLayout()` across `TableRenderer.ts:802`, `BoardRenderer.ts:925`, `GalleryRenderer.ts:438`, `ListRenderer.ts:432`, `ColumnHeaderController.ts:139`, `ToolbarRenderer.ts:288`, `DatabaseView.ts:4340`, and `EmbeddedDatabaseRenderer.ts:3526` with `isTouchDevice()` checking `Platform.isMobile || Platform.isTablet || window.matchMedia("(pointer: coarse)").matches` and container ResizeObserver width. |
| REQ-002 | 44×44px Touch Target Hit Envelopes (WCAG 2.5.5 / Apple HIG) | In `styles.css:1335, 1324, 4178-4188, 5090-5110, 15560-15636, 15996-16020`, expand touch hit target pseudo-elements (`::before { inset: -8px; }`) and touch padding across toolbar icon buttons, active filter/sort removal chips (`.db-active-control-remove`), column menu triggers, checkboxes, mobile move buttons, group expand toggles, timeline jump buttons, and icon picker swatches to achieve at least 44×44px touch envelopes. |
| REQ-003 | Consume and Verify Phase 003 Mobile Bottom Sheet Architecture (`.db-mobile-bottom-sheet`) | Verify that `PopoverPosition.ts:24-90, 124-147` and `styles.css:183` provide the Phase 003 bottom-sheet geometry consumed by touch-device panels; this phase contributes only `isTouchDevice()` consumption and 44×44px targets and does not implement sheet structure. |
| REQ-004 | Keyboard-Safe Mobile Cell Editing with `visualViewport` Tracking | In `CellRenderer.ts:1539-1558, 2024-2059` and `styles.css:15734-15760`, attach listeners to `window.visualViewport` resize events during mobile cell editing, dynamically calculate keyboard offset, execute `scrollIntoView({ block: 'center', behavior: 'smooth' })`, and dock a top "Done / Cancel" toolbar to prevent the virtual keyboard from occluding inputs. |
| REQ-005 | Focus Ring Scoping Across Portals & Focus-Not-Obscured Scroll Margins | In `styles.css`, eliminate destructive `.note-database-container *:focus { outline: none; }`, extend `:focus-visible` styling (`outline: 2px solid var(--interactive-accent); outline-offset: 2px;`) to body-mounted portals (`.db-column-menu-subpopover`, `.db-color-picker-popup`, `.db-icon-picker-popover`, `.db-cell-edit-popover`, `.db-mobile-column-width-panel`), and add `scroll-margin-top: calc(var(--db-header-height, 34px) + 8px)` and `scroll-margin-bottom: calc(var(--db-mobile-bar-height, 48px) + 8px)` in `styles.css:16887`. |
| REQ-006 | High-Contrast OS `forced-colors: active` Support | In `styles.css:208-217, 4988-5023, 16429-16460`, declare comprehensive `@media (forced-colors: active)` fallbacks for borders, cell selection perimeters, drop indicators, disabled states, and focus rings using system color keywords (`ButtonText`, `Highlight`, `CanvasText`, `GrayText`). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | Touch Long-Press Context Menus & Double-Tap Zoom Prevention | In the existing row-menu wiring (`DatabaseView.ts:7626-7628`), `TableRenderer.ts:510-530`, `BoardRenderer.ts:590-620`, and `CellRenderer.ts:418-430`, implement pointer-based long-press listeners (450ms threshold + `navigator.vibrate?.(20)` haptics) on rows, cards, and tabs to trigger native `Menu` on touch devices while suppressing browser text selection; add `touch-action: manipulation` across `styles.css:124, 4065-4080`. |
| REQ-008 | Mobile Kanban Swipe-Snapping & Pagination Indicators | In `BoardRenderer.ts:280-350` and `styles.css:17294`, add CSS `scroll-snap-type: x mandatory; scroll-snap-align: center;` to `.db-board` on mobile devices and render a compact pagination indicator pill bar (`● ○ ○ ○`) below the board for 1-tap direct column jumping. |
| REQ-009 | WAI-ARIA 1.2 Grid Semantics & Sorting Annotations | In `TableRenderer.ts:60-120, 422-455` and `ColumnHeaderController.ts:20-45`, inject `role="grid"` (or `role="treegrid"`), `aria-rowcount`, `aria-colcount`, `aria-label="Database table"` to table root; `role="columnheader"`, `aria-colindex`, `aria-sort="ascending|descending|none"` to `<th>`; `role="row"`, `aria-rowindex` to `<tr>`; and `role="gridcell"`, `aria-colindex`, `aria-selected` to `<td>`. |
| REQ-010 | Verify Phase 004 WAI-ARIA Tablist Pattern for View Switcher | Verify the Phase 004 contract at `ToolbarRenderer.ts:625-683`, `DatabaseView.ts:2970` (`switchView`), and `styles.css:1512`: `.db-view-tabs` and its panels expose the required tablist/tab/tabpanel roles, selected state, relationships, and roving tabindex; this phase does not add or modify those annotations. |
| REQ-011 | Group Collapse Disclosure Semantics (`aria-expanded`, `aria-controls`) | In `TableRenderer.ts:138`, `BoardRenderer.ts:325`, `GalleryRenderer.ts:115`, `ListRenderer.ts:107`, and `CalendarTimelineRenderer.ts:547`, dynamically set `aria-expanded="true|false"` and `aria-controls="db-group-section-${id}"` on group toggle buttons. |
| REQ-012 | Screen Reader `aria-live` Query Status Region | In `ActiveViewControlsRenderer.ts:29-53`, the active-control integration in `DatabaseView.ts:1958-1970`, and `styles.css:190-210`, inject visually hidden `div.db-sr-status` with `aria-live="polite"` and `aria-atomic="true"` announcing real-time search, filter, and sort result changes. |
| REQ-013 | Shared 2D Keyboard Navigation for Embedded Databases | In `EmbeddedDatabaseRenderer.ts:421-434, 3425-3439` and `DatabaseView.ts:1510-1575`, integrate shared `TableKeyboardNavigation.ts:29-82` so embedded database tables support Tab/Shift+Tab, Arrow keys, Home/End, PageUp/PageDown, Enter/F2 cell editing, and Spacebar checkbox toggling with clear Escape exit to note body. |
| REQ-014 | Explicit Interaction-Scope Registry | In `DatabaseView.ts:1206-1229, 1430-1440`, create `src/views/InteractionScope.ts` to replace document-level `:hover` shortcut capture with an explicit interaction-scope registry derived from `activeElement` and `composedPath()`, managing focus ownership across body portals and pausing when external editors own focus. |
| REQ-015 | Dialog Focus Trapping in Popovers and Modals | In `TableRecordPeek.ts:88-120`, `RecordDetailPanel.ts:150-180`, `FilterPanelRenderer.ts:120-150`, and `PopoverPosition.ts:24-90`, implement focus trapping (`Tab`/`Shift+Tab` cycle within dialog, `Escape` to close and return focus to invoking trigger). |
| REQ-016 | Timeline Viewport Accessibility & Jump Affordances | In `CalendarTimelineModel.ts:336-365, 554-631`, `CalendarTimelineRenderer.ts:217-255`, and `styles.css:14263-14268, 15077-15125`, expose screen-reader announcements of visible timeline date ranges and off-window counts, and expand jump buttons to 44px hit envelopes with persistent button semantics and keyboard reachability. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: On touch devices (tablets and phones), all interactive controls (toolbar buttons, filter remove chips, checkboxes, column menu triggers, move buttons, jump controls) provide hit envelopes of at least 44×44px without mis-tapping adjacent controls.
- **SC-002**: This phase consumes and verifies the Phase 003 mobile bottom-sheet drawer with grab handle, backdrop scrim, and safe-area padding without adding competing geometry.
- **SC-003**: Activating mobile inline cell editing centers the `<textarea>` within the visible `visualViewport` above the software keyboard, keeping typed text and cursor visible.
- **SC-004**: iPads and Android tablets receive touch-friendly move controls, touch selection, and menus without requiring desktop `:hover` or mouse events.
- **SC-005**: Long-pressing a row, card, or tab on touch screens triggers haptic feedback and opens the database context menu without triggering browser text selection.
- **SC-006**: Swiping horizontally on mobile Kanban boards snaps cleanly to column centers with active column highlighted on the pagination pill indicator.
- **SC-007**: Screen readers (VoiceOver, TalkBack, NVDA) announce table dimensions (`role="grid"`), column headers with sorted state (`aria-sort`), row/cell indices, and live filter/search result count updates (`aria-live="polite"`).
- **SC-008**: Phase 004's View Switcher tablist contract is verified here: tabs announce `role="tablist"` and active selection (`aria-selected="true"`) while supporting Left/Right Arrow keyboard switching.
- **SC-009**: Group collapse toggles announce `aria-expanded="true|false"` and identify controlled sections (`aria-controls`).
- **SC-010**: Embedded database tables inside notes support full 2D spreadsheet keyboard navigation (Tab, Arrow keys, Enter/F2 edit, Spacebar checkbox) matching full-view parity.
- **SC-011**: Document shortcuts only fire when the database or its open body portals own active focus, never stealing keystrokes when editing adjacent note text.
- **SC-012**: In Windows High Contrast Mode (`forced-colors: active`), borders, cell selection perimeters, drop indicators, and focus rings render with crisp system colors.
- **SC-013**: Display-only invariant holds: zero note frontmatter or markdown body writes occur during mobile interaction, touch gestures, or accessibility attribute injection (iCloud-safe).

### Acceptance Scenarios

- **Scenario 1**: **Given** an iPad running Obsidian Mobile, **when** opening a database view, **then** `isTouchDevice()` evaluates to `true`, displaying touch move controls, 44px hit targets, and touch context menus without requiring mouse hover.
- **Scenario 2**: **Given** a phone viewport with 15 active filter chips, **when** tapping the 12px `✕` remove button on the third filter chip, **then** the 44px hit envelope removes the filter immediately without opening the filter editor modal.
- **Scenario 3**: **Given** a cell in row 45 of a table on mobile, **when** tapping to edit, **then** the virtual keyboard opens, `visualViewport` tracking scrolls the cell into visible center, and the top-docked "Done / Cancel" toolbar remains accessible.
- **Scenario 4**: **Given** a screen reader user on table view, **when** navigating column headers, **then** VoiceOver announces "Priority, column 3 of 8, sorted ascending".
- **Scenario 5**: **Given** an embedded database table inside a note, **when** pressing Tab and Arrow keys, **then** cell focus navigates smoothly across rows and columns, Enter initiates inline editing, and Escape returns focus to the note.
- **Scenario 6**: **Given** Windows High Contrast Mode enabled, **when** selecting a cell range, **then** the selection bounding box renders a crisp 2px system `Highlight` border and `HighlightText` fill.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | Expanded 44px touch hit envelopes overlap adjacent compact buttons | Mis-tapping neighboring controls | Use CSS hit-expansion pseudo-elements (`::before { inset: -8px; }`) combined with `pointer-events: auto` scoped strictly to touch coarse media queries (`@media (pointer: coarse)`), preserving tight visual spacing on desktop mouse pointers |
| Risk | `visualViewport` resize listener causes performance jitter during keyboard animation | Frame drops during typing | Debounce viewport scroll calculations using `requestAnimationFrame` and clean up listeners immediately upon editor blur/dismissal |
| Risk | Full 2D keyboard navigation in embedded databases intercepts note editing keys | Inability to type in surrounding note | Guard keyboard handlers to activate only when an embedded cell has explicit focus; allow immediate exit on `Escape` or `Tab` past grid boundaries |
| Risk | Mobile bottom sheet interferes with Obsidian's dynamic mobile navigation bar | Phase 003 geometry is clipped or misrouted on touch devices | Consume and verify Phase 003's `.mobile-navbar` measurement and `env(safe-area-inset-bottom)` output in `PopoverPosition.ts` |
| Dependency | `src/data/TableKeyboardNavigation.ts` | 2D table navigation logic | Already implements spreadsheet movement; extracted for shared full-view and embed use |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 10) | Target citations and backlog mapping | Requirements trace directly to synthesis Ranked Rec #2, #9, Quick Wins #3, #14, #15, #16, and Mobile/A11y Backlog |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: `visualViewport` resize adjustments and scroll centering execute within 1 animation frame (< 16ms) without blocking virtual keyboard animation.
- **NFR-P02**: Screen reader `aria-live` announcements are debounced by 300ms to avoid audio stutter during rapid search typing.
- **NFR-P03**: Long-press pointer timer uses passive event listeners with 0ms impact on native touch scrolling performance.

### Security & Privacy
- **NFR-S01**: 100% local Obsidian DOM and WAI-ARIA APIs; zero external network calls, CDNs, or telemetry; MIT-forkable.

### Reliability & Accessibility
- **NFR-R01**: Display-only and iCloud-safe: mobile touch gestures, bottom sheet overlays, virtual keyboard offsets, and ARIA attributes produce 0 unintended writes to note frontmatter or bodies.
- **NFR-R02**: Full WCAG 2.1 AA / WCAG 2.2 compliance across Target Size (SC 2.5.5 / 2.5.8), Focus Not Obscured (SC 2.4.11 / 2.4.12), Status Messages (SC 4.1.3), Info and Relationships (SC 1.3.1), and Non-Text Contrast (SC 1.4.11).
- **NFR-R03**: Complete compatibility with iOS VoiceOver, Android TalkBack, and Windows NVDA/JAWS screen readers.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Split Pane Resizing Below 480px on Desktop**: `isTouchDevice()` detects pointer capabilities accurately; container ResizeObserver switches toolbar to compact overflow without breaking desktop mouse drag-and-drop.
- **Mobile Device Rotation (Portrait ↔ Landscape)**: Bottom sheets and cell editor popovers recalculate viewport bounds via `visualViewport.addEventListener('resize')`, adjusting safe-area insets immediately.
- **Zero Results After Filter Application**: Visually hidden `aria-live="polite"` region announces "0 records match active filters", guiding screen-reader users to the clear filter action.
- **External Hardware Keyboard Attached to iPad**: Both touch gestures (long-press, tap-to-edit) and hardware keyboard navigation (Arrow keys, Tab, Enter) operate concurrently without mode conflicts.

### Error Scenarios
- **Virtual Keyboard Closes Abruptly via Hardware Back Button**: `visualViewport` listener detects height expansion and resets editor container geometry cleanly without orphaned bottom margin.
- **Long-Press Initiated but User Starts Scrolling**: Pointer movement > 10px before the 450ms threshold cancels the long-press timer and yields smoothly to native touch scrolling.
- **Screen Reader Focus Enters Empty Grouped Table**: Group header announces group title, count (0 items), and collapsed/expanded state without throwing DOM focus exceptions.

### Concurrent Operations
- External vault note updates while mobile bottom sheet is open update background row counts and live status announcements without dismissing the active bottom sheet or losing form focus.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|---|---|---|
| Scope | 10/25 | Touch target expansion, mobile bottom sheets, visualViewport tracking, WAI-ARIA grid, tablist, live regions, embed keyboard grid, and interaction scopes |
| Risk | 5/25 | Presentation, DOM accessibility attributes, and CSS styling; data engine, formula parsing, and note storage untouched |
| Research | 6/20 | Exhaustive target citations and mobile/a11y audits established across both research tracks |
| **Total** | **21/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Touch Target Expansion Technique**: Adopt CSS pseudo-element expansion (`::before { inset: -8px; }`) scoped to `@media (pointer: coarse)` to preserve compact desktop information density while guaranteeing 44×44px touch envelopes.
- **Mobile Bottom Sheet Dismissal**: Verify that Phase 003's top "Done / Cancel" buttons, backdrop scrim tap, and downward swipe gesture (> 80px drag delta) remain supported.
- **Keyboard Navigation in Embeds**: Arrow keys navigate the 2D grid within the embedded codeblock; pressing `Escape` or `Tab` on the boundary cell releases focus cleanly to Obsidian's note editor.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../007-micro-interactions/spec.md`](../007-micro-interactions/spec.md)
- **Research Synthesis**: `specs/public/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 10 (Devin Track)**: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-10.md`
- **Research Iteration 10 (Codex Track)**: `specs/public/002-ui-improvement-research/research/codex-luna/iteration-10.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
