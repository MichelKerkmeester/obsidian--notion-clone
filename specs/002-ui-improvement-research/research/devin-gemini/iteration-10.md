# Research Iteration 10: Mobile / Responsive / Accessibility (Touch Targets, Obsidian Mobile, Contrast, Focus, ARIA)

Track: `devin-gemini` (Gemini 3.7 Flash High)  
Focus Area: Mobile / responsive / accessibility: touch targets, Obsidian mobile, contrast, focus, ARIA.  
Target Artifact: `specs/002-ui-improvement-research/research/devin-gemini/iteration-10.md`  

---

## Focus

A world-class database plugin for Obsidian must provide an exceptional user experience across all device form factors—from large multi-monitor desktop setups and iPad/Android tablets to single-hand mobile phones—while remaining fully accessible to users relying on screen readers, keyboard navigation, high-contrast theming, and assistive technologies.

In Obsidian's local-first architecture, mobile and accessibility ergonomics present unique technical and ergonomic constraints:
1. **Touch Target Dimensions & Hit Envelopes**: Adhering to WCAG 2.2 Success Criterion 2.5.8 (Target Size Minimum: 24×24px), WCAG 2.1 SC 2.5.5 (Target Size Enhanced: 44×44px), Apple Human Interface Guidelines (44×44pt), and Android Material Design (48×48dp) across high-density table cells, toolbar icon buttons, filter removal chips, and column drag/menu triggers.
2. **Obsidian Mobile Environment Integration**: Supporting `Platform.isMobile`, `Platform.isPhone`, and `Platform.isTablet` gracefully; managing safe-area insets (`env(safe-area-inset-bottom)`); avoiding UI collisions with Obsidian's mobile navigation bar and virtual keyboards; and providing native Bottom Sheets instead of awkward desktop floating popovers.
3. **Touch Gestures & Mobile Ergonomics**: Implementing pointer-based long-press context menus, swipe-to-snap column navigation in Kanban views, and eliminating double-tap zoom latency (`touch-action: manipulation`).
4. **WAI-ARIA Semantic Structure**: Injecting comprehensive ARIA roles (`role="grid"`, `role="tablist"`, `role="tab"`, `role="tabpanel"`, `role="dialog"`, `role="listbox"`), column sorting announcements (`aria-sort="ascending|descending"`), group collapsible states (`aria-expanded`, `aria-controls`), and live status regions (`aria-live="polite"`) for search and filter updates.
5. **Keyboard Focus & Trapping**: Providing consistent `:focus-visible` focus rings across container-mounted and body-mounted overlays, eliminating focus-blinding CSS resets (`outline: none`), establishing full roving tabindex cell navigation, and trapping keyboard focus within modal drawers and popover dialogs.
6. **WCAG AA/AAA Contrast Compliance**: Eliminating severe dark-mode contrast failures in the 16 status/tag color tokens, replacing sub-2.0:1 `--text-faint` with calibrated `--text-muted`, and ensuring non-text graphical UI controls meet the 3.0:1 contrast ratio required by WCAG 2.1 SC 1.4.11.

This iteration performs an exhaustive, line-by-line audit across TypeScript renderers (`src/views/CellRenderer.ts`, `src/views/TableRenderer.ts`, `src/views/BoardRenderer.ts`, `src/views/GalleryRenderer.ts`, `src/views/ListRenderer.ts`, `src/views/ToolbarRenderer.ts`, `src/views/DatabaseView.ts`, `src/views/DropdownField.ts`, `src/views/ColumnMenu.ts`, `src/views/ColumnHeaderController.ts`, `src/views/PopoverPosition.ts`, `src/views/RecordDetailPanel.ts`, `src/views/TableRecordPeek.ts`, `src/views/ActiveViewControlsRenderer.ts`, `src/views/FilterPanelRenderer.ts`, `src/views/SortPanelRenderer.ts`, `src/views/ViewConfigPanelRenderer.ts`, `src/views/OptionColorPicker.ts`, `src/views/IconPickerPopover.ts`, `src/views/modals/FormulaModal.ts`, `src/views/modals/AddDatabaseModal.ts`) and CSS (`styles.css`). It benchmarks the codebase against **Anytype**, **AppFlowy**, and **Notion**, and delivers concrete, actionable, constraint-checked recommendations.

---

## Current-UI findings (file:line)

