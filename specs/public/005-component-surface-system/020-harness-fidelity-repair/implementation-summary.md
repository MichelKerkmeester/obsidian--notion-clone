---
title: "Implementation Summary: Harness Fidelity Repair"
description: "Six instruments repaired, one stylesheet rule changed, two defects measured and handed on. Harness-verified across a 14-lane gate; the two new modal fixtures are not yet operator-signed."
trigger_phrases:
  - "020 harness fidelity summary"
  - "grab band shipped"
  - "evidence lane shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/020-harness-fidelity-repair"
    last_updated_at: "2026-08-31T06:00:00Z"
    last_updated_by: "harness-supply-audit"
    recent_action: "Supply audit: 2 of the 63 lifted checks set --keyboard-height themselves"
    next_safe_action: "Add a placement check that never sets --keyboard-height, so the fallback can fail"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-020"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "Which of the 63 lifted checks still measure a value the harness supplies"
    answered_questions:
      - "No acceptance row is false as worded; the overclaim was closure at 100"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 020-harness-fidelity-repair |
| **Shipped** | 2026-08-30 |
| **Level** | 3 |
| **Status** | Complete |
| **State** | Shipped and harness-verified. The two new modal fixtures have not had per-image operator sign-off |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

Six repaired instruments, one stylesheet rule, two new fixtures, and two findings handed on.

| # | Repair | Effect |
|---|---|---|
| 1 | Band arithmetic no longer double-counts the bar | add-view read 45px and passed; corrected it read 42px and failed its own 44px floor |
| 2 | `.db-mobile-bottom-sheet-handle::before` anchored to the sheet's top edge | add-view 42 -> **48px**, owned menu 38 -> **44px**, record sheet unchanged at 32px |
| 3 | Evidence freshness discovered by content and run as a gate lane | 1 of 8 artefacts fresh -> **8 of 8**; gate lanes 13 -> **14** |
| 4 | Blank and theme-identical capture rejection | 4 blank images and 2 identical pairs -> **0**, with 0 false positives across 224 |
| 5 | Coverage collector matches two-class values; two new fixtures | families seen **10 of 12 -> 12 of 12** |
| 6 | Role expectation moved to the call site | a swapped-role fixture passed 3/3, now fails naming the source |
| 7 | `setCssProps` matches the shipped runtime | 23 camelCase keys across 6 files hyphenated; one live defect among them |
| 8 | 63 orphaned probe checks lifted into the shared harness | placement **114 -> 177** checks |

The single product change is #2. Everything else is instrumentation.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**Instrument first, product second, and the order is the argument.** The add-view sheet's band
reported 45px against its own 44px floor and passed. Only after the double-count was removed did it
read 42px and go red — *before* any stylesheet edit. Had the ordering been reversed, the stylesheet
change would have rested on a number that was wrong by 3px.

Each repair was demonstrated against a defect that was present rather than observed returning green.
That distinction is the phase's whole content: every one of these instruments was already green, and
green was the symptom.

The band value was measured rather than chosen. The record sheet's operator-accepted 32px does not
transfer, and the reason is a measurement: that sheet has 33px of chrome above its header so its band
has nowhere to go, while the add-view sheet has 44px of continuous inert chrome with zero interactive
descendants. `bottom: -28px` is forced by the two surfaces together — 24px leaves the owned menu under
the floor at 41px, 32px reaches 49px and starts taking its first row.

Delivered across five commits: `9d4f569` (band), `0a38723` (evidence lane and blank-capture
rejection), `780a736` (shim), `1e6397d` (lifted checks, coverage regex, role check), `99214f5`
(recapture).

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Raise the band, do not lower the threshold | 44px is WCAG 2.5.5 and already the stylesheet's own value for phone menu rows. Lowering it would make the number describe the code rather than the requirement |
| The record sheet's accepted 32px does not transfer | Measured: its 33px of chrome leaves the band nowhere to go; the other two sheets do not have that constraint |
| Discover evidence artefacts by content, not by a list | A ninth artefact joins the gate by being written. A registry falls behind the thing it registers |
| Keep the probe files after lifting their checks | They are each other's control. One runs against the repo shim rather than a local override, which is how the shim discrepancy was found |
| Declare three product defects in `KNOWN` rather than fixing them here | The run then reports an **unexpected pass** if any is silently repaired, which an allowlist would swallow |
| Count one live defect among the 23 shim keys, not 23 | 22 were backstopped by declarations that happened to match. Calling them fixes would inflate the phase |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

Read from the final state, exit codes read without a pipe.

