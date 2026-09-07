---
title: "Tasks: Notion Board Refinement"
description: "The ordered legs: verify what already landed, file the errata and the decline pack, put three questions to the operator, then build the Groups panel behind that gate."
trigger_phrases:
  - "059 tasks"
  - "board groups panel tasks"
  - "notion board refinement tasks"
  - "showGroup wiring tasks"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Board Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

Every code task carries a **red-first** line: the failing value observed on the tree before the work
is written (`goal.md` D3). A task whose red is already green on `main` is a **verification** task
and says so (`goal.md` D7). No operator row is ever ticked by an agent.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

*No source file is touched in this phase, so none of it waits on the operator gate or on `058`.*

- [x] T001 **Re-read what `dc1d54a9` landed, rather than trusting the research that predates it.**
      The loop's §11 ranked "land `056` T014-T016" as its P0 and its §10 E-3 recorded three drifted
      stylesheet anchors in `056` AC-012. **Verification, not work** — both were true when the loop
      read them and are false now. Record in `acceptance-criteria.md` AC-006, with the command
      output rather than the claim: `056/tasks.md` T014, T015 and T016 all `[x]`; AC-012 and AC-013
      both **Met**; `grep -n "9569\|9447\|9472" ../056-board-anytype-parity/acceptance-criteria.md`
      returns **0** rows; `.db-kanban-cards` carries no `overflow-y` at all;
      `.note-database-container.db-kanban-view` carries the scroll (`styles.css:9348-9356`); its
      `::-webkit-scrollbar` is `height: 0` at rest and `10px` on hover or `.is-scrolling`
      (`:9386-9392`); `.db-kanban-col-header` computes `position: static`. **0** tasks in this
      packet may redo any of it.
- [x] T002 **The red-first measurement pass.** Every red observed on the rebased tree before its
      matching code task landed; the observed figure is recorded in `acceptance-criteria.md`'s Today
      cell for each row. Both zero-checks confirmed red before the code leg: `grep -rn
      "manageGroups\|db-board-groups" src/` returned **0**, `ls screenshots/notion-clone/panels/ |
      grep -c board-groups` returned **0** against 122 files in that folder (the packet's own prose
      cited 116; the folder had grown by six unrelated captures since it was written — recorded here
      rather than copied stale).
- [x] T003 [P] **File the four errata, in the documents that make the claims.** Drafted by the
      implementation leg, which was dispatched under a write authority scoped to
      `specs/005-component-surface-system/059-notion-board-refinement/**`; **filed 2026-09-07 by the
      landing pass**, which carries `../056-board-anytype-parity/**` as well. **Green:**
      `../056-board-anytype-parity/notion-screens-digest.md` gains a **§ 7 Errata** table carrying
      all four, plus an inline `> **Erratum E-n**` blockquote beside each of the four claims it
      corrects — so a reader reaching the stale claim first cannot act on it. The digest's own prose
      is left as written: it is a dated read, and rewriting it in place would erase what was
      observed on 2026-09-06. **E-4 is filed in two parts**, because the state moved under it: (a)
      the claim was already wrong when written, and (b) this packet's own landing changed what is
      true. The four notes, as drafted:
      **E-1** — `../056-board-anytype-parity/notion-screens-digest.md:173-179` describes our header
      chip as carrying the option colour as text; ADR-006 filled it, and the tree reads
      `background: var(--db-status-bg, transparent)` at `styles.css:9440`. The Notion-vs-ours
      conflict survives; it resolves for the newer ruling.
      **E-2** — the digest at `:193-195` says sub-grouping is absent from our renderer; the axis
      exists behind `config.boardSubgroupEnabled` (`board-renderer.ts:63-70`, `:222`, `:639-640`).
      The conclusion holds — `renderReferenceColumn` (`:263-341`) still renders one flat row and
      nothing reads the subgroup axis for layout — only the premise needs correcting.
      **E-4** — the digest at `:183-186` and the research at §6 and §8 both say our column menu
      carries "Hide Column" and that our board can hide a column. It cannot: neither host supplies
      `hideGroup` or `deleteGroup`, so the two rows at `board-renderer.ts:558-559` have never built,
      and `src/i18n.ts:136-137` ships their labels in three locales for rows nothing renders.
      **E-5** — the digest's page-scrolling paragraph at `:220-226` describes
      `.db-kanban-cards { overflow-y: auto }` and `.db-kanban-view { overflow: hidden; height: 100% }`
      as current; `dc1d54a9` removed both, and every `board-renderer.ts` and `styles.css` anchor in
      the digest's §4 drifted with the same commit.
      **E-3 gets no note** — it named AC-012's drifted anchors, and `dc1d54a9` rewrote that row so
      it cites no stylesheet line at all. T001 records it as closed.
