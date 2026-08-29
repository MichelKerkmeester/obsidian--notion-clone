---
title: "Implementation Plan: Properties Panel"
description: "Approach, gates and rollback for 002-properties-panel: audit the child-versus-track diff first, decide the information architecture second, and only then replace positional tracks with named areas."
trigger_phrases:
  - "002 properties panel plan"
  - "property row grid approach"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Properties Panel

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Replace a positional grid contract with a named one, and decide what a property row is for. The
governing measurements are in [`../architecture-findings.md`](../architecture-findings.md) §4; the
requirements and criteria are in [`spec.md`](spec.md). This plan is the order of work, the gates,
and the way back out.

The order is audit, then architecture, then code. The audit is not preparation for the work — **the
diff between emitted children and declared tracks is the defect**, stated numerically, and it has
to exist before anything is changed or there is nothing to compare against.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:approach -->
## 2. APPROACH

### Count before you look

The panel has three visible symptoms — clipped labels, a trash icon on its own line, and a
full-height panel — and it is tempting to fix each where it appears. Two of the three come from one
number: eight children in seven tracks. Fixing them separately would produce three patches and
leave the mechanism that generated all three in place.

So the first deliverable is a matrix, not a change: every condition in `spec.md` §4, at both
breakpoints, with four numbers in each cell. Emitted child count, laid-out child count, declared
track count, and the resolved grid row of every child. The emitted and laid-out counts differ
wherever something is `display: none`, and that gap is where the phone defect lives.

### Decide what the row is for

The information architecture phase answers one question: which of the eight controls belong in the
primary line, and which belong behind an overflow. The argument is that this panel is read far more
often than it is edited — a person opens it to see which properties exist and which are visible,
not to rename them — so reading gets the primary line and editing gets an affordance.

That argument is recorded rather than assumed, because it also decides R6. Delete stops being a
naked icon not because destructive actions are generically dangerous, but because a one-click
delete sitting between two harmless icons in a row a person is scanning is a mis-tap waiting to
happen, and the mis-tap destroys a property.

### Named areas, once

The implementation replaces the positional track list with named grid areas in one change, not
incrementally. A half-converted grid is a grid where some children are addressed positionally and
some by name, which is strictly worse than either — the positional ones still shift when the named
ones change.

The duplicate rules go with it. `styles.css:2036` against `18776`, and `16879` against `16995`:
each pair resolves to a single declaration. **Resolving a pair means deciding which behaviour is
correct and deleting the other, never appending a third rule that wins.** Appending is how both
pairs came to exist.

### Sequenced after 001 for a reason

Until `001` lands, this panel is one of the three surfaces that pass the positioner nothing and get
the 520px default, and its height is whatever the positioner's inline `maxHeight` computes. Working
the row grid while placement is still unresolved means measuring a row inside a container whose
width and height are about to change.

<!-- /ANCHOR:approach -->
---

<!-- ANCHOR:quality-gates -->
## 3. QUALITY GATES

| Gate | Expectation |
|---|---|
| `npx tsc --noEmit` | exit 0, no output — read directly, never through a pipe |
| `npm run build` | exit 0 |
| `npm test` (`vitest run`) | all passing from the final state |
| `npm run storybook:placement` | B1-B6 asserted and passing; every check demonstrated to fail first |
| `npm run storybook:coverage` | every row condition covered by a story or exempt with a written reason |
| `npm run screenshots` then `npm run screenshots:verify` | full recapture, exit 0. A partial recapture cannot satisfy it |
| **Human PNG review** | a person opens every changed capture, at 3, 12 and 40 properties |
| **Device confirmation** | R6 changes what a single click does; a capture cannot close it |
| `npm run lint` | not a CI gate; hold the existing baseline as convention |

### The `styles.css` lane — take, hold, release

`styles.css` is one serialized lane (parent `spec.md` §4) and this packet is fifth in the order,
after `000`, `004`, `005` and `001`.

| Moment | Rule |
|---|---|
| **Take** | Start of Phase 3. Not earlier — Phase 1 audits and Phase 2 decides against an unedited stylesheet, and an audit of a tree nobody shipped is worthless |
| **Hold** | Phases 3 and 4. No other phase may edit `styles.css` in that window |
| **Release** | Only after all four release conditions below, in order |

