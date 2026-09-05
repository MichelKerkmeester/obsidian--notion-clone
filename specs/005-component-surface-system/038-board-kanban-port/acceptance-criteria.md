---
title: "Acceptance Criteria: Board / Kanban Port"
description: "What must be observed for the board/Kanban port to close, with the number each reads today."
trigger_phrases: ["038 acceptance criteria"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-05T07:20:00Z"
    last_updated_by: "desktop-board-bugs"
    recent_action: "Added AC-10 (board root teardown) and AC-11 (record surface anchored to the card), both Met"
    next_safe_action: "Operator confirms roadmap rows 48 and 51 on 0.0.25"
    blockers: []
    key_files: ["spec.md", "goal.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038-ac"
      parent_session_id: null
    completion_pct: 89
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Board / Kanban Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:criteria -->
## CRITERIA

Each row states what is measured, the threshold, and **the number it reads today**. A criterion
whose control has not been observed failing is not met, however green it looks.

| ID | Measured | Threshold | Today |
|----|----------|-----------|-------|
| AC-1 | Card information hierarchy against catalog rows 5, 8 | matches reference shape on paired screenshot read | **Refreshed 2026-09-04.** Rewritten — `renderReferenceColumn`/`renderReferenceCard` (`board-renderer.ts:315-388`, `:391-548`) match the reference's `KanbanColumn`/`KanbanCard` hierarchy one-to-one (T9/T10 parity port, T13-T21/T26-T30 fidelity passes); `board-renderer-parity.test.ts` 30/30 green. A fifth fresh T12 reviewer (`c563f08`, ran none of the board legs) matched all fourteen carried-forward elements to the pixel against the reference source. T1's "record before any rewrite" evidence is superseded rather than owed — the port already landed and matched clean, so there is no pre-rewrite state left to compare against. |
| AC-2 | Hover/drag/drop visual language against catalog rows 10-11 | matches reference intent under `--db-*` tokens | **Refreshed 2026-09-04.** Rewritten — `.pm-kanban-col`/`.pm-kanban-card` rules (`styles.css:8909-9072`) are `kanban.css` copied verbatim under its MIT notice (T11, `goal.md` D6's supersession of the `rewrite`-only disposition), reading the reference's own `--pm-*` tokens rather than the `--db-*` family this threshold was written against — a token-family divergence from the original wording, left unedited per this session's scope, worth a future amendment. Drag/drop re-proven by `board-renderer-parity.test.ts`'s drop-cycle tests (same-group keep-in-place, cross-group, blank-space fallback) including T10's `CARD_FROM_GROUP_MIME` fix; the matrix reads identically to the pre-rewrite baseline every test in the suite pins. |
| AC-3 | Card identity | `RowData.file.path`, never `task.id` | **Refreshed 2026-09-04.** Unchanged and verified through the full port — `data-task-id`/`data-note-database-row-path` both carry `row.file.path` (`board-renderer.ts:406-407`), dragstart writes `CARD_MIME`/`text/plain` = path, the drop resolves through `resolveBoardContainerDropOrder`/`moveCardAndOrder`; `task.id` appears nowhere in the identity path. |
| AC-4 | Local extensions (WIP, swimlanes, summaries, conditional formatting, multi-select, roving keyboard, edge auto-scroll, blank-space drop, touch long-press, cover safety) | pass before and after rewrite | **Refreshed 2026-09-04.** Passing on both paths — extensions render only under the default-off `ViewConfig.boardExtensionsEnabled` (`src/data/types.ts:501`, `board-renderer.ts:222`); the pre-rewrite `db-board-*` suite still runs and passes in extension mode (`board-renderer-hierarchy.test.ts:409-412`), and the reference (default) path's own suite passes independently (`board-renderer-parity.test.ts` 30/30). Extension-mode code is untouched by the port, so there is no separate pre/post pair left to reconcile. |
| AC-5 | Drag-drop matrix (same-group, cross-group, blank-space) | identical before/after | **Refreshed 2026-09-04.** Named and passing — `board-renderer-parity.test.ts`'s drop-cycle tests cover same-group/cross-group/blank-space, including T10's real dragstart-to-drop cycle test that caught and fixed a `CARD_FROM_GROUP_MIME` gap (cross-column drags silently failed to update the row's group field; same-column drags spuriously reordered) before this criterion could have honestly read green. 30/30 green today. |
| AC-6 | Board/gallery layout-read negative control | armed and passing, same counts as `026`/`c5566db` | **Refreshed 2026-09-04.** Armed and passing — the `board/file-view`/`board/embed` control (`RENDER_READ_CONTROL=per-item`) went silently inert after the port (its old seam, `applyConditionalFormat`, is extension-only and the reference card path never calls it) and was re-armed against `getColumns`, the bag member the reference path does call once per card (T12). Disarmed (default) reads 8, matching the standing bound; armed reads 1601, confirming the control fires. `tools/live/renderer-coverage.json` re-stamped fresh this session. |
| AC-7 | `SURFACE_PHASE=038-board-kanban-port npm run gate` | exit 0 | **Refreshed 2026-09-04 (capture-refresh follow-up, `349e22c4`).** 25 green / 0 red, exit 0 — **closed.** The `screenshots-fresh` RED this row carried (24/25, then 791 STALE by the time the follow-up ran — down from the 848 first measured, as intervening 037/038 releases each recaptured their own narrow scope) is discharged: a full recapture of all 528 entries (`349e22c4`, `specs/005-component-surface-system/043-constructed-capture`) refreshed every `sourceHashes` fingerprint against the current `tools/screenshots/theme.css`/`board-render-bench.ts`/`render-assertion-harness.ts` content; 8 captures moved bytes only (encoder re-encode noise, confirmed `pixelHash`/`layoutHash`-identical to `HEAD` and restored to committed bytes) and zero moved real content. `npm run screenshots:verify`: 791 STALE -> 0. First closed 2026-09-03 (T7); regressed silently between T30 and the rebase-onto-main landing per the prior note below; re-closed by the follow-up commit rather than by this leg's own tasks. |
| AC-8 | Operator opens a board on device | confirms rewritten card/column visual language and drag/drop | unknown — **only the operator closes this** |
| AC-9 | 1:1 DOM structure/class vocabulary/CSS/interactions/density/column-width against `KanbanView.ts`/`KanbanColumn.ts`/`KanbanCard.ts`/`kanban.css` (REQ-007, added 2026-09-04) | T9's DOM-structure parity test passes; local extensions render only default-off or where the reference has an equivalent | **Refreshed 2026-09-04.** T9's parity test passes 30/30 (`board-renderer-parity.test.ts`). The default (no-setting) board renders the reference tree — `pm-kanban-view` container (`board-renderer.ts:306`), `pm-kanban-board` (`:307`), `pm-kanban-col` at a 280px fixed width (`styles.css:8992-8996`, unchanged from this row's original citation), the full card hierarchy (`:391-548`: priority bar, parent chip, title-row chips, meta grid, avatar stack, due chip). Local extensions render only under the default-off `boardExtensionsEnabled` (`:222`); the pre-port `db-board-*` vocabulary stays live in extension mode only. A fifth fresh T12 reviewer (`c563f08`) matched all fourteen carried-forward elements to the pixel against the reference source (T12's in-repo half, `tasks.md`); the operator's own vault side-by-side compare remains open (`../roadmap.md` §4 row 37). |
| AC-10 | The board's own root and container class come off when another view type takes the container (operator report `../roadmap.md` §4 row 51, 2026-09-05) | after a board render, the teardown that precedes any re-render leaves no `.pm-kanban-board` and no `pm-kanban-view` on the container | **Met 2026-09-05.** `refresh()` cleared the previous view by naming every root in one selector list, and the list never learned the two things `renderReferenceBoard` mounts: `.pm-kanban-board` as a child, and `pm-kanban-view` on the container itself. Switching from board to calendar therefore left the kanban in place and the calendar appended below it, under a container the surviving class still styled `overflow: hidden; display: flex; height: 100%`. The teardown now lives in `src/views/rendered-view-roots.ts` and names both. Red before green: `board-renderer-parity.test.ts` "leaves no board root or board container class behind" renders a real reference board, runs the teardown, and failed on the surviving `.pm-kanban-board` before the two entries were added. |
| AC-11 | The record surface a card opens is anchored to that card (operator report `../roadmap.md` §4 row 48, 2026-09-05) | the panel is placed against the card's own rect, not the scrolling container's | **Met 2026-09-05.** The reference card called `openRow(row)` with nothing to anchor to, while the extension card beside it already passed `openRecordDetail(card, row)`; with no anchor the host falls back to the whole scrolling container, whose rect leaves no room above or below itself, so the panel collapsed into the margin above it. Measured in headless Chrome on the shipped renderer, one board and two anchors against a 900px viewport: container anchor `top 12 · bottom 84 · height 72` — the operator's clipped sliver — and card anchor `top 535 · bottom 706 · height 171`, below the clicked card. The reference card now uses `openRecordDetail(card, row)` and guards clicks on links and controls, since a card body can carry property values. Red before green: `board-renderer-parity.test.ts` "anchors the record surface to the card that was clicked". |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect (parent `goal.md` D3). A number is quoted with the command that produced it and the exit
code read directly, never through a pipe. **Amended 2026-09-04 (REQ-007, `goal.md` D6):** the
`rewrite`-only disposition is superseded for structure and visual language — the leg pair copies
`kanban.css` verbatim where its rules apply, so the copied block MUST carry the full MIT notice
from `specs/context/obsidian-pm-main/LICENSE:1-21`. Every requirement outside REQ-007 (card
identity, action contract, local extensions) keeps its `rewrite` disposition unchanged.
<!-- /ANCHOR:evidence -->
