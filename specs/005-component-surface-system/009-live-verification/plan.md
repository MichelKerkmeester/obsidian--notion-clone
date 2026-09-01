---
title: "Implementation Plan: Live Verification in the Running Obsidian"
description: "Approach, gates and rollback for the CLI-backed probe transport, the dev-only driver command, the emulated phone profile and the deferred on-device probe."
trigger_phrases:
  - "009 live verification plan"
  - "probe transport"
  - "dev mobile emulation"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Live Verification in the Running Obsidian

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Six stages: prove the transport round-trips a real value, **prove the probe can reproduce a defect we
already know exists**, build the testbed and its safety guard, build the driver and the dev-only
probe API, measure the emulated phone profile's actual fidelity, then decide whether the deferred
on-device probe earns its maintenance.

**This phase now runs first in the program.** It was originally parallel and gated nothing. An
independent review found that `000` repairs the harness and then measures its own work through it,
which is the circularity that produced 1.3.1. The running app is the one instrument `000` cannot
edit, so this phase stands it up first and `000`'s harness-truth claims are gated on agreeing with
it.

**Stage 1 is a stop condition, not a warm-up.** If `obsidian eval` cannot return a computed style
from the real renderer, nothing else in this phase is worth building and the operator's manual review
stays as it is.

**Stage 1b is the second stop condition, and it is new.** A round trip proves the channel carries
bytes; it does not prove the probe is looking at the right node in the right document. `000` is about
to depend on this probe as its independent witness, so the probe must first show the body-mount
divergence live — the defect `../architecture-findings.md` records at 29 of 29 probed overlay
classes. A probe that reports agreement there is broken, and shipping it as `000`'s witness would
replace one unverifiable instrument with another.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction in count |
| Transport proof | `npm run live:probe -- --transport-only` | a computed style returns from the real renderer |
| **Defect reproduction** | `npm run live:probe -- --reproduce-known` | the body-mount divergence is observed live: the same menu class computes differently on `document.body` than inside `.note-database-container`. **Agreement fails this gate** |
| **Cross-check export** | `npm run live:probe -- --export-crosscheck` | a per-surface record `000` can pair against, plus the explicit list of surfaces this phase cannot reach |
| Live probe | `npm run live:probe` | exit 0 on a good tree, non-zero on a seeded defect |
| Testbed guard | `npm run live:probe -- --target <outside-path>` | refuses and exits non-zero without touching the vault |
| Bundle cleanliness | `grep -c __ndProbe main.js` after `npm run build` | 0 |
| Emulation facts | `npm run live:mobile` | the four §3B facts recorded as measured values |

Three distinct exit codes: 0 pass, 1 assertion failure, 2 infrastructure (Obsidian not running,
socket missing, testbed unavailable). An infrastructure problem is never reported as a defect.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**Three pieces, each small, with the interesting decisions at the boundaries between them.**

*The transport* is `obsidian eval code='<js>'`. It runs `await window.eval(code)` in the renderer and
prints `=> <JSON.stringify(result)>`. Everything this phase needs — `getComputedStyle`,
`getBoundingClientRect`, `document.elementFromPoint`, listener counts, host custom properties — is
reachable through it. `dev:cdp` is available for `DOM.getBoxModel` and `DOM.getNodeForLocation` when a
CDP-shaped answer is more convenient, but it auto-attaches a debugger, so the plain `eval` path is the
default and CDP is opt-in per probe.

*The driver* (`tools/live/probe.mjs`) is a Node script. It checks the socket, runs the transport
proof, then executes one probe at a time, comparing the returned value against a threshold and
printing both. It exits 0, 1 or 2. It is deliberately boring: no framework, no watch mode, no
reporter. A gate that is hard to read is a gate that gets distrusted and then skipped.

*The probe API* (`src/dev/surface-probe.ts`) exists so the `eval` payloads stay short. Rather than
shipping a 40-line anonymous script through a shell argument — unreviewable in a diff, fragile under
quoting — the plugin exposes `window.__ndProbe` in development builds with the handful of operations
the probes need: open a named surface, drive an event, read a measurement, tear down. The `eval`
payload then reads `__ndProbe.measure('menu','border-radius')`, which a reviewer can check at a
glance.

