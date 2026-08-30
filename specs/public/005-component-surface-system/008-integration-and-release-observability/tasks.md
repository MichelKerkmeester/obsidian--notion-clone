---
title: "Task Breakdown: Production Surface Integration and Release Observability"
description: "One task per requirement across the two deliverables, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "008 integration tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Production Surface Integration and Release Observability

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or
a command whose output and exit status were read.

**A matrix hole is reported as a hole.** A coordinate that was never driven is never counted as a
pass.

**A green `vitest` run closes no task's evidence requirement.** It runs `environment: "node"` with no
jsdom (`vitest.config.ts:16`) and is a regression guard, not criterion evidence.

**Deliverable A (T1-T14) completes before `001` starts.** From T14 onward, no program phase after
`000` may release the CSS lane until A is green.

**Two numbering systems, kept apart.** The three `## PHASE` buckets below are this template's fixed
SETUP / IMPLEMENTATION / VERIFICATION sections. The numbered units inside them — `Phase 1` through
`Phase 6` — are `plan.md` §4's implementation phases. The program's own phases are always written as
folder numbers: `000`, `001`, `004`.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

**Deliverable A · Phase 1 — the handoff replay, and proof that it can fail.** No real handoff result
may be recorded until T3 and T4 have each been demonstrated failing.

- [~] **T1** Build `tools/integration/handoff-replay.mjs`: read every closed phase's recorded
      criteria, re-assert them against the current tree, and call the cascade replay — REQ-010.
      *Evidence to close:* the set of re-asserted criteria is derived from the phases'
      `acceptance-criteria.md` rows and `000`'s registry alone; adding a criterion to a closed phase
      adds a re-assertion without editing the runner.
      *Status 2026-08-30:* shipped as `tools/live/replay.mjs` (`4ccfed4`, 187 lines), `npm run replay`,
      gate lane `replay`: 8 results across 5 phases, PASS, exit 0, 4,267 ms. **Not closed** — the claim
      list is hand-written at `replay.mjs:53`, not derived, so adding a criterion to a closed phase adds
      no re-assertion. The outcome landed; the specified mechanism did not.
- [ ] **T2** Consume `000`'s input-hash recorder for admissibility — REQ-009.
      *Evidence to close:* every result the replay reads or writes carries recorded input hashes; the
      command name and output shape of `000`'s recorder are cited, and no second recorder exists in
      `tools/`.
- [ ] **T3** Demonstrate N11 — a staled result is rejected — REQ-009.
      *Evidence to close:* take a green result, change one input byte, re-run
      `npm run integration:handoff -- --admissibility`; exit is non-zero and names the differing
      input.
- [ ] **T4** Demonstrate N12 — a seeded cascade reversal reddens only its own phase — REQ-010,
      REQ-006.
      *Evidence to close:* restore one duplicate block `000`'s audit classified dead, run the handoff
      replay, record which cells reddened and which did not; remove the block and record that the same
      cells go green.
- [ ] **T5** Record the handoff replay's wall-clock runtime — REQ-010, NFR-P02.
      *Evidence to close:* the measured runtime of a full handoff run, read from the command's own
      output, with the per-handoff budget it must stay inside.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Deliverable A · Phase 2 — the lane ledger and the capture-review sign-off

- [ ] **T6** Build `tools/lane/css-lane.json` and `tools/lane/check-lane.mjs` to the schema and
      sub-commands in `spec.md` §4B — REQ-011.
      *Evidence to close:* `acquire`, `verify` and `release` each behave as the §4B table specifies,
      with their exit codes read.
- [ ] **T7** Demonstrate N13 — a non-holder edit is refused — REQ-011.
      *Evidence to close:* with the ledger naming one phase as holder, modify `styles.css` as another
      and run `npm run lane:check`: exit non-zero, message names both phases and the drifted hash. On
      an unmodified tree the same command exits 0.
- [ ] **T8** Demonstrate exclusive acquisition — REQ-011.
      *Evidence to close:* `npm run lane:acquire` for a second phase while the lane is held exits
      non-zero and leaves `holder` unchanged.
