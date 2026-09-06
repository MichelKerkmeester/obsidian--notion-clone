---
title: "Deep Research Synthesis — Notion's table view against the note-database table surface"
description: "Consolidated fan-out synthesis (1 lineage, 5 iterations): which Notion table-view patterns from the screen digest would refine the plugin's table, the concrete code/CSS change and measurable threshold for each, what we already have, what conflicts with a landed Anytype ruling, what needs a device-only check, and a ranked child-phase remediation plan with red-first checks."
specFolder: specs/005-component-surface-system/053-toolbar-and-view-controls
loopType: research
lineages: 1
iterations: 5
stopReason: maxIterationsReached
stopPolicy: max-iterations
---

# Deep Research Synthesis — Notion's table view against the note-database table surface

## 1. Executive Summary

Notion's table view is not far ahead of ours. Across five iterations against the 98-screen digest,
the read produced **one structural adoption worth building (per-column Freeze)**, **five to six
small quality-of-life additions**, **thirteen behaviours already at or ahead of parity**, **zero
conflicts with a landed Anytype ruling**, and **one correction to the digest itself**.

- The single highest-impact Notion pattern absent from our tree is **per-column Freeze**
  (`74fe28d3`, `039351aa`; digest P7). `column-menu.ts:38-63` exposes no such action and the
  digest's own `freeze|frozen` grep across `column-menu.ts`, `types.ts`, `styles.css` returns
  nothing (digest §4 P7).
- The **most user-visible defect on this surface is ours, not a Notion gap**: wrap-off still draws
  tall rows (`goal.md` completion criterion, T016, leg `worktrees/160-fix-053-wrap-off-rows`).
  Notion's two-level wrap control (`74fe28d3`, `039351aa` per-column; `d3acf726` view-level)
  *confirms* the shape we already landed in ADR-004 / `cell-renderer.ts:208-211`, so the work is a
  bug fix at the escaping element, not a re-design.
- **The digest is wrong on one row.** §4 P9 claims conditional row colour has "no match" here. It
  ships: `applyConditionalFormat` sets `--db-conditional-format-bg` on the `tr`
  (`src/data/conditional-formatting.ts:168-206`; wired at `table-renderer.ts:85`, `:866`, `:911`)
  and `tr.db-conditional-format > td` paints it (`styles.css:1317-1319`). The digest's grep pattern
  (`conditional.color|rowColor|rowBackground`) could not match the symbol names in use.
- **The digest's own open question §6 Q1 is closed**: multi-select chips *do* render inline
  (`cell-renderer.ts:470-498`; measurer `column-width.ts:118-123`), matching `21d71e5f`.
- **No candidate contradicts a landed operator ruling.** The table is governed by the *item-wise
  adoption* model (`050` ADR-006; `roadmap.md` §6A 2026-09-05 ~22:45 kept the table ours while
  board and calendar went Anytype 1:1), so each Notion item is argued on its own merits. Four
  tensions are named in §9 and dispositioned; none is an override.
- The recommended vehicle is a **new child phase under `005`** (sibling of `056`/`057`), not an
  amendment to `053` — `053` D4 closed its table view.

## 2. Research Question and Decision Standard

**Question.** How should Notion's table-view UI — header row, column types and icons, cell
rendering per property type, row hover and selection, inline editing, wrap, row height, footer
calculations, add row, column resize and reorder, frozen title column, phone table — refine the
note-database plugin's table surface?

**Decision standard.** A Notion pattern is adopted only when all four hold:

1. It is evidenced by a screen id in `notion-screens-digest.md` (the **only** admissible source of
   Notion fact for this loop; no image file was opened at any point).
2. Our tree's current behaviour is established at `file:line`, giving a **red-first** value the
   change must move.
3. It does not contradict a landed ruling (`053` ADR-001..006, `050` ADR-003/005/006/007,
   `roadmap.md` §6A). Where Notion and a ruling disagree, the conflict is **named and proposed**,
   never silently resolved.
4. It carries a **measurable threshold** an assertion can close on.

Anytype parity is the default for these surfaces (`051` ADR-007, `056`, `057`); Notion refinements
are strictly additive.

## 3. Scope, Boundaries, and Code Surface

**Notion source (exclusive).** `notion-screens-digest.md` — §2 (98 screen ids), §3 (patterns
P1–P12), §4 (divergence table), §5 (Anytype cross-read), §6 (open questions). Written by an
image-capable analyst from the Mobbin captures. Structural limits carried into every finding below:
captures are thumbnail-scale (ratios over absolute px), **hover state is structurally unobservable**
(§6 Q5), and **zero of 102 screens are dark theme** (preamble, §6 Q6).

**Our surface (bounded read list).**

