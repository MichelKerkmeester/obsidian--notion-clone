---
title: "Feature Specification: Live Verification in the Running Obsidian"
description: "Drive and measure the plugin's real surfaces inside the running Obsidian app from a terminal, at the real mount point with the real theme and the real host chrome, and say honestly what a phone cannot give us."
trigger_phrases:
  - "live verification"
  - "obsidian cli eval"
  - "device probe"
  - "mobile emulation"
  - "009 live verification"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/009-live-verification"
    last_updated_at: "2026-08-30T18:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Transport built; exit 2 confirmed with app closed, app never driven"
    next_safe_action: "Open Obsidian, run probe.mjs --check transport, record the exit 0 leg"
    blockers:
      - "Eleven of thirteen criteria need Obsidian running; no recorded run has had it open"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
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
      - "Is the CLI present on this machine - yes, /usr/local/bin/obsidian symlinks into the bundle"
---
# Feature Specification: Live Verification in the Running Obsidian

> Phase chain: parent [`../spec.md`](../spec.md). **This phase runs first**, before
> `000-surface-contract-and-truthful-harness`. Consumers: `000`, whose harness-truth claims this
> phase's probe is the cross-check for, and
> [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md)
> for the device half of its release gate, plus every child phase's operator review. Root causes live
> in [`../architecture-findings.md`](../architecture-findings.md).
>
> **This phase used to be parallel and gate nothing.** An independent review found that `000` repairs
> the harness and then measures its own work through it — the circularity that produced 1.3.1. The
> running app is the one instrument `000` cannot edit, so this phase now stands up first and becomes
> that second instrument.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

Every harness in this repository measures a projection of the product: a fixture, a story, a
headless page with a hand-built workspace. The one thing none of them measures is the product, in
the app, on the operator's machine, with the operator's theme and the operator's other plugins
loaded. That gap is why 1.3.1 shipped.

It turns out the gap is closeable on desktop, and cheaply. **Obsidian ships a command-line
interface with a renderer `eval`.** `/usr/local/bin/obsidian` symlinks into the app bundle,
`"cli": true` is already set in the operator's `obsidian.json`, and the bundle registers **73
handlers** — including `eval`, `dev:dom`, `dev:css`, `dev:cdp`, `dev:screenshot`, `dev:mobile` and
`command`. `eval` runs `await window.eval(code)` in the renderer and returns the JSON-stringified
result. That is `getComputedStyle`, `getBoundingClientRect` and `document.elementFromPoint`, in the
real app, from a shell, with an exit code.

**On a phone, it is not closeable, and this spec says so plainly.** The dev handlers sit behind an
`isDesktopApp && window.electron` gate and the transport is a Unix socket into an Electron main
process that iOS does not have. The best available approximation is Obsidian's own `dev:mobile`
emulation inside the desktop renderer — which is a different browser engine from the phone — plus a
deferred, operator-assisted mailbox probe over the iCloud-synced vault. Both are described here with
their limits stated rather than glossed.

**What this phase gates.** It is no longer a parallel convenience. `000` repairs the harness — it
adds a `.mobile-navbar`, loads `styles.css` on the desktop page, unpins four runtime values, inverts
an assertion — and then measures its own repairs through that same harness. Nothing in `000` can be
checked against `000`. **This phase supplies the instrument `000` cannot influence, and `000`'s
harness-truth claims are gated on agreeing with it.** A harness number and a live number that
disagree is a blocking failure for `000`, resolved by finding which instrument is wrong.

That also raises this phase's own bar. A probe that cannot reproduce a defect we already know exists
is not an instrument, it is a second opinion with no evidence behind it. Before `000` may rely on
it, the probe must show the body-mount divergence live: a menu's computed style read on
`document.body` in the running app must differ from the same read inside `.note-database-container`.
That divergence is measured at **29/29 probed overlay classes**, so a probe that reports agreement is
broken, not reassuring.

**Key Decisions**: the CLI's `eval` is the probe transport; a dev-only plugin command is the driver;
the driver script is a gate with an exit code, not a ritual; the phone answer is honest emulation
plus an operator-assisted deferred probe, never a claim of parity; **every mobile-impossibility claim
carries its verification status on the claim itself**, and any downstream citation of it carries the
same qualifier.

**Critical Dependencies**: a running Obsidian, and a testbed vault the probe may write to. `000`'s
registry, once it exists, makes the probe's targets enumerable rather than hand-listed — but this
phase now precedes `000`, so the hand-listed set is the starting point by design rather than by
accident.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 009-live-verification |
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | **Partial — instrument built, nothing gated.** `tools/live/probe.mjs` exists; no entry in `tools/gate.mjs`'s `CHECKS` list runs it, so the phase declared first has still gated no handoff. `tasks.md` carries 1 of 30 ticked. **Completion figure: UNKNOWN** — this phase has no `goal.md` criteria checklist, so the rule in `../roadmap.md` §3.2 has nothing to count and the `completion_pct` below is an unrevised phase-cut value. Writing that checklist settles it. |
| **Created** | 2026-08-29 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | None — **this phase runs first in the program** |
| **Successor** | `000-surface-contract-and-truthful-harness`; also consumed by `../008-integration-and-release-observability` |
| **Blocks** | **`000`'s harness-truth claims.** `000` may not close a harness-repair criterion without a live pair from this phase, or an entry on its uncorroborated list |
| **CSS lane** | Does not touch `styles.css` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The program's founding fact is that a release passed every gate and changed nothing on device. The
program's answer so far is to measure at the production mount point — but "production mount point"
has meant *the production mount point as reproduced in a harness*. The harnesses build a fake
workspace (`tools/storybook/verify-placement.mjs:79-99`), wrap every story in the one container that
supplies tokens (`.storybook/preview.ts:55`), and contain no `.mobile-navbar` anywhere in `tools/`
or `.storybook/`.

