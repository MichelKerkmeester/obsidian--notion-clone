---
title: "Feature Specification: Touch Row Range Selection"
description: "Remove the device predicate that made every touch press on a row checkbox extend a range, and give touch a real gesture for the range it lost — a held press on the checkbox."
trigger_phrases:
  - "row checkbox selects too many"
  - "touch range selection"
  - "long press checkbox"
  - "shift is permanently held"
  - "017 row range"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/017-touch-row-range-selection"
    last_updated_at: "2026-08-30T19:10:41Z"
    last_updated_by: "criteria-reconciliation"
    recent_action: "Completion anchor reconciled: AC-1 to AC-9 all green in the captured run"
    next_safe_action: "Operator answers the status-bar announcement, then taps a checkbox on device"
    blockers:
      - "Placement exits 1 on three stylesheet-lane checks, shown independent of this phase (plan.md 7)"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-017"
      parent_session_id: null
    completion_pct: 73
    open_questions:
      - "The hold gesture has no affordance anywhere. Should the selection status bar carry a one-line hint the first time a row is selected on touch?"
    answered_questions:
      - "Not a second mechanism: the gesture is `attachLongPress`, the same object the row menu uses, so the threshold, tolerance and haptic are shared rather than matched."
      - "The long-press row menu is untouched and still the only path to several row actions on a phone; the two holds are separated by target, not by timing."
---
# Feature Specification: Touch Row Range Selection

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md). Related: `012-mobile-touch-semantics`, which
> repaired the identical defect for *cell* selection and created the shared module this phase
> extends. Until now the two halves of the same table disagreed.

<!-- ANCHOR:problem -->
## 1. THE REPORT

The operator: a tap on a row checkbox does not select that row. It selects everything between that
row and the last one touched. Every time, on every touch device.

## 2. THE CAUSE, measured

Two mirrored sites, one line each:

- `src/views/database-view.ts` — `range: Boolean(event?.shiftKey || isTouchDevice(this.containerEl_))`
- `src/views/embedded-database-renderer.ts` — `range: Boolean(event?.shiftKey || isTouchDevice(this.containerEl))`

`isTouchDevice` is true for every phone and tablet, so `range` was unconditionally true there. The
result is shift held down with no way to let go: `applyRangeSelection` takes the span from the anchor
to the target on every press. Tapping row 2 then row 8 selected **7 rows**, not 2.

The same predicate is also true for a mouse-driven split pane narrower than 760px, so this was never
only a phone defect. On a 1440px desktop window with a 700px leaf, a plain mouse click selected the
same 7 rows.

### Why it survived the repair next to it

`012-mobile-touch-semantics` fixed exactly this branch for cell selection, in these same two files,
and introduced `src/views/table-cell-gesture.ts` so the decision would live in one place. The row
checkbox's copy was not moved with it. From that point the table obeyed two contradictory rules at
once — a cell press read the pointer, a row press read the device — and nothing could observe the
disagreement, because each rule was correct on its own terms in its own file.

That is the argument for where the fix goes, not just what it is. The defect is not the predicate;
the defect is that one decision had two homes.
<!-- /ANCHOR:problem -->

## 3. THE FIX

### 3.1 The rule moves next to the rule it contradicted

`shouldExtendRowRange` now sits directly beside `nextCellRange` in `table-cell-gesture.ts`, and both
views call `applyRowSelectionPress` instead of reaching for `applyRangeSelection` themselves. Neither
view mentions `isTouchDevice` anywhere near row selection any more.

The rule takes two fields and no device question:

```ts
export function shouldExtendRowRange(input: RowRangeInput): boolean {
  return input.shiftKey || input.heldPress;
}
```

What replaces the predicate is not a narrower predicate. It is two named grammars, neither of which a
device can be mistaken for: a modifier key needs a keyboard, and a held press needs a finger.

### 3.2 Touch gets the range back, as a gesture

Deleting the predicate alone would have left touch with no way to select a range at all — the only
way to act on many rows at once. Touch has no shift, so it needs a *second gesture*, not a second
meaning for the first one.

A held press on the row checkbox extends the selection from the anchor. The slot was free: all four
row long-press call sites screen out `input`, so a hold on a checkbox did nothing and could collide
with nothing.

`attachRowRangeGesture` is built **on** `attachLongPress` rather than beside it. The 450ms threshold,
the 10px movement tolerance, the touch-or-pen guard and the 20ms haptic are not re-specified — they
are inherited by omission, so the two holds are one gesture vocabulary because they are one
implementation, not because two numbers were tuned to agree. This is the established project value
winning over any default: no new timing constant was introduced.

The extension applies when the hold completes, not when the finger lifts, so the haptic and the
painted rows arrive together. That leaves a click still to come from the release, which would toggle
the row straight back off, so the first click after a completed hold is swallowed.

### 3.3 The row menu is untouched

The two holds on the same row are separated by **target**, not by timing: the row menu ignores
presses that land on a control, and the range gesture ignores presses that do not land on the
checkbox. They cannot both fire. The long-press row menu keeps every row action it had.

One correction was required to make that true. The embedded renderer screened its long-press target
*inside* `onLongPress`, after the timer — so a hold on a checkbox already buzzed and already
swallowed the press before declining to open anything. Left alone, adding a second gesture to the
checkbox would have produced two haptics for one hold. That screening moved to `ignoreTarget`, where
the full table view already had it. The selector list is unchanged, so the menu's behaviour is not.

<!-- ANCHOR:scope -->
## 4. SCOPE

**In.** `src/views/table-cell-gesture.ts`, `src/views/database-view.ts`,
`src/views/embedded-database-renderer.ts`, `tools/storybook/verify-placement.mjs`.

**Out.** `styles.css` and the card renderers are held by another lane and were not edited. No CSS was
needed: the gesture adds no painted affordance, which is the open question in §6.
<!-- /ANCHOR:scope -->

<!-- ANCHOR:success-criteria -->
## 5. VERIFICATION

Twelve checks in `tools/storybook/verify-placement.mjs`, section 5f, six on each of two pages. They
drive the shipped gesture module with real `PointerEvent`s and let it mutate a real selection set
through `applyRowSelectionPress` — the function both views call. Only the four-line view adapter is
reproduced, in the same shape and the same listener order.

The second page is the load-bearing one: a 1440px desktop window with a 700px leaf, so
`isTouchDevice` reports **true** while the pointer says mouse. Every check on it asserts the
predicate is true before trusting its own result, or it would be passing on a wide pane for a reason
it is not testing.

Numbers, thresholds and the six negative controls: [`acceptance-criteria.md`](acceptance-criteria.md).
<!-- /ANCHOR:success-criteria -->

<!-- ANCHOR:questions -->
## 6. OPEN QUESTION — the gesture cannot be discovered

There is no affordance for it. Nothing on screen says a checkbox can be held, the checkbox looks
identical to one that cannot, and the only feedback arrives 450ms after a person has already
committed to an action they had no reason to try. A user who does not already know is not going to
find it.

The honest read: as shipped, this gesture exists for someone who is told about it. That is still
strictly better than the defect it replaces — the capability was unreachable and is now reachable —
but it is not yet a feature anyone will find on their own.

The cheapest place to fix it is one that already exists and already appears at the right moment. The
selection status bar renders as soon as one row is selected, which is exactly when a range becomes
worth wanting, and it is on screen next to the checkboxes rather than in a settings page — feedback
next to its trigger. A single line there, on touch, while the selection is one row, would carry it.
That needs an i18n string and a style rule, so it belongs to the lane that holds the stylesheet.
<!-- /ANCHOR:questions -->
