---
title: "Implementation Summary"
description: "The scattered fixture databases are gone: one Testbed database feeds every harness mount, the Finance fixture stands as the kept second dataset, and a registry test keeps it that way."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/074-test-data-consolidation"
    last_updated_at: "2026-09-08T14:20:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Consolidated the catalogue to one Testbed database; registry test green; gate PASS 27/0"
    next_safe_action: "Await the fresh verifier's own landing, then the operator adopts testbed-proposal.md"
    blockers:
      - "The operator's on-device confirmation of the Finance databases and the vault-folder adoption (testbed-proposal.md) are the only rows that wait on a human"
    key_files:
      - "tools/mock-data/consolidation.test.mjs"
      - "tools/mock-data/use-cases.ts"
      - "testbed-proposal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "074-implementation-leg"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Surviving view types: table, board, calendar, timeline, chart (decision-record ADR-0001)"
      - "The constructed, bench and smoke inline fixtures stay; they reference no use case (ADR-0003)"
      - "Stories never consumed the catalogue; nothing to repoint there (grep-verified)"
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
| **Spec Folder** | 074-test-data-consolidation |
| **Completed** | 2026-09-08 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The project's ten generated fixture databases are now one. Every harness mount — the row-rhythm,
wrap-toggle and desktop wrap lanes in the render-assertion registry, the two empty-state probes, the
catalogue photograph lane, the vault/CSV/Anytype emitters — reads the same Testbed database: 36
records, 28 columns, thirteen plugin column types, all five surviving view types plus a deliberately
sorted and filtered second table, a deliberately full first record and a deliberately empty last
one. The 070 packet's operator-shaped Finance fixture stands untouched beside it as the second,
kept dataset, exactly where its cold-cache lane needs it.

