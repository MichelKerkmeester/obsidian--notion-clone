---
title: "Goal: Record and Relation Surfaces"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "054 goal"
  - "record surface goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/054-record-and-relation-surfaces"
    last_updated_at: "2026-09-06T00:00:00Z"
    last_updated_by: "implementer-leg"
    recent_action: "D3's observable amended to a source census by operator ruling"
    next_safe_action: "Close the remaining acceptance criteria now that D3 has a readable observable"
    blockers:
      - "T070/T071 remain: T070 waits on a D3 observable ruling; T071 needs one line in 044's sheet-grammar predicate, measured green and reverted as out of scope"
      - "OPS-001..003 are the operator's; nothing here can close them"
    key_files:
      - "src/views/cell-renderer.ts"
      - "src/views/record-surface/cell-editor-option.ts"
      - "src/views/record-surface/cell-editor-relation.ts"
      - "src/views/record-surface/cell-editor-shared.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-054-goal"
      parent_session_id: null
    completion_pct: 55
    open_questions:
      - "Does the record sheet's desktop anchored panel keep its current DOM under the P1 primitive?"
      - "Does P3's search-first picker sit beside or replace S3's quick-add file-field row?"
      - "Does a board card gain the add-property affordance, or is a card summary the wrong place?"
    answered_questions:
      - "The three questions above were answered at T001 (design-trueup.md §5, migration-table.md §4): yes with 006 owning placement; beside; the prompt not a button — this frontmatter's own open_questions list was not updated when T001 closed, left as found rather than silently corrected"
      - "The operator's 2026-09-05 directive names componentization and Anytype adoption together"
      - "Formulas, rollups and calculations stay ours (ADR-003); the PM 1:1 board and gantt stay ours"
---
# Goal: Record and Relation Surfaces

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Reduce the record/object surfaces and property editing to one set of shared
primitives — header, property row, add affordance, hidden-properties group, type picker, note-body
region, and one inline-editor primitive per column type — consumed by the record sheet, the table
record peek, the properties panel, the board-card properties panel, the property modals and every
cell editor; and take the Anytype object-page and relation-panel behaviours the captures show are
better.

**Why.** The operator's 2026-09-05 directive: *"research recommendations and how to tackle / update
/ improve every modal, sheet and general ui ux to take the best from AnyType and componentize stuff
as much as possible."* `050` lands the view-level half of that sentence; this packet is the
record/object half. Today one property is built three ways, one header four ways, one type list
three ways, and every editor is a private method of a 3,152-line class no check can mount.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Captures before design rows.** Every §5B behaviour is trued against its named Anytype capture — opened and read by hand — before the primitive that adopts it is written. A capture that cannot be opened is a named gap, never a guess. |
| D2 | **Red first, per threshold.** Every AC carries one number measured failing on the current tree (the 4/3/3 vocabularies, the missing group, the "Empty" word, zero exported editors) and recorded in `checklist.md` before the fix. An item that arrives green has not been proven. |
| D3 | **Componentize is the deliverable, not a side effect.** The census must read 1/1/1 — one header builder, one property-row vocabulary, one type list — by the census lane, with bypass negative controls seen red. A "shared" primitive one consumer imports through a shim while another keeps its copy is not done. **Amended by ADR-007 (operator ruling, 2026-09-06 ~05:25 CEST, verbatim: _"Source census of builder calls"_):** "the census lane" reads a *source* census — which function built the header or row, from the consumer's own source — not a DOM class census. `buildPropertyRow`/`buildDesktopRecordHeader` take their class names from their caller by design, so a DOM census of rendered classes reads 4 for a convergence that is real; a source census reads what the caller-supplied-class design hides. |
| D4 | **Editors are extracted, never rewritten.** ADR-002: method bodies move unchanged behind `CellRenderer.startEdit`'s pinned contract, one editor per leg, no behavioural edit inside a move. The accumulated defect fixes in those bodies (Escape funnels, IME guards, session close routing) are re-earned one operator report at a time and are not thrown away. |
| D5 | **What stays ours stays ours.** Formulas, rollups and calculations (ADR-003); the table; the bottom sheets' ownership (`003`/`016`/`031`); the Project Manager 1:1 board and gantt (`037`/`038` parity); `023`'s editable note body; `045`'s card-hiding mechanism; `006`'s open-target resolver. A change to any of them is outside this packet. |
| D6 | **Anytype is a design source, not a data model.** `050`'s D6 non-adoptions carry over: no Objects/Types/Queries, no sidebar widgets, no full template system, no dynamic filter values. |
| D7 | **One leg, one file group.** The switching legs each touch one consumer group; `styles.css` is the exception, serialized by the parent's CSS lane. The board reference captures are re-read after any leg that changes what a card draws. |
| D8 | **One owner per surface, across the five family phases.** **Cell inline editors are this phase's** — one per column type, extracted behind `CellRenderer.startEdit` (ADR-002). The **confirm primitive is `051`'s** and every destructive path here consumes it. The **shell** a record sheet or a property modal presents in is `051`'s; this phase changes the *body*, never the chrome decision. The **condition row is `053`'s**. The **menu row builder and picker host are `052`'s**; P3's picker consumes them. `048`'s stacking model is a constraint and is not re-specified here — this phase changes *which code builds an editor*, never *how it stacks*. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase; OPS-001..003 are the operator's. |

