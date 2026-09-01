# Final Plan: Files / Attachments Column
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

Build it. The fork already has vault wikilink resolution (`CoverImage.ts:22-26`, `FileFieldRenderer.ts:74-84`), array-aware covers (`resolveCoverImage` `:49-58` walks arrays; `parseCoverImage` `:31-45` accepts `[[wikilink]]`), and a 12-type union (`types.ts:50`). The missing piece is a 13th type plus one `EuroFormat.ts:1-42` module. Synthesis correctly killed iteration 9’s “zero UI edits”: `PROPERTY_TYPE_ICON_NAMES` is `Record<ColumnDef["type"], string>` (`PropertyTypeIcon.ts:7-20`) so `tsc` fails without `files`, and add/change-type UIs are hardcoded lists (`ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`), not `COLUMN_TYPE_LABELS()`. Vault-local is the right hard constraint: `parseCoverImage` will happily set `external: true` (`CoverImage.ts:41-44`) and `resolveImageSrc` returns that URL as `src` (`:22-23`).

The ranked backlog is too fine-grained and two load-bearing paths are under-specified.

- **`resolveFilesColumnCover` is dead without a call site.** Synthesis item 5 says “zero new gallery code” once `galleryImageField` points at the files key. `GalleryRenderer.renderCover` (`:439-468`) and `BoardRenderer.renderCover` (`:656-661`) call `resolveCoverImage` directly. A FilesColumn adapter that skips `external` never runs unless those two sites branch on `col.type === "files"`. Write-time URL strip (`normalizeCellValueForSave` `CellRenderer.ts:2476-2482`) does not save hand-edited stale URLs already on disk (NFR-S01).
- **Inline-edit is not “inherit overlay and you’re done” (T015).** `isEditableCellColumn` is already true for non-`file.*` (`CellRenderer.ts:300-304`). `startEdit` then falls through to `editText` (`:524`) with `safeString(currentValue)` / `target.textContent`. A `string[]` becomes `"[[a.pdf]],[[b.pdf]]"` or worse. NFR-M01 requires render **and** inline-edit. There is no files branch in `startEdit` (`:449-524`). Cheap path: serialize ↔ parse in FilesColumn, still using `editText` / `is-inline-overlay` (`:1484-1528`). A vault suggester or Notion cell menu is out of scope (synthesis Q7).
- **T006–T013 duplicate the module.** Cap, unresolved chips, classify, cover helper all belong in `FilesColumn.ts`. T012/T013 should not be separate implementation tasks.
- **i18n “4 locales” is wrong.** `LocaleCode` is `system | en | zh-CN | zh-TW` (`i18n.ts:1`); dictionaries are three (`:4361-4366`). Keys belong next to `columnType.rollup` (`en:1332`, `zh-CN:2804`, `zh-TW` rollup sibling). Missing keys render the raw key (`t()` `:4386-4388`).
- **Gallery/list/board card bodies will stringify.** `GalleryRenderer.renderValue` / `ListRenderer.renderValue` have no `files` case; arrays become `String(value)`. REQ-005 is `CellRenderer.ts:185` only. Acceptable if the column is cover-only; ugly if the files column is visible on cards. Do not open those renderers unless a finance gallery actually shows the column as a field.
- **`CoverImage.ts` must stay untouched** (locked). The guard belongs at the two `renderCover` call sites, not a second parser inside CoverImage.
- **Plan effort ~2h15m is tight.** Registry companions are S, but the module + save gate + edit serialize + cover guard is the real M. Budget **~3h (M)**.
- **Do not edit `FileFieldRenderer.ts`.** Chips there have no existence check (`:74-84`); changing them leaks into virtual `file.*`. FilesColumn paints its own chips (synthesis item 6).

## Optimizations

1. **Collapse the rank list into four code steps:** module; registry+pickers+icon+i18n+conflict; CellRenderer render+save+edit; cover guard+onerror+auto-prefer. T012/T013/T015 are not independent diffs.
2. **Cover guard = two one-liners, not a second pipeline.** After `resolveCoverImage`, if the cover field’s column type is `"files"` and `image.external`, treat as empty. Same in `GalleryRenderer.ts:442` and `BoardRenderer.ts:661`. Keep `IMAGE_TARGET_RE` conservative (`CoverImage.ts:13`). PDFs never match it, so they never become covers (spec §8).
3. **Edit path: text of wikilinks, not a file picker.** `FilesColumn.formatForEdit` / `parseEdit` (newline- or comma-separated `[[target]]`); `startEdit` branches `col.type === "files"` into existing `editText`; `normalizeCellValueForSave` is still the only write gate that arrays/trims/drops URLs/dedupes-by-target. No upload UI, no `adapter.exists`.
4. **Thumbnails: only if `getResourcePath` + `isImageTarget` stays inside the module.** If it needs new CSS, ship type-icon + filename chips. Text chips satisfy REQ-005 (synthesis Q9).
5. **Icon:** `PROPERTY_TYPE_ICON_NAMES.files` must be a key that exists in `PROPERTY_TYPE_ICON_DEFS` or `getPropertyTypeIconDef` falls back to `letter-case` (`PropertyTypeIcon.ts:128-129`). Reuse `link` (`:111`) or add a small `file` def — do not leave a blank dropdown glyph.
6. **Do not hold REQ-007 to three files.** Count `types.ts` + `ColumnTypes.ts` + `CellRenderer.ts` as the three named sites; companions stay insertion-only (synthesis Q1). A literal three-file diff fails `tsc` and REQ-001.

