---
title: "Implementation Summary: Sheet Lifecycle Ownership"
description: "The backdrop leak, the group sheet's vanishing grab bar, the portalled view sheet, the dead handles and flick dismissal are all fixed and gated; five of six criteria are met and the operator's device pass is the sixth."
trigger_phrases:
  - "031 implementation summary"
  - "sheet teardown shipped"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-09-05T06:40:00Z"
    last_updated_by: "reports-34-36-fourth-pass-second-landing"
    recent_action: "A press inside a portalled sheet is no longer read as outside"
    next_safe_action: "The operator taps Add sort and Add condition on the phone against a build carrying the fix"
    blockers:
      - "Nothing here is confirmed on the operator's device"
    key_files:
      - "goal.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-impl"
      parent_session_id: null
    completion_pct: 83
    open_questions:
      - "Does a returned disposer still earn its place now the watcher makes callers correct?"
    answered_questions:
      - "The watcher closes the defect without changing any producer"
      - "The entrance is keyed to the node, so a rebuild replays it; only the owner can tell a rebuild from an opening"
      - "A sheet still on the body is an open sheet; holding the backdrop for it is correct"
      - "The long press consumed nothing; it now swallows the click it caused"
      - "The backdrop never wins the hit test; elementFromPoint returns the control in both engines"
      - "The views carry a second dismissal path the overlay stack knows nothing about, and no lane had ever installed it"
      - "Of the three call sites that read alike, two are defects and the wheel one is unreachable from a sheet"
---
# Implementation Summary: Sheet Lifecycle Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 031-sheet-lifecycle-ownership |
| **Level** | 2 |
| **Status** | In progress — 6 of 8 criteria met. Everything implementable is in; the three open rows need the operator's device |
| **State** | Committed; gate 18 green, exit 0 **at the time — a past run**. Not device-confirmed |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT SHIPPED

**The backdrop is now a property of whether a sheet is still in the document**, rather than of
whether a sheet class can be found in the DOM.

A per-document set of live sheets, plus a `MutationObserver` that prunes it whenever a node leaves,
and drops the backdrop when the last sheet goes. Registration happens at mount, before either mount
branch can return; deregistration at teardown.

**No producer was changed.** That is the point of the shape: the producers that never call teardown
are the ones that leak, so a fix requiring them to call something new would have to change every one
of them and would break again with the next producer. A caller that only does `.remove()` is now
correct by construction.

**A new gate lane, `sheet-teardown`**, takes the gate from 16 lanes to 17. *(Lane counts in this
section are the roster as this phase left it; `tools/gate.mjs` declares 25 lanes as of 2026-09-02.)*

### The group sheet keeps its bar (REQ-002)

The grab bar is a child of the sheet panel, so a surface that refreshes by emptying that panel
throws its own bar away. For the group sheet the refresh IS the feature — changing the group field
rebuilds it — so using the surface for its one purpose left it with no visible way out.

One line puts the chrome back, following the record panel's precedent. The gesture needed nothing:
its listeners live on the panel, not the bar, and it re-resolves the current bar when a press lands,
so restoring the node is enough to make the drag reachable again.

**A second lane, `sheet-rebuild`**, takes the gate to 18. It is the first check here that
constructs a real renderer instead of reading its source — it builds an actual `ToolbarRenderer`,
opens the group popover through the actual positioner, calls the actual rebuild, and then drags the
result with a **real pointer** rather than a synthetic event (the gesture calls `setPointerCapture`,
which rejects a pointer id no real device owns).

Before fixing it, all 40 `.empty()` sites under `src/views/` were read to find out whether the same
defect sat in others. Mostly it did not — the inventory and the two conditional cases that remain
are in `spec.md` §5a.

### The header panels find their own panel (REQ-001, REQ-003)

A phone sheet is portalled onto the body to escape the workspace leaf's `contain: strict`. Two of
these renderers looked for their own panel with a **container-scoped** `querySelector`, which stops
matching the moment the panel leaves the container — and so did the code that registers the panel
with the overlay stack.

Reproduced first, on a phone viewport, driving the real renderer: reopening left **two** panels on
the body and closing removed **neither**, with the backdrop still up over the whole app. The same
sequence on desktop was clean, because there the panel never moves. That asymmetry is the whole
reason it survived: there is no desktop state in which it appears.

**This is the more serious half of the finding, and it is not rescued by the backdrop fix.** An
orphaned panel is still *connected*, so the watcher correctly holds the backdrop up for what it can
only read as an open sheet. Stopping at "the backdrop leak is fixed" would have shipped the freeze.

All four header renderers now hold their panel and expose `getPanel()`; filter and sort already
retained theirs and needed only the getter. Removal is enough to take the backdrop with it, which
is the payoff of the watcher above.

### The modal sheets are wired (REQ-004, partial)

