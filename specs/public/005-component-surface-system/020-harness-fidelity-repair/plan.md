---
title: "Implementation Plan: Harness Fidelity Repair"
description: "A record of the approach taken: repair each instrument, demonstrate it failing on a defect that is present, and let the corrected measurement decide the single stylesheet change."
trigger_phrases:
  - "020 harness fidelity plan"
  - "instrument repair order"
  - "negative control before fix"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Harness Fidelity Repair

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This plan is a record of the approach that was taken, not a forecast.** The phase has shipped; the
sections below describe how it was done and, where the route changed, why.

The governing rule was **measure, then decide**. Six instruments were repaired first and the
stylesheet was touched only once, at the one place a corrected instrument condemned. The alternative
ordering — fix the visible defect, then repair the instruments — would have produced a stylesheet
change justified by a number that was wrong by 3px.

That was not hypothetical. The add-view sheet's band reported 45px against its own 44px floor and
passed. Corrected, it read 42px and went red **before any stylesheet edit**. The edit that followed
was a consequence of the repair, and the order is what makes it defensible.

Each repair had to be shown failing on a defect that was present. A repaired check that has only ever
been observed passing is indistinguishable from the broken one it replaced.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Results are the values read at ship.

| Gate | Command | Pass condition | Result |
|---|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 | exit 0 |
| Build | `npm run build` | exit 0 | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction | **444 passed** |
| Gate | `npm run gate` | exit 0 | **14 green, exit 0** (13 before; `evidence` is the new lane) |
| Placement | `npm run storybook:placement` | no unexplained red | **173/177**, 4 red for a declared reason, exit 0 (114 before; 63 lifted) |
| Captures | `npm run screenshots:verify` | current, none blank, none theme-identical | **224 entries**, 0 blank, 0 identical |
| Evidence | `node tools/live/evidence.mjs --check-all` | every artefact describes this tree | **8 of 8** |

The `evidence` lane is this phase's own addition and is the reason the gate count moved from 13 to
14.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

Six instruments, one product rule, and one organising principle.

**The principle: a check earns trust by failing.** Every repair below was demonstrated against a
defect that was present on the tree, not merely observed returning green afterwards. That is the same
discipline `../009-live-verification` applies to its probe, and the reason is identical — a check
that has only ever agreed with something is an opinion.

**Where the arithmetic lived.** The band height was computed by walking outward from the bar's centre
and adding the bar's height back, double-counting 4px because both arms already cross the bar. The
correct form — `up + down + 1` — was already in the same file, in `usableHeight`. That is what makes
this a bug rather than a convention: the file disagreed with itself.

**Discovery over enumeration.** `evidence.mjs` could date an artefact against its inputs and nothing
called it. Rather than registering the eight artefacts in the gate, `--check-all` discovers every
artefact carrying an `inputs` map. A ninth joins the gate by being written, which removes the failure
mode where a list falls behind the thing it lists.

**Rejecting nothing-shaped photographs.** The immediate defect was one fixture capturing a
`position: fixed` element that contributed no height. The durable repair is different in kind:
`verify.mjs` now decodes each PNG and rejects a single-coloured image and a light/dark pair that is
byte-identical. Across 224 captures those two rules fire on nothing but the defect, which is what
makes them safe to leave in.

**Expectations must come from outside the thing being checked.** The role-agreement suite derived a
fixture's expected role from that fixture's own class list, so a fixture at the wrong role agreed
with itself. Moving the expectation to the call site is the general form of this repair, and §6 of
`spec.md` is its instance.

**The shim was read out of the runtime, not inferred.** `obsidian.asar` -> `enhance.js` shows
`setCssStyles` assigning `style[name]` and `setCssProps` calling `setProperty(name, value)`.
`setProperty` takes a CSS property name, so camelCase is dropped silently. The repo's shim gave
`setCssProps` the permissive body, so 23 keys worked in the harness and vanished on a phone.

**Why the probe files were kept.** They are each other's control. One runs against the repo shim
rather than a local override, which is how the shim discrepancy was found at all. Deleting them after
lifting their checks would have removed the only way to re-run that comparison in isolation.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

The order below is the order that was followed.

### Phase 1 — Re-derive the band arithmetic

Correct the double-count before touching anything visual, and re-read all three surfaces. The add-view
sheet went red at 42px against its own 44px floor; the owned-menu sheet turned out to have **no check
at all**, only a 41px figure in a comment, and measured 38px.

### Phase 2 — Decide the band by measurement, not by analogy

The 44px floor was already in the stylesheet for phone menu rows and is WCAG 2.5.5, so it was adopted
rather than argued. The interesting question was whether the record sheet's accepted 32px transfers.

It does not, and the measurement is the reason: the record sheet has 33px of chrome above its header,
so its band has nowhere to go. The add-view sheet has 44px of continuous inert chrome with zero
interactive descendants and its first control at y=101; the owned-menu sheet's first row is at y=47.

`bottom: -28px` was forced rather than chosen. 24px leaves the owned menu at 41px, under the floor.
32px reaches 49px and starts taking that sheet's first row. Both ends were asserted on both surfaces
so that a band clearing the floor by eating a row fails instead of passing.

