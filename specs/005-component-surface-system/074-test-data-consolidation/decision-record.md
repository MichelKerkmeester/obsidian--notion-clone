---
title: "Decision Record: Test Data Consolidation"
description: "The decisions this packet took while collapsing the scattered fixture databases into one, with the reasoning each one still has to justify."
trigger_phrases:
  - "test data consolidation decisions"
  - "testbed database decision record"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/074-test-data-consolidation"
    last_updated_at: "2026-09-08T14:45:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Recorded the six consolidation ADRs, from survivors to capture disposition"
    next_safe_action: "Await the fresh verifier; re-read the kept-rows rationale if the scope moves"
    blockers: []
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "074-implementation-leg"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Test Data Consolidation

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 074-test-data-consolidation
**Level:** 2
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:decisions -->
## 2. DECISIONS

### ADR-0001 — Surviving view types: table, board, calendar, timeline, chart; list and gallery excluded

- **Status:** Accepted, 2026-09-08
- **Context:** The consolidated testbed database needs one representative view per view type the harnesses still exercise. The plugin's `DatabaseViewType` still declares seven, but the generator's own view builder already names the survivors: list and gallery renderers have been removed from the tree (the list and gallery migrations in `src/data/` rewrite saved views, and no list or gallery renderer remains in `src/views/`), so a fixture view of either would be configuration for a surface nothing paints.
- **Decision:** The testbed declares table, board, calendar, timeline and chart — the five types the catalogue's builder already produced — plus a second table that carries the deliberate sort and filter (ADR-0004). No list or gallery view.
- **Consequences:** A future view-type resurrection adds its representative here, guarded by the consolidation suite's survivor assertion, which fails the moment the generator declares a sixth type without the suite learning it.

### ADR-0002 — One vocabulary, not ten: the catalogue builds a single Testbed database

- **Status:** Accepted, 2026-09-08
- **Context:** Ten domain-flavoured vocabularies shared one column shape, which made record counts comparable but gave every harness ten different populations to mount, and the operator asked for less test data, not a wider spread of the same amount. The single vocabulary must not lose the value shapes that actually break renderers: a title long enough to truncate, a person's name with a diacritic, a rating beside percentages, a multi-select that holds one value on one row and six on another.
- **Decision:** `use-cases.ts` carries exactly one vocabulary (`testbed`, 36 records — inside the 20–40 bound the catalogue already asserts), transplanted from the earlier project-tracker flavour with neutral default labels (a fixture that calls itself a tracker reads as documentation of a product nobody shipped), the deliberately full record first, the deliberately sparse record last. The catalogue machinery — facets, schema builder, seeded randomness, the date anchor — is untouched: it is what already guaranteed the coverage the inventory credited to ten databases.
- **Consequences:** Record counts across uses collapse from roughly 326 to 36. Any lane that assumed a domain-flavoured label reads the neutral default instead. The per-use-case folders, CSVs and Anytype collections the earlier ten produced are gone from the generated outputs; the report JSONs and screenshots under `tools/mock-data/anytype/` and `screenshots/anytype/` still describe the last physical ten-set load and refresh at the next `load.mjs --reset`, which now loads the single Testbed set.

### ADR-0003 — The constructed, bench and sheet-smoke fixtures stay; they were never the scattered datasets

- **Status:** Accepted, 2026-09-08
- **Context:** Beyond the catalogue, the harnesses hold three further inline data bodies: the constructed-capture lane's deliberately small mixed-type dataset, the bench/reference volume the performance and parity lanes measure (1600–2000 generated rows), and the sheet smoke lanes' own two- to three-record vaults built into their temporary fixtures. None of the three references a catalogue use case — verified by reading every mount — so none was repointed, and deleting them would change what those lanes measure, which the packet's own risk register warns against.
- **Decision:** Keep all three as they are. They are their lanes' measured subjects, not duplicates of the fixture dataset; the consolidation removes the ten databases and the cross-references, not each lane's own instrumented data.
- **Consequences:** The inventory in `tasks.md` lists them with their fates so the next data reduction reads why they survived. SC-001's reduction is real: fixture databases 10 + 1 finance before, 1 + 1 after, with their 326 records down to 36.

