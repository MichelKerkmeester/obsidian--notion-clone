---
title: "Implementation Plan: Phase 002 — ClickUp Chrome"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). The visual language, written against numbers phase 000 recorded, with a negative control per criterion and a human capture review before the lane is released."
trigger_phrases:
  - "006 phase 002 plan"
  - "lane release conditions"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Implementation Plan: Phase 002 — ClickUp Chrome

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

This is the phase the packet's ordering argument was built around, and the argument is worth
restating where the work happens rather than only where it was decided.

**This phase does not get to write its own failing numbers.** Phase 000 wrote them, before any
stylesheet edit existed to bias them. The reason is specific rather than general: the two affordances
the operator pointed at carry zero CSS rules each, while the row containing them carries 18. A phase
asked to style the list reaches for the row, because the row is where the rules are, and passes
honestly while both affordances stay invisible.

Four mitigations, in order, and none is optional:

1. Numbers come from 000.
2. Every criterion names its **own affordance**, not the row containing it.
3. Every criterion carries a **negative control**: delete the node, an asserted number must move.
4. The lane is released only after a **human looks at the images**.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

The parent's [`../plan.md`](../plan.md) §2 binds in full. This phase adds the capture gates.

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, output read without a pipe |
| Unit | `npx vitest run` | exit 0, test count not reduced |
| Geometry and behaviour | `npm run storybook:placement` | every criterion, each against its 000 failing number |
| **Negative control** | harness, **per criterion** | deleting the subject moves an asserted number. Nothing moves ⇒ the check is theatre ⇒ rejected |
| Contrast | computed-style probe, **both themes** | 4.5:1 text, 3:1 control-identifying border |
| Captures | `npm run screenshots` then **human review** | diffs **explained**, not merely regenerated |
| Capture manifest | `npm run screenshots:verify` | exit 0. A partial recapture cannot satisfy it |
| Catalogue | `npm run story:smoke` | list stories render at production mount points |
| Bench | `npm run bench` | `NFR-01` still within 20 percent. A chrome regression is still a regression |
| Lane | `npm run lane:check` | held while `styles.css` is dirty; **released** only on the four conditions below |

**The capture-manifest check is not a visual gate.** It proves a capture was regenerated after its
source changed. It never opens an image. The human review is the visual gate and it is not optional.

**Read exit codes without a pipe.** `cmd >/tmp/out.log 2>&1; echo $?`.

### Comment hygiene — hard block

No spec path, packet number, phase number, task id, ADR id or requirement id in any code comment,
including in `styles.css`. Keep the durable *why*.

A stylesheet that reverses itself invites the bookkeeping comment most of all — the temptation is to
write which packet last touched a duplicated block. Write instead what makes the block
non-obvious: *this rule is declared twice and the later block wins; changing the earlier one has no
effect.* That is true after this packet closes. A packet number is not.

### Licence boundary — hard block

`external/anytype` and `external/appflowy` are read for **behaviour** only. The same for ClickUp:
match the interaction model, reproduce no asset, no CSS and no token.

**This is the phase where the boundary is easiest to cross**, because this is where the values are
written. The captures supply **shape** — filled versus outlined, capsule versus rounded rectangle,
hugging versus uniform width, reserved versus inserted space, truncating versus wrapping. The token
scale supplies **value**. No measured pixel, radius, hex or duration from any source reaches this
repository, and `AC-20` counts literals introduced off the scale with a target of zero.

### The `styles.css` lane — inherited held, released here

`styles.css` is a single serialized lane and **216 captures** currently fingerprint it. This phase
inherits the lane held from 001 and is the only phase that may release it.

**Release conditions, all four, in order:**

1. Full recapture at four widths, **both themes**, then the capture-manifest check exit 0.
2. **Human capture review, signed off by name** in `checklist.md`.
3. Every duplicated selector touched has its **computed winner recorded before and after**. The
   stylesheet is documented as reversing itself — 87 selectors declared more than once, 124 property
   values overridden by a later block. A block that looks dead is not.
4. `005`'s live-verification phase re-asserts against the released tree, because both packets edit
   this file.

Phases 003 and 004 must not require a second take. Any styling they need is written here or deferred
to a follow-on packet.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Everything keys off `data-db-row-style`

No visual rule keys off ancestry. The attribute selects chrome; the structure underneath is 001's and
is frozen here. This is what makes the list a presentation of the grid rather than a second grid.