1. **Full recapture** — `npm run screenshots` at both viewports and 3, 12 and 40 properties, then
   `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**, so it cannot be this step.
3. **`008`'s early replay re-asserts every previously-closed phase** — `000`, `004`, `005` and
   `001` — against the released tree. They closed against a snapshot this packet has just edited and
   nothing obliges an edit here to preserve their results. A phase that closed earlier and does not
   re-close now blocks this release.
4. **Cascade re-confirmation.** Both collapsed duplicate pairs are recorded with their computed
   winner before and after, as is any other duplicated selector this packet touched. A changed
   winner carries a written disposition. This packet exists because two such pairs were never
   reconciled; it must not leave a third behind.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 4. ARCHITECTURE

One row template addressed by `grid-template-areas`, argued against the alternatives in `spec.md`
§5. The short form: a positional contract says "track 3 is 96px" when it means "the checkbox is
96px", and those stop agreeing the moment a child is added, hidden or conditionally omitted — which
has already happened three times in this one row.

Grid is kept rather than replaced by flex. Flex would remove the count mismatch by removing tracks
altogether, but it would also stop type icons and checkboxes lining up down the panel. The
mechanism was right; the addressing was wrong.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 5. IMPLEMENTATION PHASES

### Phase 1 — Row-grid audit across §4's matrix

**Exit:** four numbers in every cell.

### Phase 2 — Information architecture: primary line versus overflow

The decision is taken **against Phase 1's measurement of today's primary line**, not against an
impression of it. AC-007 closes on the measured result, not on this document existing.

**Exit:** decision written down with its reasoning, **and** AC-007's *before* measurement recorded.

### Phase 3 — Replace positional tracks with named areas; resolve both duplicate rule pairs

**Takes the `styles.css` lane here.** One declaration per pair is the *mechanism*; the exit is the
measurement. Record each pair's computed winner before and after the collapse.

**Exit:** one declaration per pair, **and** the before/after computed winner recorded for each.

### Phase 4 — Grid invariants B1-B6 in the browser harness

**Exit:** each demonstrated to fail first.

### Phase 5 — Screenshots, both viewports at 3, 12 and 40 properties

**Releases the `styles.css` lane here**, and only after the four release conditions in §3.

**Exit:** human review of every changed PNG, signed off by name; `008`'s replay green for `000`,
`004`, `005` and `001` against the released tree.

### Phase 6 — Storybook: one story per condition

**Exit:** coverage gate green.

### Phase 7 — Research gate

**Exit:** standing; fires on the rule, not the schedule.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts`). **No DOM assertion can live
in a unit test.** A test that string-matches `grid-template-columns` in `styles.css` proves the
declaration was typed; it cannot prove which of two identical selectors won, which is the entire
defect. Such tests are regression tripwires and are never cited as evidence for a criterion.

Every criterion in `spec.md` §6 is asserted in `tools/storybook/verify-placement.mjs` or its
successor, against the panel at its production mount point. The harness needs:

- the panel rendered by the real `column-manager-renderer`, not fixture markup
- both viewports, and the `is-phone` body class the phone rules key off
- each condition from §4's matrix drivable from the harness — read-only in particular, since it
  removes two children
- a per-child readout of resolved `grid-area` and `grid-row-start`, which is what B1 and B6 assert
- property counts of 3, 12 and 40 for B4

**The 40-property case is the one that must not be approximated.** B4's threshold is
`min(560px, 0.7 * visibleBounds.height)`, and a panel with 12 properties never reaches it.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

**Blocked by `001-overlay-placement-and-menu-language`.** The panel's width and height are decided
by the positioner until `001` gives it a role. Measuring a row grid inside a container that is about
to be resized produces numbers that will not survive.

**Blocks `003-mobile-sheet-presentation`**, which needs the desktop factory shaken out before the
portal lands.

**Holds the serialized CSS lane** for the whole phase.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

Revert the phase's commits. No migration and no persisted state change: the row grid is a rendering
concern and the information architecture changes which controls are resident, not what they do.

Three rollback hazards are specific to this phase:

1. **The recapture.** Reverting `styles.css` without re-running `npm run screenshots` leaves 196
   captures fingerprinting a stylesheet that no longer exists. A revert is not complete until the
   captures match.
2. **The duplicate-rule deletions.** Each pair resolves to one declaration on the argument that the
   loser never applied. If a surface regresses, restore the deleted block and record what read it.
   **Do not append a replacement rule elsewhere** — that recreates the pattern the program exists to
   end, and it is how both pairs were created.
3. **R6 is behavioural.** If the delete affordance is rolled back, it returns to deleting a property
   on one click. That is a user-visible regression in safety, not just in layout, and it should be
   called out rather than absorbed silently into a revert.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:cross-refs -->
## 9. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md)
- [`../architecture-findings.md`](../architecture-findings.md)
- [`../spec.md`](../spec.md)
- [`../001-overlay-placement-and-menu-language/spec.md`](../001-overlay-placement-and-menu-language/spec.md)

<!-- /ANCHOR:cross-refs -->

---

## 10. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md` §4 read, and `spec.md` §2 read, before opening any source file
- [ ] `001-overlay-placement-and-menu-language` confirmed landed; placement is not this phase's problem
- [ ] The §4A census cell for this task's condition and breakpoint carries all four numbers
- [ ] The serialized CSS lane is held by this phase
- [ ] The criterion's failing number is recorded before the fix lands

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Audit before information architecture, information architecture before implementation. The reorder-controls question is settled in the information-architecture phase on the evidence, never during implementation |
| TASK-SCOPE | The row grid, the two duplicate rule pairs, the name's widths, the height cap and the delete affordance. Placement belongs to `001`; the editing flows behind the affordances and every other panel's row grid are out of scope |
| TASK-EVIDENCE | Every criterion task records the failing number before the change and the passing number after. No criterion closes on a `styles.css` string match |
| TASK-CSS | This phase holds `styles.css` for its whole duration; every landing ends in a full recapture and a human opening every changed PNG |
| TASK-DEVICE | The delete-affordance change is behavioural and closes on operator device confirmation, not on a capture |

### Status Reporting Format

Report per task: `T-NNN <status> — <failing number> -> <passing number>`, where status is one of
`complete`, `in progress`, `not started`, `blocked`. A criterion task with no failing number is
reported as `not started`, whatever its code state.

### Blocked Task Protocol

A task is BLOCKED when `001` has not landed, when its census cell is incomplete, when the CSS lane
is held elsewhere, or when its failing number cannot be measured. On BLOCK: record the blocker in
`tasks.md`, stop that task, and never substitute a class-name or rule-count assertion for the
blocked measurement. When a criterion fails twice without a new hypothesis, open the standing
research gate in `spec.md` §5C rather than retrying.

