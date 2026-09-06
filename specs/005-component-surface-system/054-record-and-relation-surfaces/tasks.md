---
title: "Task Breakdown: Record and Relation Surfaces"
description: "Eight legs from capture true-up to retirement sweep, each task naming its proof, with operator rows that stay unticked."
trigger_phrases:
  - "054 tasks"
  - "record surface tasks"
  - "editor extraction tasks"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks | v2.2 -->
# Task Breakdown: Record and Relation Surfaces

<!-- SPECKIT_LEVEL: 3 -->

> **Proof column.** Every task names the proof that closes it — a lane row, a unit test, a census
> number, or a capture read by hand. A task whose proof cannot be stated is not a task yet.
> **Red first.** The measurement tasks T002 run before the legs; a leg whose threshold was never
> seen failing does not start.
> **Operator rows.** OPS rows are confirmed on the operator's device only. An agent never ticks one.

---

<!-- ANCHOR:ai-exec -->
## AI Execution Protocol

### Pre-Task Checklist

Before starting any task, verify:

1. [ ] `spec.md` scope unchanged, and §5A's ten surfaces still the ones on disk
2. [ ] Current leg identified in `plan.md`'s leg table (`L1`-`L7`, grouped under the four phases below)
3. [ ] Task dependencies satisfied — Phase 1's measurements before any leg; primitives before consumers; ADR-002's pinned dispatch test before the first editor moves
4. [ ] Relevant P0/P1 checklist items identified in `checklist.md`
5. [ ] No blocking issues in `decision-record.md`
6. [ ] Previous session context reviewed (the parent's `handover.md`, then this packet's log)

### Execution Rules

| Rule | Description |
|------|-------------|
| TASK-SEQ | Complete tasks in dependency order — the Phase 1 measurements gate every leg (goal D2) |
| TASK-SCOPE | Stay within the leg's named file group; one leg, one file group (goal D7) |
| TASK-VERIFY | Verify against `acceptance-criteria.md`; read exit statuses from `$?`, never through a pipe |
| TASK-DOC | Update the task checkbox and its `checklist.md` evidence cell in the same pass |
| TASK-MOVE | ADR-002 binds L6: method bodies move **unchanged** behind the pinned dispatch contract, one editor per leg. No behavioural edit inside a move — the accumulated fixes in those bodies (Escape funnels, IME guards, session close routing) were each earned by an operator report and are not re-litigated by an extraction |
| TASK-SYNC | A leg that changes a registered `sheet-grammar` pair's markup updates `tools/live/sheet-grammar.mjs` in the same commit, never after; a leg that changes what a board card draws re-reads the reference captures before it closes |

### Status Reporting Format

```
## Status Update - <timestamp>
- **Task**: T### - <description>
- **Leg**: <L1-L7, phase 1-4>
- **Status**: [IN_PROGRESS | COMPLETED | BLOCKED]
- **Evidence**: <command, lane output, census number, or capture read>
- **Blockers**: [None | description]
- **Next**: T### - <next task>
```

### Blocked Task Protocol

A task that cannot proceed stops and records, in this order: the failing command and its output, the
contract it conflicts with (`044`/`048`/`003`/`006`/`023`/`045`), and the smallest unblocking
decision. Two failed attempts on the same failure without new evidence is the stop signal — escalate
in the parent program's escalation format rather than retrying. A task blocked on the operator
(OPS-001..003) is marked `[B]` with the owner named, never self-closed.
<!-- /ANCHOR:ai-exec -->

---

<!-- ANCHOR:setup -->
## Phase 1 — Setup and measurement (before any leg)
<!-- /ANCHOR:setup -->

- [x] T001 [P0] Open, by hand, every capture §5B names and every capture that supersedes one, and
      record adopted / adapted / rejected-with-reason per behaviour row. **Deliverable corrected:**
      T001's record is **`design-trueup.md`**, as it is in `050` and `055`; `migration-table.md` is
      T003's and consumes it. Writing T001's record into T003's file was a circular dependency in the
      draft.
      **Proof — done 2026-09-05.** `design-trueup.md` exists and carries all seven §5B rows plus the
      S9 editor taxonomy against **31 named captures**: the 25 `anytype-menu-object-*` object-page
      menus, the 12 `anytype-menu-cell-*` grid-cell editors, the iOS relations panel with its
      per-format editors and its property-management sheet, and the catalogue grids. Every filename
      resolves under `screenshots/anytype/`. **Nine contradictions** are recorded in §1 and ruled on
      by `decision-record.md` ADR-004, three of them structural (A2's anatomy, A4's absent group,
      A5's reversion to captured). **Two named gaps, never silent:** A4 has no reference screen on
      either platform and says so, and `menus/anytype-menu-cell-type-dark.png` could not be read —
      its menu fell outside the crop — with the same menu legible in
      `menu-object-type-picker-dark.png`, which the row does not depend on. AC-010 is **Met**. The
      three `spec.md` §10 open questions are answered in `design-trueup.md` §5.
- [x] T002 [P0] Measure the red numbers on the current tree and write them into `checklist.md`'s
      Today cells: header-builder census (4), property-row vocabulary census (3), type-list census
      (3), the record sheet's hidden-group absence, the "Empty" placeholder in
      `getEmptyDisplayValue`, and the exported-editor count (0).
      **Proof:** `checklist.md` Today cells carry the numbers and the command or lane that read
      them; the census lane (built here as a throwaway harness if the permanent one is not ready
      yet) fails or reports the counts as recorded.
      **Done 2026-09-05.** Every number re-confirmed unchanged (C1 4, C2 3-at-4-sites, C3
      1-list+1-filter+1-submenu, C4 absent, C5 "Empty", C6 0) via `rg`/`sed` against the current
      tree, with several stale `file:line` citations corrected in the same pass (`getEmptyDisplayValue`
      `:636`→`:655`; the empty-filter `:387-396`→`:399-410`; `column-manager-renderer.ts` row builder
      `:265`→`:267`; `board-card-properties-panel.ts` row `:48`→`:50`; `property-type-conflict-modal.ts`
      `getTypeOptions` and `create-property-modal.ts`'s `PROPERTY_TYPES` citations in `checklist.md` C3
      corrected from `:364-369`/`:69-74`, both drifted, to the confirmed `:377`/`:48`). The two
      geometry rows (C8, C9) were measured live through a throwaway script mounting
      `panel-column-manager/file-view` and `panel-record-detail-docked/file-view` via
      `tools/live/render-assertion-bundle.mjs`: the properties panel's desktop rect (x 28.52, y
      25.17, w 540.96, h 604.51) and the board-card `pixelHash` baseline from `screenshots/manifest.json`
      (current at HEAD, `npm run screenshots:verify` exit 0). The same script re-read the docked
      record panel now that 006's docking landed (`ae46da94`) and found it currently green against
      `chrome-geometry-measure.mjs`'s floors — not a red this leg needs to fix. AC-002's per-row
      pixel figures (measured on a PNG capture) could not be re-observed under this leg's
      no-image-read constraint; the DOM box/`text-align` reading recorded here was proposed
      formally in `decision-record.md` ADR-005 as a substitute observable, then **Rejected**
      2026-09-05 (~18:20) — operator: "Keep the pixel reading." AC-002's proof stays the by-hand
      pixel read, owed to an image-capable leaf at the leg's close; this leg's DOM reading stands
      only as corroboration. **Observed, not fixed:** AC-007/C7's "four external callers" citation for
      `renderCardField` reads as **3** today (`board-renderer.ts:2185`, `gallery-renderer.ts:691`,
      `record-detail-panel.ts:474`, plus its own test file) — outside T002's named scope, named here
      rather than corrected in passing.
