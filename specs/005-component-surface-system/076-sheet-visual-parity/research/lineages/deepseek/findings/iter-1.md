# Iteration 1 — COVERAGE

**Gap class:** COVERAGE (operator request → child → task → lane clause; every inventoried surface →
child).

**Scope of this pass.** All 29 rows numbered 70–9x in `roadmap.md` §4, every §6A ruling dated
2026-09-08 → 2026-09-11, and the 87 surfaces of `tools/storybook/sheet-inventory.mjs`, cross-read
against the 19 children of `076/spec.md`'s Phase Documentation Map and each child's `spec.md` §13 /
`tasks.md`.

---

## C-1 · D9's Source column exists in 7 of 19 children and in none of the eleven sheets

**Evidence.**

- `076/004-sort-sheet-visual-parity/spec.md:237` — the DEFINE table header is
  `| Element | Ours today | Notion (structural) | Target |` — four columns, one reference, no Source.
- Identical header shape, one reference each, at `005/spec.md:238`, `006/spec.md:235`,
  `007/spec.md:244`, `008/spec.md:238`, `009/spec.md:242`, `010/spec.md:247`, `011/spec.md:241`,
  `012/spec.md:261` (`| Element | Ours today | Anytype (structural) | Target |`), and
  `002/spec.md:321` (`| Element | Ours today | Notion (R-1/R-2, structural) | Target |`).
- The scaffolded children *do* carry it: `013/spec.md:221`, `018/spec.md:246` and `019/spec.md:242`
  all read `| Element | Ours today | Reference (structural) | Target | Source |`.
- The binding ruling: `076/decision-record.md` D9 — *"Every sheet child's `spec.md` §13 row-by-row
  and control-type tables gain a **Source** column naming which of Anytype, Notion or ClickUp that
  row's target follows, and why"*.
- D9 landed 2026-09-11 05:38; the parent map's own status column still reads `001`–`002` `planned`,
  `003`–`019` `scaffolded`.

