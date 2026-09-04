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

- [ ] T001 Read `005`'s migration target and data-loss list. This phase implements them; it does not re-derive them (`../005-usage-and-migration-audit/implementation-summary.md`)
- [ ] T002 [P] Read `src/data/gallery-migration.ts` and `src/views/toolbar-renderer.ts:1285-1308`, including the comment explaining why withdrawal is not deletion and why the `current` escape hatch exists
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Add the `list` filter to `getViewTypeOptions`, with the `current` escape hatch so a database that already is a list still sees its own type (`src/views/toolbar-renderer.ts`)
- [ ] T004 Write `planListMigration` / `applyListMigration`, modelled on the gallery's: null when there is nothing to do, column set preserved, corrupt column set falling back to schema order (`src/data/list-migration.ts`)
- [ ] T005 Run the migration on open in both hosts, and show the notice once per migrated view (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`)
- [ ] T006 [P] The notice in three locales (`src/i18n.ts`)
- [ ] T007 The failure path: a migration that throws leaves the view as a list and reports once, not per render (`src/data/list-migration.ts`, `src/views/database-view.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 `src/data/list-migration.test.ts`: null, idempotent, columns preserved, corrupt config falls back, failure leaves a list
- [ ] T009 Assert the rendered option set twice — for a table view (no list) and for a list view (list present). The second is the escape hatch and it is the one that gets forgotten
- [ ] T010 Confirm nothing was deleted: `git diff --stat` shows no removal under `src/views/list-renderer.ts` or `tools/`. Then ship it on its own release, before `007` starts
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed
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



