---
title: "Acceptance Criteria: Packet Documentation Truth"
description: "What must be observed, with the number each reads today."
trigger_phrases: ["034 acceptance criteria"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/034-packet-doc-truth"
    last_updated_at: "2026-08-31T17:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Acceptance criteria added; Level 2 requires them and they were missing"
    next_safe_action: "Correct the six parent-spec findings first"
    blockers: []
    key_files: ["spec.md", "goal.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-034-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: ["A criterion without a failing number is a wish, not a criterion"]
---
# Acceptance Criteria: Packet Documentation Truth

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:criteria -->
## CRITERIA

Each row states what is measured, the threshold, and **the number it reads today**. A criterion
whose control has not been observed failing is not met, however green it looks.

| ID | Measured | Threshold | Today |
|----|----------|-----------|-------|
| AC-1 | Review findings that are untrue statements in this packet | 0 | 11 |
| AC-2 | Of those, ones in the parent spec | 0 | 6 |
| AC-3 | Corrections citing the source they were re-derived from | all | none yet |
| AC-4 | Folders edited whose metadata was regenerated | all | the failure was repeated three times in the session that opened this phase |
| AC-5 | Corrected findings re-raised by re-running the review dimension | 0 | untested |
| AC-6 | The two findings with substantive residue, resolved as substance not wording | both | neither |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect. A number is quoted with the command that produced it and the exit code read directly, never
through a pipe.
<!-- /ANCHOR:evidence -->
