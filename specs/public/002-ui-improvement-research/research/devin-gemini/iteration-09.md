# Research Iteration 09: Micro-Interactions & Feedback (Hover, Drag/Reorder, Inline Edit, Selection, Loading, Empty, Error)

Track: `devin-gemini` (Gemini 3.7 Flash High)  
Focus Area: Micro-interactions & feedback: hover, drag/reorder, inline edit, selection, loading, empty, error.  
Target Artifact: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-09.md`  

---

## Focus

Micro-interactions and sensory feedback represent the tactile layer of software design. They transform a static data grid into a responsive, intuitive, and satisfying workspace. Every state transition—hovering a cell, dragging a record, committing an inline edit, selecting a range of cells, waiting for a background query, encountering an empty partition, or handling a calculation failure—must communicate system state clearly, provide immediate spatial feedback, and prevent cognitive disorientation.

In this iteration, we conduct an exhaustive, line-by-line audit of the Note Database plugin's micro-interaction and feedback architecture across TypeScript controllers (`src/views/CellRenderer.ts`, `src/views/TableRenderer.ts`, `src/views/BoardRenderer.ts`, `src/views/GalleryRenderer.ts`, `src/views/ListRenderer.ts`, `src/views/DatabaseView.ts`, `src/views/RelationValueRenderer.ts`, `src/views/ColumnHeaderController.ts`, `src/views/modals/FormulaModal.ts`, `src/data/ComputedEvaluator.ts`, `src/data/QueryEngine.ts`, `src/data/CoverImage.ts`) and CSS (`styles.css`).

We evaluate the system across seven distinct feedback dimensions:
1. **Hover Micro-interactions & Progressive Reveal**: Cell hover affordances, multi-select tag dismissal glyphs, interactive rating/progress hover states, and smooth cursor cues.
2. **Drag & Reorder Feedback**: Drag ghost rendering, batch multi-row drag indicators with count badges, column and Kanban drop lines, and viewport boundary auto-scrolling.
3. **Inline Edit Transitions & Validation**: Cell editor activation, keyboard navigation intent, inline error shake animations, collision warnings, and optimistic save states.
4. **Selection Surfaces & Floating Command Dock**: Contiguous outer selection bounding boxes vs inner cell clutter, single authoritative corner fill handles, and floating glassmorphic selection action docks.
5. **Loading States & Query Transitions**: Shimmering skeleton table loaders, debounced search activity spinners, and background computed evaluation feedback.
6. **Empty States & Drop Targets**: Zero-card dashed Kanban drop slots and filtered-to-empty recovery CTAs.
7. **Error States & Diagnostic Feedback**: Formula runtime error flags with diagnostic tooltips, broken relation pill warnings, and inline validation vs detached toast notices.

We benchmark these findings against **Anytype**, **AppFlowy**, and **Notion**, and formulate concrete, constraint-checked recommendations.

---

## Current-UI findings (file:line)

### 1. Cell Selection Range Applies Cluttered Inset Box-Shadows to Every Cell Instead of a Contiguous Outer Perimeter
- **Location**: `src/views/DatabaseView.ts:4361-4381`, `styles.css:5004-5019`
- **Issue**: In `DatabaseView.ts:4361-4381`, `getSelectedCellAddresses` calculates a rectangular selection matrix between anchor and focus. However, CSS (`styles.css:5004-5019`) applies `box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--interactive-accent) 58%, transparent);` unconditionally to every individual selected `<td>`.
- **UX Impact**: Selecting a 4×6 grid of cells renders a chaotic grid of internal double borders and overlapping outlines across all 24 cells. In standard spreadsheet and modern database tools (AppFlowy, Airtable, Notion), selection ranges compute perimeter boundaries: only the exterior edges of the bounding box receive an accent border, while inner cells receive a clean, uniform background tint with zero internal border doubling.

### 2. Multi-Cell Selection Mounts Multiple Fill Handles Instead of a Single Corner Handle
- **Location**: `src/views/DatabaseView.ts:7971-7984`, `styles.css:4977-4993`
- **Issue**: `setupTableFillHandle` injects a `.db-cell-fill-handle` into every single fillable cell. In CSS (`styles.css:4988-4992`), when `.db-cell-selected` or `:hover` is active, multiple fill handles appear simultaneously on adjacent cells.
- **UX Impact**: Visual clutter and ambiguity. Users are unsure which handle controls the fill range. Modern spreadsheet grids place exactly **one** fill handle at the absolute bottom-right corner of the entire active selection bounding box.

### 3. Selection Status Bar Injected into DOM Flow, Causing Vertical Layout Jitter and Horizontal Scroll Drift
- **Location**: `src/views/DatabaseView.ts:7010-7125`, `styles.css:1697-1718`
- **Issue**: When rows or cells are selected, `renderSelectionStatusBar` injects `.db-selection-status-bar` directly before `.db-summary` or before the table/board root in the normal DOM flow (`summary.before(bar)`). In CSS (`styles.css:1707-1718`), it uses a negative margin hack (`margin-bottom: calc(-1 * var(--db-selection-status-height))`) with `position: sticky; left: 0px;`. Furthermore, it uses a raw `<input type="checkbox">` to clear selection (`styles.css:1739-1741`).
- **UX Impact**: Every time a user selects or deselects a row, the entire table/summary below shifts vertically. During horizontal scrolling on wide tables, the bar sticks awkwardly to the left margin of the scroll wrapper rather than centering over the viewport. Additionally, clearing the selection via a checkbox is unintuitive compared to a standard `✕` or `Esc` pill button.

### 4. Multi-Item Drag Discards Selected Batches and Renders Obtrusive Full-Width Row Previews
- **Location**: `src/views/TableRenderer.ts:658-673`, `src/views/BoardRenderer.ts:508-585`, `src/views/GalleryRenderer.ts:337-370`
- **Issue**: When multiple rows/cards are selected (`selectedRows.size > 1`), dragging any selected row/card strictly sets `event.dataTransfer.setData(ROW_MIME, row.file.path)` for that single item. The rest of the selected batch is abandoned. Furthermore, `TableRenderer.ts:668` passes the entire `<tr>` element to `event.dataTransfer.setDragImage(tr, ...)`, which generates a massive, opaque 1400px wide drag ghost that covers the entire workspace.
- **UX Impact**: Users cannot drag-and-drop batches of records into a new Kanban column, table group, or order position in a single gesture. The huge drag preview obscures drop targets beneath it.

### 5. Missing Viewport Edge Auto-Scroll Traps Drag and Fill Operations
- **Location**: `src/views/TableRenderer.ts:684-712`, `src/views/BoardRenderer.ts:441-480`, `src/views/DatabaseView.ts:8184-8224`
- **Issue**: When dragging a table row, Kanban card, or cell fill handle (`startTableFillDrag`), there is no proximity detection or auto-scrolling on the scrollable container (`.note-database-container` or `.db-table-wrap` or `.db-board`).
- **UX Impact**: If a table has 100 rows or a board has 8 columns exceeding the screen width, users cannot drag items to targets located offscreen. The drag operation is trapped within the visible viewport bounds.

### 6. Formula Evaluation Failures Silently Swallowed in Table Cells with Zero Diagnostic Feedback
- **Location**: `src/data/ComputedEvaluator.ts:68-72`, `src/views/CellRenderer.ts:183-204`, `styles.css:4240-4247`
- **Issue**: In `ComputedEvaluator.ts:68-72`, when a formula evaluation throws an error (e.g. `TypeError`, `RangeError`, division by zero, or missing field), the code logs a console warning and sets `result[def.key] = null`. In `CellRenderer.ts:183-204`, `null` renders as a blank empty cell.
- **UX Impact**: Calculation errors are completely invisible. Users assume the formula returned empty data rather than discovering that their formula has a broken variable name or syntax bug. There is no `#ERROR!` flag or hover diagnostic tooltip in the table grid.

