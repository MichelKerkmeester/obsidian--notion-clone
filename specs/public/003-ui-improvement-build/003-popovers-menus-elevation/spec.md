---
title: "Feature Specification: Popovers, Menus, Dropdowns and Elevation"
description: "Comprehensive floating surface modernization: 3-tier elevation and glassmorphism tokens, elimination of 5s auto-close timers, mobile bottom sheets, WAI-ARIA roving keyboard listbox navigation, drilldown submenus, searchable icon pickers, date presets with 2D calendar navigation, accessible color palettes, and standardized menu anatomy."
trigger_phrases:
  - "popovers menus elevation"
  - "popover auto close removal"
  - "mobile bottom sheets"
  - "dropdown listbox keyboard navigation"
  - "searchable dropdown enter select"
  - "elevation glassmorphism tokens"
  - "drilldown submenus column menu"
  - "date value picker presets"
  - "calendar mini keyboard navigation"
  - "icon picker live search"
  - "option color picker palette"
  - "standardized menu item anatomy"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/003-popovers-menus-elevation"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled popovers and menus feature specification"
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
      session_id: "ui-build-003"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Popovers, Menus, Dropdowns and Elevation

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `002-table-grid-experience`, successor `004-toolbar-and-view-controls`.

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
Popovers, menus, dropdowns, and floating pickers form the interactive overlay layer of the Note Database plugin. They govern column property configuration, row action execution, filter/sort rule composition, date/time and color selection, view switching, icon assignment, and inline cell editing. However, the current overlay architecture suffers from critical usability defects, timer-driven state loss, and broken accessibility affordances:
1. **Destructive 5-Second Inactivity Auto-Close Timer (`src/views/PopoverAutoClose.ts:11-79`, `src/views/DropdownField.ts:215-236`)**: `installPopoverAutoClose` runs a 5000ms idle timer that closes open popovers and discards uncommitted filter, sort, view config, or property edits if the user pauses without hovering their mouse directly inside the box.
2. **Mobile Viewport Clipping & Lack of Bottom Sheets (`src/views/PopoverPosition.ts:24-90`, `styles.css:15722-15731`)**: Toolbar panels and floating dropdowns use desktop anchored coordinates. On mobile phones, popovers collapse to 80–120px or get occluded by the virtual keyboard and Obsidian bottom navigation bar rather than rendering as touch-friendly bottom sheets (`.db-mobile-bottom-sheet`).
3. **Missing WAI-ARIA Listbox Keyboard Navigation (`src/views/DropdownField.ts:141-236`, `styles.css:1873-2055`)**: `DropdownField` sets `role="listbox"` and `role="option"`, but ignores `ArrowDown`, `ArrowUp`, `Home`, and `End` keys. Searchable dropdowns also fail to select the top filtered match on `Enter` (`src/views/DropdownField.ts:209-212`), forcing keyboard users to switch to the mouse.
4. **Fragmented Elevation, Z-Index Chaos & Ad-Hoc Shadows (`styles.css:2166-2170, 2364-2368, 5583-5592, 16429-16460`)**: Z-indexes are hardcoded ad-hoc across 20+ distinct CSS selectors (`50`, `70`, `80`, `999`, `1000`, `1001`, `1002`, `var(--layer-popover)`), leading to overlay clipping and sibling collisions. Box shadows lack unified design tokens and the shared frosted-glass contract (`backdrop-filter: blur(12px)`).
5. **Fragile Submenu Hover Tracking & "Triangle of Doom" in ColumnMenu (`src/views/ColumnMenu.ts:565-660`, `styles.css:2561-2684`)**: Column submenus spawn floating fixed panels with a 6px gap and a 140ms hover grace timer. Moving the cursor diagonally across the gap prematurely dismisses the submenu, causing severe interaction frustration.
6. **DateValuePicker Missing Quick Presets & Mini-Calendar Keyboard Grid (`src/views/DateValuePicker.ts:105-180`, `src/views/CalendarMiniCalendarRenderer.ts:24-95, 67-212`)**: Date pickers lack 1-click relative presets (`Today`, `Tomorrow`, `Next Week`, `Clear`), and the mini calendar grid lacks 2D ARIA grid semantics and roving arrow-key navigation.
7. **Unsearchable Icon Picker with Arbitrary Catalog Truncation (`src/views/IconPickerPopover.ts:57-169`, `styles.css:15939-16021`)**: `IconPickerPopover` lacks a search input, forcing users to manually scan 240+ icons across separate category tabs, while silently truncating the catalog at 240 items.
8. **Inaccessible Pseudo-Buttons in OptionColorPicker (`src/views/OptionColorPicker.ts:15-47`, `styles.css:5581-5608`)**: Color swatches are non-semantic `span[role="button"]` elements lacking 2D arrow navigation, visible focus rings outside container scopes, and trigger focus restoration.
9. **Inconsistent Menu Row Anatomies Across Surfaces (`src/views/ColumnMenu.ts:271-288`, `src/views/ToolbarRenderer.ts:436-476`, `src/views/RowMenu.ts:55-137`, `styles.css:2185-2210`)**: Custom menu renderers construct conflicting item rows with differing class names, checkmark placements, and icon dimensions.

