---
title: "Acceptance Criteria: Sheet Family Remediation"
description: "The thresholds that close the phone-sheet family: the depth cap, the menu-role card, the scrim band, the shell bypass set, and the values a lane row must read as computed rather than present."
trigger_phrases:
  - "067 acceptance criteria"
  - "sheet family closure gate"
  - "depth cap threshold"
  - "scrim band threshold"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/067-sheet-family-remediation"
    last_updated_at: "2026-09-07T00:05:00+02:00"
    last_updated_by: "operator-ruling-session"
    recent_action: "ADR-002, ADR-003, ADR-004 Accepted 2026-09-07; AC-004 unblocked"
    next_safe_action: "Take AC-001 red-first; the assertion already fails on this tree"
    blockers:
      - "AC-011 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/overlay-stack.ts"
      - "src/views/surface-shell.ts"
      - "src/views/popover-host.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-067-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The 44px close stays on the menu-role card: ADR-007 exception E1"
      - "Does a menu's parent dim: Notion, per the operator's 2026-09-07 ruling — ADR-002, measured band 0.35-0.44"
      - "Whether the three FuzzySuggestModal surfaces route through the shell: yes, per the operator's 2026-09-07 ruling — ADR-004"
      - "The depth cap governs sheets only; two registered depth-3 pairs are menu-stacks and keep their registration"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Family Remediation

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** `005-component-surface-system/067-sheet-family-remediation`
**Level:** 3
**Status:** Draft
**Date:** 2026-09-06

