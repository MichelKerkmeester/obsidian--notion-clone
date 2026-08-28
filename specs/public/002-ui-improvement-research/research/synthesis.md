# UI Improvement Research Synthesis: Note Database Plugin

**Context**: Two-track deep research synthesis (`devin-gemini` via Gemini 3.7 Flash High + `codex-luna` via GPT-5.6-Luna xhigh, 10 iterations each, 20 total iteration artifacts) benchmarked against **Anytype**, **AppFlowy**, and **Notion** under strict local-first Obsidian constraints (mobile-safe, iCloud-safe display-only with no note-body writes on render, MIT-forkable, no telemetry, rebase-clean).

---

## Executive summary

The Note Database plugin possesses powerful data querying, grouping, and formula capabilities, but its user interface is compromised by systemic visual fragmentation, timer-driven state loss, and broken mobile/accessibility affordances. Crucial controls are hidden behind desktop-only hover gestures, while core overlays suffer from destructive 5-second auto-close timers (`PopoverAutoClose.ts`) and severe dark-mode contrast failures across all 16 status color tokens. Record inspection is split between a plain-text table peek and an isolated calendar detail popover, while non-table views (Board, Gallery, List) jarringly navigate away to raw markdown files instead of providing in-context inspection. Grouped tables unnecessarily repeat entire `<thead>` header blocks for every group, calculations float in detached summary chips rather than column footers, and toolbars suffer from 12-button icon sprawl. Modernizing this plugin requires a cohesive through-line: unifying record inspection into a universal side-peek/sheet inspector, establishing a dual-theme token system with WCAG AA compliance, consolidating the command deck into a 4-cluster toolbar, and replacing timer-based transient feedback with robust interaction lifecycles.

---

## Top 10 recommendations (ranked)

Ranked by user-visible impact per unit effort. Items surfaced independently by **both** research tracks are prioritized, as dual convergence represents the highest-confidence signal for implementation.

