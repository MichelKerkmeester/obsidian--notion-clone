---
title: "Goal: Sort Sheet Visual Parity"
description: "Durable directive and completion contract for defining, implementing, capturing, judging and remediating the sort sheet."
trigger_phrases:
  - "packet goal"
  - "004-sort-sheet-visual-parity goal"
  - "004 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/004-sort-sheet-visual-parity"
    last_updated_at: "2026-09-11T08:30:00.000Z"
    last_updated_by: "305-loop-004-sort-sheet-visual-parity"
    recent_action: "Reconciled merged-rule/divider grammar with parent D7/D9 and packet RED values"
    next_safe_action: "Execute CREATE T007 from the recorded packet RED values"
    blockers:
      - "No operator full-resolution Sort capture; reference pixel values remain provisional"
      - "Image judge must pass twice on an unchanged tree"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "verification.md"
      - "src/views/sort-panel-renderer.ts"
      - "src/views/active-rule-popover-renderer.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/screenshots/constructed-scenarios.mjs"
      - "tools/live/render-assertion-harness.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "004-sort-sheet-visual-parity-plan-1"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Notion's sort-rule reorder gesture is unreadable at 299x678 and remains PROVISIONAL under 071/012 ADR-001 (roadmap ADR-F)"
      - "An operator full-resolution Sort capture would settle row pitch, group gap, indent and shell radius comparisons"
    answered_questions:
      - "The sort-panel and active-rule-popover/ruleKind:sort scenarios mount production renderers; no fixture mismatch was found"
      - "The active-rule sort popover renders 2 dropdowns (field, direction), not 3 as the inherited scaffold draft claimed"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sort Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

Take the sort sheet through DEFINE → PLAN → CREATE → SCREENSHOT → VERIFY → REMEDIATE until its
production phone surface reads like the named Notion sort references. Replace the current loose
row stack — a property pill, a direction pill and a plain delete row, uniformly hairline-divided —
with one merged rule group (property + direction), a direction drill-in sub-sheet, a delete row in
its own separated group, and a terminal group holding both "Add sort" and a new "Delete sort".
Notion's references show inset rounded cards, but the operator's parent D7 ruling requires
plain-canvas dividers with no card containers, and D9 requires each row's target to compose from
whichever of Anytype, Notion or ClickUp reads best. The active-rule sort popover uses the same
grammar. This is presentational only; sort behavior and stored data remain unchanged.

The image judge is the gate: eight parent rubric rows, each 0/1/2, at least 14/16 with no row at
0, twice consecutively on an unchanged tree. The lane is a floor. The operator's own iPhone read is
required and never agent-ticked.

### Binding decisions

| ID | Decision |
|---|---|
| D1 | Image judge closes the visual work; two unchanged-tree passes are required |
| D2 | Both production surfaces in spec.md §3 and their constructed scenarios are in scope |
| D3 | Notion assets are 299×678 thumbnails; numeric reference values are provisional or TBD |
| D4 | This child runs after `003` in parent order and confirms the css-lane release from `002` before acquiring it |
| D5 | Notion's reorder gesture is unreadable and stays PROVISIONAL (roadmap ADR-F); `071/012` ADR-001 is not amended |
| D6 | No keyboard-open state applies to this sheet (no text input); the empty state is the existing `panel.emptySorts` copy |
| D7 | Sheet content uses one plain canvas with hairline divider groups and no rounded/lighter row or value containers; a dropdown picker pill remains a control, not a grouping surface |
| D9 | Each DEFINE row composes its target from whichever of Anytype, Notion or ClickUp reads best, named in spec.md §13.5's Source column |
| R1 | The per-rule-delete placement difference from `071/012` is recorded as an additive contradiction in spec.md §13.15, not amended into `071/012` |

### Failing-value baseline

The packet-specific current RED is L1=1 active-rule popover row using bare unlabelled side-by-side
dropdown pills (2 controls: field, direction — corrected from the inherited scaffold's claim of 3),
L2=0 rule-group wrapper markers (property and direction are two independent sibling rows), L3=1
inline direction dropdown per rule, L4=0 dedicated delete-group boundaries (the delete row shares
the same uniform hairline treatment as every other row), and L5=0 terminal groups (no whole-config
"Delete sort" action exists in the source). The unchanged `071` floor already reads 1 reorder
affordance (the arrow pair), ≤4 interactive controls per row (3 on the property row, 1 on the
direction row) and a 74-character calendar-hint paragraph (≤80 floor). Current captures show two
sort rules in the full-sheet pair; the active-rule pair shows Field 7 / Descending in two
side-by-side dropdown pills. These are before values, not a visual parity claim.

### Operator copy

The operator holds the parent directive as the session objective. Any change to the directive or
threshold is a parent amendment first; this goal mirrors the current packet and does not authorize
an implementation leg to change the target silently.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] T001-T004: all references/classifications, before captures, mount proof, DEFINE row table and DELTA are complete; thumbnail numeric gaps say "thumbnail, value unreadable"
- [ ] T005-T006: exact files/functions, scenario/mount path and L1-L6 are written; packet RED values are recorded before producer edits
- [ ] T007: property and direction render inside one rule group with no divider between them (L2 target 1 wrapper per rule; failing value 0)
- [ ] T008: direction opens a drill-in sub-sheet with 0 inline dropdowns remaining on the sheet (L3 target 0; failing value 1 per rule)
- [ ] T009: the per-rule delete sits in its own divider group and a terminal group holds "Add sort" plus "Delete sort" (L4 target 1 delete group, L5 target 1 terminal group; failing values 0 and 0)
- [ ] T010: the active-rule sort popover reads with the sheet's own leading-icon/label grammar, still carrying 2 controls (L1 target 0 non-conforming rows; failing value 1)
- [ ] T011: current light/dark viewport, full-sheet, calendar-variant and active-rule evidence is captured and opened
- [ ] T012: L1-L6 and unchanged 071 floors are green; TypeScript/build/Vitest/gate and screenshot freshness are read
- [ ] T013: image judge pass #1 is ≥14/16 with no zero and pass #2 repeats on the unchanged tree; release remains blocked until DONE
- [ ] T014: operator row is present and remains unticked; only the operator can report device alignment
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — DEFINE + PLAN written

Read the parent 076 spec, plan and decision record (D1-D9) before the child skeleton. Read the
design-fundamentals router and cited references (ux-laws, hierarchy, diagnosis-table,
depth-and-detail, color-system, interaction-craft). Opened the current sort-panel and active-rule
light/dark captures and read `sort-panel-renderer.ts`, `active-rule-popover-renderer.ts` and
`toolbar-primitives.ts` line-by-line to confirm the before, correcting the inherited scaffold's
claim of 3 active-rule dropdowns to the actual 2. Audited every Notion "sort"-family capture,
classifying five as other surfaces (Filter, Group, Settings ×3, sidebar Sort-by menu); read both
full-resolution Anytype pairs (Sorts list, direction sheet); confirmed the ClickUp "settings-sort"
file is a mislabeled account-settings picker and read the general ClickUp sheet-frame reference
D9 already cites. Composed the DEFINE table's Source column per D9. Reconciled the Notion card
observation with parent D7: production groups use dividers on one plain sheet canvas. Recorded the
per-rule-delete placement difference from `071/012` as an additive §13.15 contradiction, and
recorded the Anytype "Edit" toggle as evidence that does not settle `071/012` ADR-001's PROVISIONAL
Notion-side flag. No implementation was made; CREATE remains open.
<!-- /ANCHOR:log -->
