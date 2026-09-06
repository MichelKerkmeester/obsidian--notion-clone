---
title: "Feature Specification: Notion Table Refinement"
description: "The table view read against Notion's: one structural adoption we lack (per-column freeze), five small additions, thirteen behaviours already at or ahead of parity with no assertion holding them there, and four tensions dispositioned rather than resolved."
trigger_phrases:
  - "notion table refinement"
  - "062 spec"
  - "column freeze"
  - "frozen column"
  - "show vertical lines"
  - "date end range"
  - "table type set"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Notion Table Refinement

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Five iterations of deep research read our table view against a 98-screen Notion digest, and the
honest headline is that **Notion's table is not far ahead of ours**. The read produced one
structural adoption worth building, five small quality-of-life additions, thirteen behaviours
already at or ahead of parity, zero conflicts with a landed Anytype ruling, and one correction to
the digest itself.

The structural one is **per-column Freeze** (`74fe28d3`, `039351aa`): Notion's column menu carries
it, our `ColumnMenuActions` does not, and a `freeze|frozen` sweep of `src/` and `styles.css` finds
nothing on a column. Wide tables are exactly the case our fixed desktop colgroup widths create, so
the absence is felt rather than theoretical.

The thirteen already-haves are the reason **guards come first**. Four of them are ahead of Notion —
the in-header multi-sort ordinal with `aria-sort`, per-chip inline removal, select-all with range
selection, and an inline-edit lifecycle stricter than a screenshot catalogue can show — and five of
the thirteen carry no permanent assertion at all.

**Key Decisions**: whether Freeze ships desktop-only and what its divider does in a theme no capture
covers (ADR-005); where the add-row noun comes from (ADR-006); whether a type-picker row ships ahead
of the data type behind it (ADR-007); and whether the operator wants Notion's first-class
*Conditional color* naming for a capability we already have (ADR-003).

**Critical Dependencies**: `053` owns the toolbar, the wrap switch and the column menu; `052` owns
the cell editors; `styles.css` is serialized by the parent's CSS lane; ADR-005, ADR-006 and ADR-007
are Proposed and block C1's divider, C8 and C4 respectively.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `worktrees/177-notion-table` (documentation only; implementation legs get their own) |
| **Parent Spec** | ../spec.md |
| **Phase** | 62 |
| **Predecessor** | 053-toolbar-and-view-controls |
| **Successor** | None |
| **Handoff Criteria** | Every row in `acceptance-criteria.md` `Met`, `Waived` with an ADR or `Superseded` with an ADR, except AC-009 which is the operator's |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 62** of `005-component-surface-system`, opened by the Opus synthesis of the Notion
table research loop (`../053-toolbar-and-view-controls/research/research.md`), under the operator's
2026-09-06 ~16:10 instruction that every UI phase gains a Notion refinement child.

**Scope Boundary**: the table view's own surface — its header row, cells, row chrome, column menu
affordances, footer and phone presentation. It does **not** re-open the wrap control (`053`
ADR-004, corrected here by ADR-002 and closed on `main`), the drag-and-reorder model (`053`
ADR-003), the record-open affordance (`006` and `054` own it), or the toolbar (`053`, whose own
Notion child is `064`).

**Numbering note**: this is the sixty-second child folder position and it is reserved. `059`-`066`
were reserved together on 2026-09-06 ~16:10 for the eight Notion refinements, one per UI surface,
and **`062` must not be renumbered** even though `067` already exists — `067` was opened out of
order for the sheet family. The kit's `create.sh --phase --parent` form allocates the next number
after the highest existing child, which would have produced `068`; the packet was therefore built
from the contract-backed templates directly, following `053`'s own recorded fallback.

**Dependencies**:
- `../053-toolbar-and-view-controls/notion-screens-digest.md` is the only admissible source of
  Notion fact. No image file was opened by the research loop, by construction.
- `053` and `052` own the files this packet changes and are cited rather than co-assigned.
- `050` ADR-005's contrast bar and `../design-system.md` §12's token rule bind every new colour.
- ADR-005, ADR-006 and ADR-007 are the operator's and gate C1's divider treatment, C8 and C4.

