---
title: "Decision Record: Notion Sheet Refinement"
description: "Six decisions from the Notion sheets loop and the operator's cell-menu report — five Proposed pending the operator, one recording that none of the eight Notion-versus-Anytype conflicts overrides a landed ruling."
trigger_phrases:
  - "061 decision record"
  - "confirm card adr"
  - "cell tap adr"
  - "notion anytype conflict register"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-06T17:40:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Recorded six decisions and the eight-row conflict register"
    next_safe_action: "Put ADR-001 to ADR-004 and ADR-006 to the operator as one set"
    blockers:
      - "Five ADRs are Proposed and none may be implemented before the operator rules"
    key_files:
      - "src/views/database-view.ts"
      - "src/views/confirm-sheet.ts"
      - "src/views/surface-shell.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-061-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the text cell editor become a pushed surface, as Notion digest P9 shows"
    answered_questions:
      - "Zero landed Anytype rulings are overridden by this packet"
---
# Decision Record: Notion Sheet Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Parent **D15** governs every row here. A Notion finding never silently overrides a landed Anytype
> ruling; where the two disagree the conflict is named, a side is proposed with a reason, and the
> decision stays **Proposed** until the operator rules. **Five of the six below are Proposed.**

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The confirm keeps its sheet mount and gains a declared card frame role

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

Notion presents "are you sure" identically on iOS and on web as a small centred card, margined on
every side, with stacked full-width buttons (digest A4, C9, G3;
`screenshots/notion/ios/database/notion-ios-database-property-editor-02-658fd83b-c23b-4573-aac8-a18e06e185a1.webp`).
Anytype is silent — `051/design-trueup.md` row 1 reads "Not seen" across 118 iOS states and 600
menus. This is the one place in 77 screens where Notion fills a gap rather than contradicting a
ruling, and the surface matters: every bulk and non-undoable destructive path routes through the
confirm (`051` goal D5).

Ours is a flush full-width bottom sheet with a right-aligned side-by-side action pair.

### Constraints

- `048` **D1** (operator, 2026-09-05): *"Obsidian modals opened from a sheet on the phone … become
  stacked bottom sheets; none stay modals"* (`roadmap.md` §6A). So the obvious move — changing
  `super(app, "sheet")` to `"dialog"` — is closed: the shell's `dialog` presentation *"stays a
  centred dialog everywhere"* (`surface-shell.ts:41`).
- The dismissal contract is asserted by the shipped confirm lane row and must not move:
  `openAndWait` resolves `false` on Escape, outside press and drag (`confirm-modal.ts:6-8`).
- Notion's thumbnails carry no sampled value (goal D7), so the 16px inset is read proportionally,
  not measured. It is stated as a **floor**, not as a parity figure.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: keep the sheet mount and add a **third, declared** frame role — `db-sheet-card` —
beside the existing floating/flush split.

**How it works**: `SheetChromeOptions` (`mobile-bottom-sheet.ts:29-45`) gains a frame-role field;
`classifySheetFrameShape` (`:364`) gains the third class and applies it **only** from that
declaration, never from a height inference, with the existing `ResizeObserver` watcher (`:385`)
keeping the other two current. `ConfirmModal` passes the role through `createSurfaceShell`;
`getShellRole()` already returns `"dialog"` (`confirm-modal.ts:51-53`) and the card is its phone
expression. `buildConfirmSheetBody` (`confirm-sheet.ts:46`) gains `stackedActions`, and the actions
row (`:54`) carries `.db-modal-actions.db-confirm-stacked` with the button order and the
`mod-warning` / `mod-cta` classes unchanged (`:55-71`).

The footer grammar splits **by surface family, not by platform**: `.db-confirm-stacked` is scoped to
the confirm on both platforms, while the 16px card inset is phone-only. Notion's own desktop
confirm (G3) uses the same stacked footer while its non-confirm editors keep a side-by-side one
(H3), so the split follows the reference rather than our platform boundary.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Declared card frame role, sheet mount kept** | Honours `048` D1; reuses the frame-shape mechanism that already ships; one class, one constant | A third shape in a split that was deliberately two | 8/10 |
| `super(app, "dialog")` | One-line change | Violates `048` D1 — a phone modal must become a stacked sheet | 2/10 |
| Inferring the card from height | No new declaration | The height that produces a card is the same height that produces a floating sheet; the classifier's own hysteresis comment (`mobile-bottom-sheet.ts:322-338`) is the argument against inferring a shape that changes its own input | 3/10 |
| Leave the confirm as it is | Zero risk | The one shape both reference products agree on, on the highest-traffic destructive surface | 3/10 |

