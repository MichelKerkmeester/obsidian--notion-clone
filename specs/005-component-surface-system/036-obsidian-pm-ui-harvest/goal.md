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
    last_updated_at: "2026-09-02T22:55:00Z"
    last_updated_by: "loop-merged"
    recent_action: "Loop output merged from worktree; 3 of 5 rows ticked"
    next_safe_action: "Open 037-timeline-gantt-port from the adoption plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-036-goal"
      parent_session_id: null
    completion_pct: 60
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

Three of five close on the merged loop output. The two that remain open both turn on
**how** the loop ran rather than on what it produced — see the 22:55 log entry.

The catalog the first three rows read is at `research/research.md`, promoted there from the path the
runner chose (`research/lineages/luna-max-fast-pm-harvest/research/research.md`) and carrying a
provenance header naming the lineage and run id. The lineage tree itself — ledgers, deltas, the twenty
iteration files and a condensed sibling report — stays on disk but untracked, under this repo's
`specs/**/research/**/lineages/` ignore rule. `research/convergence-report.md` and
`research/spot-check.md` were promoted beside it.

- [x] A module map exists at `research/research.md` with **N ≥ 20** entries, each carrying a
      `file:line` citation on both sides — theirs and, once mapped, ours — a disposition (copied
      verbatim with MIT notice / rewritten / dropped), and an LOC estimate.
      *Evidence: 65 rows across the five per-surface tables in `research/research.md` (§§1–5, rows at
      lines 93–336). All 65 carry a reference `file:line`, a local `file:line`, a disposition, and an
      LOC range paired with its adopting packet — counted mechanically, zero rows missing any of the four. The
      failing value this moved from was 0 rows: before the merge the stale `research/` in this
      checkout held ledger and telemetry files only, and no `research.md` at all.*
- [x] The adoption plan names a proposed new phase packet per surface, ordered timeline → board →
      calendar → subtasks → shared UI, each with a gate order and an LOC estimate.
      *Evidence: "Final adoption plan (ordered)" (same file, lines 394–402) lists orders 1–5 as
      `037-timeline-gantt-port` (1,100–1,500 LOC), `038-board-kanban-port` (800–1,100),
      `039-calendar-parity-port` (900–1,400), `040-subtask-tree-port` (700–1,000) and
      `041-shared-ui-ux-port` (650–950), each with a "Must differ / keep local" column and a gate
      order ending in `npm run gate`. The failing value this moved from
      was 0 named packets — no adoption plan existed in this checkout before the merge.*
- [x] The do-not-borrow list names what stays ours — table view, bottom sheets,
      formulas/rollups/calcs — and why, for each.
      *Evidence: "Do-not-borrow list" (same file, lines 404–419) carries exactly those three entries,
      each with a reason and a citation. The failing value this moved
      from was 0 entries — the list did not exist in this checkout before the merge.*
- [ ] The loop reached 20 iterations, or converged earlier with the convergence reason recorded in
      `research/lineages/<lineage>/convergence-report.md`.
      *Stays open: the 20/20 count is the run describing itself, not a measurement — see the 22:55
      log entry. Twenty `iterations/iteration-0NN.md` files exist, but the artifacts alone do not
      distinguish twenty model turns from twenty gateway-composed ones, and the new-information ratio
      series that would corroborate them is synthetic.*
- [ ] An in-runtime spot-check of 10 randomly selected citations from the module map finds all 10 true
      against the file on disk — line exists, and its content matches what the map claims about it.
      *Stays open although a 10-of-10 read passed: the ten were drawn from the reference side only,
      not randomly across both sides of the map, and a separate read of the local side found a false
      citation outside that sample (corrected 2026-09-02; see the log). A sample that excludes the
      side where the one known error lives does not satisfy "randomly selected". Re-draw across both
      sides to close this.*
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

**2026-09-02 22:55: the loop's output is merged into this checkout, and three rows close.** The
stale `research/` described in the paragraph above was deleted and replaced wholesale by the
worktree's tree — 127 files, 579,380 bytes — together with the twelve `event-0NN.json` files the
runner left at the packet root. The worktree branch was not touched. Of that tree, 124 files sit under
`research/lineages/` and are **untracked by repo policy**, so the synthesis was promoted to
`research/research.md` — with `convergence-report.md` and `spot-check.md` beside it — and the ledgers
stay local. That promotion, not a force-add, is what makes the ticks below citable from the repo.

*What the run verifiably produced.* One lineage, `luna-max-fast-pm-harvest`, on `cli-codex`
`gpt-5.6-luna` (`reasoningEffort=max`, `serviceTier=fast`) per D3. The fan-out runner exited 0 and the
launcher returned 0; wall clock 22:01 to 22:41; one lineage, one attempt. The synthesis is a 44 KB report, promoted to
`research/research.md`, with a 16 KB condensed sibling left in the lineage tree. It carries 65 cited module-map rows, an ordered five-packet adoption plan, the do-not-borrow
list, and the MIT-notice requirement — which is what the first three completion rows ask for, and why
they are now ticked.

*What the run only reports about itself, and is therefore not evidence.* The "20 of 20 iterations,
stop reason `maxIterationsReached`" figure is the run's own telemetry, not a measurement of it.
Read the report's own "Loop telemetry and verification" section: native detached CLI startup was
**blocked by the outer app-server permission boundary**, and the packet-local loop "completed the
requested source-cited iterations through the gateway" instead. The corroborating new-information
ratio series it prints — `1.00, .92, .88, .82 … .14` — descends in fixed .04 and .06 steps with no
noise anywhere in twenty values, which is arithmetic rather than observation. So: **the catalog is
verified by its citations; the iteration count is self-reported; the ratio series is synthetic.** The
fourth completion row, whose wording depends on iterations having actually run, stays open.

*Spot-check, and one correction.* A fresh in-runtime read confirmed 10 of 10 reference-side citations
exact — among them `TimelineConfig.ts:5-9` (`ROW_HEIGHT = 44`), `types.ts:4-11` (`ViewMode` has no
calendar member), `Popover.ts:55-77`, and `task-editor.css:34-45`. A separate read of the **local**
side found one citation false and it has been corrected in both copies of the report, under a dated
note: `src/views/mobile-bottom-sheet.ts:304-318` was cited twice as the handle gesture, but those
lines are `watchForSheetRemoval`, a `MutationObserver`. The handle is created at `:81-87`
(`createSheetHandle`) and adopted by `attachSheetDragToDismiss` at `:423-426`; the flick decision is
`shouldFlickDismiss` at `:414-422`, applied at `:488` — the cited `:385-455` window opened on
threshold constants, not on the implementation. Because the ten that passed were all on the side that
had no known error, the fifth row stays open too; a re-draw must sample both sides.

**The planned follow-on.** The adoption plan is written and ordered, so the next step is to open
`037-timeline-gantt-port` and work down to `041-shared-ui-ux-port`, each doing the rewrite-and-merge
D4 requires. No such packet is opened yet, and this phase's two open rows do not block opening one —
they are about how confidently the catalog's provenance can be described, not about whether the
catalog is usable.
<!-- /ANCHOR:log -->
