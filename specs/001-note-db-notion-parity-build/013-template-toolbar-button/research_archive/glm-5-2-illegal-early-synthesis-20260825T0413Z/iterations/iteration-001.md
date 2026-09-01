# Iteration 001 — Fork Create Path, Hosts, ConfirmModal, Reference Repos

> Focus: Q1 (existing create path), Q2 (host files & call-site budget), Q3 (ConfirmModal), Q4 (reference repos)
> newInfoRatio: 1.0 (first evidence iteration — all net-new)

## Summary

The fork already has a complete create-with-template path. The toolbar has a generic "New" button that **auto-applies the configured database template** whenever `database.newRecordTemplate` is set. The row-menu has insert/duplicate/delete but **no "New from template" item**. A mobile-safe `ConfirmModal` already exists and is used by `RowMenu`. AppFlowy has no record-template concept; Anytype has a rich per-view `defaultTemplateId` + template-picker menu pattern directly applicable to this feature.

## Findings

### F1 — Existing create-with-template path (Q1) ✅ RESOLVED

The create path is `DatabaseView.createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` → `planCreateEntry` → `dataSource.createNote`. The template is **automatically applied** whenever `database.newRecordTemplate.path` is configured. There is no separate "create without template" vs "create with template" branch — a single `createBlankEntry(defaults, position)` handles both (template is `undefined` when no template configured).

- `RecordTemplate.parseRecordTemplate(text, engine)`: splits `---frontmatter---` from body via regex, deletes `db_view`/`database` keys from frontmatter. [SOURCE: src/data/RecordTemplate.ts:13-28]
- `RecordTemplate.resolveCoreRecordTemplate(template, title)`: for `engine === "core"` only, substitutes `{{title}}`, `{{date(:fmt)?}}` (default `YYYY-MM-DD`), `{{time(:fmt)?}}` (default `HH:mm`) in frontmatter values and body. [SOURCE: src/data/RecordTemplate.ts:30-58]
- `CreateEntryPlan.planCreateEntry(input)`: the single create-plan engine. Computes `filename`, `folder`, `frontmatter`, `diagnostics`. Merge priority (low→high): column defaults < template frontmatter < view filter/state/group/calendar defaults < source rules. Tags & multi-select use set-union (no loss). [SOURCE: src/data/CreateEntryPlan.ts:119-173, 3638-3671]
- `DatabaseView.createBlankEntry` (3528-3636): orchestrates load → plan → createNote → optional templater run → history push → refresh. On `engine === "core"`, re-plans after resolving template placeholders (two-pass so `{{title}}` can use the final filename). [SOURCE: src/views/DatabaseView.ts:3528-3636]
- `loadNewRecordTemplate(database)` (3673-3680): reads `database.newRecordTemplate.path` from vault, throws `t("template.missing")` if file gone. [SOURCE: src/views/DatabaseView.ts:3673-3680]
- `runTemplaterOnCreatedFile(file)` (3682-3695): calls `templater-obsidian` plugin's `overwrite_file_commands` if installed. [SOURCE: src/views/DatabaseView.ts:3682-3695]

**Implication**: A "New from template" button does NOT need a new create engine. It needs to (a) ensure a template is selected/applied and (b) call the existing `createBlankEntry`. The spec's REQ-002 ("click calls the existing create-with-defaults path") is satisfied by delegation.

### F2 — Toolbar & row-menu hosts, call-site budget (Q2) ✅ RESOLVED

- **Toolbar host**: `src/views/ToolbarRenderer.ts`, method `renderNewButton` (line 1683). Renders `button.db-new-button` with `plus` icon + `t("toolbar.new")` label, onclick → `actions.createEntry()`. Called at **2 sites**: line 236 (titleActions cluster) and line 282 (right cluster), both gated `!actions.isReadOnly && !isChartView`. [SOURCE: src/views/ToolbarRenderer.ts:236, 282, 1683-1691]
- **Row-menu host**: `src/views/RowMenu.ts` (121 lines). `RowMenuActions` interface (line 8) already has `createEntry?(defaults?, position?)`. Menu items: Open, Insert Above, Insert Below, Duplicate, Delete. **No "New from template" item.** [SOURCE: src/views/RowMenu.ts:1-121]
- **Call-site budget**: A "New from template" control needs at most **2 call sites** (toolbar + row-menu), well within the 1-3 budget. The toolbar site can either (a) add a new button alongside `renderNewButton` or (b) enhance `renderNewButton` to be template-aware. Row-menu adds one `menu.addItem`. [SOURCE: src/views/ToolbarRenderer.ts:1683, src/views/RowMenu.ts:63-75]
- `ToolbarActions.createEntry(defaults?)` is the single toolbar action interface method. [SOURCE: src/views/ToolbarRenderer.ts:81]
- `DatabaseView` binds `createEntry` at 5 toolbar sites (563, 595, 603, 634, 662) + 1 calendar site (1902), all routing to `guardedCreateEntry` → `createBlankEntry`. [SOURCE: src/views/DatabaseView.ts:563, 595, 603, 634, 662, 1902, 845-856]

