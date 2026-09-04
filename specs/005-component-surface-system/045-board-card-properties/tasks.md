---
title: "Tasks: Board Card Properties"
description: "Ordered tasks: read the three implicit rules, add the persisted list, derive it so the upgrade is invisible, swap the renderer, then build the control on desktop and phone."
trigger_phrases:
  - "board card properties tasks"
  - "045 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Board Card Properties

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Record the three implicit rules exactly as they stand, so the derivation can be checked against them rather than against memory: the shared `getVisibleColumns` input, the title/grouped exclusion, and the `select`/`status` exclusion that routes those columns to `renderCardTitleChips` (`src/views/board-renderer.ts:1439`, `:1475`, `:1478-1483`) — red: none (tripwire pass) `src/views/board-renderer-hierarchy.test.ts:634`
- [x] T002 [P] Record the reference card's fixed slot set as the boundary this phase must not cross: `getReferenceCardFields` resolving `time`, `progress`, `due`, `tags`, `people`, against `KanbanCardProps` in the vendored reference (`src/views/board-renderer.ts:552`, `specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:10`) — red: none (tripwire pass) `src/views/board-renderer-parity.test.ts:660`
- [x] T003 Design the persisted shape and write it down before writing it: an ordered `{ key, visible }` array on `ViewConfig`, optional and absent by default, absent meaning "derive" (`src/data/types.ts`) — red: `src/data/data-source.test.ts:151` `expected undefined to deeply equal [{ key: "hours", visible: true }, { key: "tags", visible: false }]`
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Add `resolveBoardCardFields(config, columns)`. With the list absent it must reproduce T001's three rules exactly; with it present it returns the stored order filtered to keys still in the schema, skipping a deleted key without blanking the card (`src/views/board-renderer.ts` or a sibling module) — red: `src/views/board-card-fields.test.ts:1` `Cannot find module './board-card-fields'` — **correction (verification pass):** the first landing's derived path checked only the static `hiddenColumns` array, not the full `getVisibleColumns` input T001 named — a column empty on every current row (with `showEmptyFields` on) is auto-hidden by `getVisibleColumns` but is not in `hiddenColumns`, so the derived card would show a field the pre-change board never showed. Fixed by capturing the host's real `getColumns(config)` result once per render (`BoardRenderer.legacyVisibleColumnKeys`, set only when the list is absent) and passing it through `BoardCardFieldContext.visibleKeys`, which `isDerivedVisible` now defers to when present. Proven by `src/views/board-card-fields.test.ts` (two new cases) and `src/views/board-renderer-hierarchy.test.ts` ("omits a column the host's getColumns already dropped..."), the latter confirmed red against the unfixed code before the fix landed.
- [x] T005 Swap `renderCard`'s inline filter for the resolver, and stop the board reading the table's `hiddenColumns`. `renderReferenceCard` is not touched — REQ-007 keeps the 1:1 path on its fixed slots (`src/views/board-renderer.ts`) — red: `src/views/board-renderer-hierarchy.test.ts:658` `expected [ 'hours', 'tags', 'people', …(2) ] to include 'status'`
- [x] T006 Build the Properties panel on desktop: one row per field with a visibility toggle and a drag handle, cover and title shown as fixed rows above the list rather than as entries. Writes through the existing `ViewConfigMutation` path (`src/views/database-view.ts`, `src/views/toolbar-renderer.ts`, `styles.css`) — red: `src/views/board-card-properties-panel.test.ts:1` `Cannot find module './board-card-properties-panel'`
- [x] T007 The same control on the phone, as a sheet built from `044`'s row grammar, with an explicit move affordance instead of a drag handle — a drag handle inside a scrolling sheet fights the scroll. Blocked on `044` T004 (`src/views/toolbar-renderer.ts`, `styles.css`) — red: same module miss as T006; phone rows use `db-mobile-reorder-controls` up/down
- [x] T008 [P] Labels in three locales (`src/i18n.ts`) — red: `src/views/board-card-properties-panel.test.ts:196` keys unresolved until locale rows landed
- [x] T009 The read-only path: an embed in `codeblock` persist mode shows the properties list and cannot edit it, matching how the existing config panels already gate on `persistMode` (`src/views/embedded-database-renderer.ts`) — red: panel test read-only case failed until `readOnly` disabled checkboxes and hid move controls
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T010 Differential test: for a set of schema shapes, `resolveBoardCardFields` with an absent list returns exactly what the pre-change inline filter returned. This is the migration's entire correctness claim and it is the one test that must exist before T005 lands (`src/views/*.test.ts`) — red: `src/views/board-card-fields.test.ts:110` `Cannot find module './board-card-fields'`
- [x] T011 Capture pair proving REQ-004: board captures before and after the change, with no stored list, byte-identical. A unit test cannot see a card that quietly lost a field (`screenshots/`) — `npm run screenshots` re-ran the full 544-scenario suite against the resolver swap and the CSS lane edit. `git status` after the run showed 6 PNGs moved by bytes (`constructed-owned-menu-mobile-dark`, `constructed-record-detail-desktop-dark`, `constructed-sort-panel-calendar-mobile-light`, `board-mobile-desktop-dark`, `board-view-desktop-dark`, `board-view-mobile-light`) and the manifest; `node tools/lane/check-lane.mjs` confirmed all 6 as pixelHash/layoutHash-identical to HEAD (re-encode noise, not content), so all six were restored to HEAD-committed bytes and their manifest `bytes` fields corrected to match. Every other board capture (`constructed-board`, `constructed-board-subtask`, `constructed-board-empty-column`, `constructed-board-extensions`, `chrome-board-extensions-selection`, `board-drop-language`, `board-subtask-tree`) moved neither bytes nor hash — proof that an existing view with no stored `boardCardFields` renders byte-identically after the change. `npm run screenshots:verify` reports 544/544 current.
- [x] T012 Prove SC-002: with `boardExtensionsEnabled` off, the rendered DOM matches `038`'s parity fixtures unchanged. If it moves, the control has reached the reference path and REQ-007 is violated (`tools/live/`, `038`'s fixtures) — `src/views/board-renderer-parity.test.ts` (including its new "does not let a stored card field list move the reference card's fixed slots" case, which stores a `boardCardFields` list on a reference-mode config and asserts the fixed slots are unmoved) and `node tools/live/render-assertions.mjs` (headless-Chrome DOM check against the bundled renderer) both pass; the T011 capture pair above confirms it photographically. `renderReferenceCard`/`getReferenceCardFields` were not touched by this phase's diff.
- [ ] T013 Add a constructed scenario with a non-default properties list, so the feature has a photographed state rather than only a unit test (`tools/live/render-assertion-harness.ts`, `tools/screenshots/constructed-scenarios.mjs`) — **not done this session.** No existing scenario mounts `ViewConfigPanelRenderer`/`renderBoardCardProperties` for a board view (the one `view-config` scenario the harness has is table-only), so the Properties panel has a Storybook story (`board-card-properties-panel.stories.ts`, `Editable`/`ReadOnly`) and thorough unit coverage (`board-card-properties-panel.test.ts`) but no capture-pipeline photograph yet. Building the constructed scenario needs a board-typed branch in `render-assertion-harness.ts`'s `view-config` case plus a matching hand fixture, both of which also require updating the two hardcoded scenario-id arrays in `tools/screenshots/constructed-capture.test.mjs`. Left as a named follow-up rather than rushed.
- [x] T014 Update `../roadmap.md` §5 and the parent phase maps with the measured result (`../roadmap.md`, `../spec.md`) — done post-landing: rebased onto main after the list hide-and-migrate landing, resolved 2 conflicting `tools/live/*.json` families plus `css-lane.json` (main's history plus this phase's 3 entries, `baselineHash` recomputed on the merged stylesheet), re-stamped 16 evidence artefacts, and pushed as `ff1dacec` (`npm run gate` 25/25). `../roadmap.md`'s §5.A row for `045`, the "Three phases opened" and "Legs in flight" prose, and `../spec.md`'s two Phase Documentation Map rows all updated to Landed/Shipped with the AC-005/T013 wait on `044`'s sheet-grammar lane and the two open questions named
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` — T013 (photographed non-default properties list) remains
- [x] No `[B]` blocked tasks remaining
- [ ] Manual verification passed — the operator arranges a board card's properties on the phone
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Parity boundary**: `../038-board-kanban-port/spec.md` REQ-007 and SC-004
- **Row grammar**: `../044-phone-sheet-alignment/spec.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] A stored key missing from the schema is skipped, never fatal
- [ ] CHK-013 [P1] The resolver is one function with one call site, matching `resolveRecordOpenTarget`'s shape
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested — empty list, deleted key, schema with no non-title fields
- [ ] CHK-023 [P1] Error scenarios validated — a malformed stored list loads as absent rather than throwing
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Finding class recorded. This is `cross-consumer`: the board and the table share one visible-column producer, and the fix removes one consumer rather than changing the producer.
- [ ] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'getVisibleColumns|getColumns\(' src`, count stated before and after
- [ ] CHK-FIX-003 [P0] Consumer inventory run for `hiddenColumns`, `columnOrder` and `showEmptyFields` across `src/` and `tools/`
- [ ] CHK-FIX-004 [P0] N/A recorded rather than ticked: no path, parser, redaction or security surface
- [ ] CHK-FIX-005 [P1] Matrix axes listed: {list absent, present} × {extensions on, off} × {key exists, deleted} × {desktop, phone} = 16 rows
- [ ] CHK-FIX-006 [P1] N/A — no process-wide state is read
- [ ] CHK-FIX-007 [P1] Evidence pinned to a fix SHA, not a branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] The stored list holds field keys only, never values
- [ ] CHK-032 [P1] N/A — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] The comment above the resolver says why the board stopped reading the table's hidden columns, not what the function does
- [ ] CHK-042 [P2] `src/views/README.md` names the resolver as the card field-set owner
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 12 | 0/12 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->

---
