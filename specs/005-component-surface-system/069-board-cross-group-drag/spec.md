---
title: "Feature Specification: Board Cross-Group Drag"
description: "Touch drag for the board, on both hosts, wired to the same cross-group write path the desktop mouse drag already used, plus the Undo toast the embed host lacked."
trigger_phrases:
  - "069 spec"
  - "board cross-group drag spec"
  - "board touch drag spec"
  - "kanban drag between columns spec"
importance_tier: "important"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Board Cross-Group Drag

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Implemented — AC-001 through AC-009 Met; AC-010 operator-owned |
| **Created** | 2026-09-07 |
| **Branch** | `worktrees/224-board-touch-drag-groups` |
| **Parent Spec** | ../spec.md |
| **Phase** | 69 of 69 |
| **Predecessor** | 068-rename-to-obnotion |
| **Successor** | None |
| **Handoff Criteria** | None — this packet does not queue behind another file lane; `board-renderer.ts` was released by `068`. |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 69** of the Component Surface System program. It answers a direct operator report
rather than a research loop: the board's mouse-drag cross-group move already worked, but a coarse
pointer could never lift a card at all (`board-renderer.ts`'s `card.draggable` gate excluded touch
mode outright), so the workflow the operator described — drag a task from "open" to "in progress"
the way ClickUp does — was unreachable on phone.

**Scope Boundary**: the board's drag input layer (desktop proof + phone implementation) and the one
host gap in its Undo affordance. It does not touch the board's layout, card anatomy, group-management
panel (`059`), or the page-scroll behaviour `056`/`dc1d54a9` already own.

**Dependencies**: none blocking. `board-renderer.ts` is free (`068` released it); `resolveBoardColumnByPoint`
and `attachLongPress` already exist and needed no change.

**Deliverables**:
- Long-press touch drag on the board, calling the same `moveCardAndOrder` the mouse path calls.
- An Undo toast on the embedded host's cross-group move (the desktop host already had one).
- Real headless-Chrome proof of both input devices, plus mutation-proven unit coverage.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
`board-renderer.ts:445` (pre-packet) set `card.draggable = !this.actions.isReadOnly && !this.touchMode` —
on a coarse pointer a card was never draggable, so the desktop's already-working cross-group move
(`dragstart`/`dragover`/`drop` calling `moveRowWithGroupUpdatesAndPosition`) was unreachable on phone.
Separately, the embedded host's cross-group fallback (`updateGroup`, taken by every embed since none
implements `moveRowWithGroupUpdatesAndPosition`) wrote the frontmatter silently — no toast, no way
back — while the desktop host already raised one for the same class of move.

