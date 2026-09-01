---
title: "Feature Specification: Screenshot Scenario Registry"
description: "The catalogue of what gets photographed: eight scenarios across views, components and states, each declaring the source files it depicts, an optional note, an optional capture override, and hand-written fixture markup mirroring what the renderers emit against mock subscription rows."
trigger_phrases:
  - "screenshot scenario registry"
  - "scenarios.mjs"
  - "add a screenshot scenario"
  - "screenshot sources list"
  - "captureCss override"
  - "screenshot fixture markup"
  - "table-view board-view gallery-view"
  - "screenshot groups views components states"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/002-scenario-registry"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the shipped scenario registry against tools/screenshots/scenarios.mjs"
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
# Feature Specification: Screenshot Scenario Registry

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `001-capture-harness`, successor `003-freshness-enforcement`.

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-28 |
| **Branch** | `impl` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A harness that can photograph a page still needs to be told what to photograph, and three constraints shape the answer.

1. **The real renderers cannot be driven.** `TableRenderer`, `BoardRenderer`, `GalleryRenderer`, `ListRenderer` and the rest are Obsidian view components. They need a live `App`, a vault and a metadata cache before they will emit a single element. Standing all of that up inside a capture step would make the step heavy, slow, and dependent on a vault fixture that itself decays.
2. **A screenshot has to be tied to the code it depicts.** A picture with no recorded relationship to a source file cannot be checked for currency. Whatever the registry stores has to be enough for a later check to answer "which screenshots does this edit invalidate?".
3. **Some surfaces do not exist outside a live app.** The add-view popover positions itself absolutely against a toolbar. With no toolbar to anchor to, it leaves the flow and the capture box has no height, so the run succeeds and photographs nothing.

### Purpose
Give the harness a catalogue that is honest about all three:

- Write **fixture markup by hand**, mirroring the class structure the renderers emit, so the shipped stylesheet is what gets photographed and the capture runs anywhere with no vault.
- Make every scenario declare the **source files it depicts**, so a later check can map an edit to the exact captures it invalidates.
- Let a scenario declare a narrowly-scoped **`captureCss`** override for surfaces whose real positioning depends on an anchor a capture does not have.
- Group scenarios into **views, components and states**, so the output tree and the generated index read as documentation rather than as a flat pile of images.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **The scenario contract**: `id`, `title`, `group`, optional `width`, `sources`, optional `note`, optional `captureCss`, and an `html()` function returning the fixture markup (`tools/screenshots/scenarios.mjs:91-256`).
- **Eight scenarios** across three groups:
  - `views`: `table-view`, `board-view`, `gallery-view`, `list-view`
  - `components`: `table-column-header`, `add-view-popover`, `dropdown-field`
  - `states`: `empty-state`
- **Shared mock data**: five subscription rows with name, cost, billing cycle, payment method, renewal date and category (`tools/screenshots/scenarios.mjs:15-21`), and a six-column table schema with per-column property icons (`:23-30`).
- **Inline SVG stand-ins** for the Lucide icons the plugin injects at runtime: a vertical-ellipsis glyph for menu triggers and four property-type glyphs (`tools/screenshots/scenarios.mjs:32-42`).
- **Fixture builders** shared between scenarios: table header cells, table rows, board cards, board columns, and a badge helper (`tools/screenshots/scenarios.mjs:44-89`).
- **Per-scenario widths** chosen to frame the surface: 1100 for the full table and board, 900 for gallery and list, 720 for the empty state, 620 for the column header pair, 460 for the add-view popover, 380 for the dropdown.
- **Notes** on the three scenarios whose point is not self-evident from the image, carried through into the manifest and the generated index.
- **One capture override**, on `add-view-popover`, returning the popover to normal flow so the capture box has height.

