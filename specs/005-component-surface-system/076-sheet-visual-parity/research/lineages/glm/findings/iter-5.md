# Iteration 5 — LOOP LOGIC

**Lineage:** `fanout-glm-1789102713325-fbmgv2` · gap class **5 of 5: LOOP_LOGIC**.
**Read first:** state (6 events) + deltas (22 finding records) — F3.5's stale-continuity, F2.1's closure ladder and F2.3's registration holes are inputs here; the mechanics below are loop-level, not document-level.
**Angle:** the graph loop itself — D6's nodes/edges/guard, the judge rubric, the DONE rule, the live leg brief — against four loops' worth of precedent: 071's lanes-green/operator-red founding failure, §7.14's value-vs-gestalt precedent, and the delegation machinery that actually runs these legs.

---

## Finding 5.1 — The graph's GATE has an entry contract, but nobody wrote it: seven of the packet's documented weaknesses would slip through a technically-valid DEFINE table

**Evidence:** `roadmap.md:1947-1948` — `GATE is the one in-graph human checkpoint — the orchestrator posts the DEFINE table and waits for a `plan-approved` marker — and it is distinct from the operator's own phone read`. The node table (decision-record:201-206) defines GATE's *verdict* but never its *entry test*. Meanwhile the packet's own records show what adefine-technically-passes-but-unactually-ready looks like: 003's DEFINE passes its own pass rule (parent §5: `every row…, every reference is a real path; every number is ours or TBD`) while lacking the D9 Source column (F3.1), the §3.5 judge instance (F2.2), the L-FC pack (F3.3) and, for 016/017, any registered scenario their captures would come from (F2.3); 019's DEFINE *is its delivery* (F1.6) — the graph's PLAN→GATE edge wouldWave it through.

**Finding:** GATE is the one place a human reads before money is spent, and its entry checklist is the cheapest control surface in the packet: oneGate-entry question set catches the F1.6/F2.2/F2.3/F3.1/F3.3 classes *before* CREATE, at the nodeD6 already单dedicates to exactly this. The graph needs no new node — the existing one needs its preconditions written.

**Proposed text** — into `decision-record.md` D6, as **GATE's entry contract** (a new sub-секция after the node table; the orchestrator's checklist, not the planner's):

```md
**GATE entry contract (checked by the orchestrator before posting the DEFINE table).** All eight,
each falsifiable in one read:

1. The DEFINE table exists with its Source column, every cell carrying a named reference **and the
   reason** — `none (internally derived — reason)` where truthfully none (D9; F3.1's 013/018 shape).
2. The plan carries §3.5, the judge's rubric *instance* for this sheet — eight rows, each with this
   sheet's 0/1/2 reading (F2.2; 001/plan.md:182 is the ratified shape).
3. The clause home is fixed: `spec.md` §13.11 enumerates every clause id — measured property, source
   DEFINE row, RED/GREEN slots, vacuity-guard pairing — and the plan §3.3 references it, adds
   nothing (F2.6).
4. The frame-grammar pack L-FC0–4 is placed in §13.11 (F3.3), cited against `surface-shell.ts`
   consts, not fresh numbers (F4.1).
5. Every producer's capture exists: each covered surface's scenario id is registered, or the
   registration task is *in the task list before the first clause runs* (F2.3; 014:40's T003 is the
   precedent 016/017 lost).
6. Shared-primitive duties are cited, not re-derived: the condition row → 003/004 + 053, the listbox
   → 010, status/colour → 018's T001, stacking → 048 (D10, F4.2).
7. ADR-I's status is echoed: the close-glyph Frame target reads 1 while ADR-I is pending (F3.5's
   paste 2) — and the pack's other pending-ADR echoes, if any, are likewise capped.
8. The judge's *judged image* is named: the full-sheet variant, both themes (F2.3b) — or the
   motion-evidence frames for 019 (F1.6's §13).

A DEFINE posted with any of the eight unmet is a GATE input defect: the orchestrator returns it to
PLAN, and the state log records `gate:bounce` with the failing item number — bounce counts are
iteration-count, not guards (see 5.2).
```

