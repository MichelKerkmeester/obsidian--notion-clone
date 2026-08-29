**Phase 007 — Architecture research (standing, off-path)**

Repo `~/MEGA/Development/Obsidian Plugin`. **Not a program phase.** It gates nothing and appears in no execution order. It exists to be consulted and re-run.

**STATUS: COMPLETE.** 10 iterations, GPT-5.6 LUNA at xhigh, forced depth with no early convergence. Output: `research/lineages/luna-xhigh/research.md` (30 KB) plus `iteration-001.md` … `iteration-010.md`.

**WHAT IT PRODUCED THAT CHANGED THE PROGRAM.**
- **The hole in the acceptance doctrine.** The four original rules — production mount, thresholded number, proven to fail today, harness can distinguish — are necessary and **not sufficient for a stateful surface**. A *temporally stale or semantically aliased* surface passes all four: the measurement is real, the baseline fails, deletion moves the metric, and the harness still observes the wrong logical row, a stale anchor rect, or an action landing elsewhere after a transition. Five dimensions added: **semantic identity, transition trace, action outcome, resource ownership, negative-control mutation.**
- **The missing phase**, now `008` — no child phase can know a later stylesheet edit preserved its result.
- **The architecture correction** — `overlay-stack.ts` and `interaction-scope.ts` already exist; `openSurface()` must **extend** that seam, not run beside it.
- **The 9-step migration order** that adds an adapter before removing anything.
- **The anchor ownership model** — a logical lease, with the DOM node as a render-epoch cache.

**ITS OWN STATED LIMIT, WHICH IS WHY IT IS TRUSTWORTHY.** No browser ran in that lineage. Every browser-specific conclusion is marked a **proof obligation, not an observed result**. Treat it that way; `009` is what turns those obligations into numbers.

**HOW TO RE-RUN.** From **inside the plugin worktree** — containment rejects a run launched from the hub, which cost a full 5-minute lineage once:
`node .opencode/skills/system-deep-loop/runtime/scripts/fanout-run.cjs --spec-folder specs/public/005-component-surface-system/007-architecture-research --loop-type research --research-topic "<topic>" --fanout-config-json '{"executors":[{"kind":"cli-codex","label":"<label>","model":"gpt-5.6-luna","reasoningEffort":"xhigh","serviceTier":"fast","iterations":10}]}' --base-artifact-dir <spec-folder>/research --stop-policy max-iterations`

**TWO TRAPS THAT COST REAL TIME HERE.**
- **Do not run a research lineage while an agent is editing the same tree.** Write containment saw a concurrent agent's edits, attributed them to the lineage and **reverted 15 paths** — killing a completed 27-minute run at the final step.
- **codex has no `--reasoning-effort` flag.** Effort is `-c model_reasoning_effort=`. Passing the obvious flag runs at default effort and looks fine.

**Both runs "failed" with exit code 0.** Always verify iterations on disk and a synthesized `research.md`; never trust the exit status alone.

**RE-RUN IT WHEN** a criterion fails twice without a new hypothesis, or an architecture decision in `000` is contested. Otherwise leave it closed.
