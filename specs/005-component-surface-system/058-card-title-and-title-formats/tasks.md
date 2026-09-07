---
title: "Tasks: Card Title and Title Formats"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "058 tasks"
  - "card title format tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Card Title and Title Formats

<!-- SPECKIT_LEVEL: 2 -->

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read the existing `titleField` mechanism and its callers, so this packet edits the read
      path rather than duplicating the picker. Findings recorded in `goal.md` §4 Progress:
      `ViewConfig.titleField` (`types.ts:570`), `NO_TITLE_FIELD` (`:354`), the picker in
      `view-config-panel-renderer.ts:1902-1920`, `resolveTitleFieldDisplay`
      (`title-field-display.ts:36-61`), and its callers in `board-renderer.ts` and
      `record-detail-panel.ts` (`:485-488`)
- [x] T002 [P] Check the Anytype and (queued) Notion references. Anytype: no separate title
      relation exists, the object Name is always the title (`screenshots/anytype/README.md:293`) —
      nothing to adopt. Notion: `047`'s Mobbin harvest has not landed; no `screenshots/notion/`
      directory exists — recorded as pending in `goal.md` D6
- [x] T003 Measure the red: construct a currency-typed `titleField` view and record
      `resolveTitleFieldDisplay`'s current output (expected: the raw numeric string, e.g. `3537.32`,
      not `€ 3.537,32`), before any code change. Evidence: `src/data/title-field-display.test.ts`
      run against the unmodified resolver failed with `expected '3537.32' to be '€ 3.537,32'` (and
      the equivalent for a plain number and a date), observed directly before T004 landed.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Widen `resolveTitleFieldDisplay`'s non-file branch (`title-field-display.ts:52-60`) to
      look up the chosen column's `type`/`numberDisplayStyle` and call the same formatter
      `cell-renderer.ts`'s `switch (displayType)` (`:301-325`) calls for that column — `number` and
      `currency` first; `date`/`datetime` if the column-lookup shape makes it free, else a named
      follow-up. The `file.*` and `text` branches stay byte-identical to today's output. Landed as
      `formatTitleFieldText` in `title-field-display.ts`, covering currency/number (via
      `formatEuroCurrency`/`formatEuroNumber`) and date/datetime (via
      `formatDateValueDisplay`/`formatDateTimeValueDisplay`); a non-matching column falls through
      to the original `stringifyValue()` path unchanged. Green: `title-field-display.test.ts`,
      8/8 passing, including byte-identical assertions for the `text` and `file.name` branches.
- [x] T005 Give `board-card-properties-panel.ts`'s Title fixed slot (`:43`) a click handler that
      opens the existing `titleField` picker (`view-config-panel-renderer.ts:1902-1920`), with a
      negative control proving the Cover row directly above it (`:42`) gains no handler. Landed:
      the Title row scrolls to and opens the general section's titleField dropdown, located via a
      `data-config-row="title-field"` marker `view-config-panel-renderer.ts`'s `renderTitleField`
      now sets. Red observed by reverting `board-card-properties-panel.ts` alone (`git stash`) and
      re-running the new test — `expected [] to have a length of 1 but got +0` — then restored;
      green: `board-card-properties-panel.test.ts`, 7/7 passing, including the Cover-row negative
      control (`coverRow.onclick` is `null`).
