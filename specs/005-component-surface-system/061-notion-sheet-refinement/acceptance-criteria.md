---
title: "Acceptance Criteria: Notion Sheet Refinement"
description: "The thresholds that close the Notion refinement of the sheet family: the tap that edits, the single-row selection bar, its clearance over the phone nav bar, the confirm card, and the register that overrides nothing."
trigger_phrases:
  - "061 acceptance criteria"
  - "cell menu threshold"
  - "selection bar wrap threshold"
  - "confirm card inset"
  - "cell selection pill threshold"
  - "nav pill clearance threshold"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-06T19:30:00Z"
    last_updated_by: "design-research-session"
    recent_action: "Re-cut AC-002 and AC-003 to the anchored pill; added AC-008 for desktop"
    next_safe_action: "Take AC-002 red-first; the wrapping bar is the failing state"
    blockers:
      - "AC-005 is the operator's sign-off on the confirm card"
      - "AC-007 is parked on an Anytype capture re-read the operator schedules"
    key_files:
      - "src/views/database-view.ts"
      - "src/views/record-surface/cell-editor-text.ts"
      - "src/views/confirm-sheet.ts"
      - "styles.css"
      - "tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-061-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "No existing acceptance row owns the confirm's shape; 051 AC-012 is a count over design-trueup cells"
      - "The device questions attach to 067 AC-011 rather than opening a fourth device owner"
      - "The value editor is drawn at the cell — three of four reference products do, and P9 was about pickers"
      - "A phone grows no bottom-docked selection bar; zero of four references have one"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Sheet Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** `005-component-surface-system/061-notion-sheet-refinement`
