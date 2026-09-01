---
title: "Implementation Plan: Mobile Table and Panel UX"
description: "How the phone-wide layout failure is fixed as one root cause: an is-phone container reset that stops the desktop centring throwing content off-screen, then per-view phone divergences (table select-column + auto-fit, list card fit, board header, record bottom-sheet dismissal), touch hover gating, and realistic is-phone reproduction scenarios plus a stylesheet/source regression suite."
trigger_phrases:
  - "mobile table and panel ux plan"
  - "is-phone layout correction plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/011-mobile-table-and-panel-ux"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan from the systemic root-cause reading"
    next_safe_action: "Execute phases; run gates"
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
# Implementation Plan: Mobile Table and Panel UX

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**One root cause, one strategy.** The six defects are facets of a single failure: desktop views are authored for a wide horizontally-scrollable canvas and the container keeps its desktop centring on a phone. So the plan is not six patches; it is one `is-phone`-scoped divergence layer added on top of the untouched desktop CSS, plus one touch-input fix in the record panel.

The order matters. The **systemic container reset** comes first, because the off-screen-left symptom in the list and the off-centre board both trace to `.note-database-container.db-width-default`'s auto side margins distributing overflow. With that neutralised on the phone, each view's remaining defect is local: the table needs its mask dropped and its columns auto-fitted, the list needs its rigid fields to wrap, the board needs its sticky header taken out of flow, and the record panel needs a touch-reachable dismissal.

**Reproduce before fixing.** The existing "views" fixtures render a bare `.note-database-container` without the runtime `db-width-default` class, without the select column and (for the list) without the real `.db-list-row-meta`/`.db-list-field` structure — so they photograph *clean* on the mobile pass while the device is broken. The plan adds realistic `is-phone` fixtures that carry the runtime DOM, so the harness actually reproduces the bug and then confirms the fix. The board's header-over-cards overlap is a scroll-position artifact the static harness cannot show; that one is verified by CSS assertion and reasoning, and the limitation is recorded.

**Bound the table auto-fit explicitly.** `table-layout: auto` is chosen over recomputing per-column widths in JS: it is the browser's native "hug content" and it is intrinsic-content sized, so it cannot reproduce the colgroup-less fixed-layout runaway the HANDOVER records. Each data cell also carries `max-width: 60vw` as a best-effort cap.

<!-- /ANCHOR:summary -->
<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Run from the worktree; read output and exit status, never `$?` through a pipe.

| Gate | Baseline | Required |
|------|----------|----------|
| `npx tsc --noEmit` | 0 | 0 |
| `npm run build` | 0 | 0 |
| `npx vitest run` | 386 passing | no fewer; new coverage may raise it |
| `npm run screenshots:verify` | 180 entries current | all current, including new scenarios |
| `npm run lint` | 115 problems (100 errors, 15 warnings) | no increase — this is a known baseline, not a target |

A capture that succeeds is not proof. Open the changed PNGs and look at them.
<!-- /ANCHOR:quality-gates -->

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Systemic container reset (REQ-007)
`.is-phone .note-database-container.db-width-default { max-width: none; margin-left: 0; margin-right: 0 }` (`styles.css:17672`). The class is on the container itself (`DatabaseView.ts:2629`), so a single rule releases the centring for every view.

### Table (REQ-001, REQ-002)
- Drop the fade mask on the phone table-wrap so the leftmost select column is not clipped (`styles.css:17683`).
- Pin the select checkbox `position: absolute; right: 6px` on header and rows, overriding the coarse-pointer in-flow fallback that misaligned them (`17690`).
- `table-layout: auto`, `width: auto !important`, `min-width: 0 !important` on `.db-table`, and `width: auto !important` on `col[data-note-database-column-key]`, releasing the inline JS-set widths; data cells `white-space: nowrap; max-width: 60vw; overflow: hidden; text-overflow: ellipsis` (`17711`).

### List (REQ-004)
Constrain the grouped/group/row/main/meta chain to `width: 100%; min-width: 0; max-width: 100%`; change the row grid's second track to `minmax(0, 1fr)`; `flex-wrap: wrap; overflow: hidden` on the meta row; `flex: 1 1 …; min-width: 0; max-width: 100%` on the field (`styles.css:17734`).

