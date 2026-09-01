---
title: "Implementation Plan: Phase 003 — Group Affordances and Selection"
description: "Fix the sync at its source rather than at the surface that noticed, wire the create row to its own group, and stay off the released stylesheet lane."
trigger_phrases:
  - "006 phase 003 plan"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Phase 003 — Group Affordances and Selection

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Two pieces of work with the same failure mode: **both look done from the surface you are standing
on.**

The create row can be styled, focusable and clickable while the row it creates lands in the wrong
group — or in no group. The group checkbox can toggle and read back correctly while being completely
disconnected from every other surface that changes the selection. In both cases the obvious test
passes and the user's problem remains.

So both criteria are phrased across a boundary: the selection changes on **one** surface and is read
on **another**, and the create row is used in a **named, non-first** group and the new row's group is
read back.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

The parent's [`../plan.md`](../plan.md) §2 binds in full.

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, output read without a pipe |
| Unit | `npx vitest run` | exit 0, test count not reduced |
| Lint | `npm run lint` | at or below the existing baseline |
| Geometry and behaviour | `npm run storybook:placement` | `AC-22` and `AC-23`, each against its 000 failing number |
| Negative control | harness, per criterion | deleting the subject moves an asserted number |
| **Lane** | `npm run lane:check` | **must be free.** If this phase is holding the lane, its scope has drifted |

**Read exit codes without a pipe.** `cmd >/tmp/out.log 2>&1; echo $?`.

### Comment hygiene — hard block

No spec path, packet number, phase number, task id, ADR id or requirement id in any code comment.
Keep the durable *why*.

The sync fix is the place this rule bites here. The temptation is to record which packet found the
defect. Write instead what stops it recurring: *this list must be queried alongside the table's own
containers, because a selection change from any surface has to reach every rendered checkbox.* That
survives the packet.

### Licence boundary — hard block

Inherited unchanged. Nothing in this phase reads a capture for a value.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Fix the sync at the producer, not at the surface that noticed

The defect is that the resync routine queries the table's own containers and nothing else, so the
list's group checkbox is set once at render and never updated. The local repair — have the list
re-read the selection when it happens to notice — treats the symptom at the surface that reported it
and leaves the next surface to rediscover the same gap.

The fix belongs where the selection change is published: every rendered checkbox that represents a
selection subset resyncs, regardless of which view rendered it. If that turns out to require a change
to a shared contract rather than to a selector list, **name the seam and ask** before editing outside
this phase's scope. `SCOPE LOCK` still binds; a fix that works only by special-casing the list is
evidence the seam is wrong, not permission to widen the diff.

### The create row is wired to its group, not to the view

The affordance is per group and renders even at zero rows. Its handler carries the group's identity,
and the created row is inserted into that group's container with that group's field value already
set — which is the point of a per-group create in the first place.

The new-row-reveal guard stays keyed on the view. It is one of the two guards phase 001 must not
convert, and phase 000's tripwire covers it. **This phase must not convert it either**, and the
tripwire runs in this phase's gate for the same reason it ran in 001's.

### The group count

Counts the group's top-level rows. We have no subtask model, so top-level and total coincide. Write
the definition down anyway: a count whose definition was never stated is re-derived by the next
reader from whatever the implementation happens to do.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:affected-surfaces -->
## 4. AFFECTED SURFACES

| Surface | Change | Risk |
|---|---|---|
| The selection resync routine | queries every rendered selection checkbox, not only the table's | **medium-high** — shared by every grouped view |
| The list's group container | the create handler carries the group's identity | medium |
| The bulk action bar | parity with the table | low |
| `styles.css` | **none.** The lane is released and is not retaken | — |

<!-- /ANCHOR:affected-surfaces -->
---

<!-- ANCHOR:phases -->
## 5. STAGES

| Stage | What | Gate before the next |
|---|---|---|
| A | Confirm the lane is free and the census cells for `AC-22` and `AC-23` are filled | Lane free, no blank cell |
| B | Fix the selection resync at its source | `AC-22` — change from the toolbar, read the list group checkbox |
| C | Wire the per-group create row to its own group | `AC-23`, plus a row landing in a **named, non-first** group and in a **zero-row** group |
| D | The group count, with its definition written down | The count matches the group's top-level rows |
| E | Bulk action bar parity | The list's bar offers what the table's offers |

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom.

| Claim | Where |
|---|---|
| Which checkboxes a selection change should reach | `vitest`, over the selection model |
| That they actually resync in a rendered view | `tools/storybook/verify-placement.mjs` |
| That a created row lands in the right group | the same harness |
| Appearance | not this phase. 002 owns it |

Coverage floor: happy path plus one edge case per public surface changed. The edge case for the sync
is a group that becomes indeterminate; the edge case for the create row is a zero-row group.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

| Dependency | Kind | Note |
|---|---|---|
| Lane released by 002 | **blocking** | Both 003 and 004 would otherwise want to edit `styles.css` |
| Phase 000 census | blocking per criterion | `AC-22` and `AC-23` "today" cells |
| Phase 001 group structure | blocking | The create row attaches to a group container 001 builds |
| Phase 000's `AC-32` tripwire | gate | It runs here too. This phase must not convert the reveal guard either |
| No new npm package | constraint | The scoped result does not require one |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

One commit per stage; `git revert` of that commit.

The sync fix is the one with a wider blast radius, because the resync routine is shared by every
grouped view. Revert it whole. No stylesheet is touched, so no recapture obligation follows a revert
here — which is the reason this phase sits after the lane release rather than inside the hold.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```text
002 lane released ──> 003 (this phase)   [independent of 004]
                        |
                        +--> B sync fix ──> AC-22
                        +--> C create row ──> AC-23
                        +--> D count
                        +--> E bulk bar
```

003 and 004 may run in either order or in parallel. Neither may start before the lane is released.

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Stage | LOC | Files |
|---|---|---|
| B | ~90 | 2 |
| C | ~110 | 2 |
| D | ~30 | 1 |
| E | ~70 | 2 |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

| Trigger | Action |
|---|---|
| `AC-22` passes without the fix | The criterion is reading the surface it changed. Rewrite it to cross a boundary before touching the code |
| The sync fix changes behaviour in another grouped view | Revert whole. The routine is shared; re-derive which checkboxes it should reach before retrying |
| The create row lands a row in the wrong group | Do not special-case the first group. That is the single-group fixture problem reappearing as an implementation |
| This phase needs the lane | Its scope has drifted. The styling belonged in 002 or belongs in a follow-on packet |

<!-- /ANCHOR:enhanced-rollback -->
