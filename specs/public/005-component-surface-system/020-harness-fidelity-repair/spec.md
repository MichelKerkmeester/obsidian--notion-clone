---
title: "Feature Specification: Harness Fidelity Repair"
description: "Seven verifier findings shared one shape: a check reporting a number nobody could have reached by measuring the thing it named. This phase repairs the instruments and changes exactly one stylesheet rule — the one the corrected instrument showed was under its own floor."
trigger_phrases:
  - "harness fidelity repair"
  - "grab band double count"
  - "evidence freshness lane"
  - "blank capture rejection"
  - "dom shim setCssProps"
  - "020 harness fidelity"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/020-harness-fidelity-repair"
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Eight instrument repairs shipped; gate 14 green, placement 173/177"
    next_safe_action: "Operator reviews the two new modal fixtures and signs off the recapture"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-020"
      parent_session_id: null
    completion_pct: 80
    open_questions: []
    answered_questions:
      - "Is the 44px floor this phase's invention — no, it is WCAG 2.5.5 and already in the stylesheet"
      - "Does the record sheet's accepted 32px transfer to the other sheets — no, its constraint is absent there"
---
# Feature Specification: Harness Fidelity Repair

> Phase chain: parent [`../spec.md`](../spec.md). **Shipped.** Its findings feed
> [`../022-selection-bar-keyboard-docking/spec.md`](../022-selection-bar-keyboard-docking/spec.md),
> which owns the layout defect this phase measured and deliberately did not fix, and
> [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md), which is a
> seventh instance of this phase's defect class found after it closed.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

A verifier returned PASS WITH FINDINGS on the previous batch. Seven findings, and six of them share
one shape: **a check that reported a number nobody could have arrived at by measuring the thing it
named.** A gate made of those is worse than no gate, because it spends its authority certifying
whatever it happens to compute.

This phase repairs the measuring instruments, and changes exactly one rule in the stylesheet — the
one the corrected instrument showed was under its own floor.

That ordering is the phase's whole argument. The stylesheet edit is a consequence of a repaired
measurement, not a parallel piece of work: the add-view sheet's grab band read 45px against its own
44px floor and passed, and only went red once the double-count was removed.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 020-harness-fidelity-repair |
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Complete |
| **Created** | 2026-08-30 |
| **Shipped** | 2026-08-30 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | The verifier's PASS WITH FINDINGS on the previous batch |
| **Successor** | `022` inherits the measured selection-bar defect; `025` is a seventh instance of the same class |
| **CSS lane** | **Held and released.** One rule changed: `.db-mobile-bottom-sheet-handle::before` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Six of seven verifier findings were instruments that could not fail for the reason they claimed to
test. A band-height check that double-counted. A freshness checker nothing called. A fixture that
photographed nothing. A coverage regex that silently dropped two families. An agreement check that
derived its expectation from the thing it was checking. A DOM shim more permissive than the device.

Each was green. Each was green for a reason unrelated to the thing it was named for.

### Why It Matters

This program exists because release 1.3.1 passed every gate and changed nothing on device. A check
that computes the wrong number is not a smaller version of that failure — it is the same failure, one
layer down, and every phase downstream inherits its results.

### Goals

- Every repaired check is demonstrated failing on a defect that is present, not merely observed
  passing.
- The one stylesheet rule the corrected measurements condemned is fixed, and only that one.
- Defects the repaired instruments reveal but that belong elsewhere are recorded with their numbers
  rather than absorbed.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `tools/storybook/verify-placement.mjs` — the band arithmetic, and the 63 lifted checks.
- `tools/live/evidence.mjs` and `tools/gate.mjs` — evidence freshness as a gate lane.
- `tools/screenshots/verify.mjs` — blank and theme-identical capture rejection.
- The coverage collector's regex and the self-confirming role check.
- `tools/storybook/obsidian-dom-shim.mjs` — `setCssProps` against the shipped runtime.
- `styles.css` — exactly one rule: `.db-mobile-bottom-sheet-handle::before`.

### Out of Scope

- The selection status bar's layout defect. Measured here, owned by `022`.
- The record sheet's 32px band. The operator accepted it with the shortfall stated, and this phase
  does not reopen an accepted decision.
- The table's 34px main-item cell. Declined by the operator on density grounds.

### What Changed, In Eight Parts

#### 1. The grab-band arithmetic double-counted the bar

