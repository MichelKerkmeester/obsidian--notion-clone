---
title: "Goal: Sheet Lifecycle Ownership"
description: "What would make this phase worth having done, and the criteria that decide it."
trigger_phrases:
  - "031 goal"
  - "sheet lifecycle goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-09-02T20:10:00Z"
    last_updated_by: "report-29-verifier"
    recent_action: "Report 29 fix landed: modal close tears the sheet chrome down"
    next_safe_action: "The operator runs the menu-then-modal sequence on iOS, twice"
    blockers:
      - "Nothing here is confirmed on the operator's device"
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-goal"
      parent_session_id: null
    completion_pct: 75
    open_questions:
      - "Does Obsidian's Modal.close() detach containerEl alone or also modalEl"
    answered_questions:
      - "Report 29: the DbModal body-portal orphan pins the scrim for the whole session"
      - "Neither: a MutationObserver prunes the per-document live-sheet set on removal"
      - "The two drag failures are unrelated; fixing one does not fix the other"
      - "The harness could not see the scrim leak because it cleaned the leak up to keep testing"
---
# Goal: Sheet Lifecycle Ownership

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A sheet that opens can always be closed, always be dragged, and never leaves anything
behind — and that is true by construction rather than by every caller remembering.

**The root cause is one missing thing.** Mount is `applySheetChrome(el, true)` and teardown is
`applySheetChrome(el, false)`: a symmetric-call contract whose "off" half is almost never called.
Six call sites in `src/`, and **only two of them ever pass `false`** — the owned menu and the record
panel. Every other producer mounts and never tears down. No type, test or review catches it, because the "on" call looks complete on its own. Every
defect in this phase is a consequence of that shape.

### Decisions

| ID | Decision |
|----|----------|
| D1 | A disposer is harder to forget than a symmetric call. Mount returns teardown. |
| D2 | Back the disposer with a live-sheet set, so a caller that only removes its element is still correct. |
| D3 | The two drag failures are **separate**. Two rows, two pieces of evidence, never one fix claimed for both. |
| D4 | Never draw a handle that is not wired. A visible dead affordance is worse than none. |
| D5 | Assert absence of **both** scrim and sheet. Checking only the scrim would pass on a leaked panel. |
| D6 | Adopt the disposer, not the whole library shape. No Root context, no snap-point machine — nothing here needs them. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] Closing any sheet family leaves no scrim and no sheet on the body, proven by a producer-parity
      check that **passes for the owned menu and fails for the panel families before the fix.**
      **Met.** The check was observed red with exactly that asymmetry, and red again when the whole
      pre-fix file was restored as a control.
- [x] The group sheet drags after a re-render: handle present, 120px drag dismisses. Today 0.0px.
      **Met.** Both halves measured on the real `ToolbarRenderer`, not on a model of it: the bar is
      present after the real rebuild, and a real 120px pointer drag dismisses the rebuilt sheet.
      Observed red first on both — pre-fix the bar went `after: false` and the drag could not be
      staged at all.
      *Correction 1:* the commit that ticked this recorded "2 of 6 criteria" and
      `completion_pct: 83` while only ONE criterion was ticked. That was a criterion ahead of the
      evidence, counted from tasks (T1, T2) against a denominator of criteria.
      *Correction 2, and the worse one:* the drag half of this criterion was ticked on a
      measurement that was not measuring the drag. The sheet rises from below the fold, and the
      harness read the bar's box the instant it opened — putting it at y=860 in an 844px viewport.
      Every press missed, the overlay stack dismissed the sheet as an OUTSIDE press, and the case
      reported a successful drag. A zero-distance tap "dismissing" the sheet is what exposed it.
      The harness now waits for the sheet to rise and refuses to press a bar that is not under the
      cursor, and that tap is a permanent case. Re-measured on that footing, the 120px drag really
      does dismiss — but it did not become evidence until this line.
- [x] A phone view sheet is in the overlay stack. Today `dismissPanel` returns false.
      **Met.** Measured in one case against a real open sheet: the container selector finds
      nothing, the retained reference finds the sheet, and `dismissPanel(panel, "programmatic")`
      returns true. The first clause is what keeps it from passing vacuously — if both lookups
      found the panel, the sheet never portalled.
- [x] No sheet draws an unwired handle. **Met, by construction.** The gesture now draws the bar and
      chrome re-creates one only where a gesture is already attached, so an unwired bar is
      unrepresentable rather than merely discouraged. Verified by removing that guard: the
      guarantee goes red.
