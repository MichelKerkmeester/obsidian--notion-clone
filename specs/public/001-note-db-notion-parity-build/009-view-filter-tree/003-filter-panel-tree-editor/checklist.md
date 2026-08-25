---
title: "Verification Checklist: Filter Panel Tree Editor"
description: "Pending verification for nested filter-panel editing: mobile popover width, wrap-into-group, auto-collapse, depth cap 3, and no source-operator leaf leak."
trigger_phrases:
  - "filter panel tree checklist"
  - "wrap into group"
  - "filter depth cap"
  - "source op leak"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree/003-filter-panel-tree-editor"
    last_updated_at: "2026-08-25T21:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored filter-panel-tree-editor child from synthesis ranks 4/6/7/8-UI and final-plan step 8"
    next_safe_action: "Extend FilterPanelRenderer.ts with recursive group/not chrome; keep existing leaves"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-filter-panel-tree-editor"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Filter Panel Tree Editor

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
  - **Evidence**: Pending. `spec.md` states chrome-only copy, wrap, auto-collapse, depth 3, existing leaves (`107-123`).
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: pending]
  - **Evidence**: Pending. `plan.md` orders one `FilterPanelRenderer.ts` change with `depth` added, not copied from `901-916`.
- [ ] CHK-003 [P1] Dependencies identified [EVIDENCE: pending]
  - **Evidence**: Pending. Requires child 001 leaf helpers and child 002 persist.
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] No source-operator leaf editor in the view panel [EVIDENCE: pending]
  - **Evidence**: Pending. Grep `FilterPanelRenderer.ts` for `inFolder` / `hasProperty` / `strictEq` / source `expression`. Leaked ops match every row (`QueryEngine.ts:124-125`).
- [ ] CHK-011 [P0] `styles.css` and `i18n.ts` untouched [EVIDENCE: pending]
  - **Evidence**: Pending. Reuse `.db-source-rule-*` (`styles.css:9192-9234`) and existing `panel.and` / `panel.or` / `panel.addCondition` strings.
- [ ] CHK-012 [P1] `saveState()` call sites kept [EVIDENCE: pending]
  - **Evidence**: Pending. `99/142/187/212/228/245/264/285/339` still commit.
- [ ] CHK-013 [P1] Positional splice, not `removeSourceRuleTreeReferences` [EVIDENCE: pending]
  - **Evidence**: Pending. That helper hoists (`SourceRules.ts:222-224`). Use `removeLeafAt`.
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: pending]
  - **Evidence**: Pending. REQ-001 through REQ-006 unverified.
- [ ] CHK-021 [P0] `(A and B) or C` at phone width [EVIDENCE: pending]
  - **Evidence**: Pending. Measure popover width; row-list + flex-shrink (`styles.css:9192-9229`).
- [ ] CHK-022 [P1] Wrap / auto-collapse / depth 3 / labeled `not` [EVIDENCE: pending]
  - **Evidence**: Pending. 4th group layer refused; no add-expression; no add-empty-group.
- [ ] CHK-023 [P1] Rail popover still edits one leaf [EVIDENCE: pending]
  - **Evidence**: Pending. `renderSingleRuleEditor` (`107-123`) remains.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-024 [P0] One renderer diff contains wrap, depth, `not`, and auto-collapse [EVIDENCE: pending]
  - **Evidence**: Pending. Final-plan merge of T016+T022–T025.
- [ ] CHK-025 [P1] Dual-write DFS leaves on commit [EVIDENCE: pending]
  - **Evidence**: Pending. `state.filters` + `state.filterLogic` for badges (`getEffectiveFilterRules`).
- [ ] CHK-026 [P0] No `styles.css` bytes in the diff [EVIDENCE: pending]
  - **Evidence**: Pending. Chrome reused from `styles.css:9192-9234`.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets or telemetry [EVIDENCE: pending]
  - **Evidence**: Pending. Panel adds no network surface.
- [ ] CHK-031 [P0] No desktop-only APIs [EVIDENCE: pending]
  - **Evidence**: Pending. Existing popover (`71-77`); NFR-R01.
- [ ] CHK-032 [P2] Auth/authz working correctly [EVIDENCE: pending]
  - **Evidence**: Pending. Not applicable to local vault view config.
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/checklist synchronized [EVIDENCE: pending]
  - **Evidence**: Pending implementation evidence. Docs follow `research/final-plan.md` step 8.
- [ ] CHK-041 [P1] Durable WHY comments only [EVIDENCE: pending]
  - **Evidence**: Pending. No spec paths / task-ids in `.ts` comments.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Pending. No README change required.
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: pending]
  - **Evidence**: Pending. Popover width notes belong in this child's `scratch/` if kept.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: pending]
  - **Evidence**: Pending. No leftover screenshots required in the packet.
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
