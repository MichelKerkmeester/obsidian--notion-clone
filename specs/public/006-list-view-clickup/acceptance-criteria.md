---
title: "Acceptance Criteria: List View as a ClickUp-Style Grid"
description: "Criteria with their provenance — what produces each number, at which phase, and why the criterion is expected to fail today."
trigger_phrases:
  - "006 list view acceptance criteria"
  - "list grid criteria provenance"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup"
    last_updated_at: "2026-08-30T12:00:00Z"
    last_updated_by: "desktop-screenshot-audit"
    recent_action: "AC-16 replaced; AC-01/02/15/21/23 sharpened; AC-30 added; second banned phrasing"
    next_safe_action: "Run the phase 000 census to fill every failing number"
    blockers:
      - "No number measured yet"
    key_files:
      - "acceptance-criteria.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: List View as a ClickUp-Style Grid

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Packet** | `specs/public/006-list-view-clickup/` |
| **Doctrine** | `../005-component-surface-system/architecture-findings.md` §9, binding |
| **Measurement surface** | `tools/storybook/verify-placement.mjs` against system Chrome, at the production mount point |
| **Numbers filled by** | Phase 000, before any stylesheet edit exists |
| **Status** | All criteria open; no number measured yet |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

Every criterion satisfies the four rules: measured on the real renderer at the production mount
point, a number or a hit test with a threshold, demonstrated failing first, and distinguishable by
the harness.

**Distinguishability is a per-criterion obligation, not a blanket claim.** Each row names the node
whose deletion must move an asserted number. If deleting it moves nothing, the criterion is rejected
and rewritten — that is what happened to every check that passed in release 1.3.1.

### Structure — phase 001

| ID | Criterion | Threshold | Negative control | Why it fails today |
|---|---|---|---|---|
| AC-01 | Count of `<th>` elements in a rendered list view, ungrouped | equals visible column count plus the utility columns, where "utility columns" means exactly two and is fixed before the census runs: the **leading gutter** (C22 — reserved, empty at rest, shared with the group toggle) and the **trailing track** (C23, C30 — the header's add-column `+` and the row's overflow menu). Whether the leading gutter is emitted as a `<th>` or as padding on the first cell is a phase 001 decision and **must be recorded before this number is measured**, or the criterion cannot fail informatively | remove a column from the config; the count drops by one | The list renders no header element at all |
| AC-02 | Count of header rows in a grouped list whose fixture **includes a group with zero rows** | equals group count, counting the zero-row group | collapse a group; the count drops by one | No header exists to repeat. **The fixture requirement is the criterion.** C24 shows a zero-row group carrying a full header row, so header emission must key off the group's existence, never its row count — and a fixture built only from non-empty groups would pass an implementation that gets this wrong. See AC-30 |
| AC-03 | Order of `data-note-database-row-path` values after clicking a column header, and after clicking it again | reverses, then returns | delete the header; the order stops responding | No header to click. **Not** "a header exists with aria-sort" |
| AC-04 | Column width after a resize drag, read from the rendered track | matches the dragged value within 1px | remove the resize handle; the width stops changing | The list reads widths but offers no handle |
| AC-05 | A `files` column and a `rollup` column render a non-empty cell in a list view | both non-empty | remove the column; the cell disappears | `card-field-renderer.ts` handles neither type |
| AC-06 | After selecting a cell range and pressing copy, the clipboard payload | equals the table's payload for the same range | clear the selection; the payload is empty | `database-view.ts:1597` returns early for non-table views |
| AC-07 | Tab past the last cell of the last row | creates one row | disable the guard; no row is created | `database-view.ts:1816` returns early |
| AC-08 | Footer calculation value for a numeric column in a list | equals the table's value for the same data | remove the rule; the cell empties | `database-view.ts:6995` gives the list the summary bar instead |
| AC-09 | Group depth rendered for a two-field grouping in a list | 2 | drop the second field; depth falls to 1 | `renderList` passes one field |
| AC-10 | Row-click still opens the record detail panel, and the roving-tabindex model is still active in list mode | both true | switch the view to table; both become false | Guards the FR-17 regression Route B could cause |
| AC-11 | Render time for 2,000 rows | within 20 percent of the table baseline from T1.7 | halve the row count; the time falls | Nothing measured yet |
| AC-28 | Count of sort-indicator nodes in a grouped list with one column sorted, and the ordinal text each carries with two rules active | equals the group count; every instance shows the same ordinal | remove the sort rule; the count falls to 0 | No header exists, so no indicator does. Guards FR-03a: an indicator emitted once outside the repeated header would render on the first group only, and a criterion counting "at least one" would not notice |

