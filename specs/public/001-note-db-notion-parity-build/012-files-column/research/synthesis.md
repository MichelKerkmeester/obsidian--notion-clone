# Synthesis: Files / Attachments Column
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict
Build it now. The fork already has vault-local wikilink resolution, a chip renderer, an array-aware CoverImage parser, and a gallery/board cover pipeline; the missing piece is a 13th column type plus one EuroFormat-style module that normalizes `string[]` wikilinks and adapts the existing cover path — which is exactly REQ-001–005 and plan effort **M**. Headline: ship `src/data/FilesColumn.ts`, register `"files"`, dispatch one `CellRenderer` case, and point `galleryImageField` at the new column; do not add a second cover parser, a CDN fetch, or upload UI. Single biggest risk: REQ-007’s “1 module + ≤3 call-site edits” under-counts the real add path — `PROPERTY_TYPE_ICON_NAMES` is a `Record<ColumnDef["type"], string>` that will fail `tsc` until it gains `files`, and the create/change-type UIs use **hardcoded type lists**, not `COLUMN_TYPE_LABELS()` (iteration 9’s “zero UI edits” claim does not hold at `ColumnMenu.ts:261-264`).

## Ranked backlog
1. **`FilesColumn.ts` value module (wikilink `string[]`, no URLs)** — Notion stores a workspace copy of each file; the fork must store vault wikilinks only (spec §2). Feasibility: **clear**. Files: create `src/data/FilesColumn.ts` (normalize = array + trim + drop URLs + dedupe-by-target; `classifyFileType`; `resolveFileTarget`; `resolveFilesColumnCover`; `FILE_CHIP_CAP`). Effort: **M**. Depends on: none. Citation: `src/data/EuroFormat.ts:30-41`.

2. **Registry completeness (`"files"` as the 13th type)** — Notion has a first-class Files & media property; the fork union is 12 types. Feasibility: **clear**. Files: `src/data/types.ts:50` (union), `src/data/ColumnTypes.ts:108-138` (`COLUMN_TYPE_LABELS` + `isColumnType`), `src/data/ColumnTypes.ts:172-177` (`getDefaultCellValue` → `[]` like multi-select), **and** `src/views/PropertyTypeIcon.ts:7-20` (`PROPERTY_TYPE_ICON_NAMES: Record<ColumnDef["type"], string>` — tsc-forced, missed by iteration 9). Effort: **S**. Depends on: item 1. Citation: `src/data/types.ts:50`.

3. **Add-column / change-type lists include `files`** — Notion can add a Files & media property from the property picker; registering the union alone does **not** surface it here. Feasibility: **clear**. Files: `src/views/ColumnMenu.ts:261-264` (add `"files"` to the advanced group), `src/views/modals/CreatePropertyModal.ts:26-30` (`PROPERTY_TYPES`). Effort: **S**. Depends on: item 2. Citation: `src/views/ColumnMenu.ts:261-264`.

4. **`CellRenderer` display case + save normalization** — Notion cells show per-file tiles; today a `"files"` column would fall through to `default` and `String(value)`. Feasibility: **clear**. Files: `src/views/CellRenderer.ts` (`switch` at :185 — add `case "files"`; `normalizeCellValueForSave` at :2476-2482 — `col.type === "files"` → FilesColumn normalize). Effort: **S**. Depends on: items 1–2. Citation: `src/views/CellRenderer.ts:185-234`.

5. **Gallery/board cover from the files column (first image, zero new pipeline)** — Notion gallery `Layout → Card preview` takes a Files & media property and shows its image files. Feasibility: **clear**. Files: none required in `GalleryRenderer` / `BoardRenderer` / `CoverImage.ts` once the column exists; operator sets `galleryImageField` (and `boardImageField`) to the files key. Optional 1-liner: `src/views/DatabaseView.ts:9599-9602` prefer `col.type === "files"`. Effort: **S**. Depends on: item 2. Citation: https://www.notion.com/help/galleries.

