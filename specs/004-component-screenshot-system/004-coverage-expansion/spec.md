---
title: "Feature Specification: Screenshot Coverage Expansion"
description: "The surfaces not yet photographed: calendar and timeline views, the record detail panel and table record peek, filter and sort panels, toolbar and view switcher, mobile and bottom-sheet layouts, drag and selection states, conditional formatting, and grouped and swimlane boards."
trigger_phrases:
  - "screenshot coverage expansion"
  - "calendar screenshot scenario"
  - "timeline screenshot scenario"
  - "record detail panel screenshot"
  - "filter sort panel screenshot"
  - "mobile bottom sheet screenshot"
  - "drag selection state screenshot"
  - "conditional formatting screenshot"
  - "swimlane board screenshot"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/004-coverage-expansion"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Scoped the uncaptured surfaces into requirements for a later phase"
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
# Feature Specification: Screenshot Coverage Expansion

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `003-freshness-enforcement`, successor none (latest phase).

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 1 |
| **Priority** | P2 |
| **Status** | Planned |
| **Created** | 2026-08-28 |
| **Branch** | `impl` |
| **Wave** | 2 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The screenshot system works and its coverage is partial. Eight scenarios are registered, producing 16 captures across four views, three components and one state. The plugin has considerably more surface than that, and every unphotographed surface is one the freshness gate cannot protect: a change to `CalendarRenderer.ts` today stales nothing, because no capture declares it.

The gap divides into three kinds, and they are not equally expensive.

1. **Surfaces the existing harness can already photograph.** The record detail panel, the table record peek, the filter and sort panels, the toolbar and view switcher, and the grouped and swimlane board layouts are all ordinary DOM against the shipped stylesheet. Each is a registry entry plus a capture run.
2. **Surfaces that need new harness stand-ins.** Calendar and timeline are geometry-driven. `tools/screenshots/runtime-vars.css` already declares 12 calendar and 23 timeline custom properties precisely because the plugin computes them from measured layout at runtime, and none of those values has ever been exercised by a capture. Getting a plausible month grid, week time grid or timeline band lane out of a static page means choosing values that produce a correct-looking surface and confirming they do — which is harder than writing the markup.
3. **States rather than surfaces.** Drag feedback, selection perimeters and conditional formatting are things a surface does, not places a user navigates to. Photographing them means building fixture markup already carrying the state classes the interaction would have applied.

### Purpose
Close the coverage gap so the gate protects the whole interface rather than a third of it:

- Register the **straightforward surfaces** first, since each is cheap and immediately widens what the gate covers.
- Do the **calendar and timeline** work deliberately, extending `runtime-vars.css` with values that make a static capture resemble the running view, and treating that stand-in work as the bulk of the effort.
- Register the **interaction states** as explicit fixtures carrying their state classes, so a regression in drag, selection or conditional formatting styling has a picture to fail against.
- Keep every new scenario honest about its `sources`, since an inaccurate list produces a capture that never goes stale.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **New scenarios in `tools/screenshots/scenarios.mjs`** for each surface listed under Requirements, each declaring `id`, `title`, `group`, `width`, `sources` and `html()`.
- **Extending `tools/screenshots/runtime-vars.css`** where a surface needs geometry values the current stand-in does not provide, or provides at a value that does not produce a plausible static rendering.
- **Per-scenario `captureCss`** where a surface anchors itself against something a capture does not have, following the existing constraint that an override may reveal a surface and never restyle it.
- **A capture run per change**, so no scenario is registered without images.
- **New group directories** if a surface does not fit `views`, `components` or `states`.

