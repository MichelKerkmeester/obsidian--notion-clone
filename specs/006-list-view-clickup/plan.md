---
title: "Implementation Plan: List View as a ClickUp-Style Grid"
description: "Five phases ordered so the phase most able to pass while changing nothing runs after the phase that recorded its failing numbers, with one take and one release of the styles.css lane. Route B is decided; the two view-semantic guards get their checks before any guard is touched."
trigger_phrases:
  - "006 list view plan"
  - "list grid phase order"
  - "clickup list lane protocol"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: List View as a ClickUp-Style Grid

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Ordered around one question: **which phase could pass every check it writes for itself and still
leave the operator looking at an unchanged screen?** That phase runs last, and it runs against
numbers a previous phase already recorded as failing.

The answer is the chrome phase, and the reason is specific rather than general. Two of the classes
carrying the affordances the operator pointed at — `db-list-group-new` (per-group *Add Task*) and
`db-list-row-checkbox` — have **zero** rules in `styles.css` today, measured. `.db-list-row` has 18.
A chrome phase that writes its own criteria will reach for the row, because the row is what has
rules to assert on, and will pass while both affordances stay exactly as invisible as they are now.
So the chrome phase does not get to write its own failing numbers. Phase 000 writes them, before any
stylesheet is touched.

Second in that risk order is the structure phase, which can render a `<th>` carrying `aria-sort`,
assert it, pass, and ship a header that does nothing when clicked — because the list's render path
rebuilds and discards. Its criteria therefore assert the **order of rendered row paths after a
click**, never the presence of a header.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, output read without a pipe |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, test count not reduced |
| Lint | `npm run lint` | at or below the existing baseline |
| Geometry and behaviour | `npm run storybook:placement` | every criterion, each with its recorded prior failure |
| Negative control | harness, per criterion | deleting the subject node moves an asserted number |
| Bench | `npm run bench` | NFR-01 within 20 percent of the table baseline for the same data |
| Captures | `npm run screenshots` then **human review** | diffs explained, not merely regenerated |
| Capture manifest | `npm run screenshots:verify` | exit 0. A partial recapture cannot satisfy it |
| Catalogue | `npm run story:smoke` | list stories render at production mount points |
| Lane | `npm run lane:check` | lane held by this packet while `styles.css` is dirty |

**Read exit codes without a pipe.** `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.

**`screenshots:verify` is not a visual gate.** It proves a capture was regenerated after its source
list changed. It never opens an image. The human review is the visual gate and it is not optional.

### Comment hygiene — hard block

No spec path, packet number, phase number, task id, ADR id or requirement id may appear in any code
comment. Keep the durable *why*; drop the bookkeeping. This binds every phase and is not waivable.

### Licence boundary — hard block

`external/anytype` and `external/appflowy` are AGPL or source-available and are read for **behaviour
only**. No code, CSS value or token scale is copied from either. The same applies to ClickUp: match
the interaction model, reproduce no asset, no CSS and no token. No Mobbin image is vendored into this
repository — §4.2 of `spec.md` cites URLs.

One third-party image sits in this packet: `reference-clickup-list-operator.png`, the operator's
first capture, held as evidence for §4.2. Four more sit **outside** it, at
`specs/context/clickup/list-view/`, and are cited by path only — not moved, cropped,
re-encoded or duplicated into this packet. None is shipped in the plugin, turned into an asset, or
the origin of any value that reaches the codebase. §4.2 describes shape classes from them — filled
versus outlined, capsule versus rounded rectangle, reserved versus inserted space, truncating versus
wrapping — while every number still comes from the token scale at `styles.css:32` onward. `spec.md`
§4.2.1 records what those captures cannot establish, so their silence is not read as a finding.

### The `styles.css` lane — one take, one release

`styles.css` is a single serialized lane (`tools/lane/css-lane.json`) and roughly 196 captures
fingerprint it.

| Moment | Rule |
|---|---|
| **Take** | Start of phase 001. Not in 000, which touches only harness files and reads the stylesheet |
| **Hold** | 001 and 002 continuously. They are one stylesheet edit split for reviewability, not two |
| **Release** | After 002, and only when all four conditions below are met in order |

1. Full recapture at four widths, both themes, then `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.**
3. Every duplicated selector touched has its computed winner recorded before and after. The
   stylesheet is documented as reversing itself — 87 selectors declared more than once, 124 property
   values overridden by a later block (`architecture-findings.md` §4). A block that looks dead is not.
