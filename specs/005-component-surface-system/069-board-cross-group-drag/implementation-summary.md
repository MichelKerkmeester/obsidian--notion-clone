---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "069 implementation summary"
  - "board touch drag what shipped"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/069-board-cross-group-drag"
    last_updated_at: "2026-09-07T21:10:00Z"
    last_updated_by: "board-touch-drag-groups-session"
    recent_action: "Gate 26 green"
    next_safe_action: "Validate --strict, backfill graph metadata, commit"
    blockers: []
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/embedded-database-renderer.ts"
      - "tools/live/board-cross-group-drag.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "board-touch-drag-groups-session"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 069-board-cross-group-drag |
| **Completed** | 2026-09-07 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A board card can now be dragged between columns on a phone, the way it already could with a mouse.
Before this packet, `src/views/board-renderer.ts:445` set
`card.draggable = !this.actions.isReadOnly && !this.touchMode`, which excluded every coarse pointer
outright — the operator's own report (moving a task from "open" to "in progress" like ClickUp) was
unreachable on the one device it most plausibly described.

### Phase 1: board-cross-group-drag

Touch drag is a long-press (450ms, `attachLongPress`'s own threshold and haptic) that lifts the card
behind a floating ghost, tracks the finger via `transform: translate()`, resolves the column
underneath it with `resolveBoardColumnByPoint` (a pre-existing, previously-unwired pure function),
auto-scrolls the pane near either edge, and on drop calls the exact same `moveCardAndOrder` write
path the desktop `dragstart`/`dragover`/`drop` cycle already used — no new `BoardRendererActions`
member, no new persisted key. Escape or a drop outside every column cancels; a same-column drop is
a no-op, matching the mouse path's existing behaviour; a short tap below the threshold still opens
the card; a completed lift's own trailing compatibility click is swallowed once, the same one-shot
grammar `attachLongPress` uses.

Separately, `embedded-database-renderer.ts`'s `updateBoardGroup` — the cross-group fallback every
embedded board takes, since no embed implements `moveRowWithGroupUpdatesAndPosition` — now raises a
success toast with an Undo action, matching the shape its own delete-row Undo already used. The
desktop host's own toast (`database-view.ts`'s `moveRowWithGroupUpdatesAndPosition`) already existed
and was not touched.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/board-renderer.ts` | Modified | Touch-drag state, per-card pointer listeners, lift/move/drop/cancel, column hit-testing, edge auto-scroll (~280 new lines) |
| `src/views/embedded-database-renderer.ts` | Modified | `updateBoardGroup` raises an Undo toast |
| `styles.css` | Modified | `.obnotion-kanban-card--touch-lifted`, `--touch-ghost` |
| `src/views/board-renderer-parity.test.ts` | Modified | 9 new touch-drag interaction tests; `MockElement` gained `cloneNode`, `scrollLeft`, capture/bubble-aware `dispatchEvent`, a shared fake document, timers wired to `vi.useFakeTimers()` |
| `src/views/embedded-database-renderer.test.ts` | Modified | 2 new tests for the Undo toast; the fake DOM gained `prepend` and a real `body` |
| `src/views/database-view.test.ts` | Modified | 1 new test proving the desktop host's cross-group frontmatter write and its undo; the fixture gained `getFrontmatterSnapshot` and a file-resolving `app.vault.getAbstractFileByPath` |
| `tools/live/board-cross-group-drag.mjs` | Created | Real headless-Chrome proof (real `DataTransfer`, real `PointerEvent`) of both input devices, plus two constructed captures |
| `tools/lane/css-lane.json` | Modified | Acquired and released for the `styles.css` edit above; 0 captures carried a real content change |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Implemented directly in `BoardRenderer` as new private methods, reusing the desktop path's own
write mechanism rather than adding a parallel one (`decision-record.md` ADR-001). Verified in three
layers: mutation-proven vitest unit tests (each new test confirmed to fail against a one-line
mutation of the code it covers, and two real bugs — a click-swallow torn down before the browser's
compatibility click could reach it, and a hit-test that silently skipped the first highlight — were
caught by the tests themselves before shipping); vitest host-binding tests driving the real
`DatabaseView`/`EmbeddedDatabaseRenderer` classes against a fake data source (the established
pattern for proving a real frontmatter write without a live Obsidian `App`); and a standalone
headless-Chrome script using the same `buildRenderAssertionBundle` esbuild step
`render-assertions.mjs` uses, proving the real DOM/event mechanics (`DataTransfer`, `PointerEvent`,
real `getBoundingClientRect` geometry) that jsdom-based tests cannot faithfully exercise.

The `styles.css` edit (two new, additive classes) required the css lane: acquired, recaptured
(`npm run screenshots`, 608 entries), and released — two files moved bytes on the first recapture,
a second full recapture moved a *different* pair and left the first byte-identical to HEAD again
(the same encoder/rasteriser nondeterminism this lane's own history already documents), and the
one pair still byte-different was checked by decoded pixel delta rather than trusted from
pixelHash/layoutHash alone, then restored to committed bytes since 0 pixels this leg's selectors
could reach actually moved.

Not pushed. This session commits only; a fresh verifier rebases and lands it.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Touch drag calls the same `moveCardAndOrder` the mouse drag calls | Zero new interface surface; one write path to reason about (ADR-001) |
| Column hit-testing reuses `resolveBoardColumnByPoint` | Already existed, already unit-tested, pure and DOM-independent — its first real caller (ADR-002) |
| The Undo toast lives on the host that lacked it, not on `BoardRenderer` | `BoardRenderer` has no access to either host's `Document` or undo stack; adding one would need a new interface member, which ADR-001 already ruled against (ADR-003) |
| The headless-Chrome proof is a standalone script, not inside `render-assertion-harness.ts` | That harness's scenario runner is synchronous and cannot host a real 450ms wait without restructuring a 4,300-line file every other check depends on (ADR-004) |
| The constructed capture is not registered in `screenshots/manifest.json` | Real, honestly-labelled evidence in the packet's own `scratch/` beats either a fabricated manifest entry or an undone deliverable; the proper integration path is named as a follow-up (ADR-005) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, 1652 tests, 153 files |
| `npm run build` | PASS |
| `node tools/live/render-assertions.mjs` | PASS |
| `node tools/live/sheet-grammar.mjs` | PASS, 12 surfaces |
| `node tools/live/board-cross-group-drag.mjs` | `RESULT: PASSED` — desktop drag, phone drag (ghost delta 0.0px), reverse drag, same-column no-op, read-only no-lift |
| `node tools/naming/scan-comments.mjs` | PASS, 0 violations |
| `node tools/naming/scan-failing-values.mjs` | PASS, 147 bare (at baseline) |
| `npm run gate` | `PASS — 26 green, 0 red for a declared reason` |
| Mutation proof, each new test | PASS — every new test in `board-renderer-parity.test.ts`, `embedded-database-renderer.test.ts` and `database-view.test.ts` confirmed to fail against a targeted one-line mutation of the code it covers |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The constructed capture is not in the tracked `screenshots/manifest.json` pipeline.** The two
   PNGs (`scratch/captures/board-touch-drag-lifted-mobile-{light,dark}.png`) are real evidence from
   the real bundled `BoardRenderer` in real Chrome, but carry no manifest entry or content hash.
   Follow-up named in `decision-record.md` ADR-005.
2. **No real Obsidian vault exists in any headless-Chrome harness this repository owns.** The live
   proof's "frontmatter write" is the action bag's own recorded call; the real file write is proven
   separately through the vitest host-binding suites.
3. **The operator's own device confirmation remains open by design** (`goal.md`'s completion
   criteria, `acceptance-criteria.md` AC-010) — nothing in this repository can close it, and this
   session does not tick it.
<!-- /ANCHOR:limitations -->

---