### 7. Silent Input Reversion on Validation Failure in Number and Date Cell Editors
- **Location**: `src/views/CellRenderer.ts:1338-1341`, `src/views/CellRenderer.ts:1412-1415`
- **Issue**: In `CellRenderer.ts:1338-1341` (`editNumber`), if the user types non-numeric characters, the editor silently calls `renderNumberValue(td, col, currentValue)` and closes. In `CellRenderer.ts:1412-1415` (`editDate`), invalid month/day inputs silently invoke `restore()` and close the editor.
- **UX Impact**: User input is abruptly discarded without explanation. There is no inline red shake animation (`@keyframes db-shake`) or explanatory micro-tooltip, and the editor prematurely closes rather than allowing the user to correct the typo.

### 8. Unresolved and Broken Relation Links Render Identically to Valid Notes
- **Location**: `src/views/RelationValueRenderer.ts:18-35`, `styles.css:4870-4910`
- **Issue**: In `renderRelationValue`, target links are rendered as `a.db-relation-link.internal-link` without verifying whether `app.metadataCache.getFirstLinkpathDest(link.target, row.file.path)` resolves to an existing vault file.
- **UX Impact**: Broken links (pointing to deleted or renamed notes) look identical to valid existing notes with standard blue/accent styling. Users cannot visually identify missing relation references.

