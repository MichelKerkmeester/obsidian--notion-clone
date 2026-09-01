# Synthesis: Toolbar New-From-Template Button
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict

**Build it.** The create-with-defaults path already exists; the gap is a discoverability wrapper, not a second engine. `renderNewButton` already calls `actions.createEntry()` with no args (`src/views/ToolbarRenderer.ts:1683-1691`), which reaches `createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` / `planCreateEntry` (`src/views/DatabaseView.ts:845-850, 3528-3538, 3673-3679`). Headline: ship an adaptive **New from template** label plus a row-menu twin, via one EuroFormat-style module and three call sites, reusing `confirmWithModal`. Biggest risk: expanding into Notion’s split-button / multi-template picker. `NewRecordTemplateConfig` is a single `{ path, engine }` (`src/data/types.ts:154-157, 279`); a picker needs a schema change and blows the 1–3 call-site budget.

## Ranked backlog

1. **Adaptive toolbar New-from-template control** — Notion’s blue **New** applies the default template (arrow opens the picker); the fork’s **New** already applies `database.newRecordTemplate` but is labeled only `"New"` (`src/i18n.ts:177`). Feasibility: **clear**. Files: new `src/data/TemplateToolbarAction.ts`; `src/views/ToolbarRenderer.ts` (`renderNewButton` `:1683-1691`, invocations `:236` and `:282`, `ToolbarActions.createEntry` `:81`); `src/i18n.ts` (new keys); `src/views/DatabaseView.ts` (actions object around `:1902`). Effort: **S**. Depends: none. Citation: `src/views/ToolbarRenderer.ts:1683-1691` and https://www.notion.com/help/database-templates (“click the dropdown arrow next to New”).

2. **Row-menu New-from-template item** — Notion exposes templates from the New control; `RowMenu.show` has Open / Insert above / Insert below / icon / Duplicate / Delete and no template action (`src/views/RowMenu.ts:36-120`). Distinct host from the toolbar (`src/views/DatabaseView.ts:555-567`). Feasibility: **clear**. Files: `src/views/RowMenu.ts` (item after the insert separator `:75`; add `getDatabaseConfig` on `RowMenuActions`); `src/views/DatabaseView.ts` (`getDatabaseConfig: () => this.getActiveDb()`). Effort: **S**. Depends: item 1 (same module + i18n). Citation: `src/views/RowMenu.ts:36-120`.

3. **Optional confirm-before-create (REQ-004)** — Notion does not confirm; this is vault-safety, not parity. `ConfirmModal` exists, is `Modal`-based, cancel/`onClose` resolve `false` (`src/views/modals/ConfirmModal.ts:40, 56-58, 69-71`). `confirmWithModal` is already imported in `DatabaseView.ts:96`. Feasibility: **clear**. Files: `src/views/DatabaseView.ts` (inject `confirmCreate` / `confirmNewFromTemplate` on toolbar + row-menu actions); `src/views/RowMenu.ts` (reuse existing `confirmWithModal` import `:6`). Effort: **S**. Depends: items 1–2. Citation: `src/views/modals/ConfirmModal.ts:40,58` (NFR-R01: cancel writes nothing).

4. **Phone-density label** — Notion switches `+` vs **New** by screen size (same help page). Fork already uses `isPhoneLayout()` (`src/views/ToolbarRenderer.ts:285-287`) and still renders the New button on phone (`:236`, `:282`). “New from template” may overflow. Feasibility: **likely**. Files: `src/views/ToolbarRenderer.ts` only (icon-only or shortened label when `isPhoneLayout()`; keep `aria-label` / `title` as the full string). Effort: **S**. Depends: item 1. Citation: `src/views/ToolbarRenderer.ts:285-287` and https://www.notion.com/help/database-templates (“dropdown next to + or New (depending on your screen size)”).

