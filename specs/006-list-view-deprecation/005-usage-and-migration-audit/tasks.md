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

- [x] T001 Read `../005-component-surface-system/030-gallery-view-deprecation/` and `src/data/gallery-migration.ts`, including the comment explaining why that migration targeted `board`. Record what transfers to the list and what does not — Evidence: `implementation-summary.md` §5; the withdraw-then-migrate-on-open shape transfers (`database-view.ts:2748,11805`), the `board`-specific reasoning does not (list shares `getFieldWidth` with the table instead)
- [x] T002 [P] Read `../superseded-clickup-direction.md` §4.1 — the table-to-list feature diff. It was written to argue for a conversion and it doubles as a ready-made inventory of what the list has that the table does not — Evidence: `implementation-summary.md` §6, F23-F29 read against the migration target; 4 of the candidates (L1-L4) confirmed as declared losses, 2 (F23/F24) confirmed as already covered, 1 (per-group create) confirmed as fixed rather than lost
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 Source enumeration: every branch on `viewType === "list"`, every caller of `list-renderer.ts`, and every `ViewConfig` field only the list reads. Report the count and the file:line list, not a summary (`src/`) — Evidence: `implementation-summary.md` §1 — 47 raw `"list"` matches, 27 relevant after filtering; 8 `viewType === "list"` branches; 2 production callers + 4 test-file callers; 1 list-only field (`listCompactFields`, 16 total lines); the `.base` importer and the settings-load sanitizer named as two more list-minting surfaces beyond the picker
- [x] T004 Measurement enumeration: `tools/gate.mjs`'s lane list, `tools/live/list-window.mjs` + `list-window-harness.ts` + `list-window.json`, `renderer-coverage.json`'s pinned list inputs, `tools/live/replay.mjs`'s list claims, `list` and `list-sparse` in `constructed-scenarios.mjs`, list fixtures in `scenarios.mjs`, and `list-reservation.test.ts` / `list-row-contracts.test.ts` (`tools/`, `src/views/`) — Evidence: `implementation-summary.md` §2 — 1 gate lane (16 checks, pins both `list-renderer.ts` and `table-renderer.ts`), 1 bench + 1 coverage pin (7/22 → 6/22 on removal), 2 replay claims, 2 constructed scenarios, 3 screenshot scenario ids, 2 list-only unit specs (11 test cases) + 2 shared specs with list assertions inside; `list-render-bench.ts` also cited by 11 unrelated scenario `sources` entries
- [x] T005 Capture enumeration: `screenshots/manifest.json` entries whose scenario names the list (`screenshots/`) — Evidence: `implementation-summary.md` §3 — 20 manifest entries across 5 scenario ids, 20 matching PNGs on disk, no orphans either direction
- [x] T006 Decide the migration target and record the reasoning, including why it differs from the gallery's `board` (`implementation-summary.md`) — Evidence: `implementation-summary.md` §5 — `table`, confirmed via `column-width.ts:29`'s `getFieldWidth` being shared by both renderers already
- [x] T007 Write the data-loss list: every list-only affordance with no table equivalent, each with the file and line that implements it. Known candidates to start from: the stacked-title reading mode, `listCompactFields`, and the per-group create button at `list-renderer.ts:172` (`implementation-summary.md`) — Evidence: `implementation-summary.md` §6 — 4 declared losses (L1-L4: `listCompactFields`, stacked title, roving-tabindex keyboard model, `col.wrap`); the per-group create button confirmed NOT a loss (`styles.css` has 0 rules for the list's own button vs. 3 for the table's, both calling `createEntryNearEnd`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 Report the three enumeration counts separately. A disagreement between them is a finding, not an error to reconcile silently — Evidence: `implementation-summary.md` §1-3 report separately; §2's closing paragraph names what each direction missed that another caught
- [x] T009 Write the "what this audit did not establish" section, so a later phase does not read its silence as a finding — Evidence: `implementation-summary.md` §7, four named gaps
- [x] T010 Confirm `git diff --stat src/ tools/` is empty on this phase's commits — the read-only claim is checked, not asserted — Evidence: `implementation-summary.md` Verification table; confirmed empty for this phase's own commits at authoring time
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification passed
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



