---
title: "Implementation Plan: List Virtualisation"
description: "Window the rendered row range without breaking the three contracts that assume every row exists."
trigger_phrases: ["033 plan", "033 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/033-list-virtualisation"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened as the only remaining lever on the list freeze"
    next_safe_action: "Record the three row contracts before windowing exists"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033"
      parent_session_id: null
    completion_pct: 0
    open_questions: ["Does windowing break drag, range selection or group collapse"]
    answered_questions: ["The shape is LINEAR; layout over node count is the remaining cost"]
---
# Implementation Plan: List Virtualisation

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER

1. Prove the three row contracts against an off-window row **before** windowing exists, so their
   current behaviour is recorded rather than remembered.
2. Window the row range.
3. Re-prove the three contracts.
4. Re-measure past 3,200 rows.
<!-- /ANCHOR:summary -->

<!-- ANCHOR:architecture -->
## 2. WHAT WINDOWING MUST NOT BREAK

Row drag, range selection and group collapse all assume today that every row exists in the DOM.
Windowing removes that assumption, and those three are where it will fail first. They are named as
requirements rather than discovered as regressions.
<!-- /ANCHOR:architecture -->

<!-- ANCHOR:testing -->
## 3. VERIFICATION

The budget is blocked main thread — render plus forced layout — at the operator's confirmed shape
and phone-class throttle, because those are the conditions the freeze was reported under. A verdict
from a range stopping below 3,200 rows cannot see this defect and does not count.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:rollback -->
## 4. ROLLBACK

Windowing is contained to the row-range decision. Reverting restores full rendering, which is slow
but correct — so the rollback is always safe, and the risk is regression in the three contracts
rather than in correctness of output.
<!-- /ANCHOR:rollback -->

<!-- ANCHOR:quality-gates -->
## AI EXECUTION PROTOCOL

### Pre-Task Checklist
- [ ] Every check named below has been observed failing before it is trusted.
- [ ] Exit codes are read directly; a pipe makes `$?` the pipe's status.

### Execution Rules
1. Observe red before green; a check that never failed is not evidence.
2. Re-derive numbers from the tree, never from another document.
3. Regenerate metadata after any spec-doc edit in this folder.

### Status Reporting Format
Task id, what ran, exit code read directly, and the observation that closes it. Shipped, verified
and operator-confirmed are distinct and not interchangeable.

### Blocked Task Protocol
Halt and report with evidence and the decision needed rather than routing around a blocker.
<!-- /ANCHOR:quality-gates -->
