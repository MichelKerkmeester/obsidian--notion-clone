---
title: "Consolidated Research: 076 Sheet Visual Parity — Three-Lineage Fan-Out Synthesis"
description: "Merges deepseek (10 iterations), luna (5 iterations, canonical detail in luna/research/research.md) and glm (5 iterations) into one verified audit of coverage, depth, reference composition, design-system connection and loop-runtime logic for the 076 packet."
trigger_phrases:
  - "076 research synthesis"
  - "sheet visual parity fan-out"
  - "076 coverage depth audit"
importance_tier: "critical"
contextType: "planning"
---

# Consolidated Research: 076 Sheet Visual Parity

Three independent `/deep:research` lineages (deepseek, luna, glm) audited the same question set
against the `076-sheet-visual-parity` packet without seeing each other's work. This document merges
their findings, re-checks the load-bearing claims against the actual files in this worktree, and
gives the operator one ranked list of what to do next. Method, timings and what was **not**
re-verified are in `## Method` at the end.

---

## Operator summary

1. **The programme is real and covers everything it should.** 19 phase children exist (well past
   the 15-child bar); every operator request in `roadmap.md` §4 and every inventoried surface routes
   to one of them. — D, L, G agree; CONFIRMED (directory listing, `coverage-audit.md`).
2. **The gap is traceability, not missing work.** A DEFINE row rarely names the lane clause that
   measures it, a clause rarely names the child that owns it, and a judged capture rarely names the
   hash it was scored against. — D, L, G agree; CONFIRMED (spot-checked across 001, 003, 013).
3. **Only child `001` (settings) is fully deep (L3+ on all six phases).** `002`–`011` are mid-depth
   (L2–L3); `013`–`019` are the shallowest (L1+–L2), mostly missing named clause IDs and a per-row
   judge instance. — D, L, G agree on the shape; CONFIRMED for 001 vs 013 (9 named lane clauses and
   148 table rows in 001 vs 27 in 013).
4. **A shipped rule actively contradicts a newer ruling.** The lane
   (`tools/live/sheet-grammar.mjs:4873-4933`) still requires the settings sheet to have **≥ 2 card
   containers**, but decision D7 (2026-09-11) bans card containers outright
   (`cardContainers = 0`). A green lane run today certifies the exact shape the operator rejected.
   — D flags this directly (repair #1); L and G describe the same debt (`.obnotion-settings-card`
   removal) without naming the still-passing assertion; CONFIRMED by reading the lane source.
5. **The stylesheet still ships the card tokens D7 retired.** `--obnotion-settings-card-fill` is
   still declared in both themes (`styles.css:114`, `:1044`) and `.obnotion-settings-card` is
   referenced 12 times total. — D, L agree; CONFIRMED.
6. **The D9 "Source" column (which reference wins per element) exists in only about a third of
   children.** Verified present in `013`, `014`, `018`; verified absent from `001`, `002`, `003`.
   D counts 7/19, G counts 6/19 — the two disagree by one child; both are directionally right and
   the exact count is a five-minute grep, not a design question. — D, G report the gap; L proposes
   the fix (normalized Source/Source-reason/Evidence-rung columns); CONFIRMED for the six children
   spot-checked.
7. **D9 says boards lead with ClickUp, but `012`'s board-card field grid is a deliberate, resolved
   exception and stays on Anytype** (`roadmap.md` §7.20). This is not a bug — it is a real edge case
   every child's DEFINE table needs to state explicitly so nobody "fixes" it later. — D, L, G all
   flag this; CONFIRMED against `roadmap.md` §7.20/§7.21.
8. **The loop graph (D6) is missing an edge its own children promise.** `003/tasks.md:93` tells the
   operator "if one rubric row fails three consecutive iterations… DEFINE re-opens" — but D6's edge
   table has no `REMEDIATE → DEFINE` (or equivalent) transition. The promise is real; the mechanism
   to keep it isn't. — D, G both name this exact line; CONFIRMED.
9. **The lane-state file that gates every stylesheet edit has data-integrity holes.**
   `tools/lane/css-lane.json` has 5 malformed history entries (2 missing `event`, 3 missing `at`)
   and its top-level `holder`/`acquiredAt` (03:21:40Z) has **no matching history event at all** — the
   most recent recorded `acquire` is 44 minutes earlier. — D reports this precisely (G-1); CONFIRMED
   by parsing the JSON directly.
