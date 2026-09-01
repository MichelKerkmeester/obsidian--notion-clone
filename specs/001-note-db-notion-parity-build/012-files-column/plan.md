---
title: "Implementation Plan: Files / Attachments Column"
description: "Implementation plan for the Files column phase: isolated FilesColumn module, CellRenderer render case, and vault-local verification."
trigger_phrases:
  - "files column"
  - "implementation plan"
  - "filescolumn module"
  - "cellrenderer"
  - "vault local"
  - "coverimage parser"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column"
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review findings to planning docs"
    next_safe_action: "Build phase 012 per plan.md and tasks.md (live fork: Obsidian Plugin/src)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Files / Attachments Column

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | note-database fork (MIT Obsidian plugin) |
| **Live fork root** | `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin` (`src/`) |
| **Storage** | Vault-local wikilink `string[]` (no Notion CDN) |
| **Testing** | `npx tsc --noEmit`, fork build, manual desktop + mobile pass, rebase dry-run |

### Overview
This plan builds the 13th column type (`"files"`) on the EuroFormat isolated-diff model: one new module `src/data/FilesColumn.ts` owns the algorithm (normalize, classify, resolve, cover adapter, chip cap); three named call sites register and dispatch it (`types.ts`, `ColumnTypes.ts`, `CellRenderer.ts`); insertion-only completeness companions satisfy `tsc` and the add-column UIs (`PropertyTypeIcon.ts`, `ColumnMenu.ts`, `CreatePropertyModal.ts`, `i18n.ts`, `PropertyTypeConflict.ts`). The existing `CoverImage` / `galleryImageField` pipeline is reused — no second cover parser, no CDN fetch, no upload UI. Effort **M**.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Fork column registry read (`types.ts:50`, `ColumnTypes.ts:108-138,172-177`).
- [ ] `CellRenderer.ts` render dispatch (`:185`), `normalizeCellValueForSave` (`:2476-2482`), `isEditableCellColumn` (`:300-304`), `startEdit` (`:435-524`), and the inline overlay (`:1484-1528`) read.
- [ ] `PropertyTypeIcon.ts:7-20,111,128-129` (`PROPERTY_TYPE_ICON_NAMES: Record<ColumnDef["type"], string>` + `PROPERTY_TYPE_ICON_DEFS` + fallback) read — tsc-forced companion.
- [ ] Add-column / change-type picker lists read (`ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`) — hardcoded, not `COLUMN_TYPE_LABELS()`.
- [ ] `i18n.ts:4361-4366,4386-4388` read — three dictionaries (en, zh-CN, zh-TW); `columnType.rollup` siblings at `en:1332`, `zh-CN:2804`.
- [ ] `EuroFormat.ts:1-42` isolated-module diff model confirmed; `CoverImage.ts` / `galleryImageField` pipeline read; `GalleryRenderer.ts:442-469` and `BoardRenderer.ts:656-661` cover call sites read.
- [ ] Scope limited to this phase; no sibling phase files touched.