### Out of Scope
- Any change to plugin behaviour, rendering or styling. This phase photographs what exists.
- Changes to `capture.mjs` or `verify.mjs` beyond what a new scenario requires; the harness and the gate are settled.
- Pixel-diff comparison of the new captures.
- A structural check that fixture markup still matches the renderers. That gap is recorded in `003-freshness-enforcement`; closing it is not this phase's work.
- Photographing every permutation of every view. One representative capture per surface and per meaningfully different state.

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `tools/screenshots/scenarios.mjs` | Modify | One new entry per uncaptured surface, each with an accurate `sources` list |
| `tools/screenshots/runtime-vars.css` | Modify | Geometry values for the calendar and timeline stand-ins, and any further property a new surface reveals as missing |
| `screenshots/` | Modify | New PNGs, refreshed `manifest.json` and regenerated `README.md`, produced by `npm run screenshots` |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | The record detail panel is photographed | A `record-detail-panel` scenario in the `components` group declares `src/views/RecordDetailPanel.ts` under `sources`, renders the panel header, a populated property list and the empty-properties accordion, and produces a dark and a light capture. |
| REQ-002 | The table record peek is photographed | A `table-record-peek` scenario declares `src/views/TableRecordPeek.ts` under `sources` and renders the peek surface over a table context, so its elevation and framing are visible. |
| REQ-003 | The filter panel is photographed | A `filter-panel` scenario declares `src/views/FilterPanelRenderer.ts` under `sources` and renders a multi-rule form including a rule row, the conjunction control and the add-rule affordance. |
| REQ-004 | The sort panel is photographed | A `sort-panel` scenario declares `src/views/SortPanelRenderer.ts` under `sources` and renders at least two sort rules with their direction controls and drag handles. |
| REQ-005 | The toolbar and view switcher are photographed | A `toolbar` scenario declares `src/views/ToolbarRenderer.ts` under `sources` and renders the view tab strip with an active tab, the search field, and the control cluster. |
| REQ-006 | Grouped and swimlane board layouts are photographed | A `board-swimlanes` scenario declares `src/views/BoardRenderer.ts` under `sources` and renders a horizontal swimlane row spanning the primary columns with its collapsible header and counts, distinct from the existing flat `board-view` capture. |
| REQ-007 | Every new scenario is captured, not merely registered | `npm run screenshots:verify` exits 0 after the phase, reporting no entry under `NEVER CAPTURED`. |
| REQ-008 | Every new scenario declares an accurate source list | Each new entry names every renderer it depicts, so a change to that renderer stales the capture. Verified by editing each named source in turn and confirming the check names the expected captures. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria | Effort |
|---|---|---|---|
| REQ-009 | The calendar month view is photographed | A `calendar-month` scenario declares `src/views/CalendarRenderer.ts` under `sources` and renders a month grid with day cells, a multi-day event band and a `+N` overflow indicator. Requires the calendar geometry properties in `tools/screenshots/runtime-vars.css` to be set to values that produce a plausible static grid, and confirmed by looking at the capture. | **Higher** — depends on 12 runtime geometry properties never yet exercised |
| REQ-010 | The calendar week time grid is photographed | A `calendar-week` scenario declares `src/views/CalendarRenderer.ts` under `sources` and renders the time grid with the all-day row, hour ruler, a positioned event segment and the current-time line. | **Higher** — depends on the segment lane, span, start and day-count properties resolving together |
| REQ-011 | The timeline view is photographed | A `timeline-view` scenario declares `src/views/CalendarTimelineRenderer.ts` under `sources` and renders the group column, the unit ruler, at least two event bands on different rows, and the today marker. | **Higher** — depends on 23 runtime geometry properties never yet exercised |
| REQ-012 | Mobile and bottom-sheet layouts are photographed | A `mobile-bottom-sheet` scenario declares `src/views/PopoverPosition.ts` under `sources`, renders the sheet at a phone-width viewport with its handle, header and content, and carries the mobile bar height the layout depends on. | Medium — needs a narrow viewport and the mobile geometry properties |
| REQ-013 | Drag feedback is photographed | A `drag-states` scenario declares the drag surfaces it depicts under `sources` and renders a row or card mid-drag with its drop indicator line, using the state classes the interaction applies. | Medium — the state has to be built into the fixture |
| REQ-014 | Selection state is photographed | A `selection-states` scenario declares the selection surfaces it depicts under `sources` and renders a contiguous cell selection with its bounding perimeter, the corner fill handle and the selection action bar. | Medium — the state has to be built into the fixture |
| REQ-015 | Conditional formatting is photographed | A `conditional-formatting` scenario declares `src/data/ConditionalFormatting.ts` under `sources` and renders table rows carrying tinted backgrounds, readable foregrounds and the left accent indicator, exercising the `--db-conditional-format-*` properties the stand-in already supplies. | Medium — the stand-in values exist but have never been exercised |
| REQ-016 | New geometry stand-ins are recorded with their reasoning | Every value added to `tools/screenshots/runtime-vars.css` in this phase carries a comment stating what the running plugin would have measured and why the chosen value stands in for it. | Low |
| REQ-017 | Coverage is stated rather than implied | `screenshots/README.md`, regenerated by the capture, lists every registered scenario; the count of captures matches twice the number of registered scenarios. | Low |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Every view the plugin ships has at least one capture, including calendar and timeline.
- **SC-002**: Editing any renderer named in any scenario makes `npm run screenshots:verify` exit 1 naming that renderer's captures and no others.
- **SC-003**: The calendar and timeline captures show plausible geometry — populated day cells, a positioned event segment, bands on distinct rows — rather than zero-height or overlapping layout.
- **SC-004**: The three interaction states are visible as images, so a regression in drag, selection or conditional-formatting styling has a picture to fail against.
- **SC-005**: `npm run screenshots:verify` exits 0 with no scenario under `NEVER CAPTURED`.
- **SC-006**: Every geometry value added to the stand-in carries a comment explaining what it stands in for.
- **SC-007**: Documentation-only verified: the phase adds scenarios and stand-in values; zero changes to `styles.css`, `src/`, or plugin behaviour.

### Acceptance Scenarios

