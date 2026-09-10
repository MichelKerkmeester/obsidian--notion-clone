---
title: "Tasks: Phase 11: record-sheet-header-and-icons"
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
# Tasks: Phase 11: record-sheet-header-and-icons

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
## Phase A: Baseline and the coverage gap

- [x] T001 DONE 2026-09-10 — Read `../sheet-notion-audit.md` §0, §1 and §3.3 before anything else. The finding here is Mechanism B — a contract that passes because its surface list omits the surface — and the fix must close the coverage gap, not just the symptom (`../sheet-notion-audit.md`)
- [x] T002 DONE 2026-09-10 — Run the lane and record the pre-change baseline verbatim: the title-centring clause's **13** named surfaces and each one's measured delta, plus `006`'s record clauses (21/21 rows at 44.0px, 20/20 hairlines, 16.0px inset, 0 native selects) (`tools/live/sheet-grammar.mjs`)
- [x] T003 DONE 2026-09-10 — Confirm the root cause rather than inheriting it: read `record-detail-panel.ts`'s header construction and `styles.css:10806-10825`, and verify that the clause's `.obnotion-shell-header` query (`sheet-grammar.mjs:3402`) is why this family was never eligible to fail. Record the confirmation (`src/views/record-detail-panel.ts`, `styles.css`, `tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — widen the contract before fixing the surface

- [x] T004 DONE 2026-09-10 — Add `record-detail` and `record-peek` to the title-centring clause's surface list **first**, before changing any producer. Run RED and record both measured deltas — this is the number the gate should have been reporting all along (`tools/live/sheet-grammar.mjs`)
- [x] T005 DONE 2026-09-10 — Add a **type-icon** clause: every record property row renders a type-icon element. Run RED first and record the count (today: 0 of 21) (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [x] T006 DONE 2026-09-10 — Decide the header shape with T002's and T004's measurements in hand and record the decision with its reasoning: either the record family adopts the shared `createSheetHeader` — routing its expand control through the existing `beforeClose` hook — or it keeps `.obnotion-record-detail-header` and is made to satisfy the contract in place. Then implement it for **both** record-detail and record-peek. Keep `min-width: 0` and the `word-break` that `styles.css:13969-13985` documents as the reason this header never overflowed (`src/views/record-detail-panel.ts`, `src/views/table-record-peek.ts`, `styles.css`)
- [x] T007 DONE 2026-09-10 — Give each record property row its type icon in the row's existing leading slot rather than by adding width, so the row's inner geometry does not move. Measure the pitch immediately afterwards and confirm it is still 44.0px before proceeding (`src/views/record-detail-panel.ts`, `styles.css`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression, unit proof and close

- [x] T008 DONE 2026-09-10 — Run GREEN on T004 and T005 and record every number. Then rerun `006`'s record clauses unchanged on **both** engines and confirm they still pass: 21/21 rows at 44.0px, 20/20 hairlines, 16.0px inset, 0 native selects, and no horizontal overflow at 402px with a long record title mounted (REQ-005). Confirm by `git diff` that the record's open target is untouched (REQ-006) (`tools/live/sheet-grammar.mjs`)
- [x] T009 DONE 2026-09-10 — Extend `record-detail-panel.test.ts` with a revert-proof unit test for the header contract and prove it red-then-green. Finish with the full battery — `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots` for the record sheet and record peek phone light+dark (REQ-007), `npm run gate` — then write the closing docs, validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`src/views/record-detail-panel.test.ts`)
<!-- /ANCHOR:phase-4 -->

---

### Design-review follow-ups (2026-09-10)

Opened by `../sheet-design-review.md` §4 F-3, a `sk-design-fundamentals` pass distinct from this
child's own Notion-parity work. Not yet implemented.

- [ ] T010 RED first: add a unit assertion to `record-detail-panel.test.ts` (or
  `card-field-renderer.test.ts` if the icon element is easier to reach there) that measures the
  rendered gap between a record property label's text node and its trailing type-icon span —
  either the icon's `getBoundingClientRect().left` minus the text node's own measured right edge,
  or simpler, that the icon element carries a non-zero `margin-left` (today it has
  `margin-right: 4px` and no `margin-left`, `styles.css:11329-11344`). Run against the unmodified
  tree and record the failure: computed gap is 0px (`src/views/record-detail-panel.test.ts`)
- [ ] T011 Fix at the source: either (a) swap `margin-right: 4px` to `margin-left: 4px` on
  `.obnotion-record-detail-field-label .obnotion-record-detail-field-type-icon`
  (`styles.css:11329-11344`) if the icon-after-label order is intentional, or (b) change
  `renderRecordField` (`record-detail-panel.ts:589`) to insert the icon **before** the label's text
  node — matching the Properties sheet's own icon-then-label order
  (`column-manager-renderer.ts:401`) — if leading placement is preferred for cross-sheet
  consistency. Either fix is a one-line change; pick (a) unless the operator prefers the
  cross-sheet match (`src/views/record-detail-panel.ts`, `styles.css`)
- [ ] T012 Verify GREEN: T010's assertion passes; rerun `011`'s own row-grammar clauses (21/21
  rows 44.0px, 20/20 hairlines, 16.0px inset, 21/21 type icons present) unchanged — the fix must
  not move the row's pitch or the value's left edge, only the gap between label text and icon.
  Recapture `constructed-record-detail-mobile-{light,dark}.png` and confirm by eye that
  `month`/`sort_key`/`Priority`/etc. no longer read glued to their type glyphs
  (`tools/live/sheet-grammar.mjs`, `screenshots/`)
