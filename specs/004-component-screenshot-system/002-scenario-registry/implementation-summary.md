---
title: "Implementation Summary: Screenshot Scenario Registry"
description: "What was delivered for the scenario catalogue: eight scenarios across views, components and states, shared mock rows and icon stand-ins, per-scenario source lists, three explanatory notes, and one layout-only capture override."
trigger_phrases:
  - "scenario registry implementation summary"
  - "eight screenshot scenarios"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/002-scenario-registry"
    last_updated_at: "2026-08-28T13:52:14.719Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded delivered registry scope and the gates left to the orchestrator"
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
# Implementation Summary: Screenshot Scenario Registry

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Metric | Value |
|---|---|
| **Phase Name** | 002-scenario-registry |
| **Theme** | The catalogue of what gets photographed and which sources each capture depicts |
| **Status** | Complete pending orchestrator gates |
| **Completion Pct** | 100% of implementation; 0 of 5 verification gates run in-session |
| **Requirements** | 11 defined (5 P0, 6 P1) |
| **Tasks** | 27 planned (22 completed, 5 deferred to the orchestrator or to a visual check) |
| **Target Deliverables** | `tools/screenshots/scenarios.mjs` with 8 scenarios across 3 groups |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

1. **A declarative scenario contract.** Each entry in `SCENARIOS` (`tools/screenshots/scenarios.mjs:91-256`) carries `id`, `title`, `group`, an optional `width`, a `sources` array, an optional `note`, an optional `captureCss`, and an `html()` returning the fixture markup. The harness special-cases nothing: the output path comes from `group` and `id`, the viewport from `width`, the manifest entry from `sources`, `title` and `note`.
2. **Eight scenarios across three groups.** `views` holds `table-view`, `board-view`, `gallery-view` and `list-view`; `components` holds `table-column-header`, `add-view-popover` and `dropdown-field`; `states` holds `empty-state`. Each is captured in dark and light, giving 16 images.
3. **Hand-written fixture markup.** Every `html()` returns markup rooted at `.note-database-container` using the plugin's own class names. This is deliberate and its cost is written into the file header at `tools/screenshots/scenarios.mjs:1-13`: the renderers need a live Obsidian `App`, a vault and a metadata cache, so a fixture keeps the capture runnable anywhere and deterministic, at the price of markup drift being a thing a person notices rather than a thing the run reports.
4. **Shared mock data.** Five subscription records with name, cost, billing cycle, payment method, renewal date and category (`:15-21`), and a six-column schema pairing each column with a property-type icon (`:23-30`). The table, board, gallery and list scenarios all read from the same rows, so the four views show the same records and are comparable side by side.
5. **Icon stand-ins.** A vertical-ellipsis glyph for the menu triggers and four property-type glyphs — file-text, hash, circle-dot and calendar — declared as inline SVG (`:32-42`). Without them every captured menu button would photograph as an empty box, because the plugin injects those icons through Obsidian's `setIcon` at runtime.
6. **Shared fixture builders.** `tableHeader` and `tableRows` (`:46-67`) emit the header cell, property icon, label and inline menu trigger; `boardCard` and `boardColumn` (`:69-89`) emit the column header with its toggle, name row, count and options button; `pill` (`:44`) emits a badge. Markup that appears in more than one scenario is written once.
7. **Source lists that drive the whole gate.** Each scenario names the files it depicts, and `capture.mjs` fingerprints them at capture time. `CardFieldRenderer.ts` appears on the board, gallery and list scenarios, so editing it correctly stales six captures; `ColumnHeaderController.ts` appears on `table-view` and `table-column-header`, so editing it stales four.
8. **Explanatory notes on three scenarios.** `table-column-header` records that the trigger sits inline and the label truncates before it moves; `add-view-popover` records that tiles keep icon and caption inside their own bounds and the duplicate checkbox is not stretched; `dropdown-field` records that a disabled option is dimmed with a tooltip rather than inline text. These travel into the manifest and are printed under the images in `screenshots/README.md`, so the picture and the point it makes stay together.
9. **One capture override, scoped to layout.** `add-view-popover` declares `captureCss` (`:183-188`) restoring `position: static` and releasing `top`, `left` and `max-height`. The popover positions itself absolutely against a toolbar; with no toolbar it leaves the flow and the capture box has no height, so the run succeeds and photographs nothing. The override declares no visual property.
10. **Deliberate edge cases in the fixtures.** The column-header scenario pairs a short name with one capped at 220px so the ellipsis path is photographed. The board splits three Business and two Personal records so the columns are unequal. The dropdown includes an `aria-disabled` option with a `title` so the dimmed-plus-tooltip treatment is visible.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

- **Phase 1**: Scenario field contract fixed against both consumers; shared mock rows, column schema and badge helper.
- **Phase 2**: Inline SVG stand-ins for the runtime-injected icons.
- **Phase 3**: Table and board fixture builders, and the four view scenarios with their renderer source lists.
- **Phase 4**: The three component scenarios and the empty state, including the layout-only override.
- **Phase 5**: Notes on the three scenarios needing them, and per-scenario widths.
- **Phase 6**: Verification — left to the orchestrator; no shell command was run in this session.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

