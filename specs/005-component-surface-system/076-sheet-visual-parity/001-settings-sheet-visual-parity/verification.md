---
title: "Verification: Phase 1: Settings Sheet Visual Parity"
description: "The image judge's per-iteration score table against the parent's eight-row rubric, plus the lane and operator gates that close this child."
trigger_phrases:
  - "001-settings-sheet-visual-parity verification"
  - "001-settings-sheet-visual-parity judge score"
  - "001-settings-sheet-visual-parity verification.md"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Verification: Phase 1: Settings Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/001-settings-sheet-visual-parity
**Level:** 2
**Status:** CREATE landed, lane green (gate (a) met) — awaiting the image judge (gate (b)) and the operator (gate (c))
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

<!-- ANCHOR:red-green -->
## 4. RED/GREEN REGISTER

T002's clauses landed first and this tree ran them (lane exit 1, RED). Every number below is what the
clause itself printed on the pre-change tree; the GREEN column fills when the producer lands and the
same clause re-runs. The derivation for the prose clause found 10 keys over the 80-character rule —
the five the DEFINE table named plus five more the producer's own key set reaches (`computedSync.{automatic,manual,displayOnly}Desc`, `confirmAutomatic`, `databaseReadonly`, `titleFormat.hint`) —
so the rule's GREEN number is 0 of all ten, in all three locales.

| Clause | Threshold | RED (measured) | GREEN | Evidence |
|---|---|---|---|---|
| **L1** | cards ≥ 5 (radius ≥ 8, gaps ≥ 8 — grouping clause) | **2** cards | **5** cards | lane, this tree |
| **L2** | bordered text controls === 0 | **5** | **0** | lane, this tree |
| **L3** | full-anatomy navigation rows ≥ 13 | **0 of 0** | **13 of 19** (zero slack — every candidate row anatomy-correct) | lane, this tree |
| **L4** | icon-only buttons === 0 | **6** | **0** | lane, this tree |
| **L5** | prose ≤ 80 chars, per locale | **10** runs over; longest **147** (`viewConfig.sourceRules.help`, en) of 201 derived keys × 3 | **0** runs over; longest **76** (`viewConfig.computedCleanup.help`, en) of 206 derived keys × 3 | lane, this tree |
| **L6** | card lighter than canvas, both themes | light **+0.11**, dark **−0.0141** relative luminance (card rgb(30,30,30) on 46) | light `rgb(255,255,255)` on `color(srgb 0.95 0.95 0.95)`; dark card `color(srgb 0.2235,0.2235,0.2235)` on canvas `color(srgb 0.1794,0.1794,0.1794)` — card lighter in both | `__shellSettingsThemeLuminance` |
| **L7** | heading: none / normal / weight ≤ 500 | **0 of 2** (uppercase / 0.44px / 700 / 11px) | **3 of 3** (none / normal / 400, 13px) | lane, this tree |
| **L8** | last card = footer, 0 decorated rows | no footer marker; **13** rows in the last card | footer card, **1** row, **0** decorated | lane, this tree |
| **L9** | (guard) empty stack-row set reported, not vacuous | pre-clause: the width clause passed 0-of-N silently; the clause now arms the guard | **fired on the emptied control** (2 stacks → 0, guard reported) | `__shellSettingsEmptyStackControl` |

`node tools/live/sheet-grammar.mjs` exits **0** on the final tree (was exit 1 at RED). One drift from `plan.md` §3.3's L3 clause text: R09 (Computed sync) could not follow R04/R06 into a click-to-open sub-sheet — the render-assertion bundle resolves `obsidian` to `tools/storybook/obsidian-stub.mjs`, whose `Modal` export throws (`outOfScope`), and the landed placement-button-ink guard (`__shellSettingsPlacementInk`) reads its `.obnotion-new-placement-option` buttons directly off the main sheet. R09 stays inline with its icon but no chevron rather than risk either crashing that guard or leaving it permanently vacuous; L3's 13-row floor is still met by R03–R08 and R10–R15 plus one un-enumerated duplicate (view-level status presets, see Findings below).

<!-- /ANCHOR:red-green -->

---

<!-- ANCHOR:iterations -->
## 3. ITERATIONS

| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CREATE (pre-judge) | recorded by the lander at land time | `screenshots/notion-clone/panels/constructed-view-config-mobile-light.png` | `screenshots/notion-clone/panels/constructed-view-config-mobile-dark.png` | — | — | — | — | — | — | — | — | — | — | not judged — this row is CREATE's own look, not a JUDGE pass | see below |

Each row is one JUDGE pass. The eight rubric columns hold a 0/1/2 score with a one-line
justification carried into the Findings cell whenever the score is below 2. Total is the sum out of
16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0) or `fail`; Findings
points at `findings-<iter>.md` under the loop's scratch state on a fail (`plan.md` §6A). The child is
not done in-repo until two consecutive rows both read `pass` on an unchanged tree. Iteration 1's
numeric row is the JUDGE node's to write, in the next graph-loop pass over this landed tree.

**CREATE's own look at the captures named above, against R-4/R-5 for the frame and R-1 for the
content:** the five-card grouping, sentence-case grey headings and full-width borderless controls
read as a close match to the reference — Source folder / Source rules / New note folder / New
record template / Database cover / Record icon field all present as one-line icon+value+chevron
rows the way R-1's Layout/Properties/Filter rows do, the dropdown-valued rows (Record icon field,
View type) now right-hang their value against the chevron after a text-align fix caught by eye
during this same session, and the card reads lighter than the canvas in both themes with no
uppercase/letterspaced heading left. Three differences are visible or structural, all already named
above or in `spec.md`: (1) the header's trailing control is still `✕` where R-4 shows `Done`
— **ADR-I**, a family decision outside this child; (2) the capture is `capture: "viewport"` —
804×1748, the same fixed-frame convention every other panel in this repository's manifest uses —
so only the Name and Current database cards sit above the fold in this single PNG; Current view,
Display and the footer action row are lane-verified (5 cards, 13/19 qualifying rows, the footer
card literally last with its one undecorated action row) but not visible without scrolling in this
specific frame; (3) R09 (Computed sync, "Formula result storage") stayed inline with an icon and no
chevron rather than follow R04/R06 into a sub-sheet, recorded in the RED/GREEN register above.
<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 4. OPERATOR GATE

- [ ] The operator has read this sheet on their own iPhone and reports it aligned with the reference — never ticked by an agent (parent `decision-record.md` D1, `goal.md` D5)
<!-- /ANCHOR:operator -->