Asking a modal to present as `sheet` drew it a grab bar and attached nothing, on every surface that
presents that way. `DbModal` now wires the bar it draws, through `this.close()` rather than
`super.close()` — one modal overrides `close()` to confirm before discarding edits, and the drag
has to go through that override or the gesture becomes the one way to lose work silently.

**T6 stays open even so.** Its evidence line asks for the invariant to hold *by construction*, and
what landed is by enumeration: `hasSheetDrag()` is exported so the property is measurable at all,
and two cases assert it — but for the positioner path, not for `DbModal`, which cannot be built
outside Obsidian because the catalogue's stub throws on `Modal` by design. The structural version
was designed and rejected on a concrete conflict, recorded in `tasks.md`.

### A flick dismisses (REQ-005)

Velocity is sampled from the move stream, never against the release — a pointerup arrives where the
last move already reported, so a velocity measured across it is almost always exactly zero and a
flick would read as a dead stop.

**The threshold is measured, not chosen.** Deliberate drag ~0.08 px/ms; real flick ~1.18;
frame-paced brisk drag ~1.0; synthetic burst 2.0–20.6. The line sits at **0.8 px/ms**, with a 24px
floor so a tap cannot qualify and a 100ms staleness guard so a finger that rests before lifting is
not flicking.

**The first attempt was reverted, and the second fixed the right thing.** Two pinned placement
assertions failed. Neither was the harness being wrong about the sheet — both were the harness being
unrealistic about time: a 40px "short drag" completed in ~18ms, and the record-detail 95px drag ran
two frames apart at ~1 px/ms. Those are flicks, not deliberate drags, so asserting they spring back
was asserting the feature is absent. The menu case is now a pair at the same distance — paced springs
back, fast dismisses — and the record-detail drag pauses before lifting, which is what "a 95px drag
must not dismiss" actually describes.

### No sheet draws an unwired handle (REQ-004), now by construction

The gesture draws the bar; chrome re-creates one only where a gesture is already attached. An
unwired bar is unrepresentable rather than discouraged. I had rejected this shape earlier believing
it conflicted with the group-sheet rebuild — it does not, because that guard is exactly what
separates restoring a bar from minting an unwired one. Verified by removing it: the guarantee goes
red.

### The drag cases were pressing an off-screen bar

Worth its own heading, because it invalidated evidence already committed. The sheet rises from
below the fold, and the harness read the bar's box the instant it opened — y=860 in an 844px
viewport. Every press missed the sheet entirely, the overlay stack dismissed it as an OUTSIDE
press, and the case reported a successful drag. The gesture ran, the sheet went away, the case
passed, and none of it was the drag.

**A zero-distance tap "dismissing" the sheet is what exposed it** — the one result that cannot be
explained by the gesture working. The harness now waits for the sheet to rise and refuses to press
a bar that is not under the cursor, and the tap is a permanent case. Re-measured on that footing
the drag genuinely dismisses, but it was not evidence when it was first cited for REQ-002.

### The gate answers in one run

`evidence` checked artefact freshness before the four lanes that re-stamp their own artefacts, so
the first run after any source change went red and the second went green with nobody doing
anything. The re-stamps are real measurements, so nothing was hidden — but a gate that passes on
the second try teaches "just run it again". Moved last, and **verified by making an artefact
genuinely stale and running once**: `evidence` green, with `screenshots-fresh` correctly still red
because nothing auto-refreshes captures.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. THE CHECK, AND WHY IT IS A PARITY CHECK

One producer already did this correctly — the owned menu takes its chrome down before removing its
node, and its own comment says why. Every other producer is compared against it **in the same run**.

That asymmetry is what makes the result hard to fake: a harness would have to report a pass for the
reference and a failure for a leaker, from one code path, to produce a false green. This is D12's
shape — two independent producers, one wrong answer insufficient.

The existing placement check does assert a backdrop "arrives with the menu and leaves with it", but
only against that same reference, and elsewhere it removes a leaked backdrop **by hand** so later
checks can run. It tidied away the evidence of the defect in order to keep testing. That is this
packet's own lens turned on its own instrument.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION

| Property | Evidence |
|---|---|
| The check discriminates | Observed **red first**: owned menu and record panel PASS, the three positioner-mounted families FAIL, exit 1 |
| The check still catches the defect | Whole pre-fix file restored from HEAD as a control: the same three go red again, exit 1 |
| The compounding failure is gone | A detached leak no longer blocks a later correct teardown |
| Types | `npx tsc --noEmit` exit 0 |
| Tests | `npx vitest run` — 531 passed, no reduction |
| Gate | `npm run gate` — **18 green, exit 0**, read from `$?`. *A past run: the gate carries **25** lanes today (`tools/gate.mjs`), so 18 is the roster of 2026-08-31 and not the current one* |
| Captures | Recaptured and read; the owned menu sheet renders unchanged |
| The rebuild check discriminates | Observed **red first** on both halves: bar `before: true, after: false`, and the drag could not be staged. Green with the fix, and a real 120px pointer drag dismisses the rebuilt sheet |
| The rebuild check's premise holds | Its two mechanism cases (emptying destroys the bar; re-asserting restores it) stay green either way, so a green producer case cannot be a vacuous one |
| The portalled-lookup defect is real | Reproduced before fixing, on a phone viewport with the real renderer: reopen left 2 panels, close removed 0, backdrop still up. Desktop clean in the same run |
| Its guard discriminates | Reverting both renderers turns the two new real-renderer cases red with the exact duplicate message, while the six modelled cases stay green |
| The sheet reaches the overlay stack | One case asserts all three parts together: the container selector finds nothing, the retained reference finds the sheet, and `dismissPanel` returns true |
| The entrance replay is the cause | Observed **red first** with a real touch: sort 708 -> 844, filter 699 -> 844; five taps at one point added 2 of 5 and 1 of 5. Green after: deepest 711 and 699, 5 of 5 on both |
| It is the entrance and nothing else | The same five taps with the transition disabled added five **before** the fix — one variable |
| The fix cannot be "delete the entrance" | A control asserts an opening sheet still rises (first seen 844, settles 708). It passes before and after, and goes red when `playSheetEntrance` is ablated |
| It is not a hang | Worst timer delay 0.1ms across the rapid taps, no page errors, 1 sheet and 1 backdrop throughout |
| Gate, from the final state | `npm run gate` — **25 green, exit 0**; `npx vitest run` 1037 passed; `npx tsc --noEmit` 0; lint 172, the unchanged baseline |
| Captures | Re-captured and read: the sort and filter panels are **pixel-identical**, which is the right answer for a change to timing rather than paint |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE

No Obsidian host is constructed, so the check measures the **chrome contract**, not any particular
caller's lifecycle. A producer whose close path is never reached on a device would pass here and
still leak there.

**The registration case cannot be observed red by reverting**, the way the others were: pre-fix the
renderers have no `getPanel()`, so the harness would fail to compile rather than fail. Its
discrimination comes from asserting the selector finds nothing in the same breath — if both lookups
found the panel, the sheet never portalled and the case proves nothing.

**Nothing is device-confirmed.** The operator reported this as the app freezing on close; that
report closes when they say it no longer does, and not before.

*2026-09-02: this document's description said "the view sheet, the dead handles and flick dismissal
remain", and none of the three does.* `goal.md` records the view sheet met (`dismissPanel` returns
true against a real open sheet), the dead handles met by construction (`hasSheetDrag`,
`src/views/mobile-bottom-sheet.ts:342`) and the flick met at a measured threshold — **five of six
criteria**, which the Status row above already said. What does remain is finding #5, the
container-wide keyboard inset, which is a deliberate non-fix and not one of the six criteria, and
the operator's device pass, which is the sixth.

### Known Limitations / revealed defect — Report 29 (2026-09-02)

A fresh read-only Opus debug pass on device report 29 (iOS, every sheet family, keyboard closed,
release 1.4.0) found what this phase's own check could not see: `db-modal.ts:64,72` runs
`applySheetChrome(this.modalEl, true)` in the `DbModal` constructor, and `DbModal` has no `onClose`
that ever passes `false`. Obsidian's `Modal.close()` detaches `containerEl`, but `setSheetMount`
(`mobile-bottom-sheet.ts:179`) had already portalled `modalEl` onto `document.body`, so the sheet
node outlives the close and `pruneSheets()` (`:250`) reads it as connected forever — the scrim can
then never be removed again for the life of the session, by any producer. Provenance: `f7ce99d`
wired the chrome call into the constructor while it was pure presentation; `4bd11b83` moved the body
portal inside `applySheetChrome` the same day, and the modal path inherited it without anyone
designing for it.

This is exactly the gap this section already named: **"a producer whose close path is never reached
on a device would pass here and still leak there."** `tools/live/sheet-teardown-harness.ts:75` mounts
a synthetic `div`, not a modal whose host detaches a different node than the one registered, and
`tools/storybook/obsidian-stub.mjs:90` throws on `Modal` by design — so `sheet-teardown.json`
(`producers: 10, leaking: 0`) was never evidence about `DbModal`. Full diagnosis, provenance,
secondary/tertiary causes and rejected suspects recorded in `goal.md`'s LOG section
(2026-09-02 entry).

**Fixed and proved on the bench, not on the phone.** `DbModal` now applies its presentation in
`onOpen()` and tears the chrome down in `onClose()` while the container is still connected
(`db-modal.ts:62-70`), with all twenty subclasses calling `super` on both. The harness gap that hid
this is closed by a producer modelling the shape directly — a wrapper the host detaches while the
registered node sits on the body — since the Obsidian stub still cannot construct a `Modal`. That
producer was observed red against the shipped base (`1 backdrop(s) and 1 sheet(s) left after the
host wrapper was removed`) before going green at `producers: 11, leaking: 0`. Two smaller causes
went with it: `pointercancel` no longer shares the dismissal handler, and an anchored sheet gives a
disconnected anchor one frame to come back before hiding.

