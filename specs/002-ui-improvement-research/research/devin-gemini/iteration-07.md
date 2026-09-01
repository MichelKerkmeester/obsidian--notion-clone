# Research Iteration 07: AppFlowy UI/UX Patterns Worth Adopting (Grid/Board/Calendar, Field Editors, Theming, Row Detail)

Track: `devin-gemini` (Gemini 3.7 Flash High)  
Focus Area: AppFlowy UI/UX patterns worth adopting (grid/board/calendar, field editors, theming, row detail).  
Target Artifact: `specs/002-ui-improvement-research/research/devin-gemini/iteration-07.md`  

---

## Focus

AppFlowy is an open-source, local-first knowledge management system and database powerhouse built on Flutter and Rust. It has established industry-leading UX patterns for multi-view databases, visual field editors, robust document-style row inspection, and clean theme customization.

Unlike cloud-dependent tools, AppFlowy operates under constraints similar to Obsidian: local data ownership, high performance, cross-platform responsiveness, and modular extensibility.

This iteration deeply evaluates the Note Database plugin codebase across four key AppFlowy domains:
1. **Grid, Board & Calendar Views**: Column collapsing mechanics, card property label toggles, unscheduled notes calendar drawers, and per-view date/color drivers (`src/views/BoardRenderer.ts`, `src/views/CalendarRenderer.ts`, `src/views/TableRenderer.ts`, `src/views/SummaryRenderer.ts`).
2. **Field Editors & Specialized Field Types**: Interactive ratings, slider progress bars, rich number/currency formatters (custom prefix/suffix, thousand separators, decimal precision), URL/Email/Phone action affordances, and formula builder diagnostics (`src/views/CellRenderer.ts`, `src/views/NumberDisplayRenderer.ts`, `src/views/modals/FormulaModal.ts`, `src/views/ColumnMenu.ts`, `src/data/NumberDisplay.ts`, `src/data/EuroFormat.ts`).
3. **Theming & View-Level Appearance**: Table zebra striping, vertical/horizontal gridline toggles, row density modes, and custom color hex pickers with contrast preview (`src/views/OptionColorPicker.ts`, `src/views/ViewConfigPanelRenderer.ts`, `styles.css`).
4. **Row Detail & Document Inspector**: Document cover banners, page icon headers, collapsible "empty properties" accordions, and inline note content integration (`src/views/TableRecordPeek.ts`, `src/views/RecordDetailPanel.ts`, `src/views/RowMenu.ts`).

---

## Current-UI findings (file:line)

### 1. Board Column Collapsing Lacks Vertical Pill Layout and Space Reclamation
- **Location**: `src/views/BoardRenderer.ts:312-351`, `styles.css:7066-7080`
- **Issue**: In `BoardRenderer.ts:312-351`, when a column is collapsed (`columnCollapsed = true`), the renderer simply sets class `.is-collapsed` and returns before rendering cards. However, in CSS (`styles.css:7066-7080`), the collapsed column maintains standard horizontal width constraints, leaving a bulky, empty vertical box with truncated horizontal text.
- **UX Impact**: Collapsing columns does not reclaim horizontal screen real estate. In databases with 8+ kanban groups (e.g. Backlog, Todo, In Progress, In Review, QA, Staging, Done, Cancelled), collapsing inactive columns fails to bring active columns into view, requiring tedious horizontal scrolling.

### 2. Board Cards Forced Label Clutter (Missing "Show Property Name" View Toggle)
- **Location**: `src/views/BoardRenderer.ts:637-657`, `src/views/ViewConfigPanelRenderer.ts:450-490`, `styles.css:7289-7320`
- **Issue**: When rendering card fields (`BoardRenderer.ts:652`), the code unconditionally creates `const label = item.createSpan({ text: col.label });` for every single visible property. There is no setting in `ViewConfig` or `ViewConfigPanelRenderer` to toggle property name visibility on cards.
- **UX Impact**: Kanban cards suffer from severe visual noise. Displaying status pills, tags, priority badges, and dates alongside their redundant column labels (e.g. "Status: In Progress", "Priority: High", "Due: 2026-09-01") doubles the vertical height of cards and prevents clean, scannable chip layouts.

