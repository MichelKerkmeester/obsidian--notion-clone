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
    packet_pointer: "public/005-component-surface-system/030-gallery-view-deprecation"
    last_updated_at: "2026-08-31T14:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Task list drafted; T1 blocks the rest"
    next_safe_action: "Close T1 with the operator"
    blockers:
      - "T1 is blocking and belongs to the operator"
    key_files:
      - "plan.md"
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-030-tasks"
      parent_session_id: null
    completion_pct: 0
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

- [ ] **T1** Close the migration question — REQ-001, ADR-001. **Blocking.**
      *Evidence to close:* an operator decision recorded in this folder naming board, table, or
      refuse-with-explanation, with the reasoning from `plan.md` §2 put in front of them. Every
      task below depends on the answer and two of them change shape entirely.

## PHASE 2: THE DATA PATH, WHILE THE GALLERY STILL WORKS

- [ ] **T2** Capture the board control baseline — D1.
      *Evidence to close:* the board's four captures and its production-render assertion recorded
      before any change, so "unchanged" later has something to be measured against.
- [ ] **T3** Implement the migration decided in T1 — REQ-001.
      *Evidence to close:* a database whose config says `gallery` resolves to the decided target,
      with the old renderer still present. Both paths work at this commit.
- [ ] **T4** Prove the migration on a config the plugin did not author — REQ-001.
      *Evidence to close:* a hand-written vault config carrying `gallery` opens. A config the
      plugin wrote itself proves only that it can read its own output.

## PHASE 3: REMOVE THE CHOICE

- [ ] **T5** Remove gallery from the view picker, the add-view sheet, and every menu — REQ-002.
      *Evidence to close:* no surface offers it; a grep over the view-type choices returns nothing.

## PHASE 4: REMOVE THE INSTRUMENTS AND THE RENDERER

- [ ] **T6** Remove the bench, runner, captures, story entries and both assertion scenarios in one
      change — REQ-003, D2.
      *Evidence to close:* `npm run screenshots:verify` green with the scenarios gone rather than
      stale; story coverage green; the assertion harness runs without the gallery scenarios.
- [ ] **T7** Delete `gallery-renderer.ts` and its action bag — REQ-003.
      *Evidence to close:* `npx tsc --noEmit` exit 0 with no unreferenced-symbol fallout.
- [ ] **T8** Lower the coverage ratchet to its new floor with its reason beside the number —
      REQ-004, D3.
      *Evidence to close:* `renderer-coverage.json` publishes the new floor; the check passes at
      it; the reason is recorded in `../026`'s log, not only in a commit message.

## PHASE 5: VERIFICATION

- [ ] **T9** The board is unchanged — REQ-005, D1.
      *Evidence to close:* board captures byte-identical to T2's baseline, or every difference
      explained. A difference means the deletion left the gallery and the fix is to narrow it.
- [ ] **T10** Whole gate from the final state — REQ-006.
      *Evidence to close:* `npm run gate` exit 0 read from `$?`; `npx vitest run` with no reduction
      in count.
- [ ] **T11** The operator opens a previously-gallery database on device.
      *Evidence to close:* the operator says it opens and shows something coherent. Nothing else
      closes this.
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
