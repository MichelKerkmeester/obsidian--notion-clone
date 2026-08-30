---
title: "Task Breakdown: Dock the Selection Bar to the Keyboard"
description: "One task per requirement. Nothing is started; every box is open."
trigger_phrases:
  - "022 selection bar tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Dock the Selection Bar to the Keyboard

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Nothing in this phase has started.** Every box below is open, and none should be closed before the
work behind it is done — a checked box here would make this packet owe an implementation summary for
work nobody did.

**No task closes on "looks right".** Each task's evidence names a number that was read or a command
whose output and exit status were read.

**A harness measurement says it is one.** This surface's defect went unnoticed inside a green capture
set, so a number from the harness names itself as such and does not stand in for a device.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

- [ ] **T1** Establish the host shape — REQ-001. **Stop condition.**
      *Evidence to close:* on the operator's phone, whether opening the keyboard shrinks
      `visualViewport` or resizes the window. `../roadmap.md` row 4 records that
      `openRecordDetailPanel` registers `onResize = () => close()`, so on the second the surface is
      destroyed before any inset can apply and this phase is blocked rather than small. Record the
      answer either way.
- [ ] **T2** Acquire the css lane — `../../tools/lane/css-lane.json`.
      *Evidence to close:* `npm run lane:check` green, with this phase holding the lane and the
      baseline hash recorded.
- [ ] **T3** Freeze the desktop bar — REQ-007, C6.
      *Evidence to close:* its geometry measured and written into a check that fails if it moves.
      Pinned before the edit, so it constrains the edit rather than describing it.
- [ ] **T4** Freeze the embedded renderer's bar — REQ-008, C7.
      *Evidence to close:* the rules at `styles.css:6148` and `:17142` measured and asserted. There
      is no keyboard in an embed, so any movement there is a leak.
- [ ] **T5** Get the operator's answer on wrap, scroll or shorter labels — `spec.md` §12.
      *Evidence to close:* a recorded choice. All three make 36px fit 28px and they are visibly
      different products; shortening changes what the actions are called.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Docking

- [ ] **T6** Write the docking checks and show them red — REQ-002, REQ-003, REQ-006.
      *Evidence to close:* on the tree as received, C1, C2 and C3 measured through the production
      path, with C1 and C3 red. A check that has never been red is not yet a check.
- [ ] **T7** Replace the fixed floor with a keyboard-aware term — REQ-002, REQ-003.
      *Evidence to close:* `styles.css:2293`'s `bottom: max(16px, env(safe-area-inset-bottom))` now
      adds the inset. `plan.md` ADR-001 prefers consuming `--db-mobile-sheet-bottom` over introducing
      `--keyboard-height`, which the stylesheet references zero times today.
- [ ] **T8** Prove the no-keyboard case is unchanged — REQ-003, C2.
      *Evidence to close:* with the inset at 0 the bar's bottom edge is **exactly** where it is
      today. An equality, not an approximation: a bar that has drifted 2px with no keyboard open has
      changed behaviour nobody asked to change.
- [ ] **T9** Assert both ends — REQ-006, C1 and C3 together.
      *Evidence to close:* the bar clears the keyboard **and** overlaps no row. Clearing the keyboard
      by covering a row is the failure a bottom-edge-only check would call a pass.

### Fit

- [ ] **T10** Write the fit check and show it red — REQ-004, C4.
      *Evidence to close:* at 402px the bar's content measures 36px against a 28px content box, red,
      through the production path. The box is `--db-selection-status-height: 30px`
      (`styles.css:646`), border-box, 1px border each edge.
- [ ] **T11** Apply the operator's chosen fit — REQ-004.
      *Evidence to close:* content height within the content box at 390px and 402px, and the check
      green.
- [ ] **T12** Prove every action is reachable — REQ-005, C5.
      *Evidence to close:* the rightmost action's right edge inside the viewport at 390px, or the bar
      deliberately scrollable **and visibly so**. A bar that scrolls without saying it does is the
      same defect wearing a different mechanism.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T13** Photograph the bar for real — REQ-009.
      *Evidence to close:* captures in both themes and both devices, passing `020`'s blank and
      theme-identical rejection. This surface's fixture photographed an empty region until `020`
      fixed it, so a green capture here has only recently started meaning anything.
- [ ] **T14** Run the whole gate from the final state and read each exit code without a pipe.
      *Evidence to close:* `npm run gate` exit 0; `npx vitest run` with no reduction in count;
      `npm run storybook:placement` with no previously-green check reddened.
- [ ] **T15** Attribute the capture churn.
      *Evidence to close:* every moved image explained, against a re-measured churn floor rather than
      an assumed one. The program's floor has been measured repeatedly at around a dozen fixtures
      moving between identical runs, so "it moved" is not by itself attribution.
- [ ] **T16** Release the css lane with a note recording what changed and what was left.
      *Evidence to close:* the release entry names the edit and any outstanding item, in the manner
      of the entries already in `css-lane.json`.
- [ ] **T17** Confirm no stray files and no tracker ids in `styles.css` — TASK-HYGIENE.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- The host shape is measured and recorded, and the phase either proceeded on it or is blocked on it
  with the measurement stated.
- The bar clears the keyboard when one is open **and** sits exactly at today's floor when none is.
- The bar overlaps no table row in either state.
- The bar's content fits its content box at 390px and 402px, and every action is reachable.
- Desktop and embedded geometry are frozen and still green.
- The bar is photographed for real, passing the blank and theme-identical rejection.
- Every new check was shown red before it was shown green.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../010-sheet-reading-and-keyboard/spec.md`](../010-sheet-reading-and-keyboard/spec.md)
- [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md)

<!-- /ANCHOR:cross-refs -->
