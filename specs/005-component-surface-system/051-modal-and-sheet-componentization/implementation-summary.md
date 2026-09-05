---
title: "Implementation Summary: Modal and Sheet Componentization"
description: "What this packet has produced so far — T001's capture read and the four packet rows it corrected — and what remains unbuilt, which is all of the code."
trigger_phrases:
  - "051 implementation summary"
  - "shell primitive progress"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-05T22:00:00Z"
    last_updated_by: "landing-verifier"
    recent_action: "Verified and landed T003-T007: the shell primitive on main"
    next_safe_action: "Begin T008 — declare a title and a shell role on the 13 sheet subclasses"
    blockers:
      - "Every criterion except AC-004 is still Unmet; the shell exists and no producer consumes it"
      - "T010 stays blocked on spec.md §11's second open question, which no capture can answer"
      - "AC-012's E4 row needs the operator's ruling before the parity rule can read Met"
    key_files:
      - "src/views/surface-shell.ts"
      - "src/views/surface-shell.test.ts"
      - "src/views/modals/db-modal.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/design-trueup.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-impl"
      parent_session_id: null
    completion_pct: 35
    open_questions:
      - "Do the three FuzzySuggestModal subclasses join the shell or stay Obsidian-native behind a shim?"
    answered_questions:
      - "ADR-002's per-pair list: two of thirty-one registered pairs convert to an in-place sub-page"
      - "AC-003's tolerance is per-axis: width and anchored edge hold, cross-axis extent does not"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 051-modal-and-sheet-componentization |
| **Status** | Draft |
| **Completed** | Not complete — opened 2026-09-05; T001-T007 landed the same day, T008 onward unstarted |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**The shell primitive exists and nothing consumes it yet.** Seven tasks have landed: T001 and T002
are the evidence pair, T003 the parity baseline, and T004-T007 the shell itself.

`src/views/surface-shell.ts` is the one definition. It resolves the presentation, resolves the title
behind a **counted** scrape fallback, composes `attachSheetChromeToModal`, `placeSheet` and
`keepSheetPlaced` from the two engine modules in one order, tears down idempotently, carries the
measured geometry and the motion band as named constants, and owns a pure replace-in-place sub-page
stack with a three-slot header. It reimplements none of the engine: the chrome, the drag-to-dismiss,
the placement and the keyboard-aware reposition loop stay where they were and this module calls them.
`DbModal.applyPresentation` no longer resolves touch, the sheet parent, or the engine — it builds one
shell and re-applies it, which is why four raw `attachSheetChromeToModal` call sites now read as two
decision-making groups: the shell, and three outlier `FuzzySuggestModal` callers T010 has not reached.
`surface-shell.test.ts` carries 21 tests and 51 assertions.

**What is deliberately not wired.** No surface declares a title, so the fallback counter is exercised
on every phone-sheet resolution rather than driven down. No producer calls `pushSubPage`, because the
sub-page host is `view-config-panel-renderer.ts` and that file belongs to a later leg. No transition
reads `SHELL_ENTER_MS` or `SHELL_EXIT_MS`, so every surface's motion is unchanged. The result is a
primitive with one consumer for its presentation switch and none for anything else, which is why
**every criterion except AC-004 is still Unmet** — the shell is built, and the family has not moved
onto it.

T001, the packet's evidence task, produced:
`design-trueup.md`, the surface inventory the packet drafted as `modal-surface-inventory.md` and
which changed its filename and nothing else.

What it contains:

- **35 census rows** — the 20 `extends DbModal` subclasses, the 3 `FuzzySuggestModal` subclasses
  outside `DbModal`, the 12 independent `createSheetHeader` sites — each with surface, shell role,
  presentation, changes, the Anytype capture filename or the named gap, and what stays ours. Twenty
  five name a capture; **ten carry "design inferred from source code, not seen"** and mean it.
- **The per-pair ADR-002 ruling** for all thirty-one registered stacked pairs. Two convert to an
  in-place sub-page; twenty-nine keep `048`'s stacking, ten of those because nothing equivalent was
  captured.
- **The measured value tables**, desktop and phone. The desktop half was re-measured off a second
  capture set and came back identical to `050`'s. The phone half had never been measured, because
  `050` was written before the 118 iOS captures landed.
- **Nine contradictions**, each named with the file that shows it, eight resolved in the capture's
  favour and one against — which is why ADR-005 exists.

**What that changed in the packet.** Four rows, all inside existing requirements: REQ-003 gained a
third navigation move and lost a tolerance nobody could have observed failing; REQ-004 is Met;
REQ-006 gained the phone half of the shell's geometry; ADR-002 gained its list. ADR-005 is new.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