6. **Broken-link chips (`internal-link is-unresolved`)** — Notion/Anytype show a visible degraded file, never throw; the fork paints every chip as a live `internal-link` with no existence check. Feasibility: **clear**. Files: `src/data/FilesColumn.ts` (`getFirstLinkpathDest` null → `is-unresolved`); do **not** edit `FileFieldRenderer.ts` (that would leak into virtual `file.*` fields). Effort: **S**. Depends on: item 4. Citation: `src/views/FileFieldRenderer.ts:74-84`.

7. **Cap ~5 chips + `+N` overflow** — Notion collapses once files exceed cell width; Anytype uses `arrayLimit` + `+N`; the fork lists every link and only tooltips the names. Feasibility: **clear**. Files: `src/data/FilesColumn.ts` (`FILE_CHIP_CAP = 5`; tooltip already lists all names if you reuse `setFieldTooltip`). Effort: **S**. Depends on: item 4. Citation: `context/anytype-ts/src/ts/component/cell/file.tsx:22-27,64`.

8. **Vault-local cover guard + codec `onerror`** — Notion accepts HEIC/TIFF/ICO; `parseCoverImage` also accepts **external URLs**, which is the spec §6 CDN-creep path. Feasibility: **likely** (external-skip is in-module; `onerror` is a 4th file if done on the existing `<img>`). Files: `src/data/FilesColumn.ts` (`resolveFilesColumnCover` skips `image.external`); `src/views/GalleryRenderer.ts:468` (`<img>` `onerror` → `.is-empty` placeholder, same as :443-447). Effort: **S**. Depends on: item 5. Citation: `src/data/CoverImage.ts:13,41-44`.

9. **Mobile inline-edit via existing overlay (not display-only)** — Notion mobile can upload; this phase must **render and inline-edit** (NFR-M01). Iteration 2’s “display-only on mobile” is overruled by the spec. Feasibility: **clear**. Files: no new detection; `isEditableCellColumn` already returns true for non-`file.*` keys (`src/views/CellRenderer.ts:300-304`); inherit `is-inline-overlay` (`:1484-1528`). Effort: **S**. Depends on: item 4. Citation: `src/views/CellRenderer.ts:1484-1528`.

10. **i18n `columnType.files` (4 locales)** — Notion has a localized property name; `t()` falls back to the raw key, so the add-column label becomes `columnType.files` until keys exist. Feasibility: **clear**. Files: `src/i18n.ts` (data lines; `t` at :4386-4388). Effort: **S**. Depends on: item 2. If REQ-007 is held to three files, export `filesColumnLabel()` from the module instead. Citation: `src/i18n.ts:4386-4388`.

11. **Image thumbnails vs type-icon chips** — Notion/AppFlowy show 28×28 image tiles and type icons for PDFs; `renderFileLinkList` is text chips for every file. Feasibility: **likely**. Files: `src/data/FilesColumn.ts` (`isImageTarget` + `getResourcePath` for images; `classifyFileType` map from AppFlowy’s extension switch). Effort: **S**. Depends on: item 4. Citation: `context/appflowy/frontend/appflowy_flutter/lib/plugins/database/widgets/cell/desktop_grid/desktop_grid_media_cell.dart:222-264`.

12. **`PropertyTypeConflict`: `files` → `multitext`** — no Notion gap; without it the default branch returns `null` and Obsidian will not treat the array as a list property. Feasibility: **clear**. Files: `src/data/PropertyTypeConflict.ts:73-76` (same mapping as `relation`). Effort: **S**. Depends on: item 2. Citation: `src/data/PropertyTypeConflict.ts:73-76`.

13. **Gallery “N attachments” count hint** — Notion card preview is the cover image; AppFlowy cards add a count badge. Feasibility: **likely**. Files: `src/views/GalleryRenderer.ts` (optional; extra call site). Effort: **S**. Depends on: item 5. **Defer** unless the operator wants card chrome beyond REQ-004. Citation: `context/appflowy/frontend/appflowy_flutter/lib/plugins/database/widgets/cell/card_cell_skeleton/media_card_cell.dart:52-77`.

