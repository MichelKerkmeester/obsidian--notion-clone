---
title: "Tasks: Phase 3: Filter Sheet Visual Parity"
description: "Fourteen write-first tasks for the filter sheet loop. Each task names RED assertion, producer change, GREEN proof, capture and judge; the final two tasks are the unchanged-tree judge and operator gate."
trigger_phrases:
  - "task breakdown"
  - "076 phase 3 tasks"
  - "003 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 3: Filter Sheet Visual Parity

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

- [ ] T001 [P] Inventory and classify every reference — RED: any relevant Notion/Anytype path is unresolved or its role is unknown; producer change: complete spec.md §13.1 with canonical database filters, setting-up-filter flow, Anytype mobile sheets, duplicate flow assets and adjacent out-of-scope names; GREEN: every named path resolves, every thumbnail-only pixel says “thumbnail, value unreadable” and C-1 is named; capture: open each canonical light/dark pair and the current plugin captures; judge: design lead checks structure, order, copy, control type and grouping only.

- [ ] T002 [P] Record the honest before — RED: spec.md lacks a capture-by-capture current description; producer change: fill §13.2 from the opened 804×1748 viewport, 804×2590 full-sheet and active-rule images and the named renderer functions; GREEN: the before records the three stacked controls per condition, repeated actions, nested NOT toolbar and active-rule horizontal row without inferring unreadable pixels; capture: preserve the existing light/dark filenames as baseline; judge: reviewer can identify the same defects from the images.

- [ ] T003 Prove the production mount and state coverage — RED: a scenario cannot be traced through constructedScenario → mountConstructed → window.__mountConstructed → renderer branch, or empty/comparator state has no production coverage; producer change: add `filterPresentation` to `ScenarioSpec`, `SPEC_OPTIONS`, the registry and harness only as needed for `constructed-filter-panel-empty`, `-summary`, `-comparator` and the primary detail state; GREEN: populated, summary, nested, comparator, active-rule and empty paths invoke shipped renderers with no fixture-only image; capture: record the scenario-to-function trace and source list; judge: implementation lead rejects any fixture substitute.

- [ ] T004 Complete the DEFINE drawing board and Proposed ADR boundary — RED: any frame, section, row, control, type, spacing, theme or state property lacks a target or rubric mapping; producer change: finish spec.md §13.3–§13.15, including the Source-bearing row table, DELTA table, provisional ledger, plain-canvas divider grammar and ADR-H/D15 statement; GREEN: every target is token-backed or says “thumbnail, value unreadable” / “TBD — needs operator capture” with C-1 named, D7 is cited for the frame and no conflicting card target remains; capture: compare the brief beside canonical Notion frames, the operator rejected-container capture and 076/001/071/007 decisions as superseded by D7; judge: reviewer confirms a builder can execute without guessing.

- [ ] T005 Write the implementation plan and rubric instance — RED: a producer, stylesheet region, scenario/mount function, state, capture or judge expectation is unnamed; producer change: complete plan.md with exact files/functions, the real mount chain, divider-group tiers, full-sheet rules, active-rule companion, real-app output, lane clauses and concrete eight-row rubric; GREEN: a CREATE leg can start from this plan with no new architectural decision; capture: map every planned output to a filename or report; judge: implementation lead checks production mounting and scope.

- [ ] T006 [P] Add filter clauses and capture the RED baseline — RED: L1–L6 are absent or unwired; producer change: add stable presentation markers and packet-specific clauses to tools/live/sheet-grammar.mjs after acquiring the css-lane triplet; GREEN proof: run the current tree before any producer/style change and record L1=1, L2=3 per leaf/9 total, L3=0 detail-group markers plus 3 bordered control boxes per leaf, L4=2 unlabelled nested-NOT icon buttons, L5=1 inline comparator per leaf/3 total and L6=3 repeated action rows per leaf/9 total, alongside the already-green 071 floor of 9/9 rows at 48px, 16px inset, 357px span, 0 native selects and 4 labelled root actions; capture: retain the exact lane output; judge: reviewer confirms each RED is caused by the current production mount.
  - Evidence (RED baseline, before any producer change): `node tools/live/sheet-grammar.mjs` exit 1 with the six
    clauses wired. Sheet: L1=0, L2=3 per rule (9 total), L3=0 detail groups with 3 bordered control boxes per rule,
    L4=0, L5=2/1/1 (one more than the predicted 1 per rule — the unmarked span absorbs one extra operator control
    from the tree, recorded rather than smoothed), L6=3 per rule (9 total). Nested: L2=3 per rule (12 total), L4=2
    nested Not icon buttons, L5=3/2/1/1, L6=3/3/2/2. Companion: L1=1, L2=1, L3=0. The 071 floor stayed green
    throughout (9/9 rows at 48px, 16px inset, 357px span, 0 native selects, 4 labelled root actions).
    Clauses live in `tools/live/filter-parity-clauses.mjs` (unit-tested by
    `tools/live/filter-parity-clauses.test.mjs`), wired into the lane as its own block; they read the shipped
    markup rather than a fixture, and read unmarked markup too, which is what made this baseline measurable at all.

