---
title: "Goal: Usage and Migration Audit"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "001-usage-and-migration-audit goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit"
    last_updated_at: "2026-09-08T08:30:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive"
    next_safe_action: "Execute against the completion criteria"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "001-usage-and-migration-audit-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Usage and Migration Audit

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every live calendar/timeline/chart view (operator vault and fixtures) is named with its redirect target before Phase 2 ships anything.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Nothing is removed before this audit closes |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Inventory table produced naming every live view of the three types
- [ ] Redirect target decided and reasoned for every view found
- [ ] DatabaseViewType retention-vs-redirect decision recorded
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
