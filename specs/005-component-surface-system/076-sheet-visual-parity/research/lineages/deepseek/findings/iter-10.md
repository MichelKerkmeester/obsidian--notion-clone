# Iteration 10 — CROSS-CUTTING: the traceability audit, the claim→assertion ledger, and the residual question set

**Gap class:** CROSS-CUTTING (the terminal audit iteration). The nine prior iterations each audited
one axis. This one asks the question the packet's own success criteria imply and no artifact answers:
**for every target the packet names, which assertion measures it, and where does that assertion
live?** Plus the corrections the nine iterations issued and the questions they left open, gathered
so the synthesis does not have to re-derive them.

---

## X-1 · The traceability matrix: 119 DEFINE rows, 51 named clauses, 36 rows with none

**Measured this iteration** (`### The table` region of each `spec.md`, rows excluding header and
separator; clause bullets of the form `- **L<n>**`; both counted mechanically).

| Child | DEFINE rows | Named clauses | Clause ids in the lane tool? |
|---|---:|---:|---|
| `001` | 22 (§13.1–13.11, per iteration 2) | **10** (L1–L10) | assertions present as prose; **no L-ids in `sheet-grammar.mjs`** |
| `002` | 5-row row table + 13.5–13.8 (per iteration 2) | **6** (L1–L6) | **L1–L8 present with ids** in the properties-parity block (`sheet-grammar.mjs:4035+`) |
| `003` | 11 | 6 (L1–L6) | no — spec-only until CREATE |
| `004` | 10 | 6 | no |
| `005` | 8 | 5 | no |
| `006` | 8 | 5 | no |
| `007` | 9 | 5 | no |
| `008` | 8 | 5 | no |
| `009` | 7 | 5 | no |
| `010` | 9 | 5 | no |
| `011` | 7 | 5 | no |
| `012` | 6 | 4 | no |
| `013` | 4 | **0** | — |
| `014` | 4 | **0** | — |
| `015` | 4 | **0** | — |
| `016` | 4 | **0** | — |
| `017` | 5 | **0** | — |
| `018` | 7 | **0** (SC-001…003 read “Lane clause, new”) | — |
| `019` | 8 | **0** | — |
| **Scaffold set (003–019)** | **119** | **51** | |
| **013–017 + 019 (seven children)** | **29** | **0** | |

**Reading.**

- The requirement written into every child's deliverables — *“one lane clause per measurable row”* —
  is satisfied for **51 of 119** rows across `003`–`019`, and the 68 unmatched rows are not random:
  they are the non-numeric rows (Sheet frame, Value affordance, Both themes, Destructive scope) plus,
  in the seven thinnest children, **every row**. `003`'s own table is the cleanest example: its 11
  rows carry 6 clauses, and the five without one — Sheet frame, Value, Add affordance, Destructive,
  Both themes — are exactly the rows a judge scores subjectively.
- Clause ids are only recoverable for `002`. `001`'s L1–L10 exist as text inside the setting-parity
  section with no ids, and `sheet-grammar.mjs` shows `L1…L8` for the properties block only. So a
  release note that says *“grammar L8 green”* resolves for `002`, silently means nothing for `001`,
  and collides with `071/002` — the same id space, three owners (iteration 9, G-2).
- The capture column is thinner still: `screenshots/manifest.json` gives **11 `capture: "sheet"`
  scenarios** (the D2 full-sheet judged images) and 22 PNGs, all mapped one-to-one onto the eleven
  sheets of `001`–`011`; `013`–`019`'s judged surfaces either have no scenario at all (`014`'s five
  FuzzySuggest surfaces, no id matching `suggest`), only viewport captures (`013`), or only
  `capture: "element"` fixtures among the nine with no constructed counterpart (`017`).

**Proposed text** — make the row the unit of traceability, per child:

```markdown
### `spec.md` §13, the traceability column

Every row of the §13 table whose Target is numeric gains its clause id in a new `Clause` column
(`002/L5`, `003/L2`), or the literal `judge-only` where the target is one the eight-row rubric scores
and no lane can (Both themes, Destructive scoping, Sheet frame's source). A row with neither is a
row nothing measures — the DEFINE pass fails on it. The child's clause ids are namespaced and
recorded in `sheet-grammar.mjs` (iteration 9, G-2), so this column is the join key between the
packet, the tool and the release note.
```

**Confidence:** high — every count is mechanical and reproducible; the lane-side id check is a grep.

---

## X-2 · The claim→assertion ledger: which of D1–D9 and the six operators are actually measured

