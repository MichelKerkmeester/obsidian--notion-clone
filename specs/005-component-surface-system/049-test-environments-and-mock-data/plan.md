---
title: "Implementation Plan: Test Environments and Mock Data"
description: "Read the existing testbed and the plugin's real column set first, build one schema dressed in ten vocabularies, then translate three ways and prove the vault write is safe before it runs."
trigger_phrases:
  - "implementation plan"
  - "mock data plan"
  - "049 plan"
  - "catalogue emitter plan"
importance_tier: "normal"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Test Environments and Mock Data

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, run directly by Node's type stripping. No build step |
| **Framework** | None. The emitters produce text; the capture runner uses esbuild and playwright-core, both already dependencies |
| **Storage** | The repository for the portable outputs, the operator's vault for the Obsidian ones |
| **Testing** | Vitest, at `tools/mock-data/catalogue.test.mjs`, which the existing `tools/**/*.test.mjs` include already picks up |

### Overview

Build one schema and dress it ten ways, rather than writing ten databases.

The acceptance question is whether three environments hold the same thing, and the cheapest way to
answer it is to make the sameness structural. `catalogue.ts` owns the facet list, the column order
and the record builder; `use-cases.ts` owns nothing but vocabulary. An emitter then translates a
catalogue it did not build. Ten hand-written databases would have needed a check that they agreed;
this needs a check that the emitters translate, which is a smaller claim about smaller code.

The one thing that could not be inferred was the plugin's real column set, so it was read rather than
assumed: `src/data/column-types.ts` and `src/data/types.ts` for the thirteen types and the display
variants, and the on-disk `Database Testbed/Testbed.md` for the shape a database note actually takes.
`parseDatabaseConfig` absorbs several older schema generations, so writing to satisfy the parser
would have produced a file no version of the plugin ever wrote.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- The plugin's real column types read from source, not from the ask's wording.
- The on-disk database-note shape read from the vault.
- The vault's pre-existing file set checksummed, so "untouched" is checkable afterwards.

### Definition of Done

- `npx vitest run`, `npx tsc --noEmit` and `npm run gate` all green, each read by exit status.
- Every generated database mounted in the shipped renderer, every capture opened and looked at.
- The vault's 31 pre-existing files byte-identical after the write.
- A second generator run reporting zero changes.
- `validate.sh --strict` reporting `RESULT: PASSED` on this packet and on the parent.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

One source of shape, one source of randomness, three translators.

```
use-cases.ts ─┐
               ├─► catalogue.ts ─┬─► emit-obsidian.ts  ─► vault
random.ts    ─┘                  ├─► emit-portable.ts  ─► catalogue.json, csv/
                                 └─► capture.mjs       ─► PNG per database
```

### Key Components

| Component | Responsibility |
|---|---|
| `SeededRandom` | Every drawn value. No unseeded fallback, because a fallback runs exactly when a caller forgets |
| `FACET_SHAPES` | Binds a frontmatter key, a plugin column type and a neutral type into one position |
| `buildCatalogue` | The record set, and the only place a value is decided |
| `emitObsidian` | Vault files. Hand-written YAML, quoting everything |
| `emitJson` / `emitCsv` | The two portable outputs |
| `generate.ts` | The CLI and the guarded, idempotent vault write |
| `capture.mjs` | Bundles the shipped renderer and photographs each database |

### Data Flow

A facet is the unit. A record's values are keyed by facet, never by frontmatter key, so every emitter
has the meaning and the type available at the point it translates. The Obsidian emitter turns a facet
into a `ColumnDef` plus its display properties; the portable emitter turns the same facet into a
neutral type; the capture runner turns it into a `ColumnDef` again, independently, so a capture can
disagree with the emitter.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

1. **Read.** The plugin's column types, the display variants, the on-disk database note, the
   frontmatter shape of an existing record, and the vault's current file set.
2. **Build.** The seeded stream, the facet schema, ten vocabularies, the record builder.
3. **Translate.** The three emitters, then the CLI.
4. **Prove.** The unit suite with both negative controls armed and observed red. Then the capture
   runner, then the vault write, then the gates.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Three properties, each with a way of failing silently, each with a control.

**Determinism** fails silently because a second run still produces valid data, just different data,
in a vault the operator has already looked at. Control: a build under a different seed must differ,
or the check would also pass for a generator that ignored its seed.

**Coverage** fails silently because a column can be configured and never filled. The assertion reads
the values records carry, not the schema. Control: suppressing one facet must redden it naming the
missing type.

**Vault containment** is asserted rather than trusted because the target is outside the repository
and git holds no copy of it.

The capture runner is the fourth check and is not a unit test: it prints the row, header, cell, link
and checkbox counts the renderer actually built, and fails when a row count does not match its record
count.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

None added. `esbuild` and `playwright-core` are already devDependencies, used by every other
constructed harness in `tools/`. YAML is emitted by hand rather than pulling a parser in for four
scalar shapes; the plugin's own `stringifyYaml` was not an option, since it comes from the `obsidian`
module, which only exists inside the app.
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

**Repository:** revert the commits. Every file in `tools/mock-data/` is new, and nothing under `src/`
was touched, so there is no behaviour to restore.

**Vault:** remove the ten generated folders under `Database Testbed/`. They are
`Project Tracker`, `CRM Contacts and Deals`, `Reading List`, `Recipes and Meal Plan`,
`Habit and Health Log`, `Travel Itinerary`, `Home Inventory`, `Content Calendar`,
`Course Notes and Study` and `Finance Reports`. Removing them restores the prior state exactly,
because the 31 pre-existing files were never opened.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| This packet | Depends on | Why |
|---|---|---|
| Obsidian leg | nothing | It reads the plugin's own source and the vault's own shape |
| Anytype leg | the CDP session `047`'s capture leg established | An instrument, not an outcome. Anytype exposes a DOM over CDP, so an agent can drive it |
| AppFlowy leg | an operator window | AppFlowy exposes no DOM, so the import is a manual step someone has to be present for |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Leg | Size | State |
|---|---|---|
| Catalogue, emitters, tests | 2442 lines across 8 source files | Done |
| Vault write and its guards | inside `generate.ts` | Done, 336 files |
| Capture evidence | 10 PNGs at desktop width | Done, all read |
| Anytype load | one agent session, local HTTP API for the data and CDP for the views | Done, 326 records, 60 views, 120 captures |
| AppFlowy import | ten CSV imports in an operator window | Open |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist

- The vault's pre-existing files checksummed before the first write.
- The target proved to be the testbed by the presence of `Testbed.md`.
- The emitted path set asserted to start inside `Database Testbed/` and to avoid the four entries the
  existing testbed owns.

### Rollback Procedure

Remove the ten named folders. Nothing else in the vault was written, and no file outside them was
opened.

### Data Reversal

None needed. Nothing was migrated, transformed or deleted; the write was purely additive.
<!-- /ANCHOR:enhanced-rollback -->
