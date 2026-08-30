---
title: "Implementation Summary: Live Verification in the Running Obsidian"
description: "The transport is built at the specified path with the specified exit codes, and one of the three is observed. The running Obsidian has never been asked a question — no recorded artefact in this repository holds a value that came from the real app."
trigger_phrases:
  - "009 live verification summary"
  - "live probe status"
  - "obsidian eval transport built"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/009-live-verification"
    last_updated_at: "2026-08-30T18:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Transport built; exit 2 confirmed with app closed, app never driven"
    next_safe_action: "Open Obsidian, run probe.mjs --check transport, and record the exit 0 leg"
    blockers:
      - "Eleven of thirteen criteria need Obsidian running; no recorded run has ever had it open"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-009"
      parent_session_id: null
    completion_pct: 15
    open_questions:
      - "Does the emulated dev:mobile profile insert a real .mobile-navbar or only resize"
    answered_questions:
      - "Is the CLI present on this machine - yes, /usr/local/bin/obsidian symlinks into the bundle"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 009-live-verification |
| **Started** | 2026-08-29 |
| **Level** | 3 |
| **Status** | In Progress |
| **State** | The transport is built and one of its three exit codes is observed. The app has never been driven. 1 of 13 criteria `Met`, and that one is met vacuously |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

**T5, and only T5.** `tools/live/probe.mjs` exists at exactly the path the task named, with exactly
the three exit codes it specified — `EXIT_PASS = 0`, `EXIT_ASSERTION = 1`,
`EXIT_INFRASTRUCTURE = 2` at `tools/live/probe.mjs:49-51`. The distinction those three encode is the
phase's whole reason for existing: *conflating "the product is wrong" with "I could not ask" is how a
harness reports green because it never ran.*

The transport is the Obsidian CLI's renderer `eval`, resolved from `/usr/local/bin/obsidian` or the
app bundle (`probe.mjs:53-57`), with `/unable to find obsidian/i` recognised as an infrastructure
state rather than a failure (`probe.mjs:59`). Two checks are implemented on top of it: `transport`
(`probe.mjs:117`) and `navbar` (`probe.mjs:169`), the latter reading the host navigation bar's
`z-index`, position, height, parent class and `--safe-area-inset-bottom` from the live app.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `tools/live/probe.mjs` | Created (`14fc433`, 180 lines) | T5: the `obsidian eval` transport with three exit codes |
| `tools/live/probe.mjs` | Modified (`f3ffc91`, +62 lines) | `--check navbar`: read the real navbar's stacking order |
| `tools/live/README.md` | Created (`14fc433`, 50 lines) | Documents the live instrument directory |

### This phase's instrument was already consumed by another phase

`f3ffc91` — the phone-sheet portal work — reached the limit of what a fixture can answer and reached
for this transport instead. Its commit message records the position exactly: *"The sheet clears a
navbar at z-index 100 and 1000 and loses at 5000; Obsidian's real value cannot be read from a
fixture. `probe.mjs --check navbar` reads it from the running app and fails with the number that
would need clearing. **It exits 2 today, because Obsidian is closed.**"*

That is this phase working as designed and failing to deliver in the same sentence. The instrument
was there when a sibling phase needed it, and it returned "I could not ask" instead of a number. The
sheet's z-index remains chosen from a fixture-measured range rather than measured against the app.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**The transport shipped inside a commit about something else.** `14fc433`'s subject is
*"fix(harness): stop the checks from certifying the defects they should catch"* — capture-harness
repair, which is `000`'s subject, not this phase's. The probe and its README rode along, 230 lines
of the commit's 351. Nothing in the commit message mentions the live probe at all.

That is worth recording because it is why this phase reads as "not started" everywhere. Its one
delivered task is invisible to any reading of the log, and `roadmap.md` §8 already notes that `009`
"gated no handoff" — the declared execution order put it first and it ran nowhere.

**Nothing else was delivered.** `T6` — `src/dev/surface-probe.ts` behind a build flag, registered
beside the existing commands — was never built: `src/dev/` does not exist, and neither
`surface-probe` nor `__ndProbe` appears anywhere under `src/`.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Three exit codes, with infrastructure separated from assertion | A caller that reads "could not ask" as "nothing wrong" rebuilds the exact blindness this phase exists to remove. This is the one design commitment the built code actually keeps |
| The probe drives the app from outside rather than shipping a hook inside it | The CLI's `eval` reaches the real renderer without adding anything to the bundle. It also means `T6`'s in-app probe was never needed for the transport to work — and never built |
| Not wired into `npm run gate` | Deliberate: the app has to be open, so it is a developer-loop and review instrument, not an unattended gate. Recorded in `probe.mjs:18-19`. The consequence is that nothing reminds anyone it has never returned a value |
| §3B's four mobile blocks each carry their own verification label | `T2b`'s requirement, and it is done. Block 4 is labelled UNVERIFIED with what would settle it, rather than inheriting blocks 1 and 2's confidence |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

Run from the final state on 2026-08-30. Exit statuses read from `$?` immediately after each command,
never through a pipe.

