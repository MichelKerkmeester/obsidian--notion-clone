# Iteration 9 — LOOP LOGIC, second axis: the lane file, the clause→gate path, the judged-capture comparator, and the outer walk

**Gap class:** LOOP LOGIC (second pass, different axis). Iteration 5 audited D6's node/verdict/log
schemas against the first two children. This pass audits the four *running surfaces* the graph
actually executes through: the **css lane** (`tools/lane/css-lane.json`, `check-lane.mjs`), the
**gate** (`tools/gate.mjs`, `tools/live/sheet-grammar.mjs`, `verify-placement.mjs`), the
**judged-capture comparator**, and the **outer walk** (`plan.md` §6A, `program-loop.sh`).

---

## G-1 · The lane that serializes eleven children disagrees with itself, and no check reads its shape

**Evidence.**

- `tools/lane/css-lane.json` (committed; `git status --porcelain -- tools/lane/` is clean): the
  top-level record is
  ```
  holder    = 076-002-properties-sheet-visual-parity
  baselineHash = 195782fd8370
  acquiredAt   = 2026-09-11T03:21:40.000Z
  history      = 562 entries
  ```
  The newest history entry is **076-002's release at 2026-09-11T02:37:26.000Z** on hash
  `195782fd8370`. A scan of all 562 entries finds **zero** events at `03:21:40Z` — the
  `holder`/`acquiredAt` pair names a hold whose acquire was never appended. Verified against
  `git show HEAD:tools/lane/css-lane.json` (same values), so this is committed state, not local dirt.
- Shape drift, counted over all 562 entries: **2 entries carry no `event`** (indices 240, 407) and
  **3 carry no `at`** (indices 503–505 — the `014-sheet-polish` acquire/edit/release triplet). The
  README documents the entry shape `{event, phase, at, hash}` and a field named `heldBy`; the file
  spells it `holder`. Nothing validates any of it: `check-lane.mjs` reads only `holder`,
  `baselineHash` and the newest entry (`reviewVerdict` returns early unless
  `newest.event === "release" && newest.hash === lane.baselineHash`).
- The packet-side half: `grep -rn "SURFACE_PHASE" specs/005-component-surface-system/076-sheet-visual-parity/`
  returns **nothing** (the only hits anywhere in the packet are this lineage's own research notes and
  other packets). `check-lane.mjs` fails a moved stylesheet unless `SURFACE_PHASE` equals the
  holder, so a `076` child's first stylesheet edit runs `npm run gate` red on `css-lane` until the
  executor knows to set it — knowledge that lives in `071`'s release notes, not in any `076` task.

**Finding.** D4's serialization rests on one hand-edited JSON file whose own history does not
account for its current holder, whose shape is already violated in five places, and whose operating
variable (`SURFACE_PHASE`) is documented nowhere inside the packet. This is the same failure class
the lane was built to fix one level down: convention where a check belongs. The cost is not
theoretical — the unrecorded hold is on the exact resource the eleven children queue for, and a child
starting CREATE today cannot tell from the file who holds the lane or when it was handed over.

**Proposed text** — a schema check on the lane file, and one packet-side line:

```markdown
### Lane integrity (`tools/lane/check-lane.mjs`, or a new `lane-schema` gate check)

Every entry in `css-lane.json.history` carries `event` (`acquire|edit|release`), `phase`, `at`
(ISO-8601) and `hash`; the top-level `holder` equals the phase of the newest `acquire`, and
`acquiredAt` equals that acquire's `at`. A violation is a gate failure naming the entry index, not a
comment. The five malformed entries are repaired in the same commit that adds the check.

### The lane, operationally (`plan.md` §6A)

`SURFACE_PHASE=<child-folder-name>` is what makes `css-lane` pass during a child's edit window; the
orchestrator sets it on every `npm run gate` run it drives. Each child's `tasks.md` CREATE leg names
the acquire/edit/release triplet and that variable.
```

