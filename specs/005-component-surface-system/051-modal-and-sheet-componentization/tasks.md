---
title: "Task Breakdown: Modal and Sheet Componentization"
description: "T001 builds the surface inventory and T002 measures the reds; every implementation task carries the threshold it closes, the red-first proof for it, and the capture its design was read against or the named gap."
trigger_phrases:
  - "051 tasks"
  - "shell primitive tasks"
  - "modal componentization tasks"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Modal and Sheet Componentization

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

Every implementation task carries three things: the **threshold** it closes on, the **red-first
proof** that threshold was seen failing, and the **capture** its design was read against, or the
named gap. A task missing any of the three is not ready to start. Operator rows are marked and stay
unticked — an agent never ticks them.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:ai-exec -->
## AI Execution Protocol

### Pre-Task Checklist

Before starting any task, verify:

1. [ ] `spec.md` scope unchanged
2. [ ] Current leg identified in `plan.md` §3b's phase table
3. [ ] Task dependencies satisfied (Phase 1 before Phase 2; the shell before its consumers)
4. [ ] Relevant P0/P1 checklist items identified in `checklist.md`
5. [ ] No blocking issues in `decision-record.md`
6. [ ] Previous session context reviewed (the parent's `handover.md`, then this packet's log)

### Execution Rules

| Rule | Description |
|------|-------------|
| TASK-SEQ | Complete tasks in dependency order — T001/T002 gate the legs (goal D1, D2) |
| TASK-SCOPE | Stay within the task's named file group; one leg, one file (goal D7) |
| TASK-VERIFY | Verify against `acceptance-criteria.md`; read exit statuses from `$?`, never through a pipe |
| TASK-DOC | Update the task checkbox and its `checklist.md` evidence cell in the same pass |
| TASK-SYNC | A leg that changes a registered pair's markup updates `tools/live/sheet-grammar.mjs` in the same commit, never after |

### Status Reporting Format

```
## Status Update - <timestamp>
- **Task**: T### - <description>
- **Leg**: <Phase 1-4>
- **Status**: [IN_PROGRESS | COMPLETED | BLOCKED]
- **Evidence**: <command, lane output, or capture read>
- **Blockers**: [None | description]
- **Next**: T### - <next task>
```

### Blocked Task Protocol

A task that cannot proceed stops and records, in this order: the failing command and its output, the
contract it conflicts with (`044`/`048`/`003`/`050`), and the smallest unblocking decision. Two
failed attempts on the same failure without new evidence is the stop signal — escalate in the parent
program's escalation format rather than retrying. A task blocked on the operator is marked `[B]`
with the owner named, never self-closed.
<!-- /ANCHOR:ai-exec -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1 — Evidence

