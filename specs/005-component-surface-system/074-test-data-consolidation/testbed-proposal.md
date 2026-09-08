---
title: "Testbed Proposal: what the operator's Database Testbed folder looks like after the consolidation"
description: "A proposal, not a change: the consolidated vault shape the packet proposes, the guarded command that writes it, and the folders the operator may retire. The operator's vault folder is never touched by this repository."
trigger_phrases:
  - "testbed proposal"
  - "database testbed consolidated shape"
  - "adopt the consolidated testbed"
importance_tier: "important"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Testbed Proposal: the operator's `Database Testbed/` after the consolidation

**Packet:** 074-test-data-consolidation · **Date:** 2026-09-08 · **Status:** Proposed — awaiting the operator

The repository now builds one consolidated testbed database. This note is what the operator's own
vault would look like with it, written so the decision (and any deletion) stays theirs. Nothing in
this packet wrote to, renamed, or deleted anything inside the vault.

---

## 1. WHAT THE FOLDER WOULD HOLD

```
Database Testbed/
├── Testbed.md                  ← the operator's own, kept as it stands (never written by the generator)
├── Records/                    ← the operator's own, kept
├── Attachments/
│   ├── audit-checklist.md      ← referenced by the new records; kept
│   └── release-notes.txt       ← referenced by the new records; kept
└── Testbed/                    ← NEW: the one consolidated database
    ├── Testbed.md              ← the database note: db_view: true, 28 columns, six views
    └── Records/                ← 36 record notes, "01 — Full record, every facet filled.md" first,
                                ←   "36 — Sparse record, title only.md" (deliberately empty) last
```

The database note declares, in the same on-disk shape the plugin already reads:

- **28 columns** — every plugin column type (text, number, date, datetime, currency, select,
  multi-select, status, checkbox, computed, relation, rollup, files) and every display variant
  (markdown text, the https/mailto/tel link schemes, rating, progress, ring);
- **six views** — the five the plugin ships and keeps (table, board, calendar, timeline, chart; the
  board, timeline and chart group by status; the calendar and timeline run on the starts/ends range)
  plus a second table, "Sorted and filtered", carrying a status-ascending sort and a
  status-notempty filter whose only exclusion is the deliberately sparse record;
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
- it writes only the new `Testbed/` folder — never `Testbed.md`, `README.md`, `Records/` or
  `Attachments/` at the root;
- it skips any file whose bytes already match, so a re-run reports zero changes instead of
  churning timestamps in a synced vault;
- it never deletes: anything else under the testbed root is reported as
  "not produced by this catalogue, left untouched".

## 3. WHAT THE OPERATOR MAY THEN RETIRE (their call, not this packet's)

The consolidation replaces the nine earlier per-use-case folders (and the finance-flavoured tenth)
the catalogue used to generate. After adopting the new folder, these are the ones the generator no
longer produces, and the operator may delete if they no longer want them:

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

One database, every column type and surviving view, one record deliberately carrying every property
and one deliberately carrying nothing: the same population the repository's harnesses mount. When
the operator looks at a defect report against their own testbed, the harness lanes that measure the
same renderer now measure the same records — the harness's picture and the vault's behaviour are
about one dataset, not two similar ones.
