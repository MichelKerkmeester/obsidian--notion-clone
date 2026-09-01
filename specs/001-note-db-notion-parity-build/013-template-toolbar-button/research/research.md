# Deep Research: Toolbar New-From-Template Button

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/glm-5-2`. Stop reason: max_iterations. Average newInfoRatio: 0.545.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001: Existing New Button Gap Analysis

**Focus**: Trace the exact gap between the existing toolbar "New" button and the proposed "New from template" control. Confirm whether the existing button already calls the template path.

## Findings

### F1.1 — The existing "New" button ALREADY calls the full template path

The toolbar "New" button (`renderNewButton`, ToolbarRenderer.ts:1683-1691) calls `actions.createEntry()` with no arguments. This routes through:

`guardedCreateEntry` (DatabaseView.ts:845) → `createBlankEntry` (DatabaseView.ts:3528) → `loadNewRecordTemplate` (DatabaseView.ts:3673) → `buildCreateEntryPlan` (DatabaseView.ts:3638) → `planCreateEntry` (CreateEntryPlan.ts:119) → `dataSource.createNote()`.

`createBlankEntry` at line 3536-3538 explicitly loads the template:
```typescript
let template: ParsedRecordTemplate | undefined;
try {
  template = await this.loadNewRecordTemplate(entry.config);
```

If a template is configured (`database.newRecordTemplate?.path` exists), it is loaded, parsed, and applied. For "core" engine, `{{title}}`/`{{date}}`/`{{time}}` are resolved (RecordTemplate.ts:51-57). For "templater" engine, Templater runs post-create (DatabaseView.ts:3568-3573).

**Conclusion**: The template path is ALREADY fully wired to the toolbar "New" button. The gap is NOT a missing code path — it is **discoverability and labeling**.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:1683-1691]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:3528-3538]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:3673-3679]

### F1.2 — The button is labeled "New", not "New from template"

The i18n key `toolbar.new` resolves to "New" (en), "新建" (zh-CN), "新增" (zh-TW) (i18n.ts:177, 1629, 3130). There is NO `toolbar.newFromTemplate` or `menu.newFromTemplate` key — confirming this is a new feature surface.

The button shows a "+" icon and the text "New". A user who has configured a template has no visible indication that clicking "New" will apply that template. This is the discoverability gap the spec identifies.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/i18n.ts:177]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:1685-1690]

### F1.3 — Template config is per-database, single template, in ViewConfigPanelRenderer

Template configuration lives in `ViewConfigPanelRenderer.renderNewRecordTemplateSetting` (ViewConfigPanelRenderer.ts:420-477). It sets `database.newRecordTemplate` (a `NewRecordTemplateConfig = { path: string; engine: "markdown"|"core"|"templater" }`, types.ts:154-157).

Key constraints:
- **Single template per database** — no multi-template array. A Notion-style template picker (choose among N templates) would require a schema change to `NewRecordTemplateConfig`, which likely exceeds the "1-3 call-site edits" budget.
- Template path is chosen via `MarkdownFileSuggestModal` (ViewConfigPanelRenderer.ts:460).
- Engine is a dropdown: markdown / core / templater (ViewConfigPanelRenderer.ts:439-443).
- An unset template (`!setting?.path`) returns `undefined` from `loadNewRecordTemplate` — the create still works, just without template frontmatter/body.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ViewConfigPanelRenderer.ts:420-477]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types.ts:154-157]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:3673-3679]

### F1.4 — Row menu has NO "New from template" item

`RowMenu.show` (RowMenu.ts:36-120) offers: "Open note", "Insert above", "Insert below", "Show record icon", "Duplicate record", "Delete row". There is no "New from template" item. The row menu IS a distinct host from the toolbar (separate file, separate class, separate invocation).

The row menu already imports and uses `confirmWithModal` for the delete confirmation (RowMenu.ts:6, 102-108), proving the mobile-safe confirm pattern is already established in this host.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:36-120]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:6]

### F1.5 — The gap is threefold: labeling, row-menu presence, and optional confirm

Based on the evidence, the feature gap is:
1. **Labeling**: The toolbar "New" button doesn't communicate that it applies a template. A "New from template" label (or a split-button/dropdown when a template is configured) would close the discoverability gap.
2. **Row-menu presence**: The row menu lacks a "New from template" item entirely.
3. **Optional confirm**: The toolbar "New" button has no confirm-before-create. The row menu's delete already uses `confirmWithModal`, so the pattern is available.

The feature does NOT need a new create code path — it reuses `createBlankEntry` / `loadNewRecordTemplate` / `planCreateEntry` / `dataSource.createNote`. The isolated module's job is to wrap the call with template-aware labeling and optional confirmation, not to reimplement creation.

## What Was Tried
- Traced `renderNewButton` → `createEntry` → `guardedCreateEntry` → `createBlankEntry` → `loadNewRecordTemplate` — confirmed template path is already wired.
- Searched i18n for `newFromTemplate` keys — none exist, confirming new feature.
- Read ViewConfigPanelRenderer template settings — confirmed single-template-per-database config.
- Read RowMenu — confirmed no "New from template" item, but `confirmWithModal` is already imported.

## What Failed
- Nothing failed this iteration.

## Ruled-Out Directions
- **Multi-template picker**: The single `NewRecordTemplateConfig` per database means a Notion-style multi-template picker would require a config schema change. This likely exceeds the "1-3 call-site edits" budget. The feature should work with the existing single-template config. (Will revisit if reference repos show a simpler pattern.)

## Novelty Justification
High newInfoRatio (0.90): Confirmed the core architectural insight that the template path is already wired — the feature is a UI/discoverability wrapper, not a new create engine. This reframes the entire implementation approach.

---

# Iteration 002: Isolated Module Design (EuroFormat Pattern)

**Focus**: Design the new `src/data/` module's interface and responsibilities following the `EuroFormat.ts` isolated-diff pattern.

## Findings

### F2.1 — EuroFormat.ts pattern: pure functions, single file, no view-layer imports

`EuroFormat.ts` (42 lines) is the canonical isolated-module pattern:
- Single file under `src/data/`
- Exports pure functions (`formatEuroNumber`, `formatEuroNumber2`, `formatEuroCurrency`)
- No imports from `obsidian` or `src/views/`
- Comment: "Local fork override. Kept in one module so it stays a small, rebasable diff."

However, many `src/data/` files DO import `t` from `../i18n` (14 files: QueryEngine.ts, GroupDisplay.ts, DataSource.ts, ColumnTypes.ts, ComputedField.ts, etc.) and some import from `obsidian` (RecordTemplate.ts imports `parseYaml`). So the established pattern allows `../i18n` and `obsidian` imports in `src/data/` — just not `src/views/` imports.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/EuroFormat.ts:1-42]
[SOURCE: grep for `from "../i18n"` in src/data/ — 14 files]

### F2.2 — Proposed module: `src/data/TemplateToolbarAction.ts`

The isolated module should provide **template-aware button logic** — pure functions that the toolbar and row-menu call sites use to decide labels, visibility, and confirm behavior. It must NOT reimplement the create path (that stays in `DatabaseView.createBlankEntry`).

Proposed exports:

```typescript
// src/data/TemplateToolbarAction.ts
import { t } from "../i18n";
import { DatabaseConfig } from "./types";

/** Whether a record template is configured for this database. */
export function hasRecordTemplate(
  config: Pick<DatabaseConfig, "newRecordTemplate">
): boolean {
  return !!config.newRecordTemplate?.path;
}

/** Button label: "New from template" when configured, "New" otherwise. */
export function getNewFromTemplateLabel(
  config: Pick<DatabaseConfig, "newRecordTemplate">
): string {
  return hasRecordTemplate(config)
    ? t("toolbar.newFromTemplate")
    : t("toolbar.new");
}

/** Tooltip showing the template path when configured. */
export function getNewFromTemplateTooltip(
  config: Pick<DatabaseConfig, "newRecordTemplate">
): string {
  const path = config.newRecordTemplate?.path;
  return path
    ? t("toolbar.newFromTemplateTooltip", { path })
    : t("toolbar.new");
}

/** Whether the New from template control should be visible. */
export function shouldShowNewFromTemplate(
  isReadOnly: boolean,
  viewType: string
): boolean {
  return !isReadOnly && viewType !== "chart";
}

/** Whether to show the confirm modal before creating. */
export function shouldConfirmNewFromTemplate(
  config: Pick<DatabaseConfig, "newRecordTemplate">,
  confirmEnabled: boolean
): boolean {
  return confirmEnabled && hasRecordTemplate(config);
}
```

**Design rationale:**
- `Pick<DatabaseConfig, "newRecordTemplate">` minimizes the type coupling — callers pass the config they already have.
- Functions are pure (no side effects, no UI rendering) — matches EuroFormat.ts.
- Labels use `t()` from `../i18n` — matches 14 existing `src/data/` files.
- The module does NOT call `createBlankEntry`, `planCreateEntry`, or `dataSource.createNote` — it only provides decision logic. The actual create call stays in the view layer's `actions.createEntry()`.

[SOURCE: pattern from /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/EuroFormat.ts:1-42]
[SOURCE: type from /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types.ts:154-157,279]

### F2.3 — New i18n keys required

The module references two new i18n keys that must be added to `i18n.ts` (3 locales: en, zh-CN, zh-TW):

| Key | en | zh-CN | zh-TW |
|-----|-----|-------|-------|
| `toolbar.newFromTemplate` | "New from template" | "从模板新建" | "從範本新增" |
| `toolbar.newFromTemplateTooltip` | "Create from template: {path}" | "从模板创建：{path}" | "從範本建立：{path}" |
| `menu.newFromTemplate` | "New from template" | "从模板新建" | "從範本新增" |
| `toolbar.confirmNewFromTemplate` | "Create a new note from template \"{path}\"?" | "从模板\"{path}\"创建新笔记？" | "從範本\"{path}\"建立新筆記？" |

Note: `i18n.ts` is a single 250KB file with all locales inline. Adding 4 keys × 3 locales = 12 lines. This is a minimal, rebasable diff — but it IS a 4th file touched beyond the "1 new module + 1-3 call sites" budget. The spec's "1-3 call-site edits" likely refers to code logic call sites, not i18n string additions. The i18n file is a data file, not a call site.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/i18n.ts:36-43,177]

### F2.4 — The module does NOT need to wrap the create call

The spec says the module is "an isolated wrapper that calls the existing RecordTemplate / CreateEntryPlan create-with-defaults path." But tracing the actual code, the create call chain is:

`actions.createEntry()` → `guardedCreateEntry` → `createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` → `planCreateEntry` → `dataSource.createNote`

`createBlankEntry` is a private method on `DatabaseView` (view layer). The isolated `src/data/` module cannot call it directly without importing from `src/views/`, which would break the isolation pattern.

**Resolution**: The module provides the DECISION logic (label, visibility, confirm-needed). The VIEW LAYER call sites use the module's functions and then call the existing `actions.createEntry()` — which already routes through the full template path. The "wrapper" aspect is that the call sites now make a template-aware decision before calling the same `actions.createEntry()` they already call.

This is consistent with EuroFormat.ts: it provides formatting functions that view-layer renderers call — it doesn't render anything itself.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:845-850,3528-3538]

### F2.5 — Alternative: module could also provide the confirm orchestration

A richer module design could export an async function that handles the confirm-then-create flow:

```typescript
export interface NewFromTemplateActionContext {
  config: Pick<DatabaseConfig, "newRecordTemplate">;
  confirmEnabled: boolean;
  /** Called to show the confirm modal; returns true if confirmed. */
  confirm: () => Promise<boolean>;
  /** Called to create the entry (delegates to existing path). */
  createEntry: () => void;
}

export async function executeNewFromTemplate(
  ctx: NewFromTemplateActionContext
): Promise<void> {
  if (shouldConfirmNewFromTemplate(ctx.config, ctx.confirmEnabled)) {
    const ok = await ctx.confirm();
    if (!ok) return; // cancel = no write
  }
  ctx.createEntry();
}
```

This keeps the confirm/create orchestration in the data module (testable, pure) while the view layer injects the actual `confirmWithModal` and `actions.createEntry` callbacks. This is the recommended design — it centralizes the feature logic in one rebasable file and keeps call sites to 1-2 lines each.

**Trade-off**: This adds a dependency on `Promise` and async — but `src/data/` files already use async (DataSource.ts, QueryEngine.ts). No new dependency.

[SOURCE: pattern from /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/DataSource.ts:328]

## What Was Tried
- Examined EuroFormat.ts for the isolated-module pattern — confirmed pure functions, no view imports.
- Checked whether `src/data/` files import `t` from `../i18n` — yes, 14 files do.
- Designed the module interface with pure decision functions + optional confirm orchestration.
- Identified 4 new i18n keys needed (× 3 locales).

## What Failed
- Initial idea of having the module directly call `createBlankEntry` — rejected because it's a private view-layer method; would break isolation.

## Novelty Justification
Moderate newInfoRatio (0.65): Defined the exact module interface, identified the i18n key additions, and resolved the "wrapper" design tension by using callback injection. The confirm-orchestration pattern is a new design decision.

---

# Iteration 003: Toolbar Call-Site Integration

**Focus**: Identify the exact edit points in ToolbarRenderer.ts for the "New from template" control, and how the confirm flow wires through DatabaseView.ts.

## Findings

### F3.1 — renderNewButton is the primary toolbar call site

`renderNewButton` (ToolbarRenderer.ts:1683-1691) is called at two points in `render()`:
- Line 236: `this.renderNewButton(titleActions, actions)` — embedded view (non-chrome)
- Line 282: `this.renderNewButton(right, actions)` — standalone view (chrome)

Both are inside `render()` which has `currentDb = currentEntry?.config` (line 137) available. The method currently receives only `(toolbar, actions)` and calls `actions.createEntry()` with no template awareness.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:1683-1691,236,282]

### F3.2 — Proposed toolbar edit (call site 1 of 3)

**File**: `src/views/ToolbarRenderer.ts`

**Changes**:
1. Import the isolated module: `import { hasRecordTemplate, getNewFromTemplateLabel, getNewFromTemplateTooltip, shouldConfirmNewFromTemplate } from "../data/TemplateToolbarAction";`
2. Add optional fields to `ToolbarActions` interface (line 81-82 area):
   ```typescript
   /** When true, show a confirm modal before template-based create. */
   readonly confirmNewFromTemplate?: boolean;
   /** Returns true if the user confirmed the create. */
   confirmCreate?: () => Promise<boolean>;
   ```
3. Change `renderNewButton` signature and body:
   ```typescript
   private renderNewButton(toolbar: HTMLElement, actions: ToolbarActions, config?: DatabaseConfig): void {
     const label = config ? getNewFromTemplateLabel(config) : t("toolbar.new");
     const tooltip = config ? getNewFromTemplateTooltip(config) : t("toolbar.new");
     const newBtn = toolbar.createEl("button", {
       cls: "db-new-button",
       attr: { "aria-label": tooltip, title: tooltip },
     });
     const hasTemplate = config ? hasRecordTemplate(config) : false;
     setIcon(newBtn.createSpan({ cls: "db-new-button-icon" }),
       hasTemplate ? "file-plus-2" : "plus");
     newBtn.createSpan({ text: label });
     newBtn.onclick = () => {
       if (config && shouldConfirmNewFromTemplate(config, actions.confirmNewFromTemplate === true)) {
         void actions.confirmCreate?.().then((ok) => { if (ok) actions.createEntry(); });
       } else {
         actions.createEntry();
       }
     };
   }
   ```
4. Update both call sites:
   - Line 236: `this.renderNewButton(titleActions, actions, currentDb)`
   - Line 282: `this.renderNewButton(right, actions, currentDb)`

**Diff size**: ~15 lines changed in one file. Rebasable — the method signature change is additive (optional param), and the two call-site updates are one-token additions.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:81-82,1683-1691,236,282]

### F3.3 — The toolbar's createEntry is guardedCalendarCreate, not guardedCreateEntry

At DatabaseView.ts:1902, the standalone toolbar's `createEntry` is wired to `this.guardedCalendarCreate(defaults)`, which calls `createCalendarAwareCreateEntry` — this checks for calendar/timeline context and falls through to `createBlankEntry` for non-calendar views. The template loading happens inside `createBlankEntry` regardless.

This means the "New from template" button on the toolbar already routes through the template path via `guardedCalendarCreate` → `createCalendarAwareCreateEntry` → `createBlankEntry` → `loadNewRecordTemplate`. No change needed to the create callback — only the label/tooltip/confirm wrapping changes.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:1902,852-856]

### F3.4 — Confirm flow requires a callback injection from DatabaseView (call site 3 of 3)

The toolbar (`ToolbarRenderer`) does not have access to `App` — it's a pure renderer class with no `app` field. The confirm modal needs `App` (for `confirmWithModal(app, ...)`).

**Solution**: Add `confirmCreate?: () => Promise<boolean>` to `ToolbarActions` (part of call site 1). DatabaseView.ts provides the implementation when constructing the actions object (call site 3):

```typescript
// In the actions object at DatabaseView.ts:1839-1915
confirmNewFromTemplate: true, // or false to defer REQ-004
confirmCreate: () => confirmWithModal(this.app, {
  title: t("toolbar.newFromTemplate"),
  message: t("toolbar.confirmNewFromTemplate", {
    path: this.getActiveDb()?.newRecordTemplate?.path ?? ""
  }),
  confirmText: t("common.create"),
}),
```

This requires importing `confirmWithModal` in DatabaseView.ts. Let me check if it's already imported.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:1839-1915]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/modals/ConfirmModal.ts:69-71]

### F3.5 — DatabaseView.ts may already import confirmWithModal

Let me verify: `confirmWithModal` is used in RowMenu.ts (imported at line 6). DatabaseView.ts is a 10,525-line file — it may already import it for other confirm flows. If not, adding the import is a one-line addition to the import block.

The DatabaseView.ts edit (call site 3) is:
1. Add `confirmNewFromTemplate: true` and `confirmCreate: () => confirmWithModal(...)` to the toolbar actions object (lines 1839-1915)
2. Add import for `confirmWithModal` if not already present

**Total call-site edit count**: 3 (ToolbarRenderer.ts, RowMenu.ts, DatabaseView.ts) — within the 1-3 budget.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:6]

## What Was Tried
- Traced `renderNewButton` call sites — found 2 invocations, both with `currentDb` available.
- Identified that toolbar lacks `App` access — designed callback injection pattern.
- Verified the create callback is `guardedCalendarCreate` which already routes through template path.

## What Failed
- Nothing failed this iteration.

## Novelty Justification
Moderate newInfoRatio (0.60): Defined the exact toolbar edit with line-level precision, resolved the `App` access gap via callback injection, and confirmed the 3-call-site budget is met.

---

# Iteration 004: RowMenu Call-Site + ConfirmModal Reuse

**Focus**: Identify the exact edit points in RowMenu.ts for the "New from template" menu item, and how the existing ConfirmModal is reused.

## Findings

### F4.1 — RowMenu is a distinct host with App access and confirmWithModal already imported

`RowMenu` (RowMenu.ts:23-121) is a separate class from `ToolbarRenderer`, constructed at DatabaseView.ts:555-567. Its `RowMenuActions` interface (RowMenu.ts:8-21) includes:
- `app: App` — direct App access (unlike the toolbar)
- `createEntry?(defaults?, position?): void`
- `getConfig?(): ViewConfig | undefined`
- `getCreateDefaults?(row, context): Record<string, unknown>`

It already imports `confirmWithModal` from `./modals/ConfirmModal` (RowMenu.ts:6) and uses it for delete confirmation (lines 102-108). This proves the mobile-safe confirm pattern is established in this host.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:1-21,102-108]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:555-567]

### F4.2 — RowMenu needs database config access (not just ViewConfig)

`RowMenuActions.getConfig()` returns `ViewConfig`, but `newRecordTemplate` lives on `DatabaseConfig` (types.ts:279). The row menu needs database-level config to check whether a template is configured.

`DatabaseView` has `this.getActiveDb()` which returns `DatabaseConfig` (used at lines 371, 394, 530, 588, etc.). The fix is to add `getDatabaseConfig?: () => DatabaseConfig | undefined` to `RowMenuActions` and wire it in DatabaseView.ts.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types.ts:279]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:530]

### F4.3 — Proposed RowMenu edit (call site 2 of 3)

**File**: `src/views/RowMenu.ts`

**Changes**:
1. Import the isolated module:
   ```typescript
   import { hasRecordTemplate, getNewFromTemplateLabel, shouldConfirmNewFromTemplate } from "../data/TemplateToolbarAction";
   import { DatabaseConfig } from "../data/types";
   ```
2. Add to `RowMenuActions` interface (after line 20):
   ```typescript
   getDatabaseConfig?(): DatabaseConfig | undefined;
   /** When true, show a confirm modal before template-based create. */
   readonly confirmNewFromTemplate?: boolean;
   ```
3. In `show()`, add a "New from template" menu item. The best placement is after the "insert above/below" block (after line 75, before the record-icon section). The item should only appear when not in calendar/timeline view (matching the insert-above/below guard at line 58):

   ```typescript
   // After the insert above/below separator (line 75)
   const dbConfig = this.actions.getDatabaseConfig?.();
   if (this.actions.createEntry && dbConfig) {
     menu.addItem((item) => item
       .setTitle(getNewFromTemplateLabel(dbConfig))
       .setIcon(hasRecordTemplate(dbConfig) ? "file-plus-2" : "plus")
       .onClick(async () => {
         if (shouldConfirmNewFromTemplate(dbConfig, this.actions.confirmNewFromTemplate === true)) {
           const ok = await confirmWithModal(this.actions.app, {
             title: t("toolbar.newFromTemplate"),
             message: t("toolbar.confirmNewFromTemplate", {
               path: dbConfig.newRecordTemplate?.path ?? "",
             }),
             confirmText: t("common.create"),
           });
           if (!ok) return;
         }
         this.actions.createEntry?.();
       })
     );
     menu.addSeparator();
   }
   ```

**Diff size**: ~20 lines added. Rebasable — all additions are new menu items, no existing lines changed except the import block.

**Note on placement**: The "New from template" item is placed in the row menu's create section (alongside insert above/below), not in the destructive section (duplicate/delete). This matches Notion's pattern where "New from template" is a creation action, not a row-specific action.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:36-120]

### F4.4 — ConfirmModal is mobile-safe

`ConfirmModal` (ConfirmModal.ts:13-67) extends Obsidian's `Modal` class. Obsidian's `Modal` works on both desktop and mobile (it's the standard overlay component). The modal uses:
- `this.contentEl.createEl/createDiv` — standard DOM, no desktop-only APIs
- `this.modalEl.isShown()` / `this.close()` — standard Modal API
- No `Menu`, no native context menu, no electron-only APIs

The `confirmWithModal(app, options)` function (ConfirmModal.ts:69-71) returns `Promise<boolean | string>`. Cancel returns `false` (line 40: `onclick = () => this.finish(false)`, and `onClose` also calls `finish(false)` at line 58). This satisfies REQ-004: "cancel performs no write."

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/modals/ConfirmModal.ts:13-71]

### F4.5 — DatabaseView.ts edit for row menu wiring (part of call site 3)

The DatabaseView.ts edit for the row menu is adding `getDatabaseConfig` and `confirmNewFromTemplate` to the RowMenu construction (lines 555-567):

```typescript
this.rowMenu = new RowMenu({
  app: this.app,
  // ... existing fields ...
  createEntry: (defaults, position) => this.guardedCreateEntry(defaults, position),
  getConfig: () => this.getConfig(),
  getDatabaseConfig: () => this.getActiveDb(),  // NEW
  confirmNewFromTemplate: true,  // NEW (or false to defer REQ-004)
  getVisibleRows: () => this.rows,
  getCreateDefaults: (row, context) => this.getCreateEntryDefaultsForRow(row, context),
});
```

This is part of the same DatabaseView.ts edit as the toolbar confirm callback (iteration 3, F3.4). Both are in the same file, counting as one call-site edit.

**Final call-site edit count**:
1. `ToolbarRenderer.ts` — renderNewButton + ToolbarActions interface + import
2. `RowMenu.ts` — new menu item + RowMenuActions interface + imports
3. `DatabaseView.ts` — toolbar confirmCreate callback + row menu getDatabaseConfig/confirmNewFromTemplate

Plus: 1 new module (`TemplateToolbarAction.ts`) + i18n key additions. **Within the 1-3 call-site budget.**

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:555-567]

## What Was Tried
- Traced RowMenuActions — found it has `app` but only `getConfig()` (ViewConfig), not database config.
- Designed `getDatabaseConfig` addition to access `newRecordTemplate`.
- Verified ConfirmModal is mobile-safe (extends Modal, no desktop-only APIs).
- Confirmed cancel path returns false → no write (REQ-004 satisfied).

## What Failed
- Nothing failed this iteration.

## Novelty Justification
Moderate newInfoRatio (0.55): Defined the exact row-menu edit with placement and confirm flow, confirmed mobile safety of ConfirmModal, and verified the 3-call-site budget holds with both toolbar and row-menu edits.

---

# Iteration 005: AppFlowy Reference Mining

**Focus**: How does AppFlowy implement template-based row creation in its Rust grid model and Flutter UI?

## Findings

### F5.1 — AppFlowy has NO "New from template" button concept

AppFlowy's row creation UI is minimal:
- **GridAddRowButton** (grid_footer.dart:13-42): A plain "New row" button at the grid footer. Dispatches `GridEvent.createRow()` with no template selection. Label: `LocaleKeys.grid_row_newRow.tr()`. Icon: `FlowySvgs.add_less_padding_s` (a plus icon).
- **RowActionMenu** (action.dart:14-144): Row-level actions enum: `insertAbove`, `insertBelow`, `duplicate`, `delete`. NO "new from template" action. The insert above/below shows a confirm dialog (`showCancelAndDeleteDialog`) when sorts are active — analogous to the fork's confirm pattern but for sort-removal, not template confirmation.

AppFlowy does NOT have user-configurable record templates. There is no "choose a template" UI for individual records.

[SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/footer/grid_footer.dart:13-42]
[SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/row/action.dart:71-144]

### F5.2 — AppFlowy's template.rs is database-structure templates, not record templates

`template.rs` (177 lines) contains three functions: `make_default_grid`, `make_default_board`, `make_default_calendar`. Each creates a `CreateDatabaseParams` with preset fields, rows, and layout settings. These are templates for creating NEW DATABASES (grid/board/calendar presets), not templates for creating new rows within an existing database.

For example, `make_default_board` (template.rs:61-125) creates a board with "Description" (text), "Status" (single-select with To Do/Doing/Done options), and 3 pre-filled cards. This is a one-time database creation preset, not a reusable row template.

[SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/template.rs:15-177]

### F5.3 — AppFlowy pre-fills cells via payload, not templates

AppFlowy's row creation supports pre-filling cells via `CreateRowPayloadPB.data: HashMap<String, String>` (pre_fill_row_with_payload_test.rs:14-18). The caller passes a field_id → cell_data map, and the row is created with those cells pre-filled. Unknown field IDs are silently ignored (test at line 32-59).

This is a programmatic pre-fill mechanism, not a user-facing template selection. It's analogous to the fork's `createEntry(defaults: Record<string, unknown>)` where defaults are frontmatter values — but the fork's system is more advanced because it supports template files with frontmatter + body + placeholder resolution (`{{date}}`/`{{title}}`/`{{time}}`).

There is also a filter-driven pre-fill path (`pre_fill_row_according_to_filter_test.rs`) where new rows are pre-filled based on active filter criteria — analogous to the fork's `CreateEntryPlan` which pre-fills frontmatter from source rules.

[SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/tests/database/pre_fill_cell_test/pre_fill_row_with_payload_test.rs:8-59]
[SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/tests/database/pre_fill_cell_test/pre_fill_row_according_to_filter_test.rs]

### F5.4 — AppFlowy's confirm dialog pattern for row actions

AppFlowy uses `showCancelAndDeleteDialog` (action.dart:106-122) when inserting rows while sorts are active. The dialog asks the user to remove sorting before inserting (because insertion position is meaningless with active sorts). This is a confirm-before-action pattern, similar to the fork's `confirmWithModal` for delete.

AppFlowy also uses `showConfirmDeletionDialog` (action.dart:135-140) for row deletion — a confirm-before-destructive-action pattern.

Both confirm patterns are Flutter dialogs (not native menus), making them mobile-safe by construction. This mirrors the fork's `ConfirmModal` which extends Obsidian's `Modal` (also mobile-safe).

[SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/row/action.dart:95-143]

### F5.5 — AppFlowy comparison summary for the fork

| Aspect | AppFlowy | Fork (Note Database) | Implication for feature |
|--------|---------|---------------------|------------------------|
| Record templates | None (database-structure templates only) | Yes (`RecordTemplate.ts`, 3 engines) | Fork is already ahead; feature enhances discoverability |
| New row button | Plain "New row" at grid footer | "New" at toolbar (already calls template path) | Fork's button already does more; gap is labeling |
| Row menu actions | insertAbove, insertBelow, duplicate, delete | insertAbove, insertBelow, duplicate, delete, record-icon | Same base set; fork adds record-icon toggle |
| Pre-fill mechanism | `CreateRowPayloadPB.data` (HashMap) | `createEntry(defaults)` + `CreateEntryPlan` (source rules) | Fork's system is richer (source rules + template frontmatter) |
| Confirm pattern | `showCancelAndDeleteDialog` (Flutter) | `confirmWithModal` (Obsidian Modal) | Both mobile-safe; fork can reuse existing pattern |
| Template selection UI | None | Per-database config in ViewConfigPanel | No multi-template picker in either; single template is the norm |

**Key takeaway**: AppFlowy provides no precedent for a "New from template" button because it lacks record-level templates entirely. The fork's existing template system is more advanced. The feature should focus on discoverability (labeling the existing template-aware create path) rather than adding new template infrastructure.

[SOURCE: cross-reference of all above findings]

## What Was Tried
- Searched AppFlowy Rust code for template files — found `template.rs` but it's database-structure templates, not record templates.
- Searched Flutter UI for "add row" / "create row" — found `GridAddRowButton` (plain new row) and `RowActionMenu` (insert/duplicate/delete).
- Read pre-fill cell tests — confirmed AppFlowy pre-fills via payload HashMap, not user-facing templates.
- Compared confirm patterns — both AppFlowy and fork use mobile-safe dialog/modal confirms.

## What Failed
- Expected AppFlowy to have a template-picker UI — it does not. Record-level templates are not an AppFlowy feature.

## Novelty Justification
Moderate newInfoRatio (0.55): Confirmed AppFlowy has no record-level template concept, which means the fork is already ahead. This validates the "discoverability wrapper" approach rather than "new template infrastructure." The pre-fill payload pattern is a useful cross-reference but doesn't change the design.

---

# Iteration 006: Anytype Reference Mining

**Focus**: How does Anytype implement template-based object creation in its TS codebase?

## Findings

### F6.1 — Anytype has a full multi-template system with template picker UI

Anytype implements a rich template system where each object type can have multiple templates. The key components:

**gRPC commands** (command.ts):
- `ObjectCreate(details, flags, templateId, typeKey, spaceId)` (line 1118) — creates an object from a specific template ID
- `ObjectApplyTemplate(contextId, templateId)` (line 1528) — applies a template to an existing object
- `TemplateCreateFromObject(contextId)` (line 1658) — creates a new template from an existing object

**Template picker menu** (`menu/dataview/template/list.tsx`):
- `MenuTemplateList` (line 7) subscribes to templates filtered by `type.uniqueKey == 'template'` AND `targetObjectType == typeId` (lines 71-74)
- Renders a grid of template preview cards (`PreviewObject` components, line 203)
- Includes a "new template" item (`J.Constant.templateId.new`, line 106) when templates are allowed
- Each template has a context menu (`dataviewTemplateContext`, line 129) for duplicate/set-default
- `getTemplateId()` (line 87) reads `view.defaultTemplateId` or falls back to `data.templateId`
- Empty state: `EmptySearch` with `translate('blockDataviewNoTemplates')` (line 272)

**New object menu** (`menu/dataview/new.tsx`):
- `MenuNew` (line 5) shows a "New" menu with type selection and template selection
- Template item: `{ id: 'template', name: translate('menuDataviewNewTemplate'), arrow: true, caption: templateName }` (line 40)
- Hovering the template item opens `dataviewTemplateList` submenu (line 145)
- `onSetDefault` callback persists the chosen template as the view's default (line 147)
- Type change updates `data.templateId = type.defaultTemplateId` (line 130)

[SOURCE: context/anytype-ts/src/ts/lib/api/command.ts:1118-1126,1528-1533,1658-1664]
[SOURCE: context/anytype-ts/src/ts/component/menu/dataview/template/list.tsx:7-278]
[SOURCE: context/anytype-ts/src/ts/component/menu/dataview/new.tsx:5-160]

### F6.2 — Anytype's dataview config carries defaultTemplateId

The dataview block interface (`interface/block/dataview.ts`) includes:
- `defaultTemplateId: string` (line 254) — the view's default template
- `getTemplateId?(): string` (line 194) — accessor for the current template
- `onTemplateAdd?: () => void` (line 199) — callback to add a new template
- `onTemplateMenu?: (e: any, dur: number) => void` (line 205) — callback to open the template menu

This means each dataview view can have its own default template, and the UI provides both "new from default template" and "new from specific template" flows.

[SOURCE: context/anytype-ts/src/ts/interface/block/dataview.ts:194-205,254]

### F6.3 — Anytype's dataview controls wire template creation

`block/dataview/controls.tsx` (5 matches for template-related terms) wires the template menu into the dataview toolbar. The dataview component (`block/dataview.tsx`, 14 matches) provides `onTemplateAdd` and `onTemplateMenu` handlers at lines 458-462, 696, 743-748, 773-776, 786.

The pattern is:
1. Toolbar has a "New" button
2. Clicking "New" opens `MenuNew` (the new-object menu)
3. `MenuNew` has a "Template" submenu item with an arrow
4. Hovering "Template" opens `MenuTemplateList` (the template picker grid)
5. Selecting a template calls `ObjectCreate` with that `templateId`
6. Setting a template as default persists `defaultTemplateId` on the view

[SOURCE: context/anytype-ts/src/ts/component/block/dataview/controls.tsx:28-29,253-255,760]
[SOURCE: context/anytype-ts/src/ts/component/block/dataview.tsx:458-462,696,743-748]

### F6.4 — Anytype comparison summary for the fork

| Aspect | Anytype | Fork (Note Database) | Implication for feature |
|--------|---------|---------------------|------------------------|
| Template storage | Templates are objects in the space, filtered by `type.uniqueKey == 'template'` | Single template file path in `DatabaseConfig.newRecordTemplate` | Fork uses file-path-based single template; Anytype uses object-based multi-template |
| Template picker | Grid of preview cards (`MenuTemplateList`) | None (config in ViewConfigPanel) | Fork could add a simple picker if multi-template were desired, but that's out of scope |
| Default template | `view.defaultTemplateId` per view | `database.newRecordTemplate` per database | Fork's granularity is coarser (database-level, not view-level) |
| Create flow | `ObjectCreate(details, flags, templateId, typeKey, spaceId)` via gRPC | `createBlankEntry` → `loadNewRecordTemplate` → `planCreateEntry` → `dataSource.createNote` | Both pass template ID into the create path |
| New menu | `MenuNew` with type + template submenus | Single "New" button on toolbar | Fork's "New" already applies the configured template; gap is discoverability |
| Template creation | `TemplateCreateFromObject(contextId)` | Manual file creation + config in ViewConfigPanel | Fork's template creation is simpler (just pick a file) |

**Key takeaway**: Anytype's multi-template picker is a richer UX, but it requires a fundamentally different data model (templates as queryable objects vs. a single file path). The fork's single-template-per-database model is simpler and sufficient for the spec's scope. The feature should NOT try to replicate Anytype's multi-template picker — that would exceed the "1-3 call-site edits" budget and require a config schema change.

However, Anytype's pattern of showing the template name in the "New" menu (line 40: `caption: templateName`) is directly applicable: the fork's "New" button should show "New from template" (or include the template name in the tooltip) when a template is configured.

[SOURCE: cross-reference of all above findings]

### F6.5 — Anytype's empty-template-set behavior

When no templates exist, `MenuTemplateList` shows `EmptySearch` with `translate('blockDataviewNoTemplates')` (list.tsx:272). The "new template" item (`J.Constant.templateId.new`) is only added when `U.Object.isAllowedTemplate(typeId)` returns true (line 105).

For the fork, the equivalent empty-template-set behavior is already handled: `loadNewRecordTemplate` returns `undefined` when `!setting?.path` (DatabaseView.ts:3674-3675), and `createBlankEntry` proceeds without template frontmatter/body. The create still works — it just creates a blank note. This is the correct behavior per the spec: "Behavior is whatever CreateEntryPlan.ts already does for an empty template set."

[SOURCE: context/anytype-ts/src/ts/component/menu/dataview/template/list.tsx:105-107,272]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:3673-3679]

## What Was Tried
- Searched Anytype TS codebase for template-related files — found 104 files, narrowed to dataview template system.
- Read `MenuTemplateList` (template picker grid) and `MenuNew` (new-object menu with template submenu).
- Traced gRPC commands: `ObjectCreate` with `templateId`, `ObjectApplyTemplate`, `TemplateCreateFromObject`.
- Compared Anytype's multi-template model with the fork's single-template model.

## What Failed
- Nothing failed this iteration.

## Novelty Justification
Moderate newInfoRatio (0.60): Discovered Anytype's full multi-template picker system, which is richer than the fork's single-template model. Confirmed that replicating it would exceed scope, but the "show template name in New menu" pattern is directly applicable. The empty-template-set behavior cross-reference validates the fork's existing handling.

---

# Iteration 007: Notion Button Behavior via Web

**Focus**: What is Notion's button/new-from-template behavior and UX?

## Findings

### F7.1 — Notion's "New" button is a split-button with a dropdown arrow

Notion's database toolbar has a blue "New" button at the top-right. The button has a **dropdown arrow on its right side** — clicking the arrow opens a dropdown menu listing all database templates. Clicking the "New" button itself creates a page using the **default template** (or a blank page if no default is set).

This is a **split-button** pattern: the main button does the default action, and the arrow opens a template picker. This is the key UX pattern the fork should emulate — but adapted to the fork's single-template model.

[SOURCE: https://www.notion.com/help/database-templates — "click the dropdown arrow next to New at the top right of your database"]
[SOURCE: https://thomasjfrank.com/notion-databases-the-ultimate-beginners-guide/ — "click the arrow next to the blue New button in your database's top-right corner, then selecting a template"]

### F7.2 — Notion supports multiple templates per database, with a default

Notion allows unlimited database templates. Each database has its own template set (templates are scoped to the database, not shared across databases). Users can:
1. Create templates via "+ New template" in the dropdown
2. Set a template as default via "••• → Set as default"
3. Choose whether the default applies to "all views" or "only on current view"
4. When anyone clicks "New", the default template is automatically applied

The fork's single-template-per-database model is simpler. The spec explicitly scopes out a multi-template picker. The feature should:
- Label the button "New from template" when a template IS configured (making the template application visible)
- Keep the button as "New" when NO template is configured (matching current behavior)

[SOURCE: https://www.notion.com/help/database-templates — "Set as default, then choose whether the default should only apply to the current view, or the entire database"]
[SOURCE: https://www.notion.com/releases/2022-08-11 — "Set a default template for databases"]

### F7.3 — Notion's template creation is inline, not a separate config panel

Notion creates templates directly from the "New" dropdown: click the arrow → "+ New template" → edit the template page inline. Templates are pages within the database, not external files.

The fork's model is different: templates are external vault notes, configured via `MarkdownFileSuggestModal` in `ViewConfigPanelRenderer`. This is a fundamental architectural difference — the fork stores templates as vault files (consistent with Obsidian's file-based model), while Notion stores them as database-internal pages.

**Implication**: The fork should NOT try to replicate Notion's inline template creation. The template configuration stays in `ViewConfigPanelRenderer` (out of scope for this feature). The feature only adds the "New from template" control that calls the existing create path.

[SOURCE: https://www.notion.com/help/database-templates — "To create a template inside a database, click the dropdown arrow next to New... select + New template"]

### F7.4 — Notion's repeating templates are explicitly OUT of scope

Notion supports "repeating database templates" that auto-create entries on a schedule (daily, weekly, monthly, yearly). This is the scheduler/cron functionality that the spec explicitly excludes (REQ-005, Out of Scope: "Scheduler, cron, or any time-triggered create").

The fork's duplicate-row already covers recurrence. The "New from template" control must NOT add any scheduling functionality.

[SOURCE: https://www.notion.com/help/database-templates — "Repeating database templates automatically create a copy of a template in your database however often you would like"]
[SOURCE: spec.md REQ-005, Out of Scope]

### F7.5 — Notion's "New" button on mobile

Notion's help docs mention "Open the dropdown next to + or New (depending on your screen size)" — indicating the button adapts to screen size. On smaller screens, it may show as "+" with the dropdown, while on larger screens it shows "New" with the dropdown arrow.

For the fork, the toolbar already handles phone layout (`isPhoneLayout()` at ToolbarRenderer.ts:285-287). The "New from template" control should follow the same responsive pattern — the label may be hidden on phone layout, showing only the icon.

[SOURCE: https://www.notion.com/help/database-templates — "Open the dropdown next to + or New (depending on your screen size)"]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:285-287]

### F7.6 — Recommended UX for the fork: adaptive label, not a split-button

Given the fork's single-template model, a full split-button (like Notion's) is overkill — there's only one template to choose from. The recommended UX is:

1. **When a template IS configured**: Label the button "New from template" with a `file-plus-2` icon. Tooltip shows the template path. This makes the template application discoverable.
2. **When NO template is configured**: Keep the current "New" label with `plus` icon. No change from current behavior.
3. **Optional confirm**: If `confirmNewFromTemplate` is enabled, show `confirmWithModal` before creating. This gives the user a chance to see which template will be applied.
4. **Row menu**: Add "New from template" as a menu item (with the same adaptive label) in the row menu's create section.

This is simpler than Notion's split-button but achieves the same discoverability goal: the user knows their template will be applied.

[SOURCE: synthesis of Notion behavior + fork architecture]

## What Was Tried
- Fetched Notion's official help page on database templates.
- Cross-referenced with Thomas Frank's guide and the 2022-08-11 release notes.
- Identified the split-button pattern, default template behavior, and repeating templates.
- Mapped Notion's multi-template model to the fork's single-template model.

## What Failed
- Nothing failed this iteration.

## Novelty Justification
Moderate newInfoRatio (0.55): Confirmed Notion's split-button UX and default-template behavior. The key insight is that the fork's single-template model doesn't need a split-button — an adaptive label is sufficient. Repeating templates are confirmed out of scope.

---

# Iteration 008: Edge Cases Analysis

**Focus**: Edge cases — zero templates, template load failure, concurrent clicks, empty template set, chart view, read-only mode.

## Findings

### F8.1 — Zero templates (no template configured): create still works, blank note

When `database.newRecordTemplate` is undefined or `!setting?.path`, `loadNewRecordTemplate` (DatabaseView.ts:3673-3679) returns `undefined`:
```typescript
const setting = database.newRecordTemplate;
if (!setting?.path) return undefined;
```

`createBlankEntry` (line 3536-3538) handles this: `template` is `undefined`, so `template?.frontmatter` is `undefined`, and `buildCreateEntryPlan` receives `{}` as `templateFrontmatter`. The create proceeds with only column defaults + source rules — a blank note.

**Feature behavior**: The "New from template" control should show "New" (not "New from template") when no template is configured. The `hasRecordTemplate()` function in the isolated module returns `false`, and `getNewFromTemplateLabel()` returns `t("toolbar.new")`. Clicking still works — it creates a blank note via the existing path. No crash, no error.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:3673-3679,3536-3558]

### F8.2 — Template load failure: Notice shown, create aborted

If the template file is missing or unreadable, `loadNewRecordTemplate` throws:
- Missing file: `throw new Error(t("template.missing"))` (line 3677)
- Read error: caught by the `try/catch` at line 3539-3542

The catch block shows `new Notice(t("template.loadFailed", { error: String(error) }))` and returns `null` — the create is aborted, no note is written.

**Feature behavior**: The "New from template" control calls the same `actions.createEntry()` path, so this error handling is inherited. The control itself does NOT need additional error handling — the existing path surfaces the failure via `Notice`. The optional `ConfirmModal` runs BEFORE the create, so a template load failure happens after confirmation, not before. This is acceptable — the user confirmed, the create attempted, and the failure is surfaced.

**Potential improvement (out of scope)**: Pre-check template existence before showing the confirm modal. But this would add an async vault read before the modal, complicating the click handler. The spec says "follow the existing path, not invent a new empty-state product" — so the existing error handling is correct.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:3536-3542,3677]

### F8.3 — Concurrent clicks: no explicit serialization, but guard prevents overlay-triggered creates

The fork does NOT serialize concurrent creates explicitly. Two rapid clicks on "New" would call `createBlankEntry` twice, potentially creating two notes. However:

1. **Overlay guard**: `guardedCreateEntry` (line 845-850) checks `this.suppressNextCreate || this.hasActiveOverlay()`. A mousedown listener (line 552-554) sets `suppressNextCreate = true` if an overlay is active. This prevents creates triggered by overlay interactions, but NOT two rapid clicks on the toolbar button.

2. **Calendar/timeline dedup**: `pendingCalendarTimelineCreates` (line 468) is a `Set<string>` that deduplicates calendar creates by a composite key (line 3714-3715). But this only applies to calendar/timeline, not toolbar/row-menu creates.

3. **`pendingNewFilePath`** (line 461) tracks the most recent created file path for scroll/focus — it doesn't prevent concurrent creates.

**Feature behavior**: The spec says "Two rapid clicks: follow whatever the existing create path does for concurrent creates (UNKNOWN if it serializes). Do not add a new queue or cron." The feature must NOT add debouncing or queuing. The optional `ConfirmModal` provides a natural friction point — the user must confirm before each create, which reduces accidental double-clicks. If confirm is disabled, the existing behavior (potential double-create) is accepted.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:845-850,552-554,461,468,3714-3715]
[SOURCE: spec.md §8 Concurrent Operations]

### F8.4 — Chart view: "New" button is hidden

`renderNewButton` is called inside `if (!actions.isReadOnly && !isChartView)` guards (ToolbarRenderer.ts:236,282). The "New from template" control inherits this — it's only rendered when `!isReadOnly && !isChartView`. The isolated module's `shouldShowNewFromTemplate()` function encodes this: `return !isReadOnly && viewType !== "chart"`.

**Feature behavior**: No change needed — the existing guards already hide the button in chart views and read-only mode.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:236,282]

### F8.5 — Read-only mode: button hidden

When `actions.isReadOnly` is true (e.g., during setup when `needsSetup` is true, DatabaseView.ts:1903), `renderNewButton` is not called. The "New from template" control inherits this guard.

For the row menu, `RowMenu.show` (RowMenu.ts:54) wraps all create/edit actions in `if (!this.actions.isReadOnly)`. The "New from template" menu item should be inside this same guard.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:236,282]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:54]

### F8.6 — Calendar/timeline view: row menu create items are hidden

`RowMenu.show` (RowMenu.ts:58) guards the insert-above/below items with `viewType !== "calendar" && viewType !== "timeline"`. The "New from template" menu item should follow the same guard — it doesn't make sense to "insert from template" in a calendar/timeline context where creates are date-driven.

However, the toolbar "New from template" button IS shown for calendar/timeline views (the `!isChartView` guard at line 282 allows calendar/timeline). In calendar/timeline, clicking "New" calls `guardedCalendarCreate` (line 1902) which calls `createCalendarAwareCreateEntry` — this applies the template via `createBlankEntry` with date defaults.

**Feature behavior**: Toolbar button works for all non-chart views. Row menu item is hidden for calendar/timeline (matching insert-above/below guard).

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:58]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:282]
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:1902]

### F8.7 — Confirm modal cancelled: zero writes

`confirmWithModal` returns `false` on cancel (ConfirmModal.ts:40: `onclick = () => this.finish(false)`, and `onClose` calls `finish(false)` at line 58). The `executeNewFromTemplate` function (or the inline confirm check in the call site) checks the return value and returns early if `false` — no `createEntry()` call, no write.

This satisfies REQ-004: "cancel performs no write" and NFR-R01: "Cancelled confirm writes nothing."

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/modals/ConfirmModal.ts:40,58]
[SOURCE: spec.md REQ-004, NFR-R01]

## What Was Tried
- Traced `loadNewRecordTemplate` for zero-template and load-failure cases.
- Examined `guardedCreateEntry` overlay guard and `pendingCalendarTimelineCreates` dedup.
- Verified chart-view and read-only guards on `renderNewButton`.
- Checked calendar/timeline guard on row menu create items.
- Confirmed confirm-modal cancel path returns false → no write.

## What Failed
- Nothing failed this iteration.

## Novelty Justification
Low-moderate newInfoRatio (0.45): Most edge cases are already handled by the existing create path. The feature inherits this handling. The key new insight is that the confirm modal provides natural double-click friction, and the row-menu item should follow the calendar/timeline guard.

---

# Iteration 009: Mobile + iCloud Safety

**Focus**: Mobile-safe APIs, iCloud safety (no churny write loops), and MIT-forkable constraints.

## Findings

### F9.1 — ConfirmModal is mobile-safe (extends Obsidian Modal, no desktop-only APIs)

`ConfirmModal` (ConfirmModal.ts:13-67) extends Obsidian's `Modal` class. The entire `src/views/modals/` directory contains NO desktop-only APIs (no `isMobile`, `Platform`, `electron`, `require()`, or native `Menu` references — confirmed via grep). Obsidian's `Modal` is the standard overlay component that works on both desktop and mobile platforms.

The modal uses only:
- `this.contentEl.createEl/createDiv` — standard DOM API
- `this.modalEl.isShown()` / `this.close()` — standard Modal API
- `super.open()` — standard Modal opening

**Conclusion**: The optional confirm-before-create flow is mobile-safe by construction. No desktop-only APIs are introduced.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/modals/ConfirmModal.ts:13-67]
[SOURCE: grep of src/views/modals/ for desktop-only patterns — 0 matches]

### F9.2 — RowMenu uses setUseNativeMenu(false) — mobile-safe HTML menu

`RowMenu.show` (RowMenu.ts:45) creates `new Menu().setUseNativeMenu(false)`. The `setUseNativeMenu(false)` call forces Obsidian to render the menu as an HTML overlay rather than a native OS menu. Native menus are desktop-only (they use Electron's native menu API); HTML menus work on mobile.

The "New from template" menu item added to `RowMenu` inherits this mobile-safety — it's rendered as an HTML menu item, not a native menu item.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/RowMenu.ts:45]

### F9.3 — Toolbar "New" button uses standard DOM — mobile-safe

`renderNewButton` (ToolbarRenderer.ts:1683-1691) uses `toolbar.createEl("button", ...)` — standard DOM API. No `Menu`, no native context menu, no Electron APIs. The button is mobile-safe.

The toolbar already handles phone layout via `isPhoneLayout()` (ToolbarRenderer.ts:285-287, checking `window.activeDocument.body.classList.contains("is-phone")`). On phone layout, the toolbar renders differently (search moves to left, some buttons are hidden). The "New from template" button is rendered in both layouts (lines 236 and 282) — it's not hidden on phone.

**Feature behavior**: The "New from template" label may be too long for phone layout. The existing "New" button shows both icon and text. On phone, the text could be shortened to just the icon (matching how other toolbar buttons behave on phone). This is a UI refinement, not a mobile-safety issue.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/ToolbarRenderer.ts:1683-1691,285-287,236,282]

### F9.4 — iCloud safety: one create write per confirmed click

The create path writes exactly one note per call:
1. `createBlankEntry` → `dataSource.createNote(plan.folder, plan.filename, plan.frontmatter, ..., template?.body || "")` (DatabaseView.ts:3561-3567) — one `createNote` call
2. For templater engine: `runTemplaterOnCreatedFile(file)` (line 3569-3573) — this may modify the file, but it's one file, one operation
3. `refreshAfterSave()` (line 3626) — refreshes the view, no extra writes
4. If `registeredGroupOption` is true (group option auto-registration): `dataSource.updateViewDefFile(dbFile, entry.config, ...)` (line 3598) — this is a config update, not a note create. It happens only when a new group option is auto-registered, which is existing behavior.

**No churny write loops**: The create path does NOT:
- Poll or retry
- Write metadata sidecar files
- Rewrite the database config on every create (only when group options are auto-registered)
- Trigger cascading writes

**Feature behavior**: The "New from template" control calls the same `actions.createEntry()` path. The optional `ConfirmModal` runs before the create — it's a UI overlay, no writes. Cancel = zero writes. Confirm = one create write (same as current behavior). iCloud safety is preserved.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:3561-3627]
[SOURCE: spec.md NFR-R03: "iCloud-safe: one create write per confirmed click; no churny metadata rewrites"]

### F9.5 — No telemetry, no secrets, no network — MIT-forkable

The feature introduces:
- One new `src/data/` module (`TemplateToolbarAction.ts`) — pure functions, no network, no telemetry
- Edits to `ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts` — all UI/DOM code, no network
- New i18n keys — string data, no code
- Reuse of `confirmWithModal` — local modal, no network

No `fetch()`, no `XMLHttpRequest`, no `require("electron")`, no telemetry calls, no secret handling. The feature is MIT-forkable.

[SOURCE: spec.md NFR-S01: "No telemetry, no secrets, no network button payloads. MIT-forkable."]

### F9.6 — No scheduler/cron/network-button code

The feature does NOT introduce:
- `setInterval` / `setTimeout` for scheduling (the confirm modal uses Promise, not timers)
- Cron expressions or recurrence fields
- Mail/webhook/Slack/notification handlers
- Any import of network APIs

This satisfies REQ-003 ("No cron/scheduler. No mail/webhook/Slack/notifications") and SC-004 ("The shipped tree contains no scheduler, no network-button handlers, and no recurrence UI on this control").

[SOURCE: spec.md REQ-003, SC-004]

## What Was Tried
- Grep'd `src/views/modals/` for desktop-only API patterns — zero matches.
- Verified `RowMenu` uses `setUseNativeMenu(false)` for mobile-safe HTML menus.
- Traced the create path for write count — exactly one `createNote` per call.
- Confirmed no network/telemetry/scheduler code in the proposed feature.

## What Failed
- Nothing failed this iteration.

## Novelty Justification
Low newInfoRatio (0.35): Confirmed mobile and iCloud safety through negative evidence (no desktop-only APIs, no churny writes, no network code). The feature inherits safety from the existing patterns. The key insight is that `setUseNativeMenu(false)` and `Modal` are the mobile-safe foundations already in use.

---

# Iteration 010: Cross-Reference Synthesis Prep

**Focus**: Final verification of i18n keys, imports, and call-site count before synthesis.

## Findings

### F10.1 — confirmWithModal is already imported in DatabaseView.ts

`DatabaseView.ts` line 96: `import { confirmWithModal } from "./modals/ConfirmModal";`

This means the DatabaseView.ts edit for the confirm callback does NOT need a new import — `confirmWithModal` is already available. This reduces the diff further.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts:96]

### F10.2 — common.create i18n key exists in all 3 locales

| Key | en | zh-CN | zh-TW |
|-----|-----|-------|-------|
| `common.create` | "Create" | "创建" | "建立" |
| `common.cancel` | "Cancel" | "取消" | "取消" |

The confirm modal's `confirmText: t("common.create")` will work without new i18n keys for the button label. Only the title and message need new keys (`toolbar.newFromTemplate`, `toolbar.confirmNewFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate`).

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/i18n.ts:134,1461,2959,9,1464,2913]

### F10.3 — Final call-site edit count: 3 files + 1 new module + i18n

**Files touched** (within the 1-3 call-site budget):

| # | File | Change | Lines |
|---|------|--------|-------|
| 1 | `src/data/TemplateToolbarAction.ts` | **NEW** | ~50 lines |
| 2 | `src/views/ToolbarRenderer.ts` | Modify `renderNewButton` + `ToolbarActions` interface + import | ~15 lines changed |
| 3 | `src/views/RowMenu.ts` | Add menu item + `RowMenuActions` interface + imports | ~20 lines added |
| 4 | `src/views/DatabaseView.ts` | Add `confirmCreate` + `confirmNewFromTemplate` to toolbar actions + `getDatabaseConfig` + `confirmNewFromTemplate` to row menu actions | ~6 lines added |
| 5 | `src/i18n.ts` | Add 4 keys × 3 locales | ~12 lines added |

**Call-site count**: 3 code call sites (ToolbarRenderer, RowMenu, DatabaseView) + 1 new module + 1 i18n data file. The spec's "1-3 call-site edits" budget refers to code logic call sites — 3 is within budget. The i18n file is a data file, not a call site.

**Rebase-friendly**: Each edit is isolated and additive:
- New module: entirely new file, no conflicts on rebase
- ToolbarRenderer: method signature change is additive (optional param), call-site updates are one-token additions
- RowMenu: new menu items are additions, no existing lines changed
- DatabaseView: new fields in actions objects are additions
- i18n: new keys are additions at the end of each locale block

[SOURCE: synthesis of iterations 1-9]

### F10.4 — Ranked findings summary for synthesis

**Tier 1 — Core architecture (highest impact)**:
1. F1.1: The existing "New" button ALREADY calls the full template path — the feature is a discoverability wrapper, not a new create engine.
2. F2.2: The isolated module (`TemplateToolbarAction.ts`) provides pure decision functions (label, visibility, confirm-needed) — it does NOT call the create path directly.
3. F3.2 + F4.3: The 3 call-site edits are precisely defined with line-level detail.

**Tier 2 — UX design (high impact)**:
4. F7.6: Recommended UX is adaptive label ("New from template" when configured, "New" when not), not a split-button (the fork's single-template model doesn't need it).
5. F7.1: Notion uses a split-button with dropdown — this is the reference, but the fork's adaptation is simpler.
6. F6.1: Anytype's multi-template picker is richer but requires a different data model — out of scope.

**Tier 3 — Safety and edge cases (medium impact)**:
7. F9.1: ConfirmModal is mobile-safe (extends Modal, no desktop-only APIs).
8. F9.4: One create write per confirmed click — iCloud-safe.
9. F8.1: Zero templates → create still works (blank note), no crash.
10. F8.3: Concurrent clicks → no new debouncing (follow existing path per spec).

**Tier 4 — Reference cross-references (contextual)**:
11. F5.1-F5.3: AppFlowy has no record-level templates; pre-fills via payload HashMap.
12. F6.1-F6.5: Anytype has full multi-template system with `ObjectCreate(templateId)`.
13. F7.3: Notion's inline template creation is architecturally different (templates as DB-internal pages vs. vault files).

[SOURCE: synthesis of all 10 iterations]

### F10.5 — Open questions resolved

All 10 key questions from the strategy are now resolved:

| Q | Status | Resolution |
|---|--------|-----------|
| Q1 | Resolved | F1.1, F1.5: Existing button already calls template path; gap is labeling + row-menu + optional confirm |
| Q2 | Resolved | F7.6: Adaptive label, not split-button (single-template model) |
| Q3 | Resolved | F2.2: Pure decision functions + optional confirm orchestration via callback injection |
| Q4 | Resolved | F3.2, F4.3, F10.3: 3 call sites (ToolbarRenderer, RowMenu, DatabaseView) |
| Q5 | Resolved | F4.4, F9.1: ConfirmModal is mobile-safe, already imported in DatabaseView |
| Q6 | Resolved | F8.1-F8.7: All edge cases handled by existing path or inherited guards |
| Q7 | Resolved | F5.1-F5.5: AppFlowy has no record templates; pre-fill via payload |
| Q8 | Resolved | F6.1-F6.5: Anytype has multi-template picker with ObjectCreate(templateId) |
| Q9 | Resolved | F7.1-F7.6: Notion split-button, default template, repeating templates out of scope |
| Q10 | Resolved | F9.1-F9.6: Mobile-safe (Modal, setUseNativeMenu(false)), iCloud-safe (one write), MIT-forkable |

## What Was Tried
- Verified `confirmWithModal` is already imported in DatabaseView.ts — reduces diff.
- Confirmed `common.create` exists in all 3 locales — no new i18n keys needed for confirm button.
- Tallied final call-site count: 3 code files + 1 new module + 1 i18n file.
- Ranked all findings by impact tier for synthesis.
- Verified all 10 key questions are resolved.

## What Failed
- Nothing failed this iteration.

## Novelty Justification
Low newInfoRatio (0.25): This is a synthesis-prep iteration — no new evidence gathered, only verification and ranking. The `confirmWithModal` already-imported discovery is a minor optimization that reduces the diff.

---
