---
title: "Acceptance Criteria: Board Anytype Parity"
description: "The criteria this packet must satisfy before it may be closed, one threshold per requirement, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "056 acceptance criteria"
  - "board anytype closure gate"
  - "kanban parity ac"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-06T23:10:00Z"
    last_updated_by: "verification-leaf"
    recent_action: "landed T014-T016: page scroll, invisible scrollbar, left-aligned card text (ADR-008)"
    next_safe_action: "Nothing owed here; AC-010 is the operator's own device confirmation"
    blockers:
      - "AC-010 is operator-owned and nothing in this repository can close it"
    key_files:
      - "src/views/board-renderer.ts"
      - "styles.css"
      - "tools/live/render-assertions.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-ac"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "The sticky scrollbar's geometry is adopted and its colours are not (050 REQ-003)"
      - "The kanban page limit is 10, per-layout, not the withdrawn flat 60 (053 D4)"
      - "The desktop column header carries no record count; the phone does"
      - "All ten AC-011 residuals are fixed, R6/R7 included, both ADR-006 and ADR-007 Implemented"
      - "AC-012/AC-013 Met: the page scrolls, not a column, and desktop scrollbar chrome hides at rest (ADR-008)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Anytype Parity

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/056-board-anytype-parity
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC-001 through AC-009 align to REQ-001 through REQ-009. AC-010 is the operator's.

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390x844 profile with a navbar present. Every threshold carries a failing value
observed on HEAD before the fix (goal D2), recorded in `checklist.md`. Exit statuses are read from
`$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the 62 kanban capture files on disk, **When** an image-capable leaf reads them px by px, **Then** all 13 anatomy elements are recorded in `design-trueup.md`, each with a capture filename and either a measurement or the **design inferred** label with its reason | T001's read, landed 2026-09-05. `design-trueup.md` sections 2-3: 33 of 62 files opened, all 20 set captures scanned programmatically, **9 measured + 4 labelled design inferred + 1 inference inside A13** = 13 of 13, each naming its capture. No row needed "pixel read owed" (`054` ADR-005); every value came off a PNG | **Met** | - |
| AC-002 | REQ-002 | **Given** `spec.md` section 4's per-element migration table, **When** every row is filled, **Then** 0 cells read `unknown` and each of the 39 `pm-*` classes is either replaced or carries a written reason for staying | The table, read row by row. All 24 rows filled by T001, 0 reading `unknown`; the extensions table T003/T004 added names `retire` or `fold` for all seven | **Met** | - |
| AC-003 | REQ-003 | **Given** 39 constructed `pm-*` classes and 23 `pm-kanban-*` stylesheet rules on `3407dab0`, **When** the retarget lands, **Then** both counts reach 0 undispositioned survivors | `grep -o "pm-[a-z-]*" src/views/board-renderer.ts \| sort -u \| wc -l` and `grep -o "pm-kanban[a-z-]*" styles.css \| sort -u \| wc -l`, read directly. Both **0** at `772bf57a`+this leg | **Met** | - |
| AC-004 | REQ-004 | **Given** no sticky scrollbar exists on the board today, **When** the board is taller or wider than the viewport, **Then** a horizontal scrollbar renders 10px tall, 8px above the viewport bottom, full content width, within +/- 1px, with colours from the theme's scrollbar tokens | `050/design-trueup.md` REQ-003 for the captured geometry; measured after on the production render path. Anytype's `#B6B6B6`/`#EBEBEB` is declined with its reason: an Obsidian plugin lets the reader's theme own scrollbar chrome. `::-webkit-scrollbar{height:10px}` plus an 8px `padding-bottom` on the view root land the geometry; colours read `--db-scrollbar-thumb`/`--db-scrollbar-thumb-hover`, the theme tokens every other scrollbar in this plugin already uses. **The host moved 2026-09-06 (ADR-008, second take):** the rule hangs off `.note-database-container.db-kanban-view` rather than `.db-kanban-board`, because the container is the element that scrolls and only a pane-height scroller paints a bar at the viewport bottom — which is where the trueup measured it (y 1199..1208 of 1217). The geometry is unchanged; AC-012 supersedes only its *painted-at-rest* half | **Met** | - |
| AC-005 | REQ-005 | **Given** 7 affordances gated behind `boardExtensions = false` (`board-renderer.ts:203-206`), **When** each is dispositioned, **Then** the count shipping default-off is 0 and each carries `retire` or `fold` | `rg -n "boardExtensions" src/views/board-renderer.ts`, plus the migration table's disposition column. The flag and its render branch still exist in the file (a named, deferred cleanup — `spec.md`'s extensions table, now also `tasks.md` T013); every one of the seven affordances itself carries `retire` or `fold` and none is reachable only through a default-off path in the shipped app. Re-verified on the rebased tree and stronger than the leg claimed: `boardExtensionsEnabled` is not in the view-config reader's key allowlist in `src/data/data-source.ts`, so a vault's `data.json` cannot switch it on either — a stored view carrying it parses cleanly and drops it, locked by a test in `src/data/data-source.test.ts` with its own negative control | **Met** | - |
| AC-006 | REQ-006 | **Given** `045`'s card-property mechanism, **When** its row presentation is retargeted, **Then** `board-card-properties-panel.test.ts` is green with 0 lines changed and the panel's public surface is unchanged | `git diff --stat src/views/board-card-properties-panel.test.ts` and the suite result. **0 lines changed**, file untouched; `npx vitest run` on both card-property suites: exit 0, 2 files / 19 tests | **Met** | - |
| AC-007 | REQ-007 | **Given** 12 registered sheet surfaces and 31 registered stacked pairs, **When** the last leg lands, **Then** `sheet-grammar.mjs` still reports 12 and 31 green at exit 0 | `node tools/live/sheet-grammar.mjs`, exit read from `$?`. Exit **0**, unchanged | **Met** | - |
| AC-008 | REQ-008 | **Given** the kanban layout's captured page limit of 10, **When** the board applies a limit, **Then** it is 10, or our own number argued rather than cited | `anytype-menu-set-layout-kanban-page-limit-*`. `053` D4 withdrew `050`'s flat 60: the limit is per-layout, Gallery 60 and Kanban 10, absent elsewhere. The board now applies **10** per column through a local `boardConfig` (real config, or a shallow copy carrying `groupRowLimit: 10` when unset) read only at the board's own call sites, without moving the shared `groupRowLimit` default any other view reads | **Met** | - |
| AC-009 | REQ-009 | **Given** T002's pre-leg `pm-gantt-*` count and gantt capture hashes, **When** every board leg has landed, **Then** both are identical or a move is explained by a named gap from this packet | T002 baselines, T010 re-reads. `037`'s in-repo parity was 60 of 60 classes with zero divergence at `30c4b746`. Never rebaselined silently. Re-read at `772bf57a`+this leg: the specified command still reads **119**; `constructed-timeline` capture hashes unchanged (`layoutHash=a3e2342c477f`, `pixelHash=77426bf96fb6` desktop dark) | **Met** | - |
| AC-010 | OPERATOR | **Given** a release carrying the rebuilt board, **When** the operator opens it on iOS and on desktop beside Anytype, **Then** they report it as Anytype-shaped | The operator's own words. Nothing in this repository can close this row, and an agent never ticks it | Unmet | - |
| AC-011 | REQ-002 | **Given** `design-trueup.md`'s measured geometry, **When** the landed board is measured back off its own captures and its own stylesheet, **Then** every adopted value matches within +/- 1px or carries a named, ADR-backed reason for not matching | `tasks.md` T012 rows R1-R5 and R8-R10 fixed and re-measured at DPR 2 by a leg that did not write the original implementation: chip height 24px (was 26), property pitch a uniform 25px (was ~28.3px average), the title icon slot forced onto every card at 16px (was absent by default, 18px when present), phone column/gap geometry confirmed via computed style under a real `is-phone` mount, the constructed board's phone capture now shows the permanent count and controls, the checkbox glyph is a circle at 14px, the empty-column title wraps inside its card, and `render-assertions`' own board geometry pass locks six of those values against computed styles, with a negative control (card radius 8px to 2px) proving it is non-vacuous. Re-read at DPR 2 off the recaptured PNGs by the landing leg: chip band 48 device px against 52 before, property rows a flat 50 device px across three seven-row repeats against 406/7 = 58 before, checkbox a 28x28 device-px disc, phone card 510 device px wide with a 46px gutter. Two claims are corrected rather than repeated: the 0.7pt phone hairline paints identically to 1px and no capture can show it, and **no capture can show the title icon slot at all** — every board harness stubs `renderRecordIcon` to null, so R3's evidence is the renderer test plus the computed 16px box and not a picture. **R6 and R7 are now landed too**, closing every row of T012: the header chip reads `background: var(--db-status-bg, transparent)` (the tag chip's own fill property) instead of staying unfilled, and the grey/ungrouped bucket moved off a red-tinted derivation onto a true neutral, `#656565` on `#E3E3E3` light / `#ADADAD` on `#414141` dark. Every tint stayed exactly the value `design-trueup.md` A9 measured off Anytype — all ten, both themes — and only the text was darkened, which is what the ruling asks for. Re-measured independently by the landing leg against WCAG 1.4.3, per colour, both themes, text-on-tint and text-on-page: twenty-two pairs, all at or above 4.5:1, no exceptions to name; tightest light teal `#1B7471` on `#CFEEED` at 4.52:1, widest light blue `#0B35DA` on `#DDE3FB` at 6.49:1 (the earlier report's "grey tightest at 4.54:1" was one row off). Confirmed on six recaptured PNGs read beside the Anytype reference: `constructed-board-desktop-{dark,light}`, `board-view-desktop-light`, `board-view-mobile-dark`, `board-empty-column-desktop-light`, `constructed-board-empty-column-mobile-light`; chip band re-measured off the capture at 48 device px (24 CSS px) and the property rhythm at 25 CSS px, so R1/R2 geometry is intact under the fill. `decision-record.md` ADR-006 and ADR-007 both carry **Implemented** status | **Met** | - |
| AC-012 | REQ-004 (2026-09-06 amendment, ADR-008) | **Given** a board taller and wider than the viewport on desktop and on phone, **When** the reader scrolls, **Then** the page scrolls, no element inside the board is a vertical scroll container, and 0 px of scrollbar chrome is painted on desktop at rest | **Was red in the landed stylesheet** — `.db-kanban-cards` `overflow-y: auto`, `.db-kanban-view` `overflow: hidden; height: 100%`, and a **10px** `::-webkit-scrollbar` on `.db-kanban-board`. **A first take on 2026-09-06 did not close this and is recorded rather than overwritten:** it removed the column scrollers but left the board a flex item at the default `flex-shrink: 1` with its own `overflow-y: hidden`, so in a pane with a definite height the board shrank back to the container height and clipped the rest — container `scrollHeight 908 / clientHeight 908`, a real 600px wheel moving `scrollTop` 0, the last card of a 35-card column unreachable. **Landed 2026-09-06, second take.** Both axes belong to `.note-database-container.db-kanban-view` (`overflow: auto` from the base rule); `.db-kanban-board` drops its own overflow and takes `flex-shrink: 0`; `align-items: flex-start` keeps columns ending at different heights, matching the Anytype captures. The column header is **not** pinned — the ADR-008 amendment records why the first take's inference was withdrawn. `.note-database-container.db-kanban-view::-webkit-scrollbar` paints `0` at rest and `10px` on hover or an `.is-scrolling` class the renderer's own container scroll listener toggles (600ms after the last scroll event); touch is guarded out through `:has(.db-kanban-board.is-touch)` and keeps the platform's native overlay indicator. **Measured at 1440x900 and 390x844, DPR 2:** container `scrollHeight 7758 / clientHeight 908`, trusted wheel 600px moves the container 600 and the board and column 0, `PageDown` 868, end-of-scroll `6857 = scrollHeight - clientHeight` with the last card fully inside the container box; `overflow-y` computes `visible` on the board, the column and the cards container; at 390px `scrollWidth 1383 / clientWidth 382`, a trusted horizontal wheel moves `scrollLeft` 300 and the last column's right edge lands exactly at the container's right edge. Five `render-assertions.mjs` board-geometry rows (page-scroll reachability, column/board scroll, scrollbar rest, scrollbar active, header position) read red against the first take's own stylesheet (`"auto" / 0 / false`, `"visible" / "hidden"`, `"8px"`, `"8px"`, `"sticky"`) and green after (`"auto" / 16239 / true`, `"visible" / "visible"`, `"0px"`, `"10px"`, `"static"`). `npx vitest run` 141 files / 1501 tests, including the cross-column drag tests; drag re-measured under a 400px page-scroll offset, landing in `doing` from `backlog`. **Supersedes AC-004's visible sticky bar on the operator's ruling** — see ADR-008 and `../roadmap.md` §7 | Met | - |
| AC-013 | REQ-002 (2026-09-06 amendment) | **Given** a card carrying a long text value and a URL, **When** the card renders, **Then** every text value is left-aligned and a single-token value is ellipsised at the content edge rather than broken mid-word | **Was red on the operator's own ~10:30 desktop capture** — one text value right-aligned, one URL broken as *"northwin d-logistics"*. **Landed 2026-09-06.** `.db-kanban-card-meta .db-board-card-value` overrides the shared (gallery-authored) `text-align: right; word-break: break-word` back to `text-align: left; word-break: normal; overflow-wrap: normal`, scoped to the kanban card so gallery's own alignment is untouched. Multi-word text still wraps up to two lines through the shared field's own `-webkit-line-clamp: 2`; a single-token value now has nowhere to force a mid-word break, so `text-overflow: ellipsis` truncates it at the line edge instead. Two `render-assertions.mjs` pins ("value align", "value wrap") read `"right"`/`"break-word"` red on the pre-edit tree and `"left"`/`"normal"` green after. Re-measured at DPR 2 on the second take: every card property value computes `text-align: left` with its painted ink 1px from the card's inner left inset, on every row, at 1440x900 and 390x844; a 68-character unbreakable token stays on one line (ink height 16px) clipped at a value box that itself ends 1px inside the card. Eight recaptured board PNGs opened across both themes and both devices (`constructed-board-desktop-{dark,light}`, `board-view-desktop-dark`, `board-view-mobile-dark`, `board-empty-column-desktop-dark`, `constructed-board-empty-column-desktop-dark`, `board-drop-language-desktop-dark`, `constructed-board-card-properties-hidden-desktop-dark`, `board-subtask-tree-mobile-dark`): every text value reads left-aligned, 0 mid-word breaks | Met | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. An unbacked waiver is
treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Not closeable — one row is open, and it is the operator's.** Thirteen rows, **twelve Met and one
Unmet**. T001's capture true-up closed AC-001; T002's red-first pass recorded the failing figure
for every remaining row in `checklist.md`; T004 through T009 implemented the rebuild, retargeted
the property rows, dispositioned the seven extensions, and re-ran every gate, closing AC-002
through AC-009; T012 and T013 closed AC-011, fixing the ten residuals a fresh read-back found and
removing the `boardExtensionsEnabled` dead branch; T014 through T016 closed AC-012 and AC-013, the
operator's page-scroll and scrollbar-chrome ruling (ADR-008) and the two card-text defects the same
report carried. AC-010 is the operator's and is closed by nobody here — shipped and verified are
not the same state as operator-confirmed (parent D3).

