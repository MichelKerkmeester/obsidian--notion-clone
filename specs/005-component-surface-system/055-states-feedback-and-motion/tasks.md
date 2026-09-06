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

- [x] T002 [B] [P0] **REQ-055-1 — the toast component.** Done 2026-09-05. `src/views/toast.ts`
      built: `showToast(doc, options)` pairs `success`/`error` with `check`/`alert-triangle`,
      carries an optional action (label, icon, callback), `role="status"`/`aria-live="polite"`,
      auto-dismisses success at 2200ms and never times out error, mounts `.db-surface
      db-toast-stack` on `doc.body`, and animates its entrance on `var(--db-motion-surface)`. The
      migration notice (`database-view.ts`, `embedded-database-renderer.ts`) is the owned site this
      leg migrates off bare `new Notice`; the row-deletion notices T003 also names are not touched
      here. Producer-registry registration (`surface-contract.ts`'s closed `SurfaceProducerId`
      list) is **closed, 2026-09-05, by operator ruling on ADR-007**: a sixth `SurfaceRole`,
      `feedback`, declares its own defaults (dismissal by explicit action or timeout, no focus,
      `role-declared` width) rather than the `menu` role's outside-pointerdown/escape dismissal,
      roving focus and 320px cap — all three of which the shipped component contradicted. The
      closed-registry test in `surface-contract.test.ts` was extended to six entries and observed
      red before the role and the `"toast"` entry landed; `verify-placement.mjs`'s
      registry-iteration lane gained the opener its own "arrives red until driven" comment
      predicted, and passed on the same run.
      Red confirmed by deleting `toast.ts` and re-running `toast.test.ts` (import failure);
      green: 9/9. **Landed at verification, 2026-09-05:** the constructed-mount lane row AC-001
      names is now in `tools/storybook/verify-placement.mjs` — seven checks over severity glyphs,
      the live-region wiring, the auto-hidden action row, the action's label and callback, the
      dismissal, the measured geometry and the reduced-motion behaviour. Each was observed red
      first, in three control runs that broke the severity pairing, the `.db-surface` mount, the
      callback, the `:empty` rule, the close-on-action and the reset weight in turn; every other
      check in the lane stayed green through all three.
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
      **All four owned sites now route through the toast, 2026-09-05, but only two of them carry an
      Undo, and the reason the other two do not is a defect this task found rather than shipped.**
      The `notice.galleryMigrated` sites (`database-view.ts:2748-2755`,
      `embedded-database-renderer.ts:768-774`) raise the toast with an Undo wired to
      `this.undoLastEdit()`, and that Undo is correct: the migration sets `pendingUndoLabel` and
      calls `scheduleConfigSave()`, so a config history entry exists for the replay to find. The
      `notice.deletedRow` sites (`database-view.ts:8354-8371`,
      `embedded-database-renderer.ts:3236-3251`) raise the toast **with no action at all**, by
      operator ruling on 2026-09-06 after landing verification derived that the Undo shipped there
      first could not work — see ADR-008. A deletion pushes nothing onto either history stack, so
      the button would have replayed an unrelated entry, and a `created` entry on top replays by
      trashing that file. Removing it is the smaller half of the repair; the larger half, making a
      deletion undoable at all, is T018. A new lane row (`tools/storybook/verify-placement.mjs`,
      "dismissing the last toast through its close button leaves no card and no live region")
      proves the toast's own stack empties on dismissal — observed red first by disconnecting the
      close button, green again restored.
      **Updated 2026-09-06, T018 landed:** the `notice.deletedRow` sites now carry an Undo again —
      T018 gave `deleteRow` a history entry to undo, closing the defect this task's own removal was
      naming. All four owned sites now carry an Undo. This task still stays `[ ]`, for the one gap
      T018 does not touch: this threshold's own `nothingToUndo` branch is the EDIT-HISTORY stack's
      empty case (`database-view.ts:10312`/`embedded-database-renderer.ts:3687`, both pre-existing,
      both bare `Notice`), not the toast's own empty stack the lane row above proves. Reaching it
      needs an Obsidian `App`, a vault and a metadata cache no harness here constructs, the same
      limit AC-002 records. The component's action and callback are lane-proven; all four call
      sites are proven by reading the final files and by `tsc`.
      **Threshold:** the Undo button appears with the notice and performs the undo — or reports
      `notice.nothingToUndo` (`src/i18n.ts:1484`) when the stack is empty, never a silent no-op.
      **Red first:** the notice renders with no button at all today.
      **Capture:** none (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`)
- [x] T018 [P0] **REQ-055-1 — a deletion history entry with redo semantics in both classes, then
      re-attach Undo.** Done 2026-09-06, closing ADR-008 (now Accepted). `deleteRow` in both
      classes now reads the file's content via `cachedRead` before `trashNote` — the order
      `removeCreatedFile` already uses — and pushes a `deleted` entry: `DeletedHistoryEntry`
      (a new member of `database-view.ts`'s `HistoryEntry` union, `file: CreatedFileSnapshot`) and
      a fourth `EmbedHistoryEntry` variant (`file: { path, content }`, `content` required since the
      embed's own `undoLastEdit` is where it is consumed). The standalone's
      `applyDeletedHistoryEntry` undoes/redoes by calling the exact pair a created entry's own
      undo/redo already calls — `restoreCreatedFile` on undo, `removeCreatedFile` on redo — so the
      "path already occupied" guard is inherited, not re-written. The embed's `undoLastEdit` grew
      an inline `"deleted"` branch carrying the equivalent guard, since that class has no
      `restoreCreatedFile` helper of its own. Both `deleteRow`s' toasts regained their Undo action.
      **ADR-008's three questions, answered:** restoring to the original path is right, and the
      inherited guard (throw, surfaced through the existing `errors.updateFailed` path) is correct
      rather than silently overwriting; a bulk delete is out of this leg's scope and, when one
      lands, should push one entry for the whole selection, not N, so one Undo cannot restore only
      the last file and leave the rest deleted; the standalone's `created` shape is the better
      model — confirmed by building both — since the embed's `moved` shape is specific to relocating
      a row between linked views and shares no structure with a deletion.
      **The embed's "redo" half of the threshold is inapplicable, not unmet:** `undoLastEdit` there
      has no redo mechanism for any entry kind (confirmed by grep, "redo" did not occur in the file
      before this landing), so a deletion-specific redo would be a new capability for every kind,
      not a deletion repair.
      **Threshold:** deleting a row, then pressing the toast's Undo, restores that row's file at its
      original path with its original content, and pressing Redo (standalone only) trashes it
      again; with the history stack otherwise empty the Undo restores that deletion and nothing
      else. The three behaviours ADR-008 names are each unreachable afterwards, by construction —
      the union has a kind now, and `applyHistoryEntry`/`undoLastEdit` dispatch to it before falling
      through to an unrelated entry.
      **Verified at landing, and one behaviour repaired.** `deletion-undo.test.ts` was rewritten
      from marker-string assertions into a behavioural suite: it drives the shipped prototype
      methods (`deleteRow`, `pushHistory`, `undoLastEdit`, `replayHistory`,
      `applyDeletedHistoryEntry`, `restoreCreatedFile`, `removeCreatedFile`) against an object
      whose prototype IS the class and a vault double that holds bytes, so what is measured is the
      restore rather than the shape of the source line. Six hostile cases: restore returns the same
      path with the same content; a path re-occupied since the deletion refuses rather than
      overwrites and leaves the entry on the stack; an edit landing on top of the deletion undoes
      in stack order and trashes nothing unrelated; Redo re-trashes exactly the restored file and a
      further Undo restores it again; a multi-row delete records nothing and offers no Undo, which
      is ADR-008's own answer rather than a gap; and the Undo action exists only alongside the
      pushed entry. **The seventh case failed and was fixed here:** the toast outlives its entry,
      so a row created inside the card's 2200ms life becomes the top of the stack and a bare
      `undoLastEdit()` trashed that new file — the same one-press-two-deletions shape ADR-008 was
      written about, narrowed to the toast's own lifetime. Both classes now replay the deletion by
      entry identity or decline with `notice.undoSuperseded` (new, three locales), which says why
      rather than the inaccurate `notice.nothingToUndo`.
      **Red first:** the two identity-guard cases were watched failing on the pre-repair tree
      (`Tasks/created.md` gone after the press). As a negative control for the snapshot itself,
      dropping `content` from the pushed entry turns 5 of the 11 cases red, and restoring it turns
      them green again.
      **Green:** `npx tsc --noEmit` 0; `npx vitest run` 1404/1404 including
      `deletion-undo.test.ts` (11/11) on the rebased tree; `npm run gate` 26 green.
      **Capture:** none (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`,
      `src/i18n.ts`, `src/views/deletion-undo.test.ts`)