| Rank | Recommendation | Why it matters | Target `file:line` | Inspired by | Effort | Tracks |
|:---:|---|---|---|---|:---:|:---:|
| **1** | **Dual-Theme Status & Tag Color Token System (WCAG AA)** | All 16 status/tag colors hardcode dark hex text (`#2f6fad`, `#6940a5`, etc.) with zero `.theme-dark` overrides, causing severe contrast failures (< 3:1) in dark mode. Calibrating dual tokens (`--status-color-bg-*` / `--status-color-fg-*`) fixes readability vault-wide. | `styles.css:85-116`<br>`styles.css:132-155`<br>`styles.css:5610-5670`<br>`styles.css:5890-5980` | Anytype Semantic Colors / Notion Dark Palette / AppFlowy | **M** | **Both** *(Gemini iter 5/10, Luna iter 5/10)* |
| **2** | **Mobile Bottom Sheets & Viewport-Safe Overlays** | Desktop anchored popovers collapse to 80–120px on mobile (`styles.css:15730`) or get occluded by the virtual keyboard and Obsidian bottom bar. Converting overlays to native bottom sheets (`.db-mobile-bottom-sheet`) with `env(safe-area-inset-bottom)` restores full touch usability. | `src/views/PopoverPosition.ts:24-90`<br>`src/views/FilterPanelRenderer.ts:126-140`<br>`src/views/SortPanelRenderer.ts:39-45`<br>`styles.css:15722-15731` | Anytype Mobile Bottom Sheets / Notion Mobile | **M** | **Both** *(Gemini iter 3/10, Luna iter 3/10)* |
| **3** | **Remove Destructive 5s Inactivity Auto-Close Timer** | `installPopoverAutoClose` runs a 5000ms idle timer that closes popovers and discards uncommitted filter, sort, or property edits if the user pauses without hovering directly inside the box. Replacing it with explicit outside-click/Escape stack dismissal eliminates data entry loss. | `src/views/PopoverAutoClose.ts:11-79`<br>`src/views/DropdownField.ts:215-236`<br>`src/views/ToolbarRenderer.ts:391-403` | Obsidian Core / Anytype Overlay Lifecycle | **S** | **Both** *(Gemini iter 3, Luna iter 3)* |
| **4** | **Universal Object Detail / Peek Parity Across All Views** | Clicking cards in Board, Gallery, or List currently navigates away from the database view to the note tab, while Table peek renders raw stringified text (`stringifyValue`). Unifying `TableRecordPeek` and `RecordDetailPanel` into a universal inspector provides rich side-peek, center modal, and sheet editing across all 7 views. | `src/views/TableRecordPeek.ts:71-197`<br>`src/views/RecordDetailPanel.ts:104-220`<br>`src/views/DatabaseView.ts:521-674`<br>`styles.css:16317-16428` | Anytype Object Inspector / Notion Side Peek / AppFlowy | **L** | **Both** *(Gemini iter 6/8, Luna iter 6/8)* |
| **5** | **Deduplicate Grouped Table theads into a Single Sticky Header** | In grouped mode, `TableRenderer` instantiates an entire nested `<table>` with a full repeated `<thead>` for every single group, producing redundant stacked headers and visual stutter. Refactoring to a single sticky column header with group divider bands cuts DOM nodes and aligns columns cleanly. | `src/views/TableRenderer.ts:157-191`<br>`styles.css:6183-6288` | Notion Grouped Tables / AppFlowy Grid / Anytype | **M** | **Both** *(Gemini iter 2, Luna iter 2)* |
| **6** | **Semantic 4-Cluster Toolbar & WAI-ARIA View Switcher** | The right toolbar concatenates 12 un-grouped icon buttons, causing visual fatigue and mobile overflow. Reorganizing into 4 functional clusters (Query, Properties, More `...`, Primary `+ New`) and converting the tab strip into a true WAI-ARIA tablist with roving keyboard focus establishes a predictable command deck. | `src/views/ToolbarRenderer.ts:252-286`<br>`src/views/ToolbarRenderer.ts:625-683`<br>`styles.css:945-964`<br>`styles.css:1201-1274` | Anytype Command Deck / Notion Tabs / AppFlowy | **M** | **Both** *(Gemini iter 1/4, Luna iter 1/4)* |
| **7** | **Column-Aligned Table Calculation Footer (`<tfoot>`)** | Table calculations (Sum, Count, Average) currently render as floating, detached chips in a `.db-summary` bar at the bottom. Replacing them with a native `<tfoot>` where each aggregate cell aligns directly under its column width provides immediate tabular association. | `src/views/SummaryRenderer.ts:170-210`<br>`src/views/TableRenderer.ts:81-86`<br>`styles.css:3425-3515` | AppFlowy Column Calculations / Notion Table Footer | **M** | **Both** *(Gemini iter 2, Luna iter 2)* |
| **8** | **WAI-ARIA Roving Keyboard Navigation in DropdownField** | `DropdownField` assigns `role="listbox"` and `role="option"` but completely ignores ArrowDown/ArrowUp, Home, End, and Enter keys. Adding roving tabindex, Enter selection, and instant Enter-to-select for top search matches restores keyboard power-user workflows across all modals and popovers. | `src/views/DropdownField.ts:141-236`<br>`src/views/DropdownField.ts:209-212`<br>`styles.css:1873-2055` | WAI-ARIA 1.2 Listbox / AppFlowy / Anytype Select | **S** | **Both** *(Gemini iter 3, Luna iter 3)* |
| **9** | **Remove Destructive Focus Reset & Expand Touch Targets to 44px** | `.note-database-container *:focus { outline: none; }` strips focus visibility across body portals. Combined with tiny 12–28px hit targets on toolbar icons, remove chips, and checkboxes, touch and keyboard accessibility fail WCAG 2.5.5. Scoping `:focus-visible` and expanding touch envelopes (`::before { inset: -8px; }`) fixes both. | `styles.css:189-206`<br>`styles.css:1024-1041`<br>`styles.css:1324`<br>`styles.css:4178-4188`<br>`styles.css:5090-5110` | WCAG 2.5.5 / Apple HIG / AppFlowy | **S** | **Both** *(Gemini iter 10, Luna iter 5/10)* |
| **10** | **Reason-Aware Empty States with Contextual Clear Actions** | When search or filters yield 0 records, the view renders a blank dead-end without explaining why. Adding an `EmptyStateRenderer` with contextual recovery CTAs ("Clear search", "Reset filters") and upgrading zero-column databases with a "+ Add Property" button removes cold-start friction. | `src/views/DatabaseView.ts:6360-6385`<br>`src/views/TableRenderer.ts:98-104`<br>`src/views/ChartRenderer.ts:555-608`<br>`styles.css:6130-6153` | AppFlowy Reason-Aware States / ChartRenderer Pattern | **S** | **Both** *(Gemini iter 1, Luna iter 1)* |

---

## Themed backlog

Remaining recommendations grouped by subsystem. Each entry is actionable and scoped with a concrete target and effort estimate.

