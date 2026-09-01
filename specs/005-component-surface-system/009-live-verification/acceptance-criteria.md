---
title: "Acceptance Criteria: Live Verification in the Running Obsidian"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the value read from the current machine, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "009 live verification criteria"
  - "transport proof"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/009-live-verification"
    last_updated_at: "2026-08-29T18:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Harness audit: AC-006 green is subject-absent, not product-correct"
    next_safe_action: "Run the transport proof; AC-006 needs a grep whose exit 1 is not read as pass"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-009"
      parent_session_id: null
    completion_pct: 17
    open_questions:
      - "Does Obsidian's own mobile emulation insert a real .mobile-navbar, or only resize"
      - "Does Obsidian on iOS expose any remote debugging port — unverifiable from a Mac"
      - "Does Obsidian on iOS run a system WebView rather than Chromium"
    answered_questions:
      - "Are the CLI dev handlers and eval behind an isDesktopApp && window.electron guard — yes, brace-matched by hand in obsidian.asar; eval is the last of ten handlers inside the block"
---
# Acceptance Criteria: Live Verification in the Running Obsidian

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> **AC-001 is a stop condition.** If the transport cannot return a real computed value from the
> running app, nothing below it is worth building and the packet closes with that finding recorded.
> **AC-011 is the second stop condition:** a probe that cannot reproduce a defect we already know
> exists is not an instrument, and `000` is about to depend on this one as the witness it cannot
> influence. Values marked *machine-verified* were read on the operator's machine during this
> packet's authoring and are stated with the command that produced them.
>
> **This packet now runs first in the program.** It was originally parallel and gated nothing. An
> independent review found that `000` repairs the harness and then measures its own work through it,
> so the running app — the one surface `000` cannot edit — becomes the second instrument, and `000`'s
> harness-truth claims are gated on agreeing with it.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 009-live-verification
**Level:** 3
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

This packet is where the proof tuple's **environment** coordinate stops being a fixture parameter and
becomes real: the operator's theme, their 22 enabled plugins, their leaf and split geometry, their
host chrome. Every other phase approximates that coordinate; this one reads it.

It also introduces the tuple's sharpest honesty problem. An emulated phone is a *substituted*
environment coordinate wearing the real one's clothes — the same failure shape as a fixture wrapper
standing in for a production mount. So every emulated result here is labelled, and AC-008 exists to
name which criteria emulation is **not** allowed to satisfy.

