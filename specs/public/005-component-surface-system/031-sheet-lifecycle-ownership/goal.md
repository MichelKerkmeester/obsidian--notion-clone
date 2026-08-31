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
    packet_pointer: "public/005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-08-31T20:30:00Z"
    last_updated_by: "phase-implementer"
    recent_action: "Header panels hold their own panel; portalled sheets now reach the overlay stack"
    next_safe_action: "T7, velocity dismissal — a flick should dismiss, a slow short drag should not"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-goal"
      parent_session_id: null
    completion_pct: 50
    open_questions:
      - "Microtask prune or explicit teardown for the live-sheet set"
    answered_questions:
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
      *Correction:* the previous commit recorded this phase at "2 of 6 criteria" and
      `completion_pct: 33` while only ONE criterion was ticked. That was a criterion ahead of the
      evidence, counted from tasks (T1, T2) against a denominator of criteria. The figure is
      honest as of this line and not before it.
- [x] A phone view sheet is in the overlay stack. Today `dismissPanel` returns false.
      **Met.** Measured in one case against a real open sheet: the container selector finds
      nothing, the retained reference finds the sheet, and `dismissPanel(panel, "programmatic")`
      returns true. The first clause is what keeps it from passing vacuously — if both lookups
      found the panel, the sheet never portalled.
- [ ] No sheet draws an unwired handle. **Fix landed, criterion not met.** `DbModal` now wires the
      bar it draws, and `hasSheetDrag()` makes the property measurable — but only the positioner
      path is asserted, not `DbModal` itself, which cannot be constructed outside Obsidian. This
      stays open because it asks for an invariant, and what exists is two examples of it holding.
- [ ] A flick dismisses.
- [ ] The operator opens and closes each sheet on device without the app locking up. **Only the
      operator closes this.**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

Opened from a research pass that verified each finding against the shipped 1.3.9 bundle rather than
source alone. Findings 1, 2 and 3 are now fixed and gated; 4, 5 and 6 are untouched, and none of the six is
device-confirmed.

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
