---
title: "Feature Specification: Column Header Menu Affordance Defects"
description: "User-reported regression fix for table and board column headers: the three-dots menu trigger rendered on its own line beneath the column name because a blanket touch-target rule overrode its absolute positioning. Rebuilds both headers as a single flex row where the name is the only shrinking child, switches the trigger to the vertical ellipsis icon, and scopes the drag cursor to the header background."
trigger_phrases:
  - "three dots under the column name"
  - "column menu trigger wraps"
  - "db-column-menu-trigger position"
  - "db-board-column-options"
  - "vertical ellipsis header icon"
  - "column name ellipsis truncation"
  - "header grab cursor scoping"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/009-header-affordance-defects"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored header affordance defect specification from the user report and a cascade audit"
    next_safe_action: "Await orchestrator compiler, build and test gates"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-009"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Column Header Menu Affordance Defects

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `008-mobile-and-accessibility`.

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | Complete |
| **Created** | 2026-08-28 |
| **Branch** | `impl` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A user reported that on table column headers — and in the same shape on board column headers — the three-dots menu button renders on its own line underneath the column name, left-aligned, instead of sitting beside it. Four distinct defects sit behind that report:

1. **Blanket touch-target rule silently defeats the trigger's own positioning (`styles.css:4658`, `styles.css:17272-17285` pre-fix)**: `.note-database-container .db-column-menu-trigger` declared `position: absolute; top: 5px; right: 5px`. A later touch-target block listed the same class among fourteen others and declared `position: relative`. Both selectors carry identical specificity (0,2,0), so the later rule won and dropped the button into normal flow. Because `.db-th-content` is a block-level flex container that fills the cell, the in-flow button had nowhere to go but the next line. The declared intent and the shipped behaviour had drifted apart with nothing in the code marking the conflict.
2. **The board options button had no CSS at all (`src/views/BoardRenderer.ts:203-207`)**: `button.db-board-column-options` was created but never styled. It inherited default button chrome and was pushed to the far right edge of the header because its sibling `.db-board-header-text` was declared `flex: 1 1 auto` and grew to absorb all free space (`styles.css:975-982` pre-fix).
3. **Horizontal ellipsis icon**: both triggers used `setIcon(button, "more-horizontal")` (`src/views/ColumnHeaderController.ts:51`, `src/views/BoardRenderer.ts:207`). The user asked for the vertical variant, which reads as a menu affordance rather than as truncated content.
4. **Undifferentiated cursors**: the table header cell declared `cursor: pointer` across its whole surface (`styles.css:4595`) while also being `draggable` for column reordering, so the drag affordance was never signalled. The board header declared `cursor: grab` across its whole surface (`styles.css:8265`), so the grab cursor appeared over the group name and the options button, both of which are click targets rather than drag targets.

### Purpose
Rebuild both column headers on a layout that cannot regress the same way, and make the affordances honest:
- Make each header a **single flex row** in which the name is the only flexible, truncating child and the menu button is a fixed, non-shrinking sibling. This removes the absolute-positioning/override pairing entirely rather than patching one more rule on top of it.
- Give the trigger's positioning **exactly one declaration site**, so no later blanket rule can win on a specificity tie again.
- Switch both triggers to the **vertical ellipsis** (`more-vertical`).
- Scope the **drag cursor to the header background** only, returning the pointer over the name and the button.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Table header flex row**: convert `.db-th-content` (`styles.css:4603-4608` pre-fix) from a gap-spaced row into a full-width row with per-child spacing, and mount the trigger inside it from `ColumnHeaderController.setupMenuTrigger` instead of on the `<th>`.
- **Table trigger in-flow layout**: replace the trigger's absolute positioning with `display: inline-flex; flex: 0 0 auto; margin-left: 2px`, keeping `position: relative` as the single positioning declaration so its hit-area pseudo-element still anchors.
- **Table name truncation**: give `.db-th-label` `flex: 0 1 auto` with `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis` and `white-space: nowrap`.
- **Hit-area containment**: narrow the trigger's `::before` halo from a symmetric `inset: -11px` to `inset: -8px -8px -8px 0`, so the enlarged tap target grows into the cell padding rather than backwards over the name it now sits beside.
- **Cascade cleanup**: remove `.db-column-menu-trigger` from the shared `position: relative` touch-target list and remove `.db-column-menu-trigger::before` from the coarse-pointer `inset: -8px` list, leaving one authoritative declaration of each.
- **Board header flex row**: convert `.db-board-header-text` into a content-hugging flex row (`flex: 0 1 auto`), truncate `.db-board-column-title` / `.db-board-subgroup-title` inside it, pin `.db-board-count`, `.db-board-subgroup-count` and `.db-board-header-summaries` at `flex: 0 0 auto`, and mount the options button inside that row from both board header call sites.
- **Board options button styling**: add the previously absent `.db-board-column-options` rules mirroring the table trigger, including hover/focus reveal, icon sizing and a coarse-pointer minimum size.
- **Vertical ellipsis icon**: `setIcon(button, "more-vertical")` in `ColumnHeaderController.ts` and `BoardRenderer.ts`.
- **Cursor scoping**: `cursor: grab` on `th[data-note-database-column-key]` only; `cursor: pointer` on the table label, type icon and sort indicator, on the trigger, on `.db-board-header-text` and on `.db-board-column-options`.
- **Auto-fit width allowance**: raise the header chrome constant in `estimateAutoColumnWidth` so auto-fit reserves the trigger's newly in-flow width.
- **Regression suite**: `src/views/ColumnHeaderMenuAffordance.test.ts` asserting the shipped stylesheet and the two renderer sources.