### ADR-0004 — Filters and sorts are covered by a second, deliberately narrowed table view

- **Status:** Accepted, 2026-09-08
- **Context:** The catalogue's five views covered view types, grouping (board, timeline and chart group by status) and the formula, relation and rollup columns — but no view carried a non-default sort or a non-empty filter, so the note the plugin reads never declared one. The generator's record builder already guarantees a deliberately empty last record; it now also guarantees a deliberately full first one, so the narrowed view's filter has a real row to exclude: its `notempty`-on-status filter drops exactly the sparse record that the everything-shown table keeps.
- **Decision:** `CatalogueView` grows optional sort and filter fields (the plugin's own `SortRule`/`FilterRule` shapes), the sixth view is "Sorted and filtered" (status ascending, status notempty), and the note emitter writes them through to the view's `sortColumn`/`sortDirection`/`sortRules`/`filters` — both representations of the ordering written, so the two cannot disagree.
- **Consequences:** The consolidated note exercises every filter/sort field the plugin reads on import. A future rule type the plugin gains joins this view, guarded by the consolidation suite's coverage assertion.

### ADR-0005 — The second dataset is the cold-cache Finance fixture, exactly where 070 left it

- **Status:** Accepted, 2026-09-08
- **Context:** The operator's Finance databases sit alongside the testbed — "alongside", not "inside": they are the operator's own real-world data, restored to visibility by the 070 fix (the diagnosis found the frontmatter intact on disk; "restored" means visible again, not recovered). The 070 packet added an operator-shaped, in-fixture mirror of that Finance shape for the cold-cache lane.
- **Decision:** The fixture lives where 070 put it (`tools/live/database-cold-cache-property-read.mjs`: a Finance-shaped reports table plus the Testbed-shaped board, six plus four records) and stays there, asserted by the consolidation suite as the second, kept dataset. Nothing folded it into the testbed, and nothing on the operator's own vault changed — the packet only proposes that shape in its proposal note.
- **Consequences:** The packet's "second dataset" requirement holds without any duplication: the cold-cache fixture is the Finance presence in the harnesses, the proposal note is the Finance presence in the operator's vault decision, and the consolidation suite fails if either disappears.

### ADR-0006 — Capture disposition: no committed capture moved; three jitter flips were restored by the second run

- **Status:** Accepted, 2026-09-08
- **Context:** The consolidated dataset feeds no committed PNG — the capture corpus photographs scenario markup, constructed states and the reference benches, none of which mount the catalogue — so a full sweep was run twice and the deltas measured per the pixel-delta discipline: the first run reported three PNGs differing from the committed bytes (`board-mobile-desktop-dark`, `board-view-desktop-dark`, `reference-gantt-subtask-mobile-dark`), every one a one-channel-unit, single-digit-pixel antialiasing flip on lanes whose inputs this packet never touched; the second run returned all three to their committed bytes.
- **Decision:** "Moved in one run only" applies: the three are jitter, the worktree already matches the committed bytes for them, and the only committed capture artefact that changes is the manifest's recorded source fingerprints for the 286 constructed entries whose inputs the edited bundle feeds — no PNG, no stylesheet, no lane takeover.
- **Consequences:** The freshness gate (`screenshots:verify`) passes against the very same run, and the next lane that recaptures finds 616 entries describing exactly what they photograph.

---

<!-- /ANCHOR:decisions -->

<!-- ANCHOR:references -->
## 3. REFERENCES

- The packet's inventory and red→green evidence: `tasks.md`
- The consolidated coverage assertions: `tools/mock-data/consolidation.test.mjs`
- The operator's copy of the proposed vault shape: `testbed-proposal.md`
<!-- /ANCHOR:references -->