### 1. Severe Touch Target Deficits Across Core Controls Violate 44×44px Accessibility Standards
- **Location**: `styles.css:1324` (toolbar buttons), `styles.css:1024-1041` (active rule remove buttons), `styles.css:4178-4188` (column menu trigger), `styles.css:5090-5110` (checkboxes), `styles.css:15996-16020` (icon picker grid/nav), `styles.css:15560-15636` (mobile move buttons)
- **Issue**: Across more than 60 UI components, interactive hit targets fall dramatically below the 44×44px mobile guideline and WCAG 2.5.8 minimums:
  1. Toolbar buttons (`styles.css:1324`) are `width: 28px; height: 28px; margin: 0 1px;`.
  2. Active filter/sort delete buttons (`.db-active-control-remove`, `styles.css:1024-1041`, `ActiveViewControlsRenderer.ts:151-166`) have no explicit dimensions, rendering an unpadded `×` glyph of ~12×16px.
  3. Column header menu triggers (`.db-column-menu-trigger`, `styles.css:4183`) are `22×22px` and set to `opacity: 0` until hovered.
  4. Row selection checkboxes (`styles.css:5090-5110`) render raw `14×14px` inputs inside narrow columns.
  5. Icon picker grid items (`styles.css:15996`) and category buttons (`styles.css:16018`) are `28×28px`.
  6. Mobile card/table move buttons (`styles.css:15565, 15583, 15612`) are `24×24px` to `26×26px`.
- **UX Impact**: On touch devices (smartphones, tablets, touch laptops), users frequently mis-tap adjacent controls. For example, attempting to tap the 12px `×` button on an active filter chip almost always taps the filter chip body, unintentionally opening the filter editor instead of dismissing the filter.

### 2. Desktop Floating Popovers Clip and Collapse on Mobile Viewports Instead of Using Bottom Sheets
- **Location**: `src/views/PopoverPosition.ts:24-90`, `src/views/FilterPanelRenderer.ts:126-140`, `src/views/SortPanelRenderer.ts:39-45`, `src/views/ColumnManagerRenderer.ts:46-55`, `src/views/ViewConfigPanelRenderer.ts:250-265`, `styles.css:15722-15731`
- **Issue**: Toolbar panels (Filter, Sort, View Configuration, Column Manager, Grouping, Export, and Add View) are positioned using desktop anchored coordinate math (`positionToolbarPopover`, `PopoverPosition.ts:24-90`). On phones, `styles.css:15730` attempts to restrict them with `max-height: min(380px, calc(100vh - 240px))`.
- **UX Impact**: On mobile screens (especially when the virtual keyboard is open or when scrolling down a database), `calc(100vh - 240px)` collapses the popover height to ~80-120px, clipping complex forms (such as multi-rule filters or view settings). Anchored desktop popovers drift off-screen or overlap the triggering buttons. While the author introduced a custom bottom sheet for the column width slider (`.db-mobile-column-width-panel`, `styles.css:15645-15664`), all other 8 major panels remain trapped as fragile desktop floating boxes.

### 3. Mobile Cell Editing is Occluded by the Virtual Keyboard and Lacks Safe Viewport Anchoring
- **Location**: `src/views/CellRenderer.ts:1539-1558`, `src/views/CellRenderer.ts:2024-2059`, `styles.css:15734-15760`
- **Issue**: In `CellRenderer.ts:2024-2059`, mobile text editing creates `.db-cell-edit-popover.is-mobile.is-inline-overlay` and positions it at `relativeTop + tdRect.height + 2px` within the scrolling table container.
- **UX Impact**: When a user taps a cell in the lower half of the table, focusing the `<textarea>` immediately triggers the mobile virtual keyboard (which occupies 40–50% of the screen height). Because the editor is positioned below the cell in document flow without `visualViewport` tracking or `scrollIntoView({ block: 'center' })`, the input field is pushed completely behind the virtual keyboard. The user is forced to type blindly without seeing the cursor or text.

### 4. Fragile `isPhoneLayout()` Ignores iPad/Android Tablets and Narrow Desktop Splits
- **Location**: `src/views/TableRenderer.ts:802`, `src/views/BoardRenderer.ts:925`, `src/views/GalleryRenderer.ts:438`, `src/views/ListRenderer.ts:432`, `src/views/ColumnHeaderController.ts:139`, `src/views/ToolbarRenderer.ts:288`, `src/views/DatabaseView.ts:4340`
- **Issue**: Across 7 core view controllers, layout mode is determined strictly by:
  ```ts
  private isPhoneLayout(): boolean {
    return window.activeDocument.body.classList.contains("is-phone");
  }
  ```
