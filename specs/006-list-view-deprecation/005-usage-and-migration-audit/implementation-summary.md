---
title: "Implementation Summary: List Usage and Migration Audit"
description: "The three-direction enumeration ran. 76 non-test source lines across 12 files brand the list as a view type; the list-window gate lane, its bench and coverage pin, two replay claims, two constructed scenarios and five capture ids measure it; the operator's own vault carries exactly one list-configured view. Four affordances have no table equivalent and are named individually below."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list audit summary"
  - "006 phase 005 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/005-usage-and-migration-audit"
    last_updated_at: "2026-09-04T20:35:23Z"
    last_updated_by: "phase-author"
    recent_action: "Ran the three-direction enumeration, decided the migration target, and wrote the data-loss list"
    next_safe_action: "006-hide-and-migrate implements the migration against this audit"
    blockers: []
    key_files:
      - "src/views/list-renderer.ts"
      - "src/data/types.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "tools/gate.mjs"
      - "tools/live/list-window.json"
      - "tools/live/renderer-coverage.json"
      - "screenshots/manifest.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-005-summary"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "Does list leave DatabaseViewType, or stay accepted-but-redirected like gallery? Recommend: stay accepted-but-redirected, decided by 007."
      - "Are stacked titles and listCompactFields declared losses? Recommend: yes for both, decided by 006's migration notice."
    answered_questions:
      - "Migration target confirmed as table — list already shares getFieldWidth() with the table for column sizing (column-width.ts:29)"
      - "The per-group create button (list-renderer.ts:172) is NOT a declared loss — table's own db-new-row-button calls the same createEntryNearEnd() and carries real CSS where the list's db-list-group-new carries zero rules"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 005-usage-and-migration-audit |
| **Completed** | 2026-09-04 |
| **Level** | 1 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The audit ran, from three directions that fail differently, against the tree at `45a1750d`. It
confirms `table` as the migration target with its own evidence rather than inheriting the parent's
lean, names four affordances with no table equivalent, and enumerates the measurement surface `007`
must remove. Nothing in `src/` or `tools/` changed — this document is the entire output.

### 1. Source enumeration (T003)

`rg -n '"list"' src` returns **47** quoted-string matches. Read individually rather than trusted as
a count: **27** are `viewType`/`DatabaseViewType` branches, and **20** are unrelated homonyms —
`aria-autocomplete="list"`, the rollup `aggregation: "list"` value, an icon keyword, and
`BASE_IS_TYPE_VALUES`'s schema-type `"list"`. A pattern search that stopped at 47 would have
overcounted by 43%.

One near-miss is worth naming because it shows the filtering matters: `database-view.ts:3164`
declares a local closure literally named `renderList`, for a drag-reorder group-order picker — not
the list view. `rg -n "renderList\b"` alone would have folded it into the caller count.

**Every branch on `viewType === "list"`** (8 sites, all outside `list-renderer.ts` itself):

| File:Line | What it does |
|---|---|
| `database-view.ts:6929` | Render dispatch — `renderList(config)` |
| `database-view.ts:8042` | Row-reveal guard — `revealListRowLeadingEdge` vs `scrollIntoView` |
| `database-view.ts:8878` | Live cell-update dispatch — `case "list"` |
| `embedded-database-renderer.ts:1171` | Render dispatch, embed path |
| `view-config-panel-renderer.ts:378` | Gates the `listCompactFields` switch |
| `toolbar-renderer.ts:1436` | View-type icon getter |
| `database-view.ts:3523`, `data-source.ts:1715` | View-type label getter (`t("common.listView")`), duplicated once |

**Every caller of `list-renderer.ts`** — 2 production importers, 4 test files:

| File:Line | Relationship |
|---|---|
| `database-view.ts:113,411,854` | `import { ListRenderer }`; field; `new ListRenderer(...)` |
| `embedded-database-renderer.ts:67,185,483` | Same shape, embed path |
| `list-reservation.test.ts:19` | Imports `reservesColumnsOnWrappingLine` from the module |
| `list-row-contracts.test.ts:119,130` | Reads the file as text via `readFileSync` and asserts on source patterns, not on a render |
| `accessibility-defects.test.ts:84,171` | Same `readFileSync` pattern |
| `column-width.test.ts:87` | Same `readFileSync` pattern |

Three of the four test files never render the list — they assert on the source text directly. `007`
deleting the file breaks them with "file not found," not a render failure, which is a different
signal than the other views' removals will produce and worth flagging to whoever runs that phase.

