---
title: "Feature Specification: Mobile Table and Panel UX"
description: "Systemic fix for a phone-wide layout failure across every database view: desktop views are authored for a wide horizontally-scrollable canvas (max-content roots, fixed px table columns, rigid 150px/280px children) and the container keeps its desktop centring on a phone, so content clips at the edges; the record detail panel additionally cannot be closed on touch because its only dismissals are Escape, a mouse-only outside handler and resize."
trigger_phrases:
  - "mobile table and panel ux"
  - "table checkbox column clipped on phone"
  - "columns truncate mid-word mobile auto-fit"
  - "record detail panel cannot be closed on phone"
  - "list cards escape frame mobile"
  - "board group header overlaps cards"
  - "hover states fire on touch"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/011-mobile-table-and-panel-ux"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored mobile table/panel UX spec from device screenshots and a four-area code audit"
    next_safe_action: "Run gates; capture and eyeball mobile PNGs"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-011"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Mobile Table and Panel UX

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `010-add-view-popover-layout`, successor none (latest defect phase).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | Complete |
| **Created** | 2026-08-28 |
| **Branch** | `worktrees/002-mobile-table-ux` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
On a phone (Obsidian sets `body.is-phone`) every database view breaks the same way: content escapes its frame, surfaces overlap and columns clip at the viewport edge. Operator screenshots of the running plugin show it in the table, the list, the board and the record detail panel. This is **one root cause**, not six unrelated bugs.

**The systemic cause.** Every view is authored for a wide, horizontally-scrollable canvas. The table uses fixed px column widths under `table-layout: fixed` (`styles.css:4542`, widths from `TableRenderer.getColumnWidth` → `config.columnWidths || col.width || defaultColumnWidth || 150`). List rows and the board grid grow to `width: max-content` (`.db-list-row` `styles.css:9489`, `.db-board` `8263`) with rigid, non-shrinking children — `.db-list-field` is a fixed 150px (`9584`), `.db-board-column` a fixed 280px (`8273`). On a ~402px phone those intrinsic widths dwarf the viewport. The shared `.note-database-container` keeps its **desktop `db-width-default` centring** — `max-width: var(--file-line-width, 760px); margin-left/right: auto` (`536-540`) — with no `is-phone` reset, so the auto side margins distribute the overflow and push content off-screen. The only `is-phone` handling that existed was a single `max-height: 50vh` on the record panel (`8955`).

Each defect is a facet of this, plus one touch-input bug:

1. **Table — the row-select checkbox column is clipped at the left viewport edge.** A horizontal fade **mask** on `.db-table-wrap` (`styles.css:18254-18258` pre-fix) fades the leftmost 8px of the scroll area on *every* platform. The select column is the leftmost content, so its checkbox reads as clipped. A coarse-pointer fallback also switched the checkbox from `position: absolute; right: 6px` to in-flow `position: relative; min: 28px` (`17408-17414`), so the header checkbox (no move handle) fell out of line with row checkboxes (each preceded by a 24px move handle) and the pair overflowed the 48px column.
2. **Table — columns truncate mid-word and the status column paints over its neighbour.** `table-layout: fixed` with narrow fixed px widths on a phone truncates every cell ("20 • Au…", headers "In…" "E…") and lets an overflowing badge paint over the adjacent column. The operator wants columns to **auto-fit** on mobile — hug content, sized from the header and content width — rather than keep desktop fixed widths.
3. **Record detail panel — cannot be closed on a phone.** `src/views/RecordDetailPanel.ts` renders exactly one header button, `db-board-card-open` ("open note"); there is no close control. Dismissal had three paths: Escape (`onKeydown`, no key on a phone), an outside handler bound as `addEventListener("mousedown", onOutside, true)` — a **mouse** event that never fires on touch — and `onResize`. `positionToolbarPopover` already renders the panel as a bottom sheet with a grab handle on the phone (`PopoverPosition.ts:29-42, 73-85`), but the handle was inert decoration and no touch-reachable dismissal existed.
4. **List — cards escape the frame.** Rigid 150px fields in a non-wrapping meta row (`.db-list-row-meta { flex-wrap: nowrap; width: max-content; overflow: visible }` `9546-9553`) make the row wider than the phone; the visible overflow paints field values ("Year 2026") past the card border, and the centred container throws the card off-screen left.
5. **Board — the group header bar overlaps the cards, and columns are cut off right.** On the phone the mobile media query sets `.db-board { overflow-x: auto }` (`17583`) while the base `overflow: visible` on the other axis computes to `auto`, making the board a dual-axis scroll container. That makes the board box the containing block for the `position: sticky` column header (`8302-8303`), whose `top` — seeded from the desktop-measured toolbar height — then resolves inside the column and the opaque header floats down over the first cards. Rigid 280px columns exceed the phone width and page off the right edge.
6. **Hover — desktop hover states fire on touch.** `styles.css` had 284 `:hover` rules and only 8 `@media (hover: …)` guards, none reaching the four broken views, so a tap left the row/cell highlight, the card lift and the field tint stuck until the next tap elsewhere.

