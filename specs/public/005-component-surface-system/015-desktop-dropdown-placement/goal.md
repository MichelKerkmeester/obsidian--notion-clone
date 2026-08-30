---
title: "Goal: Desktop Dropdown Placement"
description: "What would make phase 015 worth having done, and the criteria that decide it."
trigger_phrases:
  - "015 goal"
  - "desktop dropdown placement goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/015-desktop-dropdown-placement"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored; 30 of 31 probe checks pass, the sixth declared red by name"
    next_safe_action: "Fix the search-results clamp when both host files are free"
    blockers:
      - "The sixth defect is duplicated in two files held by another session"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "probe-desktop-placement.mjs"
      - "probe-inventory.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-015-goal"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "What an anchorless open should do; the decision binds all 34 call sites"
    answered_questions:
      - "getPlacementOptions is not a root cause; its only consumer has zero callers"
---
# Goal: Desktop Dropdown Placement

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A dropdown opened on desktop lands inside the visible editing area, clears its own
trigger, caps its height so every row is reachable, and stops presenting as placed once its anchor is
gone.

Before this phase a 60-row menu ran 912px past the editing area with its last rows unreachable, an
anchor-derived menu covered its trigger entirely, and a panel whose anchor had been destroyed kept
painting at the dead anchor's last coordinate, still focusable and still accepting input.

**The finding is that this is not one mechanism with bugs in it.** It is **five independent placement
paths**, and the defects cluster on the four that are not the maintained one. A fix aimed at
`positionToolbarPopover` would have found nothing: path A is correct on every check.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Completeness is a property of the extractor. `probe-inventory.mjs` enumerates the four primitives that place a box, then asserts **no other code in `src/` writes a placement coordinate**. A sixth mechanism added later turns that assertion red instead of going unnoticed. |
| D2 | The probe's leaf sits **off** the viewport origin. At the origin, leaf-relative and viewport-relative coordinates coincide and the offset under test is zero by construction. Two earlier phases were caught by exactly this. |
| D3 | The cursor form of `showAt` is unchanged and still correct. Only the anchor form learns the trigger's height, which is the information the call sites had and threw away. |
| D4 | The sixth defect is **declared red by name**, not left silent, so the exit status stays meaningful and the next real regression still fails the run. |
| D5 | "The harness executes no `src/` code" is true of `tools/screenshots/` and of nothing else. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] A tall menu is capped and every row is reachable after scrolling. Was 1808px tall, 912px past
      the bounds, last row at y=1778 off screen. A 5-row menu overflows by −702px under the same
      call, so the check distinguishes a tall menu from any menu.
- [ ] An anchor-derived menu that flips up clears its trigger: 0 overlap, +4px gap. Was covering 28px
      of a 28px trigger with the gap at −32px — a 36px error, exactly the trigger's height plus both
      gaps. The cursor form still lands at 812.
- [ ] A surface whose anchor dies goes `visibility: hidden` on the next loop tick. Was moving 0px,
      staying connected and staying visible. A live anchor survives the same loop, or the criterion
      would be satisfied by a positioner that hides everything.
- [ ] The anchorless column submenu clears the right sidebar: `panel.right ≤ editing area right`. Was
      1328 against 1140.
- [ ] The formula autocomplete stays inside its field. Was a 169px overhang, and the pre-fix
      statement re-run in place still overhangs 169px.
- [ ] The phone does not move: identical before and after, because every change sits in a
      desktop-only branch.
- [ ] The declared red is closed: the search-results panel clamps against the editing area rather
      than `window.innerWidth`. Measured unfixed at 1380 against 1140, growing to 292px as the anchor
      moves right.
- [ ] The operator opens any desktop dropdown and it is where they expected it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Five of six defects fixed; the sixth measured and declared. 30 of 31 probe checks pass.** Took no
stylesheet lane — every repair is JavaScript.

### The guard that makes every other number mean something

The page puts a 300px left sidebar before the root split and asserts `leaf.left >= 200`. Measured
`leaf.left=300px`. Without it, every offset under test is zero by construction.

### A check that had to be thrown away, recorded because the shape is tempting again

The obvious height check — `scrollHeight <= clientHeight || overflow is auto` — **passes on the
broken menu**, because an uncapped element grows to fit and its `scrollHeight` equals its
`clientHeight` by definition. It was written, observed green against the defect, and replaced with a
hit-position measurement.

### A simulation that had to be corrected

The first anchor-death check re-called `positionToolbarPopover` with a dead anchor. That hits the
**entry guard**, which returns before `place()` runs, so the fix under test never executed and the
check reported a failure the running app does not have. The real sequence is: place against a live
anchor, destroy the anchor, let the loop tick. Only the loop can observe it.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Five defects | Shipped, verified | AC-1 to AC-5, each with a failing number and a control |
| The sixth | Measured, declared red | Duplicated in two files held by another session |
| Inventory closure assertion | Built | 16 coordinate writes across 7 files, all classified |
| Recapture | Declined with reasons, not deferred | 276 captures were already stale at HEAD |

### Deviations and findings

| Item | Note |
|------|------|
| `showAt` passes `undefined` for the fixed containing block | A numeric no-op today because body sits at the origin. Recorded because it stops being one the day body gains a margin |
| The recapture reason was over-broad | It read "the harness executes no `src/` code"; scoped to the screenshot harness, since `verify-placement` bundles fifteen shipped modules including the two this phase edited |
<!-- /ANCHOR:log -->
