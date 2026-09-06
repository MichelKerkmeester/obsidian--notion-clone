---
title: "Feature Specification: Notion Sheet Refinement"
description: "The destructive confirm re-presented as Notion's margined centred card, and the table cell action menu on iOS redesigned to Notion's grammar — a tap that opens the value editor, selection as an explicit mode, and a compact single-row bar that clears the phone nav pill."
trigger_phrases:
  - "061 spec"
  - "notion sheet refinement"
  - "confirm card"
  - "cell action menu ios"
  - "selection status bar wraps"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Notion Sheet Refinement

<!-- SPECKIT_LEVEL: 3 -->


---

## EXECUTIVE SUMMARY

A five-iteration research loop read 77 Notion screens against the sheet family and found that
Notion supplies **exactly one shape this surface should adopt**: the destructive confirm, which
Notion presents identically on iOS and web as a small centred card with stacked full-width buttons,
and which Anytype's 118 iOS states never captured at all. Everything else the loop found either we
already have, conflicts with a landed Anytype ruling, or belongs to `067-sheet-family-remediation`.

Then the operator reported a second surface, with two captures: **the table cell action menu on
iOS**. A tap on a cell paints a selection and builds an eight-control bar that wraps onto two rows,
the second of which is drawn under Obsidian's own phone navigation pill; opening a text cell's
editor leaves that bar drawn beneath it. The operator's words: *"This menu still has extremely bad
ui ux, the attached menu you see when you click a cell, should be redesigned to mimic how notion
would do it."* Notion's own table captures answer it directly — a tap edits, selection is an
explicit mode, and its chrome is a compact anchored control set, never a bottom-docked bar of
labelled words.

**Key Decisions**: whether the confirm keeps its sheet mount and gains a declared card frame role
or moves to the shell's `dialog` presentation (ADR-001); whether a phone tap on an editable cell
stops painting a selection (ADR-002); where the value editor lives, given that Notion never renders
one inline (ADR-003); and whether the three copy formats collapse behind one control (ADR-004).

**Critical Dependencies**: `067-sheet-family-remediation` holds the same `surface-shell.ts` /
`mobile-bottom-sheet.ts` file group and the same `styles.css`, so the two are serialized; five of
the six ADRs are **Proposed** and wait on the operator.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `worktrees/176-notion-sheets` (documentation only; implementation legs get their own) |
| **Parent Spec** | ../spec.md |
| **Phase** | 61 |
| **Predecessor** | 051-modal-and-sheet-componentization |
| **Successor** | None |
| **Handoff Criteria** | Every row in `acceptance-criteria.md` `Met`, `Waived` with an ADR or `Superseded` with an ADR, except AC-005 and AC-007 which are the operator's |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 61** of `005-component-surface-system`, one of the eight Notion-refinement children
the parent reserved as `059`-`066` under **D15**, opened by the Opus synthesis of its own
five-iteration `/deep:research:auto` loop.

**Scope Boundary**: the two Notion shapes that are additive to the sheet family, plus the operator's
cell-menu report. It does **not** re-open anything `044`, `048` or `051` closed on measured
evidence, it does **not** restate a `067` row, and it does not redesign a sheet's body — `052` owns
picker rows, `053` the toolbars, `054` the record surfaces, `055` the states.

**Numbering note**: this is the fifty-ninth-plus child folder under the parent; `create.sh` allocated
`068` and the folder plus the parent's Phase Documentation Map were corrected to `061` in the same
pass, because `061` is the number the parent reserved for the sheet family's Notion child.

**Dependencies**:
- Parent **D15** binds: additive only, and a Notion finding never silently overrides a landed
  Anytype ruling.
- `051/design-trueup.md` is the measured Anytype baseline of record; where it and any other document
  disagree about an Anytype value, it wins (`050` ADR-003).
- `044`'s seven grammar elements, `048`'s stacking model and `051`'s shell bind as constraints.
- `067-sheet-family-remediation` holds `surface-shell.ts`, `mobile-bottom-sheet.ts` and reaches
  `styles.css`; legs here serialize against it.
