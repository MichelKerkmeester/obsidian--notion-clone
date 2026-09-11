# Iteration 005 — LOOP LOGIC

**Gap class:** LOOP LOGIC · **Status:** complete · **newInfoRatio:** 0.75
**Findings file:** `findings/iter-5.md`

## Focus

The D6 graph's executable contract — the unchanged-tree predicate, the guard, the GATE checkpoint, the
verdict schemas, DONE and D8's release gate, concurrency, and judge calibration — read against the two
children that have actually run the loop.

## Headline findings

1. **L-1 — "two consecutive passes on an unchanged tree" is a phrase, not a predicate.** The verdict
   schema carries only `sha`; the manifest already carries `pixelHash`/`sourceHashes` per capture. And
   the tree has already changed under a child: `002` landed a `--obnotion-settings-card-fill` change
   that moved `001`'s own judged card fill (57→64), while `001` reads *"the judge's re-score — two
   consecutive passes on this unchanged tree — is the child's remaining gate"*. Proposed: a
   three-field fingerprint predicate and a richer JUDGE verdict file.
2. **L-2 — the 4-iteration guard is below the observed cost.** Both children scored **11/16** on the
   first judge pass; `001` recorded five rows at 1 and its remediation block is five tasks. Reaching
   DONE after one remediation costs 3 JUDGE passes; the guard leaves one spare, with none for a voided
   pass or a missing capture. Proposed: guard 6, escalate on **no row moved**, and a `stall` payload
   with a `no-capture` kind.
3. **L-3 — the rubric's ceiling is not 16 and the packet has no declared-deviation mechanism.** `001`
   targets Frame at 1 because of the operator-held ADR-I (`✕` vs `Done`), so its pass must be assembled
   from seven 2s with zero slack. Proposed: `1*` declared deviations, capped at 1, with the Frame row
   split into `Frame (D7)` and `Frame (composed)`.
4. **L-4 — two competing cures for a cropped capture.** D2 names the full-sheet variant; `002`'s
   remediation **cut the judged fixture from sixteen columns to ten** so the sheet fit the 874px
   frame, and its iteration rows still name viewport captures. Proposed: the variant is always the
   judged image, fixture-resizing-to-fit is forbidden, and a SCREENSHOT-phase task opens the capture
   and records its dimensions before anything is judged.
5. **L-5 — GATE's output is a marker file with no author, timestamp or plan hash**, yet it authorises
   CREATE and both children corrected their DEFINE tables after approval. Proposed `GATE-<iter>.json`
   plus a parent-log batching rule for nineteen DEFINE posts.
6. **L-6 — two schemas, two enums, and DONE living only as a log line.** The verdict enum is
   `pass|fail|blocked`; the state enum is six values; D8's release gate string-matches a `DONE` line.
   Proposed: split enums named explicitly, and `DONE-<iter>.json` naming the two JUDGE verdict files,
   whose fingerprints must match.
7. **L-7 — the cap is a child count, but the contended resource is one file.** Every child modifies
   `styles.css` under a one-holder lane released only after a human look; `002`'s landing crossed
   `001`'s and re-verified a composed stylesheet. Proposed: per-resource widths (css lane 1, capture
   harness 1, judge 2) and removal of the inner cap of 4, which cannot bind on a sequential graph.
8. **L-8 — the judge is never calibrated against the operator.** `002`'s own table holds the packet's
   only triple fragment: creator self-score 13/16 vs judge 11/16 on the same images, with Colour 1 vs
   0. Proposed `076/judge-calibration.md` and the rule that answers D1's own open question on the first
   operator-fails-a-passed-child event.

## Loop-logic change list

| File | Change |
|---|---|
| `decision-record.md` D6 | unchanged-tree predicate; JUDGE verdict fields; guard → progress-driven with a `stall` payload; GATE verdict file + batching log; verdict/state enums split; `DONE-<iter>.json`; concurrency table |
| `decision-record.md` D1 | declared deviations (`1*`), Frame row split |
| `decision-record.md` D2 | the judged image is the full-sheet variant; fixture-resizing forbidden |
| `decision-record.md` D8 | the release gate compares **files**, not log lines |
| `plan.md` §6A | the DONE read changes from a log line to `DONE-<iter>.json` |
| new | `076/judge-calibration.md` |

## What was ruled out

- The drivers are absent from the repo by design (D6 places them in `$S`) — all findings are against
  the specification, which D6 itself declares authoritative.
- The guard has **not** tripped yet: `001` is at iteration 1, `002` at iteration 2 with a re-score owed.
  L-2's arithmetic is labelled a projection.
- The 2-child cap is **not** proven to have caused `002`'s cross-landing; L-7 is stated as a structural
  consequence of the lane width.

## Next focus

**COVERAGE, second axis (iteration 6):** surfaces with no reference of any kind and the DEFINE sources
for the zero-reference children — `017`'s eighteen DbModals, `014`'s five suggest sheets, `016`'s three
unreferenced toolbars, `015`'s form-factor mismatch — plus the nine fixture-only surfaces and the
`chrome-selection-status-bar` / `chrome-table-load-more` exclusion. Carried forward: C-6's unrecorded
exclusions and D-2's missing judged captures for `012`–`019`.
