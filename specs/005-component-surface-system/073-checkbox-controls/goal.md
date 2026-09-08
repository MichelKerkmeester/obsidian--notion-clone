---
title: "Goal: Checkbox Controls (Size and Radio Removal)"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "073 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "073-checkbox-controls"
    last_updated_at: "2026-09-08T08:20:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the durable directive from the operator's R3 report"
    next_safe_action: "Inventory every radio-style control before converting any of them"
    blockers: []
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "073-checkbox-controls-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Checkbox Controls (Size and Radio Removal)

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Phone checkboxes are sized to match the Notion/Anytype reference, and every radio-style input in the app is inventoried and converted to a checkbox or the correct non-radio equivalent.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No control is converted before the full radio inventory exists and records each control's real semantics (boolean vs. exclusive-choice) |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Radio inventory complete, cross-checked against an independent grep count
- [ ] Every inventoried boolean radio-style control converted to a checkbox
- [ ] Phone checkbox size measured and reduced to match the Notion/Anytype reference
- [ ] The board card's "Pinned"-style control specifically renders as a checkbox with its real value, not a bare "0" (dependent on 070 restoring property reads)
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
| None yet | Work has not started |
<!-- /ANCHOR:log -->
