---
title: "Implementation Plan: Phase 000 — Grid Contract and List Harness"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Build the predicate, re-derive the guard table off a stable anchor, arm the two guard tripwires against a deliberately converted guard, make the harness mount a real list, and take the census read-only."
trigger_phrases:
  - "006 phase 000 plan"
  - "guard tripwire arming"
  - "list census plan"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Implementation Plan: Phase 000 — Grid Contract and List Harness

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

This phase ships no behaviour. It ships the ability to tell whether a later phase shipped any.

The order inside it is not arbitrary. The two guard tripwires come **before** the census, because the
census is the larger job and a phase that runs out of budget must not be the phase that skipped the
tripwires. The tripwires are the one deliverable here that `tsc` and the unit suite cannot substitute
for.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

The parent's [`../plan.md`](../plan.md) §2 gate table binds in full. This phase adds one gate and
narrows two.

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, output read without a pipe |
| Unit | `npx vitest run` | exit 0, test count not reduced |
| **Tripwire arming** | run each tripwire against a scratch tree with its guard deliberately converted | **each tripwire fails.** A tripwire that passes the mutant is theatre and this phase does not close |
| Harness distinguishability | delete `.db-list-group-new` from the harness DOM | an asserted number moves |
| No visible change | `npm run screenshots` then human review | captures byte-identical, or every diff explained |
| Lane | `npm run lane:check` | **not held by this phase.** If this phase is holding the lane, something is wrong |

**Read exit codes without a pipe.** `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.

### Comment hygiene — hard block

No spec path, packet number, phase number, task id, ADR id or requirement id may appear in any code
comment. Keep the durable *why*; drop the bookkeeping. This binds every file this phase touches,
including the harness and the predicate module, and it is not waivable.

Concretely: the predicate's doc comment explains what a grid view is and why board and gallery are
not one. It does not mention this packet, this phase, `G8`, `AC-31`, or a spec folder. The same rule
applies to every fixture and every tripwire this phase writes.

### Licence boundary — hard block

Inherited unchanged from [`../plan.md`](../plan.md) §2. This phase reads the ClickUp captures for
**shape** when building fixtures and copies no value from them. It introduces no value at all — it
records values that already exist.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### `isGridView` is a predicate over configuration, not over a renderer

One exported function, no call sites converted in this phase. It answers a single question: does this
view present its rows as an aligned column grid? Table does. List will, after phase 001. Board,
gallery, calendar, timeline and chart do not.

The predicate is unit-testable in `vitest` because it touches no DOM — which is exactly why the
predicate is not what the tripwires test. A predicate can be perfect while the guard that calls it is
wrong.

### The guard table is re-derived off a stable anchor

The parent records eleven sites by file and line. Every line number has drifted since it was written
and `src/` is under concurrent edit, so this phase re-confirms each site and re-anchors the table off
the **enclosing method name**. The line number stays as a convenience and is documented as expected
to rot.

Two things the re-derivation must also do, because the parent's table did not:

1. **Audit the `viewType === "list"` sites, not only the `"table"` ones.** The parent's table is
   titled after the `"table"` predicate and is complete over it. It names exactly one list-keyed site
   (G11). The current tree has more than one, and under Route B a list-keyed site is exactly as
   load-bearing as a table-keyed one.
2. **Name the render-dispatch site.** The branch that chooses the list renderer over the grid
   renderer is where Route B's central edit lands, and it is not in the parent's guard table at all.
   Record it, with its own row and its own intended change.

### The two tripwires

Both drive the production render. Neither is a unit test, because neither failure is reachable from
`environment: "node"`.

| Tripwire | Guard | What it asserts | Fixture |
|---|---|---|---|
| AC-31 | G8, required column keys | The title field's key is present in the required-column set the list resolves, **and** the count of row-level affordance nodes rendered in a list row has not fallen below the census value | A list view with the title column configured and at least one non-title column hidden |
| AC-32 | G11, new-row reveal | A row created from a group's create affordance appears **inside that group** | **Multi-group**, at least three groups, one of them with **zero rows** |

**AC-31 deliberately does not assert where the leading gutter is emitted.** Whether it is its own
header cell or padding on the first cell is phase 001's decision, recorded as undecided in the
parent's `AC-01`. A tripwire that presumed either answer would fail a correct implementation of the
other — the parent's banned shape 2, reproduced inside the mitigation for it. AC-31 asserts survival
and count; containment is asserted by `AC-16` and `AC-23` once the decision is on record.

**AC-32's fixture is the criterion.** A single-group fixture passes a group-scoped assertion
trivially, because there is only one group a row could land in. The zero-row group is required for
the same reason `AC-30` requires it: a create affordance renders in a group with no rows, and an
implementation that keys the affordance off row count passes every fixture built from non-empty
groups.

### Arming, and why it is a different rule

Both guards are **correct today**. A tripwire on a correct guard passes on HEAD. Under the parent's
doctrine — *demonstrated failing on the current tree* — that reads as the banned shape 1 it is not.
[`decision-record.md`](decision-record.md) ADR-P0-01 records the carve-out: a guard tripwire's
failing-first demonstration is against a **deliberately mutated tree**, and the mutation, the command
and both numbers are recorded. The carve-out is available to guard tripwires only; every other
criterion in this packet still fails first on HEAD.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:affected-surfaces -->
## 4. AFFECTED SURFACES

| Surface | Change | Risk |
|---|---|---|
| A shared predicate module | new export `isGridView` | none — no call sites |
| Its unit test | new | none |
| `tools/storybook/verify-placement.mjs` | mounts a list view at the production mount point | medium — the harness is the instrument every later criterion depends on |
| The census artefact | new, written once | none |
| `styles.css` | **read only** | none, and the lane is not taken |
| `src/views/database-view.ts` | **not edited.** Read to re-derive the guard table | none |

<!-- /ANCHOR:affected-surfaces -->
---

<!-- ANCHOR:phases -->
## 5. STAGES

| Stage | What | Gate before the next |
|---|---|---|
| A | `isGridView` plus its unit test | `npx vitest run` exit 0 |
| B | Re-derive the guard table; audit list-keyed sites; name the render-dispatch site | The parent's `plan.md` §3 is updated or a disagreement is recorded there |
| C | **Arm the two tripwires** | Each fails against its deliberately converted guard, both numbers recorded |
| D | Harness mounts a real list at the production mount point | Deleting `.db-list-group-new` moves an asserted number |
| E | The census, read-only | No "today" cell is empty; no source file changed |
| F | Bench baseline, then confirm nothing visible changed | A bench number exists; captures byte-identical or explained |

Stage C precedes D and E on purpose. If this phase is cut short, the tripwires must already exist —
they are the deliverable phase 001 is gated on.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts`). A DOM assertion written as a
unit test asserts against a stub and proves nothing about a browser.

