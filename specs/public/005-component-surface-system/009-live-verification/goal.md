**Phase 009 — Live verification**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **This phase runs FIRST, before 000.** It used to be parallel and gate nothing. An independent review found the reason that was wrong.

**WHY IT MOVED TO THE FRONT.** `000` repairs the harness — adds a `.mobile-navbar`, loads `styles.css` on the desktop page, unpins four runtime values, inverts a CI assertion — and then measures its own repairs **through that same harness**. Its negative controls run inside the instrument it just rewrote. A repair that is wrong in a way that makes everything pass is indistinguishable from a correct one. **That is 1.3.1's failure mode in a new costume.**

The running app is the one measurement surface `000` cannot edit. **This phase is that instrument, and `000`'s harness-truth claims are gated on agreeing with it.** A harness number and a live number that disagree is a blocking failure for `000` — resolved by finding which instrument is wrong, never by preferring the convenient one.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../adversarial-review.md`, `../architecture-findings.md`, `../roadmap.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**TWO STOP CONDITIONS, IN ORDER.**
1. **The transport round-trips.** `obsidian eval` returns a real computed value, or this phase stops and records why.
2. **The probe reproduces a defect we already know exists.** Read the same menu class twice in the running app — on `document.body`, and inside `.note-database-container` — and require the values to **differ**. The recorded divergence is **29/29 probed overlay classes, 25/29 with no tokens at all on body**. **Agreement is a failure**: it means the probe measured one node twice, read a stale frame, or resolved against the wrong document. A round trip proves the channel; this proves the instrument. `000` is about to trust this probe — it earns that the same way this program makes everything else earn it.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
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
- [ ] The probe exits non-zero when an assertion fails and zero when it passes; infrastructure
      failure is a distinct exit 2. **No probe exists to exit.**
- [x] Every claim about mobile states explicitly whether it is measured, emulated, or
      operator-reported — and every downstream citation carries the same qualifier. **Met in
      practice across the program, 2026-09-01.** Every packet carries a harness-dependence audit
      naming which of its numbers survive the question *would this still fail on a device*, and the
      operator rows are marked as only the operator can close them. It is a discipline rather than
      a check, and it is ticked because the artefacts exist and are cited, not because anything
      enforces it.
- [ ] `000` receives both cross-check artefacts. **Nothing to receive** until the probe exists.
- [ ] Any phase can ask the real app a question and get a number back — and `000` can no longer
      certify its own instrument. **Only the operator's device closes this**, and until it does,
      every other packet's audit is the honest substitute rather than the answer.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
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
