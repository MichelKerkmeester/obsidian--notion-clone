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
    recent_action: "Phase opened from the research agent's six ranked findings"
    next_safe_action: "Fix the orphaned scrim; it is the one users experience as a frozen app"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031"
      parent_session_id: null
    completion_pct: 0
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
| **Status** | **In progress — 2 of 6 criteria.** In the tree: the backdrop no longer outlives its sheet — `src/views/mobile-bottom-sheet.ts` tracks live sheets and drops the backdrop once the last one leaves the document, guarded by a new `sheet-teardown` gate lane that was observed red on three producer families first. Open: the two drag causes, the dead modal handles, velocity dismissal, and the operator seeing the freeze gone |
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

- [ ] A producer-parity check opens and closes **each** sheet family and asserts no scrim and no
      sheet survives. It must **pass for the owned menu and fail for the panel families today** —
      a check that passes everywhere before the fix is not discriminating.
- [ ] The group sheet's handle survives a toggle, and a 120px drag dismisses. Today: handle absent,
      0.0px.
- [ ] `overlayStack.dismissPanel(panel, "programmatic")` returns true for a phone view sheet.
      Today: false.
- [ ] Every sheet that draws a handle has a drag attached, asserted by construction rather than by
      inspection.
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
<!-- /ANCHOR:risks -->

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

## RELATED DOCUMENTS

- Parent spec: [`../spec.md`](../spec.md)
- The record sheet's drag fix this reuses: [`../016-sheet-drag-and-audit/goal.md`](../016-sheet-drag-and-audit/goal.md)
- Render-cost freezes, kept separate: [`../028-remaining-freezes/goal.md`](../028-remaining-freezes/goal.md)
