---
title: "Implementation Summary: Settings Sheet Visual Parity"
description: "The settings sheet stopped reading as a bordered form and started reading as Notion's own list: five cards, navigation rows with a leading icon and a trailing value, and no helper paragraph left on the sheet."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "001-settings-sheet-visual-parity implementation"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity"
    last_updated_at: "2026-09-11T02:45:00Z"
    last_updated_by: "292-loop-001-settings-sheet-visual-parity"
    recent_action: "CREATE landed: 5 cards, L1-L9 green, lane exit 0, gate 28/28"
    next_safe_action: "Dispatch the image judge, twice consecutively on this tree"
    blockers:
      - "The child does not close until the image judge passes twice on an unchanged tree (D1)"
      - "The operator's own device read is the last gate and no agent ticks it (D5)"
    key_files:
      - "src/views/view-config-panel-renderer.ts"
      - "src/views/folder-suggest-modal.ts"
      - "src/views/modals/settings-sub-sheet-modal.ts"
      - "styles.css"
      - "src/i18n.ts"
      - "tools/live/sheet-grammar.mjs"
      - "verification.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "292-loop-001-settings-sheet-visual-parity"
      parent_session_id: "001-settings-sheet-visual-parity-scaffold"
    completion_pct: 60
    open_questions:
      - "Done versus the shared close glyph on all eleven sheets: ADR-I; Frame targets 1 until taken"
      - "No dark Notion reference at any rung: OC-S2 would settle it"
    answered_questions:
      - "The dark card/canvas inversion was a token step, not a defect: the dark card now takes the next step of its own ladder"
      - "R09 (Computed sync) cannot follow R04/R06 into a click-to-open sub-sheet under this harness's stubbed Modal — stays inline"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 001-settings-sheet-visual-parity |
| **Completed** | 2026-09-11 (CREATE and SCREENSHOT; VERIFY's judge and operator gates remain open) |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The Settings sheet stopped reading as a settings **form** — bordered boxes with prose under
them — and started reading as Notion's own settings **list**: rows you tap, values on the right,
and nothing to read. Five cards now group the sheet's 23 rows (Name; Current database; Current
view; Display; a chevron-less terminal action), every navigation row carries a leading icon, a
right-hung grey value and a trailing chevron on one line, the bordered text inputs and the
three-line textarea are gone, and the ten prose runs that used to overflow 80 characters were
shortened rather than hidden.

### The navigation-row primitive

