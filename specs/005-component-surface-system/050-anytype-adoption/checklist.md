---
title: "Verification Checklist: Anytype Adoption"
description: "The fourteen adoption thresholds with the failing measurement recorded first, so a pass means a surface actually changed rather than a check being added."
trigger_phrases:
  - "050 anytype adoption checklist"
  - "adoption verification"
  - "adoption thresholds"
  - "red first per item"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Anytype Adoption

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per adoption item, numbered to match `REQ-00N` and `AC-00N` and therefore `047` §11's own
items. Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present.

**T002 fills every `Today` cell that carries a mechanism rather than a figure.** A "today" cell
written after the fix is a cell nobody can check against the tree that produced it, so those rows do
not close until T002 has put a number in them and the fix has moved it.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Chip row present when a filter or sort is active; trigger icons state-dependent | **0 chips, 1 icon state** — neither `filter-panel-renderer.ts` nor `sort-panel-renderer.ts` renders a chip surface, and the toolbar's filter and sort icons behave identically whether or not anything is active | row present iff active; icon state tracks it | [ ] |
| C2 | Delay from view create/duplicate to view settings being open | **never — nothing opens**; `database-view.ts` returns to the board | ≤ **100ms** | [ ] |
| C3 | Board horizontal scrollbar position while the board is taller than the viewport | **at the board's own bottom**, off-screen until the page is scrolled to the board's end | sticky at the **viewport** bottom, with edge bleed | [ ] |
| C4 | Duplicate a view; config equality and id | **the action does not exist** in `active-view-controls-renderer.ts`, and neither does a view-tab context menu | config equal except `id` and name suffix; **new** id | [ ] |
| C5 | Per-view scroll offset after switching away and back | **0 — every switch returns to the top**; `view-state-store.ts` stores no offset | restored within **±2px**, per view | [ ] |
| C6 | Cell editor near the viewport's right edge | **clips**. T002 records the clipped width at the rightmost column | flips right-aligned within **92px** of the edge; 0 clipped editors | [ ] |
| C7 | Drag reorder under an active sort | **accepted, then silently undone by the sort** — no confirmation exists on either renderer | confirm raised; decline is a no-op; accept clears the sort | [ ] |
| C8 | Menu item count in the fully-restricted case, and the selection caps | **0 — an empty menu renders**; no capability gate and no caps exist in `row-menu.ts` or `bulk-edit-field-menu.ts` | **≥ 1** always, with a "No available actions" fallback; caps at >1 and >10 | [ ] |
| C9 | Distinct empty states | **1 — every condition renders the same state** in `empty-state-renderer.ts` | **3**: missing source, no matches, deleted group relation | [ ] |
| C10 | New-row values in a view carrying presets | **none applied — no preset can be stored** | every preset value applied; no-preset rows byte-identical to today | [ ] |
| C11 | Row index while a name is typed in a sorted view | **jumps mid-keystroke**. T002 records the keystroke count before the first jump | index held until commit or blur, then **1** reposition | [ ] |
| C12 | First embedded-view width at which a toolbar control overflows | T002 sweeps from **250px** upward and records the first overflow | **no** overflow at any width in the sweep, collapse driven by measured width | [ ] |
| C13 | Phone filter/sort surfaces rendering per-format condition rows, with `044`'s grammar | **0 of them** — the phone filter surfaces render one generic row shape | every supported format; **7 of 7** grammar elements | [ ] |
| C14 | Embedded view paging path | **virtualization path entered** | a page plus a "Load more" row; virtualization not entered | [ ] |
| C15 | Items carrying a design trued against a real Anytype screen or a named gap | **14 of 14 covered, five gaps named** — `design-trueup.md` §3 carries one section per item and §4's roll-up names the five with no capture: REQ-005, REQ-006, REQ-007, REQ-011, REQ-013 | **14 of 14** | [x] |
| C16 | `npm run gate` exit status with every negative control observed red | not yet run for this phase | exit **0**, each control red then green | [ ] |
| C17 | `screenshots/project-manager/` board and gantt reference `pixelHash` | baseline to be captured before the first leg that touches `board-renderer.ts` | identical, or operator-ruled | [ ] |

**C1, C2, C3 and C7 are what the operator will notice first. C16 is the check that C1-C15 are not
theatre, and C17 is the check that adopting Anytype did not cost us Project Manager.**

### Four items have no reference screen — settled at T001, reduced 2026-09-05

The packet expected six gaps: C1, C4, C6, C7, C8 and C10. The sweep closed C1's and half of C4's
and C8's, and it turned C10's from unphotographed into "absent from the shipped product". The
list of items with **no capture at all** was **REQ-005, REQ-006, REQ-007, REQ-011 and REQ-013**; it
is now **REQ-005, REQ-006, REQ-007 and REQ-011**, each marked *design inferred from source code, not
seen* in `design-trueup.md` §4. Two of the four (REQ-005, REQ-011) need no screen: they are behaviour
over time and no still can show them.

