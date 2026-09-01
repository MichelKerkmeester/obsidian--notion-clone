---
title: "Task Breakdown: Live Verification in the Running Obsidian"
description: "One task per requirement, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "009 live verification tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Live Verification in the Running Obsidian

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or
a command whose output and exit status were read.

**An emulated result names itself as emulated.** A phone result that was not obtained is reported as
"not run", never as a pass.

**A claim states its own verification status.** VERIFIED means a command was run or a file was read,
and the task says which. PARTLY VERIFIED and UNVERIFIED say so on the claim, with what would settle
it. One word covering a set where only some members were checked is the failure T2a-T2c exist to fix.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

**This packet now runs first in the program**, before `000`. Phases 1 and 1b are both stop
conditions. If T1 fails, this packet stops and records why. If T1a fails, the probe is fixed before
anything is built on it.

- [ ] **T1** Prove the transport: with Obsidian running, read a computed style from the real renderer
      — REQ-001.
      *Evidence to close:* `obsidian eval` returns a value for a body-mounted `.db-owned-menu`'s
      `border-radius`, and it **disagrees** with the browser harness's value for the same class.
      Record both numbers.
- [ ] **T1a** **Reproduce the known defect live** — REQ-010. The second stop condition.
      *Evidence to close:* in the running app, read the same menu class's computed style twice — once
      mounted on `document.body`, once inside `.note-database-container` — and the two values
      **differ**. `../architecture-findings.md` records that divergence at **29 of 29 probed overlay
      classes, 25 of 29 with no tokens at all on body**, so agreement is not good news: it means the
      probe is measuring one node twice, reading a stale frame, or resolving against the wrong
      document. A round trip proves the channel works; this proves the probe detects something.
      **`000` treats this probe as the instrument it cannot influence, so it earns that the same way
      every other instrument in this program does.**
- [ ] **T2** Record the environment every run depends on — REQ-007.
      *Evidence to close:* Obsidian version, the enabled plugin list, and the active theme captured
      into the run record. Both a theme and a plugin can restyle a native checkbox.

### The mobile blocks, verified or labelled

`spec.md` §3B's four blocks now carry individual verification statuses. Block 1 (rest-api
`isDesktopOnly`) and block 2 (the `isDesktopApp && window.electron` guard, brace-matched by hand) are
VERIFIED. These three tasks close the other two, or leave them honestly labelled.

- [ ] **T2a** Enumerate the built-in `obsidian://` actions — REQ-011. Block 3 is **PARTLY VERIFIED**:
      the absence of `obsidian-advanced-uri` is confirmed against `community-plugins.json`, but the
      claim that no built-in action evaluates code or runs a command was never traced.
      *Evidence to close:* the action names read out of the app bundle's
      `registerObsidianProtocolHandler` call sites, listed; the claim then restated as VERIFIED or
      corrected. If the enumeration cannot be completed, the block stays PARTLY VERIFIED and says so.
- [x] **T2b** Record block 4 as **UNVERIFIED** and name what would settle it — REQ-011.
      *Evidence to close:* the claim "no remote debugging port on mobile" carries an UNVERIFIED label
      in `spec.md` §3B. Only the desktop bundle exists on this machine — `grep -c remote-debugging`
      over `obsidian.asar` returns 0, which says nothing about a different binary on a device this Mac
      cannot read. **This is not closeable from here**; the task closes on the label being correct
      and the settling evidence being named, not on the question being answered.
- [ ] **T2c** Ask the operator for the iOS user-agent string — REQ-011.
      *Evidence to close:* the string, pasted back, confirming or refuting the §3B assumption that
      Obsidian on iOS runs a system WebView rather than Chromium. Until it arrives the assumption
      stays labelled as one and every emulated result carries the engine caveat. One line of operator
      effort settles a claim the whole emulation story rests on.
