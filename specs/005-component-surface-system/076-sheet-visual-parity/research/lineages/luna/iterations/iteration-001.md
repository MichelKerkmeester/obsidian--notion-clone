# Iteration 1: COVERAGE — inventory, roadmap requests, and child ownership

## Focus

Determine whether every operator request in roadmap §4 rows 70–94 and every surface in the 87-row sheet inventory has a named 076 child, task, capture identity, and six-phase lane clause. Treat a contextual assignment as a coverage risk until it has an explicit owner and assertion.

## Actions Taken

- Read `coverage-audit.md` in full, including all 55 primary and 32 stacked rows and its split-vs-bundle rationale.
- Reconciled the parent phase map, plan, goal, tasks, roadmap §4/§6A/§7, `tools/storybook/sheet-inventory.mjs`, and `tools/live/sheet-grammar.mjs`.
- Read all 19 child packet plans at their phase tables and checked the two special placement judgments (properties edit and timeline event menu).
- Compared the inventory’s contextual exceptions with the operator’s literal request for a dedicated multi-phased phase per sheet/dropdown.

## Findings

### COV-001 — The audit maps 87 rows, but two contextual rows do not have a dedicated multi-phased child

Evidence:

- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/coverage-audit.md:15-20]` — “Double check we have inventorized every sheet / dropdown” and the audit records “87 surfaces: 55 primary + 32 stacked.”
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/coverage-audit.md:54-110]` — the primary table assigns rows 1–55 to children, but row 8 `record-peek` is assigned to 008 because it “mounts the record sheet on touch,” while row 30 `dropdown` is assigned to a “Shared primitive — covered contextually.”
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/coverage-audit.md:112-147]` — all 32 paired rows are assigned to an owning child, with row 87 timeline event menu explicitly provisional.
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/coverage-audit.md:166-175]` — the audit calls row 65 and row 87 judgment calls, then says row 30 and row 8 are “covered contextually rather than gaps.”
- `[SOURCE: tools/storybook/sheet-inventory.mjs:7-12]` — the inventory is generator-derived from registries, scans, stories, and the screenshot manifest; it is the authoritative census rather than memory.

Finding: coverage is broad but not literal. `record-peek` and generic `dropdown` have no independent DEFINE table, capture ID, or six-phase plan. A shared primitive can be owned by host children, but that does not prove the primitive’s own phone geometry or the peek handoff. The synthesis must mark both as unowned contextual identity contracts and propose a child, while preserving the existing host-child ownership so work is not duplicated silently.

### COV-002 — The 076 packet contains 19 children, but parent language and D6 still describe an 11-child walk

Evidence:

- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/spec.md:208-216]` — “The eleven phone sheets in the Phase Documentation Map” remains the stated scope even though the map below contains children 012–019.
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/spec.md:285-310]` — the phase map lists children 001–019 and says 012–019 were added later, while the 001–011 sequence is treated as the original eleven.
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/plan.md:107-129]` — the plan says “Sequential, per D4,” then describes 012–019 as additional or independent, but does not define one outer traversal over all 19.
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/tasks.md:43-45]` — T005 still says “Scaffold eleven children.”
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/tasks.md:74-75]` — T013 still says “All eleven map rows complete.”
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:184-289]` and `[SOURCE: specs/005-component-surface-system/roadmap.md:1947-1949]` — D6 names an outer walk “over all eleven,” despite children 012–019 being in the map.

Finding: the repository has 19 multi-document children, satisfying the count threshold, but orchestration semantics can close after 11 and leave 012–019 outside the same completion proof. This is a traceability defect, not a missing-surface count: the map and goal list 19, while scope, tasks, and D6 use 11.

### COV-003 — Roadmap rows 70–88 have external owners but no 076 trace row; rows 89–94 are the 076 programme’s binding requests

Evidence:

- `[SOURCE: specs/005-component-surface-system/roadmap.md:422-451]` — rows 70–88 cover the data regression, linked-view UX, checkbox/radio controls, board discoverability, settings/add-property/UI review, deprecations, testbed, toast, toolbar, alignment, and the step-by-step sheet loop; rows 89–94 then bind the 076 six-phase loop, D7 plain-background ruling, all-surface inventory, and ClickUp board direction.
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/spec.md:218-225]` — the packet puts behavior and the nine non-constructed fixtures out of scope and says contradictions become Proposed ADRs rather than amendments.
- `[SOURCE: specs/005-component-surface-system/076-sheet-visual-parity/plan.md:149-157]` — the plan identifies the operator captures, the serial CSS lane, and the image judge as dependencies but has no roadmap-request trace column.

Finding: rows 70–88 do not need to become new visual-surface children when their owning phases already landed or remain external, but they do need a 076 trace task so the programme can prove which earlier ruling is a dependency, regression guard, or non-goal. Without that bridge, the operator’s “all sheets / UI focus” request can be marked complete by the 076 children while rows 70–88 remain unlinked in this packet. Propose a small coordination child (021) or, if the operator rejects a non-surface child, a parent-level trace task with the same six gates.

### COV-004 — The live registry and inventory use different ownership grains; the matrix must retain both surface ID and host producer

Evidence:

- `[SOURCE: tools/live/sheet-grammar.mjs:87-118]` — `REGISTERED_SURFACES` registers production-mounted surfaces such as settings, column-manager, board-card-properties, and record-peek, including comments explaining the real mount path.
- `[SOURCE: tools/live/sheet-grammar.mjs:119-145]` — owned menu, date/icon/colour pickers, confirm, and three fuzzy-suggest families are separate registered surfaces.
- `[SOURCE: tools/storybook/sheet-inventory.mjs:39-67]` — the inventory collects registry arrays, stacked pairs, overflow surfaces, modal subclasses, and curated producer maps; it can report a surface even when the grammar registers a shared parent.
- `[SOURCE: tools/live/sheet-grammar.mjs:387-438]` — stacked pairs preserve parent/child identity and include the replace-in-place property type picker and the depth-3 record submenu.
- `[SOURCE: tools/live/sheet-grammar.mjs:495-507]` — overflow-only surfaces include active-rule filter/sort, both cell editors, date-time picker, and generic dropdown.

Finding: “child 003 owns filter” is not sufficient evidence for rows 56–61 and 25; the matrix needs `inventory row`, `parent producer`, `child surface`, `scenario`, `mount function`, and `lane clause`. The current audit has most of this data, but no stable machine-readable coverage IDs or required clause IDs. A future registry change can therefore silently remove a surface from a child plan while the prose still looks covered.

## Full coverage matrix captured in this pass

The following is the patch-ready ownership baseline. `020` and `021` are proposals, not existing folders. `COV-*` names the clause that must be added to the owning task/verification packet.

### Inventory rows 1–55 (primary)

| Row | Surface | Current producer / scenario anchor | 076 child | Required task → clause |
|---:|---|---|---|---|
| 1 | Settings sheet | `view-config-panel-renderer.ts` / `panel-view-config` | 001 | T-COV-001 → COV-001 |
| 2 | Add-property / property-type picker | `create-property-modal.ts`, `type-picker.ts` / `constructed-depth3-property-type-picker` | 007 | T-COV-002 → COV-002 |
| 3 | Sort panel | `sort-panel-renderer.ts` / `panel-sort-rules` | 004 | T-COV-003 → COV-003 |
| 4 | Filter panel | `filter-panel-renderer.ts` / `panel-filter-conditions` | 003 | T-COV-004 → COV-004 |
| 5 | Group | `toolbar-renderer.ts` / `chrome-toolbar` | 005 | T-COV-005 → COV-005 |
| 6 | Add view | `toolbar-renderer.ts` / `add-view-popover` | 006 | T-COV-006 → COV-006 |
| 7 | Record detail | `record-detail-panel.ts` / `panel-record-detail` | 008 | T-COV-007 → COV-007 |
| 8 | Record peek | `table-record-peek.ts` / `panel-record-peek` | **020 proposed**; 008 remains host owner | T-COV-008 → COV-008 |
| 9 | Column width | `column-width.ts` / `panel-column-width-sheet` | 011 | T-COV-009 → COV-009 |
| 10 | Column manager | `column-manager-renderer.ts` / `panel-column-manager` | 002 | T-COV-010 → COV-010 |
| 11 | Board card properties | `board-card-properties-panel.ts` / `constructed-board-card-properties` | 013 | T-COV-011 → COV-011 |
| 12 | Owned menu | `owned-menu.ts` / `chrome-owned-menu` | 009 | T-COV-012 → COV-012 |
| 13 | Date picker | `date-value-picker.ts` / `constructed-date-picker` | 010 | T-COV-013 → COV-013 |
| 14 | Icon picker | `icon-picker-popover.ts` / `field-icon-picker` | 010 | T-COV-014 → COV-014 |
| 15 | Option colour picker | `option-color-picker.ts` / `constructed-option-color-picker` | 010 | T-COV-015 → COV-015 |
| 16 | Confirm | `confirm-sheet.ts`, `confirm-modal.ts` / depth-3 confirm | 009 | T-COV-016 → COV-016 |
| 17 | Base-file suggest | `main.ts:3061` | 014 | T-COV-017 → COV-017 |
| 18 | Image-file suggest | `image-file-suggest-modal.ts` | 014 | T-COV-018 → COV-018 |
| 19 | Markdown-file suggest | `markdown-file-suggest-modal.ts` | 014 | T-COV-019 → COV-019 |
| 20 | Toolbar utilities | `toolbar-renderer.ts` / `constructed-toolbar-utilities` | 011 | T-COV-020 → COV-020 |
| 21 | Toolbar tab menu | `toolbar-renderer.ts` / add-view family | 011 | T-COV-021 → COV-021 |
| 22 | Nested filter panel | `filter-panel-renderer.ts` / active-rule filter | 003 | T-COV-022 → COV-022 |
| 23 | Sort calendar hint | `sort-panel-renderer.ts` / active-rule sort | 004 | T-COV-023 → COV-023 |
| 24 | Docked record detail | `record-detail-panel.ts` / `constructed-record-detail-docked` | 008 | T-COV-024 → COV-024 |
| 25 | Active-rule filter | `active-rule-popover-renderer.ts` | 003 | T-COV-025 → COV-025 |
| 26 | Active-rule sort | `active-rule-popover-renderer.ts` | 004 | T-COV-026 → COV-026 |
| 27 | Text cell editor | `cell-renderer.ts` / `constructed-cell-editor-text` | 015 | T-COV-027 → COV-027 |
| 28 | Select cell editor | `cell-renderer.ts` / `constructed-cell-editor-select` | 015 | T-COV-028 → COV-028 |
| 29 | Date-time picker | `date-value-picker.ts` / `constructed-date-picker-datetime` | 010 | T-COV-029 → COV-029 |
| 30 | Generic dropdown | `dropdown-field.ts` / `constructed-dropdown` | **020 proposed**; host children remain contextual owners | T-COV-030 → COV-030 |
| 31 | Calendar toolbar options | `calendar-toolbar-renderer.ts` | 016 | T-COV-031 → COV-031 |
| 32 | Timeline toolbar options | `calendar-timeline-toolbar-renderer.ts` | 016 | T-COV-032 → COV-032 |
| 33 | Chart toolbar options | `chart-toolbar-renderer.ts` | 016 | T-COV-033 → COV-033 |
| 34 | Mini-calendar popover | `calendar-mini-calendar-renderer.ts` | 016 | T-COV-034 → COV-034 |
| 35 | CsvMarkdownImportModal | `main.ts:2915` | 017 | T-COV-035 → COV-035 |
| 36 | TrashManagerModal | `settings.ts:583` | 017 | T-COV-036 → COV-036 |
| 37 | AddDatabaseModal | `add-database-modal.ts` | 017 | T-COV-037 → COV-037 |
| 38 | BaseImportConfirmModal | `base-import-confirm-modal.ts` | 017 | T-COV-038 → COV-038 |
| 39 | ColumnRenameModal | `column-rename-modal.ts` | 017 | T-COV-039 → COV-039 |
| 40 | ComputedFrontmatterCleanupModal | `computed-frontmatter-cleanup-modal.ts` | 017 | T-COV-040 → COV-040 |
| 41 | CreateLinkedViewModal | `create-linked-view-modal.ts` | 017 | T-COV-041 → COV-041 |
| 42 | CreateRecordIconFieldModal | `create-record-icon-field-modal.ts` | 017 | T-COV-042 → COV-042 |
| 43 | CsvMarkdownExportModal | `csv-markdown-export-modal.ts` | 017 | T-COV-043 → COV-043 |
| 44 | DeleteDatabaseModal | `delete-database-modal.ts` | 017 | T-COV-044 → COV-044 |
| 45 | FormulaModal | `formula-modal.ts` | 017 | T-COV-045 → COV-045 |
| 46 | InvalidTimeEventsModal | `invalid-time-events-modal.ts` | 017 | T-COV-046 → COV-046 |
| 47 | PropertyTypeConflictModal | `property-type-conflict-modal.ts` | 017 | T-COV-047 → COV-047 |
| 48 | RelationRollupConfigModal | `relation-rollup-config-modal.ts` | 017 | T-COV-048 → COV-048 |
| 49 | StatusOptionsModal | `status-options-modal.ts` | 017 | T-COV-049 → COV-049 |
| 50 | StatusPresetManagerModal | `status-preset-manager-modal.ts` | 017 | T-COV-050 → COV-050 |
| 51 | Trash restore-confirm | `settings.ts:680` | 017 | T-COV-051 → COV-051 |
| 52 | ChartDrilldownModal | `archive/deprecated-views/chart/chart-renderer.ts` | 017 | T-COV-052 → COV-052; confirm live/archive |
| 53 | Toast | `toast.ts` | 017 | T-COV-053 → COV-053 |
| 54 | ColumnMenu | `column-menu.ts` | 009 | T-COV-054 → COV-054 |
| 55 | Bulk-edit field menu | `bulk-edit-field-menu.ts` | 017 | T-COV-055 → COV-055 |

### Inventory rows 56–87 (stacked/paired)

| Rows | Surfaces | 076 child | Required task → clause |
|---:|---|---|---|
| 56–61 | Filter property, operator, select value, checkbox value, conjunction, date value | 003 | T-COV-056-061 → COV-056-061 |
| 62–63 | Sort field, sort direction | 004 | T-COV-062-063 → COV-062-063 |
| 64–66 | Properties create, edit, type picker | 007, with row 65 renderer confirmation | T-COV-064-066 → COV-064-066 |
| 67 | Properties column overflow | 009 | T-COV-067 → COV-067 |
| 68–70 | Settings dropdown, ad hoc dropdown, settings icon picker | 001; icon primitive 010 | T-COV-068-070 → COV-068-070 |
| 71–72 | Settings template file picker, cover image picker | 014 | T-COV-071-072 → COV-071-072 |
| 73–76 | Record select, date, relation, option colour | 008 | T-COV-073-076 → COV-073-076 |
| 77–78 | Record column context menu, submenu | 009 | T-COV-077-078 → COV-077-078 |
| 79 | Add-view property picker | 006 | T-COV-079 → COV-079 |
| 80 | All-views overflow | 011 | T-COV-080 → COV-080 |
| 81 | Confirm over a sheet | 009 | T-COV-081 → COV-081 |
| 82 | Import confirm dropdown chain | 017 | T-COV-082 → COV-082 |
| 83–85 | Chart, calendar, timeline option dropdowns | 016 | T-COV-083-085 → COV-083-085 |
| 86 | Group-by dropdown | 005 | T-COV-086 → COV-086 |
| 87 | Timeline event menu | 016 provisional; 009 fallback | T-COV-087 → COV-087 + Proposed ADR if reclassified |

### Roadmap requests 70–94

| Roadmap row | Request/decision anchor | 076 trace owner | Paste-ready task → clause |
|---:|---|---|---|
| 70 | Finance properties empty on iOS | 021 proposed bridge; external owner 070 | T-COV-R070 → COV-R070: record as data-read regression dependency, not visual scope |
| 71 | Linked views UX and mobile drag | 021 proposed bridge; external owner 072 | T-COV-R071 → COV-R071: require linked-view regression read before sheet closure |
| 72 | Checkbox/radio sizing and radio removal | 021 proposed bridge; external owner 073 | T-COV-R072 → COV-R072: re-run control-family guard on both themes |
| 73 | Board card name/number format discoverability | 021 bridge; external owner 058 | T-COV-R073 → COV-R073: verify 076 board children do not regress title-format entry point |
| 74 | Settings and all-sheets UI | 001 + 021 bridge; external owner 071/002 | T-COV-R074 → COV-R074: D7/D9 target supersedes stale card wording |
| 75 | Add-property sheet | 007 + 021 bridge; external owner 071/003 | T-COV-R075 → COV-R075: preserve 44px row and keyboard-clearance assertions |
| 76 | Screenshots/stories for every sheet | Parent + 021 bridge; external owner 071/001 | T-COV-R076 → COV-R076: inventory count and row IDs are a release gate |
| 77 | Deprecate calendar/timeline | 016 + 021 bridge; external owner 008 | T-COV-R077 → COV-R077: live/archive status must be explicit before judging 016 |
| 78 | Remove mentions/archive deprecated views | 021 bridge; external owner 008/004 | T-COV-R078 → COV-R078: no deleted renderer may be claimed as an active 076 surface |
| 79 | Reduce test data | 021 bridge; external owner 074 | T-COV-R079 → COV-R079: capture fixtures must name the one-database testbed |
| 80 | Deprecate chart | 016 + 021 bridge; external owner 008 | T-COV-R080 → COV-R080: chart options are a documented archived/live branch |
| 81–82 | Toast duration and close-button size | 017 + 021 bridge; external owner 066 | T-COV-R081-082 → COV-R081-082: toast representative includes duration and close geometry |
| 83 | Icon+label toolbar buttons and overflow | 011 + 021 bridge; external owner 075 | T-COV-R083 → COV-R083: toolbar utility and tab menu captures cover the operator request |
| 84 | Strict settings alignment | 001 + 021 bridge; external owner 071/007 | T-COV-R084 → COV-R084: rewrite card premise under D7 before CREATE |
| 85 | Sort full width/bottom gap | 004 + 021 bridge; external owner 071/005 | T-COV-R085 → COV-R085: keep full-width/bottom-gap target in sort DEFINE and lane |
| 86 | Horizontal overflow menu movement | 011 + 021 bridge; external owner 075 | T-COV-R086 → COV-R086: register vertical movement as a screenshot state |
| 87–88 | Clean one-database testbed/folder | Parent + 021 bridge; external owner 074 | T-COV-R087-088 → COV-R087-088: fixture provenance in every capture row |
| 89 | Step-by-step define→plan→create→screenshot→verify→remediate | All 001–019, coordinated by 021 | T-COV-R089 → COV-R089: outer graph count is 19 and each child has six clauses |
| 90 | Board card fields never wrap | 012 | T-COV-R090 → COV-R090: one-column field lane and ClickUp retarget boundary |
| 91 | No background container; dividers on plain sheet background | All 001–019 | T-COV-R091 → COV-R091: D7 is a universal Frame/Sections assertion |
| 92 | Settings typography/layout/sizing | 001 + shared design-system owner | T-COV-R092 → COV-R092: settings typography is both-theme and 44–48px provisional |
| 93 | Every sheet/dropdown has inventory and dedicated phase | 020 + 021 proposed, all existing children | T-COV-R093 → COV-R093: no contextual exception without a named owner/capture |
| 94 | ClickUp board headers/styling/drag; three-way sheet mix | 018, 019, plus all sheet children | T-COV-R094 → COV-R094: ClickUp leads board; D9 Source column for sheets |

## Questions Answered

- Q1: **Partially.** All 87 rows have an existing or proposed owner, but rows 8 and 30 lack a dedicated child, rows 65 and 87 need explicit renderer decisions, and roadmap rows 70–88 lack a 076 trace bridge.

## Questions Remaining

- Should the operator accept a non-surface coordination child 021, or should its trace rows live in parent `tasks.md` only?
- Does the operator want `record-peek` judged as its own phone sheet even though the touch path hands off to record detail?
- Should generic `dropdown-field.ts` be judged as one standalone primitive or only in each host composition?

## Next Focus

DEPTH — grade every one of the 19 children across all six phases against L3/L3+ and write exact missing thresholds, RED/GREEN evidence, capture IDs, both-theme targets, and per-row judge expectations.

## Assessment

- `newInfoRatio`: 0.97
- Novelty justification: the 87-row audit was known, but the explicit unowned contextual contracts and the 11-versus-19 outer-graph mismatch were not previously externalized as patchable coverage clauses.
- Confidence: High for inventory and child mapping; medium for the operator’s preferred treatment of proposed children 020/021.

## Reflection

- Worked: using the generator’s primary/stacked tables alongside the live registry exposed ownership-grain mismatches without running the prohibited generator.
- Ruled out: treating row 30’s “shared primitive” note or row 8’s touch handoff as sufficient dedicated coverage.
- Convergence telemetry is ignored; four distinct gap classes remain mandatory.

## Sources Consulted

`coverage-audit.md`; parent `spec.md`, `plan.md`, `tasks.md`, `goal.md`, `decision-record.md`; `roadmap.md` §4/§6A/§7; `tools/storybook/sheet-inventory.mjs`; `tools/live/sheet-grammar.mjs`; all 19 child `plan.md` files.