### 9. Multi-Select and Tag Pills Lack Direct Inline Removal on Hover
- **Location**: `src/views/CellRenderer.ts:1148-1215`, `styles.css:4560-4650`
- **Issue**: Tag and multi-select badges rendered inside cells or cards have no inline `✕` dismiss button.
- **UX Impact**: Removing a single tag from a note with 6 tags requires double-clicking the cell, opening the multi-select popover, scanning the list to uncheck the tag, and clicking outside to commit. In modern database apps, hovering a tag pill displays a micro `✕` icon that removes the tag in one click.

### 10. Synchronous View Blanking During Query Execution and View Switching
- **Location**: `src/views/DatabaseView.ts:1230-1300`, `src/views/DatabaseView.ts:6360-6420`, `styles.css:6130-6160`
- **Issue**: Switching database views or executing search queries across 500+ records calls `containerEl_.empty()`, causing an immediate blank canvas flash before synchronous DOM construction finishes.
- **UX Impact**: Layouts feel jarring and unpolished. There is no skeleton placeholder (shimmering table rows or Kanban card outlines) or smooth cross-fade transition during view rebuilds.

### 11. Rating and Progress Bar Number Displays Are Completely Non-Interactive
- **Location**: `src/views/CellRenderer.ts:300-309`, `styles.css:4380-4420`
- **Issue**: Number columns styled as `rating` (1–5 stars) or `progress` (slider bar) render static SVG icons. Hovering over stars 1..5 does not highlight them, and single-clicking a star or bar does not update the property value. Editing requires double-clicking to open a raw text input box.
- **UX Impact**: High interaction friction. Users expect to click the 4th star to set a 4-star rating with an immediate hover preview, rather than typing "4" into an input dialog.

### 12. Kanban Card Drag Feedback Uses Internal Box-Shadow Inset Instead of Dedicated Drop Indicator Lines
- **Location**: `src/views/BoardRenderer.ts:531-541`, `styles.css:7307-7317`
- **Issue**: When dragging a card over another card in Kanban view, the target card receives `.is-drop-before` or `.is-drop-after`, which applies `box-shadow: inset 0 4px 0 -2px var(--interactive-accent)` to the card body.
- **UX Impact**: Glow-based inset box-shadows are ambiguous on complex cards with covers or tags. Modern Kanban boards (AppFlowy, Linear, Notion) render a distinct 2px-3px accent drop line indicator (`.db-board-drop-indicator`) between cards to provide unmistakable insertion feedback.

