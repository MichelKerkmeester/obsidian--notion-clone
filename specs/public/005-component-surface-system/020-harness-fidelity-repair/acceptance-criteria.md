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
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Ten criteria traced to file:line; all met at ship"
    next_safe_action: "Operator signs off the two new modal fixtures"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-020"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
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
| AC-011 | REQ-009 | Orphaned probe checks running inside the shared harness, with none weakened on the way in | all 63 | **0 of 63**; they lived in five files nothing re-ran | 63; placement 114 -> 177 checks | `tools/storybook/verify-placement.mjs:1888` | Met |
| AC-012 | REQ-010 | Every product defect the repaired instruments revealed is fixed here or recorded with its number and its owner | 0 dropped | n/a — the instruments could not reveal them | 1 handed to `022` with its number; 3 declared in `KNOWN` | `specs/public/005-component-surface-system/022-selection-bar-keyboard-docking/spec.md:1` | Met |

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Yes. Twelve of twelve criteria are `Met`.

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
