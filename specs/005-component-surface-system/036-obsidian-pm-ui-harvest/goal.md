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
    last_updated_at: "2026-09-02T00:00:00Z"
    last_updated_by: "markdown-agent-scaffold"
    recent_action: "Scaffolded goal/spec/plan/tasks/acceptance-criteria before the research loop runs"
    next_safe_action: "Dispatch the 20-iteration /deep:research loop per plan.md §4"
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
    answered_questions: []
---
# Goal: Obsidian PM UI Harvest

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Read the vendored reference plugin at
[`../../context/obsidian-pm-main`](../../context/obsidian-pm-main) — the operator's own words are
*"great ui / ux we can steal and use"* — and produce a pattern catalog that names every UI/UX pattern
worth adopting for this program's phone surfaces, each cited to a `file:line` in that plugin, mapped
to the packet here that would adopt it, and carrying a license note distinguishing borrowed code from
borrowed behaviour.

**The surfaces in scope**, because they are the ones the operator's phone reports (29-33) keep
naming: bottom sheets and their overflow, per-row actions on a phone, the bulk-selection bar and its
docking against the keyboard, the floating add control and inline editors, i18n plurals, list/board/
calendar interaction, motion.

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
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

All unticked. None of this phase's rows close until the loop has run and a spot-check has read the
cited lines.

- [ ] A pattern catalog exists at `research/research.md` with **N ≥ 20** entries, each carrying a
      `file:line` citation into `obsidian-pm-main`, an adopting packet, and a license note.
- [ ] Each of operator reports 30-33 has at least one harvested candidate that answers it, where
      applicable — see `acceptance-criteria.md` AC-2 for the per-report accounting.
- [ ] The loop reached 20 iterations, or converged earlier with the convergence reason recorded in
      `research/lineages/<lineage>/convergence-report.md`.
- [ ] An in-runtime spot-check of 10 randomly selected citations from the catalog finds all 10 true
      against the file on disk — line exists, and its content matches what the catalog claims about it.
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

**LOG.** Scaffolded 2026-09-02 by the markdown agent, ahead of the research loop. No iteration has run.
<!-- /ANCHOR:log -->
