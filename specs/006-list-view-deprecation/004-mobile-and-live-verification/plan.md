---
title: "Implementation Plan: Phase 004 — Mobile and Live Verification"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Phone targets justified without the reference, the two deferred guards taken one at a time, and a device check that names the two affordances that had zero rules."
trigger_phrases:
  - "006 phase 004 plan"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Implementation Plan: Phase 004 — Mobile and Live Verification

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

The last phase, and the only one whose closing evidence is a person rather than a number.

Its structure follows from one observation about the packet's failure mode. Release 1.3.1 shipped
real code, passed every gate, and the operator reported nothing had changed. Every phase before this
one is designed so that a green gate means something; **this phase is the one that finds out whether
it did.** Putting it inside another phase would mean the phase declaring victory also gets to run the
check on itself.

The two deferred guards come along because they had nowhere better to sit, not because they are
related to mobile. They are taken one at a time and each is judged on its own edge case.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

The parent's [`../plan.md`](../plan.md) §2 binds in full.

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, output read without a pipe |
| Unit | `npx vitest run` | exit 0, test count not reduced |
| Geometry | `npm run storybook:placement` at phone width | `AC-24`, `AC-25` |
| Bench | `npm run bench` | `NFR-01` still within 20 percent at the end of the packet |
| Captures | `npm run screenshots` then **human review** | final sign-off across the whole packet |
| Capture manifest | `npm run screenshots:verify` | exit 0 |
| **Device** | the operator opens the plugin | `AC-26`. **No substitute exists** |
| **Lane** | `npm run lane:check` | **must be free** |

### Comment hygiene — hard block

No spec path, packet number, phase number, task id, ADR id or requirement id in any code comment.
Keep the durable *why*.

The patch fast path is where this bites here. Write what the next reader needs — *this path refuses
rather than applying to a subset, because a partial application looks correct and a full refresh does
not* — rather than which phase deferred it.

### Licence boundary — hard block

Inherited unchanged, and it has an extra edge in this phase: **no capture shows a narrow or phone
width**, so nothing here may cite one. A phone criterion is justified by platform guidance and our
own measurement, and saying so is part of the criterion.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### The two deferred guards, one at a time

Neither is needed to make the list a grid, which is why they were held back from the nine-guard
conversion. Each changes behaviour under concurrent edits and each gets its own commit.

**The external-row-patch fast path.** Today a non-table view falls through to a full refresh.
Extending it means the list starts applying partial updates. The rule is the one the parent already
records as an edge case, and it is a rule about **refusing**: with two groups, one collapsed, and an
external row change, the patch path applies to **both or neither**. A partial application is worse
than a full refresh, because a full refresh is visibly slow and a partial application is invisibly
wrong.

**The optimistic update on the title field.** Today the list's title field forces a full refresh. The
question was deferred from 001, and the thing it concerns has changed since: the list's title cell is
now the grid's title cell. So this is re-decided here rather than inherited.

### Phone targets are justified without the reference

Every primary capture is wide desktop. The 44px floor, the toolbar sort fallback and the touch
predicate are ours. Two consequences:

1. No criterion in this phase cites a capture.
2. If a phone layout choice conflicts with the desktop shape the reference established, the conflict
   is recorded rather than resolved by assuming the reference would have done the same thing. It
   might not have; four desktop screens cannot say.

### The device check names what it is checking

"The screen changed" is satisfied by any visible difference, which makes it a weak question at
exactly the moment the packet needs a strong one. The device check therefore names the two
affordances that carried **zero** CSS rules at the start of this packet — the per-group create button
and the row checkbox — and asks whether **those** are visible and usable, alongside the general
question.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:affected-surfaces -->
## 4. AFFECTED SURFACES

| Surface | Change | Risk |
|---|---|---|
| The external-row-patch guard | the list joins the fast path | **medium-high** — behaviour under concurrent edits |
| The optimistic-update guard | re-decided for the list's title cell | medium |
| Phone-width behaviour | touch targets and the toolbar sort fallback | medium |
| Focus rings | across every element the packet introduced | low |
| `styles.css` | **none.** The lane is released and is not retaken | — |
| The 216 captures | final review pass | low — 002 already regenerated them |

<!-- /ANCHOR:affected-surfaces -->
---

<!-- ANCHOR:phases -->
## 5. STAGES

| Stage | What | Gate before the next |
|---|---|---|
| A | Confirm the lane is free and 001-003 have landed | Lane free; the packet's other phases closed |
| B | Phone layout and touch targets | `AC-24` at phone width, both targets at the floor |
| C | Focus rings across the packet's new elements | `AC-25`, no bare `outline: none` |
| D | The external-row-patch guard | The both-or-neither edge case, explicitly tested |
| E | The optimistic-update guard, re-decided | Q-P4-01 answered and recorded |
| F | Final recapture review and bench | Manifest exit 0; `NFR-01` still within 20 percent |
| G | **Device verification by the operator** | `AC-26`. The packet does not close without it |

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom.

| Claim | Where |
|---|---|
| Which rows a patch should touch | `vitest`, over the patch model |
| Touch target geometry, focus rings | `tools/storybook/verify-placement.mjs` at phone width |
| That the patch refuses rather than partially applying | the harness, with a collapsed group in the fixture |
| That the screen changed | **a person, on a device** |

Coverage floor: happy path plus one edge case per public surface changed. The patch path's edge case
is the collapsed-group refusal, and it is the reason the guard was deferred rather than swept.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

| Dependency | Kind | Note |
|---|---|---|
| Lane released by 002 | **blocking** | This phase does not retake it |
| Phases 001-003 landed | **blocking for `AC-26`** | The device check is on the whole packet |
| Phase 000 census | blocking per criterion | The "today" cells this phase owns |
| **The operator** | **blocking for closure** | `AC-26` has no automated substitute |
| No new npm package | constraint | The scoped result does not require one |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

One commit per stage. The two guard changes are separate commits so either can be reverted without
the other — which is the whole reason they were deferred out of 001's single atomic conversion.

No stylesheet is touched, so no recapture obligation follows a revert here.

If the device check fails — the operator opens the plugin and the screen looks unchanged — **the
packet does not close.** That is not a rollback trigger for this phase; it is a finding about an
earlier one, and it is routed back to the phase whose criteria passed while its subject stayed
invisible.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```text
002 lane released ──> 004 (this phase)   [independent of 003]
                        |
                        +--> B phone targets
                        +--> C focus rings
                        +--> D patch guard      (own commit)
                        +--> E optimistic guard (own commit)
                        |
                        v
              001+002+003 landed ──> G DEVICE VERIFICATION ──> packet closes
```

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Stage | LOC | Files |
|---|---|---|
| B | ~70 | 2 |
| C | ~40 | 2 |
| D | ~80 | 1 |
| E | ~60 | 1 |
| F-G | 0 | 0 |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

| Trigger | Action |
|---|---|
| **The operator says the screen looks unchanged** | The packet does not close. Route the finding back to the phase whose criteria passed while its subject stayed invisible — do not patch it here |
| The patch path applies to one of two groups | Revert that commit. Partial application is worse than a full refresh because it looks correct |
| A touch target cannot reach 44px without overlapping another | Change the layout, not the floor |
| A phone choice conflicts with the desktop shape | Record the conflict. Four desktop captures cannot say what the reference would have done |
| This phase needs the lane | Its scope has drifted. Phone rules belonged to 002 |

<!-- /ANCHOR:enhanced-rollback -->