### Board (REQ-005)
`.is-phone .note-database-container .db-board-column-header { position: relative; top: auto }` (`styles.css:17766`) — out of sticky flow, still positioned so the `::before` background anchors to it.

### Record detail bottom sheet (REQ-003, REQ-008)
`positionToolbarPopover` already renders the sheet + grab handle on the phone; the plan adds the missing dismissal:
- A permanent header close button reusing `db-cell-edit-close`, shown only in the sheet via CSS (`RecordDetailPanel.ts:198`, `styles.css:17776`).
- `mousedown`→`pointerdown` for the outside handler (`RecordDetailPanel.ts:138, 244`).
- `attachSheetDragToDismiss` on the grab handle: pointerdown/move/up with a translate-follow and a 96px threshold (`RecordDetailPanel.ts:255`).
- `box-sizing: border-box !important` on `.db-mobile-bottom-sheet` so its padding does not overflow the viewport width without the runtime inline box-sizing (`styles.css:195`).

### Hover gating (REQ-006)
Wrap the six load-bearing hover rules in `@media (hover: hover)`, the repo's existing pattern (`styles.css:5281, 8572, 8747, 8950, 9513`).

### Reproduction & regression (REQ-009)
Four `is-phone` scenarios with the realistic runtime DOM (`core.mjs` table/list/board, `panels.mjs` sheet with `capture: "viewport"`), and `MobileTableAndPanelUx.test.ts` asserting the shipped stylesheet and the renderer source.

<!-- /ANCHOR:architecture -->
<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

1. Audit four areas (table, panel, list/board, harness+hover) to separate the one cause from six symptoms and real bugs from harness stand-ins.
2. Container reset + table + list + board + hover CSS.
3. Record panel: close button, pointer dismissal, drag gesture; bottom-sheet box-sizing.
4. Reproduction scenarios; regression suite.
5. Capture the new scenarios at phone width, eyeball the PNGs, iterate (the box-sizing fix came from this loop).
6. Full recapture (styles.css invalidated all captures), then the whole gate.

<!-- /ANCHOR:phases -->
<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

- **Visual**: `table-mobile`, `list-mobile`, `board-mobile`, `panel-record-detail-sheet` at phone width — eyeballed, not just captured.
- **Regression suite**: `MobileTableAndPanelUx.test.ts` asserts the phone rules, the hover gates and the renderer's pointer/close/drag wiring against the shipped tree.
- **Whole gate**: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots`, `npm run screenshots:verify`.
- **Honest gaps**: the board header-over-cards overlap (scroll artifact) and the drag/pointer gestures (JS, not visible in a static shot) are verified by assertion and reasoning, not by a screenshot.

<!-- /ANCHOR:testing -->
<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

- Obsidian supplies the `is-phone` body class; every mobile rule keys off it. A narrow viewport
  without it is only a cramped desktop.
- Pointer-capability rules use `@media (hover:)`, which the stylesheet already uses elsewhere. That
  is a different question from `is-phone` and the two must not be conflated.
- The capture harness needs a system Chrome. It renders fixture markup, not the real renderers, so
  it cannot prove the plugin emits this markup — only the device can.
- `setCssProps` is required for dynamic style writes; direct `element.style.*` assignment is
  rejected by the repository's Obsidian lint rule.
<!-- /ANCHOR:dependencies -->

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

The work is isolated in its own worktree and branch, so the whole change reverts by deleting the
worktree without touching `impl`. Within the worktree, the stylesheet and renderer changes are
independent: the bottom sheet lives in one renderer plus its scoped rules, and the hover suppression
is additive `@media (hover:)` wrapping that can be reverted alone. Regenerating captures with
`npm run screenshots` restores the manifest after any revert.
<!-- /ANCHOR:rollback -->

## 8. CROSS-REFERENCES

- **Specification**: See `spec.md`
- **Task Breakdown**: See `tasks.md`
- **Implementation Summary**: See `implementation-summary.md`
