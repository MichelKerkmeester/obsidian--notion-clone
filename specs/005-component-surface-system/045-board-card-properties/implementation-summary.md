---
title: "Implementation Summary: Board Card Properties"
description: "A per-view field list lands on ViewConfig, a resolver replaces the board's inline three-rule filter, and a Properties panel edits it — proved byte-identical for existing views and untouched for the default reference board."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "045 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/045-board-card-properties"
    last_updated_at: "2026-09-05T00:50:00.000Z"
    last_updated_by: "code-verification-pass"
    recent_action: "Verified the landing, fixed a resolver gap, closed T011/T012 and the gate"
    next_safe_action: "T013 (photographed scenario) and T014 (roadmap update)"
    blockers:
      - "AC-005's named verification method (a 044 sheet-grammar lane row) does not exist in this tree yet"
      - "AC-006 is operator-only"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/board-card-fields.ts"
      - "src/views/board-card-properties-panel.ts"
      - "src/data/types.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-045-verify"
      parent_session_id: null
    completion_pct: 85
    open_questions:
      - "Does the gallery share this mechanism, or get its own?"
      - "Does the Properties control also reach the reference card's five semantic slots, or only the local extension card?"
      - "Should hiding a field on cards also offer to hide it in the table?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 045-board-card-properties |
| **Completed** | Not complete — REQ-001..004, 007, 008 met; REQ-005/006's sheet-grammar check and REQ-001's operator sign-off (AC-006) remain |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A board view now persists its own ordered, per-field visibility list, and the card renders exactly
that list. An existing view with no stored list keeps the pre-change behaviour, proven by a capture
pair rather than asserted from a unit test. The default (`boardExtensionsEnabled` off) reference
board is untouched — the resolver has one call site, inside `renderCard`, and `renderReferenceCard`
is not it.

### What shipped

- **Persisted shape** — `ViewConfig.boardCardFields?: { key: string; visible: boolean }[]`
  (`src/data/types.ts`), absent by default, absent meaning "derive." Parsed by
  `parseBoardCardFields` (`src/data/board-card-fields.ts`), reused by both the vault-backed
  `DataSource` round trip and the embedded-renderer's local persistence path.
