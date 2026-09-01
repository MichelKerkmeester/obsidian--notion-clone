---
title: "Implementation Plan: Production Surface Integration and Release Observability"
description: "Approach, gates and rollback for the early handoff replay, the CSS lane ledger, the capture-review sign-off, and the late release gate with its parity traces and retirements."
trigger_phrases:
  - "008 integration plan"
  - "handoff replay"
  - "replay matrix"
  - "css lane ledger"
  - "retirement order"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Production Surface Integration and Release Observability

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Six implementation phases across two deliverables, on two schedules. **Inside this packet, "Phase N"
always means one of those six; the program's own phases are always written as folder numbers —
`000`, `001`, `004` and so on.**

**Deliverable A ships first, before `001` starts** (Phases 1-3): the handoff replay that re-asserts
every closed phase's criteria against the current tree, the CSS lane ledger that makes "one holder at
a time" a check rather than a sentence, and the capture-review sign-off that gives the human PNG
review an artefact and a gate. All three run at every lane handoff from `000`'s release onward.

**Deliverable B ships last** (Phases 4-6): the full §4A grid, the parity traces, the compatibility
retirements, the dead-block deletions, and the release decision.

The order matters more here than anywhere else in the program, in two ways. **The negative controls
come before the first real result**, because a replay that cannot fail is exactly the artefact this
program was written to eliminate — one level up and more expensive. And **A comes before the phases it
guards**, because a gate delivered after the work it was meant to gate is a report, not a gate.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Deliverable | Pass condition |
|---|---|---|---|
| Types | `npx tsc --noEmit` | A | exit 0 |
| Build | `npm run build` | A | exit 0 |
| Unit | `npx vitest run` | A | exit 0, no reduction in count. **Regression guard only** — see below |
| Lane ownership | `npm run lane:check` | A | 0 when `styles.css` matches the ledger baseline, or the requesting phase is the recorded holder; non-zero otherwise |
| Capture review | `npm run lane:capture-review` | A | every changed PNG carries a non-`regression` verdict from a named reviewer on a date |
| Handoff replay | `npm run integration:handoff` | A | every closed phase's recorded criteria re-assert green against the current tree; every result admissible against its recorded input hashes |
| Registry equality | `npm run integration:registry` | A | observed roots = registry entries, both directions |
| Negative controls | `npm run integration:controls` | A, B | all six controls fail the run |
| Cascade replay | `npm run integration:cascade` | A, B | zero unknown contexts; no computed winner changed unexpectedly |
| Replay matrix | `npm run integration:replay` | B | every §4A coordinate driven, every assertion green |
| Parity trace | `npm run integration:parity` | B | one recorded trace per retired path, all six dimensions agreeing |
| Captures | `npm run screenshots` then the §4C sign-off | B | diffs explained per image, with stylesheet hash and producer set recorded |
| Device | `../009-live-verification` or manual | B | operator review recorded, scope named; a red review blocks |

**`npx vitest run` is a regression guard and is evidence for no criterion in this phase.** It runs
`environment: "node"` with no jsdom (`vitest.config.ts:16`), so the 410-test suite exercises pure
logic and cannot assert anything about a rendered surface. It appears above because a broken import or
a changed pure function should still turn the build red — not because a green suite says anything
about the product. `../adversarial-review.md` O3 records this because every phase in this program
lists vitest as a quality gate, and the listing invites exactly the mistake 1.3.1 made.

**Per push:** lane ownership, registry equality and the negative controls.
**Per lane handoff:** the handoff replay, the cascade replay and the capture-review sign-off.
**Per release candidate:** the full grid.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**The runner holds no list.** It reads `000`'s typed registry and derives the grid from it, so a
surface added after this phase is written is driven automatically and an entry deleted from the
registry disappears from the grid. A runner with its own inventory would drift the moment the
registry grew, and the drift would be invisible — which is the failure mode this whole program
exists to make impossible.

**The runner holds no hash function either.** Input-hash recording is `000`'s, built once for the
whole program (`../adversarial-review.md` F17). This phase reads the hashes on every artefact it
consumes and refuses one whose recorded inputs do not match the tree. Building a second recorder here
would put two vintage systems in a repository whose entire problem is two systems disagreeing.

Five artefacts, deliberately separate because they answer different questions and fail for different
reasons:

