---
title: "Feature Specification: The Sheet Drag, and the Whole Feedback Set Audited Together"
description: "Find why the phone sheet's drag-to-dismiss kept dying after it had been fixed twice, and settle every one of the operator's bottom-sheet asks against the shipped build with a measured number rather than a reading of the source."
trigger_phrases:
  - "sheet drag barely works"
  - "drag to dismiss dead"
  - "grab handle destroyed"
  - "bottom sheet audit"
  - "016 sheet drag"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/016-sheet-drag-and-audit"
    last_updated_at: "2026-08-30T19:10:41Z"
    last_updated_by: "criteria-reconciliation"
    recent_action: "Resize dismissal fixed at the handler; keyboard arrival read from the host bundle"
    next_safe_action: "Operator drags a sheet on device"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
      - "probe/sheet-audit.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-016"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "Row label 13px is off the 12/14/16/18/20/24 scale. Move to 14px or accept?"
      - "Should the record sheet survive a window resize and re-place instead of closing?"
    answered_questions:
      - "The drag kept dying: listeners bound to a node the panel's own render destroys"
      - "No transition was fighting the drag; computed duration is 0s during the gesture"
      - "The scrim neither helps nor hinders; a press on the band resolves to the grab handle"
      - "The keyboard lever is real and reads --keyboard-height, which Obsidian declares"
---

# The Sheet Drag, and the Whole Feedback Set Audited Together

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

<!-- ANCHOR:problem -->
## 1. WHY THIS EXISTS

The operator reported the same gesture broken three times. The first two reports were that
dragging the sheet did nothing, and both were answered correctly: the browser was cancelling the
pointer stream, so the handle got `touch-action: none`; the target was 36x4px, so it got a
full-width band. The third report is different in kind — *"still barely works … it should
guaranteed move down on initial drag"* — and "barely" is the word that matters. The gesture was
not dead. It was dying.

Reading `attachSheetDragToDismiss` cannot show this, and that is why two rounds of reading it did
not. The function is correct: 1:1 tracking, no movement threshold, a transform on every move. What
is wrong is not in the function.

## 2. THE ROOT CAUSE

`applySheetChrome` builds the grab bar as a **child of the panel**:

```
panel.prepend(handle)
```

`openRecordDetailPanel`'s own `renderContent` begins:

```
panel.empty()
```

Two owners, one child list. The sheet module puts a node in; the panel's render takes every node
out. The render wins, because it runs last and runs often — `refreshRecordDetailPanel` is called
from three places on **every view re-render**, which is every metadata resolve, every computed
sync, every filter, every sort, and every single field edit.

So the sequence on a phone is:

1. The sheet opens. The bar is there and the drag works.
2. Anything at all re-renders the view.
3. The bar is gone from the DOM, and the listeners bound to it are bound to a detached node.
4. The thumb arrives and nothing moves.

That is "barely works" exactly: it works if you are quick, and not otherwise. It also explains why
the ask is that the sheet move *guaranteed* on the *initial* drag — from the operator's side the
gesture is intermittent, and intermittent is what a race looks like.

**Measured, on the shipped code driven through `openRecordDetailPanel`:**

| | grab bar in the DOM | a 60px drag moves the sheet |
| --- | --- | --- |
| just opened | yes | 60.0px |
| after one refresh | **no** | **0.0px** |
<!-- /ANCHOR:problem -->

## 3. THE FIX

Two changes, because the defect has two halves and each is independently necessary.

**The gesture binds to the panel, not to the bar.** The panel survives every rebuild; the bar does
not. The press must still *start* on the bar, so the handle is resolved at pointerdown from the
panel's current children rather than captured when the listener was installed — after a rebuild the
handle passed in is a detached node that no press can ever match again. Pointer capture moves to
the panel for the same reason.

**The render re-asserts the chrome it just destroyed.** `renderContent` puts the bar back after
emptying, guarded on the surface already being a sheet so the first render and every desktop render
are untouched. This is not redundant with the first half: the bar is a *visible affordance*, and a
sheet with a working gesture and no bar to aim at is still broken.