### Purpose
A reader drags a card between board columns on a phone exactly the way they already could with a
mouse — long-press lifts it, a ghost follows the finger, the target column highlights, the drop
rewrites the grouped property — and every cross-group move, on either device or host, ends with an
Undo affordance.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Long-press lift (450ms threshold, 10px move tolerance, haptic — `attachLongPress`'s own grammar),
  a floating ghost that tracks the finger via `transform: translate()`, column hit-testing through
  `resolveBoardColumnByPoint`, edge auto-scroll of the page-level scroll container, Escape/outside
  cancel, and a one-shot click-swallow so a completed lift does not also open the card.
- The drop resolves through the same `resolveBoardContainerDropOrder` + `moveCardAndOrder` path the
  desktop `drop` handler already used — no new `BoardRendererActions` member.
- `embedded-database-renderer.ts`'s `updateBoardGroup` raises a success toast with an Undo action,
  matching the shape its own delete-row Undo already uses.
- A real headless-Chrome proof of the desktop `DataTransfer` drag and the phone `PointerEvent` drag
  (lift, ghost tracking, highlight, drop, reverse, same-column no-op, read-only no-lift), plus a
  constructed capture of the lifted state in both themes.
- Unit tests (happy path + one edge per surface) for the touch-drag interaction, the embedded Undo
  toast, and the desktop host's cross-group frontmatter write — each proven to fail by a mutation.

### Out of Scope
- The board's layout, card anatomy, and Groups-management panel — `056`/`059` own those.
- The page-scroll behaviour — `056` T014-T016 and `dc1d54a9` own it; this packet's auto-scroll reuses
  the same scrolling container without changing how it scrolls.
- Same-column reorder-on-drop for either input device — the mouse path has never supported this
  (`board-renderer-parity.test.ts`'s pre-existing "keeps a real same-column drag in place" test), and
  touch drag matches that, not extends it.
- Registering the constructed capture in `screenshots/manifest.json`'s hash-tracked pipeline — see
  `goal.md`'s log for the reasoning and the concrete follow-up.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/board-renderer.ts` | Modify | Touch-drag state, per-card pointer listeners, lift/move/drop/cancel, column hit-testing, edge auto-scroll |
| `src/views/embedded-database-renderer.ts` | Modify | `updateBoardGroup` raises an Undo toast |
| `styles.css` | Modify | `.obnotion-kanban-card--touch-lifted` and `--touch-ghost` |
| `src/views/board-renderer-parity.test.ts` | Modify | Touch-drag interaction tests; `MockElement` gains `cloneNode`, `scrollLeft`, capture/bubble-aware event dispatch, and a shared fake document |
| `src/views/embedded-database-renderer.test.ts` | Modify | The Undo toast test; the fake DOM gains `prepend` and a real `body` |
| `src/views/database-view.test.ts` | Modify | The desktop host's cross-group move reaching `dataSource.updateFrontmatter`, undoable |
| `tools/live/board-cross-group-drag.mjs` | Create | The real headless-Chrome proof and the two constructed captures |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A long-press on a board card, on a coarse pointer, lifts it behind a ghost that tracks the finger and highlights the column underneath it |
| REQ-002 | A drop on a different column calls the same write path the desktop drag already used (`moveRowWithGroupUpdatesAndPosition`, or the `updateGroup` + `moveRowToPosition` fallback), with the correct `fromGroupKey`/`toGroupKey` |
| REQ-003 | The desktop mouse drag continues to work, proven live in real headless Chrome with a real `DataTransfer` |
| REQ-004 | Both hosts (`DatabaseView`, `EmbeddedDatabaseRenderer`) reach `dataSource.updateFrontmatter` for a cross-group move, and the move is undoable |
| REQ-005 | The embedded host raises an Undo toast after a cross-group move; the desktop host already does |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-006 | A drop within the same column is a no-op, matching the existing mouse behaviour |
| REQ-007 | A read-only board never lifts a card |
| REQ-008 | Escape, or dropping outside any column, cancels the lift without moving the card |
| REQ-009 | A tap below the long-press threshold still opens the card; a completed lift's own trailing click does not |
| REQ-010 | The pane auto-scrolls horizontally while the pointer sits inside either edge band during a lift |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A phone reader can move a card between board columns without a mouse — measured live in headless Chrome at 402x874 with a real `PointerEvent`, ghost tracking within 2px of the finger.
- **SC-002**: Every cross-group move, on either device or host, ends with a reachable Undo — 0 silent writes remain (embedded host's gap closed; desktop host's pre-existing toast unchanged).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | A touch drag competing with the card's own scroll gesture | Medium | The long-press threshold (450ms) and move tolerance (10px) are the same ones `attachLongPress` already uses elsewhere on this surface, so a reader's existing muscle memory for "hold to act" transfers |
| Risk | The click-swallow leaking past a completed lift and re-opening the card | Closed, caught by a test | `board-renderer-parity.test.ts`'s "swallows the click that follows a completed lift" test caught a real ordering bug (teardown removed the swallow listener before the compatibility click could reach it) before this packet shipped |
| Risk | No real Obsidian vault in any headless-Chrome harness this repository owns | Accepted, documented | The frontmatter write itself is proven through the vitest host-binding suites instead (the established pattern for this class of claim); headless Chrome proves the DOM/event mechanics a real `DataTransfer`/`PointerEvent`/layout engine require |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The ghost updates via `transform: translate()` on every `pointermove`, not `top`/`left` — a compositor-only change, no per-frame layout.
- **NFR-P02**: Column hit-testing reads `getBoundingClientRect()` once per column per `pointermove`, the same cost the desktop `dragover` handler already pays per card.

### Security
- **NFR-S01**: No new persisted key. The grouped field write goes through the same `dataSource.updateFrontmatter` call the mouse path already used.

### Reliability
- **NFR-R01**: A re-render mid-drag (`BoardRenderer.render()`) tears down any in-flight touch drag first, so a stale ghost or listener cannot survive past the DOM it was built against.
- **NFR-R02**: The click-swallow listener outlives the drag's own teardown, removing itself only when it actually fires — a `pointerup` and its trailing `click` are two separate browser events, and cleaning up before the second one arrives would leave nothing to swallow it.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A drop outside every column's rect: `resolveBoardColumnByPoint` returns `null`; the drag ends with no group update.
- A read-only board: the touch-drag listener is never attached, mirroring the desktop `card.draggable` gate exactly.

### Error Scenarios
- A `pointercancel` (the OS interrupts the gesture — an incoming call, a system gesture): treated identically to Escape — the drag cancels, no move.

### State Transitions
- A completed lift with no net movement (long-press, then release in place): resolves as a same-column no-op, and the trailing compatibility click is swallowed rather than opening the card.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 20/25 | ~280 LOC in `board-renderer.ts`, a small embedded-host addition, three test files, one new live-proof script |
| Risk | 12/25 | No new persisted shape, no new interface member; the risk is entirely in event-ordering correctness, which the mutation-proven tests target directly |
| Research | 8/20 | The write path, the hit-test primitive and the long-press grammar all pre-existed; the work was wiring, not discovery |
| **Total** | **40/70** | **Level 2** — `recommend-level.sh --loc 600 --files 10 --api` returns 49/100, confidence 82%, recommended level 2, phase score 0/50 |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- None outstanding. The one item this packet deliberately left for a follow-up (registering the
  constructed capture in `screenshots/manifest.json`'s tracked pipeline) is recorded in `goal.md`'s
  log and `decision-record.md`, not left open here.
<!-- /ANCHOR:questions -->

---
