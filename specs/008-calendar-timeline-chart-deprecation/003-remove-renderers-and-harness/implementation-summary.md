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
    packet_pointer: "008-calendar-timeline-chart-deprecation/003-remove-renderers-and-harness"
    last_updated_at: "2026-09-09T08:05:00Z"
    last_updated_by: "250-deprecation-removal"
    recent_action: "Landed: 4/4 criteria, bundle grep 0, gate 27/0"
    next_safe_action: "Hand off for a fresh verifier; 004 (docs and release) waits"
    blockers: []
    key_files:
      - "decision-record.md"
      - "../../../archive/deprecated-views/README.md"
      - "../../../src/views/database-view.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-remove-renderers-and-harness-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Ten sources archived under proven-restore paths; the harness's retired machinery kept dormant (ADR-002); five retired-view tokens recorded, not stood in (ADR-003)"
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
| **Spec Folder** | 003-remove-renderers-and-harness |
| **Completed** | 2026-09-09 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The shipped bundle no longer carries the calendar, timeline or chart view: the three
retired renderers — with their tests and their dedicated render benches — moved into
`archive/deprecated-views/<view>/` under recorded, provable restore paths, their bundle
footprint reached zero, and their harness lanes, capture scenarios and evidence owners
were retired with them. Every stored view keeps its 0.0.34 redirect: the migration
machinery the previous phase shipped stayed green through the whole surgery.

### What this feature does and why it exists

