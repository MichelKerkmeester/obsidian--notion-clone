---
title: "Superseded: List View as a ClickUp-Style Grid"
description: "The ClickUp direction for the list view, as specified before the operator retired the view outright on 2026-09-04. Kept verbatim as history: the twenty-screen interaction study, the feature diff and the answered questions are real work and the deprecation packet cites them rather than restating them."
trigger_phrases:
  - "superseded clickup list direction"
  - "clickup list interaction model"
  - "list view clickup history"
  - "006 superseded direction"
importance_tier: "normal"
contextType: "general"
---

> **SUPERSEDED — 2026-09-04.** This document is the packet's previous direction, kept as history and
> not as a plan. The operator retired the list view outright: *"Also deprecate list view
> completely"*. Nothing below binds. It is preserved because the work in it is real — a
> twenty-screen ClickUp interaction study, a measured table-to-list feature diff, and a set of
> answered questions — and the deprecation cites it instead of restating it. The live direction is
> [`spec.md`](spec.md); the decisions it replaced are kept in
> [`decision-record.md`](decision-record.md).
>
> Its own headings, section numbers and requirement ids are left exactly as they were written. Do
> not renumber them: they are what the five superseded children reference.

# Feature Specification: List View as a ClickUp-Style Grid

> Criteria doctrine, the token-root root cause and the harness blindnesses are recorded in
> [`../005-component-surface-system/architecture-findings.md`](../005-component-surface-system/architecture-findings.md).
> This packet cites that file and does not restate it. Section 9 of it — *How criteria must be
> written* — is binding here.


---

## EXECUTIVE SUMMARY

The operator wants the list view to have every feature the table has, and to look the way ClickUp's
list looks. Twenty ClickUp reference screens say those are the same request, not two: **ClickUp's
list view is a table.** Grouped rows sit under a column header row that repeats per group, columns
align across every group, cells edit in place, and a trailing affordance adds a column. What
separates it from a spreadsheet is chrome — no per-column gridlines, no cell fills, a taller row, pill
and chip cell renderers, a coloured status pill in the group header, and a checkbox that swaps into
the row-icon slot on hover instead of claiming its own column. The operator's own screenshot now
qualifies one word of that: there is exactly one vertical rule, at the pinned first column's edge.

**Two rounds of operator captures have since arrived** and together are the primary source for §4.2.
The first reversed two conclusions drawn from its absence (ADR-002, ADR-003). The second — four
full-size desktop list views at
[`../context/clickup/list-view/`](../context/clickup/list-view/) — reversed a third: the selection
checkbox does **not** swap into the record-icon slot, it appears in a leading gutter that is reserved
and empty at rest, beside a drag grip, with the record icon still in place (C22, ADR-004). §4.2.1
records what those four screens still cannot establish, so their silence is not mistaken for a
finding a second time.

Our list is not that. It is a stack of cards: a title line, then a `label value` pair per field,
laid out on a grid whose tracks come from the same column widths the table uses
(`list-renderer.ts:344`). Its cells render through `card-field-renderer.ts` — **348 lines** — while
the table's render through `cell-renderer.ts` — **3,107 lines**. That single divergence, plus
**11 `viewType === "table"` guards** in `database-view.ts`, is the whole feature gap. Nothing else
explains it and nothing smaller will close it.

**Key decision (ADR-001) — decided: Route B.** The list becomes a *presentation mode of the grid
renderer*, so every table feature is inherited by construction rather than re-listed and
re-implemented. The operator chose it on the argument that Route A is complete the day it ships and
incomplete by the next table feature. Nothing in the four desktop screens makes Route B harder: every
new finding is chrome or slot allocation, and `data-db-row-style` selects both. **The obligation the
decision carries** is that the two correctly view-semantic guards (G8 and G11 in `plan.md` §3) must
survive the conversion, and both would pass `tsc` and the whole unit suite if broken — so each needs
a check that drives the production render and fails when the guard is converted, built **before any
guard is touched**.

**Critical dependencies.** `styles.css` is a single serialized lane (`tools/lane/css-lane.json`);
this packet takes it once and releases once. `vitest` runs `environment: "node"`, so every DOM
assertion belongs in `tools/storybook/verify-placement.mjs`, which today renders no view at all.

---

## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | `specs/006-list-view-deprecation/` |
| **Level** | 3 (Full) — `recommend-level.sh --loc 2500 --files 22 --architectural --api` returned 80/100, confidence 94% |
| **Phase decomposition** | Qualifies. Phase score 40/50 against a threshold of 25, and level 3 against a threshold of 3. Both met independently |
| **Status** | Planned — spec and plan only, no code written. ADR-001 answered, so no phase is blocked |
| **Primary source** | `src/views/list-renderer.ts` (668 lines), `src/views/table-renderer.ts` (1,132 lines), `src/views/database-view.ts` (11,606 lines) |
| **Visual reference** | Primary: four desktop captures at `../context/clickup/list-view/clickup-desktop-list-view-{1,2,3,4}.png`, cited by path and never copied into this packet; plus `reference-clickup-list-operator.png`, held here as evidence. Secondary: 20 ClickUp web screens via the Mobbin MCP, cited by URL in §4.2. No Mobbin image is vendored and nothing is copied out of any source — see the licence note in §4.2.1 |
| **Blocked by** | Nothing. ADR-001 is answered — Route B |
| **Relationship to 005** | Independent. `005-component-surface-system` owns floating surfaces, sheets and touch semantics. This packet owns a view's own layout. They share the `styles.css` lane and the criteria doctrine, nothing else |

---

## 2. PROBLEM & PURPOSE

**The list view is a different product from the table view, and nobody decided that.**

It renders a card stack. Each row is `controls | main`, where `main` is a title line plus a grid of
`label value` pairs (`list-renderer.ts:300-357`). There is no column header, so there is nothing to
sort by, resize, reorder, or open a column menu on. There is no `<td>`, so cell selection, fill,
clipboard and keyboard grid navigation have nothing to address. There is no footer, so per-column
calculations have nowhere to render.

Three measured facts fix the size of the problem:

1. **Two cell pipelines.** The table calls `renderCell` into `cell-renderer.ts` (3,107 lines,
   13 handled types including `files` and `rollup`). The list calls `renderCardField` into
   `card-field-renderer.ts` (348 lines). Any cell capability that exists only in the first is
   invisible in the list, and always will be while the two pipelines are separate.
2. **Eleven view-type guards.** `database-view.ts` gates fill (`:1567`), clipboard and grid
   select-all (`:1597`), keyboard row creation (`:1816`), cell focus restore (`:1972`), the external
   row patch fast path (`:2477`), table subgroup config (`:2701`, `:2768`), required-column
   resolution (`:5496`), footer suppression (`:6995`) and optimistic cell updates (`:8542`) behind
   `viewType === "table"`. Each is a feature the list cannot reach.
