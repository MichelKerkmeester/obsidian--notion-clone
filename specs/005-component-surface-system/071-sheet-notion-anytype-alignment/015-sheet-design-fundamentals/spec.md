---
title: "Feature Specification: Phase 15: Sheet Design Fundamentals"
description: "The two cross-sheet findings from the sk-design-fundamentals review that no single child owns: a shared 24px touch target and a missing screenshot scenario."
trigger_phrases:
  - "071 phase 15"
  - "sheet design fundamentals"
  - "calendar mini nav touch target"
  - "group sheet screenshot scenario"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 15: Sheet Design Fundamentals

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

`../sheet-design-review.md` is a `sk-design-fundamentals` pass over the nine 2026-09-09/10 sheet
landings, opened by the operator's 2026-09-10 ruling: *"double check all sheet work, use sonnet
5xhigh through claude2 and give them the sk-design-fundamentals skill and check it based on those
design fundamentals."* Most of its findings belong to a single existing child and were appended
there as `### Design-review follow-ups (2026-09-10)`. Two do not, because the surface or the gap
they name is shared across more than one sheet family rather than owned by the leg that built any
one of them: the mini-calendar's month-navigation control (used by the date picker, the sort
sheet's calendar-empty state, and the filter's date-value picker) sits at a fixed 24×24px touch
target with no coarse-pointer floor raise, and the toolbar's Group-by sheet — redesigned by `012` —
has no screenshot scenario registered anywhere in the capture harness, so no design review (this
one included) has ever looked at a picture of it.

**Key Decisions**: Both items are additive — a CSS floor raise and a new capture scenario — and
touch no producer's row model, order or copy. Neither reopens a landed ruling.

**Critical Dependencies**: None blocking. Independent of `007`/`008`/`011`/`013`'s own follow-ups.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Draft — scaffolded 2026-09-10, not implemented |
| **Created** | 2026-09-10 |
| **Branch** | `worktrees/284-sheet-design-review` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 15** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-design-review.md` under the operator's 2026-09-10 ruling.

**Scope Boundary**: `.obnotion-calendar-mini-nav`'s touch-target floor (`styles.css`) and the
Group-by sheet's screenshot coverage (`tools/screenshots/scenarios/panels.mjs` or the nearest
existing sheet-scenario file). Not any producer's row model, copy or order — those belong to the
children the review already appended to.

**Dependencies**: None blocking.

**Deliverables**: a coarse-pointer floor on the calendar's month-navigation control matching its
sibling icon-only controls, and a registered `group` capture scenario (light + dark, mobile) that a
future design review can actually open and look at.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-015-sheet-design-fundamentals.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Two findings from `../sheet-design-review.md` have no single owning child. Filing the touch-target
fix under any one of the three sheets that use the control would make that child's scope statement
wrong (it uses a control it does not own). Filing the missing scenario under `012` — the leg that
last redesigned the group sheet's content — would misdescribe a coverage gap as if it were a defect
in that leg's own work, when the gap is that no leg, including `012`, ever registered the capture.

### Purpose
Both cross-sheet findings land in one small, additive child so they are fixed (or, for the
scenario, made reviewable) without retroactively rewriting another child's already-closed scope.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Raise `.obnotion-calendar-mini-nav`'s coarse-pointer touch-target floor to match its sibling
  icon-only controls (`.obnotion-source-rule-icon-button`, `.obnotion-row-insert-button`,
  `.obnotion-timeline-mobile-menu-button`, all raised to 28px in the same media-query block)
- Register a `group` capture scenario depicting the toolbar Group-by sheet, light and dark, mobile,
  with at least one hidden group so the Shown/Hidden partition and its bulk actions are visible

### Out of Scope
- Any change to a sheet's row model, copy or control order — those are `007`'s, `008`'s, `011`'s
  and `013`'s own `### Design-review follow-ups (2026-09-10)` sections
- The Properties sheet's 34px row height — recorded as Proposed ADR-D in `../roadmap.md` §7, not
  opened as a task by this child or any other
