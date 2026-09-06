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
    last_updated_at: "2026-09-06T05:42:29Z"
    last_updated_by: "verification-leaf"
    recent_action: "fixed T012 R1-R5/R8-R10 and removed the T013 dead branch; AC-011 Met, R6/R7 stay operator's"
    next_safe_action: "Nothing owed here; AC-010 is the operator's own device confirmation"
    blockers:
      - "AC-010 is operator-owned and nothing in this repository can close it"
    key_files:
      - "src/views/board-renderer.ts"
      - "styles.css"
      - "tools/live/board-geometry.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-ac"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions:
      - "The sticky scrollbar's geometry is adopted and its colours are not (050 REQ-003)"
      - "The kanban page limit is 10, per-layout, not the withdrawn flat 60 (053 D4)"
      - "The desktop column header carries no record count; the phone does"
      - "The ten AC-011 residuals are fixed except R6/R7, left for the operator by instruction"
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
| AC-004 | REQ-004 | **Given** no sticky scrollbar exists on the board today, **When** the board is taller or wider than the viewport, **Then** a horizontal scrollbar renders 10px tall, 8px above the viewport bottom, full content width, within +/- 1px, with colours from the theme's scrollbar tokens | `050/design-trueup.md` REQ-003 for the captured geometry; measured after on the production render path. Anytype's `#B6B6B6`/`#EBEBEB` is declined with its reason: an Obsidian plugin lets the reader's theme own scrollbar chrome. `.db-kanban-board::-webkit-scrollbar{height:10px}` plus an 8px `padding-bottom` on the view root land the geometry; colours read `--db-scrollbar-thumb`/`--db-scrollbar-thumb-hover`, the theme tokens every other scrollbar in this plugin already uses | **Met** | - |
| AC-005 | REQ-005 | **Given** 7 affordances gated behind `boardExtensions = false` (`board-renderer.ts:203-206`), **When** each is dispositioned, **Then** the count shipping default-off is 0 and each carries `retire` or `fold` | `rg -n "boardExtensions" src/views/board-renderer.ts`, plus the migration table's disposition column. The flag and its render branch still exist in the file (a named, deferred cleanup — `spec.md`'s extensions table, now also `tasks.md` T013); every one of the seven affordances itself carries `retire` or `fold` and none is reachable only through a default-off path in the shipped app. Re-verified on the rebased tree and stronger than the leg claimed: `boardExtensionsEnabled` is not in the view-config reader's key allowlist in `src/data/data-source.ts`, so a vault's `data.json` cannot switch it on either — a stored view carrying it parses cleanly and drops it, locked by a test in `src/data/data-source.test.ts` with its own negative control | **Met** | - |
| AC-006 | REQ-006 | **Given** `045`'s card-property mechanism, **When** its row presentation is retargeted, **Then** `board-card-properties-panel.test.ts` is green with 0 lines changed and the panel's public surface is unchanged | `git diff --stat src/views/board-card-properties-panel.test.ts` and the suite result. **0 lines changed**, file untouched; `npx vitest run` on both card-property suites: exit 0, 2 files / 19 tests | **Met** | - |
| AC-007 | REQ-007 | **Given** 12 registered sheet surfaces and 31 registered stacked pairs, **When** the last leg lands, **Then** `sheet-grammar.mjs` still reports 12 and 31 green at exit 0 | `node tools/live/sheet-grammar.mjs`, exit read from `$?`. Exit **0**, unchanged | **Met** | - |
| AC-008 | REQ-008 | **Given** the kanban layout's captured page limit of 10, **When** the board applies a limit, **Then** it is 10, or our own number argued rather than cited | `anytype-menu-set-layout-kanban-page-limit-*`. `053` D4 withdrew `050`'s flat 60: the limit is per-layout, Gallery 60 and Kanban 10, absent elsewhere. The board now applies **10** per column through a local `boardConfig` (real config, or a shallow copy carrying `groupRowLimit: 10` when unset) read only at the board's own call sites, without moving the shared `groupRowLimit` default any other view reads | **Met** | - |
| AC-009 | REQ-009 | **Given** T002's pre-leg `pm-gantt-*` count and gantt capture hashes, **When** every board leg has landed, **Then** both are identical or a move is explained by a named gap from this packet | T002 baselines, T010 re-reads. `037`'s in-repo parity was 60 of 60 classes with zero divergence at `30c4b746`. Never rebaselined silently. Re-read at `772bf57a`+this leg: the specified command still reads **119**; `constructed-timeline` capture hashes unchanged (`layoutHash=a3e2342c477f`, `pixelHash=77426bf96fb6` desktop dark) | **Met** | - |
| AC-010 | OPERATOR | **Given** a release carrying the rebuilt board, **When** the operator opens it on iOS and on desktop beside Anytype, **Then** they report it as Anytype-shaped | The operator's own words. Nothing in this repository can close this row, and an agent never ticks it | Unmet | - |
| AC-011 | REQ-002 | **Given** `design-trueup.md`'s measured geometry, **When** the landed board is measured back off its own captures and its own stylesheet, **Then** every adopted value matches within +/- 1px or carries a named, ADR-backed reason for not matching | `tasks.md` T012 rows R1-R5 and R8-R10 fixed and re-measured at DPR 2 by a leg that did not write the original implementation: chip height 24px (was 26), property pitch a uniform 25px (was ~28.3px average), the title icon slot forced onto every card at 16px (was absent by default, 18px when present), phone column/gap geometry confirmed via computed style under a real `is-phone` mount, the constructed board's phone capture now shows the permanent count and controls, the checkbox glyph is a circle at 14px, the empty-column title wraps inside its card, and a new `tools/live/board-geometry.mjs` gate lane locks all of it against computed styles with a negative control proving it is non-vacuous. R6 (chip tint fill) and R7 (grey hue) are left untouched, named as the operator's per the same instruction that opened this row — not silently dropped | **Met** | - |

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

**Not closeable — one row is open, and it is the operator's.** Eleven rows, **ten Met and one
Unmet**. T001's capture true-up closed AC-001; T002's red-first pass recorded the failing figure
for every remaining row in `checklist.md`; T004 through T009 implemented the rebuild, retargeted
the property rows, dispositioned the seven extensions, and re-ran every gate, closing AC-002
through AC-009; T012 and T013 closed AC-011, fixing the ten residuals a fresh read-back found and
removing the `boardExtensionsEnabled` dead branch. AC-010 is the operator's and is closed by nobody
here — shipped and verified are not the same state as operator-confirmed (parent D3).

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
exactly 32 board captures moved. `npm run gate` **26 green, exit 0**, read from `$?`.

**Two criteria were written against a target the captures disproved**, and their thresholds moved
rather than their status: AC-002's table no longer expects a record-count row for the desktop
column header, and the phone rows it covers are measured rather than inferred from the desktop.
`design-trueup.md` C1 and C2 carry the corrections.

**AC-011 closed on the same read-back's own fix.** Eight of T012's ten rows are fixed and
re-measured at DPR 2, `tasks.md` T012 carries the red/green pair for each; R6 and R7 stay
unresolved by instruction, named as the operator's rather than folded into a Met row that would
hide them. T013 removed the branch AC-005 had already found unreachable, and the removal cascaded
into the harness/fixture surfaces that branch alone reached — named in `tasks.md` T013 rather than
left as silent scope creep.

Shipped, verified and operator-confirmed are three states and only the third closes (parent D3).
<!-- /ANCHOR:closure -->
