---
title: "Implementation Plan: Screenshot Scenario Registry"
description: "Plan for the scenario catalogue: a declarative scenario contract, hand-written fixture markup against shared mock rows, per-scenario source lists driving the freshness check, and a narrowly-scoped capture override for surfaces that need a live anchor."
trigger_phrases:
  - "scenario registry plan"
  - "scenarios.mjs contract"
  - "fixture markup plan"
  - "screenshot sources contract"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/002-scenario-registry"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the scenario registry plan against the shipped scenarios file"
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
# Implementation Plan: Screenshot Scenario Registry

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | Node ESM (`.mjs`), HTML template strings, inline SVG |
| **Framework** | None. The file imports nothing — not `obsidian`, not anything under `src/` |
| **Storage** | None. The registry is data consumed by the harness |
| **Testing** | Exercised by `npm run screenshots`; the registered-but-uncaptured case is asserted by `npm run screenshots:verify` |

### Overview
The registry answers one question for the harness — what to photograph — and one question for the freshness check — which captures an edit invalidates. Everything in its design follows from keeping both answers cheap and honest.

**Fixture markup, not real renderers.** The plugin's renderers are Obsidian view components; they need a live `App`, a vault and a metadata cache before they emit anything. Standing that up inside a documentation step would make the capture heavy and would introduce a vault fixture that decays on its own. The registry instead writes markup by hand, mirroring the class structure the renderers emit, against mock subscription rows. The shipped stylesheet is still the thing being photographed — only the DOM is stood in for. The cost is explicit and recorded in the file: markup drift shows up as a screenshot that no longer resembles the code rather than as a capture failure.

**Sources as a first-class field.** Each scenario names the files it depicts. That list is what makes the whole system enforceable: the harness fingerprints those files at capture time, and the check compares the fingerprints later. A scenario that lies about its sources produces a capture that never goes stale, which is worse than no capture at all — hence the standing instruction to keep the list accurate.

**A narrow escape hatch.** One surface, the add-view popover, positions itself absolutely against a toolbar. There is no toolbar in a capture, so the popover leaves the flow and the capture box has no height; the run succeeds and photographs nothing. Rather than special-casing it in the harness, the scenario declares a `captureCss` block that returns it to normal flow. The contract is deliberately narrow: an override may make a surface visible, never change how it looks.

**Grouping as documentation structure.** `views`, `components` and `states` determine the output directory and the section headings in the generated index, so the folder of images reads as a document rather than a pile.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] The renderers' dependency on a live Obsidian `App` was established before choosing fixture markup over real rendering, and the trade recorded in the file header (`tools/screenshots/scenarios.mjs:1-13`).
- [x] The class names each fixture uses were taken from the plugin's own markup contract rather than invented, so the shipped stylesheet matches them.
- [x] The consumer contract was fixed first: `capture.mjs` reads `id`, `title`, `group`, `width`, `sources`, `note`, `captureCss` and `html()`, and `verify.mjs` reads `id`.
- [x] The one surface needing an override was identified by observing a capture that succeeded and photographed nothing.