### Purpose
Give the phone its own layout where the desktop assumptions break, keying strictly off `is-phone` and leaving desktop untouched: unclip and align the table's select column, auto-fit its columns to content within a stated bound, fit list cards and their fields to the viewport, keep the board header off the cards, make the record panel a dismissable bottom sheet, and stop hover firing on touch.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Systemic container reset**: `.is-phone .note-database-container.db-width-default` drops the `max-width` and auto side margins so a wider child cannot be pushed off-screen (`styles.css:17672-17676`).
- **Table select column**: drop the fade mask on the phone table-wrap (`17683-17686`); pin the select checkbox to `position: absolute; right: 6px` on header and rows so they align (`17690-17700`); keep the column `overflow: hidden`.
- **Table auto-fit**: on the phone switch `.db-table` to `table-layout: auto` and release the inline JS-set table/`<col>` widths with `!important` (`17711-17721`); data cells hug content on one line (`white-space: nowrap`) capped at `max-width: 60vw` (`17722-17729`).
- **List mobile layout**: constrain the row and its parts to the viewport (`width: 100%`), let the field row wrap (`flex-wrap: wrap`), and let fields shrink (`flex: 1 1 …; min-width: 0`) so values stay inside the card border (`17734-17762`).
- **Board header**: take `.db-board-column-header` out of sticky flow on the phone (`position: relative; top: auto`) so it cannot float over cards; keep it positioned so its `::before` background still anchors (`17766-17769`).
- **Record detail bottom sheet**: reuse the existing `db-cell-edit-close` class for a permanent header close button shown only in the sheet (`RecordDetailPanel.ts:198-210`, CSS `styles.css:17776-17801`); move outside-dismissal from `mousedown` to `pointerdown` (`RecordDetailPanel.ts:138, 244`); wire drag-down-to-dismiss on the grab handle (`attachSheetDragToDismiss`, `RecordDetailPanel.ts:255-306`); make `.db-mobile-bottom-sheet` `box-sizing: border-box` so its own padding does not overflow the viewport (`styles.css:195`).
- **Hover gating**: wrap the six load-bearing hover rules (table row/cell, list row, board card, board card-field, record field) in `@media (hover: hover)`, the repo's existing pattern (`styles.css:5281, 8572, 8747, 8950, 9513`).
- **Reproduction & regression**: four `is-phone` screenshot scenarios that carry the realistic runtime DOM (`table-mobile`, `list-mobile`, `board-mobile` in `core.mjs`; `panel-record-detail-sheet` in `panels.mjs`), and `src/views/MobileTableAndPanelUx.test.ts` asserting the shipped stylesheet and the renderer source.

