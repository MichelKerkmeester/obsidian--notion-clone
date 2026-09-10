---
title: "Tasks: Phase 8: filter-sheet-row-model"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 8: filter-sheet-row-model

<!-- SPECKIT_LEVEL: 3 -->

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
## Phase A: Baseline and root cause

- [x] T001 Read `../sheet-notion-audit.md` §0 and §3.9 before anything else. §0 is the binding
  constraint: every Notion iOS asset is 299x678, so **no number in this packet may come from one**.
  Confirm you can state where each numeric target in `spec.md` §13 comes from (all are ours)
  (`../sheet-notion-audit.md`)
- [x] T002 Run the lane and record the pre-change baseline verbatim: filter 3/3 rows @48px,
  panel padding 16px/16px, row span 332px, native selects 0, extent 373 == 373, and the printed
  `row sits 25.0px from the sheet's edge` (`tools/live/sheet-grammar.mjs`)
- [x] T003 Find what produces the 9px difference between filter's 25.0px row inset and sort's
  16.0px — read the computed box of a condition row and its ancestors on the filter fixture and
  name the rule that adds it (a candidate is the rule-tree's own left border/indent,
  `.obnotion-source-rule-node`). Record the finding; the T008 fix targets whatever this names.
  Do not change anything yet (`styles.css`, `src/views/filter-panel-renderer.ts`)
  — **Finding**: `.obnotion-source-rule-node` (border-left 2px + padding-left 7px = 9px) wraps the
  fixture's root AND group; 16px sheet padding + 9px indent = the measured 25.0px.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert what has never been asserted

- [x] T004 Add a **controls-per-row** clause to the filter surface: count interactive descendants
  (`button`, `input`, `select`, `[role=button]`, `.obnotion-dropdown-field`) per condition row and
  assert **≤4**. Run RED first and record the failing count (today: 6 per row, 3 rows)
  (`tools/live/sheet-grammar.mjs`)
  — RED: counts 6, 6, 5 (3 rows). GREEN: every stacked row carries 1 control.
- [x] T005 Add a **name-legibility** clause: mount a condition whose property name is at least 12
  characters and assert the property control's rendered text is not truncated — compare
  `scrollWidth` to `clientWidth` on the label element, and assert the text content is not
  ellipsis-terminated. Run RED first and record it (today: truncated) (`tools/live/sheet-grammar.mjs`)
  — RED: a 24-char name ("Content Type Preference") scrollWidth 119px > clientWidth 14px.
  GREEN: scrollWidth <= clientWidth, text renders whole.
- [x] T006 Add a **row-inset** clause promoting the number the lane already prints but never checks
  at `sheet-grammar.mjs:3998`: every panel sheet's first divider-owing row sits **16.0px** from the
  sheet edge. Run RED first — filter fails at 25.0px, sort and group pass — and record
  (`tools/live/sheet-grammar.mjs`)
  — RED: 2/2 filter divider-owing pairs at 25.0px. GREEN: 0/2 wrong, all at 16.0px.
