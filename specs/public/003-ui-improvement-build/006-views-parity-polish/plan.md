---
title: "Implementation Plan: Views Parity, Polish and Per-View Affordances"
description: "Locked build plan for non-table view parity and polish: universal object peek across Board, Gallery, and List, true horizontal Kanban swimlanes for 2D grouping, multi-source gallery cover engine with markdown embed fallback, sleek List row geometry with right-aligned columnar metadata, Calendar workday auto-scroll with live time ruler, collapsible unscheduled notes backlog tray, accessible calendar overflow dialog, month multi-day drag creation, timeline canvas gesture zoom, board column management menus, and consolidated CardFieldRenderer."
trigger_phrases:
  - "views parity plan"
  - "board swimlanes plan"
  - "gallery cover preview plan"
  - "calendar workday autoscroll plan"
  - "list view metadata alignment plan"
  - "card field renderer plan"
  - "unscheduled notes tray plan"
  - "universal object peek plan"
  - "timeline canvas zoom plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/006-views-parity-polish"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for views parity and polish phase"
    next_safe_action: "Implement phase 006 tasks starting with CardFieldRenderer and swimlanes"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-006"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Views Parity, Polish and Per-View Affordances

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | TypeScript, Obsidian View Component Engine, HTML5 Drag-and-Drop / Pointer Events |
| **Framework** | Native Obsidian DOM APIs (`createDiv`, `createSpan`, `setIcon`, `t`), Moment.js / Calendar Helpers |
| **Storage** | None — strictly display-only; zero note frontmatter or markdown body writes on render (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin bundle build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Top 10 recommendation #4 (Universal Object Detail / Peek Parity Across All Views), Quick Win #11 (Hide Redundant Grouping Field on Board Cards), Quick Win #12 (Hide Empty Properties Accordion in Record Detail), and Themed Backlog #5 (Other Views: Board, Gallery, Calendar, List, Timeline). It unifies the non-table view experiences of the Note Database plugin:
1. **Universal Object Peek Parity**: Wires `RecordDetailPanel` to card clicks in Board, Gallery, and List views via `DatabaseView.ts:614-674`.
2. **Consolidated CardFieldRenderer**: Deduplicates 500+ lines of value rendering into a shared, tested `CardFieldRenderer.ts` module.
3. **True Horizontal Kanban Swimlanes**: Refactors secondary grouping in `BoardRenderer.ts:353-359, 377-430` into full-width horizontal swimlane rows with synchronized column baselines.
4. **Multi-Source Gallery Cover Engine**: Expands `resolveCoverImage` in `src/data/CoverImage.ts:52-61` to automatically fall back to note body markdown image embeds (`![[image.png]]`).
5. **Sleek List View Row Geometry**: Redesigns `.db-list-row` in `ListRenderer.ts:191-250` into borderless rows with right-aligned columnar metadata.
6. **Calendar Time Grid Polish**: Adds the missing Week/Day auto-scroll at the grid render points (`CalendarRenderer.ts:418-475`) and polishes the existing live red current-time ruler (`CalendarRenderer.ts:717, 1209-1227`); there is currently no `scrollTop` or `scrollTo` in the file.
7. **Unscheduled Notes Backlog Drawer**: Adds a collapsible backlog tray for undated records in Calendar (`:118-124`) and Timeline (`:230-248`).
8. **Per-View Affordances**: Delivers gallery aspect ratio presets, accessible calendar `+N` overflow dialogs, month multi-day drag creation, timeline wheel zoom, board column management menus, and cross-view keyboard navigation.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Codebase audited: all non-table view renderers (`BoardRenderer`, `GalleryRenderer`, `ListRenderer`, `CalendarRenderer`, `CalendarTimelineRenderer`), `RecordDetailPanel`, and `CoverImage` located with precise `file:line` evidence.
- [x] Interaction patterns benchmarked and locked against Anytype object inspectors, AppFlowy horizontal swimlanes, and Notion gallery/list/calendar affordances.
- [x] Standing constraints verified: 100% display-only rendering, zero note-body writes, mobile-safe, MIT-forkable, rebase-clean isolated diff.

### Definition of Done
- [ ] Universal object peek parity implemented across Board, Gallery, and List views (`DatabaseView.ts:614-674`).
- [ ] `CardFieldRenderer.ts` created and unit-tested; duplicate field rendering logic removed from `BoardRenderer`, `GalleryRenderer`, `ListRenderer`, and `RecordDetailPanel`.
- [ ] True horizontal Kanban swimlanes implemented with synchronized vertical column baselines and cross-lane drag reordering (`BoardRenderer.ts:353-359, 377-430`, `styles.css:7211-7235`).
- [ ] Multi-source gallery cover engine implemented in `src/data/CoverImage.ts:52-61` with unit tests in `src/data/CoverImage.test.ts`.
- [ ] List view redesigned with borderless rows, subtle dividers, and right-aligned columnar metadata (`ListRenderer.ts:191-250`, `styles.css:8161-8270`).
- [ ] Calendar Week/Day time grids auto-scroll to workday start hour and polish the existing live red current-time ruler (`CalendarRenderer.ts:418-475, 717, 1209-1227`, `styles.css:12700-13100`).
- [ ] Collapsible unscheduled notes backlog drawer added at the Calendar and Timeline render entry points (`CalendarRenderer.ts:80-98`, `CalendarTimelineRenderer.ts:217-230`) using the undated-row filtering path (`CalendarTimelineModel.ts:764-822`) and a new calendar-drawer rule block in `styles.css` (no existing line range).
- [ ] Phase 006 owns the Board column-header surface at `BoardRenderer.ts:311-351` for slim vertical Kanban column collapsing and board column options menus; Phase 001 consumes and verifies this surface only.
- [ ] Gallery card size presets (Small, Medium, Large) and aspect ratio buttons (1:1, 16:9, 3:4, 4:3) wired in ViewConfig (`GalleryRenderer.ts:93, 104`).
- [ ] Scheduled calendar `+N` overflow converted to accessible focusable button opening day event dialog (`CalendarRenderer.ts:255-300`).
- [ ] Month view multi-day pointer drag creation gesture and Timeline canvas wheel zoom implemented.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, and `npx vitest run`.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The non-table view layer follows the **Projection & Presentation Engine Pattern** inspired by Anytype and AppFlowy:
- **Shared Object Model**: Records (`RowData`) represent underlying notes; views (Board, Gallery, Calendar, Timeline, List) are pure visual projections.
- **Unified Value Presentation (`CardFieldRenderer`)**: Isolates property formatting (select tags, status colors, relation pills, dates, numbers, checkboxes) into a single reusable presentation engine.
- **Universal Inspection Pipeline**: Decouples record activation from raw file navigation, routing card clicks through `openRecordDetailPanel` with configurable peek modes (Side Peek, Center Modal, Sheet).
- **2D Matrix Swimlane Layout**: Transforms secondary grouping into a CSS Grid / Flexbox matrix where swimlanes span across columns while maintaining column width alignment.

```
+----------------------------------------------------------------------------------------------------+
|  DATABASE VIEW CONTAINER (DatabaseView.ts)                                                         |
|  ├── View State & Config: ViewConfig (grouping, filters, sorting, cover field, scale)              |
|  └── Universal Inspection Controller: openRecordDetailPanel() (Side Peek / Modal / Sheet)          |
+----------------------------------------------------------------------------------------------------+
                                               │
               ┌───────────────────────────────┼──────────────────────────────┐
               ▼                               ▼                              ▼
+-----------------------------+ +-----------------------------+ +-----------------------------+
| BOARD RENDERER              | | GALLERY RENDERER            | | CALENDAR & TIMELINE         |
| ├── 2D Horizontal Swimlanes | | ├── Multi-Source Cover Engine| | ├── Workday Auto-Scroll     |
| ├── Slim Column Collapsing  | | │   (Frontmatter + Embeds)  | | ├── Live Current-Time Ruler |
| ├── Data Mutation Feedback  | | ├── Aspect Ratio Presets    | | ├── Unscheduled Backlog Tray|
| └── Card Hit Region         | | └── Group Header + New      | | └── Accessible Overflow +N  |
+-----------------------------+ +-----------------------------+ +-----------------------------+
               │                               │                              │
               └───────────────────────────────┼──────────────────────────────┘
                                               ▼
+----------------------------------------------------------------------------------------------------+
|  SHARED CARD FIELD RENDERER (CardFieldRenderer.ts)                                                 |
|  ├── Status & Select Pills (WCAG AA Tokens)       ├── Relation Badges + Target Icons               |
|  ├── Tabular Numbers & Currency                   ├── Rating Stars, Progress Tracks, Checkboxes    |
+----------------------------------------------------------------------------------------------------+
```

### Key Components
- **`CardFieldRenderer.ts`** (new): Shared component for rendering typed property values across cards, tiles, list rows, and detail panels. Deduplicates badge wrapping, status colors, and tabular numbers.
- **`CoverImage.ts`**: Upgraded cover engine supporting frontmatter paths, external URLs, wikilinks, and fallback scanning of note body markdown embeds (`app.metadataCache.getFileCache()?.embeds`).
- **`BoardRenderer.ts`**: Implements 2D horizontal Kanban swimlanes, 38px vertical column collapsing, data mutation disclosure during cross-lane dragging, column options menu, and universal card click activation.
- **`GalleryRenderer.ts`**: Implements multi-source cover preview rendering, discrete card size presets, aspect ratio buttons, and group-header quick creation.
- **`ListRenderer.ts`**: Implements sleek divider-separated row geometry, right-aligned columnar metadata, and read-first title activation.
- **`CalendarRenderer.ts` & `CalendarTimelineRenderer.ts`**: Implement missing workday auto-scrolling, polish the existing dynamic live current-time ruler, add the collapsible unscheduled notes backlog drawer, accessible `+N` overflow button, and timeline canvas gesture zoom.
- **`RecordDetailPanel.ts`**: Serves as the universal in-context inspector across all 7 database views, consuming `CardFieldRenderer`.

### Data Flow
1. **View Mounting**: Renderers receive `ViewConfig` and `RowData[]`.
2. **Field Rendering**: Renderers pass field definitions and cell values to `CardFieldRenderer.renderCardField()`, ensuring uniform styling across views.
3. **Cover Resolution**: Gallery/Board cards invoke `resolveCoverImage()`, checking frontmatter first and falling back to cached markdown body embeds without disk I/O.
4. **Card Activation**: Tapping a card or row invokes `actions.openRecordDetail()`, opening the in-context `RecordDetailPanel` without changing workspace leaves.
5. **Drag & Reorder**: Dragging between Kanban swimlanes or dropping unscheduled backlog notes updates the respective grouping or date property via `dataSource.updateCell()`.

### Mobile/iCloud Safety Notes
- All rendering is strictly display-only: zero markdown frontmatter or body writes occur during view rendering, swimlane grouping, or peek inspection.
- On mobile devices (`.is-phone`), Kanban swimlanes fall back to a responsive single-column swipe view, and touch hit targets provide minimum 44×44px hit envelopes.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup & Baseline
- [ ] Audit call sites in `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `CalendarRenderer.ts`, `CalendarTimelineRenderer.ts`, `RecordDetailPanel.ts`, and `CoverImage.ts`.
- [ ] Record baseline build, lint, and test state (`npx tsc --noEmit`, `npm run build`, `npx vitest run`).

### Phase 2: CardFieldRenderer & Universal Object Peek Parity
- [ ] Create `src/views/CardFieldRenderer.ts` consolidating field value rendering (select tags, status colors, relation badges with target icons, tabular numbers, rating stars, progress tracks, and checkboxes).
- [ ] Write unit tests in `src/views/CardFieldRenderer.test.ts`.
- [ ] Wire `openRecordDetail` to card/row clicks in Board (`BoardRenderer.ts:598-607`), Gallery (`GalleryRenderer.ts:197-205, 453-470`), and List (`ListRenderer.ts:176-185`) views via `DatabaseView.ts:614-674`.
- [ ] Replace duplicate field rendering in `BoardRenderer.ts:983-1120`, `GalleryRenderer.ts:510-630`, `ListRenderer.ts:290-410`, and `RecordDetailPanel.ts:272-350` with `CardFieldRenderer`.
- [ ] Add the collapsed `N empty properties` accordion at `RecordDetailPanel.ts:187-215`, preserving the `showEmptyFields !== true` skip at `:192-193`, and style it in `styles.css:7604-7635`.

### Phase 3: Board Kanban Polish & 2D Horizontal Swimlanes
- [ ] Refactor secondary grouping in `BoardRenderer.ts:353-359, 377-430` and `styles.css:7211-7235` into full-width horizontal swimlane rows spanning across primary columns.
- [ ] Omit the active grouping field from card bodies in `BoardRenderer.ts:611-656` and `styles.css:7405-7484`.
- [ ] Add visual data mutation disclosure ("Changes [Field] to [Value]") during cross-lane dragging and in the mobile move menu (`BoardRenderer.ts:524-575, 735-802, 866-894`).
- [ ] Phase 006 owns the Board column-header surface at `BoardRenderer.ts:311-351`; implement slim 38px vertical Kanban column collapsing (`styles.css:7066-7080`) and the column options menu there. Phase 001 consumes and verifies this surface only.

### Phase 4: Gallery & List View Polish
- [ ] Expand `resolveCoverImage` in `src/data/CoverImage.ts:52-61` to fall back to note body markdown embeds (`app.metadataCache.getFileCache()?.embeds`) and write unit tests in `src/data/CoverImage.test.ts`.
- [ ] Add Gallery card size presets (Small 180px, Medium 260px, Large 360px) and aspect ratio presets (1:1, 16:9, 3:4, 4:3) in `GalleryRenderer.ts:93, 104`, `ViewConfigPanelRenderer.ts:1707-1717`, and `styles.css:7744-7751`.
- [ ] Redesign List view rows into borderless rows with subtle dividers and right-aligned columnar metadata (`ListRenderer.ts:191-250`, `styles.css:8161-8270`).
- [ ] Add compact group-header `+ New` button to Gallery and List group headers (`GalleryRenderer.ts:108-135`, `ListRenderer.ts:94-126`).

### Phase 5: Calendar & Timeline Temporal Affordances
- [ ] Implement missing workday auto-scroll on mount in Week/Day time grids (`CalendarRenderer.ts:418-475`) and polish the existing dynamic live current-time ruler (`CalendarRenderer.ts:717, 1209-1227`, `styles.css:12700-13100`).
- [ ] Implement collapsible "Unscheduled Notes" backlog drawer at Calendar (`CalendarRenderer.ts:80-98`) and Timeline (`CalendarTimelineRenderer.ts:217-230`) render entry points, collecting undated rows from `CalendarTimelineModel.ts:764-822` and styling the tray in a new calendar-drawer rule block in `styles.css` (no existing line range).
- [ ] Upgrade scheduled calendar `+N` overflow to keyboard-focusable button opening accessible day event dialog (`CalendarRenderer.ts:255-300, 600-632`).
- [ ] Add Calendar configuration setup preview card in `CalendarToolbarRenderer.ts:127-176`.
- [ ] Implement Month view multi-day pointer drag creation (`CalendarRenderer.ts:154-197`) and Timeline canvas wheel/pinch zoom (`CalendarTimelineRenderer.ts:217-370`).
- [ ] Implement cross-view keyboard roving focus and shortcuts across Board, Gallery, List, and Calendar (`BoardRenderer.ts:483-585`, `GalleryRenderer.ts:97-98`, `ListRenderer.ts:90-91`, `CalendarRenderer.ts:154-197`).

### Phase 6: Verification & Quality Gate
- [ ] Run full test suite (`npx vitest run`), TypeScript compilation (`npx tsc --noEmit`), and plugin build (`npm run build`).
- [ ] Verify universal peek parity, swimlane layouts, cover fallbacks, list metadata alignment, calendar auto-scrolling, and unscheduled backlog drawer across desktop and mobile.
- [ ] Complete `checklist.md` and `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Unit | `CardFieldRenderer` value formatting, badge wrapping, and tabular numbers; `CoverImage` markdown embed fallback resolution | Vitest (`npx vitest run`), `CardFieldRenderer.test.ts`, `CoverImage.test.ts` |
| View Parity | Universal object peek invocation from Board cards, Gallery tiles, and List rows | Vitest DOM fixtures / Manual View Verification |
| Kanban Layout | 2D horizontal swimlanes, column rail collapse, and cross-lane drag mutation feedback | Chrome DevTools / Layout Inspector |
| Gallery & List | Aspect ratio preset switching, markdown cover embeds, list row divider geometry, and right-aligned metadata columns | Chrome DevTools / Responsive Inspector |
| Calendar & Timeline | Workday auto-scroll, live red time ruler, unscheduled backlog drag placement, `+N` overflow dialog, and timeline wheel zoom | Obsidian Calendar View / Vitest fixtures |
| Display-only / iCloud | Zero note frontmatter or body writes during view switching, cover parsing, or peek inspection | Note content diff check |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| Research synthesis (`research/synthesis.md`, iteration 08) | Internal | Green (complete) | Target citations and backlog mapping locked |
| `src/views/RecordDetailPanel.ts` | Internal | Green (available) | Required for universal peek parity across non-table views |
| `src/data/CoverImage.ts` | Internal | Green (available) | Required for gallery cover fallback expansion |
| Phase `005-design-tokens-typography` | Predecessor | Planned | Provides WCAG AA status color tokens and spatial scale consumed by CardFieldRenderer |
| Phase `007-micro-interactions` | Successor | Planned | Consumes card and row drag handles for advanced transaction feedback |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation errors, broken drag-and-drop mechanics in Kanban swimlanes, regression in calendar event placement, or layout breakage on mobile devices.
- **Procedure**: Revert commits touching `CardFieldRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `CalendarRenderer.ts`, `CalendarTimelineRenderer.ts`, `RecordDetailPanel.ts`, `CoverImage.ts`, and `styles.css`. All changes are strictly isolated to presentation renderers and pure view helpers.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|---|---|---|
| Setup & Baseline | None | CardFieldRenderer & Universal Peek |
| CardFieldRenderer & Universal Peek | Setup & Baseline | Board Kanban Polish & Swimlanes |
| Board Kanban Polish & Swimlanes | CardFieldRenderer & Universal Peek | Gallery & List View Polish |
| Gallery & List View Polish | Board Kanban Polish & Swimlanes | Calendar & Timeline Affordances |
| Calendar & Timeline Affordances | Gallery & List View Polish | Verification & Quality Gate |
| Verification & Quality Gate | Calendar & Timeline Affordances | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Sub-Phase | Complexity | Estimated Effort |
|---|---|---|
| Setup & Baseline | Low | 15 minutes |
| CardFieldRenderer & Universal Peek | Medium | 60 minutes |
| Board Kanban Polish & 2D Swimlanes | Medium | 60 minutes |
| Gallery & List View Polish | Medium | 50 minutes |
| Calendar & Timeline Affordances | Medium | 60 minutes |
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
3. Verify plugin renders default Board, Gallery, Calendar, Timeline, and List views without console errors.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A — strictly display-only view renderers and in-memory presentation helpers; zero persistent note or configuration schema changes.

<!-- /ANCHOR:enhanced-rollback -->
