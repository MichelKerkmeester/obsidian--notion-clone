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
    packet_pointer: "005-component-surface-system/075-toolbar-labelled-buttons"
    last_updated_at: "2026-09-08T09:46:00Z"
    last_updated_by: "code-agent"
    recent_action: "Implemented, verified (26 green gate), and documented; AC-001..005 Met"
    next_safe_action: "Awaiting the operator's own device confirmation (AC-006)"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "decision-record.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "075-toolbar-labelled-buttons-implementation"
      parent_session_id: "075-toolbar-labelled-buttons-scaffold"
    completion_pct: 90
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

- [x] Phone toolbar controls render as icon+label buttons matching the reference's measured size and spacing
- [x] Touch targets measure ≥44×44px
- [x] The existing 009/044 toolbar-collapse and sheet-grammar lanes rerun and pass (unaffected by the phone-only edit), and a new scroll-overflow lane (402px viewport, `scrollWidth > clientWidth`, last control reachable) is red-then-green
- [x] Desktop toolbar decision recorded as an ADR
- [ ] Operator device row recorded and left unticked
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Implemented, verified, gate green | Done | `implementation-summary.md` §Verification, `acceptance-criteria.md` AC-001..005 Met, `npm run gate` 26 green |

### Deviations and findings

| Item | Note |
|------|------|
| Desktop unaffected | ADR-001 (`decision-record.md`): desktop and the embedded/codeblock toolbar keep their existing icon-only row; only the full phone view gained labels |
| 009/044 lanes needed no behavioural change | Both mount the embedded/desktop shape ADR-001 leaves untouched; reran with identical results before/after, confirming rather than assuming no regression |
| Pre-existing, unrelated `engine-parity.mjs` failure | Present on the unmodified tree too (verified by stash/rerun); not this packet's controls, left for a separate fix |
<!-- /ANCHOR:log -->
