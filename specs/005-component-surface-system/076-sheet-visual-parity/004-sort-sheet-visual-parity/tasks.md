---
title: "Tasks: Phase 4: Sort Sheet Visual Parity"
description: "Fourteen write-first tasks for the sort sheet loop. Each task names RED assertion, producer change, GREEN proof, capture and judge; the final two tasks are the unchanged-tree judge and operator gate."
trigger_phrases:
  - "task breakdown"
  - "076 phase 4 tasks"
  - "004 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 4: Sort Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

All tasks are pending because this leg defines and plans; it does not implement. Every CREATE or
verification task follows the write-first sequence:

**RED assertion → producer change → GREEN proof → capture → judge.**

The failing values are evidence to record, not values to silently overwrite. The judge is the
eight-row 0/1/2 image rubric; pass is at least 14/16 with no row at 0.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:tasks -->
## Ordered tasks

- [ ] T001 [P] Inventory and classify every reference — RED: any relevant Notion/Anytype/ClickUp path is unresolved or its role is unknown; producer change: complete spec.md §13.1 with the canonical Notion sort-01/sort-02 pair, the sorting-a-database flow frames, the eight other "sort"-family files classified as Filter/Group/Settings/sidebar surfaces, the two Anytype full-resolution pairs and the mislabeled ClickUp settings file; GREEN: every named path resolves, every thumbnail-only pixel says "thumbnail, value unreadable", and the reorder-gesture gap is named; capture: open each reference and the current plugin captures; judge: design lead checks structure, order, copy, control type and grouping only.

- [ ] T002 [P] Record the honest before — RED: spec.md lacks a capture-by-capture and source-by-source current description; producer change: fill §13.2 from the opened full-sheet light/dark pair, the active-rule pair and the named producer line ranges (`renderRule`, `createConditionRow`, the shared `.obnotion-panel-row` sibling-divider rule); GREEN: the before records the uniform 1px hairline between every row (rule boundary or not), the missing terminal delete action, and the active-rule popover's confirmed 2-dropdown count (correcting the inherited 3-dropdown draft) without inferring unreadable pixels; capture: preserve the existing light/dark filenames as baseline; judge: reviewer can identify the same defects from the images and the cited source lines.

- [ ] T003 Prove the production mount and state coverage — RED: a scenario cannot be traced through `constructedScenario` → `mountConstructed` → `window.__mountConstructed` → renderer branch; producer change: none needed — both `sort-panel` (harness line 3388) and `active-rule-popover`/`ruleKind: "sort"` (harness line 3314) were read this session and confirmed to reach the shipped renderers; GREEN: both branches construct production `SortPanelRenderer`/`ActiveRulePopoverRenderer` instances, and `panel-sort-rules`, `panel-sort-calendar-empty`, `chrome-active-rule-popover-sort` all declare `fixtureOf` at these scenarios; capture: record the scenario-to-function trace and source list; judge: implementation lead rejects any fixture substitute.

