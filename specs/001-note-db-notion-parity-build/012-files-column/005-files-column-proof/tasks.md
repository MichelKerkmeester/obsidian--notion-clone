---
title: "Tasks: Files Column Proof"
description: "Ordered proof tasks: tsc, build, grep, desktop chips and covers, mobile overlay, iCloud, diff-shape, checklist evidence."
trigger_phrases:
  - "files column proof tasks"
  - "vault local grep"
  - "files diff shape"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/005-files-column-proof"
    last_updated_at: "2026-08-27T17:27:13Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored files-column-proof child from synthesis edges and final-plan step 6"
    next_safe_action: "Run tsc, grep, desktop, mobile, and diff-shape proofs after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-files-column-proof"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Files Column Proof

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

Proofs only; no new fork TypeScript. T019/T020 stay `[B]`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children 001–004 shipped `FilesColumn.ts`, registry, CellRenderer dispatch, and cover wiring. Record fork `git status` so this child adds no `src/` files [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Proofs only; do not edit fork TypeScript.

- [ ] T002 Typecheck and build: `npx tsc --noEmit` (must include `PROPERTY_TYPE_ICON_NAMES.files` — SC-001) and the fork documented build (SC-002) at `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin` [S]
- [ ] T003 Grep `src/data/FilesColumn.ts` for `fetch` / `cdn` / `http` / `adapter.exists`; confirm external skip is at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661`, not only in an unused helper (REQ-003, NFR-S01) [S]
- [ ] T004 Desktop, network off: gallery cover from the files column (SC-003); Sales PDF chips + `openLinkText` (SC-004); dangling `is-unresolved`; 50+ cap + tooltip; empty `[]` is `db-empty-value`; HEIC `onerror` if a HEIC exists; inline-edit `[[Sales.pdf]]` plus URL stores only the wikilink; stale URL is not a network `<img>` [M]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Mobile: files column renders and inline-edits via `is-inline-overlay` (`CellRenderer.ts:1484-1528`); no `electron`/`fs`/Node in the module (NFR-M01). iCloud not-downloaded: chip from metadata-cache `TFile`; open materializes; no `db-file-pending` [S]
- [ ] T006 `git diff --stat`: 1 new module + insertion-only sites; `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean. T019 gallery count badge and T020 per-file menu remain `[B]` [S]
- [ ] T007 Record evidence in `checklist.md` + honest `implementation-summary.md` [S]
- [ ] [B] T019 Gallery “N attachments” count hint (`GalleryRenderer.ts`). Deferred unless the operator wants card chrome beyond REQ-004.
- [ ] [B] T020 Per-file Notion menu + reorder. Out of this phase — spec excludes upload UI / new write surfaces.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-blocked tasks marked `[x]`
- [ ] T019 and T020 remain `[B]`
- [ ] `checklist.md` evidence filled
- [ ] No this-child `src/` diffs
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` Edge cases
- **Parent final-plan**: `../research/final-plan.md` step 6
<!-- /ANCHOR:cross-refs -->
