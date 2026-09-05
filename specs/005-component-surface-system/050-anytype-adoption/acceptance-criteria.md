---
title: "Acceptance Criteria: Anytype Adoption"
description: "The criteria this packet must satisfy before it may be closed, one threshold per adoption item, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "050 acceptance criteria"
  - "adoption thresholds"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/050-anytype-adoption"
    last_updated_at: "2026-09-05T08:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored one threshold per adoption item"
    next_safe_action: "Execute T002, the red-first threshold measurements"
    blockers:
      - "AC-015 is the capture gate and blocks every other row's design"
      - "AC-017 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/board-renderer.ts"
      - "src/views/popover-position.ts"
      - "screenshots/anytype/README.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-050-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the running capture sweep reach the six surfaces the first pass could not?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Anytype Adoption

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `plan.md`'s ADR section.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/050-anytype-adoption
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
**AC-001 through AC-014 align to REQ-001 through REQ-014, which in turn carry `047` §11's own item
numbers** — so a reader can move between the research, the spec and this table without a mapping.
AC-015 is the capture gate, AC-016 the lane, AC-017 the operator's.

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present. Every threshold carries a failing number
observed before the fix (goal D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a view, **When** at least one filter or one sort is active, **Then** the chip row is present with a leading direction-coloured sort chip before the filter chips, and the toolbar's filter and sort trigger icons each report an **active** state; **and When** neither is active, **Then** the row is absent entirely — not empty — and the icons report the **add** state | Lane row asserting chip-row presence and icon state in all four combinations of filter × sort. Negative control: force the icon state constant, require red. Today: **no chip row exists and each icon has one state** | Unmet | - |
| AC-002 | REQ-002 | **Given** a database view, **When** a view is created or duplicated, **Then** the view-settings surface is open within **100ms** of the create completing | Lane row timing from the create callback to the settings mount. Today's failing value: **never — nothing opens**, `database-view.ts` returns to the board | Unmet | - |
| AC-003 | REQ-003 | **Given** a board whose content is taller than the viewport, **When** the page is scrolled anywhere short of the board's end, **Then** the horizontal scrollbar is at the **viewport** bottom and visible, with edge bleed rather than an inset gutter | Lane row comparing the scrollbar's `getBoundingClientRect().bottom` to the viewport height while `scrollHeight > innerHeight`. Negative control: restore board-bottom positioning, require red. Today: **the scrollbar sits at the board's own bottom** and is off-screen | Unmet | - |
| AC-004 | REQ-004 | **Given** a view, **When** it is duplicated, **Then** the duplicate's config equals the source's on every field except `id` and the name suffix, and its `id` is **new**; **and When** a view tab is right-clicked, **Then** a menu offers duplicate, rename and remove | Unit test on config equality plus a lane row for the tab menu. Today: **neither the action nor the menu exists** in `active-view-controls-renderer.ts` | Unmet | - |
| AC-005 | REQ-005 | **Given** two views each scrolled to a known offset, **When** the user switches away and back, **Then** each view's scroll offset is restored to within **±2px**, independently per view | Unit test on the store plus a lane row reading `scrollTop` after a round trip. Today's failing value: **0 — every switch returns to the top** | Unmet | - |
| AC-006 | REQ-006 | **Given** a cell whose anchor is within **92px** of the viewport's right edge, **When** its editor opens, **Then** the editor renders right-aligned and its right edge does not exceed the viewport's; **and Given** an anchor further than 92px, **Then** it renders left-aligned as today | Lane row sweeping anchor positions across the 92px boundary. Negative control: remove the flip, require the clipped width back. Today: **the editor clips**, and the clipped width is recorded in `checklist.md` | Unmet | - |
| AC-007 | REQ-007 | **Given** a board or table view with an active sort, **When** a row or card is dragged to a new position, **Then** a confirmation is raised; declining leaves both the order and the sort unchanged, and accepting clears the sort and commits the drop | Lane rows on both renderers, both branches. Today: **the drop is accepted and then silently undone by the sort** | Unmet | - |
| AC-008 | REQ-008 | **Given** any selection state including the fully-restricted one, **When** a row or bulk menu opens, **Then** its item count is **≥ 1** — the restricted case rendering a "No available actions" row — and **When** more than 1 row is selected, open and link are disabled, and **When** more than 10, open-in-new-tab is disabled | Unit test on the capability predicate plus a lane row per cap boundary (1, 2, 10, 11). Today: **a fully-restricted selection renders an empty menu** | Unmet | - |
| AC-009 | REQ-009 | **Given** a view whose source is missing or deleted, **Then** the "target" empty state renders; **and Given** a source that exists with zero matching rows, **Then** the "view" empty state renders; **and Given** a board whose group relation was deleted, **Then** its own state renders and points at view settings — each with its per-layout add affordance | Lane row asserting three distinct rendered states. Negative control: collapse two flavours into one, require red. Today: **all conditions render the same state** | Unmet | - |
| AC-010 | REQ-010 | **Given** a view carrying new-row default presets, **When** a row is created in it, **Then** every preset value is applied at creation; **and Given** a view with no presets, **Then** the new row is byte-identical to one created today | Unit test on the creation path plus a byte-comparison of the no-preset case against a pre-change baseline. Today: **no preset can be stored, so nothing is applied** | Unmet | - |
| AC-011 | REQ-011 | **Given** a sorted view, **When** a row's name is being typed, **Then** the row's index does not change until the edit commits or blurs, at which point it repositions exactly **once** | Lane row recording the row index across keystrokes. Today: **the row jumps mid-keystroke**, and the keystroke count before the first jump is recorded in `checklist.md` | Unmet | - |
| AC-012 | REQ-012 | **Given** an embedded view, **When** its container is swept from **250px** upward, **Then** the toolbar collapses on a measured natural-width comparison rather than a fixed breakpoint, and **no** control overflows its container at any width in the sweep | Lane row sweeping container widths and asserting zero overflow. Today: the first overflowing width is recorded in `checklist.md` | Unmet | - |
| AC-013 | REQ-013 | **Given** a phone at 390×844, **When** a filter or sort sheet opens, **Then** each supported property format renders its own condition row, and the sheet passes **all seven** of `044`'s `sheet-grammar` elements | `sheet-grammar` rows for the filter and sort sheets, registered red before the rows exist. Today: **0 of the phone filter surfaces render per-format rows** | Unmet | - |
| AC-014 | REQ-014 | **Given** an embedded view with more rows than one page, **When** it renders, **Then** it shows its page plus a "Load more" row and the virtualization path is **not** entered | Lane row asserting the "Load more" row's presence and the absence of the virtualization mount. Today: **the virtualization path is entered** | Unmet | - |
| AC-015 | REQ-000 | **Given** the Anytype capture sweep, **When** T001 has read it, **Then** `capture-alignment.md` carries one row per item naming the screen it is designed against or the gap the sweep left, and **no** item was implemented before its row existed | `capture-alignment.md` §2, fourteen rows; each named capture file resolves under `screenshots/anytype/`. **This row gates every other row's design** (goal D1) | Unmet | - |
| AC-016 | All | **Given** the gate, **When** `npm run gate` runs to completion and its status is read from `$?`, **Then** it exits **0** with one permanent row per item, each negative control observed **red then green**, `npm run replay` holds with reversed 0, and the `screenshots/project-manager/` board and gantt references are `pixelHash`-identical to their pre-phase baseline | `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; the replay's own reversed count; the parity recapture diff (goal D5) | Unmet | - |
| AC-017 | REQ-001, REQ-002, REQ-003 | **Given** a released build, **When** the operator opens the board and a table on iOS and on desktop, **Then** they read the adopted surfaces as the improvement they asked for | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in `plan.md`'s
ADR section. A waiver naming an ADR that is not there fails validation: the point
of a waiver is that someone recorded the reasoning, so an unbacked waiver is
treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Every row is open, which is correct for a packet opened the day its research landed. AC-015 is the
one that must move first: it is not a formality but the reason this phase exists in this shape —
`047` ranked fourteen items it could not see, because the environment it ran in could not click.
AC-017 is the operator's and is the only row that closes the ask behind the phase (parent D3).
<!-- /ANCHOR:closure -->