| Claim | Where |
|---|---|
| `isGridView` returns the right answer per view type | `vitest` |
| The guard table matches the tree | a read, recorded in the parent's `plan.md` §3 |
| Either tripwire | `tools/storybook/verify-placement.mjs`, system Chrome via `playwright-core` |
| Every census number | the same harness |
| The bench baseline | `npm run bench` |

Coverage floor: happy path plus one edge case per public surface changed. Above the floor a new test
earns its place by failing for one real reason no current test catches. The predicate's edge case is
a view type that does not exist in the union — the default branch.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

| Dependency | Kind | Note |
|---|---|---|
| ADR-001 route decision | answered — Route B | Blocks nothing; it is what obliges the tripwires |
| `playwright-core` plus system Chrome | existing | Already used by the harness |
| `tools/lane/css-lane.json` | **not taken** | This phase reads `styles.css` |
| Concurrent edits to `src/` | external | Re-confirm the guard table at the end of the phase as well as the start |
| No new npm package | constraint | The scoped result does not require one |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

One commit, reverted whole. Nothing in this phase reaches a user, no config shape changes, and the
stylesheet is untouched, so a revert has no recapture obligation.

The one thing a revert destroys is the census. Record it as a file in this folder, not only as
`checklist.md` cells, so a revert of the code does not take the measurements with it.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```text
ADR-001 ── answered: Route B
   |
   v
A predicate ──> B guard table ──> C TRIPWIRES ARMED
                                       |
                                       +--> 001 may convert guards
                                       |
                   D harness ──> E census ──> 001 may claim a pass
                                       |
                                       +--> F bench baseline ──> NFR-01 gate in 001
```

Phase 001 is gated twice by this phase, and the two gates are different. It may not **convert a
guard** until stage C is on record. It may not **claim a criterion passed** until stage E is.

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Stage | LOC | Files |
|---|---|---|
| A | ~60 | 2 |
| B | 0 | 0 — a read, plus an edit to the parent's guard table |
| C | ~120 | 1 |
| D | ~130 | 1 |
| E | ~40 | 1 |
| F | 0 | 0 |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

| Trigger | Action |
|---|---|
| A tripwire does not fail against its converted guard | **The check is theatre.** Do not close this phase and do not let 001 start. Rewrite until the deliberate break is caught — nothing else in the gate set can see either failure |
| The harness renders only inside a token-supplying wrapper | Not done. A wrapper that supplies the tokens is structurally unable to show a token-reach defect, which is the class of defect this packet exists to catch |
| A census number comes out passing | Do not adjust the number. Send the criterion back to the parent register as a suspected banned shape 1 |
| The guard table cannot be reconciled with the tree | Stop. Record the disagreement in the parent's `plan.md` §3 and escalate; do not resolve it by picking the reading that makes the phase finish |

<!-- /ANCHOR:enhanced-rollback -->
