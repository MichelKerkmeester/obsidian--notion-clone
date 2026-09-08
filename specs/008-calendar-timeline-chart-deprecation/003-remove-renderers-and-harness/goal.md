---
title: "Goal: Remove Renderers and Harness"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "003-remove-renderers-and-harness goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/003-remove-renderers-and-harness"
    last_updated_at: "2026-09-08T08:30:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive"
    next_safe_action: "Execute against the completion criteria"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-remove-renderers-and-harness-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Remove Renderers and Harness

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The three renderers and their harness lanes are removed from the shipped bundle, and the removed code is archived with a documented restore path.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 2's redirect ships |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Renderer source files moved to archive/deprecated-views/<view>/
- [ ] Harness lanes removed; npm run gate still exits 0
- [ ] archive README names the last-live SHA and restore procedure
- [ ] Archival decision recorded as an ADR
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
| None yet | Work has not started |
<!-- /ANCHOR:log -->
