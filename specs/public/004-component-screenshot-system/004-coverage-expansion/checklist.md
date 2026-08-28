---
title: "Quality Checklist: Screenshot Coverage Expansion"
description: "Verification checklist for the coverage expansion phase. Nothing is ticked: the phase is Planned and no work has been done."
trigger_phrases:
  - "coverage expansion checklist"
  - "screenshot coverage verification"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/004-coverage-expansion"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Drafted the coverage checklist with every item unticked"
    next_safe_action: "Start with the surfaces needing no new harness stand-ins"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "screenshot-system-004"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Quality Checklist: Screenshot Coverage Expansion

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

This phase is **Planned**. No work has been done and no item is ticked. Every item below is a precondition for closing the phase, not a record of something achieved.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] The renderer file behind each uncaptured surface has been confirmed to exist, so every new `sources` list is accurate from the start
- [ ] CHK-002 [P0] The class names each fixture will use were read from the renderer that emits them, not inferred from the stylesheet
- [ ] CHK-003 [P0] The calendar and timeline geometry properties in the runtime stand-in were reviewed against what the plugin measures, and the placeholder values identified
- [ ] CHK-004 [P1] The state classes for drag, selection and conditional formatting were located in the renderers that apply them
- [ ] CHK-005 [P0] Baseline gates pass cleanly before the phase starts: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots:verify`

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-006 [P0] A `record-detail-panel` scenario is registered and captured, naming `src/views/RecordDetailPanel.ts`
- [ ] CHK-007 [P0] A `table-record-peek` scenario is registered and captured, naming `src/views/TableRecordPeek.ts`
- [ ] CHK-008 [P0] A `filter-panel` scenario is registered and captured, naming `src/views/FilterPanelRenderer.ts`
- [ ] CHK-009 [P0] A `sort-panel` scenario is registered and captured, naming `src/views/SortPanelRenderer.ts`
- [ ] CHK-010 [P0] A `toolbar` scenario is registered and captured, naming `src/views/ToolbarRenderer.ts`
- [ ] CHK-011 [P0] A `board-swimlanes` scenario is registered and captured, visually distinct from the existing flat board capture

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-012 [P1] The calendar geometry values were chosen against what the plugin measures, not left at placeholders, and each carries a comment stating what it stands in for
- [ ] CHK-013 [P1] A `calendar-month` scenario is registered and captured, and the capture was looked at: day cells have height, the multi-day band spans the days it should, the `+N` indicator sits inside its cell
- [ ] CHK-014 [P1] A `calendar-week` scenario is registered and captured, and the capture was looked at: the all-day row, hour ruler, a positioned event segment and the current-time line are all visible
- [ ] CHK-015 [P1] The timeline geometry values were chosen deliberately and each carries a comment stating what it stands in for
- [ ] CHK-016 [P1] A `timeline-view` scenario is registered and captured, and the capture was looked at: two bands sit on distinct rows at distinct horizontal offsets rather than stacked at the origin
- [ ] CHK-017 [P1] A `mobile-bottom-sheet` scenario is registered and captured at a phone-width viewport, and the capture was looked at: the sheet docks to the bottom of its frame with its handle visible

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Harness Completeness

- [ ] CHK-018 [P1] A `drag-states` scenario is registered and captured, showing a row or card mid-drag with its drop indicator line
- [ ] CHK-019 [P1] A `selection-states` scenario is registered and captured, showing the bounding perimeter, corner fill handle and selection action bar
- [ ] CHK-020 [P1] A `conditional-formatting` scenario is registered and captured, exercising the tinted background, readable foreground and left accent indicator
- [ ] CHK-021 [P1] Each state capture is visually distinct from its resting counterpart, confirmed by comparing the two images
- [ ] CHK-022 [P1] Every state class used in a fixture was taken from the renderer that applies it, and that renderer is named under `sources`

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-023 [P0] No scenario is registered without a capture: `npm run screenshots:verify` reports nothing under `NEVER CAPTURED`
- [ ] CHK-024 [P0] Every new scenario's source list is accurate, confirmed by editing each named file in turn and observing the check name exactly that scenario's captures
- [ ] CHK-025 [P0] No new capture is deterministic-unsafe: the current-time line and today marker are positioned from a fixed stand-in offset rather than the clock, and a re-run produces the same layout
- [ ] CHK-026 [P0] Documentation-only: zero changes to `styles.css`, zero changes under `src/`, zero writes to note frontmatter or markdown bodies
- [ ] CHK-027 [P0] No new dependency and no network access is introduced
- [ ] CHK-028 [P1] Mock data only; no content from a real vault enters the repository

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-029 [P1] Every geometry value added to the runtime stand-in carries a comment stating what the running plugin would have measured
- [ ] CHK-030 [P1] The regenerated `screenshots/README.md` lists every registered scenario, and the capture count is twice the scenario count
- [ ] CHK-031 [P1] Any `captureCss` added in this phase changes layout only and never a visual property
- [ ] CHK-032 [P1] Open judgement calls are recorded rather than silently resolved: the mobile grouping question, the number of interaction states worth capturing, whether calendar day and year views earn their own captures, and whether the timeline needs more than one scale

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-033 [P0] `npx tsc --noEmit` passes cleanly
- [ ] CHK-034 [P0] `npm run build` produces a clean bundle
- [ ] CHK-035 [P0] `npx vitest run` passes
- [ ] CHK-036 [P0] `npm run screenshots:verify` exits 0
- [ ] CHK-037 [P0] Every new capture has been looked at — the only check that catches a geometry value resolving to an empty box

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 5 | 0/5 | 5 |
| Coverage — Tier 1 | 6 | 0/6 | 6 |
| Coverage — Tier 2 | 6 | 0/6 | 6 |
| Coverage — Tier 3 | 5 | 0/5 | 5 |
| Integrity | 6 | 0/6 | 6 |
| Documentation | 4 | 0/4 | 4 |
| Gates | 5 | 0/5 | 5 |
| **Total** | **37** | **0/37** | **37** |

**Verification Date**: not started
**Verification**: This phase is Planned. No work has been done, so nothing is ticked. The 11 uncaptured surfaces it covers are named in `spec.md` under Requirements, with the calendar and timeline entries marked higher effort because they depend on 12 and 23 runtime geometry properties respectively that no capture has ever exercised.

<!-- /ANCHOR:summary -->
