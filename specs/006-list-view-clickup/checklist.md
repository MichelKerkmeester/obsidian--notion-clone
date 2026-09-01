---
title: "Verification Checklist: List View as a ClickUp-Style Grid"
description: "Criteria with the failing number recorded first, so a pass means something actually changed."
trigger_phrases:
  - "006 list view checklist"
  - "list grid verification"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: List View as a ClickUp-Style Grid

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.

A criterion closes on a number read from the census artefact or the harness output, never on a
command that was merely run. Cells reading *census* take their number from phase 000; the static
source fact beside them is why the criterion is expected to fail, not the measurement itself.

**Every row with a blank "today" cell is blocked, not merely unmet.** Two rows already carry a real
measured number and are marked as such — those two were counted directly against `styles.css` and
did not need the harness.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] ADR-001 answered by the operator — **Route B**, recorded in `decision-record.md` and re-judged
      against the four desktop captures with no change
- [ ] A check exists for **G8** that drives the production render and fails when the guard is
      converted: the title column is present **and** hosts the leading gutter and the row actions
- [ ] A check exists for **G11** that drives the production render, against a **multi-group** fixture,
      and fails when the guard is converted: a new row appears inside the group whose create
      affordance was used
- [ ] `tools/lane/css-lane.json` confirmed free before phase 001 starts
- [ ] `verify-placement.mjs` renders a list view at the production mount point
- [ ] The harness distinguishes: deleting `.db-list-group-new` moves an asserted number
- [ ] Every "today" cell below is filled
- [ ] Table bench baseline recorded for NFR-01

<!-- /ANCHOR:pre-impl -->
---

## Criteria

### Structure — phase 001

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| AC-01 | `<th>` count in an ungrouped list | *census* — the list emits no header element (`list-renderer.ts` has no header path) | visible columns plus the two named utility columns; the leading gutter's emission decided and recorded **before** the census | [ ] |
| AC-02 | Header rows in a grouped list, fixture including a zero-row group | *census* — 0 | equals group count, zero-row group included | [ ] |
| AC-03 | Rendered row-path order reverses on a header click and returns on a second | *census* — no header exists to click | reverses, then returns | [ ] |
| AC-04 | Rendered track width after a resize drag | *census* — widths are read (`column-width.ts:42`) but no handle is offered | matches within 1px | [ ] |
| AC-05 | `files` and `rollup` cells non-empty in a list | *census* — `card-field-renderer.ts` handles neither type | both non-empty | [ ] |
| AC-06 | Clipboard payload for a cell range | *census* — `database-view.ts:1597` returns early for non-table views | equals the table's | [ ] |
| AC-07 | Tab past the last cell creates a row | *census* — `database-view.ts:1816` returns early | 1 row | [ ] |
| AC-08 | Footer calculation value | *census* — the list gets the summary bar instead (`database-view.ts:6995`) | equals the table's | [ ] |
| AC-09 | Group depth for a two-field grouping | *census* — `renderList` passes one field (`database-view.ts:10313`) | 2 | [ ] |
| AC-10 | Row-click opens the detail panel and roving tabindex is active in list mode | *census* — both true today (`list-renderer.ts:254`, `:248`) and must stay true | both true | [ ] |
| AC-11 | Render time at 2,000 rows | *census* — no list baseline exists | within 20 percent of the table | [ ] |
| AC-28 | Sort-indicator instances in a grouped list, and the ordinal each carries | *census* — 0; no header exists to carry one | equals the group count, same ordinal on each | [ ] |

### Chrome — phase 002

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| AC-12 | Authored declarations applying to `.db-list-group-new` | **0** — measured, `db-list-group-new` matches zero selectors in `styles.css` while the node is emitted at `list-renderer.ts:172` | greater than 0 | [ ] |
| AC-13 | Authored declarations applying to `.db-list-row-checkbox` | **0** — measured; also recorded in `architecture-findings.md` §7 | greater than 0 | [ ] |
| AC-14 | Gap between adjacent rows, and dividers between them | *census* — rows read as separated cards | gap 0, exactly 1 divider | [ ] |
| AC-15 | Group header pill colour differs between two group values, group field carrying per-option colours | *census* — the group title is plain text (`group-label-renderer`) | two distinct colours | [ ] |
| AC-16 | Chevron, record-icon and title positions with the leading gutter empty versus occupied, on hover, focus and select | *census* — no gutter exists; `db-list-row-checkbox` has **0** CSS rules, so there is no second state to measure | identical within 1px in every state, and the checkbox box never intersects the record-icon box | [ ] |
| AC-17 | Contrast of every changed text pair, both themes | *census* | at least 4.5:1 | [ ] |
| AC-18 | Contrast of any control-identifying border | *census* | at least 3:1 | [ ] |
| AC-19 | Row heights across three densities | *census* — density is not offered for list (`view-config-panel-renderer.ts:330`) | three distinct values | [ ] |
| AC-20 | Off-scale literals introduced | 0 | 0 | [ ] |
| AC-21 | Overflow chip at a narrow width | *census* — no chip treatment exists | chip present and distinguishable from a trailing add `+`, row height unchanged | [ ] |
| AC-27 | Non-colour signals distinguishing two group headers | *census* — the group title is plain text, no glyph is emitted | at least one non-colour signal differs | [ ] |
| AC-29 | Dropdown affordance inside a `select` cell at rest | *census* — `renderStatus` emits a bare `status-badge` span (`cell-renderer.ts:430-446`) | present | [ ] |
| AC-30 | Header rows and create rows inside a zero-row group | *census* — nothing renders for the list | 1 and 1 | [ ] |