### 1. Table & Grid Surface
- Add trailing `+` Add Column Header button at the end of `<thead>` to trigger property creation (`src/views/TableRenderer.ts:440-455`, `styles.css:4086-4120`) — **S**
- Make header click open property menu instead of cycling sort; add dedicated sort indicators (`src/views/ColumnHeaderController.ts:21-47`, `styles.css:4105-4208`) — **S**
- Wire double-click on `.db-resize-handle` to trigger `estimateAutoColumnWidth` / `autoFitColumn` (`src/views/ColumnHeaderController.ts:49-87`, `src/views/ColumnWidth.ts:39-61`) — **S**
- Freeze default column schema across filtering so empty columns do not vanish when filtered (`src/data/ColumnConfig.ts:92-117`, `src/views/DatabaseView.ts:6406-6432`) — **M**
- Enable single-click activation for Select, Status, and Date cell pickers (`src/views/CellRenderer.ts:418-430`, `src/views/CellRenderer.ts:332-355`) — **M**
- Replace `"⋮⋮"` row drag text with SVG grip icon and click-to-open `RowMenu` (`src/views/TableRenderer.ts:501-530,647-673`, `src/views/RowMenu.ts:30-48`, `styles.css:5044-5084`) — **S**
- Replace textual `"empty"` / `"空"` cell placeholders with clean whitespace and hover outlines (`src/views/CellRenderer.ts:183-204`, `styles.css:4240-4247`) — **S**
- Add group-header selection checkbox with indeterminate state for collapsed/partial selection (`src/views/TableRenderer.ts:122-150,422-432`, `src/views/RangeSelection.ts:1-51`) — **M**
- Add contextual "Filter by this value" action to cell context menus (`src/views/ColumnMenu.ts:194-237`, `src/views/CellRenderer.ts:217-230`) — **M**
- Eliminate dynamic `padding-right: 32px` on `th:hover` to prevent header label jitter (`styles.css:4117`, `styles.css:4168`, `styles.css:4178-4208`) — **S**
- Add subtle hover in-between row insertion line with `+` button (`src/views/TableRenderer.ts:501-550`, `styles.css:4660-4667`) — **M**

### 2. Popovers, Menus & Dropdowns
- Route all overlay panels to mount via a global body portal with live boundary collision flipping (`src/views/PopoverPosition.ts:24-104`, `src/views/ColumnMenu.ts:565-593`) — **L**
- Replace hover submenus in `ColumnMenu` with drilldown navigation to eliminate the "triangle of doom" (`src/views/ColumnMenu.ts:98-154,565-660`, `styles.css:2561-2684`) — **M**
- Add quick date preset chips (`Today`, `Tomorrow`, `Next Week`, `Clear`) to `DateValuePicker` (`src/views/DateValuePicker.ts:105-150`, `src/views/CalendarMiniCalendarRenderer.ts:24-95`) — **M**
- Add live search input with instant keyword filtering to `IconPickerPopover` (`src/views/IconPickerPopover.ts:62-169`, `styles.css:15939-16021`) — **M**
- Standardize menu row component anatomy across `ColumnMenu`, `RowMenu`, and toolbar popovers (`src/views/DropdownField.ts:165-197`, `src/views/ToolbarRenderer.ts:436-476`, `styles.css:2185-2210`) — **S**
- Convert color picker swatches into an accessible button palette with roving focus (`src/views/OptionColorPicker.ts:15-47`, `styles.css:5581-5608`) — **S**
- Implement full ARIA grid and arrow-key calendar navigation in `CalendarMiniCalendarRenderer` (`src/views/CalendarMiniCalendarRenderer.ts:67-212`, `src/views/DateValuePicker.ts:250-355`) — **M**
- Virtualize large relation and icon catalogs to prevent DOM lag on 500+ items (`src/views/CellRenderer.ts:709-821,885-925`, `styles.css:5332-5461`) — **L**

### 3. Toolbars & View Controls
- Convert `.db-new-button` to a split button with a multi-template selection menu (`src/views/ToolbarRenderer.ts:1716-1739`, `src/data/TemplateToolbarAction.ts:6-32`, `styles.css:2904-2928`) — **M**
- Upgrade `showAddViewMenu` to a rich preset sheet with layout preview tiles and view duplication (`src/views/ToolbarRenderer.ts:654-663,921-962`, `src/views/DatabaseView.ts:2981-3020`) — **M**
- Transform tab overflow `⋯` dropdown into a searchable "All Views" hub with inline view actions (`src/views/ToolbarRenderer.ts:721-794`, `styles.css:1258-1274`) — **M**
- Replace dynamic search width expansion with overlay expansion and add inline `✕` clear action (`src/views/ToolbarRenderer.ts:1087-1123`, `styles.css:2687-2750`) — **S**
- Consolidate layout-specific settings (`Chart Options`, `Calendar Options`) into unified `View Settings` (`src/views/ToolbarRenderer.ts:1603-1614`, `src/views/ViewConfigPanelRenderer.ts:248-267`) — **S**
- Fix invalid nested interactive buttons in database switcher selector rows (`src/views/ToolbarRenderer.ts:425-477`, `styles.css:8430-8445`) — **M**
- Separate badge vocabulary: numeric rule counts for filter/sort vs hidden field counts for Properties (`src/views/ToolbarRenderer.ts:1575-1649,1801-1804`, `styles.css:1551-1566`) — **S**
- Add visible expand / open-full-view button to frontmatter embedded database headers (`src/views/ToolbarRenderer.ts:156-209,227-249`, `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`) — **S**
- Ensure primary New button tap executes immediately without being intercepted by overlay cleanup (`src/views/DatabaseView.ts:562-565,839-872`, `src/views/ToolbarRenderer.ts:1716-1739`) — **M**
- Separate database switcher chevron from title rename hover pencil to prevent accidental switcher opens (`src/views/ToolbarRenderer.ts:156-209`, `styles.css:715-790`) — **S**