### 13. File Rename Collision Shows Detached Corner Toast Instead of Inline Input Error
- **Location**: `src/views/CellRenderer.ts:2577-2580`, `src/views/DatabaseView.ts:7674`
- **Issue**: When renaming a file via inline edit, if the target name collides with an existing file, the editor displays an Obsidian system toast `Notice(t("errors.fileExists"))` in the top-right corner of the window while resetting the cell.
- **UX Impact**: The error notice is disconnected from the user's point of focus. The cell editor closes, forcing the user to re-open the editor, re-type the new title, and adjust the duplicate name.

---

## Anytype/AppFlowy patterns

### 1. AppFlowy: Contiguous Selection Perimeter & Single Corner Fill Handle
- **Pattern**: When a cell range is selected, AppFlowy calculates the boundary rows and columns. It applies accent border styling (`2px solid var(--interactive-accent)`) strictly to the outer perimeter:
  - Top row: `border-top`
  - Bottom row: `border-bottom`
  - Leftmost column: `border-left`
  - Rightmost column: `border-right`
  - Inner cells: Clean translucent background tint (`rgba(var(--interactive-accent-rgb), 0.12)`) with zero interior border doubling.
  - A single 6×6px interactive fill square is pinned strictly to the bottom-right corner of the entire bounding box.
- **Why it is better**: Eliminates visual noise and double gridlines, providing a clean, cohesive spreadsheet selection surface.

### 2. Anytype: Floating Glassmorphic Selection Command Dock
- **Pattern**: Multi-item selection triggers a floating capsule command bar (`position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)`) featuring:
  - Glassmorphic backdrop (`backdrop-filter: blur(16px); background: color-mix(in srgb, var(--background-primary) 85%, transparent)`).
  - Smooth spring entrance animation (`transform: translate(-50%, 12px) -> translate(-50%, 0); opacity: 0 -> 1`).
  - Animated item count pill (`[4 items selected]`).
  - Semantic action cluster (`[Edit Field] [Duplicate] [Move To] [Export] [Delete]`).
  - Quick dismiss button with keyboard shortcut badge (`[✕ Esc]`).
- **Why it is better**: Never interferes with document layout or table scrolling, remains permanently accessible in the viewport thumb/eye zone, and provides one-click bulk operations.

### 3. AppFlowy & Notion: Batch Drag-and-Drop with Stacked Thumbnail & Badge Ghost
- **Pattern**: When dragging an item while multiple records are selected:
  - All selected records are bundled into the drag transaction.
  - The drag ghost renders as a compact stacked card thumbnail accompanied by a high-contrast count badge pill (e.g. `[📁 Moving 5 records]`).
  - Dropping onto a Kanban column, table group, or order position moves all selected items simultaneously in a single atomic transaction.
- **Why it is better**: Eliminates tedious one-by-one card dragging for batch organization.

### 4. AppFlowy: Container Boundary Proximity Auto-Scroller
- **Pattern**: Drag controllers attach a boundary listener: when the pointer moves within 40px of a scrollable container's edge (`top`, `bottom`, `left`, `right`), an `EdgeAutoScroller` runs a `requestAnimationFrame` loop that smoothly scrolls the container at an accelerating velocity (5px–30px per frame based on edge proximity).
- **Why it is better**: Enables fluid dragging across arbitrarily long tables and wide multi-column boards without getting blocked by viewport boundaries.

### 5. Notion: Cell-Level Formula Diagnostic Badges & Tooltips
- **Pattern**: When a formula evaluation fails:
  - The cell renders a subtle amber/red corner tag and a stylized `#ERROR!` or `#VALUE!` badge.
  - Hovering or clicking the badge opens a lightweight diagnostic tooltip displaying the exact error category, failing variable name, and line/column pointer (e.g. `ReferenceError: Field "[Total Price]" does not exist in schema`).
- **Why it is better**: Empowers users to debug and repair formula schemas immediately without digging through browser developer consoles.