- [ ] T004 Complete the DEFINE drawing board and contradiction record — RED: any frame, section, row, control, type, spacing, theme or state property lacks a target, a rubric mapping or a Source column entry; producer change: finish spec.md §13.3-§13.15, including the merged rule-group model, the direction drill-in sub-sheet, the separated delete group, the terminal add/delete-sort group, the D9 Source column and the §13.15 contradiction record (the delete-placement additive change, and the Anytype Edit-toggle evidence that does not settle 071/012 ADR-001's Notion-side PROVISIONAL flag); GREEN: every target is token-backed or says "TBD — needs operator capture", D7 is cited for every group boundary and no conflicting card target remains; capture: compare the brief beside Notion sort-01/02, the Anytype Sorts list and the operator's rejected-container capture; judge: reviewer confirms a builder can execute without guessing.

- [ ] T005 Write the implementation plan and rubric instance — RED: a producer, stylesheet region, scenario/mount function, capture or judge expectation is unnamed; producer change: complete plan.md with exact files/functions (including the new rule-group/terminal-group responsibilities), the confirmed mount chain, the css-lane handoff from `002`, capture set and the concrete eight-row rubric; GREEN: a CREATE leg can start from this plan with no new architectural decision; capture: map every planned output to a filename or report; judge: implementation lead checks production mounting and scope.

- [ ] T006 [P] Add sort clauses and capture the RED baseline — RED: L1-L6 are absent or unwired; producer change: add stable presentation markers and packet-specific clauses to `tools/live/sheet-grammar.mjs` after confirming the css-lane triplet is released by `002` and reacquiring it; GREEN proof: run the current tree before any producer/style change and record L1=1 non-conforming active-rule row (2 dropdowns), L2=0 rule-group wrapper markers, L3=1 inline direction dropdown per rule, L4=0 dedicated delete-group boundaries, L5=0 terminal groups (no "Delete sort" action exists), and L6's unchanged floor (1 reorder affordance, ≤4 controls/row, 74-character calendar hint); capture: retain the exact lane output; judge: reviewer confirms each RED is caused by the current production mount, not a fixture.

- [ ] T007 Merge property and direction into one rule group — RED: L2=0 rule-group wrapper markers; producer change: wrap `renderRule`'s property and direction `createConditionRow` calls in one shared group element in `sort-panel-renderer.ts`, suppressing the `.obnotion-panel-row` sibling divider between the two member rows in `styles.css` while keeping it at the group's outer edges; GREEN: L2=1 wrapper per rule, no divider drawn between the property and direction rows, the existing `-8px` visual pull preserved or replaced by the group's own internal rhythm; capture: sort viewport and full-sheet light/dark; judge: compare Row anatomy and Sections against Notion sort-01.

- [ ] T008 Move direction into a drill-in sub-sheet — RED: L3=1 inline direction dropdown per rule; producer change: replace `renderRuleDirectionPicker`'s inline `createDropdownField` call with a sub-sheet presentation (flat "Ascending"/"Descending" rows, hairline between, centred title, `Done` control) reusing the family's existing sheet-stacking model; GREEN: L3=0 inline dropdowns remain on the sheet itself; capture: direction sub-sheet open, light/dark; judge: compare Controls against Notion sort-02 and the Anytype direction sheet's flat-list/centred-title grammar (its extra null-handling rows are not added).

- [ ] T009 Separate the per-rule delete and add the terminal group — RED: L4=0 dedicated delete-group boundary, L5=0 terminal groups; producer change: give the delete button its own single-row divider group distinct from the rule group above it, and add a new terminal group below the rule list holding "+ Add sort" then a new "Delete sort" row (new `src/i18n.ts` key) that clears the whole `sortRules` array; GREEN: L4=1 delete group with a divider boundary above it, L5=1 terminal group with both rows in the reference's order; capture: full-sheet light/dark showing both new groups below the fold; judge: compare Sections and Row anatomy against Notion sort-01's terminal card.

- [ ] T010 Bring the active-rule sort popover onto the sheet's rule grammar — RED: L1=1 popover row using bare unlabelled side-by-side dropdown pills; producer change: update `active-rule-popover-renderer.ts`'s `toggleSort`/`open` (or the shared filter/sort open path) so the sort branch's compact editor reads with the sheet's own leading-icon/label grammar while keeping exactly 2 controls (field, direction); GREEN: L1=0, popover reads consistently with the sheet; capture: `constructed-active-rule-sort` mobile light/dark; judge: compare the companion beside the sheet's own rule-group reading (Jakob's Law consistency, not a Notion reference — Notion has no equivalent chip popover).

- [ ] T011 Capture the production sheet set — RED: any required image is missing, stale, blank, theme-blind or hides the terminal group below the judged viewport; producer change: run the production screenshot scenarios and let `capture.mjs` emit the primary full-sheet variant; GREEN: screenshot verification reports zero missing/stale/blank/theme-blind entries and manifest sources include changed producers; capture: primary viewport/full-sheet pairs, calendar-variant pair and active-rule pair; judge: open every changed PNG and write observed deltas.

- [ ] T012 Run lane, regression and unit battery — RED: any L1-L6 or unchanged 071 floor is failing; producer change: correct only the named producer/style/marker that owns the failure; GREEN: every clause has RED→GREEN numbers, the sort rule-stack/prose/panel-row floors remain green and `npx tsc --noEmit`, `npm run build`, `npx vitest run` and `npm run gate` pass; capture: retain lane, test and gate output; judge: reviewer checks that green DOM evidence does not replace the image obligation.

- [ ] T013 Judge pass twice on an unchanged tree — RED: the first image-judge score is below 14/16 or any row is 0; producer change: for every row below 2, run a new RED → producer fix → GREEN → recapture cycle and document it in verification.md; GREEN: two consecutive complete eight-row passes each score at least 14/16 with no zero and the tree SHA is unchanged between them; capture: primary full-sheet light/dark plus active-rule companion; judge: record both complete score tables and one-line findings.

- [ ] T014 Operator gate and closeout — RED: acceptance/goal/verification lacks the operator row, or it is accidentally ticked by an agent; producer change: keep the device row present and Unmet/unticked, update progress metadata only after strict validation and graph backfill; GREEN: strict validation is PASSED, the child and parent progress rows say planned until CREATE lands, the named commit carries both required trailers, rebase/push succeeds and origin has no root `.handover.md`; capture: final evidence index and handover entry; judge: the operator is the sole judge of device alignment.
<!-- /ANCHOR:tasks -->

---

<!-- ANCHOR:completion -->
## Completion rules

T013 cannot close on a single score or on a changed-tree re-judge. Two passes must be consecutive
and on an unchanged tree. T014 must leave the operator row unticked even when every agent-side
criterion is green. The per-rule-delete placement contradiction is additive under D15 and is
recorded in spec.md §13.15, not amended into `071/012`.
<!-- /ANCHOR:completion -->