## Final build plan (ordered)

1. **Setup reads (S)** — no new files. Deps: none.
   - Registry: `types.ts:50`, `ColumnTypes.ts:108-138,172-177`.
   - Render/save: `CellRenderer.ts:185, 2476-2482, 300-304, 435-524, 1484-1528`.
   - Completeness: `PropertyTypeIcon.ts:7-20`, `ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`, `i18n.ts:1332` (+ zh siblings), `PropertyTypeConflict.ts:54-77`.
   - Cover: `CoverImage.ts:13,41-44,49-58`, `GalleryRenderer.ts:182,439-469`, `BoardRenderer.ts:584,656-661`, `DatabaseView.ts:9599-9602`.
   - Contract: `EuroFormat.ts:1-42`.
   - **Check:** live tree is `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` (synthesis Q11).

2. **`src/data/FilesColumn.ts` (M)** — new module, EuroFormat header, no renderer imports that pull CellRenderer. Deps: 1.
   - `normalize(value)`: coerce to array, trim, drop empty, drop URLs (`isExternalUrl` / `http(s):`), parse `[[target|label]]` / markdown / bare path (same forms as `FileFieldRenderer.ts:124-141`), dedupe by target (`:111-122`). Malformed → keep as raw-text chip, never throw.
   - `formatForEdit` / `parseEdit` for the text editor.
   - `resolveFileTarget(app, row, target)` → `metadataCache.getFirstLinkpathDest` (`CoverImage.ts:24`); null ⇒ unresolved.
   - `classifyFileType` / `isImageTarget` (delegate to `CoverImage.ts:13-16`; do not widen HEIC/TIFF/ICO — synthesis Q3).
   - `FILE_CHIP_CAP = 5`.
   - Optional: `renderChips(parent, app, row, values)` — cap 5 + `+N`, tooltip all names (`FileFieldRenderer.ts:73`), `internal-link` + `is-unresolved` when dest is null, click → `openLinkText` or no-op, optional `getResourcePath` thumbnail for image targets. **Do not call `renderFileLinkList`.**
   - No `fetch`, no CDN, no `adapter.exists`, no `electron`/`fs`.
   - **Check:** unit-level cases in a scratch vault note: `[]`, one PDF, URL dropped, duplicate targets, dangling wikilink, 50+ names in tooltip.

3. **Registry completeness (S)** — `src/data/types.ts:50`; `src/data/ColumnTypes.ts:108-138,172-177`; `src/views/PropertyTypeIcon.ts:7-20`; `src/views/ColumnMenu.ts:261-264`; `src/views/modals/CreatePropertyModal.ts:26-30`; `src/i18n.ts` (three dictionaries); `src/data/PropertyTypeConflict.ts:73-76`. Deps: 2.
   - Union member `"files"`. `COLUMN_TYPE_LABELS.files = t("columnType.files")`. `"files"` in `isColumnType`. `getDefaultCellValue` → `[]` (multi-select at `ColumnTypes.ts:174`).
   - Icon name that resolves in `PROPERTY_TYPE_ICON_DEFS`.
   - Advanced picker group gets `"files"` beside computed/relation/rollup (`ColumnMenu.ts:264`). `PROPERTY_TYPES` same (`CreatePropertyModal.ts:26-30`). Skip `BaseImportConfirmModal.TYPES` (`:34-36` — import mapping, not add-column).
   - `columnType.files` in `en` / `zh-CN` / `zh-TW`.
   - `mapColumnTypeToObservablePropertyType`: `case "files": return "multitext"` next to relation (`PropertyTypeConflict.ts:73-74`). `default` already returns null (`:75-76`) — without this, Obsidian will not treat the array as a list.
   - **Check:** `npx tsc --noEmit` passes after this step even before chips render. Add-column and change-type lists show a localized “Files” (or locale equivalent).