### 4. Design Tokens & Typography
- Replace hardcoded serif font (`--db-title-font-family`) with Obsidian's native `var(--font-interface)` (`styles.css:77-80`, `styles.css:705-750`) — **S**
- Declare base-4 spatial scale tokens (`--db-space-1` to `--db-space-8`) and eliminate arbitrary pixel gaps (`styles.css:63-130`, `styles.css:945-964`) — **M**
- Standardize 4-tier border radius hierarchy (`--db-radius-xs: 3px` to `--db-radius-lg: 12px`, `--db-radius-full`) (`styles.css:74-76`, `styles.css:1074`, `styles.css:15949`) — **S**
- Calibrate border divider tokens (`--db-border-subtle`, `--db-border-regular`) to equalize dark mode contrast (`styles.css:83-84`, `styles.css:4073-4074`) — **S**
- Introduce dark-mode surface luminance steps (+3% cards, +7% popovers, +12% modals) (`styles.css:2166`, `styles.css:2364`, `styles.css:16429-16460`) — **M**
- Recast conditional formatting as a layered emphasis tint with borders rather than opaque cell fills (`src/data/ConditionalFormatting.ts:135-165`, `styles.css:469-496`) — **M**
- Implement theme-adaptive chart palette generator dynamically adjusting luminance for dark mode (`src/data/ChartPalettes.ts:9-23`, `src/views/ChartRenderer.ts:75-93,1565-1594`) — **L**
- Introduce configurable row density tokens (`--db-row-height`: 28px compact, 34px default, 40px relaxed) (`styles.css:4070-4077`, `src/views/TableRenderer.ts:74-86`) — **S**
- Declare scoped `color-scheme` policy so native controls and scrollbars match Obsidian theme (`styles.css:63-156`, `styles.css:2936-2992`) — **S**

### 5. Other Views (Board, Gallery, Calendar, List, Timeline)
- Implement true horizontal Kanban swimlanes spanning across primary status columns (`src/views/BoardRenderer.ts:353-359,377-430`, `styles.css:7211-7235`) — **M**
- Hide active grouping field from Board card bodies by default (`src/views/BoardRenderer.ts:611-656`, `styles.css:7405-7484`) — **S**
- Disclose data mutation ("Changes [Field]") on cross-lane Kanban card drag and in mobile move menu (`src/views/BoardRenderer.ts:524-575,866-894`, `src/data/BoardContainerDrop.ts:82-94`) — **M**
- Add slim vertical Kanban column collapsing (38px width with vertical writing mode) (`src/views/BoardRenderer.ts:312-351`, `styles.css:7066-7080`) — **M**
- Expand `resolveCoverImage` to fall back to note body markdown embeds (`![[image.png]]`) (`src/data/CoverImage.ts:52-61`, `src/views/GalleryRenderer.ts:442-475`) — **M**
- Add standard Gallery card size presets (Small, Medium, Large) and aspect ratio buttons (1:1, 16:9, 3:4) (`src/views/GalleryRenderer.ts:93,104`, `styles.css:7744-7751`) — **S**
- Redesign List view rows as clean divider-separated lines with right-aligned metadata columns (`src/views/ListRenderer.ts:191-250`, `styles.css:8161-8270`) — **M**
- Auto-scroll Calendar week/day time grids to workday start hour and render live red current-time ruler (`src/views/CalendarRenderer.ts:418-475,715-770`, `styles.css:12700-13100`) — **S**
- Add collapsible "Unscheduled Notes" backlog tray to Calendar and Timeline views (`src/views/CalendarRenderer.ts:118-124`, `src/data/CalendarTimelineModel.ts:80-120`, `styles.css:12600-12650`) — **L**
- Turn scheduled calendar `+N` overflow into a focusable button with an accessible event list (`src/views/CalendarRenderer.ts:255-300,600-632`, `styles.css:13236-13246`) — **M**
- Add read-only calendar setup preview mapping start, end, title, and color to sample event cards (`src/views/CalendarToolbarRenderer.ts:127-176`, `src/data/CalendarTimelineModel.ts:764-837`) — **M**
- Add month view multi-day pointer drag-to-create date range gesture (`src/views/CalendarRenderer.ts:154-197`, `src/data/CalendarInteractionModel.ts:1-50`) — **M**
- Bind wheel/pinch gestures on Timeline canvas to smoothly transition time scales (`src/views/CalendarTimelineRenderer.ts:217-370,701-770`) — **S**
- Consolidate duplicate field rendering across Board, Gallery, List, and Detail into `CardFieldRenderer` (`src/views/BoardRenderer.ts:983-1120`, `src/views/GalleryRenderer.ts:510-630`, `src/views/ListRenderer.ts:290-410`) — **M**

