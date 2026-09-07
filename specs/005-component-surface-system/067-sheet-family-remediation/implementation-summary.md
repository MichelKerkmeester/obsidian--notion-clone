---
title: "Implementation Summary: Sheet Family Remediation"
description: "What the sheet-family remediation landed on main, what landing verification confirmed by measurement, what it refuted, and what stays open."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/067-sheet-family-remediation"
    last_updated_at: "2026-09-07T17:00:00Z"
    last_updated_by: "second-follow-up-leg-session"
    recent_action: "Closed AC-003 light figure, verified real call graph, narrowed T015 header block"
    next_safe_action: "Fix T015 header block margin and audit T021 dividers"
    blockers:
      - "T023 is the operator's device read"
    key_files:
      - "specs/005-component-surface-system/067-sheet-family-remediation/goal.md"
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/research/research.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-067-impl"
      parent_session_id: null
    completion_pct: 70
    open_questions: []
    answered_questions:
      - "The commit-id discrepancy the research flagged is not one: be578988, 772b24d2 and e632a1e1 are three commits with three roles"
      - "Dimmed parent under a stacked menu, per the operator's 2026-09-07 Notion ruling (ADR-002)"
      - "The FuzzySuggest disposition: route through the shell (ADR-004), landed with 0 call sites left"
      - "How the menu card sits once it survives the placement pass: docked, not anchored — anchoring was tried and reverted (24 overflowing calendar-grid cells, a broken keyboard-avoidance handoff)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 067-sheet-family-remediation |
| **Completed** | Landed on `main` 2026-09-07, first follow-up leg closed T006 and ADR-003's page pull-back the same day; second follow-up leg (same day) closed AC-003's remaining light-theme figure, verified `properties property type picker`'s real call graph, closed T020's replace-pair capture for that pair, and narrowed T015's header block; not device-verified — T015's header-block clause, T021 (partial) and AC-011 remain open |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The depth cap and its replace producer (T004-T005), the page-under-sheet scrim raised to the measured band with the stacked-parent
band held unchanged (T007), all three `FuzzySuggestModal` surfaces routed through
`createSurfaceShell` and registered in the lane (T008-T010), the declared-constants-to-stylesheet
bridge for the motion band (T011-T012), the phone row-pitch floor (T013), the corrected handle
geometry (T014), primary-action-pill and header-chip producers (T015, partial), 20-of-20 declared
titles with one surviving scrape chain (T016), the re-derived gap cap (T017), a declared height
role (T018), and focus restoration wired for sheet dismissal (T019).

**Follow-up leg (this session), on top of the landing above**: T006's `menu`-role handle-less card
is now built and measured live on all four production surfaces — `setSheetMount`'s toggle is
add-only, so `mountPickerSheetHeader`'s earlier class no longer gets stripped on the placement
pass — with the anchored-vs-docked geometry half deliberately declined (tried, reverted, pinned
at `popover-position.ts`) rather than left unattempted. Fixing T006 for real exposed that
`tools/storybook/verify-placement.mjs` had several assertions written against the OLD, broken
behaviour (a menu sheet with a handle that drags); those are rewritten to match the now-correct
contract. ADR-003's `scale(0.96)` page-pull-back extension was ALSO attempted, but broke
`position: fixed` for the row-selection bar (a CSS transform on `.note-database-container`
creates a new containing block for its fixed-position descendants) — caught by the same
`verify-placement.mjs` run, fully reverted rather than shipped or patched around, and then
**dropped outright by the operator** on 2026-09-07 ~14:50 ("Drop the scale cue"), with the
containing-block conflict quoted as the reason. ADR-003 is now **Accepted-as-amended**: the
0.52 ± 0.02 page dim stands, the pull-back does not. T021's divider
audit got a partial, styles.css-only reading (not a reference-capture comparison).
`buildPrimaryActionPill`/`buildShellHeaderChip` were reviewed and deliberately kept as documented
producers rather than removed or force-wired.