4. **CellRenderer dispatch + save + edit (M)** — `src/views/CellRenderer.ts:185, 2476-2482, 435-524`. Deps: 2–3.
   - `case "files":` in the `displayType` switch (`:185`). Empty `[]` already hits `isEmptyValue` (`:2665-2667` + `:151-152`) → `db-empty-value`. Else `FilesColumn.renderChips`.
   - `normalizeCellValueForSave`: `if (col.type === "files") return FilesColumn.normalize(value)`. This is the **only** write gate (REQ-002). Commit stays `saveValue` → `updateFrontmatter` → `processFrontMatter` (`:2458-2470`; `DataSource.ts:296-301`).
   - `startEdit`: before the text fallback (`:524`), `col.type === "files"` → `editText` with `formatForEdit`; commit runs normalize. Mobile uses existing `is-inline-overlay` (`:1484-1528`). No new `Platform` detection.
   - Leave `FileFields.ts` / `FileFieldRenderer.ts` untouched.
   - **Check:** table cell shows ≤5 chips + `+N`; click opens vault file; dangling chip has `is-unresolved` and click no-ops; empty `[]` is empty; typing `[[Sales.pdf]]` and `https://cdn.example/x.pdf` stores only the wikilink; one `processFrontMatter` per commit.

5. **Cover wiring (S)** — `src/views/GalleryRenderer.ts:442-468`; `src/views/BoardRenderer.ts:661` (and its `<img>`); `src/views/DatabaseView.ts:9599-9602`. Deps: 3.
   - Do not edit `CoverImage.ts`. Operator (or auto-prefer) sets `galleryImageField` / `boardImageField` to the files key — picker already lists every column (`ViewConfigPanelRenderer.ts:1456,1468-1471`).
   - After `resolveCoverImage(...)`: if cover column type is `"files"` and `image.external`, behave as `!image` (`.is-empty` placeholder `:443-447` / board `:662-665`).
   - `<img> onerror` → `.is-empty` on gallery `:468` and the board cover `<img>` (same degrade; synthesis Q4).
   - Auto-prefer: `|| col.type === "files"` in `getDefaultGalleryImageField` (`DatabaseView.ts:9599-9602`) (Q5).
   - **Check:** gallery with image + Sales PDFs in the files column, network off, shows the image; PDF-only slot is placeholder; a hand-edited URL in that column does not become a network `<img>`.

6. **Verification (M)** — deps: 2–5.
   - `npx tsc --noEmit` (SC-001) and the fork build (SC-002).
   - Grep `FilesColumn.ts` for `fetch` / `cdn` / `http` / `adapter.exists` (REQ-003, NFR-S01). External skip is at the cover call sites, not only in an unused helper.
   - Desktop, network off: Sales PDF chips + `openLinkText` (SC-004); dangling wikilink; 50+ cap; empty `[]`; HEIC cover `onerror` if a HEIC exists in vault.
   - Mobile: render + inline-edit via overlay; no `electron`/`fs`/Node in the module (NFR-M01).
   - iCloud not-downloaded: chip from metadata-cache `TFile`; open materializes; no `db-file-pending` (Q8).
   - `git diff --stat`: 1 new module + insertion-only sites; `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean.
   - **Check:** REQ-001–007 and SC-001–004; T019 gallery count badge and T020 per-file menu stay `[B]`.

## Risks & open decisions

- **CDN creep via `parseCoverImage`** — default: cover-site external skip (step 5) **and** write-time strip (step 4). Adapter-only inside FilesColumn is not enough.
- **Inline-edit quality** — default: wikilink text editor this phase. Revisit a vault-file suggester (relation-popover style) only if operators cannot type `[[Sales.pdf]]`. Per-file Notion menu + reorder stays deferred (Q7) — new commit paths.
- **Card-body stringify** — default: **accept** unless a finance gallery/list shows the files column as a visible field. Then add `col.type === "files"` in `GalleryRenderer.renderValue` (`:505`) / `ListRenderer.renderValue` (`:468`) calling `FilesColumn.renderChips`. Do not pre-open those files.
- **HEIC/TIFF/ICO covers** — default: **no** regex widen; `onerror` placeholder (Q3/Q4). WebKit mobile may paint HEIC anyway; Chromium desktop must not hang on a broken `<img>`.
- **Thumbnails** — default: yes if `getResourcePath` + `isImageTarget` stays in-module with existing chip CSS; else filename + type icon (Q9).
- **`files` → `multitext`** — default: **yes** (Q6). Harmless if arrays already pass through `PropertyService.convertValueForType` default (`PropertyService.ts:221-222`).
- **`db-file-pending` / per-cell `adapter.exists`** — default: **skip** (Q8, NFR-P01).
- **Empty-aware sort** — default: **defer** (Q10). `empty` / `notempty` filter is already free (`types.ts:135`).
- **REQ-007 file count** — default: include companions (Q1). Do not ship a three-file diff that fails `tsc` or hides the type from pickers.
- **i18n helper vs keys** — default: three dictionary keys, not `filesColumnLabel()` (Q2), unless someone re-imposes a literal three-file cap.
