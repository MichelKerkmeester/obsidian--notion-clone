# Iteration 5 — LOOP LOGIC

**Gap class:** LOOP LOGIC — the D6 graph, the drivers, the judge rubric, the guard, DONE, release
gating, parallelism under the cap, and what gets logged. Findings are grounded in the two children
that have actually run the loop (`001`, `002`), because the graph's first two executions have already
produced more evidence than its specification does.

---

## L-1 · "Two consecutive passes on an unchanged tree" has no definition, and one child has already changed the tree under another

**Evidence.**

- D6's DONE row: *"Two consecutive `JUDGE` verdicts of `pass` **on an unchanged tree**"*; D1 repeats it;
  `goal.md` §3 repeats it per child; each child's Phase F repeats it (*"The child is not done until the
  judge passes twice in a row on an unchanged tree"*).
- The verdict-file schema carries exactly one identity field: `{"status", "sha", "score", "zeros",
  "note"}` — HEAD's short sha, nothing else.
- The capture harness already computes a richer identity and stores it in `screenshots/manifest.json`:
  per entry, `layoutHash`, `pixelHash`, and `sourceHashes: {"src/views/toolbar-renderer.ts":
  "2d7ddbc5c708", "styles.css": "195782fd8370"}`.
- The tree has already changed under a child: `002`'s landing note reads *"the dark theme's
  `--obnotion-settings-card-fill` declares its own 85% step … which lands `076/001`'s Proposed ADR-K
  re-tune on that packet's behalf, its verdict rows inheriting 57→64"*, and `001`'s own status line
  reads *"the judge's re-score — two consecutive passes on this unchanged tree — is the child's
  remaining gate"*. The tree `001` was judged on is not the tree its re-score will be judged on.
- `002`'s judgement also crossed two landings mid-flight: *"the landing itself then crossed `076/001`'s
  own landing (`60e68480`) and re-verified the composed tree … the landing then crossed 0.0.40
  (`25390149`) and the `076` capture-harness leg (`5c57f594`)"*.

**Finding.** The DONE predicate is the loop's terminal condition and it is specified as a phrase. Two
consequences are already observable: (a) a child can satisfy the letter of "two consecutive passes" by
being re-scored on a tree another child has since edited — including, in `001`'s case, a *colour token
that changed the very card fill the judge scored*; (b) nothing in the loop can detect the failure,
because the only identity a verdict carries is a sha that LAND rewrites by rebasing. `002`'s recorded
history is a rebase onto `5662ec30` with a merged stylesheet hash `887e9e3b3449` — the pre-rebase sha in
its iteration-1 row (`4ab094cf`) identifies a tree that no longer exists in the repository.

**Proposed text** — an amendment inside D6, immediately after the node table:

```markdown
### The unchanged-tree predicate (D1, D6, D8)

"An unchanged tree" means: **the judged capture set and every source that paints it are byte-identical
between the two passes.** It is verified, not asserted, from three artefacts that already exist:

1. `screenshots/manifest.json`'s per-entry `pixelHash` — for both the light and the dark judged capture;
2. the same entry's `sourceHashes` — at minimum `styles.css` and the child's own producer file(s);
3. the post-LAND `HEAD` sha of the tree the capture was taken on.

A JUDGE verdict file carries all three:

```json
{"status": "pass", "sha": "<post-LAND HEAD, short>",
 "captures": {"light": "<path>", "dark": "<path>"},
 "pixelHash": {"light": "<hash>", "dark": "<hash>"},
 "sourceHashes": {"styles.css": "<hash>", "<producer>": "<hash>"},
 "score": 14, "zeros": 0, "rubric": {"frame": 2, "sections": 2, "rowAnatomy": 2, "controls": 2, "type": 2, "spacing": 2, "colour": 1, "bothThemes": 1},
 "note": "<one line>"}
```

**The second pass is a pass only if all three fields match the first pass's.** If another child lands
a shared-token or stylesheet change between the passes, the first pass is **void** — the counter resets
to zero and the child re-judges. `002`'s 85% `--obnotion-settings-card-fill` change (2026-09-11) is the
worked case: it altered a token `001`'s own judged picture reads, so `001`'s carrying pass cannot
count.
```

