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
    packet_pointer: "005-component-surface-system/022-selection-bar-keyboard-docking"
    last_updated_at: "2026-09-02T23:15:00Z"
    last_updated_by: "reports-30-33-landed"
    recent_action: "Reports 31-32 fixed in 00e2aa2; 1.4.2 release pending"
    next_safe_action: "Operator opens the keyboard on device and confirms the bar is reachable"
    blockers:
      - "Reports 31-32 (iOS, 2026-09-02 21:21): fixed in 00e2aa2, release 1.4.2 pending, not operator-confirmed"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "Which host shape is the operator's phone: visualViewport shrink or window resize"
    answered_questions:
      - "Both reported defects are fixed and each carries a browser-produced number"
      - "The scroll-versus-wrap contradiction: the operator chose the wrap, landed 2026-09-02"
      - "The bar no longer depends on a host variable: the plugin publishes the inset itself"
      - "Decided 2026-09-02: wrap the actions and retarget tools/storybook/verify-placement.mjs:903 to assert every action inside the bar, amending D2's scroll lane"
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
| D2 | ~~Scroll rather than truncate. A shortened label is a control nobody can identify.~~ **Superseded 2026-09-02:** the bar wraps its actions instead of scrolling them; see the wrap decision in the log and `../035-visual-pass-product-defects/goal.md` P6. |
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
- [x] Every action stays reachable, and an overflowing bar says so. ~~**scrollWidth 558px against
      clientWidth 356px**, `overflow-x: auto`, visible thin scrollbar~~ **Superseded 2026-09-02:** the
      bar wraps instead of scrolling. Now every action's right edge stays inside the bar's client box:
      observed red at **maxActionRight 567px past a 373px port**, green at **341px inside 373px**,
      **44px** minimum action height unchanged.
- [x] The embedded bar is untouched in both keyboard states. **828px** standalone and embedded,
      before and after a keyboard opens.
- [x] The bar is photographed for real, not as an empty region.
- [x] **The check for report 31 goes red then green.** Fresh verifier, 2026-09-02, `00e2aa2`.
      Red: bar under an open sheet 35084px², editor∩bar 7666px², FAB∩bar 2704px². Green: 0px² all
      three, bar restored on close.
- [x] **The check for report 32 goes red then green.** Fresh verifier, 2026-09-02, `00e2aa2`.
      Red: `TypeError: tSelectedCells is not a function` (3 failed). Green: 3 passed. Chinese
      locales deliberately do not inflect.
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
| Overflow says so | Shipped, measured | Wraps instead of scrolling; 567px past 373px port red, 341px inside 373px green, 44px action height |
| Embed untouched | Measured | 828px in both states |
| Operator confirmation | Open | Only the device closes it |

### Deviations and findings

| Item | Note |
|------|------|
| D1 amended | Was "consume the host's `--keyboard-height`". No host here writes it, so the decision described a mechanism that could only ever pass under a harness. Now: the plugin publishes its own inset and the host value is one input to it |
| The documents lagged the code | Spec, plan and tasks were written, the rule shipped, and the folder then sat at `completion_pct: 75` with no criteria and no summary — the same drift eight other phases in this packet carry. The numbers here were recovered from the harness afterwards, not recorded as the work happened |
| ~~`completion_pct` held at 55~~ | **Stale, corrected 2026-09-02.** The reasoning holds and the number does not: the operator row is still what moves this figure and the device is still untouched, but no document in this folder reads 55. `goal.md`, `spec.md`, `acceptance-criteria.md` and `implementation-summary.md` all carry **75**, which is what stands and what satisfies `roadmap.md` §3.2's one-number rule. 55 was this row describing a figure the frontmatter beside it had already moved past — the divergence between prose and frontmatter that the one-number rule exists to catch, reproduced inside the row written to record it |
| `tasks.md` is 0 of 17 | Measured 2026-09-02. Six criteria are ticked with browser-produced numbers and every task box is empty, so `roadmap.md` §3's mandatory *In progress — N of M tasks* fraction cannot be derived for this phase at all. **Recorded, not cleared:** ticking seventeen boxes to make the fraction computable would assert per-task evidence nobody gathered. This is the same shape as the six task lists the parent's ledger already names, and it is a seventh — not on that list, which counted phases whose goal checklist was 86-90% complete |

### 2026-09-02: `035` reads the fourth criterion as a contradiction, and it is the operator's to settle