### F3 — ConfirmModal (Q3) ✅ RESOLVED — mobile-safe, exists

- `src/views/modals/ConfirmModal.ts` (71 lines): `confirmWithModal(app, options): Promise<boolean | string>`. Options: `{title, message, confirmText?, danger?, secondaryButton?}`. Built on Obsidian `Modal` (works on mobile — no desktop-only APIs). [SOURCE: src/views/modals/ConfirmModal.ts:1-71]
- Cancel → resolves `false`; `onClose` → resolves `false` (guarantees no write on dismiss). Confirm → resolves `true`. Optional `secondaryButton` returns its `value` string. [SOURCE: src/views/modals/ConfirmModal.ts:40-66]
- Already used by `RowMenu` for delete confirmation. [SOURCE: src/views/RowMenu.ts:102-107]
- **REQ-004 (optional confirm-before-create) is satisfiable with zero new modal code** — wrap the create call in `await confirmWithModal(...)` and bail on `false`.

### F4 — AppFlowy reference (Q4) — minimal applicability

- `GridAddRowButton` (grid_footer.dart:18-44): simple footer button, `onTap → context.read<GridBloc>().add(const GridEvent.createRow())`. No template selection, no per-row template. [SOURCE: appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/footer/grid_footer.dart:18-44]
- `RowService.createRow` (row_service.dart:15): Rust-backed `createRow` with `RowId` positioning (before/after). No template parameter. [SOURCE: appflowy/.../application/row/row_service.dart:15-57]
- AppFlowy "template" matches in `flowy-database2` are codegen/protobuf templates (`text_type_option.rs`, `media_type_option.rs`), NOT user record templates. [SOURCE: appflowy/frontend/rust-lib/flowy-database2/src/services/field/type_options/]
- **Borrowable pattern**: the footer "add row" button is a clean, single-action control — useful as the minimal UX baseline. AppFlowy does NOT solve the template-selection problem; Anytype does.

### F5 — Anytype reference (Q4) — highly applicable

- **Per-view default template**: `View.defaultTemplateId` (dataview.ts:254). `getTemplateId()` returns `view.defaultTemplateId || type.defaultTemplateId` — view overrides type. [SOURCE: anytype-ts/src/ts/interface/block/dataview.ts:254, anytype-ts/src/ts/component/widget/index.tsx:167]
- **Template-picker menu**: `MenuTemplateList` (list.tsx) renders a grid of template previews with: active/default highlighting, "new template" entry (`J.Constant.templateId.new`), context menu (duplicate/set-default), keyboard nav, empty-state (`blockDataviewNoTemplates`). [SOURCE: anytype-ts/src/ts/component/menu/dataview/template/list.tsx:1-278]
- **Dedicated template button next to add-row**: `controls.tsx` lines 750-760 show `onRecordAdd(e, -1)` (add-row) and `onTemplateMenu(e, -1)` (template menu) as **separate adjacent buttons**. [SOURCE: anytype-ts/src/ts/component/block/dataview/controls.tsx:750-760]
- **Create call**: `C.ObjectCreate(details, flags, templateId, typeKey, space, cb)` — templateId passed explicitly. [SOURCE: anytype-ts/src/ts/component/widget/index.tsx:263]
- **Borrowable patterns**: (1) separate "template" affordance distinct from plain "new"; (2) template picker with previews + set-default; (3) `defaultTemplateId` per view. The fork already has `newRecordTemplate` per-database (analogous to Anytype's per-view `defaultTemplateId`).

## Questions Answered

- **Q1 ✅**: Create path = `createBlankEntry` → `loadNewRecordTemplate` → `planCreateEntry` → `createNote`. Template auto-applied when configured. No second engine needed.
- **Q2 ✅**: Toolbar = `ToolbarRenderer.renderNewButton` (2 call sites at lines 236, 282). Row-menu = `RowMenu.show` (1 site). Total ≤ 2 new call sites, within 1-3 budget.
- **Q3 ✅**: `confirmWithModal` exists, mobile-safe, used by RowMenu. REQ-004 needs zero new modal code.
- **Q4 ✅**: AppFlowy = minimal (footer add-row, no templates). Anytype = rich (per-view `defaultTemplateId`, template picker, dedicated template button adjacent to add-row).

## Ruled-Out Directions

- Building a new create engine — the existing `planCreateEntry` + `createBlankEntry` is complete and spec-mandated (REQ-002 forbids a second create path).
- Building a new modal — `ConfirmModal` is mobile-safe and already in use.
- Copying AppFlowy's template approach — it has none; only its minimal add-row button UX is baseline-relevant.

## Next Focus

Iteration 2: Q5 (Notion parity via WebFetch) + Q7 (isolated-module shape, algorithm, precise call-site edits). Determine whether the feature is a *distinct* "New from template" button (Anytype-style, with template picker) or an *enhancement* of the existing "New" button (which already auto-applies the configured template). This is the central UX decision.
