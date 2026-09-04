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
    last_updated_at: "2026-09-04T07:35:00Z"
    last_updated_by: "gantt-1to1-amendment"
    recent_action: "Added AC-007 for the operator's 1:1 gantt copy directive"
    next_safe_action: "Dispatch devin leg: port GanttView 1:1"
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
| AC-007 | REQ-007 | Given `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`/`gantt.css` (added 2026-09-04), When the 1:1 leg pair lands, Then the timeline's DOM structure, class vocabulary, visual language, interactions, and row-height/unit-width defaults match the reference, and every named local extension renders default-off unless a setting is turned on | DOM-structure parity test + fresh reviewer's side-by-side screenshot read | Unmet — today's timeline renders `db-timeline-*` classes (not the reference's vocabulary), five scales at 60/100/80/15/4px unit-width defaults, a viewport-centred window, and a scale trigger button with sibling link buttons; a local rewrite, not a DOM/class copy | - |

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
<!-- /ANCHOR:closure -->