`verify-placement.mjs` walked outward from the handle bar's centre and then added the bar's height
back. Both arms already cross the bar, so 4px were counted twice. The same file computes the correct
form — `up + down + 1` — a few hundred lines away in `usableHeight`.

| surface | reported | true | threshold | was | now |
| --- | --- | --- | --- | --- | --- |
| add-view sheet | 45px | 42px | >= 44 | FAILED once corrected | 48px |
| owned-menu sheet | 41px (in a comment only) | 38px | none existed | no check at all | 44px |
| record sheet | 35px | 32px | >= 30 | passes | 32px, unchanged |

The add-view number was the one that mattered: at 42px the surface missed the 44px floor its own
check declares, and the double-count carried it over the line.

#### 2. The band was raised, not the threshold

The 44px floor is not this phase's invention. It is WCAG 2.5.5 target size, and the stylesheet
already uses `min-height: 44px` for phone menu rows — so it is the project's own established value,
adopted rather than argued for.

The operator has already accepted 32px on the record sheet, after being shown that 48px there needs a
taller sheet header. **That precedent does not transfer, and the measurement is why:** the record
sheet has 33px of chrome above its header, so its band has nowhere to go without moving content. The
add-view sheet has 44px of continuous inert chrome from its top edge — 1px border, 8px padding, a
16px handle margin-box, and a 19px static "Add view" heading with zero interactive descendants — and
its first interactive control sits at y=101. The owned-menu sheet, the tighter of the two, has its
first row at y=47.

So the constraint that forced 32px on the record sheet is absent here, and reaching 44px costs no
layout change at all: the band is a pseudo-element that does not participate in layout.

The rule now anchors the band to the sheet's top edge rather than centring it on the bar, which is
where the missing pixels were going — half of a 48px band was overhanging an edge the sheet clips.
`bottom: -28px` is forced, not chosen: 24px leaves the owned menu at 41px, under the floor, and 32px
reaches 49px and starts taking that sheet's first row.

Both ends are now asserted on both surfaces, so a band that clears the floor by eating a row fails
instead of passing.

#### 3. Seven of eight evidence artefacts were stale and nothing checked

`evidence.mjs` could date an artefact against the tree that produced it. Nothing called it. The
committed `cascade-audit.json` had been measured against a `styles.css` 351 lines shorter than
HEAD's; `checkbox-appearance.json` recorded 171 checkboxes across 51 fixtures where the same tool on
the same tree produced **211 across 56**, and the roadmap quoted the stale figure as evidence.

`--check-all` now discovers every artefact carrying an `inputs` map — discovered, not listed, so the
ninth joins the gate by being written — and `tools/gate.mjs` runs it. All eight regenerated.

#### 4. A coverage fixture photographed nothing

`chrome-selection-status-bar` produced four byte-identical 80x64 fully transparent PNGs. The bar is
`position: fixed`, so it contributed no height to the captured element. The harness had the remedy
already — a `captureCss` block that restores flow without restyling the subject — and its own comment
describes this exact failure.

The durable half is the second: nothing could tell a photograph of a component from a photograph of
nothing. `verify.mjs` now decodes each PNG and rejects a single-coloured image, and rejects a pair
that is byte-identical across light and dark. Across 224 captures those two rules fire on nothing but
the defect.

#### 5. Two checkbox families were never asked about

The coverage collector matched `cls:\s*"([a-z0-9-]+)"`, which cannot match a two-class value. Four
call sites declare two classes, so `db-invalid-event-select` and `base-import-include-checkbox`
dropped out entirely and "0 uncovered" was a statement about ten families rather than twelve. Neither
had a fixture. One carries its own placement rules — `justify-self: center` in a 28px grid column,
`grid-area: select` in the compact layout — which is exactly what this batch was about.

Both now have fixtures built from the modals' real markup.

#### 6. The agreement check confirmed itself

The same suite derived a fixture's expected role from that fixture's own class list, then asked the
factory what that role produces. A fixture at the wrong role agreed with itself. The two roles paint
at different sizes, so the mutation photographed a control the plugin does not build.

The role now comes from the call site. Controlled: with a modal fixture's role swapped from field to
row, the old suite passed 3/3 and the new one fails, naming the source file and the role it asks for.

#### 7. The DOM shim was more permissive than the device