14. **Per-file menu (Delete/Download/Full screen/View original) + reorder handles** — exact Notion cell chrome. Feasibility: **hard** (new commit paths; spec out of scope: no upload UI / no extra write surface). Files: would expand `CellRenderer.ts` + FilesColumn. Effort: **L**. Depends on: items 4, 9. **Out of this phase.** Citation: https://www.notion.com/help/database-properties.

Out of this phase (do not rank into the build): Notion CDN fetch/proxy, binary storage beyond wikilinks, `db-file-pending` iCloud overlay (Anytype `isDownloading` — open-through-Obsidian already materializes placeholders), ranking/recency cover heuristics, per-cell `adapter.exists` disk checks (NFR-P01). Citation: spec.md §3 Out of Scope; `context/anytype-ts/src/ts/component/block/media/file.tsx:79-86`.

## Recommended build (locked design)
**Module:** `src/data/FilesColumn.ts`. Copy the EuroFormat isolation rule: one new file owns the algorithm; rebase stays an insertion-only diff. Precedent: `src/data/EuroFormat.ts:1-42` imported once at `src/views/CellRenderer.ts:13` and used in two cases (`:196-203`). Live fork to edit: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` (not the scaffold path in spec §3).

**Call sites (spec REQ-007’s three):**
1. `src/data/types.ts:50` — add `"files"` to `ColumnDef["type"]`. `getColumnDisplayType` already returns `col.type` for non-computed columns (`src/data/ColumnDisplay.ts:14-26`), so display dispatch becomes `"files"` with no edit there.
2. `src/data/ColumnTypes.ts:108-138,125-137,172-177` — `files: t("columnType.files")` (or `filesColumnLabel()` if i18n is deferred), `"files"` in `isColumnType`, `getDefaultCellValue` → `[]`.
3. `src/views/CellRenderer.ts:185` and `:2476` — `case "files":` render via FilesColumn; `normalizeCellValueForSave` is the **only** write gate for “no URLs in stored value” (REQ-002). Commit stays `saveValue` → `updateFrontmatter` → `processFrontMatter` (`CellRenderer.ts:2458-2470`; `DataSource.ts:296-301,314`).

**Must-include companions (iteration 9 incomplete; still insertion-only):**
- `src/views/PropertyTypeIcon.ts:7-20` — add `files` to `PROPERTY_TYPE_ICON_NAMES` or **SC-001 fails**.
- `src/views/ColumnMenu.ts:264` and `src/views/modals/CreatePropertyModal.ts:26-30` — add `"files"` or **REQ-001 “can be added” fails**.
- `src/i18n.ts:4388` — four `columnType.files` keys, or live with the raw-key fallback.

**Do not touch:** `CoverImage.ts` (reuse `parseCoverImage` / `resolveCoverImage`), `FileFields.ts`, `FileFieldRenderer.ts` (keep `file.*` chips unchanged), `GalleryRenderer.ts` except the optional `onerror` in item 8, QueryEngine/Stringify, new write paths, new `Platform` detection.

**Algorithm:**
1. **Value.** Frontmatter `string[]` of vault wikilinks (`[[Sales.pdf]]`, `[[cover.png]]`). Bare strings; no stored `file_type` (AppFlowy stores `MediaFile.file_type` but still derives display — skip the struct). Reject/strip URLs at normalize time. Adopt multi-select’s `[]` empty default. Merge on edit = AppFlowy `apply_changeset`: remove by identity, insert only unseen targets, preserve order (`context/appflowy/frontend/rust-lib/flowy-database2/src/services/field/type_options/media_type_option/media_type_option.rs:80-97`).
2. **Parse.** Same forms as `parseFileLinkValue`: `[[target|label]]`, markdown `[label](target)`, bare path; empty → skip; malformed → raw-text chip, never throw (`src/views/FileFieldRenderer.ts:124-141`). Dedupe by parsed target (`:111-122`).
3. **Resolve.** `app.metadataCache.getFirstLinkpathDest(target, row.file.path)` (`src/data/FileFields.ts:126-138`; `CoverImage.ts:22-26`). Null → unresolved chip. Open via `app.workspace.openLinkText` (SC-004). No `fetch`, no Notion CDN, no `adapter.exists`.
4. **Classify (render-time).** Extension → Image | Document | … via a small switch (AppFlowy `media_file_type_ext.dart:6-29`). Cover eligibility stays `IMAGE_TARGET_RE` = `png|jpe?g|gif|webp|svg|avif|bmp` (`CoverImage.ts:13`). PDFs never become covers (spec §8).
5. **Table cell.** Empty `[]` → existing `db-empty-value` (`CellRenderer.ts:151-152`). Else FilesColumn paints chips: cap 5 + `+N`; unresolved class; optional image thumbnail via `getResourcePath`. Wrap uses existing `col.wrap` (`CellRenderer.ts:112`).
6. **Cover.** `galleryImageField` → `renderCover` → `resolveCoverImage` already walks arrays and parses `[[wikilink]]` (`GalleryRenderer.ts:182,439-469`; `CoverImage.ts:49-58`). FilesColumn adapter: first parseable **internal** image in array order; skip `external: true`. Same pipeline serves `boardImageField` (`BoardRenderer.ts:584,661`). No ranking heuristic (Notion + AppFlowy = first image).
7. **Edit.** Desktop and mobile share the cell renderer; mobile chrome is `db-cell-edit-popover is-mobile is-inline-overlay` (`CellRenderer.ts:1484-1528`). One atomic frontmatter write per commit. Filter via existing `empty` / `notempty` (`types.ts:135`); AppFlowy media filter is a no-op (`media_type_option.rs:100-108`).

## Edge cases & mobile/iCloud safety
**Must handle (spec §8 × iterations 7–8; three states are net-new):**
- **Empty `string[]`:** `db-empty-value`, not an error. Already satisfied (`CellRenderer.ts:151-152`).
- **Dangling wikilink:** `internal-link is-unresolved`; click no-ops; no throw (NFR-R01, Scenario 3). **New.** Obsidian core already styles `.internal-link.is-unresolved` — no new CSS (`FileFieldRenderer.ts:74-84`; Anytype ghost states at `anytype-ts/src/ts/component/util/mediaState.tsx:22-42`).
- **iCloud not downloaded:** render the chip from metadata-cache `TFile`; open via `openLinkText` so Obsidian materializes the placeholder. Do **not** `adapter.exists` per cell (NFR-P01). Anytype’s `isDownloading` overlay is optional, not required (`file.tsx:79-86`).
- **50+ files:** cap ~5 + `+N`; tooltip lists every name (`FileFieldRenderer.ts:73`). **New.**
- **Non-image in cover slot (Sales PDFs):** `resolveCoverImage` returns null → `.is-empty` placeholder (`GalleryRenderer.ts:443-447`). PDF stays a table chip.
- **Unsupported codec (HEIC on Chromium desktop; WebKit mobile can paint it):** keep the regex conservative; cover `<img>` `onerror` → placeholder (`CoverImage.ts:13`; Anytype Error at `file.tsx:55-71`). **New** if item 8 is accepted.
- **Malformed wikilink:** raw-text chip (`FileFieldRenderer.ts:124-141`). Already safe.
- **Hand-edited URL in frontmatter:** write-normalize strips URLs; cover adapter skips `external` so a stale URL cannot become a network `<img>` (NFR-S01, spec §6).
- **Concurrent edit while gallery renders:** stateless read of `row.frontmatter`; one `processFrontMatter` commit (`media_type_option.rs:67-98`; `DataSource.ts:296`).
- **Type conversion / import:** `PropertyService.convertValueForType` `default` passes arrays through (`PropertyService.ts:221-222`). Optional `files` → `multitext` at item 12.

**Mobile:** no `electron` / `fs` / Node in the new module. Render/open APIs (`openLinkText`, `getFirstLinkpathDest`, `getResourcePath`, `setIcon` / `setTooltip`) are the same ones already used on phone layouts (`FileFieldRenderer.ts:60-85`; `CoverImage.ts:22-26`). Detection is inherited (`Platform.isMobile || body.classList.contains("is-phone")`, `CellRenderer.ts:1484,1981`). Editing is the existing inline overlay, not a new bottom sheet (AppFlowy’s mobile sheet is chrome-only — `desktop_grid_media_cell.dart:192-219`). `isEditableCellColumn` does not special-case `"files"`, so inline-edit is on unless the column key is a readonly `file.*` field (`CellRenderer.ts:300-304`).

**iCloud / write-light:** this phase is display + one-commit frontmatter, not a new write pump. `normalizeCellValueForSave` runs once per commit (`CellRenderer.ts:2476-2482`). Gallery cover I/O is `getResourcePath` for `src`, not a vault scan per frame (NFR-P01). No churny per-keystroke writes. Rollback = delete `FilesColumn.ts` and revert the insertion-only call sites; stored values remain plain `string[]` with no migration (`plan.md` L2 enhanced rollback).

## Open questions / operator decisions
1. **Hold REQ-007 to three files, or include the tsc/UI insertions?** Recommended default: **Include them.** Count `types.ts` + `ColumnTypes.ts` + `CellRenderer.ts` as the three named call sites; treat `PropertyTypeIcon.ts` as the same completeness class as `COLUMN_TYPE_LABELS` (otherwise SC-001 fails) and the two 1-token picker lists as registry registration (otherwise REQ-001 fails). All are insertion-only, same rebase profile as EuroFormat.

2. **i18n now vs `filesColumnLabel()` helper?** Recommended default: **Add `columnType.files` in all four locales.** `t()` renders the raw key when missing (`i18n.ts:4388`). Helper only if you are enforcing a literal three-file diff.

3. **HEIC/TIFF/ICO as cover-eligible?** Recommended default: **No — keep `IMAGE_TARGET_RE` conservative + `onerror`.** Iteration 2 wanted them in the regex; iterations 6/10 and Chromium desktop contradict that. PDFs stay chips (spec §8).

4. **Put cover `onerror` in `GalleryRenderer.ts` this phase?** Recommended default: **Yes** (one handler on `:468`). It is the only cheap way to degrade HEIC on desktop without widening the regex. If the 4th file is refused, skip HEIC covers entirely.

5. **Auto-prefer files columns in `getDefaultGalleryImageField`?** Recommended default: **Yes, one `|| col.type === "files"` line** (`DatabaseView.ts:9599-9602`). Picker already lists any column key (`ViewConfigPanelRenderer.ts:1456,1523`).

6. **Map `files` → Obsidian `multitext`?** Recommended default: **Yes** (`PropertyTypeConflict.ts:73-74` relation precedent). Harmless if skipped; arrays still pass through `PropertyService`.

7. **Per-file Notion menu + reorder?** Recommended default: **Defer.** Spec excludes upload UI; menus add commit paths. Chips + `openLinkText` satisfy SC-004.

8. **`db-file-pending` chip for iCloud placeholders?** Recommended default: **Skip.** Open-through-Obsidian is the safety story; per-cell disk checks violate NFR-P01.

9. **Image thumbnails in table cells this phase?** Recommended default: **Yes if cheap (`getResourcePath` + `isImageTarget`), else text chips are enough for REQ-005.** Thumbnails are the AppFlowy/Notion visual, not a blocker.

10. **Empty-aware sort (empty last ascending)?** Recommended default: **Defer** unless a sort comparator already special-cases arrays. AppFlowy implements it (`media_type_option.rs:110-123`); this spec does not require it. Empty/not-empty **filter** is already free (`types.ts:135`).

11. **Which fork tree?** Recommended default: **`/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`.** All iteration citations were verified there. The scaffold path in spec §3 is not the live source.