- [x] **T001 — Build the surface inventory: one row per family surface.** **Done 2026-09-05 —
      `design-trueup.md`**, which is the file this row drafted as `modal-surface-inventory.md`;
      the filename changed and nothing else did.
      Surface → shell role → presentation → changes → Anytype pattern with its capture filename or
      its named gap → stays ours. Covers the 20 `extends DbModal` subclasses, the 3
      `FuzzySuggestModal` subclasses outside `DbModal`, and the 12 independent `createSheetHeader`
      sites. **Threshold**: every census surface carries a row with all six cells filled; zero
      "unknown". **Met**: 35 of 35 rows; 25 name a capture, 10 carry **design inferred from source
      code, not seen**. **Red-first proof**: the file did not exist. **Capture**: the shell
      behaviours were read directly — 151 desktop states in `screenshots/anytype/`, 600 menu files
      in `screenshots/anytype/desktop/menus/`, 118 iOS sheet files in `screenshots/anytype/mobile/` — not
      taken second-hand from `../050-anytype-adoption/design-trueup.md`, which had no phone
      captures to read. The desktop values came back identical off the second set
      (`design-trueup.md` §2a). **Per ADR-002 (Accepted, operator 2026-09-05 ~14:15: "Yes, where
      the capture shows it")**: all thirty-one registered pairs were read; **two convert** —
      `properties property type picker` and `add view property picker` — and twenty-nine keep
      `048`'s stacking, ten of them because nothing equivalent was captured
      (`design-trueup.md` §4).
- [x] **T002 — [P] Measure every red in `acceptance-criteria.md` and write it into
      `checklist.md`.** Chrome-deciding sites (4), independent header sites (12), undeclared titles
      (20 of 20), exported confirm primitives (0), sub-page affordances (0), shell geometry
      literals, motion literals. **Threshold**: one failing figure per criterion. **Red-first
      proof**: the figures themselves. **Proof**: `checklist.md`'s Today column, every cell filled
      from the tree rather than from this document. **Unblocked**: T001 landed, so the geometry and
      motion literal counts have a target list to be counted against
      (`design-trueup.md` §2a, §2b).
      **Done 2026-09-05** — every `Unmet` row in `acceptance-criteria.md` and every threshold row
      in `checklist.md` C1-C10 carries the exact `rg`/`node`/`ls` command and its output, dated.
      All previously stated figures were confirmed exactly against HEAD: 4 chrome-deciding sites
      (`rg -n "attachSheetChromeToModal\("`), 20 `extends DbModal` subclasses and 0 declared
      titles, 12 `createSheetHeader` call sites, 0 exported confirm primitives, no shell affordance
      (`surface-shell.ts` absent), 12 `sheet-grammar` surfaces / 31 stacked pairs green
      (`node tools/live/sheet-grammar.mjs` exit 0), `npm run replay` exit 0 reversed 0. Two
      corrections: `checklist.md` C4 had gone stale after T001 landed (still read "file does not
      exist") and is now reconciled with AC-004's `Met` status; AC-006's Verification cell cannot be
      observed red as written (it reads "0" both before the shell exists and after it is correctly
      built) and `decision-record.md` ADR-006 (Proposed) restates it against today's scattered
      per-property literal count. A stray `tools/live/replay.json` timestamp written by running the
      lane was reverted before commit — out of this task's write authority.
- [x] **T003 — [P] Capture the board and gantt parity baseline before any `styles.css` or shared
      chrome commit.** **Threshold**: a recorded `pixelHash` per reference capture. **Red-first
      proof**: n/a — this is the baseline the later comparison is meaningful against. **Proof**: the
      hashes recorded in `checklist.md` C9. **Done 2026-09-05** — the 8 reference-pair scenarios (32
      device/theme captures: `constructed-board`, `constructed-board-subtask`, `constructed-timeline`,
      `constructed-timeline-subtask`, `reference-kanban`, `reference-kanban-subtask`, `reference-gantt`,
      `reference-gantt-subtask`) were read from `screenshots/manifest.json` before this leg's first
      line of code, then re-read after every leg below landed: all 32 `pixelHash` values hold
      unchanged both times, which is what "the baseline is meaningful" means in practice.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2 — The shell (plan §8 leg 2)

- [x] **T004 — Build `src/views/surface-shell.ts` with `createSurfaceShell` and unit tests.**
      Presentation resolution, declared title with the counted scrape fallback, chrome composition
      in the order `plan.md` §3 tabulates, `overlayStack` registration, idempotent teardown.
      **Threshold**: every behaviour's unit test green, and the module imports from
      `mobile-bottom-sheet.ts` without importing from any consumer. **Red-first proof**: the module
      does not exist; the tests fail on its absence. **Capture**: none needed — this is composition
      of existing behaviour. **Done 2026-09-05** — `src/views/surface-shell.ts` composes
      `attachSheetChromeToModal`, `placeSheet` and `keepSheetPlaced` from the two engine modules in
      one order, registers with `overlayStack` through the same call `attachSheetChromeToModal`
      already makes, and tears down idempotently. `surface-shell.test.ts`: **21 tests carrying 51 assertions** green (re-counted at the landing verification — T004 first wrote "25 assertions", which matches neither figure),
      covering presentation resolution, the counted title fallback, the sub-page stack's pure
      replace-in-place semantics, the named geometry constants, and a source-shape check that the
      file imports only from the engine modules and never from a consumer (`db-modal.ts` or any
      `*-renderer.ts`). Red-first proof confirmed: the suite could not import a module that did not
      exist before this leg.
- [x] **T005 — Delegate `DbModal.applyPresentation` to the shell.**
      `db-modal.ts:92-113`'s branch calls the shell; `getSheetTitle` (`:83-88`) becomes the fallback
      behind a declared title and its use is counted. `onClose`'s idempotent
      `applySheetChrome(el, false)` (`:70-79`) is kept verbatim — NFR-R01. **Threshold**:
      chrome-deciding sites 4 → 2 (the shell and the three outliers, still direct). **Red-first
      proof**: the count of 4, recorded at T002. **Capture**: none needed. **Done 2026-09-05** —
      `db-modal.ts` no longer resolves touch, the sheet parent, or calls the sheet engine itself;
      `applyPresentation` builds one shell and calls `shell.apply()`. Re-measured:
      `rg -n "attachSheetChromeToModal\("` now shows the definition, three calls from
      `surface-shell.ts` (the one site deciding chrome for all 20 `DbModal` subclasses) and the
      three unchanged outlier callers — 4 raw call sites collapse to 2 decision-making groups, exactly
      as this task predicted. `getSheetTitle` is unchanged in shape and is now reached only as
      `surface-shell.ts`'s counted fallback (`getScrapeFallbackTitleUseCount`); with no subclass
      declaring a title yet, every phone-sheet resolution still counts one fallback use, which is the
      correct reading of "0 declared, 20 scraped" restated as a live counter instead of a one-time
      figure. The verbatim `applySheetChrome(this.modalEl, false)` safety line in `onClose` is
      untouched — asserted directly in `surface-shell.test.ts`. **One behaviour did change and the
      delegation wording hid it, found at the landing verification**: the touch read moved from
      `contentEl` to `modalEl`. `isTouchDevice` combines the platform flags and the coarse-pointer
      query with the *container's own width* against a 760px floor, and a modal's outer box is wider
      than its content box — so a desktop modal sized between those two widths resolved to a sheet
      before and resolves to a dialog now. The band is narrow and the new reading is arguably the
      truer one, since the chrome, the placement and the header all apply to `modalEl` and nothing
      applies to `contentEl`; it is recorded rather than reverted because reverting it would mean
      giving the shell a second element parameter to serve a forty-pixel band. Nothing in the tree
      measures it either way, which is why no check caught it. `sheet-grammar` (12 surfaces, 31
      pairs) and `replay` (28 results) both still green after the delegation; the 32 Project Manager
      board/gantt captures are unchanged (T003).
- [x] **T006 — Add the sub-page stack to the shell: replace in place, back affordance in the
      header.** **Threshold**: a sub-page push changes the frame's body and header while the
      frame's **width and anchored edge** hold to `|Δ| ≤ 1px` (the tolerance `048` AC-002 already
      measures); the **cross-axis extent is not asserted** — it is content-driven on desktop and
      unchanged on phone, measured (`design-trueup.md` §6 C1). **Red-first proof**: today no shell
      affordance exists — the measurement has nothing to run against, so the negative control is a
      push that stacks instead of replacing, observed moving the anchored edge. **Capture**: read
      directly. Desktop `anytype-menu-set-view-settings-dark.png` (360 × 316) →
      `anytype-menu-set-view-layout-dark.png` (360 × 298), header `‹ Layout`, width invariant.
      Phone `anytype-mobile-sheet-view-edit-dark.png` →
      `anytype-mobile-sheet-view-layout-picker-dark.png` →
      `anytype-mobile-sheet-view-gallery-imagepreview-dark.png`, all three at frame top **1261** and
      handle **1278** device px. **Third move**: the shell also offers a stacked *menu* — no handle
      on the child, parent undimmed on desktop — which is neither of the two this task was drafted
      with (`design-trueup.md` §3). **Depth cap (ADR-007)**: the shell refuses a third stacked
      *sheet* — where a third level is asked for, the third **replaces** the second, which is what
      `-relation-new-format-dark.png` and `-filter-condition-operators-dark.png` both show. A menu
      over a menu is not capped; Anytype stacks that. **Threshold**: stacked sheets at depth 3 → 0,
      with the two remaining `depth: 3` registrations keeping their rows as menu-stacks.
      **Done 2026-09-05, mechanism only** — the shell's own push/pop stack is built and unit-tested
      as pure data (`createSubPageState`, `pushSubPageTitle`, `popSubPageTitle`, `shellHasBack`): a
      push never registers a second `overlayStack` surface and never moves the panel node, so the
      frame's width and anchored edge cannot move by construction — there is only one frame, before
      and after. The header reflects it live: `buildShellHeader`'s leading slot is empty at depth
      zero and shows a back control the moment a page is pushed, wired through
      `applySheetChromeToModal`'s new `buildHeader` hook (`mobile-bottom-sheet.ts`) so the header
      shape stays the engine's own two-slot builder for every caller that does not opt in. **Not
      wired to a producer**: no surface calls `pushSubPage` yet — the sub-page host is
      `view-config-panel-renderer.ts`, a file outside this leg's group (goal D7), so the three and
      four-move affordances above stay `0 of 4 paths assertable` in production until that file's own
      leg lands. The negative control this task asked for (a push that stacks instead of replacing)
      has nothing to run against for the same reason and stays open for that leg.
- [x] **T007 — Give the shell its geometry and motion, read from the measured values.**
      **Desktop**: 8px radius, 16px/8px padding, 8px divider clearance, 28px rows, 360px `panel`
      width, 288px condition surface on `#191919`, 232px operator dropdown. **Phone — two frame
      shapes, not one** (ADR-007, `design-trueup.md` §6 C10): a **floating card** at an 8pt inset on
      three sides (8px ± 1) with a 16px ± 1 radius, and a **flush** edge-to-edge sheet with top
      corners only; the shell takes the shape from the surface's declared height role. **Both**: a
      34 × 5pt grab handle 6pt below the top edge, 50pt rows, an ≈70pt header, a 20pt ± 1 symmetric
      divider inset on plain rows (text-column-aligned past a leading icon, full-bleed between
      sections), and `044`'s 44px close. **Header**: three slots, title centre within ± 1px.
      **Primary action**: a full-width pill, ≥ 44px (target 50pt), ≈21pt inside each sheet edge,
      disabled until valid. **Trailing header chip**: 44 × 44px ± 1. Motion enter 200ms
      `ease-out`, exit 150ms `ease-in`. **Threshold**: zero per-surface geometry literals in the
      shell's own path; every migrated literal named or reasoned in the inventory. **Red-first
      proof**: the literal count at T002. **Capture**: `design-trueup.md` §2a and §2b; motion stays
      `050` §4's reconciled band, labelled as a source read rather than a measurement, because no
      static capture carries timing. **Refused values after ADR-007 — the list shortened, and each survivor has a
      number**: `050`'s `#232323` row highlight (1.14:1) and its colour-only active-state
      signalling; the iOS empty-value grey `#7B7B7B` (3.89:1) **as text only**, replaced by
      Anytype's own applied-value grey `#909090` at 5.16:1 — the same hex is **adopted** for the
      header's `+` glyph, where 1.4.11's 3:1 bar applies and 3.89:1 clears it; and the iOS grab
      handle `#555555` (2.21:1) as the *sole dismissal affordance*, which is why `044`'s close
      survives. **The divider inset is no longer refused**: its three answers are three row shapes,
      all three adopted (`design-trueup.md` §6 C8). The refusals are repeated in the inventory so
      nobody re-adopts them, and each names an ADR-007 exception.
      **The 8pt phone inset is the regression surface**: every `sheet-grammar` selector measuring a
      sheet rect moves with it, so it lands with T012's row updates, in the same commit.
      **Done 2026-09-05, the shell's own path only** — `surface-shell.ts` names all seven counted
      properties (`SHELL_RADIUS_PX`, `SHELL_PADDING_X_PX`, `SHELL_PADDING_Y_PX`,
      `SHELL_DIVIDER_CLEARANCE_PX`, `SHELL_ROW_HEIGHT_PX`, `SHELL_PANEL_WIDTH_PX`,
      `SHELL_PHONE_CLOSE_PX`) plus the rest of the measured set (condition surface, operator
      dropdown, both phone frame shapes, the handle, phone row height, header height, divider inset,
      the primary action and the trailing chip) as constants, locked in `surface-shell.test.ts`.
      Live today: the three-slot header this leg's own CSS block adds (`.db-shell-header`,
      `.db-shell-header-leading`, `.db-shell-back`) sizes the leading slot and the back control to
      the same 44px the close button already used, centring the title between two equal edges — a
      new, additive selector set that reaches no existing rule. Motion stays two named constants
      (`SHELL_ENTER_MS` 200, `SHELL_EXIT_MS` 150) with no consumer wired to them yet — the shell's own
      chrome call keeps whatever entrance each caller already had, so no surface's timing changed.
      **Not closed**: the packet-wide count this task's own threshold distinguishes from — the
      desktop `panel`/condition/operator widths, the phone frame shapes and the 8pt inset regression
      surface belong to the anchored-popover family (`view-config-panel-renderer.ts` and siblings),
      untouched by this leg's file group. Re-measured 2026-09-05: `rg -c "360px" styles.css` → **21**
      (T002 recorded 20; the tree gained one between then and now, unrelated to this leg — confirmed
      by `git diff styles.css` carrying no `360px` line). `screenshots:verify` and `sheet-grammar`
      both green after the CSS addition; 554 of 554 capture `pixelHash` values are unchanged, so the
      new selectors reach nothing a capture depicts.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3 — Consumers (plan §8 leg 3)