- [x] T004 [P] **Name the four device-only checks on `056` AC-010's operator pass.** Drafted by the
      implementation leg, **appended 2026-09-07 by the landing pass** for the same authority reason
      as T003. **Green:** `../056-board-anytype-parity/checklist.md` gains **C10.1 through C10.4**,
      each marked **OPERATOR** and each `[ ]`; `../056-board-anytype-parity/acceptance-criteria.md`'s
      AC-010 row gains a pointer to them and **stays Unmet**. Additive only — no agent ticks any of
      the four, and no Met row in `056` moved. The four items, unchanged from the plan:
      (1) page scroll with **0px** desktop scrollbar chrome at rest; (2) the board in dark
      theme — no dark Notion board exists in the harvest on either platform (digest `:262-266`);
      (3) desktop hover-reveal of `···`/`+`, uncaptured even on Notion's own web (`:269-272`);
      (4) the phone board on a real handset, since `056` R5's phone capture is harness-synthetic,
      forced `matchMedia("(pointer: coarse)")`. Additive only — AC-010 stays **Unmet** and an agent
      does not tick it.
- [x] T005 **Put ADR-004, ADR-010 and ADR-011 to the operator, each with both readings.**
      ADR-004: adopt Notion's group-management surface at all? ADR-010: "Hide empty groups" — Notion
      ships it on, ours would ship it off. ADR-011: are `hideGroup` and `deleteGroup` wired, or
      deleted with their guards and their i18n keys? The other eight ADRs went with them as the
      decline pack, `Accepted` on a landed ruling and needing no answer.
      **Answered 2026-09-06 18:36**, all three, verbatim: ADR-004 — *"Yes, one Groups panel"*;
      ADR-010 — *"On by default, like Notion"*, which **reverses** the packet's own `false`-default
      proposal; ADR-011 — *"Wire hide, delete the delete action"*, branch two. **The gate is open;
      Phase 2 may start** (`goal.md` D6).
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

*T005 was answered on 2026-09-06 18:36, so the decision half of the gate is open. What remains is
the file half: every task below waits only on `058` releasing `src/views/board-renderer.ts`.*

- [x] T006 **The actions contract: add `showGroup`, wire `hideGroup`, delete `deleteGroup`.**
      **Red observed:** `grep -rn "hideGroup" src/` returned **2** rows — the declaration at
      `board-renderer.ts:84` and the guarded call at `:558` — and **0** implementations; the same
      shape held for `deleteGroup`. `showGroup(field, key)` added to `BoardRendererActions`
      (required, not optional — the shape a declared-but-unimplemented member cannot repeat) and
      implemented in `database-view.ts` and `embedded-database-renderer.ts`, each writing/clearing
      `config.boardHiddenGroups[field]` and scheduling the existing config save.
      `setBoardHideEmptyGroups(value)` added the same way for T009. `deleteGroup` is **removed** —
      the declaration, its guarded row, and the "Delete group" key in all three locales. **Green:**
      `grep -rn "deleteGroup" src/` returns **0**; both hosts locked by new
      `database-view.test.ts`/`embedded-database-renderer.test.ts` cases asserting `showGroup` and
      `hideGroup` are functions and `deleteGroup` is `undefined` on the live `boardRenderer.actions`
      fixture, plus a persistence case per action reading the committed `ViewConfig` through the
      real `updateViewDefFile`/background-save path.
