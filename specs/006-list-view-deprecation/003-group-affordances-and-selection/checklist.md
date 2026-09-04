---
title: "Verification Checklist: Phase 003 — Group Affordances and Selection"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). The two criteria, their cross-boundary phrasing, and the lane-must-be-free gate."
trigger_phrases:
  - "006 phase 003 checklist"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Verification Checklist: Phase 003 — Group Affordances and Selection

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`.

Cells reading *census* take their number from phase 000. A blank cell blocks the task that would fill
the target.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] The `styles.css` lane is **free**. This phase does not take it
- [ ] Phase 002 released the lane on all four of its conditions
- [ ] Census cells for `AC-22` and `AC-23` are filled
- [ ] The harness names `AC-23`'s anchor — the first column's leading-glyph origin — **before** any
      number is compared

<!-- /ANCHOR:pre-impl -->
---

## Criteria

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| AC-22 | Group checkbox reflects a selection changed **from the toolbar** | *census* — the resync routine queries the table's own containers only, so the list group checkbox is set once at render and never resynced | reflects the change | [ ] |
| AC-22b | The same change reaches a second grouped view's checkbox | *census* | reflects the change | [ ] |
| AC-23 | Create-row offset versus the first column's **leading-glyph origin**, anchor named in the harness | *census* — no columns exist to align to | equal within 1px | [ ] |

### Tripwire

- [ ] **AC-32** — phase 000's reveal tripwire passes against this tree. This phase must not convert
      the new-row-reveal guard either

### Negative controls

- [ ] Select nothing — AC-22's checkbox clears
- [ ] Hide the first column — AC-23's offset follows
- [ ] Create a row from a **zero-row** group's affordance — it lands in that group
- [ ] Create a row from a **named, non-first** group's affordance — it lands in that group, not the
      first

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] `npx tsc --noEmit` exit 0, output read without a pipe
- [ ] `npm run lint` at or below the existing baseline
- [ ] `styles.css` unchanged by this phase
- [ ] The sync fix is at the producer, not a special case for the list
- [ ] No code comment carries a spec path, packet number, phase number, task id, ADR id or
      requirement id
- [ ] No slot, affordance or row-grammar column reserved for subtasks

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] `npx vitest run` exit 0, test count not reduced
- [ ] The sync's edge case is covered: a group that becomes indeterminate
- [ ] The create row's edge case is covered: a zero-row group
- [ ] No DOM assertion written as a unit test

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] No criterion asserts a hover trigger for the reference's group-header overflow and add
      affordances — four static captures cannot establish it
- [ ] The group count's definition is written down, including that top-level and total coincide for us
- [ ] Any defect found outside this phase's scope recorded in the parent and **not** fixed here
- [ ] If the sync fix needed a shared-contract change, the seam was named and asked about rather than
      widened silently

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] The group count's definition recorded in this folder
- [ ] Any deferral to a follow-on packet recorded with its reason

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Question | Answer |
|---|---|
| Did AC-22 change the selection on a different surface than it read? | must be **yes** |
| Did the fix reach a second grouped view? | must be **yes** |
| Did a row created from a non-first group land in that group? | must be **yes** |
| Is `AC-23`'s anchor named in the harness? | must be **yes**, before the number was compared |
| Was the lane taken? | must be **no** |

<!-- /ANCHOR:summary -->
