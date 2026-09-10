---
title: "Tasks: Phase 2: Properties Sheet Visual Parity"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 2 tasks"
  - "002 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 2: Properties Sheet Visual Parity

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

Each task below is sized for one GLM 5.3 flash or Sonnet leg and states a number to record, not a judgement to make.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: DEFINE — the reference and the target table

- [ ] T001 Open every reference in `spec.md` §13 and record, per file, whether it shows this sheet or something else. Mobbin family names are unreliable: three reference reads this session each found roughly a third of files mislabelled. Record every value that cannot be read at 299×678 as a gap, never a guess (`screenshots/notion/ios/**`, `spec.md`)
- [ ] T002 Open our own current captures, light **and** dark, and fill the Ours column of §13 from what the image shows plus the producer that painted it. Confirm each claim against the producer before writing it — a capture and a source that disagree is the finding (`screenshots/notion-clone/**`, the producers in `plan.md` §3)
- [ ] T003 Enumerate every production surface that renders this grammar and add any the scaffold missed to `spec.md` §3. If one has no constructed scenario, that becomes T005 and precedes all implementation (D2a, D2b) (`tools/screenshots/constructed-scenarios.mjs`, `spec.md`)
- [ ] T004 Complete the Target column: every cell is a number measured from our own tree, or `TBD — needs operator capture`. No cell may be derived from a 299×678 asset. Record the contradiction list against landed `071` rulings and open each as a Proposed ADR in `../../roadmap.md` §7 (D3, D15) (`spec.md`, `../../roadmap.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T005 If T003 found an unregistered production surface, register it now: a constructed scenario mounting the shipped renderer with accurate `sources`. Nothing else proceeds until the sheet is photographed from production (`tools/screenshots/constructed-scenarios.mjs`)
- [ ] T006 Confirm the scenario named in `plan.md` §3 mounts the production path end to end — scenario entry, mount driver, in-page entry, harness branch — by reading each link rather than assuming it (`tools/screenshots/constructed-scenarios.mjs`, `tools/live/render-assertion-harness.ts`)
- [ ] T007 Write one lane clause per measurable row of §13 into the sheet-grammar lane, unwired, and confirm each one can fail before it is asked to pass (`tools/live/sheet-grammar.mjs`)
- [ ] T008 Acquire the css-lane triplet for `styles.css` and record the baseline hash. Confirm no other child holds it (`tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

Write-first throughout: the clause runs RED and its failing number is written down **before** the producer moves.

- [ ] T009 Replace the arrow pair with a single leading drag grip in the shared primitive, keeping a keyboard path on the survivor — `071/012` ADR-001 chose the arrows *for the sort sheet* because they carried the keyboard and the grip did not, so the grip introduced here must carry one or the ruling is contradicted rather than followed. Run L1 RED at 2 and record it (`src/views/record-surface/property-row.ts`, `styles.css`)
- [ ] T010 Move the state control from a leading checkbox to a trailing eye / eye-slash icon with a ≥ 44px box, and give the required property a visibly disabled state. Run L2 and L5 RED first and record both (`src/views/record-surface/property-row.ts`, `src/views/column-manager-renderer.ts`, `styles.css`)
- [ ] T011 Re-order the row to handle · type icon · label · eye and wrap the two sections in separate cards with a ≥ 8px gap, keeping the inline bulk link on each header. Run L3 and L4 RED first and record both (`src/views/column-manager-renderer.ts`, `styles.css`)
- [ ] T012 Re-run `008`'s record-sheet row clauses unchanged — `property-row.ts` is shared and every change here reaches that surface. Any regression closes here or the change is reverted (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T020 Run `npm run screenshots </dev/null` and record the exit status and the entry count. Then `npm run screenshots:verify` and record the stale count. A run that moved nothing proves nothing — say so if that is what happened (`tools/screenshots/capture.mjs`)
- [ ] T021 **Open the phone light and the phone dark capture and look at each one.** Record what changed against the pre-change capture, by decoded pixel delta and by eye. If the rebuild harness covers this sheet, run `node tools/live/sheet-rebuild.mjs` for the real-app WebKit path and record its exit status (`screenshots/notion-clone/**`, `tools/live/sheet-rebuild.mjs`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T022 Gate (a): run every lane clause and record each GREEN number beside the RED number T009+ recorded. Re-run the `071` clauses this sheet already carries, unchanged, in the same run (`tools/live/sheet-grammar.mjs`)
- [ ] T023 Gate (b): give a Sonnet or Opus reviewer our phone capture and the reference, and have it score the eight-row rubric from `../spec.md` §5 — Frame, Sections, Row anatomy, Controls, Type, Spacing, Colour, Both themes — each 0/1/2. Write the score table with one justification line per row into `verification.md`. **Pass is ≥ 14/16 with no row at 0** (`verification.md`)
- [ ] T024 Gate (c): record the operator's device row in `acceptance-criteria.md` as **Unmet**. **No agent ticks it** (`acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T025 For every rubric row scoring below 2, open a remediation task and run the cycle: a clause RED for that row, the fix, GREEN, re-screenshot, re-judge. Append each iteration to `verification.md` as its own section with its own score table. **The child is not done until the judge passes twice in a row on an unchanged tree** — a second pass after a change is iteration *n+1*, not the second pass. If one rubric row fails three consecutive iterations, stop: the target is wrong, and DEFINE re-opens (`verification.md`, `spec.md`)
- [ ] T026 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status and output. Release the css-lane triplet naming every capture that moved. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, and append a dated entry to `../../handover.md` with `recent_action` ≤ 96 characters (`../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
