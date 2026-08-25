---
title: "Verification Checklist: Files Column Proof"
description: "Pending verification checklist for tsc, grep, desktop chips and covers, mobile overlay, iCloud, and insertion-only diff-shape."
trigger_phrases:
  - "files column proof checklist"
  - "vault local grep"
  - "files tsc"
  - "gallery cover offline"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/005-files-column-proof"
    last_updated_at: "2026-08-25T21:20:00Z"
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
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Files Column Proof

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: pending]
  - **Evidence**: Pending proofs. `spec.md` states tsc, vault-local grep, offline gallery, chips, mobile overlay, and diff-shape.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: pending]
  - **Evidence**: Pending. `plan.md` orders setup, tsc/build, grep, desktop, mobile/iCloud, evidence.
- [ ] CHK-003 [P1] Dependencies identified [EVIDENCE: pending]
  - **Evidence**: Pending. Requires children 001–004 shipped.
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] No fork TypeScript in this child [EVIDENCE: pending]
  - **Evidence**: Pending. Proofs must not add `src/` edits; implementation lives in children 001–004.
- [ ] CHK-011 [P0] Typecheck passes with icon Record [EVIDENCE: pending]
  - **Evidence**: Pending. `npx tsc --noEmit` must pass with `PROPERTY_TYPE_ICON_NAMES.files` (`PropertyTypeIcon.ts:7-20`).
- [ ] CHK-012 [P1] Vault-local grep [EVIDENCE: pending]
  - **Evidence**: Pending. `FilesColumn.ts` has no `fetch`/CDN/`adapter.exists`; external skip is at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661`.
- [ ] CHK-013 [P1] Locked files stay clean [EVIDENCE: pending]
  - **Evidence**: Pending. `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` have no this-phase diffs.
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: pending]
  - **Evidence**: Pending. REQ-001 through REQ-006 unverified.
- [ ] CHK-021 [P0] Offline gallery cover [EVIDENCE: pending]
  - **Evidence**: Pending. Files column as `galleryImageField` shows the first internal image with network off (SC-003).
- [ ] CHK-022 [P1] Edge matrix [EVIDENCE: pending]
  - **Evidence**: Pending. Dangling `is-unresolved`; 50+ cap + tooltip; empty `[]` `db-empty-value`; HEIC `onerror` if present; stale URL is not a network `<img>`.
- [ ] CHK-023 [P1] Inline-edit round-trip [EVIDENCE: pending]
  - **Evidence**: Pending. `[[Sales.pdf]]` plus a URL stores only the wikilink; one `processFrontMatter` (`CellRenderer.ts:2476-2482`).
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-024 [P0] Table chips open vault files [EVIDENCE: pending]
  - **Evidence**: Pending. Sales PDF chips; `openLinkText` (SC-004).
- [ ] CHK-025 [P1] Mobile overlay [EVIDENCE: pending]
  - **Evidence**: Pending. Render + inline-edit via `is-inline-overlay` (`CellRenderer.ts:1484-1528`); no `electron`/`fs` in the module.
- [ ] CHK-026 [P0] Diff-shape proven [EVIDENCE: pending]
  - **Evidence**: Pending. `git diff --stat` is 1 module + insertion-only sites; T019/T020 remain `[B]`.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets or telemetry [EVIDENCE: pending]
  - **Evidence**: Pending. Proofs add no secrets or CDN fetch.
- [ ] CHK-031 [P0] No `fetch` in the new module [EVIDENCE: pending]
  - **Evidence**: Pending. Grep `src/data/FilesColumn.ts`.
- [ ] CHK-032 [P2] Auth/authz working correctly [EVIDENCE: pending]
  - **Evidence**: Pending. Not applicable to local vault file chips.
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/checklist synchronized [EVIDENCE: pending]
  - **Evidence**: Pending implementation evidence. Docs follow `research/final-plan.md` step 6.
- [ ] CHK-041 [P1] Evidence comments adequate [EVIDENCE: pending]
  - **Evidence**: Pending. Packet evidence must not embed ephemeral artifact ids in vault YAML comments.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Pending. No README change required for proofs.
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: pending]
  - **Evidence**: Pending. Grep logs belong in this child's `scratch/` if kept at all.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: pending]
  - **Evidence**: Pending. No leftover dumps of frontmatter.
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 10 | 0/10 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Pending (not yet implemented)
**Verified By**: Pending
<!-- /ANCHOR:summary -->