**Deliverables**:
- Per-column freeze: a config field, a menu row, sticky offsets and a divider, desktop-only.
- Five permanent guards on behaviours that are already right and currently unasserted.
- An end value on dates, a corrected four-registry type set, a visible resize handle, a
  vertical-lines view switch, a peek placeholder and a derived add-row noun.
- Two new capture scenarios for the two new visual states, registered in the same change.
- One device pass answering the three questions no headless harness here can.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Our table view has never been read side by side against the product it is most often compared to.
The result is two separate problems that look like one.

The first is a **genuine gap**: Notion lets you freeze columns from the column menu, and we have no
such concept — not a config field, not a menu action, not a stylesheet rule. Our desktop tables ship
fixed colgroup widths, so a wide table scrolls horizontally and the title column leaves the
viewport with everything else.

The second is **invisible correctness**. Thirteen table behaviours match or beat Notion's, and five
of them are held up by nothing — no unit test, no lane row, no capture assertion. The footer's
zero-row skip is one `if` statement, the phone floor is one CSS rule, the chip measurer's cap is one
number, and any of them can be deleted without a check going red. A packet that adds Freeze and
leaves those unguarded has moved the risk rather than reduced it.

### Purpose

Close the one gap that is worth closing, add the small items that earn their place, and put a
permanent assertion under everything already right — so that the next person to open this surface
finds out immediately when they break it.

<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- Per-column freeze: `ViewConfig` field, `ColumnMenuActions` action, menu row, sticky `th`/`td`
  offsets, divider, desktop-only scoping with the reason stated.
- Five permanent guards: footer zero-row skip and phone floor, header composition, inline chips and
  their measurer, per-option pill colour, conditional row tint.
- An optional end value on date columns, its picker row and its display form.
- The four type registries brought into step, with the grouped submenu's slice boundaries corrected.
- A visible resize-handle affordance on header hover.
- A *Show vertical lines* view switch.
- An empty-property placeholder in the docked record peek.
- A derived noun on the add-row affordance, in all three locales.
- Two capture scenarios for the two new visual states.

### Out of Scope

- **The wrap control.** Closed on `main` at `41513bd3` and `1a2c7e00`; ADR-002 records it.
- **Data types behind the new picker rows.** C4 ships icons and labels only; the Person type in
  particular has no obvious value source in an Obsidian vault, since a person is not a note.
- **Timezone and Remind picker rows** (`bd482935`) — Notion-service features with no analogue here.
- **Notion's column-menu row order, its flat type list, and its shorter title-column menu.** Each
  eliminated with evidence; ADR-001 carries the title-menu one.
- **Empty table-cell rendering.** Ours already matches Notion's blank convention. Changing it would
  break parity.
- **A row-expand triangle** (`90277769`) — the record-open affordance and the docked peek already
  resolve the need, and `006`/`054` own it.
- **A new "Conditional color" feature.** The capability ships; only its naming could move, and that
  is ADR-003's question, not a task.

### Files to Change

| File | Change | Owner | Note |
|------|--------|-------|------|
| `src/data/types.ts` | Modify | `053` | `frozenColumnKeys`, the vertical-lines switch, the date end value, the type union |
| `src/data/column-types.ts` | Modify | `053` | `COLUMN_TYPE_LABELS` for the new types |
| `src/views/column-menu.ts` | Modify | `053` | The freeze action and row; the submenu slice boundaries |
| `src/views/table-renderer.ts` | Modify | `053` | Frozen offsets on `th`/`td`; the add-row noun |
| `src/views/cell-renderer.ts` | Modify | `052` | The date range display form |
| `src/views/record-surface/cell-editor-date.ts` | Modify | `052` | The End date row |
| `src/views/record-surface/type-picker.ts` | Modify | `054` | `PROPERTY_TYPES` |
| `src/views/property-type-icon.ts` | Modify | `054` | `PROPERTY_TYPE_ICON_NAMES` glyphs |
| `src/views/table-record-peek.ts` | Modify | `006` | The empty-property placeholder |
| `styles.css` | Modify | shared | Sticky frozen columns, the divider, the handle line, the border gate. Serialized by the CSS lane |
| `tools/live/render-assertions.mjs` | Modify | harness | The five guards and the freeze offset row |
| `tools/screenshots/scenarios/core.mjs` | Modify | harness | Two new scenarios |
| i18n locale files | Modify | `053` | The add-row noun key and the new type labels, three locales |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001**: A column can be frozen from its header menu, frozen columns compute a sticky `left`
  equal to the sum of the preceding frozen widths within ±1px, the state persists per column through
  a serialise/parse round-trip, and unfreezing collapses the offset. Desktop only.