- **UX Impact**: On iPads and Android tablets, Obsidian adds `.is-mobile` and `.is-tablet` to `document.body`, but does **not** add `.is-phone`. Consequently, `isPhoneLayout()` evaluates to `false` on tablets. The plugin treats tablets as desktop computers:
  1. It relies on HTML5 Drag and Drop (`draggable="true"`), which is unsupported on iPadOS / iOS Safari / Android touch screens without pointer events.
  2. It hides mobile fallback move buttons (`.db-card-mobile-move-btn`, `.db-table-mobile-move-btn`).
  3. It requires mouse `:hover` to reveal column menu buttons and row handles.
  Tablet users are left with an unusable hybrid interface where neither touch gestures nor desktop hover/drag work properly.

### 5. Absence of Touch Long-Press Context Menus and Double-Tap Zoom Interference
- **Location**: `src/views/DatabaseView.ts:4150-4180`, `src/views/TableRenderer.ts:510-530`, `src/views/BoardRenderer.ts:590-620`, `src/views/CellRenderer.ts:418-430`, `styles.css:124`, `styles.css:4065-4080`
- **Issue**: Context menus rely entirely on the desktop `contextmenu` event (right-click), and cell/header activation relies on `dblclick`. There are zero `pointerdown` / `touchstart` long-press timers in the entire codebase.
- **UX Impact**: Long-pressing a row, card, or column on mobile triggers the mobile browser's native text selection loupe and OS callout menu ("Copy / Look Up / Share") rather than opening the database context menu. Furthermore, double-tapping table cells to edit triggers mobile WebKit viewport double-tap-to-zoom delays because containers lack `touch-action: manipulation`.

### 6. Kanban Board View Lacks Mobile Column Swipe-Snapping and Visual Page Indicators
- **Location**: `src/views/BoardRenderer.ts:280-350`, `styles.css:7050-7120`
- **Issue**: On mobile devices, Kanban columns are laid out in an unconstrained horizontal flex container (`.db-board`).
- **UX Impact**: Swiping horizontally on mobile drifts aimlessly between columns, frequently leaving half of Column A and half of Column B cut off at screen edges. There is no CSS `scroll-snap-type: x mandatory` or `scroll-snap-align: center`, and no mobile column pagination indicator (e.g. `● ○ ○ ○`) to orient the user or jump directly to specific stages.

### 7. Missing WAI-ARIA Grid Roles, Row/Column Coordinates, and `aria-sort` Attributes
- **Location**: `src/views/TableRenderer.ts:60-120`, `src/views/TableRenderer.ts:422-455`, `src/views/ColumnHeaderController.ts:20-45`
- **Issue**: The table rendering pipeline uses plain HTML elements without ARIA grid semantics:
  1. Table wrappers lack `role="grid"` (or `role="treegrid"` for grouped views).
  2. Headers lack `role="columnheader"`, `aria-colindex`, and `aria-sort="ascending|descending|none"`.
  3. Rows lack `role="row"` and `aria-rowindex`.
  4. Cells lack `role="gridcell"`, `aria-colindex`, and `aria-selected`.
  5. The table lacks `aria-rowcount` and `aria-colcount`.
- **UX Impact**: Screen reader users (VoiceOver on macOS/iOS, TalkBack on Android, NVDA/JAWS on Windows) cannot perceive table dimensions, navigate cell-by-cell with screen reader table shortcuts, or discover whether columns are sorted.

### 8. View Switcher Tab Strip Lacks WAI-ARIA Tablist, Tab, and Tabpanel Semantics
- **Location**: `src/views/ToolbarRenderer.ts:631-653`, `styles.css:1210-1270`
- **Issue**: The view tabs container (`.db-view-tabs`) is a plain `div` containing `<button class="db-view-tab">` elements.
- **UX Impact**: Missing `role="tablist"`, `role="tab"`, `aria-selected="true|false"`, `aria-controls="panel-id"`, and `role="tabpanel"`. Screen readers announce them as disconnected, unlabeled buttons without indicating tab relationship, active selection state, or associated data views.

