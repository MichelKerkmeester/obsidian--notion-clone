---
title: "Task Breakdown: States, Feedback and Motion"
description: "T001 measures every threshold red-first; every task after it carries the threshold it closes on, the failing figure that proves the red, and the capture its design was read against."
trigger_phrases:
  - "055 tasks"
  - "states feedback tasks"
  - "toast tasks"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: States, Feedback and Motion

<!-- SPECKIT_LEVEL: 3 -->

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

Every implementation task carries three things: the **threshold** it closes on, the **red-first
proof** for that threshold, and the **capture** its design was read against (or the named gap).
A task missing any of the three is not ready to start.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [P0] **Measure every threshold in `acceptance-criteria.md` against the current tree and
      against the evidence, and record the observed figure.** Done 2026-09-05. The output is
      `design-trueup.md` — one row per state, feedback shape and motion token, each read off a
      capture in `screenshots/anytype/`, off a `file:line` in `specs/context/anytype-ts/src/scss/`,
      or off a `file:line` in `src/`, with the gap named where neither exists. The measured figures
      are written into `acceptance-criteria.md`'s Verification cells, which is where a threshold is
      audited; `checklist.md` remains the implementation legs' record of red-then-green and is
      filled per leg, not here.
      **Deviation, named rather than absorbed:** the task as drafted named `checklist.md` as the
      sole output. A threshold's failing figure belongs beside the threshold, and `050`'s
      precedent (its own T001) is a `design-trueup.md`. Both files now carry their half.
      **What the measurement changed:** nine contradictions, listed in `design-trueup.md` §1 and
      ruled in ADR-004 and ADR-005. The corrected headline figures are **42 `transition:`
      declarations** carrying **78** `120ms` occurrences (not 78 transitions), **7**
      `var(--db-transition-fast)` uses (not 8), **16** further durations written in seconds that the
      census had missed, and **0** `prefers-reduced-motion` rules in `anytype-ts` (goal D2)
      (`design-trueup.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### L1 — toast component and its owned call sites

- [ ] T002 [B] [P0] **REQ-055-1 — the toast component.** `src/views/toast.ts`: severity
      (`success`/`error`), an optional action (label, icon, callback), `role="status"` live
      announcement, auto-dismiss on success (the 2200ms budget `showOperationResult` already runs)
      and sticky-until-acted on error, `.db-surface` mount with a registered producer id, motion
      tokens for entrance.
      **Threshold:** every notice this phase owns renders through the component with its action
      clickable, and zero owned sites call `new Notice` directly.
      **Red first:** 0 of 247 call sites carry an action affordance today; the migration notice
      promises Undo over a surface that cannot carry it (`src/i18n.ts:1455`,
      `database-view.ts:2744`).
      **Capture:** none — no capture on either platform shows a toast. **But the geometry is no
      longer invented:** `anytype-ts/src/scss/notification/common.scss` is a complete source read
      (`design-trueup.md` §2) giving 384px width, fixed 12px bottom-right, 12px radius, 16px
      padding, 64px min-height, an action row at `gap: 8px` / `margin-top: 12px` that auto-hides
      when empty, and a collapsed stack where only the first card renders content. Severity is
      **ours** — the reference toast has no severity axis
      (`src/views/toast.ts`, `src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`)
- [ ] T003 [B] [P0] **REQ-055-1 — make the migration notice's Undo deliverable.** Route
      `notice.galleryMigrated` through the toast with its Undo action wired to
      `undoLastEdit`; same for the row-deletion notices at `database-view.ts:8314` and
      `embedded-database-renderer.ts:3208`.
      **Threshold:** the Undo button appears with the notice and performs the undo — or reports
      `notice.nothingToUndo` (`src/i18n.ts:1484`) when the stack is empty, never a silent no-op.
      **Red first:** the notice renders with no button at all today.
      **Capture:** none (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`)