- [x] A flick dismisses. **Met, at a threshold taken from measured speeds** — deliberate drag
      ~0.08 px/ms, real flick ~1.18, frame-paced brisk drag ~1.0, so the line sits at 0.8 with a
      24px floor and a 100ms staleness guard. Four real-pointer cases: distance drag dismisses,
      fast 40px flick dismisses, slow 40px springs back, a tap does nothing. The two harness
      gestures that blocked the first attempt were themselves unrealistically fast and were paced,
      not argued away.
- [ ] The operator opens and closes each sheet on device without the app locking up. **Only the
      operator closes this.**
- [x] A sheet producer whose host detaches a wrapper other than the registered node leaves no scrim
      on the body: the teardown lane reports leaking 0 for it. **Met.** `sheet-teardown.json` now
      carries `producers: 11, leaking: 0`. Observed red first, by stashing the new `db-modal.ts` and
      re-running the lane against the shipped base — **was: `1 backdrop(s) and 1 sheet(s) left after
      the host wrapper was removed`, lane `FAIL — 1 producer(s) leave the body dirty`.**
- [ ] The operator opens and closes an owned-menu sheet, then a confirm/picker modal, on iOS from a
      fresh start, twice, and the app stays responsive.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

Opened from a research pass that verified each finding against the shipped 1.3.9 bundle rather than
source alone. Findings 1, 2 and 3 are now fixed and gated; 4, 5 and 6 are untouched, and none of the six is
device-confirmed.

*2026-09-02 audit: that sentence stopped being true of 4 and 6.* Both landed after it was written,
which the criteria above already record and this paragraph did not. On disk: `hasSheetDrag`
(`src/views/mobile-bottom-sheet.ts:342`) is the guard that makes an unwired bar unrepresentable,
closing #4, and the flick threshold shipped with it, closing #6. **#5 is the one still untouched**,
and deliberately: `publishKeyboardInset` writes `--db-keyboard-inset` on the container
(`src/views/popover-position.ts:757-782`), which is the container-wide write the finding names —
kept there for correctness, because a `position: fixed` descendant has to inherit it. The sizing
below still holds, so the cost is unchanged rather than removed. Five of six criteria are met, none
of them device-confirmed, and the sixth is the operator's to close.

### The six findings, ranked as delivered

| # | Defect | Mechanism | Cost |
|---|--------|-----------|------|
| 1 | Report 27, the freeze | Scrim and sometimes the sheet orphaned on `document.body` at close | ~20 lines |
| 2 | Report 26, group sheet | `panel.empty()` destroys the grab bar; chrome never re-asserted | 1 line |
| 3 | Report 26, view sheet | Portalled panel never registers with the overlay stack | ~5 lines |
| 4 | Report 26, "some sheets" | 16 `DbModal` sheets draw a handle wired to nothing | ~10 lines |
| 5 | Report 27, jank | A keyboard inset written on the whole container, not the one bar that reads it | 2 lines |
| 6 | Report 26, partial | 96px distance-only dismissal; a flick does nothing | ~15 lines |

### #3 was estimated at ~5 lines and was not

The estimate assumed one missing registration. The cause underneath it is that a phone sheet is
portalled onto the body, so **every** container-scoped lookup for these panels misses — the
registration was one victim, and each renderer's own cleanup was another. Reproduced on a phone
viewport with the real renderer: reopening left two panels on the body and closing removed neither,
with the backdrop still up. Desktop was clean throughout, which is why the desktop-only defect
survived every desktop pass.

So #3 was two defects sharing a mechanism, and the second was the more serious: an orphaned panel
stays *connected*, so the finding-1 watcher correctly holds the backdrop up for what it can only
read as an open sheet. Finding 1's fix does not rescue this case, and a reading that stopped at
"the backdrop leak is fixed" would have shipped the freeze.

### Honest sizing on #5

The container-wide custom property is real and was measured — 0.30ms at 901 nodes rising to 12.89ms
at 36,001, and 55ms at 4× throttle, against a flat 0.005ms when written on the leaf. Cost is linear
in subtree size, which makes it size-dependent and therefore intermittent.

**But three dropped frames is not a multi-second hang.** It is cheap jank worth removing, and it is
*not* the freeze. The freeze is #1. Recording the distinction because the intermittency made the
variable a tempting explanation, and adopting it would have closed report 27 against the wrong
mechanism.

### What was checked and ruled out

Three of the five patterns borrowed from web drawer libraries do not apply here and are recorded so
nobody re-imports them: over-drag damping (the sheet cannot move upward at all), a scroll-position
predicate with a lockout (the gesture can only start on the grab target, so it can never begin on
scrollable content), and ignoring subsequent touches (already implemented). The 48dp handle standard
is already dispositioned as an accepted operator shortfall — do not reopen it.

### Report 29: a 1.4.0 device report widens the symptom set