### Definition of Done
- [x] Eight scenarios are registered across three groups.
- [x] Every scenario declares a non-empty `sources` array of fork-relative paths.
- [x] Every scenario's markup is rooted at `.note-database-container` and uses the plugin's class names.
- [x] Mock rows and the column schema are declared once and shared.
- [x] Runtime-injected icons have inline SVG stand-ins.
- [x] The three scenarios needing explanation carry a `note`.
- [x] Exactly one scenario declares a `captureCss`, and it changes layout only.
- [x] The file imports nothing, so the capture runs with no vault present.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots:verify` — **not run in this session; the orchestrator verifies these gates.**

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
**Declarative catalogue with shared builders.** Every scenario is a plain object; nothing about a scenario is special-cased in the harness. Markup that appears in more than one scenario is factored into a builder, so the table header shape is written once and consumed by both table scenarios.

### Key Components

| Component | Role |
|---|---|
| `ROWS` (`scenarios.mjs:15-21`) | Five mock subscription records shared by the table, board, gallery and list scenarios |
| `COLUMNS` (`scenarios.mjs:23-30`) | Six-column schema with a property-type icon per column |
| `dots`, `glyph`, `ICONS` (`scenarios.mjs:32-42`) | Inline SVG stand-ins for the Lucide icons the plugin injects at runtime |
| `pill` (`scenarios.mjs:44`) | Badge helper for select and status values |
| `tableHeader`, `tableRows` (`scenarios.mjs:46-67`) | Table fixture builders emitting `.db-th-content`, `.db-th-label` and the menu trigger |
| `boardCard`, `boardColumn` (`scenarios.mjs:69-89`) | Board fixture builders emitting the header row, count and options button |
| `SCENARIOS` (`scenarios.mjs:91-256`) | The exported eight-entry catalogue |

### Data Flow
`capture.mjs` imports `SCENARIOS`, filters it if `--only` was passed, and for each entry composes a page from `scenario.html()` plus `scenario.captureCss`, sizes the viewport from `scenario.width`, and writes the image to a path built from `scenario.group` and `scenario.id`. It then records `scenario.sources`, `scenario.title` and `scenario.note` into the manifest entry. `verify.mjs` imports the same export and compares its ids against the manifest to find scenarios that were registered but never captured.

### Scenario Inventory

| Group | Id | Width | Sources |
|---|---|---|---|
| views | `table-view` | 1100 | `TableRenderer.ts`, `ColumnHeaderController.ts`, `CellRenderer.ts` |
| views | `board-view` | 1100 | `BoardRenderer.ts`, `CardFieldRenderer.ts` |
| views | `gallery-view` | 900 | `GalleryRenderer.ts`, `CardFieldRenderer.ts` |
| views | `list-view` | 900 | `ListRenderer.ts`, `CardFieldRenderer.ts` |
| components | `table-column-header` | 620 | `ColumnHeaderController.ts` |
| components | `add-view-popover` | 460 | `ToolbarRenderer.ts` |
| components | `dropdown-field` | 380 | `DropdownField.ts` |
| states | `empty-state` | 720 | `EmptyStateRenderer.ts` |

### Mobile/iCloud Safety Notes
The registry is inert data. It performs no I/O, opens no file, touches no vault, and is never loaded by the plugin at runtime — only by the two scripts under `tools/screenshots/`.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Contract and Shared Data
Fix the scenario field contract against what the harness and the check need, then declare the mock rows, the column schema and the badge helper once.

### Phase 2: Icon Stand-Ins
Add inline SVG for the vertical ellipsis and the four property-type glyphs, so no captured button photographs empty where the plugin would inject a Lucide icon.

### Phase 3: View Scenarios
Build the table header and row builders, the board card and column builders, and register `table-view`, `board-view`, `gallery-view` and `list-view` with their renderer source lists.

### Phase 4: Component and State Scenarios
Register `table-column-header` with a short and a deliberately long column, `add-view-popover` with its layout-only override, `dropdown-field` with a disabled option, and `empty-state`.

### Phase 5: Notes and Widths
Add a `note` to the three scenarios whose point is not evident from the image, and set per-scenario widths that frame each surface.

### Phase 6: Verification
`npm run screenshots` then `npm run screenshots:verify`, plus the repository gates. Not runnable in this session; the orchestrator executes them.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The registry has no unit suite; it is data, and the assertions worth making about it are made by the tools that consume it.

| Property | How it is checked |
|---|---|
| Every scenario is capturable | `npm run screenshots` writes 16 images without a composition error |
| Every scenario is registered *and* captured | `npm run screenshots:verify` reports a registered-but-never-captured id as a failure |
| Source lists map edits to the right captures | Editing one renderer stales only the captures naming it |
| Fixture markup matches the stylesheet | Looking at the captured PNGs; a mismatch shows as an unstyled or misplaced element |
| The override reveals rather than restyles | Reading `captureCss` — it declares `position`, `top`, `left` and `max-height` only |

The registered-but-uncaptured case is worth calling out: adding a scenario and running the capture are separate steps, so it is the easiest mistake to make in this file, and it is the one the check catches most directly.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Notes |
|---|---|---|
| `tools/screenshots/capture.mjs` | Internal | Consumes the full scenario contract; owned by `001-capture-harness` |
| `tools/screenshots/verify.mjs` | Internal | Consumes `id` to detect uncaptured scenarios; owned by `003-freshness-enforcement` |
| `styles.css` class contract | Internal | The fixture markup has to use the plugin's class names or the capture shows nothing |
| Renderer sources named in `sources` | Internal | Named, never imported; they determine staleness |
| External packages | None | The file imports nothing |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Removing a scenario is a one-entry deletion plus a capture run to drop its images from the manifest and index. Removing the file entirely breaks both consuming scripts, which import `SCENARIOS` by name, so a rollback of this phase means rolling back the whole screenshot system. Reverting an individual scenario's markup is safe and self-contained: nothing else in the repository reads it.

<!-- /ANCHOR:rollback -->
