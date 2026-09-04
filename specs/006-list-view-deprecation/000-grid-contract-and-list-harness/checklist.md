---
title: "Verification Checklist: Phase 000 — Grid Contract and List Harness"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Tripwire arming evidence, harness distinguishability, and the census gate. Every cell reading census is filled by this phase."
trigger_phrases:
  - "006 phase 000 checklist"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Verification Checklist: Phase 000 — Grid Contract and List Harness

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.

A row closes on a number read from the harness output or the census artefact, never on a command that
was merely run.

**This phase is the only one whose deliverable is the measurement itself**, so it cannot pass falsely
in the usual way: a harness that renders nothing fails visibly. The one way it *can* pass falsely is a
tripwire that does not trip, which is why the arming rows below carry two numbers each rather than a
tick.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] `tools/lane/css-lane.json` confirmed **not** held by this phase
- [ ] The parent's guard table read, and its line numbers understood to be stale
- [ ] A scratch tree available for the two deliberate guard conversions
- [ ] `npm run screenshots` baseline captured before any edit, for the no-visible-change proof

<!-- /ANCHOR:pre-impl -->
---

## Stage gates

| Stage | Gate | HEAD | Mutant / after | Evidence |
|---|---|---|---|---|
| A | `isGridView` returns the right answer for every view type | *unit* | — | [ ] |
| B | Every guard row re-anchored off its enclosing method name | *census* — all eleven line numbers are stale | — | [ ] |
| B | List-keyed sites audited, not only table-keyed | *census* — the parent's table names one list-keyed site; the tree has more | — | [ ] |
| B | The render-dispatch site has a row | *census* — absent from the parent's table entirely | — | [ ] |
| C | **AC-31 arming** — title key present in the required-column set | *census* | must fall to absent on the mutant | [ ] |
| C | **AC-31 arming** — row-level affordance node count | *census* | must fall on the mutant | [ ] |
| C | **AC-31** passes against *both* candidate gutter structures | — | both pass | [ ] |
| C | **AC-32 arming** — group receiving the new row equals the group whose affordance was used | *census* | must differ on the mutant | [ ] |
| C | **AC-32** run against a multi-group fixture including a zero-row group | fixture has ≥3 groups, one empty | — | [ ] |
| C | **AC-32** reports a single-group fixture as inconclusive rather than passing | — | inconclusive | [ ] |
| D | The harness mounts a list at the production mount point | *census* — renders no view today | renders | [ ] |
| D | Deleting `.db-list-group-new` moves an asserted number | *census* | moves | [ ] |
| D | A probe outside `.note-database-container` shows a token-reach difference | *census* | differs | [ ] |
| E | No "today" cell anywhere in the packet is blank | *census* | zero blank | [ ] |
| E | The census commit's scoped diff touches no source file | — | zero source files | [ ] |
| F | Table bench baseline at 2,000 rows | *census* — none exists | a number | [ ] |
| F | Captures byte-identical, or every diff explained | — | explained | [ ] |

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] No spec path, packet number, phase number, task id, ADR id or requirement id appears in any code
      comment this phase wrote — including in the predicate's doc comment, the fixtures and the
      tripwires
- [ ] `npx tsc --noEmit` exit 0, output read without a pipe
- [ ] `npm run lint` at or below the existing baseline
- [ ] No call site of any guard was converted in this phase
- [ ] No write to `styles.css`

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] `npx vitest run` exit 0, test count not reduced
- [ ] The predicate's unit test covers every view type plus the default branch
- [ ] No DOM assertion was written as a unit test — `vitest` runs `environment: "node"` and would
      assert against a stub
- [ ] Both tripwires run in the browser harness, not in `vitest`

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] Every guard site in the parent's table re-confirmed against the tree, at the start **and** at
      the end of the phase
- [ ] Any guard site that has moved is recorded with both locations
- [ ] Any guard site that no longer exists is recorded as removed, with the commit — ids are not
      renumbered, because they are cited across the packet
- [ ] Any census number that came out *passing* has been sent back to the parent register as a
      suspected banned shape 1, not adjusted

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] The parent's `plan.md` §3 guard table updated in place with the re-derived anchors
- [ ] The census recorded as a file in this folder, so a revert of the code does not take the
      measurements with it
- [ ] The two tripwire mutations recorded as diffs, reproducible by the next reader

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Question | Answer |
|---|---|
| Did anything a user can see change? | must be **no** |
| Was any guard converted? | must be **no** |
| Did each tripwire fail against its deliberately converted guard? | must be **yes**, with numbers |
| Is any "today" cell in the packet still blank? | must be **no** |
| Is `styles.css` unchanged and the lane unheld? | must be **yes** |

<!-- /ANCHOR:summary -->
