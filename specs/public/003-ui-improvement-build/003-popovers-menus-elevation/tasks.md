---
title: "Tasks: Popovers, Menus, Dropdowns and Elevation"
description: "Ranked task breakdown for floating surface modernization, ordered by research priority with real fork file:line targets and S/M/L effort tiers."
trigger_phrases:
  - "popovers tasks"
  - "overlay stack tasks"
  - "mobile bottom sheet tasks"
  - "dropdown keyboard tasks"
  - "elevation tokens tasks"
  - "date presets tasks"
  - "icon picker search tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/003-popovers-menus-elevation"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled popovers and menus task documentation"
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
      session_id: "ui-build-003"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Tasks: Popovers, Menus, Dropdowns and Elevation

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

- [x] T001 Read this phase's decision-ready findings and evidence trail (`specs/public/002-ui-improvement-research/research/synthesis.md:1-20`, `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-03.md`, `specs/public/002-ui-improvement-research/research/codex-luna/iteration-03.md`) [15m]
- [x] T002 Record the fork's baseline test, typecheck, and build state (`vitest.config.ts:1-9`, `npx vitest run`, `npx tsc --noEmit`, `npm run build`) [10m]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Task order follows the research synthesis RANKED BACKLOG (rank # shown per task).

- [x] T010 **(rank 3 / quick win 1) Eliminate 5s inactivity auto-close timer and create OverlayStack**: create `OverlayStack.ts` with LIFO stack registration, top-surface Escape dispatch, outside pointerdown coordination, and focus origin tracking; remove 5000ms idle timer in `PopoverAutoClose.ts` (`src/views/OverlayStack.ts`, `src/views/PopoverAutoClose.ts:11-79`, `src/views/DropdownField.ts:215-236`, `src/views/ToolbarRenderer.ts:391-403`) [S]
- [x] T011 **(rank 2) Mobile bottom sheets & safe-area overlays**: implement `.db-mobile-bottom-sheet` on `.is-phone` viewports with top drag handle, dimmed backdrop scrim, and `env(safe-area-inset-bottom)` safe-area insets in `PopoverPosition.ts:24-90, 124-148` and `styles.css:15722-15731` [M]
- [x] T012 **(rank 8) WAI-ARIA roving keyboard navigation in DropdownField**: implement roving `tabindex`, `ArrowDown`/`ArrowUp` navigation, `Home`/`End` bounds jumping, `Enter`/`Space` selection, typeahead character jumping, and active option scroll-into-view (`src/views/DropdownField.ts:141-236`, `styles.css:1873-2055`) [M]
- [x] T013 **(rank 5 / iter 03) Searchable dropdown instant Enter-to-select & focus step-down**: bind `Enter` in search input to immediately select top visible filtered option; bind `ArrowDown` to shift focus into options list; render explicit `db-dropdown-empty` row on zero matches (`src/views/DropdownField.ts:148-156, 209-212`, `styles.css:1873-2055`) [S]
- [x] T014 **(rank 2 / iter 03) Apply Phase 005's 3-tier elevation & glassmorphism tokens**: consume `--db-elevation-1`, `--db-elevation-2`, `--db-elevation-3`, and the z-index layer scale defined by Phase 005; apply the shared `backdrop-filter: blur(12px)` contract without declaring competing tokens (`styles.css:2166-2170, 2364-2368, 2758-2765, 4590-4594, 5334-5345, 5583-5592, 15941-15951, 16429-16460`) [S]
- [x] T015 **(rank 1 / iter 03) Bi-directional viewport collision flipping in PopoverPosition**: measure dynamic panel dimensions, flip horizontally (left/right) and vertically (above/below) based on viewport room, preserve panel scroll position, and track `visualViewport` resize (`src/views/PopoverPosition.ts:24-104`, `src/views/ColumnMenu.ts:565-593`, `src/views/OptionColorPicker.ts:49-75`, `src/views/CellRenderer.ts:2648-2695`) [M]
- [x] T016 **(rank 3 / iter 03) ColumnMenu drilldown submenu navigation & pointer bridge**: replace fragile 140ms hover submenus with slide-in drilldown views (with "← Back" header) or a robust pointer-bridge polygon with keyboard arrow navigation (`src/views/ColumnMenu.ts:98-154, 565-660`, `styles.css:2561-2684`) [M]
- [x] T017 **(rank 7 / iter 03) DateValuePicker quick preset chips & 2D calendar navigation**: add quick preset chips (`Today`, `Tomorrow`, `Next Week`, `Clear`) in `DateValuePicker.ts:105-180`; implement full 2D ARIA grid semantics and arrow-key calendar navigation in `CalendarMiniCalendarRenderer.ts:24-95, 67-212`; retain `isImeComposing` guard (`src/data/KeyboardUtils.ts:1-16`, `styles.css:5218-5325`) [M]
- [x] T018 **(rank 9 / iter 03) IconPickerPopover live search & uncapped catalog**: add sticky top search input with instant keyword filtering across Emoji and Lucide sets, eliminate 240-item truncation, add tablist ARIA semantics, and support roving grid arrow navigation (`src/views/IconPickerPopover.ts:57-169, 176-190`, `styles.css:15939-16021`) [M]
- [x] T019 **(rank 7 / iter 03 luna) Accessible OptionColorPicker button palette grid**: replace `span[role="button"]` swatches with `<button type="button">` elements with `aria-label`, `aria-pressed`, 2D Arrow navigation, visible focus rings outside container queries, and focus return on close (`src/views/OptionColorPicker.ts:15-47`, `styles.css:187-206, 5581-5608`) [S]
- [x] T020 **(rank 10 / iter 03) Standardized menu row component anatomy**: unify menu item layout (`.db-menu-item`, `.db-menu-item-icon`, `.db-menu-item-label`, `.db-menu-item-current`, `.db-menu-item-shortcut`, `.db-menu-item-check`) across `ColumnMenu.ts`, `RowMenu.ts`, `DropdownField.ts`, and `ToolbarRenderer.ts` (`styles.css:2185-2210, 5349-5370, 8385-8655`) [S]
- [x] T021 **(rank 10 / iter 03 luna) Staged multi-select relation picker with windowing**: upgrade relation picker with listbox search relationship, `ArrowDown` step-down, no-results feedback, selected count badge, and lightweight visible windowing for 500+ records (`src/views/CellRenderer.ts:709-821, 885-925`, `styles.css:5332-5461`) [L]
- [x] T022 **(rank 12 / iter 03) Smooth popover entry micro-transitions**: apply subtle 120ms ease-out enter transitions (`transform: scale(0.98) translateY(-4px) → scale(1) translateY(0)`, `opacity: 0 → 1`) with `prefers-reduced-motion: reduce` compliance (`styles.css:2160-2171, 2360-2370, 5332-5347, 15939-15952`) [S]
- [x] T023 **(rank 3 / iter 03 luna) Focus restoration contract on overlay close**: ensure all custom popovers, menus, and pickers store triggering element and restore focus on dismiss (`src/views/OverlayStack.ts`, `src/views/DropdownField.ts:220-226`, `src/views/OptionColorPicker.ts:20-24`, `src/views/IconPickerPopover.ts:80-87`, `src/views/DateValuePicker.ts:200-205`) [S]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit Tests
- [x] T050 Run `npx vitest run`: verify unit tests pass for `OverlayStack.test.ts` (LIFO registration, top-surface Escape dispatch, outside-click coordination, focus return) (`src/views/PopoverAutoClose.ts:11-79`) [15m]