Codex (gpt-5.6-luna xhigh) implemented up to its usage limit and returned no report; a verifier
judged the partial diff, finished the missing `pointercancel` binding, repaired the bench producer's
unguarded call, and ran the gate. **Two device rows remain open** — the criteria count is 6 of 8,
and no part of this is confirmed on the operator's phone. The bench states its own limit: no
Obsidian host is constructed, so it measures the chrome contract rather than a real lifecycle.

### The second mechanism — Report 29 (2026-09-02, later the same day)

A long press did not consume the press it completed. `touch-environment.ts` called `preventDefault()`
from inside its `setTimeout`, which runs after `pointerdown` has finished dispatching, so there was
no default left to prevent and the call consumed nothing. The browser sent its compatibility
`mousedown` and `click` when the finger lifted, and the row's tap action ran on top of the menu the
hold had just opened — the record sheet appearing behind the menu in the operator's report.

The hold now swallows the next `mousedown` and `click` on the target in the capture phase, once each,
clearing on the next `pointerdown` (`touch-environment.ts:81-155`), reusing the shape
`table-cell-gesture.ts:228-242` already carries. **Observed red first:** with the fixed file stashed,
the new unit case recorded the row's tap handler receiving `["mousedown", "click"]` after a completed
hold; it now receives `[]`.

**What the bench cannot prove, and why the device row is not decoration.** Chromium re-hit-tests the
compatibility click onto the backdrop the menu just opened, so the row never receives it there — in
the pre-change run the row's own listeners recorded no `mousedown` and no `click` at all. WebKit
delivers that click to the original touch target, which is where the defect lives and where the fix
acts. The unit case models WebKit's delivery. **Only the operator's phone confirms the symptom is
gone.**

The brief's second proposed change was refuted rather than built; see `goal.md`'s entry and §5.
This pass implemented and verified in one runtime because all three external lanes were unavailable.
### The sheet that moved under the thumb — reports 34-36, second pass (2026-09-04)

The overlay-stack resolver in `85ff504` was a real fix for a real defect and was not the whole one.
On 0.0.20 the operator still reported add-sort and add-condition breaking the sheet on the phone.

**`playSheetEntrance` is keyed to the NODE.** It skips only when the panel already carries
`is-visible`, which is a correct rule for the question it can see. What it cannot see is that all
four header panels rebuild by *removing* their node and building a fresh one — on every add, remove,
toggle, and on any background `refresh()` that lands while they are open. A fresh node has never
entered, so an edit inside an open sheet replayed the whole 260ms rise from below the fold.

**Measured on a 390x844 phone page, driving the real renderers with a real touch.** One tap on
"+ Add sort" and the panel's top edge went **708 to 844 and back over ~280ms**. Five taps at ONE
coordinate, 120ms apart, added **two** rules on the sort sheet and **one** on the filter sheet; the
strays landed on the grab bar, on a rule row's icon, and on a field dropdown the tap opened. With the
transition disabled the same five taps added five — one variable, and it is the entrance.

**It is not a hang, and the operator's word for it is still fair.** The main thread was never
saturated: worst timer delay 0.1ms across the rapid taps, no page errors, one sheet and one backdrop
throughout. What a phone meets is a surface that jumps out from under the thumb, and a quarter-second
after every edit in which the entire screen is tap-swallowing backdrop — so a tap anywhere in that
window closes the sheet mid-edit, which is exactly the "add condition closed the filter sheet" row.

**The fix is one line per producer.** Only the owner knows a replacement node is a rebuild rather
than an opening, so `carrySheetEntrance()` lets it say so, leaving the node in the same class pair
`playSheetEntrance` finishes with rather than in a third state of its own. All four panels carry it,
because all four share the shape — the two that were not reported reach the same defect through a
background refresh rather than through a control of their own.

**The larger fix was named and not built.** Retaining the node across a rebuild — `empty()` and
repopulate, the shape `record-detail-panel.ts` and the group popover already use — would remove this
defect at its source and take the position-loop resubscription, the mount churn and the focus churn
with it. It is a much wider change across four renderers with real regression risk at the mount
identity, and three of those renderers pass `panel.parentElement` as the container on some paths,
which is `document.body` once the sheet portals. Recorded here rather than folded in.

**What the bench proves, and what it does not.** It drives Chromium. It can show the sheet holds
still through a rebuild and that five taps at one coordinate all land; it cannot show what a thumb on
WebKit meets, and the device row stays open.

### The engines were never the variable — reports 34-36, third pass (2026-09-04)

The operator, on a preview carrying the entrance fix, reported the same two controls still dead on
iOS. The brief's premise was that the earlier work had only ever been proven under Chromium touch
emulation while the device runs WebKit, so the first thing done was to remove that doubt.