The fourth criterion above pins the scroll lane: **scrollWidth 558px against clientWidth 356px**,
`overflow-x: auto`, a visible thin scrollbar, and `tools/storybook/verify-placement.mjs:903` asserts
exactly that triple. `035-visual-pass-product-defects` P6 measured the same bar on the phone capture
and reads the lane as a defect: the box is capped at `calc(100vw - 32px)` = **370px** against
**416px** of actions, so "Copy CSV" sits **55px** outside the port and no capture can scroll to it.
Nothing truncates, so this is the scroll container working as D2 asked. `035` built a wrapping bar,
measured it green at **5 of 5 actions inside a 102px bar**, then reverted it because `:903` went red.

Two shipped decisions contradict, so neither packet may take it alone. The options, with no side
taken here: **(a) wrap the actions and retarget `verify-placement.mjs:903`** to assert the wrapped
shape instead of the overflow triple, which amends D2; or **(b) keep the scroll lane** and accept
that the phone capture shows the clip, which leaves `035` P6 open by decision rather than by defect.
Recorded, not resolved. See `../035-visual-pass-product-defects/goal.md` P6 and its
`implementation-summary.md` Known Limitation 1.

**2026-09-02: decided.** Option (a) is taken — wrap the actions and retarget
`tools/storybook/verify-placement.mjs:903` to assert every action inside the bar, amending D2's
scroll lane. Not yet implemented; this phase's fourth criterion stays as shipped until the wrap
lands and the retargeted check is green.

**2026-09-02: the wrap landed, and the check moved to `:907`.** Implemented in the `035` packet by an
external `codex` lane on `gpt-5.6-luna` and verified in-runtime here. The `.is-phone` bar went
`height: 48px; overflow-x: auto` to `height: auto; min-height: 48px; flex-wrap: wrap;
overflow-x: hidden` with a `row-gap`, at `styles.css:2511-2527`, and the 44px action floor is
untouched. The retargeted check now reads *"selection bar actions stay inside the phone bar after
wrapping"* at `tools/storybook/verify-placement.mjs:907`, asserting every action's right edge inside
the bar's client box and the content height inside that box. It was observed red at **maxActionRight
567px against clientRight 373px** with the stylesheet stashed, and green at **341px inside 373px**
with it restored; the bar's content box goes **46px → 96px**. `npm run gate` is PASS at 25 green.

**2026-09-02: the operator corrected the fourth criterion and D2.** The row and the decision it
depended on now read superseded-and-replaced rather than stale-but-ticked: the struck scroll-lane
text stays visible, D2 is marked superseded pointing at this wrap decision and `035`, and the row
stays ticked because the new observable — every action's right edge inside the bar's client box —
is what it now asserts, and that is true on disk (`maxActionRight` 567px red past a 373px port,
341px green inside it). The 44px floor is unchanged.

### 2026-09-02: two fresh device reports, both bundled as one operator note

**iOS, 21:21.** Quoted at `roadmap.md` §4 rows 31-32. **Row 31** — the selection status bar
(*"× Esc · 1 cells selected · Copy TSV · Copy Markdown"*) stays docked while a bottom sheet is open,
sits over/under the floating "+" add button, and when a numeric cell is edited the inline editor
lands on top of the bar, clipping "1 cells selected" and stacking a second action row
(Copy CSV · Paste · Income · Clear · Undo) above the keyboard. One docking owner is missing among
sheet, bar, editor and floating button. Screenshot:
`../scratch/device-2026-09-02/cell-editor-over-selection-bar-ios.png`. **Row 32** — `"1 cells
selected"` has no singular form: `src/i18n.ts:287`, `"toolbar.selectedCells": "{count} cells
selected"`, interpolated at every count including 1. Neither row is investigated yet.

**2026-09-02: reports 31-32 fixed in `00e2aa2`.** A named claim set toggles
`db-bottom-dock-taken`; sheets claim at mount and release at unmount or on the removal watcher,
the inline cell editor claims while it is open, and the bar and the mobile add control yield to
either. Red: bar 35084px² inside an open sheet, editor∩bar 7666px², add-control∩bar 2704px².
Green: 0px² on all three, bar restored on close. Report 32: `src/i18n-plural.test.ts` observed
red (`TypeError: tSelectedCells is not a function`, 3 failed) then green with a singular form
added; Chinese locales deliberately do not inflect. Release 1.4.2 is pending; not
operator-confirmed. **Adjacent findings, recorded, not ticked:** the cell-editor dock claim has
no removal fallback — `cell-renderer.ts` releases only in `close()` — and `db-bottom-dock-taken`
is a body class rather than phone-scoped, so a tablet split pane could in principle hide the
other pane's bar. Both are inferred from the source, not observed.
<!-- /ANCHOR:log -->
