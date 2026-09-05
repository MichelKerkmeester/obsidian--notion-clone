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
    recent_action: "Restated six thresholds and rescoped three more against the capture sweep at T001"
    next_safe_action: "Execute T002, the red-first threshold measurements, against the restated wording"
    blockers:
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
      - "Should the view-tab context menu be built at all, given it was never captured and its actions are in the settings panel?"
    answered_questions:
      - "Does the capture sweep reach the six surfaces the first pass could not? Partly — view settings, the layout picker, the filter panel, the pickers and the object context menu were reached; a tab right-click, an open cell editor, a drag under a sort and any phone filter surface were not."
      - "Six thresholds asserted a failing value the tree does not have and were restated at T001 (ADR-004)." 
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
**Status:** Trued up against the capture sweep (T001, 2026-09-05)
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
| AC-001 | REQ-001 | **Restated at T001 (ADR-004).** **Given** a view, **When** at least one filter or one sort is active, **Then** the chip row is present with sort chips before filter chips and each trigger button carries a count badge; **and When** neither is active, **Then** the row is absent entirely — not empty — and no badge renders; **and** the view-settings panel's Filter and Sort rows each carry an `N applied` value | Lane row asserting chip-row presence and badge count in all four combinations of filter × sort, plus the two settings rows. Negative controls on shipped behaviour: remove the auto-hide at `active-view-controls-renderer.ts:93`, and remove `setBadge` at `toolbar-renderer.ts:2575` — require red on both. Today: **the chip row and the badge already ship**; the `N applied` value reads **0 of 2 rows**. The original premise — no chip row, one icon state — was false and could not be observed red | Unmet | - |
| AC-002 | REQ-002 | **Given** a database view, **When** a view is created or duplicated, **Then** the view-settings surface is open within **100ms** of the create completing, at **360px wide with 28px rows, an 8px radius and 16px horizontal padding**, gaining one `Groups` row on a board | Lane row timing from the create callback to the settings mount, plus a geometry assertion. Today's failing value: **never — nothing opens**, `database-view.ts` returns to the board. Anytype's ~50ms is `047`'s source read and is **not observable in any capture**; the 100ms budget is ours. The geometry is measured off `anytype-view-settings-panel-dark.png` and 360px is the top of our own `panel` role | Unmet | - |
| AC-003 | REQ-003 | **Rescoped at T001.** **Given** a **board or a table** whose content is taller than the viewport, **When** the page is scrolled anywhere short of the content's end, **Then** the horizontal scrollbar is at the **viewport** bottom and visible — **10px tall, bottom edge 8px above the viewport's, track spanning the container's full content width with no gutter inset** | Lane rows on both renderers comparing the scrollbar's `getBoundingClientRect().bottom` to the viewport height while `scrollHeight > innerHeight`. Negative control: restore content-bottom positioning, require red. Today: **neither surface has a sticky scrollbar at all.** The capture shows the grid carrying the identical treatment to the kanban at the identical geometry, so this is a dataview affordance and not a board one (`design-trueup.md` C3) | Unmet | - |
| AC-004 | REQ-004 | **Trued up at T001.** **Given** a view, **When** it is duplicated, **Then** the duplicate's config equals the source's on every field except `id` and the name suffix, and its `id` is **new**; **and** `Duplicate view` and `Remove view` appear as the last section of the view-settings panel, below a divider | Unit test on config equality plus a lane row for the two settings rows. Today: **a per-view duplicate does not exist** — `duplicateCurrentDatabase` (`database-view.ts:3633-3650`) duplicates a whole database. The **view-tab context menu is dropped from this criterion**: it was never captured, its actions are where the capture puts them, and a right-click has no phone equivalent (`design-trueup.md` C4) | Unmet | - |
| AC-005 | REQ-005 | **Restated at T001 (ADR-004).** **Given** two views each scrolled to a known offset, **When** the user switches away and back, **Then** each view's scroll offset is restored to within **±2px**, independently per view, **through `database-viewport.ts`'s existing snapshot** rather than a second mechanism | Unit test on the store plus a lane row reading `scrollTop` after a round trip, and a check that no second snapshot mechanism was added. Today's failing value: **0 — every switch returns to the top**, because a view switch asks for `reset-top`. The restore machinery itself exists (`database-viewport.ts:37, :67, :76, :84`), so the item is a wiring, not a build | Unmet | - |
| AC-006 | REQ-006 | **Given** a cell whose anchor is within **92px** of the viewport's right edge, **When** its editor opens, **Then** the editor renders right-aligned; **and — the criterion that decides the item — no open editor's right edge exceeds the viewport's at any anchor position** | Lane row sweeping anchor positions across the 92px boundary and asserting the no-overflow criterion at every position. Negative control: remove the flip, require the clipped width back. Today: **the editor clips**, and the clipped width is recorded in `checklist.md`. The 92px figure is `047` §5's source read and **no capture shows an open editor near an edge** — it is kept as the trigger because a borrowed number beats an invented one, and the no-overflow criterion is what does not depend on it being right | Unmet | - |
| AC-007 | REQ-007 | **Given** a board or table view with an active sort, **When** a row or card is dragged to a new position, **Then** a confirmation is raised; declining leaves both the order and the sort unchanged, and accepting clears the sort and commits the drop | Lane rows on both renderers, both branches. Today: **the drop is accepted and then silently undone by the sort** | Unmet | - |
| AC-008 | REQ-008 | **Restated at T001 (ADR-004).** **Given** any capability state, **When** a row menu or the bulk field menu opens, **Then** its item count is **≥ 1** — the restricted case rendering a "No available actions" row. Anytype's numeric selection caps are **not adopted**: our row menu operates on one row and the caps have no referent | Unit test on the capability predicate plus one lane row per menu. Negative control on `row-menu.ts`: remove its unconditional first row, require red. Today: **`row-menu.ts` cannot render empty** — `menu.openNote` is unconditional — so the original premise was false for it; **`bulk-edit-field-menu.ts:31-45` can**, mapping a possibly empty `getBulkEditableColumns(...)` straight into `options` with no floor. That one file is the failing value | Unmet | - |
| AC-009 | REQ-009 | **Restated at T001 (ADR-004).** **Given** a view whose source is missing or deleted, **Then** `no-database` renders; **and Given** a source that exists with zero matching rows, **Then** one of `no-matching-data` / `filter-empty` / `search-empty` / `filter-and-search-empty` renders according to `getEmptyStateReason`; **and Given** a board whose group relation was deleted, **Then** its own state renders and points at view settings | Lane row asserting the distinct rendered states. Negative control: collapse two reasons into one, require red. Today: **twelve reasons already render distinctly** (`empty-state-renderer.ts:24-36`, catalogue `:143-203`, diagnosis `:209-216`), so the original premise — all conditions render the same state — was false. The **deleted-group-relation state is the one of thirteen that does not exist**; `empty-group` means "this group has no rows", which is a different thing | Unmet | - |
| AC-010 | REQ-010 | **Narrowed at T001.** **Given** a view carrying new-row default **field values**, **When** a row is created in it, **Then** every default is applied at creation; **and Given** a view with none, **Then** the new row is byte-identical to one created today | Unit test on the creation path plus a byte-comparison of the no-default case against a pre-change baseline. Today: **no field default can be stored, so nothing is applied.** A per-view **status** preset already ships (`view-config-panel-renderer.ts:259, :265, :403-407`) and a per-database template at `:558-612`, so field values are the whole residue. The captured settings panel has no per-view default-template row in either form, contradicting `047` §8 (`design-trueup.md` C7) | Unmet | - |
| AC-011 | REQ-011 | **Given** a sorted view, **When** a row's name is being typed, **Then** the row's index does not change until the edit commits or blurs, at which point it repositions exactly **once** | Lane row recording the row index across keystrokes. Today: **the row jumps mid-keystroke**, and the keystroke count before the first jump is recorded in `checklist.md` | Unmet | - |
| AC-012 | REQ-012 | **Given** an embedded view, **When** its container is swept from **250px** upward, **Then** the toolbar collapses on a measured natural-width comparison rather than a fixed breakpoint, dropping whole controls in order — icon cluster before the `New` button, tab row to a dropdown before either — and **no** control overflows its container at any width in the sweep | Lane row sweeping container widths and asserting zero overflow plus the drop order. Today: `embedded-database-renderer.ts` has **no `ResizeObserver`** (the only one in `src/views` is `chart-renderer.ts:876`), and the first overflowing width is recorded in `checklist.md`. The drop order is measured off the inline and phone captures; the measured-versus-breakpoint mechanism is source-derived and no capture can decide it | Unmet | - |
| AC-013 | REQ-013 | **Restated at T001 (ADR-004).** **Given** a phone at 390×844, **When** a filter or sort sheet opens, **Then** it passes **all seven** of `044`'s `sheet-grammar` elements, and each of the eight already-registered stacked pairs off those two sheets conforms to `048`'s model | The existing `sheet-grammar` rows for `filter-panel` and `sort-panel` (`tools/live/sheet-grammar.mjs`), extended to the three elements a still capture cannot show — segmented choices, keyboard avoidance, safe-area inset — plus the eight stacked pairs. Today: **the per-format rows already render on both viewports** and both sheets are already registered, so the original premise (0 surfaces) was false and the original red-first instruction ("register the sheet before the rows exist") was unexecutable. The failing value is **how many of seven each sheet passes today** | Unmet | - |
| AC-014 | REQ-014 | **Restated at T001 (ADR-004).** **Given** an embedded view with more than **60** rows — Anytype's own captured default page limit — **When** it renders, **Then** it shows its page plus a "Load more" row, and no virtualization mount appears | Lane row asserting the page limit is honoured, the "Load more" row is present, and no virtualization mount exists. Today: **all rows render, with no page limit and no "Load more" row.** The original premise — the virtualization path is entered — was false: no `virtualis*` match exists anywhere in `src/views`, so the clause becomes a regression guard rather than today's red | Unmet | - |
| AC-015 | REQ-000 | **Given** the Anytype capture sweep, **When** T001 has read it, **Then** `design-trueup.md` carries one section per item naming the screen it is designed against or the gap the sweep left, and **no** item was implemented before its section existed | `design-trueup.md` §3, fourteen sections; §4's roll-up names the five items with no capture (REQ-005, REQ-006, REQ-007, REQ-011, REQ-013) and the seven contradictions; every named capture file resolves under `screenshots/anytype/`. **This row gated every other row's design and has released them** (goal D1) | Met | - |
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

AC-015 has moved, and it was worth making a gate. `047` ranked fourteen items it could not see,
because the environment it ran in could not click. Reading the sweep found seven places where the
shipped build does not do what the research says, and six places where our own tree already does what
the packet said it did not — and that second half is the one that matters for D2, because a threshold
whose failing value is asserted wrongly cannot be observed red.

Six rows were restated for exactly that reason (ADR-004): **AC-001, AC-005, AC-008, AC-009, AC-013,
AC-014**. Three more were rescoped or narrowed against the captures rather than the research:
**AC-003** to every horizontally scrolling surface, **AC-004** away from the uncaptured tab context
menu, **AC-010** down to per-field defaults. The rest gained measured geometry.

Every other row is open, which is correct. AC-017 is the operator's and is the only row that closes
the ask behind the phase (parent D3).
<!-- /ANCHOR:closure -->
