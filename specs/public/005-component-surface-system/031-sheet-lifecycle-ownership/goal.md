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
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from six ranked findings, each located in the shipped tree"
    next_safe_action: "Fix the orphaned scrim first; it is what a user experiences as a freeze"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-goal"
      parent_session_id: null
    completion_pct: 0
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

- [ ] Closing any sheet family leaves no scrim and no sheet on the body, proven by a producer-parity
      check that **passes for the owned menu and fails for the panel families before the fix.**
- [ ] The group sheet drags after a re-render: handle present, 120px drag dismisses. Today 0.0px.
- [ ] A phone view sheet is in the overlay stack. Today `dismissPanel` returns false.
- [ ] No sheet draws an unwired handle.
- [ ] A flick dismisses.
- [ ] The operator opens and closes each sheet on device without the app locking up. **Only the
      operator closes this.**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Nothing has started.** Opened from a research pass that verified each finding against the shipped
1.3.9 bundle rather than source alone.

### The six findings, ranked as delivered

| # | Defect | Mechanism | Cost |
|---|--------|-----------|------|
| 1 | Report 27, the freeze | Scrim and sometimes the sheet orphaned on `document.body` at close | ~20 lines |
| 2 | Report 26, group sheet | `panel.empty()` destroys the grab bar; chrome never re-asserted | 1 line |
| 3 | Report 26, view sheet | Portalled panel never registers with the overlay stack | ~5 lines |
| 4 | Report 26, "some sheets" | 16 `DbModal` sheets draw a handle wired to nothing | ~10 lines |
| 5 | Report 27, jank | A keyboard inset written on the whole container, not the one bar that reads it | 2 lines |
| 6 | Report 26, partial | 96px distance-only dismissal; a flick does nothing | ~15 lines |

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