| Claim (source) | Assertion that measures it | Verdict |
|---|---|---|
| **D1** image judge required, ≥14/16, no row at 0, twice on an unchanged tree | the two `verification.md` tables that exist (`001` 11/16; `002` 11/16 then 11/16, 2 zeros); no gate, no verdict file | **prose + two Markdown tables**; 17 children have the template only |
| **D1** a lane is a floor, never sufficient | recorded in D1 itself and in the `067` outstanding row (17 captures, hash-identical, 46,779px moved) | **prose**, and honoured in every release note's delta method |
| **D2** full-sheet judged capture | `capture.mjs`'s inline `EXPAND_SHEET` + `capture: "sheet"` entries; 11 scenarios, 22 PNGs; `002`'s iteration-2 judge opened the `-sheet-mobile-` variants | **mechanism exists**; the “always the judged image” rule and the no-fixture-shrinking rule are prose (iteration 5, L-4) |
| **D2a** every producer of the grammar | `003`/`004` each bind two (`filter-panel-renderer.ts` + `active-rule-popover-renderer.ts`); `003`'s §13 carries the active-rule popover row and L1 asserts it | **asserted** for the two families that have one; `013`–`019` enumerate producers but no producer-vs-scenario completeness check exists |
| **D2b** captures from a production mount | all 59 constructed scenarios mount shipped renderers via `runRenderAssertions` (audited iteration 1) | **asserted** by the harness |
| **D3** reference precedence, every number ours or TBD | `spec.md` §13 prose per child; `003`–`011` carry `TBD` rows; `001`'s §13.0 records rungs 1–2 empty | **prose**; the operator captures (rungs 1–2) have not arrived |
| **D7** no card containers, dividers on plain background | `001` L1/L6/L8 assert it for the settings sheet and `002` L6 for the add-row; **no lane clause asserts it packet-wide**, and the tool still requires the card (six sites, iteration 3 R-1) | **partially asserted, actively contradicted by the lane until the rewrite lands** |
| **D9** rows ≥ 44pt | `001` L3 (≥13 rows ≥44px), `002` L5 (min-height ≥44px); `ROW_PITCH_FLOOR_PX 44` asserted only on the owned-menu surface | **2 of 11 sheets** |
| **D9** grab handle on every phone sheet | lane `NEGATIVE_CONTROL` on the sort panel only | **one surface** |
| **D9** 16pt inset | `001`/`002` clauses + `SETTINGS_SHEET_INSET_PX` in the divider-inset section | **asserted where the children landed it** |
| **D9** stacked sheets for pickers | `REGISTERED_STACKED_PAIRS` engine + scrim band; registry run over all pairs | **asserted at the engine, not per child** (iteration 8, Y-3) |
| **D9** per-element Source column (best of Anytype/Notion/ClickUp) | `013`–`019` DEFINE tables carry `Source`; `001`–`012` carry **zero** | **7 of 19** |
| **D8** a release only after DONE | `plan.md` §6A prose; `0.0.40` was cut after `001`/`002` LANDed and before either passed | **prose, already violated once** |
| **D6** the loop graph itself (drivers, verdict schema, both logs) | `loop-driver.sh`/`program-loop.sh` live in the orchestrator's scratchpad `$S`, not the repo | **unimplemented in-tree**; only the node table in `decision-record.md` is reviewable |

**Reading.** Every ruling has a place where it is written down; three have a mechanism (`D2b`, `D9`
stacking, `D9` inset-on-landed-sheets); two are asserted across all eleven sheets by construction
(`D2`'s full-sheet capture, `D3`'s TBD discipline where a reference is missing); the rest are asserted
on the sheets that happened to land, or nowhere. The pattern is consistent with the packet's design —
the lane carries what a lane can — but the rubric's own rows (Frame, Both themes, Destructive) and
the packet-wide constraints (no cards, 44pt, grab handle) have no whole-packet assertion, so a child
that ships them wrong is caught only by the judge, and the judge is the gate that scored 11/16 twice.

**Proposed text** — the packet-level clause set and its owner:

```markdown
### `spec.md` §5, the shared constraints (LC-1 … LC-7)

Seven clauses that bind every child and live once in the lane tool, run over the union of the
children's registered surfaces:
LC-1 no rounded or lighter container [D7]; LC-2 exactly one hairline per adjacent row pair [D7];
LC-3 grab handle present, 34×5pt at 6pt [D9]; LC-4 16px leading inset and 44px row pitch [D9];
LC-5 pickers stack over the parent sheet [D9]; LC-6 both themes agree structurally on a named step
[iteration 7]; LC-7 option/status roles resolve per theme and clear 4.5:1 [iteration 8].
A child's DEFINE table cites the LC numbers it must satisfy; the lane reports them once per released
sheet, so the packet-wide constraints stop being prose the judge enforces alone.
```