### Integration & Manual
- [x] T051 Type check: `npx tsc --noEmit` passes with zero errors across all touched files (`package.json:1-38`) [10m]
- [x] T052 Build verification: `npm run build` compiles plugin bundle cleanly (`package.json:1-38`) [10m]
- [x] T053 Keyboard navigation check: verify roving listbox focus in DropdownField, ArrowDown from search, 2D grid in OptionColorPicker and CalendarMiniCalendar (`src/views/DropdownField.ts:141-236`, `src/views/OptionColorPicker.ts:15-47`, `src/views/CalendarMiniCalendarRenderer.ts:24-95`) [15m]
- [x] T054 Mobile bottom sheet check: verify `.db-mobile-bottom-sheet` on `.is-phone` viewports with safe-area insets and backdrop tap dismissal (`src/views/PopoverPosition.ts:24-90, 124-147`, `styles.css:15722-15731`) [15m]
- [x] T055 Display-only check: verify 0 frontmatter/note writes occur during overlay interaction (iCloud-safety) (`src/views/PopoverPosition.ts:24-104`) [10m]

### Documentation
- [x] T056 Update `checklist.md` evidence and this phase's `implementation-summary.md` after verification (`checklist.md:1-10`) [15m]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All implementation tasks marked `[x]` after the build completes (`checklist.md:48-106`).
- [x] `npx tsc --noEmit`, `npm run build`, and `npx vitest run` pass cleanly with zero regressions (`package.json:1-38`, `296 tests across 33 files`).
- [x] `checklist.md` fully verified with P0/P1/P2 counts recorded (`checklist.md:48-106`).

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:cross-refs -->
