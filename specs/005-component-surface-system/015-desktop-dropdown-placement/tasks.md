---
title: "Task Breakdown: Desktop Dropdown Placement"
description: "The work as it was actually done: five paths inventoried by closure proof, six defects measured, five fixed at two seams, and the sixth declared with its reason."
trigger_phrases:
  - "015 dropdown placement tasks"
  - "placement probe evidence"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Desktop Dropdown Placement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Written after the work was done.** Each task closes on a measured coordinate.

**A declared red is a closed task with an unfixed defect.** T14 is `[B]`, not `[x]` and not silently
absent: the defect is measured, its cause is confirmed by a control, and the reason it was not fixed
is a file lock rather than a judgement.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — prove the inventory rather than search for it

- [x] **T1** Build a closure assertion over placement primitives.
      *Closed on:* `probe-inventory.mjs` enumerates the four primitives that can put a box at a
      coordinate, then asserts **no other code in `src/` writes a placement coordinate**. That
      assertion **failed**, and its failure list is the finding: **16 coordinate writes across 7
      files**.
- [x] **T2** Establish why a search could not have found this.
      *Closed on:* four of the sixteen are real desktop dropdown surfaces that **no search for
      `positionToolbarPopover` returns** — the calendar/timeline search results, the anchorless column
      submenu, the formula autocomplete, and the calendar day popover. Completeness is a property of
      the extractor, not of diligence.
- [x] **T3** Classify all five placement paths and locate the defects.
      *Closed on:* path A (`positionToolbarPopover`, 34 sites) is **correct on every check**. The
      defects cluster in B (`showAt`, 14 sites) and E (hand-written `setCssProps` on a portal, 4
      sites, clamped to **the window** rather than the editing area).

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION — two seams, then three independent defects

- [x] **T4** Cap the owned menu's height and give it an overflow — AC-1, seam 1.
      *Closed on:* a 60-row menu measured **1808px tall, running 912px past the editing area**
      (`menu.bottom=1812` against `bounds.bottom=900`), with `max-height: none` and
      `overflow-y: visible`; its last row sat at `y=1778..1808`, off screen and unreachable by
      pointer or keyboard. Now height **892px**, overflow **−4px**, `max-height: 892px`,
      `overflow-y: auto`, and scrolled to the end the last row sits at `y=862..892` against a bound
      of 900.
- [x] **T5** Note that capping is what makes the clamp well-formed.
      *Closed on:* until the height is bounded, `bounds.bottom − height − margin` can sit above
      `bounds.top + margin` and the vertical clamp has to invert. The cap is not only a cap.
- [x] **T6** Give `showAt` a target that can carry an anchor — AC-2, seam 2.
      *Closed on:* trigger at `y=780..808`, menu at `y=444..812` — the menu covered **28px of a 28px
      trigger, all of it** — with the gap above the trigger measuring **−32px** where +4px was
      wanted. A **36px error, exactly the trigger's height plus both gaps.** Now menu at
      `y=408..776`, overlap **0px**, gap **+4px**.
- [x] **T7** Stop three call sites throwing the trigger's height away.
      *Closed on:* `column-menu`, `row-menu` and the embedded renderer had each hand-written the same
      four lines — measure the trigger, add the gap, pass a point. **No point-only formulation can
      fix this**: a cursor and a trigger want different flip targets and the difference is the
      trigger's own height, which the call site had and discarded.
- [x] **T8** Make a surface whose anchor dies stop presenting as placed — AC-3.
      *Closed on:* before, the anchor was destroyed while the surface stayed open and the panel
      **moved 0px, stayed connected and stayed `visible`** — painted at the dead anchor's last
      coordinate, over rebuilt content, still focusable and still accepting input. Now `visibility`
      goes `visible` to `hidden` on the next loop tick. **Live path:** the filter panel's date value
      picker commits a draft on every segment edit, and the commit rebuilds the panel and destroys the
      trigger while the picker survives on the container.
- [x] **T9** Clamp the anchorless column submenu to the editing area — AC-4.
      *Closed on:* right edge at **1328** against an editing area ending at **1140** — **188px under
      an open right sidebar** — because it clamped against `view.innerWidth=1440`, which spans both
      sidebars. Now right edge **1080**, clamped against `bounds.right=1140`. The hardcoded 320px
      height assumption was replaced with the panel's measured height.