### Chrome — phase 002

These are the criteria most able to pass while nothing changes on screen. Each names its own
affordance rather than the row that contains it.

**Two phrasings are banned outright here, and the reference captures are why. They fail in opposite
directions, which is the point.**

**Banned shape 1 — a criterion that is already true at rest.** A criterion of the form *"in edit mode
the cell renders a bordered pill"* is rejected. `spec.md` §4.2 C7 records the inference that bordered
pills signal edit mode being withdrawn: the operator screenshot, and D1-D4 after it, show bordered
chips in whole columns of resting rows, so such a criterion is true before anything is built and
would pass on the current tree. Assert the state that actually differs — a popover is open, an editor
holds focus, the cell accepts input — never the chrome around it.

**Banned shape 2 — a criterion whose threshold the reference contradicts.** AC-16 read *"the checkbox
and the record icon occupy the same box, within 1px"*. Four desktop captures show they do not and
must not: the checkbox appears in a reserved gutter beside the record icon, which stays put (C22,
ADR-004). An implementation that matched the reference would have **failed** that criterion. This
shape is more dangerous than shape 1 because it is precise, measurable and negative-controllable, and
still points at the wrong behaviour. Before a criterion is accepted, check its threshold against the
primary source, not only its measurability.

**A third check, applied to every row below.** A criterion whose target depends on a design choice
nobody has made yet cannot fail informatively — it fails ambiguously, and the phase that fixes it
gets to choose which reading it meant. Two rows carried that defect and now name their anchor
explicitly: AC-01 and AC-23.

| ID | Criterion | Threshold | Negative control | Why it fails today |
|---|---|---|---|---|
| AC-12 | Number of authored CSS declarations that apply to `.db-list-group-new` at the production mount point | greater than 0 | delete the node; the measured set empties | **Measured: `db-list-group-new` matches 0 selectors in `styles.css`.** The per-group *Add Task* button is entirely unstyled |
| AC-13 | Number of authored CSS declarations that apply to `.db-list-row-checkbox` | greater than 0 | delete the node; the measured set empties | **Measured: 0 selectors.** Already recorded in `architecture-findings.md` §7 and still true |
| AC-14 | Vertical gap between two adjacent list rows | 0, with exactly one divider between them | delete a row; the divider count drops by one | Rows are card-like with separation |
| AC-15 | Group header pill background colour differs between two different group values, **when the group field carries per-option colours** | two distinct measured colours | give both groups the same value; the colours converge | The group title is plain text. **The scope is not a hedge.** C26 shows a non-status group field rendering a neutral chip, with two different group values carrying the same treatment — so unscoped, this criterion would fail a rendering that correctly follows the field. AC-27 is the one that must hold for every group field, which is why it does not depend on this row |
| AC-16 | Horizontal position of the row's expand chevron, record icon and title, measured with the leading gutter empty and again with it occupied by the checkbox — on hover, on focus and on select | identical in every state, within 1px, **and** the checkbox's box does not intersect the record icon's box in any of them | delete the gutter; the two measurements collapse into one and the comparison has nothing to compare | **This row replaces a criterion whose threshold was provably wrong.** The previous AC-16 asserted the checkbox and the record icon share one box; C22 and ADR-004 show the reference keeps both, in a reserved gutter that causes no reflow, so a correct implementation would have failed it. Today the list emits `db-list-row-checkbox` with **0** CSS rules and has no gutter to reveal, so there is no second state to measure and the criterion fails for the right reason |
| AC-17 | Contrast of every text pair introduced or changed, both themes | at least 4.5:1 | raise the background lightness; the ratio falls | Nothing measured yet |
| AC-18 | Contrast of any border that alone identifies a control | at least 3:1 | as above | Nothing measured yet |
| AC-19 | Distinct measured row heights across the three densities | three distinct values | set all three the same; they converge | Density is not offered for list |
| AC-20 | Count of literal colour, spacing, radius or duration values introduced outside the token scale | 0 | introduce one deliberately; the count rises | Guard against the defect this whole system exists to prevent |
| AC-21 | At a narrow width, a multi-value cell renders an overflow chip rather than wrapping | overflow chip present **and distinguishable from an add affordance**, row height unchanged | widen; the chip disappears | No chip treatment exists. Sourced from C11 and C28: the overflow is width-driven, and both placements coexist. **The census must not count a `+` as a `+N`.** C27 records a reference column carrying a trailing `+` add affordance beside its chips **at rest**, in the same column that also shows a `+1` overflow chip; a measurement that matches on a leading `+` alone would pass on the wrong node |
| AC-27 | Signals distinguishing two group headers, with colour removed from the measurement — the rendered glyph or icon node, and the pill's text | at least one non-colour signal differs between two group values | give both groups the same value; the signals converge | The group title is plain text with no glyph. Guards FR-11a. **A criterion that only compares pill background colours passes on a colour-only encoding**, which is why AC-15 does not stand alone |
| AC-29 | Presence of a dropdown affordance inside a `select` or `status` cell in a list row **at rest** — nothing hovered, no popover open, no cell focused | present | remove the affordance node; the measurement empties | `renderStatus` emits a bare `status-badge` span with the option text and nothing else (`cell-renderer.ts:430-446`). Guards FR-21. Measured at rest on purpose: an affordance that only appears on hover does not tell a reader the cell is editable. **Provenance upgraded:** C19 is now confirmed on four primary screens, all of them showing the chevron on rows with nothing revealed and nothing open |
| AC-30 | In a grouped list whose fixture contains a group with **zero rows**, the count of header rows and of per-group create rows rendered inside that group | 1 and 1 | give the group a row; both stay 1 while the row count moves | Nothing renders for the list at all today. **Guards the constraint C24 makes explicit**: a grid renderer that emits a group's header only when the group has rows is a natural optimisation, passes a fixture of non-empty groups, and breaks the case the reference shows twice. Closes the `spec.md` §8 empty-group edge case, which `checklist.md` requires to have a check or a recorded deferral |

