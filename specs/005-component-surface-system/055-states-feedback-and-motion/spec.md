---
title: "Feature Specification: States, Feedback and Motion"
description: "One state and feedback vocabulary for every surface — empty, loading, error, success, destructive confirm, undo — one component per state family, one motion-token set, and the 050 states items (5, 8, 9, 14) implemented at their recorded thresholds."
trigger_phrases:
  - "055 spec"
  - "states feedback spec"
  - "state vocabulary"
  - "motion spec"
  - "toast component"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: States, Feedback and Motion

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/084-phase-states-feedback` |
| **Parent Spec** | ../spec.md |
| **Phase** | 51 of 51 |
| **Predecessor** | 050-anytype-adoption |
| **Successor** | None |
| **Handoff Criteria** | Every deliverable's lane row green with its negative control observed red, `npm run gate` exit 0 read from `$?`, and the board/gantt reference captures `pixelHash`-identical to baseline |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 51** of the component surface program — the general UI/UX glue across every
surface, from the operator's directive to *"take the best from AnyType and componentize stuff as
much as possible."* The modal, sheet and menu chrome layers have owners (`044`, `048`, `003`,
`016`, `031`); the **states** layer has none. This phase takes it.

**Scope Boundary**: first-sheet grammar is `044`'s; stacking is `048`'s; the portal and drag are
`003`'s and `016`'s; sheet lifecycle is `031`'s. The table's density, formulas/rollups/calculations,
and the Project Manager 1:1 board and gantt parity are kept as ours (goal D4). The gallery is a
retiring surface and receives inheritance only (goal D7).

**Implements 050 items 5, 8, 9 and 14.** `050`'s `acceptance-criteria.md` AC-005, AC-008, AC-009
and AC-014 are quoted verbatim into this packet; `050` stays the requirement set for them and this
phase is their implementation leg (goal D3). The other ten items are not touched here.

**Dependencies**:
- `050-anytype-adoption` — REQ-005, REQ-008, REQ-009, REQ-014 and their thresholds; its D4/D5
  constraints are consumed unchanged.
- `044-phone-sheet-alignment` — the seven-element `sheet-grammar` the confirm primitive must pass,
  and the lane this phase registers rows in rather than replacing.
- `048-stacked-sheets` — the confirm primitive presents as a stacked child wherever a sheet opens
  it; `048`'s stacking model is a constraint this phase may not regress.
- `design-system.md` — the token snapshot (§4.2), the role vocabulary (§3) and the row grammar (§6)
  every new component declares through.

**Deliverables**:
- `design-trueup.md` — T001's output: every state, feedback shape and motion token measured
  against the captures and against `anytype-ts` source, with nine contradictions resolved in the
  evidence's favour.
- `state-feedback-vocabulary.md` — the seven-state vocabulary, the per-surface must-render /
  renders-today table (also in `spec.md` §5), the motion spec, and the token map.
- One empty-state component absorbing chart's private vocabulary.
- One toast component with severity and an optional action.
- One confirm primitive passing `044`'s grammar and `048`'s stacking.
- Motion tokens in `styles.css`'s token block, migrated call sites, reduced-motion coverage.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Every surface has states; nothing owns them. A view whose source is missing renders the same
`no-matching-data` card as a view whose filter matched nothing
(`empty-state-renderer.ts:210-211` maps `sourceCount === 0` there too), and a board whose group
relation was deleted silently re-groups by the first status/select column
(`getDefaultBoardField`, `database-view.ts:2678`, `:2890`, `:3378`) — the exact surface Anytype gives a
dedicated state that points at view settings (`047` §9). 247 call sites type `new Notice(...)`
with no severity and no action affordance, so a migration notice can promise *"Undo to keep it a
gallery"* (`src/i18n.ts:1455`) over a Notice that cannot carry a button. The confirm sheet — the
most common stacked surface in the plugin (`048` inventory M-4) — declares `sheet`
(`modals/confirm-modal.ts:42` (`super(app, "sheet")`)) and never calls `createSheetHeader`, scoring 0 of 7 on `044`'s grammar.
Chart renders its own `db-chart-empty` with a private reason enum (`chart-renderer.ts:601`,
`chart-aggregation.ts:64`) while eight sibling renderers share `EmptyStateRenderer`. And motion is
**42 `transition:` declarations** hand-typing `120ms` outside the token block — 78 `120ms`
occurrences between them, which is the same population counted two ways — one shared
`--db-transition-fast` reaching only **7** uses, with the reduced-motion reset held green by a coverage test
(`owned-menu-reduced-motion.test.ts`) that any new untokenized transition silently escapes.

### Purpose

One vocabulary, one component per state family, one token set for motion. After this phase, a
surface asks for `empty.no-source` and gets the component; it does not build a card.

<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The seven-state vocabulary and the per-surface must-render / renders-today table (§5).
- The toast component: severity, optional action, keyboard, screen-reader role, and migration of
  the notice call sites this phase owns.
- The empty-state component absorbing chart's private vocabulary, plus the `no-source` /
  `deleted-relation` flavours.
- The confirm primitive passing `044`'s seven elements and `048`'s stacking model.
- Motion tokens, migrated durations/easings, and reduced-motion coverage for every touched surface.
- 050 items 5, 8, 9 and 14: scroll restore, capability-gated never-empty menus, the two empty
  flavours plus deleted relation, and the embedded "Load more" row — at 050's thresholds.

### Out of Scope
- The sheet, modal, menu and stack chrome layers (`044`, `048`, `003`, `016`, `031`).
- The Project Manager 1:1 board and gantt parity — a constraint, never a target (goal D4).
- Formulas, rollups and calculations — their editors keep their presentation; only their *states*
  route through the vocabulary.
- The table's 34px row density decision (parent §6A).
- The gallery's surfaces (goal D7) — `gallery-renderer.ts` inherits through its existing
  `emptyStateRenderer` calls (`:150`, `:220`).
- Migrating all 247 notice call sites — this phase owns the component, the pattern, and the named
  call sites in `plan.md`; the residue is a follow-up, named not hidden.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/empty-state-renderer.ts` | Modify | Add `no-source` and `deleted-relation` flavours; keep `getEmptyStateReason`'s precedence, add the source-missing branch (REQ-009) |