**`ViewConfig` fields only the list reads** — one, confirmed by grep, not assumed:
`listCompactFields` (`types.ts:568`). Read sites: `list-renderer.ts:656`, `column-width.ts:43`.
Parse/serialize sites: `data-source.ts:807,987,1242,1361`. Config-UI site:
`view-config-panel-renderer.ts:379-381`. i18n: 2 keys × 3 locales = 6 lines in `i18n.ts`. No board,
gallery, table, or chart code reads it — confirmed by `rg -n "listCompactFields" src`, 16 lines
total, all in the files above.

**Surfaces that offer `list` as a choice** — three, not one. The parent spec and this phase's own
opening note named only the picker (`toolbar-renderer.ts:1297-1308`, filtering `gallery` alone). Two
more mint list views without going through it:

- `main.ts:142,178` — the settings-load sanitizer. Its unknown-`viewType` fallback already treats
  `list` as valid alongside `board`/`gallery`/`chart`; this is the exact site `006`'s migration
  should extend, mirroring where the gallery's withdrawal never touched (it withdrew from the
  picker, not from this guard, which is why a gallery config still parses as gallery today).
- `main.ts:1544,1551,1585` — the `.base` file importer. An Obsidian Bases file with a native
  `"list"` view type maps straight through to our `viewType: "list"` on import, the same way
  `"cards"` maps to `"board"` (with a comment at `main.ts:1549` explaining that mapping exists
  *because* the gallery's picker withdrawal did nothing to stop this path from still minting
  galleries). `006` needs the same fix here or the importer keeps creating what the picker just
  stopped offering.

**View-type union and config parsing**: `types.ts:317` (`DatabaseViewType` declaration),
`types.ts:489,719,762` (three more type annotations using the union), `settings.ts:78`
(`DEFAULT_VIEW_TYPES`), `data-source.ts:1527` (parse allow-list).

**Embedded codeblocks — the specific question asked.** `gallery-migration.ts`'s
`planGalleryMigration`/`applyGalleryMigration` are imported and called **only** from
`database-view.ts:2748` (`migrateGalleryViewOnOpen`, invoked from `refresh()` at line 11805).
`embedded-database-renderer.ts` never imports `gallery-migration.ts` and has no migration call of
its own. Its render dispatch at line 1171 still branches on `viewType === "list"` and calls
`this.listRenderer.render(...)` exactly like the full file view does at line 10576 — an embedded
`note-database`/`database-view` codeblock naming a list view renders through the same
`ListRenderer` today, and would hit the **same gap the gallery already has**: a list-configured view
opened only through an embed is never migrated, because the migration hook lives in the file view's
`refresh()`, not in the embed's. This is inherited, not new — `030`'s own deprecation log records it
as "unfinished" for the gallery — but `006` should decide whether to close it for `list` or accept
the same partial state, rather than discover it after shipping.

### 2. Measurement enumeration (T004)

