---
title: "tools/mock-data: generator topology and flow"
description: "Code map for the mock-data catalogue: one schema shape dressed in ten vocabularies, one seeded stream, three emitters that translate and never invent."
trigger_phrases:
  - "mock data generator code map"
  - "catalogue facet schema"
  - "deterministic test data seed"
---

# tools/mock-data: generator topology and flow

---

## 1. OVERVIEW

Eight source files, one direction of flow:

```
use-cases.ts  ─┐
                ├─► catalogue.ts ─┬─► emit-obsidian.ts ─► vault notes
random.ts     ─┘                  ├─► emit-portable.ts ─► catalogue.json + csv/
                                  └─► capture.mjs      ─► PNG per database
                     generate.ts is the CLI that drives the first two emitters
```

`catalogue.ts` is the only file that decides shape. `use-cases.ts` is only vocabulary. That split is
what makes "the three environments hold the same thing" a property of the code rather than a claim in
a document: the shape is one decision made once, and ten vocabularies cannot change it.

---

## 2. THE FACET

A facet is one column position in the shared schema. It binds three things that would otherwise
drift apart:

- the frontmatter key and label the vault sees,
- the plugin `ColumnDef` type the renderer branches on,
- the neutral type another product's loader reads.

`FACET_SHAPES` in `catalogue.ts` is that binding, and `FACETS` is the column order every database
gets. A record's values are keyed by facet, never by key, so an emitter always has both the type and
the meaning available at the point it translates.

Two facets have no exact plugin type and are mapped to the nearest real one rather than invented. A
person is a `select` over a fixed roster, because the plugin has no person column. A tag is the
`tags` key, which `column-types.ts` special-cases as an Obsidian tag list. Both keep an honest
neutral type (`person`, `tag`) so a loader elsewhere can pick its own native shape.

---

## 3. DETERMINISM

Every drawn value comes from `SeededRandom`, seeded from a string, and every date is an offset from
one frozen anchor: `new Date(2026, 2, 25, 13, 45)`, the same instant the render-assertion bundle
freezes its clock to. Nothing reads `Math.random()` and nothing reads the wall clock.

There is no unseeded fallback, deliberately. A fallback makes the non-deterministic path the one that
runs when a caller forgets, which is exactly when it is invisible.

Record identities are declared rather than drawn: the titles and their order are literals, so a
different seed moves the values and never the filenames. That is what keeps the vault write
idempotent across a seed change.

---

## 4. THE THREE EMITTERS

`emit-obsidian.ts` writes YAML by hand. The plugin's own `stringifyYaml` comes from the `obsidian`
module, which only exists inside the app. The hand serializer errs toward quoting everything: an
unquoted `2026-03-25` is a date to a YAML parser and a string to this plugin, and that difference is
invisible until a cell renders wrong.

`emit-portable.ts` writes the JSON schema and the CSV rows. The JSON is the schema of record; a CSV
is a grid of strings and cannot carry a type at all.

`capture.mjs` bundles the shipped `TableRenderer` and `CellRenderer` with esbuild and drives them in
headless Chrome. It checks the bundle's own input manifest for `src/views/table-renderer.ts` and
`src/views/cell-renderer.ts` before mounting anything: a bundle that stopped importing the shipped
renderer would photograph something else and look identical.

---

## 5. TWO THINGS THAT LOOK LIKE BUGS AND ARE NOT

**Record rows are counted by attribute, not by `tr`.** `TableRenderer` emits a
`db-row-insert-line` between every pair of records, so `tbody tr` reads exactly double the record
count. `capture.mjs` counts `tbody tr[data-note-database-row-path]`, which is the attribute
`renderRow` sets.

**Computed and rollup cells are empty in a capture.** Both are evaluated by the data pipeline against
a live vault, not by the renderer. The capture constructs a renderer with no `App`, so they resolve
to nothing. They are configured correctly and they fill in the vault.

---

## 6. VAULT SAFETY

The vault is outside the repository and git holds no copy of it, so an overwrite there cannot be
undone. Three guards, in `generate.ts`:

1. The target must already hold `Database Testbed/Testbed.md`. Nothing is written to a folder that
   has not been proved to be the testbed.
2. Writes go only under `Database Testbed/<Use Case>/`. The unit suite asserts every emitted path
   starts inside the testbed root and never targets the four entries the existing testbed owns.
3. A file whose bytes already match is skipped, and nothing is ever deleted.