<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the phase's own documents before acting:** `spec.md` §5A (the ten-surface inventory) and
§5B (the seven Anytype behaviours) are the inventory this packet exists to change;
`migration-table.md` (created by T003) is the per-surface plan of record.

`roadmap.md` §5.A maps the program's phases; `spec.md` §5C maps the 050 overlaps.

**Precedence.** The parent's decisions outrank this packet's, which outrank any summary. Name
conflicts; never resolve them silently.

**Stop.** Only the criteria below decide done.

<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] The census reads **1** header builder, **1** property-row vocabulary and **1** property-type
      list across the family, read by the census lane — one page rendering the same column through
      every consumer — never by grep. Red first: the counts today are **4 / 3 / 3**, measured by
      T002 and recorded in `checklist.md` C1-C3. The lane's negative controls (bypass the primitive
      in one consumer; reintroduce a second builder) were observed red before the counts closed.
- [ ] The record sheet renders a hidden-properties group with a count whose expanded state survives
      a field-commit refresh, and empty relation/select/multi-select rows render an add affordance
      opening the occupied row's editor — on the record sheet and board cards, with the word
      "Empty" gone where an editor exists. Red first: no group exists today
      (`record-detail-panel.ts:387-396` filters empties wholesale) and `getEmptyDisplayValue`
      (`record-detail-panel.ts:636`) renders the placeholder word. The negative control (restore the word, remove the
      group) was observed red.
