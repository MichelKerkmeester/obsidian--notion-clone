---
title: "Verification Checklist: Record and Relation Surfaces"
description: "The primitive and migration thresholds with the failing measurement recorded first, so a pass means a surface actually changed rather than a check being added."
trigger_phrases:
  - "054 checklist"
  - "record surface verification"
  - "primitive thresholds red first"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Record and Relation Surfaces

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per threshold, numbered to match the acceptance criteria. Counts are read by the census
lane — one page rendering the same column through every consumer — never by grep, which a renamed
class defeats. Desktop on the real renderer; phone on a 390×844 profile with a navbar present.

**T002 fills every `Today` cell.** A "today" cell written after the fix is a cell nobody can check
against the tree that produced it.

| # | Criterion | Today | Target | Evidence |
|---|-----------|-------|--------|----------|
| C1 | Distinct header builders across the record sheet, the peek and the properties panel | **4** — `record-detail-panel.ts:348-386`, `table-record-peek.ts:233-235`, `column-manager-renderer.ts:180`'s branch, `db-modal.ts:83-88`'s scrape | **1** (the P1 primitive) | [ ] |
| C2 | Distinct property-row vocabularies across the family | **3** — `card-field-renderer.ts:102`, `table-record-peek.ts:334`, the duplicated rows in `column-manager-renderer.ts:265` and `board-card-properties-panel.ts:48` | **1** (P2), with the peek's badge-fix copy retired | [ ] |
| C3 | Distinct property-type lists | **3** — `create-property-modal.ts:69-74`, `property-type-conflict-modal.ts:364-369`, `column-menu.ts`'s type submenu | **1** (P7) across all five consumer sites | [ ] |
| C4 | Hidden-properties group on the record sheet | **absent** — empties filtered wholesale by `showEmptyFields` (`record-detail-panel.ts:387-396`); the group exists only on the peek (`table-record-peek.ts:259-278`) | present with a count; expanded state survives a refresh | [ ] |
| C5 | Empty relation/select/multi-select affordance on the record sheet and board cards | **the word "Empty"** (`getEmptyDisplayValue`, `record-detail-panel.ts:636`) | an add affordance opening the occupied row's editor; "Empty" gone where an editor exists | [ ] |
| C6 | Exported per-type editor primitives | **0** — nine private methods behind `CellRenderer.startEdit` (`cell-renderer.ts:644`) | one exported module per type; the pinned dispatch test green; two editors mountable standalone | [ ] |
| C7 | `renderCardField`'s four external callers after the shim | all working today through the private copy | same tests green through the P2 shim | [ ] |
| C8 | Properties panel desktop rect after the P1 desktop variant | current geometry, operator-verified | unchanged, asserted by the lane | [ ] |
| C9 | Board-card reference captures after L3 | current `pixelHash` baseline, read before L3 starts | identical, or operator-ruled | [ ] |
| C10 | `migration-table.md` rows | **does not exist** | 10 surface rows + 7 behaviour rows, every capture filename resolved; behaviour rows carrying T001's image-true-up disposition | [ ] |
| C11 | `npm run gate` exit status with every negative control observed red | not yet run for this phase | exit **0**, each control red then green | [ ] |
| C12 | `npm run replay` | not yet run for this phase | holds with reversed **0** | [ ] |
| C13 | `npm run screenshots:verify` after the retirement sweep | green at HEAD | exit **0**; every changed capture opened and read by a person | [ ] |
| C14 | Census lane reads on headers / rows / type lists at close | 4 / 3 / 3 | **1 / 1 / 1**, with the bypass negative controls seen red | [ ] |

**C1, C2 and C14 are the componentization ask. C4 and C5 are the Anytype object-page ask. C6 is the
edit-surface ask. C11-C13 are the checks that the rest are not theatre.**

### What the captures could not show

