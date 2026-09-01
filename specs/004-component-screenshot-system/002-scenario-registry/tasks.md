---
title: "Task Breakdown: Screenshot Scenario Registry"
description: "Task breakdown for the scenario catalogue: shared mock data, inline icon stand-ins, table and board fixture builders, eight registered scenarios across three groups, per-scenario source lists, notes, widths and one layout-only capture override."
trigger_phrases:
  - "scenario registry tasks"
  - "scenarios.mjs task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/002-scenario-registry"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the scenario registry task breakdown"
    next_safe_action: "Await orchestrator compiler, build, test and verify gates"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "screenshot-system-002"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Screenshot Scenario Registry

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Notation | Meaning | Time Estimate |
|---|---|---|
| `[S]` | Small task | < 30 minutes |
| `[M]` | Medium task | 30–90 minutes |
| `[L]` | Large task | > 90 minutes |
| `- [ ]` | Incomplete task (unstarted) | — |
| `- [/]` | In progress task | — |
| `- [x]` | Completed task | — |

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [S] Establish that the renderers cannot be driven from a capture step, and record the reason and the cost in the file header (`tools/screenshots/scenarios.mjs:1-13`) (REQ-003, REQ-011)
- [x] T002 [S] Fix the scenario field contract against both consumers: `capture.mjs` reads `id`, `title`, `group`, `width`, `sources`, `note`, `captureCss` and `html()`; `verify.mjs` reads `id` (REQ-001, REQ-002)
- [x] T003 [S] Take the fixture class names from the plugin's own markup contract rather than inventing them, so the shipped stylesheet matches (REQ-003) [EVIDENCE: 59 fixture classes, 0 absent from both `styles.css` and `src/`; guarded by src/views/ScreenshotFixtures.test.ts:41]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 [S] Declare the five mock subscription rows once, with name, cost, cycle, payment, renewal and category (`tools/screenshots/scenarios.mjs:15-21`) (REQ-008)
- [x] T005 [S] Declare the six-column schema with a property-type icon per column (`tools/screenshots/scenarios.mjs:23-30`) (REQ-008)
- [x] T006 [S] Add inline SVG stand-ins for the vertical-ellipsis menu glyph and the four property-type glyphs the plugin injects at runtime (`tools/screenshots/scenarios.mjs:32-42`) (REQ-009)
- [x] T007 [S] Add the badge helper used by the table rows and the board cards (`tools/screenshots/scenarios.mjs:44`) (REQ-008)
- [x] T008 [M] Build the table fixture builders emitting `.db-th-content`, the property icon, `.db-th-label` and the inline menu trigger, plus the row builder (`tools/screenshots/scenarios.mjs:46-67`) (REQ-003)
- [x] T009 [M] Build the board fixture builders emitting the column header, group toggle, `.db-board-header-text`, count and options button, plus the card builder (`tools/screenshots/scenarios.mjs:69-89`) (REQ-003)
- [x] T010 [S] Register `table-view` in the `views` group at 1100 wide, depicting the table renderer, the column header controller and the cell renderer (`tools/screenshots/scenarios.mjs:92-102`) (REQ-001, REQ-007)
- [x] T011 [S] Register `table-column-header` in `components` at 620 wide with a short column and a 220px-capped long one, so truncation is photographed rather than described (`tools/screenshots/scenarios.mjs:103-125`) (REQ-006, REQ-007)
- [x] T012 [S] Register `board-view` in `views` at 1100 wide with two groups of unequal size (`tools/screenshots/scenarios.mjs:126-139`) (REQ-001, REQ-007)
- [x] T013 [S] Register `gallery-view` in `views` at 900 wide over the first four mock rows (`tools/screenshots/scenarios.mjs:140-157`) (REQ-001, REQ-007)
- [x] T014 [S] Register `list-view` in `views` at 900 wide over all five mock rows (`tools/screenshots/scenarios.mjs:158-175`) (REQ-001, REQ-007)
- [x] T015 [M] Register `add-view-popover` in `components` at 460 wide with the form, four view-type tiles and the footer duplicate action (`tools/screenshots/scenarios.mjs:176-219`) (REQ-007)
- [x] T016 [S] Give `add-view-popover` a layout-only `captureCss` restoring `position: static` and releasing `top`, `left` and `max-height`, with the reason recorded beside it (`tools/screenshots/scenarios.mjs:183-188`) (REQ-005)
- [x] T017 [S] Register `dropdown-field` in `components` at 380 wide with a selected option and an `aria-disabled` option carrying a tooltip (`tools/screenshots/scenarios.mjs:220-237`) (REQ-006, REQ-007)
- [x] T018 [S] Register `empty-state` in the `states` group at 720 wide with a title, description and two actions (`tools/screenshots/scenarios.mjs:238-255`) (REQ-007)
- [x] T019 [S] Add a `note` to the three scenarios whose point is not evident from the image (`tools/screenshots/scenarios.mjs:109, 182, 226`) (REQ-006)
- [x] T020 [S] Set an explicit `width` on the seven scenarios whose framing differs from the harness default of 900 (REQ-010)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T021 [S] Confirm the file imports nothing, so the capture runs with no vault, no `App` and no metadata cache present (`grep -c "^import\|require(" tools/screenshots/scenarios.mjs` = 0) (REQ-004)
- [x] T022 [S] Confirm every registered scenario has a captured pair in the manifest (`screenshots/manifest.json` holds 16/16 entries for 8 ids across 2 themes) (REQ-001, REQ-007)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T023 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` — **not run in this session; the orchestrator verifies this gate**
- [ ] T024 [S] Run Vitest unit test suite `npx vitest run` — **not run in this session; the orchestrator verifies this gate**
- [ ] T025 [S] Run production bundle build `npm run build` — **not run in this session; the orchestrator verifies this gate**
- [ ] T026 [S] Run the freshness gate `npm run screenshots:verify` — **not run in this session; the orchestrator verifies this gate**
- [ ] T027 [S] Look at each of the 16 captures to confirm the fixture markup still resembles what the renderers emit — **not performed: requires a human looking at the images; markup drift does not fail the capture**

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | Every scenario declares the sources it depicts | T002, T010, T012, T013, T014, T022 |
| REQ-002 | Every scenario is addressable and groupable | T002 |
| REQ-003 | Fixture markup mirrors the renderers' class structure | T001, T003, T008, T009 |
| REQ-004 | The catalogue runs with no vault or `App` | T021 |
| REQ-005 | A surface needing a live anchor is captured without being restyled | T016 |
| REQ-006 | Scenarios needing explanation carry it in the registry | T011, T017, T019 |
| REQ-007 | Every view and documented component has a scenario | T010, T011, T012, T013, T014, T015, T017, T018, T022 |
| REQ-008 | Mock data is shared rather than restated | T004, T005, T007 |
| REQ-009 | Runtime-injected icons have stand-ins | T006 |
| REQ-010 | Scenario widths frame the surface | T020 |
| REQ-011 | The reason for hand-written markup is recorded in the file | T001 |

<!-- /ANCHOR:cross-refs -->
