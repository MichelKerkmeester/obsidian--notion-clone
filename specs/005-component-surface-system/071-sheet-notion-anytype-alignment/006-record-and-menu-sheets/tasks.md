---
title: "Tasks: Phase 6: record-and-menu-sheets"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 6: record-and-menu-sheets

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
## Phase 1: Ground truth

- [x] T001 Read the reference mapping rows this packet depends on: the record detail sheet (`../001-sheet-story-coverage-audit/inventory.md:47`, producer `src/views/record-detail-panel.ts:172`), the record peek (line 48), the record sheet's six menu-card children (lines 120–125) and the column-menu popover (line 94) (`../001-sheet-story-coverage-audit/inventory.md`)
- [x] T002 Measure the record sheet's phone presentation through the sheet-grammar lane before any edit: close 44×44, no right-edge overflow, the owned-menu parent dim 0.390 — all PASS; the row grammar unmeasured (`tools/live/sheet-grammar.mjs`)
- [x] T003 Write the gap table (header, row pitch, label/value layout, dividers, section grouping, selects, toggles, horizontal padding, typography, surface height/overflow, menu-card popovers) into `spec.md` §13; reference columns honestly `TBD` — the third-party captures carry no readable measurements (D-005, inherited) (`spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 RED: extend the sheet-grammar lane with the record sheet's reference row grammar — one property per row, label left / value right on one line at 44–52px, the shared 16px inset read from the content edge (extent-minus-border), a hairline under every row but the last, section headings on that inset behind a 1px divider, 0 native selects, no horizontal overflow at 402px — plus the 44px floor on the record family's own option and menu rows in the stacked-pair reports, and the inset-and-floor negative control. Ran red: 21/21 at 61.0px (last 60.0), inset 25.0px, headings 13.0px/0px, restore-check failed, 4 failures, exit 1 (`tools/live/sheet-grammar.mjs`)
- [x] T005 Implement in `styles.css` only: the phone record sheet's shared 16px inset on the surface, the field row's 8px/0 padding, the five measured row shapes' border-box, the disclosure's section headings (2px/0, 6px margin, 1px divider) and its rows' and disclosure controls' inset ownership. The menu-card half ships no new stylesheet (D-005) (`styles.css`)
- [x] T006 Give the record field row the second documented zero-horizontal-padding exception in the row-pitch contract, after the Add-view precedent (`src/views/sheet-grammar.ts`)
- [x] T007 Pin the shipped declarations: `src/views/record-sheet-row-grammar.test.ts` reads `styles.css` the way the browser resolves it — the shared inset, the floor's box, the hairline, the disclosure's divider, the 96px label column (`src/views/record-sheet-row-grammar.test.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 GREEN: the same assertions ran green — 21/21 at 44.0px, inset 16.0px, heading 16.0px/1px, 0 native selects, extent 401 ≤ 401 at 402px, 2166 PASS / 0 FAIL, exit 0; the negative control measured red (inset 6.0px, 21/21 rows under the floor) then restored (`tools/live/sheet-grammar.mjs`)
- [x] T009 Unit revert proof: 5/5 → 1 failed / 4 passed on the shared-inset line → 5/5 (`src/views/record-sheet-row-grammar.test.ts`)
- [x] T010 Full gates: `npx tsc --noEmit` 0; `npx vitest run` 1738/1738 (161 files) 0; `npm run build` 0; `render-assertions` 0; `touch-targets` 0; `verify-placement` 0 (413/415, 2 declared)
- [x] T011 Recapture ×2 (616/616, exit 0 both) + decoded pixel-delta: 21 content movers judged kept and named in the css-lane release; 9 jitter (≤12, one run) restored + their manifest hashes; 9 byte-only (6 recurring one-bit, 3 one-run variances above the 12 floor, kept) (`npm run screenshots`, the pixel-delta pass, `tools/lane/css-lane.json`)
- [x] T012 Evidence loop: 11 stale artefacts re-run; 15/15 fresh; engine-parity 1 INFORMATIONAL by design (43→67 disagreeing elements, +6 selector-pairs, all panel-modal checkbox-tint, 0 record-family fixtures — the 002 precedent) (`node tools/live/evidence.mjs --check-all`)
- [x] T013 The 27-lane gate: PASS, 27/27, 0 red for a declared reason, exit 0 (`npm run gate`)
- [x] T014 Naming scans: `scan-comments.mjs` 0 (524 files, no artifact ids); `scan-failing-values.mjs` 0 (443 ticked criteria, none newly bare)
- [x] T015 Documentation: this checklist, `acceptance-criteria.md` (AC-001/002/003 → `Met`), `implementation-summary.md`, `decision-record.md` (five decisions), `goal.md` log; the graph metadata backfilled (`--strict` → `RESULT: PASSED`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification passed — every check above ran foreground with its exit code read; the operator's own device recheck remains the program's closing condition and is not this leg's to tick
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->

---