| File | What the loop established |
|---|---|
| `src/views/table-renderer.ts` | header `renderHeader` :606-667 (type icon :633, label :634, sort ordinal :635-646); add-column `th` :649-663; selection col :567-569; record-icon col :571-573; add-column width :589-591; rows :851-916; footer guard :801-812; new-row :975-984; drag/reorder :995-1103; windowing :1229-1312; conditional-format wiring :85, :866, :911 |
| `src/views/cell-renderer.ts` | `renderCell` :208-392; wrap resolution :208-211; title cell :216-239; empty value :263-284; number stamp :318-321, :419; status/select badge :453-468; multi-select chips :470-498; date :537-553; tap/dblclick split :555-606; option editor `initialSearch` :916-927; single-editor + serial commit :143-146, :14, :193 |
| `src/views/column-menu.ts` | `ColumnMenuActions` :38-63; menu :100-249 (wrap row :194-213, width :219-227, delete-disabled-for-title :241); type submenu :255-288 grouped Basic/Options/Advanced :261-265 |
| `src/views/column-width.ts` | auto-fit :71-101; multi-select measurer :118-123; presets/min/max :310-316; adjuster :347-529; phone sheet :511-525 |
| `src/views/table-record-peek.ts` | open affordance :86-114 (touch branch :102-104); record-open routing :52-60; touch→sheet :179-182; property rows :341-380; empty value :358-360 |
| `styles.css` `.db-table` blocks | sticky `thead` :5425-5429; `th` :5450-5464, drag cursor :5469-5471; header hover :5534-5537; add-column :5623-5629; resize handle :5656-5664; `td` clip :5672-5679; `td.db-cell-wrap` :5682-5690; row density :5692-5711; flex-wrap opt-out :5736-5741; cell hover :6782-6784; empty value :6766-6771; `td`/`th` borders :5417-5418; colgroup widths :5407-5411; conditional tint :1299-1303, :1317-1319; footer phone floor :8482-8486; phone table :20914-20944 |
| Rulings | `053` `goal.md`/`decision-record.md`/`tasks.md`; `050` `goal.md`/`decision-record.md`; `design-system.md` §10, §12; `roadmap.md` §6A |

**Two extra files were opened**, each because a specific finding could not be closed without one:
`src/views/record-surface/cell-editor-date.ts` (546 lines, for F10) and
`src/data/conditional-formatting.ts` + its CSS block (for F25). Both are within the "one more
source file if a finding requires it" allowance.

**Write boundary honoured.** No file under `src/`, `styles.css`, or `tools/` was created or
modified. All writes are research artifacts under this packet.

## 4. Method and Convergence Record

Single fan-out lineage `glm-devpass-table` (`cli-opencode`, `llmgateway/glm-5.3-flash`,
reasoningEffort `max`), concurrency 1, `--stop-policy=max-iterations`, 5 iterations, no early stop.
Convergence threshold 0.05 was treated as **telemetry only** per the stop policy; the loop widened
its angle each pass rather than synthesizing early.

| N | Focus | newInfoRatio | Yield |
|---|---|---|---|
| 1 | Header row, column-header menu, column types & icons (P1, P2) | 0.90 | F1–F7: 2 improvements (freeze, type set), 4 parity confirmations |
| 2 | Cell rendering per property type + inline editing + empty values (P3) | 0.60 | F8–F13: closes digest §6 Q1; 2 improvements (end-range, peek Empty); 1 loose end |
| 3 | Row chrome: footer, add-row, hover/selection, expand, phone (P4/P8/P12) | 0.55 | F14–F21: 1 improvement (noun label), 1 device-only check defined, 5 guard confirmations |
| 4 | Resize/reorder, freeze placement, visibility panel, view toggles, conditional colour (P5–P10) | 0.50 | F22–F26: **digest correction (P9)**, 2 small additives, freeze scoped desktop-only |
| 5 | Adjudication (Q4), device-only checks (Q5), remediation plan (Q6) | 0.30 | Q4 framework, dark-theme check, 5-phase plan |

Registry: 26 merged key findings (`findings-registry.json`, coerced from the lineage's `findings`
key). Source diversity: digest + 7 source files + 4 ruling documents. **No finding rests on a single
weak source**: every Notion claim carries a screen id, every code claim carries `file:line`, and
second-hand line numbers are flagged (E3) rather than trusted.

## 5. Q1 — Notion patterns that would improve this surface, ranked by user impact

1. **Per-column Freeze** — `74fe28d3`, `039351aa`; digest P7. Absent here (`column-menu.ts:38-63`;
   digest §4 P7 grep = 0). Wide tables are exactly the case our fixed desktop colgroup widths
   (`styles.css:5407-5411`) create.
2. **The committed wrap-off fix** — ours, not Notion's, but Notion's P8 read (`74fe28d3`,
   `d3acf726`) confirms our landed two-level control (`cell-renderer.ts:208-211`) is the right
   shape, so the fix belongs purely at the escaping element.
3. **Date End-ranges** — `bd482935`. Our picker has no end date (`cell-editor-date.ts:71-120`) and
   `renderDate` formats one value (`cell-renderer.ts:537-553`).
4. **Column-type coverage** — Person/URL/Email/Phone + audit types (`af7a18b0`, `7f2dbda0`,
   `3b3c3c26`) vs our 13-type union (digest §4 P2). Icon/label scaffolding first; data types
   deferred.
5. **Resize-handle discoverability** — Notion's grip is visible on selection (`d53b3912`); our 4px
   strip paints nothing until hover (`styles.css:5656-5664`).
6. **"Show vertical lines" view switch** — `d3acf726`. Our `td`/`th` borders are unconditional
   (`styles.css:5417-5418`).
7. **Add-row noun label** — `19745d87` (`+ New page`) vs `e33466b4` (`+ New task`); ours is a fixed
   `t("toolbar.new")` (`table-renderer.ts:982`).