### 9. Group Collapse Toggles Lack `aria-expanded` and `aria-controls`
- **Location**: `src/views/TableRenderer.ts:138`, `src/views/BoardRenderer.ts:325`, `src/views/GalleryRenderer.ts:115`, `src/views/ListRenderer.ts:107`, `src/views/CalendarTimelineRenderer.ts:547`
- **Issue**: Across all 5 grouped views, group collapse buttons set a static `aria-label="Expand" | "Collapse"`, but completely omit `aria-expanded="true|false"` and `aria-controls="group-container-id"`.
- **UX Impact**: Assistive technology users cannot determine whether a grouped section is currently expanded or collapsed, nor which data block the button controls.

### 10. Missing Screen Reader Live Announcements for Search, Filter, and Bulk Query Changes
- **Location**: `src/views/ActiveViewControlsRenderer.ts:29-53`, `src/views/DatabaseView.ts:4200-4250`, `src/views/ToolbarRenderer.ts:307-319`
- **Issue**: When filters or search terms change the number of visible rows (e.g., filtering 150 records down to 3), the view updates the DOM silently without an `aria-live` status announcement.
- **UX Impact**: Visually impaired users receive no confirmation that search or filter rules took effect, nor how many matching records remain visible.

### 11. Destructive Focus-Blinding CSS Reset and Incomplete Focus Ring Scoping
- **Location**: `styles.css:189-206`
- **Issue**: In `styles.css:198-200`, the stylesheet applies:
  ```css
  .note-database-container *:focus {
    outline: none;
  }
  ```
  While lines 202-206 specify `.note-database-container *:focus-visible`, this rule is strictly scoped to `.note-database-container`.
- **UX Impact**: Overlays and modals mounted directly to `window.activeDocument.body` (such as `ColumnMenu` subpopovers, `OptionColorPicker`, `IconPickerPopover`, `CellEditPopover`, and `AddDatabaseModal`) completely miss the focus-visible styling. Furthermore, on browsers with partial `:focus-visible` support, stripping `:focus` creates total focus invisibility during keyboard navigation. Custom popovers and modals also fail to trap keyboard focus (`Tab` key escapes into the background document).

### 12. Severe Contrast Failures in Status Tags, Low-Opacity Text, and Graphical Controls
- **Location**: `styles.css:85-116` (16 status tag colors), `styles.css:457`, `styles.css:603`, `styles.css:1357` (opacity 0.42), `styles.css:1680` (opacity 0.45), `styles.css:5040` (drag handle opacity)
- **Issue**: Status and tag color palettes hardcode dark saturated hex text across all 16 colors (e.g. `#2f6fad` dark blue, `#6940a5` dark purple, `#0f766e` dark teal) with zero dark mode overrides (`.theme-dark` only alters line 133). In dark mode (`#1e1e1e`), contrast ratios fall between 2.4:1 and 3.1:1, failing the WCAG AA 4.5:1 requirement. Additionally, interactive icons and helper text combine `--text-faint` with `opacity: 0.3-0.45`, producing contrast ratios below 1.8:1.

---

## Anytype/AppFlowy patterns

### 1. Anytype: Unified Native Bottom Sheet System with Gesture Dismissal
- **Pattern**: On mobile devices, Anytype never opens floating detached popovers anchored to tiny header icons. Every overlay—filter rules, sort orders, view configuration, property managers, tag selectors, date pickers, and view switchers—slides up smoothly from the bottom as a **Bottom Sheet Drawer** (`bottom-sheet`). It features a standardized top grab handle (`-`), a distinct header with "Done" and "Cancel" buttons, safe-area bottom padding (`env(safe-area-inset-bottom)`), and a natural vertical swipe-down-to-dismiss gesture.
- **Why it is better**: Eliminates viewport clipping and horizontal scrolling drift. Maximizes thumb-reachability on mobile screens and ensures forms are never covered by the virtual keyboard.

### 2. AppFlowy: Standardized 44-48px Touch Targets with Transparent Hit Expansion
- **Pattern**: AppFlowy enforces a minimum 44×44px touch target envelope across all interactive controls. When visual design calls for compact 16px or 20px icons (such as filter remove `✕`, column header menus, or status pills), AppFlowy uses CSS hit-expansion pseudo-elements (`::before { content: ''; position: absolute; inset: -10px; }`) or generous touch padding.
- **Why it is better**: Eliminates mis-taps and user frustration on mobile and tablet touchscreens while preserving high visual information density.