The proof tuple is `producer x runtime branch x mount/host x environment x transition x semantic
outcome x negative control`.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Threshold | Measured today | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (L1) | REQ-001 | With Obsidian running, `obsidian eval` reads `getComputedStyle` on a body-mounted `.db-owned-menu` created by `createOwnedMenu`; the same class is measured in the browser harness | both values returned; they **differ** — the live value is the app's answer, not the harness's | *trace* — no live transport exists on this tree. The divergence it must expose is the recorded **29/29 probed overlay classes compute differently between the two mount points, and 25/29 carry no tokens at all on body** | N1 | Unmet | - |
| AC-002 (L2) | REQ-002 | For every probe, assert the measured node was created by a production producer in the running app and not constructed by the probe | 0 probe-constructed nodes; every measured node traceable to a production call path | *trace* — every current measurement in the repository is of a harness-constructed node inside a hand-built workspace (`tools/storybook/verify-placement.mjs:79-99`) | N4 | Unmet | - |
| AC-003 (L3) | REQ-003 | In the real app: read a computed style at the real mount with the operator's theme; read `getBoundingClientRect` in the real leaf and split geometry; call `document.elementFromPoint` with the real host chrome present | all three return values from the real renderer, recorded | *trace* — no harness in `tools/` or `.storybook/` contains a `.mobile-navbar`, and `document.elementFromPoint` has never been called in the real app | N1 | Unmet | - |
| AC-004 (L4) | REQ-004 | Run `npm run live:probe` against a good tree, against a seeded defect, and with Obsidian stopped | exit 0, exit 1, exit 2 respectively — each read without a pipe | **1 of 3 legs observed.** `npm run live:probe` still does not exist — there is no `live:*` script in `package.json`; the driver is `node tools/live/probe.mjs`. Run 2026-08-30 with Obsidian closed it exits **2** (`probe: cannot ask — Obsidian is not running`), which also satisfies N3. The exit 0 and exit 1 legs need the app open and have never been run | N3 | Unmet | - |
| AC-005 (L5) | REQ-005 | Point the driver at a path outside the testbed; then run a full pass and diff the vault | the out-of-testbed target is refused **before** connecting; 0 files changed outside the testbed across a full pass | no probe exists; the risk is created by this packet, which is why the guard is P0 and precedes every writing probe | N2 | Unmet | - |
| AC-006 (L6) | REQ-006 | After `npm run build`, search the built bundle for the probe API | `grep -c __ndProbe main.js` returns 0 | **0**, read 2026-08-30: `grep -c __ndProbe main.js` against the committed bundle (2,075,587 bytes, clean at `HEAD` = `32255b9`); `npm run build` was not re-run. **Met vacuously, and the caveat travels with the row:** T6's `src/dev/surface-probe.ts` was never built — no `src/dev/` exists and neither `surface-probe` nor `__ndProbe` appears under `src/` — so the symbol was never created rather than kept out. N5 has never been run, no gate lane greps the bundle, and `grep -c` exits 1 at a count of 0, so `$?` reads failure at the passing value | N5 | Met | - |
| AC-007 (L7) | REQ-007 | Under `obsidian dev:mobile on`, read four facts: does `.mobile-navbar` exist; is `body.is-phone` set; what does `--safe-area-inset-bottom` resolve to; what does `visualViewport` report | four recorded values, each a measurement rather than an assumption | **unknown — this is the packet's headline open question.** It decides how much of `003`'s criteria the emulated profile can carry at all | N6 | Unmet | - |
| AC-008 | REQ-007 | **Emulation is not device.** List the criteria across the program that the emulated profile may satisfy and those that stay device-only; assert no device-only criterion was closed by an emulated result | 0 device-only criteria satisfied by emulation | *trace* — the desktop app is Electron with Chromium (Obsidian **1.13.4**, *machine-verified*), and the assumption in `spec.md` §3B is that iOS runs a system WebView instead. **That is an assumption, not a measurement**; one user-agent string from the device confirms or refutes it | N6 | Unmet | - |
| AC-009 (L8) | REQ-008 | Push the js-engine startup script through the iCloud-synced vault, have the operator open the app once, then parse the result note on the Mac | the note is parsed and asserted; the wall-clock latency is recorded | *trace* — `js-engine` is enabled and declares `isDesktopOnly: false` (*machine-verified*), but its `data.json` does not exist, so `startupScripts` is empty and adding one is a deliberate change to the operator's vault configuration | N7 | Unmet | - |
| AC-010 | REQ-009 | For every surface both the live probe and the browser harness measure, compare the two values | every pair recorded; a disagreement on a `000` surface **blocks `000`**; a disagreement on any later phase's surface is raised as a finding in `008`. Neither instrument wins by preference | *census* — no pair exists yet. The expected first disagreement is AC-001's, and it is the packet's justification rather than a problem. **Produced by:** the cross-check export at Phase 3, consumed by `000`'s Stage 1.5 | N1 | Unmet | - |
| AC-011 | REQ-010 | **The probe reproduces a defect that is present.** In the running app, read the same menu class's computed style twice — mounted on `document.body`, and inside `.note-database-container` — and compare | the two values **differ**. Agreement fails this criterion: it means the probe measured one node twice, read a stale frame, or resolved against the wrong document | *trace* — no live transport exists. The divergence it must reproduce is the recorded **29 of 29 probed overlay classes differ between the two mount points, and 25 of 29 carry no tokens at all on body**. A round trip proves the channel; this proves the instrument. **Produced by:** Phase 1b, the second stop condition | N8 | Unmet | - |
| AC-012 | REQ-011 | **Every mobile claim carries its own verification status, and so does every citation of it.** Label each §3B block VERIFIED / PARTLY VERIFIED / UNVERIFIED with what was read or what would settle it; then audit every citation of the conclusion outside this packet | 4 of 4 blocks individually labelled; 0 downstream citations presenting an assumption as settled without the qualifier — one that does is raised as a finding against the citing document, never edited from here | **2 of 4 verified.** Block 1 VERIFIED (`obsidian-local-rest-api` manifest `"isDesktopOnly": true`, id absent from the 22-entry `community-plugins.json`). Block 2 VERIFIED **by hand** (brace-matched in `obsidian.asar`: ten handlers inside the `isDesktopApp && window.electron` block — `devtools`, `dev:mobile`, `dev:debug`, `dev:errors`, `dev:screenshot`, `dev:cdp`, `dev:css`, `dev:dom`, `dev:console`, `eval` — with `eval` last and the block closing immediately before `registerHandler("commands"`; previously recorded as read by an agent, not by the author). Block 3 **PARTLY VERIFIED** — the absence of `obsidian-advanced-uri` is confirmed, the built-in protocol-action registry was never enumerated. Block 4 **UNVERIFIED and unverifiable from this machine** — only the desktop bundle is present, `grep -c remote-debugging` over it returns 0, and that says nothing about the iOS binary. Downstream, the citation audit is **UNKNOWN**: `008/spec.md` contains no occurrence of `iOS`, `WebView` or `remote debugging`, so the claim as worded is not there. The nearest candidate is `008/spec.md:573`, "manual review is the documented fallback on phone", which states the *consequence* of block 4 rather than block 4. Whether that is an unqualified citation is a judgment about T2d's intent, not a measurement. **What would settle it:** T2d's matching rule written down before the audit is run. **Produced by:** T2a, T2b, T2c and the T2d citation audit | N9 | Unmet | - |
| AC-013 | REQ-012 | **`000` can consume this packet's output, holes included.** Produce a per-surface probe record in a shape `000`'s Stage-1.5 runner can pair against, **and** an explicit list of every surface this packet could not reach, each with its reason | both artefacts exist; the union of the two covers every surface `000`'s Stage-1 harness repairs touch, or the shortfall is stated plainly | no probe exists, so `000` currently has no cross-check and would measure its own repair through the harness it repaired. **Produced by:** the cross-check export at Phase 3. The unreachable list is the load-bearing half — without it `000` reads an absent surface as a corroborated one | N10 | Unmet | - |

