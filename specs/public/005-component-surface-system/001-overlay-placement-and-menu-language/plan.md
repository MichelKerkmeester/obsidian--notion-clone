---
title: "Implementation Plan: Overlay Placement and Menu Language"
description: "Approach, gates and rollback for 001-overlay-placement-and-menu-language: census first, contract second, code last, with every criterion demonstrated to fail before it is fixed."
trigger_phrases:
  - "001 overlay placement plan"
  - "overlay placement approach"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Overlay Placement and Menu Language

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Give every floating surface one placement authority and every menu row one grammar. The governing
measurements are in [`../architecture-findings.md`](../architecture-findings.md); the requirements
and criteria are in [`spec.md`](spec.md). This plan is the order of work, the gates, and the way
back out.

The sequence is deliberate and is not an implementation detail: **census, then contract, then
code.** Every attempt to fix these surfaces so far has started at the code, and each one produced
another bespoke number at another call site. Thirty-three call sites disagree because nobody ever
wrote down what they were supposed to agree on.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:approach -->
## 2. APPROACH

### Census before contract

The inventory is by user-reachable trigger, not by module, and it is reconciled in both directions:
every call site must appear as a reachable trigger, and every trigger reached by hand must map to a
call site. Both kinds of orphan are findings — a trigger with no call site means a surface is being
created by a path nobody has catalogued, and a call site with no trigger means dead code.

The census is not a preliminary. It is the population the criteria in `spec.md` §6 are quantified
over. "Every popover's rect is inside bounds" is meaningless until the word *every* has a list.

### Contract before code

The placement contract is written down — bounds, flip, clamp, sidebar, popped-out window, and the
per-role sizing — before any call site is edited. Then the failing numbers for A1 and A7 are
recorded against it. Only then does source change.

### Row grammar last, and mechanically

The 8 `render*Row` methods and 14 class grammars in `toolbar-renderer.ts` collapse onto
`createMenuRow` **after** placement is role-driven. This is the load-bearing ordering decision in
the phase: while a row's layout still comes from its container's class, moving a row between
containers changes how it lays out, and every substitution is a redesign. Once the row carries its
own layout, each substitution is a rename with a measurable before and after.

The two duplicate builders — `renderTitleActionsPopoverRow` and `renderViewTabPopoverRow`, identical
apart from which close method they call — go first, because they are the cheapest proof that the
substitution preserves behaviour.

### Make the submenu real before retiring the hand-built one

`column-menu.ts`'s body-mounted subpopover is the only mechanism in the plugin that actually opens a
nested surface. It is retired **onto** the factory-backed submenu, not before it: the working
mechanism is the fallback until the honest one passes A4.

<!-- /ANCHOR:approach -->
---

<!-- ANCHOR:quality-gates -->
## 3. QUALITY GATES

| Gate | Expectation |
|---|---|
| `npx tsc --noEmit` | exit 0, no output — read directly, never through a pipe |
| `npm run build` | exit 0 |
| `npm test` (`vitest run`) | all passing from the final state |
| `npm run storybook:placement` | A1-A7 asserted and passing; every check demonstrated to fail first |
| `npm run storybook:coverage` | every surface in the census covered by a story or exempt with a written reason |
| `npm run screenshots` then `npm run screenshots:verify` | full recapture, exit 0. A partial recapture cannot satisfy it |
| **Human PNG review** | a person opens every changed capture. `screenshots:verify` never opens an image and is not evidence that anything looks right |
| `npm run lint` | not a CI gate; hold the existing baseline as convention |

**No gate in this table closes a criterion on its own.** The criteria in `spec.md` §6 close on
their recorded numbers; the gates only establish that nothing else broke.

### The `styles.css` lane — take, hold, release

`styles.css` is one serialized lane (parent `spec.md` §4) and this packet is fourth in the order,
after `000`, `004` and `005`.

| Moment | Rule |
|---|---|
| **Take** | Start of Phase 5. Not earlier — Phases 1 to 4 census an unedited stylesheet, and a census of a tree nobody shipped is worthless |
| **Hold** | Phases 5 and 6. No other phase may edit `styles.css` in that window |
| **Release** | Only after all four release conditions below, in order |