### Out of Scope
- The add-view popover surfaces (`.db-add-view-*`, `.db-view-tab-popover`) — owned by a concurrent change.
- Table row drag handles, resize handles and the add-column header cell, which are untouched.
- Board card drag-and-drop, swimlane geometry and pagination.
- Any change to what the column or group menus contain once opened.
- Writing note frontmatter or markdown bodies, telemetry, and desktop-only APIs (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `styles.css` | Modify | Table header flex row, in-flow trigger, label truncation, asymmetric hit halo, cursor scoping, board header row, board options button styling, and removal of the two blanket-list entries that caused the regression |
| `src/views/ColumnHeaderController.ts` | Modify | Mount the trigger inside `.db-th-content` and switch to the vertical ellipsis icon |
| `src/views/BoardRenderer.ts` | Modify | Mount the options button inside the header's name row at both call sites and switch to the vertical ellipsis icon |
| `src/views/ColumnWidth.ts` | Modify | Reserve the trigger's inline width in the auto-fit header chrome allowance |
| `src/views/ColumnHeaderMenuAffordance.test.ts` | Create | Regression suite asserting layout, truncation, icon variant and cursor scoping against the shipped stylesheet and renderer sources |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | Table trigger sits inline immediately after the column name | `.note-database-container .db-column-menu-trigger` declares `display: inline-flex`, `flex: 0 0 auto` and `margin-left: 2px`, declares no `position: absolute`, and `ColumnHeaderController.setupMenuTrigger` appends it to `.db-th-content` rather than to the `<th>`. |
| REQ-002 | The column name truncates with an ellipsis and never displaces the button | `.note-database-container .db-th-label` declares `flex: 0 1 auto`, `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis` and `white-space: nowrap`, making it the only shrinking child of the header row while the trigger stays `flex: 0 0 auto`. |
| REQ-003 | Both triggers use the vertical ellipsis icon | `src/views/ColumnHeaderController.ts` and `src/views/BoardRenderer.ts` call `setIcon(button, "more-vertical")` and contain no remaining `more-horizontal` reference. |
| REQ-004 | The drag cursor appears only over the column header background | `.note-database-container .db-table th[data-note-database-column-key]` declares `cursor: grab`; the label, type icon, sort indicator and trigger declare `cursor: pointer`; `.db-board-column-header` keeps `cursor: grab` while `.db-board-header-text` and `.db-board-column-options` declare `cursor: pointer`. |
| REQ-005 | The board column header takes the same inline shape | `.note-database-container .db-board-header-text` declares `display: flex`, `flex: 0 1 auto` and `min-width: 0`; `.db-board-column-options` declares `display: inline-flex`, `flex: 0 0 auto` and `margin-left: 2px`; `BoardRenderer` mounts the button into the name row at both the swimlane and the standard column header call sites. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-006 | The trigger's positioning is declared exactly once so no later blanket rule can override it | Across the whole stylesheet, exactly one rule whose selector ends in `.db-column-menu-trigger` declares `position`, and its value is `relative`. The class no longer appears in the shared touch-target `position: relative` list at `styles.css:17365-17382`. |
| REQ-007 | The enlarged tap target does not reach back over the column name | Exactly one rule declares `inset` for `.db-column-menu-trigger::before`, with the value `-8px -8px -8px 0`; the class no longer appears in the coarse-pointer symmetric `inset: -8px` list. |
| REQ-008 | Auto-fit column width reserves the now in-flow trigger | `estimateAutoColumnWidth` adds a header chrome allowance covering cell padding, the type icon with its margin, and the trigger with its margin, so auto-fitting a column does not immediately ellipsise its own header name. |
| REQ-009 | A regression suite fails against the broken layout | `src/views/ColumnHeaderMenuAffordance.test.ts` asserts, against the shipped `styles.css` and the two renderer sources, that the trigger is in flow, that the name truncates, that the icon is the vertical variant, and that the drag cursor is scoped to the header background. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The three-dots button renders on the same line as the column name, 2px after it, on both table and board column headers.
- **SC-002**: Narrowing a column ellipsises the header name; the button keeps its full 22px box and never wraps, shrinks or leaves the cell.
- **SC-003**: Both triggers render a vertical ellipsis.
- **SC-004**: Hovering the header name shows the pointer, hovering the button shows the pointer, and the grab cursor appears only over the remaining header background.
- **SC-005**: No later rule in the cascade re-declares the trigger's `position`, so the same override class of regression cannot recur silently.
- **SC-006**: Display-only rendering verified: the change touches presentation and event wiring only; zero writes to note frontmatter or markdown bodies, no telemetry, no new external dependencies.

### Acceptance Scenarios

- **Scenario 1**: **Given** a table column whose header name is short, **when** the header renders, **then** the type icon, the name and the three-dots button sit on one line with the button 2px after the name.
- **Scenario 2**: **Given** a table column narrowed until the name no longer fits, **when** the header renders, **then** the name shows an ellipsis and the button remains fully visible at its natural size.
- **Scenario 3**: **Given** a table column header, **when** the pointer moves from the background onto the name and then onto the button, **then** the cursor changes from grab to pointer and stays pointer.
- **Scenario 4**: **Given** a board column with a long group name, **when** the header renders, **then** the group title ellipsises while the count and the options button keep their full width, and the options button sits 2px after the count.
- **Scenario 5**: **Given** a coarse-pointer device, **when** tapping just left of the trigger over the column name, **then** the tap sorts the column rather than opening the menu, because the trigger's enlarged halo no longer extends leftwards.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | The trigger now consumes 24px of header width that was previously overlapped | Long header names ellipsise sooner than before | Raise the auto-fit header chrome allowance so auto-fitting still shows the full name (REQ-008); table columns use `table-layout: fixed` with explicit widths, so no column silently reflows |
| Risk | `more-vertical` may not resolve in the bundled Lucide set | Blank menu button | Verified against Obsidian's documented icon set for `minAppVersion` 1.7.2; `setIcon` takes `IconName = string`, so the compiler cannot catch a bad name — a visual check on the running plugin is the only complete verification |
| Risk | Making `.db-board-header-text` hug its content changes the subgroup header, which has no trailing sibling | Subgroup header text no longer stretches | No visual consequence: the row is left-aligned either way and nothing follows it |
| Risk | `.db-board-column-title` changes from `inline-flex` to `block` inside the header row so `text-overflow` can apply | Status badge vertical alignment | The pre-existing `.db-board-column-title > .status-badge` rule already declares `vertical-align: middle`, which governs the badge as inline content of a block |
| Dependency | `styles.css` touch-target block at `styles.css:17365-17408` | Root cause of the reported defect | Two list entries removed; the remaining entries and the coarse-pointer minimum sizes are untouched |
| Dependency | `src/views/ColumnWidth.ts` | Auto-fit width estimation | No test asserts the chrome constant, so raising it is behaviour-only |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The fix is declarative CSS plus one `querySelector` per rendered column header; no new listeners, timers, observers or layout reads are introduced.

### Security
- **NFR-S01**: Zero external network requests, CDNs, telemetry, or remote dependencies; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: header rendering, hovering and cursor changes produce 0 writes to note frontmatter or bodies.
- **NFR-R02**: Mobile-safe: the trigger keeps its 28px coarse-pointer minimum size and the board options button gains the same, while the enlarged halo no longer overlaps the adjacent name.
- **NFR-R03**: No optional API is called unguarded; `setIcon` and `querySelector` are both unconditional platform APIs, and the `.db-th-content` lookup falls back to the `<th>` if the row is ever absent.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Very long header name in a narrow column**: the name ellipsises; the trigger keeps its 22px box because it is the only non-shrinking child.
- **Header with an active sort indicator**: the row order is type icon, name, sort arrow, trigger; the sort arrow keeps its 6px separation and the trigger still hugs at 2px.
- **First data column after the record-icon column**: `.db-th-content` is widened by 28px with a negative margin by a pre-existing, more specific rule; the new `width: 100%` base is consistent with that override rather than fighting it.
- **Read-only board columns**: no checkbox is rendered, so the header row is toggle, name row, options button; spacing is unaffected because it is declared per child.
- **Board group rendered as a status badge rather than plain text**: the badge keeps its own `max-width: 100%` and ellipsis contract inside the now-truncating title block.

### Error Scenarios
- **`.db-th-content` missing**: `setupMenuTrigger` falls back to appending the button to the `<th>`, matching the previous behaviour rather than throwing.
- **Icon name unresolved**: `setIcon` renders nothing and the button remains a 22px focusable, labelled control with its `aria-label` intact.

### Concurrent Operations
- **Column reorder drag in progress**: the pre-existing `.is-row-dragging` rules still hide the trigger and disable its pointer events; the trigger keeps its box, so no header reflows mid-drag.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- **Pointer cursor on the board group name**: the user specified the pointer over the column name for both surfaces. The board group name currently has no click handler of its own, so the pointer there advertises the header's clickable controls rather than a name-specific action. Implemented as specified; flagged in case a board group name click action is wanted later.
- **Sort arrow position**: the trigger is placed last in the row, so with an active sort the order reads name, sort arrow, trigger. This keeps the arrow inside the name group rather than separating it from the label it annotates.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../008-mobile-and-accessibility/spec.md`](../008-mobile-and-accessibility/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
