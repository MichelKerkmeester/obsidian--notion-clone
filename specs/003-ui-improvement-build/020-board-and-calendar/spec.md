---
title: "Feature Specification: Board Pagination and the Notion Phone Calendar"
description: "Make the board readable and give the phone a calendar that fits one screen."
trigger_phrases:
  - "board pagination and the notion phone calendar"
  - "020 board and calendar"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/020-board-and-calendar"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for #15, #16, #18, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-020"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Board Pagination and the Notion Phone Calendar

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `019-row-geometry`, successor `021-output-format-and-formula`.
> Inventory items: #15, #16, #18. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 020-board-and-calendar |
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-29 |
| **Branch** | `main` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Board pagination is `position: sticky` with a bare literal `z-index: 30` outside the declared scale, so it paints over the cards. The calendar stacks full-width unscheduled chips consuming roughly forty percent of the viewport, and every day cell reserves eighteen pixels for an add button a phone can never reveal because it is hover-gated.

### Purpose

Make the board readable and give the phone a calendar that fits one screen.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- Board pagination moved onto the named sticky tier
- Unscheduled chips as one horizontally scrolling row of small chips
- A compact month grid: number plus one dot, today filled, muted weekday header, hairlines between weeks

### Out of Scope

- Replacing the full event-lane renderer with the mini picker
- Leaving the hover-gated add button occupying layout and tab order

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** Pagination no longer overlaps cards at any phone width
- **REQ-002** The month fits 402x874 without vertical scrolling in the `is-phone` capture

### P1 - Required (complete OR user-approved deferral)

- **REQ-003** The phone calendar reuses the mini renderer's date index, effective-range expansion, invalid-event filtering, selected and current state, and keyboard contracts, while owning its own compact markup
- **REQ-004** The per-cell add button stops consuming eighteen pixels and leaves the tab order. It is `opacity: 0`, not `display: none`, and remains a focusable button
- **REQ-005** Dots represent valid events within the effective range

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- Every P0 requirement met with evidence read directly, never through a pipe.
- `tsc --noEmit`, `npm run build` and `vitest run` green from the final state.
- `screenshots:verify` green. A partial re-capture cannot satisfy it — the manifest is
  only rewritten when `--only`, `--theme` and `--device` are all unset.
- Desktop behaviour unchanged.

### Acceptance Scenarios

1. **Given** the inventory items this phase owns, **when** the work lands, **then** each is
   demonstrably fixed on a phone, not merely in a fixture capture.
2. **Given** a change that would regress another surface, **when** the gates run, **then** the
   regression is caught before the phase closes.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

**Phase note.** The mini renderer's marker is a 13x2px underline, not a dot. `--db-calendar-day-min-height` defaults to 112px and is set from JavaScript, which fights any fit-one-screen requirement.

| Risk | Impact | Mitigation |
|---|---|---|
| A fixture capture passes while the real renderer is broken | A defect closes while still present on the phone | Captures render fixture markup, not renderers; the device is the authority |
| A `styles.css` edit collides with a parallel phase | Unmergeable binary conflict across 196 captures | One serialized CSS lane; only the branch holding the capture token re-captures |
| A rule-count test fails unrecognisably | Hours lost on an unrelated-looking failure | `column-header-menu-affordance.test.ts:79-87` asserts counts, not presence |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Replacing stacked chips with one scrolling row reduces the number of laid-out nodes on the calendar surface.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Reusing the existing date index avoids a second pass over the event set.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A day carrying many records still shows one dot. The count belongs in the accessible name, not in more dots.
- Events spanning a month boundary must mark every covered day, and outside-month days must stay muted.
- An invalid or unparseable date must be excluded rather than rendering a dot on a wrong day.

### Error Scenarios
- A capture that renders fixture markup can pass while the real renderer is broken. Every visual
  item in this phase closes on a device observation, not on a green capture.

### State Transitions
- Re-render, orientation change and split-pane resize each re-evaluate the predicates and measured
  insets this phase depends on; anything cached at first render must be republished.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 13/25 | Inventory items #15, #16, #18 |
| Risk | 10/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 12/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **35/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Long-range event index behaviour has no cap today. Whether to bound it, and at what horizon, is a product decision that source cannot answer.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Research**: [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md)
- **Inventory**: [`../013-mobile-ux-research/device-defect-inventory.md`](../013-mobile-ux-research/device-defect-inventory.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`

<!-- /ANCHOR:related-docs -->