### Behaviour — phases 003 and 004

| ID | Criterion | Threshold | Negative control | Why it fails today |
|---|---|---|---|---|
| AC-22 | Change the selection from the toolbar, then read the list group checkbox state | reflects the change | select nothing; the checkbox clears | **`syncGroupedSelectionInputs` queries `.db-table` and `.db-group-divider-row` only** (`database-view.ts:7566-7575`). The list group checkbox is set once at render and never resynced |
| AC-23 | Horizontal offset of the per-group create row versus **the first column's leading-glyph origin — not its title text**, with the anchor named in the harness | equal within 1px | hide the first column; the offset follows | The create row is not aligned to a column, because there are no columns. **The anchor is the criterion's load-bearing half.** "The first column's content edge" is ambiguous between the glyph origin and the title origin, and C22 puts a reserved gutter and a variable run of glyphs between them, so the two anchors do not coincide. On D1 the create label lands at the row titles; on D4, whose rows carry an extra glyph, it lands left of them. Fix the anchor before the census, or the number cannot fail informatively |
| AC-24 | Touch target box of the group toggle and the row checkbox at phone width | at least 44 by 44 CSS px | shrink the viewport further; the box holds | Nothing measured yet |
| AC-25 | Focus ring visible on every interactive element introduced, implemented as `box-shadow` | visible, and no bare `outline: none` | remove the ring; the check fails | Nothing measured yet |
| AC-26 | Operator confirms on device that the list view changed | confirmed | — | The evidence that release 1.3.1 lacked. Nothing substitutes for it |

### Provenance

| Number | Produced by | Phase | Status |
|---|---|---|---|
| Every "today" cell in `checklist.md` | the census, `verify-placement.mjs` | 000 | **blank — nothing measured yet** |
| `db-list-group-new` and `db-list-row-checkbox` selector counts | static count against `styles.css` | already measured | **0 and 0** |
| The eleven guard sites | read from `database-view.ts` | already measured | recorded in `spec.md` §4.1 and `plan.md` §3 |
| Every ClickUp-sourced target shape | the four desktop captures at `../context/clickup/list-view/`, then `reference-clickup-list-operator.png`, then the Mobbin screens | already measured | recorded in `spec.md` §4.2, with `spec.md` §4.2.1 listing what the captures cannot establish. The captures supply the **shape**; the token scale supplies the **value**, and no number is read off any image |
| Table bench baseline | `npm run bench` | 000, task T1.7 | blank |
| Contrast values | computed-style probe | 000 for the baseline, 002 for the result | blank |

**No number here may be invented.** A criterion whose "today" cell is blank is *blocked*, not merely
unmet, and the phase that would fix it may not start.

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

This packet closes when every criterion above has a recorded failing measurement, a recorded passing
measurement, and a negative control that moved. AC-26 is not optional and is not satisfiable by any
harness: a person opens the plugin and says the screen changed.

A phase that reports all-green while its "today" column is blank has not been verified. It has been
asserted.

<!-- /ANCHOR:closure -->
