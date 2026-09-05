---
title: "Tasks: Test Environments and Mock Data"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "049 tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Test Environments and Mock Data

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup — read before writing

The column set could not be inferred from the ask, and the database-note shape could not be inferred
from the parser.

- [x] T001 Read the plugin's real column types and display variants (`src/data/column-types.ts`,
      `src/data/types.ts`, `src/data/text-link-scheme.ts`, `src/data/file-fields.ts`)
- [x] T002 Read the on-disk database note and a record's frontmatter, so the emitted shape is the one
      the vault already holds (`Database Testbed/Testbed.md`, `Database Testbed/Records/`)
- [x] T003 Checksum the vault's 31 pre-existing files, so "untouched" is checkable afterwards
- [x] T004 Confirm which view types the plugin ships and keeps, given the two deprecation packets
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### The catalogue

- [x] T005 Seeded value stream with no unseeded fallback (`tools/mock-data/random.ts`)
- [x] T006 Ten domain vocabularies, data only, at least `recordCount` titles each
      (`tools/mock-data/use-cases.ts`)
- [x] T007 The facet schema binding frontmatter key, plugin column type and neutral type
      (`tools/mock-data/catalogue.ts`)
- [x] T008 The record builder: 20-40 records per use case, one deliberately empty, relations wired
      after every record exists (`tools/mock-data/catalogue.ts`)
- [x] T009 A coverage function reading the values records carry rather than the schema
      (`tools/mock-data/catalogue.ts`)

### The emitters

- [x] T010 [P] Vault notes and the `db_view: true` database note, YAML by hand
      (`tools/mock-data/emit-obsidian.ts`)
- [x] T011 [P] `catalogue.json` with a neutral type per column, and one CSV per use case
      (`tools/mock-data/emit-portable.ts`)
- [x] T012 The CLI, with the vault guard, the idempotent write and the run summary
      (`tools/mock-data/generate.ts`)

### The evidence

- [x] T013 Unit suite: determinism, counts, coverage, relations, vault containment
      (`tools/mock-data/catalogue.test.mjs`)
- [x] T014 Capture runner mounting the shipped `TableRenderer` and `CellRenderer`, with a bundle
      manifest check before anything mounts (`tools/mock-data/capture.mjs`)
- [x] T015 Folder documentation, which the three-source threshold owes
      (`tools/mock-data/README.md`, `CODE.md`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T016 Arm both negative controls and observe them red before counting either check as evidence
- [x] T017 Write the ten databases into the vault, then confirm the 31 pre-existing files are
      byte-identical and a second run reports zero changes
- [x] T018 Capture every generated database at desktop width, read every PNG, and record what the
      constructed mount cannot show
- [x] T019 `npx tsc --noEmit`, `npx vitest run` and `npm run gate`, each read by exit status
- [x] T020 `validate.sh --strict` on this packet and on the parent, taking the first `RESULT:` line
- [x] T021 Load `catalogue.json` into the Anytype demo space. **Done, 2026-09-05, over Anytype's own local HTTP API rather than the CDP session this task assumed — the app serves one on `localhost:31009` and it creates types, properties, tag options, objects with values and collection membership in bulk, so the whole data load needs no UI driving at all. Ten sets, 326/326 records, every one of the 24 neutral column types created as one of Anytype's eleven relation formats. `--verify` re-read every object back and matched 5990/5990 settable cells with 0 misses. Views are the one thing the API cannot make (`POST .../views` is 404), so `views.mjs` drives those over CDP: 60 views across the ten sets, 269/270 catalogue columns on the grids, a sort on each Grid view and a filter on each List view. 120 captures in both themes. Scripts and their contract: `tools/mock-data/anytype/README.md`**
- [ ] T022 Import the ten CSVs into the AppFlowy demo workspace, in an operator window. **Skipped by operator decision, 2026-09-05** (`decision-record.md` ADR-001) — AppFlowy is Flutter with no DOM or accessibility tree, so the import needs real mouse clicks the operator chose not to spend. The ten CSVs stay in `tools/mock-data/csv/` and the import steps stay written down in `screenshots/appflowy/README.md` for a future operator window
- [ ] T023 [B] Operator opens the upgraded vault on a device and reads the ten databases
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

T001 to T021 are done. T023 stays blocked on something this packet cannot supply: a device in the
operator's hands. **T021 turned out not to need the CDP session it was written against** — Anytype
serves a local HTTP API that does the whole data load in bulk, and only the views leg needed the
renderer. T022 is not blocked — it is skipped by operator decision, 2026-09-05
(`decision-record.md` ADR-001); the CSVs and import steps are retained for a future operator window
rather than being pursued now.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- `spec.md` §3 for the column mapping and the two decisions.
- `checklist.md` for the failing number each criterion started from.
- `acceptance-criteria.md` for the closure gate.
- `decision-record.md` ADR-001 for why AC-008/T022 is skipped rather than blocked.
- `tools/mock-data/CODE.md` for the generator's topology.
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

Read exit codes without a pipe: `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. `validate.sh` output continues past the folder asked about when a parent recurses into its
children, so the **first** `RESULT:` line is the folder's own verdict.
<!-- /ANCHOR:protocol -->

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] The plugin's column set read from source rather than from the ask's wording.
- [x] The database-note shape read from disk rather than derived from the parser.
- [x] The vault's file set checksummed before the first write.
- [x] The rollback written before the irreversible step: remove the ten named folders.
<!-- /ANCHOR:pre-impl -->

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] No spec path, requirement id, task id or checklist id in any comment or test name.
- [x] Module banners on every source file, matching the `tools/` convention.
- [x] No dead code, commented-out code or debug logging.
- [x] No new dependency. YAML is emitted by hand rather than pulling a parser in.
<!-- /ANCHOR:code-quality -->

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] 20 assertions across 5 groups, all passing.
- [x] Both negative controls armed and observed red, then disarmed and observed green.
- [x] The capture runner asserts row counts rather than trusting that a screenshot succeeded.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] All ten use cases, not a representative subset.
- [x] All three outputs, not the vault alone.
- [x] The two competitor legs named as blocked or skipped rather than quietly dropped: Anytype (T021) is **done**, loaded over the app's local HTTP API rather than the CDP session it was blocked on; AppFlowy (T022) is skipped by operator decision (`decision-record.md` ADR-001).
<!-- /ANCHOR:fix-completeness -->

<!-- ANCHOR:security -->
## Security

- [x] No credential, token or personal datum generated. Every name is invented; every host is under
      `example.com`.
- [x] The vault path is passed on the command line and never stored.
- [x] `.obsidian/` and `data.json` are never touched.
<!-- /ANCHOR:security -->

<!-- ANCHOR:docs -->
## Documentation

- [x] `README.md` and `CODE.md` under `tools/mock-data/`.
- [x] Both record what a green run does not prove.
<!-- /ANCHOR:docs -->

<!-- ANCHOR:file-org -->
## File Organization

- [x] Eight source files and two docs, all under `tools/mock-data/`.
- [x] Generated portable outputs beside the generator; generated vault output in the vault and not
      committed.
- [x] Captures in the packet's git-ignored `scratch/`, not in `screenshots/`.
<!-- /ANCHOR:file-org -->

<!-- ANCHOR:summary -->
## Verification Summary

Five of the eight goal criteria are closed on evidence recorded in `checklist.md`, and the AppFlowy
import closes a sixth way — skipped by operator decision, 2026-09-05 (`decision-record.md` ADR-001).
Two stay open and neither is closeable from this session: the Anytype load and the operator's own
device read.
<!-- /ANCHOR:summary -->
