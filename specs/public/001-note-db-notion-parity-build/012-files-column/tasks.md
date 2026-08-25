---
title: "Tasks: Files / Attachments Column"
description: "Task breakdown for building the Files/media column phase: module, render case, and verification."
trigger_phrases:
  - "files column"
  - "tasks"
  - "coverimage parser"
  - "sales pdfs"
  - "gallery"
  - "vault local"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/012-files-column"
    last_updated_at: "2026-08-25T00:00:00Z"
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
# Tasks: Files / Attachments Column

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path) [effort]`

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

`<fork>` = `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin` (live fork; `src/` is the source root). Research source of truth: `research/synthesis.md` (evidence trail: `research/research.md`).

- [ ] T001 Read the column registry: union at `<fork>/src/data/types.ts:50`, labels/`isColumnType`/`getDefaultCellValue` at `<fork>/src/data/ColumnTypes.ts:108-138,172-177` [10m]
- [ ] T002 Read `CellRenderer.ts` render dispatch (`:185`), `normalizeCellValueForSave` (`:2476-2482`), `isEditableCellColumn` (`:300-304`), `startEdit` (`:435-524`), and the inline overlay (`:1484-1528`) at `<fork>/src/views/CellRenderer.ts` [10m]
- [ ] T003 Read `EuroFormat.ts:1-42` to confirm the isolated-module diff model and `src/data/` placement (`<fork>/src/data/EuroFormat.ts`) [10m]
- [ ] T004 Read the tsc-forced + UI companions: `PropertyTypeIcon.ts:7-20,111,128-129` (`PROPERTY_TYPE_ICON_NAMES` + `PROPERTY_TYPE_ICON_DEFS` + fallback), `ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`, `i18n.ts:4361-4366,4386-4388` (three dictionaries; `columnType.rollup` siblings at `en:1332`, `zh-CN:2804`), `PropertyTypeConflict.ts:54-77` [10m]
- [ ] T005 Read the reused cover pipeline: `CoverImage.ts:13,41-44,49-58`, `GalleryRenderer.ts:182,439-469`, `BoardRenderer.ts:584,661`, `DatabaseView.ts:9599-9602` [10m]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Collapsed into four code steps per the final build plan. T012/T013/T015 are not independent diffs — they fold into the module (T006) and CellRenderer (T010) tasks. Effort tier in brackets. Dependencies chain downward.

### Step 1 — `src/data/FilesColumn.ts` module (M)
- [ ] T006 Create `<fork>/src/data/FilesColumn.ts` with: `normalize` (array + trim + drop URLs via `isExternalUrl` / `http(s):` + dedupe-by-target), `formatForEdit` / `parseEdit` (newline- or comma-separated `[[target]]` for the text editor), `resolveFileTarget` (`app.metadataCache.getFirstLinkpathDest` → `TFile | null`; null ⇒ unresolved), `classifyFileType` / `isImageTarget` (delegate to `CoverImage.ts:13-16`; do **not** widen HEIC/TIFF/ICO), `FILE_CHIP_CAP = 5`, and `renderChips(parent, app, row, values)` — cap 5 + `+N`, tooltip all names (`FileFieldRenderer.ts:73`), `internal-link` + `is-unresolved` when dest is null, click → `openLinkText` or no-op, optional `getResourcePath` thumbnail for image targets. Do **not** call `renderFileLinkList`; do **not** edit `FileFieldRenderer.ts` (chips there have no existence check — `:74-84` — and would leak into virtual `file.*`). No `fetch`, no CDN, no `adapter.exists`, no `electron`/`fs`. Malformed → keep as raw-text chip, never throw. Precedent: `EuroFormat.ts:1-42`. Effort: **M**. Depends on: none. *(Absorbs former T012 broken-link chips and T013 cap + `+N` — they are module internals, not independent diffs.)*

### Step 2 — Registry + pickers + icon + i18n + conflict (S)
- [ ] T007 Add `"files"` to `ColumnDef["type"]` union (`<fork>/src/data/types.ts:50`); `files: t("columnType.files")` in `COLUMN_TYPE_LABELS`, `"files"` in `isColumnType`, `getDefaultCellValue` → `[]` (`<fork>/src/data/ColumnTypes.ts:108-138,172-177`). Effort: **S**. Depends on: T006.
- [ ] T008 Add `files` to `PROPERTY_TYPE_ICON_NAMES: Record<ColumnDef["type"], string>` (`<fork>/src/views/PropertyTypeIcon.ts:7-20`). The icon name **must resolve in `PROPERTY_TYPE_ICON_DEFS`** — reuse `link` (`:111`) or add a small `file` def — or `getPropertyTypeIconDef` falls back to `letter-case` (`:128-129`) and the dropdown shows a blank glyph. Effort: **S**. Depends on: T007.
- [ ] T009 Add `"files"` to the advanced group (`<fork>/src/views/ColumnMenu.ts:261-264`) and to `PROPERTY_TYPES` (`<fork>/src/views/modals/CreatePropertyModal.ts:26-30`). Skip `BaseImportConfirmModal.TYPES` (`:34-36` — import mapping, not add-column). Effort: **S**. Depends on: T007.
- [ ] T016 Add `columnType.files` keys to the **three dictionaries** (en, zh-CN, zh-TW — `LocaleCode` is `system | en | zh-CN | zh-TW` but only three dictionaries exist at `i18n.ts:4361-4366`) at `<fork>/src/i18n.ts`. Place keys next to `columnType.rollup` (`en:1332`, `zh-CN:2804`, `zh-TW` rollup sibling). Missing keys render the raw key (`t()` `:4386-4388`). If enforcing a literal three-file diff, export `filesColumnLabel()` from `FilesColumn.ts` instead. Effort: **S**. Depends on: T007.
- [ ] T018 Add `files → multitext` mapping at `<fork>/src/data/PropertyTypeConflict.ts:73-76` (same as `relation`); without it the default branch returns `null` and Obsidian will not treat the array as a list. Effort: **S**. Depends on: T007.
- **Check:** `npx tsc --noEmit` passes after this step even before chips render. Add-column and change-type lists show a localized "Files".

### Step 3 — CellRenderer dispatch + save + edit (M)
- [ ] T010 Add `case "files":` render via `FilesColumn.renderChips` at `<fork>/src/views/CellRenderer.ts:185` (empty `[]` already hits `isEmptyValue` → `db-empty-value` at `:2665-2667` + `:151-152`); wire `normalizeCellValueForSave` for `col.type === "files"` at `:2476-2482` (the only write gate that arrays/trims/drops URLs/dedupes-by-target — REQ-002); add a `startEdit` branch before the text fallback (`:449-524`) so `col.type === "files"` → `editText` with `FilesColumn.formatForEdit`, and commit runs `parseEdit` → `normalize`. Mobile uses existing `is-inline-overlay` (`:1484-1528`); no new `Platform` detection. Leave `FileFields.ts` / `FileFieldRenderer.ts` untouched. Effort: **M**. Depends on: T006, T007. *(Absorbs former T015 — inline-edit is not "inherit overlay and you're done"; without a `startEdit` branch, `safeString(currentValue)` turns a `string[]` into garbled text.)*
- **Check:** table cell shows ≤5 chips + `+N`; click opens vault file; dangling chip has `is-unresolved` and click no-ops; empty `[]` is empty; typing `[[Sales.pdf]]` and `https://cdn.example/x.pdf` stores only the wikilink; one `processFrontMatter` per commit.

