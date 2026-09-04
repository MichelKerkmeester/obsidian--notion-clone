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
    last_updated_at: "2026-09-04T15:20:00Z"
    last_updated_by: "gantt-ac007-in-repo-confirmation"
    recent_action: "Confirmed AC-007's in-repo half MET (tasks.md T048); dispositioned P2-F/G/I"
    next_safe_action: "Await the operator's vault side-by-side compare"
    blockers:
      - "AC-007's operator half (roadmap.md §4 row 38, goal.md operator rows) can only be closed by the operator"
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
| AC-007 | REQ-007 | Given `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`/`gantt.css` (added 2026-09-04), When the 1:1 leg pair lands, Then the timeline's DOM structure, class vocabulary, visual language, interactions, and row-height/unit-width defaults match the reference, and every named local extension renders default-off unless a setting is turned on | DOM-structure parity test + (amended 2026-09-04) two halves: **in-repo** — a fresh session that ran none of this packet's legs compares the recaptured captures against the reference SOURCE (`GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`/`gantt.css`) with pixel measurements; **operator** — the operator compares the two plugins side by side in the vault where both are installed, tracked as its own row in the parent `../roadmap.md` §4 and in this packet's `goal.md` operator rows, never ticked by an agent | Unmet — **in-repo half MET 2026-09-04** (fresh reviewer, `30c4b746`, ran none of the gantt legs, `tasks.md` T048): 60 of 60 `pm-gantt-*` classes match the reference with zero divergence either direction; the copied CSS is byte-faithful (`gantt.css`'s 278 lines plus the widgets/utilities/table companion blocks); geometry measured from the recaptured screenshots matches the reference exactly — label column 280px desktop / 160px phone, row height 44px, header 56px, day-unit widths 44/22/9/5/2px, bar padding 8px, bar height 28px, corner radius 7px, milestone diamond 24px across, progress fill 62%, dependency-arrow marker 8x8 with `refX` 6 / `refY` 3; all seven of the prior closing leg's own tests still pass (39/39 across the four suites, tick parity 120/120), `npx tsc --noEmit` exit 0. Before-value for this same read: the first fresh read (`a00ad31`) found seventeen divergences (D1-D17); the second (`a78000c`) found two (P1-A, P1-B); this read found zero. **Still unmet overall** — the operator half (the operator's own vault side-by-side compare) has not run; tracked as row 38 in the parent `../roadmap.md` §4 and as an operator-only row in this packet's `goal.md`, never ticked by an agent, per D3 (shipped, verified, and operator-confirmed are three states) | - |

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

**Amendment 2026-09-04 (AC-007 in-repo confirmation):** a fresh reviewer (`30c4b746`, ran none of
this packet's legs) closed the in-repo half of the split above — zero divergence across 60/60
`pm-gantt-*` classes, a byte-faithful CSS copy, and geometry matching the reference exactly (full
evidence in the row above and `tasks.md` T048). This is a disposition change for the in-repo half
only: AC-007's `Status` cell stays `Unmet` in this table per D3, because the operator half (the
vault side-by-side compare, row 38 in the parent `../roadmap.md` §4) has not run. The same read
also surfaced two residual dispositions with no code change owed — invalid-date rows keeping a row
band and no bar (accepted adaptation, `tasks.md` T049) and the milestone label overpainting the
month-band label on the default render path (reference-faithful by construction, an operator
decision recorded as a new row 39 in `../roadmap.md` §4 and in `goal.md`'s operator rows,
`tasks.md` T050) — and one already-closed item, the per-band fixture month parity T047(b) had
already fixed (`tasks.md` T051).
<!-- /ANCHOR:closure -->