3. **Two classes carry affordances and have no CSS at all.** Measured against `styles.css`:
   `db-list-group-new` — the per-group *Add Task* button, emitted at `list-renderer.ts:172` — has
   **0** rules. `db-list-row-checkbox`, emitted at `list-renderer.ts:273`, has **0** rules
   (already recorded in `architecture-findings.md` §7 and still true). By contrast `.db-list-row`
   has 18. Any criterion phrased over the row will pass while the two affordances the operator
   pointed at stay unstyled.

**Purpose.** Give the list view the grid's feature surface and ClickUp's reading experience, in a
way that cannot silently drift back apart.

---

## 3. SCOPE

### In scope

- The list view's DOM, its cell pipeline, and the guards that gate table features from it.
- `styles.css` rules for the list surface, taken and released through `tools/lane/css-lane.json`.
- List-relevant view configuration (`listCompactFields`, `rowDensity`, `showEmptyFields`).
- Harness work required to *see* the list at all: `verify-placement.mjs`, screenshot scenarios,
  Storybook stories.
- The list's group header, its count, its per-group create affordance, and its selection semantics.

### Out of scope

- Board, gallery, calendar, timeline and chart views. They are touched only where a shared guard is
  renamed, and every such touch is enumerated in `plan.md` §3 before it is made.
- New field types, new formulas, new aggregation functions.
- The toolbar. ClickUp's secondary toolbar row is recorded as C20 in §4.2 — observed, and explicitly
  **not** required here.
- Subtask hierarchy. ClickUp's list nests subtasks under a parent row; this plugin has no subtask
  model. See §10 Q4.
- Any change to `main.js` beyond a rebuild.

### Frozen boundary

`SCOPE LOCK` applies. A phase that finds a defect outside this list — including in the table — records
it and does not fix it.

---

## 4. REQUIREMENTS

### 4.1 The table-to-list feature diff

Built from the two renderer action interfaces, the eleven view-type guards, and the two cell
pipelines — not from a keyword grep. The interface columns were extracted mechanically by parsing
`TableRendererActions` and `ListRendererActions` and differencing the member sets, so the inventory
is complete by construction over that surface.

| # | Feature | Table today | List today | Evidence |
|---|---|---|---|---|
| F1 | Column header row | `renderHeader` builds `<thead>` with a `<th>` per column | none — no header element exists | `table-renderer.ts:507`; `list-renderer.ts` has no header path |
| F2 | Click-to-sort on a header | yes, shift-click appends a rule | unreachable — no header to click | `column-header-controller.ts:57` |
| F3 | Sort indicator with ordinal | yes: arrow plus `index+1` when more than one rule, as bare text | none | `table-renderer.ts:537-546`; `styles.css:4969-4978`. ClickUp's own form is confirmed at C18 — same information, badge container |
| F4 | Column resize handle | yes, desktop only | none. Widths are read but not editable here | `column-header-controller.ts:64`; `column-width.ts:42` |
| F5 | Column drag-to-reorder | yes, desktop only | none | `column-header-controller.ts:65` |
| F6 | Column context menu | yes, from the header | partial — `showColumnMenu` exists on the list actions but fires from a field, not a header | `table-renderer.ts:552` vs `list-renderer.ts:637` |
| F7 | Add-column affordance | trailing `<th>` with a plus button | none | `table-renderer.ts:550-566` |
| F8 | Per-column calculation footer | `TableFooterRenderer` | none. The list gets the separate `summary-renderer` bar instead | `table-renderer.ts` footer path; `database-view.ts:6995` removes `.db-summary` for table only |
| F9 | Cell range selection | yes | no — `cellSelection` is guarded on `viewType === "table"` | `database-view.ts:1567`, `:1597` |
| F10 | Fill handle / fill from edge | yes | no | `TableRendererActions.setupFillHandle`; guard at `database-view.ts:1567` |
| F11 | Clipboard copy / cut / paste over cells | yes | no | `database-view.ts:1597` |
| F12 | Keyboard grid navigation and cell focus restore | yes | no | `database-view.ts:1972` |
| F13 | Create a row by tabbing past the last cell | yes | no | `database-view.ts:1816` |
| F14 | Optimistic cell update | yes; disabled for the list's title field | narrower — `viewType !== "table" && titleField === col.key` forces a full refresh | `database-view.ts:8542` |
| F15 | External-change row patch fast path | yes | no — falls through to a full refresh | `database-view.ts:2477` |
| F16 | Focus and scroll preservation across a patch | `captureInteractionSnapshot` / `restoreInteractionSnapshot` | absent from the list action interface | `TableRendererActions` members |
| F17 | Multi-field grouping (group plus subgroup) | yes, `groupByFields`, rendered with depth and nesting | no — `renderList` passes one field only | `table-renderer.ts` `RenderableTableGroup`; `database-view.ts:10313` |
| F18 | Row density (compact / default / comfortable) | yes, `data-row-density` | no — the option is not offered for list | `table-renderer.ts` `applyDensity`; `view-config-panel-renderer.ts:330` |
| F19 | Grouped select-all sync after an external selection change | yes | **broken** — `syncGroupedSelectionInputs` queries `.db-table` and `.db-group-divider-row` only, so `db-list-group-checkbox` is set at render and never resynced | `database-view.ts:7566-7575` |
| F20 | Cell renderers for `files` and `rollup` | yes | no — `card-field-renderer.ts` handles neither | `cell-renderer.ts` type set vs `card-field-renderer.ts` type set |
| F21 | Record-icon column | yes, a dedicated `<th>` and `<td>` | inline in the title line only | `table-renderer.ts:521` vs `list-renderer.ts:306` |
| F22 | Sticky header while scrolling | yes, `--db-table-header-top` | nothing to stick | `styles.css:608` |
| F23 | Row drag-reorder and drag-to-group | yes | **yes** — the list has this, including a batch payload | `list-renderer.ts:449-525` |
| F24 | Mobile move menu instead of drag | yes | **yes** | `list-renderer.ts:372-423` |
| F25 | Per-group create affordance | via a create row in the group | **yes**, `db-list-group-new` — but with 0 CSS rules | `list-renderer.ts:172`; measured against `styles.css` |
| F26 | Open the record detail panel by clicking the row | not the row — the table opens on a target cell | **yes** | `list-renderer.ts:254-259` |
| F27 | Roving-tabindex card keyboard model | no | **yes** | `list-renderer.ts:248`, `card-roving-tabindex.ts` |
| F28 | Stacked file-title display | no | **yes** | `list-renderer.ts:313` |
| F29 | Wrapping fields sized `max-content` | no | **yes**, per column `col.wrap` | `column-width.ts:42-56` |