Once no surface can open one of the three views, the renderers are unreachable code that
still ships, still gets linted and still pretends to be chosen. This phase cut them out
without losing them: the archive keeps real, versioned bytes (pinned to the last commit
that ever shipped them) rather than history archaeology, so the date/renderer-parity work
can resurrect one if it ever needs to — and the READMEs say exactly what a resurrection
must bring back with it.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `archive/deprecated-views/{calendar,timeline,chart}/` | Created (10 renamed sources + 4 READMEs) | The archived renderers, their tests, their benches; the last-live SHA and restore procedure per view |
| `src/views/database-view.ts` | Modified | Dispatch collapsed to board-else-table; the retired views' teardown, panel, chart-rendering and export plumbing deleted |
| `src/views/embedded-database-renderer.ts` | Modified | Same surgery for the embed host, including the retired root list the stale-selector string carried |
| `src/views/rendered-view-roots.ts`, `toolbar-renderer.ts`, `view-config-panel-renderer.ts` | Modified | The last bundle references: the retired root ids, icon arms and option row |
| `tools/live/render-assertion-bundle.mjs`, `render-assertions.mjs`, harness imports | Modified | Registries trimmed (13+8 rows), retired sections and stamps rewritten, benches now loaded from the archive |
| `tools/screenshots/scenarios.mjs`, `constructed-scenarios.mjs` (76→59), `reference-scenarios.mjs` (4→2), `chrome.mjs` | Modified | Retired scenario/capture registrations; the temporal module and its parity test deleted with their last consumer |
| 138 PNGs under `screenshots/` | Deleted | The retired views' capture arms (136 retired manifest rows, 616→480) |
| `tools/screenshots/pinned-values-baseline.json` | Modified | Five retired-view tokens recorded (setters left with the archived renderers), plus the trailing-comma fix |
| `tsconfig.json` | Modified | Vestigial `rootDir` widened to `.` so the archived imports type-check |
| Tests: `database-view.test.ts`, `embedded-database-renderer.test.ts`, `surface-shell.test.ts`, `calendar-pinned-values.test.ts`, `hide-and-migrate.test.ts`, `shared.test.mjs`, `constructed-capture.test.mjs`, `sheet-inventory.test.mjs` | Modified | Source-read pins repointed to the archive; pinned arrays brought to the new declared counts; the 002 suite's picker clauses untouched |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Archive-first, then the hosts, then the registries, then the captures — with the red
state recorded at each seam before the surgery that closed it (tsc exit 2 with 4× TS2307;
vitest 11 failed / 13 files while the bundle still named the views). The verification
battery, every exit read from `$?`: `npx tsc --noEmit` 0; `npx vitest run` 154/154 files,
1555/1555 tests; `npm run build` 0; the bundle grep 0 (5 before); the capture battery —
`npm run screenshots` twice (480 captures each, both exit 0), pixel-delta (one 1-px
jitter, one 61-px dynamic-timestamp mover, 138 retired PNGs confirmed gone),
`screenshots:verify` 0; the lane battery — `render-assertions.mjs`, `sheet-grammar.mjs`,
`story-coverage.mjs`, `verify-placement.mjs`, the shim-coverage check,
`sheet-inventory.mjs` + its dedicated test, `replay.mjs` 28/28 — all 0; the evidence
sweep: one stale artefact (device-parity, whose manifest input moved) re-measured by its
own writer, then `evidence --check-all` 15/15 fresh; the naming scans 0; and the gate
once, exit 0 — 27 green, 0 red for a declared reason. The pinned-values lane's first-gate
red (a trailing comma, then five turned-unsupplied retired-view tokens) was fixed at the
baseline, theScanner's own "record, don't stand in" remedy, and the gate's final run
re-proves it. The strict validation orchestrator returned PASSED and the packet's graph
metadata was regenerated before the closing commit.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Archive-then-exclude, by construction | No bundler, test or lint glob needed editing: the bundle loses what no `src/` module imports, the collectors' patterns simply stop matching, and the one config touch is the vestigial `rootDir`. See the decision record, ADR-001 |
| The harness's retired-view machinery stays dormant | Its inputs stay populated (gate 27→27, no lane retired), and it mirrors what the hosts deliberately keep beside the 002 migration machinery. ADR-002 |
| Retired-view tokens recorded, not stood in | Their only setters were style-assignments inside the archived renderers; five declarations for five dead rules would be documentation-shaped noise. ADR-003 |
| 002's pinned clauses untouched | The hide-and-migrate suite (24/24) is the proof the stored-view redirect kept working; rewriting its pins for symmetry would have traded evidence for neatness |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 154/154 files, 1555/1555 tests, exit 0 |
| `npm run build` | 0 |
| Bundle grep (`gantt\|calendar-renderer\|chart-renderer` in `main.js`) | 0 (was 5) |
| `npm run screenshots` ×2 | 480 captures each, exit 0 both; 616→480 manifest rows; 138 PNGs deleted |
| Pixel-delta between the two runs | 1×1-px jitter; 1×61-px real mover (dynamic timestamp), committed; retired PNGs gone |
| `npm run screenshots:verify` | 0 — "480 entries match their sources, and none is blank or identical across themes" |
| `render-assertions.mjs` / `sheet-grammar.mjs` / `story-coverage.mjs` / `verify-placement.mjs` / shim-coverage / `sheet-inventory.mjs` + its test / `replay.mjs` | 0 / 0 / 0 / 0 / 0 / 0+0 / 28/28 hold |
| `evidence --check-all` | 15/15 fresh (device-parity re-measured by its own writer after the manifest moved) |
| `scan-comments.mjs` / `scan-failing-values.mjs` / `scan-pinned-values.mjs` | 0 / 0 / 0 |
| `npm run gate` | exit 0 — 27 green, 0 red for a declared reason |
| Validation orchestrator (`--strict`) | PASSED |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No Obsidian host in the battery.** The harness constructs no live App, workspace or
   metadata cache; the battery proves the bundle and the surfaces, not a real device. The
   render-assertions runner prints this itself, and the device gap is the harness's
   standing caveat, not a regression of this leg.
2. **The retired views' stylesheet rules stay.** The `.obnotion-calendar-*` and
   `.obnotion-timeline-*` families remain in `styles.css` — dead markup whose per-rule
   removal is a stylesheet audit of its own; their five turned-unsupplied reads are
   recorded in the pinned-values baseline rather than cut.
3. **Dormant harness machinery.** The retired views' harness branches, tags and bags
   remain, uncalled; their fate is recorded in the decision record, not left to memory.
4. **The phase context's `../changelog/` file does not exist.** The previous phase's
   closure shipped without one either; the next phase (docs-and-release) owns the first.
<!-- /ANCHOR:limitations -->