**2026-09-02.** A new operator report against release **1.4.0** — the first device evidence this
program has had since 1.3.1 — names three symptoms on the same axis this phase already owns: the
drag handle does nothing, some sheets cannot be closed, and one sheet appears, disappears
immediately, then freezes the app. OS and which sheets are unknown, both asked. Suspect range
1.3.1..HEAD in `mobile-bottom-sheet.ts`, `popover-position.ts`, `record-detail-panel.ts` and
`owned-menu.ts`. Recorded as an open question above; not yet tested against the drag-handle or
scrim-leak mechanisms already found for reports 26, 27 and #5.
<!-- /ANCHOR:log -->

### The fix, and one thing the check taught me about itself

The backdrop is now a property of whether any sheet is still **in the document**, not of whether a
sheet class is findable in the DOM. A per-document set of live sheets plus a removal watcher means
the last sheet out takes the backdrop with it, however it leaves — so the producers that never call
teardown are correct without being changed.

**Two corrections while building it, both mine.** Registration first went in after the body move,
which skipped the early-return branch a body-mounted surface takes — so the owned menu, the one
producer that behaves, would have been invisible to the watcher and could have had its backdrop
pulled while open. And the compounding case first re-attached its "leaked" panel to the body, which
makes it an **open** sheet: the backdrop staying up there is correct, so the test asserted the
opposite of the truth. A detached leak is what `.remove()` actually produces, and the case now
models that.

The watcher is asynchronous, so the check awaits a microtask and a frame before reading. That is the
real budget — a backdrop still present after a rendered frame is one the user has seen.

### 2026-09-02: Report 29 root-caused (read-only Opus debug pass)

A fresh read-only Opus debugger closed the open question above for report 29 (iOS, every sheet
family, keyboard closed, release 1.4.0) with a code-read chain, no bench run. Full diagnosis:
`specs/005-component-surface-system/031-sheet-lifecycle-ownership/` context; source text carried
verbatim into this entry.

**Primary (high). `DbModal` portals `modalEl` out of `.modal-container` and never takes the chrome
down.** `db-modal.ts:64` runs `applyPresentation()` in the constructor, not `onOpen`; `:72` calls
`applySheetChrome(this.modalEl, asSheet)`, true on iOS for ~15 modals. `mobile-bottom-sheet.ts:59`
`setSheetMount` creates `.db-mobile-sheet-scrim` on `body` at `:146` (before `open()` runs), adds
`modalEl` to the per-document `liveSheets` set at `:150`, and at `:179` does
`doc.body.appendChild(panel)` — tearing the modal body out of `.modal-container`. `DbModal` has no
`onClose`; nothing calls `applySheetChrome(this.modalEl, false)`. Obsidian's `Modal.close()` detaches
`containerEl`, but `modalEl` is no longer inside it, so the sheet node stays on `body` forever.
`mobile-bottom-sheet.ts:250` `pruneSheets()` reads that orphan as `isConnected` → true forever →
`:294` `setScrim(..., false)` returns early: **the full-screen scrim can never be removed again for
the life of the session, by any producer of any family.**

*Provenance:* `f7ce99d` (2026-08-29 11:48) wired `applySheetChrome` into the `DbModal` constructor
while it was pure presentation; `4bd11b83` (same day, 23:17) moved the body portal *inside*
`applySheetChrome`. The modal path silently inherited a portal nobody designed for it.

*Symptom mapping:* open→vanish→freeze is the modal showing from our sheet CSS, Obsidian appending an
empty `.modal-container` + dimmer over it, then only Obsidian's chrome going on close — the pinned
scrim is the freeze. No-way-to-close and the dead drag handle are the same orphan: the leftover
`.modal` (`styles.css:188-193`, `position:fixed`, `z-index:1000`) sits over the bottom of the screen
taking presses meant for any sheet opened before it, including its grab band.

**Why every gate stayed green:** `tools/live/sheet-teardown-harness.ts:75` mounts a synthetic `div`;
the one producer whose host detaches a *different node than the one registered* is untested, because
`tools/storybook/obsidian-stub.mjs:90` throws on `Modal` by design. `sheet-teardown.json`
(`producers: 10, leaking: 0`) is therefore not evidence about `DbModal`.

**Secondary (medium).** An anchored sheet can hide itself one frame after opening:
`popover-position.ts:274-275` calls `place()` then `requestAnimationFrame(place)`; `:195-204`'s
`place()` sets `visibility:hidden` and tears the loop down when `anchorEl` is disconnected. A
re-render swapping the toolbar button between those two calls makes the sheet appear and vanish
inside one frame. Explains the open→vanish half only for filter/sort/add-view — menus and modals have
no anchor and cannot reach this branch.

