---
title: "Task Breakdown: Harness Fidelity Repair"
description: "Every task closed, each on a number that was read or a command whose exit status was read. The phase has shipped."
trigger_phrases:
  - "020 harness fidelity tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Harness Fidelity Repair

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**This phase has shipped.** Every box below is closed, and each carries the evidence it closed on.

**No task closed on "looks right".** Each names a number that was read or a command whose output and
exit status were read without a pipe.

**A repair closed on its negative control, not on a green result.** Every instrument here was already
green before the phase started; green was the symptom.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

- [x] **T1** Acquire the css lane — `../../tools/lane/css-lane.json`.
      *Closed on:* taken clean at `2026-08-30T12:05:00Z`; `005` released at that hash and the
      stylesheet had not moved since.
- [x] **T2** Re-derive the band arithmetic — REQ-001.
      *Closed on:* the walk from the bar's centre adds the bar's height back, and both arms already
      cross the bar, so 4px are double-counted. The correct form `up + down + 1` is already in the
      same file in `usableHeight` — the file disagreed with itself, which is what makes it a bug
      rather than a convention.
- [x] **T3** Re-read all three sheet surfaces with the corrected form — REQ-001.
      *Closed on:* add-view **45px reported / 42px true**, threshold >= 44, **red before any
      stylesheet edit**. Owned menu **41px in a comment only / 38px true**, and **no check existed at
      all**. Record sheet 35px reported / 32px true, threshold >= 30, passes.
- [x] **T4** Establish whether the record sheet's accepted 32px transfers — REQ-002.
      *Closed on:* it does not, and the measurement is why. The record sheet has 33px of chrome above
      its header. The add-view sheet has 44px of continuous inert chrome — 1px border, 8px padding,
      16px handle margin-box, 19px static heading, zero interactive descendants — with its first
      control at y=101. The owned-menu sheet's first row is at y=47.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### The one stylesheet rule

- [x] **T5** Anchor the band to the sheet's top edge — REQ-002.
      *Closed on:* `.db-mobile-bottom-sheet-handle::before` at `top: -40px`, clipped by the sheet,
      running to 28px below the bar, instead of centring 48px on a bar sitting 19px down and spending
      half the band above an edge the sheet clips. Delivered: add-view **42px -> 48px**, owned menu
      **38px -> 44px**. The record sheet keeps its own override, unchanged at 32px.
- [x] **T6** Justify `-28px` rather than choosing it — REQ-002.
      *Closed on:* 24px leaves the owned menu at 41px, under the floor. 32px reaches 49px and starts
      taking that sheet's first row. The value is forced by the two surfaces together.
- [x] **T7** Assert both ends on both surfaces — REQ-001, C4.
      *Closed on:* a band that clears the floor by eating a row now fails instead of passing. Both
      the height and the stolen-space assertion run on the add-view and owned-menu sheets.

### The instruments

- [x] **T8** Make evidence freshness a gate lane — REQ-003, REQ-004.
      *Closed on:* `--check-all` discovers every artefact carrying an `inputs` map — discovered, not
      listed, so a ninth joins by being written — and `tools/gate.mjs` runs it. Gate lane count
      **13 -> 14**.
- [x] **T9** Regenerate the stale artefacts — REQ-003.
      *Closed on:* **seven of eight** were stale. `cascade-audit.json` had been measured against a
      `styles.css` **351 lines shorter** than HEAD's. `checkbox-appearance.json` held **171 checkboxes
      over 51 fixtures** where the same tool on the same tree produced **211 over 56**, and the
      roadmap was quoting the stale figure as evidence. All eight regenerated; `evidence` reports
      8 of 8.
- [x] **T10** Fix the fixture that photographed nothing — REQ-005.
      *Closed on:* `chrome-selection-status-bar` produced four byte-identical 80x64 fully transparent
      PNGs. The bar is `position: fixed` and contributed no height to the captured element. The
      harness already had the remedy — a `captureCss` block that restores flow without restyling the
      subject — and its own comment describes this exact failure.
- [x] **T11** Reject captures of nothing, durably — REQ-005.
      *Closed on:* `verify.mjs` decodes each PNG, rejects a single-coloured image, and rejects a pair
      byte-identical across light and dark. **Across 224 captures the two rules fire on nothing but
      the defect** — that zero false positives is what made them safe to leave in.
- [x] **T12** Widen the coverage collector — REQ-006.
      *Closed on:* the collector matched `cls:\s*"([a-z0-9-]+)"`, which cannot match a two-class
      value. Four call sites declare two classes, so `db-invalid-event-select` and
      `base-import-include-checkbox` dropped out entirely and **"0 uncovered" was a statement about
      ten families rather than twelve**.
- [x] **T13** Give both families fixtures — REQ-006.
      *Closed on:* built from the modals' real markup. One carries its own placement rules —
      `justify-self: center` in a 28px grid column, `grid-area: select` in the compact layout — which
      is exactly what this batch was about.
- [x] **T14** Stop the role check confirming itself — REQ-007.
      *Closed on:* it derived a fixture's expected role from that fixture's own class list, then asked
      the factory what that role produces, so a fixture at the wrong role agreed with itself. The two
      roles paint at different sizes, so the mutation was photographing a control the plugin does not
      build. The role now comes from the call site.
