---
title: "Acceptance Criteria: Harness Fidelity Repair"
description: "Ten criteria, each carrying the failing value measured before the work, the value after, and the file:line that verifies it. All met."
trigger_phrases:
  - "020 acceptance criteria"
  - "harness fidelity closure"
  - "band floor traceability"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/020-harness-fidelity-repair"
    last_updated_at: "2026-08-31T06:00:00Z"
    last_updated_by: "harness-supply-audit"
    recent_action: "Supply audit: 12 rows sound as worded; keyboard-height supply never in scope"
    next_safe_action: "Add a placement check that never sets --keyboard-height, so the fallback can fail"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-020"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "Which of the 63 lifted checks still measure a value the harness supplies"
    answered_questions:
      - "No AC-001..AC-012 row is false as worded; the overclaim was closure at 100"
---
# Acceptance Criteria: Harness Fidelity Repair

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> Every row records the value measured on the tree **before** the work, the value after, and a
> `file:line` that verifies it.
>
> **A repair closes on its negative control, not on a green result.** Every instrument in this phase
> was already green before it started; green was the symptom. A row whose only evidence is that the
> check now passes would repeat the defect it claims to have fixed.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 020-harness-fidelity-repair
**Level:** 3
**Status:** Complete
**Date:** 2026-08-30
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Measurement | Threshold | Before | After | Verification | Status |
|---|---|---|---|---|---|---|---|
| AC-001 | REQ-001, REQ-002 | Add-view sheet grab band height, computed as `up + down + 1` | >= 44px | **42px true, reported 45px** by the double-counting form | **48px** | `tools/storybook/verify-placement.mjs:838` | Met |
| AC-002 | REQ-001, REQ-002 | Owned-menu sheet grab band height | >= 44px | **38px true; no check existed**, only a 41px figure in a comment | **44px** | `tools/storybook/verify-placement.mjs:829` | Met |
| AC-003 | REQ-001 | Record sheet grab band height, unchanged by this phase | >= 30px | 32px true, reported 35px | 32px | `styles.css:275` | Met |
| AC-004 | REQ-001 | Band steals no control and no row, asserted at **both** ends on both sheet surfaces | 0 rows answered by the band | unasserted — only the height was checked | 0 stolen | `tools/storybook/verify-placement.mjs:839` | Met |
| AC-005 | REQ-003, REQ-004 | Evidence artefacts dated against the inputs they were measured from, discovered by content and run as a gate lane | 8 of 8 fresh, lane present | **1 of 8**; the checker existed and nothing called it | 8 of 8; gate lanes 13 -> 14 | `tools/gate.mjs:52` | Met |
| AC-006 | REQ-003 | `checkbox-appearance.json` describes the tree it is committed against | equal to a re-run on the same tree | **171 checkboxes / 51 fixtures** against a re-run's 211 / 56, and the roadmap quoted the stale figure | 211 / 56 | `tools/live/checkbox-appearance.json:1` | Met |
| AC-007 | REQ-005 | A capture that is a single flat colour, or byte-identical across light and dark, is rejected | 0 accepted, 0 false positives across the set | **4 blank 80x64 transparent PNGs and 2 theme-identical pairs accepted** | 0 of 224, 0 false positives | `tools/screenshots/verify.mjs:186` | Met |
| AC-008 | REQ-006 | Checkbox families visible to the coverage collector, whose regex could not match a two-class `cls` value | 12 of 12 | **10 of 12**; `db-invalid-event-select` and `base-import-include-checkbox` dropped out and "0 uncovered" described ten families | 12 of 12, both with fixtures from the modals' real markup | `tools/screenshots/scenarios/panels.mjs:574`, `tools/screenshots/scenarios/panels.mjs:617` | Met |
| AC-009 | REQ-007 | The role-agreement check takes its expectation from the call site, proven by swapping a modal fixture's role from field to row | the swapped fixture fails | **passed 3/3** — the expectation was derived from the fixture being checked, so a fixture at the wrong role agreed with itself | fails, naming the source file and the role it asks for | `tools/live/checkbox-appearance.mjs:1` | Met |
| AC-010 | REQ-008 | `setCssProps` matches the shipped runtime, which calls `setProperty` and silently drops a camelCase key | 0 camelCase keys reaching it | **23 across 6 files**, all working in the harness and vanishing on a phone | 0; correcting the shim surfaced `inline=NaNpx` on the inline-cap check | `tools/storybook/obsidian-dom-shim.mjs:137` | Met |
| AC-011 | REQ-009 | Orphaned probe checks running inside the shared harness, with none weakened on the way in | all 63 | **0 of 63**; they lived in five files nothing re-ran | 63; placement 114 -> 177 checks | `tools/storybook/verify-placement.mjs:1888` | Met, **arrival only** — see §4 |
| AC-012 | REQ-010 | Every product defect the repaired instruments revealed is fixed here or recorded with its number and its owner | 0 dropped | n/a — the instruments could not reveal them | 1 handed to `022` with its number; 3 declared in `KNOWN` | `specs/public/005-component-surface-system/022-selection-bar-keyboard-docking/spec.md:1` | Met, **of what was revealed** — see §4 |

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Not at 100. Twelve of twelve criteria are `Met` and none is withdrawn — every row is
true as worded, and §4 records why that is not the same as a harness this phase left truthful.

