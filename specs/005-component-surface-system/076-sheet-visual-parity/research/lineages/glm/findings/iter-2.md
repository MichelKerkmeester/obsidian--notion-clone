# Iteration 2 — DEPTH

**Lineage:** `fanout-glm-1789102713325-fbmgv2` · gap class **2 of 5: DEPTH**.
**Read first:** `research/deep-research-state.jsonl` (2 events) and `research/deltas/iter-001.jsonl` (7 findings) — iteration 1's gap classes (COVERAGE) are not repeated here; F1.2 (missing plan §3.3) is *cross-referenced* where its DEPTH consequence lands, never re-argued.
**Angle:** grade every child's plan/tasks **per phase** against the scale (L1 outline · L2 tasks-with-files · L3 tasks with thresholds + RED/GREEN lane clauses + capture ids + rubric rows · L3+ adds both themes, states, edge cases, and the judge's per-row expectation).

---

## 2.0 The grade table — 19 children × 6 phases

Legend: the scale above; `+/-` marks within-band. Grades grade **the documents as they stand**, not the intent.

| Child | DEFINE | PLAN | CREATE | SCREENSHOT | VERIFY | REMEDIATE |
|---|---|---|---|---|---|---|
| 001 settings | **L3+** | **L3+** | **L3+** | **L3+** | **L3+** | **L3+** |
| 002 properties | L3 | L3 | L3+ | L3+ | L3 | L3+ |
| 003 filter | L2+ | L2 | L3− | L3− | L3− | L3− |
| 004 sort | L2+ | L2 | L3− | L3− | L3− | L3− |
| 005 group | L2+ | L2 | L3− | L3− | L3− | L3− |
| 006 add-view | L2+ | L2 | L3− | L3− | L3− | L3− |
| 007 property-editor | L2+ | L2 | L3− | L3− | L3− | L3− |
| 008 record | L2+ | L2 | L3− | L3− | L3− | L3− |
| 009 menu+confirm | L2+ | L2 | L3− | L3− | L3− | L3− |
| 010 pickers | L2+ | L2 | L3− | L3− | L3− | L3− |
| 011 toolbar-overflow | L2+ | L2 | L3− | L3− | L3− | L3− |
| 012 board-card-fields | L3+ | L3 | L3+ | L3+ | L3 (judge pending) | L3 |
| 013 board-card-props | L2+ | L2 | L2+ | L3− | L2+ | L2+ |
| 014 fuzzy-suggest | L2+ | L2 | L2+ | L3 (T003 registers) | L2+ | L2+ |
| 015 cell-editors | L2+ | L2 | L2+ | L3 (T003 registers) | L2+ | L2+ |
| 016 view-toolbar | L2+ | L2 | L2+ | **L2** | L2+ | L2+ |
| 017 utility DbModal | L2+ | L2 | L2+ | **L2** | L2+ | L2+ |
| 018 board ClickUp | L3− | L2 | L2+ | L3− | L2+ | L2+ |
| 019 drag feel | **L2** | L2 | L2+ | L3− | L2+ | L2+ |

Calibration quotes: 001's ceiling — `001/plan.md:138` `### 3.3 The lane assertions — nine clauses, each a number`; `:182` `### 3.5 The image-judge rubric instance for this sheet`; `001/acceptance-criteria.md:42` `| AC-005 | … Given an **unchanged tree**, When the reviewer scores it a second time, Then it passes again at the same thresholds |`. The 003–011 floor — `003/plan.md` carries no `### 3.3/3.4/3.5` at all; its clause *ids* exist only in tasks (`003/tasks.md:63` `Run L2 RED at 3 and record it`). The 013–019 floor — `013/acceptance-criteria.md:35` `| AC-004 | … Given an unchanged tree, When scored a second time, Then it passes again |` — no *consecutive*, no *same thresholds*.

---

## Finding 2.1 — The closure clause is graded three times: 001 (L3+), 003–011 (L3−), 013–019 (L2+); only 001's wording actually closes a child

