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

- [ ] T001 **Re-read what `dc1d54a9` landed, rather than trusting the research that predates it.**
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
- [ ] T002 **The red-first measurement pass.** Observe each red in `acceptance-criteria.md` on the
      rebased tree and write the observed figure into its Today cell — not a figure copied from the
      research, which read a different tree. The eight reds and their commands are listed in that
      file; each one is run and its output read, including the two that must come back **0**
      (`grep -rn "manageGroups\|db-board-groups" src/`, and
      `ls screenshots/notion-clone/panels/ | grep -c board-groups`).
- [ ] T003 [P] **File the four errata, in the documents that make the claims.**
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
- [ ] T004 [P] **Name the four device-only checks on `056` AC-010's operator pass.** That row's
      verification cell currently reads "the operator's own words" and enumerates **0** checks.
      Append: (1) page scroll with **0px** desktop scrollbar chrome at rest; (2) the board in dark
      theme — no dark Notion board exists in the harvest on either platform (digest `:262-266`);
      (3) desktop hover-reveal of `···`/`+`, uncaptured even on Notion's own web (`:269-272`);
      (4) the phone board on a real handset, since `056` R5's phone capture is harness-synthetic,
      forced `matchMedia("(pointer: coarse)")`. Additive only — AC-010 stays **Unmet** and an agent
      does not tick it.
- [ ] T005 **Put ADR-004, ADR-010 and ADR-011 to the operator, each with both readings.**
      ADR-004: adopt Notion's group-management surface at all? ADR-010: "Hide empty groups" — Notion
      ships it on, ours would ship it off. ADR-011: are `hideGroup` and `deleteGroup` wired, or
      deleted with their guards and their i18n keys? The other eight ADRs go with them as the
      decline pack, `Accepted` on a landed ruling and needing no answer. **This task ends Phase 1
      and opens the gate; nothing in Phase 2 starts before it is answered** (`goal.md` D6).
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

*Every task below is `[B]` until T005 is answered **and** `058` releases
`src/views/board-renderer.ts`.*

- [ ] T006 [B] **The actions contract: add `showGroup`, resolve the two dead members.**
      **Red first:** `grep -rn "hideGroup" src/` returns **2** rows — the declaration at
      `board-renderer.ts:84` and the guarded call at `:558` — and **0** implementations; the same
      shape holds for `deleteGroup`. Add `showGroup(field, key)` to `BoardRendererActions`
      (`:77-132`), implement it plus the ADR-011 outcome in `src/views/database-view.ts:791-830` and
      `src/views/embedded-database-renderer.ts:532-563`. Green is one implementation per
      declaration, in both hosts, locked by the `boardRenderer.actions` fixtures in
      `database-view.test.ts` and `embedded-database-renderer.test.ts`.
- [ ] T007 [B] **The Groups panel** (`src/views/board-groups-panel.ts`, new).
      **Red first:** `grep -rn "manageGroups\|db-board-groups" src/` returns **0**. Build one row
      per group option — visible and hidden — through the shared
      `buildCheckboxPropertyRow` (`src/views/record-surface/property-row.ts:353`), copying
      `src/views/board-card-properties-panel.ts:48-125` rather than writing a second drag
      vocabulary: visibility toggle, drag handle, touch move-up/move-down, the option's own label
      and colour. Plus hide-all, show-all, "Hide empty groups" and "Remove grouping". A key present
      in `config.boardHiddenGroups` with no matching schema option renders as **unknown and
      restorable**, never dropped — the state that makes a hide irreversible. Declared
      `role: "panel"`, `mount: "local"`, width inside the **292-360px** band `../design-system.md:77`
      and `:126` assign the role, trapped focus, dismissal on outside click or Escape.
- [ ] T008 [B] **The entry row, in the menu the reader already opened.** One row in
      `renderBoardGroupOptions` (`board-renderer.ts:540-560`), beside the hide row rather than in
      the toolbar — no fourth place to hunt for a setting. **Red first:** the column menu builds
      **3** rows today (sort ascending, sort descending, collapse), because the two guarded rows
      never build. Green is the post-ADR-011 row count asserted in a renderer test.
- [ ] T009 [B] **`boardHideEmptyGroups`, default `false`.** Declare it beside `boardHiddenGroups`
      (`src/data/types.ts:560`), allowlist it (`src/data/data-source.ts:1352`), filter on it beside
      the hidden-group filter (`board-renderer.ts:192-193`). **Red first:** Notion ships the toggle
      **on** in all three management captures (`30ba5533`, `e9698e1b`, `2ef31bd5`); ours must not,
      because an empty column renders the shared empty card (`board-renderer.ts:324-327`) and eight
      committed captures hold that state. Green is the default reading `false`, **0** columns
      suppressed under a default config, those eight capture hashes unchanged, and a parse test
      proving an unlisted board flag is still dropped — the property `056` AC-005 locks for
      `boardExtensionsEnabled`.
