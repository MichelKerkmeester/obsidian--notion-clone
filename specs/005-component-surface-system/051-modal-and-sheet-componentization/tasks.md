---
title: "Task Breakdown: Modal and Sheet Componentization"
description: "T001 builds the surface inventory and T002 measures the reds; every implementation task carries the threshold it closes, the red-first proof for it, and the capture its design was read against or the named gap."
trigger_phrases:
  - "051 tasks"
  - "shell primitive tasks"
  - "modal componentization tasks"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Modal and Sheet Componentization

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
proof** that threshold was seen failing, and the **capture** its design was read against, or the
named gap. A task missing any of the three is not ready to start. Operator rows are marked and stay
unticked — an agent never ticks them.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:ai-exec -->
## AI Execution Protocol

### Pre-Task Checklist

Before starting any task, verify:

1. [ ] `spec.md` scope unchanged
2. [ ] Current leg identified in `plan.md` §3b's phase table
3. [ ] Task dependencies satisfied (Phase 1 before Phase 2; the shell before its consumers)
4. [ ] Relevant P0/P1 checklist items identified in `checklist.md`
5. [ ] No blocking issues in `decision-record.md`
6. [ ] Previous session context reviewed (the parent's `handover.md`, then this packet's log)

### Execution Rules

| Rule | Description |
|------|-------------|
| TASK-SEQ | Complete tasks in dependency order — T001/T002 gate the legs (goal D1, D2) |
| TASK-SCOPE | Stay within the task's named file group; one leg, one file (goal D7) |
| TASK-VERIFY | Verify against `acceptance-criteria.md`; read exit statuses from `$?`, never through a pipe |
| TASK-DOC | Update the task checkbox and its `checklist.md` evidence cell in the same pass |
| TASK-SYNC | A leg that changes a registered pair's markup updates `tools/live/sheet-grammar.mjs` in the same commit, never after |

### Status Reporting Format

```
## Status Update - <timestamp>
- **Task**: T### - <description>
- **Leg**: <Phase 1-4>
- **Status**: [IN_PROGRESS | COMPLETED | BLOCKED]
- **Evidence**: <command, lane output, or capture read>
- **Blockers**: [None | description]
- **Next**: T### - <next task>
```

### Blocked Task Protocol

A task that cannot proceed stops and records, in this order: the failing command and its output, the
contract it conflicts with (`044`/`048`/`003`/`050`), and the smallest unblocking decision. Two
failed attempts on the same failure without new evidence is the stop signal — escalate in the parent
program's escalation format rather than retrying. A task blocked on the operator is marked `[B]`
with the owner named, never self-closed.
<!-- /ANCHOR:ai-exec -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1 — Evidence

