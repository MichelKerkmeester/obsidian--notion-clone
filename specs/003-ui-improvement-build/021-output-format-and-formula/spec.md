---
title: "Feature Specification: Computed Output Format and the Formula Workbench"
description: "Add a serializable output-format descriptor and one semantic formatter every consumer shares, then bring the formula workbench to the target layout."
trigger_phrases:
  - "computed output format and the formula workbench"
  - "021 output format and formula"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/021-output-format-and-formula"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for #11, #19, #20, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-021"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Computed Output Format and the Formula Workbench

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `020-board-and-calendar`, successor none.
> Inventory items: #11, #12, #19, #20. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 021-output-format-and-formula |
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Planned |
| **Created** | 2026-08-29 |
| **Branch** | `main` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

`ComputedFieldDef` carries key, label, expression, result type and syntax — but no output format, and computed columns cannot resolve to currency at all. The footer calls the plain number formatter while cells already use the currency one, and the formula preview formats with raw `String(number)`. There is no column currency configuration to read from: the type exists, the formatter is EUR-hardcoded, and no currency-code field exists on `ColumnDef`.

### Purpose

Add a serializable output-format descriptor and one semantic formatter every consumer shares, then bring the formula workbench to the target layout.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- An optional format descriptor beside the computed result type: constrained kind plus optional decimal count
- One semantic formatter shared by preview, table, card, footer and export
- Formula editor layout with the non-AI controls

### Out of Scope

- Visual `NumberDisplayConfig`, which stays separate
- Keeping the AI prompt bar

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** Percent semantics are decided before migration: ratio or 0-100, plus rounding, negative, zero, missing and non-finite behaviour
- **REQ-002** Preview, cell, card and footer agree for plain, currency, percent, precision, empty, NaN and error results
- **REQ-003** The AI prompt action is removed. It exists today at `formula-modal.ts:446-458`, so this is a deletion, not an omission

### P1 - Required (complete OR user-approved deferral)

- **REQ-004** Formula evaluation stays numeric, so comparisons, rollups, editing and validation are undamaged
- **REQ-005** Footer aggregates fit without shrinking type below the touch-legible baseline (item #12). The footer sets no font-size and inherits the row token; the likelier cause of bulk is the column flex stacking label above value

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

**Phase note.** This is a desktop-first workbench track filed alongside phone defects. It carries its own schema change and will either starve or blow up a phone batch if merged into one.

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
- **NFR-P01**: The format descriptor is optional; absent values retain current behaviour, so no migration is required.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Centralising the formatter removes duplicate formatting paths rather than adding one.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A percent of a negative value, a zero, a missing value and a non-finite value each need defined output before migration.
- A decimal count of zero must render no separator, not a trailing one.
- A computed column whose expression returns a non-number must keep failing closed to text.

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
| Scope | 16/25 | Inventory items #11, #19, #20 |
| Risk | 14/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 15/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **45/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Percent semantics are undecided: whether the stored value is a ratio or already scaled to 0-100 changes every consumer. This must be settled before the descriptor ships.

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
