---
title: "Implementation Plan: The Sheet Drag, and the Whole Feedback Set Audited Together"
description: "The approach that was taken to root-cause a gesture that was dying rather than dead, and to re-measure all eight operator sheet asks together on the shipped build."
trigger_phrases:
  - "016 sheet drag plan"
  - "grab bar destroyed by render"
  - "eight sheet asks audited"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: The Sheet Drag, and the Whole Feedback Set Audited Together

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work shipped before the plan was written.

The operator reported the same gesture broken three times. The first two reports were answered
correctly — the browser was cancelling the pointer stream, so the handle got `touch-action: none`;
the target was 36×4px, so it got a full-width band. The third report was different in kind: *"still
barely works … it should guaranteed move down on initial drag"*.

**"Barely" is the word that mattered. The gesture was not dead; it was dying.**

Reading the drag function could not show this, and that is why two rounds of reading it did not. The
function is correct — 1:1 tracking, no movement threshold, a transform on every move. What was wrong
was not in the function.

The phase also re-measured all eight of the operator's sheet asks together, on the shipped build,
because they had been answered by different phases at different times and never checked as a set.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Every number comes from `probe/sheet-audit.mjs`, which opens the surfaces through their real entry
points, loads the shipped stylesheet, installs Obsidian's own `setCssProps`, and drives the gesture
with real touch events through the browser's input pipeline.

| Gate | Observed |
|---|---|
| Audit probe | **19 of 22 pass**, three declared |
| The drag, fresh sheet | 60px drag moves **60.0px** |
| The drag, after one re-render | **60.0px** — previously **0.0px**, with the grab bar absent from the DOM |
| Header actions aligned | both **44×44**, centre lines differing by **0.00px** |
| Single sheet fill | all **9** sheet-capable surfaces at `color(srgb 0.95 0.95 0.95)` |
| Shared row grammar | `min-height 44px`, `padding 8px 16px`, height **44px** in the owned-menu sheet and identically in a panel sheet |

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**Two owners were writing the same child list.** `applySheetChrome` builds the grab bar as a child of
the panel with `panel.prepend(handle)`. `openRecordDetailPanel`'s own `renderContent` begins with
`panel.empty()`.

**The render wins, because it runs last and runs constantly.** `refreshRecordDetailPanel` is called
from three places on every view re-render — every metadata resolve, every computed sync, every
filter, every sort, and every single field edit. So the bar and the listeners bound to it were
destroyed under the finger. That is "barely works" exactly: it works if you are quick, and not
otherwise. It also explains why the ask was that the sheet move *guaranteed* on the *initial* drag —
from the operator's side the gesture is intermittent, and intermittent is what a race looks like.

**The fix has two halves and each is independently necessary.**

*The gesture binds to the panel, not to the bar.* The panel survives every rebuild; the bar does not.
The press must still start on the bar, so the handle is resolved at pointerdown from the panel's
current children rather than captured when the listener was installed — after a rebuild, the handle
passed in is a detached node no press can ever match. Pointer capture moves to the panel for the same
reason.

*The render re-asserts the chrome it just destroyed*, guarded on the surface already being a sheet so
the first render and every desktop render are untouched. This is not redundant with the first half: a
sheet with a working gesture and no bar to aim at is still broken.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

**Step 1 — establish two harness facts, without which no number here means anything.** See §5.

**Step 2 — find the root cause by driving the shipped path**, rather than by reading the drag
function a third time.

**Step 3 — apply both halves of the fix, and revert each alone to prove both are needed.**

**Step 4 — re-measure all eight asks together on the shipped build**, since they had been answered
piecemeal by different phases and never checked as a set.

**Step 5 — write the operator's decisive list**, in the order that separates a working fix from a
fix that only looks right.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

**Two harness facts had to be established before any number meant anything.**

*`setCssProps` is not what the repository's shim says it is.* Obsidian installs
`function(t){var e=this.style;for(var n in t)t.hasOwnProperty(n)&&e.setProperty(n,t[n])}`, read out
of the shipped runtime rather than assumed. `setProperty` takes hyphenated CSS names only and by
CSSOM silently discards anything else. The repository's shim instead assigns `style[name]`, which
accepts camelCase. **The shim is more permissive than the phone**, so a check written against it can
pass on declarations the device never receives. Every probe here installs the shipped
implementation.

*Nothing in this repository had ever driven the gesture.* The placement harness imports
`applySheetChrome` and not the drag function, and the ~204 captures render hand-written markup. The
probes here dispatch `Input.dispatchTouchEvent` through the browser's real input pipeline, because a
synthesised `PointerEvent` skips hit-testing and `touch-action` entirely and would prove only that
the handler is callable.

**Both halves of the fix were reverted individually against the same probe.**

| State | Bar survives a re-render | Drag after a re-render |
|---|---|---|
| Both halves | yes | 60.0px |
| Chrome re-assert reverted | no | 0.0px |
| Panel binding reverted | **yes** | **0.0px** |

**The third row is the important one.** Restoring the bar alone leaves the drag dead while making the
sheet *look* repaired. A fix that stopped there would have shipped, looked right in every capture,
and produced a fourth report.

**One theory was measured and discarded rather than carried.** The panel permanently carries a class
declaring `transition: transform 120ms ease-out`, and a live transition on a dragged property would
produce exactly this symptom. It does not happen: during the gesture the computed
`transition-duration` is `0s` and a 60px move lands at 60.00px in the same frame. An early reading
that looked like lag was the probe's own round trip, and is recorded here so it is not rediscovered
as a defect.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`003-mobile-sheet-presentation` built the sheet, its scrim, its header actions and its fill.
`010-sheet-reading-and-keyboard` built the row rhythm and the keyboard lever. `011` and `013` supplied
the shared row grammar. **This phase measures all of them rather than owning them**, which is why
seven of the eight asks are recorded as "holds" rather than as this phase's work.

The one exception is ask 1, which is this phase's own repair.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

The fix is two changes in the record-detail panel and the sheet module. Reverting either alone
restores the defect — demonstrated, not assumed — so a rollback must take both.

**Three items are declared and deliberately unfixed.**

*A row label is off the type scale.* Measured **13px** against a scale of 12/14/16/18/20/24. Thirteen
is between two steps, which is the defect a scale exists to prevent: it reads as "not quite 14"
rather than as a decision. **A one-token operator decision, not a bug.**

*The record sheet closes on a window resize.* `openRecordDetailPanel` registers
`onResize = () => close()`. A software keyboard announces itself two ways: iOS shrinks
`visualViewport` and leaves the window alone, where the inset works perfectly; a host that resizes
the window instead destroys the sheet before any inset can apply. **This is the one ask whose outcome
genuinely depends on which phone the operator holds.**

*`placeSheet` writes declarations the phone discards.* Five properties are written in camelCase into
a `setProperty` that takes hyphenated names only. Nothing is visibly wrong today because the
stylesheet declares the load-bearing ones `!important` independently — but the declarations are dead
and the harness has been agreeing with the device for the wrong reason. **Left unfixed on purpose:**
correcting the names would activate `overscroll-behavior: contain` for the first time on every sheet,
which is a behavioural change that needs a recapture.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- [`../010-sheet-reading-and-keyboard/spec.md`](../010-sheet-reading-and-keyboard/spec.md)
- [`../012-mobile-touch-semantics/spec.md`](../012-mobile-touch-semantics/spec.md)