4. `005`'s live-verification phase re-asserts against the released tree, because both packets edit the
   same file.

Phases 003 and 004 must not require a second lane take. Any styling they need is written during 002
or deferred to a follow-on packet.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### The decision, in one line

**One grid renderer, two presentations.** The list stops being a second implementation of a row and
becomes a presentation mode of the grid: same DOM shape, same cell pipeline, same column controller,
with a `data-db-row-style="list"` attribute on the grid selecting chrome. Every visual rule keys off
that attribute, never off ancestry — the same shape `005` adopted for surfaces, and for the same
reason.

Route A — porting features into `list-renderer.ts` — is recorded with its consequences in ADR-001.
**Route B is decided.** This section stands as written; the four desktop captures were re-judged
against it and changed nothing structural, because every new finding is chrome or slot allocation and
`data-db-row-style` selects both. The one constraint they tighten is recorded under "Header
repetition per group" below.

### What "presentation mode" owns

| Concern | Owner |
|---|---|
| Column resolution, header, sort, resize, reorder, add-column | the grid renderer, unchanged |
| Cell rendering and editing | `cell-renderer.ts`, unchanged |
| Group model, depth, collapse, counts | the grid renderer, unchanged |
| Footer calculations | `table-footer-renderer.ts`, unchanged |
| Row chrome: height, dividers, fills, leading slot | `data-db-row-style` |
| Header repetition per group | a grid option, on for list, off for table. **Keyed on the group's existence, never on its row count** — a zero-row group still renders its header row and its create row (C24, AC-02, AC-30). Emitting the header only for groups that have rows is the natural optimisation, and it is the failure this row exists to name |
| Row leading gutter: reserved, empty at rest, holds the checkbox on hover, focus or selection | `data-db-row-style`. It does not replace the record icon and must not reflow the row (C22, ADR-004) |
| Row-click opens the record detail panel | a grid option, on for list |
| Roving-tabindex keyboard model | a grid option, on for list, mutually exclusive with cell-grid navigation |
| Stacked file titles, wrapping fields | existing per-column settings, unchanged |

### The eleven guards

Every `viewType === "table"` site becomes an explicit predicate. **Each is listed here with its
intended replacement before any edit is made**, because a wrong predicate silently changes board,
gallery, calendar, timeline or chart.

