---
title: "Goal: Utility DbModal Sheets Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "017-utility-modal-sheets-visual-parity goal"
  - "017 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/017-utility-modal-sheets-visual-parity"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Opened 017's goal from the coverage audit gap"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T004"
    blockers:
      - "No card container per the 076 frame ruling"
      - "No external reference exists for any of the 18 surfaces this child bundles"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "017-utility-modal-sheets-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether every listed DbModal subclass truly shares one chrome primitive without per-modal overrides"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree, for internal consistency since no external reference exists"
      - "18 surfaces bundled as one child because all share DbModal's chrome and all carry zero reference — the largest single gap the coverage audit found"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Utility DbModal Sheets Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** All 18 zero-reference DbModal utility surfaces, plus toast and bulk-edit field menu, read as one consistent divider-on-plain-background sheet family, judged for internal consistency against the `001`-`016` grammar since no external reference exists. This phase takes a representative sample through the programme's six-step loop until a reviewer scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

Opened from the operator's coverage-audit instruction (2026-09-11 ~05:35): every sheet/dropdown gets a dedicated multi-phased phase. The audit (`../coverage-audit.md`) found 18 surfaces sharing DbModal's chrome, none with any reference, and none with a `076` target — the single largest coverage gap found.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate; the lane clauses are the floor beneath it |
| D2 | 18 surfaces are bundled as one child because they share DbModal's chrome and all carry zero reference, per the operator's split-when-different rule (same renderer, same reference — or lack of one) |
| D3 | With no external reference, the target is composed from the sheet-chrome grammar already landed by `001`-`016`, recorded explicitly as internally-derived |
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

- [ ] DEFINE complete: all 18 surfaces enumerated with shared-chrome and archived-status confirmed
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] Representative-sample captures current (both themes), and opened and looked at
- [ ] Image judge ≥ 14/16, no row at 0 — pass #1
- [ ] Image judge ≥ 14/16, no row at 0 — pass #2, on an unchanged tree
- [ ] The operator re-reads a utility modal on their own iPhone and reports it aligned — no agent ticks this row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — scaffolded

Opened from the `076` coverage audit as the single largest coverage gap found: 18 DbModal-derived utility surfaces plus toast and bulk-edit field menu, all zero-reference, bundled as one child on shared-chrome grounds.
<!-- /ANCHOR:log -->