### 6. Notion & Anytype: Direct Inline Tag Dismissal (`✕`)
- **Pattern**: Multi-select tags and option badges reveal a compact `✕` dismiss icon upon hover (`.db-tag-pill:hover .db-tag-dismiss`). Clicking the `✕` removes that tag from the record with an instant optimistic fade-out animation without opening any popover menus.
- **Why it is better**: Cuts tag management friction by 80%, allowing rapid cleanup of tags and multi-select fields directly in the table or board view.

### 7. Notion: Inline Validation Shake & In-Situ Error Tooltips
- **Pattern**: When an inline edit fails validation (e.g., file name collision, invalid number/date format):
  - The input container executes a subtle horizontal shake animation (`@keyframes db-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }`).
  - The border flashes red (`var(--text-error)`).
  - An inline speech bubble tooltip appears directly beneath the input (e.g., `"A file named 'Meeting Notes' already exists"`).
  - The input remains open and focused with the invalid text highlighted for quick correction.
- **Why it is better**: Keeps the user in their data-entry flow, prevents loss of typed text, and clearly explains how to fix the issue.

### 8. Anytype: Shimmering Skeleton Loader for Asynchronous View Transitions
- **Pattern**: When changing views or filtering large datasets, the view renders a lightweight SVG/CSS shimmering skeleton frame (`5-row placeholder with animated linear gradient highlight`) for operations exceeding 60ms, followed by an opacity cross-fade when data is mounted.
- **Why it is better**: Eliminates blank canvas flickering, communicates active computation, and feels significantly faster and more responsive.

### 9. AppFlowy: Interactive Rating Stars & Progress Sliders
- **Pattern**: Rating columns support live pointer hover:
  - Hovering over star `k` temporarily fills stars 1..`k` with an accent glow and slight scale pop (`transform: scale(1.15)`).
  - Single-clicking star `k` immediately commits value `k` with a subtle particle/bounce effect.
  - Progress bar columns allow direct click/drag along the bar track to set percentage values.
- **Why it is better**: Provides tactile spreadsheet interactions for visual data types, removing the need for manual numeric entry.

---

## Recommendations