| `src/views/chart-renderer.ts` | Modify | Absorb `db-chart-empty` into the shared component (D5) |
| `src/views/toast.ts` | Create | One toast component: severity, optional action, `role="status"`, motion tokens |
| `src/views/modals/confirm-modal.ts` | Modify | Shared header via `createSheetHeader`; grammar-lane registration (stacked child) |
| `src/views/row-menu.ts` | Modify | Capability gate, never-empty fallback, selection caps (050 REQ-008) |
| `src/views/bulk-edit-field-menu.ts` | Modify | The same gate for the bulk surface (050 REQ-008) |
| `src/views/view-state-store.ts` | Modify | Per-view scroll offset (050 REQ-005) |
| `src/views/embedded-database-renderer.ts` | Modify | Inline "Load more" row; virtualization not entered (050 REQ-014) |
| `src/views/database-view.ts` | Modify | Wire the deleted-group-relation state; route the owned notice sites through the toast |
| `src/views/embedded-database-renderer.ts` (notices) | Modify | Route `notice.galleryMigrated` and `notice.deletedRow` through the toast |
| `styles.css` | Modify | Motion tokens in the token block; `db-chart-empty` rules retired; toast rules; migrated durations — serialized by the parent's CSS lane |
| `specs/.../055-states-feedback-and-motion/state-feedback-vocabulary.md` | Create | The vocabulary, table, motion spec and token map |
| `specs/.../055-states-feedback-and-motion/design-trueup.md` | Create | T001's measured true-up of every state, feedback and motion row |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:vocabulary -->
## 4. THE STATE AND FEEDBACK VOCABULARY

Seven states, named once (goal D1). A surface maps its conditions onto these names; it never
invents a name.