**Two corrections landed 2026-09-05 from `053`'s T001.** **REQ-013 leaves the list**: twelve desktop
relation formats with their condition pickers are captured under `menus/`, and the iOS simulator set
added four phone filter and sort sheets. And **C10's "absent from the shipped product" is withdrawn**
— the per-view default lives in the `New ⌄` menu's `Settings` section, not the view-settings panel
this read searched. Both are recorded in `design-trueup.md` §1's correction block.

Each is designed from `047`'s code-derived findings **with the gap named in `design-trueup.md`** —
never from a guess about what the screen looks like (goal D1).

**Six `Today` cells above are now known to be wrong**, because the packet was written from `047`'s
research without re-reading `src/views`: C1, C5, C8, C9, C13 and C14 assert a failing value this
tree does not have. `decision-record.md` ADR-004 restates the matching thresholds; T002 measures the
restated form, not the wording above.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The ranked item list is `047`'s, not re-derived — fourteen items, fit scores and
      target files read from `../047-competitor-references-and-pm-alignment/research/research.md` §11
- [x] CHK-002 [P0] Every target file the research names exists in this tree, checked before the
      requirements were written — all sixteen resolve under `src/views/` and at the repo root
- [x] CHK-003 [P0] The level is derived, not guessed — `recommend-level.sh --loc 1500 --files 16` →
      Level 2, 51/100, confidence 90%, raised to **Level 3** on judgment; phase score **20/50**
      against a threshold of 25, so a standard child rather than a phase parent
- [x] CHK-004 [P0] What may not change is recorded: `044`'s grammar, `048`'s stacking model, `003`'s
      portal and `038`/`037`'s Project Manager parity (`spec.md` §3 Out of Scope, `goal.md` D4, D5)
- [x] CHK-005 [P0] The four non-adoptions `047` recorded are carried into this packet as frozen
      (`goal.md` D6, `spec.md` §3 Out of Scope)
- [x] CHK-006 [P0] T001 complete: `design-trueup.md` exists with a section for all fourteen items,
      the gaps named (five at landing, **four after the 2026-09-05 corrections**), seven
      contradictions recorded (**C2 since withdrawn, C7 narrowed**) and six thresholds restated
      (**a seventh, AC-014's citation of a flat 60, restated 2026-09-05**)
- [ ] CHK-007 [P0] T002 complete: every mechanism-only `Today` cell above carries a measured number
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:implementation -->
## IMPLEMENTATION

- [ ] CHK-010 [P0] One leg, one file group — no file is opened by two legs, `styles.css` excepted
      and serialized by the parent's CSS lane (`goal.md` D7)
- [ ] CHK-011 [P0] Every item has a phone expression, or its absence is stated with a reason
      (`goal.md` D3)
- [ ] CHK-012 [P0] Every phone surface added or changed carries all seven `sheet-grammar` elements,
      and every surface that can open over another obeys `048`'s stacking model (`goal.md` D4)
- [ ] CHK-013 [P1] The chip surface has one owner rather than two panels writing competing rows
      (plan ADR-001)
- [ ] CHK-014 [P1] REQ-010 stayed the per-view preset slice and did not grow into the template
      system (plan ADR-002)
- [ ] CHK-015 [P0] No item introduced a new architecture layer — the claim `047` verified before
      ranking them still holds after they land
<!-- /ANCHOR:implementation -->

---

<!-- ANCHOR:verification -->
## VERIFICATION

- [ ] CHK-020 [P0] Every AC in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and each
      waiver names an ADR that exists
- [ ] CHK-021 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, status read from `$?`
- [ ] CHK-022 [P0] Every item's negative control was observed **red** before green, with every other
      row staying green while it was red
- [ ] CHK-023 [P1] `npm run replay` holds with reversed 0
- [ ] CHK-024 [P0] The board and gantt reference captures are `pixelHash`-identical to their
      pre-phase baseline, or the difference carries an operator ruling (`goal.md` D5)
- [ ] CHK-025 [P1] Captures recaptured and read by a person across both themes
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:operator -->
## OPERATOR ROWS — DEVICE CONFIRMATION

Nothing in this repository closes these. An agent never ticks one.

- [ ] OPS-001 [P0] **iOS.** The operator opens a filtered view on the phone and reports the chip row
      and the active trigger icons as readable at a glance
- [ ] OPS-002 [P0] **iOS.** The operator opens the phone filter sheet and reports the per-format
      condition rows as one sheet in `044`'s grammar rather than a generic list
- [ ] OPS-003 [P0] **Desktop.** The operator creates a view, lands in its settings, duplicates it,
      and reports both as the behavior they saw in Anytype
- [ ] OPS-004 [P0] **Desktop.** The operator scrolls a board taller than the window and reports the
      horizontal scrollbar as reachable without hunting for it
- [ ] OPS-005 [P0] **Both.** The operator confirms the board and the gantt still read as the 1:1
      Project Manager surfaces they were before this phase (`goal.md` D5)
<!-- /ANCHOR:operator -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 21 | 5/21 |
| P1 Items | 4 | 0/4 |
| P2 Items | 0 | 0/0 |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->
