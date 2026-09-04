---
title: "Implementation Plan: Phase 001 — List Grid Structure"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Take the lane, route the list through the grid behind data-db-row-style, convert seven guards in one revertible commit, remove the four reading behaviours FR-17 used to protect, and gate on the two tripwires from 000."
trigger_phrases:
  - "006 phase 001 plan"
  - "list grid conversion plan"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Implementation Plan: Phase 001 — List Grid Structure

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Two orderings matter inside this phase and both are about what a green gate would otherwise mean.

**The guard conversion goes last among the structural edits, and it goes in one commit.** Two of the
eleven guards must survive it and both break silently. The tripwires from 000 are the only thing that
can see either failure, so the conversion runs behind them and reverts whole.

**The header comes before the cells.** A header element that renders, carries `aria-sort` and does
nothing when clicked is the canonical banned criterion in this packet — presence, not behaviour —
and the list's render path discards and rebuilds, which is exactly the shape that produces it. Build
the header so that clicking it reorders rendered rows, and assert that, before anything else in the
row is touched.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

The parent's [`../plan.md`](../plan.md) §2 gate table binds in full. This phase adds two.

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, output read without a pipe |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, test count not reduced |
| Lint | `npm run lint` | at or below the existing baseline |
| **Tripwires** | the two checks armed in 000, run against **this** tree | **both pass.** If either fails, a view-semantic guard was converted. Stop |
| Geometry and behaviour | `npm run storybook:placement` | every criterion this phase owns, each against its recorded prior failure |
| Negative control | harness, per criterion | deleting the subject moves an asserted number |
| Bench | `npm run bench` | `NFR-01` within 20 percent of the 000 baseline |
| **Six-view regression** | harness | board, gallery, calendar, timeline and chart render unchanged after the guard conversion |
| Lane | `npm run lane:check` | held by this packet while `styles.css` is dirty |

**Read exit codes without a pipe.** `cmd >/tmp/out.log 2>&1; echo $?`.

### Comment hygiene — hard block

No spec path, packet number, phase number, task id, ADR id or requirement id may appear in any code
comment. Keep the durable *why*; drop the bookkeeping. Not waivable.

This phase is the one most tempted to break it. A guard that must **not** be converted is exactly the
place a well-meaning author writes `// do not convert — see G8 in the 006 plan`. Write instead what
the next reader needs and what stays true after this packet closes: *this branch is keyed on the view
because the list needs its title column kept; converting it to the grid predicate returns empty and
the column disappears with every row-level affordance it hosts.* That sentence survives the packet.
The reference does not.

### Licence boundary — hard block

Inherited unchanged from [`../plan.md`](../plan.md) §2. The reference supplies **shape**; the token
scale supplies **value**. No measured pixel, radius, hex, duration or token scale from any ClickUp
source reaches this repository. Nothing is copied from `external/anytype` or `external/appflowy`.

### The `styles.css` lane — take here, release in 002

`styles.css` is a single serialized lane (`tools/lane/css-lane.json`) and **216 captures** currently
fingerprint it.

| Moment | Rule |
|---|---|
| **Take** | Start of this phase. Not in 000, which reads the stylesheet |
| **Hold** | Continuously through 002. One stylesheet edit split for reviewability, not two |
| **Release** | After 002, and only on its four conditions in order |

This phase writes **only the minimum CSS that stops the result being unreadable**. Anything that
could be called styling belongs to 002, where it is graded against numbers 000 recorded.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### One grid renderer, two presentations

The list stops being a second implementation of a row and becomes a presentation mode of the grid:
same DOM shape, same cell pipeline, same column controller, with `data-db-row-style="list"` on the
grid selecting chrome. Every visual rule keys off that attribute, never off ancestry.

### What this phase changes, in order

1. `data-db-row-style` exists on the grid and is emitted for both views.
2. The **render-dispatch site** routes the list to the grid renderer. This is Route B's central edit
   and it is the site the parent's guard table never named — phase 000 gives it a row.
3. The header row builds, repeats per group as the group's first child, and **its click reorders
   rendered rows**.
4. The cell pipeline is shared, so `files` and `rollup` render.
5. Cell selection, fill, clipboard, keyboard navigation and footer follow from the guard conversion.
6. **The guard conversion**, one commit, seven of eleven. G5 and G10 are deferred to 004; G8 and G11
   are never converted.
7. The four reading behaviours FR-17 protected are removed — see below.

### Header repetition is keyed on the group, never on its row count