**Tertiary (low).** `mobile-bottom-sheet.ts:461` binds `pointercancel` to `onUp`; iOS fires it
mid-gesture, and `onUp` evaluates `shouldFlickDismiss` (`:376`) against the last *move* sample, so a
sheet can close on a gesture the system took away. An unwanted close, not a dead handle.

**Rejected, with counter-evidence:** scrim-above-sheet stacking (token block gives the scrim 999
against the sheet's 1000 — order is correct); a re-entering `MutationObserver` (the removal record
dies with the same disconnect that triggers it — terminates); today's product wave swallowing the
handle (the only `pointer-events`/`z-index` edits in `8dd7008` touch unrelated selectors inside
`.note-database-container`; `1f9d7da` and `a5c779e` touch neither property); keyboard/visualViewport
dismissal (operator reports the keyboard closed, and `record-detail-panel.ts:250` returns early on a
width-preserving resize regardless).

**The one device sequence that discriminates:** from a fresh app start, long-press a row to open an
owned-menu sheet, close it, confirm the app is still responsive, then open any confirm/picker modal
(delete database, create property) and close it. Alive after the menu and dead from the modal onward
confirms the primary cause and rules the secondary and tertiary out as noise.

**Status:** the fix (an `onClose()` on `DbModal` that releases the drag and tears down the chrome
while `containerEl` is still connected, plus moving `applyPresentation()` into `onOpen()`) is
dispatched to codex (gpt-5.6-luna xhigh) and will be verified in-runtime — bench (`sheet-teardown`
red-to-green on a new detached-host-wrapper producer, `sheet-rebuild` unchanged, the flick threshold
test unchanged) and the device sequence above, twice, with the app left responsive both times.

### 2026-09-02: Report 29 fix landed, and who wrote which half

The codex lane (gpt-5.6-luna xhigh) that the entry above dispatched **hit its usage limit mid-run
and returned no report.** It left its edits uncommitted in the tree. A fresh in-runtime verifier
read the whole diff, judged each of the four scope items, finished what was missing and proved the
result on the bench. Recorded because the provenance matters: no part of this change arrived with a
completion claim behind it.

**What codex had finished.** The primary fix, complete and correct: `db-modal.ts:62-70` moves
`applyPresentation()` into `onOpen()` and adds an `onClose()` that releases the drag and calls
`applySheetChrome(this.modalEl, false)` while the container is still connected. The subclass sweep
is exhaustive — all twenty `extends DbModal` classes call `super.onOpen()`/`super.onClose()` on
every override, verified by scanning each definition against its super call. The edits to `main.ts`,
`settings.ts` and `chart-renderer.ts` are that sweep and not drift: each holds a `DbModal` subclass
(`CsvMarkdownImportModal`, `TrashManagerModal` and its anonymous restore modal,
`ChartDrilldownModal`). The anchored-sheet deferral in `popover-position.ts` was mechanically sound.
Nothing was reverted.

**What it had not.** The tertiary fix was **absent from the tree**: `pointercancel` was still bound
to the dismissal handler, and only a blank line had been removed. The unit case codex wrote for it
was therefore sitting red in the suite — which made the red free to observe rather than something to
stage: `expected 1 to be +0` at `sheet-flick.test.ts:104`, the sheet closing on a gesture iOS took
away. Routing cancel to a handler that only calls `reset()` would have been the obvious fix and the
wrong one — `reset()` does not clear `pointerId`, so every later press would fail the already-tracking
guard and the grab handle would be permanently dead, which is the symptom being fixed. The cancel
path clears the id as well, and the test now asserts a second drag still dismisses after a cancel.

**What was wrong.** The bench producer called `DbModal.prototype.onClose.call(...)` unguarded, so
against the shipped base — which has no `onClose` — the lane would have died on a `TypeError`
instead of reporting a leak. A crash is not a red. The call is now guarded, and the absence of the
hook is what the producer reports: **was `1 backdrop(s) and 1 sheet(s) left after the host wrapper
was removed`, lane `FAIL — 1 producer(s) leave the body dirty`; now `producers: 11, leaking: 0`.**
The comments were also repaired: the deferral rationale sat in the wrong function, a paragraph
deleted from `popover-position.ts` took the durable why with it, and a dangling `//` was left behind.

**Evidence.** `tsc` 0, `vitest` 645 passed, `lint:tools` 0, `scan-comments` 0, `sheet-teardown`
11 producers 0 leaking, `sheet-rebuild` `barsLost: 0`, `storybook:placement` 385/386, `replay` 8/8,
and the whole gate `PASS — 25 green, 0 red` at exit 0. Both device rows above stay open: nothing
here is confirmed on the operator's phone, and the bench says so itself — no Obsidian host is
constructed, so it measures the chrome contract rather than any caller's real lifecycle.
