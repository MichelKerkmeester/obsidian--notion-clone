---
title: "Feature Specification: Empty and First-Run States"
description: "Establishes unified, reason-aware empty states, onboarding starter guidance, zero-result recovery actions, and structural preservation across all database views."
trigger_phrases:
  - "empty states"
  - "first-run onboarding"
  - "zero-result recovery"
  - "empty state renderer"
  - "no columns empty state"
  - "no database hero"
  - "clear filters cta"
  - "clear search cta"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/001-empty-and-first-run-states"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled empty and first-run states feature specification"
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
      session_id: "ui-build-001"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Empty and First-Run States

> Phase chain: parent [`../spec.md`](../spec.md), sibling phase `002-table-grid-experience`.

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
Currently, empty and first-run states across the Note Database plugin are visually stark, inconsistent, and functionally dead ends:
1. **First-Run Onboarding Dead-End**: When no database exists, `DatabaseView.renderEmptyDashboard()` (`src/views/DatabaseView.ts:6624-6634`, `styles.css:6136-6153`) renders a bare container with a plain string and a single button that immediately launches a heavy modal (`AddDatabaseModal.ts:29-82`), providing zero visual guidance, workflow context, or starter presets.
2. **Missing-Column Dead-End**: When a database has no configured schema columns (`src/views/DatabaseView.ts:6366-6372`, `src/views/EmbeddedDatabaseRenderer.ts:945-949`), the plugin displays bare text `empty.noColumnsDb` with no interactive button to create properties or scan frontmatter.
3. **Filter/Search Zero-Result Dead-End**: When queries or search terms yield 0 matching records, grouped tables render generic `common.noMatchingData` text without distinguishing between an empty source folder, active filter rules, or search keywords. Users have no contextual "Clear search" or "Reset filters" recovery action (`src/views/TableRenderer.ts:98-104`, `src/views/GalleryRenderer.ts:95,139`, `src/views/ListRenderer.ts:88,130`).
4. **Grouped Table Structural Destruction**: In `TableRenderer.renderGroupedTable()` (`src/views/TableRenderer.ts:98-104`), if `rows.length === 0`, the entire `<table>`, `<colgroup>`, and `<thead>` header structure is wiped out and replaced with a flat `div.db-empty`, causing severe layout jumping compared to ungrouped `renderTable()` (`src/views/TableRenderer.ts:69-86`).
5. **Partial-View Disconnects in Calendar & Timeline**: In Calendar (`src/views/CalendarRenderer.ts:118-124, 2216-2218`) and Timeline (`src/views/CalendarTimelineRenderer.ts:230-248, 2148-2153`), missing date properties or records lacking dates produce stark text errors rather than guided configuration CTAs.

