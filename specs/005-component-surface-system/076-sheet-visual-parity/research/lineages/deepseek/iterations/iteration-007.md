# Iteration 007 — DEPTH, second axis (both themes, states, dark-side comparison object)

**Gap class:** DEPTH (second pass, different axis) · **Status:** complete · **newInfoRatio:** 0.73
**Findings file:** `findings/iter-7.md`

## Focus

The two depth requirements the packet's own rulings make unavoidable and no child satisfies: the **dark
column has no Notion reference**, and **states are neither targeted nor scored**.

## Headline findings

1. **T-1 — the dark column has no Notion iOS reference, but Anytype (52 dark assets in
   `mobile/sheets/`) and ClickUp (49 dark files) both do, and the packet's own statement of the gap is
   over-broad.** `001/spec.md:215` says *"no dark-theme Notion capture exists at any rung"*; there are
   **23** dark-named Notion assets, all three desktop-web dark-mode flows. The claim it needs (no dark
   *iOS sheet* reference) holds. Proposed: a **theme-composition rule** in D9 — an element's Source is
   chosen per theme where the references differ by theme — plus the wording correction. `002`'s dark
   Colour-0 failure is the worked case of a self-derived dark target going wrong.
2. **T-2 — the both-themes clause tests a floor per theme and never tests agreement.** `CARD_STEP_FLOOR
   = 12` derived from light's own 13/255; `002` closed its Colour 0 with **dark 18/255 vs light
   12.75/255** — both pass, and they diverge 41% in the exact dimension the rubric's row names. Proposed:
   an agreement clause (`LC-6`) and a tightened `Both themes` cell.
3. **T-3 — `002`'s L8 passes vacuously once D7 removes the card.** With no section backgrounds,
   `paints` is `[]`, `[].some(...)` is `false`, and `l8Pass` is `true` — printing
   `card-vs-canvas step [], floor 12` as a PASS. `001` has the guard (L9); `002` does not, and its own
   remediation triggers the vacuity. Proposed: `002`'s L9 guard plus the packet-wide rule that a clause
   whose subject a ruling removes is retired or reads `N/A`, never `PASS`.
4. **T-4 — states are template text in all 19 children and no rubric row can score one.** `013`'s edge
   cases are two bullets with no theme, `017`'s file never says `dark`; the rubric's eight rows contain
   no state row. Meanwhile states have already cost the loop a judge iteration (`002`'s `Sections 1`) and
   left a prior criterion half-proven (`010`'s missing filter-empty scenario). Proposed: a states
   requirement in the Definition of Done, state captures in the judged set, and a ninth rubric row
   (pass → ≥ 16/18) with the arithmetic consequence flagged.

## Depth verdict (themes and states)

| Requirement | Satisfied by |
|---|---|
| Dark Source named per element | 0 / 19 |
| Both-themes clause testing agreement | 0 / 19 |
| Guard against vacuous pass after D7 | 1 / 19 (`001` L9) |
| Named states photographed and judged | 0 / 19 |
| Rubric row that can score a state | none |

## What was ruled out

- The packet's "no dark Notion reference" is **half right**: 23 dark Notion assets exist, but all are
  desktop-web dark-mode flows, so no dark *phone sheet* reference exists. T-1 corrects the scope of the
  sentence, not the finding.
- `EDGE CASES` sections are **not** empty boilerplate everywhere — `001`'s four bullets are substantive
  and name both themes; the finding is scoped to what the judged set and the rubric can see.
- Whether `002`'s L8 is the **only** vacuity is not exhaustively checked; the general rule is stated and
  the worked case named.

## Next focus

**DESIGN SYSTEM, second axis (iteration 8):** the typography scale and colour roles for status/priority,
and the stacking model — the parts of the system the rulings name but no token carries. Entry points:
`--obnotion-font-*` (11/12/13/14/16) against D7's 17pt; the nine host `--status-color-fg-*` swatches at
`styles.css:6418-6426` and `018`'s ClickUp status pill; `048`'s stacking model and the lane's
`.is-stack-parent` assertions; and `--obnotion-surface-overlay` against the dark-theme ladder.