**Why the plugin owns the driving and the CLI owns the reading.** Dispatching a realistic pointer
sequence is fiddly and version-sensitive, and getting it wrong produces a surface that looks driven
but was not — the exact class of false green this program exists to eliminate. Putting the driving
inside the plugin means it uses the same event plumbing production uses and is reviewable in the
repository. The CLI's job is narrow: carry a request in and a JSON value out.

**Why not `obsidian-local-rest-api`.** It is installed, disabled, `isDesktopOnly: true`, and has no
evaluation endpoint. Its `/commands/:id/` can fire a command but returns 204 with no value, so a probe
built on it would drive without reading. Enabling an authenticated HTTP server on the operator's
machine to gain strictly less than the CLI already gives is a net loss. Its one genuinely interesting
hook — `registerApiExtension`, which lets a plugin mount its own router — is noted here as a future
option if an HTTP-shaped consumer ever appears, and rejected for now on the same grounds.

**Why not Playwright over `--remote-debugging-port`.** It would give a persistent session and better
ergonomics, and `playwright-core@1.62.1` is already installed. But the bundle contains no
`remote-debugging` string, so whether the switch is honoured is inference; `requestSingleInstanceLock`
means testing it requires quitting the operator's running app; and the CLI already covers the need.
Recorded as the fallback if the CLI surface changes under an Obsidian update.

**The testbed guard is architecture, not hygiene.** `eval` is arbitrary code in the operator's real
app with their real vault mounted. The driver resolves its target path, compares it against the
testbed root, and refuses to run on a mismatch — before it connects, not after. This is the one place
in the phase where a bug is expensive, so it is the one place with a guard that fails closed.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Transport proof, or stop

With Obsidian running, evaluate `getComputedStyle` on a body-mounted `.db-owned-menu` and print the
result. Compare it with the value the browser harness reports for the same class. If the transport
works, those two numbers **disagree** — that disagreement is the entire justification for this phase,
and it is measurable on day one against the recorded 29/29 divergence.

If the transport does not work, stop and record why. Nothing later is worth building on an unproven
channel.

### Phase 1b — Reproduce the known defect, or stop again

The transport proof shows bytes moving. It does not show the probe reading the right node, in the
right document, at the right moment — and a probe that silently reads the wrong thing returns
plausible numbers rather than an error. `000` is about to treat this probe as the instrument it
cannot influence, so it earns that role the same way this program makes every other instrument earn
it: **by failing on a defect that is present.**

Read the same menu class twice in the running app — once mounted on `document.body`, once inside
`.note-database-container` — and require the computed values to **differ**. `../architecture-findings.md`
records that divergence at 29 of 29 probed overlay classes, with 25 of 29 carrying no tokens at all
on body, so agreement is not good news. It means the probe is measuring one node twice, or reading a
stale frame, or resolving against the wrong document.

If the probe cannot reproduce it, fix the probe. Do not proceed to build `000`'s cross-check on a
channel that has never been shown detecting anything.

### Phase 2 — Testbed and guard

Create the testbed vault or folder, seeded with the notes and view configurations the probes drive —
including a note whose body carries a heading and a paragraph, because `006` counts body characters
and needs a known answer. Build the path guard and prove it fails closed before any probe writes
anything.

### Phase 3 — Driver and probe API

Build `tools/live/probe.mjs` with its three exit codes, and `src/dev/surface-probe.ts` behind a build
flag. Write the first three probes against the surfaces the program cares about most: a dropdown's
computed style at its real mount, a sheet's `elementFromPoint` over the navbar band, and a checkbox's
computed `appearance` in a board card. Verify the production bundle is clean by grepping the built
file, not by reading the source.

