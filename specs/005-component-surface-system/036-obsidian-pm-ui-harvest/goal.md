---
title: "Goal: Obsidian PM UI Harvest"
description: "What would make phase 036 worth having done, and the criteria that decide it."
trigger_phrases:
  - "036 goal"
  - "obsidian pm ui harvest goal"
  - "dotpm harvest"
  - "which lane is the harvest loop"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/036-obsidian-pm-ui-harvest"
    last_updated_at: "2026-09-02T22:30:00Z"
    last_updated_by: "goal-audit-2"
    recent_action: "Loop confirmed running in worktree; main-checkout research/ is stale"
    next_safe_action: "Spot-check 10 citations in-runtime once the worktree loop converges"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-036-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "worktree vs branch, answered: the loop runs in .worktrees/003-obsidian-pm-harvest"
---
# Goal: Obsidian PM UI Harvest

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Port the vendored reference plugin at
[`../../context/obsidian-pm-main`](../../context/obsidian-pm-main) — the operator's own rescope words
are *"i want to steal as much as possible ... lets try to copy their timeline, board, calendar,
subtask setup and ui ux almost 1:1"* and *"mostly rewriting to align with our sk code and integrating
merging"* — into this repo. Produce a module map (their file mapped to our module, dispositioned
copied-verbatim-with-MIT-notice / rewritten / dropped, integration seams named, LOC estimated) and an
adoption plan ordered timeline → board → calendar → subtasks → shared UI, each item naming a proposed
new phase packet that will do the actual rewrite-and-merge.

**The surfaces in scope**: timeline/gantt, board, calendar, subtask model, and the shared UI/UX shell
around them. **Explicitly out of scope for porting** — ours stays, per the operator's own comparison —
the table view, the bottom sheets, and formulas/rollups/calcs; the do-not-borrow list in
`research/research.md` records why for each.

**Why this is a phase and not a paragraph**, unlike most of what [`007`](../007-architecture-research/goal.md)
harvested. `007`'s findings were already inside this program's own tree and could be dispositioned by
reading. This phase's source is 22,833 lines the program has never read, so the pattern catalog does
not exist yet — it is the loop's output, not a summary of one.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Patterns are borrowed freely; behaviour and interaction ideas are not copyrightable. Code is copied only where the license permits, and only with attribution. See §3 LICENSE for the boundary. |
| D2 | Every harvested item cites an `obsidian-pm` `file:line`, names the adopting packet here, and — where one applies — the operator report (29-33) it answers. An entry with no citation is not a finding. |
| D3 | The loop's executor order is the operator's: `gpt-5.6-luna` at `model_reasoning_effort=max`, `service_tier=fast`, through `cli-codex` or `cli-opencode` first; `deepseek-v4-flash-max` through `cli-devin` second; Sonnet at `xhigh` through the second Claude login third. A lane's output is a **claim** until an in-runtime read confirms the cited lines exist — see AC-4. |
| D4 | Port, not inspiration. The deliverable rewrites `obsidian-pm-main`'s timeline, board, calendar and subtask code plus its UI/UX to this repo's standards (`sk-code`, MODULE banners, comment hygiene, lanes, gate) and merges it into our renderers and data model — not a summarized idea list an adopting packet may or may not use. |
| D5 | Our table view, bottom sheets, and formulas/rollups/calcs stay ours; they are not ported. `research/research.md` carries a do-not-borrow list naming each and why, per the operator's own comparison that ours is already the better implementation there. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

All unticked. None of this phase's rows close until the loop has run and a spot-check has read the
cited lines.

- [ ] A module map exists at `research/research.md` with **N ≥ 20** entries, each carrying a
      `file:line` citation on both sides — theirs and, once mapped, ours — a disposition (copied
      verbatim with MIT notice / rewritten / dropped), and an LOC estimate.
- [ ] The adoption plan names a proposed new phase packet per surface, ordered timeline → board →
      calendar → subtasks → shared UI, each with a gate order and an LOC estimate.
- [ ] The do-not-borrow list names what stays ours — table view, bottom sheets,
      formulas/rollups/calcs — and why, for each.
- [ ] The loop reached 20 iterations, or converged earlier with the convergence reason recorded in
      `research/lineages/<lineage>/convergence-report.md`.
