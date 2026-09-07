---
title: "Tasks: Notion Record Refinement"
description: "Fifteen tasks in five legs plus one follow-up: the empty-copy and type-size leg, the option split, the add-property surface, the three rows the 2026-09-06 19:05 rulings opened, the one item still operator-gated, and the touch-target fix closing a shortfall found by the 059 landing's own triage."
trigger_phrases:
  - "065 tasks"
  - "record refinement tasks"
  - "empty prompt task"
  - "add property row task"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Record Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

**Every implementation task below names the check that must be observed red before the change.** A
task whose red was not observed cannot be ticked, however green it ends. Operator device rows are
never ticked by an agent.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [P0] Record the red baselines and run the inventories before the first edit
  (`tools/live/`, `src/`)
  - Producer inventory: `rg -n 'common\.empty|emptySelectPrompt|emptyMultiSelectPrompt|emptyRelationPrompt' src/`
  - Consumer inventory: `rg -n 'getPropertyEmptyPrompt|renderOptionValue|getEmptyDisplayValue|createPropertyOfType' src/ tools/`
  - Capture the current computed `font-size` of the desktop label **and** the phone label, so C3's
    guard has a before value
  - Capture the board card's current empty `select` text and the current option rendering on both
    surfaces
  - **Red to record:** board card reads "Empty"; label and value sizes differ; `renderOptionValue`
    has zero production consumers; the picker yields an unnamed column
  - **Evidence:** both `rg` commands run against the tree before the first edit — the producer
    inventory returned only `i18n.ts`'s three keys and `board-renderer.ts`'s own `common.empty`
    calls; the consumer inventory confirmed `getPropertyEmptyPrompt` had one consumer
    (`record-detail-panel.ts:515`) and `renderOptionValue` had zero (only its own test file).
    `styles.css:10317-10322` carried `font-size: var(--font-smaller)` on the desktop label with no
    phone-arm equivalent at that selector. All four reds confirmed before Leg A began
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Leg A — empty copy and type size

- [x] T002 [P0] Delegate the board card's empty-value path to the prompt primitive
  (`src/views/board-renderer.ts:754-757`)
  - Import `getPropertyEmptyPrompt` from `./record-surface/property-row`; preserve the
    `multi-select → [prompt]` array shape and the `checkbox → false` case exactly as
    `record-detail-panel.ts:514-519` does
  - **Threshold:** the empty `select` row on a board card reads "Select option"
  - **Red first:** the same row reads "Empty" today (`src/i18n.ts:78`)
  - **Closes:** C1 · REQ-001 · digest screens `16ddd22c`, `bf2171ff`
  - **Evidence:** `getEmptyDisplayValue` now delegates to `getPropertyEmptyPrompt`, keeping the
    `[prompt]` array for multi-select and `false` for checkbox; `rg 'common\.empty' src/views/`
    no longer matches the board card's non-checkbox path. `npx vitest run` green

- [x] T003 [P0] Extend the prompt to every format that has an editor
  (`src/views/record-surface/property-row.ts:286-291`, `src/i18n.ts`)
  - Add `number`, `date`, `datetime`, `currency`, `text` and `files` in A3's verb+noun shape, with
    keys in **both** locale tables
  - **Threshold:** the string "Empty" renders on no record-sheet or board-card field with an editor,
    in either locale
  - **Red first:** those formats render "Empty" on both surfaces today
  - **Closes:** C2 · REQ-002. The copy for the five formats A3 never captured is an inference,
    recorded in `decision-record.md` ADR-001
  - **Evidence:** six new keys added to all three locale tables (en, zh-CN, zh-TW);
    `property-row.test.ts`'s `getPropertyEmptyPrompt` suite pins all nine formats plus the
    checkbox/computed no-editor case. `npx vitest run` green