- [ ] **T9** Build `tools/lane/check-capture-review.mjs` and the `capture-review.md` format in
      `spec.md` §4C — REQ-012.
      *Evidence to close:* the changed-PNG set is derived from image byte hashes against
      `tools/lane/capture-baseline.json`, not from the hand-maintained scenario source list; all seven
      failure conditions in §4C are implemented and each is exercised.
- [ ] **T10** Demonstrate N14 — an incomplete sign-off refuses the lane release — REQ-012.
      *Evidence to close:* delete one row from a complete `capture-review.md`, run
      `npm run lane:release`: exit non-zero, the lane stays held, the message names the unreviewed
      PNG. Restore the row and the release succeeds.
- [ ] **T11** Implement registry equality in both directions plus one terminal close per handle —
      REQ-002.
      *Evidence to close:* an unregistered root fails; an unexercised registry entry fails; a handle
      with two terminal events fails.
- [ ] **T12** Wire lane ownership, registry equality and the negative controls into
      `.github/workflows/gates.yml` — REQ-002, REQ-006, REQ-011.
      *Evidence to close:* the workflow steps exist, run on push, and complete inside the existing
      gate budget with the measured runtime recorded.
- [ ] **T13** Add `tools/lane/README.md`, `tools/integration/README.md` and
      `tools/integration/CODE.md` — REQ-011.
      *Evidence to close:* `node tools/naming/scan-folder-docs.mjs` exits 0 with the new folders
      present. (`SCAN_ROOTS` includes `tools`; `THRESHOLD = 3` direct source files owes both docs.)
- [ ] **T14** Unit-test the tooling's own pure logic — grid expansion, hole detection, parity diff,
      ledger state transitions, capture-review parsing.
      *Evidence to close:* `npx vitest run` exit 0 with the new cases; a seeded hole is reported as a
      hole and not as a pass. **This tests the instrument, not the product.**

### Deliverable A · Phase 3 — cascade re-confirmation at every lane handoff

- [ ] **T15** Build `tools/integration/cascade-replay.mjs` — REQ-003.
      *Evidence to close:* computed winners resolved at real production mounts, per theme and per
      media context, diffed against `000`'s recorded audit.
- [ ] **T16** Run the handoff replay at every lane handover, from `000`'s release onward — REQ-003,
      REQ-010.
      *Evidence to close:* one recorded artefact per handover under `replay/handoff/`, cited by the
      ledger's `history` entry; zero unknown contexts carried forward.
- [ ] **T17** Make an unknown context a blocking result — REQ-003.
      *Evidence to close:* a deliberately unclassified duplicate blocks the run; taking the last
      declaration does not clear it.

### Deliverable B · Phase 4 — the full grid and its six controls

- [ ] **T18** Build `tools/integration/replay-matrix.mjs` reading `000`'s typed registry — REQ-001.
      *Evidence to close:* the grid expands from the registry alone; adding a registry entry adds a
      row without editing the runner.
- [ ] **T19** Build the six §4A negative controls and demonstrate each failing — REQ-006.
      *Evidence to close:* raw-mount bypass, fixture-wrapper substitution, stale anchor, missing
      navbar, layout viewport substituted for `visualViewport`, and capture-only placement each make
      the run exit non-zero, each recorded separately.
- [ ] **T20** Point the matrix at a tree with a known defect and require the specific cells to go red
      — REQ-006.
      *Evidence to close:* reverting `000`'s token-root line turns the token cells red and nothing
      else.
- [ ] **T21** Assert boundary isolation across every portalled, shadow and top-layer sample — REQ-005.
      *Evidence to close:* host computed custom properties and root class lists byte-identical before
      and during open; each surface's snapshot matches its container-resolved reference.
- [ ] **T22** Assert every transition in §4A — REQ-004.
      *Evidence to close:* one assertion per transition per role; zero stale anchors, duplicate owners
      or leaked listeners.

### Deliverable B · Phase 5 — parity traces