8. **"Empty" placeholder in the peek** — `050083af`, page-view-only. Our *table cells* already match
   Notion's blank convention (`cell-renderer.ts:263-264`; `styles.css:6766-6771`); only the docked
   peek renders an empty visible property as `""` (`table-record-peek.ts:358-360`).

## 6. Q2 — Concrete change and measurable threshold per candidate

| # | Change (file → function/rule → value) | Threshold (green) | Red-first (today) |
|---|---|---|---|
| 1 | `src/data/types.ts` `ViewConfig.frozenColumnKeys?: string[]`; `freezeColumn(col, frozen)` on `ColumnMenuActions` (`column-menu.ts:38-63`) + menu row beside the wrap row (`:194-213`); sticky `th/td` CSS, `left` = sum of preceding frozen widths, divider shadow gated on `.is-scrolled-x`; **desktop-only** (phone auto layout has no overflow, `styles.css:20914-20921`) | Frozen `th` computes `position: sticky` with left offset = sum of preceding widths ±1px in the render harness; per-column checked state; config serialise/parse round-trip; unfreeze negative control collapses the offset | 0 `freeze` matches across `column-menu.ts` + `styles.css` (digest §4 P7) |
| 2 | Leg `worktrees/160-fix-053-wrap-off-rows` at the escaping element — **producer deliberately unnamed** (`goal.md`: "that is the fix leg's first job") | Every row = `--db-row-height` for its density with wrap off; long-text column ellipsised; clip-removal negative control goes red | Operator's measured 36/130/300px report (`goal.md`) |
| 3 | Optional end value on the date; "End date" row in `cell-editor-date.ts`; range form in `formatDateValueDisplay` | Both ends render in one cell; End-date row present in the picker | No end/range concept anywhere in the 546-line read; `cell-renderer.ts:537-553` formats one value |
| 4 | Type-picker rows + glyphs for the 5 missing types (`column-menu.ts:255-288`); audit types ride `row.computed` (`cell-renderer.ts:214-215`) | 13 → 18 rows, one glyph each, verified in the type popover | 13 types (digest §4 P2) |
| 5 | 2px token-coloured line on `th:hover` at the resize-handle rule (`styles.css:5656-5664`) | Handle's computed background changes on `th:hover` | No background declaration on the handle |
| 6 | `ViewConfig` switch → container class dropping `border-right` on `td` (`styles.css:5417`) | Switch off ⇒ no `td` computes a right border | Borders unconditional |
| 7 | `table-renderer.ts:982` → `+ New {noun}`; i18n key × 3 locales | Noun renders where derivable; falls back to today's string otherwise | Fixed `t("toolbar.new")` |
| 8 | `table-record-peek.ts:358-360` empty visible property → muted literal | Placeholder renders in the peek; **table cells unchanged by design** | Renders `""` |

**Binding colour guardrail on 1, 5, 6.** Every new tint, line, or grip colour must derive from our
own token scale (`design-system.md` §12 — "Notion is the visual target and is not a source at all")
and clear the `050` ADR-005 bar (WCAG 1.4.11 3:1 non-text, 1.4.3 4.5:1 text). Notion supplies no
colours to copy: every capture is light-theme.

## 7. Q3 — Notion behaviours we already have (convert to regression guards)

| # | Behaviour | Our evidence | Notion evidence |
|---|---|---|---|
| G1 | Header row: type icon + label + menu target, sticky | `table-renderer.ts:632-647`; `styles.css:5425-5429` | P1 — `19745d87`, `35c64a84`, `3b3c3c26` |
| G2 | **Ahead**: in-header sort indicator with multi-sort ordinal + `aria-sort` | `table-renderer.ts:635-646` | Absent in captures (`3b3c3c26`, `21d71e5f`); Notion puts state on the chip row (`7e310dca`) |
| G3 | Add-column `+` cell | `table-renderer.ts:649-663`, width `:589-591`; `styles.css:5407-5411`, `:5623-5629` | `35c64a84`, `d9d61160` |
| G4 | Per-column **Calculate footer**, hidden at zero rows, 44px phone floor | `table-renderer.ts:801-812`; `styles.css:8482-8486`; ADR-005 | P4 — `6055725d`, `101392c7`, `20a95974`. The digest's own "closest parity" call |
| G5 | **Multi-select chips inline** — closes digest §6 Q1 | `cell-renderer.ts:470-498`; measurer `column-width.ts:118-123` (badges + 4px gaps + 20, cap 560px) | P3 — `21d71e5f` |
| G6 | **Ahead**: per-chip inline remove `×` | `cell-renderer.ts:480-496` | No in-cell chip removal visible (`21d71e5f`, `8e8e4249`) — *inference* |
| G7 | Status/Select pill recolours **per option**, not per column | `cell-renderer.ts:453-468` | `8d6dcf3b`, `6673816d` |
| G8 | Empty **table cells** render blank | `cell-renderer.ts:263-264`; `styles.css:6766-6771` | P3 — Notion's table cells blank; "Empty" is page-view-only (`050083af`) |
| G9 | Property visibility panel (search, shown/hide-all, grip, icon, eye) | `column-manager-renderer.ts:1-12` (digest §4 P5: "Matches; no gap") | P5 — `9867cb76`, `b69c8a59`, `35c32af9` |
| G10 | **Conditional row colour** — *digest §4 P9 corrected* | `data/conditional-formatting.ts:168-206`; wiring `table-renderer.ts:85/866/911`; paint `styles.css:1317-1319`, base `:1299-1303` | P9 — `142cef4e`, `3b3c3c26`, opt-in per `b184ec4c` |
| G11 | Phone bottom sheets / inline docks for pickers | `column-width.ts:347-353`, `:511-525`; `cell-editor-date.ts:108-120`; `053` D5 constraints from `044`/`048` | P12 — `8d6dcf3b`, `8e8e4249`, `a5ffc340` |
| G12 | View-level display toggles: **4 of 6** — record icon, wrap, load limit, record-open target | `table-renderer.ts:575-577`; ADR-004; `055` AC-011 (`resolveEmbeddedTablePage`/`renderTableLoadMoreRow`, 44px phone / 30px desktop per §6A ~04:45); `table-record-peek.ts:52-60` | P10 — `d3acf726` |
| G13 | **Ahead**: select-all header checkbox, per-row range selection, group-divider indeterminate state | `table-renderer.ts:611-619`, `:724-736`, `:875-895`; long-press range select is a §6A ruling | Notion shows at most a row `▶` handle (`90277769`) |

