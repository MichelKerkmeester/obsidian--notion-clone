---
title: "Feature Specification: Board / Kanban Port"
description: "Port obsidian-pm-main's Kanban board near one-to-one into board-renderer.ts: status-column hierarchy, card information density, and hover/drag/drop visual language, rewritten to this repo's RowData/ViewConfig contracts."
trigger_phrases: ["board kanban port", "038 board", "kanban port", "board renderer port"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-04T07:30:00Z"
    last_updated_by: "board-1to1-amendment"
    recent_action: "Amended 038 for a 1:1 board copy per operator directive"
    next_safe_action: "Dispatch devin leg: port KanbanView/Column/Card structure 1:1"
    blockers: []
    key_files: ["../036-obsidian-pm-ui-harvest/research/research.md", "goal.md", "implementation-summary.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038"
      parent_session_id: null
    completion_pct: 31
    open_questions: []
    answered_questions: []
---
# Feature Specification: Board / Kanban Port

> Phase chain: parent [`../spec.md`](../spec.md). Source catalog:
> [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md)
> §2 BOARD / KANBAN and its "Final adoption plan" row 2. License boundary:
> `research/research.md` "License and copy boundary" — MIT, notice owed only where code or CSS
> is copied verbatim; this phase's default disposition is `rewrite` (behaviour and visual
> contract reproduced in local TypeScript/CSS, no copied source).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 038-board-kanban-port |
| **Level** | 2 — `recommend-level.sh --loc 950 --files 10 --architectural` scores 65/100 at 82% confidence (mid-range of the catalog's 800-1,100 LOC estimate, 10 files touched across renderer/data/styles, architectural because the port re-seams card identity onto `RowData.file.path`). Matches the sibling port-adjacent phases' own Level 2 shape (`031-sheet-lifecycle-ownership`, `033-list-virtualisation`). |
| **Status** | **Reopened 2026-09-04 for a 1:1 board copy at the operator's request** — the two landed legs (`b9e2321`, `a6fcd31`) restyled our own column/card composition from `kanban.css` rather than reproducing the reference's DOM and class vocabulary, and the operator judged that not close enough on a side-by-side comparison against obsidian-pm 2.1.0 installed beside this plugin. REQ-007 below supersedes the prior keep-local disposition for structure and visual language; local extensions now default off. `npm run gate` was last green (25/25, exit 0) against the pre-amendment renderer; a DOM-structure parity test against the reference's `KanbanView` output shape is owed before any port line lands (plan.md step 7). Not operator-confirmed — see `implementation-summary.md`. |
| **Complexity** | 65/100, confidence 82% (pre-amendment; not rescored for REQ-007) |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

The local board (`src/views/board-renderer.ts`) already owns a richer action contract than the
reference — arbitrary group fields, subgroups/swimlanes, WIP counts, summaries, conditional
formatting, multi-select, roving keyboard, touch — but its status-column information hierarchy,
card density, and hover/drag/drop visual language were not built against a reference the operator
has already compared favourably. `obsidian-pm-main`'s `KanbanView`/`KanbanColumn`/`KanbanCard`
supply that reference near one-to-one, cited in `research/research.md` §2. Report 032 (cover-target
scheme safety) was raised against this surface and is a local safety boundary the port must not
regress. Reports 30-33 do not target the board directly.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

### In Scope — catalog module-map rows (§2, `research/research.md` lines 152-172)

Each row below cites the reference file:line and the local host file:line this phase read and
merges into.

| # | Reference (obsidian-pm-main) | Local host | Disposition |
|---|---|---|---|
| 1 | `src/views/KanbanView.ts:29-40` — clear container, create board (verified: `render()`/`renderBoard()`) | `src/views/board-renderer.ts:176-201` — `render()`: clear, touch-mode detect, board div, group loop | Rewrite view lifecycle into the local grouped-board loop; keep local swimlane branch (`:197-198`) the reference has no equivalent for. |
| 2 | `src/views/KanbanView.ts:44-59` — one `KanbanColumn` per status plus click/context/drag callbacks | `src/views/board-renderer.ts:463-577` — `renderColumn()`: header, checkbox, drag handlers, group options menu | Adopt status-default column shape; retain local arbitrary group field, WIP/visible counts, summaries (`:569-571`), and group reorder drag (`:536-544`) the reference does not have. |
| 3 | `src/views/KanbanView.ts:63-83` — lazy description hydration, board re-renders once bodies load | `src/views/board-renderer.ts:750-951` — `renderCard()` builds the card from `RowData` synchronously | Drop the synchronous-vs-async split as a source claim; if a description preview lands, it goes through the local row pipeline, not a second render pass. |
| 4 | `src/views/KanbanView.ts:158-165` — `handleDrop` updates task status once, then refreshes | `src/views/board-renderer.ts:81-99` (`BoardRendererActions.updateGroupOrder`/`moveRowToPosition`/`moveRowWithGroupUpdatesAndPosition`) plus `:723-736`/`:507-529` container-drop order resolution | Extend to local cross-group/order/batch transaction (`moveCardAndOrder`); the reference's single-task, no-reorder update is a subset already covered. |
| 5 | `src/ui/composites/KanbanColumn.ts:14-24` — card data fields (people, priority color, preview, parent title, source slot, hours, overdue, tag-color) | `src/views/board-renderer.ts:940-950` — card meta fields rendered via `renderCardFieldContent` per column | Adapt fields from `RowData`/computed values through the existing column-driven meta loop; no fixed reference field list is copied. |
| 6 | `src/ui/composites/KanbanColumn.ts:87-114` — dragover reorder / drop task id via native DOM | `src/views/board-renderer.ts:690-738` — `createCardsContainer()` dragover/drop into `resolveBoardContainerDropOrder` | Drop the task-id-only drop payload as a source claim (see do-not-borrow-adjacent policy below); local path/batch-safe order already supersedes it. |
| 7 | `src/ui/composites/KanbanCard.ts:30-40` — draggable card, priority strip | `src/views/board-renderer.ts:790-828` — `dragstart`/`dragover` card handlers, `EdgeAutoScroller`, drag preview | Rewrite card shell with local ARIA/path identity (`data-note-database-row-path`, `role: row`); keep local roving keyboard wiring (`wireCardKeyboard`, `:770-775`). |
| 8 | `src/ui/composites/KanbanCard.ts:44-99` — parent/title/type chips/description/time/tags/progress/avatars/due information hierarchy | `src/views/board-renderer.ts:914-950` — title line, meta fields | Adopt the information hierarchy (title first, then chip-style meta); local field renderers/i18n stay authoritative for content, not the reference's field set. |
| 9 | `src/ui/composites/KanbanCard.ts:100-117` — dragstart writes task id, removes dragging class on end | `src/views/board-renderer.ts:792-880` — dragstart/dragover/dragenter/dragleave/drop/dragend, `rowDropFeedback` | Rewrite input handling; retain the richer local gesture set (auto-scroll, drop indicator, multi-row batch drag) the reference has no evidence for. |
| 10 | `src/styles/kanban.css:13-85` — 280px columns, horizontal scroll, colored topbars, counts, 8px card gaps | `styles.css:8881-8908` — `.db-board` flex layout, `.db-board-column` 280px flex-basis, radius/padding | Rewrite reference spacing intent into existing `--db-*` tokens; column width is already a CSS custom property (`--db-board-column-width`), not a hardcoded value to replace. |
| 11 | `src/styles/kanban.css:87-155` — raised cards, footer, hover state | `styles.css:9175-9197` — `.db-board-card` raised surface, `@media (hover: hover)` lift/shadow | Align radius/shadow/padding language; keep local touch-safe hover gate (`@media (hover: hover)`) and drag/drop states the reference splits differently. |

### Out of Scope — do-not-borrow list (`research/research.md` "Do-not-borrow list", lines 404-419)

- **Table view.** Stays ours; not a board concern, named for completeness per D5.
- **Bottom sheets.** `src/views/mobile-bottom-sheet.ts` stays the phone overlay/portal owner; the
  reference's `Popover` (`src/ui/primitives/Popover.ts:55-77`) informs no board behaviour beyond
  the outside/Escape intent already implemented locally.
- **Formulas, rollups, summaries, calculations.** `board-renderer.ts:569-571`
  (`renderGroupSummaries`) and conditional formatting (`applyConditionalFormat`) stay the local
  computed-value source of truth; reference card metadata informs presentation only.
- **Task-id-only drop payload.** `KanbanColumn.ts:87-114`'s drop resolves by a bare task id with
  no reorder concept; the local path/batch/order transaction (`resolveBoardContainerDropOrder`,
  `moveCardAndOrder`) already supersedes it and is not replaced.
- **Eager card construction.** `src/ui/composites/KanbanColumn.ts:66-85` builds every card
  synchronously with no windowing; report 033's local visible-window/group-row-limit strategy
  (`board-renderer.ts:341-355`, per `research/research.md`'s operator-report accounting) stays.
- **Gallery view revival.** Reference saved views enumerate table/Gantt/Kanban only
  (`specs/context/obsidian-pm-main/src/types.ts:4-11`); no gallery pattern is borrowed here.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/board-renderer.ts` | Modify | Column/card information hierarchy, hover/drag visual language rewrite |
| `styles.css` (section 17 BOARD VIEW, `:8875-9200` region) | Modify | Rewritten spacing/hover/card CSS under existing `--db-*` tokens; requires the CSS lane |
| `tests/` or co-located `*.test.ts` for board drag/drop and cover safety | Create/Modify | Row contracts and negative controls per `plan.md` |
| `tools/live/` board scenario fixtures/screenshots | Modify | Recaptured after the visual rewrite |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Status-column information hierarchy (colored header, count, card priority strip, parent/title/type chips, preview, time/tags/progress/people/due) is adopted near one-to-one per catalog rows 2, 5, 8, cited above, rewritten through `RowData`/`ViewConfig` and the existing `renderCardFieldContent`/column pipeline — no reference field list is hardcoded. |
| REQ-002 | Hover/drag/drop visual language (raised card, hover lift, drop-target highlight, column drop tint) is adopted per catalog rows 10-11, rewritten into `--db-*` tokens inside the existing `styles.css` §17 BOARD VIEW section — no parallel stylesheet, no new class-name public contract. |
| REQ-003 | Card identity stays `RowData.file.path` (`board-renderer.ts:764`, `data-note-database-row-path`), never the reference's `task.id`; every drag/drop payload and the path/batch-order transaction (`resolveBoardContainerDropOrder`, `moveCardAndOrder`) is preserved and not narrowed by the port. |
| REQ-004 | No spec path, phase number, task id, or requirement id appears in any code comment this phase writes (Comment Hygiene HARD BLOCK). |
| REQ-007 | **Amendment 2026-09-04 (operator directive, verbatim: "We should copy their board view 1:1 the one from project manager").** The board view renders as a one-to-one copy of obsidian-pm's kanban: the same DOM structure and class vocabulary as `src/views/KanbanView.ts`, `src/ui/composites/KanbanColumn.ts` and `KanbanCard.ts` (mapped to `RowData`; card identity stays `RowData.file.path`, REQ-003 unchanged), the same visual language as `src/styles/kanban.css` copied verbatim where the reference's rules apply (MIT notice attached to the copied block), the same interactions (drag between columns, drop language, card click opening the note, description hydration), and the same density and column-width defaults. Local extensions (WIP limits, swimlanes, summaries, cover images, path-keyed batch order, touch-mode menus) stay in the code but render only where the reference has an equivalent or where a setting turns them on, **default off** — so the default board is indistinguishable from the reference apart from data. This supersedes the prior "adapt fields, adopt the information hierarchy, do not copy" disposition (REQ-001/REQ-002 above and every "Rewrite"/"Adopt" cell in the module-map table in §2) for structure and visual language specifically; REQ-003 (path identity) and REQ-005 (local-extension preservation, now behind a default-off setting) are unchanged. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | Local extensions with no source claim — WIP/visible counts, swimlanes, group collapse ARIA, multi-select, roving keyboard, edge auto-scroll, blank-space drop fallback, touch long-press/mobile actions, cover-target scheme safety (report 032) — are asserted unchanged after the rewrite, each against a check that ran before the rewrite touched it. |
| REQ-006 | The board and gallery negative controls already wired by `026`/`c5566db` (`tools/live/renderer-coverage.json`, layout-read bound) still pass after the rewrite; a rewrite that defeats the bound is a regression, not a pass. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`, which is the
> document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- **SC-001**: The card information hierarchy and hover/drag/drop visual language match the
  reference's shape (catalog rows 2, 5, 8, 10, 11) on a side-by-side screenshot read, while every
  local extension in the do-not-borrow-adjacent list (REQ-005) still passes its own check.
- **SC-002**: Card identity, drag/drop payloads, and the path/batch-order transaction are unchanged
  in contract (REQ-003), proven by the existing action-contract tests plus a fresh drag-drop matrix
  covering same-group, cross-group, and blank-space drop.
- **SC-003**: `npm run gate` exits 0, and the board/gallery layout-read negative control (REQ-006)
  stays armed and passing.
- **SC-004** (REQ-007, added 2026-09-04): A DOM-structure parity test that walks the reference's
  `KanbanView`/`KanbanColumn`/`KanbanCard` output shape passes against our board renderer, and every
  local extension named in REQ-007 renders default-off unless a setting is turned on.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 5. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | A visual rewrite silently narrows the local action contract (WIP, swimlanes, summaries, cover safety) while chasing 1:1 parity with a reference that lacks all of them | Regression in features the reference never had to preserve | REQ-005 names each extension as a requirement, checked before and after, not assumed |
| Risk | Card identity drifts toward the reference's `task.id` during the rewrite | Breaks every path-keyed local contract (selection, drag, order, cover targeting) | REQ-003 is P0 and named explicitly; every drag/drop citation above is checked against `file.path` |
| Dependency | `research/research.md` §2 and its cited `file:line`s stay accurate; source tree at `specs/context/obsidian-pm-main` remains read-only reference | A moved reference line invalidates a citation silently | Re-read the cited ranges at rewrite time, not only at spec time (already done for every citation above) |
| Dependency | `styles.css` lane (`tools/lane/css-lane.json`) must be acquired before any edit to section 17 | Unclaimed edit is refused by the `css-lane` gate lane | `plan.md` names acquire/release as an explicit step |
| Risk (added 2026-09-04) | REQ-007's verbatim CSS copy narrows the local action contract's *visibility* by default while the code stays present | An operator or a downstream reader could mistake "default off" for "removed" | REQ-007 states explicitly that every named local extension stays in the code and gains a setting; `acceptance-criteria.md` AC-9 checks the setting exists and defaults off |
<!-- /ANCHOR:risks -->

---

## 10. OPEN QUESTIONS

- Whether card-cover rendering (report 032's local safety boundary, `board-renderer.ts:953-990`)
  needs any visual reconciliation against the reference's card shape, given the reference has no
  cover-rendering path at all (`KanbanCard.ts:75-99` carries metadata, no cover branch) — left to
  the implementer's read of `plan.md`; the safety boundary itself (REQ-005) is not renegotiable.
