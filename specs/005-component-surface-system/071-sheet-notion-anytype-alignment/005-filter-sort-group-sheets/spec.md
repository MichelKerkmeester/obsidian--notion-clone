---
title: "Feature Specification: Phase 5: Filter, Sort and Group Sheets Redesign"
description: "Redesign the filter, sort and group sheets against their mapped reference, closing the freeze-prone history these sheets carry (roadmap rows 21-23, 026)."
trigger_phrases:
  - "071 phase 5"
  - "filter, sort and group sheets redesign"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 5: Filter, Sort and Group Sheets Redesign

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Redesign the filter, sort and group sheets against their mapped reference, closing the freeze-prone history these sheets carry (roadmap rows 21-23, 026).

**Key Decisions**: This phase does not start until Phase 1's inventory names this sheet family's reference mapping.

**Critical Dependencies**: `001-sheet-story-coverage-audit` — its reference mapping row for this sheet family.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Implemented — pending the operator's own device recheck |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 5** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: Redesign the filter, sort and group sheets against their mapped reference, closing the freeze-prone history these sheets carry (roadmap rows 21-23, 026).

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
The filter, sort and group sheets have a history of freezing on add/close (roadmap §4 rows 21-23, fixed in 85ff504) and have not been redesigned against a single reference since.

### Purpose
This sheet family's layout, spacing and control styling match its mapped Notion/Anytype reference as closely as the plugin's own token ladder allows.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The filter sheet's Add condition control and row layout
- The sort sheet's Add sort control and row layout
- The group sheet's layout

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

<!-- ANCHOR:gap-table -->
## 4b. REFERENCE GAP TABLE (Phase 1 mapping, measured 2026-09-08)

REQ-001 evidence — the Phase 1 mapping rows this redesign cites (001's `inventory.md`, this packet's frozen reference):

- **filter-panel** — inventory row 45, `src/views/database-view.ts:5183` (variant rows 62, 65): reference `notion/ios/menus` (1: notion-ios-menus-filters-15) + `notion/ios/database` (9: notion-ios-database-filters-01/02 +7); Anytype `anytype/desktop/app` (anytype-filter-property-picker-dark.png).
- **sort-panel** — inventory row 44, `src/views/database-view.ts:5211` (variant rows 63, 66): reference `notion/ios/database` (10: notion-ios-database-sort-01/02 +8) + `notion/ios/states` (group-by-12); Anytype `anytype/desktop/app` (anytype-view-settings-panel-dark.png).
- **group panel** — inventory row 133, "group by dropdown — stacked over toolbar"; the panel itself is the toolbar's Group sheet (`toolbar-renderer.ts` `renderGroupPopover`, `.obnotion-group-popover`); reference: none at filename level (row 133) — the settings-sheet grammar (002) is the shaping authority, with `notion-ios-states-group-by-12` the nearest Notion state.

The third-party captures carry no measurement manifests (002's recorded finding — harvest provenance only), so the Notion/Anytype numbers below are the operator's directive (R5, 2026-09-08: "all sheets should mimic notion way closer") as 002 already operationalised it: single-column rows, one setting per row with label left / control right, 44–52px pitch, 16px inset, 1px section divider inset 16px (first-of-type 0px), the plugin's own sheet-native picker, no horizontal overflow at 402px (extent = scrollWidth − 1px left border == clientWidth). Current numbers are this worktree's declarations/measurements at the cited lines; the lane's RED run below replaces each with a live measurement before the fix.

| Element | Current (this worktree, evidence) | Notion (iOS) | Anytype | Target (gap closes to) |
|---|---|---|---|---|
| Header | Shared shell header, title + 44×44 close; header block 66–76px — conforming, asserted by the lane | Full-bleed sheet title, large title, trailing close | View-settings panel: titled, boxed | Keep; no gap (009 T26's header work) |
| Row height / pitch | Condition controls 28px inside 2px-padded rows, 6px gaps/margins (`styles.css` §21 :13259–13347); 44px `min-height` only while a `.obnotion-container` ancestor exists — lost when the sheet is portalled | 44–52pt setting rows | List rows ~44pt | 44–52px pitch, compact rows 48px, controls 44px minimum, portalled or not |
| Label / value layout | One condition row packs 3–4 controls inline (field + operator + value + trailing, `createConditionRow`); desktop floors (:140px/:120px) explicitly excluded from the sheet (`:not(.obnotion-mobile-bottom-sheet)`, :13449) | One setting per row: label left, control right | Settings rows: label left, control right | Single-column rows; each control owns its line at the sheet's full inset-to-inset width; label left / control right where a row has both |
| Dividers | Group section titles: 1px `--background-modifier-border` directly (:11747), not the family's subtle-token ladder, so no 40% mix and no tokenless-host fallback; filter/sort: none | 1px hairline opening each section | Hairline dividers | 1px divider on the subtle token with the #333333 fallback (002's), inset 16px, first-of-type 0px |
| Section grouping | Group panel: 2 sections (options / group-by), titles 11px/700, padding 12px 8px 0 (:11753) — 8px inset; filter/sort: no sections | Sectioned list, heading on the rows' inset | Sectioned | Heading + divider sit on the same 16px inset the rows use; first title 0px inset |
| Selects | All pickers already the plugin's own `createDropdownField` (sheet-native); the `<select>` rule at :13347 is vestigial (no native select in these panels' markup) | Native-ish disclosure rows, never overflowing native lists | Own pickers | Selects = the plugin's own sheet-native picker; lane asserts `select` count 0, no overflow |
| Toggles | Group switch rows: 22px/1fr/auto grid, switch `justify-self: end` (:11798) — control right, row min-height 28px | Switch at row's right, 44pt row | Switch right | Control right; row clears the 44px floor |
| Horizontal padding | Inconsistent: filter sheet 16px (:13036), sort sheet 8px when floating (:13051), group popover 8px (:11568) | Uniform inset | Uniform | 16px (var(--obnotion-sheet-inset)) on all three, in the portalled sheet state |
| Typography | Rows 12px, group titles 11px/700 (token ladder) | Untyped (no manifest) | Untyped | Keep the token ladder — no reference numbers exist (002's limitation 1); Recorded, not assumed |
| Overflow @402px | Fixed: group popover measured 370 vs 366px scrollWidth on WebKit (its own `::-webkit-scrollbar` shrank the flex row the drag handle centres in); filter/sort already conformed. All three now hide that scrollbar (`styles.css`) and pass the sweep on both engines | Fits | Fits | extent == clientWidth at 402×874, extent-minus-border predicate — met |

Implementation note (2026-09-09): the group popover's heading-divider rule also relied on
`:first-of-type`, which matches the first sibling of a tag rather than of a class — the popover's
own header `<div>` (drawn by `buildShellHeader`) sits ahead of every section title, so the exception
never fired and the panel's first section painted the divider meant to open only the ones after it.
Both the desktop and phone-scoped `.obnotion-group-popover-section-title` rules now divide by
sibling position within the title's own class (`X ~ X`) instead of by DOM-wide tag census. Full
reasoning: `decision-record.md` ADR-001.
<!-- /ANCHOR:gap-table -->

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
