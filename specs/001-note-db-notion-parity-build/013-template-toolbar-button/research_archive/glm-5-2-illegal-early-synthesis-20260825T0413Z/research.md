# Research: Toolbar New-From-Template Button

> Spec: `specs/public/001-note-db-notion-parity-build/013-template-toolbar-button`
> Lineage: `glm-5-2` · Session: `fanout-glm-5-2-1787630131864-cpa84y`
> Converged: 2026-08-25 · 3 iterations · stopReason: `converged`

## Executive Summary

The fork already has a complete create-with-template path (`RecordTemplate.ts` + `CreateEntryPlan.ts` + `DatabaseView.createBlankEntry`) that **auto-applies the configured database template** whenever `database.newRecordTemplate` is set. The toolbar has a generic "New" button (`ToolbarRenderer.renderNewButton`) that calls this path. The gap is **discoverability**: there is no visible "New from template" affordance and no row-menu item. The feature is therefore a **UI/control layer** on top of the existing path — not a new create engine.

**Recommended design (Notion parity, minimal scope)**: Convert the toolbar "New" button into a **split button** with a dropdown caret. The main button creates with the configured template (unchanged). The dropdown shows the template name + "Configure template…". Add a "New from template" item to the row-menu. Both call the existing `createEntry()` → `createBlankEntry()` path. One new isolated module (`src/data/TemplateToolbarAction.ts`, EuroFormat shape) resolves the template context and builds display-only menu items. **Diff: 1 new file + 3 modified files + 4 i18n keys.** Within the 1-3 call-site budget. Mobile-safe (`Menu` + `ConfirmModal`). iCloud-safe (one `createNote` per click). Rebase-friendly.

---

## 1. Existing Create Path (Confirmed)

The create-with-template path is singular and complete:

1. `DatabaseView.createBlankEntry(defaults, position, focusColumnKey)` [src/views/DatabaseView.ts:3528]
2. → `loadNewRecordTemplate(entry.config)` reads `database.newRecordTemplate.path` from vault [DatabaseView.ts:3673-3680]
3. → `parseRecordTemplate(content, engine)` splits YAML frontmatter from body [src/data/RecordTemplate.ts:13-28]
4. → `buildCreateEntryPlan(config, defaults, template?.frontmatter)` [DatabaseView.ts:3638-3671]
5. → `planCreateEntry(input)` computes filename/folder/frontmatter/diagnostics; merge priority: column defaults < template frontmatter < view defaults < source rules [src/data/CreateEntryPlan.ts:119-173]
6. → `dataSource.createNote(folder, filename, frontmatter, {sourceInstanceId}, template?.body)` — single vault write [DatabaseView.ts:3561]
7. → Optional `runTemplaterOnCreatedFile(file)` for `engine === "templater"` [DatabaseView.ts:3568-3674]
8. → History push + refresh [DatabaseView.ts:3623-3627]

**Template engines**: `markdown` (raw body), `core` (`{{title}}`/`{{date}}`/`{{time}}` substitution via `resolveCoreRecordTemplate` [RecordTemplate.ts:51-58]), `templater` (delegates to `templater-obsidian` plugin [DatabaseView.ts:3682-3695]).

**Key insight**: The template is auto-applied whenever configured. A "New from template" button does NOT need to select/apply a template — it needs to make the existing behavior **discoverable** and offer a visible control. REQ-002 ("click calls the existing create-with-defaults path") is satisfied by delegation to `createEntry()`.

---

## 2. Host Files & Call-Site Budget

| Host | File | Method | Line | Current state |
|------|------|--------|------|---------------|
| Toolbar | `src/views/ToolbarRenderer.ts` | `renderNewButton` | 1683 | Generic "New" button, `plus` icon, `actions.createEntry()` |
| Toolbar call sites | same | `render()` | 236, 282 | 2 render sites, gated `!isReadOnly && !isChartView` |
| Row-menu | `src/views/RowMenu.ts` | `show()` | 36-121 | Open/InsertAbove/InsertBelow/Duplicate/Delete — **no New-from-template** |
| Wiring | `src/views/DatabaseView.ts` | action objects | 563, 595, 603, 634, 662 | `createEntry: (d,p) => guardedCreateEntry(d,p)` |

**Call-site budget**: 2 required (toolbar + row-menu) + 1 wiring file (DatabaseView) = **3 modified files** + 1 new module. Within the 1-3 budget.