- **REQ-002**: Each of the five unasserted parity behaviours carries a permanent assertion that is
  green on the tree and red under its own named negative control.

### P1 - Required (complete OR user-approved deferral)

- **REQ-003**: A date column can carry an optional end value, edited through an End date row and
  rendered as a range in the cell.
- **REQ-004**: The four type registries agree, the type popover shows one glyph per type, and the
  grouped submenu's slice boundaries hold. Gated on ADR-007.
- **REQ-005**: The resize handle's computed background changes on `th:hover`, from a token-derived
  colour clearing 3:1 in both themes.
- **REQ-006**: A view switch controls vertical lines; off, no `td` computes a right border; on, the
  computed borders are unchanged from today.
- **REQ-007**: An empty visible property renders a muted placeholder in the peek. Table cells are
  untouched.
- **REQ-008**: The add-row affordance renders a derived noun where one exists and today's string
  where it does not, in all three locales. Gated on ADR-006.
- **REQ-009**: The operator reads the refined table on iOS and in both themes, and answers the
  three questions no harness here can.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

The binding list is `goal.md` §3 and the measurable form is `acceptance-criteria.md`. In one
sentence each:

1. A frozen column stays put while the table scrolls sideways, and the offset is arithmetic rather
   than eyeballed.
2. Deleting any one of the five guarded behaviours takes a check red.
3. A date cell can say *4 Mar – 8 Mar*.
4. The type popover and the three registries behind it never disagree again.
5. A column edge shows you it is draggable before you drag it.
6. Vertical lines are a choice.
7. An empty property in the peek reads as empty rather than as nothing.
8. The add-row button names what it adds.
9. The operator has read all of it on a real device, in both themes.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Dependency | Type | Status | Impact if unavailable |
|------------|------|--------|-----------------------|
| ADR-005 (freeze scope and divider) | Operator decision | Proposed | C1 lands without a dark-theme divider treatment |
| ADR-006 (noun source) | Operator decision | Proposed | C8 cannot start |
| ADR-007 (type row before data type) | Operator decision | Proposed | C4 cannot start |
| `053` / `052` file ownership | Coordination | Live | Legs serialize on the same files |
| The parent CSS lane | Coordination | Live | `styles.css` rows queue |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The frozen-offset computation runs once per header render over the frozen subset,
  not per row. Rows inherit the offset from the colgroup-driven width already computed.
- **NFR-P02**: No new `ResizeObserver`, `MutationObserver` or rAF loop. The existing windowing
  (`src/views/table-renderer.ts:1229-1312`) is untouched.

### Security
- **NFR-S01**: N/A — no auth, no input crossing a trust boundary, no persisted user data beyond the
  view config this plugin already writes. Recorded rather than silently skipped.

### Reliability
- **NFR-R01**: `frozenColumnKeys` naming a column that no longer exists must be inert, not fatal.
  A deleted or hidden column drops out of the offset sum without throwing.

---

## 8. EDGE CASES

### Data Boundaries
- Every column frozen: the table must still scroll, or the freeze must be capped. The threshold
  belongs to the task, measured rather than guessed.
- The title column frozen and then hidden: the offset sum recomputes over the visible frozen set.
- A date with an end but no start, and an end before its start: both render without throwing, and
  the picker states which it treats as authoritative.
- Vertical lines off with conditional formatting on: the tint still paints; the border is the only
  thing that goes.

### Error Scenarios
- A stored `frozenColumnKeys` from a newer version containing an unknown key: ignored, not dropped
  from the config, so a downgrade does not destroy the setting.
- The phone rendering a config with frozen columns set on desktop: no visual change, because auto
  layout has no horizontal overflow (`styles.css:21021-21035`). The setting persists untouched.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 16/25 | Files: 15, LOC: ~950, Systems: renderer + config + stylesheet + harness |