| # | Site | Today | Intended predicate |
|---|---|---|---|
| G1 | `database-view.ts:1567` fill shortcut | `viewType !== "table"` | `!isGridView(config)` |
| G2 | `database-view.ts:1597` clipboard and grid select-all | `viewType !== "table"` | `!isGridView(config)` |
| G3 | `database-view.ts:1816` create row past the last cell | `viewType !== "table"` | `!isGridView(config)` |
| G4 | `database-view.ts:1972` restore cell focus | `viewType !== "table"` | `!isGridView(config)` |
| G5 | `database-view.ts:2477` external row patch fast path | `viewType !== "table"` | `!isGridView(config)` — deferred to phase 004, see FR-19 |
| G6 | `database-view.ts:2701` table subgroup on group change | `viewType === "table"` | `isGridView(config)` |
| G7 | `database-view.ts:2768` set table subgroup field | `viewType !== "table"` | `!isGridView(config)` |
| G8 | `database-view.ts:5496` required column keys | `viewType === "table"` returns empty | **unchanged.** The list needs its title field kept; returning empty would hide it. This guard is view-semantic, not grid-semantic. The four desktop captures sharpen the failure: that column also hosts the leading gutter, the collapse chevron, the record glyph and the row-action cluster (C22, C23), so dropping it takes every row-level affordance with it. T1.2a's check asserts the column **and** its occupants |
| G9 | `database-view.ts:6995` suppress the summary bar | `viewType === "table"` | `isGridView(config)` — the list gains the per-column footer and loses the separate summary bar, per FR-08 |
| G10 | `database-view.ts:8542` optimistic update on the title field | `viewType !== "table" && titleField === col.key` | **unchanged** in phase 001; revisited in 004 with F14 |
| G11 | `database-view.ts:7856` new-row reveal | `viewType === "list"` | unchanged — this is list-specific reveal behaviour, correctly keyed on the view. C5 and C24 fix the reveal as **group-scoped**: every group carries its own create affordance, including a zero-row one. T1.2a's check therefore runs against a multi-group fixture and asserts the new row lands in the group whose affordance was used; a single-group fixture passes it trivially |

Two of the eleven — G8 and G11 — are correctly view-keyed and must **not** be converted. Recording
that here is the point of the table: a sweep that converted all eleven would break the list's title
column and its new-row reveal, and both would pass type-check and unit tests.

**Recording is not enough, and ADR-001 says so.** Each of the two needs a check that drives the
production render and fails when its guard is converted, built **before** T2.6 touches any guard.
That is T1.2a, and it sits in phase 000 rather than 001 for the same reason the failing-number census
does: a check written by the phase that could break the thing it checks is not evidence.

### What must not regress

`db-list-row`, `db-list-group-header` and their siblings are referenced by
`database-view.ts:7554` (selection sync), the screenshot scenarios, the Storybook stories and the
surface-contract test. Renaming or removing a list class is a cross-file change and each site is
enumerated in `tasks.md` before the rename lands.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

`recommend-level.sh` suggested three phases for a score of 40/50. This plan uses five. The two extra
splits exist for one reason each and are not decorative: **000 exists so the chrome phase cannot
author its own failing numbers**, and **004 exists so device verification is not the tail of a phase
that is already declaring victory.** The remaining three are the natural work boundaries.

Children are declared here and scaffolded with `create.sh --phase` when execution begins. They do not
exist on disk yet, which is correct for a spec-and-plan packet.

| Phase | Folder | Status | What it does | Lane |
|---|---|---|---|---|
| 0 | `000-grid-contract-and-list-harness/` | planned | No user-visible change. Define the grid predicate, enumerate the eleven guards, **build the two view-semantic guard checks (T1.2a) before any guard is touched**, and make `verify-placement.mjs` able to render a real list view at the production mount point. **Record every failing number this packet will later claim to fix.** | not held |
| 1 | `001-list-grid-structure/` | planned | The structural swap. List renders through the grid: header row, per-group repetition, sort, resize, reorder, add-column, cell pipeline, cell selection, footer, multi-group. Minimal CSS — only what stops the result being unreadable | **take** |
| 2 | `002-clickup-chrome/` | planned | The visual language: row rhythm and dividers, group header pill and count, leading-slot checkbox swap, chip and pill cell treatments, empty-cell placeholders, density | hold, then **release** |
| 3 | `003-group-affordances-and-selection/` | planned | Per-group create row wired and reachable, group count, the `syncGroupedSelectionInputs` defect (F19), bulk action bar behaviour | not held |
| 4 | `004-mobile-and-live-verification/` | planned | Phone layout and touch targets, the deferred patch and optimistic-update guards (G5, G10), full recapture sign-off, live device verification | not held |

### Phase 0 — Grid contract and a harness that can see the list

Deliver `isGridView`, the reviewed guard table, **the two view-semantic guard checks**, a
`verify-placement.mjs` that mounts a real list view at the production mount point, and the census that
fills every "today" cell in `checklist.md`. **No user-visible change.** Captures before and after are
byte-identical or every diff is explained.