- [x] T004 [P1] **REQ-055-1 — unify the two undo shapes.** Done 2026-09-06. `showOperationResult`
      now renders through `showToast` at the rail's own fixed placement: `ToastOptions` gained a
      `container` field (a caller-positioned single-slot host instead of the shared body stack),
      and `styles.css` gained one `.db-toast.is-inline` rule laying the card out in normal flow at
      that host's position rather than the collapsed-stack's absolute one. The rail's own
      `db-operation-result-*` CSS (border, padding, background, its `db-operation-rail-in`
      keyframe, the `is-error` variant) retired; the rail keeps only
      `position: fixed; right; bottom; z-index` plus `db-surface` so the reduced-motion reset
      (ADR-006) reaches the card mounted inside it.
      **The selection bar's button is unchanged, named rather than forced** (ADR-001's landing
      note): `db-selection-undo` carries no CSS of its own (it borrows `.db-selection-action`,
      shared with four sibling buttons in the same bar), has no timer, and already calls the same
      `undoLastEdit()` every toast Undo calls — there was one competing shape here, the rail's, and
      it is the one that changed. Re-rendering the bar's button as a 384px card would violate the
      threshold's own "as before in position" half for no unification gained.
      **Threshold:** one component, one timer contract, one reduced-motion story; both placements
      behave as before in position — **timing changes on purpose for the error case**: the rail
      used to auto-dismiss error at the same 2200ms as success, and the toast's own contract (error
      never times out) won rather than being special-cased away, since "one timer contract" is what
      the threshold actually asks for where the two clauses conflict.
      **Red first:** two independent implementations existed with separate CSS
      (`styles.css:2699-2744` before this landing vs the bar's own `.db-selection-action` rules) —
      confirmed by diffing this leg's edit against `git show HEAD:styles.css`, which still carries
      the retired rules verbatim.
      **Verified at landing, with one measurement correction.** The rail's placement rule is
      untouched (`position: fixed; right: 16px; bottom: max(16px, env(safe-area-inset-bottom))`),
      so the card still appears at the corner the pill appeared at. No capture renders the rail, so
      that half is read from the rule rather than from a picture, and is stated as such. What the
      card's own width does at that placement is a different question and the first answer was
      wrong: `.db-toast.is-inline` took the stack's flat 384px, which at the host's 16px inset
      needs 400px of viewport and so hung 10px off a phone's left edge. Clamped to
      `min(384px, calc(100vw - 32px))`, unchanged at any desktop width.
      **Green:** `npx tsc --noEmit` 0; `npx vitest run` 1404/1404, including two new
      `toast.test.ts` assertions for the `container` placement; `npm run gate` 26 green.
      **Capture:** none — no capture shows the rail or the bar's button
      (`src/views/database-view.ts`, `src/views/toast.ts`, `styles.css`)

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
- [x] T006 [P0] **REQ-055-6 — absorb chart's private vocabulary.** Done 2026-09-06.
      `renderEmptyState` now calls `EmptyStateRenderer.renderCard`, mapping each of chart's six
      reasons onto the nearest shared `EmptyStateReason` for its default title only (`no-columns`
      for the two "add/choose a field" reasons, `filter-empty` for `noRecords`, `limit-empty` for
      `allGroupsHidden`, `no-matching-data` for `invalidAxisRange`) while always supplying chart's
      own message via the existing `getEmptyMessage`; the action builder returns `EmptyStateAction[]`
      instead of hand-building buttons. `db-chart-empty-icon`/`-text`/`-action` and their
      `:hover`/`:focus-visible` rules retired from `styles.css`, along with the decorative
      border/padding/color the shared `.db-chart-empty, .db-chart-number` rule no longer needs now
      that the inner card supplies its own box.
      **Amended, named rather than silently narrowed:** the outer `.db-chart-empty` wrapper class
      stays — `rendered-view-roots.ts`, `summary-renderer.ts`'s `placeAfterChart` anchor and
      `embedded-database-renderer.ts`'s stale-view selector all key off it, none of them this task's
      to change, and the same "structural root + shared inner card" split already exists for the
      board (`.db-board` + `db-board-empty-slot` on the card). "Zero `db-chart-empty` markup" is
      read as the private icon/text/action vocabulary retiring, not the structural root.
      **Threshold:** chart's six reasons render through the shared component with their actions
      preserved, and zero `db-chart-empty` markup remains.
      **Red first:** chart was the only renderer outside `EmptyStateRenderer` — confirmed absent
      from `grep -n "emptyStateRenderer.renderCard" src/views/chart-renderer.ts` before this landing.
      **Verified at landing, with one regression repaired.** All eight recaptures were opened, in
      both themes on both device profiles, and each shows the shared card — icon tile, title, the
      chart's own message, the recovery button — where the dashed centred box used to be. The phone
      pair showed the card running past the chart body's right edge, and the view census named it:
      two new `escaping` rows, `db-empty.db-empty-card` inside `db-chart-empty`, 34px at both 320
      and 402, taking the ratchets from 656/346 to 658/348. The cause is the shared card, not
      chart: it declares `width: min(100%, 620px)` with its 20px padding and 1px border outside
      that width, so it overflows any host narrower than 620 and the chart body is the first narrow
      host it has had. Corrected with `box-sizing: border-box` scoped to `.db-chart-empty
      .db-empty-card` — the component's own box is a real defect but every other host is wide
      enough that changing it there would move their captures for a problem they do not have, so it
      is recorded for its owner rather than fixed under this task. Census back to main's 656/346
      exactly, and the eight captures re-taken and re-read after the fix.
      **Green:** `npx tsc --noEmit` 0; `npx vitest run` 1404/1404; `npm run gate` 26 green; the
      fixture and the real render opened side by side (both desktop-light) show the same shared
      card shape with the chart's own copy intact.
      **Capture:** `chrome-chart-empty` (fixture, rewritten to mirror the new markup) and
      `constructed-chart-empty` (the real renderer) both recaptured in the same change and both PNGs
      read (`src/views/chart-renderer.ts`, `styles.css`, `tools/screenshots/scenarios/chrome.mjs`)

### L3 — confirm primitive

- [x] T007 [P0] **REQ-055-3 — the confirm sheet carries `044`'s grammar.** Done 2026-09-06.
      `DbModal`'s own shell (`createSurfaceShell`) already calls `createSheetHeader` for a
      `sheet`-presented modal on a touch device, but only after `super.onOpen()` runs — so
      `ConfirmModal.onOpen` now builds its title, message and actions **before** calling
      `super.onOpen()`, so the shell's title scrape finds the real `<h3>` on its first pass rather
      than a generic fallback corrected a microtask later. The message also gained `db-panel-row`,
      resolving to a real padded row only where `applySheetChrome` has marked the modal root
      `.note-database-container` — the phone presentation the grammar row measures, inert
      everywhere else. The `confirmWithModal` signature is unchanged.
      **Threshold:** all seven grammar elements pass on the registered `sheet-grammar` row.
      **Red first:** 0 of 7 — `createSheetHeader` did not occur in `confirm-modal.ts` at all before
      this landing, confirmed against `git show HEAD:src/views/modals/confirm-modal.ts`.
      **Green:** a `confirm` row registered in `tools/live/sheet-grammar.mjs`'s `REGISTERED_SURFACES`
      — the real component cannot mount in this harness's browser bundle (it extends `Modal`, which
      `obsidian-stub.mjs` throws on rather than fakes), so the row is a hand-built mirror of
      `confirm-modal.ts`'s markup, the same stand-in precedent `openHostModalChild` already sets for
      a modal child, wired through the real `attachSheetChromeToModal`/`placeSheet`/`keepSheetPlaced`
      so every column but the markup mirror measures production code. `node tools/live/sheet-grammar.mjs`,
      exit 0: **8 of 8** columns pass (all seven canonical elements plus the dropdown column), close
      target 44×44, nothing overflows the surface's right edge.
      **Capture:** none needed — the grammar is measured by the lane, not by a competitor screen
      (`src/views/modals/confirm-modal.ts`, `tools/live/sheet-grammar.mjs`)
