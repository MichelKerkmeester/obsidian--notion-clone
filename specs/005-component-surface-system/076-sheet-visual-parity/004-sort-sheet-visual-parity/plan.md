---
title: "Implementation Plan: Phase 4: Sort Sheet Visual Parity"
description: "Write-first six-step plan for the production sort sheet and active-rule sort surface, with exact files, mount path, lane assertions, captures and image-judge expectations."
trigger_phrases:
  - "implementation plan"
  - "076 phase 4 plan"
  - "004 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 4: Sort Sheet Visual Parity

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

This is a planning packet, not an implementation. The producer must move the current loose row
stack to the DEFINE brief in spec.md §13: one merged rule group (property + direction), a direction
drill-in sub-sheet, a separated per-rule delete group and a terminal add/delete-sort group — all as
plain-canvas divider groups under parent D7, composed per-row from Notion, Anytype and ClickUp under
D9 and recorded in spec.md §13.5's Source column. The active-rule sort popover is a second producer
surface and adopts the same grammar without losing either of its two required controls.

The parent D1 gate is an image judge. Eight rows score 0/1/2 for 16 points; pass is at least 14/16
with no row at 0, twice consecutively on an unchanged tree. The lane is a drift floor, not closure.
Parent D2 requires production mounts and D3 forbids numeric values read from the 299×678 Notion
thumbnails. The per-rule-delete placement contradiction with `071/012` is recorded additively in
spec.md §13.15 per `roadmap.md` §7.19's own pointer; `071/012` ADR-001's reorder ruling (roadmap
ADR-F) is not reopened.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- [x] spec.md §13 has the frame, ordered sections, row table, controls, type, spacing, themes,
  states and before → target DELTA table.
- [x] Every relevant Notion/Anytype/ClickUp path is classified; thumbnail-only numeric gaps say
  "thumbnail, value unreadable" and name the capture that would settle them.
- [x] Both production surfaces are enumerated and their production mount chain is proven by reading
  each link (scenario → harness branch → renderer).
- [x] Packet-specific L1-L6 RED values are recorded before any producer or stylesheet change.
- [ ] The css-lane holder (currently `076-002-properties-sheet-visual-parity`) is confirmed released
  before `styles.css` is edited.

### Definition of Done

- [ ] L1-L6 and unchanged 071 floors are GREEN with RED/GREEN numbers recorded.
- [ ] Phone light/dark and full-sheet sort captures are current, opened and read; the active-rule
  companion pair is current and read.
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
| `src/views/sort-panel-renderer.ts` | Wrap property+direction in one rule-group marker, replace the inline direction dropdown with a drill-in sub-sheet call, move the delete button into its own group, add the terminal add/delete-sort group | `render` (66-165), `renderRule` (180-251), `renderRuleMoveControls` (253-279), `renderRulePropertyPicker` (281-303), `renderRuleDirectionPicker` (305-328); new `renderRuleGroup`, `renderDirectionSubSheet` or equivalent, `renderTerminalActionsGroup` |
| `src/views/active-rule-popover-renderer.ts` | Route the sort branch of `toggleSort`/`open` through the same rule-group grammar the sheet uses, keeping both field and direction controls | `toggleSort` (66-90), `open` (109-149) |
| `src/views/toolbar-primitives.ts` | Only if the rule-group wrapper is promoted to a shared primitive rather than kept sort-local | `createConditionRow` (152-166) |
| `styles.css` | Style the new group markers with existing sheet/canvas/spacing/divider/focus tokens; suppress the sibling-divider rule between a rule group's two member rows while keeping it between groups | `.obnotion-sort-rule-row`/`.obnotion-sort-direction-row`/`.obnotion-sort-delete-row` (13904-13957); `.obnotion-panel-row` sibling divider (12547-12561); dropdown icon rules (14054-14125) |
| `src/i18n.ts` | Add the "Delete sort" whole-config label only | Sort keys around line 581-589 |
| `tools/screenshots/constructed-scenarios.mjs` | Confirm existing `sort-panel` and `active-rule-sort` registrations need no new state; register a two-rule sort-stack state if the primary judge capture does not already show a rule-group boundary between two rules | `constructedScenario` entries for `sort-panel` and `active-rule-sort` |
| `tools/live/render-assertion-harness.ts` | No new branch required; both mount paths already confirmed at 3314 and 3388 | `scenario.renderer === "sort-panel"` / `"active-rule-popover"` |
| `tools/live/sheet-grammar.mjs` | Encode L1-L6 and re-run unchanged `071` shell floors and the existing sort rule-stack/prose clauses | Sort registrations at 90, 190, 394-395, 457, 499, 502, 2418, 2468-2660, 5254, 5436, 5513, 5570, 5610 |
| `tools/screenshots/capture.mjs` / `verify.mjs` | Capture the phone pair, the full-sheet variant and the active-rule companion from the production scenarios | Existing scenario loop, no new entries required |
| `tools/lane/check-lane.mjs` / `tools/lane/css-lane.json` | Confirm `002`'s release, then acquire/release the triplet for this child's CREATE `styles.css` edits | css-lane acquire/edit/release triplet |
| `verification.md` | Record lane RED/GREEN evidence, both judge score tables and the unticked operator gate | VERIFY artefact |

