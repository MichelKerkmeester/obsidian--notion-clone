---
title: "Goal: Sort Sheet Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "004-sort-sheet-visual-parity goal"
  - "004 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/004-sort-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Opened 004's goal with the rubric thresholds and the operator row"
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
      - "src/views/sort-panel-renderer.ts"
      - "src/views/active-rule-popover-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "004-sort-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Notion's sort-rule reorder affordance was never observed. Only single-rule states were captured. 004 may not claim one, and 071/012 ADR-001's Notion half stays PROVISIONAL exactly as that ADR left it (audit §5 C-4)"
      - "Four files in the sort family show other surfaces entirely (Settings sheets, a chart layout screen) and are not usable as sort references; T001 records which"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sort Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The sort sheet's rule is two rows and a labelled delete after 071/012; Notion merges the two rows into one card, picks direction through a drill-in sub-sheet, and separates per-rule delete from whole-config delete. The active-rule sort popover kept the old grammar. This phase takes it through the programme's six-step loop until a reviewer, opening our capture beside the reference, scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

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

Opened as phase 4 of `076-sheet-visual-parity`. The references in `spec.md` §13 were selected this session and the gaps they cannot answer are recorded there rather than filled by inference.

2 contradictions with landed `071` rulings were recorded at scaffold and are raised as Proposed ADRs in `../../roadmap.md` §7 before this child implements. No `071` child is amended from here.
<!-- /ANCHOR:log -->
