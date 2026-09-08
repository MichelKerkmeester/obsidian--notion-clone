---
title: "Goal: Phone Toolbar Labelled Buttons"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "075 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "075-toolbar-labelled-buttons"
    last_updated_at: "2026-09-08T08:52:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive from R14 and its reference"
    next_safe_action: "Measure the reference for label size and spacing"
    blockers: []
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "075-toolbar-labelled-buttons-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Phone Toolbar Labelled Buttons

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The phone toolbar's controls carry icon+label buttons matching the operator's Notion/Anytype/Bases reference, meet the 44px touch-target minimum, and the row scrolls horizontally instead of wrapping or collapsing when it exceeds the viewport width.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Never wrap or collapse the labelled toolbar row on phone — scroll only |
| D2 | The desktop toolbar decision is explicit, recorded as an ADR, not left implicit |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Phone toolbar controls render as icon+label buttons matching the reference's measured size and spacing
- [ ] Touch targets measure ≥44×44px
- [ ] The existing 009/044 toolbar-collapse and sheet-grammar lanes updated red-first, then a new scroll-overflow lane (402px viewport, `scrollWidth > clientWidth`, last control reachable) is green
- [ ] Desktop toolbar decision recorded as an ADR
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