### Step 4 — Cover wiring: guard + onerror + auto-prefer (S)
- [ ] T011 Cover guard at the two `renderCover` call sites (not a second pipeline inside `FilesColumn.ts` — `resolveFilesColumnCover` is dead without a call site): after `resolveCoverImage(...)`, if the cover field's column type is `"files"` and `image.external`, behave as `!image` (`.is-empty` placeholder `:443-447` / board `:662-665`). Add the guard at `<fork>/src/views/GalleryRenderer.ts:442` and `<fork>/src/views/BoardRenderer.ts:661`. Add `<img>` `onerror` → `.is-empty` on gallery (`:468`) and the board cover `<img>` (same degrade; synthesis Q4). Auto-prefer: `|| col.type === "files"` in `getDefaultGalleryImageField` (`<fork>/src/views/DatabaseView.ts:9599-9602`, Q5). Do **not** edit `CoverImage.ts` (locked — the guard belongs at the call sites, not a second parser). Keep `IMAGE_TARGET_RE` conservative (`CoverImage.ts:13`); PDFs never match it, so they never become covers (spec §8). Effort: **S**. Depends on: T007. *(Absorbs former T014 — the cover guard and onerror are the same step.)*
- **Check:** gallery with image + Sales PDFs in the files column, network off, shows the image; PDF-only slot is placeholder; a hand-edited URL in that column does not become a network `<img>`.