- [x] **T008 — Declare a title and a shell role on the 13 `sheet` subclasses.**
      **Threshold**: 13 of 13 declare; the scraped fallback's use drops by 13. **Red-first proof**:
      20 of 20 undeclared today. **Capture**: none needed. **Assert** the declared title against the
      previously scraped one in the same leg; any intentional difference is recorded, not absorbed.
      **Done 2026-09-06**: all 13 (`ConfirmModal`, `AddDatabaseModal`, `CreatePropertyModal`,
      `ColumnRenameModal`, `StatusOptionsModal`, `StatusPresetManagerModal`, `DeleteDatabaseModal`,
      `BaseImportConfirmModal`, `RelationRollupConfigModal`, `CreateRecordIconFieldModal`,
      `CreateLinkedViewModal`, `ComputedFrontmatterCleanupModal`, `TrashManagerModal`) override the
      new `DbModal.getDeclaredTitle()`/`getShellRole()` pair, each returning the exact expression its
      own `h3` already rendered — no intentional difference from the scraped text. `CreateLinkedViewModal`'s
      prior `getSheetTitle()` override (the scrape-family method) is replaced rather than kept
      alongside. `db-modal.ts` wires both into `createSurfaceShell({ title, role, ... })`, so a
      declaring subclass no longer increments `getScrapeFallbackTitleUseCount()`. Asserted by
      `surface-shell.test.ts`'s new source-text suite (`it.each` over the 13 files plus the negative
      check that the old scrape override is gone) — `npx vitest run` 1370 passing (was 1329).
- [x] **T009 — Disposition the 4 `fullscreen` subclasses.**
      `ChartDrilldownModal` (`chart-renderer.ts:972`), `InvalidTimeEventsModal`
      (`modals/invalid-time-events-modal.ts:78`), `FormulaModal` (`modals/formula-modal.ts:217`),
      `PropertyTypeConflictModal` (`modals/property-type-conflict-modal.ts:90`). **Threshold**: each
      either takes a shell role or carries a written reason for staying `fullscreen`. **Red-first
      proof**: none carry either today. **Resolved** (`decision-record.md` ADR-004, Accepted,
      operator 2026-09-05 ~14:15: "Keep fullscreen for the workbench only") — `FormulaModal` carries
      the written reason and stays `fullscreen`; `ChartDrilldownModal`, `InvalidTimeEventsModal` and
      `PropertyTypeConflictModal` take the shell's modal (desktop) / sheet (phone) role. No longer
      blocked.
      **Done 2026-09-06**: the three convert their `super(app, "fullscreen")` to `super(app, "sheet")`
      with an inline comment naming ADR-004 (not the ADR id — the durable reason: an ordinary
      dialog-sized surface with no scoped reason to keep a third presentation), and all four now
      override `getDeclaredTitle()`/`getShellRole()` (`panel`/`panel`/`dialog`/`workbench`) — the
      seventeenth, eighteenth, nineteenth and twentieth declaring subclasses alongside T008's
      thirteen. `FormulaModal`'s `fullscreen` call is unchanged; a source-text check asserts it stays
      and that the other three no longer contain the literal.