**Confidence:** 93% — each item cites an already-landed failure shape; the only judgment is thebounce-vs-iteration accounting, stated.

---

## Finding 5.2 — Stall detection runs on three clocks that never meet, the DEFINE-re-open edge 003 promises is not in the graph, and flapping rows are invisible to both guards

**Evidence:** Three clocks: (a) *iterations* — the D6 guard, `roadmap.md:1948`: `A 4-iteration guard trips ESCALATE if two consecutive JUDGE passes are never reached`, edge `JUDGE | verdict fail, iteration > guard | ESCALATE (guard tripped)` (decision-record:229); (b) *per-row* — `003/tasks.md:93`: `If one rubric row fails three consecutive iterations, stop: the target is wrong, and DEFINE re-opens`; 016's twin, `016/tasks.md:85`: `Three consecutive fails on one row re-opens DEFINE`; (c) *minutes* — the delegation's watchdog, `roadmap.md:1924`: `judged by decoded pixel-delta scripts, same monitoring cadence (every 5 min, 15-min stall relaunch)` — empirically live: `$T/glm/008-002-code.run1.log` **and** `.run2.log` both exist, i.e. the relaunch fired and logged. But D6's edge table has **no** REMEDIATE→DEFINE edge (decision-record:230-231: `REMEDIATE | verdict pass | LAND`; `REMEDIATE | verdict fail/blocked | ESCALATE` — 003's "DEFINE re-opens" happens *outside* the machine), and a row oscillating 1-2-1-2 (never three *consecutive* fails, never two consecutive *passes* on anyTreeView) trips only the child-level 4-guard after burning all four iterations, and none of the three clocks records the oscillation itself.

**Finding:** The guard体系 has the right instincts at three different loops — the graph (iterations), the rubric row (per-row), the delegation (minutes) — and no shared definition of *what counts*. A 15-min relaunch that produces run2 with the same results as run1, and a 4-iteration ESCALATE whose four verdicts all blamed different rows, are the same stall seen from two clocks; today the logs record both and reconcile neither. The DEFINE-re-open is the packet's own designed escape hatch and it is the one edge the state machine forgot to draw.

**Proposed text** — three pastes into D6.

1. The missing edge (into the edge table and the mermaid):