- **Scenario 1**: **Given** the phase is complete, **when** `src/views/CalendarRenderer.ts` is edited, **then** the check names the calendar captures, where today it names nothing.
- **Scenario 2**: **Given** the calendar month scenario, **when** it is captured, **then** the day cells have height, a multi-day band spans the days it should, and the `+N` indicator sits inside its cell.
- **Scenario 3**: **Given** the timeline scenario, **when** it is captured, **then** two event bands appear on different rows at different horizontal offsets rather than stacked at the origin.
- **Scenario 4**: **Given** the mobile bottom-sheet scenario at a phone-width viewport, **when** it is captured, **then** the sheet sits at the bottom of its frame with its handle and header visible.
- **Scenario 5**: **Given** a new scenario added but not captured, **when** the check runs, **then** it exits 1 with that id under `NEVER CAPTURED`, so the phase cannot close half-done.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | Calendar and timeline geometry may not resolve into a plausible static layout on the first attempt | Captures that succeed and show a zero-height or overlapping grid | Treat the stand-in work as the bulk of the effort; confirm by looking at each capture rather than by the run's exit code |
| Risk | Interaction-state fixtures encode state classes by hand | The fixture can claim a state the code never applies | Take each state class from the renderer that applies it, and name that renderer under `sources` so a change to it stales the capture |
| Risk | A new scenario with an incomplete `sources` list | A capture that never goes stale | REQ-008 requires editing each named source in turn and confirming the expected captures are named |
| Risk | More scenarios means a longer capture run and more images to review | Review fatigue leading to captures nobody looks at | One representative capture per surface and per meaningfully different state, rather than every permutation |
| Risk | A surface may need a `captureCss` that shades into restyling | A capture that documents the override | Hold the existing constraint: an override may give a surface height or flow, never change how it looks |
| Dependency | `tools/screenshots/runtime-vars.css` | Supplies the geometry the calendar and timeline surfaces read | Owned by `001-capture-harness`; extended here |
| Dependency | `tools/screenshots/scenarios.mjs` | Where every new scenario lands | Owned by `002-scenario-registry` |
| Dependency | `npm run screenshots:verify` | Confirms nothing is registered without being captured | Owned by `003-freshness-enforcement` |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Capture time grows linearly with scenario count; a run of roughly twenty scenarios in two themes stays a step someone will actually run.
- **NFR-P02**: No change to the freshness check's cost, which reads text files and never images.

### Security
- **NFR-S01**: No network access, no telemetry, no new dependency; the phase adds data and CSS values only.
- **NFR-S02**: Mock data only. No content from a real vault enters the repository.

### Reliability & Compatibility
- **NFR-R01**: Documentation-only and iCloud-safe: zero writes to note frontmatter or markdown bodies, and zero changes to `styles.css` or `src/`.
- **NFR-R02**: Every new scenario must be deterministic — no value derived from the clock, including the current-time line and the today marker, which are positioned from a fixed stand-in offset rather than from `Date.now()`.
- **NFR-R03**: The phase cannot close with a registered-but-uncaptured scenario, because the gate reports that as a failure.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **A month grid whose events overflow a day cell**: the `+N` indicator is the point of the capture, so the fixture must supply more events than the cell shows.
- **A timeline event that starts before the visible window**: the band should clip at the left edge rather than shift the ruler.
- **A swimlane with an empty column**: the lane must keep its row height so the horizontal baseline is visible.
- **A selection spanning the last visible column**: the fill handle must stay inside the table rather than overflowing it.
- **A conditional format on a row that is also selected**: the two backgrounds compose, and the capture should show which wins.

### Error Scenarios
- **A geometry property left at a value that produces zero height**: the capture succeeds and photographs an empty box. Only looking at the image catches this, which is why REQ-009 through REQ-011 require a visual confirmation.
- **A scenario registered without a capture run**: reported under `NEVER CAPTURED` and blocks the phase.
- **A `sources` entry naming a file that does not exist**: reported under `MISSING SOURCE` rather than silently ignored.

### Concurrent Operations
- **Two scenarios depicting the same renderer**: expected and correct — `board-view` and `board-swimlanes` both depict `BoardRenderer.ts`, and both should stale together.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- **Whether the mobile captures belong in a separate group.** A phone-width board is the same component at a different viewport, not a different component. A `mobile` group would read clearly in the index; reusing the existing groups keeps the surface-to-scenario mapping one to one. Unresolved.
- **How many interaction states are worth photographing.** Drag, selection and conditional formatting are the three with distinct visual treatments. Hover and focus states are also visually distinct but far more numerous, and capturing them one by one would produce a large set of near-identical images.
- **Whether the calendar needs day and year views as well as month and week.** The runtime stand-in carries properties for a week grid height and a month week height, suggesting at least two distinct geometries. Whether day and year are visually distinct enough to earn their own captures has not been settled.
- **Whether a timeline capture should show more than one scale.** The timeline supports several time scales driven by the same unit-width property. One capture at one scale may under-document it.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../003-freshness-enforcement/spec.md`](../003-freshness-enforcement/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