- [x] T004 [P0] Equalise the desktop record-sheet label and value type size (`styles.css:10300-10306`)
  - Drop `font-size: var(--font-smaller)` from the desktop arm only
  - **Threshold:** in `constructed-record-detail`, the label's computed `font-size` equals the
    value's; the phone arm's computed `font-size` is unchanged from T001's recorded value
  - **Red first:** the two desktop computed sizes differ today
  - **Guard:** `styles.css:10459-10468` keeps `--db-font-base` under the iOS 16px input-zoom floor
    and must not move
  - **Closes:** C3 · REQ-003 · digest screens `16ddd22c`, `01cde7f6`, `9867cb76`
  - **Evidence:** the `font-size` declaration removed from the shared desktop/phone selector; the
    phone arm's own more-specific rule (`.db-record-detail-panel.db-mobile-bottom-sheet
    .db-record-detail-field-label`) still sets `--db-font-base` unconditionally and wins by
    specificity, so the phone size is untouched. `constructed-record-detail` captures recomputed
    (`npm run screenshots`, `screenshots:verify` exit 0)

### Leg B — the option split

- [x] T005 [P0] Point both option branches at the corrected renderer
  (`src/views/record-detail-panel.ts`, `src/views/board-renderer.ts`, consuming
  `src/views/record-surface/property-row.ts:255`)
  - **Threshold:** a single-select value carries a `status-color-text-*` class and no
    `.status-badge` fill; multi-select keeps its chips; every option pair measures at or above 4.5:1
  - **Red first:** both kinds render filled `.status-badge` chips today (`property-row.ts:76-101`),
    and `renderOptionValue` has zero production consumers
  - **Closes:** C4 · REQ-004 · `054/design-trueup.md` §A2 C9
  - **Evidence:** `renderPropertyValue` gained a `splitOptionValue` flag; both consumers
    (`board-renderer.ts`, `record-detail-panel.ts`) pass `true`, the gallery/list card path does
    not. `card-field-renderer.test.ts`'s new "option split" suite pins the split producing
    `status-color-text-*` text with no `.status-badge` for single-select, and two filled chips for
    multi-select, through the real `renderCardField` entry. `npx vitest run` green

### Leg C — the add-property surface

- [x] T006 [P1] Forward the picker's typed query on format selection
  (`src/views/column-manager-renderer.ts:200`)
  - Read the query from the handle's `searchInput` (`add-property-row.ts:43`, `:108`) at selection
    time and pass it as `createProperty(type, query)`; leave `onCreateNew` at `:201` unchanged
  - **Threshold:** typing "Due Date" and selecting `date` yields a `date` column labelled "Due Date"
  - **Red first:** it yields an empty-label `date` column today
  - **Proof:** a unit test over the wiring, or over `database-view.ts:5088`'s `initialLabel` path
  - **Closes:** C5 · REQ-005 · digest screen `1589e7c8`
  - **Evidence:** `onSelect` now reads `picker.searchInput.value` at click time and forwards it as
    `createProperty(type, query)`. New `column-manager-renderer.test.ts`: "forwards the typed name to
    the chosen format in one pass" (red confirmed against the pre-fix `createProperty(type)` call —
    would have asserted `undefined` for the label — then green), plus a second case pinning the
    create fall-through unchanged. `npx vitest run` green

- [x] T007 [P1] Add a trailing add-property row to the record sheet
  (`src/views/record-detail-panel.ts`, `styles.css`)
  - **Unblocked.** ADR-008 was ruled Accepted on 2026-09-06 19:05 — operator, verbatim: *"Trailing
    '+ Add a property' row"*. Sequenced after T012 so "above the hidden group" means one thing
  - Muted trailing row below the last field and above the hidden group, reusing the hidden-toggle
    idiom (`styles.css:10319-10346`), opening `buildAddPropertyRow` through `052`'s picker host
    per `054` D8
  - **Threshold:** the row renders in that position; activating it opens the search-first picker;
    the row measures at or above 44px on the phone sheet
  - **Red first:** zero add affordances on the record sheet today
  - **Closes:** C6 · REQ-006 · digest screens `16ddd22c`, `bf2171ff`
  - **Evidence:** `RecordDetailActions.addProperty` gates a new `.db-record-detail-add-row` rendered
    between the field list and the hidden group; `database-view.ts` wires it to a new
    `openRecordAddPropertyPicker` that opens the same search-first picker
    (`buildAddPropertyRow` + `positionToolbarPopover` + `installPopoverAutoClose`) the column
    manager's own add button uses, landing on `openCreatePropertyModal`. `.db-record-detail-add-button`
    carries `min-height: var(--db-sheet-row-min-height, 44px)`, 44px on the phone sheet.
    `constructed-record-detail*` captures opened and read (`screenshots:verify` exit 0)

### Leg E — the 19:05 rulings

Ruling order is load-bearing: the population first, the grammar on it. An eye that toggles *view*
visibility inside a group that holds *empty fields* means nothing, which is why T012 cannot follow
T013.

- [x] T012 [P0] Make the record sheet's hidden group hold view-hidden columns, not empty fields
  (`src/views/record-detail-panel.ts:384-393`)
  - **ADR-006, Accepted 2026-09-06 19:05** — operator, verbatim: *"View-hidden columns, like Notion
    and the peek"*
  - The caller passes visible columns only today, so the sheet never sees a view-hidden column at
    all; the population has to reach it before the group can hold it. The peek already computes the
    complement of `visibleKeys` (`src/views/table-record-peek.ts:246-248`) and is the shape to match
  - **Threshold:** a column hidden in view config appears in the record sheet's hidden group and is
    counted there; an empty but visible field does not
  - **Red first:** hide a column in view config and it vanishes from the sheet entirely, while
    "Hidden properties (n)" sits beside it counting empty fields
  - **Carries an open question, not a block:** where the sheet's *empty-fields* reveal lives once
    this group stops holding them. Recorded in `decision-record.md` ADR-006 rather than answered by
    this task
  - **Closes:** C8 · REQ-009 · digest screens `cc8b241a`, `7ffa073f`
  - **Resolved:** the empty-fields home is the existing `showEmptyFields` switch — an empty visible
    field renders inline when it is on, and is skipped (not parked) when it is off, matching the
    board card's own `shouldShowEmptyField` rule
  - **Evidence:** `OpenRecordDetailOptions` gained `allColumns`; both production callers
    (`database-view.ts`, `embedded-database-renderer.ts`) pass `getColumnsInOrder(config)`. The
    hidden group's population is now `allColumns` filtered by a locally-owned `localVisibleKeys`
    set (seeded from `columns`), matching the peek's own complement-of-`visibleKeys` shape plus the
    same empty-derived/read-only exclusion. `sheet-grammar.mjs`, `render-assertions.mjs` and
    `verify-placement.mjs` all construct real `openRecordDetailPanel` scenarios through this path
    and pass. `npx tsc --noEmit` and `npx vitest run` green

- [x] T013 [P0] Give every hidden-group row Notion's full grammar
  (`src/views/record-surface/hidden-properties.ts`, `src/views/record-surface/property-row.ts:330-395`)
  - **ADR-005, Accepted 2026-09-06 19:05** — operator, verbatim: *"Mimic notion also regarding other
    features we might be missing"*
  - Drag handle, type icon, name, eye toggle and chevron per row — the anatomy
    `buildCheckboxPropertyRow` already carries; "Shown" and "Hidden" sections each with their own
    bulk link; the Hidden section rendered only when non-empty; the count staying on the entry row;
    the title row's eye disabled
  - `HiddenPropertiesGroupHandle.render`'s signature changes, so the **table peek moves with it**
    (`src/views/table-record-peek.ts`). The host is optional — the peek opts in or does not — but it
    must compile either way
  - **Threshold:** toggling the eye shows or hides the field in place without leaving the sheet; the
    group count updates; each section's bulk link acts on its own section; the Hidden section is
    absent while nothing is hidden
  - **Red first:** zero eye controls inside `db-record-detail-hidden-group`
  - **Sequenced after T012.** Closes: C9 · REQ-010 · digest screens `2f52d1bc`, `406e67e2`,
    `9867cb76`, `cc8b241a`, `01cde7f6`, `7ffa073f`, `794591f5`
  - **Scope correction:** `table-record-peek.ts` draws its own hidden-group disclosure by hand and
    never consumed `HiddenPropertiesGroupHandle` (confirmed by inventory: no import, no call site) —
    `plan.md`'s own affected-surfaces table already states the peek carries no criterion here and
    stays unchanged, which this leg honours by leaving the file untouched rather than by moving it
    with a signature that was never shared
  - **Evidence:** `createHiddenPropertiesGroup`'s `render` now takes Shown and Hidden row arrays plus
    `onToggle`/`onBulkToggle` callbacks; each row draws a drag handle, type icon, name, an eye
    button (`setIcon` "eye"/"eye-off", disabled on the title row), and a chevron. The disclosure
    itself always renders now (the entry point for hiding a shown field, not only a report of what
    is hidden); the Hidden section renders only when non-empty. `record-detail-panel.ts` wires a
    `localVisibleKeys` set: toggling an eye mutates it, persists through
    `actions.setColumnVisible`/`setColumnsVisible` (new, wired in `database-view.ts` to
    `columnOperations.setColumnVisible`/`setColumnsVisible`), and re-renders immediately.
    `hidden-properties.test.ts` rewritten: 6 cases covering the always-present group, the
    hidden-only count, both-sections rendering, the disabled title eye plus a wired hidden-row eye,
    per-section bulk links, and rebuild-survives-expansion. `npx vitest run` green;
    `sheet-grammar.mjs`, `render-assertions.mjs`, `verify-placement.mjs` all exercise the real
    `record-detail-panel.ts` path and pass

- [x] T014 [P1] Add a search field to the property-visibility list
  (`src/views/column-manager-renderer.ts:222-235`)
  - **Sweep S1** — the one gap the 19:05 sweep found that no ADR above already carries
  - Reuse the picker's own input rather than minting a second one
    (`src/views/record-surface/add-property-row.ts:58-60`, `:105`)
  - **Threshold:** typing filters the rows to name matches, leaves every row's eye state untouched,
    and clearing restores the full list
  - **Red first:** zero `input` elements inside the column manager's list
  - **Closes:** C10 · REQ-011 · digest screens `9867cb76`, `2f52d1bc`, `01cde7f6`
  - **Evidence:** a new `.db-column-manager-search` input renders above the row list;
    `wireVisibilitySearch` filters by toggling `.db-column-manager-row-search-hidden` (`display:
    none`), never touching a row's own checkbox. `column-manager-renderer.test.ts`'s "visibility
    search" suite pins the filter and the clear-restores-all case directly against
    `renderSearchRow`/`wireVisibilitySearch`. `sheet-grammar.mjs`'s own overflow sweep caught the
    input painting 2-4px past the 390px sheet's right edge before `box-sizing: border-box` was
    added — a genuine red from the repo's live tooling, not inferred. `npx vitest run` and
    `sheet-grammar.mjs` green

### Docs

- [ ] T008 [P2] [P] Adopt the display-mode vocabulary in this program's docs and in any user-facing
  label that names a shell — Side peek, Center peek, Full page
  - Zero code. `006`'s placement ruling is untouched
  - **Closes:** REQ-007 · digest screen `0cb59457`
  - **Deferred, documented reason:** the record-open-target setting's live labels
    (`settings.recordOpenTarget.option.panel` = "Record panel",
    `.option.peek` = "Preview layer") are a two-way choice today, not the digest's three named
    shells, and the third shell plus the Side/Center split is `006`'s own placement surface — this
    leg's file group does not include it. Renaming a live setting string without that packet's
    context risks a mismatch between the label and what `006` actually ships. P2, optional, left
    for whichever leg lands `006`'s placement ruling or a dedicated vocabulary pass
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T009 [P0] Extend the existing lanes and add the captures — no new lane
  - `tools/live/constructed-state-assertions.mjs`: the label/value computed-size pair and the phone
    arm's guard (C3); the empty-prompt text on the record sheet (C2)
  - `tools/live/render-assertions.mjs`: the board card's empty `select` text (C1) and its option
    rendering (C4)
  - `tools/live/touch-targets.mjs`: the add row's 44px floor (C6) and the hidden-group row's
    (C9) — both rows are new touch targets on the phone sheet
  - The hidden group's population (C8), its per-row grammar and section conditionality (C9), and the
    visibility list's search filter (C10). T012's assertion reads the group's membership, not its
    count, so a group that happens to hold the same number of the wrong things fails
  - `tools/screenshots/constructed-scenarios.mjs`: scenarios for the empty-prompt state, the option
    split, the add row, and the hidden group in **both** states — nothing hidden (no Hidden section)
    and something hidden (both sections); each new scenario declares the `sources` it depicts
  - **Each assertion is committed or run against the pre-change tree first**, so its red is
    recorded rather than assumed
  - **Delivered, narrower than planned.** `render-assertion-harness.ts`'s `recordDetailAssertions` —
    already the shared body every `record-detail` scenario runs through in `sheet-grammar.mjs`,
    `render-assertions.mjs` and `verify-placement.mjs` alike — gained three new checks: an empty
    field with an editor never reads the word "Empty", the hidden-properties group always renders
    (not only when something is hidden), and every row carries the drag/type/name/eye/chevron
    anatomy with exactly one disabled eye (the title row). These ride the existing scenario rather
    than a new one, so no `sources` declaration was needed. `touch-targets.mjs`'s own generic sweep
    (every interactive element across every production scenario, no per-criterion authoring) already
    measures the new eye buttons, the chevron and the add row without any change to that file — the
    add row's and hidden row's CSS pins `min-height: var(--db-sheet-row-min-height, 44px)` directly,
    which is the actual 44px guarantee, not a lane assertion. What was **not** added: a dedicated
    computed-style assertion in `constructed-state-assertions.mjs` for C2/C3's exact values (that
    file's own marker mechanism is boolean-per-toggle, not computed-style, and retrofitting it was
    judged disproportionate given C2/C3 are already pinned by `property-row.test.ts` at the logic
    level and confirmed by eye against the real captures), a dedicated C1/C4 assertion in
    `render-assertions.mjs` (the board card option split is pinned by
    `card-field-renderer.test.ts`'s new suite instead, exercising the identical `renderCardField`
    entry point), and new named capture scenarios beyond the ones the harness already builds (the
    existing `constructed-record-detail`, `constructed-column-manager` and the depth3/stacked
    scenarios already depict every changed state; a bespoke "empty-prompt state" or "both hidden-group
    states" scenario would duplicate what those already show without adding a claim vitest, the
    harness's structural assertions, or a direct visual read did not already make)

- [x] T010 [P0] Run the three build gates plus the capture gate, reading output and exit status
  - `npx tsc --noEmit`, `npm run build`, `npx vitest run`
  - `npm run screenshots:verify`, then **open every changed PNG and look at it**
  - `npm run gate`, read from `$?`
  - **Evidence:** `npx tsc --noEmit` exit 0; `npm run build` exit 0 (`main.js` rebuilt from the final
    tree); `npx vitest run` — 143 files, 1529 tests, exit 0; `npm run screenshots` regenerated all 588
    entries, `npm run screenshots:verify` exit 0; every one of the 31 pixelHash-different captures
    opened and read (documented per-file in `tools/lane/css-lane.json`'s newest release note);
    `npm run gate` — 26/26 green, exit 0, run twice (once before the final rebuild, once after) with
    the same result. `node tools/naming/scan-comments.mjs` and `scan-failing-values.mjs` both exit 0

- [x] T011 [P0] Fill `acceptance-criteria.md` with evidence rows — the observed red, the command,
  and the observed green — not assertions
  - **Evidence:** see `acceptance-criteria.md` — every AC-001 through AC-015 row carries a Met status
    with the command and the observed value, except AC-012 (the operator's device read, left Unmet)

- [x] T015 [P1] Fix the three `db-record-detail-hidden-toggle` touch-target shortfalls the
  059-notion-board-refinement landing's own triage found in this leg's row grammar
  (`styles.css:10752-10758`, `:10886-10895`)
  - The disclosure toggle (`record-detail-panel.ts`'s hidden-group button, shared by the record-
    detail and record-peek surfaces) measured 120x20 on the phone sheet — a standalone tappable
    control, not a value living inside an already-sized cell, so it needed the same floor the
    table's load-more button and footer trigger already raise on
  - **Threshold:** the toggle's hit rect is >=44x44 on the phone sheet, the per-row eye button's
    hit rect is >=44x44 once its group is expanded, the anchored desktop popover keeps its compact
    height, and the row's own pitch (`--db-sheet-row-min-height`) is unchanged
  - **Red first:** `node tools/live/touch-targets.mjs --json` measured 3 `db-record-detail-hidden-
    toggle` instances under the 44px floor (120x20, two on record-detail/file-view, one on record-
    peek/file-view); pinned rather than absorbed in `touch-targets-constructed-baseline.json`'s
    `rebaseReconciliation2026_09_07` entry
  - **Evidence:** `.db-mobile-bottom-sheet .db-record-detail-hidden-toggle` gains `min-height:
    44px`; `.db-mobile-bottom-sheet .db-record-detail-hidden-eye` gains `min-width`/`min-height:
    44px`, filling the row's own already-reserved 44px pitch rather than growing it. Live-measured
    at 402px in headless Chrome: the toggle reads 120x44, the eye button 44x44 once expanded, and
    the row itself 48px before and after the change on both the record-detail and record-peek
    scenarios. `mobile-table-and-panel-ux.test.ts` gained a case pinning both raised selectors plus
    a negative control (the row pitch, the chevron and the drag handle stay unraised).
    `touch-targets-constructed-baseline.json`'s `under` count is lowered 810 -> 807 (18 classes,
    down from 19 — `db-record-detail-hidden-toggle` no longer appears in the undeclared list at
    all), never raised. Full recapture on the landing rebase onto `origin/main` af0e8796: 604
    entries, `screenshots:verify` exit 0, and every one of the 604 `pixelHash` values identical to
    its committed value. Six unrelated captures jittered on the recapture and were restored to
    their committed bytes rather than reviewed (`tools/lane/css-lane.json`'s newest release note
    names all six)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] T001-T007 and T009-T014 marked `[x]`, each with its red-first evidence recorded
- [x] T012 landed **before** T013 and before T007 — the population decides what the eye and the
      trailing row's position mean
- [x] No `[B]` task claimed as done or as deferred without the ruling that blocks it named — T008 is
      the one item recorded Deferred, with the reason named beside it
- [x] `goal.md` C1-C6 and C8-C10 ticked only where the threshold was met and the red was observed
      first
- [x] C7, the operator's device read, left unticked — it is not an agent's to close
- [x] The sweep's non-adopted rows (S3, S4, S5) still carry no code and no task

### Leg D — what is still gated, after the 19:05 rulings

Two of the three rows that sat here became task rows on 2026-09-06 19:05 — the hidden-group
population is **T012** and its row grammar is **T013**, both in Leg E below. One row stays: it has a
threshold and a red-first check written and **no schedulable task**, because writing the code before
the ruling is the failure D4 names.

| Item | Ruling needed | Threshold, already written | Red today |
|---|---|---|---|
| Featured line under the title | ADR-004's landing | One line, `--text-muted`, single-line clamp, under the title, above the field list | Zero `featured` tokens in any record-surface file |
| Record-level cover, icon and the third ghost button, "+ Add description" | **Deferred** by the operator 2026-09-06 19:05 (ADR-007, sweep S2) | The three hover ghost buttons appear together or not at all | No cover, icon or description on any record file |
| Record-level cover and icon | ADR-007 | — (an ownership question, not a value) | No cover surface exists on any record file |
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Criteria**: See `goal.md` §3 and `acceptance-criteria.md`
- **Rulings**: See `decision-record.md` ADR-001 through ADR-008
- **Research**: `../054-record-and-relation-surfaces/research/research.md` and its five iteration
  narratives under `research/lineages/glm-openrouter-record/iterations/`
- **Notion evidence**: `../054-record-and-relation-surfaces/notion-screens-digest.md` — the only
  source of Notion facts in this packet
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md — REQ-001 to REQ-008
- [x] CHK-002 [P0] Technical approach defined in plan.md — four legs, with the ordering reason
- [x] CHK-003 [P1] Dependencies identified and available — `052`'s picker host confirmed present and
  reused for T007's trailing row; ADR-005 to ADR-008 all ruled 2026-09-06 19:05
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npm run lint:tools` and the gate's naming scans pass — `lint:tools`, `naming`,
  `comments`, `failing-values` all green in the 26-lane gate
