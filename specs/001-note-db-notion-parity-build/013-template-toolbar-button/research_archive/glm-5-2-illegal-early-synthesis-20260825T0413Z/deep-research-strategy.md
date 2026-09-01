# Deep Research Strategy: Toolbar New-From-Template Button

> Spec: `specs/public/001-note-db-notion-parity-build/013-template-toolbar-button`
> Lineage: `glm-5-2` · Session: `fanout-glm-5-2-1787630131864-cpa84y` · Mode: new

## Research Topic

Perfect the **Toolbar New-From-Template Button** feature for the forked Note Database Obsidian plugin (fork src at `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`) toward Notion parity. Uncover the best UI/UX, core logic/algorithm, fork integration via the isolated-module `EuroFormat` pattern (one new module under `src/data/` plus 1-3 call-site edits, rebase-safe), edge cases, and mobile + iCloud safety (display-only unless spec says otherwise). Mine AppFlowy (`appflowy/frontend/rust-lib/flowy-database2` Rust grid model + `appflowy/frontend/appflowy_flutter/lib/plugins/database` Flutter UI) and Anytype (`anytype-ts/src/ts`) for how they implement this capability. Cite Notion behavior via WebFetch. Ground every finding in real source.

## Key Questions

1. **Q1 — Existing create path**: What exactly do `RecordTemplate.ts` + `CreateEntryPlan.ts` + `DatabaseView.createBlankEntry` do, and what does the toolbar/row-menu already expose? (RESOLVED in iter 1)
2. **Q2 — Host files & call-site budget**: Where are `ToolbarRenderer` and `RowMenu`, and how many call sites does a New-from-template control require? (RESOLVED in iter 1)
3. **Q3 — ConfirmModal**: Does a mobile-safe `ConfirmModal` already exist, and what is its API? (RESOLVED in iter 1)
4. **Q4 — Reference repos**: How do AppFlowy and Anytype implement new-from-template / add-row, and what UX patterns are worth borrowing? (RESOLVED in iter 1)
5. **Q5 — Notion parity**: What is Notion's database template / New-from-template button behavior? (iter 2)
6. **Q6 — Edge cases**: Empty template set, zero templates, concurrent clicks, iCloud churn, mobile — how should the isolated module handle them? (iter 3)
7. **Q7 — Isolated module shape**: Optimal module shape (EuroFormat pattern) + precise 1-3 call-site edits + algorithm. (iter 2-3)

## Known Context (bounded snapshot)

### Fork create-with-template path (CONFIRMED)

- `RecordTemplate.ts` (58 lines): `parseRecordTemplate(text, engine)` splits YAML frontmatter from body; `resolveCoreRecordTemplate(template, title)` substitutes `{{title}}`, `{{date(:fmt)?}}`, `{{time(:fmt)?}}` for the `core` engine only. Engines: `markdown | core | templater`. [SOURCE: src/data/RecordTemplate.ts:13-58]
- `CreateEntryPlan.ts` (737 lines): `planCreateEntry(input)` computes filename, folder, frontmatter, and diagnostics from source rules + context defaults + template frontmatter. Merge priority: column defaults < view filter/state/group/calendar defaults < source rules. Tags/multi-select use set-union. No second create engine — this IS the create path. [SOURCE: src/data/CreateEntryPlan.ts:119-173]
- `DatabaseView.createBlankEntry` (lines 3528-3636): loads template via `loadNewRecordTemplate(entry.config)` → `buildCreateEntryPlan` → `dataSource.createNote(folder, filename, frontmatter, {sourceInstanceId}, template.body)` → optional templater run → history push + refresh. **The template is already auto-applied whenever `database.newRecordTemplate` is set.** [SOURCE: src/views/DatabaseView.ts:3528-3680]
- `NewRecordTemplateConfig` type: `{ path: string; engine: "markdown"|"core"|"templater" }`. Configured per-database in `ViewConfigPanelRenderer.renderNewRecordTemplateSetting`. [SOURCE: src/data/types.ts:154-157, src/views/ViewConfigPanelRenderer.ts:412-473]

### Toolbar & row-menu hosts (CONFIRMED)

