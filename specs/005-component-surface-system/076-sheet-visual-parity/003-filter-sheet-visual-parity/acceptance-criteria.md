---
title: "Acceptance Criteria: Filter Sheet Visual Parity"
description: "Acceptance gates for the filter sheet drawing board, production implementation, captures, image judge and operator device read."
trigger_phrases:
  - "acceptance criteria"
  - "003-filter-sheet-visual-parity acceptance criteria"
  - "003 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Filter Sheet Visual Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

Packet: 076-sheet-visual-parity/003-filter-sheet-visual-parity
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
| AC-001 | REQ-001 | Given the 299×678 Notion ceiling, when a target is written, then every reference-derived number says “thumbnail, value unreadable” and names C-1; failing value today: no operator C-1 capture is present | spec.md §13.1 and §13.12 | Unmet | - |
| AC-002 | REQ-001 | Given the reference inventory, when the named files are checked, then every canonical and related path resolves, adjacent non-editor screens are classified and the DEFINE table names its composed source per row; failing value today: the inherited skeleton did not contain the complete adjacent inventory or Source-bearing row table | spec.md §13.1/§13.5; T001/T004 | Unmet | - |
| AC-003 | REQ-002 | Given the two filter surfaces, when the mount chain is traced, then both use production renderers and no fixture-only image is accepted; failing value today: populated, nested and active-rule mounts are proven but empty and comparator state registrations are still absent | plan.md §3; T003 | Unmet | - |
| AC-004 | REQ-003 | Given the current tree, when packet-specific L1–L6 are run before CREATE, then RED is recorded as L1=1, L2=3 per leaf/9 total, L3=0 detail-group markers plus 3 bordered control boxes per leaf, L4=2 unlabelled nested-NOT icon buttons, L5=1 inline comparator per leaf/3 total and L6=3 repeated action rows per leaf/9 total; failing value today: the producer still paints the old grammar | spec.md §13.13; tasks.md T006 | Unmet | - |
| AC-005 | REQ-003 | Given the producer changes, when the lane is re-run, then L1=0, L2 maximum=1, L3 detail-group count=1 per selected rule with 3 rows and 0 nested bordered control boxes, L4=0, L5=0 and L6 summary action rows=0 with detail action/add/Delete group counts=1/1/1; failing value today: the current active-rule row, stacked conditions, inline comparator and repeated actions remain | tasks.md T007–T009; tools/live/sheet-grammar.mjs | Unmet | - |
| AC-006 | REQ-005 | Given the mobile capture pipeline, when the production filter scenarios are captured, then light/dark viewport and full-sheet pairs are current, non-blank and expose the lower action/add/Delete groups; failing value today: current captures show the old UI and no new state pair or image-judge pass exists | screenshots/manifest.json; npm run screenshots:verify | Unmet | - |
| AC-007 | REQ-006 | Given the shared stylesheet and shell, when unchanged 071 floors re-run, then 44–52px row pitch, 16px inset, painted divider, no native select, no overflow and labelled root actions remain green; failing value today: the global floor is green but the packet-specific divider/content clauses are not yet implemented | tools/live/sheet-grammar.mjs | Unmet | - |
| AC-008 | REQ-007 | Given empty, many, nested, filled, comparator and keyboard-open states, when the production harness runs, then each state has evidence and no fake keyboard PNG is substituted; failing value today: registry coverage is populated/nested/active-rule only and no keyboard evidence exists | plan.md §3; T003, T009, T012 | Unmet | - |
| AC-009 | REQ-004 | Given the primary full-sheet light/dark pair beside Notion filters-02/03/07/08, when judge pass #1 scores eight rows, then total is at least 14/16 and no row is 0; failing value today: no judge iteration has run | verification.md iteration 1 | Unmet | - |
| AC-010 | REQ-004 | Given an unchanged tree after pass #1, when judge pass #2 scores the same eight rows, then it again totals at least 14/16 with no row 0; failing value today: no unchanged-tree second pass exists | verification.md iteration 2 | Unmet | - |
| AC-011 | REQ-007 | Given the real-app harness, when Chrome and WebKit exercise FilterPanelRenderer add/inside-tap/rebuild cases, then the sheet remains open and keyboard inset evidence is readable; failing value today: this planning leg did not run the real-app harness | tools/live/sheet-rebuild.json; T012 | Unmet | - |
| AC-012 | REQ-004 | Given any rubric row below 2, when remediation occurs, then it repeats RED → producer fix → GREEN → recapture → judge and does not silently change the target; failing value today: no image-judge findings or remediation iteration exists | verification.md remediation sections | Unmet | - |
| AC-013 | REQ-003 | Given release, when TypeScript/build/Vitest/gate, screenshot freshness, strict validation and scoped graph backfill are read, then every required command is green and the child graph is current, and no release is cut before the child reaches DONE; failing value today: no CREATE/release battery or two-pass DONE exists | plan.md §5/§7; final task output | Unmet | - |
| AC-014 | REQ-008 | Given all agent-side gates pass, when the operator reads the sheet on their own iPhone, then they report alignment; failing value today: no device read exists and an agent must not tick this row | operator gate below; parent D1/D5 | Unmet | - |

### Image-judge rows in AC-009 and AC-010

The reviewer scores these exact eight rows at 0/1/2:

| Row | Concrete expectation |
|---|---|
| Frame | Token-backed phone shell, centred handle/title, correct local back, shared close and Comparator Done slots |
| Sections | Empty entry → summary → detail → rule-action divider group → add-actions divider group → terminal Delete row/group, with larger logical-group gaps than within-group row rhythm |
| Row anatomy | Leading icon, readable label, trailing value/chevron/count as in spec.md §13.5 |
| Controls | Navigation rows open pickers; only focused value editing is a full-width input; no inline comparator dropdown |
| Type | 16px/600 title, 16px/400 labels and values, 13px/400 section label, 14px/400 supporting subtitle and no helper paragraph under fields |
| Spacing | 16px content inset, shell-only radius, 44–52px row window, 16px provisional logical-group gap with an 8px floor and 1px dividers |
| Colour | One grey/dark sheet canvas, text hierarchy, painted dividers, accent and contrast-safe destructive red |
| Both themes | Light/dark share order/geometry and each has independent divider/text contrast with one plain-canvas direction |

Pass requires total ≥14/16 and zero rows = 0. One pass after a change is not the required
unchanged-tree second pass.

### Operator gate

- [ ] The operator has read the redesigned filter sheet on their own iPhone and reports it aligned.
  This row is intentionally Unmet and is never ticked by an agent.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

Not closeable yet. The packet is planned, not created. Closure requires the non-operator rows to be
observed, two consecutive unchanged-tree image-judge passes at ≥14/16 with no zero, and the
operator gate to remain present and unticked until the operator reports alignment.
<!-- /ANCHOR:closure -->
