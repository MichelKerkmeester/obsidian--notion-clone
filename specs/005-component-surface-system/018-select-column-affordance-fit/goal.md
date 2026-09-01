---
title: "Goal: Select Column Affordance Fit"
description: "What would make phase 018 worth having done, and the criteria that decide it."
trigger_phrases:
  - "018 goal"
  - "select column affordance goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/018-select-column-affordance-fit"
    last_updated_at: "2026-08-31T09:00:00Z"
    last_updated_by: "harness-dependence-review"
    recent_action: "Three rows measured and closed; the column width is now summed from painted boxes"
    next_safe_action: "The operator opens the table on the phone and reports the button has room"
    blockers:
      - "The desktop cell production paints holds a drag handle the fixture never contains"
      - "The phone column width is declared twice; only the CSS copy is measured"
      - "Not operator-confirmed on device"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-018-goal"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "Do the desktop drag handle and the row checkbox clear each other in a 40px column"
      - "Does the renderer build the reorder button only on touch, measured rather than read"
    answered_questions:
      - "runtime-vars.css pins nothing that reaches the select column; the fixture is the exposure"
---
# Goal: Select Column Affordance Fit

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The reorder button and the row checkbox share the select cell and must both fit in it,
on every surface that renders both. They overlapped: **−14px in a 49px cell on a phone, −17px on
desktop.**

**Why this phase exists at all is the more durable point.** The fix landed under
`004-checkbox-ownership`'s lane hold, and `004`'s acquire note names it — but all thirteen of `004`'s
criteria measure checkbox **appearance and ownership**, and none measures column geometry. `017`
independently disclaimed the two overlap checks as not its phase's. Both neighbours were right, and
nothing owned it.

### Decisions

| ID | Decision |
|----|----------|
| D1 | A lane hold is permission to edit a file. It is not a scope grant. |
| D2 | Every before-number here is copied from the lane journal, **not reproduced** — this phase opened after the fact and must not take a lane another phase holds. |
| D3 | No row may be marked Met on a recorded number alone. This program has already shipped a release on numbers nobody re-ran. |
| D4 | A criterion that reads a comment is not a measurement. The column width is re-measured from what the controls paint. |
| D5 | A number measured on a hand-written fixture is a fact about the fixture. The overlap check mounts the `table-mobile` screenshot scenario, so every row above says which of its claims survives that, and the two that do not are withdrawn. |
| D6 | A constant declared in both `styles.css` and TypeScript has one authority on device — the inline write — and a harness that loads only the stylesheet measures the other one. Say which copy a number came from. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] The gap between the button's right edge and the checkbox's left edge is ≥ 0 on every surface
      that renders both. Recorded failing at −14px phone and −17px desktop; recorded after at +4px in
      a 65px cell.
      **Met, re-measured on this tree:** `11 cells show both; narrowest gap 4px in a 65px cell`. The
      desktop surface renders no button at all, so it has no pair to collide.
- [x] Zero reorder buttons render in a desktop list or gallery row, which is what production builds —
      the table creates it only on touch. **Met:** `no reorder button is shown in 11 select cells,
      so nothing can collide`. Was present and unstyled in every desktop row, because a
      **touch-floor block declared `display: inline-flex`** at equal specificity and later in the
      file than the `display: none` written for the non-phone case. A minimum-size rule decided
      visibility, and a check on the gap alone would have gone green the moment the button
      disappeared without anyone establishing why.
