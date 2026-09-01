---
title: "Feature Specification: Sheet Lifecycle Ownership"
description: "Every sheet has one owner for its whole life, so the scrim always comes down, the drag always survives a re-render, and no handle is drawn onto nothing."
trigger_phrases:
  - "sheet lifecycle"
  - "orphaned scrim"
  - "sheet wont drag"
  - "031 lifecycle"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Flick threshold settled at 0.8 px/ms and the lane's drags given a clock they choose"
    next_safe_action: "The operator opens and closes each sheet family on device"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031"
      parent_session_id: null
    completion_pct: 83
    open_questions:
      - "Does the live-sheet set prune on a microtask, or on an explicit teardown call?"
    answered_questions:
      - "Only two of six applySheetChrome call sites ever pass false, verified in the shipped bundle"
      - "The two drag failures have different causes; fixing one will not fix the other"
---
# Feature Specification: Sheet Lifecycle Ownership

> Phase chain: parent [`../spec.md`](../spec.md). Opened from measured findings, not from a
> redesign impulse. Every defect below was located in the shipped tree.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 031-sheet-lifecycle-ownership |
| **Level** | 2 |
| **Status** | **In progress — 5 of 6 criteria.** In the tree: the backdrop no longer outlives its sheet; the group sheet keeps its bar through a rebuild; the portalled header panels find their own panel and reach the overlay stack; an unwired grab bar is now unrepresentable; and a flick dismisses at a measured threshold. Open: the operator seeing the freeze gone |
| **Complexity** | 61/100, confidence 92% |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

**The plugin has a shared geometry helper and no shared sheet lifecycle.** One function positions
every sheet; mounting, dismissal, drag, focus, refresh and teardown are each owned by whichever
component happened to create it. So "it is a sheet" says where it sits on screen and nothing about
who is responsible for it.

That single gap produces four separate operator-visible defects, none of which is fixed by fixing
another.

**The scrim is never taken down.** `applySheetChrome` has six call sites in `src/` and only **two** ever
pass `false`. Every sheet mounted through `positionToolbarPopover` — filter, sort,
columns, view config, group, add-view, cell editors, pickers — creates a body-level
`.db-mobile-sheet-scrim` at `inset: 0`, `pointer-events: auto`, and never removes it. A dimmed,
tap-swallowing overlay across the whole app is what a user calls a freeze. Two panels are worse:
view-config and column-manager find their previous panel with a container-scoped selector that
misses the portalled node, so the **sheet itself** is never removed either, and a later cleanup can
no longer clear the scrim.

**The drag fails for two unrelated reasons.** The group sheet calls `panel.empty()` and never
re-asserts chrome, so the grab bar is destroyed and the drag target resolves to a detached node —
the same defect `016` root-caused for the record sheet, on a surface nobody re-checked. The view
sheet is portalled to `body` but registers through a container-scoped selector, so on a phone it is
never in the overlay stack and the drag springs back. Outside-tap still closes it, which is exactly
why only the drag was reported.

**Sixteen modal sheets draw a handle wired to nothing.** `DbModal` applies sheet chrome and never
attaches the drag, so the grab bar is visible and permanently dead. Sixteen, not thirteen: twenty
classes extend `DbModal`, four ask for `fullscreen`, thirteen ask for `sheet` explicitly, and three
more take the constructor default — which is `sheet`. Counting explicit arguments instead of
presentations is how the number came out low, and it is the kind of derived count this packet's log
warns goes stale silently.

**Dismissal is distance-only.** A 96px threshold with no velocity term on an 844px screen: a flick
that travels 60px springs back. A user reports that as "cannot be dragged down".
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

**In scope.** The scrim's teardown; the two drag causes; the dead modal handles; velocity-based
dismissal; and the one structural change that prevents the class returning — mounting returns a
disposer instead of relying on a symmetric second call.

**Out of scope.** The typed surface-handle architecture the prior research recommended in full.
Adopt the disposer, not the whole shape: nothing here needs a Root context or a snap-point state
machine. Menu row grammar belongs to `../027-sheet-menu-grammar-and-motion`. Render-cost freezes
belong to `../028-remaining-freezes`.
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

