---
title: "Implementation Plan: Cover Target Scheme Safety"
description: "Route cover targets through the allowlist the rest of the plugin already uses."
trigger_phrases: ["032 plan", "032 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/032-cover-target-scheme-safety"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from review findings F001 and F010"
    next_safe_action: "Write the failing control before touching the parser"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-032"
      parent_session_id: null
    completion_pct: 100
    open_questions: ["Is this P0 once the onerror teardown is weighed"]
    answered_questions: ["The safe helper already exists and text links use it"]
---
# Implementation Plan: Cover Target Scheme Safety

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER

1. Write the control first: assert the three exploit strings are rejected. It must fail today.
2. Route cover targets through `normalizeExternalUrlTarget`, the helper text links already use.
3. Rewrite the tests that pin the old behaviour, recording why they changed.
4. Audit the remaining `window.open` sites for `noopener`.
<!-- /ANCHOR:summary -->

<!-- ANCHOR:architecture -->
## 2. NO NEW HELPER

The allowlist exists and is used by every safe sink in the plugin. Adding a second one would create
two definitions of "safe URL" that drift. This phase changes which function the cover path calls,
and nothing else.
<!-- /ANCHOR:architecture -->

<!-- ANCHOR:testing -->
## 3. VERIFICATION

The control is three literal strings — a `javascript:`, a `data:` and a `file:` target each ending
in an image extension. They pass both gates today; they must be rejected after. A valid http cover
and a vault-internal cover must still open, or the fix has traded a hole for a regression.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:rollback -->
## 4. ROLLBACK

One code path and its tests; `git revert` restores both.
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