| State | What it means | Component | Renders as |
|-------|---------------|-----------|------------|
| `empty.no-source` | The view's source is missing or deleted — the thing the view reads does not exist | `EmptyStateRenderer` | Card, icon + title + message + per-layout add affordance |
| `empty.no-matches` | The source exists; search, filters or limits matched nothing | `EmptyStateRenderer` | Card, with clear-search / reset-filters actions |
| `empty.deleted-relation` | The field a board (or gallery group) groups by is gone from the schema | `EmptyStateRenderer` | Card that names the missing field and points at view settings |
| `loading` | Data is being read or a render is pending | existing `db-skeleton-loader` (`database-view.ts:11847`, `styles.css:2709-2755`) | Skeleton rows, `role="status"` |
| `error` | An operation failed or data could not be read | Toast (transient) + `read-failed` card (persistent) | Toast with retry; card with retry affordance |
| `success.notice` | An operation completed | Toast | Brief toast, optional Undo action |
| `destructive.confirm` | An irreversible or bulk-destructive action needs a decision | Confirm primitive | Sheet, `044` grammar, danger-styled confirm |

The `undo` affordance is an action slot on success and error — never a state of its own. It
exists today in two shapes: `showOperationResult`'s success/error rail with an Undo/Retry button
(`showOperationResult`, called at `database-view.ts:9433-9437`, 2200ms auto-dismiss) and the selection bar's Undo button
(`database-view.ts:7719`). This phase makes them one toast component; the rail's inline placement and the
bar's affordance both survive as placements of the same component.

### Motion spec

| Token | Value | Used for | Evidence |
|-------|-------|----------|----------|
| `--db-motion-fast` | `120ms ease` (existing `--db-transition-fast`, `styles.css:113`) | Hover/active/focus tone changes, menu rows | 42 `transition:` declarations collapse onto it. Kept against Anytype's neighbouring `0.15s` (`anytype-ts/src/scss/_mixins.scss:2`) because an established project value outranks a neighbouring measurement |
| `--db-motion-surface` | **`200ms ease-out`** | Small floating surfaces: popovers, dropdowns, toasts | **Measured** (ADR-005): Anytype puts menu, popup and sidebar on one `0.2s` constant (`_mixins.scss:5-7`) with a decelerating curve (`:9`). The drafted 180ms was three stray literals, not a token, so the measurement wins; the three literals migrate in L4's own commit |
| `--db-motion-sheet` | `260ms ease-out` (existing `--db-sheet-enter`, `styles.css:121`) | Sheet and scrim entrance; any surface over ~760px of travel | The sheet's own comment records why 260 and not 120 or 500 (`styles.css:114-120`) |
| `--db-motion-emphatic` | `1.1s ease-in-out infinite` | Skeleton shimmer only (`styles.css:2749`) | The one loop; never on a blocking surface |
| `--db-motion-scale-from` | `0.98` | Entrance scale for any floating surface: popover, toast | Our popover already enters from `0.98` (`styles.css:360`) and Anytype's popup from `0.95` (`popup/common.scss:18`) — both inside `sk-design`'s 0.95-1.05 bound, so the established value holds. A token because the toast needs the same number. Anytype's toast `scale3d(0.75)` (`notification/common.scss:25`) is **refused**: outside the bound, on the one surface this phase builds |

Easings: `ease` for tone, `ease-out` for entrances — the keywords, not a ported cubic-bezier.
`design-system.md` declares no easing vocabulary, and Anytype's `$easeInQuint`
(`anytype-ts/src/scss/_mixins.scss:1`) is a curve whose name says the opposite of its shape, so it
is recorded and not carried (`design-trueup.md` §2). **Reduced motion has no counterpart to adopt**
— `prefers-reduced-motion` occurs **0 times** in `anytype-ts/src`, so ours is the only story there
is. `prefers-reduced-motion: reduce` kills every
token: the container-wide reset (`styles.css:918-947`) is extended to name each new token's
consumers, and the `.db-surface` clause that keeps body-mounted menus covered
(`owned-menu-reduced-motion.test.ts` proves the mechanism) gains the toast and any new surface.
A `transitionend`-dependent flow may not use a token shorter than the reset's hard stop — the
container's near-zero duration and `.db-surface`'s real zero exist for exactly that reason
(`styles.css:926-947`).

### Token map to `design-system.md`

