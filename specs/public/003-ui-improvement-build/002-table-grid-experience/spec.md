---
title: "Feature Specification: Table and Grid Experience"
description: "High-density table/grid surface modernization: unified sticky grouped headers, column-aligned calculation tfoot, trailing add-column affordance, interactive cell pickers, SVG grip row menu, frozen schema filtering, density modes, and WAI-ARIA grid semantics."
trigger_phrases:
  - "table grid experience"
  - "grouped table sticky header"
  - "table calculation tfoot"
  - "trailing add column header"
  - "column resize auto fit"
  - "single click cell picker"
  - "frozen column schema"
  - "svg row drag grip"
  - "row density modes"
  - "wai aria grid semantics"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/002-table-grid-experience"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled table and grid experience feature specification"
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
      session_id: "ui-build-002"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Table and Grid Experience

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `001-empty-and-first-run-states`, successor `003-popovers-menus-elevation`.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
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
The table/grid view is the primary data surface of the Note Database plugin, but its user experience is compromised by structural layout stutter, hidden affordances, and interaction friction:
1. **Repeating Grouped Table Headers (`src/views/TableRenderer.ts:157-191`, `styles.css:6183-6223, 6285-6288`)**: In grouped mode (`renderGroupedTable`), the renderer creates a nested `.db-table-wrap > table.db-table` for *every individual group*, duplicating the entire column header row (`this.renderHeader`) and sticky positioning coordinates. A view with 8 groups renders 8 identical sets of 10 column headers stacked down the page, causing severe visual stutter and DOM bloat.
2. **Spatially Detached Summary Calculations (`src/views/SummaryRenderer.ts:170-210`, `styles.css:3425-3515`)**: Aggregations (Sum, Count, Average, etc.) render as floating chips inside `.db-summary` at the bottom of the container instead of aligning directly beneath their respective column widths in a native `<tfoot>`. Users cannot determine which column an aggregate belongs to without reading the textual label prefix.
3. **Missing Trailing `+` Add Column Header (`src/views/TableRenderer.ts:440-455`, `styles.css:4086-4120`)**: The table header row iterates strictly over existing columns. There is no trailing `+` header button to create properties directly from the grid, forcing users to open view settings or column menus.
4. **Destructive Header Click & Hidden Menu Trigger (`src/views/ColumnHeaderController.ts:21-47`, `styles.css:4105-4208`)**: Clicking anywhere on `<th>` immediately runs `sortByColumn`, clobbering existing multi-sort rules. The column options trigger is literal `"..."` text hidden behind hover (`opacity: 0`), making property configuration undiscoverable on touch and inaccessible to keyboard users.
5. **Double-Click Latency on Interactive Cell Pickers (`src/views/CellRenderer.ts:418-430`)**: Editable option, status, and date cells share `makeEditable`: a click selects the cell while only `dblclick` starts inline editing, so direct single-click picker activation is missing and adds unnecessary interaction latency.
6. **Schema Instability Under Filtering (`src/data/ColumnConfig.ts:92-117`)**: `getVisibleColumns` auto-hides unpopulated fields based on the filtered row slice. When a filter narrows records to rows lacking a given field, that column abruptly disappears from the grid and shifts all subsequent columns.
7. **Literal Text Row Handle & Hidden Row Menu (`src/views/TableRenderer.ts:632-713`, `src/views/RowMenu.ts:30-48`, `styles.css:5044-5084`)**: Phase 002 owns `setupRowDrag()`; Phase 007 consumes and verifies this surface only for table batch dragging. Row drag handles render literal text `"⋮⋮"` with a no-op click listener, while row-level actions (open note, insert above/below, duplicate, delete) are buried in a right-click context menu.
8. **Visual Clutter & Header Hover Padding Jitter (`src/views/CellRenderer.ts:183-204`, `styles.css:4168`, `styles.css:4240-4247`)**: Phase 002 owns the generic empty-cell CSS block at `styles.css:4240-4247`; Phase 007 consumes and verifies this surface only for formula diagnostics. Unpopulated cells render repeated `"empty"` / `"空"` labels, and `th:hover` applies dynamic `padding-right: 32px`, constantly shifting column header text during mouse movement.

