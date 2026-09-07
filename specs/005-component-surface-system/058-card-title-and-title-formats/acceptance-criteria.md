---
title: "Acceptance Criteria: Card Title and Title Formats"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "058 acceptance criteria"
  - "closure gate"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/058-card-title-and-title-formats"
    last_updated_at: "2026-09-07T22:45:00Z"
    last_updated_by: "impl-058-production-verification"
    recent_action: "Added AC-009, AC-010 and AC-011, all Met"
    next_safe_action: "AC-008's operator device read on a released build; then close"
    blockers:
      - "AC-008 is the operator's device read, unclosable here"
    key_files:
      - "src/data/title-field-display.ts"
      - "src/views/board-card-properties-panel.ts"
      - "src/views/board-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "src/data/data-source.ts"
      - "tools/live/render-assertion-harness.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-058-ac"
      parent_session_id: null
    completion_pct: 97
    open_questions: []
    answered_questions:
      - "AC-001..AC-007 Met: resolver format routing, Title-row picker affordance, cross-surface regression test, gate 26 green, replay 28 hold"
      - "AC-009 Met: the currency-column claim is now proven on the production BoardRenderer, not only fixture HTML — the claim was already correct"
      - "AC-010 Met: a titleFormat field for the file-name pseudo-field, plus a board-renderer.ts consumer bug found only by driving production"
      - "AC-011 Met: titleFormat was missing from data-source.ts's save/load round trip — found by reading the persistence layer, would have silently reverted on reload"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Card Title and Title Formats

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/058-card-title-and-title-formats
**Level:** 2
**Status:** Implemented — AC-001 through AC-007, AC-009, AC-010 and AC-011 Met; AC-008 Unmet, operator-owned
**Date:** 2026-09-06, production verification and file-name titleFormat added 2026-09-07
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a board view with a currency column set as `titleField`, When the card renders, Then its main name reads that column's formatted value (e.g. `€ 3.537,32`), not the raw stored number | **Met 2026-09-06.** Red first: the new `title-field-display.test.ts` run against the unmodified resolver failed with `expected '3537.32' to be '€ 3.537,32'`, observed before any code change (T003). Green at `7b50fed5`: `resolveTitleFieldDisplay`'s non-file branch now routes a currency column through `formatEuroCurrency` — the same formatter `cell-renderer.ts` calls — and the currency-titled cases pass, alongside byte-identical assertions for the `text` and `file.name` branches (8/8). Captured and read by a person in both themes and both devices: `screenshots/notion-clone/components/board-card-title-currency-{desktop,mobile}-{light,dark}.png` | Met | - |
| AC-002 | REQ-001 | Given the same view opened as a record sheet on desktop, When the header renders, Then it reads the identical formatted title | **Met 2026-09-06.** The desktop record header reads the same `resolveTitleFieldDisplay` output through `record-detail-panel.ts`'s existing call (unchanged, per the FIX ADDENDUM's zero-line diff), covered by the cross-surface agreement suite in `title-field-display.test.ts` and captured read: `screenshots/notion-clone/panels/panel-record-detail-title-currency-desktop-{light,dark}.png` both show the header reading the fixture row's own euro-formatted cost (`€ 9,00`) — the capture harness renders a constructed fixture, so the formatted-value proof itself is the unit test, not the PNG | Met | - |
| AC-003 | REQ-001 | Given the same view opened as the phone record sheet, When the header renders, Then it reads the identical formatted title | **Met 2026-09-06.** The phone sheet shares the desktop header's one code path (`record-detail-panel.ts`'s `renderContent`, gated only by sheet chrome), so the same format fix reaches it; captured and read: `screenshots/notion-clone/panels/panel-record-detail-sheet-title-currency-mobile-{light,dark}.png` (fixture cost `€ 20,00`) | Met | - |
| AC-004 | REQ-002 | Given the board's Properties sheet is open, When the operator taps the Title row, Then the `titleField` picker opens | **Met 2026-09-06.** Red first: with `board-card-properties-panel.ts` alone reverted (`git stash`), the new test failed `expected [] to have a length of 1 but got +0`; restored, green — the Title row scrolls to and opens the general section's own titleField dropdown (located via the `data-config-row="title-field"` marker `renderTitleField` now sets), and the Cover row directly above it stays a negative control (`coverRow.onclick` is `null`). `board-card-properties-panel.test.ts` 7/7 | Met | - |
| AC-005 | REQ-003 | Given a date column set as `titleField`, When a title renders, Then it reads the plugin's existing date format, not an ISO string | **Met 2026-09-06.** The same landing routes a `date` display type through `formatDateValueDisplay` (and `datetime` through `formatDateTimeValueDisplay`); the date-titled case in `title-field-display.test.ts` asserts the plugin's existing date format and failed on the unmodified resolver before the fix, same red-first pass as AC-001 | Met | - |
| AC-006 | REQ-004 | Given any view but calendar/timeline, When its `titleField` is set, Then the board card, the desktop record header and the phone record sheet all read the identical value | **Met 2026-09-06.** Locked by `title-field-display.test.ts`'s "cross-surface titleField agreement" suite (5/5): for every view type but calendar/timeline, the exact `titleField` value each surface's getter passes into the shared resolver yields identical, correctly-formatted text. Calendar/timeline stay on their own `calendarTitleField`/`timelineTitleField` (D5) | Met | - |
| AC-007 | — | Given the packet is closed, When `npm run gate` runs, Then it exits 0 with the new lane row observed red before green, and `npm run replay` holds with reversed 0 | **Met 2026-09-06, with the premise corrected rather than the check waived.** The new coverage landed as unit and panel tests observed red before green (T003/T005's own evidence: a resolver revert and a panel revert, each re-run against the new tests) — the gate's lane count stayed at its existing-lanes-only 26, so there is no separate new lane row; the css-lane itself was taken over from `056-board-anytype-parity` after its release left nothing outstanding — the hold was re-based twice on the way in (056 on a parallel branch, then 057-calendar-anytype-parity, then 056 again), each time onto whatever the lane had last released. `npm run gate`: PASS, 26 green, 0 red, exit 0 read from `$?`; `npm run replay`: PASS, all 28 results hold, 0 reversed | Met | - |
| AC-008 | — | Given a released build, When the operator sets a currency column as a board's card title on their phone, Then they report it formatted correctly and report being able to change which property is the card's name | Operator confirmation only | Unmet | - |
| AC-009 | REQ-001 | Given the production `BoardRenderer` (not fixture HTML) with a currency column set as `titleField`, When mounted in headless Chrome and rendered, Then every drawn card title carries the euro mark and never equals the column's raw stored value | **Met 2026-09-07.** AC-001's own capture evidence was hand-written fixture markup (`tools/screenshots/scenarios/core.mjs`'s `board-card-title-currency`), which resembles the renderer's real output closely enough to pass a visual read without ever calling `resolveTitleFieldDisplay` through the shipped `BoardRenderer`. `tools/live/render-assertion-harness.ts` gained `board-title-currency-column`, a scenario that mounts the real renderer with `titleField` pointed at the schema's own currency column; green on the unmodified tree — this specific claim was already correct in production, D1 was an evidence gap rather than a behavior gap. A matching constructed screenshot (`constructed-board-title-currency`, both themes, phone and desktop, real-renderer-driven) opened and read, and cross-linked from the original fixture via `fixtureOf` | Met | - |
| AC-010 | REQ-005 | Given a board view whose `titleField` is unset (the file-name default) and a `titleFormat` of `currency-eur` chosen, When the production `BoardRenderer` renders a row whose file name is a plain number (the operator's own report: `3537.32`), Then the card's main name reads the formatted value (`€ 3.537,32`), not the raw file name | **Met 2026-09-07. Two reds, not one.** Red 1 (the feature did not exist): `grep -rn "titleFormat" src` returned nothing; `title-field-display.test.ts`'s new file-name-titleFormat suite (8 cases) and `view-config-panel-renderer.test.ts`'s new "title format row" suite (5 cases) both failed against the unmodified tree, observed by reverting `src/data/types.ts`, `src/data/title-field-display.ts`, `src/i18n.ts` and `src/views/view-config-panel-renderer.ts` together (`git stash`) and re-running. Green once `TitleFileFormat`/`formatFileTitleText`/the "Title format" picker row landed. **Red 2 (a deeper one, found only by driving production):** with the unit-level fix alone in place, `board-renderer.ts`'s `getReferenceRowTitle` still discarded the formatted text for every file-name-drawn title — a `title.isFileTitle` shortcut that read `row.file.basename` directly instead of `title.text`, harmless while the two were always identical and silently wrong the instant `titleFormat` made them diverge. `board-title-format-numeric-filename` (the live harness, mounting the real `BoardRenderer`) failed against the reverted `board-renderer.ts` — "18 card title(s) drawn; 18 missing €, 18 still reading a raw unformatted value" — and passed once `getReferenceRowTitle` was fixed to read `title.text` unconditionally. Neither the unit tests above nor the prior fixture-based captures could have caught this: a unit test calls the resolver directly, and a hand-written fixture never calls `getReferenceRowTitle` at all. Constructed screenshot `constructed-board-title-format-filename` (both themes, phone and desktop, real-renderer-driven) opened and read | Met | - |
| AC-011 | REQ-005 | Given a `titleFormat` chosen through the picker, When the view is saved to and reloaded from a vault file, Then the choice survives the round trip through `data-source.ts`'s `parseDatabaseConfig`/`toViewPayload`, in both the current views-array format and the legacy flat-frontmatter format | **Met 2026-09-07 — found by reading the persistence layer, not by any renderer harness.** `titleField` is written and read at four separate sites in `data-source.ts` (`parseDatabaseConfig`'s new-format branch, its legacy flat-format branch, `parseViewConfig`, and `toViewPayload`); `titleFormat` existed nowhere in any of the four. Neither the render-assertion harness (which constructs `ViewConfig` objects directly in memory, never through this serialize/deserialize path) nor the panel/unit tests above could have caught this — a chosen format would have worked for the rest of the session and silently reverted to plain text on the next vault load. Red: a new `data-source.test.ts` case failed `expected undefined to be 'currency-eur'` against the unmodified file (`git stash` on `data-source.ts` alone). Green: `parseTitleFormat` added and wired into all four sites; the same test also asserts the legacy flat-format path and that an unrecognized stored value does not survive as a stray string. 14/14 in `data-source.test.ts` | Met | - |

### Status values

| Value | Meaning |
|-------|-------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Not closeable — one row is open, and it is the operator's.** Eight rows: **seven Met and one
Unmet**. T003 measured the red on the unmodified resolver before any code change; T004-T006 landed
the format routing (`formatTitleFieldText` in `title-field-display.ts`), the Title fixed slot's
jump-to-picker affordance, and the cross-surface regression test, each observed red before green;
T007-T010 added the currency-titled screenshot scenarios (ten PNGs, both themes, opened and read),
ran the whole verification gate (`npx tsc --noEmit`, `npm run build`, `npx vitest run` 1520/1520,
`npm run gate` 26 green exit 0, `npm run replay` 28 hold) and `npm run screenshots:verify` at
588/588. AC-008 is the operator's alone and is closed by nobody here — shipped and verified are
not the same state as operator-confirmed (parent D3).

**One premise was corrected rather than the check waived** (AC-007): the criterion expected the
new coverage as a new gate lane row observed red before green. It landed as unit and panel tests
instead — the gate's lane count is capped at its existing-lanes-only 26 — so red-before-green is
carried by T003's resolver revert and T005's panel revert, and the gate itself stayed green
throughout. The `css-lane` was taken over from `056-board-anytype-parity`, whose release left
nothing outstanding.

**2026-09-07 amendment — a fresh operator report on 0.0.31 iOS reopened the evidence question,
and the AC-008 gap it named is now AC-009/AC-010, both Met.** The report's board screenshot
showed cards titled by their raw file names ("3537.32", "4736.32") — the same defect class as the
original report, on a different title source. Reading `058`'s own landing found the earlier
capture evidence for the currency-column claim (AC-001) was hand-written fixture markup, never
the shipped `BoardRenderer` itself (D1). **AC-009** closes that evidence gap: a
`tools/live/render-assertion-harness.ts` scenario mounts the real renderer with a currency-typed
`titleField` and passes on the unmodified tree — the original claim held, the evidence did not
prove it. **AC-010** answers the operator's actual screenshot: the unset `titleField` default
(the file name) has no `ColumnDef` to inherit a format from at all, so `resolveTitleFieldDisplay`'s
prior fix (scoped to real columns) never reached it. A `titleFormat` field, its own picker row, and
red-first unit/panel coverage landed first; driving the **production** `BoardRenderer` then found a
second, deeper defect neither the unit tests nor any prior fixture could have seen —
`board-renderer.ts`'s `getReferenceRowTitle` discarded a file-title's formatted text for a
`title.isFileTitle`-shortcut that predates this packet. Both reds and both greens are on the real
renderer. **A third gap surfaced by reading the persistence layer rather than any renderer**:
`titleFormat` was never wired into `data-source.ts`'s save/load round trip (AC-011) — a choice
that would have worked for the session and silently reverted on the next vault load, caught by a
new round-trip test rather than by any harness, since the render-assertion harness builds
`ViewConfig` objects directly and never exercises this path. Ten of eleven rows now stand at Met;
AC-008 is unchanged — the operator's alone.
<!-- /ANCHOR:closure -->