| Command | Output | Exit |
|---|---|---|
| `node tools/live/probe.mjs --check transport` | `probe: cannot ask — Obsidian is not running` · `this is not an assertion failure.` | **2** |
| `ls -la /usr/local/bin/obsidian` | symlink → `/Applications/Obsidian.app/Contents/MacOS/obsidian-cli`, present | **0** |
| `grep -c __ndProbe main.js` | `0` | 1 — see below |
| `npm run gate` | `gate: PASS — 16 green, 0 red for a declared reason` | **0** |

### Criteria status: 1 of 13 `Met`

**AC-006 (L6) → `Met`.** Threshold: *"`grep -c __ndProbe main.js` returns 0."* Observed: **0**, read
against the committed production bundle (`main.js`, 2,075,587 bytes, clean at `HEAD` = `32255b9`).

**And it is met vacuously, which is recorded in the same breath so the row cannot be read without
it.** `T6` was never built, so no code path ever inserted `__ndProbe` into anything. The count is 0
because the symbol was never created, not because a guard kept it out. Its negative control N5 — *"a
production build containing `__ndProbe` fails the bundle check"* — has never been run, and there is
no check to fail: no gate lane greps the bundle. Two further caveats: `npm run build` was not re-run
for this reading, and `grep -c` exits **1** when the count is zero, so a caller reading `$?` would
see failure at the passing value.

**AC-004 (L4) → stays `Unmet`, with one of three legs observed.** The threshold is exit 0 against a
good tree, exit 1 against a seeded defect, exit 2 with Obsidian stopped. The third is observed
above, and it also satisfies N3 (*"stopping Obsidian produces exit 2, never exit 1"*). The other two
need the app open. Note that `npm run live:probe`, the script the row names, does not exist —
`package.json` has no `live:*` script; the driver is invoked as `node tools/live/probe.mjs`.

**AC-012 → stays `Unmet`, first half observed.** All four §3B blocks are individually labelled at
`spec.md:342-345`: VERIFIED, VERIFIED-traced-by-hand, PARTLY VERIFIED, UNVERIFIED-and-unverifiable.
The second half is a citation audit, and its result is **UNKNOWN** — see Limitations.

**The remaining ten rows are `Unmet` and unmovable from this machine.** AC-001, AC-002, AC-003,
AC-005, AC-007, AC-008, AC-009, AC-010, AC-011 and AC-013 each require either the running app, a
testbed vault that does not exist, or the operator's phone.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The running Obsidian has never been asked a question, and this is the phase's whole content.**
   No artefact anywhere in this repository holds a value that came from the real app. A search for
   `probe.mjs`, `live:probe` and `obsidian eval` across the packet and the lane journal returns only
   this phase's own planning documents — `tools/lane/css-lane.json` contains zero probe mentions
   across every recorded lane handoff. The transport has been built, imported by a sibling, and has
   returned exit 2 every time.

2. **AC-012's citation audit is UNKNOWN, and I could not settle it.** The row's "Measured today"
   cell asserts *"Downstream, `008` cites the conclusion as settled with no qualifier."* Grepping
   `008/spec.md` for `iOS`, `WebView` and `remote debugging` returns **nothing** — the claim as
   worded is not there. What is there is `008/spec.md:573`, *"`009` now runs first; manual review is
   the documented fallback on phone"*, which states the *consequence* of the unverified block rather
   than the block itself. Whether that counts as an unqualified citation is a judgment about
   T2d's intent, not a measurement, and I did not make it. **What would settle it:** whoever wrote
   the cell says which sentence they meant, or T2d's audit is run with its matching rule written
   down first.

3. **`T6` was never built, and `T7` is the criterion it would have made meaningful.** There is no
   `src/dev/surface-probe.ts` and no `src/dev/` directory. Every probe capability that requires
   driving a production *producer* rather than reading a computed style — AC-002's "0
   probe-constructed nodes", AC-011's two-mount comparison — depends on either that module or on
   `eval` expressions nobody has written yet.

4. **No testbed vault and no path guard.** `T3` and `T4` are unstarted, and AC-005 calls the guard
   P0 because *"the risk is created by this packet."* This is not currently a live hazard: the
   probe only evaluates expressions and writes nothing. It becomes one the moment the first writing
   probe is added, so the guard must precede it rather than follow it.

5. **The mobile half remains where the spec left it: honestly closed.** Block 4 — no remote
   debugging port on iOS — is UNVERIFIED and unverifiable from this machine, because only the
   desktop bundle is present here. That is not a gap this phase can close by working harder; it
   needs a value from the operator's device.

6. **`completion_pct: 15` is derived, not felt.** 1 of 13 criteria `Met` and that one vacuous; 0 of
   32 tasks checked, against: `T5` delivered at its specified path with its specified exit codes and
   one of three demonstrated, `T2b`'s labelling done, and the transport proven present on this
   machine. Everything that would make the phase *do* its job needs the app open. Per D3 this cannot
   approach 100 — and this phase in particular closes on operator-supplied values it does not have.

<!-- /ANCHOR:limitations -->
