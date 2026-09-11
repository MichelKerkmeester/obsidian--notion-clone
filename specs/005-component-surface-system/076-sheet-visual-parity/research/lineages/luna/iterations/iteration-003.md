# Iteration 3: REFERENCE COMPOSITION — source rungs, D7 migration, and stacking precedence

## Focus

Audit every 076 child DEFINE table for a per-element Source choice and reason; check that D7's plain-background frame ruling and D9's best-of-three reference composition are applied in the target rather than deferred to CREATE; verify that boards lead with ClickUp while 012 retains its explicit Anytype field-layout exception; and reconcile the D9 stacked-sheet rule with the landed role-scoped replace-in-place implementation.

## Actions Taken

- Re-read the canonical state projection, both previous delta streams, the strategy, and the two required prior findings before opening new source files.
- Enumerated the first Element table in every child spec. Only 013 through 019 carry a table header ending in Source; 001 uses Where it comes from, and 002 through 012 omit Source from the DEFINE table.
- Read D7 and D9, the parent goal binding, the parent roadmap transcription, the shared surface shell, overlay stack, and stacked-pair grammar.
- Compared the target language in 001 through 012 with the operator's no-card ruling and compared 007/010's depth language with the implementation's panel-role replacement path.

## Findings

### REF-001 — D9's required Source column is absent or incomplete in most DEFINE tables

Evidence:

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:390-399 — D9 says every sheet child's row-by-row and control-type tables gain a Source column naming Anytype, Notion, or ClickUp and why; it also says the operator's own screenshots and words outrank all three.
- specs/005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity/spec.md:300-305 — the frame table is Property | Target | Where it comes from, not the required Source field, and the value is mixed prose provenance rather than a selected reference plus reason.
- specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/spec.md:238-250 — the table is Element | Ours today | Notion structural | Target, with no Source column and with a target that still says 1 card.
- specs/005-component-surface-system/076-sheet-visual-parity/007-property-editor-sheet-visual-parity/spec.md:244-258 — the table is also missing Source even though its target makes a source-sensitive decision about inline type rows and a three-level chain.
- specs/005-component-surface-system/076-sheet-visual-parity/013-board-card-properties-visual-parity/spec.md:221-226 — a later child has a Source column, but its values are not paired with a Source reason column, so the reason still has to be inferred from prose.
- specs/005-component-surface-system/076-sheet-visual-parity/018-board-visual-parity-clickup/spec.md:246-253 — board rows select ClickUp, but the table does not expose a reason field or a per-row operator/source rung.

Finding: Source coverage is not binary. 001 and 002 have provenance prose, 003 through 012 lack the normalized field, and 013 through 019 have Source but not a required reason, evidence rung, or operator-override marker. A paste-ready schema must be applied to every DEFINE row and every control-type row, not only added to the newer children.

### REF-002 — D7 is present as a note but stale card targets remain executable

Evidence:

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:295-318 — D7 states that sheet content is one plain sheet background, rows use hairline dividers, and “No rounded or lighter container of any kind around a row or a value.”
- specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/spec.md:220,242-250 — the packet says the table was not rewritten and targets “1 card containing 3 rows”; the active target therefore contradicts D7 until an implementer remembers the later note.
- specs/005-component-surface-system/076-sheet-visual-parity/006-add-view-sheet-visual-parity/spec.md:218,235-249 — the packet explicitly says D7 overrides the scaffold “at CREATE time,” while the table and lane still require “1 card.”
- specs/005-component-surface-system/076-sheet-visual-parity/005-group-sheet-visual-parity/spec.md:238-255 — entry and picker targets repeatedly call for cards after the D7 note has already prohibited grouping containers.
- specs/005-component-surface-system/076-sheet-visual-parity/goal.md:85-100 — the parent binding still says “several inset cards,” “Shown / Hidden cards,” and “one card of settings rows,” which can regenerate the stale premise after a child spec is read.
- styles.css:320-340 — an old obnotion-mobile-bottom-sheet.obnotion-sheet-card presentation remains in the shared stylesheet, with centered floating-card geometry and a comment describing a menu-role card.

Finding: D7 is a resolved target rule, not a late implementation hint. Reference descriptions may retain the word card when quoting a source image, but target, goal, lane, acceptance, and judge language must say plain background, divider group, terminal action group, or selection band. Otherwise a green lane can still certify the prohibited container.

