---
title: "Tasks: Competitor References and Closer PM Alignment"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "competitor reference tasks"
  - "047 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Competitor References and Closer PM Alignment

<!-- SPECKIT_LEVEL: 2 -->

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

- [x] T001 Record the licence and attribution position for each image source, per product, before anything is downloaded. **Done, 2026-09-05, via `screenshots/anytype/sources.md` and `screenshots/appflowy/sources.md` rather than `scratch/licence-positions.md` — CHK-042 asks for a committed record rather than a scratch note, so the position lives beside the images it covers. Every official image's source URL and licence position (both folders record "terms unclear" — no press-kit grant found — cited by URL, retained for internal comparison) is recorded before its commit**
- [x] T002 [B] Get the operator's go-ahead to install the two Homebrew casks — `anytype` 0.56.5 and `appflowy` 0.14.1, neither installed today. Installation is a scoped mutation. **Done, 2026-09-05: both casks installed via Homebrew (confirmed `brew list --cask --versions` → `anytype 0.56.5`, `appflowy 0.14.1`). First launch attempt hung indefinitely at `dyld_start` for the agent (Console/`sample` evidence in the session log) even after clearing the `com.apple.quarantine` attribute; the operator then opened both apps by hand on their own MacBook and the capture pass ran against those windows**
- [ ] T003 [P] Read `037/acceptance-criteria.md` AC-007 and `038/tasks.md` T12 so the comparison style is copied rather than reinvented
- [ ] T004 [P] Record the pre-change baseline: board and gantt capture hashes, `screenshots:verify`'s entry count, and the gate's lane list (`scratch/baseline.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T005 Write the negative control FIRST and observe it red against the current schema: a reference entry grouped `anytype` is rejected today by `manifest-schema.mjs:118` (`tools/screenshots/manifest-schema.test.mjs`)
- [ ] T006 Widen the reference contract — the group allowlist at `:118` and `REFERENCE_RENDERERS` at `:52` — and decide what `referenceOf` means for a capture with no constructed counterpart (`tools/screenshots/manifest-schema.mjs`)
- [ ] T007 Give `verify.mjs` a deterministic class for a capture with no in-repo source, distinct from `vendor-unavailable`, which means an unavailable source rather than no source (`tools/screenshots/verify.mjs`)
- [x] T008 Capture Anytype: board, table, calendar, timeline — official product images AND the installed app (`screenshots/anytype/`). **Done, 2026-09-05. Official: 5 docs.anytype.io images (board/table/calendar/gallery/properties; no timeline — product has none). Installed (0.56.5, the operator's own running window): 18 dark-theme captures — this is the manual capture pass, distinct from `decision-record.md` ADR-001's separate 20-iteration deep-research UX/logic-extraction run, which this task did not execute. No simulated mouse click works in this environment (`CGEvent` posts silently; `System Events`'s `click at` is refused: "osascript is not allowed assistive access"), so Kanban/Calendar/Gallery of the demo collection, the property editor, filter/sort panels, the view switcher, context menus and light theme were not reachable — keyboard-only paths (`Cmd+K`, `Cmd+N`, `/`, arrows+Return) covered search, slash menu, object creation, an inline collection's Grid view with 10 demo rows, Settings→Account and the shipped Welcome/Playground pages instead. Full list and reasons: `screenshots/anytype/README.md`**
- [x] T009 [P] Capture AppFlowy: board, table, calendar, timeline — official product images AND the installed app (`screenshots/appflowy/`). **Done, 2026-09-05. Official: 4 appflowy.com images (board/table/calendar/properties; no timeline — not among the product's documented view types). Installed (0.14.1, the operator's own running window): the shipped `To-dos` database's populated Board/Kanban view, plus the `Cmd+P` search palette and the native `About AppFlowy` dialog. Same click limitation as Anytype — Grid/Calendar/Gallery of a database, an expanded card's property sheet, and Settings/Appearance were not reachable. Full list and reasons: `screenshots/appflowy/README.md`**
- [ ] T010 Write the manifest entries with provenance: source, app version, capture date, in `screenshots/project-manager/`'s entry shape (`screenshots/manifest.json`). **Not done, deliberately: `manifest-schema.mjs:52,118` accepts only `group: "project-manager"` and `pm-kanban`/`pm-gantt` as reference renderers — confirmed by reading the schema, not assumed. No entry for `anytype`/`appflowy` can pass validation without T006's contract widening, which is the other leg of this packet. `screenshots/manifest.json` is untouched; provenance instead lives in each folder's `sources.md` (official images) and `README.md` (installed captures)**
- [x] T011 [P] Describe both new roots and where their contents came from. **Done, 2026-09-05, via `screenshots/anytype/README.md` and `screenshots/appflowy/README.md` rather than the top-level `screenshots/README.md` — that file is generated by `npm run screenshots` ("Do not edit by hand — this file and every image below are rewritten on each capture") and only documents `manifest.scenarios` entries, which these captures deliberately are not (see T010). A per-folder README is the durable home for this provenance**
- [ ] T012 Run the board comparison against Project Manager: named elements, measured values, a numbered gap or a zero — the shape `038`'s T12 used (`scratch/board-comparison.md`)
- [ ] T013 Run the gantt comparison the same way, the shape `037`'s AC-007 used (`scratch/gantt-comparison.md`)
- [ ] T014 Close each measured gap with a before and an after number; disposition the ones not closed with a reason (`src/views/board-renderer.ts`, `src/views/calendar-timeline-renderer.ts`, `styles.css`)
- [x] T015 Record any capture row that could not be taken as uncaptured WITH its reason. An absent capture reported as zero gaps is the failure this phase is written against. **Done, 2026-09-05: both READMEs carry a "Views not captured, and why" section — timeline/gantt is "not applicable" for both products (confirmed absent from their own documentation) while Kanban/Calendar/Gallery-of-the-demo, property editor, filter/sort, view switcher, context menus, hover states and light theme are recorded as "not reachable" with the specific permission error behind it. The `notion-clone-reference-demo` page also could not be deleted for the same reason (no keyboard path to Anytype's click-driven Bin) and is flagged for the operator to remove by hand**
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T016 Run the negative control against the widened schema and confirm it still goes red
- [ ] T017 `npm run screenshots:verify` and confirm every new capture is accounted for, not skipped
- [ ] T018 `npm run gate`, exit status read from `$?` and not through a pipe
- [ ] T019 Compare board and gantt capture hashes against T004's baseline; any move must be explained by a named gap from T012 or T013, never rebaselined silently
- [ ] T020 Read our board and gantt beside all three reference sets at both themes, by hand
- [ ] T021 Leave §4 rows 37 and 38 open. They close on the operator's own vault comparison and an agent never ticks an operator row
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Every acceptance criterion is `Met`, `Waived` or `Superseded`, except AC-007 which is the operator's
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **The ruling**: See `../roadmap.md` §4 rows 37 and 38, and §6A
- **Comparison style**: See `../037-timeline-gantt-port/acceptance-criteria.md` AC-007 and `../038-board-kanban-port/tasks.md` T12
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Licence position recorded per image source before any download. **Done — see T001**
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` clean; `npm run lint:tools` green
- [ ] CHK-011 [P0] The widened schema still rejects a malformed entry, proven by a negative control
- [ ] CHK-012 [P1] `verify.mjs`'s new class is deterministic — an entry never flips between classes
- [ ] CHK-013 [P1] No fidelity fix lands without a measured gap behind it
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met except the operator's
- [ ] CHK-021 [P0] `npm run screenshots:verify` accounts for every new capture rather than skipping it
- [ ] CHK-022 [P1] Board and gantt capture hashes compared against the baseline, not re-run
- [ ] CHK-023 [P1] Uncaptured rows recorded as uncaptured, with reasons
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each finding classed: the schema widening is `matrix/evidence`, each fidelity gap is `instance-only` until a second surface shows the same shape.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory: `rg -n 'project-manager|pm-kanban|pm-gantt' tools/screenshots tools/live` — every place the reference contract is written down.
- [ ] CHK-FIX-003 [P0] Consumer inventory for `REFERENCE_RENDERERS`, `captureRootFor` and `referenceOf`.
- [ ] CHK-FIX-004 [P0] The schema is a parser over external input; adversarial cases cover an unknown group, an unknown renderer, a missing `referenceOf` and a path escaping its root.
- [ ] CHK-FIX-005 [P1] Matrix axes listed: product x surface x source, 16 rows, with uncaptured rows named.
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the fix sha.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No credential used to obtain any competitor image; anything behind a login is out of scope. **Done — every official image fetched anonymously from `docs.anytype.io` or `appflowy.com`, no auth**
- [x] CHK-031 [P0] Downloaded images inspected before commit; nothing is fetched into the repository unreviewed. **Done — every official image and every installed-app capture was opened and read (Read tool) before being placed in its destination folder**
- [ ] CHK-032 [P1] The widened schema still rejects a `file` path escaping its capture root
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/checklist synchronized
- [x] CHK-041 [P1] `screenshots/README.md` describes both new roots and their provenance. **Done via `screenshots/anytype/README.md` and `screenshots/appflowy/README.md` instead of the generated top-level file — see T011 for why**
- [ ] CHK-042 [P2] `../roadmap.md` §4 rows 37/38 updated with what was measured — without ticking them
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Comparison working files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned of throwaway files before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 2/9 |
| P1 Items | 12 | 2/12 |
| P2 Items | 2 | 0/2 |

**Verification Date**: 2026-09-05, capture leg only (T001, T002, T008, T009, T011, T015, CHK-003, CHK-030, CHK-031, CHK-041). The contract-widening and fidelity-comparison rows (T005-T007, T012-T014, T016-T020 and their matching CHK rows) are a separate leg of this packet and remain unrun.
<!-- /ANCHOR:summary -->