- `067` **AC-011** is the one device sitting; the two device questions this packet adds are appended
  to that checklist rather than given a fourth owner.

**Deliverables**:
- A phone tap on an editable cell that opens the column's value editor and builds no bar.
- Selection as an explicit mode, with a compact single-row bar that never wraps and clears the
  phone navigation bar as well as the safe area.
- A destructive confirm presenting as a margined centred card with stacked full-width actions, on
  both platforms.
- Six ADRs — five Proposed, one recording that no landed ruling is overridden.
- The grouped-band question decided or recorded as parked with its precondition named.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Tapping a cell on a phone does two things at once and shows the worse one. The tap resolver already
answers `edit-cell` for an editable non-title cell (`table-cell-gesture.ts:269-273`), but the caller
returns early only on `open-record` (`database-view.ts:4791`), so the same press also sets the cell
selection and calls `renderSelectionStatusBar` — which builds **eight** children for a single cell
(`:7643-7712`) into a row declared `flex-wrap: wrap` at `max-width: calc(100vw - 32px)`
(`styles.css:2645-2655`). At 390px it wraps to two rows, and its `bottom` reads
`max(16px, env(safe-area-inset-bottom), var(--db-keyboard-inset, 0px))` (`:2646`) with **no term for
Obsidian's own phone navigation bar**, so the second row is drawn underneath it. Open a multi-line
text cell and the bar stays: `openTextPopoverEditor` (`cell-editor-text.ts:331`) never claims the
bottom dock the single-line editor claims at `:212`, so the `body.db-bottom-dock-taken` rule that
would have hidden it (`styles.css:2635-2637`) never fires. Both states are in the operator's
captures. Separately, the destructive confirm — the surface every bulk and non-undoable path routes
through — presents as a flush full-width sheet with a right-aligned side-by-side action pair, which
is the one shape both reference products contradict.

### Purpose
A tap edits, a selection is something you chose, and the chrome for either is small enough to read
and placed where the phone can actually show it.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The phone tap grammar on a table cell: what a single tap does, and what it stops doing.
- The selection status bar's control set, its wrap behaviour and its bottom anchoring, on phone and
  on desktop.
- The bottom-dock claim, made consistent across the cell editors.
- The destructive confirm's frame and action layout, on phone and on desktop.
- The Notion-versus-Anytype conflict register, and the parked grouped-band decision.

### Out of Scope
- The scrim band, the motion tokens, the primary pill, the trailing chip, the row pitch floor, the
  handle geometry, the declared titles, the depth cap and the device pass — every one is a `067`
  requirement, and restating it here would create two owners for one number.
- Any Notion-derived pixel, colour or timing value — the source cannot carry one (goal D7).
- The desktop side panel's shape, the condition-builder widths and the header/close slot rules —
  each settled by a ruling, and each recorded in the register rather than reopened.
- Row selection's own bar contents. This packet changes the bar's **shape and placement**, which the
  row branch shares; it does not re-specify the row branch's actions.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/database-view.ts` | Modify | `:4786-4803` — the `edit-cell` branch stops painting a selection; `:7607-7712` — the bar's control set collapses and gains a mode |