### REF-003 — D9's source composition and board scope are partly correct but need an explicit 012 exception

Evidence:

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:400-412 — boards lead with ClickUp, while operator words outrank all references; the hard constraints include no grouping containers, a handle, 16pt inset, and rows at least 44pt.
- specs/005-component-surface-system/076-sheet-visual-parity/012-board-card-fields/spec.md:235-247 — 012 explicitly says D9 names ClickUp for board surfaces but keeps Anytype for this single-column field grid and does not rewrite its scaffolded table.
- specs/005-component-surface-system/076-sheet-visual-parity/018-board-visual-parity-clickup/spec.md:84-94 — 018 makes ClickUp the board-specific Source for every row and excludes 012's meta-grid rule.
- specs/005-component-surface-system/076-sheet-visual-parity/019-board-card-drag-feel-clickup/spec.md:84-92 — 019 likewise makes ClickUp the source for the drag presentation and excludes the static board chrome.

Finding: The apparent 012-versus-D9 conflict is already intentionally resolved by scope: 012 is an Anytype exception for field layout; 018 and 019 are ClickUp-led for board chrome and motion. The exception must be repeated in the parent goal, coverage matrix, and each board child so a future “ClickUp leads boards” patch does not regress 012's single-column rule.

### REF-004 — D9's stacked picker rule conflicts with the role-scoped replace-in-place path and 007's inline target

Evidence:

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:411-416 — D9 calls for stacked sheets for sub-menus and pickers, and says this is a hard constraint regardless of reference composition.
- src/views/surface-shell.ts:346-353 — the implementation states “no third stacked sheet, the third level replaces the second” and scopes replacement to panel and condition panel roles.
- src/views/surface-shell.ts:510-541 — a panel-role surface installs a replace callback; a child accepted by that callback is absorbed, loses the sheet class, and is not independently presented.
- src/views/overlay-stack.ts:119-130 — a new sheet at depth two is offered to the parent's replace callback before registration; a parent without the callback stacks normally.
- tools/live/sheet-grammar.mjs:403-412,428 — the properties type picker is documented as replace-in-place while the record column submenu and import chain retain depth-three stacked registrations.
- specs/005-component-surface-system/076-sheet-visual-parity/007-property-editor-sheet-visual-parity/spec.md:248-268 — 007 targets an inline type list with sheet depth at most two and says the existing separate level is a Proposed ADR; 010 inherits whatever 007 lands.

Finding: The implementation has a deliberate distinction between navigation/menu stacks and form-like replacement, but D9's prose does not state that exception. 007 also mixes the Notion inline target with the D9 stacked-picker hard constraint. This is an operator choice, not a safe inference: either D9 must explicitly exempt panel-role property type selection, or 007 must keep a stacked picker and revise its reference target. Record both paths as Proposed ADR-N before the child is allowed to close.

### REF-005 — The source ledger must distinguish reference description, target authority, and unresolved evidence

Evidence:

- specs/005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity/spec.md:230-248 — 001 records D3 rungs and says the operator/full-resolution rungs are empty, while its actual table still mixes operator ruling, Notion, ClickUp, and internal implementation provenance.
- specs/005-component-surface-system/076-sheet-visual-parity/002-properties-sheet-visual-parity/spec.md:230-260 — 002 distinguishes primary Property visibility references, a separate property editor reference, Anytype tie-break, and internal landed rulings, but the table does not carry that distinction in a Source/reason field.
- specs/005-component-surface-system/076-sheet-visual-parity/017-utility-modal-sheets-visual-parity/spec.md:246-260 — 017 correctly names an Internal source because no external reference exists, but it still needs a row-level reason and an explicit no-external-reference marker for the judge.

Finding: “Notion structural” is insufficient because it hides whether a row is a rung-2 full-resolution image, a rung-3 thumbnail, a tie-break, an operator ruling, or an internal family invariant. The normalized row must capture source, reason, evidence rung, and whether the target is measured, structural, or TBD.

## Composition source map to paste into child DEFINE tables

This is the minimum recommended composition. The exact row IDs and captures remain child-owned, but the source choice is fixed enough to prevent re-derivation.

