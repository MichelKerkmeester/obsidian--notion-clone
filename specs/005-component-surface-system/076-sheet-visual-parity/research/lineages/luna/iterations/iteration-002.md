# Iteration 2: DEPTH — grading every child and phase against L3/L3+

## Focus

Grade all 19 children across DEFINE, PLAN, CREATE, SCREENSHOT, VERIFY, and REMEDIATE. L3 means a task has a measurable threshold, an explicit RED/GREEN lane clause, capture IDs, and rubric rows. L3+ additionally names both themes, relevant states/edge cases, and the judge’s expectation per rubric row.

## Actions Taken

- Read every child plan.md, tasks.md, acceptance-criteria.md, spec.md, verification.md, and the parent six-step contract.
- Compared all phase tables and task groups with D1/D2/D3/D7/D9.
- Counted the recurring pattern: all child plans still carry a Level 2 marker; 003–012 mostly have no Source column; 013–019 have it but use generic phase tasks.
- Read the special depth already present in 001/002 and the representative/anchor-surface compromises in 013–019.

## Findings

### DEP-001 — The common scaffold is L2-shaped even where the prose says “L3”

Evidence:

- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/plan.md:14,111-116] — the plan is marked SPECKIT_LEVEL: 2; its phase table names the six artefacts and broad pass rules but not the per-row judge expectation.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/tasks.md:30,38-52] — tasks say each task “states a number,” but DEFINE still asks for a generic table and PLAN only says “one lane clause per measurable row”; no stable row IDs, capture IDs, or rubric mapping are required.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/acceptance-criteria.md:30-39,41-56] — acceptance rows require a generic 14/16 score and generic light/dark captures, while the rubric section lists row names without the expected score/observable for this child.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/013-board-card-properties-visual-parity/tasks.md:57-85] — the newer child has generic “run every new clause RED,” “open both captures,” and “score the eight-row rubric” tasks, not thresholds and per-row judge assertions.

Finding: L2 documentation can pass a checklist while leaving the implementer to decide which number, which capture, which state, and which rubric row matter. Every child needs a concrete phase contract, even if it shares the same primitives.

### DEP-002 — DEFINE is below L3 for 003–012 and incomplete in a different way for 001/002

Evidence:

- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/spec.md:238-250] — the DEFINE table has Element | Ours today | Notion (structural) | Target but no Source column, and its D7 note still says the table’s “card” wording is not rewritten.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/006-add-view-sheet-visual-parity/spec.md:235-244,246-249] — targets are detailed but still use “one card” and the lane row repeats that card premise; D7 is only a later override.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity/spec.md:236-244,285-288] — 001 has real reference paths and provisional registers, but its table uses “Where it comes from” rather than the required per-element Source choice and its numeric targets are ratio-derived from a thumbnail.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/002-properties-sheet-visual-parity/plan.md:144-147] — 002’s phase table starts at CREATE; DEFINE and PLAN are absent from the plan’s six-step table even though the tasks file has an A–B completion block.

Finding: 001/002 contain richer measurements but still need normalized L3 row IDs and source/reason fields; 003–012 need a Source column, explicit D7 target rows, and per-state capture IDs. A phase cannot be called definition-complete because a later CREATE note says “D7 overrides it.”

### DEP-003 — PLAN and CREATE name producers, but do not bind every threshold to a lane assertion and a result receipt

Evidence:

- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/004-sort-sheet-visual-parity/tasks.md:47-65] — PLAN says “one lane clause per measurable row,” while CREATE has specific red counts for L1–L3 but combines L4/L5 as “RED → GREEN”; the task does not require assertion IDs, selector/fixture, or result file.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/005-group-sheet-visual-parity/tasks.md:47-65] — group creation names a row count and chevron count but has no target for both themes or the missing-reference Shown/Hidden decision.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/016-view-toolbar-options-visual-parity/tasks.md:47-60] — PLAN names four renderers, but CREATE applies one shared divider change and a generic “every clause” RED/GREEN sequence without a per-toolbar expected result.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/019-board-card-drag-feel-clickup/tasks.md:45-59] — the plan improves the evidence shape with deterministic checkpoints, but the RED/GREEN task still does not name expected checkpoint values (rotation, shadow, placeholder opacity, target contrast, auto-scroll delta).