- Raising the calendar control's floor to the full 44px thumb target rather than the 28px
  dense-pointer floor — recorded as an option in the review (F-5); this child's own requirement
  below sets the floor at 28px to match its siblings exactly, and names 44px as an escalation the
  operator may prefer

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `styles.css` | Modify | Add `.obnotion-calendar-mini-nav` to the coarse-pointer floor-raise block (`styles.css:24462-24486`) |
| `tools/live/touch-targets.mjs` or `tools/live/sheet-grammar.mjs` | Modify | RED-first assertion for the floor raise |
| `tools/screenshots/scenarios/panels.mjs` (or the file housing `sort-panel`/`filter-panel`'s own scenario entries) | Modify | Register the `group` scenario |
| `screenshots/manifest.json`, the new `group-mobile-{light,dark}.png` pair | Add | The capture itself |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-001 | `.obnotion-calendar-mini-nav` measures ≥28×28px under `@media (pointer: coarse)`, matching its three sibling icon-only controls in the same block |
| REQ-002 | A `group` scenario exists in the capture harness, registers at least one light and one dark mobile capture, and its `sources` list names `toolbar-renderer.ts` |
| REQ-003 | No regression on any landed sheet clause, both engines |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The calendar nav control's floor-raise clause is RED on the unmodified tree and GREEN after the fix
- **SC-002**: The `group` scenario's capture exists and has been opened and looked at (light and dark) — the outstanding item `../sheet-design-review.md` §0 and F-7 name
- **SC-003**: No regression on any landed sheet clause
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Raising the calendar nav's touch target could shift adjacent layout (the `‹ August 2026 ›` row's centring) | A cosmetic regression in a control the review otherwise called out for being too small | Expand via `min-width`/`min-height` the same way the three sibling controls already do (styles.css:24471-24485), not by growing the visual glyph |
| Risk | The `group` scenario may need a fixture that mounts the toolbar with a hidden group, which no existing fixture builder provides | Scope creep into fixture-building territory | Reuse the nearest existing panel-sheet fixture pattern (`sort-panel`, `filter-panel`) rather than inventing a new mount path |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- Every change is presentational or coverage-only. No control's behavior changes, no row's data changes.

## 8. EDGE CASES

- A picker with only one month reachable (a bounded date range) still needs the same touch target on whichever chevron remains enabled.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Low | One CSS rule, one scenario registration |
| Risk | Low | Additive, no producer logic touched |
| Research | Low | The review already did the reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Layout shift from the floor raise | Low | Low | `min-width`/`min-height`, not `width`/`height` |
| Scenario fixture scope creep | Low | Low | Reuse an existing panel-sheet fixture pattern |

## 11. USER STORIES

- As the operator, I want the sheets the design review could not verify visually to become verifiable, so the next review is not blocked by the same gap.

## 12. OPEN QUESTIONS

- Should `.obnotion-calendar-mini-nav` go to 28px (matching its siblings) or 44px (matching the thumb floor `interaction-craft.md` names for a full-bleed phone sheet)? Default: 28px, to match the pattern already established for the sibling controls in the same media-query block; the operator may rule for 44px instead.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Review**: `../sheet-design-review.md` §6 F-5, §9 F-7
- **Predecessor**: `../014-sheet-polish/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE

Not a Notion-parity gap table — this child carries no Notion-comparison rows, since neither finding
is a Notion-alignment question. See `../sheet-design-review.md` for the fundamentals citations.

| Property | Current (ours, measured) | Target |
|---|---|---|
| `.obnotion-calendar-mini-nav` touch target | 24×24px, no coarse-pointer override (`styles.css:17396-17409`) | ≥28×28px under `@media (pointer: coarse)`, matching `.obnotion-source-rule-icon-button` / `.obnotion-row-insert-button` / `.obnotion-timeline-mobile-menu-button` |
| Group sheet capture coverage | 0 dedicated scenarios; `001/inventory.md` line 46 records its capture list as five unrelated toolbar captures | ≥2 (light + dark, mobile), `sources` naming `toolbar-renderer.ts` |
<!-- /ANCHOR:gap-table -->