### Purpose
Establish a modern, high-density, accessible table/grid surface inspired by **AppFlowy**, **Notion**, and **Anytype**:
- Replace multi-table nested `<thead>` duplication with a unified single sticky table header and lightweight collapsible group divider bands.
- Create an isolated `TableFooterRenderer` (`src/views/TableFooterRenderer.ts`) rendering a native column-aligned `<tfoot>` calculation row with hover `+ Calculate` hint.
- Add a trailing `+` Add Column header button directly launching `CreatePropertyModal`.
- Upgrade column headers with dedicated 3-state visual sort indicators, non-destructive modifier multi-sort gestures, and double-click resize auto-fit; Phase 008 owns `aria-sort`.
- Enable instant single-click activation for status, select, date, and checkbox cells while retaining roving cell focus.
- Freeze default column schemas so active filtering never alters visible column definitions.
- Replace `"⋮⋮"` with an SVG grip icon (`lucide:grip-vertical`) providing a click-to-open `RowMenu` anchor.
- Remove textual "empty" clutter, eliminate header hover padding jitter, and consume the 3 row density modes (compact, default, comfortable) defined by Phase 005.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Unified Grouped Grid Architecture**: Refactor `TableRenderer.ts:88-191` to render grouped tables within a single continuous table structure featuring a single sticky `<thead>`, shared colgroups, and collapsible group divider rows (`tr.db-group-divider-row`).
- **Column-Aligned Table Calculation Footer (`<tfoot>`)**: Create isolated `TableFooterRenderer.ts` and integrate native `<tfoot>` into `TableRenderer.ts:69-86` with column-aligned cells, hover `+ Calculate` hint, and dropdown aggregation picker consuming `src/data/Aggregate.ts`.
- **Trailing `+` Add Column Header**: Add `th.db-add-column-th` at the end of `<thead>` in `TableRenderer.ts:440-455` triggering `CreatePropertyModal` (`src/views/modals/CreatePropertyModal.ts:9-70`).
- **Semantic Column Header & Multi-Sort**: Upgrade `ColumnHeaderController.ts:21-47` and `ColumnMenu.ts:227-237` with persistent touch-safe menu triggers, visual 3-state sort indicators, multi-sort index badges (`▲1`, `▼2`), and non-destructive modifier-click sort appending; Phase 008 owns the `aria-sort` attributes.
- **Double-Click Auto-Fit Resize**: Wire `dblclick` on `.db-resize-handle` in `ColumnHeaderController.ts:49-87` to invoke `estimateAutoColumnWidth` (`src/views/ColumnWidth.ts:39-61`).
- **Stable Column Schema Across Filtering**: Update `ColumnConfig.ts:92-117` to base visibility on source schema/unfiltered rows so filtering does not remove empty columns.
- **Single-Click Cell Pickers**: Enable single-click activation for Select, Status, and Date cells through `CellRenderer.ts:418-430` while maintaining keyboard and range selection compatibility.
- **SVG Grip Drag Handle & Clickable Row Menu**: Phase 002 owns `setupRowDrag()` at `TableRenderer.ts:632-713`; replace `"⋮⋮"` text with SVG icon (`lucide:grip-vertical`) and bind single-click to open `RowMenu.ts:30-48`. Phase 007 consumes and verifies this surface only for table batch dragging.
- **Clean Empty Cell Placeholders**: Phase 002 owns the generic empty-cell CSS block at `styles.css:4240-4247`; replace repeated `"empty"` / `"空"` labels in `CellRenderer.ts:183-204` with clean whitespace and subtle hover outlines. Phase 007 consumes and verifies this surface only for formula diagnostics.
- **Group-Header Selection Checkbox**: Add tri-state selection checkboxes (checked, unchecked, indeterminate) to group headers in `TableRenderer.ts:122-150` feeding `src/data/RangeSelection.ts:1-51`.
- **Contextual Column-Menu Filter Action**: Add the scoped filter action at the column-menu construction (`ColumnMenu.ts:58-66`) and route it through the column-menu bridge (`DatabaseView.ts:6197-6208`) to seed filter rules; cell and row context menus remain on `RowMenu`.
- **Header Jitter Elimination & Hover Insertion Line**: Remove dynamic padding in `styles.css:4168` and add hover in-between row insertion line with `+` button in `TableRenderer.ts:501-550`.
- **Vertical Line Drop Indicator for Column Reorder**: Replace background highlights with a 2px vertical accent line indicator during column header dragging (`ColumnHeaderController.ts:96-142`, `styles.css:4165-4209`).
- **Configurable Row Density Consumption**: Consume the `--db-row-height-*` tokens defined by Phase 005 (Compact 28px, Default 34px, Comfortable 40px) in `TableRenderer.ts:74-86` and the view density setting.
- **Table DOM Handoff for Phase 008 Grid Semantics**: Keep the unified table, header, row, and cell DOM stable for Phase 008's WAI-ARIA contract; this phase does not add `role="grid"` or related ARIA annotations.

