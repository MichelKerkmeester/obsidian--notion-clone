---
title: "Goal: Board Card Drag Feel (ClickUp)"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "019-board-card-drag-feel-clickup goal"
  - "019 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/019-board-card-drag-feel-clickup"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Opened 019's goal from the operator's ClickUp drag-feel ruling"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T003"
    blockers:
      - "069's working mechanism must re-run unchanged after this child's presentation-layer edit"
      - "Sequenced after 018 on the same board-renderer.ts file"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/board-renderer.ts"
      - "tools/live/board-touch-drag.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "019-board-card-drag-feel-clickup-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether Obsidian's mobile WebView exposes haptics"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree, against the ClickUp drag reference, on a mid-drag capture — a new evidence shape for this programme"
      - "069's move+persist mechanism is not reopened; this child layers presentation on top of it"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Board Card Drag Feel (ClickUp)

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Dragging a board card on the phone looks and feels like ClickUp's own board drag — a compact tilted ghost with shadow, a dimmed source placeholder, a highlighted target column with dimmed neighbours, and edge auto-scroll — layered entirely on top of `069`'s existing working move-and-persist mechanism. This phase takes it through the programme's six-step loop until a reviewer scores a mid-drag capture **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

The operator, 2026-09-11 ~05:36, verbatim: *"Board card dragging should look and work like this like in clickup"*. Evidence at `scratchpad/loop/board-card-drag-feel/operator-notes.md`.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate, scored on a mid-drag capture — a new evidence shape for this programme, every prior child having judged a static frame |
| D2 | `069`'s working move-and-persist mechanism is not reopened; this child adds presentation only |
| D3 | Sequenced after `018` on the shared `board-renderer.ts` file, not parallel |
| D4 | The mid-drag capture is produced by pausing the scripted drag at a named DOM-state checkpoint, never a wall-clock sleep |
| D5 | Only the operator's own device read closes the alignment judgement — and here specifically covers feel and timing a static capture cannot show. No agent ticks that row |

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

- [ ] DEFINE complete: every row of `spec.md` §13 sourced to ClickUp or `069`'s own mechanism; haptics availability confirmed or REQ-009 dropped with a reason
- [ ] DOM-state checkpoint mechanism designed and reachable deterministically
- [ ] Every lane clause RED-then-GREEN, both numbers recorded; `069`'s existing clauses re-run unchanged
- [ ] Mid-drag captures (light + dark) current, and both opened and looked at
- [ ] Image judge ≥ 14/16, no row at 0 — pass #1, against the ClickUp reference
- [ ] Image judge ≥ 14/16, no row at 0 — pass #2, on an unchanged tree
- [ ] The operator drags a card on their own iPhone and reports it feeling like ClickUp — no agent ticks this row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — scaffolded

Opened directly from the operator's mid-session ClickUp drag-feel ruling, as its own child rather than folded into `018`'s static-chrome scope, since the evidence shape (motion, mid-drag capture, DOM-state checkpoints) differs from every other `076` child. Sequenced explicitly after `018` on the shared `board-renderer.ts` file.
<!-- /ANCHOR:log -->