Verified against the shipped runtime (`obsidian.asar` -> `enhance.js`): `setCssStyles` assigns
`style[name]`, `setCssProps` calls `setProperty(name, value)`. `setProperty` takes a CSS property
name, so a camelCase key is dropped in silence. The repo's shim implemented `setCssProps` with the
`setCssStyles` body, so every camelCase key worked in the harness and vanished on a phone.

The shim now matches the device, and that immediately turned a silent drop into a visible failure:
`popover-position.ts` sets `maxHeight`, and the check asserting the inline cap began reporting
`inline=NaNpx`. All 23 camelCase keys across 6 files are now hyphenated.

**One of the 23 was a live defect, and the rest were not.** A file thumbnail set `object-fit` and a
right margin on a class with no stylesheet rule at all, so it rendered stretched and flush. The
others were backstopped by declarations that happened to match. They are converted as latent traps,
and that distinction is recorded rather than claimed as six bugs fixed.

#### 8. Three orphaned probe suites now run

63 checks from `probe-desktop-placement.mjs`, `probe-inventory.mjs`, `drag-probe.mjs`,
`sheet-audit.mjs` and `transition-probe.mjs` were lifted into `verify-placement.mjs`. Two harness
defects in the drag probe were repaired on the way in — a 2px scan step with a non-inclusive width,
reading 384 where the truth is 386, and a read taken in the same tick as the dispatch, which reported
a sheet lagging its own pointer where with two frames between the tracking is exact — and neither
check was weakened. Three genuine product defects the probes measure are declared in `KNOWN` rather
than fixed here, so the run reports an unexpected pass the moment any of them is repaired.

The probe files stay. They are each other's control: one runs against the repo shim rather than a
local override, which is how the shim discrepancy in §7 was found, and deleting them removes the
only way to re-run that comparison in isolation.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority | State |
|---|---|---|---|
| REQ-001 | The band height is computed by the correct form and both ends are asserted on both sheet surfaces. | P0 | Met |
| REQ-002 | The add-view and owned-menu bands clear the 44px floor the stylesheet already uses. | P0 | Met |
| REQ-003 | Evidence artefacts are dated against the tree that produced them, and the gate runs the check. | P0 | Met |
| REQ-004 | The artefact discovery is by content, not by a list, so a new artefact joins the gate by being written. | P0 | Met |
| REQ-005 | A capture that photographs nothing, or that is identical across light and dark, is rejected. | P0 | Met |
| REQ-006 | The coverage collector sees every declared checkbox family, including two-class values. | P0 | Met |
| REQ-007 | The role-agreement check takes its expectation from the call site, not from the fixture it is checking. | P0 | Met |
| REQ-008 | The DOM shim's `setCssProps` matches the shipped runtime's behaviour. | P0 | Met |
| REQ-009 | The orphaned probe checks run in the shared harness, with no check weakened on the way in. | P0 | Met |
| REQ-010 | Every product defect the repaired instruments reveal is either fixed here or recorded with its number and its owner. | P0 | Met |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Summarised below as C1-C10. **Full traceability is in**
[`acceptance-criteria.md`](acceptance-criteria.md), which carries twelve rows (AC-001 to AC-012):
it splits the evidence-freshness criterion from the artefact it caught, and adds a row for the
findings handed on rather than fixed.

| # | Criterion | Threshold | Before | After |
|---|---|---|---|---|
| C1 | add-view band height | >= 44px | **42px true, 45px reported** | 48px |
| C2 | owned-menu band height | >= 44px | **38px true, no check existed** | 44px |
| C3 | record sheet band | >= 30px | 32px true, 35px reported | 32px, unchanged |
| C4 | Band steals no control or row, both surfaces | 0px stolen | unasserted | asserted both ends |
| C5 | Evidence artefacts describing the current tree | 8 of 8 | **1 of 8** | 8 of 8 |
| C6 | Blank or theme-identical captures | 0 | **4 blank, 2 identical pairs** | 0, across 224 |
| C7 | Checkbox families visible to the collector | 12 of 12 | **10 of 12** | 12 of 12 |
| C8 | Role check survives a swapped-role fixture | fails | **passed 3/3** | fails, naming the source |
| C9 | camelCase keys reaching `setCssProps` | 0 | **23 across 6 files** | 0 |
| C10 | Orphaned probe checks running in the gate | all | **0 of 63** | 63 |

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk ID | Description | Impact | Likelihood | Mitigation | Outcome |
|---|---|---|---|---|---|
| R-001 | A repaired check is trusted without being shown failing | H | M | Every repair carries a negative control | Held; §6 and §8 each carry one |
| R-002 | Raising the band steals the sheet's first row | H | M | Both ends asserted on both surfaces | Held; `-28px` chosen against a measured 49px overshoot at `-32px` |
| R-003 | The record sheet's accepted shortfall is applied elsewhere by analogy | M | M | The constraint that forced it was measured and found absent | Held; the two sheets are argued separately |
| R-004 | Lifting 63 checks weakens one to make it pass | H | M | Two harness defects fixed, no check weakened; three product defects declared in `KNOWN` | Held |
| R-005 | The shim correction is reported as six bug fixes | M | H | The one live defect is separated from the 22 latent traps | Held; §7 states it |

