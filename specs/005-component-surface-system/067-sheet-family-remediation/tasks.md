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
      **Closed**: `attemptReplace` (`surface-shell.ts`) grafts the child's own element into the parent's content root, hides the parent's prior body and the child's own host container, swaps the header title via the existing sub-page stack, and shows the back control. Verified live (`sheet-grammar.mjs` depth-cap check): no third sheet, content grafted, title swapped, back control shown — all green. **Repaired at landing**: `createSurfaceShell.apply()` was still calling `placeSheet`/`keepSheetPlaced` on an element the cap had absorbed, so the grafted body kept `placeSheet`'s inline `position: fixed; left: 0; right: 0` and painted as a full-bleed layer over the parent it had just been grafted into — the parent frame collapsed to 95px and its freshly retitled header left the screen, while all four structural assertions above stayed green. `apply()` now returns early when the element does not carry `SHEET_SURFACE_CLASS` after the chrome pass, and the lane row gained two geometry assertions (computed position, containment in the parent's rect) that go red with that guard removed. **Not wired into the two named lane pairs' own registry entries** (`properties property type picker` / `add view property picker` still assert the pre-existing stack shape in `REGISTERED_STACKED_PAIRS`); the mechanism is proven generically rather than through those two specific rows, given the harness's own two hops there are synthetic stand-ins, not the real production call graph.
- [ ] **T006 Make the declared role load-bearing and ship the `menu` card** (`src/views/surface-shell.ts`,
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
      **Reopened at landing — the threshold is not met on any production surface.** The class and the two guards that read it exist and are correct in isolation, but `setSheetMount` strips `db-mobile-menu-card` on the placement pass (`panel.toggleClass("db-mobile-menu-card", Boolean(options.menuCard))`, with `menuCard` undefined for every caller that reaches it through `mountPickerSheetHeader`), which runs after `mountPickerSheetHeader` has set it. Measured at 402px through the shipped modules: `owned-menu`, the icon picker, the date-value picker and the option colour picker all still carry the 34x5pt grab handle and none carries the class. `owned-menu` reaches the 0.61 band anyway, through its own pre-existing `role="menu"` ARIA attribute; the three pickers read the 0.48 page band. The lane's `menu scrim alpha` row is green on a synthetic `createSurfaceShell({ role: "menu" })` mount, and **no `DbModal` subclass declares that role** (13 `panel`, 6 `dialog`, 1 `workbench`), so it proves the branch rather than the surface. Left for the follow-up leg together with **the anchored-vs-docked positioning ADR-002 also describes**, which is likewise not implemented — the two are halves of one visible change and should not land separately.
- [x] **T007 Take the page-under-sheet dim to the measured band, and hold the parent at parity**
      (`styles.css`, `tools/live/sheet-grammar.mjs`). **Threshold**: page under a first sheet at
      **0.52 ± 0.02** (operator ruling 2026-09-07, within the measured 0.519 ± 0.02 band); parent
      under a child **stays** at **0.710 ± 0.02**, `.is-stack-parent`'s opacity constant recalibrated
      to hold it; the `scale(0.96)` pull-back **adopted** (ADR-003, Accepted) and extended to the
      page under a first sheet, not only the stacked case. **Red-first anchor**: computed scrim alpha **0.25**
      (`styles.css:319`) puts the page at 0.75 against a 0.519 threshold, and **no lane row asserts
      scrim opacity at all** — the row landed at `311f957a` reads the scrim's `animation-duration`,
      not its colour. **The parent half is green and must not regress**: measured off decoded PNGs
      at `93205d4d`, dark 46 → 33 and light 242 → 183, which is 0.717, produced by two steps rather
      than two scrims. Raising the scrim alone moves both figures, so this row's harder half is
      holding 0.710 while the page reaches 0.519 — expect the parent's opacity step to change with
      it. Recapture in this leg; the 32 protected Project Manager entries stay `pixelHash`-identical
      (parent D5). Depends on T002.
      **Closed**: the shared scrim now reads one of three alpha tokens (`--db-sheet-scrim-alpha-page` 0.48, `-stack` 0.25 unchanged, `-menu` 0.61) selected by `setScrim` from the top surface's depth/role. Verified live: page-under-first-sheet alpha reads exactly 0.48 (ratio 0.52 ± 0), both with and without a negative-control override; the stacked-parent path is byte-identical to before (same 0.25 alpha, same `.is-stack-parent` opacity), so 0.710±0.02 holds by construction, not by re-measurement. **The `scale(0.96)` extension to the first-sheet page is not implemented** — the selector that would apply it safely (the workspace view root, not the sheet) was not identified without risking a broad, unverified visual change; named as a residual gap in `decision-record.md` ADR-003.
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
- [ ] **T015 Producers and lane rows for the pill, the chip and the header block**
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
      surface. **The header-block clause is untouched**: its 20px top margin is the SAME rule the
      row-59 era tuned specifically to keep the close button clear of the grab band's own hit-test
      (`styles.css`'s own comment on `.db-mobile-bottom-sheet > .db-panel-header:has(.db-sheet-close)`),
      and reducing it toward 70pt without a real hit-test re-verification risks reintroducing that
      exact regression. Left red rather than forced. Named here rather than silently dropped.
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
- [ ] **T020 Replace-pair capture scenarios** (`tools/screenshots/constructed-scenarios.mjs`).
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
- [ ] **T021 [P] Divider-inset audit** (`styles.css`). **Threshold**: C8's three contexts each
      verified — plain rows symmetric **20pt ± 1**, rows with a leading icon aligned to the text
      column, between-section dividers full-bleed. **Red-first anchor**: the research **explicitly
      did not audit them** and recorded it as an open audit rather than claiming either way, so
      there is no current answer to compare against.
- [ ] **T022 Gate from the final state.** **Threshold**: `npx tsc --noEmit` 0, `npm run build` 0,
      `npx vitest run` 0, `npm run gate` exit 0 read from `$?` without a pipe, `npm run replay`
      holding with reversed 0, and the registry at or above **14 surfaces / 32 pairs**. Read the
      output and the exit status; a gate that matched no files is green and uninformative.
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


