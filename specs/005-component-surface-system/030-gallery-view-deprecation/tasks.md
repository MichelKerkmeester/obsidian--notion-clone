---
title: "Tasks: Gallery View Deprecation"
description: "The ordered task list, with the evidence that closes each one."
trigger_phrases:
  - "030 tasks"
  - "gallery deprecation tasks"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/030-gallery-view-deprecation"
    last_updated_at: "2026-09-06T00:00:00Z"
    last_updated_by: "gallery-007-004-docs-and-release"
    recent_action: "T6-T8 closed against 007's child 003 removal; T11 superseded by 007's own operator row"
    next_safe_action: "None here — T11 is tracked at specs/007-gallery-view-deprecation/goal.md"
    blockers:
      - "T11 belongs to the operator, and is now asked by 007's own goal.md"
    key_files:
      - "plan.md"
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-030-tasks"
      parent_session_id: null
    completion_pct: 91
    open_questions:
      - "T1: the migration target"
    answered_questions:
      - "The board control is free: its captures and renderer assertion already exist"
---
# Tasks: Gallery View Deprecation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with the evidence named beneath it. A task is closed by its
> evidence line, never by having been attempted.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## PHASE 1: THE DECISION

- [x] **T1** Close the migration question — REQ-001, ADR-001. **Blocking.**
      *Closed 2026-09-02.* `plan.md` §2 is **Accepted**: migrate to board, on open, as one labelled
      undo step, with the renderer still shipped. The rejected options are recorded there with what
      each costs. The gap this closes is that the code had already taken the decision — the migration
      returns `to: "board"` and the view applies it — while the document still read *Proposed* and
      listed the ADR as a blocker. A decision living only in a source file is one nobody agreed to.

## PHASE 2: THE DATA PATH, WHILE THE GALLERY STILL WORKS

- [x] **T2** Capture the board control baseline — D1.
      *Closed.* The board's four captures are in `screenshots/views/board-view-{desktop,mobile}-{dark,light}.png`
      and its production-render assertion runs in the `render-assertions` lane.
- [x] **T3** Implement the migration decided in T1 — REQ-001.
      *Closed.* `src/data/gallery-migration.ts` plans and applies it; `database-view.ts` runs it once
      per view id per session on open, sets the undo label and saves. The renderer is still present,
      so both paths work: a migrated view draws as a board and an undone one draws as it always did.
      The gallery's own fields are left on the view, which is what lets the undo restore the surface
      exactly rather than approximately.
- [x] **T4** Prove the migration on a config the plugin did not author — REQ-001.
      *Closed, and this was the one genuinely missing piece.* Every fixture was shaped the way this
      plugin serialises a view, which proves only that the migration can read its own output. Three
      tests now use configs it never wrote: one with no `id`, no `name`, no cover field and a key
      from another tool — which migrates, writes no invented cover property, and leaves the unknown
      key intact; one spelling only `galleryImageField`, which arrives as the board's own field; and
      one of an unrecognised type, which is left byte-identical. Control: making the plan default the
      cover field to `"cover"` when none was declared fails two of them. Restored, hash-verified.

## PHASE 3: REMOVE THE CHOICE

- [x] **T5** Remove gallery from the view picker, the add-view sheet, and every menu — REQ-002.
      *Closed.* `toolbar-renderer.ts` filters the option out unless the current view already is one,
      because a control that hid the value it is displaying would show a blank. The `.base` importer
      no longer maps `cards` to gallery either — that path made "no surface offers it" true of the
      pickers and false of the plugin.

## PHASE 4: REMOVE THE INSTRUMENTS AND THE RENDERER

> **T6, T7 and T8 were gated, not pending, and the gate has since resolved.** The accepted decision
> kept the renderer shipped so an undone migration still drew, which meant the bench, the captures,
> the renderer and the coverage floor all stayed until the deletion. `specs/007-gallery-view-deprecation`
> performed that deletion — see the evidence beneath each task below.

- [x] **T6** Remove the bench, runner, captures, story entries and both assertion scenarios in one
      change — REQ-003, D2.
      *Closed 2026-09-06 by `specs/007-gallery-view-deprecation`'s child `003-remove-renderer-and-harness`
      (`fb27ba5b`).* `npm run screenshots:verify` green with the scenarios gone; the constructed-render
      assertion harness carries no gallery construction, bag or tag function; `003/implementation-summary.md`
      itemises each removal.
- [x] **T7** Delete `gallery-renderer.ts` and its action bag — REQ-003.
      *Closed 2026-09-06 (`fb27ba5b`).* `src/views/gallery-renderer.ts` (787 lines) is gone;
      `npx tsc --noEmit` exit 0 with no unreferenced-symbol fallout (`003/implementation-summary.md`).
- [x] **T8** Lower the coverage ratchet to its new floor with its reason beside the number —
      REQ-004, D3.
      *Closed 2026-09-06 (`fb27ba5b`, re-stamped `932fa3a9`).* `tools/live/renderer-coverage.json`
      reads `"constructed": 5, "total": 20, "note": "was 6/21; gallery renderer retired"` on the tree
      today, shipped in release **0.0.28** (`d3433d81`).

## PHASE 5: VERIFICATION

- [x] **T9** The board is unchanged — REQ-005, D1.
      *Evidence to close:* board captures byte-identical to T2's baseline, or every difference
      explained. A difference means the deletion left the gallery and the fix is to narrow it.
- [x] **T10** Whole gate from the final state — REQ-006. **23 green, exit 0 read from `$?`.**
      *Evidence to close:* `npm run gate` exit 0 read from `$?`; `npx vitest run` with no reduction
      in count.
- [ ] **T11** The operator opens a previously-gallery database on device.
      *Evidence to close:* the operator says it opens and shows something coherent. Nothing else
      closes this. **2026-09-06:** the renderer T7 deleted means this can no longer show a rendered
      gallery even via undo — only a board. The row is superseded by
      `specs/007-gallery-view-deprecation/goal.md`'s own operator-confirmation criterion, which asks
      for the same device check in its current, permanent form. Left unticked here as the record of
      what this phase itself never reached.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION

This phase is complete when T11 closes — the operator opening a previously-gallery database on
their own device. Every other task is a precondition for asking them to.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- Scope, risks and the blocking question: [`spec.md`](spec.md)
- Order and ADR-001: [`plan.md`](plan.md)
- The ratchet this phase lowers: [`../026-production-render-assertions/goal.md`](../026-production-render-assertions/goal.md)
<!-- /ANCHOR:cross-refs -->
