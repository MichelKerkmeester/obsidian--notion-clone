---
title: "Tasks: Phase 18: Board Visual Parity (ClickUp)"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 18 tasks"
  - "018 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 18: Board Visual Parity (ClickUp)

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

Fourteen tasks, each sized for one Sonnet leg and stating a number to record.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: DEFINE — the reference and the target table

- [ ] T001 Open `clickup-board-column-headers-reference.png` and the ClickUp harvest (`screenshots/clickup/ios/views/**`) for additional board states; read `board-renderer.ts`'s current header/body producer and confirm the gap against §13's reading (`scratchpad/operator-references/clickup-board-column-headers-reference.png`, `screenshots/clickup/ios/views/**`, `src/views/board-renderer.ts`, `spec.md`)
- [ ] T002 Draft the Proposed ADR against `056` ADR-001 in `../../roadmap.md` §7, naming the operator's 2026-09-11 board-specific ruling as its resolution (`../../roadmap.md`)
- [ ] T003 Read `card-field-renderer.ts`'s title-row and meta-row DOM shape and confirm it can carry a section label, status icon, relation glyph and meta-row dividers without touching `012`'s single-column field rule (`src/views/card-field-renderer.ts`, `../012-board-card-fields/spec.md`)
- [ ] T004 Confirm `board-card-properties-panel.test.ts`'s fixtures are unaffected by the planned header/body/anatomy changes (`src/views/board-card-properties-panel.test.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T005 Confirm the `constructed-board` scenario (shared with `012`) mounts the production path end to end (`tools/screenshots/constructed-scenarios.mjs`, `tools/live/render-assertion-harness.ts`)
- [ ] T006 Write new clauses (header pill presence/colour, collapsed-pill rotation, column tint/outline, card-anatomy rows) into `render-assertions.mjs`'s existing board-geometry pass, unwired; acquire the css-lane triplet and confirm neither `012` nor `019` currently holds it (`tools/live/render-assertions.mjs`, `tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

- [ ] T007 Run every new clause RED and record the failing numbers, alongside `012`'s and `056`'s existing clauses re-run as a baseline (`tools/live/render-assertions.mjs`)
- [ ] T008 Implement the status-coloured header pill, collapse/add controls, collapsed vertical pill, column tint/outline, and card-anatomy rows (section label, title row, meta row) (`src/views/board-renderer.ts`, `src/views/card-field-renderer.ts`, `styles.css`)
- [ ] T009 Run every new clause GREEN and confirm `012`'s and `056`'s clauses still pass unchanged in the same run (`tools/live/render-assertions.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T010 Run `npm run screenshots </dev/null`, record exit status; `npm run screenshots:verify`, record stale count. Open the board's phone and desktop captures, light and dark, and look at each one against the ClickUp reference. Run `board-card-properties-panel.test.ts` and confirm unmodified and green (`screenshots/notion-clone/views/constructed-board-*.png`, `src/views/board-card-properties-panel.test.ts`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T011 Gate (a): run every lane clause and record each GREEN number beside T007's RED number, including `012`/`056`'s unchanged clauses (`tools/live/render-assertions.mjs`)
- [ ] T012 Gate (b): score the eight-row rubric against the ClickUp reference into `verification.md`. Pass is ≥ 14/16 with no row at 0. Gate (c): record the operator's device row in `acceptance-criteria.md` as Unmet (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T013 For every rubric row scoring below 2, open a remediation cycle: RED, fix, GREEN, recapture, re-judge. Three consecutive fails on one row re-opens DEFINE (`verification.md`, `spec.md`)
- [ ] T014 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status. Release the css-lane triplet. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, finalize the roadmap ADR entry's status, append a dated entry to `../../handover.md` (`../goal.md`, `../checklist.md`, `../../roadmap.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
