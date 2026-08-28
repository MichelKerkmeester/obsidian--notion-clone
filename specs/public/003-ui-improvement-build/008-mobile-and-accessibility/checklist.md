---
title: "Quality Checklist: Mobile, Responsiveness & Accessibility Handoffs"
description: "Pre-implementation quality assurance checklist for phase 008: universal touch detection (isTouchDevice), 44x44px touch hit target expansion, Phase 003 mobile bottom-sheet handoff verification, visualViewport virtual keyboard tracking for inline cell editing, pointer long-press context menus with haptics, mobile Kanban swipe-snapping with pagination indicator, WAI-ARIA 1.2 Grid semantics with aria-sort, Phase 004 WAI-ARIA tablist verification, group collapse disclosure attributes, aria-live polite query status announcements, shared 2D keyboard navigation for embedded databases, explicit interaction-scope registry, focus-not-obscured scroll margins, focus-visible styling for body portals, and high-contrast forced-colors mode support."
trigger_phrases:
  - "mobile accessibility checklist"
  - "touch targets checklist"
  - "mobile bottom sheet checklist"
  - "isTouchDevice checklist"
  - "visualViewport keyboard checklist"
  - "touch long press checklist"
  - "kanban swipe snapping checklist"
  - "aria grid checklist"
  - "aria tablist checklist"
  - "aria live status checklist"
  - "embed keyboard navigation checklist"
  - "interaction scope registry checklist"
  - "focus not obscured checklist"
  - "forced colors high contrast checklist"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/008-mobile-and-accessibility"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Authored quality checklist for mobile and accessibility phase"
    next_safe_action: "Execute checklist items during phase 008 implementation"
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
# Quality Checklist: Mobile, Responsiveness & Accessibility

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Verify that environment checks (`isPhoneLayout`), touch targets (`styles.css`), popover positioning (`PopoverPosition.ts`), mobile cell editors (`CellRenderer.ts`), keyboard navigation (`TableKeyboardNavigation.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`), and group toggles match target `file:line` locations in `spec.md`.
- [ ] CHK-002 [P0] Confirm that `TableKeyboardNavigation.ts` and `PopoverPosition.ts` are available for extraction and enhancement without breaking existing callers.
- [ ] CHK-003 [P0] Baseline test suite passes cleanly before changes: `npx vitest run`.
- [ ] CHK-004 [P0] Baseline TypeScript compilation passes cleanly: `npx tsc --noEmit`.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-005 [P0] `TouchEnvironment.ts` provides `isTouchDevice()` checking `Platform.isMobile || Platform.isTablet || matchMedia("(pointer: coarse)")` and container ResizeObserver width, replacing `isPhoneLayout()` across all 8 view controllers.
- [ ] CHK-006 [P0] 44×44px touch hit target envelopes (`::before { inset: -8px; }`) are implemented across toolbar buttons, filter remove chips, column menu triggers, checkboxes, mobile move buttons, and jump controls (`styles.css:1024-1041, 1324, 4178-4188, 5090-5110, 15560-15636, 15996-16020`).
- [ ] CHK-007 [P0] Phase 003's native mobile bottom sheet architecture (`.db-mobile-bottom-sheet`) is consumed and verified with its top grab handle, backdrop scrim, top "Done" / "Cancel" buttons, and safe-area padding; 008 does not implement its geometry.
- [ ] CHK-008 [P0] Mobile cell editing attaches to `window.visualViewport` resize events and calls `scrollIntoView({ block: 'center', behavior: 'smooth' })`, preventing software keyboard occlusion.
- [ ] CHK-009 [P1] Destructive `.note-database-container *:focus { outline: none; }` is eliminated and `:focus-visible` styling is extended to body-mounted portals in `styles.css:189-206`.
- [ ] CHK-010 [P1] Focus-not-obscured scroll margins (`scroll-margin-top/bottom`) ensure focused cells never scroll behind sticky headers or fixed bottom chrome (`styles.css:4081-4089`).

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-011 [P0] Unit tests in `TouchEnvironment.test.ts` verify accurate detection across desktop mouse, touch phones, tablets, and split panes.
- [ ] CHK-012 [P0] Unit tests in `InteractionScope.test.ts` verify scope registration, focus trapping, pause on external focus, and focus return.
- [ ] CHK-013 [P0] Pointer long-press context menus (450ms + haptics) are verified on touch screens without triggering browser text selection loupe.
- [ ] CHK-014 [P0] Mobile Kanban scroll-snapping and pagination indicator (`● ○ ○ ○`) allow smooth horizontal column swiping and 1-tap direct jumping.
- [ ] CHK-015 [P1] WAI-ARIA 1.2 Grid semantics (`role="grid"`, `aria-sort`, `aria-colindex`, `aria-rowindex`, `aria-selected`) implemented by this phase are verified with screen readers (VoiceOver, TalkBack, NVDA).
- [ ] CHK-016 [P1] Phase 004's WAI-ARIA `role="tablist"` contract with roving keyboard tabindex is verified on View Switcher tabs; 008 does not re-annotate it.
- [ ] CHK-017 [P1] Shared 2D spreadsheet keyboard navigation (Tab, Arrow keys, Enter/F2 edit, Spacebar checkbox) is verified in embedded database codeblocks.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-018 [P0] Document-level `:hover` shortcut stealing is eliminated in `DatabaseView.ts:1206-1229, 1430-1440`, deferring to `InteractionScope.ts`.
- [ ] CHK-019 [P0] Double-tap zoom delay is eliminated across table, board, and gallery views via `touch-action: manipulation` (`styles.css:124, 4065-4080`).
- [ ] CHK-020 [P0] Dynamic group collapse disclosure (`aria-expanded="true|false"`, `aria-controls`) is verified across Table, Board, Gallery, List, and Timeline views.
- [ ] CHK-021 [P1] Visually hidden `aria-live="polite"` status region announces search, filter, and sort result changes in real time.
- [ ] CHK-022 [P1] Dialog focus trapping (`Tab`/`Shift+Tab` cycle, `Escape` return) is active across all popovers, drawers, and modal sheets.
- [ ] CHK-023 [P1] Timeline date range announcements and 44px jump button touch envelopes are operable across all screen sizes.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-024 [P0] Display-only invariant: Zero note frontmatter or markdown body writes occur during mobile interaction, touch gestures, or ARIA attribute injection.
- [ ] CHK-025 [P0] No telemetry, external network requests, CDNs, or remote font/icon dependencies are introduced.
- [ ] CHK-026 [P0] All touch gesture listeners use passive event bindings to preserve 60fps native scrolling performance.
- [ ] CHK-027 [P0] MIT license compatibility preserved across all new utilities.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-028 [P1] This phase's accessibility announcements and screen-reader status strings use the `t()` helper in `src/i18n.ts`; Phase 003 owns bottom-sheet action strings.
- [ ] CHK-029 [P1] High-contrast `@media (forced-colors: active)` system keywords (`ButtonText`, `Highlight`, `CanvasText`, `GrayText`) and portal-wide reduced-motion rules are documented in `styles.css`.
- [ ] CHK-030 [P1] Code comments explain non-obvious `visualViewport` coordinate math, long-press timer thresholds, and interaction scope ownership lifecycles.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-031 [P0] `TouchEnvironment.ts` is placed in `src/data/` and `InteractionScope.ts` is placed in `src/views/`.
- [ ] CHK-032 [P0] Styles owned by this phase are cleanly scoped under `.note-database-container` and `@media (forced-colors: active)` in `styles.css`; bottom-sheet styles remain owned by Phase 003.
- [ ] CHK-033 [P0] Isolated rebase-clean diff with zero unintentional changes to database query engines or formula parsers.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 4 | 0/4 | 0 |
| Code Quality & Architecture | 6 | 0/6 | 0 |
| Testing & Verification | 7 | 0/7 | 0 |
| Fix Completeness & Parity | 6 | 0/6 | 0 |
| Security & Data Safety | 4 | 0/4 | 0 |
| Documentation & I18N | 3 | 0/3 | 0 |
| File Organization | 3 | 0/3 | 0 |
| Protocol Compliance | 2 | 0/2 | 0 |
| **Total** | **35** | **0/35** | **0** |

**Verification Date**: Planned (Unexecuted)
**Verification**: Pre-implementation audit complete; all checklist items pending execution.

<!-- /ANCHOR:summary -->