- [ ] **T2d** Audit the downstream citations — REQ-011.
      *Evidence to close:* every citation of this phase's mobile conclusion outside this packet —
      find them with `rg -n '009-live-verification|cannot reach' ../008-integration-and-release-observability/` —
      checked for whether it carries the same qualifier the claim carries here. One that presents an
      assumption as settled is **raised as a finding against that document**, not edited from here:
      `008` owns its own text, and a silent cross-packet edit is how a qualifier goes missing in the
      first place.
- [ ] **T3** Create the testbed vault or folder and seed it — REQ-005.
      *Evidence to close:* it contains a note whose body has a heading and a paragraph, and the view
      configurations the probes drive.
- [ ] **T4** Build the path guard and demonstrate it failing closed — REQ-005.
      *Evidence to close:* pointing the driver outside the testbed refuses and exits 2 **before**
      connecting; no vault file was opened.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Driver and probe API

- [~] **T5** Build `tools/live/probe.mjs` with three exit codes — REQ-004, NFR-R01.
      *Evidence to close:* 0 pass, 1 assertion failure, 2 infrastructure; each demonstrated
      separately, each exit status read without a pipe.
      *Status 2026-08-30:* built at `14fc433` (180 lines), constants at `probe.mjs:49-51`. **1 of 3
      demonstrated** — `--check transport` with Obsidian closed exits **2**. The 0 and 1 legs need the
      app open and have never been run.
- [ ] **T6** Build `src/dev/surface-probe.ts` behind a build flag and register the dev command beside
      the seven existing commands at `src/main.ts:339-385` — REQ-002, REQ-006.
      *Evidence to close:* `obsidian command id=note-database:surface-probe` opens the testbed view in
      the running app.
- [~] **T7** Prove the probe API is absent from production — REQ-006.
      *Evidence to close:* after `npm run build`, `grep -c __ndProbe main.js` returns 0.
      *Status 2026-08-30:* the count is **0** against the committed bundle, but `npm run build` was not
      re-run and **T6 was never built**, so nothing ever inserted the symbol. Left open rather than
      closed: a check that cannot fail proves nothing about a hook that does not exist.
- [ ] **T8** Probe: a dropdown's computed style at its real mount — REQ-003.
      *Evidence to close:* `border-radius`, `padding`, `font-size` and `box-shadow` read from the real
      renderer, recorded beside the harness's values for the same class.
- [ ] **T9** Probe: a sheet's `elementFromPoint` over the navbar band — REQ-003.
      *Evidence to close:* the returned node's class list, recorded. On a desktop profile with no
      navbar this records "no navbar present", which is a result, not a pass.
- [ ] **T10** Probe: a checkbox's computed `appearance` in a board card — REQ-003.
      *Evidence to close:* the computed value per family, read in the app with the operator's theme
      active.
- [ ] **T11** Drive real interactions through the probe API — REQ-002.
      *Evidence to close:* open a dropdown, open a sheet, toggle a checkbox, dismiss with Escape and
      with an outside click; each driven through the production producer, each asserting a model or
      render change rather than a node's presence.
- [ ] **T12** Seed defects and require the probes to redden — REQ-004.
      *Evidence to close:* reverting `000`'s token-root line reddens the token probes and nothing
      else; each seed recorded separately.
- [ ] **T12a** Export the cross-check `000` consumes — REQ-012.
      *Evidence to close:* a per-surface record in a shape `000`'s Stage-1.5 runner can pair against
      its harness numbers, **and** the explicit list of surfaces this phase could not reach, each with
      its reason. The second artefact is the one that is easy to skip: without it `000` reads an
      absent surface as a corroborated one. Confirm the reachable set covers every surface `000`'s
      Stage-1 harness repairs touch, and say so plainly if it does not.
- [ ] **T13** Capture beside the numbers — REQ-004.
      *Evidence to close:* `dev:screenshot` output path recorded in the run record for each probe set.
