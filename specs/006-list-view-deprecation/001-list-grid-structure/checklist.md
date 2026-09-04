---
title: "Verification Checklist: Phase 001 — List Grid Structure"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Criteria with the failing number recorded first, the guard-conversion gate, and the six-view regression."
trigger_phrases:
  - "006 phase 001 checklist"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Verification Checklist: Phase 001 — List Grid Structure

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.

Cells reading *census* take their number from phase 000. **A blank "today" cell blocks the task that
would fill the target**, it does not merely leave it unmet.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] Phase 000's two tripwires run against this tree
- [ ] Phase 000's census is on record and no cell this phase owns is blank
- [ ] Phase 000's table bench baseline exists
- [ ] `tools/lane/css-lane.json` taken by this phase, with a `baselineHash`
- [ ] **ADR-P1-01 recorded** — the leading gutter's emission decided. `AC-01` is unmeasurable before it
- [ ] The re-derived guard table read, with the two do-not-convert rows understood

<!-- /ANCHOR:pre-impl -->
---

## Criteria

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| AC-01 | Header element count, ungrouped | *census* — the list emits no header element | visible columns plus the two utility columns, **after ADR-P1-01** | [ ] |
| AC-02 | Header rows in a grouped list, fixture **including a zero-row group** | *census* — 0 | equals group count, zero-row group included | [ ] |
| AC-03 | Rendered row-path order reverses on a header click and returns on a second | *census* — no header exists to click | reverses, then returns | [ ] |
| AC-04 | Rendered track width after a resize drag | *census* — widths are read but no handle is offered | matches within 1px | [ ] |
| AC-05 | `files` and `rollup` cells non-empty in a list | *census* — the card field renderer handles neither type | both non-empty | [ ] |
| AC-06 | Clipboard payload for a cell range | *census* — the clipboard guard returns early for non-table views | equals the table's | [ ] |
| AC-07 | Tab past the last cell creates a row | *census* — the keyboard-row guard returns early | 1 row | [ ] |
| AC-08 | Footer calculation value | *census* — the list gets the summary bar instead | equals the table's | [ ] |
| AC-09 | Group depth for a two-field grouping | *census* — the list render passes one field | 2 | [ ] |
| AC-10R | Cell-grid keyboard model active, roving tabindex not, row click opens on a target cell | *census* — both list behaviours present today | all three, models never both active | [ ] |
| AC-11 | Render time at 2,000 rows | *census* — no list baseline existed before 000 | within 20 percent of the table baseline | [ ] |
| AC-28 | Sort-indicator instances in a grouped list, and the ordinal each carries | *census* — 0; no header exists to carry one | equals the group count, same ordinal on each | [ ] |
| AC-30 | Header rows and create rows inside a zero-row group | *census* — nothing renders for the list | 1 and 1 | [ ] |

### Tripwire closure

- [ ] **AC-31** passes against this tree **after** the guard conversion
- [ ] **AC-32** passes against this tree **after** the guard conversion, on a multi-group fixture
      including a zero-row group, using a non-first group's affordance
- [ ] Neither tripwire was modified during this phase. A tripwire edited by the phase it guards is
      not evidence

### Negative controls

- [ ] Delete the column header — AC-03 stops responding
- [ ] Remove a column from the config — AC-01 count drops by one
- [ ] Collapse a group — AC-02 header count drops by one
- [ ] Give the zero-row group a row — AC-30 stays 1 and 1 while the row count moves
- [ ] Remove the sort rule — AC-28 indicator count falls to 0
- [ ] Clear the selection — AC-06 payload empties
- [ ] Remove the resize handle — AC-04 width stops changing
- [ ] Re-enable the roving-tabindex model — AC-10R's cell-grid assertion fails
- [ ] Halve the row count — AC-11 time falls

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] `npx tsc --noEmit` exit 0, output read without a pipe
- [ ] `npm run build` exit 0
- [ ] `npm run lint` at or below the existing baseline
- [ ] No code comment written by this phase carries a spec path, packet number, phase number, task
      id, ADR id or requirement id — **checked especially at the two guards that must not be
      converted**, where the temptation to write a cross-reference is highest
- [ ] The guard conversion is exactly one commit and reverts whole
- [ ] Only **seven** guards were converted — G1, G2, G3, G4, G6, G7, G9. The required-column guard
      and the new-row-reveal guard are untouched, and G5 and G10 are still deferred to 004
- [ ] No compatibility flag, fallback path or reading-mode toggle was added to soften the removal of
      the reading behaviours
- [ ] The `styles.css` diff contains only what stops the result being unreadable

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] `npx vitest run` exit 0, test count not reduced
- [ ] No DOM assertion written as a unit test
- [ ] **Six-view regression clean** — board, gallery, calendar, timeline and chart render unchanged
      after the guard conversion
- [ ] No test added per guard. Nine near-identical predicate tests assert the predicate, which
      already has its own test from 000

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] Every site referencing a list class by name enumerated **before** any rename landed: the
      selection-sync selector list, the screenshot scenarios, the Storybook stories, the
      surface-contract test
- [ ] `AC-10`'s withdrawal recorded in the parent register, so a reader who finds it cited elsewhere
      can follow it
- [ ] No slot, affordance or row-grammar column reserved for subtasks
- [ ] Any defect found outside this phase's scope recorded in the parent and **not** fixed here

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] ADR-P1-01 written before `AC-01` was measured
- [ ] The parent's `plan.md` §3 guard table reflects what was actually converted
- [ ] The lane is still held, handed to 002, with the release conditions unchanged

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Question | Answer |
|---|---|
| Did both tripwires pass after the conversion? | must be **yes** |
| Were exactly seven guards converted? | must be **yes**. G5 and G10 belong to 004; G8 and G11 to nobody |
| Do the other five view types render unchanged? | must be **yes** |
| Is any "today" cell blank? | must be **no** |
| Was a compatibility path added for the removed reading behaviours? | must be **no** |
| Is `NFR-01` within 20 percent? | must be **yes** before the lane may be released in 002 |

<!-- /ANCHOR:summary -->
