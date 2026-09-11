---
title: "Goal: Inline Cell-Editor Popovers Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "015-cell-editor-popovers-visual-parity goal"
  - "015 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/015-cell-editor-popovers-visual-parity"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Opened 015's goal from the coverage audit gap"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T002"
    blockers:
      - "No card container per the 076 frame ruling"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/cell-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "015-cell-editor-popovers-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether these popovers should grow sheet-class chrome on the phone or stay a lighter inline overlay"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree"
      - "Distinct from 008: this is the table view's own inline cell popover, not the record sheet's property row"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Inline Cell-Editor Popovers Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The two inline cell-editor popovers read as a small, consistent piece of the same visual family as every sheet in the app, with the full-sheet-vs-popover form-factor mismatch against Anytype's reference recorded rather than papered over. This phase takes them through the programme's six-step loop until a reviewer scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

Opened from the operator's coverage-audit instruction (2026-09-11 ~05:35): every sheet/dropdown gets a dedicated multi-phased phase. The audit (`../coverage-audit.md`) found these two editor kinds with a reference but no `076` target, and distinguished them explicitly from `008`'s record-sheet property rows.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate; the lane clauses are the floor beneath it |
| D2 | The Anytype cell-sheet reference is read structurally only; the full-sheet-vs-popover mismatch is recorded, not resolved by copying scale |
| D3 | This child cross-checks `008`'s property-row target for shared property types before its own producer edit lands |
| D4 | This phase holds the shared css-lane triplet in its own turn |
| D5 | Only the operator's own device read closes the alignment judgement. No agent ticks that row |

### Operator copy

The operator holds the parent directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] DEFINE complete: every row of `spec.md` §13 has a target and a Source; form-factor mismatch recorded
- [ ] Both editor kinds' production surfaces enumerated
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] Phone light and dark captures current for both editor kinds, and opened and looked at
- [ ] Image judge ≥ 14/16, no row at 0 — pass #1
- [ ] Image judge ≥ 14/16, no row at 0 — pass #2, on an unchanged tree
- [ ] The operator re-reads a cell editor on their own iPhone and reports it aligned — no agent ticks this row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — scaffolded

Opened from the `076` coverage audit: two inline cell-editor popovers with a partial (Anytype-only, form-factor-mismatched) reference and no prior visual target, distinguished from `008`'s record-sheet property rows.
<!-- /ANCHOR:log -->
