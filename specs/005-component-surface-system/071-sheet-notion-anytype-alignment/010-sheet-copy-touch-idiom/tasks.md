---
title: "Tasks: Phase 10: sheet-copy-touch-idiom"
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
# Tasks: Phase 10: sheet-copy-touch-idiom

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
## Phase A: Count and scope

- [ ] T001 Read `../sheet-notion-audit.md` §0 and §3.16 before any edit. Confirm the boundary: **four** strings are in scope because they reach a phone sheet renderer; **seven** are out of scope because they belong to cells and the desktop table, where naming a pointer gesture is correct copy (`../sheet-notion-audit.md`)
- [ ] T002 Produce the sheet-reachable key list mechanically rather than by eye: for every key in the EN block, grep `src/views/*-panel-renderer.ts`, `column-manager-renderer.ts` and the other sheet producers for its consumer, and emit the set of keys a phone sheet can render. This list is the scope of T003's clause; record it (`src/i18n.ts`, `src/views/`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert the count

- [ ] T003 Add a clause asserting that **0** keys in T002's sheet-reachable set match a pointer-gesture pattern (click, double-click, hover, and their zh equivalents). Run RED first and record the failing set — it must name exactly the four keys and none of the seven (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [ ] T004 Rewrite the four strings in **all three locales**, removing the pointer gesture and the spatial "below" while keeping each sentence's meaning and any button name it references. Read zh-CN and zh-TW for each key rather than sweeping EN alone — a locale may express the gesture idiomatically (`src/i18n.ts`)
- [ ] T005 Settle one ellipsis spelling across the EN block (today: 13 ASCII against 10 U+2026) and apply it to zh-CN and zh-TW. Run `npx vitest run` immediately afterwards and fix any fixture expectation that compared the old string, in this same change (`src/i18n.ts`)
- [ ] T006 Put the sheet-facing property label on one word across the filter and sort sheets. If the operator has not ruled on "Property" against "Field", default to **Property** — it matches Notion, our own `panel.addColumn`, and `panel.searchProperties` — and record the default as a decision rather than a silent choice (`src/i18n.ts`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Prove and close

- [ ] T007 Run GREEN on T003 and record the count. Confirm the seven out-of-scope strings are byte-identical (`git diff src/i18n.ts` naming each). Add the unit clause for the ellipsis spelling and the locale-parity rule, and prove it red-then-green by reintroducing one ASCII ellipsis (`src/i18n.test.ts`, `tools/live/sheet-grammar.mjs`)
- [ ] T008 Full battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots` for the Filter and Sort empty states phone light+dark, `npm run gate` — record each exit code. Then write the closing docs, validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`tools/live/*`)
<!-- /ANCHOR:phase-4 -->
