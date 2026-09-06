---
title: "Implementation Summary: Gallery Deprecation Docs and Release"
description: "README, CHANGELOG and package.json rewritten to stop offering the gallery; every 001-declared loss named individually rather than summarised; 030-gallery-view-deprecation closed against the retirement with its own measurements kept; release 0.0.28 recorded as the version that already carries the removal. Gate green, 26/26. Only the operator's own device confirmation is left."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "gallery docs summary"
  - "007 phase 4 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/004-docs-and-release"
    last_updated_at: "2026-09-06T00:30:00Z"
    last_updated_by: "gallery-007-004-docs-and-release"
    recent_action: "Wrote README/CHANGELOG/package.json, closed 030, recorded 0.0.28 release"
    next_safe_action: "None here — only the operator's own device confirmation closes the packet"
    blockers:
      - "The operator has not yet opened a migrated vault and reported it"
    key_files:
      - "README.md"
      - "CHANGELOG.md"
      - "package.json"
      - "../../005-component-surface-system/030-gallery-view-deprecation/spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-004-summary"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions:
      - "The in-app What's new modal stays out of scope, matching 006's 008 — README, CHANGELOG and the already-shipped per-view notice carry it"
      - "Is assets/screenshots/gallery-view.png deleted? No — left as history, per spec.md's own out-of-scope note"
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
| **Spec Folder** | 004-docs-and-release |
| **Completed** | Doc half complete 2026-09-06; release already shipped as 0.0.28 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The doc half of the retirement, written against the tree at `932fa3a9` (child `003`'s landing rebase
re-stamp) and the already-cut release **0.0.28** (`d3433d81`). Nothing in `src/` or `tools/` changed —
this phase's own scope boundary (§3 of `spec.md`) names `003` as having finished those.

### 1. `README.md` — four locations (T004, T005)

- **View count.** "Six database views... table, board, gallery, chart, calendar, or timeline" is now
  "Five database views... table, board, chart, calendar, or timeline" (`:22`), and the tagline
  ("Same notes. Six views.") and the "Six views, one vault" heading both moved to "Five".
- **Screenshot table.** The four-line Gallery row (`![Gallery view](assets/screenshots/gallery-view.png)`
  plus its caption) is removed whole. The Table/Board row and the Chart/Timeline row it sat between
  are untouched.