A grid renderer that emits a group's header only when the group has rows is the natural optimisation.
It passes every fixture built from non-empty groups and breaks the case the reference shows twice: a
group reading zero that still carries a full header row and its own create row with nothing between
them. `AC-02` and `AC-30` both require a zero-row group in the fixture for this reason.

### The reading behaviours are removed, not relocated

The operator decided the list matches ClickUp and becomes a grid. Four behaviours go, with no
replacement:

| Concern | Before | After |
|---|---|---|
| Row-click target | opens the record detail panel | opens on a target cell, as the table does |
| Keyboard model | roving tabindex over cards | cell-grid navigation. The two are mutually exclusive; this is not a setting with both on |
| File titles | stacked | rendered in the title column's cell |
| Wrapping fields | `max-content`, row grows | truncates. This converges with the reference rather than diverging from it |

The cost is real and belongs in the plan so an implementer does not treat it as an oversight to
route around: **anyone using the list as a reading surface loses that surface.** Do not add a
compatibility flag, a fallback path or a "reading mode" toggle to soften it. A parallel path here
would recreate the two-implementations problem this whole packet exists to remove, and it was not
asked for.

### The two guards that do not convert

Both are enumerated with their intended treatment in the parent's `plan.md` §3, re-derived against
the current tree by phase 000. Two properties make them different from every guard that does convert:

- Converting either produces a **silent** failure — `tsc` passes, the unit suite passes, the build
  passes.
- Neither is reachable from a `node`-environment unit test, so the only gate that sees them drives
  the production render.

The conversion commit is therefore atomic: whole or not at all. A half-revert can leave a
config-writing guard applied to a view that no longer reads the field it wrote.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:affected-surfaces -->
## 4. AFFECTED SURFACES

| Surface | Change | Risk |
|---|---|---|
| The grid renderer | gains `data-db-row-style` and per-group header repetition | high |
| The list renderer | stops implementing a row; becomes a presentation configuration | high |
| The view controller | nine guard conversions, one commit | **highest** — five non-list views pass through the same guards |
| The shared cell pipeline | now serves the list | medium — `files` and `rollup` appear where they never have |
| `styles.css` | minimum readability rules only | medium — the lane is taken here |
| The selection-sync selector list, the screenshot scenarios, the Storybook stories, the surface-contract test | reference list classes by name | medium — enumerate every site **before** a rename lands |

The four sites in the last row are why a list class rename is a cross-file change rather than a
local one. Enumerate them in `tasks.md` before the rename, not after.

<!-- /ANCHOR:affected-surfaces -->
---

<!-- ANCHOR:phases -->
## 5. STAGES

| Stage | What | Gate before the next |
|---|---|---|
| A | Take the lane; confirm 000's tripwires and census are on record | `lane:check` held; both tripwires runnable |
| B | Record ADR-P1-01, the leading-gutter emission decision | The decision is written down. `AC-01` cannot be measured before it |
| C | `data-db-row-style`, and the render-dispatch site routes the list to the grid | A list view renders grid DOM |
| D | Header row; per-group repetition keyed on group existence; sort with ordinal indicator on every repetition | `AC-02`, `AC-03`, `AC-28`, `AC-30` fixtures include a zero-row group |
| E | Shared cell pipeline; resize, reorder, column menu, add-column | `AC-04`, `AC-05` |
| F | **Guard conversion, one commit, seven of eleven** (G5 and G10 deferred to 004; G8 and G11 never) | **Both tripwires pass**, and the six-view regression is clean |
| G | Cell selection, fill, clipboard, keyboard, footer, multi-group | `AC-06` to `AC-09` |
| H | Remove the four reading behaviours; replace `AC-10` | The replaced `AC-10` passes and the old one is gone from the register |
| I | Bench against the 000 baseline | `NFR-01` within 20 percent |

Stage F sits after D and E on purpose: the tripwires assert against a rendered grid, so they are
sharper once the grid exists than they were on the card stack in 000.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom. A DOM assertion written as a unit test asserts
against a stub.

| Claim | Where |
|---|---|
| Column resolution, group ordering, track templates, sort rule maths | `vitest` |
| Geometry, computed style, hit testing, focus, event dispatch | `tools/storybook/verify-placement.mjs`, system Chrome |
| Both tripwires | the same harness |
| Visual appearance | not this phase. 002 |
| Performance | `npm run bench` |

Coverage floor: happy path plus one edge case per public surface changed. Above the floor a new test
earns its place by failing for one real reason no current test catches. Do not add a test per guard —
nine near-identical predicate tests assert the predicate, which already has its own test from 000.
The guards are covered by the six-view regression and the two tripwires.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

