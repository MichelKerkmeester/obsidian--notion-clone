---
title: "Implementation Summary: Card Title and Title Formats"
description: "The shared title resolver routes currency/number/date titleFields through their own column's formatter, the board's Title fixed slot opens the existing picker, and the cross-surface agreement is locked by a regression test; the gate is 26 green and AC-008 stays the operator's."
trigger_phrases:
  - "058 implementation summary"
  - "card title format status"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/058-card-title-and-title-formats"
    last_updated_at: "2026-09-06T17:55:00Z"
    last_updated_by: "impl-058"
    recent_action: "landed and verified T003-T010; gate 26 green; AC-008 stays the operator's"
    next_safe_action: "AC-008's operator device read on a released build; then close"
    blockers:
      - "AC-008 is the operator's device read, unclosable here"
    key_files:
      - "src/data/title-field-display.ts"
      - "src/views/board-card-properties-panel.ts"
      - "src/views/view-config-panel-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-058-impl"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Does 047's landed Notion harvest change ADR-002's picker-location call once 065 reads it"
    answered_questions:
      - "T004 landed: currency/number titles format via formatEuroCurrency/formatEuroNumber, date/datetime via the existing date formatters, text/file.* byte-identical"
      - "T005 landed: the Title fixed slot scrolls to and opens the general section's titleField dropdown; the Cover row stays a read-only negative control"
      - "T006 landed: the cross-surface titleField agreement is locked by test for every view but calendar/timeline"
      - "Gate 26 green, replay 28 hold; the css-lane was taken over from 056 after its release"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 058-card-title-and-title-formats |
| **Completed** | Code landed and gated. One row stays open: AC-008, the operator's device read, which an agent never ticks |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

### The title reads its own column's format (`title-field-display.ts`)

`resolveTitleFieldDisplay` stringified every non-file `titleField` unconditionally
(`stringifyValue(value).trim()`), discarding the chosen column's `type` and `numberDisplayStyle` —
a currency column holding `3537.32` titled a card `3537.32`, the defect the operator's phone report
shows as "the name is a number". The non-file branch now calls `formatTitleFieldText`, which looks
up the chosen column's `ColumnDef`, resolves its display type the same way the cell renderer does
(`getColumnDisplayType`), and routes:

- `currency` → `formatEuroCurrency`, `number` → `formatEuroNumber` (mirroring the cell renderer's
  own numeric reading: a real number stays a number, and a value with genuinely nothing to print
  becomes NaN rather than the misleading `0` that `Number(undefined)`/`Number("")` produce);
- `date` → `formatDateValueDisplay`, `datetime` → `formatDateTimeValueDisplay`;
- anything else — including a column reference that no longer resolves — falls through to the
  original `stringifyValue()` path, so a non-numeric value in a numeric-titled column takes the
  cell renderer's own raw-text fallback and never renders "NaN" or throws.

The `file.*` pseudo-field branch above it and every `text`-typed title are byte-identical to the
prior output, pinned by assertions in `title-field-display.test.ts`.

### The Title fixed slot reaches the picker (`board-card-properties-panel.ts`)

The board's Properties sheet rendered the current title choice as a read-only fixed slot with no
way to change it from that surface — where the operator was looking when they filed the report.
Its Title row now carries a click (and Enter/Space) handler that scrolls to and opens the general
section's own `titleField` dropdown — the one canonical picker, found via a
`data-config-row="title-field"` marker `view-config-panel-renderer.ts`'s `renderTitleField` now
sets — rather than a second, competing picker (ADR-002). The dropdown's own `onclick` is invoked
directly because that handler ignores its event argument, which reaches the same open-popover path
a real click would without constructing a synthetic pointer event the test environment has no DOM
to build. The Cover row directly above stays plain read-only text as the negative control, and a
new `db-view-config-row-clickable` class in `styles.css` scopes the pointer cursor and hover/focus
tint to clickable fixed slots only.

### Tests, captures and evidence

- `title-field-display.test.ts` (new, 13 cases across three suites): red-first for the
  currency/number/date formatting (T003 recorded `expected '3537.32' to be '€ 3.537,32'` against
  the unmodified resolver), byte-identical pins for `text`/`file.name`, the non-numeric fallback,
  and the "cross-surface titleField agreement" suite locking the board/record-header/phone-sheet
  agreement for every view type but calendar/timeline (5/5).
- `board-card-properties-panel.test.ts`: the Title row's jump-to-picker, observed red by reverting
  the panel alone (`expected [] to have a length of 1 but got +0`), with the Cover row's
  `onclick`-is-`null` negative control (7/7).
- Three screenshot scenarios per `screenshot-currency.md`: `board-card-title-currency`
  (`tools/screenshots/scenarios/core.mjs`) and `panel-record-detail-title-currency` /
  `panel-record-detail-sheet-title-currency` (`tools/screenshots/scenarios/panels.mjs`), captured
  in both themes (board card and desktop record header also both devices) — ten new PNGs under
  `screenshots/panels/`, each opened and read. The board fixture needed `db-kanban-view` on its
  container for the kanban-scoped chip text-colour rule to apply (a fixture-markup fix, not a
  product defect).