**Then export the cross-check `000` consumes.** Two artefacts, not one: a per-surface record of what
the probe measured, in a shape `000`'s Stage-1.5 runner can pair against its harness numbers; **and
the explicit list of surfaces this phase could not reach, each with its reason.** The second is the
one that is easy to skip and expensive to omit — `000` would otherwise read an absent surface as a
corroborated one, which is the same class of silent hole this program exists to close.

The reachable set must cover, at minimum, every surface `000`'s Stage-1 harness repairs touch. If it
does not, say so before `000` starts rather than after it closes.

### Phase 4 — The emulated phone profile, measured

Run `dev:mobile on` and record the four facts §3B names: whether `.mobile-navbar` exists, whether
`body.is-phone` is set, what `--safe-area-inset-bottom` resolves to, and what `visualViewport`
reports. Write each down as a measured value.

These four answers decide how much of `003`'s criteria the emulated profile can carry. If there is no
`.mobile-navbar`, the emulated profile cannot carry the hit test at all and `003`'s C1 stays a
device-only criterion — which is a finding worth having early rather than at release. Every result
from this profile carries the engine caveat: it proves Chromium at phone metrics, not the phone.

### Phase 5 — The deferred on-device probe, or a written decision not to build it

Write the js-engine startup script and the Mac-side reader, push them through the iCloud-synced vault,
and have the operator open the app once. If the round trip works, it becomes the phone's
machine-checkable evidence. If the latency or the failure modes make it worse than the operator's own
check, record that decision in `decision-record.md` and keep the manual check.

REQ-008 is P1 because this is a genuine fork, not a formality: a one-way channel with a human trigger
and no error reporting may not be worth maintaining, and saying so is a legitimate outcome.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The driver's own logic — argument parsing, path guarding, threshold comparison, exit-code selection —
is pure and is unit tested under `vitest`, which runs `environment: "node"` with no jsdom
(`vitest.config.ts:16`). That constraint is not a problem here: nothing in the driver touches a DOM,
because the DOM lives in another process.

The probes themselves are tested by seeding defects. A probe that cannot go red is theatre in exactly
the way the rest of this program describes, so each probe is demonstrated failing before its passing
result is recorded. The cheapest seeds: revert `000`'s token-root line and require the token probes
to redden; remove the testbed's navbar equivalent and require the hit-test probe to redden; point the
driver outside the testbed and require it to refuse.

Cross-checking is a first-class test, not a nicety. Every value the live probe reads for a surface the
browser harness also measures is compared. Neither side wins by default — the harness can be blind,
and the probe can be measuring the wrong node. A disagreement means one of them is wrong and the
point is to find out which.

**Where the disagreement lands differs by phase.** For `000` it is a **gate**: that phase repaired
the harness it is measuring through, so a mismatch blocks it until the wrong instrument is
identified. For later phases it is a finding recorded in `008`. The distinction matters because
`000`'s harness numbers have no other witness, and everything downstream inherits them.

**And this phase's own probes are tested the same way.** Phase 1b is the instance that matters most:
a probe demonstrated reproducing a known defect is an instrument; a probe that has only ever agreed
with something is an opinion.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

Hard: a running Obsidian. The CLI is a socket client and will not start the app — with the app down,
`obsidian --help` itself exits 1 with `The CLI is unable to find Obsidian`. The driver treats that as
exit code 2, never as a failed assertion.

Nothing else upstream. **This phase runs first in the program**, so it has no predecessor phase and
cannot wait on one.

Soft, and now inverted: `000`'s registry. Once it exists the probe enumerates targets from it instead
of a hand-listed set — but that is later, because this phase precedes `000`. The hand-listed set is
the starting condition by design, and §3's Inventory Method requires it to cover every surface
`000`'s Stage-1 repairs touch.

**Primary consumer: `000`.** Its Stage 1.5 pairs every harness number against this phase's recorded
probe run, and a disagreement blocks that phase. This is a hard consumer relationship: `000` has no
other independent witness for its own harness repairs.

