# Deep-Research Synthesis — `076-sheet-visual-parity`, lineage `deepseek`

**Session:** `fanout-deepseek-1789102713325-fbmgv2` · loop `research` · **stopReason:**
`maxIterationsReached` (10/10) · executor `cli-pi:deepseek-v4.1-flash` (in-process; no nested dispatch)
**Artifact dir:** `specs/005-component-surface-system/076-sheet-visual-parity/research/lineages/deepseek/`

Range: the whole `076` packet — parent `spec.md` / `plan.md` / `decision-record.md` D1–D9 /
`goal.md` / `coverage-audit.md`, children `001`–`019`, `roadmap.md` §4 + §6A + §7, the design system
(`styles.css`, `src/views/surface-shell.ts`, `src/views/record-surface/`, `tools/live/sheet-grammar.mjs`),
the inventory and capture harnesses, the css lane and the gate.

---

## 1. Verdict in one page

The packet is **complete in coverage and unfinished in traceability**. Nineteen children exist for
every request that has one, the eleven sheets have production-mount scenarios and full-sheet judged
captures, and the loop's node table is written down. What the ten iterations found is that the
*join* between those parts is prose: a DEFINE row does not name the clause that measures it, a clause
does not name its child, a judged capture does not name its hash, a ruling does not name the sheets
it binds, and a release does not prove the tree it judged still exists.

| Class | Headline measurement | Worst case |
|---|---|---|
| **COVERAGE** | rows 70–88 of `roadmap.md` §4 all route to named packets; one genuine surface gap (`dropdown-field.ts` + checkbox/radio geometry) | `016`'s three toolbars are unreachable in a released build (`DEFAULT_VIEW_TYPES`); `017` bundles 18 sheets under one judge table |
| **DEPTH** | only `001` is L3+; `002`–`011` are L3; `012` is L2; `013`–`019` are L1+–L2 | seven children name **zero** lane clauses; 119 scaffold-set DEFINE rows carry 51 clauses |
| **REFERENCE_COMPOSITION** | D9's Source column exists in 7 of 19 children only | `012` is owned by both D9 (ClickUp) and §7.21 (Anytype); 47 inventory rows have no reference of any kind |
| **DESIGN_SYSTEM** | one sheet frame is a class-name convention (9 users of `createSurfaceShell`); ~275 literal font sizes vs 102 token uses | D7's no-card rule is contradicted by six lane sites; five competing row heights; the status-colour layer is outside `--obnotion-*` |
| **LOOP_LOGIC** | DONE's predicate is not re-derivable from any file; the judged-capture comparator is not in the repo | `max_iters=4` is unreachable for both children that ran; D7 voided `002`'s in-flight remediation |

An image judge scored the two children that reached it **11/16 twice** — once with one zero, once
with two — and the second score came *after* a remediation leg because the ruling changed underneath
it. That single sequence is the audit in miniature: the work is real, the evidence chain is not yet
load-bearing.

---

## 2. Apply first — nine mechanical repairs, each with its evidence

These need no design decision and unblock the rest of the list. Ordered by dependency.

