---
title: "Acceptance Criteria: The Sheet Drag and the Eight Operator Asks"
description: "Every one of the operator's bottom-sheet asks with a verdict, a number and the check that produced it, measured by driving the shipped entry points in a real browser."
contextType: "verification"
---

# Acceptance Criteria

Every number below comes from `probe/sheet-audit.mjs`, which opens the surfaces through
`openRecordDetailPanel`, `createOwnedMenu` and `applySheetChrome`, loads the shipped `styles.css`,
installs Obsidian's own `setCssProps`, and drives the gesture with real touch events through the
browser's input pipeline. Run: `node specs/public/005-component-surface-system/016-sheet-drag-and-audit/probe/sheet-audit.mjs`

Result at the time of writing: **19 of 22 pass**, and the three that do not are each declared below.

**What the harness contributes, read against every row.** Three of the values above are the
harness's rather than the product's, and each row now says so: `--keyboard-height` (ask 4) is set by
the probe and by nothing in `src/`; `--background-primary` and `--background-modifier-border` (asks
6 and 3) are pinned inline on the body, so the recorded fill and divider colours are readings of
those pins. The **geometry** rows are not exposed that way — 44×44, `min-height: 44px`, `padding: 8px
16px`, the 0px row gap, the 1px/40% divider and `rgba(0, 0, 0, 0.25)` are literals in the plugin's
own stylesheet, and the grab band's 32px is arithmetic over its own spacing tokens. Ask 1 is stronger
still: it drives real touch through the browser's input pipeline against shipped entry points.

**How to read the verdict column.** *Fixed here* and *Holds* mean a measured threshold is met.
*Declined* means the operator accepted a shortfall against a number — it is closed and must not be
reopened as a defect, and it is kept visibly distinct from a pass so that a later count of green rows
does not absorb it. Ask 5 is the only declined row; ask 10 in the parent roadmap is the same
decision seen from the program level.

## 1. THE EIGHT ASKS

