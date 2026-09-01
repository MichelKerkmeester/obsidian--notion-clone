---
title: "Feature Specification: Modal Surface Taxonomy and Plugin-Owned Menus"
description: "Give each modal the presentation its content deserves, and retire the private-field liability."
trigger_phrases:
  - "modal surface taxonomy and plugin-owned menus"
  - "018 surface taxonomy and menus"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/018-surface-taxonomy-and-menus"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for #3, #8, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-018"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Modal Surface Taxonomy and Plugin-Owned Menus

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `017-touch-predicate`, successor `019-row-geometry`.
> Inventory items: #3 (taxonomy half — predicate is 017), #8. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 018-surface-taxonomy-and-menus |
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

Zero of seventeen `Modal` subclasses reach the shared sheet mechanism, so every one is a centred desktop dialog on a phone. Meanwhile the column menu reaches `MenuItem`'s DOM through an undocumented private `.dom` field — twenty-six accesses, twenty-four of them in `column-menu.ts` — absent from the public typings and liable to break silently at runtime if Obsidian renames it.

### Purpose

Give each modal the presentation its content deserves, and retire the private-field liability.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A thin base class between `Modal` and each subclass
- Two mobile presentations: sheet for short surfaces, full-screen for workbenches
- A plugin-owned menu covering the scope the operator selects

### Out of Scope

- Sheet-ifying every modal indiscriminately
- Preserving `aria-haspopup="listbox"` mechanically rather than matching the final widget role

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** All twenty-four `new X(...)` call sites are unchanged by the base-class insertion
- **REQ-002** `formula-modal.ts` still opens its confirm-on-close dialog. It overrides `close()` and calls `super.close()` only after the confirm resolves, so a base class that wraps `close()` breaks it
- **REQ-003** `status-preset-manager-modal.ts` still works. It calls `this.onOpen()` as its re-render, so base-class setup placed there runs three times per interaction

### P1 - Required (complete OR user-approved deferral)

- **REQ-004** Formula, Invalid Time Events and Property Type Conflict get full-screen rather than a sheet. They are 860-1240px workbenches with their own responsive ladders
- **REQ-005** Any new portal class is registered in `database-view.ts` `portalSelectors`, or interaction-scope ownership breaks
- **REQ-006** Nested sheets are a deliberate decision, not a discovery. Six modals host dropdown popovers that already self-convert to sheets

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

**Phase note.** Two modal classes have zero call sites anywhere in `src/`; the live replacements are the inline group-order UI and `openCreatePropertyModal`. The honest count is fourteen, and eight to ten of those want sheets. SCOPE PENDING: the operator chooses between replacing every native `Menu` and replacing only the hierarchical column submenu.

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
- **NFR-P01**: Inserting a base class between `Modal` and each subclass is a compile-time change; no call site and no runtime path is added.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: A plugin-owned menu replaces private-field DOM access with owned markup, removing a runtime failure mode that carries no type error today.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A modal that overrides `close()` must keep its override semantics. The formula workbench opens a confirm dialog and defers `super.close()`.
- A modal that re-renders by calling its own `onOpen()` will run base-class setup repeatedly.
- A menu opened from inside a sheet must dismiss in the right order and return focus to its trigger.

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
| Scope | 18/25 | Inventory items #3, #8 |
| Risk | 18/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 16/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **52/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

SCOPE PENDING. The operator chooses between replacing every native menu for visual consistency and replacing only the hierarchical column submenu, where 24 of the 26 private DOM accesses live. Both are defensible and the phase is sized differently for each.

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
