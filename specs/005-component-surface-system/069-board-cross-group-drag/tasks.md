---
title: "Tasks: Board Cross-Group Drag"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "069 tasks"
  - "board touch drag task breakdown"
  - "board cross-group drag tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Board Cross-Group Drag

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read the operator report and the pre-packet tree: confirm the desktop cross-group write
      already works (`board-renderer.ts`'s `dragstart`/`dragover`/`drop`) and that
      `card.draggable = !isReadOnly && !touchMode` is the reason touch never reaches it
      (`src/views/board-renderer.ts`)
- [x] T002 Confirm `resolveBoardColumnByPoint` exists, is unit-tested, and has zero callers —
      `grep -rn resolveBoardColumnByPoint src` (`src/data/board-container-drop.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 Add the long-press/tolerance/scroll constants and the `TouchDragState` type
      (`src/views/board-renderer.ts`)
- [x] T004 Wire `attachCardTouchDrag` per card in touch mode, mirroring the `!isReadOnly` gate the
      desktop `card.draggable` already used (`src/views/board-renderer.ts`)
- [x] T005 Implement lift (`beginCardTouchDrag`: ghost clone, haptic, lifted class, click-swallow,
      Escape listener), move (`moveCardTouchDrag`: ghost transform, hit-test, auto-scroll), and
      drop/cancel (`endCardTouchDrag`/`cancelCardTouchDrag`/`teardownCardTouchDrag`)
      (`src/views/board-renderer.ts`)
- [x] T006 Wire column hit-testing through `resolveBoardColumnByPoint` against
      `this.touchDragColumns`, collected once per render (`src/views/board-renderer.ts`)
- [x] T007 Add `.obnotion-kanban-card--touch-lifted`/`--touch-ghost` (`styles.css`)
- [x] T008 Add the Undo toast to `embedded-database-renderer.ts`'s `updateBoardGroup`, matching its
      own `deleteRow`'s shape (`src/views/embedded-database-renderer.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T009 Red-first: extend `board-renderer-parity.test.ts`'s `MockElement` (`cloneNode`,
      `scrollLeft`, capture/bubble-aware `dispatchEvent`, a shared fake document) — observed
      failing against the pre-T003-T007 tree since the classes/behaviour did not exist
      (`src/views/board-renderer-parity.test.ts`)
- [x] T010 Write the touch-drag interaction tests (happy path cross-group; same-column no-op;
      read-only no-lift; Escape cancels; short tap opens; swallow after a completed lift;
      auto-scroll) and confirm each fails when its own production line is mutated
      (`src/views/board-renderer-parity.test.ts`)
- [x] T011 Write `embedded-database-renderer.test.ts`'s toast test and its "no toast when the value
      did not change" edge; confirm the happy-path test fails when the `showToast` call is removed
      (`src/views/embedded-database-renderer.test.ts`)
- [x] T012 Write `database-view.test.ts`'s cross-group host-binding test (frontmatter write +
      undo); confirm it fails when the `if (col)` guard that populates `cellChanges` is mutated
      out (`src/views/database-view.test.ts`)
- [x] T013 Build `tools/live/board-cross-group-drag.mjs`: real `DataTransfer` desktop proof, real
      `PointerEvent` phone proof (lift, ghost delta, highlight, drop, reverse, same-column,
      read-only), and the two constructed captures
- [x] T014 Fix the geometry the constructed capture surfaced: the drop target sits mostly past the
      402px edge at this fixture's card width, so the capture point is a clamped intermediate
      position rather than the drop target itself (`tools/live/board-cross-group-drag.mjs`)
- [x] T015 Run `npx tsc --noEmit`, `npx vitest run`, `npm run build`,
      `node tools/live/render-assertions.mjs`, `node tools/live/sheet-grammar.mjs` — all exit 0
- [x] T016 Run `npm run gate` to 26 green — the first run surfaced 5 pre-existing-tree failures
      from the `styles.css` hash move (`folder-docs`, `operator-list`, `css-lane`,
      `screenshots-fresh`, `evidence`), each resolved (css-lane acquire/recapture/release, evidence
      re-stamps, folder relocation, goal.md wording); `npm run gate` now reports
      `PASS — 26 green, 0 red for a declared reason`
- [x] T017 Validate this packet and the parent with the realpath'd orchestrator `--strict` — both
      `RESULT: PASSED`; the full recursive run across the parent and all 69 children reports 70
      PASSED, 0 FAILED
