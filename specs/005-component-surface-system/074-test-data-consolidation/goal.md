---
title: "Goal: Test Data Consolidation"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "074 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "074-test-data-consolidation"
    last_updated_at: "2026-09-08T08:30:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the durable directive from the operator's R10 report"
    next_safe_action: "Inventory every test/fixture dataset before designing"
    blockers:
      - "Finance data visibility depends on 070 landing"
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "074-test-data-consolidation-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Test Data Consolidation

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** One big consolidated testbed database replaces the project's scattered fixture datasets, and the operator's Finance databases remain the second dataset, visible again once 070 lands.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The operator's own `Database Testbed/` folder is operator-owned; this packet proposes the consolidated shape but does not overwrite it without the operator's own action |
| D2 | "Restored" means visible again, not recovered — 070's diagnosis already found the Finance frontmatter intact on disk |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Every test/fixture dataset the project ships or seeds inventoried
- [ ] One consolidated testbed database designed and built, covering every surviving view/column/grouping/filter/sort/formula/relation
- [ ] Capture, story and phone-smoke harnesses migrated onto the one consolidated database, each re-verified against its own pass/fail criteria
- [ ] Finance databases confirmed visible once 070 lands, documented as the kept second dataset
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