**Confidence:** high — every number is read from the committed file and the check's own source.

---

## G-2 · A child's clause becomes a gate lane with no clause identity and no record that it was ever red

**Evidence.**

- The gate has **28 checks** (`grep -c '^  { name: "' tools/gate.mjs`), and the packet's entire lane
  discipline lands inside one of them: `{ name: "sheet-grammar", cmd: ["node",
  "tools/live/sheet-grammar.mjs"] }` (`tools/gate.mjs:110`). The tool prints ~**197** PASS/FAIL
  clause lines per run (197 occurrences of `"PASS" : "FAIL"`); **8 carry an id** — `L1 … L8`, all of
  them `076/002`'s properties-parity block (`sheet-grammar.mjs:4035-4038` onward) — and 11
  `failures.push` sites name an `L`-id. The other ~185 lines are anonymous prose.
- Clause-id collision: the roadmap and the children both write "L8" — `002`'s L8 is the card-step
  clause, `071/002`'s "grammar L8" is a different clause in the same file, and `001` has L9/L10 of
  its own. Ids are local to a child's `§13` and are not namespaced in the tool.
- The gate's verdict for a red reads **2 lines** of the tool's output (`gate.mjs`'s
  `tail: … .slice(-2)`, each line `.slice(0, 120)`), plus a full log under
  `tools/lane/gate-logs/sheet-grammar.log` written only on a surprise. For a 197-clause tool a red
  surfaces two arbitrary failure lines.
- The programme has already built the missing mechanism, once, elsewhere:
  `tools/storybook/verify-placement.mjs:3313-3322` attaches a phase to a **section** and holds a
  `PHASE_CONTROLS` map of check-name → "the failing number each check produced on a deliberately
  broken tree"; `:11747-11761` fails a check with no recorded red *and* fails a recorded red whose
  check has vanished; `control-attribution-baseline.json` ratchets the attribution coverage so it
  may not shrink. No `076` child's tasks mention it, and `sheet-grammar.mjs` has no equivalent.
- 071/009 is the worked failure this mechanism would have caught: its clause measured 3 controls on
  the row and passed, while the shipped picture still carried ↑ ↓ plus a filled checkbox because the
  *target* encoded a count and not identities (D1's own recorded reason for demoting lanes to
  floors).

**Finding.** The packet's lane-clause discipline ("write one lane clause per measurable §13 row …
confirm each can fail before it is asked to pass") is unenforceable as written: nothing in the tool
or the gate can distinguish a clause that was watched red from one written green-first, nothing can
attribute a red to the child that owns it, and two children can both own a clause named `L8`. The
repo's own answer to exactly this problem is 60 lines away in another tool.

**Proposed text** — clause identity and provenance in the lane the packet edits:

```markdown
### Clause ids (`tools/live/sheet-grammar.mjs`)

Every clause reports as `<child>/L<n> — <one line>` (e.g. `002/L4 — 0 card containers in the row`),
unique across the tool. A clause with no child prefix belongs to `071`'s shared grammar and keeps its
current text. The failure strings and the PASS/FAIL prints both carry the id.

### Clause provenance (`CLAUSE_CONTROLS`)

`sheet-grammar.mjs` keeps a map from clause id to the RED number it was watched failing at, with the
break that produced it — the same both-directions rule `verify-placement.mjs` already applies: a
clause with no entry fails the run ("nothing says it was ever seen to fail"), and an entry whose
clause has vanished fails too. The RED numbers the children already record in `tasks.md` move here.
A `076` clause whose subject a ruling retires is deleted from the tool in the ruling's own
remediation commit, so the map and the clause set stay equal (iteration 7's vacuous-pass rule,
T-3).
```

**Confidence:** high — the counts, the gate's tail rule and the `PHASE_CONTROLS` mechanism are all
quoted from the tree.

---

## G-3 · The judged-capture comparator that D1/D2/D8 depend on is not in the repository

**Evidence.**