The guard checks belong here and not in 001 for the same reason the census does. G8 and G11 both fail
silently — `tsc` and the whole unit suite pass with either broken — so the only thing that catches
them is a check that drives the production render, and a check authored by the phase that converts
the guards is not evidence. The captures fix what each must assert: for G8 the title column **and**
the leading gutter and row actions inside it; for G11 a group-scoped reveal against a multi-group
fixture.

### Phase 1 — List grid structure

Route the list render through the grid renderer behind `data-db-row-style`. Header row, per-group
repetition, sort, resize, reorder, add-column, the shared cell pipeline, cell selection, footer,
multi-group. Convert nine of the eleven guards and leave G8 and G11 alone. Preserve FR-17. Takes the
`styles.css` lane and writes only the minimum CSS that makes the result readable.

### Phase 2 — ClickUp chrome

Row rhythm and dividers, group header pill and count, the leading-slot checkbox swap, chip and pill
cell treatments, empty-cell placeholders, density. Every value from the existing token scale. Full
recapture, human sign-off by name, then release the lane.

Three additions come from the operator screenshot and are decided in ADR-002 and ADR-003: a
non-colour signal on the group pill (FR-11a), a dropdown affordance on a `select` cell at rest
(FR-21), and the filled-versus-outlined split between single-value and multi-value chips (FR-22). Two
choices are deliberately left to the capture review rather than settled in advance — whether the sort
indicator gains a badge container, and whether the select pill spans its column track.

**One item in this list reversed.** "The leading-slot checkbox swap" is not built. The four desktop
captures show a reserved leading gutter beside a record icon that stays put, so T3.4 builds the
gutter and AC-16 was replaced rather than amended (C22, ADR-004). The second open choice above also
gained its missing half: C29 measures the reference pill as *uniform-width within its column*, which
is neither hugging nor track-spanning, so the capture review now compares two measured shapes instead
of one measured and one imagined.

### Phase 3 — Group affordances and selection

Wire and style the per-group create row, the group count, and fix F19 so grouped and total
checkboxes resync from every source. Bulk action bar parity with the table.

### Phase 4 — Mobile and live verification

Phone layout and 44px touch targets, the deferred guards G5 and G10, and the only evidence that
closes the packet: the operator opens the plugin and confirms the screen changed.

### The ordering argument

**Highest risk of passing while the defect persists: phase 002, the chrome phase.** This is not a
general worry, it is the recorded failure mode of release 1.3.1 — every gate green, operator reports
nothing changed — and this packet has a sharper local version of it. The affordances the operator
actually pointed at are carried by `db-list-group-new` and `db-list-row-checkbox`, and both have zero
rules in `styles.css` today. A phase asked to "style the list" will assert on `.db-list-row`, because
that is where the 18 rules are, and will be honestly green while the *Add Task* button and the row
checkbox remain unstyled. Mitigation, in order:

1. **000 records the failing numbers**, before any stylesheet edit exists to bias them. A criterion
   whose failing number was written by the phase that fixes it is not evidence.
2. **Every 002 criterion names its specific affordance**, not the row that contains it.
3. **Every 002 criterion carries a negative control**: delete the node from the harness DOM and an
   asserted number must move. If nothing moves, the check is theatre and is rejected.
4. **002 releases the lane only after a human looks at the images.** `screenshots:verify` cannot see
   a visual defect and is not permitted to stand in for that step.
5. **No 002 criterion asserts chrome that is already present at rest, and no criterion carries a
   threshold the primary source contradicts.** Two traps, failing in opposite directions, both found
   in this packet's own drafts. `spec.md` §4.2 C7: bordered pills were read as an edit-mode signal
   and the captures show them on resting rows, so a criterion built on it would have passed before a
   line was written. C22 and ADR-004: AC-16 asserted the checkbox and the record icon share one box,
   and the captures show they must not, so an implementation matching the reference would have
   **failed** it. The second is the more dangerous — precise, measurable, negative-controllable and
   still wrong. `acceptance-criteria.md` §2 bans both phrasings and adds a third check, that a
   criterion's target may not depend on a design choice nobody has made yet.

