---
title: "Goal: Notion Record Refinement"
description: "The durable directive for refining the record and relation surfaces against the Notion screen digest, and the thresholds that decide when the refinement is done."
trigger_phrases:
  - "065 goal"
  - "notion record refinement goal"
  - "record surface refinement"
  - "empty prompt rollout goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/065-notion-record-refinement"
    last_updated_at: "2026-09-07T01:30:00Z"
    last_updated_by: "implementation-session"
    recent_action: "Legs A-E landed: C1-C6 and C8-C10 all met, 26-lane gate green"
    next_safe_action: "C7 is the operator's device read; nothing else is agent-schedulable"
    blockers: []
    key_files:
      - "src/views/record-surface/property-row.ts"
      - "src/views/record-detail-panel.ts"
      - "src/views/board-renderer.ts"
      - "src/views/column-manager-renderer.ts"
      - "src/views/record-surface/hidden-properties.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-065-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "Empty-fields home: the existing showEmptyFields switch, resolved in the implementing leg"
      - "Hidden group holds view-hidden columns and Notion's full row grammar (operator 19:05)"
      - "Record-level cover is Deferred, not unowned (operator 19:05)"
      - "Add-property entry is Notion's trailing row (operator 19:05)"
      - "Sweep found one gap, S1: the property-visibility list cannot be searched"
      - "Notion's universal Empty refused: A3's format-specific prompts are the landed ruling"
---
# Goal: Notion Record Refinement

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Refine the record and relation surfaces against the Notion screen digest, additively.
Finish the two Anytype rulings whose implementations are half-landed, consume the primitive that was
built and never wired, close the one concrete defect the digest's add-property screen exposed, and
put the surface's remaining Notion questions in front of the operator as rulings rather than as code.

**Why.** `054` took the record surface onto shared primitives. The five-iteration Notion research
loop over the digest found that the digest's strongest corroborations point at work already ruled on
Anytype evidence and not yet landed, not at new Notion features: the empty-prompt rollout never
reached the board card, the desktop label is still a size smaller than its value, and the corrected
option renderer has zero production consumers. Notion's genuinely new contributions are small — one
picker defect and one add-property row — and its larger patterns (hidden-group affordances, a record
cover) are questions for the operator, not tasks.

**Provenance.** `research/research.md` under `054-record-and-relation-surfaces`, the synthesis of one
five-iteration GLM 5.3 flash max lineage over `notion-screens-digest.md`. The digest is the only
source of Notion facts in this packet; no screen was read as an image by the loop or by this packet.

### Decisions

- **D1 — Additive, never overriding.** Under the parent's D15 and `roadmap.md` §7.15, a Notion
  finding that contradicts a landed Anytype ruling becomes a **Proposed** ADR here. It never edits
  the parent and never un-ticks a measured row. Four such conflicts are already settled by landed
  rulings and are recorded Accepted (ADR-001 to ADR-004); four extensions no ruling covers are
  Proposed (ADR-005 to ADR-008).
- **D2 — Red-first or it is not a criterion.** Every non-operator criterion below names a value that
  is observably wrong today, at a `file:line` re-derived against this tree on 2026-09-06. A
  criterion whose red cannot be observed is a claim, not a threshold.
- **D3 — Existing lanes only.** This packet extends `constructed-state-assertions.mjs`,
  `render-assertions.mjs` and `touch-targets.mjs` and adds a constructed scenario. It introduces no
  new lane; a lane that has to be built first is scope for a different packet.
- **D4 — The gated rows are not scheduled.** ADR-005 through ADR-008 are the operator's. Until each
  is taken, its leg carries a threshold and a red-first check and no task row that an agent may
  start. Writing the code first and asking afterwards is the failure this decision prevents.
- **D5 — No cover.** A record-level cover and icon system is out of this packet's scope by
  recommendation, not by omission; ADR-007 records the reasoning and routes the ownership question.
