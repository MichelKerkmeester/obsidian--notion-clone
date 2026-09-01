---
title: "Implementation Plan: Gallery View Deprecation"
description: "How the gallery view is removed, in an order where the board stays provably unaffected and no user database is left unopenable."
trigger_phrases:
  - "030 plan"
  - "gallery deprecation plan"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/030-gallery-view-deprecation"
    last_updated_at: "2026-08-31T14:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Plan drafted against the measured footprint"
    next_safe_action: "Answer ADR-001 before executing any task"
    blockers:
      - "ADR-001 is Proposed, not Accepted"
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-030-plan"
      parent_session_id: null
    completion_pct: 67
    open_questions:
      - "ADR-001: which migration target"
    answered_questions:
      - "Order is decided by reversibility: config path first, deletion last"
---
# Implementation Plan: Gallery View Deprecation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER, AND WHY THIS ORDER

Deletion is the least reversible step and the easiest to do first, which is the trap. The order
below puts the data path before the deletion so that at no point does a build exist which removes
the renderer while old configurations still point at it.

1. **Answer the migration question** (ADR-001). Nothing else starts.
2. **Land the migration path** while the gallery still renders. A gallery-configured database now
   resolves to its migration target, and both the old and new paths work. This step is
   independently shippable and independently revertible.
3. **Remove the choice.** Gallery disappears from the picker, the add-view sheet, and any menu. No
   new gallery views can be created; existing ones already migrate.
4. **Remove the instruments together** — bench, runner, captures, scenarios, story entries — in one
   change, per D2.
5. **Delete the renderer** and its now-unreferenced action bag.
6. **Lower the coverage ratchet** to its new floor, with the reason recorded beside the number.
7. **Verify from the final state**, board control included.
<!-- /ANCHOR:summary -->

<!-- ANCHOR:architecture -->
## 2. ADR-001 — the migration target (**Proposed**, not Accepted)

**Context.** `DatabaseViewType` includes `"gallery"`, and that string is persisted in user vault
files. Removing the renderer without a decision leaves those databases pointing at nothing.

**Options.** Migrate to board (closest presentation, largest change); migrate to table (safest
render, least similar); or keep the value accepted and render an explanatory empty state (smallest
change, worst outcome for a user who did nothing wrong).

**Recommendation, for the operator to accept or reject:** migrate to **board**. It is the gallery's
structural twin — one card per row through the same field pipeline — so the user's data keeps a
recognisable shape rather than becoming a table of rows or a dead end. The cost is that the
migration is a real config rewrite rather than a fallback branch.

**Status: Proposed.** D5 blocks execution until this is Accepted.
<!-- /ANCHOR:architecture -->

<!-- ANCHOR:testing -->
## 3. WHAT MAKES THE BOARD CONTROL CREDIBLE

The board already has captures and a production-renderer assertion. Running both before and after
the deletion costs nothing extra and answers the one question this plan is most likely to get
wrong: whether a deletion stayed inside the gallery or reached into shared card code.

A board that changes is not a board regression to debug — it is proof the deletion went too far,
and the correct response is to narrow the deletion rather than to fix the board.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:rollback -->
## 4. WHAT THIS PLAN DELIBERATELY DOES NOT DO

- It does not touch `card-field-renderer.ts`. Every non-table view renders through it.
- It does not decompose into sub-phases despite the scorer suggesting three. This folder is already
  a child of a phase parent, and nesting another parent requires both qualification thresholds
  independently — not one of them plus a suggestion.
- It does not remove the gallery from the type union until ADR-001 says whether the value must
  remain accepted for old configs.

**Rollback.** Every step before the deletion is a working-tree change on a tracked file and reverts
with `git revert`. The deletion itself is recoverable from history for as long as the branch exists,
but the migration in step 2 rewrites user configuration on load — that one is not reversible by
reverting code, because the rewrite has already happened in the user's vault. It therefore ships
only after ADR-001 is Accepted, and the migration must be idempotent so a re-run cannot compound.
<!-- /ANCHOR:rollback -->

<!-- ANCHOR:quality-gates -->
## 5. AI EXECUTION PROTOCOL

### Pre-Task Checklist

Before any file in this phase is touched:

- [ ] ADR-001 is **Accepted**, not Proposed. D5 blocks everything on it, and the answer changes
      whether this phase writes a migration or only deletes files.
- [ ] The board control baseline is captured (T2). "Unchanged" needs something to be measured
      against, and capturing it after the deletion proves nothing.
- [ ] The renderer-coverage floor is known before it moves, so lowering it is an act rather than a
      discovery.

### Execution Rules

1. **Order is not negotiable.** The data path ships before the deletion, so no build ever exists
   that removes the renderer while old configurations still point at it.
2. **The board is the control.** If the board moves, the deletion reached shared code — narrow the
   deletion, do not fix the board.
3. **Delete the instruments together.** A half-removed view is worse than either state.
4. **Read exit codes directly.** A pipe makes `$?` the pipe's status.
5. **Regenerate metadata after any spec-doc edit** in this folder, or the fingerprint check fails.

### Status Reporting Format

Each task reports: the task id, what ran, its exit code read directly, and the observation that
closes it. Shipped, verified and operator-confirmed are distinct words here and are not
interchangeable — only the third closes anything.

### Blocked Task Protocol

Halt and report rather than proceeding if: ADR-001 is still Proposed; the board's captures move and
the cause is not immediately located in gallery-owned code; a gallery string is found in a code path
this spec did not inventory; or `npm run gate` is red for a reason this phase introduced. Report the
blocker with its evidence and the decision needed — do not route around it.
<!-- /ANCHOR:quality-gates -->
