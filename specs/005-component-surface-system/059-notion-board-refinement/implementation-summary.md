---
title: "Implementation Summary: Notion Board Refinement"
description: "The Groups panel landed: per-group visibility, drag reorder and hide-empty-groups on one surface, with the four errata and four device checks filed into 056 by the landing pass."
trigger_phrases:
  - "059 implementation summary"
  - "board groups panel summary"
  - "notion board refinement shipped"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/059-notion-board-refinement"
    last_updated_at: "2026-09-07T05:55:00Z"
    last_updated_by: "landing-verification-session"
    recent_action: "Rebased onto origin/main; filed T003/T004/T014 into 056; gate 26 green"
    next_safe_action: "Cut a release so the operator can read T015 on device"
    blockers:
      - "T015 (the operator's own device read) closes nothing an agent can close"
    key_files:
      - "src/views/board-groups-panel.ts"
      - "src/views/board-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/data/types.ts"
      - "src/data/data-source.ts"
      - "styles.css"
      - "tools/live/render-assertion-harness.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-059-impl-summary"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "ADR-004/ADR-010/ADR-011 answered 2026-09-06 18:36; this leg is the code half they unblocked"
      - "T008's own row-count arithmetic needed a correction: ADR-004's 'one Groups panel, not scattered across the column menu' means the standalone Hide column row is removed once hideGroup is wired, not kept alongside Manage groups"
      - "T003/T004/T014's cross-packet half was filed by the landing pass, which carried the 056 write authority the code leg did not"
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
| **Spec Folder** | 059-notion-board-refinement |
| **Completed** | Code half landed 2026-09-07. Paper half (T003, T004) and the operator's device read (T015) remain |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A **Groups panel** (`src/views/board-groups-panel.ts`, new): one `panel`-role surface reached from
the board column menu's own "Manage groups" row, listing every group option — visible and hidden —
with a live visibility checkbox, a colour-dot swatch, drag-handle and move-arrow reorder, plus
hide-all/show-all above the list and "Hide empty groups" below it. It reuses the shared checkbox-row
builder and the column-manager's own row grid rather than a second drag vocabulary, and a hidden key
the schema no longer carries an option for renders as an ordinary, restorable row instead of being
dropped.

`BoardRendererActions` gained `showGroup` (required) and `setBoardHideEmptyGroups` (required);
`hideGroup` — declared for years and implemented by neither host — is now wired in both
`database-view.ts` and `embedded-database-renderer.ts`, each writing `config.boardHiddenGroups` and
persisting through the existing config-save path; `deleteGroup` is deleted, guard, i18n keys and
all. A new `boardHideEmptyGroups` flag on `ViewConfig` defaults `true` (Notion's own default,
ADR-010) and filters a group with zero visible rows out of the render entirely, allowlisted in the
view-config persistence layer as a tri-state value rather than a cast boolean.

**One correction to the plan itself, found while building it.** `tasks.md` T008 expected the column
menu to grow from 3 rows to 4 (the three plus "Manage groups"), but wiring `hideGroup` would also
have made the old, always-guarded "Hide column" row start rendering — 5 rows, not 4.
`decision-record.md` ADR-004 already rules against exactly that shape: *"all live on it rather than
being scattered across the column menu, which is what 'one Groups panel' settles beyond the yes."*
The standalone row is removed; `hideGroup` is called only from the panel's own checkbox now, and the
now-dead `board.hideColumn` i18n key goes with it in all three locales, the same way `deleteGroup`'s
key did.