- **D6 — AI stays out**, carried unchanged from `054/goal.md` D6. Notion's AI Autofill chips and the
  cover picker's AI tab are excluded regardless of any other ruling.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

This packet binds the record and property surfaces only:
`src/views/record-surface/*.ts`, `src/views/record-detail-panel.ts`,
`src/views/table-record-peek.ts`, the record and board-card field paths of
`src/views/board-renderer.ts`, the add-property wiring in `src/views/column-manager-renderer.ts`,
the record blocks of `styles.css`, and `src/i18n.ts`'s field-prompt keys.

It does not bind: the page menu (`051`, `052`), the toolbar (`053`), the board's own layout (`056`),
the calendar (`057`), formulas, rollups and calculations (`054` ADR-003), or comments (unowned).
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Ten criteria. Nine are agent-closable against a threshold; C7 is the operator's and is never ticked
by an agent. Each cites the Notion screen ids behind it and the `file:line` that is red today,
re-derived against this tree at `37207535`.

C8, C9 and C10 were opened by the operator's rulings of **2026-09-06 19:05** and did not exist when
this packet was written. C7 keeps its number: ids are stable, so the new rows are appended rather
than inserted.

- [x] **C1 — The word "Empty" is gone from the board card where an editor exists.**
  `getEmptyDisplayValue` delegates to `getPropertyEmptyPrompt`, preserving the
  `multi-select → [prompt]` array shape and the `checkbox → false` case exactly as
  `record-detail-panel.ts:514-519` already does.
  **Threshold:** the board card's empty `select` row reads `t("field.emptySelectPrompt")` =
  "Select option" (`src/i18n.ts:79`), not `t("common.empty")` = "Empty" (`src/i18n.ts:78`).
  **Observed red:** `src/views/board-renderer.ts:754-757` returns `t("common.empty")` for every
  non-checkbox format, the three ruled formats included.
  **Evidence:** Notion renders "Empty" universally [digest screens `16ddd22c`, `bf2171ff`]; A3
  refused it (`054/design-trueup.md` §A3) and `054/goal.md` §3 criterion 2 names board cards
  explicitly.

- [x] **C2 — The prompt covers every format that has an editor, not three.**
  `getPropertyEmptyPrompt` returns a verb+noun prompt for `number`, `date`, `datetime`, `currency`,
  `text` and `files` beside the three it already carries, with the new keys added to both locales.
  **Threshold:** on the record sheet and on the board card, no field with an editor renders the
  string "Empty" in either locale.
  **Observed red:** `src/views/record-surface/property-row.ts:286-291` returns `null` for every
  format but `select`, `multi-select` and `relation`.
  **Evidence:** A3's captured Anytype copy prompts non-option formats too ("Enter number",
  `054/design-trueup.md` §A3). The copy for the other five formats is minted in A3's shape and is
  an inference, recorded as one in `spec.md` §4.

- [x] **C3 — The desktop record-sheet label and its value are the same computed size.**
  The `font-size: var(--font-smaller)` declaration is dropped from the desktop arm of
  `.db-record-detail-field-label`; the phone arm is untouched.
  **Threshold:** in the `constructed-record-detail` scenario, the label's computed `font-size`
  equals the value's computed `font-size`, read as a computed-style assertion in ADR-005's form
  under `054/decision-record.md`.
  **Observed red:** `styles.css:10300-10306` sets the label a step smaller than its inherited value
  size, and the two computed sizes differ in that scenario today.
  **Evidence:** A2 rules hierarchy is colour, not size (`054/design-trueup.md` §A2); Notion agrees
  as an independent third source [digest screens `16ddd22c`, `01cde7f6`, `9867cb76`].
  **Guard:** the phone arm at `styles.css:10459-10468` keeps `--db-font-base` under the iOS 16px
  input-zoom floor, which A2 explicitly does not reopen. The change must not reach it.

