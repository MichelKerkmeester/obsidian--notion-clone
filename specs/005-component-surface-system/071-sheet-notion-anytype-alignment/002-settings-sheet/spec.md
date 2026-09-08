---
title: "Feature Specification: Phase 2: Settings Sheet Redesign"
description: "Redesign the database Settings sheet's UI/UX against its mapped Notion/Anytype reference, closing the operator's R5 report."
trigger_phrases:
  - "071 phase 2"
  - "settings sheet redesign"
  - "r5 settings sheet ui ux"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 2: Settings Sheet Redesign

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The operator reports the database Settings sheet "has really bad ui" (R5) and, more broadly, that all sheets should mimic Notion's own presentation more closely. This phase takes the Settings sheet specifically, against whatever reference Phase 1's audit mapped to it.

**Key Decisions**: This phase does not start until Phase 1's inventory names the Settings sheet's reference mapping.

**Critical Dependencies**: `001-sheet-story-coverage-audit` — its reference mapping row for the Settings sheet.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft — blocked on Phase 1 |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 2** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: The database Settings sheet only (the sheet reached from the view's gear/settings affordance) — not the view-config sheet's own sub-panels tracked separately in Phase 4.

**Dependencies**: `001-sheet-story-coverage-audit` must name this sheet's reference mapping before redesign work starts.

**Deliverables**:
- Before/after capture of the Settings sheet against its mapped reference
- Redesigned layout, spacing, row grammar and control styling matching that reference as closely as the plugin's own token ladder allows

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator reports the Settings sheet's UI/UX is bad, without naming a specific defect — a whole-surface judgement rather than a single bug, in the pattern of prior whole-surface calls (row 63's calendar gestalt judgement, `roadmap.md` §4). Prior fixes to this sheet (`054` T072, roadmap row 66) corrected specific row-grammar and overflow bugs but did not attempt a reference-driven redesign of the whole surface.

### Purpose
The Settings sheet's layout, spacing, row grammar and control styling match its mapped Notion/Anytype reference as closely as the plugin's own token ladder allows, and the operator's whole-surface judgement is answered with a before/after comparison rather than another point fix.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The Settings sheet's full layout against its Phase-1-mapped reference: spacing, row grammar, section grouping, control styling
- Any row-level defect the reference comparison surfaces that prior point fixes (`054` T072) did not cover

### Out of Scope
- The view-config sheet's title-field/title-format sub-panel (058, and Phase 4 of this packet)
- Any other sheet family (tracked in Phases 3, 5, 6)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Settings sheet view/panel source (named once Phase 1's inventory identifies the exact file) | Modify | Reference-driven redesign |
| `styles.css` | Modify | Layout/spacing/row-grammar rules for the Settings sheet |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read Phase 1's reference mapping for the Settings sheet before any redesign work starts |
| REQ-002 | Redesign the Settings sheet to match its mapped reference's layout, spacing and row grammar |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | Recapture the Settings sheet and record a before/after comparison |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A side-by-side capture shows the redesigned Settings sheet visually converged on its reference (measured spacing/layout, not a subjective read)
- **SC-002**: No regression on the row-grammar and overflow fixes `054` T072 already shipped
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase 1's reference mapping | Cannot start a reference-driven redesign without a named reference | Blocked explicitly in METADATA/Status until Phase 1 closes |
| Risk | The plugin's own token ladder (11/12/13/16/22, per `roadmap.md` §4 row 3) may not have a step matching the reference exactly | A pixel-perfect match may not be achievable without a token change outside this phase's scope | Match as closely as the existing ladder allows; record any gap as a follow-on rather than minting a new token silently |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

Not detailed at scaffold time — this phase is blocked on Phase 1's reference mapping; NFRs will be added once the target reference is known.

## 8. EDGE CASES

Not detailed at scaffold time, for the same reason.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Unscored | Depends on Phase 1's findings |
| Risk | Unscored | Depends on Phase 1's findings |
| Research | Unscored | Depends on Phase 1's findings |

## 10. RISK MATRIX

Not detailed at scaffold time — see §6 RISKS & DEPENDENCIES for the risks known before Phase 1 completes.

## 11. USER STORIES

- As the operator, I want the Settings sheet to feel like Notion's own settings surface, so I stop noticing it as "bad ui ux" without being able to name why

## 12. OPEN QUESTIONS

- Which reference (Notion, Anytype, or a blend) does Phase 1 map to this sheet, and does the operator have a preference where they disagree
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Depends on**: `../001-sheet-story-coverage-audit/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE — Settings sheet vs Notion/Anytype references

Source surface: Settings sheet = the view-config sheet, producer `src/views/database-view.ts:5169` (inventory row 1, `../001-sheet-story-coverage-audit/inventory.md`). Inventory first-read gap: the Notion references are full-height iOS pushes while ours is a 90svH-capped flush bottom sheet, and the two shapes have never been compared side by side ("filename read only"). Reference captures: `notion/ios/settings` (24), `notion/web/settings` (51), `anytype/mobile/sheets` (4, incl. `anytype-mobile-sheet-app-settings-dark.png` / `-light.png`), `anytype/desktop/app` (3). Manifest rows carry the measurements; the PNGs are not read directly.

Numbers below are for this sheet as it renders today, measured by the sheet-grammar lane. The reference captures (`screenshots/notion/ios/harvest.json`, the Anytype images) carry filenames only — no dimensions, and no image-viewing is available in this harness — so the reference columns stay `TBD (no numbers in the reference manifests)`; the Target column carries the operator's Notion-shape directives, which the lane asserts and this implementation proves.

| Element | Current (this sheet, measured) | Notion (ref) | Anytype (ref) | Target (Notion-shaped) |
|---------|-------------------------------|--------------|---------------|------------------------|
| Header | 44×44 close target, title ≥16px, handle-to-title 18.4px (lane) | TBD | TBD | Keep 44×44 close, 16px title; follow reference header hierarchy TBD |
| Row height / pitch | row-stacking guard: width ratio ≥0.9, stacking pitch TBD | TBD | TBD | 44–52px row pitch, one setting per row |
| Label / value layout | two-column grid remnants; rows guard fixes 0.0.31; exact column widths TBD | TBD | TBD | Single-column rows, label left / control right |
| Dividers | divider inset TBD | TBD | TBD | Section divider inset matches reference inset TBD |
| Section grouping | section headings: none asserted in lane today | TBD | TBD | Section headings present, reference-styled |
| Selects | select list overflows on the phone (0.0.30 report); guard-row fix 0.0.31; stacked dropdown pairs pass today | TBD | TBD | Select rendered as the plugin's own sheet-native picker, no overflowing native select list |
| Toggles | control: TBD | TBD | TBD | Reference-styled switch, 44px row target |
| Horizontal padding | 16px header/body inset (lane, stacked-pair child header inset ≥16px); body-side 16px: TBD | TBD | TBD | Consistent 16px horizontal padding, sheet-wide |
| Typography | title ≥16px (lane); body/label sizes TBD | TBD | TBD | Within token ladder 11/12/13/16/22 — no new tokens |
| Surface height / overflow | 90svH cap (759.6px of an 844px viewport, lane comment); no right-edge overflow (lane) | full-height iOS push | TBD | 90svH-capped flush sheet retained; no horizontal overflow at 402px (scrollWidth == clientWidth) |

<!-- /ANCHOR:gap-table -->
