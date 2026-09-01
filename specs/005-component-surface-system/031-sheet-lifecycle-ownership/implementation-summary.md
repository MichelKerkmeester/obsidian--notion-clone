---
title: "Implementation Summary: Sheet Lifecycle Ownership"
description: "The backdrop leak and the group sheet's vanishing grab bar are fixed and gated; the view sheet, the dead handles and flick dismissal remain."
trigger_phrases:
  - "031 implementation summary"
  - "sheet teardown shipped"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-08-31T20:45:00Z"
    last_updated_by: "phase-implementer"
    recent_action: "Unwired bars made unrepresentable; flick dismissal landed at a measured threshold"
    next_safe_action: "The operator opens and closes each sheet on device"
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
      - "A sheet still on the body is an open sheet; holding the backdrop for it is correct"
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
| **Status** | In progress — 5 of 6 criteria met. Everything implementable is in; the last row needs the operator's device |
| **State** | Committed; gate 18 green, exit 0. Not device-confirmed |
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

**A new gate lane, `sheet-teardown`**, takes the gate from 16 lanes to 17.

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
| Gate | `npm run gate` — **18 green, exit 0**, read from `$?` |
| Captures | Recaptured and read; the owned menu sheet renders unchanged |
| The rebuild check discriminates | Observed **red first** on both halves: bar `before: true, after: false`, and the drag could not be staged. Green with the fix, and a real 120px pointer drag dismisses the rebuilt sheet |
| The rebuild check's premise holds | Its two mechanism cases (emptying destroys the bar; re-asserting restores it) stay green either way, so a green producer case cannot be a vacuous one |
| The portalled-lookup defect is real | Reproduced before fixing, on a phone viewport with the real renderer: reopen left 2 panels, close removed 0, backdrop still up. Desktop clean in the same run |
| Its guard discriminates | Reverting both renderers turns the two new real-renderer cases red with the exact duplicate message, while the six modelled cases stay green |
| The sheet reaches the overlay stack | One case asserts all three parts together: the container selector finds nothing, the retained reference finds the sheet, and `dismissPanel` returns true |
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
| The gate's `evidence` lane self-heals | It checks artefact freshness at lane 9, and lanes 11, 16, 17 and 18 re-stamp their own artefacts afterwards. So the first run after a source change reds and the second greens with no human action. The re-stamps are genuine re-measurements, so nothing is hidden — but "just run it again" is the wrong habit to teach, and moving the lane last would fix it. Left for the packet that owns the gate |
<!-- /ANCHOR:decisions -->
