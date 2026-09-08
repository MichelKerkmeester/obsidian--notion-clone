---
title: "Goal: iOS view data regression"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "070 goal"
  - "ios view data regression completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "070-ios-view-data-regression"
    last_updated_at: "2026-09-08T08:44:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive from R1 and its 08:44 clarification"
    next_safe_action: "Reproduce the empty-property read, cold-cache case first"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "070-ios-view-data-regression-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: iOS View Data Regression

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every property on every database view renders its frontmatter value on iOS exactly as it does on desktop, proven by a red-before-green harness reproduction rather than a defensive patch.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The bug is a read/render regression, not a data-loss event: frontmatter and the view definition are both confirmed intact on disk, and the note-database plugin's removal is confirmed not to be the cause |
| D2 | The fix must be traced to a confirmed root cause with file:line evidence before it is written; a patch applied against an unconfirmed suspect does not close this packet |
| D3 | The metadata-cache-cold case is a named, separate acceptance criterion from the warm-cache case |
| D4 | Only the operator's own device recheck may close the device row; no agent ticks it |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes
(objective, a decision, the binding table, a criterion), resend the full text
of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] The harness reproduces the empty-property read against a fixture mirroring the operator's shapes, cold-cache case included, before any fix
      (Watched it red before the fix: 0/18 table property cells, 0/8 board cells —
      `table-poisoned-by-early-view-def-scan` and `board-poisoned-by-early-view-def-scan`;
      the per-file-"changed" control stayed 18/18, isolating the cause.)
- [x] Root cause identified with file:line evidence among data-source.ts, title-field-display.ts, legacy-plugin-data-migration.ts, or a confirmed fourth cause — the read it explains was 0/18 populated properties before the fix and 18/18 after; confirmed in data-source.ts (`getViewDefFiles()` + `getCachedRecords()`, no `"resolved"` catch-all); the other two excluded with evidence
- [x] Fix lands with a test proven to fail against the pre-fix code and pass after
- [ ] Finance Reports table and Database Testbed board both recaptured showing populated properties — the harness's own fixture-driven captures prove the mechanism; the operator's own two surfaces need their own device
- [x] Operator device row recorded and left unticked pending the operator's own re-check
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Red reproduction (harness) | Done | `COLD_CACHE_EXPECT=pre-fix-red node tools/live/database-cold-cache-property-read.mjs`: 0/18 table cells, 0/8 board cells, single "no value" board group |
| Root cause confirmed | Done | `src/data/data-source.ts:513-526` (`getViewDefFiles()`'s eager record-cache seed), `:1794` (`getCachedRecords()`'s build-once guard), no `"resolved"` listener in `startListening()`; introducing commit `ce0bb30ec` (upstream "Release 1.2.6", pre-rename) |
| Fix landed | Done | `startListening()` now subscribes to `metadataCache.on("resolved")` and refreshes every cached record |
| Green reproduction (harness + unit test) | Done | Harness `RESULT: PASSED` (18/18, 8/8, correct sort); `data-source.test.ts` new test green, confirmed red via `git stash` first |
| Full verification battery | Done | `tsc`, `vitest` (1672/1672), `build`, `render-assertions`, `sheet-grammar`, `npm run gate` (27 green, 0 red), `scan-comments`, `scan-failing-values` all exit 0 |
| Operator recapture + device row | Open | AC-005/AC-006 need the operator's own vault and iPhone, unavailable in this environment |

### Deviations and findings

| Item | Note |
|------|------|
| Root cause was not the three named suspects' obvious candidates | `title-field-display.ts` and `legacy-plugin-data-migration.ts` are excluded with evidence; the confirmed mechanism in `data-source.ts` is `getViewDefFiles()`'s eager cache seed racing the metadata cache's initial resolution, not `parseViewConfig`/`toViewPayload` as spec.md originally named |
| Latent upstream bug, not a rename/058 regression | `git blame` traces the exact poisoning lines to commit `ce0bb30ec` ("Release 1.2.6", 2026-07-19), well before this fork's rename or titleFormat work — the fresh-load path on 0.0.32 is what exposed a pre-existing race, per D1/goal option 3 |
| The operator's "Total 37 unfiltered" detail was not reproduced or explained | A synthetic reproduction of the same year-filtered view under a poisoned cache returns 0 matching rows (correctly excludes everything), not an unfiltered 37 — recorded as an open, unconfirmed detail rather than a second bug guessed at |
<!-- /ANCHOR:log -->