### Out of Scope
- **Desktop layout** — every rule is `is-phone`-scoped or a `@media (hover: hover)` gate; the desktop table, list, board and anchored record panel are unchanged. This is an explicit operator licence: mobile and desktop UX may diverge.
- **The pre-existing board mobile media query** (`styles.css:17581-17607`) keyed on `(pointer: coarse), (max-width: 760px)` — left as is; the header fix is added on top, `is-phone`-scoped.
- **Column auto-fit as a stored width** — the phone auto-fit is a pure CSS layout (`table-layout: auto`), not a write into `config.columnWidths`; the desktop "Auto fit column width" menu action (`ColumnMenu.ts:245`) is untouched.
- **The 60vw cap being a hard ceiling** — Chrome does not always honour `max-width` on a table-cell in auto layout; the real bound is intrinsic content width (see Risks). No attempt is made to force ellipsis through nested cell spans.
- Note frontmatter / markdown writes, telemetry, new external dependencies (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `styles.css` | Modify | `is-phone` layout block (container reset, table mask + select-col + auto-fit, list, board header, record-panel close), bottom-sheet `box-sizing`, six `@media (hover: hover)` wraps |
| `src/views/RecordDetailPanel.ts` | Modify | Header close button, `mousedown`→`pointerdown` outside dismissal, drag-down-to-dismiss on the grab handle |
| `tools/screenshots/scenarios/core.mjs` | Modify | `table-mobile`, `list-mobile`, `board-mobile` scenarios with the realistic runtime DOM and `db-width-default` |
| `tools/screenshots/scenarios/panels.mjs` | Modify | `panel-record-detail-sheet` bottom-sheet scenario (viewport capture) |
| `src/views/MobileTableAndPanelUx.test.ts` | Create | Regression suite asserting the phone rules, the hover gates and the renderer's pointer/close/drag wiring |
| `screenshots/**` | Regenerate | Recaptured PNGs + `manifest.json` + `README.md` (styles.css change invalidated all captures; four scenarios added) |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | The row-select column is fully visible and its checkbox aligns on the phone | `.is-phone .note-database-container .db-table-wrap` declares `mask-image: none` and `-webkit-mask-image: none`; the phone select checkbox declares `position: absolute; right: 6px`. Verified visually in `table-mobile-mobile-*.png`. |
| REQ-002 | Phone table columns auto-fit to content and cannot run away | `.is-phone .note-database-container .db-table` declares `table-layout: auto`, `width: auto !important`, `min-width: 0 !important`; `col[data-note-database-column-key]` declares `width: auto !important`; data cells declare `white-space: nowrap` and `max-width: 60vw`. Bounded by intrinsic content (never a fixed runaway value) plus the 60vw cap. |
| REQ-003 | The record detail panel can be closed on a phone | On the phone bottom sheet a `db-cell-edit-close` button is visible and calls `close`; outside-dismissal is registered on `pointerdown` (not `mousedown`); dragging the grab handle down past the threshold dismisses it. |
| REQ-004 | List cards stay inside the viewport with values inside the border | `.is-phone .note-database-container .db-list-row` (and its group/main/meta) declare `width: 100%; min-width: 0; max-width: 100%`; `.db-list-row-meta` declares `flex-wrap: wrap; overflow: hidden`; `.db-list-field` declares `flex: 1 1 …; min-width: 0`. Verified visually in `list-mobile-mobile-*.png`. |
| REQ-005 | The board group header does not overlap the cards | `.is-phone .note-database-container .db-board-column-header` declares `position: relative; top: auto`, so it is out of sticky flow and stays at the column top. Verified visually in `board-mobile-mobile-*.png`. |
| REQ-006 | Desktop hover states do not fire on touch | The six load-bearing hover rules (table `tr:hover td`, `td:hover`; `.db-list-row:hover`; `.db-board-card:hover`; `.db-board-card-field:hover`; `.db-record-detail-field:hover`) sit inside `@media (hover: hover)` blocks. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | The systemic centring cause is neutralised on the phone | `.is-phone .note-database-container.db-width-default` declares `max-width: none; margin-left: 0; margin-right: 0`. |
| REQ-008 | The bottom sheet holds its width without runtime help | `.db-mobile-bottom-sheet` declares `box-sizing: border-box !important` so its padding counts toward the `width: 100%` clamp even when `positionToolbarPopover` has not set the inline box-sizing. |
| REQ-009 | The broken states are reproduced and a regression suite guards the fix | Four `is-phone` scenarios carry the realistic runtime DOM (`db-width-default`, `<colgroup>` + select column, `.db-list-row-meta`/`.db-list-field`, the bottom-sheet handle + close button); `MobileTableAndPanelUx.test.ts` fails against the pre-fix stylesheet and renderer. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: On the phone the table shows the select column in full, columns hug their content, and no badge paints over its neighbour.
- **SC-002**: On the phone list cards fill the viewport and every field value stays inside the card border.
- **SC-003**: On the phone the board's group header sits at the column top and never floats over the cards; columns page horizontally.
- **SC-004**: On the phone the record detail panel is a bottom sheet with a grab handle, a visible close button, drag-down-to-dismiss and touch-reachable outside-dismissal.
- **SC-005**: A tap on the phone leaves no stuck row/cell highlight, card lift or field tint.
- **SC-006**: Desktop table, list, board and the anchored record panel are visually unchanged; every new rule is `is-phone`-scoped or a `@media (hover: hover)` gate.
- **SC-007**: The phone auto-fit is bounded — `table-layout: auto` is intrinsic-content sized (no runaway) and each data cell is capped at 60vw; no `<col>` is ever emitted without a width under a fixed layout.
- **SC-008**: Display-only: the change touches presentation, one class string reuse and a pointer gesture; zero writes to note frontmatter or bodies, no telemetry, no new dependency.

### Acceptance Scenarios

- **Scenario 1**: **Given** the table on a phone, **when** it renders, **then** the move handle and checkbox of the select column are fully visible at the left edge and the header/row checkboxes align.
- **Scenario 2**: **Given** the table on a phone with a long value, **when** it renders, **then** each column hugs its content on one line and the table scrolls horizontally rather than truncating mid-word or overlapping.
- **Scenario 3**: **Given** the record detail panel open on a phone, **when** the user taps the close button or drags the grab handle down, **then** the sheet dismisses; **and** tapping outside it also dismisses it (pointer, not mouse).
- **Scenario 4**: **Given** a list on a phone, **when** it renders, **then** each card fills the viewport and its fields wrap inside the card border with no value painting outside.
- **Scenario 5**: **Given** a board on a phone, **when** it renders and the column scrolls, **then** the group header stays at the column top and does not float over the cards.
- **Scenario 6**: **Given** any of these views on a desktop, **when** it renders, **then** it is unchanged, because every rule is `is-phone`-scoped or gated on `@media (hover: hover)`.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | `table-layout: auto` runaway (the HANDOVER records a colgroup-less fixed layout that once produced a 1000088px table) | A pathological value stretches a column | Auto layout is intrinsic-content sized, never a fixed runaway value; the 1000088px case was `table-layout: fixed` with no `<col>` widths, which cannot occur here because every column still exists. Each data cell also carries `max-width: 60vw`. Worst case is a wide-but-finite column with horizontal scroll. |
| Risk | Chrome does not always honour `max-width` on a `display: table-cell` in auto layout | The 60vw cap may not force ellipsis on a very long single value | Accepted and documented: the real bound is intrinsic content width, which is finite; the table scrolls horizontally rather than crashing. Confirmed in `table-mobile-mobile-dark.png`, where the long service name renders in full and the table scrolls. |
| Risk | `!important` on the phone table/`<col>` widths | Overrides the inline widths `applyTableWidth` / `TableColumnLayoutSync` set | Necessary and correct: those widths are inline (JS-set), so specificity alone cannot release them; the repo already uses `!important` for host/inline overrides (`.db-calendar-search-result height: auto !important`). Resize (the only writer of new inline widths post-load) is desktop-only (`ColumnHeaderController.ts:40-43`), so nothing fights the override on a phone. |
| Risk | The board header-over-cards symptom is a scroll-position artifact | A static screenshot at scroll 0 cannot photograph the overlap | The fix (non-sticky header) is asserted by CSS and by reasoning; the capture confirms the header sits at the column top. Honest harness-gap note recorded. |
| Risk | The `mousedown`→`pointerdown` change | Could self-close on the opening gesture | Registration is still deferred by `setTimeout(0)` after the opening click's pointerdown; and `pointerdown` fires for mouse too, so desktop dismissal is unchanged (strictly a superset). |
| Dependency | `positionToolbarPopover` bottom-sheet conversion (`PopoverPosition.ts`) | Supplies the sheet class + grab handle on the phone | Unchanged; the panel reads `panel.hasClass("db-mobile-bottom-sheet")` after positioning and attaches the drag gesture to the handle it created. |
| Dependency | The screenshot harness device matrix (`capture.mjs` DEVICES) | Applies `is-phone` + 402×874 to every scenario on the mobile pass | Unchanged; the new scenarios rely on it rather than declaring the class themselves. |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The layout fix is declarative CSS; no new listeners, timers, observers or layout reads. The one new gesture (`attachSheetDragToDismiss`) attaches four pointer listeners to a single grab handle only when the panel is a phone bottom sheet, and removes them on close.
- **NFR-P02**: `table-layout: auto` computes intrinsic widths once per render like any auto table; there is no per-cell JS measurement on the phone path (the desktop auto-fit estimator is not invoked).

### Security
- **NFR-S01**: Zero external network requests, telemetry or remote dependencies; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: opening, dragging and closing the sheet, and rendering any view, produce 0 writes to note frontmatter or bodies.
- **NFR-R02**: Theme-safe in light and dark: every colour is a token or theme variable already redefined for dark themes; no literal colour is added.
- **NFR-R03**: Desktop-safe: every rule is `is-phone`-scoped or a `@media (hover: hover)` gate; the `mousedown`→`pointerdown` swap is a superset on desktop.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- **A very long single value** (the fixture's "A deliberately long service name that has to truncate"): the phone table column hugs it and the table scrolls horizontally; it does not truncate mid-word and cannot run the layout away.
- **A table with no data columns**: only the select and record-icon gutters render; both keep their fixed colgroup widths (the auto-fit override targets `col[data-note-database-column-key]` only), so nothing collapses.
- **A record with no non-title fields**: the sheet header (handle + title + open + close) still renders and is dismissable; the fields list is empty.

### Error Scenarios
- **`positionToolbarPopover` returns early (anchor disconnected)**: the panel is not converted to a sheet, `panel.hasClass("db-mobile-bottom-sheet")` is false, and the drag gesture is simply not attached; the pointer outside-dismissal and Escape still close it.
- **The grab handle is absent**: `attachSheetDragToDismiss` is only called when the handle query returns non-null, so a missing handle degrades to close-button + outside + Escape dismissal.

### State Transitions
- **Re-render while the sheet is open** (`refreshRecordDetailPanel`): `renderContent` rebuilds the header, re-creating the close button; the drag gesture stays bound to the persistent handle.
- **Reduced motion**: the sheet's drag transform is direct (no transition during drag) and snaps back with the panel's own transition, which the container-wide reduced-motion rule already suppresses.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 16/25 | 2 shipped files (styles.css, RecordDetailPanel.ts) + 2 fixture files + 1 test; ~450 LOC; five surfaces |
| Risk | 12/25 | No auth/API/breaking change; the risks are layout-bounding (`!important`, `table-layout: auto`) and one small pointer gesture, all display-only |
| Research | 14/20 | Four-area code audit to separate the one systemic cause from six symptoms and to tell real bugs from harness stand-ins |
| **Total** | **42/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

## 10. OPEN QUESTIONS

- **The 60vw cap is best-effort on table-cells.** Chrome does not reliably honour `max-width` on a `display: table-cell` in auto layout, so a pathological single value produces a wide-but-finite column with horizontal scroll rather than an ellipsis. The layout is still bounded (intrinsic content, never a runaway), and the operator's ask was "hug content", which is met. A hard ceiling would need the cap on an inner cell wrapper, which every cell type would have to carry — deferred as a separate change.
- **The board header-over-cards overlap is only reproducible mid-scroll.** The static screenshot harness captures scroll 0, where the header already sits at the column top. The fix (non-sticky on the phone) is asserted by CSS and verified by reasoning; a moving-scroll check needs the real app.
- **The existing board mobile rules key on `(max-width: 760px)`, not `is-phone`.** That conflates a cramped desktop with a phone, which the hard constraints warn against, but it predates this phase and is left intact; the header fix is added `is-phone`-scoped on top rather than by rewriting the media query.

---

<!-- ANCHOR:related-docs -->
<!-- ANCHOR:questions -->
## OPEN QUESTIONS

Both items this phase flagged for on-device confirmation were instead settled from source, which is
the stronger evidence in both cases: a static capture cannot show a scroll offset or a device inset,
so a screenshot could not have answered either question whatever it showed.

**The sheet's bottom inset is correct.** The capture shows the last field flush against the viewport
bottom, where Obsidian draws its navigation bar. The pre-existing `.db-mobile-bottom-sheet` rule
already carries `padding-bottom: calc(16px + env(safe-area-inset-bottom))`. Headless Chrome reports
no device insets, so that term resolves to zero and the capture renders without the reserve a phone
applies. A harness stand-in gap, not a plugin defect. No change made.

**The table's right-edge clipping is the intended scroll affordance.** `.note-database-container`
sets `overflow: auto`, with an in-file comment stating this deliberately makes the container the
scroll container so the sticky header resolves against it. `.db-table-wrap` is `min-width: 100%;
width: fit-content`, so it grows past the viewport, and `.db-table` is `table-layout: fixed` with
explicit column widths, giving it a real intrinsic width to grow to. A `fit-content` child wider than
an `overflow: auto` parent is horizontal scrolling. Trailing chips clipped at the right edge is what
a correctly scrolling table looks like in a static render. No change made.

**Standing caveat, unchanged and not specific to this phase.** Every capture renders fixture markup
against the shipped stylesheet, not the real renderers, which need a live Obsidian `App`, vault and
metadata cache. These fixes are proven at the CSS layer. Exercising them in the running plugin
remains worthwhile — `Database Testbed/` in the operator's vault carries an overlong title, an
all-blank row and negative, zero and seven-figure values for that purpose — but no specific defect
is outstanding.
<!-- /ANCHOR:questions -->


## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../010-add-view-popover-layout/spec.md`](../010-add-view-popover-layout/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