| Surface | Evidence |
|---|---|
| Gate lane | `tools/gate.mjs:89`, `{ name: "list-window", cmd: [...list-window.mjs] }` — 1 named lane |
| Lane inputs | `tools/live/list-window.json` pins 4 files by hash: `list-window.mjs`, `list-window-harness.ts` (352 lines, in `tools/live/`, not `src/views/` as the opening note assumed), `list-renderer.ts`, **and `table-renderer.ts`** — the lane already exercises both renderers together, so removing it is not a pure subtraction from the list's side |
| Checks | `list-window.json` reports `"checks": 16` |
| Bench | `tools/bench/list-render-bench.ts` (339 lines) + `tools/bench/run-list.mjs` (215 lines) |
| Coverage ratchet | `renderer-coverage.json` pins `list-renderer.ts` and `list-render-bench.ts` by hash; `"constructed": 7, "total": 22` — removing list drops this to 6/22, the same shape as the gallery's 6→5 |
| Shared bench dependency | `tools/screenshots/constructed-scenarios.mjs` cites `list-render-bench.ts` in `sources` for **13** scenario entries, only 2 of which (`list`, `list-sparse`) are the list view itself. The other 11 — `active-view-controls-renderer`, `active-rule-popover-renderer` (×2), `filter-panel-renderer` (×2), `sort-panel-renderer` (×2), `summary-renderer`, `owned-menu` — borrow the bench's `makeColumns`/`makeRows`/`makeConfig` helpers purely for content-hash pinning and have nothing to do with the list renderer. Deleting the bench file outright breaks their fingerprint tracking; `007` needs to re-point those 11 `sources` entries, not just delete the file |
| Replay claims | `tools/live/replay.mjs` — 2 claims name the list by id: "no list row paints outside its container" (line ~146, scenarios `list-view`/`list-mobile`) and "no list column holds more than one property" (line ~167, scenario `list-sparse-fields`) |
| Constructed scenarios | `constructed-scenarios.mjs:223,306` — `list` and `list-sparse`, both `renderer: "list"` |
| Screenshot scenario fixtures | `tools/screenshots/scenarios/core.mjs:179,412,510` — `list-view`, `list-mobile`, `list-sparse-fields` |
| Unit specs, list-only | `list-reservation.test.ts` (65 lines, 5 test cases), `list-row-contracts.test.ts` (136 lines, 6 test cases) |
| Unit specs, shared with list assertions inside | `accessibility-defects.test.ts` (16 list-referencing lines), `column-width.test.ts` (13 list-referencing lines) — neither is list-only and neither should be deleted whole |
| Moot child packets | `033-list-virtualisation` (in progress, 5 of 6 criteria; measured a real fix — blocked-main-thread 4,748.6ms → 48.4ms at 3,000 rows) and `024-list-view-freeze` (in progress; AC-6 already NOT MET, reassigned to `028-remaining-freezes`) — both at `specs/005-component-surface-system/`, both open against a view this packet retires. Closing them is `006`'s REQ-007, not this phase's |

**Disagreement between directions, reported rather than reconciled**: the source grep (direction 1)
never surfaces the gate lane, the bench, or the replay claims — none of them contain the literal
string `"list"` in a `viewType` comparison. The lane-list direction (this section) never surfaces
`listCompactFields` or the `.base` importer. Each direction found something the other two missed,
which is the result `plan.md` predicted rather than a gap in either.

### 3. Capture enumeration (T005)

`screenshots/manifest.json` — `jq '[.scenarios[] | select(.renderer=="list" or (.id | test("list")))] | length'`
returns **20** entries across **5** scenario ids: `list-view`, `list-mobile`, `list-sparse-fields`,
`constructed-list`, `constructed-list-sparse` (4 device/theme variants each: desktop/mobile ×
light/dark). `find screenshots -iname "*list*"` confirms 20 PNGs on disk, one per manifest entry — no
orphaned captures and no manifest entries missing a file.

### 4. Vault usage (operator instruction, beyond tasks.md's four)

**The operator's iCloud vault**
(`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel Kerkmeester/`), read-only:

- 244 `.md` files total.
- `grep -rl "^db_view: true"` finds exactly **1** file with a frontmatter-persisted database:
  `Database Testbed/Testbed.md`. It defines 6 views, one per view type including a `list`-typed
  view named "Punch List" (`viewType: list`, frontmatter line 445) — a deliberate one-of-each test
  fixture, not organic use.
- `grep -rln '```note-database'` and `'```database-view'` (the plugin's two codeblock fence names,
  confirmed against `main.ts:409,423`) both return **0** files. No embedded codeblock database
  exists in this vault at all, so the embedded-migration gap found above has no instance here to
  exercise.
- `.obsidian/plugins/note-database/data.json` (read-only): `"databases": []`. The plugin's own
  centralized settings registry — the legacy pre-`db_view` storage path `main.ts:126-160` migrates
  from — holds zero databases. All of this operator's database configuration lives in per-file
  frontmatter, not in plugin settings.

**Total for this vault: 1 list-configured view, in 1 file, out of 244.**

**The repository itself** has no test-vault directory (`find . -iname "*.md" -path "*test*vault*"`
returns nothing) and no unit-test fixture constructs a `ViewConfig` object literal with
`viewType: "list"` (`rg -n 'viewType:\s*"list"' src -g '*.test.ts'` returns 0 matches). The list's
own test coverage exercises the renderer's source text directly (§1, "Every caller") rather than
building a config fixture and rendering it — a second data point for the same finding.

### 5. Migration target: `table`, confirmed rather than inherited