**Second follow-up leg (same day), on top of both legs above**: the light-theme stacked-parent
figure closed (`filter: brightness(0.93)`, reset to `none` in dark, measured 0.707 against a
0.758 red, dark unmoved at 0.717), `properties property type picker`'s own real call graph
verified live (a real column-manager parent, a real panel-role `createSurfaceShell` consumer, a
real dropdown — absorbed rather than stacking, with a dialog-role negative control), `add view
property picker` traced and confirmed already real at its own native two-level depth (no rewiring
needed), the replace-pair capture closed for `properties property type picker` (both themes,
before and after, opened and read), and the header-block margin swept live from 0-20px against a
real hit-test to find its safe floor (6px, measuring 77px against the 66-74px target — narrower,
still red for a reason bounded outside this leg's file group).

**Still not built**: the header-block margin's final close (needs either a per-family grab-band
retune or reopening the already-`Met` handle-drop geometry, both outside this leg's file group —
see Known Limitations #5), T021's divider-inset audit (still a styles.css reading, not a
reference-capture comparison — see Known Limitations #6), and the 17 stale sheet-family captures
named on `tools/lane/css-lane.json`'s `outstanding` row (not reviewed this session). AC-011 is the
operator's device read and is untouched.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/overlay-stack.ts` | Modified | The depth cap in `register`, scoped to sheets via an opt-in `replace` callback; a focus-restoration anchor |
| `src/views/surface-shell.ts` | Modified | The sub-page replace producer (`attemptReplace`), `menu`/`panel`/`condition panel` role wiring into chrome, a header-chip producer, and the landing repair that stops an absorbed panel being placed as its own sheet |
| `src/views/mobile-bottom-sheet.ts` | Modified | Handle geometry unchanged in code (styles.css owns the numbers), `SheetChromeOptions.heightRole`/`.menuCard`/`.replace`, three-band scrim-alpha selection, focus-restoration anchor capture, the depth-cap short-circuit in `setSheetMount`/`applySheetChrome` |
| `src/views/popover-host.ts` | Modified | `mountPickerSheetHeader` marks its callers `db-mobile-menu-card` and strips the handle — now effective end to end since `setSheetMount`'s toggle no longer strips it back off (T006, closed on the follow-up leg) |
| `src/views/confirm-sheet.ts` | Modified | `buildPrimaryActionPill` producer |
| `src/main.ts`, `src/views/image-file-suggest-modal.ts`, `src/views/markdown-file-suggest-modal.ts` | Modified | Route through `createSurfaceShell`; the double-title scrape removed as a side effect |
| `src/views/modals/csv-markdown-export-modal.ts`, `src/settings.ts` | Modified | Declared title/role, closing two of the three T016 survivors |
| `styles.css` | Modified | Scrim alpha (three bands), motion tokens and transitions, row-pitch floor, handle geometry, pill/chip classes, plus the follow-up leg's menu-card handle-hide rule. The `.db-page-pulled-back` `scale(0.96)` rule was added and then removed in the same leg — see the mobile-bottom-sheet.ts row below |
| `src/views/mobile-bottom-sheet.ts` (follow-up leg) | Modified | `setSheetMount`'s `menuCard` toggle made add-only; `attachSheetDragToDismiss` refuses a handle for a menu-card. `setPagePulledBack`/`syncSheetStack` wiring for the page-under-first-sheet scale cue was added, found to break `position: fixed` for the selection bar (transforming `.note-database-container` creates a new containing block for its `position: fixed` descendants), and fully removed in the same leg — net zero diff on this file for that piece |
| `src/views/owned-menu.ts` (follow-up leg) | Modified | Passes `menuCard: true` into `applySheetChrome` |
| `src/views/sheet-grammar.ts` (follow-up leg) | Modified | `hasSheetHandle` reads backwards for `.db-mobile-menu-card` (satisfied by absence, not presence) |
| `src/views/popover-position.ts` (follow-up leg) | Modified | A pin recording why a `menu`-role card still docks full-width in `place()`'s `mobileSheet` branch rather than anchoring to its trigger (comment only, no behaviour change) |
| `tools/live/sheet-grammar.mjs` | Modified | Three FuzzySuggest surfaces registered; new lane rows for scrim alpha (page + menu), motion exit band, row pitch, handle geometry, the depth-cap replace mechanism (positive + negative control); the constants bridge reads `surface-shell.ts`'s shipped source directly; follow-up leg adds the menu-role parent-dim assertion on all four production surfaces. A page-pull-back scale/layout-shift/reduced-motion row set was added and then removed in the same leg when the underlying feature was reverted |
| `tools/storybook/verify-placement.mjs` (follow-up leg) | Modified | Rewrote assertions across three sections that assumed a menu sheet still carries a grab handle and drags to dismiss (T006 now correctly removes both): the menu-presentation section, the motion-allowed section's drag-interrupt case, and the dedicated flick-gesture section all now build a plain draggable sheet for anything that genuinely needs a handle, and assert absence directly where a menu-role card is what is being measured. Also fixed the keyboard-lift comparison to compare lift AMOUNT rather than absolute position, since a menu-role card now bails out of the floating/flush classifier and docks flush while a panel floats with an 8px inset |
| `src/views/overlay-stack.test.ts` | Modified | Three new unit tests for the depth-cap redirect |
| `tools/storybook/verify-placement.mjs` | Modified | Three assertions' expected values corrected (200ms entrance, 48% scrim, 31px grab band) to match the packet's own deliverables |
| `screenshots/**/*.png` (73 files at landing, 19 more on the follow-up leg), `screenshots/manifest.json` | Modified | Recaptured after the scrim/handle/motion/row-pitch changes, then again after the follow-up leg's menu-card and page-pull-back rules; byte-only re-encodes restored to their committed bytes both times |
| `tools/lane/css-lane.json` | Modified | CSS lane handed over from `063-notion-dropdown-refinement` to this phase at landing (73 real changes named); acquired and released TWICE on the follow-up leg — once at 19 real changes for the menu-card fix plus the (then still present) page-pull-back, and again after the page-pull-back's revert moved the baseline hash a second time, correcting the set to the 12 changes the menu-card fix alone produces (2 excluded both times as already fixed on `main` by an unrelated packet) |
| `tools/live/*.json` (evidence artefacts) | Modified | Regenerated against the moved `styles.css`/`mobile-bottom-sheet.ts` |
| `styles.css` (second follow-up leg) | Modified | The stacked-parent `filter: brightness(0.93)` (reset to `none` in `.theme-dark`) closing AC-003's light figure; the header-block `margin-top` re-derived from 20px to the safety-verified 6px floor |
| `tools/live/sheet-grammar.mjs` (second follow-up leg) | Modified | A permanent "stacked-parent filter" lane row plus its negative control; a new `openRealPanelShellChild` construction and a dedicated "properties property type picker — the real call graph under the depth cap" check plus its dialog-role negative control, additive beside the existing `REGISTERED_STACKED_PAIRS` entry |
| `tools/screenshots/constructed-scenarios.mjs` (second follow-up leg) | Modified | A new `constructedDepth3ReplaceScenario` helper and the `constructed-depth3-property-type-picker-replaced` scenario (the AFTER picture of the existing BEFORE one), both themes |
| `screenshots/notion-clone/panels/constructed-depth3-column-submenu-mobile-light.png`, `constructed-depth3-property-type-picker-replaced-mobile-{dark,light}.png` (second follow-up leg) | Modified/Added | Recaptured for the filter fix (light only — dark is unmoved by construction) and the new replace-pair AFTER scenario |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

One session, not the four legs `plan.md` §4 laid out separately — implemented in dependency order
(the depth cap before the replace producer, the constants bridge before the numeric rows, the
scrim before its recapture) but landed together. The two wide-blast-radius changes named in
`plan.md` — the scrim (moved 73 mobile captures) and the menu card (moved every `menu`-role
surface) — were recaptured in the same pass; the 32 Project Manager entries `parent D5` protects
were confirmed untouched (zero of either the 73 real changes or the 32 reverted byte-only
re-encodes falls under `screenshots/project-manager/`).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| One coordinated child rather than rows scattered across `044`, `048` and `051` | Both `phase-definitions.md` §2 thresholds are met independently — `recommend-level.sh --loc 1100 --files 20 --architectural` reads **72/100, Level 3** and a phase score of **30/50** against the 25 bar. Scattering would also reopen two packets that are one operator read from closing, at 86% and 88% |
| Numbered `067`, not `059` | `059` through `066` are reserved for the Notion refinements. `create.sh` allocated `059`; it was renamed and the parent's phase map corrected in the same pass |
| Every P0/P1 claim re-verified against the tree before it became a threshold | A finding is a hypothesis. Three of the loop's claims were wrong: P0-2's threshold contradicted the true-up row it cited, the commit-id "discrepancy" was three commits with three roles, and `051` AC-011's *"no scrim exists"* was stale |
| Three findings corrected against landings on `main`, not shipped stale | Rebasing found them. `ae4fff81` closed `048` T025's depth-3 captures, so T020 keeps only the replace-pair capture. `311f957a` landed the motion timing band row, and the real defect is sharper than the reported one — the row pins the current 260ms, so correcting the value takes it red. `93205d4d` measured the stacked-parent dim at 0.717, inside the true-up's band, so AC-003 raises the page dim and *holds* the parent rather than treating both as red |
| The depth cap redirects via an opt-in `replace` callback, not a hard block in `overlayStack` | A literal depth block in `register()` would have fired on the two menu-stack survivors (`record column submenu`, `import confirm dropdown chain`) as readily as on the two convert pairs — nothing in the stack itself distinguishes them. Scoping the cap to whether the PARENT registered a `replace` callback (which only `panel`/`condition panel`-role `createSurfaceShell` consumers do) makes the exemption structural rather than a role check `overlayStack` would have to import `surface-shell.ts` to perform — and `overlayStack.test.ts`'s own pre-existing three-deep-stack test needed no change, confirming the default (no `replace` set) is unchanged behaviour |
| The scrim's exit removal stays synchronous | An initial implementation deferred the backdrop's actual removal by the exit duration so the fade could be seen. It broke `sheet-teardown.mjs` (every producer read as leaking a backdrop) and ~12 `verify-placement.mjs` checks that assert the backdrop is gone the instant a dismissal returns. Reverted: the `--db-sheet-exit` token and its transition/keyframe rules still exist and are asserted live, but nothing in the teardown contract was made asynchronous to use them |
| `readReplacementTitle`'s scrape walks candidates by first non-empty text, not `querySelector`'s first DOM-order match | Found while proving the replace producer live: a real `Modal`'s native, empty `.modal-title` sorts ahead of a real heading in document order, so the original `querySelector(".db-panel-title, .modal-title, h1, h2, h3")` silently returned an empty string for any child with a native title element still present — which is every real `Modal` subclass. Fixed as part of T005 rather than shipped with the bug it was found carrying |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Red-first anchors verified against the tree at `6b16b87a` | PASS — every P0 and P1 threshold confirmed failing by direct read, `file:line` in `acceptance-criteria.md`, before its fix landed |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npm run build` | PASS — exit 0 |
| `npx vitest run` | PASS — 1603/1603 tests, 149/149 files, on the rebased tree |
| `node tools/live/sheet-grammar.mjs` | PASS — exit 0, including the new depth-cap, scrim-alpha (page + menu), motion-band + motion-exit-band, row-pitch and handle-geometry rows and their negative controls, plus all three registered FuzzySuggest surfaces on all 8 grammar columns |
| `node tools/live/render-assertions.mjs` | PASS — exit 0 |
| `node tools/naming/scan-comments.mjs` | PASS — exit 0, no artifact-id violations |
| `node tools/naming/scan-failing-values.mjs` | PASS — exit 0 |
| Landing verification at 402px, through the shipped modules | The depth cap holds (2 sheets before and after a three-deep `panel` chain, content grafted, title swapped, back control shown and reversible; a `dialog` chain still stacks to 3) — but the absorbed panel was still being placed as its own sheet, **repaired here**. Scrim measured off decoded PNGs: page under a first sheet **0.521 light / 0.533 dark**, stacked parent **0.7065 dark / 0.7580 light** against **0.7074 / 0.7575** on the pre-packet tree. Handle 34.0x5.0 at a 6.0 drop; close 44x44; phone row pitch 48px against the 44px floor. T006 **refuted**: no production `menu`-family surface carries `db-mobile-menu-card` or loses its handle |
| Mutation testing, one per new surface | The three depth-cap unit tests go red when the cap's threshold moves (`>= 2` -> `>= 3`); the scrim-alpha, menu-scrim-alpha, motion-band, motion-exit-band, row-pitch and handle-geometry lane rows each go red when their own stylesheet value is mutated; the two new depth-cap geometry assertions go red when the placement guard is removed, while the four structural ones stay green |
| `npm run gate` (foreground, exit read from `$?`) | **PASS — 26/26 lanes green**, 0 red for a declared reason. Two lanes needed real follow-up work beyond the code change itself: `screenshots-fresh` (a full recapture on the rebased tree, 604 entries; 21 real content changes reviewed and named, 22 byte-only re-encodes restored to their committed bytes) and `css-lane` (handed over from `063-notion-dropdown-refinement` to this phase, in `tools/lane/css-lane.json`'s own history). `sheet-teardown` and `verify-placement` briefly regressed during implementation (a deferred scrim-removal attempt broke synchronous-teardown assumptions in both) and were fixed by reverting the deferral, not by loosening either check |
| **Follow-up leg** — `npx tsc --noEmit` | PASS — exit 0 |
| **Follow-up leg** — `npx vitest run` | PASS — 1607/1607 tests, 149/149 files (one transient failure caught and fixed mid-session: a new comment in `sheet-grammar.mjs` started with the word "class" followed later by a parenthesis, tripping `scan-comments.mjs`'s commented-out-code heuristic — `tools/naming/scan-comments.test.mjs`'s own CLI-contract test caught it; reworded, not suppressed) |
| **Follow-up leg** — `node tools/live/sheet-grammar.mjs` | PASS — exit 0, plus one new permanent row: the menu-role parent-dim band read on all four production surfaces (`owned-menu`/`date-picker`/`icon-picker`/`option-color-picker`, all 0.390). A page-pull-back row was added and then removed when the underlying feature was reverted |
| **Follow-up leg** — `node tools/live/render-assertions.mjs`, `node tools/live/sheet-teardown.mjs`, `node tools/live/touch-targets.mjs` | PASS — exit 0 all three. `touch-targets` needed a real fix mid-session: `record-peek`'s table footer trigger measured under its 44px floor because the (later-reverted) page-pull-back transform shrank it visually behind the open sheet's own scrim; fixed by skipping elements behind an active `.db-page-pulled-back` container in `touch-target-measure.mjs`'s shared walk — left in place since it is a correct, general exemption (a scrim-covered control is not a small target, it is an uncovered one) independent of the reverted feature |
| **Follow-up leg** — `node tools/storybook/verify-placement.mjs` | PASS — exit 0, 413/415 (2 red for a declared reason, the pre-existing baseline). This is what caught the page-pull-back regression: two sections crashed outright (`TypeError: Cannot read properties of null`, reading the now-absent handle) and, once unblocked, eleven more genuinely failed — nine because a menu sheet no longer drags or carries a handle (rewritten to assert the new contract, using a plain draggable sheet fixture where the test's real subject was the drag/flick mechanism rather than anything menu-specific) and the keyboard-lift/selection-bar ones because of the page-pull-back containing-block bug (resolved by the revert, not by a test change) |
| **Follow-up leg** — `node tools/naming/scan-comments.mjs`, `node tools/naming/scan-failing-values.mjs` | PASS — exit 0 both (one artifact-id violation and one commented-out-code false-positive introduced by this session's own comments, both fixed by rewording, not by loosening the scanner) |
| **Follow-up leg** — `npm run screenshots` + css-lane acquire/review/release, run TWICE | First pass (with page-pull-back still present): 48 files moved on a 606-entry recapture (baseline `4edd4f3da2ef` -> `db7a393f8759`); 19 real by decoded pixel delta, named; 2 excluded (see below); 26 pixelHash-identical restored. Page-pull-back was then reverted (styles.css moved again, `db7a393f8759` -> `191652d50658`), so the lane was acquired and recaptured a SECOND time rather than hand-editing the first release's file list: 38 files moved, of which 12 are real (byte-for-byte the same decoded-pixel numbers as the first pass for the same files — the menu-card fix that produces them is unchanged by the revert) and 26 are pixelHash-identical, restored. The 7 files that moved ONLY because of the (now-reverted) page-pull-back — `constructed-toolbar-add-view-mobile-{dark,light}`, `constructed-toolbar-utilities-mobile-{dark,light}`, `constructed-board-groups-panel-mobile-{dark,light}`, `constructed-record-peek-mobile-light` — no longer move at all and are folded back into the restored set. Both passes exclude `field-icon-picker-desktop-{dark,light}`: origin/main's `9d798c69` already recaptured and reviewed these as part of a different, unrelated 4-file fix this worktree (8 commits behind) does not yet have; claiming them from a stale base would fight that commit's rebase rather than help it. The 32 protected Project Manager entries carry no content change in either pass. `SURFACE_PHASE=067-sheet-family-remediation node tools/lane/check-lane.mjs` exits 0 against the final (second) release |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Nothing here is device-confirmed.** AC-011 is the operator's and untouched by this session —
   the family is built and gate-verified against a repository read, not a device read.
2. **T005's replace producer is now also verified through one of the two NAMED lane pairs' own
   real call graph, on a second follow-up leg.** `properties property type picker`'s
   `REGISTERED_STACKED_PAIRS` entry is unchanged (still the synthetic two-hop stand-in, still
   green) — retargeting the SHARED 18-assertion battery every one of the 32 registered pairs
   shares was still judged too wide a blast radius for one pair whose absorbed outcome that
   battery does not fit. Instead, a dedicated, additive check
   (`tools/live/sheet-grammar.mjs`, "properties property type picker — the real call graph under
   the depth cap") drives the SAME real modules: a real column-manager parent, a real
   `createSurfaceShell({ role: "panel" })` consumer for the "Create property" hop (the exact call
   the production `CreatePropertyModal` class makes), and the real `openDropdownMenu`. Measured: 1
   sheet before, 2 after the real panel opens, still 2 (not 3) after the real dropdown opens —
   confirming zero production code changes were needed, since the mechanism is role-driven rather
   than per-consumer. A `dialog`-role negative control confirms the same real dropdown DOES stack
   to 3 over a hop that never offers a replace. `add view property picker` needed no equivalent
   check — traced this leg and confirmed its own registered two-level shape already matches its
   real production chain exactly (a real toolbar/add-view sheet, a real `createDropdownField`
   picker for an existing column, no synthetic stand-in anywhere in it, no third level for the cap
   to reach).
3. **T006 is now closed on the follow-up leg — the class-stripping regression is fixed and
   measured on all four production surfaces.** `setSheetMount`'s toggle is add-only, so a
   placement pass with `menuCard` undefined no longer undoes a class `mountPickerSheetHeader`
   already set. Measured at 402px: `owned-menu`, `date-picker`, `icon-picker` and
   `option-color-picker` all carry no handle, a 44.0×44.0 close target and a parent dim ratio of
   0.390. **The anchored-vs-docked geometry half is deliberately declined, not merely deferred**:
   tried at the desktop popover's own narrow width, it measured 24 overflowing calendar-grid cells
   and a broken keyboard-avoidance handoff, because the picker bodies these four surfaces share
   were built for the full-width docked sheet, not a narrower anchored card. Recorded in
   `decision-record.md` ADR-002 with a pin left at `popover-position.ts`'s `mobileSheet` branch;
   narrowing each picker body for a card's footprint is a separate, larger change.
4. **ADR-003's `scale(0.96)` extension to the first-sheet page was attempted, reverted, and then
   dropped by the operator — it broke a real, unrelated behaviour, and is now a closed question
   rather than an open gap.** `setPagePulledBack` applied `transform: scale(0.96)`
   directly to `.note-database-container`, and a CSS `transform` on an element creates a new
   containing block for every `position: fixed` descendant of it. `.db-cell-selection-pill` (the
   row-selection bar) is `position: fixed` and lives inside that container, so it stopped
   positioning against the viewport the instant the transform landed — caught by
   `tools/storybook/verify-placement.mjs`'s pre-existing keyboard/selection-bar checks (no update
   needed to catch it) reading 1545px/1940px against an 844px viewport instead of ~513px. Fully
   reverted: the function, its two `syncSheetStack` call sites, the CSS rule and the lane row
   asserting it are all removed rather than left half-shipped. The already-shipped stacked-parent
   cue does not have this problem because it transforms the sheet's own children
   (`> :not(.db-mobile-bottom-sheet-handle)`), never the sheet or a shared container — a future
   attempt at the first-sheet case needs an equivalent inner wrapper, which
   `.note-database-container` does not currently have (every renderer builds directly into it).
   Full reasoning in `decision-record.md` ADR-003, amended on the operator's 2026-09-07 ~14:50
   ruling to **Accepted-as-amended**: the page dim clause stands, the pull-back clause is
   withdrawn, and the "safe re-attempt" note is retained as the record of what the attempt cost,
   not as a plan. The `.db-page-pulled-back` exemption this attempt had added to
   `tools/live/touch-target-measure.mjs` is removed with it, so no reference to the dropped class
   survives anywhere in `src`, `styles.css` or `tools`. **The light-theme stacked-parent figure
   (was 0.758, from AC-003) is now closed, on a second follow-up leg.** The theme-scoped
   darkening mechanism this limitation identified but did not implement — `filter: brightness()`,
   reset for dark — now ships: `filter: brightness(0.93)` on `.is-stack-parent`, `filter: none`
   under `.theme-dark`. Measured off decoded PNGs against the same control pair: light **242 →
   171, ratio 0.707** (was 183/0.758), dark **46 → 33, ratio 0.717** (unmoved). Both inside 0.710 ±
   0.02. A permanent lane row (`tools/live/sheet-grammar.mjs`, "stacked-parent filter") asserts the
   computed value directly with a negative control; `node tools/live/sheet-grammar.mjs` exits 0.
5. **T015's header-block clause narrowed but is still open; T020 closed for one of the two named
   pairs; the pairs' own rewiring closed for one of them — all on a second follow-up leg.** The
   header block's 20px top margin was swept live from 0 to 20px against a real hit-test
   (`tools/storybook/verify-placement.mjs`'s "add view: the sheet's grab band is a thumb-sized
   target"): below 6px the close button is swallowed, confirming the margin's own reasoning; 6px
   is the safe floor, measuring 77px (was 91px) against the 66-74px target — narrower, still red.
   The residual gap is bounded by the shared grab-band geometry or by reopening the already-closed
   handle-drop geometry, neither in this leg's file group. `properties property type picker` in
   `REGISTERED_STACKED_PAIRS` still asserts its pre-existing stack shape (unchanged, still green),
   but now has a DEDICATED, ADDITIVE check proving its own real production call graph — a real
   column-manager parent, a real panel-role `createSurfaceShell` consumer, a real dropdown —
   respects the depth cap, with a negative control proving the check can tell a capped case from
   an uncapped one. `add view property picker` needed no equivalent: traced this leg and confirmed
   real at its own native two-level depth, with no third level for the cap to reach. The
   replace-pair capture scenarios (T020) are closed for `properties property type picker` (before
   and after, both themes, opened and read) and not applicable to `add view property picker` (no
   third level to replace). `buildPrimaryActionPill`/`buildShellHeaderChip` were reviewed on the
   first follow-up leg and deliberately kept as documented producers rather than removed or
   force-wired, matching T018's `heightRole` precedent in this same packet — unchanged this leg.
6. **T021's divider audit is partial — a styles.css reading, not a reference-capture comparison.**
   The leading-icon row case has a real mechanism (`.db-menu-item`'s inset hairline) that matches
   the described shape. The plain-row symmetric-20pt case has no mechanism at all anywhere in the
   stylesheet. The between-section full-bleed case is ambiguous: the existing separator carries an
   8px margin, not a literal 0, and whether that counts as "full-bleed" against the reference was
   not checked against an actual capture.
7. **T019's focus-restoration wiring has no dedicated unit test.** `mobile-bottom-sheet.ts` has no
   jsdom-backed suite; the anchor-capture logic is verified by code reading and by the live lane's
   mount/dismiss cycles staying green, not by an assertion on `document.activeElement` capture
   specifically.
8. **`design-system.md` §7 is stale on the scrim**, stating *"There is no sheet scrim … A scrim is
   new construction"* when one has shipped since `048`. Named here rather than fixed: the design
   system is the parent's document and this packet does not own it.
9. **This worktree is 8 commits behind origin/main**, missing (among others) `9d798c69`, which
   already recaptured and reviewed 17 sheet-family captures plus 4 icon-picker ones as a byproduct
   of an unrelated packet's (`064`'s) own evidence regeneration. This session's own css-lane
   release explicitly excludes and restores the 2 of those (`field-icon-picker-desktop-{dark,
   light}`) that this session's own recapture also happened to move, rather than claim them from a
   stale base — the eventual rebase onto `main` carries the real fix. `pixelHash` is not trusted as
   proof of "unchanged" anywhere in this packet's own recapture review; every judgement used
   decoded pixel delta (changed-pixel count, max channel delta) against the committed PNG instead.
<!-- /ANCHOR:limitations -->

---


