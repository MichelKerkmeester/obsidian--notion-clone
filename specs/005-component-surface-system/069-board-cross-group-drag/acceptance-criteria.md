---
title: "Acceptance Criteria: Board Cross-Group Drag"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "069 acceptance criteria"
  - "board cross-group drag closure gate"
  - "board touch drag ac"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/069-board-cross-group-drag"
    last_updated_at: "2026-09-07T20:41:49Z"
    last_updated_by: "board-touch-drag-groups-session"
    recent_action: "AC-001 through AC-009 Met"
    next_safe_action: "Validate --strict, backfill graph metadata, commit"
    blockers: []
    key_files:
      - "src/views/board-renderer.ts"
      - "tools/live/board-cross-group-drag.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "board-touch-drag-groups-session"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Cross-Group Drag

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 069-board-cross-group-drag
**Level:** 2
**Status:** Implemented — AC-001 through AC-009 Met; AC-010 operator-owned
**Date:** 2026-09-07
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a board card on a coarse pointer, when the pointer holds for 450ms without moving past 10px, then a ghost appears, tracks the finger, and the source card fades | `node tools/live/board-cross-group-drag.mjs` → `phone touch drag (402x874): PASS — ghost delta 0.0x/0.0y px`; `board-renderer-parity.test.ts` "long-presses to lift the card behind a ghost..." | Met | - |
| AC-002 | REQ-002 | Given a lifted card, when it is dropped on a different column, then `moveRowWithGroupUpdatesAndPosition` (or the `updateGroup`+`moveRowToPosition` fallback) is called with the correct group keys | Same live-proof run: `recorded call: {"fn":"moveRowWithGroupUpdatesAndPosition","updates":[{"field":"board_status","fromGroupKey":"backlog","toGroupKey":"todo"}]}`; `board-renderer-parity.test.ts` same test, asserting `groupUpdates` | Met | - |
| AC-003 | REQ-003 | Given a desktop card, when it is dragged with a real `DataTransfer` in real headless Chrome, then the same call lands | `node tools/live/board-cross-group-drag.mjs` → `desktop cross-group drag: PASS` | Met | - |
| AC-004 | REQ-004 | Given a cross-group move on either host, when it completes, then `dataSource.updateFrontmatter` is called with the grouped field set to the target, and undoing reverses it | `database-view.test.ts` "writes the grouped field through updateFrontmatter and undoes back to the source group" (new); `embedded-database-renderer.test.ts` "writes the frontmatter and raises an Undo toast wired to undoLastEdit" (new) | Met | - |
| AC-005 | REQ-005 | Given a cross-group move on the embedded host, when it completes, then a success toast with an Undo action appears, wired to `undoLastEdit` | `embedded-database-renderer.test.ts` same test; proven red by removing the `showToast` call (`AssertionError: expected null to be truthy`) | Met | - |
| AC-006 | REQ-006 | Given a card dropped back on its own column, when the drop resolves, then no group-update call is made | `board-renderer-parity.test.ts` "drops the card back onto its own column..."; live proof `phone touch drag same-column (reorder only, no group update): PASS` | Met | - |
| AC-007 | REQ-007 | Given a read-only board, when a card is held for 450ms, then no ghost appears and no touch-drag listener fires | `board-renderer-parity.test.ts` "never lifts a card on a read-only board"; live proof `phone touch drag read-only (no lift): PASS` | Met | - |
| AC-008 | REQ-008, REQ-009, REQ-010 | Given a lifted card, when Escape fires, the pointer drops outside every column, or the pointer sits in an edge band, then the drag cancels, the drop is ignored, or the pane auto-scrolls respectively, and a short tap below the threshold still opens the card | `board-renderer-parity.test.ts`: "cancels the lift on Escape...", "leaves a short tap alone...", "swallows the click that follows a completed lift...", "auto-scrolls the pane..." — each proven red by a targeted mutation | Met | - |
| AC-009 | — | Given the full tree, when the gate runs, then all 26 lanes report green | `npm run gate` → `PASS — 26 green, 0 red for a declared reason`, exit 0 (first run surfaced 5 pre-existing-tree failures from the `styles.css` hash move — folder-docs, operator-list, css-lane, screenshots-fresh, evidence — all resolved by the css-lane acquire/recapture/release, evidence re-stamps, and folder relocation of the live-proof captures, none by a code change) | Met | - |
| AC-010 | — | The operator drags a card between columns on their own phone and confirms the move landed | Device-only; no command can close this | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Yes, except AC-010, which is the operator's own row and which nothing in this
repository can close.

AC-001 through AC-009 carried the packet: real headless-Chrome proof of both input devices
(AC-001-003), the host-binding tests proving the real frontmatter write and its Undo path
(AC-004-005), the edge-case coverage (AC-006-008), and the full 26-lane gate (AC-009). Left
consciously open: registering the constructed capture in `screenshots/manifest.json`'s tracked
pipeline (named as a follow-up in `decision-record.md` ADR-005), and the operator's own device
confirmation (AC-010).
<!-- /ANCHOR:closure -->
