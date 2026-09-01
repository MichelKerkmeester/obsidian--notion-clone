---
title: "Quality Checklist: Add-View Popover Layout Defects"
description: "Verification checklist for the Add view popover layout fix, reconciled against what was actually verified in-session versus what the orchestrator's compiler, build and test gates verify, and what only a look at the running plugin can settle."
trigger_phrases:
  - "add view popover checklist"
  - "add view tile verification"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/010-add-view-popover-layout"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled checklist against work actually performed; left gate and visual items unticked"
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
      session_id: "ui-build-010"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Quality Checklist: Add-View Popover Layout Defects

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

An item is ticked only when it was verified in this session against the code as it now stands. Read-only shell inspection (`grep`, `git diff`) was available and its output is quoted as evidence. Items whose verification requires *running* the compiler, the bundler, the test suite or the plugin itself are left unticked: none of those was executed here, and the orchestrator runs the first three.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] The suspected cause — a shared `.db-menu-item` rule imposing a horizontal flex row on the cards — was tested against the actual declarations and **disproved**: the rule declares only `min-height`, `border`, `border-radius` and `transition`, and no `display` [EVIDENCE: styles.css:226-231; `grep -n "db-menu-item" styles.css` returns 11 lines, at 226, 233, 234, 238, 243, 244, 251, 258, 259, 377 and 2538, all read]
- [x] CHK-002 [P0] The rule stretching the checkbox was identified as the descendant selector `.db-add-view-form input`, not a rule on the checkbox itself [EVIDENCE: styles.css:18541-18547 pre-fix — `width: 100%; min-height: 32px`; the checkbox is nested inside `label.db-add-view-duplicate` at src/views/ToolbarRenderer.ts:1251-1253, so a descendant selector reaches it]
- [x] CHK-003 [P0] A portal-scoping cause was ruled out: the popover is created inside `.note-database-container` and `positionToolbarPopover` does not reparent it, so the container-scoped rules genuinely apply [EVIDENCE: src/views/ToolbarRenderer.ts:1221-1222 `anchorEl.closest(".note-database-container")`, :1234 `root.createDiv(...)`, :1291 `positionToolbarPopover(panel, anchorEl)`]
- [x] CHK-004 [P0] `db-menu-item` confirmed to be a style-only hook that is never queried, so removing it from the tiles changes no behaviour [EVIDENCE: `grep -rn "db-menu-item" src/` returns 38 matches across ColumnMenu.ts, RowMenu.ts and ToolbarRenderer.ts, every one of them a class string passed to `createEl`/`addClass`; no `querySelector`, no `hasClass`, no `closest`]
- [x] CHK-005 [P0] Keyboard navigation confirmed to key off the ARIA role rather than the class [EVIDENCE: src/views/ToolbarRenderer.ts:1972-1974 — `panel.querySelectorAll("button[role=menuitem]:not(:disabled), button[role=option]…")`]
- [x] CHK-006 [P0] In-repo precedent located for resetting the host app's pinned button height on a button used as a tile [EVIDENCE: styles.css:3325-3347 `.db-calendar-search-result` — a two-row button tile carrying `height: auto !important` and `box-shadow: none !important`; styles.css:661-675 `button.db-icon-only-button` — explicit `height: 26px` and `box-shadow: none`]
- [x] CHK-007 [P0] No existing test references the classes being changed, so no suite is invalidated [EVIDENCE: `grep -rn "db-add-view\|db-menu-item" src/ --include="*.test.ts"` returns 0 matches]
- [x] CHK-008 [P0] Baseline test suite and TypeScript compilation pass cleanly before changes — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-009 [P0] The form's full-bleed sizing is narrowed by input type rather than counter-pinned on the checkbox, so the rule now states its own intent [EVIDENCE: styles.css:18551-18557 — `.db-add-view-form input:not([type="checkbox"]):not([type="radio"])`]
- [x] CHK-010 [P0] The duplicate checkbox rule declares no width and no height, leaving the platform's own checkbox metrics in place [EVIDENCE: styles.css:18617-18620 — `flex: 0 0 auto; margin: 0` only]
- [x] CHK-011 [P0] The tile declares its own complete box model instead of inheriting one: height, width, box-sizing, track layout, wrapping and shadow [EVIDENCE: styles.css:18635-18653 — `height: auto`, `width: 100%`, `box-sizing: border-box`, `grid-template-columns: minmax(0, 1fr)`, `grid-template-rows: auto auto`, `align-content: start`, `white-space: normal`, `box-shadow: none`]
- [x] CHK-012 [P0] Hover, focus ring and transition are restated on the tile after it stops carrying the shared menu-row class, so no state feedback is silently lost [EVIDENCE: styles.css:18652 transition, :18655-18658 hover, :18660-18664 `box-shadow: var(--db-accent-focus-ring)`; the container-wide rule at styles.css:18866-18875 is a second, independent source of the same ring]
- [x] CHK-013 [P0] The previously unstyled caption has a rule that keeps it inside the tile [EVIDENCE: styles.css:18666-18672 — `min-width: 0`, `overflow-wrap: anywhere`, `font-size: var(--db-font-xs)`]
- [x] CHK-014 [P0] The fix adds no `!important` anywhere [EVIDENCE: `git diff | grep -c '^+.*!important'` = 0]
- [x] CHK-015 [P1] Code comments state the durable reason for each non-obvious choice — why the toggles are excluded by type, why the checkbox rule pins nothing, why the tile resets its height and wrapping, why the rows are equalised, why the popover is a border box, why the footer row has a separator, why the tile is not a menu item — and contain no spec, requirement, task or checklist identifiers [EVIDENCE: styles.css:18535-18537, 18548-18550, 18615-18616, 18625, 18631-18634, 18742-18743; src/views/ToolbarRenderer.ts:1261-1263; `git diff | grep '^+' | grep -cE 'REQ-[0-9]|CHK-[0-9]|T0[0-9][0-9]|specs/public'` = 0]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-016 [P0] A regression suite exists that asserts on the shipped stylesheet and the renderer source, following the established pattern including the eslint-disable header required for reading files from disk [EVIDENCE: src/views/AddViewPopoverLayout.test.ts:1-88, modelled on src/views/LayerScaleAndTimelineWidth.test.ts:1-6 and src/views/AccessibilityDefects.test.ts]
- [x] CHK-017 [P0] Every assertion in the suite is one that would fail against the pre-fix tree: a bare `input` selector, no `height` on the tile, no `grid-template-columns`, no `white-space`, the menu-row class on the card, no caption rule at all, no `grid-auto-rows`, no `box-sizing` on the popover, and no `height`/`border-top` on the footer row [EVIDENCE: src/views/AddViewPopoverLayout.test.ts:26-89; plan.md testing table maps each assertion to its pre-fix state]
- [x] CHK-018 [P1] The suite also guards the shared rule it deliberately did not edit, so a future change that guts `.db-menu-item` or re-tags the footer row fails here [EVIDENCE: src/views/AddViewPopoverLayout.test.ts:58-61]
- [x] CHK-019 [P1] The stylesheet parser strips comments before splitting selectors, so prose commas inside comments cannot produce phantom selectors, and it unions blocks when one selector appears in more than one rule [EVIDENCE: src/views/AddViewPopoverLayout.test.ts:11-23 — `declarationsFor` strips `/* … */` before matching, and joins every block whose selector list contains the exact selector]
- [x] CHK-020 [P0] `npx vitest run` passes with the new suite included — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`
- [x] CHK-021 [P0] `npx tsc --noEmit` passes cleanly — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`
- [x] CHK-022 [P0] `npm run build` produces a clean bundle — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`
- [ ] CHK-023 [P1] Visual confirmation in the running plugin that each tile contains its own preview and caption, that all tiles are the same height, that no horizontal scrollbar appears, and that the popover reads correctly in light and dark themes and at the narrow clamp — **not performed: requires the running app. A text assertion on the stylesheet cannot measure a rendered box, which is exactly the limitation that let this defect ship**

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Symptom 3 — the stretched checkbox — is fixed at its cause: the selector that stretched it no longer matches it, rather than a counter-width being layered on top [EVIDENCE: styles.css:18551-18557 and :18617-18620; the full-bleed rule now reads `input:not([type="checkbox"]):not([type="radio"])` so it no longer matches the checkbox]
- [x] CHK-025 [P0] Symptom 5 — detached previews and captions overlapping neighbouring tiles — is fixed by the tile declaring the height it actually needs, not by clipping the overflow [EVIDENCE: styles.css:18635-18653 `height: auto` with `align-content: start`; no `overflow: hidden` was added to the card]
- [x] CHK-026 [P0] Symptom 5 — most captions missing — is fixed by releasing the inherited `nowrap` and giving the caption its own rule, so every tile renders its label [EVIDENCE: styles.css:18651 `white-space: normal`; styles.css:18666-18672 caption rule]
- [x] CHK-027 [P0] Symptom 6 — the duplicate action crammed onto a caption's line — is addressed at its cause (the overflowing tiles above it) and reinforced by giving the action a separator and a height reset of its own [EVIDENCE: styles.css:18744-18750; the row was already `display: flex; width: 100%` at styles.css:18719-18733, which is why the report described it as crammed rather than as inline]
- [x] CHK-028 [P0] Symptom 7 — the horizontal scrollbar — has all four of its contributors addressed: the unwrappable caption, the uncapped preview glyph, the grid tracks and the content-box popover frame [EVIDENCE: styles.css:18651, :18697 `max-width: 100%`, :18624 `minmax(0, 1fr)`, :18538-18540 `box-sizing: border-box`]
- [x] CHK-029 [P1] Uniform tile height is declared rather than left to content [EVIDENCE: styles.css:18626 `grid-auto-rows: 1fr`]
- [x] CHK-030 [P1] The reported "fine" elements — the title, the name input, the key-field select and the icon input — are untouched [EVIDENCE: `git diff styles.css` contains no change to the `width: 100%; min-height: 32px` declarations themselves, only to which inputs the selector reaches; src/views/ToolbarRenderer.ts:1240-1257 unchanged]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-031 [P0] Display-only invariant: the change adds no write path; opening the popover, hovering a tile and focusing a tile produce zero note frontmatter or markdown body writes. The pre-existing write path — `actions.addView(...)` on click — is unchanged [EVIDENCE: src/views/ToolbarRenderer.ts:1258-1293 — DOM construction and click wiring only; the diff touches one class string and one comment]
- [x] CHK-032 [P0] No telemetry, external network call, or new dependency is introduced [EVIDENCE: `git diff -- src | grep -cE 'fetch\(|XMLHttpRequest|WebSocket|sendBeacon'` = 0; `package.json` is not in `git diff --stat`, which lists only `src/views/ToolbarRenderer.ts` and `styles.css`]
- [x] CHK-033 [P0] No optional API is called unguarded; the change calls no API at all beyond the `createEl`/`setIcon` calls already present, and the one optional call in the surrounding method keeps its guard [EVIDENCE: src/views/ToolbarRenderer.ts:1232 `actions.closeToolbarPopovers?.()`]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-034 [P1] No spec path, requirement id, task id or checklist id appears in any code comment [EVIDENCE: `git diff | grep '^+' | grep -cE 'REQ-[0-9]|CHK-[0-9]|T0[0-9][0-9]|specs/public'` = 0]
- [x] CHK-035 [P1] No user-facing string or ARIA label changes, so no new `t()` key is required [EVIDENCE: src/views/ToolbarRenderer.ts:1264-1266 keeps `"aria-label": text` and the `t("toolbar.duplicateCurrentView")` caption at :1253 and :1285]
- [x] CHK-036 [P1] Open judgement calls are recorded rather than silently resolved [EVIDENCE: spec.md OPEN QUESTIONS records the unstyled `.is-<viewtype>` preview modifiers, the caption centring change, and the `role="menuitem"`-inside-`role="dialog"` ARIA shape]
- [x] CHK-037 [P1] The disproved hypothesis is recorded rather than quietly dropped, so the next reader does not re-run the same investigation [EVIDENCE: spec.md:68-70 records that `.db-menu-item` was suspected, checked and disproved — it declares no `display` at all]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-038 [P0] The new test sits in `src/views/` alongside the other view suites and matches the `*.test.ts` include pattern [EVIDENCE: src/views/AddViewPopoverLayout.test.ts; vitest.config.ts:5]
- [x] CHK-039 [P0] Every added style selector is scoped to `.note-database-container` [EVIDENCE: styles.css:18538, 18551-18553, 18617, 18622, 18635, 18655, 18660, 18666, 18674, 18684, 18690, 18695, 18744 — all prefixed]
- [x] CHK-040 [P0] The shared `.db-menu-item` rule is not edited; the only `db-menu-item` change in the diff is its removal from the card's class list [EVIDENCE: `git diff | grep -E '^[+-]' | grep 'db-menu-item'` returns exactly two lines — the new explanatory comment and the removed `cls: "db-add-view-card db-menu-item"`]
- [x] CHK-041 [P0] The shared toolbar-row declaration block is not edited; the footer action's new declarations live in a separate later rule that names only that one class [EVIDENCE: styles.css:18719-18733 unchanged in `git diff`; the new rule is at styles.css:18744-18750]
- [x] CHK-042 [P0] The concurrent column-header region is untouched [EVIDENCE: `git diff styles.css | grep -cE '^[+-].*db-(column-menu-trigger|board-column-options|th-content|th-label|board-header-text)'` = 0]
- [x] CHK-043 [P1] The three sibling popovers sharing the width rule are not affected: `box-sizing` was added in a rule naming `.db-add-view-popover` alone rather than to the shared selector list [EVIDENCE: styles.css:18526-18533 unchanged; new rule at :18538-18540]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 8 | 7/8 | 1 |
| Code Quality & Architecture | 7 | 7/7 | 0 |
| Testing & Verification | 8 | 4/8 | 4 |
| Fix Completeness & Parity | 7 | 7/7 | 0 |
| Security & Data Safety | 3 | 3/3 | 0 |
| Documentation | 4 | 4/4 | 0 |
| File Organization | 6 | 6/6 | 0 |
| **Total** | **43** | **38/43** | **5** |

**Verification Date**: 2026-08-28
**Verification**: All 38 ticked items were verified in-session by reading the code as it now stands and by read-only `grep` and `git diff` inspection, whose output is quoted inline. The 5 deferred items (CHK-008, CHK-020, CHK-021, CHK-022, CHK-023) require executing the compiler, the bundler, the test suite or the plugin itself. The orchestrator runs `npx tsc --noEmit`, `npm run build` and `npx vitest run`; CHK-023 needs a human looking at the rendered popover, and is the one item that could catch a layout surprise a text assertion cannot.

<!-- /ANCHOR:summary -->
