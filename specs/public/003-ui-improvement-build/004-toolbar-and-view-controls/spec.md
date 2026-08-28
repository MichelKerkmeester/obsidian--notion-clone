---
title: "Feature Specification: Toolbar and View Controls"
description: "Comprehensive toolbar modernization: 4-cluster semantic command deck, WAI-ARIA view switcher tablist with roving keyboard navigation and stable view IDs, multi-template split New button, searchable All Views hub with inline actions, unswallowed primary New tap, non-interactive database selector rows, rich Add View preset sheet with layout cards, jitter-free search with inline clear, unified View Settings, separate badge vocabulary, frontmatter embed expand affordance, and 44px touch targets."
trigger_phrases:
  - "toolbar and view controls"
  - "4 cluster toolbar"
  - "view switcher tabs"
  - "split new button"
  - "all views overflow hub"
  - "unswallowed new button"
  - "add view preset sheet"
  - "jitter free search clear"
  - "unified view settings"
  - "separate badge vocabulary"
  - "database selector nested button fix"
  - "embed expand full view"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/004-toolbar-and-view-controls"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled toolbar and view controls feature specification"
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
      session_id: "ui-build-004"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Toolbar and View Controls

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `003-popovers-menus-elevation`, successor `005-design-tokens-typography`.

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
The toolbar and view controls form the primary operational command deck of the Note Database plugin. They orchestrate view switching, database switching, query composition (filter, sort, group), schema and property management, data synchronization, export, view configuration, and record creation. However, the current toolbar architecture suffers from critical usability bottlenecks, accessibility gaps, and layout fragmentation:
1. **Sprawling Flat Right-Side Toolbar with 12 Un-Grouped Icon Buttons (`src/views/ToolbarRenderer.ts:252-286`, `styles.css:945-964`, `styles.css:1320-1365`)**: Up to 12 icon buttons (Width Toggle, Filter, Sort, Settings, Group, Properties, Computed Sync, Refresh DB, Export, Open File, Chart/Calendar Options, Search, and `+ New`) are concatenated into a flat flex row without semantic grouping, causing severe cognitive fatigue, visual crowding, and clipping in split-pane or sidebar layouts.
2. **Missing WAI-ARIA Tablist Semantics & Fragile Index-Based View Switching (`src/views/ToolbarRenderer.ts:625-683`, `styles.css:1201-1274`, `src/data/ViewSelection.ts:16-43`)**: View tabs are rendered as plain `<button>` elements lacking `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and roving keyboard navigation (`ArrowLeft`/`ArrowRight`, `Home`/`End`). Tab switching passes volatile numeric positions rather than stable view IDs, leading to active tab desynchronization upon database refreshes or reordering.
3. **Monolithic "+ New" Button Lacking Multi-Template Selection & Insertion Targeting (`src/views/ToolbarRenderer.ts:1716-1739`, `src/data/TemplateToolbarAction.ts:6-32`, `styles.css:2904-2928`)**: The primary creation button supports only a single pre-configured template or a blank note appended to the bottom. Users cannot choose among multiple registered vault templates, toggle "Insert at Top" vs "Insert at Bottom", or view creation context on mobile.
4. **Swallowed Primary New Tap by Overzealous Overlay Guard (`src/views/DatabaseView.ts:562-565,839-872`, `src/views/ToolbarRenderer.ts:1716-1739`)**: `DatabaseView` suppresses record creation if an overlay was open during mousedown. When a user intentionally taps the primary `+ New` button while a filter/sort panel is open, the tap only dismisses the overlay and silently discards the create action, requiring an unexpected second tap.
5. **Lossy Tab Overflow Dropdown (`src/views/ToolbarRenderer.ts:721-794`, `styles.css:1258-1274`)**: When view tabs exceed container width, excess tabs collapse into a bare `⋯` dropdown that only allows switching active views, discarding all view management affordances (Rename, Duplicate, Change Layout, Delete, Move).
6. **Invalid Nested Interactive Buttons in Database Selector Popover (`src/views/ToolbarRenderer.ts:425-477`, `styles.css:8430-8445,15520-15522`)**: Database list rows are `<button>` elements containing nested child `<button>` elements for up/down reordering, violating HTML specifications and breaking keyboard accessibility and screen-reader tree traversal.
7. **Bare-Bones "Add View" Popover Lacks Previews, Duplication, and Capacity Cues (`src/views/ToolbarRenderer.ts:654-663,921-962`, `src/views/DatabaseView.ts:2981-3020`)**: Clicking `+` opens a raw text list of 7 layout types with blind heuristics. Users cannot preview layout appearances, duplicate the active view's configuration, or understand why the button disappears when reaching the 15-view limit.
8. **Layout Jitter in Collapsible Search Control (`src/views/ToolbarRenderer.ts:1087-1123`, `styles.css:2687-2750`)**: Focus-triggered width expansion (`28px → 150px`) pushes neighboring toolbar buttons horizontally, lacks an inline `✕` clear button, and ignores the `Escape` key.
9. **Fragmented View Configuration Entry Points (`src/views/ToolbarRenderer.ts:267, 280-283, 1603-1614`, `src/views/ViewConfigPanelRenderer.ts:248-267`)**: Settings are fragmented across general settings gears, `Chart Options`, and `Calendar/Timeline Options` buttons without unified scope indicators or trigger pressed states.
10. **Conflated Badge Semantics Between Query Rules and Properties (`src/views/ToolbarRenderer.ts:1575-1649,1801-1804`, `styles.css:1551-1566`)**: Filter and Sort display active rule counts as accent badges, while Properties displays the total visible column count using the identical accent pill, obscuring whether the database is filtered or in a default state.
11. **Missing Full-View Escape Hatch in Frontmatter Embeds (`src/views/ToolbarRenderer.ts:156-209,227-249`, `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`)**: Frontmatter embeds provide `openFullView` in code but suppress the header expand button when `showDatabaseChrome` is active.
12. **Confusing Database Title Single-Click vs Double-Click Gestures (`src/views/ToolbarRenderer.ts:156-209`, `styles.css:715-790`)**: Single-clicking the title opens the database switcher while double-clicking triggers rename, leading to accidental switcher popovers.

### Purpose
Modernize the toolbar and view control subsystem inspired by **Anytype**, **AppFlowy**, and **Notion**:
- Reorganize the right toolbar into a clean **4-Cluster Semantic Command Deck**: (1) Query Cluster (`Filter`, `Sort`, `Group`), (2) Properties Cluster (`Properties`), (3) Overflow Utilities Menu `...` (collapsing `Sync Computed`, `Refresh DB`, `Export`, `Open File`, `Display Width`, `View Settings`), and (4) Primary Creation Button.
- Upgrade the view switcher into a full **WAI-ARIA Tablist** with `role="tablist"`/`role="tab"`, `aria-selected`, roving keyboard focus (`ArrowLeft`/`ArrowRight`, `Home`/`End`), and stable view ID resolution.
- Convert `.db-new-button` into a **Split Creation Button** offering multi-template selection, insertion placement ("Insert at Top / Bottom"), and visible creation intent.
- Ensure the primary New action executes **immediately in a single tap** without being swallowed by overlay dismiss guards.
- Transform tab overflow into a **Searchable "All Views" Hub** with live filtering, custom icons, and inline view management actions (Rename, Duplicate, Change Layout, Delete).
- Fix **nested interactive buttons** in the database selector popover with semantic row containers and sibling move controls.
- Deliver a **Rich "Add View" Preset Sheet** with visual layout preview cards, view duplication, and explicit 15-view capacity feedback.
- Provide **jitter-free search** with an inline `✕` clear action and `Escape` binding.
- Unify layout-specific options under a single **View Settings** hub with clear scope indicators.
- Establish **distinct badge vocabularies** (accent pills for active query rules vs neutral "N hidden" badges for Properties).
- Add a visible **Expand / Open-Full-View button** to frontmatter embedded headers.
- Separate the **database switcher chevron** from the title rename hover pencil.
- Ensure full **touch accessibility** (44×44px hit envelopes and mobile Floating Action Button).

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **4-Cluster Semantic Command Deck Toolbar**: Restructure `.db-toolbar-right` in `src/views/ToolbarRenderer.ts:252-286` and `styles.css:945-964` into: (1) Query Cluster (`Filter`, `Sort`, `Group`), (2) Properties Cluster (`Properties`), (3) Overflow Utilities Menu `...` (collapsing `Sync Computed`, `Refresh DB`, `Export`, `Open File`, `Display Width`, `View Settings`), and (4) Primary Creation Button.
- **WAI-ARIA Tablist View Switcher & Stable Identity**: Annotate view tabs in `src/views/ToolbarRenderer.ts:625-683` and `styles.css:1201-1274` with `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and roving keyboard navigation (`ArrowLeft`/`ArrowRight`, `Home`/`End`); wire selection through `src/data/ViewSelection.ts:16-43` using stable view IDs.
- **Multi-Template Split "+ New" Button**: Upgrade `.db-new-button` in `src/views/ToolbarRenderer.ts:1716-1739`, `src/data/TemplateToolbarAction.ts:6-32`, and `styles.css:2904-2928` to a split button with a dedicated `▼` dropdown listing registered templates, "Create Blank Note", "Set Default Template", and insertion position toggles.
- **Unswallowed Primary New Action Lifecycle**: Adjust `DatabaseView.ts:562-565,839-872` so that intentional clicks on the primary New button close open overlays and execute note creation in the same user interaction.
- **Searchable "All Views" Hub with Inline View Actions**: Replace the basic overflow dropdown in `src/views/ToolbarRenderer.ts:721-794` with a full view management popover featuring live search filtering, custom icons, layout badges, active indicator, and inline actions (Rename, Duplicate, Change Layout, Delete).
- **Non-Interactive Row Wrapper in Database Selector**: Refactor `src/views/ToolbarRenderer.ts:425-477` and `styles.css:8430-8445,15520-15522` to replace nested `button > button` DOM with a non-interactive row container, a primary selection button, and sibling up/down move buttons.
- **Rich "Add View" Preset Sheet with Layout Preview Cards**: Upgrade `showAddViewMenu` in `src/views/ToolbarRenderer.ts:654-663,921-962` and `src/views/DatabaseView.ts:2981-3020` to render layout preview cards, view name/icon inputs, key field selectors, an explicit "Duplicate current view" toggle, and a disabled state displaying "15 views maximum" when at capacity.
- **Jitter-Free Search Control with Inline Clear (`✕`)**: Update `src/views/ToolbarRenderer.ts:1087-1123` and `styles.css:2687-2750` to use overlay expansion or stable min-width, add an inline `✕` clear button, bind `Escape` to clear and blur, and add a `⌘F` / `Ctrl+F` shortcut tooltip.
- **Unified "View Settings" Scope & Disambiguated Toolbar Trigger**: Consolidate layout-specific settings (`Chart Options`, `Calendar Options`, `Timeline Options`) under a unified `View Settings` entry point (`src/views/ToolbarRenderer.ts:1603-1614`, `src/views/ViewConfigPanelRenderer.ts:248-267`), label sections as "Current view" and "Current database" (read-only in embeds), and reflect trigger pressed states.
- **Distinct Badge Vocabulary for Query Rules vs Properties**: Differentiate badge styles in `src/views/ToolbarRenderer.ts:1575-1649,1801-1804` and `styles.css:1551-1566`: retain accent numeric pills for active Filter/Sort rule counts, but display Properties as a neutral "N hidden" badge (omitting badge when all columns are visible).
- **Frontmatter Embed Expand / Open-Full-View Button**: Render a visible expand/full-view icon button in frontmatter embed headers (`src/views/ToolbarRenderer.ts:156-209,227-249`, `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`, `styles.css:12465-12509`).
- **Disambiguated Database Heading Trigger & Explicit Rename Affordance**: Separate the dropdown chevron into a distinct click target and add a persistent hover pencil icon for title rename in `src/views/ToolbarRenderer.ts:156-209` and `styles.css:715-790`.
- **View Tab Drag Insertion Line & Edge Auto-Scroll**: Replace full-tab inset box-shadow drop target with a 2px vertical accent insertion indicator between tabs and enable auto-scrolling near tab strip edges (`src/views/ToolbarRenderer.ts:686-720`, `styles.css:1241-1249`).
- **Custom View Icons & Unconstrained Inline Tab Rename**: Remove the 140px max-width cap on `startRenameView` with auto-expanding input width, and enable assigning custom emoji/Lucide icons per view (`src/views/ToolbarRenderer.ts:636-642,974-1006`, `styles.css:1275-1288`).
- **"Clear All" Action & Scroll Fade Masks on Active View Controls Rail**: Add a single-click "Clear all" button to reset all active filters/sorts, and apply horizontal CSS gradient fade masks to `.db-active-view-controls-scroll` when chips overflow (`src/views/ActiveViewControlsRenderer.ts:54-100`, `styles.css:967-1014`).
- **Standardized Icon-Button Accessibility Contract & 44px Touch Envelopes**: Ensure every toolbar icon button has `type="button"`, explicit `aria-label`, `aria-haspopup`/`aria-expanded`/`aria-controls` attributes, visible `:focus-visible` styling, and expanded 44×44px touch hit envelopes (`src/views/ToolbarRenderer.ts:1071-1085,1138-1160,1575-1649,1768-1777`, `styles.css:1320-1364,15345-15400`).
- **Mobile Floating Action Button (FAB) & Toolbar Scroll Shadows**: On `.is-phone` viewports, render the primary New button as a floating action button in the bottom-right thumb zone, and add horizontal scroll shadow cues to the secondary toolbar button rail (`src/views/ToolbarRenderer.ts:262,1729`, `styles.css:15345-15400`).
- **Roving Keyboard Navigation in Toolbar Popovers**: Add WAI-ARIA roving keyboard navigation (`ArrowDown`/`ArrowUp`, `Enter`/`Space`, `Home`/`End`) to Database Selector, Title Actions, View Tab context menus, and Add View popovers (`src/views/ToolbarRenderer.ts:436-479,862-874`, `styles.css:8389-8655`).

