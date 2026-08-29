---
title: "Verification Checklist: Production Surface Integration and Release Observability"
description: "The handoff gate's own honesty proved first, then the lane and capture enforcement, then the cross-phase evidence, then the release decision."
trigger_phrases:
  - "008 integration checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Production Surface Integration and Release Observability

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Each gate proves itself before it proves anything else. No row in Criteria may be recorded until the
controls that make that row falsifiable have been demonstrated failing: N11 and N12 for the handoff
replay, N13 and N14 for the two enforcement mechanisms, N1-N6 for the full grid.

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

**`npx vitest run` is not evidence for any row below.** It runs `environment: "node"` with no jsdom
(`vitest.config.ts:16`), so it cannot assert anything about a rendered surface. It is a regression
guard, and a green suite says nothing about this program's criteria.

### Criteria

| # | Deliv | Criterion | Today | Target | Evidence |
|---|---|---|---|---|---|
| G1 | B | Every registry entry driven across every §4A coordinate | *census* — no runner exists | 0 matrix holes | [ ] |
| G2 | A, B | Observed-root set equals registry-entry set, both directions | *census* — no registry until `000` lands | equality, 0 unexercised entries | [ ] |
| G3 | A, B | Zero duplicated selectors with an unknown context on the final file | 87 selectors / 124 conflicts | 0 unknown | [ ] |
| G4 | B | Every transition asserted; no stale anchor, duplicate owner or leaked listener | *trace* — no harness performs a transition | 0 failures | [ ] |
| G5 | B | Host computed variables and root class lists unchanged during every portalled open | *trace* — never asserted | byte-identical | [ ] |
| G6 | A, B | All six negative controls fail the run | no such controls exist | 6 of 6 fail | [ ] |
| G7 | B | Every retired compatibility path has a recorded, agreeing parity trace, and a disagreement blocks | *census* — nothing retired yet | 1 trace per path, 1 refusal demonstrated | [ ] |
| G8 | B | A red operator device review actually blocked a release in a rehearsal | 1.3.1 shipped with no device review at all | rehearsal blocks, exit non-zero | [ ] |
| G9 | A | A seeded cascade reversal fails the handoff replay and reddens only that phase's cells | no handoff replay exists | red on seed, green on removal | [ ] |
| G10 | A | A `styles.css` edit by a phase that does not hold the lane is refused | no ledger, no check; the rule is prose | non-zero exit naming both phases | [ ] |
| G11 | A | A lane release with an unreviewed changed PNG is refused | no sign-off artefact exists | release refused, lane stays held | [ ] |

### Negative Controls

| # | Deliv | Control | Evidence |
|---|---|---|---|
| N1 | B | A raw `document.body` mount in a fixture fails registry equality | [ ] |
| N2 | B | A fixture wrapper standing in for the production mount fails the run | [ ] |
| N3 | B | A stale anchor retained across a refresh fails the transition assertion | [ ] |
| N4 | B | Removing `.mobile-navbar` moves an asserted phone number by more than 1.35px | [ ] |
| N5 | B | Substituting the layout viewport for `visualViewport` fails the keyboard-clearance assertion | [ ] |
| N6 | B | A capture-only placement claim, with no driven action, fails the outcome assertion | [ ] |
| N7 | B | Reverting `000`'s token-root line turns the token cells red and nothing else | [ ] |
| N11 | A | A result whose recorded input hashes differ from the current tree is rejected as stale | [ ] |
| N12 | A | A seeded cascade reversal reddens its own phase's cells in the handoff replay and nothing else | [ ] |
| N13 | A | A non-holder `styles.css` edit exits non-zero; an unmodified tree exits 0 | [ ] |
| N14 | A | Deleting one row from a complete `capture-review.md` refuses the lane release | [ ] |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] **CHK-001** [P0] `../architecture-findings.md`, `../adversarial-review.md` and
      `../000-surface-contract-and-truthful-harness/spec.md` read
