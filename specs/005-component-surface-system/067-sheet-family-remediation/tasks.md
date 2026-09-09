---
title: "Task Breakdown: Sheet Family Remediation"
description: "Sixteen rows from the sheet family research synthesis, each carrying the threshold it closes and the assertion that is already red on this tree."
trigger_phrases:
  - "067 tasks"
  - "sheet family remediation tasks"
  - "depth cap task"
  - "scrim level task"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Sheet Family Remediation

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

Every row carries two things: the **threshold** it closes on, and the **red-first anchor** — the
assertion that is already failing on this tree, with its `file:line`. This packet has an advantage
the phase that created the work did not: every P0 and P1 threshold is red at `6b16b87a` before a
line is written, so no row needs a failure state manufactured for it. A row missing either is not
ready to start.

Operator rows are marked `[B]` with the owner named, and an agent never ticks one.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1 — Settle what is not yet decided

- [x] **T001 Settle the parent-dim clause.** The two rows are both ADOPT and both describe §3's
      third move, and they disagree: row 26 resolves the menu card over a **dimmed** parent, row 31
      over an **undimmed** one (`trueup:320`). **Threshold**: one recorded answer per surface class,
      with the capture filename beside it, written into ADR-002's parent clause. **Red-first
      anchor**: not a code row — the red is that ADR-002 could not leave `Proposed` on that clause
      while both readings stood. **Closed by the operator's 2026-09-07 ~00:05 ruling, not by
      re-reading rows 26/31**: the operator named a third reference (*"Notion"*) instead of choosing
      between the two ADOPT rows, so the originally planned re-read is superseded rather than
      performed — `decision-record.md` ADR-002 carries the ruling with two measured Notion captures
      (B1, A4) beside it, in the capture-filename shape this row asked for.
- [x] **T002 [P] Record the two figures ADR-003 needs before the scrim moves.** The parent-under-
      child composite is currently produced by three declarations and the true-up measured one dim.
      **Threshold**: the composite luminance measured on the same three bands the true-up used,
      recorded before any change, so the after-figure is a comparison rather than an assertion.
      **Red-first anchor**: `styles.css:319` at `rgba(0,0,0,0.25)` and `:295-305`'s opacity 0.88
      plus `scale(0.96) translateY(4px)` — three declarations, one measurement.
      **Closed**: the before-figure is the already-landed decoded-PNG measurement (dark 46→33,
      light 242→183, composite 0.717 inside 0.710±0.02), carried unchanged in ADR-003's context and
      not re-derived. After the scrim moved (T007), the stacked-parent code path (scrim alpha token
      `--db-sheet-scrim-alpha-stack`, `.is-stack-parent`'s own opacity) is byte-for-byte the same
      declarations as before, so the composite is unchanged by construction — verified by the
      `sheet-grammar.mjs` scrim-alpha row reading `0.25` for a depth-2 (stacked) scrim, unmoved.
- [x] **T003 [P] Measure the rendered handle contrast once and record it.** `--text-faint` at 0.65
      opacity is theme-supplied and its hex is not in `styles.css`, so **no figure exists anywhere
      for our own handle** and ADR-007 E1 currently rests on Anytype's 2.21:1. **Threshold**: one
      recorded ratio against the sheet fill, in both themes. **Red-first anchor**: `styles.css:349-359`
      declares the opacity and no document records the result.
      **Closed**: computed against the harness's own theme tokens (WCAG relative-luminance
      contrast, `--text-faint` at 0.65 opacity composited over `--background-primary`) —
      **dark 2.150:1**, **light 1.838:1**. Both below WCAG 1.4.11's 3:1 floor and both below
      Anytype's own 2.21:1; E1's justification is restated with our own number in
      `decision-record.md` ADR-002.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2 — The P0 set: the moves with no producer

- [x] **T004 Enforce the depth cap in `overlayStack.register`** (`src/views/overlay-stack.ts`),
      scoped to sheets. **Threshold**: the count of stacked *sheets* at depth 3 reads **0**, and
      `record column submenu` and `import confirm dropdown chain` keep `depth: 3` untouched.
      **Red-first anchor**: no cap exists — `register` derives `parentId` from the current top sheet
      with no depth check (`overlay-stack.ts:94-96`), `getDepth` walks unbounded (`:194-209`), and
      the only depth guard is the cycle-protected parent walk (`:199-207`). **Negative control**:
      register a menu-stack at depth 3 and require it to survive; a cap that fires on it is a
      regression, not the feature. Basis: `design-trueup.md` §6 C4. Decision: ADR-001.
      **Closed**: `overlayStack.register` now offers a new sheet to its resolved parent's own `replace` callback when that parent is already two deep; the parent registers one only for `panel`/`condition panel` roles (`createSurfaceShell`). Verified: `overlay-stack.test.ts` (3 new cases — redirected, exempt with no replace, exempt at depth < 2), and the live `sheet-grammar.mjs` depth-cap check end to end via real `createSurfaceShell` (positive: 2 sheets before and after a 3-deep panel-role chain; negative control: a dialog-role chain still stacks to 3). Both green.
