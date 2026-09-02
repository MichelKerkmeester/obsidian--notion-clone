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
    packet_pointer: "005-component-surface-system/015-desktop-dropdown-placement"
    last_updated_at: "2026-09-02T08:00:00Z"
    last_updated_by: "goal-audit"
    recent_action: "Transcription blocker dropped; the arithmetic is exported and called"
    next_safe_action: "Operator opens a desktop dropdown and says whether it is where they expected"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "probe-desktop-placement.mjs"
      - "probe-inventory.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-015-goal"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "What an anchorless open should do; the decision binds all 34 call sites"
      - "column-menu.ts:616 passes the panel to getVisiblePopoverBounds and gets the whole viewport"
      - "Whether AC-4 and AC-5 get the same lift the search clamp did"
    answered_questions:
      - "getPlacementOptions is not a root cause; its only consumer has zero callers"
      - "A private renderer method gets a real check by lifting its arithmetic into an exported function"
      - "A dead-anchor sheet takes its backdrop down with it; hiding the panel alone is the freeze"
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
could it still fail?* AC-4, AC-5 and AC-7 were measured on **transcriptions** — the arithmetic copied
out of a private renderer method into the probe, because the method needs a live Obsidian `App`.
A transcribed check answers a question about the copy. AC-4 was the severe case: its copy passed
`null` where `column-menu.ts:616` passes `panel`, and this folder had already measured that the
shipped argument returns the whole viewport. AC-5 and AC-7 were the milder case: their copies matched
their sources, verified by reading both, but neither could go red if its source lost the clamp.

**All three ticks are restored, and the withdrawal is what earned the repairs.** Each was settled by
removing the reason a transcription existed rather than by arguing the copy was faithful — checked
against `src/` on 2026-09-02 by opening the files:

| Was transcribed | Now exported and called | Read by the harness |
|---|---|---|
| AC-4, the anchorless submenu | `anchorlessSubmenuPlacement`, `popover-position.ts:468`, called at `column-menu.ts:621` | imported from `src/views/popover-position` at `verify-placement.mjs:110` |
| AC-5, the formula clamp | `clampSuggestionLeft` (`formula-modal.ts:159`, called `:1388`) and `suppressesInlineSuggestions` (`:171`, called `:1401`) | `formula-suggestion-placement.test.ts` imports both |
| AC-7, the search clamp | `calendarSearchResultsPlacement`, `popover-position.ts:437`, called at `database-view.ts:7023` and `embedded-database-renderer.ts:1329` | imported at `verify-placement.mjs:110`; `calendar-search-placement.test.ts` covers 8 cases |

And AC-4's severe case is fixed **at the source**, not routed around: `getVisiblePopoverBounds` now
ignores an unlaid-out container's empty rect rather than intersecting it
(`popover-position.ts:640-642`), so `column-menu.ts:616` may keep passing `panel` — which it does —
without collapsing into the degenerate guard at `:654`. The blocker this frontmatter carried, *"AC-4
and AC-5 still transcribe arithmetic from private renderer methods"*, is false on disk and is
dropped.

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
- [x] The formula autocomplete stays inside its field. Was a 169px overhang, and the pre-fix
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

      **Settled, by removing the reason a transcription was needed at all.** The clamp and the
      suppression threshold were inline expressions inside private methods on a modal that needs a
      live `App`, which is *why* every check of them was a copy. They are now exported functions —
      `clampSuggestionLeft` and `suppressesInlineSuggestions` — and the modal calls them, so a check
      that imports them is driving the shipped arithmetic rather than a restatement of it.
      **The cost this row named is gone, and that is provable:** deleting the clamp from the shipped
      function turns the tests red (`pulls the box back when the caret would push its right edge past
      the field`, `never returns a negative left`). The transcribed version could not do that, which
      was the entire complaint.
      Six cases cover both: the 170px overhang pulled back to land exactly on the container edge, a
      box that already fits left alone, a box wider than its field clamped to 0 rather than negative,
      the 760px boundary asserted on both sides, the phone suppressed whatever its width, and an
      unmeasured modal treated as allowed rather than as narrow.
      *What still needs a device:* the modal's real width comes from Obsidian's `app.css`, which is
      not loaded here. These fix the arithmetic's ownership; the host still supplies its input.