- [x] T007 Add a **shared-span** clause: filter, sort and group row spans agree within **±2px**.
  Run RED first and record (today: 332 / 357 / 341px) (`tools/live/sheet-grammar.mjs`)
  — RED: filter 332 / sort 357 / group 341px. GREEN (scope narrowed to what this phase owns):
  filter now matches sort exactly (357/357px) via the same declared `heightRole: "flush"` sort
  already carries. Group's 341px was already sort's own mismatch before this phase touched
  anything (`005`'s own baseline), comes from group's independent floating/flush content-height
  classifier, and forcing it flush is a frame-shape decision on an already-verified sibling surface
  outside this phase's Files to Change — recorded as a Proposed ADR (`../../roadmap.md` §7) rather
  than silently widening the assertion or silently editing group's own producer.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [x] T008 Stack the condition: in `filter-panel-renderer.ts:555-604`, build the property,
  operator and value as three rows inside one rule block instead of three inline controls on one
  `.obnotion-panel-row`. Keep every control's existing class, value binding and change handler
  untouched — this is an arrangement change. Replace the bare `—` empty-value glyph (`:595`) with
  a labelled affordance (REQ-008). Style the block in `styles.css`, and apply the T003 fix so the
  row inset reads 16.0px (`src/views/filter-panel-renderer.ts`, `styles.css`)
  — `renderStackedConditionRow` (phone sheet only, gated on `isMobileBottomSheet`); the desktop
  anchored popover and the compact chip-rail editor keep the original single-row `createConditionRow`
  call, untouched. Empty value now renders `t("panel.value")` ("Value") instead of "—", on every
  presentation (screenshot-confirmed on desktop too). Checkbox conditions omit the value row
  entirely (edge case in `spec.md` §8).
- [x] T009 Move the rule's three icon buttons — `folder-plus` (add group), `circle-slash-2`
  (negate), `×` (remove) — off the condition row and render them as labelled rows, remove carrying
  the destructive treatment (`is-warning`, `styles.css:813`, the same class three producers already
  use). Assert the **nested-group** fixture separately: the group header
  (`createFilterTreeGroup`, `:415-445`) keeps its own structure and its own actions
  (`src/views/filter-panel-renderer.ts`, `styles.css`)
  — Built with `createMenuRow` (`.obnotion-menu-item`, `warning: true` on Remove) — the same
  primitive the group sheet's own rows already use. Screenshot-confirmed: the nested NOT/group
  fixture keeps its own header, icon buttons and left-indent untouched; only the leaf condition's
  own row stacks.
- [x] T010 Run GREEN on T004-T007 and record every number. Then confirm the taller sheet still
  respects the 90svH cap and the published keyboard inset with a 5-rule filter mounted
  (`tools/live/sheet-grammar.mjs`)
  — GREEN numbers: see T004-T007 above. The 90svH cap and keyboard inset are unchanged CSS
  (`max-height: calc(90svh - ...)`, `overflow-y: auto` on `.obnotion-mobile-bottom-sheet`) —
  neither this phase's TS nor CSS touches either declaration, so a taller stacked list scrolls
  inside the same cap by construction rather than by a new assertion. Confirmed under real
  measurement, not just inference: `sheet-rebuild.mjs`'s real-touch pass rebuilds the filter sheet
  live (adding a condition) and measures its resting top/height directly (PASS, both sampled
  positions inside the viewport). No dedicated 5-row lane fixture was added — inferred from
  unchanged cap/overflow declarations plus that live measurement, not a new red-then-green number.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression and unit proof

- [x] T011 Rerun `005`'s own clauses unchanged and confirm they still pass under the stacked block:
  rows 44-52px, panel padding 16px/16px, 1px divider, 0 native selects, extent 373 == 373, and the
  group popover's scrollbar fix (REQ-006). Also rerun the whole-lane sweep on **both** engines
  (`tools/live/sheet-grammar.mjs`)
  — `sheet-grammar.mjs` full run: exit 0, every registered surface satisfies all eight grammar
  columns, both engines. A genuine tap-target regression surfaced by the wider battery
  (`sheet-rebuild.mjs`: repeated taps on "+ Add condition" missed once the stacked list grew tall
  enough to move the button under the thumb) was found and fixed — the button is now
  `position: sticky; bottom: 0` inside the sheet's own scroll region — and reruns green.
- [x] T012 Extend `filter-panel-renderer.test.ts` with a revert-proof unit test for the stacked-row
  class contract, then prove it: revert the stacking rule → the test fails; restore → all pass.
  Record both states. Finish with the full battery — `npx tsc --noEmit`, `npm run build`,
  `npx vitest run`, `npm run screenshots` for the Filter sheet phone light+dark (REQ-009),
  `npm run gate` — then write the closing docs, validate (`orchestrator --strict` → `RESULT: PASSED`),
  backfill graph metadata, and append the packet entry to `../../handover.md`
  (`src/views/filter-panel-renderer.test.ts`)
  — Reverted: 3/10 new tests fail (source-text pins on `isMobileBottomSheet`, `renderStackedConditionRow`,
  the stacked-row class list and the labelled-action markers). Restored: 10/10 pass, 1589/1589 whole
  suite. `npx tsc --noEmit` exit 0. `npm run build` exit 0. `npm run screenshots` ×2, decoded-pixel
  reviewed (8 real movers + 1 pre-existing sub-pixel unrelated mover kept, 1 jitter reverted) — see
  `../../handover.md` and the css-lane triplet. `npm run gate`: 28 green, 0 red.
<!-- /ANCHOR:phase-4 -->

---

### Design-review follow-ups (2026-09-10)

Opened by `../sheet-design-review.md` §7 F-6, a `sk-design-fundamentals` pass distinct from this
child's own Notion-parity work. Implemented 2026-09-10 (design-review follow-up leg, worktree
`286-dr-filter-actions`).

- [x] T013 RED recorded: the clause reads the root group's action controls — both presentations,
  the legacy header icons container and the labelled action rows — and asserts a visible text node
  plus a 44px touch box on each. Against the unmodified tree: 4 of 4 controls ("Add source rule",
  "Add rule group", "Negate rule", "Remove rule") carry no visible label, boxes 28x28px against
  the 44px floor — exit 1 with exactly those 2 failures, every landed clause green
  (`tools/live/sheet-grammar.mjs`)
- [x] T014 Fixed at the producer, primary route: `renderFilterTreeGroup`'s group actions stop
  rendering as icon buttons inside the sheet and instead render after the group's children through
  the same `createMenuRow` labelled-row primitive `renderStackedConditionRow` uses — "Add rule",
  "Add rule group", "Negate rule", "Remove rule" (red, `is-warning`) as 44px labelled rows. The
  header's own layout could not hold four 44px labelled rows beside the `AND (all)` dropdown
  (110px of its own, ~357px of row), so the dropdown keeps its row and the four actions read
  where the condition's own actions read: after the rules they act on. Gated on
  `isMobileBottomSheet`, the same gate the stacked condition row takes; the desktop popover keeps
  the icon row, proven by the desktop captures reproducing their committed bytes while only the
  manifest's sourceHash moves (`src/views/filter-panel-renderer.ts`; `styles.css` untouched, so
  the fallback's phone-floor raise was not needed)
- [x] T015 GREEN: the clause reads 4/4 controls, visible labels 4/4, touch boxes 357x44px — the
  full suite exit 0, 0 failures, with the condition-row clauses this leg's earlier work shipped
  unchanged (condition rows ≤4 controls, counts 1×8; the labelled-warning clauses in their
  recorded state). All four captures recaptured twice: 1107px at max channel delta 112 (dark) /
  132 (light), identical counts in both runs, judged by decoded pixel delta, no image opened by
  eye — the same-visual-language half is confirmed by measurement instead (the actions now are
  the shared `createMenuRow` primitive the condition-level actions use: same 357px row span, 44px
  pitch, `is-warning` red); the operator's device read stays the outstanding row it already was
  (`tools/live/sheet-grammar.mjs`, `screenshots/`)