- **Page-preview prose.** "Table, Board, Gallery, Calendar, Timeline..." (`:87`) drops "Gallery".
- **Cover-settings prose.** `:120-121` and `:123` named the board and the gallery in the same
  sentence — the board half survives verbatim ("Database and board cover settings", "cover settings
  for board views", "across table and board views"), the gallery half is removed. The image files
  themselves (`en-dataset-covers-setting.png`, `gallery-view.png`) are untouched; only the prose that
  described what they show was in scope.

`rg -n -i gallery README.md` returns nothing after the edit.

### 2. `package.json` — the plugin `description` and `keywords` (T006)

The `description` field's "table, board, gallery, list, chart, calendar, timeline, inline markdown,
formulas, and source rules" drops "gallery, ". `"gallery"` is also removed from the `keywords` array —
not named in the spec's Files to Change table, but `rg -i gallery README.md package.json` (the
phase's own SC-001 and T012 verification command) checks the whole file, and a keyword list that
still names the gallery would fail that check even with the description fixed.

### 3. `CHANGELOG.md` — the `## 0.0.28` entry (T007)

Written from `001-usage-and-migration-audit/implementation-summary.md` §4 verbatim, not summarised.
All six `gallery*` `ViewConfig` fields are named individually, matching the audit's own three-way
split rather than one "some settings" line:

| Field | Disposition | Named as |
|---|---|---|
| `galleryImageField` | Fully carried | → `boardImageField`, in "What carries over" |
| `galleryImageAspectRatio` | Fully carried (by `002`) | → `boardImageAspectRatio` |
| `galleryImageFit` | Fully carried (by `002`) | → `boardImageFit` |
| `galleryImageAspectRatioPreset` | Softened | the resolved number carries, the preset name does not — in "What a board cannot show" |
| `galleryCardSize` | Genuine loss | no board equivalent — a kanban lane width is a structurally different control from a card grid |
| `galleryCardSizePreset` | Genuine loss | the board has no preset system at all |

The entry also states the rollback consequence REQ-003 requires: reinstalling an older plugin
version does not turn a migrated board back into a gallery, and the notice's own Undo action —
available immediately after migration — is the only reversal. That claim is scoped deliberately: the
migration code (`database-view.ts:2688-2720`) re-applies on every render for as long as a view's
persisted `viewType` reads `"gallery"`, so the wording says "immediately after migration" rather than
promising the undo stays available indefinitely, which the source does not support asserting.

The existing `## 0.0.23` entry's stale `(unreleased)` marker is also corrected — that release shipped
several versions ago (`d3979cf5`) — since leaving it would read oddly directly above a dated `0.0.28`
entry in the same file.

### 4. `030-gallery-view-deprecation` closed against the retirement (T008, T009)

Following `006`'s REQ-007 precedent for `033-list-virtualisation` and `024-list-view-freeze`:
`030/spec.md`'s frontmatter description and Status line now read Superseded, with a dated note citing
the commits that finished what `030` started (`fb27ba5b` for the renderer deletion, `932fa3a9` for
the re-stamp, `d3433d81` for the release). Two of `030/goal.md`'s six completion-criteria rows move —
renderer coverage and the re-verified gate, both resolved by child `003` — and `030/tasks.md`'s
T6-T8 (bench/captures/scenarios removed, renderer deleted, ratchet lowered) move from `[ ]` to `[x]`
with the same citations. **One row in each document stays open on purpose**: the operator opening a
previously-gallery database on their own device. The renderer that row depended on is now deleted, so
an undo can no longer restore a rendered gallery — only a board — and the row is noted as superseded
by this packet's own operator-confirmation criterion rather than silently ticked or deleted.
`005-component-surface-system/roadmap.md` §5.A's `030` row and `005/goal.md`'s own DONE-table row for
`007` are both trued up to match (`030` now **83% — 5/6**; `007` now **90% — 9/10**).

### 5. The release (T001, T014)

Release **0.0.28** was cut at `d3433d81` before this doc phase started — `git merge-base --is-ancestor`
confirms both `fb27ba5b` (the renderer deletion) and `932fa3a9` (child `003`'s landing re-stamp) are
ancestors of it, and `manifest.json`, `package.json` and `versions.json` all read `0.0.28` on the tree
today. Unlike `006`'s `008`, which prepared its docs and left the cut owed to the orchestrator's next
release, this phase's docs describe a removal that had already shipped by the time they were written —
the release is recorded here rather than requested.

### 6. ADR-001 taken (T010)

`plan.md`'s ADR-001 — whether an in-app "What's new" surface carries the retirement — is Accepted as
out of scope, matching `006`'s own disposition of the identical question. README, the CHANGELOG entry
and the already-shipped `notice.galleryMigrated` per-view toast carry it; a dedicated modal is a
separate feature surface with its own release-cut curation, not a documentation task.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `README.md` | Modify | Four gallery-naming locations updated; board half of each shared sentence kept |
| `package.json` | Modify | `description` and `keywords` drop "gallery" |
| `CHANGELOG.md` | Modify | New `## 0.0.28` entry; `## 0.0.23`'s stale `(unreleased)` marker corrected |
| `../../005-component-surface-system/030-gallery-view-deprecation/spec.md` | Modify | Superseded, with a dated closing note citing the commits |
| `../../005-component-surface-system/030-gallery-view-deprecation/goal.md` | Modify | Two completion-criteria rows resolved; the operator row left open with a note |
| `../../005-component-surface-system/030-gallery-view-deprecation/tasks.md` | Modify | T6-T8 closed with citations; T11 left open with a note |
| `../../005-component-surface-system/roadmap.md` | Modify | §5.A's `030` row trued up |
| `../../005-component-surface-system/goal.md` | Modify | The DONE-table row for `007` itself, trued up |
| `../goal.md` | Modify | Completion criteria 1-9 ticked with evidence; the operator row (10) left open; Progress table updated |
| `../roadmap.md` | Modify | Children table row 4 and the milestones table |
| `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` | Modify | Status, ADR-001, task checkboxes and AC-001 through AC-006 closed with observed evidence |
| `specs/005-component-surface-system/operator-checklist.md` | Modify | Regenerated by `tools/naming/build-operator-checklist.mjs` after the row edits above, required by the `operator-list` gate lane |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Read-then-write, in the order `plan.md`'s critical path names: confirmed `003`'s landing sha and its
ancestry into the 0.0.28 release commit first (`git merge-base --is-ancestor`, both directions
checked), then collected `001`'s declared-loss list from its `implementation-summary.md` §4 rather
than re-deriving it, then wrote README/CHANGELOG/package.json, then closed `030`, then re-derived the
`005` and `007` roadmap figures from each `goal.md`'s own checkbox count using the repository's own
regenerate-the-figure command rather than hand-computing a percentage. `npm run gate` was run clean
(no concurrent invocation) after the doc edits and after closing `030`, and a stray `operator-list`
red from a first pass was traced to `tools/naming/build-operator-checklist.mjs` needing a re-run after
several goal.md/tasks.md rows changed — regenerated, then gate re-run clean.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Quote `001`'s declared-loss list's three-way split rather than one "carried over" paragraph | REQ-002 requires each loss named individually; the audit already did the harder work of classifying which of the six fields are full carries, which are softened, and which are genuine losses, and collapsing that back into a summary would undo it |
| Scope the CHANGELOG's Undo claim to "immediately after migration" rather than an unqualified promise | Reading `database-view.ts:2688-2720` shows the migration re-applies on every render for as long as `viewType` reads `"gallery"`, so an unqualified "you can always undo it" claim is not supported by the source and was not written |
| Remove "gallery" from `package.json`'s `keywords`, though only `description` is named in `spec.md`'s Files to Change table | The phase's own verification command (`rg -i gallery README.md package.json`) checks the whole file; leaving the keyword would fail the very check this phase is scored against |
| Leave `manifest.json`'s `description` untouched, though it also names the gallery | Neither `spec.md` nor REQ-005 names it, and it is outside this dispatch's granted scope; named in Known Limitations rather than fixed silently |
| Close `030`'s renderer-coverage and gate rows but leave its operator-device row open | Those two rows were gated on the deletion, which happened; the operator row was never gated on anything this packet can do, and ticking it would misrepresent an operator action that has not occurred |
| Record the 0.0.28 release rather than cut a new one | It already exists, cut at `d3433d81` before this doc phase started, and ships children `001`-`003`; cutting a second release for documentation alone would not carry anything new |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `003` landed, and it is an ancestor of the release | `git merge-base --is-ancestor fb27ba5b d3433d81` and `... 932fa3a9 d3433d81` both confirmed |
| `rg -i gallery README.md package.json` | Returns nothing |
| `rg -c 'db-gallery' styles.css` | 0 (confirms child `003`'s own claim, re-checked rather than assumed) |
| Every `001` declared loss findable in `CHANGELOG.md` | All six `gallery*` fields present by name in the `## 0.0.28` entry |
| `manifest.json` / `package.json` / `versions.json` agree | All three read `0.0.28` |
| `npm run gate` | Exit 0 — **26/26 green**, read from `$?` directly (a first pass showed a stray `operator-list` red from an un-regenerated checklist; `tools/naming/build-operator-checklist.mjs` re-run, then gate re-run clean) |
| `validate.sh 004-docs-and-release --strict` | Run at authoring time; see the packet commit |
| `validate.sh 007-gallery-view-deprecation --strict` | Run at authoring time; see the packet commit |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **`manifest.json`'s own `description` still names the gallery.** It is the file Obsidian's
   Community Plugins browser actually reads, and it currently reads "...with table, board, gallery,
   chart, calendar, timeline, formulas, filters, and inline editing." Neither `spec.md`'s Files to
   Change table nor REQ-005 names this file — only `package.json` — so it was left alone rather than
   silently expanded into. Named here for whoever holds write authority over it next.
2. **`package.json`'s `description` and `keywords` still name `list`**, which `006`'s own docs-and-
   release phase never corrected either. Out of scope for a gallery-only retirement; named rather than
   fixed, matching scope discipline.
3. **The release cut is not this phase's own act.** Release 0.0.28 was already cut, by a session that
   also carried other, unrelated fixes recorded in its own commit history — this phase's CHANGELOG
   entry documents only the gallery retirement, the same single-topic convention `006`'s `0.0.23`
   entry used.
4. **The final row cannot be closed here at all.** The operator opening a migrated vault is the only
   thing that closes the packet, and no check in this repository substitutes for it. `030`'s own
   equivalent row is left open for the identical reason, noted as now asked in its permanent form by
   this packet.
<!-- /ANCHOR:limitations -->

---
