# Grok 4.6 xhigh Phase Verification (round 3)

- Date: 2026-08-27 · cursor-grok-4.6-xhigh --mode ask

Round-2’s named P1s are fixed. A fresh pin sweep still found one task whose citations would send an implementer into the wrong functions.

## Round-2 P1s — remediated

**`aria-sort` is single-owned by 008.** 002 T014 / REQ-004 now only do visual sort chrome and explicitly leave `aria-sort` to 008 T020. REQ-016 forbids `role="grid"`, `aria-sort`, and related ARIA. 008 T020 writes `aria-sort` on `ColumnHeaderController.setup()` (`:20-45`, same function as 002’s `:21-47`) and the header loop at `TableRenderer.ts:440-455`. Two phases still touch that header setup, but they no longer both write the attribute.

**006’s unscheduled tray is re-pinned, not dumped on 001.** T021 / REQ-011 now target:
- `CalendarRenderer.ts:80-98` — `render()` entry
- `CalendarTimelineRenderer.ts:217-230` — `renderTimeline()` entry
- `CalendarTimelineModel.ts:764-822` — `buildCalendarTimelineEvents`, which skips undated rows (`if (!startDateKey) continue`) and is also used by `buildCalendarMonthModel`

001 T017 still owns the empty returns (`:118-124`, `:230-248`, `renderEmpty` at `:2216-2218`). Those ranges no longer appear on 006’s build task.

## Round-2 P2s — remediated

| Item | Status |
|---|---|
| 008 tablist pin | T021 / REQ-010 verify `ToolbarRenderer.ts:625-683` (`renderViewTabs`) and `DatabaseView.ts:2970` (`switchView`). No `6411-6435`. |
| 002 SC-010 vs T020 | Feature remapped to a **column-menu** filter action at `ColumnMenu.show` (`:58-66`) via `showContextMenu` (`:6197-6208`). SC-010 no longer says cell right-click. `RowMenu` stays cell/row. Predicate is thin (“append a `FilterRule`”) but the site is real. |
| 001 plan overview | Now “consuming Phase 002's grouped table headers”. T015 is consume/verify only. |
| 008 frontmatter | Descriptions say **consumption/verification** of 003 sheets and 004 tablist, not implementation. |
| 005 files-to-change | `CellRenderer.ts:332-407` (status badges). `TableRenderer.ts:74-86` is consume-only in T020/REQ-009. `:1148-1215` is gone (that span is still the multi-select popover row). |
| 002 T018 vs 007 T018 | 002 owns empty-cell copy at `CellRenderer.ts:183-204`. 007 **consumes** that surface and paints `#ERROR!` from `:177-183` + `styles.css:5878-5888`. |

## Fresh citation sample

These land on the claimed code:

- `TableRenderer.ts:88-104` grouped empty; `:440-455` header/sort; `:647-657` `"⋮⋮"`; `:69-86` `renderTable` (footer insert); `:194-239` `patchUngroupedRows`
- `DatabaseView.ts:6624-6634` `renderEmptyDashboard`; `:6366-6372` `empty.noColumnsDb`; `:4166-4175` `toggleRowsSelected`; `:2970` `switchView`; `:10220-10241` `sortByColumn`; `:7010+` selection bar; `:7971-7984` fill handle; `:10631-10646` refresh teardown; `:7626-7628` `rowMenu.attachToRow`
- `CellRenderer.ts:183-184` `"empty"` placeholder; `:418-430` click vs dblclick; `:348-355` multi-select pills; `:823-828` 1200ms `selectCell` timer
- `ColumnConfig.ts:92-117` auto-hide empty cols; `CoverImage.ts:52-61` frontmatter-only; `RecordDetailPanel.ts:192-193` `showEmptyFields`; `PopoverAutoClose.ts:12` 5s default; `ChartPalettes.ts:9-23` preset arrays
- `CalendarRenderer.ts:717, 1209-1227` existing time ruler; `:418-475` week/day mount (no `scrollTop`); `ViewSelection.ts:16-43` stable IDs; `TableKeyboardNavigation.ts:29-82` grid nav; `styles.css:85-116` status tokens; `:198-200` `outline: none`; `:4072` 34px row height; `:4168` `padding-right: 32px`; `:1324` 28px toolbar

**New false pin (not in round 2):**