1. **Full recapture** — `npm run screenshots` at 4 widths x sidebar open and closed, then
   `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**, so it cannot be this step.
3. **`008`'s early replay re-asserts every previously-closed phase.** `000`, `004` and `005` closed
   against a snapshot this packet has just edited, and nothing obliges an edit here to preserve
   their results — 87 selectors are already declared more than once and 124 property values are
   already overridden by a later block. A phase that closed earlier and does not re-close now blocks
   this release.
4. **Cascade re-confirmation** — every duplicated selector this packet touched has its computed
   winner recorded; a winner that changed carries a written disposition.

The same replay runs when a *later* phase releases the lane, which is how an edit that silently
reverses this packet's result gets caught at the next handoff instead of weeks later.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 4. ARCHITECTURE

Roles from `000`, addressed as `data-db-surface`, argued against the alternatives in `spec.md` §5.
Placement, sizing and appearance all key off the role attribute; nothing keys off ancestry.

Two mechanisms are being deleted rather than fixed, and both deserve their reason recorded:

- **The panel layout block at `styles.css:9829-9852`** — re-resolve it with
  `rg -n -B8 -A16 'max-width: min\(760px, calc\(100vw - 72px\)\)' styles.css`, never by the line
  number — declares `position`, `top`, `right`, `width`
  and `max-height` for the panels the positioner then overwrites inline. It has not decided panel
  layout for as long as the positioner has run. Leaving it in place costs a reader an hour and
  costs the next editor a wrong hypothesis.
- **`db-anchored-popover`** is stamped on every panel the positioner touches and matches no rule in
  `styles.css`. It is a marker with no reader.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 5. IMPLEMENTATION PHASES

### Phase 1 — Overlay census by user-reachable trigger

**Exit:** table complete, reconciled both directions.

### Phase 2 — Placement contract per role: bounds, flip, clamp, sidebar, popped-out window

**Exit:** contract written; A1 and A7 failing numbers recorded.

### Phase 3 — Row grammar: duplicates first, then the remaining 12 grammars, then `submenu: true`

**Exit:** A3 and A4 failing numbers recorded.

### Phase 4 — Panel parity: shared role for Filter, Sort, Column Manager, view-config; Sort's piggyback resolved

**Exit:** A2, A5 and A6 failing numbers recorded.

### Phase 5 — Implement source and `styles.css`, including both deletions

**Takes the `styles.css` lane here.** Both deletions close on AC-008's rewritten measurement, not on
the deletion itself: the before/after computed-geometry diff over the eight panel selectors and
every positioner surface must show 0 moving values, or the removal is rejected.

**Exit:** gates green; AC-008's *before* and *after* tables both recorded.

### Phase 6 — Measured placement tests in the browser harness

**Exit:** A1-A7 passing, each having failed first.

### Phase 7 — Screenshots at 4 widths x sidebar states, full recapture

**Releases the `styles.css` lane here**, and only after the four release conditions in §3.

**Exit:** human review of every changed PNG, signed off by name; `008`'s replay green for `000`,
`004` and `005` against the released tree.

### Phase 8 — Storybook: one story per role, members side by side, production mount point

**Exit:** coverage gate green.

### Phase 9 — Research gate

**Exit:** standing; fires on the rule, not the schedule.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:dependency-graph -->
## 5A. DEPENDENCY GRAPH

```
000 surface-contract  (factory + token root + honest harness)
        │
        ▼
  1 census ──▶ 2 placement contract ──┬──▶ 3 row grammar ──▶ 5 implement ──▶ 6 tests ──▶ 7 shots
                                      └──▶ 4 panel parity ──┘
        │
        └── 9 research gate: standing, fires on the rule from any step
```

The census feeds both branches, and both branches must land before implementation, because the row
grammar and the panel parity touch the same rows from opposite directions — a Filter panel row is
both a member of a role and an instance of a grammar.

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 5B. CRITICAL PATH

**census → placement contract → row grammar → implement → measured tests → screenshots.**

Panel parity is the one step off the critical path; it depends on the census but not on the row
grammar, and it can proceed while the grammar substitutions are landing commit by commit.

The path's load-bearing edge is **placement contract → row grammar**, and it is the one that will be
tempting to skip. While a row's layout still comes from its container's class, every substitution is
a redesign; once placement is role-driven and a row carries its own layout, each substitution is a
rename with a measurable before and after. Reversing these two steps is what turns a mechanical
change into an open-ended one.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 5C. MILESTONES

| Milestone | Reached when | Evidence |
|---|---|---|
| **M1 — Census closed** | every call site maps to a trigger and every trigger to a call site; orphans recorded | the census table |
| **M2 — Contract fixed** | roles, bounds and sizing written down; A1 and A7 failing numbers recorded | `spec.md` §6 populated |
| **M3 — One grammar** | `createMenuRow` is the only producer of menu rows; `submenu: true` opens a submenu | A3 and A4 pass, having failed first |
| **M4 — Parity** | Filter, Sort, Column Manager and view-config share one role and contract | A2, A5 and A6 pass |
| **M5 — Proven** | full gate set green from the final state, captures re-taken and reviewed by a person | gate output and the human review record |
| **M6 — Confirmed** | the operator sees corrected dropdowns on device | operator confirmation |

**M6 is the one that closes the phase.** Gate passage alone has already been shown to be
insufficient evidence in this program.

<!-- /ANCHOR:milestones -->
---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts`). **No DOM assertion can live
in a unit test**, and a test that string-matches `styles.css` proves a rule was typed, not that it
applies. Such tests are regression tripwires and are never cited as evidence for a criterion.