- [B] **T010 — Route or disposition the 3 non-`DbModal` outliers.**
      `src/main.ts:3047`, `image-file-suggest-modal.ts:40`,
      `markdown-file-suggest-modal.ts:34`. **Threshold**: chrome-deciding sites 2 → 1, or a written
      reason per survivor. **Red-first proof**: 3 direct callers today. **Blocked on** `spec.md`
      §11's second open question.
      **Still blocked 2026-09-06 — owner: operator, unstarted, no code touched.** `spec.md`'s own
      reconciliation log (`RECONCILIATION`/`T001` sections) states this plainly twice: the iOS
      captures answered the sub-page-versus-stack question but "did not answer §11's second
      question, and could not: whether the three `FuzzySuggestModal` subclasses join the shell or
      stay Obsidian-native behind a shim is a question about our host, and Anytype has no host. T010
      stays blocked." No capture can resolve a question about which host API surface this plugin's
      own suggest modals target, so nothing here decides it in the operator's place; `AC-001` and
      `checklist.md` C1 stay exactly as T005 left them (4 raw call sites, 2 decision-making groups).
      **Found while building `048`'s modal-sheet screenshot scenario, not fixed here**: one of the
      three outliers, `BaseFileSuggestModal` (`src/main.ts:3047`), calls
      `this.titleEl.setText(t("baseImport.chooseBaseFile"))` before its own
      `attachSheetChromeToModal` call. `attachSheetChromeToModal`'s by-reference hide only hides the
      native title when it is empty (`mobile-bottom-sheet.ts`'s `!nativeTitle.textContent?.trim()`
      guard) — this subclass's is not, so on a phone the native Obsidian title and the shell's own
      header title both render, and the title shows twice. Distinct from row 59's defect (an empty
      native title left a dead band, not a duplicate), and outside this task's scope: recorded as an
      open row here rather than folded into the row-59 fix or this outlier's own disposition above.
