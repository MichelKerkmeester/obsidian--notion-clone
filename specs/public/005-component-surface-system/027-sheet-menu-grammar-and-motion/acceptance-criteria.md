---
title: "Acceptance Criteria: Sheet Menu Grammar and Motion"
description: "Each criterion with the number that failed, the number that passes, and the check that produces both."
trigger_phrases:
  - "027 acceptance criteria"
  - "sheet menu grammar criteria"
importance_tier: "critical"
contextType: "planning"
---
# Acceptance Criteria: Sheet Menu Grammar and Motion

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

Every number below comes from `npm run storybook:placement`, which bundles the shipped modules and
runs them in a real browser against the shipped `styles.css` **plus Obsidian's own `button` rule**.
None of it is measured off a screenshot fixture: those render hand-written markup and import nothing
from `src/`, so a fixture that fakes a menu proves nothing about the menu.

The failing column was produced by reverting each fix in place and re-running the same check. That
run also turned five checks written by earlier phases red — they are listed at the bottom, because a
check that was green while the device was wrong is the most important evidence in this packet.

---

<!-- ANCHOR:criteria -->
## 1. THE ROW

| ID | Criterion | Threshold | Before | After | Check |
|----|-----------|-----------|--------|-------|-------|
| AC-1 | Column menu labels start at one x | exactly 1 | **14** across 18 rows `[45, 137, 144, 150, 153, 155, 159, 166, 167, 169, 171, 175, 176, 184]` | **1** `[45]` across 17 rows | `column menu: every label starts at the same x` |
| AC-2 | Add-view create rows start at one x | exactly 1 | **6** across 8 rows `[144, 166, 170, 173, 175, 179]` | **1** `[49]` across 8 rows | `add view: every create row starts at the same x` |
| AC-3 | The row states its own main-axis alignment | `flex-start` | `center` | `flex-start` | `column menu: the row states its own main-axis alignment` |
| AC-4 | Every row clears the thumb floor | ≥ 44px | 44px | 44px | `column menu: every row clears the 44px thumb floor` |
| AC-5 | Hairline between neighbours, none at a group's end | 12/12 and 0/5 | **0/12** and 0/5 | **12/12** and 0/5 | `column menu: adjacent rows are divided by a hairline…` |
| AC-6 | The hairline begins at the label column | ≤ 1px from the label | no hairline | divider x=45, label x=45 | `column menu: the hairline begins at the label…` |
| AC-7 | A row that opens announces it; a row that acts does not | chevron + `aria-haspopup` on one, neither on the other | already held | `Change type` chevron=true haspopup=listbox; `Duplicate property` false/null | `a row that opens a submenu carries a chevron…` |

AC-7 held before this phase — `createMenuRow` already drew the chevron from `submenu: true`. It is
asserted here because report 5 made the submenu a row *behaviour* rather than a decoration, and an
invariant nothing re-asserts is how the next caller reinvents it.

---

## 2. THE SHEET

| ID | Criterion | Threshold | Before | After | Check |
|----|-----------|-----------|--------|-------|-------|
| AC-8 | A submenu is in front of the sheet and its backdrop | submenu z > backdrop z, and the document paints the submenu at its own centre | submenu **110**, backdrop **999**, sheet 1000; the document painted `db-menu-item` — the parent's row | submenu **1000**; the document paints `db-dropdown-section-title` — its own | `a submenu opened from a sheet is in front of that sheet and its backdrop` |
| AC-9 | One scroll axis, and a long label truncates | `overflow-x: hidden`, `scrollWidth ≤ clientWidth` | `overflow-x: auto` | `hidden`, 390 in a 389px box | `a sheet scrolls vertically only…` |
| AC-10 | The sheet stops at 90% and scrolls inside it | ≤ 0.9 × innerHeight, `scrollHeight > clientHeight` | already held | 760 against a 760 cap, content 820 visible 759 | `a sheet stops at 90% of the screen and scrolls inside it` |
| AC-11 | A positioner-presented sheet follows a drag and dismisses | transform tracks the finger, sheet gone past the threshold | transform `none`, **still open** | `matrix(1, 0, 0, 1, 0, 40)`, dismissed | `add view: the sheet follows a drag on its grab bar…` |

AC-10 held before the phase and is asserted rather than changed. Its two sources disagree in
mechanism: the stylesheet's `!important` `calc(90svh - …)` binds and `placeSheet`'s inline
arithmetic is dead. That inversion is documented at the function and was not touched.

---

## 3. THE MOTION

