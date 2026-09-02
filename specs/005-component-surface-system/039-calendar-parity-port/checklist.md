---
title: "Verification Checklist: Calendar Parity Port"
description: "Verification items for 039-calendar-parity-port, each carrying an evidence column that records the failing state as well as the passing one."
trigger_phrases:
  - "039 checklist"
  - "calendar parity checklist"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Checklist cut alongside the spec; nothing verified yet"
    next_safe_action: "CHK-001 — read the catalog and this packet's cited lines before any source file is opened"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039-checklist"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Calendar Parity Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

An item is ticked only when it was verified by reading the tree or by reading a command's output
and exit status directly. Every item below is unticked. Nothing in this phase has run.
<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-001 | P0 | `036-obsidian-pm-ui-harvest/research/research.md` §3 CALENDAR and this packet's `spec.md` §2 read before any source file was opened | |
| [ ] | CHK-002 | P0 | `src/views/calendar-renderer.ts` read in full for the cited line ranges before any edit | |
| [ ] | CHK-003 | P0 | The serialized `styles.css` lane is free, or acquired via `tools/lane/css-lane.json` | |
| [ ] | CHK-004 | P0 | Baseline captured: `renderMonth` observed to render completed and incomplete events identically, before any edit | |
<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:negative-evidence -->
## Negative-Evidence Discipline

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-010 | P0 | `types.ts:4-11` re-read; `ViewMode` still stops at table/gantt/kanban | |
| [ ] | CHK-011 | P0 | `YamlHydrator.ts:51-76` re-read; hydrates only table/gantt/kanban saved views | |
| [ ] | CHK-012 | P0 | `ProjectView.ts:403-419` re-read; switches only among overview/table/Gantt/board | |
| [ ] | CHK-013 | P0 | No code comment or doc claim in this phase's output asserts a reference calendar file was ported | |
<!-- /ANCHOR:negative-evidence -->
---

<!-- ANCHOR:criteria -->
## Acceptance Criteria

Each row closes on a before/after state. The failing state is written into `acceptance-criteria.md`
before the fix.

| | ID | Pri | Criterion | Failing state (before) | Passing state (after) |
|---|---|---|---|---|---|
| [ ] | CHK-020 | P0 | **AC-1** completed vs incomplete event styling distinct, month/week/day | identical styling | |
| [ ] | CHK-021 | P0 | **AC-2** backlog/unscheduled marker matches scheduled completion treatment | undifferentiated | |
| [ ] | CHK-022 | P0 | **AC-3** header/date-scale wording carries reference intent, structure unchanged | uncompared | |
| [ ] | CHK-023 | P0 | **AC-4** empty-state/backlog copy reads with reference density language | uncompared | |
| [ ] | CHK-024 | P0 | **AC-6** completion marker survives a drag/resize cycle | not applicable yet | |
| [ ] | CHK-025 | P1 | **AC-7** shared date-transaction seam documented; module landed only if no collision with `037` | not started | |
<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:harness -->
## Harness Honesty

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-030 | P0 | Every check demonstrated to fail on the current tree before it is trusted | |
| [ ] | CHK-031 | P0 | The calendar is rendered by the real `calendar-renderer.ts` at its production mount point, not from fixture markup | |
| [ ] | CHK-032 | P0 | No criterion closed on a `styles.css` string match | |
| [ ] | CHK-033 | P0 | No DOM assertion added to a vitest suite — the runner has no jsdom | |
<!-- /ANCHOR:harness -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-040 | P0 | `npx tsc --noEmit` exit 0, no output, read without a pipe | |
| [ ] | CHK-041 | P0 | `npm run build` exit 0 | |
| [ ] | CHK-042 | P0 | `npm test` all passing from the final state | |
| [ ] | CHK-043 | P0 | No spec path, requirement id, task id or phase number in any code comment | |
| [ ] | CHK-044 | P1 | No verbatim reference code or CSS copied; every disposition stays `rewrite` | |
| [ ] | CHK-045 | P1 | Lint at the existing baseline, not above | |
<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:visual -->
## Visual Verification

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-060 | P0 | Full calendar screenshot recapture — partial recapture cannot satisfy the manifest | |
| [ ] | CHK-061 | P0 | `npm run screenshots:verify` exit 0 | |
| [ ] | CHK-062 | P0 | A human opened every changed calendar PNG, month/week/day, both viewports | |
| [ ] | CHK-063 | P0 | `styles.css` lane released only after a recapture that is read, with a `reviewed` array | |
<!-- /ANCHOR:visual -->
---

<!-- ANCHOR:gate -->
## Gate

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-070 | P0 | `npm run gate` prints `gate: PASS` and exits 0 | |
| [ ] | CHK-071 | P0 | `css-lane` and `comments` lanes both pass | |
| [ ] | CHK-072 | P0 | Any red lane's full output read from `tools/lane/gate-logs/<lane>.log` | |
<!-- /ANCHOR:gate -->
---

<!-- ANCHOR:operator -->
## Operator-Only

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-080 | P0 | Operator confirms a completed milestone reads as completed in the calendar, on device | |
<!-- /ANCHOR:operator -->
