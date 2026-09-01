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
    last_updated_at: "2026-08-31T05:15:00Z"
    last_updated_by: "goal-reconcile"
    recent_action: "AC-1 met: plugin publishes --db-keyboard-inset; host-silent bar 828px to 513px"
    next_safe_action: "Operator opens the keyboard on device and confirms the bar is reachable"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 75
    open_questions:
      - "Which host shape is the operator's phone: visualViewport shrink or window resize"
    answered_questions:
      - "Both reported defects are fixed and each carries a browser-produced number"
      - "The bar no longer depends on a host variable: the plugin publishes the inset itself"
---
# Goal: Dock the Selection Bar to the Keyboard

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The selection bar sits on top of the keyboard, not under it and not across the rows,
and every action is readable and reachable at phone width.

**Why.** The bar is the only route to Copy TSV and Copy Markdown. The operator's words: *"You see
that bar floating? It's not really usable."* A present but unusable control is worse than an absent
one: the user believes the feature exists.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The plugin publishes its own inset; the bar consumes that. The host's `--keyboard-height` is one input, never the source. **Amended**, see the log. |
| D2 | Scroll rather than truncate. A shortened label is a control nobody can identify. |
| D3 | Raise the box, not reduce the content. 44px is the thumb floor this surface already holds. |
| D4 | The embed inherits nothing. It has no keyboard to clear. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

The parent packet's `goal.md` outranks this document. Its third decision governs closure:
shipped, verified and operator-confirmed differ, and only the third closes.

The inset mechanism is not this phase's to build. Another phase publishes it; this one consumes
it. Desktop is out of scope: it has room and no keyboard.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] With a keyboard open, the bar's bottom edge sits above it. **Met.** The plugin publishes
      `--db-keyboard-inset` itself, so the number no longer rests on the harness writing the host's
      variable: **host silent, 828px → 513px**. Controls: reverting the publication reds the
      host-silent check while the host-present check stays green; removing the listener release is
      caught too.
- [x] With no keyboard, the bar rests where it always did. **828px**, and 828px again after a
      keyboard opens and closes.
- [x] The bar's content fits its box at phone width. Was **36px inside 28px**, now **46px in 46px**. Shrinking the box shows 47px and 45px passing and 30px failing, so the equality is a fit
      rather than an artefact.
- [x] Every action stays reachable, and an overflowing bar says so. **scrollWidth 558px against
      clientWidth 356px**, `overflow-x: auto`, visible thin scrollbar, **44px** minimum action height.
- [x] The embedded bar is untouched in both keyboard states. **828px** standalone and embedded,
      before and after a keyboard opens.
- [x] The bar is photographed for real, not as an empty region.
- [ ] Which host shape the operator's phone is — `visualViewport` shrink or window resize. A fact
      about their hardware; no harness answers it. The published inset combines both, so this is
      unresolved, not blocking.
- [ ] The operator selects cells, opens the keyboard, and sees a usable bar.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

### The first criterion closed, and closing it required amending D1

D1 said to consume the host's `--keyboard-height`. That was wrong in a way no measurement could
show while the harness itself wrote the variable: **nothing in the plugin published it, and no host
observed here writes it either**, so the 513px reading was the harness measuring its own fixture.
The criterion was withdrawn on that basis rather than passed.

The repair inverts the direction. The plugin now computes the inset — the host's number combined
with the visual viewport's shrink — and publishes it as `--db-keyboard-inset` on the container; the
bar's rule consumes it through `max()` alongside the safe-area floor. The measurement that settles
the criterion is the one taken **with the host silent**: 828px unmoved before, 513px after.

Two controls hold it. Reverting the publication turns the host-silent check red while the
host-present check stays green — which is the pair that distinguishes a real fix from a harness
that answers its own question. Removing the listener release is caught too, so the subscription is
asserted rather than assumed.

### The sheet was already protected, and nobody knew

Proving the bar's fallback meant exercising the same fallback on the sheet, and that branch had
**never executed in any test before**. It works. It was correct by construction and unverified for
its whole life — an absent-evidence result that turned out favourable, which is not the usual way
round and is worth recording because the next such branch may not be.

### Both reported defects are fixed, and the second was found by accident

The fit defect — 36px of content in a 28px box — was measured by another phase while investigating
something unrelated. It had gone unnoticed because this bar's screenshot fixture was photographing
an empty region, so the catalogue showed a blank where the defect was. The fixture was fixed first;
the defect became visible second.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Plugin-owned inset published and consumed | Shipped, measured | Host silent: 828px → 513px |
| Two controls on the inset | Observed | Revert reds the host-silent check only; listener release caught |
| Content fits its box | Shipped, measured | 36px-in-28px → 46px-in-46px; 30px fails |
| Overflow says so | Shipped, measured | 558px scroll against 356px client, 44px action height |
| Embed untouched | Measured | 828px in both states |
| Operator confirmation | Open | Only the device closes it |

### Deviations and findings

| Item | Note |
|------|------|
| D1 amended | Was "consume the host's `--keyboard-height`". No host here writes it, so the decision described a mechanism that could only ever pass under a harness. Now: the plugin publishes its own inset and the host value is one input to it |
| The documents lagged the code | Spec, plan and tasks were written, the rule shipped, and the folder then sat at `completion_pct: 75` with no criteria and no summary — the same drift eight other phases in this packet carry. The numbers here were recovered from the harness afterwards, not recorded as the work happened |
| `completion_pct` held at 55 | A criterion closed today, but the operator row is what moves this number and the device has not been touched |
<!-- /ANCHOR:log -->