```md
| REMEDIATE | verdict `fail`, all affected rows trace to a DEFINE target (not a producer defect) | DEFINE (re-open) |
| DEFINE (re-open) | revised §13 | GATE (re-entry, contract of this section, item 1-8) |
```
with `JUDGE --> DEFINE: fail, target-wrong (3rd consecutive, same row)` in the diagram, and: *a DEFINE re-open increments that child's re-open count; a second re-open of the same child skips GATE and goes straight to ESCALATE — twice-revised targets are the operator's question, not the planner's.*
```

2. The oscillation clause (into the JUDGE row's pass rule):

```md
A **flap** is the same rubric row scoring below 2 in two of any three consecutive iterations.
Two flaps in one child = ESCALATE evidence, whether or not the 4-iteration guard trips first: an
oscillating row means the reference, the capture, or the judge's reading disagrees with itself, and
that isDEFINE/GATE's question, not REMEDIATE's.
```

3. The clock reconciliation (into the state-log schema):

```md
Every JUDGE/REMEDIATE verdict logs: `iteration` (graph clock), the rubric row-by-row (per-row clock),
and `leg`: {launched, run, relaunched-from, minutes} (delegation clock — the 5-min cadence and
15-min relaunch of the 09-08 ruling, roadmap.md:1924). ESCALATE verdicts name the clock and the
counter that fired; a 15-min relaunch whose run2 findings equal run1's is *itself* a stall signal
(the 008-002 precedent: run1.log + run2.log, identical SHA-quoted outputs), recorded as
`stall:relaunch-unproductive` on the child.
```

**Confidence:** 91% — the missing edge is a line-by-line read of decision-record:218-231 against 003:93/016:85; the run1/run2 pairing is directory evidence (contents read, equality asserted from the filenames' convention — flagged); the flap definition is this proposal's.

---

## Finding 5.3 — 076's founding open question is now answerable — the judge and the operator agreed — and the verdict contract should be amended to *always* record that comparison

**Evidence:** The question, `076/spec.md` §6: `Does the image judge ever disagree with the operator's own read, and if it does, what changes — the rubric, or the reference? Unanswerable until a child has been through both gates`. Both gates have now fired on 001: the judge's first pass, `001/.../acceptance-criteria.md:41` — `First pass scored **11/16** against the 5-card shape (D7, `../decision-record.md`)` — and the operator's 0.0.40 reads, `roadmap.md:448-449` (rows 91/92): `Never use bg container like here for values…` / `Same for settings, which als has bad typigraphy layout ans sizing etc` + `0.40 doesnt feel like the upgrade the graph loop requested`. They **agree**: the 11/16's failures (the 5-card shape, scored 0-on-Frame by the rewritten rubric) are the operator's 0040-*.png complaints, arrived independently. The precedent-class: `roadmap.md:2253-2254` (§7.14) — `057's criteria are Met at the value level and failed at the gestalt level` — the value/gestalt split 076 was founded toclose.

**Finding:** 001's twin readings are the *disconfirmation* of the fear in §6's question: the rubric did notGreen-wash what the operator's eye caught — the 11/16 caught it first, the operator confirmed it independently, and the founding mechanism (judge-not-lane) survived its first contact. What the packet lacks is the *standing record* of that agreement: 076/spec.md §6 still shows the questionOpen, and the D6 verdict schema (JUDGE-<iter>.json) does not require the operator-echo field, so the *next* disagreement — judge-16/16, operator-“no” — would be recorded nowhere in particular and adjudicated by memoir.

**Proposed text** — two pastes.

1. Into `076/spec.md` §6, answering the third open question (dated, per §7.15's additive convention):

```md
- **Answered 2026-09-11 (provisional, n=1):** on 001 the judge and the operator agreed — the
  11/16 first pass (AC-004: the 5-card shape, 0 on Frame) and the operator's 0.0.40 rows 91/92
  (`roadmap.md:448-449`) name the same defects, independently. Until a genuine 16/16-vs-operator
  disagreement occurs: the rubric stands; a disagreement, when it happens, is adjudicated by the
  governing rule — if the operator's words name the *element*, the reference moves (D9 composition);
  if they contradict the *scoring* while the reference stands, the rubric row's 0/1/2 anchors are
  what move, via a §7 Proposed-ADR, never silently.
```

2. Into the D6 verdict schema, `JUDGE-<iter>.json`:

```json
"operatorEcho": {
  "rulingRefs": ["roadmap.md:448", "roadmap.md:449"],
  "agreement": "confirm|diverge|none-yet",
  "note": "one line; diverge = which side moved and by which rule"
}
```

plus the judge-model line the delegation ladder leaves implicit: *the judge is the D6:203 Sonnet reader; the 09-09 implementation fallback ladder (Luna→GLM, roadmap.md:1934-1935) nevershif the judge — a judge fallback is its own ESCALATE verdict, because 001's calibration (this finding) is Sonnet-keyed.*

**Confidence:** 90% — the agreement reading rests on comparing 001's AC-004 narrative to rows 91/92's complaint list (strong but interpretive — the operator's words are screenshots-plus-verbatim, the judge's 11/16 is a scored table); the schema extension is additive and the n=1 hedge is stated in the paste.

---

## Finding 5.4 — The DONE rule already means two things and the packet means a third; the 19 operator rows need the roadmap's own deferral machinery, not silence

**Evidence:** Three "dones": in-graph, `decision-record:205` — `DONE | … Two consecutive `JUDGE` verdicts of `pass` on an unchanged tree | … `pass` — the operator's own phone screenshot remains the gate outside this graph (D1, D5)`; release, `decision-record:33` — `A release is cut only after a child's judge passes twice on an unchanged tree, never on a CREATE or single JUDGE verdict (D8)`; programme, `076/goal.md:116` — `below only tick when the operator has *also* independently confirmed each sheet on their own device`. And the roadmap's standing precedent for exactly this posture, §4A'sdeferral machinery (roadmap:650+; rows 29-36's twelve, re-asked after the next iCloud build) plus the three-state doctrine (roadmap:151: `## 3. THREE STATES, NOT ONE`).

