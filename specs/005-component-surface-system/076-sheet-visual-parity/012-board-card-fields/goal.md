---
title: "Goal: Board Card Fields Never Wrap Side by Side"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "012-board-card-fields goal"
  - "012 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/012-board-card-fields"
    last_updated_at: "2026-09-10T22:15:00Z"
    last_updated_by: "board-card-fields-plan"
    recent_action: "Opened 012's goal with the rubric thresholds and the operator row"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T002"
    blockers:
      - "The lane's own 'meta grid' clause currently asserts and passes on the two-column shape this child removes; the clause must be corrected in the same commit as the producer (D1's own lesson, restated)"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "styles.css"
      - "tools/live/render-assertions.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "012-board-card-fields-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Whether the taller single-column card changes the board's own scroll-reachability pins in GEOMETRY_PINS — re-measured, not assumed, in T009"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree, against the Anytype mobile kanban reference"
      - "045's mechanism (which properties show) is unaffected; only the meta grid's column count and truncation thresholds move"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Board Card Fields Never Wrap Side by Side

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every field the board card draws renders on its own full-width row, at every viewport the board mounts at, so a label is never truncated below its full word and a value ellipsises at the edge of the whole card rather than at half of it. This phase takes it through the programme's six-step loop until a reviewer, opening our capture beside the Anytype mobile kanban reference, scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

The operator, 2026-09-10 ~21:43, verbatim:

> *"Btw fields in board cards should never wrap always under each other add phase for that too"*

Made reading the same 0.0.38 build the programme's opening ruling was made against.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate, scored against Anytype (the board's own landed parity target, `056` ADR-001) rather than Notion — no usable Notion board-card reference exists in this repository |
| D2 | The target binds **every** production surface painting this grammar — `spec.md` §3 lists them — and the fix stays inside `card-field-renderer.ts`'s board-scoped CSS, not Gallery/List's own field container |
| D3 | This child's own reference is Anytype's mobile kanban card, read structurally; the row pitch stays ours, unchanged, since it is not legible at capture resolution |
| D4 | This phase holds the shared css-lane triplet in its own turn, after whichever of `001`-`011` currently holds or last released it |
| D5 | Only the operator's own device read closes the alignment judgement. **No agent ticks that row** |
| D6 | The two-column grid reverses `056` ADR-008 without an ADR of its own; this ruling is read as settling that conflict directly, recorded in `../../roadmap.md` §7 |

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

- [ ] DEFINE complete: every row of `spec.md` §13 has a target, every reference path resolves, the Notion gap is recorded rather than guessed past
- [ ] Every production surface painting this grammar enumerated, and Gallery/List's own field container confirmed unaffected
- [ ] Every lane clause RED-then-GREEN, both numbers recorded, including the corrected "meta grid" assertion
- [ ] `045`'s mechanism guard (`board-card-properties-panel.test.ts`) re-run unmodified and green
- [ ] Board captures (phone + desktop, light + dark) current, and both opened and looked at
- [ ] Image judge **≥ 14/16, no row at 0** — pass #1, against the Anytype reference
- [ ] Image judge **≥ 14/16, no row at 0** — pass #2, on an unchanged tree
- [ ] Every existing `056`/`045` board clause re-runs unchanged and green
- [ ] The operator re-reads the board on their own iPhone and reports fields no longer wrapping — **no agent ticks this row**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-10 — scaffolded

Opened as phase 12 of `076-sheet-visual-parity`, from the operator's ~21:43 ruling. Before anything was written, the operator's own capture and `render-assertions.mjs`'s "meta grid" clause were both read: the two-column grid is not a fixture gap, it is a passing assertion, and it directly reverses `056` ADR-008's own landed single-column, wrap-not-truncate value rule — a contradiction this session records in `../../roadmap.md` §7 as settled by the operator's own words, per D6.
<!-- /ANCHOR:log -->
