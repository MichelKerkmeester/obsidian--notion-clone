---
title: "Implementation Summary: Gallery Usage and Migration Audit"
description: "The three-direction enumeration ran. Two accepting surfaces survive (one the parent named, one this audit found), the migration is built and missing only the embedded-host call a sibling packet already shows how to write, four of six gallery capture ids share board coverage, and 0 gallery-configured views exist in the operator's own vault today."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "gallery audit summary"
  - "007 phase 1 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/001-usage-and-migration-audit"
    last_updated_at: "2026-09-05T08:00:00Z"
    last_updated_by: "audit-run"
    recent_action: "Ran the surface sweep, captures, losses and vault count for the gallery audit"
    next_safe_action: "002-settings-redirect-and-migrate can start from this phase's findings"
    blockers: []
    key_files:
      - "scratch/surface-list.md"
      - "scratch/capture-classification.md"
      - "scratch/measurement-inventory.md"
      - "scratch/declared-losses.md"
      - "src/data/gallery-migration.ts"
      - "src/views/embedded-database-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-001-summary"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "DatabaseViewType union and accepting-surface wiring left to 002/003, see body §1"
    answered_questions:
      - ".base importer confirmed fixed; second accepting surface found; see body §1, §7"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 001-usage-and-migration-audit |
| **Completed** | 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The audit ran, from the sources the plan named, against the tree at `b240a8d5`. Nothing in `src/` or
`tools/` changed — this document plus `scratch/*.md` are the entire output, per goal D1.

### 1. Surface list (T004, T005) — full detail in `scratch/surface-list.md`

**Every minting surface is already closed** (§1 of the scratch file): the two pickers `030` closed,
`settings.ts:79`'s `DEFAULT_VIEW_TYPES` (a third already-closed surface this audit found, undocumented
until now — its own comment states "Gallery and list stay out... never offered when creating
something new"), and the `.base` importer, whose fix the parent's first draft flagged as a
correction and this audit **confirmed by reading the function**: `main.ts:1568` computes
`const viewType = bv.type === "cards" ? "board" : "table"` — no branch ever produces `"gallery"`.

**Two accepting surfaces survive**, one the parent named and one this audit found:

- `main.ts:146`/`:182` — the settings-load sanitizer, as the parent's completion criteria already
  named.
- **`src/data/data-source.ts:1527-1529` `parseViewType()`** — not named in the parent's `spec.md` §4.
  It gates every `viewType` value parsed from a `db_view: true` file's frontmatter, the **primary**
  per-file read path (called from `main.ts:661`/`:671` on every relevant file read), and it accepts
  `"gallery"` today.

**Neither can be closed the way `006`'s `e0e1c568` closed the parallel `list` exemption on this same
`main.ts` line.** List's migration target (`table`) equals the unknown-type fallback, so deleting the
exemption cost nothing. Gallery's target is `board`; deleting the exemption would coerce every future
load straight to `table` **before** `migrateGalleryViewOnOpen` runs, silently dropping
`galleryImageField`. Full reasoning in `scratch/surface-list.md` §2.1.

**The migration itself is built, not missing.** `src/data/gallery-migration.ts` (`030`, shipped) and
`database-view.ts:2718-2728`'s `migrateGalleryViewOnOpen()`, called from `refresh()` at `:11678`, are
both live. The gap is exactly where the parent's open question said it was:
`embedded-database-renderer.ts` has zero equivalent call. What the parent's question did not know is
that the **exact shape to close it already ships**, for `list`, in the same file:
`migrateListViewOnOpen(config)` at `:776-800`, built by `006`'s `e0e1c568`. `002` has a working
transplant target, not a design problem.

### 2. Capture classification (T006) — full detail in `scratch/capture-classification.md`

