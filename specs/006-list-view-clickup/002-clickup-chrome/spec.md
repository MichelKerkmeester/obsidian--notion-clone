---
title: "Phase 002: ClickUp Chrome"
description: "The visual language: row rhythm and dividers, group header pill and count, the reserved leading gutter, chip and pill cell treatments, empty-cell placeholders, density. Every value from the existing token scale. The phase most able to pass while nothing changes on screen."
trigger_phrases:
  - "006 phase 002"
  - "clickup chrome"
  - "list visual language"
  - "lane release"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup/002-clickup-chrome"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 002; the two banned criterion shapes carried in verbatim"
    next_safe_action: "Wait for 001 to land the structure and hand over the held lane"
    blockers:
      - "Phase 001 not started"
      - "No census number exists yet"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "checklist.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p002"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the sort indicator gain a badge container? ADR-P2-01, deliberately left to capture review"
      - "Is the select pill uniform-width within its column? ADR-P2-02, deliberately left to capture review"
    answered_questions:
      - "The leading-slot checkbox swap is not built. The captures show a reserved gutter beside a record glyph that stays put. Parent ADR-004"
---
# Phase 002: ClickUp Chrome

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | `specs/public/006-list-view-clickup/002-clickup-chrome/` |
| **Parent Spec** | [`../spec.md`](../spec.md) |
| **Predecessor** | [`../001-list-grid-structure/spec.md`](../001-list-grid-structure/spec.md) |
| **Successor** | [`../003-group-affordances-and-selection/spec.md`](../003-group-affordances-and-selection/spec.md) |
| **Level** | 3 (Full) — **raised.** `recommend-level.sh --loc 700 --files 2` returned 34/100 and Level 1. The scorer sees two files; it does not see a serialized lane fingerprinted by 216 captures, thirteen criteria with negative controls, or the fact that this is the phase the packet's whole ordering argument was built around. Judgment goes higher |
| **Status** | Planned — blocked on 001 |
| **Lane** | `tools/lane/css-lane.json` — **inherited held** from 001, and **released** here, on four conditions in order |
| **Risk rank** | **Highest in the packet.** This is the phase most able to pass every check it writes for itself and leave the operator looking at an unchanged screen |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

**This phase has a recorded local version of a recorded failure.**

Release 1.3.1 shipped real code, passed every gate, and the operator reported that nothing changed.
The sharpened local version: the two affordances the operator pointed at are carried by
`db-list-group-new` — the per-group create button — and `db-list-row-checkbox`. Each matches **zero**
selectors in `styles.css`. `.db-list-row` matches **18**.

A phase asked to "style the list" will reach for the row, because the row is what has rules to assert
on, and will be **honestly green** while both affordances stay exactly as invisible as they are
today.

**Purpose.** Give the list the reference's reading experience — and do it under criteria that name
the specific affordance rather than the row containing it, against failing numbers a different phase
recorded.

**Why this phase does not write its own failing numbers.** Phase 000 wrote them, before any
stylesheet edit existed to bias them. A criterion whose failing number was produced by the phase that
fixes it is not evidence.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In scope

- Row rhythm: flat, full-bleed, no inter-row gap, a single hairline divider.
- The group header: the group value in **its own field's treatment**, with a count numeral beside it,
  and a non-colour signal.
- The **reserved leading gutter** — empty at rest, holding the checkbox on hover, focus or selection,
  without moving the row's chevron, glyph or title.
- Chip and pill cell treatments, including the filled-versus-outlined split.
- Empty-cell placeholders, type-appropriate.
- Row density for the list.
- The full recapture, the human sign-off, and the **lane release**.

### Out of scope

- Any structural change. The structure is 001's and is frozen here.
- Wiring the create row or fixing selection sync. Both are 003.
- Phone layout and touch targets. 004.
- **The toolbar.** The reference's secondary toolbar row is observed and explicitly excluded.
- **Subtasks.** No slot, affordance or row-grammar column is reserved for one.
- Anything that would require a **second** lane take. If 003 or 004 need styling, it is written here
  or deferred to a follow-on packet.

### Frozen boundary

`SCOPE LOCK` applies. A defect found outside this list — including in the table — is recorded in the
parent and not fixed here.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

Inherited from the parent's [`../spec.md`](../spec.md) §4.3. This phase owns:

| ID | Requirement | Priority |
|---|---|---|
| FR-11 | The group header shows the value in **the treatment its own field carries**, with a count beside it. A colour-bearing field yields a coloured pill; a field with no per-option colours yields a neutral chip, and two such groups legitimately look alike | P0 |
| FR-11a | The group pill carries a second, **non-colour** signal — a glyph or the label — so the group is identifiable without colour vision | P1 |
| FR-13 | The row reserves a **leading gutter**, empty at rest, holding the checkbox on hover, focus or selection. Not a separate column; it does not replace or move the record glyph; revealing it must not shift the chevron, glyph or title. The group's collapse toggle shares the band | P1 |
| FR-15 | Rows are flat and full-bleed with a single hairline divider; no card border, no inter-row gap | P0 |
| FR-16 | An empty cell renders a faint type-appropriate placeholder rather than empty space, when `showEmptyFields` is on | P2 |
| FR-18 | Every value introduced comes from the token scale already declared in `styles.css`. No new raw colour, spacing or duration literal | P0 |
| FR-20 | No ClickUp asset, CSS value or token scale is reproduced. Nothing copied from `external/anytype` or `external/appflowy` | P0 |
| FR-21 | A `select` or `status` cell advertises that it is editable **at rest**: the filled pill carries an inline dropdown affordance. Its colour is the option's configured colour, never derived from the value | P1 |
| FR-22 | Multi-value reference columns render as outlined chips, distinct from the filled single-value pill. The treatment is a property of the **column**, never of the value | P2 |
| FR-10 | Row density applies to the list and is offered in the view config panel | P2 |

### 4.1 What the reference cannot tell us, and must not be resolved in the direction we expect

The parent's [`../spec.md`](../spec.md) §4.2.1 lists twelve things the captures cannot establish.
Five of them land in this phase's scope and each one constrains a requirement here:

| # | Not established | Consequence for this phase |
|---|---|---|
| U2 | Any **edit** state — no popover is open and no editor holds focus on any capture | No criterion here may assert edit-mode chrome. See §4.2 banned shape 1 |
| U3 | A **collapsed** group | Whether the reference keeps the per-group header row when a group collapses is unobserved. Our own collapse behaviour is a decision we are making, not one we are copying |
| U6 | **Light theme**, and the horizontal row divider | All four captures are dark theme at a scale that does not resolve a hairline. `FR-15`'s divider half rests on the secondary source. Saying the divider is absent would repeat the error this subsection exists to prevent |
| U10 | What the row's **leading glyph encodes** | `FR-13` allocates the slot; its occupant is a design decision **we** are making. Do not assert it is copied |
| U12 | Any **numeric value** — spacing, radius, hue, duration, density | Forbidden by the licence boundary independently of capture scale. Every number comes from the token scale |

**A candidate sixth, and this phase should treat it as one.** `FR-22`'s filled-versus-outlined split
rests on reading a **plain-text cell against a bordered chip** at the same capture scale that §4.2.1
already says cannot resolve a hairline divider (U6). The distinction is visible within a single row
on one capture, which is the strongest form the evidence takes — but it is a hairline-presence claim
graded by the same eye, at the same scale, that U6 disqualifies for the divider. `FR-22` is P2, so
nothing blocks; **before its criterion is written, re-examine the distinction at full resolution and
record the result**, rather than inheriting it.

### 4.2 The two banned criterion shapes, carried in verbatim

These are not general advice. Both were found in this packet by review, and they fail in **opposite**
directions.

**Banned shape 1 — a criterion that is already true at rest.** *"In edit mode the cell renders a
bordered pill"* is rejected. Bordered chips appear in whole columns of **resting** rows on every
primary capture, so such a criterion is true before anything is built and passes on the current tree.
Assert the state that actually differs — a popover is open, an editor holds focus, the cell accepts
input — never the chrome around it.

**Banned shape 2 — a criterion whose threshold the reference contradicts.** The withdrawn `AC-16`
read *"the checkbox and the record icon occupy the same box, within 1px"*. The captures show they do
not and must not: the checkbox appears in a **reserved gutter** beside a record glyph that stays put.
An implementation matching the reference would have **failed** it. This shape is more dangerous than
shape 1 because it is precise, measurable and negative-controllable, and still points at the wrong
behaviour.

**The third check.** A criterion whose target depends on a design choice nobody has made yet fails
ambiguously, and the phase that fixes it gets to choose which reading it meant. Two of this phase's
open choices are recorded as ADRs rather than smuggled into thresholds.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Definitions live in the parent register [`../acceptance-criteria.md`](../acceptance-criteria.md).
This phase owns `AC-12` to `AC-21`, `AC-27`, `AC-29` and `AC-30`'s chrome half. Measurement plans are
in [`acceptance-criteria.md`](acceptance-criteria.md).

