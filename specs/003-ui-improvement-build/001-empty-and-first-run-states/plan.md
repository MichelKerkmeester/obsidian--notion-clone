---
title: "Implementation Plan: Empty and First-Run States"
description: "Implementation plan for unified reason-aware empty states, onboarding starter guidance, zero-result recovery actions, and table header structural preservation."
trigger_phrases:
  - "empty states plan"
  - "empty state renderer"
  - "onboarding hero implementation"
  - "zero result recovery plan"
  - "grouped table header preservation"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/001-empty-and-first-run-states"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for empty and first-run states"
    next_safe_action: "Execute phase 001 tasks starting with EmptyStateRenderer module"
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
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Empty and First-Run States

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian Plugin API |
| **Framework** | Native Obsidian DOM helpers (`createDiv`, `createEl`, `setIcon`, `t`), Lucide iconography |
| **Storage** | None — strictly display-only; no frontmatter or note body writes (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Top 10 recommendation #10 and iteration 01 findings. It introduces a shared, modular `EmptyStateRenderer` (`src/views/EmptyStateRenderer.ts`) modeled after the reason-aware pattern in `src/views/ChartRenderer.ts:555-608`. The plan covers: (1) creating the modular renderer, (2) providing pipeline stage diagnostics in `RowPipeline.ts:23-111` to diagnose zero-result causes, (3) upgrading first-run onboarding (`DatabaseView.ts:6624-6634`) with starter preset templates, (4) upgrading zero-column states with a "+ Add Property" button, (5) consuming Phase 002's grouped table headers and colgroups on zero results (`TableRenderer.ts:98-104`), (6) adding contextual clear CTAs across Table, Board, Gallery, and List views, (7) standardizing Calendar, Timeline, and Embedded database empty states, and (8) styling responsive flex cards and dashed drop targets in `styles.css:6129-6158`.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Codebase call sites audited and verified with `file:line` citations (`DatabaseView.ts`, `TableRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `CalendarRenderer.ts`, `CalendarTimelineRenderer.ts`, `EmbeddedDatabaseRenderer.ts`, `ChartRenderer.ts`, `styles.css`).
- [x] Research synthesis recommendations (Top 10 #10, iteration 01) mapped directly to requirements and tasks.
- [x] Standing constraints verified: display-only, mobile-safe, iCloud-safe, MIT-forkable, no telemetry.
- [x] Scope bounded to presentation and view-state recovery; no core query engine rewrites or note-body mutations.

### Definition of Done
- [ ] `EmptyStateRenderer.ts` created and exported with full type safety and reason-aware card anatomy.
- [ ] `RowPipeline.ts` provides stage counts enabling reason diagnosis on zero rows.
- [ ] `renderEmptyDashboard` replaced with onboarding hero card offering starter presets.
- [ ] Zero-column state in `DatabaseView.ts` and `EmbeddedDatabaseRenderer.ts` renders an actionable "+ Add Property" CTA.
- [ ] Grouped table zero-result rendering preserves table headers and renders empty banner inside `tbody`.
- [ ] Contextual "Clear search", "Reset filters", and "Clear all" CTAs appear in zero-match queries across all views.
- [ ] Empty groups in Board, Gallery, and List render explicit drop targets and "No records in this group" styling.
- [ ] Calendar and Timeline render actionable date configuration empty states.
- [ ] `npx tsc --noEmit`, `npm run build`, and `npx vitest run` pass cleanly with zero regressions.
- [ ] Verification confirms 0 note-body or frontmatter modifications occur during empty state rendering.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The architecture follows the isolated-module presentation pattern already proven by `ChartRenderer.ts:555-608` and `EuroFormat.ts`:
1. **Isolated Component (`src/views/EmptyStateRenderer.ts`)**: Pure view helper accepting container, reason code, copy, icon, and optional action callbacks. It owns DOM creation for empty state cards, hero cards, diagnostic badges, and action buttons.
2. **Diagnostics Extraction (`src/data/RowPipeline.ts`)**: A lightweight, presentation-only diagnostics helper reads or annotates `sourceCount`, `postSearchCount`, `postFilterCount`, and `visibleCount` from pipeline output so renderers know *why* `rows.length === 0`; it does not change `build()`'s return type or write note data.
3. **View-Level Dispatch**: Renderers invoke `EmptyStateRenderer` when zero records exist, passing contextual callbacks (`onClearSearch`, `onResetFilters`, `onAddProperty`, `onSelectDateField`, `onRetry`).

```
                    ┌─────────────────────────┐
                    │     RowPipeline.ts      │
                    │   (Stage Diagnostics)   │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ DatabaseView.ts  │  │ TableRenderer.ts │  │ Gallery / List   │
│ (Hero / 0-Cols)  │  │ (Header Preserv) │  │  Board / Embeds  │
└──────────┬───────┘  └──────────┬───────┘  └──────────┬───────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  EmptyStateRenderer.ts  │
                    │  (Cards, Icons, CTAs)   │
                    └─────────────────────────┘
```

### Component API Sketch

```ts
export type EmptyStateReason =
  | "no-database"
  | "no-columns"
  | "no-matching-data"
  | "search-empty"
  | "filter-empty"
  | "filter-and-search-empty"
  | "limit-empty"
  | "no-date-field"
  | "no-events"
  | "no-events-in-range"
  | "read-failed"
  | "empty-group";

export interface EmptyStateAction {
  label: string;
  icon?: string;
  cls?: string;
  primary?: boolean;
  onClick: () => void | Promise<void>;
}

export interface EmptyStateOptions {
  reason: EmptyStateReason;
  title?: string;
  message?: string;
  icon?: string;
  diagnostics?: string;
  actions?: EmptyStateAction[];
  compact?: boolean;
  tableRowSpan?: number;
}

export class EmptyStateRenderer {
  renderCard(container: HTMLElement, options: EmptyStateOptions): HTMLElement;
  renderHero(container: HTMLElement, options: { title: string; desc: string; onCreateDb: () => void; onSelectPreset: (preset: StarterPreset) => void }): HTMLElement;
  renderTableRow(tbody: HTMLElement, colSpan: number, options: EmptyStateOptions): HTMLElement;
}
```

### Starter Preset Schema Templates
The onboarding hero in `renderEmptyDashboard()` presents 4 standard lightweight starter presets:
- **Tasks**: Default columns `Title` (file name), `Status` (To Do, In Progress, Done), `Priority` (P1, P2, P3), `Due Date` (date).
- **Projects**: Default columns `Project Name`, `Status`, `Lead`, `Target Date`, `Tags`.
- **Reading List**: Default columns `Book Title`, `Author`, `Status` (Want to Read, Reading, Finished), `Rating` (number), `Category`.
- **Notes / Vault Index**: Default columns `Note Title`, `Tags`, `Created Date`, `Modified Date`.

These presets generate standard in-memory `DatabaseConfig` objects and immediately launch the user into a populated, structured display. Clicking a preset does not write a view-definition file; note creation remains limited to the user-initiated `+ New` action.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup & Diagnostics
- [ ] T001 Read decision-ready findings and evidence trail from `research/synthesis.md` and iteration 01 artifacts.
- [ ] T002 Record fork test and lint baseline (`vitest.config.ts`, `npx vitest run`, `npx tsc --noEmit`).
- [ ] T011 Add a pure presentation diagnostics adapter alongside `src/data/RowPipeline.ts:23-111` that reads or annotates source, search, and filter count transitions without changing `build()` or writing note data.

### Phase 2: Core Component & Dashboard Onboarding
- [ ] T010 Create `src/views/EmptyStateRenderer.ts` with support for standard reasons, icons, copy, action buttons, and table-row embedding.
- [ ] T012 Replace bare `renderEmptyDashboard` in `src/views/DatabaseView.ts:6624-6634` with the onboarding hero card and starter presets.
- [ ] T013 Upgrade `empty.noColumnsDb` in `src/views/DatabaseView.ts:6366-6372` and `src/views/EmbeddedDatabaseRenderer.ts:945-949` to render interactive "+ Add Property" buttons opening `CreatePropertyModal`.

### Phase 3: Cross-View Integration & Header Preservation
- [ ] T014 Add contextual recovery CTAs ("Clear search", "Reset filters", "Clear all") in the zero-result renderer branches (`TableRenderer.ts:98-104`, `GalleryRenderer.ts:95,139`, and `ListRenderer.ts:88,130`).
- [ ] T015 Consume and verify the Phase 002 grouped-table output (`TableRenderer.ts:98-191`) by placing the empty state inside its `tbody`; do not rewrite the table architecture here.
- [ ] T016 Consume and verify Phase 006's owned Board column-header surface at `BoardRenderer.ts:311-351`; add dashed drop target slots and clear empty-group styling only on the Board drop/create surface (`BoardRenderer.ts:361-374, 432-471`), Gallery (`GalleryRenderer.ts:101-137`), and List (`ListRenderer.ts:94-128`).
- [ ] T017 Upgrade Calendar (`CalendarRenderer.ts:118-124, 2216-2218`) and Timeline (`CalendarTimelineRenderer.ts:230-248, 2148-2153`) with actionable empty state cards.
- [ ] T018 Integrate compact empty state cards in `EmbeddedDatabaseRenderer.ts:539, 945-957`.
- [ ] T019 Update `styles.css:6129-6158` with responsive flex layouts, starter preset grid styles, and dark/light contrast tokens.

### Phase 4: Verification & Documentation
- [ ] T050 Write table-driven unit tests in `src/views/EmptyStateRenderer.test.ts`.
- [ ] T051 Run type check and build verification (`npx tsc --noEmit`, `npm run build`, `npx vitest run`).
- [ ] T052 Perform cross-view visual parity verification.
- [ ] T053 Verify contextual recovery actions execute cleanly.
- [ ] T054 Confirm display-only execution produces zero frontmatter writes.
- [ ] T055 Verify mobile responsiveness down to 320px viewport width.
- [ ] T056 Synchronize `checklist.md` and `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `EmptyStateRenderer.ts` card rendering, action event binding, pipeline diagnostics calculation | Vitest (`npx vitest run`), `EmptyStateRenderer.test.ts` |
| Type Safety | Strict TypeScript type validation across all modified renderers | `npx tsc --noEmit` |
| Build Integrity | Plugin bundle compilation without errors or asset leaks | `npm run build` |
| Integration | Cross-view empty state rendering on sample databases across all 7 view types | Manual vault review |
| Display-Only / iCloud | Verify 0 note-body or frontmatter modifications occur during empty rendering | `git status` / `git diff` check on notes |
| Mobile Layout | Responsive card wrapping, touch target sizing (>= 44px), safe area insets | Obsidian mobile simulation / small viewport |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Research Synthesis (`research/synthesis.md`, iteration 01) | Internal | Green (complete) | Baseline design targets and citations locked |
| Obsidian API (`setIcon`, `createDiv`, `t`) | Internal | Green | Native DOM utilities available |
| `CreatePropertyModal` (`src/views/modals/CreatePropertyModal.ts`) | Internal | Green | Target for "+ Add Property" action |
| `AddDatabaseModal` (`src/views/modals/AddDatabaseModal.ts`) | Internal | Green | Target for "Create Database" hero action |
| Phase `002-table-grid-experience` | Sibling | Planned | Provides the grouped-table structure consumed by this phase |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation errors, layout breakage in existing populated views, or accidental file writes during empty rendering.
- **Procedure**: Revert the phase commit or remove `src/views/EmptyStateRenderer.ts` and restore the 10 touched files to their previous state. All edits are localized to rendering branches where `rows.length === 0` or schema columns are empty, so normal populated rendering is unaffected.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup & Diagnostics | None | Core Component & Dashboard Onboarding |
| Core Component & Onboarding | Setup & Diagnostics | Cross-View Integration & Header Preservation |
| Cross-View Integration | Core Component & Onboarding | Verification & Documentation |
| Verification & Documentation | Cross-View Integration | None |

Phase-level: `depends_on: none`; unblocks UI polish across all views in sibling phases `002` through `008`.

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup & Diagnostics | Low | 25 minutes |
| Core Component & Dashboard Onboarding | Medium | 50 minutes |
| Cross-View Integration & Header Preservation | Medium | 65 minutes |
| Verification & Documentation | Medium | 40 minutes |
| **Total** | | **~3 hours** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Working tree clean on branch `impl`.
- [ ] Baseline test/lint recorded with zero regressions.
- [ ] Display-only contract confirmed by code review (no vault writes in empty state paths).

### Rollback Procedure
1. Revert the phase commit on branch `impl`.
2. Delete `src/views/EmptyStateRenderer.ts` and `src/views/EmptyStateRenderer.test.ts`.
3. Run `npx tsc --noEmit` and `npx vitest run` to verify baseline integrity.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A — all changes are purely presentational and display-only.

<!-- /ANCHOR:enhanced-rollback -->