| `src/views/record-surface/cell-editor-text.ts` | Modify | `:331` — `openTextPopoverEditor` claims and releases the bottom dock the way `:212` already does |
| `src/views/table-cell-gesture.ts` | Modify | The explicit selection-mode entry gesture, beside the existing `resolveCellTapAction` |
| `src/views/embedded-database-renderer.ts` | Modify | `:4384`, `:4569-4579` — the embedded renderer's own copy of both grammars, kept in step |
| `src/views/confirm-sheet.ts` | Modify | `:46-72` — `stackedActions` on `buildConfirmSheetBody` |
| `src/views/modals/confirm-modal.ts` | Modify | `:44` — the declared card role passed through, `super(app, "sheet")` unchanged |
| `src/views/mobile-bottom-sheet.ts` | Modify | `:29-45` `SheetChromeOptions` gains the declared frame role; `:364` `classifySheetFrameShape` gains a third class applied from the declaration only |
| `src/views/surface-shell.ts` | Modify | `:156-170` — the card inset constant beside the existing frame-shape constants |
| `src/views/toolbar-renderer.ts` | Modify | `:2410-2420` — `--db-mobile-navbar-height` published unconditionally on a phone, not only when the FAB renders |
| `styles.css` | Modify | `:2590-2665` the bar; `:230-282` the sheet frame; `:8592-8598` the action row |
| `src/i18n.ts` | Modify | `:369-371` — the copy-format strings behind one control and an overflow |
| `tools/live/sheet-grammar.mjs` | Modify | The confirm row gains the card columns |
| `tools/storybook/verify-placement.mjs` | Modify | The existing selection-bar legs gain a wrap assertion and a nav-bar clearance assertion |
| `tools/live/touch-targets.mjs` | Modify | The bar's controls measured against the 44px floor in the single-row shape |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | **The table cell action menu, iOS.** A single tap on an editable, non-title cell on a phone opens **that column's value editor and nothing else** — no selection painted, no status bar built. Selection becomes an **explicit mode**, entered by a deliberate gesture rather than by an ordinary tap, and its bar is **one row that never wraps**: count, one Copy control, Paste, Clear and an overflow, at most **six** children under `flex-wrap: nowrap`, every control at or above the 44px floor. The bar is anchored above **both** the safe area and Obsidian's phone navigation bar, through the `--db-mobile-navbar-height` the mobile FAB already consumes. Every cell editor claims the bottom dock while it is open, so no editor is ever drawn over a bar that stayed. Desktop keeps a bar, in the same compact single-row shape at its own 30px height, with the same overflow. **Evidence:** Notion's iOS table captures — `screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-02-026940b3-e0de-443d-a948-6eb1e53e4ea1.webp` (a selected cell carries a blue outline, a corner handle and a **two-control anchored pill**, `↔` and `···`, and no bottom bar at all), `-01-d53b3912-f60a-4bd1-872e-18276fe2acd5.webp` (the same cell in edit, with a **single row** of icon-only controls above the keyboard that does not wrap), `-03-db2814d9-78bd-4b01-9d57-8e1c4dcbdbbc.webp` (the same pill on a column), and `screenshots/notion/ios/views/notion-ios-views-table-11-90277769-e407-4476-bc16-4309ee11276d.webp` plus `-13-6673816d-9c68-4275-8902-f6cf6982f982.webp` (a resting table view carrying **no** selection chrome). Desktop half: `screenshots/notion/web/views/notion-web-views-table-03-bd482935-9854-4f32-9e1d-47157eee4f1f.webp` — a cell's value editor opens as an anchored dropdown **under the cell**, with no persistent action bar anywhere on the page. |
| REQ-002 | **The confirm card.** The destructive confirm presents as a card: inset **≥ 16px on every frame edge**, radius `--db-radius-xl` on all four corners, and its actions **stacked full width** in the card's content box at **≥ 44px** each with a **50pt** target (`SHELL_PRIMARY_ACTION_HEIGHT_PT`, `surface-shell.ts:167`). The footer grammar splits **by surface family, not by platform**: the stacked row is scoped to the confirm on both platforms, while the 16px card inset is phone-only. `openAndWait` still resolves `false` on Escape, outside press and drag (`confirm-modal.ts:6-8`). The sheet mount is unchanged — `super(app, "sheet")` (`confirm-modal.ts:44`) stays, because the shell's `dialog` presentation *"stays a centred dialog everywhere"* (`surface-shell.ts:41`) and a phone modal must become a stacked sheet under `048` **D1**. **Evidence:** digest A4, C9 (iOS) and G3 (web); `screenshots/notion/ios/database/notion-ios-database-property-editor-02-658fd83b-c23b-4573-aac8-a18e06e185a1.webp` shows the shape directly — a small centred card, margined on every side, three stacked full-width buttons. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | **The conflict register.** `decision-record.md` carries one row for each of the **eight** places a Notion pattern contradicts a landed Anytype ruling — header slots, close affordance, grouped sections, confirm shape, desktop side panel, commit placement, desktop builder width, keyboard behaviour — each naming the ruling of record and the proposal, and the count of landed rulings **overridden** reads **zero**. The register is permanent and is never a task. |

