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
    last_updated_at: "2026-08-31T09:00:00Z"
    last_updated_by: "harness-dependence-review"
    recent_action: "AC-4 settled: the shipped argument returned the whole viewport, and now does not"
    next_safe_action: "AC-5 and AC-7 need their shipped methods driven, not their arithmetic copied"
    blockers:
      - "AC-4 reads green on a transcription passing null where the source passes panel"
      - "npm run gate is 15 green, screenshots-fresh red, from four captures this repair staled"
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
    completion_pct: 50
    open_questions:
      - "What an anchorless open should do; the decision binds all 34 call sites"
      - "column-menu.ts:616 passes the panel to getVisiblePopoverBounds and gets the whole viewport"
      - "How a private renderer method gets a check that calls it rather than copying it"
    answered_questions:
      - "getPlacementOptions is not a root cause; its only consumer has zero callers"
      - "The clamp takes null, not a container: a container narrows a panel portalled to escape it"
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
paths**, and the defects cluster on the four that are not the maintained one. All six defects are now
repaired. A fix aimed at
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

**Three ticks were withdrawn on review, and the question that took them is not "is it green".** It
is: *if this value came from the device instead of the harness, would the check still pass — and
could it still fail?* AC-4, AC-5 and AC-7 are measured on **transcriptions** — the arithmetic copied
out of a private renderer method into the probe, because the method needs a live Obsidian `App`.
A transcribed check answers a question about the copy. AC-4 is the severe case: its copy passes
`null` where `column-menu.ts:616` passes `panel`, and this folder has already measured that the
shipped argument returns the whole viewport. AC-5 and AC-7 are the milder case: their copies match
their sources today, verified by reading both, but neither can go red if its source loses the clamp.

**AC-1, AC-2 and AC-3 survive the same question and are the phase's real result.** Each drives a
shipped module — `createOwnedMenu`, `positionToolbarPopover`, the reposition loop — through the
browser, with every input measured rather than assumed: AC-2 reads the trigger's own
`getBoundingClientRect` rather than a declared height, so a device trigger of a different size flows
through the arithmetic instead of past it. Their bounds come from `.workspace-split.mod-root`, which
the harness builds by hand, but that selector is the one the shipped `getVisiblePopoverBounds` looks
for and the relationship under test — capped, clear of the trigger, hidden when the anchor dies —
fails on this harness when the repair is removed. Those three can fail for the right reason.

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

      **Tick withdrawn: the transcription does not say what the source says, at the one argument
      that decides the answer.** `probe-desktop-placement.mjs:637` and its `verify-placement` twin
      clamp against `P.getVisiblePopoverBounds(null)`. `column-menu.ts:616` calls
      `getVisiblePopoverBounds(panel)`. `null` yields the editing area `[300..1140]` and the check
      reads green; `panel` intersects the surface's own rect, and a body-portalled fixed panel that
      has not laid out trips the degenerate guard at `popover-position.ts:515` and returns the
      **whole viewport**. This folder already measured that: `bounds(sub)` for a 292px five-row
      submenu returns `[0..1440]` — the exact bound the repair existed to remove. So this is not a
      check blind to some future regression. It is a check reading green over a defect this folder
      has already measured in the shipped path, which is the strongest form of the transcription
      cost recorded under AC-7.

      **Settled, by the second route this row named — and it found the defect rather than clearing
      it.** A check now calls `getVisiblePopoverBounds` with a freshly created, not-yet-laid-out
      panel, alongside the same call with `null`, and requires them to agree. Observed **red first**:
      `(panel).right=1440` against `(null).right=1140` on a 1440 viewport. The prediction in this row
      was exactly right — the shipped argument returned the whole viewport, so the submenu was
      clamped 300px past the editing area and could sit under an open right sidebar.
      **Fixed at the source rather than in the check.** A container that has not laid out reports a
      zero rect, and intersecting that collapses the range into the degenerate guard at
      `popover-position.ts`. An empty rect is missing information, not a constraint of zero width, so
      it is now ignored rather than intersected. `(panel).right` returns 1140.
      Both arguments are asserted in one case deliberately: `null` alone cannot fail this way, so on
      its own it would be evidence about the wrong call — which is the transcription cost this row
      was withdrawn for.