| Gate | Result |
|---|---|
| `npm run gate` | **14 green, exit 0** (13 before; `evidence` is this phase's lane) |
| `npx vitest run` | **444 passed** |
| `npm run storybook:placement` | **173/177**, 4 red for a declared reason, exit 0 (114 before; 63 lifted) |
| `npm run screenshots:verify` | **224 entries** current, none blank, none identical across themes |
| `node tools/live/evidence.mjs --check-all` | **8 of 8** artefacts describe this tree |

### The negative controls

- **Band**: corrected, the add-view sheet read 42px and failed its own floor before any edit.
- **Role check**: a modal fixture's role swapped field to row — old suite **3/3 pass**, new suite
  fails and names the source file and role.
- **Blank capture**: the two rules fire on the four known blanks and the two identical pairs, and on
  **nothing else across 224**.
- **Shim**: correcting it turned a silent drop into a visible failure — `popover-position.ts` sets
  `maxHeight` and the inline-cap check began reporting `inline=NaNpx`.

### Capture attribution

224 captures, up from 216 — two new modal fixtures x 2 themes x 2 devices. Attributed against an
**empirically measured** churn floor rather than an assumed one: 12 fixtures differ between identical
runs, all calendar/timeline/board/record-sheet, each candidate re-run three times to confirm.

The band edit paints nothing — the `::before` has no background — so it moved no capture. The four
`chrome-selection-status-bar` images moved because that fixture was fixed, not because of the rule.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

**A correction to this packet's own spec.** `spec.md` §3.3 originally recorded
`checkbox-appearance.json` as holding 171 checkboxes across 51 fixtures against a current 202 across
54. The current figure is **211 across 56**. The artefact's own `totals` block reads
`{"checkboxes": 211, "fixtures": 56}`, the pre-fix commit reads `{"checkboxes": 171, "fixtures": 51}`,
and commit `0a38723`'s message states 211 over 56. The 202/54 figure matches no artefact on any tree
and has been corrected in `spec.md`. It changes nothing about the finding — the artefact was stale
and the roadmap was quoting the stale number — only the size of the gap.

**Measured, not fixed, and handed to `022`.** `.db-selection-status-bar` clips its own content on a
phone: at 402px its content is 36px in a 28px box, so the action labels wrap and are cut. Measured
identically with `position: fixed` and with the fixture's `position: static`, so it is shipped layout
and not the capture override. The blank fixture had been hiding it. Fixing it is a decision between
wrapping, scrolling and shorter labels, and belongs to whoever owns that bar.

**Two accepted shortfalls, both closed decisions rather than open defects.**

- The record sheet's grab band stays at **32px** against the operator's 48px ask. Accepted with the
  constraint stated: 33px of chrome above its header leaves nowhere for a taller band without moving
  content.
- The table's main-item cell stays at **169x34** against WCAG 2.5.5 AAA's 44px (40px at the loosest
  density). **Declined** by the operator on density grounds — raising it would override the reader's
  own density setting. The AA 24px floor is met, and `verify-placement` reports the 33px reach on
  every run so the number stays visible rather than being closed by silence.

**Three product defects declared, not fixed.** The lifted probes measure three genuine defects, held
in `KNOWN` so that a silent repair reports as an unexpected pass.

**An artefact with no `inputs` map is invisible to the freshness lane.** Discovery is by content, so
an artefact that carries no fingerprint is not gated. That is a deliberate trade — it removes the
stale-registry failure mode and accepts an unfingerprinted-artefact one.

**Coverage blindness only partly closed.** §5 fixed the two-class regex. It did not address the
`create|render` name filter that keeps thirteen further modules invisible; that is `025`'s subject,
and `000`'s AC-006 had already flagged the same matcher.

**Not operator-signed.** The two new modal fixtures have not had per-image sign-off.

**The harness's largest remaining supply was never in this phase's scope, and two of the 63 lifted
checks carry it.** `verify-placement.mjs` sets `--keyboard-height` on the document element at three
sites — `:819`, `:4724`, `:4753` — and measures what moved. Nothing in `src/` publishes that
variable: `popover-position.ts:530` documents it as the host's and `:551` only reads it. Two of the
three sites are ASK-4 of the lifted record-sheet audit, so they are inside the 63 this summary counts
as a fidelity gain, and `placement 114 -> 177` reads as 63 units of new truth when two of them repeat
the failure shape this phase existed to remove. `022` withdrew its AC-1 on the same supply. No
acceptance row is false as worded; the phase's own `100` was. It now reads `80`, and
`acceptance-criteria.md` §4 carries the audit.

<!-- /ANCHOR:limitations -->
