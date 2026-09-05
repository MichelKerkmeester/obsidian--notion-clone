---
title: "Goal: Test Environments and Mock Data"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "049 goal"
  - "test environments goal"
  - "mock data catalogue goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/049-test-environments-and-mock-data"
    last_updated_at: "2026-09-05T09:55:00Z"
    last_updated_by: "phase-author"
    recent_action: "Built the catalogue, wrote the vault, captured every generated database in the shipped renderer"
    next_safe_action: "Load catalogue.json into the Anytype demo space over the captures leg's CDP session"
    blockers:
      - "The Anytype leg needs the CDP session the captures leg owns"
      - "The AppFlowy leg needs a window from the operator, since it exposes no DOM"
      - "Operator device confirmation is the only row this packet cannot close itself"
    key_files:
      - "tools/mock-data/catalogue.ts"
      - "tools/mock-data/use-cases.ts"
      - "tools/mock-data/emit-obsidian.ts"
      - "tools/mock-data/capture.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-049-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the Anytype loader map a rollup to a native relation aggregate, or leave it unset"
      - "Does AppFlowy's CSV import infer a select column, or does every option need declaring first"
    answered_questions:
      - "Which view types the generated databases declare: table, board, calendar, timeline, chart"
---
# Goal: Test Environments and Mock Data

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Obsidian, Anytype and AppFlowy each hold the same ten test databases, built from one
catalogue, so a difference between the three products is a finding about the products rather than a
difference in what they were holding.

**Why.** The comparison work has been running against three different data sets. This plugin had one
database, `Database Testbed/Testbed.md`, holding twenty-nine finance-flavoured project records; the
competitor captures were of whatever those apps ship as a demo. Every check that comparison could
support was a check about status and money, and every difference it found could always be explained
away as a difference in the data rather than in the product.

The operator's ask on 2026-09-05 was direct: *"first set similar test environment like Obsidian, add
a lot of mock data, various use cases not just finance data; do same for AppFlowy; and upgrade test
environment Obsidian."*

**How the sameness is enforced.** Not by discipline. One `catalogue.ts` decides the shape, ten
vocabularies in `use-cases.ts` decide only the wording, and three emitters translate. An emitter can
be wrong about a product; it cannot be wrong about which records exist.

### Decisions

**D1 — the column set is what the plugin can do, not the ask verbatim.** The operator's list named
percent, date range, url, email, phone, rating, progress and created/modified as column *types*. The
plugin declares thirteen `ColumnDef` types and none of those eight is one of them
(`src/data/column-types.ts:isColumnType`). Each is a real capability wearing another name: a percent
is a number with a `progress` display, a url an email and a phone are `text` with a
`textLinkScheme`, a date range is the start and end date pair the calendar and timeline read, and
created and modified are the `file.ctime` and `file.mtime` built-in fields. The catalogue exercises
all of them, mapped to their real shapes. The same instruction said to read `src/data/` for the exact
list, so the code is what was followed.

**D2 — five view types, not seven.** Table, board, calendar, timeline and chart. `list-renderer.ts`
is already gone from the tree, and gallery is being withdrawn by the sibling packet. Generating ten
gallery views would be minting fresh configuration for a surface whose migration is the work in
progress.

**D3 — the captures are scratch, not registered scenarios.** These PNGs photograph *data*, not a
surface. A registered scenario is re-verified against its declared sources on every future change,
which would make every renderer edit invalidate a picture of mock data.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

This packet is a standard child of `005-component-surface-system`, opened 2026-09-05.
`recommend-level.sh --loc 2442 --files 10 --db` returns **53/100, confidence 92%, Level 2**, with a
phase score of **20/50** against a threshold of 25 — below it, so a standard child rather than a
phased packet.

It is bound to the parent's §5.A row `049` and to the parent `goal.md` subgoal table. It consumes
nothing from `047` or `048` and blocks neither; the Anytype leg reuses the CDP session `047`'s
capture leg established, which is a reuse of an instrument, not a dependency on its outcome.

**Write authority.** This packet, the parent's §5.A row and `goal.md` DONE-table entry,
`tools/mock-data/`, and the operator's `Database Testbed/` vault folder. Nothing else, and never
`.obsidian/` or `data.json`.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] One catalogue produces every environment: ten use cases, 326 records, 28 columns each, built by
      `buildCatalogue()` and translated by three emitters that add no records of their own. **Today
      was 1** test database of **29** finance-flavoured records, and no generator at all.
- [x] Regenerating writes the same bytes. Two builds under the same seed are byte-identical in all
      three outputs; a build under a different seed differs. **Today was not reproducible at all** —
      the one database was hand-written and had no generator, so there was no second run to compare.
      Negative control **observed red**: returning `Math.random()` from the seeded stream reddened
      all three identity assertions, and disarming it turned them green.
- [x] Every plugin column type and every neutral type is exercised in every use case, asserted from
      the values the records carry rather than from the schema. **Today was 13 types in the single
      database that existed and undefined for any second one**, since there was no second one; now
      13 of 13 and 24 of 24 in all ten. Negative control **observed red**: suppressing the checkbox
      facet failed both coverage assertions naming the missing type.
- [x] The Obsidian environment holds all ten databases beside the existing Testbed. **Today was 1
      database across 31 files**; now 11 across 367, with 336 written, **0 of the 31** pre-existing
      files changed by `sha256` before and after, and a second run reporting `0 written, 336 already
      current`.
- [x] Each generated database opens in the shipped `TableRenderer` and `CellRenderer` at desktop
      width, with one capture per database read by the author. **Today was 0 databases measured this
      way** — nothing but the one hand-written database had ever been mounted — and the first pass
      **reported red** at exactly double the record count for all ten before the row selector was
      corrected to the attribute `renderRow` sets; now 10 of 10 match.
- [ ] The Anytype demo space holds the same ten use cases at the same record counts, loaded from
      `catalogue.json`.
- [ ] The AppFlowy demo workspace holds the same ten, imported from the per-use-case CSVs.
- [ ] The operator opens the upgraded vault on a device and reads the ten databases as usable test
      environments rather than as a wall of noise.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Opened and the Obsidian leg landed, 2026-09-05

The catalogue, the three emitters, the unit suite and the capture runner were written and run in one
pass. Five of the eight criteria above closed on evidence recorded in `checklist.md`; the two
competitor legs and the operator's own read stay open.

**Two negative controls were armed and observed red before they counted.** Making the seeded stream
return `Math.random()` reddened all three determinism checks; suppressing the checkbox facet reddened
both coverage checks naming the missing type. Disarmed, all twenty tests pass.

**Two honest gaps in the capture evidence, recorded rather than papered over.** The computed and
rollup columns photograph empty. Both are evaluated by the data pipeline against a live vault, not by
the renderer, and the capture constructs a renderer with no `App` — the same limit the render
assertion harness documents for itself. They are configured correctly in the vault files, and only
the operator's own device read can confirm they resolve there.

**One measurement corrected mid-run.** The first capture pass reported exactly double the record
count for all ten databases and would have been accepted by anyone who did not look: `TableRenderer`
emits a `db-row-insert-line` between every pair of records, so `tbody tr` counts twice. The count now
reads the `data-note-database-row-path` attribute `renderRow` sets.
<!-- /ANCHOR:log -->