### Out of Scope
- Empty and first-run onboarding states (Phase 001: `001-empty-and-first-run-states`).
- Table grid single-header refactor, trailing add column, and calculation tfoot (Phase 002: `002-table-grid-experience`).
- Floating overlay stack lifecycle, bottom sheets, and color/icon pickers (Phase 003: `003-popovers-menus-elevation`).
- Design token system, typography scale, and dark-mode tag calibration (Phase 005: `005-design-tokens-typography`).
- Board, Gallery, Calendar, and List view-body parity polish (Phase 006: `006-views-parity-polish`).
- Drag ghosts, selection bounding box, and fill handle (Phase 007: `007-micro-interactions`).
- Compact inline-block embed mode — deferred because this phase adds the full-view affordance but does not change embed layout modes.
- Automated note-body writes, dynamic backlink sync, or background telemetry (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `src/views/ToolbarRenderer.ts` | Edit | 4-cluster toolbar reorganization, WAI-ARIA tablist, split New button, searchable All Views hub, non-interactive database selector rows, Add View preset sheet, jitter-free search with inline clear, unified View Settings, badge vocabulary, embed expand button, and title rename trigger (`:156-286, 425-477, 625-794, 921-1123, 1575-1804`) |
| `src/views/ActiveViewControlsRenderer.ts` | Edit | Single-click "Clear all" action for active filter/sort rules and horizontal scroll fade masks (`:54-100`) |
| `src/views/FilterPanelRenderer.ts` | Edit | Stable panel identifier for the toolbar accessibility contract |
| `src/views/SortPanelRenderer.ts` | Edit | Stable panel identifier for the toolbar accessibility contract |
| `src/views/ColumnManagerRenderer.ts` | Edit | Stable panel identifier for the toolbar accessibility contract |
| `src/views/ViewConfigPanelRenderer.ts` | Edit | Unified View Settings panel layout, clear scope headers, and embed read-only indicators (`:248-267, 331-365`) |
| `src/views/DatabaseView.ts` | Edit | Unswallowed primary New button lifecycle, stable view ID resolution, and Add View layout config generation (`:562-565, 839-872, 1876-1890, 2969-3020`) |
| `src/views/EmbeddedDatabaseRenderer.ts` | Edit | Visible expand / open-full-view header button wiring in frontmatter embeds (`:1379-1394, 1756-1801`) |
| `src/data/TemplateToolbarAction.ts` | Edit | Multi-template retrieval, default template management, and insertion targeting (`:6-32`) |
| `src/data/ViewSelection.ts` | Edit | Reference stable view ID resolution helper during tab selection (`:16-43`) |
| `src/data/TemplateToolbarAction.test.ts` | Edit | Unit coverage for template discovery and insertion placement |
| `src/data/ViewSelection.test.ts` | Add | Unit coverage for stable view ID resolution |
| `src/i18n.ts` | Edit | Localized strings for split New actions, All Views hub, Add View presets, "Clear all", and badge labels |
| `styles.css` | Edit | 4-cluster toolbar layout, tablist and roving focus styles, split button styling, All Views hub popover, Add View preset cards, search control overlay, badge tokens, drag insertion line, mobile FAB, and 44px touch envelopes (`:715-790, 945-1014, 1201-1288, 1320-1365, 1551-1566, 2687-2750, 2904-2928, 8430-8445, 12465-12509, 15345-15400`) |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | 4-Cluster Semantic Command Deck Toolbar | In `src/views/ToolbarRenderer.ts:252-286` and `styles.css:945-964`, reorganize `.db-toolbar-right` into: (1) Query Cluster (`Filter`, `Sort`, `Group`), (2) Properties Cluster (`Properties`), (3) Overflow Utilities Menu `...` (collapsing `Sync Computed`, `Refresh DB`, `Export`, `Open File`, `Display Width`, `View Settings`), and (4) Primary Creation Button; eliminates visual clutter and fits seamlessly in narrow panes. |
| REQ-002 | WAI-ARIA View Switcher Tablist with Stable Identity & Keyboard Navigation | In `src/views/ToolbarRenderer.ts:625-683` and `styles.css:1201-1274`, convert `.db-view-tabs` to `role="tablist"` with `role="tab"`, `aria-selected="true\|false"`, and `aria-controls`; implement roving keyboard navigation (`ArrowLeft`/`ArrowRight`, `Home`/`End`); pass stable view IDs through `src/data/ViewSelection.ts:16-43` to preserve active tab selection across reorders and refreshes. |
| REQ-003 | Multi-Template Split "+ New" Button | In `src/views/ToolbarRenderer.ts:1716-1739`, `src/data/TemplateToolbarAction.ts:6-32`, and `styles.css:2904-2928`, convert `.db-new-button` to a split button: left primary action creates a record using the default template or blank note, and right `▼` trigger opens a template picker listing vault templates, "Create Blank Note", "Set Default Template", and "Insert at Top / Bottom" placement toggles. |
| REQ-004 | Searchable "All Views" Hub with Inline View Actions on Overflow | In `src/views/ToolbarRenderer.ts:721-794` and `styles.css:1258-1274`, replace the basic `⋯` overflow dropdown with a full view management popover featuring live search filtering, custom view icons, layout badges, active state indicators, and inline action buttons (Rename, Duplicate, Change Layout, Delete). |
| REQ-005 | Unswallowed Primary New Action Lifecycle | In `src/views/DatabaseView.ts:562-565,839-872` and `src/views/ToolbarRenderer.ts:1716-1739`, ensure intentional clicks on the primary New button close any open overlay and proceed immediately with record creation in a single tap without requiring a second tap. |
| REQ-006 | Non-Interactive Row Wrapper in Database Selector Popover | In `src/views/ToolbarRenderer.ts:425-477` and `styles.css:8430-8445,15520-15522`, eliminate invalid nested `button > button` DOM by replacing `db-database-popover-row` with a non-interactive row container holding a dedicated selection button and sibling move up/down reorder buttons. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | Rich "Add View" Preset Sheet with Layout Preview Cards & Duplication | In `src/views/ToolbarRenderer.ts:654-663,921-962` and `src/views/DatabaseView.ts:2981-3020`, upgrade `showAddViewMenu` to a rich view creation popover with visual layout preview cards, view name/icon input, key field selectors, an explicit "Duplicate current view" toggle, and a disabled state displaying "15 views maximum" when at capacity. |
| REQ-008 | Jitter-Free Search Control with Inline Clear (`✕`) & Escape Binding | In `src/views/ToolbarRenderer.ts:1087-1123` and `styles.css:2687-2750`, replace layout-shifting width expansion with a stable min-width or overlay expansion, add an inline `✕` clear icon button when text is present, bind `Escape` to clear text and blur, and add a `⌘F` / `Ctrl+F` shortcut tooltip. |
| REQ-009 | Unified "View Settings" Scope & Disambiguated Toolbar Trigger | In `src/views/ToolbarRenderer.ts:1603-1614` and `src/views/ViewConfigPanelRenderer.ts:248-267`, consolidate layout-specific settings (`Chart Options`, `Calendar Options`, `Timeline Options`) under a unified `View Settings` entry point, label panel sections clearly as "Current view" and "Current database" (visibly read-only in embeds), and reflect open pressed state on the trigger button. |
| REQ-010 | Separate Badge Vocabulary: Query Counts vs Properties Visibility | In `src/views/ToolbarRenderer.ts:1575-1649,1801-1804` and `styles.css:1551-1566`, retain accent numeric pills for active Filter/Sort rule counts, but display Properties with a neutral "N hidden" badge (omitting badge when all columns are visible) and an accessible label like "Properties, 2 hidden". |
| REQ-011 | Visible Expand / Open-Full-View Affordance in Frontmatter Embeds | In `src/views/ToolbarRenderer.ts:156-209,227-249` and `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`, render a visible expand/full-view icon button in frontmatter embedded database headers next to the title, wired to `openFullView`. |
| REQ-012 | Disambiguated Database Heading Trigger & Explicit Rename Affordance | In `src/views/ToolbarRenderer.ts:156-209` and `styles.css:715-790`, separate the database switcher dropdown chevron into a distinct click target and add an explicit hover pencil button for database title rename to prevent accidental switcher popovers. |
| REQ-013 | Tab Reordering 2px Drop Insertion Line & Edge Auto-Scroll | In `src/views/ToolbarRenderer.ts:686-720` and `styles.css:1241-1249`, replace full-tab inset box-shadow drop target with a precise 2px vertical accent insertion indicator between tabs, and enable auto-scrolling when dragging near tab strip overflow edges. |
| REQ-014 | Custom View Icons and Unconstrained Inline Tab Rename | In `src/views/ToolbarRenderer.ts:636-642,974-1006` and `styles.css:1275-1288`, remove the 140px max-width cap on `startRenameView` with auto-expanding input width, and enable assigning custom emoji/Lucide icons per view (`view.icon`). |
| REQ-015 | "Clear All" Action & Scroll Fade Masks on Active View Controls Rail | In `src/views/ActiveViewControlsRenderer.ts:54-100` and `styles.css:967-1014`, add a single-click "Clear all" button to reset all active filters/sorts, and apply horizontal CSS gradient fade masks to `.db-active-view-controls-scroll` when chips overflow. |
| REQ-016 | Standardized Icon-Button Accessibility Contract & 44px Touch Envelopes | In `src/views/ToolbarRenderer.ts:1071-1085,1138-1160,1575-1649,1768-1777` and `styles.css:1320-1364,15345-15400`, ensure every toolbar icon button has `type="button"`, explicit `aria-label`, `aria-haspopup`/`aria-expanded`/`aria-controls` when opening a panel, visible `:focus-visible` styling, and expanded 44×44px touch hit envelopes (`::before { inset: -8px; }`) on mobile. |
| REQ-017 | Mobile Floating Action Button (FAB) & Toolbar Scroll Shadows | In `src/views/ToolbarRenderer.ts:262,1729` and `styles.css:15345-15400`, on `.is-phone` viewports render the primary New creation affordance as a floating action button in the bottom-right thumb zone, and add horizontal scroll shadow cues to the secondary toolbar button rail. |
| REQ-018 | Roving Keyboard Navigation in Toolbar Popovers | In `src/views/ToolbarRenderer.ts:436-479,862-874` and `styles.css:8389-8655`, implement WAI-ARIA roving keyboard navigation (`ArrowDown`/`ArrowUp`, `Enter`/`Space`, `Home`/`End`) in Database Selector, Title Actions, View Tab context menus, and Add View popovers. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Toolbar buttons are cleanly clustered into Query, Properties, More Utilities, and Primary Creation without visual crowding or button wrapping in split panes.
- **SC-002**: View switcher operates as a true WAI-ARIA tablist: pressing `ArrowRight`/`ArrowLeft` cycles active tab selection and moves keyboard focus; active tab is preserved across refreshes via stable view IDs.
- **SC-003**: The primary `+ New` button functions as a split button: clicking the left half executes default creation, while clicking the right `▼` opens the template selection menu.
- **SC-004**: Tapping the primary New button while any overlay (filter, sort, view config) is open dismisses the overlay and immediately creates the record in a single tap.
- **SC-005**: Tab overflow menu ("⋯") opens a searchable All Views hub displaying all views with icons and inline Rename, Duplicate, Change Layout, and Delete actions.
- **SC-006**: Database selector popover contains no nested `<button>` elements; reorder move buttons are distinct sibling focus targets.
- **SC-007**: Clicking `+` to add a view displays layout preview cards, view duplication toggle, and capacity feedback when at 15 views.
- **SC-008**: Search input expands without shifting neighboring buttons, provides an inline `✕` clear action, and blurs on `Escape`.
- **SC-009**: Layout-specific options (Chart, Calendar, Timeline) are consolidated under View Settings with clear scope indicators.
- **SC-010**: Filter/Sort buttons display accent rule-count badges, while Properties displays a neutral "N hidden" badge only when columns are hidden.
- **SC-011**: Frontmatter embedded databases display an open-full-view expand button in the header.
- **SC-012**: Single-clicking the database title opens the database switcher, while clicking the hover pencil triggers inline rename.
- **SC-013**: Active view control chips display a "Clear all" button when rules are active and render smooth horizontal scroll fade masks.
- **SC-014**: All toolbar icon buttons meet 44×44px minimum touch targets on mobile via expanded pseudo-element envelopes.
- **SC-015**: On phones, the primary New button renders as an ergonomic bottom-right Floating Action Button.
- **SC-016**: Display-only rendering verified: zero writes to note frontmatter or bodies occur when interacting with toolbars, view tabs, search, or settings (iCloud-safe).

### Acceptance Scenarios

- **Scenario 1**: **Given** a database with 6 view tabs in a split-pane, **when** container width shrinks, **then** excess tabs collapse into the "⋯" button, and clicking it reveals a searchable view management list with inline rename and delete.
- **Scenario 2**: **Given** a focused view tab, **when** the user presses `ArrowRight`, **then** keyboard focus and active view switch to the next tab.
- **Scenario 3**: **Given** an open Filter panel, **when** the user clicks the primary `+ New` button, **then** the filter panel closes and a new record note is immediately created.
- **Scenario 4**: **Given** multiple registered templates in the vault, **when** the user clicks the `▼` split arrow on the New button, **then** a dropdown appears listing the templates, and selecting one creates a record with that template.
- **Scenario 5**: **Given** an active search query "task", **when** the user clicks the inline `✕` button or presses `Escape`, **then** the query clears and full database records re-appear immediately.
- **Scenario 6**: **Given** a database with 2 hidden columns, **when** inspecting the toolbar, **then** Filter/Sort show no badges while Properties shows a neutral "2 hidden" badge.
- **Scenario 7**: **Given** a frontmatter embedded database, **when** viewing the embed header, **then** a visible maximize icon button appears and opens the full database view on click.
- **Scenario 8**: **Given** a mobile phone viewport, **when** viewing a database, **then** the primary New button floats in the bottom-right thumb zone, and toolbar icon touch areas span at least 44×44px.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | Split New button touch target collision on mobile | Accidental template dropdown open instead of record creation | Merge into a single long-press or bottom sheet selector on touch screens; keep primary action dominant |
| Risk | Active tab drag-and-drop desynchronizes stable view IDs | Incorrect view rendered after drag reorder | Update `db.views` array and resolve active view via `resolveViewSelection` using stable `view.id` |
| Risk | Search overlay expansion covers view tabs | View tabs temporarily inaccessible during search | Automatically collapse search overlay on blur or `Escape` key press |
| Risk | Frontmatter embed full-view navigation fails in isolated leaf | Navigation exception | Guard `openFullView` callback and fall back to opening source file in new leaf |
| Dependency | `src/data/ViewSelection.ts` (`resolveViewSelection`) | Stable view ID resolution | Reuses existing `resolveViewSelection` module to guarantee view identity continuity |
| Dependency | `src/data/TemplateToolbarAction.ts` (`executeNewFromTemplate`) | Template execution engine | Extends existing template action helper to support multi-template selection lists |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 04) | Target citations and backlog mapping | Requirements trace directly to synthesis Ranked Recs #6, #9, Quick Wins #7, #15, #17, #18, and Toolbar Backlog items |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Tab switching and view resolution execute in < 16ms without layout stutter or unmount flicker.
- **NFR-P02**: View overflow calculation in `collapseOverflowTabs` executes in < 5ms via `ResizeObserver` and `requestAnimationFrame`.
- **NFR-P03**: Search input keystroke debouncing processes queries smoothly with zero input lag.