**Level:** 3
**Status:** Draft
**Date:** 2026-09-06 (AC-002, AC-003 and AC-008 re-cut 19:30 on the operator's four-reference ruling)

Every threshold below was **observed red on the tree at `865b622b`** while this packet was opened,
with the `file:line` in the Verification cell, and each was re-read on `origin/main` at `9ad2fb34`
when the rows were re-cut. Two of the eight are the operator's and cannot be closed from this
repository.

**AC-002, AC-003 and AC-008 changed shape on 2026-09-06 at 19:30.** They were written against a
bottom-docked bar collapsed to six children; the operator's four-reference ruling
(*"Check anytype, evernote, fibery and find best ui ux approach for this"*) established that **zero
of four reference products dock a labelled action bar to the frame's bottom edge**, and `ADR-004`
was rewritten around an anchored pill. The rows below assert the pill. AC-002 and AC-003 keep their
IDs because their subject — what the selection's chrome is and where it sits — did not change; only
the answer did.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a phone and an editable, non-title cell, **When** it is tapped once, **Then** that column's value editor opens and the count of `.db-selection-status-bar` elements in the container reads **0**; **and Given** a mouse on desktop, **When** a cell is clicked, **Then** the selection grammar is byte-unchanged | The existing selection legs in `tools/storybook/verify-placement.mjs` (`:884`, `:894`, `:10622`) asserting bar absence after a touch tap, with a negative control that restores the fall-through and requires the count to go to 1. **Today: red.** `resolveCellTapAction` already answers `edit-cell` for this cell (`table-cell-gesture.ts:269-273`), but the caller returns early only on `open-record` (`database-view.ts:4791`) and then runs `nextCellRange`, `renderCellSelectionClasses` and `renderSelectionStatusBar` on the same press (`:4795-4803`). The embedded renderer repeats it at `embedded-database-renderer.ts:4384-4401` | Unmet | - |
| AC-002 | REQ-001 | **Given** selection mode entered by a long press on a cell, on a 390px viewport, **Then** the container renders **0** `.db-selection-status-bar` elements and exactly **1** `.db-cell-selection-pill`; **and Then** the pill's child count reads exactly **3** — the live count, one `Copy`, one `···` — its computed `flex-wrap` reads `nowrap`, its measured height reads **44px**, and every child's hit box measures **≥ 44 × 44px**; **and Then** each of Copy TSV, Copy Markdown, Copy CSV, Paste, Fill, Bulk edit and Clear is reachable within **one** tap of `···`, in the sheet it opens | A pill-shape assertion added to the existing `verify-placement.mjs` selection legs (`:884`, `:894`, `:10622`), plus a reachability assertion enumerating the `···` sheet's rows, each with a negative control — restore the phone `.db-selection-status-bar` rule and require the bar count to go to 1, and drop a sheet row and require the reachability count to fall. **Today: red twice over.** The bar builds **eight** children for one selected cell — clear pill (`database-view.ts:7643`), count badge (`:7657`), Copy TSV (`:7665`), Copy Markdown (`:7671`), Copy CSV (`:7677`), Paste (`:7683`), the bulk-edit chip or Fill (`:7688-7705`), Clear (`:7707`) — into a row declared `flex-wrap: wrap` with `row-gap` and `max-width: calc(100vw - 32px)` (`styles.css:2645-2654`), and **no `.db-cell-selection-pill` exists in the tree at all**. The operator's capture shows the wrap. **Source:** ADR-004, decided on ADR-000's four-product read | Unmet | - |
| AC-003 | REQ-001 | **Given** a phone with Obsidian's navigation bar present and a selection near the bottom of the grid, **Then** the intersection area between the pill's rect and the navigation bar's rect reads **0px²**, and the pill's own bottom edge resolves at or above `max(env(safe-area-inset-bottom), var(--db-mobile-navbar-height, 0px)) + 8px`; **and Given** a phone container on which no FAB rendered, **Then** `--db-mobile-navbar-height` still resolves to a non-zero value; **and Given** the pill anchored to a range, **Then** its rect is fully inside the grid's scroll viewport with a **≥ 8px** margin on each side, and it sits **8px** above the range's top edge, or 8px below when there is no room above; **and Given** any open cell editor, **Then** the pill count reads **0** — every editor claims the bottom dock | The clearance and clamp assertions added to the same `verify-placement.mjs` legs against a stand-in `.mobile-navbar` rect, with negative controls that drop the navbar term and require overlap, and that widen the range past the viewport and require the clamp to hold. **Today: red three times.** The bar's `bottom` is `max(16px, env(safe-area-inset-bottom), var(--db-keyboard-inset, 0px))` (`styles.css:2646`) with **no navigation-bar term**, while the mobile FAB on the same container already reads `calc(20px + env(safe-area-inset-bottom) + var(--db-mobile-navbar-height, 0px))` (`:22569`) off the value `toolbar-renderer.ts:2410-2419` publishes; that publisher runs only inside the New-button build (`:2362`), so a view without a FAB never gets the value; and `openTextPopoverEditor` (`cell-editor-text.ts:331`) never calls `claimBottomDock`, where `openSingleLineEditor` claims at `:212` and releases at `:233` — so the `body.db-bottom-dock-taken` rule that hides the chrome (`styles.css:2635-2637`) does not fire for a multi-line text cell, which is the operator's second capture. **Trap:** a `var()` that misses does not fail, the silence `styles.css:2639-2644` already documents. **Source:** ADR-004 | Unmet | - |
| AC-004 | REQ-002 | **Given** a destructive confirm on a phone, **Then** its frame is inset **≥ 16px** on all four edges, its radius computes to `--db-radius-xl` on all four corners, and its actions are stacked full width at **≥ 44px** each; **and Given** the same confirm on desktop, **Then** its actions are stacked full width while every non-confirm modal footer stays side-by-side and right-aligned; **and Then** `openAndWait` still resolves `false` on Escape, on an outside press and on a drag dismissal | The `confirm` row in `tools/live/sheet-grammar.mjs` gains inset, radius and action-layout columns measured off the shipped `buildConfirmSheetBody`, with a negative control that strips the card class and requires red — the pattern the row's existing 8 of 8 columns already use. **Today: red on every clause.** The sheet is flush: `left: 0 !important; right: 0 !important; bottom: var(--db-mobile-sheet-bottom, 0px) !important` (`styles.css:230-232`), radius `var(--db-radius-lg) var(--db-radius-lg) 0 0` (`:265`). The action row is `display: flex; flex-wrap: wrap; justify-content: flex-end` (`:8592-8595`) with **no** `min-height` on its buttons, and `buildConfirmSheetBody` appends cancel, optional secondary, then confirm into that one row (`confirm-sheet.ts:54-71`). The dismissal contract is the one clause already green (`confirm-modal.ts:6-8`) and it must stay green | Unmet | - |
| AC-005 | REQ-002 | **Given** a released build, **When** the operator opens the redesigned cell menu on a table cell and a destructive confirm on iOS, **Then** they read them as the Notion-shaped surfaces they asked for | The operator's own words. **Only the operator closes this row; nothing in this repository can** (parent D3). It is read in the same sitting as `067` **AC-011**, and adds two questions to that sitting's checklist: does the bar clear the navigation pill on the real device, and does a tap on a cell open the editor without a bar flashing first. **No existing acceptance row owns the confirm's shape** — `051` AC-012 is a count over `design-trueup.md`'s decision cells, and the research's claim that it is the operator's row for the confirm is corrected in `goal.md` §4 | Unmet | - |
| AC-006 | REQ-003 | **Given** the eight Notion-versus-Anytype conflicts the loop named, **Then** `decision-record.md` carries one register row for each — header slots, close affordance, grouped sections, confirm shape, desktop side panel, commit placement, desktop builder width, keyboard behaviour — each citing its ruling of record, and the count of landed rulings **overridden** reads **zero** | A count over the register's rows against the loop's §7 table, and a read of each row's ruling citation. **Today: red because the register does not exist** — the eight conflicts live in `research/research.md` §7 and in no packet document. Under parent **D15** a Notion finding that contradicts a landed ruling becomes a **Proposed** ADR and stops there; ADR-005 is that record | Unmet | - |
| AC-007 | REQ-004 | **Given** Notion's grouped gutter bands (digest C10, D2, E1), **Then** either they are adopted after a re-read of Anytype's own multi-section sheets, or the question is **recorded as parked with that re-read named as its precondition** and no band is built | The recorded disposition in ADR-006. **Today: red because nothing is recorded.** Our grammar puts dividers inside one card (`styles.css:12408-12415`), matching Anytype; the digest's own ruling (§4 P4, §6 Q3) is that *"nothing here licenses adopting it."* The re-read is the operator's to schedule and it is not agent-closable | Unmet | - |
| AC-008 | REQ-001 | **Given** a cell selection on desktop, **Then** the bar's child count reads **≤ 5** — count, one `Copy`, `Paste`, `Clear`, `···` — its computed `flex-wrap` reads `nowrap`, its measured height stays at the declared **30px**, and Copy TSV, Copy Markdown, Copy CSV and Fill are reachable from the `···` **anchored menu**; **and Then** the click-selects / double-click-edits grammar is byte-unchanged | A child-count and menu-reachability assertion on the desktop profile of the same `verify-placement.mjs` legs, with a negative control that restores the eight separate buttons and requires the count to rise. **Today: red.** The same builder produces eight children on both platforms (`database-view.ts:7643-7712`) and there is no `···` menu; the 30px is declared and already green (`--db-selection-status-height`, `styles.css:925`) and must stay green. **Source:** ADR-004's desktop half — every one of the four references uses an anchored menu rather than a wide button row on a pointer surface (Notion web, Evernote web, Fibery, Anytype desktop) | Unmet | - |

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

**Closeable:** No — the packet is open and no row is `Met`. Eight rows now, AC-008 added with the desktop half of ADR-004.

Written when the packet closes, not before. What it will have to say: whether the cell menu shipped
as one leg or two, that ADR-001 to ADR-004 were all Accepted on the operator's 2026-09-06 19:00 ruling rather than waived, that
AC-005 was read against one build in the same sitting as `067` AC-011 rather than inferred from a
green lane, and whether AC-007 closed on a decision or on a recorded park.
<!-- /ANCHOR:closure -->
