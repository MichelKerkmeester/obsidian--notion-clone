---
title: "Implementation Summary: Document and Release the List Removal"
description: "README and CHANGELOG.md written, checked item by item against 005's declared-loss list; 033 and 024 confirmed already closed; the in-app modal question decided. The release itself is owed to the orchestrator's next cut."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list removal release summary"
  - "006 phase 008 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/008-docs-and-release"
    last_updated_at: "2026-09-05T04:30:00Z"
    last_updated_by: "phase-008-docs"
    recent_action: "Wrote README and CHANGELOG.md; verified 033/024 closures; decided the in-app modal question"
    next_safe_action: "Release owed to the orchestrator's next cut (0.0.23); operator install confirmation follows"
    blockers:
      - "The release itself is not cut in this session; it is the orchestrator's next release"
    key_files:
      - "README.md"
      - "CHANGELOG.md"
      - "specs/005-component-surface-system/033-list-virtualisation"
      - "specs/005-component-surface-system/024-list-view-freeze"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-008-summary"
      parent_session_id: null
    completion_pct: 70
    open_questions: []
    answered_questions:
      - "Does the in-app changelog modal carry the notice? No — the repository CHANGELOG.md and the already-shipped notice.listMigrated toast carry it."
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
| **Spec Folder** | 008-docs-and-release |
| **Completed** | Docs and housekeeping complete 2026-09-05; release still owed |
| **Level** | 1 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

README and a new root `CHANGELOG.md`, checked item by item against `005`'s declared-loss list; the
two `005` housekeeping phases confirmed already closed; the in-app modal question decided. The
release itself was deliberately not cut in this session.

### What was said

1. **The list view is removed.** `README.md`'s "Seven views" copy and the Gallery/List screenshot
   pairing both drop list; no remaining mention names it as a view.
2. **Views configured as a list became tables with the same columns, once, on open.** All four losses
   `005` declared are named individually in `CHANGELOG.md`'s `## 0.0.23 (unreleased)` entry: compact
   field sizing (`listCompactFields`), two-line stacked titles, the list's card-style keyboard model,
   and free-width wrapping columns (`col.wrap`).
3. **A revert restores the renderer and does not turn migrated views back into lists.** Stated
   explicitly in the changelog, matching `007`'s rollback section word for word in meaning.

And the housekeeping this packet owns: `../../005-component-surface-system/033-list-virtualisation/`
and `.../024-list-view-freeze/` were found already closed — a prior session's `007`-landing commit
(`3818298f`) had superseded both against this same decision while reconciling `007` onto `main`. This
phase verified both documents read Superseded with their historical measurements kept, rather than
re-closing them.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `README.md` | Modify | View count and screenshot table drop the list view |
| `CHANGELOG.md` | Create | Did not previously exist; `## 0.0.23 (unreleased)` entry |
| `specs/006-list-view-deprecation/008-docs-and-release/tasks.md` | Modify | T001-T009 ticked with evidence; T010 (release) left pending |
| `specs/006-list-view-deprecation/008-docs-and-release/spec.md` | Modify | Status updated; the modal open question answered |
| `specs/006-list-view-deprecation/008-docs-and-release/goal.md` | Modify | Completion criteria, log and continuity updated |
| `specs/006-list-view-deprecation/spec.md` | Modify | Parent phase table and Status line reflect 008 |
| `specs/006-list-view-deprecation/goal.md` | Modify | Parent log and continuity reflect 008 |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Read-then-write. `005`'s declared-loss list and `007`'s rollback section were read first; the
changelog entry was checked against the loss list item by item afterward, with the count recorded in
`tasks.md` T008. `033` and `024` were read rather than assumed closed, confirming the prior session's
work rather than duplicating it.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Check the changelog against the loss list item by item | A summary reads well and lets exactly one loss through unnamed, which is the one a user meets. |
| State the rollback consequence explicitly | It is counter-intuitive and it is the sentence that gets quoted back. Leaving it to inference is a choice, and the wrong one. |
| Verify `033` and `024` rather than re-close them | Both already read Superseded from a prior session's `007`-landing commit; re-editing would duplicate work and risk overwriting a correct closure. |
| Leave the in-app "What's new" modal untouched | It is release-cut curation against everything that release ships; this phase does not decide the release's contents, and pre-writing it risks describing a release whose final shape isn't set yet. |
| Do not cut the release | Out of this session's authority by instruction; recorded as owed to the orchestrator's next release. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 008-docs-and-release --strict` | Run at authoring time; see the packet commit |
| Changelog checked against the loss list | Run — 4 of 4 losses named individually (`tasks.md` T008) |
| `033` / `024` closed | Confirmed already closed by `3818298f`; verified by reading both `spec.md`s |
| `README.md` view-list scan | `grep -n -i "list" README.md` after the edit shows no remaining view mention |
| Release | Not cut — owed to the orchestrator's next release (0.0.23) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The release is not cut.** `README.md` and `CHANGELOG.md` are ready; `manifest.json`,
   `package.json` and `versions.json` still read `0.0.22` (already released) and are unmodified by
   this phase, per this session's explicit instruction not to cut a release.
2. **The operator has not installed the release or confirmed a migrated vault.** Only the operator
   closes this row, and it cannot happen before the release exists.
3. **A broader `specs/` sweep (T009) found stale, unrelated checkbox residue** in already-Complete
   packets under `003-ui-improvement-build` and one unchecked question in a dormant, pre-decision
   research draft (`013-mobile-ux-research`). Neither is in this phase's write scope; flagged rather
   than edited.
<!-- /ANCHOR:limitations -->

---


