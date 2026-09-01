---
title: "Implementation Plan: Sheet Lifecycle Ownership"
description: "The order the six defects are fixed in, and the structural change that stops the class returning."
trigger_phrases: ["031 plan", "sheet lifecycle plan"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Plan drafted against the six ranked findings"
    next_safe_action: "Build the failing producer-parity check before any fix"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-plan"
      parent_session_id: null
    completion_pct: 83
    open_questions: ["Microtask prune or explicit teardown"]
    answered_questions: ["The check must fail before the fix or it is not discriminating"]
---
# Implementation Plan: Sheet Lifecycle Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER

**The check comes first, and it must go red.** A producer-parity check that passes before the fix
proves nothing, and this packet has shipped that mistake before.

1. Build the producer-parity check. Confirm it **passes for the owned menu and fails for the panel
   families**. That asymmetry is the evidence the check discriminates.
2. Fix the scrim structurally: a live-sheet set plus a disposer returned from mount.
3. Give view-config and column-manager the retained-element pattern filter and sort already use.
4. The group sheet's one line: re-assert chrome after the panel empties.
5. The view sheet's registration: register from a retained reference, not a container-scoped
   selector that misses a portalled node.
6. Wire or remove the modal handles.
7. Velocity dismissal.
8. Move the keyboard inset onto the bar that reads it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:architecture -->
## 2. ADR-001 — a disposer, not a typed surface Root (**Accepted**)

**Context.** The prior research recommended a typed surface handle owning mount, anchor, focus,
dismissal, keyboard, drag and teardown. That is the right diagnosis of the ownership gap.

**Decision.** Adopt only the disposer: mount returns `{ el, close() }`. Back it with a module-level
set of live sheets, pruned on removal, dropping the scrim when the set empties.

**Why not the full shape.** The failure is not that producers lack a rich contract — it is that a
symmetric second call is easy to forget and nothing notices. A disposer fixes exactly that, and the
live-sheet set makes even a caller who ignores the disposer correct. A Root context and a
snap-point machine would be structure this codebase has no present requirement for, and
`overengineering.md` refuses a bigger thing without naming what fails at the smaller one. Nothing
fails at the disposer.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:testing -->
## 3. VERIFICATION

Each fix carries its own observation, and each is falsifiable:

| Fix | Fails now as | Passes after as |
|---|---|---|
| Scrim | scrim survives close on every panel family | no scrim **and** no sheet on the body |
| Group drag | handle absent after toggle, 0.0px | handle present, 120px dismisses |
| View registration | `dismissPanel` returns false on a phone | returns true |
| Modal handles | handle drawn, no drag attached | no unwired handle exists |
| Velocity | a 60px flick springs back | a flick dismisses |
| Inset | per-write cost grows with row count | flat in row count |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:rollback -->
## 4. ROLLBACK

Every step is a working-tree change to tracked files and reverts with `git revert`. The disposer is
additive — the existing symmetric call keeps working while callers migrate — so no step requires a
coordinated cutover, and the phase can stop after any numbered item with the tree in a working state.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:quality-gates -->
## 5. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] The producer-parity check exists and has been **observed failing** on the panel families.
- [ ] The two drag causes are held apart; no single fix is claimed for both.
- [ ] The keyboard-inset item is understood as jank, not the freeze.

### Execution Rules

1. Observe every check red before green. A check that never failed is not evidence.
2. Assert absence of scrim **and** sheet; the scrim alone passes on a leaked panel.
3. Read exit codes directly; a pipe makes `$?` the pipe's status.
4. Regenerate metadata after any spec-doc edit in this folder.

### Status Reporting Format

Task id, what ran, exit code read directly, and the observation that closes it. Shipped, verified
and operator-confirmed are distinct and not interchangeable.

### Blocked Task Protocol

Halt and report if the parity check passes before the fix, if a drag fix appears to close both
causes at once, or if the gate reddens for a reason this phase introduced.
<!-- /ANCHOR:quality-gates -->
