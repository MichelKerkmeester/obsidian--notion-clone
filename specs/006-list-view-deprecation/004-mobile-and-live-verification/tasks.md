---
title: "Task Breakdown: Phase 004 — Mobile and Live Verification"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Phone targets, focus rings, the two deferred guards in separate commits, and the operator's device check."
trigger_phrases:
  - "006 phase 004 tasks"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Task Breakdown: Phase 004 — Mobile and Live Verification

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[ ]` not started · `[~]` in progress · `[x]` closed with evidence
- **P0** blocks the phase · **P1** required for the phase to be complete · **P2** may defer, with the
  deferral recorded
- Task ids continue the parent's `T6.x` series so cross-references in the packet stay valid.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] **T6.0 · P0** — Confirm the `styles.css` lane is **free** and this phase does not need it.
      *Evidence:* `lane:check` free. Phone rules belonged to 002.
- [ ] **T6.0a · P0** — Confirm phases 001, 002 and 003 have landed.
      *Evidence:* their checklists closed. `AC-26` is a check on the whole packet.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage B — phone layout and touch targets

- [ ] **T6.1 · P0** — Touch targets at phone width, including the group toggle and the row checkbox.
      *Evidence:* `AC-24` — at least 44 by 44 CSS px. Negative control: shrink the viewport further;
      the box holds.
- [ ] **T6.1a · P0** — Confirm sorting stays reachable at phone width through the toolbar, since
      column headers, resize and drag-to-reorder are absent by the existing touch predicate.
      *Evidence:* a sort applied at phone width.
- [ ] **T6.1b · P1** — Record the justification for every phone number in this phase.
      *Evidence:* platform guidance and our own measurement, cited. **No capture may be cited** — all
      four primary captures are wide desktop.

### Stage C — focus rings

- [ ] **T6.2 · P0** — Focus ring visible on every interactive element the packet introduced,
      implemented as `box-shadow`.
      *Evidence:* `AC-25` — visible, and no bare `outline: none`. Negative control: remove the ring;
      the check fails.

### Stage D — the external-row-patch guard

- [ ] **T6.3 · P1** — Extend the external-row-patch fast path to the list. **Own commit.**
      *Evidence:* a patch applies without a full refresh.
- [ ] **T6.3a · P0** — The both-or-neither rule, explicitly tested: two groups, one collapsed, an
      external row change.
      *Evidence:* the patch applies to both or refuses. **It must not apply to one.** A partial
      application is worse than a full refresh because it looks correct.

### Stage E — the optimistic-update guard

- [ ] **T6.4 · P2** — Re-decide whether the optimistic update extends to the list's title cell, now
      that the cell is the grid's title cell. **Own commit.**
      *Evidence:* Q-P4-01 answered in this folder, with the reason. Deferred from 001 as a behaviour
      question; the thing it concerns has changed since, so it is re-decided rather than inherited.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] **T6.5 · P0** — Final recapture review across the packet, and the capture manifest.
      *Evidence:* manifest exit 0, and a named human's review.
- [ ] **T6.6 · P0** — Re-run the bench at the end of the packet.
      *Evidence:* `NFR-01` still within 20 percent of the 000 table baseline.
- [ ] **T6.7 · P0** — Re-run phase 000's two tripwires against the final tree.
      *Evidence:* both pass. Nothing across four phases converted a view-semantic guard.
- [ ] **T6.8 · P0** — **Device verification.** The operator opens the plugin and confirms the list
      view changed.
      *Evidence:* `AC-26` — the operator's own words. The check names the two affordances that carried
      **zero** CSS rules at the start of this packet — the per-group create button and the row
      checkbox — and asks whether **those** are visible and usable, not only whether something looks
      different.
      **No harness, capture manifest or green bench substitutes for this.** It is the evidence release
      1.3.1 lacked.
- [ ] **T6.9 · P1** — Confirm no code comment written by this phase carries a spec path, packet
      number, phase number, task id, ADR id or requirement id.
      *Evidence:* a grep of the scoped diff.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

1. Touch targets meet the 44px floor at phone width, and sorting stays reachable there.
2. Focus rings visible on every element the packet introduced.
3. The patch fast path applies to both groups or refuses — never to one.
4. Q-P4-01 answered and recorded.
5. `NFR-01` still within 20 percent, and both tripwires still pass on the final tree.
6. **The operator has opened the plugin and confirmed the screen changed, naming the two
   affordances.**

The packet does not close on item 5. It closes on item 6.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- [`spec.md`](spec.md) §4.2 — why no phone claim may cite a capture.
- [`plan.md`](plan.md) §3 — the two deferred guards and the device check's phrasing.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register.
- [`../000-grid-contract-and-list-harness/`](../000-grid-contract-and-list-harness/) — the tripwires
  re-run here against the final tree.

<!-- /ANCHOR:cross-refs -->