**P1 — 007 T016 / REQ-012** cites `DatabaseView.ts:591-674` and `:8480-8529` as the operation-result rail. `:591-674` is Table/Board/Gallery **constructor action wiring** (`openNote`, `moveRowToPosition`). `:8480-8529` is **`cutSelectedCells` / clipboard cut**, not undo/retry. Drag-drop transaction work is correctly pinned on `DragDropFeedback.ts` and the renderer drop handlers; the rail itself is aimed at the wrong methods. An agent following T016 could hang UI off clipboard cut.

**P2 — 008 T018** third range `DatabaseView.ts:10272-10360` is `showMobileColumnWidthPanel` (it even has a local `aria-live` on the slider title). Real hover-steal is `:1437` (`matches(":hover")`); `:1206-1229` is keymap registration, related enough to keep. Companion pin, same class as round-2’s old tablist dispatch range.

**P2 — 006 T021 CSS** `styles.css:12600-12650` is mini-calendar title/nav, not a tray. TS pins are right; this is a neighborhood miss from the remap.

**P2 — 002 `plan.md` vs `tasks.md` IDs diverge.** Plan T018 is header jitter CSS; tasks T018 is empty cells (jitter is tasks T021). Canonical execution is `tasks.md`; plan IDs would reorder work inside 002, not send it to another phase.

**P2 leftovers that do not block:** `graph-metadata.json` `depends_on: []` everywhere; 001 deferred T020 still cites the old empty-return lines (marked `[B]` → 006); 001/006 still share `BoardRenderer.ts:311-351` (copy vs collapse/menu, sequenced); 008 T005 lists 8 `isPhoneLayout()` sites and omits `CalendarRenderer.ts:2085`, `CalendarTimelineRenderer.ts:2143`, `ColumnMenu.ts:667`; 007 spec files-to-change still lists `:4240-4247` as `#ERROR!` badges while tasks correctly consume 002 there; 002 plan section title vs consume-only T015 is already fixed in overview prose, 001 plan **heading** still says “Header Preservation”.

Remediation did not re-break the original ~11 pins (RangeSelection path, `getVisibleColumns`, grouped empty, `refresh()` teardown, `toggleRowsSelected`, `ColumnMenu.show`, cell pills, `makeEditable`, calendar ruler, Gallery/List totals).

## Constraints and sequencing

Standing constraints still hold in every child: display-only / iCloud-safe, no telemetry, MIT-forkable, no desktop-only APIs. 001 T011 is a helper **alongside** `RowPipeline.build()` (no return-type change). Presets stay in-memory. 006 tray drop via `dataSource.updateCell()` is user-initiated, not auto-fill. `navigator.vibrate?.()` stays guarded.

**005 before 002/003 is in task prose, not orchestration metadata.** 005 T020 declares `--db-row-height-*` 28/34/**40** at `styles.css:4070-4077`; 002 T024 consumes them in `TableRenderer.ts:74-86` and must not invent competing tokens. 005 REQ-006 defines `blur(12px)`; 003 T014 applies it. Values agree. `depends_on: []` will not stop a Wave-1 agent from starting 002/003 first; the consume wording will, if they read the tasks.

Phase 001 grouped empty vs 002 grouped rewrite is now consume-after-002. 002 header chrome vs 008 `aria-sort` is sequenced on the same `setup()` function.

---

**P1**
1. 007 T016 / REQ-012 pins the operation-result rail at `DatabaseView.ts:591-674` (renderer constructors) and `:8480-8529` (`cutSelectedCells`). Re-pin to the undo/selection-chrome surface (near `:7010` / undo action) and the actual async move completions.

**P2**
1. 008 T018 companion pin `DatabaseView.ts:10272-10360` is `showMobileColumnWidthPanel`; keep `:1430-1440`.
2. 006 T021 `styles.css:12600-12650` is mini-calendar chrome; add tray rules in a new calendar-drawer neighborhood.
3. 002 `plan.md` T-numbers do not match `tasks.md` (plan T018 ≠ tasks T018).
4. `graph-metadata.json` `depends_on` is still `[]`; 005-before-002/003 lives only in task text.
5. 008 T005 misses three `isPhoneLayout()` methods (calendar, timeline, column menu).
6. Sequenced same-function shares remain (001/006 board header; 002/007 `setupRowDrag`; 002/007 `:4240-4247` generic `td` padding as empty-cell CSS).

VERDICT: CONDITIONAL
