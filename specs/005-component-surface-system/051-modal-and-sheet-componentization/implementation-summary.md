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
    last_updated_at: "2026-09-06T08:15:00Z"
    last_updated_by: "implementer-session"
    recent_action: "Exported the confirm primitive, wired both lane rows to it, added the edge-control-token row"
    next_safe_action: "T015: add the primary-action, trailing-chip and motion-timing lane rows"
    blockers:
      - "AC-004/AC-005 are Met; the rest of the criterion set still needs the sub-page producer, motion consumption and the remaining geometry lane rows"
      - "T010 stays blocked on spec.md §11's second open question, which no capture can answer"
      - "AC-012's E4 row needs the operator's ruling before the parity rule can read Met"
    key_files:
      - "src/views/surface-shell.ts"
      - "src/views/surface-shell.test.ts"
      - "src/views/modals/db-modal.ts"
      - "src/views/modals/confirm-modal.ts"
      - "src/views/confirm-sheet.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "tools/live/sheet-grammar.mjs"
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/design-trueup.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-impl"
      parent_session_id: null
    completion_pct: 55
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
| **Completed** | Not complete — opened 2026-09-05; T001-T007 landed the same day, T008/T009/T011/T012/T016/T017/T020 landed 2026-09-06, T013/T014 landed 2026-09-06 (fourth landing), T015 partial (two of its four named gaps closed, one clarified as already covered elsewhere, one open pending a producer), T010 blocked on the operator, T018 the operator's device pass, T019 this reconciliation |
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

**What is deliberately not wired.** No producer calls `pushSubPage`, because the sub-page host is
`view-config-panel-renderer.ts` and pushing to it is not named by any of T008-T012. No transition
reads `SHELL_ENTER_MS` or `SHELL_EXIT_MS`, so every surface's motion is unchanged. **Every criterion
except AC-004 is still Unmet** — the numbers moved (declared titles, the header shape) without any
threshold's own target being reached yet.

**T008, T009, T011 and T012 landed 2026-09-06: the family starts declaring instead of scraping.**
`DbModal` gained `getDeclaredTitle()`/`getShellRole()`, both defaulting to `undefined` so an
undeclared surface still routes through the counted scrape fallback exactly as before. Seventeen of
the twenty `DbModal` subclasses now override both — the thirteen T008 names plus the three fullscreen
subclasses ADR-004 moves onto the shell's ordinary presentation (`ChartDrilldownModal`,
`InvalidTimeEventsModal`, `PropertyTypeConflictModal`) and `FormulaModal`, which keeps `fullscreen`
and declares alongside it. `CreateLinkedViewModal`'s old `getSheetTitle` override — a scrape-family
method masquerading as a declaration — is gone rather than left beside the new one. Every declared
title is the exact expression its own heading already rendered, so no surface's visible text moved.
The three subclasses still scraping (`CsvMarkdownImportModal`, `CsvMarkdownExportModal`, the anonymous
restore modal) are not named by any task from T008 onward, so they are an honest remainder, not a
miss.

Eleven of the twelve independent `createSheetHeader` sites now call the shell's own
`buildShellHeader` instead of the engine's two-slot builder directly — every site `design-trueup.md`
§5c names except the engine's own default builder, which stays the engine's. `buildShellHeader`
gained a `beforeClose` passthrough so the three sites with their own trailing controls
(`toolbar-primitives.ts`, `filter-panel-renderer.ts`, `column-manager-renderer.ts`) keep them. A
recapture and its own read caught what a first pass missed: several of these renderers build the
same header on the desktop popover, not only the phone sheet, and an unscoped leading slot pushed
every one of those desktop titles right by a gap the desktop reference does not show. The fix scopes
the leading slot's width and the title-centring rule to `body.is-phone`, and folds the three fresh
44px literals the landing verification flagged into one shared `--db-shell-edge-control-size` token
`.db-sheet-close` now reads too. Recaptured three times chasing that regression down; the final
capture set moved 30 files, every one a mobile-only surface this leg touched. The true desktop
statement is narrower than "zero layout changes": 15 desktop entries moved `layoutHash` — the
leading slot `buildShellHeader` adds is `display: none` there, a zero-rect element that still
changes the DOM tree the hash walks — and 0 moved `pixelHash`. Pixel identity, not layout-tree
identity, is the evidence a desktop capture did not visibly move; the 32 Project Manager
board/gantt entries parent D5 protects are unchanged by either measure.