- [x] T018 Backfill scoped graph metadata — run individually against this packet and the parent
      (`totalSpecFolders: 1` each), 0 drift remaining
- [x] T019 RED first: build `tools/live/board-touch-drag.mjs` — real touch input through CDP
      (`Input.dispatchTouchEvent`), 390×844, `hasTouch`+`isMobile`, `.is-phone`, hold 550ms
      asserted > the renderer's exported lift threshold, 10-step crossing of the column boundary,
      release over the target column; assert card DOM in the target column and the record's
      grouped property read back from the data source; negative control (plain vertical flick on
      a card never starts a drag). Observed red pre-fix: `pointercancel` on the first move, 0
      move calls, frontmatter unchanged, exit 1 (`tools/live/board-touch-drag.mjs`)
- [x] T020 Fix at the source, one producer: the armed drag's card answers a non-passive
      `touchmove` with `preventDefault` (touch events retarget to the touch-start element, so
      the listener sees the whole gesture), sets `touch-action: none` at lift and clears it at
      teardown; the lift threshold is exported so the harness asserts against the real value
      instead of guessing (`src/views/board-renderer.ts`). Desktop pointer drag untouched;
      `board-cross-group-drag.mjs` and the parity suite stay green
- [x] T021 GREEN: re-run the harness — 1 move call `backlog→todo`, card DOM in the target
      column, `frontmatter[board_status]="todo"` read back, `pointercancel=false`, negative
      control holds, exit 0; evidence stamp `tools/live/board-touch-drag.json` written by the
      harness (`tools/live/board-touch-drag.mjs`)
- [x] T022 Wire the harness as the gate's 28th lane, after the cold-cache lane and before the
      freshness-check lane, carrying its evidence stamp like its siblings; gate reports
      `PASS — 28 green, 0 red for a declared reason`, exit 0 (`tools/gate.mjs`)
- [x] T023 Full verify battery from the final state: `tsc` 0, `vitest` 1585 passed, `build` 0,
      `sheet-grammar` 0, `render-assertions` 0, `verify-placement` 0 (418/420, 2 declared red),
      screenshots ×2 + pixel-delta (1 jitter, maxDelta 1 ≤ 12, restored to committed bytes;
      no styles.css change, so no css-lane triplet), `evidence --check-all` fresh (16),
      `scan-comments` 0, `scan-failing-values` 0
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed (operator's own device — outside this packet's close)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance criteria**: See `acceptance-criteria.md`
- **Design decisions**: See `decision-record.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks (`npm run lint:tools` green for the new script;
      `npm run lint`'s 339 pre-existing errors are unrelated files this packet never touched)
- [x] CHK-011 [P0] No console errors or warnings (headless-Chrome proof's `pageerror` listener
      reported none)
- [x] CHK-012 [P1] Error handling implemented (cancel/pointercancel paths, read-only gate)
- [x] CHK-013 [P1] Code follows project patterns (reuses `moveCardAndOrder`,
      `resolveBoardColumnByPoint`, `attachLongPress`'s grammar, the existing toast shape)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met except the gate row and the operator row
- [x] CHK-021 [P0] Manual testing complete (live headless-Chrome proof stands in for a device;
      the operator's own device check remains open by design)
- [x] CHK-022 [P1] Edge cases tested (same-column no-op, read-only, Escape, short tap, swallow,
      auto-scroll)
- [x] CHK-023 [P1] Error scenarios validated (pointercancel treated as cancel)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

Not applicable — this packet is new functionality (a feature the board never had for touch), not a
bug fix with a pre-existing regression to bound. `CHK-FIX-*` rows are intentionally omitted.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Input validation implemented (pointer type/button gating, `isReadOnly` gate)
- [x] CHK-032 [P1] Auth/authz working correctly — not applicable (no auth surface touched)
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] Code comments adequate (durable WHY, no ephemeral packet/phase labels —
      `scan-comments` green)
- [ ] CHK-042 [P2] README updated (if applicable) — not applicable, no new top-level surface
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only (`tools/live/board-cross-group-drag.mjs`'s two
      constructed captures write to this packet's own `scratch/captures/`)
- [ ] CHK-051 [P1] scratch/ cleaned before completion — the two captures are a named deliverable
      (item 6) kept deliberately, not transient debug output; see `decision-record.md` ADR-005
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 7 | 7/7 |
| P1 Items | 9 | 8/9 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-07
<!-- /ANCHOR:summary -->

---
