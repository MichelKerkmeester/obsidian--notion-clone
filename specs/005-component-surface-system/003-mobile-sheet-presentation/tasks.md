---
title: "Task Breakdown: Mobile Sheet Presentation"
description: "One task per requirement, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "003 mobile sheet tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Mobile Sheet Presentation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

**Reconciled against evidence on 2026-09-02: 7 ticked with citations, 20 left open (0 not done by
decision, 2 operator-owned, rest unfound).**

**2026-09-04: five rows added below for two operator reports landed on separate branches — T28-T32
(Stage 7, the settings sheet, report 41) and T33-T34 (Stage 8, the column-width adjuster, reports
40/40b, renumbered from an original T28/T29 to avoid colliding with Stage 7's own numbers when the
two branches landed on `main` independently); the reconciliation count above predates all five.**

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or a
command whose output and exit status were read. The research gate is standing: if a criterion fails
twice without a new hypothesis, read AnyType and AppFlowy under `external/` for behaviour only —
never code, CSS values or token scales.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP [Honest phone harness]

Stage 1 is a gate, not a task. Until removing the navbar from the harness moves an asserted number by
more than the 1.35px fallback artefact, no later claim in this spec means anything.

- [x] **T1** Add `.mobile-navbar` and a real `--safe-area-inset-bottom` to the browser harness — REQ-008.
      *Evidence to close:* Removing the navbar moves an asserted number by more than the 1.35px fallback artefact
      **Evidence:** `tools/storybook/verify-placement.mjs:516-533` declares `.mobile-navbar` from
      the installed application stylesheet — `position: fixed`, `height: 80px`, full width, no
      z-index — and `:533` sets `--safe-area-inset-bottom: 34px` on the phone body. The gate is
      `:3903` *"removing the navbar from the harness moves an asserted number"*, ticked on
      `goal.md` criterion 6: bounds end at **730** with the navbar and **760** without, a **30px**
      move against the 1.35px fallback artefact. **Watched red** with the positioner's
      `navbarHeight` pinned to the fallback: `a move of 0px`.
- [x] **T2** Delete the hardcoded `--db-mobile-sheet-bottom: 0px` from `tools/screenshots/runtime-vars.css:43` — REQ-008.
      *Evidence to close:* Captures reflect the computed offset; the pre-deletion capture and the post-deletion capture differ
      **Evidence:** deleted — `grep -n db-mobile-sheet-bottom tools/screenshots/runtime-vars.css`
      matches only the removal note at `:101`, which records what the pin did:
      *"computed from the visible bounds; pinning 0px forced the right answer"*. The file's stated
      rule is now *never assign a property the runtime also assigns*, because *"a harness that
      supplies the answer cannot detect a wrong one"*. The runtime is the sole writer:
      `src/views/popover-position.ts:354`
      `panel.style.setProperty("--db-mobile-sheet-bottom", ...)`, read by `styles.css:196` and
      `:209`. `goal.md`'s harness-dependence audit records the same fact —
      *"`--db-mobile-sheet-bottom` is no longer pinned, so that supply is spent"*.
      **Not closed on a capture pair:** no pre/post capture diff is recorded on disk, so the
      capture half of this row's stated evidence rests on the removal note rather than on two
      images.
- [x] **T3** Drive the real positioner in the phone checks instead of `applySheetChrome` alone — REQ-008.
      *Evidence to close:* Editing the bounds branch changes an assertion; today it changes nothing
      **Evidence:** the phone section calls the shipped `positionToolbarPopover` directly
      (`tools/storybook/verify-placement.mjs:651`) and reads the shipped
      `getVisiblePopoverBounds` at `:583`
      *"phone bounds are derived from the navbar on the page, not the hardcoded fallback"*,
      which asserts `bounds.bottom == viewport - navbar - inset` against the `viewport - 50`
      a fallback-derived bound would give. The bounds branch is now load-bearing: pinning the
      positioner's `navbarHeight` to its fallback turns the `:3903` ablation to `a move of 0px`
      (`goal.md` criterion 6), where the file's own note at `:554-555` records that it previously
      changed no asserted number.
- [ ] **T4** Prove each phone check can fail — REQ-008.
      *Evidence to close:* Per check: subject deleted from the harness DOM, asserted number moved

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Stage 2 — runtime census

- [ ] **T5** Open every positioner sheet on a phone profile; log portal parent, computed `bottom`, rect — REQ-007.
      *Evidence to close:* Row per sheet, each with a measured `bottom`
