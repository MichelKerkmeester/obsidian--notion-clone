# Device defect inventory — the authoritative 18

Reported by the operator from a real phone across several rounds, with screenshots. This file is
the auditable inventory for this packet. It supersedes any other 18-item list; in particular it is
NOT the desktop-era list at `specs/002-ui-improvement-research/research/synthesis.md:149-164`,
which covers a different programme.

Evidence lines are current-branch source locations established during triage. Items marked
DEVICE-CONFIRMED were seen on the operator's phone; items marked SOURCE-ONLY were derived from the
code while triaging a device report.

## 1. SHEETS AND OVERLAYS

| # | Defect | Status | Evidence |
|---:|---|---|---|
| 1 | The `⤢` peek button opens a side rail, not a bottom sheet. It renders `db-record-peek-panel` and contains zero sheet references, while every other view already routes through the sheet-aware editable detail panel. A previous fix was applied to the wrong component. | DEVICE-CONFIRMED | `src/views/table-record-peek.ts`; `src/views/record-detail-panel.ts`; branch point `src/views/database-view.ts:8410` |
| 2 | The fields/properties button opens a centred dialog rather than a sheet, and is hard to dismiss on a phone. | DEVICE-CONFIRMED | `src/views/modals/` |
| 3 | Mobile menus generally should be sheets. 0 of 17 `Modal` subclasses reach the shared sheet mechanism; 19 renderers do. | SOURCE-ONLY | `src/views/popover-position.ts:47`, handle injection `:61-73`; `src/views/modals/` |
| 4 | Sheets do not overlay Obsidian's bottom navigation bar. `.db-mobile-bottom-sheet` declares no `z-index`; the scrim sits at `z-index:-1` inside an `isolation:isolate` context, so it cannot dim anything outside the element. | DEVICE-CONFIRMED | `styles.css:139-167`; layer tokens `styles.css:71-75` |
| 5 | Sheet height should cap at `90svh`. Current rule is `calc(100dvh - 20px)`. | DEVICE-CONFIRMED | `styles.css:139-167` |
| 6 | Headers may render under the status bar: `safe-area-inset-top` appears zero times, and safe-area is consumed two incompatible ways (`env()` in 7 places vs `var(--safe-area-inset-bottom)`). | SOURCE-ONLY, contested | `styles.css:16986`; `src/views/popover-position.ts:274` |
| 7 | Sheet visual vocabulary should match Notion: grab handle, centred title, rounded groups inset ~16pt, rows `[icon 24][label … value][chevron]`, hairlines inset to the label, muted sentence-case section headers, search as the first row inside a group. | DEVICE-CONFIRMED (reference screenshots) | operator captures |
| 8 | Every native Obsidian `Menu` must be replaced with a plugin-owned variant styled close to Notion. 11 `new Menu(` sites across 10 files; 26 accesses to `MenuItem`'s undocumented private `.dom`, 24 of them in the column menu, and no `.dom` in the public typings. | OPERATOR DECISION | `src/views/row-menu.ts:169-185`; `src/views/column-menu.ts:135-201`; `node_modules/obsidian/obsidian.d.ts:4111-4210` |

## 2. TABLE CHROME

| # | Defect | Status | Evidence |
|---:|---|---|---|
| 9 | The new-record FAB is accent blue and carries a "New" text label. It should be liquid glass with a plus icon only, no text. | DEVICE-CONFIRMED | `src/views/toolbar-renderer.ts:2189-2194`; duplicate conflicting rules `styles.css:1608` and `:3361` |
| 10 | The FAB twitches while the table scrolls. Its inset is published once per toolbar render from a live measurement of `.mobile-navbar`, with no resize, `visualViewport` or orientation listener. | DEVICE-CONFIRMED | `src/views/toolbar-renderer.ts:2239-2249`; `styles.css:18988` |
| 11 | Footer aggregates (sum, average) show no currency symbol. They must render € from the column's currency configuration, never hard-coded. The footer calls the plain number formatter while cells already use the currency one. | DEVICE-CONFIRMED | `src/views/table-footer-renderer.ts:215`; `src/data/euro-format.ts:49`; `src/views/cell-renderer.ts:319-327` |
| 12 | Footer aggregate text is too large to fit. The footer `td` sets no `font-size` and inherits the row token; the cell stacks label above value in a column flex. | DEVICE-CONFIRMED | `styles.css:7394-7402`, `:7451-7461` |

