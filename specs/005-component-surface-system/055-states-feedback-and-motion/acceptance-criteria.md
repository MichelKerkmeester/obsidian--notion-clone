---
title: "Acceptance Criteria: States, Feedback and Motion"
description: "The criteria this packet must satisfy before it may be closed, one threshold per deliverable, each met, waived by a decision record, or superseded by one — with 050's items 5, 8, 9 and 14 thresholds quoted verbatim."
trigger_phrases:
  - "055 acceptance criteria"
  - "states feedback criteria"
  - "closure gate 055"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/055-states-feedback-and-motion"
    last_updated_at: "2026-09-05T20:45:00Z"
    last_updated_by: "landing-verification"
    recent_action: "AC-001 met by a constructed lane row; AC-002 unmet, AC-007 reset repair recorded"
    next_safe_action: "Start L2 (T005/T006) — the empty-state flavours and chart absorption"
    blockers:
      - "AC-012 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/empty-state-renderer.ts"
      - "src/views/modals/confirm-modal.ts"
      - "src/views/database-view.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-055-ac"
      parent_session_id: null
    completion_pct: 8
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: States, Feedback and Motion

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `plan.md`'s ADR section.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/055-states-feedback-and-motion
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC-005, AC-009, AC-010 and AC-011 implement `050`'s AC-009, AC-008, AC-005 and AC-014
respectively (the REQ column carries the mapping) and quote those thresholds verbatim (goal D3);
where both packets exist, `050` stays
the requirement set and this packet is the implementation leg.

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present. Every threshold carries a failing number
observed before the fix (goal D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-055-1 | **Given** any notice this phase owns, **When** it renders, **Then** it is the toast component with the correct severity, and **When** it carries an action, **Then** the action is clickable and performs what it labels | Lane row on the constructed mount asserting severity, action presence and callback wiring. Today: **0 of 247** notice call sites carry an action affordance. The component's geometry is **measured from source, not invented** (`design-trueup.md` §2): 384px wide, fixed 12px from the bottom-right, 12px radius, 16px padding, **64px** min-height (the on-scale neighbour of the measured 70px), action row `gap: 8px` at `margin-top: 12px`, auto-hidden when empty, cards stacked at one anchor with only the first rendering content (`anytype-ts/src/scss/notification/common.scss:6`, `:20`, `:38-39`, `:50-52`). **Severity is ours**: the reference toast has one visual and no severity axis. **Green:** `src/views/toast.ts` built — `showToast()` pairs `success`/`error` with `check`/`alert-triangle` (never colour alone), mounts `.db-surface db-toast-stack` at the measured geometry, auto-hides its action row when empty (`:empty`), stacks new cards at `:first-child`, and its action button calls `onClick` then closes. Red confirmed by deleting the module and re-running `npx vitest run src/views/toast.test.ts` (import failure, 0 of 9 assertions collectible); green: 9/9 pass on the built module (`src/views/toast.test.ts`) — source assertions, which is this repository's own idiom for a module vitest cannot mount, since the suite runs `environment: "node"` with no DOM. **The lane row this cell asks for now exists** (`tools/storybook/verify-placement.mjs`, section "the toast pairs severity with a glyph and its action reaches its callback"): seven checks on a real card built by `showToast` in headless Chrome — success/error draw `check` vs `alert-triangle` (severity by glyph, not colour alone); `role=status` / `aria-live=polite` on a `db-surface db-toast-stack` whose parent is the body; the action row computes `display:none` with no action and `flex` with one; the action carries its label and runs its callback exactly once; the press dismisses the card; the built geometry measures **384px wide, 12px from the right and bottom, 12px radius, 16px padding, 64px min-height, action gap 8px at margin-top 12px** — every figure the source read predicted; and the entrance computes `1e-05s` under `prefers-reduced-motion: reduce` against `0.2s` without it. Width is read off `offsetWidth`, not a bounding rect: read as a rect during the entrance the card measures 376px, which is 384 x `--db-motion-scale-from`, an animation frame rather than a layout. Each of the seven was observed **red** first across three control runs (severity pairing collapsed to one glyph; `.db-surface` dropped from the mount; the callback unwired; the `:empty` rule deleted; the close-on-action removed; the reset's weight reverted), with every other check in the 380-row lane staying green throughout. **Producer registration is escalated, not done** — ADR-007. The `notice.galleryMigrated` sites are the owned migration this leg closes — see AC-002; the row-deletion notices and the rail/selection-bar unification remain their own tasks | Met | - |
| AC-002 | REQ-055-1 | **Given** a gallery view migrating to a board, **When** `notice.galleryMigrated` renders, **Then** an Undo action is present and performs the undo — or reports `nothingToUndo` when the stack is empty | Lane row asserting the action and its empty-stack branch. Today: **the notice has no button** (`src/i18n.ts:1455` promises one over a bare `Notice`). **Green:** `database-view.ts` (standalone) and `embedded-database-renderer.ts` (embed) both route the notice through `showToast()` with an Undo action wired to the existing `this.undoLastEdit()` — which already reports `notice.nothingToUndo` (`replayHistory`/`undoLastConfigEdit`) when its own stack is empty, so the empty-stack branch is the pre-existing mechanism, not new code. **Not yet Met against this row's own declared verification, and the gap is named rather than rounded up.** What is observed: the component half is lane-proven (AC-001's row — the action carries its label, runs its callback exactly once, and dismisses the card), and both call sites pass `() => this.undoLastEdit()` and type-check clean (`npx tsc --noEmit`, exit 0), read in the final files at `database-view.ts:2748-2755` and `embedded-database-renderer.ts:768-774`. What is **not** observed: no run drives a real gallery→board migration end to end — that path needs an Obsidian `App`, vault and metadata cache, so no harness here can reach it — and **the empty-stack branch this cell explicitly names is asserted by nothing**. `undoLastEdit` reports `notice.nothingToUndo` at `database-view.ts:10312` and `embedded-database-renderer.ts:3687`, both pre-existing and both raising a bare `Notice`; no test or lane row exercises either. A row whose declared verification is "the action **and** its empty-stack branch" is not Met on half of it | Unmet | - |
| AC-003 | REQ-055-3 | **Given** a phone at 390×844, **When** the confirm opens, **Then** it passes **all seven** of `044`'s `sheet-grammar` elements — **through `051`'s exported confirm primitive**, not a second one built here | `sheet-grammar` row for `confirm`, registered red before the primitive exists. Today: **0 of 7 asserted** — `sheet` is declared at `modals/confirm-modal.ts:42` (`super(app, "sheet")`, class at `:35`) and the chrome is inherited from `DbModal`, but no exported primitive and no grammar row exist. **`051` ADR-003 owns the primitive; this row closes when this phase consumes it**. **No confirmation dialog exists in any capture** — the sweep's `menus.mjs` refuses destructive actions by name (`screenshots/anytype/README.md:401`), so the primitive is **design inferred from source code, not seen** (`design-trueup.md` §3) | Unmet | - |
| AC-004 | REQ-055-3 | **Given** a confirm opened from an open sheet, **Then** the parent dims and scales back with its bounding box unchanged (|Δ| ≤ 1px) and exactly one scrim sits between them — `048`'s model | Stacked-pair lane row per parent → confirm pair, with the dim-removal negative control. Today: **the pair is unregistered** and the parent gets no treatment | Unmet | - |
| AC-005 | REQ-055-5 (= 050 REQ-009) | **Given** a view whose source is missing or deleted, **Then** the "target" empty state renders; **and Given** a source that exists with zero matching rows, **Then** the "view" empty state renders; **and Given** a board whose group relation was deleted, **Then** its own state renders and points at view settings — each with its per-layout add affordance | Lane row asserting three distinct rendered states. Negative control: collapse two flavours into one, require red. Today: **twelve reasons already ship** (`empty-state-renderer.ts:24-36`, copy at `:143-203`, selected by `getEmptyStateReason` at `:210`) — `no-database` **is** the "target" flavour and four reasons refine the "view" flavour, so `050`'s original "all conditions render the same state" is false (`design-trueup.md` REQ-009). The real red is the third state: **0 of 12 is the deleted-relation state** — `empty-group` means "this group has no rows", and a deleted group field silently re-groups (`database-view.ts:2678`, `:2890`, `:3378`). **The rejection is narrowed and now desktop-scoped** (`design-trueup.md` C4): the desktop renders no empty-state block — just a `+ New Object` row — but the iOS client renders **three** distinct shapes, and the richest carries an action button. What is adopted is the **three-tier ladder**, not a card: tier 1 one grey line (`sheet-view-filters-empty`), tier 2 a 48px illustration over one primary-colour line (`sheet-grid-cell-objecttype-empty`), tier 3 illustration + title + body + action (`sheet-cell-multiselect-empty`). Card spacing **8px title→body, 16px body→action, 16px illustration→title**. `empty.no-matches` and `empty.deleted-relation` are tier 3; `no-source` is tier 2; `empty-group` is tier 1. Copy is restated to **name the action** rather than the absence, on `"Nothing found. Create first option to start."`'s model. The iOS `Create` pill itself is **refused**: its `#555555` border on `#1F1F1F` measures **2.21:1** against WCAG 1.4.11's 3:1, and at **35.7pt** it is under the 44pt touch floor | Unmet | - |
| AC-006 | REQ-055-5 | **Given** a chart with any of its six empty reasons active, **Then** the state renders through the shared `EmptyStateRenderer` with its action preserved, and **no** `db-chart-empty` markup remains | Lane row per reason plus a markup-absence check. Today: **chart renders its own vocabulary** (`chart-renderer.ts:601-604`, reasons at `chart-aggregation.ts:64`) | Unmet | - |
| AC-007 | REQ-055-5 | **Given** the four motion tokens, **When** any of this phase's surfaces renders, **Then** every duration and easing it uses reads a token, and **Given** `prefers-reduced-motion: reduce`, **Then** no touched surface animates — the shimmer's `infinite` loop included | Stylesheet check over the phase's files plus the extended reduced-motion coverage test. Today: **42 `transition:` declarations** hand-type `120ms` outside any token, carrying **78** `120ms` occurrences between them — both figures are real and measure different units (`design-trueup.md` C6); `var(--db-transition-fast)` reaches **7** uses, not 8 (C7); the reset covers container descendants and `.db-surface` only. **`--db-motion-surface` is `200ms ease-out`, not 180ms** (ADR-005): Anytype puts menu, popup and sidebar on one `0.2s` constant (`anytype-ts/src/scss/_mixins.scss:5-7`) and our 180ms is three stray literals, not an established token. **Reduced motion has no counterpart to adopt** — `prefers-reduced-motion` occurs **0 times** in `anytype-ts/src` (C5). **Green, this leg's slice:** all five tokens declared (`--db-motion-fast` aliases `--db-transition-fast`; `--db-motion-surface: 200ms ease-out`; `--db-motion-sheet` aliases `--db-sheet-enter`; `--db-motion-emphatic: 1.1s ease-in-out infinite`; `--db-motion-scale-from: 0.98`). 38 of the 42 plain-`ease` `120ms` declarations now read `var(--db-motion-fast)`; the remaining 4 (9 occurrences) are `120ms ease-out` — a directional entrance/hover curve the alias does not carry, left as literals rather than silently changing their curve — see Out of Scope. Both `180ms` surface declarations (3 occurrences) now read `var(--db-motion-surface)`, computed 180→200ms per ADR-005. The shimmer (`db-skeleton-cell::after`) and the popover entrance's scale now read `var(--db-motion-emphatic)`/`var(--db-motion-scale-from)`. **The claim that `owned-menu-reduced-motion.test.ts`'s existing `.db-surface` mechanism already reached `.db-toast` was measured and is FALSE** (ADR-006). That test reads the reset's selector *list* as source text, where `.db-surface` is present and the toast carries the marker, so it looked covered. In a browser it was not: `.db-surface *` is specificity (0,1,0) and **ties** with `.db-toast`, the reset sits at `styles.css:934` and `.db-toast` at `:2757`, and a tie is broken by source order — so the toast kept its full **0.2s** entrance under `prefers-reduced-motion: reduce`. Every `.db-surface` rule written below line 934 escapes the same way. Repaired at the reset rather than per surface: the `.db-surface` clause now carries `!important` on `animation-duration`, `animation-iteration-count` and `transition-duration`. Measured after: `1e-05s` under reduce against `0.2s` with no preference, both read in AC-001's lane row so the escape cannot return silently. Red first is the shipped tree itself — reverting the three keywords puts the row back to `0.2s` under both preferences, run and read. Red confirmed by running `src/views/motion-tokens.test.ts` against the pre-edit stylesheet (`git show HEAD:styles.css`): 5 of 7 assertions failed; green on the edited tree: 7/7. **Still open:** the confirm sheet and empty-state surfaces this AC also names are other legs' scope, so the AC stays Unmet until they land | Unmet | - |
| AC-008 | REQ-055-5 | **Given** the files this phase changed, **When** grepped for literal transition or animation durations, **Then** zero untokenized durations remain in them (the wider `styles.css` census is recorded, not swept) | Grep per changed file. Today: every one of them hand-types durations. The residual census is corrected (`design-trueup.md` C8): beyond the `ms` strays (4×150, 3×180, 1×160, 1×100, 1×80) there are **16 more written in seconds** — 10×`0.15s`, 3×`0.2s`, 2×`0.1s`, 1×`0.3s` — which the original census missed entirely, so the real 150ms population is **14** and the real 200ms population is **3** | Unmet | - |
| AC-009 | REQ-055-9 (= 050 REQ-008, **as restated by ADR-004**) | **Given** any selection state including the fully-restricted one, **When** a row or bulk menu opens, **Then** its item count is **≥ 1** — the restricted case rendering a fallback row | Unit test on the capability predicate plus a lane row. Today: **1 file can violate it.** `row-menu.ts` **cannot** render empty — its first row (`menu.openNote`) is unconditional — so `050`'s original premise is false there and the guarantee is **asserted so it cannot regress, not built**. The only violator is `bulk-edit-field-menu.ts:31-45`, which maps `options` straight from `getBulkEditableColumns` with no floor and no fallback. **The selection caps (>1, >10) are not adopted, with a reason**: our row menu operates on a single row, so they have no referent in a surface that has no multi-select (`design-trueup.md` REQ-008). The "No available actions" wording is **code-derived** — that state appears on no capture. **Gating itself is now measured** (`design-trueup.md` §4): the same iOS `···` menu carries `Undo/Redo` and `Publish to Web` on an object and omits both on a set (`mobile/anytype-mobile-sheet-object-more-dark.png` vs `mobile/anytype-mobile-sheet-set-more-dark.png`) — the row set is computed from the target, which is the predicate this row asks for. And Anytype's never-empty answer is a **default row**, not a fallback message: the Sort panel with no user sort still renders `Last modified date`, `+ Add sort` and `Delete sort` (`menus/anytype-menu-set-sort-empty-dark.png`). **ADR-004** records the restatement | Unmet | - |
| AC-010 | REQ-055-10 (= 050 REQ-005) | **Given** two views each scrolled to a known offset, **When** the user switches away and back, **Then** each view's scroll offset is restored to within **±2px**, independently per view | Unit test on the store plus a lane row reading `scrollTop` after a round trip. Today: **0 views restore** — accurate as a symptom, **wrong as a diagnosis** (`design-trueup.md` REQ-005). The snapshot-and-restore machinery already exists in `database-viewport.ts` with four request kinds (`:37`), capturing `container.scrollTop` (`:67`) and a row anchor with an offset, restoring the raw offset (`:76`) or the anchor-relative one (`:84`); view switching simply asks for `reset-top`. **Wire the existing snapshot into per-view state; do not build a second one** — "two mechanisms for one decision" is a `design-system.md` §10 anti-pattern | Unmet | - |
| AC-011 | REQ-055-11 (= 050 REQ-014, **as restated by ADR-004**) | **Given** an embedded view with more rows than its per-view page limit, **When** it renders, **Then** it honours the limit and renders a `Load more` row past it, at **60** rows by default and **≈40px** inline row height against **48px** full-page | Lane row asserting the page limit, the `Load more` row and the row heights. Today: **0 embedded views honour a page limit and 0 render the row.** `050`'s original "the virtualization path is entered" is **false** — there is no virtualization anywhere in `src/views` (the only `virtualis*` match in `src` is `data/calendar-timeline-model.ts`, the timeline's own model), so it could not be observed red as written. The "never virtualizes" clause becomes a **guard against a future regression**, not today's red. The 60 and the 48/40 split are measured (`anytype-set-gallery-view-dark.png`'s `Page limit  60 ›`; `../050-anytype-adoption/design-trueup.md` REQ-014). The phone screen flagged by `state-feedback-vocabulary.md` has been checked: `mobile/anytype-mobile-set-grid` renders the 326-record catalogue with no `Load more` row in view, but a viewport is not a scroll to the end, so **no phone figure is taken** and the 60 stands from the gallery panel (`design-trueup.md` §4). **ADR-004** records the restatement | Unmet | - |
| AC-012 | REQ-055-1, REQ-055-5 | **Given** a released build, **When** the operator deletes a row, deletes a board's group field and opens a destructive confirm from a sheet, **Then** they read each state as debugged, refined, perfected — the §6A bar | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists. A waiver naming an ADR that is not
there fails validation: an unbacked waiver is treated as an unmet criterion rather than as a pass.

---

<!-- /ANCHOR:criteria -->

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Every row is open, which is correct for a phase opened the day its brief arrived. AC-005's three
flavours are the row the operator's componentize directive most directly names; AC-012 is the
operator's and is the only row that closes the ask behind the phase (goal D8). The `050`-quoted rows
(AC-005/009/010/011) close here *and* move `050`'s matching rows when both packets are read together.
<!-- /ANCHOR:closure -->
