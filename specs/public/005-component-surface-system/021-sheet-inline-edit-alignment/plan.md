---
title: "Implementation Plan: Sheet Inline Edit Alignment"
description: "A record of the approach taken: establish what the editor is, size it to the row rather than letting the row stretch, and freeze desktop. Written after a fresh review corrected the editor count."
trigger_phrases:
  - "021 inline edit plan"
  - "overlay versus flex child"
  - "sheet row min height token"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Sheet Inline Edit Alignment

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This plan is a record of the approach that was taken, not a forecast.** The work has shipped as
`0ff9f9a`, and one criterion remains open.

**It is also written after a fresh review corrected the phase's own account of its subject.** The
sheet opens **five** editors, two of them inline — not four with one inline. The plan below describes
the approach against the corrected inventory, because a plan restating a withdrawn claim would
re-teach the error to the next reader.

The approach in one line: establish whether the editor is a flex child or an overlay, because the two
want opposite fixes; find it is an overlay; then buy "the row contains the editor" by sizing the
editor to the row rather than by letting the row stretch, since an out-of-flow box cannot make its
row grow.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Results are the values read at ship.

| Gate | Command | Pass condition | Result |
|---|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 | exit 0 |
| Build | `npm run build` | exit 0 | clean, `main.js` byte-identical |
| Unit | `npx vitest run` | exit 0, no reduction | **444 passed** |
| Gate | `npm run gate` | exit 0 | **14 green, exit 0** |
| Placement | `npm run storybook:placement` | no unexplained red | **186/190**, 4 red for a declared reason, exit 0 |
| Captures | `npm run screenshots:verify` | current | **224 entries**, green |
| Evidence | `evidence.mjs --check-all` | fresh | **8 of 8** |

Of the 190 placement checks, **6 arrived from a concurrent session** and the 267-line section
carrying this phase's 7 is this phase's. That distinction is not bookkeeping: a reconciling check
count can sit on top of a wrong body, which is why the section was re-verified by content.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**The first question decided everything.** Is the editor an ordinary flex child of the row, or an
overlay? The two want opposite fixes, and the row already declares `align-items: center` — so if it
were a flex child it would already be centred and there would be no defect to explain.

It is an overlay: `position: absolute`, parent is the sheet panel, not a flex child of the row.
Measured through the shipped `CellRenderer`. **An out-of-flow box cannot make its row grow**, so
containment has to be bought by sizing the editor to the row.

**The five editors, and which two are inline.** The sheet opens five editors. Two are inline — the
number/currency editor and the title's rename editor, both `.db-cell-line-edit-popover`. Three are
deliberately different affordances: two docked below the row, one a list popover, and none of them
belongs on the value's centre line.

The earlier count of four, with one inline, is **withdrawn**. It is the reason the title editor was
excluded by a scoping argument while the declarations reached it anyway.

**The offset is arithmetic.** `CellRenderer.editSingleLinePopover` hands the editor to
`positionTextEditPopover`, which puts the popover's top edge on the anchor's top edge. In a table that
is right, since a `<td>` and its editor are nearly the same height. In the sheet the anchor is a
21.6px line centred in a 44px row and the editor is 34.8px, so the editor hangs 6.6px low — half the
difference between the two heights, plus the sheet's 1px border.

That the offset is arithmetic rather than incidental has two consequences. It predicts the defect
grows with the editor, which is why the device shows a larger overlap than a harness loading only
`styles.css`: Obsidian's `app.css` gives every input a box of its own and is not present here. **And
it predicts the open residue** — a correction derived from the value's 21.6px line box is wrong by
1.4px on the title, whose line box is 18.85px.

**One literal, one declaration.** Three declarations have to agree on the row height and two of them
are a negative margin computed from it, so `--db-sheet-row-min-height: 44px` is declared once on the
sheet and read by the rest. A drifting literal here would decentre the editor **silently** rather than
failing.

**The input carries the popover's height rather than setting its own**, so a host stylesheet that
gives every input a height cannot push the box back out of the row. That is what criterion 4 stress
tests.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Establish what the editor is

Overlay or flex child. Measured through the shipped `CellRenderer`: `position: absolute`, parent is
the sheet panel. This is what makes "size the editor to the row" the fix rather than "let the row
stretch".

### Phase 2 — Enumerate the editors

Five, of which two are inline. **This phase originally enumerated four and marked one inline**, and
that error is the direct cause of the open criterion: the title's rename editor was excluded by a
scoping argument that assumed it was a different affordance, and it is not.

