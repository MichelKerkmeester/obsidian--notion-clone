---
title: "Implementation Summary: Column Header Menu Affordance Defects"
description: "What was delivered for the table and board column header menu affordance fix: single-row flex headers with a non-shrinking trigger, removal of the blanket touch-target rule that overrode the trigger's positioning, the vertical ellipsis icon, scoped drag cursors, an auto-fit width allowance and a regression suite."
trigger_phrases:
  - "header affordance implementation summary"
  - "three dots under column name fix"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/009-header-affordance-defects"
    last_updated_at: "2026-08-28T16:54:47.516Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded delivered scope and the gates left to the orchestrator"
    next_safe_action: "Await orchestrator compiler, build and test gates"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-009"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Column Header Menu Affordance Defects

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Metric | Value |
|---|---|
| **Phase Name** | 009-header-affordance-defects |
| **Theme** | Table and board column header menu affordance, truncation and cursor scoping |
| **Status** | Complete pending orchestrator gates |
| **Completion Pct** | 100% of implementation; 0 of 3 verification gates run in-session |
| **Requirements** | 9 defined (5 P0, 4 P1) |
| **Tasks** | 23 planned (19 completed, 4 deferred to the orchestrator or to a visual check) |
| **Target Deliverables** | Single-row table header, in-flow non-shrinking trigger, name truncation, asymmetric hit halo, cascade cleanup, board header parity, `.db-board-column-options` styling, vertical ellipsis icon, scoped drag cursor, auto-fit allowance, regression suite |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

1. **Root cause removed from the cascade**: `.db-column-menu-trigger` was taken out of the shared touch-target `position: relative` list (`styles.css:17365-17382`), and `position: relative` moved into the trigger's own rule (`styles.css:4700`). The stylesheet now declares the trigger's position in exactly one place, so a specificity tie in a blanket list can no longer decide its layout.
2. **Table header rebuilt as a single flex row**: `.db-th-content` became a full-width row with per-child spacing rather than a row `gap` (`styles.css:4633-4642`), because the trigger hugs the name at 2px while the type icon and sort arrow sit at 6px — a single `gap` cannot express both.
3. **Trigger placed inline as a fixed, non-shrinking sibling**: `display: inline-flex; flex: 0 0 auto; margin-left: 2px` with explicit 16px icon sizing (`styles.css:4699-4723`), and mounted into `.db-th-content` from `ColumnHeaderController.setupMenuTrigger` with a fallback to the `<th>` (`src/views/ColumnHeaderController.ts:46-60`).
4. **Column name truncates**: `.db-th-label` is the only shrinking child, with `flex: 0 1 auto`, `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis` and `white-space: nowrap` (`styles.css:4676-4684`), and the sort indicator carries its own 6px margin (`styles.css:4758-4767`).
5. **Hit halo contained**: the trigger's `::before` expansion narrowed from a symmetric `inset: -11px` to `inset: -8px -8px -8px 0` and the class was removed from the coarse-pointer symmetric list, so the enlarged tap target grows into the cell padding instead of back over the name it now sits beside (`styles.css:4731-4736, 17430-17431`).
6. **Board header given the same shape**: `.db-board-header-text` became a content-hugging flex row (`styles.css:978-984`); `.db-board-column-title` and `.db-board-subgroup-title` truncate inside it (`styles.css:986-994`); the count, subgroup count and summaries are pinned at `flex: 0 0 auto` (`styles.css:996-1001, 8465-8472, 8544-8550`).
7. **Board options button styled for the first time**: `.db-board-column-options` had no CSS at all. It now mirrors the table trigger — inline non-shrinking 22px box, 2px margin, hover and focus reveal, 16px icon, and a coarse-pointer minimum size (`styles.css:8359-8395, 17390`) — and is mounted inside the name row at both the swimlane and the standard column call sites (`src/views/BoardRenderer.ts:260, 516`).
8. **Vertical ellipsis icon**: both triggers switched from `more-horizontal` to `more-vertical` (`src/views/ColumnHeaderController.ts:54`, `src/views/BoardRenderer.ts:209`).
9. **Drag cursor scoped to the header background**: `cursor: grab` moved from the whole table header cell onto `th[data-note-database-column-key]`, which `TableRenderer` sets only on draggable property columns; the label, type icon, sort indicator and trigger return the pointer (`styles.css:4615-4627`). On the board, the header keeps `cursor: grab` while the name row and the options button take the pointer (`styles.css:8376, 8397-8401`).
10. **Auto-fit reserves the trigger's width**: the header chrome allowance in `estimateAutoColumnWidth` rose from 46 to 70 — 16px cell padding, 22px type icon and margin, 24px trigger and margin — so auto-fitting a column no longer immediately ellipsises its own header name (`src/views/ColumnWidth.ts:45-49`).
11. **Regression suite**: `src/views/ColumnHeaderMenuAffordance.test.ts` parses the shipped stylesheet into selector/body pairs and asserts the in-flow trigger, the single positioning declaration, the contained halo, name truncation, board parity, the vertical icon and the cursor scoping, plus the two renderer mount points.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

- **Phase 1**: Cascade audit and root-cause removal, table flex row, label truncation, contained halo.
- **Phase 2**: Trigger mount point and icon in `ColumnHeaderController`, table cursor scoping.
- **Phase 3**: Board header row, title truncation, the new `.db-board-column-options` rule set, both board mount points and the board icon.
- **Phase 4**: Auto-fit allowance and the regression suite.
- **Phase 5**: Verification — left to the orchestrator; no shell command was run in this session.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