### 3. Calendar View Lacks "Unscheduled Notes / No-Date Tray" Drawer
- **Location**: `src/views/CalendarRenderer.ts:118-124`, `src/data/CalendarTimelineModel.ts:80-120`, `styles.css:12600-12650`
- **Issue**: In `CalendarRenderer.ts:118-124`, records that lack a date value in `config.calendarStartDateField` are completely filtered out during model construction (`buildCalendarMonthModel`). There is no UI drawer, sidebar, or tray to surface these undated notes.
- **UX Impact**: Notes without dates become invisible in the calendar view. Users cannot triage backlog items or schedule tasks by dragging cards from an "Unscheduled" tray directly onto specific calendar days, breaking a fundamental calendar planning workflow.

### 4. Calendar View Lacks 1-Click "Color Events By [Property]" Configuration
- **Location**: `src/views/CalendarRenderer.ts:226, 583`, `src/views/ViewConfigPanelRenderer.ts:800-880`, `styles.css:12700-12750`
- **Issue**: Calendar event segments apply colors via `this.applyEventColor(eventEl, segment.event.color)` (`CalendarRenderer.ts:226, 583`), which strictly inherits from complex conditional formatting rules or Obsidian theme accents. There is no simple, 1-click "Color events by: [Select / Status / Tag Field]" selector in the calendar view configuration drawer.
- **UX Impact**: Color-coding calendar events by category (e.g. Personal 🟢, Work 🔵, Urgent 🔴) requires authoring multi-step conditional formatting rules rather than selecting a single grouping property.

### 5. Rating & Progress Bar Cells Are Read-Only (Non-Interactive Click/Hover)
- **Location**: `src/views/CellRenderer.ts:300-309`, `src/views/NumberDisplayRenderer.ts:17-51`, `styles.css:4380-4420`
- **Issue**: When a number column is styled as `rating`, `progress`, or `ring` (`CellRenderer.ts:305-307`), `renderNumberValue` injects the SVG graphics and returns immediately. Hovering over rating stars or clicking a star/bar does not trigger any value update. Editing requires double-clicking the cell, which opens a raw text input box (`<input type="text">`), typing a number, and pressing Enter.
- **UX Impact**: Severe interaction friction. Users expect to click the 4th star to set a 4-star rating or drag a progress bar, rather than double-clicking and typing "4" or "75" manually.

### 6. Number & Currency Properties Lack Granular Formatting (Prefix, Suffix, Separators, Precision)
- **Location**: `src/views/ColumnMenu.ts:115-134`, `src/data/NumberDisplay.ts:1-50`, `src/data/EuroFormat.ts:1-20`, `src/views/CellRenderer.ts:231-239`
- **Issue**: The plugin hardcodes currency rendering to Euro (`formatEuroCurrency(num)` at `CellRenderer.ts:233`). Furthermore, number formatting provides only plain, rating, progress, and ring styles, lacking controls for:
  1. Currency Symbol: `$`, `€`, `£`, `¥`, `CHF`, `kr`, custom.
  2. Thousand Separator: Comma (`1,000.00`), Dot (`1.000,00`), Space (`1 000.00`), Apostrophe (`1'000.00`).
  3. Decimal Precision: `0`, `1`, `2`, `3`, `4` decimal places.
  4. Unit Suffix: `%`, `kg`, `hrs`, `pts`, `GB`, custom.
- **UX Impact**: International users and scientific/financial workflows cannot format numbers according to regional or domain standards without writing complex computed formula columns.

### 7. Formula Modal Lacks Live Sample-Row Evaluation & Token Highlighting
- **Location**: `src/views/modals/FormulaModal.ts:44-59, 116-160`, `src/data/FormulaTokenizer.ts:1-50`, `styles.css:10850-10950`
- **Issue**: While `FormulaModal.ts` lists functions and syntax descriptions, the formula editor is a plain `<textarea>` (`line 120`). It lacks:
  1. Real-time evaluation output against 3 live sample rows from the current database.
  2. Visual syntax token chips (differentiating field references `[Field]` 🏷️, built-in functions `SUM()` ⚡, and string literals `"text"` 🔤).
  3. Inline error explanations detailing why an expression failed (e.g. "Expected number, received string in argument 2").
