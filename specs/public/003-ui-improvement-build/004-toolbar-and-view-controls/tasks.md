---
title: "Tasks: Toolbar and View Controls"
description: "Ranked task breakdown for toolbar and view controls modernization, ordered by research priority with real fork file:line targets and S/M/L effort tiers."
trigger_phrases:
  - "toolbar tasks"
  - "command deck tasks"
  - "view switcher tasks"
  - "split new button tasks"
  - "all views hub tasks"
  - "add view preset tasks"
  - "search clear tasks"
  - "badge vocabulary tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/004-toolbar-and-view-controls"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled toolbar and view controls task documentation"
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
# Tasks: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|---|---|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred out of this phase |

**Task Format**: `T### [P?] Description (file path) [effort tier]`

Tasks below follow the research synthesis's RANKED BACKLOG order (rank # in parentheses). Effort tiers (S/M/L) come from the research synthesis.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read this phase's decision-ready findings and evidence trail (`specs/public/002-ui-improvement-research/research/synthesis.md:1-20`, `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-04.md`, `specs/public/002-ui-improvement-research/research/codex-luna/iteration-04.md`) [S]
- [x] T002 Record the fork's baseline build and test state (`npx tsc --noEmit`, `npm run build`, `npx vitest run`) (`vitest.config.ts:1-9`) [S]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Task order follows the research synthesis RANKED BACKLOG (rank # shown per task).