**Evidence:**
- L3+ — `001/acceptance-criteria.md:111-113`: `**AC-005 is the row that most often blocks closure**, because it needs the judge to pass a *second* time on a tree nothing has touched since the first — a re-judge after a fix is a new iteration, not the second pass, and the tree hash on each pass is what tells them apart.`
- L3− — `003/acceptance-criteria.md:36`: `| AC-005 | REQ-004 | Given an unchanged tree, When the reviewer scores it a second time, Then it passes again at the same thresholds | … — **two consecutive passes** |` (good), but no tree hash anywhere in 003's AC/tasks; its tasks' version, `003/tasks.md:93`, `**The child is not done until the judge passes twice in a row on an unchanged tree** — a second pass after a change is iteration *n+1*, not the second pass.` — right distinction, no **hash**.
- L2+ — `013/acceptance-criteria.md:35`: `| AC-004 | REQ-003 | Given an unchanged tree, When scored a second time, Then it passes again |`; `019/acceptance-criteria.md:38`: same wording. No *consecutive*, no *same thresholds*, no distinction, no hash. 016's only guard is the stall one — `016/tasks.md:85` `Three consecutive fails on one row re-opens DEFINE` — the *success* side has nothing.

**Finding:** The parent's own pass rule (`spec.md` §5, step 6: "the judge passes twice in a row on an unchanged tree") degrades silently as it propagates. "A second time" (013/019) does not require consecutiveness — pass, fail, pass, without touching anything, satisfies "a second time" but not the ruling. 003–011 lose only the tree hash, which is exactly what 001's note (:113) says tells the two passes apart. Sixteen of nineteen children therefore have a VERIFY closure that their own parent ruling would not accept.

**Proposed text** — two pastes.

