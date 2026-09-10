---
title: "Tasks: Phase 7: Add / Edit Property Sheet Visual Parity"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 7 tasks"
  - "007 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 7: Add / Edit Property Sheet Visual Parity

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

- [ ] T009 Bring type selection into the same sheet as the name field as a flat inline list with no chevrons, collapsing the three-level chain the depth3 scenarios photograph. Run L1 RED at depth 3 and L2 RED at its chevron count, and record both (`src/views/modals/create-property-modal.ts`, `src/views/record-surface/type-picker.ts`)
- [ ] T010 Rebuild the name field as one bordered rounded field with the type icon inside it and the placeholder the reference uses. Run L3 RED first and record the field's current shape (`src/views/modals/create-property-modal.ts`, `styles.css`)
- [ ] T011 Give the edit sheet its card grammar: a static name+type row, a config card whose booleans are trailing toggles, and the delete row placed and coloured by the convention T004 recorded with its reasoning. Run L4 RED first and record it (`src/views/modals/create-property-modal.ts`, `styles.css`)
- [ ] T012 Re-run the `071/003` keyboard-inset regression with the name field focused and the keyboard up — the operator's original R6 defect was this sheet covering the note header. L5 must stay green (`tools/live/sheet-grammar.mjs`, `src/views/keyboard-inset.test.ts`)
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
