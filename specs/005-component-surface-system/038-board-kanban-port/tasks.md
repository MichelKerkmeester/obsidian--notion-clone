---
title: "Tasks: Board / Kanban Port"
description: "Task breakdown following the plan's group/card contract, drop matrix, keyboard/touch/cover, screenshot, gate order."
trigger_phrases: ["038 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-04T09:55:00Z"
    last_updated_by: "board-1to1-fidelity-pass-2"
    recent_action: "T20-T21 closed: priority non-urgent tiers, due-completion suppression, fixture/CSS fidelity"
    next_safe_action: "T12 visual-language comparison next, then T8 operator confirmation"
    blockers: []
    key_files: ["spec.md", "plan.md", "implementation-summary.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038"
      parent_session_id: null
    completion_pct: 71
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
      icon span now genuinely uses. `tools/lane/css-lane.json`: acquired, edited, and released as
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
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T8 closes. Everything else is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md)
<!-- /ANCHOR:cross-refs -->