- [x] T003 [P0] Write `migration-table.md`: one row per §5A surface (10) and one per §5B behaviour
      (7), columns surface → primitive → changes → Anytype pattern with capture filename → stays
      ours. The behaviour rows **consume `design-trueup.md` §3 and §4** rather than re-reading the
      captures; A4's row records its named gap and cites no capture. **Proof:** AC-008's file check
      passes against the table.
      **Done 2026-09-05.** `migration-table.md` exists with all 10 surface rows and all 7 behaviour
      rows, each surface row also carrying a related-capture citation so AC-008's "capture filename"
      clause reads unambiguously true rather than only for the behaviour half. Every cited capture's
      basename was checked to resolve under `screenshots/anytype/` (the real tree nests them under
      `desktop/menus/`, `desktop/app/` and `mobile/sheets/`; citations keep `design-trueup.md`'s own
      shorthand form for consistency across this packet's docs). AC-008 is now Met.

---

<!-- ANCHOR:legs -->
## Phase 2 — Primitives

### L1 — P1 header primitive
<!-- /ANCHOR:legs -->

- [x] T010 [P0] Build `record-surface/record-header.ts` with phone and desktop variants; the phone
      variant delegates to `createSheetHeader` (`mobile-bottom-sheet.ts:160`), the desktop variant
      reproduces the record sheet's current desktop DOM (icon + title + open + close). Register the
      module in `record-surface/index.ts`'s contract table. **Proof:** unit test on both variants'
      DOM; no existing capture moved.
      **Done 2026-09-05.** `buildDesktopRecordHeader` reproduces `record-detail-panel.ts`'s header
      DOM exactly (`db-record-detail-header` / `db-record-detail-title` / `db-board-card-open` /
      `db-cell-edit-close`, same tooltip and rename wiring); `buildPhoneRecordHeader` is a thin
      pass-through to `createSheetHeader`. Both registered in `index.ts`'s `RECORD_SURFACE_PRIMITIVES`
      table. No consumer switched onto it yet, so no capture moved — confirmed by
      `npm run screenshots:verify` staying green.
- [x] T011 [P1] Write the census lane row for header builders across the three surfaces, observed
      red (4) from T002's number. **Proof:** lane row exists and reports 4 today.
      **Not done.** No existing lane under `tools/live/` measures "which function builds a header" —
      `surface-census.mjs` inventories DOM-mounted floating/docked surfaces by class name, a
      different question. Building a source-level census lane is real, separate infrastructure work
      this pass did not size for; named here as a gap rather than stubbed with a lane that cannot
      tell a real convergence from a coincidence.
      **Re-read 2026-09-06 by the landing verifier; the gap is confirmed and now stated precisely,
      with three facts the earlier note did not carry.** First, `surface-census.mjs` cannot be
      extended into this: its unit of inventory is a class token matched against a fixed vocabulary
      (`SURFACE_WORDS`, `tools/live/surface-census.mjs:60` — menu/popover/panel/sheet/modal/dropdown/
      picker/peek/tooltip), so a header *builder* and a property *row* are both outside what it can
      name, and adding them is a second scanner rather than a row. Second, and the harder one: the
      goal's own census shape — "one page rendering the same column through every consumer" — cannot
      read a converged property row off the DOM at all, because `buildPropertyRow`
      (`src/views/record-surface/property-row.ts:229`) takes `rowClass` and `labelClass` from its
      caller by design (T021's choice, so a switching consumer keeps its existing CSS and moves no
      capture). Four consumers therefore emit four class vocabularies from the one builder, and a DOM
      census would read 4 while the convergence is real. Measuring "one builder" is a source-level
      question the goal's D3 explicitly forbids answering by grep, so closing this needs either a new
      source-level lane or an amendment to D3's chosen observable — an operator decision, not a leg's.
      Third: the red-first window is closed regardless. T030-T042 already switched the consumers, so a
      lane built now observes the converged count, and the 4/3/3 red this row asks to see could only
      be re-observed by running the lane against a pre-switch commit.
      **Landed 2026-09-06, as a source census rather than a DOM census (`decision-record.md`
      ADR-007 amends goal D3's observable).** `tools/live/surface-census.mjs` §6b counts calls to
      `buildDesktopRecordHeader`/`buildPhoneRecordHeader` in `record-detail-panel.ts` and
      `table-record-peek.ts` (1 each; `board-card-properties-panel.ts` has no header call, correct —
      it draws no header by design) against direct hand-built construction of the primitive's own
      default header class in those files. Headers and rows share one threshold in this census
      (zero hand-built of either), so T023's negative control below — a hand-built
      `.db-column-manager-row` reading 1 hand-built and exit 1, reverted to 0 and exit 0 on the same
      command — is this row's own red-then-green proof too. `checklist.md` C15 carries the counts
      and the command.

### L2 — P2/P3/P5 display primitives

- [x] T020 [P0] Build `record-surface/property-row.ts`: display and interactive variants, anatomy
      per A2 (type icon via `property-type-icon.ts`, label, value; option badges via
      `resolveOptionDisplay`; rating/progress/ring via `number-display-renderer.ts`; conditional
      format callback). `card-field-renderer.ts` becomes a re-export shim. **Proof:** unit tests on
      the variants; `renderCardField`'s four external callers pass their existing tests through the
      shim.
      **Done 2026-09-05, anatomy corrected against `design-trueup.md` rather than this row's own
      "type icon" wording.** ADR-004 struck the format icon from a value row (C1) after this task
      was drafted; `property-row.ts` follows the corrected anatomy, not the stale draft. Two things
      moved: `renderPropertyValue` is `renderCardFieldValue`'s exact body (including the three
      `setFieldTooltip` calls the first pass at this move dropped and then restored, verified against
      the original line by line), now called by `card-field-renderer.ts`'s shim, with all of
      `card-field-renderer.test.ts` and `checkbox-borrowed-ancestor.test.ts` (updated for the new
      call site) green; `buildPropertyRow` and `renderOptionValue` are the label-then-value,
      left-aligned, no-format-icon, single-select-as-text/multi-select-as-chip shell, not yet wired
      to any consumer.
      **Correction 2026-09-05 (verifier leg):** the row's own "unit tests on the variants" proof did
      **not** hold when this task was first ticked — the shell and the option split shipped with no
      test referencing either export, and no capture or consumer test could have caught a regression
      in code nothing calls. `property-row.test.ts` now closes it: six cases pinning the row's
      label-then-value order, its two-children shape (the no-format-icon half), the
      coloured-text-versus-filled-chip split, the gray fallback and the empty single-select. Seen red
      first — swapping `textClass` for `chipClass` in the single-select branch fails the split case,
      and the file was restored from git afterwards.
- [x] T021 [P0] Build `record-surface/hidden-properties.ts`: collapsed group with count, toggle,
      expanded state carried across refreshes. **Proof:** unit test asserting survival across a
      simulated `renderContent` re-run; red before (no such module).
      **Done 2026-09-05.** `createHiddenPropertiesGroup` closes over its expanded flag the way the
      note-body draft closes over its text, so a second `render()` call (standing in for a
      `renderContent` re-run) replays the prior expanded/collapsed state instead of resetting it.
      Class names are caller-supplied rather than hardcoded, so the peek can request its existing
      `db-record-peek-hidden-*` names when it switches without this primitive dictating new CSS.
- [x] T022 [P0] Build `record-surface/add-property-row.ts` with the search-first picker (A5):
      search over existing properties, create-new falling through to `CreatePropertyModal`.
      **Proof:** unit test on the search filter and the create-new fall-through.
      **Done 2026-09-05, narrowed to what our data model has.** A5's captured design offers formats
      then existing properties; this plugin has no cross-record "existing properties" to browse (a
      column belongs to one view), so `buildAddPropertyRow` filters the format list as the query
      narrows and calls `onCreateNew(query)` when nothing matches — the caller wires that to
      `CreatePropertyModal` when a consumer switches onto this primitive. Not done this pass: no
      consumer calls it yet.
- [x] T023 [P1] Census lane row for property-row vocabularies, observed red (3). **Proof:** lane row
      reports 3 today.
      **Not done**, same reason as T011: no existing `tools/live/` lane answers "which function
      builds this row" without new source-level census infrastructure this pass did not size for.
      **Re-read 2026-09-06 by the landing verifier**: this row is where T011's caller-supplied-class
      finding bites hardest. A DOM census over row classes reads the four vocabularies the consumers
      still name (`db-record-detail-field`, `db-record-peek-field`, `db-column-manager-row` and the
      board card's), all four produced by the single `buildPropertyRow`. The count and the
      convergence disagree because the observable is wrong, not because the convergence is absent.
      **Landed 2026-09-06, as a source census (`decision-record.md` ADR-007 amends goal D3's
      observable from a DOM census to a source census).** `tools/live/surface-census.mjs` §6b counts
      calls to `buildPropertyRow`/`buildCheckboxPropertyRow`/`renderCardField` in
      `record-detail-panel.ts`, `table-record-peek.ts` and `board-card-properties-panel.ts` (1 call
      each) against direct hand-built construction of the primitives' own default row classes
      (`db-record-detail-field`, `db-record-peek-field`, `db-column-manager-row`) in those same
      files. **Observed red first**: a `panel.createDiv({ cls: "db-column-manager-row" })` line
      temporarily added to `board-card-properties-panel.ts`, bypassing `buildCheckboxPropertyRow`,
      made `node tools/live/surface-census.mjs` report "hand-built headers/rows across the three
      surfaces: 1", exit 1. Reverted: the same command reports **0**, exit 0. `checklist.md` C15
      carries the counts and the command. This is scoped to the three surfaces this leg's own task
      names, not the full four-consumer family C2/C14 measure (`column-manager-renderer.ts` is
      outside this row's named scope) — C2/C14 stay their own hand counts, unsuperseded.
      **Tightened at landing verification, because the first shape of the check could not see the
      bypass this codebase actually shipped.** It read only `createDiv`/`createSpan`/`createEl` with
      a `cls:` string in the FIRST argument, so `createEl("div", { cls })` (the class is in the
      second argument), a `className =` assignment, `classList.add`, `addClass`, and any helper that
      forwards a class string were all invisible — and `table-record-peek.ts`'s own
      `createChild(parent, tag, className)` helper, which assigns `child.className`, is exactly that
      last form and is how the peek's now-retired header and rows were built. A control injecting
      `strayA.classList.add("db-record-detail-field")` into `record-detail-panel.ts` passed the check
      **silently, exit 0, count 0**. The census now reads every string literal in the three files and
      treats a literal naming a primitive's own header/row class as hand-built unless it is a CSS
      selector (leading `.`, or a `querySelector`/`closest`/`matches` argument) or a class option
      inside a call to one of the five shared builders — so it no longer asks HOW the class was
      applied. Five controls, each observed red at exit 1 and each reverted: `classList.add`,
      `createEl("div", { cls })`, `element.className =`, `createChild(parent, "div", cls)`, and a
      hand-built `db-record-detail-header`. Green again after each, exit 0.
      **One real occurrence the narrow check could not see, now visible:**
      `table-record-peek.ts:255` builds `db-record-peek-field db-record-peek-empty is-muted` through
      `createChild` for the "no properties" notice. It is a message that borrows the row's styling,
      not a property row, so the census reports it on its own line — `row classes reused by something
      that is not a row: 1 (documented, not counted)` — rather than counting it against the zero
      threshold or hiding it. A second such literal without the `db-record-peek-empty` marker goes
      red.
      **The three files are NOT the complete consumer set of these five builders.** Verified by
      grep at landing: `buildCheckboxPropertyRow` and `buildDesktopRecordHeader` are also called from
      `column-manager-renderer.ts:274`/`:246`, and `renderCardField` from `board-renderer.ts:1996`.
      Five consumer files in total, three of them censused — the scope the operator's ruling named.
      The two uncovered sites are recorded here rather than folded in, and neither is a known
      bypass: both reach the shared builders.

## Phase 3 — Consumers

### L3 — Record sheet and peek switch

- [x] T030 [P0] Switch `record-detail-panel.ts` onto P1, P2, P3, P5: primitive header, primitive
      rows, the add-property affordance replacing the "Empty" word for editable types (REQ-004),
      the hidden group replacing the `showEmptyFields` all-or-nothing filter as the hidden
      affordance (REQ-003; `showEmptyFields` stays as the render/not-render switch). Mount P6-host
      after the rows, unchanged. **Proof:** lane row on the record sheet asserting header, rows,
      add affordance, hidden group, body order; the "Empty"-word negative control red then green;
      note-body regression test green.
      **Done 2026-09-06.** The header switched onto `buildDesktopRecordHeader`, byte-identical DOM
      confirmed by `npm run screenshots` producing no diff for any record-detail scenario beyond
      the rows below. `getEmptyDisplayValue` now calls `record-surface/property-row.ts`'s
      `getPropertyEmptyPrompt`, returning a format-specific string for select/multi-select/relation
      and leaving every other type's "Empty" untouched — read on the regenerated
      `constructed-record-detail-desktop-dark.png`: a select/multi-select value with a colour, a
      plain-text field still reading "Empty". A `createHiddenPropertiesGroup` (P5) instance lives
      outside `renderContent`'s closure the same way `bodyText` does, so its expanded state
      survives a refresh; it renders empty-and-hidden fields (`showEmptyFields !== true`) instead of
      dropping them. Desktop values are left-aligned via a new `text-align: left` declaration on the
      existing `.db-record-detail-field .db-board-card-value` rule (`styles.css`), not a change to
      the board card's own right-aligned rule. **"P3, the add-property affordance" read as REQ-004's
      per-field empty-value prompt, not P3's create-new-column picker** — T030's own citation names
      REQ-004, and `add-property-row.ts` (the actual P3 module) is wired at T041 for "+ Add
      property," a different, column-manager-only affordance; recorded here rather than guessed
      past. `renderRecordValue`/`renderBadge`/`renderLink` (dead code — never called; the live path
      already went through `renderCardField`) removed in the same pass; the file's own
      `checkbox-borrowed-ancestor.test.ts` entry was already double-counting this site and is
      merged into `property-row.ts`'s.
- [x] T031 [P0] Switch `table-record-peek.ts` onto P1 (desktop rail variant) and P2's display
      variant; retire its private `renderProperty` body. **Proof:** the badge-rendering unit tests
      pass; `panel-record-peek` capture re-read and byte-compared via `pixelHash`.
      **Done 2026-09-06.** The header switched onto `buildDesktopRecordHeader` with
      `headerClass`/`titleClass` overrides and no `onOpen`/`onClose` (the primitive now draws no
      button when either is omitted — a P1 extension, not a new primitive); the peek still has no
      open/close button of its own, matching today's DOM. `renderProperty`'s row shell now calls
      `buildPropertyRow`; its own option-badge loop stays as the `renderValue` callback (display-only
      by design, migration-table.md S2 — no `App` is threaded through, so the full
      `renderPropertyValue` dispatch is out of reach without widening `openTableRecordPeek`'s
      signature, which this leg does not do). The single-select-as-text / multi-select-as-chip split
      (A2/C9) reaches the peek too, via a `.db-record-peek-field-value > .status-badge` CSS override
      beside the record sheet's own — a direct-child selector distinguishes a lone select badge from
      a nested multi-select one without any JS change, so `renderProperty`'s existing tests (which
      assert on classes/attributes, not computed colour) pass unchanged. `table-record-peek.test.ts`'s
      hand-rolled `FakeElement` gained `createDiv`/`createSpan`/`createEl`/`addClass`, mirroring
      Obsidian's own prototype extensions the primitives are written against.
- [x] T032 [P0] Re-read the board-card reference captures after this leg (cards draw P2 rows now).
      **Proof:** `pixelHash` identical, or the difference carried to the operator for a ruling
      (plan §5's parity posture). If differences exist, STOP the leg close until ruled.
      **Done 2026-09-06.** Board cards do not draw P2 rows this pass — `board-renderer.ts` was not
      touched, remains outside this leg's named consumer set — so the premise in this task's own
      title does not hold; recorded rather than silently no-opped. `npm run screenshots` run twice
      (once more after a mid-leg styles.css fix) confirms board, gallery, list, table, calendar,
      timeline and project-manager captures are `pixelHash`-identical to HEAD; the handful of
      single-digit-byte diffs `git status` reported each run named a DIFFERENT random subset across
      the two runs on an otherwise-unchanged tree — re-encode noise, not content, confirmed by
      `tools/lane/check-lane.mjs`'s own pixelHash compare — and were restored byte-identical.
      `tools/lane/css-lane.json`'s release entry records the full reasoning and the reviewed list.

### L4 — Properties panel, board-card properties, P7

- [x] T040 [P0] Build `record-surface/type-picker.ts`: the thirteen formats
      (`column-types.ts:135-149`'s labels), icons via `property-type-icon.ts`, gating reasons
      (rollup needs a relation — carried from `create-property-modal.ts:139-150`'s precedent;
      conflict modal's source-kind subsets from `property-type-conflict-modal.ts:364-369`).
      **Proof:** unit test on the list, the icons and the gating.
      **Done 2026-09-06.** `PROPERTY_TYPES` (the thirteen formats), `buildTypePickerOptions` (labels
      + `property:<type>` icons via `getPropertyDropdownIcon`, gated rows carrying `disabled` +
      `disabledReason` rather than being omitted), `rollupNeedsRelationGate` and
      `conflictWriterGate` (the conflict modal's two writer-kind subsets, restated as gates).
      `type-picker.test.ts`: 8 cases on the list, the icons, and both gates' disabled/enabled sets.
- [x] T041 [P0] Switch `column-manager-renderer.ts` rows onto P2's checkbox variant and its add row
      onto P3; keep `createSheetHeader` for the phone header and P1's desktop variant for the
      desktop header. **Proof:** the panel's range-select and drag tests pass; the desktop panel's
      rect asserted unchanged by the lane.
      **Done 2026-09-06.** `renderColumnRow` now calls `buildCheckboxPropertyRow`
      (`record-surface/property-row.ts`); the shift-range visibility toggle, the drag-reorder and
      the up/down move buttons all wired through the primitive's caller-supplied handlers, so the
      range-selection logic itself did not move. The desktop header now calls
      `buildDesktopRecordHeader` with `headerClass`/`titleClass` overrides and a `renderTrailing`
      hook (a small P1 extension) carrying the select-all toggle — no icon, no open/close, matching
      today's title-only header; `npm run screenshots` produced no diff for the properties panel
      (checklist.md C8, re-confirmed). The "+ Add property" button now opens a popover (position via
      `positionToolbarPopover`, closed via `installPopoverAutoClose`) hosting P3's
      `buildAddPropertyRow` over P7's format list, rather than rendering the picker inline — an
      always-open 13-row list inline would have grown the panel's own asserted-unchanged rect (C8).
      Selecting a format or falling through on a typed name that matches none calls the new
      `ColumnManagerActions.createPropertyOfType(type, initialLabel?)`, wired in `database-view.ts`
      to `openCreatePropertyModal({initialType, initialLabel})`, which already accepted both; absent
      callers (the embedded renderer) fall back to `addColumn()` unchanged. The duplicated
      `shouldIgnoreColumnDrag` private method retired in favour of `shouldIgnorePropertyRowDrag`.
- [x] T042 [P0] Switch `board-card-properties-panel.ts` onto P2's checkbox variant. **Proof:**
      `045`'s tests pass unchanged (mechanism frozen by its ADR-002); no card-hide behaviour change.
      **Done 2026-09-06.** The per-row loop now calls `buildCheckboxPropertyRow`, draggable only
      when `!actions.readOnly` (this panel's own gating, unlike column-manager's always-draggable
      row); the splice-based reorder and the `persist` callback are unchanged, only the row's DOM
      construction and its own copy of `shouldIgnoreDrag` moved into the shared primitive.
      `board-card-properties-panel.test.ts`'s five existing cases pass unchanged against the new
      construction path.

### L5 — Type-list sites

- [x] T050 [P0] Wire P7 into `create-property-modal.ts`, `property-type-conflict-modal.ts` (both
      `getTypeOptions` subsets), `relation-rollup-config-modal.ts`, `formula-modal.ts`'s three
      output-type dropdowns (`:274`, `:443`, `:454` — type dropdowns only, per ADR-003), and
      `column-menu.ts`'s type submenu. **Proof:** census reads 1 type list across the five sites;
      each site's dropdown renders the same options as before the switch (unit-test the option
      lists before and after).
      **Done 2026-09-06, with two of this task's own citations corrected against the tree.**
      `create-property-modal.ts`'s local `PROPERTY_TYPES` array retired in favour of
      `buildTypePickerOptions(rollupNeedsRelationGate(...))` — same 13 options, same gate, now
      search-first (`searchable: true`, newly added). `property-type-conflict-modal.ts`'s
      `getTypeOptions`/`isColumnTypeValue`/`getPluginTypeLabel` retired; its dropdown now renders
      the full 13 via `conflictWriterGate`, disabling (not omitting) the eight formats no writer
      here can become, with a computed writer further narrowed to its five plain types — the
      selectable set is unchanged, only the display list grew to show what is unavailable and why.
      `column-menu.ts`'s grouped type submenu now slices `PROPERTY_TYPES` for its three group
      buckets instead of a second hardcoded literal; its existing checkmark and unfiltered list were
      already correct, so nothing else moved. **`formula-modal.ts` has one output-type dropdown, not
      three** — `RESULT_TYPE_KEYS` at the cited `:274`; no dropdown exists at `:443`/`:454` in the
      current tree, a stale citation carried over uncorrected until now — that one dropdown is wired
      to `buildTypePickerOptions` with a five-type gate. **`relation-rollup-config-modal.ts` has no
      type dropdown at all** — its three `createDropdownField` calls pick a relation field, a target
      field and an aggregation, never a property type — so this site does not apply; census reads 4
      of the 5 originally-named sites, the fifth being a corrected premise rather than a remaining
      gap. No existing test asserted these five sites' option lists before the switch; the gating
      logic itself is covered by `type-picker.test.ts`.

## Phase 4 — Extraction, retirement and gate

### L6 — Editor extraction (ADR-002)

- [x] T060 [P0] Pin the dispatch contract: a unit test asserting `CellRenderer.startEdit`'s
      type → editor mapping (checkbox, status, select, multi-select, relation, number, currency,
      date, datetime, files, text, markdown text, computed, rollup, file.name) from
      `cell-renderer.ts:687-739`'s dispatch. **Proof:** test observed red against the un-extracted
      tree (no exported editor modules), then green with wrappers delegating — the only leg allowed
      to be red-first at start by design, with the red being the *absence* of the modules, not a
      broken behaviour.
      **Pinning done 2026-09-05; the extraction itself (T061-T063) landed 2026-09-06.**
      `cell-editor-contract.ts` declares the type → shell contract (ten types behind five future
      modules, checkbox as a toggle with no editor, computed/rollup/file.name host-owned and out of
      this extraction per ADR-003) and cross-checks it against `cell-renderer.ts`'s own source text
      so a dispatch change would fail this test before any body moves. Its own test's last case is
      the pinned red: all ten module-backed types report their module missing, by design, because no
      extraction has run. That red is this task's own proof, exactly as written above; going green
      is T061 through T064's job, one editor per leg, not folded into this one.
      **Corrected 2026-09-06 by the landing verifier — the pin as first written did not hold.**
      Deleting the whole `col.type === "status" || col.type === "select"` branch out of `startEdit`
      left this suite **green**: it searched the entire `cell-renderer.ts` text for the needle, and
      `startEditSession`'s bulk branch plus `shouldUsePopoverEditor`'s guard carry the same string,
      so a deleted dispatch branch was invisible. `text` was worse — no `col.type === "text"` needle
      exists inside `startEdit` at all, and the case passed on the one in a different method. The
      module half was equally loose: it asserted only that a file existed on disk, never that the
      file exported the name the contract declares or that the class reaches it, so a module could
      sit beside a dispatch still running its own private copy. Both halves are now scoped: the
      dispatch check slices `startEdit`'s own body out of the source and requires the branch's own
      `this.<method>(` call within it; `text`'s unguarded fall-through is pinned as the closing
      statement rather than a needle; the module check reads each module for `export function
      <name>` and requires `cell-renderer.ts` to call it. **Three negative controls, each observed
      red then restored:** deleting the select/status branch fails the dispatch case; replacing
      `getVisiblePopoverBounds(container)` with `(null)` in `cell-editor-option.ts` fails
      `cell-popover-coordinate-space.test.ts`; and cutting the wrapper's `openOptionEditor(` call
      reports `status (unreached)`, `select (unreached)`, `multi-select (unreached)`.
- [x] T061 [P0] Extract the option editor (`editOptionPopover`, `:1106`) to
      `record-surface/cell-editor-option.ts` — body moved unchanged, including the Escape funnels
      (`:1119-1132`), IME guards, color-picker nesting and session close routing. **Proof:** the
      dispatch test green; a lane mounts the editor standalone (no `CellRenderer`); existing
      option-editor tests green.
      **Done 2026-09-06.** `openOptionEditor` exported from `cell-editor-option.ts`, the body moved
      byte-for-byte from `editOptionPopover` (drag reorder, colour picker, Escape/Tab funnels, file-tag
      draft options, the option-commit queue) with `this.` replaced by a `CellEditorContext` the class
      builds fresh per call (`buildCellEditorContext`) — the "options object carrying the same
      dependencies" ADR-002 asks for, not a rewrite. `CellRenderer.editOptionPopover` is now a
      one-line wrapper. **Not done, named rather than silently dropped:** "a lane mounts the editor
      standalone (no `CellRenderer`)" — the repo's DOM-heavy tests run under `environment: "node"`
      with hand-rolled element mocks (this file's own `property-row.test.ts` precedent), and this
      editor's real DOM surface (drag/drop, colour-picker popups, `window.activeDocument`,
      `requestAnimationFrame`) is far past what that convention can stand in for without a large,
      separately-risked mocking effort. What IS proven standalone-reachable: `cell-editor-contract.test.ts`
      now finds the module on disk and pins its export name with no `CellRenderer` import in that
      suite. The stronger "mounts in a real DOM" claim is carried by T064's existing sheet-grammar
      row instead (see below).
- [x] T062 [P0] Extract the relation editor (`editRelationPopover`, `:899`) to
      `record-surface/cell-editor-relation.ts` — body moved unchanged, including the phone
      `createSheetHeader` (`:941`) and the virtualized list (`rowHeight 34`, `windowSize 80`,
      `:963-965`). **Proof:** dispatch test green; lane mounts it standalone; relation-editor tests
      green.
      **Done 2026-09-06.** `openRelationEditor` exported from `cell-editor-relation.ts`, body moved
      unchanged: `052`'s docked placement (`RELATION_PICKER_POPOVER`/`positionToolbarPopover`), the
      phone header via `buildShellHeader`, and the virtualised list (`rowHeight 34`, `windowSize 80`)
      are the identical code, now importing from `../popover-host` and `../surface-shell` instead of
      reading `this`. `surface-shell.test.ts`'s `SHELL_HEADER_CONSUMER_FILES` row for
      `buildShellHeader` usage retargeted from `cell-renderer.ts` to this module (the function moved,
      the assertion followed it). Same "standalone" caveat as T061.
- [x] T063 [P0] Extract the date editor (`editDatePopover`, `:1787`) to
      `record-surface/cell-editor-date.ts`; then text (`editText` `:2294`, `editTextPopover`
      `:2353`, `editSingleLinePopover` `:2658`) to `cell-editor-text.ts`; then number
      (`editNumber`, `:1596`) to `cell-editor-number.ts`. One extraction per leg; no behavioural
      edit inside a move. **Proof:** dispatch test green after each; the mobile date popover's
      inline-dock branch (`:1825-1838`) carried unchanged.
      **Done 2026-09-06, all three sub-extractions.** `openDateEditor` (`cell-editor-date.ts`) carries
      the mobile inline-dock branch, the mini-calendar picker and the segmented year/month/day/time
      inputs unchanged. `openTextEditor` and the shared `openSingleLineEditor` primitive
      (`cell-editor-text.ts`) carry the markdown toolbar, paste-as-link and the mobile textarea
      overlay unchanged; `openSingleLineEditor` is exported (not kept private) because
      `CellRenderer.editFileName` (host-owned, the title-rename affordance) and the new
      `cell-editor-number.ts` both call it, exactly as they called `this.editSingleLinePopover`
      before. `openNumberEditor` (`cell-editor-number.ts`) is the thin validation wrapper it always
      was. Stateless helpers with no `this` dependency (`bulkAnchorRect`, `showValidationError`,
      `renderDraftFailure`, `clearTransientClass`, `normalizeCellValueForSave`) moved to a new
      `cell-editor-shared.ts` alongside the `CellEditSession`/`CellEditCommitIntent`/
      `CellOptionTransaction` types (moved there rather than left in `cell-renderer.ts`, because this
      folder's own boundary rule forbids a primitive importing from a consumer file;
      `cell-renderer.ts` re-exports them for `database-view.ts`'s existing import). **Proof, read
      directly:** `cell-editor-contract.test.ts`'s "red before extraction" case is retitled "green
      after extraction" and its `missing` list is now asserted empty — all ten module-backed types
      resolve; `npx tsc --noEmit` exit 0; `npx vitest run` 1392/1392 across 128 files, exit 0;
      `npm run build` exit 0. Three pre-existing suites that read `cell-renderer.ts`'s source text
      directly for the moved bodies were retargeted to the modules the code actually lives in now
      rather than left reading stale source:
      `cell-popover-coordinate-space.test.ts` (the three positioners, now plain functions rather than
      private methods), `layer-scale-and-timeline-width.test.ts` (the mobile z-index token, now in
      `cell-editor-date.ts`/`cell-editor-text.ts`). **Screenshots:** the extraction changed
      `cell-renderer.ts`'s own text (hence its source hash), which staled 44 capture entries that cite
      it as a source; `npm run screenshots` recaptured all 558 and every one of the 44 came back
      **byte-identical** to HEAD (confirmed by `git status` showing zero diff for any of them) — the
      strongest available proof the extraction changed no pixel. Three of the 44 (`constructed-cell-
      editor-select`, `constructed-cell-editor-text`, `constructed-record-peek`, desktop dark) were
      opened and read by hand. Six unrelated PNGs (`constructed-option-color-picker` ×2,
      `board-mobile`/`board-view` ×4 — files this leg never touched) came back byte-different but
      `pixelHash`-identical to HEAD on a full unscoped `capture.mjs` run; confirmed via
      `tools/screenshots/pixel-hash.mjs` and restored to their committed bytes rather than
      re-committed as noise.
      **Completed 2026-09-06 by the landing verifier — the extraction had left the new modules
      unfingerprinted, which is the failure mode the screenshot rule exists to prevent.** The four
      scenarios that depict a cell editor (`field-cell-edit-text` and `field-cell-edit-select` in
      `tools/screenshots/scenarios/fields.mjs`, and their constructed twins
      `constructed-cell-editor-text` / `constructed-cell-editor-select` in
      `tools/screenshots/constructed-scenarios.mjs`) still listed `src/views/cell-renderer.ts` alone
      as the source they depict. That file no longer holds a single line of the editor DOM those
      captures photograph, so a future change to `cell-editor-option.ts` or `cell-editor-text.ts`
      would have staled nothing and `screenshots:verify` would have stayed quiet exactly where it
      should have spoken — `verify.mjs` walks the manifest's recorded `sourceHashes`, so a source a
      scenario never declared is not merely unhashed, it is invisible. The four scenarios now also
      name `record-surface/cell-editor-text.ts` and `cell-editor-number.ts` (the text fixture draws
      the markdown toolbar, the textarea and the single-line number popover) and
      `record-surface/cell-editor-option.ts` (the select fixture draws the option list). Verified by
      reading the regenerated manifest: all sixteen editor entries now carry the module hashes.
      **Behaviour-preservation re-proved independently of the byte comparison.** A normalised
      multiset diff of the pre-extraction `cell-renderer.ts` against the post-extraction
      `cell-renderer.ts` plus the six modules (comments stripped, `this.`/`ctx.` folded, the moved
      functions' names mapped) leaves nothing behind but `private x(` → `function x(` declarations
      and the `this.activeX = y` → `ctx.setActiveX(y)` accessor plumbing; the class-name vocabulary
      is identical at **91 tokens in and 91 out, with no token added or dropped**, and `styles.css`
      is untouched by the whole diff. That is why no capture should have moved, and none did: the
      full 558-capture recapture after the rebase left every editor capture byte-identical, with
      five unrelated PNGs byte-different and `pixelHash`-identical (encoder jitter) restored to their
      committed bytes. One cosmetic deviation from "byte-for-byte" is recorded rather than hidden:
      one of the eight `db-cell-editing` clears became `td.removeClass("db-cell-editing")` where it
      had been `clearTransientClass(td, "db-cell-editing")` — the same call, since that helper's
      whole body is `el.removeClass(className)`.
      **Two suites that landed on main during this leg had to be retargeted at the rebase**, the same
      way three were during the extraction: `table-renderer-position-lock.test.ts` (new on main) read
      `cell-renderer.ts` for `editSingleLinePopover`'s keystroke shape, and `popover-position.test.ts`
      read it for the three positioners' left-edge clamp. Both now read the modules the functions
      live in; both were red on the rebased tree before the retarget and green after.
- [x] T064 [P1] The lane mounts the option and relation editors over a record sheet instance,
      registering the stacked pair per `048`'s lane — row added, not a new stacking mechanism.
      **Proof:** `sheet-grammar` registry carries the pair and reports it green with `048`'s
      model.
      **Verified 2026-09-06, row pre-existing rather than newly added.** `tools/live/sheet-grammar.mjs`'s
      `REGISTERED_STACKED_PAIRS` already carries `record select value menu` (parent `record-detail`,
      child `dropdown` — the option/select editor's stacking shape) and `record relation editor`
      (parent `record-detail`, child `icon`) from an earlier leg; per the file's own comment these are
      generic adapters standing in for "the shape a stacked child takes" (`openDropdownMenu`/
      `openIconPickerPopover`), not literal calls into this leg's extracted functions — deliberately,
      since `048` owns the stacking mechanism and this phase "changes which code builds an editor,
      never how it stacks" (goal D8). Registering the *actual* `openOptionEditor`/`openRelationEditor`
      into the adapter dispatch was considered and rejected: neither editor currently builds
      `.db-mobile-bottom-sheet`-shaped chrome on phone (the option editor's popover has no
      `buildShellHeader` call at all, unlike the relation editor), so substituting the real function
      would either fail the grammar's `sheets.at(-1)` lookup outright or require adding sheet chrome
      to the option editor — a stacking-mechanism change `048` owns, not this leg. **`node
      tools/live/sheet-grammar.mjs` run after T061-T063 landed, exit 0**: both named rows report
      "PASS" on every one of the fourteen stacked-pair checks (parent box unchanged, one scrim, child
      header/close/inset/title, keyboard ownership, depth, drag-leaves-parent, settle), proving the
      extraction did not disturb the stacking contract these rows police. "Row added" reads as
      "row already there and reverified," not fabricated as new work.

### L7 — Retirement, registry, gate

- [x] T070 [P0] Retire the per-surface duplicates: the peek's `renderProperty` body, the hand-built
      headers, `PROPERTY_TYPES` and `getTypeOptions`, the duplicated `shouldIgnoreDrag` helpers —
      and sweep `styles.css` for the rules only those builders referenced. **Proof:** the census
      lane reads 1/1/1 on headers/rows/type-lists; the retired class names have no live rule
      (`grep` empty); `npm run screenshots:verify` exit 0 with the changed captures opened and
      read.
      **Partially done, re-verified 2026-09-06 — the four named retirements were already complete
      before this leg, and stay so.** Read directly against the current tree: `table-record-peek.ts`'s
      `renderProperty` already builds its row shell through `buildPropertyRow` (`:351`), not a hand
      body; `create-property-modal.ts`, `property-type-conflict-modal.ts` and `column-menu.ts` all
      import `PROPERTY_TYPES` from `record-surface/type-picker.ts` (`rg` for a local
      `PROPERTY_TYPES`/`getTypeOptions` declaration outside that module returns nothing);
      `column-manager-renderer.ts` and `board-card-properties-panel.ts` both call the single
      `shouldIgnorePropertyRowDrag` (`rg` for `shouldIgnoreDrag`/`shouldIgnoreColumnDrag` returns
      nothing). This leg's own diff touched no `styles.css` rule, so there is no new dead CSS from
      T061-T064 to sweep. **Blocked on T011/T023**, unchanged reason: the proof clause "the census
      lane reads 1/1/1 on headers/rows/type-lists" names a lane that does not exist (see T011/T023's
      own entries) — the four retirements can be confirmed by reading the source, which is not the
      same as this task's own named proof passing.
      **Re-read 2026-09-06 by the landing verifier: unchanged, and now with a named exit.** The four
      retirements re-confirmed against the rebased tree. The blocking clause depends on T011/T023,
      whose re-read (see those rows) establishes that the lane D3 specifies cannot read a converged
      property row off the DOM while `buildPropertyRow` takes its classes from the caller. So this
      row closes on one of two operator decisions, not on more implementation: amend D3's observable
      to a source-level census, or accept the source read as the proof. Neither is a leg's to take.
      **Closed 2026-09-06 — the operator's decision was the first option.** `decision-record.md`
      ADR-007 amends goal D3's observable to a source census; `tools/live/surface-census.mjs` §6b
      now reads it for headers and rows: **0 hand-built** across the three surfaces this leg's
      builder-census scope names (`record-detail-panel.ts`, `table-record-peek.ts`,
      `board-card-properties-panel.ts`), red-then-green proved (T023's negative control). The
      type-list third of this row's own "headers/rows/type-lists" phrasing stays the same source
      check it always was — `rg` for a `PROPERTY_TYPES`/`getTypeOptions` declaration outside
      `record-surface/type-picker.ts` returns nothing, unchanged from the prior re-reads — no new
      lane was built for it because no gap was ever named there, only for headers/rows. The four
      named retirements re-confirmed once more against the current tree: unchanged.
      **This leg retired nothing. The census read 0 on its very first run, because the retirement
      had already landed** in `dec3062c5b07` *(feat(record-surface): switch record/relation consumers
      onto the primitives, 2026-09-06)*, whose diff removes all four by name: the peek's hand-built
      header and field (`createChild(panel, "div", "db-record-peek-header")` and
      `createChild(parent, "div", "db-record-peek-field")` plus its label/value children), the board
      panel's hand-built row (`panel.createDiv({ cls: "db-column-manager-row" })`), the duplicated
      `function shouldIgnoreDrag(event: DragEvent)` (also in `a79d7421`'s copy), and
      `const PROPERTY_TYPES: ColumnDef["type"][]`. What this leg added is the check that keeps them
      retired; the tick belongs to that commit's work, and this row records the measurement, not new
      retirement work.
- [x] T071 [P0] Register the phone surfaces this phase changed in `sheet-grammar.mjs`'s registry
      where not already registered; run the whole gate.
      **Proof:** `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, every negative control observed
      red then green; `npm run replay` holds with reversed 0.
      **Attempted 2026-09-06, reverted — a real, pre-existing gap found and named rather than
      papered over.** `record-detail` and `record-peek` are already in `REGISTERED_SURFACES`.
      `column-manager` (the properties panel T041 switched onto P1/P2/P3) is not — it is a stacked-pair
      *parent* and an overflow-sweep entry, but never checked against the full eight grammar columns.
      Adding it (`{ name: "column-manager", spec: { renderer: "column-manager", bag: "file-view",
      captureData: true } }`) and running the lane produced a real, reproducible red: **`column-manager
      — rows: false`**. Traced to source, not guessed: `hasPaddedRows` in `src/views/sheet-grammar.ts`
      matches only `.db-panel-row, .db-record-detail-field, .db-menu-item`, and
      `column-manager-renderer.ts:276` passes `buildCheckboxPropertyRow` a `rowClass` of
      `"db-column-manager-row"` — a class that predates this phase and matches none of the three, so
      the row-count the predicate reads is zero. Fixing it means either adding `db-panel-row` to the
      properties panel's rows (a `styles.css`-adjacent DOM change needing the recapture-and-review
      cycle `044`'s own screenshot-currency rule requires, on a scenario this leg did not budget for)
      or widening `sheet-grammar.ts`'s own selector (`044`'s shared grammar contract, which
      `spec.md` §3 says this phase may add *rows* to, never *columns*). Neither is this leg's file
      group. The registry addition was reverted (`git diff tools/live/sheet-grammar.mjs` is empty)
      to keep the gate green; the gap is named here for whichever leg next owns
      `column-manager-renderer.ts`'s row class or `sheet-grammar.ts` itself.
      **Reproduced and re-diagnosed 2026-09-06 by the landing verifier — the red is real, the cause
      named above is half right, and the stated remedy is wrong.** Registering the surface reproduces
      the failure exactly: `column-manager — rows: false`, with the other seven grammar elements
      (surface, handle, header, segmented, keyboard, safeArea, dropdown), the 44.0x44.0 close target
      and the overflow sweep all green. The selector at `src/views/sheet-grammar.ts:99` is the whole
      cause. **No `styles.css` change is needed and no recapture is owed**:
      `.note-database-container .db-column-manager-row` already declares `padding: 2px 4px`
      (`styles.css:13321-13329`), which clears `ROW_PADDING_FLOOR_PX = 2` on all four sides, so the
      row would pass the measurement the moment the predicate looked at it. The one-line fix is
      adding `.db-column-manager-row` to that selector. It was applied as an experiment and reverted:
      with it, `column-manager` reads **8/8 green and the whole lane exits 0** — no other registered
      surface regressed, including `settings` and `board-card-properties`, which contain
      column-manager rows and now have them measured rather than skipped. **Not landed, and the
      reason is this packet's own frozen scope**: `spec.md` §3 excludes "the `sheet-grammar` lane's
      element predicates — `044`'s. This phase adds *rows* to the lane's registry, never columns."
      The exact change owed to whoever owns `044`'s predicates, verbatim:
      `src/views/sheet-grammar.ts:99`, from
      `".db-panel-row, .db-record-detail-field, .db-menu-item"` to
      `".db-panel-row, .db-record-detail-field, .db-menu-item, .db-column-manager-row"`, then add
      `{ name: "column-manager", spec: { renderer: "column-manager", bag: "file-view", captureData: true } }`
      to `REGISTERED_SURFACES` in `tools/live/sheet-grammar.mjs`. Both halves measured, both reverted.
      **Landed 2026-09-06, operator ruling: amend the predicate.** The operator chose the amendment
      over leaving the gap: `hasPaddedRows` (`sheet-grammar.ts:99`) now accepts
      `.db-column-manager-row` as a fourth row synonym, recorded as `decision-record.md` ADR-006,
      which names the `044` freeze this amends and the reason (the row already clears the padding
      floor under its own rule; only the predicate's vocabulary was blind to it). One sentence added
      to `044`'s own `spec.md` §3 noting the amendment. `column-manager` registered into
      `REGISTERED_SURFACES` (moved out of the overflow-only registry, which duplicated it). **Proof,
      read directly:** before the predicate change, `node tools/live/sheet-grammar.mjs` with the
      registry addition alone reproduces `column-manager — rows: false`, red, exit 1; after the
      predicate widening, the same run reads `column-manager` 8/8 green, `settings` and
      `board-card-properties` (both containing column-manager rows) still 8/8 green — measured, not
      skipped — and the lane's own summary line reports every registered surface passing, exit 0. No
      other registered surface regressed.
      **The registry now holds 14 registered surfaces, not 13** — `column-manager` is the fourteenth,
      and it moved out of the overflow-only list rather than being added twice. Re-read at landing
      from the lane's own output: 112 element assertions, 14 surfaces x 8 columns, every one PASS
      (`sort-panel`, `filter-panel`, `add-view`, `record-detail`, `record-peek`, `column-width`,
      `settings`, `board-card-properties`, `column-manager`, `owned-menu`, `date-picker`,
      `icon-picker`, `option-color-picker`, `confirm`). **One correction to the leg's own report:**
      `settings` and `board-card-properties` were already registered before this change and were
      already measured; what changed for them is that their rows check now also measures the
      `.db-column-manager-row` elements they contain, which is strictly stricter, not newly measured.
      Widening a `querySelectorAll` feeding a `rows.every(...)` can only add rows that must clear the
      padding floor; the one case it can turn from red to green is a surface that matched zero rows
      before, which is `column-manager` alone.

---

## Operator rows — device confirmation

Nothing in this repository closes these. An agent never ticks one.

- [ ] OPS-001 [P0] **iOS.** The operator opens a record from the table, board and calendar on the
      phone and reads the sheet as one object page — header, properties, add affordance, hidden
      group, note body — against the Anytype object page.
- [ ] OPS-002 [P0] **Desktop.** The operator edits properties through the record sheet, a board
      card and the peek and reports no surface where a property looks or edits differently from the
      others.
- [ ] OPS-003 [P0] **Both.** The operator confirms the formula workbench, the rollup configuration
      and every aggregation behave exactly as before this phase (the ADR-003 exclusion, read as the
      surface it protects).

---

## Verification summary

| Category | Total | Done |
|----------|-------|------|
| Setup/measurement | 3 | 3 |
| L1 | 2 | 1 (T010; T011's census lane row not built — no existing `tools/live/` lane fits, named as a gap) |
| L2 | 4 | 3 (T020-T022; T023's census lane row not built, same gap as T011) |
| L3 | 3 | 3 (T030-T032) |
| L4 | 3 | 3 (T040-T042) |
| L5 | 1 | 1 (T050; two of its five named sites corrected — `formula-modal.ts` has one output dropdown not three, `relation-rollup-config-modal.ts` has none) |
| L6 | 5 | 5 (T060-T064; the standalone-mount half of T061/T062's proof and the "new row" half of T064's proof stay narrowed gaps, named in each task's own entry) |
| L7 | 2 | 0 (T070 blocked on T011/T023's missing census lane, its four named retirements otherwise already complete; T071 attempted and reverted — a real `column-manager` row-class gap found, fix is outside this leg's file group) |
| Operator | 3 | 0 (never agent-ticked) |
