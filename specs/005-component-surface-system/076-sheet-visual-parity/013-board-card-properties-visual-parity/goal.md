---
title: "Goal: Board Card Properties Sheet Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "013-board-card-properties-visual-parity goal"
  - "013 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/013-board-card-properties-visual-parity"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Opened 013's goal from the coverage audit gap"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T003"
    blockers:
      - "No card container per the 076 frame ruling"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/board-card-properties-panel.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "013-board-card-properties-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether the row shell should be unified with 002's literally or kept as matched CSS across two producers"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree"
      - "This is a distinct surface from 012 (card CSS) and 002 (record/table column manager)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Board Card Properties Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The board's field-visibility sheet reads as one more sheet in the same divider-on-plain-background family the rest of `076` is being taken to, with its row-shell relationship to `002`'s column manager confirmed rather than assumed. This phase takes it through the programme's six-step loop until a reviewer scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

Opened from the operator's coverage-audit instruction (2026-09-11 ~05:35): *"Double check we have inventorized every sheet / dropdown. And each ine has dedicated multi phased ohase with oroper planning."* The audit (`../coverage-audit.md`) found this sheet inventoried (`071/001`) but never targeted by any `076` child.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate; the lane clauses are the floor beneath it |
| D2 | The target binds every production surface painting this grammar |
| D3 | Row-shell sharing with `002`/board-groups is confirmed structurally (T001), not assumed |
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

- [ ] DEFINE complete: every row of `spec.md` §13 has a target and a Source, row-shell sharing recorded
- [ ] Every production surface painting this grammar enumerated
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] Phone light and dark captures current, and both opened and looked at
- [ ] Image judge ≥ 14/16, no row at 0 — pass #1
- [ ] Image judge ≥ 14/16, no row at 0 — pass #2, on an unchanged tree
- [ ] `045`'s mechanism guard stays green unmodified
- [ ] The operator re-reads the sheet on their own iPhone and reports it aligned — no agent ticks this row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — scaffolded

Opened from the `076` coverage audit as a gap: `board-card-properties-panel.ts` has a story and captures but no prior visual target. Distinguished explicitly from `012` (card CSS) and `002` (record/table column manager) in the same entry so the three are never conflated.
<!-- /ANCHOR:log -->