### Purpose
Establish a modern, accessible, robust floating overlay architecture inspired by **Anytype**, **AppFlowy**, and **Notion**:
- Replace destructive 5s inactivity timers with an explicit `OverlayStack` managing LIFO stack dismissal (Escape, outside click, action commit) and focus restoration.
- Deliver responsive mobile bottom action sheets (`.db-mobile-bottom-sheet`) with drag handle pills, backdrop scrims, and `env(safe-area-inset-bottom)` safe-area padding on mobile viewports.
- Implement full WAI-ARIA listbox keyboard navigation (`ArrowDown`/`ArrowUp`, `Home`/`End`, `Enter`/`Space`) and instant Enter-to-select for top search matches in `DropdownField`.
- Apply the 3-tier elevation token system (`--db-elevation-1`, `--db-elevation-2`, `--db-elevation-3`) defined by Phase 005, including its frosted-glass contract (`backdrop-filter: blur(12px)`) and structured z-index scale (`--db-layer-panel`, `--db-layer-popover`, `--db-layer-submenu`, `--db-layer-modal`).
- Replace fragile hover-only submenus in `ColumnMenu` with smooth drilldown navigation ("← Back" header) and pointer-bridge support.
- Enhance `DateValuePicker` with quick date presets (`Today`, `Tomorrow`, `Next Week`, `Clear`) and 2D ARIA arrow-key calendar navigation.
- Add live keyword filtering to `IconPickerPopover` and upgrade `OptionColorPicker` to an accessible `<button>` palette grid.
- Standardize menu item row anatomy (`.db-menu-item`) across all plugin menus, and add smooth 120ms GPU-accelerated enter micro-transitions.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Overlay Stack & Explicit Dismissal Lifecycle**: Create `src/views/OverlayStack.ts` to manage active popovers, submenus, and pickers in a LIFO stack; route Escape to dismiss child surfaces before parent surfaces; eliminate 5000ms idle timer in `src/views/PopoverAutoClose.ts:11-79`; restore focus to the invoking trigger button upon close.
- **Mobile Bottom Sheets & Safe-Area Overlays**: Update `PopoverPosition.ts:24-90, 124-148` and `styles.css:15722-15731` to render overlays as bottom sheets (`.db-mobile-bottom-sheet`) on `.is-phone` viewports with top drag handle pill, backdrop scrim, and `env(safe-area-inset-bottom)` insets.
- **WAI-ARIA Listbox Keyboard Navigation**: Upgrade `DropdownField.ts:141-236` and `styles.css:1873-2055` with roving `tabindex`, `ArrowDown`/`ArrowUp` navigation, `Home`/`End` bounds jumping, `Enter`/`Space` selection, typeahead character jumping, and active option scroll-into-view.
- **Searchable Dropdown Instant Enter-to-Select**: Bind `Enter` in searchable dropdown inputs (`DropdownField.ts:148-156, 209-212`) to immediately select the top visible filtered match, and `ArrowDown` to step focus into the list. Render an explicit `db-dropdown-empty` row when queries return 0 matches.
- **3-Tier Elevation & Glassmorphism Token Consumption**: Apply the `--db-elevation-1`, `--db-elevation-2`, and `--db-elevation-3` tokens defined by Phase 005, including the shared `backdrop-filter: blur(12px)` contract and z-index layer tokens (`--db-layer-panel: 50`, `--db-layer-popover: 100`, `--db-layer-submenu: 110`, `--db-layer-modal: 1000`) across `styles.css:2166-2170, 2364-2368, 5583-5592, 16429-16460`.
- **Global Portal Mounting & Bi-Directional Collision Flipping**: Enhance `PopoverPosition.ts:24-104` to measure rendered panel dimensions dynamically, perform horizontal (left/right) and vertical (above/below) collision flipping, preserve scroll position, and track `visualViewport` resize.
- **Drilldown Navigation & Pointer Bridge for ColumnMenu**: Refactor `ColumnMenu.ts:98-154, 565-660` to replace fragile 140ms hover submenus with slide-in drilldown views (with "← Back" header) or a robust pointer-bridge polygon with keyboard navigation (`ArrowRight` opens, `ArrowLeft`/`Escape` returns with focus).
- **DateValuePicker Quick Presets & 2D Calendar Grid Navigation**: Add quick preset chips (`Today`, `Tomorrow`, `Next Week`, `Clear`) to `DateValuePicker.ts:105-180`; implement full 2D ARIA grid semantics (`role="grid"`, `aria-selected`, `aria-current="date"`) with arrow-key navigation in `CalendarMiniCalendarRenderer.ts:24-95, 67-212`; retain IME composition guard (`KeyboardUtils.ts:1-16`).
- **Live Search in Icon & Emoji Picker**: Add sticky top search input with instant keyword filtering across Emoji and Lucide sets in `IconPickerPopover.ts:57-169`, remove arbitrary 240-item clipping, add tablist ARIA semantics, and support roving arrow navigation.
- **Accessible OptionColorPicker Palette**: Replace `span[role="button"]` swatches with `<button type="button">` elements in `OptionColorPicker.ts:15-47`, add 2D arrow-key navigation, visible focus rings outside container scopes, and focus restoration to the trigger on close.
- **Standardized Menu Row Component Anatomy**: Unify menu item layout (`.db-menu-item`, `.db-menu-item-icon`, `.db-menu-item-label`, `.db-menu-item-current`, `.db-menu-item-shortcut`, `.db-menu-item-check`) across `ColumnMenu.ts`, `RowMenu.ts`, `DropdownField.ts`, and `ToolbarRenderer.ts` (`styles.css:2185-2210, 5349-5370, 8385-8655`).
- **Staged Multi-Select Relation Picker**: Add listbox search relationship, `ArrowDown` step-down, no-results feedback, selected count badge, and lightweight visible windowing for 500+ records in `CellRenderer.ts:709-821, 885-925`.
- **Smooth Popover Entry Micro-Transitions**: Add 120ms ease-out enter transitions (`transform: scale(0.98) translateY(-4px) → scale(1) translateY(0)`, `opacity: 0 → 1`) with `prefers-reduced-motion: reduce` compliance (`styles.css:2160-2171, 2360-2370, 5332-5347, 15939-15952`).

