---
title: "Feature Specification: Checkbox Controls (Size and Radio Removal)"
description: "Reduce checkbox/toggle size on phone to match Notion/Anytype references, and replace every radio-style input with a checkbox across the app."
trigger_phrases:
  - "073 checkbox controls"
  - "r3 checkbox radio size"
  - "remove radio inputs"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/073-checkbox-controls"
    last_updated_at: "2026-09-08T14:45:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Implemented and gate-verified; awaiting the operator device check"
    next_safe_action: "Operator device confirmation (AC-005), then close the packet"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/touch-targets.mjs"
      - "src/views/view-config-panel-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "073-checkbox-controls-implementation"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "R3 evidence: Database Testbed board, group 'No value', 27 cards, each showing a large empty circle control labelled 'Pinned' above a bare '0' — screenshot ios-testbed-board-checkbox-0032.png (operator-owned, not committed here)"
      - "How many distinct radio-style controls exist across the app beyond the board card's control? Exactly 3 producer sites (toolbar-renderer.ts placement, column-width.ts presets, view-config-panel-renderer.ts computed-sync); the 13 other `radio` mentions in src are selectors, grammar guards and tests, not producers."
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Checkbox Controls (Size and Radio Removal)

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Implemented — evidence complete 2026-09-08, awaiting the operator's device confirmation (AC-005) |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../005-component-surface-system/` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator reports two related defects (R3): checkboxes and radios are too large on phone, and the app should not have radio-style inputs at all — only checkboxes. The Database Testbed board screenshot shows a large empty circle control (a radio-style affordance) labelled "Pinned" on every card, which is a checkbox-type boolean property rendered with the wrong control shape entirely, compounding both complaints on the same surface.

### Purpose
Every checkbox on phone is sized to match the Notion/Anytype reference (smaller than current), and every radio-style input in the app — wherever it renders a single boolean or exclusive-choice control that could instead be a checkbox or a segmented control — is inventoried and converted.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Measuring the current checkbox/toggle size on phone against the Notion/Anytype reference and reducing it to match
- Inventorying every radio-style control in the app (starting from the board card's "Pinned" property control) before converting any of them
- Converting each inventoried radio-style control to a checkbox (for boolean properties) or the appropriate non-radio equivalent (for exclusive-choice controls that are not simple booleans)

### Out of Scope
- Any sheet-family redesign (`071`) — this packet covers the checkbox/radio control shape itself, not the sheets that host them
- Select/Status property pickers, which are not radio inputs and are unaffected

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/board-renderer.ts` | Modify | Board card's checkbox-property control (the "Pinned" control in the R3 screenshot) |
| Checkbox/toggle shared component and `styles.css` | Modify | Phone checkbox sizing |
| Every file the radio inventory finds | Modify | Radio-to-checkbox conversion |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Inventory every radio-style control in the app before converting any of them |
| REQ-002 | Convert every inventoried radio-style boolean control to a checkbox |
| REQ-003 | Reduce phone checkbox/toggle size to match the Notion/Anytype reference, measured |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | The board card's "Pinned"-style control (R3 evidence) specifically renders as a checkbox, not a circle, and shows its actual value rather than a bare "0" |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The radio inventory table's count is cross-checked against an independent grep for radio-shaped controls (`type="radio"`, circular toggle classes) — no surface silently omitted
- **SC-002**: Checkbox size on phone is measured (not eyeballed) against the Notion/Anytype reference capture
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Some "radio-style" controls may be genuinely exclusive-choice (only one of N may be true) rather than independent booleans, so a checkbox is not always the correct replacement | A blind checkbox conversion could allow multiple exclusive options to be true at once | The inventory records each control's actual semantics (boolean vs. exclusive-choice) before deciding checkbox vs. a non-radio exclusive-choice control (e.g. segmented control) |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Reliability
- **NFR-R01**: The board card's checkbox-property control must reflect the property's real underlying value; the bare "0" observed in the R3 screenshot must not recur once real data is visible (dependent on `070` restoring property reads)
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A checkbox property with no value set yet (neither true nor false recorded) — must render as an unchecked checkbox, not an empty circle or a bare number
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | Inventory plus a conversion pass across however many controls the inventory finds |
| Risk | 6/25 | Presentation-layer change; semantics preserved per-control |
| Research | 10/20 | Distinguishing genuine boolean controls from exclusive-choice ones during the inventory |
| **Total** | **28/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Are there any genuinely exclusive-choice controls among the inventoried radios that should become a segmented control rather than a checkbox?
<!-- /ANCHOR:questions -->

---
