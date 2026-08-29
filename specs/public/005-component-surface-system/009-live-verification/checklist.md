---
title: "Verification Checklist: Live Verification in the Running Obsidian"
description: "The transport proved first, the guard proved second, and every emulated result labelled as emulated."
trigger_phrases:
  - "009 live verification checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Live Verification in the Running Obsidian

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

The transport is proved before anything is built on it, and the safety guard is proved before
anything writes. An emulated result is labelled emulated on every line it appears.

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. Three exit codes: 0 pass, 1 assertion failure, 2 infrastructure. An infrastructure problem is
never recorded as a defect.

### Criteria

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| L1 | A computed value returns from the real renderer and disagrees with the harness for a known-divergent class | *trace* — no live transport exists; the divergence is the recorded 29/29 | both numbers recorded, disagreeing | [ ] |
| L2 | Every measured surface was created by a production producer in the running app | *trace* — every current measurement is of a harness-constructed node | 0 probe-constructed nodes | [ ] |
| L3 | Computed style, rect and `elementFromPoint` all return from the real app | *trace* — `elementFromPoint` has never been called in the real app | all three returning | [ ] |
| L4 | `npm run live:probe` exits 0 on a good tree, non-zero on a seeded defect | no such script exists | 0 / 1 / 2 each demonstrated | [ ] |
| L5 | Zero writes outside the testbed across a full run | no probe exists | 0 | [ ] |
| L6 | `grep -c __ndProbe main.js` returns 0 on a production build | no probe exists | 0 | [ ] |
| L7 | The four emulation facts recorded as measurements | unknown — the phase's headline open question | 4 recorded values | [ ] |
| L8 | A phone-written result note is parsed and asserted on the Mac | *trace* — `js-engine`'s `startupScripts` is empty today | parsed, or an ADR | [ ] |
| L9 | The probe **reproduces the known body-mount defect** live | *trace* — no transport; the defect is the recorded 29/29 divergence, 25/29 with no tokens on body | the two mount points differ | [ ] |
| L10 | Every §3B mobile block carries its own verification status, and every downstream citation carries the same qualifier | 2 of 4 verified (rest-api manifest; the guard, brace-matched by hand). Block 3 partly verified, block 4 unverified and unverifiable here. `008` cites the conclusion as settled | 4 labelled; 0 unqualified citations | [ ] |
| L11 | `000` receives both the per-surface probe record **and** the unreachable list | no probe exists, so `000` has no cross-check | both artefacts delivered | [ ] |

### Negative Controls

| # | Control | Evidence |
|---|---|---|
| N1 | Reverting `000`'s token-root line reddens the token probes and nothing else | [ ] |
| N2 | Pointing the driver outside the testbed refuses and exits 2 before connecting | [ ] |
| N3 | Stopping Obsidian produces exit 2, never exit 1 | [ ] |
| N4 | A probe that constructs its own node instead of driving a producer fails review | [ ] |
| N5 | A production build containing `__ndProbe` fails the bundle check | [ ] |
| N6 | An emulated result presented without its caveat fails the run record's format check | [ ] |
| N7 | A missing phone result note is reported as "not run", never as a pass | [ ] |
| N8 | Pointing both reads of L9 at the same mount makes the divergence assertion fail | [ ] |
| N9 | Relabelling a block's status without changing its evidence fails the status audit | [ ] |
| N10 | Removing a surface from the unreachable list without measuring it leaves it unaccounted in `000`'s cross-check | [ ] |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] **CHK-001** [P0] Obsidian is running and the CLI socket exists
- [ ] **CHK-002** [P0] The transport proof passed and its two disagreeing numbers are recorded
- [ ] **CHK-002a** [P0] The defect reproduction passed: the same menu class computes differently on
      `document.body` than inside `.note-database-container`, in the running app. Agreement here is a
      failure, not a pass
- [ ] **CHK-003** [P0] The testbed exists, is seeded, and is disposable
- [ ] **CHK-004** [P0] The path guard has been demonstrated failing closed before any probe writes
- [ ] **CHK-005** [P1] The environment is recorded: Obsidian version, enabled plugins, active theme
- [ ] **CHK-006** [P0] `../adversarial-review.md` read — this packet's repositioning and its
      verification-status rules answer F1, F4 and F10

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] **CHK-010** [P0] Every `eval` payload is short enough to review in the diff; long logic lives in
      the plugin's probe API
