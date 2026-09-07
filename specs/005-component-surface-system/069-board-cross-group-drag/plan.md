---
title: "Implementation Plan: Board Cross-Group Drag"
description: "Wiring a phone long-press drag onto the board's existing cross-group write path, closing the embedded host's Undo gap, and proving both input devices live in headless Chrome."
trigger_phrases:
  - "069 plan"
  - "board touch drag implementation plan"
  - "board cross-group drag technical approach"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Board Cross-Group Drag

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin (esbuild), Vitest, Playwright (`playwright-core`) against real Chrome |
| **Framework** | None — hand-rolled DOM renderers over the Obsidian API |
| **Storage** | Frontmatter, via `DataSource.updateFrontmatter` |
| **Testing** | Vitest (hand-rolled `MockElement`/`FakeElement` DOM doubles, no jsdom); a standalone Playwright script for real-browser proof |

### Overview
Touch drag is implemented entirely inside `BoardRenderer` as new private methods that attach
pointer listeners per card in touch mode, reusing the existing `moveCardAndOrder` write path and
the pre-existing (but previously unwired) `resolveBoardColumnByPoint` hit-test. The embedded host
gains one `showToast` call. Proof is a mutation-tested vitest suite plus a standalone real-Chrome
script.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented
- [x] Success criteria measurable
- [x] Dependencies identified (none blocking)

### Definition of Done
- [x] All acceptance criteria Met, except the gate row and the operator row
- [x] Tests passing, each new one proven to fail by a mutation
- [x] Docs updated (this packet's spec/plan/tasks/acceptance-criteria/decision-record)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Renderer-owned interaction state (matches the existing desktop drag: no external state manager,
the class itself holds the in-flight drag).

### Key Components
- **`BoardRenderer` touch-drag methods**: `attachCardTouchDrag`, `beginCardTouchDrag`,
  `moveCardTouchDrag`, `endCardTouchDrag`, `cancelCardTouchDrag`, `teardownCardTouchDrag`,
  `updateTouchDragHit`, `updateTouchAutoScroll`/`stopTouchAutoScroll` — the phone counterpart of the
  existing `attachReferenceDropHandlers`/`getReferenceDragAfterElement` desktop pair.
- **`resolveBoardColumnByPoint`** (`src/data/board-container-drop.ts`, pre-existing): the pure
  geometric hit-test both the touch path and a future mouse fallback can share.
- **`embedded-database-renderer.ts`'s `updateBoardGroup`**: now raises the Undo toast.

### Data Flow
`pointerdown` (touch/pen only) → timer → `beginCardTouchDrag` (ghost, haptic, lifted class) →
`pointermove` → `moveCardTouchDrag` (ghost transform, hit-test, auto-scroll) → `pointerup` →
`endCardTouchDrag` (final hit-test, `resolveBoardContainerDropOrder`, `moveCardAndOrder`) → the
host's action bag (`moveRowWithGroupUpdatesAndPosition` or the `updateGroup` fallback) →
`dataSource.updateFrontmatter` → (embedded host) `showToast`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Touch-drag interaction (lift, ghost, hit-test, drop, cancel, swallow, auto-scroll) | Vitest, `board-renderer-parity.test.ts`'s `MockElement` |
| Unit | Host bindings (frontmatter write, Undo toast) | Vitest, `database-view.test.ts`/`embedded-database-renderer.test.ts`'s fake-app/data-source harnesses |
| Live | Real `DataTransfer` (desktop) and real `PointerEvent` (phone, 402x874) against the real bundled `BoardRenderer` | Playwright (`playwright-core`) against real Chrome, `tools/live/board-cross-group-drag.mjs` |
| Manual | The operator drags a card on their own phone | Device, post-release |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `board-renderer.ts` file lane | Internal | Green — released by `068` | None; no blocker occurred |
| `resolveBoardColumnByPoint`, `attachLongPress` | Internal, pre-existing | Green — used as-is, unmodified | None |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: A regression in desktop drag behaviour, or a touch-drag defect that cannot be fixed
  forward before a release.
- **Procedure**: Revert `src/views/board-renderer.ts`'s touch-drag additions (the new private
  methods, the `card.draggable`/`attachCardTouchDrag` branch, the `touchDragColumns` bookkeeping)
  and `styles.css`'s two new classes; the desktop `dragstart`/`dragover`/`drop` path is untouched
  and needs no reversal. Revert `embedded-database-renderer.ts`'s `showToast` addition
  independently if only the toast is at fault.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Implementation (touch drag + toast) ──► Tests (mutation-proven) ──► Live proof ──► Gate
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Implementation | None | Tests |
| Tests | Implementation | Live proof, Gate |
| Live proof | Implementation | Gate |
| Gate | Tests, Live proof | Closure |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Implementation | Medium | One extended session |
| Tests | Medium | Same session, including two real bugs the tests themselves caught |
| Live proof | Medium | Same session, including one geometry fix for the constructed capture |
| **Total** | | One extended session |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [x] No data migrations
- [x] No feature flag needed — the change is additive (a previously-impossible gesture now works)
- [x] No new persisted key

### Rollback Procedure
1. Revert the touch-drag commit(s) in `src/views/board-renderer.ts` and `styles.css`.
2. Revert the embedded-host toast commit in `src/views/embedded-database-renderer.ts` independently
   if it alone is at fault.
3. Re-run `npx vitest run` and `node tools/live/board-cross-group-drag.mjs` to confirm the desktop
   path still passes standalone.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

---