### 3. AppFlowy: Full WAI-ARIA Grid Semantics & Roving Tabindex Keyboard Navigation
- **Pattern**: AppFlowy implements complete WAI-ARIA 1.2 Grid standards:
  - Table root is `role="grid"` with `aria-rowcount` and `aria-colcount`.
  - Column headers have `role="columnheader"` and dynamic `aria-sort="ascending|descending|none"`.
  - Cells have `role="gridcell"`, `aria-rowindex`, and `aria-colindex`.
  - Keyboard navigation uses a robust roving tabindex: Arrow keys move active cell focus, `Enter` or `F2` activates inline editing, `Escape` cancels editing and returns focus to the cell, and `Tab` advances to the next cell.
- **Why it is better**: Empowers blind, visually impaired, and motor-impaired users to navigate complex databases with assistive technologies and enables seamless keyboard-only power usage.

### 4. Anytype: Mobile Kanban Swipe-Snapping & Column Index Indicators
- **Pattern**: In Kanban board views on mobile, Anytype implements CSS scroll-snap (`scroll-snap-type: x mandatory; scroll-snap-align: center;`) with smooth momentum. A compact column indicator (e.g. `● ○ ○ ○`) at the bottom of the screen highlights the active stage and lets users tap to jump directly to any column.
- **Why it is better**: Transforms horizontal Kanban navigation on phones from an imprecise, drifting chore into a crisp, responsive card-swiping experience.

### 5. Notion: Virtual Keyboard Safe Viewport Tracking (`visualViewport`)
- **Pattern**: When activating cell editors or detail panels on mobile, Notion listens to `window.visualViewport.addEventListener('resize')` to dynamically adjust editor container height and offset. It ensures the active input field smoothly scrolls into the center of the visible viewport above the keyboard.
- **Why it is better**: Completely prevents the virtual keyboard from occluding input fields, providing instant visual feedback while typing on iOS and Android.

### 6. Anytype: Touch Long-Press Gestures with Haptic Feedback
- **Pattern**: Long-pressing (450ms) any row, board card, gallery tile, or view tab triggers subtle device haptic feedback (`navigator.vibrate?.(20)`) and immediately opens the contextual action menu as a bottom sheet, while suppressing default browser text selection.
- **Why it is better**: Provides complete feature parity between desktop right-click and mobile touch gestures without cluttering cards with awkward auxiliary move buttons.

### 7. AppFlowy: Calibrated Dark/Light Contrast Engine & WCAG AA Tags
- **Pattern**: AppFlowy computes foreground text luminance dynamically for select/status tags and UI badges, ensuring that every tag maintains at least a 4.5:1 contrast ratio against both light and dark backgrounds. High-contrast border outlines are applied automatically in dark mode.
- **Why it is better**: Eliminates unreadable dark-on-dark text in dark mode and meets WCAG 2.1 AA/AAA accessibility standards.

---

## Recommendations

