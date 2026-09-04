---
title: "Goal: Live Verification"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "009 goal"
  - "live verification goal"
  - "live verification directive"
  - "packet goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/009-live-verification"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Backfilled the house goal shape; criteria and evidence untouched"
    next_safe_action: "Round-trip obsidian eval, then reproduce the known body-mount divergence live"
    blockers:
      - "The probe cannot open the real app from this repository; only the operator's device closes it"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-009-goal"
      parent_session_id: null
    completion_pct: 33
    open_questions: []
    answered_questions: []
---
# Goal: Live Verification

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Ask the running application a question and get a number back, so `000` can no longer certify its own instrument.

Repo `~/MEGA/Development/Obsidian Plugin`. **This phase runs FIRST, before 000.** It used to be parallel and gate nothing. An independent review found the reason that was wrong.

**WHY IT MOVED TO THE FRONT.** `000` repairs the harness — adds a `.mobile-navbar`, loads `styles.css` on the desktop page, unpins four runtime values, inverts a CI assertion — and then measures its own repairs **through that same harness**. Its negative controls run inside the instrument it just rewrote. A repair that is wrong in a way that makes everything pass is indistinguishable from a correct one. **That is 1.3.1's failure mode in a new costume.**

The running app is the one measurement surface `000` cannot edit. **This phase is that instrument, and `000`'s harness-truth claims are gated on agreeing with it.** A harness number and a live number that disagree is a blocking failure for `000` — resolved by finding which instrument is wrong, never by preferring the convenient one.

### Decisions

Frozen choices. Changing one is an amendment. Each is a restatement of this phase's own
directive above, not a new commitment.

| ID | Decision |
|----|----------|
| D1 | **This phase runs FIRST, before `000`.** It used to be parallel and gate nothing; an independent review found the reason that was wrong. |
| D2 | `000` repairs the harness and then measures its own repairs through that same harness, so its negative controls run inside the instrument it just rewrote. A repair that is wrong in a way that makes everything pass is indistinguishable from a correct one. |
| D3 | The running app is the one measurement surface `000` cannot edit. A harness number and a live number that disagree is a **blocking failure** for `000`, resolved by finding which instrument is wrong, never by preferring the convenient one. |
| D4 | Two stop conditions, in order: the transport round-trips, and the probe reproduces a defect already known to exist. **Agreement is a failure** — it means the probe measured one node twice, read a stale frame, or resolved against the wrong document. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../adversarial-review.md`, `../architecture-findings.md`, `../roadmap.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**TWO STOP CONDITIONS, IN ORDER.**
1. **The transport round-trips.** `obsidian eval` returns a real computed value, or this phase stops and records why.
2. **The probe reproduces a defect we already know exists.** Read the same menu class twice in the running app — on `document.body`, and inside `.note-database-container` — and require the values to **differ**. The recorded divergence is **29/29 probed overlay classes, 25/29 with no tokens at all on body**. **Agreement is a failure**: it means the probe measured one node twice, read a stale frame, or resolved against the wrong document. A round trip proves the channel; this proves the instrument. `000` is about to trust this probe — it earns that the same way this program makes everything else earn it.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked without
evidence in this folder or in a lane.*

- [ ] The probe reproduces the known body-mount divergence live. Agreement fails. **Unreachable from
      this repository.** Every instrument here renders `styles.css` against a headless page; none of
      them can open the real app, which is the whole reason this packet exists.
- [ ] `elementFromPoint` over the navbar answers from the real app. **Unreachable for the same
      reason**, and it is the row `003`'s two open rows are waiting on: their navbar is a
      hand-written div with no `app.css` rule and no stacking context.
      **The second half of that sentence is no longer true, and `003` is no longer waiting.** The
      harness navbar is now transcribed from the installed application stylesheet — `position: fixed`,
      `height: 80px`, and **no z-index**, where the hand-written div carried `72px` and `z-index: 100`.
      `003`'s two rows closed against that, taking it from **5 of 8** to 7 of 8.

      **What that does and does not settle.** It removes the invention, so the headless answer is now
      derived from the same declarations the app ships. It is still not the app: a theme, another
      plugin, or a host rule this transcription missed would not show up here. The row stays open for
      that residue, which is a much smaller claim than the one it was written for.
