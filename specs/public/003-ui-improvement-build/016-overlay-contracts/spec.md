---
title: "Feature Specification: Overlay Presentation, Placement and Layer Contracts"
description: "Split presentation from placement, and give the layer scale every tier it is already being asked for."
trigger_phrases:
  - "overlay presentation, placement and layer contracts"
  - "016 overlay contracts"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/016-overlay-contracts"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for #4, #5, #6, #7, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-016"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Overlay Presentation, Placement and Layer Contracts

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `015-ts-only-wins-and-release-proof`, successor `017-touch-predicate`.
> Inventory items: #4, #5, #6, #7. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 016-overlay-contracts |
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-29 |
| **Branch** | `main` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

`positionToolbarPopover` fuses three concerns: it decides mobile-sheet presentation, computes anchored geometry, and owns reposition listeners. A `Modal` has no anchor, so none of the seventeen can reach it. Separately `.db-mobile-bottom-sheet` declares no `z-index`, `--db-layer-sticky` is referenced but never declared, and the peek panel sits outside the scale at a literal 998.

### Purpose

Split presentation from placement, and give the layer scale every tier it is already being asked for.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A presentation adapter owning sheet chrome, grab handle, drag-dismiss and safe-area padding
- Named `sheet`, `peek` and `sticky` tiers folded into the existing scale
- `max-height: 90svh` on the sheet
- Sheet vocabulary matched to the Notion reference

### Out of Scope

- Promoting sheets to the modal tier
- Routing the nineteen anchored popover callers through a modal-shaped API
- Adding top padding for item 6 before a device check confirms the symptom

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** Presentation is a caller-declared mode, never inferred from whether an anchor was passed
- **REQ-002** `.db-record-detail-panel` keeps its panel-tier z-index. Its field editors are siblings rather than descendants (`styles.css:8852-8867`), so raising the sheet to modal tier makes the panel paint over its own editors
- **REQ-003** `layer-scale-and-timeline-width.test.ts` passes unmodified

### P1 - Required (complete OR user-approved deferral)

- **REQ-004** The literal `998` and the undeclared `--db-layer-sticky` are replaced by named tiers
- **REQ-005** Item 6 is closed by a device observation or explicitly deferred, never by speculative padding

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

**Phase note.** The `!important` tail at `styles.css:18441-18457` re-declares every layer z-index. An edit inside the numbered sections is silently overridden by it.

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
- **NFR-P01**: The presentation adapter adds no listener the positioner did not already own; drag-dismiss attaches only when a handle exists.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Layer tiers are custom properties, so naming them changes no paint order except where a literal is replaced by its equivalent token.
- **NFR-R02**: Every rule stays phone-scoped; desktop anchored placement is untouched.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A sheet opened from inside another sheet must not stack two scrims. Six modals host dropdowns that already self-convert.
- A sheet taller than 90svh must scroll internally rather than pushing its own header off-screen.
- A surface with no anchor and no declared presentation mode must fail loudly at author time, not silently centre itself.

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
| Scope | 14/25 | Inventory items #4, #5, #6, #7 |
| Risk | 16/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 14/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **44/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Item 6, the top safe-area inset, cannot be settled from source: every fixed element the plugin owns is bottom-anchored, so zero uses of the top inset is the expected result rather than a gap. It needs a device observation before any padding is added.

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