**AC-011 was opened on a read-back, not on a new requirement.** AC-002 and AC-003 asked whether the
migration table was filled and whether the Project Manager vocabulary was gone. Both are, and both
stay Met. Neither asked whether the values in that table reached the rendered surface, and ten of
them did not — `tasks.md` T012. The two counts AC-003 measures can be 0 and 0 while a chip paints
two pixels too tall, which is exactly what happened; a criterion counting class names cannot catch
it, so the row is added rather than folded into one that already passed for a different reason.

**AC-002 through AC-009 were re-run on the rebased tree**, at `793ab9b4` plus this phase, by a leg
that did not write the implementation. Confirmed: both class counts **0** and `pm-gantt-*` still
**119**; `board-card-fields.ts` and `board-card-properties-panel.ts` **0 lines changed against
`origin/main`** with both suites green at **19 of 19**; `sheet-grammar.mjs` **12 surfaces, 31
stacked pairs**, exit 0; the page limit **10** applied through a local `boardConfig`; the seven
extensions each `retire` or `fold` with none reachable from a stored view; the CSS lane's history
**appended, never rewritten** — 297 entries from `origin/main` plus this phase's acquire and
release; every `screenshots/project-manager/*` capture pixelHash-identical to `origin/main`, and
exactly 32 board captures moved. `npm run gate` **26 green, exit 0**, read from `$?`. Re-run in full on the rebased tree at `origin/main` `6c718f63` plus this phase: **26 green, exit 0**, 1426 tests over 137 files, 550 captures current, 44 board captures moved against `origin/main` and no other capture family did.

