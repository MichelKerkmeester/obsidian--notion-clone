---
title: "Feature Specification: Views Parity, Polish and Per-View Affordances"
description: "Comprehensive non-table view modernization: universal object peek and record detail parity across Board, Gallery, and List, true horizontal Kanban swimlanes for 2D grouping, multi-source gallery cover engine with markdown embed fallback, sleek List row geometry with right-aligned columnar metadata, Calendar workday auto-scroll with live time ruler, collapsible unscheduled notes backlog tray, accessible calendar overflow dialog, month multi-day drag creation, timeline canvas gesture zoom, board column management menus, and consolidated CardFieldRenderer."
trigger_phrases:
  - "views parity polish"
  - "board kanban swimlanes"
  - "gallery cover preview"
  - "calendar workday autoscroll"
  - "list view metadata alignment"
  - "card field renderer"
  - "unscheduled notes tray"
  - "universal object peek"
  - "timeline canvas zoom"
  - "board column collapsing"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/006-views-parity-polish"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled views parity and polish feature specification"
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
# Feature Specification: Views Parity, Polish and Per-View Affordances

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `005-design-tokens-typography`, successor `007-micro-interactions`.

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
While the Table view provides the tabular foundation for high-density record management, the Note Database plugin's non-table views (**Board**, **Gallery**, **Calendar**, **Timeline**, and **List**) suffer from acute cross-view feature disparities, layout fragmentation, duplicated rendering logic, and missing per-view affordances:
1. **Jarring Inspection Disconnect Across Views (`src/views/DatabaseView.ts:615, 646, 674`, `src/views/BoardRenderer.ts:598-607`, `src/views/GalleryRenderer.ts:197-205`, `src/views/ListRenderer.ts:176-185`, `src/views/CalendarRenderer.ts:1398-1407`)**: Clicking an event in Calendar or Timeline opens an interactive in-context `RecordDetailPanel` with rich property editing (`DatabaseView.ts:358, 388`). In stark contrast, clicking a card in Board, a tile in Gallery, or an item in List abruptly navigates away to the raw note markdown file (`dataSource.openNote`), completely destroying database filter context, scroll position, and workflow continuity.
2. **Broken 2D Kanban Subgrouping Layout (`src/views/BoardRenderer.ts:353-359, 377-430`, `styles.css:7211-7235`)**: When secondary grouping (`boardSubgroupField`) is active, `BoardRenderer` renders subgroups as vertically stacked mini-boxes *nested inside each individual column*. Because column item counts vary, subgroup dividers in adjacent columns desynchronize vertically, completely breaking horizontal row continuity. Modern Kanban (AppFlowy, Notion) renders **true horizontal swimlanes** spanning across all status columns.
3. **Rigid Gallery Cover Resolution Ignoring Markdown Body Embeds (`src/data/CoverImage.ts:52-61`, `src/views/GalleryRenderer.ts:442-475`)**: `resolveCoverImage` only reads explicit frontmatter keys (`row.frontmatter[config.galleryImageField]`). Notes containing embedded images in their markdown body (`![[image.png]]` or `![](https://...)`) render as blank gray boxes (`.db-gallery-cover.is-empty`) unless frontmatter is manually maintained.
4. **Bulky Boxed List Rows with Drifting Metadata Chips (`src/views/ListRenderer.ts:191-250`, `styles.css:8161-8270`)**: List items render as standalone bordered cards with metadata chips trailing immediately after variable-length title strings. Status badges, dates, and relations drift erratically across rows instead of aligning into clean columnar tracks along the right margin.
5. **Calendar Time Grids Default to Midnight Scrolling; Existing Live Time Ruler Needs Polish (`src/views/CalendarRenderer.ts:418-475, 717, 1209-1227`, `styles.css:12700-13100`)**: Week and Day views do not auto-scroll to the workday, forcing users to scroll past 8–14 hours of empty early morning slots. The live current-time ruler already mounts through `renderCurrentTimeLine`; the remaining work is to polish that existing line while adding the missing workday auto-scroll. `CalendarRenderer.ts` currently contains no `scrollTop` or `scrollTo` implementation.
6. **Undated Backlog Records Omitted in Temporal Views (`src/data/CalendarTimelineModel.ts:764-822`, `styles.css` new calendar-drawer rule block)**: Records lacking date fields are silently omitted from Calendar and Timeline views. Users have no collapsible "Unscheduled Notes" backlog drawer to drag undated items onto calendar slots.
7. **500+ Lines of Duplicated Field Rendering Logic (`src/views/BoardRenderer.ts:983-1120`, `src/views/GalleryRenderer.ts:510-630`, `src/views/ListRenderer.ts:290-410`, `src/views/RecordDetailPanel.ts:272-350`)**: Four separate renderers maintain copy-pasted implementations for rendering select tags, status pills, relation links, dates, ratings, and checkboxes, causing cross-view bug drift and rendering inconsistencies.
8. **Hidden Affordances & Mouse-Only Gestures**: Phase 006 owns the Board column-header surface at `BoardRenderer.ts:311-351`; Board column headers lack `...` management menus, active grouping columns clutter card bodies redundantly (`BoardRenderer.ts:611-656`), Gallery card sizing requires raw pixel sliders without discrete presets (`GalleryRenderer.ts:93, 104`), Calendar scheduled `+N` overflow text is not keyboard focusable (`CalendarRenderer.ts:255-300`), and Timeline scale switching lacks canvas wheel/pinch zoom (`CalendarTimelineRenderer.ts:217-370`).

