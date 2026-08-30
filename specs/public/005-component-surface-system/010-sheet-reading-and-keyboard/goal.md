---
title: "Goal: Sheet Reading Rhythm and Keyboard Avoidance"
description: "What would make phase 010 worth having done, and the criteria that decide it."
trigger_phrases:
  - "010 goal"
  - "sheet reading goal"
  - "keyboard avoidance goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/010-sheet-reading-and-keyboard"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored after shipping; 16 criteria measured, keyboard half mechanism-only"
    next_safe_action: "Operator opens a record on the device and edits a field"
    blockers:
      - "spec.md continuity says 0% and not started; implementation-summary.md says 90% and shipped"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-010-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Does the operator's handset shrink visualViewport or resize the window"
    answered_questions: []
---
# Goal: Sheet Reading Rhythm and Keyboard Avoidance

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A record opened on a phone reads as label-and-value pairs, and the field being edited
stays visible when the keyboard opens.

It did neither. Values were pinned to the right edge, so the eye paired each value with the value
above it rather than with its own label. And the sheet is `position: fixed; bottom: 0`, docked to the
**layout** viewport, which a software keyboard does not change.

**Both halves were measured before either was designed**, which is the part worth keeping. The two
screenshots were luminance-thresholded per row band and decomposed into ink runs, turning an
aesthetic complaint into a shape: the Notion reference's value column **starts** at a fixed 154.7px
and ends ragged; the plugin's **ended** at a fixed 382.7px and started ragged across 51.0px.
Fixed-end against fixed-start is the signature of `text-align: right` against a fixed column, and it
named the defect precisely enough to fix. The keyboard mechanism was read out of Obsidian's shipped
bundle rather than inferred: the host declares `--keyboard-height` on `:root` and shrinks
`.app-container` with it, and the sheet is portalled to `document.body`, a **sibling** of that
container. The lever already existed and was always being written zero.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The host variable is primary and the visual viewport is a fallback, combined with `max()`. Anything else puts the sheet on a different number from the toolbar riding beside it. |
| D2 | The label gets a fixed 96px basis, not a minimum width. A minimum is a floor: a longer label still shoves the value column, which is the defect. |
| D3 | `min-height: 44px` is the one deliberate off-scale value, cited as WCAG 2.5.5 target size. |
| D4 | Where the project's scale and the design skill's default disagree, the project's wins — which is why the label stayed at 13px. |
| D5 | A criterion can fail a correct implementation. Two here were defective before they were met; check both directions. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] Value text starts on one column: left-edge spread ≤ 2px. Was 42.3px across 36 rows.
- [ ] The value column begins at ≤ 40% of sheet width. Was 84%; the reference measures 38.5%.
- [ ] Row pitch ≥ 38px and row height ≥ 44px. Was 28.8px and 26.8px.
- [ ] A hairline divider, no gap between targets, value text ≥ 16px. Was no divider at all, a 2px
      gap, 13px.
- [ ] A 36-character label moves the value **box** ≤ 1px. Moved 115px.
- [ ] On a reported keyboard the sheet's bottom sits within 2px of `innerHeight − keyboardHeight` and
      its top stays on screen. Was 844 where 513 was wanted, top 84 with height 760 against 513
      available.
- [ ] Desktop keeps its four measured values — row 26.84px, right-aligned, 2px gap, no divider —
      identical before and after.
- [ ] The five stateful dimensions are covered: semantic identity, transition trace, action outcome,
      resource ownership, negative-control mutation.
- [ ] The operator opens a record on the phone, reads every row as one line, taps a field, and still
      sees it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Shipped and harness-verified. Not operator-confirmed, and the keyboard half is mechanism-verified
only.**

### Two criteria were defective before they were met, and this is where the program learned both shapes

One measured the value's *text* rect — an edge that right-alignment pins by construction — so it
passed against the defect and could never have gone red. The other set a threshold that **forbade the
layout being copied**: it capped the gutter between a label's last glyph and its value's first at
24px, and the reference's own gutters run 11px to 71px. The implementation was right and the
criterion was wrong. Both are rewritten and both carry controls.

### What is not claimed

No software keyboard was ever opened. The keyboard criteria drive the host's *reporting mechanism* at
331px, a value read off the operator's screenshot; they prove the sheet responds correctly to the
signal, never that iOS emits it. And `record-detail-panel.ts` still registers
`onResize = () => close()`: on a host that announces the keyboard by resizing the window, the sheet
is destroyed before any inset can apply. **Which of the two the operator's phone does decides whether
this half is finished or blocked.**

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Reading rhythm | Shipped, verified | 9 criteria, all with a red baseline |
| Keyboard inset | Shipped, mechanism-verified | 6 criteria driven at a reported 331px |
| Desktop non-regression | Verified | 4 values identical before and after |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| Continuity conflict | `spec.md` says 0% and "not started"; `implementation-summary.md` says 90% and shipped, and the working tree agrees with the summary. Recorded in `roadmap.md` §7.6; do not resolve it by picking the nearer file |
| Label at 13px | Deliberate under D4, later raised by `016` as a one-token operator decision. Not a defect |
<!-- /ANCHOR:log -->
