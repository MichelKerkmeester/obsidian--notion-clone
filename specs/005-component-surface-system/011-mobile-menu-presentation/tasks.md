---
title: "Task Breakdown: Mobile Menu Presentation"
description: "The work as it was actually done: the sheet branch reached on the menu path, one shared row component, and the re-key's blast radius measured rather than assumed."
trigger_phrases:
  - "011 mobile menu tasks"
  - "menu sheet evidence"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Mobile Menu Presentation

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Written after the work was done.** Each task closes on a number that was read or a command whose
output was read.

**A regression guard that passes on both sides still closes.** Its evidence is that it was run and
reported the same value twice, which is what a guard is for.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — confirm the cause, then inventory the family

- [x] **T1** Read both mount-and-place paths before changing either.
      *Closed on:* panels call `positionToolbarPopover`, which calls `applySheetChrome` and takes the
      sheet branch on a phone. Menus call `createOwnedMenu().showAt({x, y})`, which calls
      `setPosition` directly and never touches `positionToolbarPopover`. **The sheet branch could not
      run because nothing reached it** — a path that was never wired, not a styling gap.
- [x] **T2** Establish the shape of the call sites before designing the entry point.
      *Closed on:* roughly 11 owned-menu construction sites and 14 `showAt` calls. Three derive their
      point from an anchor element's rect; the rest use the cursor. A design serving one shape would
      leave half the menus wrong.
- [x] **T3** Inventory every surface rendering a menu-like row inside a sheet.
      *Closed on:* 17 menu-row shapes. This is what turned the second half of the phase from "fix
      this sheet" into "there is no shared sheet menu row" — the program has repeatedly fixed the
      instance in front of it and missed the family.

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### The menu becomes a sheet

- [x] **T4** Dock a phone menu to the bottom of the screen — AC-1.
      *Closed on:* `bottom=876` against an 844 viewport, **32px past the bottom edge**, opened at
      `y=90`. Now `bottom=844`, viewport 844. Threshold `|bottom − innerHeight| ≤ 1`.
- [x] **T5** Span the full width — AC-2.
      *Closed on:* `width=220` against a 390 viewport. Now `width=390`.
- [x] **T6** Cap a tall menu and let it scroll inside the sheet — AC-3.
      *Closed on:* a 19-row menu measured `height=872` against a 760 cap with `content=870
      visible=870` — **it did not scroll, it grew**. Now `height=760` at the cap with `content=898
      visible=759`. Nineteen rows is the length the reported column menu holds; a shorter menu fits
      by accident and can demonstrate neither overflow nor scrolling.
- [x] **T7** Carry the sheet's grab handle — AC-4.
      *Closed on:* handle absent, classes `db-surface db-menu db-owned-menu`. Now handle present,
      classes gain `db-mobile-bottom-sheet db-overlay-enter`.

### Dismissal gets exactly one owner

- [x] **T8** Make the backdrop take the tap — AC-5.
      *Closed on:* read from `document.elementFromPoint`, not from the element. Before, the document
      painted `note-database-container` above the sheet, so the press that dismissed the menu also
      landed on the table. Now it paints `db-mobile-sheet-scrim` with `pointer-events=auto`. **An
      inert backdrop is present in the tree and absent from the hit test, and only the hit test is
      the behaviour.**
- [x] **T9** Make the backdrop arrive with the menu and leave with it — AC-6.
      *Closed on:* both clauses required. Before, `while open=false after close=false`. Now `while
      open=true after close=false`, menu unmounted. Asserting only the second clause passes trivially
      on a build that never draws one.
- [x] **T10** Drive the grab-handle gesture with the browser's real pointer stream — AC-7.
      *Closed on:* a 140px drag unmounts the menu and removes the backdrop; a 40px drag leaves both.
      Threshold is the shipped `DISMISS_PX = 96`. Driven through Playwright rather than synthesised:
      a hand-made `PointerEvent` carries a pointerId the browser never issued and
      `setPointerCapture` rejects it, so a synthetic version measures the harness throwing.
