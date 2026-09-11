---
title: "Goal: View-Specific Toolbar Option Popovers Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "016-view-toolbar-options-visual-parity goal"
  - "016 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/016-view-toolbar-options-visual-parity"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Opened 016's goal from the coverage audit gap"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T004"
    blockers:
      - "No card container per the 076 frame ruling"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/calendar-toolbar-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "016-view-toolbar-options-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether the timeline event menu belongs here or in 009's menu family"
    answered_questions:
      - "Pass is 14/16 with no rubric row at 0, judged twice consecutively on an unchanged tree"
      - "Bundled as one child because all four toolbars share a renderer shape, even though reference coverage differs sharply"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: View-Specific Toolbar Option Popovers Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** All four view-specific toolbar option popovers — calendar, timeline, chart, mini-calendar — read as one consistent divider-on-plain-background family, judged on the calendar/mini-calendar anchor surface (the only one with an external reference) and checked for internal consistency on the other three. This phase takes them through the programme's six-step loop until a reviewer scores the anchor surface **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### The ruling this executes

Opened from the operator's coverage-audit instruction (2026-09-11 ~05:35): every sheet/dropdown gets a dedicated multi-phased phase. The audit (`../coverage-audit.md`) found three of four toolbar popovers with zero reference and none with a `076` target.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate; the lane clauses are the floor beneath it |
| D2 | Four toolbars are bundled as one child because they share a renderer shape, per the operator's split-when-different rule (renderer, not reference, decides bundling here) |
| D3 | The calendar/mini-calendar surface is the anchor for judging; the three no-reference surfaces are checked for internal consistency, not judged independently |
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

- [ ] DEFINE complete: every row of `spec.md` §13 has a target and a Source, including explicit `none` rows
- [ ] Chrome-sharing across all four toolbars confirmed
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] Phone light and dark captures current for all four toolbars, and opened and looked at
- [ ] Image judge ≥ 14/16, no row at 0 — pass #1, on the anchor surface
- [ ] Image judge ≥ 14/16, no row at 0 — pass #2, on an unchanged tree
- [ ] The other three surfaces read consistently with the anchor surface
- [ ] The operator re-reads a view-toolbar popover on their own iPhone and reports it aligned — no agent ticks this row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — scaffolded

Opened from the `076` coverage audit: four view-toolbar option popovers sharing a renderer shape but not a reference set, bundled as one child on renderer-similarity grounds with explicit per-surface reference recording.
<!-- /ANCHOR:log -->
