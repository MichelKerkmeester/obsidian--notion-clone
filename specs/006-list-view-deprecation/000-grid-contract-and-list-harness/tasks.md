---
title: "Task Breakdown: Phase 000 — Grid Contract and List Harness"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Stage A predicate, stage B guard table re-derivation, stage C tripwire arming, stage D harness, stage E census, stage F baseline."
trigger_phrases:
  - "006 phase 000 tasks"
  - "tripwire arming tasks"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Task Breakdown: Phase 000 — Grid Contract and List Harness

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[ ]` not started · `[~]` in progress · `[x]` closed with evidence
- **P0** blocks the phase · **P1** required for the phase to be complete · **P2** may defer, with the
  deferral recorded
- Every task names what it touches and the observable that closes it. A task closed without an
  observable is not closed.
- Task ids continue the parent's `T1.x` series so cross-references in the packet stay valid.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

### Stage A — the grid predicate

- [ ] **T1.1 · P0** — Add `isGridView(config)` in a shared module. **No call sites converted.**
      *Evidence:* a unit test covering every view type in the union plus the default branch.

### Stage B — re-derive the guard table

- [ ] **T1.2 · P0** — Re-confirm each of the eleven guard sites against the current tree. Re-anchor
      each row off the **enclosing method name**; keep the line number as a convenience marked as
      expected to rot.
      *Evidence:* the parent's `plan.md` §3 updated in place, with the old and new locations both
      readable. A disagreement is resolved there, not silently.
- [ ] **T1.2b · P0** — Audit the `viewType === "list"` sites. The parent's table is complete over the
      `"table"` predicate and names exactly one list-keyed site; the tree has more.
      *Evidence:* every list-keyed site listed with its intended treatment, including the ones that
      need none.
- [ ] **T1.2c · P0** — Name the render-dispatch site — the branch that selects the list renderer over
      the grid renderer — and give it its own row. Route B's central edit lands there and the parent's
      guard table does not mention it.
      *Evidence:* the row exists, with its intended change and the views it must not affect.

### Stage C — arm the two tripwires

**This stage precedes the harness and the census. If the phase is cut short, these must already
exist.**

- [ ] **T1.2a · P0** — Build the two view-semantic guard tripwires ADR-001 obliges, **before any
      guard is converted anywhere**. Both failures pass `tsc` and the whole unit suite, so neither
      may be defended by a type check; each drives the production render.
      *Evidence, AC-31 / G8:* against a scratch tree with G8 converted to the grid predicate, the
      check fails — the title field's key is absent from the required-column set and the row-level
      affordance count has fallen. Both numbers recorded, HEAD and mutant.
      *Evidence, AC-32 / G11:* against a scratch tree with G11 converted, the check fails — a row
      created from a named group's create affordance does not land in that group. Run against a
      **multi-group** fixture with at least three groups, one of them empty; record which group was
      used and which group received the row.
- [ ] **T1.2d · P0** — Confirm AC-31 does **not** assert where the leading gutter is emitted.
      *Evidence:* the check passes against both candidate structures — gutter as its own header cell,
      and gutter as padding on the first cell. A tripwire that fails one of them would fail a correct
      implementation of the other, which is the parent's banned shape 2.
- [ ] **T1.2e · P0** — Confirm AC-32 fails on a single-group fixture *as a fixture defect*, not as a
      pass.
      *Evidence:* the harness refuses a single-group fixture for this check, or the check reports it
      as inconclusive. A group-scoped assertion with one group is not evidence.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage D — a harness that can see the list

- [ ] **T1.3 · P0** — Make `tools/storybook/verify-placement.mjs` mount a real list view at the
      **production** mount point, not inside a helpful wrapper.
      *Evidence:* the harness renders a list with rows, groups and fields, and the mount point in the
      harness matches the one the plugin uses.
- [ ] **T1.4 · P0** — Prove the harness distinguishes: delete `.db-list-group-new` from the harness
      DOM and confirm an asserted number moves.
      *Evidence:* the number before and after. If nothing moves, the harness cannot see the
      affordance and stage E is worthless.
- [ ] **T1.4a · P1** — Prove the harness is not wrapper-fed: render at least one probe **outside**
      `.note-database-container` and confirm a token-reach defect would be visible.
      *Evidence:* a computed value that differs between wrapped and unwrapped mounts.

### Stage E — the census, read-only

- [ ] **T1.5 · P0** — Run the failing-number census. Every criterion this packet owns gets its
      "today" value, in this folder's `checklist.md` and in the owning child's.
      *Evidence:* no empty "today" cell remains anywhere in the packet.
- [ ] **T1.5a · P0** — Confirm the census changed no source file.
      *Evidence:* the scoped diff for the census commit touches only the census artefact and
      `checklist.md` files.
- [ ] **T1.6 · P1** — Record the computed style of `db-list-group-new` and `db-list-row-checkbox` at
      the production mount point.
      *Evidence:* the measured values, expected to show that no authored rule applies to either.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Stage F — baseline and the no-change proof

- [ ] **T1.7 · P1** — Capture the table bench baseline at 2,000 rows for NFR-01.
      *Evidence:* a bench number, with the machine and the data set named.
- [ ] **T1.8 · P1** — Confirm this phase changed nothing a user can see.
      *Evidence:* captures byte-identical, or every diff explained. Not "regenerated".
- [ ] **T1.9 · P1** — Re-confirm the guard table against the tree at the end of the phase as well as
      the start, because `src/` is under concurrent edit.
      *Evidence:* the re-read, dated.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

This phase closes when all of the following hold:

1. `isGridView` exists, is tested, and **no call site has been converted**.
2. The guard table is re-anchored, the list-keyed sites are audited, and the render-dispatch site has
   a row.
3. Both tripwires exist and **each has been demonstrated to fail against its deliberately converted
   guard**, with the mutation, the command and both numbers recorded.
4. The harness mounts a real list at the production mount point and is demonstrably distinguishing.
5. Every "today" cell in the packet carries a measured number.
6. The bench baseline exists.
7. Nothing a user can see has changed.

A phase that reports all-green while any "today" cell is blank has not been verified. It has been
asserted.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- [`spec.md`](spec.md) — this phase's scope and its edge cases.
- [`plan.md`](plan.md) — stage order and why stage C precedes D.
- [`acceptance-criteria.md`](acceptance-criteria.md) — AC-31 and AC-32 measurement plans.
- [`decision-record.md`](decision-record.md) — ADR-P0-01, the tripwire failing-first carve-out.
- [`../plan.md`](../plan.md) §3 — the guard table this phase re-derives.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register and the doctrine.

<!-- /ANCHOR:cross-refs -->
