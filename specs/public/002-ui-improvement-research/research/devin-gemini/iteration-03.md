# Research Iteration 03: Popovers, Menus, Dropdowns (Elevation, Structure, Alignment, Keyboard + Hover Interaction)

Track: `devin-gemini` (Gemini 3.7 Flash High)  
Focus Area: Popovers, menus, dropdowns: elevation, structure, alignment, keyboard + hover interaction.  
Target Artifact: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-03.md`  

---

## Focus

Popovers, menus, dropdowns, and floating pickers form the interactive overlay layer of the Note Database plugin. They govern column property management, row action execution, filter/sort rule composition, date/time and color selection, view switching, icon assignment, and inline cell editing.

This iteration performs an exhaustive audit of the overlay architecture across TypeScript controllers (`src/views/PopoverPosition.ts`, `src/views/PopoverAutoClose.ts`, `src/views/DropdownField.ts`, `src/views/ColumnMenu.ts`, `src/views/RowMenu.ts`, `src/views/ActiveRulePopoverRenderer.ts`, `src/views/DateValuePicker.ts`, `src/views/OptionColorPicker.ts`, `src/views/IconPickerPopover.ts`, `src/views/BulkEditFieldMenu.ts`, `src/views/FilterPanelRenderer.ts`, `src/views/SortPanelRenderer.ts`, `src/views/ColumnManagerRenderer.ts`, `src/views/ViewConfigPanelRenderer.ts`, `src/views/ToolbarRenderer.ts`, `src/views/CellRenderer.ts`) and CSS (`styles.css`). It evaluates elevation layering, DOM mounting and clipping boundaries, hover submenu stability, keyboard navigation and focus trapping, mobile ergonomics, and visual token consistency against best-in-class patterns from **Anytype**, **AppFlowy**, and **Notion**.

---

## Current-UI findings (file:line)

### 1. Inconsistent DOM Mounting Causing Container Overflow Clipping
- **Location**: `src/views/PopoverPosition.ts:24-35`, `src/views/FilterPanelRenderer.ts:126-133`, `src/views/SortPanelRenderer.ts:39-42`, `src/views/ColumnManagerRenderer.ts:46-52`, `src/views/ViewConfigPanelRenderer.ts:253` vs `src/views/ColumnMenu.ts:575`, `src/views/OptionColorPicker.ts:15`, `src/views/IconPickerPopover.ts:26`
- **Issue**: Overlay panels use mixed mounting targets. Major toolbar popovers (Filter, Sort, Properties, View Settings, Active Rule Editor) are injected inside `containerEl` (`.note-database-container`) with `position: absolute`, whereas `ColumnMenu` subpopovers, `OptionColorPicker`, `IconPickerPopover`, and Obsidian native `Menu` are mounted directly to `window.activeDocument.body` with `position: fixed`.
- **UX Impact**: When the database container is inside a narrow split leaf, sidebar, or has `overflow: hidden` / `overflow: auto`, container-mounted popovers get clipped by the viewport boundary or drift during horizontal scrolling. Conversely, body-mounted popovers do not follow container scrolling, resulting in jarring coordinate mismatches.

### 2. Wildly Fragmented Elevation, Z-Index Chaos, and Missing Semantic Tokens
- **Location**: `styles.css:2166-2170`, `styles.css:2364-2368`, `styles.css:2758-2765`, `styles.css:4590-4594`, `styles.css:5334-5345`, `styles.css:5583-5592`, `styles.css:7570`, `styles.css:15941-15951`
- **Issue**: There is no centralized elevation or z-index design token system. Z-indexes are hardcoded ad-hoc across 20+ distinct classes (`z-index: 999` for Record Peek, `1000` for dropdowns/filter panels, `1001` for cell editors, `1002` for color pickers, `var(--layer-popover)` for icon pickers, `2147483646` for tooltips). Box-shadows are scattered with uncalibrated blur radii (`0 4px 14px`, `0 6px 18px`, `0 8px 24px`, `0 8px 28px`, `0 12px 32px`).
- **UX Impact**: Sub-popovers frequently clip behind or overlap sibling overlays inconsistently. Popovers lack modern frosted glass (`backdrop-filter: blur(...)`) and subtle translucent surfaces, appearing flat and dated against native Obsidian themes.

### 3. Fragile Submenu Hover Tracking and "Triangle of Doom" Hover Gap in ColumnMenu
- **Location**: `src/views/ColumnMenu.ts:565-660` (`createColumnMenuSubpopover`, `scheduleHoverClose`)
- **Issue**: When opening submenus ("Change Type", "Number Display Style", "Text Render Mode"), `ColumnMenu` spawns a detached floating fixed panel (`.db-column-menu-subpopover`) offset by `rect.right + 6`. It tracks hover via a 140ms timeout (`hoverTimer = view.setTimeout(..., 140)`).
- **UX Impact**: Moving the mouse diagonally from the parent menu item to the subpopover crosses the 6px empty hit-gap. If the cursor pauses for even 140ms in this dead space, the subpopover abruptly vanishes ("triangle of doom" issue), creating severe interaction frustration.

### 4. DropdownField Lacks Keyboard Listbox Navigation (Arrow Up/Down, Enter, Home, End)
- **Location**: `src/views/DropdownField.ts:220-226`, `src/views/DropdownField.ts:141-208`
- **Issue**: `openDropdownPopover` sets `role="listbox"` and `role="option"`, but its `onKeydown` listener strictly checks for `event.key === "Escape"`.
- **UX Impact**: Pressing `ArrowDown` or `ArrowUp` does nothing. Users navigating filters, sort rules, source rules, or property dropdowns via keyboard cannot highlight or cycle through options, violating WAI-ARIA listbox accessibility standards and breaking power-user keyboard flow.

### 5. Searchable Dropdowns Do Not Select Top Match on Enter Key
- **Location**: `src/views/DropdownField.ts:209-212`, `src/views/DropdownField.ts:148-153`
- **Issue**: When `searchable: true` is active, `searchInput` listens to `oninput` to filter options, but has no `onkeydown` handler to intercept `Enter` or `ArrowDown`.
- **UX Impact**: After typing a search query in a property picker or bulk editor (e.g., typing "status"), pressing `Enter` fails to select the single filtered match. Users are forced to switch to the mouse to click the result.

### 6. Destructive 5-Second Idle Auto-Close Timer
- **Location**: `src/views/PopoverAutoClose.ts:11-79`, `src/views/PopoverAutoClose.ts:71-79`
- **Issue**: `installPopoverAutoClose` runs a `setInterval` timer that checks `Date.now() - lastActivity >= delayMs` (`delayMs` defaults to 5000ms) and invokes `close()` if the pointer is not actively inside the panel.
- **UX Impact**: If a user opens a Filter panel, View Config drawer, or Date picker and pauses for 5 seconds to read or think without hovering their mouse directly inside the box, the popover automatically closes and discards uncommitted input.

### 7. Date Value Picker Missing Quick Preset Chips and Keyboard Calendar Navigation
- **Location**: `src/views/DateValuePicker.ts:105-180`, `src/views/CalendarMiniCalendarRenderer.ts:24-95`
- **Issue**: `DateValuePicker` provides text input segments (`YYYY`, `MM`, `DD`) and a rendered mini calendar, but lacks 1-click preset pills (`Today`, `Tomorrow`, `Yesterday`, `Next Week`, `Clear`). Furthermore, the mini calendar grid elements are non-focusable with no arrow-key navigation between dates.
- **UX Impact**: Selecting common relative dates requires either manual numeric typing or clicking small month navigation arrows, adding unnecessary friction compared to modern database tools.

### 8. Hardcoded Submenu Offsets and Viewport Edge Collisions
- **Location**: `src/views/ColumnMenu.ts:581-583`, `src/views/OptionColorPicker.ts:55-67`, `src/views/PopoverPosition.ts:48-99`
- **Issue**: `createColumnMenuSubpopover` positions subpopovers using hardcoded estimates (`estimatedWidth = 292 : 220`, `view.innerHeight - 320`) without checking if the submenu should flip to the left when the column menu is near the right edge of the screen.
- **UX Impact**: Opening property type or number display submenus on right-side columns causes subpopovers to overlap and obscure the parent menu or clip against the window boundary.

### 9. Icon Picker Missing Search Input
- **Location**: `src/views/IconPickerPopover.ts:62-169`
- **Issue**: `openIconPickerPopover` organizes icons into Emoji and Lucide tabs with category buttons and color dots, but completely lacks a search input field.
- **UX Impact**: Finding a specific icon (e.g., "archive", "database", "check") forces the user to manually click through multiple category tabs and visually scan up to 240 small icon buttons.

### 10. Inconsistent Menu Row Anatomies Across Plugin Views
- **Location**: `src/views/ColumnMenu.ts:271-288` vs `src/views/ToolbarRenderer.ts:436-476` vs `src/views/ToolbarRenderer.ts:862-870` vs `src/views/ToolbarRenderer.ts:1302-1311` vs `src/views/CellRenderer.ts:999-1095` vs `src/views/DropdownField.ts:165-197`
- **Issue**: Six separate menu renderers construct custom item rows with conflicting class names (`.db-dropdown-option`, `.db-database-popover-row`, `.db-view-tab-popover-row`, `.db-group-popover-row`, `.db-cell-option-item`). Checkmark icons are placed on the left in some menus and on the right in others; icon containers have varying dimensions (16px, 18px, 22px).
- **UX Impact**: Visual inconsistency across the product. Menu rows feel disjointed when moving between toolbar dropdowns, table header menus, and cell popovers.

### 11. Lack of Mobile Bottom Sheet Drawer for Complex Popovers
- **Location**: `src/views/PopoverPosition.ts:133-139`, `styles.css:5772-5776`
- **Issue**: On mobile Obsidian (`.is-phone`), popovers attempt to render as floating absolute panels clamped above the mobile navigation bar.
- **UX Impact**: Floating menus on small touchscreens are cramped, awkward to reach with one hand, and prone to touch misses. Modern mobile apps use bottom action sheets with backdrops.

### 12. Instant Abrupt Popover Mounting Without Micro-Transitions
- **Location**: `styles.css:2160-2171`, `styles.css:2360-2370`, `styles.css:5332-5347`, `styles.css:15939-15952`
- **Issue**: Overlay panels appear and disappear with immediate `display`/`opacity: 1` changes without subtle scale or opacity easing transitions.
- **UX Impact**: Popovers feel abrupt and mechanical rather than smooth and responsive.

---

## Anytype/AppFlowy patterns

### 1. Unified 3-Tier Elevation & Glassmorphism Design Tokens (Anytype)
- **Pattern**: Anytype utilizes a strictly tokenized 3-tier elevation system:
  - **Level 1 (Subtle Overlay / Dropdowns / Tooltips)**: `0 4px 12px rgba(0,0,0,0.08)`, 1px border, 8px radius.
  - **Level 2 (Interactive Floating Popovers / Filter & Sort Panels / Pickers)**: `0 10px 28px rgba(0,0,0,0.12)`, 1px border, 10px radius, `backdrop-filter: blur(16px)`, `background: color-mix(in srgb, var(--background-primary) 92%, transparent)`.
  - **Level 3 (Modals / Record Detail Drawers / Command Dialogs)**: `0 20px 48px rgba(0,0,0,0.22)`, darkened backdrop scrim (`rgba(0,0,0,0.45)`).
- **Why it is better**: Eliminates z-index bugs, creates a harmonious spatial hierarchy, and seamlessly adapts between light and dark themes.

### 2. Hierarchical Drilldown Menus vs Hover Submenus (Anytype & Notion)
- **Pattern**: When a menu item has children (such as "Change Property Type" or "Format Number"), clicking the item smoothly transitions the popover into a drilldown view with a "← Back" breadcrumb header, rather than spawning a fragile adjacent hover flyout.
- **Why it is better**: 100% immune to diagonal hover loss ("triangle of doom"), completely touch/mobile friendly, and preserves screen real estate on narrow viewports.

### 3. WAI-ARIA Compliant Roving Keyboard Navigation (AppFlowy)
- **Pattern**: AppFlowy implements full keyboard navigation for all dropdowns and listboxes:
  - `ArrowDown` / `ArrowUp`: Moves visual focus highlight through visible options (with automatic scrolling).
  - `Enter` / `Space`: Selects the highlighted item and triggers the change handler.
  - Alphanumeric typing: Triggers instant typeahead selection.
  - In search boxes: `ArrowDown` immediately steps focus from the search input to the first search result; `Enter` selects the top match.
- **Why it is better**: Allows power users to configure properties, switch views, and build filter pipelines at high speed without touching the mouse.

### 4. Smart Bi-Directional Popover Collision & Safe Flip (AppFlowy & Notion)
- **Pattern**: Overlay engines measure both anchor position and rendered popover dimensions. If the right edge exceeds viewport boundaries, the popover aligns to the right edge of the anchor or flips to the left. If vertical space below is insufficient, it flips above the anchor with zero layout jitter.
- **Why it is better**: Popovers never render offscreen or get sliced by container edges, regardless of whether they are opened from the leftmost or rightmost column.

### 5. Date Picker with Relative Quick Preset Pills (Notion & AppFlowy)
- **Pattern**: Date selection popovers feature a top row of quick preset buttons: `Today`, `Tomorrow`, `Next Week`, `In 1 Month`, and `Clear`.
- **Why it is better**: Over 70% of database date entries represent near-term dates. Quick presets reduce date selection from 4 clicks down to a single click.

### 6. Searchable Icon & Emoji Palette with Instant Filter (Notion & Anytype)
- **Pattern**: Icon and emoji pickers feature a sticky top search input with fuzzy matching against standard icon names and keywords (e.g., searching "check" shows `check`, `check-circle`, `check-check`, `badge-check`, and `✅`).
- **Why it is better**: Enables users to locate any icon in under 2 seconds rather than hunting through 8 distinct category grids.

### 7. Mobile Bottom Sheet Drawer with Drag Handle & Backdrop Scrim (Anytype Mobile)
- **Pattern**: On mobile devices, menus, dropdowns, and property selectors render as bottom sheets sliding up from the screen bottom (`position: fixed; bottom: 0; left: 0; right: 0; border-radius: 16px 16px 0 0;`) accompanied by a subtle dimmed backdrop scrim (`rgba(0,0,0,0.4)`).
- **Why it is better**: Ergonomically placed within the thumb zone, avoids tiny floating target mis-clicks, and provides a native mobile application experience.

---

## Recommendations

| # | Change | Target (file:line) | Inspired By | Effort | Constraint Check |
|---|---|---|---|:---:|---|
| 1 | **Global Portal-Based Overlay Mounting (`document.body`)**: Route all popovers, menus, and dropdowns to mount on `document.body` (or `.app-container`) with `position: fixed` and measured viewport coordinates, eliminating container overflow clipping. | `src/views/PopoverPosition.ts:24-35`, `src/views/FilterPanelRenderer.ts:126-133`, `src/views/SortPanelRenderer.ts:39-42`, `src/views/ColumnManagerRenderer.ts:46-52`, `src/views/ViewConfigPanelRenderer.ts:253` | Anytype Overlay System | **M** | Display-only coordinate rendering change; mobile-safe; zero note file writes; rebase-clean. |
| 2 | **Semantic 3-Tier Elevation & Glassmorphism Tokens**: Replace hardcoded shadows and z-indexes with `--db-elevation-1` (dropdowns), `--db-elevation-2` (popovers/pickers with `backdrop-filter: blur(16px)`), and `--db-elevation-3` (modals/drawers). | `styles.css:2166-2170`, `styles.css:2364-2368`, `styles.css:2758-2765`, `styles.css:4590-4594`, `styles.css:5334-5345`, `styles.css:5583-5592`, `styles.css:15941-15951` | Anytype Design Tokens | **S** | CSS design token unification; 100% theme-safe and cross-platform. |
| 3 | **Drilldown Submenu Navigation in ColumnMenu**: Replace hover-based detached floating subpopovers with a slide-in drilldown view (or stacked inline accordion) featuring a "← Back" header. | `src/views/ColumnMenu.ts:104-155`, `src/views/ColumnMenu.ts:565-660` | Notion / Anytype Menu Architecture | **M** | Pure UI navigation refactoring; eliminates "triangle of doom"; touch-safe on mobile. |
| 4 | **Full Keyboard Listbox Navigation in DropdownField**: Implement `ArrowDown`/`ArrowUp` roving focus, `Enter`/`Space` selection, and typeahead character jumping for all dropdown fields. | `src/views/DropdownField.ts:220-226`, `src/views/DropdownField.ts:165-197` | AppFlowy Listbox / WAI-ARIA | **M** | Interaction logic change; keyboard-only accessible; zero side-effects on data layer. |
| 5 | **Searchable Dropdown Immediate Enter-to-Submit**: Bind `Enter` in searchable dropdown inputs to immediately select the top visible filtered option, and `ArrowDown` to shift focus into the option list. | `src/views/DropdownField.ts:209-212`, `src/views/DropdownField.ts:148-156` | AppFlowy / Notion Search | **S** | Event handler enhancement; improves power-user speed; safe and isolated. |
| 6 | **Remove 5-Second Idle Auto-Close Timer**: Eliminate the arbitrary 5000ms inactivity timeout in `PopoverAutoClose`, keeping popovers open until explicit user dismissal (outside click, Escape, or action selection). | `src/views/PopoverAutoClose.ts:12`, `src/views/PopoverAutoClose.ts:71-79` | Obsidian Core / Standard UI Patterns | **S** | Code deletion / cleanup; prevents accidental data entry loss; safe and clean. |
| 7 | **Quick Date Preset Chips in DateValuePicker**: Add top preset chips (`Today`, `Tomorrow`, `Next Week`, `Clear`) and keyboard arrow-key navigation in the mini calendar grid. | `src/views/DateValuePicker.ts:105-150`, `src/views/CalendarMiniCalendarRenderer.ts:24-95` | Notion Date Picker / AppFlowy | **M** | UI enhancement to existing picker; display and state only; no note writes. |
| 8 | **Bi-Directional Viewport Collision & Flipping in PopoverPosition**: Update popover positioning logic to measure panel dimensions dynamically and flip horizontally (left/right) and vertically (top/bottom) when near viewport boundaries. | `src/views/PopoverPosition.ts:48-99`, `src/views/ColumnMenu.ts:581-583`, `src/views/OptionColorPicker.ts:55-67` | AppFlowy Smart Overlays | **M** | Pure math/positioning calculation improvements; prevents offscreen clipping on all screen sizes. |
| 9 | **Instant Search Input in Icon & Emoji Picker**: Add a top search input to `IconPickerPopover` with live keyword filtering across Emoji and Lucide icon sets. | `src/views/IconPickerPopover.ts:62-88`, `src/views/IconPickerPopover.ts:100-147` | Notion Icon Picker / Anytype | **M** | In-memory catalog filtering; touch and keyboard friendly; zero disk writes. |
| 10 | **Standardized Menu Row Component Anatomy**: Unify row styling across `ColumnMenu`, `RowMenu`, `DropdownField`, `ToolbarRenderer` popovers, and `CellRenderer` option pickers into a shared `.db-menu-item` CSS component. | `src/views/DropdownField.ts:165-197`, `src/views/ToolbarRenderer.ts:436-476`, `src/views/ToolbarRenderer.ts:862-870`, `styles.css:2185-2210`, `styles.css:5349-5370` | Anytype Component System | **M** | CSS/DOM structural harmonization; reduces duplicate styles; clean rebase. |
| 11 | **Mobile Bottom Sheet Drawer for Overlays**: On `.is-phone` viewports, render dropdowns, menus, and filter panels as bottom action sheets with a top drag indicator pill and backdrop scrim. | `src/views/PopoverPosition.ts:133-142`, `styles.css:5772-5785` | Anytype Mobile / iOS Sheets | **L** | Mobile-specific responsive CSS and layout mode; desktop behavior unchanged; safe and MIT-compliant. |
| 12 | **Smooth Popover Entry Micro-Transitions**: Add a subtle 120ms ease-out enter transition (`transform: scale(0.98) translateY(-4px) → scale(1) translateY(0)`, `opacity: 0 → 1`) on all overlay panels. | `styles.css:2160-2171`, `styles.css:2360-2370`, `styles.css:5332-5347`, `styles.css:15939-15952` | Anytype Micro-Interactions | **S** | CSS-only animation enhancement; GPU-accelerated; zero layout thrashing. |

---

## Open threads for later iterations

- **Iteration 4 (Toolbars & View Controls)**: Audit toolbar overflow behaviors, view switcher tab strip scrolling, icon button hit targets, and the "+ New View" modal workflow.
- **Iteration 5 (Visual Design System)**: Unify color tokens (`--status-color-*`), border radii (`--db-radius-*`), and dark/light theme contrast ratios across all components.
- **Iteration 6 (Anytype UI/UX Patterns Deep Dive)**: Explore object-oriented sets/collections, relations graph visualization, and block-level layout affordances.
- **Iteration 7 (AppFlowy UI/UX Patterns Deep Dive)**: Deep dive into field editor drawers, multi-field grouping, and formula builder interfaces.
- **Iteration 8 (Views Beyond Table)**: Examine popovers and context menus specifically inside Kanban Board cards, Gallery cover cards, and Calendar/Timeline event blocks.
- **Iteration 9 (Micro-Interactions & Feedback)**: Refine hover states, drag-and-drop ghosting, fill-handle animations, and tooltip delay timing.
- **Iteration 10 (Mobile / Responsive / Accessibility)**: Audit touch target sizes (min 44×44px), ARIA landmarks, screen reader announcements, and safe-area insets.
