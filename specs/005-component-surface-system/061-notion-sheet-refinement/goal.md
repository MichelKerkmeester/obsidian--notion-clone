---
title: "Goal: Notion Sheet Refinement"
description: "The two shapes Notion supplies where Anytype is silent — the confirm card and the table cell action menu — landed additively over the sheet family, with every Notion-versus-Anytype conflict recorded and none overridden."
trigger_phrases:
  - "061 goal"
  - "notion sheet refinement"
  - "confirm card"
  - "cell action menu"
  - "selection mode bar"
  - "cell selection pill"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-06T19:30:00Z"
    last_updated_by: "design-research-session"
    recent_action: "Re-cut completion criteria 2 and 3 to the anchored-pill model; still seven criteria"
    next_safe_action: "Take AC-002 red-first; no pill exists in the tree"
    blockers:
      - "AC-005 is the operator's sign-off on the confirm card and nothing here can close it"
      - "AC-007 is parked on an Anytype multi-section capture re-read the operator schedules"
    key_files:
      - "src/views/database-view.ts"
      - "src/views/record-surface/cell-editor-text.ts"
      - "src/views/table-cell-gesture.ts"
      - "src/views/confirm-sheet.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-061-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Notion contributes shape and arrangement only; the digest's thumbnails carry no sampled colour or timing"
      - "Eight Notion-versus-Anytype conflicts exist and none overrides a landed ruling"
      - "The confirm keeps its sheet mount and gains a declared card frame role — operator, 19:00"
      - "The copy formats collapse, and the phone bar they sat in is deleted rather than narrowed"
---
# Goal: Notion Sheet Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE. It is the session objective and must stay
> true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Land the two shapes Notion supplies where Anytype is silent — the destructive
confirm as a margined centred card, and the table cell action menu as a Notion-shaped tap and an
explicit selection mode — additively over the sheet family, without overriding a landed ruling and
without restating a row `067-sheet-family-remediation` already owns.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Additive, per parent D15.** A Notion finding never silently overrides a landed Anytype ruling. Where the two disagree, the conflict is named, a side is proposed with a reason, and the ADR stays **Proposed** until the operator rules. Eight such conflicts exist and **none** is overridden here. |
| D2 | **This packet does not restate `067`.** The Notion loop and `067`'s own loop found the same scrim, motion band, primary pill, trailing chip, row pitch and device pass. Those are `067` REQ-003, REQ-005, REQ-006, REQ-007 and REQ-011 and they stay there. Where the Notion read adds something to one of them, this packet **cites the `067` row and adds only the Notion-specific refinement**. |
| D3 | **Red first, per criterion, on a threshold.** Every criterion carries one number or one boolean observed failing on this tree, with the `file:line` in its Verification cell. No threshold is written that cannot be made to fail. |
| D4 | **The operator's cell-menu report is P0 and outranks the loop's own ranking.** The research ranked the confirm card first over 77 screens; the operator reported the cell menu on 2026-09-06 at 17:07 with two captures. The report wins the ordering; both ship. |
| D5 | **Existing lanes only.** `tools/live/sheet-grammar.mjs`, `tools/storybook/verify-placement.mjs` and `tools/live/touch-targets.mjs` gain rows. No new lane is created, and the operator's device rows are never ticked from here. |
| D6 | **`044`'s grammar, `048`'s stacking and `051`'s shell are constraints, not deliverables.** The fourteen registered surfaces and thirty-one registered stacked pairs must still pass after every leg. Nothing here re-specifies them. |
| D7 | **Notion contributes shape and arrangement only.** Every iOS file in the harvest is a 299×678-680px thumbnail with named rather than sampled colours (`051/notion-screens-digest.md` §1). **No Notion-derived pixel, colour, scrim value or timing is adopted.** Where a number is needed it comes from `050`'s Anytype measurements or from a constant already declared in `surface-shell.ts`. |
| D8 | **One leg, one file group** (`051` D7 carried). `styles.css` is the exception every leg may reach and is serialized by the parent's CSS lane. |

### Operator copy

The operator holds this directive as the session objective, and that copy judges completion, not
this file. Whenever anything above the log changes, resend the full text of this file in chat.

