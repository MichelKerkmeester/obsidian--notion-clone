---
title: "Implementation Summary: Card Title and Title Formats"
description: "The shared title resolver routes currency/number/date titleFields through their own column's formatter, the board's Title fixed slot opens the existing picker, the cross-surface agreement is locked by a regression test, and the board card's own menu carries the two-tap Card title jump with a hint under Title format (AC-012); the gate is 27 green and AC-008 stays the operator's."
trigger_phrases:
  - "058 implementation summary"
  - "card title format status"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/058-card-title-and-title-formats"
    last_updated_at: "2026-09-09T05:35:00Z"
    last_updated_by: "impl-058-ac012"
    recent_action: "landed and verified AC-012; gate 27 green; AC-008 stays the operator's"
    next_safe_action: "AC-008's operator device read on a released build; then close"
    blockers:
      - "AC-008 is the operator's device read, unclosable here"
    key_files:
      - "src/data/title-field-display.ts"
      - "src/views/board-card-properties-panel.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "src/views/row-menu.ts"
      - "src/views/database-view.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-058-impl"
      parent_session_id: null
    completion_pct: 95
    open_questions:
      - "Does 047's landed Notion harvest change ADR-002's picker-location call once 065 reads it"
    answered_questions:
      - "T015/AC-012 landed 2026-09-09: the 2-tap Card title jump from the board card's own menu, and the Title format row's hint that names what it controls and the chosen-column-keeps-its-own-format condition; the placement is precedented, not referenced (no Notion reference yet, goal D6)"
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
| **Completed** | Code landed and gated, the AC-012 discoverability leg included (2026-09-09). One row stays open: AC-008, the operator's device read, which an agent never ticks |
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

### The discoverability leg (AC-012, 2026-09-09)

The operator reported (R4, 2026-09-08, "Also how to set a board card name + number format? You know
that request i asked about?") on the build that had shipped the feature in 0.0.32 — the rows sat
mid-sheet behind the generic Settings entry, and the one fact that explains the Title format row's
disappearance (a chosen column keeps its own format) lived only in this repository's prose. The fix
is purely additive so it cannot collide with the 071/004 redesign of the same sheet, whose leg is
in flight in a parallel worktree:

- **The two-tap jump** — `row-menu.ts`'s board-only `Card title` row (the board card's own context
  menu, placed beside Rename note, both naming actions) calls the new optional
  `RowMenuActions.openCardTitleSettings`; `DatabaseView` implements it as
  `toggleHeaderPopover("view")` with the settings button as anchor — the element the toolbar's own
  click would have stored, so dismissal focus behaves as the toolbar path taught — then scrolls
  `data-config-row="title-field"` (AC-004's seam, reused; no second picker, ADR-002) under the
  thumb. On hosts without the action the entry does not appear rather than appearing dead, the
  Rename note row's own rule.
- **The hint** — `view-config-panel-renderer.ts`'s `renderSelect` gained an optional trailing
  `hint` (rendered below its own row, the conditional-colour summary's precedent) and the Title
  format row gained the `data-config-row="title-format"` marker plus a hint naming what it controls
  and the chosen-column-keeps-its-own-format condition; `i18n.ts` carries `menu.cardTitle` and
  `viewConfig.titleFormat.hint` in all three locales.

Red first: 3/17 failing across `row-menu.test.ts` (the two-tap path, source-shaped per that suite's
established precedent — OwnedMenu needs a document the suite does not have) and
`view-config-panel-renderer.test.ts` (the hint + marker). Green 17/17; the hint argument alone,
reverted, failed 1/14, restored. Placement precedented, not referenced: `screenshots/notion/` still
does not exist (goal D6), so the card-menu choice follows the packet's own evidence — it is the
affordance a thumb finds, the reasoning the Rename note row already records (ADR-007). The hinted
surface's captures (constructed-board-card-properties, both themes both devices) moved as REAL and
were reviewed by decoded pixel delta across two sampled runs: 194,742/187,600/55,562/55,566 changed
pixels at max channel deltas 229/209/176/196, every one moved in both runs with byte-identical
deltas; `styles.css` untouched, so no css-lane triplet owed — the lane's own hash agrees
(92ad633b2666), and the two movers the lane had not yet been told about were named on the holder's
release entry. `evidence --check-all` 15/15 after re-running `capture-device-parity` and
`sheet-rebuild`; `npm run gate`'s first run FAILed on two stale lanes (operator-list — 071/004's
reworded landing row, regenerated by its own builder — and css-lane — this leg's unnamed movers);
the second run PASS, 27 green, 0 red, exit 0 read from the file. The full battery is the AC-012
Verification cell in `acceptance-criteria.md`; not pushed — a fresh verifier lands it.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red-first on both code legs: T003 measured the resolver's raw output before any edit, and T005's
affordance test was run against a `git stash`-reverted panel before the handler landed. The work
landed as a seven-commit sequence on this worktree: the resolver + Title-slot fix with its tests
(`7b50fed5`), the screenshot scenarios and refreshed corpus (`67856d6a`), the `main.js` rebuild
(`bb529a69`), the live-evidence refresh (`133a7d71`), the css-lane takeover from
`056-board-anytype-parity` (re-based twice through 056 and 057 as each landed the lane first), and two evidence re-stamps from the gate's own lane re-run
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
| `npx vitest run` | exit 0 — 1520/1520 tests across 142 files (rebased onto origin/main) |
| `npm run gate` | exit 0 — 26 green, 0 red |
| `npm run replay` | exit 0 — all 28 results hold, 0 reversed |
| `npm run screenshots:verify` | exit 0 — 588/588 entries match their sources; all ten new PNGs opened and read, both themes |
| After the discoverability leg (2026-09-09), from the final tree | `npx tsc --noEmit` 0; `npm run build` 0; `npx vitest run` 1745/1745; `sheet-grammar`/`render-assertions`/`touch-targets` 0; `verify-placement` 418/420 (2 declared); `evidence --check-all` 15/15; `npm run gate` 27 green, 0 red — see the discoverability leg above; not pushed |

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