5. **Template-path tooltip (Anytype caption analog)** — Anytype’s New menu shows `caption: templateName` (`context/anytype-ts/src/ts/component/menu/dataview/new.tsx:40`). Fork config stores a vault path, not an object name. Feasibility: **clear**. Files: `TemplateToolbarAction.getNewFromTemplateTooltip` + `toolbar.newFromTemplateTooltip` in `src/i18n.ts`. Effort: **S**. Depends: item 1 (same module). Citation: `context/anytype-ts/src/ts/component/menu/dataview/new.tsx:40`.

6. **Notion split-button + template dropdown** — True Notion UX: main click = default template; arrow lists templates, “+ New template”, set-default per view or database (https://www.notion.com/help/database-templates; https://www.notion.com/releases/2022-08-11). Feasibility: **hard**. Files would include toolbar chrome plus a new menu host — more than three call sites — and still a one-item list until the schema changes. Effort: **L**. Depends: item 8. Citation: https://www.notion.com/help/database-templates. **Do not build in this phase.**

7. **Inline “+ New template” from the New control** — Notion templates are database-internal pages created from that dropdown. Fork templates are vault files chosen in `ViewConfigPanelRenderer.renderNewRecordTemplateSetting` (`src/views/ViewConfigPanelRenderer.ts:420-477`). Feasibility: **hard** (different storage model). Files: config panel is out of this phase’s 1–3 budget. Effort: **M**. Depends: none, and out of spec. Citation: `src/views/ViewConfigPanelRenderer.ts:420-477` and https://www.notion.com/help/database-templates. **Do not build.**

8. **Multi-template / per-view default (`defaultTemplateId`)** — Anytype: `view.defaultTemplateId`, `ObjectCreate(..., templateId, ...)` (`context/anytype-ts/src/ts/interface/block/dataview.ts:254`; `context/anytype-ts/src/ts/lib/api/command.ts:1118-1126`; picker `context/anytype-ts/src/ts/component/menu/dataview/template/list.tsx:7-278`). Fork: one `newRecordTemplate` on `DatabaseConfig` (`src/data/types.ts:154-157, 279`). Feasibility: **blocked** (schema + queryable template objects). Effort: **L**. Depends: none; exceeds isolated-diff contract. Citation: `src/data/types.ts:154-157`. **Do not build.**

9. **Repeating / scheduled templates and network buttons** — Notion repeating templates (https://www.notion.com/help/database-templates). Spec OUT: REQ-003, REQ-005, SC-004. Recurrence stays on duplicate-row. Feasibility: **blocked**. Files: none. Effort: n/a. Depends: n/a. Citation: spec.md REQ-005 / https://www.notion.com/help/database-templates. **Do not build.**

10. **AppFlowy-style payload pre-fill as a new engine** — AppFlowy has no record templates: `GridAddRowButton` dispatches plain `GridEvent.createRow()` (`context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/footer/grid_footer.dart:13-42`); `template.rs` is database-structure presets; cell pre-fill is `CreateRowPayloadPB.data`. Fork already outruns this via file templates + `CreateEntryPlan`. Feasibility: **blocked** as a feature (would duplicate existing defaults). Effort: n/a. Citation: `context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/footer/grid_footer.dart:13-42`. **Do not build.**

## Recommended build (locked design)

**Core algorithm.** Do not reimplement create. The module decides; the view layer still calls the live create callback.

1. `hasRecordTemplate(config)` → `!!config.newRecordTemplate?.path` (`src/data/types.ts:154-157, 279`).
2. Label / tooltip / icon: if true → `t("toolbar.newFromTemplate")`, tooltip with `{path}`, icon `file-plus-2`; else → existing `t("toolbar.new")` (`src/i18n.ts:177`) and icon `plus`.
3. Visibility: inherit current guards — `!isReadOnly && !isChartView` on the toolbar (`src/views/ToolbarRenderer.ts:236, 282`); row-menu item inside `!isReadOnly` and the same `viewType !== "calendar" && viewType !== "timeline"` guard as insert above/below (`src/views/RowMenu.ts:54-58`).
4. `executeNewFromTemplate({ config, confirmEnabled, confirm, createEntry })`: if `confirmEnabled && hasRecordTemplate(config)`, `await confirm()`; on falsy, **return** (no write); else `createEntry()`.
5. `createEntry` remains the existing callback: toolbar `guardedCalendarCreate` (`src/views/DatabaseView.ts:1902, 852-856`) → `createCalendarAwareCreateEntry` / `createBlankEntry`; row menu `guardedCreateEntry` (`:563, 845-850`). Both load the template inside `createBlankEntry` (`:3536-3538, 3673-3679`). Core engine resolves `{{title}}` / `{{date}}` / `{{time}}` via `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`); templater runs post-create (`src/views/DatabaseView.ts:3568-3573`). Zero templates: `loadNewRecordTemplate` returns `undefined` (`:3674-3675`) and create still writes a blank note.

**Why the module does not call `CreateEntryPlan` itself.** Spec/plan wording (“wrapper that calls the existing path”) is satisfied by owning the confirm-then-delegate algorithm, not by importing views. `createBlankEntry` is a private `DatabaseView` method (`src/views/DatabaseView.ts:3528`). EuroFormat forbids `src/views/` imports (`src/data/EuroFormat.ts:1-42`). `src/data/` may import `../i18n` (existing pattern). Inject `confirm` (`confirmWithModal`) and `createEntry` from the hosts.

**Module:** `src/data/TemplateToolbarAction.ts`  
Exports: `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, `shouldShowNewFromTemplate`, `shouldConfirmNewFromTemplate`, `executeNewFromTemplate`. Pure decision + injected side effects. No `obsidian` `Menu`, no network, no timers.

**Call sites (exactly three code hosts; i18n is data, not a call site):**

1. `src/views/ToolbarRenderer.ts` — import the module; extend `ToolbarActions` with `confirmNewFromTemplate?: boolean` and `confirmCreate?: () => Promise<boolean>`; change `renderNewButton` to take optional `DatabaseConfig` (`currentDb` is already in `render()`); pass `currentDb` at `:236` and `:282`; onclick → `executeNewFromTemplate` then existing `actions.createEntry()`. `ToolbarRenderer` has no `App`; it must not call `confirmWithModal` directly.
2. `src/views/RowMenu.ts` — import the module + `DatabaseConfig`; add `getDatabaseConfig?: () => DatabaseConfig | undefined` and `confirmNewFromTemplate?: boolean`; after the insert separator (`:75`) add the item; onclick → `executeNewFromTemplate` with local `confirmWithModal(this.actions.app, …)` already imported (`:6`), then `this.actions.createEntry?.()`.
3. `src/views/DatabaseView.ts` — RowMenu ctor (`:555-567`): `getDatabaseConfig: () => this.getActiveDb()`, `confirmNewFromTemplate: true`. Toolbar actions (`:1902` region): `confirmNewFromTemplate: true`, `confirmCreate: () => confirmWithModal(this.app, { title, message with path, confirmText: t("common.create") })`. No new import: `confirmWithModal` is `:96`. `t("common.create")` already exists in all three locales (`src/i18n.ts:134` and locale peers).

**i18n (not a 4th call site):** `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate`, `toolbar.confirmNewFromTemplate` × en / zh-CN / zh-TW.

Do not touch `RecordTemplate.ts`, `CreateEntryPlan.ts`, formula engines, or `ViewConfigPanelRenderer.ts`.

## Edge cases & mobile/iCloud safety

| Case | Required behavior | Why it is already safe |
|---|---|---|
| No template / empty path | Control stays visible; label stays **New**; click still creates | `loadNewRecordTemplate` returns `undefined` (`src/views/DatabaseView.ts:3674-3675`); `createBlankEntry` plans with `{}` template frontmatter (`:3536-3558`). Spec: follow existing empty-set path. |
| Missing / unreadable template file | After confirm, create aborts; `Notice`; no note | Throw `t("template.missing")` (`:3677`); catch shows `t("template.loadFailed")` and `return null` (`:3539-3542`). Do not add a pre-click vault read (NFR-P01). |
| Confirm cancel / modal close | Zero writes | `finish(false)` on cancel and `onClose` (`src/views/modals/ConfirmModal.ts:40, 56-58`). |
| Chart view | Control hidden | Same `!isChartView` guards (`src/views/ToolbarRenderer.ts:236, 282`). |
| Read-only / setup | Control hidden | `actions.isReadOnly` (`:236, 282`); row menu wraps edits in `!isReadOnly` (`src/views/RowMenu.ts:54`). |
| Calendar / timeline | Toolbar New still shown; row-menu item hidden | Toolbar uses `!isChartView` only (`:282`); toolbar create is `guardedCalendarCreate` (`src/views/DatabaseView.ts:1902`). Row insert is already excluded (`src/views/RowMenu.ts:58`); template item must use that guard (date-driven creates, not insert-from-row). |
| Two rapid clicks | No new debounce / queue / cron | Overlay guard only (`src/views/DatabaseView.ts:845-850, 552-554`). Calendar has `pendingCalendarTimelineCreates`; toolbar/row-menu does not. Confirm is the only extra friction. Spec §8: inherit existing concurrent behavior. |
| `{{date}}` / `{{title}}` | Unchanged | Core: `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`); templater: `runTemplaterOnCreatedFile` (`src/views/DatabaseView.ts:3568-3573`). |

**Mobile.** `ConfirmModal` extends Obsidian `Modal` (DOM + `modalEl.isShown` / `close` only) — `src/views/modals/ConfirmModal.ts:13-67`. `RowMenu` uses `new Menu().setUseNativeMenu(false)` (`src/views/RowMenu.ts:45`) — HTML overlay, not Electron native menu. Toolbar New is `toolbar.createEl("button")` (`src/views/ToolbarRenderer.ts:1683-1691`). No `Platform` / `electron` / native `Menu` on this path.

**iCloud.** One `dataSource.createNote(...)` per confirmed click (`src/views/DatabaseView.ts:3561-3567`). Confirm is display-only. Cancel = no write. Templater may rewrite that same file once (`:3568-3573`). `updateViewDefFile` only if group-option auto-registration (`:3598` region) — pre-existing, not introduced here. No poll, sidecar, retry writer, or config rewrite on every create (NFR-R03).

**MIT / local-only.** No `fetch`, telemetry, secrets, `setInterval` scheduler, or mail/webhook/Slack handlers (REQ-003, NFR-S01, SC-004).

This phase is **not** display-only: a confirmed click writes one vault note, the same write the current **New** button already performs. The new UI (label, menu item, modal) is display-only until that existing create runs.

## Open questions / operator decisions

1. **Ship REQ-004 confirm now, or defer?** Recommended default: **ship enabled** (`confirmNewFromTemplate: true`). Modal is already mobile-safe and imported; cancel is a no-write; it is the only in-budget mitigation for unserialized double-clicks. Defer only if matching Notion’s one-click New matters more than accidental creates; record the deferral in `implementation-summary.md` as the spec requires.

2. **Adaptive label vs always “New from template”?** Recommended default: **adaptive** (template configured → “New from template” + `file-plus-2`; else keep “New” + `plus`). Matches the single-template model; avoids lying when no template is set. Spec still requires the control visible with zero templates.

3. **Phone: icon-only vs full label on first ship?** Recommended default: **full label + tooltip first** (REQ-001 / SC-001: labeled and reachable). Treat item 4 as follow-up if the phone toolbar overflows.

4. **Row-menu item when no template is configured?** Recommended default: **show it** with the same adaptive label, inside the existing create/read-only/calendar guards. Spec: zero-template control stays visible; do not invent a new empty state.

5. **Tooltip contents: full vault path vs filename?** Recommended default: **full `newRecordTemplate.path`** (that is the config key; Anytype’s name caption has no equivalent). If paths are noisy, shorten later without a schema change.

6. **Split-button / multi-template / inline “+ New template” / repeating templates?** Recommended default: **no.** Locked out by single-file `NewRecordTemplateConfig`, the 1–3 call-site budget, ViewConfigPanel as the config surface, and REQ-005. Revisit only as a later packet with an explicit schema change.
