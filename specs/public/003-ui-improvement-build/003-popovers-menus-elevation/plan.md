---
title: "Implementation Plan: Popovers, Menus, Dropdowns and Elevation"
description: "Locked implementation plan for floating surface modernization: OverlayStack lifecycle, mobile bottom sheets, WAI-ARIA roving keyboard listbox navigation, drilldown submenus, searchable icon pickers, and 3-tier elevation tokens."
trigger_phrases:
  - "popovers plan"
  - "overlay stack implementation"
  - "mobile bottom sheet plan"
  - "roving keyboard navigation plan"
  - "elevation tokens plan"
  - "column menu drilldown plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/003-popovers-menus-elevation"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for popovers menus and elevation phase"
    next_safe_action: "Execute phase 003 tasks starting with OverlayStack and PopoverAutoClose"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-003"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Popovers, Menus, Dropdowns and Elevation

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian Plugin API |
| **Framework** | Native Obsidian DOM helpers (`createDiv`, `createEl`, `setIcon`, `setTooltip`, `t`), Lucide iconography |
| **Storage** | None — strictly display-only; zero frontmatter or note body writes (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Top 10 recommendations #2 (Mobile Bottom Sheets), #3 (Remove 5s Inactivity Auto-Close Timer), #8 (WAI-ARIA Roving Keyboard Navigation), and iteration 03 overlay findings. It establishes a robust, unified floating overlay architecture comprising: (1) an isolated `OverlayStack` module managing LIFO dismissal and focus restoration, (2) deleting the arbitrary 5000ms idle timer in `PopoverAutoClose.ts`, (3) responsive mobile bottom sheets (`.db-mobile-bottom-sheet`) with `env(safe-area-inset-bottom)` safe-area padding and backdrop scrims, (4) full WAI-ARIA listbox keyboard navigation and instant Enter-to-select for top search matches in `DropdownField.ts`, (5) applying Phase 005's 3-tier elevation tokens and shared frosted-glass contract (`backdrop-filter: blur(12px)`), (6) drilldown submenu navigation in `ColumnMenu.ts` to eliminate hover gaps, (7) relative date preset chips and 2D keyboard navigation in `DateValuePicker.ts`, (8) live search in `IconPickerPopover.ts`, and (9) an accessible `<button>` palette grid in `OptionColorPicker.ts`.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Codebase call sites audited and verified with `file:line` citations (`PopoverPosition.ts`, `PopoverAutoClose.ts`, `DropdownField.ts`, `ColumnMenu.ts`, `DateValuePicker.ts`, `CalendarMiniCalendarRenderer.ts`, `IconPickerPopover.ts`, `OptionColorPicker.ts`, `CellRenderer.ts`, `RowMenu.ts`, `ToolbarRenderer.ts`, `styles.css`).
- [x] Research synthesis recommendations (Top 10 #2, #3, #8, Quick Win #1, iteration 03) mapped directly to requirements and tasks.
- [x] Standing constraints verified: display-only, mobile-safe, iCloud-safe, MIT-forkable, no telemetry.
- [x] Scope bounded to presentation and interaction layer; core data models and note storage untouched.

### Definition of Done
- [ ] `OverlayStack.ts` created and exported with unit tests passing in `OverlayStack.test.ts`.
- [ ] 5000ms idle timer completely deleted from `PopoverAutoClose.ts`; popovers dismiss strictly on explicit user action.
- [ ] Overlays on `.is-phone` viewports render as native bottom action sheets with backdrop scrims and safe-area insets.
- [ ] `DropdownField.ts` supports full ArrowUp/Down roving navigation, Home/End, Enter commit, and top match Enter-to-select in search.
- [ ] Semantic elevation tokens (`--db-elevation-1`, `--db-elevation-2`, `--db-elevation-3`) and frosted glass applied vault-wide.
- [ ] `ColumnMenu.ts` replaces hover submenus with slide-in drilldown views or robust pointer bridge.
- [ ] `DateValuePicker.ts` offers quick date presets (`Today`, `Tomorrow`, `Next Week`, `Clear`) and 2D calendar arrow navigation.
- [ ] `IconPickerPopover.ts` features a live keyword search input and uncapped catalog navigation.
- [ ] `OptionColorPicker.ts` swatches upgraded to accessible `<button>` elements with 2D arrow navigation.
- [ ] Menu item layout standardized (`.db-menu-item`) across all overlay surfaces.
- [ ] `npx tsc --noEmit`, `npm run build`, and `npx vitest run` pass cleanly with zero errors.
- [ ] Display-only verified: zero writes to note frontmatter or markdown bodies occur when using overlays.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The overlay architecture follows a modular, layer-separated presentation pattern inspired by Anytype and AppFlowy:
1. **Central Surface Registry (`src/views/OverlayStack.ts`)**: Pure state manager that tracks all currently mounted floating panels in a LIFO stack. It listens to global `Escape` key and outside `pointerdown` events, dispatching dismissal to the topmost surface only, and restoring keyboard focus to the triggering element.
2. **Unified Positioning & Mobile Escalation (`src/views/PopoverPosition.ts`)**: Measures anchor rect, rendered panel rect, and `visualViewport` boundaries. On desktop, it computes optimal horizontal (left/right) and vertical (above/below) placement with collision flipping. On mobile phones (`.is-phone`), it promotes the panel to a bottom sheet (`.db-mobile-bottom-sheet`).
3. **WAI-ARIA Listbox Controller (`src/views/DropdownField.ts`)**: Implements roving `tabindex` and active descendant tracking, handling keyboard events (`ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Space`) with typeahead character jumping.

```
                    ┌─────────────────────────┐
                    │     OverlayStack.ts     │
                    │ (LIFO Stack & Esc Mgmt) │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│PopoverPosition.ts│  │ DropdownField.ts │  │  ColumnMenu.ts   │
│ (Desktop Flip /  │  │  (ARIA Roving    │  │ (Drilldown View/ │
│  Mobile Sheets)  │  │  Listbox Nav)    │  │  Pointer Bridge) │
└──────────────────┘  └──────────────────┘  └──────────────────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Floating Surface Layer  │
                    │  (Phase 005 tokens)     │
                    │ (Glassmorphism & Micro) │
                    └─────────────────────────┘
```

### Key Components

- **`src/views/OverlayStack.ts` (new)**: Manages active overlay instances `{ id, panel, anchor, close, isTopSurface }`. Dispatches top-surface Escape, outside click containment, and focus restoration.
- **`src/views/PopoverPosition.ts`**: Desktop boundary collision flipping, live `visualViewport` tracking, scroll-preservation, and mobile bottom sheet promotion.
- **`src/views/PopoverAutoClose.ts`**: Deletes the 5000ms idle timer; coordinates cleanup with `OverlayStack`.
- **`src/views/DropdownField.ts`**: Listbox keyboard navigation, search Enter-to-select, Down arrow step-down, and no-results row.
- **`src/views/ColumnMenu.ts`**: Drilldown submenu navigation ("← Back" header) and pointer-bridge polygon.
- **`src/views/DateValuePicker.ts` & `CalendarMiniCalendarRenderer.ts`**: Quick preset chips and 2D ARIA calendar navigation.
- **`src/views/IconPickerPopover.ts`**: Live search input with instant keyword filtering and uncapped catalog.
- **`src/views/OptionColorPicker.ts`**: Accessible `<button>` palette grid with 2D arrow navigation.
- **`src/views/CellRenderer.ts`**: Staged relation picker with windowed rendering for 500+ items.
- **`styles.css`**: Apply Phase 005's `--db-elevation-1/2/3` tokens and shared frosted glass, plus `.db-mobile-bottom-sheet` and standardized `.db-menu-item`.

### Elevation & Layering Hierarchy

| Layer Token | Z-Index | Box Shadow | Backdrop Filter | Used By |
|-------------|---------|------------|-----------------|---------|
| `--db-elevation-1` | 50 (`--db-layer-panel`) | `0 4px 12px rgba(0,0,0,0.08)` | none | Dropdowns, tooltips, color swatches |
| `--db-elevation-2` | 100 (`--db-layer-popover`) | `0 10px 28px rgba(0,0,0,0.12)` | `blur(12px)` | Filter/sort panels, view settings, pickers, submenus |
| `--db-elevation-3` | 1000 (`--db-layer-modal`) | `0 20px 48px rgba(0,0,0,0.22)` | `blur(12px)` | Modals, mobile bottom sheets, detail drawers |

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup & Overlay Stack Foundation
- [ ] Record fork baseline: `npx tsc --noEmit`, `npm run build`, `npx vitest run`.
- [ ] Create `src/views/OverlayStack.ts` with LIFO registration, top-surface Escape dispatch, outside-click containment, and focus origin tracking.
- [ ] Write unit tests in `src/views/OverlayStack.test.ts`.
- [ ] Refactor `src/views/PopoverAutoClose.ts` to permanently delete the 5000ms idle timer.

### Phase 2: Core Popover Positioning & Mobile Bottom Sheets
- [ ] Update `src/views/PopoverPosition.ts` with dynamic panel dimension measurement, horizontal/vertical collision flipping, and `visualViewport` resize tracking.
- [ ] Implement mobile bottom sheet mode (`.db-mobile-bottom-sheet`) with top drag handle pill, backdrop scrim, and `env(safe-area-inset-bottom)` in `PopoverPosition.ts` and `styles.css`.
- [ ] Apply the 3-tier elevation tokens (`--db-elevation-1/2/3`) and z-index layer scale defined by Phase 005 in `styles.css`, using the shared 12px glass-blur contract.

### Phase 3: Dropdown & Menu Keyboard / Interaction Modernization
- [ ] Implement WAI-ARIA roving keyboard navigation in `DropdownField.ts` (`ArrowDown`/`ArrowUp`, `Home`/`End`, `Enter`/`Space`).
- [ ] Add instant Enter-to-select top search match, Down-arrow focus step-down, and no-results row in `DropdownField.ts`.
- [ ] Refactor `ColumnMenu.ts` to replace hover submenus with slide-in drilldown views ("← Back" header) and pointer-bridge support.
- [ ] Standardize menu item row anatomy (`.db-menu-item`) across `ColumnMenu.ts`, `RowMenu.ts`, `DropdownField.ts`, and `ToolbarRenderer.ts`.

### Phase 4: Pickers Modernization (Date, Icon, Color, Relation)
- [ ] Add quick date presets (`Today`, `Tomorrow`, `Next Week`, `Clear`) in `DateValuePicker.ts`.
- [ ] Implement 2D ARIA grid semantics and arrow-key calendar navigation in `CalendarMiniCalendarRenderer.ts`.
- [ ] Add live keyword search input and uncapped catalog navigation in `IconPickerPopover.ts`.
- [ ] Upgrade `OptionColorPicker.ts` to an accessible `<button>` palette grid with 2D arrow navigation.
- [ ] Upgrade `CellRenderer.ts` relation picker with listbox semantics and windowed rendering for 500+ records.

- [ ] Apply 120ms GPU-accelerated enter transitions with `prefers-reduced-motion` compliance in `styles.css`.

### Phase 5: Micro-Transitions & Verification
- [ ] Run complete test gate: `npx tsc --noEmit`, `npm run build`, `npx vitest run`.
- [ ] Perform manual verification across desktop, mobile viewport emulation, keyboard-only navigation, and display-only iCloud checks.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `OverlayStack.ts` LIFO registration, top-surface Escape dispatch, outside-click coordination, focus return | Vitest (`npx vitest run`) |
| Type Check | TypeScript strict null and type checks across all touched files | `npx tsc --noEmit` |
| Build | Plugin bundle compilation and CSS bundling | `npm run build` |
| Interaction | Keyboard navigation in DropdownField, IconPicker, CalendarMiniCalendar, and OptionColorPicker | Manual / Vitest DOM simulation |
| Mobile | Mobile bottom sheet layout, backdrop scrim, and safe-area insets | Mobile emulation / touch checks |
| iCloud / Display-Only | Verification that 0 frontmatter/note writes occur during overlay interaction | File modification inspection |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `KeyboardUtils.ts` (`isImeComposing`) | Internal | Green | IME candidate Enter key must not trigger premature selection |
| `styles.css` token layer | Internal | Green | Elevation and z-index hierarchy depends on centralized CSS variables |
| Research synthesis (`research/synthesis.md`, iteration 03) | Internal | Green | Interaction patterns and target citations locked |
| Phase `004-toolbar-and-view-controls` | Downstream | Not started | Phase 004 consumes `OverlayStack` and standardized dropdowns |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation failure, regression in popover dismissals, or keyboard trap in modals.
- **Procedure**: Revert the phase commit or restore touched files listed in spec.md §Files to Change. All changes are localized to presentation controllers and CSS, ensuring clean rollback without database state corruption.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Phase 1: Setup & Overlay Stack | None | Phase 2 |
| Phase 2: Positioning & Bottom Sheets | Phase 1 | Phase 3 |
| Phase 3: Dropdown & Menu Nav | Phase 2 | Phase 4 |
| Phase 4: Pickers Modernization | Phase 3 | Phase 5 |
| Phase 5: Verification | Phase 4 | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Phase 1: Setup & Overlay Stack | Low | 30 minutes |
| Phase 2: Positioning & Bottom Sheets | Medium | 60 minutes |
| Phase 3: Dropdown & Menu Nav | Medium | 60 minutes |
| Phase 4: Pickers Modernization | Medium | 60 minutes |
| Phase 5: Verification | Low | 30 minutes |
| **Total** | | **~4 hours** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Working tree clean before edits.
- [ ] Baseline test, typecheck, and build recorded.
- [ ] Display-only behavior confirmed: no note-body mutation paths introduced.

### Rollback Procedure
1. Revert the phase commit, or restore the files listed in spec.md §Files to Change.
2. Re-run `npx tsc --noEmit`, `npm run build`, and `npx vitest run`.
3. Verify that popovers and menus function normally.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A — floating overlays are strictly display-only runtime UI components.

<!-- /ANCHOR:enhanced-rollback -->