| This phase's token/contract | design-system.md anchor |
|-----------------------------|--------------------------|
| Toast is a `menu`-role surface for dismissal and focus; severity is styling, not role | §3 role vocabulary |
| Empty card and toast carry the token snapshot when portalled | §4.2 |
| Toast rows and confirm buttons are `createMenuRow`/row-grammar rows | §6 |
| The confirm sheet declares its presentation; it never infers one from its anchor | §7 |
| Motion tokens join the `--db-*` block on the nine selectors | §2, §4.2 |
| Every new surface registers a `producer` id so the census and CI find it | §3 call-site contract |
<!-- /ANCHOR:vocabulary -->

---

<!-- ANCHOR:surface-table -->
## 5. PER-SURFACE STATE TABLE

**Must** is the complete list of states the surface can legitimately enter. **Today** cites the
`file:line` that proves what renders now. A gap is a row where Today lacks a Must.

| Surface | Must render | Today | Gap |
|---------|-------------|-------|-----|
| Table (`table-renderer.ts`) | `empty.no-matches`, `loading`, `error`, `success.notice`, `destructive.confirm` | `renderTableRow` at `:225`, `:272`, `:314`; skeleton via `database-view.ts:11847`; confirm at `database-view.ts:4956`; notices through raw `Notice` | No `no-source` flavour (source-missing renders `no-matching-data`, `:272` default) |
| Board (`board-renderer.ts`) | `empty.no-matches`, `empty.deleted-relation`, `empty-group` per column, `error`, `success.notice`, `destructive.confirm` | `renderCard` at `:256`, `:863`, `:1119`, `:1194`; group-fallback `getDefaultBoardField` at `database-view.ts:2678`/`:2890`/`:3378` | **No deleted-relation state** — a missing group field silently re-groups |
| Gallery (`gallery-renderer.ts`) | Same set as board, inherited only (goal D7) | `renderCard` at `:150`, `:220` | Same deleted-relation gap, inherited |
| Calendar (`calendar-renderer.ts`) | `empty.no-date-field`, `no-events`, `read-failed`, notices | `renderEmpty` at `:248`, `:263`, `:631`, `:646`, `:667`, `:2510` | None for its declared set; notices un-routed |
| Timeline (`calendar-timeline-renderer.ts`) | `no-date-field`, `no-events`, `no-events-in-range`, notices | `renderEmpty` at `:459`, `:488`, `:4236-4249` | None for its declared set |
| Chart (`chart-renderer.ts`) | Its empty reasons through the **shared** component | Private `renderEmptyState` at `chart-renderer.ts:601-604`, `db-chart-empty`, reasons in `chart-aggregation.ts:64` | **Second vocabulary** — the only renderer outside `EmptyStateRenderer` |
| Embedded views (`embedded-database-renderer.ts`) | `read-failed`, `no-columns`, `no-matches`, `success.notice` (migration), `error` | `renderCard` at `:693-700`, `:1204`, `:1222-1233`, `:1990`; migration notice `:764`; delete notice `:3208` | No "Load more" row (050 REQ-014 gap); notices un-routed |
| Record sheet (`record-detail-panel.ts`) | `error` (read failure), field-level empty/error states | Field renderers in `cell-renderer.ts`; relation miss tooltip `relation-value-renderer.ts:46-47` | Error surface is per-field bespoke |
| Confirm (every destructive path, 19 `confirmWithModal` callers) | `destructive.confirm` in `044` grammar | `modals/confirm-modal.ts:35-98`; callers `column-operations.ts:167,340,347,355,363,376,873,879`, `database-view.ts:4419,4956,7522,9351,9898`, `row-menu.ts:169`, `cell-renderer.ts:1442`, `settings.ts:648`, `status-options-modal.ts:302`, `formula-modal.ts:1641`, `view-config-panel-renderer.ts:1642` | **0 of 7 grammar elements** — no header, no close (`048` inventory M-4). No confirmation dialog appears in any capture; the sweep refused destructive actions by name (`design-trueup.md` §3) |
| Notices (247 call sites) | `success.notice`, `error` with action | Raw `new Notice(...)`; no action affordance anywhere; `galleryMigrated` promises Undo it cannot carry (`src/i18n.ts:1455`) | No toast component; undo promised, never deliverable. Toast geometry is **measured from `anytype-ts` source**, not invented (`design-trueup.md` §2); undo is additionally captured as a persistent **menu row** on iOS (`mobile/anytype-mobile-sheet-object-more-dark.png`), which is a second placement recorded but not built here |
| Selection bar (`database-view.ts:7581-7728`) | `success.notice`-class actions, undo affordance | Bar at `:7581`; undo button `:7719`; `044` keyboard docking at `styles.css:2601-2602` | Second undo shape, not shared with `showOperationResult` |
| Undo/Retry rail (`showOperationResult`, `showOperationResult`, called at `database-view.ts:9433-9437`) | `error` with retry, `success.notice` with undo | Rail at `:11237-11261`, 2200ms timer, CSS `styles.css:2662-2700` | Component exists; not shared, not tokenized motion |