- Every `071`/`076` release note judges its captures "by decoded pixel delta" and names the script:
  `node scratchpad/glm/pixel-delta.mjs` (repeated verbatim across `css-lane.json` history, e.g. the
  `076/002` releases and the `076-sheet-visual-parity` harness releases). `scratchpad/` does not
  exist in this worktree or the main checkout (iteration 1, C-3).
- What the repository has is `tools/screenshots/pixel-hash.mjs`: a **quantised 16×16 grid average**
  rounded into wide buckets, built deliberately to absorb encode jitter — and twice recorded failing
  to see a real paint change because the change was confined to a narrow band: `067`'s outstanding
  row (seventeen captures, up to 46,779 pixels at max channel delta 214, all hashing identically) and
  `062`'s frozen-column shadow (22,510 pixels, hash unmoved).
- `check-lane.mjs` can narrow a git-changed capture set only by `pixelHash`/`layoutHash`
  (`isContentChange`). Its "moved bytes but not pixelHash/layoutHash — not a review a release owes"
  line is therefore the repository's strongest machine judgement about a capture, and it is blind in
  exactly the case the reviewer's delta rule exists for.
- D1's floor argument is the same fact from the other side: "a lane measured is not evidence" —
  the lane's numbers cannot see a picture. The picture judgement currently lives in an out-of-tree
  script and in prose thresholds ("≤12 channel delta is jitter", "moved in both runs is real").

**Finding.** The packet's judged evidence chain — D2's full-sheet capture → D1's judge → D8's release
gate — runs through a comparator that exists nowhere in the tree it judges. A fresh clone cannot
reproduce any release's mover judgement; a child's REMEDIATE leg cannot re-derive "the captures
moved" without the orchestrator's private script; and the gate itself cannot escalate from
"hash-identical" to "how many pixels changed".

**Proposed text** — bring the comparator in and let the gate speak its language:

```markdown
### `tools/screenshots/pixel-delta.mjs`

A decoded-PNG delta between two committed blobs or two working-tree files: changed-pixel count, max
per-channel delta, bounding box, and the per-run comparison the release rule uses. Thresholds become
named constants — `JITTER_MAX_CHANNEL_DELTA = 12`, `MOVED_IN_BOTH_RUNS = real` — so a release note
quotes a rule rather than a habit.

### The gate line (`tools/lane/check-lane.mjs`)

For every capture in the narrowed changed set, print the decoded delta beside the hash verdict:
`moved bytes, pixelHash unchanged, decoded delta 46779px@214 — a release owes this one a review`.
`067`'s outstanding debt is the negative control: the seventeen captures it lists must read as real
movers under the new line, not as byte-only noise.
```

**Confidence:** high — the script's absence and the hash's blind spot are both in the record; the
constants are proposals derived from the recorded numbers (12, "both runs").

---

## G-4 · The iteration guard is already provably unreachable for both children that have run, and a mid-loop ruling invalidated one remediation outright

**Evidence (measured, not extrapolated).**

- `001`: one JUDGE pass, `0a04895f`, **Frame/Sections/Row anatomy/Controls/Type = 1, Spacing/Colour/
  Both themes = 2, 11/16, 0 zeros, fail** (`001/verification.md:73`). Its remediation is five tasks
  (T015–T019, unchecked). Two consecutive passes on an unchanged tree need at least: iteration 3
  (remediated judge) and iteration 4 (second pass) — **exactly 4, with zero margin** for a voided
  pass, a jitter, or a fresh ruling.
