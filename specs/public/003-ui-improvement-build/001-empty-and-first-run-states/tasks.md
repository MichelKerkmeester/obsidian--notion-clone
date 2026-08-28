---
title: "Tasks: Empty and First-Run States"
description: "Ranked task breakdown for empty and first-run states across all database views, ordered by research priority with real fork file:line targets and S/M/L effort tiers."
trigger_phrases:
  - "empty states tasks"
  - "first-run tasks"
  - "zero-result tasks"
  - "empty state renderer"
  - "empty state implementation"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/001-empty-and-first-run-states"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled empty and first-run states documentation"
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
# Tasks: Empty and First-Run States

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
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

- [x] T001 Read decision-ready findings and evidence trail (`specs/public/002-ui-improvement-research/research/synthesis.md:1-20`, `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-01.md`, `specs/public/002-ui-improvement-research/research/codex-luna/iteration-01.md`) [15m]
- [x] T002 Record fork test, typecheck, and lint baseline (`vitest.config.ts:1-9`, `npx vitest run`, `npx tsc --noEmit`) [10m]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Task order follows the research synthesis RANKED BACKLOG (rank # shown per task).

- [x] T010 **(rank 10) Modular `EmptyStateRenderer` component**: create `src/views/EmptyStateRenderer.ts` exporting a reusable renderer supporting standard reasons (`no-database`, `no-columns`, `search-empty`, `filter-empty`, `filter-and-search-empty`, `limit-empty`, `no-date-field`, `no-events`, `read-failed`, `empty-group`), Lucide icons, descriptive text, optional stage diagnostics badges, and contextual action buttons with keyboard accessibility (`src/views/EmptyStateRenderer.ts`, inspired by `src/views/ChartRenderer.ts:555-608`) [S]
- [x] T011 **Presentation-only pipeline diagnostics contract**: add a pure helper alongside `RowPipeline.ts` that reads or annotates pipeline output with stage counts (`sourceCount`, `postSearchCount`, `postFilterCount`, `visibleCount`, `hasActiveSearch`, `hasActiveFilters`) for display; do not change `RowPipeline.build()`'s return type, write note data, or mutate note bodies/frontmatter (`src/data/RowPipeline.ts:23-111`) [S]
- [x] T012 **First-run onboarding hero & starter presets**: replace bare `renderEmptyDashboard` in `DatabaseView.ts` with an onboarding hero container featuring an icon, introductory text, a primary "Create Database" CTA, and 4 starter preset cards (Tasks, Projects, Reading List, Notes) that initialize pre-configured in-memory view definitions (`src/views/DatabaseView.ts:6624-6634`, `styles.css:6136-6153`) [M]
- [x] T013 **Actionable zero-column database state**: upgrade `empty.noColumnsDb` from static text into an interactive empty card with a primary "+ Add Property" button that opens `CreatePropertyModal` in both full database and embedded contexts (`src/views/DatabaseView.ts:6366-6372`, `src/views/EmbeddedDatabaseRenderer.ts:945-949`, `src/views/modals/CreatePropertyModal.ts:9-70`) [S]
- [x] T014 **Contextual clear actions for filter/search empty states**: in the zero-result renderer branches, when `rows.length === 0` due to active search or filters, render inline "Clear search" (`state.searchText = ''`), "Reset filters" (`state.filters = []`, `state.filterTree = undefined`), or "Clear all" CTAs that reset view state and refresh immediately (`src/views/TableRenderer.ts:98-104`, `src/views/GalleryRenderer.ts:95,139`, `src/views/ListRenderer.ts:88,130`, `styles.css:6146-6153`) [S]
- [x] T015 **Consume Phase 002 grouped-table output**: integrate the empty banner into the single-table structure produced by Phase 002 and verify its `<tbody>` placement without rewriting `renderGroupedTable`, colgroups, or `<thead>` architecture (`src/views/TableRenderer.ts:98-191`, `styles.css:6130-6135`) [S]
- [x] T016 **Empty group & drop slot affordances**: Phase 006 owns the Board column-header surface at `src/views/BoardRenderer.ts:311-351`; Phase 001 consumes and verifies that surface only. This task owns the Board drop/create surface at `src/views/BoardRenderer.ts:361-374, 432-471`, plus empty-group styling in `GalleryRenderer.ts:101-137` and `ListRenderer.ts:94-128`, with a dashed drop slot affordance indicating a valid destination for card dragging (`styles.css:6175-6229, 7043-7070`) [S]
- [x] T017 **Calendar & timeline date configuration empty states**: replace plain `.db-empty` strings in Calendar and Timeline with `EmptyStateRenderer` cards offering a "Select date property" button when unconfigured (`src/views/CalendarRenderer.ts:118-124, 2216-2218`, `src/views/CalendarTimelineRenderer.ts:230-248, 2148-2153`) [S]
- [x] T018 **Embedded database codeblock empty parity**: update `EmbeddedDatabaseRenderer.ts` to use compact `EmptyStateRenderer` cards for missing views (`:539`), missing columns (`:945-949`), read errors (`:950-957`), and zero filter matches (`src/views/EmbeddedDatabaseRenderer.ts:539, 940-960`) [S]
- [x] T019 **Empty state CSS styling & token integration**: add responsive flex styles for `.db-empty-hero`, `.db-empty-presets`, `.db-empty-preset-card`, `.db-empty-action-group`, `.db-empty-table-row`, and `.db-board-empty-slot` in `styles.css`, supporting both light and dark theme contrast (`styles.css:7065`) [S]

### Deferred (out of this phase — parent roadmap)

- [B] T020 **Unscheduled records backlog tray**: full collapsible backlog tray for undated notes in Calendar and Timeline views (`src/views/CalendarRenderer.ts:118-124`, `src/views/CalendarTimelineRenderer.ts:230-248`; deferred to Phase 006 / roadmap per synthesis backlog item 5.9) [M]
- [B] T021 **Interactive starter template generator engine**: multi-file schema scaffolding wizard with sample markdown note generation (`src/views/DatabaseView.ts:6624-6634`; deferred to future feature pack) [L]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit Tests
- [x] T050 Run `npx vitest run`: verify `EmptyStateRenderer.test.ts` passes for all reason types, icon mappings, and action callback triggers (`src/views/EmptyStateRenderer.test.ts`, `src/views/ChartRenderer.ts:555-608`) [20m]

### Integration & Manual
- [x] T051 Type check and build gate: verify `npx tsc --noEmit` and `npm run build` pass with zero errors (`package.json:1-38`) [10m]
- [x] T052 Cross-view visual parity check: verify empty states render consistently across Table, Board, Gallery, List, Calendar, Timeline, Chart, and Embedded database views (`src/views/TableRenderer.ts:98-104`) [20m]
- [x] T053 Contextual recovery actions check: verify "Clear search", "Reset filters", "+ Add Property", and "Select date property" actions reset state and trigger correct views (`src/views/TableRenderer.ts:98-104`) [15m]
- [x] T054 Display-only and iCloud-safety proof: verify that rendering empty and first-run states causes 0 note-body or frontmatter mutations using a vault write spy or fixture snapshot (`src/data/RowPipeline.ts:23-29`) [10m]
- [x] T055 Mobile and touch layout check: verify onboarding hero and empty state cards wrap cleanly on mobile screens down to 320px width (`styles.css:6129-6158`) [10m]

### Documentation
- [x] T056 Update `checklist.md` evidence and `implementation-summary.md` with post-verification results (`checklist.md:1-10`) [10m]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All non-deferred tasks marked `[x]` after the build completes (`checklist.md:48-96`).
- [x] `[B]` tasks remain deferred roadmap items, not blockers of this phase (`tasks.md:1-10`).
- [x] Fork test suite, typecheck, and build pass with zero errors vs baseline (`package.json:1-38`, `362 tests across 46 files`).
- [x] `checklist.md` fully verified with P0/P1 counts recorded (`checklist.md:48-96`).

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:cross-refs -->
