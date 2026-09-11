# Coverage Matrix — `076-sheet-visual-parity` (lineage `deepseek`)

Every figure is measured from the tree in iterations 1–10; the evidence command or path is named in
the corresponding `findings/iter-N.md`. `Clauses` counts clause bullets named in `spec.md`
(`- **L<n>**`); `Rows` counts §13 DEFINE table rows; `Source col` records whether the D9 `Source`
column exists; `Judged capture` names the D2 full-sheet scenario when one exists.

## A · Operator requests → children

| Request (roadmap §4) | Child / packet | Status |
|---|---|---|
| rows 70–83 | their own packets (`056`, `058`, `067`, `068`, `071`… ) — no `076` row unowned | routed |
| row 71 linked-view blocks UI/drag | `072-linked-view-blocks-ux` (completion_pct 100) | routed, not `076` |
| row 72 checkbox controls | `073-checkbox-controls` (90) | routed, not `076` |
| row 84 settings sheet strict alignment | `001-settings-sheet-visual-parity` | CREATEd, judge 11/16 fail; remediation T015–T019 pending |
| row 85 sort sheet flush frame | `004-sort-sheet-visual-parity` | scaffolded — frame-shape row **missing** from its §13 (iteration 1) |
| rows 86–88 (each numbered twice/three times) | `002`, `008`, `011`, `013`, `015` landings + `sheet-design-review.md` | landed in `071`; `076` carries the strict/visual re-read |
| row 87 all-sheets audit | `sheet-notion-audit.md` → `003`–`014` | seven children scaffolded 2026-09-09 |
| row 88 sk-design-fundamentals review | `015-sheet-design-fundamentals`, routed to `007`/`008`/`011`/`013` | landed under `071/015` |
| row 89 packet formation | `076` parent | this packet |
| row 90 board-card field wrapping | `012-board-card-fields` | landed; D9/§7.21 ownership conflict open |
| row 91 properties card rejection (D7) | `002` remediation | T014–T016 pending |
| row 92 settings typography + D8 | `001` | D8 recorded; release 0.0.40 violates it |
| row 93 coverage audit | `013`–`017` | scaffolded |
| row 94 board ClickUp lead | `018`, `019` | scaffolded |
| (unrouted) `dropdown-field.ts`, checkbox/radio geometry | **no child** — proposed `020-control-primitives-visual-parity` | gap |

## B · Children → surfaces → evidence

| Child | Surface(s) / producer | §13 rows | Clauses | Source col | Judged capture (D2) | Rubric expectation recorded? |
|---|---|---:|---:|:---:|---|---|
| `001` | settings sheet — `view-config-panel-renderer.ts` | 22 | **10** (L1–L10, prose only in lane) | no | `constructed-view-config-sheet-mobile-{light,dark}.png` | yes — iteration table, 11/16 |
| `002` | properties/column manager — `column-manager-renderer.ts` + `property-row.ts` | 5-row table + 13.5–13.8 | **6** (L1–L6; L1–L8 with ids in lane) | no | `constructed-column-manager-sheet-mobile-{light,dark}.png` | yes — two iteration tables, 11/16 twice |
| `003` | filter sheet **+ active-rule popover** (D2a) | 11 | 6 | no | `constructed-filter-panel-sheet` + `-nested-` | no per-row expectations |
| `004` | sort sheet | 10 | 6 | no | `constructed-sort-panel-sheet` | no |
| `005` | group sheet | 8 | 5 | no | `constructed-board-groups-panel-sheet` | no |
| `006` | add-view sheet | 8 | 5 | no | `constructed-toolbar-add-view-sheet` | no |
| `007` | property-editor modal sheet | 9 | 5 | no | `constructed-modal-sheet-property-editor-sheet` | no |
| `008` | record detail sheet | 8 | 5 | no | `constructed-record-detail-sheet` | no |
| `009` | owned menu + confirm sheets | 7 | 5 | no | `constructed-owned-menu-sheet`; confirm is viewport-only | no |
| `010` | picker sheets (icon picker …) | 9 | 5 | no | `constructed-icon-picker-sheet` | no |
| `011` | toolbar overflow + column width | 7 | 5 | no | `constructed-column-width-adjuster-sheet` | no |
| `012` | board card field grid (not one of the eleven sheets) | 6 | 4 | no | none (viewport only) | no |
| `013` | `board-card-properties-panel.ts` | 4 | **0** | yes | viewport only | no |
| `014` | 5 `FuzzySuggestModal` call sites | 4 | **0** | yes | **no scenario** | no |
| `015` | 2 inline cell-editor popovers | 4 | **0** | yes | viewport only | no |
| `016` | calendar/timeline/chart toolbars + mini-calendar | 4 | **0** | yes | **unreachable** (3 of 4) | no |
| `017` | 18 primary + 2 non-modal + 1 stacked modal sheets | 5 | **0** | yes | 3 `capture:"element"` fixtures (D2b-disqualified) | one table for 18 sheets |
| `018` | board visual parity (ClickUp) | 7 | **0** (“Lane clause, new”) | yes | viewport only | no |
| `019` | board card drag feel (ClickUp) | 8 | **0** | yes | none (mid-drag contract undefined) | no |
| `020` *(proposed)* | `dropdown-field.ts` listbox + checkbox/radio geometry | — | — | — | — | — |

**Totals:** 19 children (+1 proposed); 12 with named clauses (67 ids); 7 with none; 11 with judged
full-sheet captures; 7 with the D9 `Source` column; 119 scaffold-set DEFINE rows vs 51 clauses.

## C · Claims without a packet-wide assertion

| Claim | Asserted on | Gap |
|---|---|---|
| D7 no card containers | `001` L1/L6/L8, `002` L6 | lane still requires the card at six sites; no packet-wide clause |
| D9 rows ≥ 44pt | `001` L3, `002` L5 | 2 of 11 sheets; `ROW_PITCH_SURFACE` = owned-menu only |
| D9 grab handle everywhere | sort-panel negative control | one surface |
| D9 stacked pickers | engine over `REGISTERED_STACKED_PAIRS` | no child names its own pairs |
| D9 Source per element | `013`–`019` only | 7 of 19; `018`/`019` criteria say “Lane clause, new” |
| D8 release only after DONE | `plan.md` §6A prose | 0.0.40 cut before any DONE |
| D6 graph/verdict/log schema | `decision-record.md` only | drivers live in the orchestrator scratchpad |
| D1 judge required | `001`/`002` verification.md | 17 children carry the template only |

## D · States and themes

| Item | Measured |
|---|---|
| Children with a `both themes` DEFINE row | `003`–`012`, `001` §13.7, `002` §13.7; absent from `002`'s task text and all of `013`–`019` |
| `017/spec.md` occurrences of “dark” | **0** (eighteen sheets adjudicated) |
| Dark reference assets | Anytype mobile sheets **52**, ClickUp **49**, Notion **23** (all desktop-web flows) |
| Both-theme agreement asserted | no — `CARD_STEP_FLOOR 12` checked per theme, never across (`sheet-grammar.mjs:4106-4134`) |
| Vacuous-pass guards | `001` L9 only; `002`'s L8 passes on an empty subject set once D7 removes the card |