### Harness-dependency audit of the one `Met` row, 2026-08-31

Every criterion re-asked as: *if this value came from the device instead of the harness, would the
check still pass — and could it still fail?* Twelve of thirteen rows are `Unmet`, so only AC-006 has
a green to examine.

**AC-006 is not harness-dependent — it is subject-absent, which is a third species and is worth
naming separately.** `grep -c __ndProbe main.js` returns 0 because the symbol was never created:
`src/dev/surface-probe.ts` was never built, no `src/dev/` exists, and neither `surface-probe` nor
`__ndProbe` appears under `src/` at all. No harness supplies this green. Nothing supplies it. The row
already records this as "Met vacuously, and the caveat travels with the row", which is the honest
form, and the tick is **not withdrawn**: the assertion can still go red for the right reason the day
a probe API is built and leaks into the bundle, so it is vacuous rather than tautological.

**The reversed exit status is the part that will bite.** The row records that `grep -c` exits 1 at a
count of 0 — so a gate lane reading `$?` reads *failure* at the passing value and *success* at the
failing one. AC-004's threshold elsewhere in this table insists exit codes be "read without a pipe"
for exactly this reason. Whoever wires N5 must invert deliberately (`! grep -q __ndProbe main.js`)
rather than let `grep -c` stand in for a predicate.

**The finding that matters most for this phase is structural, not per-row.** This packet exists
because "`000` can no longer certify its own instrument" — AC-002 states that every current
measurement in the repository is of a harness-constructed node inside a hand-built workspace, and
AC-010 exists to pair each harness reading against a live one. **That is the only defence the program
has against a green resting on a harness supply, and it is 12/13 unmet.** The two operator-reported
regressions both landed in that gap: the checks were green, the values were the harness's, and no
instrument existed to disagree with them. Nothing in the child phases can close it, because the
disagreement AC-010 looks for cannot be observed from inside the instrument under suspicion.