**Chrome and WebKit agree exactly, and neither reproduced it.** Playwright WebKit on an emulated
iPhone 14 Pro with real touch input, measured against Chromium on the same page: one tap on "+ Add"
adds one rule; five taps at one coordinate add five; the new row's dropdown opens as a second sheet
and takes an option; a tap outside closes the sheet and clears the backdrop; a 250ms timer fires
throughout; no page errors in either engine. The sheet's top edge does not move — deepest sample
equals the settled top, 527.16 for sort and 514.61 for filter. Verbatim from both engines, the
five-tap case: `rules: 5, open: true, sheets: 1, scrims: 1, tick: 1`. The dropdown case:
`menuCount: 1, itemCount: 3, sheets: 2` then `menuCount: 0, sheets: 1, rules: 5`. The outside tap:
`open: false, sheets: 0, scrims: 0`.

That is a real finding and it is worth stating plainly: **the engine was not the variable.** What no
harness did was rebuild the toolbar behind an open sheet, and the view does exactly that on roughly
two dozen paths, most of them background refreshes with nothing on screen to show for them.

**Adding that one step reproduced the operator's report, identically in both engines.** After the
rebuild and one viewport event: `the sheet went with the anchor (sheet: false, on the body: false,
visibility: hidden, sheets: 0, backdrops: 0)`, and then the tap at the coordinate the thumb was
already on: `0 rule(s) after the tap (open: false, sheet: false)`. Eight failures, four per engine.

**Root cause: a phone sheet's presentation was gated on an anchor it never measures.**
`positionToolbarPopover` refused to run at all without a connected anchor, and `place()` gave a
disconnected one a recovery frame and then hid the surface — which for a sheet means un-portalling it
off the body and taking its backdrop with it. But the sheet branch of `place()` calls `placeSheet`,
which reads the viewport and nothing else. So an ordinary toolbar rebuild armed the trap and the next
scroll, rotation or keyboard sprang it, and the rebuilt panel then handed the same dead node back to
the positioner, which returned before it could become a sheet again.

**An existing assertion said the opposite and had to be corrected, not worked around.**
`verify-placement` asserted that a phone sheet whose anchor died should stop presenting and take its
backdrop down. Its premise — a sheet with no anchor is unreachable — is true of an anchored popover
and false of a docked full-width surface. The freeze it was written for is real and keeps its guard,
moved to the event that actually means the surface is gone: the panel leaving the document, which
`sheet-teardown` asserts across 11 producers and which `verify-placement` now states directly.

**The node identity was fixed too, as a property rather than a symptom.** The sort and filter panels
replaced their node on every rebuild, and the node is the surface's identity to the overlay stack,
the sheet module, the entrance and — on a touch device — the element a tap's delayed click is
delivered to. Three of those four had been patched back one at a time; the fourth cannot be from
downstream. No emulator produces the delay, so the lane asserts the property instead: the panel the
press began in is the panel still there afterwards. Red in both engines, green in both after. This
also retires `carrySheetEntrance` at those two call sites — a refilled node still carries
`is-visible`, so the entrance no-ops for the reason it always did rather than because a flag says so.

**And an instrument, because three passes have now ended here.** `debugSheetTrace` is off by default
and inert while off. It records sheet mounts and unmounts, panel refills, dismissal reasons, the whole
tap sequence with whether each target is still connected and still inside a sheet, and
`visualViewport` height, all grouped by a generation that begins at a mount. A "Copy sheet trace"
command puts it on the clipboard, because there is no console to read on a phone. It records tags,
ids and classes and nothing else, and a source guard pins that.

**What is now measured, and what is still not.** Both engines, real touch, an emulated iPhone, with
a negative control on the desktop half and a teardown control on the phone half. Still unmeasurable
here: the delayed compatibility click iOS produces hundreds of milliseconds after the finger lifts,
the software keyboard's effect on `visualViewport`, the host's own re-render, and anything WebKit
paints rather than computes. Those are what the trace exists to report, and the device row stays open.

**Evidence, exit codes read directly.** `npx tsc --noEmit` 0; `npx vitest run` **1042 passed**, up
from 1037; `npm run lint` **172**, the recorded baseline; `npm run lint:tools` 0; `scan-comments`
`PASS`; `sheet-rebuild` **31 checks green across Chrome and WebKit**, exit 0, from 8 red;
`verify-placement` **393/394**, the one red declared and unrelated;
`SURFACE_PHASE=031-sheet-lifecycle-ownership npm run gate` **PASS — 25 green, 0 red** at exit 0.