The parent packet already leaned `table`. This phase's job was to confirm it against its own
evidence rather than repeat the lean, and the evidence holds: `column-width.ts`'s
`listFieldTrackTemplate` (used only by the list, line 39) calls `getFieldWidth(config, col)` —
**the same function the table calls** for its own column widths (`getFieldWidth` is defined once,
at `column-width.ts:29`, with no per-view branch). A list view's `columnWidths` map already contains
values the table renderer reads unmodified. Migrating to table is a type-string rewrite plus a
column-widths carry-over that needs no re-derivation, which is a stronger case than the gallery had
for `board` — the gallery's evidence was "the only other surface that draws a cover image," a
structural similarity; the list's evidence is a literally shared function call, one config field
away from already being a table's.

This differs from the gallery's `board` choice for the reason `plan.md` asked to record: the
gallery's card shape has no row/column analogue on the table, so `board` (also card-shaped) was the
closer landing. The list is already row-shaped and already table-width-driven, so `table` — the
same target `006`'s parent goal already named as D3 — is not a coincidence of two independent
choices; it is the same underlying fact (shared width plumbing) surfacing at both the packet level
and this phase's evidence level.

### 6. Data-loss list (T007) — every candidate dispositioned individually, not as a group

| # | Affordance | File:Line | Table has it? | Disposition |
|---|---|---|---|---|
| L1 | `listCompactFields` (compact meta-field track sizing — shrinks the list's secondary-field row to `fit-content()` instead of a fixed track) | `types.ts:568`, `column-width.ts:43-51` | No — the table has no meta-field row for this to apply to; every field is already its own column | **Declared loss.** Recommend: leave the field on the migrated `ViewConfig` (matches the gallery's precedent of leaving its own fields on the view for reversibility) rather than stripping it; it becomes inert once nothing reads it |
| L2 | Stacked file-title display — two-line name-over-path reading mode, path always shown (`renderStackedFileTitle`, `alwaysShowPath=true`) | `list-renderer.ts:735`, shared function at `file-title-display.ts:108` | No — the table's title cell uses `renderInlineFileTitle` via `cell-renderer.ts:196`, one line, path shown only on a duplicate basename | **Declared loss, cosmetic only.** Not list-owned code — `board-renderer.ts:1462` and `gallery-renderer.ts:347` call the identical function, so this is a pre-existing board/gallery-vs-table difference the list migration merely inherits, not one it introduces. No data is dropped; only the always-visible path line is |
| L3 | Roving-tabindex card-style keyboard model | `list-renderer.ts:248`, `card-roving-tabindex.ts` | No — the table has its own, different keyboard grid model (cell focus + range selection, `database-view.ts:1972`) | **Declared loss of one model, not of keyboard access.** The table's keyboard support is more capable (F9-F13 in the superseded feature diff), so this is a changed interaction, not a net capability loss |
| L4 | Wrapping fields sized `max-content` per column (`col.wrap`) | `column-width.ts:42-56`, read sites only in `list-renderer.ts:827,855,1131-1132` | No — `col.wrap` has no read site in `table-renderer.ts` | **Declared loss.** No config-panel control sets `col.wrap` today (not found in `view-config-panel-renderer.ts` or `data-source.ts` parsing), so this is a schema field with renderer support but no confirmed authoring path — narrow in practice, but named rather than assumed unused |

**Confirmed NOT a loss, despite being a spec-opened candidate**: the per-group create button
(`list-renderer.ts:172`, class `db-list-group-new`). `grep -c "db-list-group-new" styles.css`
returns 0 — the list's own button has no styling. The table's equivalent
(`table-renderer.ts:970-977`, class `db-new-row-button`) calls the identical
`createEntryNearEnd(defaults, rows)` method and carries real CSS (`styles.css:7421,7446,7464`).
Migrating from list to table replaces an unstyled button with a styled one calling the same code —
a fix, not a loss. The opening note's own three candidates therefore split 1-for-3 real vs.
corrected-on-migration; the fourth (`col.wrap`) came from the feature-diff read in T002, not the
opening note.

