---
title: "Goal: States, Feedback and Motion"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "055 goal"
  - "states feedback goal"
  - "empty state goal"
  - "motion tokens goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/055-states-feedback-and-motion"
    last_updated_at: "2026-09-05T13:20:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the phase vocabulary table and the four 050 item legs"
    next_safe_action: "Execute T001, the red-first measurement of every threshold in checklist.md"
    blockers:
      - "The deleted-relation and missing-source designs are code-derived; no Anytype capture shows them (see checklist.md §gaps)"
      - "styles.css edits are serialized by the parent's CSS lane; this phase's motion-token leg waits its turn"
    key_files:
      - "src/views/empty-state-renderer.ts"
      - "src/views/modals/confirm-modal.ts"
      - "src/views/database-view.ts"
      - "specs/005-component-surface-system/design-system.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-055-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the deleted-group state cover a gallery group field, or boards only"
    answered_questions:
      - "This phase implements 050 items 5, 8, 9 and 14 and keeps their thresholds verbatim"
      - "The gallery is a retiring surface (specs/007-gallery-view-deprecation): it inherits states, it gets no new work"
---
# Goal: States, Feedback and Motion

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Give every surface one state and feedback vocabulary — empty, loading, error,
success, destructive confirm, undo — reduced to shared primitives (one empty-state component, one
notice/toast component, one confirm primitive, one motion-token set), with Anytype's patterns
adopted where the captures show them better, and the four 050 items that are states and feedback
(5, 8, 9, 14) implemented here at their recorded thresholds.

