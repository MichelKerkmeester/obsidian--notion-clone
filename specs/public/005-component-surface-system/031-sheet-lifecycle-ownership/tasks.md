---
title: "Tasks: Sheet Lifecycle Ownership"
description: "The ordered task list, with the observation that closes each one."
trigger_phrases: ["031 tasks", "sheet lifecycle tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Task list drafted; T1 is the discriminating control"
    next_safe_action: "Build T1 and observe it red"
    blockers: []
    key_files: ["plan.md", "spec.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-tasks"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: ["The owned menu is the one producer that cleans up, so it is the parity reference"]
---
# Tasks: Sheet Lifecycle Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it. A task closes on an observation,
> never on having been attempted.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## PHASE 1: THE CONTROL

- [ ] **T1** Build the producer-parity check — REQ-001, D5. **Blocking.**
      *Evidence to close:* for each sheet family, open then close, assert no `.db-mobile-sheet-scrim`
      and no `.db-mobile-bottom-sheet` on the body. It must **pass for the owned menu and fail for
      every panel family** on the current tree. A check green everywhere before the fix is not
      discriminating and must be rebuilt rather than believed.

## PHASE 2: THE FREEZE

- [ ] **T2** Live-sheet set plus a disposer returned from mount — REQ-006, D1, D2.
      *Evidence to close:* T1 goes green for every family; a caller that only removes its element
      still leaves no scrim.
- [ ] **T3** Retained-element pattern for view-config and column-manager — REQ-001.
      *Evidence to close:* closing each removes its own sheet; no orphan survives to block a later
      cleanup.

## PHASE 3: THE TWO DRAG CAUSES, SEPARATELY

- [ ] **T4** Re-assert chrome after the group panel empties — REQ-002, D3.
      *Evidence to close:* handle present after a group toggle; a 120px drag dismisses. Today the
      handle is absent and the drag moves 0.0px.
- [ ] **T5** Register the header panels from a retained reference — REQ-003, D3.
      *Evidence to close:* under `is-phone`, `dismissPanel(panel, "programmatic")` returns true.
      Today it returns false.

## PHASE 4: THE REST

- [ ] **T6** Wire or remove the modal handles — REQ-004, D4.
      *Evidence to close:* no sheet draws a handle without an attached drag, asserted by
      construction rather than by inspection.
- [ ] **T7** Velocity-based dismissal — REQ-005.
      *Evidence to close:* a short fast flick dismisses; a slow short drag still springs back.
- [ ] **T8** Move the keyboard inset onto the element that reads it.
      *Evidence to close:* per-write cost flat in row count. It grows today.

## PHASE 5: VERIFICATION

- [ ] **T9** Whole gate from the final state.
      *Evidence to close:* `npm run gate` exit 0 read from `$?`; `npx vitest run` no reduction.
- [ ] **T10** The operator opens and closes each sheet on device without the app locking up.
      *Evidence to close:* the operator says so. Nothing else closes this.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION

Complete when T10 closes. Every other task is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- Scope and the harness blind spot: [`spec.md`](spec.md)
- Order and ADR-001: [`plan.md`](plan.md)
- The record sheet's equivalent fix: [`../016-sheet-drag-and-audit/goal.md`](../016-sheet-drag-and-audit/goal.md)
<!-- /ANCHOR:cross-refs -->
