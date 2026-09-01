---
title: "Task Breakdown: The Sheet Drag, and the Whole Feedback Set Audited Together"
description: "The work as it was actually done: two harness facts established, the root cause found by driving the shipped path, both halves proved necessary, and eight asks re-measured as a set."
trigger_phrases:
  - "016 sheet drag tasks"
  - "sheet audit evidence"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: The Sheet Drag, and the Whole Feedback Set Audited Together

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Written after the work was done.** Each task closes on a number the probe produced.

**A "holds" verdict is a measurement, not an inheritance.** Seven of the eight asks were built by
earlier phases; this phase re-measured each on the shipped build rather than citing the phase that
built it.

**A declared failure is closed as declared, not as done.** Three are recorded below with their
numbers and the reason each was not fixed.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — establish the harness facts first

- [x] **T1** Establish what `setCssProps` actually is in the shipped runtime.
      *Closed on:* Obsidian installs
      `function(t){var e=this.style;for(var n in t)t.hasOwnProperty(n)&&e.setProperty(n,t[n])}`, read
      out of the shipped bundle. `setProperty` takes hyphenated names only and by CSSOM silently
      discards anything else. **The repository's own shim assigns `style[name]` and accepts
      camelCase, so it is more permissive than the phone** — a check written against it can pass on
      declarations the device never receives. Every probe here installs the shipped implementation.
- [x] **T2** Establish that nothing in the repository had ever driven the gesture.
      *Closed on:* the placement harness imports `applySheetChrome` and **not**
      `attachSheetDragToDismiss`, and the ~204 captures render hand-written markup. So the probes
      dispatch `Input.dispatchTouchEvent` through the browser's real input pipeline — a synthesised
      `PointerEvent` skips hit-testing and `touch-action` entirely and would prove only that the
      handler is callable.
- [x] **T3** Establish that the drag function itself is not the defect.
      *Closed on:* 1:1 tracking, no movement threshold, a transform on every move. Two prior rounds of
      reading it found nothing because there is nothing there to find. **What is wrong is not in the
      function.**

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION — root cause, then both halves

- [x] **T4** Find the root cause by driving the shipped path.
      *Closed on:* `applySheetChrome` builds the grab bar as a **child of the panel**
      (`panel.prepend(handle)`); `renderContent` begins with `panel.empty()`. Two owners, one child
      list. **The render wins because it runs last and runs constantly** —
      `refreshRecordDetailPanel` fires on every metadata resolve, computed sync, filter, sort and
      field edit. Measured on the shipped code: grab bar in the DOM **yes** when just opened and
      **no** after one refresh; a 60px drag moves **60.0px** then **0.0px**.
- [x] **T5** Bind the gesture to the panel rather than to the bar.
      *Closed on:* the panel survives every rebuild. The handle is resolved at pointerdown from the
      panel's current children rather than captured when the listener was installed — after a rebuild
      the handle passed in is a detached node that no press can ever match. Pointer capture moves to
      the panel for the same reason.
- [x] **T6** Make the render re-assert the chrome it just destroyed.
      *Closed on:* guarded on the surface already being a sheet, so the first render and every desktop
      render are untouched. **Not redundant with T5:** a sheet with a working gesture and no bar to
      aim at is still broken.
- [x] **T7** Prove both halves are necessary by reverting each alone.
      *Closed on:* both halves — bar survives, 60.0px. Chrome re-assert reverted — bar gone, 0.0px.
      **Panel binding reverted — bar survives, still 0.0px.** The third row is the important one:
      restoring the bar alone leaves the drag dead while making the sheet *look* repaired, which is
      what two earlier fixes did and why a third report arrived.
- [x] **T8** Measure and discard the transition theory rather than carry it.
      *Closed on:* the panel permanently carries a class declaring `transition: transform 120ms
      ease-out`, and a live transition on a dragged property would produce exactly this symptom.
      **It does not happen** — during the gesture the computed `transition-duration` is `0s` and a
      60px move lands at 60.00px in the same frame. An early reading that looked like lag was the
      probe's own round trip, recorded so it is not rediscovered as a defect.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION — all eight asks, re-measured as a set

- [x] **T9** Ask 1, the drag — **fixed here.**
      *Closed on:* 60px drag moves **60.0px both fresh and after a view re-render**. Before: 60.0px
      fresh, **0.0px** after, with the grab bar absent from the DOM.
- [x] **T10** Ask 2, header action alignment — **holds.**
      *Closed on:* both measure **44×44** and their centre lines differ by **0.00px**.
