---
title: "Decision Record: Content Row Rhythm and Header Rail"
description: "ADR-001 records that a table row's height belongs to the table, fixed by taking the wrap out of the value containers inside a table cell rather than by capping the row; ADR-002 records what the coming wrap control must own, and the two traps measured while not building it."
trigger_phrases:
  - "005 decision record"
  - "table row height decision"
  - "phone table row too tall"
  - "multi select chips row height"
  - "wrap toggle scope"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/005-content-row-rhythm"
    last_updated_at: "2026-09-05T21:20:00Z"
    last_updated_by: "debug-agent"
    recent_action: "Recorded the row-height root cause and the wrap control's scope"
    next_safe_action: "None here; the wrap control itself is 052/053 work"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "../../../styles.css"
      - "../../../tools/live/render-assertions.mjs"
      - "../../../tools/live/catalogue-scenario.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "phone-row-height"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Content Row Rhythm and Header Rail

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: A table row's height is the table's, enforced by unwrapping the value containers rather than by capping the row

**Status:** Accepted, 2026-09-05
**Context:** operator report 54 — one phone table row three times the height of its neighbours

### The problem

The operator photographed a Home Inventory table on an iPhone where row `03 — Fridge freezer`
stood about 320 device pixels tall beside neighbours at 120-160, and every cell visible on screen
held a single line. Nothing on screen explained it.

Measured through the shipped `TableRenderer` at 390x844 with the catalogue's own records, the
distribution was **36 / 45 / 51 / 69 / 93 / 117 / 141 px across 34 rows**, and the tall row's
height resolves exactly:

```
row height = 24 x (number of option chips) - 3
```

That held for every row carrying two or more chips, across the whole 34-row population. The cell
responsible is the `labels` column — the catalogue labels it *Categories* — the **fifteenth of
twenty-eight columns**, far off the right edge of a 390px viewport. Six chips at 20px each plus
five 4px gaps is 140px, and the row was 141.

### The mechanism, in two parts

1. `.db-multi-select-values` is `display: flex; flex-wrap: wrap` (`styles.css`). In a column
   narrower than the chips laid end to end, the items break onto new lines.
2. A table cell's `height` is a **minimum**, not a maximum. `.db-table td` declares
   `height: var(--db-row-height)` with `vertical-align: middle`, so the tallest cell in a row sets
   the height for every cell in that row — including cells nobody can see.

Three sibling containers share the same shape and the same exposure: `.db-relation-values`,
`.db-file-link-list` and `.db-file-tags`. All four were measured inside table cells in the same
run (relation 50px, attachments 44px, tags 44px on the reported row) — smaller than the chips only
because that row happened to hold fewer of them.

### The decision

**Take the wrap out of these four containers when they sit in a table cell that has not opted into
wrapping.** One rule, scoped to `td:not(.db-cell-wrap)`.

### Alternatives rejected

| Option | Why not |
|---|---|
| Cap the row with `max-height` on the `td` | `max-height` is ignored on a table-cell box. Measured: no effect. |
| Give the `td` `-webkit-line-clamp: 3` | Replaces `display: table-cell` with `-webkit-box`, which **reserves** three lines instead of capping at three. Measured: every row went from 36px to 61px — worse, and uniformly so. |
| Fix the four containers themselves | Wrapping is correct where they sit on a board card, in the record panel and in the peek. The defect is positional, so the fix is scoped to the position. |
| Hide or skip off-screen columns | The column is not hidden, it is horizontally scrolled out of view. Skipping it would break horizontal scrolling, and an **on-screen** six-chip cell is equally wrong — Notion clips it. The discriminator is the table, not the viewport. |

### Consequence, stated rather than discovered later

Chips now clip at the column edge exactly as the text cells beside them already do
(`td` is `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`). A chip column's
max-content width also grows, so the table gets wider — measured 4779px → 5538px on Home
Inventory. This is the table's existing auto-layout behaviour, not a new one: the `notes` text cell
was already resolving to 605px against its declared 150px in the same run. Making chip columns
behave like text columns is the consistent outcome, and the table already scrolls horizontally.

### The evidence

Red first, in `tools/live/render-assertions.mjs` (a gate lane), over the mock-data catalogue
mounted through the shipped renderer:

```
FAIL  table-catalogue-home-inventory/file-view   34 rows, 7 distinct height(s) 36/45/51/69/93/117/141, ceiling 49px
      tallest row 141px — set by <db-multi-select-values> inside db-cell db-editable-cell at 114px wide
```

Green after: `34 rows, 1 distinct height(s) 36, ceiling 49px`, both catalogues. Exit 1 → 0.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: What the wrap control must own, and the two traps found while not building it

**Status:** Accepted as scope, 2026-09-05. **Not built here.**
**Owners:** `053-toolbar-and-view-controls` (the per-view toggle), `052-dropdown-menu-and-picker-componentization` (the per-column menu item). Roadmap row 53.

The operator asked for the wrap control in the same minute as the row-height report. It is
deliberately **not** built here: ADR-001 restores the rhythm, and the control decides a different
question. What it must own, recorded so the next phase does not rediscover it:

### 1. The control writes `ColumnDef.wrap`, which already exists and already ships

`wrap?: boolean` is on `ColumnDef` (`src/data/types.ts`), `cell-renderer.ts` puts
`db-cell-wrap` on the `td` when it is set, and the column manager already has a wrap toggle
(`column-manager-renderer.ts`). The per-view control is therefore a bulk writer over the same
field, not a new concept.

### 2. It is already on by default for one column in real data

`tools/mock-data/emit-obsidian.ts` emits `wrap: true` for the `notes` facet. In Home Inventory
that is the *Service history* column, so every vault written from the catalogue ships one wrapped
column. Any default the control picks has to reconcile with that.

### 3. `db-cell-wrap` has no cap, and this is the part that will bite

`.db-table td.db-cell-wrap` sets `height: auto; white-space: normal; word-break: break-word`
with **no line limit and no maximum**. Measured: with the chip fix in place and columns holding
their declared 150px, the notes cell alone drives every row to 92px, and rows carrying the longer
multi-line note reach 281px. Turning wrap on without a cap re-creates ADR-001's defect through a
different door.

**The two traps, both measured here, both of which cost a cycle if rediscovered:**

- `max-height` on a `td` is **ignored**. It cannot cap the cell.
- `-webkit-line-clamp` on a `td` **reserves** N lines rather than capping at N, because it
  requires `display: -webkit-box` and that replaces `display: table-cell`. Applying a 3-line clamp
  took uniform 36px rows to uniform 61px.

A working clamp therefore needs an **inner block element** inside the cell to clamp, which is a
`cell-renderer.ts` change, not a stylesheet one. That is the work, and it belongs to whoever ships
the control.

### 4. What it must not do

It must not reach the four value containers ADR-001 scoped. A user turning wrap on for a
multi-select column is asking for more than one line of chips, and that is the control's call to
make — which is exactly why ADR-001's rule is written as `td:not(.db-cell-wrap)` rather than as a
blanket `nowrap`.
<!-- /ANCHOR:adr-002 -->