- [x] T006 [P] Add the regression test locking the board/record-header/phone-sheet `titleField`
      agreement already true in code (`record-detail-panel.ts:485-488`), so a future edit to
      `getRecordEventTitleField` cannot silently fork the three surfaces again. Landed as
      `title-field-display.test.ts`'s "cross-surface titleField agreement" suite: for every view
      type but calendar/timeline, the exact `titleField` value each surface's getter is documented
      (read from source; `board-renderer.ts`/`record-detail-panel.ts` are out of this packet's
      edit scope per `plan.md`'s FIX ADDENDUM) to pass into the shared resolver produces identical,
      correctly-formatted text. The desktop and phone record sheet share one code path
      (`record-detail-panel.ts`'s `renderContent`, gated only by sheet chrome), so this also
      covers AC-002/AC-003. 5/5 passing.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T007 Add a screenshot scenario per `screenshot-currency.md`: a board card and a record sheet
      header, both titled by a currency column, light and dark, desktop and phone. Landed three
      scenarios — `board-card-title-currency` (`tools/screenshots/scenarios/core.mjs`),
      `panel-record-detail-title-currency` and `panel-record-detail-sheet-title-currency`
      (`tools/screenshots/scenarios/panels.mjs`, the desktop and phone-sheet forms) — each
      captured in both themes (the board card and the desktop record header also both devices).
      All ten PNGs opened and read; the board fixture needed `db-kanban-view` added to its
      container for the kanban-scoped chip text-colour rule to apply (a fixture-markup fix, not a
      product defect). `npm run screenshots:verify`: PASS, 588/588.
- [x] T008 `npx tsc --noEmit`, `npm run build`, `npx vitest run` — all exit 0, read directly.
      `npx tsc --noEmit`: exit 0. `npm run build`: exit 0 (esbuild production). `npx vitest run`:
      exit 0, 1520/1520 tests across 142 files (re-proven after the rebase onto origin/main).
- [x] T009 `npm run gate` exits 0 with the new lane row observed red before green; `npm run replay`
      holds with reversed 0. `npm run gate`: PASS, 26 green, 0 red — after taking the
      `css-lane` over from `056-board-anytype-parity` (its release left nothing outstanding) and
      re-running the eight `tools/live/*.mjs` tools `evidence.mjs` reported stale against the
      moved `styles.css`/`board-card-properties-panel.ts`. `npm run replay`: PASS, all 28 results
      hold, 0 reversed. Red-before-green for the new coverage itself: see T003/T005's own evidence
      (a resolver revert and a panel revert, each re-run against the new tests).
- [x] T010 `npm run screenshots:verify` exits 0; the new capture opened and read by a person, both
      themes. Exit 0, 588/588 entries match their sources; all ten new PNGs opened and read (see
      T007).
- [ ] T011 Leave the operator row open. An agent never ticks it
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4: Production verification and the file-name title format (2026-09-07)

A fresh operator report on 0.0.31 iOS showed board cards titled by their raw file names
(`3537.32`, `4736.32`), reopening the evidence question this phase's own log named as D1: the
prior AC-001..AC-003 screenshot evidence was hand-written fixture HTML, never the shipped
`BoardRenderer`.

- [x] T012 Reproduce RED on the production `BoardRenderer` in headless Chrome at 402x874: with a
      currency-typed `titleField`, does the real renderer format the title, and does a per-view
      title-field picker actually reach the operator on phone? Confirmed by reading source
      (`board-renderer.ts`'s `getReferenceRowTitle`, `getTitleField`) and by mounting the harness:
      the currency-column claim held on the unmodified tree (D1 was an evidence gap, not a
      behavior gap); the picker was already reachable via `board-card-properties-panel.ts`'s Title
      row (D4, shipped). The real gap: `resolveTitleFieldDisplay`'s file-title branch has no format
      option at all, and `board-renderer.ts` had a second, undiscovered bug (T014).
- [x] T013 Add `TitleFileFormat` (`types.ts`), `ViewConfig.titleFormat`, and route
      `resolveTitleFieldDisplay`'s file-title branch through it (`formatFileTitleText`,
      `title-field-display.ts`) — plain text (default, unchanged) / number / currency (EUR, USD,
      GBP) / date. Red first: 8 new `title-field-display.test.ts` cases failed against the
      unmodified resolver (no `titleFormat` field existed); green once landed, 22/22.
- [x] T014 Give the "Title format" row its own picker in `view-config-panel-renderer.ts`, beside
      the existing Title field row, visible only while the title reads the file name. Red first: 5
      new `view-config-panel-renderer.test.ts` cases (mounted on a board-viewType config) failed
      against the unmodified tree; green once landed. **Driving the real `BoardRenderer` (not the
      unit tests, which call the resolver directly) found a second, deeper red**:
      `board-renderer.ts`'s `getReferenceRowTitle` special-cased `title.isFileTitle` to read
      `row.file.basename` directly, discarding `titleFormat`'s output — harmless while the two
      were always identical, silently wrong the moment they diverged. Fixed by reading `title.text`
      unconditionally (ADR-006).
- [x] T015 Add two `tools/live/render-assertion-harness.ts` scenarios mounting the production
      `BoardRenderer`: `board-title-currency-column` (a currency-typed `titleField`) and
      `board-title-format-numeric-filename` (a numeric file name plus a `titleFormat` choice), each
      asserting every drawn `.obnotion-kanban-card-title` carries its format's own currency mark
      and never equals the raw value. Both observed red against the unmodified `board-renderer.ts`
      (`git stash` on that one file), green restored.
- [x] T016 Add two constructed (real-renderer-driven) screenshot scenarios —
      `constructed-board-title-currency` and `constructed-board-title-format-filename` — captured
      in both themes, phone and desktop; cross-link the existing hand-written `board-card-title-currency`
      fixture to the new constructed scenario via `fixtureOf` (D1's evidence upgrade). All eight new
      PNGs plus the four `constructed-board-card-properties` captures the new picker row moved were
      opened and read by a person.
- [x] T017 `npx tsc --noEmit`, `npm run build`, `npx vitest run` (1655/1655), `node
      tools/live/render-assertions.mjs`, `node tools/live/sheet-grammar.mjs`, `npm run gate`
      (foreground, stdin `/dev/null`), `node tools/naming/scan-comments.mjs`, `node
      tools/naming/scan-failing-values.mjs` (baseline raised by one justified row — the
      currency-column claim was never broken, so it has no failing value to record; see
      `failing-values-baseline.json`'s own note) — all exit 0.
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]` — except T011, which names the operator's own row and is never ticked
      by an agent
- [x] No `[B]` blocked tasks remaining
- [x] Every acceptance criterion in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`
      — except the operator-only row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../057-calendar-anytype-parity/`
- **Owners this packet reads but does not edit**: `../045-board-card-properties/`,
  `../054-record-and-relation-surfaces/`, `../056-board-anytype-parity/`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in `spec.md`
- [x] CHK-002 [P0] Technical approach defined in `plan.md`
- [x] CHK-003 [P1] Dependencies identified — `045`, `054`, `056` all read the shared resolver;
      none is edited by this packet
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks. `npx eslint` on the five touched files reports
      two pre-existing items unchanged by this packet's diff (an unused `setIcon`/`setTooltip`
      import at `board-card-properties-panel.ts:10`, present before this packet touched the file,
      and an `element.style.gridColumn` rule at `view-config-panel-renderer.ts:1027`, outside any
      line this packet edited) — confirmed identical against `dc1d54a9` (the branch point). Zero
      new lint findings from this packet's own edits. `npm run gate`'s own lint lane
      (`lint:tools`) is green.
- [x] CHK-011 [P0] No console errors or warnings. None introduced; `npx vitest run` (1520/1520) and
      the gate's `render-assertions`/`sheet-rebuild`/`sheet-teardown` lanes, which fail on a
      console error, are all green.
- [x] CHK-012 [P1] Non-numeric values in a number/currency-typed title column fall back to the
      existing `nonNumericText` path, not a thrown error. Covered by
      `title-field-display.test.ts`'s "falls back to the raw text for a non-numeric value in a
      currency column" case.
- [x] CHK-013 [P1] The `text`/`file.*` branches of `resolveTitleFieldDisplay` are byte-identical to
      today's output. Covered by the "keeps a text-typed titleField's output byte-identical" and
      "keeps the file.name pseudo-field untouched" cases.
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met. AC-001 through AC-007 `Met` (see
      `acceptance-criteria.md`); AC-008 stays `Unmet`, operator-owned per D3/T011.
- [x] CHK-021 [P0] The formatted-title unit test observed red before green. See T003/T004 evidence.
- [x] CHK-022 [P1] The Title-slot affordance test and its Cover-row negative control both pass. See
      T005 evidence.
- [x] CHK-023 [P1] The cross-surface regression test (board/record header/phone sheet) passes. See
      T006 evidence.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each change classed: the resolver edit is `cross-consumer` (three readers),
      the Title-slot affordance is `instance-only`.
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `rg -n "stringifyValue" src/data src/views`
      run before and after, confirming no second title-formatting surface was missed. Re-run after
      landing: every other call site is an unrelated concern (grouping keys, sort/filter
      comparisons, clipboard, tooltips) — none is a second title-formatting surface.
- [x] CHK-FIX-003 [P0] Consumer inventory for `resolveTitleFieldDisplay`/`TitleFieldDisplay`:
      `board-renderer.ts`, `record-detail-panel.ts`, `calendar-timeline-model.ts`, `row-pipeline.ts`
      (the actual fourth consumer — `rg -ln` finds no reference in `data-source.ts`, correcting
      this row's original inventory) — each reaches the resolver's changed output correctly: the
      two calendar/timeline consumers get the same format fix as a side effect of sharing one
      function (D5 excludes building anything new for them, not sharing the resolver fix).
- [x] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction surface changes.
- [x] CHK-FIX-005 [P1] Matrix axes and row count listed in `plan.md`'s FIX ADDENDUM (5 × 3 = 15).
      Exercised for `text`, `currency`, `number` and `date` column types (4 of 5 axis values —
      `file.*` is covered as the pre-existing untouched branch) across the board card and record
      header/phone-sheet surfaces (2 of 3 axis values, the third being the desktop/phone split
      that shares one code path, per T006's note).
- [x] CHK-FIX-006 [P1] Not applicable — no process-wide state read.
- [x] CHK-FIX-007 [P1] Evidence pinned to the landing commit's own sha: `7b50fed5` (resolver +
      Title-slot fix), `67856d6a` (screenshot scenarios).
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Not applicable — no input validation surface changes
- [x] CHK-032 [P1] Not applicable — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks/goal/acceptance-criteria/decision-record synchronized
- [x] CHK-041 [P1] Code comments adequate. `formatTitleFieldText`, `toTitleDisplayNumber` and
      `nonNumericTitleText` in `title-field-display.ts`, and `openTitleFieldPicker` in
      `board-card-properties-panel.ts`, each carry a durable-WHY comment; no spec path or artefact
      id in any of them (Comment Hygiene).
- [x] CHK-042 [P2] Not applicable — no README-facing behavior beyond what `CHANGELOG.md` will record
      at release
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — none created
- [x] CHK-051 [P1] scratch/ cleaned before completion — not applicable, none created
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 6 | 6/6 |
| P1 Items | 8 | 8/8 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-09-06 (implementation landed)
<!-- /ANCHOR:summary -->

---
