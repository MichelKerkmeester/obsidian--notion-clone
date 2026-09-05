---
title: "tools/mock-data: the shared test-environment catalogue"
description: "One deterministic record set, ten use cases, three destinations — the Obsidian vault, an Anytype demo space and a CSV export for any tool that reads one — all built from the same catalogue so a difference between them is a finding rather than noise."
trigger_phrases:
  - "obsidian plugin mock data generator"
  - "test environment catalogue"
  - "anytype csv export test data"
  - "database testbed use cases"
---

# tools/mock-data: the shared test-environment catalogue

`tools/mock-data/` builds one deterministic record set and emits it three ways: Obsidian notes with
frontmatter and the database files the plugin reads, a product-neutral `catalogue.json`, and one CSV
per use case.

It exists because comparing this plugin against Anytype — and generating a CSV export for any tool
that imports one — was, until now, working from three different data sets. The single vault database
held finance-flavoured project data, so every check it could support was a check about money and
status, and any difference could always be explained away as a difference in what the data held.

## 1. QUICK START

```
node tools/mock-data/generate.ts                      # catalogue.json + csv/
node tools/mock-data/generate.ts --vault "<vault>"    # also the Obsidian notes
node tools/mock-data/capture.mjs                      # photograph each database in the real renderer
npx vitest run tools/mock-data/catalogue.test.mjs      # determinism, counts, coverage
```

Node runs the TypeScript directly; there is no build step.

## 2. WHAT IT PRODUCES

Ten use cases, 326 records, 28 columns each, five views each.

| Use case | Records |
|---|---:|
| Project Tracker | 36 |
| CRM Contacts and Deals | 34 |
| Reading List | 32 |
| Recipes and Meal Plan | 30 |
| Habit and Health Log | 40 |
| Travel Itinerary | 28 |
| Home Inventory | 34 |
| Content Calendar | 32 |
| Course Notes and Study | 30 |
| Finance Reports | 30 |

Every use case carries the same 28 columns, which is what makes the three environments comparable.
Between them the columns exercise all thirteen `ColumnDef` types the plugin declares, plus the five
display variants that are not types: markdown text, the three link schemes, and the rating, progress
and ring number styles.

The last record of every use case is deliberately empty. An environment with no empty row cannot
answer what an empty cell renders as.

## 3. THE THREE OUTPUTS

**Obsidian.** `--vault` writes `Database Testbed/<Use Case>/<Use Case>.md` (a `db_view: true`
database note) and `Database Testbed/<Use Case>/Records/*.md`. The existing `Testbed.md`, `README.md`,
`Records/` and `Attachments/` are never opened. The write is idempotent: a file whose bytes already
match is skipped, so a second run reports zero changes rather than churning timestamps in a synced
vault. Nothing is ever deleted; a folder the catalogue no longer produces is reported and left alone.

**`catalogue.json`.** Every column carries a neutral type — `money`, `rating`, `percent`, `tag`,
`person` and so on — so an agent loading Anytype picks its own native field instead of guessing from
the value.

**`csv/<use-case>.csv`.** One file per use case, a generic CSV export for any tool that imports one.
The first column is the record title, because a CSV has no other way to name a row.

Neither portable output invents a created or modified timestamp. Those two columns are declared with
`source: "file"` and carry no value, because in a vault they come from the filesystem.

## 4. VIEWS

Each database declares table, board, calendar, timeline and chart. Those are the five view types the
plugin ships and keeps. The list renderer has already been removed from the tree, and gallery is
being withdrawn, so a generated gallery view would be new configuration for a surface whose migration
path is the work in progress.

## 5. WHAT A GREEN RUN HERE DOES NOT PROVE

`capture.mjs` mounts the shipped `TableRenderer` and `CellRenderer` in headless Chrome and writes one
PNG per database. It constructs a renderer, never a host: there is no live Obsidian `App`, vault or
metadata cache, so **the computed and rollup columns render empty in a capture**. Both are evaluated
by the data pipeline, not by the renderer. In the vault they resolve; here they do not, and a capture
showing them blank is the harness's limit rather than a defect in the data.