**Finding.** D9 binds **every sheet child**, and eleven of them (`001`–`012`, the entire original
programme and the eleven sheets the operator actually named) have no Source column at all. `001`,
`002` and `012` mention composition in prose; `003`–`011` mention it nowhere — a grep for
`D9|mix and match|Mix match` across `001`–`012/spec.md` returns only `001` and `012`. As written,
`003`–`011` cannot satisfy their own DEFINE pass rule (*"every reference is a real path"*,
`spec.md` §5 step 1) because the reference they must compose is not named per row anywhere in the
child. This is worse than a missing column: the rubric's Frame / Sections / Controls rows are
judged **against the composed target** (D9's "Rubric impact"), so with no recorded composition the
judge scores those children against one app the operator explicitly declined to rank first.

**Proposed text** — paste into each of `002`–`012`'s `spec.md` §13, replacing the table header
(example for `004`; the same edit with the child's own reference column names for `002`, `005`–`012`):

```markdown
### The table

Composition is per **element**, per D9 (`../decision-record.md`): Anytype, Notion and ClickUp do not
outrank one another, and each row names the reference it follows and why. The operator's own words
and captures outrank all three wherever they speak directly (D7's frame ruling is such a case and is
never reopened by composition). Board surfaces lead with ClickUp; this child is a sheet, so ClickUp
appears only where it is genuinely better for the element.

| Element | Ours today | Reference (structural) | Target | Source | Why this source |
|---|---|---|---|---|---|
| Sheet frame | … | … | Handle present; 0 bare icon buttons in the header | **Notion** (header) + **D7** (frame) | Notion's View options is the only reference with a centred title and trailing Done on a phone sheet; D7 binds the frame regardless of reference |
| Rule: property row | … | … | Type icon leads; the row opens a property picker | **Anytype** | Anytype's sort rows carry a leading type icon on a plain background; Notion's own sort rows were never captured at readable resolution (D3 rung 3) |
| … (one row per §13 row) … | | | | | |
```

and add to each such child's `tasks.md` Phase A, after the existing DEFINE tasks:

```markdown
- [ ] **T00x** Add the Source column to `spec.md` §13 and fill it per row, naming Anytype, Notion or
      ClickUp and one line of why (`../decision-record.md` D9, `../spec.md` §4). Where no reference
      carries the element, write `none — internal consistency with <child>` rather than leaving the
      cell empty; D3 already permits an internal-consistency justification and forbids inventing a
      reference position (`spec.md`)
```

**Confidence:** high (the headers are mechanical and verbatim; the D9 text is explicit that the
column binds every sheet child).

---

## C-2 · The 2026-09-11 rulings reach 8 of 19 children; `003`–`011` carry a one-line D7 pointer and nothing else

**Evidence.**

- `roadmap.md` §6A, ruling of 2026-09-11 05:30–05:38: *"every sheet child's `spec.md` §13… gains a
  **Source** column"*, and the same entry names the binding locations: *"`076/001/spec.md` §13,
  `076/001/tasks.md` `### Frame-ruling remediation`; `076/002/spec.md` §13, `076/002/tasks.md`
  `### Frame-ruling remediation`; `076/003`-`076/012/spec.md` §13, one-line pointer each"*.
- Measured: `003`–`011` each contain exactly **one** occurrence of `D7|dividers on the plain|no card
  container` in `spec.md` and none in `tasks.md`.
- `002/tasks.md:150` opens `### Frame-ruling remediation (2026-09-11)` with *"T005 gave this sheet's
  two groups `076/001`'s `.obnotion-settings-card` treatment; the operator has since ruled the card
  container out entirely (D7…)"* — a real remediation block. `003`–`011` have no such block.
- The parent's own Scope §4 lists, per child, *"Registering any surface that turns out to have no
  constructed capture, in the same child"* — and no `003`–`011` task runs the D7 check.

**Finding.** D7's frame ruling was transcribed as a **pointer** into nine children and as a
**remediation plan** into two. A pointer satisfies a documentation-truth check and does nothing for
the loop: `003`–`011`'s Phase C tasks still create `.obnotion-settings-card`-style grouping because
their DEFINE tables (unremediated, per C-1) were written on the card premise. The first judge pass on
`003` will therefore score Frame 0 (D7: *"a card container around rows or values scores **0** on
Frame regardless of how well it otherwise matches"*) and the child will spend a remediation cycle
discovering what `001`/`002` were handed in advance. Nine children × one avoidable judge cycle is the
cost of the pointer.

**Proposed text** — paste into `003`–`011`'s `tasks.md` as a new block placed **before** the
existing Phase C heading (the T-numbers below assume `003`'s existing T001–T026; each child keeps its
own numbering and its own two producer files):

```markdown
### Frame-ruling remediation (2026-09-11) — runs before Phase C above

The operator ruled on 2026-09-11 05:30 that sheet content sits on the **plain sheet background**
with hairline dividers, never inside a rounded or lighter card container (D7,
`../decision-record.md`), and on 2026-09-11 05:38 that each DEFINE row names its own composed
reference (D9). Both rulings postdate this child's scaffold. This block carries the shipped tree to
them; Phase C's own tasks are then (re-)attempted, not skipped.

- [ ] **T-r1** Add the Source column to `spec.md` §13 per D9 and fill every row (see C-1's proposed
      text). Run the D7 audit over `spec.md` §13's Target column: every row whose target is a card,
      container, section box or inset group is rewritten to the divider target, and the section's
      `### Contradictions with landed 071 rulings` list gains any `071` card landing this reverses
      (`spec.md`)
- [ ] **T-r2** Run **L-frame** RED against the shipped tree and record the number: count the card
      containers this child's surface paints (`.obnotion-settings-card`, any `.obnotion-*-card` with
      `border-radius` and a fill distinct from `--obnotion-surface-overlay`). The target is **0**.
      Set the count to `0` by construction rather than by exception: a container found on a sibling
      surface the child does not own is recorded, not fixed here (`tools/live/sheet-grammar.mjs`,
      `styles.css`)
- [ ] **T-r3** Re-run the same clause GREEN with **0** containers, and record the divider geometry
      it asserts instead: `::before` divider present between adjacent rows, `left` inset to the
      label's leading edge, `right` at the sheet's trailing edge, `height` ≤ 1px, and section labels
      as plain secondary text with **no** preceding card boundary. A card boundary removed but no
      divider inserted scores 0 on the rubric's Sections row just as the card did
      (`tools/live/sheet-grammar.mjs`)
- [ ] **T-r4** Re-screenshot and re-judge only if T-r2/T-r3 changed the picture; record both numbers
      in `verification.md` beside the child's own iteration table (`verification.md`)
```

**Confidence:** high (pointer-vs-plan is measured; the D7 rubric consequence is quoted from the
ruling).

---

## C-3 · Every `scratchpad/…` path the children cite as evidence is absent from the repository

**Evidence.**

- Eight children cite scratchpad paths: `012`, `013`, `014`, `015`, `016`, `017`, `018`, `019`.
  Examples: `013/spec.md` — *"with a Source column per the operator's mix-and-match rule
  (`scratchpad/loop/076-frame-ruling.md`)"*; `018/spec.md` — *"`scratchpad/loop/board-visual-parity-clickup/operator-notes.md`"*;
  `019/spec.md` — *"`scratchpad/operator-references/clickup-board-card-drag-reference.png`"*.
- Measured: `ls scratchpad` in this worktree → no such directory; the same directory is absent from
  the main checkout. `find . -maxdepth 2 -name scratchpad` returns nothing.
- The parent's own DEFINE pass rule: `spec.md` §5 step 1 — *"every reference is a real path; every
  number is ours or `TBD`"*.
- The coverage audit repeats the dependency: *"Operator screenshot references are mirrored into
  `scratchpad/loop/<child>/operator-notes.md` for each of the seven, so the loop planners see them
  without re-deriving this audit"* (`coverage-audit.md` §5).

**Finding.** Six of the seven coverage-audit children (`013`–`018`) and both board children name
their primary evidence under a path that does not exist in the tree being executed. Two of them are
the only record of the operator's ClickUp ruling images, which D9 makes load-bearing for boards
(`018`, `019`) and for the whole frame composition. Any agent starting `013` today fails its FIRST
DEFINE task at the evidence-open step, or worse, proceeds on the prose summary alone and invents the
target — the failure `spec.md` §5's pass rule exists to prevent. Note the distinction from D6's `$S`:
the *loop state* under `$S/loop/` is deliberately outside the repo, but the *reference images and the
operator's notes* are cited as `scratchpad/…` relative to the repository root and are not there.

**Proposed text** — one block for `013`–`019`'s `tasks.md` Phase A, and one amendment to
`coverage-audit.md` §5:

```markdown
- [ ] **T001a** Resolve the evidence paths before reading anything else. Every `scratchpad/…` path
      named in `spec.md` §13 and §14 is either (a) present in this repository — then record its
      resolved path and continue; or (b) absent — then record it as `TBD — evidence not present in
      tree` in the child's own `verification.md` and **stop the DEFINE step** rather than composing a
      target from prose. The operator's own words in `../../roadmap.md` §4 (this child's row) and the
      ruling text in `../decision-record.md` (D7/D9) are the fallback evidence; a DEFINE table built
      on those must say so in the Source column, and re-open when the images arrive
      (`scratchpad/**`, `spec.md`, `../decision-record.md`)
```

```markdown
Operator evidence lives in the packet, not in a session scratchpad. Every reference image a child's
DEFINE step opens must sit at a repository path — under
`076-sheet-visual-parity/references/` for the operator's own captures, or under
`screenshots/{clickup,notion,anytype}/` for third-party assets. `scratchpad/…` citations are
historical and do not resolve in a fresh worktree.
```

**Confidence:** high (the path check is mechanical; the consequence is read off the packet's own
pass rule).

---

## C-4 · Two control families the operator ruled on have no owning child

**Evidence.**

- `coverage-audit.md` §2 row 30: *"dropdown (overflow) | phone+desktop | `src/views/dropdown-field.ts`
  | `constructed-dropdown*` | none | **Shared primitive — covered contextually by 003/004/006/007
  wherever it appears; not a standalone gap**"*.
- The operator's row 72 ruling, routed to `073-checkbox-controls` (`roadmap.md` §4 row 72):
  *"Also checkboxes and radios are too big. And also we shouldnt have radio inputs only checkboxes"*
  — `073` reads `completion_pct: 90`, `recent_action: "Implemented and gate-verified; awaiting the
  operator device check"`.
- D1's own evidence paragraph makes the checkbox the founding defect of this packet:
  *"still shows every row as **↑ ↓ · filled blue checkbox · type icon · label**"* (`spec.md` §2), and
  `002/spec.md:121` names `src/views/checkbox.ts` as *"the control the row's state indicator stops
  using"*.
- D9 lists pickers and stacking among the elements each child composes independently, and the
  hard-constraint list ends *"Rows at 44pt or taller … this constraint is the floor every sheet
  shares"*.

**Finding.** `dropdown-field.ts` is the listbox the filter, sort, add-view, property-editor and
settings sheets all mount as their picker; it is the single most-reused control in the programme and
it has no child, no DEFINE table, no lane clause of its own and no both-theme target. The same is
true of the checkbox/radio control: `073` is at 90% on a *behavioural* ruling, and `002` removes the
checkbox from one row — but the control's own **geometry** (the "too big" half of row 72) is owned by
nobody, so a checkbox rendered inside `010`'s pickers or `013`'s panel can still be the wrong size
with every lane green. "Covered contextually" is precisely the evidence shape D1 was written to
disqualify: a control that appears on eleven surfaces and is asserted by none of them.

**Proposed child** (name, number, DEFINE source rows, six phases):

```markdown
### 020-control-primitives-visual-parity

| Field | Value |
|---|---|
| Title | Control primitives — listbox, checkbox/radio, native select, search field, icon button |
| Opened by | Coverage gap C-4, this audit iteration; surfaces previously marked "covered contextually" by `coverage-audit.md` §2 row 30 and by the `073`/`002` split |
| Producers | `src/views/dropdown-field.ts`, `src/views/checkbox.ts`, `src/views/record-surface/property-row.ts:417` (the checkbox call site), the native-select call sites named in `sheet-grammar.mjs`'s native-select clause |
| DEFINE source rows | `roadmap.md` §4 row 72 (checkbox size, radios removed — operator, 2026-09-08) · `roadmap.md` §4 row 89 and `decision-record.md` D1 (the properties row's checkbox) · D9's "pickers/stacking" element · `coverage-audit.md` §2 row 30 |
| Reference | Anytype's desktop menu cards (`screenshots/anytype/desktop/menus/anytype-menu-cell-checkbox-*.png`) for the listbox; Notion's View options sheet for the picker's trailing chevron; operator captures when they land (D3 rung 1) |
| Six phases | DEFINE (row-by-row table for all four primitives, Source column per D9) → PLAN (one lane clause per primitive, wired) → CREATE (RED/GREEN per clause) → SCREENSHOT (both themes, phone) → VERIFY (judge + operator row) → REMEDIATE (two consecutive passes) |
| Does not gate | Not one of the eleven sheet sequences (same independence clause `013`–`017` carry); `002`, `003`, `004`, `006`, `007`, `010` and `013` re-run its clauses unchanged as their regression floor |
| Suggested order | Land **before** `003`–`011` CREATE: a control fixed once is cheaper than eleven children re-fixing it, and every one of them mounts it |
```

**Confidence:** medium-high — the surface claim is mechanical (row 30's own "covered contextually"
text plus the absence of any child naming `dropdown-field.ts` as a target); the recommended ordering
is a judgement call and should be confirmed against the css-lane serialisation rule (D4).

---

## C-5 · Rows 70–88 map cleanly to other packets; the one 076-relevant row with no child is the linked-view ask, and it is already closed

**Evidence.** `roadmap.md` §4 routing column, rows 70–88: `070`→`070-ios-view-data-regression`,
`71`→`072-linked-view-blocks-ux`, `72`→`073-checkbox-controls`, `73`→`058-card-title-and-title-formats`,
`74`→`071/002`, `75`→`071/003`, `76`→`071/001`, `77`/`78`/`80`→`008-calendar-timeline-chart-deprecation`,
`79`/`87`/`88`→`074-test-data-consolidation`, `81`/`82`→`066-notion-states-refinement`,
`83`/`86(toolbar)`→`075-toolbar-labelled-buttons`, `84`→`071/007`, `85`→`071/005`,
`86(board field names)`→`045-board-card-properties`, `86(board drag)`→`069-board-cross-group-drag`,
`87(check more sheets)`→`071/008`–`014`, `88(design review)`→`071/sheet-design-review` + `071/015`.
Measured status: `072-linked-view-blocks-ux/spec.md` `completion_pct: 100`; `073` `completion_pct: 90`.

**Finding.** No row in 70–88 is unowned, so the programme's *request* coverage is complete — the gaps
are in the *rulings'* transcription (C-1, C-2) and in the *surface* ledger (C-4, C-6). Recording this
explicitly matters because the operator's instruction to this audit says "map each → child" and a
reader who finds no gap there should not conclude the audit found nothing.

**Confidence:** high.

---

## C-6 · The exclusion list in `spec.md` §2 is not carried into `coverage-audit.md`, so two surfaces read as neither owned nor excluded

**Evidence.**

- `spec.md` §2 lists nine fixtures with no constructed counterpart and says *"**none of them is one
  of the eleven sheets**"*; §4 Out of Scope repeats: *"The nine fixtures with no constructed
  counterpart listed in §2; they are recorded there and are not sheets"*.
- `coverage-audit.md` §2's tables nevertheless carry two of them as **NONE → 017**
  (`chrome-toast-success`, `chrome-toast-error`, rows 53) and give no row at all to
  `chrome-selection-status-bar` or `chrome-table-load-more`.
- D2(b): *"A capture used as parity evidence must come from a scenario that mounts the shipped
  renderer, not hand-written fixture markup."* `017/tasks.md` T001 is the only task that could
  register the toast scenario.
- `roadmap.md` §4A is the programme's existing mechanism for exactly this class of deferral
  (*"confirmed on the operator's device, or deferred by the operator with the deferral recorded"*).

**Finding.** Three separate ledger defects, each small, together a traceability hole: (a) the toast
is claimed by `017` while its only captures are two of the nine no-constructed-counterpart fixtures —
so `017` must register a scenario **first** or its judged image violates D2(b); (b) the selection
status bar and table-load-more chrome are named in neither the audit nor any child, and their only
"closure" is a sentence in the parent spec; (c) `§4A`'s device pass has a stale denominator (29 rows),
which the roadmap itself admits — and `076` adds nineteen operator gate-(c) rows on top of it with no
consolidated device list anywhere.

**Proposed text** — append to `coverage-audit.md` §3:

```markdown
### Surfaces deliberately excluded, and where the exclusion is recorded

| Surface | Why excluded | Recorded at |
|---|---|---|
| `chrome-selection-status-bar` | Not a sheet: a selection-count bar painted over the table, owned by `022-selection-bar-keyboard-docking`'s placement work; `076` is presentational-parity only and would duplicate that packet's own lane | `spec.md` §2, §4 |
| `chrome-table-load-more` | Not a sheet: a table control's pagination footer, no phone-sheet presentation and no reference of any kind | `spec.md` §2, §4 |
| `chrome-toast-success` / `chrome-toast-error` | Claimed by `017`; **first task must register a constructed scenario** — today only a hand-written fixture exists, which D2(b) disqualifies as parity evidence | `017/spec.md`, `017/tasks.md` T001 |
| `panel-record-detail-title-currency`, `panel-record-detail-sheet-title-currency`, `panel-computed-cleanup-modal`, `panel-invalid-events-modal`, `panel-base-import-modal` | Duplicate fixtures over surfaces already covered by a constructed scenario (`fixtureOf`); not the eleven, not new | `spec.md` §2 |
```

and append to `076/goal.md` §3 (after the per-child operator rows):

```markdown
### The consolidated device pass (D1, D5)

Nineteen `076` children each end with an operator row that no agent ticks. Those nineteen rows are
collected here as one list, in the order the sheets are met, so the operator reads one document on
one build rather than nineteen:

| # | Child | What to look at on the phone | Which D7/D9 ruling it confirms |
|---|---|---|---|
| 1 | `001-settings-sheet-visual-parity` | The settings sheet: one plain background, hairline dividers between rows, no rounded lighter box around any row or value; row labels and values at one type size apart | D7 frame, D9 typography |
| … (one row per child, in Phase Map order) … | | | |

A release that carries a `076` child's work is cut only when that child's own `$S/loop/<child>.jsonl`
shows a `DONE` event (D8). The device pass above is the operator's own gate and is never ticked by an
agent.
```

**Confidence:** high for (a) and (b) — both are direct text mismatches; medium for the consolidated
device-pass proposal, which is a process recommendation.

---

## C-7 · `roadmap.md` §4 has three rows numbered 86 and two numbered 87, so "rows 84–9x" is not a resolvable reference

**Evidence.** The §4 table contains, in order: row 86 at `roadmap.md:172` (*"The menu with horizontal
overflow on mobile allows vertical movement"*), row 86 again at `:175` (*"Board cards should also
show field name and not just value"*), row 86 a third time at `:177` (*"You still cant drag and drop
board cards to different columns on mobile"*); row 87 at `:173` (*testbed views*) and again at `:178`
(*"Check more sheets align closer to notion"*); row 88 at `:174` (*testbed folders*) and again at
`:179` (*design-fundamentals review*). The section's own opening paragraph concedes the drift:
*"**Fifty-one reports** … *(The table has since grown through row 88; the counts in this paragraph
date from its writing.)*"*

**Finding.** The operator's instruction for this audit — and several spec citations — address the
table by row number (`rows 84–9x`, `row 91`, `row 92`). With duplicate numbers, `row 86` is
ambiguous three ways, and two of the three are different packets (`045` and `069`) while the third is
`075`. Any future traceability claim of the form "row 86 → child X" is unverifiable without prose.

**Proposed text** — append to `roadmap.md` §4, immediately after the table:

```markdown
**Numbering defect, recorded 2026-09-11.** Rows **86**, **87** and **88** each appear more than once
in the table above (86 three times: the toolbar's vertical movement, the board card's field name, and
the board's cross-group drag; 87 twice: the testbed's view set and the widen-the-audit ruling; 88
twice: the testbed's folder shape and the design-fundamentals review). Citations that address these
rows by number are ambiguous. The rows added from 2026-09-09 onward are therefore **renumbered 95+**
below; the duplicate numbers are left in place, not rewritten, because `076`, `045`, `069`, `074` and
`075` all cite them.
```

**Confidence:** high (mechanical), low-impact.

---

## Coverage matrix (iteration 1)

| Operator request / surface | Child | Task(s) | Lane clause | Verdict |
|---|---|---|---|---|
| §4 row 89 (sheets unlike Notion; step-by-step loop) | `076` parent | `spec.md` §5, `plan.md` §4 | rubric, not a lane | covered |
| §4 row 90 (board card fields never wrap) | `012` | T001–T0xx (own) | `styles.css` meta-grid clause | covered |
| §4 row 91 (no bg container for values) | `002` | `### Frame-ruling remediation` | needs T-r2 (C-2) | **partial** |
| §4 row 92 (settings typography/sizing; D8) | `001` | `### Frame-ruling remediation` | needs T-r2 (C-2) | **partial** |
| §4 row 93 (every sheet/dropdown inventoried) | `013`–`017` | Phase A–F, 12–13 tasks each | L-clauses named generically | covered by scaffold; **depth below L3** (iter 2) |
| §4 row 94 (ClickUp boards + mix-and-match sheets) | `018`, `019` | Phase A–F | mid-drag DOM clauses | covered for boards; **sheets uncomposed** (C-1) |
| §4 rows 70–88 | other packets | — | — | covered (C-5) |
| Inventory row 30 (`dropdown-field`) | none | none | none | **gap → `020`** |
| Inventory rows 53 (toast ×2) | `017` | T001 only | none yet | **partial → D2(b) scenario first** |
| Inventory rows `chrome-selection-status-bar`, `chrome-table-load-more` | none | none | none | **excluded, unrecorded** |
| Inventoried surfaces 1–87 otherwise | 19 children | per child | per child | covered or excluded; ledger complete after C-6 |

**Children proposed this iteration:** `020-control-primitives-visual-parity` (C-4). **Children
existing:** 19. **Total after proposal:** 20 — above the ≥ 15 threshold, and every proposed name is
multi-phased.

---

## What was tried and failed this iteration

- **Hypothesis: `016` bundles deprecated surfaces.** The audit's `016` covers
  `calendar-toolbar-renderer.ts`, `calendar-timeline-toolbar-renderer.ts`, `chart-toolbar-renderer.ts`
  and `calendar-mini-calendar-renderer.ts`, and `roadmap.md` rows 77–80 deprecate the calendar,
  timeline and chart *views*. Checked on disk: all four renderer files are **live** under `src/views/`
  and `archive/deprecated-views/` holds only `calendar/`, `chart/`, `timeline/` (the view renderers).
  Hypothesis **disproved** — recorded so a later pass does not re-raise it.
- **Hypothesis: `002`–`012`'s DEFINE tables are simply absent.** Disproved — every child has a §13
  table, one reference column, four columns wide (evidence in C-1). The gap is the *composition*
  column, not the table.
- **Hypothesis: `loop-driver.sh` / `program-loop.sh` exist in the repo and can be reviewed for
  coverage of each node.** `find` across the worktree and the main checkout returns neither script.
  D6 states the drivers live in the orchestrator's scratchpad (`$S`), not the repo, so their absence
  is by design — but it means the graph is reviewable only as the spec table, which is the subject of
  iteration 5.

## Open questions raised this iteration (for the operator)

1. Should `020-control-primitives-visual-parity` land **before** `003`–`011` CREATE (a control fixed
   once) or after the eleven sheets (avoiding a new serialisation point on `styles.css`)? D4's
   sequential rule is written about *sheets*, not about primitives.
2. The nine no-constructed-counterpart fixtures: are the two chips and toast in scope at all, or is
   `chrome-selection-status-bar` / `chrome-table-load-more` genuinely out of the programme? The audit
   needs one answer to close its ledger.
3. Do the operator's C-1..C-6 captures exist outside the repository, and may they be copied into
   `076-sheet-visual-parity/references/` so every DEFINE step opens a real path (C-3)?
