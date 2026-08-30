---
title: "Goal: The Sheet Drag and the Eight Operator Asks"
description: "What would make phase 016 worth having done, and the criteria that decide it."
trigger_phrases:
  - "016 goal"
  - "sheet drag goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/016-sheet-drag-and-audit"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored; report 1 root-caused, 19 of 22 checks pass, 3 declared"
    next_safe_action: "Operator drags a sheet down after editing a field"
    blockers:
      - "Two operator decisions open: the 13px row label and the window-resize close"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "probe/sheet-audit.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-016-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Row label 13px is off the type scale; move to 14px or accept"
      - "Should the record sheet survive a window resize instead of closing"
    answered_questions:
      - "The drag kept dying: listeners bound to a node the panel's own render destroys"
---
# Goal: The Sheet Drag and the Eight Operator Asks

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The sheet drag is root-caused rather than fixed again, and the whole bottom-sheet
feedback set is audited together on the shipped build with a number for each ask.

This phase owns the program's most-reported defect. Two earlier fixes were correct —
`touch-action: none` on the handle, a full-width band instead of a 36×4px target — and the report
came back both times. The third report was different in kind: *"still barely works … should
guaranteed move down on initial drag."* **"Barely" is the word that mattered.** The gesture was not
dead. It was dying.

**The root cause, and why reading the function could never have found it.**
`attachSheetDragToDismiss` is correct: 1:1 tracking, no movement threshold, a transform on every
move. Two rounds of reading it found nothing because what is wrong is not in it. `applySheetChrome`
prepends the grab bar as a **child of the panel**; `openRecordDetailPanel`'s own `renderContent`
begins `panel.empty()`. Two owners, one child list, and the render wins because it runs last and runs
on **every view re-render** — every metadata resolve, every computed sync, every filter, every sort,
**every single field edit.**

### Decisions

| ID | Decision |
|----|----------|
| D1 | The gesture binds to the panel, not to the bar, and the handle is resolved at pointerdown from the panel's current children. The panel survives every rebuild; the bar does not. |
| D2 | The render re-asserts the chrome it just destroyed. Not redundant with D1: the bar is a visible affordance, and a sheet with a working gesture and nothing to aim at is still broken. |
| D3 | Probes install Obsidian's **shipped** `setCssProps`. The repo's DOM shim is more permissive than the phone, so a check written against it can pass on declarations the device never receives. |
| D4 | Gestures are driven through the browser's real input pipeline. A synthesised `PointerEvent` skips hit-testing and `touch-action` and proves only that the handler is callable. |
| D5 | The grab band is **closed as an accepted shortfall**, not as a pass. The record needs correcting; the decision does not. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] A 60px drag moves the sheet 60.0px both on a fresh sheet and **after a view re-render**. Was
      60.0px fresh and **0.0px** after a re-render, with the grab bar absent from the DOM.
- [ ] Both halves of the fix are shown necessary by reverting each on its own. With the chrome
      re-assert reverted: no bar, 0.0px. With the panel binding reverted: **bar present, still
      0.0px**. That third row is the important one — restoring the bar alone leaves the drag dead
      while making the sheet look repaired.
- [ ] Header actions both 44×44 with centre lines 0.00px apart.
- [ ] Row gap 0px, divider 1px at 40% alpha, value text 16px.
- [ ] The keyboard inset moves the sheet's bottom 844 → 508 on an 844px screen, keeps its top on
      screen at y=275, and returns it to 844.
- [ ] All 9 sheet-capable surfaces at the identical fill. **No before-number was ever recorded for
      this ask**, so what is evidenced is that they agree today, not that they used to disagree.
- [ ] The scrim is `rgba(0,0,0,0.25)` and captures; a press 120px above the sheet resolves to it and
      a press on the band resolves to the grab handle.
- [ ] A `createMenuRow` row measures min-height 44px and padding 8px 16px identically in an
      owned-menu sheet and a panel sheet.
- [ ] The two open operator decisions are answered: the 13px row label, and whether the sheet should
      survive a window resize instead of closing.
- [ ] The operator opens a sheet, edits a field, drags down, and it follows their thumb.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**19 of 22 checks pass; the three that do not are each declared.** No stylesheet edit, so no capture
moves and no lane was taken.

### Two harness facts had to be established before any number here meant anything

Obsidian's real `setCssProps` is `style.setProperty`, which takes hyphenated names only; the repo's
shim assigns `style[name]`, which accepts camelCase. And nothing in this repository had ever driven
the gesture — `verify-placement.mjs` imports `applySheetChrome` and not `attachSheetDragToDismiss`.

### A theory measured and discarded rather than carried

The panel permanently carries a 120ms transform transition, which would produce exactly this symptom.
During the gesture the computed `transition-duration` is `0s` and a 60px move lands at 60.00px in the
same frame. The lag that looked real was the probe's own CDP round trip.

### The three declared, and what kind of thing each is

The row label measures 13px against a 12/14/16/18/20/24 scale — **a one-token operator decision**.
The record sheet **closes outright on a window resize**, which is one of the two ways a software
keyboard announces itself, so which handset the operator holds decides whether the keyboard ask is
finished or blocked. And `placeSheet` writes five camelCase declarations the phone discards;
correcting the names would activate `overscroll-behavior: contain` for the first time on every sheet,
which needs a recapture — **deferred with a reason, not forgotten.**

### The grab band: closed, and the record is what needs correcting

The operator accepted 35px against a 48px ask. This phase measured the shipped band answering presses
over y=1..32 — **32px, full width at 386 of 390** — and derives it from the stylesheet's own
arithmetic. Four heights are now on record. All four clear WCAG 2.5.8's 24px AA target and fall short
of 2.5.5's 44px, which is exactly the trade-off that was accepted, so **none of them changes the
decision.**

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Report 1 root cause | Found, fixed, measured | 60.0px after a re-render, was 0.0px |
| Both halves necessary | Proven by two reverts | The bar-present-still-0.0px row |
| The other seven asks | Audited on the shipped build | 19 of 22 checks |
| Operator confirmation | Open | The five-step list is in `acceptance-criteria.md` §4 |

### Deviations and findings

| Item | Note |
|------|------|
| It worked unspecced for hours | This phase owned the most-reported defect in the program and had no `spec.md` and no `acceptance-criteria.md` at the start of the pass. Both arrived before it finished |
| Ask 6 has no before-number | Recorded rather than counted green |
<!-- /ANCHOR:log -->