### 6. Micro-Interactions & Sensory Feedback
- Calculate contiguous selection bounding perimeter with a single corner fill handle (`src/views/DatabaseView.ts:4361-4381,7971-7984`, `styles.css:5004-5020`) — **M**
- Redesign selection status bar as a floating glassmorphic action capsule dock (`src/views/DatabaseView.ts:7010-7125`, `styles.css:1697-1718`) — **M**
- Enable multi-item batch drag with stacked thumbnail and count badge (`src/views/TableRenderer.ts:658-673`, `src/views/BoardRenderer.ts:508-585`) — **M**
- Implement `EdgeAutoScroller` for smooth container scrolling when dragging near boundaries (`src/views/TableRenderer.ts:684-712`, `src/views/BoardRenderer.ts:441-480`) — **M**
- Surface formula runtime calculation errors in table cells with `#ERROR!` badge and diagnostic tooltip (`src/data/ComputedEvaluator.ts:68-72`, `src/views/CellRenderer.ts:183-204`) — **S**
- Add inline input error shake animation (`@keyframes db-shake`) and in-situ validation tooltip (`src/views/CellRenderer.ts:1338-1341,2577-2580`) — **S**
- Detect broken relation wikilinks and render with dashed warning pill state (`src/views/RelationValueRenderer.ts:18-35`, `styles.css:4870-4910`) — **S**
- Add direct inline tag dismissal micro-button (`✕`) on tag hover (`src/views/CellRenderer.ts:1148-1215`, `styles.css:4560-4650`) — **S**
- Render shimmering skeleton placeholders during async view switches and heavy queries (`src/views/DatabaseView.ts:1230-1300`, `styles.css:6130-6160`) — **M**
- Add live hover star fill previews and 1-click star rating/progress track manipulation (`src/views/CellRenderer.ts:300-309`, `styles.css:4380-4420`) — **S**
- Replace card drop box-shadows with a distinct 2px accent insertion line (`.db-board-drop-indicator`) (`src/views/BoardRenderer.ts:531-541`, `styles.css:7307-7317`) — **S**
- Wrap drag-and-drop in transactional `DragDropFeedbackState` (`over`, `pending`, `committed`, `failed`) (`src/views/DragDropFeedback.ts:1-47`, `styles.css:5037-5121`) — **L**
- Implement persistence-aware inline editor lifecycle retaining drafts with retry/discard on error (`src/views/CellRenderer.ts:1950-2156`, `styles.css:5747-5828`) — **M**
- Capture interaction snapshot across row patch and refresh to restore focus and selection (`src/views/TableRenderer.ts:194-239`, `src/views/DatabaseView.ts:10631-10648`) — **M**