A new registry suite (`tools/mock-data/consolidation.test.mjs`) holds the consolidation in place:
it fails if the catalogue ever builds a second database, if any assertion registry mounts a use case
other than the testbed, if a deprecated view type (list, gallery) reappears, if the full or sparse
record loses its guarantee, or if the Finance second-dataset fixture vanishes. It ran red first —
4 of its 6 assertions failing against the ten-database tree — and green after.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `tools/mock-data/use-cases.ts` | Modified | Ten vocabularies → one `testbed` vocabulary; labels returned to the neutral defaults; full and sparse records named |
| `tools/mock-data/catalogue.ts` | Modified | Record 0 fills every written facet (chances still roll); relation forced on it; optional sort/filter on views; the sixth, "Sorted and filtered" view |
| `tools/mock-data/emit-obsidian.ts` | Modified | A view's sort/filter are written into the note as `sortColumn`/`sortDirection`/`sortRules`/`filters`, both representations agreeing |
| `tools/mock-data/consolidation.test.mjs` | Created | The registry: one dataset, every mount on it, survivors only, Finance second dataset present |
| `tools/mock-data/catalogue.test.mjs` | Modified | Ten-use-case and five-view expectations updated to the one-database, six-view world |
| `tools/mock-data/catalogue.json`, `tools/mock-data/csv/testbed.csv` | Regenerated | The generator's own outputs for the single vocabulary |
| `tools/mock-data/csv/{10 old}.csv` | Deleted | The nine retired use cases' CSVs, plus the finance one the testbed replaces (the Finance *fixture* itself is untouched) |
| `tools/live/render-assertions.mjs` | Modified | Rhythm collapsed to the one testbed mount; wrap lanes renamed; comments now name mechanisms, not the retired use cases |
| `tools/live/render-assertion-bundle.mjs` | Modified | Both empty-state probes mount the testbed; their scenario names unchanged |
| `tools/live/{renderer-coverage,touch-targets,unstyled-links,capture-device-parity,replay,sheet-rebuild,sheet-teardown}.json` | Restamped | Re-measured against the edited inputs (the last three timestamps-only, rewritten by the gate's own green reruns) |
| `tools/mock-data/README.md`, `CODE.md`, `csv/README.md`, `anytype/README.md` | Modified | The prose now says one database and 36 records, and says which committed reports still describe the last physical ten-set Anytype load |
| Packet: `tasks.md`, `acceptance-criteria.md`, `decision-record.md`, `testbed-proposal.md`, this file, `goal.md` | Modified/Created | Inventory, statuses, six ADRs, the operator's proposal note, criteria evidence |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first: the registry suite was written and run against the untouched ten-database tree — 4 of 6
assertions failed (ten use cases, non-testbed mounts, five views, a partial full record), 2 guards
passed (the Finance fixture present, exactly one empty record). Then the vocabulary, catalogue,
emitter and registries changed, the generator was rerun, the ten retired CSVs were deleted by name,
and the suite went green. Full vitest went 153 files / 1672 tests → 154 / 1678, the +6 being the
registry suite's own assertions.

The capture corpus was swept twice, as the fixture-changing discipline requires. The first run
reported three PNGs differing from the committed bytes — every one a single-channel-unit
antialiasing flip on lanes this packet never touched — and the second run returned all three to
their committed bytes, so no capture moved, no stylesheet was edited, and the lane needed no
takeover. The only committed capture artefact that changed is the manifest's recorded source
fingerprints for the 286 constructed entries whose inputs the edited bundle feeds, which is the
freshness gate recording reality, and `screenshots:verify` passes against exactly that.

Every evidence artefact whose inputs moved was re-measured by its own tool — never by editing its
numbers — and `evidence --check-all` ends at "15 artefact(s) still describe this tree".
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Survivors only: table, board, calendar, timeline, chart | List and gallery renderers are gone from the tree; a fixture view of either would configure a surface nothing paints (ADR-0001) |
| One vocabulary, 36 records, neutral labels | Ten shapes meant ten populations and ten chances to disagree; the value shapes that break renderers — truncation, diacritics, one-vs-six multi-select — moved, not multiplied (ADR-0002) |
| The constructed, bench and smoke inline fixtures stay | They mount no use case, so they are their lanes' measured subjects, not scattered datasets (ADR-0003) |
| Filters and sorts via a second, deliberately narrowed table view | Its status-notempty filter excludes exactly the deliberately sparse record, so the note exercises both the narrowed and the everything-shown read (ADR-0004) |
| The Finance fixture is the second dataset, in place | Restored means visible: 070 landed that, this packet keeps it beside the testbed and asserts it stays (ADR-0005) |
| Stories needed no repoint | The story files construct their own components inline and import nothing from the catalogue — the "catalogue" in their headers is the story-coverage sense of the word; verified by reading every import |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Registry suite, red (against the ten-database tree) | FAIL, exit 1 — 4 failed / 2 passed of 6 |
| Registry suite, green | PASS — 6/6 |
| `npx vitest run` | exit 0 — 154 files / 1678 tests (was 153 / 1672) |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 |
| `node tools/live/render-assertions.mjs` | exit 0 — rhythm: 36 rows, 1 distinct height 35px, ceiling 49; wrap lanes: tallest 300/280/413px, one-line ≤ 28px, all PASS |
| `node tools/live/sheet-grammar.mjs` | exit 0 |
| `node tools/storybook/story-coverage.mjs` | exit 0 — 19/40 renderable modules, 21 exempt (`sheet-inventory.mjs` is not on this branch — its landing belongs to other packets — so it is skipped per the packet's own instruction) |
| `node tools/storybook/verify-placement.mjs` | exit 0 — 413/415, 2 red for a declared reason |
| `npm run screenshots` ×2 | exit 0 both — 616/616 captured; run 1: 3 PNGs dirty, all maxDelta 1, single-digit changedPixels; run 2: 0 dirty (jitter, restored by the run itself) |
| `npm run screenshots:verify` | exit 0 — 616 entries match their sources, none blank or theme-identical |
| `node tools/live/evidence.mjs --check-all` | exit 0 — 15/15 fresh after re-measuring the 3 the edits made stale |
| `npm run gate` | exit 0 — 27 green, 0 red for a declared reason |
| `node tools/naming/scan-comments.mjs`, `scan-failing-values.mjs` | exit 0 / exit 0 |
| `validate.sh --strict` (via the validation orchestrator) | RESULT: PASSED |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The Anytype report JSONs and `screenshots/anytype/` still describe the last physical ten-set load.** They are the record of runs against the Anytype application, which this packet cannot re-run; the loaders already iterate whatever the catalogue now holds, so the next `load.mjs --reset` loads the single Testbed set and refreshes them. `anytype/README.md` says so.
2. **The operator's vault folder is untouched, by decision.** The consolidated shape exists in the repository; the operator's own `Database Testbed/` adopts it through `testbed-proposal.md`, which lists the retired folders they may delete and the guarded, idempotent command that writes the new one.
3. **The Finance databases' on-device confirmation stays the operator's row.** 070's fix is landed and the cold-cache lane proves the read path; what the operator sees on their phone is theirs to confirm, and this packet never ticks another's row.

<!-- /ANCHOR:limitations -->

---