### Definition of Done
- [ ] `src/data/FilesColumn.ts` implemented (normalize, `formatForEdit`/`parseEdit`, `classifyFileType`/`isImageTarget`, `resolveFileTarget`, `renderChips`, `FILE_CHIP_CAP`).
- [ ] `"files"` registered: union (`types.ts:50`), labels/`isColumnType`/`getDefaultCellValue`→`[]` (`ColumnTypes.ts`), `PROPERTY_TYPE_ICON_NAMES` with a name that resolves in `PROPERTY_TYPE_ICON_DEFS` (`PropertyTypeIcon.ts`), picker lists (`ColumnMenu.ts`, `CreatePropertyModal.ts`), i18n keys in three dictionaries (`i18n.ts`), `PropertyTypeConflict` `files→multitext`.
- [ ] `CellRenderer.ts:185` `case "files"` render + `:2476` `normalizeCellValueForSave` write gate + `:449-524` `startEdit` branch (`editText` with `formatForEdit`) wired.
- [ ] Cover guard at the two `renderCover` call sites: `GalleryRenderer.ts:442` and `BoardRenderer.ts:661` skip `image.external` when the cover column type is `"files"`; `<img>` `onerror` → `.is-empty` on both; auto-prefer in `DatabaseView.ts:9599-9602`.
- [ ] No Notion CDN fetch path anywhere in the new module; external skip is at the cover call sites, not only in an unused helper.
- [ ] `npx tsc --noEmit` and fork build pass; manual desktop + mobile pass recorded in `checklist.md`; rebase dry-run confirms insertion-only diff (`CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean).

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + insertion-only call-site edits, copying the `EuroFormat.ts` isolation rule: one new file owns the algorithm; rebase stays an insertion-only diff. Precedent: `src/data/EuroFormat.ts:1-42` imported once at `src/views/CellRenderer.ts:13` and used in two cases (`:196-203`).

### Locked design — module
**`src/data/FilesColumn.ts`** exports: `normalize` (array + trim + drop URLs + dedupe-by-target), `formatForEdit` / `parseEdit` (newline- or comma-separated `[[target]]` for the text editor), `classifyFileType` / `isImageTarget` (extension → Image | Document | …; delegate cover eligibility to `CoverImage.ts:13-16` — do not widen HEIC/TIFF/ICO), `resolveFileTarget` (`getFirstLinkpathDest` → `TFile | null`), `renderChips` (cap 5 + `+N`, tooltip all names, `internal-link` + `is-unresolved` when dest is null, click → `openLinkText` or no-op, optional `getResourcePath` thumbnail), and `FILE_CHIP_CAP` (= 5). No `resolveFilesColumnCover` — the cover guard is at the call sites (see below), not a dead helper inside the module.

### Locked design — call sites (REQ-007's three)
1. **`src/data/types.ts:50`** — add `"files"` to `ColumnDef["type"]`. `getColumnDisplayType` already returns `col.type` for non-computed columns (`ColumnDisplay.ts:14-26`), so display dispatch becomes `"files"` with no edit there.
2. **`src/data/ColumnTypes.ts:108-138,125-137,172-177`** — `files: t("columnType.files")` (or `filesColumnLabel()` if i18n deferred), `"files"` in `isColumnType`, `getDefaultCellValue` → `[]` (multi-select precedent).
3. **`src/views/CellRenderer.ts:185, 2476, 449-524`** — `case "files":` render via `FilesColumn.renderChips`; `normalizeCellValueForSave` is the **only** write gate for "no URLs in stored value" (REQ-002); `startEdit` branches `col.type === "files"` into existing `editText` with `FilesColumn.formatForEdit` (commit runs `parseEdit` → `normalize`). Without the `startEdit` branch, `safeString(currentValue)` turns a `string[]` into garbled text. Commit stays `saveValue` → `updateFrontmatter` → `processFrontMatter` (`CellRenderer.ts:2458-2470`; `DataSource.ts:296-301,314`).

### Must-include companions (insertion-only; iteration 9 was incomplete)
- **`src/views/PropertyTypeIcon.ts:7-20`** — add `files` to `PROPERTY_TYPE_ICON_NAMES: Record<ColumnDef["type"], string>` or **SC-001 fails** (tsc-forced). The icon name **must resolve in `PROPERTY_TYPE_ICON_DEFS`** — reuse `link` (`:111`) or add a small `file` def — or `getPropertyTypeIconDef` falls back to `letter-case` (`:128-129`).
- **`src/views/ColumnMenu.ts:261-264`** and **`src/views/modals/CreatePropertyModal.ts:26-30`** — add `"files"` to the advanced group / `PROPERTY_TYPES`, or **REQ-001 "can be added" fails** (these are hardcoded lists, not `COLUMN_TYPE_LABELS()`).
- **`src/i18n.ts`** — `columnType.files` keys in the **three dictionaries** (en, zh-CN, zh-TW — `LocaleCode` is `system | en | zh-CN | zh-TW` but only three dictionaries exist at `:4361-4366`). Place keys next to `columnType.rollup` (`en:1332`, `zh-CN:2804`, `zh-TW` rollup sibling). Missing keys render the raw key (`t()` `:4386-4388`).
- **`src/data/PropertyTypeConflict.ts:73-76`** — `files → multitext` (relation precedent) so Obsidian treats the array as a list property.

### Cover guard — at the call sites (not a second pipeline)
`resolveFilesColumnCover` inside `FilesColumn.ts` is dead without a call site: `GalleryRenderer.renderCover` (`:439-468`) and `BoardRenderer.renderCover` (`:656-661`) call `resolveCoverImage` directly. The guard is two one-liners at those call sites:
- **`src/views/GalleryRenderer.ts:442`** — after `resolveCoverImage`, if the cover column type is `"files"` and `image.external`, behave as `!image` (`.is-empty` placeholder `:443-447`).
- **`src/views/BoardRenderer.ts:661`** — same guard + `.is-empty` placeholder (`:662-665`).
- **`src/views/GalleryRenderer.ts:468`** and the board cover `<img>` — `onerror` → `.is-empty` (same degrade; the only cheap HEIC-on-desktop fix without widening `IMAGE_TARGET_RE`).
- **`src/views/DatabaseView.ts:9599-9602`** — `|| col.type === "files"` auto-prefer for `getDefaultGalleryImageField`.
- **`CoverImage.ts` stays untouched** (locked — the guard belongs at the call sites, not a second parser). Keep `IMAGE_TARGET_RE` conservative (`:13`); PDFs never match it, so they never become covers (spec §8).

### Optional (operator decision 9)
- Image thumbnails in table cells via `getResourcePath` + `isImageTarget` if they stay inside the module with existing chip CSS; if new CSS is needed, ship type-icon + filename chips (text chips satisfy REQ-005).

### Do not touch
`CoverImage.ts` (reuse `parseCoverImage` / `resolveCoverImage`), `FileFields.ts`, `FileFieldRenderer.ts` (keep `file.*` chips unchanged), `GalleryRenderer.ts` except the cover guard + `onerror`, `BoardRenderer.ts` except the cover guard + `onerror`, `ListRenderer.ts`, QueryEngine/Stringify, new write paths, new `Platform` detection.

### Algorithm
1. **Value.** Frontmatter `string[]` of vault wikilinks (`[[Sales.pdf]]`, `[[cover.png]]`). Bare strings; no stored `file_type`. Reject/strip URLs at normalize time. Adopt multi-select's `[]` empty default. Merge on edit = AppFlowy `apply_changeset`: remove by identity, insert only unseen targets, preserve order.
2. **Parse.** Same forms as `parseFileLinkValue`: `[[target|label]]`, markdown `[label](target)`, bare path; empty → skip; malformed → raw-text chip, never throw (`FileFieldRenderer.ts:124-141`). Dedupe by parsed target (`:111-122`).
3. **Resolve.** `app.metadataCache.getFirstLinkpathDest(target, row.file.path)` (`FileFields.ts:126-138`; `CoverImage.ts:22-26`). Null → unresolved chip. Open via `app.workspace.openLinkText` (SC-004). No `fetch`, no Notion CDN, no `adapter.exists`.
4. **Classify (render-time).** Extension → Image | Document | … via a small switch (AppFlowy `media_file_type_ext.dart:6-29`). Cover eligibility stays `IMAGE_TARGET_RE` = `png|jpe?g|gif|webp|svg|avif|bmp` (`CoverImage.ts:13`). PDFs never become covers.
5. **Table cell.** Empty `[]` → existing `db-empty-value` (`CellRenderer.ts:151-152`). Else FilesColumn paints chips: cap 5 + `+N`; unresolved class; optional image thumbnail via `getResourcePath`. Wrap uses existing `col.wrap` (`CellRenderer.ts:112`).
6. **Cover.** `galleryImageField` → `renderCover` → `resolveCoverImage` already walks arrays and parses `[[wikilink]]` (`GalleryRenderer.ts:182,439-469`; `CoverImage.ts:49-58`). The guard is at the two call sites: after `resolveCoverImage`, if the cover column type is `"files"` and `image.external`, treat as empty. Same pipeline serves `boardImageField` (`BoardRenderer.ts:584,661`). No ranking heuristic (Notion + AppFlowy = first image). `CoverImage.ts` stays untouched.
7. **Edit.** Desktop and mobile share the cell renderer; `startEdit` branches `col.type === "files"` into existing `editText` with `FilesColumn.formatForEdit` (serialize `string[]` ↔ newline/comma-separated `[[target]]`); commit runs `parseEdit` → `normalize` → `normalizeCellValueForSave`. Mobile chrome is `db-cell-edit-popover is-mobile is-inline-overlay` (`CellRenderer.ts:1484-1528`). One atomic frontmatter write per commit. Filter via existing `empty` / `notempty` (`types.ts:135`); AppFlowy media filter is a no-op.

### Data Flow
Value is authored as wikilinks → `normalizeCellValueForSave` strips URLs/dedupes at commit → the resolver maps targets to vault files at render time → the renderer draws chips/links and the cover adapter picks the first internal image. Nothing leaves the vault; iCloud-safe because this phase adds no churny writes (one `processFrontMatter` per save).

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read the fork's column registry (`types.ts:50`, `ColumnTypes.ts:108-138,172-177`) and `CellRenderer.ts:185,2476-2482,300-304,435-524,1484-1528` (render, save, `isEditableCellColumn`, `startEdit`, inline overlay).
- [ ] Read `PropertyTypeIcon.ts:7-20,111,128-129`, `ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`, `i18n.ts:4361-4366,4386-4388` (three dictionaries), `PropertyTypeConflict.ts:54-77`.
- [ ] Confirm the `EuroFormat.ts:1-42` isolated-module diff model, `src/data/` placement, and the `CoverImage.ts` / `galleryImageField` cover pipeline; read the cover call sites `GalleryRenderer.ts:442-469` and `BoardRenderer.ts:656-661`.

### Phase 2: Core Implementation (four code steps)
- [ ] **Step 1 — Module:** Create `src/data/FilesColumn.ts` (normalize, `formatForEdit`/`parseEdit`, `classifyFileType`/`isImageTarget`, `resolveFileTarget`, `renderChips`, `FILE_CHIP_CAP`). No `resolveFilesColumnCover` — the cover guard is at the call sites.
- [ ] **Step 2 — Registry + pickers + icon + i18n + conflict:** Register `"files"`: union (`types.ts:50`), labels/`isColumnType`/`getDefaultCellValue`→`[]` (`ColumnTypes.ts`), `PROPERTY_TYPE_ICON_NAMES` with a name resolving in `PROPERTY_TYPE_ICON_DEFS` (`PropertyTypeIcon.ts`), picker lists (`ColumnMenu.ts`, `CreatePropertyModal.ts`), i18n keys in three dictionaries (`i18n.ts`), `PropertyTypeConflict` `files→multitext`.
- [ ] **Step 3 — CellRenderer dispatch + save + edit:** `case "files"` render (`:185`) + `normalizeCellValueForSave` write gate (`:2476`) + `startEdit` branch into `editText` with `formatForEdit` (`:449-524`).
- [ ] **Step 4 — Cover wiring:** Guard at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661` (skip `image.external` when column type is `"files"`); `onerror` → `.is-empty` on both `<img>` elements; auto-prefer `|| col.type === "files"` (`DatabaseView.ts:9599-9602`). Do not edit `CoverImage.ts`.
- [ ] Keep the module vault-local: no `fetch`, no CDN, no `adapter.exists` per cell; external skip is at the cover call sites.

### Phase 3: Verification
- [ ] Run `npx tsc --noEmit` (must pass with `PROPERTY_TYPE_ICON_NAMES` entry) and the fork's documented build command.
- [ ] Rebase dry-run: confirm insertion-only diff (1 new module + call-site insertions).
- [ ] Manual desktop + mobile passes (gallery covers, Sales PDFs, dangling wikilink, 50+ files, HEIC); record evidence in `checklist.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Typecheck | New module + render case + `PROPERTY_TYPE_ICON_NAMES` entry | `npx tsc --noEmit` |
| Build | Whole fork | Fork's documented build command |
| Manual (desktop) | Gallery covers, Sales PDFs, dangling wikilink, 50+ files, HEIC `onerror`, inline-edit round-trip, cover guard (hand-edited URL), iCloud not-downloaded, network off | Obsidian dev vault |
| Manual (mobile) | Files column renders + inline-edits via `is-inline-overlay`; no desktop-only APIs | Obsidian dev vault (phone layout) |
| Vault-local grep | No CDN/fetch path; external skip is at the cover call sites | `grep` for `fetch`/`cdn`/`http` in the new module |
| Rebase dry-run | Diff shape | `git diff --stat` on the fork (expect 1 new module + insertion-only call sites; `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean) |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Column registry (`types.ts:50`, `ColumnTypes.ts:108-138,172-177`) | Internal fork | Green | New type cannot register |
| `PROPERTY_TYPE_ICON_NAMES` (`PropertyTypeIcon.ts:7-20`) | Internal fork | Green | `tsc` fails until `files` added (SC-001) |
| Add-column / change-type picker lists (`ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`) | Internal fork | Green | REQ-001 "can be added" fails |
| `CellRenderer.ts` dispatch (`:185`) + `normalizeCellValueForSave` (`:2476-2482`) | Internal fork | Green | Files cells render as fallback; URLs not stripped |
| `CoverImage.ts` / `galleryImageField` cover pipeline | Internal fork | Green | Covers cannot derive from the column |
| Obsidian vault API (`getFirstLinkpathDest`, `openLinkText`, `getResourcePath`) | Platform | Green | Files cannot resolve/open |
| Phase dependencies | Roadmap | Green | `depends_on: none` — build can start independently |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Typecheck/build failure, or a rebase conflict on upstream.
- **Procedure**: Delete `src/data/FilesColumn.ts` and revert the insertion-only call-site edits (`types.ts`, `ColumnTypes.ts`, `CellRenderer.ts`, `PropertyTypeIcon.ts`, `ColumnMenu.ts`, `CreatePropertyModal.ts`, `i18n.ts`, `PropertyTypeConflict.ts`, `GalleryRenderer.ts`, `BoardRenderer.ts`, `DatabaseView.ts`). The diff is small and fully reversible.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 15 minutes |
| Core Implementation | Medium | 120 minutes |
| Verification | Low | 45 minutes |
| **Total** | | **~3h (effort M)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] No Notion CDN fetch path present (grep for `fetch`/`cdn`/`http` in the new module); external skip is at the cover call sites (`GalleryRenderer.ts:442`, `BoardRenderer.ts:661`).
- [ ] Diff shape confirmed: 1 new module + insertion-only call-site edits; `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean.
- [ ] `PROPERTY_TYPE_ICON_NAMES` carries `files` with a name resolving in `PROPERTY_TYPE_ICON_DEFS` (else `tsc` fails or the dropdown shows a blank glyph).

### Rollback Procedure
1. Delete `src/data/FilesColumn.ts`.
2. Revert the insertion-only call-site edits (`types.ts`, `ColumnTypes.ts`, `CellRenderer.ts`, `PropertyTypeIcon.ts`, `ColumnMenu.ts`, `CreatePropertyModal.ts`, `i18n.ts`, `PropertyTypeConflict.ts`, `GalleryRenderer.ts`, `BoardRenderer.ts`, `DatabaseView.ts`).
3. Re-run typecheck and build.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: Stored values remain plain wikilink `string[]` with no migration; deleting the column removes them. Rollback = delete the module and revert the insertion-only call sites.

<!-- /ANCHOR:enhanced-rollback -->