Reproduction is not the same as the thing. The real app brings a real theme, real host CSS, other
enabled plugins — 22 in this vault — real leaf and split geometry, real `visualViewport`, and the
real `.mobile-navbar` when it is on a phone. Every one of those is a coordinate in the proof tuple
that no current gate drives.

The operator's review closes that gap today, and it is entirely manual: install, look, report. It is
the slowest and least repeatable step in the program, and it is the only one that has ever caught
anything.

**And there is a sharper version of the problem, one phase away.** `000` exists to repair those
harnesses — and then asserts its own criteria through the harness it just rewrote. Every negative
control it runs is demonstrated inside that same repaired instrument. If the repair is wrong in a way
that makes all the checks pass, the controls pass too. That is not a hypothetical failure mode: it is
1.3.1's failure mode with a different wrapper supplying the illusion.

An instrument cannot certify itself. The running app is the only measurement surface in this program
that `000` cannot edit.

### Purpose

Make the real app scriptable, **and be the independent instrument `000` is checked against.** Open a
database view in the running Obsidian, drive a dropdown, a sheet and a checkbox, read back computed
styles, rectangles and hit tests from the real renderer, and return an exit code — so `000`'s harness
repairs are confirmed against something outside their own reach, and the operator's review shrinks
from "check everything" to "confirm the handful of things a machine genuinely cannot see."

The probe's own credibility is established the same way it demands of everything else: **by
reproducing a defect we already know is there.** If it cannot show the body-mount divergence live, it
is not trustworthy and `000` is told so rather than handed a green cross-check.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- **The probe transport**: a Node driver that shells out to the Obsidian CLI's `eval`, parses the
  returned JSON, asserts against thresholds, and exits non-zero on failure.
- **The defect-reproduction proof**: the probe reads a body-mounted menu's computed style live and
  shows it differing from the same read inside `.note-database-container`. This is the probe's
  credential, not a nice-to-have — a probe that cannot show a defect we know exists cannot be
  trusted to confirm `000`'s repairs.
- **The cross-check surface `000` consumes**: a recorded probe run per surface, in a form `000`'s
  Stage-1.5 runner can pair against its harness numbers, plus the list of surfaces this phase
  structurally cannot reach so `000` can mark them uncorroborated rather than silently omit them.
- **The driver command**: a development-build-only plugin command that opens a named testbed view and
  installs a small, stable probe API on `window`, so the `eval` payloads stay short and reviewable
  instead of being long anonymous scripts.
- **Surface driving**: open a dropdown, open a sheet, toggle a checkbox, dismiss with Escape and with
  an outside click — through the real producers, by dispatching real events in the real renderer.
- **Readback**: `getComputedStyle`, `getBoundingClientRect`, `document.elementFromPoint`, the host's
  own custom properties and root class lists, and listener and node counts before and after.
- **Captures**: `dev:screenshot` against the real app, recorded beside the numbers.
- **Mobile emulation**: `dev:mobile on` in the desktop renderer, with its limits measured and written
  down rather than assumed.
- **The deferred phone probe**: a js-engine startup script pushed through the iCloud-synced vault that
  writes a machine-readable result note the Mac reads back.
- **A testbed vault or testbed folder** the probe may write to, and the guarantee that it never writes
  outside it.

### Out of Scope

- Replacing the browser harnesses. They are faster, deterministic and CI-native; this phase adds the
  coordinate they structurally cannot reach, and `008` consumes both.
- Automating a real iOS or Android device. Section 4B explains why that is not achievable and what
  replaces it.
- Enabling `obsidian-local-rest-api`. It is installed but disabled, its `isDesktopOnly` is `true`, and
  it has no JS-evaluation endpoint — it would add an HTTP surface without adding a capability.
- Any change to `styles.css` or to product behaviour. This phase is instrumentation only.

### Files to Change

| File Path | Change Type | Description |
|---|---|---|
| `tools/live/probe.mjs` | Create | The driver: shells out to `obsidian eval`, parses `=> <json>`, asserts, exits non-zero on failure |
| `tools/live/probes/` | Create | One probe per surface family, each naming its role, mount, transition and threshold |
| `tools/live/testbed/` | Create | The seed notes and view configurations the probe drives; copied into the testbed vault |
| `src/dev/surface-probe.ts` | Create | Development-build-only: registers `note-database:surface-probe`, opens the testbed view, installs `window.__ndProbe` |
| `src/main.ts` | Modify | Register the dev command behind a build flag, beside the existing seven commands at `src/main.ts:339-385` |
| `esbuild.config.mjs` | Modify | Define the build flag so the probe API is absent from the production bundle |
| `package.json` | Modify | `live:probe`, `live:screenshot`, `live:mobile` scripts |
| `tools/live/deferred-phone/` | Create | The js-engine startup script and the mailbox-note reader for the deferred phone probe |

