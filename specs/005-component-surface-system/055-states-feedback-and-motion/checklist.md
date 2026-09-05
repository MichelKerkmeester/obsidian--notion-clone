---
title: "Verification Checklist: States, Feedback and Motion"
description: "The phase's thresholds with the failing measurement recorded first, so a pass means a surface actually changed rather than a check being added — plus the Anytype pattern gaps named rather than invented."
trigger_phrases:
  - "055 checklist"
  - "states feedback verification"
  - "red first 055"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: States, Feedback and Motion

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per deliverable, numbered to the AC in `acceptance-criteria.md` it verifies. Desktop measurements on the real renderer
at the production mount point; phone measurements on a 390×844 profile with a navbar present.

**T001 fills every `Today` cell that carries a mechanism rather than a figure.** A "today" cell
written after the fix is a cell nobody can check against the tree that produced it.

| # | Criterion | Today | Target | Evidence |
|---|-----------|-------|--------|----------|
| C1 | Notice call sites carrying an action affordance | **0 of 247** — `grep -rn "new Notice(" src --include="*.ts"`, tests excluded; every one is bare | every owned site renders the toast with a clickable action where one is owed | [ ] |
| C2 | The migration notice's Undo | **no button** — `notice.galleryMigrated` (`src/i18n.ts:1455`) says "Undo to keep it a gallery" and renders through bare `new Notice` (`database-view.ts:2744`, `embedded-database-renderer.ts:764`) | Undo present and performing, `nothingToUndo` on an empty stack | [ ] |
| C3 | Confirm sheet's `044` grammar elements | **0 of 7 asserted** — `sheet` declared at `modals/confirm-modal.ts:42`, chrome inherited from `DbModal`, no exported primitive and no grammar row | **7 of 7** on the registered lane row, through **`051`'s** exported confirm primitive (its ADR-003) | [ ] |
| C4 | Confirm's stacked-pair treatment | **unregistered** — `048` inventory M-4 names the pair; no dim, no scale-back, shared scrim | parent |Δ| ≤ 1px, one scrim between, per registered pair | [ ] |
| C5 | Distinct empty states | **12 reasons ship** (`empty-state-renderer.ts:24-36`); **0 of 12 is the deleted-relation state** — deleted group field → silent re-group (`database-view.ts:2678`, `:2890`, `:3378`). `050`'s "all conditions render the same state" was false (`design-trueup.md` REQ-009) | the existing 12-to-3 mapping **asserted**, plus the deleted-relation state **built** and pointing at view settings | [ ] |
| C6 | Chart's empty-state component | **private** — `renderEmptyState` (`chart-renderer.ts:601-604`), `db-chart-empty`, six reasons (`chart-aggregation.ts:64`) | rendered through `EmptyStateRenderer`; `db-chart-empty` markup 0 | [ ] |
| C7 | Untokenized `120ms` transitions in `styles.css` | **42** (`grep -o "transition:[^;]*" styles.css | grep -c 120ms`); the shared token reaches 8 uses (`styles.css:113`) | 0 in this phase's files; census recorded for the rest | [ ] |
| C8 | Reduced-motion coverage of new surfaces | reset covers container descendants + `.db-surface` (`styles.css:918-947`), proven by `owned-menu-reduced-motion.test.ts`; toast and confirm do not exist yet | every touched surface named in the reset; coverage test extended | [ ] |
| C9 | Menu item count, fully-restricted selection; caps | **0 — empty menu**; no gate, no caps in `row-menu.ts` or `bulk-edit-field-menu.ts` | **≥ 1** with the fallback row; caps at >1 and >10 asserted at the boundaries | [ ] |
| C10 | Per-view scroll restore | **0 views restore**, but the machinery exists — `database-viewport.ts` has four request kinds (`:37`), captures `scrollTop` (`:67`) and restores raw (`:76`) or anchor-relative (`:84`); view switching asks `reset-top` | restored within **±2px**, per view, by **wiring the existing snapshot** — a second mechanism is the failure mode | [ ] |
| C11 | Embedded view paging path | **virtualization entered** | a page plus a "Load more" row; virtualization not entered | [ ] |
| C12 | `npm run gate` exit status with every negative control observed red | not yet run for this phase | exit **0**, each control red then green | [ ] |
| C13 | `screenshots/project-manager/` board and gantt `pixelHash` | baseline to be captured before the first leg that could move the board | identical, or operator-ruled | [ ] |

**C1, C2 and C5 are what the operator notices first. C12 is the check that C1-C11 are not
theatre; C13 is the check that the state work did not cost Project Manager.**

### Pattern gaps, named rather than invented

Three deliverables have no Anytype reference screen, and each is designed from a named finding
with the gap recorded here — `050` goal D1's discipline, carried:

- **The toast** — no Anytype capture shows a feedback surface and no `047` finding names one. The
  design is the vocabulary's consistency requirement (`state-feedback-vocabulary.md` §3); the
  Anytype contribution is never-empty menus and subtle motion, not a toast screen.
