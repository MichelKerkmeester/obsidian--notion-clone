---
title: "Feature Specification: Phase 3: Add-Property Sheet Redesign"
description: "Fix the property-type picker sheet's keyboard-overlap defect and redesign it against its mapped reference (R6)."
trigger_phrases:
  - "071 phase 3"
  - "add-property sheet redesign"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 3: Add-Property Sheet Redesign

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Fix the property-type picker sheet's keyboard-overlap defect and redesign it against its mapped reference (R6).

**Key Decisions**: This phase does not start until Phase 1's inventory names this sheet family's reference mapping.

**Critical Dependencies**: `001-sheet-story-coverage-audit` — its reference mapping row for this sheet family.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Implemented — 2026-09-08 (see acceptance-criteria.md's evidence block) |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 3** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: Fix the property-type picker sheet's keyboard-overlap defect and redesign it against its mapped reference (R6).

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
The operator's R6 screenshot shows the property-type picker (Select, Multi-select, Status, Formula, Relation, Rollup, Files, and the four timestamp/user types) rendering as a tall sheet that covers the note header while the keyboard is up — a layout defect distinct from any prior sheet-family fix.

### Purpose
This sheet family's layout, spacing and control styling match its mapped Notion/Anytype reference as closely as the plugin's own token ladder allows.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Fixing the keyboard-overlap defect: the sheet must not cover the note header while the keyboard is open
- Redesigning the property-type picker's list/grid layout against its mapped reference

### Out of Scope
- Any other sheet family (tracked in this packet's other phases)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/modals/create-property-modal.ts` | Modify | Reference-driven redesign (named by 001's inventory row 2: producer of the add-property / property-type-picker family) |
| `styles.css` | Modify | Layout/spacing rules for this sheet family |

### 4b. Reference Gap Table (recorded at leg start, 2026-09-08)

Sources. **Current**: the grammar's `properties create property` stacked-pair lane as it runs in this worktree (390×844, both engines) and the landed `styles.css`/producer read. **Reference**: 001's inventory row 2 mapping — Notion `notion/ios/database` (properties-01/02, +13), Anytype `anytype/desktop/app` (filter-property-picker, newobject-type-picker, +1) and `anytype/mobile/app` (space-typeslist, +2). The reference harvests carry no pixel measurements (`screenshots/notion/ios/harvest.json` rows are id/url/mobbin-link only), so the reference column records what the 053 digest read at filename level, and the Target column carries the operator's quantified bands for this leg. The inventory also records that no pixel reference covers our absorbed replace-in-place shape, so the targets govern the row grammar, not a photographed composite.

| Element | Current (measured / landed) | Notion reference | Anytype reference | Target (this leg) |
|---------|-----------------------------|------------------|-------------------|-------------------|
| Sheet vs note header, keyboard up | Keyboard inset rides the host `--keyboard-height` variable; no note-header relationship is measured anywhere in the harness (page body is bare — no note-header fixture exists) | sheet clears the note's header while the keyboard is up | (modal type grid; no keyboard read) | Sheet top ≥ note-header bottom (44px fixture) with a 336px keyboard, proven through the visualViewport device path, not the host variable; sheet height ≤ viewport − 336 − 44 |
| Type list | Absorbed trigger: a closed dropdown field; choosing a format replaces the create panel in place (the `property-type-picker` / `-replaced` constructed captures). 0 list rows in the create surface | property-type rows, icon + label (properties-01/02 read; relation ↗ icon noted for the icon set) | modal type grid; space-typeslist | The 21 formats as inline scrollable rows in the create surface, 44–52px pitch, each icon + label, the list scrolling inside the sheet's existing 90svH cap |
| Name field | First form row, styled like the key row; unrelated to any list | the name step precedes the type list | (type grid has none) | Pinned above the list: input bottom ≤ list top, and it does not scroll with the list |
| Row height | n/a in this surface (its options live on the replaced surface) | ~44px rows | (grid tiles) | 44–52px pitch, no gaps |
| Header | Conforms already: title ≥16px, close ≥44×44, header inset ≥16px, handle→title 18.4px, one opaque #2E2E2E fill, exactly one visible close | (full-height pushes; n/a) | titled | Keep; the grammar's existing rows continue to enforce it |
| Label/value layout | label above control (`.obnotion-modal-row`) | value rows | — | unchanged outside the type list |
| Dividers / section grouping | none in the create modal; our format ladder groups Basic/Options/Advanced for the column-menu submenu | (properties-01 shows a plain list + "+ New property" footer) | (modal grid) | one flat list; the grouping stays the column-menu's own concern (decision recorded) |
| Selects / toggles | trigger + replace-in-place; the trigger's search input | none on this surface | — | inline selection; the trigger and its search retire with the absorbed shape |
| Padding | header inset ≥16 (shell); body padding from `.obnotion-modal`; the global overflow sweep runs 390px only | 16px-scale insets | — | 16px horizontal padding, asserted at the rows; no horizontal overflow re-asserted at 402×874 |
| Typography | title ≥16px; control text = `.obnotion-modal` ladder | — | — | unchanged; one 11px reason line under a disabled format's label |
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

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Depends on**: `../001-sheet-story-coverage-audit/`
