---
title: "Implementation Summary: Screenshot Coverage Expansion"
description: "Placeholder record for a Planned phase. Nothing has been implemented; this file states the current coverage position and what a future summary will have to record."
trigger_phrases:
  - "coverage expansion implementation summary"
  - "screenshot coverage not started"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/004-coverage-expansion"
    last_updated_at: "2026-08-28T13:53:19.516Z"
    last_updated_by: "phase-author"
    recent_action: "Opened a placeholder record for a phase with no work done"
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
# Implementation Summary: Screenshot Coverage Expansion

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Metric | Value |
|---|---|
| **Phase Name** | 004-coverage-expansion |
| **Theme** | The surfaces not yet photographed |
| **Status** | Planned — not started |
| **Completion Pct** | 0% |
| **Requirements** | 17 defined (8 P0, 9 P1) |
| **Tasks** | 32 planned, 0 completed |
| **Target Deliverables** | 13 new scenarios, extended calendar and timeline geometry stand-ins, refreshed captures |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing. This phase has not been started.**

This file exists so the phase folder carries the same document set as its siblings, and so the coverage position is recorded somewhere durable rather than only in the parent's phase map.

### Current coverage position

| Group | Captured today |
|---|---|
| `views` | `table-view`, `board-view`, `gallery-view`, `list-view` |
| `components` | `table-column-header`, `add-view-popover`, `dropdown-field` |
| `states` | `empty-state` |

8 scenarios, 16 captures. Every other surface listed below has no picture, and a change to the code behind it stales nothing.

### Not yet photographed

- Calendar view — month grid and week time grid
- Timeline view
- Record detail panel
- Table record peek
- Filter panel
- Sort panel
- Toolbar and view switcher
- Mobile and bottom-sheet layouts
- Drag states
- Selection states
- Conditional formatting
- Grouped and swimlane boards

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. The plan sequences the work in three effort tiers: the surfaces the existing harness can already photograph, then the calendar and timeline geometry stand-ins, then the interaction-state fixtures — capturing after each tier rather than at the end, so no scenario sits registered and unphotographed.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

Decisions taken while scoping the phase, ahead of any implementation:

- **Sequence by effort, not by UI order.** The cheap surfaces go first because each one immediately widens what the freshness gate protects, and because they confirm the pattern before the expensive work starts.
- **Treat calendar and timeline as stand-in work, not markup work.** Their layout is geometry. The runtime stand-in declares 12 calendar and 23 timeline properties that no capture has ever exercised, so every one of them is currently an untested value.
- **Require a visual confirmation on the geometry-driven captures.** A wrong geometry value does not fail the run; it produces an image of a zero-height grid. No exit code catches that.
- **Take interaction-state classes from the renderer that applies them.** A hand-written state fixture can otherwise claim a state the code never produces, and naming that renderer under `sources` is what ties the capture to the code.
- **One representative capture per surface and per meaningfully different state.** Photographing every permutation produces a set nobody reviews, which defeats the purpose.
- **Position time markers from a fixed offset, never the clock.** A capture derived from `Date.now()` would differ on every run and stale itself.

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

None. No implementation has occurred.

<!-- /ANCHOR:deviations -->
---

<!-- ANCHOR:verification -->
## Verification

**No verification has been performed. Nothing is ticked in `checklist.md` and no task in `tasks.md` is complete.**

The gates this phase will have to pass:

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Unit test suite
npx vitest run

# 4. Capture, including every new scenario
npm run screenshots

# 5. Freshness gate — must report nothing under NEVER CAPTURED
npm run screenshots:verify
```

### Verification Checklist
- [ ] Tier 1 surfaces registered and captured: record detail panel, table record peek, filter panel, sort panel, toolbar, swimlane board.
- [ ] Calendar geometry values chosen and commented; month and week scenarios captured and looked at.
- [ ] Timeline geometry values chosen and commented; timeline scenario captured and looked at.
- [ ] Mobile bottom-sheet scenario captured at a phone-width viewport and looked at.
- [ ] Drag, selection and conditional-formatting states captured and compared against their resting counterparts.
- [ ] Every new scenario's source list confirmed by editing each named file in turn.
- [ ] `npm run screenshots:verify` exits 0 with nothing under `NEVER CAPTURED`.
- [ ] `npx tsc --noEmit` exit code 0.
- [ ] `npm run build` exit code 0.
- [ ] `npx vitest run` passes.
- [ ] Every new capture looked at against the running plugin.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| Requirement | Target | Verification Method | Status |
|---|---|---|---|
| **Capture Runtime** | A run someone will actually run | Time `npm run screenshots` after the phase | **Not started** |
| **Determinism** | No value derived from the clock | Source inspection of the new scenarios | **Not started** |
| **Documentation-Only** | 0 changes to `styles.css` or `src/` | Diff review | **Not started** |
| **Source-List Accuracy** | Each new capture stales on its own renderer | Edit each named file in turn | **Not started** |
| **Capture Fidelity** | Geometry-driven surfaces render plausibly | Looking at each capture | **Not started** |
| **Compilation & Bundle** | Clean `tsc` and `esbuild` | `npx tsc --noEmit`, `npm run build` | **Not started** |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

- **Coverage is partial and will stay partial until this phase runs.** Eleven surface areas have no capture, and the freshness gate cannot protect what it has no picture of.
- **The calendar and timeline geometry values in the runtime stand-in are untested.** They were written by auditing the plugin for JavaScript-set properties, not by capturing a calendar or a timeline. Any of them may turn out wrong the first time a scenario exercises it.
- **Even after this phase, captures will still render fixture markup rather than the real renderers**, so markup drift will remain something a person notices rather than something the run reports.
- **Interaction states captured from hand-encoded classes can drift from what the interaction actually applies.** Naming the applying renderer under `sources` limits the drift but does not detect it.
- **The number of states worth photographing is unsettled.** Hover and focus states are visually distinct but numerous; this phase covers drag, selection and conditional formatting only.

<!-- /ANCHOR:limitations -->
