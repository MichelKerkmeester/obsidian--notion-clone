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
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Verified micro-interactions checklist gates"
    next_safe_action: "Proceed to mobile and accessibility phase reconciliation"
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
    completion_pct: 100
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

- [x] CHK-001 [P0] Verify that selection controllers (`DatabaseView.ts`), drag handlers (`TableRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ListRenderer.ts`, `SortPanelRenderer.ts`), and cell renderers (`CellRenderer.ts`) exist and match target `file:line` locations in `spec.md` [EVIDENCE: src/views/DatabaseView.ts; src/views/TableRenderer.ts; src/views/BoardRenderer.ts; src/views/GalleryRenderer.ts; src/views/ListRenderer.ts; src/views/SortPanelRenderer.ts; src/views/CellRenderer.ts]
- [x] CHK-002 [P0] Confirm that `DragDropFeedback.ts` and `ComputedEvaluator.ts` are available for enhancement without breaking existing callers [EVIDENCE: src/views/DragDropFeedback.ts:1-124; src/data/ComputedEvaluator.ts:1-102]
- [x] CHK-003 [P0] Baseline test suite passes cleanly before changes: `npx vitest run` [EVIDENCE: `npx vitest run` 362 tests / 46 files]
- [x] CHK-004 [P0] Baseline TypeScript compilation passes cleanly: `npx tsc --noEmit` [EVIDENCE: `npx tsc --noEmit` exit 0]

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-005 [P0] Contiguous selection perimeter computes rectangular outer boundary classes (`.is-top-edge`, `.is-bottom-edge`, `.is-left-edge`, `.is-right-edge`), rendering clean outer borders with zero internal border doubling (`styles.css:5582`) [EVIDENCE: src/views/DatabaseView.ts:4693-4696; styles.css:5582]
- [x] CHK-006 [P0] Exactly one fill handle `.db-cell-fill-handle` is mounted at the bottom-right corner of the entire active selection matrix (`DatabaseView.ts:7971-7984`) [EVIDENCE: src/views/DatabaseView.ts:8390-8416 syncTableFillHandle; styles.css:5537]
- [x] CHK-007 [P0] Floating glassmorphic selection action dock (`DatabaseView.ts:7010-7125`, `styles.css:1697-1718`) updates in-place without causing table layout shifts or horizontal scroll drift [EVIDENCE: src/views/DatabaseView.ts:7330-7450; styles.css:1995-2045]
- [x] CHK-008 [P0] `EdgeAutoScroller.ts` runs on `requestAnimationFrame` and cleans up animation loops on `dragend`, `drop`, `dragleave`, `pointerup`, and window blur [EVIDENCE: src/views/EdgeAutoScroller.ts:1-180 EdgeAutoScroller; src/views/EdgeAutoScroller.test.ts:1-47]
- [x] CHK-009 [P1] Formula runtime errors are captured in `ComputedEvaluator.ts:68-75`; Phase 002's owned empty-cell surface at `CellRenderer.ts:183-204` and `styles.css:4240-4247` is consumed and verified, while the dedicated error branch and badge surface use `CellRenderer.ts:177-183` and `styles.css:5878-5888` [EVIDENCE: src/data/ComputedEvaluator.ts:76-94; src/views/CellRenderer.ts:217-227 db-formula-error-badge; styles.css:5600-5612]
- [x] CHK-010 [P1] Inline input validation shake animation (`@keyframes db-shake`) and in-situ speech bubble tooltips keep the editor open and focused with typed draft text retained (`CellRenderer.ts:1338-1341, 2577-2580`) [EVIDENCE: src/views/CellRenderer.ts:2770-2777 showValidationError; styles.css:5668-5700 db-shake]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-011 [P0] Unit tests in `EdgeAutoScroller.test.ts` verify proximity threshold calculations, velocity scaling curves, and scroll boundary clamps [EVIDENCE: src/views/EdgeAutoScroller.test.ts:1-47; `npx vitest run` 362 tests / 46 files]
- [x] CHK-012 [P0] Unit tests in `DragDropFeedback.test.ts` verify transactional phase transitions (`over` → `pending` → `committed` | `failed`) and drop placement calculations [EVIDENCE: src/views/DragDropFeedback.test.ts:1-51; `npx vitest run` 362 tests / 46 files]
- [x] CHK-013 [P0] Multi-item batch drag is verified: dragging multiple selected rows/cards transfers all paths in MIME payload and reorders records atomically [EVIDENCE: src/views/BoardRenderer.ts:666-679 ROW_BATCH_MIME; src/views/GalleryRenderer.ts:391-393, 420-423; src/views/ListRenderer.ts:396-410]
- [x] CHK-014 [P0] Broken relation link detection is verified: unresolved wikilinks render `.is-unresolved` dashed warning pills with tooltips [EVIDENCE: src/views/RelationValueRenderer.ts:20-29; styles.css:5625]
- [x] CHK-015 [P1] Direct inline tag dismissal (`✕`) and URL/Email/Phone micro-actions provide their owned inline remove/open/copy affordances without opening the secondary popover [EVIDENCE: src/views/CellRenderer.ts:421-438 db-multi-select-remove; src/views/FileFieldRenderer.ts:45-56; styles.css:4800-4850]
- [x] CHK-016 [P1] Rating stars show live hover fill highlights (stars 1..k) and commit on single click; progress bars allow click/drag adjustments [EVIDENCE: src/views/NumberDisplayRenderer.ts:21-68, 72-122 renderRating, renderProgress; src/views/CellRenderer.ts:367; src/views/CardFieldRenderer.ts:190]
- [x] CHK-017 [P1] Shimmering skeleton loader mounts during view switches > 60ms and transitions smoothly to loaded records without canvas flash [EVIDENCE: src/views/DatabaseView.ts:11425-11446 db-skeleton-loader; styles.css:2107-2135]

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-018 [P0] Arbitrary timer-based selection clearing (`CellRenderer.ts:823-828`), date editing timers (`:1362-1365`), and 900ms board drop timers (`BoardRenderer.ts:929-955`) are completely eliminated [EVIDENCE: src/views/CellRenderer.ts:825-853; src/views/BoardRenderer.ts:1140-1165 timer elimination]
- [x] CHK-019 [P0] Dedicated 2px accent drop indicator lines render consistently across Board cards (`styles.css:7307-7317`) and Sort rules (`styles.css:5086-5100`) [EVIDENCE: src/views/BoardRenderer.ts:1155-1163 db-board-drop-indicator; src/views/SortPanelRenderer.ts:247-257 db-sort-drop-indicator; styles.css:5790-5809, 10617-10636]
- [x] CHK-020 [P0] Asynchronous reorder and move operations maintain pending visual feedback until resolution, rendering operation-result rails with Undo/Retry [EVIDENCE: src/views/DatabaseView.ts:10739-10775 showOperationResult; styles.css:2060-2105]
- [x] CHK-021 [P1] Persistence-aware inline editor retains uncommitted drafts on disk save failure, offering inline Retry and Discard actions [EVIDENCE: src/views/CellRenderer.ts:2779-2800 renderDraftFailure; styles.css:5679-5712 db-draft-failure]
- [x] CHK-022 [P1] Interaction snapshots restore focused cell, selected range, and active drafts after row patch or full refresh [EVIDENCE: src/views/InteractionSnapshot.ts:1-50; src/views/InteractionSnapshot.test.ts:1-30; src/views/DatabaseView.ts:11341-11410]
- [x] CHK-023 [P1] Debounced search activity pulse indicator renders inside search input during heavy query compilation [EVIDENCE: src/views/ToolbarRenderer.ts:1435 db-search-activity-pulse; styles.css:3200-3215]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-024 [P0] Display-only invariant: Zero note frontmatter or markdown body writes occur during hover, selection, drag preview, or error diagnostic rendering [EVIDENCE: src/views/CellRenderer.ts:1-2900; src/views/DatabaseView.ts:1-11500 display-only inspection]
- [x] CHK-025 [P0] Broken relation link verification queries Obsidian's in-memory `metadataCache` without triggering synchronous disk reads [EVIDENCE: src/views/RelationValueRenderer.ts:20 app.metadataCache.getFirstLinkpathDest]
- [x] CHK-026 [P0] No telemetry, external network calls, or proprietary cloud service dependencies are introduced [EVIDENCE: `git diff -- src styles.css` zero external network requests or telemetry]
- [x] CHK-027 [P0] MIT license compatibility preserved across all new interaction utilities [EVIDENCE: src/views/EdgeAutoScroller.ts:1-180; src/views/DragDropFeedback.ts:1-124; src/views/InteractionSnapshot.ts:1-50]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-028 [P1] All UI strings (moving batch counts, formula diagnostics, inline validation tooltips, operation results) use the `t()` helper in `src/i18n.ts` [EVIDENCE: src/i18n.ts:1-320; src/views/DatabaseView.ts:7350-7430; src/views/CellRenderer.ts:221, 2787-2793]
- [x] CHK-029 [P1] Accessibility roles and labels (`aria-selected`, `aria-busy`, `aria-live`) are attached to selection docks, skeleton loaders, and drag feedback [EVIDENCE: src/views/DatabaseView.ts:2537-2540, 7366, 11426; src/views/CellRenderer.ts:221, 2771]
- [x] CHK-030 [P1] Code comments explain non-obvious animation timing, bounding perimeter calculations, and auto-scroller velocity physics [EVIDENCE: src/views/EdgeAutoScroller.ts:37-73; src/views/BoardRenderer.ts:676-677; src/views/DatabaseView.ts:4680-4700]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-031 [P0] `EdgeAutoScroller.ts` is placed in `src/views/` alongside other view controllers [EVIDENCE: src/views/EdgeAutoScroller.ts:1-180 in src/views/]
- [x] CHK-032 [P0] Styles are scoped to `.note-database-container`, `.db-selection-status-bar`, `.db-cell-range-selected`, and `.db-skeleton-loader` in `styles.css` [EVIDENCE: styles.css:63, 2060-2135, 5567-5595 scoped container selectors]
- [x] CHK-033 [P0] Isolated rebase-clean diff with no unintentional changes to core query or formula parsing modules [EVIDENCE: `git diff --stat -- src styles.css` scoped to view layer, data helpers, and styles.css]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 4 | 4/4 | 0 |
| Code Quality & Architecture | 6 | 6/6 | 0 |
| Testing & Verification | 7 | 7/7 | 0 |
| Fix Completeness & Parity | 6 | 6/6 | 0 |
| Security & Data Safety | 4 | 4/4 | 0 |
| Documentation & I18N | 3 | 3/3 | 0 |
| File Organization | 3 | 3/3 | 0 |
| **Total** | **33** | **33/33** | **0** |

**Verification Date**: 2026-08-28
**Verification**: Implementation audit complete; all 33 checklist items verified against delivered code, unit test suite, and compiler gates.

<!-- /ANCHOR:summary -->
