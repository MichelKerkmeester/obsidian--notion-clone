---
title: "Implementation Summary: Hide the List and Migrate What Exists"
description: "List is withdrawn from every picker and switcher, with the current escape hatch. An existing list-typed view migrates to a table on open, once, with a one-time notice in three locales, proven against a hand-built fixture, the operator's own vault, and a constructed capture that mounts the real TableRenderer."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list withdrawal summary"
  - "006 phase 006 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/006-hide-and-migrate"
    last_updated_at: "2026-09-05T00:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Closed settings.ts and add-view fixture gaps; added real-data and constructed-capture proof"
    next_safe_action: "Release on its own; gather one operator report before 007 starts"
    blockers: []
    key_files:
      - "src/data/list-migration.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/views/toolbar-renderer.ts"
      - "src/settings.ts"
      - "tools/screenshots/scenarios/core.mjs"
      - "tools/live/render-assertion-harness.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-006-summary"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "Notice undo: spec.md §7 still 'recorded, not decided'. Shipped uses scheduleConfigSave's generic undo label, not a dedicated one like the gallery's."
    answered_questions:
      - "Handoff's four claims (tsc 0, vitest 1085, lint 172=172, comments 0) independently reproduced before any new edit."
      - "Both named not-done items (settings.ts default-view, add-view fixture's List row) were real gaps, fixed red-first."
      - "The escape hatch cannot be used to re-select list after migration: applyListMigration mutates config.viewType to \"table\" in place, so getViewTypeOptions's current === \"list\" branch no longer matches on the next render."
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 006-hide-and-migrate |
| **Completed** | 2026-09-05 |
| **Level** | 1 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Two external workers (devin, then Grok via cursor) delivered the shape this phase's `plan.md`
specified — the picker filter, the migration module, the notice — and left it uncommitted with
verbatim red-first claims. This session verified every claim, closed the two gaps the handoff itself
named as not-done, and added the proof the handoff's own test suite could not: that the migration
works against a view this plugin did not manufacture as a test fixture.

### Verified as claimed

- `npx tsc --noEmit`: 0 errors.
- `npx vitest run`: 1085/1085 passing, matching the handoff's number exactly, before any new test
  was added.
- `npm run lint`: 172 problems (159 errors, 13 warnings) — stashed the entire diff and reran lint
  against pristine HEAD to confirm the count is the baseline, not a coincidence.
- `node tools/naming/scan-comments.mjs`: PASS, 0 commented-out lines, 0 missing banners.
- The migration module's shape matches `030`'s gallery precedent: `planListMigration` returns
  `null` or a plan, `applyListMigration` writes only `viewType`, both hosts (`database-view.ts`,
  `embedded-database-renderer.ts`) run it on open with a per-session attempt guard and a
  persisted-once notice.

### Two gaps the handoff named and left open, both closed

1. **`src/settings.ts:79`** — `DEFAULT_VIEW_TYPES` still listed `list` as an offered default-view
   choice, a site `005`'s audit had already named separately from the picker filter. Dropped it
   from the array (`normalizeDefaultViewType` now falls back an unrecognised or withdrawn stored
   value to `"table"`, matching how `"gallery"` already normalises).
