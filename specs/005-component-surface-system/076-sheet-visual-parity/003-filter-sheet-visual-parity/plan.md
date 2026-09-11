---
title: "Implementation Plan: Phase 3: Filter Sheet Visual Parity"
description: "Write-first six-step plan for the production filter sheet and active-rule filter surface, with exact files, mount path, lane assertions, captures and image-judge expectations."
trigger_phrases:
  - "implementation plan"
  - "076 phase 3 plan"
  - "003 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 3: Filter Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §14 Reference images — the planner reads every embedded operator,
Notion, Anytype and current-state image before writing lane clauses.

### Technical Context

| Aspect | Value |
|---|---|
| Language/Stack | TypeScript, Obsidian plugin, no framework |
| Framework | The plugin's own sheet renderers plus `styles.css` |
| Storage | None — presentational |
| Testing | Vitest, `tools/live/sheet-grammar.mjs`, constructed captures and an image judge |

### Overview

This is a planning packet, not an implementation. The producer must move the current stacked-pill
filter grammar to the DEFINE brief in spec.md §13: one summary row per condition, a drill-in
detail group containing property/comparator/value rows separated by hairlines on the plain sheet
canvas, one rule-action group, one add-actions group and one whole-filter Delete row/group. The
Notion references visibly use inset cards, but the current parent D7 operator ruling binds this
child to dividers on the plain sheet background; the reference observation and the override are
recorded explicitly in spec.md. The active-rule filter popover is a second producer surface and
follows the same grammar.

The parent D1 gate is an image judge. Eight rows score 0/1/2 for 16 points; pass is at least 14/16
with no row at 0, twice consecutively on an unchanged tree. The lane is a drift floor, not closure.
Parent D2 requires production mounts and D3 forbids numeric values read from the 299×678 Notion
thumbnails. ADR-H in the root 005 roadmap remains Proposed under D15.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- [ ] spec.md §13 has the frame, ordered sections, row table, controls, type, spacing, themes,
  states and before → target DELTA table.
- [ ] Every relevant Notion/Anytype/reference path is classified; thumbnail-only numeric gaps say
  “thumbnail, value unreadable” and name C-1.
- [ ] Both production surfaces are enumerated and their production mount chain is proven.
- [ ] Packet-specific L1–L6 RED values are recorded before any producer or stylesheet change.
- [ ] The css-lane holder and baseline triplet are confirmed before styles.css is edited.

### Definition of Done

- [ ] L1–L6 and unchanged 071 floors are GREEN with RED/GREEN numbers recorded.
- [ ] Phone light/dark and full-sheet filter captures are current, opened and read; the active-rule
  companion pair is current and read.
- [ ] The real-app sheet-rebuild filter cases pass in Chrome and WebKit where the harness covers.
- [ ] The eight-row image judge is at least 14/16 with no zero, twice on an unchanged tree.
- [ ] TypeScript, build, Vitest, gate, screenshot freshness and strict packet validation are read
  green.
- [ ] The operator row remains present and unticked.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Exact files and responsibilities

| File | Planned responsibility | Named functions/regions |
|---|---|---|
| `src/views/filter-panel-renderer.ts` | Produce entry, summary, detail, action, add, delete and comparator tiers without changing filter data flow; expose stable presentation markers | `FilterPanelRenderer.render`, `renderHeader`, `renderEntryTier`, new `renderSummaryTier`, `renderDetailTier`, `renderRuleActionsGroup`, `renderAddActionsGroup`, `renderDeleteGroup`, `renderComparatorTier`, existing `renderFilterTreeGroup`, `renderFilterRow`, `renderStackedConditionRow`, `renderValueInput` |
| `src/views/active-rule-popover-renderer.ts` | Remove the filter-specific three-dropdown exception and route the active rule to the shared detail grammar | `toggleFilter`, `open` |
| `src/views/dropdown-field.ts` | Keep property/value pickers on the existing phone-sheet path; expose comparator as a child list rather than an inline operator pill | `createDropdownField`, `openDropdownPopover` |
| `styles.css` | Style the producer markers with existing sheet/canvas, spacing, type, divider, focus, motion, dark-theme and keyboard tokens; keep grouping fill/radius off | token block around lines 44–116; mobile bottom sheet around 242–350; active-rule rules around 2161; filter rules around 13245–13508 and §30 around 24767 |
| `src/i18n.ts` | Add only missing visible labels required by the row table, preserving existing keys where present | panel/filter and action-key sections around lines 570–595 and 1012–1035 |
| `tools/screenshots/constructed-scenarios.mjs` | Register production empty, summary/many, detail, nested and comparator states; keep primary detail ID for judge continuity | `constructedScenario`; filter-panel and active-rule-filter entries around 599–639 and 846–898 |
| `tools/live/render-assertion-harness.ts` | Carry the presentation state through the real constructed mount and expose state-specific assertions | `ScenarioSpec`, `SPEC_OPTIONS`, `runRenderAssertions`, `filterPanelAssertions`, `activeRulePopoverAssertions`, `window.__mountConstructed` branch around 3314–3385 |
| `tools/live/sheet-grammar.mjs` | Encode packet-specific L1–L6 targets and re-run unchanged 071 shell floors | filter registration around 91; panel measurements around 2343–2507; run aggregation around 5215 |
| `tools/screenshots/capture.mjs` | Capture the phone pair and the primary full-sheet variant from the production scenarios | scenario loop and sheet expansion around 385–640 |
| `tools/screenshots/verify.mjs` | Keep the primary filter ID and full-sheet accounting strict; verify added state pairs without inventing a fixture | `SHEET_JUDGE_SCENARIOS` around 66; full-sheet checks around 358–385 |
| `tools/live/sheet-rebuild.mjs` and `tools/live/sheet-rebuild-harness.ts` | Exercise real FilterPanelRenderer add-row, inside-tap, rebuild and keyboard-inset paths in Chrome/WebKit | filter cases around 302–430 and 753–982 |
| `tools/lane/check-lane.mjs` and `tools/lane/css-lane.json` | Enforce stylesheet ownership and release evidence before and after the CREATE leg | css-lane acquire/edit/release triplet |
| `verification.md` | Record lane RED/GREEN evidence, both judge score tables and the unticked operator gate | VERIFY artefact |