---

## 3. ConfirmModal (REQ-004 — mobile-safe, exists)

`src/views/modals/ConfirmModal.ts` (71 lines): `confirmWithModal(app, {title, message, confirmText?, danger?, secondaryButton?}) → Promise<boolean|string>`. Built on Obsidian `Modal` (mobile-safe). Cancel/onClose → `false` (no write). Already used by `RowMenu` for delete. **REQ-004 needs zero new modal code.**

---

## 4. Reference Repos

### AppFlowy — minimal applicability
- `GridAddRowButton` (grid_footer.dart): simple footer button → `GridEvent.createRow()`. No template concept. [appflowy/.../grid/presentation/widgets/footer/grid_footer.dart:18-44]
- `RowService.createRow` (row_service.dart): Rust-backed, no template parameter. [appflowy/.../application/row/row_service.dart:15]
- AppFlowy "template" matches are codegen/protobuf, not user record templates.
- **Borrowable**: the minimal single-action add-row button as a UX baseline only.

### Anytype — highly applicable
- Per-view `defaultTemplateId` [anytype-ts/src/ts/interface/block/dataview.ts:254]
- `getTemplateId()` = `view.defaultTemplateId || type.defaultTemplateId` [widget/index.tsx:167]
- `MenuTemplateList`: template picker grid with previews, "new template" entry, set-default, context menu, keyboard nav, empty-state [component/menu/dataview/template/list.tsx:1-278]
- **Dedicated template button adjacent to add-row**: `controls.tsx:750-760` — `onRecordAdd(e, -1)` and `onTemplateMenu(e, -1)` as separate adjacent buttons
- Create call: `C.ObjectCreate(details, flags, templateId, typeKey, space, cb)` [widget/index.tsx:263]
- **Borrowable**: separate template affordance, per-view default template, picker UX. The fork's `newRecordTemplate` is analogous to Anytype's `defaultTemplateId`.

---

## 5. Notion Parity (via WebFetch)