**Confidence:** high — each row cites the artifact named; the LC set consolidates the iterations'
already-proposed clauses (R-1, T-2, Y-1) rather than inventing new ones.

---

## X-3 · The residual question set: 21 questions, three owners

Collected verbatim-shaped from the nine iterations' `Open questions` sections:

**A · Operator-scope questions (a ruling settles each; none can be answered in-tree)**

1. Does `020-control-primitives-visual-parity` exist (iteration 1, C-4), and if so does it land
   before `003`–`011` CREATE — or does `001`'s shared row/section primitive absorb it (iteration 6)?
2. `016`'s three unreachable toolbars (`DEFAULT_VIEW_TYPES` excludes them; a persisted chart view
   redirects): defer the child, or judge the constructed scenario anyway (iteration 6, Z-1)?
3. `017`'s eighteen modal sheets: judge a six-surface structural sample or all eighteen with six
   score tables (iteration 6, Z-3)?
4. `012`'s field grid: narrow D9's ClickUp board clause to exclude it (recommended) or extend ClickUp
   over it and reopen `056` ADR-008's word-break settlement (iteration 3, R-2)? And is D9's board
   clause Proposed or settled, given `roadmap.md` §7.21 calls the same ruling settled?
5. Do the operator's C-1…C-6 captures (and the settings dark capture, OC-S2) exist outside the repo
   and may they be copied in (iterations 1, 7)?
6. Do declared deviations count against DONE — may a child pass with `Frame = 1*` where the shared
   header is the reason (iteration 5, L-3)?
7. States: add a ninth rubric row (pass becomes ≥16/18) or keep eight and score states in the
   findings (iteration 7, T-4)?
8. `--obnotion-font-row-label` at 17px: every sheet row, or only the sheets the operator flagged
   (iteration 8, Y-2)?
9. Colour roles aliased into `--obnotion-*` or accepted unnamespaced (iteration 8, Y-1)?
10. Where a Notion-sourced element has no dark reference: the operator capture, the Anytype/ClickUp
    dark equivalent, or an internal token pair (iteration 7, T-1)?

**B · Evidence-pipeline questions (the packet can answer these itself)**

11. Is a representative judged capture acceptable for `014`/`016` (one call site judged, all five
    lane-checked), given D1 says a lane never closes a sheet (iteration 2)?
12. May the judge score `019`'s mid-drag ghost against the same eight-row rubric, or does the packet
    need a motion variant the rubric lacks (iteration 2)?
13. Should the clause registry live in `sheet-grammar.mjs` or in the gate beside `PHASE_CONTROLS`
    (iteration 9, G-2)?
14. Does a `DEFINE-REOPEN`-voided leg's evidence stay in the child's iteration table as history or
    move to a `voided/` section (iteration 9, G-4)?
15. Does the lane `sign-off` entry let capture-only legs stop taking the lane, or does the harness
    remain serialized behind it (iteration 9, G-6)?
16. Does `001` own the shared row primitive, or does the packet need a `000-primitives` child that
    lands it once for all eleven (iteration 4, DS-4)?

**C · Loop-mechanic questions (answered by the synthesis or the next revision of D6)**

17. Raise `max_iters` from 4 — iteration 5 said 6, iteration 9 shows both children exceeded 4
    (measured, not projected)?
18. Should the nine no-constructed-counterpart fixtures' chips and toasts be in scope at all
    (iteration 1, C-6)?
19. Is the real concurrency ceiling on `styles.css` the file or the surface region (strategy's own
    standing question; iteration 9 answered the measured half: 1 file, 6 signings in 5h)?

**Reading.** Ten of the nineteen questions are operator-scope, five are evidence-pipeline decisions
the packet can make itself, and four are loop mechanics. The packet's stated open questions
(`goal.md` §3, `001`'s OC-S1/OC-S2, `005`'s §12) are a subset of these — so if the operator answers
only the packet's own list, nine questions this audit raised stay unowned. That is the single
largest residual risk of the whole audit: **the audit's findings are inputs to a revision of
`spec.md`/`plan.md`/D6/D9 that nobody has been asked to write.**

**Proposed text** — a decision log the operator answers once:

```markdown
### `076/decision-record.md` §10, the answered-questions register

Each of the residual questions above gets a row: question, decision, decider, date, and the artifact
the answer changes. Answered rows stay in the record; unanswered rows stay visibly open with an
owner. The register is the handover the next executor reads instead of re-deriving (the packet's
`handover.md` links it from §1).
```

**Confidence:** high for the collection (each question is in a findings file); medium for the
clustering, which is a judgement call made on the question text.

