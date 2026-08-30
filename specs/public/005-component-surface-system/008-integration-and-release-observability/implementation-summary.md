---
title: "Implementation Summary: Production Surface Integration and Release Observability"
description: "Deliverable A's handoff replay is built, green and running in the gate. Deliverable B is unbuilt. No acceptance criterion is Met, because every one of them needs a negative control this phase has not observed."
trigger_phrases:
  - "008 integration summary"
  - "handoff replay shipped"
  - "replay lane status"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/008-integration-and-release-observability"
    last_updated_at: "2026-08-30T18:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Deliverable A replay re-verified green; 0 of 13 criteria Met"
    next_safe_action: "Seed a cascade reversal and observe N12 redden only its own phase"
    blockers:
      - "Every negative control N1-N14 needs a styles.css or input mutation nobody has run"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-008"
      parent_session_id: null
    completion_pct: 20
    open_questions:
      - "Does the replay stay trustworthy while its claim list is hand-written"
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 008-integration-and-release-observability |
| **Started** | 2026-08-29 |
| **Level** | 3 |
| **Status** | In Progress |
| **State** | Deliverable A's runner is built, green and gated. Deliverable B is unbuilt. 0 of 13 criteria `Met` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

**One deliverable of two, and it is the early one.** The phase's argument was that a cross-phase gate
delivered at release is a report rather than a gate, so the handoff replay had to land before the
lane changed hands again. It did. `npm run replay` re-asserts **8 landed results across 5 phases**
against today's tree, exits 0, and runs as one of the gate's 16 lanes.

What makes it a replay rather than a test suite is that each claim is held with **the number the
phase that measured it recorded** — `recorded 0, now 0` — so a reversal is reported as the specific
claim it broke and the phase that owns it, not as a failure count.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `tools/live/replay.mjs` | Created (`4ccfed4`, 187 lines; extended `4928626`) | Deliverable A: re-assert every landed phase result at each handoff |
| `package.json` | Modified (`4ccfed4`) | `"replay": "node tools/live/replay.mjs"` |
| `tools/gate.mjs` | Modified (`4ccfed4`) | Adds the `replay` lane, so it runs on every gate invocation |

### Capabilities this phase's criteria depend on that shipped under other phases' names

Recorded because several of them postdate this phase's `acceptance-criteria.md`, whose "Measured
today" column still describes a tree where they do not exist.

| Capability | Where it lives | Whose commit | Which criterion it touches |
|---|---|---|---|
| Input-hash recorder — `fingerprint()`, `stamp()` | `tools/live/evidence.mjs:56,69` | `020` (`0a38723`) | AC-010. Built, but **not consumed** — see Limitations |
| Evidence-freshness lane | `tools/live/evidence.mjs --check-all`, gate lane `evidence` | `020` (`0a38723`) | AC-010's adjacent half: 9 artefacts carry input maps and are checked |
| Capture attribution, and a checker that opens the PNG | `tools/screenshots/verify.mjs:78-114` | `020` (`0a38723`, `1e6397d`) | AC-009's second clause, now fully observed |
| Lane ownership check and ledger | `tools/lane/check-lane.mjs`, `tools/lane/css-lane.json` | pre-`4ccfed4` lane work | AC-012's mechanism |
| A capture sign-off artefact | `../000-surface-contract-and-truthful-harness/capture-review.md` | `000` | AC-013, whose cell still reads "no sign-off artefact exists anywhere in the program" |
| Real-renderer gate assertions | `tools/live/render-assertions.mjs` | `026` (`1bac3c2`) | Not one of this phase's rows, but it is the first check that drives a production renderer |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**The replay landed early and cheap, which was the whole design.** `../adversarial-review.md` F7
recorded the original failure mode: the cross-phase gate existed only at release, so `000` could
close, `002` could reverse its token root, and nothing would fire until the end. Splitting the phase
put a minimal runner in front of `001` and left the full grid at release.

It was then wired to run on **every** gate invocation rather than only at a lane handoff. That is
stronger than the specification asked for and costs 4.3 seconds.

**The control that proved it took two attempts, and the first one is why the second is worth
something.** `4ccfed4`'s own commit message records that reverting the list-row fix by string
replacement hit the first of fifty identical declarations — a different rule entirely — and the
"did the mutation land" check passed because the file hash had moved. A changed hash proves a
change, not the intended one. It was redone by locating the rule and asserting the property was gone
from inside it. **That control was not re-run for this summary** (see Limitations), so it is recorded
here as its author's claim, not as this document's verification.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Deliverable A shipped as `tools/live/replay.mjs`, not the specified `tools/integration/handoff-replay.mjs` | `tools/integration/` does not exist. The file sits beside the other instruments it shares helpers with. A path deviation, recorded rather than retrofitted |
| The claim list is hand-written in the runner, not derived from each phase's `acceptance-criteria.md` | Ships now against 8 real results instead of waiting on `000`'s registry. T1's evidence-to-close asks for derivation, so **T1 is not closed by this** — the outcome landed, the specified mechanism did not |
| Hold each claim with its recorded number, not a boolean | "recorded 0, now 26, the defect stood at 26" identifies whose work came undone. A failure count does not |
| Run it in the gate, not only at handoff | A gate that depends on someone remembering to run it at a handoff is the failure mode this phase exists to remove |
| No criterion marked `Met`, despite two mechanisms being green | Every row's threshold includes a negative control, and D2 requires the failing number observed before the passing one. Green halves are recorded below as green halves |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