| Dependency | Kind | Note |
|---|---|---|
| 000 tripwires armed | **blocking for stage F** | Nothing else in the gate set can see either failure |
| 000 census on record | **blocking for any criterion claim** | A criterion with a blank "today" cell is blocked, not unmet |
| 000 bench baseline | blocking for stage I | `NFR-01` has nothing to compare against otherwise |
| `tools/lane/css-lane.json` free | blocking for the phase start | Packet `005` also queues for it |
| ADR-P1-01 | blocking for `AC-01`'s measurement | Not for the phase start |
| No new npm package | constraint | The scoped result does not require one |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

Each stage is a separate commit; the guard conversion is one of them and reverts as a unit.

- **The stylesheet.** `css-lane.json` records `baselineHash` and `baselineCommit` at take. Rolling
  this phase back means restoring `styles.css` to the recorded baseline **and** recapturing, because
  the 216 PNGs on disk would otherwise describe a stylesheet that no longer exists. A revert without
  a recapture leaves the repository internally inconsistent and the next capture-manifest check fails.
- **The guards.** Revert the guard commit **whole or not at all**. Two of the nine change
  config-writing behaviour, so a partial revert can leave a field set on a view that no longer reads
  it.
- **The reading behaviours.** Their removal is part of the structural commit, not a separate one.
  Reverting restores them along with the card stack; there is no state in which the list is a grid
  and still opens on row click.

No data migration. Saved view configs gain optional fields only; an older build ignores them.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```text
000 tripwires armed ──┐
000 census on record ─┼──> 001 stage A (lane taken)
000 bench baseline ───┘        |
                               v
              B gutter decision ──> C dispatch ──> D header ──> E cells
                                                                  |
                                                                  v
                                             F GUARD CONVERSION (tripwires gate)
                                                                  |
                                                                  v
                                           G selection/footer ──> H reading removal ──> I bench
                                                                  |
                                                                  v
                                                          002 (lane still held)
```

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Stage | LOC | Files |
|---|---|---|
| A-B | 0 | 0 — a lane take and a written decision |
| C | ~120 | 3 |
| D | ~220 | 2 |
| E | ~150 | 3 |
| F | ~90 | 1 |
| G | ~180 | 3 |
| H | ~110 | 3 |
| I | 0 | 0 |

Route A would raise this phase to roughly 2,200 LOC across 12 files and add a permanent second
implementation. It is not the chosen route.

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

| Trigger | Action |
|---|---|
| The conversion touched more than seven guards | G5 and G10 are deferred to 004 and G8 and G11 are never converted. Revert the guard commit whole |
| Either tripwire fails after stage F | A view-semantic guard was converted. Revert the guard commit whole and re-derive the table before retrying |
| A tripwire passes but a six-view regression fails | A wrong predicate. Revert the guard commit whole; the tripwires cover the list, not the other five views |
| Bench regression beyond `NFR-01` | **Do not release the lane.** Fix in place or revert this phase whole |
| A list class rename breaks a referencing site | Revert the rename. Enumerate all four referencing sites before retrying |
| `005` needs the lane urgently | This phase must reach a releasable state or revert to baseline. There is no shared-hold mode |

<!-- /ANCHOR:enhanced-rollback -->
---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

| Node | Depends on | Produces |
|---|---|---|
| Lane take | lane free | The right to edit `styles.css` |
| Gutter decision | nothing | `AC-01`'s measurability |
| Render dispatch | `data-db-row-style` | A list rendering grid DOM |
| Header row | render dispatch | Sort, resize, reorder, add-column, the indicator |
| Cell pipeline | render dispatch | `files` and `rollup` in the list |
| Guard conversion | tripwires armed, guard table re-derived | Selection, fill, clipboard, keyboard, footer |
| Reading-behaviour removal | header row, cell pipeline | The grid interaction model, and the replaced `AC-10` |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

`000 tripwires → lane take → render dispatch → header row → guard conversion → bench → 002`

The tripwires are on the critical path deliberately. They are the cheapest step to skip and the only
one that can see the two failures this phase is most able to cause.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Definition of done |
|---|---|
| M1.1 | A list view renders grid DOM at the production mount point |
| M1.2 | Clicking a column header reorders rendered rows, and reverses on a second click |
| M1.3 | Seven guards converted in one commit; **both tripwires pass**; six-view regression clean |
| M1.4 | `files` and `rollup` render in a list cell; cell selection and clipboard work |
| M1.5 | The four reading behaviours are gone and the replaced `AC-10` passes |
| M1.6 | `NFR-01` within 20 percent of the 000 baseline, lane still held for 002 |

<!-- /ANCHOR:milestones -->