**Second: phase 001.** A header element that exists, carries `aria-sort` and does nothing is the
canonical banned criterion — presence, not behaviour. 001's criteria therefore read *the order of
rendered row paths changes after a header click, and reverses on a second click*, and *a fill drag
writes the source value into the target cells and the values are read back from the row model*.

**Third: phase 003.** Selection sync (F19) is invisible until a second surface changes the selection.
A criterion that toggles one checkbox and reads it back passes on today's broken code. The criterion
must change the selection from the toolbar and read the group checkbox.

**Lowest: phase 000.** It is the only phase whose deliverable is the measurement itself, so it cannot
pass falsely — a harness that renders nothing fails visibly.

Phases 003 and 004 sit after the lane release deliberately. Both are behavioural; putting them inside
the lane hold would extend a serialized resource for work that does not need it.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

**`vitest` runs `environment: "node"` with no jsdom** (`vitest.config.ts`). A DOM assertion written as
a unit test asserts against a stub and proves nothing about a browser. The split is therefore fixed:

| Claim | Where it is tested |
|---|---|
| Pure model behaviour — column resolution, group ordering, track templates, sort rule maths | `vitest`, `src/**/*.test.ts` |
| Anything about geometry, computed style, hit testing, focus, or event dispatch | `tools/storybook/verify-placement.mjs`, system Chrome via `playwright-core` |
| Visual appearance | `npm run screenshots` plus human review |
| Performance | `npm run bench` |

**The harness must be fixed before it can be trusted.** `verify-placement.mjs` renders no view today,
and the existing harnesses wrap everything in `.note-database-container` — the wrapper that supplies
the tokens — so they are structurally unable to show a token-reach defect
(`architecture-findings.md` §3). Phase 000 owns making the list renderable in the harness at the
production mount point. No criterion in any later phase may be measured before that lands.

Coverage floor: happy path plus one edge case per public surface changed. Above the floor, a new test
earns its place by failing for one real reason no current test catches.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Kind | Note |
|---|---|---|
| ADR-001 route decision | **answered — Route B** | Blocks nothing. What it obliges is T1.2a, the two guard checks, before phase 001 converts any guard |
| `tools/lane/css-lane.json` free | blocking for 001 | Currently unheld; `005` also queues for it |
| `verify-placement.mjs` renders a list | blocking for 001-004 | Phase 000 delivers it |
| `playwright-core` plus system Chrome | existing | Already used by the harness |
| `specs/context/clickup/list-view/clickup-desktop-list-view-{1,2,3,4}.png` | reference only | Primary source for §4.2, cited by path; evidence, not a build dependency |
| `reference-clickup-list-operator.png` | reference only | Primary source for §4.2; evidence, not a build dependency |
| Mobbin MCP | reference only | Secondary source for §4.2; not a build dependency |
| No new npm package | constraint | The scoped result does not require one |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Each phase is a separate commit on a dedicated branch, so rollback is `git revert` of that commit.
Two cases need more than that:

- **The stylesheet.** `css-lane.json` records `baselineHash` and `baselineCommit` at take. Rolling
  back 001 or 002 means restoring `styles.css` to the recorded baseline **and** recapturing, because
  the ~196 PNGs on disk will otherwise describe a stylesheet that no longer exists. A revert without
  a recapture leaves the repository internally inconsistent and the next `screenshots:verify` fails.
- **The guards.** Reverting the guard rename restores table-only behaviour and is safe. Reverting
  *half* of it is not: G6 and G9 change config-writing behaviour, so a partial revert can leave
  `groupByFields` set on a view that no longer reads it. Revert the guard commit whole or not at all.