**Confidence:** high — the predicate is quoted, the arbiter (manifest hashes) exists and is already
populated, and the counter-example is recorded in the packet's own prose.

---

## L-2 · The 4-iteration guard is below the observed cost of a single child, and it counts the wrong thing

**Evidence.**

- D6's guard: *"`loop-driver.sh`'s second argument is `max_iters` (default 4). If the iteration counter
  exceeds it without two consecutive JUDGE passes, the driver emits `ESCALATE`."*
- `002`'s recorded iteration table: iteration 1 JUDGE = **11/16, 1 zero, fail**; iteration 2 =
  *"remediate leg"*, judge re-score *"owed"*. Both children's first pass was 11/16 — `001`'s row reads
  `1 1 1 1 1 2 2 2 = 11` (Frame, Sections, Row anatomy, Controls and Type all 1).
- The remediation cost is structural, not incidental: `001`'s remediation block is **five tasks**
  (T015–T019) and `002`'s is a table of *"the three rows the judge scored below 2"* each with a clause,
  a producer change and a re-read.
- A reachable pass after one remediation requires: iteration 1 JUDGE(fail) → REMEDIATE → LAND →
  JUDGE(1st pass) → JUDGE(2nd pass) = **3 JUDGE passes across 3 iterations**; the guard of 4 allows one
  further JUDGE. A child that needs two remediations — the plausible case for any child whose first
  pass scores 11/16 with four rows at 1 — reaches DONE at iteration 4 exactly, with no margin for a
  voided pass (L-1) or a harness defect (L-4).
- The guard is stated as a *counter* of iterations, but the driver's own loop frequency is driven by
  REMEDIATE, which is a node that may or may not open. Two children failing for different reasons
  therefore consume the same budget.

**Finding.** The guard was set at 4 before either child ran. Two children have now run: both scored
11/16 on the first pass, both needed a remediation block larger than one iteration's worth of work, and
one has already voided its own counter by crossing another child's landing. A guard that escalates on
iteration count rather than on *evidence of progress* will escalate `001` and `002` while they are
doing exactly what the loop instructs.

**Proposed text** — replace D6's guard paragraph with:

```markdown
### The guard: progress, not iterations

`max_iters` (default **6**) bounds the child's own iteration counter, but escalation is driven by
**evidence of progress**, not by the counter alone. A JUDGE failure opens REMEDIATE; REMEDIATE's
verdict must name, for each rubric row it addressed, the clause that went RED and the clause that went
GREEN with both numbers. **A REMEDIATE verdict that does not move a single rubric row's justification
is a stall** and escalates immediately, whatever the counter reads.

Escalation carries a machine-readable payload, because "blocked" is not actionable:

```json
{"status": "blocked", "sha": "<sha>", "score": <n>, "zeros": <n>,
 "stall": {"kind": "no-row-moved" | "repeat-row" | "no-capture" | "voided-pass", "row": "<rubric row or null>", "iterations": <n>},
 "evidence": ["verification.md#iteration-<n>", "verification.md#iteration-<m>"],
 "needs": "<the decision the operator must make>"}
```

**`no-capture` is its own stall kind.** A child whose judged capture does not exist cannot reach DONE
however many iterations it burns; `013`–`019`'s judged captures are unregistered today (iteration 2,
D-2), and the driver should say so on iteration 1 rather than on iteration 6.
```

**Confidence:** high for the arithmetic and the observed scores; the default of 6 is a judgement whose
correct value is the packet owner's call.

---

## L-3 · The rubric's ceiling is not 16 for every child, and the packet has no mechanism for a deliberately-held row

**Evidence.**

- `001`'s own plan states the problem: *"ADR-I — the shared `buildShellHeader`'s `✕` against the
  reference's `Done` — is why the plan targets the rubric's *Frame* row at **1** and predicts **15/16**
  rather than 16"* (roadmap §5.A, `076` row).
- The JUDGE pass confirms it: *"Frame (1) … But the trailing control is still `✕` where both
  bottom-sheet references show `Done` (R-4) or `‹` (R-5), never a `✕` — the known ADR-I gap, **not
  closed by this iteration**"* (`001/verification.md`).