- [ ] **CHK-011** [P0] No probe constructs its own node; every measured surface came from a production
      producer
- [ ] **CHK-012** [P1] No spec path, requirement id, task id or phase number in any code comment
- [ ] **CHK-013** [P0] The probe API is behind a build flag and absent from the production bundle

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING

- [ ] **CHK-020** [P0] `npx tsc --noEmit` exit 0, read without a pipe
- [ ] **CHK-021** [P0] `npm run build` exit 0
- [ ] **CHK-022** [P0] `npx vitest run` exit 0, test count not reduced; the driver's pure logic covered
- [ ] **CHK-023** [P0] N1-N10 each demonstrated, recorded separately
- [ ] **CHK-024** [P0] All three exit codes demonstrated in their own circumstances
- [ ] **CHK-025** [P0] Every probe shown reddening on a seeded defect before its passing result is recorded
- [ ] **CHK-026** [P1] Teardown ran after a deliberately failing run: debugger detached, emulation off,
      testbed reset

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] **CHK-030** [P0] L1: the live value and the harness value recorded, disagreeing
- [ ] **CHK-031** [P0] L2: every measured surface produced by production code
- [ ] **CHK-032** [P0] L3: computed style, rect and `elementFromPoint` all returning from the real app
- [ ] **CHK-033** [P0] L4: `live:probe` is a gate with a read exit status
- [ ] **CHK-034** [P0] L5: zero writes outside the testbed
- [ ] **CHK-035** [P0] L6: production bundle clean
- [ ] **CHK-036** [P0] L7: four emulation facts recorded, device-only criteria named
- [ ] **CHK-037** [P1] L8: phone round trip parsed, or an ADR recording the decision not to build it
- [ ] **CHK-038** [P0] Every live-versus-harness disagreement routed to its owner: a `000` surface
      **blocks `000`**; any later phase's surface is a finding reported to `008`
- [ ] **CHK-039** [P0] L9: the known body-mount defect reproduced live, both values recorded
- [ ] **CHK-040a** [P0] L10: all four §3B blocks carry VERIFIED / PARTLY VERIFIED / UNVERIFIED with
      what was read or what would settle it; the downstream citations audited for the same qualifier
- [ ] **CHK-040b** [P0] L11: `000` has both the per-surface probe record and the unreachable list,
      and the run record says whether the reachable set covered `000`'s Stage-1 repair surfaces

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

- [ ] **CHK-040** [P0] No network call; the CLI is a local Unix socket
- [ ] **CHK-041** [P0] No secret, API key or absolute personal path in any committed artefact; the
      vault path comes from an environment variable
- [ ] **CHK-042** [P0] `obsidian-local-rest-api` remains disabled; no HTTP server was enabled on the
      operator's machine
- [ ] **CHK-043** [P0] The probe wrote nothing outside the testbed
- [ ] **CHK-044** [P0] No evaluation hook present in any production build

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] **CHK-050** [P0] The run record names Obsidian's version, the plugin set and the theme
- [ ] **CHK-051** [P1] `implementation-summary.md` written once work starts
- [ ] **CHK-052** [P0] Every emulated result carries the engine caveat
- [ ] **CHK-053** [P0] The shrunken operator review list is written, distinguishing emulated from device

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] **CHK-060** [P0] `styles.css` untouched by this phase
- [ ] **CHK-061** [P1] Live tooling lives under `tools/live/`; the probe API under `src/dev/`
- [ ] **CHK-062** [P1] Working tree clean after a full run; the testbed is not committed with results in it

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Gate | Result |
|---|---|
| `npx tsc --noEmit` exit 0 | not run |
| `npm run build` exit 0 | not run |
| `npx vitest run` exit 0, count not reduced | not run |
| Transport proof returns a real computed value | not run |
| **Defect reproduction: the two mount points differ, live** | not run |
| **Cross-check export handed to `000` — pairs and unreachable list** | not run |
| **Every §3B block labelled; downstream citations audited** | not run |
| Path guard refuses an out-of-testbed target | not run |
| `live:probe` exits 0, 1 and 2 in their own circumstances | not run |
| Every probe reddens on a seeded defect | not run |
| `grep -c __ndProbe main.js` = 0 on a production build | not run |
| Four emulation facts recorded | not run |
| Phone round trip parsed, or ADR recorded | not run |

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:arch-verify -->
## L3+: ARCHITECTURE VERIFICATION

