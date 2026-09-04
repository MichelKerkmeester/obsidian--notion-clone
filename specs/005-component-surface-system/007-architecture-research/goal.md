---
title: "Goal: Architecture Research"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "007 goal"
  - "architecture research goal"
  - "architecture research directive"
  - "packet goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/007-architecture-research"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Backfilled the house goal shape; criteria and evidence untouched"
    next_safe_action: "Leave closed; consult it, and re-run only on its stated trigger"
    blockers: []
    key_files:
      - "../architecture-findings.md"
      - "harvest.md"
      - "../roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-007-goal"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Goal: Architecture Research

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A standing, off-path architecture study the program consults: it gates nothing, and its output has to stay trustworthy rather than current.

Repo `~/MEGA/Development/Obsidian Plugin`. **Not a program phase.** It gates nothing and appears in no execution order. It exists to be consulted and re-run.

**WHAT IT PRODUCED THAT CHANGED THE PROGRAM.**
- **The hole in the acceptance doctrine.** The four original rules — production mount, thresholded number, proven to fail today, harness can distinguish — are necessary and **not sufficient for a stateful surface**. A *temporally stale or semantically aliased* surface passes all four: the measurement is real, the baseline fails, deletion moves the metric, and the harness still observes the wrong logical row, a stale anchor rect, or an action landing elsewhere after a transition. Five dimensions added: **semantic identity, transition trace, action outcome, resource ownership, negative-control mutation.**
- **The missing phase**, now `008` — no child phase can know a later stylesheet edit preserved its result.
- **The architecture correction** — `overlay-stack.ts` and `interaction-scope.ts` already exist; `openSurface()` must **extend** that seam, not run beside it.
- **The 9-step migration order** that adds an adapter before removing anything.
- **The anchor ownership model** — a logical lease, with the DOM node as a render-epoch cache.

### Decisions

Frozen choices. Changing one is an amendment. Each is a restatement of this phase's own
directive above, not a new commitment.

| ID | Decision |
|----|----------|
| D1 | **Not a program phase.** It gates nothing and appears in no execution order. It exists to be consulted and re-run. |
| D2 | No browser ran in its lineage, so every browser-specific conclusion is a **proof obligation, not an observed result**. `009` is what turns those obligations into numbers, and that stated limit is why the document is trustworthy. |
| D3 | The four original acceptance rules are necessary and **not sufficient for a stateful surface**. Five dimensions are added: semantic identity, transition trace, action outcome, resource ownership, negative-control mutation. |
| D4 | `openSurface()` **extends** the existing `overlay-stack.ts` / `interaction-scope.ts` seam rather than running beside it, and the 9-step migration order adds an adapter before removing anything. |
| D5 | Re-run it when a criterion fails twice without a new hypothesis, or when an architecture decision in `000` is contested. Otherwise leave it closed. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**ITS OWN STATED LIMIT, WHICH IS WHY IT IS TRUSTWORTHY.** No browser ran in that lineage. Every browser-specific conclusion is marked a **proof obligation, not an observed result**. Treat it that way; `009` is what turns those obligations into numbers.

**RE-RUN IT WHEN** a criterion fails twice without a new hypothesis, or an architecture decision in `000` is contested. Otherwise leave it closed.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## COMPLETION

This phase gates nothing, so "done" means its output exists and can be trusted. Both criteria are
checked by opening the files, never by an exit status — this phase's own runs both reported failure
while succeeding, and both reported success with exit 0 while producing nothing.

- [x] Every lineage has its full iteration set **and** a synthesized `research.md` on disk.
      Verified by listing: `luna-xhigh` 10 iterations and a 29K `research.md`;
      `grok46-xhigh-architecture` 5 iterations and a 23K `research.md`.
- [x] The findings are reachable from the program rather than stranded here. `roadmap.md` names
      this folder, and the parent's own decisions carry its conclusions.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

**STATUS: COMPLETE — two lineages, not one.** The second was missing from this record until a later pass listed the folder.

- `luna-xhigh` — 10 iterations, GPT-5.6 LUNA at xhigh, forced depth with no early convergence.
- `grok46-xhigh-architecture` — 5 iterations, Grok 4.6 at xhigh through cli-cursor.

Each lineage holds its synthesized `research.md` directly under `research/lineages/<lineage>/`, and its iterations under `research/lineages/<lineage>/iterations/`. **Corrected 2026-09-02:** the previous line put `research.md` one directory deeper, inside a `research/` subfolder — that subfolder exists but holds only `deep-research-state.jsonl`; the synthesized file sits beside it, which matters when the whole point of the trap below is to go and look.

**HOW TO RE-RUN.** From **inside the plugin worktree** — containment rejects a run launched from the hub, which cost a full 5-minute lineage once:
`node .opencode/skills/system-deep-loop/runtime/scripts/fanout-run.cjs --spec-folder specs/005-component-surface-system/007-architecture-research --loop-type research --research-topic "<topic>" --fanout-config-json '{"executors":[{"kind":"cli-codex","label":"<label>","model":"gpt-5.6-luna","reasoningEffort":"xhigh","serviceTier":"fast","iterations":10}]}' --base-artifact-dir <spec-folder>/research --stop-policy max-iterations`

**2026-09-02: the delegation policy changed; the two lineages above are history, not a template.** New work goes through cli-codex on `gpt-5.6-luna` at `model_reasoning_effort=max` with `service_tier=fast`, verified by a fresh in-runtime Opus agent — parent `goal.md` D14.

**TWO TRAPS THAT COST REAL TIME HERE.**
- **Do not run a research lineage while an agent is editing the same tree.** Write containment saw a concurrent agent's edits, attributed them to the lineage and **reverted 15 paths** — killing a completed 27-minute run at the final step.
- **codex has no `--reasoning-effort` flag.** Effort is `-c model_reasoning_effort=`. Passing the obvious flag runs at default effort and looks fine.

**Both runs "failed" with exit code 0.** Always verify iterations on disk and a synthesized `research.md`; never trust the exit status alone.
<!-- /ANCHOR:log -->
