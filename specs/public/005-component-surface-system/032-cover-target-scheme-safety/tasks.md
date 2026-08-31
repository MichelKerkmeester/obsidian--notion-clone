---
title: "Tasks: Cover Target Scheme Safety"
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
    completion_pct: 0
    open_questions: ["Is this P0 once the onerror teardown is weighed"]
    answered_questions: ["The safe helper already exists and text links use it"]
---
# Tasks: Cover Target Scheme Safety

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [ ] **T1** Write the failing control — REQ-001.
      *Evidence to close:* the three exploit strings reach `window.open` today, asserted.
- [ ] **T2** Route covers through the existing allowlist helper — REQ-001.
      *Evidence to close:* T1 inverts; the three strings are rejected.
- [ ] **T3** Rewrite the tests that pinned the vulnerable behaviour — REQ-003.
      *Evidence to close:* the tests assert rejection, with the reason recorded beside them.
- [ ] **T4** Audit `window.open` sites for `noopener` — REQ-002.
      *Evidence to close:* every external open passes it, or the exception is named.
- [ ] **T5** Legitimate covers still open — REQ-004.
      *Evidence to close:* an http cover and a vault-internal cover both render and open.
- [ ] **T6** Answer the severity question in `spec.md` §1.
      *Evidence to close:* a recorded decision, not one lane's label adopted verbatim.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T2 through T6 close and `npm run gate` exits 0.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · parent [`../spec.md`](../spec.md)
<!-- /ANCHOR:cross-refs -->
