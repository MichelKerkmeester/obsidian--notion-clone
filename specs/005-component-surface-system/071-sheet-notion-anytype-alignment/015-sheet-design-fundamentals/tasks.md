---
title: "Tasks: Phase 15: sheet-design-fundamentals"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 15: sheet-design-fundamentals

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
## Phase A: Touch target — RED first

- [ ] T001 [P] Read `../sheet-design-review.md` §6 F-5 before any edit. Run
  `node tools/live/touch-targets.mjs` and confirm `.obnotion-calendar-mini-nav` prints among the
  sub-28px classes (`obnotion-calendar-mini-nav  smallest 24x24`) — this is the RED baseline,
  already true on the unmodified tree (`tools/live/touch-targets.mjs`)
- [ ] T002 Add a coarse-pointer assertion naming `.obnotion-calendar-mini-nav` explicitly (not
  swept in by the general sub-28px census, which reports but does not enforce) to
  `tools/live/sheet-grammar.mjs` or `tools/live/touch-targets.mjs` — whichever file's existing
  coarse-pointer block is the natural home, matching how
  `.obnotion-source-rule-icon-button`/`.obnotion-row-insert-button`/`.obnotion-timeline-mobile-menu-button`
  are asserted. Run it and record the RED failure: 24×24px against a ≥28×28px want
  (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: Touch target — GREEN

- [ ] T003 Add `.obnotion-calendar-mini-nav` to the coarse-pointer floor-raise block
  (`styles.css:24462-24486`), using `min-width`/`min-height: 28px` — not `width`/`height` — the
  same pattern its three siblings in the same block already use, so the declared 24px `width` on
  the base rule (`styles.css:17396-17409`) does not win the cascade back (`styles.css`)
- [ ] T004 Verify GREEN: T002's assertion passes. Recapture
  `constructed-date-picker-mobile-{light,dark}.png` and
  `field-date-value-picker-mobile-{light,dark}.png` and confirm by eye that the `‹ August 2026 ›`
  row's centring is undisturbed (`screenshots/`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Group sheet capture — RED first

- [ ] T005 [P] Confirm the coverage gap directly: `grep -rn "id: \"group\"" tools/screenshots/scenarios*.mjs tools/screenshots/scenarios/*.mjs` returns nothing, and `001/inventory.md` line 46 names the group sheet's own capture list as five toolbar-adjacent screenshots that do not depict it. This is the RED state — a design review cannot visually verify this surface today (`tools/screenshots/scenarios/panels.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Group sheet capture — GREEN

- [ ] T006 Register a `group` scenario following the `sort-panel`/`filter-panel` registration
  pattern in the same file: mount the toolbar's Group-by sheet (`toolbar-renderer.ts:1829`) with
  at least one group hidden, so the Shown/Hidden partition and its `Hide all`/`Show all` bulk
  actions are both visible in the capture. Name `toolbar-renderer.ts` in the scenario's `sources`
  list (`tools/screenshots/scenarios/panels.mjs`)
- [ ] T007 Run `npm run screenshots`, confirm the two new entries (`group-mobile-light.png`,
  `group-mobile-dark.png`) appear in `screenshots/manifest.json` with non-trivial byte counts, then
  **open both and look at them** per `repo-rules/screenshot-currency.md` — record what they show
  in this task's own completion note, the way every other landed task in this packet does
  (`screenshots/`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: Regression, verify and close

- [ ] T008 Rerun every landed sheet clause unchanged on both engines and confirm nothing
  regressed: `node tools/live/sheet-grammar.mjs`, `node tools/live/touch-targets.mjs`. Full
  battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — record each exit
  code (`tools/live/*`)
- [ ] T009 Write the closing docs (AC rows, goal log), validate
  (`NODE_PRESERVE_SYMLINKS=1 node "$(realpath .opencode)/skills/system-spec-kit/runtime/dist/lib/validation/orchestrator.js" specs/005-component-surface-system/071-sheet-notion-anytype-alignment/015-sheet-design-fundamentals --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md`
<!-- /ANCHOR:phase-5 -->