**Finding:** 001/002's map rows read `planned — DEFINE + PLAN complete, CREATE not started` and 012's reads `In progress — … the judge (twice, unchanged tree) and the operator's read remain` — but the moment 001's judge passes twice, its map row says *complete* while goal.md:116 says *not yet*: the same child, two truths, the exact §7.6 disease (`roadmap.md:2050` — `Eight phases say "not started" after shipping`) in miniature. The vocabulary to prevent it exists one directory up (three states: shipped / verified / operator-confirmed — the D3-adjacent doctrine this whole programme runs on) and 076's own goal.md already wrote the *rule* (`:116`) without the *vocabulary*.

**Proposed text** — into the parent `spec.md`'s Phase Documentation Map (the Status column's legend, above the 19 rows):

```md
> **Status vocabulary (three states, per `../../roadmap.md` §3 and this packet's `goal.md` note):**
> `planned` / `in progress` are execution states; `shipped+verified` = the in-graph DONE (judge
> twice, unchanged tree, both hashes recorded) and D8's release criteria; `operator-confirmed` =
> the twentieth criterium no agent ticks (AC-008-class). Rows move planned → … → shipped+verified
> → operator-confirmed, and *never* read `complete` before the third state; an
> shipped+verified-but-unconfirmed child carries the §4A deferral convention — *re-asked after the
> next iCloud build* — recorded in `goal.md`'s progress table, which is where the operator's 19
> device rows live, not here.
```

and into D6's DONE row, the disagreement leg (F5.3's adjudication, made operational):

```md
| DONE+ (post-DONE) | the operator's device read, whenever it arrives | confirm → the map row moves to `operator-confirmed`; diverge → a REMEDIATE verdict `operator-diverge` re-enters the graph at JUDGE (3rd pass), with F5.3's adjudication rule recorded in `verification.md` |
```