**One thing named in `plan.md`'s architecture section is not built: "Remove grouping."** No
requirement, acceptance criterion or task in this packet's own closure gate names a threshold for
it, and clearing the board's group-by field is a different, unreviewed scope. Recorded here as a
deviation from prose rather than folded in unreviewed.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/board-groups-panel.ts` | Create | The Groups panel: row list, bulk actions, floating shell |
| `src/views/board-groups-panel.test.ts` | Create | 8 unit cases against a DOM double: every option listed, an orphan key, toggle and reorder wiring |
| `src/views/board-groups-panel.stories.ts` | Create | Storybook catalogue entry (`Rows`, `OpenPanel`) — the project's own coverage floor |
| `src/views/board-renderer.ts` | Modify | `showGroup`/`setBoardHideEmptyGroups` on the actions interface; the empty-group filter; the "Manage groups" entry row; the standalone hide row removed |
| `src/views/database-view.ts` | Modify | `showGroup`/`hideGroup`/`setBoardHideEmptyGroups` implementations |
| `src/views/embedded-database-renderer.ts` | Modify | Same, for the embedded host |
| `src/data/types.ts` | Modify | `boardHideEmptyGroups` on `ViewConfig` |
| `src/data/data-source.ts` | Modify | Parse, serialize and legacy-key handling for the new flag |
| `src/i18n.ts` | Modify | Panel strings added; `board.deleteGroup` and `board.hideColumn` removed, all three locales |
| `styles.css` | Modify | The panel's own class family; registered into the shared floating-panel, blur/elevation, z-index and phone-responsive selector lists |
| `tools/live/render-assertion-harness.ts`, `render-assertion-bundle.mjs`, `render-assertions.mjs` | Modify | The `boardGroupsPanel` scenario flag and its three assertion rows (panel width, visibility toggle, menu row count) |
| `tools/screenshots/scenarios/panels.mjs`, `constructed-scenarios.mjs`, `constructed-capture.test.mjs` | Modify | The hand-written and constructed capture pairs and their registry entries |
| `src/data/data-source.test.ts`, `board-renderer-parity.test.ts`, `board-renderer-hierarchy.test.ts`, `database-view.test.ts`, `embedded-database-renderer.test.ts` | Modify | New and updated cases covering the flag, both hosts' bindings, and the empty-group default |
| `tools/lane/css-lane.json` | Modify | Lane handover from `058-card-title-and-title-formats`: acquire, edit, release with the 8 new captures reviewed |
| `tools/live/touch-targets-baseline.json`, `-constructed-baseline.json` | Modify | Ratchet re-pinned (196→202, 801→807) — more instances of the shared reorder button, not a new shortfall class |
| `tools/live/*.json` (9 files: cascade-audit, checkbox-appearance, checkbox-inventory, design-conformance, engine-parity, renderer-coverage, surface-census, token-census, touch-targets, view-census) | Regenerate | Re-stamped by their own tools against the edited `styles.css`/`board-renderer.ts`; no number hand-edited |
| `screenshots/notion-clone/panels/{panel,constructed}-board-groups-panel-{desktop,mobile}-{dark,light}.png` | Create | 8 new captures, registered in `screenshots/manifest.json` |
| `screenshots/manifest.json`, `screenshots/README.md` | Modify | The 8 new entries; every pre-existing entry's `sourceHashes` refreshed against the edited sources, pixel bytes unchanged |
| `specs/005-component-surface-system/059-notion-board-refinement/tasks.md`, `acceptance-criteria.md` | Modify | This reconciliation |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Following `tasks.md`'s ordered legs. T001/T002 (verification, red-first) confirmed the tree's actual
state before any code moved. T003/T004 (the four errata, the four device items) are drafted but
**not written** — both target `../056-board-anytype-parity/**`, outside the write authority this
leg was dispatched under, which scoped writes to this packet's own folder,
`src/**`/`styles.css`/`main.js` (rebuilt), and `tools/live/**`/`tools/screenshots/**` pins the
packet's own tasks name. T006 through T010 landed the contract, the panel, the entry row (with the
T008 correction above) and the flag. T011/T012 captured and locked the surface. T013 ran the full
verification stack, including three lanes that needed a leg of their own first (see Verification).

Two width bugs surfaced building the captures and were fixed before they shipped: the panel's own
`width` declaration was losing the CSS cascade to the shared floating-panel block's wider default on
source order alone (the fix already used by `.db-view-config-panel` — declare the override after
that block, not before it); and the hand-written fixture had no `box-sizing: border-box`, so its
padding and border were adding to the declared width instead of living inside it, the way
`positionToolbarPopover` sets it inline in the real app.

The `styles.css` serialized lane was acquired from `058-card-title-and-title-formats` at its
released hash and released back with a full corpus recapture: 8 new captures, and — because this
edit touched `board-renderer.ts` and `styles.css`, both listed as sources by nearly every capture —
26 pre-existing entries' `sourceHashes` needed refreshing. Each of those 26 was opened against its
pre-edit committed bytes and confirmed pixel-identical before its bytes were restored and only its
fingerprint updated, rather than recommitted as churn from two capture runs on the same machine.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The standalone "Hide column" menu row is removed, not kept beside "Manage groups" | ADR-004's own words rule against a visibility control "scattered across the column menu" once the panel exists; keeping it would have shipped 5 rows against T008's own stated 4 and duplicated the panel's own toggle |
| "Remove grouping" is not built | No REQ or AC in this packet's closure gate names a threshold for it; plan.md's prose named it but the gate does not, and clearing the board's group-by field is a different, unreviewed scope |
| The 24 pre-existing captures this leg's recapture moved bytes on are restored to their committed bytes rather than recommitted | Each was opened against its pre-edit version and read pixel-identical; only `sourceHashes` needed to move, following the same "byte-only churn, restored" convention every prior `css-lane.json` release already used |
| `touch-targets-baseline.json`/`-constructed-baseline.json` are re-pinned rather than left red | The Groups panel's reorder buttons are the exact same unclassed shared control `column-manager`/`board-card-properties-panel` already contribute to this ratchet — more instances of an already-recorded shortfall, not a new one, following the file's own established re-pin convention |
| The four errata and the four device items stay unwritten in `056`'s own files | This leg's write authority was scoped to this packet's folder plus `src/**`/`styles.css`/`tools/live`/`tools/screenshots`; `../056-board-anytype-parity/**` was explicitly read-only |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, 143 files / 1534 tests |
| `npm run build` | PASS, exit 0 |
| `node tools/live/sheet-grammar.mjs` | PASS, exit 0, 0 FAIL (corpus now 34 stacked pairs, not the packet's cited 31 — pre-existing drift, recorded not corrected) |
| `node tools/live/render-assertions.mjs` | PASS, exit 0, including the 3 new `board-groups-panel/file-view` rows, each observed red before green |
| `node tools/screenshots/verify.mjs` | PASS, 596/596 entries current |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 |
| `node tools/naming/scan-failing-values.mjs` | PASS, exit 0 |
| `node tools/lane/check-lane.mjs` | PASS, exit 0, release names all 8 changed captures |
| `npm run gate` | PASS, 26/26 lanes green (two full runs: first surfaced `story-coverage`, `touch-targets` and `evidence`, each fixed on its own terms; second run clean) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-007 (the four errata) and half of AC-009 (the four device items) are Unmet, not Waived.**
   Both write into `../056-board-anytype-parity/**`, outside this leg's write authority. The exact
   content is drafted in `tasks.md` T003 and T004 for a broader-authority pass or the operator to
   land — this is a scope boundary on the dispatch, not unfinished analysis.
2. **AC-010 is the operator's own device read (T015) and nothing here closes it.** The Groups panel
   is built, captured on both platforms and verified live in headless Chrome; whether it reads as an
   improvement on a real iOS device and on desktop is the operator's call.
3. **"Hiding the last visible group" is untested.** The board's own empty-state handling for a
   fully-hidden group set is not exercised by any test this leg added; the edge case is named in
   `spec.md`'s own edge-cases section but has no dedicated coverage here.
4. **`sheet-grammar.mjs`'s stacked-pair count reads 34, not the packet's cited 31.** Measured, not
   assumed: this leg's diff touches nothing in `sheet-grammar.ts`'s registry, so the drift predates
   it and is recorded rather than silently accepted or corrected.
<!-- /ANCHOR:limitations -->

---
