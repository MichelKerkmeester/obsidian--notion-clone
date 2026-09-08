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
    packet_pointer: "005-component-surface-system/073-checkbox-controls"
    last_updated_at: "2026-09-08T14:45:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Implemented and gate-verified; awaiting the operator device check"
    next_safe_action: "Operator device confirmation (AC-005), then close the packet"
    blockers: []
    key_files:
      - "spec.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "073-checkbox-controls-implementation"
      parent_session_id: null
    completion_pct: 90
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

- [x] Radio inventory complete, cross-checked against an independent grep count
  Was 3 radio producer sites (toolbar new-record placement, column-width presets, computed-sync cards); the independent grep count agreed, and the 13 other `radio` mentions in src are selectors, guards or tests, not producers.
- [x] Every inventoried boolean radio-style control converted to a checkbox
  Was 3 radio producers, recorded 3 → 0: the control-geometry pass reports 0 radio-shaped controls across the board, table and panel mounts.
- [x] Phone checkbox size measured and reduced to match the Notion/Anytype reference
  Was 28×28px painted on the phone (coarse-pointer min 28px, measured); now the authored 14–18px glyph with a ≥44px `::before` hit — 94 glyphs re-measured, 3 radios gone.
- [x] The board card's "Pinned"-style control specifically renders as a checkbox with its real value, not a bare "0" (dependent on 070 restoring property reads)
  Pre-fix the value slot read as a bare "0" through 070's then-broken property read; recorded 0 bare-"0" occurrences in the mounted board card (36 checkbox fields, 18 checked).
- [x] Operator device row recorded and left unticked
  Today: 4 of 5 acceptance criteria recorded Met in acceptance-criteria.md; the device row itself stays unticked, operator-owned (AC-005).
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Inventory (3 producers) + cross-check | Done | tasks.md producer inventory; the independent grep finds exactly those 3; the control-geometry pass recounts 0 radios after conversion |
| Conversion | Done | toolbar placement + column-width presets + computed-sync cards; radio producers 3 → 0, measured (touch-targets control-geometry pass) |
| Phone checkbox size | Done | 94 glyphs 28×28 → 14–18px, hit 40×40 → ≥44×44, forced-coarse 390×844; the band is the documented assumption in decision-record.md §1 |
| Board card checkbox + value | Done | 36 checkbox fields, 18 checked, 0 bare-`0` (070 landed at a75a1ae2 first); the control-geometry board mount + the recaptured board captures |
| Evidence + lane | Done | 91 movers reproduced in both recapture runs, 78 content-changed named in the css-lane release at f0948229bfcc; evidence 15/15 fresh; placement 413/415 + 2 declared |
| Device confirmation | Outstanding | AC-005 — the operator's phone, never ticked by an agent |

### Deviations and findings

| Item | Note |
|------|------|
| The R3 screenshot's bare `0` does not reproduce | The value slot renders only the checkbox; the `0` was a sibling number property whose read 070 repaired. 0 bare-`0` fields in the mounted board. decision-record.md §5 |
| The reference band is a documented assumption | The reference manifests carry no glyph metrics; 14–18px, ≥44px target. decision-record.md §1 |
| Engine parity re-measured: 50 disagreements, the committed report's own count | Intrinsic text widths, outside the gate; recorded so it is not rediscovered |
<!-- /ANCHOR:log -->
