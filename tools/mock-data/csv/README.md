---
title: "tools/mock-data/csv: the CSV export files"
description: "One generated CSV per use case, written by the catalogue and never edited by hand, because an edit here would make the CSV disagree with the vault and the JSON built from the same records."
trigger_phrases:
  - "csv export"
  - "mock data csv"
  - "test environment csv export"
---

# tools/mock-data/csv: the CSV export files

Ten generated files, one per use case, a generic CSV export for any tool that imports one. They are
output, not source.

## 1. REGENERATE, DO NOT EDIT

```
node tools/mock-data/generate.ts
```

Every file here is rewritten from `catalogue.json`'s own record set. A hand edit survives until the
next run and, until then, makes this CSV disagree with the vault notes and the JSON built from the
same records, which is the one thing the whole catalogue exists to prevent.

## 2. SHAPE

The first column is `Title`, because a CSV import has no other way to name a row. The remaining
twenty-seven are the use case's columns in catalogue order.

A CSV is a grid of strings and carries no types: a multi-select arrives as `a, b, c`, a checkbox as
`true` or `false`, and a date as `YYYY-MM-DD`. Whether a given import tool infers a select column
from repeated values or needs its options declared first varies by tool, and is the reason
`catalogue.json` exists beside these files — it carries a neutral type per column, and a loader that
has both should read the types from there.

Values holding a comma, a quote or a line break are quoted per RFC 4180, so a wrapped note stays one
field rather than becoming three rows.

## 3. WHAT IS NOT IN HERE

The created and modified columns carry no value. In a vault they come from the filesystem, and a
synthesized timestamp would be the one field where the three environments silently disagree.