- [ ] **T23** Build `tools/integration/compat-parity.mjs` — REQ-007.
      *Evidence to close:* per family, old and new traces compared across placement, dismissal,
      focus, tokens, refresh and cleanup.
- [ ] **T24** Trace the `000` families — the three no-option positioner paths and the compact family —
      REQ-007.
      *Evidence to close:* both traces recorded and agreeing before any retirement is proposed.
- [ ] **T25** Trace the `001` families — bespoke callers and owned menus, nested column menus last —
      REQ-007.
      *Evidence to close:* one recorded trace per family.
- [ ] **T26** Trace the `003` sheet-capable surfaces, including the modal and anchored mechanisms —
      REQ-007, REQ-004.
      *Evidence to close:* one trace covering both mechanisms; `--db-mobile-sheet-bottom` has one
      writer and one value in both.
- [ ] **T27** Demonstrate N9 — a disagreeing parity trace blocks its removal — REQ-007.
      *Evidence to close:* propose a removal against a deliberately disagreeing trace; the gate
      refuses it with a non-zero exit.

### Deliverable B · Phase 6 — retirement, final evidence, release decision

- [ ] **T28** Record the retirement order before the first removal — REQ-007.
      *Evidence to close:* a total order written down, with the byte-exact `styles.css` checkpoint
      hash beside it.
- [ ] **T29** Retire compatibility paths one disposition per commit — REQ-007.
      *Evidence to close:* each commit cites its parity trace; the prior matrix re-run after each.
- [ ] **T30** Delete the CSS blocks `000`'s audit classified dead and the replay confirms inert —
      REQ-003.
      *Evidence to close:* per deletion, the audit entry and the replay's inertness result; recapture
      plus a §4C sign-off shows no unexplained visual change.
- [ ] **T31** Record the stylesheet hash and producer set for every capture, and demonstrate a staled
      capture being rejected — REQ-009.
      *Evidence to close:* the rejection's non-zero exit and the name of the staled capture; then
      100% of the remaining captures attributable.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T32** Run the full grid from the final state, reading each exit code without a pipe.
- [ ] **T33** Final cascade replay and handoff replay on the post-deletion file — REQ-003, REQ-010.
- [ ] **T34** Full recapture, then the §4C capture-review sign-off. `screenshots:verify` alone does
      not close this, and never could: its only PNG operation is an existence check.
- [ ] **T35** Rehearse the operator gate — REQ-008.
      *Evidence to close:* with the pipeline green, a red device review is submitted and the release
      is refused, evidenced by the gate's non-zero exit.
- [ ] **T36** Operator device review through `../009-live-verification`, or by hand where `009` cannot
      reach — REQ-008. Scope named per phase; a red review blocks release.
- [ ] **T37** Walk the release decision matrix in `plan.md` §4 and record each gate's result.
- [ ] **T38** Confirm the scoped diff contains no task-created residue and no surviving compatibility
      path that lacks a recorded disposition.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

**Deliverable A closes when:**

- N11, N12, N13 and N14 have each been demonstrated failing, before any handoff result was recorded.
- The handoff replay runs at every lane handoff and its runtime is recorded and inside budget.
- A `styles.css` edit by a phase that does not hold the lane is refused, demonstrated.
- A lane release with an unreviewed changed PNG is refused, demonstrated.
- Registry equality is green in both directions, with zero unexercised entries.
- No second input-hash recorder was built.

**Deliverable B closes when:**

- Every P0 requirement is met with cited evidence.
- All six §4A negative controls were demonstrated failing before any recorded matrix result.
- Zero unknown cascade contexts on the final file.
- One recorded parity trace per retired path, all six dimensions agreeing, and a disagreement
  demonstrated to block.
- Full grid green from the final state, each exit status read without a pipe.
- A red operator review was demonstrated to block a release, and the real device review is recorded
  with its scope named.
- Every release-decision gate is satisfied.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md) · [`../adversarial-review.md`](../adversarial-review.md) · [`../design-system.md`](../design-system.md)
- [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- [`../009-live-verification/spec.md`](../009-live-verification/spec.md)

<!-- /ANCHOR:cross-refs -->
