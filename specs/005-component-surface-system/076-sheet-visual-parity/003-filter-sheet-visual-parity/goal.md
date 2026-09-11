---
title: "Goal: Filter Sheet Visual Parity"
description: "Durable directive and completion contract for defining, implementing, capturing, judging and remediating the filter sheet."
trigger_phrases:
  - "packet goal"
  - "003-filter-sheet-visual-parity goal"
  - "003 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity"
    last_updated_at: "2026-09-11T04:54:00.000Z"
    last_updated_by: "301-loop-003-filter-sheet-visual-parity"
    recent_action: "Reconciled divider grammar with parent D7 and packet RED values"
    next_safe_action: "Execute CREATE T006 from the recorded packet RED values"
    blockers:
      - "C-1 operator capture is absent; reference pixel values remain provisional"
      - "Image judge must pass twice on an unchanged tree"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "verification.md"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/active-rule-popover-renderer.ts"
      - "src/views/dropdown-field.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/screenshots/constructed-scenarios.mjs"
      - "tools/live/render-assertion-harness.ts"
      - "tools/live/sheet-rebuild.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-filter-sheet-visual-parity-plan-1"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Notion's AND/OR conjunction position is unreadable at 299x678 and remains Proposed under D15"
      - "C-1 settles provisional row, inset, section-gap and control-size comparisons"
    answered_questions:
      - "The populated and active-rule scenarios mount production renderers; no fixture mismatch was found"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Filter Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

Take the filter sheet through DEFINE → PLAN → CREATE → SCREENSHOT → VERIFY → REMEDIATE until
its production phone surface reads like the named Notion filter references. Replace the current
stacked bordered pills with one summary row per condition, a drill-in divider group containing
property, comparator and value rows on the plain sheet canvas, labelled rule-action and add-actions
groups, a terminal whole-filter Delete row/group and a comparator child sheet. Notion's references
show inset rounded cards, but the operator's parent D7 ruling requires plain-canvas dividers with no
card containers. The active-rule filter popover uses the same grammar. This is presentational only;
filter behavior and stored data remain unchanged.

The image judge is the gate: eight parent rubric rows, each 0/1/2, at least 14/16 with no row at
0, twice consecutively on an unchanged tree. The lane is a floor. The operator's own iPhone read is
required and never agent-ticked.

### Binding decisions

| ID | Decision |
|---|---|
| D1 | Image judge closes the visual work; two unchanged-tree passes are required |
| D2 | Both production surfaces in spec.md §3 and their constructed scenarios are in scope |
| D3 | Notion assets are 299×678 thumbnails; numeric reference values are provisional or C-1/TBD |
| D4 | This child runs in parent order and acquires the css-lane before CSS edits |
| D5 | AND/OR placement is unreadable and stays Proposed; no 071 landing is amended |
| D6 | Empty state is covered through a production scenario; keyboard state is proven by the real inset probe, not a fake PNG |
| D7 | Sheet content uses one plain canvas with hairline divider groups and no rounded/lighter row or value containers; a recessed search field remains a control |
| R1 | If the additive Notion detail/card grammar differs from a landed Anytype or 071 ruling, record the difference as Proposed ADR-H under D15 |

### Failing-value baseline

The packet-specific current RED is L1=1 active-rule three-dropdown row, L2=3 condition rows per
leaf/9 total, L3=0 detail-group markers plus 3 bordered control boxes per leaf, L4=2 unlabelled
nested-NOT icon buttons, L5=1 inline comparator per leaf/3 total and L6=3 repeated action rows
per leaf/9 total. The unchanged global floor already reads 9/9 rows at 48px, 16px insets, 357px
span, 0 native selects and 4 labelled root actions. Current captures are 804×1748 PNG pixels
(402×874 CSS phone frame), with a full-sheet filter pair at 804×2590. The active-rule pair shows
Field 3 / equals / Backlog in three side-by-side controls. These are before values, not a visual
parity claim.

### Operator copy

The operator holds the parent directive as the session objective. Any change to the directive or
threshold is a parent amendment first; this goal mirrors the current packet and does not authorize
an implementation leg to change the target silently.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] T001–T004: all references/classifications, before captures, mount proof, DEFINE row table and DELTA are complete; thumbnail numeric gaps name C-1
- [ ] T005–T006: exact files/functions, scenario/mount path, L1–L6 and capture plan are written; packet RED values are recorded before producer edits
- [ ] T007: active-rule filter has no three-dropdown row (L1 target 0; failing value 1)
- [ ] T008: list has one summary row per condition and detail has one plain-canvas divider group with three rows and zero nested bordered control boxes (L2 target maximum 1; L3 target group count 1 and nested control count 0; failing values 3 and 0/3)
- [ ] T009: comparator is navigational, actions are labelled and divider-grouped, clear exists, both themes pass floors (L4 target 0; L5 target 0 inline; L6 target summary 0 and detail/add/Delete groups 1/1/1; failing values 2/1/3)
- [ ] T010: current light/dark viewport, full-sheet, summary, nested, comparator, active-rule and empty-state evidence is captured and opened
- [ ] T011: L1–L6 and unchanged 071 floors are green; TypeScript/build/Vitest/gate and screenshot freshness are read
- [ ] T012: Chrome/WebKit real-app filter cases and keyboard-inset evidence are read
- [ ] T013: image judge pass #1 is ≥14/16 with no zero and pass #2 repeats on the unchanged tree; release remains blocked until DONE
- [ ] T014: operator row is present and remains unticked; only the operator can report device alignment
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-11 — DEFINE + PLAN corrected

Read the parent 076 spec, plan and decision record before the child skeleton. Read the local rule
router and the design-fundamentals router/references. Opened the current filter-panel, nested,
full-sheet and active-rule light/dark captures. Audited Notion database/filter flows, adjacent
filter routes, Anytype mobile filter sheets and the 047 research. No operator notes or C-1 detail
capture were present; the full-resolution operator entry and rejected-container captures were
present. Reconciled the Notion card observation with parent D7: production groups use dividers on
one plain sheet canvas. No implementation was made; CREATE remains open.
<!-- /ANCHOR:log -->