- [ ] The formula autocomplete stays inside its field. Was a 169px overhang, and the pre-fix
      statement re-run in place still overhangs 169px.
      `HAND the formula autocomplete stays inside its modal` — **suggest [830..1100] inside a modal
      [300..1100], overhang 0px**, with the caret at x=700 of an 800px modal. `HAND CONTROL the
      unclamped formula autocomplete overhangs, so the check can distinguish` — **unclamped right
      1270, overhang 170px, against a clamped right of 1100**. The control prints **170px** where
      this folder recorded 169px; the run is the measurement, and the 1px is carried here rather
      than reconciled away.

      **Tick withdrawn: the clamp is transcribed, so the check cannot fail when the source loses
      it.** `probe-desktop-placement.mjs:668` reproduces `showSuggestionBox`'s statement rather than
      calling it — the method is private on a modal that needs a live `App`. Unlike AC-4 the copy
      **does** match the source today: `formula-modal.ts:1357-1358` reads
      `propertySuggestEl.parentElement?.clientWidth ?? textarea.clientWidth`, and the probe's
      `suggest` is a direct child of its modal, so `modal.clientWidth` is the same quantity. Checked,
      not assumed. What the check cannot do is notice the clamp being deleted from
      `formula-modal.ts`: the probe would still place its own copy correctly and still report 0px.
      That is the AC-7 cost, not the AC-4 one, and the difference is worth keeping — the arithmetic
      is right, its ownership is unproven.

      **Two host values also come from the harness rather than the product.** The modal is a
      hand-built div pinned at `width: 800px`; the real modal's width comes from Obsidian's
      `app.css`, which is not loaded. And `shouldDisableInlineSuggestions()` returns early below
      760px, a threshold the probe never crosses in either direction.

      **What would settle it:** drive the shipped `showSuggestionBox` against a modal sized the way
      the host sizes it, and assert both the clamp and the 760px suppression.
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
      than `window.innerWidth`. Was **panel [900..1380] against an editing area ending at 1140,
      window.innerWidth 1440** — 240px under the sidebar at anchor x=600, and **1432, a 292px
      overhang**, at x=1000.
      `HAND calendar/timeline search results clear the right sidebar` — **[652..1132] at x=600 and
      [652..1132] at x=1000, against an editing area ending at 1140**, clamped against
      `bounds.right=1140`. Both anchors now land identically, which is the point: the clamp decides
      the right edge, not the anchor. `HAND CONTROL the search-results overhang grows with the
      anchor, so the clamp is the cause` — the replaced statement, re-run in place, still puts the
      right edge at **1380 (240px past)** at x=600 and **1432 (292px)** at x=1000.

      **Two anchor positions, because one cannot distinguish a clamp from a coincidence.** The
      overhang grew with the anchor, so a panel that happens to fit at one x could still run under
      the sidebar at another and pass a single-position check.

      **Both copies moved together**, in `src/views/database-view.ts:6953` and
      `src/views/embedded-database-renderer.ts:1323` — byte-identical before the edit and after it.
      All four window-relative terms moved to `getVisiblePopoverBounds(null)`: the width cap, the
      left floor `8` (a *window*-relative margin that would have permitted x=8, under the **left**
      sidebar), the right clamp, and the vertical `innerHeight - 80`. `null` rather than a
      container was measured, not assumed — `bounds(null)` and `bounds(container)` are both
      `[300..1140]`, `bounds(anchor)` collapses to `[900..1100]`, and `bounds(panel)` returns the
      **whole viewport** because a rect intersected with itself trips the degenerate guard. The panel
      is created on `window.activeDocument.body` to escape the view, so a container would narrow it.

      **The declaration is gone from both harnesses**, since a declared red that has been fixed is a
      check that can no longer fail. `verify-placement` is **221/224, 3 declared red, exit 0**, down
      from four; `probe-desktop-placement` is **31/31 with `DECLARED_RED` empty, exit 0**.

      **Tick withdrawn, on this folder's own finding rather than a new one.** Both harnesses
      transcribe the arithmetic instead of calling the method, and this folder proved the
      consequence in both directions: reverting the *transcription* to `window.innerWidth` turns the
      run to exit 1, but reverting the *source* while leaving the transcription fixed leaves it at
      exit 0. A criterion that cannot go red when the code it names regresses is evidence about the
      harness, so the tick does not hold — even though the edit behind it is confirmed. What **is**
      confirmed, by reading rather than by running: `database-view.ts:6953` and
      `embedded-database-renderer.ts:1323` both carry the repaired form and are byte-identical to
      each other. The clamp was made; nothing in the gate keeps it made.

      **What would settle it:** any check that reaches the real method. Both copies are private
      members needing a live `App`, so the honest routes are a shimmed host object or lifting the
      clamp into an exported function the harness can import — the same move that would retire the
      AC-4 and AC-5 transcriptions with it, since all three fail for one reason.
- [ ] The operator opens any desktop dropdown and it is where they expected it.

      Operator-confirmed is the only state that closes this, per D3. No harness can answer it, and
      30 of 31 probe checks is not a substitute for it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->

### A shipped fix in a sibling phase may not work, and its check cannot tell