- `002`: iteration 1 judge `4ab094cf` = **11/16, 1 zero** (Sections 1, Colour 0, Both themes 1).
  Iteration 2 was a remediation leg targeting those rows — its headline change is the dark
  `--obnotion-settings-card-fill` step (11/255 → 18/255) plus a ten-row fixture resize
  (`002/verification.md:152-170`). Iteration 2's JUDGE (commit `2e928b587`, 2026-09-11 06:51 +0200)
  scored **Frame 0, Sections 0, Colour 1, 11/16, 2 zeros, fail** (`002/verification.md:183-210`) —
  because D7 (landed 05:30, after that remediation target was chosen) scores the card container 0 on
  Frame and 0 on Sections. 002's card-removal tasks (T014–T016) are still `[ ]`. Its path to two
  passes is now iterations 3 + 4 + 5 — **at least 5 against a guard of 4**.
- So the first two children that have actually run the loop both exceed `max_iters=4`, and one of
  them spent a whole remediation on a token the next ruling retired. The graph has no edge for
  this: plan.md §7's rollback trigger is "the judge fails a third consecutive iteration on the
  **same rubric row** (meaning the target is wrong)" — 002's failing rows *changed*
  (Colour → Frame/Sections), so the trigger does not fire even though the target is exactly what
  changed. D6's node table has no DEFINE-REOPEN conditional on a decision-record revision.

**Finding.** The guard under-counts and the graph under-reacts, and both are visible in one child's
transcript. `max_iters=4` was chosen against an assumed single remediation ending in two passes; the
observed trajectory (11/16 → remediate → 11/16 with *different* zeros) shows a ruling can reset the
scoreboard without resetting the counter. Iteration 5's L-2 proposed 6; this iteration adds the
missing edge and the reset rule.

**Proposed text** — the guard, and the reopened target:

```markdown
### The guard (`decision-record.md` D6, `plan.md` §6A)

Default `max_iters = 6`. A child that has landed its own remediation may take one more pass than the
guard intends to be its terminal one; the guard's job is to stop a loop that is not converging, and
11/16 → remediate → 11/16 is convergence in evidence, not in total.

### DEFINE-REOPEN (new transition, D6)

A decision-record revision that supersedes a target a child has already scored against
(`supersedes: D7` on the ruling) **voids that child's in-flight remediation target**: the child
returns to DEFINE for the affected rows, its iteration count continues (the guard still protects),
and the voiding is written to the child's JSONL as `DEFINE-REOPEN` with the ruling id and the rows
affected. 002's D7 case is the worked example: its iteration-2 Colour remediation is voided, its
Frame/Sections remediation opens under the new rule, and the record says which of its captures
was scored against the old one.
```

**Confidence:** high — both children's scores, dates and pending tasks are read from the tree; the
D7 timing is from `decision-record.md` and this session's own record.

---

## G-5 · A verdict file cannot say which row moved, and the packet's release-gate evidence is Markdown prose the gate never reads

**Evidence.**

- The graph's terminal evidence is the child's `verification.md` iteration table: per-row scores,
  the two captures named, the verdict and the findings file (`002/verification.md:41-47`). The
  verdict file D6 specifies carries `{status, sha, score, zeros, note}` — **no row-level scores and
  no capture identity** (iteration 5, L-6).
- Iteration 1 → 2 for 002 is the proof the pair is insufficient: **score 11 = 11**, and the zeros
  moved 1 → 2 while the failing rows changed entirely. From the verdict files alone, 002's iteration
  2 looks like a repeat, not a regression, and no release gate can tell that its Colour work landed
  and its Frame work collapsed.
- The repository's own freshness mechanism (`tools/live/evidence.mjs`) already solves the identity
  half: a JSON artefact carries an `inputs` map, `--check` reports whether those inputs still
  describe the tree, and `--check-all` (16 artefacts) is a gate check. **None of the 16 is a `076`
  artefact** — the packet's judged results are outside the mechanism by construction (Markdown, no
  `inputs`).