- [x] The probe exits non-zero when an assertion fails and zero when it passes; infrastructure
      failure is a distinct exit 2. **No probe exists to exit.** **Stale, and now held rather than
      written down — 2026-09-01.** `tools/live/probe.mjs` exists and declares exactly these three
      codes; what was missing is that **nothing checked them**.
      **The asking needs the app; the deciding does not.** That is why the verdict was lifted out of
      `checkTransport` into `transportVerdict(result)`, a pure function of whatever the app said.
      Seven cases now drive all three codes without an Obsidian: a loaded plugin gives 0, an
      answering app with the plugin absent gives 1, and a refused question gives 2.
      **The case that matters is the set, not the three.** *gives the three states three different
      codes* is what goes red when two of them collapse — watched, by setting
      `EXIT_INFRASTRUCTURE = 1`: `expected 2 to be 3`, **while all three individual assertions still
      passed**. Conflating "the product is wrong" with "I could not ask" is this packet's founding
      blindness, and it is the one shape a per-code assertion cannot see.
      **Three answers that look like passes are coded as infrastructure**, not as product failures:
      unparseable output, an empty payload, and no result at all. A CLI printing a banner instead of
      JSON says nothing about the plugin, so reporting a defect there would be inventing one.
      **A defect found by trying to test it.** The probe had no entry guard, so importing it ran
      `main()`, went looking for a running Obsidian, and called `process.exit(2)` from inside the
      test runner. **A module that cannot be imported cannot be tested**, which is most of why these
      codes were written down and never checked. `vitest.config.ts` now includes
      `tools/**/*.test.mjs` — only that suffix, so a harness script is not mistaken for a suite.
      **What this still does not do:** ask the real app anything. Rows 1, 2 and 5 stay open for
      exactly that reason, and this row was never about the app answering — it is about what the
      probe does with the answer.
- [x] Every claim about mobile states explicitly whether it is measured, emulated, or
      operator-reported — and every downstream citation carries the same qualifier. **Met in
      practice across the program, 2026-09-01.** Every packet carries a harness-dependence audit
      naming which of its numbers survive the question *would this still fail on a device*, and the
      operator rows are marked as only the operator can close them. It is a discipline rather than
      a check, and it is ticked because the artefacts exist and are cited, not because anything
      enforces it.
      **"Every packet" is wrong, measured 2026-09-02.** A harness-dependence audit is present in
      **12 of the 35 phase folders** — `000`-`006`, this one, and `015`-`018`. The other 23 carry
      none under that name or under the *would this still fail on a device* phrasing. The tick is
      left standing because the criterion is about **claims about mobile states**, and most of those
      23 make none — but the sentence above asserted a program-wide artefact that is not there, and
      an unaudited packet that does make a mobile claim would be invisible to it. What is actually
      true is the narrower thing: where a packet reasons about a phone, it carries the audit.
- [ ] `000` receives both cross-check artefacts. **Nothing to receive** until the probe exists.
      **The probe exists and now produces one, so what is missing is a run rather than a mechanism.**
      `--check navbar` writes `tools/live/probe-navbar.json` carrying the live reading beside the
      values this repository models, the fields they disagree on, and whether the sheet's layer
      cleared the navbar's. A run that could not reach the app writes **nothing** — verified here,
      exit 2 with no file — because a stamp recording "could not ask" is the blindness this packet
      exists to remove, and a later reader would take it for a reading.

      **The comparison is tested even though the reading cannot be.** `compareNavbar` is pure and
      exported for the same reason `transportVerdict` is: 6 tests hold it, including that a 72px
      reading disagrees with the 80px model, that an invented `z-index: 100` is reported, and that a
      field the app did not report counts as a disagreement rather than a match — treating absent as
      equal is how a cross-check certifies a harness against nothing. Control: disabling the height
      comparison fails 3 of them.

      **Still open, and the reason is now specific.** One artefact of the two, and no run has
      produced it. Ticking this would claim `000` had received something nobody has generated.
- [ ] Any phase can ask the real app a question and get a number back — and `000` can no longer
      certify its own instrument. **Only the operator's device closes this**, and until it does,
      every other packet's audit is the honest substitute rather than the answer.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

**DESKTOP: THE GAP IS CLOSEABLE, AND CHEAPLY.** Obsidian ships an **undocumented CLI with a renderer `eval`**. `/usr/local/bin/obsidian` symlinks into the app bundle, `"cli": true` is already set in the operator's config, and the bundle registers **73 handlers** — including `eval`, `dev:dom`, `dev:css`, `dev:cdp`, `dev:screenshot`, `dev:mobile` and `command`. `eval` runs `await window.eval(code)` in the renderer and returns the JSON-stringified result.