### Out of Scope
- The capture mechanics that consume this registry, owned by `001-capture-harness`.
- The freshness check that reads the `sources` declared here, owned by `003-freshness-enforcement`.
- Surfaces with no scenario yet — calendar, timeline, record detail, peek, filter and sort panels, toolbar, mobile layouts, interaction states, conditional formatting, grouped and swimlane boards — owned by `004-coverage-expansion`.
- Driving the real renderers, or introducing a vault fixture.
- Any change to `styles.css` or to the renderers.

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `tools/screenshots/scenarios.mjs` | Create | Mock rows, column schema, icon stand-ins, shared fixture builders, and the eight-entry `SCENARIOS` export |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | Every scenario declares the source files it depicts | Each entry in `SCENARIOS` (`tools/screenshots/scenarios.mjs:91-256`) carries a non-empty `sources` array of fork-relative paths, so `capture.mjs` can fingerprint them and `verify.mjs` can map an edit to the captures it invalidates. |
| REQ-002 | Every scenario is addressable and groupable | Each entry declares a unique `id`, a human `title`, and a `group` of `views`, `components` or `states`; the harness composes the output path from `group` and `id`. |
| REQ-003 | Fixture markup mirrors the class structure the renderers emit | Each `html()` returns markup rooted at `.note-database-container` using the plugin's own class names, so the shipped stylesheet is what styles the capture. |
| REQ-004 | The catalogue runs with no vault, no `App` and no metadata cache | `tools/screenshots/scenarios.mjs` imports nothing from `src/` and nothing from `obsidian`; the mock rows at `:15-21` are plain objects. |
| REQ-005 | A surface that cannot render outside a live app can still be captured, without being restyled | `add-view-popover` declares `captureCss` (`tools/screenshots/scenarios.mjs:185-188`) restoring `position: static` and releasing `top`, `left` and `max-height` — layout only, no visual property. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-006 | Scenarios that need explanation carry it in the registry, not in a separate document | `table-column-header`, `add-view-popover` and `dropdown-field` declare a `note`; `capture.mjs` copies it into the manifest and the generated `screenshots/README.md`. |
| REQ-007 | Every view surface and every documented component has a scenario | The registry covers the four grid-style views, the column header affordance, the add-view popover, the dropdown, and the empty state — 8 scenarios, captured in 2 themes each. |
| REQ-008 | Mock data is shared rather than restated per scenario | `ROWS` and `COLUMNS` (`tools/screenshots/scenarios.mjs:15-30`) are declared once and consumed by the table, board, gallery and list scenarios. |
| REQ-009 | Icons the plugin injects at runtime have stand-ins, so no capture shows an empty button | `tools/screenshots/scenarios.mjs:32-42` declares a vertical-ellipsis glyph and four property-type glyphs as inline SVG, used by the table header, board header and add-view tile builders. |
| REQ-010 | Scenario widths frame the surface rather than defaulting | Seven of the eight scenarios declare an explicit `width`; the harness default of 900 applies only where that is the right frame. |
| REQ-011 | The reason the markup is hand-written is recorded where the markup lives | The header comment at `tools/screenshots/scenarios.mjs:1-13` states that the renderers need a live Obsidian `App`, vault and metadata cache, and that the cost of the fixture approach is markup drift. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npm run screenshots` produces one dark and one light capture for each of the eight scenarios, 16 images in total.
- **SC-002**: Each capture lands under the directory named by its group: `screenshots/views/`, `screenshots/components/`, `screenshots/states/`.
- **SC-003**: Every manifest entry lists the renderer sources its scenario depicts, and the generated index prints them under the image pair.
- **SC-004**: The add-view popover capture shows the popover with real height, its tiles and its form, rather than an empty box.
- **SC-005**: The column header capture shows both a short header and a deliberately long one, so truncation behaviour is visible in the image rather than asserted in prose.
- **SC-006**: The registry runs under plain Node with no Obsidian import and no vault present.
- **SC-007**: Documentation-only verified: the registry declares markup and data; it makes zero writes to note frontmatter or markdown bodies and adds no dependency.

### Acceptance Scenarios

- **Scenario 1**: **Given** the registry, **when** `capture.mjs` iterates it, **then** each entry supplies a `group` and an `id` that together determine the output path, with no scenario needing special handling in the harness.
- **Scenario 2**: **Given** the `table-column-header` scenario, **when** it is captured at 620px, **then** the short column shows its full name and the 220px-capped column shows an ellipsised name with the menu trigger still at full size.
- **Scenario 3**: **Given** the `add-view-popover` scenario, **when** its `captureCss` is applied after the plugin stylesheet, **then** the popover sits in normal flow and its tiles, form and footer action are all inside the captured box.
- **Scenario 4**: **Given** the `board-view` scenario, **when** `src/views/BoardRenderer.ts` is edited, **then** its two captures — and only those — are the ones the freshness check names, because they are the only entries declaring that source.
- **Scenario 5**: **Given** a new surface is added to the plugin, **when** no scenario is registered for it, **then** nothing in the registry changes and the gap is visible as an absence from `screenshots/README.md`.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | Fixture markup can drift from what the renderers emit | A capture shows a surface the code no longer produces, while the run still succeeds | Recorded as the standing cost of the approach at `tools/screenshots/scenarios.mjs:7-9`; drift surfaces as a screenshot that no longer matches the code rather than as a capture error |
| Risk | A `sources` list can be wrong or incomplete | The freshness check under-reports or over-reports which captures an edit invalidates | The header comment at `tools/screenshots/scenarios.mjs:11-12` states the obligation to keep it accurate; `capture.mjs:124` adds `styles.css` to every entry so stylesheet edits are never missed |
| Risk | `captureCss` could be used to make a broken surface look correct | A capture documents the override rather than the plugin | Constrained at `tools/screenshots/capture.mjs:51-54` and used exactly once, for layout only |
| Risk | Inline SVG stand-ins are not the icons Obsidian injects | Icon shape in a capture is approximate | The stand-ins mirror the Lucide glyphs by path; shape fidelity is not what these captures document |
| Dependency | `tools/screenshots/capture.mjs` | Consumes `SCENARIOS` and composes the page | Owned by `001-capture-harness` |
| Dependency | `tools/screenshots/verify.mjs` | Reads `SCENARIOS` to detect registered-but-never-captured entries | Owned by `003-freshness-enforcement` |
| Dependency | The renderer sources named in each `sources` list | Determine capture staleness | Read-only; the registry names them, it does not import them |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Scenario markup is produced by pure string-returning functions with no I/O, so the registry costs nothing measurable next to launching a browser.

### Security
- **NFR-S01**: No network access, no telemetry, no secrets; the registry is data and template strings.
- **NFR-S02**: No new dependency. The file imports nothing.

### Reliability & Compatibility
- **NFR-R01**: Documentation-only and iCloud-safe: zero writes of any kind; the registry is read by the harness and never writes itself.
- **NFR-R02**: Deterministic: the same registry produces the same markup on every run, because the mock rows are literals and no value is derived from the clock or the filesystem.
- **NFR-R03**: Portable: plain Node ESM with no Obsidian import, so the capture runs on a machine that has never had the plugin installed.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **A deliberately long column name**: `table-column-header` includes one capped at 220px specifically so the ellipsis path is photographed rather than described.
- **A board group with fewer cards than another**: the mock rows split three Business and two Personal, so the board capture shows columns of unequal height.
- **A gallery with fewer tiles than rows**: `gallery-view` slices the first four rows, framing the grid rather than filling it.
- **A disabled dropdown option**: `dropdown-field` includes an `aria-disabled` option with a `title`, so the dimmed-plus-tooltip treatment is visible.
- **A surface with no data at all**: `empty-state` is a scenario in its own right, in the `states` group.

### Error Scenarios
- **A scenario declaring a source that no longer exists**: the harness fingerprints it as `null` and the freshness check reports it as a missing source rather than crashing.
- **A scenario registered but never captured**: the freshness check reports it, which is the failure mode this registry is most likely to produce, because adding an entry and running the capture are separate steps.
- **A scenario whose `html()` throws**: the capture run fails loudly at composition time rather than writing a broken image.

### Concurrent Operations
- **Two scenarios sharing a source**: `table-view` and `table-column-header` both depict `ColumnHeaderController.ts`, and the four card views all depict `CardFieldRenderer.ts`; an edit to either correctly stales every capture that names it.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- **Markup drift has no automated detector.** The header comment at `tools/screenshots/scenarios.mjs:7-9` describes drift being caught by a structure check in `verify.mjs`, but no such check exists in the shipped `verify.mjs`; today drift is caught by a person noticing that a capture no longer resembles the code. Either the check should be built or the comment should be corrected.
- **Whether fixture markup should eventually be generated from the renderers.** Doing so would eliminate drift and would require standing up an Obsidian `App` stand-in. The current answer is no; it is worth revisiting if drift is ever observed in practice.
- **Scenario widths are hand-chosen.** They frame each surface well at present, but nothing ties a width to a breakpoint, so a responsive change could quietly move a surface out of the frame it was chosen for.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../001-capture-harness/spec.md`](../001-capture-harness/spec.md)
- **Successor Spec**: [`../003-freshness-enforcement/spec.md`](../003-freshness-enforcement/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