- **UX Impact**: Authoring formulas is error-prone. Users must save the modal, inspect table cells, and reopen the modal repeatedly to debug syntax errors.

### 8. URL, Email, and Phone Fields Treated as Generic Text Without 1-Click Actions
- **Location**: `src/views/CellRenderer.ts:246-279`, `src/data/TextLink.ts:1-40`, `styles.css:4450-4490`
- **Issue**: URLs and links are handled through `textRenderMode: "link"` or raw regex parsing. The plugin lacks dedicated `url`, `email`, and `phone` column types with tailored 1-click action triggers:
  - URL: External link icon + 1-click "Copy URL" icon button.
  - Email: `mailto:` launch button + 1-click "Copy Email" icon button.
  - Phone: `tel:` protocol trigger.
- **UX Impact**: Interacting with contact details or web links requires double-clicking to select text or relying on fragile hover link detection.

### 9. Missing View-Level Appearance Customization (Zebra Striping & Gridline Toggles)
- **Location**: `styles.css:4070-4075`, `src/views/ViewConfigPanelRenderer.ts:250-320`
- **Issue**: The table view enforces a uniform white/dark background for all rows (`styles.css:4075`). There are no view-level settings to enable alternate row shading (zebra striping) or toggle vertical/horizontal gridline visibility.
- **UX Impact**: In wide tables with 20+ columns and 100+ rows, tracking data horizontally across the screen causes visual fatigue and eye drift.

### 10. Option Color Picker Restricted to 16 Static Presets Lacking Custom Hex & Contrast Preview
- **Location**: `src/views/OptionColorPicker.ts:15-48`, `src/data/ColumnTypes.ts:146-150`, `styles.css:5610-5670`
- **Issue**: `openOptionColorPicker` renders exactly 16 static color dots (`OPTION_COLORS` in `ColumnTypes.ts:146-150`). Users cannot enter custom Hex/RGB codes (`#3b82f6`) or choose pastel/saturated shades. Furthermore, the picker provides no preview of how the chosen color renders in Dark mode.
- **UX Impact**: Users cannot match company brand colors or specific visual coding schemes, and custom tag colors are impossible.

### 11. Row Detail Inspector Lacks Document-Style Cover Banner & Page Icon Header
- **Location**: `src/views/TableRecordPeek.ts:130-170`, `src/views/RecordDetailPanel.ts:153-196`, `styles.css:16317-16428`
- **Issue**: `TableRecordPeek` and `RecordDetailPanel` render as plain technical property boxes. When opened, they lack:
  1. A document cover image banner (with "Add Cover" / "Change Cover" hover buttons).
  2. A prominent Emoji/Lucide page icon overlapping the header.
  3. An auto-resizing page title header.
- **UX Impact**: Inspecting a record feels sterile and detached from the rich markdown note it represents.

### 12. Row Detail Sheet Lacks "Hide Empty Properties" Collapsible Accordion
- **Location**: `src/views/RecordDetailPanel.ts:187-215`, `src/views/TableRecordPeek.ts:146-156`, `styles.css:7604-7635`
- **Issue**: Both detail inspectors iterate through all columns in the database schema and render every empty field. In databases with 15–30 properties (e.g. CRM, research library, project tracker), opening a newly created note presents a massive wall of empty inputs.
- **UX Impact**: High cognitive friction. Users must scroll through dozens of blank fields to find relevant populated data, with no "+ N empty properties" accordion to tuck them away.

---

## Anytype/AppFlowy patterns

### 1. AppFlowy: Slim Vertical Kanban Column Collapse
- **Pattern**: When a board column is collapsed in AppFlowy, its width smoothly shrinks to `38px`. The column title rotates to vertical writing mode (`writing-mode: vertical-rl`), paired with a compact badge showing the card count (e.g. `[14]`) and a top expand chevron.
- **Why it is better**: Enables users to collapse 4–6 inactive workflow columns (e.g. "Icebox", "Done", "Archived"), keeping active work columns centered without horizontal overflow.