No data migration is involved. Saved view configs gain optional fields only; an older build reading a
newer config ignores them.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```text
ADR-001 (operator) ── answered: Route B
   |
   v
000 harness + guard contract  ── records every failing number
                              ── builds the G8 and G11 checks BEFORE any guard is touched
   |
   v
001 grid structure            ── takes the css lane
   |
   v
002 clickup chrome            ── releases the css lane, human sign-off
   |
   +--> 003 group + selection
   |
   +--> 004 mobile + live verification  ── also picks up G5, G10
```

003 and 004 are independent of each other and may run in either order or in parallel. Neither may
start before 002 releases the lane, because both would otherwise want to edit `styles.css`.

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | LOC estimate | Files | Note |
|---|---|---|---|
| 000 | ~350 | 4 | Harness and predicate only; no product code path changes |
| 001 | ~900 | 9 | The bulk of the change under Route B |
| 002 | ~700 | 2 | Almost all of it `styles.css` |
| 003 | ~300 | 5 | Includes the F19 defect fix |
| 004 | ~250 | 6 | Guards G5 and G10, phone rules, recapture |

Route A raises 001 to roughly 2,200 LOC across 12 files and adds a permanent second implementation.

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

| Trigger | Action |
|---|---|
| Bench regression beyond NFR-01 after 001 | Do not release the lane. Fix in place or revert 001 whole |
| A guard rename breaks a non-list view | Revert the guard commit whole; re-derive the predicate table in §3 before retrying |
| A G8 or G11 check does not fail when its guard is deliberately converted | The check is theatre. Do not proceed to T2.6 — rewrite the check until the deliberate break is caught, because nothing else in the gate set can see either failure |
| Human capture review rejects 002 | Lane stays held. Fix and recapture. Never release on a `screenshots:verify` pass alone |
| `005` needs the lane urgently | 002 must reach a releasable state or revert to baseline. There is no shared-hold mode |

<!-- /ANCHOR:enhanced-rollback -->
---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

| Node | Depends on | Produces |
|---|---|---|
| Grid predicate `isGridView` | ADR-001 | The single test every guard uses |
| Guard table (§3) | grid predicate | Eleven decisions, two of them "do not convert" |
| List-capable harness | none | The ability to measure anything in this packet |
| Failing-number census | list-capable harness | Every "today" cell in `checklist.md` |
| Grid structure | guard table, census | Header, cells, selection, footer in the list |
| Chrome | grid structure, lane | The appearance the operator asked for |
| Group affordances | chrome | Styled create row, working selection sync |
| Live verification | everything | The only evidence that counts |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

`ADR-001 → list-capable harness → failing-number census → grid structure → chrome → lane release`

The census is on the critical path on purpose. It is the cheapest step to skip and the one whose
absence caused release 1.3.1 to ship real code and change nothing.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Definition of done |
|---|---|
| M0 | ADR-001 answered by the operator — **met, Route B** — and the two view-semantic guard checks exist and fail when their guards are converted |
| M1 | A list view renders inside `verify-placement.mjs` at the production mount point, and every criterion in `checklist.md` has a non-empty "today" cell |
| M2 | A list view has a working, sortable, resizable column header and cells that edit through the table's pipeline |
| M3 | A list view is visually ClickUp-shaped, captures reviewed and signed off by name, lane released |
| M4 | Group affordances styled and reachable; selection syncs from every source |
| M5 | Phone verified on device; the operator confirms the screen changed |

<!-- /ANCHOR:milestones -->
---

## L3: ARCHITECTURE DECISION RECORD

ADR-001 lives in [`decision-record.md`](decision-record.md). It is answered — Route B — and blocks
nothing. ADR-004, in the same file, reverses the checkbox-swap reading this plan's phase 002 was
written around; the reversal is carried in §4 above and in T3.4.
