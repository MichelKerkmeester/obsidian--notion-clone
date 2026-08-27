---
title: "Feature Specification: Files / Attachments Column"
description: "First-class Files/media column for the note-database fork: vault wikilink string[] storage, gallery CoverImage parsing, and vault-local rendering for finance PDF attachments."
trigger_phrases:
  - "files column"
  - "attachments column"
  - "media column"
  - "cover image"
  - "sales pdfs"
  - "vault local files"
  - "gallery cover"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored from synthesis and final-plan"
    next_safe_action: "Build 001-files-column-module per its plan.md and tasks.md"
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
# Feature Specification: Files / Attachments Column

> Adjacent phases: predecessor `011-table-multi-group` · successor `013-template-toolbar-button`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-24 |
| **Branch** | `012-files-column` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion databases natively carry a first-class Files & Media property (images, PDFs, attachments), but the note-database fork's column union is 12 types with no files/media type. In the finance vault, Sales PDFs have no native home inside a database row, and gallery view cannot derive a cover from a column's media the way Notion's `Layout → Card preview` does. The fork already has the prerequisite machinery — vault-local wikilink resolution, a chip renderer, an array-aware `CoverImage` parser, and a gallery/board cover pipeline — so the missing piece is a 13th column type plus one EuroFormat-style module that normalizes `string[]` wikilinks and adapts the existing cover path.

### Purpose
Add a first-class Files/media column (`"files"`, the 13th type) backed by an isolated `src/data/FilesColumn.ts` module that stores vault wikilink `string[]`, registers in the column registry, dispatches one `CellRenderer` case, and points `galleryImageField` at the new column. The hard constraint: files stay vault-local — rendering resolves wikilinks to files already inside the vault and never fetches Notion CDN URLs, avoiding both a network dependency and iCloud duplication of vault copies. No second cover parser, no CDN fetch, no upload UI. Nested children own the ordered slices: isolated FilesColumn module, registry plus pickers, CellRenderer render/save/edit, cover wiring, then vault-local proof.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- A new isolated `src/data/FilesColumn.ts` module: vault wikilink `string[]` value model, normalize (array + trim + drop URLs + dedupe-by-target), `formatForEdit` / `parseEdit` (newline- or comma-separated `[[target]]` for the text editor), `classifyFileType` / `isImageTarget`, `resolveFileTarget`, `renderChips` (cap 5 + `+N`, unresolved chips, optional thumbnails), `FILE_CHIP_CAP`.
- Registering `"files"` as the 13th column type across the union, labels, `isColumnType`, and `getDefaultCellValue` (→ `[]` like multi-select).
- The tsc-forced completeness companion: `PROPERTY_TYPE_ICON_NAMES` gains `files` with a name that resolves in `PROPERTY_TYPE_ICON_DEFS` (otherwise SC-001 fails or the dropdown shows a blank glyph).
- The add-column / change-type picker lists: `ColumnMenu.ts` advanced group and `CreatePropertyModal.ts` `PROPERTY_TYPES` (otherwise REQ-001 "can be added" fails).
- A `CellRenderer.ts` `case "files"` render case, `normalizeCellValueForSave` write gate (the only write path that strips URLs, REQ-002), and a `startEdit` branch into `editText` with `formatForEdit` (so inline-edit serializes `string[]` ↔ wikilink text instead of garbling it).
- Gallery/board cover via the existing `galleryImageField` / `boardImageField` pipeline; cover guard at the two `renderCover` call sites (`GalleryRenderer.ts:442`, `BoardRenderer.ts:661`) that skips `image.external` when the column type is `"files"`; `onerror` → `.is-empty` placeholder on both cover `<img>` elements; auto-prefer one-liner in `DatabaseView.ts`.
- Broken-link chips (`internal-link is-unresolved`), ~5-chip cap + `+N` overflow, optional image thumbnails, i18n `columnType.files` (3 dictionaries: en, zh-CN, zh-TW), `PropertyTypeConflict` `files → multitext`.
- Vault-local wikilink resolution only — no Notion CDN fetching.
- This phase's planning documents.