| # | Repair | File(s) | Evidence |
|---|---|---|---|
| 1 | **D7 lane inversion.** Rewrite the card machinery: `dividerExpected` (`:1815`), the `cards` collector (`:1823`), the `cards.length === 0` early return (`:1955`), `settingsCardList` (`:4871`), `titlesInsideList` (`:4890`), `parityCardCount` (`:4929`) | `tools/live/sheet-grammar.mjs` | iteration 3, R-1; a D7-compliant tree currently empties `cards` and fails the surviving clauses |
| 2 | **Lane-file integrity.** Repair the 5 malformed history entries (2 missing `event`, 3 missing `at`), add the `holder`/newest-acquire consistency check, and fix the unrecorded hold | `tools/lane/css-lane.json`, `tools/lane/check-lane.mjs` | iteration 9, G-1 — `holder`/`acquiredAt 03:21:40Z` has no history event |
| 3 | **Clause ids and provenance.** Namespace clause ids `<child>/L<n>` in `sheet-grammar.mjs`, add the `CLAUSE_CONTROLS` watched-red map (the `verify-placement.mjs` pattern), delete clauses a ruling retires | `tools/live/sheet-grammar.mjs` | iterations 9 (G-2), 7 (T-3), 2 (D-1) |
| 4 | **Bring the comparator in.** Land the decoded-pixel-delta tool and print the delta beside the hash verdict in `check-lane` | `tools/screenshots/pixel-delta.mjs` (new), `tools/lane/check-lane.mjs` | iteration 9, G-3 — every release cites `scratchpad/glm/pixel-delta.mjs`, which is not in the tree |
| 5 | **Guard and re-open.** Default `max_iters=6`; add the `DEFINE-REOPEN` transition on a superseding ruling | `decision-record.md` D6, `plan.md` §6A/§7 | iteration 9, G-4 — both children exceed 4; D7 voided `002`'s target and §7's trigger cannot fire |
| 6 | **Verdict rows and capture identity.** `JUDGE-<n>.json` gains `rows{}`, `captures[] {file,pixelHash,layoutHash}` and `inputs{}`; `DONE.json` names both passes | D6's schema, `plan.md` §6A | iterations 9 (G-5), 5 (L-1/L-6) |
| 7 | **Traceability column.** Every §13 row whose Target is numeric names its clause id or `judge-only` | all 19 `spec.md` §13 | iteration 10, X-1 — 29 rows have neither |
| 8 | **Doc-truth repairs.** `SPECKIT_LEVEL 2` → the parent's contract; dedupe §4's row numbers; `002`'s stale “inset cards” wording; reconcile the two third-strike rules | 19 × `spec.md`/`verification.md`, `roadmap.md` §4, `002/spec.md`, `plan.md` §7 | iteration 10, X-4; iterations 2 (D-5), 1 (C-7), 2, 2 (D-6) |
| 9 | **`SURFACE_PHASE` in the packet.** Name the variable and the acquire/edit/release triplet in each child's CREATE tasks | 19 × `tasks.md` | iteration 9, G-1 — the variable appears nowhere in the packet |

---

## 3. Coverage

**Requests.** `roadmap.md` §4 rows 70–88 each route to a named packet; rows 89–94 are claimed (89
parent, 90 → `012`, 91 → `002`, 92 → `001`, 93 → `013`–`017`, 94 → `018`/`019`). One real surface gap
remains: **no child owns `src/views/dropdown-field.ts` or the checkbox/radio control's geometry** —
proposed as `020-control-primitives-visual-parity`, which iteration 6 showed may shrink to control
geometry once `001` owns the shared row primitives. Two partials: `017`'s toast has no constructed
scenario, and `016`'s three toolbar surfaces are unreachable.

**Surfaces.** The regenerated inventory holds **87 surfaces** (55 primary + 32 stacked); **47 carry no
reference of any kind**, 18 of them in `017`. The stacked table assigns all 32 pairs to children; the
engine that runs them (`REGISTERED_STACKED_PAIRS` + the 0.710 ± 0.02 scrim band) exists, but no child
names its own pairs.

**Reachability.** `016`'s calendar/timeline/chart toolbars are constructed and instantiated but not
presentable (`DEFAULT_VIEW_TYPES = ['table','board']`, `toolbar-renderer.ts:109-111`, the chart
redirect). The packet cannot express “deferred”: its states are scaffolded/planned/created-awaiting-
judge/complete and the coverage legend is Child/NONE.

**Judged captures.** Exactly **11 `capture: "sheet"` scenarios** exist — one per sheet of `001`–`011` —
emitted by `capture.mjs`'s `EXPAND_SHEET` (defeats the 90svh cap) and matched by 22 committed PNGs.
`012`–`019` have none: `013` is viewport-only, `014`'s five FuzzySuggest surfaces have no scenario,
`017` has three `capture: "element"` fixtures that D2(b) disqualifies.

**Clauses.** `001` 10, `002` 6, `003`–`012` 4–6 each, `013`–`019` **0**. In the lane tool only
`002`'s `L1–L8` carry ids.

---

## 4. Depth

Graded phase by phase: `001` **L3+**; `002`–`011` **L3**; `012` **L2**; `013`–`019` **L1+–L2**. The
eight children opened after the D2 note and the frame ruling are the entire sub-L3 population.

