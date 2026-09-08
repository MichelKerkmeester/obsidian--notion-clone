---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-08T15:25:00Z"
    last_updated_by: "redirect-and-migrate-run"
    recent_action: "Implemented and verified the settings redirect"
    next_safe_action: "Hand off for a release cut; 003 (remove renderers) waits for it"
    blockers:
      - "AC-007 (a released version number) is not this dispatch's to close"
    key_files:
      - "src/main.ts"
      - "src/data/chart-migration.ts"
      - "src/data/calendar-migration.ts"
      - "src/data/timeline-migration.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/views/toolbar-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "src/settings.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "calendar-timeline-chart-008-002-impl"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions:
      - "Chart/calendar close for free at the settings-load sanitizer; timeline routes through a real migration — decision-record.md ADR-001"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 002-settings-redirect-and-migrate |
| **Completed** | 2026-09-08 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Calendar, timeline and chart can no longer be created or selected from any picker in the plugin, and
every one of the 33 existing views `001`'s audit found now opens as a working table or board instead
of whatever the renderer removal in `003` would otherwise have coerced it to silently. This closes
the redirect half of the packet's directive — the renderers themselves ship unchanged until `003`.

### Phase 2: settings-redirect-and-migrate

An operator with a calendar, timeline or chart view configured today keeps seeing it render exactly
as before, because this phase does not touch the renderers. What changes is everywhere a NEW view of
one of the three types could be minted (the toolbar's add-view menu, the view-config panel's type
picker, the plugin-settings default-view dropdown) — all three now withdraw the option, the same way
gallery and list already did. And for the views that already exist, opening one now rewrites its
`viewType` in place, once, to the type `001`'s audit decided is the lossless landing: chart and
calendar become a table (a chart's aggregation has no surviving equivalent; a calendar's date-ordered
records fit a sorted table exactly), and timeline becomes a board (its lane grouping maps onto a
board's own grouping field). Chart and calendar migrate silently at settings-load and announce once,
without an undo, on first open — mirroring the list precedent, since nothing worth carrying gets
lost. Timeline additionally carries its lane field into the board's grouping field and announces with
an undo-carrying toast — mirroring the gallery precedent, since a real field is moving.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/chart-migration.ts` | Created | Pure plan/apply: chart→table, no fields carried |
| `src/data/calendar-migration.ts` | Created | Pure plan/apply: calendar→table, carries `calendarStartDateField`→`sortColumn` |
| `src/data/timeline-migration.ts` | Created | Pure plan/apply: timeline→board, carries `timelineGroupField`→`boardGroupField` |
| `src/data/types.ts` | Modified | Added `chartMigrationNotices`/`calendarMigrationNotices`/`timelineMigrationNotices` to `PluginSettings` |
| `src/main.ts` | Modified | Settings-load sanitizer (both sites): chart's exemption deleted, timeline routed through the real migration |
| `src/views/database-view.ts` | Modified | Added the three `migrate*ViewOnOpen` hooks, wired into `refresh()`'s head |
| `src/views/embedded-database-renderer.ts` | Modified | Same three hooks, wired into `render()`'s head |
| `src/views/toolbar-renderer.ts` | Modified | Add-view/view-type picker filter withdraws all three, keeping each's own escape hatch |
| `src/views/view-config-panel-renderer.ts` | Modified | Same withdrawal in the view-config panel's type picker |
| `src/settings.ts` | Modified | `DEFAULT_VIEW_TYPES` trimmed from five entries to `["table","board"]` |
| `src/i18n.ts` | Modified | Added the three migration notices + `undo.timelineMigration` in en/zh-CN/zh-TW |
| `src/views/calendar-timeline-chart-hide-and-migrate.test.ts` | Created | Source-pin suite mirroring gallery/list's, red-first (12/15 failed pre-edit) |
| `src/data/{chart,calendar,timeline}-migration.test.ts` | Created | Pure plan/apply unit coverage for each migration |
| `src/settings.test.ts`, `src/views/gallery-hide-and-migrate.test.ts` | Modified | Updated two pre-existing suites this phase's picker/sanitizer edits legitimately invalidated |
| `tools/storybook/verify-placement.mjs` | Modified | Three floors bumped for the withdrawn picker rows and the four new owned `Notice` sites |
| `tools/lane/css-lane.json` | Modified | Named the four real content-changed captures in the current release's `reviewed` array |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first: `calendar-timeline-chart-hide-and-migrate.test.ts` was written and run against the
pre-edit tree (12 failed / 3 passed), proving both halves of the directive were still open before any
edit. The three migration modules, the two picker filters, the sanitizer changes and the six on-open
hooks were then implemented to turn every one of those failures green, plus new unit suites for each
migration module. A mutation check (dropping the toolbar's chart filter clause) re-failed two tests
and was reverted to confirm the suite actually watches the surface it claims to. The full verification
battery ran clean (tsc, vitest, build, the live-tools lanes, two screenshot passes with decoded
pixel-delta jitter judged out, evidence freshness, and `npm run gate` at 27 green / 0 red) before any
completion claim. No renderer, harness dispatch, or story registry needed a change beyond the picker
row-count floors `verify-placement.mjs` already tracks — `003` still owns removing the renderers
themselves.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Chart and calendar close their settings-load exemption by deletion; timeline routes through a real migration | Chart/calendar's target (table) equals the sanitizer's bare unknown-type fallback, so a plain coercion loses nothing — the same edge 006 proved safe for list. Timeline's target (board) does not, so a bare coercion would strand the lane grouping before the on-open migration ever ran — the same reasoning 007-002 gave for gallery. Full reasoning: `decision-record.md` ADR-001 |
| `timelineTitleField`/`timelineColorField` stay on the view, uncarried, with no board field invented for them | A board has no per-view title or color field — its title is always the record's own, its coloring comes from the group itself — so there is nowhere lossless to carry them. They are left on the object rather than deleted, matching `gallery-migration.ts`'s precedent for `galleryCardSize` |
| Chart/calendar use a plain `Notice`; timeline uses an undo-carrying toast | Matches the shape their fallback-equality already implies: list (target=fallback) uses a plain `Notice`, gallery (target≠fallback) uses an undo-carrying toast. Chart/calendar have no field-level change worth an undo prompt; timeline's lane→group carry does |
| `parseViewType()` stays open for all three, unconditionally | Closing it at read time would strand the same fields the sanitizer's naive form would have — there is no plan/apply step available at parse time without duplicating the migration into the parser |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Red-first (`calendar-timeline-chart-hide-and-migrate.test.ts` against pre-edit source) | 12 failed / 3 passed |
| Green (same file, post-edit) | 15/15 passed |
| Mutation check (dropped toolbar's chart filter clause, then restored) | 2 tests failed as expected, restored to 15/15 |
| `npx tsc --noEmit` | PASS (exit 0) |
| `npx vitest run` (full suite) | PASS — 1707/1707 (157 files) |
| `npm run build` | PASS (exit 0) |
| `node tools/live/render-assertions.mjs` | PASS (exit 0) |
| `node tools/live/sheet-grammar.mjs` | PASS (exit 0) |
| `node tools/storybook/verify-placement.mjs` | PASS (exit 0) — 413/415, 2 declared-reason reds |
| `npm run screenshots` × 2 | PASS both times (616 captures each); 10 movers judged jitter (pixelHash/layoutHash identical to committed baseline) and reverted; 4 real movers named in the css-lane release |
| `node tools/live/evidence.mjs --check-all` | PASS — 15/15 fresh |
| `node tools/naming/scan-comments.mjs` | PASS — 0 violations |
| `node tools/naming/scan-failing-values.mjs` | PASS — 0 new unrecorded criteria |
| `npm run gate` (foreground, `</dev/null`) | PASS — 27 green / 0 red |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-007 (a released version) is `Unmet`.** This dispatch implements and verifies the redirect on
   this worktree branch; cutting the release that carries it to users is the orchestrator's next
   step, matching the identical gate 007-002 left open for gallery before its own release.
2. **The renderers are unchanged.** `003` still owns deleting the calendar/timeline/chart renderer
   subtrees and archiving them; this phase's redirect is what makes that deletion safe once it runs.
<!-- /ANCHOR:limitations -->

---