### 2. AppFlowy & Notion: Clean Board Cards with "Hide Property Names" Toggle
- **Pattern**: Board view settings include a simple toggle: `Show property names`. When disabled, fields render as self-contained value chips (e.g. `[🟡 High]` `[📅 Tomorrow]` `[👤 Alex]`) without the prefix `Priority:`, `Due Date:`, `Assignee:`.
- **Why it is better**: Reduces card height by 40–50%, prevents visual clutter, and delivers clean, modern Kanban boards.

### 3. AppFlowy: "Unscheduled Notes" Side Drawer in Calendar
- **Pattern**: A collapsible side tray in the Calendar view displays all records where the date field is unset. Users can drag any card from the tray directly into a calendar day slot. The app immediately assigns that date to the note frontmatter and transitions the card into a calendar event.
- **Why it is better**: Perfect for backlog planning. Users can quickly schedule tasks without opening each note and manually typing dates.

### 4. AppFlowy: 1-Click "Color By Field" in Calendar & Board Views
- **Pattern**: Calendar and Board view options feature a dedicated `Color By` dropdown. Selecting a Select, Status, or Tag property instantly tints all event cards / board cards with their assigned option color.
- **Why it is better**: Eliminates the overhead of creating dozens of manual conditional formatting rules for standard status/category color coding.

### 5. AppFlowy: Direct-Manipulation Interactive Rating & Slider Progress Cells
- **Pattern**: 
  - **Rating**: Hovering over the rating cell highlights stars up to the cursor; a single click commits the score.
  - **Progress Bar**: Clicking the progress bar displays a mini floating slider popover (or direct drag handle) for 1-click completion adjustments.
- **Why it is better**: Cuts micro-interaction time from 5 seconds (double-click → text selection → typing number → Enter) down to 200ms (single click).

### 6. AppFlowy: Comprehensive Number & Currency Formatter
- **Pattern**: The number column settings drawer provides:
  - **Type**: Number, Currency, Percent, Rating, Progress Bar.
  - **Currency**: Preset symbols (`$`, `€`, `£`, `¥`, `₩`, `₹`, `CHF`, `CAD`, `AUD`) or custom string.
  - **Format**: Separator styles (`1,234.56`, `1.234,56`, `1 234,56`, `1'234.56`).
  - **Precision**: Decimals from `0` to `5`.
  - **Custom Suffix/Prefix**: Prepend or append arbitrary unit strings (`/mo`, `pts`, `kg`, `km/h`).
- **Why it is better**: Supports global financial, engineering, and personal tracking use cases without custom formulas.

### 7. AppFlowy: Formula Playground with Live Sample Evaluation & Syntax Badges
- **Pattern**: The formula editor displays a 2-panel layout:
  - Top/Left: Expression editor with syntax highlighting and color-coded field chips (`[Price]` 🏷️).
  - Bottom/Right: Live test table showing the calculated result on 3 real rows from the database, accompanied by real-time syntax validation and error tooltips.
- **Why it is better**: Provides instant feedback, allowing users to verify formula correctness before saving.

### 8. AppFlowy: Dedicated URL, Email & Phone Action Buttons
- **Pattern**: URL, Email, and Phone fields render with contextual micro-actions on hover:
  - URL: Direct click opens link; trailing `copy` icon copies URL to clipboard.
  - Email: Direct click opens email client; trailing `copy` icon copies address.
  - Phone: Direct click triggers system dialer.
- **Why it is better**: Balances fast navigation with quick clipboard access without cluttering the cell.

### 9. AppFlowy: View Appearance Center (Zebra Shading & Gridlines)
- **Pattern**: The view configuration panel includes an "Appearance" section offering:
  - `Row Density`: Compact (28px), Medium (34px), Comfortable (42px).
  - `Zebra Striping`: Subtle alternating row background tint (`var(--background-secondary)`).
  - `Vertical Gridlines`: Toggle vertical column dividers on/off.
  - `Horizontal Gridlines`: Toggle horizontal row borders on/off.
