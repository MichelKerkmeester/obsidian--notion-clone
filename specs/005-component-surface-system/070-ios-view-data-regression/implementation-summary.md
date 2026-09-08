---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "scaffold/070-ios-view-data-regression"
    last_updated_at: "2026-09-08T06:20:03Z"
    last_updated_by: "template-author"
    recent_action: "Initialized Level 2 template"
    next_safe_action: "Replace continuity placeholders"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "scaffold-070-ios-view-data-regression"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
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
| **Spec Folder** | 070-ios-view-data-regression |
| **Completed** | 2026-09-08 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Every view opened at first load could show its columns with every property cell empty and its
rows unsorted, because a routine scan for `db_view` notes silently poisoned the record cache with
`{}` frontmatter for every file in the vault the moment it ran before the metadata cache finished
resolving — and nothing ever told the cache to look again. `DataSource` now listens for Obsidian's
own "every file is current" signal and refreshes from it, closing the exact race the operator's
phone hit on 0.0.32's first load.

### iOS view data regression: property cells empty and view sort not applied after 0.0.32

`DataSource.getViewDefFiles()` — the scan every view construction runs to find its own `db_view`
note — builds a whole-vault record-cache snapshot the first time it is called, using whatever
`metadataCache.getFileCache()` reports at that exact moment (`toRawRecord`, `data-source.ts:1785`).
If that first call happens before Obsidian's metadata cache has resolved every file — the ordinary
shape of a view restored at first load, before background indexing finishes — every record is
cached with `{}` frontmatter. `getCachedRecords()`'s own "build once" guard
(`if (!this.recordCache)`, `data-source.ts:1794`) never rebuilds it after that, and the only
existing recovery path (`refreshCachedRecord`, wired to `metadataCache.on("changed")` /
`vault.on("create"/"rename")`) only ever refreshes a file whose OWN such event fires again later —
which does not reliably happen for a file that was merely part of the initial vault load rather
than freshly edited. The `db_view` note's own frontmatter resolving moments later explains why
column headers were always correct while every property stayed empty: the second scan recognizes
the database (headers/columns), but the record snapshot from the first, poisoned scan never gets
rebuilt.

