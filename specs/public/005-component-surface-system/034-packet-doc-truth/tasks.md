---
title: "Tasks: Packet Documentation Truth"
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
# Tasks: Packet Documentation Truth

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [ ] **T1** Correct the six parent-spec findings — F004, F007, F008, F011, F012, F014.
      *Evidence to close:* each re-derived from the tree, citing its source.
- [ ] **T2** Correct the child findings — F003, F005, F006, F009.
      *Evidence to close:* same standard, per child.
- [ ] **T3** Correct the code comment documenting a deleted API — F015.
      *Evidence to close:* the comment names what exists; no tracker ids in code comments.
- [ ] **T4** Answer the mechanical-check question.
      *Evidence to close:* either a script that catches one class, or the recorded reason none can.
- [ ] **T5** Metadata regenerated for every folder touched — REQ-004.
      *Evidence to close:* `validate.sh --strict` Errors: 0 for each. This step was missed twice in
      the session that opened this phase, which is why it is a task rather than an assumption.
- [ ] **T6** Re-run the review dimension that raised them.
      *Evidence to close:* no corrected finding is re-raised.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when all eleven are closed or explicitly declared still-true with evidence.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · the findings: [`../handover.md`](../handover.md) §7
<!-- /ANCHOR:cross-refs -->