- ADR-I is the operator's own call (`decision-record.md` D9: *"an input to ADR-I, which stays the
  operator's own call"*).
- D1's pass rule: *"≥ 14/16 with no row at 0"* — an absolute floor with no declared-deviation clause.
- The rubric's Frame row's "0" is defined as *"Different surface shape, **or any row or value sits
  inside a rounded/lighter card container**"* — so the row that ADR-I holds can also be zeroed by an
  unrelated D7 failure, and the two are scored in one number.

**Finding.** A child carrying an open, operator-held ADR cannot reach 16, so its pass must be assembled
entirely from 2s elsewhere: one further 1 anywhere in an 8-row rubric and the total is 13 — a fail. In
`001`'s actual first pass, five rows scored 1. The packet therefore treats an *unresolvable-by-the-
child* deviation exactly like an implementation defect, which is the mechanism by which a child
remediates a row that is deliberately held: the loop has no way to say "this 1 is a decision, not a
defect", and D1's floor is absolute.

**Proposed text** — add to D1 after the pass rule, and to each child's `verification.md` §2:

```markdown
**Declared deviations.** A rubric row may be marked a **declared deviation** when, and only when, the
child's `spec.md` names a Proposed or resolved ADR that holds the difference and quotes it. The
deviation is recorded in `verification.md`'s iteration table as `1*` with the ADR reference in the
findings column, and it does not count against DONE — but it does count against the total:

- A declared deviation is capped at **1**; it can never be scored 2, and it can never be scored 0
  (a 0 means something else broke, which is a defect whatever the ADR says).
- The pass floor stays **14/16**, and the deviation's cap is subtracted from the achievable maximum:
  with one declared row a child must reach 14 of a possible 15.

`001`'s ADR-I (`✕` vs `Done`) is the first declared deviation: Frame scores 1 by the reference and 0
on any D7 container violation, and the two must be **reported separately** — the iteration table gains
a `Frame (D7)` sub-cell beside `Frame (composed)` so a container regression cannot hide behind a held
ADR.
```

**Confidence:** high for the gap (both the plan's prediction and the judge's reasoning are quoted);
medium for the `1*` mechanism, which the packet owner may prefer to handle by splitting the Frame row
instead.

---

## L-4 · Two competing cures for a cropped capture, and the surviving one shrinks the fixture to fit the camera

**Evidence.**

- D2's note: *"the capture harness now emits a **full-sheet variant** … and each child's capture set
  names that variant as the image the judge scores. D2(b) is unchanged: the variant photographs the
  same production mount, only uncropped."*
- `002`'s remediation for its `Sections 1` row did the opposite: *"**Sections 1** — the judged captures
  end mid-list; the hidden-section card, its bulk link and the add-property card sit past the judged
  fold | judged-frame clause: the sheet measures 1064.8px against the 874px judged viewport … | **the
  judged fixture: sixteen rows became ten** (nine shown, one hidden) | judged-frame clause: sheet
  786.6px, deepest section 676.8px, add-property row 776.8px into the sheet — all inside 874"*.
- `002`'s iteration rows still name the **viewport** captures as the judged image:
  `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` (iteration 1) — while
  `constructed-column-manager-sheet-mobile-light.png` exists in the corpus (`capture: "sheet"`).
- The same 002 landing note also records a second, compatible fix arriving from the harness leg:
  *"the landing then crossed 0.0.40 (`25390149`) and the `076` capture-harness leg (`5c57f594`: the
  judged phone sheets gained the full-sheet variant, the 874px viewport's clipping fixed at the capture
  source)"*.

**Finding.** The packet now has two mechanisms for the same defect and no rule choosing between them,
and the one `002` used is the one with a cost to the evidence: the judged fixture was cut from sixteen
columns to ten so the picture would fit, which means the judged surface is no longer the data shape the
sheet actually renders. A judge can no longer see the ten-row/16-row behaviour the sheet was built for,
and the "Sections" score became a function of the fixture rather than of the sheet. The full-sheet
variant was built for exactly this and is named by D2, but it is not cited in `002`'s iteration table
as the judged image.

**Proposed text** — a rule in D2 and a task in every child's SCREENSHOT phase:

```markdown
**The judged image is the full-sheet variant, always — and a fixture is never resized to fit the
camera.** If a judged capture cuts the surface, the cures are, in order: (1) score the
`<scenario>-sheet-mobile-<theme>` variant, which photographs the production mount uncropped; (2) if no
variant exists, **register it** and re-capture; (3) only if the surface is not a sheet at all (a board
column, an inline popover), name the reason in `verification.md` and state which part of the surface
the capture cannot see. **Reducing a scenario's data so that its sheet fits an 874px viewport is
forbidden** — it changes the evidence to fit the camera and makes the judge's Sections and Spacing
scores properties of the fixture rather than of the product. `002`'s ten-of-sixteen judged fixture is
the worked case of this prohibition and should be reverted to the full column set for its re-score.
```

```markdown
- [ ] **T0xx** Open the child's named judged capture **before** anything else in this phase and record,
      in `verification.md`, the capture's own dimensions and whether the surface it shows is complete
      (top edge to bottom edge, first row to last row, both themes). A capture that cuts the surface is
      a SCREENSHOT failure, not a rubric score, and it is fixed here rather than in REMEDIATE
      (`screenshots/notion-clone/**`, `verification.md`)
```

**Confidence:** high — the prohibition's worked case is quoted from the child's own remediation table;
the ordering of cures follows D2's own text.

---

## L-5 · GATE has no verdict contract: the human checkpoint is a marker file with no author, time or content

**Evidence.**

- D6's GATE row: *"Input: The DEFINE table, posted to the operator by the orchestrator … Verdict:
  `waiting` until the marker exists, then `pass`"*, and the edge table: *"GATE | `plan-approved` marker
  absent | GATE (polls every 60s)"*.
- `plan.md` §6A: *"Only once the orchestrator drops `$S/loop/<child>/plan-approved` does the driver's
  GATE node resolve to `pass` and CREATE begin. A child sitting at `GATE:waiting` is not stalled — it
  is waiting on that reply."*
- Every other node in the graph writes a verdict file; GATE writes a **marker**, which carries no
  timestamp, no author, no reference to which plan revision was approved, and no record of what the
  operator changed before approving.
- The plan revision matters: `002`'s own DEFINE *"corrected the scaffold's own draft twice rather than
  carrying it forward"*, and `001`'s DEFINE settled a card vocabulary that *"is not the one the parent
  spec assumed"* (roadmap §5.A).

**Finding.** GATE is the only node whose output cannot be audited, and it is the node that authorises
the expensive half of the loop. If a DEFINE table is corrected *after* approval — which `001` and `002`
both did mid-DEFINE — nothing in the graph can say whether CREATE ran against the approved target or a
later one. D8 adds weight: a release is cut only after DONE, and DONE's evidence chain runs back
through CREATE, whose authorisation is a file with no content.

**Proposed text** — replace D6's GATE verdict with a file, and add the batching rule:

```markdown
| **GATE** | The operator (human) | The DEFINE table, posted to the operator by the orchestrator, **together with the table's own content hash and the plan revision it belongs to** | `$S/loop/<child>/GATE-<iter>.json` | `waiting` until the file exists, then `pass` |
```

```json
{"status": "pass" | "reject" | "amend", "sha": "<the tree the DEFINE was read on, short>",
 "planHash": "<sha256 of spec.md §13 + plan.md §3 as posted>",
 "operator": "<who approved>", "at": "<ISO 8601>",
 "amendments": ["<one line per correction the operator asked for, verbatim where possible>"],
 "note": "<one line>"}
```

```markdown
**Batching and the waiting log.** Nineteen children each block at GATE. The orchestrator posts at most
**one DEFINE table per child per message**, and records every post and every reply in the parent log
(`$S/loop/076.jsonl`) so the operator's queue is visible: `{"ts": "<ISO>", "child": "<c>", "event":
"GATE-POSTED" | "GATE-ANSWERED", "note": "<plan hash or the operator's amendment count>"}`. A child at
GATE for more than one unattended day remains `waiting` and is **not** escalated — the gate is a person,
not a stall — but the parent log's age column is what the orchestrator reads to decide which child to
post next.
```

**Confidence:** high — the marker's absence of content is quoted from both D6 and §6A; the batching
addition is a process recommendation.

---

## L-6 · Two schemas, two enums, and a DONE state that exists only as a log line

**Evidence.**

- D6's verdict-file schema: `{"status": "pass" | "fail" | "blocked", "sha": "<HEAD short sha or
  empty>", "score": "<0-16 or null>", "zeros": "<n or null>", "note": "<one line>"}` — `score` and
  `zeros` are quoted as strings.
- D6's state-record schema: `{"ts", "node", "iter", "status": "<pass|fail|blocked|started|waiting|ok>",
  "sha", "score", "zeros", "note"}` — a **six**-value enum where the verdict file has three. So the
  same `status` field means different things in the two files, and the parser must know which file it
  is reading.
- DONE's row: *"none (driver, on two consecutive JUDGE passes)"*, verdict `pass` — no verdict file,
  only a state-log line.
- `plan.md` §6A makes D8's release gate read that line: *"confirm that child's own
  `$S/loop/<child>.jsonl` shows a `DONE` event (two consecutive `pass` JUDGE verdicts on an unchanged
  tree), not merely a `LAND:pass`"*.
- D6's edge table never says what DONE's *inputs* are, only the condition, so the release gate has to
  re-derive "two consecutive passes on an unchanged tree" from a log with no capture identity (L-1).

**Finding.** The release gate — the rule D8 exists to enforce after 0.0.40 shipped at 11/16 — reduces
to string-matching a log line whose own definition is a derived condition the log does not record. A
`DONE` line can be written by a driver that counted two `pass` statuses without comparing any capture.
And the two enums' divergence means any tool that reads both files with one schema will mis-classify
`started`/`waiting`/`ok` events as node verdicts.

**Proposed text** — split the enums explicitly and give DONE its own file:

```markdown
**Two schemas, two enums, named.** The verdict file's `status` is the **node outcome**
(`pass` | `fail` | `blocked`); the state log's `status` is the **transition**
(`started` | `waiting` | `ok` | `pass` | `fail` | `blocked`). A node transition of `pass` implies a
verdict file of `pass` with the same `sha`; the reverse is not required (START, LAUNCH and DONE have no
verdict file).
```

```json
{"status": "pass", "sha": "<post-LAND HEAD>",
 "passes": [{"iter": <n>, "verdict": "$S/loop/<child>/JUDGE-<n>.json"},
            {"iter": <m>, "verdict": "$S/loop/<child>/JUDGE-<m>.json"}],
 "fingerprints": {"light": "<pixelHash>", "dark": "<pixelHash>", "styles.css": "<hash>", "<producer>": "<hash>"},
 "note": "<one line>"}
```

```markdown
`$S/loop/<child>/DONE-<iter>.json` is the file the release gate reads. It is valid only if the two
`JUDGE-<n>.json` files it names exist and their `pixelHash`/`sourceHashes` fields match each other —
the release gate compares **files**, never log lines. `plan.md` §6A's wording changes accordingly:
"confirm the child's `DONE-<iter>.json` exists and its two referenced verdict files carry matching
fingerprints."
```

**Confidence:** high — both schemas are quoted verbatim from D6 and the divergence is mechanical.

---

## L-7 · The concurrency cap is a count, but the contended resource is one file

**Evidence.**

- D6: *"The outer loop runs at most 2 children at once … inside a child, every node that dispatches an
  agent waits for a free slot under a shared cap of 4 concurrent agents."*
- D4's reason for sequencing: *"the children share `styles.css` — which this repository serialises
  through a css-lane acquire/edit/release triplet, one holder at a time — and they share the row
  vocabulary `001` establishes."*
- `roadmap.md` §11: *"**Exactly one phase holds the file at a time.** A phase releases the lane only
  after a full recapture **and a human looking at the changed PNGs**."*
- Every child in the map has a `styles.css` change in its Files to Change (`spec.md` §4's table:
  *"`styles.css` | Modify | Section, card, row and control tokens — one css-lane triplet per child"*).
- `002`'s landing crossed `001`'s landing and had to re-verify: *"the landing itself then crossed
  `076/001`'s own landing (`60e68480`) and re-verified the composed tree: stylesheet
  `195782fd8370` (001's `3a2f5143dd74` + this leg's 85% hunk …)"*.

**Finding.** The cap of 2 answers "how many children may run", not "how many may write". Since every
child needs the same single-writer file and the lane must be released only after a human has looked at
the changed PNGs, two concurrent children cannot both be in CREATE; the second is queued at the lane
regardless. The observable effect is that concurrency 2 buys parallel PLAN and JUDGE while making the
cross-landing collision more likely — which is exactly the collision `002` recorded. Meanwhile the
inner cap of 4 agents is far above the number of nodes that can run at once in one child (the graph is
sequential by construction), so it never binds.

**Proposed text** — replace D6's concurrency paragraph:

```markdown
### Concurrency is per resource, not per child

Three resources are contended and each has its own width:

| Resource | Width | Rule |
|---|---|---|
| `styles.css` (the css lane) | **1** | One holder, released only after a recapture and a human look (roadmap §11). A child waiting on the lane is `waiting`, logged, not stalled |
| The capture harness (`npm run screenshots`) | **1** | Two concurrent capture runs produce two different `pixelHash` sets; serialise them, and never take a judged capture while another run is in flight |
| Judge agents | **2** | A judge is a fresh model reading two images; two may run at once, never against the same child |

The outer walk may launch at most **2 children**, but a child may hold the css lane only while no other
child holds it, so the effective CREATE concurrency is 1 by construction. `002`'s landing crossed
`001`'s and re-verified a composed stylesheet; with this table, `002` would have waited for the lane and
the crossing would not have occurred. The inner cap of 4 agents is removed: the inner graph is
sequential (START → PLAN → GATE → CREATE → LAND → JUDGE → REMEDIATE), so the only concurrent inner nodes
are the judge and a capture run, and both are in the table above.
```

**Confidence:** high for the resource widths (roadmap §11 and the capture harness's hash determinism);
medium for removing the inner cap, which exists in the shipped driver and may have an operational reason
not recorded in D6.

---

## L-8 · The judge's own calibration is never recorded, so the operator's read is compared against nothing

**Evidence.**

- D1: *"Gate (c) is the operator's own read on their own phone, and **no agent ticks that row**."*
- The packet's open question, unchanged since the scaffold: *"Does the image judge ever disagree with
  the operator's own read, and if it does, what changes — the rubric, or the reference?"*
- Two self-scorings already exist beside the judge's: `002`'s table records a *"CREATE self-score (not
  the JUDGE pass)"* of **13/16** against the JUDGE's **11/16**, with `Sections` self-scored 2 and judge
  scored 1, and `Colour` self-scored 1 against the judge's **0**.
- The operator's reads exist as raw facts elsewhere: `roadmap.md` §4 rows 91–92 record the operator
  rejecting the shipped card shape at 0.0.40 minutes after `001`'s CREATE landed, and `002`'s own judge
  failure named the same defects the operator photographed.
- Nothing in the packet records a triple of (judge score, self-score, operator verdict) anywhere.

**Finding.** The loop's closing gate is a human read that arrives slowly, and its fast gate is a model
score whose calibration is unknown. `002`'s own numbers show a 2-point optimism gap between the
creator's read and the judge's on the same images — that gap is the only calibration signal in the
packet and it is recorded as an informal table row. Without an accumulated triple, the packet cannot
answer its own open question, and every future rubric or threshold change is made blind.

**Proposed text** — a packet-level file, `076/judge-calibration.md`, plus a task in every child's
VERIFY phase:

```markdown
# Judge calibration — the judge, the creator and the operator on the same picture

One row per judged iteration of every child. Three readers, one image set. The point of the table is
the **delta**, not the scores: it is the only evidence the packet has for whether the rubric measures
what the operator sees.

| Child | Iter | Judge | Creator self-score | Operator verdict | Largest row disagreement | What the delta implies |
|---|---|---|---|---|---|---|
| `001` | 1 | 11/16 (Frame 1, Sections 1, Row anatomy 1, Controls 1, Type 1) | not recorded | *"Same for settings, which als has bad typigraphy layout ans sizing etc"* (`roadmap.md` §4 row 92) + the frame ruling | judge and operator **agree** on typography and frame; judge invented no defect and missed none | rubric calibrated on this surface |
| `002` | 1 | 11/16, 1 zero (Colour) | 13/16 | *"Never use bg container like here for values"* (row 91) | **Colour**: creator 1, judge 0. **Sections**: creator 2, judge 1 | the creator's read is optimistic by ~2 points on a surface whose grouping is wrong; the judge is closer to the operator than the creator is |
| `002` | 2 | re-score owed | — | — | — | — |

**Standing rule.** If the operator fails a child whose judge passed twice, the delta is recorded here
and the packet answers D1's open question in the same commit: either the rubric gains a row (when the
operator named something no row covers) or the reference changes (when the operator's phone shows
something the reference does not). A second occurrence of the same delta is a rubric defect, not a
child defect.
```

**Confidence:** high for the gap (the triple exists nowhere and the packet admits the question is
open); medium for the inference column, which is my reading of two data points and is marked as such.

---

## Loop-logic verdict

| Question | Answer today |
|---|---|
| Is DONE's predicate executable? | **No** — "unchanged tree" is a phrase; the verdict schema has one identity field (L-1) |
| Is the guard sized for the observed cost? | **No** — default 4 against two children that both needed a 5-task remediation after an 11/16 first pass (L-2) |
| Can a child with a held ADR reach the floor? | Only with zero slack — the floor is absolute and the rubric has no declared-deviation mechanism (L-3) |
| Is the judged image unambiguous? | **No** — two competing cures, and `002` used the one that resizes the fixture to fit the camera (L-4) |
| Is the human gate auditable? | **No** — a marker file with no author, timestamp or plan revision (L-5) |
| Does the release gate read evidence? | **No** — it string-matches a `DONE` log line derived from an undefined predicate (L-6) |
| Does the concurrency cap match the contended resource? | **No** — one child can hold `styles.css` at a time, so the cap of 2 buys collisions (L-7) |
| Is the judge calibrated against the operator? | **No** — no triple is recorded anywhere, though two exist in fragments (L-8) |
| **Change list** | D6: unchanged-tree predicate + verdict-file fields; guard → progress-driven with a stall payload; GATE verdict file + batching log; verdict/state enums split + `DONE-<iter>.json`; concurrency table. D1: declared deviations + `1*` scoring. D2: the judged image is the full-sheet variant; fixture-resizing forbidden. D8: the release gate compares files. `plan.md` §6A: the DONE read changes from a log line to a file. New: `076/judge-calibration.md`. |

## What was tried and failed this iteration

- **Hypothesis: `loop-driver.sh` / `program-loop.sh` exist somewhere and can be reviewed for these
  defects at the code level.** Confirmed absent again (worktree and main checkout), and D6 places them
  in `$S`, so all findings here are against the **specification**, which D6 claims is authoritative
  (*"a later agent reads this table, not the shell scripts, to know what runs next"*). Recorded so no
  later iteration searches for the scripts again.
- **Hypothesis: the 4-iteration guard tripped on `001`/`002` already.** Disproved — `001` is at
  iteration 1 (CREATE landed, awaiting the first JUDGE re-score after its remediation) and `002` is at
  iteration 2 with a re-score owed. The guard is *about to* bind, not already tripped; L-2's arithmetic
  is a projection and is labelled as one.
- **Hypothesis: the `2 concurrent children` cap caused `002`'s cross-landing.** Not proven — the
  crossing is recorded (`002`'s landing note) but the concurrency at the time is not. L-7 is stated as
  a structural consequence of the lane width, not as the cause of that incident.

## Open questions raised this iteration

1. With `001` and `002` both at one recorded fail and a remediation landed, does the packet raise the
   guard to 6, or does it treat the remediation as part of iteration 1 (so a child gets one CREATE plus
   three JUDGE-based iterations)? The arithmetic differs by one for every child in the map.
2. Do declared deviations (L-3) count against DONE at all — i.e. may a child pass with `Frame = 1*`
   provided the total is ≥ 14, or must the packet split the Frame row so the ADR-held half is scored
   separately and the composed half must reach 2?