**Gained, not lost** — named for completeness since REQ-003 asks for individual entries, not a
one-sided list: migrating to table adds a header row, click-to-sort, column resize/reorder, an
add-column affordance, cell range selection with fill handle, clipboard copy/cut/paste, tab-to-create-row,
multi-field grouping, and a working grouped-select-all sync (the list's own version is a live defect
per the superseded feature diff's F19). None of these require action from `006`; they are what the
target view already does.

### 7. What this audit did not establish (REQ-005)

- **How many vaults, beyond the operator's own, carry a list view.** This audit can see one vault.
  It cannot see any other, and 1-of-244 in a vault built specifically to exercise every view type is
  not evidence about typical usage anywhere else.
- **Whether `col.wrap` is reachable through any current UI path.** No config-panel control and no
  `.base`/data-source parse site sets it; it may be authored only by hand-editing frontmatter, or it
  may be fully dead. Confirming that needs a UI audit this phase's scope excludes.
- **Whether `007`'s eventual `styles.css` cut for list-only classes (`db-list-*`) can be done in one
  pass or needs the same per-selector care the CSS lane treats as a single serialized dependency.**
  This audit enumerated the JS/TS/JSON surface; it did not enumerate `styles.css` selector-by-selector.
- **Whether closing `033-list-virtualisation` and `024-list-view-freeze` needs anything beyond a
  status update.** Named as moot in §2; dispositioning them is `006`'s REQ-007, not audited here.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none in `src/` or `tools/`) | — | Read-only phase, confirmed in Verification below |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Per `plan.md` §3: three enumeration directions run independently — source grep, the gate's lane
list, and the capture manifest — with a fourth (vault usage) added at the operator's explicit
request beyond `tasks.md`'s original four. Each direction's count is reported in its own section
above rather than merged into one number, so the places where they disagree (§2's closing paragraph)
stay visible. The migration target and the data-loss list are each written once, with the reasoning
that produced them rather than only the conclusion.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Enumerate from three directions instead of one | A source grep misses harness code that names the view by string; the lane list misses source; the manifest misses both. §2's closing paragraph shows all three misses actually occurring, not just a hypothetical risk |
| Report the counts separately | Merging them hides the disagreement, and the disagreement — e.g. the gate lane never appearing in a `"list"` string grep — is the interesting part |
| Name every declared loss individually, and confirm rather than assume the opening candidates | One of the three opening candidates (the per-group create button) turned out not to be a loss on inspection; asserting it from the spec without checking `styles.css` would have shipped a wrong finding |
| Confirm the migration target with new evidence rather than repeat the parent's lean | `column-width.ts`'s shared `getFieldWidth` call is stronger evidence than "the parent already said table" — a future reader can verify the claim without re-deriving it |
| Recommend `list` stays accepted-but-redirected in `DatabaseViewType`, decided by `007` | Matches the gallery's own unresolved state (`030`'s deprecation log: still pins `gallery-renderer.ts`, still renders gallery on open) — consistent precedent, and `007` has the post-`006`-shipped evidence the spec's own scope note says this decision needs |
| Recommend both `listCompactFields` and the stacked-title display are declared losses, not silently mapped | Neither compact meta-field sizing nor the always-visible two-line title has a table read site; declaring them in `006`'s migration notice is cheaper than a user filing a report about a field that silently stopped doing anything |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Three enumeration directions (T003-T005) | Run — §1-3 above, with per-direction counts and file:line evidence |
| Vault usage (operator instruction) | Run — §4 above, 1 list view in 1 of 244 files, 0 embedded codeblocks, 0 databases in plugin settings |
| Migration target decided with reasoning (T006) | Run — §5, `table`, confirmed via `column-width.ts:29`'s shared `getFieldWidth` |
| Data-loss list (T007) | Run — §6, 4 declared losses individually dispositioned, 1 opening candidate confirmed as not a loss |
| Three counts reported separately (T008) | Done — §1 (27 branches / 47 raw matches), §2 (1 lane, 16 checks, 2 replay claims, 2 constructed scenarios), §3 (20 captures / 5 ids) |
| "What this audit did not establish" (T009) | Written — §7 |
| Read-only claim (T010) | `git diff --stat src/ tools/` against this phase's own commits: empty. Confirmed at authoring time; pre-existing unrelated dirty files in this worktree (`board-renderer.ts`, several `tools/live/*.json`) predate this session and are excluded from this phase's diff |
| `validate.sh 005-usage-and-migration-audit --strict` | Run at authoring time; see the packet commit |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Vault usage is one data point, not a population.** The operator's own vault is the only one
   this audit can read. It shows 1 list view in 244 files, in a file built to exercise every view
   type on purpose — informative about this operator's exposure, silent about anyone else's.
2. **`col.wrap`'s authoring path is unconfirmed.** §7 names this rather than guessing whether it is
   live, dead, or hand-authored-only.
3. **`styles.css`'s list-only selectors were not enumerated line-by-line.** The parent spec already
   names the stylesheet as a single serialized lane for `007`; this audit's source enumeration
   stopped at JS/TS/JSON and did not attempt a CSS selector inventory.
<!-- /ANCHOR:limitations -->

---
