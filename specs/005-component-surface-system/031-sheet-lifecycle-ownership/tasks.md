---
title: "Tasks: Sheet Lifecycle Ownership"
description: "The ordered task list, with the observation that closes each one."
trigger_phrases: ["031 tasks", "sheet lifecycle tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-09-04T18:20:00Z"
    last_updated_by: "reports-34-36-second-pass"
    recent_action: "T14 closed: a panel rebuild no longer replays the sheet entrance"
    next_safe_action: "The operator adds a sort rule and a filter condition on the phone"
    blockers: []
    key_files: ["plan.md", "spec.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-tasks"
      parent_session_id: null
    completion_pct: 83
    open_questions: []
    answered_questions: ["The owned menu is the one producer that cleans up, so it is the parity reference", "A gesture consumes forward, on events not yet dispatched, not backward", "The entrance is keyed to the node, so a rebuild replays it; only the owner can tell the two apart"]
---
# Tasks: Sheet Lifecycle Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it. A task closes on an observation,
> never on having been attempted.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## PHASE 1: THE CONTROL

- [x] **T1** Build the producer-parity check — REQ-001, D5. **Blocking.**
      *Closed by:* `tools/live/sheet-teardown.mjs` + harness, now gate lane `sheet-teardown`
      (the gate is 18 lanes as of T4). **Observed red first, with the required asymmetry:** owned menu and record panel
      PASS, the three positioner-mounted families FAIL, exit 1. Re-run against the whole pre-fix
      file after the fix: the same three go red again, exit 1.
      *Evidence to close:* for each sheet family, open then close, assert no `.db-mobile-sheet-scrim`
      and no `.db-mobile-bottom-sheet` on the body. It must **pass for the owned menu and fail for
      every panel family** on the current tree. A check green everywhere before the fix is not
      discriminating and must be rebuilt rather than believed.

## PHASE 2: THE FREEZE

- [x] **T2** Live-sheet set plus a removal watcher — REQ-006, D1, D2.
      *Closed by:* a per-document set of live sheets and a `MutationObserver` that prunes it on
      removal, dropping the backdrop when the last sheet goes. **A caller that only removes its
      panel is now correct by construction**, which is what D2 asked for. Shipped as the watcher
      rather than a returned disposer: the disposer still needs the producer to call it, and these
      producers are the ones that never do. Recorded as a deviation from the plan's ADR-001, which
      proposed both — the set alone closes the defect and the disposer can follow if a caller wants
      explicit control.
      *Evidence to close:* T1 goes green for every family; a caller that only removes its element
      still leaves no scrim.
- [x] **T3** Retained-element pattern for view-config and column-manager — REQ-001.
      *Evidence to close:* closing each removes its own sheet; no orphan survives to block a later
      cleanup.
      *Closed by:* both renderers now hold their panel instead of searching the container for it,
      and both expose `getPanel()`. Reproduced first, on a phone viewport, with the real renderer:
      reopening left **2 panels** on the body and closing removed **neither**, with the backdrop
      still up. Desktop was clean throughout — which is why no desktop pass could see it. After the
      fix: one panel throughout, body clean, backdrop gone. Guarded by two new real-renderer cases
      in the `sheet-teardown` lane, which fail with exactly that duplicate message when the
      renderers are reverted.

## PHASE 3: THE TWO DRAG CAUSES, SEPARATELY

- [x] **T4** Re-assert chrome after the group panel empties — REQ-002, D3.
      *Evidence to close:* handle present after a group toggle; a 120px drag dismisses. Today the
      handle is absent and the drag moves 0.0px.
      *CORRECTED:* the drag half of this was first ticked on a harness that pressed an off-screen
      bar — the sheet rises from below the fold, the box was read before it arrived, every press
      missed, and the overlay stack's outside-press dismissal was being reported as a working drag.
      A zero-distance tap "dismissing" the sheet exposed it. The harness now waits for the rise and
      refuses to press a bar that is not under the cursor; the tap is a permanent case. Re-measured,
      the drag genuinely dismisses.
      *Closed by:* one line in `rebuildGroupPopover`, guarded by a new `sheet-rebuild` gate lane
      that constructs the real `ToolbarRenderer`, opens the group popover through the real
      positioner and calls the real rebuild — the first check here that drives a renderer rather
      than grepping its source. Observed red first on both halves: the bar went `before: true,
      after: false`, and a real 120px pointer drag could not be staged at all. With the line, both
      go green and a real drag dismisses the rebuilt sheet. The two mechanism cases (emptying
      destroys the bar; re-asserting restores it) stay green either way, which is the asymmetry
      that makes a false green hard to manufacture.
      *Not closed by this:* the operator has not seen it (T10).
- [x] **T5** Register the header panels from a retained reference — REQ-003, D3.
      *Evidence to close:* under `is-phone`, `dismissPanel(panel, "programmatic")` returns true.
      Today it returns false.
      *Closed by:* `installHeaderPopoverAutoClose` now asks the renderer that built the panel
      instead of running a container-scoped selector that cannot match a portalled node. All four
      renderers expose `getPanel()`; filter and sort already retained their panel and only needed
      the getter.
      *Measured:* a `sheet-teardown` case now runs BOTH lookups against the same open sheet and
      asserts all three parts together — the container selector finds nothing, the retained
      reference finds the sheet, and `overlayStack.dismissPanel(panel, "programmatic")` returns
      **true**. The first clause is what stops it passing vacuously: if both lookups found the
      panel, the sheet never portalled and the case would prove nothing.
      *Honest limit:* this case cannot be observed red by reverting, the way T1 and T4 were.
      Pre-fix the renderers have no `getPanel()`, so the harness would not compile rather than fail
      — its discrimination comes from the three-way assertion, not from a red-first run. An earlier
      probe reading of `dismissPanel === false` was discarded rather than cited: that probe never
      registered anything, so its `false` said nothing about this path.

## PHASE 4: THE REST

- [x] **T6** Wire or remove the modal handles — REQ-004, D4. **Closed by construction, across every
      surface.**
      *Closed.* The two `sheet-rebuild` cases proved the invariant on two paths; what the task asked
      for was every surface. The placement lane now walks all **nine** sheet-capable classes and
      asserts both directions per surface: chrome alone draws **0** bars, and attaching the gesture
      draws exactly **1**, with `hasSheetDrag` reporting unwired before and wired after. Both clauses
      are needed — "no unwired bar" alone would pass a build where the bar had stopped appearing at
      all. Control: removing the `activeSheetDrag` guard so chrome draws unconditionally takes the
      first clause red and names all nine surfaces. Restored, hash-verified against `HEAD`.
      *What landed:* `DbModal.applyPresentation` now attaches the gesture to the bar it draws,
      through `this.close()` rather than `super.close()` — one modal here overrides `close()` to
      confirm before discarding edits, and a drag must go through that override or the gesture
      becomes the one way to lose work silently. `hasSheetDrag(panel)` is exported so the invariant
      can be measured at all, and two `sheet-rebuild` cases now assert it: a control proving chrome
      alone attaches nothing, and the positioner path proving its bar is wired.
      *Why it does not close:* the evidence line asks for **by construction**, and this is by
      enumeration. The cases cover the positioner path; they do NOT cover `DbModal`, because the
      catalogue's `obsidian` stub deliberately throws on `Modal` — a documented choice, so a modal
      cannot be built outside Obsidian without weakening it. The structural version (let the
      gesture create the bar, so an unwired one cannot exist) was designed and rejected: T4's fix
      depends on `applySheetChrome` re-creating a bar that a rebuild destroyed, and moving creation
      into the gesture breaks that path. So the 16 modals are wired and unverified outside a
      device, which is T10's job.
- [x] **T7** Velocity-based dismissal — REQ-005. **Landed, at a measured threshold.**
      *Evidence to close:* a short fast flick dismisses; a slow short drag still springs back.
      *What was built:* velocity sampled from the MOVE stream rather than against the release — a
      pointerup arrives where the last move already reported, so a velocity measured across it is
      almost always exactly zero and a flick reads as a dead stop. 0.5 px/ms over a 24px floor,
      with the sample going stale after 100ms so a finger resting before release is not a flick.
      It worked: at a fixed 40px, a fast flick dismissed, a slow drag sprang back, a tap did
      nothing.
      *Why the first attempt was reverted, and what changed:* it broke two pinned assertions in the
      placement lane. Neither break was the harness being wrong about the sheet — but both WERE the
      harness being unrealistic about time. Measured rather than assumed:

      | Gesture | last-sample velocity | total |
      |---|---|---|
      | placement's "short drag springs back" (synthetic) | 2.04 px/ms | 18ms |
      | placement's record-detail 95px drag (1px under the distance threshold) | ~0.5 px/ms | rAF-paced |
      | a real flick through the browser's own input | 1.18 px/ms | 34ms |
      | a real slow drag | 0.08 px/ms | 506ms |

      Both harness gestures were dispatched back-to-back: a 40px "short drag" completed in ~18ms
      and a 95px record-detail drag ran two animation frames apart, carrying ~1 px/ms. Neither is a
      deliberate drag — both are flicks by any measure a person would recognise. Asserting they
      spring back was asserting the feature is absent.
      **So the second attempt fixed the timing rather than the threshold.** The menu case is now a
      pair at the same 40px — paced springs back, fast dismisses — and the record-detail drag pauses
      before it lifts, modelling the finger coming to rest that "a 95px drag must not dismiss"
      actually describes. That story is about the grab bar surviving a refresh; the drag is setup.
      *The threshold is measured, not chosen:* deliberate drag ~0.08 px/ms, real flick ~1.18,
      frame-paced brisk drag ~1.0, synthetic burst 2.0-20.6. **0.8 px/ms** leaves a flick clearly
      above and a deliberate drag clearly below, with a 24px floor so a tap cannot qualify and a
      100ms staleness guard so a finger that rests before lifting is not flicking.
      *Evidence:* four real-pointer cases — 120px drag dismisses on distance, fast 40px flick
      dismisses on velocity, slow 40px springs back, tap that never moves leaves the sheet open. The
      slow control and the tap are what stop this reading as "any gesture closes the sheet".
      The harness also waits for the sheet to rise and refuses to press a bar that is not under the
      cursor — that work caught a real error in already-committed evidence, see T4.
- [ ] ~~**T8** Move the keyboard inset onto the element that reads it.~~ **Moved to `../022`.**
      It carried no requirement here, appears in neither this phase's scope nor its criteria, and
      could therefore never have closed in this phase's own terms. The inset is 022's surface — that
      phase docked the selection bar on it — and this phase's own goal says the container-wide write
      is jank rather than the freeze. Recorded rather than deleted, so the finding is not lost.

## PHASE 5: VERIFICATION

- [x] **T9** Whole gate from the final state.
      *Closed.* `npm run gate` **23 green, exit 0** read from `$?` rather than through a pipe;
      `npx vitest run` **625 tests**, up from the count this phase started at, so no reduction.
- [ ] **T10** The operator opens and closes each sheet on device without the app locking up.
      *Evidence to close:* the operator says so. Nothing else closes this.
- [x] **T11** Take the modal's sheet chrome down on close — report 29.
      *Closed.* `db-modal.ts:62-70`: `applyPresentation()` moved into `onOpen()`, and a new
      `onClose()` releases the drag and calls `applySheetChrome(this.modalEl, false)` while the
      container is still connected, so the panel is reinserted before Obsidian detaches it. All
      twenty `extends DbModal` classes call `super` on every override, verified by scanning each
      definition against its super call. `mobile-bottom-sheet.ts:457-472`: `pointercancel` now
      routes to a cancel path that springs back **and clears the pointer id** — clearing it is what
      keeps a cancel from leaving the handle permanently dead.
      *Red observed:* `sheet-flick.test.ts:104` failed `expected 1 to be +0` against the shipped
      binding; the new bench producer reported `1 backdrop(s) and 1 sheet(s) left after the host
      wrapper was removed` against the shipped `db-modal.ts`.
      *Green:* `sheet-teardown` `producers: 11, leaking: 0`; `npm run gate` **25 green, exit 0**;
      `npx vitest run` **645 tests**, up from 625.
- [x] **T12** Let a long press consume its own compatibility click — report 29, second mechanism.
      *Closed.* `touch-environment.ts:81-155`: the completed hold now swallows the next `mousedown`
      and the next `click` on the target in the capture phase, once each, clearing on the next
      `pointerdown`. The `preventDefault()` it replaces ran inside the timer, after `pointerdown`
      had finished dispatching, and consumed nothing. The swallow reuses the shape at
      `table-cell-gesture.ts:228-242` rather than adding a second one.
      *Red observed:* with the fixed file stashed, `touch-environment.test.ts` recorded the row's
      tap handler receiving `["mousedown", "click"]` after a completed hold.
      *Green:* `[]`, both consumed; `npx vitest run` **648 tests**, up from 645; `npm run gate`
      **25 green, exit 0**.
- [ ] **T13** The operator long-presses a row on iOS and sees no record sheet behind the menu.
      *Evidence to close:* the operator says so. The Chromium bench re-hit-tests the compatibility
      click onto the backdrop, so it cannot observe this either way; WebKit delivers it to the
      original target, which is where the defect lives.

- [x] **T14** Stop a panel rebuild replaying the sheet's entrance — reports 34-36, second pass.
      *Closed.* The overlay-stack resolver in `85ff504` was a real fix and was not the whole one:
      the operator still reported add-sort and add-condition misbehaving on 0.0.20. The remaining
      mechanism is `playSheetEntrance` (`mobile-bottom-sheet.ts`), which skips only when the node
      already carries `is-visible`. All four header panels rebuild by removing their node outright
      and building a fresh one — on every add, remove, toggle, and on any background `refresh()`
      that lands while they are open — so the replacement had never entered and replayed the whole
      rise from below the fold.
      *Red observed first*, driving the real renderers with a real touch on a 390x844 phone page:
      after one tap on "+ Add sort" the panel's top edge went **708 to 844 and back over ~280ms**;
      five taps at ONE coordinate 120ms apart added **2 of 5** rules on the sort sheet and **1 of 5**
      on the filter sheet, the strays landing on the grab bar, on a rule row's icon, and on a field
      dropdown the tap opened. Green after: deepest 711 and 699, **5 of 5** on both.
      *What isolates it:* the same five taps with the transition disabled added five before the fix.
      One variable, and it is the entrance.
      *Not a hang, and the report's word for it is still fair.* The main thread was never saturated
      — worst timer delay 0.1ms across the rapid taps, no page errors, one sheet and one backdrop
      throughout. What the operator meets is a surface that jumps out from under the thumb and a
      quarter-second after every edit in which the whole screen is tap-swallowing backdrop, so a tap
      anywhere closes the sheet mid-edit. That is the "add condition closed the filter sheet" row.
      *Closed by:* `carrySheetEntrance()` beside `playSheetEntrance`, called by all four panel
      renderers where they alone know a replacement node is a rebuild rather than an opening.
      *Guarded by:* four new `sheet-rebuild` cases driven by real touch, plus the control below.
- [x] **T15** A control that refuses the wrong fix.
      *Closed.* Deleting the entrance would pass both T14 checks and would be wrong — the sheet is
      supposed to rise when it OPENS. `sheet-rebuild` now asserts that a genuinely opening sheet is
      first seen at the viewport floor and settles above it (844 then 708 on an 844px screen). It
      passes on the shipped tree and on the fixed one, and **goes red when `playSheetEntrance` is
      ablated** — watched, not assumed: `the entrance no longer runs on an open (deepest 708)`.
      *Also fixed here, in the harness rather than the product:* the staging first accepted the
      first frames of an entrance as "settled", because two identical samples are what the start of
      a rise looks like too. Settling now means unmoving AND on screen, and the tracker takes its
      first sample synchronously rather than on the first frame — 830 against 844 for the same
      surface, which is the whole of the deepest point it exists to see.
- [ ] **T16** The operator adds a sort rule and a filter condition on the phone without the sheet
      jumping or closing.
      *Evidence to close:* the operator says so. The bench drives Chromium; it can prove the sheet
      holds still and that five taps at one point all land, and it cannot prove what a thumb on
      WebKit meets.

**Proposed and refuted, so it is not a task.** Pruning a registered sheet by its class as well as by
connectedness guards a state nothing can reach: `mobile-bottom-sheet.ts:48` is the only writer of the
class in `src/`, and `applySheetChrome(panel, false)` deregisters the panel on the same call. The
`scrimsLeft: 1` offered as its red comes from a bench whose orphan is classed and still on the body —
an open sheet, for which holding the backdrop up is correct. Reasoning and its three observations in
`goal.md`, 2026-09-02 second-mechanism entry.

## PHASE 6: WEBKIT RESEARCH — ADD CONDITION / ADD SORT FREEZE

- [x] **T14** Diagnose the post-entrance-fix Add condition / Add sort freeze on iOS WebKit —
      research only, no code change.
      *Closed by:* a converged `/deep:research` loop (lineage `codex-luna`, run id
      `1788547579619-slpzp3`), five iterations, new-information ratios `0.82, 0.63, 0.46, 0.24,
      0.04` against a `0.05` threshold, all five key questions dispositioned, 21 findings. Full
      synthesis at [`research/research.md`](research/research.md); source inventory at
      [`research/resource-map.md`](research/resource-map.md); raw loop evidence retained at
      `research/lineages/codex-luna/`.
      *Ranked mechanisms (repo fit, 5 = direct/high-risk):* (1) 5/5 synchronous
      `touchend`/synthetic-click into a destructive panel remove/recreate/refresh, crossing a
      stale-target generation boundary; (2) 4/5 VisualViewport/keyboard timing moving the
      body-portalled sheet while placement is still active; (3) 4/5 the new row's custom listbox
      focusing and `scrollIntoView`-ing its active option on open; (4) 3/5 document-capture outside
      dismissal racing the Add handoff; (5) 3/5 an Obsidian private host layer or z-index collision
      at the Add coordinates; lower-fit and ruled-out branches (native `<select>`, missing
      `transitionend`, passive listeners, global `touch-action:none`) are tabled in `research.md`
      §6 and its Eliminated Alternatives table.
      *Recommended preview trace:* one opt-in, generation-tagged diagnostic recording pointer/click
      identity and connectedness, panel-generation and teardown/mount order, focus/scroll targets
      and pre/post rects, VisualViewport/keyboard geometry, and hit-test winners at the Add
      coordinates — full event schema and branch classification (A lifecycle / B overlay /
      C viewport / D focus-scroll / E host-gesture) in `research.md` §8.
      *Spot-check:* 10 of the synthesis's citations (5 repository `[SOURCE:...]`, 5 external)
      verified in-runtime — 10/10 CONFIRMED, 0 discrepancies. Full verdicts:
      [`research/citation-spot-check.md`](research/citation-spot-check.md).
      *Scope:* no production code or spec changed by the research loop; no repository validation
      or generation tooling run during it. Does not close T10 or T13 — those remain the operator's
      device rows for the fixes already shipped in Phases 1-5.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION

Complete when T10, T13 and T16 close. Every other task is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- Scope and the harness blind spot: [`spec.md`](spec.md)
- Order and ADR-001: [`plan.md`](plan.md)
- The record sheet's equivalent fix: [`../016-sheet-drag-and-audit/goal.md`](../016-sheet-drag-and-audit/goal.md)
- iOS WebKit Add-condition/Add-sort freeze research: [`research/research.md`](research/research.md)
<!-- /ANCHOR:cross-refs -->