**Trued up after reconciling with `main` (rebase onto `ab116959`, then a second rebase onto
`62e7e5c1` once main moved again before the push landed, both 2026-09-04).** The upstream
entrance fix (`c96467c9`) had already landed with identical `src/` content, so the two branch
commits carrying it collapsed to empty and dropped; the five numbered commits above kept their
subject but took new SHAs across the two rebases: `9f31bf6f` (anchor gate), `6336417b` (placement
control), `8140a1ae` (retained-node rebuild), `c12817a8` (sheet trace), `efb5b54f`
(pointerdown-pinned dismissal). Landed on main as `9ecb5fff`. `npx tsc --noEmit` 0; `npx vitest run`
**1044 passed**, up from 1042 (`main`'s own concurrent work between the fork point and today's tip
added the difference, not this packet); `npm run lint` **172**, unchanged; `npm run lint:tools` 0;
`scan-comments` `PASS`; `sheet-rebuild` **31 checks green across Chrome and WebKit**, exit 0;
`verify-placement` **393/394**, unchanged; `npm run gate` **PASS — 25 green, 0 red** at exit 0;
`npm run screenshots:verify` 528 entries, 0 stale.

### The view was closing its own sheet — reports 34-36, fourth pass (2026-09-05)

The operator, on released 0.0.22: *"pressing any action in a sheet doesn't work and instantly closes
it"*, and *"all buttons like add sort, add filter etc still broken"*. Three shipped fixes had not
touched it.

**The leading hypothesis was measured and is wrong.** The theory was that the backdrop stacks above
the portalled sheet in WebKit, so the press at the button's centre reaches the backdrop instead. It
does not. `document.elementFromPoint` at the settled centre of "+ Add" returns
`button.db-panel-button` in **both** engines, on an emulated iPhone 14 Pro with real touch. The
backdrop sits one z-index tier below the sheet and never wins the point. The remaining candidates
went the same way, on evidence rather than argument: the overlay stack's `pointerdown` check passes
(its `getPanel()` resolver and the retained-node rebuild already fixed that end); the drag gesture
never arms, because `onDown` requires `event.target === grabTarget()` and a button is not the grab
bar; and a stale delayed click cannot be it, because the failure lands on the FIRST tap, before any
rebuild has happened.

**Root cause: the view's own outside-press dismissal reads a portalled sheet as outside itself.**
Both views hold a document-level capture listener on `mousedown` that decides independently of the
overlay stack whether a press was outside, by asking whether the view's container holds the pressed
node — `database-view.ts:3012` and `embedded-database-renderer.ts:998`. A sheet is portalled onto
`document.body` precisely so it can cover the host's navigation bar, so that question answers
"outside" for a thumb resting on the sheet's own control, and `closeHeaderPopovers()` runs. It runs
on `mousedown`, which is before the `click` a tap produces — so the panel is already gone when the
click would have reached the button. **One wrong answer, both complaints:** the action does nothing
AND the sheet closes. Desktop is unaffected for the only reason that matters here — a desktop panel
is never portalled, so containment still answers correctly there.

**Why five lanes across two engines could not see it.** Not the engine, and this time not the event
either: it is the wiring. Every sheet case in this repository registers dismissal through
`installPopoverAutoClose` — the overlay stack — and the views carry a **second** dismissal path the
stack knows nothing about. No harness had ever installed it, so the entire path was unmeasured in
Chrome and WebKit alike. It is also a `mousedown`, and every existing case drives a click or a
`pointerdown`.

**The fix is at the portal, not at the call sites.** `isInsideOpenSheet` in
`mobile-bottom-sheet.ts` answers from the live-sheet registry the module already maintains — a node
matches only while the module is actually holding it as a mounted sheet, so chrome left on a
detached or demoted node cannot turn a genuine outside press into an inside one. Both views consult
it beside their containment test. The module that moves the node is the module that knows it moved.

