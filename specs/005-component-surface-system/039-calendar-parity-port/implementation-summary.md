---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "039 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-03T10:40:00Z"
    last_updated_by: "leg-a-verified"
    recent_action: "Leg a landed: completion/weekend/empty-state; gate red on stale captures"
    next_safe_action: "Acquire css-lane, land the CSS rule, recapture calendar PNGs (T9), rerun gate (T10)"
    blockers:
      - "Not committed: leg a sits uncommitted in this worktree"
      - "Not operator-confirmed: no one has read a completed milestone on device (parent goal D3)"
      - "npm run gate reports screenshots-fresh RED — 12 calendar PNGs stale against calendar-renderer.ts"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/i18n.ts"
      - "src/views/calendar-renderer.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "039-calendar-parity-port"
      parent_session_id: null
    completion_pct: 64
    open_questions: []
    answered_questions:
      - "Shared date-transaction seam: no module lands in this leg; src/data/ has only calendar-date-time.ts and date-time-format.ts, and 037 has not created one either, so the seam stays documented in spec.md REQ-006 under the collision rule (T7, D6)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 039-calendar-parity-port |
| **Status** | Leg a verified — completion/weekend/empty-state landed; not committed, not operator-confirmed |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

There is no source calendar module to port — `types.ts:4-11` stops `ViewMode` at `table | gantt |
kanban` — so this leg rewrites reference *behavior*, not a file, into the existing
`calendar-renderer.ts` host: completion-aware milestone ordering (REQ-002), date-scale header/weekend
wording intent (REQ-003), and calm empty-state/backlog density (REQ-004).

### Completion-Aware Marking

`isRowCompleted` (`calendar-renderer.ts:2420-2425`) reads the view's checkbox column via
`toBooleanValue` — a checkbox column is the view's only native completion signal, since status
columns carry display colors, not a terminal flag. `is-completed` is applied at all three scales:
month segments (`:385`), month popover events (`:556`), week all-day segments (`:791`), all-day
overflow events (`:865`), timed events (`:992`), and backlog/unscheduled items (`:181`), which share
the same helper as the scheduled path (REQ-002).

### Weekend Treatment

`is-weekend` follows the reference's weekend-header wording intent (`GanttHeaderRenderer.ts:48-75`)
across the month weekday row (`:2072`), month day cells (`:345`), week/day time headers (`:700`),
all-day date buttons (`:755`), all-day columns (`:741`), and time-grid columns (`:930`); header
structure and nav controls are unchanged in shape (REQ-003).

### Backlog Empty Line and Empty-State Copy

The backlog empty path (`:173-177`) renders a calm empty line through `t("calendar.unscheduledEmpty")`
instead of collapsing the whole drawer. `emptyState.noEventsTitle`/`Message` and
`emptyState.noDateFieldTitle`/`Message` move to calmer density language, landed in all three locale
blocks: en (`src/i18n.ts:118,1483-1486`), zh-CN (`:1789,3130-3133`), zh-TW (`:3450,4783-4786`)
(REQ-004).

Kept local, unchanged: scale control, drag/resize, navigation, and the backlog drawer's own
open/collapse behavior — none of REQ-002 to REQ-004 touch those paths.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/calendar-renderer.ts` | Modified | `isRowCompleted` plus `is-completed`/`is-weekend` markers across month/week/day/backlog rendering |
| `src/i18n.ts` | Modified | Calm empty-state and backlog-empty copy in en, zh-CN, zh-TW |
| `src/views/calendar-renderer.test.ts` | Modified | Nine new parity assertions covering completion marking, weekend headers, backlog empty line, and empty-state copy |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The "Calendar parity behaviours" describe block (`calendar-renderer.test.ts:429-630`) was read red
before the renderer edit — `8 failed | 7 passed (15)`, failing exactly on the missing completion
marker, the missing weekend header, the missing backlog empty line, and the old empty-state copy
(`expected 'No dated records' to be 'No events'`) — then green after, `15/15`. The full suite
(`npx vitest run`) reads 786/786 green across 81 files, and `npx tsc --noEmit` reports 0 errors.
`npm run gate` reads 24 of 25 lanes green; `screenshots-fresh` is the one red lane, on the 12 calendar
PNGs whose mtime predates this leg's `calendar-renderer.ts` edit. No `styles.css` rule exists yet for
`is-completed`/`is-weekend`, so a recapture would still read byte-identical to the current PNGs — the
CSS leg that gives these classes a visual treatment, and the recapture that follows it, have not run
(T9, T10 in `tasks.md` stay open).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| No shared date-transaction module created in this leg | `src/data/` holds only `calendar-date-time.ts` and `date-time-format.ts`; `037-timeline-gantt-port` has not landed one either, so the seam stays documented in `spec.md` REQ-006 rather than built, per the collision rule (T7, goal.md D6) |
| Completion and weekend markers ship ahead of their CSS pass | Landing the class attributes first, and the visual rule after, keeps this leg's diff scoped to `calendar-renderer.ts`/`i18n.ts`/tests; captures stay byte-identical until the CSS leg lands |
| Keep-local paths left untouched | Scale control, drag/resize, navigation, and the backlog drawer already meet parity (REQ-005) and sit outside REQ-002 to REQ-004's scope |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Parity suite red-first (`calendar-renderer.test.ts:429-630`) | Red: `8 failed \| 7 passed (15)`, before the renderer edit |
| Parity suite green | `15/15`, after the renderer edit |
| Full unit suite (`npx vitest run`) | PASS — 786/786 tests, 81 files |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 169 problems (156 errors, 13 warnings) — unchanged from HEAD baseline |
| `node tools/naming/scan-comments.mjs` | PASS — 0 missing banners, 0 missing sections, 0 commented-out lines |
| `node tools/naming/scan-failing-values.mjs` | PASS — exit 0, no newly ticked criterion arrived without its failing value |
| `npm run gate` | 24/25 green; `screenshots-fresh` RED — 12 calendar PNGs stale against `calendar-renderer.ts`'s mtime; recapture is T9, gate-pass is T10, both still open |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **`npm run gate` is not green.** `screenshots-fresh` fails on 12 stale calendar PNGs; the source
   changed after the last capture and no recapture has run.
2. **No CSS rule exists yet for `is-completed`/`is-weekend`.** The classes are present in the DOM but
   carry no visual treatment until the CSS leg lands.
3. **Not committed.** This leg's diff (`calendar-renderer.ts`, `i18n.ts`, `calendar-renderer.test.ts`)
   sits uncommitted in this worktree.
4. **Not operator-confirmed.** No one has read a completed milestone as visually distinct on device
   (parent goal D3); this closes only T11.
5. **T6 open.** Move/resize/quick-add have not been re-exercised against the completion styling.
6. **Screenshot recapture and gate-pass open.** T9 and T11 remain open in `tasks.md`; `goal.md` §2's
   completion criteria stay unticked pending those legs.
<!-- /ANCHOR:limitations -->

---