<!-- /ANCHOR:surface-table -->

---

<!-- ANCHOR:requirements -->
## 6. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-055-1 | The toast component exists with severity (`success`/`error`), an optional action slot, `role="status"` announcement, and motion tokens; the call sites named in `plan.md` route through it, and `notice.galleryMigrated`'s Undo becomes deliverable. |
| REQ-055-2 | The confirm primitive passes all seven `044` grammar elements and obeys `048`'s stacking model wherever a sheet opens it. |
| REQ-055-3 | `empty.no-source`, `empty.no-matches` and `empty.deleted-relation` are three distinct declared states with their per-layout affordances (implements 050 REQ-009, AC-009's threshold verbatim). |
| REQ-055-4 | Chart renders its empty reasons through `EmptyStateRenderer`; `db-chart-empty`'s private vocabulary is retired. |
| REQ-055-5 | Motion tokens exist, migrated call sites read them, and reduced-motion coverage holds for every touched surface. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-055-6 | Capability-gated menus with a never-empty fallback and selection caps (implements 050 REQ-008, AC-008 verbatim). |
| REQ-055-7 | Per-view scroll restore within ±2px (implements 050 REQ-005, AC-005 verbatim). |
| REQ-055-8 | The embedded "Load more" row, virtualization path not entered (implements 050 REQ-014, AC-014 verbatim). |

> Acceptance criteria live in `acceptance-criteria.md`, which decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 7. SUCCESS CRITERIA

- **SC-001**: The operator deletes a board's group field and reads a state that names the problem
  and points at view settings — not a board re-grouped by a different column.
- **SC-002**: The migration notice's Undo button does what its text has always promised.
- **SC-003**: A confirm opened from any sheet reads as that sheet's child, in `044`'s grammar.
- **SC-004**: `npm run gate` exits 0 with one lane row per deliverable, each negative control
  observed red first, and the Project Manager board/gantt references unchanged.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 8. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `044`'s `sheet-grammar` lane | Without it the confirm primitive has nowhere to register | The lane exists and is green; this phase adds rows |
| Dependency | `048`'s stacking model | Confirm-as-stacked-child must not regress it | Consume the model unchanged; the confirm row joins the stacked-pair registry |
| Risk | The board's group-fallback change moves a `pixelHash` | H/M — the board carries Project Manager 1:1 parity | Recapture and compare before the leg closes (goal D4); the fallback itself only changes for a *missing* field, which no reference capture depicts |
| Risk | Retiring `db-chart-empty` moves chart captures | M/M | Recapture chart scenarios in the same change (screenshot-currency rule) |
| Risk | Notice migration touches many files | M/H | This phase migrates its named sites only; the component + pattern is the deliverable, the residue is named in `plan.md` |
| Risk | 87 existing transitions + 21 animations in `styles.css` (22,872 lines) | M/M | Tokens are additive; migration is per-file with the CSS lane serialized; no sweep |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nonfunctional -->
## 9. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The toast mounts with transform/opacity only — compositor properties, no reflow of
  the host view.
- **NFR-P02**: Scroll restore adds no measurable frame beyond the view switch itself, within ±2px
  (050 NFR-P02, quoted).
- **NFR-P03**: The 2200ms success-toast auto-dismiss and the error toast's sticky-until-acted
  behaviour replace, not extend, the existing timers — one timer per visible toast, cleared on
  action.

### Security
- **NFR-S01**: No network call, credential, or read outside the vault. Every deliverable is local
  rendering and local state.

### Reliability
- **NFR-R01**: A surface that cannot resolve its state renders its declared state rather than
  throwing — the deleted-relation branch is the case in point.
- **NFR-R02**: The toast and the confirm are correct by construction: dismissal and teardown are
  the component's, not every caller's (the `MutationObserver` precedent, `mobile-bottom-sheet.ts:464`).
<!-- /ANCHOR:nonfunctional -->

---

<!-- ANCHOR:edge-cases -->
## 10. EDGE CASES

### Data Boundaries
- Empty input: a view with zero columns renders `no-columns` with its add affordance
  (`embedded-database-renderer.ts:1204-1219`) — unchanged, now declared in the vocabulary.
- Maximum length: an error message carrying `{error}` text is clamped in the toast; the full text
  stays available on the persistent card.
- Invalid format: a confirm opened from a desktop anchored popover takes the unstacked path
  (`048` §L2 edge cases), still gaining the header.

### Error Scenarios
- A toast's action outlives its dismissal: the Undo handler runs against the history stack's
  current state or reports `notice.nothingToUndo` (`src/i18n.ts:1484`) — never a silent no-op.
- A retry that fails again re-raises the error toast; it does not stack duplicates.

### State Transitions
- Success → undo pressed: the toast dismisses itself and the history stack's `undoLastEdit` runs;
  the selection bar's undo and the rail's undo route to the same stack.
- Partial completion: a declined confirm is a no-op — `openAndWait` already resolves `false` on
  dismissal and cancel identically (`confirm-modal.ts:18-19`), and that contract is kept.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## 11. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 16/25 | ~12 files, ~900 LOC estimated; `recommend-level.sh --loc 900 --files 8` → 43/100 confidence 80% |
| Risk | 12/25 | No auth, no API, no data model. The risk is touch distance: a toast and a confirm every surface can open |
| Research | 4/20 | `047`'s research and the capture index are done; what remains is applying them |
| Multi-Agent | 4/15 | Four component legs + two 050 legs, sequential |
| Coordination | 6/15 | Three upstream phases hold contracts this one consumes |
| **Total** | **42/100** | **Level 3 on judgment** (script: Level 1; raised for program-wide contract reach, matching 050's precedent). Phase score 20/50 against a 25 threshold, so a standard child, not a phase parent |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- ~~The brief routed this phase to `055-*` and the allocator produced `051`.~~ **Resolved at landing
  2026-09-05.** The packet was renamed to `055-states-feedback-and-motion` and every internal
  identifier moved with it (`REQ-055-*`, `AC-055-*`, `ADR-055-*`). The sibling the brief meant is
  the real `051-modal-and-sheet-componentization`, which now exists and **owns the confirm
  primitive** (its ADR-003). This phase's `destructive.confirm` state **consumes** that primitive;
  it does not build one.
- Does the board's deleted-group state also cover a gallery group field, or only boards? Anytype's
  state is board-specific (`047` §9); our gallery groups by field too. Default: board only, gallery
  inherits the generic `no-matches` card until the operator rules.
- Do per-format phone filter rows (050 REQ-013) reach the toast/confirm legs? No — they stay 050's
  L1 leg; this phase's phone surface is the confirm sheet only.
- ~~Is Anytype's destructive treatment one decision?~~ **Resolved at T001.** It is two, and both are
  measured: the desktop carries **no colour at all** on `Move to Bin` or `Empty Bin` (0 reddish
  pixels), while iOS carries `#FF4A4D` **plus** a red trash glyph. We adopt the icon-beside-colour
  pairing and keep `mod-warning`, which the host theme owns (`design-trueup.md` C3).
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Record**: See `decision-record.md`
- **Vocabulary and tables**: See `state-feedback-vocabulary.md`
- **Design true-up (T001)**: See `design-trueup.md`
- **Method and binding restatements**: `../050-anytype-adoption/design-trueup.md`
- **Motion source**: `../../context/anytype-ts/src/scss/`
- **Packet Goal**: See `goal.md`
- **050 requirement source**: `../050-anytype-adoption/acceptance-criteria.md` AC-005/008/009/014
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §9, §10
- **Capture index**: `../../../screenshots/anytype/README.md`