*`handoff-replay.mjs`* answers **is every already-closed phase still true**. It reads each closed
phase's recorded criteria, re-asserts them against the current tree, checks each result's input
hashes for admissibility, and calls the cascade replay. It is deliberately small: it re-runs recorded
assertions, it does not expand the full grid. That is what lets it run at every handoff instead of
once.

*`check-lane.mjs`* answers **who may edit `styles.css` right now**. It owns
`tools/lane/css-lane.json`, acquires exclusively, verifies by content hash, and refuses a release
whose handoff replay or capture review is not green.

*`check-capture-review.mjs`* answers **did a human actually look**. It derives the changed-PNG set
from image bytes rather than from the hand-maintained source list, and refuses a release whose
`capture-review.md` does not cover it.

*`replay-matrix.mjs`* answers **does every surface still behave**. It drives producers, applies
transitions, asserts outcomes, and records one row per `producer x branch x mount x environment x
transition` cell. Its output is a matrix with named holes, not a pass/fail bit; a coordinate that was
never driven is reported as a hole rather than counted as a pass.

*`cascade-replay.mjs`* answers **did a later stylesheet edit reverse an earlier result**. It resolves
computed winners at real production mounts, per theme and per media context, and diffs them against
the recorded set from `000`'s cascade audit. It is called by the handoff replay after every lane
holder, not only at the end, because the point is to catch the reversal in the week it happened.

*`compat-parity.mjs`* answers **may this old path be removed**. Per migrated family it traces the old
and new paths side by side across placement, dismissal, focus, tokens, refresh and cleanup, and emits
a recorded artefact that the retirement commit cites.

**Why the handoff replay is minimal.** A handoff gate that takes an hour is a handoff gate that gets
skipped, and this repository has the scar: `.github/workflows/gates.yml` exists because checks that
ran when someone remembered stopped running. Deliverable A re-runs recorded criteria and computed
winners. It does not expand the grid. Its runtime is recorded and is a closure criterion, not an
afterthought.

**Why the lane needs a file and not a rule.** `004` and `005` both unblock after `000`, and an
autonomous runner reads "exactly one phase holds `styles.css` at a time" as documentation. A content
hash in a ledger is not documentation: a phase that edits without acquiring cannot have written the
baseline, so the drift is visible at the next check. The mechanism is fully specified in `spec.md`
§4B — file, schema, sub-commands, exit codes and message — so it can be built without another
decision.

**Why the capture review needs an artefact.** `screenshots:verify` compares recorded source
fingerprints (`tools/screenshots/verify.mjs:45-48`); its only PNG operation is an existence check. The
human review that compensates was a sentence in four specs with no reviewer, no date and no gate. The
sign-off is specified in `spec.md` §4C — file, section, table, closed verdict vocabulary and the seven
conditions that fail it.

**Why the replay owns retirement.** The phase that builds a new path is the wrong phase to certify
that the old one is safe to delete — its evidence and its incentive both point the same way. Giving
retirement to the replay owner separates them: the family's author proves the new path works, and the
replay owner proves the old path is no longer load-bearing.

**Why this is not a screenshot collection.** A capture proves a frame rendered. It cannot show that a
tap landed on the sheet, that focus returned to the trigger, that exactly one owner dismissed, that
the anchor re-resolved after a refresh, or that no listener leaked. Those are the failures this
program shipped, and they are all invisible to an image.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

The six numbered phases below are this packet's implementation units, not program phases.

### Deliverable A — before `001` starts, gating every lane release after `000`'s

#### Phase 1 — The handoff replay, and proof that it can fail

Build `handoff-replay.mjs` against `000`'s registry and `000`'s input-hash recorder. Then, before
recording a single real result, seed a known cascade reversal into an already-closed phase's surface —
restoring one duplicate block `000`'s audit classified dead is the cheapest — and require the replay
to go red **in that phase's cells and nowhere else** (N12). Also seed a staled result and require it
rejected on admissibility (N11). A control that does not fail is a bug in the runner, not a property
of the tree. Record the wall-clock runtime; it is a closure number, because a slow gate is a skipped
gate.

#### Phase 2 — The lane ledger and the capture-review sign-off, wired per push