- [x] T007 Bring the active-rule filter onto the shared grammar first — RED: L1=1 active-rule row carrying Field 3 / equals / Backlog in three side-by-side controls; producer change: update `active-rule-popover-renderer.ts` `toggleFilter`/`open` and the shared filter producer so the active rule has a readable summary/detail route without changing filter data flow; GREEN: L1=0 and the companion has the same navigation-row/divider-group grammar; capture: `constructed-active-rule-filter` mobile light/dark; judge: compare the companion beside Notion detail and comparator references.
  - Evidence: the companion now mounts through `renderSheetConditionRule` like the sheet, 1 rule, marked markup.
    L1 1 → 0, L2 1 → 0, L3 0 → 1, L4 0 → 0, L5 1 → 0, L6 1 → 0. Both companion captures moved in both compared
    runs (295,457 pixels at max channel delta 207 dark, 316,380 at 209 light).

- [x] T008 Replace stacked condition pills with summary/detail divider groups — RED: L2=3 condition rows per leaf and L3=0 detail-group markers plus 3 bordered control boxes per leaf; producer change: update `filter-panel-renderer.ts` `renderFilterTreeGroup`, `renderFilterRow` and `renderStackedConditionRow` to create one summary row per condition and one plain-canvas detail group with three hairline-separated rows; GREEN: L2 maximum=1, L3 detail-group count=1 per selected rule, detail rows=3 and nested bordered control count=0; capture: primary detail and full-sheet light/dark plus nested; judge: score Sections and Row anatomy informally before the formal judge.
  - Evidence: L2 3 → 0 per rule (9 → 0 on the sheet, 12 → 0 nested), L3 0 → 1 detail group per rule (3 on the
    sheet, 4 nested), control boxes 3 → 0 per rule, detail rows 0 → 3 per rule, and L1 0 → 0 (the summary row is
    one control). No stylesheet rule changed: the detail rows keep `.obnotion-panel-row`, so the phone sheet's own
    hairline rule still draws between them, and the group is a plain canvas by construction rather than by a new
    rule. The two filter-panel-sheet captures changed dimensions, which is the sheet growing these groups.

