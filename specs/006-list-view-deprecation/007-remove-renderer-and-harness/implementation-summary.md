---
title: "Implementation Summary: Remove the List Renderer and Its Harness"
description: "Nothing is removed yet. This records the nine measurement surfaces that must come out with the renderer, counted before the change so the removal can be checked against a number rather than a feeling."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list removal summary"
  - "006 phase 007 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/007-remove-renderer-and-harness"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the opening state; nothing removed"
    next_safe_action: "Confirm the two preconditions, then capture the board and gallery before-state"
    blockers:
      - "Preconditions unmet: 005 has not run and 006 has not shipped"
    key_files:
      - "src/views/list-renderer.ts"
      - "tools/gate.mjs"
      - "tools/live/renderer-coverage.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-007-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 007-remove-renderer-and-harness |
| **Completed** | Not complete — opened 2026-09-04 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This is the irreversible phase and it has two unmet preconditions. What follows is
the surface count it opens against, so the removal is checkable against a number.

### The nine surfaces

Read from the tree at `c6b5f11`. Every one of these must leave in the same commit as the renderer:

1. `tools/gate.mjs:89` — the `list-window` lane entry.
2. `tools/live/list-window.mjs` — the lane.
3. `tools/live/list-window.json` — its ratchet.
4. `src/views/list-window-harness.ts` — its harness.
5. `tools/live/renderer-coverage.json` — pins `src/views/list-renderer.ts` and
   `tools/bench/list-render-bench.ts` by content hash, and fails closed on a coverage decrease.
6. `tools/screenshots/constructed-scenarios.mjs` — `list` and `list-sparse`.
7. `tools/screenshots/scenarios.mjs` — the list fixtures.
8. `tools/live/replay.mjs` — the list claims.
9. `src/views/list-reservation.test.ts` and `src/views/list-row-contracts.test.ts`.

And the source: `src/views/list-renderer.ts`, 1,173 lines, plus the list branch in
`database-view.ts`'s renderer switch. `src/views/card-field-renderer.ts` (349 lines) is **not** on
this list — the board and gallery cards render through it.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none) | — | No file has been removed. The documents in this folder are the only artifacts so far. |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered, and it must not start yet. Two preconditions are unmet: `005`'s enumeration has not
run, and `006` has not shipped in a release. `plan.md` §3 sets the internal order — measurements
first, then source, then the ratchet and the manifest — so the tree is never in a state where the
gate is green against a half-removed view.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Remove everything in one commit, not a tidy sequence | Two commits satisfy a later search and still leave a window where the gate ran green against a view that was half gone. AC-001 is therefore phrased over the commit, not the tree. |
| Measurements out before source | Otherwise `list-window.mjs` runs against a deleted renderer, and the failure it produces is indistinguishable from a real one. |
| Capture the board and gallery before starting | REQ-004's proof needs a before, and once the change begins it is unrecoverable. |
| Record a missed surface against `005` rather than fixing it silently | A surface the audit missed is evidence about the audit method. Losing it costs more than the minute saved. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 007-remove-renderer-and-harness --strict` | Run at authoring time; see the packet commit |
| `npm run gate` | Not run — nothing has changed |
| Board/gallery before-captures | Not taken (tasks.md T002) |
| ADR-001 (`DatabaseViewType`) | Proposed, not decided |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Two unmet preconditions.** `005` has not enumerated and `006` has not shipped. Starting without
   either turns a removal into a discovery process run against a red gate.
2. **ADR-001 is open.** Whether `list` leaves `DatabaseViewType` decides what an un-migrated vault
   does, and leaving it implicit means the behaviour depends on whichever branch runs first.
3. **The gallery's own deprecation is unfinished.** `renderer-coverage.json` still pins
   `gallery-renderer.ts`. Bundling the two removals would make one rollback undo both, so they stay
   separate even though the work rhymes.
<!-- /ANCHOR:limitations -->

---


