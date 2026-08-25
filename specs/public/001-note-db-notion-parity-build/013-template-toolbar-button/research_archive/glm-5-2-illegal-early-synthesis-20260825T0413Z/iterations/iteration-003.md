# Iteration 003 — Edge Cases + Final Algorithm & Module Spec

> Focus: Q6 (edge cases), Q7 (finalize — mobile safety, `skipTemplate` decision, final algorithm)
> newInfoRatio: 0.55 (edge-case behavior confirmed from source; algorithm consolidates prior findings)

## Summary

Edge cases resolve cleanly because the existing create path already handles them — the feature must only avoid introducing new failure modes. `Menu` with `setUseNativeMenu(false)` is mobile-safe (proven by `RowMenu`). Concurrent-click suppression already exists via `suppressNextCreate`/`hasActiveOverlay`. iCloud safety is preserved because the feature calls the existing single-create path once per click. The final algorithm is a 3-step flow: resolve context → show dropdown (display-only) → delegate to existing `createBlankEntry`.

## Findings

### F11 — Edge case: zero/empty template set (Q6) ✅

- **No template configured** (`database.newRecordTemplate === undefined`): `loadNewRecordTemplate` returns `undefined` (line 3675: `if (!setting?.path) return undefined`), so `createBlankEntry` proceeds with `template = undefined` → blank create. [SOURCE: src/views/DatabaseView.ts:3673-3680]
- **Feature behavior when no template**: the dropdown should show only "New" (no template items, no "New with [template]"). `resolveTemplateToolbarContext` returns `hasTemplate: false`. The split-button caret is hidden or disabled. The main "New" button still works (blank create). **No crash, no new empty-state product** — matches spec §8: "follow the existing path, not invent a new empty-state product."
- **Template file deleted** (path configured but file gone): `loadNewRecordTemplate` throws `t("template.missing")` → `createBlankEntry` catches it (line 3539-3541), shows `Notice(t("template.loadFailed", {error}))`, returns `null`. No write. [SOURCE: src/views/DatabaseView.ts:3537-3542, src/data/RecordTemplate.ts via i18n `template.missing`]
- **Feature behavior for deleted template**: the dropdown shows the configured path (stale) but clicking "New with [template]" surfaces the existing `Notice` error. The feature does NOT pre-validate the file (that would add a vault read per render — iCloud churn risk). The existing error path is the correct surface.

### F12 — Edge case: concurrent / rapid clicks (Q6) ✅

- `guardedCreateEntry` (line 845) already checks `suppressNextCreate || hasActiveOverlay()`: if an overlay is open or a suppress flag is set, it closes overlays and returns without creating. [SOURCE: src/views/DatabaseView.ts:845-850]
- `pendingNewFilePath` (line 3579) tracks the most recent create; `pendingNewRecords` (line 3584) holds created files for 8 seconds to avoid reload races. [SOURCE: src/views/DatabaseView.ts:3579-3588]
- **Feature behavior**: the dropdown `Menu` is itself an overlay. Opening it sets `hasActiveOverlay()` true (the menu DOM matches the overlay selector list at lines 830-841 — `.menu` is included at line 870). So clicking a menu item fires `onClick` → menu closes → `createEntry` runs. A second rapid click while the menu is open is suppressed. **No new debounce/queue needed** — the existing guard handles it. Matches spec §8: "Do not add a new queue or cron."

### F13 — Edge case: iCloud churn (Q6) ✅

- The existing `createBlankEntry` performs **one** `dataSource.createNote` per call (line 3561). No retry loops, no sidecar files, no metadata rewrites beyond the single create + optional config save (only when `registeredGroupOption` is true, line 3593). [SOURCE: src/views/DatabaseView.ts:3561-3627]
- **Feature behavior**: the feature calls `createEntry()` once per confirmed click → one `createNote` → one new note. No polling, no cron, no extra vault walks (NFR-P01). The dropdown menu is display-only (no writes until a menu item is clicked). **iCloud-safe by construction** — the feature adds zero writes beyond the existing path.