Finding: producer paths are traceable at file level, but measurement contracts are not traceable at assertion level. Add clause IDs, selector/fixture, expected range, RED baseline, GREEN result, theme, and receipt/hash to every PLAN/CREATE row.

### DEP-004 — SCREENSHOT is generally L2 because the capture identity and full-sheet state are not per child/per theme

Evidence:

- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/tasks.md:72-75] — SCREENSHOT uses the broad screenshots/notion-clone/** path and asks the agent to open “the phone light and the phone dark capture,” not named capture IDs for the sheet and active-rule surface.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/013-board-card-properties-visual-parity/tasks.md:64-68] — the child has one screenshot task for light/dark but no explicit capture names, viewport, full-sheet state, or empty/filled/selected state set.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/017-utility-modal-sheets-visual-parity/plan.md:90-94] — 18 surfaces are judged on a “representative sample,” which is acceptable only if every non-sampled surface has a smoke capture and a per-row consistency assertion; neither is required here.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/019-board-card-drag-feel-clickup/tasks.md:64-68] — the mid-drag checkpoint is named, but capture IDs and a stable viewport/theme/state tuple are not.

Finding: “both themes current and looked at” is not reproducible evidence. D2’s full-sheet variant must be a required capture for every scrollable phone sheet, and each child must enumerate named light/dark captures for every surface or explicitly justify a representative sample plus smoke coverage.

### DEP-005 — VERIFY has a total threshold but not a child-specific per-row expectation

Evidence:

- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/spec.md:258-276] — the parent defines the 8 rows and 0/1/2 semantics, but its row 2 descriptions are generic; the child must bind the composed target to each row.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/tasks.md:80-85] — VERIFY asks for the rubric’s eight row names and a 14/16 total, but does not require the judge to say what “2” means for the merged condition, active-rule popover, or unknown conjunction state.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/019-board-card-drag-feel-clickup/verification.md:40-49] — the score table has light/dark columns and the total rule, but no per-row expectation beyond the generic rubric labels.

Finding: the judge can report 14/16 without proving the target that caused the score. Every child needs an eight-row expectation block: the exact observable for Frame, Sections, Row anatomy, Controls, Type, Spacing, Colour, and Both themes, plus the failure reason and capture IDs.

### DEP-006 — REMEDIATE is L2 in most children: it lacks per-row task identity, tree hash, and state-specific re-capture

Evidence:

- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/tasks.md:90-94] — one generic remediation task covers every rubric row, then says three failures reopen DEFINE; it does not require a row-specific issue ID, tree hash, or capture pair.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/013-board-card-properties-visual-parity/tasks.md:81-85] — the same generic fix cycle and close-out is repeated for the new child.
- [SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity/tasks.md:97-124] — 001 is stronger with a frame-ruling remediation and numeric RED targets, but it still needs the new D7 result, per-row score linkage, and immutable tree hash in each judge pass.

Finding: the shared remediation sentence describes intent, not an auditable state transition. Add a remediation ledger keyed by child/rubric-row/iteration, with failing assertion, target, changed files, RED/GREEN results, light/dark/full-sheet captures, judge scores, unchanged-tree hash, and the three-fail DEFINE reopen rule.

## Current depth grade matrix

L2 means below the requested L3 contract; L3 means the phase has the minimum measurable contract; L3+ means it also binds both themes, states/edge cases, and per-row judge expectations. These are current grades before the proposed addendum below.

| Child | DEFINE | PLAN | CREATE | SCREENSHOT | VERIFY | REMEDIATE | Main missing L3/L3+ proof |
|---|---:|---:|---:|---:|---:|---:|---|
| 001 settings | L3 | L3 | L3 | L2 | L2 | L3 | Source column; full-sheet IDs; per-row judge expectations; hash ledger |
| 002 properties | L3 | L2 | L3 | L2 | L2 | L3 | A/B omitted from plan phase table; Source column; state/score bindings |
| 003 filter | L2 | L3 | L3 | L2 | L2 | L2 | Source; named light/dark/full-sheet captures; active-rule per-row judge contract |
| 004 sort | L2 | L3 | L3 | L2 | L2 | L2 | Source; sort-sheet and active-rule capture/state IDs; delete-placement expectation |
| 005 group | L2 | L3 | L3 | L2 | L2 | L2 | Source; no-reference Shown/Hidden decision; picker state and judge rows |
| 006 add view | L2 | L3 | L3 | L2 | L2 | L2 | Source; D7 no-card rewrite; tile/selected/scroll captures |
| 007 property editor | L2 | L3 | L3 | L2 | L2 | L2 | Source; replaced-vs-stacked state; keyboard/locked/error captures |
| 008 record | L2 | L3 | L3 | L2 | L2 | L2 | Source; detail/peek/docked states; shared-row identity judge |
| 009 menu/confirm | L2 | L3 | L3 | L2 | L2 | L2 | Source; menu/confirm/stack states; action-order expectation |
| 010 pickers | L2 | L3 | L3 | L2 | L2 | L2 | Source; selected/empty/search states per picker; per-picker judge rows |
| 011 toolbar/width | L2 | L3 | L3 | L2 | L2 | L2 | Source; overflow/open/scroll/floating states; per-surface capture IDs |
| 012 board fields | L2 | L3 | L3 | L2 | L2 | L2 | Source; phone/desktop IDs; one-column/card-label judge expectation |
| 013 board properties | L3 | L2 | L2 | L2 | L2 | L2 | Mount function; concrete row thresholds; capture IDs; per-row judge/ledger |
| 014 fuzzy suggest | L3 | L2 | L2 | L2 | L2 | L2 | Five call-site states; smoke plus representative evidence; result-row thresholds |
| 015 cell editors | L3 | L2 | L2 | L2 | L2 | L2 | Inline/keyboard/empty states; exact control thresholds; per-editor judge |
| 016 toolbar options | L3 | L2 | L2 | L2 | L2 | L2 | Per-toolbar clauses/captures; no-reference disclosures; event-menu decision |
| 017 utility modals | L3 | L2 | L2 | L2 | L2 | L2 | 18-surface smoke coverage; representative sampling rule; per-modal divergence ledger |
| 018 board ClickUp | L3 | L2 | L2 | L2 | L2 | L2 | Board clause thresholds; phone/desktop states; ClickUp row expectations |
| 019 board drag ClickUp | L3 | L2 | L2 | L2 | L2 | L2 | Checkpoint values; mid-drag captures; motion/feel rubric expectations |

No current child is L3+ in every phase. The goal of the addendum is to raise every cell to at least L3 and the visual judge/capture cells to L3+ where the evidence shape permits it.

## Patch-ready L3/L3+ addendum

Paste this block into every child tasks.md after its six phase groups, replacing <C> with the child number. The child-specific rows below replace the generic placeholders.

> **L3/L3+ evidence contract for child <C>.** Assign stable row IDs C<C>-D01… to every DEFINE row. Each row must have Ours, Reference, Target, Source, Source reason, state, theme, capture IDs, lane clause ID, and rubric rows. PLAN must name the producer selector/function, stylesheet region, scenario ID and mount function, and the exact assertion for each row. CREATE must run C<C>-L01… RED before the producer edit and GREEN after it, recording {actual,target,theme,state,fixture,commit}. SCREENSHOT must emit named captures C<C>-<surface>-<state>-mobile-{light,dark}.png plus <surface>-sheet-mobile-{light,dark}.png for every scrollable sheet; no wildcard-only evidence is accepted. VERIFY must include one expectation line for each of the eight rubric rows and a score for every named surface/state. REMEDIATE must append C<C>-R<iteration>-<rubric-row> records with failing clause, changed path, RED/GREEN results, both-theme capture IDs, judge score, and unchanged-tree hash; two consecutive pass rows must carry the same hash.

Use these universal phone targets unless the child’s table has a more specific measured target: no rounded/lighter row container (cardContainers = 0); sheetInset = 16px ±0.5; row pitch >=44px; grab handle 34px × 5px, 6px ±1px below the top edge; title centre <=1px; hairline divider at every group boundary; and light/dark captures with the same DOM structure. Board-card 012/018/019 use their own board geometry where a sheet constraint is inapplicable, but still require both themes and named states.

### Child-specific expected clauses

| Child | DEFINE/PLAN rows to add | CREATE threshold and RED/GREEN clause | SCREENSHOT states/capture IDs | VERIFY per-row expectation |
|---|---|---|---|---|
| 001 | frame, name, navigation rows, action rows, theme; producer view-config-panel-renderer.ts, mount constructed-view-config | cardContainers=0; dividers>=4; row pitch 44–52px; bordered naming/search inputs only; RED/GREEN in light+dark | settings-rest, settings-scroll and full-sheet pairs in light/dark | Frame=2 only with no card; Controls=2 only with navigation rows and bordered naming field; Both themes=2 only if full-sheet captures match |
| 002 | shown, hidden, reorder, eye state; producer column-manager-renderer.ts + property-row.ts, mount constructed-column-manager | cardContainers=0; rowMin>=44; eyeCount=propertyRowCount; arrow keyboard path retained; RED/GREEN | shown/hidden/empty/drag-focus, light+dark, full-sheet pair | Row anatomy=2 only for arrow/type/label/eye identity; Sections=2 only with divider-separated Shown/Hidden groups |
| 003 | summary, detail, comparator, active-rule, conjunction; both filter producers | summary rows 1/condition; detail 3 rows/1 outline; inline operator dropdowns 0; active-rule 3-column rows 0; RED/GREEN | filter-list/detail/comparator/active-rule/empty, both themes and full-sheet | Controls=2 only for drill-in comparator; Sections=2 only for summary/detail/action boundaries; unknown conjunction stays TBD |
| 004 | rule, direction, active-rule, delete; both sort producers | one merged rule outline; direction inline dropdowns 0; delete placement asserted; RED/GREEN | no-rules/one-rule/multi-rule/direction/active-rule, both themes | Row anatomy=2 only if property+direction order matches; Controls=2 only if direction is drill-in; per-row delete expectation recorded |
| 005 | entry, picker, selected, shown-hidden decision | entry row count target; picker chevrons 0; selected checkmark 1; cardContainers 0; RED/GREEN | entry/picker/selected/empty, both themes | Sections=2 only after the Shown/Hidden decision is explicit; Controls=2 for terminal picker rows |
| 006 | layout tiles, selected tile, boolean, value row, action | tile count 9; selected tiles 1; toggle rows have toggles; navigation rows have chevrons; cardContainers 0 after D7; RED/GREEN | table/chart selection, toggle/value, help/action, both themes, full-sheet | Row anatomy/Controls expectations differ by boolean vs value row; Frame=2 only without stale card |
| 007 | name, type list, locked, keyboard, delete | property rows pitch >=44; single scroll owner; third-level stack 0 if replacement target chosen; RED/GREEN | add/edit/locked/keyboard/error/delete, both themes and full-sheet | Controls=2 only for chosen replace/stack model; Both themes includes keyboard and scroll state |
| 008 | detail, peek, docked, property row, editors | row DOM identity equals 002; row pitch >=44; docked/phone frame separate; RED/GREEN | detail/peek/docked/select/date/relation, both themes | Row anatomy=2 only with shared property-row identity; Frame expectation separate for docked vs phone |
| 009 | record menu, cell menu, confirm, column submenu, action order | menu rows >=44; stacked depth named; confirm action order matches seven-reference read; RED/GREEN | each menu, confirm-over-sheet, submenu depth, both themes | Controls=2 for destructive vs secondary actions; Sections=2 only with no card grouping |
| 010 | date, icon, colour, type, search/selected | picker row pitch >=44; selected checkmark 1; search field only recessed control; RED/GREEN | empty/selected/search/date-time/type, both themes | Row anatomy and Controls scored per picker family, not on one representative |
| 011 | toolbar, tab, utilities, width, overflow | labelled icon+label buttons; horizontal overflow 0; width frame target named; RED/GREEN | toolbar/rest/overflow/column-width/scroll, both themes | Frame distinguishes floating column width from flush sheet; Controls=2 for labelled actions |
| 012 | grid, labels, longest value, desktop/phone | grid columns 1 at phone and desktop target per spec; labels scrollWidth<=clientWidth; RED/GREEN | board phone/desktop, light+dark, longest-label state | Row anatomy=2 only if labels stay visible and values do not wrap; board exception to 44px sheet floor explicit |
| 013 | row shell, visibility, reorder, board context | field-row count equals configured fields; shared shell identity; cardContainers=0; RED/GREEN | empty/shown/hidden/overflow, both themes and full-sheet | Row anatomy=2 only after 002 sharing is proven; Sections=2 for visibility groups |
| 014 | base, image, markdown, settings template, cover | result row pitch >=44; query/empty/loading/error states have named predicates; RED/GREEN | five call sites × query/empty/selected, both themes | Judge representative plus smoke score; divergent chrome is a finding |
| 015 | text, select, keyboard, empty | one control kind per editor; full-width control within 16px inset; RED/GREEN | text/select/keyboard/empty, both themes | Controls=2 only for correct type-specific editor; Both themes includes keyboard state |
| 016 | calendar, timeline, chart, mini-calendar, event-menu decision | each toolbar has its own clause; selected state count 1 where applicable; RED/GREEN | four toolbars × rest/selected, both themes | Per-toolbar consistency score plus anchor rubric; none references remain explicit |
| 017 | D01–D18 one row per utility modal, plus toast/bulk-edit | shared chrome divergence count 0 or named exceptions; row pitch/inset/card count asserted; RED/GREEN | every modal smoke capture; import/formula/status representative full pair | Representative judge cannot close unobserved divergence; each modal has smoke expectation |
| 018 | headers, collapse, add, column, card | ClickUp header/button/card predicates with numeric bounds recorded RED/GREEN; 012 regression unchanged | phone/desktop × light/dark × expanded/collapsed | Frame/Sections/Controls name ClickUp header anatomy and 012 boundary |
| 019 | ghost, placeholder, target, auto-scroll, lift | checkpoint values: lift delay 450ms, movement threshold 10px, ghost rotation/shadow, placeholder opacity, target delta; RED/GREEN | mid-drag-over-target light/dark plus source/placeholder checkpoint pairs | Sections distinguish source/target/neighbours; Spacing/Colour include motion-state values; operator owns feel gate |

## Questions Answered

- Q2: **No.** The current matrix has many L2 cells; only parts of 001/002 and the DEFINE/PLAN portions of several later children reach L3. No child is L3+ across all six phases.

## Questions Remaining

- Are 001/002’s richer completed measurements authoritative after D7, or should their frame tables be normalized before any further child starts?
- Does the operator want representative judging for bundled 014/016/017, provided every unjudged surface has a smoke capture and lane assertion?
- Which exact row-level numbers should remain provisional until the operator supplies C-1…C-6 and the settings capture?

## Next Focus

REFERENCE COMPOSITION — audit every DEFINE Source column, D7 frame application, stacked-sheet rule, ClickUp board lead, and contradictory card/replace-in-place language; draft Proposed ADRs without resolving operator-only choices.

## Assessment

- newInfoRatio: 0.88
- Novelty justification: the children already advertised six phases, but a complete cross-child grade exposed systematic L2 gaps in capture identity, per-row judge expectations, and remediation receipts, plus 002’s missing A/B phase rows.
- Confidence: High for the repeated scaffold gaps; medium for whether representative bundled judging is acceptable to the operator.

## Reflection

- Worked: comparing phase tables with task groups and acceptance tables distinguished named intent from an auditable threshold.
- Ruled out: treating a generic “≥14/16” row or wildcard screenshot directory as L3 evidence.
- Convergence telemetry is ignored; the reference-composition pass is mandatory next.

## Sources Consulted

All 19 child spec.md, plan.md, tasks.md, acceptance-criteria.md, goal.md, and verification.md files; parent spec.md §5; coverage-audit.md; decision-record.md D1–D9.
