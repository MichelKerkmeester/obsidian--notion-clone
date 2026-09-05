---
title: "Implementation Summary: Remove the List Renderer and Its Harness"
description: "The list renderer and every measurement surface named against it are gone in one change. list stays on DatabaseViewType, migrated permanently by the existing coercion. The one deferral (styles.css's dead list rules) landed in a follow-up pass; a harness regression found during the removal was fixed rather than folded in silently."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list removal summary"
  - "006 phase 007 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/007-remove-renderer-and-harness"
    last_updated_at: "2026-09-05T04:35:00Z"
    last_updated_by: "phase-007-t010-followup"
    recent_action: "T010 follow-up landed (styles.css cleanup); gate 25/25 green"
    next_safe_action: "Proceed to 008-docs-and-release; no open tasks remain in this packet"
    blockers: []
    key_files:
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/data/list-migration.ts"
      - "tools/gate.mjs"
      - "tools/live/renderer-coverage.json"
      - "tools/bench/table-render-bench.ts"
      - "styles.css"
      - "tools/live/view-census.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-007-summary"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Does list leave DatabaseViewType? No — it stays accepted-but-redirected, ADR-001 in plan.md."
      - "Was the 006 precondition (an operator report against a released build) confirmed before this phase ran? No — recorded as a gap in tasks.md T001, not silently assumed met."
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
| **Spec Folder** | 007-remove-renderer-and-harness |
| **Completed** | 2026-09-05; T010's deferred `styles.css` cleanup landed the same day in a follow-up commit — see the T010 Follow-Up section below |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

`src/views/list-renderer.ts` (1,173 lines) and every measurement surface named against it left the
tree together, per `plan.md`'s measurements-first ordering. `list` stays on `DatabaseViewType` as an
accepted-but-redirected value (ADR-001, `plan.md`), migrated permanently by `src/data/list-migration.ts`
and the `migrateListViewOnOpen` coercion in both hosts — not narrowed out of the type.

### The nine surfaces named at opening, and what happened to each

1. `tools/gate.mjs:89`'s `list-window` lane entry — **removed**, not skipped. The gate now runs 24
   lanes, not 25.
2. `tools/live/list-window.mjs` — **deleted**.
3. `tools/live/list-window.json` — **deleted**.
4. `src/views/list-window-harness.ts` — **deleted**.
5. `tools/live/renderer-coverage.json`'s `list-renderer.ts`/`list-render-bench.ts` pins — **removed**;
   floor lowered 7/22 → 6/21 with `note: "was 7/22; list renderer retired"`.
6. `tools/screenshots/constructed-scenarios.mjs`'s `list`/`list-sparse` — **removed**; the
   `constructed-list-migrated` scenario's list fork removed too (always mounts `TableRenderer` now).
7. `tools/screenshots/scenarios.mjs` (`core.mjs`/`chrome.mjs`/`shared.mjs`)'s list fixtures —
   **removed**: `list-view`, `list-mobile`, `list-sparse-fields`, the list host inside
   `group-selection-controls`, and `listGroupHeader()`.
8. `tools/live/replay.mjs`'s list claims — **kept, not dropped**, marked `retired: true` with their
   last recorded values (0, `was` 26 and 3), per the file's own convention for a measured result whose
   fixture no longer exists. Both still report `held` because `retired` claims return their recorded
   value directly rather than re-measuring a fixture that is gone.
9. `src/views/list-reservation.test.ts` and `list-row-contracts.test.ts` — **deleted**.

Also: `card-field-renderer.ts` (349 lines) — **untouched**, per plan; the list's separate use of it
was in `list-renderer.ts` itself, which is gone. `listCompactFields` removed from `ViewConfig`
(`types.ts`), the parser/serializer (`data-source.ts`), the config panel
(`view-config-panel-renderer.ts`), and all three locale dictionaries (`i18n.ts`).

### Files Changed

Full list in the landing commit (`feat(views): retire the list renderer, its lane and its captures`).
By surface: 8 files deleted (the renderer, its two unit specs, the list-window lane/harness/ratchet,
the bench entry and its runner); ~30 `src/`/`tools/` files modified to remove list branches, list
column/config builders, and list-specific assertions; 5 evidence/ratchet JSON files re-stamped or
deliberately lowered; 20 screenshot PNGs deleted and 21 recaptured for real content reasons.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Per `plan.md` §3's internal order: measurements out first (lane, harness, ratchet pins, fixtures,
constructed scenarios, replay claims, unit specs), then the source (`list-renderer.ts` and its call
sites in both hosts), then the ratchet floor and the capture manifest, then verification.

