---
title: "Task Breakdown: Mobile Table and Panel UX"
description: "Task breakdown for the mobile layout fix: the four-area audit, the is-phone container reset, the table select-column and auto-fit rules, the list card fit, the board header, the record bottom-sheet close/pointer/drag work, the touch hover gates, the reproduction scenarios and the stylesheet/source regression suite."
trigger_phrases:
  - "mobile table and panel ux tasks"
  - "is-phone layout task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/011-mobile-table-and-panel-ux"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored task breakdown and verification checklist"
    next_safe_action: "None; gates green, packet complete"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-011"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Mobile Table and Panel UX

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Notation | Meaning |
|---|---|
| `[S]` | Small task (< 30 min) |
| `[M]` | Medium task (30–90 min) |
| `[L]` | Large task (> 90 min) |
| `- [ ]` | Incomplete |
| `- [x]` | Completed |

**Task Format**: `T### [S/M/L] Description (evidence)`

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [M] Audit four areas read-only — table (`TableRenderer.ts`, `TableLayout.ts`, `ColumnWidth.ts`, `TableColumnLayoutSync.ts`), record panel (`RecordDetailPanel.ts`, `PopoverPosition.ts`), list/board (`ListRenderer.ts`, `BoardRenderer.ts`) and the harness/hover surface — to separate the one systemic cause from six symptoms (REQ-001..REQ-009)
- [x] T002 [S] Confirm the systemic cause: `db-width-default` centring (`styles.css:536-540`) with no `is-phone` reset, over `max-content` roots and rigid `flex: 0 0 150px`/`280px` children (`9489`, `9584`, `8263`, `8273`) (REQ-007)
- [x] T003 [S] Confirm the record panel already renders a bottom sheet + grab handle via `positionToolbarPopover` (`PopoverPosition.ts:29-42`), so only the dismissal (close button, pointer, drag) is missing — reconciling the operator's anchored-panel screenshot as pre-dating that infra (REQ-003)
- [x] T004 [S] Confirm the existing "views" fixtures omit `db-width-default`/select-column/real list structure, so the harness photographs clean while the device breaks — new realistic fixtures are required (REQ-009)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T005 [S] Systemic container reset on the phone (`styles.css:17672`) (REQ-007)
- [x] T006 [S] Drop the fade mask on the phone table-wrap (`styles.css:17683`) (REQ-001)
- [x] T007 [S] Pin the phone select checkbox `position: absolute; right: 6px` on header and rows (`styles.css:17690`) (REQ-001)
- [x] T008 [M] Phone table auto-fit: `table-layout: auto`, release inline table/`<col>` widths with `!important`, cap data cells at `max-width: 60vw` with `white-space: nowrap` (`styles.css:17711`) (REQ-002)
- [x] T009 [M] Phone list card fit: constrain the row chain to `width: 100%`, wrap the meta row, let fields shrink (`styles.css:17734`) (REQ-004)
- [x] T010 [S] Take the board group header out of sticky flow on the phone (`styles.css:17766`) (REQ-005)
- [x] T011 [M] Record panel close button reusing `db-cell-edit-close`, shown only in the sheet (`RecordDetailPanel.ts:198`, `styles.css:17776`) (REQ-003)
- [x] T012 [S] Move outside-dismissal from `mousedown` to `pointerdown` (`RecordDetailPanel.ts:138, 244`) (REQ-003)
- [x] T013 [M] `attachSheetDragToDismiss` — drag the grab handle down past 96px to dismiss (`RecordDetailPanel.ts:255`) (REQ-003)
- [x] T014 [S] `box-sizing: border-box !important` on `.db-mobile-bottom-sheet` (`styles.css:195`) (REQ-008)
- [x] T015 [M] Gate the six load-bearing hover rules in `@media (hover: hover)` (`styles.css:5281, 8572, 8747, 8950, 9513`) (REQ-006)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T016 [M] Add `table-mobile`, `list-mobile`, `board-mobile` scenarios with the realistic runtime DOM + `db-width-default` (`core.mjs`) (REQ-009)
- [x] T017 [S] Add `panel-record-detail-sheet` bottom-sheet scenario, `capture: "viewport"` (`panels.mjs`) (REQ-009)
- [x] T018 [M] Add `MobileTableAndPanelUx.test.ts` asserting the phone rules, hover gates and renderer pointer/close/drag wiring (REQ-009)
- [x] T019 [M] Capture the new scenarios at phone width, eyeball the PNGs; the box-sizing fix (T014) came from this loop
- [x] T020 [S] Full recapture + whole gate (tsc, build, vitest, screenshots, verify)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No blocked tasks remaining
- [x] Whole gate green from the final state

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:cross-refs -->
---