---

## X-4 · The corrections ledger, and the four doc-truth defects the synthesis must carry

**Corrections issued across the nine iterations** (each supersedes its earlier statement and must be
carried as such, not as two facts):

| Earlier | Corrected by | What survives |
|---|---|---|
| iteration 4 DS-2: the swatches read **host** `--status-color-fg-*` tokens | iteration 8 Y-1 | the layer is the plugin's own, per-theme, and **unnamespaced**; the "host dependency" half is withdrawn |
| iteration 3 LC-5: stacking has no clause | iteration 8 Y-3 | the engine exists (`REGISTERED_STACKED_PAIRS`, scrim band, transition-aware waits); the gap is per-child ownership |
| iteration 1 C-3: `scratchpad/` paths fail to resolve | iteration 2 | the **operator images** resolve at `screenshots/operator/` (20 files); the absent paths are the reasoning notes (`scratchpad/loop/076-frame-ruling.md`, the two ClickUp `operator-notes.md`) |
| iteration 2 finding “0 `-sheet-mobile-` ids” | iteration 2 correction | the variant is a separate scenario id ending `-sheet` with `capture: "sheet"` — 11 exist |
| iteration 1: calendar/timeline/chart renderers possibly dead | iteration 6 Z-1 | the modules are live and instantiated; their **presentation path** is what is gone |

**Doc-truth defects confirmed and still open:**

1. All 19 children's `spec.md`/`verification.md` declare `SPECKIT_LEVEL 2` while every `verification.md`
   also carries `SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2`; the parent declares phase/Level 3
   and measures 75/100. A `validate.sh --recursive` compares unlike contracts.
2. `roadmap.md` §4 contains duplicate row numbers (three distinct rows numbered 86, two each numbered
   87 and 88); every “row 86” citation is ambiguous.
3. `002/spec.md`'s frontmatter description and line 54 still say the target is “grouped into inset
   cards” — stale pre-D7 wording — while its §13 and T014–T018 carry the frame remediation.
4. The packet's two third-strike rules disagree (`plan.md` §7: one rubric row three iterations;
   each child's Phase F: one row below 2; neither covers “stuck below 14 with no row at 0”, which was
   both children's actual failure mode), and `goal.md` still reads `completion_pct 0` with the blocker
   “Rungs 1 and 2 of D3 are empty”.

**Reading.** None of these four is a research gap; all four are mechanical repairs with known text,
and three of them (1, 2, 4) are exactly the kind of packet-level edit the audit exists to enable.
They belong in the synthesis's “apply these first” list, not in a findings appendix.

**Confidence:** high — each defect is a grep-reproducible fact.

---

## Traceability verdict

| Question | Answer |
|---|---|
| Does every named target have an assertion? | **No** — 51 of 119 scaffold-set DEFINE rows carry a named clause; 29 rows across seven children carry none |
| Do the packet-wide rulings have packet-wide assertions? | **No** — D7/no-cards and D9/44pt and D9/grab-handle are asserted per landed sheet, or nowhere |
| Can a release note's clause reference be resolved? | **Only for `002`** — its L1–L8 are the only ids in the tool; `001`'s L1–L10 and `071`'s clause ids share one id space |
| Are all questions owned? | **No** — 10 of 19 residual questions need an operator ruling and are not on the packet's own open-question lists |
| Are the audit's corrections ready to carry? | **Yes** — 5 corrections and 4 mechanical doc-truth repairs, each with its evidence |

## What was tried and failed this iteration

- **Hypothesis: the children's clause sections can be joined to the lane tool mechanically.** Disproved
  as stated — the tool carries ids for `002` only, so the join key does not exist in the tree; the
  proposal in X-1 creates it rather than assuming it.
- **Hypothesis: the scaffolded children's `Source` column makes D9 traceable.** Disproved —
  `018`/`019` name “Lane clause, new” in their criteria and carry no clause text, so the Source column
  records a composition, not an assertion.

## Open questions raised this iteration

1. Should the traceability `Clause` column (X-1) be enforced by the DEFINE pass — i.e. does a row with
   no clause and no `judge-only` mark fail the child's GATE, or is it reported only?
2. The shared-constraint set (X-2, LC-1…LC-7) binds every child, but children land in order: does
   the first child that lands a shared constraint own its clause, or does the packet's parent hold
   them so no child can close while another regresses them?
3. The question register (X-3) is 19 rows; should the six the packet already lists (`goal.md` §3,
   OC-S1/OC-S2, `005` §12) be merged into it, and does an unanswered operator row block LAUNCH for
   the children it gates (e.g. `020`'s existence gates `003`'s CREATE sequencing)?
