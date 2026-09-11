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
**Status:** CREATE iteration 1 landed lane-green; iteration 1 JUDGE scored **3/16 with 5 zeros — fail**; remediation owed before the next judge pass; operator gate remains untouched
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
| **1 (JUDGE)** | this commit | `screenshots/notion-clone/panels/constructed-filter-panel-sheet-mobile-light.png` | `constructed-filter-panel-sheet-mobile-dark.png` | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | **3** | **5** | **fail** | `findings-1.md` |

Each row is one JUDGE pass. The eight rubric columns hold a 0/1/2 score with a one-line
justification carried into the Findings cell whenever the score is below 2. Total is the sum out of
16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0) or `fail`; Findings
points at `findings-<iter>.md` under the loop's scratch state on a fail (`plan.md` §6A). The child is
not done in-repo until two consecutive rows both read `pass` on an unchanged tree.

### Iteration 1 — JUDGE node's own pass

Opened `constructed-filter-panel-sheet-mobile-{light,dark}.png` (804x2674, full sheet) and
`constructed-active-rule-filter-mobile-{light,dark}.png` (companion), plus the named reference set:
operator `0040-properties-card-container-rejected.png` and `0040-filter-property-picker-padding.png`,
Notion `notion-ios-database-filters-{01,02,08}-*.webp`, and Anytype
`anytype-mobile-sheet-filter-condition-text-light.png`. Both OUR captures share one defect: every
detail control (`AND (all)`, `Field 3`, `equals`, `Backlog`, `Field 7`, `greater than`, `20`, `Field
2`, `is not empty`) renders as its own bordered, rounded, filled pill — the same dropdown-box
grammar the DELTA table names as the *before* state (spec.md §13.11), not the merged plain-canvas
divider group the DEFINE and both reference families (Notion filters-08's `Title`/`Contains`/`Value
… Edit` group; Anytype's icon-tile-plus-plain-text `Name`/`Is`/`Value` rows) show.

- **Frame (0)** — Handle, centred `Filter` title and trailing `✕` match the target, but every
  detail row sits inside its own white-on-light / dark-on-darker rounded rectangle — a second
  painted surface on top of the plain sheet canvas. Parent D7's own rubric-impact clause is explicit:
  "a card container around rows or values scores 0 on Frame regardless of how well it otherwise
  matches the reference." This is a per-control container, not even the single whole-group card D7
  was written to reject in `0040-properties-card-container-rejected.png` — it is the stricter
  violation.
- **Sections (0)** — All three rules render simultaneously expanded (summary row + full detail pills
  + full action rows each), with uniform 1px hairline spacing throughout — no visible 16px
  logical-group gap distinguishing summary from detail from actions, as the DEFINE and diagnosis-
  table.md §2 require. No terminal `Delete filter` row/group appears anywhere in the full-sheet
  capture; the sheet ends at `+ Add condition`. `Add rule group` / `Negate rule` / `Remove rule`
  repeat identically per rule exactly as the *before* state's "repeated action rows" describes them
  (spec.md §13.2), not the single rule-action/add-actions/Delete divider groups Notion filters-02
  and this child's own §13.4 order describe.
- **Row anatomy (1)** — Summary rows (`Field 3 · equals · Backlog`, icon + label + chevron) and
  action rows (icon + label) match the target. The detail rows do not: `equals` and `Backlog` carry
  no leading icon and are dropdown-shaped controls, not the label-plus-chevron/Edit navigation rows
  spec.md §13.5 and Notion filters-08 show.
- **Controls (0)** — `equals` renders as an inline comparator dropdown directly in the detail area,
  and `Backlog` (the value) renders as an inline dropdown rather than opening a value editor. Both
  are explicitly named exclusions in this rubric row's own text ("no inline comparator dropdown") and
  in spec.md §13.6 ("only focused value editing is a full-width input").
- **Type (1)** — Title weight/size and row-label sizing read consistent with the ladder and no helper
  paragraph is visible under any field. The 13px sentence-case section label the Sections tier
  requires (e.g. `Filter Group 1`, present in Notion filters-02) does not appear anywhere in either
  capture.
- **Spacing (0)** — Content inset reads consistent, but the detail pills carry their own corner
  radius — spec.md §13.3 sets "content groups have no container radius or inset fill" and D7 assigns
  radius to the shell only. No differentiated 16px-between-groups vs 1px-within-group rhythm is
  visible; every row in the sheet uses the same spacing.
- **Colour (0)** — The sheet canvas is one flat grey/dark tone as required, and destructive `Remove
  rule` text is a legible red in both themes, but the detail pills paint a second surface fill (white
  on light, lighter-dark on dark) directly on the sheet canvas — the same "bg container" the operator
  named in `0040-properties-card-container-rejected.png` ("never use bg container like here for
  values"), now recurring per control instead of per group.
- **Both themes (1)** — Light and dark share identical order and geometry, and each theme's own
  divider/destructive-red contrast is independently legible. Credit capped at 1 because both themes
  carry the same plain-canvas-direction violation (the detail pills), so "one plain-canvas direction"
  from this row's own text is not met in either theme.

**Total 3/16, 5 zeros (Frame, Sections, Controls, Spacing, Colour) — fail**, on the total, the
zero-row rule and by a wide margin. Findings recorded in `findings-1.md` for REMEDIATE. T009 on
`tasks.md` already named this gap as "partial, deliberately not ticked" before this pass ran; this
judge pass confirms the same gap from the rendered image rather than from DOM markers.
<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 5. OPERATOR GATE

- [ ] The operator has read this sheet on their own iPhone and reports it aligned with the reference — never ticked by an agent (parent `decision-record.md` D1, `goal.md` D5)
<!-- /ANCHOR:operator -->