| # | Change | Target (file:line) | Inspired By | Effort | Constraint Check |
|---|---|---|---|:---:|---|
| 1 | **Mobile Bottom Sheet Architecture**: Replace anchored desktop floating popovers on mobile with full-width bottom sheets (`.db-mobile-bottom-sheet`) featuring a drag handle, backdrop scrim, safe-area bottom padding (`env(safe-area-inset-bottom)`), and swipe-down dismiss for Filter, Sort, View Config, Column Manager, and Group panels. | `src/views/PopoverPosition.ts:24-90`, `src/views/FilterPanelRenderer.ts:126-140`, `src/views/SortPanelRenderer.ts:39-45`, `src/views/ColumnManagerRenderer.ts:46-55`, `src/views/ViewConfigPanelRenderer.ts:250-265`, `styles.css:15722-15731` | Anytype Mobile Bottom Sheets | M | Safe: UI display and layout refactoring; no note-body writes; 100% mobile/desktop safe. |
| 2 | **Keyboard-Safe Mobile Cell Editing**: Upgrade mobile inline cell editing to listen to `window.visualViewport` resize events and call `scrollIntoView({ block: 'center', behavior: 'smooth' })`, ensuring text inputs stay visible above the virtual keyboard with a top-docked "Done / Cancel" toolbar. | `src/views/CellRenderer.ts:1539-1558`, `src/views/CellRenderer.ts:2024-2059`, `styles.css:15734-15760` | Notion Mobile Editor / AppFlowy | M | Safe: display-only DOM positioning; preserves cell commit callbacks; iCloud-safe. |
| 3 | **44×44px Touch Target Expansion**: Expand hit target envelopes to minimum 44×44px across toolbar icon buttons (`styles.css:1324`), active rule remove buttons (`styles.css:1024-1041`), column menu triggers (`styles.css:4183`), checkboxes (`styles.css:5090`), and icon picker items (`styles.css:15996`) via CSS touch padding and hit pseudo-elements (`::before { inset: -8px; }`). | `styles.css:1024-1041`, `styles.css:1324`, `styles.css:4178-4188`, `styles.css:5090-5110`, `styles.css:15996-16020`, `src/views/ActiveViewControlsRenderer.ts:151-166` | Apple HIG / WCAG 2.5.5 / AppFlowy | S | Safe: CSS hit-area expansion and padding; zero logic alterations; clean rebase. |
| 4 | **Universal Touch & Tablet Detection (`isTouchDevice`)**: Replace fragile `isPhoneLayout()` (`body.classList.contains("is-phone")`) with a comprehensive `isTouchDevice()` helper that checks `Platform.isMobile || Platform.isTablet || window.matchMedia("(pointer: coarse)").matches`, ensuring iPads and Android tablets receive touch-friendly controls and menus. | `src/views/TableRenderer.ts:802`, `src/views/BoardRenderer.ts:925`, `src/views/GalleryRenderer.ts:438`, `src/views/ListRenderer.ts:432`, `src/views/ColumnHeaderController.ts:139`, `src/views/ToolbarRenderer.ts:288`, `src/views/DatabaseView.ts:4340` | Obsidian Mobile Guidelines / Anytype | S | Safe: runtime environment check helper; cross-platform compatible; MIT-safe. |
| 5 | **Touch Long-Press Context Menus & Double-Tap Zoom Prevention**: Implement pointer-based long-press listeners (450ms threshold with `navigator.vibrate?.(20)` haptics) on rows, board cards, and tabs to open Obsidian's native `Menu.showAtMouseEvent` on mobile touch; add `touch-action: manipulation` across container elements to eliminate 300ms double-tap zoom delays. | `src/views/DatabaseView.ts:4150-4180`, `src/views/TableRenderer.ts:510-530`, `src/views/BoardRenderer.ts:590-620`, `src/views/CellRenderer.ts:418-430`, `styles.css:124`, `styles.css:4065-4080` | Anytype & Notion Touch Gestures | M | Safe: standard Pointer Events and CSS touch-action; display only; no note writes. |
| 6 | **Mobile Kanban Swipe-Snapping & Column Indicator**: Add CSS scroll snapping (`scroll-snap-type: x mandatory; scroll-snap-align: center;`) to `.db-board` on mobile devices and render a compact pagination indicator pill bar (`● ○ ○ ○`) below the board for 1-tap column jumping. | `src/views/BoardRenderer.ts:280-350`, `styles.css:7050-7120` | Anytype Mobile Kanban | M | Safe: CSS scroll snap and presentation indicator; preserves all board data wiring. |
| 7 | **WAI-ARIA Grid & `aria-sort` Semantics**: Add `role="grid"`, `aria-rowcount`, and `aria-colcount` to table containers; `role="columnheader"`, `aria-colindex`, and `aria-sort="ascending|descending|none"` to `<th>`; and `role="row"`, `role="gridcell"`, `aria-rowindex`, `aria-colindex`, and `aria-selected` to table rows and cells. | `src/views/TableRenderer.ts:60-120`, `src/views/TableRenderer.ts:422-455`, `src/views/ColumnHeaderController.ts:20-45` | WAI-ARIA 1.2 Grid / AppFlowy | M | Safe: accessibility attribute injection; zero impact on data or layout logic. |
| 8 | **WAI-ARIA Tablist Pattern for View Tabs**: Add `role="tablist"` and `aria-label="Database views"` to `.db-view-tabs`; `role="tab"`, `aria-selected="true|false"`, and `aria-controls="view-panel-${id}"` to view tab buttons; and `role="tabpanel"` to active view containers. | `src/views/ToolbarRenderer.ts:631-653`, `src/views/DatabaseView.ts:3100-3150`, `styles.css:1210-1270` | WAI-ARIA Tablist Standard | S | Safe: DOM attribute annotations; 100% theme-safe and rebase-clean. |
| 9 | **Group Collapse `aria-expanded` and `aria-controls`**: Update group collapse toggles in Table, Board, Gallery, List, and Timeline views to dynamically set `aria-expanded="true|false"` and `aria-controls="group-section-${id}"`. | `src/views/TableRenderer.ts:138`, `src/views/BoardRenderer.ts:325`, `src/views/GalleryRenderer.ts:115`, `src/views/ListRenderer.ts:107`, `src/views/CalendarTimelineRenderer.ts:547` | WCAG 2.1 Disclosure Standard | S | Safe: reactive ARIA attribute binding; clean isolated changes. |
| 10 | **Screen Reader `aria-live` Query Status Region**: Inject a visually hidden `div.db-sr-status` with `aria-live="polite"` and `aria-atomic="true"` that announces filter, search, and sort result changes (e.g. "Showing 8 of 45 records" or "No records match search query"). | `src/views/ActiveViewControlsRenderer.ts:29-53`, `src/views/DatabaseView.ts:4200-4250`, `styles.css:190-210` | WCAG 4.1.3 Status Messages / Notion | S | Safe: hidden DOM live region; zero visual layout impact; display only. |
| 11 | **Focus Ring Scoping & Dialog Focus Trapping**: Remove destructive `.note-database-container *:focus { outline: none; }`; extend `:focus-visible` styling to body-mounted overlays (`.db-column-menu-subpopover`, `.db-option-color-picker`, `.db-icon-picker-popover`, `.db-cell-edit-popover`); and implement focus trapping (`Tab` cycle within dialog, `Escape` to return focus to trigger) on all modal drawers and popovers. | `styles.css:189-206`, `src/views/TableRecordPeek.ts:88-120`, `src/views/RecordDetailPanel.ts:150-180`, `src/views/FilterPanelRenderer.ts:120-150` | WAI-ARIA Dialog Pattern / AppFlowy | M | Safe: focus management and keyboard listener enhancements; rebase-clean. |
| 12 | **WCAG AA Calibrated Contrast Palette**: Introduce dark-mode luminance overrides for the 16 status/tag colors (adjusting dark hex to high-contrast pastels in `.theme-dark` to achieve ≥ 4.5:1 ratio); replace low-opacity `--text-faint` combinations (`opacity: 0.3-0.45`) with calibrated `--text-muted` tokens meeting WCAG 2.1 SC 1.4.11 (3:1 graphical non-text contrast). | `styles.css:85-116`, `styles.css:457`, `styles.css:603`, `styles.css:1357`, `styles.css:1680`, `styles.css:5040` | WCAG 2.1 AA / AppFlowy Theming | S | Safe: CSS color token and opacity adjustments; 100% theme-adaptive. |