### 7. Object-Oriented Inspection & Relational Graph
- Surface `RelationInverse.inboundByPath` as an interactive "Linked Records / Backlinks" accordion in the inspector (`src/data/RelationInverse.ts:29-87`, `src/views/TableRecordPeek.ts:146-180`) — **M**
- Resolve target note's frontmatter icon/emoji in relation pills instead of hardcoded `file-text` icon (`src/views/RelationValueRenderer.ts:24-25`, `src/views/RecordIconRenderer.ts:18-51`) — **S**
- Add 1-click "+ Create '[query]' in [Target DB]" action in relation search picker (`src/views/CellRenderer.ts:760-788`, `src/data/CreateEntryPlan.ts:28-78`) — **M**
- Add compact inline-block embed mode for markdown notes with low-profile toolbar (`src/views/EmbeddedDatabaseRenderer.ts:1486-1514`, `styles.css:15100-15180`) — **M**
- Support dynamic contextual variable `$this.path` / `$this.name` in embedded database filters (`src/data/SourceRules.ts:7-28`, `src/data/QueryEngine.ts:1-80`) — **M**
- Add lazy read-only Document Outline (TOC) to Object Inspector using `row.cache?.headings` (`src/data/FileFields.ts:7-21`, `src/views/TableRecordPeek.ts:138-180`) — **M**
- Add collapsible "▶ N empty properties" accordion to Record Detail inspector (`src/views/RecordDetailPanel.ts:187-215`, `styles.css:7604-7635`) — **S**
- Add tactile switch toggles for boolean properties in Record Detail drawer (`src/views/RecordDetailPanel.ts:231-255`, `styles.css:7613-7624`) — **S**
- Expand `NumberDisplayConfig` with custom currency symbols, separators, and precision (`src/views/ColumnMenu.ts:115-134`, `src/data/NumberDisplay.ts:1-50`) — **M**
- Add dedicated cell micro-actions for URL (open/copy), Email (mailto/copy), and Phone (`src/views/CellRenderer.ts:246-279`, `styles.css:4450-4490`) — **S**
- Upgrade `FormulaModal` with live sample-row evaluation on 3 real database rows and syntax tokens (`src/views/modals/FormulaModal.ts:44-59,116-160`, `src/data/FormulaTokenizer.ts:1-50`) — **M**

### 8. Mobile, Responsiveness & Accessibility
- Replace `body.is-phone` check with `isTouchDevice()` checking pointer coarse and tablet platforms (`src/views/TableRenderer.ts:802`, `src/views/DatabaseView.ts:4340`) — **S**
- Implement `window.visualViewport` tracking for mobile cell editing to prevent virtual keyboard occlusion (`src/views/CellRenderer.ts:1539-1558,2024-2059`, `styles.css:15734-15760`) — **M**
- Implement pointer-based long-press (450ms + haptics) on touch devices and add `touch-action: manipulation` (`src/views/DatabaseView.ts:4150-4180`, `styles.css:124,4065-4080`) — **M**
- Add CSS scroll-snapping (`scroll-snap-type: x mandatory`) and pagination indicator to mobile Kanban (`src/views/BoardRenderer.ts:280-350`, `styles.css:7050-7120`) — **M**
- Inject complete WAI-ARIA Grid (`role="grid"`, `role="columnheader"`, `aria-sort`) semantics (`src/views/TableRenderer.ts:60-120,422-455`) — **M**
- Add `role="tablist"`, `role="tab"`, and `aria-selected` to View Switcher tabs (`src/views/ToolbarRenderer.ts:631-653`, `styles.css:1210-1270`) — **S**
- Add dynamic `aria-expanded` and `aria-controls` bindings to all group collapse toggles (`src/views/TableRenderer.ts:138`, `src/views/BoardRenderer.ts:325`) — **S**
- Add visually hidden `aria-live="polite"` status region for search and filter updates (`src/views/ActiveViewControlsRenderer.ts:29-53`, `src/views/DatabaseView.ts:4200-4250`) — **S**
- Attach full table keyboard navigation controller to embedded database tables (`src/views/EmbeddedDatabaseRenderer.ts:421-434,3425-3439`) — **L**
- Replace document-level `:hover` shortcut capture with an explicit interaction-scope registry (`src/views/DatabaseView.ts:1206-1229,1430-1440`) — **M**
- Add scroll margin padding for sticky headers and fixed mobile chrome (`styles.css:189-217,4081-4089`) — **M**
- Add high-contrast OS `forced-colors: active` fallbacks for borders, selection, and focus rings (`styles.css:4988-5023,16429-16460`) — **M**

---

## Quick wins (< 1 day each)

High-visibility, small-effort (**S**) improvements that provide immediate polish with near-zero architectural risk:

1. **Eliminate 5s Inactivity Auto-Close Timer** (`src/views/PopoverAutoClose.ts:11-79`) — Deleting the arbitrary inactivity timeout prevents unexpected popover dismissal and lost user input.
2. **Harmonize Database Title Typography** (`styles.css:77-80`, `styles.css:715-750`) — Replace hardcoded serif font stack with `var(--font-interface)` to match Obsidian's native workspace aesthetic.
3. **Expand 44×44px Touch Targets** (`styles.css:1024-1041`, `styles.css:1324`, `styles.css:4178-4188`, `styles.css:5090-5110`) — Add hit-area pseudo-elements (`::before { inset: -8px; }`) to toolbar icons, filter remove `✕`, column menus, and checkboxes.
4. **Clean Placeholder for Empty Cells** (`src/views/CellRenderer.ts:183-204`, `styles.css:4240-4247`) — Remove repeated `"empty"` / `"空"` text labels, replacing them with clean whitespace and quiet hover outlines.
5. **Trailing `+` Add Column Header Button** (`src/views/TableRenderer.ts:440-455`, `styles.css:4086-4120`) — Add trailing `<th>` button to open `CreatePropertyModal` directly from the grid.
6. **Double-Click Resize Handle Auto-Fit** (`src/views/ColumnHeaderController.ts:49-87`, `src/views/ColumnWidth.ts:39-61`) — Bind `dblclick` on `.db-resize-handle` to execute existing `estimateAutoColumnWidth`.
7. **Jitter-Free Search with Inline Clear (`✕`)** (`src/views/ToolbarRenderer.ts:1087-1123`, `styles.css:2687-2750`) — Add `✕` clear icon, bind `Escape` to blur/clear, and remove dynamic width expansion jitter.
8. **Formula Runtime `#ERROR!` Badges** (`src/data/ComputedEvaluator.ts:68-72`, `src/views/CellRenderer.ts:183-204`) — Surface formula evaluation exceptions with an explicit `#ERROR!` tag and hover tooltip instead of silently rendering blank cells.
9. **Direct Inline Tag Dismissal (`✕`) on Hover** (`src/views/CellRenderer.ts:1148-1215`, `styles.css:4560-4650`) — Render a micro `✕` on multi-select tag pills on hover that removes the tag in one click.
10. **Rich Target Record Icons in Relation Badges** (`src/views/RelationValueRenderer.ts:24-25`, `src/views/RecordIconRenderer.ts:18-51`) — Resolve target note's frontmatter emoji/icon instead of hardcoding `file-text`.
11. **Hide Redundant Active Grouping Field from Board Cards** (`src/views/BoardRenderer.ts:611-656`, `styles.css:7405-7484`) — Remove redundant grouping status lines from card bodies when the card is already in that column lane.
12. **Hide Empty Properties Accordion in Record Detail** (`src/views/RecordDetailPanel.ts:187-215`, `styles.css:7604-7635`) — Collapse unpopulated fields into an expandable `▶ N empty properties` accordion.
13. **Dedicated URL, Email & Phone 1-Click Action Glyphs** (`src/views/CellRenderer.ts:246-279`, `styles.css:4450-4490`) — Add hover 1-click external open and copy-to-clipboard buttons.
14. **Universal Touch / Tablet Detection (`isTouchDevice`)** (`src/views/TableRenderer.ts:802`, `src/views/DatabaseView.ts:4340`) — Replace fragile `body.is-phone` check with `isTouchDevice()` so iPads receive touch-friendly controls.
15. **WAI-ARIA Tablist and Group Collapse Semantics** (`src/views/ToolbarRenderer.ts:631-653`, `src/views/TableRenderer.ts:138`) — Annotate view tabs with `role="tablist"`/`role="tab"` and group buttons with `aria-expanded`/`aria-controls`.
16. **Screen Reader `aria-live` Filter/Search Announcements** (`src/views/ActiveViewControlsRenderer.ts:29-53`, `src/views/DatabaseView.ts:4200-4250`) — Inject live region announcing record count updates to screen readers.
17. **Separate Badge Vocabulary** (`src/views/ToolbarRenderer.ts:1575-1649,1801-1804`, `styles.css:1551-1566`) — Retain accent badges for active filter/sort rule counts, but show Properties as a neutral "N hidden" badge.
18. **Visible Expand Button in Frontmatter Embeds** (`src/views/ToolbarRenderer.ts:156-209,227-249`, `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`) — Render an expand/full-view icon button in frontmatter embed headers.

---

## Deliberately excluded

The following patterns proposed or encountered during research were evaluated and deliberately excluded to strictly uphold the plugin's architectural constraints:

1. **Automatic Note-Body Writes on Render / Dynamic Backlink Sync**
   - *Proposal*: Automatically writing backlink frontmatter properties to linked target notes during view rendering or indexing.
   - *Reason for Exclusion*: Violates the **iCloud-safe display-only** constraint. Automatic note-body writes during view reads cause infinite file modification loops, iCloud sync conflicts, and vault file churn. All graph relations must remain in-memory queries derived from Obsidian's `metadataCache`.
2. **Proprietary Binary / SQLite / Blockstore Storage Engines**
   - *Proposal*: Adopting Anytype's CRDT blockstore or AppFlowy's embedded SQLite database engine for local record storage.
   - *Reason for Exclusion*: Violates the **MIT-forkable markdown-first** constraint. Obsidian users own their plain text markdown files; the database plugin must remain a pure view projection over standard markdown frontmatter and yaml headers.