### F14 — Edge case: mobile safety (Q6) ✅

- `Menu` from `obsidian` with `setUseNativeMenu(false)` is the mobile-safe menu pattern — already used by `RowMenu` (line 45: `new Menu().setUseNativeMenu(false)`). [SOURCE: src/views/RowMenu.ts:45, src/views/DatabaseView.ts:870 (`.menu` in overlay selectors)]
- `ConfirmModal` extends `Modal` (mobile-safe — Obsidian `Modal` works on iOS/iPadOS). [SOURCE: src/views/modals/ConfirmModal.ts:13-21]
- `renderNewButton` uses `toolbar.createEl("button")` — standard DOM, no desktop-only APIs. [SOURCE: src/views/ToolbarRenderer.ts:1684-1690]
- **Feature behavior**: the split-button caret uses `Menu` (same as RowMenu); the optional confirm uses `ConfirmModal`. **No desktop-only APIs introduced.** NFR-R02 satisfied.

### F15 — `skipTemplate` decision (Q7 final) — RECOMMEND DEFERRAL

The "New (no template)" option (iter 2, F10) requires a `skipTemplate` param on `createBlankEntry`. Analysis:

- **For**: Notion parity (Notion's "New" without picking a template creates blank even when templates exist). Lets users create a non-templated row without removing the template config.
- **Against**: The fork's model is *one* configured template that auto-applies. "New (no template)" is a secondary affordance. The spec (REQ-001) asks for "New from template", not "New without template". Adding `skipTemplate` is a (minimal) change to the existing create path signature.
- **Recommendation**: **Defer `skipTemplate` to a follow-up.** Ship the dropdown with: (1) "New with [template name]" → `createEntry()` (template auto-applied), (2) "Configure template…" → opens `ViewConfigPanelRenderer` template setting. This satisfies REQ-001 (visible New-from-template control calling the existing path) with **2 call sites** and zero changes to `createBlankEntry`'s signature. "New (no template)" can be added later as a 2-line enhancement if the user wants it.

This keeps the diff strictly to: 1 new `src/data/` module + 2 call-site edits (toolbar + row-menu) + wiring in `DatabaseView` action objects (counts as part of the toolbar/row-menu wiring, not a separate call site). **Total: 1 new file + 2 modified files** — the cleanest possible EuroFormat-shaped diff.

### F16 — Final algorithm (Q7 final)

```
MODULE: src/data/TemplateToolbarAction.ts (pure functions, EuroFormat shape)

resolveTemplateToolbarContext(database):
  templateConfig = database.newRecordTemplate
  hasTemplate = templateConfig?.path is non-empty string
  templateLabel = hasTemplate ? basename(templateConfig.path) : i18n("common.notSet")
  return { templateConfig, hasTemplate, templateLabel }

buildTemplateMenuItems(ctx, i18n):
  if !ctx.hasTemplate:
    return []  // dropdown hidden; main "New" button does blank create
  return [
    { id: "new-with-template", label: i18n.newWithTemplate(ctx.templateLabel),
      icon: "file-plus-2", withTemplate: true },
    { id: "configure-template", label: i18n.configureTemplate,
      icon: "settings-2", withTemplate: false, openConfig: true },
  ]

CALL SITE 1 — ToolbarRenderer.renderNewButton (line 1683):
  if actions.getTemplateContext?.()?.hasTemplate:
    render split button:
      main: button.db-new-button (existing) → actions.createEntry()
      caret: button.db-new-button-caret (new, ~24px) → open Menu
        menu items from buildTemplateMenuItems
        "new-with-template" onClick → actions.createEntry()  // template auto-applied
        "configure-template" onClick → actions.openTemplateConfig?.()
  else:
    render existing renderNewButton (unchanged)

CALL SITE 2 — RowMenu.show (after line 74, inside !isReadOnly && createEntry exists):
  ctx = actions.getTemplateContext?.()
  if ctx?.hasTemplate:
    menu.addItem("New from template", icon "file-plus-2",
      onClick → actions.createEntry?.())  // template auto-applied via existing path

WIRING — DatabaseView action objects (lines 563, 595, 603, 634, 662):
  add to each toolbar/row-menu action object:
    getTemplateContext: () => resolveTemplateToolbarContext(this.getCurrentEntry()?.config)
    openTemplateConfig: () => this.openViewConfigPanel?.()  // or existing config-opening method

OPTIONAL CONFIRM (REQ-004):
  wrap "new-with-template" onClick:
    const ok = await confirmWithModal(this.app, {
      title: t("template.label"),
      message: t("template.confirmCreate", { name: ctx.templateLabel }),
      confirmText: t("toolbar.new"),
    })
    if (!ok) return  // no write
    actions.createEntry()
```

**i18n keys to add** (3 new keys × 3 locales en/zh-CN/zh-TW already in i18n.ts):
- `toolbar.newFromTemplate`: "New from template" / "从模板新建" / "從範本新增"
- `toolbar.newWithTemplate`: "New with {name}" / "用 {name} 新建" / "用 {name} 新增"
- `toolbar.configureTemplate`: "Configure template…" / "配置模板…" / "設定範本…"
- `template.confirmCreate`: "Create a new record using template \"{name}\"?" / "使用模板「{name}」新建记录？" / "使用範本「{name}」新增記錄？"

### F17 — Diff shape verification (SC-003)

| Artifact | Count | Files |
|----------|-------|-------|
| New `src/data/` module | 1 | `TemplateToolbarAction.ts` |
| Call-site edits | 2 | `ToolbarRenderer.ts`, `RowMenu.ts` |
| Wiring (action objects) | 1 (part of call-site) | `DatabaseView.ts` |
| i18n keys | 4 new keys | `i18n.ts` (additive, no existing keys changed) |
| **Total new files** | **1** | ✅ EuroFormat shape |
| **Total modified files** | **3** (toolbar, row-menu, DatabaseView) + i18n | ✅ within 1-3 call-site budget |

`git rebase` onto upstream: the new module is additive; `ToolbarRenderer`/`RowMenu`/`DatabaseView` edits are small, localized additions (no rewrites of formula/rollup/view/filter code). **Rebase-friendly.** SC-003 + SC-004 satisfied.

## Questions Answered

- **Q6 ✅**: Empty/zero templates → dropdown hidden, main "New" does blank create (existing path). Deleted template → existing `Notice` error, no write. Concurrent clicks → existing `suppressNextCreate`/`hasActiveOverlay` guard (`.menu` is an overlay). iCloud → one `createNote` per click, zero extra writes. Mobile → `Menu` + `ConfirmModal` are mobile-safe.
- **Q7 ✅ (final)**: Module = `TemplateToolbarAction.ts` (pure functions). Call sites = 2 (toolbar split-button + row-menu item) + wiring. `skipTemplate` deferred. Optional confirm via existing `confirmWithModal`. 4 new i18n keys. Diff = 1 new file + 3 modified + i18n.

## Ruled-Out Directions

- `skipTemplate` param on `createBlankEntry` — deferred to follow-up (not spec-mandated; keeps create-path signature untouched).
- Pre-validating template file existence on render — would add vault reads per render (iCloud churn); existing error path is correct.
- New debounce/queue for concurrent clicks — existing `suppressNextCreate` guard handles it.
- Multi-template picker — exceeds scope (iter 2).

## Convergence Assessment

All 7 key questions now have evidence-backed answers. Source diversity: fork (7 files) + AppFlowy (2 files) + Anytype (4 files) + Notion (2 URLs) = 4 source classes. No single source dominates. The remaining research surface (multi-template picker, repeating templates, database buttons) is explicitly out of scope. newInfoRatio is declining (1.0 → 0.85 → 0.55). Recommend STOP after this iteration.
