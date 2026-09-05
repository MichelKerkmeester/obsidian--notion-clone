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

- [x] T001 Read `005`'s declared-loss list. The changelog is checked against it item by item, not summarised from it (`../005-usage-and-migration-audit/implementation-summary.md`)
  Read `implementation-summary.md` §6 (Data-loss list, T007). Four declared losses: L1 `listCompactFields` (compact meta-field sizing), L2 stacked file-title display, L3 roving-tabindex card-style keyboard model, L4 wrapping fields sized `max-content` (`col.wrap`). The per-group create button was confirmed NOT a loss and is excluded.
- [x] T002 [P] Read `007`'s rollback section, so the changelog's rollback sentence matches what a revert actually does (`../007-remove-renderer-and-harness/plan.md`)
  Read `plan.md` §7 ROLLBACK PLAN and the L2/L3 Enhanced Rollback "Data Reversal" note: reverting the single removal commit restores the renderer, lane, bench, fixtures and specs together; "Views migrated by `006` stay tables regardless of what happens here." `CHANGELOG.md`'s rollback sentence states this explicitly.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 Remove the list view from the README's view list (`README.md`)
  "Seven views"/"Seven database views" -> "Six"; the Gallery|List screenshot table row split, List column removed, Gallery now a single-column row; "Table, Board, Gallery, List, Calendar, Timeline" -> list dropped; "table, board, gallery, and list views" -> "table, board, and gallery views". `grep -n -i "list" README.md` after the edit: only the unrelated "or list values" (Rollups) and "en-command-list.png" screenshot filename remain — neither names the view.
- [x] T004 Write the changelog entry: what was removed, what existing views became, every declared loss by name, and the explicit statement that a revert restores the renderer but does not turn migrated views back into lists
  Created root `CHANGELOG.md` (did not previously exist), entry under `## 0.0.23 (unreleased)` — see T008 for the manifest-version check that picked 0.0.23. Names all four T001 losses individually, states the rollback sentence, and lists what a migrated view gains from becoming a table.
- [x] T005 [P] Close `033-list-virtualisation` against this decision, with the reason in the document rather than in a commit message (`../../005-component-surface-system/033-list-virtualisation/`)
  Already closed on main by commit `3818298f` ("docs(specs): record the list renderer retirement"): `spec.md` Status reads "Superseded. The list view was retired..." with the 4,748.6ms -> 48.4ms measurement kept as historical evidence. Confirmed by reading the current file; no further edit needed.
- [x] T006 [P] Close `024-list-view-freeze` the same way. Its own AC-6 already reads NOT MET, and its exit signal was already reassigned once — record both facts rather than overwriting them (`../../005-component-surface-system/024-list-view-freeze/`)
  Already closed on main by the same commit `3818298f`: `spec.md` Status reads "Superseded — the list view was retired", with "AC-6 (operator device) stays NOT MET as historical record" stated explicitly. Confirmed by reading the current file; no further edit needed.
- [x] T007 Decide whether the in-app changelog modal carries the notice. If it does, the string is localised in three locales (`src/i18n.ts`)
  Decided: no, not in this phase. The one-time per-view notice (`notice.listMigrated`, shipped by `006-hide-and-migrate` in en/zh-CN/zh-TW) already tells an affected user their view became a table. The `changelog.releaseNotes` "What's new" modal string is release-cut curation — rewritten fresh for whatever ships in that release — and this phase does not cut the release (see T010), so pre-writing it now would be curated against an incomplete release contents list. Recorded as the open question's answer in `spec.md`; `src/i18n.ts` is not touched, matching this phase's out-of-scope "no code change".
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 Check the changelog against `005`'s declared-loss list item by item, and record the count checked
  4 of 4 checked: L1 `listCompactFields` -> "Compact field sizing"; L2 stacked file-title -> "Two-line stacked titles"; L3 roving-tabindex keyboard model -> "The list's card-style keyboard model"; L4 `col.wrap` -> "Free-width wrapping columns". Also decided the version: `manifest.json`/`package.json` still read `0.0.22`, and `git tag` carries `0.0.22` (commit `7b976e28`, "chore(release): cut 0.0.22") — that version is already cut, so the entry is written under `0.0.23 (unreleased)`.
- [x] T009 Confirm nothing under `specs/` still plans work on the list view
  `rg -rniE "list view|list-view" specs/ --include="*.md"` outside `specs/context/`, `*/review/lineages/`, and this packet's own tree, then filtered to unchecked `- [ ]` rows. `033-list-virtualisation` and `024-list-view-freeze` (T005/T006) are the only packets this phase's own spec names, and both are closed. The sweep found two other classes of hit, neither of them live planning: (a) stale, unsynced task checkboxes inside `specs/003-ui-improvement-build/001-empty-and-first-run-states/` and `006-views-parity-polish/`, both of which carry `spec.md` **Status: Complete** — the plan-level boxes were never retroactively ticked, which is a pre-existing documentation gap in an unrelated, already-closed track, not open work; and (b) one unchecked research question (Q4, row density) in `013-mobile-ux-research/research/deep-research-strategy.md`, an 85%-complete dormant draft last touched 2026-08-29 (before the 2026-09-04 retirement decision) under the same unrelated `003-ui-improvement-build` track. Neither is in this phase's Files to Change table or this packet's write scope; flagged here rather than edited, per scope lock.
- [ ] T010 Cut the release and confirm it is installable, per this repository's release cadence
  Deferred. Per this session's instruction, the release is **not cut in this session** — it is cut by the orchestrator as part of the next release. `README.md` and `CHANGELOG.md` are ready; `manifest.json`/`package.json`/`versions.json` still read `0.0.22` (already released) and are unmodified by this phase.
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



