---
title: "Tasks: Stacked Sheets"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "048 tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Stacked Sheets

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup — the inventory comes first

Nothing is migrated before the list of what must be migrated exists. `044`'s instance ranking sat
`[B]` on an inventory for the same reason.

- [x] T001 Code-derived stacked-surface inventory: every surface that can open while another sheet
      is open, grouped parent → child → opener kind → current → target, one `file:line` opener per
      row, cross-referencing `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`
      rather than restating it (`stacked-surface-inventory.md`)
- [x] T002 Identify the layers in `../scratch/device-2026-09-05/stacked-properties-create-property.png`
      by naming the nodes on `document.body` at that moment — three sheets, or a sheet plus a
      modal's own chrome band (`stacked-surface-inventory.md` §5)
- [x] T003 Runtime diff against the static list: open each parent, open each child, log depth,
      `--db-mobile-sheet-bottom` per sheet, scrim count and node position, and the parent's rect
      before and after. Record the failing numbers into `checklist.md`'s "today" column
- [x] T004 [P] Rank the inventory rows: which stacked pairs the operator meets first, worst first

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### The stacking model

- [x] T005 Make `parentId` load-bearing: expose the depth of a surface and the surface immediately
      beneath the top, per document (`src/views/overlay-stack.ts`)
- [x] T006 Push/pop parent treatment in the mount: on push, dim and scale back the surface beneath;
      on pop, restore it. The parent's bounding box does not change (`src/views/mobile-bottom-sheet.ts`)
- [x] T007 Move the one scrim node between the top two sheets instead of leaving it behind both,
      keeping the `MutationObserver` guarantee that a bare `.remove()` is still correct
      (`src/views/mobile-bottom-sheet.ts`)
- [x] T008 Publish the keyboard inset to the topmost sheet only; a sheet beneath holds zero and does
      not move for a keyboard opened over its child (`src/views/popover-position.ts`)
- [x] T009 Parent dim and scale, and the scroll fade at a child's cut (`styles.css`)

### Per-child migrations, by inventory rank

- [x] T010 K1 dropdown sheets — the single largest class and both operator screenshots. Header with
      a title and a 44px close on every stacked dropdown (`src/views/dropdown-field.ts`)
- [x] T011 K2 owned menus — the same header on the menu sheet (`src/views/owned-menu.ts`)
- [x] T012 The Properties sheet's own header onto `createSheetHeader`, replacing the hand-built
      header that has no close (`src/views/column-manager-renderer.ts:159`)
- [x] T013 K6 pickers — date, icon and colour (`src/views/date-value-picker.ts`,
      `src/views/icon-picker-popover.ts`, `src/views/option-color-picker.ts`)
- [x] T014 K3 `DbModal` sheets — **D1 ACCEPTED** (`decision-record.md` ADR-001). Either the shared header on
      `applyPresentation`, or the named phone flows replaced with sheets
      (`src/views/modals/db-modal.ts`)
- [x] T015 K4 `FuzzySuggestModal` — the two reachable from the settings sheet: a sheet, or an
      explicit recorded exemption with its reason (`src/views/view-config-panel-renderer.ts:626,668`)