### Out of Scope
- Empty and first-run onboarding states (Phase 001: `001-empty-and-first-run-states`).
- Table grid single-header refactor, trailing add column, and calculation tfoot (Phase 002: `002-table-grid-experience`).
- Toolbar 4-cluster reorganization, view switcher tablist, and split New button (Phase 004: `004-toolbar-and-view-controls`).
- Vault-wide status/tag color token calibration and elevation/glass token definitions (Phase 005: `005-design-tokens-typography`); this phase applies those tokens to floating surfaces.
- Board Kanban swimlanes and Gallery card size presets (Phase 006: `006-views-parity-polish`).
- `$this.path` / `$this.name` embedded filter semantics in `SourceRules` / `QueryEngine` — deferred because this presentation phase does not rewrite query-engine behavior.
- Formula-builder live sample-row evaluation in `FormulaModal.ts` — deferred because this phase covers overlay interaction, not formula authoring execution.
- `+ Create '[query]' in [Target DB]` relation-picker action — deferred because T021 owns listbox/windowing behavior only, not record creation.
- Automated note-body writes, dynamic backlink sync, or background telemetry (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/OverlayStack.ts` | Create | Central overlay surface stack, LIFO dismissal on Escape/outside-click, and focus origin tracking |
| `src/views/OverlayStack.test.ts` | Create | Unit tests for overlay stack registration, nested dismissal hierarchy, and focus restoration |
| `src/views/PopoverPosition.test.ts` | Create | Unit tests for horizontal collision flipping and viewport clamping |
| `src/views/PopoverPosition.ts` | Edit | Global portal coordinate calculation, bi-directional collision flipping, live visual-viewport tracking (`:24-104, 124-148`) |
| `src/views/PopoverAutoClose.ts` | Edit | Eliminate 5000ms idle timer, integrate with `OverlayStack` for explicit dismissal (`:11-116`) |
| `src/views/DropdownField.ts` | Edit | WAI-ARIA roving keyboard navigation, Enter-to-select in search, Down arrow step-down, no-results row (`:141-236`) |
| `src/views/ColumnMenu.ts` | Edit | Drilldown submenu navigation, pointer-bridge grace area, left/right collision flip, standardized menu items (`:98-154, 565-660`) |
| `src/views/DateValuePicker.ts` | Edit | Quick relative date preset chips, keyboard calendar integration, IME composition guard (`:105-180, 250-355`) |
| `src/views/CalendarMiniCalendarRenderer.ts` | Edit | Full 2D ARIA calendar grid semantics and arrow-key day/month/year navigation (`:24-95, 67-212`) |
| `src/views/IconPickerPopover.ts` | Edit | Live search input, keyword filtering, uncapped catalog, tablist ARIA semantics, roving grid focus (`:57-169, 176-190`) |
| `src/views/OptionColorPicker.ts` | Edit | Accessible `<button>` palette grid with 2D arrow navigation, visible focus ring, and focus return (`:15-47`) |
| `src/views/CellRenderer.ts` | Edit | Staged multi-select relation picker with listbox semantics, windowed rendering, and instant keyboard selection (`:709-821, 885-925`) |
| `src/views/RowMenu.ts` | Edit | Standardized `.db-menu-item` anatomy, section groupings, and keyboard navigation (`:30-48, 55-137`) |
| `src/views/ToolbarRenderer.ts` | Edit | Standardized dropdown row styling, stack-managed popover dismissal (`:391-403, 436-476, 862-870`) |
| `src/i18n.ts` | Edit | Localized strings for date presets (`Today`, `Tomorrow`, `Next Week`, `Clear`), icon search placeholder, and no results |
| `styles.css` | Edit | Apply Phase 005's 3-tier elevation tokens, z-index scale, and 12px glass blur; mobile bottom sheets (`.db-mobile-bottom-sheet`), menu item anatomy, and smooth entry transitions (`:1873-2055, 2166-2170, 2364-2368, 2561-2684, 5218-5325, 5332-5347, 5581-5608, 15722-15731, 15939-16021, 16429-16460`) |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Remove Destructive 5s Inactivity Auto-Close Timer | Eliminate the 5000ms idle timer in `src/views/PopoverAutoClose.ts:11-79`; replace it with explicit dismissal lifecycle: top-surface stack management, outside pointer-down, Escape key, or action commit; uncommitted filter/sort/property drafts are never discarded by idle pauses. |
| REQ-002 | Mobile Bottom Sheets & Viewport-Safe Overlays | On `.is-phone` viewports and narrow touch screens (`src/views/PopoverPosition.ts:24-90, 124-148`, `styles.css:15722-15731`), promote anchored toolbar popovers, dropdowns, and property selectors to native bottom sheets (`.db-mobile-bottom-sheet`) with top drag handle pill, dimmed backdrop scrim (`rgba(0,0,0,0.4)`), and `env(safe-area-inset-bottom)` safe-area padding. |
| REQ-003 | WAI-ARIA Roving Keyboard Navigation in DropdownField | `DropdownField` (`src/views/DropdownField.ts:141-236`, `styles.css:1873-2055`) implements roving `tabindex`, `ArrowDown`/`ArrowUp` navigation through options, `Home`/`End` bounds jumping, `Enter`/`Space` selection, typeahead character jumping, and automatic scrolling of the active option into view. |
| REQ-004 | Searchable Dropdowns Instant Enter-to-Select & Focus Step-Down | In searchable dropdowns (`src/views/DropdownField.ts:148-156, 209-212`), pressing `Enter` in the search input immediately commits the top visible filtered option; pressing `ArrowDown` steps focus from the search input into the option list; an explicit `db-dropdown-empty` row renders when 0 options match. |
| REQ-005 | Apply Phase 005 3-Tier Elevation & Glassmorphism Tokens | Consume the semantic CSS tokens defined by Phase 005 in `styles.css:2166-2170, 2364-2368, 5583-5592, 16429-16460`: `--db-elevation-1` for dropdowns/tooltips, `--db-elevation-2` for floating popovers with the shared `backdrop-filter: blur(12px)` contract, `--db-elevation-3` for sheets/modals, and the unified z-index layer scale (`--db-layer-panel: 50`, `--db-layer-popover: 100`, `--db-layer-submenu: 110`, `--db-layer-modal: 1000`). This phase does not define competing elevation tokens. |
| REQ-006 | Global Portal Mounting & Bi-Directional Collision Flipping | Position calculations in `src/views/PopoverPosition.ts:24-104` measure real panel dimensions, dynamically flip horizontally (left/right) and vertically (above/below) based on available viewport space, preserve panel scroll position, and track `visualViewport` resize without container boundary clipping. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-007 | Drilldown Submenu Navigation & Pointer Bridge for ColumnMenu | In `src/views/ColumnMenu.ts:98-154, 565-660` and `styles.css:2561-2684`, replace fragile 140ms hover submenus with slide-in drilldown views featuring a "← Back" header or a robust pointer-bridge polygon with keyboard navigation (`ArrowRight` opens child submenu, `ArrowLeft`/`Escape` returns to parent menu item with focus restoration). |
| REQ-008 | Quick Date Presets & ARIA Grid Navigation in DateValuePicker | `src/views/DateValuePicker.ts:105-180, 250-355` and `src/views/CalendarMiniCalendarRenderer.ts:24-95, 67-212` add quick preset chips (`Today`, `Tomorrow`, `Next Week`, `Clear`) and implement full 2D ARIA grid semantics (`role="grid"`, `role="gridcell"`, `aria-selected`, `aria-current="date"`) with arrow-key navigation, retaining IME composition guard (`src/data/KeyboardUtils.ts:1-16`). |
| REQ-009 | Instant Keyword Search & Semantic Catalog in IconPickerPopover | `src/views/IconPickerPopover.ts:57-169, 176-190` and `styles.css:15939-16021` add a sticky top search input with live keyword filtering across Emoji and Lucide icon sets, eliminate the arbitrary 240-item truncation, add WAI-ARIA tablist semantics, and support roving arrow navigation across the measured icon grid. |
| REQ-010 | Accessible Button Palette Grid in OptionColorPicker | `src/views/OptionColorPicker.ts:15-47` and `styles.css:187-206, 5581-5608` replace `span[role="button"]` swatches with `<button type="button">` elements with `aria-label`, `aria-pressed`, 2D Arrow navigation, visible focus rings outside container scopes, and focus restoration to the color trigger on close. |
| REQ-011 | Standardized Menu Row Component Anatomy Across All Overlays | Standardize menu item layout (`.db-menu-item`, `.db-menu-item-icon`, `.db-menu-item-label`, `.db-menu-item-current`, `.db-menu-item-shortcut`, `.db-menu-item-check`) across `ColumnMenu.ts`, `RowMenu.ts`, `DropdownField.ts`, and `ToolbarRenderer.ts` (`styles.css:2185-2210, 5349-5370, 8385-8655`) with unified icon sizing, check alignment, and full-row focus/hover states. |
| REQ-012 | Staged Multi-Select Relation Picker with Scalable Windowing | In `src/views/CellRenderer.ts:709-821, 885-925` and `styles.css:5332-5461`, upgrade the relation picker to expose a labeled listbox relationship, `ArrowDown` step-down from search to options, no-results feedback, selected count badge, and lightweight visible windowing for 500+ records. |
| REQ-013 | Smooth Popover Entry Micro-Transitions & Motion Policy | `styles.css:2160-2171, 2360-2370, 5332-5347, 15939-15952` applies subtle 120ms ease-out enter transitions (`transform: scale(0.98) translateY(-4px) → scale(1) translateY(0)`, `opacity: 0 → 1`) with `prefers-reduced-motion: reduce` compliance. |
| REQ-014 | Overlay Top-Surface Stack & Focus Restoration Contract | Implement `src/views/OverlayStack.ts` to coordinate active popovers in a LIFO stack; pressing Escape dismisses the topmost surface first; closing a popover returns keyboard focus to its invoking trigger element. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Popovers, filter panels, sort panels, and pickers remain open indefinitely without auto-closing during user pauses; dismissing occurs strictly via outside click, Escape key, or action commit.
- **SC-002**: On mobile phone viewports (`.is-phone`), popovers and menus render as bottom action sheets with top drag handles and backdrop scrims without clipping or virtual keyboard occlusion.
- **SC-003**: Pressing `ArrowDown`/`ArrowUp` in any `DropdownField` cycles visual focus through visible options, and `Enter` commits the selected option.
- **SC-004**: Typing a query into a searchable dropdown and pressing `Enter` immediately selects the top filtered option.
- **SC-005**: All floating surfaces consume Phase 005's unified `--db-elevation-*` token system and shared frosted-glass contract (`backdrop-filter: blur(12px)`) with zero z-index collision regressions.
- **SC-006**: Opening column submenus near the right or bottom screen edge dynamically flips the submenu without offscreen clipping or "triangle of doom" hover loss.
- **SC-007**: Clicking `Today`, `Tomorrow`, `Next Week`, or `Clear` in `DateValuePicker` applies the corresponding date in a single click; arrow keys navigate dates in the mini calendar grid.
- **SC-008**: Typing "check" in `IconPickerPopover` instantly filters the grid to matching Lucide and Emoji check icons without catalog truncation.
- **SC-009**: Color swatches in `OptionColorPicker` are navigable via arrow keys and expose `aria-pressed` attributes.
- **SC-010**: Menu rows across ColumnMenu, RowMenu, DropdownField, and Toolbar popovers exhibit identical layout geometry and checkmark alignments.
- **SC-011**: Closing any popover or modal returns keyboard focus to the invoking trigger element.
- **SC-012**: Unit tests in `src/views/OverlayStack.test.ts` pass cleanly under `npx vitest run`.
- **SC-013**: Display-only rendering verified: zero writes to note frontmatter or bodies occur when opening, navigating, or closing overlays (iCloud-safe).

### Acceptance Scenarios

- **Scenario 1**: **Given** an open Filter panel with half-filled rules, **when** the user pauses for 10 seconds without hovering inside the panel, **then** the panel remains open and no draft state is lost.
- **Scenario 2**: **Given** a mobile phone viewport, **when** the user taps the View Config or Filter button, **then** the panel opens as a smooth bottom sheet anchored to the screen base with a backdrop scrim.
- **Scenario 3**: **Given** a focused `DropdownField`, **when** the user presses `ArrowDown` twice and hits `Enter`, **then** the second option is selected and the dropdown closes.
- **Scenario 4**: **Given** a searchable dropdown, **when** the user types "pri" and presses `Enter`, **then** "Priority" (the top match) is selected immediately.
- **Scenario 5**: **Given** the rightmost column in a wide table, **when** the user opens "Change Type" in the ColumnMenu, **then** the submenu flips to the left of the parent menu without clipping against the window edge.
- **Scenario 6**: **Given** a Date cell editor, **when** the user clicks the `Today` chip, **then** today's date is immediately committed.
- **Scenario 7**: **Given** `IconPickerPopover`, **when** the user types "database" in the search box, **then** the grid instantly updates to show database-related icons.
- **Scenario 8**: **Given** an open `OptionColorPicker`, **when** the user presses `Escape`, **then** the picker closes and focus returns to the color swatch button.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Mobile bottom sheet interferes with Obsidian native keyboard toolbar | Bottom controls hidden under soft keyboard | Use `visualViewport` resize listener and `env(safe-area-inset-bottom)` to pad sheet base above soft keyboard |
| Risk | Drilldown submenu in ColumnMenu breaks existing action callbacks | Column operations fail to execute | Preserve all existing action handler functions, changing only DOM view transitions |
| Risk | Roving keyboard navigation intercepts keys intended for underlying editor | Keystroke stealing | Scope keyboard listeners to the active popover panel; check `OverlayStack.isTopSurface()` before processing |
| Risk | Relation picker windowing desynchronizes keyboard selection index | Wrong item committed on Enter | Maintain unified logical index mapped to filtered record array |
| Dependency | `KeyboardUtils.ts` (`isImeComposing`) | IME composition safety | Reuses existing `isImeComposing` helper to guard Enter/Escape handlers |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 03) | Target citations and backlog mapping | Requirements trace directly to synthesis Ranked Recs #2, #3, #8, Quick Win #1, and Popover Backlog items |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Popover coordinate calculations and collision checks execute in < 5ms via `requestAnimationFrame`.
- **NFR-P02**: Icon search filtering over 500+ items executes in < 8ms with zero typing latency.
- **NFR-P03**: Popover entry micro-transitions use GPU-accelerated CSS transforms (`transform`, `opacity`) without triggering layout thrashing.

### Security
- **NFR-S01**: Zero external network calls, telemetry, or remote font/icon downloads; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: opening, navigating, and closing overlays produces 0 writes to note frontmatter or markdown bodies.
- **NFR-R02**: Mobile-safe: bottom sheets support touch dragging and safe-area insets across iOS and Android Obsidian clients.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Nested Popover Dismissal**: When an `OptionColorPicker` is opened from within a `ColumnMenu`, pressing `Escape` closes the color picker first; a second `Escape` closes the `ColumnMenu`.
- **Search Query with Zero Matches**: Searchable dropdowns and icon pickers render an explicit `db-dropdown-empty` indicator ("No matching options") without crashing.
- **Popover Near Window Right Edge**: Popovers automatically flip horizontally to align with the right anchor edge or open to the left.
- **Popover Near Window Bottom Edge**: Popovers automatically flip vertically to open above the anchor.
- **Virtual Keyboard on Mobile**: Bottom sheet height dynamically clamps to `visualViewport.height - 20px` when the soft keyboard appears.

### Error Scenarios
- **IME Composition in Progress**: Pressing `Enter` to confirm a CJK IME candidate does not trigger dropdown selection or close the popover (`isImeComposing(event) === true`).
- **Anchor Element Detached During Animation**: Coordinate calculations check `anchorEl.isConnected` before positioning and safely abort if detached.
- **Rapid Keyboard / Mouse Switching**: Roving focus synchronizes with mouse hover state without focus fighting or double-selection.

### Concurrent Operations
- Multiple rapid Escape presses cleanly pop surfaces from `OverlayStack` until all overlays are dismissed and the initial trigger receives focus.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 9/25 | Isolated `OverlayStack` helper, localized popover/dropdown/menu controller enhancements |
| Risk | 6/25 | Display-only UI layer; underlying database engine and data models untouched |
| Research | 6/20 | Complete target citations and interaction patterns established across both research tracks |
| **Total** | **21/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Submenu Navigation Model**: Slide-in drilldown with a "← Back" breadcrumb header is selected for `ColumnMenu` as it is 100% immune to diagonal hover loss and fully touch-friendly on mobile.
- **Elevation Tokens**: Phase 005 defines the standardized 3-tier elevation (`--db-elevation-1`, `--db-elevation-2`, `--db-elevation-3`) and shared frosted-glass contract (`backdrop-filter: blur(12px)`); this phase applies them vault-wide.
- **Dismissal Policy**: 5000ms idle timer is permanently deleted; dismissal is strictly explicit via `OverlayStack`.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../002-table-grid-experience/spec.md`](../002-table-grid-experience/spec.md)
- **Research Synthesis**: `specs/public/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 03 (Devin Track)**: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-03.md`
- **Research Iteration 03 (Codex Track)**: `specs/public/002-ui-improvement-research/research/codex-luna/iteration-03.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
