---
title: "Tasks: Shared UI/UX Port [template:level-2/tasks.md]"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "tasks"
  - "shared ui ux port"
  - "tasks core"
importance_tier: "normal"
contextType: "general"
---
# Tasks: Shared UI/UX Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

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

- [ ] T001 Acquire the `styles.css` lane hold in `tools/lane/css-lane.json` before any token edit (`tools/lane/css-lane.json`)
- [ ] T002 Re-verify the 13 `036/research/research.md` §5 citations against current-disk line numbers before implementing; record any drift as a finding (`specs/005-component-surface-system/036-obsidian-pm-ui-harvest/research/research.md`)
- [ ] T003 [P] Confirm `037`/`038`/`039`'s current renderer shape so cross-surface polish (T012) has a real target (`src/views/calendar-timeline-renderer.ts`, `src/views/board-renderer.ts`, `src/views/calendar-renderer.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Observe the current `--db-font-*`/`--db-radius-*`/`--db-border-*`/`--db-surface-*` ladder red against `variables.css:1-9`'s verified roles, then extend it additively (`styles.css:55-85`)
- [ ] T005 Observe `empty-state-renderer.ts`'s current reason/action coverage red against `EmptyState.ts:10-37`, then reconcile the composition (`src/views/empty-state-renderer.ts:25-57, :143-150`)
- [ ] T006 Observe `board-renderer.ts`'s current card icon/tooltip/chip density red against `IconButton.ts:3-31`/`Chip.ts:3-40`, then reconcile through local field renderers (`src/views/board-renderer.ts:750-789, :782-789`)
- [ ] T007 Observe the current reduced-motion coverage red against the reconciled `task-editor.css:1-20, :34-60` motion intent, then extend the media rule without a second sheet cap (`styles.css:706-713`)
- [ ] T008 Observe `SettingsTab.display()`'s current vocabulary red against `settings.ts:54-86, :133-179`, then reconcile settings/`ViewConfig` fields and i18n labels (`src/settings.ts`, `src/data/types.ts:373-`, `src/i18n.ts`)
- [ ] T009 Observe the current `aria-expanded`/`is-open` and roving-keyboard coverage red against `chrome.css:124-170`, then reconcile the active/focus language (`src/views/toolbar-renderer.ts:2111-2114`, `src/views/card-roving-tabindex.ts:68-99`)
- [ ] T010 Add error handling only where a reconciled path can genuinely fail (e.g. a missing i18n key), never a defensive check on something the type system already guarantees
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T011 Confirm `git diff -- src/views/mobile-bottom-sheet.ts` is empty (no edit to the local sheet)
- [ ] T012 [P] Apply reconciled tokens/primitives to surfaces `037`-`039` land and recapture affected screenshots, reading each recapture (`repo-rules/screenshot-currency.md`)
- [ ] T013 Release the `styles.css` lane hold with a `reviewed` array naming every recaptured screenshot (`tools/lane/css-lane.json`)
- [ ] T014 Run `npm run gate`, read `$?` directly, not through a pipe
- [ ] T015 Update documentation: reconcile `spec.md`/`plan.md`/`tasks.md`/`acceptance-criteria.md` to the shipped state and author `implementation-summary.md`
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
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|--------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available (styles.css lane, 036 catalog, 037-039 renderer shape)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented only where a reconciled path can fail
- [ ] CHK-013 [P1] Code follows project patterns (MODULE banners, numbered sections, no ephemeral ids in comments)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete (settings panel, keyboard traversal, phone sheet regression check)
- [ ] CHK-022 [P1] Edge cases tested (missing i18n key fails loudly, exhaustive EmptyStateReason coverage)
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

N/A: this packet is a UI-vocabulary reconciliation, not a bug fix; no finding class applies.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] N/A: no user input surface touched
- [ ] CHK-032 [P1] N/A: no auth/authz surface touched
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate, no ephemeral ids
- [ ] CHK-042 [P2] README updated (if applicable: unlikely for this packet)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 6 | 0/6 |
| P1 Items | 9 | 0/9 |
| P2 Items | 1 | 0/1 |

**Verification Date**: [pending implementation]
<!-- /ANCHOR:summary -->
