# Iteration 002 — DEPTH

**Gap class:** DEPTH · **Status:** complete · **newInfoRatio:** 0.72
**Findings file:** `findings/iter-2.md`

## Focus

Grade all 19 children per phase against L1/L2/L3/L3+ (thresholds, RED/GREEN lane clauses, capture ids,
both-theme targets, rubric rows, judge per-row expectation) and write the missing text.

## The grade

| Band | Children | Lowest phase | Why |
|---|---|---|---|
| L3+ | `001` | — | 22-row DEFINE table, 10 thresholded clauses, full-sheet capture ids, D7 remediation block |
| L3 | `002`–`011` (10) | Phase F | named clauses with RED numbers, scenario + mount named; no judge per-row expectation |
| L2 | `012` | Phase A/D | 6-row table, 13 `TBD`s, no judged capture id |
| **L1+–L2** | **`013`–`019` (7)** | **Phase A/B/D** | 4–9-row tables, **0 named lane clauses**, **0 capture ids**, no "Both themes" row, Phase D names no judged image |

## Headline findings

1. **D-1** `013`–`019` name **zero** lane clauses. `013/tasks.md:57` says *"Run every new clause RED"*
   — "every new clause" has no antecedent. Phase B is a promise, so two executors of the same child
   produce two different evidence contracts and the JUDGE has nothing stable to re-score.
2. **D-2** The D2 full-sheet judged-capture contract exists for `001`–`011` and **none** of `012`–`019`.
   Measured: exactly **11** `capture: "sheet"` scenarios in `screenshots/manifest.json`, mapping
   one-to-one onto the eleven sheets. `013`'s surface is `capture: "viewport"`; `014`'s five
   FuzzySuggest surfaces have **no scenario at all**; `017`'s eighteen modals have three hand-written
   `element` fixtures (D2(b) disqualifies them) plus one sheet-shaped scenario; toast is `element`.
   The judged-image registration is proposed per child, with the five-line
   `constructedScenario` change named.
3. **D-3** `013`'s DEFINE table is 4 rows, three of them `TBD`; `012` carries 13 `TBD`s; `001`'s is 22
   rows and is the model. `TBD` is legal for a *number* awaiting the operator capture (D3), not for
   Frame/Dividers/Row-shell-sharing.
4. **D-4** No child states the judge's per-row expectation, so every JUDGE pass re-derives what "2"
   means — the largest source of score drift between the two consecutive passes DONE requires. `017`
   never mentions `dark` at all.
5. **D-5** All 19 `verification.md` declare `SPECKIT_TEMPLATE_SOURCE: acceptance-criteria` and
   `SPECKIT_LEVEL: 2`, against a parent at level 3.
6. **D-6** Phase F is one sentence; the packet's own third-strike rules are stated in two different
   places with two different triggers (one row vs. the total), which is exactly how `001`/`002` shipped
   at 11/16 with no row at 0.

## Correction issued this iteration

**C-3 (iter 1) is corrected in part.** The operator reference **images do resolve** — they live at
`screenshots/operator/` (20 files) and all 19 children cite them. What does not resolve is the
`scratchpad/loop/*.md` reasoning notes (`076-frame-ruling.md`, the two `operator-notes.md` files).
The narrower replacement text is in `findings/iter-2.md` under "Correction to C-3".

## What was ruled out

- The full-sheet capture variant exists (11 scenarios, 22 PNGs on disk) — not a missing harness feature.
- A shared scaffolding template for `012`–`019` is strongly implied but **not proven**; recorded as
  inference.
- Splitting `017`'s 18 modals into 18 children is rejected; the bundle rationale holds.

## Next focus

**REFERENCE COMPOSITION (iteration 3):** every DEFINE table's Source column (C-1 carried forward), the
ClickUp lead for `018`/`019`, the D7 frame ruling's actual presence per child, and any composition
contradiction that needs a Proposed ADR in `roadmap.md` §7. Entry points: `004/spec.md:237` (no Source
column), `013/spec.md:221` (Source column present), `018/spec.md:246`, `decision-record.md` D9's
hard-constraint list, and `sheet-grammar.mjs:1815`'s divider clause that still reads the card class.