### Production mount path and scenario proof

The storybook-like constructed screenshot path is:

`constructedScenario(...)`
→ `mountConstructed(page, device, theme, spec)`
→ `window.__mountConstructed(spec)`
→ `runRenderAssertions(...)`
→ the renderer branch in `tools/live/render-assertion-harness.ts`.

The sort branch (`scenario.renderer === "sort-panel"`, harness line 3388) constructs the production
`SortPanelRenderer`; the active-rule branch (`scenario.renderer === "active-rule-popover"`, harness
line 3314) constructs the production `ActiveRulePopoverRenderer` with `ruleKind: "sort"`. Both were
read this session and confirmed to reach the shipped renderer with no fixture substitution. Fixtures
`panel-sort-rules`, `panel-sort-calendar-empty` and `chrome-active-rule-popover-sort` declare
`fixtureOf` at these two scenarios and owe no new registration.

The judged image is the full-sheet variant `screenshots/notion-clone/panels/constructed-sort-panel-
sheet-mobile-{light,dark}.png`, emitted beside the viewport shot from the same run: the sheet
expands past its 90svh cap to its own content height so the terminal group a viewport crop would
keep below the fold is scored.

### Capture set

| Evidence | Required files/output | What it proves |
|---|---|---|
| Sort viewport | `screenshots/notion-clone/panels/constructed-sort-panel-mobile-{light,dark}.png` | Primary CSS phone view through the production mount |
| Sort full sheet (judged) | `screenshots/notion-clone/panels/constructed-sort-panel-sheet-mobile-{light,dark}.png` | Full rule/delete/terminal group content for the primary judge |
| Calendar-view sort | `constructed-sort-panel-calendar-mobile-{light,dark}.png` | Calendar-hint regression, unchanged |
| Active-rule companion | `screenshots/notion-clone/components/constructed-active-rule-sort-mobile-{light,dark}.png` | Second production surface uses the shared rule-group grammar |
| Real app | `tools/live/sheet-rebuild.json` from `node tools/live/sheet-rebuild.mjs`, if the harness covers this sheet | Chrome/WebKit production interaction |

### Image-judge rubric instance

The reviewer opens the primary full-sheet light/dark pair beside Notion sort-01/sort-02 and checks
the active-rule companion for the same rule-group grammar. Every Notion image is a 299×678
thumbnail, so exact reference pixels remain unreadable. Score each row 0/1/2:

| Row | 0 | 1 | 2 — concrete expectation for this sheet |
|---|---|---|---|
| Frame | Wrong sheet or popup shape | Correct shell but wrong canvas/radius/handle | Flush shell on the token ladder, centred handle/`✕` per ADR-I; direction sub-sheet's own title + Done |
| Sections | Missing or ambiguous grouping | Some group/order wrong | Rule group → delete group → terminal group, each its own divider-separated unit with a larger between-group gap |
| Row anatomy | Wrong elements | Right concepts but wrong order/edge | Property (arrows, type icon, chevron) then direction (indented, chevron) in one group; delete and terminal rows exactly as spec.md §13.5 |
| Controls | Input/dropdown where navigation is required | Correct kind with weak affordance | Direction opens a drill-in sub-sheet; property/direction pills remain the only inline controls |
| Type | Wrong hierarchy | One level off | 16px/600 title, 16px/400 labels, destructive rows at the existing small/600 token, no helper paragraph |
| Spacing | Wrong rhythm | One region off | Divider suppressed within a rule group, kept between groups; existing 44px row floor, 42px indent, 16px inset |
| Colour | Hierarchy or contrast failure | One token off | One grey/dark sheet canvas, painted dividers, contrast-safe destructive red, unchanged token roles |
| Both themes | One theme broken | Both work but inconsistent | Light and dark share order/geometry and independently readable divider/text contrast |

Pass is at least 14/16 with no row at 0. Record one justification line for each row in
`verification.md`; any row below 2 opens remediation.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Presentational only. No sort semantics, persistence, data shape, public API, security boundary or
desktop behavior changes. The active-rule popover is intentionally included because it paints the
same phone sort grammar and was missed by `071/012`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001-T004 | `spec.md` §13 | All refs classified; every row has a target; thumbnail numbers are explicitly unreadable/provisional |
| B | PLAN | T005-T006 | This plan and lane baseline | Production mount proven; packet-specific RED values named |
| C | CREATE | T007-T009 | Renderer/style/i18n changes | Each producer move follows RED → change → GREEN |
| D | SCREENSHOT | T010 | Capture/manifest/evidence | Light/dark viewport, full-sheet and active-rule pairs are current and opened |
| E | VERIFY | T011-T012 | Lane, regression and real-app output | L1-L6 and 071 floors green; rebuild path read where covered |
| F | REMEDIATE/JUDGE | T013-T014 | `verification.md` and acceptance/goal | Two unchanged-tree passes ≥14/16 with no zero; operator row remains unticked |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test type | Scope | Tool/output |
|---|---|---|
| Write-first lane | L1-L6 plus unchanged 071 floors | `node tools/live/sheet-grammar.mjs` |
| Production render | Both scenario branches, provenance | `tools/live/render-assertion-harness.ts` |
| Unit/source contract | New group markers and the "Delete sort" copy key; mutation must go RED | `npx vitest run` |
| Capture | Phone light/dark, full-sheet, calendar variant and active-rule companion | `npm run screenshots`; `npm run screenshots:verify` |
| Real app | Sort add-row, rebuild and inside-tap cases where the harness covers this sheet | `node tools/live/sheet-rebuild.mjs` |
| Screenshot review | Open every changed light/dark image and read layout, not only manifest entries | `screenshots/` and decoded evidence |
| Image judge | Eight parent rows, 0/1/2 | Sonnet/Opus result in `verification.md` |
| Regression battery | TypeScript, build, Vitest, gate and strict packet validation | `npx tsc --noEmit`; `npm run build`; `npx vitest run`; `npm run gate`; orchestrator |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Status | Effect |
|---|---|---|
| `003` filter child | Sequential predecessor under parent D4 | CREATE starts only after the predecessor is accepted by the loop |
| css-lane triplet | Currently held by `076-002-properties-sheet-visual-parity`; must be released, then reacquired here before `styles.css` is edited | Prevents concurrent stylesheet writers and makes RED/GREEN CSS evidence attributable |
| Operator full-resolution Sort capture | Not supplied | Keeps group-gap/indent/radius pixel comparisons provisional; the structural brief remains executable without it |
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