**Two criteria were written against a target the captures disproved**, and their thresholds moved
rather than their status: AC-002's table no longer expects a record-count row for the desktop
column header, and the phone rows it covers are measured rather than inferred from the desktop.
`design-trueup.md` C1 and C2 carry the corrections.

**AC-011 closed on the same read-back's own fix, and R6/R7 close it a second time.** Eight of
T012's ten rows were fixed and re-measured at DPR 2 by the read-back leg; R6 and R7 were left
unresolved by instruction, named as the operator's. The operator has since ruled on both — verbatim,
*"Anytype tint fill"* and *"Neutral, match Anytype"* — and a follow-up leg landed both in the same
stylesheet edit, closing every row `tasks.md` T012 opened. T013 removed the branch AC-005 had already
found unreachable, and the removal cascaded into the harness/fixture surfaces that branch alone
reached — named in `tasks.md` T013 rather than left as silent scope creep.

**Three things the landing leg found and fixed rather than certified.** The T013 retirement was
incomplete: `tools/live/constructed-state-assertions.mjs` still mounted both retired surfaces and
exited **1 with five failures**, unnoticed because it is not one of the gate's 26 lanes; sixteen
tracked PNGs of those surfaces were orphaned on disk with no manifest entry and no check that would
ever report them; and R10's fix had added a 27th gate lane against an existing-lanes-only
constraint. All three are closed — the state assertions exit 0, the orphans are deleted, and the six
pins live in `render-assertions` (`decision-record.md` ADR-005) with the gate back at 26. Three
residuals were named in `tasks.md` T013; two are now closed by the follow-up leg and one remains,
each with its reason: `ViewConfig`'s inert `boardExtensionsEnabled` field stays (removing it would
edit the file AC-006 pins at zero lines); the kanban card's `role="row"` now has its `role="grid"`
ancestor (`.db-kanban-board` gains the attribute, checked by a DOM-ancestry test rather than a source
grep); `database-view.ts`'s dead `.db-board-card-checkbox`/`.db-board-column-checkbox`
selection-sync loops are removed.

**The follow-up leg also closed the CSS-lane's own outstanding note about the `db-board-*` family**:
a per-rule audit kept the eleven selectors the kanban card and the record detail panel's shared open
button still build, and deleted the rest — the whole retired-extensions column/header/card family,
its drag states, its resize handle, and `--db-board-column-width`'s one dead reader along with it.

Shipped, verified and operator-confirmed are three states and only the third closes (parent D3).
<!-- /ANCHOR:closure -->