### Conditional / deferred
- [ ] T017 In `FilesColumn.ts`, `isImageTarget` + `getResourcePath` for image thumbnails; `classifyFileType` map from AppFlowy's extension switch for non-image type icons. Only if `getResourcePath` + `isImageTarget` stays inside the module with existing chip CSS — if it needs new CSS, ship type-icon + filename chips (text chips satisfy REQ-005). Citation: `appflowy/.../desktop_grid_media_cell.dart:222-264`. Effort: **S**. Depends on: T006. (Operator decision 9.)
- [ ] [B] T019 Gallery "N attachments" count hint (`<fork>/src/views/GalleryRenderer.ts`, optional). Effort: **S**. Depends on: T011. **Defer** unless the operator wants card chrome beyond REQ-004 (operator decision 7).
- [ ] [B] T020 Per-file Notion menu (Delete/Download/Full screen/View original) + reorder handles. Effort: **L**. Depends on: T010. **Out of this phase** — spec excludes upload UI / new write surfaces (operator decision 7).
- [ ] [B] T021 Card-body stringify guard (conditional). `GalleryRenderer.renderValue` (`:505`) / `ListRenderer.renderValue` (`:468`) have no `files` case; arrays become `String(value)`. Acceptable if the files column is cover-only; add `col.type === "files"` calling `FilesColumn.renderChips` only if a finance gallery/list actually shows the column as a visible field. Do not pre-open those renderers. Effort: **S**. Depends on: T011.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Typecheck / Build
- [ ] T021 Typecheck the fork: `npx tsc --noEmit` at `<fork>` (must pass with `PROPERTY_TYPE_ICON_NAMES` entry — SC-001) [10m]
- [ ] T022 Build the fork with its documented build command at `<fork>` (SC-002) [10m]
- [ ] T023 Rebase dry-run: `git diff --stat` confirms 1 new module + insertion-only call-site edits; `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean (SC-004 / REQ-007) [10m]

### Vault-local grep
- [ ] T024 Grep the new module for `fetch`/`cdn`/`http`/`adapter.exists` — no CDN fetch path; the external skip is at the cover call sites (`GalleryRenderer.ts:442`, `BoardRenderer.ts:661`), not only in an unused helper (REQ-002, REQ-003, NFR-S01) [5m]

### Manual Verification (desktop, network off)
- [ ] T025 Gallery cover from the files column renders with the network off (SC-003); non-image (PDF) in the slot falls back to `.is-empty` placeholder [20m]
- [ ] T026 Sales PDFs render as table chips; opening a chip opens the vault file via `openLinkText` (SC-004) [10m]
- [ ] T027 Dangling wikilink renders `internal-link is-unresolved`; click no-ops; no throw (NFR-R01, Scenario 3) [10m]
- [ ] T028 50+ files: cap ~5 chips + `+N`; tooltip lists every name (NFR-P01) [10m]
- [ ] T029 HEIC cover on Chromium desktop: `onerror` → `.is-empty` placeholder (if a HEIC exists in vault) [10m]
- [ ] T030 Empty `string[]` renders `db-empty-value`, not an error [5m]
- [ ] T033 Inline-edit round-trip: typing `[[Sales.pdf]]` and `https://cdn.example/x.pdf` stores only the wikilink; one `processFrontMatter` per commit [10m]
- [ ] T034 Cover guard: a hand-edited URL in the files column does not become a network `<img>` (gallery + board); PDF-only slot is placeholder [10m]
- [ ] T035 iCloud not-downloaded: chip renders from metadata-cache `TFile`; opening via `openLinkText` materializes the placeholder; no `db-file-pending` overlay (Q8, NFR-P01) [10m]

### Manual Verification (mobile)
- [ ] T036 Mobile: files column renders and inline-edits via `is-inline-overlay`; no `electron`/`fs`/Node in the module (NFR-M01) [20m]

### Documentation
- [ ] T037 Record verified evidence in `checklist.md` (`specs/obsidian/002-note-db-notion-parity-build/012-files-column/checklist.md`) [10m]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-deferred tasks marked `[x]`. [Evidence: pending — 0 completed tasks at rewrite]
- [ ] Deferred `[B]` tasks (T019, T020, T021) remain `[B]` with the operator decision recorded. [Evidence: pending — operator decisions 7 and card-body stringify]
- [ ] Typecheck and fork build pass (SC-001, SC-002). [Evidence: pending — commands not yet run]
- [ ] `checklist.md` fully verified. [Evidence: pending — 0 verified at rewrite]

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research Synthesis (source of truth)**: `research/synthesis.md`
- **Research Evidence Trail**: `research/research.md`
- **Fork (live source)**: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`

<!-- /ANCHOR:cross-refs -->