### Security
- **NFR-S01**: Zero external network calls, telemetry, or remote dependencies; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: toolbar interactions, view switching, and settings changes produce zero unintended writes to note frontmatter or markdown bodies.
- **NFR-R02**: Mobile-safe: supports iOS and Android Obsidian clients with 44px touch targets and thumb-zone FAB placement.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Single View Database**: When a database has only 1 view, the view tab strip renders cleanly without collapse or drag handles.
- **15-View Maximum Limit**: When `db.views.length >= 15`, the `+` Add View button remains visible in a disabled state displaying tooltip "15 views maximum" rather than vanishing mysteriously.
- **All Columns Visible**: When `hiddenColumns.size === 0`, the Properties button renders without a badge.
- **Long View Names in Tab Strip**: Tab labels truncate with ellipsis at container boundaries without breaking tab strip flex geometry.
- **Zero Templates Configured**: The split New button dropdown displays "Create Blank Note" and "Configure Templates...".

### Error Scenarios
- **IME Composition During Search**: Pressing `Enter` or `Escape` during active CJK IME composition does not clear search text or submit prematurely (`isImeComposing(event) === true`).
- **Database Reorder During Active Popover**: Sibling move buttons in the database selector popover update live list positions without closing the popover or dropping keyboard focus.
- **Rapid View Switching**: Quick successive tab clicks smoothly abort in-flight rendering and display the latest selected view.

### Concurrent Operations
- Multi-window / popout leaf view switching updates local leaf state independently without cross-window state pollution.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|---|---|---|
| Scope | 10/25 | Toolbar command deck clustering, WAI-ARIA tablist, split New button, All Views hub, and Add View sheet |
| Risk | 6/25 | Presentation and view state management only; underlying database query engine and storage untouched |
| Research | 6/20 | Exhaustive target citations and interaction patterns established across both research tracks |
| **Total** | **22/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Split Button vs Dropdown on Mobile**: On mobile phones, the primary New button acts as a single-tap default creator, with a secondary long-press or overflow option for template selection.
- **Settings Hierarchy**: Unified "View Settings" is adopted as the primary trigger, contextually displaying active layout controls (chart metrics, calendar fields) alongside general view configurations.
- **Tab Selection Resolution**: Stable view IDs (`view.id`) via `resolveViewSelection` are adopted vault-wide to replace fragile index-based tracking.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../003-popovers-menus-elevation/spec.md`](../003-popovers-menus-elevation/spec.md)
- **Research Synthesis**: `specs/public/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 04 (Devin Track)**: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-04.md`
- **Research Iteration 04 (Codex Track)**: `specs/public/002-ui-improvement-research/research/codex-luna/iteration-04.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