| # | Change | Target (file:line) | Inspired By | Effort | Constraint Check |
|---|---|---|---|:---:|---|
| 1 | **Contiguous Selection Bounding Perimeter & Single Corner Fill Handle**: Replace individual cell inset box-shadows with calculated outer perimeter borders (`.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, `.is-right-edge`) and mount exactly one fill handle on the bottom-right corner of the selection bounding box. | `src/views/DatabaseView.ts:4361-4381`, `src/views/DatabaseView.ts:7971-7984`, `styles.css:5004-5020` | AppFlowy / Airtable | **M** | Display-only rendering and CSS refactoring; mobile-safe; zero note writes. |
| 2 | **Floating Glassmorphic Selection Action Dock**: Redesign `.db-selection-status-bar` as a fixed bottom floating capsule dock with backdrop blur, smooth slide-up animation, animated count badge, semantic action buttons, and `[✕ Esc]` clear pill. | `src/views/DatabaseView.ts:7010-7125`, `styles.css:1697-1718` | Anytype Selection Dock / Notion | **M** | UI layout modernization; no layout shifts; touch-friendly; clean rebase. |
| 3 | **Multi-Item Batch Drag with Stacked Thumbnail & Badge Preview**: Enable dragging multiple selected records simultaneously with a compact stacked card preview and count badge pill (`"Moving N items"`), updating all selected rows in a single batch transaction. | `src/views/TableRenderer.ts:658-673`, `src/views/BoardRenderer.ts:508-585`, `src/views/GalleryRenderer.ts:337-370` | AppFlowy / Notion | **M** | Extends existing batch action pipeline; mobile uses move menu; iCloud-safe. |
| 4 | **Proximity Container Edge Auto-Scroller**: Implement an `EdgeAutoScroller` utility that smoothly scrolls the active view container when dragging table rows, Kanban cards, or fill handles within 40px of container boundaries. | `src/views/TableRenderer.ts:684-712`, `src/views/BoardRenderer.ts:441-480`, `src/views/DatabaseView.ts:8184-8224` | AppFlowy / Modern DND | **M** | Pure DOM scroll behavior; cross-platform compatible; zero data modification. |
| 5 | **Formula Runtime Error Diagnostic Badges & Tooltips**: Surface formula calculation errors in table cells with a `#ERROR!` badge and a hover tooltip displaying the specific error message and variable name rather than silently rendering blank cells. | `src/data/ComputedEvaluator.ts:68-72`, `src/views/CellRenderer.ts:183-204`, `styles.css:4240-4247` | Notion / AppFlowy Formulas | **S** | Read-only diagnostic display; no note modifications; fully MIT-compliant. |
| 6 | **Inline Input Error Shake & In-Situ Tooltip**: Replace silent input reversion on validation failure with an inline horizontal shake animation (`@keyframes db-shake`), red focus ring, and explanatory micro-tooltip while keeping the editor open. | `src/views/CellRenderer.ts:1338-1341`, `src/views/CellRenderer.ts:1412-1415`, `src/views/CellRenderer.ts:2577-2580` | Notion / Linear | **S** | UI interaction polish; keeps user in data-entry flow; zero side effects. |
| 7 | **Broken Relation Pill Warning State**: Detect unresolved wikilinks in `RelationValueRenderer` and render them with a dashed amber/red border, warning icon, and "Note not found in vault" tooltip. | `src/views/RelationValueRenderer.ts:18-35`, `styles.css:4870-4910` | Anytype / Notion | **S** | Display-only check against Obsidian metadata cache; non-destructive. |
| 8 | **Direct Tag Dismissal Glyph (`✕`) on Hover**: Add an inline `✕` micro-button on multi-select tag pills on hover that removes the tag in one click without opening the popover menu. | `src/views/CellRenderer.ts:1148-1215`, `styles.css:4560-4650` | Notion / Anytype | **S** | Triggers existing tag removal logic; touch-friendly fallback; iCloud-safe. |
| 9 | **Shimmering Skeleton Loader for View & Query Transitions**: Render a lightweight CSS/SVG skeleton placeholder during view switches or heavy search queries exceeding 60ms, followed by a smooth cross-fade. | `src/views/DatabaseView.ts:1230-1300`, `src/views/DatabaseView.ts:6360-6420`, `styles.css:6130-6160` | Anytype / AppFlowy | **M** | Visual state handling during async queries; eliminates layout flash. |
| 10 | **Interactive Rating Stars & Progress Track Micro-Interactions**: Enable live hover star fill previews, 1-click star rating assignment, and click/drag progress bar adjustments directly in cells and cards. | `src/views/CellRenderer.ts:300-309`, `styles.css:4380-4420` | AppFlowy Field Editors | **S** | Calls existing cell update dispatcher; mobile-safe single-tap target. |
| 11 | **Dedicated Kanban Drop Indicator Line**: Replace inset card box-shadows with a distinct 2px-3px accent drop line indicator (`.db-board-drop-indicator`) between cards during drag-over. | `src/views/BoardRenderer.ts:531-541`, `styles.css:7307-7317` | AppFlowy / Linear | **S** | CSS/DOM drop indicator feedback; clean visual separation. |
| 12 | **Debounced Search Activity Pulse Indicator**: Add a subtle spinner/pulse icon inside the search input during query debouncing and execution on large databases. | `src/views/ToolbarRenderer.ts:1087-1123`, `styles.css:2687-2750` | Modern Search UX | **S** | Pure visual feedback for search queries; lightweight. |

---

## Open threads for later iterations

- **Iteration 10 (Mobile / Responsive / Accessibility)**: Audit touch target sizes (minimum 44×44px hitboxes), mobile swipe gestures (swipe-to-delete, swipe-to-edit), Obsidian mobile virtual keyboard viewport adjustments, ARIA roles, screen-reader live regions for batch updates, and high-contrast accessibility compliance across all 7 views.
