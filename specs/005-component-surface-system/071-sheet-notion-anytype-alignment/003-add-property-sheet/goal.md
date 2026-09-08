---
title: "Goal: Add-Property Sheet Redesign"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "003-add-property-sheet goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/003-add-property-sheet"
    last_updated_at: "2026-09-08T22:59:00Z"
    last_updated_by: "003-implementation-leg"
    recent_action: "All three completion criteria met; leg verified, gate 27/0"
    next_safe_action: "Fresh land-verify, then 071-002-settings-sheet takes the css-lane"
    blockers: []
    key_files: ["src/views/modals/create-property-modal.ts", "src/views/modals/create-property-modal.test.ts", "styles.css", "tools/live/sheet-grammar.mjs"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-add-property-sheet-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Add-Property Sheet Redesign

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The property-type picker sheet no longer covers the note header while the keyboard is open, and matches its mapped reference, closing R6.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Keyboard-overlap defect is reproduced before it is fixed |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Keyboard-overlap defect reproduced (red) before any fix — grammar's `properties create property` lane with the fix's styles.css rules stashed: 16px-padding FAIL, list scroll `210>210` FAIL; the device keyboard path itself reports clearance already held unfixed (top 84.4 ≥ 44.0), so the overlap defect rides the keyboard/height assertions while the failures name the new layout rules. Unit red: reverting the gated-reason producer line → 1 failed | 7 passed
- [x] Keyboard-overlap defect fixed (green) — styles.css `8991c15f8106`: sheet top 238.4px ≥ header bottom 44.0px, height 261.6 ≤ 464.0 (viewport − 336 keyboard − 44 header), 21 rows pitch 44.0/44.0, no 402×874 overflow; gate 27 green / 0 red
- [x] Property-type picker redesigned and recaptured against its mapped reference — the absorbed 21-row list per spec §4b's targets (pitch, icon + label, 16px insets, pinned name field); the before/after is the lane's printed numbers — the family has no committed PNG and the reference harvests carry no pixel measurements (see acceptance-criteria.md's evidence block)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| D1 reproduced before fixed | Done | 2026-09-08 — device-path RED (stashed-styles lane: padding/scroll/pitch FAIL) then GREEN, numbers in acceptance-criteria.md |
| Sheet redesigned, leg verified | Done | 2026-09-08 — gate 27 green / 0 red, vitest 1731/1731, css-lane released at 8991c15f8106, validated strict |

### Deviations and findings

| Item | Note |
|------|------|
| Keyboard clearance passed unfixed | The lane's note-header assertion held even without the new styles (top 84.4 ≥ 44.0): the operator's tall-sheet overlap is bounded by the keyboard/height arithmetic, and this leg's RED therefore failed on the new pitch/padding/scroll assertions — recorded, not hidden |
| 071-002 remains open | This leg left the css-lane held by 003-add-property-sheet at its release hash; 002 takes it from there |
<!-- /ANCHOR:log -->
