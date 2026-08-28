---
title: "Implementation Plan: Mobile, Responsiveness & Accessibility Handoffs"
description: "Locked build plan for mobile ergonomics and accessibility: universal touch and tablet detection (isTouchDevice), 44x44px touch hit target envelopes, Phase 003 mobile bottom-sheet consumption and verification, visualViewport virtual keyboard tracking for inline cell editing, pointer long-press context menus with haptics, mobile Kanban swipe-snapping with pagination indicator, WAI-ARIA 1.2 Grid semantics with aria-sort, Phase 004 WAI-ARIA tablist verification, group collapse disclosure attributes, aria-live polite query status announcements, shared 2D keyboard navigation for embedded databases, explicit interaction-scope registry replacing document hover capture, focus-not-obscured scroll margins, focus-visible styling for body portals, and high-contrast forced-colors mode support."
trigger_phrases:
  - "mobile accessibility plan"
  - "touch targets plan"
  - "mobile bottom sheet plan"
  - "isTouchDevice plan"
  - "visualViewport keyboard plan"
  - "touch long press plan"
  - "kanban swipe snapping plan"
  - "aria grid plan"
  - "aria tablist plan"
  - "aria live status plan"
  - "embed keyboard navigation plan"
  - "interaction scope registry plan"
  - "focus not obscured plan"
  - "forced colors high contrast plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/008-mobile-and-accessibility"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for mobile and accessibility phase"
    next_safe_action: "Implement phase 008 tasks from touch detection onward"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-008"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Mobile, Responsiveness & Accessibility

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | TypeScript, Obsidian View Component Engine, Pointer Events, WAI-ARIA 1.2 Standards |
| **Framework** | Native Obsidian DOM APIs (`createDiv`, `createSpan`, `setIcon`, `t`), `visualViewport` API, PointerEvent API |
| **Storage** | None — strictly display-only; zero note frontmatter or markdown body writes on render (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin bundle build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Ranked Recommendations #2 (Mobile Bottom Sheets & Viewport-Safe Overlays), #9 (Remove Destructive Focus Reset & Expand Touch Targets to 44px), Quick Wins #3, #14, #15, #16, and Themed Backlog #8 (Mobile, Responsiveness & Accessibility). It transforms the Note Database plugin's mobile ergonomics, assistive technology support, and keyboard ownership across 6 core pillars:
1. **Universal Touch Environment & 44px Hit Targets**: Creates `src/data/TouchEnvironment.ts` with `isTouchDevice()` checking `Platform.isMobile || Platform.isTablet || window.matchMedia("(pointer: coarse)").matches`, and expands touch hit envelopes to 44×44px via `::before { inset: -8px; }` across toolbar icons, filter removal chips, column menus, checkboxes, and move controls.
2. **Mobile Bottom-Sheet Consumption & Virtual Keyboard Safety**: Consumes Phase 003's slide-up bottom sheets (`.db-mobile-bottom-sheet`) with grab handles, backdrop scrims, and `env(safe-area-inset-bottom)` while routing touch-device panels through `isTouchDevice()` and verifying 44px targets. Implements `window.visualViewport` tracking during mobile cell editing with `scrollIntoView({ block: 'center', behavior: 'smooth' })` to keep inputs above the virtual keyboard.
3. **Touch Gestures & Mobile Kanban Polish**: Implements pointer-based long-press context menus (450ms + haptics) while suppressing browser text selection, eliminates double-tap zoom lag via `touch-action: manipulation`, and adds CSS scroll-snapping with pagination pill indicators (`● ○ ○ ○`) to mobile Kanban boards.
4. **WAI-ARIA 1.2 Grid, Tablist & Disclosure Semantics**: Annotates tables with `role="grid"`, `aria-rowcount`, `aria-colcount`, `aria-sort="ascending|descending|none"`, `aria-colindex`, `aria-rowindex`, and `aria-selected`. Verifies Phase 004's accessible `role="tablist"` with roving keyboard tabindex, and binds `aria-expanded` and `aria-controls` to group toggles across 5 views.
5. **Screen Reader Live Regions & 2D Embed Keyboard Grid**: Injects a visually hidden `aria-live="polite"` status region announcing filter/search count changes. Generalizes `TableKeyboardNavigation.ts` and attaches it to `EmbeddedDatabaseRenderer.ts`, bringing full spreadsheet keyboard navigation (Tab, Arrow keys, Enter/F2 edit, Spacebar checkbox) to embedded database codeblocks.
6. **Focus Ownership, Portals & High-Contrast Theming**: Replaces document-level `:hover` shortcut stealing with `src/views/InteractionScope.ts`. Scopes `:focus-visible` across body portals, adds focus-not-obscured scroll margins (`scroll-margin-top/bottom`), and provides complete Windows/macOS high-contrast `@media (forced-colors: active)` fallbacks.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Codebase audited: environment checks (`isPhoneLayout`), touch targets (`styles.css`), popover positioning (`PopoverPosition.ts`), mobile cell editors (`CellRenderer.ts`), keyboard navigation (`TableKeyboardNavigation.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`), and group toggles located with precise `file:line` evidence.
- [x] Accessibility and mobile patterns benchmarked against Anytype bottom sheets & gesture lifecycles, AppFlowy 44px touch targets & WAI-ARIA grid standards, and Notion keyboard viewport tracking.
- [x] Standing constraints verified: 100% display-only rendering, zero note-body writes on render, mobile-safe, MIT-forkable, rebase-clean isolated diff.

### Definition of Done
- [ ] `TouchEnvironment.ts` created with `isTouchDevice()` and unit-tested in `TouchEnvironment.test.ts`, replacing fragile `isPhoneLayout()` across 8 view controllers.
- [ ] 44×44px touch hit target pseudo-elements implemented across toolbar buttons, filter removal chips, column menu triggers, checkboxes, move buttons, and jump controls (`styles.css:1024-1041, 1324, 4178-4188, 5090-5110, 15560-15636, 15996-16020`).
- [ ] Phase 003's mobile bottom sheet architecture (`.db-mobile-bottom-sheet`) consumed and verified with grab handles, backdrop scrim, and safe-area padding (`PopoverPosition.ts:24-90, 124-147`, `styles.css:15721-15731`); this phase does not implement its geometry.
- [ ] `visualViewport` virtual keyboard tracking implemented in `CellRenderer.ts:1539-1558, 2024-2059` and `styles.css:15734-15760` with smooth centering and top-docked toolbar.
- [ ] Pointer-based long-press context menus (450ms + haptics) and `touch-action: manipulation` implemented across `DatabaseView.ts`, `TableRenderer.ts`, `BoardRenderer.ts`, and `CellRenderer.ts`.
- [ ] Mobile Kanban scroll-snapping and pagination indicator (`● ○ ○ ○`) implemented in `BoardRenderer.ts:280-350` and `styles.css:7050-7120`.
- [ ] WAI-ARIA 1.2 Grid semantics (`role="grid"`, `aria-sort`, `aria-colindex`, `aria-rowindex`, `aria-selected`) implemented in `TableRenderer.ts:60-120, 422-455`.
- [ ] Phase 004's WAI-ARIA Tablist pattern with roving keyboard tabindex verified for View Switcher tabs in `ToolbarRenderer.ts:625-683` and active-view dispatch in `DatabaseView.ts:2970` (`switchView`); this phase does not implement the tablist.
- [ ] Dynamic group collapse disclosure (`aria-expanded`, `aria-controls`) implemented across Table, Board, Gallery, List, and Timeline views.
- [ ] Visually hidden `aria-live="polite"` status region implemented in `ActiveViewControlsRenderer.ts:29-53` and its active-control integration in `DatabaseView.ts:1958-1970`.
- [ ] Shared 2D table keyboard navigation controller integrated into `EmbeddedDatabaseRenderer.ts:421-434, 3425-3439`.
- [ ] Explicit `InteractionScope.ts` created, unit-tested in `InteractionScope.test.ts`, and integrated into `DatabaseView.ts:1206-1229, 1430-1440` to replace document `:hover` capture.
- [ ] Focus-not-obscured scroll margins and body portal `:focus-visible` styling implemented in `styles.css:189-206, 4081-4089`.
- [ ] High-contrast OS `forced-colors: active` system keyword fallbacks declared in `styles.css:208-217, 4988-5023, 16429-16460`.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, and `npx vitest run`.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The mobile and accessibility architecture follows the **Universal Multi-Modal Interaction & Semantic Accessibility Framework** inspired by Anytype, AppFlowy, and Notion:
- **Universal Touch Environment (`TouchEnvironment.ts`)**: Evaluates input capabilities via `Platform.isMobile || Platform.isTablet || matchMedia("(pointer: coarse)")` rather than relying on global phone body classes, ensuring tablets and split panes receive appropriate touch controls.
- **Native Bottom Sheet Handoff (`.db-mobile-bottom-sheet`)**: Consumes Phase 003's slide-up geometry, safe-area insets, and visualViewport behavior; this phase adds only touch-device routing and 44px target verification.
- **Virtual Viewport Keyboard Synchronization (`visualViewport`)**: Dynamically measures the mobile software keyboard and centers active cell editors without occlusion.
- **Explicit Interaction Scope Management (`InteractionScope.ts`)**: Replaces brittle document `:hover` shortcut stealing with explicit focus ownership tracking across view containers, body portals, and embedded database codeblocks.
- **WAI-ARIA 1.2 Structural Semantics**: Implements the table grid contract here, verifies Phase 004's `tablist`/`tabpanel` contract, and covers dialog/listbox roles and live regions without duplicating the view-switcher contract.

```
+----------------------------------------------------------------------------------------------------+
|  UNIVERSAL INTERACTION & ACCESSIBILITY CONTROLLER (DatabaseView.ts / EmbeddedDatabaseRenderer.ts) |
|  ├── Touch Environment Engine: isTouchDevice (Coarse Pointer + Mobile + Tablet + Viewport Size)   |
|  ├── Interaction Scope Registry: Explicit Focus Ownership Across Portals, Embeds & External Notes |
|  ├── WAI-ARIA Semantics: Grid (aria-sort), Phase 004 Tablist Verification, Live Announcements     |
|  └── Focus Visibility & Geometry: Focus-Not-Obscured Scroll Margins + High-Contrast Forced Colors  |
+----------------------------------------------------------------------------------------------------+
                                               │
               ┌───────────────────────────────┼──────────────────────────────┐
               ▼                               ▼                              ▼
+-----------------------------+ +-----------------------------+ +-----------------------------+
| MOBILE VIEWPORT & SHEETS    | | TOUCH GESTURES & ERGONOMICS | | KEYBOARD & EMBED PARITY     |
| (PopoverPosition.ts)        | | (CellRenderer / Board)      | | (TableKeyboardNavigation)   |
| ├── Bottom Sheet Drawer     | | ├── 44px Hit Envelopes      | | ├── 2D Spreadsheet Grid     |
| │   (env(safe-area-inset))  | | │   (::before pseudo-elem)  | | │   (Tab, Arrows, Enter, F2)|
| ├── visualViewport Tracking | | ├── Long-Press (450ms+vib)  | | ├── Embedded Note Codeblock |
| │   (scrollIntoView center) | | ├── touch-action: manip     | | │   (Full Keyboard Parity)  |
| └── Top-Docked Action Bar   | | └── Kanban Swipe-Snapping   | | └── Modal Focus Trapping    |
|     (Done / Cancel Buttons) | |     (● ○ ○ ○ Indicator)     | |     (Tab Cycle, Esc Return) |
+-----------------------------+ +-----------------------------+ +-----------------------------+
```

### Key Components
- **`TouchEnvironment.ts`** (new): Centralized touch and platform evaluation utility (`isTouchDevice`, `isCoarsePointer`, `getResponsiveMode`).
- **`InteractionScope.ts`** (new): Explicit focus registry managing keyboard ownership and portal focus return.
- **`PopoverPosition.ts`**: Consumes and verifies Phase 003's mobile bottom-sheet positioning and safe-area calculations.
- **`CellRenderer.ts`**: Integrated with `visualViewport` to smoothly scroll mobile cell editors above the virtual keyboard.
- **`TableRenderer.ts`**: Enhanced with complete WAI-ARIA grid roles, `aria-sort`, accessible checkboxes, and 44px touch envelopes.
- **`EmbeddedDatabaseRenderer.ts`**: Connected to shared `TableKeyboardNavigation.ts` for 2D spreadsheet keyboard navigation.
- **`ToolbarRenderer.ts`**: Verifies Phase 004's modernized view switcher with WAI-ARIA `role="tablist"` and roving keyboard focus.
- **`ActiveViewControlsRenderer.ts`**: Connected to `div.db-sr-status` for live screen-reader query announcements.

### Data Flow
1. **Touch Interaction Flow**: User taps/long-presses control → `TouchEnvironment` verifies touch device → activates 44px hit target → triggers haptic pulse and opens the Phase 003 native bottom sheet or context menu.
2. **Mobile Cell Edit Flow**: User taps cell on mobile → opens `.db-cell-edit-popover` → `visualViewport` detects software keyboard height → calls `scrollIntoView({ block: 'center' })` → docks top "Done/Cancel" bar.
3. **Screen Reader Query Flow**: User modifies filter rule / search text → query pipeline updates visible rows → `ActiveViewControlsRenderer` pushes formatted string to `div.db-sr-status` (`aria-live="polite"`) → screen reader announces record count.
4. **Keyboard Embed Flow**: User tabs into embedded database codeblock → `InteractionScope` claims focus → Arrow keys move active cell via `TableKeyboardNavigation` → Enter edits cell → Escape returns focus to surrounding markdown note.

### Mobile/iCloud Safety Notes
- All rendering is strictly display-only: zero markdown frontmatter or body writes occur during mobile interaction, touch gestures, or accessibility attribute injection.
- Safe-area insets (`env(safe-area-inset-bottom)`) and dynamic viewport measurements (`dvh`, `visualViewport`) prevent occlusion by mobile home indicators, navigation ribbons, and virtual keyboards.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup, Environment Detection & Interaction Scope
- [ ] Audit call sites in `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`, `TableRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `ToolbarRenderer.ts`, `PopoverPosition.ts`, and `CellRenderer.ts`.
- [ ] Create `src/data/TouchEnvironment.ts` and unit test suite `src/data/TouchEnvironment.test.ts`.
- [ ] Create `src/views/InteractionScope.ts` and unit test suite `src/views/InteractionScope.test.ts`.
- [ ] Record baseline build, lint, and test state (`npx tsc --noEmit`, `npm run build`, `npx vitest run`).

### Phase 2: Touch Targets, Bottom Sheets & Keyboard-Safe Editing
- [ ] Expand 44×44px touch hit target envelopes via `::before { inset: -8px; }` in `styles.css:1024-1041, 1324, 4178-4188, 5090-5110, 15560-15636, 15996-16020`.
- [ ] Consume and verify Phase 003's mobile bottom sheet drawer architecture (`.db-mobile-bottom-sheet`) in `PopoverPosition.ts:24-90, 124-147` and `styles.css:15721-15731`; limit this phase to `isTouchDevice()` routing and 44×44px target envelopes.
- [ ] Implement `visualViewport` virtual keyboard tracking, smooth scroll centering, and top "Done / Cancel" toolbar in `CellRenderer.ts:1539-1558, 2024-2059` and `styles.css:15734-15760`.
- [ ] Replace `isPhoneLayout()` across all 8 view controllers with `isTouchDevice()` from `TouchEnvironment.ts`.

### Phase 3: Touch Gestures, Kanban Snapping & Interaction Scopes
- [ ] Implement pointer-based long-press context menus (450ms + haptics) through the existing row-menu wiring in `DatabaseView.ts:7626-7628`, `TableRenderer.ts:510-530`, `BoardRenderer.ts:590-620`, and `CellRenderer.ts:418-430`.
- [ ] Add `touch-action: manipulation` across `styles.css:124, 4065-4080` to eliminate double-tap zoom delay.
- [ ] Implement mobile Kanban swipe-snapping (`scroll-snap-type: x mandatory`) and pagination indicator (`● ○ ○ ○`) in `BoardRenderer.ts:280-350` and `styles.css:7050-7120`.
- [ ] Replace document `:hover` shortcut stealing with `InteractionScope.ts` in `DatabaseView.ts:1206-1229, 1430-1440`.

### Phase 4: WAI-ARIA Semantics, Live Regions & Embed Keyboard Grid
- [ ] Verify the WAI-ARIA 1.2 Grid semantics implemented by this phase (`role="grid"`, `aria-sort`, `aria-colindex`, `aria-rowindex`, `aria-selected`) in `TableRenderer.ts:60-120, 422-455` and `ColumnHeaderController.ts:20-45`.
- [ ] Verify Phase 004's View Switcher WAI-ARIA `role="tablist"` contract with roving keyboard tabindex in `ToolbarRenderer.ts:625-683`, active-view dispatch in `DatabaseView.ts:2970` (`switchView`), and `styles.css:1210-1270`; do not re-annotate it here.
- [ ] Implement dynamic group collapse disclosure (`aria-expanded`, `aria-controls`) across Table, Board, Gallery, List, and Timeline views.
- [ ] Inject visually hidden `div.db-sr-status` with `aria-live="polite"` for filter, search, and sort announcements in `ActiveViewControlsRenderer.ts:29-53` and its active-control integration in `DatabaseView.ts:1958-1970`.
- [ ] Integrate shared 2D table keyboard navigation controller into `EmbeddedDatabaseRenderer.ts:421-434, 3425-3439`.
- [ ] Make timeline date range and off-window counts accessible in `CalendarTimelineModel.ts:336-365, 554-631` and expand jump buttons to 44px in `styles.css:15077-15125`.
- [ ] Eliminate destructive `.note-database-container *:focus { outline: none; }` and extend `:focus-visible` to body portals in `styles.css:189-206`.
- [ ] Add focus-not-obscured scroll margins (`scroll-margin-top/bottom`) in `styles.css:4081-4089`.
- [ ] Implement dialog focus trapping (`Tab` cycle, `Escape` return) across `TableRecordPeek.ts:88-120`, `RecordDetailPanel.ts:150-180`, and `FilterPanelRenderer.ts:120-150`.
- [ ] Declare comprehensive `@media (forced-colors: active)` high-contrast system keyword fallbacks and portal-wide reduced-motion rules in `styles.css:208-217, 4988-5023, 16429-16460`.

### Phase 5: Focus Management, High-Contrast Theming & Verification
- [ ] Run full test suite (`npx vitest run`), TypeScript compilation (`npx tsc --noEmit`), and plugin build (`npm run build`). Complete `checklist.md` and `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Unit | `TouchEnvironment` pointer and platform detection; `InteractionScope` focus activation and return lifecycles; `TableKeyboardNavigation` shared 2D grid resolution | Vitest (`npx vitest run`), `TouchEnvironment.test.ts`, `InteractionScope.test.ts`, `TableKeyboardNavigation.test.ts` |
| Touch & Mobile | 44×44px touch hit target envelopes, Phase 003 mobile bottom-sheet consumption/verification, `visualViewport` virtual keyboard centering, long-press context menus, and Kanban swipe-snapping | Chrome DevTools Mobile / Touch Emulation / Obsidian Mobile Simulator |
| WAI-ARIA & Screen Reader | Table `role="grid"`, `aria-sort`, `role="tablist"` view switcher, group `aria-expanded`/`aria-controls`, and `aria-live="polite"` status announcements | VoiceOver (macOS/iOS) / TalkBack (Android) / NVDA |
| Keyboard Grid & Embeds | 2D spreadsheet keyboard navigation in full-view and embedded database codeblocks; focus trapping in dialogs; focus-not-obscured scroll margins | Hardware Keyboard Navigation / Layout Inspector |
| High Contrast & Theming | `@media (forced-colors: active)` border, selection, and focus visibility; portal-wide `@media (prefers-reduced-motion: reduce)` compliance | Windows High Contrast Mode / DevTools Emulation |
| Display-only / iCloud | Zero note frontmatter or body writes during mobile touch interaction, bottom sheet display, or ARIA attribute injection | Note content diff check |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| Research synthesis (`research/synthesis.md`, iteration 10) | Internal | Green (complete) | Target citations and backlog mapping locked |
| `src/data/TableKeyboardNavigation.ts` | Internal | Green (available) | Required for shared 2D keyboard navigation extraction |
| `src/views/PopoverPosition.ts` | Internal | Green (available) | Consumes Phase 003's mobile bottom-sheet positioning output |
| Phase `005-design-tokens-typography` | Predecessor | Planned | Provides WCAG AA color tokens and spatial spacing variables |
| Phase `007-micro-interactions` | Predecessor | Planned | Provides floating action dock, contiguous selection perimeter, and gesture feedback |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation errors, broken touch scrolling, virtual keyboard input locking, keyboard navigation traps in note editors, or screen-reader rendering crashes.
- **Procedure**: Revert commits touching `TouchEnvironment.ts`, `InteractionScope.ts`, `TableRenderer.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`, `CellRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `CalendarRenderer.ts`, `CalendarTimelineRenderer.ts`, `ColumnHeaderController.ts`, `ToolbarRenderer.ts`, `ActiveViewControlsRenderer.ts`, `PopoverPosition.ts`, `TableKeyboardNavigation.ts`, `CalendarTimelineModel.ts`, `i18n.ts`, and `styles.css`. All changes are isolated to presentation controllers, ARIA annotations, and CSS styling.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|---|---|---|
| Setup & Environment Detection | None | Touch Targets & Bottom Sheets |
| Touch Targets & Bottom Sheets | Setup & Environment Detection | Touch Gestures & Kanban Snapping |
| Touch Gestures & Kanban Snapping | Touch Targets & Bottom Sheets | WAI-ARIA & Embed Keyboard Grid |
| WAI-ARIA & Embed Keyboard Grid | Touch Gestures & Kanban Snapping | Focus, High-Contrast & Verification |
| Focus, High-Contrast & Verification | WAI-ARIA & Embed Keyboard Grid | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Sub-Phase | Complexity | Estimated Effort |
|---|---|---|
| Setup & Environment Detection | Low | 20 minutes |
| Touch Targets, Bottom Sheets & Keyboard-Safe Editing | Medium | 60 minutes |
| Touch Gestures, Kanban Snapping & Interaction Scopes | Medium | 60 minutes |
| WAI-ARIA Semantics, Live Regions & Embed Keyboard Grid | Medium | 70 minutes |
| Focus Management, High-Contrast Theming & Verification | Medium | 60 minutes |
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
- **Reversal procedure**: N/A — strictly display-only view renderers, ARIA attributes, and in-memory touch/focus state; zero persistent note or configuration schema changes.

<!-- /ANCHOR:enhanced-rollback -->