### Purpose
Build a reusable, reason-aware `EmptyStateRenderer` (`src/views/EmptyStateRenderer.ts`) inspired by the existing `ChartRenderer` pattern (`src/views/ChartRenderer.ts:555-608`). Deploy it across all view renderers, embedded codeblocks, and the first-run dashboard. Provide 1-click recovery actions ("Clear search", "Reset filters", "+ Add Property", "Select date property") and onboarding starter presets, while preserving table structure during zero-result queries and maintaining strictly display-only, mobile-safe, and iCloud-safe execution.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **New Module `src/views/EmptyStateRenderer.ts`**: Standalone renderer providing standard empty state cards with Lucide icons, title, descriptive message, optional diagnostic badge (e.g. "0 of 42 records match"), and contextual action buttons.
- **First-Run Onboarding Hero**: Replace bare `renderEmptyDashboard` (`DatabaseView.ts:6624-6634`, `styles.css:6136-6153`) with a welcoming onboarding hero offering 1-click starter template presets (Tasks, Projects, Reading List, Notes).
- **Actionable Zero-Column State**: Upgrade `empty.noColumnsDb` (`DatabaseView.ts:6366-6372`, `EmbeddedDatabaseRenderer.ts:945-949`) to an interactive card with a primary "+ Add Property" button that opens `CreatePropertyModal` (`src/views/modals/CreatePropertyModal.ts:9-70`).
- **Pipeline Diagnostics Contract**: Add a pure presentation diagnostics adapter alongside `src/data/RowPipeline.ts:23-111` that reads pipeline output (source count, post-search count, post-filter count, visible count) so renderers can discern why results are empty without changing the pipeline API or writing note data.
- **Contextual Query Recovery CTAs**: Provide inline "Clear search" (`state.searchText = ''`), "Reset filters" (`state.filters = []`, `state.filterTree = undefined`), and "Clear all" buttons in zero-result views (`TableRenderer.ts:98-104`, `GalleryRenderer.ts:95,139`, `ListRenderer.ts:88,130`).
- **Grouped Table Empty-State Handoff**: Consume the single-table and header structure owned by Phase 002, rendering the empty banner inside the resulting `<tbody>` without introducing a competing grouped-table architecture.
- **Empty Group Affordances**: Consume and verify Phase 006's owned Board column-header surface at `BoardRenderer.ts:311-351`; render clear "No records in this group" styling and dashed Kanban drop slots only on the Board drop/create surface (`BoardRenderer.ts:361-374, 432-471`), Gallery (`GalleryRenderer.ts:101-137`), and List (`ListRenderer.ts:94-128`).
- **Calendar & Timeline Empty State Parity**: Replace bare text strings in `CalendarRenderer.ts:118-124, 2216-2218` and `CalendarTimelineRenderer.ts:230-248, 2148-2153` with reason-aware cards ("Choose date property", "No dated records in range").
- **Embedded Database Codeblock Parity**: Route `EmbeddedDatabaseRenderer.ts:539, 945-957` empty and error states through compact `EmptyStateRenderer` cards.
- **CSS Styling & Responsive Layout**: Expand `styles.css:6129-6158` with modern flex cards, responsive wrapping for mobile screens, and theme-adaptive tokens.