### Production mount path and scenario proof

The storybook-like constructed screenshot path is:

`constructedScenario(...)`
→ `mountConstructed(page, device, theme, spec)`
→ `window.__mountConstructed(spec)`
→ `runRenderAssertions(...)`
→ the renderer branch in `tools/live/render-assertion-harness.ts`.

The filter branch constructs the production `FilterPanelRenderer` and the active-rule branch
constructs the production `ActiveRulePopoverRenderer`. The scenario `fixtureOf` field is
provenance only; the current populated, nested and active-rule captures were read through the
production mount and have no fixture mismatch. Empty entry-tier coverage is absent today and is a
scenario/state coverage gap, not permission to substitute fixture HTML.

### State and scenario decision

Extend the existing scenario spec with a presentation option:
`filterPresentation: "empty" | "summary" | "detail" | "nested" | "comparator"`.
Keep `filterDepth` as the data-shape helper for nested rules. The registered set must be:

- `constructed-filter-panel-empty` — real `renderEntryTier` with no conditions.
- `constructed-filter-panel-summary` — three-rule/many-item summary state.
- `constructed-filter-panel` — primary detail state and full-sheet judge ID, with one selected rule
  exposing detail, action, add and Delete groups.
- `constructed-filter-panel-nested` — nested/NOT regression using the same divider groups and labelled
  actions.
- `constructed-filter-panel-comparator` — production comparator child tier with selected check and
  Done/back header.
- `constructed-active-rule-filter` — active-rule companion through `ActiveRulePopoverRenderer`.

The scenario registry, `ScenarioSpec`, `SPEC_OPTIONS` and harness assertions must all carry this
option. A software keyboard is not reproducible in the headless screenshot page; keyboard-open
proof belongs to the sheet-grammar visual-viewport probe and the real-app harness. Do not synthesize
keyboard pixels into a fixture.

### Capture set

| Evidence | Required files/output | What it proves |
|---|---|---|
| Filter detail viewport | `screenshots/notion-clone/panels/constructed-filter-panel-mobile-light.png` and `-dark.png` | Primary 402×874 CSS phone view through the production mount |
| Filter detail full sheet | `screenshots/notion-clone/panels/constructed-filter-panel-sheet-mobile-light.png` and `-dark.png` | Entire summary/detail/action/add/Delete content for the primary judge |
| Summary/many | `constructed-filter-panel-summary-mobile-light.png` and `-dark.png` | Many-item scan state and one summary row per condition |
| Empty | `constructed-filter-panel-empty-mobile-light.png` and `-dark.png` | Entry tier without a condition or helper paragraph |
| Nested regression | `constructed-filter-panel-nested-mobile-light.png` and `-dark.png` | NOT/group semantics without an unlabelled header toolbar |
| Comparator | `constructed-filter-panel-comparator-mobile-light.png` and `-dark.png` | Flat child picker, selected check and Done/back placement |
| Active-rule companion | `screenshots/notion-clone/components/constructed-active-rule-filter-mobile-light.png` and `-dark.png` | Second production surface uses the same condition grammar |
| Keyboard state | Sheet-grammar keyboard-inset report and real-app evidence | Header, field and clear/edit remain reachable under `--obnotion-keyboard-inset` |
| Real app | `tools/live/sheet-rebuild.json` from `node tools/live/sheet-rebuild.mjs` | Chrome/WebKit production interaction and rebuild behavior |

The current primary viewport and active-rule pairs are 804×1748 PNG pixels, representing a 402×874
CSS phone frame at DPR2. The current primary full-sheet pair is 804×2590. Exact post-change full-
sheet dimensions are measured by `capture.mjs` and recorded in the manifest. The current active-
rule surface has no full-sheet variant and remains a companion unless its production presentation
is deliberately changed.

### Image-judge rubric instance