- **Why it is better**: Gives users full aesthetic control over data density and readability.

### 10. AppFlowy: Color Palette Swatches with Custom Hex Input & Contrast Checker
- **Pattern**: The tag/status color picker presents curated palette swatches plus a `Custom Hex` input field. When entering custom hex colors, the editor automatically calculates text luminance and applies optimal black or white text to guarantee WCAG AA contrast.
- **Why it is better**: Allows complete brand customization while preventing unreadable text contrast failures.

### 11. AppFlowy: Document-Style Page Header in Row Detail
- **Pattern**: Opening a row detail view renders a full document canvas:
  - Banner cover image (custom gradient, local vault image, or URL) with hover reposition/replace actions.
  - Page Icon (Emoji or Lucide) overlapping the banner.
  - Large editable title heading.
  - 2-column Property Sheet below.
- **Why it is better**: Unifies database records with Obsidian's document model, making records feel like rich notes.

### 12. AppFlowy: "Hide Empty Properties" Accordion in Record Detail
- **Pattern**: When viewing a record, populated properties appear in the main property list. Unset/empty properties are collapsed into an accordion at the bottom: `▶ 12 empty properties`. Clicking expands them for editing; typing into any empty field automatically promotes it to the active property list.
- **Why it is better**: Keeps record detail cards concise and readable, eliminating the overwhelming wall of blank inputs.

---

## Recommendations