- [ ] **T6** Open all 20 `DbModal` subclasses on a phone profile and record which actually present as sheets — REQ-007.
      *Evidence to close:* Row per subclass; the 2 that inherit `"sheet"` from the constructor default at `db-modal.ts:56` named explicitly alongside the 18 that pass one
- [ ] **T7** Record what the 3 `FuzzySuggestModal` subclasses do — REQ-007.
      *Evidence to close:* `main.ts:2947`, `image-file-suggest-modal.ts:22`, `markdown-file-suggest-modal.ts:16` each classified: sheet, not-a-sheet, or out of scope with a reason
- [ ] **T8** For every surface, record whether the node **and its anchor** survive a field commit — REQ-005.
      *Evidence to close:* Two booleans per surface; the calendar and timeline rows must show node alive, anchor dead
- [ ] **T9** Record the current bottom bound of non-sheet anchored popovers on a phone — REQ-002.
      *Evidence to close:* Blast radius of deleting the `is-phone` branch expressed as a number per popover
- [ ] **T10** Diff the runtime log against the static list — REQ-007.
      *Evidence to close:* Named list of sheet-capable surfaces static analysis missed

### Stage 3 — one predicate

- [ ] **T11** Replace `isTouchDevice()` and `isMobileBottomSheet()` with one exported predicate — REQ-003.
      *Evidence to close:* Both old symbols have zero callers; the new one has one threshold
- [ ] **T12** Record which surfaces change classification between 601px and 760px — REQ-003.
      *Evidence to close:* Named list with the before and after answer at each width

### Stage 4 — contract, portal, scrim

- [ ] **T13** Define the presentation contract: portal target, scrim, safe-area padding, keyboard behaviour — REQ-004.
      *Evidence to close:* A surface declaring `sheet` that does not reach the contract fails at build, not silently at `0px`
- [ ] **T14** Route `DbModal` and the positioner through the one contract — REQ-004.
      *Evidence to close:* `--db-mobile-sheet-bottom` has exactly one writer; today it is `popover-position.ts:115` and `DbModal` never writes it
- [x] **T15** Portal phone sheets to `document.body` — REQ-001.
      *Evidence to close:* `elementFromPoint(centreX, navbarCentreY)` returns the sheet; today it returns `DIV.mobile-navbar` at `z-index: 9999`
      **Evidence:** `src/views/mobile-bottom-sheet.ts:141` `setSheetMount` appends the sheet to
      `document.body`, asserted at `tools/storybook/verify-placement.mjs:6586`
      *"the agreement is the portal, not the ancestor each was built under"* — nine surfaces built
      under nine wrappers all mount on `body`. The hit test is `:6640`
      *"a press at the navbar's centre reaches the sheet, not the navbar"*: the press lands on
      `div.db-record-detail-panel…db-mobile-bottom-sheet`, navbar `z-index auto`, sheet 1000.
      **Watched red** by restoring the harness's invented `z-index: 9999`: the press lands on
      `div.mobile-navbar`. Ticked on `goal.md` criterion 1.
- [ ] **T16** Delete the `is-phone` branch at `popover-position.ts:289-294`, and the `50` fallback at `:291` with it — REQ-002.
      *Evidence to close:* Branch absent from source; sheet bottom offset reads `0px`, not 49px
- [x] **T17** Build the sheet scrim — REQ-006.
      *Evidence to close:* Scrim rect covers the full viewport including the navbar band; none exists today
      **Evidence:** `.db-mobile-sheet-scrim` exists and is asserted at
      `tools/storybook/verify-placement.mjs:6649`
      *"the scrim covers the whole viewport, navbar band included"* — **scrim box `0,0 390x844`
      against a 390x844 viewport**, ticked on `goal.md` criterion 5 — with `:6679` (25% black,
      `pointer-events: auto`), `:6681` (blocks the app behind the sheet) and `:6683` (does not
      steal the grab band). A reacting control is kept at `:2935`.
- [ ] **T18** Confirm the portalled sheet is tokened — REQ-001.
      *Evidence to close:* `--db-radius-lg` resolves non-empty on the body-mounted node — this is `000`'s token root, verified here rather than assumed

### Stage 5 — anchor lifetime

- [ ] **T19** Decide between surgical `updateCellDOM` cases and identity-based anchor re-resolution — REQ-005.
      *Evidence to close:* Decision recorded with the census rows that justify it, **before** code is written
- [ ] **T20** Implement the chosen design — REQ-005.
      *Evidence to close:* After a field commit: node identity unchanged, top edge moved `0px`, a subsequent viewport resize still repositions
