---
title: "Acceptance Criteria: Sort Sheet Visual Parity"
description: "Acceptance gates for the sort sheet drawing board, production implementation, captures, image judge and operator device read."
trigger_phrases:
  - "acceptance criteria"
  - "004-sort-sheet-visual-parity acceptance criteria"
  - "004 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sort Sheet Visual Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

Packet: 076-sheet-visual-parity/004-sort-sheet-visual-parity
Level: 2
Status: Planned — DEFINE + PLAN complete; CREATE not started
Date: 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

Every non-operator criterion remains Unmet until its evidence is observed. The failing-value prose
is intentional: it preserves what the implementation leg must turn green.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|---|---|---|---|---|---|
| AC-001 | REQ-001 | Given the 299×678 Notion ceiling, when a target is written, then every reference-derived number says "thumbnail, value unreadable" and names the capture that would settle it; failing value today: no operator full-resolution Sort capture is present | spec.md §13.1 and §13.12 | Unmet | - |
| AC-002 | REQ-001 | Given the reference inventory, when the named files are checked, then every canonical and related path resolves, adjacent non-editor screens are classified and the DEFINE table names its composed source per row; failing value today: five of the "sort"-family files are other surfaces, now classified rather than guessed | spec.md §13.1/§13.5; T001/T004 | Unmet | - |
| AC-003 | REQ-002 | Given the two sort surfaces, when the mount chain is traced, then both use production renderers and no fixture-only image is accepted; failing value today: both branches are confirmed production mounts, no scenario work is owed | plan.md §3; T003 | Unmet | - |
| AC-004 | REQ-003 | Given the current tree, when packet-specific L1-L6 are run before CREATE, then RED is recorded as L1=1 non-conforming active-rule row, L2=0 rule-group wrapper markers, L3=1 inline direction dropdown per rule, L4=0 dedicated delete-group boundaries, L5=0 terminal groups and L6's unchanged floor (1 reorder affordance, ≤4 controls/row, 74-character hint); failing value today: the producer still paints the old row stack | spec.md §13.13; tasks.md T006 | Unmet | - |
| AC-005 | REQ-003 | Given the producer changes, when the lane is re-run, then L1=0, L2=1 wrapper/rule, L3=0 inline dropdowns, L4=1 delete group, L5=1 terminal group; failing value today: the merged rule group, drill-in direction sheet, separated delete and terminal group do not exist | tasks.md T007-T010; tools/live/sheet-grammar.mjs | Unmet | - |
| AC-006 | REQ-005 | Given the mobile capture pipeline, when the production sort scenarios are captured, then light/dark viewport and full-sheet pairs are current, non-blank and expose the terminal group; failing value today: current captures show the old UI and no new state pair or image-judge pass exists | screenshots/manifest.json; npm run screenshots:verify | Unmet | - |
| AC-007 | REQ-006 | Given the shared stylesheet and shell, when unchanged 071 floors re-run, then the arrow-pair reorder, ≤4 controls/row, ≤80-character calendar hint, panel-row grammar and sort-rule-stack clauses remain green; failing value today: the global floor is green but the packet-specific group clauses are not yet implemented | tools/live/sheet-grammar.mjs | Unmet | - |
| AC-008 | REQ-004 | Given the primary full-sheet light/dark pair beside Notion sort-01/sort-02, when judge pass #1 scores eight rows, then total is at least 14/16 and no row is 0; failing value today: no judge iteration has run | verification.md iteration 1 | Unmet | - |
| AC-009 | REQ-004 | Given an unchanged tree after pass #1, when judge pass #2 scores the same eight rows, then it again totals at least 14/16 with no row 0; failing value today: no unchanged-tree second pass exists | verification.md iteration 2 | Unmet | - |
| AC-010 | REQ-004 | Given any rubric row below 2, when remediation occurs, then it repeats RED → producer fix → GREEN → recapture → judge and does not silently change the target; failing value today: no image-judge findings or remediation iteration exists | verification.md remediation sections | Unmet | - |
| AC-011 | REQ-006 | Given release, when TypeScript/build/Vitest/gate, screenshot freshness, strict validation and scoped graph backfill are read, then every required command is green and the child graph is current, and no release is cut before the child reaches DONE; failing value today: no CREATE/release battery or two-pass DONE exists | plan.md §5/§7; final task output | Unmet | - |
| AC-012 | REQ-007 | Given all agent-side gates pass, when the operator reads the sheet on their own iPhone, then they report alignment; failing value today: no device read exists and an agent must not tick this row | operator gate below; parent D1/D5 | Unmet | - |

### Image-judge rows in AC-008 and AC-009

The reviewer scores these exact eight rows at 0/1/2:

| Row | Concrete expectation |
|---|---|
| Frame | Token-backed phone shell, centred handle/title/`✕` per ADR-I; direction sub-sheet's own title + Done |
| Sections | Rule group → delete group → terminal group, each its own divider-separated unit, larger between-group gap than within-group rhythm |
| Row anatomy | Property (arrows, type icon, chevron) + direction in one group; delete and terminal rows exactly as spec.md §13.5 |
| Controls | Direction opens a drill-in sub-sheet; property/direction pills remain the only inline controls |
| Type | 16px/600 title, 16px/400 labels, destructive rows at the existing small/600 token, no helper paragraph |
| Spacing | Divider suppressed within a rule group, kept between groups; 44px row floor, 42px indent, 16px inset |
| Colour | One grey/dark sheet canvas, painted dividers, contrast-safe destructive red, unchanged token roles |
| Both themes | Light/dark share order/geometry and each has independent divider/text contrast |

Pass requires total ≥14/16 and zero rows = 0. One pass after a change is not the required
unchanged-tree second pass.

### Operator gate

- [ ] The operator has read the redesigned sort sheet on their own iPhone and reports it aligned.
  This row is intentionally Unmet and is never ticked by an agent.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

Not closeable yet. The packet is planned, not created. Closure requires the non-operator rows to be
observed, two consecutive unchanged-tree image-judge passes at ≥14/16 with no zero, and the
operator gate to remain present and unticked until the operator reports alignment.
<!-- /ANCHOR:closure -->