- **The "target" empty flavour and the deleted-relation state** — `047` §9 names both states but
  no capture shows them; `anytype-inlinecollection-empty-dark.png` shows only the "view" flavour.
- **The grammar and stacking rows** — measured by `044`'s and `048`'s own lanes, not by a
  competitor screen.

The only mobile reference set is `screenshots/anytype/mobile-official/` — 20 official images, no
installed-app mobile capture. Every phone expression here is measured against `044`'s grammar, not
against an Anytype screen.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The 050 items implemented here are quoted, not re-derived — AC-055-5/9/10/11
      carry AC-009/008/005/014's thresholds verbatim (`spec.md` §3, goal D3)
- [x] CHK-002 [P0] Every target file this phase names exists in this tree, checked before the
      requirements were written — `empty-state-renderer.ts`, `confirm-modal.ts`, `chart-renderer.ts`,
      `row-menu.ts`, `bulk-edit-field-menu.ts`, `view-state-store.ts`,
      `embedded-database-renderer.ts`, `database-view.ts`, `styles.css` all resolve
- [x] CHK-003 [P0] The level is derived, not guessed — `recommend-level.sh --loc 900 --files 8` →
      Level 1, 43/100, confidence 80%; `--architectural` phase score 20/50 against a 25 threshold,
      so a standard child; raised to **Level 3** on judgment (program-wide contract reach, 050's
      precedent)
- [x] CHK-004 [P0] What may not change is recorded: the table's density, the sheets' ownership,
      formulas/rollups/calculations, and `038`/`037`'s Project Manager parity (`spec.md` §3,
      goal D4)
- [ ] CHK-005 [P0] T001 complete: every mechanism-only `Today` cell above carries a measured number
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:implementation -->
## IMPLEMENTATION

- [ ] CHK-010 [P0] One leg, one file group — no file is opened by two legs, `styles.css` excepted
      and serialized by the parent's CSS lane (`plan.md` §Affected Surfaces)
- [ ] CHK-011 [P0] Every deliverable has a phone expression, or its absence is stated with a
      reason — the toast and the two empty flavours render on both; the confirm's phone
      expression **is** the grammar row
- [ ] CHK-012 [P0] Every phone surface added or changed carries all seven `sheet-grammar`
      elements, and every surface that can open over another obeys `048`'s stacking model
      (goal D4's constraint pass-through)
- [ ] CHK-013 [P1] The confirm keeps one signature and gains the grammar inside, per ADR-055-2 —
      no second confirm path exists
- [ ] CHK-014 [P1] The rail and the bar's undo became placements of one component, per ADR-055-1 —
      three feedback contracts collapsed to one
- [ ] CHK-015 [P0] No deliverable introduced a new architecture layer — the toast mounts through
      the owned-menu precedent, the confirm through `DbModal`'s declared presentation
- [ ] CHK-016 [P0] The gallery received inheritance only — no new state work in
      `gallery-renderer.ts` (goal D7)
<!-- /ANCHOR:implementation -->

---

<!-- ANCHOR:verification -->
## VERIFICATION

- [ ] CHK-020 [P0] Every AC in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and
      each waiver names an ADR that exists
- [ ] CHK-021 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, status read from `$?`
- [ ] CHK-022 [P0] Every deliverable's negative control was observed **red** before green, with
      every other row staying green while it was red
- [ ] CHK-023 [P1] `npm run replay` holds with reversed 0
- [ ] CHK-024 [P0] The board and gantt reference captures are `pixelHash`-identical to their
      pre-phase baseline, or the difference carries an operator ruling (goal D4)
- [ ] CHK-025 [P1] Changed captures recaptured and read by a person across both themes
      (`repo-rules/screenshot-currency.md`)
- [ ] CHK-026 [P0] Every new or changed rendered state got its scenario registration in the same
      change, and each scenario's `sources` list names the files the capture depicts
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:operator -->
## OPERATOR ROWS — DEVICE CONFIRMATION

Nothing in this repository closes these. An agent never ticks one.

- [ ] OPS-001 [P0] **Both.** The operator deletes a row and reads the confirmation as a sheet in
      `044`'s grammar, stacked over whatever opened it, and the deletion notice's feedback as clear
- [ ] OPS-002 [P0] **Both.** The operator deletes a board's group field and reads a state that
      names the problem and points at view settings — not a board re-grouped by a different column
- [ ] OPS-003 [P0] **Both.** The operator triggers the gallery→board migration notice and reports
      the Undo as present and working, or the empty-stack case reporting honestly
- [ ] OPS-004 [P0] **Both.** The operator confirms the board and the gantt still read as the 1:1
      Project Manager surfaces they were before this phase (goal D4)
<!-- /ANCHOR:operator -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 17 | 4/17 |
| P1 Items | 4 | 0/4 |
| P2 Items | 0 | 0/0 |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->