One precondition gap is recorded rather than assumed clean: `006-list-view-deprecation/goal.md`
still names "one operator report against a released build" as the thing that unblocks `007`, and no
such report exists in this tree. This phase was dispatched and executed anyway; `tasks.md` T001
records the gap rather than silently treating it as satisfied.

Verification ran the full `npm run gate` (not a subset) from the final state after every removal and
recapture, `$?` read directly. It found two real red lanes along the way — `placement` (a leftover
check with zero subjects to check, see Known Limitations) and `evidence` (a stale stamp file, fixed
by re-running the tool that writes it) — both fixed rather than declared, because both were
mechanically reproducible defects, not open product questions.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Remove everything in one commit, not a tidy sequence | Two commits satisfy a later search and still leave a window where the gate ran green against a view that was half gone. AC-001 is therefore phrased over the commit, not the tree. |
| Measurements out before source | Otherwise `list-window.mjs` runs against a deleted renderer, and the failure it produces is indistinguishable from a real one. |
| `list` stays on `DatabaseViewType`, migrated permanently (ADR-001) | Same shape the gallery already uses; narrowing the type now would strand any vault that has not opened since `006` shipped, and `006`'s own release-confirmation precondition was not confirmed before this phase ran. |
| `styles.css`'s list rules deferred (T010) | Dead CSS in a 19,000-line, every-capture-fingerprinting stylesheet is its own bounded, capture-affecting change; folding it into this diff would make an already-large landing harder to review for the thing that actually matters (the renderer and its measurement surface). |
| Fix the `makeConfig` schema regression at its source, not per call site | `table-render-bench.ts`'s `makeConfig` silently produced a config with no `schema.columns` once seven constructed scenarios were re-pointed to it from the deleted list bench, blanking every filter/sort field selector. One shape fix in `makeConfig` corrects every call site at once, rather than patching each scenario that happened to need it. |
| Record the unconfirmed `006` precondition rather than treat it as satisfied | A precondition line that says "does not start before X" and starts anyway without X is a fact about this landing, not a detail to smooth over. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 errors |
| `npm test` (vitest) | 1090 passed, 0 failed (was 1109 at the base commit; 19 fewer from the deleted list-only test files and removed list assertions inside shared specs) |
| `npm run lint` | 164 problems (was 172 at the base commit; the 8-problem drop traced file-by-file to the deleted `list-renderer.ts` (6) and the list checks removed from `accessibility-defects.test.ts` (2) — not part of `npm run gate`) |
| `npm run lint:tools` | 0 problems |
| `node tools/naming/scan-comments.mjs` | PASS, 0 findings |
| `node tools/live/render-assertions.mjs` | PASS, coverage 6/21 (was 7/22) |
| `node tools/live/replay.mjs` | PASS, 28 results held, 2 marked `retired` |
| `npm run screenshots` (full) | 534 screenshots (was 554), 0 failures |
| `npm run screenshots:verify` | 534 entries fresh, 0 stale |
| `node tools/live/touch-targets.mjs` | PASS both passes; fixture 198/198 (was 279), constructed 1215/1215 (was 1223) |
| `node tools/live/unstyled-links.mjs` | PASS; constructed 1332 links (was 1476), 0 UA-default findings |
| `node tools/lane/check-lane.mjs` | "release names all 21 changed capture(s)", exit 0 |
| `npm run gate` | **24/24 green** on this phase's own pre-reconciliation branch, `$?` read directly: `0`. After landing on main (which had independently added a `sheet-grammar` lane in the same window), the reconciled tree prints **25/25 green**, `$?` still `0` — see the Reconciliation note below. |
| ADR-001 (`DatabaseViewType`) | Accepted — `list` stays, migrated permanently |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:reconciliation -->
## Reconciliation With Main

This phase's two commits (`feat(views): retire the list renderer, its lane and its captures` and
`docs(specs): record the list renderer retirement`) were rebased onto `origin/main` after main had
independently landed `044-phone-sheet-alignment`, `045-board-card-properties`, `038-board-kanban-port`
and the phone sheet grammar feature (`sheet-grammar`, a 25th gate lane). A third commit,
`chore(views): reconcile the list renderer retirement with main`, resolved what the rebase left:

- `tools/gate.mjs`: kept both sides — `sheet-grammar` (main's addition) and the `list-window`
  removal (this phase's own change) — so the lane count is 25 (26 with `sheet-grammar` added,
  minus 1 for `list-window` retired), not the 24 this phase's own docs recorded pre-rebase.
- `tools/lane/css-lane.json`: this phase's release entry appended after main's own
  `044`/`045`/`038` acquire/edit/release entries rather than overwriting them.
- `tools/live/touch-targets-baseline.json` / `touch-targets-constructed-baseline.json`: main's
  `044-phone-sheet-alignment` had already found the recorded 279/1223 baselines stale (true
  pre-list values were 199/1220); this phase's own `listRetirementLowering` note was corrected to
  measure from that true basis (199→198, 1220→1215).
- `screenshots/manifest.json` and the panel/board captures: a fresh full `npm run screenshots`
  capture on the merged tree, since the rebase's own conflict resolution did not yet reflect this
  phase's generic "Field N" column fix together with main's own panel-close-button edit.

`npm run gate` on the fully reconciled tree: **25/25 green**, `$?` read directly, re-run twice for
stability. Every number this phase's own docs record above (`tasks.md`, `goal.md`,
`acceptance-criteria.md`) reflects the pre-reconciliation branch; this section is the corrected,
post-landing truth. See `chore(views): reconcile the list renderer retirement with main` for the
full per-file resolution.
<!-- /ANCHOR:reconciliation -->

---

<!-- ANCHOR:t010-followup -->
## T010 Follow-Up: Stylesheet Cleanup

Landed separately from the phase's original landing, once the held `styles.css` lane was actually
free to take (`chore(styles): drop the retired list view's stylesheet rules`).

By the time this ran, the css-lane baseline had already moved twice more past the `719ba0fca8e1`
this phase's own T010 note recorded: `049-bench-frozen-today` released at `0785e72944dd` (no CSS
edit, a clock-freeze fix), and this phase's own `git rm` of the retired PNGs released at the same
hash without touching `styles.css`. The follow-up re-verified from `0785e72944dd`, the hash actually
in the tree, rather than trusting the stale value this file's own earlier note carried.

`rg -n "db-list" src tools --glob '!*.css'` confirmed the only remaining producer of `db-list`
markup anywhere in the repository is `tools/live/view-census.mjs`'s row-rhythm matrix — the
reproduction this phase's own landing commit deliberately kept (editing only a comment) to measure
the stylesheet's row layout independent of a live view. Removed every `db-list*` selector arm that
fixture does not build: list grouping, row drag/drop states, the file-title path-prefix block, the
open/new-row buttons, the mobile reorder button, field variants no producer ever set, and four
selector arms that had accidentally merged into an unrelated `is-phone` filter-panel rule through a
missing brace. Kept the 9 classes the fixture mounts, bare and under `.is-phone` alike. 86 `db-list`
references before, 24 after.

RED FIRST: a new `describe` block in `tools/screenshots/scenarios/shared.test.mjs` asserted no
`db-list` selector arm resolves outside the fixture's mounted classes — failed against the pre-edit
stylesheet naming all 62 dead arms, passed against the edit. Two pre-existing suites this change
never touched corroborated it independently: `src/views/mobile-table-and-panel-ux.test.ts` (asserts
the exact declarations on the kept phone `.db-list-row`/`-row-meta`/`-field`/`:hover` rules) and
`src/views/screenshot-fixtures.test.ts` (asserts every class `view-census.mjs` mounts is real, which
required keeping exactly the classes kept here).

Zero-change proof: `view-census.json`'s `rowMatrix`/`rail`/`rows`/`probes`/`totals` fields are
byte-identical before and after the edit, diffed programmatically rather than eyeballed. `npm run
screenshots` moved 20 PNGs by encoder bytes only, all `pixelHash`/`layoutHash`-identical to HEAD via
`check-lane.mjs`'s content compare, restored to HEAD-committed bytes with the manifest's `bytes`
field corrected; the manifest's only other change is every scenario's `styles.css` fingerprint
moving to the new hash, a pure text substitution verified to touch no other byte. css-lane released
with an empty `reviewed` list — nothing moved for a real reason to open and read. `npm run
screenshots:verify`: 532/532 current, 0 stale.

