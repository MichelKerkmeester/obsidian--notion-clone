---
title: "Goal: Add / Edit Property Sheet Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "007-property-editor-sheet-visual-parity goal"
  - "007 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/007-property-editor-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Opened 007's goal with the rubric thresholds and the operator row"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T004"
    blockers:
      - "No number may come from a 299x678 reference asset (D3)"
      - "The child does not close until the image judge passes twice on an unchanged tree (D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/modals/create-property-modal.ts"
      - "src/views/record-surface/type-picker.ts"
      - "src/views/record-surface/add-property-row.ts"
      - "src/views/property-type-icon.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "007-property-editor-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Notion's delete-row styling is inconsistent across sheets. Delete property renders plain dark in the one Edit-property capture, while Delete view and Delete color setting render red elsewhere. One capture cannot generalise: 007 may not assu"
      - "The Edit-property capture is a relation property. No standard Text or Number Edit-property screen exists here, so which rows a simple property's editor carries is unreadable at 299x678"
      - "Whether tapping the static name row reveals a bordered input is not observable"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Add / Edit Property Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Notion's New property sheet is a bordered name field plus an inline type list in the same sheet, not a name field and a chevron to a separate picker; and its delete row is not uniformly red. This phase takes it through the programme's six-step loop until a reviewer, opening our capture beside the reference, scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate. The lane clauses in `spec.md` §13 are the floor beneath it and never close this sheet on their own |
| D2 | The target binds **every** production surface painting this grammar — `spec.md` §3 lists them — and every parity capture comes from a scenario mounting production |
| D3 | Every Notion capture here is 299×678. The reference is read **structurally**; every number is ours or `TBD — needs operator capture` |
| D4 | This phase runs in its programme order, alone, holding the css-lane triplet by itself |
| D5 | Only the operator's own device read closes the alignment judgement. **No agent ticks that row** |

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

- [ ] DEFINE complete: every row of `spec.md` §13 has a target, every reference path resolves, every number ours or `TBD`
- [ ] Every production surface painting this grammar enumerated and covered
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] Phone light and dark captures current, and both opened and looked at
- [ ] Image judge **≥ 14/16, no row at 0** — pass #1
- [ ] Image judge **≥ 14/16, no row at 0** — pass #2, on an unchanged tree
- [ ] The `071` clauses this sheet carries re-run unchanged and green
- [ ] The operator re-reads the sheet on their own iPhone and reports it aligned — **no agent ticks this row**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-10 — scaffolded

Opened as phase 7 of `076-sheet-visual-parity`. The references in `spec.md` §13 were selected this session and the gaps they cannot answer are recorded there rather than filled by inference.

1 contradiction with landed `071` ruling was recorded at scaffold and is raised as Proposed ADR in `../../roadmap.md` §7 before this child implements. No `071` child is amended from here.
<!-- /ANCHOR:log -->
