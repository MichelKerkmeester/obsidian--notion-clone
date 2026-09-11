---
title: "Verification: Phase 15: Inline Cell-Editor Popovers Visual Parity"
description: "The image judge's per-iteration score table against the parent's eight-row rubric, plus the lane and operator gates that close this child."
trigger_phrases:
  - "015-cell-editor-popovers-visual-parity verification"
  - "015-cell-editor-popovers-visual-parity judge score"
  - "015-cell-editor-popovers-visual-parity verification.md"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Verification: Phase 15: Inline Cell-Editor Popovers Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/015-cell-editor-popovers-visual-parity
**Level:** 2
**Status:** Scaffolded — no iteration run yet
**Date:** 2026-09-11
**Loop graph:** `../decision-record.md` D6; `../plan.md` §6A. This file is the VERIFY step's artefact and the record the JUDGE and REMEDIATE nodes write to.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:gates -->
## 2. THE THREE GATES

- **(a) Lane.** Every measurable row of `spec.md` §13's DEFINE table green, with RED and GREEN numbers recorded in `tasks.md`.
- **(b) Image judge.** The eight-row rubric below, scored 0-2 each, maximum 16. Pass is **>= 14/16 with no row at 0**, twice consecutively on an unchanged tree.
- **(c) Operator.** The operator's own phone read closes the judgement. No agent ticks this row.
<!-- /ANCHOR:gates -->

---

<!-- ANCHOR:iterations -->
## 3. ITERATIONS

| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _none yet_ | | | | | | | | | | | | | | | |

Total is the sum out of 16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0)
or `fail`. The child is not done in-repo until two consecutive rows both read `pass` on an unchanged
tree.
<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 4. OPERATOR GATE

- [ ] The operator has read a cell editor on their own iPhone and reports it aligned with the reference — never ticked by an agent
<!-- /ANCHOR:operator -->