**Loose end (no visual change proposed).** `.db-numeric-value` is stamped
(`cell-renderer.ts:318-321`, `:419`) but **no stylesheet rule matches it** — numbers are
left-aligned by inheritance and at parity with `a9f53856` by accident. This is the
`design-system.md` §10 "class in source that nothing styles" pattern: a `text-align: left`
assertion would pass today for the wrong reason. Either give it a deliberate one-line rule
documenting the choice, or record it as an intentional hook.

## 8. Q3 continued — Inline-edit lifecycle (ours is stricter than captures can show)

Ours: one editor at a time (`cell-renderer.ts:143-146`); serial option-commit queue (`:14`, `:193`);
Enter/Tab/Escape commit with **no `oninput` side effects** (`050` ADR-007's typing-position
regression guard); click-opens-picker for select/status/date/datetime, dblclick/tap for the rest
(`:555-606`). Notion's captures show click→sheet/popover per type (`8d6dcf3b`) and create-on-type
for options (`cbf001e4`). Our option editor accepts an `initialSearch` (`cell-renderer.ts:916-927`),
but **create-on-type inside a table cell was not verified** — `record-surface/cell-editor-option.ts`
sits beyond the bounded list. Recorded as verification debt E1, **not** as a finding of absence.

## 9. Q4 — Conflicts with a landed Anytype ruling: none. Four tensions, dispositioned

The governing model matters here. `050` ADR-006 and `roadmap.md` §6A (2026-09-05 ~22:45) moved
**board and calendar** to Anytype 1:1 and kept the **table under item-wise adoption** — "the table
stays ours, with grid patterns adopted where the captures show them better". `051` ADR-007's
parity-by-default binds the sheets and modals these features present *in*, not the table's cells.
Consequently **none of the ten rulings checked** (`053` ADR-001..006; `050` ADR-003/005/006/007) is
contradicted by any candidate in §5.

| # | Tension | Disposition and reason |
|---|---|---|
| T1 | **Title-column menu convention.** Notion omits Hide/Delete on Title and adds Show-page-icon (`039351aa`); we show Hide on every column (`column-menu.ts:193`) and **disable** Delete for the title (`:241`) | **Keep ours.** Digest §4 P1 already ruled the two equivalent ("ours via a disabled row, Notion's via a shorter menu"); `row-menu.ts:10` records the convention that a disabled row documents an action that exists but does not apply. Adopting Notion's shape trades a documented convention for a shorter menu at zero user gain. The child phase must **not** "fix" this |
| T2 | **Wrap.** Notion's two-level control (P8) vs landed ADR-004 | **No revisit.** Notion *agrees* with ADR-004 — `resolvesToWrappedCell` stays the one place the rule lives (digest §5: "no ruling to revisit"). The wrap-off defect is a bug fix, not a re-adjudication |
| T3 | **Conditional colour.** Digest §5 flags a "disagreement in existence" | **Dissolved by F25.** The mechanism ships (G10). Residue is only whether the operator wants Notion's first-class "Conditional color" Settings row and explainer (`142cef4e`, listed in `a0d1e399`/`794591f5`) versus our rules living in database settings — a naming/discoverability question, not a capability gap. **Operator question E4**, not a phase task |
| T4 | **Contrast guardrail** (binding constraint, not a conflict) | Every new colour on C1/D3/D4 derives from our tokens (`design-system.md` §12) and clears `050` ADR-005. Notion contributes no colour values — all captures light-theme (digest preamble, §6 Q6) |

## 10. Q5 — Device-only checks