**Reading the diff.** Nineteen capabilities are table-only (F1-F22 minus the shared ones), seven are
list-only (F23-F29), and one — F19 — is a live defect rather than a gap. The list-only column is not
noise: F26, F27, F28 and F29 are the reading experience the list exists for, and Route B must
preserve them as opt-in modes rather than delete them.

**Two rows read differently against the four desktop screens, and neither changes the diff itself.**
F21 records the record-icon column as table-only, with the list rendering it inline in the title
line — and C22 shows the reference doing what **the list** already does, not what the table does:
the glyph sits inside the Name cell with the selection chrome in a gutter beside it. F29 records
wrapping fields as list-only, and C31 shows the reference truncating everywhere, in cells and header
labels alike. So the reference agrees with our list on F21 and disagrees with it on F29. FR-17 keeps
both regardless, which makes F29 a **deliberate divergence** rather than an unnoticed one.

### 4.2 The ClickUp interaction model, verified

**Three sources, ranked. The newest is the strongest and it reversed a row.**

- **Primary — four desktop captures.** `clickup-desktop-list-view-1.png` through `-4.png` in
  [`../context/clickup/list-view/`](../context/clickup/list-view/), supplied by the operator and
  cited below as **D1**-**D4**. Full-size dark-theme desktop list views: D1 grouped by a non-status
  field with nested rows three levels deep, D2 with the app sidebar open and thirteen columns, D3 a
  single large status group, D4 five status groups including one with zero rows. D3 and D4 each
  carry one row in a transient state no earlier source ever showed. Where these and any other source
  disagree, these win.
- **Primary — `reference-clickup-list-operator.png`.** The operator's first capture, held in this
  packet. Still primary, and still the sole source for several rows below.
- **Secondary — 20 ClickUp web screens** retrieved through the Mobbin MCP and cited by URL. They
  remain the **only** source for row edit mode, an active selection and the bulk action bar.

**The failure this section exists to prevent, restated.** The first draft read twenty Mobbin screens
that omitted a sort indicator as proof none existed — but the sample was assembled with nothing
sorted, so a header *could not* have shown one and the set could never have falsified the claim it
was used to reject. Four more screens do not retire that risk; they enlarge the sample. So each row
below records which of four things the new evidence did: **confirmed** it on a primary source,
**contradicted** it, **sharpened** it, or left it **untouched**. A claim the four screens merely fail
to contradict is marked untouched and is never promoted. §4.2.1 lists what they cannot address at
all, and why absence there is not a finding.

C1, C3, C4, C5, C6, C8, C10 and C16 are corroborated again by D1-D4 with no change to their wording.
C7 and C14 depend on edit and selection states none of the four captures, and continue to rest on
Mobbin alone.