### P2 - Optional

| ID | Requirement |
|----|-------------|
| REQ-004 | **The grouped-band decision.** Notion's iOS sheets separate logical groups with a background gutter band between rounded cards (digest C10, D2, E1) where ours uses dividers inside one card (`styles.css:12408-12415`). The digest's own ruling is that this is *not something to build from Notion alone*. Either it is decided against a re-read of Anytype's own multi-section sheets, or it is recorded as parked **with that re-read named as its precondition**. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A phone tap on an editable non-title cell builds **0** selection status bars, measured
  by the existing `verify-placement.mjs` selection legs, against **1** today.
- **SC-002**: The selection bar's rendered row count on a 390px viewport reads **1**, against **2**
  today, with **≤ 6** children against **8** today.
- **SC-003**: The bar's computed `bottom` includes the published navigation-bar height; with the bar
  measured against the nav bar's rect, the intersection area reads **0px²**.
- **SC-004**: The confirm's measured inset reads **≥ 16px** on all four edges against **0/0/0**
  today, and its action row's computed `flex-direction` reads `column` against `row` today.
- **SC-005**: `sheet-grammar.mjs`'s registered set stays at or above **14 surfaces / 32 pairs**
  after every leg, and every one is green.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `067-sheet-family-remediation` | Holds the same `surface-shell.ts` / `mobile-bottom-sheet.ts` group and the same `styles.css` | Serialize; `061` restates none of `067`'s rows, so a merge conflict is a text conflict rather than a contested number |
| Dependency | ADR-001 to ADR-004, ADR-006 | Five Proposed decisions gate the two P0 requirements | Each names both readings and the ruling of record; the operator rules once, on one document |
| Risk | Removing selection-on-tap breaks a desktop habit | Medium | The change is gated on `gesture === "touch"` in the resolver that already makes that distinction (`table-cell-gesture.ts:270`); a mouse press keeps `select-cell` unchanged |
| Risk | Collapsing three copy formats loses a reachable action | Medium | Nothing is deleted — the three keep their strings (`i18n.ts:369-371`) and move behind the overflow; a lane row asserts all three are still reachable |
| Risk | The nav-bar height is published only when the FAB renders | Medium | `toolbar-renderer.ts:2360` guards the publication; the leg makes it unconditional on a phone. A `var()` that misses does not fail, which is the trap `styles.css:2640-2644` already documents |
| Risk | The confirm card changes a surface every bulk path routes through | High | `openAndWait`'s dismissal contract is asserted by the existing confirm lane row (T013, 8 of 8 columns); the card is a class, not a new mount |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The tap-to-editor path adds no layout pass beyond the editor's own — the selection
  render it removes was one `renderCellSelectionClasses` plus one `renderSelectionStatusBar` per tap.

### Accessibility
- **NFR-A01**: Every control in the single-row bar measures at least **44 × 44px** on a phone. The
  floor is already declared (`styles.css:2660-2663`) and `touch-targets.mjs` already sweeps every
  `button` on a page against it (`:82-92`), so the gap is a scenario that renders a live selection
  bar, not a new measurement.
- **NFR-A02**: The selection count keeps its live region (`database-view.ts:7636-7641`,
  `:7660-7662`); collapsing controls does not remove the announcement.

### Reliability
- **NFR-R01**: The bottom-dock claim is released on every editor close path, including cancel and
  outside-press, so a bar cannot stay hidden after its claimant is gone.

---

## 8. EDGE CASES

### Data Boundaries
- A selection spanning more than one column: the `Aa <Column>` bulk-edit chip has no single column
  to name (`database-view.ts:7688-7695`), so it is absent and the overflow carries Fill instead.
- A selection of 100+ cells: the count string is the only child whose width grows; the bar is
  `width: max-content` under a `max-width`, so the overflow absorbs the growth.
- A read-only view: Paste and Clear are absent, which takes the bar to three children and must not
  leave an empty overflow control.

### Error Scenarios
- The navigation bar cannot be measured: `toolbar-renderer.ts:2416-2418` already falls back to 50px
  on a phone, and the bar inherits that rather than 0.