Re-stamped the eight evidence artifacts the hash bump left stale (`cascade-audit`,
`checkbox-appearance`, `checkbox-inventory`, `design-conformance`, `engine-parity`, `surface-census`,
`token-census`, `view-census`) by re-running their own tools rather than editing their numbers — the
`evidence` gate lane discovered exactly these 8 of 15 tracked artifacts as stale, matching the files
that actually list `styles.css` in their `inputs`.

`npx tsc --noEmit`: 0 errors. `npm test`: 1124 passed (108 files, including the new test — 34 more
than this phase's own 1090, all from unrelated work that landed on `main` between this phase's
landing and this follow-up). `npm run lint:tools`: 0 problems. `npm run gate`: **25/25 green**, `$?`
read directly, re-run twice for stability.

**Reconciled with main a second time** (`chore(styles): reconcile the list stylesheet cleanup with
main`): rebasing onto `044-phone-sheet-alignment`'s own settings-body-grammar landing picked up a
second, independent `styles.css` edit branched from the same `0785e72944dd` baseline this follow-up
used. The two edits touch disjoint regions, so the rebase auto-merged `styles.css` textually with no
conflict (merged hash `bf0e11a3d7bf`); `tools/lane/css-lane.json`'s history was merged by hand to keep
both phases' acquire/edit/release sequences in order rather than picking one side. Every evidence
artifact that fingerprints `styles.css` went stale a second time and was re-run fresh rather than
carrying the conflict-resolution placeholders forward. `view-census.json`'s `rowMatrix`/`rail` — the
fields this follow-up's own removal is measured against — are still byte-identical to the
pre-removal tree; its `rows`/`totals` moved by exactly 8 rows, all from `044`'s own new
`panel-view-config-sheet` fixture and unrelated to `db-list`. `npm run screenshots`: 534 entries
(`044` added 2 real captures), 20 more encoder-byte-only moves confirmed and restored. `npm run
screenshots:verify`: 534/534 current, 0 stale. `tsc` clean; `vitest` 1129/1129 (108 files);
`lint:tools` clean; `npm run gate` 25/25 green, twice.
<!-- /ANCHOR:t010-followup -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **T010 — RESOLVED.** `styles.css`'s `db-list-*` rules were dead CSS left in the stylesheet at
   this phase's original landing; a follow-up pass removed them (`chore(styles): drop the retired
   list view's stylesheet rules`) once the held lane was actually free. See `tasks.md` T010 and the
   T010 Follow-Up section above for the evidence.
2. **The `006` precondition was not confirmed before this phase ran.** No operator report against a
   released build is recorded anywhere in this tree. See `tasks.md` T001.
3. **A harness regression was found and fixed mid-phase, not caught by `npm run gate` alone.**
   `render-assertion-harness.ts`'s re-point from the deleted list bench to the table bench (a
   mechanical rename, `makeListConfig` → `makeTableConfig`) silently blanked every constructed
   filter/sort/active-rule/summary scenario's field selector, because the two bench files'
   `makeConfig` functions built a differently-shaped `ViewConfig`. `render-assertions.mjs`'s own
   `SCENARIOS`/`STATE_SCENARIOS` list never exercises those renderer branches — only running the full
   screenshot capture and reading the resulting PNG surfaced it. Fixed at the source
   (`table-render-bench.ts`'s `makeConfig`); the general lesson — a gate lane's own scenario coverage
   can miss a regression its sibling capture pipeline exercises — is recorded here rather than assumed
   closed by a green `npm run gate`.
4. **A leftover check with zero subjects was found and removed, not declared.**
   `tools/storybook/verify-placement.mjs` carried "every fixture list row carries the wrapper the
   renderer builds", added when the list still had fixtures. With the fixtures gone it always measured
   0 list rows and failed by this program's own "0 subjects proves nothing" convention. Removed rather
   than declared as an expected fail, since the check can never have a subject again.
5. **The gallery's own deprecation is unfinished.** `renderer-coverage.json` still pins
   `gallery-renderer.ts`. Bundling the two removals would make one rollback undo both, so they stay
   separate even though the work rhymes.
<!-- /ANCHOR:limitations -->

---