Build `check-lane.mjs` and `tools/lane/css-lane.json` to the schema in `spec.md` §4B, and
`check-capture-review.mjs` to the format in §4C. Demonstrate N13 (a non-holder edit exits non-zero
naming both phases and the drifted hash; an unmodified tree exits 0) and N14 (deleting one row from a
complete sign-off refuses the release; restoring it allows it). Wire `lane:check`, registry equality
and the controls into `.github/workflows/gates.yml` so they run on every push at the existing gate
budget. The full grid stays out of the per-push set deliberately.

`tools/lane/` gets a `README.md` and `tools/integration/` gets `README.md` and `CODE.md`:
`tools/naming/scan-folder-docs.mjs` scans `tools` and owes both docs at or above `THRESHOLD = 3`
direct source files. `gates.yml` already runs that scanner, so skipping this turns the pipeline red
for a reason unrelated to the work.

#### Phase 3 — Cascade re-confirmation at every lane handoff

Build `cascade-replay.mjs` and run it, through the handoff replay, the moment each phase releases
`styles.css`. Diff computed winners against `000`'s recorded audit. An unknown context blocks the
handoff; it is never resolved by taking the last declaration. **This stage runs repeatedly across the
program's life rather than once**, and it is the specific mechanism that closes F7: a reversal is
caught at the handoff in the week it happened, not at release.

**Deliverable A's exit criterion:** AC-011 green — a deliberately reintroduced cascade reversal in an
already-closed phase's surface fails the handoff replay and reddens only that phase's cells — together
with AC-012, AC-013, AC-002, AC-009 and AC-010. Until these are green, no phase after `000` may
release the CSS lane.

### Deliverable B — after `006` closes, gating the release

#### Phase 4 — The full grid and its six controls

Build `replay-matrix.mjs` and expand the whole §4A grid from the registry. Demonstrate all six
negative controls failing before recording a real result. Report holes as holes.

#### Phase 5 — Parity traces

Build `compat-parity.mjs` and run one trace per migrated family: the three no-option positioner paths
and the compact family from `000`; the bespoke and owned-menu families from `001`; the sheet-capable
surfaces from `003`. Each trace is recorded before any removal is proposed, and a disagreeing trace is
demonstrated to block a removal (N9).

#### Phase 6 — Retirement, final evidence, release decision

Retire compatibility paths one disposition at a time, in a total order recorded before the first
removal, each as its own revertable commit citing its parity trace. Delete the CSS blocks `000`'s
audit classified dead **and** the replay confirms inert. Then: final cascade replay on the
post-deletion file, full grid, full recapture with the stylesheet hash and producer set recorded, the
§4C capture-review sign-off, and the operator's device review through `../009-live-verification` —
including the rehearsal in which a red review actually blocks a release (AC-008).

The release decision is the eight-gate matrix below, and every gate is a block rather than a warning.