**Why this one**: it is the only option that adopts Notion's shape without contradicting an operator
ruling, and it reuses a mechanism the tree already has rather than inventing a presentation.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The two choices in a destructive confirm become equally sized and equally thumb-reachable.
- The confirm stops reading as another sheet in a stack of sheets.

**What it costs**:
- A third frame class in a split documented as two. Mitigation: it is declared, never inferred, so
  it cannot participate in the oscillation the two-cutoff hysteresis exists to prevent.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A tall confirm loses its card | M | The role is declared per surface; height plays no part |
| Reference captures move | M | Parent D5: the 32 Project Manager entries checked `pixelHash`-identical at the landing |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The confirm is the highest-traffic destructive surface and diverges from both references |
| 2 | **Beyond Local Maxima?** | PASS | Four options weighed, two closed by a ruling |
| 3 | **Sufficient?** | PASS | One constant, one class, one flag on an existing builder |
| 4 | **Fits Goal?** | PASS | REQ-002, the loop's rank-1 finding over 77 screens |
| 5 | **Open Horizons?** | PASS | A declared frame role is reusable by any surface that later needs one |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `src/views/surface-shell.ts` — a card-inset constant beside the frame-shape constants (`:156-170`).
- `src/views/mobile-bottom-sheet.ts` — `SheetChromeOptions` (`:29-45`), `classifySheetFrameShape` (`:364`).
- `src/views/modals/confirm-modal.ts` — the declared role passed through; `:44` unchanged.
- `src/views/confirm-sheet.ts` — `stackedActions` (`:46-71`).
- `styles.css` — `.db-sheet-card` beside `.db-sheet-floating` (`:276`), and a scoped
  `.db-confirm-stacked` action rule beside `:8592`.

**How to roll back**: remove the `.db-sheet-card` and `.db-confirm-stacked` blocks and stop passing
the role. The class is additive — with it absent, `classifySheetFrameShape` produces exactly the two
shapes it produces today.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: A phone tap on an editable cell edits and does not select

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

### Context

The operator's report, verbatim (2026-09-06 ~17:07): *"This menu still has extremely bad ui ux, the
attached menu you see when you click a cell, should be redesigned to mimic how notion would do it."*
Two captures came with it: a floating bar reading `× Esc | 1 cell selected | Copy TSV | Copy
Markdown` wrapping to a second row that sits under Obsidian's navigation pill, and a text cell's
editor popover drawn over that same bar's second row.

The tap resolver already answers correctly. `resolveCellTapAction` returns `edit-cell` for a touch
press on an editable, non-title cell (`table-cell-gesture.ts:269-273`), and its own comment states
the intent: *"a tap in a cell opens that column's editor."* The caller does not honour it. It returns
early only on `open-record` (`database-view.ts:4791`) and then runs `nextCellRange`,
`renderCellSelectionClasses` and `renderSelectionStatusBar` on the same press (`:4795-4803`), so one
tap produces an editor **and** a selection **and** an eight-control bar.

Notion's own table captures show the resting and selected states with no bottom bar at all:
`screenshots/notion/ios/views/notion-ios-views-table-11-90277769-e407-4476-bc16-4309ee11276d.webp`
and `-13-6673816d-9c68-4275-8902-f6cf6982f982.webp` carry no selection chrome, and
`screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-02-026940b3-e0de-443d-a948-6eb1e53e4ea1.webp`
shows a selected cell whose entire chrome is a **two-control anchored pill** (`↔`, `···`) beside it.

### Constraints

- Desktop must not move. A mouse press resolves to `select-cell` in every cell
  (`table-cell-gesture.ts:270`) and the click-selects / double-click-edits grammar is unchanged.
