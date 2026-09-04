---
title: "Implementation Plan: List View Deprecation"
description: "Four children in a strict order, following the gallery deprecation's withdraw-then-migrate-then-remove pattern: audit what uses list, stop offering it and migrate what exists, remove the renderer with every measurement of it, then document and release."
trigger_phrases:
  - "006 list deprecation plan"
  - "list retirement order"
  - "withdraw then migrate then remove"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: List View Deprecation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

> The plan this file used to carry — five phases converting the list into a ClickUp-style grid — is
> superseded. It is preserved in
> [`superseded-clickup-direction.md`](superseded-clickup-direction.md) §4 and in the five children
> numbered `000`-`004`, whose own `plan.md` files are untouched.

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None — direct DOM |
| **Storage** | View config in vault files. `viewType` is a persisted union (`src/data/types.ts:317`), which is the whole reason this is four phases and not one deletion |
| **Testing** | Vitest for the migration; `npm run gate` for the lane and ratchet changes; a device pass for the migrated vault |

### Overview

A view type cannot simply be deleted here, because it is written into the user's files. The gallery
deprecation already solved that and its answer is reused: **withdraw the value from every picker
while keeping it renderable, migrate what exists on open, and only then remove the renderer.** Each
of those is a stopping point where the product is coherent, which is what makes the order
non-negotiable rather than merely preferred.

The one thing this deprecation has that the gallery's did not is a measurement surface. The list has
its own gate lane (`tools/gate.mjs:89` → `tools/live/list-window.mjs`), its own bench entry in
`renderer-coverage.json`, its own fixtures and constructed scenarios, its own replay claims and its
own unit specs. Removing the renderer and leaving any of those is worse than doing nothing: the gate
would go on reporting green for a view nobody can open.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] The four measured facts in `spec.md` §2 are cited by file:line, not paraphrased
- [ ] The gallery precedent is read, including what it left unfinished
- [ ] The migration target is decided by `005`, not assumed by `006`

### Definition of Done
- [ ] Every child's acceptance criteria met
- [ ] `npm run gate` exits 0 with the `list-window` lane **removed**, not skipped, `$?` read directly
- [ ] `renderer-coverage.json` carries the new floor and the reason beside it
- [ ] `033-list-virtualisation` and `024-list-view-freeze` closed against this decision
- [ ] The superseded children and root documents still carry their content
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Withdraw, migrate, remove — `030-gallery-view-deprecation`'s shape, with `table` as the target.

The pattern's value is that each step is independently shippable and independently revertible.
Withdrawal is one filter in `getViewTypeOptions` and is undone by deleting it. Migration is a
config rewrite guarded by an idempotence check. Removal is the only irreversible step, and it comes
last, after a released build has already migrated the vaults.

### Key Components
- **`getViewTypeOptions` (`src/views/toolbar-renderer.ts:1297-1308`)**: the withdrawal point. The
  gallery's filter is already there, with a comment explaining exactly why withdrawal is not
  deletion. The list's filter goes beside it and follows the same `current` escape hatch, so a
  database that *is* a list still sees its own type in its picker.
- **A list migration module, modelled on `src/data/gallery-migration.ts`**: `planListMigration` and
  `applyListMigration`, returning null when there is nothing to do, so idempotence is a property of
  the plan rather than a flag.
- **`src/views/list-renderer.ts` (1,173 lines)**: removed by `007`, together with its share of
  `card-field-renderer.ts` — which is shared with board and gallery cards and therefore stays.
- **The measurement surface**: `tools/live/list-window.mjs` + `list-window-harness.ts` +
  `list-window.json`, the `list-render-bench` entry in `renderer-coverage.json`, list fixtures in
  `tools/screenshots/scenarios.mjs`, `list`/`list-sparse` in `constructed-scenarios.mjs`, list
  claims in `tools/live/replay.mjs`, and `list-reservation.test.ts` / `list-row-contracts.test.ts`.

### Data Flow

A view config carrying `viewType: "list"` is read on open. After `006`, it is planned, migrated to
`table` with its column set preserved, written back through the existing config-mutation path, and a
one-time notice is shown. After `007`, no config can name `list` through any UI, and whether the
union still accepts the value is `007`'s recorded decision.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

| # | Child | Level | What it settles |
|---|---|---|---|
| 1 | `005-usage-and-migration-audit/` | 1 (`recommend-level.sh --loc 150 --files 4` → 24/100, Level 0; floored to 1 because the packet floor is 1 and the output is evidence a later child depends on) | Which vaults and views use list; what the table migration preserves; which list-only affordances are a declared loss |
| 2 | `006-hide-and-migrate/` | 1 (`--loc 250 --files 9 --db` → 39/100) | List withdrawn from every picker; existing list views migrated to table with a one-time notice in three locales |
| 3 | `007-remove-renderer-and-harness/` | 3 (`--loc 1200 --files 20 --architectural` → 72/100) | Renderer, lane, harness, fixtures, bench, claims and specs removed together; ratchets re-baselined; captures pruned; the union's fate decided |
| 4 | `008-docs-and-release/` | 1 (`--loc 80 --files 5` → 18/100, Level 0; floored to 1) | README, changelog, and the release carrying the removal |