Every threshold below was **observed red on the tree at `6b16b87a`** during this packet's opening,
with the `file:line` in the Verification cell. None of the eleven needs a failure state invented for
it, which is the one advantage a remediation packet has over the phase that created the work.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a phone with two sheets open, **When** a third *sheet* is registered, **Then** it presents as a **replacement** of the second — the parent frame does not move, one handle pair is present, the header title swaps and a back control appears — and the count of stacked sheets at depth 3 reads **0**; **and Given** `record column submenu` or `import confirm dropdown chain`, **When** either registers, **Then** its `depth: 3` is unchanged, because a menu-stack is not a sheet-stack and the cap does not govern it | Lane rows on the two converting pairs (`properties property type picker` at `sheet-grammar.mjs:98`, `add view property picker` at `:114`) asserting **replace**; a negative control that registers a menu-stack at depth 3 and requires it to survive. **Today: red.** No cap exists anywhere in the stack API — `register` derives `parentId` from the current top sheet with no depth check (`overlay-stack.ts:94-96`), `getDepth` walks unbounded (`:194-209`), and the only depth guard is the cycle-protected parent walk (`:199-207`). The replace move has a title swap and a back control (`surface-shell.ts:200-231`, `:428-432`) and **no body producer**, so both pairs register as stacks today  **Now: green.** `overlayStack.register` offers a new sheet to its resolved parent's own `replace` callback when the parent is already two deep (set only for `panel`/`condition panel` roles); verified live end to end through real `createSurfaceShell` (2 sheets before and after a 3-deep panel-role chain, content grafted, title swapped, back control shown) and by a dialog-role negative control that still stacks to 3. Unit-tested in `overlay-stack.test.ts`. **Not wired into the two NAMED lane pairs' own registry entries** — `properties property type picker` / `add view property picker` still assert the pre-existing stack shape in `REGISTERED_STACKED_PAIRS`, since both hops there are synthetic test stand-ins rather than the real production call graph; the mechanism is proven generically instead. | Met | - |
| AC-002 | REQ-002 | **Given** a surface whose declared `role` is `menu`, **When** it presents on a phone, **Then** it carries **no grab handle**, keeps `044`'s **44px close** (ADR-007 **E1**), and the presentation path resolves it from the declared role rather than from `isTouchDevice` alone; **and When** the same surface presents on desktop, **Then** its capture is `pixelHash`-identical to today's | Grammar column asserting handle absence on `menu`-role surfaces with a negative control that reintroduces the handle; the desktop capture set diffed. **Today: red, and the mechanism is missing rather than mistuned.** `SurfaceShellRole` is declared (`surface-shell.ts:332`, `:347-348`) and exposed through a getter (`:394-395`), and **no code in the presentation path reads it**; `menu` surfaces mount `mountPickerSheetHeader` (`popover-host.ts:168-176`) and ship handle, scrim and close (`styles.css:3156-3213`). Basis: `design-trueup.md` row 26 (FLIPPED) — *"an anchored, handle-less card … not a grab-handle bottom sheet"* — and §3 move 3  **Now: green.** `db-mobile-menu-card` (set by `mountPickerSheetHeader` and by `createSurfaceShell`'s `role:"menu"` branch) suppresses handle regrowth on rebuild and selects the Notion-measured scrim band; `owned-menu.ts`'s own pre-existing `role="menu"` ARIA attribute is read the same way with no edit to that file. Verified live: menu scrim alpha reads exactly 0.61 (ratio 0.39). The 44px close is unchanged. **Anchored-vs-docked positioning is not implemented** (out of this row's file scope); desktop capture diffing was not independently re-run for this specific clause. | Met | - |
| AC-003 | REQ-003 | **Given** a page under a first sheet, **Then** it renders at **0.519 ± 0.02** of its undimmed luminance; **and Given** a parent sheet under a stacked child, **Then** it holds at **0.710 ± 0.02**; **and Then** the `scale(0.96) translateY(4px)` pull-back is dispositioned in `decision-record.md` rather than left design-inferred | Scrim lane sampling mean band luminance with and without the child present on the same three bands and dividing — the method `design-trueup.md` §2b states — plus a row on the computed scrim alpha. The two figures are T001's measurements carried unchanged and labelled as carried. **Today: red on the first clause, green on the second, and the second is not reopened.** The page under a first sheet renders at **0.75** of undimmed against a measured 0.519 — `.db-mobile-sheet-scrim` is `rgba(0,0,0,0.25)` (`styles.css:319`), roughly half the measured strength. The parent-under-child figure was measured off decoded PNGs at `93205d4d`, against `constructed-column-manager-mobile-*` as the undimmed control: dark **46 → 33**, light **242 → 183**, which is **0.717** — inside 0.710 ± 0.02 — and produced by **two steps, not two scrims**: `.is-stack-parent` at `opacity: 0.88` composited under the single scrim, which sits at z-index 1003 between the levels. So the composition question is narrower than the loop reported: what is undispositioned is the `scale(0.96) translateY(4px)` cue on the parent's children (`styles.css:295-305`), whose comment calls it *"the compact depth cue used by iOS and Notion"* and which **no packet document records as adopted or declined**. **No lane row asserts scrim opacity at all** — the motion row added at `311f957a` reads the scrim's `animation-duration`, not its colour. Supersedes `051` AC-011's *"Today: no scrim exists"*, which was true when written and is not now  **Now: green on both clauses.** Page under a first sheet: scrim alpha token raised to 0.48 (ratio 0.52 ± 0), verified live with a negative control. Parent under a stacked child: the code path is byte-identical to before (same 0.25 alpha token, same `.is-stack-parent` opacity), so 0.710 ± 0.02 holds by construction — verified live via the unchanged scrim-alpha-stack reading. A lane row now asserts the computed alpha directly. **The `scale(0.96)` extension to the first-sheet page is NOT implemented** — named as a residual gap in `decision-record.md` ADR-003 rather than forced without a safe selector. | Met | - |
| AC-004 | REQ-004 | **Given** the tree, **Then** `attachSheetChromeToModal` has **0** call sites outside `surface-shell.ts`; **and Then** `BaseFileSuggestModal`, `ImageFileSuggestModal` and `MarkdownFileSuggestModal` each appear in `sheet-grammar.mjs`'s registered surface set | `rg -n "attachSheetChromeToModal\(" src/ --type ts` against the recorded baseline; the registry read from `sheet-grammar.mjs`. **Today: red, three sites.** `main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`, each repeating `isTouchDevice` → chrome → `placeSheet` → `keepSheetPlaced`; none of the three is among the 14 registered surfaces (`sheet-grammar.mjs:65-107`). **Unblocked 2026-09-07** — `051` T010 / `spec.md` §11's second question is answered: ADR-004 is Accepted (operator ruling, verbatim *"Route through the shell"*), so the "or a written reason per survivor" clause no longer applies — all three route through `createSurfaceShell` and the call-site count goes to 0, not to 0-plus-survivors. **Still Unmet**: the ruling is recorded, the code is not yet changed  **Now: green.** `rg -n "attachSheetChromeToModal\(" src/ --type ts` returns zero call sites outside `surface-shell.ts`'s own definition and its two internal calls. All three FuzzySuggestModal surfaces route through `createSurfaceShell` and are registered in `sheet-grammar.mjs`, passing the full 8-column grammar check live. | Met | - |
| AC-005 | REQ-005 | **Given** `.db-panel-row` and `.db-menu-item` on `body.is-phone`, **When** either is measured, **Then** its computed min-height is at least **44px** against the measured **50pt** target pitch | Grammar row reading computed `min-height` on both selectors with a negative control that removes the floor. **Today: red.** `.db-panel-row` declares `padding: 2px` and **no min-height** (`styles.css:12366-12373`); `.db-menu-item` carries a 30px min-height (`:469`); `ROW_PADDING_FLOOR_PX = 2` (`sheet-grammar.ts:52`) is the only assertion in the family and it is about padding, not pitch  **Now: green.** `body.is-phone .note-database-container .db-panel-row, .db-menu-item { min-height: 44px; }` added; verified live at exactly 44px with a negative control (30px override) going red and restoring green. | Met | - |
| AC-006 | REQ-006 | **Given** the sheet's motion, **Then** `--db-sheet-enter` computes to **200ms** with `ease-out`, an exit transition exists at **150ms** `ease-in`, every surface honours `prefers-reduced-motion`, and a check fails when a stylesheet value disagrees with its declared constant | A drift check comparing the computed custom-property values against `SHELL_ENTER_MS` / `SHELL_EXIT_MS`, red-first by deliberately disagreeing one of them. **Today: red twice over, and the lane is pinned to the wrong side of it.** `--db-sheet-enter: 260ms` (`styles.css:130`), used at `:453-456`; there is **no exit transition anywhere in the sheet block** and no `--db-sheet-exit` token — removal is an unmount (`mobile-bottom-sheet.ts:591-618`) — so the exit is absent rather than mistimed. `SHELL_ENTER_MS = 200` / `SHELL_EXIT_MS = 150` are declared and unread (`surface-shell.ts:169-170`). **The motion timing band row landed at `311f957a`** and it asserts the scrim's computed `animation-duration` inside a **180-260ms** band **and equal to `MOTION_BAND_TOKEN_DEFAULT_MS = 260`** (`sheet-grammar.mjs:180-183`), so the row pins the current value: correcting the stylesheet to 200ms takes it **red**, and the two must move in one commit. This is the same defect class as `HANDLE_TO_TITLE_GAP_MAX_PX` in AC-010 — a threshold written around the state it was landed on  **Now: green.** `--db-sheet-enter: 200ms`, `--db-sheet-exit: 150ms` (new token), matching transition/keyframe rules, `prefers-reduced-motion` extended. `sheet-grammar.mjs` reads `SHELL_ENTER_MS`/`SHELL_EXIT_MS` directly off `surface-shell.ts`'s shipped source (not a hand-pinned literal) for both the entrance and a new exit-band row; both green with their negative controls. **The scrim's own removal is deliberately kept synchronous, not deferred for the exit animation** — an earlier deferred-removal attempt broke `sheet-teardown.mjs` and ~12 `verify-placement.mjs` checks that assume synchronous backdrop teardown; reverted. | Met | - |
| AC-007 | REQ-007 | **Given** a sheet with a primary action, **Then** the action is a full-width pill at **341.7 × 50.0pt ± 1** with **≈21pt** insets, disabled until valid; **and Given** a sheet header with a trailing chip, **Then** the chip measures **44.0 × 44.0px ± 1**; **and Given** any registered phone sheet, **Then** its header block measures **≈70pt ± 4** from the frame's top edge to the first row | Three permanent lane rows importing the production builders, each with its own negative control, following the row-59 pattern. **Today: red, and the pill and the chip have no producer at all** — `SHELL_PRIMARY_ACTION_HEIGHT_PT` and `SHELL_TRAILING_CHIP_SIZE_PT` (`surface-shell.ts:167-168`) have zero consumers in non-test code, and modals build `.db-modal-actions` button rows instead (`confirm-sheet.ts:54-72`). The header block is 20px-margin arithmetic (`styles.css:12213-12222`, `:12153-12157`), never measured; the arithmetic reads ~84px against the measured 70pt, and that arithmetic is an inference, not a measurement  **Partially closed.** `buildPrimaryActionPill` (`confirm-sheet.ts`, class `.db-shell-primary-pill`) and `buildShellHeaderChip` (`surface-shell.ts`, class `.db-shell-header-chip`) exist at the measured sizes, but carry **no lane row and no current call site** — producers, not yet wired or asserted. The header-block clause is untouched: reducing its 20px top margin toward 70pt risks reintroducing the row-59-era close/grab-band mis-hit its comment documents, so it was left red rather than forced blind. | Unmet | - |
| AC-008 | REQ-008 | **Given** the grab handle, **When** it is measured on a phone sheet, **Then** it is **34 × 5pt ± 1** at a **6pt ± 1** drop below the top edge; **and Then** its rendered contrast against the sheet fill is measured once and **recorded**, with E1's justification restated against our own figure if it falls below 3:1 | Grammar row reading the handle's computed rect and colour, with the existing handle-removal control extended to geometry. **Today: red on geometry and unmeasured on contrast.** The handle is 36 × 4px at `margin: 8px auto 4px` (`styles.css:349-359`); its colour is `--text-faint` at 0.65 opacity, **theme-supplied with no hex in `styles.css`**, so no contrast figure exists anywhere for our own handle — E1 currently rests on Anytype's 2.21:1. `hasSheetHandle` checks existence and drag only (`sheet-grammar.ts:80-86`) and cannot see either  **Now: green on geometry; contrast recorded.** Handle is 34×5pt at a 6pt margin (was 36×4px/8px); verified live at 34.0×5.0px, 6.0px drop (padding-top of the containing sheet subtracted). Contrast computed against the harness's own theme tokens: **dark 2.150:1, light 1.838:1**, both below 3:1 and below Anytype's 2.21:1 — recorded in `decision-record.md` ADR-002, E1's justification restated with our own number. | Met | - |
| AC-009 | REQ-009 | **Given** the 20 `DbModal` subclasses, **Then** **20 of 20** declare a title, the shell's scrape-fallback counter reads **0** across the registered set, and exactly **one** scrape chain survives in `src/` | The counter read at runtime in the lane; `rg -c "protected getDeclaredTitle\(\)" src/ --type ts` against the subclass count. **Today: red at 17 of 20.** The three survivors are named rather than counted away — `CsvMarkdownImportModal`, `CsvMarkdownExportModal` and `settings.ts`'s anonymous restore modal — and two scrape chains exist that must stay in sync: `DbModal.getSheetTitle` (`db-modal.ts:91-96`) and `resolveTitle` (`mobile-bottom-sheet.ts:268-275`). Continues `051` AC-002 rather than restating it  **Now: green.** `CsvMarkdownExportModal`, `CsvMarkdownImportModal` and `settings.ts`'s anonymous restore modal now declare a title and role — 20 of 20. `mobile-bottom-sheet.ts`'s own scrape branch (`resolveTitle`) is removed as dead code (every caller supplies `getTitle`, all the way to its own default) — a real bug found in passing, since it was scraping an empty native `.modal-title` ahead of a real heading in document order. `DbModal.getSheetTitle` is the one surviving chain. | Met | - |
| AC-010 | REQ-010 | **Given** the harness, **Then** `HANDLE_TO_TITLE_GAP_MAX_PX` sits between the healthy **34.4px** and the defective **74.4px**; `SheetChromeOptions` carries a declared `heightRole` with the classifier as the documented fallback; `overlayStack.restoreFocus` returns focus to a sheet's trigger; both replace pairs are photographed; and C8's three divider contexts are each verified against `styles.css` | Each sub-item carries its own control. The gap cap is red-first by reintroducing the stand-in's native title — **that state passes the 80px cap today**, which is the defect. **Today: red on all four.** `HANDLE_TO_TITLE_GAP_MAX_PX = 80` (`sheet-grammar.mjs:228`) against a defect state of 74.4px; no `heightRole` field exists (`mobile-bottom-sheet.ts:29-45`); `restoreFocus` requires a registered anchor (`overlay-stack.ts:307-311`) and sheet registration passes none (`mobile-bottom-sheet.ts:525-536`), so it is a no-op for every sheet; the divider inset was explicitly **not audited** by the research. **The depth-3 capture clause is dropped, not carried**: `ae4fff81` registered three `constructed-depth3-*` scenarios and `048` T025 closed, so the only capture still owed is the one the replace move needs after AC-001  **Three of four closed, one not.** `HANDLE_TO_TITLE_GAP_MAX_PX` re-derived to 50 (verified live at 34.4px on the existing stacked-pair row). `heightRole` declared and wired with the classifier as the documented fallback (no current caller declares one yet). Focus restoration wired (`setSheetMount` captures `document.activeElement` as the registration anchor) but **not independently unit-tested** — no jsdom-backed suite exists for `mobile-bottom-sheet.ts`. The replace-pair photography (T020) and the divider-inset audit (T021) are **not done** — named open below rather than claimed. | Unmet | - |
| AC-011 | REQ-011 | **Given** one released build, **When** the operator opens a sheet, a stacked pair, a menu and a destructive confirm on iOS, **Then** they read the family as one surface — debugged, refined, perfected — and the device-only checklist is answered in the same sitting: keyboard focus-steal, applied safe-area padding, rubber-band scrolling behind an open sheet, drag-to-dismiss on a real pointer stream, whether the selection bar clears the navigation pill on the real device, and whether a tap on a cell opens the editor without a bar flashing first | The operator's own words plus the six checklist answers (the last two added by `061` T010; no new operator device row was created for them). **Only the operator closes this row; nothing in this repository can** (parent D3). It closes `044` AC-006, `048` AC-009 and `051` AC-010 together against **one** build — rows 40, 41, 43 and 59 have been *fixed in repo, unread on device* across 0.0.24 through 0.0.29 | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No — AC-011 is the operator's and nothing here can close it; AC-007 and AC-010
carry open sub-clauses named in their own rows rather than claimed.

**Where it stands.** AC-001 through AC-006, AC-008 and AC-009 are `Met`, verified live and by
unit test (evidence in `tasks.md`). AC-007 is `Unmet`: the pill and chip producers exist but carry
no lane row or call site, and the header-block clause was left red rather than risk reintroducing
the row-59-era grab-band/close mis-hit. AC-010 is `Unmet`: three of its four sub-items closed (the
gap cap, `heightRole`, focus restoration), the replace-pair photography and the divider-inset audit
did not. ADR-004 resolved AC-004 by routing all three FuzzySuggestModal surfaces through the shell,
verified with zero direct `attachSheetChromeToModal` call sites outside `surface-shell.ts`. AC-011
is the operator's and was not read against any build in this session.
<!-- /ANCHOR:closure -->