Found while repairing this phase's sixth defect, in code this phase does not own.

The anchorless-submenu repair calls `getVisiblePopoverBounds(panel)` — passing the surface
being positioned, with a comment justifying it as deriving the document for a popped-out
window. That reason is sound. The side effect is not: the function intersects the container's
own rect into its result, and ends with `if (right <= left || bottom <= top) return viewport`.

A panel that has not been laid out has a zero-width rect. `right` collapses toward 0 while
`left` is held at the editing area's left edge, the guard trips, and the function returns the
**whole viewport** — precisely the bound that repair existed to remove. The line immediately
after the call reads `panel.getBoundingClientRect().height || 320`, and that fallback is there
because the author knew the panel may not have laid out yet. If the height can be zero, so can
the width.

**Its check cannot see this.** Both harnesses transcribe the arithmetic with `null` rather than
calling the method, which is private and needs a live host object. `null` yields the editing
area, so the check passes on a transcription the shipped code does not perform.

Recorded rather than fixed: it is outside this phase, and the same transcription limit means a
fix here could not be proven either. What is owed is a check that drives the real method, and
before that a shimmed probe measuring the bounds for a freshly created panel — an unshimmed one
throws in the element guard, which is its own finding about that guard.
## 3. LOG

Volatile. Not part of the directive.

**All six defects fixed. 31 of 31 probe checks pass, none declared red.** Took no stylesheet lane —
every repair is JavaScript.

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
| The sixth | Shipped, verified | AC-7. 1380/1432 → 1132 at both anchors; both copies moved together |
| Four captures | Owed | `chrome-selection-status-bar` names `embedded-database-renderer.ts` as a source |
| Inventory closure assertion | Built | 16 coordinate writes across 7 files, all classified |
| Recapture | Declined with reasons, not deferred | 276 captures were already stale at HEAD |

### Deviations and findings

| Item | Note |
|------|------|
| `showAt` passes `undefined` for the fixed containing block | A numeric no-op today because body sits at the origin. Recorded because it stops being one the day body gains a margin |
| The recapture reason was over-broad | It read "the harness executes no `src/` code"; scoped to the screenshot harness, since `verify-placement` bundles fifteen shipped modules including the two this phase edited |
| "Every change sits in a desktop-only branch" was over-broad too | True of `owned-menu.ts:168`, false of the dead-anchor guard at `popover-position.ts:182`, which precedes the `mobileSheet` branch and so reaches a phone sheet |
| The clamp repair is phone-visible too, and was measured | `getVisiblePopoverBounds` subtracts the mobile navbar and safe-area inset from `bottom`, and nothing gates this panel to desktop — `isDesktopOnly` is false and the render path has no `is-phone` branch. On a 390×844 phone with a 72px navbar and a 34px inset, `bounds` ends at 738 rather than 844, so the vertical cap moves **up 76px** — but only when the anchor sits low enough to bind: with `anchor.bottom=728` the top goes 734 → 658, while a high anchor at `bottom=128` is unchanged at 134. Width and left are identical on a phone, since there are no sidebars and `bounds.left + 8` is the old literal `8`. The direction is right — it stops the panel being placed under the navbar — but it is a phone-visible change out of a desktop phase, and no phone check covers it |
| The line numbers this folder recorded were stale in three places | `database-view.ts:6890` and `embedded-database-renderer.ts:1305` named the **callers**, not the method, and were ~60 lines out; the method is at `:6953` and `:1323`. `filter-panel-renderer.ts:532` named nothing — the draft commit that destroys the trigger is `commitDraftValue` at `:624`, refreshing at `:637`. All three corrected. `owned-menu.ts:168` and `popover-position.ts:182`/`:200`/`:491` were checked and are right |
| `column-menu.ts:616` passes the panel and gets the whole viewport | Out of this work's scope, reported not fixed. The AC-4 repair calls `getVisiblePopoverBounds(panel)`, but that function intersects the container's own rect into its result, so a body-portalled fixed panel trips the degenerate guard and gets `[0..1440]` — the full viewport, the very bound the repair was removing. Measured on the harness page: `bounds(sub)` for a 292px submenu with five rows returns `[0..1440]`. AC-4 reads green only because **both harnesses transcribe it with `null`**, which the source does not do. So the anchorless-submenu fix may not work in the shipped build, and its check cannot see that |
| Both harnesses transcribe rather than call | Verified in both directions. Reverting the transcription to `window.innerWidth` turns the check red and the run to exit 1, so it is not decoration. Reverting the **source** while leaving the transcription fixed leaves the run at exit 0 — a source-only regression is invisible to the gate. The transcription carries its file and line for exactly this reason |
<!-- /ANCHOR:log -->