### Phase 3 — Make evidence freshness a gate lane

Wire `--check-all` and add the lane. Seven of eight artefacts were stale; `cascade-audit.json` had
been measured against a `styles.css` 351 lines shorter than HEAD's, and `checkbox-appearance.json`
held 171 checkboxes over 51 fixtures where the same tool on the same tree produced 211 over 56 — a
figure the roadmap was quoting as evidence. All eight regenerated.

### Phase 4 — Reject captures of nothing

Fix the fixture with the `captureCss` block the harness already had, then add the two durable rules to
`verify.mjs`. Confirm they fire on the defect and on nothing else across the full 224.

### Phase 5 — Widen the coverage collector and de-confirm the role check

The collector's `cls:\s*"([a-z0-9-]+)"` could not match a two-class value, so four call sites and two
families dropped out and "0 uncovered" was a statement about ten of twelve. Both families gained
fixtures built from the modals' real markup. The role check's expectation moved to the call site.

### Phase 6 — Match the shim to the device

Correct `setCssProps`, then hyphenate all 23 camelCase keys across six files. The correction
immediately surfaced a real failure: `popover-position.ts` sets `maxHeight`, and the check asserting
the inline cap began reporting `inline=NaNpx`.

**One of the 23 was a live defect** — a file thumbnail setting `object-fit` and a right margin on a
class with no stylesheet rule, rendering stretched and flush. The other 22 were backstopped by
declarations that happened to match, and are recorded as latent traps rather than counted as fixes.

### Phase 7 — Lift the orphaned probes

63 checks from five probe files into `verify-placement.mjs`, reusing one browser and one bundle. Two
harness defects were repaired on the way in — a 2px scan step with a non-inclusive width reading 384
where the truth is 386, and a read taken in the same tick as its dispatch — and no check was weakened
to make it pass. Three genuine product defects the probes measure were declared in `KNOWN`, so the run
reports an unexpected pass the moment any is repaired.

### Phase 8 — Record what was measured and not fixed

The selection status bar clips its own content at 402px: 36px in a 28px box, measured identically
`position: fixed` and forced into flow, so it is shipped layout. The blank fixture had been hiding it.
Handed to `022` with the number rather than absorbed.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Negative control | Each repaired check shown failing on a present defect | `verify-placement.mjs`, `verify.mjs`, the coverage suite |
| Controlled mutation | A modal fixture's role swapped field to row | the role-agreement suite |
| Regression | 63 lifted checks, none weakened | `verify-placement.mjs` |
| Freshness | Every artefact dated against its inputs | `evidence.mjs --check-all` |
| Capture | 224 images, none blank, none theme-identical | `screenshots:verify` |

The controlled mutation is the strongest evidence this phase produced, and it is worth stating
precisely: with a modal fixture's role swapped from field to row, **the old suite passed 3/3 and the
new one fails**, naming the source file and the role it asks for. A check that passes a deliberately
wrong fixture is not a weak check; it is a check measuring something else.

The three `KNOWN` product defects are the other half of the same discipline. Declaring them means the
run reports an **unexpected pass** if any is silently repaired, which is the case an ordinary
allowlist would swallow.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| The css lane | Internal | Acquired and released | No stylesheet edit could proceed |
| `evidence.mjs` | Internal | Existed, unused | The freshness lane would have to be written from scratch |
| `obsidian.asar` -> `enhance.js` | External | Read | The shim behaviour would be inference rather than fact |
| The five probe files | Internal | Kept | Their 63 checks would stay unrun, and the shim cross-check would be unrepeatable |

The lane was taken clean: `005` released at the same hash and the stylesheet had not moved since.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the raised band steals a control on a surface the assertions did not cover.
- **Procedure**: revert the one changed rule, `.db-mobile-bottom-sheet-handle::before`. The band
  returns to centring on the bar and the two sheets return to 42px and 38px — below the floor, which
  is the state this phase found.
- **Data reversal**: none.

The instrument repairs are separately revertible from the stylesheet rule and should not be reverted
with it. They are what makes the defect visible; reverting them would restore a gate that certifies
whatever it computes.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
Phase 1 band arithmetic ──▶ Phase 2 the one stylesheet rule
   (the repair that                    │
    condemns the rule)                 │
                                       ▼
Phase 3 evidence lane ─┐         recapture + attribution
Phase 4 blank capture ─┤               │
Phase 5 coverage+role ─┼──▶ gate 13 ──▶ 14 green
Phase 6 shim ──────────┤               │
Phase 7 lifted probes ─┘               ▼
                              Phase 8 hand findings on
                                       │
                              ┌────────┴────────┐
                              ▼                 ▼
                        022 selection bar   025 coverage blindness
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Band arithmetic | Nothing | The red that justifies the stylesheet rule | The stylesheet edit |
| The stylesheet rule | Phase 1 | 48px / 44px bands, both ends asserted | Recapture |
| Evidence lane | Nothing | 8 of 8 fresh; the 14th gate lane | The gate's honesty about vintage |
| Blank-capture rejection | Nothing | 0 blank across 224 | The selection-bar finding becoming visible |
| Shim correction | Reading the shipped runtime | 23 keys hyphenated; one live defect fixed | Any harness claim about `setCssProps` |
| Lifted probes | Nothing | 63 checks in the gate | Placement's 114 → 177 |
| Findings handed on | Phases 1-7 | `022`'s subject; `025`'s antecedent | Nothing in this phase |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **Phase 1 — the band arithmetic** - CRITICAL. Nothing about the stylesheet change is defensible
   without it, since the surface passed its own floor before the correction.
