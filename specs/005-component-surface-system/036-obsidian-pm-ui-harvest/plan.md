---
title: "Implementation Plan: Obsidian PM UI Harvest"
description: "How the 20-iteration research loop is dispatched, where it writes, and how the catalog it produces is verified."
trigger_phrases:
  - "036 plan"
  - "obsidian pm harvest loop dispatch"
  - "reserved research paths 036"
importance_tier: "normal"
contextType: "general"
---
# Implementation Plan: Obsidian PM UI Harvest

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Markdown research output; no product code |
| **Loop mechanism** | `system-deep-loop` fan-out runtime, `--loop-type research`, same mechanism 007 used |
| **Source** | `specs/context/obsidian-pm-main` (read-only, vendored, MIT) |
| **Testing** | In-runtime citation spot-check (AC-4), not an automated test |

### Overview

A `/deep:research` loop reads `specs/context/obsidian-pm-main` for up to 20 iterations across three
sequential executor lanes (operator's fixed order, D3), writing its state into `research/` and
`research/lineages/` inside this packet. The loop's synthesis step produces `research/research.md`: a
per-surface catalog (timeline, board, calendar, subtasks, shared UI) AND a module map — their file to
our module, dispositioned copied-verbatim-with-MIT-notice / rewritten / dropped, integration seams,
LOC estimate — closing with an adoption plan ordered timeline → board → calendar → subtasks → shared
UI, each naming a proposed new phase packet. This plan does not implement product code or the port
itself; it dispatches and verifies the loop that produces the map and plan for a later phase to act on.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md`).
- [x] Success criteria measurable (`spec.md` §5, `acceptance-criteria.md`).
- [x] `specs/context/obsidian-pm-main` confirmed present, MIT-licensed, unedited by this packet.

### Definition of Done
- [ ] All acceptance criteria in `acceptance-criteria.md` are `Met`, `Waived` or `Superseded`.
- [ ] `research/research.md` and `research/lineages/` exist with the loop's full iteration set.
- [ ] Docs updated: `spec.md`, `goal.md`, `acceptance-criteria.md` reflect the loop's actual outcome,
      not the pre-run plan.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Research fan-out loop, not a code pattern. Three sequential executor lanes, each a separate lineage
directory under `research/lineages/`, matching 007's `luna-xhigh` / `grok46-xhigh-architecture`
two-lineage precedent but with three lanes instead of two.

### Key Components
- **Loop runtime**: `.opencode/skills/system-deep-loop/runtime/scripts/fanout-run.cjs`, the same
  entry point 007's `goal.md` names for re-runs.
- **Lineage output**: one directory per executor lane under `research/lineages/<lane>/`, each with its
  own `research.md`, `iterations/`, `deltas/`, `deep-research-state.jsonl` and convergence report —
  the shape already on disk under 007's `research/lineages/`.
- **Synthesis**: a final pass that reads all lanes' `research.md` files and writes the single, merged
  `research/research.md` — per-surface catalog, module map, do-not-borrow list, and ordered adoption
  plan — this packet's acceptance criteria check.

### Data Flow

`obsidian-pm-main` source (read) → per-lane iteration output (`research/lineages/<lane>/iterations/`)
→ per-lane `research.md` (write) → synthesis pass reads all lanes → `research/research.md` (write) →
in-runtime spot-check reads `research/research.md` and the cited `obsidian-pm-main` lines (read) →
`acceptance-criteria.md` rows updated.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Research Loop and Verification phase
checkboxes and task state.

### Reserved paths (leave free; the loop writes here)

```
036-obsidian-pm-ui-harvest/
├── research/
│   ├── research.md              ← synthesized catalog, all lanes merged (created by synthesis)
│   ├── orchestration-status.log
│   ├── orchestration-summary.json
│   └── lineages/
│       ├── <lane-1>/            ← e.g. luna-max-fast
│       │   ├── research.md
│       │   ├── iterations/
│       │   ├── deltas/
│       │   ├── deep-research-state.jsonl
│       │   └── convergence-report.md
│       ├── <lane-2>/            ← e.g. deepseek-v4-flash-max
│       └── <lane-3>/            ← e.g. sonnet-xhigh
```

Do not hand-author anything under `research/` — it is the loop's write surface, mirroring 007's own
`research/` and `research/lineages/` shape exactly.

### Executor order (D3, operator's own)

1. `gpt-5.6-luna` at `model_reasoning_effort=max`, `service_tier=fast`, through `cli-codex` or
   `cli-opencode`. **Before dispatch**, read whichever CLI's `SKILL.md` under
   `.opencode/skills/cli-external-orchestration/` is actually used (AGENTS.md §5 CLI dispatch rule).
   `codex` has no `--reasoning-effort` flag — effort is set with `-c model_reasoning_effort=max`, the
   exact trap 007's `goal.md` recorded.
2. `deepseek-v4-flash-max` through `cli-devin`. Read
   `.opencode/skills/cli-external-orchestration/cli-devin/SKILL.md` first.
3. Sonnet at `xhigh` through the second Claude login.

### Dispatch command shape (from inside the plugin worktree — containment rejects a hub-launched run)

```
node .opencode/skills/system-deep-loop/runtime/scripts/fanout-run.cjs \
  --spec-folder specs/005-component-surface-system/036-obsidian-pm-ui-harvest \
  --loop-type research \
  --research-topic "Port obsidian-pm-main's timeline/gantt, board, calendar and subtask surfaces plus its overall UI/UX near one-to-one into this repo, rewritten to sk-code standards and merged with our renderers and data model; our table view, sheets and formulas/rollups/calcs stay ours. Produce a per-surface catalog and a module map (their file:line to our module, disposition copied-verbatim-with-MIT-notice/rewritten/dropped, integration seams, LOC estimate) plus an adoption plan ordered timeline -> board -> calendar -> subtasks -> shared UI, each naming a proposed new phase packet" \
  --fanout-config-json '{"executors":[{"kind":"cli-codex","label":"luna-max-fast","model":"gpt-5.6-luna","reasoningEffort":"max","serviceTier":"fast"}]}' \
  --base-artifact-dir <spec-folder>/research \
  --stop-policy max-iterations
```

Twenty iterations total across the loop, per `spec.md` REQ-001; the exact per-lane iteration split is
the orchestrator's call at dispatch time, not fixed by this plan.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| In-runtime citation spot-check | 10 randomly selected catalog rows | Manual `Read` of the cited `obsidian-pm-main` file at the cited line |
| Convergence verification | Loop reached 20 iterations, or converged with a recorded reason | `research/lineages/<lane>/convergence-report.md`, per lane |
| Per-report coverage | Reports 30-33 each have ≥ 1 candidate where applicable | Manual cross-reference, `acceptance-criteria.md` AC-2 |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|--------------------|
| `specs/context/obsidian-pm-main` on disk, unedited | External (vendored) | Green | Loop has no source to read |
| `system-deep-loop` fan-out runtime | Internal | Green (used by 007) | No loop mechanism to dispatch |
| `cli-codex`/`cli-opencode`, `cli-devin` CLI contracts | Internal | Green | Lane 1 or 2 cannot dispatch until its `SKILL.md` is read |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: A lane's output is found to cite lines that do not exist, or the loop was corrupted by
  a concurrent-edit write-containment revert (007's own recorded failure mode).
- **Procedure**: Delete the affected lane's `research/lineages/<lane>/` directory and re-dispatch that
  lane alone; do not hand-edit a corrupted `research.md` to make it pass the spot-check.
<!-- /ANCHOR:rollback -->

---

## L2: PHASE DEPENDENCIES

```
Setup (source confirmed, worktree clean) ──► Research Loop (3 lanes, 20 iterations) ──► Synthesis
     ──► Verification (spot-check, per-report coverage)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Research Loop |
| Research Loop | Setup | Synthesis |
| Synthesis | Research Loop | Verification |
| Verification | Synthesis | None |

---

## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|--------------------|
| Setup | Low | source confirm, worktree check |
| Research Loop | High | 20 iterations, 3 sequential lanes |
| Synthesis | Med | merge 3 lanes into one catalog |
| Verification | Low | 10-citation spot-check |
| **Total** | | Loop-duration dominated; no fixed hour estimate given the loop's own variance in 007 |

---

## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Worktree clean; no concurrent agent editing this packet's tree before dispatch.
- [ ] `specs/context/obsidian-pm-main` present and MIT LICENSE confirmed.

### Rollback Procedure
1. Stop the running lane if a concurrent-edit trap is detected mid-run.
2. Delete only the affected lane's directory under `research/lineages/`.
3. Verify remaining lanes' `research.md` files are untouched before re-dispatch.
4. Re-run synthesis once all lanes are clean.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: Directory deletion only, scoped to `research/lineages/<lane>/`.
