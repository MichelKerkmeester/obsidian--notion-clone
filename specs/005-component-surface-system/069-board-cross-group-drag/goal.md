---
title: "Goal: Board Cross-Group Drag"
description: "The durable directive for making the board's cross-group drag work on both desktop and phone, and the criteria that decide when it is done."
trigger_phrases:
  - "069 goal"
  - "board cross-group drag goal"
  - "board touch drag goal"
  - "kanban drag between columns goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/069-board-cross-group-drag"
    last_updated_at: "2026-09-09T21:55:00Z"
    last_updated_by: "267-board-touch-drag"
    recent_action: "0.0.36 device report root-caused (scroll takeover); real-touch harness green, gate 28 lanes"
    next_safe_action: "Validate --strict, backfill graph metadata, commit"
    blockers: []
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/board-renderer-parity.test.ts"
      - "src/views/embedded-database-renderer.test.ts"
      - "src/views/database-view.test.ts"
      - "tools/live/board-cross-group-drag.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "board-touch-drag-groups-session"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "Whether cross-group drag needs a new BoardRendererActions member — no: it reuses moveRowWithGroupUpdatesAndPosition/updateGroup exactly as the desktop dragstart/dragover/drop path already does"
      - "Whether the desktop Undo toast already existed — yes on database-view.ts (pre-existing, untouched); embedded-database-renderer.ts's updateGroup had none and now does"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Board Cross-Group Drag

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Dragging a card from one board column to another rewrites the grouped property to
match the target column, on both desktop and phone, on both hosts, with an Undo toast — the way
ClickUp's board already works, and the way this plugin's own desktop mouse drag already worked
before this packet, except that a phone reader could never lift a card at all.