All 24 gallery-touching manifest entries read against their scenario definitions, not just their
`sources` arrays. **2 ids (8 entries) are gallery-only** and delete cleanly: `gallery-view`,
`constructed-gallery` — confirmed `gallery-render-bench.ts` is cited by no other scenario, so nothing
needs re-pointing the way `006`'s shared list bench did. **4 ids (16 entries) are board-shared**, each
confirmed by reading its `html()`, not inferred from the `sources` array:

- `card-cover-states` renders a board card and a gallery card **side by side on purpose**, to catch a
  divergence between their empty-cover glyphs (24px vs 28px) — and it is the ONLY capture in the
  corpus exercising `.db-board-card-cover`/`.db-board-card-cover-placeholder` at all. Deleting it
  wholesale would silently zero the board's own empty-cover coverage, which is the parent roadmap's
  named trap, now located precisely rather than left as a warning.
- `chrome-group-selection-controls`'s `html()` is exactly `galleryGroupHeader(...)` +
  `boardSubgroupHeader(...)`. The surgical-removal pattern `003` needs is already proven **in this
  same file**: `touch-targets-baseline.json` records that `006/007` already removed list's host from
  this fixture while keeping gallery's and board's.
- `constructed-card-covers` and `constructed-group-selection-controls`'s PNGs are **already
  board-only** by their own authored notes ("the gallery's empty cover is asserted by
  `constructed-state-assertions` rather than photographed here"); the gallery half to remove lives in
  `tools/live/constructed-state-assertions.mjs:109,112`, not in these two manifest entries.

### 3. Measurement inventory (T007) — full detail in `scratch/measurement-inventory.md`

`renderer-coverage.json` pins 2 files, `"constructed": 6, "total": 21"`, note `"was 7/22; list
renderer retired"` — the idiom `003` repeats: `5/20`, `"was 6/21; gallery renderer retired"`. The gate
lane that owns this file is `render-assertions` (`tools/gate.mjs`'s lane list has no literal
"gallery" or "renderer-coverage" name — the same shape `006` found for its own gate lane). Beyond the
renderer/bench/driver, the measurement surface is: `render-assertion-harness.ts` (37 mentions, a
`galleryAssertions()` function, a renderer-union member), `render-assertion-bundle.mjs` (3 scenario
bags), `render-assertions.mjs` (2 assertion-array keys, cites the bench directly),
`constructed-state-assertions.mjs` (2 non-photographed DOM assertions), the 3 `screenshots/
scenarios/*.mjs` definitions, `verify-placement.mjs` (a `SELECT_FIXTURE` entry, a `VIEW_TYPES`
member, one fixture object), and one gallery-exclusive unit spec (`gallery-migration.test.ts`; the
renderer itself has no dedicated unit spec — its only measured coverage is the constructed/
render-assertion path and the manifest captures).

`card-bench-driver.mjs` is confirmed **shared** with `run-board.mjs`, `run-calendar.mjs`, and
`run-timeline.mjs` — deleting `run-gallery.mjs` in `003` does not touch it.

### 4. Declared-loss list (T008) — full detail in `scratch/declared-losses.md`

Of the six `gallery*` `ViewConfig` fields: **1 is fully carried today** (`galleryImageField` →
`boardImageField`). **2 have a board equivalent the migration does not yet carry**
(`galleryImageAspectRatio` → `boardImageAspectRatio`, `galleryImageFit` → `boardImageFit` — both
consumed by an identical expression in both renderers, confirmed by reading `board-renderer.ts:1681,
1683` against `gallery-renderer.ts:613,771`). **2 are genuine declared losses with no board
equivalent at all**: `galleryCardSize` (the board's `boardColumnWidth` sizes a kanban lane, a
structurally different layout from a responsive card grid — not a rename) and
`galleryCardSizePreset` (the board has no preset system). **1 is a softenable declared loss**:
`galleryImageAspectRatioPreset` has no board preset equivalent, but its resolved numeric value could
be folded into the `boardImageAspectRatio` carry at migration time, keeping the visual result while
losing the preset label.

**This sharpens the parent's own inventory claim.** The parent's `spec.md` §4 said "nothing
enumerates the other five fields" — this audit enumerates them and finds the picture is not "five
losses": it is two fixable gaps, two real losses, and one partially-fixable loss. `004`'s CHANGELOG
should not merge these into one "some settings" line (parent REQ-007); `scratch/declared-losses.md`'s
closing section gives five individually quotable sentences.

### 5. Vault usage (T009)

The operator's iCloud vault (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel
Kerkmeester/`), read-only: 244 `.md` files. `grep -rlE "^db_view:\s*true"` finds exactly **1** file:
`Database Testbed/Testbed.md`. It defines **5 views today**: `table`, `board`, `calendar`, `timeline`,
`chart` — **0 carry `viewType: gallery`, and 0 carry `viewType: list`.** A search for the plugin's two
embedded-codeblock fence names (`note-database`, `database-view`), scoped to `.md` files, returns
**0** files (the same search without the `.md` scope returned 14 — all inside
`.obsidian/plugins/note-database/.backup-*/main.js`, the plugin's own compiled bundles, a methodology
trap worth naming since an unscoped search would have reported a false 14 rather than the true 0).
`.obsidian/plugins/note-database/data.json` `"databases": []`, same as `006`'s finding.

**Reported honestly rather than reconciled**: `006`'s own audit of this same file found 6 views
including a `list`-typed "Punch List." That view is absent today, and so would be any gallery view if
one had existed at that same read. Two candidate explanations, neither confirmable from a static
file read: the file was opened live at least once since `006`'s audit (letting `migrateListViewOnOpen`
fire and, if a gallery view existed even earlier, letting `030`'s already-shipped
`migrateGalleryViewOnOpen` fire before that), or the file was hand-edited. **What is confirmed rather
than inferred: 0 gallery-configured views exist in the operator's vault today**, and that is a
genuine count, not an absence of evidence — the file was read successfully and its 5 views enumerated
by name and type.

### 6. Embedded-codeblock asymmetry (T010)

`applyGalleryMigration`/`migrateGalleryViewOnOpen` have exactly one call site:
`src/views/database-view.ts:11678`. `rg -n "migrateGalleryViewOnOpen\|applyGalleryMigration"
src/views/embedded-database-renderer.ts` returns nothing. The asymmetry is real and is inherited from
`030`, exactly as the parent's goal recorded. What the parent's record did not have: `006` already
closed the identical gap for `list` in the same file (`migrateListViewOnOpen(config)` at
`embedded-database-renderer.ts:742,776-800`), giving `002` a working shape to copy rather than a
design decision to make.

### 7. Parent inventory reconciliation (T014)

The goal's own precedence rule says the child is right where it disagrees with the parent's `spec.md`
§4 summary, and two corrections are due there: extend the `data-source.ts` row to name
`parseViewType()` (`:1527-1529`) as a second accepting surface, and add a note that `settings.ts:79`'s
`DEFAULT_VIEW_TYPES` is a third already-closed minting surface. **Both corrections are recorded here
in full (§1 above) rather than applied to `../spec.md` directly**: this dispatch's write authority is
scoped to this child folder plus the parent's `roadmap.md` status row, not the parent's `spec.md`, so
editing §4 itself would exceed that grant. `roadmap.md`'s row for this child is updated instead, and
names both corrections so whoever holds write authority over the parent `spec.md` can apply them
verbatim from this document.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none in `src/` or `tools/`) | — | Read-only phase, confirmed in Verification below |
| `scratch/surface-list.md`, `scratch/capture-classification.md`, `scratch/measurement-inventory.md`, `scratch/declared-losses.md` | Create | This phase's actual output |
| `implementation-summary.md` (this file) | Modify | The three lists plus vault usage and the embedded-asymmetry finding |
| `../roadmap.md` | Modify | Child 1's status row, including the T014 corrections for `../spec.md`'s owner to apply |
| `tasks.md` | Modify | Checkboxes ticked against the evidence above |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Per `plan.md` §3: the surface list came from grepping the literal string first, then sweeping every
`.viewType =` assignment, every `viewType:` object-literal/type site, and every `DatabaseViewType`
reference (`scratch/02-viewtype-assignment-sweep.txt`) — the sweep is what caught the second
accepting surface the literal-only pass and the parent's own first draft both missed. The capture
classification came from reading each of the 24 entries' scenario definition rather than trusting its
`sources` array. The declared-loss list came from reading both renderers' actual field consumption,
not from field-name proximity. The vault count came from the same read-only route `006`'s audit used,
with the unscoped-grep methodology trap caught and corrected before being reported.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Report the two accepting surfaces as "must stay open until migration is proven," not as open violations of REQ-001 | Closing either the way `list`'s exemption was closed would coerce a persisted gallery to `table` before the on-open migration ever runs, which is worse than today's state, not a fix for it |
| Classify captures by reading `html()`, not by `sources` array | `constructed-card-covers` and `constructed-group-selection-controls`'s `sources` name `gallery-renderer.ts`, but their own authored notes say the photograph is already board-only — the array alone would have overstated the gallery risk in those two entries |
| Name `settings.ts:79` as an already-closed minting surface even though it needed no action | The completion criteria ask for a full enumeration, and a surface the sweep found but the literal grep would have missed is exactly the class of result this phase exists to produce, closed or not |
| Split the six declared-loss fields into three dispositions instead of one "five losses" bucket | Two fields have an exact-match board equivalent the migration simply does not carry yet; conflating them with the two genuine structural losses would misstate `002`'s actual remaining work |
| Report the vault count as 0 with an honest note about the discrepancy from `006`'s prior finding, rather than reconciling it | Neither candidate explanation is confirmable from a static file read; asserting one would be inferring past what the evidence supports |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Surface sweep beyond the literal string (T004) | Run — `scratch/02-viewtype-assignment-sweep.txt`, 161 lines covering every `.viewType =`, `viewType:`, and `DatabaseViewType` site in `src/` |
| Capture classification (T006) | Run — all 24 entries read against their `html()`, not inferred from `sources` |
| Measurement inventory (T007) | Run — `scratch/measurement-inventory.md`, cross-checked against `rg -il gallery tools` returning 31 files |
| Declared-loss list (T008) | Run — `scratch/declared-losses.md`, each of the six fields checked against both renderers' actual consumption |
| Vault usage (T009) | Run — 0 gallery views, 0 embedded codeblocks (methodology trap caught: unscoped grep first returned 14 false positives from compiled plugin backups) |
| Embedded-codeblock finding (T010) | Run — confirmed by grep returning zero matches, and the working `list` transplant target named with its exact location |
| Parent reconciliation (T014) | Run — corrections recorded in §7 above and in `../roadmap.md`'s row for this child; `../spec.md` itself is outside this dispatch's write authority |
| Read-only claim (T012) | `git diff --stat -- src tools` against this phase's own commits: empty. Confirmed at authoring time |
| `validate.sh 001-usage-and-migration-audit --strict` | Run at authoring time; see the packet commit |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Vault usage is one data point in one vault**, exactly as `006`'s equivalent audit noted for
   itself. It shows 0 gallery views today, in a file built to exercise every view type on purpose —
   informative about this operator's exposure, silent about anyone else's.
2. **The 6-views-to-5-views discrepancy against `006`'s prior audit of the same file is unresolved.**
   Named in §5 above rather than guessed at.
3. **Whether `002` should wire the migration into the two accepting surfaces or leave them inert is a
   recommendation, not a decision this phase is positioned to make** — it depends on how `002` chooses
   to sequence the settings-load path against the on-open path, which is implementation detail this
   audit's scope (read-only, goal D1) does not reach.
<!-- /ANCHOR:limitations -->

---