- The embedded renderer holds its own copy of the same path
  (`embedded-database-renderer.ts:4384-4401`) and must move with it.

### Decision

**We chose**: on the `edit-cell` branch, the caller returns before touching the selection — the same
early return `open-record` already gets.

**How it works**: `database-view.ts:4791` gains the `edit-cell` case, so the editor the cell renderer
opens (`cell-renderer.ts:575-592`) is the only outcome of the press. Selection is reached by the
explicit gesture in ADR-004's bar, never by an ordinary tap.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Return early on `edit-cell`** | One press, one outcome — the rule the file's own comment at `:4782-4785` already states for `open-record` | Multi-cell selection needs its own entry gesture | 9/10 |
| Keep the selection, hide the bar | Smaller diff | The selection outline is still painted under the editor, which is the state `styles.css:2620-2632` already calls out as unexplainable to a user | 4/10 |
| Show the bar only above two cells | Smaller diff | The one-cell bar is the operator's actual capture | 3/10 |

**Why this one**: it makes the caller agree with the resolver it already asks, rather than adding a
second rule beside it.

### Consequences

**What improves**: a tap does the one thing it says it does.

**What it costs**: multi-cell selection on a phone needs a deliberate entry. Mitigation: the long
press the row grammar already binds (`table-cell-gesture.ts:243-249`).

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Selection becomes unreachable on a phone | H | A lane row asserts the entry gesture reaches the bar, with a negative control |
| The embedded renderer drifts | M | Both call sites named in `spec.md` §3 and moved in one leg |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator's report with two captures |
| 2 | **Beyond Local Maxima?** | PASS | Three options weighed |
| 3 | **Sufficient?** | PASS | One early return, plus the entry gesture |
| 4 | **Fits Goal?** | PASS | REQ-001 |
| 5 | **Open Horizons?** | PASS | Restores the one-press-one-outcome rule the file already argues for |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `database-view.ts:4786-4803`, `embedded-database-renderer.ts:4384-4401`,
`table-cell-gesture.ts`.

**How to roll back**: remove the `edit-cell` case from the early return. The branch below it is
untouched.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The inline value editor stays inline, and the divergence from Notion is named

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

### Context

Digest **P9**: *"A picker's own value editor is a further pushed/stacked surface, never inline. No
screen in the set shows a value editor rendered inline inside the row that opened it."* Ours is an
inline overlay: `openTextPopoverEditor` inserts `.db-cell-edit-popover.is-mobile.is-inline-overlay`
into the cell's own scroll container and positions it absolutely below the cell
(`cell-editor-text.ts:356-378`). On desktop, Notion agrees with us rather than with P9 — a date
cell's editor opens as an anchored dropdown under the cell
(`screenshots/notion/web/views/notion-web-views-table-03-bd482935-9854-4f32-9e1d-47157eee4f1f.webp`).

Half of our editors already are sheets: select, status, date and datetime open on click through the
picker family (`cell-renderer.ts:604-606`), which `048` registers as stacked pairs. The divergence
is the text and number editors alone.

### Constraints

- Converting the text editor to a pushed sheet touches `048`'s thirty-one registered pairs and
  `051`'s shell — both held by `067`.
- The digest cannot settle it: Notion's set contains no table cell editor on iOS at all, only page
  and property editors.

### Decision

**We chose**: keep the inline overlay for text and number, and record the divergence rather than
build the conversion from a pattern read on a different surface.

**How it works**: no code change. What does change is the dock claim —
`openTextPopoverEditor` (`cell-editor-text.ts:331`) takes and releases the bottom dock exactly as
`openSingleLineEditor` does at `:212` and `:233`, so the bar cannot be drawn under it. That is the
operator's second capture and it is inside REQ-001, not deferred with this ADR.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Keep inline; fix the dock claim** | Closes the operator's actual defect; no reach into `048`'s registered pairs | Leaves a named divergence from P9 | 8/10 |
| Convert text/number to pushed sheets | Full P9 parity | A phone-sized surface for a one-line value; touches two packets' file groups; the evidence is a property editor, not a cell editor | 4/10 |

