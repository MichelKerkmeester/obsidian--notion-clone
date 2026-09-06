---
title: "Verification Checklist: Board Anytype Parity"
description: "The thresholds with the failing measurement recorded first, so a pass means the board actually changed rather than a check being added."
trigger_phrases:
  - "056 checklist"
  - "board anytype thresholds"
  - "kanban parity verification"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Board Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per acceptance criterion, numbered to match `AC-0NN`. Desktop measurements are taken on the
real renderer at the production mount point; phone measurements on a 390x844 profile with a navbar
present. **T002 fills every `Today` cell that carries a mechanism rather than a figure** — a "today"
cell written after the fix is a cell nobody can check against the tree that produced it.

**Priority:** C1 through C5 and C7 are P0. C6, C8 and C9 are P1. C10 is the operator's.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Thirteen anatomy elements trued (AC-001) | **Was 0 of 13** — `design-trueup.md` did not exist and the 62 capture files were unread. **Now 13 of 13**, 2026-09-05: nine measured (A1, A2, A4, A5, A8, A9, A10, A12, A13) and four labelled **design inferred** with their reason (A3's rendered cover, A6, A7, A11), plus a fifth inference inside A13 for the behaviour past the limit | 13 of 13, each with a capture filename and a measurement or a labelled inference | [x] `design-trueup.md` sections 2-3; 33 of 62 files opened, all 20 set captures scanned programmatically |
| C2 | Migration table complete (AC-002) | **Was no table** — `spec.md` section 4 carried a skeleton, 11 of 14 rows reading "Owed to T001" and 3 reading "retire or fold, T003". **Now 23 rows filled**, 0 reading `unknown`; the 4 T003 rows keep their disposition marker and carry the capture evidence T003 needs (`design-trueup.md` section 7). All **39** constructed classes are accounted for. **T003/T004 added the seven-extension disposition table** (`spec.md`, "The seven local extensions") naming `retire` or `fold` for each, closing the one cell the migration table itself left to a later task | 0 cells reading `unknown`; every `pm-*` class replaced or reasoned | [x] `spec.md`'s per-element table (24 rows) plus the extensions table (7 rows), 0 `unknown` |
| C3 | PM vocabulary gone or dispositioned (AC-003) | **39 constructed, 23 styled.** Measured 2026-09-05 on `3407dab0`: `grep -o "pm-[a-z-]*" src/views/board-renderer.ts \| sort -u \| wc -l` → **39**; `grep -o "pm-kanban[a-z-]*" styles.css \| sort -u \| wc -l` → **23**. The 39 are the `pm-kanban-*` set (17), the `pm-chip` family (7), `pm-avatar` (4), `pm-progress` (4), plus `pm-dragging` and the card/board/view/col roots. **T002 re-ran both on 2026-09-06 at `cc5a7ff2`: unchanged, 39 and 23**. **T004/T006 landed the retarget on `772bf57a`+this leg:** the same two commands now read **0** and **0** — the retired classes (`pm-kanban-*`, `pm-avatar*`, `pm-progress*`, the board-only `pm-chip` variants) are gone from both files, and the two remaining prose mentions of a historical class name (in a code comment and a CSS comment, not a construction or a rule) were reworded so the literal grep reads zero rather than carrying an asterisk | **0** undispositioned survivors in each count | [x] |
| C4 | Sticky horizontal scrollbar (AC-004) | **absent.** `050/design-trueup.md` REQ-003, measured 2026-09-05: *"`src/views/board-renderer.ts` contains no sticky scrollbar and no `position: sticky` on a scroll rail; `styles.css` has no board-scrollbar rule. This one is a real gap."* Anytype's, on the same pass: **10px tall, 8px above the viewport bottom, full content width**, y 1199..1208 of a 1217px viewport, thumb `#B6B6B6` on track `#EBEBEB`, present on the kanban and the grid alike. **T001 re-measured it independently 2026-09-05 and got the same rows and the same hex**, off `anytype-project-tracker-kanban-light.png` and `-grid-light.png`; thumb x 668..1707 on a track running to x 2100, dark pair `#737373` on `#292929`. The declined colour pair measures **1.70:1** thumb-on-track, so the platform decline now also has a WCAG number. **T002 re-checked 2026-09-06 at `cc5a7ff2`:** `rg -n "scrollbar" styles.css -i \| rg -i "board"` → 0 matches; still absent. **T006 added it on `772bf57a`+this leg:** `.note-database-container .db-kanban-board::-webkit-scrollbar { height: 10px }` plus a `padding-bottom: 8px` on `.db-kanban-view` (the same box the sticky rail sits inside) place the thumb 8px above the true bottom; thumb/hover colours read `var(--db-scrollbar-thumb)`/`var(--db-scrollbar-thumb-hover)`, the same theme tokens `.note-database-container`'s own scrollbar already uses | Present at 10px / 8px / full width **± 1px**, colours from the theme's scrollbar tokens (the colours are declined with their reason: this is an Obsidian plugin and the reader's theme decides) | [x] |
| C5 | Extensions retired or folded (AC-005) | **7 default-off.** `src/views/board-renderer.ts:203-206`: `private boardExtensions = false` with the comment *"Local extensions (swimlanes, covers, WIP counts, summaries, batch order, touch menus, group controls) render only when the view opts in; the default layout is the one-to-one kanban copy, which has none of them."* The reason they are dark is the target this packet replaces | **0** shipping default-off; each of the seven carries `retire` or `fold`. **T001 changed this: four have captured counterparts, not two** — covers (`anytype-menu-set-layout-kanban-cover-*`), group controls (`anytype-menu-set-layout-kanban-group-by-*`), touch menus (`anytype-mobile-sheet-kanban-column-menu-*`, a permanent per-column `···` opening a handled sheet with `Hide column`, a colour-disc row and an `Apply` pill) and WIP counts (the phone's plain-text record count). Swimlanes, summaries and batch order have **no counterpart in any of the 62 files**. **T002 re-checked 2026-09-06 at `cc5a7ff2`:** `rg -n "boardExtensions" src/views/board-renderer.ts` → same declaration at line 206, `false`, comment unchanged. **T003/T007 dispositioned all seven on `772bf57a`+this leg** (`spec.md`'s extensions table): covers, group controls, touch menus and the phone record count are `fold` — each now unconditional in the rebuilt default board; swimlanes, summaries and batch order are `retire` — none is called from the default board's render path. `rg -n "boardExtensions" src/views/board-renderer.ts` still matches (the flag and its already-UI-unreachable render branch are a named, deferred code deletion, not claimed done); what closes this row is that none of the seven affordances is reachable **only** through that flag any more | [x] |
| C6 | `045`'s mechanism intact (AC-006) | **green and untouched today** — `board-card-properties-panel.test.ts` and `board-card-fields.test.ts` both exist and pass on `3407dab0`; T002 records the suite's pass count so a later green is comparable. **T002 measured 2026-09-06 on `cc5a7ff2`:** `npx vitest run src/views/board-card-properties-panel.test.ts src/views/board-card-fields.test.ts` → exit **0**, `Test Files  2 passed (2)`, `Tests  19 passed (19)`. **T005 confirmed on `772bf57a`+this leg:** the retarget touched `board-renderer.ts`'s CSS-facing wrapper class and `styles.css` only; `board-card-fields.ts` and `board-card-properties-panel.ts` are byte-for-byte unchanged, and the same command still reads exit **0**, 2 files / 19 tests | Both green after the last leg, and `git diff --stat src/views/board-card-properties-panel.test.ts` → **0** lines changed | [x] |
| C7 | `044` grammar + `048` stacking hold (AC-007) | **conforming today — T002 records the figure.** The registered set is 12 surfaces and 31 stacked pairs (`051/checklist.md` C8, measured 2026-09-05); this packet must not move it. **T002 measured 2026-09-06 on `cc5a7ff2`:** `node tools/live/sheet-grammar.mjs` → exit **0**, every printed check `PASS`, closing with `sheet-grammar: PASS`. The registry itself counts to **12** surfaces and **31** stacked pairs (`node -e` walk of `REGISTERED_SURFACES`/`REGISTERED_STACKED_PAIRS` literals in `tools/live/sheet-grammar.mjs`), unmoved from `051`'s figure. **Re-run on `772bf57a`+this leg after every code and CSS edit:** exit **0**, every check `PASS`, 12 surfaces / 31 stacked pairs unmoved | 12 and 31 still green, `node tools/live/sheet-grammar.mjs` exit 0 read from `$?`, after every leg | [x] |
| C8 | Page limit follows the captured value (AC-008) | **T002 records what the board applies today.** The captured Anytype value is **10**, confirmed by T001 off `anytype-menu-set-layout-kanban-page-limit-dark.png` as the selected item of `10 / 20 / 50 / 70 / 100`; `050`'s original flat **60** was withdrawn by `053` D4, which found the limit per-layout — Gallery 60, Kanban 10, no row at all on Grid, List, Calendar or Graph. **T002 measured 2026-09-06 on `cc5a7ff2`:** the board applies **no per-layout limit at all**. `rg -n "pageLimit\|PAGE_SIZE\|pageSize\|recordLimit\|maxRecords" src/views/board-renderer.ts` → 0 matches; the only row-count mechanism in the file, `getGroupVisibleCount` (`src/data/group-visibility.ts:97-104`), reads one `config.groupRowLimit` shared by every layout — kanban, gallery, grid, table, calendar alike — defaulting to **0 = unlimited** (`getGroupRowLimit`, `group-visibility.ts:91-93`), with presets `[10, 25, 50, 100]` offered identically on every layout (`toolbar-renderer.ts:1907-1912`). There is no kanban-specific default and no per-layout differentiation to compare against Anytype's per-layout 10. **T004 landed the retarget on `772bf57a`+this leg:** the rebuilt default column builds a local `boardConfig` — the real `config` unchanged when `groupRowLimit` is already set, or a shallow copy with `groupRowLimit: 10` when it is not — and reads `getGroupVisibleCount`/`renderGroupExpandControls` through that local value only. `group-visibility.ts`'s shared `getGroupRowLimit` and its 0-is-unlimited default are untouched, so no other layout's own default moves; `rg -n "boardConfig" src/views/board-renderer.ts` shows the one declaration and its two read sites | 10, or our own number argued rather than cited | [x] |
| C9 | The gantt did not move (AC-009) | **T002 records the baseline before the first leg**: `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css \| sort -u \| wc -l`, plus the gantt capture hashes. `037`'s in-repo parity was verified at `30c4b746` — 60 of 60 `pm-gantt-*` classes matched with zero divergence — and this packet must leave that true. **T002 measured 2026-09-06 on `cc5a7ff2`:** the exact command → **119** (62 unique matches in `src/views/calendar-timeline-renderer.ts`, 57 unique in `styles.css`; run against two files, `grep` prefixes each match with its filename before `sort -u`, so same-named classes in both files are not collapsed into one — this is not the same tally as `037`'s 60-of-60 class-intersection check at `30c4b746`, it is this literal command's own number, to be re-run identically by T010). Gantt capture hashes, from `screenshots/manifest.json`'s `constructed-timeline` scenario (`sources` names `src/views/calendar-timeline-renderer.ts`): desktop `layoutHash=a3e2342c477f` (dark `pixelHash=77426bf96fb6`, light `pixelHash=0c74703295cb`), mobile `layoutHash=42f14b002c40` (dark `pixelHash=bc8e22947f5f`, light `pixelHash=5d8df03a5f2b`). **T010 re-read on `772bf57a`+this leg:** the exact command still reads **119**, unmoved; `constructed-timeline`'s `layoutHash`/`pixelHash` pair for desktop dark is still `a3e2342c477f`/`77426bf96fb6`, byte-identical. `calendar-timeline-renderer.ts` and the gantt's own `pm-gantt-*` styles.css rules were not opened by this leg | Identical to the baseline, or a move explained by a named gap. Never rebaselined silently | [x] |
| C10 | **OPERATOR** — the board reads as Anytype on device (AC-010) | not asked; the packet was opened 2026-09-05 ~22:45 and nothing has shipped | The operator's own side-by-side, iOS and desktop | [ ] |
<!-- /ANCHOR:protocol -->

