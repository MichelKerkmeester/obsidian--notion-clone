---
title: "Tasks: Document and Release the List Removal"
description: "Write the README and changelog, check every declared loss item by item, close the two phases fixing a removed view, and ship."
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Document and Release the List Removal

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

- [ ] T001 Read `005`'s declared-loss list. The changelog is checked against it item by item, not summarised from it (`../005-usage-and-migration-audit/implementation-summary.md`)
- [ ] T002 [P] Read `007`'s rollback section, so the changelog's rollback sentence matches what a revert actually does (`../007-remove-renderer-and-harness/plan.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Remove the list view from the README's view list (`README.md`)
- [ ] T004 Write the changelog entry: what was removed, what existing views became, every declared loss by name, and the explicit statement that a revert restores the renderer but does not turn migrated views back into lists
- [ ] T005 [P] Close `033-list-virtualisation` against this decision, with the reason in the document rather than in a commit message (`../../005-component-surface-system/033-list-virtualisation/`)
- [ ] T006 [P] Close `024-list-view-freeze` the same way. Its own AC-6 already reads NOT MET, and its exit signal was already reassigned once — record both facts rather than overwriting them (`../../005-component-surface-system/024-list-view-freeze/`)
- [ ] T007 Decide whether the in-app changelog modal carries the notice. If it does, the string is localised in three locales (`src/i18n.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 Check the changelog against `005`'s declared-loss list item by item, and record the count checked
- [ ] T009 Confirm nothing under `specs/` still plans work on the list view
- [ ] T010 Cut the release and confirm it is installable, per this repository's release cadence
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
- **Declared losses**: `../005-usage-and-migration-audit/`
- **What was removed**: `../007-remove-renderer-and-harness/`
- **Phases to close**: `../../005-component-surface-system/033-list-virtualisation/`, `../../005-component-surface-system/024-list-view-freeze/`
<!-- /ANCHOR:cross-refs -->

---