- [x] The phone does not move: identical before and after, because every change sits in a
      desktop-only branch. **Two of three repairs met it as stated. The third did not, and rather
      than restating the criterion the phone behaviour it changed was decided, implemented and
      checked — 2026-08-31.**

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

      **The decision, taken rather than left to the operator.** On a phone the surface carries a
      body-level backdrop, so hiding the panel alone leaves a full-screen scrim swallowing every tap
      with nothing visible above it — the freeze symptom, arrived at by a guard whose whole purpose
      was to be conservative. The reversible default is that **the chrome comes down with the
      surface**: `applySheetChrome(panel, false)` beside the `visibility: hidden`. The panel node is
      still only hidden, so this decides that an unreachable sheet stops blocking the app and not
      that the owner's surface is destroyed behind its back — the narrower of the two answers the
      earlier note offered, and it is undone by deleting one line.

      **The phone arm of the lifetime pair now exists, on the phone page at 390×844.** A sheet is
      placed against a live anchor through `positionToolbarPopover`, the anchor is destroyed, the
      reposition loop is allowed to tick, and the surface AND the backdrop are both read:
      → *PHONE a sheet whose anchor was destroyed stops presenting AND takes its backdrop with it*:
      `opened as a sheet=true with 1 backdrop(s); after the anchor was destroyed and the loop ran,
      visibility=hidden and 0 backdrop(s) remain`.
      → *PHONE CONTROL a sheet with a live anchor keeps its backdrop and stays on the floor*:
      `visibility=visible, 1 backdrop(s), sheet bottom 844 of 844`.

      **Both halves watched failing, on the two different lies each is there to catch.** With the
      chrome left standing the first goes red at `visibility=hidden and 1 backdrop(s) remain` while
      the control stays green — the scrim trap, isolated. With the guard fired unconditionally, so
      the positioner hides every sheet, **both** go red: `opened as a sheet=false with 0
      backdrop(s)` and `visibility=hidden, 0 backdrop(s), sheet bottom 1026 of 844`. That second
      control is the one the earlier note asked for by name, because without it a positioner that
      hides everything satisfies the first check.

      **The reason clause is now true as written for all three repairs**, because the third no
      longer changes phone behaviour silently: it changes it deliberately, and a check on the phone
      page holds it there.