The reviewer opens the primary full-sheet light/dark pair beside Notion filters-02/03/07/08 and
checks the active-rule companion for the same control grammar. Every Notion image is a 299×678
thumbnail, so exact reference pixels remain unreadable. Score each row 0/1/2:

| Row | 0 | 1 | 2 — concrete expectation for this sheet |
|---|---|---|---|
| Frame | Wrong sheet or popup shape | Correct shell but wrong canvas, radius, handle or header slot | Flush or anchored shell uses the token ladder, centred handle/title, local back on drill-in and named close/Done slots |
| Sections | Missing or ambiguous grouping | Some group/order wrong | Empty entry → summary → detail → rule-action divider group → add-actions divider group → terminal Delete row/group, with logical-group gaps visibly larger than within-group row gaps |
| Row anatomy | Wrong elements | Right concepts but wrong order/edge | Leading property/action icon, readable label and trailing value/chevron/count exactly as the DEFINE row table |
| Controls | Input/dropdown where navigation is required | Correct kind with weak affordance | Property/comparator/value navigation rows open pickers; only focused value editing is a full-width field; no inline operator dropdown |
| Type | Wrong hierarchy | One level off | Title 16px/600, labels and values 16px/400, section 13px/400, supporting subtitle 14px/400 and no helper paragraph under fields |
| Spacing | Wrong rhythm | One region off | 16px content inset, shell-only radius, 44–52px row window, 16px provisional logical-group gap with an 8px floor and 1px dividers |
| Colour | Hierarchy or contrast failure | One token off | One grey/dark sheet canvas in both theme ladders, primary/secondary text, painted dividers, accent and contrast-safe destructive red |
| Both themes | One theme broken | Both work but inconsistent | Light and dark share order/geometry, independently readable divider/text contrast and one plain-canvas direction |

Pass is at least 14/16 with no row at 0. Record one justification line for each row in
`verification.md`; any row below 2 opens remediation.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Presentational only. No filter semantics, persistence, data shape, public API, security boundary or
desktop behavior changes. The active-rule popover is intentionally included because it paints the
same phone filter grammar and was missed by 071/008.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001–T004 | `spec.md` §13 | All refs classified; every row has a target; thumbnail numbers are explicitly unreadable/provisional |
| B | PLAN | T005–T006 | This plan and lane baseline | Production mount proven; scenario/state coverage and packet-specific RED values named |
| C | CREATE | T007–T009 | Renderer/style/i18n changes | Each producer move follows RED → change → GREEN |
| D | SCREENSHOT | T010 | Capture/manifest/evidence | Light/dark viewport, full-sheet, state pairs and active-rule pair are current and opened |
| E | VERIFY | T011–T012 | Lane, regression and real-app output | L1–L6 and 071 floors green; rebuild and keyboard paths read |
| F | REMEDIATE/JUDGE | T013–T014 | `verification.md` and acceptance/goal | Two unchanged-tree passes ≥14/16 with no zero; operator row remains unticked |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test type | Scope | Tool/output |
|---|---|---|
| Write-first lane | L1–L6 plus unchanged 071 floors | `node tools/live/sheet-grammar.mjs` |
| Production render | Scenario option, provenance, empty and comparator states | `tools/live/render-assertion-harness.ts` |
| Unit/source contract | New markers, copy and state contracts; mutation must go RED | `npx vitest run` |
| Capture | Phone light/dark, full-sheet, summary, empty, nested, comparator and active-rule companion | `npm run screenshots`; `npm run screenshots:verify` |
| Real app | Filter add-row, rebuild, inside-tap and keyboard-inset cases | `node tools/live/sheet-rebuild.mjs` |
| Screenshot review | Open every changed light/dark image and read layout, not only manifest entries | `screenshots/` and decoded evidence |
| Image judge | Eight parent rows, 0/1/2 | Sonnet/Opus result in `verification.md` |
| Regression battery | TypeScript, build, Vitest, gate and strict packet validation | `npx tsc --noEmit`; `npm run build`; `npx vitest run`; `npm run gate`; orchestrator |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Status | Effect |
|---|---|---|
| 002 properties child | Sequential predecessor under parent D4 | CREATE starts only after the predecessor is accepted by the loop |
| css-lane triplet | Must be acquired before styles.css edit | Prevents concurrent stylesheet writers and makes RED/GREEN CSS evidence attributable |
| Operator C-1 detail capture | Not supplied; the full-resolution entry/ruling captures are present | Keeps Advanced detail and Comparator pixel comparisons provisional; structural brief remains executable |
| Image judge | Required at VERIFY | Without two unchanged-tree passes the child remains open |
| Operator iPhone read | Required and agent-untickable | Acceptance remains Unmet until the operator reports alignment |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

If a 071 floor regresses, stop the current CREATE sequence and restore the producer/style change
within this child before release. If one rubric row fails three consecutive iterations, reopen
DEFINE and record the target problem; do not keep tuning CSS against a wrong reference. Any
stylesheet rollback releases the css-lane triplet with the moved capture list named. Per parent D8,
no release/cut is claimed until T013 passes twice unchanged and T014 leaves the operator gate open.
<!-- /ANCHOR:rollback -->