**Red then green, in both engines.** New lane rows in `sheet-rebuild`, on an emulated iPhone with
`page.touchscreen.tap`. Each carries its own negative control that runs the same tap against the
container-only shape and must still lose the sheet, so the case cannot go quietly vacuous: `the tap
closes the sheet and adds nothing — the defect this case exists to see`. With the predicate
neutralised the four real rows go red in both engines with the operator's symptom verbatim — `0
rule(s) after the tap (open: false, sheet: false)` — and green with it restored: `the tap reached
it: 1 rule(s), sheet still open and still a sheet`. A call-site guard pins both views to the
predicate, because the behavioural case models the views rather than constructing them, and a
predicate nobody consults is as dead as a wrong one.

**Evidence, exit codes read directly.** `npx tsc --noEmit` 0; `npm test` **1129 passed, 108 files**,
exit 0; `sheet-rebuild` green across Chrome and WebKit including 12 new rows; `npm run gate`
**PASS — 25 green, 0 red** at exit 0. Screenshots recaptured because the freshness lane fingerprints
the two view sources; the capture is behaviour-neutral and committed separately.

**Still not proven here.** No Obsidian host is constructed, so the views' listeners are modelled
from their source rather than installed by the real class; the call-site guard is what holds that
seam. The delayed compatibility click, the software keyboard's effect on `visualViewport`, and the
host's own re-render remain unmeasurable in this harness, and the device row stays open until the
operator confirms on hardware.

### The two siblings of the same fork — reports 34-36, fourth pass, second landing (2026-09-05)

Three call sites in the two views branch on the same bare containment test. The dismissal one was
the reported defect; the operator asked for the other two in the same landing. **Only one of them is
a defect, and measuring which was the whole of the work.**

**`shouldClearCellSelectionFromPointer` is reachable and was wrong** — `database-view.ts:3030`,
`embedded-database-renderer.ts:1015`. It is called from `handleOutsideClick`, a *document*-level
capture listener, so it does see presses inside a portalled sheet. A press on the sheet's own
control takes the OUTSIDE branch, which clears the selection unless the target is a modal or a menu,
and a sheet is neither — so a phone user silently loses a cell selection they never left, where
desktop keeps it because its panel never moves and the inside branch already names every control
that must not clear it. Routed through the same predicate. Red then green in both engines, from one
press that answers both shapes: `the shipped shape still drops it (button.db-panel-button)` before,
`containment alone drops it and the shipped shape keeps it, on the same press` after.

**`forwardOuterWheelScroll` is NOT reachable, and gets no guard** — `database-view.ts:1534`. It
reads exactly like the same defect, which is why it was flagged. It is not: the listener is bound to
`containerEl_.parentElement`, and a sheet portalled onto the body is not a descendant of it, so no
event from a sheet ever propagates through. Measured in both engines: `sheetIsDescendantOfContainer
Parent: false, wheelReached: false`. A guard there would sit on an impossible path, and the lane row
proving it works could never go red — the vacuous case this packet's negative-control idiom exists
to prevent.

**The measurement nearly went the other way, and that is the part worth keeping.** The first run
reported `wheelReached: true` in both engines — because the harness mounts its root directly on the
body, where a sheet *is* a descendant of the root's parent. The view mounts its content inside the
workspace leaf. Same code, same engines, opposite answer, decided entirely by an ancestry the
harness had no reason to model. The binding is now pinned as a lane invariant instead of guarded in
shipped code, so moving that listener to the document — where the dismissal listeners already are —
goes red and says why.

**Evidence.** `npx tsc --noEmit` 0; `npm test` **1143 passed, 108 files**, exit 0; `sheet-rebuild`
green across Chrome and WebKit with 6 further rows; `npm run gate` **PASS — 25 green, 0 red** at
exit 0, after `git rebase origin/main` (three generated evidence artifacts conflicted and were
re-derived rather than merged).

<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DEVIATIONS, AND WHAT I GOT WRONG ALONG THE WAY

| Item | Note |
|---|---|
| Watcher shipped, disposer did not | The plan's ADR-001 proposed both. The set alone closes the defect, and a disposer still has to be *called* by producers that demonstrably never call the teardown they already have. Recorded as a deviation; a disposer can follow if a caller wants explicit control |
| Registration was in the wrong place first | It went in after the body move, which skips the early-return branch a body-mounted surface takes — so the owned menu, the one producer that behaves, would have been invisible to the watcher and could have had its backdrop pulled while still open. Caught by re-reading both branches |
| The compounding test asserted the opposite of the truth | It re-attached its "leaked" panel to the body, which makes it an **open** sheet — and holding the backdrop up for an open sheet is correct. A detached leak is what `.remove()` produces, and the case now models that. The check was failing on a wrong expectation, not a wrong fix |
| The watcher is asynchronous | `MutationObserver` fires as a microtask, so the check awaits a microtask and a frame before reading. A backdrop still present after a rendered frame is one the user has seen |
| I counted a criterion that was not met | The first commit recorded "2 of 6 criteria" and `completion_pct: 83` with only ONE criterion ticked — tasks counted against a denominator of criteria. T4 makes 2 of 6 true now, which is exactly why it is written down: a wrong number that later comes true is the kind that never gets caught |
| I expected the group fix to need two halves | The reasoning was that re-creating the bar leaves the drag bound to a detached node. The source says otherwise, in a comment written for this exact reason: the listeners are on the panel and the bar is re-resolved at pointerdown. Read before predicting |
| I expected the defect to be systemic | A guess of "8 or more sites" put a shared lifecycle fix on the table. Reading all 40 `.empty()` sites brought it down to one unconditional case plus two conditional ones, so the one-liner was the right size and the bigger fix was not built |
| A harness case that raced itself | The two real-renderer cases share one body and each resets it, and they were first built as already-started promises — so the second would clear the body under the first before it read its result. Rewritten as thunks awaited in sequence. A harness racing itself reports a green |
| I cited a reading that meant nothing, and shipped it | The 120px drag was committed as REQ-002's evidence while the press was landing off-screen and the overlay stack was doing the dismissing. Two things would have caught it earlier: a control gesture that must NOT close, and asking what the harness proves when it passes rather than only when it fails. Both exist now |
| I nearly cited another reading that meant nothing | An early probe reported `dismissPanel === false` and it was tempting as evidence for REQ-003. That probe never registered anything, so `false` was the only answer it could give, in either mode. Discarded and measured properly instead |
| A brief's two changes, one of which was already answered here | The second proposed change — prune a registered sheet by its class — would guard a state `applySheetChrome` cannot produce, and its red came from a bench asserting that an OPEN sheet should lose its backdrop. This packet had already made and reverted that exact inversion in the compounding case. It was not built, and the reasoning is written down so the next pass does not arrive at it a third time |
| The bench that could not see its own fix | The long-press script was offered as the red for the click swallow, but its `doc:click` line is the backdrop's click, not the row's — Blink re-hit-tests, and the row's listeners recorded nothing in either run. The fix is real and the script cannot observe it. The unit case models WebKit's delivery instead, and the device row is what actually closes it |
| Implemented and verified in one runtime | The plan sends implementation out to an external lane so the verifier is not the author. All three lanes were unavailable, so this pass is both. Recorded as the weaker arrangement rather than left implicit |
| A fix that was real and not whole | `85ff504` fixed the overlay stack holding a node the rebuild had replaced, and the operator still reported the same controls broken. The second mechanism was in the same rebuild and a different module. A report that survives a fix is evidence about the diagnosis, not about the operator |
| The harness accepted a moving sheet as settled | Two identical samples are also what the START of an entrance looks like, so the first staging read its coordinate off a surface about to leave and one case passed for the wrong reason. Settling now means unmoving AND on screen. This is the same error the drag cases already paid for once, in a new place |
| The tracker missed the point it existed to see | It sampled from the first animation frame, by which time the surface had already left its start state — 830 against 844 for the same sheet. An entrance commits its start state during the call that begins it, so the first sample has to be synchronous |
| I inherited the brief's premise and it was wrong | The dispatch said the earlier fix was proven only under Chromium and the device is WebKit, so the first three hypotheses were all engine differences: `transitionend` on a class swap, `-webkit-` transform handling, the iOS click delay landing on a detached node. All three were measured and none reproduced — the engines agree exactly. The premise was worth testing and the answer was worth keeping, but three hypotheses went to it before the question "what does the device DO that the harness does not" got asked |
| An assertion I had to invert rather than satisfy | `verify-placement` asserted the exact behaviour the fix removes. Satisfying it would have meant keeping the defect; deleting it would have dropped a real freeze guard. The resolution was to find which half of it was load-bearing — the backdrop cannot outlive its sheet — and re-key that to the event that means what the old one only assumed |
| A concurrent writer in the same working tree | The landing agent for the branch this work sits on was operating in the same checkout, and stashed the in-flight change twice and switched the branch out from under it three times — once mid-commit, so a commit landed on the landing branch and had to be moved. Nothing was lost, because every intermediate state was mirrored outside the tree. Recorded because the recovery cost real time and the lesson is cheap: two agents in one working tree is not a thing to do |
| The gate's `evidence` lane self-heals | It checks artefact freshness at lane 9, and lanes 11, 16, 17 and 18 re-stamp their own artefacts afterwards. So the first run after a source change reds and the second greens with no human action. The re-stamps are genuine re-measurements, so nothing is hidden — but "just run it again" is the wrong habit to teach, and moving the lane last would fix it. Left for the packet that owns the gate |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:next-leg -->
## 6. NEXT LEG — iOS WEBKIT ADD-CONDITION / ADD-SORT FREEZE

A converged research loop (`research/research.md`, lineage `codex-luna`, run
`1788547579619-slpzp3`, five iterations, ratios `0.82/0.63/0.46/0.24/0.04` against a `0.05`
threshold, 21 findings) diagnosed a freeze that survives everything shipped above: tapping Add
condition or Add sort on iOS WebKit. Highest-fit mechanism (5/5): the Add handler crosses a
destructive panel remove/recreate/refresh synchronously, opening a stale-target/generation window
between the original touch/click, document-capture outside dismissal, the overlay's live-panel
lookup, and old placement callbacks. Ten of the synthesis's citations were spot-checked
in-runtime — 10/10 confirmed (`research/citation-spot-check.md`).

**Recommended next leg, running on the WebKit branch, in order:**

1. **Retained-node rebuild.** Replace the destructive panel remove/recreate with a stable
   shell/keyed-row update; if replacement stays, gate one Add action per generation, dispose the
   old surface before removal, and reject stale callbacks/events.
2. **Pointerdown-decided inside/outside.** Make the overlay's outside-dismissal generation-aware:
   resolve the live panel at capture time, defer or guard outside dismissal across the active Add
   handoff, and restore focus only to a still-connected anchor.
3. **Debug trace.** Ship the opt-in, generation-tagged preview diagnostic from `research.md` §8
   before changing behavior, and classify the first device reproduction into branch A-E
   (lifecycle / overlay / viewport / focus-scroll / host-gesture) before choosing which fix to
   build.

This is a new leg, not a reopening of the work above — none of the five shipped fixes are
contradicted by the research, and the two open device rows (T10, T13) still gate this packet's own
completion.
<!-- /ANCHOR:next-leg -->