### Purpose
Establish full cross-view parity, layout polish, and per-view affordances across Board, Gallery, Calendar, Timeline, and List views inspired by **Anytype**, **AppFlowy**, and **Notion**:
- Deliver **Universal Object Peek / Record Detail Parity** allowing side peek, center modal, and sheet inspection across all views.
- Implement **True Horizontal Kanban Swimlanes** spanning across primary status columns.
- Upgrade the **Multi-Source Gallery Cover Engine** to automatically fall back to note body markdown embeds (`![[image.png]]`).
- Redesign **List View Row Geometry** into sleek divider-separated rows with right-aligned columnar metadata.
- Auto-scroll Calendar time grids to the **workday start hour** and polish the **existing live current-time ruler line**.
- Add a collapsible **Unscheduled Notes Backlog Drawer** to Calendar and Timeline views.
- Consolidate duplicated preview logic into a unified, tested **`CardFieldRenderer`** module.
- Provide per-view polish: slim vertical Kanban column collapsing, gallery aspect ratio presets, accessible `+N` calendar overflow dialog, month multi-day drag creation, timeline wheel zoom, and cross-view keyboard navigation.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Universal Object Detail / Peek Parity Across All Views**: Wire `openRecordDetail` to card/row click handlers across Board (`src/views/BoardRenderer.ts:598-607`), Gallery (`src/views/GalleryRenderer.ts:197-205, 453-470`), and List (`src/views/ListRenderer.ts:176-185`) views via `DatabaseView.ts:615, 646, 674`, providing consistent in-context property editing, side peek, and modal inspection.
- **Hide Empty Properties Accordion in Record Detail**: At `RecordDetailPanel.ts:187-215`, retain the default behavior that skips empty fields when `showEmptyFields !== true` (`:192-193`) while exposing the skipped count through a collapsed `N empty properties` accordion styled by `styles.css:7604-7635`.
- **True Horizontal Kanban Swimlanes**: Refactor secondary grouping in `src/views/BoardRenderer.ts:353-359, 377-430` and `styles.css:7211-7235` from nested vertical column blocks to full-width horizontal swimlane rows spanning across all primary columns with synchronized vertical row baselines, collapsible swimlane headers, card counts, and cross-lane drag reordering.
- **Multi-Source Gallery Card Preview Engine**: Expand `resolveCoverImage` in `src/data/CoverImage.ts:52-61` and `src/views/GalleryRenderer.ts:442-475` to support automatic fallback resolution to the first embedded markdown image (`app.metadataCache.getFileCache()?.embeds` or `![[image.png]]`) when no frontmatter cover property is defined.
- **Sleek List View Row Geometry with Right-Aligned Columnar Metadata**: Redesign `.db-list-row` in `src/views/ListRenderer.ts:191-250` and `styles.css:5435` into clean, borderless rows separated by subtle dividers, aligning `.db-list-row-meta` into structured, vertically aligned columns along the right margin with responsive wrapping.
- **Calendar Time Grid Workday Auto-Scroll & Existing Live Time Ruler Polish**: Add missing Week and Day time-grid auto-scroll at the render mount points (`src/views/CalendarRenderer.ts:418-475`; there is currently no `scrollTop` or `scrollTo` in the file) using `config.calendarStartHour` (default 08:00) or current time minus 1 hour, and polish the existing dynamic current-time ruler call and implementation (`src/views/CalendarRenderer.ts:717, 1209-1227`; `styles.css:12700-13100`).
- **Consolidated Card & Row Field Renderer (`CardFieldRenderer`)**: Create `src/views/CardFieldRenderer.ts` and replace 500+ lines of duplicate value rendering across `BoardRenderer.ts:983-1120`, `GalleryRenderer.ts:510-630`, `ListRenderer.ts:290-410`, and `RecordDetailPanel.ts:272-350` with a unified, shared component supporting select pills, status colors, relation badges with resolved/unresolved default icons, dates, tabular numbers, rating stars, progress tracks, and checkboxes; rich target record icons from frontmatter metadata are deferred.
- **Hide Redundant Active Grouping Field from Board Cards**: Omit the active grouping column from card property lists in `src/views/BoardRenderer.ts:611-656` and `styles.css:7405-7484` when the card is already situated within that column lane.
- **Disclose Data Mutation on Cross-Lane Board Drag & Mobile Move Menu**: Render explicit visual target feedback ("Changes [Field] to [Value]") during cross-lane card dragging (`src/views/BoardRenderer.ts:524-575, 866-894`, `src/data/BoardContainerDrop.ts:82-94`, `styles.css:7303-7315`) and in the mobile board move menu (`:735-802`).
- **Slim Vertical Kanban Column Collapsing**: Phase 006 owns the Board column-header surface at `src/views/BoardRenderer.ts:311-351`; Phase 001 consumes and verifies this surface only. Render collapsed board columns as slim 38px vertical rails with rotated vertical writing mode title and card count badge (`styles.css:7066-7080`).
- **Standard Gallery Card Size Presets and Aspect Ratio Controls**: Add discrete card size buttons (Small 180px, Medium 260px, Large 360px) and aspect ratio presets (1:1 Square, 16:9 Banner, 3:4 Portrait, 4:3 Default) in `src/views/GalleryRenderer.ts:93, 104`, `src/views/ViewConfigPanelRenderer.ts:1707-1717`, and `styles.css:7744-7751, 7866-7874`.
- **Collapsible Unscheduled Notes Backlog Drawer in Calendar and Timeline**: Add a collapsible side/bottom backlog tray at the Calendar and Timeline render entry points (`src/views/CalendarRenderer.ts:80-98`, `src/views/CalendarTimelineRenderer.ts:217-230`) using the undated-row filtering path in `src/data/CalendarTimelineModel.ts:764-822` and a new calendar-drawer rule block in `styles.css` (no existing line range), with drag-and-drop placement onto calendar day cells or timeline lanes.
- **Accessible Scheduled Calendar `+N` Overflow Button & Dialog**: Upgrade `+N` overflow indicators into keyboard-focusable button triggers in `src/views/CalendarRenderer.ts:255-300, 600-632` and `styles.css:13236-13246` opening an accessible day event popover.
- **Calendar Setup Preview Card for Event Field Mapping**: Render a read-only live preview card in the Calendar configuration panel (`src/views/CalendarToolbarRenderer.ts:127-176`, `src/data/CalendarTimelineModel.ts:764-837`) mapping start date, end date, title, and color.
- **Month View Multi-Day Pointer Drag-to-Create Gesture**: Add pointer drag tracking across day cells in Month view (`src/views/CalendarRenderer.ts:154-197`, `src/data/CalendarInteractionModel.ts:1-50`) to select a date range and open `createEntryForDate` with start/end date defaults.
- **Timeline Canvas Wheel Zoom & Touch Gesture Time Scale Switching**: Bind `wheel` (with `Ctrl`/`Cmd`) and trackpad pinch gestures on the Timeline canvas (`src/views/CalendarTimelineRenderer.ts:217-370, 701-770`) to smoothly transition between Day, Week, Month, Quarter, and Year scales.
- **Board Column Header Management Options Menu**: Phase 006 owns the Board column-header surface at `src/views/BoardRenderer.ts:311-351`; Phase 001 consumes and verifies this surface only. Add a `...` icon button to board column headers and `styles.css:7085-7110` with options to sort cards in-column, set WIP card limits with warning badges, color group, or hide column.
- **Distinct Record Hit Region vs Media Cover / Field Actions**: Clarify card activation contracts across Board, Gallery, and List (`src/views/BoardRenderer.ts:494-507, 589-607, 659-696`, `src/views/GalleryRenderer.ts:163-205, 442-474`, `src/views/ListRenderer.ts:153-185`, `styles.css:7283-7297, 7804-7845, 8161-8180`) dedicating title/card body to record activation while isolating media previews and inline field edits.
- **Compact Group-Header `+ New` Affordance in Gallery & List**: Add a compact `+ New` button directly inside Gallery and List group headers (`src/views/BoardRenderer.ts:361-374, 416-428`, `src/views/GalleryRenderer.ts:108-135`, `src/views/ListRenderer.ts:94-126`, `styles.css:5102-5109`).
- **Cross-View Keyboard Navigation & Roving Focus**: Implement arrow-key navigation, Space/X selection, Enter peek activation, and quick creation across Board, Gallery, List, and Calendar (`src/views/BoardRenderer.ts:483-585`, `src/views/GalleryRenderer.ts:97-98`, `src/views/ListRenderer.ts:90-91`, `src/views/CalendarRenderer.ts:154-197`).

