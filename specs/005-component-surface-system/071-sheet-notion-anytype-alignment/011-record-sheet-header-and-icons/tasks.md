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
child's own Notion-parity work. F-3 implemented 2026-09-10 (this worktree); the review's other
routed findings stay with their own packets.

- [x] T010 DONE 2026-09-10 — Unit assertion added to `record-detail-panel.test.ts` (this suite
  reads shipped source, so the gap clause pins the icon's declarations through the suite's own
  `declarationsFor` helper: the icon element must carry a non-zero `margin-left`, the side that
  faces the label's text). Run against the unmodified tree: 1 failed | 3 passed — the new clause
  failed, the icon carried `margin-right: 4px` and no `margin-left`, computed text-to-icon gap
  0px (`src/views/record-detail-panel.test.ts`)
- [x] T011 DONE 2026-09-10 — Fix (a): `margin-right: 4px` → `margin-left: 4px` on
  `.obnotion-record-detail-field-type-icon` (`styles.css`), the icon-after-label order kept as
  intentional — the renderLabelTypeIcon callback appends the icon after the label's text, so the
  leading (left) edge is the one that owes the 4px rhythm gap, and the trailing margin was spent
  inside the label's fixed 96px box where it separates nothing. Fix (b) — re-inserting the icon
  before the label's text, the Properties sheet's own order — was considered and not taken: (a) is
  the one-line change and the record sheet's icon-after-label reading is its own landed order, not
  a defect (`src/views/record-detail-panel.ts`, `styles.css`)
- [x] T012 DONE 2026-09-10 — GREEN from the final state: T010's clause 4/4; `011`'s row-grammar
  clauses unchanged (sheet-grammar exit 0 — all eight grammar columns, every close target 44x44;
  render-assertions exit 0); the fix moved only the gap. Recaptured ×2 480/480 exit 0 both, both
  themes, judged by decoded pixel delta against the committed blobs, no image opened: 20 two-run
  movers kept at IDENTICAL counts and max deltas in both runs — the twelve record-detail
  detail/docked/peek captures whose label icons sit 4px further right of their label text (the
  gap this fix adds), 7 further movers outside the record sheet reproducing deterministically
  (table-column-header 34px@192, icon-picker x4, depth3-column-submenu x2, board-mobile-desktop-dark
  2px@1), and panel-record-detail-sheet-body-empty-desktop-light 6973px@1 moved in the first run
  only, its second run reproducing the committed blob; 1 jitter restored (project-manager/
  reference-kanban-mobile-light 1800px@1, second run only, manifest row re-stamped). The judgement
  is the 011 release entry in `tools/lane/css-lane.json` (`tools/live/sheet-grammar.mjs`,
  `screenshots/`)