The order is a data-safety ordering, not a convenience. `007` before `006` strands saved views;
`006` before `005` migrates without knowing what it drops.

Follow each child's own `tasks.md` for task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `planListMigration` / `applyListMigration`: null when nothing to do, idempotent, column set preserved, corrupt column set falls back to schema order | Vitest, modelled on `gallery-migration.test.ts` |
| Integration | The gate from the final state, with the lane removed rather than skipped and the ratchet at its new floor | `npm run gate`, `$?` read directly |
| Manual | A vault carrying a list view, opened on the operator's device | Device |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `030-gallery-view-deprecation` | Internal | Green — the pattern and its code are both in the tree | None; it is a precedent, not a blocker |
| `styles.css` serialized lane | Internal | Yellow — contended | `007` queues; the other three children do not touch it |
| `044-phone-sheet-alignment` | Internal | Yellow — opened | None. `044` asserts the Add view picker's absence; `006` performs the removal |
| `033-list-virtualisation`, `024-list-view-freeze` | Internal | Open against a view being removed | REQ-007 closes both; neither blocks a child |
| `card-field-renderer.ts` shared use | Internal | Green | `007` separates the list's use from the board's and gallery's rather than deleting the module |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a vault fails to open a migrated view, or the gate goes red with the lane removed.
- **Procedure**: `006` is undone by deleting one filter and reverting the migration module; views
  already migrated stay as tables, which is a valid state rather than a broken one. `007` is the
  irreversible step and is reverted by restoring the renderer commit — which is why it ships in its
  own release, after `006` has been in a released build.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
005 audit ──► 006 hide + migrate ──► 007 remove renderer + harness ──► 008 docs + release
   (read-only)   (reversible, ships alone)   (irreversible, own release)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 005 | None | 006 |
| 006 | 005's migration target and data-loss list | 007 |
| 007 | 006 shipped and migrating in a released build | 008 |
| 008 | 007 | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| 005 audit | Low | 2-3 hours |
| 006 hide and migrate | Med | 4-6 hours |
| 007 remove renderer and harness | High | 10-14 hours, most of it the measurement surface rather than the renderer |
| 008 docs and release | Low | 1-2 hours |
| **Total** | | **17-25 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] The migration is idempotent and proven so, before `006` ships
- [ ] `006` and `007` are separate releases
- [ ] The ratchet's new floor and its reason are written in the same commit that lowers it

### Rollback Procedure
1. `006`: delete the picker filter and revert the migration module. Already-migrated views stay
   tables; that is a valid state and the release note should say so plainly.
2. `007`: revert the removal commit. The lane, bench and fixtures come back with the renderer,
   because they were removed together — which is REQ-003's practical payoff.
3. Re-run `npm run gate` and read `$?` directly.

### Data Reversal
- **Has data migrations?** Yes — view configs are rewritten in vault files.
- **Reversal procedure**: there is none, and saying so is the point. A migrated view is a table and
  stays one. That is why `005` runs first: the migration must not drop anything the audit has not
  already declared as a loss.
<!-- /ANCHOR:enhanced-rollback -->

---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐   ┌────────────────────┐   ┌────────────────────────┐   ┌──────────────┐
│ 005 audit    │──►│ 006 hide + migrate │──►│ 007 remove renderer    │──►│ 008 release  │
│ read-only    │   │ reversible         │   │ irreversible           │   │              │
└──────────────┘   └────────────────────┘   └────────────────────────┘   └──────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| 005 audit | None | Migration target, data-loss list | 006 |
| 006 hide + migrate | 005 | A shipped build that migrates | 007 |
| 007 remove | 006 in a release | A tree with no list renderer and no lane measuring one | 008 |
| 008 docs + release | 007 | The release note and changelog | None |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **005 audit** - 2-3 hours - CRITICAL. Everything after it migrates or deletes on its answers.
2. **006 hide and migrate** - 4-6 hours - CRITICAL, and it must reach a release before `007` starts.
3. **007 remove renderer and harness** - 10-14 hours - CRITICAL.

**Total Critical Path**: 16-23 hours plus one release cycle between `006` and `007`.

**Parallel Opportunities**:
- `008`'s changelog and README drafting can start during `007`.
- Closing `033-list-virtualisation` and `024-list-view-freeze` (REQ-007) is independent of all four.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Audit complete | The migration target is decided and every list-only affordance is either mapped or declared lost | `005` |
| M2 | Nobody new reaches the list | No picker offers it; existing views migrate on open with a notice | `006`, in a release |
| M3 | Nothing measures it | Renderer, lane, bench, fixtures, claims and specs gone together; `npm run gate` exits 0 | `007` |
| M4 | Documented and shipped | README and changelog record the removal and the migration | `008` |
<!-- /ANCHOR:milestones -->

---