---

## The check that the rest are not theatre

Every row above is written so it can be observed **red today**. C3, C4 and C5 already carry a
figure read off `3407dab0`; C1 and C2 carry the absence of a file. C6 through C9 carried a mechanism
and are now T002's numbers, measured 2026-09-06 at `cc5a7ff2`: C6 is two green suites (19 tests),
C7 is 12 surfaces / 31 stacked pairs at exit 0, C8 is the absence of any per-layout limit at all
(one shared unlimited-by-default setting, not Anytype's per-layout 10), and C9 is 119 by the exact
specified command plus the `constructed-timeline` capture hashes. C3, C4 and C5 were independently
re-run at `cc5a7ff2` and are unchanged from `3407dab0`.

`050`'s true-up found **six** false premises in its own criteria — thresholds asserted as failing
that could not actually be observed failing. That is the failure this section exists to prevent
repeating, and it is why a `Today` cell filled in after the fix does not count.

**T001 found two false premises of its own, and neither was in a `Today` cell.** Both were in the
*target* column, which this section did not guard: `spec.md` A1 asked for a record count the desktop
does not have, and section 12 treated the phone board as uncaptured when
`anytype-mobile-set-kanban-{light,dark}.png` is exactly that. A red observed against a target that
was never real is still theatre. Both are corrected in `spec.md` and recorded in
`design-trueup.md` C1 and C2.

**C1 through C9 are now green, measured on `772bf57a` plus this leg's own commits, and each row
above carries the red figure beside the green one rather than a green written over it.** C2's
migration and extensions tables are filled with 0 `unknown` cells. C3's two grep counts are 0 and
0. C4's sticky scrollbar exists at the captured geometry with theme-token colours. C5's seven
extensions each carry `retire` or `fold`, with the flag's own now-dead render branch named as a
deferred cleanup rather than claimed deleted. C6's two card-property suites are untouched and
green. C7's sheet grammar is unmoved at 12/31. C8 applies a local, board-scoped 10-row default.
C9's gantt count and capture hashes are byte-identical to the pre-leg baseline. `npx tsc --noEmit`,
`npx vitest run` (1323 tests, 127 files) and `npm run build` all exit 0, and `npm run gate` reports
26 green. C10 is the operator's and stays open — nothing in this repository closes it.

**2026-09-06, a fresh read-back reopened C2 narrowly and closed it again.** The migration table's
filled cells did not all reach the rendered surface: `tasks.md` T012 named ten residuals against
`design-trueup.md`'s own measurements. Eight are fixed and re-measured at DPR 2 (`tasks.md` T012's
red/green table); R6 and R7 stay open, named for the operator rather than folded into a green row.
T013's dead `boardExtensionsEnabled` branch is removed. `render-assertions`' own board geometry pass
now locks card radius, column width, column gap, chip height, property pitch and checkbox shape
against computed styles — proven non-vacuous by a negative control on the card radius, and hosted by
an existing lane rather than a new one (`decision-record.md` ADR-005), so the gate count is
unchanged.