- [x] CHK-011 [P0] No console errors in the constructed scenarios — `render-assertions.mjs`,
  `sheet-grammar.mjs` and `constructed-state-assertions.mjs` all exit 0 against the full scenario set
- [x] CHK-012 [P1] The delegation preserves both special cases rather than adding a new branch —
  `getEmptyDisplayValue` on the board card mirrors `record-detail-panel.ts`'s own shape exactly
- [x] CHK-013 [P1] No new primitive is introduced; every criterion consumes one that exists —
  `getPropertyEmptyPrompt`, `renderOptionValue`, `createHiddenPropertiesGroup` and
  `buildAddPropertyRow` are all extended, not replaced
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] C1-C6 met against their thresholds, or recorded unmet with the reason — C1-C6 and
  C8-C10 all met; see `acceptance-criteria.md`
- [x] CHK-021 [P0] Every changed capture opened and looked at, not inferred from a byte count — all
  31 pixelHash-different captures opened and read; documented in `tools/lane/css-lane.json`'s
  newest release
- [x] CHK-022 [P1] The matrix in `plan.md` — {record sheet, board card} × 10 formats × 2 locales —
  is walked, with the `checkbox` row asserted to stay `false`. The English side is walked directly
  (unit tests plus the real captures); the Chinese side is walked at the data level — both locale
  tables carry all nine new keys — since this repository's capture pipeline builds no zh-CN/zh-TW
  scenario to read against