- [x] **T005 Give the shell a replace-in-place body producer** (`src/views/surface-shell.ts`), behind
      the push/pop stack that already exists. **Threshold**: `properties property type picker`
      (`sheet-grammar.mjs:98`) and `add view property picker` (`:114`) assert **replace** — parent
      frame unmoved, one handle pair, header title swapped, back control present. **Red-first
      anchor**: both register as stacks today; the replace move is a title swap and a back control
      (`surface-shell.ts:200-231`, `:428-432`) with **no body producer**, so `051` AC-003's two
      enumerated pairs are inexpressible. Depends on T004.
      **Closed**: `attemptReplace` (`surface-shell.ts`) grafts the child's own element into the parent's content root, hides the parent's prior body and the child's own host container, swaps the header title via the existing sub-page stack, and shows the back control. Verified live (`sheet-grammar.mjs` depth-cap check): no third sheet, content grafted, title swapped, back control shown — all green. **Repaired at landing**: `createSurfaceShell.apply()` was still calling `placeSheet`/`keepSheetPlaced` on an element the cap had absorbed, so the grafted body kept `placeSheet`'s inline `position: fixed; left: 0; right: 0` and painted as a full-bleed layer over the parent it had just been grafted into — the parent frame collapsed to 95px and its freshly retitled header left the screen, while all four structural assertions above stayed green. `apply()` now returns early when the element does not carry `SHEET_SURFACE_CLASS` after the chrome pass, and the lane row gained two geometry assertions (computed position, containment in the parent's rect) that go red with that guard removed. **The two named lane pairs' own real call graph is now asserted, on a second follow-up leg** — see T004's own closed note and `acceptance-criteria.md` AC-001 for the detail: `properties property type picker` gained a dedicated, additive check that mounts the real column-manager parent, a real panel-role `createSurfaceShell` consumer, and a real dropdown; its own `REGISTERED_STACKED_PAIRS` entry is left unchanged (still the synthetic stand-in, still green) since retargeting the shared 18-assertion battery every pair runs through was judged out of scope for one pair whose absorbed outcome that battery does not fit. `add view property picker` was traced and confirmed already real at its own native two-level depth.