### Out of Scope
- Writing data, property changes, or backlink tags to note frontmatter/bodies (strictly display-only / iCloud-safe).
- Multi-database relational schema creation wizards or cloud starter marketplaces.
- Full interactive backlog tray for undated calendar events (surfaced as count/guidance; full tray scheduled in Phase 006 / roadmap).
- Rebuilding the query engine or filter modal internals.

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/EmptyStateRenderer.ts` | Create | Reusable reason-aware empty state renderer with icon, copy, diagnostics, and recovery CTAs |
| `src/data/RowPipeline.ts` | Edit | Add a pure display diagnostics adapter that reads pipeline output without changing `build()` or writing note data |
| `src/views/DatabaseView.ts` | Edit | Wire first-run onboarding hero (`:6624-6634`), zero-column state (`:6366-6372`), and error handler (`:1248-1252, 6377-6382`) |
| `src/views/TableRenderer.ts` | Edit | Integrate contextual clear CTAs (`:69-86`) and consume Phase 002's grouped-table structure |
| `src/views/BoardRenderer.ts` | Edit | Enhance empty columns with dashed drop target slots and clear "No records in this group" state (`:311-374`) |
| `src/views/GalleryRenderer.ts` | Edit | Replace blank `Total 0` with contextual empty state (`:90-99`) and clean empty group sections (`:101-137`) |
| `src/views/ListRenderer.ts` | Edit | Replace blank `Total 0` with contextual empty state (`:85-92`) and clean empty group sections (`:94-128`) |
| `src/views/CalendarRenderer.ts` | Edit | Upgrade `noDateField` and `noEvents` empty rendering with actionable CTAs (`:118-124, 2216-2218`) |
| `src/views/CalendarTimelineRenderer.ts` | Edit | Upgrade `noDateField` and `noEvents` empty rendering with actionable CTAs (`:230-248, 2148-2153`) |
| `src/views/EmbeddedDatabaseRenderer.ts` | Edit | Compact empty state card parity for embedded codeblocks (`:539, 945-957`) |
| `styles.css` | Edit | Responsive flex cards, onboarding hero, starter preset tiles, dashed drop targets (`:6129-6158`) |
| `src/views/EmptyStateRenderer.test.ts` | Create | Unit tests verifying reason-aware empty state dispatch, action firing, and stage diagnosis |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Modular `EmptyStateRenderer` component | `src/views/EmptyStateRenderer.ts` exports a standalone renderer supporting standard reasons (`no-database`, `no-columns`, `search-empty`, `filter-empty`, `filter-and-search-empty`, `no-date-field`, `no-events`, `read-failed`, `empty-group`), icons, title, description, and contextual action callbacks. |
| REQ-002 | First-Run Onboarding Hero & Starter Presets | `DatabaseView.renderEmptyDashboard()` (`src/views/DatabaseView.ts:6624-6634`) renders a styled hero with title, introductory description, primary "Create Database" CTA, and starter preset cards (Tasks, Projects, Reading List, Notes) triggering in-memory view configs. |
| REQ-003 | Actionable Zero-Column Database State | When `!config.schema?.columns?.length` (`DatabaseView.ts:6366-6372`, `EmbeddedDatabaseRenderer.ts:945-949`), render an empty state card with a primary "+ Add Property" button that directly opens `CreatePropertyModal`. |
| REQ-004 | Presentation-Only Pipeline Diagnostics Contract | A pure helper alongside `RowPipeline.ts:23-111` reads or annotates pipeline output for display with stage counts (`sourceCount`, `postSearchCount`, `postFilterCount`, `visibleCount`, `hasActiveSearch`, `hasActiveFilters`); it does not change `RowPipeline.build()`'s return type, write note data, or mutate note bodies/frontmatter. |
| REQ-005 | Contextual Recovery CTAs for Query-Empty States | When `rows.length === 0` due to active search or filter rules, render "Clear search", "Reset filters", or "Clear all" CTAs that reset view state and refresh without page reload (`TableRenderer.ts:98-104`, `GalleryRenderer.ts:95,139`, `ListRenderer.ts:88,130`). |
| REQ-006 | Consume Phase 002 Grouped-Table Structure | After Phase 002 owns the grouped-table architecture (`TableRenderer.ts:98-191`), this phase consumes the resulting table, colgroup, and `<thead>` contract and verifies that its empty-state banner renders inside `<tbody>`; this phase does not rewrite grouped-table DOM structure. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-007 | Board, Gallery, and List Empty Group Affordances | Phase 006 owns the Board column-header surface at `BoardRenderer.ts:311-351`; Phase 001 consumes and verifies that surface only. Empty-group presentation uses the Board drop/create surface (`BoardRenderer.ts:361-374, 432-471`), Gallery (`GalleryRenderer.ts:101-137`), and List (`ListRenderer.ts:94-128`), with Board rendering a dashed empty drop slot. |
| REQ-008 | Calendar & Timeline Date Configuration Empty Parity | When no date property is selected or no events match the time window, Calendar (`CalendarRenderer.ts:118-124, 2216-2218`) and Timeline (`CalendarTimelineRenderer.ts:230-248, 2148-2153`) render actionable empty cards with "Select date property" CTAs. |
| REQ-009 | Embedded Database Codeblock Parity | `EmbeddedDatabaseRenderer.ts:539, 945-957` uses compact `EmptyStateRenderer` cards for missing views, missing columns, read errors, and query-empty results. |
| REQ-010 | Display-Only, Mobile-Safe, and iCloud-Safe Presentation | Empty states, presets, and CTAs operate strictly in-memory; rendering never writes to note frontmatter or bodies; all layouts wrap cleanly on mobile viewports (`styles.css:6129-6158`). |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A newly installed vault with 0 databases opens to the guided onboarding hero card with starter presets rather than stark text.
- **SC-002**: A database with 0 configured columns displays a clear card with a functional "+ Add Property" button opening `CreatePropertyModal`.
- **SC-003**: Applying a search or filter that yields 0 records presents an empty state with one-click "Clear search" or "Reset filters" buttons across Table, Board, Gallery, and List views.
- **SC-004**: The Phase 002 grouped-table output preserves column headers, colgroups, and table frame for 0-record states, and this phase's empty banner fits inside that structure without layout jumping.
- **SC-005**: Calendar and Timeline views with no date property display an actionable "Select date property" button.
- **SC-006**: Rendering any empty or first-run state causes 0 frontmatter writes (iCloud-safe display-only).
- **SC-007**: Unit tests in `src/views/EmptyStateRenderer.test.ts` pass cleanly under `npx vitest run`.

### Acceptance Scenarios

- **Scenario 1**: **Given** no active database in the vault, **when** the user opens the database view, **then** the onboarding hero renders with starter preset cards and "Create Database" button.
- **Scenario 2**: **Given** a database where search query `"xyz"` matches 0 rows, **when** the view renders, **then** an empty state appears with text `No results for "xyz"` and a `Clear search` button; clicking it clears the search input and restores all rows.
- **Scenario 3**: **Given** a grouped table view, **when** active filters eliminate all records, **then** the table headers remain visible and aligned, and a centered empty state banner appears in the table body with a `Reset filters` CTA.
- **Scenario 4**: **Given** a calendar view without a date property selected, **when** the view renders, **then** an empty state card appears with a `Select date property` button opening view options.
- **Scenario 5**: **Given** an embedded database codeblock with no columns, **when** rendered inside a note, **then** a compact empty state card appears with a `+ Add Property` button.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Phase 002 grouped-table architecture changes the empty-state insertion point | Empty banner is placed outside the shared table frame | Consume the Phase 002 table/colgroup/thead contract and render only the empty-state tbody content here |
| Risk | Starter template presets attempt to write note files without user consent | Violates iCloud-safe / display-only policy | Presets initialize in-memory database and view definition configs (`ViewConfig`) only; preset clicks never write a view-definition file, and note creation only happens upon user clicking `+ New` |
| Risk | Action callbacks cause infinite render loops | View state triggers recursive refreshes | Clear actions use direct `this.vs().searchText = ""` and `this.scheduleConfigSave()` followed by single `this.refresh()` |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 01) | Baseline requirements and target citations | Requirements directly mapped to Top 10 item #10 and iteration 01 recommendations |
| Dependency | `CreatePropertyModal` and `AddDatabaseModal` | Action button targets | Use existing modal classes without modifying modal internals |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Empty state rendering adds < 5ms DOM creation overhead; diagnostics run in single-pass O(N) alongside existing pipeline execution.
- **NFR-P02**: Table header preservation on 0 rows reuses existing colgroup calculations without triggering secondary reflows.

### Security
- **NFR-S01**: No external network requests, telemetry, or third-party asset loading; pure local rendering with Obsidian Lucide icons.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: rendering empty states produces 0 writes to markdown note bodies or frontmatter.
- **NFR-R02**: Mobile-safe: empty state cards, preset grids, and recovery buttons wrap gracefully on viewports down to 320px width (`styles.css:6129-6158`).

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **0 total notes in source folder vs 0 notes matching filter**: Pipeline diagnostics distinguish `sourceCount === 0` ("Folder has no markdown files") from `postFilterCount === 0` ("No notes match active filters").
- **Both search query and filter rules active with 0 results**: Empty state displays "No records match search and filters" with two distinct buttons: "Clear search" and "Reset filters", plus a "Clear all" option.
- **Result limit set to 0**: When `resultLimit === 0` or low limit hides all records, diagnostics show "0 of N records shown due to limit" with an "Adjust limit" or "Show all" CTA.
- **Empty Kanban column / Empty group**: Valid drop targets are styled with dashed borders to signify drop readiness rather than missing data.

### Error Scenarios
- **Source folder read failure / permission error**: `DatabaseView.ts:6377-6380` renders a dedicated error card with "Retry" button and collapsed technical details (`styles.css:6154-6158`).
- **Missing or corrupted view definition**: `EmbeddedDatabaseRenderer.ts:539` renders a compact card explaining that the view definition was not found.

### Concurrent Operations
- Rapidly switching between search keywords or filter toggles cleanly tears down existing empty state nodes without orphan DOM elements or memory leaks.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | One new renderer module + localized edits to 7 view renderers and CSS |
| Risk | 5/25 | Display-only UI changes; existing data pipeline and persistence untouched |
| Research | 6/20 | Exact requirements and call sites locked by two-track research audit |
| **Total** | **19/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Starter preset storage**: Presets are static in-memory configurations in `EmptyStateRenderer.ts` / `DatabaseView.ts` that initialize standard view configs; no external template files required.
- **Clear button behavior**: "Clear search" resets `this.vs().searchText = ""` and clears the toolbar search input; "Reset filters" clears `this.vs().filters = []` and `this.vs().filterTree = undefined`.
- **Grouped table zero-row header rendering**: Schema columns are extracted from `config.schema.columns` directly via `actions.getVisibleColumns(config, [])`.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Research Synthesis**: `specs/public/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 01 (Devin Track)**: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-01.md`
- **Research Iteration 01 (Codex Track)**: `specs/public/002-ui-improvement-research/research/codex-luna/iteration-01.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