**Two supplies to add to `000`'s inventory**, surfaced by auditing `010`–`013` and recorded here
because AC-002 is the criterion that would catch both:
1. **Surfaces built by the check rather than by their production opener.** `verify-placement.mjs:575`
   hand-mounts a `div.db-record-detail-panel`, drives it through the production placement path, and
   inherits none of `openRecordDetailPanel`'s lifecycle — notably not `onResize = () => close()`. It
   is precisely the "probe-constructed node" AC-002 forbids, in a check that otherwise reads as
   production because its *placement* genuinely is.
2. **`var(host-token, fallback)` readings.** Any computed pixel resolving through an Obsidian token
   takes the fallback whenever `app.css` is absent, which is every harness run. AC-001's expected
   divergence is the same effect at the level of a whole class.

---

### The transport, as measured

These were read on the operator's machine while this packet was authored. They are the ground the
criteria above stand on, and they are stated so that a later reader can re-check them rather than
trust them.

| Fact | Value | How it was read |
|---|---|---|
| CLI present | `/usr/local/bin/obsidian` → `/Applications/Obsidian.app/Contents/MacOS/obsidian-cli`, universal Mach-O | `ls -la`, `file` |
| CLI enabled | `"cli":true` | `obsidian.json` |
| Obsidian version | **1.13.4** | `Info.plist` |
| CLI handlers | **73** registered | `registerHandler("` count in the app bundle |
| Handlers this packet needs | `eval`, `dev:dom`, `dev:css`, `dev:cdp`, `dev:screenshot`, `dev:mobile`, `dev:debug`, `commands` — one each | per-name count in the app bundle |
| Handlers behind the `isDesktopApp && window.electron` guard | **10**, in order: `devtools`, `dev:mobile`, `dev:debug`, `dev:errors`, `dev:screenshot`, `dev:cdp`, `dev:css`, `dev:dom`, `dev:console`, `eval` | brace-matched from the `{` after the guard literal to its balanced close in `obsidian.asar`; reproduction in `spec.md` §3A |
| The guard block's boundary | closes at the `}` immediately preceding `this.registerHandler("commands"` — so `eval` is the last handler inside, and `commands`, `command`, `vault`, `files` and the rest are outside | same brace match |
| `remote-debugging` in the **desktop** bundle | **0 occurrences** — says nothing about the iOS binary, which is not on this machine | byte count over `obsidian.asar` |
| CLI without a running app | exit **1**, `The CLI is unable to find Obsidian. Please make sure Obsidian is running and try again.` | `obsidian --help` |
| `obsidian-local-rest-api` | on disk, **absent from `community-plugins.json`** (22 entries) → **not enabled**; `isDesktopOnly: true` | plugin folder, `community-plugins.json`, its `manifest.json` |
| `js-engine` | enabled; `isDesktopOnly: false` | `community-plugins.json`, its `manifest.json` |
| Plugin commands | 7, ids `note-database:<id>`, all plain callbacks | `src/main.ts:339-385` |
| Plugin mobile support | `isDesktopOnly: false`, version 1.3.1 | `manifest.json` |
| Browser automation already present | `playwright-core@1.62.1`, `ws@8.21.3`; no `puppeteer`, `electron` or `chrome-remote-interface` | `node_modules`, `package.json` |

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | `createOwnedMenu` | body portal | `document.body`, real app | operator's real theme | open | computed value returns | N1 |
| AC-002 | every probed producer | every branch driven | real mount | real app | open | node is production-made | N4 |
| AC-003 | production | all | real leaf and split | real theme, real chrome | open | style, rect, hit test | N1 |
| AC-004 | driver | good tree, seeded defect, app down | n/a | n/a | n/a | 0 / 1 / 2 | N3 |
| AC-005 | driver | out-of-testbed target | n/a | real vault present | pre-connect guard | refusal | N2 |
| AC-006 | build | production | n/a | n/a | build | bundle clean | N5 |
| AC-007 | production | emulated phone | real app, emulated metrics | `dev:mobile on` | emulate → open | four facts recorded | N6 |
| AC-008 | n/a | n/a | n/a | emulated vs device | n/a | routing list written | N6 |
| AC-009 | js-engine startup | mobile | real device | real phone | boot → write → sync | note parsed | N7 |
| AC-010 | production | all | real app vs harness | real vs fixture | open | pairs compared | N1 |
| AC-011 | `createOwnedMenu` | body portal vs local | `document.body` vs `.note-database-container`, both in the real app | operator's real theme | open both, read both | the two values differ | N8 |
| AC-012 | n/a (claims) | n/a | n/a | this packet and every citing document | authoring → citation | status labels survive the hop | N9 |
| AC-013 | every probed producer | all reachable | real app | real theme, real plugin set | open → record | `000` receives pairs **and** holes | N10 |