**Canonical Notion UX** [https://www.notion.com/help/database-templates]:
- Blue **"New" button with dropdown arrow** at top-right of database.
- Click "New" → new page (default template applied if set).
- Click dropdown arrow → template picker listing all templates + "+ New template".
- Templates are **per-database** (not workspace-global).
- Template = a page with predefined properties + content.
- **Repeating templates** (cron) and **Database Buttons** (action-step buttons) are separate features — **OUT of scope** for this fork phase (spec REQ-003).

**Parity gap**: The fork has a single `newRecordTemplate` per database (Notion has many). The spec does NOT mandate multi-template support (1-3 call-site + Effort S constraints). **Minimal parity-correct feature**: split-button dropdown showing the configured template + create-via-existing-path. Multi-template picker is a future scope expansion.

---

## 6. Recommended Design

### UX: Split-button (Option A — Notion parity, minimal scope)

Convert `renderNewButton` into a split button when a template is configured:
- **Main button**: existing "New" → `actions.createEntry()` (template auto-applied, unchanged).
- **Caret button** (~24px): opens `Menu` (mobile-safe, `setUseNativeMenu(false)`, same as RowMenu).
  - "New with [template name]" → `actions.createEntry()` (template auto-applied).
  - "Configure template…" → `actions.openTemplateConfig()`.
- When no template configured: render existing single "New" button (no caret).

**Row-menu**: add one "New from template" item (after Insert Below) → `actions.createEntry()`. Only when template configured.

**Optional confirm (REQ-004)**: wrap "New with [template]" in `await confirmWithModal(...)`, bail on `false`.

### Isolated module: `src/data/TemplateToolbarAction.ts` (EuroFormat shape)

Pure functions, no class state, no Obsidian API imports (except types), rebase-friendly — mirrors `EuroFormat.ts`.

```typescript
export interface TemplateToolbarContext {
  templateConfig: NewRecordTemplateConfig | undefined;
  hasTemplate: boolean;
  templateLabel: string;
}

export function resolveTemplateToolbarContext(database: DatabaseConfig): TemplateToolbarContext;

export interface TemplateMenuItem {
  id: string;
  label: string;
  icon: string;
  withTemplate: boolean;
  openConfig?: boolean;
}

export function buildTemplateMenuItems(
  ctx: TemplateToolbarContext,
  i18n: { newWithTemplate: (name: string) => string; configureTemplate: string }
): TemplateMenuItem[];
```

**The module does NOT call `createBlankEntry`** — it only resolves what to show. The actual create stays in `DatabaseView` (existing path). This keeps the create path singular (REQ-002) and the module rebase-safe.

### Algorithm

```
resolveTemplateToolbarContext(database):
  templateConfig = database.newRecordTemplate
  hasTemplate = templateConfig?.path is non-empty
  templateLabel = hasTemplate ? basename(templateConfig.path) : i18n("common.notSet")
  return { templateConfig, hasTemplate, templateLabel }

buildTemplateMenuItems(ctx, i18n):
  if !ctx.hasTemplate: return []
  return [
    { id: "new-with-template", label: i18n.newWithTemplate(ctx.templateLabel),
      icon: "file-plus-2", withTemplate: true },
    { id: "configure-template", label: i18n.configureTemplate,
      icon: "settings-2", withTemplate: false, openConfig: true },
  ]

Toolbar renderNewButton (line 1683):
  ctx = actions.getTemplateContext?.()
  if ctx?.hasTemplate:
    split button: main → actions.createEntry(); caret → Menu(items)
      "new-with-template" → [optional confirmWithModal] → actions.createEntry()
      "configure-template" → actions.openTemplateConfig?.()
  else: existing renderNewButton (unchanged)

RowMenu.show (after line 74):
  ctx = actions.getTemplateContext?.()
  if ctx?.hasTemplate:
    menu.addItem("New from template", "file-plus-2", → actions.createEntry?.())

DatabaseView wiring (lines 563, 595, 603, 634, 662):
  getTemplateContext: () => resolveTemplateToolbarContext(getCurrentEntry()?.config)
  openTemplateConfig: () => openViewConfigPanel / existing config method
```

### i18n keys (4 new, additive)

| Key | en | zh-CN | zh-TW |
|-----|----|-------|-------|
| `toolbar.newFromTemplate` | New from template | 从模板新建 | 從範本新增 |
| `toolbar.newWithTemplate` | New with {name} | 用 {name} 新建 | 用 {name} 新增 |
| `toolbar.configureTemplate` | Configure template… | 配置模板… | 設定範本… |
| `template.confirmCreate` | Create a new record using template "{name}"? | 使用模板「{name}」新建记录？ | 使用範本「{name}」新增記錄？ |

---

## 7. Edge Cases

| Case | Behavior | Source |
|------|----------|--------|
| No template configured | Dropdown hidden; main "New" does blank create (existing path) | DatabaseView.ts:3675 |
| Template file deleted | Existing `Notice(t("template.loadFailed"))`, no write | DatabaseView.ts:3537-3542 |
| Concurrent/rapid clicks | Existing `suppressNextCreate`/`hasActiveOverlay` guard (`.menu` is an overlay) | DatabaseView.ts:845-850, 870 |
| iCloud churn | One `createNote` per click; zero extra writes; dropdown is display-only | DatabaseView.ts:3561 |
| Mobile | `Menu` + `ConfirmModal` are mobile-safe (proven by RowMenu) | RowMenu.ts:45, ConfirmModal.ts:13 |
| Empty template body | `parseRecordTemplate` returns `{frontmatter:{}, body:""}`; create proceeds | RecordTemplate.ts:15 |
| Calendar/timeline views | `renderNewButton` already gated `!isChartView`; calendar uses `guardedCalendarCreate` — feature applies to table/board/gallery/list only | ToolbarRenderer.ts:236, 282 |

---

## 8. Diff Shape (SC-003, SC-004)

| Artifact | Count | Files |
|----------|-------|-------|
| New `src/data/` module | 1 | `TemplateToolbarAction.ts` |
| Call-site edits | 2 | `ToolbarRenderer.ts`, `RowMenu.ts` |
| Wiring | 1 (part of call-site) | `DatabaseView.ts` |
| i18n keys | 4 new (additive) | `i18n.ts` |
| **Total new files** | **1** | ✅ EuroFormat shape |
| **Total modified files** | **3** + i18n | ✅ within 1-3 call-site budget |

No scheduler, no network buttons, no telemetry, no secrets, no formula/rollup/view/filter changes. **Rebase-friendly.**

---

## 9. Ranked Recommendations

| Rank | Recommendation | Rationale | Spec ref |
|------|----------------|-----------|----------|
| 1 | **Ship split-button dropdown (Option A)** | Notion parity, 2 call sites, no schema change, rebase-friendly | REQ-001, SC-001 |
| 2 | **Add row-menu "New from template" item** | Distinct row-menu host exists; same module; counts as call site 2 | REQ-001, Scenario 4 |
| 3 | **Optional confirm via existing `confirmWithModal`** | Mobile-safe, zero new modal code, cancel writes nothing | REQ-004, Scenario 3 |
| 4 | **Defer `skipTemplate` ("New no template")** | Not spec-mandated; keeps create-path signature untouched; 2-line follow-up if wanted | NFR-R01 |
| 5 | **Defer multi-template picker** | Exceeds 1-3 call-site + Effort S; requires `NewRecordTemplateConfig` schema change (single→array) | Out of scope |
| 6 | **Do NOT pre-validate template file on render** | Would add vault reads per render (iCloud churn); existing error path is correct | NFR-R03 |

---

## 10. Ruled-Out Directions

- New create engine (REQ-002 forbids; existing path complete).
- New modal (`ConfirmModal` exists, mobile-safe).
- Multi-template picker (scope exceeds 1-3 call-site + Effort S).
- Repeating/scheduler templates (spec OUT of scope, REQ-003).
- Network buttons: mail/webhook/Slack/notifications (spec OUT of scope).
- Labeling-only approach (fails Notion parity + discoverability).
- Pre-validating template file on render (iCloud churn).
- New debounce/queue for concurrent clicks (existing guard handles it).

---

## 11. Open Questions Resolved

| Q | Answer | Evidence |
|---|--------|----------|
| Q1 | Create path = `createBlankEntry` → `planCreateEntry` → `createNote`; template auto-applied | DatabaseView.ts:3528-3680, CreateEntryPlan.ts:119 |
| Q2 | Toolbar = `ToolbarRenderer.renderNewButton` (2 sites); Row-menu = `RowMenu.show`; ≤2 new call sites | ToolbarRenderer.ts:236,282,1683; RowMenu.ts |
| Q3 | `confirmWithModal` exists, mobile-safe, used by RowMenu | ConfirmModal.ts:1-71, RowMenu.ts:102 |
| Q4 | AppFlowy = no templates; Anytype = rich per-view `defaultTemplateId` + picker + adjacent template button | grid_footer.dart, dataview.ts:254, list.tsx, controls.tsx:750 |
| Q5 | Notion = blue "New" + dropdown → template picker; per-database; repeating/buttons OUT of scope | notion.com/help/database-templates |
| Q6 | Edge cases handled by existing path: suppressNextCreate, single createNote, Menu/Modal mobile-safe | DatabaseView.ts:845, RowMenu.ts:45 |
| Q7 | Module = `TemplateToolbarAction.ts` (pure fns); 2 call sites + wiring; 4 i18n keys; skipTemplate deferred | EuroFormat.ts pattern |

---

## Sources

**Fork** (src at `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`):
- `src/data/RecordTemplate.ts:13-58`
- `src/data/CreateEntryPlan.ts:119-173, 3638-3671`
- `src/data/EuroFormat.ts:1-42`
- `src/data/types.ts:154-157`
- `src/views/DatabaseView.ts:3528-3695, 845-856, 563-662`
- `src/views/ToolbarRenderer.ts:81, 236, 282, 1683-1691`
- `src/views/RowMenu.ts:1-121`
- `src/views/modals/ConfirmModal.ts:1-71`
- `src/views/ViewConfigPanelRenderer.ts:412-477`
- `src/i18n.ts:36-47, 177`

**AppFlowy** (`specs/.../context/appflowy`):
- `frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/footer/grid_footer.dart:18-44`
- `frontend/appflowy_flutter/lib/plugins/database/application/row/row_service.dart:15-57`
- `frontend/rust-lib/flowy-database2/src/services/field/type_options/`

**Anytype** (`specs/.../context/anytype-ts`):
- `src/ts/interface/block/dataview.ts:194-264`
- `src/ts/component/menu/dataview/template/list.tsx:1-278`
- `src/ts/component/block/dataview/controls.tsx:750-760`
- `src/ts/component/widget/index.tsx:140-268`

**Notion**:
- https://www.notion.com/help/database-templates
- https://www.notion.com/help/database-buttons