| Child | Frame and header | Row/control anatomy | Picker/selection/action | Required qualification |
|---|---|---|---|---|
| 001 settings | Operator D7 for frame; Notion for title/navigation header, with ClickUp close as ADR-I input | Notion View options | Notion for naming and navigation; Anytype tie-break for divider grammar | Operator frame outranks all; header control remains ADR-I |
| 002 properties | Operator D7 | Notion Property visibility R-1/R-2; Anytype only as tie-break | Notion eye state; internal 071 arrow-pair keyboard invariant | Keep Shown/Hidden decision as internal/TBD where reference is absent |
| 003 filter | Operator D7 | Notion list/detail/comparator | Notion drill-in comparator; conjunction operator capture is TBD | Never claim a Notion conjunction position |
| 004 sort | Operator D7 | Notion merged rule and labelled delete | Notion drill-in direction and action placement | 071 reorder is internal landed invariant pending operator capture |
| 005 group | Operator D7 | Notion entry/picker | Notion terminal picker/checkmark; Shown/Hidden is internal consistency, not a Notion claim | Missing group reference remains explicit |
| 006 add view | Operator D7 | Notion Layout tiles, toggles, navigation rows | Notion selected tile and primary action | Replace every target card with divider groups |
| 007 property editor | Operator D7 | Notion inline type list and bordered name field | Notion type selection; stacking is Proposed ADR-N | Delete colour convention remains evidence-dependent |
| 008 record | Operator D7 | Notion record page; 002 row identity is internal shared primitive | Notion detail/edit controls; internal docked state | State whether each row is external or shared-system evidence |
| 009 menu/confirm | Operator D7 | Notion menu and confirm anatomy | Notion action order; D9 stacking for submenu | Confirm sample size and source rung are mandatory |
| 010 pickers | Operator D7 | Notion date/type, Anytype icon/colour where stronger | Notion/Anytype selected state per picker | Property-type stack follows ADR-N, not silent inheritance |
| 011 toolbar/width | Operator D7 | Internal 075 labelled-button invariant; Notion only where a real capture is named | Internal for no-reference width surface | No invented reference source for column width |
| 012 board fields | Board frame internal/D7; Anytype is the settled field-layout reference | Anytype single-column fields | Anytype; ClickUp is not used to reopen this rule | Explicit D9 board exception |
| 013 board properties | Operator D7 | Notion base visibility plus ClickUp icon-tile idea | Notion/ClickUp per row | Source reason must name the mix and the shared 002 test |
| 014 fuzzy suggest | Operator D7 for mobile frame | Anytype structural result-list reference | Internal for mobile shell and no Notion/ClickUp file-picker reference | Desktop Anytype is structural only; no false 1:1 claim |
| 015 cell editors | Operator D7 | Internal shared editor grammar, supplemented by named Notion/Anytype capture if present | Per-editor source; no source if none | Keyboard/inline state is ours unless observed |
| 016 toolbar options | Operator D7 | Notion/Anytype for mini-calendar anchor; Internal for zero-reference toolbars | Per-toolbar source or explicit none | Representative judge cannot erase zero-reference status |
| 017 utility modals | Operator D7 | Internal DbModal/shared chrome | Internal; no external reference | Every unobserved modal needs smoke evidence |
| 018 board ClickUp | Operator board ruling and D7 no-container floor | ClickUp | ClickUp for header/body/card; 012 stays Anytype | Phone/desktop and expanded/collapsed state IDs |
| 019 board drag ClickUp | Operator board ruling | ClickUp motion reference | ClickUp | Exact motion values remain TBD until calibrated |

## Proposed text ready to paste

### Common DEFINE table replacement for every child spec.md section 13

Replace each target table header with:

| Row ID | Element | Ours today | Target | Source | Source reason | Evidence rung | Measurement kind | State | Theme | Capture IDs | Lane clause | Rubric rows |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

Use Source values Operator, Anytype, Notion, ClickUp, Internal, or None. Source reason must be one sentence naming the observed element and why it is the best authority. Evidence rung must be operator, full-resolution, thumbnail, internal, or unreadable. Measurement kind must be measured, structural, or TBD. A row whose source is None must state “no reference in repository” and must inherit only the shared system contract; it may not borrow a visual number from another product. A row with an operator ruling must mark that ruling as higher authority than the three product references.

### Common D7 migration text for every sheet child and the parent goal

