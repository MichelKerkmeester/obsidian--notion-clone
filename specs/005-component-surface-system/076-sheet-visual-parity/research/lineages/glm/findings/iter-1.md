# Iteration 1 — COVERAGE

**Lineage:** `fanout-glm-1789102713325-fbmgv2` · gap class **1 of 5: COVERAGE** (one per iteration; never repeats).
**Read first:** `research/deep-research-state.jsonl` (1 event: init) and `research/deltas/` (empty) — no prior-iteration gap to avoid.
**Angle:** operator requests (roadmap §4 rows 70–9x, §6A rulings 2026-09-08→09-11) × inventoried surfaces (`tools/storybook/sheet-inventory.mjs` → 87 rows in `specs/005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit/inventory.md`) → 076 child → task → lane clause.

---

## Finding 1.1 — Roadmap §4 has duplicate row numbers 86, 87, 88; the packet's own citation "§4 rows 84–9x" is ambiguous

**Evidence:** `specs/005-component-surface-system/roadmap.md:438` `| 86 | *"The menu with horizontal overflow on mobile all…` vs `roadmap.md:441` `| 86 | *"Board cards should also show field name and not…` vs `roadmap.md:443` `| 86 | *"You still cant drag and drop board cards to dif…`; likewise `:439`/`:444` both `| 87 |` and `:440`/`:445` both `| 88 |`. The 076 packet cites the range: `specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md` D9 "roadmap §4 rows 84–9x" (and this lineage's own briefing).

**Finding:** Three rows carry the number 86, two each 87 and 88. Any pointer to "row 86" resolves to two different requests (toolbar-overflow vs board-card-field-names vs board-cross-group-drag). Traceability from operator request → phase breaks exactly where the 076 rulings begin.

**Proposed text** (paste into `roadmap.md` directly under the last table row, before the `*2026-09-05…` history notes):

```md
**A note on row numbers.** Rows 70–85 and 89 onward are numbered uniquely, but the 2026-09-09/10
batch reused 86, 87 and 88 (`roadmap.md:441`, `:444`, `:445` duplicate `:438`–`:440`). When citing
one of the duplicated rows, cite the quoted operator words, not the number alone: 86 = *toolbar
horizontal overflow* (`:438`) / *board cards show field names* (`:441`) / *cross-group drag* (`:443`);
87 = *clean testbed* (`:439`) / *check more sheets* (`:444`); 88 = *testbed folders* (`:440`) /
*double check all sheet work* (`:445`). Rows are history and are not renumbered.
```

**Confidence:** 95% — duplication read directly off three `grep -n "^| 86 |"` hits; no interpretation.

---

## Finding 1.2 — For 17 of 19 children the traceability chain stops before its last link: no enumerated lane clauses exist

**Evidence:** `076-sheet-visual-parity/001-settings-sheet-visual-parity/plan.md:138` — `### 3.3 The lane assertions — nine clauses, each a number` (L1–L9, e.g. `:155` `| **L9** | *(guard)* the landed stack-row width clause **fails on an empty set** rather than passing vacuously…`); `002-properties-sheet-visual-parity/plan.md:3` — `…the six lane clauses and the judge named.` (L1–L6). But grep across the other 17 plans (`003`–`019`) returns **zero** `### 3.3` sections; each only mentions lane clauses in the loop boilerplate (e.g. `018-board-visual-parity-clickup/spec.md:86` — `…one lane clause per measurable row…` — a promise, not a clause).

**Finding:** The coverage matrix's final column (operator request → child → task → **assertion**) is populated for 001, 002 and (28-lane gate) 012 only. The other 17 children inherit the loop's vocabulary without the clause ids, so no request they own currently terminates in a runnable number. This is not negligence — they are scaffolded — but the plan-phase contract that would force the enumeration is not written anywhere the 17 will read.

**Proposed text** (paste into `076-sheet-visual-parity/plan.md`, §6A "Running a child through the loop", as a new bullet under the PLAN node's contract):

```md
- **PLAN's pass rule is clause-enumeration, not clause-promising.** A child leaves PLAN only when
  its own `plan.md` §3.3 exists and lists every clause id (L1, L2, …) with, for each: the measured
  property, its source row in the child's `spec.md` §13 DEFINE table, and the operator request or
  ruling that row answers. Clause ids never skip; guard clauses that assert non-vacuity (the
  001/plan.md:155 L9 precedent — *"fails on an empty set rather than passing vacuously"*) are part
  of the id sequence, not an optional extra. CREATE may not open a clause id that PLAN did not
  name; if CREATE discovers a needed clause, PLAN §3.3 is amended first and the amendment recorded
  in the child's state log.
```

**Confidence:** 90% — the 17-misses count is a grep (argmax: a §3.3-equivalent under a different heading would survive); the 001/002/012 positives are direct reads.

---

## Finding 1.3 — "Covered contextually" for the shared listbox (inventory row 30) contradicts the programme's own one-owner-per-shared-primitive rule (roadmap §7.11)

**Evidence:** `076-sheet-visual-parity/coverage-audit.md` §2 row 30 — `| 30 | dropdown (overflow) | … | Shared primitive — covered contextually by 003/004/006/007 wherever it appears; not a standalone gap |`. Against `roadmap.md:2159` — `### One owner per shared primitive, so two families cannot both define it`. Same class: §2 row 8 — `| 8 | record-peek | … | 008 (peek mounts the record sheet on touch; see §3) |` — assigned, but no 008 task names it (grep of `008-record-sheet-visual-parity/tasks.md` for "peek": 0 hits).

**Finding:** The inventory's 30th surface — the generic listbox used by sort, filter, add-view and property-type pickers — has four incidental riders and no owner, while the roadmap's own §7.11 rule (written for exactly this situation after `051`'s parity retarget) demands one. Each rider re-derives chevron/checked-row/height anatomy; the first rider to PLAN defines it, the rest diverge. `record-peek` is worse than contextual: 008 owns it by note, but nothing in 008's DEFINE will ever exercise it.

**Proposed text** — two edits.

1. Paste into `076-sheet-visual-parity/010-picker-sheets-visual-parity/spec.md` §3 (Producers) and §13 (DEFINE):

```md
**Shared listbox primitive (inventory row 30).** This child additionally owns the shared
`src/views/dropdown-field.ts` listbox anatomy — row height, chevron, checked-row state, divider
placement — on behalf of `003`, `004`, `006` and `007`, which inherit it by reference (roadmap §7.11:
one owner per shared primitive). Their DEFINE tables point here for listbox anatomy and may add
rows but never redefine it. 010's DEFINE gains one section, "Shared listbox", with rows: row
anatomy (leading slot, label, trailing affordance), selected state, divider, stacking behaviour —
Source: the same reference the host sheet's row follows, per D9 composition.
```

2. Paste into `076-sheet-visual-parity/008-record-sheet-visual-parity/spec.md` §13 (new row) and `008.../tasks.md` (one task line):

```md
- **record-peek (inventory row 8).** `src/views/table-record-peek.ts` mounts this record sheet on
  touch. DEFINE gains its row: the peek's same sheet, same frame, same grab handle — no
  presentation of its own. VERIFY's capture set includes the peek-mounted variant
  (`constructed`-registry registration if missing — parent spec.md §4 In-Scope, "Registering any
  surface that turns out to have no constructed capture, in the same child").
```

**Confidence:** 85% — the rule-vs-audit contradiction is certain; whether 010 (not 003) should own the listbox is a judgment, argued from 010 already owning the picker family.

---

## Finding 1.4 — 016's four producers survived the 008 deprecation in `src/`, but three are now reachable only from legacy vaults; its spec never mentions this

**Evidence:** `076-sheet-visual-parity/016-view-toolbar-options-visual-parity/spec.md:27-30` lists the four producers; grep of that spec for `deprecat|archive|008` returns **no match**. Meanwhile `archive/deprecated-views/{calendar,timeline,chart}/` hold the archived view renderers (operator ruling, roadmap.md:429/432 — rows 77/80: *"Also I want to deprecate calendar and timeline view completely for now"*, *"Also deprecate chart view"*), while `src/views/database-view.ts:121` — `import { CalendarToolbarRenderer } from "./calendar-toolbar-renderer";` — and the identical chart/toolbar import chains still live; `src/views/date-value-picker.ts` and `src/views/record-surface/cell-editor-date.ts` mount `calendar-mini-calendar-renderer.ts` (so the mini-calendar popover is fully live through 010/008). The testbed ruling (`roadmap.md:439`, row 87 — `exactly [table, board]`) means no fresh vault ever shows the three.

**Finding:** 016's DEFINE, capture and judge legs will photograph three surfaces (calendar/timeline/chart toolbar options + their stacked dropdowns, audit rows 31–34, 83–85, 87) that no current-fixture vault can open, and one (mini-calendar) that 010 also renders. Without a recorded mount state the judge scores dead UI as if it shipped, and 016's "every row names its Source" requirement (its spec:141, REQ-004) silently glosses over which rows have any living mount at all.

**Proposed text** (paste into `016-view-toolbar-options-visual-parity/spec.md`, top of §13, as a preamble note):

```md
> **Mount state after 008's deprecation (recorded 2026-09-11).** The calendar, timeline and chart
> *view* renderers are archived (`archive/deprecated-views/{calendar,timeline,chart}/`, roadmap §4
> rows 77/80); their *toolbar* renderers remain live in `src/` and still import
> (`src/views/database-view.ts:121`), so these four popover surfaces are reachable only from a
> legacy vault that already declares the view type — the 074/008-001 testbed carries exactly
> `[table, board]`. The mini-calendar popover is the exception: `src/views/date-value-picker.ts`
> and `src/views/record-surface/cell-editor-date.ts` mount it on every date-field interaction, so
> it is fully live through 010 and 008. Every DEFINE row therefore carries a **Reach** column —
> `live (010/008)` for the mini-calendar, `legacy-vault only` for the other three — and the
> judged captures come from the constructed harness, which mounts them regardless; the judge is
> scoring the surface, not its reachability, and the Reach column travels with the row into
> `verification.md`.
```

**Confidence:** 92% — import graph read from the tree; "reachable only from legacy vaults" follows from the archived view renderers plus the `[table, board]` testbed ruling, and is stated as inference, not grep.

---

## Finding 1.5 — Two surfaces of the nine "no constructed counterpart" fixtures have no 076 owner at all: the selection status bar and the table load-more control

**Evidence:** Parent `076-sheet-visual-parity/spec.md` §2 — `Nine fixtures carry no constructed counterpart — … chrome-selection-status-bar, chrome-toast-success, chrome-toast-error, chrome-table-load-more — and none of them is one of the eleven sheets`. Of those nine, six are fixtures OF surfaces 017 now owns (toast → 017's Toast; computed-cleanup/invalid-events/base-import → 017's bundle) and two are fixtures of 008's record-detail. The selection status bar's producers — `src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`, `src/views/rendered-view-roots.ts` — appear in no 076 child's producer list (grep of all 19 `spec.md` §3 Producers sections for "rendered-view-roots": 0 hits), and the same holds for the load-more control (`src/views/embedded-database-renderer.ts`, surfaced to i18n in `src/i18n.ts`). The coverage audit (§2, 87 rows) never lists either: the inventory counts sheet-capable surfaces only.

**Finding:** The 87-row inventory's own blind spot: it enumerates what a producer *opens*, so the selection bar — a bottom-anchored surface that arbitrates with sheets for the same screen edge (roadmap §4's own reading of old row 31: *three surfaces arbitrating for the bottom edge*) — and the load-more row arePhantom-uncovered. Row 93's ruling (*"Double check we have inventorized every sheet / dropdown"*) is satisfied by the 87; the selection bar is neither sheet nor dropdown, so it falls outside the ruling's words but inside its intent ("Ui improvement is focus here").

**Proposed text** — new child, full scaffold:

```md
### 020-table-chrome-visual-parity — Table Selection Bar and Load-More Visual Parity

**Why a 20th child.** The 87-surface inventory counts what a producer opens; two always-visible
table surfaces it does not count — the selection status bar (producers:
`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`,
`src/views/rendered-view-roots.ts`) and the table load-more control
(`src/views/embedded-database-renderer.ts`, copy in `src/i18n.ts`) — have no 076 child. They are
the two surfaces of the nine "no constructed counterpart" fixtures (`../spec.md` §2) not already
absorbed by 017 (toast) or 008 (record-detail).

**DEFINE source rows (per D9 composition; neither surface has a dedicated reference):**
- Selection bar: Anytype's multi-select context row (structure only — Anytype's phone captures
  show the pattern, not this control); Notion's selection count pill (structure only); the
  operator's C-1..C-6 captures when they arrive outrank both (D3). Rows: count pill, action
  order, height ≥ 44pt, bottom-inset arbitration with an open sheet (16pt + grab-handle grammar
  from D7/D9).
- Load-more: Notion's plain "Load more" text row (structure only); Anytype's none. Rows: single
  text row, divider above, no card, 44pt+ hit height.

**Six phases:** DEFINE (the two tables above; `020`'s T001 confirms the exact producer lines) →
PLAN (producer region + stylesheet + scenario registration — both fixtures gain their
constructed counterparts here, closing the 076 parent's §2 nine-fixture note to seven) → CREATE
(RED→GREEN per clause) → SCREENSHOT (phone light + dark, selection bar exercised with 2+ rows
selected, load-more on a >50-row view) → VERIFY (lane + judge ≥ 14/16, no 0, twice unchanged) →
REMEDIATE (any row < 2).

**Sequencing:** joins 013–019 as sequence-independent (holds the shared css-lane triplet in its
own turn, D4's rationale); after 008's recorder rows land, its bottom-edge arbitration clause
reads 008's landed grammar.
```

**Confidence:** 80% — the producer/fixture mapping is grepped; the "always-visible" reach of both controls in the current testbed (selection needs multi-select; load-more needs >50 rows) is unverified, hence T001 confirms before DEFINE closes. If 008/010/017 owners prefer to absorb them, that is a smallerdelta but must be recorded — currently they are recorded nowhere.

---

## Finding 1.6 — 019 promises a DEFINE table its spec does not contain, and inherits 012's card grammar without naming it

**Evidence:** `019-board-card-drag-feel-clickup/spec.md:85` — `**Deliverables**: a completed DEFINE table with a Source column (ClickUp, per the operator's board-leads ruling), DOM-lane assertions on the ghost/placeholder/highlight elements during a scripted touch drag, mid-drag captures (light + dark) as the judged images…` — but the spec's heading list ends at `## 12. OPEN QUESTIONS` (`:215`); there is no `## 13` (018 has one: `018-board-visual-parity-clickup/spec.md:225` — `## 13. THE DEFINE TABLE — reference, current state, target`). Grep of 019's spec for the frame ruling: **0 D7 references**.

**Finding:** 019's SPEC-DEFINE (loop step 1) has no artefact to pass. Its mid-drag ghost/placeholder/highlight render through the same `.obnotion-kanban-card-meta` grammar 012 just rebuilt (single-column, landed: `012.../implementation-summary.md` — `recent_action: "Single-column meta grid landed; lane, captures and 28-lane gate green"`), and the placeholder row's presentation is exactly where the D7 no-container rule either holds or visibly breaks — yet 019's spec never invokes either.

**Proposed text** (paste as a new `## 13. THE DEFINE TABLE — judged frames` at the end of `019.../spec.md`):

```md
## 13. THE DEFINE TABLE — judged frames

> Placeholder pending 019's DEFINE step (tasks.md Step 1, T001–T003). This section exists so the
> deliverable promised in Phase Context (`a completed DEFINE table with a Source column`) has a
> numbered home, as 018's `:225` does.

**The judge scores three frames, not one** (mid-drag evidence, per this child's §2):

| # | Frame | What the reference answers | Source (D9) | Inherits |
|---|-------|----------------------------|-------------|----------|
| 1 | Armed — finger down, card lifted | Lift scale, shadow, whether the source slot shows | ClickUp drag, operator screenshot + words | 012's landed single-column meta grid, unchanged |
| 2 | In-flight — ghost over placeholder | Ghost opacity, placeholder row's presentation | ClickUp drag | The placeholder row renders the **D7 grammar**: plain sheet/card background, hairline divider, no lighter container |
| 3 | Settled — drop resolved | Settle animation, whether the target group's header/count updates visibly | ClickUp | 018's landed header grammar (`019` follows `018` on `board-renderer.ts` — this spec's own sequencing note) |

Every row names ClickUp as its Source (REQ-010); the D7 no-container rule binds frames 2 and 3
because they reuse 012's field grid; the DOM-lane assertions sample the same three frames'
geometry (`--obnotion-*` tokens, transform values), and the judged images are the mid-drag
captures, light + dark, one per frame.
```

**Confidence:** 88% — the missing §13 is a heading-list read; the 012-inheritance claim rests on 012's landed state plus the shared class name (`.obnotion-kanban-card-meta`), which the drag path renders but which 019's spec never says.

---

## Finding 1.7 — The coverage matrix, first pass: every 076-owned request resolves to a child; the assertion link is the missing one (see 1.2)

**Evidence:** Requests, from `roadmap.md:436-451` (rows 84–94, the 076-relevant set): 84 → `001` (`:436` — `| 84 | *"Settings sheet still has bad ui overall and needs strict alignment with notion sheets"* | 071…007-settings-sheet-strict-alignment |`), 85 → `004`, 89 → `001–011` (`:446` — `| 89 | *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"…` — "eleven children, one per sheet"), 90 → `012` (`:447`), 91 → `002` (`:448`), 92 → `001` (`:449`), 93 → `013–017` + coverage audit (`:450`), 94 → `018/019` (`:451`). Non-076-owned rows 70–83 route to their own packets (070, 071, 072, 073, 074, 075, 066, 008-calendar…); for 076 they are either the regression floor 076's VERIFY keeps green, or superseded DEFINE inputs — no 076 child re-owns them. §6A rulings 2026-09-08→09-11, five total (roadmap.md:1922–1959), bind: 09-08 delegation → 076 `spec.md` §5 CREATE row (`Legs sized for one GLM 5.3 flash or Sonnet pass`); 09-09 widening → `071`'s, not 076's; 09-10 ~21:40 → 076's six-step loop + D1–D4 + each child's AC-004/005/008; 09-10 ~21:50 → D6 + parent `plan.md` §6A + `goal.md` §3; 09-11 → D7/D9 + the binding lists in each.

**Finding:** At the child level, criterion 1 of the programme's success definition holds — no 076-owned request from rows 84–9x lacks a dedicated multi-phased child, and 19 children + the 020 proposal (Finding 1.5) = 20 ≥ 15. What does not yet resolve, anywhere, is the task→clause link for 17 children (Finding 1.2) — the matrix's final column reads "promised at PLAN" 17 times. The first-pass matrix is recorded here; the synthesis re-issues it with 1.2's closure state.

**Confidence:** 95% for the request→child half (each resolution read off the row's own Packet column); the floor/supersede classification for rows 70–83 is inference from the rows' own Status cells.

---

## Also read, no finding (negative knowledge)

- `tools/storybook/sheet-inventory.mjs` regenerates `071/001/inventory.md`; its header (lines 8–10) — `One row per surface the app can open (sheet, panel, popover, menu card, toast)` — and the committed file's 104 table rows (87 surfaces + prose rows) were re-counted, not re-run: the generator writes into `071/001/`, outside this lineage's write surface, so it was **not** executed (runner contract: no out-of-lineage writes).
- `012`'s CREATE+SCREENSHOT landed against Anytype, and its `spec.md:236-241` preamble already reconciles D9 (ClickUp-first, "Neither decision rewrites the scaffolded table below") — deferred to iteration 3 (REFERENCE_COMPOSITION), where its REQ-004/SC-003 Anytype-only residue belongs.
- `001`'s D7 density: 27 references in `001/spec.md` vs 1 in each of `003`–`011` — the later sheets carry D7 as a pointer only. Read as depth (iteration 2), not coverage.

---

**newInfoRatio: 0.70** — justification: five of six findings (duplicate §4 numbers, 016's post-008 mount state, §7.11-vs-audit, 019's missing §13, the 020 proposal) appear nowhere in `coverage-audit.md` or the 87-row inventory; the finding-1.7 resolution table re-derives what the audit's §2 already shows.

**Sources (13):** roadmap.md; 076/coverage-audit.md; 076/spec.md; 071/001/inventory.md; 076/{001,002}/plan.md; 076/{008,010,012,016,018,019}/spec.md; 012/implementation-summary.md; src/views/database-view.ts; src/views/date-value-picker.ts; archive/deprecated-views/.
