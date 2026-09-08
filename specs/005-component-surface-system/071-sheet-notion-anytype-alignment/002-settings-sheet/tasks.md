---
title: "Tasks: Phase 2: settings-sheet"
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
# Tasks: Phase 2: settings-sheet

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
## Phase A: Measure and target

- [x] T001 Read the Phase 1 inventory row for the Settings sheet (producer `src/views/database-view.ts:5169`, captures `panel-view-config` / `panel-view-config-sheet`) (`../001-sheet-story-coverage-audit/inventory.md`)
- [x] T002 Measure the current Settings sheet through the sheet-grammar lane: close 44×44, title ≥16px, 90svH cap (759.6/844), stacking-width ratio ≥0.9, no right-edge overflow — all PASS before the redesign (`tools/live/sheet-grammar.mjs`)
- [x] T003 Write the gap table (header, row pitch, label/value layout, dividers, section grouping, selects, toggles, padding, typography, overflow) into `spec.md` §13; reference columns honestly `TBD` — the third-party captures carry no readable measurements (`spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert the Notion-shaped targets

- [x] T004 Extend the settings-sheet lane rows in the sheet-grammar lane: compact control rows (dropdown/checkbox/switch/summary/readonly) must render one line, label left / control right, 44–52px pitch; editor rows (text/textarea/range/stack) keep label-above-control at ≥90% width (`tools/live/sheet-grammar.mjs`)
- [x] T005 Add the section-heading + divider-inset assertion (16px inset, 1px divider, first-of-type 0px) and the no-horizontal-overflow assertion at 402×874 (extent = scrollWidth − borderLeft == clientWidth) (`tools/live/sheet-grammar.mjs`)
- [x] T006 Run RED and record the numbers: 0/12 compact rows one-line, 3/12 pitch, 2/2 headings at 12px/0px, 4 failures, exit 1 (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [x] T007 Implement the row grammar in `styles.css` only — scope the column override to editor rows via the field-variant classes the renderer already lands; producer untouched (`styles.css`, `src/views/view-config-panel-renderer.ts`)
- [x] T008 Add the divider token fallback (`--obnotion-border-subtle` → 1px #333333 where the host token is missing) and the 1px left-border asymmetry note for the side-sheet grammar (`styles.css`)
- [x] T009 Run GREEN: 12/12 compact rows one-line at 48.0px, 9/9 editor rows, headings 16px inset + 1px divider, extent 401 == 401 at 402px, exit 0 (`tools/live/sheet-grammar.mjs`)
- [x] T010 Prove the lane bit: add the row-grammar unit test (reads `styles.css`), 6/6 PASS; revert the blanket column line → 1 failed | 5 passed; restore → 6/6 (`src/views/view-config-sheet-row-grammar.test.ts`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Verify, capture, gate

- [x] T011 Full verification battery: `npx tsc --noEmit` 0; `npx vitest run` 1687/1687; `npm run build` 0; sheet-grammar 0; render-assertions 0; touch-targets 0; verify-placement 0 (`styles.css`, `tools/live/*`)
- [x] T012 Screenshots ×2 (616/616, exit 0 both) + pixel-delta: 6 PIXEL-changed (all in the settings view-config family), 4 byte-only, 2 jitter (≤12, one-run) restored with their manifest hashes patched back; screenshots:verify 616 match (`screenshots/manifest.json`, `tools/live/capture-device-parity.json`)
- [x] T013 Evidence: 9/15 stale after the style edit → 9 writers re-run (8×0; engine-parity exit 1 = INFORMATIONAL, 50→53 disagreements, +10/−7, all panel-base-import-modal checkbox-tint notes, 0 settings fixtures) → 15/15 fresh (`tools/live/*.json`)
- [x] T014 Gate: css-lane acquire/edit/release with the ledger signed (holder = this packet, baselineHash `368631d8cd1f`); 1st run 26/27 (css-lane RED, no phase claimed); 2nd run PASS — 27 lanes green, 0 unexpected, exit 0 (`tools/lane/css-lane.json`)
- [x] T015 Comment hygiene: `node tools/naming/scan-comments.mjs` 0 after 1 fix; `node tools/naming/scan-failing-values.mjs` 0 (`tools/naming/`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: Close

- [x] T016 Write the docs (this file, `acceptance-criteria.md`, `implementation-summary.md`, `decision-record.md`, `goal.md` log) and validate the packet: orchestrator `--strict` → `RESULT: PASSED` (packet docs)
- [x] T017 Backfill the packet's graph metadata and append the packet entry to the 005 handover (`graph-metadata.json`, `../../handover.md`)
<!-- /ANCHOR:phase-5 -->
