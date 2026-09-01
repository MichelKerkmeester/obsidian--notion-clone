---
title: "Implementation Plan: Toolbar and View Controls"
description: "Locked build plan for toolbar and view control modernization: 4-cluster command deck, WAI-ARIA tablist with stable view IDs, multi-template split New button, searchable All Views overflow hub, unswallowed primary New tap, non-interactive database selector rows, rich Add View preset sheet, jitter-free search clear, unified View Settings, and distinct badge vocabularies."
trigger_phrases:
  - "toolbar plan"
  - "4 cluster command deck plan"
  - "view switcher tablist plan"
  - "split new button plan"
  - "all views hub plan"
  - "unswallowed new button plan"
  - "add view preset sheet plan"
  - "search clear plan"
  - "unified view settings plan"
  - "badge vocabulary plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/004-toolbar-and-view-controls"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for toolbar and view controls phase"
    next_safe_action: "Execute phase 004 tasks starting with toolbar clustering"
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
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | TypeScript, Obsidian Plugin API |
| **Framework** | Native Obsidian DOM helpers (`createDiv`, `createEl`, `setIcon`, `setTooltip`, `t`), Lucide iconography |
| **Storage** | None — strictly display-only; zero frontmatter or note body writes (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Top 10 recommendations #6 (Semantic 4-Cluster Toolbar & WAI-ARIA View Switcher), #9 (Touch Targets & Accessibility Contract), Quick Wins #7, #15, #17, #18, and iteration 04 toolbar findings. It establishes a modernized, high-efficiency command deck across the plugin: (1) reorganizing the right toolbar into 4 functional clusters (Query, Properties, Overflow Utilities, Primary Creation), (2) transforming view tabs into a true WAI-ARIA tablist with roving keyboard focus and stable view ID resolution, (3) converting `.db-new-button` to a multi-template split button, (4) unswallowing intentional primary New taps, (5) transforming tab overflow into a searchable All Views hub with inline actions, (6) fixing invalid nested buttons in database selector rows, (7) delivering a rich Add View preset sheet with layout cards, (8) providing jitter-free search with inline clear (`✕`), (9) unifying layout-specific options under View Settings, (10) separating query rule badge counts from neutral Properties visibility badges, (11) adding a full-view expand button in frontmatter embeds, and (12) ensuring 44px mobile touch envelopes.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Fork codebase examined and target call sites identified with precise `file:line` evidence.
- [x] 4-cluster toolbar layout, WAI-ARIA tablist, and split New button interaction patterns locked against Anytype, AppFlowy, and Notion benchmarks.
- [x] Constraints confirmed: display-only rendering, zero note-body writes, mobile-safe touch targets, MIT-forkable.

### Definition of Done
- [x] Right toolbar reorganized into 4 semantic clusters without button wrapping or clutter in split-pane views (`src/views/ToolbarRenderer.ts:252-286`, `styles.css:945-964`).
- [x] View tabs upgraded to a WAI-ARIA tablist with roving keyboard navigation and stable view ID resolution (`src/views/ToolbarRenderer.ts:625-683`, `src/data/ViewSelection.ts:16-43`).
- [x] Primary `+ New` button converted to a split button with multi-template selection and placement options (`src/views/ToolbarRenderer.ts:1716-1739`, `src/data/TemplateToolbarAction.ts:6-32`).
- [x] Tapping the primary New button while an overlay is open executes note creation in a single tap (`src/views/DatabaseView.ts:562-565,839-872`).
- [x] Tab overflow menu transformed into a searchable All Views hub with inline Rename, Duplicate, Change Layout, and Delete actions (`src/views/ToolbarRenderer.ts:721-794`).
- [x] Database selector rows refactored to remove nested `<button>` elements (`src/views/ToolbarRenderer.ts:425-477`).
- [x] Add View menu upgraded to a rich preset sheet with layout preview cards and 15-view capacity feedback (`src/views/ToolbarRenderer.ts:654-663,921-962`).
- [x] Search input supports jitter-free expansion, inline clear (`✕`), and `Escape` blur (`src/views/ToolbarRenderer.ts:1087-1123`).
- [x] Layout-specific options consolidated under unified View Settings with clear scope indicators (`src/views/ToolbarRenderer.ts:1603-1614`, `src/views/ViewConfigPanelRenderer.ts:248-267`).
- [x] Filter/Sort badges display accent rule counts, while Properties displays a neutral "N hidden" badge (`src/views/ToolbarRenderer.ts:1575-1649,1801-1804`).
- [x] Frontmatter embeds expose an expand/full-view header button (`src/views/ToolbarRenderer.ts:156-209,227-249`, `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`).
- [x] TypeScript compilation (`npx tsc --noEmit`), build (`npm run build`), and test suite (`npx vitest run`) pass cleanly with zero regressions.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The toolbar architecture follows the **Semantic Command Deck** pattern inspired by Anytype and AppFlowy:
- **Zone 1: View Navigation (Left Toolbar)**: Contains the database heading/switcher trigger, WAI-ARIA View Switcher Tablist, and the `+` Add View trigger.
- **Zone 2: Query Cluster (Right Toolbar)**: Groups data manipulation actions (`Filter`, `Sort`, `Group`) with accent active-rule badges.
- **Zone 3: Properties Cluster (Right Toolbar)**: Exposes column visibility (`Properties`) with neutral hidden-count badges.
- **Zone 4: Utilities Overflow Deck & Primary Action (Right Toolbar)**: Collapses secondary actions (`Sync Computed`, `Refresh DB`, `Export`, `Open File`, `Display Width`, `View Settings`) into a `...` More menu, accompanied by a dedicated Search input and the primary Split `+ New` Creation Button.

```
+-------------------------------------------------------------------------------------------------------------------+
| [DB Name v] [View 1 (Table)] [View 2 (Board)] [+] [...]  |  [Filter (2)] [Sort] [Group]  [Properties]  [...] [Q] [New v] |
+-------------------------------------------------------------------------------------------------------------------+
   ^ View Navigation (Zone 1)                                   ^ Query (Zone 2)            ^ Props (3)   ^ Utilities (4)
```

### Key Components
- **`ToolbarRenderer.ts`**: Core layout and rendering engine. Reorganizes `.db-toolbar-right` into 4 semantic clusters; renders WAI-ARIA tablist with roving focus; implements split `.db-new-button`; constructs the searchable All Views hub; fixes nested buttons in database popover rows; and adds the embed full-view button.
- **`TemplateToolbarAction.ts`**: Provides multi-template retrieval from vault metadata and handles template execution with insertion placement options.
- **`ViewSelection.ts`**: Resolves active database and view selections using stable view IDs (`view.id`) rather than fragile array indices.
- **`ActiveViewControlsRenderer.ts`**: Renders the active query rail with a single-click "Clear all" button and horizontal scroll fade masks.
- **`ViewConfigPanelRenderer.ts`**: Unifies general view settings and layout-specific configurations (Chart, Calendar, Timeline) under clear scope sections.
- **`DatabaseView.ts`**: Unswallows primary New button taps, connects stable view ID selection, and implements rich Add View layout defaults.
- **`EmbeddedDatabaseRenderer.ts`**: Wires the header expand button in frontmatter embeds to `openFullView`.
- **`styles.css`**: Defines CSS rules for 4-cluster layout, tablist focus styles, split button geometry, All Views hub popover, search overlay mode, neutral badge tokens, 2px drag insertion line, and 44px mobile touch envelopes.

### Data Flow
1. **View Switching**: User clicks or presses arrow keys on a tab → `resolveViewSelection` resolves stable `view.id` → `DatabaseView.switchView` updates active view and renders without losing tab continuity.
2. **Record Creation**: User clicks primary New half → `guardedCreateEntry` executes immediately, dismissing any active overlay without dropping the create event. User clicks `▼` arrow → template picker popover renders → selecting a template executes `executeNewFromTemplate`.
3. **Tab Overflow**: Container width shrinks below tab strip demand → `ResizeObserver` triggers `collapseOverflowTabs` → excess tabs collapse into `⋯` → clicking opens the searchable All Views hub with live filtering and inline view actions.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup & Baseline
- [ ] Inspect toolbar call sites and record baseline build/test state (`npx tsc --noEmit`, `npm run build`, `npx vitest run`).
- [ ] Confirm i18n keys and CSS token hooks for toolbar clusters, split buttons, and All Views hub.

### Phase 2: Toolbar Clustering, WAI-ARIA Tablist & Split Creation Button
- [ ] Reorganize `.db-toolbar-right` into 4 functional clusters (Query, Properties, Overflow Utilities, Primary Creation) in `ToolbarRenderer.ts:252-286` and `styles.css:1256`.
- [ ] Upgrade view tabs to a WAI-ARIA tablist with `role="tablist"`/`role="tab"`, `aria-selected`, roving keyboard focus (`ArrowLeft`/`ArrowRight`, `Home`/`End`), and stable view ID resolution via `ViewSelection.ts:16-43`.
- [ ] Convert `.db-new-button` to a multi-template split button with a `▼` template selection menu in `ToolbarRenderer.ts:1716-1739`, `TemplateToolbarAction.ts:6-32`, and `styles.css:1633`.
- [ ] Unswallow primary New button clicks in `DatabaseView.ts:562-565,839-872` so intentional taps execute in a single interaction.

### Phase 3: Overflow Hub, Database Selector & Add View Presets
- [ ] Transform tab overflow `⋯` dropdown into a searchable "All Views" hub with live filtering, custom icons, and inline actions (Rename, Duplicate, Change Layout, Delete) in `ToolbarRenderer.ts:721-794` and `styles.css:1258-1274`.
- [ ] Eliminate nested `<button>` elements in database selector rows (`ToolbarRenderer.ts:425-477`, `styles.css:8430-8445`).
- [ ] Upgrade `showAddViewMenu` to a rich preset sheet with layout preview cards, view duplication toggle, and 15-view capacity feedback (`ToolbarRenderer.ts:654-663,921-962`, `DatabaseView.ts:2981-3020`).

### Phase 4: Search, Badges, Settings Scope & Mobile Touch Polish
- [ ] Implement jitter-free search with inline `✕` clear action and `Escape` shortcut in `ToolbarRenderer.ts:1087-1123` and `styles.css:2687-2750`.
- [ ] Consolidate layout-specific options under unified View Settings with clear scope headers in `ToolbarRenderer.ts:1603-1614` and `ViewConfigPanelRenderer.ts:248-267`.
- [ ] Separate badge vocabularies: accent pills for filter/sort rule counts vs neutral "N hidden" badges for Properties in `ToolbarRenderer.ts:1575-1649,1801-1804` and `styles.css:1551-1566`.
- [ ] Add visible expand / full-view button to frontmatter embed headers in `ToolbarRenderer.ts:156-209,227-249` and `EmbeddedDatabaseRenderer.ts:1379-1394`.
- [ ] Disambiguate database heading dropdown chevron from title rename hover pencil in `ToolbarRenderer.ts:156-209` and `styles.css:715-790`.
- [ ] Add 2px drag insertion line and edge auto-scroll to view tabs (`ToolbarRenderer.ts:686-720`, `styles.css:1241-1249`).
- [ ] Remove 140px max-width cap on inline tab rename and support custom view icons (`ToolbarRenderer.ts:636-642,974-1006`, `styles.css:1275-1288`).
- [ ] Add "Clear all" action and horizontal scroll fade masks to `ActiveViewControlsRenderer.ts:54-100` and `styles.css:967-1014`.
- [ ] Apply 44×44px touch envelopes (`::before { inset: -8px; }`) and mobile bottom-right FAB placement on `.is-phone` viewports in `ToolbarRenderer.ts:262,1729` and `styles.css:14260`.

### Phase 5: Verification & Quality Gate
- [ ] Run full test suite (`npx vitest run`), TypeScript compilation (`npx tsc --noEmit`), and plugin build (`npm run build`).
- [ ] Verify display-only rendering (no frontmatter/body writes during toolbar actions).
- [ ] Complete `checklist.md` and `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Unit | Stable view ID selection resolution, template toolbar action execution, active filter/sort counts | Vitest (`npx vitest run`) |
| Integration | 4-cluster toolbar rendering, WAI-ARIA tablist keyboard navigation, split New button menu, All Views hub filtering, database selector row clicks | Vitest + DOM fixtures |
| Responsive / Mobile | Split pane narrow widths, mobile toolbar layout, 44px touch hit areas, FAB positioning | Chrome Device Mode / Obsidian Mobile |
| Display-only / iCloud | Verify zero frontmatter or note body mutations during toolbar interactions | Note content diff check |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| Research synthesis (`research/synthesis.md`, iteration 04) | Internal | Green (complete) | Semantic clustering and interaction specs locked |
| `src/data/ViewSelection.ts` | Internal | Green (available) | Required for stable view ID resolution |
| `src/data/TemplateToolbarAction.ts` | Internal | Green (available) | Required for multi-template execution |
| Phase `003-popovers-menus-elevation` | Predecessor | Planned | Provides elevation tokens and overlay stack |
| Phase `005-design-tokens-typography` | Successor | Planned | Consolidates global color tokens and typography |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation errors, layout broken in narrow panes, view switching desynchronization, or unhandled exceptions in template execution.
- **Procedure**: Revert commits touching `ToolbarRenderer.ts`, `ActiveViewControlsRenderer.ts`, `ViewConfigPanelRenderer.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`, `TemplateToolbarAction.ts`, and `styles.css`. All edits are isolated to presentation and view control handlers.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|---|---|---|
| Setup | None | Toolbar Clustering & Tablist |
| Toolbar Clustering & Tablist | Setup | Overflow Hub & Add View Presets |
| Overflow Hub & Add View Presets | Toolbar Clustering & Tablist | Search, Badges & Mobile Touch Polish |
| Search, Badges & Mobile Touch Polish | Overflow Hub & Add View Presets | Verification |
| Verification | Search, Badges & Mobile Touch Polish | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Sub-Phase | Complexity | Estimated Effort |
|---|---|---|
| Setup & Baseline | Low | 15 minutes |
| 4-Cluster Toolbar, WAI-ARIA Tablist & Split New Button | Medium | 60 minutes |
| All Views Hub, Database Selector & Add View Presets | Medium | 50 minutes |
| Search Clear, Badges, Settings Scope & Mobile Polish | Medium | 45 minutes |
| Verification & Quality Gates | Low | 30 minutes |
| **Total** | | **~3.5 hours** |

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
3. Verify toolbar renders in standard default mode without console errors.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A — strictly display-only rendering; no database configuration schema migrations or frontmatter changes.

<!-- /ANCHOR:enhanced-rollback -->