## Verification Checklist

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

- [x] CHK-001 [P0] Requirements documented in `spec.md` (9 requirements, 6 P0 / 3 P1)
- [x] CHK-002 [P0] Technical approach defined in `plan.md` (one is-phone divergence layer + panel dismissal)
- [x] CHK-003 [P1] Systemic root cause confirmed against source before any edit (`db-width-default` centring + max-content/rigid children)

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` exit 0 from the final state
- [x] CHK-011 [P0] `npm run build` exit 0 from the final state (`main.js` rebuilt)
- [x] CHK-012 [P1] Every layout rule is `is-phone`-scoped or a `@media (hover: hover)` gate; desktop untouched (verified in `table-mobile-desktop-*.png` and by selector inspection)
- [x] CHK-013 [P1] Comments carry the durable WHY only; no spec/requirement/task ids in code (`styles.css` block header, `RecordDetailPanel.ts` gesture doc)
- [x] CHK-014 [P1] `!important` used only to release inline JS-set widths and the sheet box-sizing, matching the repo's existing host-override precedent

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] `MobileTableAndPanelUx.test.ts` — 10 assertions pass (`npx vitest run`)
- [x] CHK-021 [P0] Whole suite green: 50 files, 396 tests (was 49/386; +1 file, +10 tests)
- [x] CHK-022 [P0] The four new mobile PNGs eyeballed: select column unclipped and aligned, columns hug content, list cards contained, board header at column top, bottom sheet with grab handle + close button
- [x] CHK-023 [P1] Existing mobile captures re-eyeballed for no regression (`table-view-mobile` columns now hug content; no view broke)
- [x] CHK-024 [P1] `npm run screenshots:verify` clean at 196 entries (was 180; +16 for four new scenarios × 2 devices × 2 themes)
- [x] CHK-025 [P1] `ScreenshotFixtures.test.ts` class guard passes: no invented `.db-*` class in the new fixtures

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class recorded: this is a `class-of-bug` (one systemic centring/width cause) with six `instance` symptoms, plus one `instance-only` input bug (mouse-only dismissal)
- [x] CHK-FIX-002 [P0] Same-class producer inventory: every view root that grows to `max-content` or a rigid fixed width was inventoried (table, list grouped/group/row/main/meta, board) and each given an is-phone constraint
- [x] CHK-FIX-003 [P0] Consumer inventory: the reused `db-cell-edit-close` class is styled panel-scoped without touching its `.db-cell-edit-popover` rule; the `mousedown`→`pointerdown` swap keeps the same handler and teardown
- [x] CHK-FIX-004 [P0] Not a security/path/parser fix — no adversarial table tests required; the layout bound (`table-layout: auto` + 60vw cap) is stated and verified against the long-value fixture
- [x] CHK-FIX-005 [P1] Reproduction matrix: 4 surfaces × phone device × 2 themes captured and, for the visible defects, eyeballed
- [x] CHK-FIX-006 [P1] Not process/global-state dependent
- [x] CHK-FIX-007 [P1] Evidence pinned to the shipped tree (stylesheet line refs and the regenerated 196-entry manifest), not a moving range

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets; no network, telemetry or remote dependency
- [x] CHK-031 [P0] No input parsing added; the drag gesture reads only pointer coordinates
- [x] CHK-032 [P1] Display-only: zero writes to note frontmatter or bodies; iCloud-safe

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] `spec.md` / `plan.md` / `tasks.md` / `implementation-summary.md` synchronized; parent phase-map row set to Complete
- [x] CHK-041 [P1] Code comments explain the WHY (mask clip, sticky-header containing block, auto-fit bound, sheet box-sizing)
- [x] CHK-042 [P2] `screenshots/README.md` regenerated by the full capture

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] No temp files created outside `scratch/`; `git status` shows only source, fixtures, test, regenerated screenshots and docs
- [x] CHK-051 [P1] `scratch/` untouched (only `.gitkeep`)

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|---|---|---|
| P0 Items | 12 | 12/12 |
| P1 Items | 14 | 14/14 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-28

<!-- /ANCHOR:summary -->
