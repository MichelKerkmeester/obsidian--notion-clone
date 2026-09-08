---
title: "Feature Specification: Phase 4: View Config Sheet Redesign"
description: "Redesign the view-config sheet (title field, title format, column visibility and other per-view settings) against its mapped reference."
trigger_phrases:
  - "071 phase 4"
  - "view config sheet redesign"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 4: View Config Sheet Redesign

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Redesign the view-config sheet (title field, title format, column visibility and other per-view settings) against its mapped reference.

**Key Decisions**: This phase does not start until Phase 1's inventory names this sheet family's reference mapping.

**Critical Dependencies**: `001-sheet-story-coverage-audit` — its reference mapping row for this sheet family.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Implemented (view-config leg) — 2026-09-08: the sheet rows redesigned to the reference one-line grammar, asserted red→green in the settings lane, recaptured, 27/27 gate; operator device recheck still owed |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 4** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: Redesign the view-config sheet (title field, title format, column visibility and other per-view settings) against its mapped reference.

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
The view-config sheet carries the title field/title format controls 058 shipped and the column-visibility controls 045 shipped, built incrementally rather than against a single reference layout.

### Purpose
This sheet family's layout, spacing and control styling match its mapped Notion/Anytype reference as closely as the plugin's own token ladder allows.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The view-config sheet's full layout: title field/format row, column settings, and any other per-view control it hosts

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

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Depends on**: `../001-sheet-story-coverage-audit/`

---

<!-- ANCHOR:reference-gap -->
## 4. REFERENCE GAP — current sheet vs Notion vs Anytype (measured 2026-09-08, lane: `settings`)

Provenance: 001's inventory row 42 flags this family's references "filename read only"; the harvest
manifests (`screenshots/notion/ios/harvest.json`, `screenshots/notion/web/harvest.json`) carry Mobbin
ids and URLs only — no pixel measurements — and the Anytype captures have no harvest manifest. The
reference-side numbers below are therefore the ones 002's landed settings-sheet grammar adopted for
this same reference family (Notion iOS inset-separated list: 1px-left/0px-right divider inset
asymmetry, extent-minus-border divider predicate, divider token fallback; 44–52px row pitch against
the §21-recorded 50pt target) plus the Anytype captures' device geometry (1206x2622 @3x = 402x874pt
logical — the 402px lane width). Current-side numbers are measured from the shipped
`styles.css`/`tools/live/sheet-grammar.mjs` lanes.

| Element | Current (measured, where) | Notion reference | Anytype reference | Gap / target |
|---|---|---|---|---|
| Header / title | 16px/600 title, 1px bottom hairline, padding 0/16px/6px/16px, close 44x44 (`styles.css:12148-12170`) | Sheet-titled push, 16pt-side insets, hairline under header | Same: 402pt-logical sheet, inset header | Converged; keep |
| Row direction | Column-stacked: label ABOVE field, `flex-direction: column`, gap 4px (`styles.css:12131-12137`, 002 operator decision 2026-09-05) | Single-line rows, label left / value+control+chevron right | Single-line list rows, same grammar | **Flip to label-left/control-right** |
| Rows / grouping | One setting per row, but wide controls (segmented, dropdown+button, path+picker) drove the 002 stacking decision | One setting per row, inset-separated grouped lists | Same list grammar | Keep one-setting-per-row; grouping via inset dividers |
| Row pitch | 44px floor on phone (`styles.css:13271`) + 4px gap + 6px margin ⇒ ~50–54px, unasserted | 44–52pt; §21 records 50pt measured target | ~50pt logical | **Assert 44–52px pitch** |
| Dividers | Section-title `border-top` hairline only, full-bleed; rows undivided (`styles.css:12249-12253`) | 1px hairline, inset 16px left / 0px right (002 finding), extent = row extent minus border, `--obnotion-border-subtle` with token fallback | Same inset hairline | **Per-row inset divider; 1px-left/0px-right; extent-minus-border predicate; token fallback** |
| Section headings | 12px/12px/4px padding — 12px inset vs rows' 16px (`styles.css:12249`) | 16px inset, aligned over the list inset | Same | **Align to 16px** |
| Selects | Native `<select>` stretched full-width 44px/16px (`styles.css:12227-12236`, `:13347`) | Own picker, no native list over the sheet | Own picker | **Selects rendered as the plugin's own sheet-native picker (`.obnotion-view-config-dropdown` → `.obnotion-dropdown-popover`)** |
| Toggles | `.obnotion-checkbox` switch, 18px basis, excluded from flex-grow (`styles.css:12186-12194`) | UIToggle at the row's right | Switch at row's right | Right-align with the control column |
| Horizontal padding | 16px rows/header; 12px section titles + readonly notes | 16px throughout | 16pt logical | **Consistent 16px** |
| Typography | Labels 14px (`--obnotion-font-base`) muted, values/controls 16px (iOS zoom guard, `styles.css:12213-12221`) | 17pt labels, muted secondary | Same scale | Converged via token ladder; keep |
| Overflow | scrollWidth 390 == clientWidth 390 (lane PASS, as built) | n/a | 402pt-logical | **Keep: scrollWidth == clientWidth at 402px** |
<!-- /ANCHOR:reference-gap -->