| # | The ask, in the operator's words | Verdict | The number |
| --- | --- | --- | --- |
| 1 | *"dragging the sheet downwards on mobile doesn't really work"* / *"barely works … should guaranteed move down on initial drag"* | **Fixed here** | A 60px drag moves the sheet 60.0px both on a fresh sheet and after a view re-render. Before this phase: 60.0px fresh, **0.0px** after a re-render, with the grab bar absent from the DOM. |
| 2 | *"Close and expand button top right not aligned"* | **Holds** | On the record sheet both measure 44x44, and their centre lines differ by **0.00px**. |
| 3 | *"closer to notion … no space between, text is a bit bigger, light transparent divider"* | **2 of 3 hold** | Gap between adjacent rows **0px** (row-gap token `0px`). Divider **1px** at **40% alpha**. Value text **16px**, up from an em-derived caption size. Label text is **13px**, which is *not* on the type scale — see §2. |
| 4 | *"sheet content should move upwards with kb so keyboard doesn't overlap"* | **Lever proven; signal unproven; one host shape unreachable** | With `--keyboard-height: 336px` the sheet's bottom edge moves 844 → **508** on an 844px screen (clearance **336px**), its top stays on screen at y=**275**, and it returns to 844 when the keyboard closes. **The harness writes that variable and nothing in `src/` ever does** (`probe/sheet-audit.mjs:349`), so this measures the arithmetic given the number, not its arrival — §3, first bullet. And a **window resize closes the sheet outright** — see §2 and §3. |
| 5 | *"drag handler tap area … at least 48px high and as wide as whole sheet header"* — closed, not reopened | **Declined with a number, and the record corrected** | The band answers presses over y=**1..32** of the sheet, i.e. **32px**, full width at **386px of 390** (the remainder is the sheet's own border and scroll gutter). The written record says 35px; the stylesheet's arithmetic is `--db-space-6` (16) + 8 + 4 + 4 = **32**. **The 48px ask is not met and never will be from this sheet header** — it was accepted as a shortfall by the operator, so this row is closed, not passing. Clears WCAG 2.5.8's 24px AA target; short of 2.5.5's 44px, knowingly. |
| 6 | *"make sure each sheet has same bg color"* | **One rule verified; nine surfaces not** | All **9** sheet-capable surfaces measure the identical fill `color(srgb 0.95 0.95 0.95)` — but that value is 95% of the `--background-primary: #ffffff` the harness sets inline (`probe/sheet-audit.mjs:105`, `styles.css:78`), and the nine are bare divs in one parent all resolving one declaration, `.db-mobile-bottom-sheet.db-mobile-bottom-sheet` at `styles.css:19996`. So the check re-reads one rule nine times; per-surface inheritance, which is where the ask came from, is structurally invisible with `app.css` absent. **No pre-fix value was ever recorded for this ask**, by any phase, so what is evidenced is that one rule declares the fill and not that the surfaces used to disagree. Two other documents put the count at seven; only this one counted. |
| 7 | *"block all interaction … black 25% transparent … that way drag handler works better"* | **Holds; the last clause is a non-issue** | Scrim is `rgba(0, 0, 0, 0.25)`, `pointer-events: auto`. A press 120px above the sheet resolves to the scrim, not the table. A press on the grab band resolves to **the grab handle**, not the scrim (sheet z=1000, scrim z=999). The scrim neither helps nor hinders the drag. |
| 8 | *"proper reusable sheet menu item components"* | **Holds** | A row built by `createMenuRow` measures `min-height 44px`, `padding 8px 16px`, height **44px** in the owned-menu sheet and **identically** in a panel sheet. |

## 2. THE THREE DECLARED FAILURES

**A row label is off the type scale.** Measured **13px**, from `--db-font-md`. The scale is
12 / 14 / 16 / 18 / 20 / 24; 13 is between two steps, which is the defect a scale exists to prevent —
it reads as "not quite 14" rather than as a decision. The value beside it is 16px and on the scale.
This is a one-token decision for the operator, not a bug: 14px is the nearest step up and would
raise the label's weight in the row's hierarchy slightly.

**The record sheet closes on a window resize.** `openRecordDetailPanel` registers
`onResize = () => close()`. A software keyboard announces itself two ways: iOS shrinks
`visualViewport` and leaves the window alone, and the keyboard-avoidance inset works perfectly there
(measured above). Hosts that resize the window instead destroy the sheet before any inset can be
applied. This is the one ask whose outcome genuinely depends on which phone the operator holds.

**`placeSheet` writes declarations the phone discards.** `overflowY`, `overscrollBehavior`,
`boxSizing`, `maxWidth`, `maxHeight` are camelCase, and Obsidian's `setCssProps` is
`style.setProperty`, which takes hyphenated names only. Nothing is visibly wrong today because the
stylesheet declares the load-bearing ones `!important` independently. Left unfixed on purpose:
correcting the names would activate `overscroll-behavior: contain` for the first time on every
sheet, which needs a recapture.

## 3. WHAT ONLY THE OPERATOR CAN CONFIRM

Everything above is measured in system Chrome driving the shipped code. Three things are **not**
provable here and are stated as inferred rather than confirmed:

- **The software keyboard.** No harness in this repository contains one. What is proven is that the
  lever works and that the variable it reads, `--keyboard-height`, is declared by Obsidian itself
  (its own stylesheet defines it and pads with it). What is *not* proven is that Obsidian mobile
  publishes a non-zero value at the moment the keyboard opens, on the operator's device.
- **Which resize signal the operator's phone sends.** The window-resize close is a real code path;
  whether it fires on their handset decides whether ask 4 is finished or blocked.
- **Real touch.** `Input.dispatchTouchEvent` enters where a thumb enters and respects hit-testing
  and `touch-action`, but it is one clean finger, not a thumb landing at an angle on a moving list.

## 4. THE DECISIVE LIST FOR THE OPERATOR

Five things, in order. The first two settle the drag; the last three settle what is still open.

1. **Open a record sheet and drag it down straight away.** It should follow your thumb from the
   first millimetre and close past about a third of the sheet.
2. **Open a sheet, tap a field to change a value, let it save, then drag the sheet down again.**
   This is the case that was broken. The grab bar must still be visible, and the drag must work
   exactly as in step 1. If step 1 works and step 2 does not, the fix is incomplete and that is the
   single most useful thing you can tell us.
3. **Open a sheet and tap a text field so the keyboard comes up.** Report which happens: the sheet
   lifts above the keyboard, the sheet stays put and the keyboard covers it, or **the sheet
   disappears**. The third answer means your phone resizes the window and we have a specific fix.
4. **Open a sheet, then swipe between it and a menu sheet** (a row menu or the view menu). They
   should be the same colour; say so if any one still looks different.
5. **Look at the row labels** — the small grey text left of each value. Tell us if they read too
   small; they are one step below where the scale wants them.
