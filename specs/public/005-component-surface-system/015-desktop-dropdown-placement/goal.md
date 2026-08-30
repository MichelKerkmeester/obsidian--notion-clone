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
    last_updated_at: "2026-08-30T21:15:00Z"
    last_updated_by: "criteria-adjudication"
    recent_action: "Criteria adjudicated against the captured run; 5 ticked, the sixth stays red"
    next_safe_action: "Fix the clamp in both host files; add a phone arm to the lifetime check"
    blockers:
      - "The sixth defect is duplicated in two files held by another session"
      - "The dead-anchor guard is not desktop-only; no phone arm covers it"
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

Ticked criteria carry the check name and the number from the captured `verify-placement` run taken
from a clean tree at `f64dd87` — `220/224 geometry checks passed, 4 red for a declared reason`,
exit 0. Unticked criteria carry the check that would settle them, written to be implementable from
the sentence alone.

- [x] A tall menu is capped and every row is reachable after scrolling. Was 1808px tall, 912px past
      the bounds, last row at y=1778 off screen. A 5-row menu overflows by −702px under the same
      call, so the check distinguishes a tall menu from any menu.
      `B a tall owned menu is capped inside the editing area` — **892px tall, running −4px past the
      editing area's bottom edge (menu.bottom 896 against bounds.bottom 900), max-height 892px,
      overflow-y auto**. `B every row of a tall owned menu is reachable` — **after scrolling to the
      end at scrollTop 916, the last row sits at y=862..892 against an editing area ending at 900**,
      scrollHeight 1808 against clientHeight 892. `CONTROL a short owned menu does not overflow, so
      the cap check can distinguish` — **−702px against the tall menu's −4px**.
- [x] An anchor-derived menu that flips up clears its trigger: 0 overlap, +4px gap. Was covering 28px
      of a 28px trigger with the gap at −32px — a 36px error, exactly the trigger's height plus both
      gaps. The cursor form still lands at 812.
      `C an anchor-derived owned menu that flips up clears its trigger` — **trigger [780..808], menu
      [408..776], flipped=true, covering 0px of the trigger**. `C an anchor-derived owned menu keeps
      its gap on the side it flipped to` — **gap above trigger 4px**. `C CONTROL the cursor form
      still flips to meet the point, unchanged` — **opened at y=812, menu bottom 812**, which is the
      36px the anchor form now lands higher.
- [x] A surface whose anchor dies goes `visibility: hidden` on the next loop tick. Was moving 0px,
      staying connected and staying visible. A live anchor survives the same loop, or the criterion
      would be satisfied by a positioner that hides everything.
      `LIFETIME a surface whose anchor was destroyed stops presenting as placed` — **visibility
      before=visible, after=hidden, with panel.top unchanged at 134** across the loop tick. `LIFETIME
      CONTROL a surface with a live anchor survives the same loop and stays placed` — **visibility
      visible, panel.top 234 against anchor.bottom 228, gap 6px**.
- [x] The anchorless column submenu clears the right sidebar: `panel.right ≤ editing area right`. Was
      1328 against 1140.
      `HAND the anchorless column submenu clears the right sidebar` — **submenu [840..1080] against
      an editing area ending at 1140**, clamped against `bounds.right=1140` rather than
      `view.innerWidth=1440`, which is what used to place it 188px under the sidebar.
- [x] The formula autocomplete stays inside its field. Was a 169px overhang, and the pre-fix
      statement re-run in place still overhangs 169px.
      `HAND the formula autocomplete stays inside its modal` — **suggest [830..1100] inside a modal
      [300..1100], overhang 0px**, with the caret at x=700 of an 800px modal. `HAND CONTROL the
      unclamped formula autocomplete overhangs, so the check can distinguish` — **unclamped right
      1270, overhang 170px, against a clamped right of 1100**. The control prints **170px** where
      this folder recorded 169px; the run is the measurement, and the 1px is carried here rather
      than reconciled away.
