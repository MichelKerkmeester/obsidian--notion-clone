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
    recent_action: "Deep review ran and returned FAIL; its fifteen findings are now recorded here"
    next_safe_action: "031 T1: build the producer-parity check and observe it failing on the panel families"
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
| Operator report disposition | **1 confirmed, 15 deferred with terms recorded** (`roadmap.md` §4A). Confirmed-on-device is still **1 of 16** |

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
2. ~~**A 20-iteration deep review**, ordered and not yet started~~ — **it ran, and it returned
   FAIL.** `review/lineages/cursor-grok46-xhigh-fast/review-report.md`: verdict **FAIL**,
   `release-blocking`, **P0=1, P1=7, P2=7**, stop reason `max-iterations` at 10 of 10, generated
   2026-08-31T12:21Z against **1.3.9** — the release the device pass exists to test. The fifteen
   findings are listed in §7 below.

   **Two honesty notes about that run, both from its own artifacts.** The fan-out reported
   `succeeded: 0, failed: 2`: containment rejected both lineages, and their reports survived
   anyway. And the codex lane's `invocation-metadata.json` carries
   `"invocationFingerprint": "rebound-from-prior-complete-lineage"` — it is a rebound copy of an
   earlier run, not a second fresh opinion. So **D4 is satisfied by one lane, not two**, and a
   genuinely independent second reviewer is still owed.

   The original order, for whoever re-runs it: ten on `cursor-grok-4.6-xhigh`
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

---

<!-- ANCHOR:review-findings -->
## 7. THE DEEP REVIEW'S FIFTEEN FINDINGS

Recorded from the lineage's registry rather than summarised from memory. **None is fixed.**

| ID | Sev | Where | What |
|----|-----|-------|------|
| F001 | **P0** | `board-renderer.ts:971` | Non-files cover fields open `javascript:`/`data:` targets via `window.open` |
| F002 | P1 | `database-view.ts:11484` | Sort and filter mutations still destroy and rebuild every view |
| F003 | P1 | `000/spec.md:59` | Child 000 still specifies the deleted `openSurface` as the create path |
| F004 | P1 | `spec.md:69` | Parent phase map is incomplete and under-counts folders |
| F005 | P1 | `009/implementation-summary.md:48` | 009 never drove the running Obsidian, so the circular harness remains in force |
| F006 | P1 | `004/checklist.md:31` | Completion marks and parent evidence missing or unchecked |
| F007 | P1 | `spec.md:133` | Parent lists 006 Planned while the child is in progress |
| F013 | P1 | `surface-contract.ts:224` | `SURFACE_REGISTRY` names five producers and omits live panels |
| F008 | P2 | `spec.md:259` | Parent `styles.css` length is stale |
| F009 | P2 | `028/spec.md:53` | 028 cites refresh at a line it no longer occupies |
| F010 | P2 | `board-renderer.ts:1409` | External `window.open` calls omit `noopener` |
| F011 | P2 | `spec.md:235` | Parent still narrates the deleted factory as the overlay sequence |
| F012 | P2 | `spec.md:157` | Parent says 010-017 lack `plan.md` |
| F014 | P2 | `spec.md:132` | Parent still labels 004 Contested after the roadmap resolved it |
| F015 | P2 | `popover-position.ts:177` | Still documents `openSurface.place()` after the factory was deleted |

**Eleven of fifteen are documentation drift in this packet's own files.** That is the review's
sharpest result and it is uncomfortable: the packet that exists to stop untrue completion claims is
itself the largest source of untrue statements found.

**On F001's severity.** A fresh reviewer checked it and found three mitigations the finding never
weighed: the victim must configure the attacker-controlled key as the cover field; the cover's
`onerror` removes the clickable element when a `javascript:` target fails to load; and top-level
`javascript:` navigation is inert in Chromium. The residual real case is a valid
`data:image/png;base64,…` ending in an image extension. It is a real defect worth fixing — and
`cover-image.test.ts` currently pins the vulnerable behaviour as intended, so a fix rewrites tests
too. Recorded as **disputed severity**, not adopted at P0 on one lane's label.
<!-- /ANCHOR:review-findings -->

---

<!-- ANCHOR:phase-map -->
## 8. WHERE EVERY FINDING NOW LIVES

Nothing from the research, the review or the audit is carried in conversation. Each has an owning
phase, and — after a fresh reviewer found three rows that had prose but no task — each now has a
criterion or a task that can actually close.

**The correction is worth keeping visible.** The first version of this map claimed ownership for
026, 027 and 028 on the strength of a paragraph in a LOG. A reader following the map to F002 would
have found a folder with no requirement, no task and no criterion, and a ticked row that explicitly
disclaims the cost F002 is about. Prose in a log is a note; it is not an owner.

| Source | Finding | Phase |
|---|---|---|
| Research | Orphaned scrim; both drag causes; dead modal handles; velocity dismissal; the disposer | **031** (new) |
| Review F001, F010 | Cover targets open any URL scheme; missing `noopener` | **032** (new) |
| Directive priority 2 | List still blocks 2.0-4.9s; layout over node count | **033** (new) |
| Review F003-F009, F011-F012, F014-F015 | Eleven untrue statements in this packet's own documents | **034** (new) |
| Audit | The table is the only covered renderer with no layout-read bound | 026 |
| Report 28 | More-tools dropdown alignment | 027 |
| Review F002 | Sort and filter still rebuild every view | 028 |
| Operator | Gallery deprecation | 030 |

**Start at 031 T1.** It is the producer-parity check, and it must be **observed failing** on the
panel families before any fix — a check that passes everywhere beforehand is not discriminating, and
this packet has shipped that mistake before.

**Review F013** — `SURFACE_REGISTRY` names five producers and omits live panels — has no owner yet.
It is a contract-truth finding about code rather than docs, and it plausibly belongs with 031's
disposer work once that lands. Recorded as unassigned rather than silently filed.
<!-- /ANCHOR:phase-map -->
