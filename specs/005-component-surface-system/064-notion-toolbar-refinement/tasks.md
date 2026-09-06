---
title: "Tasks: Notion Toolbar Refinement"
description: "Ten legs: three that make the reds visible, six that close them, and three that verify — three of the code legs wait on Proposed ADRs, the lanes extended are the ones that already exist, and the device row is the operator's."
trigger_phrases:
  - "064 tasks"
  - "notion toolbar refinement tasks"
  - "delete confirm task"
  - "collapse rung task"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Toolbar Refinement

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

**TASK-VERIFY**: every leg names the command it runs and reads `$?` directly. A leg that closes a
red states the value it observed before and after, not the value it expected.

**TASK-SYNC**: a leg that moves a capture or a lane registers both in the same commit.

**Gates**: `goal.md` D6 bars the code of REQ-001, REQ-004 and REQ-006 until the operator answers
ADR-005, ADR-001 and ADR-007. The legs that only observe those reds are not blocked — the proof
runs, the code waits.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 [P0] Write the two red-first probes and observe each RED. First, the collapse reading:
      extend `tools/live/toolbar-collapse-sweep.ts`'s 250-900px, 10px-step sweep so it also reports
      (a) the width at which the New button's text label — the span `toolbar-renderer.ts:2365`
      draws off-touch — reads absent, and (b) the first width at which any cluster in the `:2571`
      order is hidden, then run it via `node tools/live/run-toolbar-collapse-sweep.mjs` and read
      `$?`. Expected red on this tree at `80c2bb48`: the label is still drawn at the first
      cluster-hidden width, because `applyToolbarChromeCollapse` (`:2561`) hides whole clusters
      and never touches the label. Second, the confirm probe: a case block in
      `src/views/toolbar-renderer.test.ts` driving both `deleteView` call sites (`:1180`, `:1330`)
      with the confirm resolved via a real Promise, asserting the decline/accept idiom `053`'s
      AC-105 blocks established, plus the one-view case asserting the `database-view.ts:3447`
      early return precedes any confirm. Expected red: `grep -c "buildConfirmSheetBody"
      src/views/toolbar-renderer.ts` = **0**. **Negative controls:** a toolbar swept at a width
      where no cluster hides must leave the label reading present (so the reading is not vacuously
      green), and the confirm block's decline path must leave `actions.deleteView` uncalled.
      (`tools/live/toolbar-collapse-sweep.ts`, `src/views/toolbar-renderer.test.ts`)
- [ ] T002 [P0] [P] Take the inventories this packet's legs will cite, and paste their output here:
      the confirm census (`grep -c "buildConfirmSheetBody" src/views/toolbar-renderer.ts` —
      **0**), the searchable census (`grep -c searchable src/views/filter-panel-renderer.ts
      src/views/sort-panel-renderer.ts` — **0** and **0**), the add-control census
      (`grep -rn "db-active-control-add" src/ styles.css` — **0**), the panel-toggles the chip
      rail will wire to (`toolbar-renderer.ts:157`, `:167`, consumed at `:2256`/`:2275`, implemented
      by the host at `embedded-database-renderer.ts:1661`/`:1696`), and the affected-capture census —
      which registered scenarios photograph the toolbar, the panels or the rail, so any capture
      whose picture moves is named before the leg that moves it, not after. A leg that changes
      markup without this list is guessing at its blast radius. (`specs/005-component-surface-system/064-notion-toolbar-refinement/tasks.md`)