- [ ] T004 [B] [P1] **REQ-055-1 — unify the two undo shapes.** `showOperationResult`
      (`showOperationResult`, called at `database-view.ts:9433-9437`) and the selection bar's undo (`database-view.ts:7719`) render the
      toast component as placements, keeping their positions.
      **Threshold:** one component, one timer contract, one reduced-motion story; both placements
      behave as before in position and timing.
      **Red first:** two independent implementations exist today with separate CSS
      (`styles.css:2662-2700` vs the bar's own rules).
      **Capture:** none (`src/views/database-view.ts`)

### L2 — empty-state flavours and chart absorption

- [ ] T005 [B] [P0] **REQ-055-5 — the two empty-state flavours plus the deleted-relation state**
      (050 REQ-009 at AC-009's threshold, verbatim). `no-source` renders when the source is missing
      or deleted; `no-matches` when the source exists and nothing matched; `deleted-relation`
      names the missing group field and points at view settings. Each with its per-layout add
      affordance.
      **Threshold:** three distinct rendered states, asserted by a lane row; negative control
      collapses two flavours into one and requires red.
      **Red first:** `getEmptyStateReason` maps `sourceCount === 0` to the same
      `no-matching-data` reason a no-match view gets (`empty-state-renderer.ts:210-211`), and a
      deleted board group field silently re-groups (`database-view.ts:2678`, `:2890`, `:3378`).
      **Capture:** the desktop `anytype-inlinecollection-empty-dark.png` renders **no** empty block
      at all, so the design comes from the iOS set's **three-tier ladder** — tier 1
      `mobile/anytype-mobile-sheet-view-filters-empty-dark.png`, tier 2
      `mobile/anytype-mobile-sheet-grid-cell-objecttype-empty-dark.png`, tier 3
      `mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png`, measured in `design-trueup.md`
      §3. The **deleted-relation state is still not captured on either platform** and stays
      designed from `047` §9 with the gap named; its destination is proved by
      `mobile/anytype-mobile-sheet-kanban-groupby-dark.png` (`src/views/empty-state-renderer.ts`,
      `src/views/database-view.ts`)
- [ ] T006 [B] [P0] **REQ-055-6 — absorb chart's private vocabulary.** `chart-renderer.ts`'s
      `renderEmptyState` (`chart-renderer.ts:601-604`) and its action builder (`:609-641`) render through
      `EmptyStateRenderer`; `db-chart-empty`'s rules retire in favour of the shared classes.
      **Threshold:** chart's six reasons (`chart-aggregation.ts:64`) render through the shared
      component with their actions preserved, and zero `db-chart-empty` markup remains.
      **Red first:** chart is the only renderer outside `EmptyStateRenderer` today.
      **Capture:** `chrome-chart-empty` scenario recaptured in the same change and the PNG read
      (`src/views/chart-renderer.ts`, `styles.css`)

### L3 — confirm primitive

- [ ] T007 [B] [P0] **REQ-055-3 — the confirm sheet carries `044`'s grammar.** `createSheetHeader`
      inside `ConfirmModal.onOpen`; the `confirmWithModal` signature unchanged (ADR-055-2).
      **Threshold:** all seven grammar elements pass on the registered `sheet-grammar` row.
      **Red first:** 0 of 7 today — the modal declares `sheet` (`modals/confirm-modal.ts:42` (`super(app, "sheet")`)) and never
      calls `createSheetHeader`, `048` inventory M-4.
      **Capture:** none needed — the grammar is measured by the lane, not by a competitor screen
      (`src/views/modals/confirm-modal.ts`)
- [ ] T008 [B] [P0] **REQ-055-4 — register the confirm's stacked pairs.** A row per parent →
      confirm pair in `048`'s stacked-pair registry, with the stacking negative control.
      **Threshold:** a confirm opened from a sheet dims and scales back its parent with
      |Δ| ≤ 1px and one scrim between them — `048`'s model, consumed unchanged.
      **Red first:** the pair is unregistered today, so the lane cannot fail on it.
      **Capture:** none (`tools/live/sheet-grammar.mjs`, `src/views/modals/confirm-modal.ts`)

### L4 — motion tokens

- [ ] T009 [B] [P0] **REQ-055-7 — the motion tokens.** `--db-motion-fast/surface/sheet/emphatic`
      declared in the `--db-*` block and its dark-theme override (`styles.css:19-125`,
      `:425-433`); the reduced-motion reset (`:918-947`) names every new consumer in the same
      change, shimmer's `infinite` loop included.
      **Threshold:** the tokens resolve on all nine token selectors, and
      `owned-menu-reduced-motion.test.ts`'s coverage mechanism holds for the toast and confirm.
      **Red first:** the tokens do not exist; **42 `transition:` declarations** hand-type `120ms`
      outside any token, carrying 78 occurrences between them, and `var(--db-transition-fast)`
      reaches 7 uses. `--db-motion-surface` is **200ms**, not 180ms (ADR-005).
      **Capture:** none — stylesheet, measured by lane, not capture
      (`styles.css`)
- [ ] T010 [B] [P1] **REQ-055-8 — migrate the legs' own durations.** The files L1-L3 touched read
      tokens; no new literal duration lands in this phase's files.
      **Threshold:** zero untokenized durations in the files this phase changed; the wider census is
      recorded, not swept. **Corrected count:** the `ms` strays (4x150, 3x180, 1x160, 1x100, 1x80)
      plus **16 written in seconds** (10x`0.15s`, 3x`0.2s`, 2x`0.1s`, 1x`0.3s`) that
      `state-feedback-vocabulary.md` §4's census omits — see `design-trueup.md` C8.
      **Red first:** every touched file hand-types durations today.
      **Capture:** none (`styles.css`, the L1-L3 files)

### L5 — capability-gated menus (050 item 8)

- [ ] T011 [B] [P0] **REQ-055-9 — capability gate, never-empty fallback, selection caps**
      (050 REQ-008 at AC-008's threshold, verbatim). One predicate over the selection consulted by
      `row-menu.ts` and `bulk-edit-field-menu.ts`; the fully-restricted case renders a
      "No available actions" row; >1 disables open and link; >10 disables open-in-new-tab.
      **Threshold:** menu item count ≥ 1 in every capability state; caps asserted at the 1, 2, 10,
      11 boundaries.
      **Red first, restated (ADR-004):** the drafted premise is false for `row-menu.ts`, whose
      first row `menu.openNote` (`row-menu.ts:88`) is unconditional — its guarantee is **asserted so
      it cannot regress, not built**. The one real red is `bulk-edit-field-menu.ts`, which maps
      `options` straight from `getBulkEditableColumns` at `:30`/`:38` with no floor and no fallback.
      **The selection caps are not adopted**: our row menu operates on a single row, so >1 and >10
      have no referent.
      **Capture:** the "No available actions" wording is still **code-derived** — no capture shows
      that state. But gating itself is now measured: the same iOS `···` menu carries `Undo/Redo` and
      `Publish to Web` on an object and omits both on a set
      (`mobile/anytype-mobile-sheet-object-more-dark.png` vs `-set-more-dark.png`), and Anytype's
      never-empty answer is a **default row** rather than a message
      (`menus/anytype-menu-set-sort-empty-dark.png`) — `design-trueup.md` §4
      (`src/views/row-menu.ts`, `src/views/bulk-edit-field-menu.ts`)

### L6 — scroll restore and load-more (050 items 5 and 14)

- [ ] T012 [P1] **REQ-055-10 — per-view scroll restore** (050 REQ-005 at AC-005's threshold,
      verbatim). One offset field in `view-state-store.ts`, written on switch-away, restored on
      return, within ±2px, per view independently. Off the critical path; no capture expected.
      **Threshold:** restore within ±2px; the no-field case renders byte-identically to today.
      **Red first:** the store carries no scroll state (`grep -n scroll src/views/view-state-store.ts`
      returns nothing) — every switch returns to the top.
      **Capture:** none needed; behaviour, not appearance (`src/views/view-state-store.ts`)
- [ ] T013 [B] [P2] **REQ-055-11 — the embedded "Load more" row** (050 REQ-014 at AC-014's
      threshold, verbatim). An embedded view over one page renders its page plus an inline
      "Load more" row; the virtualization path is not entered.
      **Threshold:** the row's presence at a 60-row limit and the virtualization mount's absence,
      asserted by lane.
      **Red first, restated (ADR-004):** "the virtualization path is entered" is **false** — there
      is no virtualization anywhere in `src/views`, so it could not be observed red as written. The
      observable red is **0 embedded views honour a page limit and 0 render the row**; the
      "never virtualizes" clause becomes a guard against a future regression. Page limit **60**,
      inline row **~40px** against **48px** full-page.
      **Capture:** `anytype-inlinecollection-empty-dark.png`,
      `anytype-collection-grid-populated-dark.png` (`src/views/embedded-database-renderer.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T014 [P0] One permanent lane row per deliverable under `tools/live/`, each negative control
      observed **red** before green, every other row staying green while it was red
- [ ] T015 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, read from `$?` and never through
      a pipe; `npm run replay` holds with reversed 0
- [ ] T016 [P0] Recapture the `screenshots/project-manager/` board and gantt references and prove
      `pixelHash` unchanged against the pre-phase baseline, or take the difference to the operator
      (goal D4)
- [ ] T017 [P0] **The operator exercises the states on device** — filtered view, row deletion,
      board group-field deletion, drag under sort — and reads them as debugged, refined, perfected
      (the §6A bar). Not tickable by an agent (goal D8)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:ai-protocol -->
## AI Execution Protocol

### Pre-Task Checklist

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Read the task and every file it names before the first edit | [ ] | File:line citations in the task's own table |
| 2 | Confirm the task's threshold was observed red and recorded in `checklist.md` | [ ] | `checklist.md`'s `Today` cell |
| 3 | Confirm the leg touches no file another leg owns (`styles.css` excepted, CSS lane serialized) | [ ] | `plan.md`'s affected-surfaces table |
| 4 | Confirm what may not change: `044`'s grammar, `048`'s model, Project Manager parity, the gallery | [ ] | goal D4, D7 |

### Execution Rules

| Rule | Detail |
|------|--------|
| One leg, one file group | A leg opens its files once; `styles.css` goes through the parent's serialized CSS lane |
| Red first | A task whose threshold has no recorded failing figure does not start |
| Exit statuses from `$?` | `cmd >/tmp/out.log 2>&1; echo $?` — never through a pipe |
| Captures read by a person | A changed PNG is opened and read; a capture that succeeds is not a capture that is right |
| Scope lock | Nothing outside the Files to Change table; adjacent findings are named, not fixed |

### Status Reporting Format

| Status | Meaning |
|--------|---------|
| `OK` | The task's threshold passed and its negative control was seen red after green |
| `OK (residual)` | Threshold passed; the named residual is recorded in the task row, not silent |
| `BLOCKED <reason>` | Forward progress stopped; the blocker and the needed decision are named |

### Blocked Task Protocol

1. Stop at the first failed check; do not retry the same command twice without new evidence.
2. Restate the problem one level up — the interface, the data flow, or the module boundary.
3. If the block is a contract this phase consumes (`044`, `048`, `050`), name the contract and the
   conflict in the task row; never resolve it silently (parent goal: name conflicts).
4. Operator-owned rows (AC-012, OPS-001-004) are never unblocked by an agent.
<!-- /ANCHOR:ai-protocol -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, or deferred with a recorded reason
- [x] No `[B]` blocked tasks remaining — T001 released them on 2026-09-05; every `[B]` task's
      threshold now carries a measured figure in `acceptance-criteria.md`
- [ ] Every row in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and each waiver
      names an ADR that exists in this packet
- [ ] Every `checklist.md` criterion carries both its failing figure and its passing one
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Checklist**: See `checklist.md`
- **Vocabulary**: See `state-feedback-vocabulary.md`
- **Design true-up (T001's output)**: See `design-trueup.md`
- **Goal**: See `goal.md`
- **050 requirement source**: `../050-anytype-adoption/acceptance-criteria.md`
- **Capture index**: `../../../screenshots/anytype/README.md`
<!-- /ANCHOR:cross-refs -->
