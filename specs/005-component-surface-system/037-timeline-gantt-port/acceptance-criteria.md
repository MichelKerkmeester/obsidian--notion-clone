---
title: "Acceptance Criteria: Timeline/Gantt Port"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "timeline gantt port acceptance criteria"
  - "037 closure gate"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/037-timeline-gantt-port"
    last_updated_at: "2026-09-04T16:35:00Z"
    last_updated_by: "gantt-ac007-wording-amendment"
    recent_action: "Amended AC-007 verification cell; closed reviewer's 11 defects"
    next_safe_action: "Await a fresh AC-007 reviewer read"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "037-timeline-gantt-port"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Timeline/Gantt Port

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** `005-component-surface-system/037-timeline-gantt-port`
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
| AC-001 | REQ-001 | Given the module map in `spec.md` §3, When the port lands, Then every row's local seam matches the reference behavior it cites | Placement/teardown pass + screenshot read at all five zoom levels | Unmet | - |
| AC-002 | REQ-002 | Given a same-side, duplicate, missing-task, or cycle-forming link attempt, When the user completes the two-click link gesture, Then the seam rejects it and the model is unchanged | Unit test per rejection case (`calendar-interaction-model.ts`) | Unmet | - |
| AC-003 | REQ-003 | Given the pre-port renderer's visible-window/backlog/invalid-event/group-limit behavior, When the port lands, Then that behavior is unchanged and the reference's eager-SVG strategy is not present | Before/after behavioral diff + `npm run gate` | Unmet | - |
| AC-004 | REQ-004 | Given any code comment this phase writes, When reviewed, Then it carries no spec path, phase number, task id, or requirement id | `grep` scan of the changed diff + pre-commit hook | Unmet | - |
| AC-005 | REQ-005 | Given `styles.css` is lane-held, When `db-timeline-*` rules are edited, Then the lane was acquired first and released only after a read recapture naming the changed captures | `tools/lane/css-lane.json` history entry + `reviewed` array | Unmet | - |
| AC-006 | REQ-006 | Given the packet's full changed-file set, When `npm run gate` runs, Then it reports `gate: PASS` and exit 0, observed by a fresh in-runtime agent (not a delegate's self-report) | `npm run gate` output + exit code, read directly | Unmet | - |
| AC-007 | REQ-007 | Given `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`/`gantt.css` (added 2026-09-04), When the 1:1 leg pair lands, Then the timeline's DOM structure, class vocabulary, visual language, interactions, and row-height/unit-width defaults match the reference, and every named local extension renders default-off unless a setting is turned on | DOM-structure parity test + (amended 2026-09-04) two halves: **in-repo** — a fresh session that ran none of this packet's legs compares the recaptured captures against the reference SOURCE (`GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`/`gantt.css`) with pixel measurements; **operator** — the operator compares the two plugins side by side in the vault where both are installed, tracked as its own row in the parent `../roadmap.md` §4 and in this packet's `goal.md` operator rows, never ticked by an agent | Unmet — today's timeline renders `db-timeline-*` classes (not the reference's vocabulary), five scales at 60/100/80/15/4px unit-width defaults, a viewport-centred window, and a scale trigger button with sibling link buttons; a local rewrite, not a DOM/class copy. Left unmet for a final fresh read after the 2026-09-04 closing leg (`tasks.md` T039-T047) lands — that leg fixed eight code defects and three fixture defects the prior fresh reviewer found, but did not itself re-run the AC-007 read | - |

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

Not yet — every criterion above is `Unmet` in this document's own `Status` column, pending a pass that
reconciles it against the landed legs and open defect rows tracked in `goal.md` §3. AC-007 was added
2026-09-04 (`spec.md` REQ-007, operator directive) for the 1:1 reference-copy amendment and is `Unmet`
against today's observed baseline recorded in its row above; none of the seven rows has reached `Met` in
this document, per D3 (shipped, verified, and operator-confirmed are three states).

**Amendment 2026-09-04 (AC-007 wording, orchestrator decision, reversible default):** AC-007's
Verification cell originally read "fresh reviewer's side-by-side screenshot read", the same wording
`038-board-kanban-port`'s T12 carried before its own same-day amendment. Both assumed the vendored
reference ships its own screenshot files to compare against; `specs/context/obsidian-pm-main` carries
zero image files, so that half of the criterion cannot be met from this repo alone. Split into an
in-repo half (captures vs. the reference SOURCE, pixel-measured) and an operator half (the vault
side-by-side), mirroring the board packet's own amendment. This is a wording correction, not a
disposition change: AC-007 stays `Unmet`, and no row in this table is ticked by this amendment. The
operator half is recorded as its own never-tick row in the parent `../roadmap.md` §4 and in this
packet's `goal.md` operator rows, since the operator checklist builder reads phase `goal.md` files.
<!-- /ANCHOR:closure -->
