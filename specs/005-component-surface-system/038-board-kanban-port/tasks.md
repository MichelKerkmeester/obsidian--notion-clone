---
title: "Tasks: Board / Kanban Port"
description: "Task breakdown following the plan's group/card contract, drop matrix, keyboard/touch/cover, screenshot, gate order."
trigger_phrases: ["038 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-04T08:20:00Z"
    last_updated_by: "board-1to1-t12-fresh-verify"
    recent_action: "T12 fresh-verify: fixed T10 drag/drop group-update gap, re-armed harness control"
    next_safe_action: "Dispatch cli-codex T11: copy kanban.css into styles.css, rewrite board fixtures"
    blockers: []
    key_files: ["spec.md", "plan.md", "implementation-summary.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038"
      parent_session_id: null
    completion_pct: 42
    open_questions: []
    answered_questions: []
---
# Tasks: Board / Kanban Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [ ] **T1** Record today's board behaviour before any rewrite — REQ-005, REQ-003.
      *Evidence to close:* the passing state of every local extension (WIP/visible counts,
      swimlanes, summaries, conditional formatting, multi-select, roving keyboard, edge
      auto-scroll, blank-space drop, touch long-press, cover-target scheme safety) and the
      drag-drop matrix (same-group, cross-group, blank-space) captured once, before the group/card
      contract rewrite begins. This is the plan's step 1 and `goal.md`'s "red to record" for its
      first four completion rows.
- [ ] **T2** Rewrite the status-column and card information hierarchy — REQ-001.
      *Evidence to close:* `renderColumn`/`renderCard` (`board-renderer.ts:463-577`, `:750-951`)
      match catalog rows 1, 2, 5, 8 on a paired screenshot read, with `RowData.file.path` identity
      unchanged (REQ-003) and every T1-recorded local extension still passing.
- [ ] **T3** Rewrite hover/drag/drop visual language and re-prove the drop matrix — REQ-002,
      REQ-003.
      *Evidence to close:* `.db-board-column`/`.db-board-card` rules (`styles.css:8881-8908`,
      `:9175-9197`) match catalog rows 10-11's intent under `--db-*` tokens; the T1 drag-drop
      matrix re-run against the rewritten card shell reads identically for same-group, cross-group,
      and blank-space drop.
- [ ] **T4** Re-prove keyboard/touch/cover against the rewritten card shell — REQ-005.
      *Evidence to close:* roving keyboard (`wireCardKeyboard`), touch long-press
      (`attachLongPress`/`isTouchDevice`), and cover-target scheme safety (`renderCover`,
      `:953-991`, report 032) each match their T1-recorded behaviour.
- [x] **T5** Board/gallery negative control still armed — REQ-006.
      *Evidence to close:* `tools/live/renderer-coverage.json`'s layout-read bound
      (`026`/`c5566db`) reads the same armed/disarmed counts after the rewrite as before it.
      Closed 2026-09-03: `node tools/live/render-assertions.mjs` re-run disarmed (default);
      `board/file-view` and `board/embed` both PASS "no forced layout inside the card loop",
      matching the standing bound of 8 the control has never been observed failing against. Armed
      (`RENDER_READ_CONTROL=per-item`), the same two scenarios go red at 1601 layout reads against
      that bound, confirming the control is armed. `renderer-coverage.json` stamped fresh in the
      disarmed re-run.
- [x] **T6** Recapture and read board screenshots.
      *Evidence to close:* every changed capture named in a `reviewed` array and actually opened,
      not inferred from a file-count diff (parent's own recorded trap on that instrument).
      Closed 2026-09-03: `tools/lane/css-lane.json`'s `9eb4b141471e` release names all 20 changed
      captures and describes what each shows; `board-view-desktop-light.png` opened directly this
      session — status-colored topbar per column, matching priority strip per card, controls row,
      `Subscriptions` parent chip, title line with select/status chips ranged right, Cost/Renews
      grid, nothing clipped or unstyled.
- [x] **T7** `SURFACE_PHASE=038-board-kanban-port npm run gate` exits 0.
      *Evidence to close:* `$?` read directly, not through a pipe.
      Closed 2026-09-03: observed directly, exit 0, 25 green / 0 red; re-run bare (no
      `SURFACE_PHASE`) also exit 0, 25 green / 0 red.
- [ ] **T8** The operator opens a board on device and confirms the rewritten visual language and
      drag/drop.
      *Evidence to close:* the operator says so. Nothing else closes this.
- [x] **T9** Write a red-first DOM-structure parity test walking the reference's
      `KanbanView`/`KanbanColumn`/`KanbanCard` output shape — REQ-007.
      *Evidence to close:* the test is observed failing against the current (pre-amendment)
      renderer before any port line lands, naming the exact structural gap (missing wrapper
      elements, absent reference class names, or column/card nesting that does not match).
      Closed 2026-09-04 (T10 leg): `src/views/board-renderer-parity.test.ts` written from the
      reference sources (`KanbanView.ts:29-61`, `KanbanColumn.ts:40-66,87-114`,
      `KanbanCard.ts:32-99`, plus the Chip/AvatarStack/Avatar/ProgressBar/timeChip/tagChip/
      dueChip primitives) and run against the pre-amendment renderer: 18 failed / 18, first
      failure `AssertionError: expected null not to be null` at
      `board-renderer-parity.test.ts:476` on `container.querySelector(".pm-kanban-view")` —
      the current renderer emits no `pm-kanban-view`/`pm-kanban-board`/`pm-kanban-col`/
      `pm-kanban-card` vocabulary at all, so the gap is every wrapper element and reference
      class name.
- [x] **T10** `cli-devin` leg: port `KanbanView.ts`/`KanbanColumn.ts`/`KanbanCard.ts`'s DOM
      structure and class vocabulary 1:1 onto `board-renderer.ts` — REQ-007, REQ-003.
      *Evidence to close:* T9's parity test turns green; `RowData.file.path` identity and every
      drag/drop payload named in REQ-003 are unchanged by hunk-range inspection of the diff.
      Closed 2026-09-04 (this leg): parity test green 18/18; the default (no-setting) board now
      renders the reference tree — `pm-kanban-view` container (`board-renderer.ts:305`),
      `pm-kanban-board` (`:306`), `pm-kanban-col` with `data-status` + header/topbar/title-row/
      badge/count (`:314-342`), `pm-kanban-cards` with the reference dragover tint and live
      reorder (`:348-384`, verbatim `getReferenceDragAfterElement` at `:2322-2338`), and the
      card tree — priority bar, body with parent/title-row/Sub chip/description/time chip/
      tags/progress, footer with avatar stack and due chip (`:386-519`) — plus lazy description
      hydration (`:612-629`) and the verbatim colour/name/initials/date helpers (`:2338-2396`,
      MIT notice at `:2299-2322`). REQ-003: card identity stays path-keyed — `data-task-id`
      and `data-note-database-row-path` both carry `row.file.path` (`:400-404`), dragstart
      writes `application/x-note-database-card` + `text/plain` = path (`:413-415`), and the
      drop resolves through the unchanged `resolveBoardContainerDropOrder`/
      `moveCardAndOrder` transaction (`:364-382`). Local extensions (swimlanes, covers, WIP
      counts, summaries, batch order, touch menus, group controls, roving, empty slots,
      pagination) stay in the code and render only under the new default-off
      `ViewConfig.boardExtensionsEnabled` (`src/data/types.ts:498-501`,
      `board-renderer.ts:221-225`); the existing db-board-* tests run in extension mode
      (`board-renderer-hierarchy.test.ts:409-412`).
      **Correction 2026-09-04 (T12 fresh verifier):** the dragstart handler this leg landed wrote
      `CARD_MIME` but never `CARD_FROM_GROUP_MIME`, so `attachReferenceDropHandlers`'s
      `fromGroup` read back as `undefined` on every real drag. `isSameBoardGroup(undefined,
      groupKey)` reads false for any non-empty `groupKey`, so `resolveBoardContainerDropOrder`
      treated every drop — same-column included — as cross-group; and in `moveCardAndOrder`,
      `fromGroup != null` also read false, so `groupUpdates` stayed empty and
      `moveRowWithGroupUpdatesAndPosition` was never called. Net effect: a real cross-column drag
      never updated the row's group/status field (only repositioned it), and a real same-column
      drag spuriously reordered to the end. Proven red with a real dragstart-to-drop cycle on one
      shared `DataTransfer` double (not the pre-existing tests' synthetic `dropEvent(path,
      fromGroup)` helper, which injects `fromGroup` directly and never exercised this path):
      `expected "vi.fn()" to be called 1 times, but got 0 times` (cross-column) and `expected
      "vi.fn()" to not be called at all, but actually been called 1 times` (same-column), both at
      `board-renderer-parity.test.ts`. Fixed with one line —
      `event.dataTransfer?.setData(CARD_FROM_GROUP_MIME, group.key)` alongside the existing
      `CARD_MIME` write in the card's dragstart handler (`board-renderer.ts:415`) — and both new
      tests now pass; full parity suite re-run green 20/20 (18 original + 2 new).
- [ ] **T11** `cli-codex` leg: copy `kanban.css` verbatim where its rules apply into the
      `css-lane`-held `styles.css` §17 BOARD VIEW section, with the MIT notice attached to the
      copied block, and update the screenshot fixtures to match — REQ-007.
      *Evidence to close:* `css-lane` acquired before the edit and released only after a
      recapture that is actually read; the copied block carries its MIT notice per `goal.md` D1's
      supersession; local extensions (WIP, swimlanes, summaries, cover images, path-keyed batch
      order, touch-mode menus) render only behind a new default-off setting.
- [ ] **T12** Fresh in-runtime verifier reads the recaptured board screenshots side by side with
      the reference's own screenshots or the operator's vault comparison — REQ-007.
      *Evidence to close:* a session that did not run T10/T11 opens both sets of captures and
      states, per element, whether structure/class/visual language/density/column-width match;
      T9's parity test re-run green by this same fresh session, not carried over from T10/T11's
      own claim.
      **Partial 2026-09-04 (structure/class leg; visual half still blocked on T11):** a session
      that ran neither T10 nor T11 re-verified T9's parity test independently — stashed
      `board-renderer.ts` alone, confirmed 20/20 red against the pre-port renderer (first failure
      `expected '' to contain 'pm-kanban-view'`), popped, confirmed 20/20 green again — and found
      and fixed the T10 drag/drop-group-update bug recorded above under T10. Element tree read
      against the reference sources directly (`KanbanView.ts`, `KanbanColumn.ts`, `KanbanCard.ts`,
      `Chip.ts`/`AvatarStack.ts`/`Avatar.ts`/`ProgressBar.ts`, `tagChip.ts`/`timeChip.ts`/
      `dueChip.ts`): structure and class vocabulary match one-to-one, divergences all cited in
      code comments and in `implementation-summary.md`'s next-leg note (no icon span in the
      column badge, group-color priority strip instead of per-card priority, no milestone/
      recurrence chips, no due-urgency "near" tier, draggable gated off touch/read-only). Also
      found the `board/file-view`/`board/embed` armed negative control (`RENDER_READ_CONTROL=
      per-item`) had gone silently inert for the new default path — its seam
      (`applyConditionalFormat`) is a local-extension-only call the reference card path never
      reaches — and re-armed it against `getColumns`, the bag member the reference path does call
      once per card; armed reads now go red at 1601 against the bound of 8 again, matching the
      pre-port baseline number. Recaptured screenshots (detached); the 4 `constructed-board-*`
      captures (production renderer, not a fixture) changed and were opened and read in both
      themes/devices: the board paints as unstyled, top-to-bottom flowing plain text (title, Sub
      chip, hours, due date) with inline-colored group labels and no column/card layout, because
      no stylesheet rule yet targets `pm-kanban-*` — the expected pre-CSS-leg shape. The 5
      hand-written board fixture captures (`board-view`, `board-subtask-tree`,
      `board-empty-column`, `board-drop-language`, `board-mobile`) are confirmed unchanged (0
      moved pixelHash/layoutHash) — still the old `db-board-*` markup, T11's to rewrite. Named in
      `tools/lane/css-lane.json`'s `038-board-kanban-port` release (styles.css untouched);
      `check-lane` exit 0; `evidence --check-all` 16/16 fresh; `npm run gate` 25 green / 0 red,
      exit 0. **Not closed:** the visual-language/density/column-width comparison this row also
      asks for has no styled reference-vocabulary capture to compare against yet — that half
      waits on T11.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T8 closes. Everything else is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md)
<!-- /ANCHOR:cross-refs -->
