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
- [x] **T26** Give `.obnotion-panel-button` an explicit padding decision. Giving `tools/live/`'s
      lanes the same host stylesheet model `tools/storybook/verify-placement.mjs` already carried
      (`tools/screenshots/host-bare-controls.css`, loaded by `sheet-grammar.mjs`,
      `render-assertions.mjs`, `touch-targets.mjs`, `sheet-rebuild.mjs` and `sheet-teardown.mjs`)
      surfaced that `.obnotion-container .obnotion-panel-button` (styles.css) declares no `padding`
      of its own, so Obsidian's own `button` rule supplies its real 4px/12px — never modelled before
      this lane carried the host stylesheet. `tools/live/sheet-grammar.mjs`'s overflow sweep now
      measures the sort-panel's own two `.obnotion-panel-button` controls (its add-sort and its "×"
      remove) at ~9.8-10.8px past the panel's own right edge, on both Chrome and WebKit, in the
      panel as built, stacked over its field or direction picker, and with a long field name —
      consistently, not a rendering jitter. This is a real, previously-invisible device defect:
      `.obnotion-panel-button` is used across `board-groups-panel.ts`, `column-manager-renderer.ts`,
      `database-view.ts`, `embedded-database-renderer.ts`, `filter-panel-renderer.ts` and
      `sort-panel-renderer.ts`, each with different content (icon-only, text, icon+label), so the
      right padding is a real per-surface design decision this leg did not make — it recorded the
      gap instead of guessing at the fix. `tools/gate.mjs`'s `sheet-grammar` check carries an
      `expectFail` naming this task until it lands.
      *Evidence to close:* every `.obnotion-panel-button` surface reviewed for its intended padding
      under the real host button rule; a decision recorded (explicit `padding`, or a documented
      reason the host's 4px/12px is correct as-is) for each; `tools/live/sheet-grammar.mjs`'s
      overflow sweep green with the `expectFail` removed from `tools/gate.mjs`.
      *Status 2026-09-08:* **closed.** The overflow sweep's own diagnostic (a temporary
      `getBoundingClientRect`/`textContent` print, reverted after use) corrected one detail of the
      finding above: the two overflowing descendants at every reported scenario are the sort rule
      row's own **two "×" remove buttons** (one per rule, both landing at the same x-position
      because both rows share the same `CONDITION_FIELD_FLOOR_PX`-driven layout) — never the
      standalone "+ Add sort" button, which was never part of the overflow. Reviewed every named
      renderer plus two more bare-class consumers the review turned up
      (`view-config-panel-renderer.ts`, `cell-editor-option.ts`):
      - `sort-panel-renderer.ts`, `filter-panel-renderer.ts` (add-condition/add-filter/AND-OR/×),
        `board-groups-panel.ts` (Hide all/Show all) — no override before this task; now take the
        base class's explicit `padding: 0 6px` (styles.css:13508-13520), chosen empirically against
        the live sweep: `0 8px` still overflowed 1.8-2.8px, `0 6px` clears every scenario (Chrome
        and WebKit, as-built/stacked-field/stacked-direction/long-name) with 1.2-3.8px margin.
        filter-panel-renderer.ts's own bare usages were already clean under the full host 12px,
        verified PASS both before and after — the tighter shared value costs it nothing.
      - `column-manager-renderer.ts`'s `.obnotion-column-manager-add-button` (padding `0 6px`) and
        `database-view.ts`/`embedded-database-renderer.ts`'s `.obnotion-group-order-reset` (padding
        `0 8px`) already declared their own explicit overrides — reviewed, correct as-is, left
        unchanged.
      - `view-config-panel-renderer.ts`'s icon+label layout-option button and
        `cell-editor-option.ts`'s "Clear" button inherit the new base padding; neither was part of
        any overflow and neither dropped under the touch floor.
      The narrower box (0 6px vs. the host's 24px total) dropped three specific controls under the
      28px touch-target ratchet: the sort/filter row's "×" (20x28) and the filter header's AND/OR
      toggle (26x28). Rather than widen the visible box back into overflow, or silently bump the
      ratchet's recorded ceiling, these three took a new `.obnotion-panel-button-narrow` marker
      (`sort-panel-renderer.ts:238`, `filter-panel-renderer.ts:329,604`) with a `::before` inset of
      `-6px` top/bottom and `-12px` left (`0` on the right, so the invisible hit area cannot reopen
      the same overflow) for their real touch target — the same idiom `obnotion-checkbox` already
      uses — with a matching `DECLARED` entry added to `tools/live/touch-targets.mjs`. The hand
      fixture `tools/screenshots/scenarios/panels.mjs` (a separate, hand-authored HTML mirror the
      real renderer source does not drive) needed the same marker class added by hand to its two
      "×" buttons for its own fixture pass to see the exemption.
      Verified: `node tools/live/sheet-grammar.mjs` 29 failures → 0. `node tools/live/
      touch-targets.mjs` 0 new regressions in either pass (fixture baseline 171, constructed
      baseline 785, both held — not bumped). `npx tsc --noEmit`, `npx vitest run` (1642 tests),
      `npm run build` all green. Recaptured from a clean index twice (`npm run screenshots`, 608
      entries both passes, `screenshots:verify` exit 0 both times); the 51 moved captures
      reproduced byte-identical across both passes — zero jitter, nothing to restore. Every file
      judged by decoded pixel delta (`tools/screenshots/pixel-hash.mjs`'s `decodePng`) against the
      HEAD-committed PNG: changed-pixel counts ranged 4px (`constructed-column-manager-mobile-
      dark`, maxDelta 1, a sub-pixel stacking-context nudge from the new `position: relative`) to
      24,601px / 0.475% (`constructed-filter-panel-nested-desktop-light`, maxDelta 209 — the AND/OR
      toggle and every remove/add button shrinking under the new padding, against the largest
      proportional move at 17,479px / 2.74% on the smaller `panel-filter-conditions-desktop-light`
      fixture crop); `panel-sort-rules-mobile-
      {dark,light}` additionally narrowed 804x450 → 798x450, the sheet's own fit-content width
      losing exactly the 6px this fix removed. Four captures opened and read directly:
      `panel-sort-rules-mobile-dark` and `panel-filter-conditions-mobile-dark` show every remove/
      add/toggle button fully inside its panel with no overflow; `panel-board-groups-mobile-dark`
      and `field-cell-edit-select-mobile-dark` (the Hide all/Show all and Clear text buttons, both
      far wider than the new floor) show no visible regression. `tools/lane/css-lane.json` carries
      the acquire/edit/release handover from `068-rename-to-obnotion` to `009-live-verification`,
      naming all 51 captures. `tools/gate.mjs`'s `sheet-grammar` `expectFail` removed. `npm run
      gate`: **26 green, 0 declared red.**
- [x] **T27** Make the engine-parity lane a real gate over its recorded steady state — the program's
      residual: `tools/live/engine-parity.json` recorded 23 Chrome-vs-WebKit width disagreements
      that the lane reported and nothing watched.
      *Evidence to close:* the root cause of the width split measured and written down; the lane
      exiting 0 on the recorded steady state and 1 on any new, changed or grown disagreement, with
      a negative control; the wider battery green from the final state.
      *Status 2026-09-09:* **closed.** Measured, not assumed: the 23 are three mechanisms, none a
      stylesheet gap — every disagreeing input already carries its width and the popover that owns
      the 8px cascade already carries its box-sizing, so the fix-the-stylesheet branch did not
      apply and the inherent branch did (ADR-001 in this packet's `decision-record.md` carries the
      per-scenario delta table and the reasoning). Twelve entries (add-view-popover's six action
      rows, dropdown-field, chrome-table-load-more, both date pickers) sit at exactly 8px: WebKit
      reserves a classic scrollbar (popover clientWidth 358 vs 350 at an identical 360 offsetWidth)
      where this Chrome paints overlay. Eleven entries (delta 22.31 ×2, 18.88 ×4, 18.02 ×5) are the
      engines' intrinsic text-input widths leaking through fit-content ancestors — the add-view
      field's shrink-to-fit wrapper, the import modal's auto table column, the cell editor's
      fit-content popover; the probe read each disagreement as exactly the intrinsic difference
      under that control's own typography. The third mechanism was the instrument, not the engines:
      six pre-fix runs returned 23, 47, 47, 39, 39, 23 — the checked-background transitions of two
      modal scenarios' native checkboxes read mid-flight, the failure the module's own header
      documents. Fixed in the harness: the read now awaits every finite
      `document.getAnimations().finished` (via `Promise.allSettled`; infinite animations skipped)
      in both engines, and three consecutive post-fix runs printed the identical 23. The lane is a
      gate: it classifies each disagreement against the record as it stood before the run — steady
      only when the scenario, element and property match and the recorded delta reproduces within
      the 1.5px the instrument already uses — and exits 0 only then; new, property-changed, or
      grown disagreement exits 1, a vanished one is an improvement. Negative control: the two
      add-view deltas planted at 255.31 → steady 21 / new 2, exit 1, both planted entries flagged
      NEW and nothing else; next run absorbs and exits 0. No suppression: the committed 23 carry no
      categorical notes, so a background or appearance disagreement appearing now is new and fails.
      The record now also fingerprints `theme.css` and `runtime-vars.css`, which it loads but
      previously did not date. RED→GREEN: pre-fix, exit 1 on every run with a count that flickered;
      post-fix, exit 0 steady (fourth consecutive) — the earlier recorded 23 happened to be a
      settled read, so the settled steady state needs no new allowance. The wider battery, final
      state: `npx tsc --noEmit` 0; `npx vitest run` 1581/1581 (the retired-renderer removal 69308192, already in this
      worktree's ancestry, accounts for the count against T26's recorded 1642 — no test lost by
      this leg); `npm run build` 0; sheet-grammar 0; render-assertions 0; verify-placement 0
      (418/420, 2 red for a declared reason); `engine-parity` 0; `evidence --check-all` 0 (15/15);
      `npm run gate` exit 0 — 27 green, 0 declared red; scan-comments 0; scan-failing-values 0.
      styles.css untouched, so no recapture owed; the seven other stamped artefacts the gate
      re-dated differ by `measuredAt` only and ride this commit.

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
