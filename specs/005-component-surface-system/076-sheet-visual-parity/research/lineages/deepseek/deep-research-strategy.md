# Deep-Research Strategy — lineage `deepseek`

Topic: audit the `076-sheet-visual-parity` design programme's coverage, plan depth, reference
composition, design-system coherence and loop logic, and hand the orchestrator scaffold/plan
patches that need no re-derivation.

Session: `fanout-deepseek-1789102713325-fbmgv2` · loop `research` · stopPolicy `max-iterations` ×10.

---

## Charter

### Objective

Read the whole `076` packet — parent `spec.md` / `plan.md` / `decision-record.md` D1–D9 / `goal.md` /
`coverage-audit.md`, every child `001`–`019`, `roadmap.md` §4 + §6A + §7, the design system
(`styles.css`, `src/views/surface-shell.ts`, `src/views/record-surface/`, `tools/live/sheet-grammar.mjs`),
the sheet inventory and the loop driver — and produce, per iteration, findings where **every gap has
a path, a quoted line and paste-ready text**.

### Non-Goals

- No implementation, no file edit outside the lineage directory, no repo tooling (`validate.sh`,
  `generate-context.js`, git writes).
- Not a code-review of the renderers' correctness; this is a planning/coverage/depth audit.
- Not a re-litigation of the operator's rulings (D1–D9 are binding input, not candidates).

### Stop Conditions

- Hard stop at `config.maxIterations` = 10 (`stopPolicy: max-iterations`).
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

- Parent packet: `specs/005-component-surface-system/076-sheet-visual-parity/` — phase parent, level 3,
  19 children in the Phase Documentation Map.
- Binding decisions in `decision-record.md`: D1 image judge is a required gate; D2 every production
  surface of a grammar (plus production-mount captures and the full-sheet capture variant); D3
  reference precedence (operator capture > full-res Notion > 299×678 Mobbin thumbnail > Anytype);
  D4 one sheet at a time in order, `001` first; D6 the loop graph (START/PLAN/GATE/CREATE/LAND/JUDGE/
  REMEDIATE/DONE/ESCALATE + verdict schema + two JSONL logs + 4-iteration guard); D7 dividers on the
  plain sheet background, never card containers; D8 release only after DONE; D9 reference composition
  (Anytype + Notion + ClickUp per element; ClickUp leads boards).
- Design system surface: `styles.css` (`--obnotion-*`), `src/views/surface-shell.ts`,
  `src/views/record-surface/*`, `tools/live/sheet-grammar.mjs`, `src/views/active-rule-popover-renderer.ts`.
- Instrumentation: `tools/storybook/sheet-inventory.mjs` (87 surfaces), `constructed-scenarios.mjs`
  (59 scenarios), `npm run screenshots` / `screenshots:verify`, `tools/live/sheet-rebuild.mjs`.

### Resource Map

`resource_map_present: false` — the parent's own `coverage-audit.md` serves that role; not re-emitted
inside the lineage.

---

## Machine-Owned Sections

<!-- BEGIN:STRATEGY-APPROACHES (reducer-owned) -->
- **Five gap classes × two axes, then a cross-cutting join.** Iterations 1–5 opened COVERAGE, DEPTH,
  REFERENCE_COMPOSITION, DESIGN_SYSTEM and LOOP_LOGIC; 6–9 re-opened four of them on a different
  axis (reachability, theme/state completeness, colour/type/stacking, lane/gate/walk); 10 joined the
  results into a traceability matrix and a corrections ledger.
- **Count first, quote second.** Every finding starts from a mechanical count (grep -c, table-row
  extraction, history-entry validation) and only then cites the line that explains it; this is what
  caught the lane file's unrecorded hold and the 119/51 row-to-clause ratio.
- **Read the two children that have run the loop as the measurement, not the plan.** 001/002's
  verification tables, task states and capture names supplied the guard-fit, vacuous-pass and
  clause-identity findings, none of which the plan documents could have shown.
- **Follow the money to the artifact that enforces.** Each claim was traced to the tool that asserts
  it (gate check, lane check, harness) and the ones with no enforcing artifact were reported as
  prose-only.
<!-- END:STRATEGY-APPROACHES -->

<!-- BEGIN:STRATEGY-WHAT-WORKED (reducer-owned) -->
- Mechanism-hunting before proposal: finding `verify-placement.mjs`'s `PHASE_CONTROLS` and
  `evidence.mjs`'s `inputs` map turned two proposals into "use the pattern the repo already owns".
- Counting the lane history by event/timestamp found the unrecorded hold that a prose read of the
  lane README would have missed.