- [ ] T009 Move controls/actions into divider groups and tune both themes — RED: L4=2 unlabelled nested-NOT icon buttons, L5=1 inline comparator per leaf and L6=3 repeated action rows per leaf; producer change: route property/comparator/value through navigation pickers, add value Edit/clear, labelled rule-action/add-actions/Delete divider groups, stable focus/keyboard markers, token-backed light/dark plain canvases and missing i18n labels; GREEN: L4=0, L5=0, summary action rows=0, detail action-group/add-group/Delete-group counts=1/1/1, all interactive hits ≥44px and both themes keep one readable canvas with painted dividers; capture: empty, filled, comparator, keyboard probe and light/dark states; judge: review Controls, Type, Colour and Both themes.
  - Partial, deliberately not ticked. Landed: L4 2 → 0 (the nested Not node renders two labelled rows on a sheet
    instead of two glyph buttons in its header, the same voice the group node already used there) and L6 3 → 0 per
    rule (the rule's own actions now sit inside a labelled `data-filter-action-group`), with the lane green on both.
    Not landed: the operator/comparator still edits in place inside its own detail row rather than through a
    navigation picker, and no value Edit/clear row exists. The L5 clause reads "operator controls edited outside a
    detail group" — it measures whether the comparator sits inline on the summary row, which is the weaker property
    the restructure proves; the rubric's Controls row ("no inline comparator dropdown") is therefore the image
    judge's call and is NOT claimed green here. The 44px hit floor is covered by the touch-targets lane, green.

- [x] T010 Capture the production sheet set — RED: any required image is missing, stale, blank, theme-blind or hides the lower action/add/Delete groups below the judged viewport; producer change: run the production screenshot scenarios and let capture.mjs emit the primary full-sheet variant; GREEN: screenshot verification reports zero missing/stale/blank/theme-blind entries and manifest sources include changed producers; capture: primary viewport/full-sheet pairs, summary pair, empty pair, nested pair, comparator pair and active-rule pair; judge: open every changed PNG and write observed deltas.
  - Evidence: `npm run screenshots` exit 0 three times, 504/504 each. Changed captures read by decoded pixel delta
    against the committed blobs: ten moved in BOTH compared runs (295k-389k pixels, max channel delta 122-209), the
    two `constructed-filter-panel-sheet-mobile-*` captures by dimension as well; two single-run movers outside the
    filter surfaces were reverted and their manifest entries left at HEAD; `npm run screenshots:verify` exit 0 (504
    entries match their sources, none blank or theme-identical). This leg cannot view images, so the deltas are
    measured, not observed, and per-image sign-off is recorded as owed in the lane's release note.

- [x] T011 Run lane, regression and unit battery — RED: any L1–L6 or unchanged 071 floor is failing; producer change: correct only the named producer/style/marker that owns the failure; GREEN: every clause has RED→GREEN numbers, row height/inset/divider/native-select/overflow/root-action floors remain green and `npx tsc --noEmit`, `npm run build`, `npx vitest run` and `npm run gate` pass; capture: retain lane, test and gate output; judge: reviewer checks that green DOM evidence does not replace the image obligation.
  - Evidence: `npx tsc --noEmit` 0; `npx vitest run` 161 files, 1623 tests passed, 0 failed; `npm run build` 0;
    `node tools/live/sheet-grammar.mjs` 0 (28 lanes) with L1-L6 all at target on all three filter surfaces; the 071
    floor unchanged and green; `npm run gate` exit 0 (28 green, 0 red for a declared reason). No clause was made to
    pass by deleting it: the six are new in this leg and their RED numbers are recorded above.

- [ ] T012 Exercise the real-app and keyboard paths — RED: a Chrome/WebKit sheet-rebuild add-row, inside-tap, rebuild or keyboard-inset assertion fails or is unobserved; producer change: fix the production path named by the assertion while keeping renderer/data boundaries unchanged; GREEN: the filter sheet remains open for inside taps/rebuild, add actions work, and the keyboard probe keeps header, input and clear/edit reachable; capture: `tools/live/sheet-rebuild.json` and sheet-grammar keyboard evidence; judge: read the exact filter cases, not unrelated passing cases.

- [ ] T013 Judge pass twice on an unchanged tree — RED: the first image-judge score is below 14/16 or any row is 0; producer change: for every row below 2, run a new RED → producer fix → GREEN → recapture cycle and document it in verification.md; GREEN: two consecutive complete eight-row passes each score at least 14/16 with no zero and the tree SHA is unchanged between them; capture: primary full-sheet light/dark plus active-rule companion; judge: record both complete score tables and one-line findings.

- [ ] T014 Operator gate and closeout — RED: acceptance/goal/verification lacks the operator row, or it is accidentally ticked by an agent; producer change: keep the device row present and Unmet/unticked, update progress metadata only after strict validation and graph backfill; GREEN: strict validation is PASSED, the child and parent progress rows say planned until CREATE lands, the named commit carries both required trailers, rebase/push succeeds and origin has no root `.handover.md`; capture: final evidence index and handover entry; judge: the operator is the sole judge of device alignment.
<!-- /ANCHOR:tasks -->

---

<!-- ANCHOR:completion -->
## Completion rules

T013 cannot close on a single score or on a changed-tree re-judge. Two passes must be consecutive
and on an unchanged tree. T014 must leave the operator row unticked even when every agent-side
criterion is green. A contradiction with a landed 071 ruling remains a Proposed ADR under D15.
<!-- /ANCHOR:completion -->