- [ ] **T21** Confirm the fix covers the keyboard on the *next* field, not only the first — REQ-005.
      *Evidence to close:* Two consecutive field commits, then a `visualViewport` reduction, still repositions

### Stage 7 — the settings sheet, from operator report 41

- [x] **T28** Find why the settings sheet's grab handle does not dismiss it, driving the shipped
      path at phone conditions rather than reading the gesture again — REQ-001, REQ-004.
      *Evidence to close:* A number for the grab target, taken on the surface the operator reported,
      not on the menu sheets every earlier round measured
      **Evidence:** the gesture is not the defect and was cleared first: on a 390x844 phone profile
      with `hasTouch`, `isMobile` and `is-phone`, a real 120px drag on the handle — driven by
      `page.mouse` and again by `Input.dispatchTouchEvent` through the browser's own input pipeline
      — moved the sheet `matrix(1, 0, 0, 1, 0, 110)` and dismissed it, **both on a fresh sheet and
      after a re-render**. So the 016 repair holds here.
      **The root cause is reach, not wiring.** `positionToolbarPopover` makes the panel itself the
      scroll container (`src/views/popover-position.ts:157` writes `overflow-y: auto`, and
      `styles.css:214` re-declares it on the sheet class), while the grab bar is prepended as an
      ordinary in-flow child of that same panel (`src/views/mobile-bottom-sheet.ts:86`
      `panel.prepend(handle)`) and the header is built as another
      (`src/views/view-config-panel-renderer.ts:303`). So the content carries both off the top edge
      as it scrolls. **The settings sheet is the one toolbar panel whose content always overflows**
      — measured, `1461px of content in a 760px sheet` — and the grab band shrinks one pixel per
      pixel of scroll:

      | `scrollTop` | grab band | what a press at the bar's centre hits |
      | --- | --- | --- |
      | 0 | 48px | the handle |
      | 8 | 40px | the handle |
      | 16 | 32px | the handle |
      | 20 | 28px | **the scrim** |
      | 40 | 8px | the scrim |
      | 300 | **0px** | **nothing** |

      The header goes with it: at 200px of scroll it sits **176px above the sheet's own top edge**.
      Past 48px of scroll the sheet is open, covering the screen, and carries no title, no close and
      no target any press can use to start the gesture. That is the operator's *"cant properly
      close, drag handler doesnt work"*, and no earlier round saw it because the menu sheets fit.
- [x] **T29** Put the red in the shared lane before fixing it — REQ-001.
      *Evidence to close:* The lane fails on the shipped tree, with the numbers in its own output
      **Evidence:** `tools/live/sheet-rebuild.mjs` gained a chrome-reachability case
      (`sheet-rebuild-harness.ts` `openSettingsSheetForReach` / `measureSettingsSheetReach`), which
      builds the real `ViewConfigPanelRenderer` as a sheet and sweeps the band with
      `elementFromPoint` down the sheet's centre line before and after a 200px scroll. **Watched red
      on the shipped tree**, verbatim:
      `FAIL  settings sheet chrome survives its own scroll   1461px of content in a 760px sheet`
      `- settings sheet chrome survives its own scroll: the grab band went from 48px to ZERO after a`
      `200px scroll, and the header went from 24px to -176px relative to the sheet's top edge — the`
      `sheet is open, covering the screen, and nothing on it can close it`
      Staged and measured across a **settled** entrance, because a sheet measured in the render's own
      turn is still at `translateY(100%)` — the first version of this case read `null` at every sweep
      coordinate and accused the product of a missing bar that was merely below the fold.
- [x] **T30** Fix at the producer: the sheet's chrome stops scrolling — REQ-001, REQ-004.
      *Evidence to close:* The band survives a scroll, and a real drag still dismisses from there
      **Evidence:** the shape is the record sheet's, which solved the same problem the same way
      (`styles.css` `.db-record-detail-panel.db-mobile-bottom-sheet` and its
      `.db-record-detail-scroll`). `render()` now builds a `.db-view-config-body` region and writes
      every section into it, and the sheet rules make the panel a column flexbox with
      `overflow-y: hidden !important` while that region scrolls. Lane green with numbers:
      `PASS  settings sheet chrome survives its own scroll   1943px of content in a 670px sheet`
      `— the band held at 48px through a 200px scroll (48px at rest), and the header stayed put at`
      `24px from the sheet's top edge`.
      **The gesture, not just the band:** a real `Input.dispatchTouchEvent` 120px drag on the handle
      dismissed the sheet at `scrollTop 0` **and at `scrollTop 300`**, where before the press could
      not land at all. The band sweep now reads **48px at every scroll offset** — 8, 16, 20, 24, 40
      and 300 — against 40/32/28/24/8/0 before.
