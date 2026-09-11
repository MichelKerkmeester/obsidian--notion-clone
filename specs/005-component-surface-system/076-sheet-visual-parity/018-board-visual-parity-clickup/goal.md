---
title: "Goal: Board Visual Parity (ClickUp)"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "018-board-visual-parity-clickup goal"
  - "018 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/018-board-visual-parity-clickup"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Opened 018's goal from the operator's ClickUp board ruling"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T004"
    blockers:
      - "Proposed ADR against 056 ADR-001 must be drafted at DEFINE, per the operator's board-specific ClickUp ruling"
      - "012's single-column field rule stands and must not be reopened"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/board-renderer.ts"
      - "src/views/card-field-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "018-board-visual-parity-clickup-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Exact status-colour tint alpha and outline width — read from the reference at CREATE, not assumed"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree, against the ClickUp reference"
      - "For board surfaces specifically, ClickUp outranks Anytype/Notion — the operator's own 2026-09-11 ruling, recorded as a Proposed ADR against 056 ADR-001"
      - "012's single-column field rule is not reopened; this child targets header/body/anatomy around it"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Board Visual Parity (ClickUp)

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The board's column header, column body and card anatomy read as ClickUp's own board grammar — status-coloured header pills with count and collapse/add controls, tinted-and-outlined columns, and cards with a section label, icon-and-title row and meta row — while `012`'s single-column field rule and `013`'s property-visibility mechanism both stay exactly as landed. This phase takes it through the programme's six-step loop until a reviewer scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

The operator, 2026-09-11 ~05:36-05:38, verbatim:

> *"Board card dragging should look and work like this like in clickup"*
> *"In general for board styling lets mimic clickup"*
> *"For board clickup column headers are great, button to collapse or add new one and just good ui styling"*

Delivered mid-session while the `076` coverage audit was running; evidence at `scratchpad/loop/board-visual-parity-clickup/operator-notes.md`.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate, scored against ClickUp's iOS board reference — a directed departure from `056` ADR-001 (Anytype), for board surfaces specifically, per the operator's own words |
| D2 | `012`'s single-column field-layout rule is not reopened; this child targets header, body and anatomy around it |
| D3 | `013`'s property-visibility mechanism (`045`'s guard, `board-card-properties-panel.test.ts`) is unaffected |
| D4 | This phase holds the shared css-lane triplet in its own turn, sequenced before `019` on the same `board-renderer.ts` file |
| D5 | Only the operator's own device read closes the alignment judgement. No agent ticks that row |
| D6 | The departure from `056` ADR-001 is recorded as a Proposed ADR in `../../roadmap.md` §7, resolved directly by the operator's words rather than left open |

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

- [ ] DEFINE complete: every row of `spec.md` §13 has a ClickUp-sourced target; Proposed ADR drafted in `../../roadmap.md` §7
- [ ] Every production surface enumerated; `012`'s and `045`'s guards confirmed unaffected
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] Board captures (phone + desktop, light + dark) current, and both opened and looked at
- [ ] Image judge ≥ 14/16, no row at 0 — pass #1, against the ClickUp reference
- [ ] Image judge ≥ 14/16, no row at 0 — pass #2, on an unchanged tree
- [ ] `012`'s and `056`'s existing clauses re-run unchanged and green
- [ ] The operator re-reads the board on their own iPhone and reports it matching ClickUp's styling — no agent ticks this row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — scaffolded

Opened directly from the operator's mid-session ClickUp board ruling. Explicitly distinguished from `012` (single-column field rule, stands unmodified) and `013` (property-visibility mechanism, unaffected). The departure from `056` ADR-001 is recorded as a Proposed ADR in `../../roadmap.md` §7 at scaffold, per D6.
<!-- /ANCHOR:log -->
