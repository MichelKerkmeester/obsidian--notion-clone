---
title: "Goal: Fuzzy File-Suggest Sheets Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "014-fuzzy-suggest-sheets-visual-parity goal"
  - "014 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/014-fuzzy-suggest-sheets-visual-parity"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Opened 014's goal from the coverage audit gap"
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
      - "src/main.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "014-fuzzy-suggest-sheets-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether all five call sites truly share one shell, or one diverges"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree"
      - "Bundled as one child because all five surfaces share renderer and reference family"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Fuzzy File-Suggest Sheets Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every FuzzySuggestModal-family surface — base-file-suggest, image-file-suggest, markdown-file-suggest, and the two settings-stacked pickers — reads as one consistent divider-on-plain-background result list. This phase takes the shared chrome through the programme's six-step loop until a reviewer scores the representative capture **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

Opened from the operator's coverage-audit instruction (2026-09-11 ~05:35): every sheet/dropdown gets a dedicated multi-phased phase. The audit (`../coverage-audit.md`) found these five surfaces inventoried with no reference of any kind and no prior `076` child.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate; the lane clauses are the floor beneath it |
| D2 | Five call sites are bundled as one child because they share a renderer and a reference family, per the operator's split-when-different rule |
| D3 | Anytype's desktop palette is read structurally only (row anatomy) — no phone-form-factor reference exists, and the frame comes from the 076 frame ruling directly |
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

- [ ] DEFINE complete: every row of `spec.md` §13 has a target and a Source; shared-chrome confirmation recorded
- [ ] Every production surface (all five) enumerated
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] Phone light and dark captures current for all five call sites, and opened and looked at
- [ ] Image judge ≥ 14/16, no row at 0 — pass #1
- [ ] Image judge ≥ 14/16, no row at 0 — pass #2, on an unchanged tree
- [ ] The operator re-reads a picker on their own iPhone and reports it aligned — no agent ticks this row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — scaffolded

Opened from the `076` coverage audit: five FuzzySuggestModal-family surfaces with no reference of any kind and no prior visual target, bundled as one child on shared-renderer grounds.
<!-- /ANCHOR:log -->