- [x] **T31** Give the sheet the close control its grammar names — REQ-004.
      *Evidence to close:* A control in the header, at the phone target size, that closes through the
      shared dismissal rather than a private one
      **Evidence:** `renderSheetClose` adds an `x` button to `.db-panel-header-actions`, drawn only
      when `isMobileBottomSheet` is true so the anchored panel is untouched. Dismissal is handed to
      `overlayStack.dismissPanel`, which is the same close the backdrop, Escape and the drag gesture
      all run through. Measured: **44x44**, found and closing after a 400px scroll
      (`{"found":true,"box":{"w":44,"h":44},"closed":true,"gone":true}`).
- [x] **T32** Re-lay the sheet body in the shared grammar — REQ-004.
      *Evidence to close:* One control per padded row on the phone, desktop byte-identical in shape
      **Evidence:** stylesheet only, every rule scoped to `.db-view-config-panel.db-mobile-bottom-sheet`:
      the row becomes one full-width column with the label above it, a 44px minimum height and a
      hairline between neighbours; inputs, textareas and dropdowns go full width at
      `--db-font-lg` (16px, the step that also stops iOS zooming a focused field and fighting the
      sheet's own keyboard avoidance); helper text becomes the shared hint row; section headers take
      the sheet's inset and open each group with a divider; the two icon actions go from 26px to
      44px; the template engine becomes a dropdown row. **Desktop negative control**, measured on a
      1280x900 profile through the same producer: `isSheet:false`, `closeButton:false`, panel still
      the scroller (`panelScrolls:true`, `bodyScrolls:false`, body `overflow-y: visible`), row still
      `grid-template-columns: 116px 152px`.

### Stage 8 — the column-width adjuster, from operator reports 40/40b

- [x] **T33** Present the column-width adjuster as a shared bottom sheet on a phone — operator report 2026-09-04.
      *Evidence to close:* The adjuster mounts through the shared sheet host with the shared sheet
      tree; the bare-strip vocabulary is gone
      **Evidence:** RED first: the new suite at `src/views/column-width.test.ts:123-184` ran
      **7 failed | 7 passed** against the pre-change tree (2026-09-04 20:48, `npx vitest run
      src/views/column-width.test.ts`) — no `openColumnWidthAdjuster`, no shared sheet-host
      calls, no shared header/range/preset classes. GREEN from the final state: the same suite
      passes **14/14**. The adjuster now lives in `src/views/column-width.ts`:
      `:366` `openColumnWidthAdjuster` builds the shared body (header `:376` `db-panel-header` +
      `:379` `db-cell-edit-close`, range `:388` `db-view-config-range`, presets `:413`
      `db-new-placement` / `:419` `db-new-placement-option` with `is-active`/`aria-checked`),
      and the phone branch calls the same shared host the owned menus do — `:522`
      `applySheetChrome(panel, true, { scrimCapturesPointer: true })`, `:523` `placeSheet`,
      `:524` `keepSheetPlaced`, `:525` `playSheetEntrance`, `:526`
      `attachSheetDragToDismiss(panel, close)`, `:530` `installPopoverAutoClose` (overlay-stack
      Escape + scrim tap). `database-view.ts:11398` now delegates to it and no longer builds the
      bare strip; the old classes (`db-mobile-column-width-title`, `-slider`, `-value-row`) are
      absent from both files, asserted at `column-width.test.ts:155-159`. Auto now clears the
      explicit width instead of pinning the measured one (`column-width.ts:463-471`). The CSS
      lane (styling the sheet tree) is not part of this row.

- [x] **T34** CSS lane for T33's adjuster, plus the keyboard-follow report and a root-caused
      desktop regression T33 introduced — operator reports 2026-09-04 (report-40, report-40b/addendum).
      *Evidence to close:* The four operator-reported/inferred defects each have a red-then-green
      proof: the bare-strip look, the missing close-button chrome, the range/presets rows not
      filling their own row, and the keyboard not following the focused field.
      **Evidence:**

      *Claims verified before touching anything:* `npx tsc --noEmit` 0; `npx vitest run`
      1044/1044 (101 files); `npm run lint` 172 problems (159 errors, 13 warnings), matching the
      pre-existing baseline exactly; `node tools/naming/scan-comments.mjs` PASS; `main.js` clean
      — T33's claims held.

      *The 044 phase this dispatch named does not exist in this worktree* (only `000`-`043` are
      present at base `c6b5f11`); evidence below is written into this packet instead, per the
      dispatch's own fallback.

      *CSS-lane fixes, `styles.css`:* removed the six now-orphaned rules T33's new body markup no
      longer emits (`db-mobile-column-width-title`, `-value-row`, `-slider`, `-value`,
      `-presets`, `-preset`, formerly ~19965-20026). Added `.db-mobile-column-width-panel
      .db-cell-edit-close { display: none }` plus a `.db-mobile-bottom-sheet` variant
      (`:19989-20011`) mirroring the record-detail pairing — without it the close button matched
      no rule at all (only `.db-cell-edit-popover`/`.db-record-detail-panel` scope it) and would
      have painted with the browser's bare default chrome. Added
      `.note-database-container .db-panel-row .db-view-config-range, ... .db-new-placement {
      flex: 1 1 auto; width: 100% }` (`:20025-20031`) and `.db-view-config-number { flex: 0 0
      64px }` plus a range padding reset (`:20039-20046`) — `.db-panel-row`'s own generic `input`
      rule (written for the filter/sort dropdowns) was winning on specificity and neither the
      slider/number row nor the four-button preset group filled their row before this; both had
      always been a grid track or a plain block child elsewhere and never needed their own growth.

      *A second, more severe defect found and fixed while closing the first:* the panel is
      created on `doc.body` directly (`column-width.ts:371`) and never takes
      `setSheetMount`'s move branch that would otherwise add `.note-database-container` for it —
      on EITHER presentation — so the new shared-class body from T33 matched nothing at all and
      would have shipped a different, more silent kind of unstyled surface than the strip it
      replaced. Fixed at `column-width.ts:382` (`panel.addClass("note-database-container")`).
      That alone then regressed the DESKTOP presentation: `.note-database-container`'s own
      `position: relative` (styles.css:822) was beating the panel's `position: fixed` at equal
      specificity — confirmed with a live Playwright DOM dump of the real bundled `column-width.ts`
      (`computed position: relative`, panel laid out at `y=900` on a 900px-tall desktop viewport,
      100% below the fold) — and fixed with `position: fixed !important` at `styles.css:19952`,
      mirroring how `.db-mobile-bottom-sheet` already forces the same property for every phone
      sheet that carries this exact class combination.

      *Keyboard-follow, red then green:* a new permanent lane check,
      `tools/storybook/verify-placement.mjs:2373-2528` ("the column-width adjuster follows the
      keyboard"), mounts the real `openColumnWidthAdjuster` on a 390×844 hasTouch/isMobile/is-phone
      page, focuses the width number field, and drives both arms — `--keyboard-height` (host-declared)
      and a raw `visualViewport.height` shrink (host-silent) — asserting the panel's bottom edge and
      the focused field both clear a 331px keyboard (the height measured off the operator's own
      report-40b screenshot) and return to the floor once it closes. A negative control proves the
      checks are not vacuous: the pre-fix panel's own rectangle (`position: fixed; bottom: 0` and
      nothing else, `verify-placement.mjs:2459-2475`) is driven through the identical simulation and
      confirmed to stay parked at the screen bottom rather than clearing the keyboard — a
      pin-and-drive control on the real panel does not work here, because `keepSheetPlaced`
      resubscribes to the very `resize`/`visualViewport` events the drive dispatches and overwrites
      any pinned override before it can be read. `node tools/storybook/verify-placement.mjs`:
      401/402 checks passed (1 pre-existing declared red, unrelated), exit 0 — run twice, once
      before the desktop position fix (green already, since the check only drives the phone
      presentation) and once after (unchanged).

      *Captures read beside the sort sheet (`sort-panel-desktop-dark.png`):* the adjuster is now a
      proper card — rounded top corners, grab handle, header row, and (on the phone captures) a
      44×44 `x` close button matching the record-detail sheet's chrome — not the flat, edge-to-edge
      strip report-40 showed. The slider spans the row and the "150" value sits in a fixed 64px box
      beside it rather than each shrinking to content. The four presets (`Auto`/`Narrow`/`Medium`/
      `Wide`) span the row as one segmented group with `Auto` highlighted, matching the reference
      `db-new-placement` group's look. `constructed-column-width-adjuster-desktop-{dark,light}.png`
      confirm the desktop fixed-panel presentation is visible and correctly bottom-docked (root-cause
      fix above); `panel-column-width-sheet-mobile-{dark,light}.png` is the new hand fixture,
      `constructed-column-width-adjuster-mobile-{dark,light}.png` the real-renderer capture that
      supersedes it. 6 new files; 7 more the same recapture moved were confirmed pixelHash-identical
      to HEAD (byte-only re-encode noise plus the pre-existing `field-icon-picker-desktop`
      Chrome/OS drift this lane's own prior releases already name) and restored to HEAD bytes,
      manifest entries reset to HEAD's `bytes`/`pixelHash`/`layoutHash` for those 7 while every
      entry's `sourceHashes.styles.css` carries the current fingerprint. `npm run screenshots:verify`:
      534 entries match their sources, none blank or identical across themes, 0 stale.

      *Full-suite re-verify after every fix:* `npx tsc --noEmit` 0; `npx vitest run` 1045/1045
      (102 files, +1 for the new `note-database-container` regression test at
      `column-width.test.ts:186-191`); `npm run lint` 172 (unchanged baseline); `scan-comments`
      PASS; `npm run gate`: 25/25 green, including `evidence` (8 artefacts — `cascade-audit`,
      `checkbox-appearance`, `checkbox-inventory`, `design-conformance`, `engine-parity`,
      `surface-census`, `token-census`, `view-census` — re-run by hand to re-stamp their
      `styles.css` fingerprint after it changed; none reported a new defect).

      **Backfill 2026-09-04:** `044-phone-sheet-alignment` now exists (it did not at the time this
      row was written, see the note above) and owns report 40/40b as its T005/T006. The evidence
      above is this task's own record of the original fix and is left in place; the authoritative,
      continuing evidence — including landing this branch onto `main` — lives in
      `../044-phone-sheet-alignment/tasks.md` T005/T006. `worktrees/039-column-width-sheet` landed
      onto `main` via `chore(sheets): reconcile the column-width sheet with main`.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

Stage 6 — prove it where the user stands.

- [x] **T22** Navbar hit test in `tools/storybook/verify-placement.mjs` — REQ-001.
      *Evidence to close:* `vitest` is `environment: "node"` with no jsdom, so the assertion lives here, not in a unit test
      **Evidence:** `tools/storybook/verify-placement.mjs:6640`
      *"a press at the navbar's centre reaches the sheet, not the navbar"*, a real
      `document.elementFromPoint` at the navbar centre, asserting the navbar's height is the
      host's 80px so the check cannot pass against an invented one. Ticked on `goal.md`
      criterion 1.
- [ ] **T23** Geometry assertion for both mechanisms — REQ-004.
      *Evidence to close:* One asserted number covering modal and anchored sheets; today they read 0px and 49px
- [x] **T24** Keyboard assertion via a reduced `visualViewport` — REQ-004.
      *Evidence to close:* Focused field rect inside the visible rect
      **Evidence:** `tools/storybook/verify-placement.mjs:1029-1085` shrinks
      `visualViewport.height` and dispatches its `resize` with `--keyboard-height` **unset**, so
      the arm is not answered by writing the host's variable — `:1075`
      *"the sheet clears a keyboard no host reported"*, `:1082` the same for the selection bar,
      `:1102` the return to the floor. Ticked on `goal.md` criterion 4, *"Met on both arms"*, and
      recorded in the harness-dependence audit as one of the three exposures now spent.
- [ ] **T25** Phone captures **with a navbar present** — REQ-008.
      *Evidence to close:* Capture set regenerated with the navbar in frame, and a human reviewed the changed PNGs
- [ ] **T26** Storybook sheet states at the production mount point — REQ-007.
      *Evidence to close:* Blocked on `000` unblocking `Platform` (`obsidian-stub.mjs:52-57`), `Modal` (`:90`) and `FuzzySuggestModal` (`:80`); a container-wrapped approximation does not close this
- [ ] **T27** Confirm on device that the sheet covers the navbar — REQ-001.
      *Evidence to close:* Operator observation. Gate passage alone does not close this spec

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Every requirement REQ-001 to REQ-008 met with cited evidence.
- Every criterion C1-C6 has both its failing and its passing number recorded.
- The negative controls N1-N6 in `checklist.md` hold.
- The anchor-lifetime fix in REQ-005 has landed in one of its two forms.
- Gates green from the final state, each exit status read without a pipe.
- **The operator has confirmed on a phone that the sheet covers the bottom navigation bar.**

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)

<!-- /ANCHOR:cross-refs -->