- [x] **T10** Keep the formula autocomplete inside its field — AC-5.
      *Closed on:* **169px overhang** with the caret at x=700 of an 800px modal; now **0px**.
      `estimateCaretPosition` bounds the corner the box *starts* at and says nothing about the corner
      it *ends* at, and the CSS `max-width` caps the width without moving the box.
- [x] **T11** Fix the second defect in the same path.
      *Closed on:* the box was positioned **before** its rows were added, so it was measured at its
      `min-width` rather than its real width. Filling now precedes placing, and the reveal precedes
      the measurement — a `display: none` element measures zero.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T12** Throw away a check that passed against the defect — AC-1.
      *Closed on:* the obvious form, `scrollHeight <= clientHeight || overflow is auto`, **passes on
      the broken menu**, because an uncapped element grows to fit and its `scrollHeight` equals its
      `clientHeight` by definition. Written, observed green against the defect, and replaced with a
      hit-position measurement. Recorded because the same shape will be tempting again.
- [x] **T13** Correct a simulation that tested nothing — AC-3.
      *Closed on:* the first version re-called `positionToolbarPopover` with a dead anchor, which hits
      the **entry guard** and returns before `place()` runs — so the fix under test never executed and
      the check reported a failure the running app does not have. The real sequence places against a
      live anchor to install the loop, destroys the anchor, then lets the loop tick.
- [x] **T14** Install controls that distinguish the fix from a blanket behaviour.
      *Closed on:* a 5-row menu overflows by **−702px** under the same call, so the cap check
      separates a tall menu from any menu. A surface with a **live** anchor survives the loop at
      `visibility: visible` with a 6px gap, so AC-3 cannot be satisfied by a positioner that hides
      everything. The cursor form opened at `y=812` still has its bottom at **812**, so the anchor fix
      did not move the eleven call sites nobody complained about. The autocomplete's pre-fix statement
      re-run in place **still overhangs 169px**.
- [x] **T15** Confirm the phone did not move — AC-6.
      *Closed on:* owned menu still a full-width bottom sheet at `[0..390]` on a 390px viewport,
      bottom 844 equal to viewport height, `max-height: 759.6px`, `overflow-y: auto`, height 389
      against a 760 cap — **identical before and after**. Every change sits inside a desktop-only
      branch; the phone returns from `showAt` before reaching it.
- [x] **T16** Run the gates.
      *Closed on:* types **exit 0**; vitest **434 passed, exit 0**; build **exit 0**; placement
      harness **81/82** with one declared red, exit 0; placement probe **30/31** with one declared
      red, exit 0; inventory closure **16 writes across 7 files, all classified, baseline holds, exit
      0**.
- [B] **T17** The calendar/timeline search-results panel.
      **Measured, declared, unfixed.** Right edge **1380** against an editing area ending at **1140**
      — **240px under the sidebar, growing to 292px** as the anchor moves right. The control confirms
      the clamp is the cause: the overhang tracks the anchor. **Blocked** because the method is
      duplicated verbatim in `database-view.ts` and `embedded-database-renderer.ts`, both held by
      another session for the whole phase.
- [ ] **T18** Merge the probe into the shared placement harness.
      *Owed.* `tools/storybook/verify-placement.mjs` was open elsewhere throughout.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- The inventory is a closure proof, so a sixth mechanism added later turns it red rather than going
  unnoticed.
- Five of six defects fixed, each with a failing-first coordinate and a control.
- Two defective checks were found and replaced before being trusted.
- The phone and the cursor form both measured unchanged.
- All six gates green, with the one declared red carried explicitly in two of them.

**Open, and named:** the sixth defect is blocked on a file lock, not on a decision. The probe's merge
into the shared harness is owed. Four further findings were recorded and deliberately not acted on;
they are listed in `plan.md` §7.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../001-overlay-placement-and-menu-language/spec.md`](../001-overlay-placement-and-menu-language/spec.md)

<!-- /ANCHOR:cross-refs -->