### Out of Scope
- Fetching or proxying Notion CDN URLs (explicitly excluded: network dependency + iCloud duplication).
- Binary attachment storage beyond vault wikilinks, or new upload UI.
- Per-file Notion cell menu (Delete/Download/Full screen/View original) and reorder handles — new commit paths, spec-excluded.
- `db-file-pending` iCloud overlay / per-cell `adapter.exists` disk checks (NFR-P01).
- Ranking/recency cover heuristics; empty-aware sort (empty-last) unless a comparator already special-cases arrays.
- Desktop-only APIs, telemetry, and secrets handling.
- Other phases' surfaces (multi-group tables, template toolbar button).

### Files to Change

`<fork>` = `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin` (live fork; `src/` is the source root). The scaffold path in the original brief is not the live source — all research citations were verified against this tree.

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `specs/public/001-note-db-notion-parity-build/012-files-column/spec.md` | Edit | This phase specification (rewritten to match synthesis) |
| `specs/public/001-note-db-notion-parity-build/012-files-column/plan.md` | Edit | Implementation plan (rewritten to match synthesis) |
| `specs/public/001-note-db-notion-parity-build/012-files-column/tasks.md` | Edit | Task breakdown (rewritten to synthesis ranked backlog) |
| `specs/public/001-note-db-notion-parity-build/012-files-column/checklist.md` | Edit | Verification checklist (rewritten to synthesis edge cases) |
| `specs/public/001-note-db-notion-parity-build/012-files-column/implementation-summary.md` | Untouched | Scaffold state — nothing implemented yet |
| `<fork>/src/data/FilesColumn.ts` (planned) | Create | Isolated module: normalize, `formatForEdit`/`parseEdit`, classify, resolve, `renderChips`, chip cap |
| `<fork>/src/data/types.ts:50` (planned) | Edit | Add `"files"` to `ColumnDef["type"]` union |
| `<fork>/src/data/ColumnTypes.ts:108-138,172-177` (planned) | Edit | `COLUMN_TYPE_LABELS`, `isColumnType`, `getDefaultCellValue` → `[]` |
| `<fork>/src/views/PropertyTypeIcon.ts:7-20` (planned) | Edit | Add `files` to `PROPERTY_TYPE_ICON_NAMES` with a name resolving in `PROPERTY_TYPE_ICON_DEFS` (tsc-forced) |
| `<fork>/src/views/CellRenderer.ts:185,2476,449-524` (planned) | Edit | `case "files"` render + `normalizeCellValueForSave` write gate + `startEdit` branch into `editText` with `formatForEdit` |
| `<fork>/src/views/ColumnMenu.ts:261-264` (planned) | Edit | Add `"files"` to the advanced add-column group |
| `<fork>/src/views/modals/CreatePropertyModal.ts:26-30` (planned) | Edit | Add `"files"` to `PROPERTY_TYPES` |
| `<fork>/src/i18n.ts` (planned) | Edit | `columnType.files` keys in three dictionaries (en, zh-CN, zh-TW) next to `columnType.rollup` siblings |
| `<fork>/src/data/PropertyTypeConflict.ts:73-76` (planned) | Edit | `files → multitext` mapping (relation precedent) |
| `<fork>/src/views/GalleryRenderer.ts:442,468` (planned) | Edit | Cover guard (skip `image.external` when column type is `"files"`) + `<img>` `onerror` → `.is-empty` placeholder |
| `<fork>/src/views/BoardRenderer.ts:661` (planned) | Edit | Cover guard (skip `image.external` when column type is `"files"`) + `<img>` `onerror` → `.is-empty` placeholder |
| `<fork>/src/views/DatabaseView.ts:9599-9602` (planned) | Edit | Auto-prefer `col.type === "files"` for gallery cover field |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Files column type exists and is addable | `"files"` is the 13th union member (`types.ts:50`), labeled in `COLUMN_TYPE_LABELS`, accepted by `isColumnType`, defaulted to `[]` (`ColumnTypes.ts:108-138,172-177`), and present in the add-column / change-type picker lists (`ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`) — a files column can be added to table and gallery views |
| REQ-002 | Values stored as vault wikilink `string[]`, no URLs | `normalizeCellValueForSave` (`CellRenderer.ts:2476-2482`) is the only write gate; it arrays, trims, drops URLs, and dedupes by target. The stored frontmatter value contains no URLs |
| REQ-003 | Files stay vault-local | Rendering resolves wikilinks via `metadataCache.getFirstLinkpathDest` and opens via `workspace.openLinkText`; the module contains no `fetch`, no Notion CDN path, no `adapter.exists` per cell |
| REQ-004 | Gallery/board cover from the files column | `galleryImageField` (and `boardImageField`) point at the files key; the existing `resolveCoverImage` / `parseCoverImage` pipeline derives the cover from the first internal image in array order with no network. A cover guard at the two `renderCover` call sites (`GalleryRenderer.ts:442`, `BoardRenderer.ts:661`) skips `image.external` when the column type is `"files"`, so a hand-edited URL cannot become a network `<img>`. PDFs never become covers |
| REQ-005 | CellRenderer render case + inline-edit | `CellRenderer.ts:185` dispatches `case "files"` to `FilesColumn.renderChips`; cells show file chips/links (cap ~5 + `+N`), unresolved chips carry `is-unresolved`, empty `[]` renders `db-empty-value`. `startEdit` (`:449-524`) branches `col.type === "files"` into `editText` with `FilesColumn.formatForEdit`; commit runs `parseEdit` → `normalize` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-006 | Mobile-safe render + inline-edit | No `electron` / `fs` / Node in the new module; cells render and inline-edit on mobile via the existing `is-inline-overlay` (`CellRenderer.ts:1484-1528`); `isEditableCellColumn` is on unless the key is a readonly `file.*` field. `startEdit` (`:449-524`) branches `col.type === "files"` into `editText` with `FilesColumn.formatForEdit` so a `string[]` is not garbled by `safeString(currentValue)` |
| REQ-007 | Rebase-friendly, insertion-only diff | One isolated module (`FilesColumn.ts`) plus the named call-site edits: `types.ts:50`, `ColumnTypes.ts:108-138,172-177`, `CellRenderer.ts:185,2476,449-524` — and the insertion-only completeness companions (`PropertyTypeIcon.ts:7-20`, `ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`, `i18n.ts` three dictionaries, `PropertyTypeConflict.ts:73-76`) and cover-wiring sites (`GalleryRenderer.ts:442,468`, `BoardRenderer.ts:661`, `DatabaseView.ts:9599-9602`). All are insertion-only on the EuroFormat model; `git rebase` onto upstream stays clean. `PROPERTY_TYPE_ICON_NAMES` is `Record<ColumnDef["type"], string>` and MUST gain `files` or `tsc` fails. A literal three-file diff fails `tsc` and REQ-001 |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npx tsc --noEmit` exits 0 on the fork with the new module, render case, and `PROPERTY_TYPE_ICON_NAMES` entry.
- **SC-002**: The fork's documented build command completes.
- **SC-003**: A gallery whose files column holds the Sales PDFs plus a cover image shows the cover with the network off (desktop and mobile).
- **SC-004**: Table cells render vault file chips/links; opening a chip opens the vault file via `workspace.openLinkText`.

### Acceptance Scenarios

- **Scenario 1**: **Given** a files column holding the Sales PDFs, **when** the table renders, **then** each cell shows vault file chips (≤5 + `+N` overflow) and no network call is made.
- **Scenario 2**: **Given** a gallery using the files column as `galleryImageField`, **when** the gallery renders, **then** the existing cover pipeline shows the first internal image as the cover without fetching Notion CDN URLs; a non-image (PDF) in the slot falls back to the `.is-empty` placeholder.
- **Scenario 3**: **Given** a dangling wikilink, **when** the cell renders, **then** the chip carries `internal-link is-unresolved`, click no-ops, and no exception is thrown.
- **Scenario 4**: **Given** the finished diff, **when** rebased onto upstream, **then** the fork applies cleanly (1 isolated module + insertion-only call-site edits on the EuroFormat model).

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | None — the phase has `depends_on: none` on the roadmap | No cross-phase blocking | Build can start independently |
| Dependency | Fork internals: column registry, `CellRenderer.ts`, `CoverImage.ts` pipeline | Files type cannot register, render, or derive covers if unread | Read all three in Setup before editing; reuse existing cover pipeline |
| Risk | REQ-007 under-counts call sites | `PROPERTY_TYPE_ICON_NAMES` is `Record<ColumnDef["type"], string>` — `tsc` fails until it gains `files`; the add-column / change-type UIs use hardcoded type lists (`ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`), not `COLUMN_TYPE_LABELS()` | Include the tsc/UI insertions as insertion-only companions (operator decision 1, recommended default: include) |
| Risk | Notion CDN URL creep | Network dependency + iCloud duplication of vault copies | `normalizeCellValueForSave` strips URLs at write; cover guard at the `renderCover` call sites (`GalleryRenderer.ts:442`, `BoardRenderer.ts:661`) skips `image.external`; grep for fetch/CDN patterns |
| Risk | `resolveFilesColumnCover` dead without a call site | `GalleryRenderer.renderCover` and `BoardRenderer.renderCover` call `resolveCoverImage` directly; a module-internal adapter never runs | Guard is at the two call sites, not a second pipeline inside `FilesColumn.ts`; `CoverImage.ts` stays untouched |
| Risk | Inline-edit garbles `string[]` | `startEdit` falls through to `editText` with `safeString(currentValue)` — a `string[]` becomes garbled text | `startEdit` branches `col.type === "files"` into `editText` with `FilesColumn.formatForEdit`; commit runs `parseEdit` → `normalize` |
| Risk | Card-body stringify on gallery/list/board | `GalleryRenderer.renderValue` / `ListRenderer.renderValue` have no `files` case; arrays become `String(value)` | Accept unless a finance gallery/list shows the files column as a visible field; then add `col.type === "files"` calling `FilesColumn.renderChips` (deferred — do not pre-open those renderers) |
| Risk | HEIC/TIFF/ICO codec mismatch | Chromium desktop cannot paint HEIC; widening `IMAGE_TARGET_RE` risks broken `<img>` | Keep `IMAGE_TARGET_RE` conservative; add `onerror` → `.is-empty` placeholder on `GalleryRenderer.ts:468` and the board cover `<img>` (operator decision 4, recommended default: yes) |
| Risk | Mobile API misuse | Desktop-only call breaks mobile rendering | NFR-M01: no `electron`/`fs`/Node in the module; inherit `is-inline-overlay`; manual mobile pass |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Rendering a files column with dozens of attachments stays responsive; wikilinks resolve once per cell via `metadataCache.getFirstLinkpathDest` with no per-frame vault scans and no per-cell `adapter.exists` disk checks. Gallery cover I/O is `getResourcePath` for `src`, not a vault scan per frame.

### Security
- **NFR-S01**: No secrets or credentials; the module stores and renders vault wikilinks only — no Notion CDN URLs. A hand-edited URL in frontmatter is stripped at write (`normalizeCellValueForSave`) and skipped by the cover guard at the `renderCover` call sites (`GalleryRenderer.ts:442`, `BoardRenderer.ts:661`) when `image.external` is true, so a stale URL cannot become a network `<img>`.

### Reliability
- **NFR-R01**: Dangling wikilinks render as `internal-link is-unresolved` (Obsidian core styles it) rather than throwing; click no-ops. Malformed wikilinks render as a raw-text chip, never throw.

### Mobile
- **NFR-M01**: No `electron` / `fs` / Node in the new module; render/open APIs (`openLinkText`, `getFirstLinkpathDest`, `getResourcePath`, `setIcon`/`setTooltip`) are the same ones already used on phone layouts. Mobile inherits the existing inline overlay (`is-inline-overlay`), not a new bottom sheet; inline-edit is on unless the column key is a readonly `file.*` field.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Empty `string[]` renders `db-empty-value`, not an error (`CellRenderer.ts:151-152`).
- A single file and 50+ files both render within the responsive budget (NFR-P01): cap ~5 chips + `+N` overflow; tooltip lists every name.
- A non-image file in the cover slot (Sales PDFs) falls back to the `.is-empty` placeholder (`GalleryRenderer.ts:443-447`); the PDF stays a table chip. PDFs never become covers.
- Gallery/list/board card bodies (`GalleryRenderer.renderValue` / `ListRenderer.renderValue`) have no `files` case; arrays become `String(value)`. Acceptable if the files column is cover-only; add a `col.type === "files"` case calling `FilesColumn.renderChips` only if a finance gallery/list actually shows the column as a visible field. Do not pre-open those renderers.

### Error Scenarios
- A dangling wikilink renders `internal-link is-unresolved`; click no-ops; no throw (NFR-R01, Scenario 3). **Net-new.**
- A file missing from the vault (iCloud not yet downloaded) renders the chip from metadata-cache `TFile`; opening via `openLinkText` lets Obsidian materialize the placeholder. No `db-file-pending` overlay, no per-cell `adapter.exists` (NFR-P01).
- An unsupported codec (HEIC on Chromium desktop; WebKit mobile can paint it): keep `IMAGE_TARGET_RE` conservative; cover `<img>` `onerror` → `.is-empty` placeholder (`CoverImage.ts:13`). **Net-new** if the optional `onerror` is accepted.
- A malformed wikilink renders a raw-text chip, never throws (`FileFieldRenderer.ts:124-141`).
- A hand-edited URL in frontmatter: write-normalize strips URLs; cover adapter skips `external` so a stale URL cannot become a network `<img>` (NFR-S01).
- A gallery with no image files uses the configured fallback placeholder.

### Concurrent Operations
- Editing files while a gallery renders does not crash; rendering is a stateless read of `row.frontmatter` and commits are one atomic `processFrontMatter` write per save (`normalizeCellValueForSave` runs once per commit). No churny per-keystroke writes (iCloud-safe).

### Type Conversion / Import
- `PropertyService.convertValueForType` `default` passes arrays through (`PropertyService.ts:221-222`); optional `files → multitext` mapping (`PropertyTypeConflict.ts:73-76`) so Obsidian treats the array as a list property.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | One isolated module + 13th-type registration + one render case + insertion-only companions |
| Risk | 6/25 | Insertion-only diff; no network; no migrations; reuses existing cover pipeline |
| Research | 8/20 | 10-iteration deep research synthesized in `research/synthesis.md`; every call site cited |
| **Total** | **26/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

Operator decisions from `research/synthesis.md` (recommended defaults shown; the build proceeds on the defaults unless the operator overrides):

1. **Hold REQ-007 to three files, or include the tsc/UI insertions?** Default: **Include** — count `types.ts` + `ColumnTypes.ts` + `CellRenderer.ts` as the three named call sites; treat `PropertyTypeIcon.ts` as the same completeness class as `COLUMN_TYPE_LABELS` (else SC-001 fails) and the two picker lists as registry registration (else REQ-001 fails).
2. **i18n now vs `filesColumnLabel()` helper?** Default: **Add `columnType.files` in all three dictionaries** (en, zh-CN, zh-TW — `LocaleCode` is `system | en | zh-CN | zh-TW` but only three dictionaries exist at `i18n.ts:4361-4366`; place keys next to `columnType.rollup` siblings at `en:1332`, `zh-CN:2804`). Helper only if enforcing a literal three-file diff.
3. **HEIC/TIFF/ICO as cover-eligible?** Default: **No** — keep `IMAGE_TARGET_RE` conservative + `onerror`. PDFs stay chips.
4. **Put cover `onerror` in `GalleryRenderer.ts` this phase?** Default: **Yes** (one handler on `:468`) — the only cheap way to degrade HEIC on desktop without widening the regex.
5. **Auto-prefer files columns in `getDefaultGalleryImageField`?** Default: **Yes**, one `|| col.type === "files"` line (`DatabaseView.ts:9599-9602`).
6. **Map `files` → Obsidian `multitext`?** Default: **Yes** (`PropertyTypeConflict.ts:73-74`, relation precedent). Harmless if skipped.
7. **Per-file Notion menu + reorder?** Default: **Defer** — spec excludes upload UI; menus add commit paths. Chips + `openLinkText` satisfy SC-004.
8. **`db-file-pending` chip for iCloud placeholders?** Default: **Skip** — open-through-Obsidian is the safety story; per-cell disk checks violate NFR-P01.
9. **Image thumbnails in table cells this phase?** Default: **Yes if cheap** (`getResourcePath` + `isImageTarget`), else text chips are enough for REQ-005.
10. **Empty-aware sort (empty last ascending)?** Default: **Defer** unless a sort comparator already special-cases arrays. Empty/not-empty filter is already free (`types.ts:135`).
11. **Which fork tree?** Default: **`/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`** — all iteration citations verified there; the scaffold path in the original brief is not the live source.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research Synthesis (source of truth)**: `research/synthesis.md`
- **Research Evidence Trail**: `research/research.md`
- **Fork (live source)**: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin` (`src/data/EuroFormat.ts` is the isolated-diff model; `src/data/CoverImage.ts` is the reused cover pipeline)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-files-column-module/ | Isolated `FilesColumn.ts`: normalize vault wikilink `string[]`, edit serialize, resolve, classify, `renderChips` (cap 5, unresolved, optional thumbnails) | Complete |
| 2 | 002-files-type-registry/ | Register `"files"` as the 13th type across union, labels, icon, pickers, three i18n dictionaries, and `files` to `multitext` conflict | Complete |
| 3 | 003-files-cell-dispatch/ | CellRenderer `case "files"` chips, save-time URL strip, and `startEdit` wikilink text editor | Complete |
| 4 | 004-files-cover-wiring/ | Gallery/board cover guard skips `image.external` on files columns, `onerror` placeholder, auto-prefer files | Complete |
| 5 | 005-files-column-proof/ | Typecheck, grep, desktop/mobile, iCloud, and rebase-shape proof for REQ-001–007 and SC-001–004 | Complete |

