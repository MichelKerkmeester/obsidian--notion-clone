# Deep-Research Strategy — lineage `glm`

Topic: audit the `076-sheet-visual-parity` design programme's coverage, plan depth, reference
composition, design-system coherence and loop logic, and hand the orchestrator scaffold/plan
patches that need no re-derivation.

Session: `fanout-glm-1789102713325-fbmgv2` · loop `research` · stopPolicy `max-iterations` ×5.

---

## Charter

### Objective

Read the whole `076` packet — parent `spec.md` / `plan.md` / `decision-record.md` D1–D9 / `goal.md` /
`coverage-audit.md`, every child `001`–`019`, `roadmap.md` §4 + §6A + §7, the design system
(`styles.css`, `src/views/surface-shell.ts`, `src/views/record-surface/`, `tools/live/sheet-grammar.mjs`),
the sheet inventory (`tools/storybook/sheet-inventory.mjs`) and the loop driver — and produce, per
iteration, findings where **every gap has a path, a quoted line and paste-ready text**.

### Non-Goals

- No implementation, no file edit outside the lineage directory, no repo tooling (`validate.sh`,
  `generate-context.js`, git writes).
- Not a code-review of the renderers' correctness; this is a planning/coverage/depth audit.
- Not a re-litigation of the operator's rulings (D1–D9 are binding input, not candidates).

### Stop Conditions

- Hard stop at `config.maxIterations` = 5 (`stopPolicy: max-iterations`).
- Convergence (`newInfoRatio < 0.05`) is **telemetry only** — on convergence, broaden the review
  angle rather than synthesizing early.
- Terminal synthesis must record `stopReason: "maxIterationsReached"`.

### Success Criteria

1. Coverage matrix: no operator request and no inventoried surface without a child; no child without
   at least one task and one lane clause naming it.
2. Depth grade per child per phase; every phase below L3 has its missing thresholds, RED/GREEN lane
   clauses, capture ids, both-theme targets and rubric expectations written out.
3. At least 15 multi-phased children exist or are proposed **with names**.
4. Design-system connection map naming shared primitives to extract and the landing order.
5. Loop-logic change list (stall detection, verdict contracts, judge calibration, release gating,
   parallelism under the cap, what to log).

---

## Known Context

- Parent packet: `specs/005-component-surface-system/076-sheet-visual-parity/` — phase parent, 19
  children in the Phase Documentation Map (`001` settings, `002` properties, `003` filter, `004` sort,
  `005` group, `006` add-view, `007` property-editor, `008` record, `009` menu+confirm, `010` pickers,
  `011` toolbar-overflow+column-width, `012` board-card-fields, `013` board-card-properties,
  `014` fuzzy-suggest, `015` cell-editor-popovers, `016` view-toolbar-options, `017` utility-modals,
  `018` board-visual-parity (ClickUp), `019` board-card-drag-feel (ClickUp)).
- Each child is one surface run through the six-phase graph loop: DEFINE (from reference screens) →
  PLAN → CREATE → SCREENSHOT → VERIFY (image judge) → REMEDIATE.
- Binding decisions live in parent `decision-record.md` D1–D9; operator rulings in
  `specs/005-component-surface-system/roadmap.md` §4 rows 84–9x and §6A/§7, dated 2026-09-08→09-11.
- Design system surface: `styles.css` (`--obnotion-*` tokens), `src/views/surface-shell.ts` (sheet
  frame + header), `src/views/record-surface/*` (row builders), `tools/live/sheet-grammar.mjs` (the
  lane that encodes the grammar), `tools/storybook/sheet-inventory.mjs` (the surface inventory).
- Design-fundamentals reference every UI leg must load:
  `.opencode/skills/sk-design/sk-design-fundamentals/`.
- Scratchpad notes: the prompt cites `scratchpad/glm/loop-driver.sh` "if present" — presence TBD in
  the LOOP_LOGIC iteration.

---

## Focus Plan (one gap class per iteration; never repeat)

| # | Gap class | Angle |
|---|-----------|-------|
| 1 | COVERAGE | roadmap §4 rows 70–9x + §6A rulings 09-08→09-11 × `sheet-inventory.mjs` surfaces → child/task/lane map; propose missing children |
| 2 | DEPTH | grade all 19 children per phase vs L3/L3+; write missing thresholds, lane clauses, capture ids, both-theme targets, rubric expectations |
| 3 | REFERENCE_COMPOSITION | DEFINE source columns (Anytype/Notion/ClickUp + reason), ClickUp leads boards, frame ruling (no cards; dividers on plain bg; stacked sheets; grab handle; 16pt inset; 44pt+ rows) in every child; contradictions → Proposed ADRs |
| 4 | DESIGN_SYSTEM | connection map: frame, header, row primitives, dividers, typography scale, colour roles, stacking; shared primitives to extract; landing order that avoids rework |
| 5 | LOOP_LOGIC | D6 graph, loop driver, judge rubric, guard, DONE rule → stall detection, verdict contracts, judge calibration vs operator device reads, release gating, parallelism under the cap, what to log |

## What Worked / What Failed

- (none yet — first iteration pending)

## Next Focus

- Iteration 1 — COVERAGE.
