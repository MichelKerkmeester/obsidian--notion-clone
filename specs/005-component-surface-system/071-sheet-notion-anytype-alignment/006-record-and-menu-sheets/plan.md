---
title: "Implementation Plan: Phase 6: record-and-menu-sheets"
description: "[2-3 sentences: what this implements and the technical approach]"
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 6: record-and-menu-sheets

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | Plugin's own panel/sheet renderers and the owned menu/card family |
| **Storage** | None (styles + captures only) |
| **Testing** | Vitest + the live lane harness (`tools/live/sheet-grammar.mjs`) |

### Overview
The record detail sheet's phone presentation answers to the same reference row grammar the
settings leg landed: one property per row, label left / value right on one line, inside the
44–52px touch window, everything on one shared 16px content inset, section headings that open
behind their own hairline. This phase measures that grammar onto the record sheet's lane rows
red-first, teaches `styles.css` the gaps (the pitch's box, the inset, the disclosure's dividers),
and re-proves the menu-card half where the family's own picker and menu children mount — the
the landed menu-card rulings themselves are not reopened.

### Phase 1 reference mapping (AC-001 evidence)
Quoted from the inventory this phase depends on (`../001-sheet-story-coverage-audit/inventory.md`):

- The record detail sheet (inventory row, line 47): producer `src/views/record-detail-panel.ts:172`,
  phone presentation `sheet`, captures `panel-record-detail`, `panel-record-detail-sheet`,
  `panel-record-detail-sheet-body-editing`, `panel-record-detail-sheet-body-empty`, "+2 more";
  references Notion `notion/ios/database` (18: `notion-ios-database-properties-01-…-8bb9115f-…webp`,
  `notion-ios-database-properties-02-…-bd9d-2b627a4b6727.webp` +16) / Anytype `anytype/mobile/sheets`
  (14: `anytype-mobile-sheet-cell-date-dark.png`, `-light.png` +12). Its note, quoted: "Anytype's
  mobile cell sheets (date, number, multiselect, assignee) are the closest reference family for
  per-property editing inside a record surface; ours edits in place within one sheet. The docked
  placement variant has no reference either side."
- The record peek (inventory line 48): producer `src/views/table-record-peek.ts:161`, story
  `panel-record-peek`, references Notion `notion/ios/database` (3: `notion-ios-database-row-page-03-…`,
  `-04-…` +1) / none. Its note, quoted: "No reference shows a peek-to-sheet handoff; on touch we
  mount the record sheet, so the row's grammar asserts the sheet a phone actually gets."
- The record sheet's own menu-card children, stacked over it (inventory lines 120–125): the record
  select value menu — Anytype `anytype/mobile/sheets` (6: `anytype-mobile-sheet-cell-multiselect-empty-dark.png`,
  `-light.png` +4); the record date editor — Anytype (4: `…cell-date-…` +2); the record relation
  editor — Anytype `anytype/desktop/app` (1: `anytype-relation-editor-tag-dark.png`) and
  `anytype/mobile/sheets` (2: `anytype-mobile-sheet-cell-object-assignee-…`); the record option
  colour picker — Anytype (4: multiselect); the record column context menu — none, recorded; the
  record column submenu — none. The column-menu popover the menus ride (inventory line 94):
  references Notion `notion/ios/database` (2: `notion-ios-database-block-menu-07-…`,
  `-11-…`), the nearest family for per-column actions.

Where Notion and Anytype disagree the operator's standing directive decides it: "Actually all
sheets should mimic notion way closer" (2026-09-08 08:10) — the reference columns of the gap
table stay `TBD` where no third-party capture carries readable measurements, and the lane asserts
the Notion-shaped targets.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:approach -->
## 2. TECHNICAL APPROACH

1. **Gap table first** (`spec.md` §13): the record sheet as it renders today, measured by the
   lane; reference columns honest `TBD`; the Target column carries the directives.
2. **Red-first**: the sheet-grammar lane gains the record sheet's reference row grammar — one
   property per row, label left / value right on one line at 44–52px, one shared 16px content
   inset, a hairline under every property row but the last, section headings on that inset behind
   their own 1px divider, no native select, no horizontal overflow at 402px — plus the 44px floor
   read on the record family's own option and menu rows in the stacked-pair reports (4 of the 6
   record pairs mount option rows; 3–16 rows each, all 44.0px; the date and relation editors'
   grids are not option rows), where the
   family actually mounts its menus. Runs red, numbers recorded.
3. **Implement in `styles.css` only**: the surface spends the shared inset (the rows, hairlines
   and section dividers take their left edge from it); the 44px touch floor owns its own box
   (border-box named on the rows the pitch measures); the disclosure's section headings gain
   their divider. The menu-card half ships no new stylesheet — its landed rulings hold, and the
   lane now proves them on the record sheet's own children.
4. **A unit test pins the declarations** (`src/views/record-sheet-row-grammar.test.ts` reads
   `styles.css` the way the browser resolves it) and is revert-line-checked.
5. **Recapture + evidence + gate**: screenshots ×2 with the decoded pixel-delta judgement, the
   jitter policy, the evidence freshness loop, the 27-lane gate, both naming scans.

<!-- /ANCHOR:approach -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION PLAN

| Check | Gate |
|-------|------|
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 0 |
| `npm run build` | 0 |
| `node tools/live/sheet-grammar.mjs` | 0 — the record sheet's rows: 21/21 one-line at 44–52px, 16.0px inset, 1/1 heading at 16px/1px, 0 native selects, extent ≤ clientWidth at 402px; negative control red then restored |
| `node tools/live/render-assertions.mjs` | 0 |
| `node tools/live/touch-targets.mjs` | 0 |
| `node tools/storybook/verify-placement.mjs` | 0, declared reds only |
| `npm run screenshots` ×2 + decoded pixel-delta | 616/616 both; jitter policy: ≤12 channel delta moved in one run only → restore + manifest hashes; else keep and name |
| `node tools/live/evidence.mjs --check-all` | 0 stale after the stale writers re-run (`engine-parity` exits 1 INFORMATIONAL) |
| `npm run gate` | exit 0, 27 lanes |
| `node tools/naming/scan-comments.mjs`, `scan-failing-values.mjs` | 0 |

<!-- /ANCHOR:verification -->