- [ ] One exported editor primitive per column type exists behind `CellRenderer.startEdit`, the
      pinned dispatch test is green, and the option and relation editors mount standalone in a lane
      — the first check in this family that can hold an editor without constructing the 3,152-line
      class. Red first: **0** exported primitives exist today; the pinned test fails on their
      absence before the extraction starts (ADR-002's designed red).
- [x] `migration-table.md` exists with one row per §5A surface (10) and one per §5B behaviour (7),
      every named capture filename resolving under `screenshots/anytype/`, every behaviour row
      carrying T001's image-true-up disposition (adopted / adapted / rejected-with-reason), and
      every surface row marking what stays ours. Red first: the file did not exist, so the counts
      were **0** surface rows and **0** behaviour rows — observed red before the fix.
      **Closed 2026-09-05, re-checked independently at landing:** 10 surface rows `S1`-`S10`, 7
      behaviour rows `A1`-`A7`, and all 12 cited capture basenames resolve under
      `screenshots/anytype/`.
- [ ] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all pass with exit statuses read
      (the repo's three verification gates); `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0 with
      one permanent lane row per primitive, each negative control observed red then green; `npm run
      replay` holds with reversed 0; `npm run screenshots:verify` exits 0 with every changed capture
      opened and read by a person.
- [x] The board-card reference captures are `pixelHash`-identical to their pre-L3 baseline, or the
      difference carries an operator ruling — read before any L3 close (D7).
      **Red first, on this row's own observable.** Every `screenshots/**` PNG present at the
      baseline whose path names a board, gallery, list, table, calendar, timeline, gantt or
      project-manager surface — **394 files** — was decoded and compared by `pixelHash` against the
      landed tree. Measured against baseline `932fa3a9` this read **1 of 394 not identical**:
      `chrome-board-extensions-selection-desktop-light`. It was traced rather than waved through,
      and it was not this leg's — recapturing that scenario against `origin/main`'s own stylesheet
      produced the identical render to ours, and both differed from the committed capture, because
      main's `ad0ba88d` edited `board-renderer.ts`, a declared source of the scenario, after
      `3387b10f` had already recaptured. It reproduced across three runs, so it was not raster
      jitter.
      **Closed 2026-09-06 against baseline `7cbed3c1`: 0 of 394 moved**, main's own `47f0aab8`
      having refreshed the capture it had left stale. The 12 captures this leg does move are all
      record-detail and record-peek panels, which is the whole reach of a change scoped to
      `.db-record-detail-field` and `.db-record-peek-field-value` ancestors. The compare is over
      decoded pixels, not file bytes, so encoder jitter can neither read as a difference nor hide
      one.
- [ ] **The operator opens a record on iOS and desktop and reads it as one object page against the
      Anytype object page; reports no surface where a property looks or edits differently from the
      same property elsewhere; and confirms formulas, rollups and aggregations behave exactly as
      before.** Only the operator closes this. Nothing in this repository can.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

- **2026-09-06 — L6 landed on `main` after an independent verification pass.** The extraction was
  re-proved rather than accepted: a normalised multiset diff of the pre- and post-extraction sources
  leaves only `private x(` → `function x(` and `this.activeX = y` → `ctx.setActiveX(y)` plumbing, the
  `db-` class vocabulary is identical at 91 tokens in and out, and `styles.css` is untouched — so no
  capture should have moved, and after a full 558-capture recapture none did. All three surfaces were
  traced to one entry point: the table (`database-view.ts:805`, `:1907`, `:7414`), the board card
  (`board-renderer.ts:1718`, `:1729`, `:2207`) and the record sheet (`record-detail-panel.ts:465` →
  `database-view.ts:11653`) every one reach `CellRenderer.startEdit` and thence the extracted module;
  the record sheet keeps no editor path of its own, and the read-only embedded panel's `editCell` is
  a documented no-op. **Three things the leg's report claimed that did not hold, each fixed or
  corrected:** the pinned dispatch test stayed green when the whole select/status branch was deleted
  from `startEdit` (it matched the needle anywhere in the file) and now slices `startEdit`'s own body,
  checks the module's declared export and checks the class reaches it, with three negative controls
  seen red; the four cell-editor capture scenarios still fingerprinted only `cell-renderer.ts`, so the
  new modules were untracked and `screenshots:verify` would have stayed quiet on a change to them —
  the scenarios now name the modules and the regenerated manifest carries their hashes; and T071's
  "needs a `styles.css` change" is wrong — `.db-column-manager-row` already carries `padding: 2px 4px`
  and one line in `sheet-grammar.ts:99` takes the surface to 8/8 with the whole lane at exit 0,
  measured then reverted because `spec.md` §3 freezes that predicate as `044`'s. `cell-renderer.ts` is
  **1,217** lines, not the 1,212 the leg reported. `npx tsc --noEmit`, `npx vitest run` (1437/1437
  across 134 files), `npm run build`, `node tools/screenshots/verify.mjs`, `node tools/lane/check-lane.mjs`
  and `npm run gate` (26 green, 0 red) all exit 0 on the rebased tree.

- **2026-09-06 — L6 editor extraction landed (T060-T064); L7 attempted, two gaps named rather than
  fixed blind.** All ten module-backed column types now resolve to an exported module under
  `src/views/record-surface/` (`cell-editor-option.ts`, `cell-editor-relation.ts`,
  `cell-editor-date.ts`, `cell-editor-text.ts`, `cell-editor-number.ts`, plus the shared
  `cell-editor-shared.ts`), each moved unchanged from its `CellRenderer` private method per ADR-002
  — `cell-renderer.ts` fell from 3,152 to 1,217 lines. `cell-editor-contract.test.ts`'s pinned
  dispatch test, red by design before this leg, is green with an empty `missing` list.
  **T064 verified rather than newly coded**: the `record select value menu`/`record relation
  editor` stacked-pair rows `tools/live/sheet-grammar.mjs` already carried stay green after the
  extraction, confirming `048`'s stacking contract held. **T070 stays open**: its four named
  retirements were already complete from earlier legs (confirmed by source read), but its own proof
  clause — "the census lane reads 1/1/1" — names infrastructure T011/T023 never built, so the row
  cannot close on this evidence alone. **T071 surfaced a real defect and was reverted rather than
  forced green**: registering `column-manager` into `sheet-grammar.mjs`'s full grammar check
  produced an observed red (`rows: false`) because `column-manager-renderer.ts`'s row class predates
  the shared grammar's selector — fixing it needs a `styles.css` change and a recapture cycle outside
  this leg's file group, so the registry addition was reverted and the gap named for whoever owns
  that file next. `npx tsc --noEmit`, `npx vitest run` (1392/1392 across 128 files) and `npm run
  build` all pass; `npm run gate` is 26 green, 0 red; a full `npm run screenshots` moved 0 of 558
  entries' pixels.
- **2026-09-05 — landed in-runtime.** Reviewed against the parent's D1-D14, `050`'s
  `design-trueup.md` and the current tree, then copied from
  `worktrees/083-phase-record-relation-surfaces` into `worktrees/086-land-phases-051-055`.
  **Raised to Level 3** on judgment over the script's Level 2 — the same call the four sibling
  packets made, and the tie-breaker is ADR-002's extraction out of a 3,152-line class no check can
  mount. `tasks.md`'s seven legs are grouped under four phases so the level's own content metric is
  satisfied; the `L1`-`L7` leg vocabulary the packet is written in is unchanged. **Corrected:** §5B's
  evidence preamble and row A5 against the true-up, plus five drifted `file:line` citations —
  `getEmptyDisplayValue` (`:424-427` → `record-detail-panel.ts:636`), the record sheet's empty filter
  (`:393-396` → `:387-396`), `column-manager-renderer.ts`'s header branch (`:214-224` → `:180`),
  `getSheetTitle` (`db-modal.ts:90-94` → `:83-88`) and `editOptionPopover` (`:1123` → `:1106`).
  **Spot-checked and confirmed exact:** `cell-renderer.ts:644` `startEdit`, its 3,152 lines,
  `editRelationPopover :899`, `editDatePopover :1787`, `editTextPopover :2353`, `renderCardField :455`,
  `db-record-detail-fields :390`, `mountNoteBodyRegion` mounted at `record-detail-panel.ts:295`, and
  all four cited Anytype capture filenames. D8 was added to record the one-owner split.
- **2026-09-05 — packet authored.** Level 2 (script: 50/100, confidence 90%, at `--loc 1800 --files
  14`; phase score 10/50 → standard child). Inventory read from source at authoring time; the three
  spec open questions are recorded in `spec.md` §10 and resolve at T001. `create.sh --phase` was
  tried and produced three wrongly-named placeholder folders plus a parent `spec.md` edit outside
  this packet's write scope; both were reverted and the 050-structure fallback documented in the
  dispatch was used instead. The image reader available to the authoring pass could not open PNG
  files, so §5B stands on the capture index's descriptions pending T001 — recorded here and in
  `checklist.md`'s protocol rather than hidden.

### 2026-09-06 amendment: a reserved Notion-refinement child, `065-notion-record-refinement`

The operator, ~16:10, verbatim: *"Based on notion screenshots add phases to all ui improvement phases
to further refine based on notion ui screenshots. But do 5 iters of deep research with glm 5.3 flash
max on those screens per relevant phase."* This packet's surface is **the record and relation surfaces**, and its reserved
child is **`065-notion-record-refinement`** — reserved, not created. **Wave 2: queued behind wave 1.** The child is shared with `058-card-title-and-title-formats`, which holds the title half of the same surfaces, so one loop covers the record page, its property rows and the card/record title rather than two loops reading the same screens. The pipeline is three stages and the first exists for one reason: a **Sonnet digest** of the relevant Notion captures is written to ``054-record-and-relation-surfaces/notion-screens-digest.md``, because **GLM 5.3 flash cannot read images** and a capture reaches the loop as measured prose or not at all. Then `/deep:research:auto`, **5 iterations**, `--stop-policy=max-iterations`, on **GLM 5.3 flash max** — `openrouter/z-ai/glm-5.3-flash` first and `llmgateway` (DevPass) as the fallback, on the operator's ~16:25 ruling *"use openrouter untill usage is 0 then devpass"*. Then an **Opus synthesis** opens the child; a fresh Opus verifier lands it (D4). **Do not create the child by hand** — a folder without the loop behind it claims evidence it does not have. **The refinement is additive.** The child may add a criterion, a task, an ADR or a measurement. It may not un-tick a measured row here, rewrite a landed ruling, or change this packet's parity target. Where a Notion finding contradicts a landed Anytype ruling, the child writes a **Proposed** ADR carrying both readings and stops; only the operator moves it to Accepted. Parent `goal.md` **D15** and `../roadmap.md` **§7.15** carry the rule, §5.A the reservation, §6A the instruction verbatim.

<!-- /ANCHOR:log -->