| ID | Requirement |
|----|-------------|
| REQ-001 | Closing any sheet leaves no `.db-mobile-sheet-scrim` and no `.db-mobile-bottom-sheet` on the body. |
| REQ-002 | The group sheet drags after a group toggle has re-rendered its panel. |
| REQ-003 | The view, filter, sort and column sheets are in the overlay stack on a phone, so a drag dismisses them. |
| REQ-004 | No sheet draws a grab handle it has not wired. |
| REQ-005 | A flick dismisses; dismissal is not distance-only. |
| REQ-006 | Mounting returns a disposer, so a caller that only removes its element still leaves the chrome correct. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- [x] A producer-parity check opens and closes **each** sheet family and asserts no scrim and no
      sheet survives. It must **pass for the owned menu and fail for the panel families today** —
      a check that passes everywhere before the fix is not discriminating.
      **Met** — the `sheet-teardown` lane, observed red with exactly that asymmetry.
- [x] The group sheet's handle survives a toggle, and a 120px drag dismisses. Today: handle absent,
      0.0px. **Met** — asserted on the real `ToolbarRenderer` with a real pointer, red first on both
      halves.
- [x] `overlayStack.dismissPanel(panel, "programmatic")` returns true for a phone view sheet.
      Today: false. **Met** — asserted alongside the container selector finding nothing, so the
      case cannot pass on a sheet that never portalled.
- [x] Every sheet that draws a handle has a drag attached, asserted by construction rather than by
      inspection. **Met by construction** — the gesture draws the bar and chrome re-creates one only
      where a gesture is attached, so an unwired bar cannot be built. Verified by removing that
      guard: the guarantee goes red.
- [ ] The operator opens and closes each sheet on device without the app becoming unresponsive.
      **Only the operator closes this row.**
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 5. RISKS

| Risk | Likelihood | Mitigation |
|---|---|---|
| A disposer is added and callers keep the old symmetric call | Med | Back it with a live-sheet set, so a caller that only removes its element is still correct by construction |
| The scrim fix hides a leak rather than removing it | Med | Assert absence of both scrim and sheet, not just the scrim |
| Velocity dismissal makes accidental dismissal easier | Low | The gesture can only start on the grab target, so it cannot begin on scrollable content |
| Fixing one drag cause is mistaken for fixing both | **High** | REQ-002 and REQ-003 are separate rows with separate evidence, deliberately |
| The group sheet is fixed and the same shape is read as fixed everywhere | Med | It is not. An inventory of all 40 `.empty()` sites is below; two conditional cases remain |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:empty-inventory -->
## 5a. WHO ELSE EMPTIES A SHEET PANEL

REQ-002 was written as a one-line fix for one surface. Before taking that on trust, all 40
`.empty()` call sites under `src/views/` were read to find out whether the same defect was
sitting in others. It mostly was not, and the inventory is recorded so the next person does not
have to redo it — and does not assume a wider fix landed than actually did.

| Site | What it empties | Re-asserts chrome? |
|---|---|---|
| `toolbar-renderer.ts` group popover | the sheet panel | **No** — the defect. Fixed by T4 |
| `toolbar-renderer.ts` database popover | the sheet panel | Yes, repositions unconditionally at the end |
| `record-detail-panel.ts` `renderContent` | the sheet panel | Yes, explicit re-assert — the precedent T4 followed |
| `icon-picker-popover.ts` `render` | the sheet panel | Yes, repositions unconditionally at the end |
| `column-menu.ts` × 2 (number display, text render mode) | the sheet panel | **Only `if (anchorEl?.isConnected)`** |
| filter / sort `renderSingleRuleEditor` | a rule-row child | n/a — the panel is untouched, and the enclosing re-render repositions |
| `calendar-timeline-toolbar-renderer.ts` | a content child | n/a |
| the other 30 | rows, lists, cells, labels | n/a |

**The open one.** Both `column-menu.ts` rebuilds restore their chrome inside
`if (anchorEl?.isConnected)`, and `anchorEl` is an optional parameter. A caller that omits it, or
whose anchor has left the document by the time a rebuild runs, empties the panel and never puts the
bar back — the exact T4 defect behind a condition. It is left open rather than fixed because
whether either call path actually reaches a phone sheet without a live anchor is unknown, and
guessing would add a line to a surface nobody has reported. Deciding it needs the device, which is
T10's job anyway.
<!-- /ANCHOR:empty-inventory -->

