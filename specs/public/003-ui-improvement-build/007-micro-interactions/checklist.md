---
title: "Quality Checklist: Micro-Interactions, Sensory Feedback & Selection Surfaces"
description: "Pre-implementation quality assurance checklist for phase 007: contiguous selection perimeter, single corner fill handle, floating glassmorphic selection dock, multi-item batch drag, EdgeAutoScroller, formula diagnostic badges, inline validation shake, broken relation warning pills, hover tag dismissal, shimmering skeleton loader, interactive rating/progress tracks, drop indicator lines, transactional DragDropFeedbackState, persistence-aware editor lifecycle, and refresh snapshots."
trigger_phrases:
  - "micro-interactions checklist"
  - "selection bounding perimeter checklist"
  - "floating selection dock checklist"
  - "batch drag count badge checklist"
  - "edge auto scroller checklist"
  - "formula error diagnostic badge checklist"
  - "inline validation shake checklist"
  - "broken relation pill checklist"
  - "direct tag dismissal checklist"
  - "interactive rating progress checklist"
  - "drag drop feedback state checklist"
  - "persistence aware inline editor checklist"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/007-micro-interactions"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Authored quality checklist for micro-interactions and feedback phase"
    next_safe_action: "Execute checklist items during phase 007 implementation"
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
# Quality Checklist: Micro-Interactions, Sensory Feedback & Selection Surfaces

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

- [ ] CHK-001 [P0] Verify that selection controllers (`DatabaseView.ts`), drag handlers (`TableRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `SortPanelRenderer.ts`), and cell renderers (`CellRenderer.ts`) exist and match target `file:line` locations in `spec.md`.
- [ ] CHK-002 [P0] Confirm that `DragDropFeedback.ts` and `ComputedEvaluator.ts` are available for enhancement without breaking existing callers.
- [ ] CHK-003 [P0] Baseline test suite passes cleanly before changes: `npx vitest run`.
- [ ] CHK-004 [P0] Baseline TypeScript compilation passes cleanly: `npx tsc --noEmit`.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-005 [P0] Contiguous selection perimeter computes rectangular outer boundary classes (`.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, `.is-right-edge`), rendering clean outer borders with zero internal border doubling (`styles.css:5004-5020`).
- [ ] CHK-006 [P0] Exactly one fill handle `.db-cell-fill-handle` is mounted at the bottom-right corner of the entire active selection matrix (`DatabaseView.ts:7971-7984`).
- [ ] CHK-007 [P0] Floating glassmorphic selection action dock (`DatabaseView.ts:7010-7125`, `styles.css:1697-1718`) updates in-place without causing table layout shifts or horizontal scroll drift.
- [ ] CHK-008 [P0] `EdgeAutoScroller.ts` runs on `requestAnimationFrame` and cleans up animation loops on `dragend`, `drop`, `dragleave`, `pointerup`, and window blur.
- [ ] CHK-009 [P1] Formula runtime errors are captured in `ComputedEvaluator.ts:68-75`; Phase 002's owned empty-cell surface at `CellRenderer.ts:183-204` and `styles.css:4240-4247` is consumed and verified, while the dedicated error branch and badge surface use `CellRenderer.ts:177-183` and `styles.css:5878-5888`.
- [ ] CHK-010 [P1] Inline input validation shake animation (`@keyframes db-shake`) and in-situ speech bubble tooltips keep the editor open and focused with typed draft text retained (`CellRenderer.ts:1338-1341, 2577-2580`).

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-011 [P0] Unit tests in `EdgeAutoScroller.test.ts` verify proximity threshold calculations, velocity scaling curves, and scroll boundary clamps.
- [ ] CHK-012 [P0] Unit tests in `DragDropFeedback.test.ts` verify transactional phase transitions (`over` → `pending` → `committed` | `failed`) and drop placement calculations.
- [ ] CHK-013 [P0] Multi-item batch drag is verified: dragging multiple selected rows/cards transfers all paths in MIME payload and reorders records atomically.
- [ ] CHK-014 [P0] Broken relation link detection is verified: unresolved wikilinks render `.is-unresolved` dashed warning pills with tooltips.
- [ ] CHK-015 [P1] Direct inline tag dismissal (`✕`) and URL/Email/Phone micro-actions provide their owned inline remove/open/copy affordances without opening the secondary popover.
- [ ] CHK-016 [P1] Rating stars show live hover fill highlights (stars 1..k) and commit on single click; progress bars allow click/drag adjustments.
- [ ] CHK-017 [P1] Shimmering skeleton loader mounts during view switches > 60ms and transitions smoothly to loaded records without canvas flash.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-018 [P0] Arbitrary timer-based selection clearing (`CellRenderer.ts:823-828`), date editing timers (`:1362-1365`), and 900ms board drop timers (`BoardRenderer.ts:929-955`) are completely eliminated.
- [ ] CHK-019 [P0] Dedicated 2px accent drop indicator lines render consistently across Board cards (`styles.css:7307-7317`) and Sort rules (`styles.css:5086-5100`).
- [ ] CHK-020 [P0] Asynchronous reorder and move operations maintain pending visual feedback until resolution, rendering operation-result rails with Undo/Retry.
- [ ] CHK-021 [P1] Persistence-aware inline editor retains uncommitted drafts on disk save failure, offering inline Retry and Discard actions.
- [ ] CHK-022 [P1] Interaction snapshots restore focused cell, selected range, and active drafts after row patch or full refresh.
- [ ] CHK-023 [P1] Debounced search activity pulse indicator renders inside search input during heavy query compilation.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-024 [P0] Display-only invariant: Zero note frontmatter or markdown body writes occur during hover, selection, drag preview, or error diagnostic rendering.
- [ ] CHK-025 [P0] Broken relation link verification queries Obsidian's in-memory `metadataCache` without triggering synchronous disk reads.
- [ ] CHK-026 [P0] No telemetry, external network calls, or proprietary cloud service dependencies are introduced.
- [ ] CHK-027 [P0] MIT license compatibility preserved across all new interaction utilities.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-028 [P1] All UI strings (moving batch counts, formula diagnostics, inline validation tooltips, operation results) use the `t()` helper in `src/i18n.ts`.
- [ ] CHK-029 [P1] Accessibility roles and labels (`aria-selected`, `aria-busy`, `aria-live`) are attached to selection docks, skeleton loaders, and drag feedback.
- [ ] CHK-030 [P1] Code comments explain non-obvious animation timing, bounding perimeter calculations, and auto-scroller velocity physics.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-031 [P0] `EdgeAutoScroller.ts` is placed in `src/views/` alongside other view controllers.
- [ ] CHK-032 [P0] Styles are scoped to `.note-database-container`, `.db-selection-status-bar`, `.db-cell-range-selected`, and `.db-skeleton-loader` in `styles.css`.
- [ ] CHK-033 [P0] Isolated rebase-clean diff with no unintentional changes to core query or formula parsing modules.

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
