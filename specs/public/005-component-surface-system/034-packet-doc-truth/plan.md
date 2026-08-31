---
title: "Implementation Plan: Packet Documentation Truth"
description: "Correct eleven untrue statements against the tree, and ask whether any class can be checked mechanically."
trigger_phrases: ["034 plan", "034 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/034-packet-doc-truth"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from the eleven documentation findings"
    next_safe_action: "Correct the parent spec first; six of eleven live there"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-034"
      parent_session_id: null
    completion_pct: 0
    open_questions: ["Can a stale line reference be caught by a script"]
    answered_questions: ["Every one of these was true when written and drifted when the tree moved"]
---
# Implementation Plan: Packet Documentation Truth

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER

1. The parent `spec.md` first — six of the eleven live there and it is the most-read document.
2. The child documents.
3. The one code comment (F015).
4. Then ask whether any class can be checked mechanically instead of re-read.
<!-- /ANCHOR:summary -->

<!-- ANCHOR:architecture -->
## 2. CORRECT FROM THE TREE, NOT FROM ANOTHER DOCUMENT

Every one of these was true when written. Correcting one document by copying another propagates the
next drift instead of ending it. Each correction is re-derived from the code or the folder it
describes, and cites what it was derived from so the next reader can re-check it in one command.
<!-- /ANCHOR:architecture -->

<!-- ANCHOR:testing -->
## 3. THE MECHANICAL QUESTION

Two of these classes look greppable: a cited line reference that no longer resolves, and a named
symbol that no longer exists. If either can be checked by a script, the drift stops needing a
reviewer to find it. If neither can, that answer is recorded rather than left implied.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:rollback -->
## 4. ROLLBACK

Documentation only; every change reverts with `git revert` and none of it alters behaviour.
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