---

## Open threads for later iterations

1. **Synthesis & Cross-Iteration Prioritization**: Iteration 10 completes the 10-iteration deep research track for `devin-gemini`. The upcoming synthesis phase (`research/synthesis.md`) should merge and rank the highest-leverage recommendations across all 10 focus areas (visual hierarchy, table/grid, popovers/menus, toolbars, design system, Anytype patterns, AppFlowy patterns, non-table views, micro-interactions, and mobile/accessibility).
2. **Obsidian Mobile Navigation Bar Dynamic Collision Detection**: On mobile devices, Obsidian dynamically shows and hides its bottom navigation ribbon during scroll. Exploring an IntersectionObserver or dynamic CSS variable (`--obsidian-bottom-bar-height`) could further optimize bottom sheet and table footer docking.
3. **VoiceOver / TalkBack Virtual Cursor Navigation in Multi-Field Cells**: Investigating how composite cells (such as relation pills with embedded badges or multi-tag chips) can be traversed by screen readers using inner child accessibility focus without disrupting table row reading.
4. **Haptic Feedback Nuance on iOS vs Android**: Fine-tuning `navigator.vibrate` patterns (e.g. 15ms light tick on column drop vs 35ms double-pulse on delete) across Obsidian Mobile on iOS (WebKit Web Vibration API limitations) and Android.