- [x] T010 **(rank 6) 4-Cluster Semantic Toolbar Reorganization**: Restructure `.db-toolbar-right` into 4 functional clusters: (1) Query Cluster (`Filter`, `Sort`, `Group`), (2) Properties Cluster (`Properties`), (3) Overflow Utilities Menu `...` (collapsing `Sync Computed`, `Refresh DB`, `Export`, `Open File`, `Display Width`, `View Settings`), and (4) Primary Creation Button (`src/views/ToolbarRenderer.ts:252-286`, `styles.css:1256`) [M]
- [x] T011 **(rank 9, toolbar portion) Standardized Icon-Button Accessibility Contract**: Update `createIconButton` to ensure every toolbar button has `type="button"`, an explicit `aria-label`, `aria-haspopup`/`aria-expanded`/`aria-controls` when opening panels, visible `:focus-visible` outline styling, and expanded 44×44px touch envelopes (`::before { inset: -8px; }`) on mobile (`src/views/ToolbarRenderer.ts:1071-1085,1138-1160,1575-1649,1768-1777`, `styles.css:1320-1364`) [S]
- [x] T012 **(rank 6) WAI-ARIA View Switcher Tablist with Stable View IDs**: Annotate `.db-view-tabs` with `role="tablist"` and view tab buttons with `role="tab"`, `aria-selected`, `aria-controls`; implement roving keyboard focus (`ArrowLeft`/`ArrowRight`, `Home`/`End`); wire active tab selection through `src/data/ViewSelection.ts:16-43` using stable `view.id` rather than numeric index positions (`src/views/ToolbarRenderer.ts:625-683`, `src/views/DatabaseView.ts:1876-1888,2969-2978`, `styles.css:1512`) [M]
- [x] T013 **(toolbar backlog 1) Split "+ New" Button with Multi-Template Menu**: Convert `.db-new-button` to a split button featuring a primary default creation half and a dedicated `▼` dropdown trigger that lists registered vault templates, "Create Blank Note", "Set Default Template", and "Insert at Top / Bottom" placement toggles (`src/views/ToolbarRenderer.ts:1716-1739`, `src/data/TemplateToolbarAction.ts:6-32`, `styles.css:1633`) [M]
- [x] T014 **(toolbar backlog 9) Unswallowed Primary New Action Lifecycle**: Ensure intentional clicks on the primary New button execute in a single tap by treating it as an explicit transition that closes open overlays and immediately proceeds with note creation (`src/views/DatabaseView.ts:562-565,839-872`, `src/views/ToolbarRenderer.ts:1716-1739`) [M]
- [x] T015 **(toolbar backlog 3) Searchable "All Views" Hub on Tab Overflow**: Replace the bare `⋯` overflow dropdown with a full view management popover featuring live search filtering, custom view icons, layout badges, active indicators, and inline action buttons (Rename, Duplicate, Change Layout, Delete) (`src/views/ToolbarRenderer.ts:721-794`, `styles.css:1258-1274`) [M]
- [x] T016 **(toolbar backlog 6) Fix Nested Interactive Buttons in Database Selector Popover**: Replace invalid nested `button > button` DOM in `renderDatabasePopoverRow` with a non-interactive row container, a dedicated selection button, and separate sibling up/down move buttons (`src/views/ToolbarRenderer.ts:425-477`, `styles.css:8430-8445,15520-15522`) [M]
- [x] T017 **(toolbar backlog 2) Rich "Add View" Preset Sheet with Layout Preview Cards**: Upgrade `showAddViewMenu` to a rich view creation popover featuring visual layout preview cards, view name/icon input, key field selectors, an explicit "Duplicate current view" toggle, and a disabled state displaying "15 views maximum" when at capacity (`src/views/ToolbarRenderer.ts:654-663,921-962`, `src/views/DatabaseView.ts:2981-3020`) [M]
- [x] T018 **(quick win 7) Jitter-Free Search Control with Inline Clear (`✕`)**: Replace layout-shifting width expansion with stable min-width / overlay expansion, add an inline `✕` clear icon button when text is present, bind `Escape` to clear text and blur, and add a `⌘F` / `Ctrl+F` shortcut tooltip (`src/views/ToolbarRenderer.ts:1087-1123`, `styles.css:2687-2750`) [S]
- [x] T019 **(toolbar backlog 5) Unified "View Settings" Scope & Options Consolidation**: Consolidate layout-specific settings (`Chart Options`, `Calendar Options`, `Timeline Options`) under a unified `View Settings` entry point, label panel sections clearly as "Current view" and "Current database" (visibly read-only in embeds), and reflect trigger pressed state (`src/views/ToolbarRenderer.ts:1603-1614`, `src/views/ViewConfigPanelRenderer.ts:248-267`, `src/views/DatabaseView.ts:4589-4639`, `src/views/EmbeddedDatabaseRenderer.ts:1756-1801`) [S]
- [x] T020 **(quick win 17) Distinct Badge Vocabulary for Query Rules vs Properties**: Differentiate badge styles: retain accent numeric pills for active Filter/Sort rule counts, but display Properties as a neutral "N hidden" badge (omitting badge when all columns are visible) with an accessible label like "Properties, 2 hidden" (`src/views/ToolbarRenderer.ts:1575-1649,1801-1804`, `styles.css:1551-1566`) [S]
- [x] T021 **(quick win 18) Frontmatter Embed Expand / Open-Full-View Button**: Render a visible expand/full-view icon button in frontmatter embedded database headers next to the title, wired to `openFullView` (`src/views/ToolbarRenderer.ts:156-209,227-249`, `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`, `styles.css:12465-12509`) [S]
- [x] T022 **(toolbar backlog 10) Disambiguated Database Heading Trigger & Rename Affordance**: Separate the database switcher dropdown chevron into a distinct click target and add a persistent hover pencil icon for title rename to prevent accidental popover opens (`src/views/ToolbarRenderer.ts:156-209`, `styles.css:715-790`) [S]
- [x] T023 **(iteration 04 rec 7) View Tab Drag Insertion Line & Edge Auto-Scroll**: Replace full-tab inset box-shadow drop target with a precise 2px vertical accent insertion indicator between tabs, and enable auto-scrolling when dragging near tab strip overflow edges (`src/views/ToolbarRenderer.ts:686-720`, `styles.css:1241-1249`) [S]
- [x] T024 **(iteration 04 rec 8) Custom View Icons & Unconstrained Inline Tab Rename**: Remove the 140px max-width cap on `startRenameView` with auto-expanding input width, and enable assigning custom emoji/Lucide icons per view (`view.icon`) (`src/views/ToolbarRenderer.ts:636-642,974-1006`, `styles.css:1275-1288`) [S]
- [x] T025 **(iteration 04 rec 11) "Clear All" Action & Scroll Fade Masks on Active View Controls Rail**: Add a single-click "Clear all" button to reset all active filters/sorts, and apply horizontal CSS gradient fade masks to `.db-active-view-controls-scroll` when chips overflow (`src/views/ActiveViewControlsRenderer.ts:54-100`, `styles.css:1283`) [S]
- [x] T026 **(iteration 04 rec 9) Mobile Floating Action Button (FAB) & 44px Touch Envelopes**: On `.is-phone` viewports, render the primary New button as a floating action button in the bottom-right thumb zone, and add horizontal scroll shadow cues to the secondary toolbar button rail (`src/views/ToolbarRenderer.ts:262,1729`, `styles.css:14260`) [M]
- [x] T027 **(iteration 04 rec 10) Roving Keyboard Navigation in Toolbar Popovers**: Add WAI-ARIA roving keyboard navigation (`ArrowDown`/`ArrowUp`, `Enter`/`Space`, `Home`/`End`) to Database Selector, Title Actions, View Tab context menus, and Add View popovers (`src/views/ToolbarRenderer.ts:436-479,862-874`, `styles.css:8389-8655`) [M]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit & Integration Tests
- [x] T050 Run TypeScript compilation and build gate (`npx tsc --noEmit`, `npm run build`) (`package.json:1-38`) [S]
- [x] T051 Run Vitest test suite (`npx vitest run`, 355 tests across 45 files) (`vitest.config.ts:1-9`) [S]
- [x] T052 Verify toolbar 4-cluster responsive rendering across narrow split panes and mobile viewports (`src/views/ToolbarRenderer.ts:274-322`) [S]
- [x] T053 Verify WAI-ARIA tablist roving keyboard navigation and stable view ID selection continuity (`src/views/ToolbarRenderer.ts:625-683`) [S]
- [x] T054 Verify split New button template selection, placement options, and single-tap unswallowed execution (`src/views/ToolbarRenderer.ts:510-585`) [S]
- [x] T055 Verify display-only rendering: zero writes to note frontmatter or bodies occur during toolbar interactions (`src/views/ToolbarRenderer.ts:625-683`) [S]

### Documentation
- [x] T056 Update `checklist.md` evidence and `implementation-summary.md` with verification results (`checklist.md:1-10`) [S]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All 27 tasks completed and verified with zero compiler or test errors (`tasks.md:62-115`, `355 tests across 45 files`).
- [x] P0 acceptance criteria (REQ-001 through REQ-006) met and verified (`checklist.md:48-75`).
- [x] P1 acceptance criteria (REQ-007 through REQ-018) met or user-approved (`checklist.md:76-106`).
- [x] `checklist.md` fully verified with P0/P1 counts recorded (`checklist.md:48-106`).
- [x] `implementation-summary.md` updated with final build details (`implementation-summary.md:1-10`).

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:cross-refs -->