The criterion that carries the phase is AC-001. The add-view sheet reported 45px against its own 44px
floor and passed; corrected, it read 42px and went red **before any stylesheet edit**. Every other
repair follows the same pattern — an instrument that was green for a reason unrelated to what it was
named for — and each closes on a negative control rather than on the green result that followed.

### Decisions carried, not criteria

Two shortfalls are recorded here so they are not mistaken for unmet criteria. **Neither is a failure
of this phase and neither belongs in the table above**, because neither was a criterion this phase
had to meet.

| Item | Ask | Delivered | Disposition |
|---|---|---|---|
| Record sheet grab band | 48px | 32px | **Accepted** by the operator, with the constraint measured: the sheet has 33px of chrome above its header, so a taller band has nowhere to go without moving content |
| Table main-item cell | 44px (WCAG 2.5.5 AAA; 40px at the loosest density) | 169x34 | **Declined** by the operator on density grounds — raising it would override the reader's own density setting, which is a deliberate preference. The AA 24px floor is met |

Both remain visible rather than closed by silence: `verify-placement` reports the 33px reach of the
main-item cell on every run, and the record sheet's band is pinned at its current value so a change
would fail rather than drift.

### Handed on, not closed

`.db-selection-status-bar` clips its own content at 402px — 36px in a 28px box. Measured identically
with `position: fixed` and forced into flow, so it is shipped layout rather than a capture artefact.
It is `022`'s subject, recorded with its number.

The coverage repair in AC-008 closed the two-class regex and **not** the `create|render` name filter,
which leaves thirteen further modules invisible. That is `025`'s subject, and `000`'s AC-006 had
already flagged the same matcher.

### Outstanding for the operator

The two new modal fixtures have not had per-image sign-off.
<!-- /ANCHOR:closure -->

---

## 4. THE SUPPLY THIS PHASE DID NOT AUDIT

Asked of every row: *if this value came from the device instead of the harness, would the check still
pass — and could it still fail?* Twelve rows answer it. **None is withdrawn.** Nine of them
(AC-005 to AC-012) are properties of the repository and its tooling — an artefact's freshness, a
regex's reach, a shim's key casing, a check's presence. No device value enters, so no device value
can falsify them. Three (AC-001 to AC-004) are the grab band, and the band is geometry this
stylesheet declares outright: `top: -40px`, `bottom: -28px`, `--db-space-6: 16px`, clipped by the
sheet's own top edge. Nothing in `tools/screenshots/runtime-vars.css` pins a variable the band reads.
That is the class the question is not meant to catch.

**The finding is not a false row. It is what was never a row at all.**

This phase is named for the harness's truthfulness and reached `completion_pct: 100`. In the same
harness, at three sites, `verify-placement.mjs` sets `--keyboard-height` on the document element and
then measures what moved:

| Site | What it drives |
|---|---|
| `:819` | the phone sheet and its selection bar |
| `:4724` | the record sheet, iOS-shaped signal (`visualViewport`) |
| `:4753` | the record sheet, Android-shaped signal (window resize) |

Nothing in `src/` publishes that variable. `popover-position.ts:530` documents it as the *host's*, and
`:551` only reads it; `styles.css:2424` consumes it in a `max()`. So all three checks prove arithmetic
*given* the variable and say nothing about whether it arrives on a phone. `022` withdrew its AC-1 on
exactly this and went from 90 to 55.

**Two of those three sites are inside the 63 checks AC-011 counted.** `:4724` and `:4753` are ASK-4
of the lifted record-sheet audit. So this phase counted, as fidelity gained, two checks carrying the
precise defect shape it existed to eliminate — and `C10`'s "placement 114 -> 177" reads as 63 units of
new truth when two of them are the old failure wearing the new harness's badge.

That is why AC-011 now reads **arrival only**. Its threshold — *all 63 running, none weakened* — is a
transport guarantee, and it is met: a dropped or loosened check would fail it. It cannot fail because
a lifted check was unsound to begin with, and nothing in this phase asked it to.

AC-012 is qualified for the matching reason. "Every product defect the repaired instruments
**revealed**" is true and narrow. The docking defect was not among them, and could not have been: the
instrument supplies the value the defect lives in, so there was nothing for it to reveal. `0 dropped`
is honest about the set it ranges over and reads as completeness at 100.

**What is owed.** A check that does **not** set `--keyboard-height`, so it can only pass if the
plugin's own fallback works — the same negative-control discipline this phase applied to six other
instruments and did not apply here. `022` names the product half: publish the computed inset as a
plugin-owned document variable and have the bar consume it.

**One correction to the standing inventory.** `runtime-vars.css` no longer pins the five values
recorded as divergent (`--db-layer-sticky`, `--db-status-bg`, `--db-number-color`,
`--db-calendar-row-height`, `--db-week-grid-height`); the file documents removing them, plus
`--db-header-height`, `--db-card-field-width`, `--db-mobile-sheet-bottom` and `--db-timeline-row`,
under the rule *never assign a property the runtime also assigns*. That channel is narrowed. The
`--keyboard-height` channel is not, and it is the one still costing withdrawn ticks.