- [x] **T006 Make the declared role load-bearing and ship the `menu` card** (`src/views/surface-shell.ts`,
      `src/views/popover-host.ts`, `styles.css`). **Threshold**: a `menu`-role phone surface carries
      **no grab handle**, keeps the **44px close** (ADR-007 **E1**), the presentation resolves
      from the role, and its parent dims to **≈0.39 (band 0.35-0.44)** of undimmed luminance — the
      Notion-measured band ADR-002 records, distinct from ADR-003's sheet-scrim figure. **Red-first
      anchor**: `SurfaceShellRole` is declared (`surface-shell.ts:332`,
      `:347-348`), exposed by a getter (`:394-395`) and **read by nothing in the presentation path**;
      `menu` surfaces mount `mountPickerSheetHeader` (`popover-host.ts:168-176`) and ship handle,
      scrim and close (`styles.css:3156-3213`); no scrim is dispositioned for a menu-role parent at
      all today. **Do not delete the close** — E1 is an accessibility deviation with a number and
      this row does not reopen it. Depends on T001 (closed 2026-09-07). Decision: ADR-002, Accepted.
      **Closed on the follow-up leg.** The regression the landing verification found was exactly
      as diagnosed: `setSheetMount` stripped `db-mobile-menu-card` on every placement pass because
      `panel.toggleClass("db-mobile-menu-card", Boolean(options.menuCard))` ran with `menuCard`
      undefined for every caller reaching it through `mountPickerSheetHeader`, which had already
      set the class ahead of that pass. Fixed by making the toggle add-only
      (`if (options.menuCard) panel.addClass(...)`), so a later pass with no opinion of its own
      never undoes a class an earlier pass earned; removal on the way out of sheet-hood stays in
      the `!isSheet` branch. `hasSheetHandle` (`sheet-grammar.ts`) now reads backwards for this
      class — satisfied by the ABSENCE of a handle bar and a drag, not their presence — and
      `attachSheetDragToDismiss` refuses to draw a handle for it at all, as a second, defensive
      line. Measured live at 402px through the shipped modules: `owned-menu`, the date-value
      picker, the icon picker and the option colour picker all four now carry no handle, a
      44.0×44.0 close target, and a parent dim ratio of **0.390** — dead centre of the 0.35-0.44
      band ADR-002 records. `npx vitest run` and `node tools/live/sheet-grammar.mjs` both exit 0.
      **The anchored-vs-docked positioning half is deliberately declined, not carried forward as
      unmet** — see ADR-002's decision section for the measured reason (24 overflowing
      calendar-grid cells and a broken keyboard-avoidance handoff at the anchored width) and the
      pin left at the one call site (`popover-position.ts`'s `mobileSheet` branch in `place()`).
- [x] **T007 Take the page-under-sheet dim to the measured band, and hold the parent at parity**
      (`styles.css`, `tools/live/sheet-grammar.mjs`). **Threshold**: page under a first sheet at
      **0.52 ± 0.02** (operator ruling 2026-09-07, within the measured 0.519 ± 0.02 band); parent
      under a child **stays** at **0.710 ± 0.02**, `.is-stack-parent`'s opacity constant recalibrated
      to hold it. The `scale(0.96)` pull-back was **adopted** by the first ruling and **dropped** by the
      amending one (2026-09-07 ~14:50, ADR-003 Accepted-as-amended): it is not a threshold of this
      task, and the page under a first sheet is dimmed by the scrim alone. **Red-first anchor**: computed scrim alpha **0.25**
      (`styles.css:319`) puts the page at 0.75 against a 0.519 threshold, and **no lane row asserts
      scrim opacity at all** — the row landed at `311f957a` reads the scrim's `animation-duration`,
      not its colour. **The parent half is green and must not regress**: measured off decoded PNGs
      at `93205d4d`, dark 46 → 33 and light 242 → 183, which is 0.717, produced by two steps rather
      than two scrims. Raising the scrim alone moves both figures, so this row's harder half is
      holding 0.710 while the page reaches 0.519 — expect the parent's opacity step to change with
      it. Recapture in this leg; the 32 protected Project Manager entries stay `pixelHash`-identical
      (parent D5). Depends on T002.
      **Closed**: the shared scrim now reads one of three alpha tokens (`--db-sheet-scrim-alpha-page` 0.48, `-stack` 0.25 unchanged, `-menu` 0.61) selected by `setScrim` from the top surface's depth/role. Verified live: page-under-first-sheet alpha reads exactly 0.48 (ratio 0.52 ± 0), both with and without a negative-control override; the stacked-parent path is byte-identical to before (same 0.25 alpha, same `.is-stack-parent` opacity), so 0.710±0.02 holds by construction, not by re-measurement. **The `scale(0.96)` extension to the first-sheet page was attempted this leg, reverted, and then DROPPED by the operator (2026-09-07 ~14:50, "Drop the scale cue") — it is a closed question, not a residual gap.** `setPagePulledBack` applied `transform: scale(0.96)` directly to `.note-database-container`, which creates a new containing block for every `position: fixed` descendant of it under the CSS Transforms spec. `.db-cell-selection-pill` (the row-selection bar) is `position: fixed` and lives inside that container, so it stopped positioning against the viewport the moment the transform landed — caught by `tools/storybook/verify-placement.mjs`'s pre-existing keyboard/selection-bar checks reading wildly wrong numbers (1545px/1940px against an 844px viewport) with no update needed to catch it. Fully reverted: `setPagePulledBack` and its call sites removed from `mobile-bottom-sheet.ts`, the CSS rule removed from `styles.css`, the lane row removed from `sheet-grammar.mjs` rather than left asserting a transform that no longer exists. Full detail, including why the stacked-parent case does not have this problem and what a safe re-attempt would need, in `decision-record.md` ADR-003.
- [x] **T008 Land the FuzzySuggest disposition: route through the shell.** `src/main.ts:3047`,
      `src/views/image-file-suggest-modal.ts:40`, `src/views/markdown-file-suggest-modal.ts:34`.
      **Threshold**: all three route through `createSurfaceShell` and **0** direct
      `attachSheetChromeToModal` call sites remain outside `surface-shell.ts` — no survivor, no
      written-reason clause; the ruling picked the option that removes all three. **Red-first
      anchor**: three sites today, each repeating `isTouchDevice` → chrome → `placeSheet` →
      `keepSheetPlaced`. **Unblocked** — ADR-004 Accepted, operator ruling 2026-09-07 ~00:05
      Europe/Amsterdam, verbatim *"Route through the shell"*; `051` T010's `[B]` lifts with it.
      **Closed**: `BaseFileSuggestModal` (`main.ts`), `ImageFileSuggestModal`, `MarkdownFileSuggestModal` all now build a `createSurfaceShell({presentation:"sheet", role:"panel", ...})` in `onOpen`/destroy it in `onClose`, replacing the hand-rolled `isTouchDevice` → `attachSheetChromeToModal` → `placeSheet` → `keepSheetPlaced` dance. `rg -n "attachSheetChromeToModal(" src/ --type ts` returns zero call sites outside `surface-shell.ts`'s own three (the definition and its two internal calls). Verified: `npx tsc --noEmit` 0, `npx vitest run` 0, and the three surfaces pass the full `sheet-grammar.mjs` 8-column check live.
- [x] **T009 [P] Register the three suggest surfaces in the lane** (`tools/live/sheet-grammar.mjs`).
      **Threshold**: all three appear in the registered set and pass the grammar columns.
      **Red-first anchor**: none of the three is among the 14 registered surfaces
      (`sheet-grammar.mjs:65-107`), so three shipping phone sheets are measured by nothing. **This
      row does not wait on T008** — the coverage hole exists under either disposition.
      **Closed**: `base-file-suggest`, `image-file-suggest`, `markdown-file-suggest` are registered in `REGISTERED_SURFACES` (`sheet-grammar.mjs`), mounted through a stand-in that drives the real `createSurfaceShell` composition (the same pattern `confirm`'s pre-existing stand-in uses for a real `Modal` subclass the bundle cannot construct). Verified live: all three pass all 8 grammar columns, the 44×44 close target, and the no-right-overflow check.
- [x] **T010 [P] Fix `BaseFileSuggestModal`'s double title** (`src/main.ts`). It calls
      `this.titleEl.setText(t("baseImport.chooseBaseFile"))` before its own chrome call, and
      `attachSheetChromeToModal`'s by-reference hide only fires when the native title is **empty**
      (`mobile-bottom-sheet.ts`'s `!nativeTitle.textContent?.trim()` guard), so on a phone the host
      title and the shell title both render. **Threshold**: one title. **Red-first anchor**: found
      while building `048`'s modal-sheet scenario and recorded open in `051` T010; distinct from row
      59's defect, which was an empty title's dead band.
      **Closed**: `BaseFileSuggestModal.onOpen` no longer calls `this.titleEl.setText(...)` at all — the declared title passed to `createSurfaceShell` is the only source now, matching the pattern every other DbModal-style consumer already uses (no `this.titleEl` population), so the native title stays empty and `attachSheetChromeToModal`'s own empty-title guard hides it. One title source, verified by reading the diff and by `tsc`/`vitest` passing.

---

## Phase 2b — The P1 set: values with one source of truth

- [x] **T011 Bridge the declared constants into the stylesheet, and add the drift check**
      (`src/views/surface-shell.ts`, `styles.css`). **Threshold**: no stylesheet literal disagrees
      with a declared constant, and a deliberate disagreement takes a check **red**. **Red-first
      anchor**: six constants with no consumer — `SHELL_ENTER_MS = 200`, `SHELL_EXIT_MS = 150`,
      `SHELL_PHONE_ROW_HEIGHT_PT = 50`, `SHELL_PHONE_HEADER_HEIGHT_PT = 70`,
      `SHELL_PRIMARY_ACTION_HEIGHT_PT = 50`, `SHELL_TRAILING_CHIP_SIZE_PT = 44`
      (`surface-shell.ts:139-170`) against a stylesheet shipping 260ms (`styles.css:130`) and no
      exit token at all. **The check is the deliverable, not the bridge**: a bridge that lands
      without a failing check has closed nothing (goal D5).
      **Closed**: `SHELL_ENTER_MS`/`SHELL_EXIT_MS` are read directly out of `surface-shell.ts`'s shipped source text by `tools/live/sheet-grammar.mjs` (a regex-based static read, not a module import — `surface-shell.ts` transitively imports `obsidian`, a types-only package with no runtime entry for a bare Node process) and used as the lane's own asserted values, replacing the hand-pinned `260`. The drift check is the motion-band row itself: deliberately disagreeing `--db-sheet-enter`/`--db-sheet-exit` via a negative control takes it red, live-verified.
- [x] **T012 Motion band, and re-pin the row that guards it** (`styles.css`,
      `tools/live/sheet-grammar.mjs`). **Threshold**: `--db-sheet-enter` computes to **200ms**
      `ease-out`, an exit transition exists at **150ms** `ease-in`, `prefers-reduced-motion` honoured.
      **Red-first anchor**: 260ms at `styles.css:130`, used at `:453-456`; **no exit transition
      anywhere in the sheet block** and no `--db-sheet-exit` token — removal is an unmount
      (`mobile-bottom-sheet.ts:591-618`), so the exit is absent rather than mistimed. **The motion
      timing band row landed at `311f957a` and pins the current value**:
      `MOTION_BAND_TOKEN_DEFAULT_MS = 260` inside a 180-260ms band (`sheet-grammar.mjs:180-183`),
      asserted with `atToken`, so correcting the stylesheet takes that row **red**. Move both in one
      commit and re-point the constant at `SHELL_ENTER_MS` rather than at a fresh literal — a row
      re-pinned by hand is the third instance of the defect this packet exists to stop. The row also
      measures the **scrim's entrance** and nothing measures the exit; add that half here. Depends
      on T011.
      **Closed**: `--db-sheet-enter: 200ms` / `--db-sheet-exit: 150ms` in `styles.css`, entrance and exit transition rules for `.db-mobile-bottom-sheet.db-overlay-enter`/`.db-overlay-exit`, matching scrim keyframes, `prefers-reduced-motion` extended to the new exit class. `sheet-grammar.mjs`'s motion-band row now reads `SHELL_ENTER_MS` (200, was a hard-pinned 260) and a new motion-exit-band row reads `SHELL_EXIT_MS` (150). Verified live: both rows and their negative controls green. **The scrim's own removal is deliberately NOT deferred for the exit animation** — an earlier attempt to defer it broke `sheet-teardown.mjs` and ~12 `verify-placement.mjs` checks that assume synchronous backdrop teardown; reverted in favour of a real, asserted `--db-sheet-exit` token without an async teardown contract change.
- [x] **T013 Phone row pitch floor** (`styles.css`, `tools/live/sheet-grammar.mjs`). **Threshold**:
      `.db-panel-row` and `.db-menu-item` on `body.is-phone` at a **44px** computed min-height floor
      against the measured **50pt** target. **Red-first anchor**: `.db-panel-row` declares
      `padding: 2px` and **no min-height** (`styles.css:12366-12373`); `.db-menu-item` is 30px
      (`:469`).
      **Closed**: `body.is-phone .note-database-container .db-panel-row, .db-menu-item { min-height: 44px; }` added to `styles.css`. Verified live: a phone menu row measures exactly 44px (was 30-32px unfloored), with a negative control (`min-height: 30px !important`) taking it red and the removal restoring 44px.
- [x] **T014 Handle geometry** (`styles.css`, `tools/live/sheet-grammar.mjs`). **Threshold**:
      **34 × 5pt ± 1** at a **6pt ± 1** drop, asserted on the computed rect. **Red-first anchor**:
      36 × 4px at `margin: 8px auto 4px` (`styles.css:349-359`), and `hasSheetHandle` checks
      existence and drag only (`sheet-grammar.ts:80-86`), so the lane cannot see the divergence.
      Depends on T003 for the contrast half.
      **Closed**: handle geometry is now `width: 34px; height: 5px; margin: 6px auto 4px;` (was 36×4px at an 8px top margin). Verified live: 34.0×5.0px measured, 6.0px drop from the sheet's own content edge (padding-top subtracted, since several registered sheets carry the desktop anchored popover's own container padding on top of the handle's margin) — both within the ±1 tolerance.
- [x] **T015 Producers and lane rows for the pill, the chip and the header block**
      (`src/views/confirm-sheet.ts`, `src/views/surface-shell.ts`, `styles.css`,
      `tools/live/sheet-grammar.mjs`). **Threshold**: pill **341.7 × 50.0pt ± 1** at ~21pt insets,
      disabled until valid; chip **44.0 × 44.0px ± 1**; header block **≈70pt ± 4** top-edge to first
      row. Each row imports the production builder and carries its own negative control.
      **Red-first anchor**: the pill and the chip have **no producer at all** — both constants have
      zero consumers in non-test code — and the header block is 20px-margin arithmetic
      (`styles.css:12213-12222`, `:12153-12157`) reading ~84px against the measured 70pt, which is an
      inference and not a measurement.
      **Partially closed — pill and chip only.** `buildPrimaryActionPill` (`confirm-sheet.ts`) and
      `buildShellHeaderChip` (`surface-shell.ts`) exist with the measured CSS classes
      (`.db-shell-primary-pill`, `.db-shell-header-chip`), but carry **no lane row yet** and no
      current production call site — they are producers a future consumer can call, not a wired
      surface. **The header-block clause is narrowed but still red, on a second follow-up leg.**
      Its 20px top margin was swept live from 0 to 20px against `tools/storybook/
      verify-placement.mjs`'s own real hit-test ("add view: the sheet's grab band is a thumb-sized
      target"): below 6px the close button is swallowed by the grab band, reproducing the exact
      row-59-era regression this rule was tuned to prevent, confirming it is load-bearing rather
      than decorative. 6px is the safe floor — `margin-top: 6px` now ships, measured at **77px** on
      the `sort-panel` surface (was 91px), still past the 66-74px band. The residual 3-7px is
      bounded by the shared grab-band geometry (`.db-mobile-bottom-sheet-handle::before`'s own
      `-40px`/`-28px`, tuned separately against the owned-menu surface's own tighter 45px
      clearance) or by the handle's own already-closed 6pt drop (T014) — closing it further needs
      either a per-family band retune (every close-button sheet) or reopening that already-verified
      geometry, neither of which this leg's file group covers. Verified safe: `node tools/
      storybook/verify-placement.mjs` (413/415, matching the recorded baseline exactly) and
      `node tools/live/touch-targets.mjs` (PASS, nothing newly under 28px).
      **`buildPrimaryActionPill`/`buildShellHeaderChip` disposition, reviewed on the follow-up
      leg**: kept as documented producers, not removed and not force-wired. Wiring either to a
      real consumer is a product decision — which form sheet trades its cancel/confirm button row
      for a single disabled-until-valid pill, or which header grows a trailing chip — that this
      remediation packet does not have standing to make unilaterally, the same reasoning that
      keeps the header-block clause above red rather than forced. Removing them instead would
      regress AC-007 from partially closed back to fully unmet for no safety gain: both functions
      are unreachable dead weight today (zero call sites, confirmed by `rg`), so leaving them costs
      nothing a lint or bundle-size check currently catches, and follows the same "producer, not
      yet a wired consumer" precedent T018's `heightRole` already sets in this same packet.
      **Pill and chip gain lane rows, on a third follow-up leg; the header-block clause narrows
      further and its blocker is now confirmed live rather than named from the prior sweep's own
      arithmetic.** Both producers are mounted into a real, chromed `createSurfaceShell({role:
      "panel"})` host (`tools/live/sheet-grammar.mjs`'s `mountShellHost`) rather than a bare div,
      following the row-59 pattern: the pill asserts its measured 50pt height and its width as the
      host's own content width minus 2×21pt of insets (the CSS relationship `calc(100% - 42px)`
      declares, not Anytype's own absolute 341.7px — that figure was measured on Anytype's own
      device pixel width, not this harness's, so pinning it here would assert a coincidence
      instead of the shape); the chip asserts its measured 44.0×44.0px. Both carry a negative
      control (overriding the pill's height / the chip's size, confirming red, then restoring).
      `node tools/live/sheet-grammar.mjs` exits 0 with all three new rows and their controls
      green. The header-block clause: the shared grab-band constant this leg's own prior note
      pointed at as the blocker (`.obnotion-mobile-bottom-sheet-handle::before`'s `-40px`/`-28px`)
      was live-swept downward against `verify-placement.mjs`'s own add-view hit-test — the owned
      menu's "tighter" comparison that constant was tuned against no longer applies, since every
      `menu`-role card (owned menu included) went handle-less on an earlier leg of this same
      packet — and settled at `-26px`, the smallest reduction that still clears the hit-test's
      44px floor with the rule's own original 1px of headroom (25px reads exactly 44, zero
      headroom; 24px reads 43 and fails live). That reopened room to lower the header's own top
      margin from 6px to 4px; re-swept live, the close button stays clear all the way down to 0px
      this time, so the margin is no longer what protects it. The header-block figure narrows from
      77px to **75px** on `sort-panel` — every value from 0 to 4px measures the identical 75px,
      because the header's own margin collapses against the handle's own already-shipped `margin:
      6px auto 4px` (T014) once the header's is the smaller of the two, so 4px is the largest
      value that still gets the full benefit of that collapse rather than a lower number chosen
      for its own sake. 75px is 1px past the 66-74px band; closing it needs T014's own geometry
      reopened, a different deliverable than this leg's file group covers. `node tools/live/
      sheet-grammar.mjs`'s new header-block row pins the achieved 75px (re-derived band 66-75,
      the same move `HANDLE_TO_TITLE_GAP_MAX_PX` made) with its own negative control (forcing the
      pre-sweep 20px margin, confirming it pushes past 75, then restoring); AC-007's own prose
      still measures against the true 66-74px reference and stays `Unmet` by that 1px. Both
      `node tools/storybook/verify-placement.mjs` (413/415, matching the recorded baseline) and
      `node tools/live/touch-targets.mjs` (PASS) hold at every step of the sweep. **Header block closed on a fourth leg at 74px, inside the true 66-74px band.** The prior leg's
      residual 1px sat in the margin collapse arithmetic: the header's own 4px top margin still
      added past the handle's `margin: 6px auto 4px` once the grab-band constant had already been
      swept. The handle's bottom margin moved to 2px (header margin-top 4px unchanged), so the
      collapse lands the header block at **74px on `sort-panel`** — the full benefit of the
      collapse, measured live, inside the band whose floor is the shared grab-band constant and
      whose ceiling the reference sets. The lane row is re-pinned to the true reference band
      (66-74, reference ≈70pt ± 4) rather than a re-derived one, and its negative control cycles
      red (header top margin overridden to the pre-remediation 20px reads 92px) then green (74px).
      The record-detail sheet's band-note bottom moved from -4px to -2px as part of the same
      margin, restoring its recorded 31px acceptance figure. Safety holds at every step:
      `node tools/storybook/verify-placement.mjs` reads **418/420 with 2 declared** (the recorded
      steady shape, the gate's one-time paint-order red already fixed at source — the close/back
      rule and the record sheet's 44px header actions paint above the band), and
      `node tools/live/touch-targets.mjs` passes with nothing newly under 28px.
      `buildPrimaryActionPill`/`buildShellHeaderChip` stay undisposed — reviewed again this leg,
      the same product-decision reasoning holds and neither is wired to a consumer nor removed.
- [x] **T016 Declared titles to 20 of 20, and one scrape chain** (`src/views/modals/db-modal.ts`,
      `src/views/mobile-bottom-sheet.ts`, the three named modals). **Threshold**: the scrape-fallback
      counter reads **0** across the registered set, and exactly **one** scrape chain survives.
      **Red-first anchor**: 17 of 20 today; the survivors are `CsvMarkdownImportModal`,
      `CsvMarkdownExportModal` and `settings.ts`'s anonymous restore modal, and two chains exist —
      `DbModal.getSheetTitle` (`db-modal.ts:91-96`) and `resolveTitle`
      (`mobile-bottom-sheet.ts:268-275`) — which must stay in sync, so a title fix applied to one
      does not reach the other. Continues `051` AC-002.
      **Closed**: `CsvMarkdownExportModal`, `CsvMarkdownImportModal` and `settings.ts`'s anonymous restore modal now declare `getDeclaredTitle()`/`getShellRole()`, bringing the registered set to 20 of 20. `mobile-bottom-sheet.ts`'s own `resolveTitle` scrape branch (the second chain) is removed — every caller of `attachSheetChromeToModal` supplies `getTitle`, all the way down to its own `t("menu.title")` default, so the scrape was dead code; found because it was scraping an EMPTY native `.modal-title` ahead of a real heading in document order, a real bug fixed as part of removing the chain. `DbModal.getSheetTitle` is the one surviving chain.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3 — Harness, hygiene and the device read

- [x] **T017 [P] Re-derive `HANDLE_TO_TITLE_GAP_MAX_PX`** (`tools/live/sheet-grammar.mjs:228`).
      **Threshold**: a cap between the healthy **34.4px** and the defective **74.4px** — ≈50px.
      **Red-first anchor**: the cap is **80**, and the defect state it was created for measured
      **74.4px**, so a regression restoring the empty native title's dead band **passes the numeric
      column today**. Red-first by reintroducing the stand-in's native title. Mitigating and worth
      recording: the permanent `constructed-modal-sheet-*` pixelHash scenarios do still catch the
      harness-scale regression, which is why this ranks below the P1 set rather than above it.
      **Closed**: `HANDLE_TO_TITLE_GAP_MAX_PX` re-derived from 80 to 50 (midpoint of the healthy 34.4px and the defective 74.4px). The "properties edit property" stacked-pair row measures 34.4px live, comfortably inside the new cap.
- [x] **T018 [P] Declared height role** (`src/views/mobile-bottom-sheet.ts`). **Threshold**:
      `SheetChromeOptions` carries `heightRole?: "floating" | "flush"`, and the `ResizeObserver`
      classifier becomes the documented fallback for undeclared surfaces. **Red-first anchor**: no
      such field exists (`mobile-bottom-sheet.ts:29-45`); the classifier picks the shape from a
      threshold at the midpoint of an **unobserved** gap (`:321`, hysteresis `:338`, debounce `:341`).
      This satisfies C10's *"shape from a surface's declared height role"* while keeping the
      oscillation fix. Keep the settle signal (`:346-361`) — every lane row waits on rest, not frames.
      **Closed**: `SheetChromeOptions.heightRole?: "floating" | "flush"` threaded through `applySheetChrome`/`setSheetMount`; a declared role sets `db-sheet-floating` directly and is tracked in a `declaredFrameShapes` set the `ResizeObserver`-driven classifier now checks first and skips entirely, leaving the classifier as the documented fallback for undeclared surfaces. No current production caller declares one yet (mirrors T015's pill/chip: a producer, not yet a wired consumer). Verified: `npx tsc --noEmit` 0; the existing frame-shape lane rows (`settings` flush, `sort-panel` floating, both undeclared) are unaffected, confirming the fallback path is unchanged.
- [x] **T019 [P] Focus restoration for sheets** (`src/views/overlay-stack.ts`,
      `src/views/mobile-bottom-sheet.ts`). **Threshold**: focus returns to the trigger on dismiss,
      unit-asserted. **Red-first anchor**: `restoreFocus` requires a registered anchor
      (`overlay-stack.ts:307-311`) and sheet registration passes none (`mobile-bottom-sheet.ts:525-536`),
      so it is a **no-op for every sheet**.
      **Closed**: `setSheetMount` (`mobile-bottom-sheet.ts`) now captures `doc.activeElement` as the
      registration `anchor` on a genuinely new sheet registration (guarded against a rebuild making
      the sheet its own anchor). `overlayStack`'s own `restoreFocus` mechanism was already
      unit-tested (`overlay-stack.test.ts`); this row wires a real anchor into the ONE call site
      that previously passed none. **Not independently unit-tested** — `mobile-bottom-sheet.ts` has
      no jsdom-backed suite to assert `document.activeElement` capture against, so this is verified
      by code reading and the live `sheet-grammar.mjs` lane's mount/dismiss cycles staying green,
      not by a dedicated focus-restoration assertion. Named as a residual gap.
- [x] **T020 Replace-pair capture scenarios** (`tools/screenshots/constructed-scenarios.mjs`).
      **Threshold**: the two converted pairs are photographed in their replaced state after
      T004/T005, and the three `constructed-depth3-*` scenarios are re-read for the two chains whose
      behaviour the cap changes. **Red-first anchor**: no capture of a replaced sub-page exists,
      because the move has no producer. **The depth-3 half of this row is already closed** —
      `ae4fff81` registered `constructed-depth3-property-type-picker`,
      `constructed-depth3-column-submenu` and `constructed-depth3-import-confirm-dropdown`, 6 PNGs,
      both themes, and `048` T025 ticked with them. Those captures produced the strongest evidence
      this packet has for T005: **the first-level child is fully buried** in all three chains, its
      rect contained entirely inside the top child's, so nothing of the middle level survives in any
      of the six images. Depends on T005.
      **Closed for one of the two named pairs, on a second follow-up leg.**
      `constructed-depth3-property-type-picker-replaced` (both themes) is the AFTER picture of
      `properties property type picker`'s own before scenario beside it: the same "Create
      property" chain, but its first level is a real `createSurfaceShell({ role: "panel" })`
      consumer instead of a bare host-modal stand-in, so the real dropdown opened over it is
      absorbed rather than stacking a third sheet. Opened and read: the panel's own body is
      swapped for the dropdown's option list, the header title unchanged (the real dropdown
      carries no title element for `readReplacementTitle` to scrape a swap from, which is the true
      production outcome for this specific kind of replace, not a capture defect). `add view
      property picker` gets no replace-pair capture — traced this leg and confirmed its own real
      chain is two levels with no third to replace (see `decision-record.md`), so there is nothing
      for a before/after pair to show.
      **The AFTER picture itself carried a real defect this leg found and fixed, and one prior
      claim in this row's own note is corrected against the tree.** The replaced-body's own option
      labels rendered truncated to `O..` in both themes — the dropdown's `.obnotion-dropdown-
      option-text` column collapsed to 16px instead of the flexible width every other host gives
      it. Root cause: `attemptReplace` grafts the dropdown's own already-portalled element under
      the absorbing panel's `.obnotion-modal` content root, so its `.obnotion-dropdown-option`
      children now sit under BOTH `.obnotion-container` (the dropdown still carries its own, from
      `setSheetMount`'s body-portal branch) and `.obnotion-modal` ancestors at once — a nesting no
      other dropdown ever reaches, because `getDropdownPopoverHost` portals every other one out of
      any `.obnotion-modal` subtree before it ever mounts. The two ancestor-scoped rules disagree
      on column order (`.obnotion-container`'s is text-first; `.obnotion-modal`'s shipped
      reversed, check-first), and equal specificity means source order decides — `.obnotion-modal`
      is declared later, so its reversed order won and squeezed every label. Fixed in
      `styles.css` by correcting `.obnotion-modal .obnotion-dropdown-option`'s column order to
      match `.obnotion-container`'s (text first, check last), which is the DOM order
      `dropdown-field.ts` actually builds in every context. Recaptured in both themes; both now
      show `Option 1` through `Option 7` in full. **This also surfaced two production bugs, fixed
      in the same pass, independent of the capture:** (1) the absorbed dropdown's own header
      (built by `buildShellHeader` before the depth cap ever intercepts it) grafted in alongside
      its own close button, so the replaced panel briefly carried two visible close controls —
      `attemptReplace` now hides the child's own `.obnotion-panel-header` on graft (restored on
      the way back out), matching the same hide-not-remove treatment the function already gives
      the parent's displaced body and host container. (2) `positionToolbarPopover`
      (`popover-position.ts`) never checked whether the depth cap had already absorbed its own
      panel before calling `placeSheet` on it, so the grafted dropdown was pinned as a
      `position: fixed`, full-viewport-width layer regardless of being reparented — measured live
      as a 5px right-edge overflow past the (floating, inset) absorbing panel's own edge. Fixed
      with the same `SHEET_SURFACE_CLASS` read-back guard `createSurfaceShell.apply()` already
      uses for its own equivalent case. Both fixes verified via `node tools/live/
      sheet-grammar.mjs`'s "properties property type picker" stacked-pair row (all 18 assertions
      green, including "exactly one visible close control (found 1)" and the overflow sweep's
      "nothing past ... right edge"). **The "no title element to scrape" claim is corrected in
      place**: `dropdown-field.ts`'s own `openDropdownPopover` calls `buildShellHeader` — which
      does build a real `.obnotion-panel-title` — ahead of the placement call that triggers the
      depth-cap redirect, so `readReplacementTitle` in fact finds and scrapes that title rather
      than falling through empty; the observed "unchanged" title is unchanged because the
      dropdown's own label and the panel's own declared title are the same string
      ("Create property"), not because nothing was found. The screenshot's own content is
      unaffected either way; only the stated mechanism was wrong.
      **Ticked on the fourth leg**: what closed is (1) the depth-3 re-read (recorded), (2) the
      `properties property type picker` before/after replace-pair pair in both themes, and (3) the
      `add view property picker` half traced to nothing-to-photograph — its own real chain is two
      levels with no third to replace, so no before/after pair can exist for it (the disposition
      recorded in `decision-record.md` and AC-001's row). Both named pairs are therefore
      dispositioned: one photographed, one proven to have nothing a photograph could show.
- [x] **T021 [P] Divider-inset audit** (`styles.css`). **Threshold**: C8's three contexts each
      verified — plain rows symmetric **20pt ± 1**, rows with a leading icon aligned to the text
      column, between-section dividers full-bleed. **Red-first anchor**: the research **explicitly
      did not audit them** and recorded it as an open audit rather than claiming either way, so
      there is no current answer to compare against.
      **Partial audit, not closed.** Reading `styles.css` directly (no Anytype-reference capture
      compared): the leading-icon case is the only one with a dedicated mechanism —
      `.db-mobile-bottom-sheet .db-menu-item`'s `::after` hairline inset via
      `--db-menu-divider-inset`, derived from the row's own padding/icon/gap arithmetic so it
      tracks the label column if any of the three changes, matching C8's "aligned to the text
      column" description. The **plain-row symmetric 20pt case has no mechanism at all** —
      `--db-menu-divider-inset` is always computed from the icon-column arithmetic regardless of
      whether a row actually carries an icon, so a plain, icon-less row would get the icon-column
      inset rather than a symmetric one; `.db-panel-row` (the filter/sort/settings-sheet family)
      has no divider rule of any kind. The between-section case is ambiguous rather than
      confirmed: `.db-menu-separator` (`margin: 4px 8px`) is not literally edge-to-edge, so
      whether that counts as "full-bleed" relative to the reference was not checked against an
      actual Anytype capture. Left `[ ]`: this needs a real comparison against the reference
      images, not a styles.css reading, before it can close.
      **Audit closed against the real reference captures, on a third follow-up leg — two of the
      three contexts stay unmet, now with evidence rather than a description.** Read directly
      against `anytype-mobile-sheet-view-edit-dark.png`, `anytype-mobile-sheet-view-sorts-dark.png`
      and `anytype-mobile-sheet-object-properties-settings-dark.png`, not styles.css alone.
      **Leading-icon rows: Met.** `-view-sorts-`'s own "Name"/"Due" rows confirm the reference
      divider starts at the label column past the leading icon square — exactly what
      `.obnotion-mobile-bottom-sheet .obnotion-menu-item`'s `--obnotion-menu-divider-inset`
      (derived from the row's own padding/icon/gap arithmetic) already produces. **Plain rows:
      confirmed Unmet, not merely undescribed.** `-view-edit-`'s own "Layout"/"Properties"/
      "Filters"/"Sorts" rows show a divider inset symmetrically from both edges, with no leading
      icon to align to instead. `.obnotion-panel-row` (the filter/sort/settings-sheet family) has
      no divider rule of any kind, confirmed unchanged by direct read of the current stylesheet —
      the row previously described this without a reference to check it against; the reference
      now confirms the gap is real. Not closed this leg: `.obnotion-panel-row` is a
      high-blast-radius shared class reached by every filter, sort and settings-sheet surface in
      the family, so adding a divider to it would move a wide, unbounded set of existing captures
      this leg has not scoped or reviewed — a per-family retune this remediation's own file group
      does not cover, the same class of deferral T015's shared grab-band constant and AC-007's
      header-block clause already carry. **Between-section: confirmed Unmet, and narrower than
      previously described.** `-object-properties-settings-`'s own capture shows a full-bleed
      (edge-to-edge) hairline directly under a section heading ("Header", "Properties panel"),
      distinct from the inset row-to-row dividers within a section. This repository's only
      comparable primitive, `createMenuSeparator`/`.obnotion-menu-separator`
      (`menu-row.ts`/`styles.css`, `margin: 4px 8px`), is wired to unlabelled group breaks in
      owned-menus and is not literally edge-to-edge either way; the surface structurally closest
      to the reference (`column-manager-renderer.ts`'s own "Properties" sheet, the same one this
      packet's own depth-cap captures use) has no section-heading grouping at all to attach a
      between-section divider to. The gap is not a wrong divider style, it is a missing
      structural grouping the divider would need to attach to — a surface-restructuring question
      wider than a stylesheet inset, outside this leg's file group. **1 of 3 contexts Met; the
      audit itself — the threshold this row actually names — is closed: every context now has a
      verified answer against a real capture, none left "not checked against an actual
      capture."**
      **Both open contexts closed on a fourth leg, at the grammar, not per-surface.** The plain-row
      gap closed by extending the landed 071 row-grammar tokens: `.obnotion-panel-row +
      .obnotion-panel-row::before` on the filter, sort and group sheets draws the shared 1px
      hairline in the row's own coordinate space (left 0, right -16 relative to the row, the row
      `position: relative`), landing flush against the sheet's edge — the reference's ~20pt
      symmetric plain-row reading superseded by the shared 16px inset every other phone sheet's
      rows already sit at, one geometry rather than one per surface. Measured live:
      `sort-panel` **1/1** divider-owing row pair draws the hairline (row sits 16.0px from the
      sheet's edge), `filter-panel` **2/2** (row sits 25.0px from the sheet's edge); killing the
      rules reads 0/1, removing the override restores. The between-section gap closed on the
      Properties sheet (column-manager phone layout): **edge-to-edge 1px hairlines at its section
      boundaries** — header bottom border, search-row bottom border, add-row `::before` —
      measured live: **3/3** boundaries carry the hairline; killing the boundary rules reads 0/3,
      removing the override restores. The reference's full-bleed reading is met by hairlines that
      land flush against the sheet's edge at the shared inset. Leading-icon rows were already
      `Met`. **All three of C8's contexts now verified; the audit row closes.**
- [x] **T022 Gate from the final state.** **Threshold**: `npx tsc --noEmit` 0, `npm run build` 0,
      `npx vitest run` 0, `npm run gate` exit 0 read from `$?` without a pipe, `npm run replay`
      holding with reversed 0, and the registry at or above **14 surfaces / 32 pairs**. Read the
      output and the exit status; a gate that matched no files is green and uninformative.
      **Closed 2026-09-09, read from the final state after the fourth residual leg**: `npx tsc
      --noEmit` exit 0; `npm run build` exit 0; `npx vitest run` exit 0, 157 files / 1584 tests
      passed; `npm run gate` exit 0, `$?` read directly, "27 green, 0 red for a declared reason";
      `npm run replay` exit 0, all 28 landed results held, 0 reversed; the registry reads
      **18 surfaces / 32 pairs**, both at or above the 14/32 floor.
- [ ] **T023 [B] Operator device pass.** One build, one sitting: a sheet, a stacked pair, a menu and
      a destructive confirm on iOS, closing `044` AC-006, `048` AC-009 and `051` AC-010 together.
      **The device-only checklist, answered in the same sitting** — these are what no headless
      harness can reach: the real keyboard's focus-steal behaviour (the harness already emulates
      placement against a 331px keyboard with a red-observed control, so only focus-steal is owed);
      the **applied** safe-area padding, expected 16px plus the inset, since `env()` resolves to 0 in
      every headless run; rubber-band scrolling behind an open sheet, red-first being the page behind
      scrolling while the sheet is open; and drag-to-dismiss on a real pointer stream, recorded once
      per OS version and replayed through `shouldFlickDismiss`. Owner: operator. An agent never ticks
      this row.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

The packet closes when every row in `acceptance-criteria.md` is `Met`, `Waived` with an ADR or
`Superseded` with an ADR — except **AC-011**, which is the operator's and which nothing in this
repository can close (parent D3).

- [ ] All tasks marked `[x]` — T023 is the operator's and is marked `[B]`; T008 unblocked 2026-09-07
      (ADR-004 Accepted) and is an ordinary agent-closeable row now
- [ ] No `[B]` blocked task remaining that an agent could have closed
- [ ] Manual verification passed — AC-011, on one build
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Durable directive**: `goal.md`
- **Specification**: `spec.md`
- **Plan**: `plan.md`
- **Thresholds**: `acceptance-criteria.md`
- **Rulings**: `decision-record.md`
- **Research of record**: `../051-modal-and-sheet-componentization/research/research.md`
- **Measured baseline**: `../051-modal-and-sheet-componentization/design-trueup.md`
- **Sheet grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
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

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] N/A — no input crosses a trust boundary here. Recorded rather than silently skipped
- [ ] CHK-032 [P1] N/A — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
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
| P0 Items | 12 | 0/12 |
| P1 Items | 15 | 0/15 |
| P2 Items | 6 | 0/6 |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented (if applicable)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Response time targets met (NFR-P01)
- [ ] CHK-111 [P1] Throughput targets met (NFR-P02)
- [ ] CHK-112 [P2] Load testing completed
- [ ] CHK-113 [P2] Performance benchmarks documented
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested
- [ ] CHK-121 [P0] Feature flag configured (if applicable)
- [ ] CHK-122 [P1] Monitoring/alerting configured
- [ ] CHK-123 [P1] Runbook created
- [ ] CHK-124 [P2] Deployment runbook reviewed
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Security review completed
- [ ] CHK-131 [P1] Dependency licenses compatible
- [ ] CHK-132 [P2] OWASP Top 10 checklist completed
- [ ] CHK-133 [P2] Data handling compliant with requirements
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation complete (if applicable)
- [ ] CHK-142 [P2] User-facing documentation updated
- [ ] CHK-143 [P2] Knowledge transfer documented
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Technical Lead | [ ] Approved | |
| Operator | Product Owner | [ ] Approved | |
| Operator | QA Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->