- [x] **T11** Ask 3, the Notion-like row rhythm — **2 of 3 hold.**
      *Closed on:* gap between adjacent rows **0px**; divider **1px at 40% alpha**; value text
      **16px**. **The label measures 13px, which is not on the type scale** — declared below.
- [x] **T12** Ask 4, keyboard avoidance — **mechanism proven, one host shape unreachable.**
      *Closed on:* with `--keyboard-height: 336px` the sheet's bottom moves from 844 to **508** on an
      844px screen, clearance **336px**, its top stays on screen at **y=275**, and it returns to 844
      when the keyboard closes. **But a window resize closes the sheet outright** — declared below.
- [x] **T13** Ask 5, the grab band — **holds, with the record corrected.**
      *Closed on:* the band answers presses over **y=1..32**, so **32px**, full width at **386 of
      390** (the remainder is the sheet's own border and scroll gutter). **The written record said
      35px**; the stylesheet's own arithmetic is `--db-space-6`(16) + 8 + 4 + 4 = **32**. Clears WCAG
      2.5.8's 24px AA target and falls short of 2.5.5's 44px, knowingly — this was closed as an
      operator decision and is not reopened here.
- [x] **T14** Ask 6, one sheet fill — **holds.**
      *Closed on:* all **9** sheet-capable surfaces measure the identical fill
      `color(srgb 0.95 0.95 0.95)`. The written record says seven surfaces; nine were found.
- [x] **T15** Ask 7, the scrim — **holds; the last clause is a non-issue.**
      *Closed on:* scrim is `rgba(0, 0, 0, 0.25)` with `pointer-events: auto`. A press 120px above the
      sheet resolves to the scrim, not the table. A press on the grab band resolves to **the grab
      handle**, not the scrim (sheet z=1000, scrim z=999). The operator's *"that way drag handler
      works better"* is a non-issue: the scrim neither helps nor hinders the drag, whose real cause
      was elsewhere.
- [x] **T16** Ask 8, reusable sheet row components — **holds.**
      *Closed on:* a row built by `createMenuRow` measures `min-height 44px`, `padding 8px 16px` and
      height **44px** in the owned-menu sheet and **identically** in a panel sheet.
- [x] **T17** Write the operator's decisive list in the order that separates a real fix from a
      cosmetic one.
      *Closed on:* five steps, with step 2 — open a sheet, edit a field, let it save, drag again — named
      as the case that was broken and the single most useful thing the operator can report.
- [ ] **T18** Declared: a row label is off the type scale.
      **13px** from `--db-font-md`, against a scale of 12/14/16/18/20/24. Between two steps, which is
      the defect a scale exists to prevent. The value beside it is 16px and on the scale. **A
      one-token operator decision, not a bug.**
- [ ] **T19** Declared: the record sheet closes on a window resize.
      `openRecordDetailPanel` registers `onResize = () => close()`. iOS shrinks `visualViewport` and
      leaves the window alone, where the inset works. A host that resizes the window destroys the
      sheet before any inset can apply. **This is the one ask whose outcome depends on which phone
      the operator holds.**
- [ ] **T20** Declared: `placeSheet` writes declarations the phone discards.
      Five properties written camelCase into a `setProperty` that takes hyphenated names only.
      Nothing is visibly wrong because the stylesheet declares the load-bearing ones `!important`
      independently — **but the declarations are dead and the harness has been agreeing with the
      device for the wrong reason.** Left unfixed on purpose: correcting the names would activate
      `overscroll-behavior: contain` for the first time on every sheet, which needs a recapture.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- The root cause is named, measured, and demonstrated on the shipped code.
- Both halves of the fix were reverted individually and each shown necessary.
- All eight asks carry a verdict and a number from one probe run on one build.
- **19 of 22 checks pass; the three that do not are each declared with their number.**

**What only the operator can confirm**, stated as inferred rather than measured: whether Obsidian
mobile publishes a non-zero keyboard height at the moment the keyboard opens on their device; which
resize signal their phone sends, which decides whether ask 4 is finished or blocked; and whether a
real thumb landing at an angle on a moving list behaves like the one clean finger the probe
dispatches.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- [`../010-sheet-reading-and-keyboard/spec.md`](../010-sheet-reading-and-keyboard/spec.md)
- [`../012-mobile-touch-semantics/spec.md`](../012-mobile-touch-semantics/spec.md)

<!-- /ANCHOR:cross-refs -->