| # | Change | Target (file:line) | Inspired By | Effort | Constraint Check |
|---|---|---|---|:---:|---|
| 1 | **Slim Vertical Kanban Column Collapse**: Refactor `.db-board-column.is-collapsed` to collapse width to 38px, orient title vertically (`writing-mode: vertical-rl`), render card count pill, and provide 1-click expand trigger. | `src/views/BoardRenderer.ts:312-351`, `styles.css:7066-7080` | AppFlowy Board View | **M** | Safe: display-only CSS & DOM layout refactoring; mobile-safe; rebase-clean. |
| 2 | **"Show Property Names" View Toggle for Board Cards**: Add `boardShowFieldLabels?: boolean` (default `false`) to `ViewConfig`; render values as clean chips without redundant label text when disabled. | `src/views/BoardRenderer.ts:637-657`, `src/views/ViewConfigPanelRenderer.ts:450-490`, `styles.css:7289-7320` | AppFlowy / Notion Board Cards | **S** | Safe: view configuration setting; display-only rendering; no file writes. |
| 3 | **"Unscheduled Notes" Side Tray in Calendar View**: Add a collapsible side drawer to `CalendarRenderer` listing records with empty date fields; enable dragging cards onto calendar day slots to assign dates. | `src/views/CalendarRenderer.ts:118-124`, `src/data/CalendarTimelineModel.ts:80-120`, `styles.css:12600-12650` | AppFlowy Calendar Tray / Notion Calendar | **L** | Safe: writes date to frontmatter via existing `updateEventDates`; iCloud-safe; mobile-safe. |
| 4 | **1-Click "Color Events By Field" in Calendar View**: Add a `calendarColorByField` selector in `ViewConfigPanelRenderer` to automatically color event cards by a selected Select, Status, or Tag property. | `src/views/CalendarRenderer.ts:226, 583`, `src/views/ViewConfigPanelRenderer.ts:800-880`, `styles.css:12700-12750` | AppFlowy Calendar Color Coding | **M** | Safe: display-only color mapping; reads in-memory option colors; zero note writes. |
| 5 | **Direct Single-Click Rating & Progress Bar Interaction**: Enable single-click rating selection (and hover star highlight) and click/drag slider adjustments for progress bars directly in table cells and card fields. | `src/views/CellRenderer.ts:300-309`, `src/views/NumberDisplayRenderer.ts:17-51`, `styles.css:4380-4420` | AppFlowy Interactive Cells | **M** | Safe: commits number value via existing `editCell` pipeline; touch/pointer safe. |
| 6 | **Comprehensive Number & Currency Formatter**: Expand `NumberDisplayConfig` with custom currency symbols (`$`, `€`, `£`, `¥`, custom), separator styles (comma, dot, space), decimal precision (0–5), and custom unit suffix (`%`, `kg`, `hrs`). | `src/views/ColumnMenu.ts:115-134`, `src/data/NumberDisplay.ts:1-50`, `src/data/EuroFormat.ts:1-20`, `src/views/CellRenderer.ts:231-239` | AppFlowy Number Formatter | **M** | Safe: display formatting only; numbers stored as standard numeric values in frontmatter. |
| 7 | **Formula Builder Live Sample Evaluation & Syntax Token Chips**: Upgrade `FormulaModal` with real-time formula evaluation on 3 live database sample rows, tokenized syntax highlighting, and inline type-error diagnostics. | `src/views/modals/FormulaModal.ts:44-59, 116-160`, `src/data/FormulaTokenizer.ts:1-50`, `styles.css:10850-10950` | AppFlowy Formula Playground | **M** | Safe: in-memory formula evaluation; zero file mutations; MIT-forkable. |
| 8 | **Dedicated URL, Email & Phone Field Actions**: Add specialized cell renderers for `url`, `email`, and `phone` column types with 1-click external open and 1-click copy-to-clipboard icon buttons. | `src/views/CellRenderer.ts:246-279`, `src/data/TextLink.ts:1-40`, `styles.css:4450-4490` | AppFlowy Field Actions | **S** | Safe: display-only clipboard/link helpers; touch and desktop friendly. |
| 9 | **View Appearance Settings: Zebra Striping & Gridline Toggles**: Add view appearance options to toggle alternating row background shading (`.db-table-zebra`) and show/hide vertical and horizontal gridlines. | `styles.css:4070-4075`, `src/views/ViewConfigPanelRenderer.ts:250-320` | AppFlowy Table Appearance | **S** | Safe: pure CSS layout styling; configurable per view; rebase-clean. |
| 10 | **Custom Hex Color Input & Contrast Preview in Color Picker**: Upgrade `OptionColorPicker` to support custom hex color strings (`#rrggbb`) with automatic dark/light mode luminance calculation for tag and status options. | `src/views/OptionColorPicker.ts:15-48`, `src/data/ColumnTypes.ts:146-150`, `styles.css:5610-5670` | AppFlowy Color System | **M** | Safe: stores color string in schema; pure CSS dynamic styling; 100% theme-safe. |
| 11 | **Document-Style Cover Banner & Page Icon Header in Record Detail**: Enhance `TableRecordPeek` and `RecordDetailPanel` with a document cover image banner, prominent page icon header, and auto-resizing title heading. | `src/views/TableRecordPeek.ts:130-170`, `src/views/RecordDetailPanel.ts:153-196`, `styles.css:16317-16428` | AppFlowy Row Detail / Notion Pages | **M** | Safe: display-only document layout; reads existing cover/icon metadata; iCloud-safe. |
| 12 | **"Hide Empty Properties" Accordion in Record Detail Sheet**: Collapse empty/unset properties in record detail inspectors into an expandable `▶ N empty properties` accordion at the bottom of the property sheet. | `src/views/RecordDetailPanel.ts:187-215`, `src/views/TableRecordPeek.ts:146-156`, `styles.css:7604-7635` | AppFlowy Record Inspector | **S** | Safe: display-only DOM grouping; simplifies dense schemas; mobile-friendly. |

---

## Open threads for later iterations

- **Iteration 8 (Views beyond table: Board, Gallery, Calendar, List parity)**: Audit Kanban multi-card drag-and-drop, Gallery cover image focal point cropping, Timeline dependency connections, and List view hierarchical indentations.
- **Iteration 9 (Micro-interactions & feedback)**: Refine cell hover glow transitions, fill-handle drag snapping, optimistic state updates, and animated badge creation.
- **Iteration 10 (Mobile / responsive / accessibility)**: Audit touch tap target dimensions (min 44×44px), mobile swipe gestures, safe-area padding for mobile navigation bars, and full WAI-ARIA role hierarchy.