- [x] **C4 — Single-select renders as coloured text and multi-select as chips, on both surfaces.**
  The record sheet's and the board card's option branches consume `renderOptionValue` instead of the
  filled-badge path.
  **Threshold:** a single-select value carries a `status-color-text-*` class and no `.status-badge`
  fill; a multi-select value keeps its chips; every option foreground/background pair measures at or
  above 4.5:1.
  **Observed red:** `src/views/record-surface/renderOptionValue` at `property-row.ts:255` has zero
  production consumers — only `property-row.test.ts` calls it — while the live path at
  `property-row.ts:76-101` renders both kinds as filled `.status-badge` chips.
  **Evidence:** A2's C9 ruling (`054/design-trueup.md` §A2). Notion neither supports nor contradicts
  this: no screen in the 97 shows a single-select rendered as bare coloured text.

- [x] **C5 — Typing a name and picking a format produces a named column of that format, in one pass.**
  The add-property picker forwards its query on selection, not only on the create fall-through.
  **Threshold:** typing "Due Date" and selecting `date` yields a `date` column labelled "Due Date";
  the create fall-through's existing behaviour is unchanged.
  **Observed red:** `src/views/column-manager-renderer.ts:200` calls `createProperty(type)` with no
  label, so the column is unnamed; `:201` is the only path that uses the query and it forces `text`.
  The modal handoff already accepts both (`column-manager-renderer.ts:180-181`,
  `src/views/database-view.ts:5088`).
  **Evidence:** Notion carries the name first and types second [digest screen `1589e7c8`]. This
  adapts that insight onto A5's search-first grammar without reordering it (ADR-003).

- [x] **C6 — The record sheet carries an add-property entry.** *(ADR-008, Accepted 2026-09-06
  19:05 — operator, verbatim: "Trailing '+ Add a property' row")*
  A muted trailing row below the last field and above the hidden group opens the existing
  search-first picker through `052`'s picker host per `054` D8.
  **Threshold:** the row renders in that position; activating it opens `buildAddPropertyRow`'s
  picker; the row measures at or above the 44px touch floor on the phone sheet.
  **Observed red:** the record sheet renders no add affordance at all —
  `src/views/record-detail-panel.ts` imports nothing from `add-property-row.ts`, and a grep for
  `buildAddPropertyRow` across the record surface returns zero hits.
  **Evidence:** Notion ends its property list with a plain-text "+ Add a property" row [digest
  screens `16ddd22c`, `bf2171ff`]; Anytype puts a `+` on the section header instead
  (`054/design-trueup.md` §A4). The operator named Notion's placement, which is also the one the
  record sheet can actually take: it has **no section header** for Anytype's `+` to sit on.
  **Sequenced after C8**, so "above the hidden group" means one thing rather than two.

- [ ] **C7 — The operator reads a record on iOS and on desktop and reports the refinement as
  landed.** ADR-005, ADR-006, ADR-007 and ADR-008 were taken on 2026-09-06 19:05, so this row no
  longer waits on a ruling — only on a device. *(operator-owned; never ticked by an agent)*

- [x] **C8 — The record sheet's hidden group holds view-hidden columns, not empty fields.**
  *(ADR-006, Accepted 2026-09-06 19:05 — operator, verbatim: "View-hidden columns, like Notion and
  the peek")*
  The caller passes visible columns only today, so the sheet never sees a view-hidden column at all;
  the population has to reach it before the group can hold it. The peek already computes the
  complement of `visibleKeys` and is the shape to match.
  **Threshold:** a column hidden in view config appears in the sheet's group and is counted there;
  an empty but visible field does not. The assertion reads the group's **membership**, not its
  count — a group holding the same number of the wrong things must fail.
  **Observed red:** the sheet's group holds empty fields
  (`src/views/record-detail-panel.ts:384-393`) while the peek's holds view-hidden columns
  (`src/views/table-record-peek.ts:246-248`), and both render under the same label
  (`src/i18n.ts:569`). Hide a column in view config and it vanishes from the sheet entirely, while
  "Hidden properties (3)" sits beside it counting something else.
  **Evidence:** Notion's "Hidden in `<surface>`" section holds view-hidden columns [digest screens
  `cc8b241a`, `7ffa073f`].
  **Carries an open question, not a block:** where the sheet's *empty-fields* reveal lives once this
  group stops holding them. Owed an ADR before the code lands.

