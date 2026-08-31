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
    last_updated_at: "2026-08-31T07:20:00Z"
    last_updated_by: "session-handover"
    recent_action: "Bar fixed and proven; 13 ticks withdrawn under a device-reality lens"
    next_safe_action: "Re-run linearity on the full matrix before reclosing the list phase"
    blockers:
      - "Operator's row count AND fill rate; the freeze depends on both"
      - "Display-only versus editable note body; editable risks data loss"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "022-selection-bar-keyboard-docking/acceptance-criteria.md"
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
| Gate | `npm run gate` — **16 lanes green, exit 0** |
| Placement harness | **233 of 236**, 3 red for a declared reason, exit 0 |
| Parent validation | `--strict` **Errors: 0, Warnings: 0** |
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
3. **Extend production-renderer coverage to board and gallery** — 2 of 22 renderers are covered and
   the four uncovered are the views reported freezing.
4. **Read `--font-ui-medium` off a device.** One number closes or reddens the inline-edit alignment
   criterion, which passes at 0.9px against a 1px threshold on an inferred host value.
5. **The remaining specified-but-unbuilt checks**, listed per phase in each `goal.md`: a two-revert
   drag ablation, an `is-phone` width sweep, a fixture-parity run, and the phone arm of the
   dead-anchor pair.
<!-- /ANCHOR:next-session -->

---

<!-- ANCHOR:validation-checklist -->
## 5. BLOCKED ON THE OPERATOR

- **Row count *and* fill rate.** Not row count alone: at full fill the budget breaks near 1,300
  rows, while 1,600 sparsely-filled rows clear it comfortably. An earlier note putting the crossing
  near 2,300 rows never stated the fill it assumed.
- **Display-only or editable note body.** Editable risks data loss — the per-file write queue's own
  comment says concurrent frontmatter writes corrupt each other, and a body writer would sit
  outside it.
- **The scope exclusion** on output number format: does it mean the formula editor's, or number
  format generally? Both documents escalated it rather than picking.
- **Device verification**, last, after the review and its remediation.
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

**The divergence to decide.** Nine phases carry different `completion_pct` in `spec.md` and
`goal.md` — 010, 011, 012, 014, 015, 016, 017, 018, 019. The verification pass lowered the goal
figures and deliberately left the spec ones, on the argument that `spec.md` measures shipping while
the pass measured verification. That is defensible and it is not recorded anywhere as policy. Either
write it down or reconcile them; leaving two numbers per phase is how a document starts lying.
<!-- /ANCHOR:when-to-use -->