Future / out of this phase (not child folders): gallery "N attachments" count badge; per-file Notion menu plus reorder; GalleryRenderer/ListRenderer card-body stringify unless a finance gallery shows the files column as a field; empty-aware sort; `db-file-pending` overlay; Notion CDN fetch; upload UI; widening `IMAGE_TARGET_RE` for HEIC/TIFF/ICO.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-files-column-module | 002-files-type-registry | `src/data/FilesColumn.ts` exists with `normalize`, `formatForEdit`/`parseEdit`, `resolveFileTarget`, `classifyFileType`/`isImageTarget`, `FILE_CHIP_CAP`, and `renderChips`; no `fetch`/`cdn`/`adapter.exists`/`electron`/`fs`; `FileFieldRenderer.ts` untouched | Scratch cases for `[]`, URL drop, duplicate targets, dangling dest, 50+ tooltip names (`EuroFormat.ts:1-42` isolation) |
| 002-files-type-registry | 003-files-cell-dispatch | `"files"` on the union, labels, `isColumnType`, default `[]`, icon name in `PROPERTY_TYPE_ICON_DEFS`, advanced picker + `PROPERTY_TYPES`, three `columnType.files` keys, `files` maps to `multitext` | `npx tsc --noEmit` passes before chips render; add-column shows a localized Files label (`types.ts:50`, `ColumnMenu.ts:261-264`) |
| 003-files-cell-dispatch | 004-files-cover-wiring | `case "files"` paints chips; `normalizeCellValueForSave` is the write gate; `startEdit` uses `formatForEdit`; mobile inherits `is-inline-overlay` | Empty `[]` is `db-empty-value`; typing `[[Sales.pdf]]` plus a URL stores only the wikilink (`CellRenderer.ts:185,2476-2482,449-524`) |
| 004-files-cover-wiring | 005-files-column-proof | Cover guard at both `renderCover` sites skips `image.external` when type is `"files"`; `<img> onerror` placeholder; auto-prefer `col.type === "files"`; `CoverImage.ts` untouched | Gallery with image + Sales PDFs, network off, shows the image; a hand-edited URL does not become a network `<img>` (`GalleryRenderer.ts:442-468`, `BoardRenderer.ts:661`) |
<!-- /ANCHOR:phase-map -->
