---
title: "Feature Specification: Phase 6: Record Detail Sheet and Menu Cards Redesign"
description: "Redesign the record detail sheet and menu-card popovers (cell action bar, dropdown menus) against their mapped reference."
trigger_phrases:
  - "071 phase 6"
  - "record detail sheet and menu cards redesign"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 6: Record Detail Sheet and Menu Cards Redesign

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Redesign the record detail sheet and menu-card popovers (cell action bar, dropdown menus) against their mapped reference.

**Key Decisions**: This phase does not start until Phase 1's inventory names this sheet family's reference mapping.

**Critical Dependencies**: `001-sheet-story-coverage-audit` — its reference mapping row for this sheet family.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Draft — blocked on Phase 1 |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 6** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: Redesign the record detail sheet and menu-card popovers (cell action bar, dropdown menus) against their mapped reference.

**Dependencies**: `001-sheet-story-coverage-audit` must name this sheet family's reference mapping before redesign work starts.

**Deliverables**:
- Before/after capture of each sheet in this family against its mapped reference
- Redesigned layout matching that reference as closely as the plugin's own token ladder allows

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The record detail sheet and menu-card popovers (the cell action bar named in roadmap row 65, dropdown menus from 052/063) were each fixed against individual reports rather than a single reference pass.

### Purpose
This sheet family's layout, spacing and control styling match its mapped Notion/Anytype reference as closely as the plugin's own token ladder allows.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The record detail sheet's full layout
- Menu-card popovers: the cell action bar and dropdown menus reached from a cell or row

### Out of Scope
- Any other sheet family (tracked in this packet's other phases)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Sheet source(s) for this family (named once Phase 1's inventory identifies the exact files) | Modify | Reference-driven redesign |
| `styles.css` | Modify | Layout/spacing rules for this sheet family |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read Phase 1's reference mapping for this sheet family before any redesign work starts |
| REQ-002 | Redesign this sheet family to match its mapped reference |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | Recapture every sheet in this family and record a before/after comparison |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A side-by-side capture shows each sheet in this family visually converged on its reference
- **SC-002**: No regression on any prior fix already shipped to a sheet in this family
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase 1's reference mapping | Cannot start without a named reference | Blocked explicitly until Phase 1 closes |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

Not detailed at scaffold time — blocked on Phase 1's reference mapping.

## 8. EDGE CASES

Not detailed at scaffold time, for the same reason.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Unscored | Depends on Phase 1's findings |

## 10. RISK MATRIX

Not detailed at scaffold time — see §6.

## 11. USER STORIES

- As the operator, I want this sheet family to feel like Notion/Anytype's own equivalent surface

## 12. OPEN QUESTIONS

- Which reference does Phase 1 map to this sheet family, and does the operator have a preference where Notion and Anytype disagree
<!-- /ANCHOR:questions -->

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE — Record detail sheet & menu cards vs Notion/Anytype references

Source surfaces: the record detail sheet, producer `src/views/record-detail-panel.ts:172` (inventory row, `../001-sheet-story-coverage-audit/inventory.md:47`; the peek rides the same grammar, `inventory.md:48`), and the record-detail's own menu-card children — the select value, date, relation, colour and column-menu stacked pairs the sheet-grammar pair registry mounts (`inventory.md:120–125`; the nearest reference family for the menus themselves is Notion's database block-menu pair, `inventory.md:94`). Inventory first-read gap: Anytype's mobile cell sheets are the closest reference family for per-property editing inside a record surface, ours edits in place within one sheet, and the docked placement variant has no reference either side.

The reference captures (`screenshots/notion/ios/harvest.json`, the Anytype images) carry filenames only — no dimensions, and no image-viewing exists in this harness — so the reference columns stay honest `TBD` (the settings leg's D-005, inherited); the Target column carries the operator's Notion-shape directives, which the lane asserts and this implementation proves. Current numbers are the record sheet as it renders today, measured by the sheet-grammar lane.

| Element | Current (measured, pre-edit) | Notion (ref) | Anytype (ref) | Target (Notion-shaped) | Green (measured, post-edit) |
|---------|-------------------------------|--------------|---------------|------------------------|-----------------------------|
| Header | 44×44 close, title ≥16px, handle-to-title 18.4px band (lane) | full-height iOS push, its own header hierarchy | TBD | Keep 44×44 close, 16px title (the settings leg's grammar) | unchanged, PASS |
| Row pitch | 21/21 property rows at 61.0px (last 60.0): a 44px floor counted in a content-box assumption, plus the row's own padding and hairline | dense property list, one property per row | TBD | 44–52px, one property per row | 21/21 at 44.0px |
| Label / value layout | label left / value right, one line, 96px label column (phone rules already shipped) | label left, value right, single column | one property per row, label left, value right | Single-column rows, label left / control right | 21/21 label-beside-value on one line |
| Dividers | 1px hairline under every row but the last, at the faint step; the section headings sat 13px in with NO divider | 0px | section groups under a hairline | Section headings on the shared inset behind a 1px divider; hairline under every property row but the last | 16.0px + 1px; hairlines 20/20, last bare |
| Section grouping | disclosure's shown/hidden headings: 13.0px, 0px divider | TBD | uppercase faint step, reference-styled | Shared-inset heading with a 1px divider, spacing wider than the rows' own | 1/1 at 16.0px/1px |
| Selects | 0 native selects; the sheet's own stacked dropdown pairs | sheet-native menus, never an OS picker | Anytype's cell sheets are the own-picker family | Selects render as the plugin's own sheet-native picker | 0 native; the 16 stacked pairs' option rows all 44.0px |
| Toggles | n/a — the record sheet renders no switch; its controls are value editors (the checkbox value renders inline) | switch rows inside the 44px window | TBD | 44px touch target | 44px floor, lane-proven |
| Horizontal padding | labels 25.0px from the surface's content edge (1px border + 12px panel + 12px row) | one consistent gutter | TBD | Consistent 16px, one value for rows, headings, note | 16.0px, measured from the content edge |
| Typography | label 14px/1.4, value 16px/1.35, inside the token ladder | reference density | TBD | Within the token ladder, no new tokens | unchanged |
| Surface height / overflow | 50svh floor, 90svh cap; extent 401 ≤ 401 at 402px | full-height push | TBD | Flush sheet retained; no horizontal overflow at 402px (scrollWidth − 1px left border == clientWidth) | extent 401 ≤ 401, unchanged |
| Menu-card popovers | 44px option-row floor, 16px option inset, hairline dividers between rows (inherited from the family's landed rulings) | database block-menu: anchored card, tight rows | Anytype's assignee/option sheets: full-width rows | ≥44px rows on the family's own option and menu children | 4/4 record stacked pairs that mount option rows report 44.0px floors (3–16 rows each); the date and relation editors' grids are not option rows and report none |

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Depends on**: `../001-sheet-story-coverage-audit/`
