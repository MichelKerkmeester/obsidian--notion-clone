---
title: "Testbed Proposal: what the operator's Database Testbed folder looks like after the consolidation"
description: "The adopted shape of the operator's consolidated vault: one Database Testbed folder holding the one database — its note at the root, its records inside it — with the guarded command that writes it and the Finance data it never touches. The vault itself was consolidated by the operator's action on 2026-09-10."
trigger_phrases:
  - "testbed proposal"
  - "database testbed consolidated shape"
  - "adopt the consolidated testbed"
importance_tier: "important"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Testbed Proposal: the operator's `Database Testbed/` after the consolidation

**Packet:** 074-test-data-consolidation · **Date:** 2026-09-08 · **Status:** Adopted — the vault was consolidated by the operator's action on 2026-09-10 · **Amended 2026-09-09** to the 0.0.36 ruling (one database, a table view and a board view — see §1A) · **Adopted and amended 2026-09-10**: the ~20:55 ruling puts the one database's note at the testbed root with its records inside it (§1, §2), which is the shape the hand consolidation of that day produced

The repository now builds one consolidated testbed database. This note is what the operator's own
vault looks like now that the consolidation is adopted. The consolidation of the vault itself was
the operator's action of 2026-09-10 — a hand consolidation, nine sub-database folders removed,
backup kept (its path recorded in the 005 handover entry, not in this code). The repository's own
code never wrote the vault; it now writes exactly the shape that consolidation produced.

---

## 1. WHAT THE FOLDER WOULD HOLD

```
Database Testbed/
├── Testbed.md                  ← the one consolidated database note: db_view: true, 28 columns, two
│                                 views — written, and kept current, by the generator
├── Records/                    ← 36 record notes, "01 — Full record, every facet filled.md" first,
│                               ←   "36 — Sparse record, title only.md" (deliberately empty) last
├── Attachments/
│   ├── audit-checklist.md      ← referenced by the records; kept, never written by the generator
│   └── release-notes.txt       ← referenced by the records; kept, never written by the generator
└── (anything else under the root — Finance among it — is the operator's own: reported as "not
    produced by this catalogue", never written, never deleted)
```

The database note declares, in the same on-disk shape the plugin already reads:

- **28 columns** — every plugin column type (text, number, date, datetime, currency, select,
  multi-select, status, checkbox, computed, relation, rollup, files) and every display variant
  (markdown text, the https/mailto/tel link schemes, rating, progress, ring);
- **two views** — one table, "All records", the everything-shown default; and one board, "By
  status", grouping on the status column. Amended 2026-09-09 to the 0.0.36 ruling: the note no
  longer declares the calendar, timeline, chart or the second sorted-and-filtered table the
  original proposal carried — the plugin retired those views (0.0.35) and the fixture now
  configures only what the operator ruled on;
- **a computed formula** over the number and currency columns, and a rollup counting the relation
  column — both configured in the note; the full record exercises them, the sparse record and
  whatever else stays deliberately empty.

The note is the overview: the folder is the one database, the note lists its views, the records
folder is its data. Alongside it, the Finance databases (Reports/Income/Expenses/Sales) remain the
operator's second dataset, exactly as 070 restored them to visibility — this proposal adds nothing
to them and takes nothing away.

## 2. HOW TO ADOPT IT (when, and only when, the operator wants it)

```
node tools/mock-data/generate.ts --vault "<path to the vault root>"
```

One command, guarded and idempotent:

- it refuses to write unless the target already looks like the testbed (the existing
  `Database Testbed/Testbed.md` is the marker);
- it writes only the database note at the testbed root — `Testbed.md`, which adoption keeps current —
  and the records under `Records/` inside the testbed folder; `README.md` and `Attachments/` are
  never touched;
- it skips any file whose bytes already match, so a re-run reports zero changes instead of
  churning timestamps in a synced vault;
- it never deletes: anything else under the testbed root is reported as
  "not produced by this catalogue, left untouched".

## 3. WHAT THE OPERATOR MAY THEN RETIRE (their call, not this packet's)

Adopted 2026-09-10: the nine earlier per-use-case folders (and the finance-flavoured tenth) the
catalogue used to generate were removed from the vault by the operator's own consolidation, with a
backup kept (its path recorded in the 005 handover entry, not in this code). These are the folders
the generator no longer produces:

```
Database Testbed/Project Tracker/
Database Testbed/CRM Contacts and Deals/
Database Testbed/Reading List/
Database Testbed/Recipes and Meal Plan/
Database Testbed/Habit and Health Log/
Database Testbed/Travel Itinerary/
Database Testbed/Home Inventory/
Database Testbed/Content Calendar/
Database Testbed/Course Notes and Study/
Database Testbed/Finance Reports/
```

(The last one is the catalogue's finance-flavoured fixture, not the operator's real Finance
databases — those live wherever the operator keeps them and are never in this folder's scope.)

## 4. WHAT THE NOTE IS FOR

One database, every column type and display variant, a table and a board, one record deliberately
carrying every property and one deliberately carrying nothing: the same population the repository's
harnesses mount. When
the operator looks at a defect report against their own testbed, the harness lanes that measure the
same renderer now measure the same records — the harness's picture and the vault's behaviour are
about one dataset, not two similar ones.