- [x] The declared red is closed: the search-results panel clamps against the editing area rather
      than `window.innerWidth`. **The tick is restored 2026-08-31, on the fix this criterion named.** Was **panel [900..1380] against an editing area ending at 1140,
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
      check that can no longer fail. Re-run 2026-08-31 with the clamp lifted and the phone arm added:
      `verify-placement` is **242/243, 1 declared red, exit 0**; `probe-desktop-placement` is
      **31/31 with `DECLARED_RED` empty, exit 0**.

      **The tick was withdrawn because neither harness could fail when the source regressed.** Both
      transcribed the arithmetic instead of calling the method, and this folder proved the
      consequence in both directions: reverting the *transcription* turned the run to exit 1, while
      reverting the *source* left it at exit 0. A criterion that cannot go red when the code it names
      regresses is evidence about the harness rather than about the panel.

      **The named fix was taken: the clamp is lifted into one exported function both renderers
      call.** `calendarSearchResultsPlacement(anchor, bounds)` in `src/views/popover-position.ts`
      takes its bounds as a parameter rather than calling for them, so it stays pure and drivable;
      both callers pass `getVisiblePopoverBounds(null)` exactly as before. The two byte-identical
      private copies are gone — not to remove duplication, which was never the problem, but because
      a private member on a renderer that needs a live `App` cannot be reached by any check.

      **Both harnesses now call it, and both now go red when the source regresses.** With
      `calendarSearchResultsPlacement` reverted to `window.innerWidth`, `verify-placement` reports
      `panel=[900..1380]` at x=600 and `[952..1432]` at x=1000 and exits 1, and
      `probe-desktop-placement` reports the same two figures and exits 1 — the exact overhangs this
      criterion recorded, 240px and 292px. That is the observation the withdrawal said did not exist.

      **A second lie was found in the same check and repaired.** Its detail line asserted "clamped
      against `bounds.right` rather than the window" as fixed prose, and printed that sentence
      unchanged while the reverted source placed the panel 292px under the sidebar. It now reports
      what it measured. A detail line that describes intended behaviour rather than observed
      behaviour is a second way for a check to lie about its own failure, and it is worth naming
      because it survives every review that reads the assertion and not the message.

      **The cases the browser check does not reach are covered by unit tests on the same function.**
      `src/views/calendar-search-placement.test.ts` — 8 cases. The browser check measures only the
      right edge against the sidebar, so the **left floor** (`bounds.left + 8`, not `8`, the half
      that only shows with a left sidebar open) and both ends of the width clamp had no coverage at
      all. Watched failing: reverting the left floor to `8` gives `expected 8 to be 308`.

      **Still transcribed, and named rather than absorbed:** the AC-4 and AC-5 arithmetic
      (`column-menu.ts`'s anchorless submenu fallback among them) is still copied into both
      harnesses for the same reason this was. It fails for one reason and would be retired by the
      same move. It is not folded into this criterion, which is about the search-results clamp.
- [ ] The operator opens any desktop dropdown and it is where they expected it.

      Operator-confirmed is the only state that closes this, per D3. No harness can answer it, and
      31 of 31 probe checks is not a substitute for it.
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

**Fixed after all, and the record above is kept because the prediction in it was exactly right.**
Confirmed on disk 2026-09-02. The owed check was built — `getVisiblePopoverBounds` is called with a
freshly created, not-yet-laid-out panel alongside the same call with `null`, and the two must agree —
and it was **observed red first** at `(panel).right=1440` against `(null).right=1140`. The repair is
at the source: an empty rect is missing information rather than a constraint of zero width, so it is
ignored rather than intersected (`src/views/popover-position.ts:640-642`, comment and all). The
call site is unchanged and still passes `panel` (`column-menu.ts:616`), which is what the popped-out
window case needs. So the sentence *"the anchorless-submenu fix may not work in the shipped build,
and its check cannot see that"* was true when written and is false now, in both halves.
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
| ~~`column-menu.ts:616` passes the panel and gets the whole viewport~~ **Fixed at the source** | The finding was right and is kept: `getVisiblePopoverBounds` intersected the container's own rect, so a body-portalled fixed panel that had not laid out tripped the degenerate guard and got `[0..1440]` — the very bound the repair was removing, measured at `bounds(sub)=[0..1440]` for a 292px five-row submenu. **Resolved 2026-09-02, verified by reading `src/`:** an empty rect is ignored rather than intersected (`popover-position.ts:640-642`), the call site still passes `panel` (`:616`), and the two-argument agreement check that found it was watched red at `(panel).right=1440` before it went green at 1140 |
| ~~Both harnesses transcribe rather than call~~ **Retired by lifting the arithmetic** | The finding is the reason the lift happened and is kept: reverting the *transcription* turned the run to exit 1 while reverting the *source* left it at exit 0, so a source-only regression was invisible to the gate. **Resolved 2026-09-02:** `verify-placement.mjs:110` imports `calendarSearchResultsPlacement` and `anchorlessSubmenuPlacement` from `src/views/popover-position` and calls them, and the formula pair is exported from `formula-modal.ts` and called by the modal itself. Deleting a clamp from a shipped function now turns its unit tests red, which is the observation the withdrawal said did not exist |
<!-- /ANCHOR:log -->