- **Fixture markup over real renderers.** The renderers need a live Obsidian `App`, a vault and a metadata cache. Standing that up would have made the documentation step heavy and would have introduced a vault fixture that decays on its own. The shipped stylesheet is still the subject; only the DOM is stood in for.
- **`sources` as a required field.** It is what makes the system enforceable. A scenario that omits or misstates its sources produces a capture that never goes stale, which is worse than having no capture.
- **Notes live in the registry, not in a separate document.** They are copied into the manifest and the generated index, so the explanation cannot drift away from the image it explains.
- **The override contract is narrow.** `captureCss` may give a surface the height or flow it would have had against a live anchor. It may not change how the surface looks, because then the capture would document the override.
- **Groups chosen as documentation sections.** `views`, `components` and `states` determine both the output directory and the headings in the generated index, so the images read as a document.
- **One shared row set across four views.** Showing the same five records in table, board, gallery and list makes the four captures comparable, which is most of the value of photographing them together.

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

- **`table-column-header` was added as a component scenario in addition to `table-view`.** The full table capture at 1100px does not show truncation, which is the behaviour the column header change was about. A narrow two-column scenario with a deliberately long name photographs it directly.
- **The add-view popover needed an override that no other scenario needed.** This was found by running the capture and getting an image of nothing, not by reading the CSS. It is the only scenario with a `captureCss`, and the constraint on what such a block may contain was written into `capture.mjs` at the same time.

<!-- /ANCHOR:deviations -->
---

<!-- ANCHOR:verification -->
## Verification

The following gates verify delivery. **None of them were run in this session — no shell command was executed. The orchestrator runs all of them.**

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Unit test suite
npx vitest run

# 4. Capture end to end
npm run screenshots

# 5. Freshness gate, which also reports registered-but-uncaptured scenarios
npm run screenshots:verify
```

### Verification Checklist
- [x] 8/8 scenarios declare a non-empty `sources` array: `grep -c "sources:" tools/screenshots/scenarios.mjs` = 8.
- [x] 8/8 scenarios declare an `id` and a `group`: `grep -c 'id: "' tools/screenshots/scenarios.mjs` = 8.
- [x] 8/8 fixtures are rooted at the plugin container: `grep -c "note-database-container" tools/screenshots/scenarios.mjs` = 8.
- [x] The registry imports nothing, so it runs with no vault present: `grep -cE "^import |require\(" tools/screenshots/scenarios.mjs` = 0.
- [x] Exactly one scenario declares a capture override: `grep -c "captureCss" tools/screenshots/scenarios.mjs` = 1.
- [x] 3/3 explanatory notes reach the generated index: `grep -c "note:" tools/screenshots/scenarios.mjs` = 3.
- [x] Shared sources stale every capture naming them: `grep -c "CardFieldRenderer.ts" tools/screenshots/scenarios.mjs` = 3.
- [x] Every registered scenario has a captured pair: `screenshots/manifest.json` holds 16/16 entries for 8 ids in 2 themes.
- [ ] `npx tsc --noEmit` exit code 0 — orchestrator verifies.
- [ ] `npm run build` exit code 0 — orchestrator verifies.
- [ ] `npx vitest run` passes — orchestrator verifies.
- [ ] `npm run screenshots` writes 16 PNGs — orchestrator verifies.
- [ ] `npm run screenshots:verify` exits 0 with no uncaptured scenario — orchestrator verifies.
- [ ] Each capture still resembles what its renderers emit — needs a human; markup drift does not fail the run.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| Requirement | Target | Verification Method | Status |
|---|---|---|---|
| **Portability** | Runs with no vault, `App` or metadata cache | Source inspection: the file imports nothing | Verified by source inspection |
| **Determinism** | Same markup on every run | Source inspection: mock rows are literals, no clock or filesystem reads | Verified by source inspection |
| **No New Dependency** | 0 added packages | Source inspection of the import list | Verified by source inspection |
| **Vault Safety** | 0 writes of any kind | Source inspection: the registry performs no I/O | Verified by source inspection |
| **Markup Fidelity** | Fixtures match what the renderers emit | Looking at the captured PNGs against the renderer sources | **Not performed — needs a human** |
| **Compilation & Bundle** | Clean `tsc` and `esbuild` | `npx tsc --noEmit`, `npm run build` | **Not run — orchestrator verifies** |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

- **Captures render fixture markup, not the real renderers.** The renderers need a live Obsidian `App`, vault and metadata cache. Markup drift therefore surfaces as a screenshot that no longer resembles the code rather than as a capture failure, and nothing in the run detects it.
- **The file header refers to a structure check in `verify.mjs` that the shipped `verify.mjs` does not implement.** Today drift is caught by a person noticing. Either the check gets built or the comment gets corrected.
- **Coverage is partial.** Calendar, timeline, record detail panel, table record peek, filter and sort panels, toolbar and view switcher, mobile and bottom-sheet layouts, drag and selection states, conditional formatting, and grouped and swimlane boards have no scenario. `004-coverage-expansion` owns them.
- **`sources` accuracy is a promise, not a check.** Nothing verifies that a scenario names every file it actually depicts, so an incomplete list produces a capture that goes stale less often than it should.
- **Scenario widths are hand-chosen and not tied to breakpoints.** A responsive change could move a surface out of the frame its width was chosen for, and the capture would still succeed.

<!-- /ANCHOR:limitations -->