1. **Frozen-column sticky visual on iOS mid-scroll** (gates C1). No capture in the 98-screen read
   shows a frozen state at all (digest P7: "design inferred from the menu action, not seen as a
   rendered state"; §6 Q3). WebKit's sticky-inside-table behaviour needs a real device read.
2. **Title-cell affordance composition at 390px.** Notion lets the OPEN pill *overlap* the tail of
   long titles rather than truncating first (`19745d87`, `35c64a84`, `d9d61160`; P12). Ours:
   `db-record-open-btn` — always-visible icon on touch, hover label on desktop
   (`table-record-peek.ts:86-114`, touch branch `:102-104`) — inside a phone `td` capped at 60vw
   with ellipsis (`styles.css:20922-20928`). Whether the button steals title width, overlaps the
   ellipsis, or collides with the link hit area **is not answerable from a static catalogue and was
   not measured in this loop**. The check: at 390px the button stays inside its own inline box, the
   ellipsis lands on the text, and the two hit areas are disjoint. *The threshold number is owed by
   the phase task — no guess is written here.*
3. **Dark theme for every new colour.** Zero of 102 opened screens are dark (digest preamble, §6
   Q6). Each new colour must be verified in **both** of our themes in the harness; the dark read
   belongs to the operator device pass.
4. **Hover carries no Notion claim at all** (digest §6 Q5 — hover states are structurally
   unobservable in a screenshot catalogue). Our header and cell hover states
   (`styles.css:5534-5537`, `:6782-6784`) are judged **only** against our own contrast bar. Listed
   so the phase does not cite Notion for hover, and so "no hover captured" is never read as "Notion
   has none".

## 11. Recommendations — Q6 ranked remediation plan for a new child phase

**Vehicle.** A new child phase under `005`, sibling to `056`/`057`, consuming `053`'s primitives and
`051`'s confirm/sheet contracts as constraints. Not an amendment to `053` — D4 closed that packet's
table view.

**Ordering rule.** Committed defect first, then user-impact-ranked adoption, then the guards that
protect everything else — except that guards are written **first** as tasks, per `050` ADR-004
("assert what is missing **and** separately assert what already works so it cannot regress"). One
leg touches one file where possible (`053` D6); `styles.css` rows serialize through the CSS lane.

### Phase A — Guards on the already-haves (no visual change; a negative control proves each)

| Task | Guard | Red-first negative control |
|---|---|---|
| A1 | Footer: zero-row skip + one trigger per column + 44px phone floor (`table-renderer.ts:801-812`; `styles.css:8482-8486`) | Remove the `rows.length === 0` return → red; drop the floor rule → red |
| A2 | Header: type icon + label + menu target + sort ordinal; add-column `+` (`table-renderer.ts:632-663`) | Drop the `renderPropertyTypeIcon` call → red |
| A3 | Cells: inline multi-select chips, 4px gaps, cap 560px; per-option pill colour (`cell-renderer.ts:470-498`, `:453-468`; `column-width.ts:118-123`) | Stack chips in a block container → red; force one colour → red |
| A4 | Conditional row tint paints through `tr > td` (`styles.css:1317-1319`) | Delete the `td` paint rule → red |
| A5 | Phone sheet grammar for the width adjuster (`column-width.ts:511-525`) | Detach the shared sheet host → red |

**Phase threshold:** every guard green on the tree and red under its own negative control;
`npm run gate` exit 0 with one permanent row each (the `053` T011 shape).

### Phase B — The committed wrap defect (already `053` T016; Notion confirms the control's shape)

| Task | Change | Threshold |
|---|---|---|
| B1 | Land `worktrees/160-fix-053-wrap-off-rows` at the escaping element (**producer unnamed until measured** — `goal.md` forbids guessing) | `goal.md`'s own criterion: every row = `--db-row-height` for its density with wrap off; long-text column ellipsised; a negative control removing the clip goes red. Phone rule the leg must respect: the wrap cell's 60vw cap keeps its own rule (`styles.css:20941-20944`) |

### Phase C — Freeze (the top Notion-derived adoption)

| Task | Change | Threshold (red-first) |
|---|---|---|
| C1 | `ViewConfig.frozenColumnKeys?: string[]`; `freezeColumn` on `ColumnMenuActions` (`column-menu.ts:38-63`) + one menu row beside the wrap row (`:194-213`); sticky `th/td` with `left` = sum of preceding frozen widths; `.is-scrolled-x` divider shadow; **desktop-only, with the reason stated in the task** (phone auto layout has no horizontal overflow, `styles.css:20914-20921`) — satisfying `050` D3's "no silent no-phone" | **Red:** 0 freeze matches today (digest §4 P7). **Green:** frozen `th` computes sticky `left` ±1px in the harness; menu row checked-state persists per column; config round-trips through serialise/parse; unfreeze negative control collapses the offset; plus the dark-theme and iOS device reads from §10 |

### Phase D — Quality-of-life batch (impact order)

| Task | Change | Threshold (red-first each) |
|---|---|---|
| D1 | Date **End-range**: optional end value; picker row (`cell-editor-date.ts`); range display form | Cell renders both ends. Red: no end/range concept in 546 read lines |
| D2 | Type-set **scaffolding**: icons + labels for the 5 missing types in the type picker (`column-menu.ts:255-288`); data types deferred | 13 → 18 rows, one glyph each. Red: 13 today (digest §4 P2) |
| D3 | Resize-handle hover visibility: 2px token line on `th:hover` (`styles.css:5656-5664`) | Computed background changes on hover. Red: no background rule today |
| D4 | **Show vertical lines** switch: container class drops the `td` right border (`styles.css:5417`) | Off ⇒ no `td` computes a right border. Red: unconditional today. The first read also answers the data-source-title toggle (G12's missing sixth) |
| D5 | Peek **Empty** placeholder for empty visible properties (`table-record-peek.ts:358-360`) | Muted word renders in the peek; table cells unchanged. Red: `""` today |
| D6 | Add-row **noun** label (`table-renderer.ts:982`) — **gated on the operator's noun-source decision** | `+ New <noun>` where derivable; falls back to today's string. Red: fixed string today; i18n × 3 locales |

### Phase E — Verification debts and operator questions

| Task | Debt |
|---|---|
| E1 | Create-on-type in the table option editor (`cell-renderer.ts:916-927`) — read `record-surface/cell-editor-option.ts` before claiming either parity or absence |
| E2 | Column manager's title-eye disabled state vs `9867cb76` (digest §4 P5 asserts the panel matches, but not that specific state) |
| E3 | Re-verify the digest's **second-hand line numbers** (`types.ts:82`, `property-type-icon.ts:32-46`) before any C/D task cites them |
| E4 | Operator questions: freeze's dark-theme divider treatment; D6's noun source; whether the "Conditional color" presentation polish (T3 residue) is wanted |

## Eliminated Alternatives

| Approach | Reason eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Re-map our `currency`/`datetime` onto Notion's fold-into-Number/Date model | Deletes two landed types for a cosmetic unification; against the restraint rule | `types.ts:82`; digest §4 P2 | 1 |
| Adopt Notion's exact column-menu row order | Churn — ordering is not measurable as user gain and would move captures for nothing | `74fe28d3` vs `column-menu.ts:114-242` | 1 |
| Adopt Notion's **flat** type list | Our Basic/Options/Advanced grouping is the better structure for 13+ types | `af7a18b0` vs `column-menu.ts:261-265` | 1 |
| Shorten the Title column menu to Notion's shape | Trades a documented convention (disabled row) for a shorter menu at zero gain; digest already ruled them equivalent | `039351aa`; digest §4 P1; `row-menu.ts:10` | 1, 5 |
| Adopt Paragraph/Bullets/One-liner display styles wholesale | The wrap switch (ADR-004) + `textRenderMode` already own "how a multi-line value collapses"; a third control relitigates ADR-004 | `34541a79`; ADR-004 | 2 |
| Port Timezone / Remind picker rows | Notion-service features with no Obsidian analogue; not portable | `bd482935` | 2 |
| Change empty **table-cell** rendering to Notion's word placeholder | Notion's own table cells are blank — `050083af` is page-view-only. Changing ours would *break* parity, not create it | digest P3; `cell-renderer.ts:263-264` | 2 |
| Merge Calculate triggers into the add-row band | Both products separate them; ours already does | digest P4; `table-renderer.ts:975-984` then `:805-811` | 3 |
| Restyle our open affordance as Notion's "OPEN" pill | Ours is a button with an aria-label, not a pill label; Notion varies the word per source anyway. The label-noun idea (D6) is where this energy goes | `19745d87`, `e33466b4` | 3 |
| Row expand `▶` triangle | The record-open affordance + docked peek (desktop) / record sheet (touch) already resolve the need; a second row-expansion mechanism duplicates what `006`/`054` own | `90277769`; `table-record-peek.ts:161-306`, `:179-182` | 3 |
| Adopt the simple-table block's drag visuals (blue outline, corner squares, ghost) | No **database-table** capture shows them; our native drag + confirm-on-drop (ADR-003) is landed with its own parity constraints | digest P6, §4 P6; `d53b3912`, `026940b3`, `db2814d9` | 4 |
| Always-on sticky title column instead of per-column freeze | Explicitly against the digest's reading of the menu action ("Freeze up to and including this column") | digest §4 P7 | 4 |
| Build a new "Conditional color" feature | The capability already ships; only its naming could move | `conditional-formatting.ts:168-206`; `styles.css:1317-1319` | 4 |
| Fold this plan into `053` | `053` D4 closed that packet's table view; the plan is written for a new child phase | `053` decision-record D4 | 5 |
| Rank guards (Phase A) below features | Guards-first is `050` ADR-004's own rule | `050` ADR-004 | 5 |

## Divergence Map

- **Saturated directions.** Header/menu structure (iter 1), per-type cell rendering (iter 2), and
  row chrome (iter 3) each reached parity confirmation with no remaining unexamined pattern in the
  digest's P1–P4/P8/P12 set. Further passes over them would retread.
- **Pivots taken.** None of the anti-convergence pivot machinery fired: `convergenceMode` was
  `default` and `stopPolicy` was `max-iterations`, so convergence stayed telemetry and the loop
  widened by *plan*, not by pivot (guards → defect → adoption → adjudication → plan). The registry
  records no divergence entries.
- **Pivot failures / audited overrides.** None.
- **Evidence class shift (the one genuine divergence).** Iteration 4 established that *the digest's
  "no match" greps are claims, not evidence* — P9 flipped from "no match" to already-have on two
  targeted reads. Any future digest claim of absence against this tree should be re-grepped **by
  symbol**, not by phrase.
- **Remaining frontier.** (a) `record-surface/cell-editor-option.ts` — create-on-type (E1);
  (b) the column manager's title-eye state (E2); (c) the two unlocated view toggles — Show vertical
  lines is now a candidate (D4), Show data source title is still unverified (G12); (d) the digest's
  second-hand line numbers (E3); (e) three operator questions (E4).

## 12. Open Questions

1. **Noun source for the add-row label.** Notion derives it from the data source (`19745d87` /
   `e33466b4`). Where does ours come from — the view's source name, or a fixed "page"? A product
   decision, which is why D6 is operator-gated and ranked low-medium.
2. **Frozen divider treatment in dark theme.** No Notion capture exists (all light), so the shadow
   or line is ours to derive from tokens; the operator owns the call.
3. **Does the operator want Notion's first-class "Conditional color" naming/explainer?** The
   capability ships; only the presentation could move (T3).
4. **Show data source title** — the sixth P10 toggle was not located in this loop's reads and is
   deliberately **not guessed at**. D4's first read should answer it.
5. **Create-on-type inside a table cell** (E1) — unresolved; recorded as debt rather than as
   absence.
6. **Column manager's title-eye disabled state** (E2) — the digest asserts the panel matches but
   not that specific state.
7. **Person-type value source.** Notion renders Person as avatar+name (`3b3c3c26`, `21d71e5f`
   Owner column). *Inference:* a person is not a note, so there is no obvious value source in an
   Obsidian vault — deferred with the data type, D2 ships icons/labels only.

## 13. Confidence and Limitations

**High confidence** — every "we already have" row (G1–G13), each read directly at `file:line`; the
F25 digest correction, verified on two targeted reads; the Q4 no-conflict adjudication, checked
against ten named rulings.

**Medium confidence** — the freeze CSS shape (C1). The digest is explicit that the frozen state is
**inferred from the menu action and never seen as a rendered state** (P7, §6 Q3), so the sticky
offset and divider are our design, not an adoption. Marked **inference**.

**Lower confidence / explicitly bounded** —

- `types.ts:82` and `property-type-icon.ts:32-46` are cited **second-hand from the digest** and were
  not re-verified (bounded scope). E3 exists for exactly this.
- The `ViewConfig` field placement at `types.ts:415-432` follows `columnWidths` by **inference**.
- G6 (Notion shows no in-cell chip removal) is an **inference** from `21d71e5f`/`8e8e4249`.
- No absolute pixel value is taken from a Notion capture: the digest states screens are
  thumbnail-scale and ratios beat absolute px. All numbers above come from our own tree.
- **No image file was opened at any point in this loop**, by construction.

## 14. Validation Matrix

| Check | Where it runs | Passes when |
|---|---|---|
| Phase A guards (A1–A5) | Render-assertion harness + `npm run gate` | Green on tree, red under each named negative control |
| B1 row height with wrap off | Harness, all three densities | Every row = `--db-row-height`; long-text ellipsised; clip-removal control red |
| C1 sticky offset | Harness, desktop viewport | `left` = Σ preceding frozen widths ±1px; unfreeze collapses it |
| C1 config round-trip | Unit | `frozenColumnKeys` survives serialise → parse |
| C1 iOS sticky visual | **Device only** | Operator read; threshold set by the task |
| C1/D3/D4 colour | Harness, both themes | Derived from tokens; clears 3:1 non-text / 4.5:1 text (`050` ADR-005) |
| D2 type picker | Harness | 18 rows, one glyph each |
| D3 handle | Harness | Computed background changes on `th:hover` |
| D4 vertical lines | Harness | Off ⇒ no `td` right border |
| D5 peek placeholder | Harness | Muted word for empty visible property; table cells unchanged |
| Title affordance at 390px | **Device only** | Button inside its inline box; ellipsis on text; hit areas disjoint |

## 15. Traceability

| Finding | Notion screen id(s) | Our `file:line` | Ruling touched |
|---|---|---|---|
| F1–F3 header/add-column | `19745d87`, `35c64a84`, `3b3c3c26`, `d9d61160` | `table-renderer.ts:632-663`; `styles.css:5425-5429`, `:5407-5411`, `:5623-5629` | — |
| F4 / C1 freeze | `74fe28d3`, `039351aa` | `column-menu.ts:38-63`, `:194-213`; `styles.css:20914-20921` | none (new ground, digest §5) |
| F5 / D2 type set | `af7a18b0`, `7f2dbda0`, `3b3c3c26`, `a9f53856` | `column-menu.ts:255-288`; `cell-renderer.ts:214-215` | — |
| F6 / T1 title menu | `039351aa` | `column-menu.ts:193`, `:241`; `row-menu.ts:10` | `053` menu convention — keep ours |
| F8 / G5 multi-select | `21d71e5f` | `cell-renderer.ts:470-498`; `column-width.ts:118-123` | closes digest §6 Q1 |
| F9 / G7 status pill | `8d6dcf3b`, `6673816d` | `cell-renderer.ts:453-468` | — |
| F10 / D1 date range | `bd482935` | `cell-editor-date.ts:71-120`; `cell-renderer.ts:537-553` | — |
| F11 / D5 peek Empty | `050083af` | `table-record-peek.ts:358-360` | — |
| F14 / G4 footer | `6055725d`, `101392c7`, `20a95974` | `table-renderer.ts:801-812`; `styles.css:8482-8486` | `053` ADR-005 |
| F15 / D6 noun label | `19745d87`, `e33466b4` | `table-renderer.ts:982` | operator-gated |
| F17 title affordance | `19745d87`, `35c64a84`, `d9d61160` | `table-record-peek.ts:86-114`; `styles.css:20922-20928` | device-only |
| F18 row expand | `90277769` | `table-record-peek.ts:161-306`, `:179-182` | `006`/`054` own record-open |
| F19 / B1 wrap | `74fe28d3`, `039351aa`, `d3acf726` | `cell-renderer.ts:208-211`; `styles.css:20941-20944` | `053` ADR-004 — confirmed, not revisited |
| F21 / G13 selection | `90277769` | `table-renderer.ts:611-619`, `:724-736`, `:875-895` | §6A long-press range select |
| F22 / G9 visibility panel | `9867cb76`, `b69c8a59`, `35c32af9` | `column-manager-renderer.ts:1-12` | — |
| F23 / D3 resize handle | `d53b3912`, `026940b3`, `db2814d9` | `styles.css:5656-5664`, `:5469-5471`; `column-width.ts:347-529` | `053` ADR-003 drag |
| F25 / G10 conditional colour | `142cef4e`, `3b3c3c26`, `b184ec4c` | `conditional-formatting.ts:168-206`; `table-renderer.ts:85/866/911`; `styles.css:1317-1319`, `:1299-1303` | **digest §4 P9 corrected** |
| F26 / G12 / D4 view toggles | `d3acf726` | `table-renderer.ts:575-577`; `table-record-peek.ts:52-60`; `styles.css:5417-5418` | `053` ADR-004; `055` AC-011; §6A ~04:45 |

## 16. References

### Notion (exclusive source)

- `specs/005-component-surface-system/053-toolbar-and-view-controls/notion-screens-digest.md` — §2
  screen ids, §3 patterns P1–P12, §4 divergence table, §5 Anytype cross-read, §6 open questions.

### Local code

`src/views/table-renderer.ts` · `src/views/cell-renderer.ts` · `src/views/column-menu.ts` ·
`src/views/column-width.ts` · `src/views/table-record-peek.ts` · `styles.css` (`.db-table` blocks) ·
`src/views/record-surface/cell-editor-date.ts` (extra read, F10) ·
`src/data/conditional-formatting.ts` (extra read, F25).

### Rulings and design record

`053/goal.md` · `053/decision-record.md` (ADR-001..006, D3–D6) · `053/tasks.md` (T011, T016) ·
`050/goal.md` · `050/decision-record.md` (ADR-003/004/005/006/007) ·
`specs/005-component-surface-system/design-system.md` (§10, §12) · `roadmap.md` §6A.

*No `resource-map.md` exists for this packet (`resource_map_present: false`), so none is cited.*

### Loop artifacts

`research/lineages/glm-devpass-table/` — `research.md`, `convergence-report.md`,
`synthesis-record.json`, `deep-research-strategy.md`, `deep-research-dashboard.md`,
`iterations/iteration-001..005.md`, `deltas/iter-001..005.jsonl` ·
`research/findings-registry.json` (merged) · `research/fanout-attribution.md`.

## 17. Convergence Report

- **Stop reason:** `maxIterationsReached` (`stopPolicy: max-iterations` — convergence was telemetry
  only and could not stop the loop early).
- **Total iterations:** 5 / 5, across 1 lineage (`glm-devpass-table`, `cli-opencode`,
  `llmgateway/glm-5.3-flash`, reasoningEffort `max`, concurrency 1).
- **Questions answered:** 6 / 6 (Q1–Q6). Two sub-items carried forward as **named** verification
  debts (E1, E3) rather than silently dropped.
- **Remaining questions:** 7 (§12), of which 3 are operator decisions and 4 are verification debts.
- **Last 3 iteration summaries:** run 3 — row chrome P4/P8/P12 (0.55); run 4 — resize/reorder,
  freeze, visibility, view toggles, conditional colour P5–P10 (0.50); run 5 — adjudication, device
  checks, plan (0.30).
- **newInfoRatio trend:** 0.90 → 0.60 → 0.55 → 0.50 → 0.30 (mean 0.57).
- **Convergence threshold:** 0.05 — never binding under this stop policy.
- **Divergence summary:** no divergent pivots recorded (`convergenceMode: default`, no pivot
  entries in the registry). The one genuine divergence was an evidence-class shift, recorded in the
  Divergence Map.
- **Digest corrections:** 1 — §4 P9 (conditional row colour already ships).
- **Digest open questions:** §6 Q1 closed; §6 Q2 answered 4 of 6 with the other 2 named; §6 Q3/Q5/Q6
  carried as device/capture limitations bound to phase tasks.
- **Conflicts with landed rulings:** 0 (4 tensions named and dispositioned).
- **Findings:** 26 merged registry entries — 8 ranked improvement candidates, 13 already-have/guard
  rows, 1 digest correction, 4 verification debts, 1 device-only list, plus the Q4 framework and the
  5-phase plan.
- **Write surface:** all writes confined to this research packet. No `src/`, `styles.css`, `tools/`,
  or git writes. No image file opened.
- **Known gap in this run:** `resource-map.md` emission was skipped — `reduce-state.cjs` refused the
  path because `.opencode/` is a symlink into a different repository, so `REPO_ROOT` resolves there
  and this worktree is absent from that repo's `git worktree list`. Non-blocking by contract
  (`research.md` still emits); environment issue, not a research finding.