Secondary consumer: `../008-integration-and-release-observability` uses recorded probe runs for the
device row of its release gate. This phase is not on `008`'s critical path — the manual review
remains the documented fallback — but it makes that row cheap enough to run per phase instead of
once. **`008` also inherits this phase's mobile conclusion, and REQ-011 requires that citation to
carry the same verification qualifier this phase attaches to each block.**

Environment: the operator's vault has 22 enabled plugins and a chosen theme. Both are recorded with
every run, because either can restyle a native checkbox and change an answer.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

This phase adds tooling and one build-flagged source file; it changes no product behaviour and does
not touch `styles.css`. Reverting removes the probe and returns the operator's review to what it is
today.

Three specific restorations matter more than the code revert:

- **Teardown always runs, including on failure**: `dev:debug off`, `dev:mobile off`, testbed reset.
  An abandoned run must not leave the operator's app in emulation with a debugger attached.
- **The testbed is disposable by construction.** If a probe corrupts it, deleting and re-seeding is
  the recovery, and nothing outside it was reachable.
- **If the probe API is ever found in a production bundle**, that is a release-blocking incident, not
  a cleanup: pull the build, remove the flag path, and add the grep to the gate before rebuilding.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
Obsidian running ──▶ Phase 1 transport proof ──▶ Phase 1b reproduce the known defect
                                                         │
                                            Phase 2 testbed + guard
                                                         │
                                            Phase 3 driver + probe API + cross-check export
                                                         │
                            ┌────────────────────────────┼────────────────────────────┐
                            ▼                            ▼                            ▼
              000 Stage 1.5 cross-check    Phase 4 emulated phone, measured   Phase 5 deferred
              (this phase gates it)                      │                    on-device, or a no
                                                         │                            │
                                                003's criteria routing        ▶ 008 device row
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Phase 1 transport proof | A running Obsidian | Proof the channel returns a real computed value | Everything; it is a stop condition |
| Phase 1b defect reproduction | Phase 1 | Proof the probe detects a defect that is present — the 29/29 body-mount divergence, observed live | Everything after it; a probe that has never detected anything cannot be `000`'s witness |
| Phase 2 testbed + guard | Phase 1b | A disposable target and a fail-closed path guard | Any probe that writes |
| Phase 3 driver + probe API | Phases 1-2 | `live:probe` with three exit codes; a clean production bundle; **the cross-check export and the unreachable list** | Phases 4-5, **and `000`'s Stage 1.5** |
| Phase 4 emulated phone | Phase 3 | The four measured emulation facts, and how much of `003` the profile can carry | `003`'s criteria routing |
| Phase 5 deferred on-device | Phase 3 | Machine-checkable phone evidence, or a recorded decision not to build it | `008`'s device row on phone |
| `000` Stage 1.5 | Phase 3's export | Harness/live pairs and `000`'s uncorroborated list | Every stage of `000` after 1.5 |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **Phase 1 — transport proof** - CRITICAL and a stop condition. Everything else assumes it.
2. **Phase 1b — defect reproduction** - CRITICAL and the second stop condition. `000` depends on this
   probe being an instrument rather than an opinion, and the difference is demonstrable.
3. **Phase 2 — testbed guard** - CRITICAL for safety. `eval` reaches the operator's real vault, and
   the guard is what keeps that acceptable.
4. **Phase 3 — driver, probe API and cross-check export** - CRITICAL. It is the deliverable, and its
   export is what unblocks `000`'s Stage 1.5.

**Total Critical Path**: Phase 1 → Phase 1b → Phase 2 → Phase 3. **This path is now on the program's
critical path too**, because `000` — which blocks every other phase — waits on Phase 3's export.

**Parallel Opportunities**:
- Phase 4's emulation measurements can run as soon as Phase 3's first probe exists, and can overlap
  `000`'s Stage 1.
- Phase 5 is independent and may be answered with a written decision rather than an implementation.
- The §3B verification tasks (T2a, T2b, T2c) are reading and operator questions; they can run
  alongside any stage.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | The channel is real | A computed style returns from the running app and disagrees with the harness for a known-divergent class | End of Phase 1 |