- The eight `tools/live/*.mjs` tools `evidence.mjs` reported stale against the moved
  `styles.css`/`board-card-properties-panel.ts` were re-run (`tools/live/*.json` refreshed), and
  the gate's own lanes re-stamped the remaining seven artifacts. `main.js` was rebuilt against the
  fix.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/title-field-display.ts` | Modify | Route the non-file branch through the chosen column's own formatter |
| `src/data/title-field-display.test.ts` | Create | Red-first formatting coverage, byte-identical pins, cross-surface agreement |
| `src/views/board-card-properties-panel.ts` | Modify | Title fixed slot gains the jump-to-picker affordance |
| `src/views/board-card-properties-panel.test.ts` | Modify | Affordance test with the Cover-row negative control |
| `src/views/view-config-panel-renderer.ts` | Modify | `renderTitleField` sets the `data-config-row="title-field"` locator |
| `styles.css` | Modify | `db-view-config-row-clickable` cursor/hover/focus styling |
| `tools/screenshots/scenarios/core.mjs`, `panels.mjs` | Modify | The three currency-titled scenarios |
| `screenshots/panels/*.png`, `manifest.json`, `README.md` | Create/Modify | Ten new captures and the refreshed corpus manifest |
| `tools/live/*.json` | Modify | Evidence re-run/re-stamped against the moved sources |
| `main.js` | Rebuild | Production bundle carrying the fix |

`board-renderer.ts` and `record-detail-panel.ts` were deliberately not edited — they read the
resolver's output unchanged, and the zero-line diff is the FIX ADDENDUM's own verification.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red-first on both code legs: T003 measured the resolver's raw output before any edit, and T005's
affordance test was run against a `git stash`-reverted panel before the handler landed. The work
landed as a seven-commit sequence on this worktree: the resolver + Title-slot fix with its tests
(`7b50fed5`), the screenshot scenarios and refreshed corpus (`67856d6a`), the `main.js` rebuild
(`bb529a69`), the live-evidence refresh (`133a7d71`), the css-lane takeover from
`057-calendar-anytype-parity` (`5b0c6a0b`, re-based from the `056` hold), and two evidence re-stamps from the gate's own lane re-run
and the T009 replay (`149aa5ed`, `f10cbf77`).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Recorded in `decision-record.md` (ADR-001 through ADR-004), not duplicated here | ADR-001 states the shipped precedence, ADR-002 keeps one picker with two entry points, ADR-003 makes the title inherit its column's format with no independent title format setting, ADR-004 tests the already-correct cross-surface agreement instead of re-wiring it |
| The gate stayed at its existing-lanes-only 26 lanes; the new coverage is unit/panel tests observed red before green | Corrected premise, recorded in `acceptance-criteria.md` AC-007 and `tasks.md` T009 |
| `calendar-timeline-model.ts` and `row-pipeline.ts` receive the format fix by sharing the resolver | D5 excludes building anything new for calendar/timeline, not sharing the one resolver's fix |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 (esbuild production) |
| `npx vitest run` | exit 0 — 1518/1518 tests across 142 files (rebased onto origin/main) |
| `npm run gate` | exit 0 — 26 green, 0 red |
| `npm run replay` | exit 0 — all 28 results hold, 0 reversed |
| `npm run screenshots:verify` | exit 0 — 588/588 entries match their sources; all ten new PNGs opened and read, both themes |

Re-run from the final tree at landing; exit codes read directly, no pipe.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-008 is open and is the operator's.** Only the operator's own phone read — a currency-titled
   card rendering `€ 3.537,32` and a changeable card name on a released build — closes it (parent
   D3). Shipped and verified are not the same state as operator-confirmed.
2. **A title never carries an independent format** (ADR-003). Changing what the title shows means
   changing the source column's own format; if a title-specific format is ever wanted, it is a new
   ADR superseding ADR-003, not a silent addition.
3. **Calendar and timeline titles are untouched** (`calendarTitleField`/`timelineTitleField`, D5);
   `057` owns any calendar-title parity question.
4. **Two pre-existing lint findings** in the touched files (an unused `setIcon`/`setTooltip` import
   in `board-card-properties-panel.ts`, an `element.style.gridColumn` rule in
   `view-config-panel-renderer.ts`) predate this packet and are unchanged by it — zero new findings
   from this packet's own edits (`tasks.md` CHK-010).
5. **ADR-002's revisit is queued, not open here**: `047`'s Notion harvest landed after this packet's
   decisions were frozen; `065-notion-record-refinement` reads it and only the operator moves any
   resulting Proposed ADR to Accepted.
<!-- /ANCHOR:limitations -->

---