### Out of Scope
- Empty and first-run onboarding states (Phase 001: `001-empty-and-first-run-states`).
- Table grid single-header refactor, trailing add column, and calculation tfoot (Phase 002: `002-table-grid-experience`).
- Floating overlay stack lifecycle, bottom sheets, and color/icon pickers (Phase 003: `003-popovers-menus-elevation`).
- 4-cluster toolbar reorganization and WAI-ARIA tablist view switcher (Phase 004: `004-toolbar-and-view-controls`).
- Design token system, typography scale, and dark-mode tag calibration (Phase 005: `005-design-tokens-typography`).
- Drag ghosts, selection bounding box, and fill handle (Phase 007: `007-micro-interactions`).
- Mobile touch hit envelopes and ARIA landmark roles (Phase 008: `008-mobile-and-accessibility`).
- `RelationInverse.inboundByPath` backlinks accordion — deferred because this phase's record-detail pass does not add backlink data loading or synchronization.
- Document Outline TOC from `row.cache?.headings` — deferred because outline navigation is a separate document-metadata surface.
- Boolean switches in Record Detail — deferred because this pass consolidates field presentation without expanding editor control contracts.
- `NumberDisplayConfig` currency/precision expansion — deferred because it requires a separate numeric display configuration contract.
- Writing note frontmatter or markdown bodies on view render, telemetry, or desktop-only APIs (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `src/views/CardFieldRenderer.ts` | Create | Consolidated preview and badge value rendering for Board, Gallery, List, and Record Detail |
| `src/views/CardFieldRenderer.test.ts` | Create | Unit tests for shared card field rendering, badge wrapping, and tabular numbers |
| `src/data/CoverImage.test.ts` | Create | Unit tests for multi-source cover image parsing with markdown body embed fallback |
| `src/views/BoardRenderer.ts` | Edit | Horizontal swimlanes (`:353-359, 377-430`), column collapse (`:312-351`), mutation disclosure (`:524-575, 735-802, 866-894`), openRow peek parity (`:598-607`), hide active grouping field (`:611-656`), column options menu (`:311-350`), and CardFieldRenderer integration (`:983-1120`) |
| `src/views/GalleryRenderer.ts` | Edit | OpenRow peek parity (`:197-205, 453-470`), card size presets & aspect ratio controls (`:93, 104`), group header `+ New` (`:108-135`), cover preview hit region (`:442-474`), and CardFieldRenderer integration (`:510-630`) |
| `src/views/ListRenderer.ts` | Edit | OpenRow peek parity (`:176-185`), sleek row divider geometry (`:191-250`), right-aligned columnar metadata (`:230-250`), group header `+ New` (`:94-126`), read-first title click (`:195-225`), and CardFieldRenderer integration (`:290-410, 470-529`) |
| `src/views/CalendarRenderer.ts` | Edit | Workday auto-scroll (`:418-475`), polish existing live time ruler (`:717, 1209-1227`), multi-day drag creation (`:154-197`), unscheduled notes backlog tray at the render entry point (`:80-98`), accessible `+N` overflow button (`:255-300, 600-632`), and touch create affordance (`:500-559, 1804-1821`) |
| `src/views/CalendarTimelineRenderer.ts` | Edit | Timeline canvas wheel/pinch zoom (`:217-370, 701-770`) and unscheduled notes backlog tray integration at the render entry point (`:217-230`) |
| `src/data/CalendarTimelineModel.ts` | Edit | Expose the undated-row filtering path for backlog collection (`:764-822`) |
| `src/views/CalendarToolbarRenderer.ts` | Edit | Read-only calendar setup preview card mapping start, end, title, and color (`:127-176`) |
| `src/views/RecordDetailPanel.ts` | Edit | Delegate field rendering to `CardFieldRenderer` (`:222-270, 272-350`) and add the collapsed empty-properties accordion (`:187-215`) |
| `src/views/DatabaseView.ts` | Edit | Wire universal peek/detail callbacks for Board, Gallery, and List views (`:614-674`) and preserve grouping state transparency (`:2450-2522, 9721-9751`) |
| `src/views/ViewConfigPanelRenderer.ts` | Edit | Gallery aspect ratio buttons, card size presets, and board swimlane configuration (`:1641-1771`) |
| `src/data/CoverImage.ts` | Edit | Fallback resolution to note body embedded images via `app.metadataCache.getFileCache()?.embeds` (`:52-61`) |
| `src/data/types.ts` | Edit | Extend ViewConfig with gallery aspect ratio presets, board swimlane options, and calendar workday start settings |
| `src/i18n.ts` | Edit | Localized strings for swimlanes, unscheduled backlog, gallery presets, time ruler, and column menus |
| `styles.css` | Edit | Kanban swimlanes (`:7211-7235`), column rail collapse (`:7066-7080`), mutation badges (`:7303-7315`), gallery aspect presets (`:7744-7751, 7866-7874`), list divider geometry & right metadata (`:8161-8270, 8287-8337`), calendar time ruler (`:12700-13100`), a new calendar-drawer rule block (no existing line range), calendar overflow popover (`:13202-13246`), and empty-properties accordion (`:7604-7635`) |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | Universal Object Peek & Record Detail Parity across Board, Gallery, and List | In `DatabaseView.ts:614-674`, `BoardRenderer.ts:598-607`, `GalleryRenderer.ts:197-205, 453-470`, and `ListRenderer.ts:176-185`, clicking record cards, tiles, or rows opens `RecordDetailPanel` (or configured peek mode) in-context rather than immediately navigating away to raw note files, preserving active filters and scroll position. |
| REQ-002 | True Horizontal Kanban Swimlanes for 2D Grouping | In `BoardRenderer.ts:353-359, 377-430` and `styles.css:7211-7235`, when secondary grouping (`boardSubgroupField`) is active, render full-width horizontal swimlane rows spanning across all primary columns with synchronized vertical row baselines, collapsible headers, card counts, and cross-lane drag reordering. |
| REQ-003 | Multi-Source Gallery Card Preview Engine with Markdown Embed Fallback | In `src/data/CoverImage.ts:52-61` and `GalleryRenderer.ts:442-475`, expand `resolveCoverImage` to automatically scan `app.metadataCache.getFileCache()?.embeds` for the first embedded markdown image (`![[image.png]]` or `![](url)`) when no frontmatter cover property is defined, eliminating blank card previews. |
| REQ-004 | Sleek List View Row Geometry & Right-Aligned Columnar Metadata | In `ListRenderer.ts:191-250` and `styles.css:102`, replace bulky boxed cards with borderless rows separated by subtle dividers (`--db-border-subtle`), and align `.db-list-row-meta` into structured, vertically aligned columns along the right margin with responsive wrapping. |
| REQ-005 | Calendar Time Grid Workday Auto-Scroll & Existing Live Current-Time Ruler Polish | In `CalendarRenderer.ts:418-475` and `styles.css:12700-13100`, add the missing Week and Day time-grid auto-scroll to `config.calendarStartHour` (default 08:00) or current time minus 1 hour; polish the existing ruler call and implementation at `CalendarRenderer.ts:717, 1209-1227` without recreating it. |
| REQ-006 | Consolidated Card & Row Field Renderer (`CardFieldRenderer`) | Create `src/views/CardFieldRenderer.ts` and deduplicate 500+ lines of value rendering across `BoardRenderer.ts:983-1120`, `GalleryRenderer.ts:510-630`, `ListRenderer.ts:290-410`, and `RecordDetailPanel.ts:272-350`, unifying select tags, status colors, relation badges with resolved/unresolved default icons, tabular numbers, rating stars, and progress tracks; rich target record icons from frontmatter metadata are deferred. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | Hide Redundant Active Grouping Field from Board Card Bodies | In `BoardRenderer.ts:611-656` and `styles.css:7405-7484`, omit the active grouping column from card property lists when the card is already situated inside that group column. |
| REQ-008 | Disclose Data Mutation on Cross-Lane Board Drag & Mobile Move Menu | In `BoardRenderer.ts:524-575, 735-802, 866-894` and `styles.css:7303-7315`, render visual target feedback ("Changes [Field] to [Value]") during cross-lane card dragging and in the mobile move menu before committing property changes. |
| REQ-009 | Slim Vertical Kanban Column Collapsing | Phase 006 owns the Board column-header surface at `BoardRenderer.ts:311-351`; Phase 001 consumes and verifies this surface only. In `styles.css:7066-7080`, render collapsed board columns as slim 38px vertical rails with rotated vertical writing mode title and card count badge. |
| REQ-010 | Standard Gallery Card Size Presets and Aspect Ratio Controls | In `GalleryRenderer.ts:93, 104`, `ViewConfigPanelRenderer.ts:1707-1717`, and `styles.css:7744-7751, 7866-7874`, provide discrete card size buttons (Small 180px, Medium 260px, Large 360px) and aspect ratio presets (1:1 Square, 16:9 Banner, 3:4 Portrait, 4:3 Default). |
| REQ-011 | Collapsible Unscheduled Notes Backlog Drawer in Calendar and Timeline | In the Calendar and Timeline render entry points (`CalendarRenderer.ts:80-98`, `CalendarTimelineRenderer.ts:217-230`), collect rows omitted by the undated-row filtering path (`CalendarTimelineModel.ts:764-822`) and provide a collapsible backlog tray styled by a new calendar-drawer rule block in `styles.css` (no existing line range) with drag-and-drop placement onto calendar days or timeline lanes. |
| REQ-012 | Accessible Scheduled Calendar `+N` Overflow Button & Dialog | In `CalendarRenderer.ts:255-300, 600-632` and `styles.css:13236-13246`, upgrade `+N` overflow indicators into keyboard-focusable button triggers opening an accessible day event popover. |
| REQ-013 | Calendar Setup Preview Card for Event Field Mapping | In `CalendarToolbarRenderer.ts:127-176` and `CalendarTimelineModel.ts:764-837`, render a read-only live preview card in the Calendar settings panel mapping start date, end date, title, and color to sample event cards. |
| REQ-014 | Month View Multi-Day Pointer Drag-to-Create Gesture | In `CalendarRenderer.ts:154-197` and `CalendarInteractionModel.ts:1-50`, implement pointer drag tracking across day cells in Month view to select a date range and trigger `createEntryForDate` with start/end date defaults. |
| REQ-015 | Timeline Canvas Wheel Zoom & Touch Gesture Time Scale Switching | In `CalendarTimelineRenderer.ts:217-370, 701-770`, bind `wheel` (with `Ctrl`/`Cmd`) and trackpad pinch gestures on the Timeline canvas to smoothly transition between Day, Week, Month, Quarter, and Year scales. |
| REQ-016 | Board Column Header Management Options Menu | Phase 006 owns the Board column-header surface at `BoardRenderer.ts:311-351`; Phase 001 consumes and verifies this surface only. In `styles.css:7085-7110`, add a `...` icon button to board column headers opening a menu to sort cards in-column, set WIP card limits with warning badges, color group, or hide column. |
| REQ-017 | Distinct Record Hit Region vs Media Cover / Field Actions | In `BoardRenderer.ts:494-507, 589-607, 659-696`, `GalleryRenderer.ts:163-205, 442-474`, and `ListRenderer.ts:153-185`, dedicate title and card body to record activation while isolating media previews (`Preview cover` action) and inline field edits. |
| REQ-018 | Compact Group-Header `+ New` Affordance in Gallery and List | In `BoardRenderer.ts:361-374, 416-428`, `GalleryRenderer.ts:108-135`, and `ListRenderer.ts:94-126`, render a compact `+ New` button directly inside group headers pre-filling the active group property. |
| REQ-019 | Cross-View Keyboard Navigation & Roving Focus | In `BoardRenderer.ts:483-585`, `GalleryRenderer.ts:97-98`, `ListRenderer.ts:90-91`, and `CalendarRenderer.ts:154-197`, implement arrow-key navigation, Space/X selection, Enter peek activation, and quick creation across non-table views. |
| REQ-020 | Hide Empty Properties Accordion in Record Detail | When `showEmptyFields !== true` skips empty fields at `RecordDetailPanel.ts:187-193`, render a collapsed `N empty properties` accordion within `RecordDetailPanel.ts:187-215`; expanding it reveals the skipped fields, with the presentation styled at `styles.css:7604-7635` and no change to the default collapsed state. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Clicking any card in Board, tile in Gallery, or row in List opens the in-context `RecordDetailPanel` inspector without navigating away or losing view state.
- **SC-002**: Secondary grouping on Board view renders continuous horizontal swimlanes spanning across all columns with synchronized vertical baselines.
- **SC-003**: Gallery cards for notes lacking frontmatter cover properties automatically display cover images from body markdown embeds (`![[image.png]]`).
- **SC-004**: List view renders as sleek divider-separated rows with property metadata cleanly aligned in vertical columns along the right margin.
- **SC-005**: Calendar Week and Day views auto-scroll to the active workday start hour on mount and keep the existing live red current-time ruler line aligned and polished.
- **SC-006**: Undated notes appear in the collapsible Calendar/Timeline backlog tray and can be dragged directly onto calendar dates or timeline tracks.
- **SC-007**: Duplicate field rendering code across Board, Gallery, List, and Detail is consolidated into `CardFieldRenderer.ts` with 100% unit test coverage.
- **SC-008**: Collapsing a board column reduces its width to a slim 38px vertical rail with rotated vertical text.
- **SC-009**: Gallery view settings offer 1-click aspect ratio presets (1:1, 16:9, 3:4, 4:3) and discrete card size buttons (Small, Medium, Large).
- **SC-010**: Calendar scheduled `+N` overflow is keyboard focusable and opens an accessible floating day event dialog.
- **SC-011**: Dragging across multiple days on the calendar month grid triggers date range creation.
- **SC-012**: Ctrl/Cmd + wheel scrolling on the timeline canvas smoothly zooms across time scales (Day, Week, Month, Quarter, Year).
- **SC-013**: Display-only rendering verified: zero writes to note frontmatter or bodies occur when rendering non-table views, swimlanes, or inspect panels (iCloud-safe).
- **SC-014**: Record Detail collapses skipped empty fields into an `N empty properties` accordion by default and reveals them only when expanded.

### Acceptance Scenarios

- **Scenario 1**: **Given** a Board view with cards, **when** the user clicks on a card body, **then** the in-context `RecordDetailPanel` opens displaying properties without navigating away from the board.
- **Scenario 2**: **Given** a Board grouped by "Status" and subgrouped by "Priority", **when** viewing the board, **then** "High Priority" renders as a continuous horizontal swimlane across "To Do", "In Progress", and "Done" columns.
- **Scenario 3**: **Given** a note with an embedded image `![[mockup.png]]` but no frontmatter cover property, **when** viewing the Gallery, **then** the card renders `mockup.png` as its cover preview image.
- **Scenario 4**: **Given** a List view with 10 items, **when** inspecting the rows, **then** all status pills, dates, and assignees are vertically aligned along the right edge regardless of title text length.
- **Scenario 5**: **Given** it is 14:30 on Wednesday, **when** opening the Calendar Week view, **then** the grid auto-scrolls so 13:30–18:00 is visible and a red line indicates 14:30 on Wednesday's column.
- **Scenario 6**: **Given** a task note with no date, **when** opening Calendar view, **then** the task appears in the "Unscheduled Notes" backlog tray; dragging it to Friday sets Friday's date on the note.
- **Scenario 7**: **Given** a Gallery view, **when** the user clicks the "16:9" aspect ratio button in view settings, **then** all gallery cards instantly adjust to a 16:9 widescreen cover ratio.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | Horizontal swimlane refactor breaks card drag-and-drop between columns and subgroups | Cards cannot be moved across lanes | Retain `subgroupKey` and `groupKey` in data transfer MIME payloads; reuse `resolveBoardContainerDropOrder` with 2D coordinate detection |
| Risk | Markdown body embed parsing causes I/O lag on large vaults in Gallery view | Stutter during gallery rendering | Query cached metadata via `app.metadataCache.getFileCache(file)?.embeds` (in-memory cache) rather than reading note disk files |
| Risk | Calendar workday auto-scroll conflicts with user scroll position | Unwanted scroll jumps during auto-refresh | Only auto-scroll on initial view mount or date change; preserve `scrollTop` during incremental row updates |
| Risk | Unscheduled notes backlog tray overflows viewport on small screens | Occludes calendar grid | Implement as a collapsible bottom drawer on mobile and a collapsible right sidebar on desktop |
| Dependency | `src/views/RecordDetailPanel.ts` | Inspection substrate | Reuses existing `openRecordDetailPanel` architecture for universal peek parity |
| Dependency | `src/data/CoverImage.ts` | Cover resolution engine | Extends pure helper functions without breaking existing frontmatter cover parsing |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 08) | Target citations and backlog mapping | Requirements trace directly to synthesis Ranked Rec #4, Quick Win #11, and Other Views Backlog items |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: `CardFieldRenderer` executes in < 1ms per field; gallery embed extraction uses in-memory `metadataCache` with zero disk I/O.
- **NFR-P02**: Horizontal Kanban swimlane layout renders 60fps scrolling with up to 500 cards via shared DOM container fragments.
- **NFR-P03**: Timeline wheel zoom smoothly transitions time scales with debounced re-renders (< 16ms frame budget).

