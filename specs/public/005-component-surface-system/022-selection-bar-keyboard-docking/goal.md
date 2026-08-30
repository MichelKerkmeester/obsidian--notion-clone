---
title: "Goal: Dock the Selection Bar to the Keyboard"
description: "The durable directive for the phone selection bar, and the criteria that decide when it is done."
trigger_phrases:
  - "022 goal"
  - "selection bar goal"
  - "keyboard docking directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/022-selection-bar-keyboard-docking"
    last_updated_at: "2026-08-30T20:15:00Z"
    last_updated_by: "phase-reconciliation"
    recent_action: "Goal authored after the fact; 6 of 8 criteria measured green"
    next_safe_action: "Operator selects cells, opens the keyboard, reports what the bar does"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Which host shape is the operator's phone: visualViewport shrink or window resize"
    answered_questions:
      - "Both reported defects are fixed and each carries a browser-produced number"
---
# Goal: Dock the Selection Bar to the Keyboard

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The selection bar sits on top of the keyboard, not under it and not across the rows,
and every one of its actions is readable and reachable at phone width.

**Why.** The bar is the only route to Copy TSV and Copy Markdown. The operator's words: *"You see
that bar floating? It's not really usable."* A control that is present but unusable is worse than an
absent one, because the user believes the feature exists.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Consume the host's `--keyboard-height`. It already publishes the number, and `max()` degrades to the safe floor when it is absent. |
| D2 | Scroll rather than truncate. A shortened label is a control nobody can identify. |
| D3 | Raise the box, not reduce the content. 44px is the thumb floor this surface already holds. |
| D4 | The embed inherits nothing. It has no keyboard to clear. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

The parent packet's `goal.md` outranks this document. Its third decision governs closure here:
shipped, verified and operator-confirmed are three states, and only the third closes anything.

The keyboard-inset mechanism is not this phase's to build. It exists, another phase measured it, and
this phase consumes it. Desktop is out of scope: it has room and no keyboard.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] With a keyboard open, the bar's bottom edge sits above it. Measured: **bottom 513px against a
      keyboard covering 513..844**.
- [x] With no keyboard, the bar rests where it always did. Measured: **828px**, and 828px again
      after a keyboard opens and closes.
- [x] The bar's content fits its own box at phone width. Was **36px inside 28px**; now **46px inside
      46px**. Equal numbers are what `scrollHeight` prints when content fits, not a pass on the
      edge: shrinking the box shows 47px and 45px still passing and 30px failing.
- [x] Every action stays reachable, and an overflowing bar says so. Measured: **scrollWidth 558px
      against clientWidth 356px**, `overflow-x: auto`, visible thin scrollbar, **44px** minimum
      action height.
- [x] The embedded bar is untouched in both keyboard states. Measured: **828px** standalone and
      embedded, and 828px before and after a keyboard opens.
- [x] The bar is photographed for real rather than as an empty region.
- [ ] Which host shape the operator's phone is — `visualViewport` shrink or window resize. A fact
      about their hardware; no harness answers it. The `max()` fallback means the bar works either
      way, so this is unresolved rather than blocking.
- [ ] The operator selects cells, opens the keyboard, and sees a usable bar.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

**Both reported defects are fixed, and the second was found by accident.** The fit defect — 36px of
content in a 28px box — was measured by another phase while investigating something unrelated. It had
gone unnoticed because this bar's screenshot fixture was photographing an empty region, so the
catalogue showed a blank where the defect was. The fixture was fixed first; the defect became visible
second.

**The documents lagged the code.** This phase's spec, plan and tasks were written, the rule shipped,
and the folder then sat at `completion_pct: 0` with no criteria and no summary — the same drift eight
other phases in this packet carry. The numbers above were recovered from the harness afterwards, not
recorded as the work happened.
<!-- /ANCHOR:log -->