**Why this one**: the defect the operator reported is the missing dock claim, not the overlay. A
conversion would be built on a pattern read off a different surface, which is the class of move
goal D7 exists to refuse.

### Consequences

**What improves**: no editor is ever drawn over a bar that stayed.

**What it costs**: a recorded divergence from P9. Mitigation: it is in the register (ADR-005) with
its evidence, so a later loop does not rediscover it as new.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The dock claim is released on one close path but not another | M | NFR-R01 asserts release on cancel and outside-press as well as commit |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The missing claim is one of the operator's two captures |
| 2 | **Beyond Local Maxima?** | PASS | The conversion was costed and refused with a reason |
| 3 | **Sufficient?** | PASS | Two calls, matching an existing pair |
| 4 | **Fits Goal?** | PASS | REQ-001 |
| 5 | **Open Horizons?** | PASS | The divergence is recorded, so a future loop can reopen it against real evidence |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `src/views/record-surface/cell-editor-text.ts:331` and its close path.

**How to roll back**: drop the two `claimBottomDock` calls.
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The selection bar is one row — count, Copy, Paste, Clear, overflow

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

### Context

For one selected cell the bar builds eight children (`database-view.ts:7643-7712`) into a row
declared `flex-wrap: wrap` at `max-width: calc(100vw - 32px)` (`styles.css:2645-2655`). At 390px it
wraps, and the second row lands under Obsidian's navigation pill because the bar's `bottom`
(`:2646`) carries no term for it — while the mobile FAB on the same container already reads
`--db-mobile-navbar-height` (`:22569`) off the value `toolbar-renderer.ts:2410-2420` publishes.

Notion's density is the reference, not its exact controls: no capture in the 3,647-file harvest
shows a multi-cell selection in a Notion table. What the captures do show is the ceiling — a
selected cell carries **two** controls, and an editing cell's accessory bar is **one row** that does
not wrap
(`screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-01-d53b3912-f60a-4bd1-872e-18276fe2acd5.webp`).

### Constraints

- Nothing is removed. All three copy formats keep their strings (`i18n.ts:369-371`) and stay
  reachable.
- The count keeps its live region (`database-view.ts:7636-7641`, `:7660-7662`).
- Every control keeps the 44px floor on a phone (`styles.css:2660-2663`).

### Decision

**We chose**: at most six children — count, one **Copy** control, **Paste**, **Clear**, an
**overflow**, and the bulk-edit chip when exactly one column is selected — under `flex-wrap: nowrap`,
anchored above both the safe area and the navigation bar. The three copy formats move into the
overflow. Desktop keeps the same shape at its own 30px height
(`--db-selection-status-height`, `styles.css:925`).

**How it works**: the builder collapses the three copy buttons (`:7665-7681`) into one control plus
an overflow menu; the phone rule (`styles.css:2645-2655`) drops `flex-wrap: wrap` and `row-gap` and
adds `var(--db-mobile-navbar-height, 0px)` to its `bottom`; `toolbar-renderer.ts:2360`'s guard is
lifted so the height is published on a phone whether or not the FAB renders.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Six children, one row, overflow** | Fits 390px; every action still reachable; matches Notion's density | One extra tap for TSV and CSV | 8/10 |
| Horizontal scroll instead of wrap | No control moves | A scrollable bar hides actions behind a gesture with no affordance; the desktop bar already does this (`styles.css:2610`) and the phone rule explicitly turned it off (`:2651-2652`) | 4/10 |
| Icon-only controls | Fits without an overflow | The row branch already went icon-led (`database-view.ts:7722-7729`); "Copy TSV" versus "Copy CSV" has no icon that distinguishes them | 5/10 |
| Drop Markdown and CSV | Simplest | Removes shipped capability | 1/10 |

**Why this one**: it is the only option that fits the viewport without hiding an action behind an
unaffordanced gesture or deleting one.

### Consequences

**What improves**: the bar reads in one glance, and every control is fully on screen.

