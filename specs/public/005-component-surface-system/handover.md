---
title: "Session Handover: Component Surface System"
description: "Verified state after a session that withdrew more criteria than it closed, and the lens that made that possible."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system"
    last_updated_at: "2026-08-31T08:30:00Z"
    last_updated_by: "timeline-freeze-diagnosis"
    recent_action: "Timeline quadratic found, fixed, guarded; calendar measured clean; coverage 2 to 6 of 22"
    next_safe_action: "The 20-iteration deep review, then remediation, then the device check"
    blockers:
      - "The list needs virtualisation; at the operator shape it blocks 2.0-4.9s and the shape is LINEAR"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "028-remaining-freezes/goal.md"
      - "026-production-render-assertions/goal.md"
      - "024-list-view-freeze/acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 50
    open_questions:
      - "Does spec.md measure shipping and goal.md verification, or should they agree"
    answered_questions:
      - "The sheet's keyboard fallback is real and now measured, not merely argued"
      - "The list quadratic is NOT gone; the verdict came from a truncated row range"
      - "The calendar and timeline are two defects, not one: the timeline was quadratic, the calendar never was"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THIS STANDS

Verified from the tree, not remembered:

| | |
|---|---|
| Branch / version | `main` at 1.3.8, **46 commits this session, 0 unpushed** |
| Gate | `npm run gate` — **16 lanes green, exit 0**, read from `$?` |
| Placement harness | **233 of 236**, 3 red for a declared reason, exit 0 |
| Parent validation | `--strict` **Errors: 0, Warnings: 0** |
| Renderer coverage | **6 of 22**, raised from 2; every reported view now asserted |
| Operator-confirmed reports | **1 of 16**, unchanged all session |

**This session withdrew more criteria than it closed, and that is the result rather than a
setback.** Eleven completion figures went down, none went up.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. THE LENS — the single most transferable thing here

Two operator reports of surfaces still broken that this packet recorded as shipped and verified.
Both times the check was green because **the harness supplied the exact value the defect lived in**.

Earlier passes compared each criterion against harness output and closed the matches. That was
sound and structurally incapable of catching this, because the output itself was the problem. The
question that works is:

> **If this value came from the device instead of the harness, would the check still pass — and
> could it still fail?**

The supply inventory sits in `020-harness-fidelity-repair/acceptance-criteria.md` §4. Its live
items: variables the harness sets that the plugin never does, production actions replaced by
stubs, mounts that render a hand-written fixture rather than a renderer, and the absent host
stylesheet. Two inventory items were found stale during the pass and corrected — the pinned
divergent values have since been removed from the harness — so **re-derive it before trusting it.**

**What resists this, and is now decision D12:** a parity check comparing two independent producers
cannot be faked, because the harness would have to supply the same wrong answer twice. The one
phase that came through entirely sound is the one built that way.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. WHAT CHANGED, AND TWO THINGS I GOT WRONG

**Product fixes that landed, each with a control observed red first:** the touch-mode question
hoisted out of the row and card loops; the double rebuild on panel dismissal collapsed to one; the
sheet entrance made to actually run; the search panel clamped to the editing area rather than the
window (240–292px of overhang); numeric cells no longer printing a truncation of a value they
cannot read; and the selection bar docking on an inset the plugin measures.

**Instruments built:** a lane that constructs real `ListRenderer` and `TableRenderer` instances —
nothing did before, which is how a quadratic shipped past fourteen gates; the placement harness
repaired so one throwing check no longer destroys the other 205; a `--throttle` flag on the list
bench, without which its budget was unmeasurable; and a replay artifact that can now go stale.

**Two claims of mine that were wrong.**

*"The quadratic is genuinely gone."* It is not. The default bench matrix stops at 1,600 rows and
per-row cost climbs 0.0635 → 0.1714ms out to 12,800: **SUPERLINEAR**, exit 1 at 4,822ms. Every
LINEAR verdict came from a range that could not see it.

*A phone control reproducing −12px where −14px was recorded.* The control reverted one of two
edits and measured a tree that never shipped. The record was right.

**Since then: the timeline's freeze was found, and it was not the same bug as the calendar's.**
The two had been carried as one unknown because they were reported together. Measured separately
they behave oppositely. `renderTimelineEvent` asked whether the surface takes touch input once per
event, and that question reads the container's box — so every event re-laid-out everything appended
so far. Desktop, 21 cols, full fill, 400 to 6,400 rows: **SUPERLINEAR ×1.95 → LINEAR ×0.98,
8,547.9ms → 234.2ms**, with the DOM unchanged at 21,846 nodes and 3,840 bars. The calendar has no
such defect to find: its window is bounded, so 12,800 rows cost **30.3ms** over a constant 325
nodes, and the gate counts **zero** layout reads in its render. Looking for a render-cost defect in
the calendar is how the next session loses a day.