Concrete deficits, all measured: no named clause ids (`013`–`019`), §13 tables of 4–9 rows against
`001`'s 22 (most targets `TBD — needs T001`), no `both themes` row (`002`, `013`–`019`), numeric
thresholds absent (0–1 pixel/pt lines against `001`'s 5 and `012`'s 8), and Phase F compressed to
one sentence in every scaffolded child. Minimum repair: **30–60 added lines per thin child, 15–25 per
middle child**.

States are the second half of this class. The eight-row rubric has no state row; `017/spec.md`
contains zero occurrences of “dark” while adjudicating eighteen sheets; `010`'s filter-empty criterion
is half-proven. Proposed: empty/shortest/longest per surface per theme in the judged set, and either
a ninth rubric row (pass ≥ 16/18) or explicit per-state cells in the findings.

---

## 5. Reference composition

D9 requires a per-element `Source` chosen best-of-three and a ClickUp lead for boards. Reality:
`013`–`019` carry the column (7 of 19); `001`–`012` carry **zero**. Three conflicts and gaps:

- **`012` ownership.** D9 names it a ClickUp-led board surface; `roadmap.md` §7.21 keeps its
  single-column field grid on Anytype (`056` ADR-008). Proposed §7.22: narrow D9's board clause to
  exclude `012` (recommended), or extend ClickUp over it and reopen ADR-008.
- **`001`–`011` header contradiction.** Adding a Source column beside a `Notion (structural)` column
  is a header collision; `005` already invented the right answer for its unreadable rows (“Retained
  or removed by our own consistency argument … no Notion claim (D3)”). Proposed header: one column per
  reference **plus** Source and Why.
- **No packet-level index.** Four children's T001 re-derive the same reads (and `003`'s warns Mobbin
  family names are unreliable, with roughly a third of files mislabelled). The ClickUp assets under
  `screenshots/clickup/ios/views/` are unindexed. Proposed `076/references.md`: each asset, its
  resolution, what it shows, what it cannot answer.

Zero-reference surfaces have no legal Source value; proposed six legal values (Anytype, Notion,
ClickUp, operator, internal naming the child whose grammar is followed, or a named split), with a
blank cell failing the DEFINE pass. Dark references exist where Notion's do not: **52 Anytype dark
sheet assets** and **49 ClickUp dark files**, against 23 Notion dark-named files that are all
desktop-web flows.

---

## 6. Design system

**The frame is a convention, not a component.** `createSurfaceShell` has 9 users against 187
`src/views/*.ts` files while 29 files emit sheet row classes; `filter-panel-renderer.ts:27` builds its
own panel; `active-rule-popover-renderer.ts:121-122` borrows the class list. `001` and `002` reach the
frame by different routes and D7/D9 have no component to bind.

**Row and divider primitives.** 20-plus row classes with `obnotion-panel-row` at 82 rules; two
divider mechanisms, and only the `::before` pseudo-element one can express D7's inset (the dominant
76 `border-bottom` declarations cannot). Proposed primitive set: `obnotion-sheet-row`,
`-section`, `-nav-row`, `-toggle-row`, `-picker-row`, extracted by `001` (with `003` owning the picker
row).

**Tokens.** The `--obnotion-*` scale tops out at 16px, so D7's 17pt row label has no home, while
~275 literal `font-size` declarations, 102 token uses and 45 host-token uses compete; proposed
`--obnotion-font-row-label` / `-row-value` at 17px and a migration rule with a published literal
count. The status/option colour layer is the plugin's own, theme-paired, and entirely outside the
`--obnotion-*` namespace — with a recorded `gray ≡ slate` collision and no lane assertion; proposed
aliases, a 4.5:1 floor and a pairwise-distinguishability check. `SHELL_PHONE_DIVIDER_INSET_PT = 20`
is read by nothing while the lane asserts 16.

**Row heights.** Five values coexist: 28 (`SHELL_ROW_HEIGHT_PX`), 34 (`--obnotion-row-height-default`),
44 (`ROW_PITCH_FLOOR_PX`), 50 (`SHELL_PHONE_ROW_HEIGHT_PT`), 64 (the ClickUp reference). D9's 44pt
floor is asserted on two sheets.