### What the reference actually constrains

Each row below is a **shape class**, not a value. The value comes from the token scale.

| Concern | Shape the reference shows | Ours |
|---|---|---|
| Row rhythm | Flat, full-bleed, no inter-row gap, one hairline divider, one vertical boundary where the pinned first column ends | Same shape; the divider's presence rests on the secondary source because dark-theme capture scale does not resolve it |
| Group header | Value in the **grouped field's own** treatment, count numeral beside it, plus a non-colour glyph when the field carries colours | Same. A field without per-option colours yields a neutral chip and two such groups look alike — correct, not a defect |
| Leading gutter | Reserved at rest, empty, filled on reveal with a grip and checkbox, **beside** a record glyph that does not move | Same. Not a swap and not a column |
| Row actions | A cluster right-aligned inside the title column, and an overflow menu in the same trailing track as the header's add-column affordance | Observed; **not required here** |
| Select cells | Filled pill, chevron at its right edge, uniform width within the column, unset renders a dash at the pill's left edge | Filled pill and chevron required (`FR-21`). Uniform width is ADR-P2-02, open |
| Multi-value cells | Outlined chips; an overflow chip **and** a separate trailing add affordance can appear in the same column | Same, `FR-22`, P2 — and see the U-item candidate in `spec.md` §4.1 |
| Empty cells | Type-dependent: a dash for unset select and numeric, an add affordance for unset date and assignee, an outline glyph for unset priority | Same shape classes |
| Text | Truncates; no row occupies two text lines | Same, after 001 removed the wrapping default |

### The pill colour is categorical, and that is load-bearing

The reference's select-pill colours run six unrelated hues with no monotonic progression. The mapping
is **categorical** — each option carries a colour its author picked — and any ascending reading is a
coincidence of those picks. `FR-21` requires the colour to come from the option's configured colour
and **never** from the value's magnitude. An ordered quantity encoded as unordered hue is a defect,
not a pattern to copy.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:affected-surfaces -->
## 4. AFFECTED SURFACES

| Surface | Change | Risk |
|---|---|---|
| `styles.css` | the bulk of this phase | **high** — serialized lane, 216 captures, a stylesheet that reverses itself |
| The cell renderer | the dropdown affordance at rest for select and status cells | medium — it changes a resting DOM shape both views render |
| The view config panel | density offered for list | low |
| The 216 captures | fully regenerated | high — a partial recapture cannot satisfy the manifest check |

<!-- /ANCHOR:affected-surfaces -->
---

<!-- ANCHOR:phases -->
## 5. STAGES

| Stage | What | Gate before the next |
|---|---|---|
| A | Confirm the lane is held and every "today" cell this phase owns is filled | No blank cell |
| B | Row rhythm, dividers, flat full-bleed | `AC-14` with its negative control |
| C | The **two zero-rule affordances first** — the create button and the row checkbox | `AC-12`, `AC-13`. These go first because they are the ones a green phase leaves behind |
| D | The reserved leading gutter | `AC-16` — positions identical in hover, focus and select, and the checkbox box never intersects the record glyph's |
| E | Group header pill, count, non-colour signal | `AC-15` (scoped), `AC-27` (the one that must hold for **every** group field) |
| F | Chip and pill treatments, dropdown affordance at rest, placeholders | `AC-29`, `AC-21`, `FR-22` after its evidence is re-examined |
| G | Density | `AC-19` — three distinct measured row heights |
| H | Contrast, focus rings, motion bands, **both themes** | `NFR-03`, `NFR-05`, `NFR-06` |
| I | Full recapture, human review, duplicated-selector winners recorded, **lane release** | All four release conditions, in order |

Stage C is deliberately first among the affordance work. If this phase runs out of budget, the two
things that must not be left unstyled are the two that are unstyled today.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom. Every claim in this phase is about computed style,
geometry or appearance, so **almost nothing here is a unit test**.

| Claim | Where |
|---|---|
| Which token a rule resolves to | source assertion |
| Computed style, geometry, hit testing, focus | `tools/storybook/verify-placement.mjs`, system Chrome |
| Appearance | `npm run screenshots` plus **human review** |
| Contrast | computed-style probe, both themes |