**Why.** The operator's directive of 2026-09-05: *"research recommendations and how to tackle /
update / improve every modal, sheet and general ui ux to take the best from AnyType and
componentize stuff as much as possible."* The states are the least componentized layer in the
plugin: 247 raw `new Notice(...)` call sites with no action affordance, one empty-state component
shared by eight renderers while a ninth (chart) keeps its own private vocabulary
(`chart-renderer.ts:601`), a deleted board group relation that silently falls back to a default
grouping field instead of a declared state (`database-view.ts:2678`/`:2890`/`:3378`), 42 hand-typed `120ms`
transition declarations outside any token, and a migration notice that promises an Undo its plain
`Notice` cannot carry (`src/i18n.ts:1455`).

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The state vocabulary is seven states, named once:** `empty.no-source`, `empty.no-matches`, `empty.deleted-relation`, `loading`, `error`, `success.notice`, `destructive.confirm`, plus the `undo` affordance attached to success and error. Every surface maps its conditions onto these names; a surface may not invent a state name. **Amended 2026-09-05 at landing:** this is a **naming layer over what already exists**, not a replacement for it. `empty-state-renderer.ts:24-36` already declares **twelve** reasons — `no-database`, `no-columns`, `no-matching-data`, `search-empty`, `filter-empty`, `filter-and-search-empty`, `limit-empty`, `no-date-field`, `no-events`, `no-events-in-range`, `read-failed`, `empty-group` — each with its own title, body and icon at `:143-203`, selected by `getEmptyStateReason` at `:210`. `empty.no-source` maps to `no-database`; `empty.no-matches` covers four refinements the vocabulary collapses (`no-matching-data`, `search-empty`, `filter-empty`, `filter-and-search-empty`). **The mapping is asserted so it cannot regress; the twelve are not reduced to three.** |
| D2 | **Red first, per threshold.** Every criterion carries a threshold and the failing number observed on the current tree (`checklist.md` fills each `Today` cell from source evidence before any code lands). A threshold that cannot be made to fail is not a threshold. |
| D3 | **050 items 5, 8, 9 and 14 are implemented here, at the thresholds `050` ADR-004 RESTATED — not the ones its first draft carried.** All four of this phase's `050` items are in the six `design-trueup.md` §4 found could not be observed red as written, so quoting the original figures verbatim would have made every one of them unfalsifiable. Item 5: the restore machinery **exists** in `database-viewport.ts` with four request kinds; the work is wiring it per view and stopping the `reset-top` request, not building a second snapshot. Item 8: `row-menu.ts` **cannot** render empty; the gap is `bulk-edit-field-menu.ts:31-45` alone, and the selection caps are **not adopted**. Item 9: **twelve** reasons already ship; the one real gap is the deleted-relation state. Item 14: **no virtualization exists** in `src/views`, so "the virtualization path is entered" is false and the threshold becomes a page limit plus a `Load more` row. `050` remains the requirement set; this phase is the implementation leg. The other ten items are not touched here. |
| D4 | **Keep ours where the program says so:** the table's density decision (34px rows), the sheets' ownership (`003`/`044`/`016`/`048`), formulas/rollups/calculations, and the Project Manager 1:1 board and gantt parity. A state change that moves a reference capture's `pixelHash` is wrong until parity is re-proven. |
| D5 | **One component, many callers — and one owner per component.** The empty-state component absorbs chart's private `db-chart-empty` vocabulary; the toast component replaces raw `Notice` at the call sites this phase owns and defines the pattern for the rest. **The confirm primitive is `051`'s** (its ADR-003 exports `openAndWait` and asserts `044`'s seven grammar elements on it); this phase's `destructive.confirm` state **consumes** it, and so does `053`'s sort-conflict confirm. Three packets, one confirm. No new per-surface state markup is permitted after this phase lands. |
| D6 | **Motion is tokenized once, at the values `050` measured.** Durations and easings read from tokens in the same scope as the other `--db-*` tokens (`styles.css:19-125`); a literal duration in a new rule is a review finding. Existing literals migrate by file, not by sweep. The surface-motion pair is **enter 200ms `ease-out`, exit 150ms `ease-in`** (`design-trueup.md` §4 Motion). The provenance is recorded rather than rounded: nothing about motion is readable from a still, so `047` §10's 0.2s/0.1s is a source read of one centralized `animationProps` helper; the 200ms enter sits inside the 180-260ms band for a small state change, while the 100ms exit sits **below** the 120ms floor for direct feedback and would read as a cut rather than a dismissal — 150ms is the closest in-band value. |
| D7 | **The gallery is a retiring surface** (`specs/007-gallery-view-deprecation`). It inherits the vocabulary through `gallery-renderer.ts`'s existing calls (`:150`, `:220`); it receives no new state work. |
| D8 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

`roadmap.md` §4 maps report to phase; §5.A places this phase; §6A holds the operator decisions this
packet consumes — header everywhere, 16px sheet inset and title, the condition-panel role, and the
"debugged, refined, perfected" bar for every phone surface.

**Precedence.** The parent goal's decisions outrank this file; this file outranks any summary.
Name conflicts; never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **The seven-state vocabulary is written, and a per-surface table names which states each
      surface must render and which it renders today, citing `file:line`.** **Today: the table
      exists in this packet's `spec.md` §5** as the authored baseline; it is the document the
      implementation is checked against.
- [ ] **A missing source, a present source with no matches, and a deleted board group relation
      render three distinct declared states.** **Restated 2026-09-05 against `design-trueup.md`
      REQ-009**, because "today: 1" was false by a wide margin. **Twelve** reasons already ship
      (`empty-state-renderer.ts:24-36`), each with its own title, body and icon (`:143-203`),
      selected by `getEmptyStateReason` (`:210`) from source count, active search, active filters
      and active limit. Our `no-database` **is** the "target" flavour and `no-matching-data`,
      `search-empty`, `filter-empty` and `filter-and-search-empty` are four refinements of the
      "view" flavour Anytype's source describes as one. **The one real gap is the third state**:
      `empty-group` means "this group has no rows", not "the relation this board groups by no
      longer exists" — and a deleted group field falls back to `getDefaultBoardField`
      (`database-view.ts:2678`, `:2890`, `:3378`) with no state at all. **Today: 12 reasons ship,
      0 of them is the deleted-relation state.** Done is: the existing mapping asserted so it
      cannot regress, plus the one missing state built and pointing at view settings.
- [ ] **One toast component carries severity and an optional action, and every notice this phase
      owns routes through it.** **Today: 0 of 247** `new Notice(...)` call sites
      (`grep -rn "new Notice(" src --include="*.ts"`, tests excluded) carry an action affordance,
      and `notice.galleryMigrated` (`src/i18n.ts:1455`) promises an Undo the notice cannot carry.
- [ ] **The confirm sheet passes `044`'s seven grammar elements — through `051`'s primitive, not a
      second one.** **Today: 0 of 7 asserted.** `ConfirmModal` declares `sheet` at
      `modals/confirm-modal.ts:42` (`super(app, "sheet")`, class at `:35`) and inherits `DbModal`'s
      chrome, but no exported confirm primitive exists and no grammar row asserts it — the gap
      `048`'s inventory row M-4 records. **`051` ADR-003 owns building and exporting it**; this
      criterion closes when this phase's `destructive.confirm` state consumes that primitive and its
      grammar row is green.
- [ ] **050 items 5, 8, 9 and 14 hold at the thresholds `050` ADR-004 RESTATED.** All four were in
      the six `design-trueup.md` §4 found could not be observed red as written, so each red below is
      rewritten from the tree rather than copied from `050`'s first draft.
      **Item 5 (scroll restore, ±2px):** accurate as a symptom, wrong as a diagnosis. A
      snapshot-and-restore already exists in `database-viewport.ts` with four request kinds —
      `auto`, `preserve-anchor`, `preserve-raw`, `reset-top` (`:37`) — capturing `container.scrollTop`
      (`:67`) and a row anchor with an offset, restoring either the raw offset (`:76`) or the
      anchor-relative one (`:84`). **Today: view switching asks for `reset-top`, so 0 views restore.**
      The work is wiring the existing snapshot into per-view state, **not** building a second
      mechanism — "two mechanisms for one decision" is a `design-system.md` §10 anti-pattern with
      its own scar. `preserve-raw` restores an integer `scrollTop`, so ±2px is generous and will hold.
      **Item 8 (never-empty menu):** "a fully-restricted selection renders an empty menu" is **false
      for `row-menu.ts`**, whose first row (`menu.openNote`) is unconditional. **Today: 1 file can
      violate it — `bulk-edit-field-menu.ts:31-45`**, which maps `options` straight from
      `getBulkEditableColumns` with no floor and no fallback. The row menu's guarantee is
      **asserted so it cannot regress, not built**. The selection caps (>1, >10) are **not
      adopted, with a reason**: our row menu operates on a single row, so they have no referent.
      **Item 9 (empty states):** see the criterion above — 12 ship, the deleted-relation state is
      the gap.
      **Item 14 (inline `Load more`):** "the virtualization path is entered" is **false** — there
      is no virtualization anywhere in `src/views` (the only `virtualis*` match in `src` is
      `data/calendar-timeline-model.ts`, the timeline's own model), so an embedded view cannot
      enter a path that does not exist. Restated to something observable: **an embedded view
      honours a per-view page limit and renders a `Load more` row past it**, at Anytype's own
      captured default of **60** (`Page limit  60 ›`, `anytype-set-gallery-view-dark.png`), with
      **≈40px inline rows against 48px full-page rows** (measured both ways). The "never
      virtualizes" clause becomes a guard against a future regression, not today's red.
      **Today: 0 embedded views honour a page limit and 0 render a `Load more` row.**
- [ ] **Motion durations and easings are tokenized at the measured values, and reduced-motion
      coverage holds for every surface the phase touches.** The surface pair is **enter 200ms
      `ease-out`, exit 150ms `ease-in`** (`design-trueup.md` §4). **Today: 42** transition
      declarations hand-type `120ms` outside any token — **recounted at landing 2026-09-05**;
      the draft's 78 was measured against a different tree and does not reproduce
      (`grep -o "transition:[^;]*" styles.css | grep -c 120ms` → 42). One shared
      `--db-transition-fast` (`styles.css:113`, `120ms ease`) exists, and the reduced-motion reset
      covers container descendants and `.db-surface` (`styles.css:918`, proven by
      `owned-menu-reduced-motion.test.ts`).
- [ ] **`npm run gate` exits 0 read from `$?`, with one permanent lane row per deliverable, each
      negative control observed red before green, and the board and gantt reference captures
      `pixelHash`-identical to their baseline** or the difference operator-ruled.
- [ ] **The operator opens a filtered view, deletes a row, deletes a board group field and drags a
      card under a sort, and reads the states as debugged, refined, perfected.** Only the operator
      closes this row; nothing in this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from the operator's componentize directive | Done | Operator 2026-09-05, *"…componentize stuff as much as possible"* |
| 050 items 5, 8, 9, 14 assigned to this phase | Done | This packet's `spec.md` §3; thresholds quoted in `acceptance-criteria.md` |
| Level derived | Done | `recommend-level.sh --loc 900 --files 8` → Level 1, 43/100, confidence 80%; `--architectural` phase score 20/50 against a 25 threshold, so a standard child. Raised to **Level 3** on judgment — the vocabulary binds every surface, exactly the ground 050 raised over |
| Inventory read from source | Done | `spec.md` §5, every cell citing `file:line` |
| Red-first measurements | Pending | T001 fills `checklist.md`'s measured cells |
| Implementation legs | Pending | T002-T010, one leg per component |
| Lane rows and gate | Pending | T011-T013 |

### Deviations and findings

| Item | Note |
|------|------|
| **The folder-number collision is resolved** | The brief named `055-states-feedback-and-motion`; `create.sh --phase --parent` allocated **051** instead, which is the number this packet was drafted under. At landing 2026-09-05 the folder was renamed to `055-states-feedback-and-motion` and every internal identifier moved with it — `REQ-051-*` → `REQ-055-*`, `AC-051-*` → `AC-055-*`, `ADR-051-*` → `ADR-055-*`, the continuity `packet_pointer`, the four `session_id`s, the trigger phrases and `description.json`'s `specId`. The sibling the brief meant is the real `051-modal-and-sheet-componentization`, which now exists and owns the confirm primitive. |
| The scaffold script left broken stubs, so the docs were authored from 050's structure | `create.sh` produced Level-1 stubs and `upgrade-level.sh` stacked template headers without rendering content. The packet rule's fallback applied: `050`'s file set was copied as structure and every field written honestly. A `.backup-*` directory the upgrader left was removed. |
| `create.sh` injected two placeholder rows into the parent `spec.md`'s Phase Documentation Map | Script behaviour, not an edit this packet made. **Closed at landing 2026-09-05: the placeholders were never carried over.** They existed only in `worktrees/084-phase-states-feedback`'s copy of the parent `spec.md`; the landing branched from `origin/main`, whose parent spec has no such rows, and the phase map was written by hand instead. |
| **Landed in-runtime 2026-09-05, and renamed** | Reviewed against the parent's D1-D14, `050`'s `design-trueup.md` and the current tree, then copied from `worktrees/084-phase-states-feedback` and renamed from `051-states-feedback-and-motion` to **`055-states-feedback-and-motion`**. **This packet carried the most true-up damage of the five**, because all four of the `050` items it implements are in the six `design-trueup.md` §4 found could not be observed red as written. Every one of its four `050` reds was rewritten: item 5 (the restore machinery exists), item 8 (false for `row-menu.ts`, true only for `bulk-edit-field-menu.ts:31-45`, caps not adopted), item 9 (twelve reasons ship, not one), item 14 (no virtualization exists at all). D1, D3, D5 and D6 were amended; AC-003, AC-005, AC-009, AC-010, AC-011 and C3, C5, C10 rewritten. **Counts and citations corrected**: the untokenized `120ms` transitions recount to **42**, not 78; `confirm-modal.ts:45` → `:42`; `database-view.ts:10594` → `:2678`/`:2890`/`:3378`; `:11230` → `:9433-9437`; `:7716` → `:7719`; `chart-renderer.ts:600` → `:601`. **Spot-checked and confirmed exact**: the **247** `new Notice(` call sites, `empty-state-renderer.ts:210` `getEmptyStateReason`, `styles.css:113` `--db-transition-fast`, `src/i18n.ts:1455` `notice.galleryMigrated`. |
| Chart keeps a second empty-state vocabulary | `chart-renderer.ts:601-604` builds `db-chart-empty` with its own reason type (`chart-aggregation.ts:64`), parallel to `EmptyStateRenderer`'s twelve reasons. This is the concrete instance D5's one-component rule exists to end; absorbing it is L2. |
| The undo affordance is ours, not copied | No Anytype capture shows an undo surface and no `047` finding names one. The plugin already has two (`showOperationResult`, `database-view.ts:9433-9437`; the selection bar's undo, `database-view.ts:7719`); this phase makes them one component and gives `notice.galleryMigrated` the button its text promises. The Anytype contribution is the consistency requirement, not a screen. |
<!-- /ANCHOR:log -->