**Confidence:** 89% — the three-dones and the goal.md:116 rule are quotes; the 19-row/deferral mapping is this proposal (the §4A mechanism is the roadmap's own, extended one packet down); the DONE+ edge is newgraph surface, flagged as such for the operator's GATE.

---

## Finding 5.5 — The leg brief is the loop's real execution contract and it lives outside the graph: its disciplines (≤12 reads, 10-call first write, per-step handover, the jitter rule) are the §7.4b remedy, and LAND's postconditions are unwritten

**Evidence:** The live brief, `$T/glm/008-001-audit.prompt` (a 09-08-class numbered brief, contract-verbatim): `GATE 3 IS PRE-RESOLVED. DO NOT ASK…(AI_SESSION_CHILD=1); never spawn a sub-agent; every command foreground…Keep `<worktree>/.handover.md` from your first action and append after every numbered step (it is gitignored: NEVER `git add` it…)`. `WRITE EARLY: your first file write must happen within your first 10 tool calls; do not read more than 12 files before producing the first artefact.` — plus its VERIFY block (the gate once, `26 green, 0 red`), the pixel rule (`jitter only if max channel delta ≤ 12 and moved in one run only → `git checkout -- <png``), the lane triplet (`css-lane acquire/edit/release, baselineHash = first 12 hex of sha256 of styles.css`), the report contract (`Final report: HEAD SHA, each criterion with the number that proves it, every exit code, anything left open`). Meanwhile D6's logs are verdict-shaped only (`LAUNCH has no verdict file; it is a state-log event`, decision-record:210), and §7.4b's trap — `roadmap.md:2018`: `### 7.4b "No lane activity" is not evidence of no work` — is the *reason* those disciplines exist. And LAND's duties: F3.5 showed 001's continuity fields never learned its CREATE happened; the roadmap's row-85 pattern (`state LANDED, AWAITING DEVICE`) shows what the *row* needs.

**Finding:** D6 governs the graph; the brief governs the leg; the two documents disagree on nothing but *share no reference* — D6's state log never records the brief's disciplines, and the brief's `.handover.md` (per-step, worktree-local, gitignored) is invisible to the next session's state reconstruction, which is precisely where §7.4b's no-activityReading comes from. The packet's own 001/002 continuity staleness (F3.5) is the LAND-shaped version: a verdict fired, nothing downstream learned.

**Proposed text** — two pastes into D6.

1. **The leg brief, by reference** (a new sub-section, „The brief"):

```md
Every non-interactive leg runs on a numbered brief whose invariants are part of this graph, not
adventitious style (the 09-08 delegation ruling, roadmap.md:1922-1925, and the live
`scratchpad/glm/*.prompt` contract):
- pre-resolved gates (`AI_SESSION_CHILD=1`), no sub-agents, everything foreground;
- WRITE EARLY: first artefact within 10 tool calls; ≤12 files read before it;
- `<worktree>/.handover.md` appended after every numbered step (gitignored, never staged);
- VERIFY: the named gates once, exit codes read, the pixel-delta jitter rule (≤12, one-run movement,
  else `git checkout -- <png>` + manifest restored), the css-lane triplet with
  `baselineHash = first 12 hex of sha256 of styles.css`;
- the final report: HEAD SHA, per-criterion proof numbers, every exit code, the open list.

The state log references the brief's file path per leg; a leg whose brief cannot be named did not
run under this graph.
```

2. **LAND's postconditions** (the answer to F3.5's counterexample, written as the node's contract):

```md
**LAND's verdict-writer, before the `pass`:** (a) refresh the child's `_memory.continuity` —
`recent_action` ≤ 96 chars naming what landed, `next_safe_action`, `completion_pct`, the
D7/D9-amended `answered_questions` — the 001 counterexample (`spec.md:12-41` claiming
DEFINE+PLAN-at-T001 after a scored, superseded judge pass) is the regression test; (b) set the
roadmap §4 row's state cell to the §4A grammar (`LANDED, AWAITING DEVICE` / `FIXED, AWAITING
DEVICE`); (c) append the goal.md progress row. A LAND that passes without (a)-(c) is a `pass` the
next session cannot reconstruct — that is §7.4b's trap, wearing averdict.
```

**Confidence:** 92% — the brief's disciplines are quoted verbatim from the live artifact; the 001-as-regression-test framing is F3.5's finding, re-anchored; (a)'s 96-char rule is the roadmap's own convention (row 87's wording: `recent_action` ≤ 96 characters), adopted.

---

## Also read, no finding (negative knowledge)

- The driver artifacts (`$T/loop/001-settings-sheet-visual-parity.driver.sh` + `.driver.log` + `.jsonl`, and 002/003- siblings): the per-child driver+state-log pairs D6 specified *exist as files* — the graph is running, not drafted; this iteration's proposals therefore amend, not invent, the logging the driver already does. (Their contents were not read — the *shape* evidence sufficed, and the loop's mid-flight files belong to the running session, not to this lineage's read.)
- `decision-record:210` — `LAUNCH has no verdict file; it is a state-log event` — the schema's honesty about its ownlimits; F5.2's clock reconciliation extends exactly this event, not a new one.
- 076/goal.md:18 — `Rungs 1 and 2 of D3's reference precedence are empty; every child works structurally from a 299x678 thumbnail` — still true at goal-write time; F3.4's D3×D9 amendment is the standingFrame for when the captures arrive, already recorded there; no loop consequence.

**newInfoRatio: 0.65** — justification: the GATE-entry contract, the missing DEFINE-re-open edge, the flap definition, the answered founding question (with the 001/rows-91/92 agreement as its evidence), the three-dones reconciliation and the brief's imEnglish are all absent from D6 and from iterations 1–4's records; the delegation-clock evidence (run1/run2, the prompt contract) is first-appearance.

**Sources (10):** 076/decision-record.md:184-251; 076/spec.md §6; 076/goal.md:113-116; 076/003/tasks.md:93; 076/016/tasks.md:85; roadmap.md:1922-1948 (§6A), 2018 (§7.4b), 2253-2254 (§7.14); $T/glm/008-001-audit.prompt + 008-002-code.run{1,2}.log; $T/loop/001-*.driver.{sh,log}+jsonl; 001/acceptance-criteria.md:41.
