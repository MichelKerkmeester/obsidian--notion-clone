---
title: "Feature Specification: Unbreak the Tree and Acquire References"
description: "Restore a green tree and put the reference implementations where they can actually be read, before any defect work begins."
trigger_phrases:
  - "unbreak the tree and acquire references"
  - "014 unbreak and references"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/014-unbreak-and-references"
    last_updated_at: "2026-08-29T07:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from 013's decision matrix; not started"
    next_safe_action: "Read decision-matrix.md rows for none — prerequisite phase, then plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-014"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Unbreak the Tree and Acquire References

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `013-mobile-ux-research`, successor `015-ts-only-wins-and-release-proof`.
> Inventory items: none — prerequisite phase. Root causes, decisions and evidence live in
> [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 014-unbreak-and-references |
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

The repository could not produce a release. `record-detail-panel.ts` imported `attachSheetDragToDismiss` while still declaring a byte-identical local copy, so `tsc --noEmit` failed with TS2440 — and `release.yml:33` runs tsc before build, so a tag would have uploaded nothing. Separately, AnyType and AppFlowy are named as engineering references but exist nowhere on disk.

### Purpose

Restore a green tree and put the reference implementations where they can actually be read, before any defect work begins.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- Remove the duplicate declaration, keep the import, track `mobile-bottom-sheet.ts`
- Refresh the stale panel captures
- Add `external/` to `.gitignore` BEFORE cloning, then clone AnyType and AppFlowy

### Out of Scope

- Any defect from the inventory
- Reading the references for anything beyond interaction semantics

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** `tsc --noEmit` exits 0 with no output
- **REQ-002** `screenshots:verify` exits 0 with all 196 entries matching
- **REQ-003** `external/` is gitignored before either clone lands, and never appears in `git status`

### P1 - Required (complete OR user-approved deferral)

- **REQ-004** Reference reading is behaviour-only. Both repos are AGPL or source-available; this plugin is MIT (`LICENSE:1-3`). No code, CSS values, token scales or asset geometry may be copied.

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

**Phase note.** The tsc and capture halves are already done: tsc 0, build 0, vitest 397/397, screenshots:verify 196 matching, lint unchanged at 115, uncommitted. The clone half is not started.

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
- **NFR-P01**: The duplicate removal is a pure deletion; the surviving implementation is byte-identical to the one removed.

### Security
- **NFR-S01**: No network, telemetry or remote dependency. Local Obsidian DOM APIs only; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Cloning two large repositories is disk-only and adds no runtime dependency, build step or import.
- **NFR-R02**: `external/` is gitignored before either clone lands, so no reference source can enter this repository's history.
- **NFR-R90**: Desktop-safe. Every layout rule is phone-scoped and every behavioural branch is predicate-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A clone that partially completes leaves `external/` present but incomplete; it is gitignored either way, so the repository is unaffected.
- If the gitignore entry is added after a clone, `git status` already carries thousands of untracked paths. Add the entry first.

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
| Scope | 6/25 | Inventory items none — prerequisite phase |
| Risk | 4/25 | Display-layer change; no auth, API or persistence break except where a descriptor is explicitly introduced |
| Research | 6/20 | Governing analysis already recorded in the decision matrix |
| **Total** | **16/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Whether either reference repository is worth keeping resident, or should be read once and deleted, is an operator preference and is not settled here.

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