Every criterion here carries a **negative control**: delete the subject node from the harness DOM and
an asserted number must move. If nothing moves, the check is theatre and is rejected rather than
waived.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Why it bites | Mitigation |
|---|---|---|
| **The phase passes and nothing changes on device** | The recorded failure of release 1.3.1, with a measured local version: two affordances at zero rules each, and a row at 18 | Numbers came from 000. Every criterion names its own affordance. Every criterion has a negative control. A human looks at the images |
| A criterion asserts resting chrome as if it were edit chrome | Banned shape 1. It would pass before a line is written | No criterion here asserts edit-mode chrome at all — U2 says no capture shows an edit state |
| A criterion's threshold contradicts the reference | Banned shape 2, and it already happened once in this packet | Check every threshold against the primary source, not only its measurability |
| A duplicated selector is edited and the winner changes | The stylesheet reverses itself: 87 selectors declared more than once, 124 property values overridden by a later block. A block that looks dead is not | Record the computed winner before and after for every duplicated selector touched |
| The lane is released on a green manifest | The capture-manifest check proves a capture was regenerated. It never opens an image | The human review is the visual gate and is not optional |
| `005` needs the lane | Both packets edit the same file and there is no shared-hold mode | Reach a releasable state or revert to baseline |

### Dependencies

- **Phase 001 landed**, with the structure frozen and the lane handed over held.
- **Phase 000's census** — every "today" cell filled. A blank cell blocks the task that would fill the
  target.
- **`005`'s live-verification phase** must re-assert against the released tree, because both packets
  edit the same file.

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement | Threshold | How measured |
|---|---|---|---|
| NFR-03 | Contrast: every text pair 4.5:1; any border that alone identifies a control 3:1 | WCAG 1.4.3 and 1.4.11 | computed-style probe, **both themes** |
| NFR-05 | Focus visible on every interactive element, as a `box-shadow` ring rather than `outline` | present and visible | harness |
| NFR-06 | Motion sits in the declared bands for press, hover and group collapse | within band | source assertion against the token scale |
| NFR-07 | No new value off the existing token scale | zero | diff review |

Both themes, not one. All four primary captures are dark; light theme is unobserved (U6) and is ours
to get right rather than ours to copy.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

| Case | Expected |
|---|---|
| The group field carries no per-option colours | A neutral chip with no glyph. **Two such groups legitimately look alike** — this is correct, not a defect, and `AC-15` is scoped so it does not fail a rendering that follows the field |
| A group has zero rows | Header row and create row both render and are both styled. Nothing between them |
| A multi-value cell at a narrow width | An overflow chip, **distinguishable from a trailing add affordance**. The reference carries both in one column and they are different glyphs |
| A `select` cell with no value | A dash at the pill's left edge, not centred in the cell |
| An unset date or assignee cell | An add affordance, not a placeholder. The reference distinguishes the two and so must we |
| Light theme | Every contrast pair re-measured. No capture shows it |
| A collapsed group | Our decision, not the reference's — no capture shows one |
| A row is revealed on hover | The chevron, glyph and title do **not** move. The gutter was already allocated |

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## 9. COMPLEXITY ASSESSMENT

| Dimension | Value |
|---|---|
| Estimated LOC | ~700, almost all of it `styles.css` |
| Files touched | ~2 |
| Architectural | no — but the lane release is a coordination point with another packet |
| Risk | **highest in the packet.** Every gate can be green while the screen is unchanged |
| Level score | 34/100 by the scorer; **raised to 3** on the grounds in §1 |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

Both are deliberately left to the capture review rather than settled in advance, and both are
recorded in [`decision-record.md`](decision-record.md) so neither is smuggled into a threshold.

**Q-P2-01 — Does the sort indicator gain a badge container?** Ours is bare accent-coloured text; the
reference's is a filled rounded badge. Same information, different container. ADR-P2-01.

**Q-P2-02 — Is the select pill uniform-width within its column?** The reference's is, measured on
three primary captures. Ours is text-hugging, and the hierarchy argument against uniform width still
stands. The capture review now compares two **measured** shapes rather than one measured and one
imagined. ADR-P2-02.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`../spec.md`](../spec.md) §4.2 and §4.2.1 — the interaction model and what the captures cannot establish.
- [`../plan.md`](../plan.md) §2 — the lane protocol and its four release conditions.
- [`../decision-record.md`](../decision-record.md) — ADR-002 the sort indicator, ADR-003 the select pill, ADR-004 the leading gutter.
- [`decision-record.md`](decision-record.md) — ADR-P2-01 and ADR-P2-02, the two capture-review choices.
