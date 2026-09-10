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
**Status:** Scaffolded — no iteration run yet
**Date:** 2026-09-10
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

<!-- ANCHOR:iterations -->
## 3. ITERATIONS

| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _none yet_ | | | | | | | | | | | | | | | |

Each row is one JUDGE pass. The eight rubric columns hold a 0/1/2 score with a one-line
justification carried into the Findings cell whenever the score is below 2. Total is the sum out of
16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0) or `fail`; Findings
points at `findings-<iter>.md` under the loop's scratch state on a fail (`plan.md` §6A). The child is
not done in-repo until two consecutive rows both read `pass` on an unchanged tree.
<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 4. OPERATOR GATE

- [ ] The operator has read this sheet on their own iPhone and reports it aligned with the reference — never ticked by an agent (parent `decision-record.md` D1, `goal.md` D5)
<!-- /ANCHOR:operator -->
