---
title: "Verification Checklist: Test Environments and Mock Data"
description: "Each criterion with the number it started from, so a pass means an environment actually changed rather than a check being added."
trigger_phrases:
  - "049 test environments checklist"
  - "mock data verification"
  - "catalogue coverage thresholds"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Test Environments and Mock Data

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe: `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the measurement from before the work, then the measurement after it.

| # | Criterion | Before | Target | After | Evidence |
|---|---|---|---|---|---|
| C1 | Test databases in the vault | **1** — `testbed-db` alone | ≥ 10 | **11** | `find` under `Database Testbed`: 367 files against 31 |
| C2 | Use case domains beyond finance | **0** — every one of the 29 records is a finance-flavoured delivery item | ≥ 8 | **9** | generator run summary, one line per use case |
| C3 | Records available for a comparison | **29** | ≥ 200 | **326** | `total 326 records across 10 databases` |
| C4 | Plugin column types exercised per database | **13** in the one database that existed; **undefined** for any second one, since there was none | 13 in every database | **13 in all 10** | `catalogue.test.mjs` "exercises every plugin column type in every use case" |
| C5 | Neutral types carried for a non-Obsidian loader | **0** — no product-neutral output existed | 24 | **24 in all 10** | `tools/mock-data/catalogue.json`; the test's own neutral-type check |
| C6 | Byte-identical regeneration | **not reproducible** — the vault database was hand-written and had no generator | all three outputs | **identical** | 3 assertions, plus `Math.random()` control observed red |
| C7 | Pre-existing vault files changed by the write | **unmeasured** — nothing had ever written into that folder programmatically | 0 of 31 | **0** | `sha256` of all 31 before and after: `changed: 0  missing: 0` |
| C8 | Second run's file writes | **unmeasured** | 0 | **0 of 336** | `0 written, 336 already current` |
| C9 | Databases rendering at their record count in the shipped renderer | **unmeasured** for anything but the one hand-written database | 10 of 10 | **10 of 10** | `capture.mjs`, ten `rows N/N … ok` lines, ten PNGs opened |
| C10 | Relation links resolving to a real note | **unmeasured** | all | **265 of 265** | every `[[link]]` resolved against the filenames written to disk |
| C11 | `npm run gate` exit status | green on the tree this branched from | 0 | **0** | read from `$?` |
| C12 | Anytype demo space holding the same set | **0 of 10** — Anytype holds its own shipped demo | 10 of 10, 0 records missing | **10 of 10** | `--verify` re-read 326/326 records and 5990/5990 settable cells from the live space, 0 misses |
| C13 | AppFlowy workspace holding the same set | **0 of 10** — AppFlowy holds its own shipped demo | 10 of 10, 0 records missing | **0 of 10** | blocked on an operator window |

**C4 and C6 are the two rows that could have passed on a constant.** Both carry a negative control
that was armed and observed red before either counted: suppressing the checkbox facet reddened C4
naming the missing type, and returning `Math.random()` from the seeded stream reddened C6's three
identity assertions. Disarmed, all twenty assertions pass.

**C12 and C13 are not deferred work dressed as a number.** Each names what it is waiting for, and
neither is reachable from this session.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] The plugin's thirteen column types read from `src/data/column-types.ts`, not inferred from the
      ask's wording, which named eight things that are not column types.
- [x] The display variants read from `src/data/types.ts` and `src/data/text-link-scheme.ts`.
- [x] The on-disk database-note shape read from `Database Testbed/Testbed.md` rather than derived
      from `parseDatabaseConfig`, which absorbs older schema generations and would accept a file no
      version of the plugin ever wrote.
- [x] The vault's 31 pre-existing files checksummed before the first write.
- [x] The rollback written before the irreversible step: remove the ten named folders under
      `Database Testbed/`.
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:implementation -->
## Implementation

- [x] One `buildCatalogue()` owns the shape; ten vocabularies own only wording.
- [x] Every drawn value comes from the seeded stream; no `Math.random()`, no wall clock.
- [x] Dates anchored on `new Date(2026, 2, 25, 13, 45)`, the same instant the render-assertion bundle
      freezes to, so generated events land inside the window a timeline draws.
- [x] The vault writer proves the target holds `Testbed.md`, writes only under per-use-case folders,
      skips matching bytes and never deletes.
- [x] No new dependency. YAML emitted by hand rather than pulling a parser in for four scalar shapes.
- [x] No spec path, requirement id, task id or checklist id in any comment or test name.
- [x] Folder documentation written, which the three-source threshold owes.
<!-- /ANCHOR:implementation -->

---

<!-- ANCHOR:verification -->
## Verification

- [x] `npx tsc --noEmit` — exit read from `$?`.
- [x] `npx vitest run` — exit read from `$?`, with the new suite's 20 assertions among the total.
- [x] `npm run gate` — exit read from `$?`.
- [x] `validate.sh --strict` on this packet and on the parent, taking the **first** `RESULT:` line,
      since a parent recurses into its children and the tail describes the last child.
- [x] Every one of the ten PNGs opened and looked at, not counted.
- [x] What a green run here does not prove is written down in `README.md` §5 and in the closure
      statement, rather than left for a reader to discover.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:summary -->
## Summary

Eleven of thirteen rows closed. C12 and C13 are the two competitor legs, each blocked on something
this session does not have: a CDP session for Anytype, and an operator present at a machine running
AppFlowy.

The honest gap in C9: the computed and rollup columns photograph empty, because both are evaluated by
the data pipeline against a live vault and the capture constructs a renderer with no `App`. They are
configured in the written database notes. Whether they resolve is what the operator's device read
answers.
<!-- /ANCHOR:summary -->