<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] A single tap on an editable, non-title cell on a phone opens **that column's value editor and
      nothing else** — the selection status bar is not built, and `renderSelectionStatusBar` is not
      reached on the `edit-cell` branch. Today the branch falls through and does both
      (`database-view.ts:4791-4803`), which is the second of the operator's two captures.
      **Half met, measured at the landing and left unticked for the half that is not.** The editor
      opens and `.db-selection-status-bar` reads **0** — the press branch returns on `touch` before
      `nextCellRange`. But *nothing else* is not yet true: `CellRenderer.selectCell` focuses the `td`
      (`cell-renderer.ts:910-912`) on the way to the editor, and this view's `td` `focus` listener
      (`database-view.ts:4770-4777`) assigns `cellSelection` and calls `renderSelectionStatusBar`,
      so the tap paints `.db-cell-range-selected` and builds the pill. The pill is hidden only while
      an editor holds the bottom dock, and is visible the moment that editor closes — measured on
      the shipped renderers at 402px. The path predates this packet; closing it is a change to the
      focus listener rather than to the press branch this row was written against.
- [x] Selection is an **explicit mode entered by a long press**, and a phone builds **no bottom-docked
      bar at all**: `.db-selection-status-bar` renders **0** times and `.db-cell-selection-pill`
      renders exactly **1**, holding exactly **three** children — the live count, one `Copy`, one
      `···` — at `flex-wrap: nowrap`, 44px high, measured at 390px CSS width with every child's hit
      box at or above 44 x 44px. Each of Copy TSV, Copy Markdown, Copy CSV, Paste, Fill, Bulk edit
      and Clear is reachable within **one** tap of `···`. Desktop keeps its 30px bar at **five**
      children with an anchored `···` menu. Today the bar builds **eight** children for a one-cell
      selection (`database-view.ts:7643-7712`) into a `flex-wrap: wrap` row (`styles.css:2650`), and
      no pill exists in the tree at all. **Re-cut 2026-09-06 19:30**: this row asked for a six-child
      bar until the operator's four-reference ruling found that zero of four products dock one
      (ADR-000, ADR-004).
      **Met, measured on the shipped `TableRenderer`/`CellRenderer` plus this view's own
      `setupTableCellSelection` in headless Chrome.** Phone at 390px CSS width, coarse pointer
      forced at the engine: a 700ms hold paints the range and renders `.db-selection-status-bar` **0**
      times and `.db-cell-selection-pill` **1** time, with exactly **3** children — count badge
      85.7 x 44, `Copy` 44 x 44, `···` 44 x 44 — computed `flex-wrap: nowrap`, pill height **44px**,
      every child on one row. `···` opens the titled sheet carrying Copy TSV, Copy Markdown,
      Copy CSV, Paste, Bulk edit / Fill and Clear. Desktop at 1440x900: the bar measures **30px**
      with exactly **5** children — count, `Copy`, `Paste`, `Clear`, `···` — and `···` opens an
      anchored `.db-owned-menu`, not a sheet.
- [x] The pill is anchored to the selection and clamped clear of Obsidian's phone navigation bar as
      well as the safe area: it sits 8px above the range's top edge, or 8px below where there is no
      room; its rect stays fully inside the grid's scroll viewport with a >= 8px margin; its bottom
      edge resolves at or above `max(env(safe-area-inset-bottom), var(--db-mobile-navbar-height, 0px))
      + 8px`, the same published value the mobile FAB already reads (`styles.css:22569`), and
      `--db-mobile-navbar-height` resolves non-zero on a phone container with no FAB. Today the bar's
      `bottom` carries no navigation term (`styles.css:2646`), which is why the operator's first
      capture shows the second row under the nav pill, and the publisher runs only inside the
      New-button build (`toolbar-renderer.ts:2362`).
      **Met, measured.** With a selection at the grid's floor on a 402x874 phone and
      `--db-mobile-navbar-height` at 50px, the pill resolves to `bottom 808px` against the formula's
      own `874 - max(safe-area, 50) - 8 = 816`, so it sits **8px** clear of the value and **16px**
      clear of the navigation band itself. With room below and none above it sits 8px under the
      range. And the publisher now runs unconditionally on a phone: rendering the shipped
      `ToolbarRenderer` with `hideHeaderChrome: true` — a view that draws no New button —
      still publishes `--db-mobile-navbar-height: 50px` on the container.