`renderNavRow()` and `renderActionRow()` sit beside the sheet's existing `renderSelect` and draw
the reference's one-line router — icon, label, value, chevron — reused by every row from Source
folder through Conditional color. Two rows needed pickers this plugin never had before: Source
folder and New note folder open a new `FolderSuggestModal` (no folder picker existed anywhere in
this codebase), and Source rules / New record template drill into a new
`SettingsSubSheetModal` (a generic `DbModal`-backed sheet reused by both).

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/view-config-panel-renderer.ts` | Modified | Five-card `render()`, `renderNavRow`/`renderActionRow`, per-row conversions (R01-R23), the source-rules and template sub-sheets |
| `src/views/folder-suggest-modal.ts` | Created | The vault-folder picker `Source folder`/`New note folder` open — did not exist before this child |
| `src/views/modals/settings-sub-sheet-modal.ts` | Created | Generic `DbModal` drill-in shell shared by the Source-rules and New-record-template sub-sheets |
| `src/views/modals/add-database-modal.ts` | Modified | Calls the new `renderDatabaseNameRow` before `renderDatabaseGlobals`, since Name left that method for its own card |
| `src/views/database-view.ts` | Modified | `onOpenProperties`/`onOpenFilters`/`onOpenSorts` wired to the existing `toggleHeaderPopover` |
| `src/i18n.ts` | Modified | Ten over-80-character keys shortened (English; zh/zh-TW were already under the floor); five new keys added |
| `styles.css` | Modified | Nav-row/action-row/chip/footer-card paint, the dark-card ladder step, the section-heading type, the labelled conditional-format add button |
| `tools/live/sheet-grammar.mjs` | Modified | Clauses L1-L9 plus the navigation-row anatomy reader, the theme-luminance probe and the empty-stack guard control |
| `tools/live/render-assertion-harness.ts` | Modified | The `view-config` fixture gained two status presets so R10/R23 render in the judged capture |
| `tools/screenshots/constructed-scenarios.mjs` | Modified | `src/i18n.ts` added to the `view-config` scenario's `sources`, so a copy-only change invalidates the capture |
| `tools/storybook/obsidian-stub.mjs` | Modified | Four missing icons added to the render-harness's icon allowlist, one call site swapped to an existing alias |
| `src/views/view-config-sheet-row-grammar.test.ts` | Modified | Two revert-proof pins updated for the intentional textarea deletion and the 16px inter-card gap |
| `tools/storybook/sheet-inventory.mjs`, `sheet-inventory.test.mjs` | Modified | The two new modal producers folded into the existing "settings" inventory row |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Write-first, one lane clause at a time: `tools/live/sheet-grammar.mjs` grew clauses L1-L9 first, each
run RED before its producer moved (recorded in `verification.md`'s RED/GREEN register), then the
producer, then GREEN on the same clause. The full lane (`node tools/live/sheet-grammar.mjs`) now
exits 0. `npm run screenshots` ran twice; the 20 real movers (both runs, identical pixel counts,
zero one-run jitter) are named in the css-lane release. `npx tsc --noEmit`, `npm run build`,
`npx vitest run` (1614 passed), `node tools/storybook/verify-placement.mjs` (418/420, 2 declared),
`node tools/live/touch-targets.mjs` (no ratchet up), `node tools/live/sheet-rebuild.mjs` (the
settings-sheet-chrome-survives-its-own-scroll surface passes) and `npm run gate` (28 green) all
read clean from the final tree.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| R09 (Computed sync) stays inline, icon but no chevron | The render-assertion bundle resolves `obsidian` to `tools/storybook/obsidian-stub.mjs`, whose `Modal` export throws on construction; the landed placement-button-ink lane clause also reads its segmented buttons directly off the main sheet. Following R04/R06 into a sub-sheet would either crash the first click under this harness or leave that guard permanently unmeasurable |
| R10 drops its inline default-preset dropdown | `StatusPresetManagerModal` (the modal both R10 and R23 open) already carries its own default-preset row, so the sheet-level dropdown was a second place to set the same thing, not a second capability |
| R07's cover picker has no separate "choose" button | The whole row is the tap target; a bare icon-only choose button would have been the sixth `icon-only-button` violator L4 exists to catch |
| Icons "folder", "filter", "sliders-horizontal" and "smile" needed the render-harness's icon allowlist extended | `tools/storybook/obsidian-stub.mjs`'s `setIcon` only draws a real `<svg>` for an allowlisted `REAL_ICONS` set, documented as "kept by measurement" — un-allowlisted ids silently degrade to a text placeholder, which the lane's `icon: Boolean(iconWrap && iconWrap.querySelector("svg"))` check would read as absent |
| Ten prose keys shortened in English only | zh and zh-TW were already under the 80-character floor L5 checks; touching them without a length violation to fix would be an unscoped edit |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `node tools/live/sheet-grammar.mjs` | PASS — exit 0, all L1-L9 green, L3 at 13/19 qualifying rows |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| `npx vitest run` | PASS — 1614/1614, 160/160 files |
| `npm run screenshots` (x2) | PASS — 480 entries each, 20 real movers, identical in both runs |
| `npm run screenshots:verify` | PASS — 0 stale |
| `node tools/storybook/verify-placement.mjs` | PASS — 418/420, 2 red for a declared reason |
| `node tools/live/touch-targets.mjs` | PASS — under-28px counts fell, no ratchet up |
| `node tools/live/sheet-rebuild.mjs` | PASS — settings-sheet-chrome-survives-its-own-scroll green |
| `node tools/live/evidence.mjs --check-all` | PASS — 16/16 artefacts fresh |
| `npm run gate` | PASS — 28 green, 0 red (css-lane released in the same commit) |
| `node tools/naming/scan-comments.mjs` | PASS |
| `node tools/naming/scan-failing-values.mjs` | PASS |
| Image judge (gate b) | Not yet run — the loop's next node |
| Operator device read (gate c) | Not ticked by this leg |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **R09 (Computed sync) has no chevron.** `spec.md` §13.3 lists one; the harness constraint above means it stays a value-only row rather than a drill-in, recorded in `verification.md`'s RED/GREEN register as a drift from the lane clause text, not from any numeric threshold.
2. **The judged capture is `capture: "viewport"` (804×1748), the same fixed-frame convention every other panel in this repository's manifest uses.** Only the Name and Current database cards sit above the fold in the single PNG the judge will open; Current view, Display and the footer action row are lane-verified but require scrolling to see.
3. **The per-view "Show record icon" switch and a duplicate view-level status-preset row are not in `spec.md` §13.3's 23-row table.** Both are live capability the DEFINE read did not enumerate; kept rather than silently dropped, flagged here rather than hidden.
<!-- /ANCHOR:limitations -->

---
