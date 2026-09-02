---
title: "Feature Specification: Obsidian PM UI Harvest"
description: "A research phase that harvests UI/UX patterns from the vendored reference plugin obsidian-pm-main for this program's phone surfaces, maps each pattern to the packet that would adopt it, and dispositions the license."
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
    last_updated_at: "2026-09-02T00:00:00Z"
    last_updated_by: "markdown-agent-scaffold"
    recent_action: "Scaffolded ahead of the research loop; no iteration has run"
    next_safe_action: "Dispatch the 20-iteration /deep:research loop per plan.md §4"
    blockers: []
    key_files:
      - "goal.md"
      - "plan.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-036"
      parent_session_id: null
    completion_pct: 0
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

**The operator named a source and a reason.** `specs/context/obsidian-pm-main` is a vendored,
project-manager Obsidian plugin the operator called *"great ui / ux we can steal and use"* — 22,833
lines across `src/components`, `src/ui/primitives`, `src/ui/composites`, `src/modals`, `src/views`
and `src/store`, none of it read by this program before now.

**This phase does not build anything.** It runs a 20-iteration `/deep:research` loop against that
source, harvests patterns for this program's phone surfaces — bottom sheets and overflow, per-row
actions, the bulk-selection bar's keyboard docking, the floating add control and inline editors, i18n
plurals, list/board/calendar interaction, motion — and writes a cited catalog mapping each pattern to
the packet that would adopt it: 022 (selection bar), 031 (sheet lifecycle), 010 (sheet reading), 023
(record body), 001/027 (menu language), 011 (mobile menus).

**Key decisions**: patterns are free to borrow, code is not (`goal.md` D1); every entry is cited to a
`file:line` and an adopting packet (D2); the loop's executor order is fixed by the operator across
three CLI/model pairs, and a lane's output is a claim until an in-runtime read confirms it (D3).

**Critical dependencies**: `specs/context/obsidian-pm-main` must remain on disk and unedited for the
loop's duration — it is read-only reference material, never a write target. The write-containment
trap `007` already paid for applies here too: do not run the loop while an agent edits this tree.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Level:** 2 (Verification) — `recommend-level.sh --loc 0 --files 3` scores 5/100 at 75% confidence
(no code changes; this phase produces documents), which is below Level 2's own floor. Level 2 is
assigned by direct match to the research-shaped sibling `007-architecture-research`'s document
weight and to the acceptance-criteria/waiver discipline this phase's four criteria need, not by the
script's LOC/files heuristic, which was built for code phases. The script does not recommend a
higher level, so 007's precedent stands per dispatch instruction.
**Status:** Draft — nothing has been read from `obsidian-pm-main` by this phase yet.
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

Produce a cited, dispositioned catalog of UI/UX patterns from `obsidian-pm-main`, each naming the
packet that would adopt it and the license terms under which it may be adopted, so that packets 022,
031, 010, 023, 001/027 and 011 can consult one document instead of six independent reads of a
22,833-line tree.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A 20-iteration `/deep:research` loop reading `specs/context/obsidian-pm-main`, writing its state,
  deltas and per-iteration output into `research/` and `research/lineages/` inside this packet — see
  `plan.md` §4 for the reserved paths and the exact dispatch command.
- A synthesized pattern catalog at `research/research.md`, one row per harvested pattern, each row
  carrying: the `obsidian-pm` `file:line`, the adopting packet(s), the operator report(s) it answers
  where applicable, and a license note (borrowed pattern vs. borrowed code, per `goal.md` §3).
- Coverage of the eight named surface families: bottom sheets and overflow; per-row actions on a
  phone; the bulk-selection bar and its keyboard docking; the floating add control and inline editors;
  i18n plurals; list interaction; board interaction; calendar interaction; motion. (Nine families
  listed; the operator's phrasing groups list/board/calendar as one item — each is tracked separately
  in the catalog so a family with nothing worth harvesting says so rather than going unmentioned.)
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
| REQ-002 | `research/research.md` exists and carries ≥ 20 entries, each with a `file:line` citation, an adopting packet, and a license note. |
| REQ-003 | Each harvested entry's license note follows `goal.md` §3's borrowed-pattern / borrowed-code distinction; no entry recommends copying code without stating the MIT attribution requirement. |
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

- **SC-001**: `research/research.md` exists with ≥ 20 file:line-cited, packet-mapped, license-noted
  entries.
- **SC-002**: A 10-of-10 in-runtime spot-check passes against the catalog.
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
