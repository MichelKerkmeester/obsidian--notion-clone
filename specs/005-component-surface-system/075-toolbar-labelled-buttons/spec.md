---
title: "Feature Specification: Phone Toolbar Labelled Buttons"
description: "Replace the phone view toolbar's icon-only cluster (filter, sort, group, columns, settings, more) with icon+label buttons matching the operator's Notion/Anytype/Bases reference, with horizontal-scroll overflow when the row does not fit."
trigger_phrases:
  - "075 toolbar labelled buttons"
  - "r14 sort filter buttons"
  - "phone toolbar horizontal overflow"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "075-toolbar-labelled-buttons"
    last_updated_at: "2026-09-08T08:52:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Opened the packet from the operator's R14 report and reference screenshot"
    next_safe_action: "Measure the reference for label size and spacing"
    blockers: []
    key_files:
      - "src/views/database-view.ts (toolbar)"
      - "tools/live/touch-targets.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "075-toolbar-labelled-buttons-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the desktop toolbar also gain labels, or does it stay icon-only? Decide with an ADR against Notion/Anytype/Bases references"
    answered_questions:
      - "Reference: an Obsidian Bases calendar toolbar on phone, one row of icon+text buttons ('Sort', 'Filter', 'Properties', 'New'), no bare icon-only cluster, evidenced at /private/tmp/claude-501/-Users-michelkerkmeester-MEGA-Development-Obsidian-Plugin/e80c6d75-9d5c-4af2-af70-05fb120371b4/scratchpad/operator-references/toolbar-labelled-buttons-reference.png (operator-provided, not committed to this repository)"
      - "Overflow behaviour: never wrap or collapse; the row scrolls horizontally when the labelled buttons exceed the viewport width, no visible scrollbar (matching the existing edge-only scrollbar ruling), leading/trailing padding so the last button is reachable"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Phone Toolbar Labelled Buttons

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Draft — opened 2026-09-08, nothing started |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../005-component-surface-system/` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator wants the phone view toolbar's icon-only buttons (filter, sort, group, columns, settings, more — visible in the R1 evidence screenshot `ios-finance-table-empty-0032.png`, operator-owned, not committed here) restyled as icon+label buttons, citing an Obsidian Bases calendar toolbar as the reference: a single row of "↑↓ Sort", "≡ Filter", "☰ Properties", "+ New" with visible text labels, no bare icon cluster. A follow-up (08:52) adds that on phone the row must never wrap or collapse — it should scroll horizontally when the labelled buttons no longer fit.

### Purpose
The phone toolbar's controls each carry an icon and a text label matching the reference's size and spacing, touch targets meet the 44px minimum, and the row scrolls horizontally rather than wrapping or collapsing when it exceeds the viewport width.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Restyling the phone toolbar's filter/sort/group/columns/settings/more controls as icon+label buttons
- Measuring the reference screenshot for label size, spacing and touch-target dimensions, and matching them
- Horizontal-scroll overflow: the row never wraps or collapses; it scrolls when it exceeds the viewport, with no visible scrollbar and leading/trailing padding so the last button is reachable
- Updating the existing `009`/`044` toolbar-collapse and sheet-grammar lanes, red-first, since they currently assume a collapsing (not scrolling) toolbar
- A desktop toolbar decision (same labels, or unchanged), recorded as an ADR against Notion/Anytype/Bases references

### Out of Scope
- Any sheet-family redesign (`071`)
- The toolbar's own functional behavior (what each button does) — only its presentation and overflow changes

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Phone toolbar source (`src/views/database-view.ts` or its toolbar component) | Modify | Icon+label buttons, horizontal-scroll container |
| `tools/live/touch-targets.mjs` | Modify | Assert ≥44px touch targets on the new labelled buttons |
| `009`/`044`'s toolbar-collapse lane | Modify | Update red-first for scroll-instead-of-collapse behavior |
| `styles.css` | Modify | Label typography, spacing, horizontal-scroll container rules |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Phone toolbar controls render as icon+label buttons matching the reference's measured label size and spacing |
| REQ-002 | Touch targets measure ≥44×44px |
| REQ-003 | The row scrolls horizontally (never wraps or collapses) when it exceeds the viewport width, with the last control reachable by scroll |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | The existing `009`/`044` toolbar-collapse and sheet-grammar lanes are updated and pass against the new scroll behavior |
| REQ-005 | A desktop toolbar decision (labelled or unchanged) is recorded as an ADR |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A lane renders the toolbar at 402px with all controls and asserts row height equals one button row, `scrollWidth > clientWidth`, and the last control is reachable by scroll — red before the fix, green after
- **SC-002**: Touch-target measurements match or exceed 44×44px for every labelled button
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | The existing `009`/`044` toolbar-collapse lane assumes a collapsing toolbar | A naive add of labels without updating that lane would leave it asserting behavior this packet removes | REQ-004 requires the lane updated red-first before the fix lands |
| Risk | The reference screenshot is a calendar toolbar (Sort/Filter/Properties/New); this plugin's toolbar carries a different control set (filter/sort/group/columns/settings/more) | A literal one-to-one label copy may not fit six controls in the reference's apparent row width | Measure the reference's per-button width/label-length ratio and apply it to this toolbar's own control count, rather than copying exact button count |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Horizontal scroll must stay at native scroll performance (no JS-driven scroll simulation) on the phone form factor

### Reliability
- **NFR-R01**: The scroll-overflow lane must be deterministic (same result on repeated runs at the same viewport), not dependent on font-loading timing
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A toolbar with the minimum control set (e.g. filter and sort only, no group/columns) — must not show a scrollbar or overflow gutter when everything fits
- A toolbar with every optional control enabled — must scroll cleanly with no clipped label

### Error Scenarios
- A very long localized label — should truncate or reduce rather than pushing another control fully off-screen with no way to reach it
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 14/25 | Toolbar restyle plus a new scroll-overflow lane and a lane update |
| Risk | 8/25 | Presentation-only change; existing lane assumptions must be updated correctly |
| Research | 12/20 | Reference measurement plus a desktop-parity decision |
| **Total** | **34/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does the desktop toolbar also gain labels, or stay icon-only — decide with an ADR against Notion/Anytype/Bases references
<!-- /ANCHOR:questions -->

---
