---
title: "Feature Specification: One Canonical Touch Predicate"
description: "Make one predicate canonical and retire the threshold mismatch, so the FAB and the sheets agree about what a phone is."
trigger_phrases:
  - "one canonical touch predicate"
  - "017 touch predicate"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/017-touch-predicate"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for #2, #3, #9, #10, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-017"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: One Canonical Touch Predicate

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `016-overlay-contracts`, successor `018-surface-taxonomy-and-menus`.
> Inventory items: #2, #3 (predicate half — taxonomy is 018), #9 (appearance — label dropped in 015), #10. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 017-touch-predicate |
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

Two predicates disagree. `isTouchDevice` combines platform flags, coarse pointer and a 760px container width; `isMobileBottomSheet` uses the phone class or 600px plus touch. The FAB breaks in the gap: its class is applied on one predicate while the CSS that makes it a FAB lives behind a 700px media query, so between 701 and 760px, and on every tablet, the class applies and the styling does not.

### Purpose

Make one predicate canonical and retire the threshold mismatch, so the FAB and the sheets agree about what a phone is.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `isTouchDevice` as the single interaction predicate
- FAB driven entirely off its class, with the 700px media query retired
- FAB liquid-glass treatment and plus-icon-only presentation
- FAB inset kept in sync when geometry changes

### Out of Scope

- Introducing a third predicate for the sheet primitive
- Re-fixing the base FAB inset, which 012 already fixed

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** One predicate governs interaction. Any narrower sheet-only mode is explicitly named, tested and documented
- **REQ-002** No element receives a mobile class whose styling is gated behind a different threshold

### P1 - Required (complete OR user-approved deferral)

- **REQ-003** The FAB no longer twitches during scroll. `reserveMobileFabInset` publishes the navbar height once per toolbar render with no resize, visualViewport or orientation listener
- **REQ-004** `012/spec.md` REQ-003 is read before touching the inset, so the existing fix is not duplicated

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

**Phase note.** Item 2 is disputed: the properties path already builds `.db-column-manager`, calls the shared positioner, and the phone predicate already returns sheet mode. Identify the real device path before changing anything.

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
- **NFR-P01**: Collapsing to one predicate removes an evaluation rather than adding one.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Any listener added to keep the FAB inset in sync must be passive and torn down with the toolbar.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Tablet widths between 701 and 760 pixels are exactly the gap where the class applies and the styling does not. They are the regression test.
- A split pane narrower than the threshold on a desktop must behave as the container-aware predicate says, not as the platform flag says.
- Orientation change and a hiding navigation bar both move the inset the FAB depends on.

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
| Scope | 10/25 | Inventory items #2, #3, #9, #10 |
| Risk | 12/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 10/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **32/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Item 2's device path is unidentified. The properties button already resolves to sheet mode in source, so the reported behaviour belongs to another affordance or an older build. Reproduce before changing anything.

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