**Dependencies.** The css lane, acquired and released. `evidence.mjs`, which existed and was unused.

**Dependents.** `022` owns the selection-bar defect this phase measured. `025` addresses the coverage
blindness this phase's §5 repair only partly closed.

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-R01 | A check that cannot go red is theatre. Every repair is demonstrated failing before its passing result is recorded. |
| NFR-R02 | Artefact discovery is by content, so the gate cannot fall behind a list nobody updates. |
| NFR-M01 | Comment hygiene: no spec paths, phase numbers or task ids in `styles.css` or `tools/`. |

---

## 8. EDGE CASES

- **A band that clears the floor by eating a row.** Both ends asserted; this is the case C4 exists
  for.
- **An artefact with no `inputs` map.** Not discovered, therefore not gated. Recorded as a limit: the
  discovery is by content, so an artefact that carries no fingerprint is invisible by construction.
- **A legitimately single-coloured capture.** None exists in the current 224. If one is ever added,
  the rejection rule will need an exemption with a reason rather than being loosened.
- **A camelCase key that happens to match a declaration.** 22 of the 23 were exactly this. They were
  converted as latent traps, which is a different claim from having fixed 22 bugs.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 19/25 | Six instruments, one stylesheet rule, two new fixtures, 63 lifted checks |
| Risk | 17/25 | Every downstream phase's results depend on these instruments being right |
| Research | 16/20 | The shim behaviour was read out of the shipped runtime; the band arithmetic had to be re-derived |
| Multi-Agent | 4/15 | Single lane |
| Coordination | 13/15 | Holds the css lane; hands findings to `022` and `025` |
| **Total** | **69/100** | **Level 3** |

---

## 10. RISK MATRIX

See §6, which carries outcomes rather than forecasts now that the phase has shipped.

---

## 11. USER STORIES

### US-001: A gate that fails for the right reason (Priority: P0)

**As a** maintainer, **I want** each check to be demonstrated failing on a defect that is present,
**so that** a green run means the defects are absent rather than that the check cannot see them.

**Acceptance:** C1, C2, C5, C6, C7, C8, C9, C10.

### US-002: A grab band a thumb can hit (Priority: P0)

**As an** operator dragging a sheet on a phone, **I want** the grab band to meet the 44px target the
stylesheet already uses elsewhere, **so that** the gesture works on the first attempt.

**Acceptance:** C1, C2, C4.

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

Closed at ship. Two decisions were taken by the operator and are recorded as decisions rather than
as gaps — see [`acceptance-criteria.md`](acceptance-criteria.md) §3:

- The record sheet's band stays at **32px** against a 48px ask. **Accepted**, with the constraint
  measured: 33px of chrome above its header leaves the band nowhere to go.
- The table's main-item cell stays at **169x34** against WCAG 2.5.5 AAA's 44px. **Declined**, with
  the shortfall stated: raising it would override the reader's own density setting. The AA 24px floor
  is met, and `verify-placement` reports the 33px reach on every run so the number stays visible.

One item was handed on rather than closed:

- The selection status bar clips its own content at 402px — 36px in a 28px box. Measured, not fixed,
  and owned by `022`.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`plan.md`](plan.md) · [`tasks.md`](tasks.md) · [`implementation-summary.md`](implementation-summary.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../022-selection-bar-keyboard-docking/spec.md`](../022-selection-bar-keyboard-docking/spec.md) — inherits the selection-bar defect
- [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md) — a seventh instance of this phase's defect class
