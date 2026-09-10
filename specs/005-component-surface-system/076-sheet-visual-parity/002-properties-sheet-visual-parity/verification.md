---
title: "Verification: Phase 2: Properties Sheet Visual Parity"
description: "The image judge's per-iteration score table against the parent's eight-row rubric, plus the lane and operator gates that close this child."
trigger_phrases:
  - "002-properties-sheet-visual-parity verification"
  - "002-properties-sheet-visual-parity judge score"
  - "002-properties-sheet-visual-parity verification.md"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Verification: Phase 2: Properties Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/002-properties-sheet-visual-parity
**Level:** 2
**Status:** CREATE landed; lane green; CREATE-node self-score recorded below — the JUDGE node's own pass has not run
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

<!-- ANCHOR:iterations -->
## 3. ITERATIONS

| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CREATE self-score (not the JUDGE pass) | this commit | `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` | `constructed-column-manager-mobile-dark.png` | 1 | 2 | 2 | 2 | 2 | 2 | 1 | 1 | 13 | 0 | self-score, informal | see paragraph below |

Each row is one JUDGE pass. The eight rubric columns hold a 0/1/2 score with a one-line
justification carried into the Findings cell whenever the score is below 2. Total is the sum out of
16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0) or `fail`; Findings
points at `findings-<iter>.md` under the loop's scratch state on a fail (`plan.md` §6A). The child is
not done in-repo until two consecutive rows both read `pass` on an unchanged tree.

**The row above is the CREATE node's own read, not the JUDGE node's pass** (`../decision-record.md`
D6 keeps these two nodes distinct; the loop graph runs JUDGE after LAND). It is recorded so the
operator and the JUDGE node both have a documented baseline before the official run, per this
child's dispatch. Self-scored against the phone captures, both themes, opened and looked at:

- **Frame (1)** — Unchanged for this child by design (`spec.md` §13.1); ADR-I stays open and inherited
  from `076/001`, so 1 is the expected ceiling here, not a remediation trigger.
- **Sections (2)** — Both states present and correctly shaped in both themes: one undivided card
  when nothing is hidden, two headed cards when one is (`L4`, computed-style confirmed). Headings
  read `Shown in table` / `Hidden in table`, sentence case, with the bulk link right-aligned on the
  same line — matching R-1/R-2 exactly, including the copy.
- **Row anatomy (2)** — `arrow · arrow · type icon · label · eye` in that order, confirmed in the
  actual capture; zero checkboxes remain (`L1`).
- **Controls (2)** — The state control is an eye/eye-off icon button, not an input; the reorder pair
  is unchanged per ADR-001's extension (not a grip); no native select, no bordered text input.
- **Type (2)** — Section heading drops its uppercase transform; row label/value type is unchanged
  (already correct per `spec.md` §13.5).
- **Spacing (2)** — Row height reads 48px (44px token plus the row's own 2px/2px padding), clearing
  the 44px floor; card inset/gap reuse `076/001`'s already-scored figures rather than re-deriving
  them, so this is inherited confidence, not independently re-measured against Notion here.
- **Colour (1)** — Light theme: card reads visibly lighter than canvas, matching the target
  relationship. **Dark theme: the card is barely distinguishable from its own canvas** — this is
  `076/001`'s own open Proposed ADR-K (the shared `--obnotion-settings-card-fill` computes darker
  than canvas in dark theme), inherited here exactly as `spec.md` §6/§13.7 predicted and explicitly
  not this child's to fix. Scored 1 rather than 0 because the light-theme relationship is correct
  and the defect is a tracked, known dependency rather than an unaddressed contradiction.
- **Both themes (1)** — Light is fully consistent with the target. Dark is structurally identical
  (same two cards, same row anatomy) but the card boundary does not read clearly against the canvas
  for the same ADR-K reason above, so the two themes are not equally legible even though they are
  structurally matched.

**What could not be directly viewed.** The fixture's default state photographs 16 property rows,
which scroll past the phone viewport before the hidden section and the add-property card enter
frame — the static capture shows only the "everything shown" portion of the list. The hidden-section
card and the add-row card were confirmed structurally (not visually) through `L4`/`L6`'s
computed-style assertions (background distinct from canvas, radius ≥ 8px) and visually through the
6-column hand-authored `panel-column-manager` fixture (not the judged capture, and not carrying the
phone-sheet card CSS since it renders as the desktop anchored presentation) after that fixture's own
row markup was brought current in this same change.

**Self-score total is 13/16, below the 14/16 pass bar, driven entirely by the inherited dark-theme
ADR-K defect (Colour, Both themes).** This is not a defect this child introduces or can close on its
own — the shared token is `076/001`'s to fix — so a first official JUDGE pass may need `076/001`'s
own dark-card fix to land first, or may accept the light-theme correctness and score the dark
shortfall as a shared, tracked risk rather than a `076/002`-owned remediation target. Recorded here
so the JUDGE node has this reasoning rather than rediscovering it.
<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 4. OPERATOR GATE

- [ ] The operator has read this sheet on their own iPhone and reports it aligned with the reference — never ticked by an agent (parent `decision-record.md` D1, `goal.md` D5)
<!-- /ANCHOR:operator -->