1. Into `acceptance-criteria.md` of `003`–`011`, `013`–`019` (replace the second-pass AC; keep each child's own AC number):

```md
| AC-005 | REQ-004 | Given an **unchanged tree** (the tree hash recorded on both passes), When the reviewer scores it a second time, Then it passes again at the same thresholds — **two consecutive passes** | `verification.md`, score table #2, plus both tree hashes | Unmet | - |
```

2. Into `tasks.md` of the same sixteen (the VERIFY phase's closure task; 003's T025 is the slot):

```md
- Before calling the second pass the second pass, record `git rev-parse HEAD` into
  `verification.md` beside score table #1's hash. Two hashes that differ mean the passes were not
  consecutive: what just happened is iteration *n+1* and the REMEDIATE cycle continues.
```

**Confidence:** 95% — the three wordings are quoted above; "consecutive" absence in 013/019 verified by reading their AC rows in full.

---

## Finding 2.2 — Only 001 instantiates the judge's rubric; eighteen children will be scored against eight generic adjectives

**Evidence:** `001/plan.md:182` — `### 3.5 The image-judge rubric instance for this sheet` (and its AC-004 wording `:41` scores against `R-1/R-4/R-5`, *named* references). Every other child's judge task points at the parent's generic table: `003/tasks.md:84` — `T023 Gate (b): give a Sonnet or Opus reviewer our phone capture and the reference, and have it score the eight-row rubric from '../spec.md' §5 — Frame, Sections, Row anatomy, Controls, Type, Spacing, Colour, Both themes — each 0/1/2.` — with **no per-sheet expansion anywhere in 003's documents** (grep: no §3.5, no rubric-instance section). The L3+ bar is precisely "the judge's per-row expectation".

**Finding:** The generic rubric's rows ("Spacing: pitch, inset and gaps read as the reference's") are unverifiable without knowing which reference *this sheet* composed (D9) — e.g. for 003, whether "Frame: 2" means the stacked condition rows sit on the plain background with hairline dividers, or 016, whether "Sections" applies at all to a four-row popover. 001 solved this; the other eighteen copied the task, not the mechanism. The judge will therefore score 0/1/2s justified against a reference the reviewer has to guess.

**Proposed text** — paste into `plan.md` of `002`–`019` as a new `### 3.5` (content filled at that child's PLAN from its own §13; 003 worked here, 016 worked because its referenceless surfaces need the *internal-consistency* reading):

```md
### 3.5 The image-judge rubric instance for this sheet

Eight rows, 0/1/2, exactly as `../spec.md` §5 defines them — instanced so the reviewer scores this
sheet against its composed reference (D9), not the abstraction:

| Row | 0 means | 2 means, on this sheet |
|---|---|---|
| Frame | (D7 test) any row/value inside a rounded/lighter container; wrong sheet shape | condition summary rows on the plain sheet background, hairline dividers, 16pt inset, grab handle, canvas/radius per the composed reference |
| Sections | no grouping where the composed reference groups | groups+order match; heading-plus-divider, never a card boundary |
| Row anatomy | different elements per row | summary row = label + count + chevron; detail row = property/operator/value as composed |
| Controls | wrong kind (input where the reference navigates) | every kind+affordance matches the composed reference |
| Type | wrong scale/weight hierarchy | hierarchy right on this sheet's label/value/action trio |
| Spacing | visibly different rhythm | pitch/inset/gaps read as the composed reference's |
| Colour | wrong hierarchy or a contrast failure | text/secondary/divider/accent tokens correct |
| Both themes | one theme broken | each theme internally consistent and structurally identical to the other |
```

(For 016, add under the table: `Rows judged against the mini-calendar popover's reference; the three referenceless toolbars are scored for internal consistency against the anchor — their 0/1/2 justifications must cite the anchor, per 016/spec.md:52.`)

**Confidence:** 92% — the 001-mechanism and the 18 absence are direct; whether every later child needs the *full* eight rows or the referenceless ones may compress theirs is a real question (recorded, not silently answered).

---

## Finding 2.3 — 016 and 017 have no scenario-registration task, but their producers have (almost) no constructed scenarios; their SCREENSHOT phases cannot run

**Evidence:** The registration precedent — `014/tasks.md:40` `T003 Confirm each of the five surfaces has a current capture through the production mount path; register any missing scenario before implementation (tools/screenshots/constructed-scenarios.mjs)`; `015/tasks.md:47` same. But:
- 016: its four surfaces carry **no capture scenario** (`coverage-audit.md` §2, rows 31–34: `| 31 | **calendar-toolbar-options** | … | none | none | **NONE -> 016** |` — and 32/33/34 likewise, only 34 sharing `constructed-date-picker*`); its tasks (`016/tasks.md:30-47` Phase A, `:47-52` Phase B, `:57-61` Phase C) contain **no registration task** — T005 writes clauses, T006 takes the css lane, T007–T009 RED/GREEN, and its first SCREENSHOT task, `:68` `T010 Run 'npm run screenshots' … Open all four toolbars' phone captures, light and dark, and look at each one ('screenshots/notion-clone/views/**')` — points at *view-level* captures, which show the toolbar, not the opened options popover the child is about to judge.
- 017: five of its eighteen surfaces have scenario ids (`coverage-audit.md` rows 38/40/46/52/53: `panel-base-import-modal`, `constructed-modal-sheet-property-editor*`, `panel-computed-cleanup-modal`, `panel-invalid-events-modal`, `chrome-toast-*`); the other thirteen —CsvMarkdownImport, TrashManager, AddDatabase, CreateLinkedView, CreateRecordIconField, CsvMarkdownExport, DeleteDatabase, Formula, PropertyTypeConflict, RelationRollupConfig, StatusOptions, StatusPresetManager, trash restore-confirm — have **none**, and 017's tasks grep for `register` returns **nothing** (its T001–T006, `:38-50`, confirm provenance, not registrations).

**Finding:** For 016, the harness will have nothing at the right mount to photograph — 3 of 4 surfaces (all but the mini-calendar popover) and none of their stacked dropdowns. For 017, 13 of 18. Both children's DEFINE (T004-style "fill the Ours column from what the image shows") and both judges depend on captures that no task creates. 014/015 already carry the fix as their T003; 016/017 lost it in their 09-11 scaffolding.

**Proposed text** — into `016-view-toolbar-options-visual-parity/tasks.md` (end of Phase A) and `017-utility-modal-sheets-visual-parity/tasks.md` (end of Phase A):

```md
- [ ] T00b For every surface this child owns that the coverage audit recorded with no capture
      scenario (`../coverage-audit.md` §2 rows 31–34 for 016; the 13 scenario-less rows of 017's
      bundle), register a constructed scenario mounting the shipped renderer with accurate
      `sources` — 016: the four toolbars' options popovers; 017: each DbModal subclass + trash
      restore-confirm — before any clause runs RED. A surface that cannot be mounted from
      production is recorded as such in `spec.md` §13 and judged from the nearest production mount,
      never from a fixture (`tools/screenshots/constructed-scenarios.mjs`, `spec.md` §13)
```

**Confidence:** 90% — the two tasks' absence is a full-file read; the "T010 photographs the toolbar, not the popover" reading is high-confidence but marked as such.

---

## Finding 2.3b — 002's capture convention: the judged image is the *full-sheet* variant, and no later child inherited the lesson

**Evidence:** `002/plan.md:102-104`: `The judged image is the full-sheet variant screenshots/notion-clone/panels/constructed-column-manager-sheet-mobile-{light,dark}.png (same run, emitted beside the viewport shot): the sheet expanded past its 90svh cap to its own content height, so the cards a viewport crop keeps below the fold are scored.` Meanwhile `003/tasks.md:84` — `give a Sonnet or Opus reviewer our phone capture and the reference` — never says *which* capture, and 003's own §8 edge case (`003/spec.md`, §8: `The sheet at its longest content, against the 90svH cap`) is precisely the state the full-sheet variant exists to judge.

**Finding:** 002 discovered (post-001) that the viewport capture hides exactly the rows the D7 ruling cares about, and named the full-sheet variant as the judged image. That convention lives in 002's plan prose only; 003–019's judge tasks still say "our phone capture", so each will improvise its answer, and two judges may score different images of the same sheet.

**Proposed text** — into each of `003`–`011` and `013`–`019`'s VERIFY phase (their T023/Gate-b slot), and into the parent's `spec.md` §5 step 5 as a one-line convention:

```md
> **The judged image.** Gate (b) scores the **full-sheet variant** of the phone capture —
> `constructed-<surface>-sheet-mobile-{light,dark}.png`, emitted beside the viewport shot — not the
> viewport crop: the 90svh cap keeps below-the-fold rows out of the viewport, and those rows are
> exactly what the D7 grammar governs. Both themes, both variants, recorded in `verification.md`
> beside the score they produced.
```

**Confidence:** 88% — 002's convention is quoted; the omission elsewhere is a read of every Gate-b task's wording (all of which say "our phone capture" or "our captures" without the variant).

---

## Finding 2.4 — One vacuity guard exists in the whole packet (001's L9); the empty-set failure mode it guards is reached by 003, 004 and 012 by construction

**Evidence:** `001/plan.md:155-159` — `| **L9** | *(guard)* the landed stack-row width clause **fails on an empty set** rather than passing vacuously | passes on a non-empty set — goes vacuous the moment L2 lands |` + `**L9 exists because this plan empties the set a landed clause measures.** … Making an empty result an error is the fix there and here.` Meanwhile 003's own tasks predict the same event: `003/tasks.md:63-65` (T010–T011) *replace* the three-dropdown row with a summary row — the clauses measuring the old rows' children go empty on GREEN; `003/tasks.md:62` (T009) mounts the popover through "the same builder the sheet uses", so the popover's clauses inherit whatever vacuity the sheet's have. 012's landed 28-clause gate (`012/implementation-summary.md` continuity: `Single-column meta grid landed; lane, captures and 28-lane gate green`) measures `.obnotion-kanban-card-meta` rows that 012 itself emptied of two-column grids.

**Finding:** 001's L9 insight — a clause that walks a set the same change empties reports GREEN without measuring anything — is exactly the failure 003's summary-row collapse, 004's and 012's already-landed equivalents produce. Yet no child after 001 writes a guard clause; the lesson was not institutionalized, it was incidental.

**Proposed text** — into `003`–`011`'s `plan.md` as a standing rule (one paste; the clause id continues each child's own sequence):

```md
**Vacuity guard (every child, after 001's L9).** Any clause that measures elements of a row, group
or section that this child's own CREATE merges, renames or collapses must be paired with a guard
clause: it asserts the measured set is **non-empty** and fails the run when the set is empty, so a
collapse cannot silence its own witness. Guard clauses are numbered in the same L-sequence, run
first in Phase C, and their pass lines read "non-empty (n = <count>)".
```

**Confidence:** 85% — 003's collapse-to-summary mechanism is explicit in its tasks; whether 004/005/006 produce the same event is likely but unverified per-child (their T009–T013 equivalents were not read line-by-line — flagged honestly).

---

## Finding 2.5 — Edge-case sections are written but bind nothing: 003's §8 promises four states, and no clause, capture or AC answers any of them

**Evidence:** `003/spec.md` §8: `- The sheet at its longest content, against the 90svH cap and the published keyboard inset` / `- The sheet with the keyboard up` / `- Empty and single-item states for every list this sheet renders` / `- Both themes, each read on its own rather than assumed from the other`. Grep of 003's `tasks.md` + `acceptance-criteria.md` for these states: the keyboard inset appears in no clause; the empty/single-item states appear in no capture id and no AC; `003/acceptance-criteria.md`'s L-clause rows (AC-001/002/003) reference only the L1–L6 of §13.11. 001's counter-example: its empty-set guard **is** clause L9, and its D7-remediation block (`001/acceptance-criteria.md:46`, AC-009: `**L1 — superseded by D7, 2026-09-11.** The body renders **0** card containers…`) turns a ruling into a clause with a measured current state.

**Finding:** The L3+ bar's "states, edge cases" half is satisfied by prose alone in 003–011: the section reads well and binds nothing. The programme's own strongest precedent — 001 turning its §8-class concerns into L9 and into AC-009/014/016 supersession rows — was not copied.

**Proposed text** — into each of `003`–`011`'s `spec.md` §8, as the closing line (and the corresponding clause line into the VERIFY/CREATE phases):

```md
Each bullet above binds, in one of two ways, before this child leaves VERIFY: a **state clause** —
a lane assertion exercising that state (empty list: the clause walks zero rows and asserts the
empty-state element rendered; keyboard: the published inset matches the published token) — listed
in the CREATE phase with its own L#; or a **captured state** — a constructed scenario variant with
its own capture id, listed in the judged set. A §8 bullet with neither is decoration, and the
reviewer scores Both themes on assumption — the thing this section promised not to do.
```

**Confidence:** 82% — 003's §8-vs-bindings gap is verified by read+grep; the other eight's §8 sections exist (edge=1 across the board) and are assumed same-shaped, per the shared template, not individually read.

---

## Finding 2.6 — Clause-definition home is inconsistent: 001 defines clauses in plan §3.3, 002 in spec §13.11, 003–011 nowhere — the F1.2 contract needs to name ONE home

**Evidence:** `001/plan.md:138` (`### 3.3 The lane assertions — nine clauses, each a number`, thresholds as module consts `:140-141`); `002/plan.md:95` — `- 'tools/live/sheet-grammar.mjs' — the clauses in §13.11 (L1-L6)` (002's clause *definitions* live in its **spec**); 003: neither (its plan has no clause section; its tasks carry bare ids, `003/tasks.md:63` `Run L2 RED at 3`). F1.2 (iteration 1) proposed the plan-§3.3 contract; this finding adds the reconciliation: 002's landed, referenced definitions are in the *spec*, so the contract as written would strand them.

**Finding:** Three homes, one packet. The clause vocabulary — the thing VERIFY, the judge, and the regression set all share — has no single authority. 002's §13.11 works (its reference from plan:95 resolves), but nothing in 003–019 says where *their* clauses' definitions will land, and F1.2's amendment would fork 002's convention.

**Proposed text** — amending F1.2's paste (both go into `plan.md` §6A; this wording supersedes F1.2's bullet 1):

```md
- **One home for clause definitions: the child's `spec.md` §13.11.** Every child defines its lane
  clauses — measured property, source DEFINE row, RED/GREEN number slots, vacuity-guard pairing —
  under a `### 13.11 Lane clauses (L1…Ln)` heading inside its own `spec.md`, beside the §13 table
  the clauses measure; its `plan.md` §3.3 *references* those ids and adds nothing. (001's landed
  §3.3 remains valid history; 002's §13.11 is the ratified shape.) VERIFY, the image judge and the
  071-regression set cite clause ids only from §13.11, never from tasks or prose.
```

**Confidence:** 87% — the three placements are direct reads; the "supersedes" framing keeps F1.2's enumeration demand while relocating its home.

---

## Also read, no finding (negative knowledge)

- 017's T002 (`017/tasks.md:39`) already handles the ChartDrilldownModal live/dead question that Finding 1.4's cousin raised — recorded, good, and stronger than 016's (016 has no dead-surface check at all; its F1.4 preamble amendment covers the reach question instead).
- 018's DEFINE exists and names ClickUp per row (`018/spec.md:225`, `:86` — the only 09-11-scaffolded child besides 013–017 whose §13 exists); its L2+ grades above are 002-style mechanism gaps, not 019's missing-artefact gap.
- The eleven'sDEFINE tables are "scaffolded, not rewritten" by their own preamble (`003/spec.md:220` — `where the table below still names a card, D7 overrides it at CREATE time even though this scaffolded table is not rewritten here`) — the D7 override convention is sound; its D9 counterpart (Source columns) is Finding 2.2's column half, deferred to iteration 3 where composition is the gap class.

**newInfoRatio: 0.65** — justification: the closure-clause ladder, the 18× rubric-instance absence, 016/017's registration holes, the judged-image convention, the single vacuity guard, and the binding-less §8s are all absent from the iteration-1 record and from the packet's own documents; the grades themselves re-read the same 19 documents at a different resolution.

**Sources (12):** 076/{001,002,003,013,016,017}/plan.md; 076/{001,002,003,013,016,017,019}/tasks.md; 076/{001,003,013,019}/acceptance-criteria.md; 076/003/spec.md §8+§13; 076/002/plan.md:95-113; 076/012/implementation-summary.md; 076/coverage-audit.md §2; 014+015/tasks.md:40+47.
