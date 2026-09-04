---
title: "Verification Checklist: Phase 002 — ClickUp Chrome"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Chrome criteria against the numbers phase 000 recorded, the negative-control register, and the four lane-release conditions with a named signature."
trigger_phrases:
  - "006 phase 002 checklist"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Verification Checklist: Phase 002 — ClickUp Chrome

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`.

A criterion closes on a number read from the harness, never on a command that was merely run. Two
rows below already carry a real measured number: both were counted directly against `styles.css` and
did not need the harness.

**Every row with a blank "today" cell is blocked, not merely unmet.**

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] Phase 001 landed; the structure is frozen for this phase
- [ ] The lane is held by this packet, inherited from 001
- [ ] Every "today" cell below is filled from the 000 census
- [ ] ADR-P2-01 and ADR-P2-02 recorded as open, and no criterion here depends on either
- [ ] The chip-treatment evidence re-examined at full resolution before `FR-22`'s criterion is written

<!-- /ANCHOR:pre-impl -->
---

## Criteria

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| AC-12 | Authored declarations applying to the per-group create button | **0** — measured, `db-list-group-new` matches zero selectors in `styles.css` while the node is emitted | greater than 0 | [ ] |
| AC-13 | Authored declarations applying to the row checkbox | **0** — measured | greater than 0 | [ ] |
| AC-14 | Gap between adjacent rows, and dividers between them | *census* — rows read as separated cards | gap 0, exactly 1 divider | [ ] |
| AC-15 | Group pill colour differs between two values, group field carrying per-option colours | *census* — the group title is plain text | two distinct colours | [ ] |
| AC-16 | Chevron, glyph and title positions, gutter empty versus occupied, in hover, focus and select | *census* — no gutter exists; the checkbox has 0 CSS rules, so there is no second state to measure | identical within 1px in every state, and the boxes never intersect | [ ] |
| AC-17 | Contrast of every changed text pair, **both themes** | *census* | at least 4.5:1 | [ ] |
| AC-18 | Contrast of any control-identifying border | *census* | at least 3:1 | [ ] |
| AC-19 | Row heights across three densities | *census* — density is not offered for list | three distinct values | [ ] |
| AC-20 | Off-scale literals introduced | 0 | 0 | [ ] |
| AC-21 | Overflow chip at a narrow width | *census* — no chip treatment exists | chip present, distinguishable from a trailing add `+`, row height unchanged | [ ] |
| AC-27 | Non-colour signals distinguishing two group headers | *census* — the group title is plain text, no glyph is emitted | at least one non-colour signal differs | [ ] |
| AC-29 | Dropdown affordance inside a `select` cell **at rest** | *census* — the status renderer emits a bare badge span with the option text and nothing else | present | [ ] |

### Negative controls — each must move an asserted number

- [ ] Delete the per-group create button — AC-12 measurement empties
- [ ] Delete the row checkbox — AC-13 measurement empties
- [ ] Delete a row — AC-14 divider count drops by one
- [ ] Give two groups the same value — AC-15 colours converge, AC-27 signals converge
- [ ] Delete the leading gutter — AC-16's two measurements collapse into one and the comparison has
      nothing to compare. **This replaces "remove the record icon, the checkbox box does not move",
      which controlled a criterion whose threshold the primary evidence contradicts**
- [ ] Raise the background lightness — AC-17 and AC-18 ratios fall
- [ ] Set all three densities the same — AC-19 heights converge
- [ ] Introduce an off-scale literal deliberately — AC-20 count rises
- [ ] Widen the viewport — AC-21 chip disappears
- [ ] Delete the dropdown affordance node — AC-29 measurement empties

**A control that moves nothing invalidates its criterion, and the criterion is rewritten rather than
waived.**

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] `npx tsc --noEmit` exit 0, output read without a pipe
- [ ] `npm run lint` at or below the existing baseline
- [ ] No literal colour, spacing, radius or duration introduced outside the token scale
- [ ] No structural change. The structure is 001's and is frozen here
- [ ] No code or stylesheet comment carries a spec path, packet number, phase number, task id, ADR id
      or requirement id
- [ ] Computed winner recorded before and after for **every** duplicated selector touched
- [ ] No slot, affordance or row-grammar column reserved for subtasks

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] `npx vitest run` exit 0, test count not reduced
- [ ] `npm run story:smoke` — list stories render at production mount points
- [ ] `npm run bench` — `NFR-01` still within 20 percent. A chrome regression is still a regression
- [ ] No check added per token or per selector — that mirrors the implementation and asserts the
      stylesheet against itself

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] No criterion asserts edit-mode chrome — no capture shows an edit state
- [ ] No criterion asserts that a collapsed group keeps its header row — no capture shows one
- [ ] No criterion treats the divider's invisibility in the captures as evidence of absence
- [ ] No criterion claims the row's leading glyph encoding is copied rather than chosen
- [ ] No number in this phase was read off any capture

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:docs -->
## Lane Release — four conditions, in order

- [ ] **1.** Full recapture at four widths, **both themes**, then `screenshots:verify` exit 0. A
      partial recapture cannot satisfy it
- [ ] **2.** **Human capture review, signed off by name:** `____________________` on `__________`.
      The manifest check never opens an image. This is the visual gate and it is not optional
- [ ] **3.** Every duplicated selector touched has its computed winner recorded before and after
- [ ] **4.** `005`'s live-verification phase re-asserted against the released tree
- [ ] Lane released; `css-lane.json` records it

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Question | Answer |
|---|---|
| Did every negative control move? | must be **yes** |
| Do the two zero-rule affordances now have rules applying at the production mount point? | must be **yes** |
| Does revealing the gutter move the chevron, glyph or title? | must be **no** |
| Are two group values distinguishable without colour? | must be **yes** |
| Did contrast pass in **both** themes? | must be **yes** |
| Did a named human look at the images? | must be **yes**, before release |
| Was the lane released on a manifest pass alone? | must be **no** |

<!-- /ANCHOR:summary -->