### Phase 3 — Three declarations plus one token swap

All under `.db-record-detail-panel.db-mobile-bottom-sheet`:

- `--db-sheet-row-min-height: 44px` declared on the sheet, and the field row's `min-height` now reads
  it. Value-preserving: the row measures 44px before and after.
- The inline editor takes the row's height. At exactly that height the two boxes coincide, which makes
  both the shared centre line and the containment exact rather than approximate, and holds the same
  44px floor the sheet's textarea editor already holds — a focused field still has to be re-tappable
  to move the caret.
- The inline editor is lifted by half the difference between the value's line box and the row. Both
  terms are the tokens that produce those two heights, so the correction follows them.
- The input carries the popover's height rather than setting its own.

### Phase 4 — Drive the real path

`verify-placement.mjs` gains a 267-line section that opens the sheet and taps each editable value
through the shipped renderer. **Nothing in it builds an editor by hand.**

### Phase 5 — Freeze desktop, and control the freeze

Criterion 5 pins the desktop rectangle. Its first version did not survive its own negative control and
had to be rewritten — see §5.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Negative control | Criteria 1-4 red on the tree as received | `verify-placement.mjs` |
| Leak control | Both new selectors unscoped; desktop rectangle must move | `verify-placement.mjs` |
| Stress | Host stylesheet inflating every input | `verify-placement.mjs` |
| Capture | Churn floor re-measured over three identical runs | `screenshots` + `screenshots:verify` |

**The leak control is the part of this phase worth reading twice**, because the first version of it
was wrong in a way that would have passed.

Criterion 5 originally asserted the desktop editor's `margin-top` was still `0px`. Unscoping both new
selectors — the exact mistake the control exists to catch — left `margin-top` reading `0px` anyway:
`--db-sheet-row-min-height` is declared only on the sheet, so off the sheet the declaration is
invalid at computed-value time and falls back to the initial value. The control was measuring a
property that could not move.

Meanwhile **the input rule did leak**, shrinking the desktop editor from 34.8px to 31px. The check now
measures the rectangle, and under the same control reports `31/6.1/8.2` against the frozen
`34.8/8/12`, and the run exits 1.

A control that cannot fail is the same defect as a check that cannot fail, one level up. This one was
caught only by running it.

**Why the title editor was never caught here.** The harness cannot see it for two independent reasons:
it stubs the rename entry point as a no-op, and the trigger is a double-click rather than a click.
**Either alone would have hidden it.** No amount of care inside this harness would have surfaced
criterion 6; it took an independent probe.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| The css lane | Internal | Acquired and released twice | No stylesheet edit could proceed |
| `verify-placement.mjs` | Internal | **Contended** — a concurrent session held it throughout | Edits overwritten three times and re-applied |
| The shipped `CellRenderer` and `openRecordDetailPanel` | Internal | Green | Every check drives them; a hand-built editor would prove nothing |
| `REPO RULES.md` | Internal | A four-line stub for the duration; restored in `308f0c0` | Its verification clause was run in full afterwards against the committed result |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a desktop regression the frozen rectangle did not catch, or an inline editor placed
  worse than before on a field type not measured here.
- **Procedure**: revert the three declarations and the token. The editor returns to 34.8px
  top-aligned on a 21.6px value, which is 7.6px off-centre and 2.5px into the next row.
- **Data reversal**: none.

Reverting also returns the **title** editor to 9.0px off-centre, worse than the 2.4px it has now. The
open criterion is a partial improvement, not a regression, and a rollback would give up ground.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
Phase 1 overlay or flex child ──▶ decides the whole approach
        │
        ▼
Phase 2 enumerate the editors ──▶ (got this wrong: four, not five)
        │                                    │
        ▼                                    ▼
Phase 3 three declarations          title editor receives them unmeasured
        │                                    │
        ▼                                    ▼
Phase 4 drive the real path         criterion 6, found by an independent probe
        │                                    │
        ▼                                    ▼
Phase 5 freeze desktop ──▶ ship        REQ-007 open
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Overlay determination | The shipped `CellRenderer` | The decision to size the editor to the row | Every declaration |
| Editor enumeration | Reading the renderer | The scope of the declarations | The scoping argument — and it was wrong |
| Three declarations | Phases 1-2 | Criteria 1-4 | Ship |
| Harness section | The shipped open-and-edit path | The measurements behind every criterion | Ship |
| Desktop freeze | The declarations existing | Criterion 5 | Ship |
| Title editor offset | A per-anchor line box | Criterion 6 | **Open** |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **Phase 1 — overlay or flex child** - CRITICAL. The two answers want opposite fixes.
2. **Phase 2 — the editor inventory** - CRITICAL, and the one that was wrong. Everything downstream
   inherited its count.