- [x] **T001 — Build the surface inventory: one row per family surface.** **Done 2026-09-05 —
      `design-trueup.md`**, which is the file this row drafted as `modal-surface-inventory.md`;
      the filename changed and nothing else did.
      Surface → shell role → presentation → changes → Anytype pattern with its capture filename or
      its named gap → stays ours. Covers the 20 `extends DbModal` subclasses, the 3
      `FuzzySuggestModal` subclasses outside `DbModal`, and the 12 independent `createSheetHeader`
      sites. **Threshold**: every census surface carries a row with all six cells filled; zero
      "unknown". **Met**: 35 of 35 rows; 25 name a capture, 10 carry **design inferred from source
      code, not seen**. **Red-first proof**: the file did not exist. **Capture**: the shell
      behaviours were read directly — 151 desktop states in `screenshots/anytype/`, 600 menu files
      in `screenshots/anytype/desktop/menus/`, 118 iOS sheet files in `screenshots/anytype/mobile/` — not
      taken second-hand from `../050-anytype-adoption/design-trueup.md`, which had no phone
      captures to read. The desktop values came back identical off the second set
      (`design-trueup.md` §2a). **Per ADR-002 (Accepted, operator 2026-09-05 ~14:15: "Yes, where
      the capture shows it")**: all thirty-one registered pairs were read; **two convert** —
      `properties property type picker` and `add view property picker` — and twenty-nine keep
      `048`'s stacking, ten of them because nothing equivalent was captured
      (`design-trueup.md` §4).
- [x] **T002 — [P] Measure every red in `acceptance-criteria.md` and write it into
      `checklist.md`.** Chrome-deciding sites (4), independent header sites (12), undeclared titles
      (20 of 20), exported confirm primitives (0), sub-page affordances (0), shell geometry
      literals, motion literals. **Threshold**: one failing figure per criterion. **Red-first
      proof**: the figures themselves. **Proof**: `checklist.md`'s Today column, every cell filled
      from the tree rather than from this document. **Unblocked**: T001 landed, so the geometry and
      motion literal counts have a target list to be counted against
      (`design-trueup.md` §2a, §2b).
      **Done 2026-09-05** — every `Unmet` row in `acceptance-criteria.md` and every threshold row
      in `checklist.md` C1-C10 carries the exact `rg`/`node`/`ls` command and its output, dated.
      All previously stated figures were confirmed exactly against HEAD: 4 chrome-deciding sites
      (`rg -n "attachSheetChromeToModal\("`), 20 `extends DbModal` subclasses and 0 declared
      titles, 12 `createSheetHeader` call sites, 0 exported confirm primitives, no shell affordance
      (`surface-shell.ts` absent), 12 `sheet-grammar` surfaces / 31 stacked pairs green
      (`node tools/live/sheet-grammar.mjs` exit 0), `npm run replay` exit 0 reversed 0. Two
      corrections: `checklist.md` C4 had gone stale after T001 landed (still read "file does not
      exist") and is now reconciled with AC-004's `Met` status; AC-006's Verification cell cannot be
      observed red as written (it reads "0" both before the shell exists and after it is correctly
      built) and `decision-record.md` ADR-006 (Proposed) restates it against today's scattered
      per-property literal count. A stray `tools/live/replay.json` timestamp written by running the
      lane was reverted before commit — out of this task's write authority.
- [ ] **T003 — [P] Capture the board and gantt parity baseline before any `styles.css` or shared
      chrome commit.** **Threshold**: a recorded `pixelHash` per reference capture. **Red-first
      proof**: n/a — this is the baseline the later comparison is meaningful against. **Proof**: the
      hashes recorded in `checklist.md` C9.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2 — The shell (plan §8 leg 2)

- [ ] **T004 — Build `src/views/surface-shell.ts` with `createSurfaceShell` and unit tests.**
      Presentation resolution, declared title with the counted scrape fallback, chrome composition
      in the order `plan.md` §3 tabulates, `overlayStack` registration, idempotent teardown.
      **Threshold**: every behaviour's unit test green, and the module imports from
      `mobile-bottom-sheet.ts` without importing from any consumer. **Red-first proof**: the module
      does not exist; the tests fail on its absence. **Capture**: none needed — this is composition
      of existing behaviour.
- [ ] **T005 — Delegate `DbModal.applyPresentation` to the shell.**
      `db-modal.ts:92-113`'s branch calls the shell; `getSheetTitle` (`:83-88`) becomes the fallback
      behind a declared title and its use is counted. `onClose`'s idempotent
      `applySheetChrome(el, false)` (`:70-79`) is kept verbatim — NFR-R01. **Threshold**:
      chrome-deciding sites 4 → 2 (the shell and the three outliers, still direct). **Red-first
      proof**: the count of 4, recorded at T002. **Capture**: none needed.
- [ ] **T006 — Add the sub-page stack to the shell: replace in place, back affordance in the
      header.** **Threshold**: a sub-page push changes the frame's body and header while the
      frame's **width and anchored edge** hold to `|Δ| ≤ 1px` (the tolerance `048` AC-002 already
      measures); the **cross-axis extent is not asserted** — it is content-driven on desktop and
      unchanged on phone, measured (`design-trueup.md` §6 C1). **Red-first proof**: today no shell
      affordance exists — the measurement has nothing to run against, so the negative control is a
      push that stacks instead of replacing, observed moving the anchored edge. **Capture**: read
      directly. Desktop `anytype-menu-set-view-settings-dark.png` (360 × 316) →
      `anytype-menu-set-view-layout-dark.png` (360 × 298), header `‹ Layout`, width invariant.
      Phone `anytype-mobile-sheet-view-edit-dark.png` →
      `anytype-mobile-sheet-view-layout-picker-dark.png` →
      `anytype-mobile-sheet-view-gallery-imagepreview-dark.png`, all three at frame top **1261** and
      handle **1278** device px. **Third move**: the shell also offers a stacked *menu* — no handle
      on the child, parent undimmed on desktop — which is neither of the two this task was drafted
      with (`design-trueup.md` §3).
- [ ] **T007 — Give the shell its geometry and motion, read from the measured values.**
      **Desktop**: 8px radius, 16px/8px padding, 8px divider clearance, 28px rows, 360px `panel`
      width. **Phone**: an 8pt inset on three sides, ≈16pt radius, a 34 × 5pt grab handle 6pt below
      the top edge, 50pt rows, an ≈70pt header, and `044`'s 44px close. Motion enter 200ms
      `ease-out`, exit 150ms `ease-in`. **Threshold**: zero per-surface geometry literals in the
      shell's own path; every migrated literal named or reasoned in the inventory. **Red-first
      proof**: the literal count at T002. **Capture**: `design-trueup.md` §2a and §2b; motion stays
      `050` §4's reconciled band, labelled as a source read rather than a measurement, because no
      static capture carries timing. **Five refused values, each with its number**: `050`'s
      `#232323` row highlight (1.14:1) and its colour-only active-state signalling; the iOS
      empty-value grey `#7B7B7B` (3.89:1, replaced by the applied-value grey at 5.16:1); the iOS
      grab handle `#555555` (2.21:1) as a *dismissal affordance*, which is why `044`'s close
      survives; and the reference's own divider inset, which has three different answers and so
      supplies no rule (`design-trueup.md` §6 C8). The refusals are repeated in the inventory so
      nobody re-adopts them.
      **The 8pt phone inset is the regression surface**: every `sheet-grammar` selector measuring a
      sheet rect moves with it, so it lands with T012's row updates, in the same commit.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3 — Consumers (plan §8 leg 3)

- [ ] **T008 — Declare a title and a shell role on the 13 `sheet` subclasses.**
      **Threshold**: 13 of 13 declare; the scraped fallback's use drops by 13. **Red-first proof**:
      20 of 20 undeclared today. **Capture**: none needed. **Assert** the declared title against the
      previously scraped one in the same leg; any intentional difference is recorded, not absorbed.
- [ ] **T009 — Disposition the 4 `fullscreen` subclasses.**
      `ChartDrilldownModal` (`chart-renderer.ts:972`), `InvalidTimeEventsModal`
      (`modals/invalid-time-events-modal.ts:78`), `FormulaModal` (`modals/formula-modal.ts:217`),
      `PropertyTypeConflictModal` (`modals/property-type-conflict-modal.ts:90`). **Threshold**: each
      either takes a shell role or carries a written reason for staying `fullscreen`. **Red-first
      proof**: none carry either today. **Resolved** (`decision-record.md` ADR-004, Accepted,
      operator 2026-09-05 ~14:15: "Keep fullscreen for the workbench only") — `FormulaModal` carries
      the written reason and stays `fullscreen`; `ChartDrilldownModal`, `InvalidTimeEventsModal` and
      `PropertyTypeConflictModal` take the shell's modal (desktop) / sheet (phone) role. No longer
      blocked.
- [ ] **T010 — Route or disposition the 3 non-`DbModal` outliers.**
      `src/main.ts:3047`, `image-file-suggest-modal.ts:40`,
      `markdown-file-suggest-modal.ts:34`. **Threshold**: chrome-deciding sites 2 → 1, or a written
      reason per survivor. **Red-first proof**: 3 direct callers today. **Blocked on** `spec.md`
      §11's second open question.
- [ ] **T011 — Route the 12 independent `createSheetHeader` sites through the shell where the
      surface is a shell consumer.** `cell-renderer.ts:952`, `toolbar-renderer.ts:1384`,
      `owned-menu.ts:218`, `date-value-picker.ts:410`, `mobile-bottom-sheet.ts:241` (the engine's
      own, which stays), `sort-panel-renderer.ts:113`, `icon-picker-popover.ts:102`,
      `dropdown-field.ts:199`, `option-color-picker.ts:67`, `filter-panel-renderer.ts:259`,
      `view-config-panel-renderer.ts:351`, `column-manager-renderer.ts:180`. **Threshold**: each
      site is migrated or dispositioned; the engine's own call is the expected survivor.
      **Red-first proof**: 12 today. **Coordinate**: `owned-menu.ts` and `dropdown-field.ts` are
      `052`'s files, the three panel renderers are `053`'s, `cell-renderer.ts` is `054`'s — this
      task changes the header call only, and the owning phase's leg carries the row change.
      **Header shape**: `createSheetHeader` (`mobile-bottom-sheet.ts:160-176`) builds two slots — a
      leading title, then `beforeClose`, then the close. Every Anytype sheet header is three slots
      with the **title centred** and a **leading action**: `Clear | Priority (Project Tracker) | +`,
      `Edit | Sorts | +`, `Filters | +`, `Edit view | ···` (`design-trueup.md` §6 C6). The shell's
      header gains the leading slot and centres the title; `044`'s close keeps the trailing edge.
- [ ] **T012 — [P] Update `tools/live/sheet-grammar.mjs` rows in the same commit as any markup
      move.** **Threshold**: the twelve registered surfaces and thirty-one registered pairs stay
      green after every leg. **Red-first proof**: the negative control each row already carries.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4 — Confirm, lanes and closure

- [ ] **T013 — Export the confirm primitive and assert `044`'s seven grammar elements on it.**
      `modals/confirm-modal.ts` — `openAndWait` (`:45`, module entry `:98`) becomes the family
      confirm; `ConfirmModal`'s `super(app, "sheet")` (`:42`) keeps its presentation. **Threshold**:
      7 of 7 grammar elements on the confirm sheet, and exactly one confirm path in `src/`.
      **Red-first proof**: no exported primitive exists today, so both `053` and `055` name one that
      is not there. **Capture**: **none, and now confirmed as none.** No destructive confirm appears
      in any of the 118 iOS states or the 600 desktop menu files, and the desktop crawler refuses
      destructive actions by name (`screenshots/anytype/README.md`, "Not captured"). What the
      captures do show is Anytype's *posture*: `Delete`
      (`anytype-mobile-sheet-object-more-dark.png`) and `Empty Bin`
      (`anytype-menu-nav-widget-bin-dark.png`) raise **no confirm at all**, because deletion is
      reversible into a Bin. Ours is not, so the posture is **refused, not adopted** — this row's
      design stays **inferred from source code, not seen** (`design-trueup.md` row 1). One thing is
      adopted: a destructive row is red **and** carries a trash icon, a second signal beside the
      colour.
- [ ] **T014 — [P] Register `053`'s sort-conflict confirm and `055`'s destructive-confirm as
      consumers, not as new surfaces.** **Threshold**: zero second confirm implementations across
      the three packets. **Red-first proof**: both sibling packets currently name a primitive that
      does not exist.
- [ ] **T015 — Add one permanent lane row per shell deliverable, each with a negative control.**
      **Threshold**: `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; each control observed red
      before its green. **Red-first proof**: the rows do not exist.
- [ ] **T016 — [P] Re-read the board and gantt parity captures against T003's baseline.**
      **Threshold**: `pixelHash`-identical, or an operator ruling on the difference (parent goal
      D5). **Red-first proof**: T003's recorded hashes.
- [ ] **T017 — Run `npm run replay` and confirm it holds with reversed 0.** **Threshold**: reversed
      0. **Red-first proof**: the reversal is the control.
- [ ] **T018 — [B] Operator device pass.** The operator opens a modal, a sheet, a sub-page and a
      destructive confirm on iOS and on desktop. **Threshold**: they read them as one surface
      family. **Owner**: the operator. **This row stays unticked until they say so** — an agent
      never ticks it.
- [ ] **T019 — Reconcile completion metadata and validate.**
      `validate.sh <this folder> --strict` first `RESULT:` PASSED; `checklist.md` every item marked
      with evidence; `goal.md`'s log updated; graph metadata regenerated after the last doc edit.
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:completion -->
## Completion

The packet closes when every row in `acceptance-criteria.md` is `Met`, `Waived` with an ADR, or
`Superseded` with an ADR — except AC-010, which is the operator's and which nothing in this
repository can close (parent D3).
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-references

- **Requirements**: `spec.md` §4
- **Thresholds**: `acceptance-criteria.md`
- **Reds**: `checklist.md`
- **Rulings**: `decision-record.md`
- **Design read of record**: `../050-anytype-adoption/design-trueup.md`
- **Sheet grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
<!-- /ANCHOR:cross-refs -->
