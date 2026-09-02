---
title: "Goal: Timeline/Gantt Port"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "timeline gantt port goal"
  - "037 goal"
  - "037 timeline gantt port directive"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/037-timeline-gantt-port"
    last_updated_at: "2026-09-02T23:55:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Authored the durable directive and closure gate for the timeline port"
    next_safe_action: "Observe the dependency-link seam failing on the current renderer (tasks.md T001)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "037-timeline-gantt-port"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Whether the dependency-link seam persists as note frontmatter or a derived/computed field"
    answered_questions: []
---
# Goal: Timeline/Gantt Port

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Port obsidian-pm-main's timeline/Gantt geometry, scale controls, header/grid, bars, drag and
dependency-link UX near one-to-one into `calendar-timeline-renderer.ts`, rewritten to this repo's
`RowData`/`ViewConfig`/action contracts and `db-*` CSS lane, keeping table view, sheets, and
formulas/rollups/calcs local.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | This is a near-1:1 behavior port, not an inspiration harvest — every module-map row in `spec.md` §3 is rewritten (never copied) with a cited ref file:line and a verified local file:line. |
| D2 | Table view, bottom sheets, and formulas/rollups/calcs stay ours; the reference's eager-SVG-height rendering strategy is dropped, per `036-obsidian-pm-ui-harvest/research/research.md:375`. |
| D3 | Shipped, verified, and operator-confirmed are three states; only the third closes a row. This packet's own closure needs `npm run gate` observed green by a fresh in-runtime agent, not a delegate's report. |
| D4 | The dependency-link seam is new local surface — no local dependency renderer exists before this packet — and must reject same-side, duplicate, missing-task, and cycle links, matching `GanttLinkHandler.ts:56-67`, `:77-97`. |
| D5 | External lane order follows the parent goal's D14: (a) `cli-devin` `deepseek-v4-flash-max`, (b) `gpt-5.6-luna` via `cli-codex`/`cli-opencode`, (c) in-runtime fresh verifier runs the browser gate and `validate.sh` itself. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Every module-map row in `spec.md` §3 rewritten and matching its cited reference behavior, observed by
      placement/teardown pass and a screenshot read at all five zoom levels — currently 0 of 17 rows ported.
- [ ] The dependency-link seam rejects same-side, duplicate, missing-task, and cycle links, each with a unit
      test observed passing — currently no seam exists (T001's red baseline).
- [ ] Local visible-window rendering, unscheduled backlog, invalid-event repair, and group/lane limits are
      unchanged after the port — no regression observed in a before/after diff.
- [ ] `styles.css` `db-timeline-*` rules reconciled under an acquired-and-released `css-lane` hold, with a
      `reviewed` array naming the recaptured screenshots.
- [ ] `npm run gate` reports `gate: PASS` and exit 0, observed by a fresh in-runtime agent per D14 leg (c).
- [ ] `validate.sh specs/005-component-surface-system/037-timeline-gantt-port --strict` first `RESULT:` line
      is `PASSED`.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet scaffolded (spec.md, plan.md, tasks.md, acceptance-criteria.md, goal.md) | Done | This write, 2026-09-02 |
| Port implementation | Pending | Not started; `tasks.md` T001 is the next safe action |

### Deviations and findings

| Item | Note |
|------|------|
| `research/research.md:109`'s CSS citation (`gantt.css:1-17` -> `styles.css:17126-17133`) | Verified wrong on direct read: `:17126-17133` resolves to `.db-timeline-group-toggle` hover CSS, not timeline-unit CSS variables. The actual `--db-timeline-unit-width`/`--db-timeline-content-width` definitions are at `styles.css:16759-16760`. Corrected in `spec.md` §3; the parent catalog is not edited by this packet. |
| No standalone `checklist.md` template exists in this repo's `system-spec-kit` Level 2 template set (confirmed against sibling packets `029-numeric-coercion-parity` and `033-list-virtualisation`, neither of which carries one) | `tasks.md`'s own Verification Checklist (CHK-xxx rows) serves that function instead of fabricating an unsupported file. |
<!-- /ANCHOR:log -->