- [ ] T010 [B] **Strings and treatment.** `src/i18n.ts` for the panel title, the entry row, the two
      bulk actions and the empty-groups toggle, in every locale the file already carries. The panel
      and row treatment in `styles.css` under the parent's serialized CSS lane (parent D11), every
      value derived from our own token scale and **none** copied from Notion (`goal.md` D2).
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T011 [B] **Capture the surface four ways.**
      `constructed-board-groups-panel-{desktop,mobile}-{dark,light}.png` under
      `screenshots/notion-clone/panels/`, registered in `screenshots/manifest.json` in the same
      commit as the files. **Red first:** `ls screenshots/notion-clone/panels/ | grep -c
      board-groups` returns **0** against 116 files in that folder. Green is four, with
      `node tools/screenshots/verify.mjs` reporting them current.
- [ ] T012 [B] **Two assertion rows on a lane that already exists**, in
      `tools/live/render-assertions.mjs`: the panel's computed width inside the declared band, and a
      visibility toggle present on every group row. **Each is read red first against a stylesheet
      or a build that lacks it** — a row that cannot be made to fail is not a row (`goal.md` D3).
      **0** new gate lanes (D4).
- [ ] T013 [B] **The lanes that must not move.** `node tools/live/sheet-grammar.mjs` still 12
      surfaces and 31 stacked pairs, exit read from `$?` (D5). `npm run gate` exit 0 at its current
      lane count. `npx tsc --noEmit` and `npx vitest run` both 0. The gantt guard `056` D7 carries
      is unaffected — this packet touches no `pm-gantt-*` file — and is stated so rather than
      re-measured.
- [ ] T014 **Reconcile the record.** `spec.md`, `plan.md`, this file, `acceptance-criteria.md` and
      `decision-record.md` agree with each other and with the tree; `implementation-summary.md`
      replaces its placeholder; the parent's `roadmap.md` §5.A row and `goal.md` reserved-children
      row move off **opened**; `../056-board-anytype-parity/tasks.md`'s pointer line stays accurate.
- [ ] T015 **OPERATOR:** the operator reads the Groups panel on iOS and on desktop and reports it as
      an improvement. Nothing in this repository closes this row, and an agent never ticks it.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, or `[B]` with the operator gate named as the blocker
- [ ] No `[B]` blocked tasks remaining at closure
- [ ] Every `acceptance-criteria.md` row Met, Waived with an ADR, or Superseded with one
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

- [ ] CHK-001 [P0] Requirements documented in `spec.md` — REQ-001..REQ-010
- [ ] CHK-002 [P0] Technical approach defined in `plan.md`, including the affected-surface inventory
- [ ] CHK-003 [P1] Dependencies identified: the operator gate (red), `058`'s file lane (yellow),
      `056` T014-T016 (green, landed at `dc1d54a9`)
- [ ] CHK-004 [P0] Every red re-observed on the rebased tree rather than copied from the research
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` exit 0, read from `$?`
- [ ] CHK-011 [P0] No console errors or warnings from the panel's mount or teardown
- [ ] CHK-012 [P1] An orphan `boardHiddenGroups` key is listed and restorable, not dropped
- [ ] CHK-013 [P1] The panel reuses `buildCheckboxPropertyRow`; **0** new drag vocabulary
- [ ] CHK-014 [P0] `node tools/naming/scan-comments.mjs` exit 0 — no artifact ids in code comments
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met, waived or superseded
- [ ] CHK-021 [P0] `npx vitest run` exit 0
- [ ] CHK-022 [P1] Edge cases tested: no group field, an orphan hidden key, hiding the last visible
      group
- [ ] CHK-023 [P1] The two live assertion rows each observed red before they are trusted
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Finding class recorded: the unimplemented `hideGroup`/`deleteGroup` pair is
      **cross-consumer** — one contract, two hosts, neither supplying it
- [ ] CHK-FIX-002 [P0] Same-class producer inventory run: `rg -n "hideGroup|showGroup|deleteGroup|boardHiddenGroups" src/`
- [ ] CHK-FIX-003 [P0] Consumer inventory run for `BoardRendererActions`, `boardHiddenGroups` and
      `boardHideEmptyGroups` across `*.ts`, `*.mjs` and `*.md`
- [ ] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface. The one persistence
      boundary is the view-config allowlist, covered by CHK-031
- [ ] CHK-FIX-005 [P1] Matrix axes listed: {desktop, phone} × {light, dark} × {visible, hidden,
      orphan key}
- [ ] CHK-FIX-006 [P1] N/A — no process-wide state is read
- [ ] CHK-FIX-007 [P1] Evidence pinned to the landing SHA, never to a branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] `boardHideEmptyGroups` is inside the view-config key allowlist
      (`src/data/data-source.ts:1352`); a vault's `data.json` cannot introduce an unlisted board flag
- [ ] CHK-032 [P1] N/A — no auth or authz surface. Group keys render as text, never as HTML
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec, plan, tasks, acceptance criteria and decision record synchronized
- [ ] CHK-041 [P1] Code comments carry the durable WHY and **no** spec path, packet number or task id
- [ ] CHK-042 [P2] The four errata notes landed in the documents that make the claims
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in `scratch/` only
- [ ] CHK-051 [P1] `scratch/` cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 0/14 |
| P1 Items | 13 | 0/13 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-06 — the packet is opened, not started. Every figure above is 0 of
its total, and the operator gate is why.
<!-- /ANCHOR:summary -->

---