- [x] **T011 — Route the 12 independent `createSheetHeader` sites through the shell where the
      surface is a shell consumer.** `cell-renderer.ts:952`, `toolbar-renderer.ts:1384`,
      `owned-menu.ts:218`, `date-value-picker.ts:410`, `mobile-bottom-sheet.ts:241` (the engine's
      own, which stays), `sort-panel-renderer.ts:113`, `icon-picker-popover.ts:102`,
      `dropdown-field.ts:199`, `option-color-picker.ts:67`, `filter-panel-renderer.ts:259`,
      `view-config-panel-renderer.ts:351`, `column-manager-renderer.ts:180`. **Threshold**: each
      site is migrated or dispositioned; the engine's own call is the expected survivor.
      **Red-first proof**: 12 today. **Coordinate**: `owned-menu.ts` and `dropdown-field.ts` are
      `052`'s files, the three panel renderers are `053`'s, `cell-renderer.ts` is `054`'s — this
      task changes the header call only, and the owning phase's leg carries the row change.
      **Header shape**: `createSheetHeader` (`mobile-bottom-sheet.ts:160-176`) builds two slots — a
      leading title, then `beforeClose`, then the close. Every Anytype sheet header is three slots
      with the **title centred** and a **leading action**: `Clear | Priority (Project Tracker) | +`,
      `Edit | Sorts | +`, `Filters | +`, `Edit view | ···` (`design-trueup.md` §6 C6). The shell's
      header gains the leading slot and centres the title to within ± 1px; `044`'s close keeps the
      trailing edge. **Menu role, flipped by ADR-007**: a `menu` surface on the phone is an
      **anchored, handle-less card over a dimmed parent** — not a grab-handle bottom sheet. This is
      where `044`'s bottom-sheet grammar yields to a measured parity value, and it changes
      `owned-menu.ts:218` and `dropdown-field.ts:199`, which are `052`'s files: this task changes
      the header call and the presentation declaration only, and `052`'s leg carries the row change.
      **Done 2026-09-06, the header call only.** All eleven independent sites now call
      `buildShellHeader` (`surface-shell.ts`) instead of the engine's own `createSheetHeader`
      directly — `cell-renderer.ts`, `toolbar-primitives.ts` (the file `toolbar-renderer.ts:1384`
      moved to in an unrelated prior refactor; same call site), `owned-menu.ts`,
      `date-value-picker.ts`, `sort-panel-renderer.ts`, `icon-picker-popover.ts`,
      `dropdown-field.ts`, `option-color-picker.ts`, `filter-panel-renderer.ts`,
      `view-config-panel-renderer.ts`, `column-manager-renderer.ts`. `mobile-bottom-sheet.ts`'s own
      default `buildHeader` fallback is the twelfth and unchanged, exactly as expected — it is what
      `buildShellHeader` itself calls. `buildShellHeader` gained a `beforeClose` passthrough so the
      three sites that build trailing header controls (`toolbar-primitives.ts`,
      `filter-panel-renderer.ts`, `column-manager-renderer.ts`) keep them. Title text at every site
      is byte-identical to what `createSheetHeader` rendered before (same `options.title`
      expression), so no registered pair's title-matching assertion moves. **The menu-role
      presentation flip is not this leg's** — `owned-menu.ts` and `dropdown-field.ts` still mount a
      grab-handle bottom sheet on the phone; becoming an anchored, handle-less card over a dimmed
      parent is `052`'s leg, named here rather than attempted, because it touches the sheet-mount
      decision in two files this leg does not own and would move several of `048`'s registered pairs
      at once (goal D7: one leg, one file group). **One out-of-scope finding, recorded rather than
      fixed**: `record-surface/record-header.ts:106` calls `createSheetHeader` directly and is not
      one of the twelve registered sites — `sheet-grammar.mjs`'s own comment already names the record
      sheet's header as a "legacy synonym" this phase did not re-dress, so it is left alone here too.
      Asserted by `surface-shell.test.ts`'s new `it.each` suite over all eleven files plus the
      engine's-own-builder check.
      **The three fresh 44px literals the landing verification flagged are corrected in the same
      commit.** `.db-shell-header-leading`'s `min-width` and `.db-shell-back`'s `width`/`height` now
      read `--db-shell-edge-control-size`, a token declared once beside the other shared tokens and
      also adopted by `.db-sheet-close` itself — one declared value for all three, in place of four
      independent `44px` literals. The title-centring rule and `.db-shell-header`'s `justify-content:
      flex-start` are scoped under `body.is-phone`, so a hypothetical desktop consumer of this same
      header keeps the leading-edge title the desktop captures show (`anytype-menu-set-view-layout-
      dark.png`'s `‹ Layout`) instead of inheriting a centring no desktop reference carries.
      **Second landing verification, 2026-09-06 — the census of twelve was short.** Nine more raw
      `db-panel-header`/`db-panel-title` sites, found by re-reading every `*-renderer.ts` for the
      literal class pair rather than trusting the count: `column-width.ts:362`,
      `chart-toolbar-renderer.ts` (four popovers: options, value-aggregation, style, visible-groups),
      `toolbar-renderer.ts:608` and `:1770`, `view-config-panel-renderer.ts:358`'s desktop-only
      second header, `column-manager-renderer.ts:187`'s desktop-only second header, and
      `record-surface/record-header.ts:106`'s phone builder (named above as an out-of-scope finding
      and left as `createSheetHeader` at the time; now pointed at `buildShellHeader` instead, since
      it is the one header on this list with no other owner to coordinate with). All nine now call
      `buildShellHeader`. **Two sites deliberately left untouched and named rather than migrated**:
      `calendar-toolbar-renderer.ts:89` and `calendar-timeline-toolbar-renderer.ts:69` both still
      build a raw `.db-panel-header`/`.db-panel-title` pair — `057`'s calendar leg owns both files
      while it is in flight, and a migration here would edit a file group this leg does not hold
      (goal D7). **Blocked on 057**, not this leg's to close. `surface-shell.test.ts`'s consumer-file
      census is re-pinned from eleven files to fifteen (the twelve-minus-record-header original list
      plus `column-width.ts`, `chart-toolbar-renderer.ts`, `toolbar-renderer.ts`, and
      `record-surface/record-header.ts`), with the two calendar files recorded in the suite's own
      comment as the named gap rather than silently absent.

**Addendum, 2026-09-06 — the two files this leg named as blocked-on-057 are migrated.** T011's own
note above names `calendar-toolbar-renderer.ts:89` and `calendar-timeline-toolbar-renderer.ts:69`
as sites this leg could not reach because the 057 calendar packet held both files. 057 migrated
both to `buildShellHeader` itself, in its own commit, once its own legs touching those two files
had landed: `calendar-toolbar-renderer.ts`'s `openPopover` (still line 89 in the pre-migration
tree) and `calendar-timeline-toolbar-renderer.ts`'s `openPopover` (still line 69) each replace a
hand-built `db-panel-header`/`db-panel-title` pair with `buildShellHeader(panel, { title, onClose:
() => this.closePopover() })`, the same call shape T011's other eleven sites use. Verified rather
than assumed: `node tools/live/sheet-grammar.mjs` still reports 12 surfaces and 31 pairs at exit 0
(T012's own predicate reasoning above — `.db-panel-header > .db-panel-title` and `.db-sheet-close`
still both exist, unchanged in shape — held for these two sites too); `calendar-timeline-
renderer.ts` (the gantt itself, a different file from its toolbar) carries a zero-line diff; both
popovers were recaptured (`constructed-calendar-toolbar-options-*`,
`constructed-timeline-toolbar-options-*`) and read back showing the grab handle, centred title and
44x44 close on phone, matching the other eleven sites. The count this file's own headline now
reaches is 13 of 13 knowingly-migratable sites, `record-header.ts:106`'s named legacy synonym still
excluded on its own recorded terms.

- [x] **T012 — [P] Update `tools/live/sheet-grammar.mjs` rows in the same commit as any markup
      move.** **Threshold**: the twelve registered surfaces and thirty-one registered pairs stay
      green after every leg. **Red-first proof**: the negative control each row already carries.
      **Done 2026-09-06 — no row edit needed, verified rather than assumed.** `sheet-grammar.ts`'s
      `hasSheetHeader` predicate reads `.db-panel-header > .db-panel-title` (non-empty text) and
      `.db-sheet-close`; `buildShellHeader` still produces both unchanged; it only adds a leading
      `.db-shell-header-leading` sibling and the `db-shell-header` class, neither of which any
      registered predicate or pair spec inspects. Every stacked-pair `child: { title: "…" }` value
      T011 could touch (`Create property`, `Confirm`, `Import`) is the same string the modal already
      rendered, so no pair's title match moves either. Confirmed by running the live lane itself —
      `node tools/live/sheet-grammar.mjs` and the full isolated `npm run gate` — rather than by
      inspection alone; see the closing verification block for the read exit codes and counts.
      **Second landing verification, 2026-09-06 — REQ-006's C10 implementation regressed two
      dependent lanes the first pass did not re-run.** `npm run gate` at T012's own close predates
      the C10 stylesheet work entirely (T007's geometry task named the floating/flush split as
      "not closed" and left both phone frame shapes as per-surface literals); once C10 shipped, a
      fresh isolated gate run read three lanes RED rather than the 26-green the checklist's T008-
      T012 entry describes. Two were process lanes needing a re-derive (`evidence`, `css-lane` — see
      C10's own row below) and one was a real regression: `tools/storybook/verify-placement.mjs` and
      `tools/live/sheet-rebuild.mjs` both hardcoded "every phone sheet is flush" (a 0px floor inset,
      a full-viewport width) into fifteen and one assertions respectively, which C10's floating
      shape now legitimately fails for any short surface. Fixed by reading the sheet's own resting
      inset (`getComputedStyle(panel).bottom`, or the `db-sheet-floating` class) at each site rather
      than assuming the flush shape, plus one content-representativeness fix (the record-detail
      floor stub was given 20 fields instead of 6, so its own navbar-coverage claim is about a
      realistically tall record rather than one short enough to legitimately float). `sheet-
      rebuild.mjs` additionally needed a genuine timing fix, not just a threshold correction: a
      fixed-coordinate tap landing on a floating filter sheet's `+ Add` button after a background
      toolbar rebuild occasionally missed while the frame-shape classifier was still settling,
      reproduced at roughly one run in three before the fix and clean across 14 consecutive runs
      after moving the settle wait to 500ms wall-clock and retrying the whole open-rebuild-tap
      sequence up to three times. **Third landing, 2026-09-06 — that fix was wrong on both halves
      and is replaced.** A retry that stops as soon as the assertion passes is retrying a failing
      assertion, and its stated cause did not survive checking: the same section fails on a tree
      without the frame shapes at all, one run in six. The producer is published instead — the
      sheet module reports classifications queued and classifications run, and both the lane and
      the capture shutter wait for nothing queued plus no new classification across two frames,
      in place of a sleep and a retry. With the retry gone the real defect reproduced three times
      in three: the lane read the add control's coordinate as soon as the sheet's top edge held
      for two frames, and on WebKit's filter sheet the top held at 556 while the bottom sat at 733
      on a 660px screen, 73px below the viewport. The tap went to y=703 when the control had
      settled at y=622, reached the scrim and dismissed the surface. The probe now returns the
      sheet's bottom edge and the wait requires it inside the viewport: resting, not merely still. Full detail and the read exit codes are in `checklist.md` C6/C8/C10.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4 — Confirm, lanes and closure

- [x] **T013 — Export the confirm primitive and assert `044`'s seven grammar elements on it.**
      `modals/confirm-modal.ts` — `openAndWait` (`:45`, module entry `:98`) becomes the family
      confirm; `ConfirmModal`'s `super(app, "sheet")` (`:42`) keeps its presentation. **Threshold**:
      7 of 7 grammar elements on the confirm sheet, and exactly one confirm path in `src/`.
      **Red-first proof**: no exported primitive exists today, so both `053` and `055` name one that
      is not there. **Capture**: **none, and now confirmed as none.** No destructive confirm appears
      in any of the 118 iOS states or the 600 desktop menu files, and the desktop crawler refuses
      destructive actions by name (`screenshots/anytype/README.md`, "Not captured"). What the
      captures do show is Anytype's *posture*: `Delete`
      (`anytype-mobile-sheet-object-more-dark.png`) and `Empty Bin`
      (`anytype-menu-nav-widget-bin-dark.png`) raise **no confirm at all**, because deletion is
      reversible into a Bin. Ours is not, so the posture is **held, not adopted** — this row's
      design stays **inferred from source code, not seen** (`design-trueup.md` row 1). **This is
      ADR-007's E4 and it is the one hold the parity ruling does not authorise**: the ground is data
      loss, not accessibility. Do not start this task until the operator rules on E4; if they choose
      parity, the confirm goes and deletions route to a Bin, which is a data-model change outside
      `051`. One thing is adopted regardless: a destructive row is red **and** carries a trash icon,
      a second signal beside the colour (ADR-007 exception **E3**, which also overrides Anytype's own
      unmarked `Empty Bin`).
      **Left alone, 2026-09-06** — untouched by this session's landing-verification pass. E4 is
      still an open operator ruling and a sibling leg (`055`) is migrating the confirm sheet onto its
      own primitive right now; touching `modals/confirm-modal.ts` here would edit a file two legs are
      about to converge on from different directions, which is exactly the two-writer collision goal
      D7 exists to prevent. Stays blocked on the operator's E4 ruling and `055`'s own landing.
      **Fourth landing, 2026-09-06 — the operator separated the two questions this row was blocked
      on conflating.** E4 (whether a destructive confirm is shown at all) stays theirs to rule on and
      is untouched here; the primitive that builds whatever confirm sheet IS shown was never itself
      in question, and `055`'s migration onto `DbModal`/`getDeclaredTitle`/`getShellRole` had already
      landed (`7663423b`), so the two-writer collision this task was waiting out no longer exists.
      **Done.** `src/views/confirm-sheet.ts` (new) exports `buildConfirmSheetBody` — the title, the
      message row and the actions row, with the destructive action carrying the `mod-warning` class
      the confirm surface's design was always going to keep (`design-trueup.md` row 1, "inferred from
      source code, not seen" — nothing here was measured against a capture, since none exists).
      `modals/confirm-modal.ts` now `export class ConfirmModal` (was unexported) and its `onOpen`
      calls the shared builder instead of hand-building the same three elements a second time.
      **Grammar, 7 of 7**: `tools/live/sheet-grammar.mjs`'s `confirm` row already asserted this in
      the main loop; what it measured until now was a hand-mirrored copy of `confirm-modal.ts`'s
      markup, kept in sync "by the same discipline," not by import. It now imports
      `buildConfirmSheetBody` (and `buildShellHeader`, wired through `attachSheetChromeToModal`'s
      `buildHeader` option exactly as `createSurfaceShell` wires it) so the mounted instance is the
      real primitive, not a mirror of it. **Title centring, newly assertable**: `confirm` was
      excluded from `TITLE_CENTERED_SURFACES` because its stand-in built the legacy two-slot
      `createSheetHeader` shape, not `buildShellHeader`'s three-slot one — the exclusion is removed
      and `__shellHeaderCentering` gained a `confirm` branch mirroring `__sheetGrammar`'s own.
      **Red-first proof, observed directly**: reverting the stand-in's `buildHeader` wiring (kept as
      a local, uncommitted diff, re-run, reverted) took the lane from exit 0 to exit 1 —
      `FAIL confirm — no .db-shell-header title to measure` — then back to exit 0 with the fix
      restored, confirmed twice. `node tools/live/sheet-grammar.mjs` → exit 0, 0 `FAIL` lines,
      confirm's 8 columns (7 canonical plus dropdown) and its title-centring row both green.
      `npx tsc --noEmit` → 0; `npx vitest run` → 0, 1442 passing across 137 files (confirm-modal's
      three existing mocking suites and `surface-shell.test.ts`'s `getDeclaredTitle`/`getShellRole`
      literal-source check on `modals/confirm-modal.ts` all unaffected, since neither method's
      signature moved).
      **Ticked at the landing, 2026-09-06.** The implementing leg wrote this row's evidence but left
      the box unticked; both controls were re-run here rather than taken on its report. Unwiring the
      stand-in's `buildHeader` → exit 1, `FAIL confirm — no .db-shell-header title to measure`.
      Dropping `db-panel-row` from `confirm-sheet.ts` itself → exit 1, `confirm: rows was false` —
      which is the stronger of the two, because it proves the lane reads the shipped primitive and
      not a copy of it. Both reverted, lane back to exit 0.
- [x] **T014 — [P] Register `053`'s sort-conflict confirm and `055`'s destructive-confirm as
      consumers, not as new surfaces.** **Threshold**: zero second confirm implementations across
      the three packets. **Red-first proof**: both sibling packets currently name a primitive that
      does not exist.
      **Left alone, 2026-09-06** — same reason as T013: nothing here can register a consumer of a
      primitive T013 has not exported yet, and `055`'s own in-flight migration is the leg actually
      touching the confirm sheet at this moment.
      **Fourth landing, 2026-09-06 — done, and mostly already true.** `053`'s sort-conflict confirm
      (`database-view.ts:3934`, `embedded-database-renderer.ts:2470`) and every destructive-confirm
      call site `055` touches (`database-view.ts:4428,4965,7545,9401,9948`,
      `embedded-database-renderer.ts:2471`, `column-operations.ts`, `row-menu.ts`,
      `cell-editor-option.ts`, `status-options-modal.ts`, `formula-modal.ts`, `settings.ts`) already
      call the exported `confirmWithModal` wrapper, not a hand-built dialog — `rg -c
      "confirmWithModal\(" src/ --type ts` finds every one of them, and none builds its own
      `.db-modal-actions` row. What T013 closes is the primitive underneath that wrapper; T014's own
      remaining threshold — a census of generic confirm bodies — reads **1** in `src/`:
      `confirm-sheet.ts:54` builds it and `confirm-modal.ts` is its only consumer.
      **Corrected on landing, 2026-09-06**: this row originally cited
      `rg -n "db-modal-actions" src/ --type ts` as resolving to that one declaration and that one
      consumer, and it does not — `grep -rn "db-modal-actions" src --include="*.ts"` returns seven
      producers (`main.ts:2986`, `invalid-time-events-modal.ts:184`,
      `csv-markdown-export-modal.ts:44`, `computed-frontmatter-cleanup-modal.ts:91`,
      `property-type-conflict-modal.ts:136`, `create-linked-view-modal.ts:100`, plus
      `confirm-sheet.ts:54`). The six others each build a button row for a modal carrying its own
      body — an import picker, a bulk quick-fix list, export options, a cleanup list, a conflict
      list, a name field — so none is a generic yes/no confirm and the threshold still holds; the
      class is a shared button-row shape, never the confirm's marker. The generic modal-child stand-in
      the stacked-pair registry's `openHostModalChild` builds (`tools/live/sheet-grammar.mjs`) is
      unrelated — it fakes "some modal child" for two different stacking scenarios (`Confirm` and
      `Import`) and was never a confirm implementation to begin with; it carries no actions row and
      is not counted here.
- [ ] **T015 — Add one permanent lane row per shell deliverable, each with a negative control.**
      **Threshold**: `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; each control observed red
      before its green. **Red-first proof**: the rows do not exist.
      **Partial, 2026-09-06** — two permanent rows landed as part of fixing the two defects they
      guard, each with its own negative control observed red before green: title centring across
      every header-bearing census surface (`tools/live/sheet-grammar.mjs`'s
      `TITLE_CENTERED_SURFACES` block, negative control neutralises the grid rule itself) and the
      C10 floating/flush frame geometry on `sort-panel`/`settings` (`FRAME_SHAPE_SURFACES`, negative
      control neutralises `.db-sheet-floating`'s own CSS). Both are permanent — they run on every
      `node tools/live/sheet-grammar.mjs` invocation, including inside `npm run gate`, not only when
      this leg happens to touch them. **Not closed**: "one row per shell deliverable" is the packet's
      full geometry and motion set (AC-006, AC-007), most of which (the primary action, the trailing
      chip, motion timing) still has no lane row at all — broader than the two rows this leg's own
      defects needed.
      **Fourth landing, 2026-09-06 — one more permanent row, plus the state of the rest named
      honestly.** Of the four candidates still open: **the confirm grammar** closes with T013 above
      — it is now a real, mounted-instance assertion rather than a hand-mirrored one, and it already
      ran on every invocation before this leg (the gap this leg closed was fidelity, not existence).
      **The 44px edge-control token** gets its own new row: `tools/live/sheet-grammar.mjs` §2e
      measures `.db-sheet-close`'s rendered size on `sort-panel` (44 × 44px), then a negative control
      overrides `--db-shell-edge-control-size` on `.db-surface` (the class the token is actually
      declared under, `styles.css:94` — a `:root` override was tried first and read 44×44 unchanged,
      because `.db-surface`'s own declaration on the panel element wins over anything merely
      inherited) to 60px, confirms the close control measures 60 × 60, then removes the override and
      confirms it returns to 44 × 44. Observed red-then-green directly: the mis-scoped `:root`
      version read `FAIL overriding the token moves the close control (44.0x44.0)`, exit 1; the
      `.db-surface`-scoped version reads `PASS … (60.0x60.0)` and `PASS … restores 44px (44.0x44.0)`,
      exit 0. **Declared-title coverage** is not a new row here — it already has a permanent,
      regression-sensitive check, just not in this lane: `surface-shell.test.ts`'s
      `it.each(DECLARING_SUBCLASS_FILES)` reads the shipped source of all seventeen declaring
      subclasses (thirteen `sheet` plus four `fullscreen`) on every `npx vitest run`/`npm test`, and
      goes red the moment any one of them stops overriding `getDeclaredTitle`/`getShellRole`. **The
      sub-page shape** stays unclosed for the reason `goal.md`'s own log already names: no producer
      calls `pushSubPage`/`popSubPage` in production yet (`view-config-panel-renderer.ts` is outside
      this leg's file group), so there is nothing to mount and measure. **Still not closed**: the
      primary action pill and the trailing header chip (AC-006) and the motion timing band (AC-007)
      carry no lane row yet — narrower than at the last landing (two gaps closed, one clarified as
      already covered, one left open with its reason), not fully closed.
- [x] **T016 — [P] Re-read the board and gantt parity captures against T003's baseline.**
      **Threshold**: `pixelHash`-identical, or an operator ruling on the difference (parent goal
      D5). **Red-first proof**: T003's recorded hashes.
      **Done 2026-09-06** — read from the working manifest after this leg's own full recapture (558
      entries) against the last commit's manifest: the 32 Project Manager board/gantt entries
      (`constructed-board`, `constructed-board-subtask`, `constructed-timeline`,
      `constructed-timeline-subtask`, `reference-kanban`, `reference-kanban-subtask`,
      `reference-gantt`, `reference-gantt-subtask`, each device/theme) are `pixelHash`-identical, 32
      of 32 — the C10 stylesheet work and the header-migration census correction both reach only
      phone bottom sheets, and none of these eight scenarios is one.
- [x] **T017 — Run `npm run replay` and confirm it holds with reversed 0.** **Threshold**: reversed
      0. **Red-first proof**: the reversal is the control.
      **Done 2026-09-06** — `npm run replay` → exit 0, `PASS — all 28 results still hold`, reversed 0.
- [ ] **T018 — [B] Operator device pass.** The operator opens a modal, a sheet, a sub-page and a
      destructive confirm on iOS and on desktop. **Threshold**: they read them as one surface
      family. **Owner**: the operator. **This row stays unticked until they say so** — an agent
      never ticks it.
- [x] **T020 — Retarget the packet to Anytype parity by default (ADR-007).** **Done 2026-09-05
      (~18:30)**, operator: *"Yes, parity by default."* Every `design-trueup.md` decision that had
      recorded a measured Anytype value and then declined it was re-read against the cited capture
      and flipped, unless the value fails WCAG 1.4.11, WCAG 1.4.3 or a 44px touch floor.
      **Threshold**: zero declines without a named ground (AC-012). **Red-first proof**: **18**
      undeclared declines counted at T001's state — 15 §5 decision cells and 3 §6 resolutions,
      enumerated in `checklist.md` C13. **Result**: 18 flipped, **3** exceptions named with their
      measurements (**E1** the 44px close at 2.21:1, **E2** the empty-value grey as text at 3.89:1
      replaced by Anytype's own 5.16:1 grey, **E3** red-plus-icon on destructive rows), **1** hold
      flagged for the operator (**E4**, the confirm — a data-loss ground the ruling does not
      authorise). **One correction toward the reference**: the "8pt inset on three sides" REQ-006
      stated of every phone sheet is a blanket over **two** measured frame shapes and would have
      failed on 13 of the 35 census surfaces (`design-trueup.md` §6 C10). **Capture**: every flipped
      value re-sampled per pixel off the cited file rather than quoted — the coordinate table is
      `design-trueup.md` §8a. The scrim pair (0.519 / 0.710) is **carried from T001, labelled as
      carried, and deliberately not re-derived**, because a re-derivation on differently chosen
      bands would manufacture a disagreement rather than confirm one. **Conflicts named, not taken**:
      rows 29, 33 and 35 retarget widths and a row shape `design-system.md` §5 owns, and row 21's
      bottom-anchored search is `053`'s — recorded at `../roadmap.md` §7.11.
- [x] **T019 — Reconcile completion metadata and validate.**
      `validate.sh <this folder> --strict` first `RESULT:` PASSED; `checklist.md` every item marked
      with evidence; `goal.md`'s log updated; graph metadata regenerated after the last doc edit.
      **Fourth landing, 2026-09-06.** `acceptance-criteria.md` AC-005 moved to `Met` with its green
      evidence appended beside the original red baseline; `checklist.md` C5 ticked with the same
      evidence, C10 gained a fourth-landing paragraph for the new edge-control-token row;
      `tasks.md` T013/T014 ticked, T015 left unticked with an honest account of what it closed
      (confirm grammar, edge-control token, declared-title already covered elsewhere) against what
      it still does not (the primary-action pill, the trailing chip, motion timing); `goal.md`'s
      §3 confirm-primitive bullet ticked with its green result, its §4 Progress table's four stale
      "Pending" rows corrected against the current task numbering, and its frontmatter
      (`recent_action`, `next_safe_action`, `completion_pct`) brought current;
      `implementation-summary.md`'s metadata table, frontmatter and Known Limitations updated, plus
      a "Fourth landing" section appended matching the Third landing's own format. Graph metadata
      regenerated twice (`backfill-graph-metadata.ts`, scoped to this folder) — once after the
      first doc pass, once more after a `SPECDOC_FRONTMATTER_004` finding
      (`implementation-summary.md`'s `next_safe_action` read as narrative, not compact; corrected
      to an imperative phrase). `node "$(realpath .opencode)/skills/system-spec-kit/runtime/dist/lib/validation/orchestrator.js" <this folder> --strict` → first `RESULT:` **PASSED**, `Errors: 0 Warnings: 0`, re-run after the fix. Isolated `npm run gate </dev/null > ".gate-<pid>.log" 2>&1; echo $?` → **0**, 26 green (two lanes needed a run after this leg's own edits, not a regression: `operator-list` regenerated after `goal.md`'s confirm row ticked, `story-coverage` closed by writing `confirm-sheet.stories.ts` rather than an allowlist entry, since the module is genuinely renderable). `npx tsc --noEmit` → 0; `npx vitest run` → 0, 1442 passing across 137 files; `npm run build` → 0. `styles.css` untouched this session, so no capture recapture is owed.
- [x] **T021 — Build the side-sheet shape (ADR-008).** **Done 2026-09-06.** Shipped as a marker
      class and two named constants (`SHELL_SIDE_SHEET_CLASS`, `SHELL_SIDE_SHEET_WIDTH_PX` in
      `surface-shell.ts`) plus one `styles.css` block, **not** as a `createSurfaceShell`
      presentation — ADR-008's planned-versus-shipped table records why, and the same table records
      that the shape overlays the pane's right 420px rather than reflowing the table into a
      narrower column. **Measured on the shipped renderer** (`view-config` scenario mounted through
      the render-assertion bundle in headless Chrome, `styles.css` + `theme.css` +
      `runtime-vars.css` attached, 1200x900): red, with the marker class removed on the same mount,
      `width 360px / max-height 560px`, the panel itself the scroller at `overflow: auto` with
      1776px of content inside a 576px client box, description textarea `min-height 58px` in a
      236px column; green, `position: absolute`, `inset 0 0 0 auto`, `width 420px`, height 844px =
      the container's own, `border-left 1px`, `border-radius 0`, `overflow: hidden` on the panel
      with `.db-view-config-body` at `overflow-y: auto` scrolling 1672px inside 776px so the header
      stays put, textarea `min-height 84px` in a 279px column, and no inline `top`/`left` written
      at all. **Threshold, honestly**: the database's own scroll is unchanged and it stays visible
      to the left, but its *interactivity* is not — a pointer-down on it dismisses the sheet through
      the same `overlayStack` outside-pointerdown contract every toolbar panel already carries. That
      half is recorded as still open on AC-013 rather than counted here
- [x] **T022 — Wire the desktop database Settings surface onto the side-sheet shape.** **Done
      2026-09-06.** `view-config-panel-renderer.ts` gains `presentPanel`, which every one of the
      four render exits now calls: the phone branch still hands the panel to
      `positionToolbarPopover` unchanged, and the desktop branch stamps the marker class, plays the
      enter transition on a first open only (a rebuild carries `is-visible` forward, so a settings
      toggle does not replay the slide), and installs `trapFocus`. Measured on the same mount: Tab
      from the last focusable lands on the header's own Close and Shift+Tab from the first lands
      back on the last, both still inside the panel; a picker opened from a row inside the sheet
      mounts as a `.note-database-container` **sibling** (never a descendant, so the panel's
      `overflow: hidden` cannot clip it) at `z-index` 100 against the panel's 50, and Escape closes
      the picker first with the sheet still connected, then the sheet
- [ ] **T023 — Register the new role in `design-system.md` §3/§4** and add its grammar row to the
      lane that checks role widths and dismissal, with a negative control (the database becomes
      non-interactive while the side sheet is open) observed red before green. **Not taken at the
      2026-09-06 landing, deliberately**: ADR-008 shipped one marker class for one surface rather
      than a fifth role, so a role row would describe a taxonomy entry with a single member, and
      the negative control as written asserts the interactivity clause T021 records as still open.
      Revisit when a second surface takes this shape — the row stays open rather than being ticked
      or waived, because nothing about it was proven
- [ ] **T024 (2026-09-06 amendment) — Land the stacked-sheet fix leg on this packet's files.**
      `048` T024 owns the four defects the operator's 10:04 iOS report names; the edits land in
      `surface-shell.ts` and `mobile-bottom-sheet.ts`, which are this packet's, so the leg is
      sequenced **after** T021-T023 rather than beside them. Red first: pre-fix the depth-2 stack
      draws 2 close controls and 2 background values on one sheet
- [ ] **T025 (2026-09-06 amendment) — Run the sheet family's deep-research loop**, to the executor
      spec in `goal.md` §4's amendment: `/deep:research:auto`, 10 iterations,
      `--stop-policy=max-iterations`, `cli-pi` on GLM 5.3 flash max (OpenRouter, DevPass fallback),
      bounded prompts with an explicit file list and no image reads, a fresh worktree, then an Opus
      synthesis that updates or adds phases. **Starts only once `044`, `048` and `051` are done and
      verified** — an operator-set precondition, not a scheduling preference
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:completion -->
## Completion

The packet closes when every row in `acceptance-criteria.md` is `Met`, `Waived` with an ADR, or
`Superseded` with an ADR — except AC-010, which is the operator's and which nothing in this
repository can close (parent D3).
<!-- /ANCHOR:completion -->

---

**Addendum, 2026-09-06 (third landing) — the header census is closed.** With the calendar leg's
own migration landed, `rg 'cls: "db-panel-header"'` over `src` returns exactly one hit, the sheet
engine's own builder inside `mobile-bottom-sheet.ts` — the expected survivor, since that is what
`buildShellHeader` calls. `surface-shell.test.ts`'s consumer list carries both calendar toolbars
rather than naming them as a gap. One site is deliberately not the shell's: `column-manager-
renderer.ts`'s **desktop** branch keeps the componentized desktop header a sibling packet landed,
which is the better fit for that shape and leaves the desktop capture pixel-identical. The seven
desktop captures that do move are the popovers whose hand-built headers had no close control and
now draw the shared one; that is a real desktop change, recorded rather than described as zero.

---

<!-- ANCHOR:cross-refs -->
## Cross-references

- **Requirements**: `spec.md` §4
- **Thresholds**: `acceptance-criteria.md`
- **Reds**: `checklist.md`
- **Rulings**: `decision-record.md`
- **Design read of record**: `../050-anytype-adoption/design-trueup.md`
- **Sheet grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
<!-- /ANCHOR:cross-refs -->
