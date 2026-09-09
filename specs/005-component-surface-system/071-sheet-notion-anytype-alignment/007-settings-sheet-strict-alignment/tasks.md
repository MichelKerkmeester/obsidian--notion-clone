---
title: "Tasks: Phase 7: settings-sheet-strict-alignment"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 7: settings-sheet-strict-alignment

<!-- SPECKIT_LEVEL: 3 -->

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
## Phase A: Reference capture and measurement

- [ ] T001 Ask the operator for a full-resolution Notion iOS database-settings screenshot from
  their own device (the scaffold's own reference, `screenshots/notion/ios/flows/database-settings/`,
  is a 299x678px Mobbin thumbnail with no native-resolution numbers, confirmed via `sips`). If
  supplied, measure card corner-radius, inter-card gap and card-to-edge inset from it and replace
  `spec.md` §13's `TBD` cells with the measured numbers. If not supplied within this leg's budget,
  proceed on the structural requirements only (REQ-002/REQ-004) and leave the three numeric cells
  `TBD` — never invent a number (`spec.md`, `002/decision-record.md` D-005)
- [ ] T002 Measure the current Settings sheet through the sheet-grammar lane before any change:
  confirm `002`'s existing PASS set (close 44x44, pitch 44-52px @48.0, 16px section inset, 0 native
  selects, no 402px overflow) as the pre-change baseline (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert the card-grouping shell

- [ ] T003 Add a card-grouping assertion to the settings-sheet lane: rows partition into ≥2 groups
  (when the underlying sections are ≥2, per spec.md §8 edge case), each group's container has
  `border-radius >= 1px` and a background color distinct from the sheet root's own background, and
  consecutive group containers have a visible gap `>= 1px` between them. Run RED first and record
  the failing count (today: 0 card containers exist) (`tools/live/sheet-grammar.mjs`)
- [ ] T004 Add the footer-card assertion, scoped to be a no-op today (spec.md REQ-005 records it
  N/A for this sheet's current row set): assert that IF a producer marks any row as
  sheet-level-action (a new marker class, not yet used by any row), it renders inside its own
  trailing card. Confirm 0 such rows exist today so the assertion passes vacuously rather than
  failing for a defect that is not there (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [ ] T005 In `view-config-panel-renderer.ts`, wrap each section's section-title element and its
  following rows in a new non-semantic container (e.g. `.obnotion-view-config-card`), without
  changing any row's own DOM structure, class list, or event handlers (`src/views/view-config-panel-renderer.ts`)
- [ ] T006 In `styles.css`, scoped to `.obnotion-view-config-panel.obnotion-mobile-bottom-sheet`:
  give the sheet root a canvas background token distinct from the card's; give
  `.obnotion-view-config-card` a background (the card token), `border-radius: var(--obnotion-radius-lg)`
  (8px, the existing token — revise only if T001 measures a different reference radius), and a
  margin/gap between consecutive cards from the existing spacing scale. Move the section-label
  placement to sit above its own card rather than inline with a top hairline (REQ-004) (`styles.css`)
- [ ] T007 Run GREEN on T003/T004's assertions and record the numbers (card count, radius, gap,
  background contrast) (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression and unit proof

- [ ] T008 Rerun `002`'s row-grammar and overflow assertions unchanged (44-52px pitch, 16px section
  inset, 1px hairline dividers, 0 native selects, no 402px overflow) and confirm they still pass
  under the new card wrapper (REQ-003) (`tools/live/sheet-grammar.mjs`)
- [ ] T009 Extend `view-config-sheet-row-grammar.test.ts` with a revert-proof unit test for the new
  card-wrapper class (reads `styles.css`, same pattern as `002`'s D-001 contract test): revert the
  card-background rule → 1 test fails; restore → all pass
  (`src/views/view-config-sheet-row-grammar.test.ts`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: Capture, gate, close

- [ ] T010 Recapture the Settings sheet phone-only, light and dark; record a measured before/after
  in `implementation-summary.md` against `spec.md` §13's gap table (`screenshots/`)
- [ ] T011 Full verification battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`,
  `node tools/live/sheet-grammar.mjs`, `node tools/live/touch-targets.json`'s lane, `npm run gate`
  — record each exit code (`tools/live/*`)
- [ ] T012 Write the closing docs (`acceptance-criteria.md`, `implementation-summary.md`,
  `decision-record.md` if a real decision needs recording, `goal.md` log), validate the packet
  (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet
  entry to `../../handover.md`
<!-- /ANCHOR:phase-5 -->