### Security
- **NFR-S01**: Zero external network requests, CDNs, telemetry, or remote dependencies; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: rendering non-table views, swimlanes, cover embeds, and inspectors produces 0 unintended writes to note frontmatter or bodies.
- **NFR-R02**: Mobile-safe: Kanban swimlanes fall back gracefully to single-column swipe layouts on phone viewports; touch hit targets span at least 44×44px.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Board with 0 cards in a swimlane**: The empty swimlane cell renders a subtle dashed drop slot allowing cards to be dropped into that empty status/priority intersection.
- **Note with multiple embedded images**: `resolveCoverImage` picks the first valid image embed from `cache.embeds` matching an image extension.
- **Note with non-image markdown embeds (e.g. `![[other-note]]`)**: Non-image embeds are skipped gracefully until an image embed is found or fallback is triggered.
- **Calendar events crossing midnight / multi-day spans**: Week/Day views render multi-day events in the pinned all-day header strip above the time grid.
- **List view with 20 visible metadata columns**: On narrow screens, metadata columns wrap gracefully into a secondary metadata row rather than overflowing horizontally.

### Error Scenarios
- **Deleted cover image link**: If an embedded image link cannot be resolved in the vault, `resolveCoverImage` returns null and renders a clean, non-actionable empty cover placeholder.
- **Calendar date parse error**: Records with malformed date strings are safely gathered into the "Unscheduled Notes" backlog tray with an invalid date indicator.
- **Read-only database mode**: Drag-and-drop handles, in-column create buttons, and column options menus are hidden; peek inspection remains active in read-only mode.