- [ ] The phone does not move: identical before and after, because every change sits in a
      desktop-only branch.

      **The after-state holds; the stated reason does not, for one of the edits.** Both phone checks
      pass: `PHONE an owned menu still presents as a full-width bottom sheet` — **menu [0..390] on a
      390×844 viewport, bottom 844, position fixed, max-height 759.6px** — and `PHONE the sheet is
      capped and scrolls rather than growing past the screen` — **height 389 against a 760 cap,
      overflow-y auto**. Those are the figures this folder already recorded, so nothing measured has
      moved.

      The reason is sound for two of the three repairs and wrong for the third. In `owned-menu.ts`
      the cap, the clamp and the anchor flip all sit inside the `else` arm of
      `if (isMobileBottomSheet(doc))` at `src/views/owned-menu.ts:168`, so a phone genuinely cannot
      reach them. But the dead-anchor guard is at `src/views/popover-position.ts:182-186`, **before**
      the `if (mobileSheet)` branch at `:200`, and `positionToolbarPopover` computes `mobileSheet`
      for phone surfaces too. So a phone sheet whose anchor is destroyed now goes
      `visibility: hidden` where it previously stayed painted. That is a phone-visible behaviour
      change from this phase, and no check exercises it on a phone.

      **The check that would settle it:** a phone arm of the lifetime pair at 390×844 — place a sheet
      against a live anchor through `positionToolbarPopover`, destroy the anchor, let the reposition
      loop tick, and assert what a phone should do. Deciding that is the substance of the check, not
      a detail of it: on a phone the surface carries a scrim, so hiding the sheet alone leaves the
      scrim taking every tap with nothing visible above it. Assert either that the scrim goes with
      the sheet or that the surface closes outright, and assert the paired live-anchor control on
      the same page, or the check is satisfied by a positioner that hides every sheet.
- [ ] The declared red is closed: the search-results panel clamps against the editing area rather
      than `window.innerWidth`. Measured unfixed at 1380 against 1140, growing to 292px as the anchor
      moves right.

      **Still declared, and it is one of the captured run's four.** `RED (declared) HAND
      calendar/timeline search results clear the right sidebar` — **panel [900..1380] against an
      editing area ending at 1140, window.innerWidth 1440**. Its cause is confirmed by its own
      control, `HAND CONTROL the search-results overhang grows with the anchor, so the clamp is the
      cause` — **240px of overhang with the anchor at x=600, 292px at x=1000**.

      **This is a declared red, not a failing check.** The check exists, reports by name, and is why
      the run's exit status is still 0 and still meaningful. Counting it as a failure misreads the
      run; ticking it claims a repair nobody has made.

      **What is missing is the repair, not a check.** The clamp is duplicated verbatim in
      `src/views/database-view.ts:6955-6957` and `src/views/embedded-database-renderer.ts:1325-1327`
      — both in `positionCalendarTimelineSearchResultsPanel`, and both later in their files than the
      `:6890` / `:1305` this folder records. Replace `window.innerWidth` with
      `getVisiblePopoverBounds` in both copies; the vertical term `window.innerHeight - 80` on the
      next line has the same defect and should move with it. Then require **`panel.right ≤ 1140`
      with the anchor at x=600 and again at x=1000**, since a single anchor position cannot
      distinguish a clamp from a coincidence, and drop the declaration so the next regression fails
      the run instead of being expected. The two copies must move together: repairing one leaves the
      other reporting the same 1380.
- [ ] The operator opens any desktop dropdown and it is where they expected it.

      Operator-confirmed is the only state that closes this, per D3. No harness can answer it, and
      30 of 31 probe checks is not a substitute for it.
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
| "Every change sits in a desktop-only branch" was over-broad too | True of `owned-menu.ts:168`, false of the dead-anchor guard at `popover-position.ts:182`, which precedes the `mobileSheet` branch and so reaches a phone sheet |
<!-- /ANCHOR:log -->
