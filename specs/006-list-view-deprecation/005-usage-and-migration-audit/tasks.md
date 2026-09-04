---
title: "Tasks: List Usage and Migration Audit"
description: "Enumerate the list from three independent directions, decide the migration target, and write the data-loss list."
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: List Usage and Migration Audit

<!-- SPECKIT_LEVEL: 1 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read `../005-component-surface-system/030-gallery-view-deprecation/` and `src/data/gallery-migration.ts`, including the comment explaining why that migration targeted `board`. Record what transfers to the list and what does not
- [ ] T002 [P] Read `../superseded-clickup-direction.md` §4.1 — the table-to-list feature diff. It was written to argue for a conversion and it doubles as a ready-made inventory of what the list has that the table does not
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Source enumeration: every branch on `viewType === "list"`, every caller of `list-renderer.ts`, and every `ViewConfig` field only the list reads. Report the count and the file:line list, not a summary (`src/`)
- [ ] T004 Measurement enumeration: `tools/gate.mjs`'s lane list, `tools/live/list-window.mjs` + `list-window-harness.ts` + `list-window.json`, `renderer-coverage.json`'s pinned list inputs, `tools/live/replay.mjs`'s list claims, `list` and `list-sparse` in `constructed-scenarios.mjs`, list fixtures in `scenarios.mjs`, and `list-reservation.test.ts` / `list-row-contracts.test.ts` (`tools/`, `src/views/`)
- [ ] T005 Capture enumeration: `screenshots/manifest.json` entries whose scenario names the list (`screenshots/`)
- [ ] T006 Decide the migration target and record the reasoning, including why it differs from the gallery's `board` (`implementation-summary.md`)
- [ ] T007 Write the data-loss list: every list-only affordance with no table equivalent, each with the file and line that implements it. Known candidates to start from: the stacked-title reading mode, `listCompactFields`, and the per-group create button at `list-renderer.ts:172` (`implementation-summary.md`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 Report the three enumeration counts separately. A disagreement between them is a finding, not an error to reconcile silently
- [ ] T009 Write the "what this audit did not establish" section, so a later phase does not read its silence as a finding
- [ ] T010 Confirm `git diff --stat src/ tools/` is empty on this phase's commits — the read-only claim is checked, not asserted
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Precedent**: `../../005-component-surface-system/030-gallery-view-deprecation/`
- **Superseded feature diff**: `../superseded-clickup-direction.md` §4.1
<!-- /ANCHOR:cross-refs -->

---