| Gate | Blocks release when |
|---|---|
| Lane ownership | The ledger's holder does not match the tree, or a release was taken without a green handoff replay |
| Capture review | Any changed PNG lacks a verdict, or any verdict is `regression` |
| Handoff replay | Any already-closed phase's recorded criterion fails against the final tree |
| Registry equality | Any observed surface is unregistered, or any declared entry is unexercised |
| Boundary isolation | Portal, shadow or top-layer tokens leak, or a host variable or root class changed |
| Transition semantics | Refresh, dismissal, focus, keyboard or scroll ownership, or owner teardown diverges |
| CSS lane cascade | Any duplicate has an unknown context, or a computed winner changed unexpectedly |
| Migration parity | Any retired path lacks an agreeing old/new trace, or the prior matrix was not re-run |
| Device / operator | Real host chrome and human review have not confirmed the captured outcome |

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts:16`), so **every assertion about
a surface in this phase lives in the browser runner, and the vitest suite is evidence for no criterion
here.** Node and vitest remain correct for the tooling's own pure logic — grid expansion from the
registry, matrix hole detection, parity diffing, ledger state transitions, capture-review parsing —
and that logic is unit tested, because a runner with a silent bug reports green for the wrong reason.
That is a test of the instrument, not of the product.

Every replay row must drive a **real producer**, assert the expected mount and role, mutate the
relevant environment or lifecycle, re-resolve the semantic target, perform the user action, and verify
focus and cleanup. A number taken from a single static frame is not evidence for a stateful surface,
and every surface in this program is stateful.

The runner's own honesty is tested the same way it tests the product: by substitution. Point it at a
tree with a known defect — reverting `000`'s token-root line is the cheapest — and require the matrix
to go red in the specific cells that defect touches, and nowhere else. The handoff replay gets the
same treatment with a seeded cascade reversal (N12), and the two enforcement mechanisms get theirs
with a seeded non-holder edit (N13) and a seeded incomplete sign-off (N14).

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

Hard, for Deliverable A: `000`'s typed registry, `SurfaceHandle`, `AnchorRef` lease, cascade audit and
**input-hash recorder**. Nothing in this phase can be built before `000` Stage 6. This is the
constraint that fixes A's earliest possible date, and it is why A is scheduled in the window between
`000` closing and `001` starting rather than earlier.

Hard, for Deliverable B: every sibling phase's local evidence, handed forward as matrix rows at close.

Soft but load-bearing: `../009-live-verification` for the device half of REQ-008. Where `009` cannot
reach — phone in particular — the manual review is the documented fallback and is named as such rather
than quietly skipped.

This phase **owns the lane ledger from Phase 2 onward without holding the lane**, and it **holds
`styles.css` last**, for the deletions, releasing it only into the release candidate.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- Phases 1-5 add tooling only; reverting removes gates and restores the previous (weaker) evidence.
  Reverting Phase 2 specifically returns the CSS lane to an unenforced convention, so it is reverted
  only with the same deliberation as a scope change.
- Phase 6 is the only destructive one. A byte-exact `styles.css` checkpoint is taken before the
  first deletion and retired only after release.
- Each retirement is its own commit citing its parity trace, so a regression is a single revert
  rather than an unpick.
- On any replay regression after a retirement: restore the checkpoint, re-run the prior matrix, and
  report to the family's owning phase. Do not patch forward — a forward patch by the replay owner
  destroys the independence that makes the parity trace worth anything.
- The lane ledger is append-only in its `history`; a bad `acquire` is undone by `release` with the
  reason recorded, never by hand-editing the file, because a hand edit that does not match
  `sha256(styles.css)` fails `verify` on the next run anyway.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
000 registry + handle + input-hash recorder
        │
        ├──▶ Phase 1  handoff replay + N11, N12          ┐
        ├──▶ Phase 2  lane ledger + capture review + N13, N14  ├─ DELIVERABLE A
        └──▶ Phase 3  cascade re-confirmation (recurring) ┘   (before 001 starts)
                        │
   every lane handoff ──┘  004 → 005 → 001 → 002 → 003 → 006
                                     │
                        Phase 4 full grid + 6 controls      ┐
   001 / 003 migrations ─▶ Phase 5 parity traces            ├─ DELIVERABLE B
                        Phase 6 retirement + release        ┘   (after 006)
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Phase 1 handoff replay + N11/N12 | `000` Stage 6, `000`'s recorder | A handoff gate demonstrated failing on a seeded reversal | Every lane release after `000`'s |
| Phase 2 lane ledger + capture review | Phase 1 | Enforced lane ownership; a gated capture review | Every lane acquire and release |
| Phase 3 cascade re-confirmation | `000`'s cascade audit, Phase 1 | Computed-winner evidence per lane holder | Each lane handover |
| Phase 4 full grid + controls | Phases 1-3, every sibling phase | The §4A matrix with named holes | Release |
| Phase 5 parity traces | `000`/`001`/`003` migrations, Phase 4 | One recorded trace per family | Retirement |
| Phase 6 retirement + final evidence | Phases 1-5 | Compatibility removed; the release decision | Program release |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **Phase 1 — the handoff replay and its seeded-reversal control** - CRITICAL and **early**. It is
   the only mechanism that catches a phase reversing an earlier phase, and it must exist before the
   second phase takes the lane. Every later number is worthless until it has been shown to fail.
2. **Phase 2 — the lane ledger** - CRITICAL and early. Without it two phases can hold the file at
   once and the handoff replay is measuring a tree two agents are editing.
3. **Phase 3 — cascade re-confirmation** - CRITICAL and recurring, at each handover, not at release.
4. **Phase 6 — retirement and the release decision** - CRITICAL. The only destructive work in the
   phase, and the gate the program closes on.

**Total Critical Path**: Phase 1 → Phase 2 → Phase 3 (recurring, across the whole program) → Phase 6.

**Parallel Opportunities**:
- Phase 4 and Phase 5 tooling can be built while sibling program phases are still running.
- The grid parallelises by environment and by role; the CSS lane and the retirement order do not.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | The handoff replay can fail | A seeded cascade reversal reddens only its own phase's cells; a staled result is rejected; runtime recorded | End of Phase 1, **before `001` starts** |
| M2 | The lane is enforced | A non-holder `styles.css` edit exits non-zero; an incomplete capture review refuses a lane release | End of Phase 2, **before the second lane holder** |
| M3 | No silent reversal | Handoff replay and cascade replay run at every lane handover; zero unknown contexts carried forward | Recurring, through Phase 3 |
| M4 | The grid can fail | All six negative controls demonstrated failing before any real matrix result is recorded | End of Phase 4 |
| M5 | Retirement is provable | One recorded parity trace per migrated family, all six dimensions agreeing, and a disagreement demonstrated to block | End of Phase 5 |
| M6 | Release decision | Full grid green from the final state, all release gates satisfied, a red review demonstrated to block, operator device review recorded | End of Phase 6 |

<!-- /ANCHOR:milestones -->
---

## 11. RISK

**Deliverable A slips and the program reverts to one end gate.** This is now the phase's defining
risk, because A is what makes the program's evidence continuous. A slipped A is not a deferred gate;
it is a stopped program, since no phase after `000` may release the lane without it.

**The replay becomes the new theatre.** A cross-phase gate that cannot fail is more expensive than no
gate, because it carries more authority. Phase 1 and Phase 4 exist entirely to answer this, and no
result recorded before the controls fail is admissible.

**The handoff replay is too slow and gets skipped.** Keep A minimal — recorded criteria, registry
equality and cascade winners, not the grid — record its runtime as a closure number, and treat a
skipped run as a red gate rather than a missing one.

**The lane ledger drifts from reality.** It is written only by `check-lane.mjs`, and a hand edit that
does not match `sha256(styles.css)` fails `verify` on the next run.

**Retirement strands a surface.** An unexercised registry entry is a failure, not an omission — that
one rule is what separates this from a diligence-selected checklist.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md`, `../adversarial-review.md` and
      `../000-surface-contract-and-truthful-harness/spec.md` read