| ID | Criterion | Threshold | Before | After | Check |
|----|-----------|-----------|--------|-------|-------|
| AC-12 | The sheet starts a full sheet-height below the screen | within 2px of its own height | **8px** against a 467px sheet | **477px** against a 477px sheet | `the sheet starts a full sheet-height below the screen…` |
| AC-13 | It is still travelling one frame in and settled by the end | > 20% of its height still to travel at 60ms, 0 at 460ms | no movement at any sample; **zero animation objects ever existed** | 477 → 313 at 60ms → 0 at 460ms | `the sheet is still travelling one frame in…` |
| AC-14 | Shared duration, easing out, transform alone | `transform 0.26s ease-out` | `opacity, transform 0.12s ease-out` | `transform 0.26s ease-out` | `the entrance runs on the shared sheet duration…` |
| AC-15 | A thumb takes the sheet over mid-entrance | the finger's own offset, ±4px | n/a — nothing to interrupt | 30px drag → translateY 30px | `a thumb on the grab bar takes the sheet over…` |
| AC-16 | Reduced motion lands it at rest, backdrop included | transform none, 0 animations, backdrop `animation-name: none` at opacity 1 | held for the sheet by accident, since nothing moved | holds by declaration | `reduced motion lands the sheet at rest…` |

AC-15 is the constraint that decided the mechanism. The entrance is a transition and never a CSS
animation: the drag writes an inline transform, which outranks a class but **not** a running
animation, so an animation would have ignored the first touch for 260ms.

---

## 4. THE CHECKS THAT WERE GREEN WHILE THE DEVICE WAS WRONG

Reverting AC-1's one-line fix turns these red. Every one predates this phase, and every one has
passed on every run since it was written.

| Check | Under the revert |
|---|---|
| `rows in a sheet menu share one left edge, icon or no icon` | spread **13px** |
| `utilities rows keep their container's row layout after moving to the shared component` | label edges `[165, 157, 151, 166]` |
| `a shared menu row lays itself out in any sheet, not only inside the owned menu` | spread **76px** |
| `add view: headings, captions and rows share one left edge (desktop)` | 2 distinct edges |
| `add view: headings, captions and rows share one left edge (phone)` | 2 distinct edges |

They were not weak checks. They ran against a document with no host stylesheet, where an undeclared
`justify-content` computes to `flex-start` and every label already lines up. The fix for that is the
harness change, not the assertions: Obsidian's real `button` rule now loads on all 17 pages.
<!-- /ANCHOR:criteria -->

---

## 5. GATE

| Check | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | 444 passed, 58 files — unchanged from baseline |
| `npm run storybook:placement` | **202/206**, 4 red for a declared reason — baseline was 186/190 with the same 4 |
| `npm run screenshots:verify` | 228 entries current, none blank or theme-identical — baseline 224, +4 for the new sheet scenario |
| `node tools/live/evidence.mjs --check-all` | 8 of 8 fresh |
| `npm run gate` | **13 of 14 green.** The red is `comments`, from `tools/bench/run-board.mjs` and `run-gallery.mjs` — untracked files another agent created at 17:38 during this work, which this phase did not touch |

---

## 6. HARNESS-SUPPLY CLASSIFICATION

Asked of every row: *if this value came from the device instead of the harness, would the check still
pass — and could it still fail?* **All sixteen are sound, and none is withdrawn.**

This phase is the one that found the supply rather than fell for it. §4 is the finding in its purest
form: five checks written by earlier phases had passed on every run since they were written, and they
passed because the page had no host stylesheet — an undeclared `justify-content` computes to
`flex-start`, so every label already lined up and the checks measured a document no reader has. The
repair was to the harness, not to the assertions. That is inventory item 5, caught and closed for the
rule it names.

| Group | Class | Why |
|---|---|---|
| AC-1, AC-2, AC-6 | Sound | Label and divider origins measured against shipped `styles.css` **plus** Obsidian's real `button` rule, which is the declaration that made the earlier greens false |
| AC-3, AC-4, AC-5, AC-7 | Sound | Computed `justify-content`, a 44px floor, hairline presence, `aria-haspopup` and the chevron — plugin declarations and plugin markup throughout |
| AC-8, AC-9 | Sound | `--db-layer-modal` and `--db-layer-submenu` are plugin tokens and `runtime-vars.css` pins neither; the paint test reads what the document actually returns at the submenu's own centre |
| AC-10 | Sound | The 90% cap is the stylesheet's `!important` `calc(90svh - …)`. Noted at the row: the inline arithmetic in `placeSheet` is dead, and the two sources disagree in mechanism rather than in value |
| AC-11 to AC-16 | Sound | Transform, transition shorthand and animation count read off the running element in a real browser, driven by a real pointer stream. AC-13 samples travel at 60ms and rest at 460ms rather than trusting a declared duration |

### The gap this phase narrowed and did not close

**One host rule is modelled. The stylesheet has thousands.** `button` now loads on all 17 pages
because a specific defect proved it had to. Every other declaration Obsidian makes and this plugin
does not is still computed from CSS defaults here and from the host's value on a device, and the
`button` case is the demonstration that the difference is not theoretical — it cost five checks and
several months of centred sheet buttons.

So the correct reading of these sixteen greens is: sound against the rules the harness models, on a
surface where the one known host contribution is now present. A rule keyed to a host declaration
nobody has thought to add is still invisible, and no check in this phase would report it. The
general repair is a host stylesheet the harness loads rather than a growing list of rules it
remembers to copy.