- D6's "unchanged tree" is thus only checkable at HEAD-sha resolution, and LAND rewrites HEAD by
  rebasing (002's iteration-1 `4ab094cf` no longer identifies a tree). The captures themselves carry
  the durable identity — `screenshots/manifest.json` records `pixelHash`, `layoutHash` and
  `sourceHashes` per entry — and the judge names both capture paths in its own table.

**Finding.** The packet has a per-row score in one place (Markdown) and a tree identity in another
(manifest hashes), and the graph's schema joins neither. A DONE predicate built from verdict files
cannot re-derive "two consecutive passes on an unchanged tree", because neither "pass" (rows) nor
"unchanged" (inputs) is in the file. The fix is cheap because both halves already exist.

**Proposed text** — the verdict file gains the two fields the predicate needs:

```json
{
  "status": "fail",
  "sha": "2e928b587",
  "score": 11,
  "zeros": 2,
  "rows": { "frame": 0, "sections": 0, "rowAnatomy": 2, "controls": 2, "type": 2,
             "spacing": 2, "colour": 1, "bothThemes": 2 },
  "captures": [
    { "file": "screenshots/notion-clone/panels/constructed-column-manager-sheet-mobile-light.png",
      "pixelHash": "…", "layoutHash": "…" },
    { "file": "screenshots/notion-clone/panels/constructed-column-manager-sheet-mobile-dark.png",
      "pixelHash": "…", "layoutHash": "…" }
  ],
  "inputs": { "styles.css": "…", "src/views/column-manager-renderer.ts": "…" },
  "note": "D7 card rule re-scored; Colour remediated, Frame/Sections open (T014-T016)"
}
```

and the rule:

```markdown
### The DONE predicate, read from files

Two consecutive `JUDGE-<n>.json` with `status: pass`, the same `captures[].pixelHash` set, and an
`inputs` map `evidence --check` reports fresh. A pass whose captures or inputs moved between the two
is one pass, not two. `DONE.json` names both verdict paths.
```

**Confidence:** high for the gap (the schemas are quoted), medium for the exact field spellings,
which should follow whatever the driver emits.

---

## G-6 · The outer walk has no liveness test, treats any state file as progress, and meters the wrong resource

**Evidence.**

- `plan.md` §6A: "`program-loop.sh` … launches `loop-driver.sh` for any child with **no state yet**,
  under the concurrency cap, until every child reports `DONE:pass` or the walk is stopped", and "an
  escalated child is **skipped on every subsequent pass**". There is no rule for a child that has
  state and is not progressing, and no `LAUNCH`/`SKIP` line specified for `$S/loop/076.jsonl`.
- Consequence one: a driver killed between its first state write and its next never runs again — state
  exists, so the outer walk skips it forever, and its log's last line is indistinguishable from
  `GATE:waiting` (which §6A explicitly says is not a stall).
- Consequence two: ESCALATE is terminal for the walk; the child is skipped with no parent-log event
  and no re-entry path, and the operator's own next step is "outside the graph" — so the walk's
  completion claim ("until every child reports DONE") is unachievable after any escalation and
  nothing reports it.
- The concurrency cap is expressed in children (`concurrency=2`) while the lane history records what
  those two children actually contend for: on 2026-09-10/11, three holders (`001`, `002`, `012`),
  `015` twice, and the parent packet **twice** signed acquire/edit/release triplets — six lane
  acquisitions in ~5h — and the parent's own anchors say "No stylesheet edit: the leg touches the
  capture harness only" (`css-lane.json`, `076-sheet-visual-parity` 01:52:42 and 02:40:18). So the
  cap that mattered ran at 1, and two of the acquisitions bought nothing but the signing ritual.
- `SURFACE_PHASE` absent from the packet (G-1) makes the collision worse in the other direction: a
  child editing without the variable gets a `css-lane` FAIL, which the driver sees as a failed
  CREATE — there is no `LANE-WAIT` state, so waiting looks like failing.

**Finding.** The outer walk is the graph's least specified node: it has a launch rule, a skip rule
and no liveness rule, and its cap names children where the resource it protects is a file. With 19
children and one serializer, the walk's own telemetry (`076.jsonl` receiving only what the children
write) cannot answer "is the walk making progress or has it stopped", which is the question the
operator will ask first.