- [ ] `000`'s registry **and** its input-hash recorder have landed; no second recorder is being built
- [ ] N11 and N12 exist and have been demonstrated failing before any handoff result is recorded
- [ ] N13 and N14 exist and have been demonstrated failing before the lane ledger is trusted
- [ ] The six §4A controls exist and have been demonstrated failing before any matrix result
- [ ] The registry is the only inventory the runner reads
- [ ] The byte-exact `styles.css` checkpoint exists before any deletion
- [ ] The retirement order is recorded before the first removal

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Deliverable A (Phases 1-3) completes before `001` starts. Phases run in order. No real result is recorded before that phase's controls fail |
| TASK-SCOPE | Only files named in `spec.md` §3. A replay failure inside a sibling phase's scope is reported, never patched here. No sibling's `capture-review.md` is authored here |
| TASK-EVIDENCE | A task closes only on a number that was read or a command whose output and exit status were read |
| TASK-VITEST | A green `vitest` run is never cited as evidence for a criterion. It is a regression guard |
| TASK-LANE | No `styles.css` edit without `lane:acquire`; no lane release without a green handoff replay and a complete capture-review sign-off |
| TASK-CSS | This phase holds `styles.css` last; the final cascade replay runs after the last deletion |
| TASK-RETIRE | One disposition per commit, citing its parity trace; a regression restores the checkpoint |
| TASK-DEVICE | A red operator review blocks release regardless of pipeline colour |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. Evidence names the number read or the command whose exit
status was read. A matrix hole is reported as a hole, never as a pass.

### Blocked Task Protocol

A task is BLOCKED when `000`'s registry or input-hash recorder has not landed, a sibling phase has not
handed forward its matrix rows, a parity trace disagrees, or the operator review cannot be obtained.
On BLOCK: record the blocker in `tasks.md`, stop that task, and do not substitute a weaker check. An
unobtainable device review is a blocker, not a pass by default. **A blocked Deliverable A blocks every
lane release after `000`'s** — it does not permit the program to proceed on convention.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md) · [`../adversarial-review.md`](../adversarial-review.md) · [`../design-system.md`](../design-system.md)
- [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- [`../009-live-verification/spec.md`](../009-live-verification/spec.md)
