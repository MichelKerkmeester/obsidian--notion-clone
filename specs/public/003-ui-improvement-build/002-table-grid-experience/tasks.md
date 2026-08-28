---
title: "Tasks: Table and Grid Experience"
description: "Ranked task breakdown for the table and grid surface modernization, ordered by research priority with real fork file:line targets and S/M/L effort tiers."
trigger_phrases:
  - "table grid tasks"
  - "table footer renderer tasks"
  - "grouped table tasks"
  - "cell picker tasks"
  - "frozen schema tasks"
  - "density modes tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/002-table-grid-experience"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "implementation-session"
    recent_action: "Reconciled table and grid experience task documentation"
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
# Tasks: Table and Grid Experience

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

- [x] T001 Read this phase's decision-ready findings and evidence trail (`specs/public/002-ui-improvement-research/research/synthesis.md:1-20`, `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-02.md`, `specs/public/002-ui-improvement-research/research/codex-luna/iteration-02.md`) [15m]
- [x] T002 Record the fork's baseline test, typecheck, and lint state (`vitest.config.ts:1-9`, `npx vitest run`, `npx tsc --noEmit`) [10m]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Task order follows the research synthesis RANKED BACKLOG (rank # shown per task).

- [x] T010 **(rank 5) Deduplicate grouped table theads into single sticky header**: refactor `TableRenderer.renderGroupedTable()` so that rather than instantiating a separate nested `.db-table-wrap > table.db-table` for every group, it renders a single continuous table with a single sticky `<thead>` matching the colgroup and renders groups as lightweight collapsible `tr.db-group-divider-row` divider bands (`src/views/TableRenderer.ts:88-191`, `styles.css:6183-6223, 6285-6288`) [M]
- [x] T011 **(rank 7) Column-aligned table calculation footer (`<tfoot>`)**: create isolated `TableFooterRenderer.ts` rendering native `<tfoot>` calculation cells aligned 1:1 with column widths, displaying active totals (Sum, Avg, Min, Max, Count, Unique, etc. via `src/data/Aggregate.ts`), hover `+ Calculate` hint for uncalculated columns, and calculation dropdown picker menu (`src/views/TableFooterRenderer.ts`, `src/views/TableRenderer.ts:69-86`, `styles.css:3425-3515`) [M]
- [x] T012 **(rank 151 / quick win 5) Trailing `+` add column header button**: append `th.db-add-column-th` with `+` icon button at the end of `<thead>` in `TableRenderer.renderHeader()` to directly launch `CreatePropertyModal` (`src/views/TableRenderer.ts:440-455`, `src/views/modals/CreatePropertyModal.ts:9-70`, `styles.css:4086-4120`) [S]
- [x] T013 **(rank 152 / quick win 6) Double-click resize handle auto-fit**: wire `dblclick` event listener on `.db-resize-handle` in `ColumnHeaderController.ts:49-87` to invoke `estimateAutoColumnWidth()` (`src/views/ColumnWidth.ts:39-61`), save optimal column width, and trigger layout sync [S]
- [x] T014 **(rank 38) Semantic column header, sort indicators & multi-sort gesture**: replace literal `"..."` menu trigger with accessible icon button (`type="button"`), render visual sort indicators and multi-sort order badges (`▲1`, `▼2`), and enable `Shift`+click sort rule appending without clobbering existing sort stack; leave `aria-sort` to Phase 008 T020 (`src/views/ColumnHeaderController.ts:21-47`, `src/views/ColumnMenu.ts:227-237`, `src/views/DatabaseView.ts:10220-10241`, `styles.css:4105-4208`) [S]
- [x] T015 **(rank 40) Stable column schema inference across filtering**: update `ColumnConfig.getVisibleColumns()` to evaluate default column presence against source schema/unfiltered records so active filtering does not hide or reorder empty columns (`src/data/ColumnConfig.ts:92-117`) [M]
- [x] T016 **(rank 41) Single-click activation for option, status, date cells**: enable single-click activation on Select pills, Status badges, and Date values through `makeEditable` while preserving cell selection and double-click/Enter inline editing for text fields (`src/views/CellRenderer.ts:418-430`) [M]
- [x] T017 **(rank 42) SVG 6-dot row drag grip with click-to-open row menu**: Phase 002 owns `setupRowDrag()` at `src/views/TableRenderer.ts:632-713`; replace `"⋮⋮"` text with SVG icon (`lucide:grip-vertical`), retain the table drag payload contract and row reordering, and bind single-click to open `RowMenu` anchored to the grip (`src/views/RowMenu.ts:30-48`, `styles.css:5044-5084`). Phase 007 consumes and verifies this surface only for table batch dragging [S]
- [x] T018 **(rank 150 / quick win 4) Clean whitespace placeholders for empty cells**: Phase 002 owns the generic empty-cell CSS block at `styles.css:4240-4247`; remove repeated `"empty"` / `"空"` text labels in unpopulated cells, rendering clean whitespace with subtle hover outline and tooltip hint (`src/views/CellRenderer.ts:183-204`). Phase 007 consumes and verifies this surface only for formula diagnostics [S]
- [x] T019 **(rank 44) Group-header selection checkbox with indeterminate state**: render tri-state selection checkboxes (`checked`, `unchecked`, `indeterminate`) in group divider rows, toggling selection for all visible rows in that group across `src/data/RangeSelection.ts:1-51` (`src/views/TableRenderer.ts:122-150`, `src/views/DatabaseView.ts:4166-4175`) [M]
- [x] T020 **(rank 45) Contextual column-menu filter action**: add the scoped filter action at the column-menu construction and route it through the column-menu bridge to append a `FilterRule` to active view filters; do not capture a cell value through `RowMenu` (`src/views/ColumnMenu.ts:58-66`, `src/views/DatabaseView.ts:6197-6208`) [M]
- [x] T021 **(rank 46) Jitter-free header hover CSS**: remove dynamic `padding-right: 32px` on `th:hover` to eliminate horizontal text displacement during pointer movement (`styles.css:4168, 4178-4208`) [S]
- [x] T022 **(rank 47) Hover in-between row insertion line with quick add (`+`)**: render subtle hover insertion line between table rows with centered `+` button triggering `createEntry` with `{ beforePath, afterPath }` (`src/views/TableRenderer.ts:501-550`, `styles.css:4660-4667`) [M]
- [x] T023 **(rank 10 / iter 02) Vertical line drop indicator for column reorder**: replace cell background highlight with crisp 2px vertical accent line indicator on target column boundaries during drag reordering (`src/views/ColumnHeaderController.ts:96-142`, `styles.css:4165-4209`) [S]
- [x] T024 **(rank 79) Consume Phase 005 row density tokens (Compact / Default / Comfortable)**: apply the Phase 005 `--db-row-height-*` scale (28px, 34px, 40px) from `styles.css:4070-4077` through the per-view density setting and table rendering (`src/data/types.ts:1-100`, `src/views/TableRenderer.ts:74-86`) [S]
- [x] T025 **(rank 132 / 161) Stable table DOM handoff for Phase 008 accessibility**: preserve the unified table, header, row, and cell structure required by Phase 008's WAI-ARIA grid contract; do not add ARIA roles or attributes in this phase (`src/views/TableRenderer.ts:60-120, 422-455, 501-549`) [S]
- [x] T028 **Table calculation footer unit test harness**: author table-driven unit tests in `src/views/TableFooterRenderer.test.ts` asserting correct aggregation math and column width index alignment (`src/views/TableFooterRenderer.test.ts`, `src/views/TableRenderer.ts:69-86`) [S]
- [x] T029 **Column schema stability unit tests**: author unit tests in `src/data/ColumnConfig.test.ts` verifying visible column preservation when rows are filtered to empty values (`src/data/ColumnConfig.test.ts`, `src/data/ColumnConfig.ts:92-117`) [S]