- The keyboard is open while a selection is live: `--db-keyboard-inset` and the nav-bar height are
  both terms of the same `max()`; the keyboard wins because it is the larger.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 14/25 | Files: 14, LOC: ~450, Systems: table view + sheet shell + live harness |
| Risk | 0/25 | Auth: N, API: N, Breaking: N |
| Research | 20/20 | A five-iteration loop over 77 digest screens plus a direct capture read for the operator's report |
| Multi-Agent | 8/15 | Two independent workstreams: the cell menu and the confirm card |
| Coordination | 10/15 | Serialized against `067` on two files and on `styles.css` |
| **Total** | **62/100** | **Level 3** |

`recommend-level.sh --loc 450 --files 13 --architectural` returns **62/100**, confidence **92%**,
which is Level 2 by the script's thresholds. Raised to **3** on the go-higher rule: the packet adds
a declared frame role and a selection *mode* — both state that other surfaces will read — and its
sibling `067` sits at the same level on the same file group. Phase score **10/50** against the 25
threshold, so this is a standard child and not a phase parent.

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | The card frame role is inferred from height rather than declared, and a tall confirm loses its card | H | M | The role is applied **only** from a declared `SheetChromeOptions` value; `classifySheetFrameShape` never infers it (ADR-001) |
| R-002 | Selection mode has no discoverable entry, so the actions become unreachable | H | M | The entry gesture is the long-press the row grammar already uses (`table-cell-gesture.ts:243-249`), and a lane row asserts it reaches the bar |
| R-003 | The embedded renderer keeps the old grammar and the two disagree | M | H | `embedded-database-renderer.ts:4384` and `:4569-4579` are named in the file table and move in the same leg |
| R-004 | The confirm card moves reference captures | M | M | Parent D5: the 32 Project Manager board and gantt entries must stay `pixelHash`-identical, checked at the landing |

---

## 11. USER STORIES

### US-001: Editing one cell on a phone (Priority: P0)

**As a** person editing a database on iOS, **I want** a tap on a cell to open that cell's editor,
**so that** I am not first shown a bar of eight copy-and-paste words I did not ask for, half of it
under the app's own navigation pill.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-001, AC-002, AC-003).

---

### US-002: Copying a block of cells on a phone (Priority: P1)

**As a** person moving data out of a table on iOS, **I want** to enter selection deliberately and
see one compact row of actions, **so that** the actions are readable, tappable and not clipped.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-002, AC-003).

---

### US-003: Confirming something that cannot be undone (Priority: P0)

**As a** person about to delete rows in bulk, **I want** the confirm to read as a decision rather
than as another sheet, **so that** the two choices are equally sized and equally reachable with a
thumb.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-004, AC-005).

---

## 12. OPEN QUESTIONS

- **ADR-001** — does the confirm keep its sheet mount and gain a declared card frame role, or is the
  card a fourth presentation on the shell? The proposal keeps the mount; the operator decides.
- **ADR-002** — does a phone tap on an editable cell stop painting a selection outright, or keep a
  faint one under the editor? The proposal is outright.
- **ADR-003** — Notion never renders a value editor inline (digest P9), and ours is an inline
  overlay. Do the text editors become pushed surfaces like the select and date pickers already are?
- **ADR-004** — do Copy TSV, Copy Markdown and Copy CSV collapse behind one Copy control with the
  format in the overflow?
- **ADR-006** — grouped gutter bands or dividers? Blocked on an Anytype multi-section capture
  re-read; cannot be settled from Notion alone.
- Does Notion's iOS table have a multi-cell selection at all? No capture in the 3,647-file harvest
  shows one — the flow captures show single-cell and single-column selection only. The single-row
  bar is therefore **our** shape at Notion's density, and it is labelled as such rather than claimed
  as parity.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Decision Records**: See `decision-record.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Research**: See `research/research.md`
- **Sibling packet**: `../067-sheet-family-remediation/` — REQ-001..011, not restated here
- **Notion digest**: `../051-modal-and-sheet-componentization/notion-screens-digest.md`