---

## 6. WHY THE HARNESS DID NOT CATCH THE SCRIM

`verify-placement` does assert that "the backdrop arrives with the menu and leaves with it" — but
only against `createOwnedMenu`, the one surface that cleans up. Elsewhere it hand-removes a leaked
scrim so the next check can run.

That is this packet's own lens pointed at its own instrument: *if this value came from the device
instead of the harness, would the check still pass?* Here the harness cleaned up the evidence of the
defect in order to keep testing. The producer-parity check in §4 is the D12-shaped replacement — it
compares every producer against the one that behaves, so a harness cannot fake it without giving the
same wrong answer for all of them.

---

## 7. THE FLICK THRESHOLD, DECIDED — 2026-09-01

REQ-005 was built, measured, and reverted once, because the velocity rule it first carried dismissed
a **brisk 95px drag** — a gesture deliberately stopped short of the 96px distance threshold, which is
a cancel. A surface that closes anyway ignores the correction the user just made.

**The decision: 0.8 px/ms, which sits above frame pace.** A deliberate slow drag runs about 0.08
px/ms, a genuine flick about 1.18, and a brisk drag delivered at frame pace lands near 0.5. Putting
the line at 0.8 leaves the flick clearly above and the brisk drag clearly below, so the gesture the
revert was about now reads the same way to both rules and there is nothing left to arbitrate.

**It is measured, not reasoned.** `95px at 0.59 px/ms → sprang back`, driven through the shipped
gesture on a real sheet. Red with the threshold lowered to 0.4: the same gesture `→ dismissed`, which
is the conflict that caused the revert, reproduced on demand.

### 7a. AND THE HARNESS THAT COULD NOT HAVE SEEN IT

The lane's synthetic drags carried no timing, and that was not a small gap.

`PointerEvent.timeStamp` is stamped by the browser at dispatch, and **two dispatches in one tick are
0.0999ms apart** — measured, not assumed. The gesture divides by that interval, so a 30px synthetic
move computed **300 px/ms** against a 0.8 threshold. Every hand-made drag in the placement lane was
reading as an infinitely fast flick.

Nothing went red for it, which is exactly why it mattered: a drag that dismisses because it passed
the distance threshold and a drag that dismisses because it was mistaken for a flick look identical
from outside. Two checks kept their stated cause in their own detail text while the real cause had
changed underneath them.

**`timeStamp` is writable per instance**, so the clock is now the check's to choose. Both existing
drags were retimed — the add-view dismissal at 0.58 px/ms so it is the distance path it claims to be,
the entrance-interrupt at 0.19 px/ms so it stops dismissing the sheet it is measuring — and six new
checks drive the decision end to end on a real grab bar:

| Gesture | Result | What it pins |
|---|---|---|
| 40px at 1.25 px/ms | dismissed | the velocity path is wired into `onUp` at all |
| 40px at 0.08 px/ms | sprang back | the clock is the only difference between the two |
| 140px at 0.58 px/ms | dismissed | the distance path still works independently |
| 40px at 1.25 px/ms, 150ms rest | sprang back | staleness is measured from the last MOVE, not the press |
| 95px at 0.59 px/ms | sprang back | the gesture the revert was about |

Three watched reds: unwiring `|| flicked` leaves the fast short drag springing back; passing `0` for
the staleness interval dismisses the rested finger; lowering the threshold to 0.4 dismisses the brisk
95px drag. **`sheet-rebuild` asks `shouldFlickDismiss` four questions directly and that is right for a
pure function whose speed a harness cannot control — but it cannot see the wiring.** All three of
those breaks leave it green.

---

## RELATED DOCUMENTS

- Parent spec: [`../spec.md`](../spec.md)
- The record sheet's drag fix this reuses: [`../016-sheet-drag-and-audit/goal.md`](../016-sheet-drag-and-audit/goal.md)
- Render-cost freezes, kept separate: [`../028-remaining-freezes/goal.md`](../028-remaining-freezes/goal.md)
