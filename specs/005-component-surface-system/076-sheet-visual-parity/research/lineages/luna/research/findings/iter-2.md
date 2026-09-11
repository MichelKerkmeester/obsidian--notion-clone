# Iteration 2 — DEPTH

## Gap class

DEPTH — grade every 076 child against L3/L3+ for DEFINE, PLAN, CREATE, SCREENSHOT, VERIFY, and REMEDIATE.

## Evidence (path:line + quote)

- specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/plan.md:14,111-116 — the packet is marked SPECKIT_LEVEL: 2 and its phase table names broad artefacts, not per-row judge expectations.
- specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/tasks.md:30,38-52 — the task says every task “states a number,” but does not require stable row IDs, capture IDs, or a rubric mapping.
- specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/acceptance-criteria.md:30-39,41-56 — acceptance asks for a generic 14/16 result and generic light/dark captures; it does not define what a score of 2 means for the filter-specific rows.
- specs/005-component-surface-system/076-sheet-visual-parity/013-board-card-properties-visual-parity/tasks.md:57-85 — the newer packet still uses generic “every new clause,” “both captures,” and “eight-row rubric” tasks.
- specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/spec.md:238-250 — the DEFINE table has Element, Ours today, Notion structural, and Target, but no Source column; its D7 wording is deferred to CREATE.
- specs/005-component-surface-system/076-sheet-visual-parity/006-add-view-sheet-visual-parity/spec.md:235-244,246-249 — the target and lane still say “one card” even though D7 is only a later override.
- specs/005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity/spec.md:236-244,285-288 — 001 has reference paths and measurements, but uses “Where it comes from” rather than a normalized Source and reason field.
- specs/005-component-surface-system/076-sheet-visual-parity/002-properties-sheet-visual-parity/plan.md:144-147 — the phase table starts at CREATE, leaving DEFINE and PLAN absent from the plan-level six-step contract.
- specs/005-component-surface-system/076-sheet-visual-parity/019-board-card-drag-feel-clickup/tasks.md:45-68 — deterministic checkpoints are named, but expected rotation, shadow, placeholder opacity, target contrast, auto-scroll delta, and capture identity are not.

## Finding

The 19 children are phase-shaped but not audit-shaped. All plans retain a Level 2 marker. The common language “states a number,” “take both captures,” and “score 14/16” leaves the implementer to choose the assertion, state, evidence name, and judge expectation. 001 and 002 contain richer partial measurements; 003–012 are weakest at DEFINE; 013–019 are weakest from PLAN through REMEDIATE. No child is L3+ in all six phases.

Current grade matrix:

| Child | DEFINE | PLAN | CREATE | SCREENSHOT | VERIFY | REMEDIATE |
|---|---:|---:|---:|---:|---:|---:|
| 001 settings | L3 | L3 | L3 | L2 | L2 | L3 |
| 002 properties | L3 | L2 | L3 | L2 | L2 | L3 |
| 003 filter | L2 | L3 | L3 | L2 | L2 | L2 |
| 004 sort | L2 | L3 | L3 | L2 | L2 | L2 |
| 005 group | L2 | L3 | L3 | L2 | L2 | L2 |
| 006 add view | L2 | L3 | L3 | L2 | L2 | L2 |
| 007 property editor | L2 | L3 | L3 | L2 | L2 | L2 |
| 008 record | L2 | L3 | L3 | L2 | L2 | L2 |
| 009 menu/confirm | L2 | L3 | L3 | L2 | L2 | L2 |
| 010 pickers | L2 | L3 | L3 | L2 | L2 | L2 |
| 011 toolbar/width | L2 | L3 | L3 | L2 | L2 | L2 |
| 012 board fields | L2 | L3 | L3 | L2 | L2 | L2 |
| 013 board properties | L3 | L2 | L2 | L2 | L2 | L2 |
| 014 fuzzy suggest | L3 | L2 | L2 | L2 | L2 | L2 |
| 015 cell editors | L3 | L2 | L2 | L2 | L2 | L2 |
| 016 toolbar options | L3 | L2 | L2 | L2 | L2 | L2 |
| 017 utility modals | L3 | L2 | L2 | L2 | L2 | L2 |
| 018 board ClickUp | L3 | L2 | L2 | L2 | L2 | L2 |
| 019 board drag ClickUp | L3 | L2 | L2 | L2 | L2 | L2 |

The repair is a shared contract plus child-specific rows, not a new generic checklist. Every row must connect a stable DEFINE ID to a producer, a RED/GREEN assertion, named captures, and one or more of the eight rubric rows.

## Proposed text (ready to paste)

Add the following block to every child tasks.md after the six phase groups. Replace C with the child number and replace the child-specific placeholders with the table in the canonical iteration record.

**L3/L3+ evidence contract for child C.** Assign stable row IDs C-D01 onward to every DEFINE row. Each row must contain Ours, Reference, Target, Source, Source reason, state, theme, capture IDs, lane clause ID, and rubric rows. PLAN must name the producer selector or function, stylesheet region, scenario ID, mount function, and exact assertion for each row. CREATE must run C-L01 onward RED before the producer edit and GREEN after it, recording actual, target, theme, state, fixture, and commit. SCREENSHOT must emit named captures C-surface-state-mobile-light.png and C-surface-state-mobile-dark.png, plus surface-sheet-mobile-light.png and surface-sheet-mobile-dark.png for every scrollable sheet; wildcard-only evidence is insufficient. VERIFY must give one expectation line for Frame, Sections, Row anatomy, Controls, Type, Spacing, Colour, and Both themes, then score each named surface/state. REMEDIATE must append C-R-iteration-rubric-row records with the failing clause, changed path, RED/GREEN results, both-theme capture IDs, judge score, and unchanged-tree hash; two consecutive pass rows must carry the same hash.

Use these universal phone targets unless a child table gives a measured exception: cardContainers equals zero; sheet inset is 16px plus or minus 0.5px; row pitch is at least 44px; handle is 34px by 5px and 6px plus or minus 1px below the top edge; title center error is at most 1px; hairline dividers exist at group boundaries; and light/dark captures use the same DOM structure. Board-card children 012, 018, and 019 use their own board geometry where a sheet constraint is inapplicable, but still require both themes and named states.

Child-specific thresholds and judge expectations are enumerated in iterations/iteration-002.md under “Child-specific expected clauses”; copy that table into each child’s DEFINE/PLAN/CREATE/SCREENSHOT/VERIFY tasks and acceptance criteria. This makes the phase grade auditable without re-deriving the target from prose.

## Confidence

High for the repeated scaffold gaps and the current grade matrix; medium for whether representative judging is acceptable for bundled 014, 016, and 017. Operator captures C-1 through C-6 and missing settings captures remain external dependencies, so those values stay provisional where the packet says so.