### Inventory Method

The probe eventually drives what `000`'s registry declares, for the same reason `008`'s runner holds
no list of its own: a hand-maintained target list drifts silently, and silent drift is the failure
this program exists to eliminate.

**But this phase now runs before `000`, so the hand-listed set is the starting condition by design,
not a temporary embarrassment.** Until the registry lands the probe drives the seven existing plugin
commands (`src/main.ts:339-385`) and the surfaces reachable from the dashboard view. That set must
cover, at minimum, every surface `000`'s Stage-1 harness repairs touch — otherwise the cross-check
`000` depends on has holes it does not know about. The set is written down explicitly and the
surfaces it cannot reach are written down beside it, because an incomplete cross-check that presents
as complete is the same class of failure as a harness that cannot fail.

<!-- /ANCHOR:scope -->
---

## 3A. TRANSPORT EVALUATION

Every row was checked against the installed software on this machine. "Verified" means a command was
run or a file was read; "inferred" says so.

| Transport | Executes JS in the renderer | Reads computed style / rect / `elementFromPoint` | Terminal-scriptable | Works on phone |
|---|---|---|---|---|
| **Official `obsidian` CLI** | **Yes** — `eval code=<js>` runs `await window.eval(code)` and returns `=> <JSON.stringify(result)>` | **Yes** — via `eval`, and `dev:cdp method=DOM.getBoxModel` / `DOM.getNodeForLocation` | **Yes** — Unix-socket client with exit codes | **No** |
| `obsidian-local-rest-api` | **No** — no evaluation endpoint anywhere in its bundle | **No** | Yes (HTTPS on 27124, HTTP on 27123, bearer auth) | **No** — `isDesktopOnly: true` |
| `js-engine` | Yes — an `AsyncFunction` with `app`, `container`, `obsidian` in scope | Yes, in principle | **Not on demand** — a code block, an interactive modal, or `startupScripts` at boot; no return channel | **Yes** — `isDesktopOnly: false` |
| `obsidian://` URI | No | No | Partly | Not usefully |
| `--remote-debugging-port` + Playwright CDP | Probably | Yes | Yes | No |
| A plugin-registered dev command | Yes, because we write it | Yes | Yes, via `obsidian command id=…` | Runs, but has no return channel on phone |
| The `mcp-obsidian` skill's transports | No | No | Yes | n/a |

**Verified facts behind the table.**

- The CLI is `/usr/local/bin/obsidian` → `/Applications/Obsidian.app/Contents/MacOS/obsidian-cli`, a
  universal Mach-O binary. `"cli":true` is set in the operator's `obsidian.json`. Obsidian is 1.13.4.
- The app bundle registers **73** CLI handlers. `eval`, `dev:dom`, `dev:css`, `dev:cdp`,
  `dev:screenshot`, `dev:mobile`, `dev:debug` and `commands` each appear exactly once.
- The CLI is a pure socket client with **no local help**: with the app not running,
  `obsidian --help` exits **1** with `The CLI is unable to find Obsidian. Please make sure Obsidian
  is running and try again.` The app must be running first; the CLI will not start it.
- `obsidian-local-rest-api` is on disk at v5.1.0 but **absent from `community-plugins.json`**, whose
  22 entries include `note-database` and `js-engine`. It is installed and **not enabled**. Its
  manifest declares `isDesktopOnly: true`. Its routes are `/active/*`, `/vault/*`, `/tags/`,
  `/commands/`, `/commands/:id/`, `/search/`, `/open/*`, `/mcp` — vault CRUD plus command execution
  by id, which returns 204 and no value. There is no evaluation endpoint.
- `js-engine` is enabled and declares `isDesktopOnly: false`.
- `obsidian-advanced-uri`, `dataview`, `templater-obsidian`, `customjs` and `obsidian-shellcommands`
  are **not installed**, so none of the usual scripting escape hatches exist here.
- `playwright-core@1.62.1` and `ws@8.21.3` are already devDependencies; `puppeteer`, `electron` and
  `chrome-remote-interface` are absent.
- The plugin registers seven commands at `src/main.ts:339-385`, all with plain callbacks, so
  `executeCommandById` fires them unconditionally. Its manifest declares `isDesktopOnly: false`.
- *Inferred, not verified:* the **desktop** app bundle contains no `remote-debugging` string
  (`grep -c remote-debugging` over `obsidian.asar` returns 0), so Chromium's own switch parser would
  likely honour `--remote-debugging-port`. Nothing was launched to confirm it, and
  `requestSingleInstanceLock` means testing it requires quitting the running app.