**Elevation after D7.** Three surfaces survive (canvas, sheet, recessed field); the retired card is
still asserted in both themes and both directions (`sheet-grammar.mjs:1943-1946`, `:4896`) and two
token declarations (`styles.css:114`, `:1044`) plus a 150-rule block still ship.

---

## 7. Loop logic

Six findings, all measured, ordered by what they cost:

1. **The lane file disagrees with itself** — `holder`/`acquiredAt` with no matching history event;
   5 malformed entries; `SURFACE_PHASE` undocumented in the packet.
2. **A clause has no identity and no red** — all packet clauses live in one of 28 gate checks;
   `sheet-grammar` prints ~197 clause lines, 8 with ids; the gate surfaces two lines of a red; the
   repo already owns the missing mechanism (`PHASE_CONTROLS` + attribution ratchet).
3. **The comparator is out of tree** — every release cites `scratchpad/glm/pixel-delta.mjs`; the
   in-repo measure is the 16×16 grid hash with two recorded blind spots (46,779px and 22,510px moves
   hashing identically).
4. **The guard is unreachable and the graph under-reacts** — `001` needs iterations 3–4 exactly;
   `002` needs 3–5 because D7 zeroed a target it had already spent iteration 2 remediating.
5. **The DONE predicate is not re-derivable** — no rows, no capture identity, no `inputs` in the
   verdict schema; `002`'s 11 → 11 hides a moved row set and a doubled zero count.
6. **The outer walk has no liveness rule** — any state file reads as progress; ESCALATE is a
   permanent skip; `concurrency=2` is metered in children against a one-writer file (six lane
   acquisitions in ~5h, two of them for capture-only legs that edited no stylesheet).

---

## 8. Coverage matrix

The per-child matrix (request row → child → judged capture → clauses → rubric expectations) is
`coverage-matrix.md` beside this file. Its summary line: **19 children, 11 with judged full-sheet
captures, 12 with named clauses (67 ids), 7 with none, 1 proposed (`020`)**.

---

## 9. Corrections carried

DS-2 → Y-1 (the colour tokens are the plugin's own, not the host's); LC-5 → Y-3 (stacking has an
engine; the gap is ownership); C-3 narrowed (operator images resolve at `screenshots/operator/`; the
reasoning notes do not exist); the full-sheet variant is a `-sheet` scenario with `capture: "sheet"`,
not a `-sheet-mobile-` id; Z-1 sharpened (the calendar/chart/timeline modules are live, their
presentation path is gone). All five are recorded with their superseding statements in
`findings/iter-10.md` §X-4.

---

## 10. Questions this audit hands back

Ten are the operator's (020's existence and timing; 016's deferral; 017's judged sample; 012's source
owner and D9's Proposed-vs-settled wording; the C-1…C-6 and dark captures' arrival; declared
deviations against DONE; the ninth rubric row; the 17pt scope; the colour namespace; the dark
composition rule). Nine more are the packet's own to answer. The full ledger, with owners, is
`findings/iter-10.md` §X-3. **Nine of the nineteen are not on any of the packet's current
open-question lists** — they are inputs to a revision of `spec.md`/`plan.md`/D6/D9 that no artifact
asks anyone to write, which is the audit's single largest residual risk.

---

## 11. What this audit could not establish

- Whether the image judge ever agrees with the operator: no operator phone read of any `076` sheet
  has been recorded, so the packet's own open question (and iteration 5's L-8 calibration register)
  stays unanswered. `002`'s judge-vs-creator delta (+2 creator, two rows) is the only signal.
- The real cost of the loop under concurrency: the drivers live in the orchestrator's scratchpad
  (`$S/loop/`), so stall times, retry counts and lane waits are unobservable from the repository.
- Whether the operator's C-1…C-6 captures will arrive before the DEFINE tables are frozen; the
  packet's D3 and every child's `TBD` rows stay provisional until they do.

**Confidence:** the coverage, depth, design-system and loop-logic numbers are measured from the tree
and reproducible by the commands quoted in each iteration; the proposals are marked as proposals and
each names the artifact it changes. `stopReason: "maxIterationsReached"` — the loop stopped at the
cap, not at convergence; `newInfoRatio` at iteration 10 was 0.63 and the terminal iteration still
produced new joins (X-3/X-4), so the axis was not exhausted.