- [x] T007 **The Groups panel** (`src/views/board-groups-panel.ts`, new) — **one** panel carrying
      every group concern, per the operator's *"Yes, one Groups panel"* (ADR-004, 2026-09-06 18:36).
      Nothing is split across a second surface.
      **Red observed:** `grep -rn "manageGroups\|db-board-groups" src/` returned **0**. Built one
      row per group option — visible and hidden — through the shared `buildCheckboxPropertyRow`
      (`src/views/record-surface/property-row.ts:353`), reusing `db-column-manager-row`,
      `db-column-drag`, `db-column-type` and `db-column-name-wrap`/`db-column-name` verbatim (the
      same classes `board-card-properties-panel.ts` reuses) rather than a second drag vocabulary:
      visibility toggle, drag handle, touch move-up/move-down, a colour-dot swatch in the type slot,
      the option's own label. Plus hide-all, show-all and "Hide empty groups". A key present in
      `config.boardHiddenGroups` with no matching schema option is merged in by
      `resolveBoardGroupsPanelKeys` and rendered as an ordinary row — unknown and restorable, never
      dropped (NFR-R02), unit-tested directly. Declared `role: "panel"` (`role="dialog"`), local
      mount on the board's own container, width read from `getSurfaceRoleDefaults("panel").width`
      (292-360px) rather than a literal, trapped focus (`trapFocus`), dismissal on outside
      pointerdown (`installPopoverAutoClose`/`overlayStack`) or Escape. **"Remove grouping" is not
      built** — it names an operation (clearing the board's own group-by field) with no REQ/AC
      threshold anywhere in this packet's closure gate; recorded as a deviation from plan.md's
      prose rather than folded in unreviewed. The row list (`resolveBoardGroupsPanelKeys`,
      `renderBoardGroupsRows`) is split from the floating shell so it is unit-testable against a
      DOM double (`board-groups-panel.test.ts`, 6 cases: every option listed visible-and-hidden, an
      orphan hidden key listed rather than dropped, checkbox toggle firing `showGroup`/`hideGroup`
      with the right arguments, drag-drop and move-arrow reorder firing the reorder callback with
      the right indexes); the shell's positioning/focus-trap/dismissal needs a live document and is
      exercised by `render-assertions.mjs` instead (see T012).
- [x] T008 **The entry row, in the menu the reader already opened.** One row in
      `renderBoardGroupOptions` (`board-renderer.ts:540-560`). **Red observed:** the column menu
      built **3** rows (sort ascending, sort descending, collapse), because the two guarded rows
      never built. **Correction to this row's own plan:** wiring `hideGroup` makes the guard
      `if (this.actions.hideGroup)` on the old standalone "Hide column" row always true, which would
      have shipped a *fifth* row rather than the planned four — decision-record.md ADR-004 rules
      against exactly that shape ("all live on it rather than being scattered across the column
      menu, which is what 'one Groups panel' settles beyond the yes"), so the standalone hide row
      is removed with `hideGroup` moving to be the panel's own toggle-off, and the now-dead
      `board.hideColumn` i18n key is removed in the same three locales `deleteGroup`'s key was.
      **Green:** exactly **4** rows (sort ascending, sort descending, collapse, Manage groups),
      asserted live in `render-assertions.mjs`'s `board-groups-panel/file-view` scenario by
      counting `.db-menu-item` after the real column-options button click, observed red (5 rows)
      with the old row reintroduced and green (4) with it removed.
- [x] T009 **`boardHideEmptyGroups`, default `true`.** Declared beside `boardHiddenGroups`
      (`src/data/types.ts:560`), allowlisted in `src/data/data-source.ts` (parse + serialize +
      legacy-key strip, both `parseDatabaseConfig` call sites), filtered beside the hidden-group
      filter in `BoardRenderer.render()` — `groups = groups.filter((group) =>
      this.getVisibleSubtaskRows(group.rows).length > 0)` guarded on `config.boardHideEmptyGroups
      !== false`. **ADR-010 Accepted 2026-09-06 18:36** — operator, verbatim: *"On by default, like
      Notion"*.
      **What the reversal costs, and the row that pays it:** an empty column renders the shared
      empty card (`board-renderer.ts:324-327`), and eight committed captures hold that state (four
      hand-written fixtures with no config to pin — unaffected, static markup; four
      `constructed-board-empty-column-*` mounting the real renderer through
      `scenario.boardEmptyColumn`). The constructed four are **pinned to `boardHideEmptyGroups:
      false` explicitly** inside `render-assertion-harness.ts`'s `boardEmptyColumn` branch, in the
      same change. **Green, observed:** `board-renderer-parity.test.ts` carries a red/green pair —
      the pre-existing empty-column test now pins `boardHideEmptyGroups: false` explicitly (still
      renders the empty card) and a new case proves the *default* config renders **0** columns for
      an all-empty group; `data-source.test.ts` round-trips an explicit `false` and confirms an
      unconfigured vault reads `undefined` (tri-state, not cast, so "never configured" stays
      distinguishable from "explicitly shown"), and — added by the landing pass after a surviving
      mutation showed the gap — asserts the key is in `legacyViewKeys()`, the separate list that
      strips a stale top-level duplicate, locked the same way `filterTree` and `boardCardFields`
      already are; the four constructed empty-column captures were
      not among the 8 pixel-content-changed files this packet's full recapture found — their hashes
      held with the pin in place, matching this row's own bar.
- [x] T010 **Strings and treatment.** `src/i18n.ts`: `board.manageGroups`, `board.hideAllGroups`,
      `board.showAllGroups`, `board.hideEmptyGroups` added in all three locales (en, zh-CN, zh-TW);
      `board.deleteGroup` (ADR-011) and, after T008's correction, the now-dead `board.hideColumn`
      both removed from all three. The panel and row treatment in `styles.css`: a dedicated block
      for `.db-board-groups-panel`/`-actions`/`-body`/`-dot`/`-footer`/`-empty-row`/`-empty-label`,
      plus registering the panel class into the shared floating-panel, blur/elevation, z-index and
      phone-responsive selector lists beside `.db-view-config-panel` and its siblings — no existing
      declaration edited, matching the "0 lines of visible difference" bar the full recapture
      confirmed for every capture but the 8 new ones. Every value derived from the existing token
      scale (`--db-border-subtle`, `--db-status-bg`, `--db-radius-*`, `--db-elevation-2`); none
      copied from Notion (`goal.md` D2). The `styles.css` serialized lane (parent D11) was acquired
      from `058-card-title-and-title-formats` and released with the full corpus recaptured and the
      8 new captures reviewed — `tools/lane/css-lane.json` history.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 **Capture the surface four ways.** **Red observed:** `ls screenshots/notion-clone/panels/
      | grep -c board-groups` returned **0** against 122 files in that folder (see T002 on the
      116-vs-122 drift). **Green, and doubled:** `constructed-board-groups-panel-{desktop,mobile}-
      {dark,light}.png` mounts the real renderer through the same two clicks a reader makes
      (`scenario.boardGroupsPanel` in `render-assertion-harness.ts`); `panel-board-groups-
      {desktop,mobile}-{dark,light}.png` is the hand-written fixture pair every other panel in
      `tools/screenshots/scenarios/panels.mjs` also carries. Both pairs registered in
      `screenshots/manifest.json` in the same change as the eight files. Two width bugs surfaced
      capturing the fixture pair and were fixed in `styles.css` before this row went green: the
      panel's width declaration was losing the cascade to the shared floating-panel block's wider
      default on source order alone (moved beside `.db-view-config-panel`'s own override, the same
      fix that class already needed), and the fixture had no `box-sizing: border-box` to match what
      `positionToolbarPopover` sets inline in the real app. `node tools/screenshots/verify.mjs`
      reports all 596 entries (588 prior + 8 new) current.
- [x] T012 **Two assertion rows on a lane that already exists**, in `tools/live/
      render-assertions.mjs`'s `board-groups-panel/file-view` scenario: the panel's computed width
      (`panel.getBoundingClientRect().width`) inside the declared 292-360px band, and a visibility
      toggle (`input[type="checkbox"]`) present on every `.db-column-manager-row`. A third row
      joined them once T008's correction was found: the column menu's own row count, `.db-menu-item`
      === 4. **Each observed red before it was trusted:** the width row read `computed width 490px`
      with the `panel` role's band temporarily widened in `surface-contract.ts`; the toggle row read
      `0 checkbox(es) across 0 row(s)` with the panel's row loop temporarily emptied; the menu-count
      row read `5 row(s)` with the old standalone hide row temporarily reintroduced — all three
      reverted immediately after, confirmed identical to the pre-probe tree. **0** new gate lanes
      (D4): all three rows live inside `render-assertions.mjs`'s existing dispatch, gated into the
      run via `STATE_SCENARIOS`'s existing rules-scenario filter rather than a new page or a new
      script.
- [x] T013 **The lanes that must not move.** `node tools/live/sheet-grammar.mjs` exit 0, 0 FAIL —
      the corpus measures 34 stacked pairs rather than the packet's cited 31 (recorded as observed,
      not corrected silently: pre-existing drift this leg's diff never touches sheet-grammar.ts's
      registry to explain). `npm run gate` exit 0, all 26 lanes green — three needed a leg of their
      own before that was true: `story-coverage` (a `.stories.ts` for the new module, per the
      project's own coverage floor, not a REQ/AC of this packet), `touch-targets` (the Groups
      panel's reuse of the shared reorder-button control added 6 already-recorded-shortfall
      instances to each pass; `tools/live/touch-targets-baseline.json` and
      `-constructed-baseline.json` re-pinned with a dated justification entry, the same convention
      every prior ratchet change in that file already follows). **Re-derived on the rebase onto
      `origin/main`, and the fixture ratchet moved DOWN rather than up:** the tree measures **186**
      fixture / **807** constructed over three consecutive runs, so the fixture pin is **186**, not
      the 202 this leg's own arithmetic produced — `origin/main`'s 196 was already stale by 16 from
      its own landings in between, found stale rather than lowered here, the same way `lastTriage`
      and `listRetirementLowering` in that file were. The +6 is confirmed by machine, not by
      argument: `touch-targets.mjs --json` filtered to unclassed 24x24 buttons reports
      `panel-column-manager` **12**, `panel-board-card-properties` **8**, `panel-sort-rules` **4**
      and `panel-board-groups` **6** — one shared control, in a fourth fixture. The constructed pin
      lands at **810**, and only **6** of that raise is this packet's: a before/after diff of
      `--json`, keyed on (scenario, tag, classes, width, height), attributes the other **3** to
      `db-record-detail-hidden-toggle` at 120x20, which arrived with `065-notion-record-refinement`'s
      own landing on `main` without a re-pin. Recorded under its own key in the constructed baseline
      rather than folded into this packet's raise, and `evidence` (nine `tools/live/
      *.json` census/audit stamps recorded against the pre-edit `styles.css` hash; each re-run by
      its own tool per the file's own instruction — "do not edit the numbers" — with `engine-parity`
      confirmed to report its pre-existing 44 differences unchanged, only its freshness hash
      moving). `npx tsc --noEmit` and `npx vitest run` both exit 0 — **144 files, 1553 tests** re-run from the rebased final state (143/1534 on this leg's own tree, before `origin/main`'s landings and one assertion the landing pass added). The
      gantt guard `056` D7 carries is unaffected — `git diff` names no `pm-gantt-*` file.
- [x] T014 **Reconcile the record.** `spec.md`, `plan.md`, this file and `acceptance-criteria.md`
      reconciled against the landed tree; `decision-record.md` needed no change — its eleven ADRs
      already matched what landed. `implementation-summary.md` replaces its placeholder. **The
      cross-packet half was written 2026-09-07 by the landing pass**, which carries the authority the
      implementation leg did not: this packet's own `goal.md` completion criteria are now **9 of 10**
      ticked, each with its evidence (the tenth is the operator's device read and is not ticked);
      `../roadmap.md` §5.A and its reserved-children row are re-derived from that figure — **90%,
      9/10, "Shipped + verified, awaiting device"** — as is `../goal.md`'s own children table; and
      `../056-board-anytype-parity/tasks.md`'s pointer line records where the four errata and the
      four device checks actually landed, with `056`'s own tally unchanged at twelve Met and one
      Unmet. **One `goal.md` criterion is ticked as superseded rather than as written:** "Hide empty
      groups ships default **OFF**" was reversed by ADR-010, and the row carries the reversal above
      its evidence rather than being rewritten to match what shipped.
- [ ] T015 **OPERATOR:** the operator reads the Groups panel on iOS and on desktop and reports it as
      an improvement. Nothing in this repository closes this row, and an agent never ticks it.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]` **except T015, which is the operator's**; **no task is blocked on an
      operator decision** — ADR-004, ADR-010 and ADR-011 were all ruled on 2026-09-06 18:36
- [x] No `[B]` blocked tasks remaining at closure — T003 and T004 were filed by the landing pass,
      which carried the `056` write authority the implementation leg did not
- [x] Every `acceptance-criteria.md` row Met, Waived with an ADR, or Superseded with one — AC-005 is
      Met against **ADR-010's reversed bar** (default **on**), recorded as a supersession rather than
      a rewrite; AC-010 is the operator's and stays Unmet
- [ ] The operator's own device read reported (T015)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Criteria**: See `goal.md` §3 and `acceptance-criteria.md`
- **Decisions**: See `decision-record.md` — eleven ADRs, three of them open
- **Research**: [`../056-board-anytype-parity/research/research.md`](../056-board-anytype-parity/research/research.md)
- **Notion fact source**: [`../056-board-anytype-parity/notion-screens-digest.md`](../056-board-anytype-parity/notion-screens-digest.md)
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in `spec.md` — REQ-001..REQ-010
- [x] CHK-002 [P0] Technical approach defined in `plan.md`, including the affected-surface inventory
- [x] CHK-003 [P1] Dependencies identified: the operator gate (green, ruled 2026-09-06 18:36),
      `058`'s file lane (green, released), `056` T014-T016 (green, landed at `dc1d54a9`)
- [x] CHK-004 [P0] Every red re-observed on the rebased tree rather than copied from the research
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` exit 0, read from `$?`
- [x] CHK-011 [P0] No console errors or warnings from the panel's mount or teardown — 0 `pageerror`
      events across every `render-assertions.mjs` page that mounts it
- [x] CHK-012 [P1] An orphan `boardHiddenGroups` key is listed and restorable, not dropped
- [x] CHK-013 [P1] The panel reuses `buildCheckboxPropertyRow`; **0** new drag vocabulary
- [x] CHK-014 [P0] `node tools/naming/scan-comments.mjs` exit 0 — no artifact ids in code comments
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met, waived or superseded — **not yet**: AC-007 and half
      of AC-009 are `Unmet`, blocked on write authority into `../056-board-anytype-parity/**`
      rather than on any remaining work (see `acceptance-criteria.md` closure statement)
- [x] CHK-021 [P0] `npx vitest run` exit 0 — 143 files, 1534 tests
- [ ] CHK-022 [P1] Edge cases tested: **an orphan hidden key** is (`board-groups-panel.test.ts`).
      "No group field" is satisfied by construction — the entry row lives inside
      `renderBoardGroupOptions`, called only when a group column already rendered — rather than by
      a dedicated test. "Hiding the last visible group" (the board's own empty state, panel staying
      open) is **not tested** in this leg
- [x] CHK-023 [P1] The three live assertion rows (width, toggle, and the menu-count row T008's
      correction added) each observed red before they are trusted, reverted immediately after
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class recorded: the unimplemented `hideGroup`/`deleteGroup` pair is
      **cross-consumer** — one contract, two hosts, neither supplying it
- [x] CHK-FIX-002 [P0] Same-class producer inventory run: `rg -n "hideGroup|showGroup|deleteGroup|boardHiddenGroups" src/` — now one implementation per surviving declaration in both hosts, `deleteGroup` at **0** hits
- [x] CHK-FIX-003 [P0] Consumer inventory run for `BoardRendererActions`, `boardHiddenGroups` and
      `boardHideEmptyGroups` across `*.ts`, `*.mjs` and `*.md` — both hosts, both live test fixtures, and the harness's own bags all account for the two new members
- [x] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface. The one persistence
      boundary is the view-config allowlist, covered by CHK-031
- [x] CHK-FIX-005 [P1] Matrix axes listed: {desktop, phone} × {light, dark} × {visible, hidden,
      orphan key} — all eight cells captured or unit-tested
- [x] CHK-FIX-006 [P1] N/A — no process-wide state is read
- [x] CHK-FIX-007 [P1] Evidence pinned to the landing SHA (`dc1d54a9`) and to the working-tree
      commands run against this leg's own final state, never to a branch-relative line range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] `boardHideEmptyGroups` is inside the view-config key allowlist in
      `src/data/data-source.ts`; `data-source.test.ts` round-trips an explicit value and confirms
      an unconfigured vault reads `undefined` rather than a cast default
- [x] CHK-032 [P1] N/A — no auth or authz surface. Group keys render as text, never as HTML
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec, plan, tasks, acceptance criteria and decision record synchronized against
      the landed tree (`decision-record.md` needed no change — it already matched)
- [x] CHK-041 [P1] Code comments carry the durable WHY and **no** spec path, packet number or task
      id — `node tools/naming/scan-comments.mjs` exit 0
- [ ] CHK-042 [P2] The four errata notes landed in the documents that make the claims — **not
      done**, blocked on write authority into `../056-board-anytype-parity/**`; drafted in
      `tasks.md` T003
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files confined to the session scratchpad and `/tmp`, never the repo tree
- [x] CHK-051 [P1] Every stray file this leg created at the repo root (gate logs, a probe script)
      removed before completion; `git status` carries only the packet's own new and modified files
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 13/14 |
| P1 Items | 13 | 12/13 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-07. The one open P0 (CHK-020) and the one open P1 (CHK-022) both
trace to the same two gaps acceptance-criteria.md's closure statement already names: AC-007 and
half of AC-009 blocked on write authority into `../056-board-anytype-parity/**`, and the
"hiding the last visible group" edge case left untested. The one open P2 (CHK-042) is the same
write-authority block. Every other item is verified against the landed tree, not asserted.
<!-- /ANCHOR:summary -->

---