- [x] T016 K5 — replace the one remaining `new Menu()` with `createOwnedMenuForEvent`
      (`src/views/calendar-timeline-renderer.ts:959`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T017 A permanent `sheet-grammar` lane row per stacked pair — parent+child, mounted through the
      constructed seam on a phone page — each observed **red first** (`tools/live/sheet-grammar.mjs`)
- [x] T018 A stacking negative control: remove the parent's dim on one registered pair, require that
      row red and every other row green, restore, require green (`tools/live/sheet-grammar.mjs`)
- [x] T019 One depth-3 row registered — record sheet → owned menu → submenu, or Properties → modal →
      dropdown — because a model tested only at depth 2 breaks at 3
- [x] T020 `npm run gate` exit 0 read from `$?` without a pipe; `npm run replay` holds with reversed 0
- [x] T021 Recapture and read by a person across both themes; `verify-placement.mjs` at its declared count
      — 550 captured, 7 content-changed and read, 19 byte-only reverted; `verify-placement` 370/373 with 3 declared reds
- [ ] T022 Release cut to GitHub and the iCloud vault, then the operator re-checks the three captures
      — **open. Ships in 0.0.24; nothing in this repository can close it**
- [x] T023 Update `checklist.md` "today" cells with the measured before-numbers and mark each row
      with its evidence
- [x] T024 (2026-09-06 amendment) Fix the four defects the operator's 10:04 iOS report names on a
      depth-2 stack (Edit property → Month over Properties): the duplicate close control, the
      header/body background split, the ~200px dead space above the title, and the parent bleed.
      **Red first**, on the operator's own capture and on a constructed depth-2 recapture:
      pre-fix **2** close controls in frame, **2** background values across one sheet, ~**200** CSS
      px above the title's ink, and parent ink above the child's top edge. Green is 1, 1, the
      header's own padding box, and 0. Leg `worktrees/159-fix-048-ios-stacked-sheet`; lands after
      `051`'s side-sheet leg frees `surface-shell.ts` and `mobile-bottom-sheet.ts`

      **Landed on `main` in three commits.** `be578988` is the fix, at the one producer every
      `DbModal` subclass and both suggest-modal wrappers route through: `attachSheetChromeToModal`
      (`src/views/mobile-bottom-sheet.ts`) finds Obsidian's own always-created chrome **by
      reference** — the empty `titleEl` and the `.modal-close-button` — hides both while presented
      as a sheet and restores them on teardown, and `styles.css` turns off `.note-database-modal`'s
      desktop-dialog frame inside a `.db-mobile-bottom-sheet` while declaring nothing on the root.
      The pre-existing selector-only close hide is deleted rather than kept as a second layer,
      because it silently caught a negative control's own injected close button. `772b24d2` is the
      follow-on guard: the container is recognised as the host's `.modal-container` by class instead
      of taken as whatever `modalEl.parentElement` happens to be, since the same function is also
      handed panels the shell presents. **Watched red on both engines** before that guard, the
      panel's own parent reading `none` presented as a sheet and `""` after the teardown against the
      `flex` it was given. `e632a1e1` corrects the record where the first pass did not survive
      measurement.

      **Red first, in the lane's own vocabulary.** Against the pre-fix tree, on the faithful
      host-modal stand-in (`.modal-container` > `.modal-bg` + `.modal` > `.modal-title` +
      `.modal-content` + `.modal-close-button`): header/body backgrounds `rgba(0, 0, 0, 0)` against
      `color(srgb 0.224 0.224 0.224)` on **5 of 31** registered pairs, every one of them a
      host-modal child; handle-to-title gap **74.4px** against **34.4px** once the empty native
      title is hidden — the ~200 CSS px the operator's own capture shows, reproduced in the harness
      as the native title's own 40px band; **2** visible close controls where 1 is wanted.

      **Green, re-measured this session at `main` `5aeb7087`** on the `properties edit property`
      pair, the operator's exact scenario, on Chrome and again on WebKit: `exactly one visible close
      control (found 1)`; `header and body share one background (rgba(0, 0, 0, 0) vs rgba(0, 0, 0,
      0))`; `sheet root paints an opaque fill (color(srgb 0.179412 0.179412 0.179412))`;
      `handle-to-title gap <=80px (measured 34.4px)`; `parent dims and scales back`; `child depth 2
      (want 2)`; `parent bounding box delta <=1px (max 0.00px)`; `exactly one scrim` and `scrim
      between the top two sheets`. Four injection controls each go red and come back: a second close
      control reads 2, a mismatched body background reads red, an unpainted root reads red, an
      oversized gap reads **314.4px**.

      **The fourth defect is closed by re-derivation, not by a fix, and the row says so.** "Parent
      bleed" was measured rather than accepted (`decision-record.md`'s 2026-09-06 ~10:44 note, as
      corrected at `e632a1e1`): on both engines the child registers with the overlay stack, derives
      its parent, resolves depth 2, and one scrim sits at z-index 1001 between the parent's 1000 and
      the child's 1002 while the parent holds `is-stack-parent` at opacity 0.88 — identically before
      and after the fix. The parent visible above the child is the floating frame doing what C10
      specifies: inset 8px left, right and bottom, radius 16px, measured 8/382/836 in a 390x844
      viewport. So there is no stacking defect here, and the ink the report read through the child
      was the child's own missing surface, which `be578988` closes.
- [ ] T025 (2026-09-06 amendment) Recapture the depth-2 and depth-3 stacked scenarios after T024 and
      read them by eye across both themes, then re-run `node tools/live/sheet-grammar.mjs` and
      require the registry to still read 13 surfaces and 31 pairs at exit 0 from `$?`

      **Half landed, and the row stays open on the other half. Reconciled 2026-09-06 against `main`
      `5aeb7087`.** The **depth-2** recapture landed at `5aeb7087` as **T026**, not as this row:
      four `constructed-modal-sheet-*` scenarios mount a real `DbModal` subclass through the real
      `attachSheetChromeToModal` over the shared host-modal stand-in, standalone and stacked over
      the column-manager sheet, both themes, phone only, 8 PNGs, all read by eye and named in the
      `reviewed` array of `048`'s own lane release entry. **Observed red** first by reverting the
      by-reference hide and recapturing: `constructed-modal-sheet-property-editor`'s `pixelHash`
      moved `cf8ae04b3b21` / `4b5b728e1872` (green, dark / light) to `51e0683b4efb` /
      `ed039953a5c9` (red), the native title's dead band back at 74.4px against 34.4px.

      **The gap, in one line: no depth-3 stacked capture scenario exists.**
      `tools/screenshots/constructed-scenarios.mjs` registers exactly two stacked ids
      (`constructed-modal-sheet-property-editor-stacked`, `constructed-modal-sheet-confirm-stacked`),
      both depth 2; the three depth-3 chains the lane carries (`properties property type picker`,
      `record column submenu`, `import confirm dropdown chain`) are mounted and measured but never
      photographed.

      **This row's own registry threshold is stale and is not ticked against.** It asks for 13
      surfaces and 31 pairs; the lane at `5aeb7087` reads **14 surfaces and 32 pairs** at exit 0,
      and both additions are deliberate: `column-manager` registered at `3ae2818e`, and the
      operator's own `properties edit property` pair at `5fccf193`. The threshold is left as written
      rather than edited, because the number a future run should require is a decision about what
      the registry ought to hold, not a transcription of what it holds today.
- [x] T026 The permanent regress-test for the gap `048`'s landing named: no screenshot scenario
      modelled a `DbModal` presented as a phone sheet, so the corpus could not regress-test row 59's
      fix. Four `constructed-modal-sheet-*` scenarios (`tools/screenshots/constructed-scenarios.mjs`)
      mount a REAL `DbModal` subclass — `ColumnRenameModal` ("Edit property — Month") and
      `ConfirmModal` — through the real `attachSheetChromeToModal`, over the faithful host-modal
      stand-in `tools/live/sheet-grammar.mjs` already mounts its `modal`-kind stacked pairs against,
      shared rather than duplicated from `tools/live/host-modal-stand-in.ts`: standalone and stacked
      over the column-manager sheet (the operator's own pair), both themes, phone only.
      **Red first**: the by-reference hide in `attachSheetChromeToModal`
      (`src/views/mobile-bottom-sheet.ts`) was temporarily reverted, recaptured, and the native title
      band reappeared — handle-to-title gap **74.4px**, the same figure the decision record's own
      `sheet-grammar.mjs` evidence already carries — against **34.4px** once restored; the native
      close control's own box stayed present but unpainted (Obsidian's own glyph is host CSS this
      harness does not vendor, so the box is there without a visible ×, an honest limit of the
      stand-in, not a false pass). `constructed-modal-sheet-property-editor`'s manifest `pixelHash`
      moved `51e0683b4efb` (red, dark) / `ed039953a5c9` (red, light) ->
      `cf8ae04b3b21` (green, dark) / `4b5b728e1872` (green, light) — the fix restored before commit,
      confirmed by an empty `git diff` on `mobile-bottom-sheet.ts`. Registered: `capture.mjs --only`
      green per scenario, `npm run screenshots` full run 576 entries, `verify.mjs` exit 0,
      `npm run gate` 26/26, `node tools/live/sheet-grammar.mjs` exit 0 on both engines with the
      shared stand-in. The css-lane's own baseline stylesheet hash is untouched — this task touched
      no CSS, so the lane stays where `056-board-anytype-parity` left it and this landing takes it
      from nobody. All 8 PNGs are named in the `reviewed` array of `048`'s own release entry and were
      opened and read; `check-lane.mjs` exits 0 here **because the captures are committed rather than
      because that entry is consulted** — the newest lane entry is `056`'s, and only the newest is
      checked, so the exit code is a vacuous pass and the review the array records is the real
      evidence.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` — T022 (the operator's) and T025 (no depth-3 capture scenario exists) open
- [x] No `[B]` blocked tasks remaining — D1 was the only block and it is ACCEPTED
- [ ] Manual verification passed — awaits the operator's device read; 0.0.24 through 0.0.29 have shipped with no reply on this surface
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Inventory**: See `stacked-surface-inventory.md`
- **Criteria**: See `acceptance-criteria.md` and `checklist.md`
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

- [x] CHK-001 [P0] Requirements documented in spec.md — REQ-001 to REQ-008, four P0 and four P1
- [x] CHK-002 [P0] Technical approach defined in plan.md — one depth model in the stack, consumed by the mount
- [x] CHK-003 [P1] Dependencies identified and available — `044`'s lane green, `031`'s fix confirmed on 0.0.23, D1 open and scoped to the modal rows alone
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks
- [x] CHK-011 [P0] No console errors or warnings
- [x] CHK-012 [P1] Error handling implemented — a child whose parent is destroyed stays closable
- [x] CHK-013 [P1] Code follows project patterns — depth is asked of the stack, never computed by a surface
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete — the operator's three captures reproduced on iOS
- [x] CHK-022 [P1] Edge cases tested — depth 3, bare `.remove()`, parent rebuilt under an open child
- [x] CHK-023 [P1] Error scenarios validated — a popped-out window keeps its own stack
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class recorded: **class-of-bug**. Three reports, one absent mechanism — no surface models depth
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `rg -n "applySheetChrome|placeSheet|positionToolbarPopover" src/views` covers every path by which a surface becomes a sheet
- [x] CHK-FIX-003 [P0] Consumer inventory for `parentId`, `setSheetMount`, `setScrim`, `SHEET_KEYBOARD_INSET_VAR`
- [x] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface. Recorded rather than silently skipped
- [x] CHK-FIX-005 [P1] Matrix axes listed: depth × opener kind × keyboard × parent kind, per `plan.md`
- [x] CHK-FIX-006 [P1] Hostile variant: a second document (popped-out window) with its own stack and its own scrim
- [x] CHK-FIX-007 [P1] Evidence pinned to a fix SHA, not a branch-relative range — `265f736f` model, `915591c2` migrations, `f1fffff2` lane
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Input validation implemented — N/A, no input crosses a trust boundary here
- [x] CHK-032 [P1] Auth/authz working correctly — N/A, no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] Code comments adequate — `keepSheetPlaced`'s recorded divergence updated to point at its fix
- [ ] CHK-042 [P2] README updated (if applicable)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only
- [x] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 10/11 |
| P1 Items | 15 | 14/15 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->

---