- [ ] T003 [P0] Acquire the parent's serialized CSS lane hold before any `styles.css` edit, and
      record the acquire entry. The hold permits editing the file; it grants no scope beyond the
      rules T005, T007 and T008 name (parent D7 — the lane is the parent's, per `053` goal D6).
      (`tools/lane/css-lane.json`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 [P0] [B] Raise `051`'s confirm on both `deleteView` paths — the all-views hub row
      (`toolbar-renderer.ts:1180`) and the tab context menu (`:1330`) — through
      `buildConfirmSheetBody` (`confirm-sheet.ts:46`), with one-scope copy that names the view.
      Declining is a no-op; accepting deletes exactly once; the last-view case (`database-view.ts:3447`)
      raises no confirm because the early return precedes it. The host's splice-and-save path
      (`database-view.ts:3445-3456`) is untouched. On a phone the confirm presents as a stacked
      bottom sheet per `048` D1, and the `sheet-grammar`/stacking lanes stay green. **Blocked on**
      the operator's answer to ADR-005 (and its shape is ADR-003's, already Accepted — a second
      confirm surface is the thing this leg must not build). **Ruling consumed:** Notion P9
      (`55602f6a`, `348fd2b7`), the scope radio not adopted (F-304). Red closed by T001's confirm
      probe. (`src/views/toolbar-renderer.ts`, `src/views/toolbar-renderer.test.ts`)
- [ ] T005 [P0] Give the filter panel's zero-rule branch (`filter-panel-renderer.ts:197-202`) a
      searchable flat property list built from the `toPropertyDropdownOption` vocabulary the file
      already carries (`:497`); picking a property creates the first leaf through
      `createDefaultFilterRule` (`:90`) and `appendLeaf` (`:223`); a `+ Add advanced filter` footer
      switches to the landed tree. **The builder is untouched** — `053`'s rulings hold, and the
      one-rule panel is this leg's proof: a panel seeded with exactly one rule renders
      byte-identical before and after, diffed and recorded. Red first: the branch renders only the
      `db-panel-empty` hint. **Notion:** P4, `86a8e66c` / `8ff7ae4b` / `1f10ae24` (F-202).
      (`src/views/filter-panel-renderer.ts`, `styles.css`)
- [ ] T006 [P0] [P] Pass `searchable: true` at three sites — the filter field dropdown
      (`filter-panel-renderer.ts:494-501`), the select/status value dropdown (`:576-590`) and the
      sort field dropdown (`sort-panel-renderer.ts:199-206`). The mechanism is the flag alone: the
      gate already lives inside the primitive (`dropdown-field.ts:228` — on a phone sheet,
      `searchable === true && options.length > 8`; on desktop, `063`'s landed combobox rule
      `a952e5e7` already searches at any count, and this leg touches none of that). Neither panel
      passes the flag today, so their phone-sheet presentations fall to the `searchable === true`
      default and render no search row at any count — that is the red. **Notion:** P4/P5,
      `1067756c` / `82d66d47` / `86a8e66c`; the in-repo precedent: `view-config-panel-renderer.ts:1558`,
      `:2060`, `:2077`. (F-203.) (`src/views/filter-panel-renderer.ts`, `src/views/sort-panel-renderer.ts`)
- [ ] T007 [P0] [B] Add one rung at the head of `applyToolbarChromeCollapse` (`toolbar-renderer.ts:2561`)
      that collapses the `:2365` label span before the `:2571` targets loop runs. The landed order
      — `[newCluster, query, props, add]` — is not reordered, and nothing behind the rung moves
      (ADR-001). In the sweep, the label reads absent before the first cluster-hidden width,
      zero-overflow holds at every width, and the accessible name is unchanged — the label
      collapses visually, the `aria-label` does not (NFR-A03). **Blocked on** the operator's
      answer to ADR-001. Red closed by T001's collapse reading.
      (`src/views/toolbar-renderer.ts`, `tools/live/toolbar-collapse-sweep.ts`)
- [ ] T008 [P1] Add one `db-active-control-add` control per rule group in the chip rail's
      `render()` (`active-view-controls-renderer.ts:60`), present exactly when at least one chip is
      visible — the zero-chip case is the control — wired to the existing
      `toggleFilterPanel` / `toggleSortPanel` (declared at `toolbar-renderer.ts:157`/`:167`), at the
      landed 28px chip pitch (`styles.css:1821`) and the 11%/17% tints (`:1825`, `:1831`), carrying
      its own accessible name (NFR-A02). No second rail anatomy — `053`'s ADR-001 rail-extension
      ruling and ADR-006 here both pin the per-rule shape (F-205, F-207). Red first: the census in
      T002 = **0**. **Notion:** P2 `d8abbe0b`; Anytype's own T001 read records the same control —
      the one adoption both references agree on (F-201).
      (`src/views/active-view-controls-renderer.ts`, `styles.css`)
- [ ] T009 [P2] [B] Settle REQ-006, whose first task is a read this packet owes: the board's
      consumption of the hidden-group axis is verified (`boardHiddenGroups` at `types.ts:560`,
      persisted at `data-source.ts:1230`/`:1352`, read at `board-renderer.ts:192`), the table's is
      not — read it before any criterion here goes green. Then, on the operator's answer to
      ADR-007: either this packet's popover rows (`toolbar-renderer.ts:1869-1887`) gain the eye
      toggle for select/status group fields, persisting into the existing axis with no second
      writer (the criterion), or REQ-006 closes Waived citing ADR-007 and the axis stays `059`'s.
      **Blocked on** the operator's answer to ADR-007. **Notion:** P7 `e9698e1b` (F-302).
      (`src/views/toolbar-renderer.ts`, `src/types.ts` if the answer keeps the type here)
- [ ] T010 [P1] [P] Verify the two record corrections REQ-007 carried at this packet's opening
      stand and were not absorbed: the digest's §4 P3 row is stale because the desktop side sheet
      landed after it was written (ADR-008), and the digest's §6 Q4 is answered — our control
      cluster carries no text label to collapse, so the density comparison lives only on the New
      button (ADR-002). Both live in `goal.md` §4 and `decision-record.md`; this leg reads both
      against the citations they name and ticks nothing they would have to move. Runnable
      immediately and independent of every other leg.
      (`specs/005-component-surface-system/064-notion-toolbar-refinement/decision-record.md`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T011 [P0] Run the repository gates and read each output and exit status: `npx tsc --noEmit`,
      `npm run build`, `npx vitest run`, then `npm run gate` with `$?` read directly. The
      `toolbar-collapse` row (`tools/gate.mjs:80`) must be green and must have been observed red
      in T001 — a green run that never exercised the change proves nothing. Note for the read:
      `tools/live/*.ts` is covered by neither `tsconfig.json` nor `lint:tools` (`053`'s recorded
      gate gap), so the sweep's evidence is the lane's own exit status, not the typecheck.
- [ ] T012 [P0] Name every registered capture whose picture the landed legs moved, re-take it,
      open the image and read it, then release the parent's CSS lane naming what moved — the
      `screenshots-fresh` lane's pixelHash failures are the detector, and `screenshot-currency.md`
      §3 is the standard the read owes: the harness renders fixture markup, so a picture that
      changed and was not looked at is a read owed, not a pass. (`screenshots/`, `tools/lane/css-lane.json`)
- [ ] T013 [P0] **Operator row — never ticked by an agent.** The four device-only checks the loop
      named — icon-only rail discoverability on a phone, the entry tier inside the phone filter
      sheet, the delete confirm as a stacked sheet, and tabs against the view switcher both
      references use — are answered in `053` AC-111's sitting, not here. (F-108, F-208, F-307, F-402.)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, except T013 which only the operator closes
- [ ] No `[B]` blocked tasks remaining
- [ ] Every red in `goal.md` §3 observed failing before its fix, with the command and `$?` recorded
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Directive and criteria**: See `goal.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Evidence**: See `research/research.md` under `053-toolbar-and-view-controls/research/notion-toolbar/`
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

- [x] CHK-001 [P0] Requirements documented in spec.md — REQ-001 through REQ-008
- [x] CHK-002 [P0] Technical approach defined in plan.md — §3 and the affected-surfaces addendum
- [ ] CHK-003 [P1] Dependencies identified and available — ADR-001, ADR-005 and ADR-007 are Proposed, so T004, T007 and T009 here are `[B]`; the proofs in Phase 1 are not
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` exits 0, output read
- [ ] CHK-011 [P0] No console errors in the collapse-sweep and gate runs
- [ ] CHK-012 [P1] Error paths behave: the confirm's scrim/Escape dismissal is a decline, never an accept (`spec.md`'s edge case)
- [ ] CHK-013 [P1] No second producer for anything that has one — no second confirm surface (`053` D8), no second collapse ladder, no second hidden-group writer (ADR-007)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met, waived or superseded
- [ ] CHK-021 [P0] Every red observed failing first, with its command and `$?`
- [ ] CHK-022 [P1] The negative controls exercised: the one-rule panel byte-identical (AC-005), the 8-option case (AC-006), the zero-chip rail (AC-008), the one-view guard (AC-002)
- [ ] CHK-023 [P1] The collapse sweep's readings proven non-vacuous by T001's no-cluster-hidden control
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each finding carries a class: REQ-001 is `instance-only` × 2 call sites in one file, whose presentation rides the existing `044`/`048` lanes; REQ-002 is `instance-only` (one branch, the ≥1-rule panel its negative control); REQ-003 is `algorithmic` (the flag meeting a gate that already lives inside the primitive); REQ-005 is `instance-only`; REQ-006 is `cross-consumer` (one persisted axis, two candidate writers, which is why it is gated).
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed (T002's greps), or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for the changed markup — the registered captures named in T002, the collapse lane's readings, and the `sheet-grammar`/stacking lanes the confirm's phone presentation rides.
- [ ] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface in this packet. Recorded rather than silently dropped.
- [ ] CHK-FIX-005 [P1] The affected-capture list from T002 is recorded before completion is claimed.
- [ ] CHK-FIX-006 [P1] N/A — nothing here reads process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the fix SHA, not to a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets — nothing in this packet reads configuration
- [ ] CHK-031 [P0] The confirm's copy and the property list are rendered as text through the element helpers, never interpolated into markup
- [ ] CHK-032 [P1] N/A — no auth or authorization surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and `acceptance-criteria.md` synchronized
- [ ] CHK-041 [P1] The collapse rung's comment explains the new order, not the old (`toolbar-renderer.ts:2363-2364`'s comment already tells the reader the label is the width; the rung's addition says what changed)
- [ ] CHK-042 [P2] N/A — no README surface
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 0/9 |
| P1 Items | 11 | 0/11 |
| P2 Items | 2 | 0/2 |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---