### Deferred (out of this phase — parent roadmap)

- [B] T030 **Pinned / freeze identity column**: freeze first column during wide table horizontal scrolling (`src/views/TableRenderer.ts:60-120`; deferred to future feature pack per research iteration 02 notes) [L]
- [B] T031 **Spreadsheet formula entry bar (`=`)**: dedicated top formula bar for inspecting and editing raw expressions across the entire database (`src/views/CellRenderer.ts:183-204`; deferred to roadmap) [L]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit Tests
- [x] T050 Run `npx vitest run`: verify `TableFooterRenderer.test.ts` and `ColumnConfig.test.ts` pass all test cases (`src/views/TableFooterRenderer.test.ts`, `src/data/ColumnConfig.test.ts`, `src/data/ColumnConfig.ts:92-117`) [20m]

### Integration & Manual
- [x] T051 Type check and build gate: verify `npx tsc --noEmit` and `npm run build` pass with zero errors (`package.json:1-38`) [10m]
- [x] T052 Grouped table single-header verification: verify grouped tables render exactly 1 sticky `<thead>` and columns align across all groups during scrolling (`src/views/TableRenderer.ts:88-191`) [15m]
- [x] T053 Column calculation footer verification: verify totals align under columns, hover reveals `+ Calculate` hint, and selecting a kind computes immediately (`src/views/TableRenderer.ts:69-86`) [15m]
- [x] T054 Multi-sort and auto-fit verification: verify `Shift`+click appends sort rules (`▲1`, `▼2`) and double-clicking `.db-resize-handle` auto-fits column width (`src/views/ColumnHeaderController.ts:21-87`) [10m]
- [x] T055 Single-click cell pickers & row grip menu: verify 1-click opens status/select pickers and clicking the SVG grip opens `RowMenu` (`src/views/CellRenderer.ts:418-430`) [10m]
- [x] T056 Display-only proof: verify that rendering table/grid views produces zero note frontmatter or body modifications using a vault write spy or fixture snapshot (`src/views/TableRenderer.ts:60-120`) [10m]

### Documentation
- [x] T057 Update `checklist.md` evidence and `implementation-summary.md` with post-verification results (`checklist.md:1-10`) [10m]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All non-deferred tasks marked `[x]` after the build completes (`checklist.md:48-104`).
- [x] `[B]` tasks remain deferred roadmap items, not blockers of this phase (`tasks.md:1-10`).
- [x] Fork test suite, typecheck, and build pass with zero errors vs baseline (`package.json:1-38`, `296 tests across 33 files`).
- [x] `checklist.md` fully verified with P0/P1 counts recorded (`checklist.md:48-104`).

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:cross-refs -->