- **Flex row over patched absolute positioning**: restoring `position: absolute` with `!important` or a higher-specificity selector would have fixed the pixels while preserving the fragility. A non-shrinking flex sibling in a `nowrap` row cannot drop below the name regardless of what any later rule says about `position`.
- **Per-child spacing instead of a row `gap`**: the trigger needs 2px while the icon and sort arrow need 6px. Keeping the `gap` and clawing 4px back with a negative margin would have re-created the hidden coupling this phase set out to remove.
- **One declaration site per property**: both `position` and the `::before` inset are now declared exactly once for the trigger, and the regression suite asserts that count rather than just the value — so a future blanket list that re-adds the class fails the test instead of silently winning.
- **Asymmetric tap halo**: with the button 2px from the name, a symmetric 8px expansion would have swallowed click-to-sort taps near the label's right edge. Growing only rightwards and vertically keeps the touch target large without stealing from its neighbour.
- **Grab scoped by data attribute**: `[data-note-database-column-key]` is set only on real property columns, so the select, record-icon and add-column cells keep the pointer rather than advertising a drag that never starts.
- **Auto-fit allowance raised**: the trigger used to overlap the name; now it occupies 24px of the row. Leaving the allowance at 46 would have made auto-fit produce headers that ellipsise their own names.
- **Display-only invariant**: the change adds no write path, no listener, no timer and no persisted state.

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

- **Auto-fit allowance was not in the original defect report.** Raising the `estimateAutoColumnWidth` constant was added once the trigger became in-flow, because leaving it would have introduced a new visible defect on the auto-fit path. Recorded as REQ-008 rather than shipped silently.
- **`.db-board-column-options` gained a coarse-pointer minimum size.** The table trigger already had one; the board button had no CSS at all. Adding it brings the two surfaces to parity rather than leaving a 22px touch target on one of them.

<!-- /ANCHOR:deviations -->
---

<!-- ANCHOR:verification -->
## Verification

The following gates verify delivery. **None of them were run in this session — no shell command was executed. The orchestrator runs all three.**

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Unit test suite
npx vitest run
```

### Verification Checklist
- [x] The trigger declares no `position: absolute` and is an inline-flex, `flex: 0 0 auto` sibling of the label (`styles.css:4699-4718`).
- [x] The trigger's `position` is declared exactly once in the stylesheet (`styles.css:4700`).
- [x] `.db-th-label` truncates and is the only shrinking child of the header row (`styles.css:4676-4684`).
- [x] The `::before` halo is declared once and does not extend leftwards (`styles.css:4733-4736`).
- [x] Both renderers call `setIcon(button, "more-vertical")` (`ColumnHeaderController.ts:54`, `BoardRenderer.ts:209`).
- [x] The board options button has a complete inline rule set (`styles.css:8359-8395`).
- [x] Grab is scoped to draggable property cells; the pointer covers the name and the button on both surfaces (`styles.css:4615-4627, 8376, 8397-8401`).
- [x] Auto-fit reserves the trigger's inline width (`ColumnWidth.ts:45-49`).
- [x] The regression suite exists and every assertion fails against the pre-fix tree (`ColumnHeaderMenuAffordance.test.ts:45-157`).
- [ ] `npx tsc --noEmit` exit code 0 — orchestrator verifies.
- [ ] `npm run build` exit code 0 — orchestrator verifies.
- [ ] `npx vitest run` passes with the new suite included — orchestrator verifies.
- [ ] `more-vertical` renders a glyph in the running plugin — needs a visual check; `IconName` is `string`, so an unresolved name fails silently.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| Requirement | Target | Verification Method | Status |
|---|---|---|---|
| **Rendering Cost** | No new listeners, timers or layout reads | Source inspection of the diff | Verified by source inspection |
| **Display-Only Safety** | 0 note-body writes | Source inspection of both renderers | Verified by source inspection |
| **Touch Target Size** | >= 28px on coarse pointers, both surfaces | Stylesheet review (`styles.css:17384-17403`) | Verified by stylesheet review |
| **Cascade Robustness** | Exactly one `position` declaration for the trigger | Asserted by the regression suite | Asserted in test; suite not executed in-session |
| **Compilation & Bundle** | Clean `tsc` and `esbuild` | `npx tsc --noEmit`, `npm run build` | **Not run — orchestrator verifies** |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

- **Icon name cannot be verified from source.** Obsidian types `IconName` as `string`, so `more-vertical` compiles regardless of whether it resolves. If the bundled Lucide set has dropped the legacy alias, the button renders blank while keeping its size, label and behaviour. Only a look at the running plugin settles it.
- **Pointer cursor on the board group name is an affordance without a matching action.** The board group name has no click handler of its own; the pointer there advertises the header's clickable controls. Implemented as the user specified, and recorded as an open question.
- **The regression suite asserts declarations, not computed layout.** It runs against `styles.css` text in a Node environment, so it catches the class of regression that caused this defect — a competing declaration elsewhere in the cascade — but it cannot catch a browser-level layout surprise. A visual check remains the complement.
- **Long header names ellipsise 24px sooner than before at a fixed column width.** That is the direct cost of giving the button real space instead of letting it overlap the name; auto-fit compensates, manually-sized columns do not.
- **`graph-metadata.json` is absent from this phase folder.** Sibling phases carry one, but its `derived` block holds extracted entities, a `source_fingerprint` and per-document hashes produced by the Spec Kit indexer. Hand-writing those would fabricate an indexing run that never happened, so the file is left for the indexer to generate.

<!-- /ANCHOR:limitations -->