Run from the final state on 2026-08-30, against a tree clean at `32255b9` except for another agent's
in-flight `tools/storybook/verify-placement.mjs`. Each exit status was read from `$?` immediately
after the command, never through a pipe.

| Command | Output | Exit |
|---|---|---|
| `npm run gate` | `gate: PASS — 16 green, 0 red for a declared reason` | **0** |
| `npm run replay` | `replay: PASS — all 8 results still hold`, 8 claims across `000`, `001`, `002`, `004`, `005` | **0** |
| `node tools/live/replay.mjs` (timed) | same, **4,267 ms** wall clock | **0** |
| `npm run lane:check` | `stylesheet unchanged since the lane was taken (e5ada7e445ce)` · `held by null` | **0** |
| `node tools/live/evidence.mjs --check-all` | `evidence: 9 artefact(s) still describe this tree` | **0** |
| `npm run screenshots:verify` | `228 entries match their sources, and none is blank or identical across themes` | **0** |

### Criteria status: 0 of 13 `Met`

Nothing moved from `Unmet`. Four rows have an observed green half, recorded so the next agent does
not re-measure them:

| Row | Green half, observed | Missing half |
|---|---|---|
| AC-009 | **228 of 228** captures attributable — every entry carries a `sourceHashes` map including `styles.css`, `runtime-vars.css` and `capture.mjs`, plus a `sources` list, and `verify.mjs` now decodes the PNG rather than calling `existsSync` on it | The staling demonstration. Requires editing `styles.css` |
| AC-011 | The replay runs, passes, names its phases, and its runtime is **4,267 ms** — NFR-P02's "measured runtime is recorded" | N12: a seeded reversal reddening **only** its own phase's cells |
| AC-012 | N13's second half — an unmodified tree exits **0** | Both refusals. And `lane:acquire` / `lane:release` do not exist as commands |
| AC-013 | The sign-off artefact exists at `000/capture-review.md` | `npm run lane:capture-review` does not exist, so nothing gates on it |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No negative control in this phase's register has ever been observed.** All fourteen, N1 to N14,
   remain unrun. Each needs a seeded mutation of `styles.css` or of a recorded input, which is
   outside this pass's write scope. Until one is observed, the replay is a check that has only ever
   been seen green — which is precisely the shape this program calls theatre. **What would settle
   it:** run N12 by restoring one duplicate block `000`'s cascade audit classified dead, then
   `npm run replay`, and confirm it reddens that phase's claims and no others.

2. **AC-010 is not partly done; it is provably absent.** `000`'s input-hash recorder exists and
   eleven tools call `stamp()`. `tools/live/replay.mjs` is not one of them — it imports
   `node:fs`, `node:path`, `node:url`, `playwright-core` and `../screenshots/scenarios.mjs`, and
   nothing from `tools/live/evidence.mjs`. It also writes no JSON artefact, so its 8 results carry no
   vintage at all and the freshness lane cannot see them. A lane edit invalidates nothing.

3. **Deliverable B is entirely unbuilt.** Six of the commands the criteria table names do not exist
   in any form: `integration:replay`, `integration:registry`, `integration:cascade`,
   `integration:parity`, `integration:release-decision`, `integration:handoff`. There is no
   `tools/integration/` directory. AC-001, AC-004, AC-005, AC-007 and AC-008 have no mechanism.

4. **The replay's coverage is 8 results, hand-chosen.** Adding a criterion to a closed phase does not
   add a re-assertion; someone must edit `tools/live/replay.mjs:53`. So the replay's coverage drifts
   from the phases' real criteria silently, and the gap is invisible from the green output.

5. **The lane ledger currently records no holder** — `css-lane.json`'s `holder` is `null`, and
   `check-lane.mjs:59-60` exits 0 whenever the stylesheet is unchanged, regardless. The ownership
   rule is therefore untested on this tree in either direction, and the acquire and release halves
   of it are still hand-edits to a JSON file rather than commands.

6. **AC-013's "Measured today" cell is stale and was left alone.** It reads "no sign-off artefact
   exists anywhere in the program"; `000/capture-review.md` exists. The lane journal
   (`tools/lane/css-lane.json:581`) additionally records that only 5 of its 19 images carry an
   individual verdict, the other 14 sitting under one bulk line, and that every verdict is an
   assistant reading a regenerated PNG. Correcting the cell belongs to whoever next opens the
   criteria table with the authority to re-measure it.

7. **`completion_pct: 20` is derived, not felt.** 0 of 13 criteria `Met` and 0 of 38 tasks checked,
   against: Deliverable A's runner built, green and gated; AC-009's attribution half and AC-012's
   clean-tree half observed; AC-013's artefact present without its gate; AC-010 provably absent; and
   Deliverable B at zero. Per D3 this cannot approach 100 — nothing here is operator-confirmed, and
   AC-008's release decision has not been rehearsed even once.

<!-- /ANCHOR:limitations -->
