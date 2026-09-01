---
title: "Feature Specification: TS-Only Wins and Release-Loop Proof"
description: "Land the three source-only fixes, cut a release, and confirm on the phone that the loop works."
trigger_phrases:
  - "ts-only wins and release-loop proof"
  - "015 ts only wins and release proof"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/015-ts-only-wins-and-release-proof"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for #17, #9, #1, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-015"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: TS-Only Wins and Release-Loop Proof

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `014-unbreak-and-references`, successor `016-overlay-contracts`.
> Inventory items: #17, #9 (label only — appearance is 017), #1. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 015-ts-only-wins-and-release-proof |
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

Three defects need no CSS at all, and the delivery chain has failed three times without anyone noticing until the operator reported the phone unchanged. Fixing the cheap items first and shipping them proves the tag-to-device loop before a day of architecture is spent on top of it.

### Purpose

Land the three source-only fixes, cut a release, and confirm on the phone that the loop works.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `calendar.unscheduled` added to every locale in `i18n.ts`
- FAB text label dropped when `is-mobile-fab` applies
- Table peek branches to `openRecordDetailPanel` on phone at `database-view.ts:8410`

### Out of Scope

- Any `styles.css` edit
- The FAB's appearance, which belongs to 017

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** `t("calendar.unscheduled")` resolves; the raw key no longer renders to the user
- **REQ-002** A test asserts every `t()` argument resolves against `i18n.ts`. `t()` accepts any string, so tsc cannot catch this class of defect
- **REQ-003** On a phone the `⤢` affordance opens the editable detail panel, not the display-only side rail
- **REQ-004** An annotated tag with a non-empty body produces a GitHub release; `package.json`, `manifest.json` and `versions.json` bump together
- **REQ-005** The operator confirms the new build reaches the device and all three fixes are visible

### P1 - Required (complete OR user-approved deferral)



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

**Phase note.** Item 1's fix is a branch at the call site, roughly three lines. Do NOT add sheet chrome to `table-record-peek.ts`: it is a display-only side rail with its own singleton, focus trap and dismiss lifecycle, and every other view already routes through `openRecordDetailPanel`, which is editable and already sheet-aware.

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
- **NFR-P01**: All three fixes are source-only; no stylesheet rule is added, so the capture manifest is untouched by the code changes.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: The i18n test walks call sites at test time and adds no runtime cost.
- **NFR-R02**: Branching the peek call site adds one predicate evaluation per open, on touch only.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A locale missing the new key must fall back visibly rather than rendering the raw key. That is the defect being fixed.
- The detail panel opened from a table row must return focus to the originating cell on close, as the other views' callers already do.

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
| Scope | 8/25 | Inventory items #17, #9, #1 |
| Risk | 6/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 5/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **19/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Whether the release is a patch or a minor version is an operator call. The mechanism is the same either way: annotated tag, non-empty body, three version files bumped together.

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