Coverage floor: happy path plus one edge case per public surface changed. Above the floor a new test
earns its place by failing for one real reason no current test catches. Do not add a check per token
or per selector — that mirrors the implementation and asserts the stylesheet against itself.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

| Dependency | Kind | Note |
|---|---|---|
| Phase 001 landed | blocking | Structure frozen; the lane handed over held |
| Phase 000's census | blocking per criterion | A blank "today" cell blocks the task that would fill the target |
| `005`'s live verification | blocking for **release** | Both packets edit `styles.css` |
| A named human reviewer | blocking for **release** | Condition 2 is a signature, not a command |
| No new npm package | constraint | The scoped result does not require one |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

One commit for the stylesheet work, plus the recapture commit.

**The recapture is the part that makes a revert non-trivial.** `css-lane.json` records `baselineHash`
and `baselineCommit` at take. Rolling this phase back means restoring `styles.css` to the recorded
baseline **and** recapturing, because the 216 PNGs on disk would otherwise describe a stylesheet that
no longer exists. A revert without a recapture leaves the repository internally inconsistent and the
next manifest check fails.

If the human review rejects the result: **the lane stays held.** Fix and recapture. Never release on
a manifest pass alone.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```text
001 (lane held, structure frozen) ──> 002 stages A-H
                                            |
                                            v
                                      I recapture
                                            |
                          +-----------------+-----------------+
                          |                 |                 |
                    manifest exit 0   HUMAN REVIEW    dup-selector winners
                          |                 |                 |
                          +-----------------+-----------------+
                                            |
                                   005 re-asserts
                                            |
                                            v
                                     LANE RELEASED
                                            |
                                  +---------+---------+
                                  |                   |
                                003                 004
```

003 and 004 are independent of each other and may run in either order or in parallel. **Neither may
start before the lane is released**, because both would otherwise want to edit `styles.css`.

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Stage | LOC | Files |
|---|---|---|
| B-C | ~150 | 1 |
| D | ~90 | 1 |
| E | ~120 | 2 |
| F | ~180 | 2 |
| G | ~60 | 2 |
| H | ~100 | 1 |
| I | 0 | 216 captures regenerated |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

| Trigger | Action |
|---|---|
| A negative control moves nothing | The criterion is theatre. **Rewrite it, do not waive it.** This is what passed in release 1.3.1 |
| The human capture review rejects the result | Lane stays held. Fix and recapture. Never release on a manifest pass alone |
| A duplicated selector's computed winner changed unexpectedly | Stop and record both winners. A block that looks dead is not, and 124 property values in this file are overridden by a later block |
| Contrast fails in light theme only | Not a partial pass. No capture shows light theme; it is ours to get right |
| `005` needs the lane urgently | Reach a releasable state or revert to baseline. There is no shared-hold mode |
| Bench regressed under chrome | Do not release. A chrome regression is still a regression |

<!-- /ANCHOR:enhanced-rollback -->
---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

| Node | Depends on | Produces |
|---|---|---|
| Lane held | 001 | The right to edit `styles.css` |
| Census cells | 000 | A prior failure for every criterion here |
| Zero-rule affordances styled | lane | `AC-12`, `AC-13` — the two the operator pointed at |
| Leading gutter | structure from 001 | `AC-16` non-reflow in three states |
| Group header treatment | structure from 001 | `AC-15` scoped, `AC-27` universal |
| Recapture | every stage above | The manifest, and something for a human to look at |
| Human sign-off | recapture | The only visual gate |
| Lane release | all four conditions | 003 and 004 unblocked |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

`census → zero-rule affordances → gutter → group header → recapture → human sign-off → lane release`

The human sign-off is on the critical path on purpose. It is the only step in this packet that can
detect the failure this packet exists to prevent, and it is the one every automated gate would let
you skip.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Definition of done |
|---|---|
| M2.1 | `db-list-group-new` and `db-list-row-checkbox` each have authored declarations applying at the production mount point, and deleting either node empties its measurement |
| M2.2 | The leading gutter reveals without moving the chevron, glyph or title, in hover, focus and select |
| M2.3 | Two group values are distinguishable **without colour** |
| M2.4 | Contrast passes in both themes; focus rings visible; motion in band |
| M2.5 | Full recapture, manifest exit 0, duplicated-selector winners recorded |
| M2.6 | **A named human has looked at the images and signed off**, and the lane is released |

<!-- /ANCHOR:milestones -->
