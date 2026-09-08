---
title: "Feature Specification: Linked View Blocks UX and Mobile Drag Parity"
description: "Determine which surface the operator's R2 report actually names — embedded/linked views inside notes, or table row/column drag on mobile — then fix the mobile drag gap on that surface to Notion's own feel."
trigger_phrases:
  - "072 linked view blocks ux"
  - "r2 separate views bugged"
  - "mobile drag parity notion"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "072-linked-view-blocks-ux"
    last_updated_at: "2026-09-08T08:07:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Opened the packet from the operator's R2 report"
    next_safe_action: "Determine which surface R2 names before fixing anything"
    blockers:
      - "R2 is ambiguous between embedded/linked views and table row/column drag; both must be checked"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "src/views/board-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "072-linked-view-blocks-ux-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does R2 mean embedded/linked database views inside notes, table row/column drag, or both?"
    answered_questions:
      - "Board cross-group drag on mobile already shipped in 069 (0.0.32), so R2 is not that surface"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Linked View Blocks UX and Mobile Drag Parity

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Draft — opened 2026-09-08, nothing started |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../005-component-surface-system/` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator reports two things in one line: "the seperate views from database is pretty bugged ui ux wise and dragging doesnt work on mobile like it would on notion." "Separate views" most likely names embedded/linked database views inside a note (`046-linked-views-notion-parity`'s territory), but the drag half could name table row/column drag rather than board drag, which `069` already shipped for mobile in 0.0.32. The report does not distinguish these, so the report cannot be trusted to point at one surface without checking the actual 0.0.32 build first.

### Purpose
The report is resolved into a named surface (or surfaces) confirmed against the shipped 0.0.32 build, the UI/UX defects on that surface are enumerated, and mobile drag on that surface matches Notion's own feel — measured, not eyeballed.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Determining, against the 0.0.32 build, whether R2 names embedded/linked views, table row/column drag, or both — recording both findings even if only one turns out to be the real defect
- Enumerating the specific UI/UX defects on the confirmed surface(s)
- Fixing mobile drag on the confirmed surface(s) to match Notion's own feel, with before/after measurement

### Out of Scope
- Board cross-group drag — already shipped in `069` for mobile
- Any sheet-family defect (tracked in `071`)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/embedded-database-renderer.ts` | Investigate/Modify | Embedded/linked view host, if that is the confirmed surface |
| Table renderer's row/column drag source | Investigate/Modify | If table drag is the confirmed surface |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Determine which surface(s) R2 names, against the 0.0.32 build, and record both findings |
| REQ-002 | Enumerate the specific UI/UX defects on the confirmed surface(s) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | Fix mobile drag on the confirmed surface(s) to match Notion's own feel, measured before and after |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The surface-determination finding names file:line evidence for its conclusion, not a guess
- **SC-002**: Mobile drag on the confirmed surface is measured against a Notion reference capture, not judged subjectively
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | R2 may name both surfaces at once, doubling the scope | A fix scoped to only one surface would leave the report half-open | REQ-001 explicitly requires recording both findings, not picking one and moving on |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Drag must track the finger/pointer at the frame rate the board drag (`069`) already achieves on the same device class

### Reliability
- **NFR-R01**: The surface-determination finding must be reproducible by a fresh reviewer from the same 0.0.32 build
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A note embedding more than one linked view — each must be independently draggable/interactive if embedded views are the confirmed surface

### Error Scenarios
- A drag started on a coarse pointer (phone) versus a mouse — both paths must be checked independently, as `069` found the desktop half already worked while only the phone half was gapped
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | Surface-determination first, then a scoped fix on whichever surface(s) are confirmed |
| Risk | 8/25 | UI/UX and drag-feel work, no data risk |
| Research | 12/20 | The report itself is ambiguous and must be resolved before any fix |
| **Total** | **32/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does the operator mean embedded/linked views inside a note, table row/column drag, or both?
<!-- /ANCHOR:questions -->

---