**What it costs**: two of three copy formats gain a tap. Mitigation: a lane row asserts all three
stay reachable.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A read-only view leaves an empty overflow | M | Edge case in `spec.md` §8; the overflow is not rendered when it would be empty |
| The nav-bar height is unpublished | M | The publisher's guard is lifted in the same leg; the 50px fallback (`toolbar-renderer.ts:2417`) covers an unmeasurable bar |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The wrap and the occlusion are both in the operator's capture |
| 2 | **Beyond Local Maxima?** | PASS | Four options weighed, including two that ship elsewhere in this file |
| 3 | **Sufficient?** | PASS | One builder change, one CSS rule, one lifted guard |
| 4 | **Fits Goal?** | PASS | REQ-001 |
| 5 | **Open Horizons?** | PASS | The overflow is where a later bulk action lands instead of widening the row |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `database-view.ts:7607-7712`, `styles.css:2590-2665`,
`toolbar-renderer.ts:2360` and `:2410-2420`, `i18n.ts:369-371`.

**How to roll back**: restore `flex-wrap: wrap` and the three separate buttons. The navigation-bar
term is independent and should not be rolled back with them.
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: Eight Notion-versus-Anytype conflicts, and none overrides a landed ruling

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Parent D15 |

---

### Context

The loop found eight places where a Notion pattern contradicts something a landed operator ruling
already settled. Parent **D15** decides what happens to them: the conflict is named, a side is
proposed with a reason, and no ruling is overridden. This ADR is `Accepted` because it changes
nothing — it records the status quo so that a later reader does not rediscover eight conflicts as
eight new findings.

### Decision

**We chose**: keep every landed Anytype ruling. **Count of rulings overridden: zero.**

**The register** — permanent, and never a task:

| # | Conflict | Ruling of record | Disposition |
|---|----------|------------------|-------------|
| C-A | **Header slots.** Notion's plurality is title-only with zero actions (digest B1, B4, C1, C6, C10, C12, D2, D8, D9, E1 — ~10 of ~30 headered surfaces); we adopted Anytype's three slots with a centred title (`surface-shell.ts:253-290`) | `051` ADR-007, parity by default | **Keep Anytype.** Notion contradicts itself — the same "View options" sheet is zero-action at C10 and "Done"-trailing at D2 — which is weak evidence against a measured, adopted rule |
| C-B | **Close affordance.** Notion splits roughly 50/50 between an explicit close and handle-only, with no visible rule (A3/A11/B7 against B4/C1/C6) | `044` REQ-007, `051` ADR-007 exception **E1** — the 44px close, kept on the handle's 2.21:1 contrast | **Keep the 44px close.** Notion corroborates neither side, and the accessibility number does not move |
| C-C | **Grouped sections.** Notion iOS uses gutter bands between rounded cards (C10, D2, E1); ours are dividers inside one card (`styles.css:12408-12415`) | Parity by default | **Parked**, see ADR-006 |
| C-D | **Confirm shape.** Anytype silent (`design-trueup.md` row 1, "Not seen"); Notion consistent on both platforms (A4, C9, G3) | `051` ADR-007 **E4** closed the *whether* — no confirm for a single delete, an Undo toast instead. The *shape* of the surviving bulk confirm was never settled | **Adopt Notion**, as ADR-001. The one place it fills a silence rather than contradicting a ruling |
| C-E | **Desktop side panel.** Notion's config panels float, content-sized and inset (I4 ~190px, I10 ~340px); only the comments/inbox panel (I11) is edge-flush | Operator, 2026-09-06 ~10:55: *"Keep the overlay."* (`051` ADR-008 amendment; `roadmap.md` §6A) | **No action.** Recorded only: our 420px edge-docked shape is closer to Notion's I11 outlier than to its config-panel norm. Worth revisiting only if a second config surface adopts the shape (`051` T023) |
| C-F | **Commit placement.** Notion C11 uses a trailing "Save" in the header; ours is Anytype's full-width pill commit row | `051/design-trueup.md` row 19, FLIPPED | **Keep the pill.** A named divergence, and the mechanism for the alternative already exists unused (`mobile-bottom-sheet.ts:143`, `surface-shell.ts:260-288`) |
| C-G | **Desktop builder width.** Notion keeps filter and sort builders to single- or double-row anchored dropdowns (J2-J8); our condition panels are 440-560px | Already open at `roadmap.md` §7.11 | **No new action.** Owned where it already lives |
| C-H | **Keyboard.** Notion does not resize the sheet; rows below the focused field are simply covered, and "Done" repeats as a keyboard accessory (F2). We lift the sheet via `--db-keyboard-inset` (`mobile-bottom-sheet.ts:190` publishes `--db-keyboard-inset`; the sheet consumes it as `--db-mobile-sheet-bottom` at `styles.css:232` and `:245`) | No Anytype keyboard measurement exists in the true-up | **Keep the lift.** It is the accessibility-friendlier behaviour **[inference]** and no ruling says otherwise; verified on device as part of `067` AC-011 |

