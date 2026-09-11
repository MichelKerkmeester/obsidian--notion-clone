# Iteration 2 — DEPTH

**Gap class:** DEPTH — every child's `plan.md` / `tasks.md` / `spec.md` §13 graded per phase against
L1 (outline) / L2 (tasks with files) / L3 (tasks with thresholds + RED/GREEN lane clauses + capture
ids + rubric rows) / L3+ (both themes, states, edge cases, the judge's per-row expectation).

---

## Correction to C-3 (iteration 1), recorded before anything else

Iteration 1's C-3 said the operator reference images could not be resolved. **Half wrong, and the
half that was right is narrower than stated.** Measured now: the images **do** exist at a repository
path — `screenshots/operator/` holds `0040-properties-card-container-rejected.png`,
`clickup-views-sheet-reference.png`, `clickup-board-card-drag-reference.png`,
`clickup-board-column-headers-reference.png`, `0040-settings-sheet-cards-typography.png` and
thirteen more, and all 19 children embed them (count of children citing `screenshots/operator/`: 19).
What genuinely does not resolve is the **`scratchpad/loop/…` notes**: `076-frame-ruling.md` (cited by
`013`–`018`), `board-visual-parity-clickup/operator-notes.md`, `board-card-drag-feel/operator-notes.md`.
An agent's DEFINE step therefore opens the right *pictures* and the wrong *reasoning*; the correction
below replaces C-3's proposed text with the narrower, correct one.

```markdown
- [ ] **T001a** Resolve the ruling notes before composing a target. `scratchpad/loop/076-frame-ruling.md`
      and the two `scratchpad/loop/<child>/operator-notes.md` files do **not** exist in this tree.
      The binding text is `../decision-record.md` D7 and D9 plus `../../roadmap.md` §6A's two
      2026-09-11 entries; cite those instead, and record in `verification.md` that the child composed
      its target from ruling text rather than from the notes document (`../decision-record.md`,
      `../../roadmap.md` §6A)
```

---

## The grade, per child per phase

Scale: **L1** outline · **L2** tasks with files · **L3** thresholds + RED/GREEN lane clauses + capture
ids + rubric rows · **L3+** adds both themes, states, edge cases, judge per-row expectation.
Measured columns: **§13 rows** = DEFINE table rows · **L*** = distinct named lane clauses in `spec.md`
· **mount** = `plan.md` references to a mount function · **cap-id** = concrete scenario/capture ids
named in the child.

| # | Child | A DEFINE | B PLAN | C CREATE | D SCREENSHOT | E VERIFY | F REMEDIATE | Evidence for the lowest mark |
|---|---|---|---|---|---|---|---|---|
| 1 | `001` | **L3+** | **L3** | **L3+** | **L3** | L3 | L3 | Model child: 22-row table, 10 named clauses with thresholds (`spec.md:568-577`), full-sheet capture ids named, D7 remediation block |
| 2 | `002` | L3 | **L3** | **L3+** | **L3** | L3 | L3 | 7-row table but a landed CREATE with RED/GREEN numbers; 4 full-sheet capture ids; frame remediation block (`tasks.md:150`) |
| 3 | `003` | L3 | L3 | L3 | L3 | L3 | L2 | 11-row table, `L1`–`L6` named with RED numbers (`spec.md:252-259`); no judge per-row expectation |
| 4 | `004` | L3 | L3 | L3 | L3 | L3 | L2 | same shape as `003` |
| 5 | `005` | L2+ | L3 | L3 | L3 | L3 | L2 | 9-row table, 5 clauses, three rows end `TBD — needs operator capture` |
| 6 | `006` | L2+ | L3 | L3 | L3 | L3 | L2 | 9 rows |
| 7 | `007` | L2+ | L3 | L3 | L3 | L3 | L2 | 10 rows |
| 8 | `008` | L2+ | L3 | L3 | L3 | L3 | L2 | 9 rows |
| 9 | `009` | L2+ | L3 | L3 | L3 | L3 | L2 | 8 rows — the smallest original table |
| 10 | `010` | L2+ | L3 | L3 | L3 | L3 | L2 | 10 rows |
| 11 | `011` | L2+ | L3 | L3 | L3 | L3 | L2 | 8 rows |
| 12 | `012` | **L2** | **L2** | L2 | **L2** | L2 | L2 | 6-row table, 13 `TBD` cells, no full-sheet capture id |
| 13 | `013`–`017` | **L1+** | **L2** | **L2** | **L1** | L2 | L1 | 4–6-row tables, **0** named lane clauses, **0** capture ids, no "Both themes" row |
| 14 | `018` | **L2** | L2 | **L2** | **L1** | L2 | L2 | 7 rows, 0 named clauses, no judged capture id |
| 15 | `019` | **L2** | L2 | **L2** | **L1** | L2 | L2 | 9 rows, 0 named clauses, judged image is a mid-drag capture with no scenario id |

**Where the floor sits.** `012`–`019` — the eight children opened after the parent's own D2 note and
after the frame ruling — are the entire population below L3, and `001`/`002` (the only two children
that have actually run CREATE) are the only two above L3 in Phase C. The programme's depth is
bimodal, and the thin half is the newer half: the scaffolding that produced `013`–`019` used one
template for eight different surfaces, and the template names *what to do* without ever naming *the
number*, *the clause* or *the capture*.

---

## D-1 · Eight children name zero lane clauses, so their RED/GREEN record has nothing to name

**Evidence.**

- Count of distinct `**L<n>**` clause identifiers in `spec.md`: `001` 10, `002` 6, `003`–`011` 5–6,
  `012` 4, **`013`–`019` 0**.
- `013/tasks.md:48` — *"T004 Write one lane clause per measurable §13 row into
  `tools/live/sheet-grammar.mjs`, unwired, and confirm each can fail before it is asked to pass"*.
- `013/tasks.md:57` — *"T006 Run every new clause RED and record the failing numbers"* — the phrase
  "every new clause" has no antecedent anywhere in the child.
- `003/spec.md:252-259` shows the shape that is missing: `**L1** the active-rule filter popover renders
  0 rows carrying 3 side-by-side dropdown controls — RED today at 1`, etc.
- The parent's pass rule: `spec.md` §5 step 2 — *"one lane clause per measurable row of the DEFINE
  table"*, and step 3 — *"each lane clause runs RED with its failing number recorded"*.

**Finding.** Phase B is the phase that converts a target table into evidence, and in eight children it
is a promise rather than a plan. An executor running `013`'s T004 has to invent the clause set, which
means two consecutive executors of the same child produce two different evidence contracts and the
second JUDGE has nothing stable to re-score against. D1's whole mechanism — a lane as the *floor*
under the judge — collapses when the floor's numbers are decided at CREATE time.

**Proposed text** — paste into `013`'s `spec.md`, immediately after §13's table (repeat per child with
that child's own rows; the clause set below is derived from `013`'s own four-row table, and each row
of a fuller table earns its own clause):

```markdown
### The lane clauses these rows become

Every clause below is written against the shipped tree and can fail on the day it is written. A clause
that cannot fail is not evidence (D1). RED numbers are the values measured before this child's CREATE;
GREEN is the same clause after.

| # | Clause | Measure | RED today | GREEN target |
|---|---|---|---|---|
| **L1** | **0** elements under the sheet body compute a background colour distinct from the sheet's own canvas (`--obnotion-surface-overlay`), in **both** themes | `getComputedStyle(el).backgroundColor` vs the body's own, over every descendant with a background | 2 card containers | 0 |
| **L2** | Every adjacent row pair inside a section is separated by exactly **1** divider: a `::before` with `height` ≤ 1px, `left` inset to the label's leading edge, `right` at the sheet's trailing edge | computed `::before` box of each row | 0 dividers (rows sit in a card) | 1 per adjacent pair, geometry within 0.5px |
| **L3** | The row's state control is **trailing** and is not a checkbox: **0** `input[type=checkbox]` inside a row; the trailing control's hit box is **≥ 44px** | DOM query + `getBoundingClientRect()` | 1 checkbox per row, 20px box | 0 checkboxes, ≥ 44px trailing target |
| **L4** | The sheet header carries a grab handle and **0** bare icon buttons; the title reads centred within **1px** of the header's own centre line | header geometry, block-layout centring | handle present, title off-centre by Npx | 0 icon buttons, ≤ 1px |
| **L5** | Every row clears the **44px** pitch floor and the sheet's leading inset computes **16px** (D9) | row `getBoundingClientRect().height`, body padding-inline-start | … | ≥ 44px / 16px |
| **L6** | **(guard)** L1–L5 fail on an empty row set rather than passing vacuously — assert the row count is **> 0** before asserting any per-row clause | row count | n/a | non-vacuous |

**L6 is not decoration.** The same vacuous-pass class is recorded in `spec-tree-layout.md` §2 and is
the reason `001`'s own guard clause exists (`001/spec.md:576`).
```

and replace `013`'s T004 with:

```markdown
- [ ] **T004** Transcribe the six lane clauses in `spec.md` §13.1 into `tools/live/sheet-grammar.mjs`,
      unwired, and run each one against the shipped tree to record its RED number. A clause whose RED
      number equals its GREEN target is not a clause — delete it or find the clause that fails
      (`tools/live/sheet-grammar.mjs`, `spec.md` §13.1)
```

**Confidence:** high — the zero is mechanical (grep for clause identifiers returns nothing in
`013`–`019`) and the consequence is quoted from the parent's own pass rule.

---

## D-2 · The D2 judged-capture contract exists for the eleven sheets and for none of the eight newer children

**Evidence.**

- D2's note: *"The capture harness now emits a **full-sheet variant** beside every judged viewport shot
  — `<scenario>-sheet-mobile-{light,dark}.png`, the sheet expanded past its 90svh cap to its own
  content height, its recorded height checked against the picture's by `npm run screenshots:verify` —
  and each child's capture set names that variant as the image the judge scores."*
- Measured in `screenshots/manifest.json`: **exactly 11** scenarios carry `capture: "sheet"` —
  `constructed-view-config-sheet`, `constructed-column-manager-sheet`, `constructed-filter-panel-sheet`,
  `constructed-sort-panel-sheet`, `constructed-board-groups-panel-sheet`,
  `constructed-toolbar-add-view-sheet`, `constructed-modal-sheet-property-editor-sheet`,
  `constructed-record-detail-sheet`, `constructed-owned-menu-sheet`, `constructed-icon-picker-sheet`,
  `constructed-column-width-adjuster-sheet`. They map one-to-one onto `001`–`011`.
- `constructed-board-card-properties` (the surface `013` judges) is `capture: "viewport"` on mobile —
  `screenshots/notion-clone/panels/constructed-board-card-properties-mobile-light.png`.
- `014`'s five FuzzySuggest call sites have **no scenario at all**: the manifest contains no id
  matching `suggest`.
- `017`'s eighteen modals have three hand-written `capture: "element"` fixtures
  (`panel-base-import-modal`, `panel-computed-cleanup-modal`, `panel-invalid-events-modal`) — which are
  three of the nine fixtures the parent itself lists as having no constructed counterpart, so D2(b)
  disqualifies them as parity evidence — plus `constructed-modal-sheet-confirm` (viewport) and
  `constructed-modal-sheet-property-editor-sheet` (the one sheet-shaped one).
- `chrome-toast-success` / `chrome-toast-error` are `capture: "element"`, desktop + mobile, hand-written.
- Named full-sheet capture ids per child: `001`–`011` name 2–4 each; **`012`–`019` name 0**.

**Finding.** The image judge is the programme's only closing gate, and for eight children the image it
would score is either cropped, element-shaped, hand-written, or absent. This is not a cosmetic gap:
`001` and `002` both scored **11/16** on their first judge pass, and both lost points to a harness
property rather than a plugin defect — the viewport crop. D2's own note was written because of that.
The eight newer children were scaffolded after the note and did not inherit it, so the identical
failure is queued four more times (`013` board-card-properties, `015` cell editors, `016` toolbar
options, `017`'s seventeen remaining modals) plus two new shapes (`014` no capture, `019` mid-drag).

**Proposed text** — a shared block for `012`–`019`'s `spec.md` §5 SUCCESS CRITERIA, and a per-child
capture table:

```markdown
### The judged image (D2)

The image the judge scores is named here by capture id, not by description. A verdict may not be
recorded against a capture this table does not name.

| Surface | Judged light capture id | Judged dark capture id | Shape |
|---|---|---|---|
| <this child's primary surface> | `<scenario>-sheet-mobile-light` | `<scenario>-sheet-mobile-dark` | full sheet, expanded past the 90svh cap |
| <secondary surface, if any> | `<scenario>-mobile-light` | `<scenario>-mobile-dark` | viewport — permitted only where the surface's own content fits the 804×1748 frame |

If the first row's scenario does not exist, **registering it is this child's T001** — a viewport
capture of a scrolling surface is not judgeable and D2(b) forbids substituting a hand-written fixture.
The registration itself is a five-line change to `tools/screenshots/constructed-scenarios.mjs`:
a `constructedScenario` entry with the production `mount`, the shipped `renderer` id and the real
`sources`, exactly like `constructed-column-manager-sheet`.
```

and the concrete registrations this child needs, as a table the orchestrator can turn into tasks:

| Child | Judged surface | Capture to register | Why none of the existing ones qualify |
|---|---|---|---|
| `012` | board card meta grid | `constructed-board-card-sheet-mobile-*` (new) | card meta rows are below the fold of the board viewport capture |
| `013` | board-card-properties sheet | `constructed-board-card-properties-sheet-mobile-*` (new) | existing mobile id is `capture: "viewport"` — the sheet's lower rows can leave the frame |
| `014` | fuzzy-suggest sheets | `constructed-fuzzy-suggest-sheet-mobile-*` (new; one representative call site is enough for the judge, all five for the lane) | **no scenario of any kind exists** |
| `015` | cell-editor popovers | `constructed-cell-editor-text-sheet-mobile-*` (new — a popover has no 90svh cap; expand the popover's own max-height) | existing ids are `capture: "viewport"`, `device: desktop` for the judged geometry |
| `016` | calendar/mini-calendar option popover | `constructed-calendar-options-sheet-mobile-*` (new) | no scenario of any kind exists |
| `017` | 18 DbModals | `constructed-modal-sheet-utility-sheet-mobile-*` (new, one per modal family) | only `constructed-modal-sheet-property-editor-sheet` is sheet-shaped; three others are hand-written `element` fixtures D2(b) disqualifies |
| `018` | board column header/body/card | `constructed-board-clickup-sheet-mobile-*` (new) | board is not a sheet; a full-column capture (scroll to the column, expand the card) is the judged shape, and must be named as such |
| `019` | drag in progress | `constructed-board-drag-middrag-mobile-*` (new, both themes) | the judged moment is a mid-drag frame; no scenario exists that holds a drag open |

**Confidence:** high on the mechanism (manifest queries are exact); medium-high on the per-child
capture shapes, which are proposals the child's own DEFINE step should confirm.

---

## D-3 · The DEFINE tables of `013`–`019` are 4–9 rows with `TBD` cells where the reference table should be

**Evidence.**

- DEFINE table row counts: `001` **22**, `002` 7, `003` 11, `004` 11, `012` **6**, `013` **4**, `018` 7.
- `013/spec.md:222-226` — three of the four rows are placeholders: *"`TBD — needs T001 read of
  board-card-properties-panel.ts`"*, *"`TBD`"*, *"`TBD — T001`"*.
- `012/tasks.md` carries **13** `TBD` cells.
- `spec.md` §5 step 1's pass rule: *"Every row of the sheet has a target row naming section, label,
  leading icon, trailing element and control type, in both themes; every reference is a real path;
  every number is ours or `TBD`"*.
- "Both themes" appears 6× in `001/spec.md`, 5× in `002`, 3× in `003`, and **0×** in `013` and `018`.

**Finding.** `TBD` is legal only as a *number* awaiting the operator's capture (D3). `013` uses it for
`Frame`, `Dividers` and `Row shell sharing` — three of the four things a DEFINE table exists to
decide — which converts the pass rule from a gate into a TODO list. A 4-row table also cannot satisfy
the rule's own enumeration (section, label, leading icon, trailing element, control type per row) for a
sheet that has rows; the parent's own model (`001`, 22 rows, `R01`–`R23`) shows what the target looks
like when it is written down.

**Proposed text** — paste into `013`'s §13, replacing the four-row table (the `Ours today` column is
filled by T001; the point of the proposal is the row *shape*, which 4 rows cannot carry):

```markdown
| # | Section | Leading | Label | Trailing element | Control type | Target (both themes) | Source |
|---|---|---|---|---|---|---|---|
| R01 | *(sheet)* | grab handle | *(centred title)* | `✕` close | — | Handle present, 16pt inset, title centred within 1px | Notion (header) + **D7** (frame) |
| R02 | Field visibility | `eye` | *per property* | switch | toggle in place | One row per property, trailing switch, **no checkbox**, ≥ 44px pitch | Notion (properties list) |
| R03 | Hidden group | *(none)* | Hidden | `[n]` chevron | navigation row → stacked sheet | Divider-separated group; never a card | **D7** |
| R04 | Add property | `plus` | New property | *(none)* | navigation row → `007`'s sheet | Terminal row, no chevron where it opens a picker | ClickUp (icon-tile + label) |
| R05 | Empty state | `eye-off` | No properties | *(none)* | static text | Secondary-colour text on the plain background, no card | internal |
| L-ctx | *both themes* | — | — | — | — | Light and dark each internally consistent; divider, canvas and switch tokens distinct | D7's rubric Row 8 |
```

**Confidence:** high — row counts and `TBD` cells are mechanical; the proposed rows are derived from
the child's own §13 prose plus `screenshots/operator/0040-properties-card-container-rejected.png`.

---

## D-4 · No child states the judge's per-row expectation, which is what L3+ adds

**Evidence.**

- Every child's `verification.md` carries the same template: a header row
  `| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |`
  (`013/verification.md:37`), the pass rule restated (`:28`), and the operator row (`:47`).
- `001/verification.md` and `002/verification.md` at 119 and 221 lines are the only two with landed
  content; the other seventeen are 58–75 lines of template.
- The parent's rubric (`spec.md` §5) defines each row's 0/1/2 in the abstract; nothing in any child
  says what **this sheet** must show for a given row to score 2.
- `017/spec.md` mentions `dark` **0** times — a child adjudicating eighteen sheets says nothing about
  the second theme anywhere in the file, while the rubric scores `Both themes` as one of eight rows
  and D7's Frame row is theme-dependent by construction (*"`--obnotion-settings-card-fill` reads per
  theme"*).

**Finding.** The judge is a fresh model each iteration; with no per-row expectation recorded, each
judge pass re-derives what "2" means, which is the largest single source of score drift between the
two consecutive passes DONE requires. It also makes REMEDIATE's trigger (*"any rubric row < 2 opens a
remediation task"*) un-actionable: the child cannot say which fix closes which row.

**Proposed text** — for every child, append to `verification.md` after §2:

```markdown
## 2A. THE JUDGE'S PER-ROW EXPECTATION FOR THIS SHEET

Each row below states what the judge should expect to see in *this* sheet's capture for a score of 2.
A judge that cannot see the named element records 1 at most and says which element was missing — the
per-row expectation is the calibration, not a target the judge may rewrite.

| Rubric row | What "2" looks like on this surface | What makes it "0" here |
|---|---|---|
| **Frame** | Rows on the plain sheet background; one divider between adjacent rows, inset to the label and full-bleed to the trailing edge; canvas, radius and handle match the composed target | **any** rounded or lighter row container (D7 scores Frame 0 regardless of everything else) |
| **Sections** | Section labels as plain small secondary text with a divider; groups in the order this child's DEFINE table lists | a card boundary used as the grouping device, or a group missing where the table names one |
| **Row anatomy** | Per `spec.md` §13's `Leading` / `Label` / `Trailing element` columns, in that order | a row carrying an element the table does not name, or the wrong order |
| **Controls** | The control kind in the `Control type` column — a switch is a switch, a navigation row has a chevron, a picker opens a sheet | an input where the reference navigates; a chevron on a terminal control |
| **Type** | Label and value one size step apart, label at regular weight, per the child's §13 type row | semibold labels, or a value larger than its label |
| **Spacing** | ≤ 1px divider, 16pt leading inset, ≥ 44pt pitch (D9) — each measured, not eyeballed (append the child's resolved measurements) | a row under 44pt, or a divider inset from the trailing edge |
| **Colour** | Text / secondary / divider / accent resolve to the child's named tokens in both themes | a contrast failure, or a card fill that only exists in one theme |
| **Both themes** | The dark capture shows the same structure as the light one — same rows, same dividers, same control kinds | dark or light broken; a structural difference between them |
```

**Confidence:** high for the gap; medium for the specific expectations, which each child's DEFINE step
should specialise.

---

## D-5 · Every `verification.md` declares the wrong template and a level the parent does not share

**Evidence.** All 19 files carry `<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->` and
`<!-- SPECKIT_LEVEL: 2 -->` — including the two with landed judge tables. All 19 `spec.md` files carry
`<!-- SPECKIT_LEVEL: 2 -->`, while the parent declares `<!-- SPECKIT_LEVEL: phase -->` and its §3
Qualification measures **Level 3 (Full), 75/100** (`spec.md` §3). `013/verification.md:8` is the
acceptance-criteria template header on a file whose body is a rubric score table.

**Finding.** Two small truth defects with one operational consequence. The template-source marker is
what the repo's doc tooling reads to know which contract a file satisfies, and a `verification.md`
claiming to be generated from `acceptance-criteria` will be validated against the wrong rule set. The
level marker is the second: a child of a level-3 phased parent that declares level 2 makes
`validate.sh --recursive` compare unlike things, and it lets a level-2 contract (which does not require
the judge artefact's per-phase depth) pass a child the parent requires to be level-3 deep.

**Proposed text** — one edit per child, and a note in `plan.md` §2:

```markdown
<!-- SPECKIT_TEMPLATE_SOURCE: verification | v2.2 -->
<!-- SPECKIT_LEVEL: 3 -->
```

```markdown
### Definition of Ready (per child) — amended 2026-09-11

- [ ] The child's `verification.md` carries `SPECKIT_TEMPLATE_SOURCE: verification` and a level that
      matches this packet's (`3`), not the level-2 default the scaffolder emitted
- [ ] §2A of `verification.md` names the judge's per-row expectation for this sheet (L3+)
```

**Confidence:** high (both markers are mechanical greps); medium on whether the repository's validator
keys off the marker, which should be confirmed by the packet owner rather than assumed.

---

## D-6 · Phase F is one sentence in every child, including the two that already failed three times

**Evidence.** The uniform remediate task reads (*`013/tasks.md:84`*): *"For every rubric row scoring
below 2, open a remediation cycle: RED, fix, GREEN, recapture, re-judge. The child is not done until
the judge passes twice in a row on an unchanged tree. Three consecutive fails on one row re-opens
DEFINE."* `001`'s and `002`'s landed history shows what actually happened: **11/16 on the first pass,
both**, with the two-card shape and typography defects named by the operator as the residual — and
`002/verification.md` at 221 lines is the only place in the packet where a remediation iteration was
recorded in full.

**Finding.** REMEDIATE has no artefact of its own beyond "append to `verification.md`", no rule about
which findings document the fix, and no bound on how many cycles a child may run before the target is
declared wrong — the parent's `plan.md` §7 rollback says *"the judge fails a third consecutive
iteration on the same rubric row, which means the target itself is wrong"*, but the per-child task's
third-strike rule says the same thing only for *one row*, not for a child whose total is stuck below 14
with no row at 0. `001`'s and `002`'s own failure mode was exactly that: no row at 0 and a total under
the floor.

**Proposed text** — replace the single REMEDIATE task in every child with:

```markdown
- [ ] **T0xx** For every rubric row scoring below 2, open a remediation cycle in `verification.md`'s
      next iteration section: the clause that goes RED for that row (named, with its number), the fix,
      GREEN with its number, re-screenshot, re-judge. One cycle = one iteration row.
- [ ] **T0xx+1** Apply the two stop rules, and record which one fired: (a) **row rule** — one rubric
      row scores below 2 in three consecutive iterations: the row's target is wrong, DEFINE re-opens
      with the iteration numbers as evidence; (b) **ceiling rule** — three consecutive iterations
      score below 14 with **no** row at 0: the *composition* is wrong (different sources per row
      disagree), so re-open the Source column rather than the implementation. Neither rule may be
      applied without the three score tables quoted beside it (`verification.md`, `spec.md` §13)
```

**Confidence:** high — both rules are already written in the packet, just not where the executor runs.

---

## Depth verdict for the programme

- **L3+ children: 1 of 19** (`001`, and only after its 2026-09-11 remediation block).
- **L3 children: 10** (`002`–`011`).
- **Below L3: 8** (`012`–`019`) — and they are precisely the children the coverage audit opened in the
  same session as the two rulings the auditor is meant to enforce.
- **The minimum repair set** to lift every child to L3: a clause table per child (D-1), a named judged
  capture per child (D-2), a full DEFINE row set with both themes (D-3), a judge per-row expectation
  (D-4). Each is a per-child edit, not a rewrite: roughly 30–60 lines added to each of the 8 thin
  children and 15–25 to each of the 8 middle ones.

## What was tried and failed this iteration

- **Hypothesis: the full-sheet capture variant does not exist at all.** Disproved — 11 `capture:
  "sheet"` scenarios exist in the manifest, and 22 matching PNGs are on disk in
  `screenshots/notion-clone/panels/`. Recorded so no later pass reports a missing harness feature.
- **Hypothesis: `012`–`019` were scaffolded by a script from one template, hence their uniformity.**
  Strongly suggested (identical 58-line `verification.md` × 19, identical §1–§12 section order,
  identical Phase A–F wording, `SPECKIT_LEVEL: 2` everywhere) but **not proven** — no scaffolding script
  was found. Recorded as inference, not as a finding.
- **Hypothesis: `017`'s eighteen modals each need their own child.** Rejected: the coverage audit's
  bundle rationale (shared `DbModal` chrome) holds, and 18 near-identical zero-reference surfaces would
  multiply paperwork. The real defect is the missing judged capture (D-2), not the bundle size.

## Open questions raised this iteration

1. For `014` and `016`, is a *representative* judged capture acceptable (one call site judged, all five
   lane-checked), or must every surface carry its own judged image? The audit's bundle rationale says
   representative; D1 says a lane never closes a sheet — those two only reconcile if the child names
   exactly which surfaces carry a judge row.
2. `019`'s judged image is a mid-drag frame. Should the judge score it against the same eight-row
   rubric (where "Spacing" and "Type" are near-meaningless on a moving ghost), or does the rubric need a
   motion variant? The parent's rubric has no motion row and `019` is the only child where that matters.
