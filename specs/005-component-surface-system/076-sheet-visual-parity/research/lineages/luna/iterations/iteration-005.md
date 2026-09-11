# Iteration 5: LOOP LOGIC — liveness, verdicts, calibration, release, parallelism, and logging

## Focus

Review the D6 graph, the 6A operational contract, the convergence stop contract, the judge/DONE rule, release gating, concurrency, and the available driver evidence. Produce paste-ready reliability changes without running the absent scratchpad driver or any nested executor.

## Actions Taken

- Re-read deep-research-state.jsonl and all four prior deltas before selecting this final, non-repeated gap class.
- Read decision-record.md D6, D7, D8, and D9; parent plan.md §6A; the convergence stop contract; and the deep-research executor invariants.
- Checked for scratchpad/glm/loop-driver.sh. It is absent in this worktree, so no driver behavior was inferred from an unavailable file.
- Compared the named graph nodes and edges with the verdict schema, the operator phone gate, the release rule, the outer/inner caps, and the append-only state requirement.

## Findings

### LL-001 — The graph names an iteration guard but does not define phase-level liveness or stall recovery

Evidence: specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:220-229 says GATE polls every 60 seconds and maps failures to ESCALATE, while decision-record.md:273-278 says the guard only trips when the iteration counter exceeds max_iters. specs/005-component-surface-system/076-sheet-visual-parity/plan.md:194-199 explicitly says a child at GATE:waiting is not stalled. These rules distinguish human waiting from failure but do not define heartbeats, maximum time in CREATE/LAND/JUDGE/REMEDIATE, repeated unchanged-tree detection, or a recoverable timeout.

Finding: a hung producer or judge can remain indistinguishable from useful work until an hours-scale process timeout. GATE must remain exempt while it has a live operator request, but every non-human phase needs a heartbeat and an explicit timeout-to-ESCALATE contract.

### LL-002 — The verdict contract cannot prove which capture, rubric row, theme, or lane clause was judged

Evidence: decision-record.md:255-271 defines the verdict as only status, sha, score, zeros, and note, and the child log as node/iter/status/sha/score/note. decision-record.md:201-204 requires CREATE RED/GREEN commits, light+dark LAND captures, and an eight-row JUDGE rubric, but the state shape has no fields for those receipts. This is the same traceability gap found in DEPTH, now observed at the graph boundary.

Finding: a score can be replayed as “pass” without proving that both themes, the full-sheet capture, the named row IDs, and the RED/GREEN lane clauses were actually exercised. The verdict should remain compact but carry stable references to all evidence.

### LL-003 — DONE can be reached by two model passes without a machine-readable operator calibration contract

Evidence: decision-record.md:203-205 gives JUDGE the eight-row rubric and makes DONE two consecutive passes on an unchanged tree; decision-record.md:283-285 says the operator phone read is outside the graph and is what actually closes a child. decision-record.md:333-336 makes Frame and Sections zero-score rules binding. The separation is correct, but no contract records calibration examples, per-row disagreement, or the operator’s disposition alongside the two passes.

Finding: “two passes” is a necessary graph signal, not sufficient evidence that the image judge learned the operator’s device ruling. A calibration set and per-row expectation/disagreement record are needed so a high aggregate score cannot hide a zero on Frame, Sections, or another binding row.

### LL-004 — The concurrency cap is named, but dependency-aware parallelism and the shared-CSS mutex are not operationalized

Evidence: decision-record.md:287-289 limits the outer walk to two children and the inner agent pool to four; decision-record.md:208-211 records LAUNCH but gives it no verdict file. plan.md:175-181 still says the outer loop walks eleven children, while the phase map and coverage audit contain 19 children. D4’s serial CSS rule is cited in plan.md:149-157 but has no launch eligibility or lock receipt.

Finding: the cap alone does not stop two children from landing competing styles.css changes, and it does not express that 019 depends on the board composition established by 018. Parallelize independent DEFINE/PLAN or non-overlapping fixture work, serialize shared CSS/primitive LAND, and encode 018 → 019 plus parent-count reconciliation as graph prerequisites.

### LL-005 — The append-only logging contract is split between ephemeral scratchpad paths and the lineage state gateway

Evidence: plan.md:183-192 places child logs, verdicts, prompts, and raw output under $S/loop and says none is a committed spec artifact; decision-record.md:264-271 defines two append-only scratchpad JSONL logs. The deep-research executor contract at .opencode/skills/system-deep-loop/deep-research/SKILL.md:269-275 separately requires one gateway event per iteration and forbids direct writes to the state log. scratchpad/glm/loop-driver.sh is absent in this worktree.

Finding: the graph’s operational evidence is not durable in the same lineage as the research synthesis, and the absent driver prevents a direct liveness audit. The implementation plan should define a minimum event mirror (or an explicit external-log receipt) rather than relying on an uninspectable scratchpad path.

## Questions Answered

- Q5 is answered with five concrete changes: phase heartbeats and stall escalation, evidence-bearing verdicts, judge calibration, dependency-aware capped parallelism, and gateway-backed event logging.
- The absence of scratchpad/glm/loop-driver.sh is a bounded evidence gap, not permission to infer its behavior or run a substitute.
- The hard cap remains the terminal authority: convergence telemetry must not synthesize before iteration 5.

## Questions Remaining / Next Focus

- Operator must choose phase timeout values and whether the durable log mirror belongs in the spec packet or only as an artifact receipt.
- Operator must approve the calibration corpus and who is allowed to mark the final device read.
- No further iteration is allowed by the configured cap; synthesis follows with stopReason maxIterationsReached.

## Sources

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:184-289,295-336,375-423
- specs/005-component-surface-system/076-sheet-visual-parity/plan.md:149-157,175-229
- .opencode/skills/system-deep-loop/deep-research/references/convergence/convergence.md:76-143
- .opencode/skills/system-deep-loop/deep-research/SKILL.md:261-275,301-319
- scratchpad/glm/loop-driver.sh: absent in this worktree (read-only existence check)

## Assessment

The graph is a sound state-machine outline but is not yet a fully observable production loop. The proposed contracts preserve D6’s human gate and D8’s release discipline while making every automated transition auditable. Confidence is high for the missing fields and dependency rules; timeout numbers and calibration ownership remain operator decisions.

## Reflection

This final pass deliberately did not repeat the earlier coverage, depth, composition, or design-system audits. It used their stable row IDs, capture IDs, shared primitive IDs, and D7/D9 constraints as the evidence payload that the loop must carry from PLAN through DONE.

