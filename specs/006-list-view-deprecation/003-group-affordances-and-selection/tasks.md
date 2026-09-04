---
title: "Task Breakdown: Phase 003 — Group Affordances and Selection"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Sync fix at the producer, create row wired to its own group, the count's definition written down, bulk bar parity."
trigger_phrases:
  - "006 phase 003 tasks"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Task Breakdown: Phase 003 — Group Affordances and Selection

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[ ]` not started · `[~]` in progress · `[x]` closed with evidence
- **P0** blocks the phase · **P1** required for the phase to be complete · **P2** may defer, with the
  deferral recorded
- Task ids continue the parent's `T5.x` series so cross-references in the packet stay valid.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] **T5.0 · P0** — Confirm the `styles.css` lane is **free** and this phase does not need it.
      *Evidence:* `lane:check` free. If this phase needs the lane, its scope has drifted.
- [ ] **T5.0a · P0** — Confirm the census cells for `AC-22` and `AC-23` are filled.
      *Evidence:* no blank "today" cell in this folder's `checklist.md`.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage B — the selection-sync defect

- [ ] **T5.1 · P0** — Fix the resync so grouped and total checkboxes reflect a selection change from
      **any** source. Fix it where the change is published, not at the surface that noticed.
      *Evidence:* `AC-22` — change the selection **from the toolbar**, then read the **list group
      checkbox**. A criterion that toggles the list's own checkbox and reads it back passes on the
      broken code and closes nothing.
- [ ] **T5.1a · P0** — Confirm the fix reaches every rendered selection checkbox, not only the list's.
      *Evidence:* the same assertion in a second grouped view.
- [ ] **T5.1b · P1** — If the fix requires changing a shared contract rather than a selector list,
      **name the seam and ask** before editing outside this phase's scope.
      *Evidence:* the seam named, with the files a seam fix would touch. `SCOPE LOCK` binds; a fix
      that works only by special-casing the list is evidence the seam is wrong.

### Stage C — the per-group create row

- [ ] **T5.2 · P0** — Wire the create row so the new row lands in **the group whose affordance was
      used**, with that group's field value already set.
      *Evidence:* used on a **named, non-first** group, the new row's group is read back and matches.
      A first-group test passes a reveal that always targets the first group.
- [ ] **T5.2a · P0** — Confirm it works from a **zero-row** group.
      *Evidence:* a row created from an empty group's affordance lands in that group.
- [ ] **T5.3 · P0** — Confirm the create row's horizontal anchor.
      *Evidence:* `AC-23` — the offset is measured against the first column's **leading-glyph
      origin**, with the anchor named in the harness. Not "the content edge": a reserved gutter and a
      variable run of glyphs sit between the glyph origin and the title origin, and the two do not
      coincide.
- [ ] **T5.4 · P0** — Confirm this phase did **not** convert the new-row-reveal guard.
      *Evidence:* phase 000's `AC-32` tripwire passes against this tree. It is one of the two guards
      that must survive the packet.

### Stage D — the group count

- [ ] **T5.5 · P1** — Render the group count, and **write down what it counts**: the group's top-level
      rows.
      *Evidence:* the definition recorded, and the rendered numeral matching it. We have no subtask
      model so top-level and total coincide — record the coincidence so it is not later mistaken for
      a design choice.

### Stage E — bulk action bar

- [ ] **T5.6 · P1** — Bulk action bar parity with the table.
      *Evidence:* the list's bar offers what the table's offers for the same selection.
- [ ] **T5.6a · P2** — Confirm the docked bar does not obscure the last group's create row.
      *Evidence:* the create row remains reachable with a selection active.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] **T5.7 · P0** — Confirm both criteria have negative controls that **moved**.
      *Evidence:* the moved number per criterion.
- [ ] **T5.8 · P0** — Confirm `styles.css` is unchanged by this phase.
      *Evidence:* the scoped diff contains no stylesheet edit.
- [ ] **T5.9 · P1** — Confirm no code comment written by this phase carries a spec path, packet
      number, phase number, task id, ADR id or requirement id.
      *Evidence:* a grep of the scoped diff.
- [ ] **T5.10 · P1** — Confirm no slot, affordance or row-grammar column was reserved for subtasks.
      *Evidence:* the scoped diff.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

1. A selection change from the toolbar is reflected in the list's group checkbox.
2. The fix reaches every rendered selection checkbox, not only the list's.
3. A row created from a named, non-first group's affordance lands in that group — and so does one
   created from a zero-row group.
4. The create row's anchor is the leading-glyph origin, named in the harness.
5. The group count's definition is written down.
6. Phase 000's reveal tripwire still passes.
7. `styles.css` is untouched and the lane was never retaken.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- [`spec.md`](spec.md) §4.2 — the group-scoped create affordance at zero rows.
- [`plan.md`](plan.md) §3 — why the sync is fixed at the producer.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register.
- [`../000-grid-contract-and-list-harness/`](../000-grid-contract-and-list-harness/) — the reveal
  tripwire that runs in this phase's gate.

<!-- /ANCHOR:cross-refs -->