- [ ] **CHK-002** [P0] `000`'s typed registry has landed; this phase reads it and holds no list of its own
- [ ] **CHK-003** [P0] `000`'s input-hash recorder has landed; this phase consumes it and builds no second one
- [ ] **CHK-004** [P0] N11 and N12 exist and have each been demonstrated failing before any handoff result
- [ ] **CHK-005** [P0] N13 and N14 exist and have each been demonstrated failing before the ledger is trusted
- [ ] **CHK-006** [P0] The six §4A controls exist and have each been demonstrated failing before any matrix result
- [ ] **CHK-007** [P0] The byte-exact `styles.css` checkpoint is taken before any deletion, with its hash recorded
- [ ] **CHK-008** [P0] The retirement order is written down before the first removal
- [ ] **CHK-009** [P0] Every *census* / *trace* cell in `acceptance-criteria.md` names the command and
      stage that fills it, and none was worked before its named producer ran

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] **CHK-010** [P0] The runner derives its grid from the registry; no inventory is duplicated in tooling
- [ ] **CHK-011** [P0] A matrix hole is reported as a hole, never counted as a pass
- [ ] **CHK-012** [P1] No spec path, requirement id, task id or phase number in any code comment
- [ ] **CHK-013** [P1] No replay or lane tooling ships in the production bundle
- [ ] **CHK-014** [P0] `tools/lane/css-lane.json` is written only by `check-lane.mjs`; no hand edit is in the diff
- [ ] **CHK-015** [P1] `node tools/naming/scan-folder-docs.mjs` exits 0 with the new `tools/lane/` and
      `tools/integration/` folders present

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING

- [ ] **CHK-020** [P0] `npx tsc --noEmit` exit 0, read without a pipe
- [ ] **CHK-021** [P0] `npm run build` exit 0
- [ ] **CHK-022** [P0] `npx vitest run` exit 0, test count not reduced — **regression guard, cited as
      evidence for no criterion**
- [ ] **CHK-023** [P0] N1-N6 each demonstrated failing, recorded separately
- [ ] **CHK-024** [P0] N7 holds — a seeded defect reddens its own cells and nothing else
- [ ] **CHK-025** [P0] N11-N14 each demonstrated failing, recorded separately
- [ ] **CHK-026** [P0] Registry equality green in both directions, zero unexercised entries
- [ ] **CHK-027** [P0] Full grid run from the final state, every coordinate driven
- [ ] **CHK-028** [P0] Handoff replay and cascade replay run at every lane handover and again on the final file
- [ ] **CHK-029** [P0] The handoff replay's runtime is recorded and inside the per-handoff budget

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] **CHK-030** [P0] G1: zero matrix holes
- [ ] **CHK-031** [P0] G2: registry equality in both directions
- [ ] **CHK-032** [P0] G3: zero unknown cascade contexts — recorded 87 selectors / 124 conflicts, now 0 unknown
- [ ] **CHK-033** [P0] G4: every transition asserted, zero stale anchors and duplicate owners
- [ ] **CHK-034** [P0] G5: host variables and root class lists byte-identical during every portalled open
- [ ] **CHK-035** [P0] G6: all six controls fail
- [ ] **CHK-036** [P0] G7: one agreeing parity trace per retired path, and a disagreement demonstrated to block
- [ ] **CHK-037** [P0] G8: a red operator review demonstrated to block a release, and the real review recorded with named scope
- [ ] **CHK-038** [P0] G9: a seeded reversal fails the handoff replay and reddens only that phase
- [ ] **CHK-039** [P0] G10: a non-holder `styles.css` edit is refused
- [ ] **CHK-040** [P0] G11: a lane release with an unreviewed changed PNG is refused
- [ ] **CHK-041** [P0] No sibling phase's defect was patched here rather than reported back
- [ ] **CHK-042** [P0] No sibling phase's `capture-review.md` was authored here

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

- [ ] **CHK-050** [P0] No network call, telemetry or remote dependency added
- [ ] **CHK-051** [P0] No secret, token or absolute personal path in any artifact
- [ ] **CHK-052** [P0] `external/` AnyType and AppFlowy read for behaviour only — no code, CSS value
      or token scale copied from AGPL/source-available sources into this MIT plugin