### Negative controls

All ten are new; this packet has no prior register.

| # | Control | What it proves |
|---|---|---|
| N1 | Reverting `000`'s token-root line reddens the token probes and nothing else | The probe measures the token root, not something adjacent |
| N2 | Pointing the driver outside the testbed refuses and exits 2 **before** connecting | The guard fails closed |
| N3 | Stopping Obsidian produces exit 2, never exit 1 | Infrastructure is never reported as a defect |
| N4 | A probe that constructs its own node instead of driving a producer fails review | AC-002 is about production producers |
| N5 | A production build containing `__ndProbe` fails the bundle check | The evaluation hook cannot ship |
| N6 | An emulated result presented without its caveat, or closing a device-only criterion, fails the run record | Emulation is labelled and bounded |
| N7 | A missing phone result note is reported as "not run", never as a pass | Absence is not evidence |
| N8 | Pointing both reads of AC-011 at the same mount makes the divergence assertion fail | AC-011 compares two mount points, not one node twice |
| N9 | Relabelling a VERIFIED block as UNVERIFIED without changing the evidence fails the status audit | AC-012 checks the label against what was read, not against the author's confidence |
| N10 | Removing one surface from the unreachable list without measuring it makes `000`'s cross-check report an unaccounted surface | AC-013's two lists are exhaustive together, or the gap is visible |

### Status values

| Value | Meaning |
|---|---|
| `Met` | Verified. The evidence named was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. A waiver naming an ADR
that is not there fails validation.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

**Work has started; the app has never been driven.** `tools/live/probe.mjs` is built at the path T5
named, with the three exit codes it named, and one of them is observed — exit **2**, app closed, on
2026-08-30. Twelve of thirteen rows are `Unmet`; AC-006 is `Met` and vacuously so, its caveat carried
in the row. AC-001 to AC-003, AC-008, AC-009 and AC-011 remain
marked *trace* because no live transport has been **run** yet — built is not run; AC-010 is marked *census* because no
live-versus-harness pair exists. AC-004 to AC-007 carry values read from the operator's machine,
recorded in the transport table above with the command that produced each. AC-012 carries the
per-block verification state as it actually stands today. No number is invented for any of them.

**AC-001 is a stop condition.** If the transport cannot return a real computed value from the running
app, this packet closes with that finding recorded and the operator's manual review stays as it is —
which is a legitimate outcome, not a failure to deliver.

**AC-011 is the second stop condition, and it is why this packet's role changed.** An independent
review found that `000` repairs the harness and then measures its own work through it, so this packet
moved to the front of the program to be the instrument `000` cannot influence. That role is only
worth having if the instrument works: a probe must be shown reproducing the known 29/29 body-mount
divergence before `000` may rely on it. Otherwise the program has swapped one unverifiable instrument
for another and added a stage.

AC-012 records something the earlier revision got wrong about itself. §3B claimed four mobile blocks
"each verified"; two were. The `isDesktopApp && window.electron` guard has now been traced by hand
and is genuinely verified — ten handlers, `eval` last — but the `obsidian://` action registry was
never enumerated and the mobile debug-port claim is about a binary this machine cannot read. Both are
labelled honestly, and AC-012 also checks that the honesty survives being cited in `008`.

The packet closes when the transport proof has produced two disagreeing numbers, **the probe has
reproduced the known defect live**, the guard has been demonstrated failing closed, all three exit
codes have been demonstrated, every probe has been shown reddening on a seeded defect, the production
bundle is clean, the four emulation facts are recorded as measurements, the device-only criteria are
named and none was satisfied by emulation, **`000` has received both the per-surface probe record and
the unreachable list**, **every §3B block carries its own verification status and the downstream
citations have been audited**, and the phone channel either round-trips or carries an ADR explaining
why it was not built.
<!-- /ANCHOR:closure -->
