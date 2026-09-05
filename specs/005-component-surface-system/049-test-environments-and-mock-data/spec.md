---
title: "Feature Specification: Test Environments and Mock Data"
description: "One deterministic catalogue of ten use cases, built once and emitted three ways, so the Obsidian vault, an Anytype demo space and an AppFlowy workspace hold the same records and a difference between them is a finding about the products."
trigger_phrases:
  - "test environments spec"
  - "mock data catalogue spec"
  - "049 spec"
  - "anytype appflowy test data"
  - "database testbed upgrade"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Test Environments and Mock Data

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/068-test-environments` |
| **Parent Spec** | ../spec.md |
| **Phase** | 49 of 49 |
| **Predecessor** | 047-competitor-references-and-pm-alignment |
| **Successor** | None |
| **Handoff Criteria** | All three environments hold the same ten use cases at the same record counts, and the operator has opened the upgraded vault on a device |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is a standard child of `005-component-surface-system`. It produces the shared data the
comparison work in `047` has been missing, and it depends on nothing that packet produces: it reuses
the CDP session that leg established with Anytype, which is an instrument, not an outcome.

`recommend-level.sh --loc 2442 --files 10 --db` returns 53/100 at 92% confidence, Level 2, with a
phase score of 20 against a threshold of 25. Below the threshold, so a standard child.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The vault held one test database. `Database Testbed/Testbed.md` defines `testbed-db` over twenty-nine
records in `Database Testbed/Records/`, and every one of them is a finance-flavoured delivery item:
budget, amount, status, priority, a computed net and margin. It was built to exercise column types
and views, and it does that well.

What it cannot do is support a comparison. The competitor captures under `screenshots/anytype/` and
`screenshots/appflowy/` photograph whatever those apps ship as demo content, so a board that looks
better in Anytype might be a better board or might be better data, and nothing in the repository can
tell the two apart. The same is true of every claim about density, wrapping, truncation and empty
states: all of them are claims about a renderer, all of them were tested against one data shape.

### Purpose

Give all three products the same records, so a visible difference is a product difference.

### The operator's ask, verbatim, 2026-09-05

> "first set similar test environment like Obsidian [in Anytype], add a lot of mock data, various use
> cases not just finance data; do same for AppFlowy; and upgrade test environment Obsidian; make
> dedicated phase for this."
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The shape to build toward

One `buildCatalogue()` produces ten use cases. Each carries the same twenty-eight columns and the
same five views, and differs only in vocabulary and values. Three emitters translate it:

| Output | Consumer | Path |
|---|---|---|
| Markdown notes plus a `db_view: true` database note | Obsidian, this plugin | `Database Testbed/<Use Case>/` in the vault |
| A product-neutral JSON with a type per column | an agent loading Anytype over its API | `tools/mock-data/catalogue.json` |
| One CSV per use case | AppFlowy's CSV import | `tools/mock-data/csv/<id>.csv` |

An emitter can be wrong about a product. It cannot be wrong about which records exist, because it
does not choose them.

### Decision D1 — the column set is the plugin's, not the ask's wording

The ask named percent, date range, url, email, phone, rating, progress, person and created/modified
as column types. The plugin declares thirteen and none of those is one of them. Each maps to a real
capability under another name, and the catalogue exercises the real one:

| Asked for | What the plugin actually has | Where |
|---|---|---|
| percent | `number` with `numberDisplayStyle: "progress"`, or a `computed` returning a percentage | `types.ts:31` |
| url, email, phone | `text` with `textRenderMode: "link"` and `textLinkScheme` https / mailto / tel | `text-link-scheme.ts:17` |
| date range | a start and an end `date` column, which the calendar and timeline read as a range | `Testbed.md` view config |
| rating, progress | `number` with `numberDisplayStyle` `rating`, `progress` or `ring` | `types.ts:31` |
| formula | `computed`, with the expression in `computedFields` | `types.ts` ColumnDef |
| person | `select` over a fixed roster; the plugin has no person type | `column-types.ts` |
| tag | the `tags` key, special-cased as an Obsidian tag list | `column-types.ts:isObsidianTagsKey` |
| created, modified | `file.ctime` and `file.mtime` built-in fields | `file-fields.ts:30` |

### Decision D2 — five view types

Table, board, calendar, timeline, chart. `src/views/list-renderer.ts` no longer exists, and gallery
is being withdrawn by `007-gallery-view-deprecation`. Ten generated gallery views would be fresh
configuration for a surface whose migration is in progress.

### In Scope

- `tools/mock-data/`: the catalogue, the vocabularies, three emitters, the CLI, the unit suite and a
  capture runner.
- Writing the generated databases into `Database Testbed/` beside the existing Testbed.
- The parent's §5.A row and `goal.md` subgoal-table entry.

### Out of Scope

- Any change to plugin behaviour. Nothing under `src/` is touched.
- Registering screenshot scenarios. These captures photograph data, not a surface.
- The existing `Testbed.md`, `README.md`, `Records/` and `Attachments/`, which are never opened.
- `.obsidian/` and `data.json`, in any form.

### Files to Change

| File | Change |
|---|---|
| `tools/mock-data/random.ts` | new: the seeded stream every value is drawn from |
| `tools/mock-data/use-cases.ts` | new: ten domain vocabularies, data only |
| `tools/mock-data/catalogue.ts` | new: the facet schema and the record builder |
| `tools/mock-data/emit-obsidian.ts` | new: vault notes and the database note |
| `tools/mock-data/emit-portable.ts` | new: `catalogue.json` and the CSVs |
| `tools/mock-data/generate.ts` | new: the CLI, including the guarded vault write |
| `tools/mock-data/capture.mjs` | new: mounts each database in the shipped renderer |
| `tools/mock-data/catalogue.test.mjs` | new: determinism, counts, coverage, containment |
| `tools/mock-data/README.md`, `CODE.md` | new: the folder docs the threshold owes |
| `specs/005-component-surface-system/roadmap.md` | §5.A gains a `049` row |
| `specs/005-component-surface-system/goal.md` | the subgoal table gains a `049` row |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** One catalogue produces every environment. No emitter invents, drops or reorders a
  record.
- **REQ-002** Regeneration is byte-stable under a fixed seed, and differs under a different seed.
- **REQ-003** The vault write never opens a file the existing testbed owns, never writes outside
  `Database Testbed/`, and never deletes.
- **REQ-004** Every plugin column type is exercised by a real value in every use case.

### P1 - Required (complete OR user-approved deferral)

- **REQ-005** Each use case holds between twenty and forty records, and at least one record is
  entirely empty.
- **REQ-006** Every relation points at a record that exists in the same use case.
- **REQ-007** Each generated database opens in the shipped table renderer at desktop width, with a
  capture read by the author.
- **REQ-008** The generator carries folder documentation, since the folder passes the three-source
  threshold.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Measured, with the number that would have failed recorded first. The full table with evidence is
`checklist.md`; `acceptance-criteria.md` carries the closure gate.

| # | Criterion | Target |
|---|---|---|
| SC-1 | Use cases beyond finance | 9, plus finance kept |
| SC-2 | Records per use case | 20-40, none outside |
| SC-3 | Plugin column types covered per use case | 13 of 13 |
| SC-4 | Byte-identical re-run, same seed | all three outputs |
| SC-5 | Pre-existing vault files changed | 0 of 31 |
| SC-6 | Databases rendering at their record count | 10 of 10 |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Mechanism | Mitigation |
|---|---|---|
| A vault overwrite cannot be undone | git holds no copy of the vault | The writer proves the target holds `Testbed.md` first, writes only inside per-use-case folders, skips matching bytes, never deletes |
| A synced vault churns on every run | iCloud re-uploads any file whose mtime moves | `writeIfChanged` compares bytes before opening a file for write |
| The generator drifts from the plugin's schema | `parseDatabaseConfig` absorbs several older schema generations and would accept a file no version ever wrote | The emitted shape was copied from the on-disk `Testbed.md`, and the capture mounts the shipped renderer over it |
| A capture photographs an empty box | a screenshot succeeding says nothing about what it shows | Row, header, cell, link and checkbox counts are printed and asserted, and every PNG was opened |
| Anytype or AppFlowy cannot express a type | neither ships this plugin's column set | The JSON carries a neutral type per column so a loader picks its own native field rather than guessing |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

- **Q1** Does the Anytype loader map a rollup to a native relation aggregate, or leave it unset? The
  neutral type says `rollup`; what Anytype does with it is the loader's call.
- **Q2** Does AppFlowy's CSV import infer a select column from repeated values, or does every option
  need declaring in the UI first? This decides whether the CSV alone is enough.
- **Q3** Operator-owned: is 326 records across ten databases the right size for a phone device check,
  or does a device pass want a smaller subset?
<!-- /ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance

The generator runs in under a second and writes 347 files. The capture runner builds one esbuild
bundle and drives ten mounts in one browser session. Neither is on any hot path; both are developer
tools run by hand.

### Security

No credential, token or personal datum is generated. Every name in the vocabularies is invented, and
every host is under `example.com`. The one real path any output names is the operator's own vault
root, passed on the command line and never stored.

### Reliability

The single reliability property that matters is that a second run is a no-op. It is observed rather
than assumed: the CLI counts written against already-current files and prints both.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries

- A record with no values at all: the last record of every use case, so every environment has an
  empty row to render.
- A title long enough to truncate: one project-tracker record carries a 118-character title.
- A multi-select holding one value beside one holding six, since a fixed count never wraps or always
  does.
- A currency with two decimals beside a number with none, and a zero-valued budget.
- A name carrying a diacritic, which the generated email address must transliterate rather than drop.

### Error Scenarios

- The vault root does not hold `Testbed.md`: the writer refuses with the path it checked.
- An unknown CLI argument: the parser throws rather than ignoring it.
- The capture bundle stops importing a shipped renderer: the run fails before mounting anything.
- A use case declares fewer titles than records: the builder throws rather than wrapping, which would
  silently produce duplicate note filenames.

### State Transitions

- First run into an empty testbed: every file written.
- Second run, no change: every file skipped.
- Run after a vocabulary edit: only the affected use case's files rewritten.
- Run under a different seed: values change, record identities do not, so no note is renamed.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

`recommend-level.sh --loc 2442 --files 10 --db` returns 53/100 at 92% confidence: Level 2, phase
score 20 of a 25 threshold. The complexity is entirely in the data, not the control flow. There is
one branch worth calling out — the facet-to-display mapping is written twice, once in
`emit-obsidian.ts` for the vault and once in `capture.mjs` for the mount — and the duplication is
deliberate: the capture must be able to disagree with the emitter, or it would be photographing the
emitter's opinion rather than the renderer's behaviour.
<!-- /ANCHOR:complexity -->