- [x] T008 [P0] **REQ-055-4 — register the confirm's stacked pairs.** Done 2026-09-06, and mostly
      already true. Measured directly (`node tools/live/sheet-grammar.mjs`) before any change here:
      `048`'s own prior landing had already registered two confirm pairs in
      `REGISTERED_STACKED_PAIRS` — "confirm over a sheet" (parent `filter-panel`) and "import
      confirm dropdown chain" — and both were **already green**, all 14 stacking/child-grammar
      checks passing on Chrome and WebKit alike (`048` M-4's gap was the standalone grammar row
      T007 closes, not this one). This task's own row in `tasks.md` restated the premise from the
      tree found, per ADR-002's landing note, rather than quoting the stale draft forward.
      **Threshold:** a confirm opened from a sheet dims and scales back its parent with
      |Δ| ≤ 1px and one scrim between them — `048`'s model, consumed unchanged.
      **Red first, restated:** the premise "the pair is unregistered" was false against this tree;
      both rows existed and passed before this leg touched anything, confirmed by running the lane
      first. No code change was needed to close this task — the row-per-parent registry the
      threshold asks for already had its rows.
      **Green:** `node tools/live/sheet-grammar.mjs`, exit 0, "confirm over a sheet" 14/14 and
      "import confirm dropdown chain" 14/14, both engines.
      **Capture:** none (`tools/live/sheet-grammar.mjs`, `src/views/modals/confirm-modal.ts`)

