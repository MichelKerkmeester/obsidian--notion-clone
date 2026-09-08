---
title: "Goal: Linked View Blocks UX and Mobile Drag Parity"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "072 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "072-linked-view-blocks-ux"
    last_updated_at: "2026-09-08T08:07:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the durable directive from the operator's R2 report"
    next_safe_action: "Determine which surface R2 names before fixing anything"
    blockers: []
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "072-linked-view-blocks-ux-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Linked View Blocks UX and Mobile Drag Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** R2's ambiguous "separate views… bugged" and "dragging doesnt work on mobile like it would on notion" is resolved into a named, confirmed surface, and mobile drag on that surface matches Notion's own feel.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The surface is determined against the shipped 0.0.32 build, not assumed from the report's wording alone |
| D2 | Board cross-group drag is out of scope — already shipped in `069` |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Surface determination complete: R2 traced to embedded/linked views, table drag, or both, with file:line evidence
- [ ] UI/UX defects on the confirmed surface(s) enumerated
- [ ] Mobile drag on the confirmed surface(s) fixed and measured against a Notion reference capture
- [ ] Operator device row recorded and left unticked
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