The model behind this document could not open image files, so §5B's behaviour designs stand on the
capture index's own descriptions and the research's findings — T001 opens every named image by hand
and records the true-up before any design row is implemented (goal D1, AC-010). A capture that
cannot be opened is recorded as a gap in `migration-table.md`, never silently consumed.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The surface inventory is read from source, not from prior documents — ten
      surfaces at §5A with constructor `file:line` and header/row/editor citations
- [x] CHK-002 [P0] Every consumer file named in §3's Files-to-Change exists in this tree — checked
      against `src/views/` at authoring time
- [x] CHK-003 [P0] The level is derived, not guessed — `recommend-level.sh --loc 1800 --files 14` →
      Level 2, 50/100, confidence 90%; phase score 10/50 against a 25 threshold, so a standard
      child
- [x] CHK-004 [P0] What may not change is recorded: formulas/rollups/calculations (ADR-003), `044`'s
      grammar, `048`'s stacking, `023`'s note-body decision, `045`'s mechanism, `006`'s resolver,
      the PM 1:1 board and gantt (`spec.md` §3, §5B)
- [x] CHK-005 [P0] The 050 overlaps are references by item number, not duplicates — items 6, 9, 11
      named in `spec.md` §5C with the slice this phase takes
- [ ] CHK-006 [P0] T001 complete: every §5B capture opened by hand, dispositions recorded
- [ ] CHK-007 [P0] T002 complete: every Today cell above carries the measured number
- [ ] CHK-008 [P0] T003 complete: `migration-table.md` exists and passes AC-008's file check
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:implementation -->
## IMPLEMENTATION

- [ ] CHK-010 [P0] The primitives module family exists under `src/views/record-surface/` with
      `index.ts`'s contract table (ADR-001), and no consumer hosts a primitive another consumer
      imports
- [ ] CHK-011 [P0] The editor extraction is mechanical per ADR-002: one editor per leg, the dispatch
      test green before and after each, no behavioural edit inside a moved body
- [ ] CHK-012 [P0] Every phone surface added or changed carries `044`'s seven grammar elements, and
      every editor opened over the record sheet obeys `048`'s stacking model (goal D4 posture)
- [ ] CHK-013 [P1] The three spec open questions are resolved at T001 and recorded in
      `migration-table.md` §4 (desktop header DOM, quick-add placement, board-card add affordance)
- [ ] CHK-014 [P0] ADR-003 held: the formula workbench, rollup aggregation list and computed engine
      untouched except their type dropdowns' wiring
- [ ] CHK-015 [P0] No new architecture layer: the primitives are DOM builders and moved method
      bodies, not a rendering framework
<!-- /ANCHOR:implementation -->

---

<!-- ANCHOR:verification -->
## VERIFICATION

- [ ] CHK-020 [P0] Every AC in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and each
      waiver names an ADR that exists in `decision-record.md`
- [ ] CHK-021 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, status read from `$?`
- [ ] CHK-022 [P0] Every threshold's negative control was observed **red** before green, with every
      other row staying green while it was red
- [ ] CHK-023 [P0] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all pass, exit statuses
      read (the repo's three verification gates)
- [ ] CHK-024 [P0] Board-card reference captures `pixelHash`-identical after L3, or operator-ruled
- [ ] CHK-025 [P1] Captures recaptured and read by a person across both themes
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:operator -->
## OPERATOR ROWS — DEVICE CONFIRMATION

Nothing in this repository closes these. An agent never ticks one.

- [ ] OPS-001 [P0] **iOS.** The operator reads the record sheet as one object page against the
      Anytype object page
- [ ] OPS-002 [P0] **Desktop.** The operator reports no surface where a property looks or edits
      differently from the same property on another surface
- [ ] OPS-003 [P0] **Both.** The operator confirms formulas, rollups and aggregations behave exactly
      as before
<!-- /ANCHOR:operator -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 22 | 5/22 (CHK-001 through CHK-005 are the authoring checks, verified at authoring time) |
| P1 Items | 2 | 0/2 |
| Operator rows | 3 | 0/3 (never agent-ticked) |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->