10. **The pixel-comparison tool every release cites doesn't exist in the repository.**
    `css-lane.json`'s own release notes call `node scratchpad/glm/pixel-delta.mjs`, and that path
    is absent from the tree (`scratchpad/glm/` doesn't exist). The only in-repo comparator is a
    16×16 grid hash with two documented blind spots. — D reports this; CONFIRMED (search found
    nothing at that path).
11. **The image judge has no calibration set**, so nobody knows if it agrees with what the operator
    sees on their own phone until after a child ships. One data point exists (`001` scored 11/16 by
    both the judge and, independently, the operator) and it's a good sign, but it's n=1. — L
    proposes the fix; G reports the same single data point as encouraging; D flags it as an open
    risk; REPORTED (not independently re-derivable from files alone — this is a judgment call about
    a process, not a grep).
12. **The parent's own wording still says "the eleven children"** in `plan.md`, `goal.md` and
    `decision-record.md` D4, when there are 19 children total (11 sheets + 8 additional). This is
    mostly harmless — the extra 8 are clearly marked "not one of the eleven" — but D6's edge and
    guard language inherits the same ambiguity. — D, L, G all note it; CONFIRMED, with the caveat
    that `spec.md` itself is already careful about the distinction in most places.
13. **`roadmap.md` §4 reuses row numbers 86, 87 and 88 for three unrelated operator complaints
    each** (9 rows sharing 3 numbers), which makes citing "row 87" ambiguous. — G reports 2×
    duplication; CONFIRMED at 3× (worse than G reported).
14. **Recommended order: (1) fix the D7/lane contradiction and remove the dead card CSS — cheapest,
    highest blast-radius reduction; (2) normalize the Source column and clause-ID scheme across all
    19 children; (3) repair the lane JSON and land the pixel-delta tool; (4) add the missing D6 edge
    and a judge-calibration step; (5) then continue CREATE/JUDGE on `002`–`019` in order.** — this
    ordering synthesizes D's "apply first" list, L's patch sequence and G's GATE-entry-contract
    priority; it is this document's own judgment call, not a single lineage's.

---

## Verdict

**COVERAGE.** Every operator request in `roadmap.md` §4 rows 70–94 resolves to a named child or an
explicit non-076 floor (a regression guard outside this packet's scope); every one of the 87
inventoried surfaces (55 primary + 32 stacked, confirmed directly in `coverage-audit.md`) has an
owning child. Nineteen phase children exist — `001`–`019` — well past the 15-child bar. One real
residual gap is agreed by all three lineages: two always-on table-chrome surfaces (the selection
status bar and the load-more row) have no dedicated owner and no constructed capture counterpart;
glm names this precisely as a proposed 20th child (`020-table-chrome-visual-parity`), luna reaches
the same two surfaces as "proposed child 020" from a different angle (contextual rows 8 and 30), and
deepseek independently proposes a `020-control-primitives-visual-parity` for the checkbox/radio/
dropdown-field geometry gap. These are not the same proposal — the operator has three overlapping
but distinct candidate scopes for child 020 and needs to choose one (see Open questions). Separately
confirmed: `016`'s calendar/timeline/chart toolbars are constructed and testable but not reachable
in a released build, because `DEFAULT_VIEW_TYPES = ["table", "board"]` in `src/settings.ts:81` and
`toolbar-renderer.ts`'s option filter excludes those view types unless already selected — a real
"child exists but its surface can't currently be seen" gap the packet's own status vocabulary
(scaffolded/planned/created-awaiting-judge/complete) can't express as "deferred."

**DEPTH.** Grading against the L1/L2/L3/L3+ scale in luna's and glm's synthesis (L3 = measurable
threshold + RED/GREEN lane clause + capture ID + rubric binding; L3+ adds both themes, states, and
per-row judge expectation): only `001` reaches L3+ on all six phases, confirmed directly — its
`plan.md` names nine numbered lane clauses (L1–L9, `plan.md:147-157`) and its `spec.md` carries far
more DEFINE-table rows (148 table lines total) than any other child (`013`'s spec.md has 27).
`002`–`011` sit at L2–L3: they have real DEFINE tables and producer-level PLAN sections but mostly
lack named, IDed lane clauses (only `002` has any, per deepseek and glm) and lack a per-child rubric
instance — they inherit the parent's generic eight-row rubric rather than getting row-level expected
values. `013`–`019` are the shallowest: DEFINE tables exist (structurally sound, per glm) but
SCREENSHOT/VERIFY/REMEDIATE phases are thin, `016` and `017` have no scenario-registration task for
their many surfaces (17 in `016`, 18+2 in `017`), and none of the eight below-L3 children has a
vacuity guard comparable to `001`'s L9. The three lineages' exact per-child letter grades diverge in
minor ways (glm is more generous toward `012`/`018`, deepseek is stricter about `013`), but all three
agree on the shape: depth decreases roughly with child number, and the fix in every case is "paste
the L3+ contract already written by luna's P-002" rather than inventing new mechanism per child.

**REFERENCE_COMPOSITION.** D9 (2026-09-11) requires every sheet child's DEFINE table to carry a
`Source` column naming which of Anytype/Notion/ClickUp (or Operator/Internal/None) that row's target
follows, chosen best-of-three per element, with the operator's own screenshots and words outranking
all three products. Verified directly: `013`, `014`, and `018` already have a `Source` column in
their DEFINE tables; `001`, `002`, and `003` do not. The two lineages that counted differently (D:
7/19, G: 6/19) are both plausible and the discrepancy is one child, not a disagreement about the
rule. Two composition conflicts are real and already resolved on record, not open: (a) `012`'s
board-card field grid stays judged against Anytype under `056` ADR-008, explicitly carved out of
D9's "ClickUp leads boards" rule (`roadmap.md` §7.20, confirmed); (b) `018`/`019` retarget board
chrome and drag-feel to ClickUp but explicitly do **not** reopen `012`'s field-layout rule and do
**not** extend to sheets, which stay on the three-way mix (`roadmap.md` §7.21, confirmed). The
`roadmap.md` §7.19 table itself already records eight of these tension points as Proposed ADRs
(E through M), with J and K marked resolved by D7 — this table is authoritative and none of the
three lineages needs to re-derive it, only cite it.

**DESIGN_SYSTEM.** The shared surface exists and is real, not aspirational: `createSurfaceShell` is
used by 9 of 187 top-level `src/views/*.ts` files (confirmed by grep), and `surface-shell.ts` exports
named constants (`SHELL_CARD_INSET_PT`, `SHELL_PHONE_CLOSE_PX`, etc., per glm's F4.1) that are the
correct citation target for every child's numeric row rather than a fresh literal. The confirmed,
concrete debt: (1) the D7-banned card container is still asserted as required by the lane
(`sheet-grammar.mjs:4873-4933`, `cards.length === 0` early-return at `:1955`) and its CSS backing
(`--obnotion-settings-card-fill` tokens at `styles.css:114`/`:1044`, 12 total references to
`.obnotion-settings-card`) is still shipped; (2) row-height and typography values are fragmented
across multiple named constants and literals (reported by deepseek at ~275 literal font-size
declarations vs ~102 token uses — not independently re-verified at that exact count, but the general
shape — multiple competing row-height constants (28/34/44/50/64px) — is consistent with what the
`css-lane.json` history and `sheet-grammar.mjs` thresholds show). The connection to the wider design
system upgrade is direct: `076` is not a parallel design effort, it is the vehicle for landing the
shared shell/row/divider/token layer that the rest of the plugin's phone surfaces (menus, panels,
modals) already partially consume — glm's design-system connection map and luna's landing order
(T-DS-001 through T-DS-006) both converge on "land tokens and frame first, sheet families second,
board exceptions last," and this is the correct sequence because it matches D4's existing serial
css-lane discipline.

**LOOP_LOGIC.** D6's graph (START→PLAN→GATE→CREATE→LAND→JUDGE→{DONE|REMEDIATE}→ESCALATE) is written
down and the state files it produces are real and inspectable. Three confirmed defects: (1) no
`REMEDIATE→DEFINE` (or equivalent re-open) edge exists in D6's table even though `003/tasks.md:93`
promises exactly that behavior on three consecutive rubric-row failures — the promise has no
mechanism; (2) the lane file every CREATE step reads and writes (`tools/lane/css-lane.json`) has 5
malformed history entries and an orphaned top-level `acquiredAt` with no corresponding history
event, meaning the lane's own audit trail cannot currently prove who holds it or when they acquired
it; (3) the pixel-delta comparator that release notes cite (`scratchpad/glm/pixel-delta.mjs`) is not
in the tree — the only in-repo image comparator is a lower-resolution grid hash. Two further findings
are process risks rather than file-level defects and are REPORTED, not independently confirmable
from static files alone: the judge has no calibration set (one data point exists, `001` at 11/16
matching an independent operator read), and release gating under D8 is a written rule (releases wait
for DONE) but nothing in the repository yet enforces it mechanically — D8 is a decision-record
sentence, not a script.

---

## Findings

| ID | Class | Finding | Evidence | Lineages | Status |
|---|---|---|---|---|---|
| F-COV-01 | COVERAGE | 19 phase children exist (`001`–`019`), past the 15-child bar | `specs/.../076-sheet-visual-parity/` directory listing | D,L,G | CONFIRMED |
| F-COV-02 | COVERAGE | 87 inventoried surfaces (55 primary + 32 stacked), every one owned by a child | `coverage-audit.md:16` "87 surfaces (55 primary + 32 stacked)" | D,L,G | CONFIRMED |
| F-COV-03 | COVERAGE | Two table-chrome surfaces (selection bar, load-more) have no dedicated owner or constructed capture | `src/views/database-view.ts`, `embedded-database-renderer.ts`; coverage-audit gap | G(F1.5),L(row8/30) | CONFIRMED (files exist; ownership absence not independently exhaustively re-derived) |
| F-COV-04 | COVERAGE | `016`'s calendar/timeline/chart toolbars are built but unreachable in a released build | `src/settings.ts:81` `DEFAULT_VIEW_TYPES=["table","board"]`; `toolbar-renderer.ts` option filter | D | CONFIRMED |
| F-COV-05 | COVERAGE | `roadmap.md` §4 reuses row numbers 86, 87, 88 for three distinct operator complaints each (9 rows, 3 numbers) | `roadmap.md:438-445` | G (reported 2×) | CONFIRMED at 3× — stronger than reported |
| F-COV-06 | COVERAGE | The packet cannot express "deferred" for a surface that exists but is unreachable; only scaffolded/planned/created-awaiting-judge/complete | `spec.md` Phase Documentation Map legend | D | CONFIRMED (legend has no deferred state) |
| F-DEP-01 | DEPTH | Only `001` reaches L3+ on all six phases; it has 9 named lane clauses and the largest DEFINE table (148 table lines) | `001/plan.md:106,147-157`; `001/spec.md` | D,L,G | CONFIRMED |
| F-DEP-02 | DEPTH | `013`'s DEFINE table is far thinner (27 table lines) with no named clause IDs | `013/spec.md` | D,L,G | CONFIRMED |
| F-DEP-03 | DEPTH | `016`/`017` have no scenario-registration task for their many bundled surfaces | `016/`, `017/` tasks structure | D(F2.3 via glm too),G,L | REPORTED (structure consistent with claim; task-by-task absence not exhaustively grepped) |
| F-DEP-04 | DEPTH | The 8-row/16-point image-judge rubric is fixed at the parent level (`spec.md` §5); children below `001` inherit it generically rather than instancing per-row expected values | `spec.md:258-280` | G(F2.2) | CONFIRMED (rubric table exists exactly as described; per-child instancing gap is a design observation, not independently falsifiable) |
| F-DEP-05 | DEPTH | No child besides `001` has a vacuity guard (a clause that fails when its own measured set goes empty) | `001/plan.md:155-157` L9 | D(L-4 finding) | CONFIRMED for 001's L9 existing; absence elsewhere REPORTED |
| F-REF-01 | REFERENCE_COMPOSITION | D9's `Source` column exists in `013`, `014`, `018`'s DEFINE tables | `013/spec.md:221`, `014/spec.md:226`, `018/spec.md:246` | D,L,G | CONFIRMED |
| F-REF-02 | REFERENCE_COMPOSITION | D9's `Source` column is absent from `001`, `002`, `003`'s DEFINE tables | `001/spec.md`, `002/spec.md`, `003/spec.md` (no "Source \|" match) | D,G | CONFIRMED |
| F-REF-03 | REFERENCE_COMPOSITION | Exact Source-column count disagrees between lineages (D: 7/19, G: 6/19) | derived from D's and G's own tables | D,G | CONTRADICTED (lineages disagree by one; not independently resolved to a single number here) |
| F-REF-04 | REFERENCE_COMPOSITION | `012`'s board-card field grid is a resolved exception to D9's "ClickUp leads boards" — stays judged against Anytype under `056` ADR-008 | `roadmap.md` §7.20 | D,L,G | CONFIRMED |
| F-REF-05 | REFERENCE_COMPOSITION | `018`/`019` retarget board chrome/drag to ClickUp but explicitly do not reopen `012`'s field rule and do not extend to sheets | `roadmap.md` §7.21 | D,L,G | CONFIRMED |
| F-REF-06 | REFERENCE_COMPOSITION | Eight D15 Proposed-ADR tension points (ADR-E…M) are already tabulated in `roadmap.md` §7.19, with J/K resolved by D7 | `roadmap.md:2438-2470` (§7.19 table) | L (evidence ledger cites decision-record; table itself found independently) | CONFIRMED |
| F-REF-07 | REFERENCE_COMPOSITION | ADR-I (shared close-glyph: `✕` vs Notion `Done`/`‹` vs ClickUp round `✕`) is a live, unresolved family decision blocking `001`'s and downstream children's header rows | `roadmap.md` §7.19 ADR-I row | D,G | CONFIRMED |
| F-DES-01 | DESIGN_SYSTEM | `createSurfaceShell` is used by 9 of 187 top-level `src/views/*.ts` files | `grep -rln createSurfaceShell src/views` = 9; `ls src/views/*.ts` = 187 | D,L | CONFIRMED |
| F-DES-02 | DESIGN_SYSTEM | The lane still requires ≥2 card containers on the settings sheet, contradicting D7's `cardContainers = 0` | `tools/live/sheet-grammar.mjs:4871-4933` (`settingsCardList`, `parityCardCount`, `SETTINGS_CARD_COUNT_MIN`) | D (repair #1) | CONFIRMED — highest-priority mechanical contradiction found |
| F-DES-03 | DESIGN_SYSTEM | The D7-banned card fill token is still declared in both themes | `styles.css:114` (light), `:1044` (dark), `--obnotion-settings-card-fill`; 12 total `.obnotion-settings-card` references in styles.css | D,L | CONFIRMED |
| F-DES-04 | DESIGN_SYSTEM | Multiple competing row-height values coexist across the design system (28/34/44/50/64px named constants) | `surface-shell.ts` constants; `sheet-grammar.mjs` thresholds; D9's 44pt floor | D | REPORTED (constant names and rough values consistent with a spot-check; not every named constant individually re-verified) |
| F-DES-05 | DESIGN_SYSTEM | Literal font-size declarations substantially outnumber token uses in `styles.css` (~275 vs ~102, per deepseek) | deepseek iteration findings | D | REPORTED (not independently re-counted) |
| F-DES-06 | DESIGN_SYSTEM | The shared design system (`surface-shell.ts` + `--obnotion-*` tokens) already exists; children should cite it, not re-derive geometry | `surface-shell.ts` exported consts | G(F4.1) | CONFIRMED (constants exist; the "children should cite" framing is a recommendation, not a fact) |
| F-LOOP-01 | LOOP_LOGIC | D6's edge table has no `REMEDIATE→DEFINE` (or equivalent re-open) edge | `decision-record.md` D6 Edges table | D,L,G | CONFIRMED |
| F-LOOP-02 | LOOP_LOGIC | `003/tasks.md:93` promises exactly that re-open behavior ("DEFINE re-opens" after 3 consecutive same-row failures) with no graph mechanism to back it | `003/tasks.md:93` (T025) | D,G (glm cites line 93 precisely) | CONFIRMED |
| F-LOOP-03 | LOOP_LOGIC | `tools/lane/css-lane.json` has 5 malformed history entries (2 missing `event`, 3 missing `at`) | parsed JSON, indices 240/407 (no `event`), 503-505 (no `at`) | D | CONFIRMED |
| F-LOOP-04 | LOOP_LOGIC | The lane's top-level `holder`/`acquiredAt` (2026-09-11T03:21:40Z) has no matching history event; the nearest recorded `acquire` is 02:37:26, 44 minutes earlier | `css-lane.json` parsed directly | D | CONFIRMED |
| F-LOOP-05 | LOOP_LOGIC | The pixel-delta comparator cited by release notes does not exist in the tree | `find` for `pixel-delta*` outside `research/` returns nothing; `scratchpad/glm/` does not exist | D | CONFIRMED |
| F-LOOP-06 | LOOP_LOGIC | The only in-repo image comparator is a lower-resolution grid hash with documented blind spots | deepseek iteration findings (46,779px / 22,510px moves hashing identically) | D | REPORTED (blind-spot figures not independently reproduced) |
| F-LOOP-07 | LOOP_LOGIC | The image judge has no calibration set against a known-good/known-bad pair before scoring | `spec.md` §5 rubric section; no calibration step named | L (proposes fix) | REPORTED |
| F-LOOP-08 | LOOP_LOGIC | One data point exists where judge and operator scores agree (`001` at 11/16, both readings) | G (F5.3) | G | REPORTED |
| F-LOOP-09 | LOOP_LOGIC | D8 (release only after DONE) is a decision-record rule with no mechanical enforcement found in the repo's release tooling | `decision-record.md` D8 text; no gating script located | D,L,G | REPORTED (absence of enforcement is a negative claim, not exhaustively provable) |
| F-MISC-01 | COVERAGE/DEPTH | The parent still says "the eleven children" in `plan.md`, `goal.md`, and D4/D6 of `decision-record.md`, though 19 children exist total | `plan.md:38,122,175`; `goal.md:3,15,42,62,98,131,132,139,163`; `decision-record.md:162,173,190` | D,L,G | CONFIRMED |

---

## Contradictions

**C1 — The lane certifies the exact shape D7 bans.** `tools/live/sheet-grammar.mjs` (lines
4871–4933) fails a run when `settingsCardList.length < 2` — i.e., it requires at least two rounded
card containers on the settings sheet. D7 (2026-09-11, `decision-record.md`) states: *"No rounded or
lighter container of any kind around a row or a value. … Assert cardContainers = 0."* This is a
direct contradiction between a landed, currently-passing lane assertion and the most recent
governing ruling. **This is a Proposed ADR under D15's own machinery** (a contradiction between a
newer operator ruling and older, still-live tooling): propose retiring `SETTINGS_CARD_COUNT_MIN`,
`settingsCardList`, `parityCardCount`, and the associated PASS/FAIL branches, replacing the assertion
with `cardContainers === 0` per D7's own language, in the same commit that removes the
`--obnotion-settings-card-fill` tokens (`styles.css:114`, `:1044`) and the remaining 12
`.obnotion-settings-card` references. This does not resolve the contradiction — it names the exact
change and lets the operator confirm before `001`'s CREATE step touches the lane.

**C2 — "The eleven children" vs. 19 actual children.** `decision-record.md` D4 says *"The eleven
children run sequentially in their numbered order"* and D6 says *"`program-loop.sh` … walks the
eleven children in the outer graph"* — but the packet has 19 children, 8 of which are explicitly
*not* part of "the eleven" (`spec.md` itself is careful about this: *"Not one of the eleven
sheets"* appears at `spec.md:303,318,334` for child 012 alone). The ambiguity is real but narrow:
`spec.md`'s Phase Documentation Map already disambiguates per-child, so the risk is isolated to D4
and D6's own prose, which a later reader might take literally when scripting the outer loop.
**Proposed ADR:** amend D4 and D6's language to read "the eleven sheet children" wherever "eleven"
appears unqualified, and have `program-loop.sh`'s own doc-comment (or `plan.md:175`) state the full
19-child set it actually walks, rather than leaving the outer-loop count implicit.

**C3 — D6's graph has no re-open edge that a child's own tasks promise.** `003/tasks.md:93` (T025)
tells whoever executes it: *"If one rubric row fails three consecutive iterations, stop: the target
is wrong, and DEFINE re-opens."* `decision-record.md` D6's Edges table has no transition that
produces this outcome — `JUDGE`'s only `fail` edges go to `REMEDIATE` (within guard) or `ESCALATE`
(guard tripped), and `REMEDIATE`'s only edges go to `LAND` or `ESCALATE`. There is no path back to
`PLAN`/`DEFINE` anywhere in the graph. This is a genuine gap between what the packet's own executable
instructions promise and what the state machine that's supposed to drive them can do — the operator
must decide whether the fix is a new edge (`REMEDIATE`→`ESCALATE`-with-a-`define-reopen`-reason, or
a direct `REMEDIATE`→`PLAN` edge gated on a 3-strike counter) or whether `003`'s task language should
be walked back to match the graph as written. **Proposed ADR (D15 class, contradicts D6 as landed):**
add the edge and its verdict field (`retry_verdict: "target-wrong"`) rather than silently letting
`003`'s promise go unenforced.

**C4 — D9's Source-column count disagrees between lineages by one child.** Deepseek counts 7/19
children with a Source column; glm counts 6/19. Both are plausible reads of a table structure that
varies slightly child to child (some embed "Source" in a combined header cell). This synthesis
verified the column present in `013`/`014`/`018` and absent in `001`/`002`/`003` directly but did
not exhaustively re-derive the full 19-child count — **the operator does not need to adjudicate
this; it's a five-minute grep**, not a design decision, and is listed here only so the exact number
isn't silently asserted as settled.

**C5 — Board reference composition looks contradictory but is already resolved on record.** D9 says
"boards lead with ClickUp." `012` stays on Anytype. Read in isolation this looks like an open
contradiction, and all three lineages initially flag it as one — but `roadmap.md` §7.20 and §7.21
already record the resolution: `012`'s field-layout rule is a **settled exception**, not a Proposed
ADR, because the operator's own words distinguish "board styling" (ClickUp) from the single-column
field rule (Anytype, unreversed by `045`'s undocumented column-count change). **No operator decision
is needed here** — the only remaining action is mechanical: every child's DEFINE table and every
future board-adjacent spec should cite §7.20/§7.21 explicitly rather than re-deriving the exception,
which is exactly the traceability gap this whole audit is about.

---

## Recommendations

Ranked by leverage — cheapest, highest-blast-radius-reduction changes first within each group.

### (a) Mechanical repairs — no design decision needed

| # | Change | File(s) | Why (finding) | Lineages | Size |
|---|---|---|---|---|---|
| a1 | Retire the ≥2-card-container lane assertion; assert `cardContainers === 0` per D7 | `tools/live/sheet-grammar.mjs:4871-4933` | F-DES-02, C1 | D | S |
| a2 | Remove `--obnotion-settings-card-fill` tokens and the remaining 12 `.obnotion-settings-card` references | `styles.css:114,1044` + 10 more sites | F-DES-03, C1 | D,L | S |
| a3 | Repair the 5 malformed `css-lane.json` history entries; add a holder/history consistency check to `check-lane.mjs` | `tools/lane/css-lane.json`, `tools/lane/check-lane.mjs` | F-LOOP-03/04 | D | S |
| a4 | Land the pixel-delta comparator that release notes already cite, in-repo | new: `tools/screenshots/pixel-delta.mjs` | F-LOOP-05/06 | D | M |
| a5 | Add stable `<child>/L<n>` clause IDs and a provenance map across all 19 children's lane assertions | `tools/live/sheet-grammar.mjs`, 19 × `plan.md` | F-DEP-01/02 | D,L | M |
| a6 | Fix roadmap §4's triple-reused row numbers (86/86/86, 87/87/87, 88/88/88) — footnote or renumber | `roadmap.md` §4 | F-COV-05 | G | S |
| a7 | Amend D4/D6 "the eleven children" to "the eleven sheet children"; state the full 19-child outer-walk set explicitly | `decision-record.md` D4/D6, `plan.md:175` | C2 | D,L,G | S |

### (b) Per-child spec amendments — paste-ready text supplied by a lineage

| # | Change | Child(ren) | Paste source | Lineages | Size |
|---|---|---|---|---|---|
| b1 | Common L3/L3+ six-phase contract (stable row IDs, Source/Source-reason/Evidence-rung/Measurement-kind/State/Theme/Capture-IDs/lane-clause/rubric-rows columns) | all 19, esp. `002`-`019` | luna P-002 (`research/lineages/luna/research/research.md` §"P-002") | L | L |
| b2 | Universal phone targets (cardContainers=0, sheetInset=16px±0.5, row pitch ≥44px, handle 34×5px, title drift ≤1px) | all 19 | luna P-002 | L | S |
| b3 | DEFINE-table Source-column normalization (Operator/Anytype/Notion/ClickUp/Internal/None + reason + evidence rung) | `001`,`002`,`003`-`011` (missing it) | luna P-003 | L,D,G | M |
| b4 | D7 target-language normalization ("card" only in quoted reference descriptions, never as a target/lane/acceptance term) | `001`-`011` | luna P-003 | L,D | M |
| b5 | Per-child DEFINE clause instance of the eight-row rubric, with named expected outcomes per row | `002`-`019` | glm's "needs (paste)" column, `glm/research.md` §3 | G | L |
| b6 | Scenario-registration task for `016` (4 toolbars) and `017` (18+2 surfaces) before their CREATE steps | `016`, `017` | glm F2.3 | G | S |
| b7 | Proposed 20th child text for the two table-chrome surfaces (selection bar, load-more) | new `020` | glm §4 (`table-chrome-visual-parity`) — **note:** luna's and deepseek's own `020` proposals cover different scope (contextual dropdown/record-peek vs. control-primitive geometry); operator must pick one interpretation, see Open questions | D,L,G (three different scopes) | M |

### (c) Design-system work

| # | Change | Files | Why | Lineages | Size |
|---|---|---|---|---|---|
| c1 | Land shared semantic tokens (spacing/type/status roles) before any child-level migration | `styles.css` token layer | F-DES-04/05, F-DES-06 | L (T-DS-001) | M |
| c2 | Land frame/header/handle/stack primitives once, cited by all children rather than re-implemented per child | `surface-shell.ts`, `styles.css` | F-DES-01/06 | L (T-DS-002), G (§5 connection map) | M |
| c3 | Extract row/divider variant primitives (`obnotion-sheet-row`, `-section`, `-nav-row`, etc.) | `styles.css`, new shared module | F-DES-04 | D,L | L |
| c4 | Resolve ADR-I (shared close glyph: Done/‹/✕) once, for all eleven sheets — blocks header rows in `002`-`011` | `surface-shell.ts` `buildShellHeader` | F-REF-07 | D,G | S (decision) + S (implementation) |

### (d) Loop-runtime changes

| # | Change | Files | Why | Lineages | Size |
|---|---|---|---|---|---|
| d1 | Add the missing re-open edge (`REMEDIATE`→`ESCALATE` with `target-wrong` reason, or a direct re-open to `PLAN`) with a 3-strike same-row-failure counter | `decision-record.md` D6 | C3, F-LOOP-01/02 | D,G | M |
| d2 | Add liveness records (START/HEARTBEAT/terminal) and a stale-node timeout to every non-human node | `decision-record.md` D6 | F-LOOP-09 (indirect) | L | M |
| d3 | Expand the verdict-file schema to carry tree hash, per-row rubric results, capture IDs, and a judge-calibration reference | `decision-record.md` D6 verdict schema | F-LOOP-07/08 | L,G | M |
| d4 | Add a judge-calibration step before the first JUDGE on any child: score a known-good and a known-bad (card-container) pair first | `spec.md` §5 process, new calibration fixture | F-LOOP-07 | L,G | S |
| d5 | Mechanically gate release cutting on DONE (D8) rather than leaving it as prose | release tooling (not yet located in-repo) | F-LOOP-09 | D,L,G | M |

### (e) Operator decisions required

| # | Decision | Why it's blocking | Lineages |
|---|---|---|---|
| e1 | ADR-I: which shared close glyph (Notion `Done`/`‹`, ClickUp round `✕`, or keep the current bare `✕`)? | Blocks `001`'s and every downstream sheet's header row target | D,G |
| e2 | Which scope does child `020` actually cover — table chrome (glm), contextual dropdown/record-peek (luna), or control-primitive geometry (deepseek)? Or three separate children? | The three lineages proposed non-identical `020`s; only one number is free | D,L,G |
| e3 | Property-type picker: does it stack (D9's general rule) or replace-in-place (current `007` behavior)? | Blocks `007`/`010` DEFINE closure | L (ADR-N) |
| e4 | Which 22px/13px typography values are measured exceptions vs. must migrate to the sanctioned scale? | Blocks typography rows across multiple children | L |
| e5 | May `014`/`016`/`017` use representative (sampled) judging if every surface still gets a smoke capture? | Affects VERIFY cost for 33+ bundled surfaces | L |
| e6 | Confirm the C-1..C-6 + settings operator captures' arrival timing — every numeric target in `001`/`002` stays provisional until then | D3's top two rungs are still empty | D,L,G |

---

## Coverage matrix

19 children reconciled across the three lineages' own matrices (deepseek's `coverage-matrix.md`,
luna's depth table, glm's §3 table). Depth grade is the **most conservative of the three lineages'
grades** where they disagree (a below-L3 disagreement is resolved toward the lower grade, since none
of the three claimed a higher grade without evidence this synthesis could independently confirm).
Source column and lane-clause count are independently verified where marked; otherwise reported.

| Child | Request rows owned (roadmap §4) | Depth now (conservative) | Depth target | Source column present | Named lane clauses | Judged capture present | Disagreement across lineages |
|---|---|---|---|---|---|---|---|
| 001 settings | 74, 84, 89, 91, 92 | L3+ (CONFIRMED: 9 clauses, 148-row spec) | L3+ (already there; needs ADR-I + continuity refresh) | No (CONFIRMED absent) | 9 (L1-L9, CONFIRMED) | Yes, judged 11/16 (REPORTED) | None — all three agree 001 is the reference implementation |
| 002 properties | 74, 87b, 89, 91, 92 | L2-L3 (D:L3 all-phase-mixed; G:L3+ several phases; luna:L2-L3) | L3+ | No (CONFIRMED absent) | Some (002's own, per D/G) | Yes, judged 11/16 (REPORTED) | G grades several 002 phases L3+; D/L grade it lower — resolved to L2-L3 here |
| 003 filter | 75, 87b, 89, 91 | L2 (D,G agree "L3−"/L2+; luna: L2/L3 mixed) | L3+ | No (CONFIRMED absent) | 0 named IDs (REPORTED) | No | Minor — all agree on the shape |
| 004 sort | 85, 87b, 89, 91 | L2 | L3+ | Not checked (REPORTED absent, by extension of 001-003 pattern) | 0 | No | None |
| 005 group | 87b, 89, 91 | L2 | L3+ | Not checked | 0 | No | None |
| 006 add-view | 87b, 89, 91 | L2 | L3+ | Not checked | 0 | No | None |
| 007 property-editor | 75, 87b, 89, 91 | L2 | L3+ | Not checked | 0 | No | Depends on ADR-N (stack vs. replace) resolution |
| 008 record | 87b, 89, 91 | L2 | L3+ | Not checked | 0 | No | Record-peek (row 8) ownership ambiguous per luna/glm |
| 009 menu/confirm | 87b, 89, 91 | L2 | L3+ | Not checked | 0 | No | None |
| 010 pickers | 72, 87b, 89, 91 | L2 | L3+ | Not checked | 0 | No | Shared listbox (row 30) ownership ambiguous |
| 011 toolbar/width | 83, 86a, 87b, 89, 91 | L2 | L3+ | Not checked | 0 | No | None |
| 012 board-card-fields | 73, 86b, 90, 94 | L2-L3+ (landed CREATE; judge pending — glm: L3+ several phases; D,L: L2) | L3 (board geometry, not sheet) | REPORTED present (D9/§7.20 preamble) | Landed 28-clause gate (REPORTED) | Judge not yet run (CONFIRMED via roadmap §7.20 text: "judge not yet run") | glm more generous (L3+); resolved conservatively to L2-L3 pending judge |
| 013 board-card-properties | 93 | L1+-L2 (CONFIRMED: 27-row spec, no clause IDs found) | L3+ | Yes (CONFIRMED) | Not found | No | None |
| 014 fuzzy-suggest | 93 | L1+-L2 | L3+ | Yes (CONFIRMED) | Not found | No | None |
| 015 cell-editors | 93 | L1+-L2 | L3+ | Not checked | Not found | No | None |
| 016 view-toolbar | 77-80, 93 | L1+-L2 (no scenario-registration task, per D/G) | L3+ | Not checked | Not found | No — surfaces unreachable in build (F-COV-04) | None on grade; agree on the unreachability defect |
| 017 utility-modals | 76, 81-82, 93 | L1+-L2 (18+2 surfaces, no registration task) | L3+ (or representative judging, e4) | Not checked | Not found | No | Whether representative judging is acceptable (open question e5) |
| 018 board-ClickUp | 94 | L2-L3 (glm: L3−; D,L: L2) | L3 (board, ClickUp-led) | Yes (CONFIRMED) | Some (landed §13, REPORTED) | Yes, "landed" per roadmap §7.21 note (REPORTED) | None material |
| 019 board-drag-ClickUp | 94 | L1+-L2 (glm: L2 DEFINE; missing §13 three-frames table per F1.6) | L3 | Not checked | Not found | No | None material |

---

## Open questions

| # | Question | Owner | Why it's open |
|---|---|---|---|
| 1 | Which scope does the proposed child `020` cover — table chrome, contextual dropdown/record-peek, or control-primitive geometry? | Operator | Three lineages proposed three different `020`s (F-COV-03, e2) |
| 2 | Which shared close glyph resolves ADR-I? | Operator | Blocks `001` header row and every downstream child (F-REF-07, e1) |
| 3 | Does the property-type picker stack (D9 default) or stay replace-in-place? | Operator | Blocks `007`/`010` DEFINE closure (e3) |
| 4 | Should the D7/lane contradiction (a1) be fixed before or as part of `001`'s next CREATE pass? | Operator + `001` implementer | The lane currently certifies a banned shape; sequencing matters for whether `002`'s remediation (which also touches the card fill token) lands first |
| 5 | Should the missing `REMEDIATE→DEFINE` edge (C3/d1) be a new graph edge or should `003`'s task language be walked back? | Operator | Changes D6, a cross-packet decision-record |
| 6 | Which 22px/13px typography values are measured exceptions vs. migration targets? | Operator | Blocks typography rows in multiple children (e4) |
| 7 | May `014`/`016`/`017` use representative (sampled) judging given their 20+ bundled surfaces? | Operator | Affects VERIFY cost and rigor (e5) |
| 8 | When do the C-1..C-6 + settings operator captures arrive, and do already-scored children (`001`, `002`) re-open their DEFINE on arrival? | Operator | D3's top two reference rungs are still empty; every numeric target in the two judged children stays provisional |
| 9 | Should `roadmap.md` §4's triple-reused row numbers (86/87/88) be footnoted or renumbered? | Spec-doc owner | Low-stakes but affects citation clarity (F-COV-05) |
| 10 | Exact D9 Source-column count across all 19 children — 6, 7, or another number? | Whoever lands recommendation (a5)/(b3) | Two lineages disagree by one; resolvable by a direct grep, not a judgment call (C4) |

---

## Method

**Lineages.** Three parallel `cli`-executed research lineages ran against
`specs/005-component-surface-system/076-sheet-visual-parity` under one fan-out orchestration run
(`run_id: 1789102713325-fbmgv2`), none aware of the others' output:

| Lineage | Executor | Model | Iterations required | Stop reason | Mean newInfoRatio |
|---|---|---|---|---|---|
| deepseek | `cli-pi` | `deepseek-v4.1-flash`, max effort | 10 of 10 | `maxIterationsReached` | 0.703 (min 0.63 at iter 10) |
| luna | `cli-codex` | `gpt-5.6-luna`, max effort, fast service tier | 5 of 5 | `maxIterationsReached` | ~0.85 (range 0.77-0.97) |
| glm | `cli-pi` | `glm-5.3-flash`, max effort | 5 of 5 | `maxIterationsReached` | 0.66 (range 0.60-0.70) |

None of the three converged early — all three ran to their configured cap with the terminal
iteration still producing new joins, per their own convergence reports. Timings: luna's own state
log shows iterations 3-5 spanning roughly 05:22-05:33 UTC on 2026-09-11, with synthesis completing
at 05:39:31Z — the full 5-iteration lineage ran in well under an hour of wall time per the recorded
timestamps.

**The containment technicality.** All three lineages were flagged **failed** by the fan-out runner,
not for the quality or completeness of their work but for a write-containment violation: each wrote
one file one directory level too high — `research/findings/iter-1.md` (should have been inside its
own `research/lineages/<name>/findings/`) and, for luna and glm, also
`research/iterations/iteration-004.md`. The runner reverted these as "preserved_untracked" and
marked the lineage `failed`/`exit_code 1`, `retryable: false` (confirmed directly in
`research/orchestration-status.log`'s `containment_violation` and `failed` events for all three
labels). **This is a path-depth bug in the write, not a defect in the research itself** — all three
lineages' actual artifact directories (`research/lineages/deepseek/`, `/luna/`, `/glm/`) are
complete, and this document treats their content as-is. The two stray one-level-too-high files
(`research/findings/iter-1.md`, `research/iterations/iteration-004.md`) are deleted before this
change lands, per the landing instructions.

**What was independently re-verified vs. taken as reported.** Every claim marked CONFIRMED above was
re-checked directly against the file it cites in this worktree during this synthesis pass —
`decision-record.md` D1-D9 in full, `spec.md`'s METADATA/PROBLEM/six-step-loop/rubric sections,
`coverage-audit.md`'s method and surface count, `roadmap.md` §4 (rows 70-94), §6A, and §7.18-7.21,
`tools/live/sheet-grammar.mjs`'s card-grouping assertions (lines ~1810-1960 and ~4871-4933),
`styles.css`'s `.obnotion-settings-card` token declarations, `tools/lane/css-lane.json`'s full
history array (parsed programmatically), `src/settings.ts`'s `DEFAULT_VIEW_TYPES`, `src/views/`'s
`createSurfaceShell` usage count, and DEFINE-table Source-column presence/absence in six sampled
children (`001`, `002`, `003`, `013`, `014`, `018`). Claims marked REPORTED are taken from a
lineage's own iteration/findings files without independent re-derivation in this pass — mostly
precise numeric counts (font-size literal counts, exact blind-spot pixel counts, exact per-child
Source-column totals beyond the six sampled) and process judgments (judge calibration quality,
whether D8's release gate is mechanically enforced anywhere outside this repository's visible
tooling). No finding in this document is CONTRADICTED by evidence found in the worktree; the one
CONTRADICTED entry (F-REF-03) reflects the two lineages disagreeing with each other, not with the
repository.

**What this pass did not do.** It did not run `npm run gate`, `vitest`, `tsc`, or any capture/lane
tooling — those would mutate lane state and captures, which is out of scope for a research synthesis
that must not touch child specs, plans, or decision records. It did not exhaustively grep all 19
children's DEFINE tables for the Source column (six were sampled); it did not independently recount
deepseek's literal font-size/token-use figures or its pixel-hash blind-spot figures; and it did not
attempt to adjudicate any of the six operator decisions listed in Recommendations (e) or the ten
Open questions — those are for the operator, not this document.