- [ ] **CHK-070** [P0] The CLI carries requests and values; the plugin owns the driving
- [ ] **CHK-071** [P0] The path guard fails closed before connecting, not after
- [ ] **CHK-072** [P0] The probe drives `000`'s registry once it exists. Until then the hand-listed
      set is the starting condition — this packet precedes `000` — and it covers every surface
      `000`'s Stage-1 harness repairs touch, or the shortfall is stated
- [ ] **CHK-074** [P0] The probe has been shown detecting a defect that is present, not only agreeing
      with something. An instrument `000` cannot audit must be one this packet already audited
- [ ] **CHK-073** [P1] `dev:cdp` is opt-in per probe, because it attaches a debugger to the operator's app

<!-- /ANCHOR:arch-verify -->
---

<!-- ANCHOR:perf-verify -->
## L3+: PERFORMANCE VERIFICATION

- [ ] **CHK-080** [P1] A full probe pass completes in under two minutes once the app is up, runtime recorded
- [ ] **CHK-081** [P1] The deferred phone round trip's wall-clock latency is recorded, because it decides
      whether the channel is kept

<!-- /ANCHOR:perf-verify -->
---

<!-- ANCHOR:deploy-ready -->
## L3+: DEPLOYMENT READINESS

- [ ] **CHK-090** [P0] The production bundle contains no probe API — proven by grepping the built file
- [ ] **CHK-091** [P0] Teardown restores the operator's app: desktop mode, debugger detached
- [ ] **CHK-092** [P1] `008` can consume a recorded probe run for its device row

<!-- /ANCHOR:deploy-ready -->
---

<!-- ANCHOR:compliance-verify -->
## L3+: COMPLIANCE VERIFICATION

- [ ] **CHK-100** [P0] MIT licence integrity preserved — nothing copied from the AGPL/source-available
      references under `external/`
- [ ] **CHK-101** [P0] No write to the operator's vault beyond the declared testbed
- [ ] **CHK-102** [P1] Any change to the operator's `js-engine` configuration is explicit and reversible

<!-- /ANCHOR:compliance-verify -->
---

<!-- ANCHOR:docs-verify -->
## L3+: DOCUMENTATION VERIFICATION

- [ ] **CHK-105** [P0] The transport table in `spec.md` §3A is re-checked against the machine before
      each run; a changed Obsidian version invalidates it, including the ten-handler guard trace
- [ ] **CHK-106** [P0] Every emulated result in the run record is labelled emulated, with the engine
      caveat and what would confirm it
- [ ] **CHK-107** [P1] `validate.sh <spec-folder> --strict` run and its exit code read without a pipe
- [ ] **CHK-108** [P0] No claim in this packet says "verified" over a set where only some members were
      checked. Each carries its own status and what was read

<!-- /ANCHOR:docs-verify -->
---

<!-- ANCHOR:sign-off -->
## L3+: SIGN-OFF

This phase does not claim the operator's review away. It makes the review short and specific, and it
states plainly which results are emulated and which came from a device.

It now also carries a second obligation: it is `000`'s independent instrument, and an instrument that
has never been shown detecting anything is not one.

- [ ] **CHK-110** [P0] Every criterion moved from its recorded value
- [ ] **CHK-111** [P0] N1-N10 hold
- [ ] **CHK-112** [P0] The device-only criteria are named, and none of them was satisfied by emulation
- [ ] **CHK-113** [P0] The operator has confirmed the shrunken review list is the right list
- [ ] **CHK-114** [P0] `000` can start: the probe has reproduced a known defect, and both cross-check
      artefacts have been handed over

<!-- /ANCHOR:sign-off -->