2. **Phase 2 — the one rule** - CRITICAL. The reported defect.
3. **Phase 4 — blank-capture rejection** - CRITICAL in retrospect: it is what made the selection-bar
   defect visible at all, and that finding is now `022`.

**Total Critical Path**: Phase 1 → Phase 2 → recapture.

**Parallel Opportunities** (all taken): Phases 3, 5, 6 and 7 are independent of the band work and of
each other. Phase 7's lift was the largest and touched no product surface.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Reached |
|---|---|---|---|
| M1 | The band check is honest | Corrected arithmetic; add-view red at 42px before any edit | Phase 1 |
| M2 | The band clears the floor | 48px and 44px, both ends asserted on both surfaces | Phase 2 |
| M3 | The gate knows its evidence's vintage | 8 of 8 fresh; the lane runs | Phase 3 |
| M4 | A photograph of nothing is rejected | 0 blank, 0 theme-identical across 224 | Phase 4 |
| M5 | The harness matches the device | `setCssProps` corrected; 23 keys hyphenated | Phase 6 |
| M6 | The orphaned checks run | 63 lifted; placement 114 → 177 | Phase 7 |

<!-- /ANCHOR:milestones -->
---

## 11. L3: ARCHITECTURE DECISION RECORD

### ADR-001: Raise the band rather than lower the threshold

**Status**: Accepted

**Context**: Corrected, the add-view sheet's band measured 42px against the 44px floor its own check
declares. Two ways to make the check pass.

**Decision**: Raise the band. The 44px floor is WCAG 2.5.5 and is already the stylesheet's own value
for phone menu rows.

**Consequences**:
- The floor is the project's established value, adopted rather than invented for this phase.
- The band is a pseudo-element that does not participate in layout, so reaching 44px cost no layout
  change at all.
- `bottom: -28px` is forced: 24px leaves the owned menu under the floor at 41px, 32px reaches 49px
  and starts taking the first row.

**Alternatives Rejected**:
- *Lower the threshold to 42px*: would make the number describe the code rather than the requirement,
  which is the failure mode the whole phase is about.
- *Apply the record sheet's accepted 32px by analogy*: measured and rejected. That acceptance rests on
  33px of chrome above its header leaving nowhere for the band to go; the other two sheets do not have
  that constraint.

### ADR-002: Keep the probe files after lifting their checks

**Status**: Accepted

**Context**: 63 checks were lifted from five probe files into the shared harness. The obvious cleanup
is to delete the now-duplicated sources.

**Decision**: Keep them.

**Consequences**:
- Some duplication remains, and a reader may wonder which is authoritative. The shared harness is.
- The comparison that found the shim discrepancy stays re-runnable: one probe runs against the repo
  shim rather than a local override, and that difference is the instrument.

**Alternatives Rejected**:
- *Delete them*: removes the only way to re-run the shim comparison in isolation. The tidier tree
  would have cost the phase its own detection mechanism.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] The css lane is acquired and the baseline hash recorded
- [ ] Each instrument repair has a defect that is present to be demonstrated against
- [ ] The band arithmetic is corrected before any stylesheet edit is considered
- [ ] The shipped runtime has been read for any claim about Obsidian's own behaviour

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Repair the instrument before acting on what it reports. A stylesheet change justified by an uncorrected number is not justified |
| TASK-CONTROL | A repaired check closes only after it has been shown failing on a defect that is present |
| TASK-NOWEAKEN | A lifted check is not weakened to make it pass. A genuine product defect is declared in `KNOWN` |
| TASK-EVIDENCE | A task closes on a number that was read or a command whose output and exit status were read |
| TASK-HANDOFF | A defect measured and not fixed is recorded with its number and its owner, never dropped |
| TASK-HONESTY | A latent trap is not counted as a bug fixed. The one live defect among the 23 is named as the one |
| TASK-HYGIENE | No spec paths, phase numbers or task ids in `styles.css` or `tools/` |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. A repair reports the negative control that proved it, not
only the green result that followed.

### Blocked Task Protocol

A task is BLOCKED when the css lane is held elsewhere, or when a repair cannot be demonstrated
failing on any present defect. On BLOCK: record the blocker in `tasks.md` and stop that task. **Do
not close a repair on a green result alone** — that is the state every one of these instruments was
already in.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`implementation-summary.md`](implementation-summary.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../022-selection-bar-keyboard-docking/spec.md`](../022-selection-bar-keyboard-docking/spec.md)
- [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md)