### L4 — motion tokens

- [x] T009 [B] [P0] **REQ-055-7 — the motion tokens.** Done 2026-09-05. `--db-motion-fast`
      (aliases `--db-transition-fast`), `--db-motion-surface` (`200ms ease-out`), `--db-motion-sheet`
      (aliases `--db-sheet-enter`), `--db-motion-emphatic` (`1.1s ease-in-out infinite`) and
      `--db-motion-scale-from` (`0.98`) declared beside `--db-transition-fast`. No dark-theme
      override needed — none of the five values differ by theme, unlike the colour-mix tokens that
      block exists for. The reduced-motion reset needs no new selector: the toast mounts
      `.db-surface`, which the existing `.db-surface`/`.db-surface *` rule already zeroes; the
      shimmer's `infinite` loop now reads `var(--db-motion-emphatic)` in the same change. Went wider
      than this task's own `styles.css:19-125` scope, deliberately: 38 of 42 plain-`ease` `120ms`
      declarations and both `180ms` declarations across the whole stylesheet now read the tokens
      (not only the `--db-*` block itself), because the dispatch that carried this leg named the
      full census as its target. The 4 `120ms ease-out` declarations and the wider seconds-notation
      census are untouched — see checklist.md C7. Red/green in `src/views/motion-tokens.test.ts`.
      **Corrected at verification, 2026-09-05 (ADR-006).** This row claimed the reduced-motion
      reset needed no new selector because the toast carries `.db-surface`. Read as source that is
      true; measured in a browser it was false. `.db-surface *` is (0,1,0) and **ties** with
      `.db-toast`, and the reset sits at `styles.css:934` while `.db-toast` sits at `:2757`, so the
      later rule won the tie and the toast kept its full **0.2s** entrance under
      `prefers-reduced-motion: reduce`. The clause now carries `!important` on
      `animation-duration`, `animation-iteration-count` and `transition-duration`; measured after,
      the entrance computes `1e-05s` under reduce against `0.2s` with no preference, and a lane row
      reads both so the escape cannot return quietly.
      **Threshold:** the tokens resolve on all nine token selectors, and
      `owned-menu-reduced-motion.test.ts`'s coverage mechanism holds for the toast and confirm.
      **Red first:** the tokens do not exist; **42 `transition:` declarations** hand-type `120ms`
      outside any token, carrying 78 occurrences between them, and `var(--db-transition-fast)`
      reaches 7 uses. `--db-motion-surface` is **200ms**, not 180ms (ADR-005).
      **Capture:** none — stylesheet, measured by lane, not capture
      (`styles.css`)