T001 opened the capture files rather than citing them. 151 desktop states in `screenshots/anytype/`,
600 menu files in `screenshots/anytype/desktop/menus/`, 118 iOS sheet files in
`screenshots/anytype/mobile/`, plus our own renders under `screenshots/notion-clone/`. Panel edges
were found by scanning for the border colour, row pitch by ink-band grouping, colours by per-pixel
sampling, contrast by computation from the sampled hex, and the scrim by dividing the luminance of
the same bands with and without the sheet present. The iOS files are 1206 × 2622 at 3×, so every
phone number is stated in pt after dividing by three; a number taken off those files without that
division is wrong by 3× and the row heights read as 150.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Where |
|---|---|
| The sheet engine stays and the shell composes it | ADR-001 (Proposed) |
| A sub-page replaces in place, per pair, with the list of two converts out of thirty-one | ADR-002 (Accepted) |
| The confirm primitive is this packet's and is the only one | ADR-003 |
| `fullscreen` survives only for the formula workbench | ADR-004 (Accepted) |
| `044`'s 44px phone close survives every contradicting capture, because the handle it would be replaced by measures 2.21:1 | ADR-005 (Accepted) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|---|---|
| `validate.sh <this folder> --strict` | first `RESULT:` PASSED |
| Every cited capture resolves under `screenshots/anytype/` | 35 of 35 rows, and all 31 pair rows |
| Census row set diffed against `goal.md` §3 | 20 + 3 + 12 = 35, no surface absent |
| `npm run gate` | **exit 0**, `PASS — 26 green, 0 red for a declared reason` — run at the landing, after the rebase onto `d00cf59c`, with an isolated log |
| `npx tsc --noEmit` · `npm run build` | 0 and 0; the build leaves no tracked diff |
| `npx vitest run` | 0 — **1329 passing across 125 files** |
| `node tools/screenshots/verify.mjs` | 0 — 558 entries current |
| Red-first proofs, re-observed rather than quoted | Deleting `surface-shell.ts` fails the suite on the missing import; mutating `SHELL_ROW_HEIGHT_PX` to 32 and dropping the `!hasSheetParent` guard turns exactly 2 of 21 tests red, then green again on restore |
| Project Manager parity (parent D5) | **0 of 558** capture `pixelHash` values differ from the base commit's, the 32 board and gantt entries included. An intermediate rebase showed one mover; it was proven to be the capturing environment rather than this block, and the base's own recapture has absorbed it |
| Cascade audit, as the independent read of the CSS block | `sheetLines` 23126 → 23172, `rules` 3034 → 3040, `duplicatedSelectors` **261 unchanged**, `conflicts` **126 unchanged** |
| Engine parity, re-derived in the same pass | **Not deterministic**, which is the finding rather than the number: 66 differences on one invocation and 50 on each of the three that followed, on an unchanged tree, with the checkbox fixture caught mid-transition changing identity each run. No improvement is claimed from it |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The shell is built and unconsumed.** Twenty of twenty surfaces still have their titles scraped,
  no producer pushes a sub-page, no transition reads the motion constants, and no confirm primitive
  is exported — which is why `053` and `055` both still name one that is not there. Three outlier
  `FuzzySuggestModal` callers still reach the engine directly.
- **The shell's DOM half has no unit coverage.** `buildShellHeader`, its back control and the header
  refresh are the only markup this leg ships, and they are proven by two Storybook stories and by
  nothing that runs in the gate. The suite says a live document would be needed;
  `overlay-stack.test.ts` shows the hand-built stand-in this repository already uses for exactly
  that, so the gap is a choice rather than a constraint. Six of the 21 tests are source-text
  assertions, which pin the module's shape and assert nothing about its behaviour.
- **The three-slot header centres the title unconditionally.** That is the phone reference
  (`anytype-mobile-sheet-view-edit-dark.png`); the desktop reference
  (`anytype-menu-set-view-layout-dark.png`) puts `‹ Layout` on the leading edge instead. Nothing is
  wrong today, because the header is built only on the sheet path — but the CSS is not scoped to the
  phone, so the first desktop producer inherits a centring the reference does not show.
- **Ten of the thirty-five rows have no reference at all**, including row 1, the confirm — the
  subject of AC-005. No destructive confirm appears in the 118 iOS states or the 600 menu files, and
  the desktop crawler refuses destructive actions by name. Their designs stay inferred from source.
- **`spec.md` §11's second open question is unanswerable from captures.** Whether the three
  `FuzzySuggestModal` subclasses join the shell or stay Obsidian-native behind a shim is a question
  about our host application, and the reference has no host. T010 stays blocked.
- **One measured value carries a real regression surface.** The phone frame's 8pt inset moves every
  `sheet-grammar` selector that reads a sheet's rect, so it may only land in the leg that updates
  those rows, never earlier.
- **No timing was measured and none could be.** Every motion figure remains `050` §4's reconciled
  band, labelled as a source read. A static capture carries no duration.
<!-- /ANCHOR:limitations -->