### Why both halves are needed, shown rather than asserted

Each half was reverted on its own against the same probe:

| state | bar survives a re-render | drag after a re-render |
| --- | --- | --- |
| both halves | yes | 60.0px |
| chrome re-assert reverted | no | 0.0px |
| panel binding reverted | **yes** | **0.0px** |

The third row is the important one. Restoring the bar alone leaves the drag dead while making the
sheet *look* repaired. A fix that stopped there would have shipped, looked right in every capture,
and produced a fourth report.

## 4. WHAT THE MEASUREMENT NEEDED THAT THE REPO DID NOT HAVE

Two harness facts had to be established before any number here meant anything.

**`setCssProps` is not what the shim says it is.** Obsidian installs
`function(t){var e=this.style;for(var n in t)t.hasOwnProperty(n)&&e.setProperty(n,t[n])}` — read
out of the shipped runtime, not assumed. `setProperty` takes hyphenated CSS names only and by CSSOM
silently discards anything else. The repo's `obsidian-dom-shim.mjs` instead assigns `style[name]`,
which accepts camelCase. **The shim is more permissive than the phone**, so a check written against
it can pass on declarations the device never receives. Every probe here installs the shipped
implementation.

The immediate consequence, measured: `placeSheet` writes `overflowY`, `overscrollBehavior`,
`boxSizing`, `maxWidth` and `maxHeight` in camelCase. On the phone, none of them land.
`box-sizing`, `max-width` and `max-height` are separately declared `!important` in the stylesheet so
nothing is visibly wrong, and `overflow-y` is supplied by a rule as well — but the declarations are
dead, and the harness has been agreeing with the device for the wrong reason. **Not fixed here**:
correcting the names would make `overscroll-behavior: contain` real for the first time, which is a
behavioural change to every sheet and belongs to a phase that can recapture.

**Nothing in this repository had ever driven the gesture.** `verify-placement.mjs` imports
`applySheetChrome` and not `attachSheetDragToDismiss`, and the ~204 captures render hand-written
markup. The probes here dispatch `Input.dispatchTouchEvent` through the browser's real input
pipeline, because a synthesised `PointerEvent` skips hit-testing and `touch-action` entirely and
would prove only that the handler is callable.

One theory was measured and discarded rather than carried: the panel permanently carries
`.db-overlay-enter`, which declares `transition: transform 120ms ease-out`, and a live transition on
a dragged property would produce exactly this symptom. It does not happen. During the gesture the
panel's computed `transition-duration` is `0s` and a 60px move lands at 60.00px in the same frame.
An early reading that looked like lag was the probe's own CDP round trip, and is recorded here so it
is not rediscovered as a defect.

<!-- ANCHOR:success-criteria -->
## 5. THE OTHER SEVEN ASKS

Settled in [`acceptance-criteria.md`](acceptance-criteria.md) with a number each. In summary: the
header actions, the row rhythm, the grab band, the single sheet fill, the scrim and the shared row
grammar all hold. Two things do not, and both are decisions rather than defects — the 13px row
label is off the type scale, and the record sheet closes on a window resize, which is one of the two
ways a software keyboard announces itself.
<!-- /ANCHOR:success-criteria -->

<!-- ANCHOR:scope -->
## 6. SCOPE

Changed: `src/views/mobile-bottom-sheet.ts`, `src/views/record-detail-panel.ts`. No stylesheet edit,
so no capture moves and no lane is taken. `owned-menu.ts` calls the gesture with the same signature
and is unmodified; it benefits from the same repair.

Not changed, and owed to a later phase: the camelCase declarations in `placeSheet`, the permissive
`setCssProps` in `obsidian-dom-shim.mjs`, and merging these checks into `verify-placement.mjs`,
which was being edited concurrently.
<!-- /ANCHOR:scope -->
