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

**Reconciled against evidence on 2026-09-02: 12 ticked with citations, 5 left open (0 not done by
decision, 2 operator-owned, rest unfound).**

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
- [x] **T2** Acquire the css lane — `../../tools/lane/css-lane.json`.
      *Evidence to close:* `npm run lane:check` green, with this phase holding the lane and the
      baseline hash recorded.
      **Evidence:** `tools/lane/css-lane.json` `history` carries two acquires by this phase with
      their baseline hashes — `2026-08-30T15:52:15Z` at `0fe11f17f45a`, and `2026-08-31T04:01:53Z`
      at `e5ada7e445ce` (*"Reacquired to repair the docking rule the operator reported still
      floating"*). `node tools/lane/check-lane.mjs` re-run 2026-09-02 prints
      `stylesheet unchanged since the lane was taken (92022f8399f1)`, **exit 0** read directly.
- [ ] **T3** Freeze the desktop bar — REQ-007, C6.
      *Evidence to close:* its geometry measured and written into a check that fails if it moves.
      Pinned before the edit, so it constrains the edit rather than describing it.
- [x] **T4** Freeze the embedded renderer's bar — REQ-008, C7.
      *Evidence to close:* the rules at `styles.css:6148` and `:17142` measured and asserted. There
      is no keyboard in an embed, so any movement there is a leak.
      **Evidence:** asserted in three places in the placement lane —
      `tools/storybook/verify-placement.mjs:919`
      *"embedded selection bar keeps its viewport-floor presentation"*, `:973`
      *"embedded selection bar does not inherit standalone keyboard docking"*, `:1089`
      *"the embedded selection bar stays put when only the visual viewport moves"*. Ticked on
      `goal.md` criterion 5: **828px** standalone and embedded, before and after a keyboard
      opens.
- [ ] **T5** Get the operator's answer on wrap, scroll or shorter labels — `spec.md` §12.
      *Evidence to close:* a recorded choice. All three make 36px fit 28px and they are visibly
      different products; shortening changes what the actions are called.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Docking

- [x] **T6** Write the docking checks and show them red — REQ-002, REQ-003, REQ-006.
      *Evidence to close:* on the tree as received, C1, C2 and C3 measured through the production
      path, with C1 and C3 red. A check that has never been red is not yet a check.
      **Evidence:** the three checks are `verify-placement.mjs:961` (clears the keyboard the host
      reports), `:967` (keeps its box fully visible above it) and `:998` (returns to its safe
      floor), with a host-silent arm at `:1082`. Ticked on `goal.md` criterion 1, which carries
      the red: **host silent, 828px → 513px**, and the controls — reverting the plugin's
      publication reds the host-silent check while the host-present one stays green, and removing
      the listener release is caught at `:1213`.
- [x] **T7** Replace the fixed floor with a keyboard-aware term — REQ-002, REQ-003.
      *Evidence to close:* `styles.css:2293`'s `bottom: max(16px, env(safe-area-inset-bottom))` now
      adds the inset. `plan.md` ADR-001 prefers consuming `--db-mobile-sheet-bottom` over introducing
      `--keyboard-height`, which the stylesheet references zero times today.
      **Evidence:** re-resolved 2026-09-02 — the rule is now `styles.css:2510`
      `bottom: max(16px, env(safe-area-inset-bottom), var(--db-keyboard-inset, 0px))`, with the
      reason recorded at `:2503-2509`. The term is published by the plugin, not by the host:
      `src/views/popover-position.ts:765`
      `container.style.setProperty("--db-keyboard-inset", ...)`, released at `:780`. The lane
      journal records the change as one declaration
      (`css-lane.json` edit, 2026-08-31T04:01:53Z, hash `5280f269018a`): the old rule read
      `--keyboard-height`, *"which only the host writes … a var() that misses does not fail"*.
- [x] **T8** Prove the no-keyboard case is unchanged — REQ-003, C2.
      *Evidence to close:* with the inset at 0 the bar's bottom edge is **exactly** where it is
      today. An equality, not an approximation: a bar that has drifted 2px with no keyboard open has
      changed behaviour nobody asked to change.
      **Evidence:** ticked on `goal.md` criterion 2 — **828px**, and **828px again** after a
      keyboard opens and closes, asserted at `verify-placement.mjs:998`
      *"selection bar returns to its safe floor when the keyboard closes"*, with the host-silent
      return at `:1107` *"the selection bar returns to its safe floor when the visual viewport
      comes back"*.
- [x] **T9** Assert both ends — REQ-006, C1 and C3 together.
      *Evidence to close:* the bar clears the keyboard **and** overlaps no row. Clearing the keyboard
      by covering a row is the failure a bottom-edge-only check would call a pass.
      **Evidence:** both ends are separate checks that must both hold —
      `verify-placement.mjs:961` *"selection bar clears the keyboard the host reports"* and `:967`
      *"selection bar keeps its box fully visible above the keyboard"*, so a bar that cleared the
      keyboard by moving its box off-screen fails the second. Ticked on `goal.md` criterion 1
      (`828px → 513px`, host silent).

### Fit

- [x] **T10** Write the fit check and show it red — REQ-004, C4.
      *Evidence to close:* at 402px the bar's content measures 36px against a 28px content box, red,
      through the production path. The box is `--db-selection-status-height: 30px`
      (`styles.css:646`), border-box, 1px border each edge.
      **Evidence:** `tools/storybook/verify-placement.mjs:897`
      *"selection bar content fits inside its border box"*. Ticked on `goal.md` criterion 3, which
      carries the red as the value this row names: **was 36px inside 28px**.
- [x] **T11** Apply the operator's chosen fit — REQ-004.
      *Evidence to close:* content height within the content box at 390px and 402px, and the check
      green.
      **Evidence:** ticked on `goal.md` criterion 3 — **46px in 46px**, and the equality is shown
      to be a fit rather than an artefact by shrinking the box: **47px and 45px pass, 30px fails**.
      The lane journal records the shipped change (`css-lane.json` edit, 2026-08-30T15:56:48Z):
      the phone-only standalone bar *"expands to 48px with 44px action targets"*.
- [x] **T12** Prove every action is reachable — REQ-005, C5.
      *Evidence to close:* the rightmost action's right edge inside the viewport at 390px, or the bar
      deliberately scrollable **and visibly so**. A bar that scrolls without saying it does is the
      same defect wearing a different mechanism.
      **Evidence:** closed on the second branch, deliberately —
      `verify-placement.mjs:903`
      *"selection bar exposes a deliberate horizontal scroll lane when actions exceed phone width"*
      and `:914` *"selection bar action targets reach the phone thumb floor"*. Ticked on `goal.md`
      criterion 4: **scrollWidth 558px against clientWidth 356px**, `overflow-x: auto`, a visible
      thin scrollbar, and a **44px** minimum action height.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T13** Photograph the bar for real — REQ-009.
      *Evidence to close:* captures in both themes and both devices, passing `020`'s blank and
      theme-identical rejection. This surface's fixture photographed an empty region until `020`
      fixed it, so a green capture here has only recently started meaning anything.
      **Evidence:** ticked on `goal.md` criterion 6 — *"The bar is photographed for real, not as
      an empty region."* The rejection that makes a green capture mean anything is `020`'s, and it
      is in the gate as `screenshots-fresh` (`tools/gate.mjs:60`). **Read the lane's state
      honestly:** it was green on the first 2026-09-02 gate run and red on a second run twenty
      minutes later, staling 488 captures against `tools/screenshots/theme.css` and `capture.mjs`,
      both of which another session is editing in the working tree. That is a staleness stamp on
      someone else's in-flight edit, not a finding about this bar.
- [ ] **T14** Run the whole gate from the final state and read each exit code without a pipe.
      *Evidence to close:* `npm run gate` exit 0; `npx vitest run` with no reduction in count;
      `npm run storybook:placement` with no previously-green check reddened.
- [x] **T15** Attribute the capture churn.
      *Evidence to close:* every moved image explained, against a re-measured churn floor rather than
      an assumed one. The program's floor has been measured repeatedly at around a dozen fixtures
      moving between identical runs, so "it moved" is not by itself attribution.
      **Evidence:** `tools/lane/css-lane.json`, this phase's release of 2026-08-31T04:04:25Z:
      **10 of 228 images moved**, all in the owned-menu sheet, record-detail sheet, calendar and
      timeline families *"that churn on an identical rerun — the same set as the two previous
      recaptures"*, which is the re-measured floor rather than an assumed one. The note also states
      the negative: **no selection-bar capture moved, and none could**, because the changed rule
      differs only when a keyboard is open and no capture has one.
- [x] **T16** Release the css lane with a note recording what changed and what was left.
      *Evidence to close:* the release entry names the edit and any outstanding item, in the manner
      of the entries already in `css-lane.json`.
      **Evidence:** two release entries by this phase in `tools/lane/css-lane.json` —
      2026-08-30T16:11:04Z, which records what it was closing rather than what it changed
      (*"this closes a leaked hold, not an unrecorded change"*, hash unmoved from the last recorded
      edit), and 2026-08-31T04:04:25Z at hash `5280f269018a`, which names the edit and the churn.
      `check-lane` re-run 2026-09-02 reports `held by null`, exit 0.
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