**Why.** The operator's report, verbatim, 2026-09-07 ~21:40: *"board view needs to support
dragging to other groups and thus updating that property to match grouped field. Like clickup for
example. You have task on status 'open' and drag board card to 'in progress'"*. Read against the
tree: the desktop path already did this — `board-renderer.ts`'s `dragstart`/`dragover`/`drop` cycle
already called `moveRowWithGroupUpdatesAndPosition` and rewrote the frontmatter — but
`card.draggable = !this.actions.isReadOnly && !this.touchMode` (`board-renderer.ts:445` on the
pre-packet tree) made every card **never** draggable on a coarse pointer, so the one platform the
operator's own example most plausibly describes (a phone, mid-workflow, moving a task forward) was
exactly the one platform the feature never reached.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **One write path, two input devices.** Touch drag does not get its own group-update mechanism. It computes the same `resolveBoardContainerDropOrder` decision and calls the same private `moveCardAndOrder` the desktop `drop` handler calls, so a host only ever implements cross-group logic once. |
| D2 | **Column hit-testing reuses `resolveBoardColumnByPoint`.** That function (`src/data/board-container-drop.ts`) already existed, already unit-tested, and was wired nowhere — built for a mouse empty-space fallback that was never finished. Touch drag is its first caller, keeping the geometry decision in one pure, DOM-independent function rather than a second `elementFromPoint`-based one. |
| D3 | **The long-press grammar, not the function.** Touch drag reuses `attachLongPress`'s threshold (450ms), move tolerance (10px) and haptic (`navigator.vibrate(20)`) as constants, but is hand-rolled rather than calling `attachLongPress` itself — that function stops tracking movement once it fires (correct for opening a menu, wrong for a ghost that must keep following the finger) and has no concept of a drop target. |
| D4 | **No new `BoardRendererActions` member.** Cross-group touch drag reaches `moveRowWithGroupUpdatesAndPosition` (when a host implements it) or the `updateGroup` + `moveRowToPosition` fallback (when it does not) — the exact two branches `moveCardAndOrder` already carried for the mouse. The interface's member count is unchanged; `render-assertions.mjs`'s own bag-shape check (`board/file-view 33/33`, `board/embed 27/27`) confirms it. |
| D5 | **The Undo toast is host-owned, not board-owned.** `database-view.ts`'s `moveRowWithGroupUpdatesAndPosition` already raised one (pre-existing, untouched by this packet). `embedded-database-renderer.ts`'s `updateGroup` — the fallback path every embed cross-group move takes, since no embed implements `moveRowWithGroupUpdatesAndPosition` — raised none; it now does, using the same `showToast` + `pushHistory` + `undoLastEdit` shape the embed's own delete-row Undo already uses. |
| D6 | **A same-column drop stays a no-op**, matching the mouse path's own existing behaviour (`board-renderer-parity.test.ts`'s pre-existing "keeps a real same-column drag in place without a spurious reorder" test) — this packet does not add same-column reorder-on-drop to either input device. |
| D7 | **The board scrolls as a page (`dc1d54a9`); touch drag auto-scrolls that same container**, not a per-column one, and never touches the desktop `scrollbarRevealTeardown` listener — that listener is never attached in touch mode in the first place, so the two cannot contend for the same element. |
| D8 | **Real headless Chrome proves the DOM/event mechanics; the vitest host-binding suites prove the frontmatter write.** No Obsidian `App`/vault is constructed in headless Chrome anywhere in this repository's tooling (`render-assertions.mjs`'s own header says so) — so "the file's frontmatter changed" is proven by driving the real `DatabaseView`/`EmbeddedDatabaseRenderer` classes against a fake data source in vitest (the established pattern `database-view.test.ts`/`embedded-database-renderer.test.ts` already use for this exact class of claim), while real `DataTransfer`/`PointerEvent` construction and real `getBoundingClientRect` geometry — what jsdom cannot faithfully give — are proven in real Chrome by `tools/live/board-cross-group-drag.mjs`. |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes
(objective, a decision, the binding table, a criterion), resend the full text
of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Dragging a card across columns on desktop, in real headless Chrome, with a real `DataTransfer`, calls the real `BoardRenderer`'s `moveRowWithGroupUpdatesAndPosition` with the correct `fromGroupKey`/`toGroupKey`. Observed red before the fix: 0 live-Chrome scripts existed that drove this path with a real `DataTransfer` at all — `node tools/live/board-cross-group-drag.mjs` now reports `desktop cross-group drag: PASS`.
- [x] A phone long-press (450ms, real wall-clock time, real `PointerEvent`) lifts the card behind a ghost that tracks the finger to within 2px, highlights the column under it, and a drop there calls the same action with the correct group update. Observed red on the pre-packet tree: `card.draggable = !isReadOnly && !touchMode` (`board-renderer.ts:445`) excluded every coarse pointer, so 0 touch lifts were possible — the same script now reports `phone touch drag (402x874): PASS` with a measured ghost delta of 0.0px, plus `PASS` for the reverse drag, the same-column no-op, and the read-only no-lift case.
- [x] Both hosts reach `dataSource.updateFrontmatter` with the grouped field set to the target column, and the move is undoable through the existing history path. Today, before this packet: `database-view.test.ts` and `embedded-database-renderer.test.ts` carried 0 tests naming this path — both now have one, each proven to fail (observed red) by a one-line mutation of the code it covers.
- [x] An Undo toast follows a cross-group move on the host that lacked one. Observed red before the fix: `embedded-database-renderer.ts`'s `updateBoardGroup` wrote the frontmatter and returned with 0 toast calls — `embedded-database-renderer.test.ts`'s new toast test now passes, and was watched red by removing the `showToast` call before this fix landed.
- [x] Every new behaviour has a happy-path test plus one edge case (same-column no-op, read-only no-lift, Escape cancels, a tap below the threshold still opens the card, the swallow after a completed lift). Today, before this packet: 0 of these tests existed, since the behaviour itself did not — each was watched red by a targeted one-line mutation of the production code it covers before being left green.
- [x] `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `node tools/live/render-assertions.mjs`, `node tools/live/sheet-grammar.mjs` all exit 0. Observed red before the fix: none of these five had ever run against the touch-drag code, which did not exist — re-run from the final state rather than trusted from an earlier pass, all five recorded 0 (exit code) just now.
- [x] A real touch input pipeline — the browser's own scroll-takeover decision, which a dispatched
      event bypasses — cannot take a lifted card's drag away mid-gesture. Observed red on
      2026-09-09 against the then-shipped code: the compositor answered the first finger move with
      `pointercancel` (`touchstart pointermove(67,82) touchmove pointercancel(0,0)…`), 0
      `moveRowWithGroupUpdatesAndPosition` calls, the card's DOM never left the source column and
      `frontmatter[board_status]` read back `"backlog"` — which is how the operator could report
      the drag dead on 0.0.36 while every dispatched-event proof stayed green.
      `node tools/live/board-touch-drag.mjs` (real CDP touch input, 390×844, hold 550ms > the
      exported 450ms threshold, 10-step boundary crossing) now reports the drop landed: exactly 1
      move call `backlog→todo`, the card's DOM in the target column, `frontmatter[board_status]`
      read back `"todo"`, no `pointercancel` — and its negative control proves a plain vertical
      flick on a card is still the compositor's gesture (`pointercancel=true`, no ghost, no move).
      Gate lane `board-touch-drag`: `PASS — 28 green`, exit 0.
- [x] `npm run gate` reports all 28 lanes green, read from `$?`. Observed red before this fix: the
      first run of the new lane failed on the then-shipped code, exit 1; `npm run gate` now
      reports `PASS — 28 green, 0 red for a declared reason`, exit 0.
- [ ] **OPERATOR:** the operator drags a card between two columns on their own phone and confirms the move landed in the note's frontmatter. Nothing in this repository can close this row, and an agent never ticks it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Touch drag implementation | Done | `src/views/board-renderer.ts` — long-press lift, ghost, `resolveBoardColumnByPoint` hit-test, edge auto-scroll, drop through `moveCardAndOrder` |
| Embedded host Undo toast | Done | `src/views/embedded-database-renderer.ts`'s `updateBoardGroup` |
| Desktop host Undo toast | Verified pre-existing | `src/views/database-view.ts`'s `moveRowWithGroupUpdatesAndPosition` already raised one; untouched |
| Unit tests, happy path + edges, mutation-proven | Done | `board-renderer-parity.test.ts` (8 new tests), `embedded-database-renderer.test.ts` (2 new tests), `database-view.test.ts` (1 new test) |
| Real headless-Chrome proof, desktop + phone | Done | `tools/live/board-cross-group-drag.mjs`, `RESULT: PASSED` |
| Constructed capture, lifted mid-drag, both themes | Done, not manifest-tracked | `specs/005-component-surface-system/069-board-cross-group-drag/scratch/captures/board-touch-drag-lifted-mobile-{light,dark}.png` |
| Full gate | Done | `npm run gate` — `PASS — 28 green, 0 red for a declared reason`, exit 0 |
| Real-input touch harness (scroll-takeover proof) | Done | `tools/live/board-touch-drag.mjs`, `RESULT: PASSED`; gate lane `board-touch-drag`; evidence stamp `tools/live/board-touch-drag.json` |
| Spec validation (`--strict`) | Pending | This packet and the parent |

### Deviations and findings

| Item | Note |
|------|------|
| Item (6)'s capture is not registered in `screenshots/manifest.json` | That pipeline computes and tracks per-source content hashes through `constructed-scenarios.mjs` + `npm run screenshots`; wiring a new synchronously-reachable "lifted" scenario into `render-assertion-harness.ts` for it is real additional work this packet did not take on. The two PNGs are real evidence from the same bundled `BoardRenderer` in real Chrome, kept in this packet's own `scratch/` rather than hand-forging a manifest entry with fabricated hashes. |
| `resolveBoardColumnByPoint` was dead code before this packet | `grep -rn resolveBoardColumnByPoint src` returned one definition and its own test, and no caller. Touch drag is its first caller. |
| `getFrontmatterSnapshot`/`app.vault.getAbstractFileByPath` were missing from `database-view.test.ts`'s fixture | The subtask-move tests never needed them (a different write path); the cross-group move test does, since `commitConfigAndCellChanges` looks the file back up and re-reads its frontmatter before diffing. Added to the shared fixture, additively — the other 13 tests in that file were unaffected. |
| MockElement's event dispatch had no capture/bubble distinction | `board-renderer-parity.test.ts`'s `MockElement` dispatched every listener for a type in one pass, so the touch-drag click-swallow (registered `capture: true` specifically to run before the card's own bubble-phase "open" listener) could not be told apart from it. Split into `captureListeners`/`bubbleListeners`, with `stopImmediatePropagation` honoured — this is what caught a real ordering bug (teardown removed the swallow listener before the browser's own compatibility click could reach it). |
<!-- /ANCHOR:log -->