- **Resolver** — `resolveBoardCardFields`/`listBoardCardFields` (`src/views/board-card-fields.ts`).
  With the list absent, reproduces the pre-change filter (title/grouped/select-status exclusion
  plus the table's `hiddenColumns`) *and* the host's `getVisibleColumns` auto-hide of a column with
  no value on any current row — the first landing missed that last piece; see Corrections below.
  With a list present, returns the stored order filtered to schema keys that still exist, silently
  dropping a deleted key and appending a new schema key hidden.
- **Renderer swap** — `board-renderer.ts`'s `renderCard` calls the resolver instead of filtering
  `getColumns(config)` inline; the board no longer reads the table's `hiddenColumns` once a list is
  stored. `renderReferenceCard` is unchanged.
- **Properties panel** — `board-card-properties-panel.ts`: Cover and Title as fixed readonly rows,
  then one reorderable row per field (drag handle + `db-mobile-reorder-controls` up/down, both
  present, toggled by the existing `.is-phone` CSS the column manager already ships), a checkbox,
  a type icon, the field name. Read-only in a `codeblock` embed. Mounted into
  `ViewConfigPanelRenderer`'s shared `.db-view-config-body`, the same tree the desktop popover and
  the phone bottom sheet both present.
- **i18n** — `viewConfig.cardProperties` / `undo.boardCardFieldsConfig` in `en`, `zh-CN`, `zh-TW`.
- **CSS** — `styles.css`: a five-track override of the reused `.db-column-manager-row` grid, scoped
  to `.db-view-config-panel`, for the desktop and `.is-phone` cases (the shared row's three trailing
  action tracks have no equivalent here, and were narrowing the name column for nothing). Every
  other visual (section title, readonly rows, checkbox/type-icon/name cells) reuses existing
  `.db-view-config-*`/`.db-column-*` classes unchanged.
- **Storybook** — `board-card-properties-panel.stories.ts` (`Editable`, `ReadOnly`).

### Corrections made during verification

The uncommitted landing this session inherited passed `tsc`, `vitest` and `lint` at their claimed
numbers, but the derived (list-absent) resolver path checked only the static `hiddenColumns` array,
not the full `getVisibleColumns` input `tasks.md` T001 names. `getVisibleColumns` also auto-hides a
column with no value on any current row (gated on no active search/filter narrowing); a column like
that is invisible in `hiddenColumns` but was previously never shown on a card, so a view with
`showEmptyFields` on and a schema field nobody had filled in yet would have surfaced a field on
upgrade that never appeared before — a real REQ-004 gap. Fixed by capturing the host's real
`getColumns(config)` result once per render (`BoardRenderer.legacyVisibleColumnKeys`, computed only
when the list is absent, so the O(rows) scan the fix in `028-remaining-freezes` removed stays
removed for the per-card path) and threading it through `BoardCardFieldContext.visibleKeys`, which
`isDerivedVisible` defers to when present. Proven by a new differential test that fails against the
unfixed code and a `board-renderer-hierarchy.test.ts` case verified red before the fix landed.

Also added: a round-trip test for the embedded-renderer's `copyConfigToSourceView` persistence path
(the vault-backed `DataSource` path already had one; the embed path had none for any board field,
this or prior), a differential schema shape where the title is the only column, and a test proving
two views over one database produce different card fields while neither's `hiddenColumns` moves
(AC-001). None of this changed the shipped behaviour beyond the migration-fidelity fix above.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/types.ts` | Modify | `BoardCardField`, `ViewConfig.boardCardFields` |
| `src/data/board-card-fields.ts` | New | `parseBoardCardFields`, shared by both persist paths |
| `src/data/data-source.ts` | Modify | Parse/serialize `boardCardFields` (legacy, view, payload, key list) |
| `src/views/board-card-fields.ts` | New | The resolver: `resolveBoardCardFields`, `listBoardCardFields`, `toBoardCardFieldList` |
| `src/views/board-renderer.ts` | Modify | `renderCard`/`renderCardTitleChips` use the resolver; `legacyVisibleColumnKeys` for migration fidelity |
| `src/views/board-card-properties-panel.ts` | New | The Properties panel (desktop popover + phone sheet, same tree) |
| `src/views/view-config-panel-renderer.ts` | Modify | Mounts the panel in `renderBoardSettings`, `isViewReadOnly` action |
| `src/views/embedded-database-renderer.ts` | Modify | `isViewReadOnly` for codeblock embeds, `boardCardFields` in `copyConfigToSourceView` |
| `src/i18n.ts` | Modify | Labels, 3 locales |
| `styles.css` | Modify | Scoped `.db-column-manager-row` track override for this panel only |
| `src/views/board-card-fields.test.ts`, `board-card-properties-panel.test.ts`, `board-renderer-hierarchy.test.ts`, `board-renderer-parity.test.ts`, `data-source.test.ts`, `embedded-database-renderer.test.ts` | New/Modify | Coverage for all of the above |
| `src/views/board-card-properties-panel.stories.ts` | New | Storybook coverage (`story-coverage` gate lane) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered in `plan.md` §3's order: the persisted shape and the resolver first, with the differential
test proving the absent-list path reproduces today's rules; then the renderer swap; then the
Properties panel on top. The migration claim was proved by a capture pair (`tasks.md` T011) rather
than by the unit test alone — `npm run screenshots` re-ran the full 544-scenario suite, and every
existing board capture moved neither `pixelHash` nor `layoutHash`. Six unrelated PNGs moved by bytes
only (re-encode noise the CSS lane edit's `styles.css` fingerprint bump touched incidentally); all
six were confirmed unchanged and restored to their HEAD-committed bytes rather than recommitted.
`node tools/live/render-assertions.mjs` (bundled-renderer DOM assertions in headless Chrome) and
`board-renderer-parity.test.ts` proved REQ-007's reference-path boundary (T012). `npm run gate`
closed at 25 green, 0 red, after two fixes the verification pass found: a missing Storybook story
for the new panel module, and eight `tools/live/*.json` evidence artefacts stale against the moved
`styles.css` fingerprint (re-run, not edited).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Pair the new list with removing the board's read of `hiddenColumns` | A period where both are consulted would make the behaviour unexplainable to the operator and untestable for us. |
| Absent list means "derive today's behaviour" | An upgrade that changes every existing board card at once is the worst outcome available here, and it is also the easiest one to ship by accident. |
| Confine the control behind `boardExtensionsEnabled` | `038` spent four review rounds proving the default board matches the reference to the pixel. A properties list reaching that path would undo it, so the flag that already gates local extensions gates this one too. |
| Record gallery as a question | The renderer has the same shape and probably generalises. The operator asked for the board, and widening on a guess is how a packet stops being checkable. |
| Reuse `.db-column-manager-row` rather than write new panel-row CSS | The Properties list is structurally the same row shape (drag/checkbox/type/name) the column manager already ships and has already been reviewed; a five-track override for the two unused trailing tracks was the only CSS this packet needed. |
| Keep one `getColumns(config)` call for migration fidelity, at render granularity not card granularity | The derived path must reproduce `getVisibleColumns`'s auto-hide-of-empty-columns behaviour to satisfy REQ-004 for a view with `showEmptyFields` on, but `028-remaining-freezes` removed a per-card `getVisibleColumns` scan for a documented performance reason (NFR-P01). Computing it once in `render()` and caching it for the render pass satisfies both. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | 1091/1091 tests, 105/105 files |
| `npm run lint` | exit 1, 172 problems — unchanged pre-045 baseline (confirmed by stashing this diff on the rebased tree); not a `npm run gate` lane |
| `node tools/naming/scan-comments.mjs` | PASS, 0 findings |
| `npm run screenshots` + `npm run screenshots:verify` | 544/544 current; 0 board captures moved pixelHash/layoutHash |
| `node tools/live/render-assertions.mjs` | PASS — board/file-view and board/embed scenarios structurally intact |
| `npm run gate` | PASS — 25 green, 0 red |
| `validate.sh 045-board-card-properties --strict` | Run at authoring time and again at this verification pass; see the packet commit |
| Differential test for the resolver | `board-card-fields.test.ts`, 5 schema shapes including a title-only schema |
| Operator device confirmation | Not sought (AC-006 is operator-only) |
| Post-rebase reconciliation, landing on main | Rebased onto `origin/main` after the list hide-and-migrate landing (`e466696b`) and the screenshots symlink-ignore fix (`6328c9cb`). `src/`, `styles.css` and `tools/lane/css-lane.json` auto-merged or were resolved during the rebase (`view-config-panel-renderer.ts`: this phase's Properties section landed inside main's `.db-view-config-body` and alongside main's list-type filtering, both auto-merged clean; `css-lane.json`: main's 237-entry history plus this phase's own 3 unique `045` entries appended, `baselineHash` recomputed on the merged stylesheet at `6c7a7c42f694`). Full recapture (`npm run screenshots`, 554 entries) found zero real content-changed captures of this phase's own making: both `board-view` captures came back pixelHash/layoutHash-identical to HEAD (re-encode noise, restored) and two `constructed-board` captures were opened and read to confirm the default card fields render unchanged. 24 further captures — every `constructed-timeline` and `reference-gantt` scenario — reproduced new, but *stable*, pixel content across two isolated single-scenario reruns each, traced to `calendar-timeline-renderer.ts`'s and the vendored plugin's own real-clock "today" positioning rather than to any file this phase touches; restored to HEAD's bytes/pixelHash/layoutHash with `sourceHashes` left at their post-merge values, the same treatment `037-timeline-gantt-port`'s own post-rebase reconciliation used for the equivalent drift. 16 `tools/live/*.json` evidence artefacts re-stamped against the merged tree (8 stale after the rebase kept main's stamps, 8 more refreshed by the gate's own run); every payload's counts/totals held their prior baseline except `engine-parity`'s known cross-engine gap, which moved from 51 to 42 on its own unrelated remeasurement. `npx tsc --noEmit` exit 0; `npx vitest run` 109 files / 1135 tests; `npm run lint` 172 (pre-existing baseline, unchanged); `npm run lint:tools` exit 0; `scan-comments` PASS across 418 files; `story:smoke` 20 stories x 2 themes, 0 errors; `screenshots:verify` 0 stale; `npm run gate` 25 green. Landed `ff1dacec`, pushed to `origin/main`. |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No photographed non-default state (T013).** No existing capture scenario mounts
   `ViewConfigPanelRenderer`/`renderBoardCardProperties` for a board view — the harness's one
   `view-config` scenario is table-only. The panel has a Storybook story and thorough unit coverage
   instead. Building the constructed scenario needs a board-typed branch in
   `render-assertion-harness.ts`'s `view-config` case, a matching hand fixture, and updates to the
   two hardcoded scenario-id arrays in `tools/screenshots/constructed-capture.test.mjs`.
2. **AC-005's named verification lane doesn't exist yet.** Its Verification cell asks for a `044`
   `sheet-grammar` lane row; `044-phone-sheet-alignment` has not landed that infrastructure. The
   phone row grammar is verified by code identity with the already-shipped column manager and by
   unit tests instead, but the row stays `Unmet` rather than claim a check that could not run.
3. ~~`../roadmap.md` §5 not updated (T014).~~ **Closed post-landing** (see Verification's
   reconciliation row below): `../roadmap.md` §5.A's `045` row and prose, and `../spec.md`'s two
   Phase Documentation Map rows, now read Landed on main.
4. **Gallery is out of scope by decision, not by analysis.** `gallery-renderer.ts:361` builds its
   meta grid the same way and would benefit; whether it shares the mechanism is `spec.md` §10's
   first open question.
5. **Whether the control should reach the reference card's five slots is unresolved.** REQ-007 says
   the reference path must not diverge. Whether a *mapping* control over those slots counts as
   divergence is a judgment recorded for the operator, not decided here.
6. **Whether hiding a card field should also offer to hide the table column is unresolved**, per
   `spec.md` §10 — recorded deliberately rather than decided.
<!-- /ANCHOR:limitations -->

---