Two further items are recorded rather than actioned, because they belong to another packet:
**unsaved-state signalling** (digest D3/D4/C1/D7 — a dot on the filter pill, an orange "Save for
everyone" banner) belongs to `053`'s condition rows; and the **dark-theme capture gap** is Notion's,
not ours — zero dark-theme sheet, menu or dialog captures exist in the 3,647-file harvest (digest
K1/K2), so no dark-theme Notion claim is possible at all.

### Consequences

**What improves**: eight findings stop being loose. **What it costs**: nothing — no code moves.

**Risks**: a later loop re-reports one of these as new. Mitigation: this register, cited from
`spec.md` §12 and from `goal.md`'s completion criteria.

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Parent D15 requires the record |
| 2 | **Beyond Local Maxima?** | PASS | Each row names the alternative and why it lost |
| 3 | **Sufficient?** | PASS | A table; no mechanism |
| 4 | **Fits Goal?** | PASS | REQ-003 |
| 5 | **Open Horizons?** | PASS | Each row carries its citation, so any of them can be reopened against new evidence |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: nothing in `src/`. **How to roll back**: not applicable — the register is a record.
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: Grouped gutter bands stay parked behind an Anytype re-read

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

### Context

Notion's iOS sheets separate logical groups with a background gutter band between rounded cards —
five groups in one sheet at digest C10, and the same at D2 and E1. Ours draws dividers inside one
card via `.db-panel-row` (`styles.css:12408-12415`), which matches Anytype. The digest's own ruling
is explicit: *"nothing here licenses adopting it"* (§4 P4, §6 Q3), because under parity-by-default
the question is what **Anytype's** multi-section sheets do, and that read was never taken.

### Constraints

- Every registered stacked pair's rect assertions would move with a band, so no band lands without
  a lane-row update in the same commit.
- The row-padding floor the grammar already measures stays (`sheet-grammar.ts:52`,
  `ROW_PADDING_FLOOR_PX = 2`).

### Decision

**We chose**: park it, and name the precondition — a re-read of Anytype's own multi-section sheets,
which is the operator's to schedule.

**How it works**: nothing is built. If the re-read licenses it, the sketch is a `.db-sheet-group`
wrapper per logical group, each its own rounded card at `--db-radius-lg` with `overflow: hidden`,
and an 8px band of page background showing between two cards — a gap, not a divider inside one card.
Threshold if licensed: band height 8px ± 1.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Park behind the re-read** | Honours parity-by-default; costs nothing | The question stays open | 8/10 |
| Build it from Notion alone | Visible improvement | Contradicts the digest's own ruling and parent D15 | 2/10 |
| Close it as refused | Removes an open question | Refusing on absent evidence is the same error as adopting on it | 3/10 |

**Why this one**: the missing input is an Anytype read nobody has taken, and neither adopting nor
refusing is decidable without it.

### Consequences

**What improves**: the question has a named precondition instead of being an open bullet.

**What it costs**: it stays open. Mitigation: AC-007 accepts a recorded park as closure.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The park is read as a refusal | L | AC-007's wording distinguishes the two |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The digest names it as an open question for the loop |
| 2 | **Beyond Local Maxima?** | PASS | Three dispositions weighed |
| 3 | **Sufficient?** | PASS | A recorded park plus a precondition |
| 4 | **Fits Goal?** | PASS | REQ-004 |
| 5 | **Open Horizons?** | PASS | The sketch and its threshold survive for whoever takes the re-read |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: nothing in `src/`. **How to roll back**: not applicable.
<!-- /ANCHOR:adr-006 -->

---
