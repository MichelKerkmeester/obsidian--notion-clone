# Iteration 006 — COVERAGE, second axis (reachability + comparison object)

**Gap class:** COVERAGE (second pass, different axis) · **Status:** complete · **newInfoRatio:** 0.70
**Findings file:** `findings/iter-6.md`

## Focus

Iteration 1 asked whether every request has a child. This iteration asks two sharper questions: **can
the surface the child judges ever be seen** (by the operator's phone, gate c, and by a judge with a
comparison object), and **what does the judge compare against** when no reference exists.

## Headline findings

1. **Z-1 — three of `016`'s four primary surfaces are unreachable.** `DEFAULT_VIEW_TYPES = ["table",
   "board"]` (`settings.ts:81`), the toolbar picker excludes chart/calendar/timeline
   (`toolbar-renderer.ts:109-111`), and a persisted chart view *"opens as a table … through the redirect
   shipped in 0.0.34"* (`archive/deprecated-views/chart/README.md`). The renderers are constructed but
   nothing presents them. `016`'s fourth surface — the mini-calendar — **is** reachable, but through
   `date-value-picker.ts:28` (`010`) and `cell-editor-date.ts:25` (`015`). `017` carries the same defect:
   `ChartDrilldownModal` lives only at `archive/deprecated-views/chart/chart-renderer.ts:1009`.
   Proposed: a **reachability gate** in the Phase Transition Rules and a scoped rewrite of `016`.
2. **Z-2 — the rubric is written entirely in comparatives, so the zero-reference children have no
   scorable rows.** Six of eight rows say "match the composed reference", "as the reference has them",
   "read as the reference's" — while `017`, `016` and `014` name `Internal (...)` as their Source and
   `017`'s risk matrix accepts *"No external reference to anchor the rubric | High (certain)"*.
   Proposed: a **comparison object** per Source value, with `internal` meaning *a named sibling capture
   that has already passed its judge* — `017` compares against `001`'s and `009`'s judged sheets.
3. **Z-3 — one score table for `017`'s eighteen surfaces.** Proposed: a **named judged sample** (one
   surface per structural family, six for `017`), one score row per sampled surface per theme, and
   lane clauses over all eighteen whose printed surface list is the evidence they were reached.
4. **Z-4 — `deferred` is not a state the packet can express**, so unreachable surfaces must be either
   silently dropped or run to a verdict no human can confirm. Proposed: a fourth child state, set by
   the operator on a Proposed ADR, with `goal.md` §3 separating `judged` / `no-regression` / `deferred`.

## Second-axis verdict

| Question | Answer |
|---|---|
| Can the operator reach every surface a child judges? | No — `016` ×3, `017` ×1 |
| Does every child name a comparison object a judge can open? | No — 47 zero-reference surfaces |
| Is the largest zero-reference bundle judgeable as scored? | No — 1 table, 18 sheets |
| Can the packet express "deferred"? | No |
| New children proposed | **0** (this axis is scope correction, not scaffolding) |

## What was ruled out

- The calendar/timeline/chart toolbar renderers are **not** dead code — all four are live modules with
  tests and three are instantiated. Only their presentation path is gone. This **sharpens** iteration
  1's note (which established only that the files exist).
- `015`'s cell editors are reachable (`cell-editor-date.ts:25` imports `renderMiniCalendar`;
  `cell-renderer.ts:601` is the mount for the text/select editors).
- The toast is reachable — the operator reported toast behaviour in `roadmap.md` rows 81–82, so its
  gap remains the missing constructed capture (iteration 2, D-2), not reachability.

## Next focus

**DEPTH, second axis (iteration 7):** both-theme and state coverage, and the judge's per-row
expectation. Entry points: `001/verification.md`'s recorded finding that *"**no dark-theme Notion
capture exists at any rung** (3/3 view-options and 120/120 `database/` files scanned by mean luma, all
light), so every dark target is ours and OC-S2 is what would settle it"*; the rubric's `Both themes`
row; `002`'s Colour-0 remediation that landed a shared dark token for another child; and the
`EDGE CASES` sections that are template-identical across all 19 children.
