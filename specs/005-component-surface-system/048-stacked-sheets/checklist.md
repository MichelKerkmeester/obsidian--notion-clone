---
title: "Verification Checklist: Stacked Sheets"
description: "Acceptance criteria with the failing number recorded first, so a pass means a stack actually changed rather than a check being added."
trigger_phrases:
  - "048 stacked sheets checklist"
  - "stacking verification"
  - "stacked pair thresholds"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Stacked Sheets

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. Every
measurement is taken on the real renderer at the production mount point, on a 390×844 phone profile,
with a navbar present, with a filter sheet and its operator dropdown as the reference stacked pair.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Stacked pairs named with a `file:line` opener | 0 — no such document existed; `003`'s census never asks which surface opens over which | every pair in the inventory | [x] `stacked-surface-inventory.md` §3 |
| C2 | Parent sheet bounding-box delta while a child is open | **unmeasured, and no code path reads the parent on child mount** — `setSheetMount` (`mobile-bottom-sheet.ts:274`) appends the child and touches nothing else. T003 fills this cell with the measured figure | \|Δ\| ≤ 1px per edge | [ ] |
| C3 | Scrim nodes while two sheets are open, and where the node sits | **1, behind both** — `setScrim` (`mobile-bottom-sheet.ts:478`) reuses one `.db-mobile-sheet-scrim` for however many sheets are open, by design | 1, **between** them | [ ] |
| C4 | Stacked children carrying a header with a 44px close | **0** — `createSheetHeader` and its equivalent are called by 5 surfaces (`filter-panel-renderer.ts:259`, `sort-panel-renderer.ts:113`, `toolbar-renderer.ts:1386`, `create-linked-view-modal.ts:59`, `view-config-panel-renderer.ts:388`), none of them a stacked child | every stacked child | [ ] |
| C5 | `--db-mobile-sheet-bottom` on each sheet of a pair under a 336px keyboard | **each sheet holds whatever its own last placement wrote** (`popover-position.ts:406`); `keepSheetPlaced`'s own comment records `844 → 844 → 844` beside `844 → 508 → 844` under one declared keyboard. T003 records the pair's figures | top 336px, beneath 0px | [ ] |
| C6 | Parent scroll offset and draft value after a child is dismissed | **unmeasured**; `filter-panel-renderer.ts:472-475` rebuilds the panel node on rerender and `originalMount` (`mobile-bottom-sheet.ts:255`) points a closing child at whichever node was its parent when it opened | both unchanged, by close and by drag | [ ] |
| C7 | Scroll affordance on a child taller than the viewport | **none** — the 14-property picker is cut mid-row at the sheet's bottom edge with no fade or scrollbar, per `../scratch/device-2026-09-05/stacked-filter-property-picker.png` | fade or scrollbar at the cut | [ ] |
| C8 | `sheet-grammar` registry rows that are stacked pairs | **0 of 8** — every registered surface is a first sheet (`tools/live/sheet-grammar.mjs:46-68`) | one per pair, ≥ 1 at depth 3 | [ ] |
| C9 | `npm run gate` exit status, with the stacking negative control observed red | not yet run for this phase | exit 0, control red then green | [ ] |

**C2, C3 and C4 are the three operator reports. C9 is the check that C1-C8 are not theatre.**

### Blank Failing Numbers

C2, C5 and C6 carry a mechanism rather than a number, and that is deliberate. Each names the code
path that makes the failure possible and defers the figure to T003, which measures it at runtime.
A "today" cell filled in later, after the fix, is a cell nobody can check against the tree that
produced it — so these three rows do not close until T003 has written a number into them and the
fix has moved it.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The three operator reports are quoted in `spec.md` §2 with the capture each came
      from named — `stacked-properties-create-property.png`, `stacked-filter-operator-dropdown.png`,
      `stacked-filter-property-picker.png`, all under `../scratch/device-2026-09-05/`
- [x] CHK-002 [P0] What may not change is recorded: `003`'s portal, `016`'s drag, `044`'s grammar
      and `031`'s dismissal routing are consumed unchanged (`spec.md` §3 Out of Scope, `goal.md` D8)
- [x] CHK-003 [P0] The level is derived, not guessed — `recommend-level.sh --loc 600 --files 13
      --architectural` → Level 2, 64/100, confidence 82%; phase score 10/50 against a threshold of
      25, so a standard child rather than a phase parent
- [x] CHK-004 [P1] The inventory is code-derived and cross-references `003`'s census rather than
      restating it (`stacked-surface-inventory.md`, T001)
- [ ] CHK-005 [P0] D1 answered by the operator. Blocks T014 and AC-004's modal rows only
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:implementation -->
## IMPLEMENTATION

- [ ] CHK-010 [P0] `parentId` is read somewhere — `rg -n "parentId" src/views` returns a consumer, not
      only the declaration at `overlay-stack.ts:47` and the store at `:54`
- [ ] CHK-011 [P0] The parent treatment is applied at the mount, not by each opener — one call site,
      so no consumer can forget it (`goal.md` D6, `044` D2 one level up)
- [ ] CHK-012 [P0] Parent and child are siblings on the body and never nested, so a parent's
      transform cannot become the containing block for a child's `position: fixed`
      (`mobile-bottom-sheet.ts:264-270` is the record of what that costs)
- [ ] CHK-013 [P1] A child removed with a bare `.remove()` still restores its parent, through the
      existing `MutationObserver` rather than through producer discipline
- [ ] CHK-014 [P1] Depth 3 works: record sheet → owned menu → submenu, and Properties → modal →
      dropdown, both mounted and both dismissed in order
<!-- /ANCHOR:implementation -->

---

<!-- ANCHOR:verification -->
## VERIFICATION

- [ ] CHK-020 [P0] Every AC in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and each
      waiver names an ADR that exists
- [ ] CHK-021 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, status read from `$?`
- [ ] CHK-022 [P0] The stacking negative control was observed **red** before green, on a registered
      pair, with every other row staying green
- [ ] CHK-023 [P1] `npm run replay` holds with reversed 0
- [ ] CHK-024 [P1] Captures recaptured and read by a person across both themes
- [ ] CHK-025 [P0] **The operator confirms on iOS.** Not tickable by an agent
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 3/12 |
| P1 Items | 7 | 1/7 |
| P2 Items | 0 | 0/0 |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->