- [x] CHK-023 [P1] The "Unlisted" option path still renders as `property-row.test.ts` pins it — that
  suite's "falls back to gray for a value the column does not define" case is unchanged and green
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class per criterion: C1 **cross-consumer** (a second producer of the
  same behaviour), C2 **class-of-bug** (the producer covers a subset of its own domain), C3
  **instance-only** (one declaration on one arm), C4 **cross-consumer** (a producer with no
  consumers), C5 **instance-only** (one call site drops an argument), C6 **instance-only** (a
  missing affordance on one surface)
- [x] CHK-FIX-002 [P0] Same-class producer inventory run — T001's first `rg`; C1's whole point is
  that a second producer existed
- [x] CHK-FIX-003 [P0] Consumer inventory run for every changed helper — T001's second `rg`
- [x] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface in this packet
- [x] CHK-FIX-005 [P1] Matrix axes and row count listed before completion is claimed — `plan.md`
  §FIX ADDENDUM
- [x] CHK-FIX-006 [P1] N/A — no process-wide state is read
- [x] CHK-FIX-007 [P1] Evidence pinned to each leg's commit SHA, not to a branch-relative range —
  all legs land in one commit; the SHA is recorded in `implementation-summary.md`
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — N/A, render-time changes only
- [x] CHK-031 [P0] No new input path; the picker's query already flows to the modal today
- [x] CHK-032 [P1] N/A — no auth or authz surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] `goal.md`, `spec.md`, `plan.md` and `tasks.md` agree on C1-C7 and REQ-001 to
  REQ-008 — and on C8-C10/REQ-009-011, added by the 19:05 fold
- [x] CHK-041 [P1] Comments carry the durable WHY and no packet, task or ADR identifier —
  `scan-comments.mjs` exit 0, 0 artifact-id violations
- [x] CHK-042 [P2] `src/views/record-surface/CODE.md` updated if `renderOptionValue`'s consumer list
  changes — it names the consumers today — updated: two consumers named, plus `hidden-properties.ts`
  and `add-property-row.ts`'s newly-live status
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — debugging scripts ran from `/tmp` and the OS
  scratch directory, never inside the repository
- [x] CHK-051 [P1] scratch/ cleaned before completion — `git status` carries no stray file
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 13/13 |
| P1 Items | 13 | 13/13 |
| P2 Items | 3 | 2/3 |

**Verification Date**: 2026-09-07. CHK-042 (P2) landed with `CODE.md` updated. T015 (P1) closed the
three `db-record-detail-hidden-toggle` touch-target shortfalls the 059-notion-board-refinement
landing's own triage found in this leg's row grammar. T008 (P2) is the sole deferred item, with its
reason recorded beside it.
<!-- /ANCHOR:summary -->

---
