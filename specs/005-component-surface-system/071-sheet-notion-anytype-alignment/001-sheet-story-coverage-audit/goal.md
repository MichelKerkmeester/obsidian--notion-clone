---
title: "Goal: Sheet Story Coverage Audit"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "001-sheet-story-coverage-audit goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit"
    last_updated_at: "2026-09-08T08:20:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive"
    next_safe_action: "Execute against the completion criteria"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "001-sheet-story-coverage-audit-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Story Coverage Audit

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** One inventory table names every sheet/panel/popover the app can open, its story/screenshot coverage state, and its Notion/Anytype reference mapping.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No later phase may claim coverage without a row here naming it |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Inventory table produced, naming every sheet-capable surface
- [ ] Every row names a coverage state and a reference mapping (or its absence)
- [ ] Same-session coverage gaps closed
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
