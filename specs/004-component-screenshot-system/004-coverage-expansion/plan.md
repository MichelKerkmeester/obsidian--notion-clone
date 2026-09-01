---
title: "Implementation Plan: Screenshot Coverage Expansion"
description: "Plan for closing the screenshot coverage gap: register the surfaces the existing harness can already photograph, then extend the runtime geometry stand-in for calendar and timeline, then build the interaction-state fixtures, capturing after each group."
trigger_phrases:
  - "coverage expansion plan"
  - "calendar timeline stand-in plan"
  - "interaction state fixture plan"
  - "screenshot coverage sequencing"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/004-coverage-expansion"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Planned the coverage expansion in three effort tiers"
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
# Implementation Plan: Screenshot Coverage Expansion

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | Node ESM (`.mjs`), HTML template strings, CSS custom properties |
| **Framework** | The existing harness; no change to `capture.mjs` or `verify.mjs` |
| **Storage** | Writes only under `screenshots/`; no plugin code is touched |
| **Testing** | `npm run screenshots` per group, then `npm run screenshots:verify`, then looking at every new image |

### Overview
Coverage is the only part of the screenshot system still open. The work divides by effort, and the plan follows that division rather than the order the surfaces appear in the UI.

**Tier 1 — surfaces the harness can already photograph.** The record detail panel, the table record peek, the filter and sort panels, the toolbar and view switcher, and the swimlane board layout are ordinary DOM. Each is a registry entry plus a capture. Doing these first widens the gate's protection quickly and confirms the pattern before the hard work starts.

**Tier 2 — surfaces that need geometry stand-ins.** Calendar and timeline are the expensive ones, and the cost is not the markup. `tools/screenshots/runtime-vars.css` already declares 12 calendar properties and 23 timeline properties, all of which exist because the plugin computes them from measured layout at runtime. None has ever been exercised by a capture, so every one of them is currently an untested guess. Producing a plausible month grid, week time grid or timeline band means choosing values that resolve together and confirming visually that they do. The characteristic failure here is not an error; it is a capture that succeeds and shows an empty or overlapping box.

**Tier 3 — states rather than surfaces.** Drag feedback, selection perimeters and conditional formatting are things a surface does under interaction. A static capture has to encode the state classes the interaction would have applied. That is straightforward markup, but it carries a specific risk: a fixture can claim a state the code never applies. The mitigation is to take each class from the renderer that applies it and to name that renderer under `sources`, so the capture stales when that code changes.

Across all three tiers the same discipline holds: capture after every group rather than at the end, so no scenario sits registered and unphotographed, and look at each new image rather than trusting the exit code.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Each uncaptured surface has a named renderer confirmed to exist, so its `sources` list can be accurate from the start.
- [ ] The class names each fixture will use have been read from the renderer that emits them rather than inferred from the stylesheet.
- [ ] The calendar and timeline geometry properties in `tools/screenshots/runtime-vars.css` have been reviewed against what the plugin measures, so the stand-in values are chosen rather than guessed.
- [ ] The state classes for drag, selection and conditional formatting have been located in the renderers that apply them.

