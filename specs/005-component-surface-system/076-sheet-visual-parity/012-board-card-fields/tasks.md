---
title: "Tasks: Phase 12: Board Card Fields Never Wrap Side by Side"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 12 tasks"
  - "012 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 12: Board Card Fields Never Wrap Side by Side

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

Twelve tasks, each sized for one GLM 5.3 flash or Sonnet leg and stating a number to record, not a judgement to make.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: DEFINE — the reference and the target table

- [ ] T001 Open the operator's capture and `anytype-mobile-set-kanban-{light,dark}.png`, and confirm `spec.md` §13's reading of each against the producer: read `styles.css:10178-10261` and `render-assertions.mjs`'s "meta grid" clause directly, and confirm the two-column grid is the mechanism, not a fixture gap. Re-check `screenshots/notion/ios/views/*board*`/`*kanban*` for any capture showing a configured property on a card; record the gap if none exists (`styles.css`, `tools/live/render-assertions.mjs`, `spec.md`)
- [ ] T002 Enumerate every `renderCardField` consumer (`src/views/card-field-renderer.ts`) and confirm which selector scopes the two-column rule — `.obnotion-kanban-card-meta` only, or shared with Gallery/List's own field container. If a sibling selector shares it, add it to `spec.md` §3 before any implementation (D2a) (`src/views/card-field-renderer.ts`, `styles.css`, `spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T003 Confirm the `constructed-board` scenario named in `plan.md` §3 mounts the production path end to end — scenario entry, mount driver, in-page entry, harness branch — by reading each link rather than assuming it (`tools/screenshots/constructed-scenarios.mjs`, `tools/live/render-assertion-harness.ts`)
- [ ] T004 Write L1-L4 into `render-assertions.mjs`'s existing board-geometry pass, unwired to the fix, and confirm each can fail before it is asked to pass. Acquire the css-lane triplet for `styles.css` and record the baseline hash; confirm no other `076` child holds it (`tools/live/render-assertions.mjs`, `tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

Write-first throughout: each clause runs RED and its failing number is written down **before** the producer moves, and the lane's own pre-existing "meta grid" assertion is corrected in the same commit that stops it being satisfied by the two-column shape — never left defending a shape the producer no longer draws.

- [ ] T005 Run L1 (meta grid), L2 (label overflow) and L4 (field-count parity) RED first and record all three failing numbers, including the pre-existing clause's own passing "2 columns at 1440px" reading, which is the number this task retires (`tools/live/render-assertions.mjs`)
- [ ] T006 Collapse `.obnotion-kanban-card-meta` to a single always-on grid track and remove the now-unreachable 359.9px media query; leave the label's ellipsis rule and the value's line-clamp/alignment rule (`056` ADR-008) untouched. L1, L2 and L4 GREEN (`styles.css`)
- [ ] T007 Invert the "meta grid" assertion in the same commit — `wideTwoCol && narrowOneCol` becomes `wide.metaColumns === 1 && narrow.metaColumns === 1` — and confirm L3 (row-pitch range) holds against the taller single-column card without change; if it does not, adjust the pitch assertion's range, not the 25px floor itself, and record the number (`tools/live/render-assertions.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T008 Run `npm run screenshots </dev/null` and record the exit status and entry count, then `npm run screenshots:verify` and record the stale count. **Open the board's phone and desktop captures, light and dark, and look at each one** — confirm every field reads on its own full-width row and no label or value is truncated below what the schema's own longest names require. Run `board-card-properties-panel.test.ts` and confirm it is unmodified and green (`screenshots/notion-clone/views/constructed-board-*.png`, `src/views/board-card-properties-panel.test.ts`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T009 Gate (a): run every lane clause and record each GREEN number beside the RED number T005 recorded. Re-run every existing `056`/`045` board clause (`GEOMETRY_PINS`, checkbox size, value align/wrap, header label size) unchanged, in the same run (`tools/live/render-assertions.mjs`)
- [ ] T010 Gate (b): give a Sonnet or Opus reviewer the board's phone capture and `anytype-mobile-set-kanban-light.png`, and have it score the eight-row rubric from `../spec.md` §5 — Frame, Sections, Row anatomy, Controls, Type, Spacing, Colour, Both themes — each 0/1/2. Write the score table with one justification line per row into `verification.md`. **Pass is ≥ 14/16 with no row at 0.** Gate (c): record the operator's device row in `acceptance-criteria.md` as **Unmet** — **no agent ticks it** (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T011 For every rubric row scoring below 2, open a remediation task and run the cycle: a clause RED for that row, the fix, GREEN, re-screenshot, re-judge. Append each iteration to `verification.md` as its own section with its own score table. **The child is not done until the judge passes twice in a row on an unchanged tree** — a second pass after a change is iteration *n+1*, not the second pass. If one rubric row fails three consecutive iterations, stop: the target is wrong, and DEFINE re-opens (`verification.md`, `spec.md`)
- [ ] T012 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status and output. Release the css-lane triplet naming every capture that moved. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, and append a dated entry to `../../handover.md` with `recent_action` ≤ 96 characters (`../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