**Re-verified 2026-09-06 on the rebased tree by a leg that wrote none of the fixes**, against
`origin/main` `3b3ac633`. Read back in device pixels off the recaptured PNGs rather than taken from
the report: chip band **48 device px** (24 CSS) against 52 (26) before; property rows a flat **50
device px** (25 CSS) across three seven-row repeats against 406 over seven (58 / 29 CSS) before;
checkbox a **28x28 device-px** disc with a symmetric taper, so a circle at 14 CSS px; phone card
**510 device px** wide with a **46px** gutter, i.e. 255 / 23 CSS against the declared 254.7 / 23.3.
Two of the leg's own claims are corrected: the 0.7pt phone hairline paints two solid device pixels,
identical to the desktop 1px border, so nothing in a capture can tell them apart; and no capture can
show the 16px title icon slot at all, because every board harness stubs `renderRecordIcon` to null.
The T013 retirement was also incomplete — `constructed-state-assertions.mjs` exited 1 with five
failures on the landed tree and 16 orphaned PNGs were still tracked; both are closed here.
`npx tsc --noEmit`, `npx vitest run` (**137 files, 1425 tests**) and `npm run build` all exit 0;
`node tools/screenshots/verify.mjs` reports 550 current; `node tools/lane/check-lane.mjs` exits 0;
the isolated `SURFACE_PHASE=056-board-anytype-parity npm run gate </dev/null` reports **26 green**,
`$?` read from a file.