2. **The add-view screenshot fixture** (`tools/screenshots/scenarios/core.mjs`) still drew the
   withdrawn List row, and its own parity test (`add-view-popover-layout.test.ts`) had been widened
   to tolerate the drift ("the capture surface is pruned with the renderer it photographs, not
   before it") rather than catch it. Deleted the row, tightened the assertion back to
   `not.toContain("List view")`. This uncovered a second, downstream gap: `verify-placement.mjs`'s
   add-view row-count floor (`rows.length >= 7`) had been calibrated for the gallery withdrawal
   alone and was one too high now that list is a second withdrawn row — `npm run gate` went RED on
   `placement` (391/394) until the floor followed the surface down to 6, the same reasoning its own
   comment already stated for gallery.

### The escape hatch, checked rather than assumed

A database currently configured as a list still sees `list` in its own type picker
(`option.value !== "list" || current === "list"`), which is required — otherwise the control shows
a value it does not offer. Checked whether this lets a user re-select list AFTER migration: it does
not, because `applyListMigration` mutates `view.viewType` to `"table"` in place, so on the very next
render `current` is `"table"`, not `"list"`, and the option drops out of the filtered list exactly
like every other withdrawn type. There is no path back to `list` short of hand-editing the vault
file.

### Real-data proof

Copied the operator's own vault file (`~/…/Database Testbed/Testbed.md`, read-only source) to a
scratch directory and transcribed its `db_view` frontmatter's real 18-column schema and its
`tb-list`/"Punch List" view — `sortColumn: priority`, `filters: [{field: pinned, op: eq, value:
"true"}]`, `listCompactFields: true`, an 18-key `columnOrder` — into
`src/data/list-migration-real-data.test.ts`. Fed through the production `DataSource.
parseDatabaseConfig`, then `planListMigration`/`applyListMigration`, then `toViewPayload` and a
reparse for a full round trip, then confirmed a second `planListMigration` call on the reparsed
(already-table) view returns `null`. Fault-injected `list-migration.ts` (commented out the
`viewType` write) to prove the suite is not vacuously true: 9 of 15 assertions across both
list-migration test files failed with the fault present; all restored green.

### Constructed-capture proof

The pure unit tests prove `planListMigration`/`applyListMigration` return the right values; they
cannot prove a migrated config renders correctly through the actual `TableRenderer`, or that a
migration which failed to flip `viewType` would be caught anywhere but a unit assertion. Added a
`migratedFromList` option to `render-assertion-harness.ts`'s table branch: builds a config as
`viewType: "list"` (with `listCompactFields: true`, the real Punch List shape), runs it through the
production plan/apply pair, then forks on the migrated `viewType` — `ListRenderer` if it is still
`"list"`, `TableRenderer` otherwise — the same fork `database-view.ts`'s `render()` makes, which is
otherwise never exercised by this harness (every other scenario picks its renderer straight off
`scenario.renderer`). Fault-injected the same `viewType` write to confirm the new
`constructed-list-migrated` marker (`table.db-table` present, `.db-list-row` absent) goes red when
the fork would have picked the wrong renderer, then confirmed green. Four captures added and opened
this session, both themes and devices: real table markup — headers, checkboxes, currency, file-link
cells — not list rows.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/list-migration.ts` | Create | `planListMigration`/`applyListMigration`, modelled on the gallery's |
| `src/data/list-migration.test.ts` | Create | Unit coverage: null, idempotent, columns preserved, corrupt-config fallback, failure leaves a list |
| `src/data/list-migration-real-data.test.ts` | Create | Real-vault proof against the operator's own "Punch List" view |
| `src/views/list-hide-and-migrate.test.ts` | Create | Source-level assertions: both pickers, both minters, both dispatches, both migration hooks |
| `src/views/toolbar-renderer.ts` | Modify | `getViewTypeOptions` filter, beside the gallery's |
| `src/views/view-config-panel-renderer.ts` | Modify | Same filter, view-config panel's type picker |
| `src/views/database-view.ts` | Modify | `migrateListViewOnOpen`, run from `refresh()`; list dispatch branch removed |
| `src/views/embedded-database-renderer.ts` | Modify | Same migration hook, embed path; list dispatch branch removed |
| `src/main.ts` | Modify | Settings-load sanitizer and `.base` importer no longer mint `list` |
| `src/settings.ts` | Modify | `DEFAULT_VIEW_TYPES` drops `list` |
| `src/data/types.ts` | Modify | `PluginSettings.listMigrationNotices` |
| `src/i18n.ts` | Modify | `notice.listMigrated` in en/zhCN/zhTW |
| `tools/screenshots/scenarios/core.mjs` | Modify | Add-view fixture no longer draws the List row |
| `tools/storybook/verify-placement.mjs` | Modify | Add-view row-count floor 7 → 6 |
| `tools/live/render-assertion-harness.ts` | Modify | `migratedFromList` scenario option |
| `tools/live/constructed-state-assertions.mjs` | Modify | `constructed-list-migrated` red-first case |
| `tools/screenshots/constructed-scenarios.mjs` | Modify | Capturable `constructed-list-migrated` scenario |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Read the handoff's claims, then re-derived rather than trusted each one: ran the four commands
myself, read the diff against the gallery precedent, and read the two "not-done" items as real gaps
rather than polish. Fixed both red-first, discovered a third (downstream) gap in the process
(`verify-placement.mjs`'s floor), and added the two proofs the plan's own testing strategy did not
ask for but the packet's stated purpose — "migrating real vaults, with one operator report" — needed
before a release claim was honest: a real vault's own view, and the real renderer the migrated
config is handed to.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep the handoff's migration module as-is | It matches the gallery precedent's shape exactly — plan carries idempotence, apply writes only `viewType`, the list's own fields (`listCompactFields`) are left on the view rather than stripped — and re-deriving it would have risked losing the one detail (the `current` escape hatch) that is easy to omit |
| Fix `settings.ts` and the add-view fixture in this phase rather than defer to `007` | Both are picker-surface gaps `005`'s own audit and this phase's own scope already named; leaving them would ship the withdrawal incompletely under this phase's own success criteria (SC-002: "no picker offers list to a database that is not already one") |
| Add real-data and constructed-capture proof beyond what `plan.md`'s testing strategy asked for | The packet's own handoff criteria is "shipped in a release, migrating real vaults" — a suite built entirely from hand-typed fixtures cannot support that claim, and the constructed harness never exercises the viewType-driven renderer fork this migration depends on |
| Leave the undo-label question open | `spec.md` §7 records it as "recorded, not decided." The shipped behaviour (a generic `undo.viewConfig` label via `scheduleConfigSave`'s existing fallback, rather than a dedicated `undo.listMigration` label) is a working default, not a defect, and closing the open question was never this phase's requirement |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 errors |
| `npx vitest run` | 1091/1091 passing (106 files) at this phase's own completion — 1085 from the handoff, +6 from this session (real-data suite ×5, settings default-view ×1); 1101/1101 after reconciling with main (933308a5, past the screenshots-folder split) |
| `npm run lint` | 172 problems (159 errors, 13 warnings), byte-identical to the stash-and-restore baseline |
| `npm run lint:tools` | Clean |
| `node tools/naming/scan-comments.mjs` | PASS |
| `npm run screenshots` | 548 entries at this phase's own completion; 554 after reconciling with main |
| `npm run screenshots:verify` | 0 stale |
| `npm run gate` | PASS — 25 green, 0 red for a declared reason |
| `node tools/live/render-assertions.mjs` | PASS; renderer coverage unchanged at 7 of 22 |
| Real-data test | `src/data/list-migration-real-data.test.ts`, 5 tests, against the operator's own "Punch List" view |
| Fault-injection sanity | Confirmed both the real-data suite and the constructed-capture marker go red when `applyListMigration`'s `viewType` write is disabled |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Whether the notice offers an undo remains undecided**, as `spec.md` §7 recorded before this
   phase started. The shipped migration relies on `scheduleConfigSave`'s existing generic-label
   fallback for its undo entry rather than a dedicated `undo.listMigration` label; functional, less
   legible than the gallery's dedicated label, not required to close by this phase's requirements.
2. **A view that never opens is never migrated**, same as the gallery. `007` waits for a release and
   an operator report before removing the renderer, which is what makes this acceptable.
3. **The constructed-capture proof exercises one viewType fork in isolation**, not the full
   `DatabaseView`/`EmbeddedDatabaseRenderer` host (Notice, persisted-notice-id bookkeeping, undo
   labelling) — those remain covered by the source-level assertions in
   `list-hide-and-migrate.test.ts` and the unit tests in `list-migration.test.ts`, not by a browser
   capture. This is a structural property of `render-assertion-harness.ts`, which routes every
   scenario by `scenario.renderer` rather than by `config.viewType` for every other view type too.
<!-- /ANCHOR:limitations -->

---
