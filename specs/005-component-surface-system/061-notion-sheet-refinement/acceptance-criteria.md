---
title: "Acceptance Criteria: Notion Sheet Refinement"
description: "The thresholds that close the Notion refinement of the sheet family: the tap that edits, the single-row selection bar, its clearance over the phone nav bar, the confirm card, and the register that overrides nothing."
trigger_phrases:
  - "061 acceptance criteria"
  - "cell menu threshold"
  - "selection bar wrap threshold"
  - "confirm card inset"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-06T17:40:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Authored seven thresholds from the Notion loop and the operator cell-menu report"
    next_safe_action: "Take AC-002 red-first; the eight-child wrapping row is already the failing state"
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
    open_questions:
      - "Does the value editor stay inline or become a pushed surface, against Notion digest P9"
    answered_questions:
      - "No existing acceptance row owns the confirm's shape; 051 AC-012 is a count over design-trueup cells"
      - "The device questions attach to 067 AC-011 rather than opening a fourth device owner"
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
**Date:** 2026-09-06

Every threshold below was **observed red on the tree at `865b622b`** while this packet was opened,
with the `file:line` in the Verification cell. Two of the seven are the operator's and cannot be
closed from this repository.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a phone and an editable, non-title cell, **When** it is tapped once, **Then** that column's value editor opens and the count of `.db-selection-status-bar` elements in the container reads **0**; **and Given** a mouse on desktop, **When** a cell is clicked, **Then** the selection grammar is byte-unchanged | The existing selection legs in `tools/storybook/verify-placement.mjs` (`:884`, `:894`, `:10622`) asserting bar absence after a touch tap, with a negative control that restores the fall-through and requires the count to go to 1. **Today: red.** `resolveCellTapAction` already answers `edit-cell` for this cell (`table-cell-gesture.ts:269-273`), but the caller returns early only on `open-record` (`database-view.ts:4791`) and then runs `nextCellRange`, `renderCellSelectionClasses` and `renderSelectionStatusBar` on the same press (`:4795-4803`). The embedded renderer repeats it at `embedded-database-renderer.ts:4384-4401` | Unmet | - |
| AC-002 | REQ-001 | **Given** selection mode with one cell selected on a 390px viewport, **Then** the bar renders as **one row** — `flex-wrap` computes to `nowrap`, the measured row count reads **1**, the child count reads **≤ 6**, and no child's rect is clipped by the bar's own box; **and Then** every one of Copy TSV, Copy Markdown and Copy CSV is still reachable, through the overflow if not directly | A wrap assertion added to the existing `verify-placement.mjs` selection legs, plus a reachability assertion over the overflow's items, with a negative control that restores `flex-wrap: wrap` and requires two rows. **Today: red.** The bar builds **eight** children for one selected cell — clear pill (`database-view.ts:7643`), count badge (`:7657`), Copy TSV (`:7665`), Copy Markdown (`:7671`), Copy CSV (`:7677`), Paste (`:7683`), the bulk-edit chip or Fill (`:7688-7705`), Clear (`:7707`) — into a row declared `flex-wrap: wrap` with `row-gap` and `max-width: calc(100vw - 32px)` (`styles.css:2645-2655`). The operator's capture shows the wrap | Unmet | - |
| AC-003 | REQ-001 | **Given** a phone with Obsidian's navigation bar present, **When** the selection bar is docked, **Then** the intersection area between the bar's rect and the navigation bar's rect reads **0px²**, and the bar's computed `bottom` carries the published navigation-bar height as a term; **and Given** any open cell editor, **Then** the bar is not rendered — every editor claims the bottom dock | The clearance assertion added to the same `verify-placement.mjs` legs against a stand-in `.mobile-navbar` rect, with a negative control that drops the term and requires overlap. **Today: red twice.** The bar's `bottom` is `max(16px, env(safe-area-inset-bottom), var(--db-keyboard-inset, 0px))` (`styles.css:2646`) with **no navigation-bar term**, while the mobile FAB on the same container already reads `calc(20px + env(safe-area-inset-bottom) + var(--db-mobile-navbar-height, 0px))` (`:22569`) off the value `toolbar-renderer.ts:2410-2420` publishes. And `openTextPopoverEditor` (`cell-editor-text.ts:331`) never calls `claimBottomDock`, where `openSingleLineEditor` claims at `:212` and releases at `:233` — so the `body.db-bottom-dock-taken` rule that hides the bar (`styles.css:2635-2637`) does not fire for a multi-line text cell, which is the operator's second capture | Unmet | - |
| AC-004 | REQ-002 | **Given** a destructive confirm on a phone, **Then** its frame is inset **≥ 16px** on all four edges, its radius computes to `--db-radius-xl` on all four corners, and its actions are stacked full width at **≥ 44px** each; **and Given** the same confirm on desktop, **Then** its actions are stacked full width while every non-confirm modal footer stays side-by-side and right-aligned; **and Then** `openAndWait` still resolves `false` on Escape, on an outside press and on a drag dismissal | The `confirm` row in `tools/live/sheet-grammar.mjs` gains inset, radius and action-layout columns measured off the shipped `buildConfirmSheetBody`, with a negative control that strips the card class and requires red — the pattern the row's existing 8 of 8 columns already use. **Today: red on every clause.** The sheet is flush: `left: 0 !important; right: 0 !important; bottom: var(--db-mobile-sheet-bottom, 0px) !important` (`styles.css:230-232`), radius `var(--db-radius-lg) var(--db-radius-lg) 0 0` (`:265`). The action row is `display: flex; flex-wrap: wrap; justify-content: flex-end` (`:8592-8595`) with **no** `min-height` on its buttons, and `buildConfirmSheetBody` appends cancel, optional secondary, then confirm into that one row (`confirm-sheet.ts:54-71`). The dismissal contract is the one clause already green (`confirm-modal.ts:6-8`) and it must stay green | Unmet | - |
| AC-005 | REQ-002 | **Given** a released build, **When** the operator opens the redesigned cell menu on a table cell and a destructive confirm on iOS, **Then** they read them as the Notion-shaped surfaces they asked for | The operator's own words. **Only the operator closes this row; nothing in this repository can** (parent D3). It is read in the same sitting as `067` **AC-011**, and adds two questions to that sitting's checklist: does the bar clear the navigation pill on the real device, and does a tap on a cell open the editor without a bar flashing first. **No existing acceptance row owns the confirm's shape** — `051` AC-012 is a count over `design-trueup.md`'s decision cells, and the research's claim that it is the operator's row for the confirm is corrected in `goal.md` §4 | Unmet | - |
| AC-006 | REQ-003 | **Given** the eight Notion-versus-Anytype conflicts the loop named, **Then** `decision-record.md` carries one register row for each — header slots, close affordance, grouped sections, confirm shape, desktop side panel, commit placement, desktop builder width, keyboard behaviour — each citing its ruling of record, and the count of landed rulings **overridden** reads **zero** | A count over the register's rows against the loop's §7 table, and a read of each row's ruling citation. **Today: red because the register does not exist** — the eight conflicts live in `research/research.md` §7 and in no packet document. Under parent **D15** a Notion finding that contradicts a landed ruling becomes a **Proposed** ADR and stops there; ADR-005 is that record | Unmet | - |
| AC-007 | REQ-004 | **Given** Notion's grouped gutter bands (digest C10, D2, E1), **Then** either they are adopted after a re-read of Anytype's own multi-section sheets, or the question is **recorded as parked with that re-read named as its precondition** and no band is built | The recorded disposition in ADR-006. **Today: red because nothing is recorded.** Our grammar puts dividers inside one card (`styles.css:12408-12415`), matching Anytype; the digest's own ruling (§4 P4, §6 Q3) is that *"nothing here licenses adopting it."* The re-read is the operator's to schedule and it is not agent-closable | Unmet | - |

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

**Closeable:** No — the packet is open and no row is `Met`.

Written when the packet closes, not before. What it will have to say: whether the cell menu shipped
as one leg or two, which of ADR-001 to ADR-004 the operator accepted and which were waived, that
AC-005 was read against one build in the same sitting as `067` AC-011 rather than inferred from a
green lane, and whether AC-007 closed on a decision or on a recorded park.
<!-- /ANCHOR:closure -->