- [ ] **CHK-053** [P0] The replay wrote nothing into the operator's vault outside the declared testbed
- [ ] **CHK-054** [P1] No reviewer name in `capture-review.md` is an email address or other personal contact detail

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] **CHK-060** [P0] Every deletion cites its cascade-audit entry and its replay inertness result
- [ ] **CHK-061** [P1] `implementation-summary.md` written once work starts
- [ ] **CHK-062** [P1] Each criterion's post-change measurement recorded against its recorded value
- [ ] **CHK-063** [P0] Every retirement commit cites its parity trace
- [ ] **CHK-064** [P0] Every ledger `history` entry cites its handoff replay artefact and its capture review section

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] **CHK-070** [P0] `styles.css` not split; every edit made while this phase holds the lane
- [ ] **CHK-071** [P1] Replay tooling lives under `tools/integration/`, lane tooling under `tools/lane/`
- [ ] **CHK-072** [P1] Working tree clean after a full run — `gates.yml` already fails on a dirty tree

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Gate | Deliverable | Result |
|---|---|---|
| `npx tsc --noEmit` exit 0 | A | not run |
| `npm run build` exit 0 | A | not run |
| `npx vitest run` exit 0, count not reduced (regression guard) | A | not run |
| N11-N14 each failing | A | not run |
| `npm run lane:check` refuses a non-holder edit | A | not run |
| `npm run lane:capture-review` refuses an incomplete sign-off | A | not run |
| Handoff replay green at every lane handover, runtime recorded | A | not run |
| Registry equality, both directions | A | not run |
| Six §4A negative controls each failing | B | not run |
| Full replay grid from the final state | B | not run |
| Cascade replay on the final file | B | not run |
| Parity trace per retired path, plus one demonstrated refusal | B | not run |
| Full recapture **and the §4C capture-review sign-off** | B | not run |
| Red-review rehearsal blocks a release | B | not run |
| Operator device review, scope named | B | not run |

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:arch-verify -->
## L3+: ARCHITECTURE VERIFICATION

- [ ] **CHK-080** [P0] The runner reads `000`'s registry and holds no list of its own
- [ ] **CHK-081** [P0] The runner reads `000`'s input-hash recorder and implements no second one
- [ ] **CHK-082** [P0] Handoff replay, lane check, capture review, matrix, cascade and parity remain
      six separate artefacts with separate failures
- [ ] **CHK-083** [P0] Retirement is owned by this phase, not by the phase that authored the new path
- [ ] **CHK-084** [P0] Every coordinate of the §4A matrix has at least one driven row
- [ ] **CHK-085** [P0] Deliverable A landed before `001` started, and gated every lane release after `000`'s

<!-- /ANCHOR:arch-verify -->
---

<!-- ANCHOR:perf-verify -->
## L3+: PERFORMANCE VERIFICATION

- [ ] **CHK-090** [P0] The per-push subset completes inside the existing gate budget, runtime recorded
- [ ] **CHK-091** [P0] The handoff replay completes inside the per-handoff budget, runtime recorded
- [ ] **CHK-092** [P1] The full grid is resumable by axis; a single-environment failure does not force a full re-run

<!-- /ANCHOR:perf-verify -->
---

<!-- ANCHOR:deploy-ready -->
## L3+: DEPLOYMENT READINESS

- [ ] **CHK-100** [P0] Each retirement landed as its own revertable commit
- [ ] **CHK-101** [P0] Rollback rehearsed: restoring the byte-exact checkpoint returns the tree to a green grid
- [ ] **CHK-102** [P0] Every release-decision gate recorded, each as a block rather than a warning
- [ ] **CHK-103** [P0] A red device review blocked release in at least one rehearsal

<!-- /ANCHOR:deploy-ready -->
---

<!-- ANCHOR:compliance-verify -->
## L3+: COMPLIANCE VERIFICATION

- [ ] **CHK-110** [P0] MIT licence integrity preserved — nothing copied from the AGPL/source-available
      references under `external/`
- [ ] **CHK-111** [P1] No write to the operator's vault beyond the declared testbed

<!-- /ANCHOR:compliance-verify -->
---

<!-- ANCHOR:docs-verify -->
## L3+: DOCUMENTATION VERIFICATION

- [ ] **CHK-120** [P0] The matrix result is published with its holes named, not summarised as a count
- [ ] **CHK-121** [P0] Every parity trace is retained after its retirement commit
- [ ] **CHK-122** [P0] Every lane release has a `capture-review.md` section retained beside the releasing phase
- [ ] **CHK-123** [P1] `validate.sh <spec-folder> --strict` run and its exit code read without a pipe

<!-- /ANCHOR:docs-verify -->
---

<!-- ANCHOR:sign-off -->
## L3+: SIGN-OFF

This phase is the program's release gate, and its first deliverable is the program's continuous gate.
It does not close on gate passage alone — that is precisely what 1.3.1 did, one level down.

- [ ] **CHK-130** [P0] Every criterion moved from its recorded value
- [ ] **CHK-131** [P0] N1-N7 and N11-N14 hold
- [ ] **CHK-132** [P0] Operator device confirmation recorded for every original defect
- [ ] **CHK-133** [P0] Every compatibility path either retired with a trace or carrying a written disposition
- [ ] **CHK-134** [P0] The lane ledger's `history` covers every lane hold in the program, with no gaps

<!-- /ANCHOR:sign-off -->
