---
title: "Task Breakdown: Phase 002 — ClickUp Chrome"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Zero-rule affordances first, then the gutter, group header, chips, density, contrast in both themes, and the four-condition lane release."
trigger_phrases:
  - "006 phase 002 tasks"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Task Breakdown: Phase 002 — ClickUp Chrome

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[ ]` not started · `[~]` in progress · `[x]` closed with evidence
- **P0** blocks the phase · **P1** required for the phase to be complete · **P2** may defer, with the
  deferral recorded
- Task ids continue the parent's `T3.x` series so cross-references in the packet stay valid.
- **No task here closes on a command that was run.** Each closes on a number read from the harness,
  measured against the failing number phase 000 recorded.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] **T3.0 · P0** — Confirm the lane is held by this packet and every "today" cell this phase owns
      is filled.
      *Evidence:* `lane:check` held; no blank cell in this folder's `checklist.md`.
- [ ] **T3.0a · P0** — Record ADR-P2-01 and ADR-P2-02 as **open**, so neither the sort-indicator
      container nor the select-pill width is smuggled into a threshold before the capture review.
      *Evidence:* both entries exist and no criterion in this folder depends on either answer.
- [ ] **T3.0b · P1** — Re-examine the filled-versus-outlined chip distinction at full resolution
      before `FR-22`'s criterion is written. It is a hairline-presence claim graded at the same
      capture scale the parent's §4.2.1 disqualifies for the row divider.
      *Evidence:* the re-examination recorded, either promoting the claim or moving it to the
      cannot-establish list.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage B — row rhythm

- [ ] **T3.1 · P0** — Flat, full-bleed rows: no card border, no inter-row gap, exactly one hairline
      divider between adjacent rows.
      *Evidence:* `AC-14` — measured gap 0 and exactly one divider. Negative control: delete a row,
      the divider count drops by one.

### Stage C — the two zero-rule affordances, first

**These go before everything else. If the phase runs out of budget, these are the two that must not
be left as they are.**

- [ ] **T3.2 · P0** — Style the per-group create button, `db-list-group-new`.
      *Evidence:* `AC-12` — authored declarations applying at the production mount point greater than
      0, against a recorded prior of **0 selectors matched**. Negative control: delete the node, the
      measured set empties.
- [ ] **T3.3 · P0** — Style the row checkbox, `db-list-row-checkbox`.
      *Evidence:* `AC-13` — same shape, same recorded prior of **0**.

### Stage D — the reserved leading gutter

- [ ] **T3.4 · P0** — Build the leading gutter: reserved and empty at rest, holding the checkbox on
      hover, focus and selection, sharing the band with the group's collapse toggle.
      **Do not build a slot swap.** The captures show a reserved gutter beside a record glyph that
      stays put; the swap reading was contradicted and the criterion asserting it was withdrawn.
      *Evidence:* `AC-16` — the chevron, glyph and title occupy identical positions within 1px with
      the gutter empty and occupied, in **all three** states, **and** the checkbox's box never
      intersects the record glyph's. Negative control: delete the gutter, the two measurements
      collapse into one and the comparison has nothing to compare.

### Stage E — the group header

- [ ] **T3.5 · P0** — Render the group value in **its own field's** treatment, with the count numeral
      beside it. A colour-bearing field yields a coloured pill; a field with no per-option colours
      yields a neutral chip.
      *Evidence:* `AC-15`, **scoped to a colour-bearing group field**. Unscoped it would fail a
      rendering that correctly follows the field.
- [ ] **T3.6 · P1** — Add a **non-colour** signal to the group pill — a glyph, or the label itself.
      *Evidence:* `AC-27` — with colour removed from the measurement, at least one signal differs
      between two group values. This is the criterion that must hold for **every** group field, which
      is why `AC-15` does not stand alone.

### Stage F — cells

- [ ] **T3.7 · P1** — Give a `select` or `status` cell a dropdown affordance **at rest** — nothing
      hovered, no popover open, no cell focused.
      *Evidence:* `AC-29`. At rest on purpose: an affordance that only appears on hover does not tell
      a reader the cell is editable.
- [ ] **T3.7a · P0** — Confirm the pill's colour comes from the **option's configured colour** and is
      never derived from the value's magnitude.
      *Evidence:* two options whose values order one way and whose colours order another both render
      their own colour.
- [ ] **T3.8 · P2** — Outlined chips for multi-value reference columns, distinct from the filled
      single-value pill. The treatment is a property of the **column**, never of the value.
      *Evidence:* the same string in two columns renders two ways. **Gated on T3.0b.**
- [ ] **T3.9 · P1** — Overflow chip at a narrow width.
      *Evidence:* `AC-21` — the chip is present, the row height is unchanged, **and it is
      distinguishable from a trailing add affordance**. The reference carries both in one column and
      a measurement matching on a leading `+` alone would pass on the wrong node.
- [ ] **T3.10 · P2** — Type-appropriate empty-cell placeholders. A dash for unset select and numeric;
      an **add affordance** for unset date and assignee; an outline glyph for unset priority.
      *Evidence:* four distinct rendered forms. The dash sits at the pill's left edge, not centred.

### Stage G — density

- [ ] **T3.11 · P2** — Offer row density for the list in the view config panel.
      *Evidence:* `AC-19` — three distinct measured row heights. Negative control: set all three the
      same, they converge.

### Stage H — accessibility, both themes

- [ ] **T3.12 · P0** — Contrast for every text pair introduced or changed, **in both themes**.
      *Evidence:* `AC-17` at 4.5:1. All four primary captures are dark theme; light theme is
      unobserved and is ours to get right rather than ours to copy.
- [ ] **T3.13 · P0** — Contrast for any border that alone identifies a control.
      *Evidence:* `AC-18` at 3:1.
- [ ] **T3.14 · P1** — Focus ring visible on every interactive element introduced, as `box-shadow`
      rather than `outline`, with no bare `outline: none`.
      *Evidence:* `AC-25`'s chrome half.
- [ ] **T3.15 · P0** — Confirm no literal colour, spacing, radius or duration value was introduced
      outside the token scale.
      *Evidence:* `AC-20` — count 0. Negative control: introduce one deliberately, the count rises.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification and the lane release

- [ ] **T3.16 · P0** — Record the computed winner, before and after, for **every duplicated selector
      touched**.
      *Evidence:* the pairs. The stylesheet is documented as reversing itself — 87 selectors declared
      more than once, 124 property values overridden by a later block. A block that looks dead is not.
- [ ] **T3.17 · P0** — Confirm every criterion in this phase has a negative control that **moved**.
      *Evidence:* the moved number per criterion. A control that moves nothing invalidates its
      criterion, and the criterion is rewritten rather than waived.
- [ ] **T3.18 · P0** — Full recapture at four widths, both themes, then the capture-manifest check.
      *Evidence:* manifest exit 0. **A partial recapture cannot satisfy it.**
- [ ] **T3.19 · P0** — **Human capture review, signed off by name** in `checklist.md`.
      *Evidence:* the name and the date. The manifest check never opens an image; this is the only
      visual gate in the packet before the operator's own device check.
- [ ] **T3.20 · P0** — `005`'s live-verification phase re-asserts against this tree.
      *Evidence:* its result, because both packets edit `styles.css`.
- [ ] **T3.21 · P0** — Release the lane, and only after conditions 1 through 4 have been met **in
      order**.
      *Evidence:* `css-lane.json` records the release.
- [ ] **T3.22 · P1** — Confirm no code comment or stylesheet comment written by this phase carries a
      spec path, packet number, phase number, task id, ADR id or requirement id.
      *Evidence:* a grep of the scoped diff.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

1. Both zero-rule affordances have authored declarations applying at the production mount point.
2. The leading gutter reveals in three states without moving the row's chevron, glyph or title.
3. Two group values are distinguishable **without colour**.
4. Contrast passes in **both** themes.
5. Zero off-scale literals introduced.
6. Every negative control moved.
7. Full recapture, manifest exit 0, duplicated-selector winners recorded.
8. **A named human signed off on the images**, and the lane is released.

A phase that reports all-green while a negative control moved nothing has not been verified. It has
been asserted — and that is the exact failure of release 1.3.1.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- [`spec.md`](spec.md) §4.1 — what the captures cannot establish, and the candidate sixth item.
- [`spec.md`](spec.md) §4.2 — the two banned criterion shapes, verbatim.
- [`plan.md`](plan.md) §2 — the four lane-release conditions.
- [`decision-record.md`](decision-record.md) — ADR-P2-01 and ADR-P2-02.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register.

<!-- /ANCHOR:cross-refs -->