- `ToolbarRenderer.renderNewButton` (line 1683): renders a `db-new-button` with `plus` icon, label `t("toolbar.new")`, onclick → `actions.createEntry()`. Called at lines 236 (titleActions) and 282 (right cluster), gated by `!actions.isReadOnly && !isChartView`. [SOURCE: src/views/ToolbarRenderer.ts:1683-1691, 236, 282]
- `ToolbarActions.createEntry(defaults?)`: single method, no template-aware variant. [SOURCE: src/views/ToolbarRenderer.ts:81]
- `RowMenu` (121 lines): context menu with Open / Insert Above / Insert Below / Duplicate / Delete. `RowMenuActions.createEntry?(defaults?, position?)` already wired. **No "New from template" item exists.** Uses `confirmWithModal` for delete. [SOURCE: src/views/RowMenu.ts:1-121]
- `DatabaseView` binds `createEntry: (defaults, position) => this.guardedCreateEntry(defaults, position)` at 5 toolbar call sites (lines 563, 595, 603, 634, 662) + calendar (1902). `guardedCreateEntry` → `createBlankEntry`. [SOURCE: src/views/DatabaseView.ts:845-856]

### ConfirmModal (CONFIRMED — mobile-safe, exists)

- `views/modals/ConfirmModal.ts` (71 lines): `confirmWithModal(app, {title, message, confirmText?, danger?, secondaryButton?})` → `Promise<boolean|string>`. Built on Obsidian `Modal` (mobile-safe). Cancel resolves `false`; onClose also resolves `false` (no write). Already used by `RowMenu` for delete. [SOURCE: src/views/modals/ConfirmModal.ts:1-71, src/views/RowMenu.ts:102-107]

### EuroFormat isolated-module pattern (CONFIRMED)

- `src/data/EuroFormat.ts` (42 lines): pure functions, no class state, exported `formatEuroNumber/formatEuroNumber2/formatEuroCurrency`. Comment documents the rebase-friendly intent: "Kept in one module so it stays a small, rebasable diff." [SOURCE: src/data/EuroFormat.ts:1-42]

### Reference repos (CONFIRMED)

- **AppFlowy**: `GridAddRowButton` (grid_footer.dart) — simple footer button, `onTap → GridEvent.createRow()`, NO template concept. `RowService.createRow` is the Rust-backed create. AppFlowy has no per-database record-template; "template" matches are codegen/protobuf, not user templates. [SOURCE: appflowy/.../grid/presentation/widgets/footer/grid_footer.dart:18-44, application/row/row_service.dart:15]
- **Anytype**: Rich template system. `View.defaultTemplateId` per dataview view [dataview.ts:254]. `getTemplateId()` returns `view.defaultTemplateId || type.defaultTemplateId` [widget/index.tsx:167]. `MenuTemplateList` (list.tsx) renders template picker with preview, "new template" entry (`J.Constant.templateId.new`), set-default, context menu. `controls.tsx:750-760` shows a dedicated template-menu button (`onTemplateMenu`) next to the add-row button (`onRecordAdd`). `ObjectCreate(details, flags, templateId, typeKey, space, cb)` is the create call. [SOURCE: anytype-ts/src/ts/component/menu/dataview/template/list.tsx, component/block/dataview/controls.tsx:750-760, component/widget/index.tsx:140-268, interface/block/dataview.ts:194-264]

## Non-Goals

- Scheduler, cron, time-triggered create (out of scope per spec REQ-003).
- Network buttons: mail, webhook, Slack, notifications (out of scope per spec).
- New template engines or placeholder syntax (existing `{{date}}`/`{{title}}`/`{{time}}` stay).
- Column-type, view-type, relation, rollup, filter, footer, chart, conditional-formatting work.
- Record-detail panel (successor 014), files-column (predecessor 012).
- Reimplementing the create path — must delegate to existing `createBlankEntry`/`planCreateEntry`.
- Modifying files outside the lineage write surface.

## Stop Conditions

- All 7 key questions have evidence-backed answers AND
- Source diversity ≥ 3 (fork + AppFlowy + Anytype + Notion) AND
- Average newInfoRatio over last 2 evidence iterations < 0.05 AND
- No single weak source dominates (>60% of findings from one source) AND
- Isolated-module shape + call-site edits are concretely specified with file:line citations.

## Next Focus

**Iteration 1**: Lock down Q1-Q4 (fork create path, hosts, ConfirmModal, reference repos) — largely pre-mined above; write the iteration file formalizing findings + answering Q1-Q4 with citations. newInfoRatio target: high (first evidence).

## What Worked

- (populated per iteration)

## What Failed

- (populated per iteration)

## Exhausted Approaches

- (populated per iteration)

## Active Risks

- Toolbar already has a generic "New" button that auto-applies the configured template — the feature may be largely a **discoverability/labeling** problem, not a new create path. Must clarify whether spec wants a *distinct* "New from template" button vs. relabeling/enhancing the existing one.
- Row-menu "New from template" semantics differ from toolbar (row-menu is row-scoped; toolbar is view-scoped). Need to decide whether row-menu item creates a new row from template or duplicates-from-template.