## 3. ROW AND LIST GEOMETRY

| # | Defect | Status | Evidence |
|---:|---|---|---|
| 13 | Row heights differ from row to row. There should be a wrap on/off control, and with wrap off every row is the same height. Applies to table AND list. `RowDensity` presets already exist end to end; wrapped cells opt into `height:auto`. | DEVICE-CONFIRMED | `src/data/types.ts:31-35,423-426`; `styles.css:4795-4804`; `src/views/table-renderer.ts:482-484` |
| 14 | List view has several UI defects: content escapes the frame and inline label widths are wrong. List items should also share one height unless wrapping is on. List never receives `data-row-density`. | DEVICE-CONFIRMED | `src/views/list-renderer.ts:120-131,229-233`; `styles.css:9461-9601` |

## 4. BOARD

| # | Defect | Status | Evidence |
|---:|---|---|---|
| 15 | Board pagination overlaps the cards. It is `position:sticky` with a bare literal `z-index:30` outside the declared layer scale. | DEVICE-CONFIRMED | `styles.css:17565`, `:17584` |

## 5. CALENDAR

| # | Defect | Status | Evidence |
|---:|---|---|---|
| 16 | Unscheduled chips are enormous — full-width stacked rows consuming roughly 40% of the viewport. They should be one horizontally scrolling row of small chips. | DEVICE-CONFIRMED | `src/views/calendar-renderer.ts:163` |
| 17 | `t("calendar.unscheduled")` is called but the key is absent from `src/i18n.ts`, so the raw key string renders to the user. `t()` accepts any string, so type-checking cannot catch it. | DEVICE-CONFIRMED | `src/views/calendar-renderer.ts:163`; `src/views/calendar-timeline-renderer.ts:451`; `src/i18n.ts` |
| 18 | The phone calendar should look like Notion's: a day is a number plus one small dot when it has records, today is a filled circle, a muted weekday header row, hairlines between weeks, no per-cell `+`, and the whole month fits one screen without scrolling. The per-cell add button is already `opacity:0` but still occupies 18px in every cell and stays in tab order. | DEVICE-CONFIRMED (reference screenshot) | `src/views/calendar-renderer.ts:246-289`; `src/views/calendar-mini-calendar-renderer.ts:136-249`; `styles.css:14526`, `:14539-14542`, `:14924` |

## 6. FORMULA — separate track

| # | Defect | Status | Evidence |
|---:|---|---|---|
| 19 | The formula editor should match Notion's layout plus the non-AI controls (preview-with-page, debug toggle). Explicitly NO AI prompt bar. | DEVICE-CONFIRMED (reference screenshots) | `src/views/modals/formula-modal.ts:189-229`; `styles.css:11145-11160` |
| 20 | Formula output needs a number format: percentage, and a configurable decimal count (100,1 or 100,10). `ComputedFieldDef` has no format field and computed columns cannot resolve to currency. | DEVICE-CONFIRMED | `src/data/types.ts:143-150`; `src/data/column-display.ts:35-67` |

Items 19 and 20 are numbered here for completeness but are a desktop-first workbench track, not phone defects. The operator's headline count of eighteen refers to items 1-18.

## 7. NON-DEFECTS ALREADY RULED OUT

Do not re-file these; each was investigated and dismissed with evidence.

- Sheet content sitting flush to the viewport bottom: `env(safe-area-inset-bottom)` is already applied and resolves to 0 in headless Chrome, which is where it appeared broken.
- Table right-edge clipping of trailing chips: `overflow:auto` with `width:fit-content` is intended horizontal scroll.
- The mobile FAB inset was already fixed once in an earlier phase; check `012/spec.md` REQ-003 before "fixing" it again.
