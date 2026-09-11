# Iteration 009 — LOOP LOGIC, second axis (lane file, clause→gate path, judged-capture comparator, outer walk)

**Gap class:** LOOP LOGIC (second pass, different axis) · **Status:** complete · **newInfoRatio:** 0.71
**Findings file:** `findings/iter-9.md`

## Focus

The four running surfaces D6's node table executes through, which iteration 5 did not touch: the css
lane file and its check, how a child's lane clause becomes a gate lane, the judged-capture
comparator, and the outer walk's launch/skip policy as the packet grew from 12 to 19 children.

## Headline findings

1. **G-1 — the lane that serializes eleven children disagrees with itself.** The committed
   `tools/lane/css-lane.json` names `holder = 076-002-properties-sheet-visual-parity`,
   `acquiredAt 2026-09-11T03:21:40Z`, but **no history event exists at that time** (newest entry:
   002's release, 02:37:26Z); 2 of 562 entries have no `event`, 3 have no `at`; nothing validates the
   shape (README says `heldBy`, the file says `holder`). And `SURFACE_PHASE` — the variable that makes
   `check-lane` pass during an edit window — appears **nowhere** in the 076 packet.
2. **G-2 — a child's clause becomes a gate lane with no identity and no proof it was ever red.** All
   of the packet's clause discipline lands inside one of the gate's 28 checks; `sheet-grammar.mjs`
   prints ~197 PASS/FAIL lines, **8 carry an id** (all 002's `L1-L8`), ids collide across children
   (`071/002`'s "L8" vs `002`'s), the gate surfaces 2 lines of a red. The repo's own answer exists in
   `verify-placement.mjs`: `PHASE_CONTROLS` (a watched-red per named check, failing in both
   directions) plus an attribution ratchet — no 076 child mentions it.
3. **G-3 — the judged-capture comparator is not in the repository.** Every release judges "by decoded
   pixel delta (`node scratchpad/glm/pixel-delta.mjs`)" — a path absent from the tree — while the
   in-repo measure (`pixel-hash.mjs`, a quantised 16×16 grid) is the one that has twice missed real
   moves (067's 46,779px@214; 062's 22,510px shadow). D2 → D1 → D8 all depend on the out-of-tree
   script.
4. **G-4 — the 4-iteration guard is provably unreachable for both children that ran, and D7 voided
   002's in-flight remediation.** 001: 11/16 + five pending remediation tasks needs iterations 3 and
   4 exactly. 002: iteration 1 11/16 (1 zero) → remediated the Colour row (dark card fill 11→18/255)
   → iteration 2 JUDGE 11/16 with **2 zeros** (Frame 0, Sections 0 under D7, landed after the target
   was chosen); its card-removal tasks are still unchecked, so its next pass lands at iteration 5.
   Plan.md §7's rollback trigger ("same row three times") cannot fire because the rows changed.
5. **G-5 — a verdict file cannot say which row moved.** 002's iteration 1 → 2 reads as the same score
   (11) with different rows and different zeros; the schema `{status, sha, score, zeros, note}` has no
   rows and no capture identity, so the DONE predicate is not re-derivable from files. The mechanism
   that supplies the missing identity already exists (`evidence.mjs`'s `inputs` map) and covers 16
   artefacts, none from 076.
6. **G-6 — the outer walk has no liveness rule.** §6A launches only children "with no state yet" (a
   dead driver is never relaunched) and skips ESCALATE'd children forever with no parent-log event;
   `concurrency=2` is metered in children while the lane history shows six acquire/edit/release
   triplets in ~5h (three holders plus the parent twice for legs that edited no stylesheet),
   so the real serializer ran at 1 and two acquisitions bought only the signing ritual.

## Second-axis verdict

| Question | Answer |
|---|---|
| Lane file faithful to its own holder? | No — unrecorded hold, 5 malformed entries, no schema check |
| Clause → gate lane with identity? | Partly — 8 of ~197 id'd; no red-provenance mechanism in the tool |
| Judged-capture comparator in-tree? | No — the delta script is scratchpad-only |
| `max_iters=4` fits observed cost? | No — both children exceed it; D7 voided one remediation |
| DONE predicate re-derivable from files? | No — no rows, no capture identity in verdicts |
| Outer walk detects a stall? | No — state file = progress; ESCALATE = permanent skip |

## What was ruled out

- **The lane's holder is the parent packet** — disproved at HEAD; the committed holder is 002.
- **The lane's missing events are local dirt** — disproved; `git status` is clean and `HEAD:` carries
  the same values.
- **The gate already carries enough clause context for a red** — disproved; two tail lines of ~197.

## Next focus

**CROSS-CUTTING (iteration 10):** the traceability audit — every packet claim → the assertion that
measures it → the file that records it, run over the ten iterations' findings; the residual
open-question ledger; and the contradictions between iterations (DS-2→Y-1, LC-5→Y-3, C-3→its
correction) that must not be carried into the synthesis unqualified. Entry points: the 19 children's
§13 tables against `sheet-grammar.mjs`'s clause set, `goal.md` §3's operator rows, and the packet's
own cross-references to `071`'s landed clauses.
