# Iteration 5 findings

## Gap class

LOOP LOGIC — graph liveness, evidence-bearing verdicts, judge calibration, release gates, parallelism, and logging.

## Evidence

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:220-229 — “GATE | plan-approved marker absent | GATE (polls every 60s)” and the guard edges for CREATE, LAND, JUDGE, and REMEDIATE.
- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:255-271 — the verdict is only “status, sha, score, zeros, note” and child/parent logs are minimal JSONL.
- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:203-205,283-285 — JUDGE/DONE uses two model passes while the operator phone read is outside the graph.
- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:287-289 and plan.md:149-157,175-181 — caps are 2 outer and 4 inner, but shared CSS serialism and the 11-versus-19 count are not launch contracts.
- specs/005-component-surface-system/076-sheet-visual-parity/plan.md:183-192 and .opencode/skills/system-deep-loop/deep-research/SKILL.md:269-275 — graph logs are in ephemeral $S while research iteration state must use the append gateway.
- .opencode/skills/system-deep-loop/deep-research/references/convergence/convergence.md:78-87,107-118 — maxIterationsReached is a frozen stop reason and hard max has first decision priority.
- scratchpad/glm/loop-driver.sh — absent in this worktree; no behavior was inferred from it.

## Finding

The D6 state machine is legible but under-instrumented. It needs a liveness contract for non-human phases, a verdict payload that binds captures and rubric rows, a judge calibration record tied to the operator device read, explicit dependency and CSS-lock scheduling, and a durable event receipt. The existing hard-max decision order must remain unchanged.

## Proposed text

Add to D6 after the edge table:

“Every non-human node emits START, HEARTBEAT, and terminal records. HEARTBEAT fields are ts, child, node, iter, phase, pid-or-agent, inputDigest, outputDigest, and progress. A node is stale after the operator-approved phase timeout with no heartbeat; three consecutive stale or retry failures emit ESCALATE with reason, last heartbeat, and recovery attempt. GATE:waiting is exempt only while a named operator request is open; an expired or withdrawn request is ESCALATE. CREATE, LAND, JUDGE, and REMEDIATE also emit a no-change observation when the input tree hash and capture set are unchanged.”

Replace the verdict schema with:

“{status, child, node, iter, sha, treeHash, score, zeros, rubricRows:[{id, expectation, actual, score, captureIds, theme}], captures:{light,dark,fullSheet}, laneClauses:[{id, redCommit, greenCommit, result}], fixtureId, judge:{model,version,calibrationSet,disagreements}, operatorGate:{status,receipt}, blockers, note}. A pass is invalid when any required theme/capture/rubric/lane reference is missing, when Frame or Sections is zero, or when operatorGate is pending.”

Add a judge-calibration task:

“Before the first child JUDGE, score a gold set containing the six operator screenshots and one known D7 card-container failure in light and dark. Store per-row expected outcomes and disagreements. The judge may report pass only when its row-level result matches the calibrated expectation or records a named adjudication. The operator device read remains the final closure receipt.”

Add to 6A scheduling:

“The outer scheduler has at most two active children and the inner pool at most four agents. DEFINE/PLAN may run in parallel only when their source and task files do not overlap. Shared styles.css, surface-shell.ts, overlay-stack.ts, sheet-grammar.mjs, and record-surface primitives use one serial mutex with a lock receipt. Child 019 is not eligible for LAND until 018’s board composition receipt exists. Replace every eleven-child count with the reconciled 19-child map plus approved bridge children.”

Add to the log contract:

“For every graph transition, persist an append-only lineage event or an external-log receipt containing child, node, iter, status, timestamp, input/output/tree hashes, capture IDs, verdict path, retry/stall count, dependency locks, and operator receipt. The gateway-backed research state remains canonical; a missing scratchpad driver is an unavailable implementation, not a reason to omit the receipt.”

Add to D8:

“A release gate consumes only child DONE records whose two consecutive JUDGE passes have unchanged treeHash, complete light/dark/full-sheet evidence, no zero on binding rows, and a non-pending operatorGate. LAND:pass and a single JUDGE:pass are never release evidence.”

## Confidence

High for the liveness, verdict, scheduling, and logging gaps because the cited schemas omit those fields; medium for timeout values, calibration-set maintenance, and whether the durable mirror is stored in the spec packet or as a lineage receipt.