### Out of Scope
- Empty and first-run onboarding states (Phase 001: `001-empty-and-first-run-states`).
- Floating popover viewport collision flipping and auto-close timer deletion (Phase 003: `003-popovers-menus-elevation`).
- Toolbar 4-cluster reorganization and WAI-ARIA tablist view switcher (Phase 004: `004-toolbar-and-view-controls`).
- Vault-wide status/tag color token calibration (Phase 005: `005-design-tokens-typography`).
- Board Kanban swimlanes and Gallery card size presets (Phase 006: `006-views-parity-polish`).
- WAI-ARIA grid annotations (Phase 008: `008-mobile-and-accessibility`); this phase supplies the stable table DOM that Phase 008 annotates.
- Formula error feedback and tag/link cell micro-actions (Phase 007: `007-micro-interactions`); this phase leaves the cell rendering extension points available.
- Automated note-body writes, dynamic backlink sync, or background analytics (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/TableFooterRenderer.ts` | Create | Isolated module for column-aligned `<tfoot>` calculation row rendering, hover `+ Calculate` hint, and aggregation selector |
| `src/views/TableFooterRenderer.test.ts` | Create | Unit tests for table calculation footer aggregation and column alignment |
| `src/data/ColumnConfig.test.ts` | Create | Unit tests verifying stable column schema during filtering |
| `src/data/RangeSelection.test.ts` | Create | Unit tests for group checkbox selection-state calculation |
| `src/views/TableRenderer.ts` | Edit | Unified grouped header (`:88-191`), trailing `+` th (`:440-455`), SVG row grip (`:647-673`), row insert line (`:501-550`), and stable table DOM for Phase 008 |
| `src/views/CellRenderer.ts` | Edit | Single-click picker activation (`:418-430`) and clean empty placeholder (`:183-204`) |
| `src/views/ColumnHeaderController.ts` | Edit | Persistent menu trigger (`:36-47`), dblclick resize auto-fit (`:49-87`), drag drop vertical line indicator (`:96-142`), multi-sort modifier (`:21-27`) |
| `src/views/ColumnMenu.ts` | Edit | Semantic sort actions (`:227-237`), filter by value action insertion (`:58-66`) |
| `src/views/RowMenu.ts` | Edit | Expose click-to-open anchor and row action items (`:30-48`) |
| `src/views/ColumnWidth.ts` | Edit | Auto-fit calculation measurement integration (`:39-61`) |
| `src/data/RangeSelection.ts` | Edit | Tri-state group selection integration (`:1-51`) |
| `src/data/ColumnConfig.ts` | Edit | Stable column schema inference across filtered row slices (`:92-117`) |
| `src/data/types.ts` | Edit | Consume the Phase 005 density names and footer calculation config types |
| `src/data/DataSource.ts` | Edit | Parse and serialize the per-view row density setting |
| `src/views/DatabaseView.ts` | Edit | Non-destructive multi-sort appending (`:10220-10241`), filter-by-value menu bridge (`:6197-6208`), row density settings |
| `src/views/EmbeddedDatabaseRenderer.ts` | Edit | Route the shared table renderer's density, footer, auto-fit, and row-menu callbacks in embedded views |
| `src/views/ViewConfigPanelRenderer.ts` | Edit | Render the table-only row density selector |
| `src/views/TableColumnLayoutSync.ts` | Edit | Keep utility-column widths aligned with the shared table colgroup |
| `src/i18n.ts` | Edit | Localized strings for calculation kinds, add column tooltip, density labels, filter by value |
| `styles.css` | Edit | Grouped table single-header (`:6183-6223, 6285-6288`), tfoot styling (`:3425-3515`), row density token consumption (`:4070-4077`), grip icon (`:5044-5084`), jitter-free header hover (`:4168`) |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Deduplicate Grouped Table theads into Single Sticky Header | In grouped mode (`TableRenderer.renderGroupedTable()`, `src/views/TableRenderer.ts:88-191`), maintain a single global sticky `<thead>` matching table colgroups; render groups as collapsible divider rows (`tr.db-group-divider-row`) spanning full colwidth with group label, count, collapse triangle, and inline summaries. |
| REQ-002 | Column-Aligned Table Calculation Footer (`<tfoot>`) | An isolated component `TableFooterRenderer` (`src/views/TableFooterRenderer.ts`) renders a native `<tfoot>` at table base (`TableRenderer.ts:69-86`); each cell aligns 1:1 with its column width; uncalculated columns reveal hover `+ Calculate` hint; clicking opens calculation dropdown menu. |
| REQ-003 | Trailing `+` Add Column Header Button | Table header row (`TableRenderer.renderHeader()`, `src/views/TableRenderer.ts:440-455`) renders trailing `th.db-add-column-th` with `+` icon button that directly launches `CreatePropertyModal` (`src/views/modals/CreatePropertyModal.ts:9-70`). |
| REQ-004 | Semantic Column Header, Sort Indicators & Multi-Sort Gesture | Column headers (`ColumnHeaderController.ts:21-47`) replace literal `"..."` with accessible icon button (`type="button"`); visual sort indicators show the current direction; multi-sort displays order badges (`▲1`, `▼2`); modifier-click (`Shift`+click) appends sort rules without clearing existing sort stack. Phase 008 owns the `<th>` `aria-sort` attribute. |
| REQ-005 | Double-Click Column Resize Handle Auto-Fit | Double-clicking (`dblclick`) `.db-resize-handle` on column headers (`ColumnHeaderController.ts:49-87`) executes `estimateAutoColumnWidth()` (`src/views/ColumnWidth.ts:39-61`), applies optimal width to `ViewConfig`, and triggers layout sync. |
| REQ-006 | Stable Column Schema Across Filter Operations | `ColumnConfig.getVisibleColumns()` (`src/data/ColumnConfig.ts:92-117`) evaluates default column presence against source schema/unfiltered rows so active filtering never causes empty columns to abruptly vanish or reorder. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-007 | Single-Click Activation for Interactive Cell Pickers | Single-clicking Select, Status, Date, or Checkbox cells through `CellRenderer.ts:418-430` immediately opens pickers or toggles checkbox while establishing cell selection; double-click and Enter/F2 remain authoritative for inline text editing. |
| REQ-008 | SVG Grip Drag Handle with Click-to-Open Row Menu | Phase 002 owns `setupRowDrag()` at `TableRenderer.ts:632-713`; replace literal `"⋮⋮"` text with SVG icon (`lucide:grip-vertical`), preserve the table drag payload contract, and make clicking open `RowMenu` (`src/views/RowMenu.ts:30-48`) anchored to the grip. Phase 007 consumes and verifies this surface only for table batch dragging. |
| REQ-009 | Clean Whitespace Placeholders for Empty Cells | Phase 002 owns the generic empty-cell CSS block at `styles.css:4240-4247`; `CellRenderer.ts:183-204` eliminates repeated textual `"empty"` / `"空"` labels, and unpopulated editable cells render clean empty whitespace with subtle hover outline and tooltip hint. Phase 007 consumes and verifies this surface only for formula diagnostics. |
| REQ-010 | Group-Header Selection Checkbox with Indeterminate State | Group headers in `TableRenderer.ts:122-150` render group-level selection checkbox reflecting checked, unchecked, and indeterminate states (`cb.indeterminate = true`); clicking toggles selection for all visible group rows across `src/data/RangeSelection.ts:1-51`. |
| REQ-011 | Contextual Filter Action in Column Menu | The column-menu construction and bridge (`src/views/ColumnMenu.ts:58-66`, `DatabaseView.ts:6197-6208`) include the scoped filter action and append the corresponding `FilterRule`; cell and row context menus remain owned by `RowMenu`. |
| REQ-012 | Eliminate Header Hover Padding Shift (Jitter-Free Headers) | `styles.css:4168, 4178-4208` removes dynamic `padding-right: 32px` on `th:hover`; header labels remain visually stationary during pointer hover. |
| REQ-013 | Hover In-Between Row Insertion Line with Quick Add (`+`) | `TableRenderer.ts:501-550` and `styles.css:4660-4667` render hover insertion line between table rows with centered `+` button triggering `createEntry` with `{ beforePath, afterPath }`. |
| REQ-014 | Vertical Line Drop Indicator for Column Reorder | Column header drag-and-drop renders crisp 2px vertical accent line on target boundary (`ColumnHeaderController.ts:96-142`, `styles.css:4165-4209`) rather than whole-cell background highlight. |
| REQ-015 | Consume Phase 005 Row Density Tokens (Compact / Default / Comfortable) | `TableRenderer.ts:74-86` and `src/data/types.ts` consume the Phase 005 tokens from `styles.css:4070-4077`: Compact (28px), Default (34px), and Comfortable (40px), configurable per view in `ViewConfig.rowDensity`; this phase does not define competing tokens. |
| REQ-016 | Stable Table DOM Handoff for Phase 008 WAI-ARIA Grid Contract | `TableRenderer.ts:60-120, 422-455, 501-549` provides the unified table, header, row, and cell structure that Phase 008 annotates with grid semantics; this phase does not add `role="grid"`, `role="gridcell"`, `aria-sort`, or related ARIA attributes. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Grouped tables with 5+ groups render exactly 1 sticky `<thead>` header; column widths stay aligned across all groups with zero header duplication.
- **SC-002**: Column calculations (Sum, Average, Count, Min, Max, etc.) align 1:1 with table columns in a native `<tfoot>` row; hover reveals `+ Calculate` hint for uncalculated columns.
- **SC-003**: Clicking the trailing `+` column header button opens `CreatePropertyModal` and appends newly created properties directly to the grid.
- **SC-004**: Double-clicking a column resize handle automatically resizes the column to fit the widest visible cell content.
- **SC-005**: Applying a filter that narrows rows so a column has only empty values preserves that column in the grid without schema jumping.
- **SC-006**: Single-clicking Select, Status, Date, and Checkbox cells immediately opens dropdown pickers or toggles boolean state without requiring double-click.
- **SC-007**: Row drag handles render SVG 6-dot grip icons (`lucide:grip-vertical`) and clicking opens `RowMenu`.
- **SC-008**: Empty cells render clean whitespace without `"empty"` / `"空"` text labels.
- **SC-009**: Group header checkboxes support indeterminate states for partial selection and toggle all visible group rows.
- **SC-010**: Opening a column menu and choosing its filter action appends a filter rule and filters the view immediately; cell and row context menus remain owned by `RowMenu`.
- **SC-011**: Moving the pointer across column headers causes zero horizontal text jitter.
- **SC-012**: Hovering between rows reveals an insertion line with a `+` button creating a note at that position.
- **SC-013**: Switching the Phase 005 row density modes (Compact, Default, Comfortable) dynamically adjusts row height and typography without table reload.
- **SC-014**: Table markup remains structurally stable for Phase 008 to apply and verify the full WAI-ARIA Grid contract; this phase does not duplicate that annotation work.
- **SC-015**: Rendering any table/grid view causes zero frontmatter writes (iCloud-safe display-only).
- **SC-016**: Unit tests in `src/views/TableFooterRenderer.test.ts` and `src/data/ColumnConfig.test.ts` pass cleanly under `npx vitest run`.

### Acceptance Scenarios

- **Scenario 1**: **Given** a grouped database table, **when** the user scrolls vertically past group 1 into group 3, **then** exactly one `<thead>` header remains pinned at the top and columns stay vertically aligned with group rows.
- **Scenario 2**: **Given** a numeric column "Amount", **when** the user hovers over its footer cell and clicks `+ Calculate`, **then** selecting "Sum" computes the total and displays it aligned under the "Amount" column.
- **Scenario 3**: **Given** a table view, **when** the user clicks the trailing `+` header button, **then** `CreatePropertyModal` opens; upon submitting, the new column appears immediately at the right end of the table.
- **Scenario 4**: **Given** an existing sort rule on column "Status", **when** the user Shift-clicks column "Priority", **then** a secondary sort rule is appended (`▲2`) without clearing the sort rule on "Status".
- **Scenario 5**: **Given** a narrow column "Title" with truncated text, **when** the user double-clicks the resize handle on the right edge of "Title", **then** the column expands to fit the widest title cell.
- **Scenario 6**: **Given** a database with an empty "Notes" column, **when** a filter is applied matching 3 records, **then** the "Notes" column remains visible in the grid.
- **Scenario 7**: **Given** a status cell, **when** the user single-clicks the status badge, **then** the status dropdown menu opens on the first click.
- **Scenario 8**: **Given** a table with 4 rows in group "Active", **when** the user selects 1 row, **then** the group header checkbox displays an indeterminate horizontal line; clicking it selects all 4 rows.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Grouped table single-table refactor breaks group drag-and-drop or expand/collapse patch paths | Regresses group row reordering or expand state | Retain group key data attributes on divider rows and data rows (`data-note-database-group-key`); preserve `getGroupVisibleCount` slicing |
| Risk | Single-click cell picker conflicts with range selection and cell focus | Accidental dropdown opens during multi-cell selection drag | Single-click immediately opens pickers only for interactive types (Select, Status, Date); pointer-drag gestures and Shift-click remain reserved for range selection |
| Risk | Calculation tfoot performance on large tables (5,000+ rows) | Calculation lag on scroll or render | Reuse pure functions from `src/data/Aggregate.ts` over pre-extracted arrays; calculate only for visible columns |
| Risk | Double-click resize auto-fit canvas measurement latency | UI freeze on wide tables with many rows | Sample visible rows with cached 2D canvas context in `estimateAutoColumnWidth`, bounding execution time to < 10ms |
| Dependency | `src/data/Aggregate.ts` (Rollup Aggregation Pack) | Calculation math source of truth | Reuses pure functions (`min`, `max`, `median`, `range`, `earliest`, `latest`, `percentEmpty`, `percentFilled`) |
| Dependency | `CreatePropertyModal` (`src/views/modals/CreatePropertyModal.ts`) | Target for trailing `+` button | Calls existing modal class without modifying modal internals |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 02) | Target citations and backlog mapping | Requirements trace directly to synthesis Ranked Recs #5, #7, Quick Wins #4, #5, #6, and Table Backlog items |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Single-header grouped tables reduce DOM node count by > 70% on multi-group views compared to nested table instantiations, maintaining 60fps scrolling on long tables.
- **NFR-P02**: Footer calculations execute in single-pass O(N) over visible rows; footer rendering adds < 5ms DOM creation overhead.
- **NFR-P03**: Double-click auto-fit width calculates optimal column boundaries in < 15ms.

### Security
- **NFR-S01**: Zero external network calls, analytics, or telemetry; pure local presentation with native Obsidian Lucide icons; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: rendering tables, calculating footers, toggling density, and hovering affordances produce 0 writes to note frontmatter or bodies.
- **NFR-R02**: Mobile-safe: table horizontal scrolling retains sticky header synchronization; touch targets provide minimum 44px hit envelopes with `touch-action: manipulation` on phone and tablet devices.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Grouped table with 0 total rows**: Grouped table wrapper renders colgroups and `<thead>` with a centered empty banner inside `<tbody>` across the full colSpan (consistent with Phase 001).
- **Group with 0 rows (empty group)**: Group divider row renders with count `0`, collapse toggle, and group-level selection checkbox; group body renders lightweight empty drop slot without breaking colgroup alignment.
- **Column containing 100% empty values**: Empty column remains visible in the grid (frozen schema contract); footer cell shows `+ Calculate` hint on hover.
- **Column with single row**: Footer calculation displays single-value result; range equals `0`; median equals that value.
- **Multi-sort with 5+ rules**: Header badges display rule sequence numbers (`▲1`, `▲2`, `▼3`, `▲4`, `▼5`); tooltip reveals complete sort rule description.
- **Table with 50+ columns**: Trailing `+` button remains at the far right edge of the horizontal scroll container; single sticky header scrolls horizontally in lockstep with table body and footer.

### Error Scenarios
- **Auto-fit on empty column**: Double-click resize handle defaults to minimum column width (80px) matching column header label length.
- **Readonly database mode**: Trailing `+` column header, hover row insert line, and cell edit pickers are hidden; calculation footer remains visible in read-only mode.

### Concurrent Operations
- Rapidly toggling group collapse states cleanly animates row visibility without orphaning DOM nodes or misaligning footer colgroups.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 10/25 | Isolated `TableFooterRenderer`, grouped table single-header refactor, localized header/cell affordances |
| Risk | 6/25 | Display-only UI improvements; underlying database schema and persistence untouched |
| Research | 6/20 | Complete target citations and interaction patterns established across both research tracks |
| **Total** | **22/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Calculation storage**: Column calculations are stored in `ViewConfig.columnCalculations?: Record<string, SummaryKind>` (matching existing summary rule format) with fallback to legacy `summaryRules`.
- **Row density persistence**: Consumes Phase 005's per-view `ViewConfig.rowDensity?: "compact" | "default" | "comfortable"` scale; defaults to `"default"` (34px) if unset.
- **Header modifier key**: `Shift`+click appends/toggles multi-sort on desktop; column context menu provides explicit "Add Ascending Sort" / "Add Descending Sort" actions for touch/mobile.
- **Group divider row element**: Rendered as `tr.db-group-divider-row > td[colspan]` inside the shared `<tbody>` for semantic HTML table compliance and native colgroup width sharing.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../001-empty-and-first-run-states/spec.md`](../001-empty-and-first-run-states/spec.md)
- **Research Synthesis**: `specs/public/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 02 (Devin Track)**: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-02.md`
- **Research Iteration 02 (Codex Track)**: `specs/public/002-ui-improvement-research/research/codex-luna/iteration-02.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
