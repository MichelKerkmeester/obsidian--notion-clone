---
title: "Implementation Summary: Sheet Lifecycle Ownership"
description: "The backdrop leak is fixed and guarded by a new gate lane; the two drag causes and the dead handles remain."
trigger_phrases:
  - "031 implementation summary"
  - "sheet teardown shipped"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-08-31T19:00:00Z"
    last_updated_by: "phase-implementer"
    recent_action: "Backdrop leak fixed; parity check observed red first and now a gate lane"
    next_safe_action: "T4, the group sheet: re-assert chrome after the panel empties"
    blockers:
      - "Nothing here is confirmed on the operator's device"
    key_files:
      - "goal.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-impl"
      parent_session_id: null
    completion_pct: 33
    open_questions:
      - "Does a returned disposer still earn its place now the watcher makes callers correct?"
    answered_questions:
      - "The watcher closes the defect without changing any producer"
      - "A sheet still on the body is an open sheet; holding the backdrop for it is correct"
---
# Implementation Summary: Sheet Lifecycle Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 031-sheet-lifecycle-ownership |
| **Level** | 2 |
| **Status** | In progress — 2 of 6 criteria met, backdrop leak fixed and guarded |
| **State** | Working tree; gate 17 green, exit 0. Not device-confirmed |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT SHIPPED

**The backdrop is now a property of whether a sheet is still in the document**, rather than of
whether a sheet class can be found in the DOM.

A per-document set of live sheets, plus a `MutationObserver` that prunes it whenever a node leaves,
and drops the backdrop when the last sheet goes. Registration happens at mount, before either mount
branch can return; deregistration at teardown.

**No producer was changed.** That is the point of the shape: the producers that never call teardown
are the ones that leak, so a fix requiring them to call something new would have to change every one
of them and would break again with the next producer. A caller that only does `.remove()` is now
correct by construction.

**A new gate lane, `sheet-teardown`**, takes the gate from 16 lanes to 17.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. THE CHECK, AND WHY IT IS A PARITY CHECK

One producer already did this correctly — the owned menu takes its chrome down before removing its
node, and its own comment says why. Every other producer is compared against it **in the same run**.

That asymmetry is what makes the result hard to fake: a harness would have to report a pass for the
reference and a failure for a leaker, from one code path, to produce a false green. This is D12's
shape — two independent producers, one wrong answer insufficient.

The existing placement check does assert a backdrop "arrives with the menu and leaves with it", but
only against that same reference, and elsewhere it removes a leaked backdrop **by hand** so later
checks can run. It tidied away the evidence of the defect in order to keep testing. That is this
packet's own lens turned on its own instrument.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION

| Property | Evidence |
|---|---|
| The check discriminates | Observed **red first**: owned menu and record panel PASS, the three positioner-mounted families FAIL, exit 1 |
| The check still catches the defect | Whole pre-fix file restored from HEAD as a control: the same three go red again, exit 1 |
| The compounding failure is gone | A detached leak no longer blocks a later correct teardown |
| Types | `npx tsc --noEmit` exit 0 |
| Tests | `npx vitest run` — 531 passed, no reduction |
| Gate | `npm run gate` — **17 green, exit 0**, read from `$?` |
| Captures | Recaptured and read; the owned menu sheet renders unchanged |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE

No Obsidian host is constructed, so the check measures the **chrome contract**, not any particular
caller's lifecycle. A producer whose close path is never reached on a device would pass here and
still leak there.

**Nothing is device-confirmed.** The operator reported this as the app freezing on close; that
report closes when they say it no longer does, and not before.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DEVIATIONS, AND TWO ERRORS OF MINE

| Item | Note |
|---|---|
| Watcher shipped, disposer did not | The plan's ADR-001 proposed both. The set alone closes the defect, and a disposer still has to be *called* by producers that demonstrably never call the teardown they already have. Recorded as a deviation; a disposer can follow if a caller wants explicit control |
| Registration was in the wrong place first | It went in after the body move, which skips the early-return branch a body-mounted surface takes — so the owned menu, the one producer that behaves, would have been invisible to the watcher and could have had its backdrop pulled while still open. Caught by re-reading both branches |
| The compounding test asserted the opposite of the truth | It re-attached its "leaked" panel to the body, which makes it an **open** sheet — and holding the backdrop up for an open sheet is correct. A detached leak is what `.remove()` produces, and the case now models that. The check was failing on a wrong expectation, not a wrong fix |
| The watcher is asynchronous | `MutationObserver` fires as a microtask, so the check awaits a microtask and a frame before reading. A backdrop still present after a rendered frame is one the user has seen |
<!-- /ANCHOR:decisions -->
