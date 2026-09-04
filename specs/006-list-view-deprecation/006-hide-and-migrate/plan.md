---
title: "Implementation Plan: Hide the List and Migrate What Exists"
description: "Copy the gallery deprecation shape: one filter in getViewTypeOptions, one migration module whose plan carries its own idempotence, one notice in three locales. Nothing is deleted, so the whole phase reverts by deleting the filter."
trigger_phrases:
  - "list withdrawal plan"
  - "list migration module"
  - "gallery pattern reuse"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Hide the List and Migrate What Exists

<!-- SPECKIT_LEVEL: 1 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None |
| **Storage** | View config in vault files, rewritten through the existing config-mutation path |
| **Testing** | Vitest, modelled on `src/data/gallery-migration.test.ts` |

### Overview

This is a copy of a pattern that already works, and the copying is deliberate. `030` solved the
persisted-union problem once; re-deriving the solution would risk getting a detail wrong that the
existing code has already been through review on — the `current` escape hatch in particular, which
is easy to omit and produces a control that reads as broken.

Three pieces: a filter, a migration module, a notice. Nothing is deleted, which is what lets this
ship on its own and revert by deletion of the filter.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented
- [ ] Success criteria measurable
- [ ] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing (if applicable)
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Withdraw-then-migrate, copied from `030-gallery-view-deprecation` with `table` as the target instead
of `board`.

### Key Components
- **`getViewTypeOptions` (`src/views/toolbar-renderer.ts:1297-1308`)**: the filter goes beside the
  gallery's, with the same `current` escape hatch — `option.value !== "list" || current === "list"`.
- **`src/data/list-migration.ts`**: `planListMigration(view)` returns null when there is nothing to
  do; `applyListMigration(view, plan)` performs it. Idempotence is a property of the plan, not a
  flag on the config, which is the same shape `gallery-migration.ts` uses.
- **The notice**: shown once per migrated view, in three locales.

### Data Flow

A view config is read on open. If its `viewType` is `list`, `planListMigration` produces a plan
carrying the preserved column set; `applyListMigration` writes `viewType: "table"` back through the
existing `ViewConfigMutation` path, and the notice fires once. A view that never opens is never
migrated, which is fine while the renderer still exists — and it is why `007` waits.
<!-- /ANCHOR:architecture -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`src/data/list-migration.test.ts`, modelled on `gallery-migration.test.ts`: null when there is
nothing to do; idempotent across two applications; the column set preserved; a corrupt column set
falling back to schema order; and the failure path leaving the view as a list rather than as an
error. Plus `i18n-key-coverage.test.ts` for the three locales.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`005-usage-and-migration-audit` for the migration target and the data-loss list — this phase does
not re-derive either. The gallery deprecation's code as the pattern.
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Delete the `getViewTypeOptions` filter and revert `list-migration.ts` and its call sites. Views
already migrated stay tables; that is a valid state rather than a broken one, and the release note
should say so rather than implying the revert undoes it.
<!-- /ANCHOR:rollback -->

---