- [x] **C9 — Every hidden-group row carries Notion's full grammar.**
  *(ADR-005, Accepted 2026-09-06 19:05 — operator, verbatim: "Mimic notion also regarding other
  features we might be missing")*
  Drag handle, type icon, name, eye toggle and chevron per row — the anatomy
  `buildCheckboxPropertyRow` already carries (`src/views/record-surface/property-row.ts:330-395`);
  Shown and Hidden sections with a bulk link each; the Hidden section rendered only when non-empty;
  the count staying on the entry row per A4; the title row's eye disabled.
  **Threshold:** toggling the eye shows or hides the field in place without leaving the sheet; the
  group count updates; each section's bulk link acts on its own section; the Hidden section is
  absent while nothing is hidden.
  **Observed red:** zero eye controls inside `db-record-detail-hidden-group`; the group is a single
  disclosure (`src/views/record-surface/hidden-properties.ts:44-73`).
  **Evidence:** three independent captures of the same grammar [digest screens `2f52d1bc`,
  `406e67e2`, `9867cb76`, `cc8b241a`, `01cde7f6`, `7ffa073f`, `794591f5`].
  **Sequenced after C8**, and it moves the table peek with it: `HiddenPropertiesGroupHandle.render`'s
  signature changes and both consumers compile together.

- [x] **C10 — The property-visibility list can be searched.**
  *(the 2026-09-06 19:05 sweep, S1 — the one gap it found that no ADR above already carries)*
  Reuse the picker's own input rather than minting a second one.
  **Threshold:** typing filters the rows to name matches, leaves every row's eye state untouched,
  and clearing restores the full list.
  **Observed red:** zero `input` elements inside the column manager's list — its header carries only
  the select-all toggle (`src/views/column-manager-renderer.ts:222-235`), while the add-property
  picker has the input one file away (`src/views/record-surface/add-property-row.ts:58-60`, `:105`).
  **Evidence:** Notion's visibility sheet opens with a search field [digest screens `9867cb76`,
  `2f52d1bc`, `01cde7f6`].

### What this packet deliberately does not promise

The nine ranked candidates the research produced were not nine criteria when this packet opened.
Three were operator rulings with no agent-closable half until the ruling landed; two of those —
the hidden-group population and its row grammar — **became C8 and C9 on 2026-09-06 19:05**, and the
third, the featured line, still waits on ADR-004's landing. The cover is **Deferred** by ruling
rather than pending (ADR-007). One remains documentation with no threshold: the display-mode
vocabulary (`tasks.md` T008).

The 19:05 sweep added exactly one criterion, C10. What it did **not** add is the more useful half:
three Notion features that read as gaps in the digest's prose dissolve against the code — the
two-destination Properties split, the Deleted-properties tier and the AI-autofill chips. They are
recorded in `decision-record.md` as read-and-not-adopted so nobody re-finds them and builds them.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Opened 2026-09-06 from the Notion research loop

The pipeline the parent's D15 defines ran to completion for this surface: a Sonnet digest of the
Notion captures at `054/notion-screens-digest.md`, then `/deep:research:auto` at five iterations
under `--stop-policy=max-iterations` on GLM 5.3 flash max, then this synthesis. The loop's own
report is `054/research/research.md`; its five iteration narratives and the merged 27-finding
registry are beside it.

**Level 2, standard child.** `recommend-level.sh --loc 420 --files 10 --architectural` reads 59/100
at confidence 92%. The `--architectural` flag is carried because two exported primitive contracts
change if the gated ADRs are taken — `buildDesktopRecordHeader`'s options gain a featured slot and
`HiddenPropertiesGroupHandle.render` gains a per-row affordance host. Without that flag the same
inputs read 39/100 and Level 1, which understates a packet that edits two renderers and a shared
primitive. The phase score is 10/50 against the 25 threshold, so this is a standard child and not a
phase parent.