- [x] **T15** Match the DOM shim to the device — REQ-008.
      *Closed on:* read out of the shipped runtime, `obsidian.asar` -> `enhance.js`. `setCssStyles`
      assigns `style[name]`; `setCssProps` calls `setProperty(name, value)`, which takes a CSS
      property name and drops a camelCase key in silence. The repo's shim gave `setCssProps` the
      `setCssStyles` body, so every camelCase key worked in the harness and vanished on a phone.
- [x] **T16** Hyphenate the 23 camelCase keys — REQ-008.
      *Closed on:* 23 keys across 6 files. Correcting the shim immediately turned a silent drop into a
      visible failure: `popover-position.ts` sets `maxHeight`, and the check asserting the inline cap
      began reporting `inline=NaNpx`. **One of the 23 was a live defect** — a file thumbnail set
      `object-fit` and a right margin on a class with no stylesheet rule at all, so it rendered
      stretched and flush. The other 22 were backstopped by declarations that happened to match and
      are recorded as latent traps, **not counted as bugs fixed**.
- [x] **T17** Lift the orphaned probe suites — REQ-009.
      *Closed on:* 63 checks from `probe-desktop-placement.mjs`, `probe-inventory.mjs`,
      `drag-probe.mjs`, `sheet-audit.mjs` and `transition-probe.mjs` into `verify-placement.mjs`,
      reusing one browser and one bundle. Placement **114 -> 177**.
- [x] **T18** Repair two harness defects on the way in, without weakening a check — REQ-009.
      *Closed on:* a 2px scan step with a non-inclusive width, reading 384 where the truth is 386; and
      a read taken in the same tick as its dispatch, reporting a sheet lagging its own pointer where
      with two frames between the tracking is exact.
- [x] **T19** Declare the three product defects rather than hiding them — REQ-009, REQ-010.
      *Closed on:* declared in `KNOWN`, so the run reports an **unexpected pass** the moment any is
      repaired. An ordinary allowlist would swallow that case.
- [x] **T20** Keep the probe files — `plan.md` ADR-002.
      *Closed on:* they are each other's control. One runs against the repo shim rather than a local
      override, which is how the T15 discrepancy was found; deleting them removes the only way to
      re-run that comparison in isolation.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T21** Prove the role check with a controlled mutation — C8.
      *Closed on:* with a modal fixture's role swapped from field to row, **the old suite passed 3/3
      and the new one fails**, naming the source file and the role it asks for.
- [x] **T22** Run the whole gate from the final state, exit codes read without a pipe.
      *Closed on:* gate **14 green, exit 0** (13 before). vitest **444 passed**. Placement
      **173/177**, 4 red for a declared reason, exit 0 (114 before). Evidence **8 of 8**.
- [x] **T23** Recapture and attribute the churn.
      *Closed on:* **224 captures**, up from 216 — two new modal fixtures x 2 themes x 2 devices.
      Attributed against an empirically measured churn floor: 12 fixtures differ between identical
      runs, all calendar/timeline/board/record-sheet, confirmed by re-running each candidate three
      times. **The band edit paints nothing** — the `::before` has no background — so it moved no
      capture. The four `chrome-selection-status-bar` images moved because that fixture was fixed.
- [x] **T24** Record what was measured and not fixed — REQ-010.
      *Closed on:* `.db-selection-status-bar` clips its own content on a phone — at 402px its content
      is **36px in a 28px box**, so the action labels wrap and are cut. Measured identically with
      `position: fixed` and with the fixture's `position: static`, so it is shipped layout and not
      the capture override. **The blank fixture had been hiding it.** Handed to `022` with the number.
- [x] **T25** Release the css lane with its note.
      *Closed on:* released at `2026-08-30T12:53:00Z` with the recapture, the churn floor and the
      attribution recorded in `css-lane.json`.
- [x] **T26** Confirm comment hygiene — TASK-HYGIENE.
      *Closed on:* the `comments` gate lane green; no spec paths, phase numbers or task ids in
      `styles.css` or `tools/`.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

All met. Recorded in [`implementation-summary.md`](implementation-summary.md) and traced in
[`acceptance-criteria.md`](acceptance-criteria.md).

- The band arithmetic is correct, and the add-view sheet was **shown red at 42px before any
  stylesheet edit**.
- Both bands clear the 44px floor the stylesheet already used, and both ends are asserted on both
  surfaces.
- Evidence artefacts are discovered by content and dated against their inputs; 8 of 8 fresh; the gate
  runs the lane.
- A blank or theme-identical capture is rejected, with zero false positives across 224.
- The coverage collector sees twelve of twelve families; both new ones have fixtures.
- The role check takes its expectation from the call site and **fails a deliberately swapped
  fixture**, where the old one passed 3/3.
- The shim matches the shipped runtime; 23 keys hyphenated; the one live defect among them named as
  the one.
- 63 orphaned checks run in the shared harness, none weakened, three product defects declared.
- The selection-bar defect is recorded with its number and handed to `022`.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`implementation-summary.md`](implementation-summary.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../022-selection-bar-keyboard-docking/spec.md`](../022-selection-bar-keyboard-docking/spec.md)
- [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md)

<!-- /ANCHOR:cross-refs -->
