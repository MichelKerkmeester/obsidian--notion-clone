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

- [x] T001 Acquire the `styles.css` lane hold in `tools/lane/css-lane.json` before any token edit (evidence: re-acquired against `038`'s release after the rebase at `tools/lane/css-lane.json:1263-1270`, released at `:1271-1306` naming 18 reviewed captures; `node tools/lane/check-lane.mjs` exit 0. The external leg's earlier hold recorded 14e1a5a8e3b6 as its baseline, a stylesheet that predated the board landing, and was dropped in the rebase)
- [x] T002 Re-verify the 13 `036/research/research.md` §5 citations against current-disk line numbers before implementing; no citation drift found (evidence: `specs/005-component-surface-system/036-obsidian-pm-ui-harvest/research/research.md:289-320, :322-340`)
- [x] T003 [P] Confirm `037`/`038`/`039`'s current renderer shape so cross-surface polish (T012) has a real target (evidence: `src/views/calendar-timeline-renderer.ts:908-986`, `src/views/board-renderer.ts:533-585, :890-1052`, `src/views/calendar-renderer.ts:75-92`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Extend the `--db-font-*`/`--db-radius-*`/`--db-border-*`/`--db-surface-*` ladder additively against `variables.css:1-9`'s verified roles (evidence: four semantic roles at `styles.css:100-103`, each aliasing a host theme variable. No red is recorded and none is claimed: the reference declares only `--pm-ghost-border` and `--pm-shadow-ambient` and reaches for host variables directly for everything else, so these four are documented local extensions under REQ-002 rather than reference citations, and adding a name that changes no value has nothing to fail first. Two further roles the external leg added, `--db-text-tertiary` and `--db-border-control`, were measured at 0 uses in the stylesheet and dropped rather than shipped dead)
- [x] T005 Observe `empty-state-renderer.ts`'s current reason/action coverage red against `EmptyState.ts:10-37`, then reconcile the composition (evidence: red first — `expected 'div' to be 'p'` on `src/views/empty-state-renderer.test.ts:160` before the element change; body element now `p` at `src/views/empty-state-renderer.ts:275-281`; copy catalog rows renamed to the reference `body` term at `:143-204`; composition pinned by `src/views/empty-state-renderer.test.ts:148-164`) (`src/views/empty-state-renderer.ts:25-57, :143-150`)
- [x] T006 Reconcile `board-renderer.ts`'s card icon/tooltip/chip density against `IconButton.ts:3-31`/`Chip.ts:3-40` through local field renderers (evidence: satisfied in-tree by `038-board-kanban-port` at a6fcd31, not authored here — `src/views/board-renderer.ts:890-1052` and the board section of `styles.css:8894-9500` carry the reconciled density. The external leg restyled the same section independently while this branch predated a6fcd31; the rebase kept `038`'s version whole and this packet's diff recorded 0 changed lines in the board region)
- [x] T007 Check the reduced-motion coverage against the reconciled `task-editor.css:1-20, :34-60` motion intent and extend the media rule without a second sheet cap (evidence: coverage was already complete, so nothing was extended — `styles.css:710-726` names `.db-overlay-enter`, both bottom-sheet arms, `.db-menu-item` and the scrim's animation, and `:871-884` reduces every descendant of the container; no second sheet height cap exists anywhere. An `animation: none` reset for `.db-overlay-enter` that the external leg added was dropped: that class carries a transition and measured 0 animation declarations, so the rule was a no-op. A narrower gap was left standing and recorded rather than closed — an owned menu is a `.db-surface` without the container class, so its descendants keep their transitions. Closed in a follow-up pass: `.db-surface` now leads the container-wide block's selector list at `styles.css:883-886`, red-first via `src/views/owned-menu-reduced-motion.test.ts`; see `goal.md` AC-006 and `implementation-summary.md` known-limitation 4)
- [x] T008 Observe `SettingsTab.display()`'s current vocabulary red against `settings.ts:54-86, :133-179`, then reconcile settings/`ViewConfig` fields and i18n labels (evidence: red first — four `expected undefined to be defined` asserts reported across `src/settings.test.ts`'s `SettingsTab reconciled view vocabulary` block before the default-view row existed (two confirmed statically on the `row` lookup at `:319`, `:339`); default-view row at `src/settings.ts:159-175`; `DEFAULT_VIEW_TYPES`/`normalizeDefaultViewType` at `:72-85`; `PluginSettings.defaultViewType` at `src/data/types.ts:666-667`; labels in all three locale blocks at `src/i18n.ts:1120-1121, :2795-2796, :4417-4418`; pinned by `src/settings.test.ts:306-349`. Board/timeline display defaults deferred to `037`/`038` per the spec's open question — no consumer exists in-tree yet) (`src/settings.ts`, `src/data/types.ts:373-`, `src/i18n.ts`)
- [x] T009 Observe the current `aria-expanded`/`is-open` and roving-keyboard coverage red against `chrome.css:124-170`, then reconcile the active/focus language (evidence: red first — a source-string contain failure on `src/views/toolbar-renderer.test.ts:41`'s `aria-pressed` assertion before the attribute existed; display-width toggle now announces its state via `aria-pressed` at `src/views/toolbar-renderer.ts:1557-1558`; disclosure helper stays on `aria-expanded`/`is-open` at `:2111-2114`; roving 2D language confirmed by `src/views/card-roving-tabindex.test.ts:186-205` — no controller change needed; pinned by `src/views/toolbar-renderer.test.ts:33-47` and `src/views/accessibility-defects.test.ts:159-166`) (`src/views/toolbar-renderer.ts:2111-2114`, `src/views/card-roving-tabindex.ts:68-99`)
- [x] T010 No new failure-prone branch was introduced; the reconciled controls use existing typed i18n keys and retain the renderer's existing optional-action handling (evidence: `src/views/calendar-timeline-renderer.ts:618-648, :918-987`, `src/i18n.ts:838-839, :1087, :2503-2504, :2762, :4135-4136, :4385`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 Confirm `git diff -- src/views/mobile-bottom-sheet.ts` is empty (no edit to the local sheet; verified empty on this worktree)
- [x] T012 [P] Apply reconciled tokens/primitives to surfaces `037`-`039` land and recapture affected screenshots, reading each recapture (evidence: the timeline event bar stops being a `button` wrapping a `span[role=button]` and becomes a `div[role=group]` holding a native trigger and two native link-dot siblings — `src/views/calendar-timeline-renderer.ts:618-648, :927-987`, rules at `styles.css:17597-17629`, fixture parity at `tools/screenshots/scenarios/temporal.mjs:506-521` pinned by `tools/screenshots/scenarios/temporal-tick-parity.test.mjs:49-77`. 18 captures moved and all 18 were opened against their `cb9aedf4` copies; six more moved in one capture run, reproduced their committed bytes on a rerun against the same tree, and were restored rather than committed. Touch reach improved with the restructure: controls under 28px was 277 and is now 253 against an unchanged baseline of 279, because a timeline bar is no longer itself a 20px-tall button)
- [x] T013 Release the `styles.css` lane hold with a `reviewed` array naming every recaptured screenshot (evidence: `tools/lane/css-lane.json:1271-1306` records 18 reviewed captures; `node tools/lane/check-lane.mjs` exit 0 — "release names all 18 changed capture(s)")
- [x] T014 Run `npm run gate`, read `$?` directly, not through a pipe (evidence: recorded 25 green, 0 red for a declared reason, exit 0, both with `SURFACE_PHASE=041-shared-ui-ux-port` and bare; `npx tsc --noEmit` 0, `npx vitest run` 791 across 84 files, `npm run lint` 169 problems against a measured HEAD baseline of 169, `node tools/live/evidence.mjs --check-all` 16 artefacts fresh)
- [x] T015 Update documentation: reconcile `spec.md`/`plan.md`/`tasks.md`/`acceptance-criteria.md` to the shipped state and author `implementation-summary.md` (evidence: `implementation-summary.md` carries leg a and leg b with their verification tables and the rebase resolution; this file's rows carry their evidence. `spec.md`, `plan.md` and `acceptance-criteria.md` needed no edit — nothing shipped outside their recorded scope, and REQ-001's untouched-sheet claim was re-measured at 0 changed lines)
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