| M1b | The probe is an instrument | The body-mount divergence reproduced live: the same menu class computes differently on `document.body` than inside the container, matching the recorded 29/29 | End of Phase 1b |
| M2 | Safe to run | The path guard refuses an out-of-testbed target before connecting; the testbed is seeded and disposable | End of Phase 2 |
| M3 | It is a gate, and `000` can consume it | `live:probe` exits 0 on a good tree and non-zero on each seeded defect; the production bundle is clean; the cross-check export and the unreachable list are handed to `000` | End of Phase 3 |
| M4 | The phone's limits are known | The four emulation facts recorded as measurements, and the list of `003` criteria the profile cannot carry | End of Phase 4 |
| M5 | The phone has evidence or an honest no | A parsed on-device result note, or an ADR recording why the channel is not worth maintaining | End of Phase 5 |

<!-- /ANCHOR:milestones -->
---

## 11. RISK

**`eval` runs arbitrary code in the operator's real app.** This is the phase's defining risk and the
reason Phase 2 precedes every probe that writes. The guard fails closed, the testbed is disposable,
and the plugin's own undo command is the manual backstop.

**Emulation mistaken for a phone.** The program exists because a green signal was trusted over a
device. An emulated phone result carries a caveat on every line, and Phase 4 measures the caveat
rather than assuming its size.

**An undocumented CLI surface.** Nothing here is a published API. The transport proof runs first on
every invocation, so a break at an Obsidian update fails loudly at the first step rather than
producing quiet wrong numbers.

**A probe that agrees for the wrong reason.** This is the risk the repositioning creates. `000` now
treats this probe as the instrument it cannot influence, so a probe that silently reads the wrong
node hands `000` a false confirmation and the program is back where it started with an extra layer of
process. Phase 1b is the mitigation and it is a stop condition: the probe must reproduce a defect that
is present before anything is built on it.

**An honest label that does not survive the next hop.** §3B labels each mobile block with its real
verification status, and two of the four are not verified. `008` already cites the conclusion as
settled. Labelling carefully here and letting the qualifier evaporate downstream buys nothing, so
REQ-011 audits the citation and raises a finding rather than editing another packet silently.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] Obsidian is running and the socket exists
- [ ] The testbed path is set and the guard has been demonstrated failing closed
- [ ] The transport proof passed in this session
- [ ] The defect reproduction passed — the probe has been shown detecting something
- [ ] The probe payload is short enough to review in the diff
- [ ] Teardown is wired before the probe is run, not after it fails

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Phases 1 and 1b are both stop conditions. No probe is written before the transport proof passes, and none is trusted before the probe has reproduced a defect that is present |
| TASK-SAFETY | No probe runs against a path outside the testbed. The guard refuses before connecting |
| TASK-EVIDENCE | A task closes only on a value that was read or a command whose output and exit status were read |
| TASK-EXITCODE | Infrastructure failure is exit 2 and is never recorded as an assertion failure |
| TASK-BUNDLE | The probe API's absence from production is proven by grepping the built `main.js` |
| TASK-CAVEAT | Every emulated result is recorded with the engine caveat attached |
| TASK-STATUS | Every mobile-impossibility claim states VERIFIED, PARTLY VERIFIED or UNVERIFIED on the claim, with what was read or what would settle it. "Verified" covering a set where only some members were checked is the failure this rule exists to stop |
| TASK-REACH | A surface the probe could not measure is written onto the unreachable list with its reason. It is never simply absent — `000` reads absence as agreement |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. An emulated result names itself as emulated. A phone result
that was not obtained is reported as "not run", never as a pass.

### Blocked Task Protocol

A task is BLOCKED when Obsidian is not running, the socket is missing, the testbed is unavailable, or
the operator's manual step has not happened. On BLOCK: record the blocker in `tasks.md`, stop that
task, and do not substitute an emulated result for a device result.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md) · [`../design-system.md`](../design-system.md)
- [`../adversarial-review.md`](../adversarial-review.md) — the review that moved this phase to the front
- [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md) — the consumer of Phase 3's cross-check export
- [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md)