### Behaviour — phases 003 and 004

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| AC-22 | Group checkbox reflects a selection changed from the toolbar | *census* — `syncGroupedSelectionInputs` queries `.db-table` and `.db-group-divider-row` only (`database-view.ts:7566-7575`), so the list group checkbox is never resynced | reflects the change | [ ] |
| AC-23 | Create-row offset versus the first column's **leading-glyph origin**, anchor named in the harness | *census* — no columns exist to align to | equal within 1px | [ ] |
| AC-24 | Touch target box at phone width | *census* | at least 44 by 44 CSS px | [ ] |
| AC-25 | Focus ring visible, `box-shadow` not bare `outline: none` | *census* | visible on every new interactive element | [ ] |
| AC-26 | Operator confirms on device that the list changed | not confirmed | confirmed | [ ] |

### Negative controls

Each control below must move an asserted number. A control that moves nothing invalidates its
criterion, and the criterion is rewritten rather than waived.

- [ ] Delete `.db-list-group-new` — AC-12 measurement empties
- [ ] Delete `.db-list-row-checkbox` — AC-13 measurement empties
- [ ] Delete the column header — AC-03 stops responding
- [ ] Delete the leading gutter — AC-16's two measurements collapse into one and the comparison has
      nothing to compare. **This replaces "remove the record icon, the checkbox box does not move",
      which controlled a criterion whose threshold the primary evidence contradicts (ADR-004)**
- [ ] Clear the selection — AC-06 payload empties
- [ ] Collapse a group — AC-02 header count drops by one
- [ ] Give the zero-row group a row — AC-30 stays 1 and 1 while the row count moves
- [ ] Remove the sort rule — AC-28 indicator count falls to 0
- [ ] Give two groups the same value — AC-27 non-colour signals converge
- [ ] Delete the dropdown affordance node — AC-29 measurement empties

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run build` exit 0
- [ ] `npx vitest run` exit 0, test count not reduced
- [ ] `npm run lint` at or below baseline
- [ ] No ephemeral marker in any code comment: no spec path, packet or phase number, task or ADR id
- [ ] No value introduced off the token scale declared from `styles.css:32`
- [ ] Nothing copied from `external/anytype` or `external/appflowy`
- [ ] No ClickUp asset, CSS value or token scale reproduced from any reference source; no Mobbin
      image vendored. `reference-clickup-list-operator.png` is packet evidence only — not shipped in
      the plugin, not the origin of any value in the codebase. The four desktop captures under
      `../context/clickup/list-view/` are cited by path only — not moved, cropped, re-encoded or
      duplicated into this packet

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] Model-only claims tested in `vitest`; no DOM assertion added there
- [ ] Every geometry, computed-style, hit-test, focus and event claim measured in `verify-placement.mjs`
- [ ] Happy path plus one edge case per changed public surface
- [ ] No test added that merely re-asserts the framework or mirrors the implementation
- [ ] Every edge case in `spec.md` §8 has a check or a recorded deferral

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] All nine convertible guards converted; G8 and G11 confirmed unchanged
- [ ] The five other view types verified unchanged after the guard conversion
- [ ] `database-view.ts:7554` selection-sync selectors updated for any renamed list class
- [ ] Screenshot scenarios, Storybook stories and the surface-contract test updated for any renamed class
- [ ] F19 fixed and covered by AC-22
- [ ] Every P1 task either closed or deferred with a recorded reason

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] `implementation-summary.md` written after implementation, with final state and validation evidence
- [ ] Open questions in `spec.md` §12 answered or explicitly carried forward. Q1, Q2, Q5, Q6 and Q7
      are answered; Q3 and Q4 still need the operator
- [ ] `README.md` and `STORYBOOK.md` updated only if a documented surface changed

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:summary -->
## Verification Summary

- [ ] Every criterion has a non-empty "today" cell
- [ ] Every criterion has a passing measurement
- [ ] Every negative control moved a number
- [ ] `styles.css` lane released against all four conditions
- [ ] Captures recaptured, `screenshots:verify` exit 0, and **reviewed by a human, signed off here by name:** `________________`
- [ ] AC-26 closed — the operator looked at the running plugin and confirmed the change
- [ ] `validate.sh specs/006-list-view-clickup --strict` reports `RESULT: PASSED`

<!-- /ANCHOR:summary -->