- **VERIFIED BY HAND — the guard, and its exact boundary.** The earlier revision of this spec recorded
  this as *"read by the investigating agent, not by me"*. It has now been traced directly in
  `/Applications/Obsidian.app/Contents/Resources/obsidian.asar`, by brace-matching from the `{` that
  follows the `isDesktopApp&&window.electron` literal to its balanced close, with string literals and
  escapes skipped. Reproduce with:

  ```
  python3 - <<'EOF'
  import re
  d=open('/Applications/Obsidian.app/Contents/Resources/obsidian.asar','rb').read().decode('utf-8','replace')
  s=d.index('{', d.find('isDesktopApp&&window.electron'))
  i,depth,q,esc=s,0,None,False
  while i<len(d):
      c=d[i]
      if q:
          if esc: esc=False
          elif c=='\\': esc=True
          elif c==q: q=None
      elif c in '"\'`': q=c
      elif c=='{': depth+=1
      elif c=='}':
          depth-=1
          if depth==0: break
      i+=1
  print(re.findall(r'registerHandler\("([^"]+)"', d[s:i]))
  print('closes before:', d[i+1:i+40])
  EOF
  ```

  **Exactly ten handlers sit inside the guard, in this order:** `devtools`, `dev:mobile`, `dev:debug`,
  `dev:errors`, `dev:screenshot`, `dev:cdp`, `dev:css`, `dev:dom`, `dev:console`, **`eval`**. `eval`
  is the last one inside; the block's closing `}` is the character immediately preceding
  `this.registerHandler("commands"`, and `commands`, `command`, `vault`, `files`, `version` and the
  remaining ~60 handlers are **outside** it. The whole registration list is 73 `registerHandler("`
  calls, matching the count recorded in this spec's transport table.

  Two consequences worth carrying forward. First, block 2 of §3B is now measured rather than
  reported. Second, `command` — which fires a plugin command by id — is *not* behind the desktop
  guard, so it is registered on any build; that does not make it reachable on a phone, because the
  transport itself is a Unix socket into an Electron main process, but it means the guard is not the
  only thing standing between this program and mobile automation, and a future change to either one
  would need re-checking independently.

**Two defects in the tooling, worth knowing before relying on it.**

`dev:dom`'s `css=<prop>` argument is broken: an inner guard is always true, so it always returns the
same fixed list of 17 properties rather than the property asked for. Use `eval` with
`getComputedStyle` for anything outside that list. And the `mcp-obsidian` skill in this workspace
does not document the built-in CLI's real surface at all — it describes vault-CRUD transports and
lists command-palette invocation under "cannot". That skill is not wrong about its own transports; it
is simply unaware of this one.

---

## 3B. THE PHONE, HONESTLY

**Automated live verification on a real iOS or Android device is not achievable.** Four independent
blocks — **and the four are not equally well established, so each now carries its own verification
status rather than sheltering under one word.** The earlier revision of this spec said "each
verified"; that was true of two of them.

| # | Block | Status | What was actually read, or what would settle it |
|---|---|---|---|
| 1 | `obsidian-local-rest-api` declares `isDesktopOnly: true`, so Obsidian mobile will not load it and there is no HTTP surface to talk to | **VERIFIED** | Its `manifest.json` in the operator's vault reads `"isDesktopOnly": true` at v5.1.0, and its id is absent from the 22-entry `community-plugins.json`, so it is installed and not enabled |
| 2 | The CLI's `eval` and `dev:*` handlers sit behind an `isDesktopApp && window.electron` guard, over a Unix socket into an Electron main process iOS does not have | **VERIFIED — traced by hand** | Brace-matched in `obsidian.asar`: exactly ten handlers inside the block, `eval` last, the block closing immediately before `registerHandler("commands"`. The reproduction is in §3A. This was previously an inferred claim and is now a measurement |
| 3 | `obsidian://` exposes no action that evaluates code or runs a command; `obsidian-advanced-uri`, which would, is not installed | **PARTLY VERIFIED** | The absence of `obsidian-advanced-uri` is verified against `community-plugins.json`. The claim that none of the built-in protocol actions evaluates code is **not** traced to the bundle's action registry; the app registers protocol handlers via `registerObsidianProtocolHandler` and the built-in action list was not enumerated by hand. **UNVERIFIED sub-claim**, and T2a enumerates it |
| 4 | No remote debugging port is exposed by the mobile app | **UNVERIFIED — and unverifiable from this machine** | Only the *desktop* bundle is present here, and `grep -c remote-debugging` over it returns 0. That says nothing about the iOS build, which is a different binary on a device this Mac cannot read. This remains an assumption. **What would settle it:** an on-device check by the operator, or the iOS app's own behaviour on a known debug port. T2b records it as unverified rather than letting it inherit blocks 1 and 2's confidence |

**Blocks 1 and 2 are each independently sufficient** for the conclusion, and both are verified. The
conclusion therefore stands. But blocks 3 and 4 are stated at a confidence they have not earned, and
the honest form matters because a later reader deciding whether to revisit mobile automation will
weigh four verified blocks differently from two.

**Downstream citations must carry the qualifier.** Honest labelling here does not survive being
quoted elsewhere. `../008-integration-and-release-observability` consumes this conclusion as settled:
both its plan and its spec route the device row through this phase and then fall back to a manual
check where this phase "cannot reach" the phone. Find every such citation with
`rg -n '009-live-verification|cannot reach' ../008-integration-and-release-observability/` — the
wording moves as that packet is edited, so match on the reference rather than on a line number.
Nothing in that phrasing tells a reader that one of the four blocks behind "cannot reach" is an
untested assumption about a binary this machine has never seen.

REQ-011 makes the propagation a criterion of this phase: every downstream citation of a
mobile-impossibility claim is checked to carry the same status label the claim carries here, and one
that does not is **raised as a finding against the citing document** rather than quietly corrected
here — `008` owns its own text, and a silent edit across a packet boundary is how a qualifier gets
lost in the first place.

**What replaces it, in descending order of fidelity.**

*Mobile emulation in the desktop renderer.* `obsidian dev:mobile on` emulates a mobile environment
and reloads, and the full `eval` / `dev:dom` / `dev:cdp` toolkit stays attached. This is the only
option that keeps automated readback. Its limits must be measured and recorded, not assumed: whether
it inserts a real `.mobile-navbar`, whether `body.is-phone` is set, whether safe-area insets are
non-zero, and whether `visualViewport` behaves as it does on a device are each an open question this
phase answers with a measurement.

*The engine caveat, stated because it is the honest limit of emulation.* The desktop app is Electron
with Chromium — verified, Obsidian 1.13.4 from `Info.plist`. Obsidian on iOS is **assumed** to run in
the system WebView. Emulation resizes and re-flags a Chromium renderer; it cannot reproduce an engine
difference. **The iOS half of that is an assumption, not a measurement**: what would confirm it is
reading the mobile app's user-agent string on device, which is one line the operator can paste back,
and T2c asks for it. Until then, every emulated phone result carries the caveat that it proves
Chromium-at-phone-metrics, not the phone.

*The deferred vault-mailbox probe.* `js-engine` runs on mobile and the vault is iCloud-synced. A `.js`
file plus a `startupScripts` entry can be pushed from the Mac and will execute on the phone at next
launch. It has no return channel — but it can **write a note**, and iCloud syncs that note back. So:
push the probe, ask the operator to open the app once, wait for the note, read it on the Mac and
assert against it. Latency is iCloud's, the trigger is a human hand, and a failure mid-script produces
no note at all rather than a diagnostic. It is not a gate. It is an operator-assisted probe whose
**readback is machine-checkable**, which is still a large improvement on "have a look and tell me".

*The operator's eyes.* Unavoidable and, per the parent program's §7, the only evidence that has ever
closed this program. This phase's job is to make that step small and specific, never to claim it away.

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — The probe round-trips a real computed value before anything is built on it.** With
  Obsidian running, the driver reads a computed style from the real renderer, and reading a value the
  harness gets wrong today — a body-mounted `.db-owned-menu`'s `border-radius` — returns the app's
  answer, not the harness's. If the transport cannot demonstrate that, this phase stops.

- **REQ-002 — The probe drives real producers, not fixtures.** The driver opens the view through
  `note-database:open-dashboard` or the dev command, and every surface it measures was created by the
  production code path in the running app. No probe constructs a node itself.

- **REQ-003 — Readback covers the three measurements the harnesses cannot trust.** Computed style at
  the real mount point with the real theme; `getBoundingClientRect` in the real leaf and split
  geometry; `document.elementFromPoint` with the real host chrome present.

- **REQ-004 — The driver is a gate.** It exits 0 on pass and non-zero on failure, prints the measured
  value beside the threshold, and can run unattended once the app is up. Its exit status is read
  without a pipe.

- **REQ-005 — The probe writes nowhere but the testbed.** A dedicated testbed vault, or a dedicated
  folder inside the operator's vault, is the only place the probe may create or modify a note. The
  driver refuses to run if its target path resolves outside the testbed.

- **REQ-006 — No probe code ships.** The dev command and `window.__ndProbe` are behind a build flag
  and are absent from the production bundle. The check is a grep of the built `main.js`, not a
  reading of the source.

- **REQ-007 — The phone limits are measured and written down, not assumed.** Under `dev:mobile on`,
  record whether `.mobile-navbar` exists, whether `body.is-phone` is set, what
  `--safe-area-inset-bottom` resolves to, and what `visualViewport` reports. Each answer is recorded
  as a measured fact, and every emulated result carries the engine caveat from §3B.

- **REQ-010 — The probe reproduces a defect we already know exists, live, before it is trusted.**
  A round trip proves the channel carries bytes. It does not prove the probe is looking at the right
  node, in the right document, at the right moment. **The credential is a reproduction:** read a
  body-mounted menu's computed style in the running app and the same class's computed style inside
  `.note-database-container`, and the two must **differ** — because `../architecture-findings.md`
  records that divergence at **29 of 29 probed overlay classes, with 25 of 29 carrying no tokens at
  all on body**. A probe that reports agreement here has not found good news; it has failed to
  measure, and it is fixed before anything is built on it. This is the same rule this program applies
  to every other instrument: a check that cannot show a defect that is present is theatre.

- **REQ-011 — Every mobile claim carries its verification status, and so does every citation of it.**
  Each of §3B's four blocks is labelled VERIFIED, PARTLY VERIFIED or UNVERIFIED on the claim itself,
  with what was read or what would settle it. Blocks 3 and 4 are not verified and say so. Beyond
  this document, **the propagation is checked**: every downstream citation of a mobile-impossibility
  claim — `008`'s device row is the known consumer — must carry the same qualifier, and one that
  presents an assumption as settled is raised as a finding against the citing document. An honest
  label that is dropped one hop downstream has bought nothing.

- **REQ-012 — This phase serves `000`'s cross-check, in a form `000` can consume.** Each probe run is
  recorded per surface in a shape `000`'s Stage-1.5 runner can pair against its harness numbers, and
  **the set of surfaces this phase cannot reach is written down beside it.** A cross-check with
  undeclared holes is worse than none, because `000` would read silence as agreement. Where the two
  instruments disagree, this phase does not adjudicate: the pair is recorded and the disagreement is
  a finding, because the harness can be blind and the probe can be measuring the wrong node.

### P1 - Required (complete OR user-approved deferral)

- **REQ-008 — The deferred phone probe exists and its result is machine-checkable.** A js-engine
  startup script writes a structured result note; the Mac-side reader parses it and asserts. Two steps
  stay in the operator's hands — launching the app and confirming what they saw — and both are named
  rather than implied. Deferrable with an ADR if `008`'s manual review is judged sufficient.

- **REQ-009 — `008` consumes this phase's output.** The release gate's device row is satisfied by a
  recorded probe run plus the operator's confirmation, rather than by the confirmation alone.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Full thresholds and negative controls are in [`acceptance-criteria.md`](acceptance-criteria.md).

| # | Requirement | Criterion | Measured today |
|---|---|---|---|
| **L1** | REQ-001 | The driver reads a computed value from the real renderer and it differs from the harness's answer for a known-divergent surface | *trace* — no live transport exists; the divergence it must expose is the recorded **29/29** |
| **L2** | REQ-002 | Every measured surface was created by a production producer in the running app | *trace* — every current measurement is of a harness-constructed node |
| **L3** | REQ-003 | Computed style, rect and `elementFromPoint` all return from the real app | *trace* — no harness contains a `.mobile-navbar`; `elementFromPoint` has never been called in the real app |
| **L4** | REQ-004 | `npm run live:probe` exits 0 on a good tree and non-zero on a seeded defect | no such script exists |
| **L5** | REQ-005 | Zero writes outside the testbed across a full run | no probe exists; the risk is new and is why REQ-005 is P0 |
| **L6** | REQ-006 | `grep __ndProbe main.js` finds nothing in a production build | no probe exists |
| **L7** | REQ-007 | The four emulation facts are recorded as measurements | unknown — this is the phase's headline open question |
| **L8** | REQ-008 | A phone-written result note is parsed and asserted on the Mac | *trace* — `js-engine`'s `data.json` does not exist, so `startupScripts` is empty today |
| **L9** | REQ-010 | The live probe **reproduces the known body-mount defect**: a menu's computed style read on `document.body` in the running app differs from the same read inside `.note-database-container` | *trace* — no live transport exists. The defect it must reproduce is the recorded **29/29 probed overlay classes differ; 25/29 carry no tokens at all on body**. A probe reporting agreement has failed to measure |
| **L10** | REQ-011 | Every §3B mobile block carries VERIFIED / PARTLY VERIFIED / UNVERIFIED on the claim, and every downstream citation carries the same qualifier | 2 of 4 blocks verified (rest-api `isDesktopOnly`, and the `isDesktopApp && window.electron` guard traced by hand); block 3 partly verified; block 4 **unverified and unverifiable from this machine**. Downstream, `008` cites the conclusion as settled with no qualifier |
| **L11** | REQ-012 | `000` can consume this phase's output: a per-surface recorded run plus the list of surfaces this phase cannot reach | no probe exists, so `000` has no cross-check and would otherwise measure its own repair through the harness it repaired |

### Acceptance Scenarios

1. **Given** Obsidian is running and the testbed view is open, **when** the driver evaluates
   `getComputedStyle` on a body-mounted `.db-owned-menu`, **then** it returns the app's value and the
   driver records it beside the harness's value for the same class.
1a. **Given** the same menu class rendered both on `document.body` and inside
   `.note-database-container` in the running app, **when** the driver reads both computed styles,
   **then** they **differ** — the known defect, observed live. If they match, the probe is failing to
   measure and is fixed before anything is built on it.
1b. **Given** a probe run and `000`'s harness output for the same surface, **when** `000`'s
   cross-check runs, **then** it finds a recorded live value to pair against, or finds that surface
   named on this phase's unreachable list.
2. **Given** a dropdown opened by the production producer, **when** the driver calls
   `document.elementFromPoint` over it, **then** the returned node is inside the dropdown.
3. **Given** a seeded defect, **when** `npm run live:probe` runs, **then** it exits non-zero and names
   the measured value and the threshold.
4. **Given** the driver is pointed at a path outside the testbed, **when** it starts, **then** it
   refuses and exits non-zero without touching the vault.
5. **Given** a production build, **when** `main.js` is searched for the probe API, **then** nothing is
   found.
6. **Given** `dev:mobile on`, **when** the driver reads the four emulation facts, **then** each is
   recorded as a measured value, and any that differs from a real phone is named as a limit.
7. **Given** the deferred phone probe has been pushed and the operator has opened the app once,
   **when** the Mac-side reader runs, **then** it parses the result note and asserts against it.

### Verification

- **Transport proof** — REQ-001's round trip, run first; nothing else is built until it passes.
- **Defect reproduction** — REQ-010's live divergence, run second. The transport proof shows the
  channel works; this shows the probe is looking at the right thing. Both precede any other probe.
- **Negative controls** — a seeded defect must redden the probe; a testbed-escape attempt must be
  refused; a production build must not contain the probe API.
- **Cross-check** — every value the live probe reads for a surface the browser harness also measures
  is compared. For `000` this is a **gate**: a disagreement blocks that phase. For later phases it is
  a finding recorded in `008`. Neither instrument wins by default in either case.
- **Captures** — `dev:screenshot` beside the numbers, so an unexplained number has a picture.
- **Operator** — the named, shrunken review: the things §3B says a machine cannot see.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Dependency | Obsidian must be running; the CLI will not start it | An unattended run fails at the first command | The driver checks the socket and reports "start Obsidian" as a distinct exit code, never as a test failure |
| Dependency | `000`'s registry, for enumerable targets | This phase now precedes `000`, so the hand-listed set is the starting condition, not a stopgap | §3 Inventory Method names the set explicitly and requires it to cover every surface `000`'s Stage-1 repairs touch |
| Risk | **The probe becomes `000`'s only witness and is itself wrong** | `000` would swap one unverifiable instrument for another | REQ-010: the probe must reproduce the known 29/29 body-mount divergence live before `000` may rely on it. A probe that cannot show a defect that is present is not evidence |
| Risk | The cross-check has undeclared holes | `000` reads silence as agreement and closes a harness claim nothing confirmed | REQ-012: the unreachable set is written down beside the reachable one and handed to `000` as an explicit uncorroborated list |
| Risk | An honest qualifier is dropped one hop downstream | `008` cites "mobile is not achievable" as settled while one of its four blocks is an untested assumption | REQ-011 checks the propagation and raises a finding against the citing document rather than silently editing another packet |
| Risk | **`eval` runs arbitrary code in the operator's real app** | A bad probe can modify or destroy real notes | REQ-005: a dedicated testbed, a path guard that refuses to run outside it, and the plugin's own `note-database:undo-last-database-edit` as a manual backstop |
| Risk | The probe API ships in a release | An evaluation hook in production is a security surface | REQ-006: build flag plus a grep of the built bundle, not a source reading |
| Risk | `dev:cdp` attaches a debugger to the running app | The operator sees a debugger-attached state and may not know why | The driver prints what it attached and detaches on exit; `dev:debug off` is part of teardown |
| Risk | Emulation is mistaken for a phone | The program repeats its founding error in a new costume | REQ-007 records the emulation's limits as measurements, and every emulated result carries the engine caveat |
| Risk | The live probe and the browser harness disagree | Whichever is convenient gets believed | A disagreement is a recorded finding in `008`; neither wins by default |
| Risk | The CLI surface is undocumented and could change between Obsidian versions | A silent break at an app update | Pin the observed Obsidian version (1.13.4) in the run record; the transport proof in REQ-001 runs first every time and fails loudly |

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: A full probe pass completes inside the operator's patience — target under two minutes
  once the app is up — or it becomes another gate nobody runs.
- **NFR-P02**: Each `eval` payload is short and reviewable; long anonymous scripts go into the plugin's
  probe API instead, where they can be read in the diff.

### Security

- **NFR-S01**: No network call. The CLI is a local Unix socket; nothing leaves the machine.
- **NFR-S02**: No secret, API key or absolute personal path in any committed artefact. The vault path
  is read from an environment variable, never hardcoded.
- **NFR-S03**: The probe API is development-only and its absence from the production bundle is
  verified by inspecting the built file.
- **NFR-S04**: `obsidian-local-rest-api` stays disabled. Enabling an authenticated HTTP server on the
  operator's machine to obtain a capability the CLI already provides is a net loss.

### Reliability

- **NFR-R01**: A missing Obsidian, a missing socket and a failed assertion are three distinct exit
  codes, so an infrastructure problem is never reported as a product defect.
- **NFR-R02**: The driver is idempotent: a second run against an unchanged tree produces the same
  numbers, and the testbed is reset between runs.
- **NFR-R03**: The teardown runs even on failure — `dev:debug off`, `dev:mobile off`, testbed reset.

---

## 8. EDGE CASES

### Data Boundaries

- The operator's vault contains 22 enabled plugins; a probe result is only meaningful with that set
  recorded, because a theme or plugin can restyle a native checkbox.
- The testbed must contain a note whose body has a heading and a paragraph, because `006`'s AC-001
  counts body characters and needs a known answer.

### Error Scenarios

- Obsidian not running: exit with the distinct "start Obsidian" code, not a failure.
- The socket exists but the app is mid-reload: retry bounded, then the same distinct code.
- `eval` returns an error string rather than JSON: surface it verbatim; never coerce it to a failure
  of the assertion, because the two mean different things.
- The deferred phone probe produces no note: report "not run", never "passed".

### State Transitions

- `dev:mobile on` reloads the renderer, so any open surface is destroyed. Order matters: emulate
  first, then open the view, then measure.
- Teardown must restore the app to the state the operator left it in, including desktop mode and
  debugger detachment.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 18/25 | One driver, one dev command, a probe set, an emulation profile, a deferred phone path, and the cross-check surface `000` consumes |
| Risk | 21/25 | Arbitrary evaluation in the operator's real app; a probe API that must never ship; and a probe that `000` now depends on for its independent witness |
| Research | 15/20 | The transport was undocumented; the emulation's fidelity is still an open measurement |
| Multi-Agent | 5/15 | Single lane; nothing shared |
| Coordination | 14/15 | Runs first, gates `000`'s harness-truth claims, feeds `008`'s release gate and every phase's operator review |
| **Total** | **73/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | A probe damages real notes | H | L | Testbed-only path guard; refuse-and-exit on escape; undo command as backstop |
| R-002 | The probe API ships in a release build | H | L | Build flag plus a grep of the built bundle in the gate |
| R-003 | Emulation is reported as phone parity | H | M | REQ-007 measurements plus the engine caveat on every emulated result |
| R-004 | The undocumented CLI surface breaks at an app update | M | M | Version pinned in the run record; the transport proof runs first and fails loudly |
| R-005 | Infrastructure failure reported as a product defect | M | H | Three distinct exit codes (NFR-R01) |
| R-006 | The deferred phone probe silently does not run | M | H | Absence of the result note is reported as "not run", never as a pass |
| R-007 | The probe agrees with the harness because it is measuring the wrong node | H | M | REQ-010's defect reproduction: the probe must show the known 29/29 divergence live before `000` may rely on it |
| R-008 | `000` treats an unmeasured surface as corroborated | H | M | REQ-012's explicit unreachable list; a surface absent from both lists means the cross-check was incomplete |
| R-009 | A mobile assumption is cited downstream as a verified fact | M | H | REQ-011's per-block status labels plus the propagation check; blocks 3 and 4 are labelled honestly here and the citation is audited |

---

## 11. USER STORIES

### US-001: Measure the app, not a reproduction of it (Priority: P0)

**As a** maintainer, **I want** to read computed styles and hit tests out of the running Obsidian,
**so that** a green gate describes what the operator will actually see.

**Acceptance Criteria**:
1. Given the app is running, When the driver evaluates a computed style on a body-mounted surface,
   Then it returns the app's value, and it differs from the harness's for a known-divergent class (L1).
2. Given a dropdown opened by the production producer, When `elementFromPoint` is called over it,
   Then the returned node is inside the dropdown (L3).

### US-002: An operator review worth the operator's time (Priority: P1)

**As the** operator, **I want** the machine to check everything it can, **so that** my review is a
short list of things a machine genuinely cannot see rather than a full re-inspection.

**Acceptance Criteria**:
1. Given a probe run has completed, When the review list is produced, Then it names only the checks
   §3B marks as requiring human judgement.
2. Given the phone, When the review list is produced, Then it states plainly which results are
   emulated and which were confirmed on device (REQ-007, REQ-008).

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- Does `dev:mobile on` insert a real `.mobile-navbar` and set `body.is-phone`, or only change
  metrics? This decides whether the emulated profile can carry `003`'s hit test at all, and it is a
  measurement, not a judgement.
- Does Obsidian on iOS run a system WebView rather than Chromium? §3B assumes it does and treats every
  emulated result accordingly; the confirming evidence is one user-agent string from the device.
  **UNVERIFIED**, and T2c asks the operator for it.
- **Does the iOS build expose any remote debugging port?** §3B block 4 assumes not. The *desktop*
  bundle contains no `remote-debugging` string, which says nothing about a different binary on a
  device this machine cannot read. **UNVERIFIED and unverifiable from here**; T2b records it as such
  rather than letting it borrow blocks 1 and 2's confidence.
- Does any built-in `obsidian://` action evaluate code or run a command? §3B block 3 says no; the
  absence of `obsidian-advanced-uri` is verified but the built-in action registry was never
  enumerated. **PARTLY VERIFIED**; T2a enumerates it against the bundle's
  `registerObsidianProtocolHandler` call sites.
- Is `--remote-debugging-port` honoured on desktop? The desktop bundle contains no `remote-debugging`
  string, and `playwright-core` is already installed, so a persistent CDP session is plausible — but
  it needs an app restart to test and the CLI already covers the need.
- Should the deferred phone probe be built at all, or is the operator's manual phone check cheaper
  than maintaining a one-way iCloud channel? REQ-008 is P1 for exactly this reason.
- How many of `000`'s Stage-1 harness surfaces can this probe actually reach? The answer sizes the
  cross-check `000` depends on, and it is not knowable before the first probes exist. A small
  reachable set is a finding worth having before `000` starts, not after it closes.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Root causes and measurements**: [`../architecture-findings.md`](../architecture-findings.md)
- **Review this revision answers**: [`../adversarial-review.md`](../adversarial-review.md)
- **Successor, and the consumer of this phase's cross-check**: [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- **Release gate that consumes this**: [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md)
- **Design system**: [`../design-system.md`](../design-system.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