| # | Element | Status | Evidence |
|---|---|---|---|
| C1 | Rows grouped under collapsible headers, chevron on the left | confirmed | [94480f0b](https://mobbin.com/screens/94480f0b-f404-4221-97f4-2030a7fddef5), [dd452938](https://mobbin.com/screens/dd452938-3574-42ae-8c31-963b42d3b390), [ca307740](https://mobbin.com/screens/ca307740-b31b-45b3-aa3b-19881a968a5b). **D1-D4** all carry it; every chevron on all four points down, so a collapsed group is still unobserved |
| C2 | The group value is a **coloured status pill**, not plain text, and the pill carries a **status glyph as well as a colour** | confirmed **for a status group field**; scope narrowed by C26 | same three; SHIPPED pink, REVIEW purple, IN DEVELOPMENT blue, IN DESIGN yellow. **Operator screenshot** adds the glyph. **D4** shows five status pills each with its own glyph and hue — an open ring, a clock, a part-filled ring, a ring, a check — and **D2**/**D3** carry the same treatment. **D1 groups by a non-status field and gets a neutral chip with no glyph**, so this row is about status grouping, not about grouping. See C26 |
| C3 | A count sits beside the pill — a plain numeral, not a chip | confirmed, and its **semantics** are now known | [ca307740](https://mobbin.com/screens/ca307740-b31b-45b3-aa3b-19881a968a5b), [3b76865e](https://mobbin.com/screens/3b76865e-6486-49cc-a506-1f623cfae1e1). **D1-D4** corroborate the form; **D4** and **D1** together fix what it counts — see C25 |
| C4 | A column header row **repeats inside every group** | confirmed, and sharpened | [94480f0b](https://mobbin.com/screens/94480f0b-f404-4221-97f4-2030a7fddef5), [ca307740](https://mobbin.com/screens/ca307740-b31b-45b3-aa3b-19881a968a5b). **D1** repeats the full ten-column header under each of two group pills; **D4** repeats it under all five. C24 adds the two structural facts this row did not carry: the header is the group's **first child**, and it renders for a group with **zero rows** |
| C5 | A per-group `+ Add Task` row at the bottom of each group, aligned under Name | confirmed | all grouped Mobbin screens. **D1** and **D4** carry it in every group — including **D4**'s zero-row group, where it is the only thing below the header row |
| C6 | A trailing `+` column affordance at the right end of the header row | confirmed, and relocated | [94480f0b](https://mobbin.com/screens/94480f0b-f404-4221-97f4-2030a7fddef5), [ca307740](https://mobbin.com/screens/ca307740-b31b-45b3-aa3b-19881a968a5b), [3b76865e](https://mobbin.com/screens/3b76865e-6486-49cc-a506-1f623cfae1e1). **D1-D4** put it in every per-group header row, not once per view. "Right end" is wrong as written: it follows the **last column**, not the viewport edge — see C30 |
| C7 | Inline editing is **in-row and cell-level**: each cell opens its own popover, and the edit affordance is a `Save` split button carrying a chevron | confirmed on Mobbin only; **untouched by D1-D4** | [3f46f9c3](https://mobbin.com/screens/3f46f9c3-9e5a-40da-b67b-23ff74643b37) — a tag popover open beneath its cell. **No cell on D1-D4 is in an edit state**: no popover is open, no editor holds focus. This row cannot gain or lose support from them. **Withdrawn, and still withdrawn:** "the row becomes a strip of bordered pills" read bordered pills as an edit-mode signal. Bordered chips appear on resting rows in the operator screenshot and again in **D1-D4**, so a bordered pill does not distinguish edit mode from rest and must never be asserted as if it did — see the criterion note in `acceptance-criteria.md` §2 |
| C8 | Priority renders as a coloured flag glyph plus a word | confirmed, with one caution added | [94480f0b](https://mobbin.com/screens/94480f0b-f404-4221-97f4-2030a7fddef5), [3b76865e](https://mobbin.com/screens/3b76865e-6486-49cc-a506-1f623cfae1e1). **D1**, **D3** and **D4** show four levels — Urgent, High, Normal, Low — each a differently-hued flag **plus the word**, so the word is the non-colour signal. Unset cells carry an outline flag and no word. **Caution:** on **D2** and **D3** one row's Priority label is truncated to three characters beside a small additional element, which would leave hue as the only remaining signal. Whether that is a hover reflow or a width effect is not resolvable — see §4.2.1. We should not reproduce the degradation |
| C9 | Dates are text, coloured semantically — overdue and today read red, future reads neutral | confirmed, and the relative/numeric rule is now sourced | [94480f0b](https://mobbin.com/screens/94480f0b-f404-4221-97f4-2030a7fddef5), [ca307740](https://mobbin.com/screens/ca307740-b31b-45b3-aa3b-19881a968a5b). **Operator screenshot** showed one red overdue date among nine neutral, and near dates rendering relatively. **D1** and **D4** repeat both. C32 fixes the switch as **per value, not per column**. Observed, not required here |
| C10 | Assignees are avatar discs, stacked when several | confirmed | every Mobbin screen. **D1** and **D2** show single initial discs; **D4** shows one cell holding two overlapping discs, which is the stacked case |
| C11 | Multi-value tags are chips; placement is layout-dependent | **superseded by C28 — the two placements are not alternatives, they coexist** | [94480f0b](https://mobbin.com/screens/94480f0b-f404-4221-97f4-2030a7fddef5), [3b76865e](https://mobbin.com/screens/3b76865e-6486-49cc-a506-1f623cfae1e1) show chips after the title with a `+N` overflow chip; the operator screenshot puts them in a dedicated column with no overflow at a comfortable width. **D2 shows both in one view at once.** The `+N` treatment is width-driven, which is how `AC-21` is phrased, so the criterion survives — see C28 for the corrected reading |
| C12 | A subtask expand chevron and a subtask count sit on the row | confirmed | [94480f0b](https://mobbin.com/screens/94480f0b-f404-4221-97f4-2030a7fddef5), [ca307740](https://mobbin.com/screens/ca307740-b31b-45b3-aa3b-19881a968a5b). **D1** nests three levels deep with a count on each parent, and every non-Name column stays aligned across all three depths. Still out of scope — §10 Q4 |
| C13 | The selection checkbox **replaces the leading row icon in the same slot** — it is not an extra column | **CONTRADICTED. This row was wrong and is superseded by C22** | [dd452938](https://mobbin.com/screens/dd452938-3574-42ae-8c31-963b42d3b390), [92ec59bc](https://mobbin.com/screens/92ec59bc-1a30-4b2d-ab96-5ab6ef6cc292) were read as a swap. **D3** and **D4** each show one row revealing a drag grip **and** an unchecked checkbox in a band to the **left** of the row's chevron and record glyph, with the record glyph still present and unmoved. It is not a swap and it is not an extra column: it is a reserved leading gutter. FR-13 and AC-16 both change. See ADR-004 |
| C14 | Selecting rows docks a bulk action bar at the bottom | confirmed on Mobbin only; **untouched by D1-D4** | [dd452938](https://mobbin.com/screens/dd452938-3574-42ae-8c31-963b42d3b390), [92ec59bc](https://mobbin.com/screens/92ec59bc-1a30-4b2d-ab96-5ab6ef6cc292). **No row is selected on any of the four**: every revealed checkbox is empty and no bar is docked, which is consistent rather than contradictory. The selected state stays Mobbin-sourced |
| C15 | A per-group calculation numeral sits at the group's bottom-right | confirmed in Mobbin; **absent from all five primary screens, and that is still not evidence** | [3b76865e](https://mobbin.com/screens/3b76865e-6486-49cc-a506-1f623cfae1e1). Every group on the operator screenshot and on **D1-D4** ends in `+ Add Task` and nothing else. **A per-column calculation renders only when one is configured, and none of these views configured one**, so nine screens showing no numeral cannot falsify the claim — this is the identical shape to the C18 error and is recorded here so it is not repeated. `FR-08` stays P1, sourced from Mobbin only |
| C16 | An empty cell shows a faint placeholder, not blank space, and **its form depends on the column type** | confirmed, on three further primary screens | [3b76865e](https://mobbin.com/screens/3b76865e-6486-49cc-a506-1f623cfae1e1) — outline flag in empty Priority cells. The operator screenshot showed two forms in one row. **D1**, **D3** and **D4** show four: a dash in unset select and numeric cells, a calendar-with-plus glyph in unset date cells, an outline flag in unset Priority cells, and an outline person disc in unset Assignee cells. The dash sits where the filled pill's left edge would be, not centred in the cell. Date and assignee forms are add affordances; dash and outline flag are placeholders |
| C17 | Rows are flat and full-bleed — no card border, no inter-row gap — with a hairline divider, and **one** vertical rule at the pinned first column | confirmed for flat and full-bleed; **the divider and the rule are both still unresolved at capture scale** | Every Mobbin list screen carries the hairline divider. The operator screenshot corroborated flat, full-bleed and no gap, and added a vertical boundary at the Name column's right edge. **D1-D4** corroborate flat, full-bleed and no inter-row gap, and each shows the Name column terminating at a consistent boundary where the horizontally scrolling region begins. **They do not resolve, at this capture scale in dark theme, either the horizontal hairline between rows or whether that vertical boundary is a drawn rule or the edge of a differently-shaded pinned region.** Both halves therefore still rest on Mobbin and the operator screenshot; `AC-14` is unchanged and its provenance is recorded honestly |
| C18 | A **sort indicator with an ordinal** on the column header, repeated in every per-group header row | **confirmed four more times. This row previously read "not confirmed" and was wrong** | Operator screenshot, then **D1-D4**. Each of the four carries a small filled badge holding a direction arrow and an ordinal on exactly three of its headers, and the badge repeats in every per-group header row — fifteen instances on **D4**'s five groups alone. **D1** and **D4** sort on `Name`, `Priority` and `#`; **D2** sorts on `Name`, `Priority` and `Date created`, so the badge is not bound to particular columns. The Mobbin set showed a `2 Sorts` toolbar chip ([0c287f59](https://mobbin.com/screens/0c287f59-753c-4e28-92ad-9dff95fcde36)) and no header arrow; twenty screens omitting it were read as evidence it did not exist. See ADR-002 |
| C18a | The header indicator is **not** a substitute for a toolbar chip, and the two are not alternatives | better supported, still **not confirmed** | Operator screenshot plus **D1-D4**: five primary screens, each with three sort rules active, each carrying a filters chip (`2`, `3`, `3`, `4`) and **no sort chip at all**. So a filter chip and a sort header indicator coexist, five times over. What is still unobserved is a sort chip and a header badge **on screen together** — the Mobbin set has the chip, the primary set has the badge, and no capture has both. Promoting this to "confirmed" would repeat the C18 error in the other direction |
| C18b | How ClickUp's indicator differs from the one we already ship | measured on both sides; unchanged | **Ours** (`table-renderer.ts:537-546`, `styles.css:4969-4978`): a filled triangle plus the ordinal, as bare accent-coloured text with no background, border or padding, and **the ordinal suppressed whenever only one sort rule is active**. **ClickUp's**: an arrow with a stem plus the ordinal, inside a filled rounded badge separated from the label. Same information, different container. ClickUp's single-rule behaviour remains **unobservable** — all five primary screens carry a three-rule sort — so no claim is made about it |
| C19 | An **`Effort` column renders a filled coloured pill with a trailing chevron** | **confirmed on three further primary screens** | Operator screenshot, then **D1**, **D3** and **D4**. Filled pills with a chevron inside the pill's right edge, over rows at rest with no popover open and nothing revealed. Unset cells render a dash. C29 adds the width behaviour, which ADR-003 had left as an open question |
| C19a | The pill's colour comes from the **option**, not from the value's magnitude | confirmed, and now harder to dispute | Operator screenshot gave five buckets running brown, blue, purple, orange, pink in ascending order. **D1** and **D4** render the same buckets and put a green in the middle of the range. Six unrelated hues with no monotonic lightness or hue progression: the mapping is categorical, each option carrying a colour its author picked, and any ascending reading is a coincidence of those picks. The distinction is load-bearing — an ordered quantity encoded as unordered hue is a defect, not a pattern to copy. Foreground flips per option to hold contrast, which our `--db-status-fg` pairing already does |
| C20 | A secondary toolbar row above the groups | confirmed four more times, **out of scope** | Operator screenshot, then **D1-D4**. Left: a group-by chip **naming the grouped field** (`Feature` on D1, `Status` on D2-D4), a subtask-display chip (`Expanded` on D1-D2, `Separate` on D3-D4), and a columns icon. Right: a filters chip carrying a count, a row of icon buttons, a settings icon, and a `+ Task` split button with a chevron. Recorded so §3's exclusion has something real to exclude |
| C21 | Two chip treatments coexist in one row, split by field role: **filled** for a single-value select, **outlined** for multi-value reference columns | **the split is confirmed; its attribution of `Feature` is contradicted.** See C27 | Operator screenshot: `Effort` filled; `Feature` and `App` bordered. **D1**, **D3** and **D4** show `Effort` filled and `App`, `Scope` and `Lists` bordered — but they render `Feature` as **plain text with no chip at all**. **D3** settles it inside one row: the same string appears as plain text under `Feature` and as a bordered chip under `App`. The treatment is a property of the **column**, not of the value or of the name `Feature`. We render `select`, `status` and `multi-select` through one filled `status-badge` (`cell-renderer.ts:311-313`, `:447`), so the split does not exist for us |
| C22 | The row's selection checkbox and drag grip occupy a **leading gutter that is reserved at rest and empty**, left of the row's expand chevron and record glyph | confirmed on two primary screens; **supersedes C13** | **D3** and **D4** each show exactly one row carrying a six-dot drag grip and an unchecked checkbox in a band left of everything else on the row. On both screens the expand chevron, the record glyph and the title sit at **the same horizontal positions on the revealed row as on unaffected rows**, so the band is allocated at rest and painted into on reveal — it does not push the row's content right. The record glyph is not replaced, hidden or moved. The group's own collapse chevron sits in the same leading band, so one gutter serves both |
| C23 | The revealed row also carries an **action cluster right-aligned inside the Name column** and a trailing overflow menu | confirmed on two primary screens; observed, **not required here** | **D3** and **D4** show three icon buttons — add, tag, link — inside the Name cell. On **D4** the title is short and the cluster still sits at the column's right end, so it is anchored to the column, not to the text. A `…` sits at the far right of the same row, in the same horizontal position as the header row's trailing `+` — the trailing utility track carries the header's add-column affordance and the row's overflow menu |
| C24 | The column header row is the **group's first child**, and it renders for a group with **zero rows** | confirmed | **D4**'s `COMPLETED` group reads a count of zero and renders the full header row and its `+ Add Task` with nothing between them. On **D1**, **D3** and **D4** the order inside every group is header row, then rows, then create row, and **no view-level header row exists above the first group on any of the four**. The consequence is a constraint, not a decoration: header emission cannot be driven off whether a group has rows |
| C25 | The group count numeral counts the group's **top-level rows**, not its nested descendants | confirmed on two primary screens | **D4**: five groups reading 2, 4, 2, 1 and 0, each equal to the rows rendered directly under it, with one collapsed four-subtask parent counting as **one**. **D1**: a group reading 1 contains one top-level row and five nested rows beneath it. Refines C3. We have no subtask model, so for us the two counts coincide — recorded so the coincidence is not mistaken for a design choice |
| C26 | The group header's value treatment **follows the grouped field**, not a fixed status pill | confirmed | **D2**, **D3** and **D4** group by status and render a coloured pill with a glyph. **D1** groups by a non-status field and renders a **neutral chip with no glyph**, and its two visible group values carry the **same** neutral treatment. So "two group values differ in pill colour" is a property of a colour-bearing group field, not of grouping — which is why `AC-15` is now scoped and `AC-27` carries the load |
| C27 | The chip-versus-plain-text split is a property of the **column**, not of the value | confirmed inside a single row | **D3** renders the same string as plain text in the `Feature` column and as a bordered chip in the `App` column, on one row. Across **D1-D4** the multi-value columns (`App`, `Scope`, `Lists`) chip and the single-valued reference column does not chip at all. On **D2**, `Lists` cells additionally carry a trailing `+` add affordance beside their chips at rest, which is a different glyph from the `+N` overflow chip in the same column and must not be counted as one |
| C28 | Inline-after-title tags and a dedicated chip column **coexist in one view** | confirmed; **resolves C11** | **D2** renders small chips immediately after the task name inside the Name cell on several rows, in the same view that renders `App` and `Lists` as chip columns. The two placements C11 recorded as layout-dependent alternatives are simply both real, simultaneously. Nothing in `AC-21` changes; C11's framing does |
| C29 | The select pill is **uniform width within its column**, not text-hugging | confirmed on three primary screens | **D1**, **D3** and **D4**: every `Effort` pill occupies the same horizontal extent regardless of label length, inset from both column edges, chevron at the pill's right edge, and the unset dash sitting at the pill's left edge rather than centred. This is the evidence ADR-003 left open for phase 002. It does **not** decide our geometry — the hierarchy argument in ADR-003 still stands against it — but the option is now measured rather than inferred |
| C30 | The grid is **content-width**: the trailing `+` follows the last column, not the viewport edge | confirmed on three primary screens | On **D1**, **D3** and **D4** the trailing `+` sits immediately right of the last rendered column and a substantial width is left empty beyond it. On **D2**, which carries thirteen columns, it lands near the edge only because the columns fill the width. Columns do not stretch to fill |
| C31 | Cell and header text **truncates rather than wraps**; no row occupies two text lines | confirmed on all four | `Custom Ta…` is truncated in every header row on **D1-D4**, and **D2** truncates a long task name mid-word. No row on any of the four wraps. This is the **opposite** of our F29 wrapping behaviour, which FR-17 keeps deliberately. Recorded so the divergence is a decision rather than an oversight |
| C32 | Near dates render relatively and distant dates numerically, on a **per-value** recency rule | confirmed | **D1** and **D4** show `Tue`, `Tomorrow`, `Fri` and `3 days ago` beside `9/14/26` and `10/2/26`. **D2**'s sorted `Date created` column mixes `4 days ago` with `8/13/26` **within one column**, so the switch is per value, not a per-column setting. Overdue renders red on **D1** and **D4**. Refines C9. Observed, not required here |
| C33 | A checkbox field renders as a **literal checkbox in the cell** | confirmed; observed, out of scope | **D2** and **D3** carry a `Hide` column of unchecked outline squares, and **D2** shows filled checked ones. We have no such field type in scope; recorded because a reviewer comparing our list to these screens will see it |
| C34 | A filtered view carries a **footer line naming that rows are hidden** | confirmed; observed, out of scope | **D4** ends with a centred `Some tasks are hidden.` below the last group. This is a filter-state disclosure, not a calculation row, and must not be confused with C15 |
| C35 | The group header carries an **overflow menu and an add affordance beside its count** | confirmed as present; **its trigger is UNKNOWN** | **D3**'s single group and **D4**'s first group each show a `…` and a `+` after the count. The other four groups on **D4** show neither. Four static captures cannot say whether the trigger is hover, focus, or containing the revealed row |

### 4.2.1 What the four desktop screens cannot establish

The reason this subsection exists is C18: a confident, cited, backwards conclusion drawn from a
sample that could not have contained the thing it was used to rule out. Four screens are more
evidence, not complete evidence. Each item below is a state or a context in which the relevant
behaviour **would not necessarily appear**, so its absence carries no information.

| # | Not established | Why the four screens cannot address it | What still holds |
|---|---|---|---|
| U1 | Any **selected** row state | Every revealed checkbox on D3 and D4 is empty and no bulk bar is docked. A selection was never made | C14 and the selected half of FR-13 stay Mobbin-sourced |
| U2 | Any **edit** state | No popover is open, no editor holds focus, no cell accepts input on any of the four | C7 stays Mobbin-sourced. The ban on edit-mode-chrome criteria in `acceptance-criteria.md` §2 is unaffected and still binding |
| U3 | A **collapsed** group | Every group chevron on all four points down | Whether ClickUp keeps the per-group header row when a group collapses is unobserved. `AC-02`'s negative control collapses a group; that control tests **our** harness distinguishability and does not depend on ClickUp's answer, but the two must not be confused |
| U4 | **Sticky** header behaviour | A static capture cannot show scroll | F22 is untouched |
| U5 | **Narrow and phone** widths | All four are wide desktop | `AC-21`'s narrow-width overflow rule, `AC-24`'s touch targets and every phase 004 criterion are untouched |
| U6 | **Light theme**, and the horizontal row divider | All four are dark theme at a capture scale that does not resolve a hairline | C17's divider half still rests on Mobbin. Saying it is absent would be the C18 error again |
| U7 | **Per-group calculation numerals** | A per-column calculation renders only when configured, and none of these views configured one | C15 unchanged, Mobbin-sourced. **Nine primary and secondary screens showing no numeral is not evidence of absence** |
| U8 | ClickUp's **single-rule** sort behaviour | All five primary screens carry the same three-rule sort | C18b's ordinal-suppression question stays open. Ours suppresses at one rule; theirs is unknown |
| U9 | Whether a **sort chip and a header badge coexist** | The Mobbin set has the chip, the primary set has the badge, and no capture has both | C18a stays "not confirmed". Five screens without a sort chip make the reading likelier, not proven |
| U10 | What the row's **leading glyph encodes** | It varies in shape and in hue across rows and across groups in ways four screens cannot attribute to task type, status, or both — two shapes appear inside one status group on D3, while hue tracks the group on D4 | **UNKNOWN, and it matters**: FR-13 allocates that slot, so the slot's occupant is a design decision we are making, not one we are copying |
| U11 | Whether the truncated Priority label on D2 and D3 is a **hover reflow or a width effect** | Exactly one row per screen shows it, beside a small additional element too small to identify | C8's caution stands either way: we do not reproduce a degradation that leaves hue as the only signal |
| U12 | Any **numeric value** — spacing, radius, hue, duration, density | Forbidden by the licence boundary below, independently of whether the capture scale would allow it | Every number comes from the token scale at `styles.css:32` onward. See FR-18, FR-20, AC-20, NFR-07 |

**Licence note — what "cite it" permits.** This plugin is MIT and all three sources are third-party
product surfaces. The four desktop captures live at
[`../context/clickup/list-view/`](../context/clickup/list-view/) and are cited by path only: not
moved, not cropped, not re-encoded, not duplicated into this packet, not shipped in the plugin, not
converted into an asset. `reference-clickup-list-operator.png` is held in this packet under the same
terms. Every row above describes an **interaction model and a shape class** — filled versus outlined,
capsule versus rounded rectangle, hugging versus uniform-width, reserved versus inserted space,
truncating versus wrapping. No measured pixel, radius, hex or duration from any source appears
anywhere in this packet, and none may. Relative facts of the form "the title sits at the same
horizontal position in both states" are structural observations, not measurements, and are the only
positional claims permitted. FR-18 and AC-20 already require every number to come from the token
scale at `styles.css:32` onward; that is where the values come from, and the reference only decides
*which shape* the token is asked to produce.

### 4.3 Functional requirements

Each requirement names what it derives from, so a reviewer can reject it at the source.

| ID | Requirement | Source | Priority |
|---|---|---|---|
| FR-01 | The list renders a column header row containing one header per visible column, using the same column resolution the table uses | F1, C4 | P0 |
| FR-02 | The header row repeats once per group, as the group's first child, above that group's rows. It renders for a group with **zero rows**, so header emission is driven by the group's existence and never by its row count. No view-level header row exists outside the groups | C4, C24 | P0 |
| FR-03 | Clicking a column header sorts by that column; shift-click appends a rule. The same handler serves table and list | F2 | P0 |
| FR-03a | A sorted header carries a direction-plus-ordinal indicator, emitted by the same header build path, so it appears on **every** repetition of the header row rather than only the first | F3, C18 | P0 |
| FR-04 | The header carries the column menu, the resize handle and drag-to-reorder on pointer devices, from the same controller the table uses | F4, F5, F6 | P0 |
| FR-05 | A trailing add-column affordance closes the header row | F7, C6 | P1 |
| FR-06 | Cells edit in place through the table's cell pipeline, so `files` and `rollup` render and every editor behaves identically in both views | F20, C7 | P0 |
| FR-07 | Cell range selection, fill, clipboard and keyboard grid navigation work in the list. Every `viewType === "table"` guard that gates them is replaced by a grid-view predicate | F9-F13 | P0 |
| FR-08 | A per-column calculation footer renders per group and for the whole view | F8, C15 | P1 |
| FR-09 | Multi-field grouping renders in the list with the same depth model the table uses | F17 | P1 |
| FR-10 | Row density applies to the list and is offered in the view config panel | F18 | P2 |
| FR-11 | The group header shows the group value in **the treatment its own field carries**, with a count numeral beside it. A colour-bearing group field yields a coloured pill; a field with no per-option colours yields a neutral chip, and two such groups legitimately look alike | C2, C3, C26 | P0 |
| FR-11a | The group pill carries a second, non-colour signal — a glyph or the label itself — so the group is identifiable without colour vision | C2 | P1 |
| FR-12 | Each group ends with a create-entry row aligned under the first column, and it is styled | F25, C5 | P0 |
| FR-13 | The row reserves a **leading gutter** that is empty at rest and holds the selection checkbox on hover, focus or selection. It is not a separate column, it does not replace or move the record icon, and revealing it must not shift the row's chevron, icon or title. The group's collapse toggle shares the same gutter band | C22, ADR-004 | P1 |
| FR-14 | Grouped and total select-all checkboxes resync after any selection change from any source | F19 | P0 |
| FR-15 | Rows are flat and full-bleed with a single hairline divider; no card border, no inter-row gap | C17 | P0 |
| FR-16 | An empty cell renders a faint type-appropriate placeholder rather than empty space, when `showEmptyFields` is on | C16 | P2 |
| FR-17 | The list keeps its distinctive reading behaviours — row-click opens the record detail panel, roving-tabindex keyboard model, stacked file titles, wrapping fields — as configuration, not as casualties | F26-F29 | P0 |
| FR-18 | Every value introduced comes from the token scale already declared at `styles.css:32` onward. No new raw colour, spacing or duration literal | house rule | P0 |
| FR-19 | External row patching and interaction-snapshot restore extend to the list | F15, F16 | P2 |
| FR-20 | Nothing in `external/anytype` or `external/appflowy` is copied. No ClickUp asset, CSS value or token scale is reproduced, from either reference source | licence | P0 |
| FR-21 | A `select` or `status` cell advertises that it is editable at rest: the filled pill carries an inline dropdown affordance. The pill's colour is the option's configured colour and is never derived from the value itself | C19, C19a | P1 |
| FR-22 | Multi-value reference columns render as outlined chips, visually distinct from the filled single-value pill, so the row separates "one categorical value" from "several references" without reading the text. The treatment is a property of the **column**, never of the value: the same string in two columns may render two ways | C21, C27 | P2 |

---

## 5. SUCCESS CRITERIA

Criteria live in [`acceptance-criteria.md`](acceptance-criteria.md) and are checked off in
[`checklist.md`](checklist.md). Every one obeys the four rules in `architecture-findings.md` §9:
measured on the real renderer at the production mount point, expressed as a number or a hit test
with a threshold, demonstrated failing on the current tree with the failing number recorded, and
distinguishable by the harness — deleting the subject must move an asserted number.

The packet succeeds when a user opening a list view sees ClickUp's reading experience and can do
everything they can do in a table, and when no criterion passed without its prior failure on record.

---

## 6. RISKS & DEPENDENCIES

| Risk | Why it bites here | Mitigation |
|---|---|---|
| A phase passes and nothing changes on device | The exact failure of release 1.3.1. Here it is sharpened: `db-list-group-new` and `db-list-row-checkbox` have zero CSS rules, so a criterion phrased over `.db-list-row` — which has 18 — passes while both affordances stay unstyled | Phase 000 produces every failing number before any styling exists. Chrome criteria name the specific affordance and each carries a negative control |
| "The element exists" masquerading as a criterion | A `<th>` can render with `aria-sort` while clicking it does nothing, because the list's render path discards and rebuilds | Criteria assert the sort *order of rendered row paths* after a click, never the presence of a header |
| The `styles.css` lane | One serialized lane; ~196 captures fingerprint the file. Two other phases in `005` also queue for it | Take once at the start of the structure phase, release once after the chrome phase, with a full recapture and a named human sign-off |
| Guard rename blast radius | Replacing `viewType === "table"` with a grid predicate changes behaviour for board, gallery, calendar, timeline and chart if the predicate is wrong | Each of the 11 guards is enumerated in `plan.md` §3 with its intended predicate before any edit, and each has a regression check |
| Two implementations drift apart again | Route A guarantees it. Route B removes the possibility | ADR-001, decided: Route B |
| `vitest` has no DOM | Every DOM claim written as a unit test is worthless | All DOM assertions go through `verify-placement.mjs` against system Chrome |
| Losing the list's reason to exist | A grid presentation mode can quietly become the table | FR-17 is P0 and has its own criteria |

### Dependencies

- **ADR-001** is answered — Route B — and blocks nothing. What it now obliges is a check per
  view-semantic guard, driving the production render, before phase 001 converts any guard.
- **`tools/lane/css-lane.json`** must be free before the structure phase starts.
- **`verify-placement.mjs`** must be able to render a list view before any criterion can be measured.
  It cannot today.

---

## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement | Threshold | How measured |
|---|---|---|---|
| NFR-01 | Render time for a 2,000-row list must not regress against the table's measured time for the same data | within 20 percent | `npm run bench` |
| NFR-02 | The body is built detached and attached once, as the table already does, so row insertion does not go quadratic | one `appendChild` of the body per render | source assertion plus the bench above |
| NFR-03 | Contrast: every text pair 4.5:1; any border that alone identifies a control 3:1 | WCAG 1.4.3 and 1.4.11 | computed-style probe in the browser harness, both themes |
| NFR-04 | Touch targets on phone are at least 44 by 44 CSS px, including the group toggle and the checkbox | 44px | harness at phone width |
| NFR-05 | Focus is visible on every interactive element, as a `box-shadow` ring rather than `outline` | present and visible | harness |
| NFR-06 | Motion sits in the declared bands: 120-180ms for press and hover, 180-260ms for a group collapse | within band | source assertion against the token scale |
| NFR-07 | No new value off the existing token scale | zero | diff review against `styles.css:32` onward |

---

## 8. EDGE CASES

| Case | Expected |
|---|---|
| No columns visible except the title | Header row renders with the title column and the trailing add affordance only; no empty track |
| A column is hidden while a cell in it is selected | Selection collapses to the nearest surviving cell, as the table does |
| Group is collapsed while a cell inside it is selected | Selection clears; focus returns to the group toggle |
| A group has zero rows | Empty-group card renders, the header row still renders, the create row still renders. **Corroborated twice, and now a hard constraint:** the operator screenshot and D4 both show a `COMPLETED 0` group carrying a full column header row and its own `+ Add Task` with no rows between them. Header emission must therefore key off the group's existence, never its row count — C24, AC-30 |
| `showEmptyFields` is off and a row has no value for a column | The cell is empty but the **track is kept**, so columns stay aligned. This is the bug `list-renderer.ts:355` already guards against; the grid must not reintroduce it |
| A wrapping column (`col.wrap`) sits beside fixed columns | Track is `max-content`; the row grows and neighbours do not shift |
| Read-only view | No checkbox, no create row, no add-column, no resize. Header still sorts |
| Phone width | Column headers, resize and drag-to-reorder are absent by the existing touch predicate; sorting stays reachable through the toolbar |
| Manual order is active and the user clicks a header to sort | Same behaviour as the table: explicit sort disables manual reorder (`isExplicitlySorted`) |
| Two groups, one collapsed, external row change | Patch path either applies to both or refuses; it must not apply to one |

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Value | Note |
|---|---|---|
| Estimated LOC | ~2,500 under Route B; ~4,000 under Route A | Route A duplicates the table renderer's header, footer and group machinery |
| Files touched | ~22 | Renderers, the view controller, the config panel, `styles.css`, harness and stories |
| Architectural | yes | A shared grid contract between two views is an architecture decision, recorded as ADR-001 |
| Risk | high | Eleven guards, one serialized stylesheet lane, and a documented history of gates passing with no visible change |
| Level score | 80/100, confidence 94 percent | `recommend-level.sh --loc 2500 --files 22 --architectural --api` |
| Phase score | 40/50 against a threshold of 25 | Suggested 3 phases; this packet uses 5, justified in `plan.md` §4 |

---

## 10. RISK MATRIX

| # | Risk | Likelihood | Impact | Owner action |
|---|---|---|---|---|
| R1 | Chrome phase passes, device unchanged | high | high | Failing numbers recorded in phase 000; negative control per criterion |
| R2 | Guard rename breaks a non-list view | medium | high | Enumerate all 11 with intended predicates before editing |
| R3 | Lane contention with `005` | medium | medium | Single take, single release, sequenced with the other packet |
| R4 | A view-semantic guard is converted by a sweep and nothing catches it | medium | high | G8 and G11 each get a check that drives the production render, built before any guard is touched. `tsc` and the unit suite cannot see either failure |
| R5 | Bench regression on large lists | medium | medium | NFR-01 gate before the lane is released |
| R6 | List loses its reading identity | medium | high | FR-17 is P0 with its own criteria |

---

## 11. USER STORIES

- **As someone triaging work**, I want rows grouped by status with a count, so I can see where the
  work is piling up without opening anything.
- **As someone editing a plan**, I want to change a value in place and tab to the next cell, so I do
  not open a panel per field.
- **As someone comparing rows**, I want aligned columns with a header I can sort, so scanning a
  column is possible at all.
- **As someone adding work**, I want an add affordance inside the group I am looking at, so the new
  row lands with the right status already set.

---

## 12. OPEN QUESTIONS

**Q3 — The list's reading identity.** Under Route B the list is structurally a grid. Should
row-click-opens-detail, the roving-tabindex model, stacked file titles and wrapping fields stay on by
default in list view (recommended), or become opt-in settings? *Operator decision.*

**Q4 — Subtasks. Answered: out of scope.** The operator's words: *"No need for subtask."*

This plugin has no subtask model, and one is not being built. The expand chevron and its count stay
unimplemented. Record the consequence honestly rather than quietly: they are visible on a row of the
operator's own reference and on four more of the supplied captures, so this is a **visible difference
from the screen the operator pointed at**, not an omission nobody would notice. A reviewer comparing
the built list against the reference will find it missing, and the answer is that it was declined on
purpose — there is no underlying model to render, and building one would turn a view refactor into a
data-model feature with its own spec.

No phase should reserve a slot, an affordance, or a row-grammar column for it. If subtasks ever
arrive they bring their own packet, and the row grammar is re-cut then.

### Answered

**Q1 — Route. Answered: Route B.** The list becomes a presentation mode of the grid renderer. The
operator chose it on the argument that Route A is complete the day it ships and incomplete by the
next table feature. Full argument, costs and the obligation it carries in
[`decision-record.md`](decision-record.md) ADR-001.

**Q7 — Does the checkbox replace the row icon? Answered: no, and the packet said it did.** Four
desktop screens show a reserved leading gutter holding a drag grip and a checkbox, with the record
glyph still present and the row's content not shifting. C13 is contradicted, C22 replaces it, FR-13
is rewritten and AC-16's threshold was provably wrong. ADR-004.

**Q2 — The ordinal sort indicator. Answered: it is ClickUp's, and the earlier recommendation was
backwards.** The operator screenshot shows `Name ↑3`, `Priority ↓2` and `#  ↑1` on the column
headers. The previous answer — keep our form and drop the ClickUp attribution — rested on twenty
Mobbin screens not showing an arrow, which was absence of evidence. The attribution stands, the
requirement stands, and only the container differs. C18, C18a, C18b and ADR-002.

**Q5 — The reference screenshot. Answered: it exists**, at
[`reference-clickup-list-operator.png`](reference-clickup-list-operator.png) in this packet. §4.2 is
re-verified against it and now names it the primary source. The earlier search was honest and simply
looked before the file was placed.

**Q6 — Effort field. Answered: it is real.** An `Effort` column of filled coloured pills with an
inline chevron, over rows at rest. It is a single-select cell, not an edit-mode artifact. C19, C19a
and ADR-003. One part of the operator's reading did not survive: the colours are per-option and
categorical, not an ascending magnitude ramp.

---

## RELATED DOCUMENTS

- [`plan.md`](plan.md) — phase decomposition, the ordering argument, gates and the lane protocol.
- [`tasks.md`](tasks.md) — the task breakdown.
- [`acceptance-criteria.md`](acceptance-criteria.md) — criteria with provenance.
- [`checklist.md`](checklist.md) — criteria with their failing numbers.
- [`decision-record.md`](decision-record.md) — ADR-001 the route, ADR-002 the sort indicator, ADR-003
  the select pill, ADR-004 the leading gutter.
- [`../context/clickup/list-view/`](../context/clickup/list-view/) —
  `clickup-desktop-list-view-1.png` through `-4.png`, the four desktop captures cited as D1-D4.
  Primary source for §4.2; referenced by path only, never moved, cropped, re-encoded or duplicated.
- [`reference-clickup-list-operator.png`](reference-clickup-list-operator.png) — the operator's first
  capture. Primary source for §4.2; evidence only, nothing is copied from it.
- [`../005-component-surface-system/architecture-findings.md`](../005-component-surface-system/architecture-findings.md)
  — criteria doctrine, token root, harness blindnesses.
