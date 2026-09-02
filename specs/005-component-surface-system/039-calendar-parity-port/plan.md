---
title: "Implementation Plan: Calendar Parity Port"
description: "Merge verified milestone/date wording and a documented shared date-transaction seam into the existing calendar-renderer.ts; no source calendar file to port."
trigger_phrases:
  - "039 plan"
  - "calendar parity plan"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from 036's adoption plan; nothing has run"
    next_safe_action: "Observe the missing completion branch in renderMonth as the first red check"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Whether the shared date-transaction module lands here or in 037"
    answered_questions: []
---
# Implementation Plan: Calendar Parity Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER

Gate order from the catalog's Final adoption plan row 3 (`036-obsidian-pm-ui-harvest/research/research.md`
line 400): event adapter → month/week/day placement → drag/resize/quick-add → screenshot/accessibility
→ `npm run gate`.

1. **A check that fails on the current renderer (D3: observed red before green).** Write a harness
   assertion against the real `calendar-renderer.ts` mount that a completed-row event and an
   incomplete-row event render with the same styling today. Observe it pass as a description of the
   defect, i.e. confirm no distinction exists, before any edit changes that.
2. **Event adapter.** Extend the calendar event build path (`calendar-renderer.ts:239-293` and the
   week/day equivalents) to read the existing checkbox/status column value already available on
   `RowData`, adapting `ProjectOverviewView.ts:244-255`'s completed/next separation into local
   completion-aware styling. No new persistence format; the column is whatever the view already
   configures.
3. **Month/week/day placement.** Apply the completion-aware treatment and the header/date-language
   wording (REQ-003) across all three scales, verifying placement does not shift existing layout,
   overflow, or backlog behavior (REQ-005 boundary).
4. **Drag/resize/quick-add.** Re-run the existing move/resize/quick-add paths
   (`:1033-1156`, `:1488-1542`, `:1558-1642`, `:2070-2088`) unchanged, confirming the completion
   styling survives a drag/resize cycle without being dropped by the optimistic-update path
   (`safeUpdateEventDates`, `:195-210`).
5. **Shared date-transaction seam (REQ-006, P1).** Read whether `037-timeline-gantt-port` has
   already landed a shared date-transaction module in this checkout. If yes, adopt it as a caller
   rather than duplicating it. If no, document the seam in `spec.md` REQ-006's terms and land the
   module only if it does not collide with a module `037` creates concurrently; otherwise document
   only and defer.
6. **Empty-state/density wording (REQ-004).** Update `renderEmpty`/`EmptyStateRenderer.renderCard`
   and the backlog empty path copy toward the reference's calm density language, keeping the
   existing component and reasons.
7. **Screenshot/accessibility.** Recapture affected calendar screenshots and read every changed
   PNG; re-run ARIA/keyboard checks against `calendar-keyboard-navigation.ts:1-130`, unchanged in
   shape but re-verified against the new event styling.
8. **`npm run gate`.** Full gate from the final state, including `css-lane` and `comments` lanes.
<!-- /ANCHOR:summary -->

<!-- ANCHOR:architecture -->
## 2. EXTERNAL LANE ORDER (D14)

Per the parent goal's D14: (a) an initial pass through `cli-devin` on `deepseek-v4-flash-max` under
`--permission-mode dangerous`; (b) then `gpt-5.6-luna` at `model_reasoning_effort=xhigh` or `max`,
`service_tier=fast`, through `cli-codex` or `cli-opencode`; (c) in-runtime verification is
unchanged — a fresh agent runs `npm run gate` and `validate.sh --strict` itself, because sandboxed
and cloud lanes cannot reach Chrome. No browser number from a sandboxed or cloud lane is evidence.
Before composing any `cli-devin` or `cli-codex` prompt, read that CLI's own
`.opencode/skills/cli-external-orchestration/cli-*/SKILL.md` contract first.

## 3. STYLES.CSS LANE PROTOCOL

REQ-003 and REQ-004 touch `styles.css` density and empty-state tokens. Acquire the lane via
`tools/lane/css-lane.json` (holder + history entry) before editing; the gate's `css-lane` lane
refuses an unclaimed edit. Release only after a recapture that is READ, naming the changed captures
in a `reviewed` array — a partial recapture cannot satisfy the manifest. No other packet may edit
`styles.css` while this phase holds the lane.

## 4. SCREENSHOTS

Every screenshot touched by the completion-aware styling or the wording changes is recaptured in
full for its surface, never partially, and a human opens every changed PNG before the change is
reported done. `npm run screenshots:verify` exit 0 is necessary but not sufficient — it never opens
an image.
<!-- /ANCHOR:architecture -->

<!-- ANCHOR:testing -->
## 5. VERIFICATION

The budget is behavioral parity, not a performance number: a completed-row event is visually
distinct at all three scales, header wording carries the reference's date-scale intent, and no
requirement depends on a source calendar file that does not exist. `npm run gate` is the
authoritative final gate; a red lane's full output is read from `tools/lane/gate-logs/<lane>.log`.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:rollback -->
## 6. ROLLBACK

Every change in this phase is additive to an existing renderer: a completion-aware style branch, a
header string, an empty-state string. Reverting any one of them restores exactly today's rendering,
so rollback is a straight revert of the touched hunks with no data-shape change to roll back.
<!-- /ANCHOR:rollback -->

<!-- ANCHOR:quality-gates -->
## AI EXECUTION PROTOCOL

### Comment Hygiene (HARD BLOCK, reminder for the code phase)
No spec path, phase number, task id or requirement id belongs in any code comment this phase writes.
Write the durable why (e.g., why the styling reads a checkbox column) instead of a packet reference.

### Pre-Task Checklist
- [ ] Every check named below has been observed failing before it is trusted.
- [ ] Exit codes are read directly; a pipe makes `$?` the pipe's status.
- [ ] `styles.css` lane acquired before any edit to it.

### Execution Rules
1. Observe red before green; a check that never failed is not evidence.
2. Re-derive every claim from the tree, never from another document.
3. Regenerate metadata after any spec-doc edit in this folder.
4. Read whether `037` has landed a shared date-transaction module before creating one.

### Status Reporting Format
Task id, what ran, exit code read directly, and the observation that closes it. Shipped, verified
and operator-confirmed are distinct and not interchangeable.

### Blocked Task Protocol
Halt and report with evidence and the decision needed rather than routing around a blocker.
<!-- /ANCHOR:quality-gates -->
