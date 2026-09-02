---
title: "Feature Specification: Obsidian PM UI Harvest"
description: "A research phase that ports obsidian-pm-main's timeline, board, calendar and subtask surfaces plus its UI/UX near one-to-one, producing a module map (their file to our module) and an ordered adoption plan; our table, sheets and calc/rollup features stay ours."
trigger_phrases:
  - "obsidian pm ui harvest"
  - "036 harvest"
  - "dotpm patterns"
  - "steal the ui from obsidian-pm"
  - "phone sheet pattern harvest"
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
      - "goal.md"
      - "plan.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-036"
      parent_session_id: null
    completion_pct: 60
    open_questions: []
    answered_questions: []
---
# Feature Specification: Obsidian PM UI Harvest

> Phase chain: parent [`../spec.md`](../spec.md). Modeled on the research-shaped sibling
> [`../007-architecture-research/goal.md`](../007-architecture-research/goal.md), which has no
> `tasks.md` by design because it is standing and off-path. This phase differs from 007 in one
> respect: it **is** a numbered phase of the program (opened under Gate 3 option D, decided by the
> orchestrator under the session goal) rather than an off-path standing resource, so it carries the
> full Level 2 document set. License boundary and decisions live in [`goal.md`](goal.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

## EXECUTIVE SUMMARY

**The operator rescoped this packet on 2026-09-02, verbatim**: *"i want to steal as much as
possible, our tables, sheets advanced features regarding calcs and all that is better but lets try to
copy their timeline, board, calendar, subtask setup and ui ux almost 1:1"*, and *"The repo source code
is there so its mostly rewriting to align with our sk code and integrating merging."* This is a PORT,
not an inspiration harvest: `specs/context/obsidian-pm-main` — 22,833 lines across `src/components`,
`src/ui/primitives`, `src/ui/composites`, `src/modals`, `src/views` and `src/store` — supplies the
timeline/gantt, board, calendar and subtask model plus overall UI/UX to be rewritten near one-to-one
to this repo's standards (`sk-code`, MODULE banners, comment hygiene, lanes, gate) and merged into our
renderers and data model. Our table view, bottom sheets and formulas/rollups/calcs stay ours — this
phase records what does NOT get borrowed and why (D5).

**This phase does not build anything.** It runs a 20-iteration `/deep:research` loop against that
source and writes two linked deliverables into `research/research.md`: (1) a per-surface catalog —
timeline, board, calendar, subtasks, shared UI — each entry cited to a `file:line`, and (2) a module
map, their file mapped to our module, dispositioned copied-verbatim-with-MIT-notice / rewritten /
dropped, naming integration seams and an LOC estimate. The catalog closes with an adoption plan
ordered timeline → board → calendar → subtasks → shared UI, each item naming a proposed new phase
packet.

**Key decisions**: this is a port, not inspiration-only borrowing — code is rewritten to this repo's
standards and merged, not summarized into an idea list (`goal.md` D4); our table view, bottom sheets
and calc/rollup engine are explicitly out of the port and stay ours (D5); every entry is cited to a
`file:line` on both sides — theirs and, once mapped, ours (D2); the loop's executor order is fixed by
the operator across three CLI/model pairs, and a lane's output is a claim until an in-runtime read
confirms it (D3).

**Critical dependencies**: `specs/context/obsidian-pm-main` must remain on disk and unedited for the
loop's duration — it is read-only reference material, never a write target. The write-containment
trap `007` already paid for applies here too: do not run the loop while an agent edits this tree.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Level:** 2 (Verification) — `recommend-level.sh --loc 0 --files 3` scores 5/100 at 75% confidence
(no code changes; this phase produces documents), which is below Level 2's own floor. Level 2 is
assigned by direct match to the research-shaped sibling `007-architecture-research`'s document
weight and to the acceptance-criteria/waiver discipline this phase's five criteria need, not by the
script's LOC/files heuristic, which was built for code phases. The script does not recommend a
higher level, so 007's precedent stands per dispatch instruction.
**Status:** Catalog delivered, provenance partly unverified. The research loop ran once on
`cli-codex` `gpt-5.6-luna` (runner exit 0) and its output is merged into this packet at
`research/research.md` (promoted from the `luna-max-fast-pm-harvest` lineage, whose ledgers stay
untracked under the repo's ignore rule) — a 65-row module map, an ordered five-packet adoption
plan, and a do-not-borrow list. Three of `goal.md`'s five completion rows close on it; the two that
remain turn on how the loop ran, not on what it produced (the 20-iteration count is self-reported
through a gateway fallback, and the passing spot-check sampled one side of the map only). Not a
Draft, and not complete.
**Owner:** unassigned.
**Lane:** does not take the `styles.css` lane. This phase writes no code and no stylesheet.
**Opened:** 2026-09-02, Gate 3 option D under the session goal.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Six packets in this program (022, 031, 010, 023, 001/027, 011) are actively deciding phone-surface
UI/UX — sheet lifecycle, selection-bar keyboard docking, menu grammar, mobile menu presentation — with
no systematic reference to a plugin the operator already flagged as having solved several of the same
problems well. Nothing in the tree cites `obsidian-pm-main`; a `grep` for it across `specs/**/*.md`
returns zero matches, the same gap 007 found for the embed host in 006.

### Purpose

Produce a cited module map and per-surface adoption plan for porting `obsidian-pm-main`'s timeline,
board, calendar and subtask surfaces plus its UI/UX near one-to-one into this repo — file:line on both
sides, a disposition per file (copied verbatim with MIT notice / rewritten / dropped), integration
seams, an LOC estimate, and a do-not-borrow list recording what stays ours (table view, sheets,
formulas/rollups/calcs) — so each proposed phase packet inherits one document instead of an
independent read of a 22,833-line tree.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A 20-iteration `/deep:research` loop reading `specs/context/obsidian-pm-main`, writing its state,
  deltas and per-iteration output into `research/` and `research/lineages/` inside this packet — see
  `plan.md` §4 for the reserved paths and the exact dispatch command.
- A synthesized deliverable at `research/research.md`: a per-surface catalog (timeline/gantt, board,
  calendar, subtasks, shared UI) AND a module map — their file mapped to our module, dispositioned
  copied-verbatim-with-MIT-notice / rewritten / dropped, naming integration seams and an LOC estimate
  — closing with an adoption plan ordered timeline → board → calendar → subtasks → shared UI, each
  item naming a proposed new phase packet.
- A do-not-borrow list naming what stays ours and why: table view, bottom sheets, and
  formulas/rollups/calcs, because ours is already the stronger implementation per the operator's own
  comparison.
- A license disposition read from `specs/context/obsidian-pm-main/LICENSE` and stated once in
  `goal.md` §3, referenced rather than re-derived by every catalog row.

### Out of Scope

- Writing or modifying any product code, stylesheet, or the six adopting packets themselves — this
  phase produces a catalog those packets consult; adoption is each packet's own decision and its own
  scope, not this phase's.
- Behaviour study of any plugin other than `obsidian-pm-main` — no Anytype/AppFlowy re-read; that
  boundary is `007`'s `H-L08` and stays closed.
- Editing the parent program's `goal.md` or `roadmap.md` — another agent holds that file this pass;
  the parent's phase map gets this packet added later, by that agent, not this one.
- Judging whether a harvested pattern *should* be adopted. This phase catalogs candidates; the
  adopting packet decides.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `specs/005-component-surface-system/036-obsidian-pm-ui-harvest/**` | Create | This packet's own documents and the loop's `research/` output |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The loop runs against `specs/context/obsidian-pm-main` for 20 iterations or until it converges, with the reason recorded, writing only into `research/` and `research/lineages/` inside this packet. |
| REQ-002 | `research/research.md` exists and carries a module map with ≥ 20 entries, each with a `file:line` citation on both sides (their file, our module once mapped), a disposition (copied verbatim with MIT notice / rewritten / dropped), and an LOC estimate. |
| REQ-003 | The adoption plan names a proposed new phase packet per surface, ordered timeline → board → calendar → subtasks → shared UI, and the do-not-borrow list names table view, sheets and formulas/rollups/calcs with the reason each stays ours. |
| REQ-004 | No spec path, phase number, task id or requirement id appears in any code comment this phase or an adopting packet writes as a result of it (Comment Hygiene HARD BLOCK). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | Each of operator reports 30-33 has at least one harvested candidate addressing it, where the report names a surface this harvest covers. |
| REQ-006 | A 10-citation, in-runtime spot-check confirms the cited `file:line` exists and matches the catalog's description of it. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `research/research.md` exists with a per-surface catalog and a ≥ 20-entry module map,
  each entry file:line-cited on both sides with a disposition and LOC estimate.
- **SC-002**: The adoption plan names a phase per surface (timeline, board, calendar, subtasks, shared
  UI) in that order, and the do-not-borrow list names what stays ours and why.
- **SC-003**: A 10-of-10 in-runtime spot-check passes against the module map's citations.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `specs/context/obsidian-pm-main` staying present and unedited | Loop cannot read a source that moved or changed under it | Read-only reference tree; no packet in this program writes to `specs/context/` |
| Risk | Concurrent write containment reverts the loop's own output, as it did to 007's 27-minute run | Full lineage loss at the final step | Do not dispatch the loop while another agent edits this packet's tree — the same trap 007's `goal.md` §"log" records |
| Risk | A lane's output is trusted without the in-runtime read | A cited line that does not exist propagates into a product decision | D3 and REQ-006 make the spot-check a completion criterion, not an optional pass |
| Risk | `codex` executor uses the wrong effort flag (`--reasoning-effort` does not exist; it is `-c model_reasoning_effort=`) | Loop runs at default effort silently | Named in `plan.md` §4, carried over from 007's own trap log |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: N/A — this phase produces documents, not a runtime path.

### Security
- **NFR-S01**: No code from `obsidian-pm-main` lands without its MIT notice; see `goal.md` §3.

### Reliability
- **NFR-R01**: The loop's exit status is never trusted alone — both of 007's runs "failed" with exit
  code 0. Verify iterations on disk and a synthesized `research.md`.
<!-- /ANCHOR:nfr -->

---

## L2: EDGE CASES

### Data Boundaries
- A surface family with nothing worth harvesting: the catalog states this explicitly for that family
  rather than omitting it, so a reader cannot mistake silence for an unfinished search.
- Fewer than 20 genuine patterns exist: the criterion is `N ≥ 20`; if the loop converges early with
  fewer, the convergence reason must say so and the criterion is renegotiated as a decision, not
  silently marked Met.

### Error Scenarios
- Loop dispatched from the hub instead of the plugin worktree: containment rejects it, per 007's own
  recorded trap; re-dispatch from inside the worktree.
- A citation's line has moved by the time of the spot-check: the spot-check reads current disk state,
  not the loop's snapshot; a moved line fails the check and that row is corrected, not waived.

## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 10/25 | Zero files changed outside this packet's own documents and `research/`; one external read-only source |
| Risk | 10/25 | Concurrent-edit containment trap and citation-trust trap, both already documented from 007 |
| Research | 20/20 | The entire deliverable is research output |
| **Total** | **40/70** | **Level 2** |

---

## 10. OPEN QUESTIONS

- Whether a harvested pattern that spans two adopting packets (e.g. a sheet behaviour touching both
  031 sheet lifecycle and 010 sheet reading) gets one catalog row with two adopting packets listed, or
  two rows — left to the loop's synthesis pass; either is acceptable as long as REQ-002's citation and
  license fields are present on each row that results.
- Whether `deepseek-v4-flash-max` via `cli-devin` needs a `cli-external-orchestration/cli-devin`
  contract read before dispatch (AGENTS.md §5 CLI dispatch rule) — yes, and `plan.md` §4 names it as a
  pre-dispatch step for whoever runs the second lane.
