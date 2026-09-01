---
title: "Feature Specification: Bounded Wrapping and a Shared Density Contract"
description: "Bound the wrap and extend the density contract that already exists, rather than building a second one."
trigger_phrases:
  - "bounded wrapping and a shared density contract"
  - "019 row geometry"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/019-row-geometry"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for #13, #14, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-019"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Bounded Wrapping and a Shared Density Contract

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `018-surface-taxonomy-and-menus`, successor `020-board-and-calendar`.
> Inventory items: #13, #14. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 019-row-geometry |
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

Rows are ragged, but not because a row-height model is missing. `RowDensity` exists end to end — type, view config, persistence, CSS custom properties and the `data-row-density` attribute. Raggedness has two specific causes: wrapped cells opt into `height: auto`, so one wrapped column drags its whole row; and list view never receives the density attribute at all.

### Purpose

Bound the wrap and extend the density contract that already exists, rather than building a second one.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A bounded wrap mode with a line clamp or show-more affordance
- `data-row-density` written on the container so every view inherits it
- `.db-list-row` sized from the density token instead of a hard 44px

### Out of Scope

- A second global wrap control — per-column `wrap` already exists
- Unbounded auto-height as a default

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** With wrap off, every row in a view shares one height
- **REQ-002** List items obey the same density contract as table rows

### P1 - Required (complete OR user-approved deferral)

- **REQ-003** The clip is achieved with CSS on the existing cell. Introducing a new inner wrapper node would force every table fixture to gain that node
- **REQ-004** Item 13 lands before item 14, so list consumes the table's policy rather than inventing another

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

**Phase note.** There is no virtualisation to invalidate — the viewport module captures and restores scroll anchors, it does not window rows. So there is no measurement cache to worry about, but equally no upper bound on layout cost per rerender.

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
- **NFR-P01**: Bounding wrapped cells reduces layout cost; unbounded auto-height currently has no ceiling.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Extending an existing attribute to more views adds one attribute write per container render.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A cell whose content sits exactly at the clamp boundary must not oscillate between clamped and unclamped across renders.
- A row whose only wrapped column is empty must take the same height as its unwrapped neighbours.
- Grouped and ungrouped table paths both write the density attribute and must stay in agreement.

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
| Scope | 9/25 | Inventory items #13, #14 |
| Risk | 8/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 9/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **26/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Whether the bounded wrap exposes a show-more affordance or clips silently is a product choice. Notion clips, which argues for clipping.

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
