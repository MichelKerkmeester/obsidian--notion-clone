---
title: "Feature Specification: Hide the List and Migrate What Exists"
description: "Withdraw list from every picker and switcher so nobody new reaches it, and migrate existing list views to a table with the same columns on open, with a one-time notice in three locales. Reversible by design, and it ships before anything is deleted."
trigger_phrases:
  - "hide list view"
  - "migrate list to table"
  - "withdraw list from picker"
  - "006 phase 006"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Hide the List and Migrate What Exists

<!-- SPECKIT_LEVEL: 1 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | **Shipped + verified, operator confirmation open.** List is withdrawn from every picker and switcher (`getViewTypeOptions`, the view-config panel, the add-view fixture), and an existing list-typed view migrates to a table on open, once, with a locale-complete notice — proven against a hand-built fixture, the operator's own vault, and a constructed capture through the real `TableRenderer`. `npm run gate` 25/25 green on the landed tree. Open: this phase's own handoff criterion, one operator report against a released build, which is what unblocks `007` |
| **Created** | 2026-09-04 |
| **Branch** | Not yet dispatched |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 4 in the deprecation (folder `006` of `008`) |
| **Predecessor** | 005-usage-and-migration-audit |
| **Successor** | None |
| **Handoff Criteria** | Shipped in a release, migrating real vaults, with one operator report. `007` does not start before that |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the **second deprecation phase** of `006-list-view-deprecation`.

**Scope Boundary**: withdrawal and migration. Nothing is deleted here — the renderer stays, so a
view that has not migrated yet still opens. That is what makes this phase reversible and what makes
`007` safe.

**Dependencies**:
- `005-usage-and-migration-audit` — the migration target and the data-loss list. This phase does not
  re-derive either.
- `src/data/gallery-migration.ts` and `src/views/toolbar-renderer.ts:1297-1308` — the pattern, both
  already in the tree.
- `044-phone-sheet-alignment` asserts that **List view** has left the Add view picker. This phase
  performs the removal that assertion checks; neither blocks the other's start.

**Deliverables**:
- `list` withdrawn from every picker and switcher, with the `current` escape hatch so a database
  that *is* a list still sees its own type.
- A list migration module, modelled on the gallery's.
- A one-time notice in three locales.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

`viewType` is a persisted union written into vault files (`src/data/types.ts:317`), so the list
cannot simply be deleted: every database already configured as one would stop opening. Meanwhile
every picker still offers it — `toolbar-renderer.ts:1297-1308` lists all seven types and filters
only `gallery` — so users keep arriving at a view being retired.

The gallery hit this exactly and solved it, and its reasoning is written in the code: `gallery` is a
value in a persisted union, written into vault files, so removing the renderer would leave every
database already configured as one unable to open. The answer was to withdraw it from the pickers
while keeping it renderable, and migrate on open.

### Purpose

Nobody new reaches the list, everybody already on it lands on a table with the same columns, and
nothing has been deleted yet.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The `getViewTypeOptions` filter, beside the gallery's, with the same `current` escape hatch.
- The Add view sheet's picker and the view switcher.
- A list migration module: `planListMigration` returning null when there is nothing to do, and
  `applyListMigration`.
- A one-time notice, in three locales.
- Unit coverage for the migration, modelled on `gallery-migration.test.ts`.

### Out of Scope
- Deleting anything. The renderer, the lane, the fixtures and the union value all stay — `007` owns
  removal, and it does not start until this has shipped.
- Deciding whether `list` leaves `DatabaseViewType`. Same reason.
- Compensating for a declared loss with a new table feature. `005` names the losses; this phase does
  not close them.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/toolbar-renderer.ts` | Modify | The `getViewTypeOptions` filter, beside the gallery's |
| `src/data/list-migration.ts` | Create | `planListMigration` / `applyListMigration`, modelled on `gallery-migration.ts` |
| `src/data/list-migration.test.ts` | Create | Null when nothing to do, idempotent, column set preserved, corrupt column set falls back to schema order |
| `src/views/database-view.ts` | Modify | Run the migration on open and show the notice once |
| `src/views/embedded-database-renderer.ts` | Modify | The same on the embed path |
| `src/i18n.ts` | Modify | The notice in three locales |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | No picker or switcher offers list, except to a database that already is one. The `current` escape hatch is not optional: without it a list view's own type picker shows a value it does not offer, and the control reads as broken. | The rendered option set for a list view and for a table view, both asserted |
| REQ-002 | A view configured as a list migrates to a table with the same column set, once, on open. | `list-migration.test.ts` plus a vault opened before and after |
| REQ-003 | The migration is idempotent and returns null when there is nothing to do, so the plan carries the idempotence rather than a flag on the config. | A view migrated twice equals a view migrated once, asserted |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | The one-time notice ships in three locales, matching every other user-facing string in this plugin. | `i18n-key-coverage.test.ts` |
| REQ-005 | Nothing is deleted. The renderer, the `list-window` lane, the fixtures and the union value are all untouched, so an un-migrated view still opens and the whole phase reverts by deleting one filter. | `git diff --stat` shows no deletion under `src/views/list-renderer.ts` or `tools/` |
| REQ-006 | A migration that fails leaves the view as a list rather than as an error, and reports once rather than per render. | The failure path asserted |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: a vault carrying a list view opens it as a table with the same columns, with one
  notice, on a released build.
- **SC-002**: no picker offers list to a database that is not already one.
- **SC-003**: the whole phase reverts by deleting one filter and one module, and already-migrated
  views stay tables — a valid state, stated plainly in the release note.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `005`'s migration target and data-loss list | Blocks — migrating without them drops affordances silently | `005` is read-only and short |
| Dependency | `030`'s gallery pattern | None; it is in the tree | Read `gallery-migration.ts` before writing `list-migration.ts` |
| Risk | The migration drops a column set and the user loses their layout | High | REQ-002 preserves the column set; the list already derives its tracks from the table's widths, so this is preservation rather than mapping |
| Risk | The `current` escape hatch is forgotten | Med — a list view's own picker would show a value it does not offer | REQ-001 names it explicitly, and the gallery's code already demonstrates it |
| Risk | Migration runs per render instead of per open | Med | Asserted; the notice firing twice is the visible symptom |
| Risk | This phase and `007` ship together and a rollback has to undo both | Med | The parent's transition rules keep them in separate releases |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- Does the notice offer an undo, the way `030` considered? An undo means keeping the pre-migration
  config somewhere, which is state this packet otherwise avoids. Recorded, not decided.
- Does the migration run on open, or once at load for every view in the database? On open is
  cheaper and leaves un-opened views un-migrated for longer, which is only a problem if `007` starts
  early — and the transition rules already forbid that.
<!-- /ANCHOR:questions -->

---



<!-- SCAFFOLD_VALIDATION_COUNTS:
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
**Given**
**Given**
**Given**
**Given**
**Given**
**Given**
-->