- [ ] An in-runtime spot-check of 10 randomly selected citations from the module map finds all 10 true
      against the file on disk — line exists, and its content matches what the map claims about it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LICENSE

`specs/context/obsidian-pm-main/LICENSE` is MIT, copyright Stepan Kropachev and dotpm contributors.

**What MIT permits and requires.** Use, copy, modify, merge, publish, distribute, sublicense and sell
are all granted, on one condition: the copyright notice and the permission notice must be included in
every copy or substantial portion of the software.

**What that means for this harvest.**

- **Borrowed patterns — no attribution owed.** Interaction shape, layout decisions, state machines,
  motion timing and the *behaviour* of a component are not copyrightable subject matter under any
  license. Re-implementing "a bottom sheet that docks the bulk-selection bar above the keyboard" in
  this program's own code, in this program's own words, needs no notice of any kind. This is the
  large majority of what this harvest is for.
- **Borrowed code — attribution owed.** A snippet, function body or CSS block copied verbatim or
  substantially, even adapted, is a "portion of the Software" and MUST carry the MIT copyright and
  permission notice at the point it lands — a code comment naming the license and copyright holder is
  the minimum, not a spec-path comment (Comment Hygiene HARD BLOCK still applies: the notice names the
  license and author, never a spec path, ADR id or phase number).
- **No copyleft applies.** MIT carries no share-alike or source-disclosure obligation, unlike AGPL —
  the boundary `H-L08` in [`../architecture-findings.md`](../architecture-findings.md) §10 already
  drew against Anytype and AppFlowy. Nothing here inherits that caution; MIT is the permissive case.
- **Catalog obligation, not code obligation, for this phase.** This phase produces `research/research.md`,
  a catalog — no product code lands from it. D1's borrowed/copied distinction is recorded here so the
  packet that later *does* copy code (022, 031, 010, 023, 001/027 or 011) inherits the correct
  attribution instruction rather than reopening the license question.

Volatile section below; not part of the directive.

**LOG.** Scaffolded 2026-09-02 by the markdown agent, ahead of the research loop. No iteration has
run. Rescoped 2026-09-02 21:40-21:41 by the operator from a pattern-harvest catalog to a PORT: timeline,
board, calendar and subtask surfaces plus overall UI/UX, near one-to-one, rewritten to this repo's
standards and merged; table view, sheets and calcs stay ours (see D4, D5).

2026-09-02 21:52-21:54: the 20-iteration `/deep:research` fan-out launched on `cli-codex`
`gpt-5.6-luna` (`reasoningEffort=max`, `serviceTier=fast`) once its quota window opened at 21:52.
Iteration 1 was rejected at 21:54 with a `containment_violation` — `observability-events.jsonl` under
`research/` named a path under `tools/storybook` that a concurrent in-runtime code phase (the
phone-chrome fixes for reports 30-33) had dirty in the same checkout. The runner's containment scans
the whole worktree, so the rejection is attributable to the sibling work, not to this lane. The
launcher then started the `devin` fallback (`deepseek-v4-flash-max`), which the orchestrator stopped
before it could fail the same way. Decision (orchestrator, reversible default): the loop is relaunched
only on a clean committed tree, after the code phase and the render-assertion controls commit; the
executor order stays codex → devin → claude2 Sonnet (5 iterations) per D3.

**2026-09-02, later: the loop runs in a dedicated worktree, not this checkout.** `git worktree list`
confirms `.worktrees/003-obsidian-pm-harvest` (branch `worktrees/003-obsidian-pm-harvest`), checked
out past this rescope. Its own `research/` directory is live — `observability-events.jsonl` and
`orchestration-status.log` there carry timestamps after this checkout's rejected iteration 1.
**The untracked `research/` in this main checkout (last written 21:54, the same minute as the
rejection) is stale residue from that rejected launch, not evidence of loop progress — the worktree's
copy is the one to read.**

**The planned follow-on, once the loop closes.** After the loop reaches convergence or 20 iterations,
and 10 randomly selected module-map citations are spot-checked in-runtime (the fifth completion
criterion above), the adoption plan opens one new phase packet per surface, in the stated order —
timeline → board → calendar → subtasks → shared UI — each doing the rewrite-and-merge D4 requires.
No such packet is opened yet; this phase's own five rows stay unticked until then.
<!-- /ANCHOR:log -->