Every criterion in `spec.md` §6 is asserted in `tools/storybook/verify-placement.mjs`. That harness
today runs one 1440x900 viewport with a hardcoded 300px sidebar plus a 390x844 phone profile. This
phase extends it with:

- 1024 and 768 CSS px widths
- sidebar closed as well as open, giving 6 desktop configurations per surface
- a popped-out-window layout, which exercises the `.app-container` / `.workspace` fallback branch of
  `getVisiblePopoverBounds` that nothing currently reaches
- a container-relative pair for A3: the same canonical row in `.db-owned-menu` and in a bare `div`
- a class-deletion sweep for A6

The harness bundles the shipped positioner rather than reimplementing it. That property is
load-bearing and must survive the extension: a hand-copied positioner would only prove the copy.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

**Blocked by `000-surface-contract-and-truthful-harness`.** This phase places surfaces the factory
creates and keys rules off the role attribute the factory stamps. Starting before `000` lands means
writing placement against the mount points `000` is about to change.

**Blocks `002-properties-panel`**, and through it `003` and `006`. Once every surface goes through
the factory, the properties panel is just another surface and only its row grid remains — which is
what makes `002` a small spec instead of a second version of this one.

**Holds the serialized CSS lane** for the whole phase. No other spec may edit `styles.css`
concurrently.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

Revert the phase's commits. There is no migration and no persisted state change: roles are
attributes, placement is computed at open, and the row grammar is a rendering change.

Two rollback hazards are specific to this phase and must be named before the work starts:

1. **The recapture.** Reverting source without re-running `npm run screenshots` leaves 196 captures
   fingerprinting a stylesheet that no longer exists. A revert is not complete until the captures
   match the reverted `styles.css`.
2. **The deletions.** `styles.css:9829-9852` and `db-anchored-popover` are removed on the argument
   that nothing reads them. If a surface regresses after the deletion, the correct response is to
   restore the block and record what read it — not to re-add a replacement rule elsewhere, which
   would recreate the duplicate-declaration pattern the program exists to end.

**Rollback is per-step, not per-phase.** Steps 3 and 4 each touch many call sites; each lands as its
own commit so a regression can be bisected to a grammar rather than to the phase.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:cross-refs -->
## 9. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md)
- [`../architecture-findings.md`](../architecture-findings.md)
- [`../spec.md`](../spec.md)
- [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)

<!-- /ANCHOR:cross-refs -->

---

## 10. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md` §7 and §9 read, and `spec.md` §2 read, before any source file
- [ ] `000-surface-contract-and-truthful-harness` confirmed landed and stamping `data-db-surface`
- [ ] The trigger census covers this task's surface, reconciled in both directions
- [ ] The serialized CSS lane is held by this phase
- [ ] The criterion's failing number is recorded before the fix lands

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Census before contract, contract before code, row grammar after placement. The working hand-built subpopover stays until the factory submenu passes A4 |
| TASK-SCOPE | Only files named in `spec.md` §3 or produced by the census. The properties-panel row grid, the sheet portal and checkbox appearance belong to `002`, `003` and `004` |
| TASK-EVIDENCE | Every criterion task records the failing number before the change and the passing number after. A task reporting only the passing number has not shown the check can distinguish |
| TASK-CSS | This phase holds `styles.css` for its whole duration; every landing ends in a full recapture and a human opening every changed PNG |
| TASK-COMMIT | One commit per retired row grammar, so a regression bisects to a grammar |

### Status Reporting Format

Report per task: `T-NNN <status> — <failing number> -> <passing number>`, where status is one of
`complete`, `in progress`, `not started`, `blocked`. A criterion task with no failing number is
reported as `not started`, whatever its code state.

### Blocked Task Protocol

A task is BLOCKED when `000` has not landed, when the census does not yet cover its surface, when
the CSS lane is held elsewhere, or when its failing number cannot be measured. On BLOCK: record the
blocker in `tasks.md`, stop that task, and never substitute a class-name or call-count assertion for
the blocked measurement. When a criterion fails twice without a new hypothesis, open the standing
research gate in `spec.md` §5C rather than retrying.