### Concurrent Operations
- Rapidly switching between Board, Gallery, Calendar, and List views cleanly cancels in-flight timers (such as `currentTimeTimer`) without memory leaks or duplicate DOM roots.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|---|---|---|
| Scope | 10/25 | Universal peek parity, Kanban swimlanes, multi-source cover engine, List row geometry, and Calendar time grid polish |
| Risk | 5/25 | Presentation-layer and view renderers only; database storage, formula evaluation, and query pipeline untouched |
| Research | 6/20 | Exhaustive target citations and cross-view audits established across both research tracks |
| **Total** | **21/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Default Card Activation Mode**: In-context `RecordDetailPanel` (Side Peek / Popover) is adopted as the primary default across all views; users can hold `Alt`/`Option` or click the open icon to open the note directly in a workspace leaf.
- **Swimlane Mobile Fallback**: On phone viewports (`.is-phone`), Board view collapses 2D swimlanes to a primary column swipe view with a subgroup picker chip to maintain usability on narrow screens.
- **Gallery Body Embed Scanning**: Relying on `app.metadataCache.getFileCache()?.embeds` is adopted to ensure zero disk I/O and instant gallery rendering.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../005-design-tokens-typography/spec.md`](../005-design-tokens-typography/spec.md)
- **Research Synthesis**: `specs/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 06 (Devin Track)**: `specs/002-ui-improvement-research/research/devin-gemini/iteration-06.md`
- **Research Iteration 08 (Devin Track)**: `specs/002-ui-improvement-research/research/devin-gemini/iteration-08.md`
- **Research Iteration 08 (Codex Track)**: `specs/002-ui-improvement-research/research/codex-luna/iteration-08.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
