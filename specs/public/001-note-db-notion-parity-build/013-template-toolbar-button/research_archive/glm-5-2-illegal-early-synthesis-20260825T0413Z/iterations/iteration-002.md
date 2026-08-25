# Iteration 002 — Notion Parity + Isolated-Module Shape & Algorithm

> Focus: Q5 (Notion parity via WebFetch), Q7 (isolated-module shape, algorithm, precise call-site edits)
> newInfoRatio: 0.85 (Notion UX is net-new; module shape synthesizes prior findings)

## Summary

Notion's canonical UX is a **blue "New" button with a dropdown arrow** at the top-right of the database: click "New" = new page (uses the database's default template if one is set); click the dropdown arrow = template picker listing all database templates + "+ New template". This maps cleanly onto the fork: the existing `renderNewButton` is the "New" half; a new dropdown affordance is the "from template" half. The isolated module is a single `src/data/TemplateToolbarAction.ts` (EuroFormat shape) that resolves which template to apply and delegates to the existing `createBlankEntry` path — no second create engine.

## Findings

### F6 — Notion database template UX (Q5) ✅ RESOLVED

Notion's database template model (canonical, from help docs):

- **Blue "New" button with dropdown arrow** at top-right of database. [SOURCE: https://www.notion.com/help/database-templates — "click the dropdown arrow next to `New` at the top right of your database"]
- **Two interaction modes**:
  1. Click "New" → creates a new page. If a default template is set, it applies; otherwise blank. [SOURCE: same — "Create a new page in your database and choose any of the templates from the gray menu it contains"]
  2. Click the dropdown arrow → template picker menu listing all templates + "+ New template" entry. Selecting a template creates a page from that template. [SOURCE: same — "click the dropdown menu on the right of the blue `New` button ... Choose any template you've created to generate that type of page"]
- **Templates are per-database**, not workspace-global. [SOURCE: same FAQ — "they're only available in the specific database where you created them"]
- **Template = a page** with predefined properties + content (images, embeds, sub-pages). Properties like `Priority: P1` auto-fill. [SOURCE: same — "automatically puts `P1` in the Priority property"]
- **Repeating templates** (cron/scheduler) exist but are explicitly OUT of scope for this fork phase (spec REQ-003). [SOURCE: same — "Repeating database templates automatically create a copy"; spec.md §3 Out of Scope]
- **Database Buttons** (separate feature): a button *property* or page-button that runs action steps including "Add page to [database]" with optional template selection. The spec scopes this OUT (network/scheduler buttons excluded); only the "New from template" toolbar control is in scope. [SOURCE: https://www.notion.com/help/database-buttons, spec.md §2]

**Parity mapping for the fork**:
| Notion | Fork equivalent | Status |
|--------|-----------------|--------|
| Blue "New" button | `renderNewButton` (`toolbar.new`, `plus` icon) | EXISTS — auto-applies `database.newRecordTemplate` |
| Dropdown arrow next to "New" | (none) | **GAP — this is the feature** |
| Template picker menu | (none — fork has single `newRecordTemplate`, not a list) | **GAP — fork is single-template, Notion is multi-template** |
| "+ New template" in picker | `ViewConfigPanelRenderer.renderNewRecordTemplateSetting` (configures the one template path) | PARTIAL — config exists, not in-toolbar |
| Per-database templates | `database.newRecordTemplate` (single) | EXISTS but single-template |

**Critical parity insight**: The fork currently supports **one** `newRecordTemplate` per database. Notion supports **many** templates per database with a picker. The spec (REQ-001) asks for a "New from template" control that "calls the existing create-with-defaults path" — it does NOT ask for multi-template support. Therefore the minimal parity-correct feature is: **a dropdown on the "New" button that (a) shows the configured template name and (b) creates via the existing path**, NOT a full multi-template picker. A multi-template picker would be a larger scope expansion (changing `NewRecordTemplateConfig` from single to array), which the spec's "1-3 call-site" + "Effort S" constraints rule out.

### F7 — Recommended UX: split-button, not separate button (Q7)

Three UX options, ranked:

**Option A (RECOMMENDED — Notion parity, minimal scope): Split "New" button with dropdown.**
- Convert `renderNewButton` into a split button: main part = existing "New" (creates with configured template, unchanged); dropdown caret = small menu showing the configured template name (display-only) + "New (no template)" + "Configure template…".
- Call sites: **1** (modify `renderNewButton` only). Row-menu: add one "New from template" item = **1 more**. Total = **2 call sites**.
- No new create path. No config schema change. Rebase-friendly.

**Option B (Anytype parity, larger scope): Separate "template" button adjacent to "New".**
- Add a new `renderTemplateButton` next to `renderNewButton` (Anytype `controls.tsx:750-760` pattern) that opens a template picker.
- Requires multi-template support (array config) → schema change → exceeds 1-3 call-site + Effort S budget. **Ruled out by spec constraints.**

**Option C (labeling-only): Relabel existing "New" to "New from template" when a template is configured.**
- Zero new call sites. But fails Notion parity (no dropdown/picker) and adds no discoverability beyond a label. **Insufficient for REQ-001 "visible, mobile-safe control labeled for new-from-template".**

**Recommendation: Option A.** It achieves Notion parity for the single-template case, stays within 1-3 call sites, requires no schema change, and the dropdown makes the template discoverable.

### F8 — Isolated module shape (Q7) — `TemplateToolbarAction.ts`

New file: `src/data/TemplateToolbarAction.ts` (EuroFormat pattern — pure functions, no class state, rebase-friendly).

**Responsibility**: resolve the template context for a "New from template" click and delegate to the existing create path. Holds NO create logic, NO scheduler, NO HTTP.

**Exported API (proposed)**:
```typescript
export interface TemplateToolbarContext {
  /** The database's configured newRecordTemplate, or undefined if none. */
  templateConfig: NewRecordTemplateConfig | undefined;
  /** Whether a template is configured (for button visibility/label). */
  hasTemplate: boolean;
  /** Display label for the template (basename of path, or i18n "none"). */
  templateLabel: string;
}

export function resolveTemplateToolbarContext(
  database: DatabaseConfig
): TemplateToolbarContext;

/**
 * Returns the menu items for the "New" dropdown.
 * Display-only — does NOT create. The caller wires onClick to the existing create path.
 */
export interface TemplateMenuItem {
  id: string;
  label: string;
  icon: string;
  /** Whether this item creates with the template (true) or without (false). */
  withTemplate: boolean;
  /** Optional: open template config instead of creating. */
  openConfig?: boolean;
}

export function buildTemplateMenuItems(
  ctx: TemplateToolbarContext,
  i18n: { newWithTemplate: (name: string) => string; newBlank: string; configureTemplate: string; noTemplate: string }
): TemplateMenuItem[];
```

**Why this shape**:
- Mirrors `EuroFormat.ts`: pure functions, no Obsidian API imports (except types), testable in isolation. [SOURCE: src/data/EuroFormat.ts:1-42]
- The module **does not call `createBlankEntry`** — it only resolves *what to show* and *whether to use the template*. The actual create stays in `DatabaseView` (the existing call site). This keeps the create path singular (REQ-002) and the module rebase-safe.
- `TemplateMenuItem.withTemplate` lets the toolbar/row-menu decide: `true` → call existing `createEntry()` (template auto-applied); `false` → call existing `createEntry()` after temporarily suppressing the template (see edge cases, iter 3).

### F9 — Precise call-site edits (Q7)

**Call site 1 — Toolbar (`ToolbarRenderer.ts`)**:
- Modify `renderNewButton` (line 1683) to render a split button when `actions.getTemplateContext?.()` returns a context with `hasTemplate === true`. Main button = existing behavior (`actions.createEntry()`). Caret button = small dropdown using the existing `Menu` API (mobile-safe — `Menu` works on mobile, same as `RowMenu`).
- Add `getTemplateContext?(): TemplateToolbarContext` and `createEntryFromTemplate?(item: TemplateMenuItem): void` to `ToolbarActions` (line 81).
- Items from `buildTemplateMenuItems`. "New with [template]" → `actions.createEntry()` (template auto-applied). "New (no template)" → `actions.createEntryWithoutTemplate?.()`. "Configure template…" → `actions.openTemplateConfig?.()`.
- **Edit size**: ~30-40 lines in `renderNewButton` + 2-3 interface fields. Single file.

**Call site 2 — Row-menu (`RowMenu.ts`)**:
- Add one `menu.addItem` after the Insert Below item (line 74): "New from template" → `actions.createEntry?.()` (template auto-applied via existing path). Only show when `getTemplateContext?.()?.hasTemplate` is true.
- Add `getTemplateContext?(): TemplateToolbarContext` to `RowMenuActions` (line 8).
- **Edit size**: ~8-12 lines. Single file.

**Call site 3 (OPTIONAL) — `DatabaseView.ts`**:
- Wire `getTemplateContext: () => resolveTemplateToolbarContext(this.getCurrentEntry()?.config)` and `createEntryFromTemplate`/`openTemplateConfig` handlers to the toolbar/row-menu action objects (lines 563, 595, 603, 634, 662).
- "New (no template)" handler: needs a way to create without the configured template. **Option**: add an optional `skipTemplate?: boolean` param to `createBlankEntry` (one-line signature change + one `if` guard at line 3536-3538). This is a minimal, backward-compatible change to the existing path — NOT a second create engine.
- **Edit size**: ~15-20 lines across the action-binding sites + 2-3 lines in `createBlankEntry`.

**Total call sites: 2 required (toolbar + row-menu) + 1 wiring site (DatabaseView) = 3.** Within the 1-3 budget. The new module (`TemplateToolbarAction.ts`) is the "one new `src/data/` file".

### F10 — "New (no template)" — the one create-path consideration

The existing `createBlankEntry` always loads the configured template. To support "New (no template)" from the dropdown (Notion parity: clicking "New" without picking a template creates blank), the cleanest approach is a `skipTemplate?: boolean` parameter on `createBlankEntry`:

```typescript
// DatabaseView.ts:3528 — minimal, backward-compatible
private async createBlankEntry(
  defaults: Record<string, unknown> = {},
  position?: CreateEntryPosition,
  focusColumnKey?: string,
  skipTemplate?: boolean,  // NEW
): Promise<TFile | null> {
  // ...
  let template: ParsedRecordTemplate | undefined;
  if (!skipTemplate) {  // NEW guard
    try { template = await this.loadNewRecordTemplate(entry.config); }
    catch (error) { /* existing */ }
  }
  // ... rest unchanged
}
```

This is **2 lines changed** in the existing create path — not a second engine. It preserves REQ-002 (still calls `planCreateEntry` + `createNote`; template resolution still via `RecordTemplate.ts` when not skipped). If the spec prefers NOT to support "New (no template)", this change is unnecessary and call site 3 shrinks.

## Questions Answered

- **Q5 ✅**: Notion UX = blue "New" button + dropdown arrow → template picker. Per-database templates. Repeating templates & database buttons are OUT of scope. Fork parity = split-button with dropdown showing the configured template.
- **Q7 ✅ (partial)**: Module = `src/data/TemplateToolbarAction.ts` (pure functions, EuroFormat shape). Call sites = 2 required (toolbar `renderNewButton` + row-menu) + 1 wiring (DatabaseView) = 3 total. Optional `skipTemplate` param on `createBlankEntry` for "New (no template)".

## Ruled-Out Directions

- **Multi-template picker (Option B)**: exceeds 1-3 call-site + Effort S budget; requires `NewRecordTemplateConfig` schema change (single → array). Not spec-mandated.
- **Labeling-only (Option C)**: fails Notion parity + discoverability.
- **New create engine**: REQ-002 forbids; existing `createBlankEntry`/`planCreateEntry` is complete.
- **Repeating/scheduler templates**: spec OUT of scope (REQ-003).

## Next Focus

Iteration 3: Q6 (edge cases — empty template set, zero templates, concurrent clicks, iCloud churn, mobile) + finalize Q7 (confirm `skipTemplate` decision, mobile safety of `Menu` dropdown, final algorithm pseudocode for the module + call sites).