- [x] **T11** Keep one dismissal owner.
      *Closed on:* the backdrop is a rectangle rather than a handler, so a press on it arrives where
      any other outside press does; the drag calls the same idempotent `close()`. The menu's own
      capture-phase `pointerdown` and `Escape` handlers remain the single owner.

### One row component

- [x] **T12** Move the utilities rows onto the shared component — AC-10.
      *Closed on:* `display=inline-block text-align=center` with label left edges `[25, 125, 252, 25]`
      — **a 227px spread**, which is the ragged centred sheet in the device report. Now
      `display=flex text-align=start` with edges `[35, 35, 35, 35]`.
- [x] **T13** Re-key the row rules so a shared row works outside the owned menu's shell — AC-12.
      *Closed on:* `display=inline-block text-align=center`, label lefts `[16, 101, 16]`, **spread
      85px**. Now `display=flex text-align=left`, lefts `[40, 40, 40]`, **spread 0px**. Applied by
      the coordinator with the lane held, in the doubled-class form that preserves specificity. The
      harness reported it as an unexpected pass the moment it landed, which is what the `KNOWN` map
      is for.
- [x] **T14** Fix the icon id that shipped no glyph — AC-11.
      *Closed on:* `Display width` asked for `arrows-left-right`, which occurs **0 times** in the
      installed `obsidian.asar`; `arrow-left-right` occurs **5 times** and carries
      `lucide-arrow-left-right` in its class list. It was the only `arrows-`-prefixed id in `src/`
      against twelve singular siblings. With no glyph the label sat left of every sibling's — the
      report's "Display width carries no icon and floats". **Not observable in the harness**, whose
      icon stub draws a placeholder for any id at all; verified against the bundle instead.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T15** Confirm desktop menus did not move — AC-8.
      *Closed on:* `menu=[400,200]` for a request of `[400,200]`, `width=220`, sheet class false,
      backdrop absent — **identical before and after**. A guard that passes on both sides, which is
      its job: the phone branch is a new fork inside a function fourteen call sites share, and that
      goes wrong silently.
- [x] **T16** Confirm the record sheet did not regress — AC-9.
      *Closed on:* **8/8 PASS**, including `sheet bottom=844 viewport=844 (gap 0px)` and
      `sheet 635-844 navbar 772-844`.
- [x] **T17** Measure the re-key's blast radius rather than assume it — AC-14.
      *Closed on:* the patch **is not inert**. It changes computed layout for **14 of 17** menu-row
      shapes on desktop and **15 of 17** on a phone. `npm run replay` **PASS, all 8 recorded results
      still hold**. Captures: 204 taken, **15 differ**, against a measured churn floor of **7** —
      floor established by comparing two consecutive identical runs.
- [x] **T18** Run the phase gate — AC-13.
      *Closed on:* **13 green, 0 red**. Within it, placement reports **48/50 with 2 red for a declared
      reason**: the row re-key at the time of the run, and the pre-existing paint-containment
      clipping.
- [ ] **T19** Confirm on the operator's device.
      *Not done.* Every number above is a harness measurement. The report was about visible shape on a
      phone.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- A phone menu docks, spans, caps, scrolls and carries a handle, each with a before-number.
- The backdrop takes the tap, arrives and leaves with the menu, and dismissal keeps one owner.
- Both sides of the drag threshold are asserted, driven through the real pointer pipeline.
- Desktop and the record sheet are measured unchanged.
- The shared row lays itself out in any sheet, and the re-key's reach is a measured number.

**Open, and named:** eight captures moved beyond the churn floor, concentrated in `add-view-popover`
and `calendar-month-view`. That is carried as a design question with a measurement attached, not as
an unexplained regression. No operator confirmation.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md) · [`findings.md`](findings.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- [`../013-add-view-sheet/spec.md`](../013-add-view-sheet/spec.md)

<!-- /ANCHOR:cross-refs -->
