---
title: "Implementation Plan: Files Column Proof"
description: "Ordered proofs after module, registry, CellRenderer, and cover wiring: tsc, grep, desktop, mobile, iCloud, diff-shape."
trigger_phrases:
  - "files column proof plan"
  - "vault local grep"
  - "files diff shape"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/012-files-column/005-files-column-proof"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Implementation Plan: Files Column Proof

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript fork + Obsidian vault UI |
| **Framework** | Existing CellRenderer / gallery / board (untouched in this child) |
| **Storage** | Display + one-commit frontmatter already shipped in 003 |
| **Testing** | `tsc`, fork build, grep, manual desktop/mobile, `git diff --stat` |

### Overview
Final-plan step 6. Re-budget: verification is effort M. Do not add TypeScript here. External skip must be proven at the two `renderCover` sites.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Children 001–004 shipped module, registry, CellRenderer, and cover wiring.

### Definition of Done
- [ ] `tsc` and fork build pass.
- [ ] Grep + cover-site skip recorded.
- [ ] Desktop, mobile, iCloud, and diff-shape recorded in `checklist.md`.
- [ ] T019/T020 still `[B]`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Observation-only proofs over children 001–004. No new producers.

### Key Components
- **Compile**: `PROPERTY_TYPE_ICON_NAMES` Record completeness (SC-001).
- **Vault-local**: module grep + cover call-site skip.
- **UX**: chips, overlay, cover, iCloud open-through-Obsidian.

### Data Flow
Open table/gallery → FilesColumn paints chips / cover guard runs → save still one `processFrontMatter`. Proofs must not add a write pump.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. This child observes `FilesColumn.ts`, `CellRenderer.ts`, gallery/board `renderCover`, and `CoverImage.ts` (must stay clean). Algorithm invariant: no network `src` from a files column; no `adapter.exists` per cell.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm children 001–004 shipped.
- [ ] Record fork `git status` baseline for this child (must add no `src/` files).

### Phase 2: Core Implementation
- [ ] Run tsc, build, grep, desktop, mobile, iCloud proofs.
- [ ] Do not edit fork TypeScript.

### Phase 3: Verification
- [ ] Fill `checklist.md` evidence.
- [ ] Honest `implementation-summary.md`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Typecheck / build | SC-001, SC-002 | `npx tsc --noEmit`; fork build |
| Grep | Module + cover sites | `rg` |
| Manual desktop | Chips, cover, edges | Obsidian, network off |
| Manual mobile | Overlay edit | Phone layout |
| Constraint | Diff-shape | `git diff --stat` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Children 001–004 | Child predecessors | Required | Nothing to prove |
| Live finance vault Sales PDFs | Vault | Helpful | Use any vault PDFs + one image if Sales set missing |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Proofs fail, a TypeScript “fix” appeared, or T019/T020 were implemented.
- **Procedure**: Revert any this-child `src/` edits (there must be none). Do not ship with CDN `src` or garbled `string[]` edit.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | Children 001–004 | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 15 minutes |
| Proofs (tsc, grep, desktop, mobile, iCloud, diff) | Medium | ~2 hours |
| Evidence record | Low | 15 minutes |
| **Total** | | **~2.5 hours (effort M)** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Children 001–004 diffs identified so this child does not add more.
- [ ] Network can be turned off for the gallery pass.

### Rollback Procedure
1. Confirm no fork TypeScript from this child.
2. Confirm T019/T020 still blocked.
3. Confirm `CoverImage.ts` still clean.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: Stored values remain plain `string[]`. Delete `FilesColumn.ts` and revert insertion-only sites if the phase rolls back as a whole.
<!-- /ANCHOR:enhanced-rollback -->
