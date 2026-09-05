---
title: "Tasks: Board / Kanban Port"
description: "Task breakdown following the plan's group/card contract, drop matrix, keyboard/touch/cover, screenshot, gate order."
trigger_phrases: ["038 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-05T01:30:00Z"
    last_updated_by: "046-board-line-height"
    recent_action: "T32's line-height fix landed on main (74a26419); npm run gate 25/25 green"
    next_safe_action: "Operator vault compare (roadmap.md row 37/38), then T8"
    blockers: []
    key_files: ["spec.md", "plan.md", "implementation-summary.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038"
      parent_session_id: null
    completion_pct: 80
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
- [x] **T11** `cli-codex` leg: copy `kanban.css` verbatim where its rules apply into the
      `css-lane`-held `styles.css` §17 BOARD VIEW section, with the MIT notice attached to the
      copied block, and update the screenshot fixtures to match — REQ-007.
      *Evidence to close:* `css-lane` acquired before the edit and released only after a
      recapture that is actually read; the copied block carries its MIT notice per `goal.md` D1's
      supersession; local extensions (WIP, swimlanes, summaries, cover images, path-keyed batch
      order, touch-mode menus) render only behind a new default-off setting.
      **Closed 2026-09-04 (completing a run `cli-codex` left uncommitted mid-edit; was: every
      `pm-kanban-*`/`pm-chip*`/`pm-progress*`/`pm-avatar*` class unstyled, board painted as plain
      top-to-bottom text with no columns per T12's 2026-09-04 partial note above):** `kanban.css`
      copied verbatim (`styles.css:8909-9072`, `.pm-content--kanban` through
      `.pm-kanban-card-parent`) under the MIT notice (`:8911-8931`), plus the shared card
      primitives the reference's own `KanbanCard`/`KanbanColumn` compose from `table.css`
      (`button.pm-chip-btn`/`.pm-chip` display block, `.pm-avatar` family, `.pm-progress` family,
      `.pm-chip` family incl. `.pm-chip-rm`, `styles.css:9073-9297`) and `widgets.css`
      (`.pm-kanban-card-title-row`, `:9298-9308`), placed directly ahead of the superseded
      `db-board-*` section (`:9310` on, untouched, still live for `boardExtensionsEnabled`).
      Class-for-class verified: every class `board-renderer.ts`'s default render path emits (38,
      grepped) has a matching rule; only `pm-chip-label` carries none, by design — it inherits
      from `.pm-chip` in the reference too. Two token-mapping gaps `cli-codex`'s copy left were
      found and fixed: `.pm-dragging{opacity:.5}` was missing (`styles.css:9055-9058`, the
      renderer adds this class on dragstart at `board-renderer.ts:418` but `utilities.css`'s rule
      for it was never copied, so a dragged card never faded) and `--pm-shadow-ambient` had been
      aliased to the same `--db-border-subtle` token as `--pm-ghost-border` (`styles.css:8933-8943`),
      collapsing two tokens the reference keeps deliberately distinct (`variables.css`: both start
      at `rgba(0,0,0,.06)` in light, but ghost-border flips to a light `rgba(255,255,255,.06)`
      tint in dark while shadow-ambient stays black-tinted at `rgba(0,0,0,.15)`) — replaced with
      the reference's own light/dark split under `.theme-dark .note-database-container` (the
      existing local idiom, `styles.css:826`) instead of a border token whose dark value would
      have painted the card's hover/drag shadow as a pale halo. Fixtures (`board-view`,
      `board-subtask-tree`, `board-empty-column`, `board-drop-language`, `board-mobile`,
      `board-renderer-parity.test.ts`, `shared.test.mjs`) finished to the `pm-kanban-*`
      vocabulary; a real fixture bug caught by reading the recapture — `subtaskBoardCard`'s
      progress track/fill used `<span>` instead of the `<div>` `board-renderer.ts:486-488`
      actually creates, and spans ignore CSS `width`/`height`, so every progress bar rendered as a
      flat, uncoloured line (`board-subtask-tree-desktop-light.png`, verified fixed: 62%
      blue-purple fill against the gray track) — fixed in `shared.mjs:319`. Downstream gate
      fallout from the same swap, all fixed: `checkbox-family-coverage.test.ts` (the
      `boardExtensionsEnabled` board's own `db-board-card-checkbox`/`db-board-column-checkbox`
      lost their only fixture when the rewrite touched `boardCard`/`boardColumn` — added
      `chrome-board-extensions-selection` in `chrome.mjs`, nested in the real
      `.db-board-column`/`.db-board-card` parents `db-board-column-header`'s
      `position: sticky` negative-margin trick needs); `scan-option-tones.mjs`'s `boardColumn`
      check (still keyed to the superseded `status-color-*` class; repointed at the still-live
      `db-board-column-title` via the newly-exported `groupTitle` primitive); five
      `tools/live/replay.mjs` claims pinned to the old `db-board-*` fixtures (rewritten to the
      `pm-kanban-*` equivalents, all 28 claims hold); 8 stale `tools/live/*.json` evidence
      artefacts (re-stamped). Full detail, class-coverage table and gate-lane fixes:
      `tools/lane/css-lane.json`'s `038-board-kanban-port` release note dated 2026-09-04T10:05.
      `check-lane` exit 0, release names all 28 content-changed captures; `npm run gate` 25
      green / 0 red.
