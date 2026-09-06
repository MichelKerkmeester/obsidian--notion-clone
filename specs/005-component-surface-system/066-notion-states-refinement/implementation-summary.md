---
title: "Implementation Summary: Notion States Refinement"
description: "Placeholder. The packet was opened from a research synthesis and no source file has been touched; this document is filled when the first leg lands."
trigger_phrases:
  - "066 implementation summary"
  - "notion states refinement summary"
  - "what shipped"
  - "validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/066-notion-states-refinement"
    last_updated_at: "2026-09-06T16:10:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened the packet; nothing implemented yet"
    next_safe_action: "Record ADR-003 and ADR-004, then land T004's dwell split"
    blockers:
      - "Nothing implemented; this document is a placeholder until the first leg lands"
    key_files:
      - "src/views/toast.ts"
      - "src/views/database-view.ts"
      - "src/views/empty-state-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-066-impl"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "None beyond the four ADRs"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 066-notion-states-refinement |
| **Completed** | Not complete — opened 2026-09-06 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing yet. This packet was opened from the Opus synthesis of the Notion states research loop and no
source file has been touched. The document is a placeholder so the packet carries its Level 3 shape
from the start; it is rewritten when the first leg lands.

The four files it will touch are already named and already measured: `src/views/toast.ts:62` holds
the single `AUTO_DISMISS_MS = 2200` the dwell split divides and `:137` is the only `setTimeout` that
reads it; `src/views/database-view.ts:3681`, `:8378` and `:8468` are the three owned
`errors.deleteFailed` catches that still raise a bare `new Notice`;
`src/views/empty-state-renderer.ts:295-330` is the `renderCard` the inline chip will sit beside; and
`styles.css:200`, `:473`, `:7431` and `:22745` are the four fast-band literals. The research behind
them is `../055-states-feedback-and-motion/research/research.md`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| None | — | No source file has been modified by this packet |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. The opening pass wrote this packet's documents, amended the parent's roadmap and phase
map, and left a line in `055`'s `tasks.md` pointing here. The research artefacts that produced it live
in `../055-states-feedback-and-motion/research/`, with the lineage trail on disk and git-ignored.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Hold both Anytype rulings the Notion harvest contradicts | Neither Notion pattern has a consumer here, and parent `goal.md` D15 makes the refinement additive; ADR-001 and ADR-002 name both readings and stop |
| Split the toast dwell rather than raise it | A plain success has nothing to act on; only an action-carrying toast needs a window, and ADR-003 marks the 5000ms as an inference |
| Record the fast-band curve choice before migrating | The four literals are `ease-out` against a token that is `ease`, so a blind migration changes four surfaces' motion silently |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 066-notion-states-refinement --strict` | Run at the opening commit; first `RESULT:` line recorded in the landing report |
| Three code gates | Not run — no source file changed by this packet |
| Red-first proofs | Five of the eight acceptance criteria observed red on the tree at `38bba1e3`, each with the failing figure in its Verification cell |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Nothing here is device-confirmed.** D-1 and D-2 ride `055`'s operator device pass, and the
   5000ms dwell in ADR-003 is an inference until D-2 reads it on a handset.
2. **The bare-notice lane stays open.** This packet moves the owned operation failures, not the
   242-site population; `055` D5 makes the toast the pattern for the rest.
3. **Two decisions belong to the operator.** ADR-001 and ADR-002 hold landed Anytype rulings against
   new Notion evidence, and the packet closes on the operator row either way.
<!-- /ANCHOR:limitations -->