**D7 target normalization.** The word card may remain in a quoted reference description only when it labels what the source image appears to show. It must not appear as the target container, lane assertion, acceptance criterion, judge expectation, or completion binding. Replace that target with plain sheet background, divider-separated group, terminal action group, recessed search control, or full-width selection band as applicable. Assert cardContainers = 0 for every sheet, except that a selected-row band is allowed only when the row is selected and the band is not a grouping container. A later CREATE note may explain the migration but cannot be the only place where D7 is enforced.

Apply this to 076/goal.md and the target/lane sections of 001 through 011 and any later child that uses card vocabulary. Preserve the original reference wording in a clearly labelled reference-only column so the image judge can distinguish source description from our target.

### Proposed ADR-N — picker stacking versus form replacement

| ADR-N | D9 hard constraint versus D2a depth-cap implementation | Status |
|---|---|---|
| Picker presentation precedence | D9 requires stacked sheets for sub-menus and pickers. surface-shell.ts replaces a third child for panel and condition panel roles; 007 targets an inline property-type list; sheet-grammar.mjs still stacks record submenus and import chains. The operator must choose one of: (A) every picker, including property type, stacks with its own handle/header; (B) navigation pickers stack, but form-role property type selection is an explicit inline/replacement exception; or (C) the property editor target changes to the stacked reference. Until chosen, 007 and 010 record both candidate lanes and cannot mark the stacking row resolved. | Proposed — operator decision required |

### Proposed ADR-O — source provenance schema

Every child DEFINE and control-type table carries Source, Source reason, Evidence rung, Measurement kind, State, Theme, Capture IDs, and Rubric rows. The operator's own image and words outrank Anytype, Notion, and ClickUp. Structural describes what an image can establish; it does not authorize a pixel number. Missing references remain None/TBD. This ADR is a documentation gate: no PLAN or CREATE task may start while a target row lacks these fields.

### Proposed ADR-P — board-reference scope

ClickUp is the lead reference for 018 and 019 and for future board chrome/motion rows. 012 is a settled exception: its single-column board-card field layout remains judged against Anytype under ADR-008 and is excluded from the ClickUp retarget. Any parent coverage or goal table that says “ClickUp leads boards” must carry the 012 exception inline.

## Questions Answered

- Q3 is answered negatively for the current packet: no, every DEFINE row does not yet choose a normalized source and reason, and D7 is not applied in every executable target.
- The 012/018/019 board scope is answered: 012 remains an Anytype field-layout exception; 018 and 019 are ClickUp-led.
- The stacking contradiction is real and unresolved: the operator must choose whether D9 has a panel-role replacement exception or whether 007's inline target changes.

## Questions Remaining

- Which ADR-N option does the operator choose for the property-type picker and other form-role pickers?
- Does the operator want all legacy reference descriptions rewritten, or only executable target/lane/goal text with a reference-only column preserving the historical read?
- Should 011 and 017 use Internal as their primary source for no-reference surfaces, or should a new operator capture be supplied before judging?

## Next Focus

DESIGN SYSTEM — connect all children to shared tokens and primitives, identify current per-surface CSS drift, and prescribe a landing order that respects the single CSS lane and both themes.

## Assessment

- newInfoRatio: 0.84
- Novelty justification: the source audit distinguished absent Source fields from present-but-unexplained Source values, and the runtime inspection exposed a specific D9 versus replace-in-place precedence gap that a generic composition checklist would miss.
- Confidence: High for missing/incomplete Source metadata and stale D7 target language; high for the 012 exception; medium for the operator's intended picker exception.

## Reflection

- Worked: comparing the source tables with D7/D9 and then tracing the actual replace callback through surface-shell.ts and overlay-stack.ts.
- Ruled out: treating “D7 overrides at CREATE time” as a sufficient target contract, treating a Source column without a reason as traceability, and treating ClickUp's board lead as permission to rewrite 012.
- Convergence telemetry remains ignored; iterations 4 and 5 are required.

## Sources Consulted

Parent decision-record.md D6, D7, and D9; parent goal.md; parent roadmap.md section 4 and sections 7.19 through 7.21; every child spec.md DEFINE table; styles.css; src/views/surface-shell.ts; src/views/overlay-stack.ts; tools/live/sheet-grammar.mjs.
