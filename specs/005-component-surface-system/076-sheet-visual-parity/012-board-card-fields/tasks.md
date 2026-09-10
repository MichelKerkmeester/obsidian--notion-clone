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

- [x] T001 Open the operator's capture and `anytype-mobile-set-kanban-{light,dark}.png`, and confirm `spec.md` §13's reading of each against the producer: read `styles.css:10178-10261` and `render-assertions.mjs`'s "meta grid" clause directly, and confirm the two-column grid is the mechanism, not a fixture gap. Re-check `screenshots/notion/ios/views/*board*`/`*kanban*` for any capture showing a configured property on a card; record the gap if none exists (`styles.css`, `tools/live/render-assertions.mjs`, `spec.md`)
- [x] T002 Enumerate every `renderCardField` consumer (`src/views/card-field-renderer.ts`) and confirm which selector scopes the two-column rule — `.obnotion-kanban-card-meta` only, or shared with Gallery/List's own field container. If a sibling selector shares it, add it to `spec.md` §3 before any implementation (D2a) (`src/views/card-field-renderer.ts`, `styles.css`, `spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [x] T003 Confirm the `constructed-board` scenario named in `plan.md` §3 mounts the production path end to end — scenario entry, mount driver, in-page entry, harness branch — by reading each link rather than assuming it (`tools/screenshots/constructed-scenarios.mjs`, `tools/live/render-assertion-harness.ts`)
- [x] T004 Write L1-L4 into `render-assertions.mjs`'s existing board-geometry pass, unwired to the fix, and confirm each can fail before it is asked to pass. Acquire the css-lane triplet for `styles.css` and record the baseline hash; confirm no other `076` child holds it (`tools/live/render-assertions.mjs`, `tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

Write-first throughout: each clause runs RED and its failing number is written down **before** the producer moves, and the lane's own pre-existing "meta grid" assertion is corrected in the same commit that stops it being satisfied by the two-column shape — never left defending a shape the producer no longer draws.

- [x] T005 Run L1 (meta grid), L2 (label overflow) and L4 (field-count parity) RED first and record all three failing numbers, including the pre-existing clause's own passing "2 columns at 1440px" reading, which is the number this task retires (`tools/live/render-assertions.mjs`)
- [x] T006 Collapse `.obnotion-kanban-card-meta` to a single always-on grid track and remove the now-unreachable 359.9px media query; leave the label's ellipsis rule and the value's line-clamp/alignment rule (`056` ADR-008) untouched. L1, L2 and L4 GREEN (`styles.css`)
- [x] T007 Invert the "meta grid" assertion in the same commit — `wideTwoCol && narrowOneCol` becomes `wide.metaColumns === 1 && narrow.metaColumns === 1` — and confirm L3 (row-pitch range) holds against the taller single-column card without change; if it does not, adjust the pitch assertion's range, not the 25px floor itself, and record the number (`tools/live/render-assertions.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [x] T008 Run `npm run screenshots </dev/null` and record the exit status and entry count, then `npm run screenshots:verify` and record the stale count. **Open the board's phone and desktop captures, light and dark, and look at each one** — confirm every field reads on its own full-width row and no label or value is truncated below what the schema's own longest names require. Run `board-card-properties-panel.test.ts` and confirm it is unmodified and green (`screenshots/notion-clone/views/constructed-board-*.png`, `src/views/board-card-properties-panel.test.ts`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [x] T009 Gate (a): run every lane clause and record each GREEN number beside the RED number T005 recorded. Re-run every existing `056`/`045` board clause (`GEOMETRY_PINS`, checkbox size, value align/wrap, header label size) unchanged, in the same run (`tools/live/render-assertions.mjs`)
- [ ] T010 Gate (b): give a Sonnet or Opus reviewer the board's phone capture and `anytype-mobile-set-kanban-light.png`, and have it score the eight-row rubric from `../spec.md` §5 — Frame, Sections, Row anatomy, Controls, Type, Spacing, Colour, Both themes — each 0/1/2. Write the score table with one justification line per row into `verification.md`. **Pass is ≥ 14/16 with no row at 0.** Gate (c): record the operator's device row in `acceptance-criteria.md` as **Unmet** — **no agent ticks it** (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T011 For every rubric row scoring below 2, open a remediation task and run the cycle: a clause RED for that row, the fix, GREEN, re-screenshot, re-judge. Append each iteration to `verification.md` as its own section with its own score table. **The child is not done until the judge passes twice in a row on an unchanged tree** — a second pass after a change is iteration *n+1*, not the second pass. If one rubric row fails three consecutive iterations, stop: the target is wrong, and DEFINE re-opens (`verification.md`, `spec.md`)
- [x] T012 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status and output. Release the css-lane triplet naming every capture that moved. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, and append a dated entry to `../../handover.md` with `recent_action` ≤ 96 characters (`../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->

---

<!-- ANCHOR:receipts -->
## Execution receipts (CREATE, 2026-09-10, this leg)

- T001/T002: the two-column rule is `.obnotion-kanban-card-meta`'s alone — the only `1fr 1fr` track declaration in styles.css; the record-detail, gallery and list field containers carry their own. The contradiction record already lived in `roadmap.md` §7.20, so no roadmap edit was owed.
- T004/T005 — RED, the pre-fix producer against the new expectations: `meta grid 2 column(s) at 1440px, 1 at 340px` (the retired reading) FAIL; `label fit 72 clipped of 306, worst "withdrawn" by 29px` FAIL; `field count 17/17, 17 configured` PASS already; `row pitch [25 × 17]` PASS; lane exit 1, the 155 other assertions untouched.
- T006/T007 — GREEN, the post-fix producer: `meta grid 1 column(s) at 1440px, 1 at 340px`; `label fit 0 clipped of 306`; `field count 17/17/17`; `row pitch [25 × 17] within 25–44px` — the pitch range held without adjustment.
- T008 — `npm run screenshots` ×2, exit 0, 480 entries each; `screenshots:verify` 480 current, 0 stale; decoded pixel delta across both runs: 57 movers, every one a board-card surface (12 content-sized, +100px taller cards; the frozen-column shimmer 36px at channel delta 1, identical in both runs — kept, not jitter); the machine-vision read of the phone capture: label + value on one row, the next property beneath, no mid-word truncation.
- T009 — gate (a): every clause GREEN beside its RED above; the existing board clauses (`field names` 306/306, `label style` 12px in the muted token, `value digits` tabular-nums, the GEOMETRY_PINS, `chip height` 24, `checkbox shape` 50%, the scrollbar quartet, `page scroll`, `column scroll`) ran unchanged and green in the same runs; `board-card-properties-panel.test.ts` unmodified and green.
- T012 — close-out: `npx tsc --noEmit` 0; vitest 1614/1614 (160 files); `npm run build` 0; `sheet-grammar.mjs` 0; `verify-placement.mjs` 0 (418/420, 2 declared); `render-assertions.mjs` 0; evidence 16/16 fresh after 12 stale writers re-ran; gate 28/0 exit 0; `scan-comments.mjs` 0; `scan-failing-values.mjs` 0; `check-lane.mjs` 0 — the release names all 56 content-changed captures (the 57th, the 36px@1 shimmer, moved bytes but not pixelHash); css-lane triplet acquire 21:39:09Z → edit `ca808893599b` → release 21:55:35Z, `baselineHash` = the judged stylesheet.
<!-- /ANCHOR:receipts -->