`DataSource.startListening()` now also subscribes to `metadataCache.on("resolved")` — Obsidian's
own identity-less signal that every file's cache is current — and, when a record cache already
exists, refreshes every markdown file's cached entry and notifies listeners exactly the way a
per-file "changed" event already does. This is additive: the existing per-file recovery path is
unchanged, and a record cache that was never poisoned (built after the vault settled) sees no
behavior change at all.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/data-source.ts` | Modified | Added a `"resolved"` listener in `startListening()` that refreshes every cached record once Obsidian's initial metadata resolution completes |
| `src/data/data-source.test.ts` | Modified | Added a mutation-proven unit test reproducing the poisoned-cache race and its recovery; widened the file's `TFile` mock to a real constructor and gave the shared `window` stub working timers |
| `tools/live/database-cold-cache-property-read.mjs` | Created | Permanent gate lane: mounts the real `DataSource`/`RowPipeline`/`TableRenderer`/`CellRenderer`/`BoardRenderer` in headless Chrome at 402x874 against a Finance/Testbed-shaped fixture, red-before-green across cold/warm/poisoned/recovered scenarios |
| `tools/live/vault-read-obsidian-stub.mjs` | Created | An "obsidian" module stand-in with a working `TFile`/`Vault`/`MetadataCache`/`App` the harness drives directly, re-exporting the catalogue's own icon/tooltip/`Platform` stubs for everything else |
| `tools/gate.mjs` | Modified | Registered the new harness as a permanent gate lane (`cold-cache-property-read`) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red before green, per the packet's own directive. The harness fixture (Finance-shaped table:
currency/text/year columns and a `file.name`-desc sort; Testbed-shaped board: checkbox/number,
grouped by a number column) reproduced the reported shape exactly before any production edit:
`table-poisoned-by-early-view-def-scan` read 0 of 18 property cells populated across 6 unsorted
rows once the early scan and warm-up sequence ran, and `board-poisoned-by-early-view-def-scan`
grouped all 4 cards under a single "no value" bucket with 0 of 8 property cells populated —
matching the operator's "Finance Reports empty" and "Testbed board — all cards under No value,
empty Pinned checkbox" screenshots. The fix (the `"resolved"` listener) turned both scenarios
green — 18/18 and 8/8 populated, correct sort order, board groups split by their real values — while
an isolation scenario (`table-cold-then-per-file-changed`, no early scan) stayed green throughout,
confirming the defect is specifically the missing catch-all for a scan that ran ahead of any
per-file event, not a broken cache mechanism generally. The unit test in `data-source.test.ts`
was independently confirmed to fail against the reverted fix (`git stash` the one hunk, run, `git
stash pop`) before being counted as passing evidence.

The new harness is wired into `npm run gate` as a permanent lane (`cold-cache-property-read`)
rather than a one-off script, so a regression in this exact mechanism reddens the gate rather than
needing another operator report to resurface it.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Fix at `startListening()`'s "resolved" subscription, not inside `getViewDefFiles()`'s own seed | Any early read (not only `getViewDefFiles()`) can poison the cache the same way; a catch-all recovery covers every early-read path uniformly instead of special-casing the one call site this investigation traced |
| Reuse `refreshCachedRecord()` per file rather than a new bulk-rebuild method | The exact per-file refresh logic (extension check, cache delete-on-non-md) already exists and is exercised by the "changed"/"create"/"rename" paths; a second implementation could drift from it |
| Guard the new listener on `if (!this.recordCache) return` | A record cache that was never built yet needs no repair — the next natural read already sees fresh data — so the fix does nothing extra on the common warm-boot path |
| Reproduce with a synthetic 6-record/2-year table and a 4-card board, not the operator's own data | Matches the dispatch's data-handling constraint (read personal shapes to design the fixture, never commit them) while still exercising a filtered view, an unfiltered sorted view, and a grouped board |
| Did not chase the operator's "Total 37" unfiltered-row detail as a second bug | The synthetic reproduction of the same year-`eq` filter under a poisoned cache returns 0 rows (correctly excludes everything lacking the field), not 37 unfiltered — the row-count detail may reflect a different UI element (e.g., a total badge) or a filter state this packet's evidence does not confirm; recorded here rather than guessed at |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, 1672/1672 tests, 153/153 files (includes the new mutation-proven test) |
| `npm run build` | PASS, exit 0 |
| `node tools/live/database-cold-cache-property-read.mjs` (red, `COLD_CACHE_EXPECT=pre-fix-red`) | PASS — confirms the poisoned scenario still reproduces 0/18 and 0/8 |
| `node tools/live/database-cold-cache-property-read.mjs` (default/post-fix) | PASS — RESULT: PASSED, 18/18 and 8/8 populated, correct sort |
| `node tools/live/render-assertions.mjs` | PASS |
| `node tools/live/sheet-grammar.mjs` | PASS |
| `npm run gate` | PASS — 27 green, 0 red (26 pre-existing + the new `cold-cache-property-read` lane) |
| `node tools/naming/scan-comments.mjs` | PASS — 0 violations |
| `node tools/naming/scan-failing-values.mjs` | PASS — 0 new unrecorded criteria |
| Mutation proof (`git stash` the `data-source.ts` hunk, rerun the unit test, `git stash pop`) | Confirmed red without the fix (`expected {} to deeply equal { income: 1000 }`), green restored after |
| Screenshots/manual device recapture | Not run — no operator vault available in this environment; see Known Limitations |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No real-device recapture.** AC-005's Finance Reports table and Database Testbed board
   recaptures are the operator's own vault surfaces, which this environment does not have. The
   harness's own fixture-driven captures (synthetic Finance/Testbed shapes) prove the mechanism;
   the operator's own screenshots and device row (AC-005/AC-006) remain theirs to confirm.
2. **The "Total 37 unfiltered" detail is not explained.** This packet's reproduction of the same
   filter shape (year `eq`, cold cache) returns 0 matching rows, not an unfiltered 37 — the
   filter-bypass appearance in the operator's own screenshot may have a separate, unconfirmed
   cause (e.g., which view tab was actually active, or a different total badge). Recorded as an
   open question rather than guessed at; the confirmed root cause and fix are scoped to the
   empty-property-value defect this packet's acceptance criteria name.
3. **`getViewDefFiles()`'s eager seeding itself is unchanged.** The fix is a general catch-all
   recovery (`"resolved"`), not a change to the seeding behavior that produces the poisoned
   snapshot in the first place. Any other code path that reads the record cache before the vault
   settles would have poisoned it the same way before this fix, and now recovers the same way.
<!-- /ANCHOR:limitations -->

---