- [x] The column width equals the sum of the painted control boxes and their insets, re-measured
      rather than read from a comment. Was 48px, from `48 = button 24 + checkbox 16 + gap 8` — true
      when written, untrue from the moment a different phase raised both controls to 28px. Two 28px
      controls do not fit in 48px at any gap, and a criterion that read the comment would still pass
      today.
      **Met, and now asserted rather than asserted-about.** A new check sums the boxes the browser
      painted: `cell 65px against 60px needed = padding 0 + button 28 + gap 4 + checkbox 28`. It
      cannot go stale the way the comment did, because nothing in it is read from prose.
      *A correction the measurement forced.* This row said the width is now `4 + 28 + 4 + 28 = 64`.
      The stylesheet declares 64px and the cell paints at **65px** — the extra pixel is its border —
      and the padding is **0**, not 4 a side. The controls are spaced by the flex layout and the
      checkbox's right pin, not by cell padding. So the arithmetic here was itself the kind of
      comment this criterion exists to distrust; the measured decomposition replaces it.
      *Negative control:* returning the column to 48px takes both checks red — gap −12px, and
      `cell 49px against 56px needed`. −12px rather than −14px because this control reverts the
      column alone, which is precisely the distinction the tick below records.
- [x] Both negative controls observed red, each moving only its own surface. Restoring the `display`
      declaration takes the desktop check red at **-17px in a 40px cell** while the phone stays
      green. The phone control takes it red while the desktop stays green. Restored, the harness
      returns to exit 0 and `styles.css` hashes byte-identical to the baseline.

      **Tick held, and narrowed to what a control can establish.** Both are complete — AC-2's fix was
      one edit and its control restores it; the phone's was two and its control now reverts both —
      and each moves only its own surface, which is what makes them discriminating. What they prove
      is that the check is wired to `styles.css`. They cannot prove it is wired to the product,
      because the subject they move is a **hand-written fixture**: `verify-placement.mjs:3228`
      renders the `table-mobile` screenshot scenario's markup, not a table `TableRenderer` built. The
      two consequences are in `acceptance-criteria.md` — the desktop gap is measured on a cell whose
      real occupant is a drag handle the fixture omits, and the phone width has a second declaration
      in `table-renderer.ts:475` that an inline style makes authoritative on device.

      **The phone control has to revert two edits, not one, and the first attempt reverted one.**
      This phase widened the column 48px to 64px *and* moved the phone checkbox pin from `right: 6px`
      to `4px`. Reverting only the column leaves the pin's 2px in place and measures **-12px**, a
      state that never shipped. Reverting both reproduces the recorded **-14px** exactly. The record
      was right; the incomplete control was not, and the conclusion drawn from it — that the
      reproduced number should be trusted over the recorded one — was backwards.
- [ ] The operator opens the table on the phone and reports that the button has room. A positive gap
      in a headless browser is necessary and never sufficient.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Read the coverage table at the end of `acceptance-criteria.md` before anything else.** It no longer
reads as it did when this line was written: the control cells were blank then and are filled now, and
the table has grown a row because AC-1's two arms have different answers. What blocks closure is no
longer a blank cell. It is that two rows are withdrawn — the desktop gap and the button-presence
count both measure a hand-written fixture rather than the renderer — and that AC-4 was never
requested. **This phase may not close today**, for those reasons rather than the earlier one.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Code | Shipped | Lane journal entry 64, under `004`'s hold |
| Numbers | Recorded, not reproduced | `acceptance-criteria.md` provenance note |
| Negative controls | Run, both red | Desktop -17px; phone -14px with both of its edits reverted |
| What they moved | A fixture, not the renderer | `verify-placement.mjs:3228` mounts the `table-mobile` screenshot scenario |
| AC-1 desktop, AC-2 | Withdrawn | Absence measured instead of clearance; `display` measured instead of presence |
| Operator confirmation | Not requested | — |

### Deviations and findings

| Item | Note |
|------|------|
| Opened after the code shipped | One of two orphans this program found; `roadmap.md` §6 |
| A rule's scope is not its name | A touch-floor block decided `display`. Same class of defect as the duplicate reorder-controls pair in `002` |
| A derived number in a comment goes stale silently | `48 = 24 + 16 + 8` was true when written and nothing recomputed it |

**DONE MEANS** the operator taps the little button beside a checkbox on their phone and hits it.
<!-- /ANCHOR:log -->