3. **Phase 3 — the declarations** - CRITICAL. The deliverable.
4. **Phase 5's control** - CRITICAL in retrospect: without rewriting it, a real desktop leak would
   have shipped behind a green check.

**Total Critical Path**: Phase 1 → 2 → 3 → 5.

**Parallel Opportunities**: the harness section was written alongside the declarations, which is what
allowed criteria 1-4 to be shown red on the tree as received.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Reached |
|---|---|---|---|
| M1 | The mechanism is understood | Overlay confirmed; the offset derived as half the height difference plus the border | Phase 1 |
| M2 | The editor sits on its line and inside its row | Criteria 1, 2 | Phase 3 |
| M3 | It holds under an inflated input | Criteria 3, 4 | Phase 3 |
| M4 | Desktop is frozen, with a control that can fail | Criterion 5, rewritten | Phase 5 |
| M5 | Both inline editors centred | Criterion 6 | **Not reached** |

<!-- /ANCHOR:milestones -->
---

## 11. L3: ARCHITECTURE DECISION RECORD

### ADR-001: Size the editor to the row, do not let the row stretch

**Status**: Accepted

**Context**: The editor is 34.8px and the row is 44px with a 21.6px value line. The editor is
`position: absolute` with the sheet panel as its parent.

**Decision**: Give the editor the row's height and lift it by half the difference between the value's
line box and the row.

**Consequences**:
- At exactly the row's height the two boxes coincide, so centring and containment are exact rather
  than approximate.
- It holds the 44px thumb floor the sheet's textarea editor already holds; a focused field still has
  to be re-tappable.
- **The lift is derived from one anchor's line box**, which is correct for the value and wrong by
  1.4px for the title. That is ADR-002's subject.

**Alternatives Rejected**:
- *Let the row stretch*: impossible. An out-of-flow box cannot make its row grow.
- *Centre the editor with a transform*: would centre it on the anchor's top edge, which is where the
  defect already is.

### ADR-002: The vertical correction should be per-anchor, not a single literal

**Status**: Proposed — this is the open item

**Context**: The correction is derived from the value's line box at 21.6px, giving −11.2px. The
title's line box is 18.85px and needs −12.6px. Measured on the title: 9.0px off-centre before, 2.4px
after.

**Decision**: Not taken. Two shapes are available and the choice is open.

**Consequences of the two shapes**:
- *A second literal for the title*: small, immediate, and adds a third number that three rules must
  keep in agreement — the drift risk NFR-M01 exists to prevent.
- *Derive the offset from whichever anchor the popover was placed on*: general, correct for any future
  inline anchor, and a change to the placement path rather than to the stylesheet.

**Alternatives Rejected**:
- *Leave it*: 2.4px is better than 9.0px and worse than centred, and the value editor beside it is at
  1.0px. Two inline editors on one surface disagreeing by 1.4px is visible.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] The css lane is acquired and the baseline hash recorded
- [ ] The editor inventory has been re-derived from the renderer, not read from a previous write-up
- [ ] Each criterion has been shown red on the tree as received
- [ ] Each negative control has been **run**, not just written

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-DRIVE | Every check drives the shipped open-and-edit path. Nothing builds an editor by hand |
| TASK-CONTROL | A control that survives the mistake it exists to catch is not a control. Rewrite it and run it again |
| TASK-ENUMERATE | The set of affected surfaces is derived from the renderer, not from a prior document. This phase's open criterion is what happens otherwise |
| TASK-SCOPE | Every rule is keyed to `.db-record-detail-panel.db-mobile-bottom-sheet`; desktop is frozen |
| TASK-LITERAL | One literal, one declaration. A number three rules must agree on is declared once |
| TASK-CONTENT | Under concurrent edit, the section is re-verified **by content**, never by a reconciling check count |
| TASK-HYGIENE | No spec paths, phase numbers or task ids in `styles.css` |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. A criterion reports the control that proved it, not only the
number that followed.

### Blocked Task Protocol

A task is BLOCKED when the css lane is held elsewhere, or when the shared harness file is being
edited concurrently. On BLOCK: record the blocker and re-verify by content before continuing. **Do
not reconcile by check count** — a matching total can sit on top of a wrong body, which is exactly
the situation this phase was in.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`implementation-summary.md`](implementation-summary.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md)