**Numbered 065** because the parent reserved `059`-`066` for the Notion refinements on 2026-09-06
~16:10 and this surface's number is `065`. `create.sh --phase --parent` allocated `068` from the
tree's high-water mark; the folder and the parent's Phase Documentation Map row were corrected to
`065` in the same pass, as `067` was before it.

### Three of the loop's line citations did not survive the re-derivation

The loop read the tree before `3f4d40ac`, `9207e8e8` and `de67f816` landed. Every load-bearing claim
was re-checked against `37207535` before it became a criterion, and three line ranges moved:
`getEmptyDisplayValue` is at `board-renderer.ts:754-757`, not `:728-732`;
`getPropertyEmptyPrompt` is at `property-row.ts:286-291`, not `:280-284`; and the desktop label rule
is at `styles.css:10300-10306`, not `:10258-10264`. **Every red itself held.** The three landings
that moved them — settings as a right side sheet, the gear before the `···`, and the single-delete
Undo toast — touch no record property row, and none of them closed a red this packet claims.

### What the research found that the digest did not carry

Three findings came from source reads rather than from the Notion screens, and they are the reason
the ranking puts Anytype-ruled work above Notion-originated work:

1. **The A3 rollout's board half never landed.** `054/goal.md` §3 criterion 2 says "record sheet
   **and** board cards"; the board card has carried its own empty-value path all along.
2. **`renderOptionValue` has zero production consumers.** The corrected renderer was written,
   documented and tested, and no file calls it.
3. **The add-property picker drops its query on selection.** A named column of a chosen format is
   impossible in one pass today, even though every layer below the picker forwards the label.

### The two hidden-property populations disagree

One label, `panel.hiddenProperties`, names two different sets. The record sheet's group holds empty
fields (`record-detail-panel.ts:384-393`); the table peek's holds view-hidden columns
(`table-record-peek.ts:246-248`); Notion's "Hidden in `<surface>`" section holds view-hidden columns
[digest screens `cc8b241a`, `7ffa073f`]. A user who hides a column in view config sees it vanish
from the record sheet and sees an unrelated "Hidden properties (3)" counting empties. Neither the
digest nor the true-up carries this. It was ADR-006, and the operator took it on 2026-09-06 19:05.

### Ruled 2026-09-06 19:05, and one ruling widened the packet

Four decisions came back in one sitting, each quoted verbatim in `decision-record.md`:

- **ADR-005**, *"Mimic notion also regarding other features we might be missing"* — Accepted **and
  widened**. The question was a per-row eye and a bulk link; the answer took Notion's whole
  hidden-row grammar, and its second clause commissioned a sweep of everything else Notion's record
  surface carries that ours does not.
- **ADR-006**, *"View-hidden columns, like Notion and the peek"* — Accepted. It settles the
  population above, and it creates the one question this sitting left open: where the sheet's
  *empty-fields* reveal lives afterwards.
- **ADR-007** — **Deferred**. The record-level cover and icon stay unowned by decision rather than by
  oversight, which is a different thing to record.
- **ADR-008**, *"Trailing '+ Add a property' row"* — Accepted, unchanged from the recommendation.

**The sweep found one gap, not seven, and that is its useful half.** S1 — the property-visibility
list cannot be searched while Notion's can — became C10. Three candidates that read as gaps in the
digest's prose dissolved against the code: we merge Notion's two Properties destinations onto one
row that carries *more* affordances than Notion's, our property delete already pairs a confirm with
an undo entry where Notion has a trash tier, and the AI chips were excluded by `054` D6 before any
of this. Those are recorded as read-and-not-adopted rather than dropped, so the next sweep does not
re-find them. Three more are real and owned elsewhere — the comments zone (`023`/`051`), the
display-mode *setting* as against its vocabulary (`006`), and the page "···" menu (`051`/`052`).
<!-- /ANCHOR:log -->
