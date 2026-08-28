---
title: "Implementation Plan: Table and Grid Experience"
description: "Locked implementation plan for unified grouped sticky headers, column-aligned calculation tfoot, trailing add-column button, interactive cell pickers, SVG row grips, density modes, and WAI-ARIA grid semantics."
trigger_phrases:
  - "table grid plan"
  - "table footer renderer"
  - "grouped table single header"
  - "single click cell pickers"
  - "frozen column schema plan"
  - "row density modes plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/002-table-grid-experience"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Authored phase docs from the UI research synthesis"
    next_safe_action: "Implement phase 002 tasks from TableFooterRenderer onward"
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
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Table and Grid Experience

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian Plugin API |
| **Framework** | Native Obsidian DOM helpers (`createEl`, `createDiv`, `setIcon`, `t`), Lucide iconography |
| **Storage** | In-memory `ViewConfig` settings (density, column calculations); strictly display-only with zero note-body writes (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin bundle build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Top 10 recommendations #5 and #7, Quick Wins #4, #5, #6, and themed backlog items for the Table & Grid Surface. It introduces: (1) an isolated module `src/views/TableFooterRenderer.ts` rendering a native column-aligned `<tfoot>` calculation row with hover `+ Calculate` hint and aggregation menu, (2) a unified grouped table architecture in `src/views/TableRenderer.ts:88-191` that replaces multi-table `<thead>` duplication with a single sticky header and lightweight group divider rows (`tr.db-group-divider-row`), (3) a trailing `+` column header button launching `CreatePropertyModal`, (4) semantic column headers with visual 3-state sort indicators and non-destructive `Shift`+click multi-sort appending, while Phase 008 owns `aria-sort`, (5) double-click resize handle auto-fit, (6) frozen column schema inference in `src/data/ColumnConfig.ts:92-117` so filters never cause empty columns to vanish, (7) instant single-click activation for status, select, and date cell pickers in `src/views/CellRenderer.ts`, (8) SVG 6-dot row grip handles (`lucide:grip-vertical`) with click-to-open `RowMenu`, (9) clean whitespace empty cell placeholders, (10) tri-state group selection checkboxes, (11) a contextual column-menu filter action, (12) jitter-free header hover CSS, (13) hover in-between row insertion lines, and (14) consumption of the 3 row density modes (Compact, Default, Comfortable) defined by Phase 005.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Codebase call sites audited and verified with `file:line` evidence (`TableRenderer.ts`, `CellRenderer.ts`, `ColumnHeaderController.ts`, `ColumnMenu.ts`, `SummaryRenderer.ts`, `RowMenu.ts`, `ColumnConfig.ts`, `ColumnWidth.ts`, `RangeSelection.ts`, `DatabaseView.ts`, `styles.css`).
- [x] Research synthesis recommendations (Ranked #5, #7, Quick Wins #4, #5, #6, Table backlog 1–11) mapped directly to requirements and tasks.
- [x] Standing constraints verified: display-only, mobile-safe, iCloud-safe, MIT-forkable, no telemetry.
- [x] Scope bounded to table/grid presentation and view-state affordances; underlying persistence untouched.

### Definition of Done
- [ ] `TableFooterRenderer.ts` created and exported, rendering native column-aligned `<tfoot>` calculation cells with hover `+ Calculate` selector consuming `src/data/Aggregate.ts`.
- [ ] `TableRenderer.renderGroupedTable()` refactored to render a single continuous table with a single sticky `<thead>` and collapsible `tr.db-group-divider-row` divider bands.
- [ ] Trailing `th.db-add-column-th` button rendered at the end of `<thead>`, directly opening `CreatePropertyModal`.
- [ ] Column headers display 3-state visual sort indicators and multi-sort sequence badges (`▲1`, `▼2`); `Shift`+click appends sort rules without clearing existing rules, while Phase 008 owns `aria-sort`.
- [ ] Double-clicking `.db-resize-handle` executes `estimateAutoColumnWidth()` and updates column width.
- [ ] `ColumnConfig.getVisibleColumns()` preserves empty columns during active filtering.
- [ ] Single-clicking Select, Status, Date, and Checkbox cells immediately opens pickers or toggles state while preserving roving cell selection.
- [ ] Row drag handles render SVG 6-dot grip icons (`lucide:grip-vertical`) and single click opens `RowMenu`.
- [ ] Empty cells display clean whitespace without `"empty"` / `"空"` text labels.
- [ ] Group divider rows render tri-state selection checkboxes toggling visible group rows.
- [ ] Column menus include the scoped filter action and append view filter rules; cell and row context menus remain owned by `RowMenu`.
- [ ] Header hover padding shift removed in `styles.css`, eliminating label jitter.
- [ ] Hover between rows renders insertion line with `+` button creating records at that position.
- [ ] Phase 005's `--db-row-height` density tokens (Compact: 28px, Default: 34px, Comfortable: 40px) consumed via `ViewConfig.rowDensity`.
- [ ] Table DOM remains stable for Phase 008 to add the WAI-ARIA Grid semantics (`role="grid"`, `role="columnheader"`, `role="row"`, `role="gridcell"`); this phase does not add those roles.
- [ ] `npx tsc --noEmit`, `npm run build`, and `npx vitest run` pass cleanly with zero regressions.
- [ ] Display-only verified: 0 frontmatter or vault file modifications occur during table rendering.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
To maintain strict **rebase-clean** isolation and local-first stability:
1. **Isolated Module (`src/views/TableFooterRenderer.ts`)**: Encapsulates all `<tfoot>` DOM construction, per-column calculation formatting, and hover `+ Calculate` dropdown menus into a dedicated component.
2. **Unified Continuous Grid Architecture**: Grouped tables in `src/views/TableRenderer.ts:88-191` are refactored into a single continuous `<table>` sharing a single `<colgroup>`, single sticky `<thead>`, single `<tbody>`, and single `<tfoot>`. Groups are represented as `tr.db-group-divider-row` elements with `colspan="100%"`, cutting DOM nodes by > 70% and ensuring column widths remain perfectly synchronized across all groups.
3. **Frozen Schema Contract (`src/data/ColumnConfig.ts:92-117`)**: Default column auto-hide inference evaluates against source schema definitions rather than the filtered row slice, ensuring active filters narrow visible rows without altering column presence.
4. **Non-Destructive Multi-Sort Architecture**: `ColumnHeaderController.ts` and `DatabaseView.ts:10220-10241` treat modifier clicks (`Shift`+click) as rule append/toggle operations on `ViewConfig.sortRules`, preserving existing sort stacks while plain click retains familiar 1-click single-column sorting.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TableRenderer.ts                                 │
│  renderTable() / renderGroupedTable()                                       │
│  ├─ Colgroup (Shared column widths: Utility + Data + Trailing Add Column)   │
│  ├─ Single Sticky <thead> with WAI-ARIA Grid Semantics                      │
│  │  ├─ Multi-Sort Indicators (▲1, ▼2) + Column Menu Trigger Icon            │
│  │  ├─ Trailing <th> Button ("+ Add Column" → CreatePropertyModal)          │
│  │  └─ Double-Click Resize Handle (ColumnWidth.estimateAutoColumnWidth)     │
│  ├─ <tbody> (Single Continuous Table Body)                                  │
│  │  ├─ Group Divider Rows (tr.db-group-divider-row with Tri-State Checkbox) │
│  │  ├─ Data Rows (tr.db-row with SVG 6-dot Grip Handle & Hover Insert Line) │
│  │  │  └─ Cells (Single-Click Pickers, Whitespace Empty, Hover Dismiss ✕)   │
│  │  └─ Inline "+ New Row" Creator                                           │
│  └─ Native <tfoot> (Delegates to TableFooterRenderer.ts)                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TableFooterRenderer.ts (New)                         │
│  renderFooter(table, config, visibleColumns, rows, options): void           │
│  ├─ <tfoot> Row Aligned 1:1 with <colgroup> Widths                          │
│  ├─ Direct Tabular Calculations (Sum, Avg, Min, Max, Count, Unique, etc.)  │
│  ├─ Hover "+ Calculate" Affordance for Uncalculated Columns                 │
│  └─ Dropdown Calculation Selector Menu (Consumes src/data/Aggregate.ts)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Components & Integrations

- **`src/views/TableFooterRenderer.ts`** (new): Standalone component creating `<tfoot>`, aligning calculation cells with column widths, formatting aggregate numbers/dates/percents via `src/data/Aggregate.ts`, and opening the calculation picker menu.
- **`src/views/TableRenderer.ts`**:
  - `renderGroupedTable()` (`:88-191`): Refactored to single `<table>` with shared sticky `<thead>` and `tr.db-group-divider-row` divider bands.
  - `renderHeader()` (`:440-455`): Appends trailing `th.db-add-column-th` button launching `CreatePropertyModal`.
  - Phase 002 owns `setupRowDrag()` (`:632-713`): replaces `"⋮⋮"` with an SVG grip icon (`lucide:grip-vertical`), opens `RowMenu`, and defines the table drag payload contract; Phase 007 consumes and verifies this surface only.
  - In-between row hover insertion line (`:501-550`).
- **`src/views/ColumnHeaderController.ts`**:
  - `setupMenuTrigger()` (`:36-47`): Replaces `"..."` with accessible icon button (`type="button"`).
  - `setup()` (`:21-27`): Adds `Shift`+click sort rule appending; Phase 008 adds the `aria-sort` attributes.
  - `setupResizeHandle()` (`:49-87`): Adds `dblclick` auto-fit listener executing `estimateAutoColumnWidth()`.
  - `setupDragToReorder()` (`:96-142`): Replaces background highlight with 2px vertical accent line indicator.
- **`src/views/CellRenderer.ts`**:
  - `makeEditable()` / `renderCell()` (`:183-204, 418-430`): 1-click activation for Select, Status, Date, and Checkbox cells; clean empty whitespace without `"empty"` labels.
  - `ColumnMenu.show()` and the DatabaseView column-menu bridge (`ColumnMenu.ts:58-66`, `DatabaseView.ts:6197-6208`): Scoped column-menu filter action; cell and row context menus remain on `RowMenu`.
- **`src/data/ColumnConfig.ts`** (`:92-117`): Freezes column auto-hide inference against source schema/unfiltered records so filters do not remove empty columns.
- **`styles.css`**: Grouped table single-header styles (`:6183-6223, 6285-6288`), `<tfoot>` calculation styling (`:3425-3515`), density tokens (`:4070-4077`), jitter-free header hover (`:4168`).

### API Sketch

```ts
export interface TableFooterOptions {
  onCalculationChange: (columnKey: string, calculationKind: SummaryKind | null) => void;
  isReadOnly?: boolean;
}

export class TableFooterRenderer {
  renderFooter(
    table: HTMLTableElement,
    config: ViewConfig,
    columns: ColumnDef[],
    rows: RowData[],
    options: TableFooterOptions
  ): HTMLElement;
}
```

### Mobile/iCloud Safety Notes
- All rendering is strictly display-only: evaluating footer calculations, resizing column widths, and toggling density operate in-memory on `ViewConfig`. No note files or markdown bodies are written during rendering.
- Touch envelopes on mobile provide minimum 44px hit targets (`::before { inset: -8px; }`) on column menu triggers, row grips, and cell pickers with `touch-action: manipulation`.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup, Types & Schema Stability
- [ ] T001 Read decision-ready findings from `research/synthesis.md` and iteration 02 artifacts.
- [ ] T002 Record fork test, typecheck, and lint baseline.
- [ ] T011 Define calculation types and localized strings in `src/data/types.ts` and `src/i18n.ts` for the footer implementation.
- [ ] T015 Freeze column schema inference across filtering in `src/data/ColumnConfig.ts:92-117`.

### Phase 2: Table Calculation Footer Component
- [ ] T011 Implement `src/views/TableFooterRenderer.ts` rendering native column-aligned `<tfoot>` calculation cells, hover `+ Calculate` hint, and dropdown calculation selector menu consuming `src/data/Aggregate.ts`.
- [ ] T028 Author unit tests in `src/views/TableFooterRenderer.test.ts` verifying aggregate calculations and column index alignment.
- [ ] T011 Integrate `TableFooterRenderer` into `TableRenderer.renderTable()` and `TableRenderer.renderGroupedTable()`.

### Phase 3: Column Header Affordances & Multi-Sort
- [ ] T012 Add trailing `th.db-add-column-th` button at the end of `<thead>` in `TableRenderer.renderHeader()` launching `CreatePropertyModal` (`src/views/TableRenderer.ts:440-455`, `styles.css:4086-4120`).
- [ ] T013 Wire `dblclick` on `.db-resize-handle` in `ColumnHeaderController.ts:49-87` to invoke `estimateAutoColumnWidth()` (`src/views/ColumnWidth.ts:39-61`).
- [ ] T014 Upgrade column headers in `ColumnHeaderController.ts:21-47` with accessible icon button triggers, visual sort indicators, multi-sort badges (`▲1`, `▼2`), and `Shift`+click non-destructive sort appending; Phase 008 owns the `aria-sort` attribute.
- [ ] T021 Remove dynamic `padding-right: 32px` on `th:hover` in `styles.css:4168, 4178-4208` to eliminate header label jitter.
- [ ] T023 Implement 2px vertical accent line drop indicator for column reordering (`ColumnHeaderController.ts:96-142`, `styles.css:4165-4209`).

### Phase 4: Unified Grouped Table Architecture & Row Affordances
- [ ] T010 Refactor `TableRenderer.renderGroupedTable()` (`src/views/TableRenderer.ts:88-191`, `styles.css:6183-6223, 6285-6288`) to render a single continuous `<table>` with a single sticky `<thead>` and collapsible `tr.db-group-divider-row` divider bands.
- [ ] T019 Add tri-state selection checkboxes (`checked`, `unchecked`, `indeterminate`) to group divider rows (`TableRenderer.ts:122-150`, `src/data/RangeSelection.ts:1-51`).
- [ ] T017 Phase 002 owns `setupRowDrag()` (`TableRenderer.ts:632-713`): replace `"⋮⋮"` with an SVG 6-dot grip icon, bind single-click to open `RowMenu`, and define the table drag payload contract; Phase 007 consumes and verifies this surface only (`RowMenu.ts:30-48`, `styles.css:5044-5084`).
- [ ] T022 Implement subtle hover in-between row insertion line with centered `+` button in `TableRenderer.ts:501-550` and `styles.css:4660-4667`.

### Phase 5: Cell Affordances, Density & ARIA Grid Semantics
- [ ] T016 Enable single-click activation for Select, Status, Date, and Checkbox cells through `CellRenderer.ts:418-430` while preserving roving cell selection and double-click/Enter inline text editing.
- [ ] T018 Phase 002 owns the generic empty-cell CSS block at `styles.css:4240-4247`; replace textual `"empty"` / `"空"` labels in unpopulated cells with clean whitespace and subtle hover outlines (`CellRenderer.ts:183-204`). Phase 007 consumes and verifies this surface only.
- [ ] T020 Add the scoped filter action at the column-menu construction in `ColumnMenu.ts:58-66` and route it through the column-menu bridge in `DatabaseView.ts:6197-6208`; do not add cell-value capture to `RowMenu` here.
- [ ] T024 Consume the Phase 005 density token scale (Compact: 28px, Default: 34px, Comfortable: 40px) in `TableRenderer.ts:74-86` and the per-view setting; do not define competing CSS tokens.
- [ ] T025 Preserve the unified table DOM in `TableRenderer.ts:60-120, 422-549` as the handoff surface for Phase 008's WAI-ARIA grid contract; do not inject the roles here.

### Phase 6: Verification & Documentation
- [ ] T050 Run unit tests via `npx vitest run` (`TableFooterRenderer.test.ts`, `ColumnConfig.test.ts`).
- [ ] T051 Verify clean compilation and build (`npx tsc --noEmit`, `npm run build`).
- [ ] T052 Perform visual and interaction verification across grouped tables, multi-sort, auto-fit, and cell pickers.
- [ ] T053 Confirm display-only execution produces 0 note-body or frontmatter writes.
- [ ] T054 Synchronize `checklist.md` and `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `TableFooterRenderer.ts` aggregation math, column alignment, calculation change callbacks | Vitest (`npx vitest run`), `TableFooterRenderer.test.ts` |
| Unit | `ColumnConfig.ts` visible column calculation across filtered row slices | Vitest (`npx vitest run`), `ColumnConfig.test.ts` |
| Type Safety | Strict TypeScript type validation across all modified files | `npx tsc --noEmit` |
| Build Integrity | Production bundle packaging | `npm run build` |
| Integration | Grouped table sticky header scrolling, multi-sort appending, resize handle auto-fit, single-click pickers | Manual vault verification |
| Display-Only / iCloud | Verify 0 note frontmatter or body writes during table rendering or calculation | `git diff` on vault notes |
| Accessibility handoff | Phase 008 WAI-ARIA grid hierarchy and `aria-sort`; this phase's sort behavior and keyboard focus roving | Accessibility devtools inspector |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Research Synthesis (`research/synthesis.md`, iteration 02) | Internal | Green (complete) | Target citations and architecture patterns locked |
| `src/data/Aggregate.ts` (Rollup Aggregation Pack) | Internal | Green (shipped) | Footer aggregation calculation source of truth |
| `CreatePropertyModal` (`src/views/modals/CreatePropertyModal.ts`) | Internal | Green | Target for trailing `+` add column button |
| `RowMenu` (`src/views/RowMenu.ts`) | Internal | Green | Target for SVG grip click action |
| Phase `001-empty-and-first-run-states` | Predecessor | Planned | Sibling phase; table header preservation aligns with 001 contract |
| Phase `003-popovers-menus-elevation` | Successor | Planned | Independent; will consume column header menu triggers |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation errors, layout misalignment during table scrolling, or accidental note-body writes during rendering.
- **Procedure**: Revert the phase commit or remove `src/views/TableFooterRenderer.ts` and restore the 10 touched files to their pre-phase state. All edits are localized to rendering methods in `TableRenderer.ts`, `CellRenderer.ts`, and `ColumnHeaderController.ts`, so revert is straightforward and isolated.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup & Schema Stability | None | Table Footer Component |
| Table Footer Component | Setup & Schema Stability | Column Header Affordances |
| Column Header Affordances | Table Footer Component | Unified Grouped Table Architecture |
| Unified Grouped Architecture | Column Header Affordances | Cell Affordances & ARIA Grid |
| Cell Affordances & Density | Unified Grouped Architecture | Verification & Documentation |
| Verification & Documentation | Cell Affordances & Density | None |

Phase-level: `depends_on: 001-empty-and-first-run-states`; unblocks UI polish in sibling phases `003` through `008`.

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup & Schema Stability | Low | 25 minutes |
| Table Footer Component | Medium | 45 minutes |
| Column Header Affordances | Medium | 40 minutes |
| Unified Grouped Table Architecture | Medium | 50 minutes |
| Cell Affordances, Density & ARIA | Medium | 50 minutes |
| Verification & Documentation | Medium | 30 minutes |
| **Total** | | **~4 hours** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Working tree clean on branch `impl`.
- [ ] Baseline test/lint recorded with zero regressions.
- [ ] Display-only contract confirmed by code review (no vault writes in table rendering or calculations).

### Rollback Procedure
1. Revert the phase commit on branch `impl`.
2. Delete `src/views/TableFooterRenderer.ts`, `src/views/TableFooterRenderer.test.ts`, and `src/data/ColumnConfig.test.ts`.
3. Run `npx tsc --noEmit` and `npx vitest run` to verify baseline integrity.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A — all changes are purely presentational and display-only.

<!-- /ANCHOR:enhanced-rollback -->