- [ ] **T12** Fresh in-runtime verifier reads the recaptured board screenshots side by side with
      the reference's own screenshots or the operator's vault comparison — REQ-007.
      *Evidence to close (amended 2026-09-04):* a fresh session that ran none of the board legs
      compares the captures against the reference SOURCE (`kanban.css`/`table.css`/`widgets.css`
      and the composites) with pixel measurements, AND the operator compares the two plugins
      side by side in the vault where both are installed. T9's parity test re-run green by this
      same fresh session, not carried over from T10/T11's own claim.
      *Why amended:* the original wording ("opens both sets of captures") assumed the vendored
      reference carries its own screenshot files; it carries zero image files, so that half of
      the criterion cannot be met from this repo alone. Recorded as an orchestrator decision
      (reversible default — the operator may restore the original wording) in
      `implementation-summary.md`'s Key Decisions, dated 2026-09-04; the operator's vault-compare
      half is tracked as its own row in the parent `../roadmap.md` §4 operator table, never ticked
      by an agent.
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
      **In-repo half MET 2026-09-04 (fifth fresh reviewer, c563f08, ran none of the board legs):**
      the amended in-repo half of this row's evidence bar closes. All fourteen carried-forward
      elements (topbar, badge icon, priority strip, parent chip, Sub chip, tags, hours chip,
      progress bar, avatar stack, due chip, milestone/recurrence chips, drag/drop affordance,
      empty-column shape, mobile column width) measured against the reference source and matched
      to the pixel; `board-renderer-parity.test.ts` re-run green 30/30 by this session, not carried
      over from T10/T11/T22-T28's own claims; the copied `kanban.css`/`table.css`/`widgets.css`
      block diffed mechanically against `styles.css` — 56 rules byte-verbatim, 3 documented deltas
      (the host-container scoping prefix, the `--pm-shadow-ambient` split T11 already recorded, and
      the `--db-container-padding-inline` token T26 introduced). Before-value: the prior fresh read
      at `854c748` found three P1s (T26's padding bug among them, already closed). This same session
      then read three P2 items against the reference and this repo's own harness, closed as T29/T30
      below (the fourth, this note, is doc-only). **Still open:** the operator's own vault
      side-by-side comparison — `../roadmap.md` §4 row 37, never agent-tickable — and T8 (operator
      device confirmation). T12 itself stays unticked until both close; this leg ran in-runtime
      (bounded scope: this dispatch's four numbered items).
- [x] **T13** Palette names no longer paint as inline CSS keywords — REQ-007 fidelity pass (A).
      *Evidence to close:* `board-renderer-parity.test.ts`'s column-shell test asserts
      `var(--status-color-fg-blue)` for `--col-color`, the topbar background and the badge color;
      ran red against the landed renderer — `expected 'blue' to be 'var(--status-color-fg-blue)'` —
      and green after. `resolveReferenceColor` (`board-renderer.ts:621-627`) maps the closed
      `StatusColor` name palette to the theme-aware `--status-color-fg-<name>` token (both themes
      define it, `styles.css:130-161` light, `:749-786` dark) and passes any other authored color
      string through unchanged; the four paint slots (`board-renderer.ts:332-344`, `:442-443`) use
      it. Hex passthrough pinned by a new test (`board-renderer-parity.test.ts:715-726`, a custom
      `#ff6600` option reads back unchanged in all three slots).
- [x] **T14** Footer avatar stack is always constructed — REQ-007 fidelity pass (B).
      *Evidence to close:* new test `always renders the footer avatar stack, empty without a people
      column` (`board-renderer-parity.test.ts:728-737`); ran red — `expected null not to be null`
      on `.pm-avatar-stack` — and green after the stack creation moved out of the people-column
      branch (`board-renderer.ts:523-541`), matching the reference's unconditional
      `new AvatarStack(footer)` so the footer's space-between still pushes the due chip right.
- [x] **T15** "Sub" chip renders only for actual children — REQ-007 fidelity pass (C).
      *Evidence to close:* new test `gates the Sub chip on an actual parent relation, not row
      presence` (`board-renderer-parity.test.ts:739-747`); ran red — `expected MockElement{…} to
      be null` on the root card's title-row chip — and green after the gate changed from node
      presence to `subtaskNode?.parentId` (`board-renderer.ts:469`), matching the reference's
      `task.type === 'subtask'` on a relation that builds a node for every row.
- [x] **T16** Column badge renders its icon span — REQ-007 fidelity pass (D).
      *Evidence to close:* the column-shell test asserts the `.pm-kanban-col-badge-icon` span
      exists before the label with `setIcon(…, "circle-dot")` (`board-renderer-parity.test.ts:532-537`);
      the same test ran red before the fix (on its color assertion, the test's first failing line)
      and green after; the span is created unconditionally because the option model carries no
      per-option icon field (`board-renderer.ts:337-343`, default icon constant `:70-73`), and the
      label is appended after it exactly as the reference orders them.
- [x] **T17** Priority strip is per-card from a mapped priority column, omitted otherwise —
      REQ-007 fidelity pass (E).
      *Evidence to close:* two new tests (`board-renderer-parity.test.ts:589-602`, `:749-774`); red
      before the fix — `expected MockElement{…} to be null` (bar rendered without any priority
      column) and `expected 'blue' to be 'var(--status-color-fg-red)'` (group color painted on the
      bar) — green after. `getReferencePriorityColumn`/`getReferencePriorityColor`
      (`board-renderer.ts:647-663`) resolve a select column named "priority" case-insensitively
      and paint its per-card option color through the same resolution as the column colors
      (`:437-444`); with no such column, or no value, the bar is omitted as the reference omits it
      for tasks without priority.
- [x] **T18** Milestone and recurrence chips render — REQ-007 fidelity pass (F).
      *Evidence to close:* two new tests (`board-renderer-parity.test.ts:776-786`, `:788-801`); red
      before the fix — `expected 'var(--color-green)' to be 'var(--color-purple)'` (the Sub chip
      sat where the milestone chip belongs) and `expected 'var(--color-green)' to be
      'var(--color-blue)'` — green after. The milestone flag reuses the timeline model's exact
      frontmatter resolution (`isReferenceMilestoneRow`, `board-renderer.ts:629-636`,
      `calendar-timeline-model.ts:1009-1011`); recurrence is any non-empty value in a
      recurrence/repeat-named column (`isReferenceRecurring`, `:638-645`); chips render in the
      reference's order with its classes and colors (`:455-486`). Tooltips go through new i18n
      keys in all three locale blocks — `board.milestone` / `board.recurrence`
      (`src/i18n.ts:137-138` en, `:1824-1825` zh-CN, `:3501-3502` zh-TW).
- [x] **T19** Due chip gains the "near" urgency tier — REQ-007 fidelity pass (G).
      *Evidence to close:* new test `renders a due chip due within three days as the near tier`
      (`board-renderer-parity.test.ts:803-811`); red before the fix — `expected 'pm-chip
      pm-chip--sm' to contain 'pm-chip--solid'` — green after. `getReferenceDueUrgency`
      (`board-renderer.ts:665-676`) copies the reference's tiers and thresholds exactly
      (`dueChip.ts:3-13`, `utils.ts:71-77`): past due → solid red strong, due within three days →
      solid orange, else plain (`:543-557`).
- [x] **T20** Two reference rules T13-T19 skipped: priority's non-urgent tiers, and completion
      suppressing due urgency — REQ-007 fidelity pass (H).
      *Evidence to close:* two new red-first tests. `omits the priority bar for the reference's
      non-urgent tiers, paints every other option name` (`board-renderer-parity.test.ts:794-826`)
      — red: `expected MockElement{ textContent: '', …(12) } to be null` (a "Medium"-named
      priority option still painted the strip) — green after `isReferenceLowPriorityTier`
      (`board-renderer.ts:659-664`) gates `getReferencePriorityColor` on the resolved option name,
      matching KanbanView.ts:86-88's `priority !== 'medium' && priority !== 'low'` by name
      case-insensitively and also omitting "none", the third non-urgent name a priority select
      commonly carries; "urgent"/"high"/"critical" and any other name still paint. `suppresses the
      due chip's urgency tiers once the row's checkbox column marks it complete`
      (`board-renderer-parity.test.ts:865-883`) — red: `expected 'pm-chip pm-chip--solid pm-chip--sm
      pm-chip--strong' not to contain 'pm-chip--solid'` (an overdue-but-complete row still painted
      solid red) — green after `isReferenceRowCompleted` (`board-renderer.ts:676-682`) — the same
      checkbox-column completion signal `calendar-renderer.ts:2420-2425`'s `isRowCompleted` reads —
      short-circuits `getReferenceDueUrgency` (`:689-698`) to "normal", matching utils.ts:80-83's
      "Terminal tasks are never urgent". 30/30 parity tests green; full suite 990/990, `tsc` 0,
      lint 172 = 172 (byte-identical, confirmed by diff-hunk overlap against the pre-session lint
      locations rather than a rebuilt baseline worktree), `scan-comments` PASS.
- [x] **T21** Fixture and stylesheet class-for-class fidelity, plus host-container scoping and
      inset — REQ-007 fidelity pass (I).
      *Evidence to close:* `tools/screenshots/scenarios/shared.mjs`'s `boardColumn`/`boardCard`/
      `subtaskBoardCard` rewritten to match the renderer exactly: badge icon span
      (`.pm-kanban-col-badge-icon`, reusing the existing `ICONS["circle-dot"]` glyph) leading the
      label; `resolveTone` mapping a `StatusColor` name to `var(--status-color-fg-<name>)` for
      `--col-color`/topbar/badge, matching `resolveReferenceColor`; the priority bar moved from an
      implicit group-tone parameter to an explicit opt-in `priorityColor` (no fixture row maps a
      real priority column, so none paints one by default); the footer avatar stack always
      constructed, matching T14; a `pmDueChip` helper carrying the near/overdue tiers. Existing
      structural tests updated in lockstep (`shared.test.mjs`, `board-renderer-parity.test.ts`'s
      "keeps the screenshot fixture helpers on the reference class contract"), all green (40 tests
      across both files). `core.mjs`'s `board-view` scenario forces one deterministic
      priority-bearing card (Figma, red) and one near-tier due chip (Sketch) — not date- or
      wall-clock-derived, so the capture stays reproducible — which also keeps
      `tools/live/replay.mjs`'s two pre-existing 038 claims ("the board card carries the ported
      kanban hierarchy", "the board topbar and priority strip resolve their status colours") at
      their original recorded values (10, 0) rather than needing renumbering; all 28 replay claims
      hold. `styles.css`: every copied `pm-kanban-*`/`pm-chip*`/`pm-avatar*`/`pm-progress*`
      selector scoped under `.note-database-container` (one WHY comment at the block header, not
      per-rule) so a co-installed reference plugin sharing those class names cannot cross-paint
      with this stylesheet; declarations kept verbatim, only the selector prefix changed. The
      board's first column started ~56px from the container edge against the reference's 16px
      (`.note-database-container`'s own 24px padding, `styles.css:817`, plus `.pm-kanban-board`'s
      own 16px); zeroing the container's own padding was rejected because `.db-header` (the
      toolbar) is a sibling inside that same container and relies on a negative-margin bleed
      against that exact 24px value, so a matching negative margin on `.pm-kanban-board` alone
      (`var(--db-space-8)`, the same token the container's padding reads) cancels it without
      touching the container's padding or the toolbar. Deleted the dead `.pm-content--kanban` rule
      (grep-confirmed nothing emits the class); kept `.pm-kanban-col-badge-icon`, which the badge
      icon span now genuinely uses. **Stale as of T25:** T25 later removed the badge icon span
      itself (the option model has no per-option icon field to display), so this rule is dead
      again — kept, this time as part of the verbatim reference-CSS copy rather than a rule a
      local span still reaches. `tools/lane/css-lane.json`: acquired, edited, and released as
      holder `038-board-kanban-port`, naming all 28 content-changed captures (`check-lane` exit 0).
      All 28 read this session, both themes: badge icon present, topbar/badge/priority-strip
      colors resolve through the token and stay legible in dark, Sub chip only on children, due
      chip right-aligned with the near/overdue tiers correctly styled, priority strips only where
      a priority-bearing state was deliberately forced, board flush at 16px, nothing else moved. A
      residual left named rather than fixed: `tools/storybook/obsidian-stub.mjs`'s curated icon
      glyph list has no "circle-dot" entry, so `constructed-board`/`constructed-board-subtask`
      (the real renderer, not the hand fixture) show that stub's generic ◆ placeholder instead of
      the real glyph — out of REQ-007's scope, since "circle-dot" is also used by three
      unrelated renderers this packet does not touch. `npm run gate`
      (`SURFACE_PHASE=038-board-kanban-port`): 25 green / 0 red; the evidence lane needed 8
      artefacts (cascade-audit, checkbox-appearance, checkbox-inventory, design-conformance,
      engine-parity, surface-census, token-census, view-census) re-run to re-stamp against the new
      `styles.css` hash — all pass or hold their documented pre-existing baseline.
      **Addendum 2026-09-04 (in-runtime, not a fresh T12 read — see T22-T25):** the dispatch that
      landed T13-T21 was itself validated by a T12 fresh-reviewer pass that surfaced four residual
      divergences this evidence block did not catch (a dead CSS selector the class-vocabulary read
      above could not see; a due-chip tier and a Sub-chip/parent-line bug the fixture read papered
      over instead of exposing; the badge-icon choice made here turned out not to be the
      reference's actual rule). T22-T25 close all four, red-first against the reference source.
      This leg ran in-runtime rather than external-first because the external lane was occupied
      and the scope was four bounded fixes — it is not itself a fresh T12 read, so T12 stays open
      below for the visual-language/density/column-width comparison it still asks for.
      Post-rebase reconciliation (onto main's one-to-one gantt port and its four constructed
      captures, `75eaa34`, merge-base `46a8525`): `styles.css` gained a new merged hash
      (`276e1094c61c`) since the two legs' regions are disjoint — the kanban block scoped under
      `.note-database-container` plus its host-inset negative margin, and the `pm-gantt-*` block —
      and both auto-merged clean with no conflict markers. A fresh `npm run screenshots` (356
      entries) found zero content-changed captures (`pixelHash`/`layoutHash` unmoved against the
      pre-rebase committed manifest): every board capture already reflects this task's own review
      above, every timeline capture the gantt phase's. Five captures moved bytes only (encoder
      re-encode noise, restored to `HEAD`, `manifest.json`'s `bytes` field corrected to match).
      `tools/live/touch-targets-constructed-baseline.json`: untouched by this task's own diff, and
      a re-measure on the merged tree (`node tools/live/touch-targets.mjs`) still lands on 367,
      main's existing baseline — no value moved, no new entry needed. `tools/lane/css-lane.json`:
      merged history (main's 200 entries plus this task's 3), `baselineHash` recomputed on the
      merged stylesheet, one further release entry appended (hash `276e1094c61c`, `reviewed: []`)
      closing the lane's own invariant since nothing new needed review. 16 `tools/live/*.json`
      evidence files took main's version at merge time; the evidence gate then flagged 8 stale
      against the merged hash (cascade-audit, checkbox-appearance, checkbox-inventory,
      design-conformance, engine-parity, surface-census, token-census, view-census) — re-run, all
      still pass or hold their documented pre-existing baseline (engine-parity's 51
      Chrome-vs-WebKit disagreements, unrelated to this task). Two `constructed-board` and two
      `constructed-timeline` captures were opened and read this session: both surfaces confirmed
      still fully styled post-merge. `npx tsc --noEmit` exit 0; `npx vitest run` 993/993 (99
      files); `npm run lint` 172 problems (159 errors, 13 warnings), unchanged; `scan-comments`
      PASS; `npm run gate` 25/25 green, no exemptions.
- [x] **T22** Fix the dead view-level height-chain selector T12's fresh read surfaced — REQ-007
      fidelity pass (J).
      *Evidence to close:* new test `scopes the view-level flex/overflow height chain to the
      compound container+view selector` (`tools/screenshots/scenarios/shared.test.mjs:248`); ran
      red — `expected [stylesheet text] to match /\.note-database-container\.pm-kanban-view\s*\{...
      height:\s*100%;/` — before the fix, because `styles.css`'s view-level rule targeted
      `.note-database-container .pm-kanban-view` as a descendant selector (space, not compound).
      board-renderer.ts's `renderReferenceBoard` adds `pm-kanban-view` directly onto the same
      element `database-view.ts`/`embedded-database-renderer.ts` already classed
      `note-database-container` (`board-renderer.ts:306`, `database-view.ts:1389`,
      `embedded-database-renderer.ts:537`) — never a descendant of it — so the rule never matched,
      and `.pm-kanban-board`'s `flex: 1; min-height: 0` had no flex parent to size against: a
      shorter column stopped at its own content height instead of stretching to match its taller
      siblings, leaving visible dead space below the board. Fixed by changing the selector to the
      compound `.note-database-container.pm-kanban-view` (`styles.css:8958`) — the custom-property
      block two rules above it already used both forms together for exactly this reason. Green
      after; also verified visually against `constructed-board`/`constructed-board-subtask` (the
      real `BoardRenderer` + `database-view.ts` container, both themes): a before/after crop
      comparison against the committed `HEAD` PNGs shows the `review`/`doing` columns (3 cards)
      now stretch their background to the frame bottom matching `backlog`/`todo` (4-6 cards),
      where before they stopped short. `board-mobile`/`constructed-board-mobile` already showed
      the stretch before and after (a fixed mobile viewport height gives the percentage chain a
      concrete basis regardless of this selector). `board-view`/`board-empty-column` (desktop,
      hand-authored fixtures) show no change in that one respect either — their desktop capture
      context auto-sizes to content rather than a fixed viewport height, so there is no percentage
      basis there regardless of the selector; pre-existing, unrelated to this fix, not attempted.
- [x] **T23** Remove the due-chip near tier the kanban call site never reaches — REQ-007 fidelity
      pass (K).
      *Evidence to close:* renamed/inverted test `never surfaces the near urgency tier the kanban
      call site does not reach` (`board-renderer-parity.test.ts:861`); ran red on the original
      "renders a due chip due within three days as the near tier" assertions — a due-in-two-days
      row painted `pm-chip--solid`/`var(--color-orange)` — before the fix. The reference's
      `dueChip.ts` primitive supports `normal`/`near`/`overdue`, and `TableRow.ts:138` does pass
      the full `dueUrgency(...)` through to the table view, but `KanbanView.ts:126` collapses it to
      a boolean before `KanbanCard.ts:97` ever sees it (`props.overdue ? 'overdue' : 'normal'`) —
      the near tier is a deliberate reference design choice for kanban specifically, not an
      oversight. `getReferenceDueUrgency`'s return type narrowed to `"normal" | "overdue"`
      (`board-renderer.ts:682-687`) and its `near`-tier branch dropped from the render call
      (`board-renderer.ts:540-544`); a due-in-two-days row now renders plain, matching the
      reference. Green after. Companion fixture fix: `tools/screenshots/scenarios/shared.mjs`'s
      `pmDueChip` dropped its `near` branch (an explicit `near` request now falls through to
      plain, asserted in `board-renderer-parity.test.ts`'s fixture-contract case) and
      `core.mjs`'s `board-view` scenario no longer forces Sketch into the near tier. T19's original
      evidence cited the primitive (`dueChip.ts`), not the card call site — the gap this task
      closes; a due-soon tier for the board would need its own REQ-007 amendment against
      `KanbanView.ts:126`, not a silent reintroduction.
- [x] **T24** Gate the subtask fixture's Sub chip on depth and print the real parent title —
      REQ-007 fidelity pass (L).
      *Evidence to close:* two new tests in `tools/screenshots/scenarios/shared.test.mjs`: `gates
      the Sub chip on an actual child depth, not on the card being the subtask helper's output`
      (`:190`) and `prints the parent card's title on the child card's parent line, not the
      enclosing column's name` (`:205`); both ran red before the fix — the root/depth-0 card's
      title row carried a `pm-chip` (the hard-coded Sub chip) and the child cards' parent line read
      literally `"Projects"` (the scenario's own column label, and `subtaskBoardCard`'s old
      default) instead of `"Website redesign"` (`SUBTASK_FIXTURE_ROWS.parent.name`, the actual
      parent task). The reference gates the chip on `task.type === 'subtask'` and prints
      `props.parentTitle` from the parent task, never the column (`KanbanCard.ts:44-46,60-67`).
      Fixed in `shared.mjs`: the Sub-chip span is now `depth > 0 ? ... : ""`, matching the
      parent-line gate already beside it; the `parent` option's default changed from the
      coincidental literal `"Projects"` to `""`, so a caller must pass the real title. Updated
      `core.mjs`'s `board-subtask-tree` scenario's two child-card calls to pass
      `SUBTASK_FIXTURE_ROWS.parent.name`. Green after; also verified against the real renderer
      (`constructed-board-subtask`, both themes): the parent card (`row-0`) carries no Sub chip,
      both children show `row-0` on the parent line plus the Sub chip — this path was already
      correct in `board-renderer.ts` (`subtaskNode?.parentId` gate, T15), only the screenshot
      fixture and its scenario callers were wrong.
- [x] **T25** Drop the badge icon span the reference's option model has no field for — REQ-007
      fidelity pass (M).
      *Evidence to close:* three inverted assertions in `board-renderer-parity.test.ts` — the
      fixture-contract case (`:499`) and the column-shell test (`:560-561`); ran red before the fix
      — `.pm-kanban-col-badge-icon` was present and `setIcon` was called with `"circle-dot"` on
      every column, and the fixture's `boardColumn` emitted the same span. T16 (closed earlier in
      this file) read the reference as always emitting an icon slot; re-reading `KanbanColumn.ts:
      52-57` shows the icon span is conditional — `if (props.status.icon && isIconName(...))
      setIcon(...) else badge.setText(formatBadgeText(props.status.icon, props.status.label))` —
      and `formatBadgeText(undefined, label)` (`utils.ts:137-140`) resolves to the label alone.
      Since this option model carries no per-option icon field, the faithful branch is always the
      text-only else — not a permanent icon standing in for one that was never authored. Removed
      the icon span, the `setIcon` call, and the dead `REFERENCE_STATUS_ICON` constant from
      `board-renderer.ts` (`:333-337`); removed the matching span from `shared.mjs`'s
      `boardColumn`. Green after; every board capture read this session (both themes) shows a
      text-only badge. If a per-option icon field is ever added to the schema, the reference's
      conditional branch — not this removal — is what should come back.
- [x] **T26** Track the responsive host padding through one token instead of a hardcoded margin —
      REQ-007 fidelity pass (N), a fourth fresh T12 reviewer's item 1 (P1). This leg ran
      in-runtime (the external delegation lane was occupied; scope bounded to this dispatch's four
      numbered items).
      *Evidence to close:* new test `cancels the host's inline padding through the same token the
      mobile breakpoint overrides` (`tools/screenshots/scenarios/shared.test.mjs`); ran red against
      the pre-fix rule text — `.pm-kanban-board`'s margin still read `var(--db-space-8)` directly,
      confirmed by stashing only the `styles.css` edit and re-running — and green after.
      `.note-database-container`'s own inline padding cancelled `.pm-kanban-board`'s negative
      margin with a hardcoded `var(--db-space-8)` (24px), but `@media (max-width: 760px)` drops
      that padding to 12px without touching the margin, so below 760px the margin over-cancelled
      by 12px. Introduced `--db-container-padding-inline` on `.note-database-container` (default
      `var(--db-space-8)`, `styles.css:~810`); the base padding shorthand and
      `.pm-kanban-board`'s `margin-left`/`margin-right` (`:~8984`) both read it, and the 760px
      media query now overrides the token itself (`--db-container-padding-inline: 12px`) instead
      of hardcoding the padding shorthand in isolation, so the two can never drift apart again.
      Measured on the recaptured `board-view-mobile-{light,dark}` and
      `constructed-board-mobile-light` PNGs (before: HEAD's committed bytes; after: this session's
      recapture) by scanning the page-background-to-column-background colour transition at
      identical y-rows: device-px 40→64 (CSS 20px→32px) in both themes and both scenarios.
      Subtracting the capture harness's own constant 16px `#shot` wrapper padding
      (`tools/screenshots/theme.css:194-200`, present in every capture regardless of this fix)
      reconciles that to exactly **4px before, 16px after** — matching this T12 reviewer's own
      numbers. Right edge: the whole board shifted 12px right into position, so the second
      column's visible sliver widened by the same 12px rather than staying clipped short.
- [x] **T27** Cover the avatar stack, the milestone/recurrence chips and the renderer's short-form
      due dates, none of which any fixture or constructed capture showed before this leg —
      REQ-007 fidelity pass (O), a fourth fresh T12 reviewer's item 2 (P2 coverage). Not a
      red/green defect fix: the renderer already built these correctly (T14, T18); no fixture and
      no bench column ever exercised the code paths.
      *Evidence to close:* four new tests in `shared.test.mjs` (`renders the milestone and
      recurrence type chips…`, `builds an initialed avatar per person…`, `formats the due chip
      through the renderer's short-date conversion…`, plus the extended fixture-contract case);
      the first three ran red against the pre-change `shared.mjs` (stashed and restored to
      confirm) — no `--pm-chip-color` for milestone/recurrence, the avatar stack held raw
      `row.people` text in one fixed-colour span instead of per-person initialed avatars with a
      `pm-avatar--more` overflow slot, and the due chip echoed the fixture's long-literal date
      unconverted — green after. `shared.mjs`: `boardCard` now reads `r.milestone`/`r.recurring`
      for the reference's fixed-order M/R chips (`pm-chip pm-chip--solid pm-chip--sm`,
      `var(--color-purple)`/`var(--color-blue)`, mirroring `board-renderer.ts:448-476`); the
      single-avatar stub is replaced by `pmAvatarStack` (up to 3 initialed, per-name-coloured
      avatars plus overflow past 3, mirroring `:522-535`); a new `pmShortDate` helper converts
      `pmDueChip`'s label to `referenceFormatDateShort`'s "Mon D" shape (`:2491-2496`) instead of
      the fixture's long literal, without touching `ROWS`/`SUBTASK_FIXTURE_ROWS`'s own `.renew`
      values (read elsewhere by table/list/panel/calendar scenarios at their original long form).
      `core.mjs`'s `board-view` Design column forces Adobe Creative Cloud (milestone), Sketch
      (recurring) and Framer (4 people, showing the `+1` overflow avatar) so a board capture
      demonstrates all three for the first time; read this session, both themes. Separately,
      `tools/bench/board-render-bench.ts`'s `makeColumns` re-keys its one `"mixed"`-kind
      multi-select column (index 4, previously `"subscriptions"`) to `"people"` so
      `board-renderer.ts`'s own `/people|person|assignee|owner/i` column match resolves for
      `constructed-board`/`constructed-board-subtask` too — the real `BoardRenderer`, not just the
      hand fixture, now paints the avatar stack; no column added (count unchanged at 21 plus the
      pushed group field), no other `REPORTED_COLUMNS` entry touched, chart
      (`CHART_COLUMNS=BOARD_COLUMNS`) unaffected since its value column is picked by type, not
      key. Read this session on `constructed-board-{desktop,mobile}-{light,dark}`: initialed
      avatars in per-name-hashed colours on every card (values still generic multi-select
      placeholders, not real names — cosmetic, not a correctness gap, since the goal was
      exercising the real render path). `board-subtask-tree`/`constructed-board-subtask` (both
      themes) confirmed short-form dates (`Jan 4`, `Aug 21`, `Mar 12`, `Mar 28`, `Apr 18/20/22`) in
      place of the prior long literals.
- [x] **T28** Correct three stale or inaccurate notes a fourth fresh T12 reviewer's items 3 and 4
      surfaced, and amend T12's own evidence bar to what an in-repo session can actually check —
      REQ-007 fidelity pass (P). Doc-only; no red/green framing applies.
      *Evidence to close:* (1) `core.mjs`'s `board-drop-language` note claimed a before/after
      insertion line neither the reference nor the ported card-reorder path draws — the reference
      reorders live by moving the dragged card's own element ahead of or behind its neighbour on
      dragover (`attachReferenceDropHandlers`, `board-renderer.ts:349-353`); the
      `db-board-drop-indicator` line exists only on the unrelated legacy `db-board-card` path this
      scenario never depicts (confirmed by grep: `renderReferenceCard`, the path this scenario's
      classes belong to, has no dragover listener at all). Note corrected and the inert
      `dropPlacement` argument dropped from the one call site that passed it — `boardCard` never
      destructured it, proven already by the existing `keeps insertion feedback on the reference
      container…` test, which stays unchanged. (2) This file's own line ~300-325 (T21's landing
      note) and `tools/lane/css-lane.json`'s matching T21 release note both still claimed
      `.pm-kanban-col-badge-icon` "genuinely uses" the badge icon span after T25 (closed earlier in
      this file) removed that span — both corrected with a dated stale-as-of-T25 note: the rule
      stays in `styles.css` as part of the verbatim reference-CSS copy, not because a local span
      still reaches it. (3) T12's own evidence bar ("opens both sets of captures") cannot be met
      in-repo — the vendored reference carries zero image files. Amended to two halves: a fresh
      session compares the captures against the reference SOURCE
      (`kanban.css`/`table.css`/`widgets.css` and the composites) with pixel measurements
      in-repo, AND the operator compares the two plugins side by side in the vault where both are
      installed. Recorded as an orchestrator decision (reversible default, the operator may
      restore the original wording) in `implementation-summary.md`'s Key Decisions, dated
      2026-09-04; the operator half added as row 37 in the parent `../roadmap.md` §4 operator
      table, explicitly marked never-tick. T12 itself stays unticked — a final fresh read follows
      this leg.
- [x] **T29** Transcribe the two missing host tokens the board's milestone/recurrence chips read —
      REQ-007 fidelity pass (Q), a fifth fresh T12 reviewer's item 1 (P2). This leg ran in-runtime
      (bounded scope: this dispatch's four numbered items).
      *Evidence to close:* `tools/screenshots/theme.css` transcribed Obsidian's palette only
      partially — `--color-red`/`--color-orange`/`--color-green` existed, `--color-purple`/
      `--color-blue` did not, so `board-renderer.ts`'s inline `--pm-chip-color: var(--color-purple)`/
      `var(--color-blue)` (`renderReferenceChip`, milestone M / recurrence R chips) was
      guaranteed-invalid at computed-value time and both chips painted with no fill in every
      capture that forces one (`board-view`, `core.mjs`'s Adobe Creative Cloud/Sketch cards; the
      Sub chip, T14's green, rendered correctly beside them). Red first:
      `pinned-values-baseline.json`'s `unsupplied` map pruned of `--color-blue`/`--color-purple`
      (and a stale `--color-green` entry already supplied, unrelated staleness fixed in passing
      since this session was editing the same map) to the current five-token reality, then
      `node tools/screenshots/scan-pinned-values.mjs` run with `theme.css` stashed to its
      pre-session state — FAIL, `UNSUPPLIED — --color-blue: 1 declaration(s), not in the baseline`
      and the same line for `--color-purple` (`styles.css:13290`/`:13299`, an unrelated
      formula-editor token chain sharing the same two bare `var()` reads); green after restoring
      the edit, 5 unsupplied against a baseline of 7. Transcribed light `#7852ee`/`#086ddd`, dark
      `#a882ff`/`#027aff` from the installed Obsidian 1.13.4 `app.css` (extracted via
      `@electron/asar`; `obsidian.asar`'s own `package.json` reads `1.13.4`, not the `1.13.7` the
      neighbouring red/orange/green comments cite — read directly this session, not carried over),
      same comment style as the existing three. `board-view-{desktop,mobile}-{dark,light}.png`
      recaptured and read: the M chip now reads purple and the R chip blue in both themes;
      `constructed-board*` carries no milestone/recurrence data in the bench schema, so those
      captures were unaffected by this token (T30's priority column is the change they show).
      `tsc` 0, `vitest` 1010/1010, `lint` 172 (unchanged), `scan-comments` PASS, `npm run gate` 25
      green / 0 red.
- [x] **T30** Give the board bench a priority column so a production capture shows the per-card
      priority strip — REQ-007 fidelity pass (R), a fifth fresh T12 reviewer's item 2 (P2). This
      leg ran in-runtime (bounded scope: this dispatch's four numbered items).
      *Evidence to close:* `tools/bench/board-render-bench.ts` had no column named "priority", so
      `getReferencePriorityColumn`'s case-insensitive match never resolved and no production
      capture (`constructed-board`/`constructed-board-subtask`) ever showed the reference's
      card-top priority strip — only the hand-written `board-view` fixture demonstrated it, via an
      explicit forced `priorityColor` prop unrelated to the bench. Red first: a new
      `constructed-board-priority` case in `tools/live/constructed-state-assertions.mjs` asserted
      10 of 18 constructed-board cards carry `pm-kanban-card-priority-bar` (five urgent + five high
      rows of eighteen, cycling `urgent/high/medium/low` in that order) — FAIL at 0 with
      `board-render-bench.ts` and `render-assertion-harness.ts` stashed to HEAD, PASS at 10/18
      restored. `makeColumns`' one mixed-kind `"select"` column (index 3, `PRIORITY_COLUMN_INDEX`)
      re-keyed to `"priority"`, mirroring the existing people rename (index 4, `"multi-select"`) —
      no column added, no other name touched, count unchanged at 21. `render-assertion-harness.ts`'s
      `applyCaptureOptions` was overwriting every select/status/multi-select column (the priority
      rename included) to a generic five-name capture palette that never matches the reference's
      `medium`/`low`/`none` omission (`isReferenceLowPriorityTier`), which would have striped every
      card instead of only some; excluded the `"priority"` key from that overwrite and added
      `applyCapturePriorityTiers`, giving the column its own four-tier palette and cycling
      `CAPTURE_ROWS` (18) through it. `constructed-board`/`constructed-board-subtask`
      (`{desktop,mobile}-{dark,light}`, 8 captures) recaptured and read: a 3px card-top strip
      appears on exactly the urgent/high-tier cards in every column and no strip on medium/low
      cards, confirmed by pixel-sampling the backlog column's four tiers directly against the
      expected 50%-opacity `--status-color-fg-*` blend (row-0 urgent measured ~`(142,116,116)`
      against red's computed blend, row-5 high ~`(142,123,100)` against orange's, row-10/row-15
      medium/low flat background, no spike) since the strip is visually subtle at normal viewing
      size (`styles.css:9083-9086`: `height: 3px; opacity: 0.5`). One capture
      (`board-view-desktop-dark.png`) moved bytes only across this leg's full recapture — same
      `pixelHash`/`layoutHash` as `HEAD`, restored to committed bytes, `manifest.json`'s `bytes`
      field corrected to the restored file's actual size (`HEAD`'s own manifest `bytes` value was
      already 20 bytes off the committed blob's true size, pre-existing, left alone). Six unrelated
      `constructed-board-subtask`/`constructed-timeline-subtask` marker failures in
      `constructed-state-assertions.mjs` (subtask toggle/progress/depth markers) confirmed
      pre-existing at pristine `c563f08` `HEAD` before any of this session's edits — out of this
      leg's scope, left unfixed. `tools/lane/css-lane.json`: `styles.css` untouched, hash unchanged;
      a new release entry names all 11 content-changed captures across T29/T30 (`check-lane` exit
      0, "release names all 11 changed capture(s)"). `tsc` 0, `vitest` 1010/1010 (100 files), `lint`
      172 (unchanged), `lint:tools` clean, `scan-comments` PASS, `npm run gate` 25 green / 0 red.
- [ ] **T31** Reference-capture comparison, 2026-09-04 — the board read against a CAPTURE of the
      reference rather than its source. `screenshots/project-manager/reference-kanban{,-subtask}-
      {desktop,mobile}-{dark,light}.png` photograph the vendored plugin rendering the same bench
      project our `constructed-board` captures show, mounted through the shared obsidian stub
      (`../043-constructed-capture` T031, commit `bd3e2c0a`). Measurements are from the
      desktop/dark pair at 2880x1800 and DPR 2, so one CSS pixel is two image pixels. Unticked: it
      records a comparison and two P2 gaps, neither fixed here.

| Element | Ours | Reference | Verdict |
|---------|------|-----------|---------|
| Column width / gap | 280 / 14 | 280 / 14 | exact — edges at 32/312, 326/606, 620/900, 914/1194 in both |
| Board left inset | 32 px | 32 px | match; `.pm-kanban-board`'s negative margin cancels the container padding exactly |
| Board right clip | 1416 px | 1424 px | host: 8 px, the container's right padding and scrollbar gutter |
| Column topbar | 3 px at y 32-35, opacity .5 | identical y and rule | match; colour differs |
| Header badge | 13 px / 600, glyph band y 49.0-61.0 | identical band | exact |
| Count chip | pill y 45.0-64.0 (19 px), text 50.5-58.5 | pill 45.0-62.0 (17 px), text 49.5-57.5 | **(d) P2 — 2 px taller** |
| Column header height | 2 px taller; everything below shifts 2 px down | — | **(d) P2**, the same cause |
| Card padding / gaps | `.pm-kanban-cards` 6/10, body 10/12, gaps 8/7 | identical declarations | match |
| Card title | 12 px / 500 / 1.45 inside `.pm-kanban-card-title-row` | identical (`widgets.css:81`) | match |
| Priority strip | 3 px, opacity .5, on the urgent/high rows, omitted for medium/low | identical rule, identical row set | match; colour differs |
| Hours chip | `0.5h`, `37.5h`, `74.5h`, ... | identical | match |
| Avatar stack | two `sm` avatars, same initials and overlap | same | match |
| Due chip text / position | same | same | match |
| Overdue state | red on odd rows only | red on every past-due row outside the terminal lane | data model: our port reads completion from a checkbox column, which the bench fills on `i % 2 === 0`; the reference reads the status config's `complete` flag. Not a rendering difference |
| Tag row | none | none | match by construction — the bench has no tags column, so the fixture leaves `tags` empty rather than inventing one |
| Lane label | raw group value | same | match |
| Lane and priority colours | harness palette through `--status-color-fg-*` | its own DEFAULT_STATUSES / DEFAULT_PRIORITIES hexes | recorded fixture difference: our colour is a palette NAME resolved through a token defined in `styles.css`, which the reference page deliberately does not load |
| Subtask variant | parent chip `row-0`, `Sub` chip, 62% progress bar, lane counts 6/3/3/3 | same | match |

      TWO (d) GAPS, both P2, neither fixed here because `styles.css` is outside this leg's scope:
      (1) the column header renders 2 CSS px taller than the reference's. `.note-database-container`
      sets `line-height: var(--db-font-md-line-height)` (1.45, `styles.css:826`) and every
      descendant inherits it; `.pm-kanban-col-count` sets no line-height of its own in either copy,
      so our count pill measures 19 px against the reference's 17 and pushes the header — and every
      card under it — down by 2 px (confirmed by cross-correlation: the best match between the two
      card regions is at -2 CSS px). A one-declaration fix on the chip. (2) The reference's
      `::-webkit-scrollbar` / `-thumb` / `-track` rules for `.pm-kanban-board` and
      `.pm-kanban-cards` were never copied; our stylesheet carries that block for `.pm-gantt-right`
      alone. Invisible in these captures because the columns do not scroll, which is why no earlier
      source read caught it. Everything else on the card and column is pixel-faithful.

      **Correction (2026-09-05):** gap (2) above is wrong about the cause, not the symptom. The
      reference's `widgets.css:1-7` scopes its `::-webkit-scrollbar` rule to
      `.pm-gantt-right, .pm-kanban-board, .pm-kanban-cards, .pm-task-modal, .pm-edit` at `6px`. Our
      port never copied that per-element rule, but it is not scrollbar-less: `styles.css:834-835`'s
      pre-existing `.note-database-container::-webkit-scrollbar, .note-database-container
      *::-webkit-scrollbar { width: 8px; height: 8px; }` already reaches `.pm-kanban-board` and
      `.pm-kanban-cards` as descendants of the container, the same way it reaches every other
      scrollable surface in this plugin. So the board's scrollbar is styled, just 2px wider than
      the reference's own 6px — a P3 sizing gap, not a missing-rule gap. Left unfixed here (still
      outside this leg's scope); T31 stays open on gap (2) under the corrected description.
- [x] **T32** Fix T31 gap (1): reset the inherited container line-height on the ported kanban
      block, 2026-09-05 — a fresh in-repo side-by-side (reviewer, 2026-09-04, at commit
      `466eb370`) traced three board fidelity gaps to the same T31 cause: (a) the count pill 19px
      vs 17px / header 2px taller; (b) the subtask parent line (`.pm-kanban-card-parent`) 2-3px
      taller per card, compounding down the column; (c) the hours-row baseline reading low by a
      sub-pixel amount. Root cause confirmed: `.note-database-container` sets
      `line-height: var(--db-font-md-line-height)` (1.45), and the reference this board is a
      one-to-one port of never sets a line-height on its kanban tree at all, so every ported
      `pm-*` element the reference leaves unset (`.pm-kanban-col-badge`, `.pm-kanban-col-count`,
      `.pm-kanban-card-parent`, `.pm-avatar*`) was inheriting 1.45 instead of computing to the UA
      `normal` (~1.2) the reference gets.
      *Evidence to close:* red first — `tools/screenshots/scenarios/shared.test.mjs`'s new
      "resets the inherited container line-height on the ported kanban block" asserted
      `line-height: normal;` inside the `.note-database-container.pm-kanban-view` rule block,
      FAIL against the pre-fix stylesheet. Fix: added `line-height: normal;` to that existing
      compound-selector rule (`styles.css:962`, the same selector the flex/overflow height chain
      already uses), inherited by the whole kanban subtree; elements the reference DOES author
      with their own value (`.pm-kanban-card-title` 1.45, `.pm-kanban-card-description` 1.4,
      `.pm-chip` 1.5) keep it, asserted by the same test. Audited every ported `pm-*` rule in the
      kanban block for a missing line-height: `.pm-kanban-col-badge` and `.pm-kanban-col-count`
      (both affected, now `normal`), `.pm-kanban-card-parent` (affected, now `normal`),
      `.pm-avatar`/`.pm-avatar--sm`/`.pm-avatar--more` (technically inherit `normal` too now, but
      were never visible in practice — fixed 26px/22px box, flex-centered content, so line-height
      never changed their rendered size), `.pm-progress-label` (same gap in principle, but unused
      by the current renderer — dead CSS, not screenshot-testable). Measured directly against
      `screenshots/project-manager/reference-kanban{,-subtask}-{desktop,mobile}-{dark,light}.png`
      and against the HEAD-committed captures, at DPR 2 (physical px / 2 = CSS px): count pill
      38->34 physical px (19->17 CSS px), exact match to the reference, confirmed on
      desktop-dark, desktop-light and mobile-light; subtask child card (`row-1`) full
      border-to-border height 254->248 physical px (127->124 CSS px), exact match to the
      reference's own 248; every band in that card from the title down (title/hours/avatar-top)
      now sits at the identical absolute pixel y-range as the reference
      (476-490/525-540/574-575 physical, bit-for-bit) versus a 4-10 physical px low offset before
      the fix — confirming gap (c)'s "hours baseline low" was the header-height delta (a) and the
      parent-line delta (b) propagating downward through the flex column, not an independent
      third defect. A non-subtask card (`row-0`) showed the same bit-for-bit match after the fix
      (152-159/188-206/239-254), consistent with the header-height shift alone. Zero gantt
      captures moved (see T31's sibling audit in `037-timeline-gantt-port/tasks.md`). 32 real
      content-changed captures (`board-drop-language`, `board-empty-column`,
      `constructed-board-empty-column`, `board-mobile`, `board-subtask-tree`, `board-view`,
      `constructed-board`, `constructed-board-subtask`, all four theme/device combinations) opened
      and read; 3 byte-only-noise captures restored to HEAD. `tools/lane/css-lane.json`: acquired
      as `038-board-kanban-port`, released naming all 32 changed captures. `tsc` 0, `vitest` full
      suite green (new stylesheet-contract test red-then-green), `lint:tools` clean,
      `scan-comments` PASS, `npm run gate` 25 green / 0 red.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T8 closes. Everything else is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md)
<!-- /ANCHOR:cross-refs -->
