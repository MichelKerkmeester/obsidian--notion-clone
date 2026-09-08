---
title: "Goal: Filter, Sort and Group Sheets Redesign"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "005-filter-sort-group-sheets goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/005-filter-sort-group-sheets"
    last_updated_at: "2026-09-08T08:20:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive"
    next_safe_action: "Execute against the completion criteria"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "005-filter-sort-group-sheets-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Filter, Sort and Group Sheets Redesign

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The filter, sort and group sheets match their mapped reference, and the freeze-prone history (roadmap rows 21-23) stays fixed.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 1 names these sheets' reference |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Phase 1's reference mapping read before redesign starts
- [ ] Sheets redesigned and recaptured against their mapped reference
- [ ] Regression check against the freeze fix in 85ff504 passes
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