That is `getComputedStyle`, `getBoundingClientRect` and `document.elementFromPoint`, in the real app, from a shell, with an exit code — at the real mount point, with the real theme and the real `.mobile-navbar`. It closes the exact hole that let every fixture lie.

**IT NEEDS THE APP RUNNING.** Verified: with Obsidian closed the CLI exits with "unable to find Obsidian". So this is a **developer-loop and review accelerator, not an unattended CI gate**. Do not design it as one.

**MOBILE: NOT ACHIEVABLE — AND NOW EACH BLOCK CARRIES ITS OWN STATUS.** The previous brief said "four blocks, each verified". Two were.

- **VERIFIED** — `obsidian-local-rest-api` declares `isDesktopOnly: true` and is absent from the 22-entry `community-plugins.json`: installed, not enabled.
- **VERIFIED BY HAND** — the CLI's dev handlers and `eval` sit behind an `isDesktopApp && window.electron` guard. Brace-matched in `obsidian.asar`: **exactly ten handlers inside** — `devtools`, `dev:mobile`, `dev:debug`, `dev:errors`, `dev:screenshot`, `dev:cdp`, `dev:css`, `dev:dom`, `dev:console`, `eval` — with `eval` last and the block closing immediately before `registerHandler("commands"`. This was previously "read by the investigating agent, not by me"; the reproduction is in `spec.md` §3A. Note that `command` is *outside* the guard.
- **PARTLY VERIFIED** — `obsidian://` exposes no eval or command action. The absence of `obsidian-advanced-uri` is confirmed; the built-in protocol-action registry was never enumerated. T2a enumerates it.
- **UNVERIFIED, AND UNVERIFIABLE FROM THIS MACHINE** — no mobile debug port. Only the desktop bundle is here; `grep -c remote-debugging` over it returns 0, which says nothing about the iOS binary. T2b records it as unverified rather than letting it borrow the other blocks' confidence.

Blocks 1 and 2 are each independently sufficient, so the conclusion holds. But a reader deciding whether to revisit mobile automation weighs four verified blocks differently from two.

**AND THE QUALIFIER MUST SURVIVE THE NEXT HOP.** `008` already cites this conclusion as settled, with no qualifier. T2d audits every downstream citation and **raises a finding against the citing document** — `008` owns its own text, and a silent cross-packet edit is how a qualifier goes missing in the first place.

**THE TWO LEAST-BAD APPROXIMATIONS, WITH LIMITS STATED.**
- `dev:mobile on` emulation — keeps `eval` attached, but it is **Chromium at phone metrics, not iOS's WebView**. Whether it inserts a real `.mobile-navbar` is an **open measurement**, and it decides whether `003`'s navbar hit test is emulable at all. Measure that first; it is the highest-value unknown in this phase. The iOS-WebView half of the caveat is itself an assumption — T2c asks the operator for one user-agent string that settles it.
- A deferred js-engine + iCloud mailbox probe: readback is machine-checkable, but the trigger is the operator's hand.

**Neither may be described as device verification.** The operator looking at their phone remains the only proof for anything mobile.

**BUILD.** A scriptable probe: open a database view, drive a surface (open a dropdown, open a sheet, toggle a checkbox), read back computed styles, rectangles and hit tests, exit non-zero on failure. Then **export two artefacts for `000`**: a per-surface record its Stage-1.5 runner can pair against, **and the explicit list of surfaces this phase could not reach, each with a reason.** The second is easy to skip and expensive to omit — without it `000` reads an absent surface as a corroborated one.

**TARGETS.** The probe eventually drives `000`'s registry. But this phase now precedes `000`, so the hand-listed set is the starting condition by design: the seven plugin commands (`src/main.ts:339-385`) and the surfaces reachable from the dashboard view. It must cover every surface `000`'s Stage-1 repairs touch — say so plainly if it does not.

**TRAPS.** A pipe makes `$?` the pipe's status — use `cmd >log 2>&1; echo $?`. `eval` runs arbitrary code in the operator's real vault: the testbed path guard fails closed **before** connecting, not after.
<!-- /ANCHOR:log -->