- Reading `002`'s iteration-2 judge table found the D7 invalidation and the 11→11 regression, which
  no plan-level document records.
- Refusing to state a number one source cannot carry: every target in the packet is marked ours or
  TBD, and the audit followed the same rule.
<!-- END:STRATEGY-WHAT-WORKED -->

<!-- BEGIN:STRATEGY-WHAT-FAILED (reducer-owned) -->
- Automated join of clause sections to the lane tool — the join key does not exist (ids for `002`
  only); the proposal creates it.
- Assuming the `Source` column made D9 traceable — `018`/`019` carry criteria text, not clauses.
- Deriving DEFINE row counts from a naive `§13` region match — the region contains several tables;
  the count was replaced by a `### The table` extraction and `001`/`002` read by hand.
<!-- END:STRATEGY-WHAT-FAILED -->

<!-- BEGIN:STRATEGY-EXHAUSTED (reducer-owned) -->
- (none) The axis was not exhausted: iteration 10 still produced first-time findings (X-3/X-4) at a
  0.63 ratio, four times the convergence threshold. The loop stopped at the configured cap.
<!-- END:STRATEGY-EXHAUSTED -->

<!-- BEGIN:STRATEGY-QUESTIONS (reducer-owned) -->
Open (operator-scope; the full ledger with owners is `findings/iter-10.md` §X-3):

- Does `020-control-primitives-visual-parity` exist, and does it land before `003`–`011` CREATE?
- `016`'s three unreachable toolbars: defer the child, or judge the constructed scenario anyway?
- `017`'s eighteen modal sheets: a six-surface judged sample, or all eighteen with six tables?
- `012`'s field grid: narrow D9's ClickUp board clause (recommended) or extend ClickUp over it?
- Is D9's board clause Proposed or settled, given `roadmap.md` §7.21 calls it settled?
- Do the operator's C-1…C-6 captures (and the settings dark capture) exist, and may they be copied in?
- May a child pass with a declared `Frame = 1*` deviation where the shared header is the reason?
- States: a ninth rubric row (pass ≥ 16/18) or findings-only cells?
- `--obnotion-font-row-label` 17px: every sheet row, or only the flagged sheets?
- Colour roles aliased into `--obnotion-*`, or accepted unnamespaced with a dedicated clause?

Answered by evidence inside the loop (12 of 21): the guard's fit (both children exceed 4 — measured);
concurrency under the cap (1 file; six lane signings in ~5h); the clause→gate path (no identity, no
red-provenance — the repo owns the pattern elsewhere); the judged-capture comparator (out of tree);
the DONE predicate (not file-derivable); the lane file's integrity (unrecorded hold, 5 malformed
entries); the traceability ratio (119 rows / 51 clauses); D7's lane contradiction (six sites); the
full-sheet capture contract (11 `capture: "sheet"` scenarios); the dark reference inventory (52
Anytype / 49 ClickUp / 23 desktop-only Notion); the option-colour layer's ownership (plugin's own);
and the depth grade (001 L3+; 002–011 L3; 012 L2; 013–019 L1+–L2).
<!-- END:STRATEGY-QUESTIONS -->

---

## Next Focus

**Terminal — the loop is complete at the cap (`maxIterationsReached`).** No further iteration is
planned in this lineage. The next actor is the operator/orchestrator: apply `research.md` §2's nine
mechanical repairs in order, then rule on the operator-scope questions above before the remaining
eight children are launched. If the lineage is resumed, the two highest-yield unexhausted angles
are: (a) the *differential* audit of `004`–`011` once their lanes are written (the clause contents
are spec-only today), and (b) the judge-vs-operator calibration register once any operator phone
read exists.

## Progress Log

- init: config, strategy, dashboard and state log written into the lineage directory.
- iters 1–5: COVERAGE, DEPTH, REFERENCE_COMPOSITION, DESIGN_SYSTEM, LOOP_LOGIC — findings C-1…C-7,
  D-1…D-6, R-1…R-5, DS-1…DS-5, L-1…L-8.
- iters 6–9: second axes — Z-1…Z-4 (reachability), T-1…T-4 (theme/state), Y-1…Y-4 (colour/type/
  stacking), G-1…G-6 (lane/gate/comparator/walk).
- iter 10: CROSS-CUTTING — X-1…X-4 (119 rows / 51 clauses; claim→assertion ledger; 21 questions;
  corrections and doc-truth defects).
- synthesis: `research.md`, `coverage-matrix.md`, `convergence-report.md`; dashboard refreshed;
  terminal state record `synthesis_complete` appended with `stopReason: maxIterationsReached`
  (state log: init + 10 iterations + synthesis + terminal event = 13 lines).
