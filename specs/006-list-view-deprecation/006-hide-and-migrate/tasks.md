---
title: "Tasks: Hide the List and Migrate What Exists"
description: "Withdraw list from the pickers, write the migration module and its notice, and ship it on its own before anything is deleted."
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Hide the List and Migrate What Exists

<!-- SPECKIT_LEVEL: 1 -->

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

- [x] T001 Read `005`'s migration target and data-loss list. This phase implements them; it does not re-derive them (`../005-usage-and-migration-audit/implementation-summary.md`)
- [x] T002 [P] Read `src/data/gallery-migration.ts` and `src/views/toolbar-renderer.ts:1285-1308`, including the comment explaining why withdrawal is not deletion and why the `current` escape hatch exists
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 Add the `list` filter to `getViewTypeOptions`, with the `current` escape hatch so a database that already is a list still sees its own type (`src/views/toolbar-renderer.ts:1309`; same hatch at `view-config-panel-renderer.ts:430`)
- [x] T004 Write `planListMigration` / `applyListMigration`, modelled on the gallery's: null when there is nothing to do, column set preserved, corrupt column set falling back to schema order (`src/data/list-migration.ts`)
- [x] T005 Run the migration on open in both hosts, and show the notice once per migrated view (`src/views/database-view.ts:2786`, `src/views/embedded-database-renderer.ts:737`; persist `listMigrationNotices` on plugin settings)
- [x] T006 [P] The notice in three locales (`src/i18n.ts:1446` en, `:3155` zhCN, `:4951` zhTW)
- [x] T007 The failure path: a migration that throws leaves the view as a list and reports once, not per render (`src/views/database-view.ts:2808` catch reverts `viewType` to `list`; session set filled before the attempt)
- [x] T011 `settings.ts:79`'s `DEFAULT_VIEW_TYPES` still offered `list` as a default-view choice after the handoff — not caught by T003's picker filter, a separate site the 005 audit already named (`src/settings.ts:79`). RED `settings.test.ts` — `normalises the stored default view to a known type` expected `["table","board","chart","calendar","timeline"]`, got `list` still present; `keeps the list type out of the offered default views` expected `false`, got the dropdown offering it. Fixed by dropping `list` from the array; `normalizeDefaultViewType("list")` now falls back to `"table"`
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 `src/data/list-migration.test.ts`: null, idempotent, columns preserved, corrupt config left for the table fallback, refuse-when-not-list. RED vs HEAD hosts was `list-hide-and-migrate.test.ts:107` `expected '//' to contain 'planListMigration'`
- [x] T009 Option set: table has no list, list still sees its own type. RED `list-hide-and-migrate.test.ts:47` `expected '//' to contain 'option.value !== "list" || current === "list"'` and `:51` the view-config hatch
- [x] T010 Confirm nothing was deleted: `git diff --stat` shows no removal under `src/views/list-renderer.ts` or `tools/`. Ship-before-007 is the parent release gate, not this child's
- [x] T012 The add-view screenshot fixture (`tools/screenshots/scenarios/core.mjs`) still drew the withdrawn List row even after T003 withdrew it from the real picker, and `add-view-popover-layout.test.ts`'s own parity check had been widened to tolerate the drift instead of catching it. RED (reverted the parity-check edit alone): `expected [ 'Table view', ... ] to have a length of 6 but got 7`. Fixed by deleting the List row from the fixture and tightening the assertion back to `not.toContain("List view")` beside the existing `not.toContain("Gallery view")`. This also fixed a floor `verify-placement.mjs` had calibrated for the gallery withdrawal alone: `add view: every action row is the shared row grammar` required `rows.length >= 7`, one too many now that list is a second withdrawn row; dropped to `>= 6` (`tools/storybook/verify-placement.mjs:1747`). RED via `npm run gate`: `placement RED — 391/394, 2 unexpected FAIL` (`(desktop)` and `(phone)`); green after both fixes, `393/394 (394 with 1 pre-existing declared red)`, `npm run gate: PASS — 25 green`
- [x] T013 Real-data proof, beyond both hand-built fixture suites: copied the operator's own vault frontmatter (`Database Testbed/Testbed.md`, `db_view: true`, view id `tb-list`, name "Punch List") into `src/data/list-migration-real-data.test.ts`, transcribed from the real 18-column schema and the real view's `columnOrder`/`filters` (`pinned == "true"`)/`sortColumn: priority`/`listCompactFields: true`. Feeds it through the production `DataSource.parseDatabaseConfig`, then `planListMigration`/`applyListMigration`, then `toViewPayload`+reparse for a full round trip, then confirms `planListMigration` returns `null` on the reparsed (already-table) view. Fault-injected `list-migration.ts` (commented out the `viewType` write) to confirm the suite goes red rather than being vacuously true — it did, 9 of 15 assertions across both list-migration suites failed with the fault present, all green restored
- [x] T014 Constructed capture proof that a migrated config renders through the real `TableRenderer`, not just that the pure function returns `"table"`: a config built `viewType: "list"` (`listCompactFields: true`, the real Punch List shape) run through `planListMigration`/`applyListMigration`, then forked on the migrated `viewType` — `ListRenderer` if still `"list"`, `TableRenderer` otherwise — the same fork `database-view.ts`'s `render()` makes and the only harness scenario that exercises it (`tools/live/render-assertion-harness.ts`, `scenario.migratedFromList`). New `constructed-list-migrated` scenario + `constructed-state-assertions.mjs` case. RED confirmed by fault injection: reverting the same `viewType` write made the marker (`table.db-table` present AND no `.db-list-row`) fail (`migratedListAsTable was false, wanted true`); green restored. Four captures added (`constructed-list-migrated-{desktop,mobile}-{dark,light}.png`), opened and read this session: real table markup (headers, checkboxes, currency, file-link cells), not list rows
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification passed — `npx tsc --noEmit` 0; `npx vitest run` 1091/1091 (106 files) at this phase's own completion, 1101/1101 after reconciling with main; `npm run lint` 172 problems (159 errors, 13 warnings), byte-identical to the stashed-and-restored baseline; `npm run lint:tools` clean; `node tools/naming/scan-comments.mjs` PASS; `npm run screenshots` 548 entries at this phase's own completion, 554 after reconciling with main (past the screenshots-folder split), `npm run screenshots:verify` 0 stale; `npm run gate` PASS — 25 green, 0 red for a declared reason (placement carries 1 pre-existing declared red, unrelated to this work); `node tools/live/render-assertions.mjs` PASS, coverage unchanged at 7 of 22 renderer files
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Audit input**: `../005-usage-and-migration-audit/`
- **Pattern**: `src/data/gallery-migration.ts`, `src/views/toolbar-renderer.ts:1285-1308`
- **Assertion partner**: `../../005-component-surface-system/044-phone-sheet-alignment/` REQ-006
<!-- /ANCHOR:cross-refs -->

---