### Definition of Done
- [ ] Tier 1 surfaces are registered and captured: record detail panel, table record peek, filter panel, sort panel, toolbar, swimlane board.
- [ ] Tier 2 surfaces are registered and captured: calendar month, calendar week, timeline, mobile bottom sheet.
- [ ] Tier 3 states are registered and captured: drag, selection, conditional formatting.
- [ ] Every new scenario declares an accurate `sources` list, confirmed by editing each named file and observing which captures the check names.
- [ ] Every geometry value added to `runtime-vars.css` carries a comment stating what it stands in for.
- [ ] Every new capture has been looked at and shows a plausible surface rather than an empty box.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots:verify`.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
**Additive registration against an unchanged harness.** Nothing in `capture.mjs` or `verify.mjs` changes. A surface becomes documented by appearing in the registry with an accurate source list, and by any geometry it needs being present in the runtime stand-in.

### Effort Tiers

| Tier | Surfaces | Work | Effort |
|---|---|---|---|
| 1 | Record detail panel, table record peek, filter panel, sort panel, toolbar and view switcher, swimlane board | Fixture markup plus a `sources` list | Low each |
| 2 | Calendar month, calendar week, timeline, mobile and bottom-sheet layouts | Fixture markup plus new or corrected geometry stand-ins, confirmed visually | **Higher** |
| 3 | Drag states, selection states, conditional formatting | Fixture markup carrying the state classes the interaction applies | Medium each |

### Why Tier 2 Costs More

`tools/screenshots/runtime-vars.css` supplies the values the plugin normally measures from the live layout. For the surfaces already captured, only a handful of those values matter, and the sticky-header offset was the one whose absence produced a visible defect. Calendar and timeline are different in kind: their entire layout is geometry. Column width, row height, day-cell minimum height, week height, all-day row count, day count, segment lane, segment span and segment start all have to resolve together before a month grid or a week time grid looks like anything. The timeline adds unit count, unit width, row height, group column width, event row count, band start, band span, tick offset and several marker offsets on top of that.

None of these has been exercised. A capture with a wrong value does not fail — it produces an image of a zero-height grid or of bands stacked at the origin. That is why these requirements carry a visual confirmation rather than only an exit code.

### Data Flow
A new scenario is appended to `SCENARIOS`. `npm run screenshots` iterates it like any other, composes the page from the same four stylesheet blocks, and writes its images plus refreshed manifest and index. `npm run screenshots:verify` picks up the new ids automatically, and reports the scenario under `NEVER CAPTURED` if the capture step was skipped.

### Mobile/iCloud Safety Notes
Unchanged from the rest of the system: the phase adds registry data and CSS values, writes only under `screenshots/`, and touches no plugin code, no vault and no note.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Tier 1 Surfaces
Register the record detail panel, table record peek, filter panel, sort panel, toolbar and swimlane board, each with its renderer under `sources`. Capture and look at the six new pairs.

### Phase 2: Calendar Geometry
Review the calendar properties in the runtime stand-in against what the plugin measures, set values that produce a plausible grid, register the month and week scenarios, capture, and confirm visually that day cells have height and event segments are positioned.

### Phase 3: Timeline Geometry
The same for the timeline properties: register the timeline scenario with a group column, unit ruler, two bands on distinct rows and the today marker, capture, and confirm the bands are not stacked at the origin.

### Phase 4: Mobile Layouts
Register the mobile bottom-sheet scenario at a phone-width viewport with the mobile bar height the layout depends on, capture, and confirm the sheet docks to the bottom of its frame.

### Phase 5: Interaction States
Take the drag, selection and conditional-formatting state classes from the renderers that apply them, register the three scenarios, capture, and confirm each state is visually distinct from its resting counterpart.

### Phase 6: Source-List Confirmation
For each new scenario, edit every file it names and confirm `npm run screenshots:verify` names exactly the expected captures, then revert.

### Phase 7: Verification
`npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots:verify`, and a review of every new image.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Two checks matter here, and only one of them is automatable.

**The automatable one** is the freshness gate. After the phase, editing any renderer named by any scenario must make `npm run screenshots:verify` exit 1 naming exactly that renderer's captures. Running that per new scenario is what proves the `sources` lists are accurate, which is the property the whole gate rests on. The negative control already established the mechanism works; this phase extends it to every new entry.

**The non-automatable one** is looking at the images. Tier 2 in particular fails silently: a geometry value that resolves to zero produces a successful run and an empty box. No exit code catches that. Each calendar, timeline and mobile capture has to be inspected against the running plugin before it is accepted.

| Property | How it is checked |
|---|---|
| A new scenario is registered and captured | `npm run screenshots:verify` reports nothing under `NEVER CAPTURED` |
| A new scenario's source list is accurate | Edit each named file in turn; the check names exactly that scenario's captures |
| Calendar geometry resolves | Look at the month and week captures: day cells have height, segments are positioned |
| Timeline geometry resolves | Look at the timeline capture: bands on distinct rows at distinct offsets |
| Mobile layout resolves | Look at the sheet capture at phone width: docked to the bottom, handle visible |
| Interaction states are distinct | Compare each state capture against its resting counterpart |
| Determinism | Re-run the capture; the current-time line and today marker sit at the same offsets |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Notes |
|---|---|---|
| `tools/screenshots/scenarios.mjs` | Internal | Every new scenario lands here; owned by `002-scenario-registry` |
| `tools/screenshots/runtime-vars.css` | Internal | Extended for calendar, timeline and mobile geometry; owned by `001-capture-harness` |
| `tools/screenshots/capture.mjs` | Internal | Unchanged; consumes the new entries like any other |
| `tools/screenshots/verify.mjs` | Internal | Unchanged; picks up new ids automatically |
| `src/views/CalendarRenderer.ts` | Internal | Named as a source; read to take class names, never edited |
| `src/views/CalendarTimelineRenderer.ts` | Internal | Named as a source for the timeline scenario |
| `src/views/RecordDetailPanel.ts`, `src/views/TableRecordPeek.ts` | Internal | Named as sources for the detail and peek scenarios |
| `src/views/FilterPanelRenderer.ts`, `src/views/SortPanelRenderer.ts` | Internal | Named as sources for the panel scenarios |
| `src/views/ToolbarRenderer.ts` | Internal | Already named by `add-view-popover`; gains a second scenario |
| `src/views/PopoverPosition.ts` | Internal | Named as the source for the mobile bottom-sheet scenario |
| `src/data/ConditionalFormatting.ts` | Internal | Named as the source for the conditional-formatting scenario |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Every change is additive: new entries in the registry, new values in the runtime stand-in, new images under `screenshots/`. Removing a scenario and re-running the capture returns the system to its prior state, and the freshness gate stays consistent throughout because the manifest is rewritten on each full run. Rolling back a geometry value is safe for the already-captured surfaces only if that value was newly added rather than corrected; a corrected value has to be checked against the existing captures before it is reverted.

<!-- /ANCHOR:rollback -->