- [x] The destructive confirm presents as a **card**: inset **≥ 16px on every frame edge**, radius
      `--db-radius-xl` on all four corners, actions **stacked full width** at **≥ 44px** each, on
      the phone and on desktop, with `openAndWait` still resolving `false` on Escape, outside press
      and drag. Today it is flush at 0/0/0 (`styles.css:230-232`) with a right-aligned side-by-side
      action row (`styles.css:8592-8598`).
      **Today: 0px** of inset on all four edges (`styles.css:230-232` resolved `inset: auto 0 0`)
      and a single side-by-side action row; the failing pair this tick moved from is **0px inset,
      1 action row**, against **41px inset, 2 rows** now.
      **Met.** The four committed captures show the centred card in both themes and in both the
      standalone and stacked-over-a-parent variants: a 320px card on a 402px frame, so 41px of inset
      on the side edges and over 300px top and bottom, `--db-radius-xl` on all four corners.
      The footer was measured through the shipped `buildConfirmSheetBody` with `stackedActions` on,
      under the shipped stylesheet, at **both** widths: `flex-direction: column`,
      `align-items: stretch`, both buttons full width, Cancel **44px** and the destructive
      `mod-warning` **50px**, on two rows. `openAndWait`'s Escape, outside-press and drag paths are
      untouched by this change — it adds a class and a declared frame role, and no close path.
- [ ] The operator reads the redesigned cell menu and the confirm card on iOS and says so. **Only
      the operator closes this** (parent D3); it is read in the same sitting as `067` AC-011.
- [x] `decision-record.md` carries one row per Notion-versus-Anytype conflict the loop named, all
      eight of them, each with its ruling citation, and the count of landed rulings **overridden**
      reads **zero**. **Today: 0** of the eight conflicts carried a register row — the count **was 0**
      before ADR-005 was authored and reads **8** now. **Met:** ADR-005's register carries C-A to C-H with a ruling of record in each
      row, and states the overridden count as zero both in the ADR body and in the packet's
      continuity frontmatter.
- [x] The grouped-band question is either decided against a re-read of Anytype's own multi-section
      sheets, or **recorded as parked with the re-read named as its precondition**. It is not built
      from Notion alone. **Met by the parked branch:** ADR-006 is `Proposed`, names the Anytype
      multi-section re-read as its own stated precondition, and no gutter band was built.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This synthesis, 2026-09-06, from this packet's own `research/` (the Notion lineage, moved here from `051` where it ran) plus the operator's 17:07 report |
| Every threshold observed red | Done | Each `file:line` in `acceptance-criteria.md`'s Verification column, read on this tree |
| Implementation | Pending | No source file has been touched |

### Deviations and findings

| Item | Note |
|------|------|
| **Four of the research loop's own citations did not survive the check** | Verified rather than taken on report, the way `067` verified its loop. (a) The loop cited `SheetChromeOptions` at `mobile-bottom-sheet.ts:64-94`; the interface is at **`:29-45`** and `:57-92` is `applySheetChrome`'s body. (b) The loop wrote *"AC-012 is the operator's row"* for the confirm's shape; `051` AC-012 is a count over `design-trueup.md`'s decision cells and has nothing to do with the confirm — **no existing acceptance row owns the confirm shape**, which is why AC-005 here is new. (c) The loop cited `.db-panel-row` at `styles.css:12366-12373`; that range is `.db-shell-header-leading` and the row rule is at **`:12408-12415`** — same content (`padding: 2px`, no `min-height`), wrong line. (d) The loop's R2, R3 and R4 (motion band, scrim measurement, device bundle) landed in `067` as REQ-006, REQ-003 and REQ-011 while the Notion lineage was still running; they are cited, not restated. |
| **The operator's report arrived after the loop closed** | The five-iteration lineage read the sheets/menus/dialogs digest, which never covered the table view. The cell-menu requirement is therefore evidenced from the captures directly — `screenshots/notion/ios/flows/reordering-a-table/*` and `screenshots/notion/ios/views/notion-ios-views-table-11-*` — and each is cited by filename in `spec.md` §4 rather than by digest screen-id. |
| **The mechanism the bar needs already exists** | `--db-mobile-navbar-height` is measured and published on the view container by `toolbar-renderer.ts:2410-2420`, and the mobile FAB already consumes it (`styles.css:22569`). The chrome that needs it — the bar today, the anchored pill after ADR-004 — is a sibling under the same container and simply does not read it. One caveat is recorded rather than assumed away: the publisher runs only when the FAB is rendered (`toolbar-renderer.ts:2360`), so the leg must make the publication unconditional on a phone or the bar must fall back to its own measurement — a `var()` that misses does not fail, which is the trap `styles.css:2640-2644` already documents for `--db-keyboard-inset`. |
| **The dock claim is inconsistent across cell editors** | `openSingleLineEditor` takes the bottom dock (`cell-editor-text.ts:212`) and releases it on close (`:233`); `openTextPopoverEditor` (`:331`) never claims it at all. That is exactly the operator's second capture: a multi-line text editor drawn over a bar that stayed docked. It is one line of a fix and it is inside REQ-001 rather than filed as a separate defect. |
<!-- /ANCHOR:log -->
