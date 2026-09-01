---
title: "Implementation Plan: Micro-Interactions, Sensory Feedback & Selection Surfaces"
description: "Locked build plan for micro-interactions and feedback: contiguous selection perimeter, single corner fill handle, floating glassmorphic selection dock, multi-item batch drag, EdgeAutoScroller, formula runtime diagnostic badges, inline validation shake and tooltips, broken relation warning pills, hover tag dismissal, shimmering skeleton loader, interactive rating/progress tracks, dedicated drop indicators, transactional DragDropFeedbackState, persistence-aware editor lifecycle, and refresh snapshots."
trigger_phrases:
  - "micro-interactions plan"
  - "selection bounding perimeter plan"
  - "floating selection dock plan"
  - "batch drag count badge plan"
  - "edge auto scroller plan"
  - "formula error diagnostic badge plan"
  - "inline validation shake plan"
  - "broken relation pill plan"
  - "direct tag dismissal plan"
  - "interactive rating progress plan"
  - "drag drop feedback state plan"
  - "persistence aware inline editor plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/007-micro-interactions"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for micro-interactions and feedback phase"
    next_safe_action: "Implement phase 007 tasks from EdgeAutoScroller onward"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-007"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Micro-Interactions, Sensory Feedback & Selection Surfaces

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | TypeScript, Obsidian View Component Engine, HTML5 Drag-and-Drop / Pointer Events |
| **Framework** | Native Obsidian DOM APIs (`createDiv`, `createSpan`, `setIcon`, `t`), `requestAnimationFrame` |
| **Storage** | None — strictly display-only; zero note frontmatter or markdown body writes on render (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin bundle build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Quick Wins #8 (Formula Runtime `#ERROR!` Badges) & #9 (Direct Tag Dismissal on Hover), and Themed Backlog #6 (Micro-Interactions & Sensory Feedback). It transforms the Note Database plugin's tactile layer across 6 core areas:
1. **Contiguous Selection Perimeter & Floating Action Dock**: Computes rectangular selection boundary edges (`.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, `.is-right-edge`), mounts a single corner fill handle (`DatabaseView.ts:4361-4381, 7971-7984`), and redesigns the selection status bar as a floating glassmorphic capsule dock (`styles.css:5582`).
2. **Multi-Item Batch Drag & EdgeAutoScroller**: Consumes and verifies Phase 002's owned table `setupRowDrag()` contract (`TableRenderer.ts:632-713`), implements batch drag in Board and Gallery, and creates `src/views/EdgeAutoScroller.ts` for fluid auto-scrolling near container boundaries.
3. **Formula Error Diagnostics & Inline Validation Shake**: Captures runtime evaluation errors in `ComputedEvaluator.ts:68-72`, renders cell `#ERROR!` badges with diagnostic tooltips, and adds `@keyframes db-shake` validation shake animations with in-situ tooltips (`CellRenderer.ts:1338-1341, 2577-2580`).
4. **Tactile Field Manipulations**: Adds broken relation warning pills (`RelationValueRenderer.ts:18-35`), 1-click hover tag dismissal in `renderMultiSelect` (`CellRenderer.ts:348-355`), and live hover star fills / progress track manipulation (`CellRenderer.ts:300-309`).
5. **Loading & Drop Indicator Polish**: Implements shimmering skeleton loaders around the refresh teardown (`DatabaseView.ts:10631-10646`), dedicated 2px accent drop indicator lines in Board and Sort panels, and debounced search activity pulse indicators (`ToolbarRenderer.ts:1087-1123`).
6. **Lifecycle-Owned Interaction State**: Expands `DragDropFeedback.ts:1-47` to manage transactional phases (`over`, `pending`, `committed`, `failed`), creates persistence-aware inline editor draft lifecycles with Retry/Discard, and captures interaction snapshots across refresh (`DatabaseView.ts:10631-10646`).

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Codebase audited: selection controllers (`DatabaseView.ts`), drag handlers (`TableRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `SortPanelRenderer.ts`), cell editors (`CellRenderer.ts`), and formula evaluator (`ComputedEvaluator.ts`) located with precise `file:line` evidence.
- [x] Micro-interaction patterns benchmarked against AppFlowy contiguous selection, Anytype floating command docks, and Notion formula diagnostic badges.
- [x] Standing constraints verified: 100% display-only rendering, zero note-body writes on render, mobile-safe, MIT-forkable, rebase-clean isolated diff.

### Definition of Done
- [ ] Contiguous selection perimeter implemented with clean interior tint and exactly one bottom-right corner fill handle (`DatabaseView.ts:4361-4381, 7971-7984`, `styles.css:5004-5020`).
- [ ] Floating glassmorphic selection action dock implemented with backdrop blur, count badge, semantic actions, and `[✕ Esc]` clear pill (`styles.css:1697-1718`).
- [ ] Phase 002's owned table `setupRowDrag()` contract is consumed and verified at `TableRenderer.ts:632-713`; multi-item batch drag is implemented in Board and Gallery at `BoardRenderer.ts:508-585` and `GalleryRenderer.ts:337-370`.
- [ ] `src/views/EdgeAutoScroller.ts` created and unit-tested in `src/views/EdgeAutoScroller.test.ts`, integrated into table, board, and fill handle drag handlers.
- [ ] Formula runtime calculation errors surfaced as `#ERROR!` badges with diagnostic hover tooltips by consuming and verifying Phase 002's owned empty-cell surface (`ComputedEvaluator.ts:68-75`, `CellRenderer.ts:183-204`, `styles.css:4240-4247`) and adding the error branch and badge styling (`CellRenderer.ts:177-183`, `styles.css:5878-5888`).
- [ ] Inline input error shake animation (`@keyframes db-shake`), red focus ring, and in-situ tooltips implemented in `CellRenderer.ts:1338-1341, 2577-2580`.
- [ ] Broken relation links detected via metadata cache and rendered with `.is-unresolved` dashed warning outline (`RelationValueRenderer.ts:18-35`).
- [ ] Direct inline tag dismissal micro-button (`✕`) implemented on hover in `renderMultiSelect` (`CellRenderer.ts:348-355`).
- [ ] Shimmering skeleton loader and stale-while-refreshing state implemented for view transitions around the refresh teardown (`DatabaseView.ts:10631-10646`).
- [ ] Interactive rating stars and progress bar tracks implemented in `CellRenderer.ts:300-309`.
- [ ] Dedicated 2px accent drop indicator lines implemented in Board and Sort panels (`styles.css:5086-5100, 7307-7317`).
- [ ] Transactional `DragDropFeedbackState`, persistence-aware inline editor lifecycle, and refresh interaction snapshots implemented.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, and `npx vitest run`.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The micro-interaction layer follows the **Lifecycle-Owned Sensory Feedback Architecture** inspired by Anytype and AppFlowy:
- **Canonical Selection Model**: Selection geometry is calculated once on `DatabaseView` and projected to cells via perimeter boundary classes (`.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, `.is-right-edge`), eliminating individual cell box-shadow clutter and multi-handle ambiguity.
- **Floating Viewport Action Dock**: The selection action bar is extracted from the document flow into a fixed floating glassmorphic dock, preventing table layout shifts and scroll jumps.
- **Transactional Drag & Drop (`DragDropFeedbackState`)**: Drag gestures transition through explicit phases (`over` → `pending` → `committed` | `failed`), holding visual feedback until asynchronous vault operations settle.
- **Proximity Edge Auto-Scroller (`EdgeAutoScroller`)**: Centralizes container scroll animation loops on `requestAnimationFrame` with acceleration curves based on pointer proximity.
- **In-Situ Error & Diagnostic Feedback**: Errors are surfaced directly where the user is looking—cell-level `#ERROR!` badges for formulas, shake animations with speech bubbles for invalid input, and dashed warning pills for broken relations.

```
+----------------------------------------------------------------------------------------------------+
|  DATABASE VIEW INTERACTION LAYER (DatabaseView.ts)                                                 |
|  ├── Selection Controller: Bounding Perimeter Matrix + Single Corner Fill Handle                   |
|  ├── Floating Selection Dock: Fixed Viewport Capsule + Animated Count + Bulk Actions                |
|  ├── Edge Auto-Scroller: requestAnimationFrame Boundary Proximity Acceleration                      |
|  └── Interaction Snapshot Manager: Focus, Selection & Draft Restoration Across Refresh             |
+----------------------------------------------------------------------------------------------------+
                                               │
               ┌───────────────────────────────┼──────────────────────────────┐
               ▼                               ▼                              ▼
+-----------------------------+ +-----------------------------+ +-----------------------------+
| TACTILE CELL INTERACTIONS   | | DRAG & REORDER FEEDBACK       | | QUERY & LOADING FEEDBACK    |
| (CellRenderer.ts)           | | (DragDropFeedback.ts)       | | (RefreshCoordinator.ts)     |
| ├── Formula #ERROR! Badges  | | ├── Batch Multi-Item Drag   | | ├── Shimmering Skeleton     |
| ├── Validation Shake/Tooltip| | │   (Stacked Thumbnail+Pill)| | │   Loader (> 60ms)         |
| ├── Hover Tag Dismissal (✕) | | ├── 2px Drop Indicator Lines| | ├── Stale-While-Refreshing   |
| ├── Interactive Stars/Bars  | | ├── Transactional Feedback  | | │   (aria-busy="true")      |
| └── Persistence Draft State | | └── Operation-Result Rail   | | └── Search Activity Pulse   |
+-----------------------------+ +-----------------------------+ +-----------------------------+
```

### Key Components
- **`EdgeAutoScroller.ts`** (new): Standalone utility managing boundary proximity detection (within 40px) and smooth `requestAnimationFrame` acceleration loops for scrollable database containers.
- **`DragDropFeedback.ts`**: Upgraded transactional feedback state machine managing source/target identity, placement calculations, and `over/pending/committed/failed` lifecycles.
- **`DatabaseView.ts`**: Coordinates contiguous selection perimeter classes, single corner fill handle placement, floating action dock rendering, and refresh interaction snapshots.
- **`CellRenderer.ts`**: Coordinates formula `#ERROR!` badges, inline validation shake animations, hover tag dismissal micro-buttons, interactive rating/progress tracks, and persistence-aware draft lifecycles.
- **`RelationValueRenderer.ts`**: Coordinates metadata cache link resolution and broken relation warning pill states (`.is-unresolved`).
- **`ComputedEvaluator.ts`**: Captures runtime evaluation exceptions, providing structured error metadata to cell renderers.

### Data Flow
1. **Selection Flow**: User drags across cells → `DatabaseView` computes bounding rectangle → applies outer boundary classes to perimeter cells → mounts single fill handle on bottom-right cell → updates floating selection dock in place.
2. **Drag & Auto-Scroll Flow**: User drags item near container edge → `EdgeAutoScroller` computes proximity velocity → scrolls container smoothly → updates `DragDropFeedbackState` drop indicator line.
3. **Inline Edit Flow**: User inputs invalid value → editor triggers `@keyframes db-shake`, red focus ring, and speech bubble tooltip → draft retained in memory until corrected.
4. **Formula Diagnostic Flow**: `ComputedEvaluator` catches calculation error → tags cell with `#ERROR!` badge → hover event displays diagnostic tooltip with failing expression.
5. **View Transition Flow**: User switches view / runs query → if duration > 60ms, mounts shimmering skeleton loader → on query completion, mounts records with smooth cross-fade.

### Mobile/iCloud Safety Notes
- All rendering is strictly display-only: zero markdown frontmatter or body writes occur during hover, selection, drag preview, or error diagnostic rendering.
- On mobile devices, the floating dock collapses into a compact touch capsule, touch long-press triggers batch selection, and drag handles provide 44×44px hit envelopes.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup & Core Utilities
- [ ] Audit call sites in `DatabaseView.ts`, `CellRenderer.ts`, `TableRenderer.ts`, `BoardRenderer.ts`, `SortPanelRenderer.ts`, `ComputedEvaluator.ts`, and `DragDropFeedback.ts`.
- [ ] Create `src/views/EdgeAutoScroller.ts` and unit test suite `src/views/EdgeAutoScroller.test.ts`.
- [ ] Expand `src/views/DragDropFeedback.ts` into transactional state machine with unit test suite `src/views/DragDropFeedback.test.ts`.
- [ ] Record baseline build, lint, and test state (`npx tsc --noEmit`, `npm run build`, `npx vitest run`).

### Phase 2: Selection Perimeter & Floating Glassmorphic Action Dock
- [ ] Implement contiguous selection bounding perimeter algorithm in `DatabaseView.ts:4361-4381` and `styles.css:5004-5020`.
- [ ] Mount exactly one fill handle at the bottom-right corner of the selection matrix (`DatabaseView.ts:7971-7984`, `styles.css:4977-4993`).
- [ ] Redesign `.db-selection-status-bar` in `DatabaseView.ts:7010-7125` and `styles.css:2007` into fixed bottom floating glassmorphic dock updating in place.
- [ ] Eliminate timer-based selection clearing (`CellRenderer.ts:823-828`), deriving selection strictly from `DatabaseView.cellSelection`.

### Phase 3: Batch Drag-and-Drop & Container Auto-Scrolling
- [ ] Consume and verify Phase 002's owned table `setupRowDrag()` contract at `TableRenderer.ts:632-713`; implement multi-item batch drag in Board and Gallery at `BoardRenderer.ts:508-585` and `GalleryRenderer.ts:337-370`.
- [ ] Render compact stacked card thumbnail preview with count badge pill (`"Moving N items"`) in `styles.css:5037-5055`.
- [ ] Integrate `EdgeAutoScroller` into `TableRenderer.ts:684-712`, `BoardRenderer.ts:441-480`, and `DatabaseView.ts:8184-8224`.
- [ ] Implement dedicated 2px accent drop indicator lines in Board and Sort panels (`styles.css:5086-5100, 7307-7317`).
- [ ] Wire transactional drag/drop lifecycle and operation-result rail with Undo/Retry on the selection chrome at `DatabaseView.ts:1198-1201, 7010-7110`; attach completion handling to async paste flows at `DatabaseView.ts:8578-8642, 8669-8760, 8831-8989` and async group moves at `DatabaseView.ts:10077-10100, 10130-10192`.

### Phase 4: Diagnostic Feedback, Inline Validation & Tactile Manipulations
- [ ] Enhance `ComputedEvaluator.ts:68-75` to retain evaluation error details, consume and verify Phase 002's owned empty-cell surface at `CellRenderer.ts:183-204` and `styles.css:4240-4247`, and render `#ERROR!` badges from the dedicated error branch (`CellRenderer.ts:177-183`, `styles.css:5878-5888`).
- [ ] Implement `@keyframes db-shake` animation, red focus ring, and in-situ validation tooltips in `CellRenderer.ts:1338-1341, 1412-1415, 2577-2580`.
- [ ] Detect broken relation wikilinks in `RelationValueRenderer.ts:18-35` and render `.is-unresolved` warning pills.
- [ ] Add direct inline tag dismissal micro-buttons (`✕`) on hover in `renderMultiSelect` at `CellRenderer.ts:348-355`.
- [ ] Enable live star hover fill previews and progress track manipulation in `CellRenderer.ts:300-309`.
- [ ] Implement persistence-aware inline editor draft lifecycles with saving indicators in `CellRenderer.ts:1950-2156`.

### Phase 5: Query Loading Transitions & Interaction Snapshots
- [ ] Render shimmering skeleton placeholders (`.db-skeleton-loader`) around the refresh teardown in `DatabaseView.ts:10631-10646` and `styles.css:2119`.
- [ ] Implement stale-while-refreshing state holding previous rows with `aria-busy="true"` in `DatabaseView.ts:10631-10646` and `RefreshCoordinator.ts:47-84`.
- [ ] Implement debounced search activity pulse indicator in `ToolbarRenderer.ts:1087-1123`.
- [ ] Implement `InteractionSnapshot` capturing focus, selection, and drafts before row patch or full refresh (`TableRenderer.ts:194-239`, `DatabaseView.ts:10631-10646`).

### Phase 6: Verification & Quality Gate
- [ ] Run full test suite (`npx vitest run`), TypeScript compilation (`npx tsc --noEmit`), and plugin build (`npm run build`).
- [ ] Verify selection perimeter, floating dock, batch drag, auto-scrolling, formula diagnostics, inline validation shake, broken relation pills, and skeleton loaders across desktop and mobile.
- [ ] Complete `checklist.md` and `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Unit | `EdgeAutoScroller` proximity calculations and velocity curves; `DragDropFeedback` transaction state transitions; `ComputedEvaluator` error diagnostics | Vitest (`npx vitest run`), `EdgeAutoScroller.test.ts`, `DragDropFeedback.test.ts` |
| Selection Matrix | Contiguous selection bounding perimeter calculation and single corner fill handle placement | Vitest DOM fixtures / Manual Table Verification |
| Drag-and-Drop | Multi-item batch drag payloads, count badge rendering, edge auto-scrolling, and drop indicator lines | Chrome DevTools / Layout Inspector |
| Validation & Errors | Formula `#ERROR!` badges, inline input shake animation, in-situ validation tooltips, and broken relation warning pills | Obsidian Test Vault / Manual Cell Editing |
| Loading & Refresh | Shimmering skeleton placeholders, stale-while-refreshing `aria-busy` state, and interaction snapshot restoration | Network/Query Throttling / DevTools |
| Display-only / iCloud | Zero note frontmatter or body writes during hover, selection, drag preview, or error diagnostic rendering | Note content diff check |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| Research synthesis (`research/synthesis.md`, iteration 09) | Internal | Green (complete) | Target citations and backlog mapping locked |
| `src/views/DragDropFeedback.ts` | Internal | Green (available) | Required for transactional drag/drop lifecycle expansion |
| `src/data/ComputedEvaluator.ts` | Internal | Green (available) | Required for formula runtime error diagnostic capture |
| Phase `005-design-tokens-typography` | Predecessor | Planned | Provides WCAG AA color tokens and glassmorphism backdrop variables |
| Phase `006-views-parity-polish` | Predecessor | Planned | Provides unified CardFieldRenderer consumed by interactive field elements |
| Phase `008-mobile-and-accessibility` | Successor | Planned | Consumes floating action dock and touch drag envelopes for advanced a11y |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation errors, broken drag-and-drop ordering, selection matrix desynchronization, editor text loss during inline editing, or mobile scroll locks.
- **Procedure**: Revert commits touching `EdgeAutoScroller.ts`, `DragDropFeedback.ts`, `DatabaseView.ts`, `CellRenderer.ts`, `TableRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `SortPanelRenderer.ts`, `RelationValueRenderer.ts`, `ComputedEvaluator.ts`, `ToolbarRenderer.ts`, `RefreshCoordinator.ts`, and `styles.css`. All changes are isolated to presentation controllers and interaction helpers.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|---|---|---|
| Setup & Core Utilities | None | Selection Perimeter & Floating Dock |
| Selection Perimeter & Floating Dock | Setup & Core Utilities | Batch Drag & Auto-Scrolling |
| Batch Drag & Auto-Scrolling | Selection Perimeter & Floating Dock | Diagnostics, Validation & Tactile Manipulations |
| Diagnostics, Validation & Tactile Manipulations | Batch Drag & Auto-Scrolling | Loading Transitions & Snapshots |
| Loading Transitions & Snapshots | Diagnostics, Validation & Tactile Manipulations | Verification & Quality Gate |
| Verification & Quality Gate | Loading Transitions & Snapshots | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Sub-Phase | Complexity | Estimated Effort |
|---|---|---|
| Setup & Core Utilities | Low | 20 minutes |
| Selection Perimeter & Floating Dock | Medium | 60 minutes |
| Batch Drag & Auto-Scrolling | Medium | 60 minutes |
| Diagnostics, Validation & Tactile Manipulations | Medium | 60 minutes |
| Loading Transitions & Snapshots | Medium | 50 minutes |
| Verification & Quality Gate | Low | 30 minutes |
| **Total** | | **~4.5 hours** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Working tree clean and git status verified.
- [ ] Baseline test and compilation runs recorded.
- [ ] Display-only behavior confirmed: no note-body write paths introduced.

### Rollback Procedure
1. Revert the phase commits on branch `impl`.
2. Run `npx tsc --noEmit` and `npx vitest run` to verify clean baseline restoration.
3. Verify plugin renders default Table, Board, Gallery, List, Calendar, and Timeline views without console errors.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A — strictly display-only view renderers and in-memory interaction state; zero persistent note or configuration schema changes.

<!-- /ANCHOR:enhanced-rollback -->
