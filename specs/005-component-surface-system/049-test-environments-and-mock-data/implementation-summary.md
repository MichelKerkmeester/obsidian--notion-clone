---
title: "Implementation Summary: Test Environments and Mock Data"
description: "What was built, what it measured, and the three rows that stayed open because this session had no CDP session, no operator window and no device."
trigger_phrases:
  - "implementation summary"
  - "049 summary"
  - "mock data catalogue landed"
  - "test environment upgrade evidence"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/049-test-environments-and-mock-data"
    last_updated_at: "2026-09-05T09:55:00Z"
    last_updated_by: "phase-author"
    recent_action: "Landed the catalogue, emitters, tests, vault write and captures"
    next_safe_action: "Load catalogue.json into the Anytype demo space over the captures leg's CDP session"
    blockers:
      - "The Anytype leg needs the CDP session the captures leg owns"
      - "The AppFlowy leg needs an operator window, since it exposes no DOM"
      - "The operator's device read is the only thing that shows computed and rollup cells resolving"
    key_files:
      - "tools/mock-data/catalogue.ts"
      - "tools/mock-data/emit-obsidian.ts"
      - "tools/mock-data/generate.ts"
      - "tools/mock-data/capture.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-049-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Whether AppFlowy's CSV import infers select options or needs them declared first"
    answered_questions:
      - "Which view types the generated databases declare: table, board, calendar, timeline, chart"
---
<!-- SPECKIT_TEMPLATE_SOURCE: implementation-summary | v2.2 -->
# Implementation Summary: Test Environments and Mock Data

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Status** | In Progress |
| **Date** | 2026-09-05 |
| **Branch** | `worktrees/068-test-environments` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-changed -->
## 2. WHAT CHANGED

`tools/mock-data/`, eight source files and three docs, 2442 lines of source. Nothing under `src/` was touched, so
no plugin behaviour changed.

| File | Role |
|---|---|
| `random.ts` | The seeded stream every value is drawn from. No unseeded fallback |
| `use-cases.ts` | Ten domain vocabularies. Data only, no logic |
| `catalogue.ts` | The facet schema, the record builder, the coverage function |
| `emit-obsidian.ts` | Vault notes and the `db_view: true` database note, YAML by hand |
| `emit-portable.ts` | `catalogue.json` and one CSV per use case |
| `generate.ts` | The CLI, including the guarded and idempotent vault write |
| `capture.mjs` | Mounts each database in the shipped renderer and photographs it |
| `catalogue.test.mjs` | 20 assertions across determinism, counts, coverage, relations, containment |
| `README.md`, `CODE.md`, `csv/README.md` | The folder docs the three-source threshold owes, one per folder that passes it |

Generated and committed: `catalogue.json` and `csv/*.csv`. Generated and **not** committed: the 336
vault files, which live in the operator's vault.

Also changed: the parent's `roadmap.md` §5.A gained a `049` row, and the parent's `goal.md` subgoal
table gained a `049` row.
<!-- /ANCHOR:what-changed -->

---

<!-- ANCHOR:evidence -->
## 3. EVIDENCE

| Claim | How it was observed |
|---|---|
| Ten use cases, 326 records, 28 columns, 5 views each | Generator run summary, one line per use case |
| 13 plugin column types and 24 neutral types in every use case | `catalogue.test.mjs`, reading record values rather than the schema |
| Byte-identical regeneration under a fixed seed | 3 assertions over JSON, CSV and the vault file set |
| The seed is actually read | A different seed produces different values: the control that stops the three above passing on a constant |
| 336 files written into the vault | The CLI's own count, and `find` reporting 367 files against a 31-file baseline |
| The 31 pre-existing vault files untouched | `sha256` of each before and after: `changed: 0  missing: 0` |
| A second run is a no-op | `0 written, 336 already current` |
| Each database renders at its record count | `capture.mjs`, ten `rows N/N … ok` lines, with the bundle manifest checked for the shipped renderer sources first |
| Every capture looked at | Ten PNGs opened. A wide frame was also taken to read the columns a 1440px viewport cuts off |
| 265 relation links resolve | Every `[[link]]` matched against the filenames written to disk |
<!-- /ANCHOR:evidence -->

---

<!-- ANCHOR:deviations -->
## 4. DEVIATIONS AND FINDINGS

**The ask named eight column types the plugin does not have.** Percent, date range, url, email,
phone, rating, progress and created/modified are not `ColumnDef` types. Each is a real capability
under another name, and the catalogue exercises the real one; the mapping is `spec.md` §3 D1. The
same instruction said to read `src/data/` for the exact list, so the code was followed and the delta
recorded rather than either being invented or dropped.

**Gallery views were not generated.** `list-renderer.ts` is already gone and gallery is being
withdrawn by the sibling packet, so ten generated gallery views would be fresh configuration for a
surface whose migration is the work in progress. Five view types, not seven. This is a deliberate
narrowing of "every view type available per product" and is `spec.md` §3 D2.

**The captures are not registered screenshot scenarios.** They photograph data, not a surface. A
registered scenario is re-verified against its declared sources on every future change, which would
make every renderer edit invalidate a picture of mock data. They live in the packet's git-ignored
`scratch/`.

**One measurement was wrong and was corrected before it was reported.** The first capture pass
reported exactly double the record count for all ten databases. `TableRenderer` emits a
`db-row-insert-line` between every pair of records, so `tbody tr` counts twice; the check now reads
the `data-note-database-row-path` attribute `renderRow` sets. Recorded because a doubled count that
looks plausible is the kind of number that gets quoted.

**Two columns cannot be shown by this evidence path.** Computed and rollup cells photograph empty.
Both are evaluated by the data pipeline against a live vault, not by the renderer, and the capture
constructs a renderer with no `App` — the same limit `tools/live/render-assertion-harness.ts`
documents for itself. They are configured in the written database notes; whether they resolve is what
the operator's device read answers.

**`tools/` is outside `tsconfig.json`'s `include`.** `npx tsc --noEmit` therefore does not typecheck
this generator, exactly as it does not typecheck the existing harnesses under `tools/live/` and
`tools/bench/`. Named here rather than left as a silent gap: the vitest run does exercise every
module, and the capture runner's esbuild step would fail on a malformed import, but neither is a
typecheck. Widening the `include` is out of this packet's scope and would change the gate for every
file under `tools/`.
<!-- /ANCHOR:deviations -->

---

<!-- ANCHOR:open -->
## 5. WHAT IS NOT DONE

Three acceptance rows, each blocked on something outside this session.

- **AC-007, Anytype.** `catalogue.json` is the input. It needs the CDP session the captures leg
  established.
- **AC-008, AppFlowy.** The ten CSVs are the input. AppFlowy exposes no DOM, so the import needs an
  operator at the machine.
- **AC-009, the device read.** The operator's own words, which under the parent's D3 is the only
  thing that closes a defect.
<!-- /ANCHOR:open -->
