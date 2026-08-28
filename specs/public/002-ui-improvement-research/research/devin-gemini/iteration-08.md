# Research Iteration 08: Views Beyond Table: Board, Gallery, Calendar, List — Parity, Polish, and Per-View Affordances

Track: `devin-gemini` (Gemini 3.7 Flash High)  
Focus Area: Views beyond table: board, gallery, calendar, list — parity, polish, per-view affordances.  
Target Artifact: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-08.md`  

---

## Focus

While the Table view provides the tabular foundation for high-density record management, the true power of an agile database system lies in its alternative view projections: **Board (Kanban)** for visual workflow management, **Gallery** for media and asset-centric browsing, **Calendar & Timeline** for temporal planning and milestone tracking, and **List** for streamlined, minimalist reading and agenda tracking.

In this iteration, we conduct an exhaustive, cross-view audit of the plugin's non-table views across TypeScript renderers (`src/views/BoardRenderer.ts`, `src/views/GalleryRenderer.ts`, `src/views/CalendarRenderer.ts`, `src/views/CalendarTimelineRenderer.ts`, `src/views/ListRenderer.ts`, `src/views/GroupLabelRenderer.ts`, `src/views/GroupExpandControls.ts`, `src/views/FileFieldRenderer.ts`, `src/views/RecordDetailPanel.ts`, `src/views/ViewConfigPanelRenderer.ts`, `src/views/DatabaseView.ts`), data processors (`src/data/CoverImage.ts`, `src/data/CoverWiring.ts`, `src/data/CalendarLayoutModel.ts`, `src/data/CalendarTimelineModel.ts`, `src/data/MultiFieldGrouping.ts`, `src/data/TableSubgroupPicker.ts`), and `styles.css`.

We evaluate each view along three dimensions:
1. **Cross-View Feature Parity**: Ensuring features present in Table or Calendar (record peek drawers, calculation rollups, inline interactive editing, keyboard navigation, multi-select, and conditional formatting) operate uniformly across Board, Gallery, and List.
2. **Visual & Structural Polish**: Eliminating awkward layouts (such as vertically stacked subgroups in Kanban columns, bulky boxed list rows, unaligned metadata chips, and un-scrolled midnight calendar grids).
3. **Per-View Affordances**: Adding specialized, high-leverage interactions native to each view type (e.g., horizontal Kanban swimlanes, multi-source gallery cover previews, multi-day calendar drag creation, unscheduled notes backlog tray, and timeline canvas zoom).

We benchmark these findings against the mature implementations in **Anytype**, **AppFlowy**, and **Notion**, and formulate concrete, constraint-checked recommendations.

---

## Current-UI findings (file:line)

### 1. Board Subgroups Render as Vertically Stacked Blocks Instead of True Horizontal Swimlanes
- **Location**: `src/views/BoardRenderer.ts:353-359`, `src/views/BoardRenderer.ts:377-430`, `styles.css:7211-7235`
- **Issue**: In `BoardRenderer.ts:353-359`, when secondary grouping (`boardSubgroupField`) is active, the renderer creates `.db-board-subgroups` *inside* each individual column element (`.db-board-column > .db-board-subgroups > .db-board-subgroup`).
- **UX Impact**: Subgroups are rendered as nested mini-columns vertically stacked inside each primary column box. If Column A has 5 cards in "High Priority" and Column B has 1 card in "High Priority", the subgroup divider headers in Column A and Column B are completely desynchronized vertically. In modern Kanban (AppFlowy, Linear, Notion), 2D grouping renders **horizontal swimlanes** spanning across all columns. The current nested stacking completely breaks horizontal row continuity and makes multi-dimensional workflow tracking unreadable.

### 2. Missing Universal Object Peek / Record Detail Parity in Board, Gallery, and List Views
- **Location**: `src/views/DatabaseView.ts:615, 646, 672`, `src/views/BoardRenderer.ts:598-607`, `src/views/GalleryRenderer.ts:453-470`, `src/views/ListRenderer.ts:177-185`, `src/views/CalendarRenderer.ts:1398-1407`
- **Issue**: While Calendar and Timeline views wire `openRecordDetail: (anchorEl, row) => this.openRecordDetailPanel(anchorEl, row)` (`DatabaseView.ts:358, 388`), Board, Gallery, and List views are strictly bound to `openRow: (row) => this.dataSource.openNote(row.file)`.
- **UX Impact**: Clicking a card in Board, a tile in Gallery, or an item in List immediately navigates away from the database workspace and opens the note file in a new tab. Users cannot quickly inspect, edit properties, or preview note markdown side-by-side without losing their scroll position and filter context in the active view.

### 3. Gallery Cover Resolution Strictly Limited to Frontmatter Properties (Ignoring Note Body Embeds)
- **Location**: `src/data/CoverImage.ts:52-61`, `src/views/GalleryRenderer.ts:442-475`, `src/views/ViewConfigPanelRenderer.ts:1707-1717`
- **Issue**: `resolveCoverImage` strictly parses `row.frontmatter[config.galleryImageField]`. If a note contains embedded images in its markdown body (`![[image.png]]` or `![](https://...)`) but does not have a dedicated frontmatter property, `GalleryRenderer` renders an empty gray placeholder box (`.db-gallery-cover.is-empty`).
- **UX Impact**: Standard Obsidian notes with embedded screenshots, diagrams, or web clippings appear as blank cards in Gallery view unless the user manually copies the image path into note frontmatter. The plugin lacks Notion/AppFlowy's "Card Preview: Page Content / First Image" fallback.

### 4. Gallery Card Sizing Lacks Standard Responsive Presets and Aspect Ratio Ratios
- **Location**: `src/views/GalleryRenderer.ts:93, 104`, `src/views/ViewConfigPanelRenderer.ts:1710-1717`, `styles.css:7744-7751`, `styles.css:7866-7874`
- **Issue**: Gallery card sizing is managed via a continuous raw pixel slider (`galleryCardSize` 160–420px). Aspect ratio defaults to `0.75` (4:3) with no presets in `ViewConfigPanelRenderer` for standard aspect ratios:
  1. `1:1` (Square / Avatars / Albums)
  2. `16:9` (Wide Banner / Landscape)
  3. `3:4` (Portrait / Book Covers / Mobile Mockups)
  4. `Small` (~180px), `Medium` (~260px), `Large` (~360px) responsive discrete presets.
- **UX Impact**: Configuring gallery cards requires fiddly pixel slider adjustments. Images with portrait book covers or 16:9 banners are awkwardly cropped without easy aspect ratio switching.

### 5. List View Styled as Bulky Boxed Cards with Horizontally Drifting Metadata
- **Location**: `src/views/ListRenderer.ts:191-250`, `styles.css:8161-8270`
- **Issue**: Each item in `ListRenderer` renders with `class="db-list-row"`, which CSS styles as a standalone bordered box (`border: 1px solid var(--background-modifier-border); border-radius: var(--db-radius-lg); min-height: 44px; padding: 8px 10px; margin-bottom: 6px;`). Furthermore, `.db-list-row-meta` has `width: max-content;` positioned immediately after the title.
- **UX Impact**: The List view looks like a bulky, disjointed card stack rather than a sleek, high-density list. Because metadata chips trail the variable-length title text, status badges, dates, and assignees drift erratically left and right across different rows rather than aligning into crisp vertical columns along the right margin.

### 6. Calendar Week and Day Time Grids Default to Midnight Scrolling Without Live Time Ruler
- **Location**: `src/views/CalendarRenderer.ts:418-475, 715-770`, `styles.css:12700-13100`
- **Issue**: When switching to Week or Day scale in `CalendarRenderer`, the 24-hour time grid mounts with scroll position `scrollTop = 0` (displaying 00:00 to 06:00 midnight). Furthermore, while `currentTimeTimer` updates a timestamp variable, there is no red/accent "Current Time Indicator" horizontal line rendered across the active day columns.
- **UX Impact**: Users opening their calendar during working hours (e.g. 14:00) must manually scroll down through 14 hours of empty early-morning grid space every time they navigate to Week or Day view.

### 7. Calendar Month View Lacks Multi-Day Drag-to-Create Gesture
- **Location**: `src/views/CalendarRenderer.ts:154-197, 894-950`, `src/data/CalendarInteractionModel.ts:1-50`
- **Issue**: In `CalendarRenderer.ts`, month cells support single-click date selection to create an entry (`createEntryForDate`), and existing multi-day events have resize handles (`attachMonthResizeHandle`). However, dragging the mouse across multiple day cells on the month grid does not trigger multi-day selection or create an event spanning that date range.
- **UX Impact**: Scheduling a multi-day trip, sprint, or conference requires creating a 1-day event, opening the detail modal or dragging the resize handle, doubling the required interaction steps.

### 8. Calendar and Timeline Views Omit Undated Records (Missing "Unscheduled Notes" Backlog Tray)
- **Location**: `src/views/CalendarRenderer.ts:118-124`, `src/views/CalendarTimelineRenderer.ts:273`, `src/data/CalendarTimelineModel.ts:80-120`
- **Issue**: When constructing the calendar model (`buildCalendarMonthModel`) or timeline model, records that lack a date value in `config.calendarStartDateField` are completely filtered out. There is no collapsible "Unscheduled Notes" drawer or sidebar tray.
- **UX Impact**: Unscheduled tasks and backlog items vanish from temporal views. Users cannot triage their task backlog by dragging undated notes from a side tray directly onto calendar day slots or timeline lanes.

### 9. Timeline View Scale Switching Lacks Canvas Wheel/Pinch Zoom
- **Location**: `src/views/CalendarTimelineRenderer.ts:217-370, 701-770`, `src/views/CalendarTimelineToolbarRenderer.ts:51-90`
- **Issue**: Changing the timeline time resolution strictly requires clicking toolbar buttons (`timeline.scaleDay`, `timeline.scaleWeek`, `timeline.scaleMonth`, `timeline.scaleQuarter`, `timeline.scaleYear`). The timeline canvas does not listen to `wheel` with `Ctrl`/`Cmd` or trackpad pinch gestures to smoothly transition scales.
- **UX Impact**: Navigating long project timelines spanning multiple years requires repeatedly clicking toolbar buttons rather than fluidly zooming in and out with the mouse wheel or trackpad.

### 10. Board Column Headers Lack Dedicated Management Options Menu
- **Location**: `src/views/BoardRenderer.ts:311-350`, `styles.css:7085-7110`
- **Issue**: Clicking or hovering a board column header only triggers group collapse (`toggleGroupCollapsed`) or row selection checkbox. There is no `...` column options menu button.
- **UX Impact**: Users cannot sort cards within a specific column (e.g. Sort "In Progress" column by Due Date), cannot configure a Work-In-Progress (WIP) card limit with visual warnings, cannot change the column option color, and cannot quickly hide or delete the column from the board view.

### 11. Redundant 500+ Lines of Field Rendering Logic Duplicated Across 4 View Renderers
- **Location**: `src/views/BoardRenderer.ts:983-1120`, `src/views/GalleryRenderer.ts:510-630`, `src/views/ListRenderer.ts:290-410`, `src/views/RecordDetailPanel.ts:272-350`
- **Issue**: `renderPreviewValue` in `BoardRenderer`, `renderValue` in `GalleryRenderer`, `renderValue` in `ListRenderer`, and `renderFieldValue` in `RecordDetailPanel` copy-paste hundreds of lines of identical logic for rendering select pills, multi-select badges, status colors, relation links, date formatting, markdown parsing, number display styles (rating, progress, ring), and checkboxes.
- **UX Impact**: Massive code duplication. Any bug fix or visual polish applied to one view (e.g., clickable rating stars, date preset tooltips, or custom relation icons) does not automatically propagate to the other 3 views, resulting in cross-view UI divergence.

### 12. Complete Absence of Roving Keyboard Navigation Across Non-Table Views
- **Location**: `src/views/BoardRenderer.ts:483-585`, `src/views/GalleryRenderer.ts:90-99`, `src/views/ListRenderer.ts:85-92`, `src/views/CalendarRenderer.ts:154-197`
- **Issue**: While Table view has `RovingCellController` for keyboard traversal, non-table views have no roving focus or keyboard interaction models:
  - Board: No ArrowKey navigation across columns and cards.
  - Gallery: No 2D grid arrow navigation.
  - List: No ArrowUp/Down item navigation.
  - Calendar: No keyboard day/week traversal.
- **UX Impact**: Power users who navigate databases via keyboard are locked out as soon as they switch from Table view to Board, Gallery, List, or Calendar.

---

## Anytype/AppFlowy patterns

### 1. Anytype: Unified Object-Centric Inspector Across All Views
- **Pattern**: Anytype enforces 100% parity across all view projections. Clicking an object card in Kanban, a tile in Gallery, a row in List, a date block in Calendar, or a cell in Grid opens the identical **Object Inspector** (configurable as Side Peek, Center Modal, or Full Page).
- **Why it is better**: Eliminates view silos. Users never have to adapt to different editing paradigms when switching between visual representations of their data.

### 2. AppFlowy: True 2D Horizontal Kanban Swimlanes
- **Pattern**: In AppFlowy, secondary grouping generates horizontal swimlane bands that span across all vertical Kanban columns. Each swimlane features:
  - Full-width collapsible header row with swimlane title, card count, and rollup calculation.
  - Aligned column buckets beneath the header, ensuring that cards in Column A and Column B share the same vertical row baseline.
  - Drag-and-drop across both primary columns (status) and horizontal swimlanes (priority/assignee).
- **Why it is better**: Provides a true 2D matrix view of projects without the layout breakage of nested vertical column stacking.

### 3. Notion & Anytype: Multi-Source Gallery Card Cover Engine
- **Pattern**: Gallery view settings provide a flexible "Card Preview" selector:
  - `Page Cover`: Frontmatter cover / banner image.
  - `Page Content`: Automatically scans note body for the first embedded image, or generates a clean 3-line markdown text excerpt if no image exists.
  - `Property`: Specific file/image column.
  - `None`: Pure metadata card.
- **Why it is better**: Transforms notes into rich visual cards automatically without requiring manual frontmatter property maintenance.

### 4. Notion: Right-Aligned Metadata Columns in High-Density List View
- **Pattern**: List view uses a 2-column flex/grid row:
  - **Left**: Drag handle, checkbox, icon, and truncated Title.
  - **Right**: Visible property values rendered as neat, vertically-aligned columns along the right margin, with subtle hover separators.
- **Why it is better**: Combines maximum vertical information density with structured columnar readability, turning the List view into a powerful compact agenda/task list.

### 5. AppFlowy & Google Calendar: Workday Auto-Scroll & Live Time Ruler
- **Pattern**: When opening Week or Day time grids:
  - The viewport automatically scrolls to `current_time - 1 hour` (or a configurable default start hour like 08:00).
  - A dynamic red/accent indicator line spans across today's column with a glowing time badge showing the exact current minute.
- **Why it is better**: Eliminates repetitive manual scrolling to working hours and provides instantaneous temporal awareness.

### 6. AppFlowy: Unscheduled Backlog Planning Tray in Calendar
- **Pattern**: A collapsible side drawer in Calendar view lists all database notes where the date field is empty. Dragging a card from the tray onto a calendar day slot immediately sets that date in the note's frontmatter and places the event.
- **Why it is better**: Bridges the gap between unscheduled backlog tasks and active calendar scheduling in a single, fluid drag-and-drop interaction.

### 7. AppFlowy: Shared Field Presentation Engine
- **Pattern**: AppFlowy isolates cell rendering into a shared `FieldPresenter` / `CellWidget` layer reused across Table, Kanban, Gallery, List, and Detail Inspector.
- **Why it is better**: Ensures 100% visual consistency and zero code duplication across all database surfaces.

---

## Recommendations

| # | Change | Target (file:line) | Inspired By | Effort | Constraint Check |
|---|---|---|---|:---:|---|
| 1 | **True Horizontal Kanban Swimlanes**: Refactor secondary grouping in Board view from nested column blocks to full-width horizontal swimlane rows spanning across primary columns. | `src/views/BoardRenderer.ts:353-359`, `src/views/BoardRenderer.ts:377-430`, `styles.css:7211-7235` | AppFlowy / Notion Swimlanes | **M** | Display-only DOM restructure; iCloud-safe; mobile-safe (falls back to single-group on mobile). |
| 2 | **Universal Object Detail / Peek Parity Across All Views**: Wire `openRecordDetail` to card click handlers in Board, Gallery, and List views, giving all views identical side peek and center modal inspection. | `src/views/DatabaseView.ts:615, 646, 672`, `src/views/BoardRenderer.ts:598-607`, `src/views/GalleryRenderer.ts:453-470`, `src/views/ListRenderer.ts:177-185` | Anytype Object Inspector | **M** | Display-only inspection; uses existing `openRecordDetailPanel`; zero file writes on view. |
| 3 | **Multi-Source Gallery Card Preview Engine**: Expand `resolveCoverImage` to support fallback resolution to the first embedded markdown image (`app.metadataCache.getFileCache()?.embeds`) and note text excerpt when no frontmatter cover exists. | `src/data/CoverImage.ts:52-61`, `src/views/GalleryRenderer.ts:442-475`, `src/views/ViewConfigPanelRenderer.ts:1707-1717` | Notion / Anytype Gallery | **M** | Read-only cache extraction; no file mutations; 100% iCloud-safe. |
| 4 | **Standard Gallery Aspect Ratio & Sizing Presets**: Add discrete card size buttons (Small 180px, Medium 260px, Large 360px) and aspect ratio presets (1:1 Square, 16:9 Banner, 3:4 Portrait, 4:3 Default) to View Config. | `src/views/GalleryRenderer.ts:93, 104`, `src/views/ViewConfigPanelRenderer.ts:1710-1717`, `styles.css:7744-7751` | Notion / AppFlowy | **S** | Pure ViewConfig setting & CSS variable adjustment; rebase-clean. |
| 5 | **Sleek List View Row Geometry with Right-Aligned Metadata Columns**: Redesign `.db-list-row` as borderless rows with subtle dividers, and align `.db-list-row-meta` into structured vertical columns along the right margin. | `src/views/ListRenderer.ts:191-250`, `styles.css:8161-8270` | Notion List View / Anytype | **M** | CSS/DOM layout refactoring; mobile-safe (wraps on small viewports). |
| 6 | **Calendar Time Grid Auto-Scroll & Live Time Ruler**: Auto-scroll Week/Day time grids to current hour on mount, and render a live red/accent current time ruler across today's column. | `src/views/CalendarRenderer.ts:418-475, 715-770`, `styles.css:12700-13100` | Google Calendar / AppFlowy | **S** | Viewport DOM scroll and CSS indicator; zero data side effects. |
| 7 | **Month View Multi-Day Drag Creation**: Add pointer-drag tracking across day cells in Month view to select a date range and open `createEntryForDate` with start and end date defaults. | `src/views/CalendarRenderer.ts:154-197`, `src/data/CalendarInteractionModel.ts:1-50` | Notion Calendar / Google Calendar | **M** | Interaction event handler; triggers existing note creation plan safely. |
| 8 | **Unscheduled Notes Backlog Drawer in Calendar & Timeline**: Add a collapsible side/bottom tray displaying undated records, with drag-and-drop onto calendar days or timeline lanes to set dates. | `src/views/CalendarRenderer.ts:118-124`, `src/views/CalendarTimelineRenderer.ts:273`, `styles.css:12600-12650` | AppFlowy Backlog Tray | **L** | UI drawer + date update action; mobile-safe drawer overlay. |
| 9 | **Timeline Wheel Zoom & Gesture Scaling**: Bind `wheel` (with `Ctrl`/`Cmd`) and trackpad pinch gestures on the timeline canvas to smoothly transition between Day, Week, Month, Quarter, and Year scales. | `src/views/CalendarTimelineRenderer.ts:217-370, 701-770` | Linear / Anytype Timeline | **S** | Event listener mapping to existing `updateTimelineScale`; rebase-clean. |
| 10 | **Board Column Options Menu (Sort, WIP Limit, Color, Hide)**: Add a `...` icon button to board column headers opening a menu to sort cards in-column, configure WIP card limits with warning badges, color group, or hide. | `src/views/BoardRenderer.ts:311-350`, `styles.css:7085-7110` | AppFlowy / Notion Board | **M** | View state management; no unapproved note writes; clean rebase. |
| 11 | **Unified Card Field Renderer (`CardFieldRenderer`)**: Consolidate duplicate field rendering across `BoardRenderer`, `GalleryRenderer`, `ListRenderer`, and `RecordDetailPanel` into a single reusable component. | `src/views/BoardRenderer.ts:983-1120`, `src/views/GalleryRenderer.ts:510-630`, `src/views/ListRenderer.ts:290-410` | AppFlowy Architecture | **M** | TypeScript refactoring; reduces 500+ lines of duplicate code; 100% parity. |
| 12 | **Cross-View Keyboard Navigation & Roving Focus**: Implement arrow-key navigation, Space/X selection, Enter peek activation, and quick creation hotkeys across Board, Gallery, List, and Calendar. | `src/views/BoardRenderer.ts:483-585`, `src/views/GalleryRenderer.ts:90-99`, `src/views/ListRenderer.ts:85-92`, `src/views/CalendarRenderer.ts:154-197` | Notion / AppFlowy | **M** | Keyboard accessibility listeners; works identically on desktop and iPad hardware keyboards. |

---

## Open threads for later iterations

- **Iteration 9 (Micro-interactions & feedback)**: Audit drag ghost images, drop indicators, inline hover animations, loading skeletons, selection lassos, and optimistic update transitions across all views.
- **Iteration 10 (Mobile / responsive / accessibility)**: Audit touch gestures, swipe actions, mobile bottom sheets, ARIA live regions, and screen reader announcements for Board, Gallery, Calendar, and List views on Obsidian Mobile.
