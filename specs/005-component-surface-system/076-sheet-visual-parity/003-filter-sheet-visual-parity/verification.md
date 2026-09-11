---
title: "Verification: Phase 3: Filter Sheet Visual Parity"
description: "The image judge's per-iteration score table against the parent's eight-row rubric, plus the lane and operator gates that close this child."
trigger_phrases:
  - "003-filter-sheet-visual-parity verification"
  - "003-filter-sheet-visual-parity judge score"
  - "003-filter-sheet-visual-parity verification.md"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Verification: Phase 3: Filter Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/003-filter-sheet-visual-parity
**Level:** 2
**Status:** CREATE iteration 1 landed lane-green; the image judge has not run and the operator row is untouched
**Date:** 2026-09-11
**Loop graph:** `../decision-record.md` D6; `../plan.md` §6A "Running a child through the loop". This file is the VERIFY step's artefact (parent `spec.md` §5 step 5) and the record the JUDGE and REMEDIATE nodes write to.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:gates -->
## 2. THE THREE GATES

- **(a) Lane.** Every measurable row of `spec.md` §13's DEFINE table green, with its RED number and GREEN number recorded in `tasks.md`.
- **(b) Image judge.** The eight-row rubric below, scored 0-2 each, maximum 16. Pass is **>= 14/16 with no row at 0**, **twice consecutively on an unchanged tree** (parent `decision-record.md` D1).
- **(c) Operator.** The operator's own phone read closes the alignment judgement. **No agent ticks this row** (parent D1, D5).
<!-- /ANCHOR:gates -->

---

<!-- ANCHOR:rubric -->
## 3. JUDGE RUBRIC

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

Each row is scored 0/1/2. Pass is ≥14/16 with no row at 0, twice consecutively on an unchanged
tree. A score below 2 requires a RED → producer fix → GREEN → recapture cycle before the next
judge pass.
<!-- /ANCHOR:rubric -->

---

<!-- ANCHOR:iterations -->
## 4. ITERATIONS

| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _none yet_ | | | | | | | | | | | | | | | |

Each row is one JUDGE pass. The eight rubric columns hold a 0/1/2 score with a one-line
justification carried into the Findings cell whenever the score is below 2. Total is the sum out of
16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0) or `fail`; Findings
points at `findings-<iter>.md` under the loop's scratch state on a fail (`plan.md` §6A). The child is
not done in-repo until two consecutive rows both read `pass` on an unchanged tree.

**No judge pass is recorded yet, and none is claimed.** Iteration 1 of this leg ran the lane and
capture halves only: it can compute geometry and decoded pixel deltas, and it cannot see an image,
so scoring the eight rows here would be fabrication. What it did prove is recorded as evidence on
`tasks.md` T006-T011 — the RED baseline, the GREEN numbers, the moved captures and the battery exit
codes — and what it did not prove is named there too (T009 partial, T012-T014 open). The first
scored row in the table below is owed to a judging node that can open the PNGs.
<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 5. OPERATOR GATE

- [ ] The operator has read this sheet on their own iPhone and reports it aligned with the reference — never ticked by an agent (parent `decision-record.md` D1, `goal.md` D5)
<!-- /ANCHOR:operator -->
