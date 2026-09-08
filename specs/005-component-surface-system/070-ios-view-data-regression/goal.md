---
title: "Goal: iOS view data regression"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "070 goal"
  - "ios view data regression completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "070-ios-view-data-regression"
    last_updated_at: "2026-09-08T08:44:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive from R1 and its 08:44 clarification"
    next_safe_action: "Reproduce the empty-property read, cold-cache case first"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "070-ios-view-data-regression-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: iOS View Data Regression

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every property on every database view renders its frontmatter value on iOS exactly as it does on desktop, proven by a red-before-green harness reproduction rather than a defensive patch.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The bug is a read/render regression, not a data-loss event: frontmatter and the view definition are both confirmed intact on disk, and the note-database plugin's removal is confirmed not to be the cause |
| D2 | The fix must be traced to a confirmed root cause with file:line evidence before it is written; a patch applied against an unconfirmed suspect does not close this packet |
| D3 | The metadata-cache-cold case is a named, separate acceptance criterion from the warm-cache case |
| D4 | Only the operator's own device recheck may close the device row; no agent ticks it |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes
(objective, a decision, the binding table, a criterion), resend the full text
of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] The harness reproduces the empty-property read against a fixture mirroring the operator's shapes, cold-cache case included, before any fix
- [ ] Root cause identified with file:line evidence among data-source.ts, title-field-display.ts, legacy-plugin-data-migration.ts, or a confirmed fourth cause
- [ ] Fix lands with a test proven to fail against the pre-fix code and pass after
- [ ] Finance Reports table and Database Testbed board both recaptured showing populated properties
- [ ] Operator device row recorded and left unticked pending the operator's own re-check
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |

### Deviations and findings

| Item | Note |
|------|------|
| None yet | Investigation has not started |
<!-- /ANCHOR:log -->