| Risk | 10/25 | Auth: N, API: N, Breaking: a persisted config shape, every table capture |
| Research | 3/20 | Done — 5 iterations, 26 findings, `../053-toolbar-and-view-controls/research/research.md` |
| Multi-Agent | 5/15 | Workstreams: 2 (guards; adoptions) |
| Coordination | 8/15 | Dependencies: `053`/`052` file groups, the CSS lane, three operator decisions |
| **Total** | **42/100** | **Level 3 on judgment** |

`recommend-level.sh --loc 950 --files 15` → **50/100, confidence 90%, Level 2**; phase score
**10/50** against the 25 threshold, so a standard child rather than a phase parent. **Raised to
Level 3**, which is what the kit asks for when judgment reads higher than the script: the packet
adds a persisted `ViewConfig` field with a round-trip contract, changes a type union that four
registries must follow in step, spans two viewports, and carries three device-only reads. The
script's inputs carry no flag for any of those — `--architectural` was not passed, because a sticky
offset and a config field are not an architecture change, and inflating the input to reach the
answer would be the wrong way round.

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | The freeze CSS is our design, not an adoption — no capture shows a frozen state | M | H | Marked inference in `goal.md` C1 and ADR-005; the iOS read is a criterion, not an assumption |
| R-002 | A new type row ships with no renderer, editor or storage behind it | H | M | ADR-007 puts the question to the operator and names deferral as the alternative |
| R-003 | The four type registries drift again after this packet | M | M | The guard is the deliverable: one assertion that the four lists are the same length and the same members |
| R-004 | The border gate moves every table capture and hides a real regression in the noise | M | M | Recapture in the same leg; assert the protected entries `pixelHash`-identical; read the movers by scenario |
| R-005 | A guard is written that passes on presence rather than value, the family's standing harness failure | M | M | Every guard row reads a computed style or a measured rect and is observed red under its own control before it is trusted |
| R-006 | Freeze on the phone is quietly skipped and nobody records why | L | M | `050` D3 forbids a silent no-phone; the reason is in the task and in C1 |

---

## 11. USER STORIES

### US-001: The title column stays visible (Priority: P0)

**As a** person scrolling a wide table sideways, **I want** to freeze the columns that identify the
row, **so that** I can still tell which record I am reading when the title has scrolled off.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-001).

---

### US-002: What already works keeps working (Priority: P0)

**As a** person maintaining this table, **I want** every behaviour that is already correct to fail a
check when it breaks, **so that** the next change to this file is not the one that quietly removes
the footer or restacks the chips.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-002).

---

### US-003: A date can be a span (Priority: P1)

**As a** person tracking something with a start and an end, **I want** one date column to hold both,
**so that** I do not need two columns and a convention to remember which is which.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-003).

---

## 12. OPEN QUESTIONS

- **Where does the add-row noun come from?** Notion derives it from the data source (`19745d87`,
  `e33466b4`). Ours would need the view's source name or a fixed word. A product decision; ADR-006
  carries it and C8 is gated on it.
- **What does the frozen divider look like in dark theme?** No Notion capture exists — all 102
  screens are light — so the shadow or line is ours to derive from tokens. ADR-005; the operator's.
- **Does the operator want Notion's first-class *Conditional color* naming and explainer**
  (`142cef4e`, listed in `a0d1e399` and `794591f5`), given that our rules live in database settings?
  The capability ships either way. ADR-003; presentation only.
- **Does a type-picker row ship before the data type behind it?** ADR-007. The alternative is
  deferring the whole item until a type has a renderer, an editor and a storage form.
- **Show data source title** — the sixth P10 view toggle was not located in the loop's reads and is
  deliberately **not guessed at**. C6's first read should answer it.
- **Create-on-type inside a table cell** — unresolved verification debt, not a finding of absence.
  `record-surface/cell-editor-option.ts` must be read before either parity or absence is claimed.
- **The column manager's title-eye disabled state** against `9867cb76` — the digest asserts the
  panel matches, but not that specific state.
- **The Person type's value source** — Notion renders Person as avatar plus name (`3b3c3c26`,
  `21d71e5f`). A person is not a note, so there is no obvious source in an Obsidian vault. Deferred
  with the data type; recorded as an inference, not a finding.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Durable directive**: See `goal.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Decision Records**: See `decision-record.md`
- **Research of record**: `../053-toolbar-and-view-controls/research/research.md`
- **Notion source of record**: `../053-toolbar-and-view-controls/notion-screens-digest.md`
