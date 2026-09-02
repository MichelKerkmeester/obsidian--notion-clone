---
title: "Acceptance Criteria: Obsidian PM UI Harvest"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "036 ac traceability"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/036-obsidian-pm-ui-harvest"
    last_updated_at: "2026-09-02T00:00:00Z"
    last_updated_by: "markdown-agent-scaffold"
    recent_action: "Authored the acceptance criteria ahead of the research loop; all rows Unmet"
    next_safe_action: "Dispatch the loop, then update each row with observed evidence"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
      - "plan.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-036-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Obsidian PM UI Harvest

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/036-obsidian-pm-ui-harvest
**Level:** 2
**Status:** Draft
**Date:** 2026-09-02
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-002, REQ-003 | Given the 20-iteration loop has run against `obsidian-pm-main`, When its synthesis pass completes, Then `research/research.md` exists with ≥ 20 entries, each carrying a `file:line` citation into `obsidian-pm-main`, an adopting packet among 022/031/010/023/001/027/011, and a license note per `goal.md` §3 | Open `research/research.md`, count rows, confirm all three fields present per row | Unmet | - |
| AC-002 | REQ-005 | Given the completed catalog, When each of operator reports 30-33 is cross-referenced against it, Then every report that names a covered surface has at least one harvested candidate addressing it | `acceptance-criteria.md` per-report table (to be added on completion), cross-checked against `../roadmap.md`'s report list | Unmet | - |
| AC-003 | REQ-001 | Given the loop is dispatched per `plan.md` §4, When it runs, Then it reaches 20 iterations total across its three lanes, or converges earlier with the reason recorded in each lane's `convergence-report.md` | `research/lineages/<lane>/convergence-report.md`, one per lane, iteration count and/or convergence reason read directly | Unmet | - |
| AC-004 | REQ-006 | Given the completed catalog, When 10 citations are selected at random and read in-runtime, Then all 10 `file:line` references exist in `obsidian-pm-main` and match what the catalog claims about them | Manual `Read` of the cited file at the cited line for 10 randomly selected rows, pass/fail recorded per citation | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Nothing has been read from `obsidian-pm-main` yet. All four criteria are `Unmet` because the
20-iteration research loop has not been dispatched. This document is written before the loop runs, as
directed, so its rows reflect the loop's target shape rather than an observed result.
<!-- /ANCHOR:closure -->