**Second landing verification, 2026-09-06**, closes the four defects the first landing found: the
title-centring fix above (grouping every trailing child into `db-shell-header-trailing` and laying
the header out as a phone-only `1fr auto 1fr` grid) replaced the leading-slot-width approach this
section describes, because the width approach could not survive a trailing box wider than the
leading slot (`constructed-column-manager`'s "Properties", 27.67px off centre); the nine remaining
raw header sites (`column-width.ts`, `chart-toolbar-renderer.ts` ×4, `toolbar-renderer.ts` ×2,
`view-config-panel-renderer.ts` and `column-manager-renderer.ts`'s second headers,
`record-surface/record-header.ts`) now call `buildShellHeader` too, with the two calendar files
(`057`'s, in flight) named rather than touched; and REQ-006's C10 floating/flush frame split is
implemented for the first time. A full recapture against the combined result moved 47 files'
`pixelHash` (up from 30 — the wider header census and the C10 geometry both reach surfaces the
first pass's capture did not touch) and 16 more `layoutHash` only; the 32 Project Manager
board/gantt entries stayed `pixelHash`-identical throughout, 32 of 32.

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
| **T008-T012, 2026-09-06**: `npm run gate` (isolated log) | **exit 0**, 26 green, 0 red, re-run after the header migration, the CSS-lane handover and the third recapture |
| `npx tsc --noEmit` · `npm run build` | 0 and 0; `main.js` carries the tracked diff this leg's behaviour change produces |
| `npx vitest run` | 0 — **1370 passing across 127 files** (41 more than T007's landing: the role getter, the 17-file and 11-file source-text suites) |
| `node tools/lane/check-lane.mjs` | 0 — `stylesheet unchanged since the lane was taken`, release names all 30 changed captures |
| `node tools/live/evidence.mjs --check-all` | 0 — 15 of 15 artefacts fresh, all eight the stylesheet move staled re-derived |
| Red-first proofs, re-observed rather than quoted | Deleting `surface-shell.ts` fails the suite on the missing import; mutating `SHELL_ROW_HEIGHT_PX` to 32 and dropping the `!hasSheetParent` guard turns exactly 2 of 21 tests red, then green again on restore |
| Project Manager parity (parent D5) | **0 of 558** capture `pixelHash` values differ from the base commit's, the 32 board and gantt entries included. An intermediate rebase showed one mover; it was proven to be the capturing environment rather than this block, and the base's own recapture has absorbed it |
| Cascade audit, as the independent read of the CSS block | `sheetLines` 23126 → 23172, `rules` 3034 → 3040, `duplicatedSelectors` **261 unchanged**, `conflicts` **126 unchanged** |
| Engine parity, re-derived in the same pass | **Not deterministic**, which is the finding rather than the number: 66 differences on one invocation and 50 on each of the three that followed, on an unchanged tree, with the checkbox fixture caught mid-transition changing identity each run. No improvement is claimed from it |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The shell now has consumers for three of its five behaviours.** Seventeen of twenty surfaces
  declare a title and a role (T008/T009); eleven of twelve independent header sites call the shell's
  header builder (T011); the confirm primitive is exported and consumed (T013/T014, fourth landing) —
  `src/views/confirm-sheet.ts`'s `buildConfirmSheetBody` and `modals/confirm-modal.ts`'s now-exported
  `ConfirmModal`, both `053`'s sort-conflict confirm and `055`'s destructive-confirm call sites already
  routing through the `confirmWithModal` wrapper around it. No producer pushes a sub-page and no
  transition reads the motion constants. Three outlier `FuzzySuggestModal` callers still reach the
  engine directly, and T010 stays blocked on the operator: `spec.md`'s own reconciliation log says the
  question is unanswerable from any capture, because Anytype has no host application to be native to.
- **The shell's DOM half has no unit coverage.** `buildShellHeader`, its back control and the header
  refresh are the only markup this leg ships, and they are proven by two Storybook stories and by
  nothing that runs in the gate. The suite says a live document would be needed;
  `overlay-stack.test.ts` shows the hand-built stand-in this repository already uses for exactly
  that, so the gap is a choice rather than a constraint. Six of the 21 tests are source-text
  assertions, which pin the module's shape and assert nothing about its behaviour.
- ~~**The three-slot header centres the title unconditionally.**~~ **Corrected 2026-09-06 (T011).**
  The centring rule and `.db-shell-header`'s `justify-content: flex-start` are now scoped under
  `body.is-phone`, matching the phone reference (`anytype-mobile-sheet-view-edit-dark.png`) without
  reaching a desktop consumer, which the desktop reference (`anytype-menu-set-view-layout-dark.png`,
  `‹ Layout` on the leading edge) does not show. The same leg also replaced the three fresh 44px
  literals the landing verification flagged (`.db-shell-header-leading`'s `min-width`,
  `.db-shell-back`'s `width`/`height`) with one shared `--db-shell-edge-control-size` token, also
  adopted by `.db-sheet-close`.
- **Ten of the thirty-five rows have no reference at all**, including row 1, the confirm. No
  destructive confirm appears in the 118 iOS states or the 600 menu files, and the desktop crawler
  refuses destructive actions by name. Their designs stay inferred from source — this is unaffected by
  AC-005 reading `Met`, which is about the primitive existing and being exported, not about a capture
  for its own design existing. **AC-012's E4 row is still the operator's**: whether a destructive
  confirm is shown at all remains open; the primitive built here is what any confirm the operator
  keeps would use, not a decision on whether one stays.
- **`spec.md` §11's second open question is unanswerable from captures.** Whether the three
  `FuzzySuggestModal` subclasses join the shell or stay Obsidian-native behind a shim is a question
  about our host application, and the reference has no host. T010 stays blocked.
- **One measured value carries a real regression surface.** The phone frame's 8pt inset moves every
  `sheet-grammar` selector that reads a sheet's rect, so it may only land in the leg that updates
  those rows, never earlier.
- **No timing was measured and none could be.** Every motion figure remains `050` §4's reconciled
  band, labelled as a source read. A static capture carries no duration.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:third-landing -->
## Third landing verification, 2026-09-06

A fresh verifier re-measured the second landing's claims against the images and the running code
rather than against its report. Four held, three did not.

**Held.** Title centring: the live lane measures every one of the eleven header-bearing surfaces
within **0.01px** of its frame centre, and its negative control — the old two-slot flex rule
restored in the page — measures **27.67px** off on `column-manager`, so the grid rule is
load-bearing rather than merely present. In the captures at DPR 2 the same surface reads **1.5
device px** off the frame centre where the pre-fix image read **52.5 device px** off; `filter`,
`sort` and the option colour picker read 2.5, 1.5 and 2.0, and the sheet's own centred grab handle
sits at 403.5 in all four, so the residual is glyph ink asymmetry rather than layout. The nine
migrations: `rg` finds **zero** raw `db-panel-header`/`db-panel-title` construction left outside
`mobile-bottom-sheet.ts`'s own builder. C10's frame shapes: measured in the captures, a floating
sheet is inset **16 device px** on left, right and bottom with the scrim visible around it and a
**32 device px** radius fitted on all four corners; a flush sheet is inset 0 with a 16 device-px
radius on its top corners only and square below. The stacked-pair surfaces still pass — 13
surfaces and 31 pairs, exit 0 — and every stacked child over a floating parent measures inside its
own client width on both engines.

**Did not hold, corrected here.**

- **"Zero layout changes on desktop" is still wrong, in the other direction.** Seven desktop
  captures move `pixelHash`, not zero: `constructed-chart-toolbar-options`, `constructed-view-config`
  and `constructed-board-card-properties` at both themes, plus `constructed-column-width-adjuster`
  in light. The cause is not a regression but the migration itself — `buildShellHeader` always
  draws the close control, so a popover whose hand-built header had none now has one, exactly as
  the filter, sort and add-view popovers already did. The family is consistent on desktop rather
  than unchanged on it, and that is the honest statement. One desktop header did NOT take this
  change: `column-manager-renderer.ts`'s desktop branch keeps the componentized desktop builder a
  sibling packet landed, which is a better fit than the phone header and leaves that capture
  pixel-identical.
- **The `constructed-toolbar-add-view-mobile-dark` story was a race, not a shape change.** The
  second landing recorded that capture as moving to the flush shape and confirmed it "stable across
  three repeated captures". The committed file hashes to the **pre-fix** value, the manifest
  recorded a third value belonging to an image in neither commit, and 27 further entries had
  manifest byte counts describing files that were never committed. The producer: the capture
  pipeline waited two animation frames while the frame-shape classifier debounces for 80ms, so
  whether a sheet was photographed floating or flush depended on how long the fonts took. The
  shutter now waits for the classifier's own settle signal, and that scenario no longer moves at
  all. The manifest is regenerated from the images on disk — **0 byte and 0 pixelHash mismatches
  across 562 entries**.
- **The `sheet-rebuild` retry was hiding a real defect and its stated cause was wrong.** A 500ms
  sleep plus three attempts of the whole open-rebuild-tap sequence is retrying a failing assertion.
  Both are replaced by a wait on the settle signal, and the defect underneath then reproduced three
  times out of three: the lane read the "+ Add" coordinate as soon as the sheet's top edge held for
  two frames, and on WebKit's filter sheet the top held at 556 while the bottom sat at 733 on a
  660px screen — 73px below the viewport, mid-placement. The tap went to y=703 when the control had
  settled at y=622, reached the scrim, and dismissed the sheet. The wait now requires the sheet to
  be resting, not merely still.

**Measurements that answer the standing questions.** The shell path declares no raw geometry
literal for the phone close: `surface-shell.ts` exports `SHELL_PHONE_CLOSE_PX` and
`SHELL_TRAILING_CHIP_SIZE_PT` as named constants and the stylesheet declares
`--db-shell-edge-control-size: 44px` once, so AC-006's count over the shell's own rules is **0**.
No census ratchet was raised: `touch-targets-baseline.json` and
`touch-targets-constructed-baseline.json` are byte-unchanged, and the surface census moves only by
the one new class name this leg adds.

**Gate from the final state**, each exit status read from a file rather than a pipe:
`npx tsc --noEmit` 0, `npx vitest run` **1442/1442** in 137 files, `npm run build` 0,
`node tools/screenshots/verify.mjs` 0 with **562** current, `node tools/lane/check-lane.mjs` 0,
isolated `npm run gate` **PASS 26 green / 0 red** exit 0, `npm run replay` **28/28 held**,
`evidence.mjs --check-all` 15 of 15 fresh.
<!-- /ANCHOR:third-landing -->

---

<!-- ANCHOR:fourth-landing -->
## Fourth landing, 2026-09-06 — T013/T014 closed, T015 deepened

**T013 — the confirm primitive, exported.** `src/views/confirm-sheet.ts` (new) exports
`buildConfirmSheetBody`: a declared title, the message as a `.db-panel-row`, and an actions row of
cancel, an optional secondary action, then confirm — the destructive action carrying `mod-warning`.
`modals/confirm-modal.ts` now `export class ConfirmModal` (was module-private) and its `onOpen`
calls the shared builder instead of building the same three elements a second time. This was
possible without waiting on `055` because that packet's own migration onto `DbModal`/
`getDeclaredTitle`/`getShellRole` had already landed (`7663423b`); the two-writer collision the task
was left blocked on no longer existed, and E4 (whether a destructive confirm is shown at all)
stayed the operator's, untouched.

**The lane's own gap, closed.** `tools/live/sheet-grammar.mjs`'s `confirm` row already asserted all
seven grammar elements plus the dropdown column, but through markup hand-mirrored from
`confirm-modal.ts`'s onOpen — "kept in sync by the same discipline," per its own comment, not by
import. It now imports `buildConfirmSheetBody` directly, and its header is now `buildShellHeader`
(imported, wired through `attachSheetChromeToModal`'s `buildHeader` option exactly as
`createSurfaceShell` wires it), rather than the legacy two-slot builder. This closed a second gap:
`confirm` was excluded from `TITLE_CENTERED_SURFACES` because its old header shape had no
`.db-shell-header` to measure; `__shellHeaderCentering` gained a `confirm` branch mirroring
`__sheetGrammar`'s own, and the exclusion is lifted. **Red-then-green, observed directly rather than
assumed**: reverting the header's `buildHeader` wiring took `node tools/live/sheet-grammar.mjs` from
exit 0 to exit 1 (`FAIL confirm — no .db-shell-header title to measure`); restoring it returned exit
0, confirmed twice.

**T014 — the census, and it was mostly already true.** Every sort-conflict and destructive-confirm
call site (`database-view.ts`, `embedded-database-renderer.ts`, `column-operations.ts`,
`row-menu.ts`, `cell-editor-option.ts`, `status-options-modal.ts`, `formula-modal.ts`,
`settings.ts`) already called the exported `confirmWithModal` wrapper, not a hand-built dialog. What
T013 closed was the primitive underneath that wrapper being real and exported; T014's own remaining
threshold — a count of generic confirm bodies in `src/` — reads **1**: `confirm-sheet.ts:54` builds
it, `confirm-modal.ts` is its only consumer. Corrected on landing: the leg cited
`rg -n "db-modal-actions" src/ --type ts` for that count, and the class is not a confirm marker —
`grep -rn "db-modal-actions" src --include="*.ts"` returns seven producers, the other six being
button rows for modals with their own bodies (import picker, bulk quick-fix, export options,
cleanup list, conflict list, name field), none of them a yes/no confirm.

**T015 — one more permanent row, and the other three candidates dispositioned.** Of the four gaps
the last landing named still open: the **confirm grammar** closes with T013 above (fidelity, not a
new assertion — it already ran on every invocation). The **44px edge-control token** gets a new row
(`tools/live/sheet-grammar.mjs` §2e): `.db-sheet-close` measures 44 × 44px on `sort-panel`; a
negative control overrides `--db-shell-edge-control-size` — scoped to `.db-surface`, the class the
token is actually declared under, after a first attempt scoped to `:root` read unchanged (a direct
declaration on the panel element wins over anything merely inherited) — to 60px, confirms the
close control follows to 60 × 60px, then restores 44 × 44px on removal. Both directions observed
directly: the mis-scoped version failed (`FAIL overriding the token moves the close control
(44.0x44.0)`, exit 1), the corrected version passed twice (exit 0). **Declared-title coverage** was
never a gap in this lane specifically: `surface-shell.test.ts`'s `it.each(DECLARING_SUBCLASS_FILES)`
already reads all seventeen declaring subclasses' shipped source on every `vitest run`, regression-
sensitive by construction. **The sub-page shape** stays open for the reason already on record: no
producer calls `pushSubPage`/`popSubPage` in production. Still open: the primary-action pill, the
trailing header chip and the motion-timing band (AC-006, AC-007) carry no lane row yet.

**A new module needed a story, and got one honestly rather than an allowlist entry.**
`confirm-sheet.ts` sits in `src/views/` (not `src/views/modals/`, which the story-coverage scanner
does not walk), and `buildConfirmSheetBody` takes an `HTMLElement` parameter, so it registered as
renderable. `src/views/confirm-sheet.stories.ts` demonstrates both the destructive and the
secondary-action shape, matching the pattern `surface-shell.stories.ts` already set for
`buildShellHeader`.

**Gate from the final state**, each exit status read from a file rather than a pipe:
`npx tsc --noEmit` 0, `npx vitest run` **1442/1442** in 137 files, `npm run build` 0,
`npm run story:coverage` 0 (18/39 renderable, `confirm-sheet.ts` now covered),
`node tools/naming/build-operator-checklist.mjs --check` 0 (regenerated after `goal.md`'s confirm
row ticked), `node tools/live/sheet-grammar.mjs` 0 with 0 `FAIL` lines, isolated
`npm run gate </dev/null > ".gate-<pid>.log" 2>&1; echo $?` **0**, 26 green, confirmed twice in
direct succession. `validate.sh`-equivalent (`runtime/dist/lib/validation/orchestrator.js --strict`)
first `RESULT:` **PASSED** after the graph-metadata backfill and one `next_safe_action` wording fix
(`SPECDOC_FRONTMATTER_004`, narrative rather than compact — corrected). `styles.css` untouched this
session; no capture recapture was owed.
<!-- /ANCHOR:fourth-landing -->