All four reported views are now constructed by the gate check, taking coverage **2 → 6 of 22**. The added
timeline scenario reads **964 layout reads against a bound of 8** on the pre-fix tree, and 5 after —
so the threshold that lane already had was correct all along and caught nothing only because
nothing pointed it at that renderer. Coverage, not calibration, was the gap.

**Five criteria in this packet would fail a correct implementation**, one of them introduced by a
specification rather than an implementation. Specifying a check is exactly as error-prone as
writing one.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. WHAT IS OWED, IN ORDER

1. **Re-run linearity on the full matrix** before anyone recloses the list phase. Do not reclose
   from a 1,600-row run.
2. **A 20-iteration deep review**, ordered and not yet started: ten on `cursor-grok-4.6-xhigh`
   through cli-cursor, ten on `gpt-5.6-luna` at `model_reasoning_effort=xhigh` through cli-codex,
   `--stop-policy=max-iterations`, spread across every phase touched. **The codex lane cannot run
   the placement harness** — its sandbox excludes Chrome, and it reports the gate as 13 green where
   it is 16. Findings from it shaped like "the gate is red" need checking here first.
3. ~~**Extend production-renderer coverage to board and gallery.**~~ **Done.** Coverage is **6 of
   22**: Calendar, Timeline, Board and Gallery were all added, twelve scenarios across both bags.
   The timeline scenario immediately caught a live quadratic at 964 layout reads against a bound
   of 8. Every view named in an operator report now has a production-renderer assertion; what is
   still uncovered is panels, cells and chrome.
4. **Read `--font-ui-medium` off a device.** One number closes or reddens the inline-edit alignment
   criterion, which passes at 0.9px against a 1px threshold on an inferred host value.
5. **The remaining specified-but-unbuilt checks**, listed per phase in each `goal.md`: a two-revert
   drag ablation, an `is-phone` width sweep, a fixture-parity run, and the phone arm of the
   dead-anchor pair.
<!-- /ANCHOR:next-session -->

---

<!-- ANCHOR:validation-checklist -->
## 5. ANSWERED BY THE OPERATOR, AND WHAT IS LEFT

Three of the four blockers are answered.

- **Row count and fill rate: 1,000-3,000 rows at 80-100% fill.** That settles the list. At 21
  columns and phone-class throttle the budget breaks at **1,300 rows** (2,022.9ms) and 3,000 rows
  cost **4,908.6ms**. The shape is LINEAR ×1.06, and 3,722.5ms of that is layout over 225,007
  nodes — so **virtualisation is the only lever left**, and no further loop work reaches it.
- **The note body stays editable**, with the write path required correct first. It already is:
  `updateNoteBody` runs inside the per-file write queue and reads *inside* the queued operation, so
  no snapshot can straddle a preceding write. Six tests cover it, including a negative control that
  reports an overlap when the same writes bypass the queue. The old blocker text — "a body writer
  would sit outside it" — described the risk when raised, not the shipped state.
- **The scope exclusion means the formula editor's output number format only.** Report 7 is
  therefore in scope, and `019` can close against it rather than escalating.
- **Device verification** remains, last, after the review and its remediation. Still 1 of 16.
<!-- /ANCHOR:validation-checklist -->

---

<!-- ANCHOR:when-to-use -->
## 6. TRAPS, AND A KNOWN DIVERGENCE

Read `goal.md`'s LOG for the full set. The ones that cost time here:

- A pipe makes `$?` the pipe's status. Read exit codes directly.
- `validate.sh` on a phase parent recurses; take the **first** `Summary:` line.
- Regenerate metadata after any spec-doc edit or the fingerprint check fails.
- Captures churn ~12 files on an identical rerun. Read any diff against that floor.
- A negative control must restore **the whole** prior state. Reverting one of two edits produces a
  real number for a tree that never existed.
- Running the shared gate while another agent edits the tree describes neither state.
- **A windowed view renders nothing when its anchor is unpinned, and reports it as speed.** The
  calendar and timeline both anchor on *today*. A fixture dated elsewhere draws an empty view very
  fast: the first timeline bench run reported a clean LINEAR ×0.61 over **zero** event bars. Pin
  `timelineAnchor`, `calendarMonth` and `calendarDay`, and read the drawn-item count before the
  verdict — a per-item bound is satisfied trivially by having no items.
- **A missing shim method reads as a plugin defect.** The day-scale calendar threw `line.show is
  not a function` — Obsidian patches `show`/`hide` onto `HTMLElement` and the shim lacked them.
  Check which side the gap is on before filing it.

**The divergence to decide.** Nine phases carry different `completion_pct` in `spec.md` and
`goal.md` — 010, 011, 012, 014, 015, 016, 017, 018, 019. The verification pass lowered the goal
figures and deliberately left the spec ones, on the argument that `spec.md` measures shipping while
the pass measured verification. That is defensible and it is not recorded anywhere as policy. Either
write it down or reconcile them; leaving two numbers per phase is how a document starts lying.
<!-- /ANCHOR:when-to-use -->