- [ ] **T14** Wire teardown so it runs on failure — NFR-R03.
      *Evidence to close:* after a deliberately failing run, `dev:debug off` and `dev:mobile off` have
      executed and the testbed is reset.

### The emulated phone profile

- [ ] **T15** Measure the four emulation facts under `dev:mobile on` — REQ-007.
      *Evidence to close:* whether `.mobile-navbar` exists; whether `body.is-phone` is set; what
      `--safe-area-inset-bottom` resolves to; what `visualViewport` reports. Four recorded values.
- [ ] **T16** Route `003`'s criteria against those facts — REQ-007.
      *Evidence to close:* a written list of which `003` criteria the emulated profile can carry and
      which stay device-only. If there is no `.mobile-navbar`, C1 is device-only and says so.
- [ ] **T17** Attach the engine caveat to every emulated result — REQ-007.
      *Evidence to close:* each emulated row in the run record names itself emulated, with the
      Chromium-versus-device-WebView assumption stated and what would confirm it.

### The deferred on-device probe

- [ ] **T18** Write the js-engine startup script and the Mac-side reader — REQ-008.
      *Evidence to close:* the script writes a structured result note; the reader parses it and
      asserts. Note that `js-engine`'s `data.json` does not currently exist, so `startupScripts` is
      empty and adding one is a deliberate change to the operator's vault configuration.
- [ ] **T19** Run the round trip once, end to end — REQ-008.
      *Evidence to close:* push, operator opens the app on the phone, iCloud syncs the note back, the
      reader parses it. Record the wall-clock latency, because that number decides T20.
- [ ] **T20** Decide: keep the channel or record an honest no — REQ-008.
      *Evidence to close:* either a passing round trip wired into the run record, or an ADR in
      `decision-record.md` stating why the latency and failure modes make the operator's own check
      cheaper.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T21** Run the full probe set from the final state, reading each exit code without a pipe.
- [ ] **T22** Cross-check every live value against the browser harness's value for the same surface —
      record each agreement and each disagreement.
- [ ] **T23** Route every disagreement to its owner; neither side wins by default. **For `000` a
      disagreement is a gate** — that phase repaired the harness it is measuring through, so a
      mismatch blocks it until the wrong instrument is identified. For every later phase it is a
      finding reported to `../008-integration-and-release-observability`.
- [ ] **T23a** Hand `000` its cross-check inputs — REQ-012.
      *Evidence to close:* `000`'s Stage 1.5 has both artefacts: the per-surface probe record and the
      unreachable list. Note in the run record whether the reachable set covered `000`'s Stage-1
      repair surfaces, because a partial cross-check that presents as complete is the same class of
      failure as a harness that cannot fail.
- [ ] **T24** Confirm the production bundle contains no probe API and the working tree is clean.
- [ ] **T25** Produce the shrunken operator review list: only the checks §3B marks as requiring human
      judgement, with emulated and device results distinguished.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- The transport proof passes and its two disagreeing numbers are recorded.
- **The probe has reproduced the known body-mount defect live**, against the recorded 29/29.
- **`000` has both cross-check artefacts**: the per-surface probe record and the unreachable list.
- **Each §3B mobile block carries its own verification status**, and the downstream citations have
  been audited for the same qualifier.
- The path guard fails closed, demonstrated.
- `live:probe` exits 0, 1 and 2 in the right circumstances, each demonstrated.
- Every probe has been shown reddening on a seeded defect.
- `grep -c __ndProbe main.js` returns 0 on a production build.
- The four emulation facts are recorded as measurements, and the device-only criteria are named.
- The deferred phone channel either round-trips or carries an ADR explaining why it was not built.
- Every disagreement with the browser harness is recorded as a finding rather than resolved by
  preference.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md) · [`../design-system.md`](../design-system.md)
- [`../adversarial-review.md`](../adversarial-review.md) · [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md)

<!-- /ANCHOR:cross-refs -->
