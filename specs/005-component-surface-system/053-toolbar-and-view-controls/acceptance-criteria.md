---
title: "Acceptance Criteria: Toolbar and View Controls"
description: "The criteria this packet must satisfy before it may be closed: one threshold per primitive migration and per 050 item kept, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "053 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/053-toolbar-and-view-controls"
    last_updated_at: "2026-09-05T22:50:00Z"
    last_updated_by: "impl-053-remaining"
    recent_action: "Closed AC-103/105/107: timing proof, live drop branches, collapse rung; gate green"
    next_safe_action: "AC-110's dedicated-lane clause and AC-111 (operator device pass) are what remain"
    blockers:
      - "AC-111 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/board-renderer-hierarchy.test.ts"
      - "src/views/table-renderer-sort-conflict.test.ts"
      - "src/views/database-view-settings-landing.test.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
      - "tools/live/run-toolbar-collapse-sweep.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-053-ac"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "T001: the rail does not move, so the header-height question is void and spec.md §8's sticky-offset risk row is retired"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Toolbar and View Controls

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `plan.md`'s ADR section.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/053-toolbar-and-view-controls
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
REQ-10x maps to `spec.md` §4. Where a row keeps a `050` item threshold, the Given/When/Then is
that threshold's, applied to this phase's surfaces; the Today cell is measured on the current
tree, including the two corrections the parent `goal.md` §2 records (items 1 and 4).

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present. Every threshold carries a failing number
observed before the fix (goal D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-101 | REQ-101 | **Given** the toolbar family, **When** the migration table's rows are read against the tree, **Then** every row whose target names a primitive renders through that primitive, and its replaced vocabulary is deleted: the close-run count is **0** outside `createPopoverShell` (today **17**), the dual-class count is **0** (today **2** — `toolbar-renderer.ts:1249`, `:1341`), the dead-method count is **0** (today **7**) | **RED** close-run **17**, dual-class **3** (title-actions / type-change / tab-menu), dead methods **7**. **GREEN** `createPopoverShell` at 8 host sites; `createTabStrip` + `createSettingsEntry` in `toolbar-renderer.ts`; dual-class **0** (`rg` on `src`); dead methods **0**; teardown lists the five closes only in `dismissOpenToolbarPopovers` / `closePopovers` (≤2). Source negative control: `toolbar-surface-contract.test.ts` fails if the dual class or dead methods return. | **Met** | - |
| AC-102 | REQ-102 | **Restated at T001 against this packet's `design-trueup.md` T14** (`050` item 1 threshold as restated by `050` ADR-004, kept). **Given** a view, **When** at least one filter or one sort is active, **Then** the chip row is present with a leading sort chip whose **direction is carried by the arrow glyph** — and by the **direction word** on any surface with room for a second line — before the filter chips, and the trigger carries a declared `active` state; **and When** neither is active, **Then** the row is absent entirely and the state reads `add`; **and** **every** value column of the view-settings surface carries a state summary, the empty case reading as a **word** (`No filters`) rather than a blank | **RED** chip **26px**; no `data-control-state`; **0** settings summaries. **GREEN, verified 2026-09-05 (landing)**: CSS chip **28px** (`styles.css` `.db-active-control-chip` height); triggers stamp `data-control-state`; sort chips add `.db-active-control-direction`; settings emit `.db-view-config-summary` (`No filters` / `N applied`). **The four filter×sort trigger combinations are now one live pass**: `render-assertions` gained six `STATE_SCENARIOS` rows (`chrome-toolbar-rules-{filter,sort,both}` and `chrome-active-view-controls-{none,filter,sort}`, the fourth — `both` — already covered by the pre-existing default scenario), asserting `data-control-state` add/active on both triggers and the rail's presence-iff-active including the **fully absent** `none` case (`tools/live/render-assertion-harness.ts` `toolbarAssertions`/`chipRailAssertions`, `tools/live/render-assertion-bundle.mjs`). Negative control run and reverted: forcing `data-control-state` constant to `"add"` reddens all three non-empty combinations (`FAIL x3`); reverted, green again. `node tools/live/render-assertions.mjs` → PASS, 0 failures. | **Met** | - |
| AC-103 | REQ-103 | **Given** a database view (`050` item 2 threshold, kept), **When** a view is created or duplicated, **Then** the view-settings surface is open within **100ms** of the create completing | **RED never** — nothing opened. **GREEN, timed, 2026-09-05 (second landing)**: `src/views/database-view-settings-landing.test.ts` builds a real `DatabaseView` via `Object.create(DatabaseView.prototype)` — the same construction `tools/bench/panel-refresh-bench.ts` already uses, since the constructor reaches a live App/vault/metadata cache none of which exist here — and drives the shipped `addView` / `duplicateView` → `openViewSettingsAfterMutation` → `toggleHeaderPopover` → the real `ViewConfigPanelRenderer.render()` unstubbed. `performance.now()` brackets the call; **measured create 4.7ms, duplicate 0.8ms**, both ≪100ms, with `viewConfigPanelRenderer.getPanel()` confirmed connected after each. Two collaborators are stubbed and named in the test's own comments — the toolbar tab-strip rebuild (`rerenderToolbar`, a separately-measured, already-covered surface) and the post-landing data refresh (the very next call the shipped path makes, so stubbing it only excludes cost that starts after landing already happened) — everything else on the settings-landing path itself runs real. The prior synchronous-call structural proof stands alongside this as the "no async gap" half of the argument; this closes the "how long" half honestly, on a constructed mount rather than a heavily-mocked stopwatch. | **Met** | - |
| AC-104 | REQ-104 | **Given** a view (`050` item 4 threshold, kept), **When** it is duplicated, **Then** the duplicate's config equals the source's on every field except `id` and the name suffix, and its `id` is **new**; **and When** a view tab's context menu opens, **Then** it offers rename, duplicate and remove through the shared shell | **RED** hand-rolled tab menu (dual class). **GREEN, verified 2026-09-05 (landing)**: `showViewTabMenu` opens through `createPopoverShell`; duplicate still uses `generateId()`. **Constructed row added and driven**: `chrome-toolbar-tab-menu/file-view` in `render-assertions` right-clicks a real `.db-view-tab` (`dispatchEvent(new MouseEvent("contextmenu"))`, the same event `oncontextmenu` binds) and reads the opened panel's rows for Rename / Duplicate current view / Delete view. **Caught a genuine red on the first pass**: the single-view toolbar fixture every other toolbar scenario mounts suppresses `showViewTabMenu`'s delete row (`totalViews > 1` gate), so the row-content assertion failed until the scenario was given a second view — recorded here as the red, fixed by mounting two views, now green. `node tools/live/render-assertions.mjs` → PASS. | **Met** | - |
| AC-105 | REQ-105 | **Given** a board or table view with an active sort (`050` item 7 threshold, kept), **When** a row or card is dragged to a new position, **Then** a confirmation is raised; declining leaves both the order and the sort unchanged, and accepting clears the sort and commits the drop | **RED** confirm identifier **absent** on both renderers. **GREEN, both branches driven live, 2026-09-05 (second landing)**: `board-renderer-hierarchy.test.ts` gained a `board sort-conflict confirm on drop` block, driven on the **local-extension board layout** (`boardExtensionsEnabled: true`), never the Project Manager 1:1 reference kanban, so the parity fixture's drag visuals stay out of scope — a same-group card drop under an explicit sort, with `confirmSortConflict` resolved async via a real `Promise`: decline leaves `moveRowToPosition` and `moveRowWithGroupUpdatesAndPosition` uncalled; accept calls `clearSort` once then `moveRowToPosition(TODO_PATH, TODO_SECOND_PATH, undefined)`. A new `table-renderer-sort-conflict.test.ts` drives the real `TableRenderer` the same way on the table side: a real `dragstart` on the row's drag handle sets the renderer's internal dragging path exactly as a pointer drag would, then a real `drop` on a sibling row under an explicit sort — decline leaves `moveRowToPosition` uncalled; accept calls `clearSort` then `moveRowToPosition(FIRST_PATH, SECOND_PATH, undefined)`. Neither `board-renderer.ts` nor `table-renderer.ts` changed production code (`git diff --stat` empty on both), so `screenshots/project-manager/` stays pixelHash-identical to the pre-phase baseline by construction. `npx vitest run` → all green. | **Met** | - |
| AC-106 | REQ-106 | **Given** a view carrying new-row default presets (`050` item 10 threshold, kept), **When** a row is created in it, **Then** every preset value is applied at creation; **and Given** a view with no presets, **Then** the new row is byte-identical to one created today; **and** the presets section is reachable from the **New button's dropdown** under a `Settings` section label | **RED** no `newRowPresets` map; **0** New-menu Settings sections; `createEntry(undefined)` only. **GREEN** `applyViewRowPresets({status:"Open",gone:"x",cost:""})` → `{status:"Open"}`; empty/missing maps return `undefined` (`src/data/view-row-presets.test.ts`); New menu calls `createMenuSection(panel, t("toolbar.settings"))`. | **Met** | - |
| AC-107 | REQ-107 | **Given** an embedded view (`050` item 12 threshold, kept), **When** its container is swept from **250px** upward, **Then** the toolbar collapses on a measured natural-width comparison rather than a fixed breakpoint, **no** control overflows its container at any width in the sweep, and the drop order matches the captured ladder — the `New` button, the icon cluster **and the add-view `+`** all go before the tab row, which becomes a dropdown before it is dropped | **RED** boolean hide-or-nothing; first overflowing width **unmeasured**; last rung unbuilt. **GREEN, built and swept, 2026-09-05 (second landing)**: the missing rung is `collapseTabStripToDropdown` (`toolbar-renderer.ts`), reached from `applyToolbarChromeCollapse` once the four chrome controls are gone and `toolbar.scrollWidth` still exceeds `toolbar.clientWidth` — it hides every `.db-view-tab` and replaces them with one trigger carrying the current view's icon, name and a chevron, opening the existing `showAllViewsHub` popover (the same one the many-tabs overflow already uses), so no second menu is built. `restoreCollapsedTabStrip` undoes the collapse at the top of every call before remeasuring, so a widening resize is never compounded against a narrower one's decision. A new headless-Chrome sweep — `tools/live/toolbar-collapse-sweep.ts` + `run-toolbar-collapse-sweep.mjs`, following `render-assertion-bundle.mjs`'s own temp-directory build rather than a tracked `dist/` — mounts the real `ToolbarRenderer` in the codeblock-embed shape (`showDatabaseChrome:false, hideDatabaseTitle:true`) and steps the container **250px→900px in 10px steps (66 widths)**: **zero overflow at every width** (`scrollWidth <= clientWidth` throughout, read via `page.evaluate` in real Chrome). **Ladder switch points for this fixture** (one view, name over the shared 22ch tab-name truncation cap): New button and the query icon cluster both drop at the sweep floor, **250px**; the properties cluster, the add-view `+`, and the tab-row-to-dropdown rung never engage within 250-900px, because the 22ch cap already bounds a single tab's natural width (~222px) under the floor once New and query are gone. A second, non-gating probe at 100-240px (below the documented floor, so nothing here is asserted) confirms the rung is not dead code: the dropdown engages by 200px. `npx tsc --noEmit`, `npx vitest run`, `npm run build` all clean; `npm run gate` 25/25 green. | **Met** | - |
| AC-108 | REQ-108 | **Given** any view type, **When** the settings trigger is pressed, **Then** exactly one settings path resolves it — the view-config panel or the view-type options panel — and the anchor-fallback queries still resolve against the live trigger | **RED** 1 live utilities path + **7** dead methods. **GREEN** dead methods **0**; `createSettingsEntry` stamps `db-view-config-btn` / `db-chart-options-toolbar-btn` / `db-calendar-timeline-options-toolbar-btn` on `.db-toolbar-more-btn`; fallback queries still read those classes (`database-view.ts:3134`, `embedded-database-renderer.ts:1926`). Constructed toolbar row asserts all three classes on the live trigger. | **Met** | - |
| AC-109 | REQ-109 | **Given** every toolbar surface this phase changed, **When** it presents on a phone, **Then** it carries `044`'s seven grammar elements, and **When** it can open over another sheet, **Then** it obeys `048`'s stacking model | **RED** was the risk of regressing grammar on migrated shells. **GREEN, verified 2026-09-05 (landing)** `npm run gate` this tree: `sheet-grammar` green, `sheet-teardown` green. `sheet-rebuild` ran in **both engines** in this environment (Chrome and WebKit both launched, unlike the external pass's environment) — every case including `group sheet (real ToolbarRenderer)` passed on both. | **Met** | - |
| AC-110 | All | **Given** the gate, **When** `npm run gate` runs to completion and its status is read from `$?`, **Then** it exits **0** with one permanent row per criterion, each negative control observed **red then green**, `npm run replay` holds with reversed 0, and the `screenshots/project-manager/` board and gantt references are `pixelHash`-identical to their pre-phase baseline | **RED** `npm run gate </dev/null` exited **1**. Chrome launched. Unexpected fails: `css-lane`, `screenshots-fresh`, `placement`, `sheet-rebuild` (WebKit missing), `evidence`. **GREEN, verified 2026-09-05 (landing)**: `npm run gate </dev/null` → **25/25 green, exit 0** (root cause of the prior `css-lane`/`placement` reds: the external pass dropped `.db-sort-panel db-filter-panel`'s dual class per AC-101 but left the sort panel's FLOATING PANELS chrome rule and mobile-sheet padding-inline override pointed only at `.db-filter-panel`, so the sort panel lost its position/size/border/background outside the phone sheet — fixed in `styles.css`; `screenshots-fresh`/`evidence` were genuinely stale from the styles.css edits and closed by a full recapture + evidence regeneration; `sheet-rebuild` ran both engines here). `npm run replay` → **PASS, 28/28 held, reversed 0**. `screenshots/project-manager/` → **0 files changed** (`git status --porcelain -- screenshots/project-manager/` empty), pixelHash-identical to the pre-phase baseline exactly as ADR-003 predicted (zero drag-visual change). **Re-verified 2026-09-05 (second landing)**: `npm run gate </dev/null` → **25/25 green, exit 0** again after AC-103/105/107's own work — one recapture cycle was needed (`toolbar-renderer.ts` and `render-assertion-harness.ts`'s edits marked 11 captures stale by source hash; all 11 came back pixelHash-identical to their committed bytes on recapture and were restored rather than reviewed, `screenshots-fresh` green). `npm run replay` → **PASS, 28/28 held, reversed 0**. **The "one row per criterion" clause stays partially met, honestly**: AC-101/102/104 carry dedicated `npm run gate` lane rows (source contract + `render-assertions` STATE_SCENARIOS). AC-103 and AC-105's proofs are `vitest` tests (`database-view-settings-landing.test.ts`, the sort-conflict blocks in `board-renderer-hierarchy.test.ts` and `table-renderer-sort-conflict.test.ts`), which the gate's own `tests` row already runs, but none is a *named*, permanent gate lane the way `render-assertions`' STATE_SCENARIOS are. AC-107's proof is a standalone script (`run-toolbar-collapse-sweep.mjs`) that is not wired into `npm run gate` at all — it was built to the task's own instruction to sweep in headless Chrome, not to become a gate lane, and doing the latter is a separately-scoped decision this landing does not make unasked. | **Unmet** | - |
| AC-111 | REQ-102, REQ-103, REQ-107 | **Given** a released build, **When** the operator opens a filtered view, creates a view, and resizes an embedded view on iOS and on desktop, **Then** they read the rebuilt toolbar as the improvement they asked for | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |
| AC-112 | REQ-101 | **Given** the Anytype capture set, **When** T001 has read it, **Then** `toolbar-surface-inventory.md` carries a capture-read record per migration row naming the file opened, and **no** surface was implemented before its record existed | **Met, 2026-09-05.** `design-trueup.md` is the read; `toolbar-surface-inventory.md` **§8.1** carries the per-row record — **24 of 24 rows** name the files opened or the named gap, and every named capture resolves under `screenshots/anytype/`. §8.2 lists the eight contradictions the read resolved. No surface has been implemented, so the second clause holds vacuously and stays binding for T003 onward | **Met** | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in `plan.md`'s
ADR section. A waiver naming an ADR that is not there fails validation: the point
of a waiver is that someone recorded the reasoning, so an unbacked waiver is
treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

**AC-112, AC-101, AC-102, AC-104, AC-106, AC-108 and AC-109 are Met**, verified 2026-09-05 at
landing (in-runtime pass following the external codex/cursor implementation attempt).

**AC-103, AC-105 and AC-107 closed 2026-09-05 (second landing)**, each with the proof its own
row's prior "Unmet" cell said was missing: AC-103 gained a measured `performance.now()` reading
on a constructed `DatabaseView` mount (create 4.7ms, duplicate 0.8ms); AC-105 gained live
decline/accept branches on both renderers with the confirm resolved async, driven on the
local-extension board layout rather than the Project Manager 1:1 reference kanban; AC-107 gained
the missing tab-row-to-dropdown rung and a 250px-900px headless-Chrome sweep reading zero overflow
throughout. No production code changed in `board-renderer.ts` or `table-renderer.ts`; the only
shipped-behaviour change is `toolbar-renderer.ts`'s new collapse rung. **Two rows remain open**:
AC-110's "one row per criterion" clause, because AC-103/105's proofs are `vitest` tests riding the
gate's existing `tests` row rather than named permanent lanes, and AC-107's sweep is a standalone
script not wired into `npm run gate` — both scoped decisions this landing did not make unasked, not
oversights. AC-111 is the operator's.

**A pre-existing P0 regression was found and fixed at landing, not by the external pass**: dropping
the sort panel's `db-filter-panel` dual class (AC-101's own dead-vocabulary cleanup) left
`.db-sort-panel` matching none of the FLOATING PANELS chrome rule's selectors, so the sort panel
lost its position, size, border, background and padding outside the phone sheet path. This was very
likely the root cause of the external pass's `css-lane`/`placement` gate failures. Fixed in
`styles.css` by adding `.db-sort-panel` alongside `.db-filter-panel` in both the base chrome rule
and the mobile-bottom-sheet padding-inline override.

**Three rows were restated by the same read**, and each says so in its own cell: AC-102 (the rail's
band move withdrawn, the direction colour demoted, the summary label widened), AC-106 (the presets
section moved to the New menu), AC-107 (the inline rung also drops the `+`). None of the three
changed its `050` threshold — only the failing values and the clauses the captures disproved.
<!-- /ANCHOR:closure -->