3. **Desktop-Only Node.js / Electron Native APIs**
   - *Proposal*: Using Node `fs.watch`, `child_process`, or desktop OS native context menus for background file watching and menus.
   - *Reason for Exclusion*: Violates the **mobile-safe** constraint. All file operations and menus must route through Obsidian's public cross-platform `App` / `Vault` / `Menu` APIs to run reliably on iOS and Android.
4. **Cloud Telemetry & Analytics Tracking**
   - *Proposal*: Tracking feature usage analytics, search query telemetry, or remote error reporting.
   - *Reason for Exclusion*: Violates the **zero-telemetry** privacy constraint of the local-first Obsidian ecosystem.
5. **Architectural Pipeline Rewrites / State Framework Overhauls**
   - *Proposal*: Completely replacing `DataSource.ts`, `DatabaseConfig`, and `RowPipeline.ts` with external reactive state stores (e.g. MobX, Zustand).
   - *Reason for Exclusion*: Violates the **rebase-clean** constraint. Changes must be localized and modular so the fork can cleanly merge upstream updates and bugfixes.

---

## Convergence notes

### Points of Strong Agreement
Both independent research tracks reached unanimous agreement on the primary friction points in the existing codebase:
1. **The 5-Second Inactivity Auto-Close Timer** (`PopoverAutoClose.ts`) is the single most frustrating interaction defect, prematurely destroying active user inputs across all overlay panels.
2. **Dark-Mode Contrast Failures** in the 16 status/tag color tokens (`styles.css:85-116`) represent the most severe visual flaw, failing basic WCAG AA accessibility standards.
3. **Inspection Disconnect**: Both tracks identified the jarring disparity where Table view uses a plain-text peek drawer (`TableRecordPeek.ts`), Calendar uses a detail panel (`RecordDetailPanel.ts`), and Board/Gallery/List have no peek support at all.
4. **Grouped Table DOM Bloat**: Both tracks flagged the nested repeating `<table>`/`<thead>` architecture in `TableRenderer.ts:157-191` as redundant and visually noisy.
5. **Summary Detachment**: Both tracks recommended replacing floating summary chips with a column-aligned `<tfoot>` calculation row.
6. **Accessibility & Touch Deficits**: Both tracks noted that `DropdownField` completely lacks listbox keyboard navigation and touch hit targets across the app fall well below 44px.

### Methodological Differences & Distinct Emphasis
- **`devin-gemini` (Gemini 3.7 Flash High)** emphasized **tactile visual ergonomics and layout presentation**:
  - Developed rich visual layout cards for the "Add View" workflow.
  - Championed direct-manipulation micro-interactions: interactive star ratings, slider progress tracks, and inline tag removal glyphs (`✕`).
  - Solved Kanban layout breakage by designing true horizontal swimlanes for 2D grouping.
  - Focused on visual feedback: inline shake validation animations (`@keyframes db-shake`), formula diagnostic `#ERROR!` badges, and multi-source gallery cover previews.
- **`codex-luna` (GPT-5.6-Luna xhigh)** emphasized **formal state machines, lifecycle ownership, and structural contracts**:
  - Formalized interaction lifecycles: `DragDropFeedbackState` transaction phases (`over/pending/committed/failed`) replacing fragile CSS timer timeouts.
  - Designed an interaction-scope registry to replace dangerous document-level `:hover` shortcut stealing.
  - Championed data-layer integrity: freezing column schemas during filtering to prevent disappearing columns, and adding explicit data-mutation disclosures on cross-lane board moves.
  - Solved embedding parity by proposing shared keyboard navigation controllers for embedded database codeblocks.

### Unique Contributions of Each Track
- **Uniquely from `devin-gemini`**:
  - Formula builder playground with live sample-row evaluation on 3 real database rows (`FormulaModal.ts:44-59`).
  - Mobile Kanban swipe-snapping (`scroll-snap-type: x mandatory`) with pagination indicator pill bar.
  - Dynamic self-referencing variable `$this.path` for modular note templates in embedded databases.
  - 1-click quick-create in relation cell pickers when search queries have no exact match.
  - Workday auto-scroll and live red time indicator line in Calendar time grids.
- **Uniquely from `codex-luna`**:
  - Shared result diagnostics contract (source vs filtered vs limit vs unscheduled counts) across the row pipeline.
  - Interaction snapshot capturing focus, selection, and active editor before row patching or refreshing.
  - Decoupling full schema inventory from view visibility in row detail sheets.
  - Shared table keyboard navigation controller attached to embedded database codeblocks.
  - View-local "Open record in" user configuration setting.

---
SYNTHESIS DONE: 10 ranked + 89 backlog items