- [x] T010 [P1] **REQ-055-8 — migrate the legs' own durations.** The files L1-L3 touched read
      tokens; no new literal duration lands in this phase's files.
      **Restraint amended by ADR-006, 2026-09-05.** "The wider census is recorded, not swept" was
      written before T001 measured the full 42-declaration census as the target, and L4 swept 38 of
      those 42 across the whole stylesheet rather than only this phase's own files. The sweep
      stands and is recorded here rather than absorbed silently. What T010 still owns is unchanged:
      the `ms` strays and the 16 seconds-notation durations below stay recorded and unswept, and so
      do the 4 `120ms ease-out` declarations, whose directional curve `--db-motion-fast` does not
      carry.
      **Threshold:** zero untokenized durations in the files this phase changed; the residual census
      below is recorded, not swept. **Corrected count:** the `ms` strays (4x150, 3x180, 1x160, 1x100, 1x80)
      plus **16 written in seconds** (10x`0.15s`, 3x`0.2s`, 2x`0.1s`, 1x`0.3s`) that
      `state-feedback-vocabulary.md` §4's census omits — see `design-trueup.md` C8.
      **Red first:** every touched file hand-types durations today.
      **Done 2026-09-06, T004/T006/T007's own edits:** T009 (L4) already swept 38 of 42 declarations
      across the whole stylesheet, so the `styles.css` regions T004 (the operation-result rail) and
      T006 (chart's empty state) touched carried none left to migrate — confirmed by
      `git diff styles.css | grep -E "^\+" | grep -iE "[0-9]+m?s\b"` returning nothing for this
      leg's own edit. T004 additionally **retired** one untokenized declaration outright rather than
      migrating it: `db-operation-rail-in`'s `160ms ease-out` keyframe, deleted along with the whole
      rule it timed once the rail became a placement of the shared `.db-toast` (which already reads
      `var(--db-motion-surface)`). Net effect on the census: -1 declaration, 0 added. The `ms`
      strays and the 16 seconds-notation durations this row already named stay recorded and
      unswept, unchanged by this leg.
      **Capture:** none (`styles.css`, the L1/L2/L3 files)

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