**Proposed text** — the walk's transitions and the resource that bounds it:

```markdown
### The outer walk (`plan.md` §6A, `$S/loop/076.jsonl`)

`LAUNCH <child>`, `SKIP <child> reason`, `STALL <child> lastNode=<n> lastAt=<iso>
expected=<n>` are parent-log events. A child is `STALL` when it is not at `GATE:waiting` and has
written no transition for longer than two child iteration budgets; the walk prints one line per
STALL rather than skipping silently, and re-launching a STALLed child is an operator decision
recorded as `RELAUNCH`.

### The cap (`plan.md` §6A)

The cap is per resource, one line each: css lane **1**, capture harness **1**, judge agents **2**,
children in PLAN/JUDGE **2**. A child waiting on the css lane sits in `LANE-WAIT` (a node, not a
failure), with `SURFACE_PHASE` set to its own folder so `check-lane` reads the claim. A leg that
moves no stylesheet bytes signs nothing: capture-only legs record a `sign-off` entry naming the
moved captures, and the lane history reserves `acquire/edit/release` for holds that edit the file.
```

**Confidence:** high for the walk's rules (quoted from §6A) and for the lane's measured rhythm;
medium for the stall threshold, which should follow whatever cadence the drivers actually show.

---

## Loop-logic second-axis verdict

| Question | Answer |
|---|---|
| Does the lane file describe its own holder faithfully? | **No** — `holder`/`acquiredAt` (03:21:40Z) have no matching history event; 5 of 562 entries are malformed; nothing validates the shape |
| Does a child's clause become a gate lane with an identity? | **Partly** — it lands inside one of 28 checks; 8 of ~197 clauses carry an id, none namespaced; no mechanism records that any clause was watched red (the repo has one, in `verify-placement.mjs`) |
| Is the judged-capture comparator in the tree? | **No** — every release cites `scratchpad/glm/pixel-delta.mjs`; the in-repo measure is the 16×16 grid hash with two recorded blind spots |
| Does `max_iters=4` fit the observed cost? | **No** — both children that ran exceed it; 002's remediation was invalidated mid-loop by D7 and the rollback trigger cannot fire |
| Can the DONE predicate be re-derived from files? | **No** — verdict files carry no rows and no capture identity; the `evidence` mechanism that would supply the latter covers 16 artefacts, none from `076` |
| Does the outer walk detect a stalled child? | **No** — any state file means "progress", ESCALATE means "skip forever", concurrency is metered in children against a one-writer file |

## What was tried and failed this iteration

- **Hypothesis: the lane's current holder is the parent packet** (this lineage's own earlier note).
  Disproved at HEAD: the committed holder is `076-002-properties-sheet-visual-parity`; the parent's
  holds are history entries, not the current claim.
- **Hypothesis: the lane history is missing events because the file is uncommitted.** Disproved —
  `git status` is clean for `tools/lane/` and `git show HEAD:` carries the same values, so the gap is
  committed.
- **Hypothesis: the gate already escalates a clause-level red with enough context.** Disproved — the
  tail is two lines of a 197-clause run; the full output exists only for failing checks and only in
  a generated log directory.

## Open questions raised this iteration

1. Should the clause registry (G-2) live in `sheet-grammar.mjs` itself or in the gate beside
   `PHASE_CONTROLS` — i.e. is clause provenance a property of the tool that measures, or of the gate
   that reports?
2. `DEFINE-REOPEN` (G-4) voids an in-flight remediation target. Does the voided leg's evidence stay
   in the child's iteration table (as history) or move to a `voided/` section — the table is the
   judge's own artefact and 002's iteration 2 is now both "a remediation" and "scored against a
   retired target"?
3. The lane `sign-off` entry (G-6) would let capture-only legs stop taking the lane. Does the
   programme want the lane to remain the single serialization point for *captures* too (the harness
   is one resource), or is a capture-only leg genuinely unconstrained?
